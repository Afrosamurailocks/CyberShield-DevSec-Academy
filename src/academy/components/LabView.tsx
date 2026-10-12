import React, { useState } from 'react';
import { ArrowLeft, Target, Terminal, Bug, ShieldCheck, BookOpen, Lightbulb, Flag, CheckCircle2, ExternalLink } from 'lucide-react';
import type { Lab } from '../types';
import { validateFlag } from '../api';
import { OWASP_META, DIFFICULTY_COLOR, Pill, CodeBlock } from './ui';
import { HttpRepeater } from './HttpRepeater';
import { ExploitToolkit } from './ExploitToolkit';

type Tab = 'missao' | 'atacar' | 'causa' | 'correcao' | 'refs';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'missao', label: 'Missão', icon: <Target size={15} /> },
  { id: 'atacar', label: 'Atacar', icon: <Terminal size={15} /> },
  { id: 'causa', label: 'Causa-raiz', icon: <Bug size={15} /> },
  { id: 'correcao', label: 'Correção', icon: <ShieldCheck size={15} /> },
  { id: 'refs', label: 'Referências', icon: <BookOpen size={15} /> },
];

export function LabView({ lab, solved, onBack, onSolved }: {
  lab: Lab; solved: boolean; onBack: () => void; onSolved: (flag: string, points: number) => void;
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

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-300 transition-colors">
        <ArrowLeft size={16} /> Voltar à visão geral
      </button>

      {/* Cabecalho */}
      <div className={`rounded-xl border border-slate-800 bg-slate-900/40 p-5 ring-1 ${meta.ring}`}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1.5 rounded-md ${meta.accent} px-2 py-0.5 text-xs font-bold text-slate-950`}>
            {lab.owaspId} · {lab.owaspTitle}
          </span>
          <Pill className={DIFFICULTY_COLOR[lab.difficulty]}>{lab.difficulty}</Pill>
          <Pill className="border-slate-700 bg-slate-800/50 text-slate-300">{lab.cwe}</Pill>
          <Pill className="border-slate-700 bg-slate-800/50 text-slate-300">{lab.points} pts</Pill>
          {solved && <Pill className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300"><CheckCircle2 size={12} /> Resolvido</Pill>}
        </div>
        <h1 className="text-2xl font-bold text-slate-100">{lab.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{lab.context}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {lab.tags.map((t) => <span key={t} className="font-mono text-[11px] text-slate-500">#{t}</span>)}
        </div>
        {lab.killChain && (
          <div className="mt-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)]/40 p-3 text-[12px]">
            <p className="font-semibold text-slate-300">Kill chain · passo {lab.killChain.step}/10</p>
            {lab.killChain.uses && <p className="mt-1 text-sky-300/90"><span className="font-semibold">usa:</span> {lab.killChain.uses}</p>}
            {lab.killChain.provides && <p className="mt-0.5 text-[var(--color-offense-soft)]"><span className="font-semibold">entrega:</span> {lab.killChain.provides}</p>}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-[var(--color-offense)] text-[var(--color-offense-soft)]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Conteudo */}
      {tab === 'missao' && (
        <div className="space-y-4">
          {lab.primer && (
            <section className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-4">
              <h3 className="mb-1.5 text-sm font-semibold text-sky-300 flex items-center gap-1.5">
                <BookOpen size={15} aria-hidden="true" /> Entenda a vulnerabilidade
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{lab.primer}</p>
            </section>
          )}
          <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="mb-1.5 text-sm font-semibold text-emerald-300">Objetivo</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{lab.objective}</p>
            <p className="mt-3 font-mono text-xs text-slate-400">Endpoint alvo: <span className="text-slate-200">{lab.baseEndpoint}</span></p>
          </section>
          <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-1.5"><Lightbulb size={15} /> Dicas progressivas</h3>
              <span className="text-xs text-slate-500">{revealed}/{lab.hints.length}</span>
            </div>
            <ol className="space-y-2">
              {lab.hints.slice(0, revealed).map((h, i) => (
                <li key={i} className="rounded-md bg-slate-800/50 px-3 py-2 text-sm text-slate-300">{i + 1}. {h}</li>
              ))}
            </ol>
            {revealed < lab.hints.length && (
              <button onClick={() => setRevealed((r) => r + 1)}
                className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors">
                Revelar dica {revealed + 1}
              </button>
            )}
          </section>
        </div>
      )}

      {tab === 'atacar' && (
        <div className="space-y-4">
          {status === 'ok' ? (
            <div className="rounded-lg border border-[var(--color-defense)]/40 bg-[var(--color-defense)]/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-defense)]">
                <CheckCircle2 size={18} aria-hidden="true" /> Exploração concluída. Agora vem a parte que te torna um dev melhor.
              </p>
              <p className="mt-1 text-sm text-slate-300">Entenda por que a falha existe e como blindá-la no código.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setTab('causa')} className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors">Ver a causa-raiz</button>
                <button onClick={() => setTab('correcao')} className="rounded-md border border-[var(--color-defense)]/40 bg-[var(--color-defense)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-defense)] hover:brightness-110 transition">Aprender a correção ▸</button>
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-xs text-slate-400">
              <Terminal size={14} className="text-[var(--color-offense)]" aria-hidden="true" />
              Workbench de interceptação — edite a requisição HTTP crua e dispare contra o alvo. A flag aparece realçada na resposta. Atalho: Ctrl/⌘ + Enter.
            </p>
          )}
          <HttpRepeater examples={lab.exampleRequests} onFlagDetected={(f) => submit(f)} />
          <ExploitToolkit featured={lab.tools} />
          <details className="group rounded-lg border border-slate-800 bg-slate-900/40">
            <summary className="cursor-pointer list-none px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 flex items-center gap-2">
              <Flag size={14} aria-hidden="true" /> Submeter flag manualmente
              <span className="ml-auto text-xs text-slate-400 group-open:hidden">(ou use “Capturar flag” acima)</span>
            </summary>
            <div className="px-4 pb-4">
              <FlagBox value={flagInput} onChange={setFlagInput} onSubmit={() => submit()} status={status}
                hintsLeft={lab.hints.length - revealed} onNeedHint={() => setTab('missao')} />
            </div>
          </details>
        </div>
      )}

      {tab === 'causa' && (
        <div className="space-y-4">
          <section className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4">
            <h3 className="mb-1.5 text-sm font-semibold text-rose-300">Causa-raiz</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{lab.writeup.rootCause}</p>
          </section>
          <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="mb-1.5 text-sm font-semibold text-slate-200">Impacto no negócio</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{lab.writeup.impact}</p>
          </section>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-rose-300 flex items-center gap-1.5"><Bug size={15} /> Código vulnerável (como o dev escreveu)</h3>
            <CodeBlock code={lab.writeup.vulnerableCode} language={lab.writeup.vulnerableLanguage} label={`❌ vulnerável · ${lab.writeup.vulnerableLanguage}`} />
          </div>
        </div>
      )}

      {tab === 'correcao' && (
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-emerald-300 flex items-center gap-1.5"><ShieldCheck size={15} /> Correção (secure coding)</h3>
            <CodeBlock code={lab.writeup.secureCode} language={lab.writeup.secureLanguage} label={`✅ seguro · ${lab.writeup.secureLanguage}`} />
          </div>
          <section className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-emerald-300">Checklist de remediação</h3>
            <ul className="space-y-1.5">
              {lab.writeup.remediation.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" /> {r}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === 'refs' && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold text-sky-300 flex items-center gap-1.5"><BookOpen size={15} /> Referências técnicas</h3>
          <ul className="space-y-2">
            {lab.references.map((ref) => (
              <li key={ref.url}>
                <a href={ref.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-sky-300 hover:text-sky-200 hover:underline">
                  <ExternalLink size={14} /> {ref.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FlagBox({ value, onChange, onSubmit, status, hintsLeft = 0, onNeedHint }: {
  value: string; onChange: (v: string) => void; onSubmit: () => void; status: 'idle' | 'wrong' | 'ok';
  hintsLeft?: number; onNeedHint?: () => void;
}) {
  const invalid = status === 'wrong';
  return (
    <div className={`rounded-lg border p-4 ${status === 'ok' ? 'border-[var(--color-defense)]/40 bg-[var(--color-defense)]/10' : 'border-slate-800 bg-slate-900/40'}`}>
      <h3 className="mb-2 text-sm font-semibold text-slate-200 flex items-center gap-1.5"><Flag size={15} aria-hidden="true" /> Submeter flag</h3>
      {status === 'ok' ? (
        <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-defense)]"><CheckCircle2 size={16} aria-hidden="true" /> Flag correta! Laboratório concluído.</p>
      ) : (
        <>
          <div className="flex gap-2">
            <input value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              aria-label="Flag capturada" aria-invalid={invalid} aria-describedby={invalid ? 'flag-error' : undefined}
              className={`flex-1 rounded-md border bg-slate-900 px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none ${invalid ? 'border-rose-500' : 'border-slate-700 focus:border-[var(--color-defense)]'}`}
              placeholder="CYBER{...}" />
            <button onClick={onSubmit}
              className="rounded-md bg-[var(--color-defense)] px-4 py-2 text-sm font-semibold text-[#06110c] hover:brightness-110 transition">
              Validar
            </button>
          </div>
          {invalid && (
            <div id="flag-error" role="alert" className="mt-2 rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-200">
              <p className="font-medium text-rose-300">Ainda não é essa.</p>
              <p className="mt-0.5 text-slate-300">A flag é o valor no formato <code className="font-mono text-slate-100">CYBER{'{...}'}</code> que aparece <strong>realçado na resposta</strong> depois do exploit certo. Confira se copiou o valor completo.</p>
              {hintsLeft > 0 && onNeedHint && (
                <button onClick={onNeedHint} className="mt-1.5 inline-flex items-center gap-1 text-amber-300 hover:text-amber-200">
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
