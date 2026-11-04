import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, CheckCircle2, ChevronRight, Flag, Lightbulb, Loader2, RotateCcw, Send, ShieldAlert, User } from 'lucide-react';
import {
  type PromptLabInfo, type PromptLabProgress,
  fetchPromptLabs, chatPromptLab, hintPromptLab, submitPromptLab, loadPromptLabProgress, savePromptLabProgress,
} from '../api';
import { Panel, Pill } from './ui';
import { Prose } from './RichText';

interface Msg { role: 'user' | 'bot'; text: string; tokens?: number }
const MAX = 400;
const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-offense)]';

/** Laboratório de prompts: o colaborador conversa com assistentes simulados e tenta capturar a flag. */
export function LlmLab() {
  const [labs, setLabs] = useState<PromptLabInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>('lab01');
  const [progress, setProgress] = useState<PromptLabProgress>(() => loadPromptLabProgress());
  const [chats, setChats] = useState<Record<string, Msg[]>>({});
  const [hints, setHints] = useState<Record<string, string[]>>({});
  const [lessons, setLessons] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState('');
  const [flag, setFlag] = useState('');
  const [flagMsg, setFlagMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetchPromptLabs().then((l) => { if (alive) setLabs(l); })
      .catch(() => { if (alive) setError('Não foi possível carregar o laboratório. O backend (API :4000) está rodando?'); });
    return () => { alive = false; };
  }, []);

  const lab = useMemo(() => labs.find((l) => l.id === activeId) ?? null, [labs, activeId]);
  const solved = lab ? Boolean(progress.solved[lab.id]) : false;
  const messages = useMemo<Msg[]>(() => {
    if (!lab) return [];
    return [{ role: 'bot', text: lab.greeting }, ...(chats[lab.id] ?? [])];
  }, [lab, chats]);
  const shownHints = lab ? hints[lab.id] ?? [] : [];

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages.length]);

  const select = (id: string) => { setActiveId(id); setDraft(''); setFlag(''); setFlagMsg(null); };

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!lab || !text || inFlight.current) return;
    inFlight.current = true; setBusy(true);
    const id = lab.id;
    const prior = (chats[id] ?? []).filter((m) => m.role === 'user').map((m) => m.text);
    setChats((c) => ({ ...c, [id]: [...(c[id] ?? []), { role: 'user', text }] }));
    setDraft('');
    try {
      const r = await chatPromptLab(id, text, prior);
      setChats((c) => ({ ...c, [id]: [...(c[id] ?? []), { role: 'bot', text: r.reply, tokens: r.tokens }] }));
    } catch (e) {
      setChats((c) => ({ ...c, [id]: [...(c[id] ?? []), { role: 'bot', text: `[erro do serviço] ${(e as Error).message}` }] }));
    } finally { inFlight.current = false; setBusy(false); }
  }, [draft, lab, chats]);

  const askHint = async () => {
    if (!lab || shownHints.length >= 3) return;
    try {
      const r = await hintPromptLab(lab.id, shownHints.length);
      setHints((h) => ({ ...h, [lab.id]: [...(h[lab.id] ?? []), r.hint] }));
    } catch { /* ignora */ }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lab || !flag.trim()) return;
    try {
      const r = await submitPromptLab(lab.id, flag.trim());
      if (r.correct) {
        const next: PromptLabProgress = { solved: { ...progress.solved, [lab.id]: { at: new Date().toISOString(), hints: shownHints.length } } };
        setProgress(next); savePromptLabProgress(next);
        if (r.lesson) setLessons((l) => ({ ...l, [lab.id]: r.lesson as string }));
        setFlagMsg(null);
      } else setFlagMsg('Flag incorreta. Confira se copiou inteira (formato OPAH-LLM{...}) e se decodificou, se necessário.');
    } catch { setFlagMsg('Não foi possível validar agora. Tente de novo.'); }
  };

  const reset = () => { if (lab) setChats((c) => ({ ...c, [lab.id]: [] })); };

  if (error) return <div role="alert" className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-center text-rose-200">{error}</div>;
  if (!lab) return <div className="flex items-center justify-center gap-2 py-24 text-slate-400"><Loader2 className="animate-spin" aria-hidden="true" /> Carregando…</div>;

  const doneCount = Object.keys(progress.solved).length;

  return (
    <div className="space-y-6">
      <header className="border-b border-[var(--color-line)] pb-5">
        <h2 className="text-2xl font-semibold">Laboratório de prompts</h2>
        <p className="mt-1.5 max-w-3xl text-[15px] leading-relaxed text-slate-400">
          Converse com assistentes propositalmente vulneráveis e tente capturar a flag de cada um, uma por categoria do OWASP LLM Top 10. Depois de capturar, você vê por que funcionou e como corrigir.
        </p>
        <p className="mt-3 flex max-w-3xl gap-2 border-l-2 border-amber-400/70 bg-[var(--color-surface)] px-3 py-2 text-xs leading-relaxed text-slate-400">
          <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
          <span><strong className="font-semibold text-slate-200">Ambiente de treino.</strong> Os assistentes são simulações no servidor (não há modelo real nem dados reais) e as flags são fictícias. Use as técnicas só aqui, nunca contra sistemas reais sem autorização.</span>
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* lista de labs */}
        <nav aria-label="Labs de prompt" className="lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Labs</span><span>{doneCount}/{labs.length} capturadas</span>
          </p>
          <ul className="space-y-1">
            {labs.map((l) => {
              const done = Boolean(progress.solved[l.id]);
              const active = l.id === lab.id;
              return (
                <li key={l.id}>
                  <button onClick={() => select(l.id)} aria-current={active ? 'true' : undefined}
                    className={`flex min-h-11 w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors ${FOCUS} ${
                      active ? 'border-[var(--color-line)] bg-[var(--color-surface-2)]' : 'border-transparent hover:bg-[var(--color-surface-2)]/60'}`}>
                    <span className="w-12 shrink-0 font-mono text-xs font-semibold text-fuchsia-300">{l.owasp}</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-200">{l.title}</span>
                    {done
                      ? <CheckCircle2 size={15} className="shrink-0 text-[var(--color-defense)]" aria-label="Flag capturada" />
                      : <ChevronRight size={14} className="shrink-0 text-slate-600" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* lab ativo */}
        <section aria-labelledby="lab-title" className="min-w-0 space-y-4">
          <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4">
            <p className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Pill className="border-fuchsia-400/40 text-fuchsia-300">{lab.owasp}</Pill>
              <span>{lab.category}</span>
              {solved && <Pill className="border-emerald-400/40 text-emerald-300"><CheckCircle2 size={12} aria-hidden="true" /> Capturada</Pill>}
            </p>
            <h3 id="lab-title" className="mt-2 text-lg font-semibold text-slate-100">{lab.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-200"><strong className="font-semibold">Objetivo:</strong> {lab.objective}</p>
            <p className="mt-2 max-w-[75ch] text-sm leading-relaxed text-slate-400">{lab.brief}</p>
            {lab.evidence && (
              <div className="mt-3 overflow-hidden rounded border border-[var(--color-line)] bg-[var(--color-ink)]">
                <p className="border-b border-[var(--color-line-soft)] px-3 py-1.5 font-mono text-xs text-slate-400">{lab.evidence.title}</p>
                <pre className="overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed text-slate-300">{lab.evidence.lines.join('\n')}</pre>
                {lab.evidence.note && <p className="border-t border-[var(--color-line-soft)] px-3 py-1.5 text-xs text-slate-500">{lab.evidence.note}</p>}
              </div>
            )}
          </div>

          {/* chat */}
          <div className="overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-2.5">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-200"><Bot size={15} className="text-fuchsia-300" aria-hidden="true" /> {lab.persona}</p>
              <button onClick={reset} disabled={(chats[lab.id] ?? []).length === 0}
                className={`inline-flex min-h-8 items-center gap-1.5 rounded px-2 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 ${FOCUS}`}>
                <RotateCcw size={13} aria-hidden="true" /> Limpar
              </button>
            </div>
            <div role="log" aria-live="polite" aria-label="Conversa com o assistente" className="max-h-[26rem] min-h-48 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${m.role === 'user' ? 'bg-[var(--color-offense)]/20 text-[var(--color-offense)]' : 'bg-fuchsia-400/15 text-fuchsia-300'}`} aria-hidden="true">
                    {m.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                  </span>
                  <div className={`max-w-[85%] rounded-md border px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user' ? 'border-[var(--color-offense)]/30 bg-[var(--color-offense)]/10 text-slate-100' : 'border-[var(--color-line)] bg-[var(--color-ink)]/50 text-slate-200'}`}>
                    <span className="sr-only">{m.role === 'user' ? 'Você: ' : 'Assistente: '}</span>
                    <span className="whitespace-pre-wrap break-words">{m.text}</span>
                    {m.tokens !== undefined && <span className="mt-1 block font-mono text-[11px] text-slate-500">~{m.tokens} tokens</span>}
                  </div>
                </div>
              ))}
              {busy && <p className="flex items-center gap-2 pl-8 text-xs text-slate-500"><Loader2 size={13} className="animate-spin" aria-hidden="true" /> O assistente está respondendo…</p>}
              <div ref={endRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="border-t border-[var(--color-line)] p-3">
              <label htmlFor="prompt-input" className="sr-only">Sua mensagem ao assistente</label>
              <div className="flex items-end gap-2">
                <textarea id="prompt-input" value={draft} maxLength={MAX} rows={2} disabled={busy}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
                  placeholder="Escreva o seu prompt (Enter envia, Shift+Enter quebra linha)"
                  className={`min-h-11 flex-1 resize-y rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 ${FOCUS}`} />
                <button type="submit" disabled={busy || !draft.trim()}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--color-offense)] px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-[var(--color-offense-soft)] disabled:opacity-50 ${FOCUS}`}>
                  <Send size={15} aria-hidden="true" /> Enviar
                </button>
              </div>
              <p className="mt-1 text-right font-mono text-[11px] text-slate-500">{draft.length}/{MAX}</p>
            </form>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="Dicas" tone="info" icon={<Lightbulb size={15} className="text-sky-400" aria-hidden="true" />}>
              {shownHints.length === 0 && <p className="text-sm text-slate-400">Tente sozinho primeiro. Se travar, peça uma dica (são 3, da mais sutil à mais direta).</p>}
              <ol className="space-y-2">
                {shownHints.map((h, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-300"><span className="font-mono text-xs text-sky-300">{i + 1}.</span><span>{h}</span></li>
                ))}
              </ol>
              <button onClick={askHint} disabled={shownHints.length >= 3}
                className={`mt-3 inline-flex min-h-9 items-center rounded-md border border-[var(--color-line)] px-3 text-sm text-slate-200 hover:bg-[var(--color-surface-2)] disabled:opacity-40 ${FOCUS}`}>
                {shownHints.length >= 3 ? 'Sem mais dicas' : `Pedir dica ${shownHints.length + 1} de 3`}
              </button>
            </Panel>

            <Panel title="Validar a flag" tone={solved ? 'defense' : 'warn'} icon={<Flag size={15} aria-hidden="true" />}>
              {solved && lessons[lab.id] ? (
                <p className="text-sm text-emerald-200">Flag capturada com {progress.solved[lab.id].hints} dica(s). A lição está abaixo.</p>
              ) : (
                <form onSubmit={submit} className="space-y-2">
                  <label htmlFor="flag-input" className="text-sm text-slate-300">{solved ? 'Já capturada. Cole a flag de novo para reabrir a lição:' : 'Cole a flag que o assistente revelou:'}</label>
                  <input id="flag-input" value={flag} onChange={(e) => setFlag(e.target.value)} maxLength={120} spellCheck={false} autoComplete="off"
                    placeholder="OPAH-LLM{...}"
                    className={`min-h-11 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 ${FOCUS}`} />
                  <button type="submit" disabled={!flag.trim()}
                    className={`inline-flex min-h-9 items-center rounded-md border border-[var(--color-line)] px-3 text-sm font-medium text-slate-100 hover:bg-[var(--color-surface-2)] disabled:opacity-40 ${FOCUS}`}>Validar</button>
                  {flagMsg && <p role="alert" className="text-sm text-rose-300">{flagMsg}</p>}
                </form>
              )}
            </Panel>
          </div>

          {solved && (
            <Panel title="Por que funcionou e como corrigir" tone="defense" icon={<CheckCircle2 size={15} className="text-[var(--color-defense)]" aria-hidden="true" />}>
              {lessons[lab.id]
                ? <Prose text={lessons[lab.id]} />
                : <p className="text-sm text-slate-400">Cole a flag de novo no painel ao lado para reabrir a lição, ou leia o módulo {lab.owasp.replace('LLM', 'L')} da trilha.</p>}
            </Panel>
          )}
        </section>
      </div>
    </div>
  );
}
