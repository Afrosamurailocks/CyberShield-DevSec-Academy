import React, { useEffect, useMemo, useState } from 'react';
import { Play, Loader2, RotateCcw, ArrowRightLeft, Flag, KeyRound, Lock } from 'lucide-react';
import { sendRequest, type RawResponse } from '../api';
import type { LabRequestExample } from '../types';

const TARGET_HOST = 'localhost:4000';
const FLAG_RE = /CYBER\{[^}]+\}/g;

const METHOD_COLOR: Record<string, string> = {
  GET: 'text-[var(--color-m-get)]',
  POST: 'text-[var(--color-m-post)]',
  PUT: 'text-[var(--color-m-put)]',
  DELETE: 'text-[var(--color-m-delete)]',
};

const TOKEN_PLACEHOLDER = '{{token}}';

function buildRaw(ex: LabRequestExample, token?: string | null): string {
  const lines = [`${ex.method} ${ex.path} HTTP/1.1`, `Host: ${TARGET_HOST}`];
  if (ex.auth) lines.push(`Authorization: Bearer ${token || TOKEN_PLACEHOLDER}`);
  if (ex.body) lines.push('Content-Type: application/json');
  lines.push('');
  lines.push(ex.body ?? '');
  return lines.join('\n').trimEnd() + (ex.body ? '' : '\n');
}

function parseRaw(raw: string): { method: string; path: string; headers: Record<string, string>; body?: string } {
  const sepIdx = raw.search(/\r?\n\r?\n/);
  const head = sepIdx === -1 ? raw : raw.slice(0, sepIdx);
  const body = sepIdx === -1 ? '' : raw.slice(sepIdx).replace(/^\r?\n\r?\n/, '');
  const lines = head.split(/\r?\n/).filter((l, i) => i === 0 || l.trim() !== '');
  const [method = 'GET', path = '/'] = (lines[0] ?? '').trim().split(/\s+/);
  const headers: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const i = line.indexOf(':');
    if (i > 0) {
      const k = line.slice(0, i).trim();
      if (k.toLowerCase() !== 'host') headers[k] = line.slice(i + 1).trim();
    }
  }
  return { method: method.toUpperCase(), path, headers, body: body.trim() || undefined };
}

/** Quebra texto em nós React realçando flags CYBER{...}. */
function withFlagHighlight(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0; let m: RegExpExecArray | null; const re = new RegExp(FLAG_RE);
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<span key={m.index} className="flag-hit">{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function HttpRepeater({ examples, onFlagDetected }: {
  examples: LabRequestExample[];
  onFlagDetected?: (flag: string) => void;
}) {
  const [raw, setRaw] = useState<string>(() => (examples[0] ? buildRaw(examples[0]) : `GET /api/health HTTP/1.1\nHost: ${TARGET_HOST}\n`));
  const [resp, setResp] = useState<RawResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'pretty' | 'raw'>('pretty');
  const [activeEx, setActiveEx] = useState(0);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Ao trocar de lab (nova lista de alvos), zera o workbench para o 1º alvo
  // do lab atual — evita que o editor fique com a requisição crua do lab anterior.
  useEffect(() => {
    setActiveEx(0);
    setResp(null);
    setSessionToken(null);
    setRaw(examples[0] ? buildRaw(examples[0]) : `GET /api/health HTTP/1.1\nHost: ${TARGET_HOST}\n`);
  }, [examples]);

  const parsed = useMemo(() => parseRaw(raw), [raw]);

  const detectedFlag = useMemo(() => {
    if (!resp) return null;
    const m = resp.body.match(FLAG_RE);
    return m ? m[0] : null;
  }, [resp]);

  const load = (ex: LabRequestExample, i: number) => { setActiveEx(i); setRaw(buildRaw(ex, sessionToken)); setResp(null); };

  const send = async () => {
    setLoading(true);
    try {
      // substitui {{token}} pelo token de sessão capturado (como "session handling" do Burp)
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.headers)) headers[k] = v.replaceAll(TOKEN_PLACEHOLDER, sessionToken ?? '');
      const r = await sendRequest({ method: parsed.method, path: parsed.path, body: parsed.body, headers });
      setResp(r);
      setView(r.json ? 'pretty' : 'raw');
      // captura automática de token de sessão a partir da resposta (ex.: login)
      const j: any = r.json;
      const tok = j && (typeof j.accessToken === 'string' ? j.accessToken
        : typeof j.sessionToken === 'string' ? j.sessionToken
        : typeof j.token === 'string' ? j.token : null);
      if (tok) setSessionToken(tok);
    } catch (e: any) {
      setResp({ ok: false, status: 0, statusText: 'erro de rede', durationMs: 0, headers: {}, body: String(e?.message ?? e) });
    } finally { setLoading(false); }
  };

  const onKey: React.KeyboardEventHandler = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); send(); }
  };

  const statusTone = !resp ? 'text-slate-500'
    : resp.status === 0 ? 'text-[var(--color-m-delete)]'
    : resp.status < 300 ? 'text-[var(--color-defense)]'
    : resp.status < 400 ? 'text-[var(--color-m-put)]'
    : resp.status < 500 ? 'text-[var(--color-m-post)]'
    : 'text-[var(--color-m-delete)]';

  const bytes = resp ? new TextEncoder().encode(resp.body).length : 0;
  const rawResponse = resp
    ? `HTTP/1.1 ${resp.status} ${resp.statusText}\n` +
      Object.entries(resp.headers).map(([k, v]) => `${k}: ${v}`).join('\n') +
      `\n\n${resp.body}`
    : '';
  const prettyBody = resp?.json ? JSON.stringify(resp.json, null, 2) : resp?.body ?? '';

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] overflow-hidden">
      {/* ── Site map: requisições salvas do alvo ── */}
      {examples.length > 0 && (
        <div className="flex items-stretch gap-px bg-[var(--color-line-soft)] border-b border-[var(--color-line)] overflow-x-auto">
          <span className="shrink-0 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-[var(--color-surface-2)]">Alvos</span>
          {examples.map((ex, i) => (
            <button key={i} onClick={() => load(ex, i)} title={ex.note}
              className={`flex shrink-0 items-center gap-1 px-3 py-2 text-[11px] font-mono whitespace-nowrap transition-colors ${
                activeEx === i ? 'bg-[var(--color-surface)] text-slate-100' : 'bg-[var(--color-surface-2)] text-slate-400 hover:text-slate-200'}`}>
              {ex.auth && <Lock size={10} className={sessionToken ? 'text-[var(--color-defense)]' : 'text-slate-500'} aria-label="requer token" />}
              <span className={METHOD_COLOR[ex.method] ?? 'text-slate-300'}>{ex.method}</span>
              {ex.path.replace('/api', '')}
            </button>
          ))}
        </div>
      )}

      {/* ── Toolbar: Send + alvo ── */}
      <div className="flex items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-2.5">
        <button onClick={send} disabled={loading}
          className="group flex items-center gap-2 rounded-md bg-[var(--color-offense)] px-4 py-2 text-sm font-bold text-[#140a06] shadow-[0_0_20px_-6px_var(--color-offense)] hover:bg-[var(--color-offense-soft)] disabled:opacity-60 transition-colors">
          {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />}
          Enviar
        </button>
        <div className="flex items-center gap-2 font-mono text-xs min-w-0">
          <span className={`font-bold ${METHOD_COLOR[parsed.method] ?? 'text-slate-300'}`}>{parsed.method}</span>
          <span className="live-dot text-[var(--color-defense)]">●</span>
          <span className="text-slate-400 truncate">{TARGET_HOST}<span className="text-slate-200">{parsed.path.replace('/api', '')}</span></span>
        </div>
        <button onClick={() => { if (examples[activeEx]) load(examples[activeEx], activeEx); }}
          className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors" title="Restaurar requisição" aria-label="Restaurar a requisição original">
          <RotateCcw size={13} aria-hidden="true" /> reset
        </button>
        <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-500" aria-hidden="true">Ctrl<ArrowRightLeft size={10} />Enter</span>
      </div>

      {/* ── Barra de token de sessão (session handling, estilo Burp) ── */}
      {sessionToken && (
        <div role="status" className="flex flex-wrap items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-defense)]/5 px-3 py-1.5 text-[11px]">
          <KeyRound size={13} className="text-[var(--color-defense)]" aria-hidden="true" />
          <span className="text-slate-300">Token de sessão capturado:</span>
          <code className="font-mono text-[var(--color-defense)]">{sessionToken}</code>
          <span className="flex items-center gap-1 text-slate-500">— injetado nos alvos com <Lock size={10} aria-hidden="true" /> automaticamente</span>
          <button onClick={() => setSessionToken(null)} className="ml-auto text-slate-500 hover:text-slate-300" aria-label="Descartar token de sessão">limpar</button>
        </div>
      )}

      {/* ── Dois painéis: Request | Response ── */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--color-line)]">
        {/* Request */}
        <div className="flex flex-col">
          <PaneHeader side="Request" accent="offense" />
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} onKeyDown={onKey} spellCheck={false}
            aria-label="Editor da requisição HTTP crua"
            className="h-80 w-full resize-none bg-[var(--color-ink)] px-4 py-3 font-mono text-[12.5px] leading-relaxed text-slate-200 focus:outline-none focus:ring-0 placeholder:text-slate-500"
            placeholder={`POST /api/a01/login HTTP/1.1\nHost: ${TARGET_HOST}\nContent-Type: application/json\n\n{"username":"..."}`} />
        </div>

        {/* Response */}
        <div className="flex flex-col bg-[var(--color-ink)]">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] pr-2">
            <PaneHeader side="Response" accent="defense" />
            {resp && (
              <div className="flex items-center gap-1 text-[11px]">
                <ToggleBtn active={view === 'pretty'} onClick={() => setView('pretty')}>Pretty</ToggleBtn>
                <ToggleBtn active={view === 'raw'} onClick={() => setView('raw')}>Raw</ToggleBtn>
              </div>
            )}
          </div>

          {/* status bar */}
          {resp && (
            <div className="flex items-center gap-3 border-b border-[var(--color-line-soft)] px-4 py-1.5 font-mono text-[11px]">
              <span className={statusTone}>● {resp.status || '—'} {resp.statusText}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{bytes} B</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{resp.durationMs} ms</span>
            </div>
          )}

          {resp && resp.status >= 400 && !detectedFlag && (
            <div className="border-b border-[var(--color-line-soft)] bg-amber-500/5 px-4 py-1.5 text-[11px] text-amber-300/90">
              Resposta {resp.status} é esperada aqui: nos labs, um baseline costuma ser o ponto de partida. Ajuste a requisição conforme as dicas para explorar a falha — não é um bug.
            </div>
          )}
          <div className="h-80 overflow-auto px-4 py-3">
            {!resp ? (
              <div className="flex h-full items-center justify-center text-center text-[12px] text-slate-400">
                <span>Edite a requisição e clique <span className="text-[var(--color-offense)] font-semibold">Enviar</span>.<br />A resposta do servidor aparece aqui.</span>
              </div>
            ) : (
              <pre className="font-mono text-[12.5px] leading-relaxed text-slate-200 whitespace-pre-wrap break-words">
                <code>{withFlagHighlight(view === 'pretty' ? prettyBody : rawResponse)}</code>
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* ── Faixa de captura de flag ── */}
      {detectedFlag && (
        <div role="status" className="flex flex-wrap items-center gap-3 border-t border-[var(--color-defense)]/30 bg-[var(--color-defense)]/10 px-4 py-2.5">
          <Flag size={16} className="text-[var(--color-defense)]" aria-hidden="true" />
          <span className="text-sm text-[var(--color-defense)]">Flag detectada na resposta:</span>
          <code className="font-mono text-[12.5px] text-slate-100 bg-black/30 rounded px-2 py-0.5">{detectedFlag}</code>
          {onFlagDetected && (
            <button onClick={() => onFlagDetected(detectedFlag)}
              className="ml-auto rounded-md bg-[var(--color-defense)] px-3 py-1.5 text-xs font-bold text-[#06110c] hover:brightness-110 transition">
              Capturar flag ▸
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PaneHeader({ side, accent }: { side: string; accent: 'offense' | 'defense' }) {
  const color = accent === 'offense' ? 'var(--color-offense)' : 'var(--color-defense)';
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400">{side}</span>
    </div>
  );
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`rounded px-2 py-1 font-mono transition-colors ${active ? 'bg-[var(--color-surface-2)] text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}>
      {children}
    </button>
  );
}
