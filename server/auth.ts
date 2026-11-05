/**
 * Autenticação, perfis e gestão de usuários do CyberShield Academy.
 *
 * RASCUNHO para revisão humana (Segurança da Informação). Credenciais LOCAIS agora; ponto de extensão para SSO/OIDC:
 * trocar `authenticate()` por validação do token do provedor [inserir provedor SSO] mantendo `UserRec`/sessão.
 *
 * Controles: senha com scrypt (salt por usuário, parâmetros no hash), política de senha, bloqueio progressivo por conta
 * (5 falhas = 15 min), mensagem de erro única (sem enumeração de usuário), tempo constante com usuário inexistente,
 * sessão com token aleatório de 256 bits guardado só como SHA-256 (cookie HttpOnly + SameSite=Strict), expiração por
 * inatividade e absoluta, invalidação de sessões ao trocar senha/perfil/desativar, troca obrigatória no 1º acesso,
 * último administrador protegido. Usuários ficam em `data/users.json` (separado da tabela `users` dos labs OWASP,
 * que é propositalmente vulnerável e NUNCA deve ser usada para login real).
 * Limite: sessões ficam em memória (reiniciar o servidor encerra todas) e o armazenamento é um arquivo JSON, adequado a
 * uma instância única [definir banco corporativo para produção].
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt) as (pw: string, salt: Buffer, keylen: number, opts: crypto.ScryptOptions) => Promise<Buffer>;

export const ROLES = ['learner', 'manager', 'auditor', 'admin'] as const;
export type Role = typeof ROLES[number];
export const ROLE_LABEL: Record<Role, string> = { learner: 'Aluno', manager: 'Gestor', auditor: 'Auditor', admin: 'Administrador' };

export interface UserRec {
  id: string; email: string; name: string; role: Role; team: string; managerId: string | null;
  status: 'active' | 'disabled'; pw: string; mustChange: boolean; failed: number; lockedUntil: number;
  createdAt: string; passwordChangedAt: string; lastLoginAt: string | null; learnerId: string;
}
export type PublicUser = Omit<UserRec, 'pw' | 'failed' | 'lockedUntil'> & { locked: boolean };

export const toPublicUser = (u: UserRec): PublicUser => {
  const { pw: _pw, failed: _f, lockedUntil, ...rest } = u;
  return { ...rest, locked: lockedUntil > Date.now() };
};

export const EMAIL_RE = /^[^\s@<>"',;:()[\]\\]{1,64}@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
export const normEmail = (s: unknown): string => (typeof s === 'string' ? s.trim().toLowerCase() : '');

const COMMON = new Set(['password', 'senha', '123456', 'qwerty', 'admin', 'cybershield', 'letmein', 'welcome', 'trocar']);
/** Política de senha (NIST 800-63B: tamanho > composição; bloqueia triviais e derivados do e-mail). Retorna o motivo ou null. */
export function passwordProblem(pw: unknown, email = ''): string | null {
  if (typeof pw !== 'string') return 'senha inválida';
  if (pw.length < 12) return 'a senha precisa ter ao menos 12 caracteres';
  if (pw.length > 128) return 'a senha pode ter no máximo 128 caracteres';
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (classes < 3) return 'use ao menos 3 tipos de caractere (minúscula, maiúscula, número, símbolo)';
  const low = pw.toLowerCase(); const local = email.split('@')[0]?.toLowerCase();
  if (local && local.length >= 4 && low.includes(local)) return 'a senha não pode conter o seu e-mail';
  for (const c of COMMON) if (low.includes(c) && pw.length < 16) return 'senha muito previsível';
  return null;
}

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };
export async function hashPassword(pw: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const h = await scrypt(pw, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${h.toString('base64')}`;
}
export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [alg, N, r, p, s, h] = stored.split('$');
  if (alg !== 'scrypt' || !h) return false;
  const want = Buffer.from(h, 'base64');
  const got = await scrypt(pw, Buffer.from(s, 'base64'), want.length, { N: +N, r: +r, p: +p, maxmem: 64 * 1024 * 1024 });
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}
let DUMMY: Promise<string> | null = null; // hash falso: equaliza o tempo quando o e-mail não existe

/** Senha provisória aleatória (mostrada UMA vez ao administrador; o usuário é obrigado a trocar no 1º acesso). */
export function tempPassword(): string {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; const a = 'abcdefghijkmnopqrstuvwxyz'; const d = '23456789'; const s = '!@#$%&*?';
  const pick = (set: string) => set[crypto.randomInt(set.length)];
  const chars = [pick(A), pick(a), pick(d), pick(s), ...Array.from({ length: 12 }, () => pick(A + a + d))];
  for (let i = chars.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join('');
}

export const LOCK_AFTER = 5;
export const LOCK_MS = 15 * 60_000;
export const IDLE_MS = 30 * 60_000;
export const ABSOLUTE_MS = 8 * 3_600_000;

interface Session { userId: string; createdAt: number; lastSeen: number }
export type AuthResult =
  | { ok: true; user: UserRec; token: string }
  | { ok: false; reason: 'invalid' | 'locked' | 'disabled'; user?: UserRec; justLocked?: boolean };

export interface CreateUserInput { email: unknown; name: unknown; role: unknown; team?: unknown; managerId?: unknown }

export function createAuth(opts: { dir: string; allowedEmailDomain?: string; now?: () => number }) {
  const now = opts.now ?? Date.now;
  const file = path.join(opts.dir, 'users.json');
  fs.mkdirSync(opts.dir, { recursive: true });
  let users: Record<string, UserRec> = {};
  try { const raw = JSON.parse(fs.readFileSync(file, 'utf8')); if (raw?.v === 1 && raw.users) users = raw.users; } catch { /* vazio */ }
  const flush = () => {
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ v: 1, users }), { mode: 0o600 });
    fs.renameSync(tmp, file);
  };
  const byEmail = (email: string) => Object.values(users).find((u) => u.email === email) ?? null;
  const sessions = new Map<string, Session>();
  const tokenKey = (t: string) => crypto.createHash('sha256').update(t).digest('hex');
  const dropSessions = (userId: string) => { for (const [k, s] of sessions) if (s.userId === userId) sessions.delete(k); };
  const activeAdmins = () => Object.values(users).filter((u) => u.role === 'admin' && u.status === 'active');
  const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max) : '');

  function validateProfile(input: CreateUserInput, selfId?: string): { ok: true; v: { email: string; name: string; role: Role; team: string; managerId: string | null } } | { ok: false; error: string } {
    const email = normEmail(input.email); const name = clean(input.name, 80);
    if (!EMAIL_RE.test(email) || email.length > 120) return { ok: false, error: 'e-mail inválido' };
    if (opts.allowedEmailDomain && !email.endsWith(`@${opts.allowedEmailDomain}`)) return { ok: false, error: `o e-mail precisa ser do domínio @${opts.allowedEmailDomain}` };
    if (name.length < 2) return { ok: false, error: 'nome inválido (mínimo de 2 caracteres)' };
    if (!ROLES.includes(input.role as Role)) return { ok: false, error: 'perfil inválido' };
    const managerId = input.managerId ? String(input.managerId) : null;
    if (managerId) {
      const m = users[managerId];
      if (!m || m.status !== 'active' || (m.role !== 'manager' && m.role !== 'admin')) return { ok: false, error: 'gestor inválido (precisa ser um gestor ativo)' };
      if (managerId === selfId) return { ok: false, error: 'o usuário não pode ser gestor de si mesmo' };
    }
    return { ok: true, v: { email, name, role: input.role as Role, team: clean(input.team, 60), managerId } };
  }

  return {
    file,
    count: () => Object.keys(users).length,
    list: () => Object.values(users).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    get: (id: string) => users[id] ?? null,
    byEmail,
    byLearnerId: (lid: string) => Object.values(users).find((u) => u.learnerId === lid) ?? null,

    /** Cria o 1º administrador quando não há usuários. `password` ausente gera uma senha provisória (retornada para exibição única). */
    async bootstrap(email: string, password?: string): Promise<{ user: UserRec; password: string } | null> {
      if (Object.keys(users).length) return null;
      const pw = password ?? tempPassword();
      const t = new Date(now()).toISOString();
      const u: UserRec = { id: crypto.randomUUID(), email: normEmail(email), name: 'Administrador', role: 'admin', team: 'Segurança da Informação', managerId: null,
        status: 'active', pw: await hashPassword(pw), mustChange: true, failed: 0, lockedUntil: 0, createdAt: t, passwordChangedAt: t, lastLoginAt: null, learnerId: crypto.randomUUID() };
      users[u.id] = u; flush();
      return { user: u, password: pw };
    },

    async create(input: CreateUserInput): Promise<{ ok: true; user: UserRec; password: string } | { ok: false; error: string }> {
      const p = validateProfile(input);
      if (!p.ok) return p;
      if (byEmail(p.v.email)) return { ok: false, error: 'já existe um usuário com este e-mail' };
      const pw = tempPassword(); const t = new Date(now()).toISOString();
      const u: UserRec = { id: crypto.randomUUID(), ...p.v, status: 'active', pw: await hashPassword(pw), mustChange: true, failed: 0, lockedUntil: 0,
        createdAt: t, passwordChangedAt: t, lastLoginAt: null, learnerId: crypto.randomUUID() };
      users[u.id] = u; flush();
      return { ok: true, user: u, password: pw };
    },

    /** Atualiza perfil/estado. Protege o último administrador ativo e invalida sessões quando perfil/estado mudam. */
    update(id: string, patch: Partial<CreateUserInput> & { status?: unknown }): { ok: true; user: UserRec; before: PublicUser } | { ok: false; error: string } {
      const u = users[id]; if (!u) return { ok: false, error: 'usuário não encontrado' };
      const before = toPublicUser(u);
      const merged = { email: patch.email ?? u.email, name: patch.name ?? u.name, role: patch.role ?? u.role, team: patch.team ?? u.team, managerId: 'managerId' in patch ? patch.managerId : u.managerId };
      const p = validateProfile(merged, id);
      if (!p.ok) return p;
      const dup = byEmail(p.v.email); if (dup && dup.id !== id) return { ok: false, error: 'já existe um usuário com este e-mail' };
      const status = patch.status === undefined ? u.status : patch.status;
      if (status !== 'active' && status !== 'disabled') return { ok: false, error: 'estado inválido' };
      const losesAdmin = u.role === 'admin' && u.status === 'active' && (p.v.role !== 'admin' || status !== 'active');
      if (losesAdmin && activeAdmins().length <= 1) return { ok: false, error: 'é preciso manter ao menos um administrador ativo' };
      const sensitive = p.v.role !== u.role || status !== u.status || p.v.email !== u.email;
      Object.assign(u, p.v, { status });
      if (status === 'active' && u.failed) { u.failed = 0; u.lockedUntil = 0; }
      if (sensitive) dropSessions(id);
      flush();
      return { ok: true, user: u, before };
    },

    /** Gera nova senha provisória (reset por administrador): exige troca no próximo acesso e encerra as sessões. */
    async resetPassword(id: string): Promise<{ ok: true; user: UserRec; password: string } | { ok: false; error: string }> {
      const u = users[id]; if (!u) return { ok: false, error: 'usuário não encontrado' };
      const pw = tempPassword();
      u.pw = await hashPassword(pw); u.mustChange = true; u.failed = 0; u.lockedUntil = 0; u.passwordChangedAt = new Date(now()).toISOString();
      dropSessions(id); flush();
      return { ok: true, user: u, password: pw };
    },

    async changePassword(id: string, current: unknown, next: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
      const u = users[id]; if (!u) return { ok: false, error: 'usuário não encontrado' };
      if (typeof current !== 'string' || !(await verifyPassword(current, u.pw))) return { ok: false, error: 'senha atual incorreta' };
      const problem = passwordProblem(next, u.email);
      if (problem) return { ok: false, error: problem };
      if (current === next) return { ok: false, error: 'a nova senha precisa ser diferente da atual' };
      u.pw = await hashPassword(next as string); u.mustChange = false; u.passwordChangedAt = new Date(now()).toISOString();
      dropSessions(id); flush();
      return { ok: true };
    },

    /** Valida e-mail+senha. Sempre gasta o custo do scrypt (inclusive com e-mail inexistente) para não vazar existência por tempo. */
    async authenticate(emailRaw: unknown, password: unknown): Promise<AuthResult> {
      const email = normEmail(emailRaw); const u = byEmail(email);
      const pw = typeof password === 'string' && password.length <= 256 ? password : '';
      if (!u) { DUMMY ??= hashPassword('dummy-password-for-timing'); await verifyPassword(pw, await DUMMY); return { ok: false, reason: 'invalid' }; }
      if (u.lockedUntil > now()) { await verifyPassword(pw, u.pw); return { ok: false, reason: 'locked', user: u }; }
      const good = await verifyPassword(pw, u.pw);
      if (!good) {
        u.failed += 1; let justLocked = false;
        if (u.failed >= LOCK_AFTER) { u.lockedUntil = now() + LOCK_MS; u.failed = 0; justLocked = true; }
        flush();
        return { ok: false, reason: 'invalid', user: u, justLocked };
      }
      if (u.status !== 'active') return { ok: false, reason: 'disabled', user: u };
      u.failed = 0; u.lockedUntil = 0; u.lastLoginAt = new Date(now()).toISOString(); flush();
      const token = crypto.randomBytes(32).toString('base64url'); // novo a cada login (anti session fixation)
      sessions.set(tokenKey(token), { userId: u.id, createdAt: now(), lastSeen: now() });
      return { ok: true, user: u, token };
    },

    /** Resolve o cookie em usuário. Renova a inatividade; expira por tempo ocioso/absoluto; ignora usuário desativado. */
    session(token: string | undefined): { user: UserRec; expired?: false } | { user: null; expired: boolean } {
      if (!token) return { user: null, expired: false };
      const k = tokenKey(token); const s = sessions.get(k);
      if (!s) return { user: null, expired: false };
      const t = now();
      if (t - s.lastSeen > IDLE_MS || t - s.createdAt > ABSOLUTE_MS) { sessions.delete(k); return { user: null, expired: true }; }
      const u = users[s.userId];
      if (!u || u.status !== 'active') { sessions.delete(k); return { user: null, expired: false }; }
      s.lastSeen = t;
      return { user: u };
    },
    /** Nova sessão (token rotacionado), p.ex. depois da troca de senha, que encerra as anteriores. */
    startSession(userId: string): string {
      const token = crypto.randomBytes(32).toString('base64url');
      sessions.set(tokenKey(token), { userId, createdAt: now(), lastSeen: now() });
      return token;
    },
    logout(token: string | undefined) { if (token) sessions.delete(tokenKey(token)); },
    activeSessions: () => sessions.size,

    /** Troca o learnerId (vínculo do progresso anônimo existente à conta, no 1º login). */
    relink(id: string, learnerId: string) { const u = users[id]; if (u) { u.learnerId = learnerId; flush(); } },
    flush,
  };
}
export type Auth = ReturnType<typeof createAuth>;
