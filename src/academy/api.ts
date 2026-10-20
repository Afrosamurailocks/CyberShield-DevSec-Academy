// Cliente da API dos laboratorios. Em dev, o Vite faz proxy de /api -> :4000.
import type { Lab, Progress } from './types';

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
    headers: { 'content-type': 'application/json' },
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
