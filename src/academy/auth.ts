// Cliente de autenticação, usuários, relatórios e auditoria. A sessão vive em cookie HttpOnly (o JavaScript não a lê);
// requisições que alteram estado enviam `x-requested-with` (anti-CSRF). RASCUNHO para revisão humana (Segurança da Informação).
export type Role = 'learner' | 'manager' | 'auditor' | 'admin';
export const ROLE_LABEL: Record<Role, string> = { learner: 'Aluno', manager: 'Gestor', auditor: 'Auditor', admin: 'Administrador' };

export interface SessionUser {
  id: string; email: string; name: string; role: Role; roleLabel: string; team: string; managerId: string | null;
  status: 'active' | 'disabled'; mustChange: boolean; createdAt: string; passwordChangedAt: string; lastLoginAt: string | null; locked: boolean; learnerId: string;
}
export interface MeResponse { mode: 'required' | 'optional'; user: SessionUser | null }

export class ApiError extends Error {
  constructor(message: string, public status: number, public extra?: Record<string, unknown>) { super(message); }
}

const CSRF = { 'x-requested-with': 'cybershield' };
async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(path, {
    method, credentials: 'same-origin',
    headers: { ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...CSRF },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError((data as { error?: string }).error ?? 'Não foi possível concluir a operação.', r.status, data as Record<string, unknown>);
  return data as T;
}

export const fetchMe = () => call<MeResponse>('GET', '/api/auth/me');
export const login = (email: string, password: string) => call<{ user: SessionUser }>('POST', '/api/auth/login', { email, password });
export const logout = () => call<{ ok: true }>('POST', '/api/auth/logout', {});
export const changePassword = (current: string, next: string) => call<{ user: SessionUser }>('POST', '/api/auth/change-password', { current, next });
export const fetchPasswordPolicy = () => call<{ rules: string[] }>('GET', '/api/auth/password-policy');

// ───────── Progresso do navegador ↔ conta ─────────
const LEGACY_ID_KEY = 'cybershield.learner.v1';
const LOCAL_KEYS = ['cybershield.progress.v1', 'cybershield.privacy.v1', 'cybershield.cis.v1', 'cybershield.iso.v1', 'cybershield.llm.v1', 'cybershield.llmlab.v1'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Apaga o progresso guardado neste navegador (evita que o próximo usuário veja o progresso do anterior em computador compartilhado). */
export function clearLocalProgress(): void {
  for (const k of LOCAL_KEYS) { try { localStorage.removeItem(k); } catch { /* storage indisponível */ } }
}

/**
 * Pós-login: vincula (uma vez) o progresso anônimo deste navegador à conta e carrega o progresso da conta no navegador.
 * A fonte da verdade é o servidor; o que só existia no navegador e nunca foi validado pelo servidor não é mantido.
 */
export async function syncProgressAfterLogin(): Promise<{ linked: boolean }> {
  let linked = false;
  try {
    const legacy = localStorage.getItem(LEGACY_ID_KEY);
    if (legacy && UUID.test(legacy)) {
      const r = await call<{ linked: boolean }>('POST', '/api/auth/link-progress', { learnerId: legacy }).catch(() => ({ linked: false }));
      linked = r.linked;
      if (r.linked) localStorage.removeItem(LEGACY_ID_KEY); // já pertence à conta; a chave anônima não é mais usada
    }
  } catch { /* storage indisponível */ }
  clearLocalProgress();
  const [p, labsRes] = await Promise.all([
    call<{ scenarios: Record<string, string>; labs: Record<string, string>; promptLabs: Record<string, string> }>('GET', '/api/champion/progress'),
    fetch('/api/labs').then((r) => r.json()).catch(() => ({ labs: [] })) as Promise<{ labs: { id: string; points: number }[] }>,
  ]);
  const trails: Record<string, { done: Record<string, { at: string; attempts: number }> }> = { privacy: { done: {} }, cis: { done: {} }, iso: { done: {} }, llm: { done: {} } };
  for (const [key, at] of Object.entries(p.scenarios)) {
    const i = key.indexOf(':'); const t = key.slice(0, i); const id = key.slice(i + 1);
    if (trails[t]) trails[t].done[id] = { at, attempts: 1 };
  }
  const points = new Map(labsRes.labs.map((l) => [l.id, l.points]));
  const solved = Object.fromEntries(Object.entries(p.labs).map(([id, at]) => [id, { flag: '', points: points.get(id) ?? 0, at }]));
  const promptSolved = Object.fromEntries(Object.entries(p.promptLabs).map(([id, at]) => [id, { at, hints: 0 }]));
  try {
    for (const t of Object.keys(trails)) localStorage.setItem(`cybershield.${t}.v1`, JSON.stringify(trails[t]));
    localStorage.setItem('cybershield.progress.v1', JSON.stringify({ solved }));
    localStorage.setItem('cybershield.llmlab.v1', JSON.stringify({ solved: promptSolved }));
  } catch { /* storage indisponível: a sessão segue com o que o servidor registra */ }
  return { linked };
}

// ───────── Usuários (administração) ─────────
export type AdminUser = Omit<SessionUser, 'roleLabel'>;
export interface UserInput { email: string; name: string; role: Role; team: string; managerId: string | null }
export const fetchUsers = () => call<{ users: AdminUser[]; roles: { id: Role; label: string }[] }>('GET', '/api/admin/users');
export const createUser = (u: UserInput) => call<{ user: AdminUser; temporaryPassword: string }>('POST', '/api/admin/users', u);
export const updateUser = (id: string, patch: Partial<UserInput> & { status?: 'active' | 'disabled' }) => call<{ user: AdminUser }>('PATCH', `/api/admin/users/${id}`, patch);
export const resetUserPassword = (id: string) => call<{ temporaryPassword: string }>('POST', `/api/admin/users/${id}/reset-password`, {});

// ───────── Relatório de desempenho ─────────
export interface TrackCell { done: number; total: number; pct: number; last: string | null; finalPending: boolean }
export interface ReportRow {
  userId: string; name: string; email: string; role: Role; team: string; manager: string; status: 'active' | 'disabled';
  situation: 'Aprovado' | 'Final pendente' | 'Em andamento' | 'Não iniciado'; tier: string; overallPct: number; pendingFinals: string[];
  firstActivity: string | null; lastActivity: string | null; lastLogin: string | null; createdAt: string; sealId: string | null; sealIssuedAt: string | null;
  tracks: Record<string, TrackCell>;
}
export interface TrainingInfo {
  id: string; title: string; reference: string; description: string; audience: string; format: string;
  modules: number | null; items: number; itemUnit: string; points: number | null; finalEvaluation: string; sourceNote: string;
}
export interface ReportDoc {
  meta: {
    reportId: string; generatedAt: string; generatedBy: { id: string; email: string; role: Role }; scope: 'organization' | 'team' | 'self';
    filters: { team?: string; situation?: string; q?: string }; trackTotals: Record<string, number>;
    trainings: TrainingInfo[];
    criteria: { tiers: { id: string; label: string; minPctPerTrack: number }[]; mandatoryFinals: string[]; situations: Record<string, string> }; notes: string[];
  };
  summary: {
    users: number; byStatus: Record<string, number>; bySituation: Record<string, number>; approvalRatePct: number; averageOverallPct: number;
    neverLoggedIn: number; disabled: number; byTier: Record<string, number>; byTrack: Record<string, { averagePct: number; completed: number }>;
    byTeam: { team: string; users: number; approved: number; approvalRatePct: number; averageOverallPct: number }[];
  };
  rows: ReportRow[];
  integrity: { algorithm: string; contentSha256: string; signature: string };
}
export interface ReportFilters { team?: string; situation?: string; q?: string }
const qs = (f: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams(); for (const [k, v] of Object.entries(f)) if (v !== undefined && v !== '') p.set(k, String(v));
  const s = p.toString(); return s ? `?${s}` : '';
};
export const fetchReport = (f: ReportFilters) => call<ReportDoc>('GET', `/api/reports/summary${qs({ ...f })}`);
export const verifyReport = (doc: unknown) => call<{ valid: boolean; reportId?: string; generatedAt?: string; generatedBy?: string; reason?: string }>('POST', '/api/reports/verify', doc);

/** Baixa um arquivo gerado pelo servidor (cookie + cabeçalho anti-CSRF) e dispara o download no navegador. */
export async function downloadFile(path: string, fallbackName: string): Promise<string> {
  const r = await fetch(path, { credentials: 'same-origin', headers: CSRF });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new ApiError((e as { error?: string }).error ?? 'Falha ao gerar o arquivo.', r.status); }
  const name = /filename="([^"]+)"/.exec(r.headers.get('content-disposition') ?? '')?.[1] ?? fallbackName;
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return name;
}
export const exportReport = (format: 'xlsx' | 'json', f: ReportFilters) => downloadFile(`/api/reports/export${qs({ format, ...f })}`, `relatorio.${format}`);

// ───────── Trilha de auditoria ─────────
export interface AuditEntry {
  seq: number; ts: string; action: string; outcome: 'ok' | 'fail' | 'denied'; actor: { id: string; email: string; role: string } | null;
  target?: string; ip?: string; detail?: Record<string, string | number | boolean | null>; hash: string;
}
export interface AuditResponse { total: number; entries: AuditEntry[]; chain: { ok: boolean; count: number; head: string; brokenAtSeq?: number; reason?: string } }
export const fetchAudit = (f: { action?: string; q?: string; from?: string; to?: string; limit?: number; offset?: number }) => call<AuditResponse>('GET', `/api/audit${qs(f)}`);
export const exportAudit = (f: { action?: string; q?: string; from?: string; to?: string }) => downloadFile(`/api/audit/export${qs(f)}`, 'audit-log.csv');
