import React, { useState } from 'react';
import { ArrowLeft, Target, Terminal, Bug, ShieldCheck, BookOpen, Lightbulb, Flag, CheckCircle2, ExternalLink } from 'lucide-react';
import type { Lab } from '../types';
import { validateFlag } from '../api';
import { OWASP_META, DIFFICULTY_COLOR, Pill, CodeBlock, Panel } from './ui';
import { HttpRepeater } from './HttpRepeater';
import { ExploitToolkit } from './ExploitToolkit';
import { RichText, Prose, Inline } from './RichText';

type Tab = 'missao' | 'atacar' | 'causa' | 'correcao' | 'refs';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'missao', label: 'Missão', icon: <Target size={15} aria-hidden="true" /> },
  { id: 'atacar', label: 'Atacar', icon: <Terminal size={15} aria-hidden="true" /> },
  { id: 'causa', label: 'Causa-raiz', icon: <Bug size={15} aria-hidden="true" /> },
  { id: 'correcao', label: 'Correção', icon: <ShieldCheck size={15} aria-hidden="true" /> },
  { id: 'refs', label: 'Referências', icon: <BookOpen size={15} aria-hidden="true" /> },
];

const BTN_GHOST = 'inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[var(--color-line)] px-3 text-xs font-medium transition-colors hover:bg-[var(--color-surface-2)]';

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-mono text-[13px] text-slate-100">{children}</dd>
    </div>
  );
}

export function LabView({ lab, solved, totalSteps, onBack, onSolved }: {
  lab: Lab; solved: boolean; /** Total de passos da kill chain (nº de labs). */ totalSteps: number; onBack: () => void; onSolved: (flag: string, points: number) => void;
}) {
  const [tab, setTab] = useState<Tab>('missao');
  const [revealed, setRevealed] = useState(0);
  const [flagInput, setFlagInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>(solved ? 'ok' : 'idle');
  const meta = OWASP_META[lab.owaspId];

  const submit = async (flag: string = flagInput) => {
    const value = flag.trim();
    if (!value) return;
    setFlagInput(value);
    const r = await validateFlag(lab.id, value);
    if (r.correct) { setStatus('ok'); onSolved(value, r.points); }
    else setStatus('wrong');
  };

  // Navegação por setas entre abas (padrão WAI-ARIA tabs).
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = TABS[(i + step + TABS.length) % TABS.length];
    setTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <div className="mx-auto max-w-[1180px] space-y-5">
      <button onClick={onBack}
        className="inline-flex min-h-9 items-center gap-1.5 rounded text-sm text-slate-400 transition-colors hover:text-slate-100">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar à visão geral
      </button>

      {/* Cabeçalho: identificação, título e fatos em faixa tabular */}
      <header className="overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex">
          <span className={`w-1 shrink-0 ${meta.accent}`} aria-hidden="true" />
          <div className="min-w-0 flex-1 px-5 py-4">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span className="font-mono font-semibold text-slate-200">{lab.owaspId}</span>
              <span>{lab.owaspTitle}</span>
              {solved && (
                <Pill className="border-[var(--color-defense)]/40 text-[var(--color-defense)]">
                  <CheckCircle2 size={12} aria-hidden="true" /> Resolvido
                </Pill>
              )}
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold text-slate-100">{lab.title}</h1>
            <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-slate-400"><Inline text={lab.context} /></p>
            {lab.tags.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-x-3 font-mono text-xs text-slate-500">
                {lab.tags.map((t) => <span key={t}>#{t}</span>)}
              </p>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 divide-x divide-y divide-[var(--color-line)] border-t border-[var(--color-line)] sm:grid-cols-4 sm:divide-y-0">
          <Fact label="Nível"><Pill className={DIFFICULTY_COLOR[lab.difficulty]}>{lab.difficulty}</Pill></Fact>
          <Fact label="Fraqueza">{lab.cwe}</Fact>
          <Fact label="Pontos">{lab.points}</Fact>
          <Fact label="Kill chain">{lab.killChain ? `passo ${lab.killChain.step}/${totalSteps}` : '—'}</Fact>
        </dl>

        {lab.killChain && (lab.killChain.uses || lab.killChain.provides) && (
          <div className="space-y-0.5 border-t border-[var(--color-line)] px-5 py-3 text-[13px]">
            {lab.killChain.uses && <p className="text-sky-300/90"><span className="font-semibold">Usa:</span> {lab.killChain.uses}</p>}
            {lab.killChain.provides && <p className="text-[var(--color-offense-soft)]"><span className="font-semibold">Entrega:</span> {lab.killChain.provides}</p>}
          </div>
        )}
      </header>

      {/* Abas */}
      <div role="tablist" aria-label="Etapas do laboratório" className="z-10 flex flex-wrap gap-1 border-b border-[var(--color-line)] bg-[var(--color-ink)]/95 backdrop-blur top-[53px] sticky lg:top-0">
        {TABS.map((t, i) => (
          <button key={t.id} id={`tab-${t.id}`} role="tab" aria-selected={tab === t.id} aria-controls="lab-panel"
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)} onKeyDown={(e) => onTabKey(e, i)}
            className={`-mb-px flex min-h-10 items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors ${
              tab === t.id ? 'border-[var(--color-offense)] text-slate-100' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div id="lab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-4">
        {tab === 'missao' && (
          <div className={`grid gap-5 ${lab.primer ? 'lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start' : ''}`}>
            {lab.primer && (
              <Panel title="Entenda a vulnerabilidade" tone="info" icon={<BookOpen size={15} className="text-sky-400" aria-hidden="true" />}>
                <RichText text={lab.primer} accent={meta.text} />
              </Panel>
            )}
            <div className="min-w-0 space-y-4">
            <Panel title="Objetivo" tone="defense">
              <Prose text={lab.objective} className="text-sm leading-relaxed" />
              <dl className="mt-4 border-t border-[var(--color-line-soft)] pt-3">
                <dt className="text-xs text-slate-500">Endpoint alvo</dt>
                <dd className="mt-1 break-all font-mono text-[13px] text-slate-100">{lab.baseEndpoint}</dd>
              </dl>
            </Panel>
            <Panel title="Dicas progressivas" tone="warn" icon={<Lightbulb size={15} className="text-amber-400" aria-hidden="true" />}
              aside={<span className="font-mono tabular-nums">{revealed}/{lab.hints.length}</span>}>
              {revealed === 0 && <p className="text-sm text-slate-500">Nenhuma dica revelada. Tente primeiro; cada dica entrega um pouco mais do caminho.</p>}
              <ol className="space-y-2">
                {lab.hints.slice(0, revealed).map((h, i) => (
                  <li key={i} className="flex gap-3 border-l-2 border-amber-400/60 bg-[var(--color-ink)]/50 px-3 py-2.5 text-slate-300">
                    <span className="mt-0.5 font-mono text-xs text-amber-300">{i + 1}</span><span className="min-w-0 text-sm leading-relaxed"><Inline text={h} /></span>
                  </li>
                ))}
              </ol>
              {revealed < lab.hints.length && (
                <button onClick={() => setRevealed((r) => r + 1)} className={`${BTN_GHOST} mt-3 text-amber-300`}>
                  Revelar dica {revealed + 1}
                </button>
              )}
            </Panel>
            </div>
          </div>
        )}

        {tab === 'atacar' && (
          <>
            {status === 'ok' ? (
              <div className="rounded-md border border-[var(--color-defense)]/40 bg-[var(--color-defense)]/10 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-defense)]">
                  <CheckCircle2 size={18} aria-hidden="true" /> Exploração concluída. Agora vem a parte que te torna um dev melhor.
                </p>
                <p className="mt-1 text-sm text-slate-300">Entenda por que a falha existe e como blindá-la no código.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setTab('causa')} className={`${BTN_GHOST} text-rose-300`}>Ver a causa-raiz</button>
                  <button onClick={() => setTab('correcao')} className={`${BTN_GHOST} text-[var(--color-defense)]`}>Aprender a correção</button>
                </div>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <Terminal size={14} className="shrink-0 text-[var(--color-offense)]" aria-hidden="true" />
                Workbench de interceptação: edite a requisição HTTP crua e dispare contra o alvo. A flag aparece realçada na resposta. Atalho: Ctrl/⌘ + Enter.
              </p>
            )}
            <HttpRepeater examples={lab.exampleRequests} onFlagDetected={(f) => submit(f)} />
            <ExploitToolkit featured={lab.tools} />
            <details className="group rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 text-sm text-slate-300 transition-colors hover:text-slate-100">
                <Flag size={14} aria-hidden="true" /> Submeter flag manualmente
                <span className="ml-auto text-xs text-slate-400 group-open:hidden">(ou use “Capturar flag” acima)</span>
              </summary>
              <div className="px-4 pb-4">
                <FlagBox value={flagInput} onChange={setFlagInput} onSubmit={() => submit()} status={status}
                  hintsLeft={lab.hints.length - revealed} onNeedHint={() => setTab('missao')} />
              </div>
            </details>
          </>
        )}

        {tab === 'causa' && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
            <div className="min-w-0 space-y-4">
              <Panel title="Causa-raiz" tone="offense">
                <Prose text={lab.writeup.rootCause} />
              </Panel>
              <Panel title="Impacto no negócio" tone="warn">
                <Prose text={lab.writeup.impact} />
              </Panel>
            </div>
            <div className="min-w-0 space-y-2">
              <h3 className="text-sm font-semibold text-slate-100">Código vulnerável, como o dev escreveu</h3>
              <CodeBlock code={lab.writeup.vulnerableCode} language={lab.writeup.vulnerableLanguage} tone="offense" label={`vulnerável · ${lab.writeup.vulnerableLanguage}`} />
            </div>
          </div>
        )}

        {tab === 'correcao' && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-start">
            <div className="min-w-0 space-y-2">
              <h3 className="text-sm font-semibold text-slate-100">Correção (secure coding)</h3>
              <CodeBlock code={lab.writeup.secureCode} language={lab.writeup.secureLanguage} tone="defense" label={`seguro · ${lab.writeup.secureLanguage}`} />
            </div>
            <Panel title="Checklist de remediação" tone="defense" className="min-w-0">
              <ul className="space-y-2">
                {lab.writeup.remediation.map((r, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--color-defense)]" aria-hidden="true" /> <span className="text-[15px] leading-relaxed"><Inline text={r} /></span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        )}

        {tab === 'refs' && (
          <Panel title="Referências técnicas" tone="info" icon={<BookOpen size={15} className="text-sky-400" aria-hidden="true" />}>
            <ul className="divide-y divide-[var(--color-line-soft)]">
              {lab.references.map((ref) => (
                <li key={ref.url}>
                  <a href={ref.url} target="_blank" rel="noreferrer"
                    className="flex min-h-10 items-center gap-2 text-sm text-sky-300 transition-colors hover:text-sky-200 hover:underline">
                    <ExternalLink size={14} className="shrink-0" aria-hidden="true" /> {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  );
}

function FlagBox({ value, onChange, onSubmit, status, hintsLeft = 0, onNeedHint }: {
  value: string; onChange: (v: string) => void; onSubmit: () => void; status: 'idle' | 'wrong' | 'ok';
  hintsLeft?: number; onNeedHint?: () => void;
}) {
  const invalid = status === 'wrong';
  return (
    <div className={`rounded-md border p-4 ${status === 'ok' ? 'border-[var(--color-defense)]/40 bg-[var(--color-defense)]/10' : 'border-[var(--color-line)] bg-[var(--color-ink)]/40'}`}>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-200"><Flag size={15} aria-hidden="true" /> Submeter flag</h3>
      {status === 'ok' ? (
        <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-defense)]"><CheckCircle2 size={16} aria-hidden="true" /> Flag correta! Laboratório concluído.</p>
      ) : (
        <>
          <div className="flex gap-2">
            <input value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} autoComplete="off" name="flag"
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              aria-label="Flag capturada" aria-invalid={invalid} aria-describedby={invalid ? 'flag-error' : undefined}
              className={`min-h-10 flex-1 rounded-md border bg-[var(--color-ink)] px-3 font-mono text-sm text-slate-100 ${invalid ? 'border-rose-500' : 'border-[var(--color-line)] focus:border-[var(--color-defense)]'}`}
              placeholder="CYBER{…}" />
            <button onClick={onSubmit}
              className="min-h-10 rounded-md bg-[var(--color-defense)] px-4 text-sm font-semibold text-[#06110c] transition-[filter] hover:brightness-110">
              Validar
            </button>
          </div>
          {invalid && (
            <div id="flag-error" role="alert" className="mt-2 rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-200">
              <p className="font-medium text-rose-300">Ainda não é essa.</p>
              <p className="mt-0.5 text-slate-300">A flag é o valor no formato <code className="font-mono text-slate-100">CYBER{'{...}'}</code> que aparece <strong>realçado na resposta</strong> depois do exploit certo. Confira se copiou o valor completo.</p>
              {hintsLeft > 0 && onNeedHint && (
                <button onClick={onNeedHint} className="mt-1.5 inline-flex min-h-8 items-center gap-1 text-amber-300 hover:text-amber-200">
                  <Lightbulb size={12} aria-hidden="true" /> Ver dica ({hintsLeft} disponível{hintsLeft > 1 ? 'is' : ''})
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
