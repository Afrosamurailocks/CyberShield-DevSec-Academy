/**
 * Endpoints VULNERAVEIS dos laboratorios OWASP A01..A10.
 *
 * Contrato de API (api-designer):
 *  - JSON em camelCase, consistente.
 *  - Erros em RFC 7807 (application/problem+json).
 *  - Status HTTP semanticos.
 *  - O "segredo" de cada lab e entregue como DADO SENSIVEL NATURAL (ex.: confidentialNote,
 *    privilegedApiKey, secretAccessKey) — nunca como um campo "flag" artificial.
 *
 * Seguranca do host: sem child_process, SSRF com resolver mock, prototype pollution revertida.
 */
import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db, md5 } from '../db.js';
import { findLab } from './metadata.js';

const secretOf = (id: string) => findLab(id)!.flag; // valor sensivel (CYBER{...})

// ───────── RFC 7807 Problem Details ─────────
function problem(res: Response, status: number, title: string, detail: string) {
  res.status(status).type('application/problem+json').json({
    type: `https://cybershield.local/errors/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title, status, detail,
  });
}

// ───────── helpers JWT (manuais, para demonstrar alg=none no A07) ─────────
const JWT_SECRET = 'cybershield-weak-demo-secret';
const b64url = (buf: Buffer | string) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlJson = (o: unknown) => b64url(JSON.stringify(o));
const b64urlDecode = (s: string) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
const signJwt = (payload: object) => {
  const header = b64urlJson({ alg: 'HS256', typ: 'JWT' });
  const body = b64urlJson(payload);
  const sig = b64url(crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest());
  return `${header}.${body}.${sig}`;
};
const bearer = (req: Request) => (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '').trim();

export function mountLabs(api: Router): void {
  // ═══════════════ A01 — Broken Access Control (IDOR) ═══════════════
  const a01 = Router();
  const a01Sessions = new Map<string, number>(); // accessToken -> userId
  a01.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    const user: any = await db.prepare('SELECT * FROM users WHERE username = ?').get(String(username ?? ''));
    if (!user || user.password_md5 !== md5(String(password ?? '')))
      return problem(res, 401, 'Invalid Credentials', 'Usuário ou senha inválidos.');
    const token = 'sess_' + crypto.randomBytes(12).toString('hex');
    a01Sessions.set(token, user.id);
    res.json({ accessToken: token, tokenType: 'Bearer', user: { id: user.id, username: user.username, role: user.role } });
  });
  // Monta o PERFIL do funcionario que o id (no caminho) apontar. O servico SEMPRE
  // devolve o registro pedido — a falha e NAO checar se o id pertence a quem esta logado.
  const buildProfile = async (empId: number): Promise<Record<string, unknown> | null> => {
    const u: any = await db.prepare('SELECT id, username, full_name, role, salary, cpf FROM users WHERE id = ?').get(empId);
    if (!u) return null;
    const inv: any = await db.prepare('SELECT amount, secret_note FROM invoices WHERE owner_id = ?').get(empId);
    return {
      userId: u.id, username: u.username, name: u.full_name, role: u.role,
      cpf: u.cpf, salary: u.salary, payslipAmount: inv?.amount ?? null,
      // nota confidencial do funcionario. A da colega joana.rh (id 4, a VITIMA
      // deste lab — mesmo nivel de privilegio que voce) contem o dado sensivel.
      confidentialNote: u.id === 4 ? secretOf('a01-idor-invoices') : (inv?.secret_note ?? null),
    };
  };

  // READ IDOR — id no CAMINHO da URL (CWE-639). Troque o id do perfil pelo de outro.
  a01.get('/users/:id/profile', async (req: Request, res: Response) => {
    const uid = a01Sessions.get(bearer(req));
    if (!uid) return problem(res, 401, 'Unauthorized', 'Sessão ausente. Autentique-se em POST /api/a01/login.');
    const target = Number(req.params.id);
    if (!Number.isInteger(target)) return problem(res, 400, 'Bad Request', 'id de perfil inválido.');
    // FALHA (IDOR/BOLA): confere apenas que HA sessao — NAO que target === uid.
    const profile = await buildProfile(target);
    if (!profile) return problem(res, 404, 'Not Found', `Perfil ${target} não encontrado.`);
    res.json(profile);
  });

  // WRITE IDOR — alterar o perfil de QUALQUER funcionario (impacto maior que a leitura).
  a01.put('/users/:id/profile', async (req: Request, res: Response) => {
    const uid = a01Sessions.get(bearer(req));
    if (!uid) return problem(res, 401, 'Unauthorized', 'Sessão ausente. Autentique-se em POST /api/a01/login.');
    const target = Number(req.params.id);
    if (!(await buildProfile(target))) return problem(res, 404, 'Not Found', `Perfil ${target} não encontrado.`);
    const note = String((req.body ?? {}).note ?? '');
    // FALHA (IDOR/BOLA): NAO verifica se target === uid antes de ESCREVER no perfil.
    await db.prepare('UPDATE invoices SET secret_note = ? WHERE owner_id = ?').run(note, target);
    // devolve o perfil alterado da vitima — prova do acesso/escrita indevidos.
    res.json({ updated: true, userId: target, newNote: note, profile: await buildProfile(target) });
  });

  // ═══════════════ A02 — Cryptographic Failures (token reversivel) ═══════════════
  const a02 = Router();
  a02.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    const u: any = await db.prepare('SELECT * FROM users WHERE username = ?').get(String(username ?? ''));
    if (!u || u.password_md5 !== md5(String(password ?? '')))
      return problem(res, 401, 'Invalid Credentials', 'Usuário ou senha inválidos.');
    // FALHA A02: token "protegido" so com Base64 (encoding != criptografia; sem assinatura).
    res.json({ sessionToken: b64url(JSON.stringify({ sub: u.username, role: u.role })), tokenType: 'Bearer' });
  });
  a02.get('/account', (req: Request, res: Response) => {
    let claims: any;
    try { claims = JSON.parse(b64urlDecode(bearer(req))); } catch { claims = null; }
    if (!claims || typeof claims !== 'object')
      return problem(res, 401, 'Unauthorized', 'Sessão ausente ou inválida. Autentique-se em POST /api/a02/login.');
    const account: any = { username: claims.sub, role: claims.role };
    // dado sensivel so da conta admin — exposto ao forjar role=admin no token sem integridade:
    if (claims.role === 'admin') account.privilegedApiKey = secretOf('a02-reversible-token');
    res.json(account);
  });

  // ═══════════════ A03 — Injection (SQLi) ═══════════════
  const a03 = Router();
  a03.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    // FALHA: concatenacao direta. 5 colunas -> suporta bypass booleano E UNION dump.
    const sql =
      "SELECT id, username, password_md5, role, api_key FROM users WHERE username = '" + username +
      "' AND password_md5 = '" + md5(String(password ?? '')) + "'";
    let rows: any[];
    try { rows = await db.prepare(sql).all(); }
    catch (e: any) { return problem(res, 500, 'SQL Error', `${e.message} — query: ${sql}`); }
    if (!rows.length) return problem(res, 401, 'Invalid Credentials', 'Nenhum registro casou com a consulta.');
    const admin = rows.find((r) => r.role === 'admin');
    res.json({
      authenticated: Boolean(admin),
      rowCount: rows.length,
      // a SQLi exfiltra a tabela: o apiKey do admin e uma credencial de producao sensivel.
      users: rows.map((r) => ({
        id: r.id, username: r.username, passwordHash: r.password_md5, role: r.role,
        apiKey: r.role === 'admin' ? secretOf('a03-sqli-login') : (r.api_key ?? null),
      })),
    });
  });

  // ═══════════════ A04 — Insecure Design (token de reset previsivel) ═══════════════
  const a04 = Router();
  // Log de auditoria do gateway de e-mail: confirma o ENVIO (destinatario/assunto/hora)
  // mas MASCARA o link/token no conteudo — por politica de DLP, nem o log interno
  // guarda o segredo em claro. Serve para o aluno "ver o e-mail existe" sem conseguir
  // lê-lo: ele precisa continuar prevendo o token por /server-time.
  const a04Mailbox = new Map<string, { sentAt: string }>();
  a04.get('/server-time', (_req, res) => res.json({ epochSeconds: Math.floor(Date.now() / 1000) }));
  a04.post('/forgot', async (req: Request, res: Response) => {
    const { username } = req.body ?? {};
    const u: any = await db.prepare('SELECT id FROM users WHERE username = ?').get(String(username ?? ''));
    // nao revela se o usuario existe na resposta; mas registra o envio para o mailbox simulado.
    if (u) a04Mailbox.set(String(username), { sentAt: new Date().toISOString() });
    res.status(202).json({ message: 'Se o usuário existir, enviaremos um link de redefinição por e-mail.' });
  });
  a04.get('/mailbox/:username', (req: Request, res: Response) => {
    const sent = a04Mailbox.get(req.params.username);
    if (!sent) return problem(res, 404, 'No Email', 'Nenhuma solicitação de redefinição foi enviada para este usuário ainda. Chame POST /api/a04/forgot primeiro.');
    // FALHA DE DESIGN exposta aqui, de propósito: o e-mail FOI enviado (isso é real),
    // mas o conteúdo com o token é mascarado — nem o log interno de auditoria guarda
    // o segredo em claro. Ou seja: "ter acesso ao e-mail" nunca foi o caminho.
    res.json({
      to: `${req.params.username}@nexusvarejo.com.br`,
      subject: 'Redefinição de senha — Nexus Varejo',
      sentAt: sent.sentAt,
      preview: 'Recebemos uma solicitação de redefinição de senha para sua conta. Use o link abaixo para continuar. Ele expira em 2 minutos.',
      resetLink: 'https://portal.nexusvarejo.com.br/reset?token=••••••••••••',
      note: 'Conteúdo mascarado pela política de DLP do gateway de e-mail — o token não fica visível nem neste log de auditoria.',
    });
  });
  a04.post('/reset', async (req: Request, res: Response) => {
    const { username, token, newPassword } = req.body ?? {};
    const now = Math.floor(Date.now() / 1000);
    const t = Number(token);
    // FALHA DE DESIGN: token == segundo epoch atual (previsivel via /server-time).
    if (!Number.isFinite(t) || t < now - 120 || t > now + 5)
      return problem(res, 400, 'Invalid Token', 'Token de redefinição inválido ou expirado.');
    await db.prepare('UPDATE users SET password_md5 = ? WHERE username = ?').run(md5(String(newPassword ?? '')), String(username ?? ''));
    const body: any = { message: 'Senha redefinida com sucesso.', username };
    // account takeover do admin -> acesso ao cofre de recuperacao da conta:
    if (username === 'admin') body.recoveredAccount = { username: 'admin', recoveryNote: secretOf('a04-insecure-reset') };
    res.json(body);
  });

  // ═══════════════ A05 — Security Misconfiguration ═══════════════
  const a05 = Router();
  a05.get('/', (_req, res) =>
    // MISCONFIG: o indice do servico (200) lista rotas internas em producao,
    // inclusive um endpoint de diagnostico que nunca deveria estar exposto.
    res.json({
      service: 'nexus-config-service',
      environment: 'production',
      status: 'ok',
      endpoints: [
        'GET /api/a05/health',
        'GET /api/a05/debug/env   (diagnostico interno — NAO deveria estar exposto em producao)',
      ],
    }));
  a05.get('/debug/env', (_req, res) => {
    // FALHA: expoe variaveis de ambiente (segredos) sem auth. KILL CHAIN: JWT_SECRET -> A07; host -> A10.
    res.json({
      nodeEnv: 'production',
      dbHost: 'prod-cluster-01.internal',
      appSecret: secretOf('a05-misconfig-debug'),
      jwtSecret: JWT_SECRET,
      awsMetadataHost: '169.254.169.254',
      featureDebug: true,
    });
  });

  // ═══════════════ A06 — Vulnerable & Outdated Components (prototype pollution) ═══════════════
  const a06 = Router();
  a06.get('/version', (_req, res) =>
    res.json({ dependency: 'lodash', version: '4.17.4', advisory: 'CVE-2019-10744 — prototype pollution em merge/mergeWith/defaultsDeep (corrigido em 4.17.12)' }));
  const vulnerableMerge = (target: any, src: any): any => {
    for (const k in src) {
      if (src[k] && typeof src[k] === 'object') vulnerableMerge((target[k] ??= {}), src[k]);
      else target[k] = src[k]; // nao bloqueia __proto__/constructor -> poluicao
    }
    return target;
  };
  a06.post('/merge-config', (req: Request, res: Response) => {
    const config: any = { theme: 'dark', isAdmin: false };
    try {
      vulnerableMerge(config, req.body ?? {});
      const polluted = ({} as any).isAdmin === true || config.isAdmin === true;
      const body: any = { applied: true, effectiveConfig: { theme: config.theme, isAdmin: polluted } };
      // pollution elevou isAdmin -> a resposta passa a incluir a config administrativa:
      if (polluted) body.adminFeatures = { masterKey: secretOf('a06-vuln-components') };
      res.json(body);
    } finally {
      delete (Object.prototype as any).isAdmin; // reverte a poluicao global (seguranca do host)
    }
  });

  // ═══════════════ A07 — Auth Failures (JWT alg=none / segredo vazado) ═══════════════
  const a07 = Router();
  a07.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    const u: any = await db.prepare('SELECT * FROM users WHERE username = ?').get(String(username ?? ''));
    if (!u || u.password_md5 !== md5(String(password ?? '')))
      return problem(res, 401, 'Invalid Credentials', 'Usuário ou senha inválidos.');
    res.json({ accessToken: signJwt({ sub: u.username, role: u.role }), tokenType: 'Bearer' });
  });
  a07.get('/admin', (req: Request, res: Response) => {
    const [h, p, sig] = bearer(req).split('.');
    if (!h || !p) return problem(res, 401, 'Unauthorized', 'Token JWT ausente.');
    let header: any, payload: any;
    try { header = JSON.parse(b64urlDecode(h)); payload = JSON.parse(b64urlDecode(p)); }
    catch { return problem(res, 400, 'Malformed Token', 'JWT malformado.'); }
    // FALHA 1: aceita alg=none em qualquer caixa. FALHA 2: segredo fraco/fixo (vaza no A05).
    if (String(header.alg).toLowerCase() !== 'none') {
      const expected = b64url(crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest());
      if (sig !== expected) return problem(res, 401, 'Invalid Signature', 'Assinatura do JWT inválida.');
    }
    if (payload.role !== 'admin') return problem(res, 403, 'Forbidden', 'Requer role "admin".');
    res.json({ panel: 'admin', user: payload.sub, secrets: { deployKey: secretOf('a07-jwt-none') } });
  });

  // ═══════════════ A08 — Software & Data Integrity (desserializacao insegura) ═══════════════
  const a08 = Router();
  a08.get('/profile', (_req, res) => res.json({
    deserializer: 'node-serialize@0.0.4 (vulnerável — CVE-2017-5941)',
    howTo: 'POST /api/a08/import-profile com body {"data":"<objeto serializado>"} e header X-Cloud-Key',
    benignExample: '{"name":"ana","role":"user"}',
  }));
  const isNodeSerializeRce = (s: string) => /_\$\$ND_FUNC\$\$_[\s\S]*\}\s*\(\s*\)/.test(s);
  a08.post('/import-profile', (req: Request, res: Response) => {
    // KILL CHAIN (mecanico): o deploy interno exige a credencial AWS roubada via SSRF no A10.
    if (String(req.headers['x-cloud-key'] ?? '') !== secretOf('a10-ssrf'))
      return problem(res, 401, 'Cloud Credential Required',
        'Deploy interno bloqueado: envie a SecretAccessKey (roubada via SSRF no lab A10) no header X-Cloud-Key.');
    const data = String((req.body ?? {}).data ?? '');
    // CODIGO REAL seria require('node-serialize').unserialize(data) -> RCE no IIFE _$$ND_FUNC$$_.
    if (isNodeSerializeRce(data))
      return res.json({ status: 'profile-imported', deserializationExecuted: true, commandOutput: secretOf('a08-insecure-deser') });
    let obj: any;
    try { obj = JSON.parse(data); } catch { return problem(res, 400, 'Invalid Payload', 'Objeto serializado inválido.'); }
    res.json({ status: 'profile-imported', deserializationExecuted: false, profile: obj });
  });

  // ═══════════════ A09 — Logging & Monitoring Failures (log injection -> sequestro do dashboard do SOC) ═══════════════
  // Falha ENCADEADA, de propósito (A09 não é só "um \n"): (1) CRLF injection forja uma
  // linha inteira de auditoria; (2) o PAINEL do SOC (dashboard) renderiza esse mesmo log
  // cru como HTML, sem escapar nada — a mesma causa-raiz (confiar em entrada não
  // confiável) quebra duas camadas: a trilha de auditoria E a ferramenta que o analista
  // usa para lê-la. So as DUAS tecnicas combinadas (forjar o evento + injetar <script>)
  // entregam a flag — forjar sozinho so da um eco narrativo, sem o segredo.
  const a09 = Router();
  let auditLog = '--- AUDIT TRAIL ---\n';
  a09.post('/login', (req: Request, res: Response) => {
    const username = String((req.body ?? {}).username ?? '');
    auditLog += 'AUTH user=' + username + '\n'; // FALHA 1: entrada crua (CRLF/log injection)
    const forged = auditLog.split('\n').some((l) => /^AUDIT event=admin_login_success/.test(l.trim()));
    const body: any = { status: 'logged' };
    if (forged) {
      // o SIEM ingenuo aceita a linha forjada, mas o clearance de verdade so sai
      // quando um analista ABRE o dashboard (GET /api/a09/dashboard) — forjar o
      // evento sozinho não é o fim da exploração, é só o primeiro passo.
      body.incidentOverride = { status: 'closed', note: 'Evento de auditoria aceito pelo SIEM. O clearance de verdade só sai quando um analista abrir o painel — veja GET /api/a09/dashboard.' };
    }
    res.json(body);
  });
  a09.get('/logs', (_req, res) => res.type('text/plain').send(auditLog));
  a09.get('/dashboard', (_req, res) => {
    const rows = auditLog.split('\n').filter(Boolean);
    const forged = rows.some((r) => /^AUDIT event=admin_login_success/.test(r.trim()));
    // FALHA 2: renderiza o log cru como HTML sem NENHUM escaping (nem &,<,> nem aspas).
    const html = '<div class="soc-dashboard">\n' + rows.map((r) => `  <div class="log-row">${r}</div>`).join('\n') + '\n</div>';
    const scripted = /<script\b[^>]*>[\s\S]*?<\/script>/i.test(html);
    const hijacked = forged && scripted; // exige as DUAS tecnicas combinadas, nao uma isolada.
    res.json({
      renderedHtml: html,
      note: hijacked
        ? 'O <script> injetado no log executou na sessão do analista que abriu este painel.'
        : 'Painel do SOC renderizado a partir do log cru, sem sanitização HTML — ainda sem a combinação completa (evento forjado + <script>).',
      ...(hijacked ? { analystSession: { hijacked: true, clearanceToken: secretOf('a09-log-injection') } } : {}),
    });
  });

  // ═══════════════ A10 — SSRF (resolver mock da rede interna) ═══════════════
  const a10 = Router();
  const awsCreds = JSON.stringify({
    Code: 'Success', Type: 'AWS-HMAC', LastUpdated: '2026-01-10T12:00:00Z',
    AccessKeyId: 'ASIAEXAMPLEKEYID', SecretAccessKey: secretOf('a10-ssrf'),
    Token: 'IQoJb3JpZ2luX2VjEX...', Expiration: '2026-01-10T18:00:00Z',
  });
  const internal: Record<string, string> = {
    'status.cybershield.local/health': JSON.stringify({ status: 'ok', uptime: '42d' }),
    '169.254.169.254/latest/meta-data/': 'ami-id\nhostname\niam/\ninstance-id\nsecurity-groups',
    '169.254.169.254/latest/meta-data/iam/security-credentials/': 'ec2-app-role',
    '169.254.169.254/latest/meta-data/iam/security-credentials/ec2-app-role': awsCreds,
  };
  const internalAdmin = JSON.stringify({ service: 'cybershield-internal-admin', hint: 'o painel interno confia em requisições da própria máquina' });
  for (const lb of ['127.0.0.1', 'localhost', '[::1]', '0.0.0.0']) {
    internal[`${lb}/`] = internalAdmin;
    internal[`${lb}:8080/`] = internalAdmin;
    internal[`${lb}:9200/_cat/indices`] = 'health status index docs.count\ngreen open users 4';
  }
  a10.get('/fetch-url', (req: Request, res: Response) => {
    const raw = String(req.query.url ?? '');
    let host = '', path = '';
    try { const u = new URL(raw); host = u.host; path = u.pathname; }
    catch { return problem(res, 400, 'Invalid URL', 'Parâmetro url ausente ou inválido.'); }
    // FALHA: nenhuma allowlist / bloqueio de IP interno/loopback/link-local (SSRF).
    const resolved = internal[host + path];
    if (resolved === undefined) return problem(res, 502, 'Bad Gateway', `O destino ${host}${path} não respondeu (resolver interno).`);
    res.type(resolved.startsWith('{') ? 'application/json' : 'text/plain').send(resolved);
  });

  for (const [p, r] of [['a01', a01], ['a02', a02], ['a03', a03], ['a04', a04], ['a05', a05], ['a06', a06], ['a07', a07], ['a08', a08], ['a09', a09], ['a10', a10]] as const)
    api.use('/' + p, r);
}
