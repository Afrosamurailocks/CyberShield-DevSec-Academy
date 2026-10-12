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

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch { /* storage indisponivel */ }
  return { solved: {} };
}

export function saveProgress(p: Progress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}
