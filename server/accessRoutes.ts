/**
 * Rotas de autenticação, gestão de usuários, relatórios e auditoria (sessão por cookie HttpOnly).
 * RASCUNHO para revisão humana (Segurança da Informação). Ver server/auth.ts, server/audit.ts e server/report.ts.
 *
 * Autorização por perfil (negada por padrão):
 *  - Aluno: o próprio progresso e o próprio relatório.
 *  - Gestor: relatório da equipe (usuários com `managerId` = gestor).
 *  - Auditor: leitura de tudo (usuários, relatórios, trilha de auditoria) e exportação; NÃO altera nada.
 *  - Administrador: gestão de usuários + leitura/exportação. Não pode desativar a si mesmo nem remover o último admin.
 * Anti-CSRF: cookie SameSite=Strict + cabeçalho obrigatório `x-requested-with: cybershield` em requisições que alteram estado.
 */
import express from 'express';
import { LEARNER_RE, type Ledger } from './champion.js';
import { toPublicUser, ROLES, ROLE_LABEL, passwordProblem, type Auth, type UserRec, type Role } from './auth.js';
import type { Audit, AuditAction, AuditActor } from './audit.js';
import { csvCell, type Reports } from './report.js';
import { reportToXlsx } from './reportXlsx.js';

export const COOKIE = 'cs_session';
export const CSRF_HEADER = 'x-requested-with';
export const CSRF_VALUE = 'cybershield';
export type AuthMode = 'required' | 'optional';
export interface AuthedReq extends express.Request { user?: UserRec; sessionToken?: string }

export interface AccessDeps {
  auth: Auth; audit: Audit; ledger: Ledger; reports: Reports; mode: AuthMode; secureCookie: boolean;
  /** Tentativas de credencial por IP a cada 15 min (padrão 30). */
  credLimit?: number;
}

const parseCookie = (h: string | undefined, name: string): string | undefined => {
  if (!h) return undefined;
  for (const part of h.split(';')) {
    const i = part.indexOf('='); if (i < 0) continue;
    if (part.slice(0, i).trim() === name) { try { return decodeURIComponent(part.slice(i + 1).trim()); } catch { return undefined; } }
  }
  return undefined;
};

export function actorOf(u: UserRec | undefined | null): AuditActor | null {
  return u ? { id: u.id, email: u.email, role: u.role } : null;
}

export function createAccess(deps: AccessDeps) {
  const { auth, audit, ledger, reports } = deps;

  /** Resolve a sessão a partir do cookie e anexa `req.user`. */
  const attach: express.RequestHandler = (req: AuthedReq, _res, next) => {
    const token = parseCookie(req.headers.cookie, COOKIE);
    if (token) {
      const s = auth.session(token);
      if (s.user) { req.user = s.user; req.sessionToken = token; }
      else if (s.expired) audit.log({ action: 'auth.session.expired', outcome: 'ok', ip: req.ip });
    }
    next();
  };

  const setCookie = (res: express.Response, token: string) => {
    res.append('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${8 * 3600}${deps.secureCookie ? '; Secure' : ''}`);
  };
  const clearCookie = (res: express.Response) => {
    res.append('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${deps.secureCookie ? '; Secure' : ''}`);
  };

  const noStore: express.RequestHandler = (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff'); next();
  };
  const csrf: express.RequestHandler = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.header(CSRF_HEADER) !== CSRF_VALUE) return res.status(403).json({ error: 'requisição não autorizada (cabeçalho anti-CSRF ausente)' });
    next();
  };

  /** Anti-CSRF só quando há sessão por cookie (anônimo não tem credencial ambiente a proteger). */
  const csrfSession: express.RequestHandler = (req: AuthedReq, res, next) => (req.user ? csrf(req, res, next) : next());

  /** Exige sessão (e, se informado, um dos perfis). Perfil insuficiente é auditado. */
  const need = (...roles: Role[]): express.RequestHandler => (req: AuthedReq, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'autenticação necessária' });
    if (req.user.mustChange && !req.path.startsWith('/auth/')) return res.status(403).json({ error: 'troque a senha provisória antes de continuar', mustChange: true });
    if (roles.length && !roles.includes(req.user.role)) {
      audit.log({ action: 'access.denied', outcome: 'denied', actor: actorOf(req.user), target: `${req.method} ${req.originalUrl.split('?')[0]}`, ip: req.ip });
      return res.status(403).json({ error: 'perfil sem permissão para esta operação' });
    }
    next();
  };

  // limite por IP nas rotas de credencial (a conta também tem bloqueio próprio)
  const hits = new Map<string, { n: number; reset: number }>();
  const credLimiter: express.RequestHandler = (req, res, next) => {
    const t = Date.now(); const k = req.ip ?? 'local'; const c = hits.get(k);
    if (!c || c.reset < t) hits.set(k, { n: 1, reset: t + 15 * 60_000 });
    else if (++c.n > (deps.credLimit ?? 30)) return res.status(429).json({ error: 'muitas tentativas; aguarde alguns minutos' });
    next();
  };

  const router = express.Router();
  router.use(noStore);
  const log = (req: AuthedReq, action: AuditAction, outcome: 'ok' | 'fail' | 'denied', target?: string, detail?: Record<string, string | number | boolean | null>) =>
    audit.log({ action, outcome, actor: actorOf(req.user), target, ip: req.ip, detail });

  const me = (u: UserRec) => ({ ...toPublicUser(u), roleLabel: ROLE_LABEL[u.role] });

  // ───────── Autenticação ─────────
  router.get('/auth/me', (req: AuthedReq, res) => {
    res.json({ mode: deps.mode, user: req.user ? me(req.user) : null, roles: ROLES.map((r) => ({ id: r, label: ROLE_LABEL[r] })) });
  });

  router.post('/auth/login', csrf, credLimiter, async (req: AuthedReq, res) => {
    const { email, password } = req.body ?? {};
    const r = await auth.authenticate(email, password);
    const generic = { error: 'E-mail ou senha inválidos, ou conta temporariamente bloqueada.' };
    if (!r.ok) {
      const em = typeof email === 'string' ? email.trim().toLowerCase().slice(0, 120) : '';
      audit.log({ action: 'auth.login.failure', outcome: 'fail', actor: r.user ? actorOf(r.user) : null, target: em, ip: req.ip, detail: { reason: r.reason } });
      if (r.justLocked) audit.log({ action: 'auth.lockout', outcome: 'ok', actor: actorOf(r.user), ip: req.ip, detail: { minutes: 15 } });
      return res.status(401).json(generic);
    }
    // se já havia sessão, encerra (rotação)
    auth.logout(req.sessionToken);
    setCookie(res, r.token);
    audit.log({ action: 'auth.login.success', outcome: 'ok', actor: actorOf(r.user), ip: req.ip });
    res.json({ user: me(r.user) });
  });

  router.post('/auth/logout', csrf, (req: AuthedReq, res) => {
    if (req.user) log(req, 'auth.logout', 'ok');
    auth.logout(req.sessionToken); clearCookie(res); res.json({ ok: true });
  });

  router.post('/auth/change-password', csrf, credLimiter, async (req: AuthedReq, res) => {
    if (!req.user) return res.status(401).json({ error: 'autenticação necessária' });
    const r = await auth.changePassword(req.user.id, req.body?.current, req.body?.next);
    if (!r.ok) { log(req, 'auth.password.change', 'fail'); return res.status(400).json({ error: r.error }); }
    setCookie(res, auth.startSession(req.user.id)); // sessões anteriores foram encerradas; nova sessão rotacionada
    log(req, 'auth.password.change', 'ok');
    res.json({ user: me(auth.get(req.user.id)!) });
  });

  router.get('/auth/password-policy', (_req, res) => res.json({ minLength: 12, rules: ['mínimo de 12 caracteres', 'ao menos 3 tipos de caractere', 'sem partes do seu e-mail', 'sem senhas previsíveis'] }));
  router.post('/auth/password-check', csrf, (req, res) => res.json({ problem: passwordProblem(req.body?.password, String(req.body?.email ?? '')) }));

  /** Vincula o progresso anônimo deste navegador (UUID legado) à conta, uma única vez e só se a conta ainda não tem progresso. */
  router.post('/auth/link-progress', csrf, credLimiter, need(), (req: AuthedReq, res) => {
    const lid = req.body?.learnerId; const u = req.user!;
    if (typeof lid !== 'string' || !LEARNER_RE.test(lid)) return res.status(400).json({ error: 'identificador inválido' });
    if (lid === u.learnerId) return res.json({ linked: false, reason: 'já vinculado' });
    const owner = auth.byLearnerId(lid);
    if (owner && owner.id !== u.id) { log(req, 'progress.link', 'denied', u.id, { reason: 'pertence a outra conta' }); return res.status(409).json({ linked: false, error: 'este progresso já pertence a outra conta' }); }
    if (!ledger.has(lid)) return res.json({ linked: false, reason: 'sem progresso anônimo' });
    if (ledger.has(u.learnerId)) return res.status(409).json({ linked: false, error: 'a conta já possui progresso; o vínculo não sobrescreve' });
    auth.relink(u.id, lid);
    log(req, 'progress.link', 'ok', u.id);
    res.json({ linked: true });
  });

  /** Progresso da conta (com datas) para hidratar o navegador. */
  router.get('/champion/progress', need(), (req: AuthedReq, res) => {
    const d = ledger.detail(req.user!.learnerId);
    res.json({ scenarios: d.scenarios, labs: d.labs, promptLabs: d.promptLabs });
  });

  // ───────── Gestão de usuários ─────────
  const admin = express.Router();
  admin.use(csrf);
  admin.get('/users', need('admin', 'auditor'), (_req, res) => res.json({ users: auth.list().map(toPublicUser), roles: ROLES.map((r) => ({ id: r, label: ROLE_LABEL[r] })) }));
  admin.post('/users', need('admin'), async (req: AuthedReq, res) => {
    const r = await auth.create(req.body ?? {});
    if (!r.ok) { log(req, 'user.create', 'fail', String(req.body?.email ?? '').slice(0, 120)); return res.status(400).json({ error: r.error }); }
    log(req, 'user.create', 'ok', r.user.id, { email: r.user.email, role: r.user.role });
    res.status(201).json({ user: toPublicUser(r.user), temporaryPassword: r.password });
  });
  admin.patch('/users/:id', need('admin'), (req: AuthedReq, res) => {
    const id = req.params.id; const b = req.body ?? {};
    if (id === req.user!.id && (b.status === 'disabled' || (b.role && b.role !== req.user!.role))) return res.status(400).json({ error: 'você não pode desativar nem alterar o próprio perfil' });
    const r = auth.update(id, b);
    if (!r.ok) { log(req, 'user.update', 'fail', id); return res.status(400).json({ error: r.error }); }
    const action: AuditAction = r.user.status !== r.before.status ? (r.user.status === 'disabled' ? 'user.disable' : 'user.enable') : 'user.update';
    log(req, action, 'ok', id, { email: r.user.email, roleBefore: r.before.role, roleAfter: r.user.role, statusAfter: r.user.status });
    res.json({ user: toPublicUser(r.user) });
  });
  admin.post('/users/:id/reset-password', need('admin'), async (req: AuthedReq, res) => {
    const r = await auth.resetPassword(req.params.id);
    if (!r.ok) return res.status(404).json({ error: r.error });
    log(req, 'auth.password.reset', 'ok', r.user.id, { email: r.user.email });
    res.json({ temporaryPassword: r.password });
  });

  // ───────── Relatórios ─────────
  const rep = express.Router();
  rep.use(csrf, need());
  const filtersOf = (q: express.Request) => ({
    team: typeof q.query.team === 'string' ? q.query.team.slice(0, 60) : undefined,
    situation: typeof q.query.situation === 'string' ? q.query.situation.slice(0, 30) : undefined,
    q: typeof q.query.q === 'string' ? q.query.q.slice(0, 80) : undefined,
  });
  rep.get('/summary', (req: AuthedReq, res) => {
    const doc = reports.build({ id: req.user!.id, email: req.user!.email, role: req.user!.role }, filtersOf(req));
    log(req, 'report.view', 'ok', doc.meta.reportId, { rows: doc.rows.length, scope: doc.meta.scope });
    res.json(doc);
  });
  rep.get('/export', async (req: AuthedReq, res) => {
    const format = (['json', 'xlsx'] as const).find((x) => x === req.query.format) ?? null;
    if (!format) return res.status(400).json({ error: 'formato inválido (use xlsx ou json)' });
    const doc = reports.build({ id: req.user!.id, email: req.user!.email, role: req.user!.role }, filtersOf(req));
    log(req, 'report.export', 'ok', doc.meta.reportId, { format, rows: doc.rows.length, scope: doc.meta.scope, sha256: doc.integrity?.contentSha256 ?? null });
    res.setHeader('X-Report-Id', doc.meta.reportId);
    res.setHeader('X-Report-Signature', doc.integrity?.signature ?? '');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.meta.reportId}.${format}"`);
    if (format === 'xlsx') return res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(await reportToXlsx(doc));
    res.type('application/json; charset=utf-8').send(JSON.stringify(doc, null, 2));
  });
  rep.post('/verify', (req, res) => res.json(reports.verify(req.body)));

  // ───────── Trilha de auditoria ─────────
  const aud = express.Router();
  aud.use(csrf, need('auditor', 'admin'));
  const auditFilters = (req: express.Request) => ({
    action: typeof req.query.action === 'string' ? req.query.action.slice(0, 40) : undefined,
    actorEmail: typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : undefined,
    from: typeof req.query.from === 'string' ? req.query.from.slice(0, 30) : undefined,
    to: typeof req.query.to === 'string' ? req.query.to.slice(0, 30) : undefined,
    limit: Number(req.query.limit) || 100, offset: Number(req.query.offset) || 0,
  });
  aud.get('/', (req: AuthedReq, res) => {
    const r = audit.list(auditFilters(req));
    log(req, 'audit.view', 'ok');
    res.json({ ...r, chain: audit.verify() });
  });
  aud.get('/verify', (_req, res) => res.json(audit.verify()));
  aud.get('/export', (req: AuthedReq, res) => {
    const r = audit.list({ ...auditFilters(req), limit: 1000, offset: 0 });
    const chain = audit.verify();
    log(req, 'audit.export', 'ok', undefined, { rows: r.entries.length, chainOk: chain.ok });
    const head = ['seq', 'data_hora_utc', 'acao', 'resultado', 'ator_email', 'ator_perfil', 'alvo', 'ip', 'detalhe', 'hash'];
    const lines = [head.join(';'), ...r.entries.map((e) => [e.seq, e.ts, e.action, e.outcome, e.actor?.email, e.actor?.role, e.target, e.ip, e.detail ? JSON.stringify(e.detail) : '', e.hash].map(csvCell).join(';'))];
    res.setHeader('Content-Disposition', `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.setHeader('X-Audit-Chain-Ok', String(chain.ok)); res.setHeader('X-Audit-Head', chain.head);
    res.type('text/csv; charset=utf-8').send(`﻿${lines.join('\r\n')}\r\n`);
  });

  router.use('/admin', admin);
  router.use('/reports', rep);
  router.use('/audit', aud);

  /** Identidade usada pelo registro de progresso: a conta autenticada; no modo `optional`, a chave anônima do navegador. */
  const learnerOf = (req: AuthedReq): string | null => {
    if (req.user) return req.user.learnerId;
    if (deps.mode === 'required') return null;
    const v = req.header('x-learner-id');
    return v && LEARNER_RE.test(v) ? v : null;
  };

  return { attach, router, learnerOf, csrf, csrfSession, need, log, actorOf, credLimiter };
}
export type Access = ReturnType<typeof createAccess>;
