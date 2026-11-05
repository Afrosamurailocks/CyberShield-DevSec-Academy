// Cliente da API dos laboratorios. Em dev, o Vite faz proxy de /api -> :4000.
import type { Lab, Progress, PrivacyModule, PrivacyProgress, TrailKind } from './types';
import type { PublicSeal } from './champion';
import { learnerHeaders } from './learner';

export interface RawResponse {
  ok: boolean;
  status: number;
  statusText: string;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
  json?: unknown;
}

export async function fetchLabs(): Promise<Lab[]> {
  const r = await fetch('/api/labs');
  const data = await r.json();
  return data.labs as Lab[];
}

export async function validateFlag(labId: string, flag: string): Promise<{ correct: boolean; points: number }> {
  const r = await fetch('/api/validate-flag', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...learnerHeaders() },
    body: JSON.stringify({ labId, flag }),
  });
  return r.json();
}

/** Executa uma requisicao arbitraria contra a API (console HTTP do lab). */
export async function sendRequest(opts: {
  method: string;
  path: string;
  body?: string;
  headers?: Record<string, string>;
}): Promise<RawResponse> {
  const start = performance.now();
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  const init: RequestInit = { method: opts.method, headers };
  if (opts.body && opts.method !== 'GET' && opts.method !== 'HEAD') {
    init.body = opts.body;
    // Evita header duplicado por diferenca de caixa (Content-Type vs content-type),
    // que o fetch combinaria em "application/json, application/json" e quebraria o parse.
    const hasContentType = Object.keys(headers).some((k) => k.toLowerCase() === 'content-type');
    if (!hasContentType) headers['Content-Type'] = 'application/json';
  }
  const path = opts.path.startsWith('/api') ? opts.path : '/api' + (opts.path.startsWith('/') ? '' : '/') + opts.path;
  const r = await fetch(path, init);
  const text = await r.text();
  const durationMs = Math.round(performance.now() - start);
  const respHeaders: Record<string, string> = {};
  r.headers.forEach((v, k) => (respHeaders[k] = v));
  let json: unknown;
  try { json = JSON.parse(text); } catch { /* corpo nao-JSON */ }
  return { ok: r.ok, status: r.status, statusText: r.statusText, durationMs, headers: respHeaders, body: text, json };
}

// ───────── Progresso (localStorage, por aluno) ─────────
const KEY = 'cybershield.progress.v1';

/** Valida a forma minima esperada antes de confiar no que veio do localStorage
 * (SonarCloud tssecurity:S8475 — o storage pode ter sido adulterado manualmente
 * pelo proprio aluno via DevTools; nunca confiamos cegamente no shape). */
function isValidProgress(value: unknown): value is Progress {
  if (typeof value !== 'object' || value === null) return false;
  const solved = (value as { solved?: unknown }).solved;
  if (typeof solved !== 'object' || solved === null) return false;
  return Object.values(solved).every(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      typeof (entry as { flag?: unknown }).flag === 'string' &&
      typeof (entry as { at?: unknown }).at === 'string' &&
      typeof (entry as { points?: unknown }).points === 'number',
  );
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidProgress(parsed)) return parsed;
    }
  } catch { /* storage indisponivel ou JSON invalido */ }
  return { solved: {} };
}

export function saveProgress(p: Progress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// ───────── Trilhas (Privacidade/LGPD e CIS Controls) ─────────
const ENDPOINT: Record<TrailKind, string> = { privacy: '/api/privacy', cis: '/api/cis', iso: '/api/iso', llm: '/api/llm' };
const TRAIL_KEY: Record<TrailKind, string> = { privacy: 'cybershield.privacy.v1', cis: 'cybershield.cis.v1', iso: 'cybershield.iso.v1', llm: 'cybershield.llm.v1' };

export async function fetchTrail(kind: TrailKind): Promise<PrivacyModule[]> {
  const r = await fetch(`${ENDPOINT[kind]}/modules`);
  if (!r.ok) throw new Error('trail unavailable');
  const data = await r.json();
  return data.modules as PrivacyModule[];
}

export async function answerTrail(kind: TrailKind, moduleId: string, scenarioId: string, optionIndex: number): Promise<{ correct: boolean; feedback: string }> {
  const r = await fetch(`${ENDPOINT[kind]}/answer`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...learnerHeaders() },
    body: JSON.stringify({ moduleId, scenarioId, optionIndex }),
  });
  if (!r.ok) throw new Error('answer rejected');
  return r.json();
}

function isValidTrailProgress(value: unknown): value is PrivacyProgress {
  if (typeof value !== 'object' || value === null) return false;
  const done = (value as { done?: unknown }).done;
  if (typeof done !== 'object' || done === null) return false;
  return Object.values(done).every(
    (e) => typeof e === 'object' && e !== null
      && typeof (e as { at?: unknown }).at === 'string'
      && typeof (e as { attempts?: unknown }).attempts === 'number',
  );
}

export function loadTrailProgress(kind: TrailKind): PrivacyProgress {
  try {
    const raw = localStorage.getItem(TRAIL_KEY[kind]);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidTrailProgress(parsed)) return parsed;
    }
  } catch { /* storage indisponivel ou JSON invalido */ }
  return { done: {} };
}

export function saveTrailProgress(kind: TrailKind, p: PrivacyProgress): void {
  try { localStorage.setItem(TRAIL_KEY[kind], JSON.stringify(p)); } catch { /* ignore */ }
}

// ───────── Laboratório interativo de prompts (área LLM) ─────────
export interface PromptLabInfo {
  id: string; order: number; owasp: string; category: string; title: string; persona: string;
  greeting: string; objective: string; brief: string;
  /** Quantidade de dicas do lab (vem do servidor). */
  hintCount: number;
  evidence?: { title: string; lines: string[]; note?: string };
}
export interface PromptLabProgress { solved: Record<string, { at: string; hints: number }> }

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-requested-with': 'cybershield', ...learnerHeaders() }, body: JSON.stringify(body) });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error((e as { error?: string }).error ?? 'request failed');
  }
  return r.json() as Promise<T>;
}
export async function fetchPromptLabs(): Promise<PromptLabInfo[]> {
  const r = await fetch('/api/llm-lab/labs');
  if (!r.ok) throw new Error('labs unavailable');
  return (await r.json()).labs as PromptLabInfo[];
}
export const chatPromptLab = (labId: string, message: string, history: string[]) =>
  postJson<{ reply: string; tokens: number }>('/api/llm-lab/chat', { labId, message, history });
export const hintPromptLab = (labId: string, n: number) =>
  postJson<{ hint: string }>('/api/llm-lab/hint', { labId, n });
export const submitPromptLab = (labId: string, flag: string) =>
  postJson<{ correct: boolean; lesson?: string }>('/api/llm-lab/submit', { labId, flag });

const LAB_KEY = 'cybershield.llmlab.v1';
export function loadPromptLabProgress(): PromptLabProgress {
  try {
    const raw = localStorage.getItem(LAB_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p === 'object' && p.solved && typeof p.solved === 'object') return p as PromptLabProgress;
    }
  } catch { /* storage indisponivel */ }
  return { solved: {} };
}
export function savePromptLabProgress(p: PromptLabProgress): void {
  try { localStorage.setItem(LAB_KEY, JSON.stringify(p)); } catch { /* ignore */ }
  try { window.dispatchEvent(new Event(LAB_EVENT)); } catch { /* ignore */ }
}
/** Disparado quando o progresso do Laboratório de prompts muda (para refletir na visão geral da trilha LLM). */
export const LAB_EVENT = 'cybershield:llmlab-progress';

// ───────── Jornada Security Champion (progresso e selo no servidor) ─────────
export interface ChampionMe { tracks: { id: string; done: number; total: number; final?: { done: number; total: number } }[]; seal: PublicSeal | null }
export async function fetchChampionMe(): Promise<ChampionMe> {
  const r = await fetch('/api/champion/me', { headers: learnerHeaders() });
  if (!r.ok) throw new Error('champion unavailable');
  return r.json();
}
export const issueChampionSeal = (name: string) => postJson<{ seal: PublicSeal }>('/api/champion/issue', { name });
export async function verifyChampionSeal(id: string): Promise<PublicSeal | null> {
  const r = await fetch(`/api/champion/verify/${encodeURIComponent(id.trim().toUpperCase())}`);
  if (!r.ok) return null;
  return (await r.json()).seal as PublicSeal;
}
async function del(path: string): Promise<void> {
  const r = await fetch(path, { method: 'DELETE', headers: { 'x-requested-with': 'cybershield', ...learnerHeaders() } });
  if (!r.ok) throw new Error('request failed');
}
export const removeChampionSeal = () => del('/api/champion/seal');
export const eraseChampionData = () => del('/api/champion/me');
