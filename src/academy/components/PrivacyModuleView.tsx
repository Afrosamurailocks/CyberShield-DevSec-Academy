import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, ExternalLink, Gavel, Lock, Scale, ShieldCheck, Target, XCircle, Lightbulb } from 'lucide-react';
import type { PrivacyModule, PrivacyProgress } from '../types';
import { answerTrail } from '../api';
import { Panel, Pill } from './ui';
import { RichText, Prose, Inline } from './RichText';
import { PrivacyNotice } from './PrivacyHome';
import type { TrailConfig } from '../trails';
import { PrivacyCaseCard } from './PrivacyCaseCard';
import { ModuleDiagram, ScenarioVisualView } from './PrivacyVisuals';

type Tab = 'contexto' | 'caso' | 'decida' | 'entenda' | 'praticas' | 'refs';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'contexto', label: 'Contexto', icon: <BookOpen size={15} aria-hidden="true" /> },
  { id: 'caso', label: 'Caso real', icon: <Gavel size={15} aria-hidden="true" /> },
  { id: 'decida', label: 'Decida', icon: <Target size={15} aria-hidden="true" /> },
  { id: 'entenda', label: 'Entenda', icon: <Lightbulb size={15} aria-hidden="true" /> },
  { id: 'praticas', label: 'Boas práticas', icon: <ShieldCheck size={15} aria-hidden="true" /> },
  { id: 'refs', label: 'Referências', icon: <Scale size={15} aria-hidden="true" /> },
];

const ACCENT = 'text-sky-300';
const BTN = 'inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors';

function Fact({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="px-4 py-2.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-[13px] text-slate-100">{children}</dd>
    </div>
  );
}

function Locked({ onGo }: Readonly<{ onGo: () => void }>) {
  return (
    <Panel>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Lock size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
        <p className="flex-1 text-sm text-slate-400">
          Este conteúdo explica as respostas dos cenários. Ele libera depois que você resolver todos os cenários da aba Decida, para a decisão ser sua.
        </p>
        <button onClick={onGo} className={`${BTN} border border-[var(--color-line)] text-slate-200 hover:bg-[var(--color-surface-2)]`}>Ir para Decida</button>
      </div>
    </Panel>
  );
}

export function PrivacyModuleView({ config, module: mod, progress, onComplete, onBack }: Readonly<{
  config: TrailConfig;
  module: PrivacyModule;
  progress: PrivacyProgress;
  onComplete: (scenarioId: string, attempts: number) => void;
  onBack: () => void;
}>) {
  const [tab, setTab] = useState<Tab>('contexto');
  const tabs = useMemo(() => TABS.filter((t) => t.id !== 'caso' || (mod.cases?.length ?? 0) > 0), [mod.cases]);
  const doneCount = mod.scenarios.filter((s) => progress.done[s.id]).length;
  const finished = doneCount === mod.scenarios.length;
  const firstOpen = Math.max(0, mod.scenarios.findIndex((s) => !progress.done[s.id]));
  const [idx, setIdx] = useState(firstOpen);

  // estado do cenário ativo
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const activeScenario = useRef('');
  const [netError, setNetError] = useState(false);

  const scenario = mod.scenarios[Math.min(idx, mod.scenarios.length - 1)];
  const scenarioDone = Boolean(progress.done[scenario.id]);
  activeScenario.current = scenario.id;
  const nextOpen = useMemo(() => mod.scenarios.findIndex((s, i) => i !== idx && !progress.done[s.id]), [mod.scenarios, idx, progress]);

  const reset = () => { inFlight.current = false; setPicked(null); setWrong([]); setResult(null); setAttempts(0); setNetError(false); };

  const choose = async (i: number) => {
    // ref (síncrono) evita contar duas vezes um duplo clique; o state `busy` só atualiza a tela
    if (inFlight.current || wrong.includes(i) || result?.correct) return;
    inFlight.current = true;
    const sid = scenario.id;
    setBusy(true); setNetError(false); setPicked(i);
    try {
      const r = await answerTrail(config.kind, mod.id, sid, i);
      // resposta atrasada de outro cenário (o aluno trocou no stepper): ignora
      if (activeScenario.current !== sid) return;
      const n = attempts + 1;
      setAttempts(n);
      setResult(r);
      if (r.correct) onComplete(scenario.id, n);
      else setWrong((w) => [...w, i]);
    } catch {
      setNetError(true);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const goNext = () => {
    if (nextOpen >= 0) { setIdx(nextOpen); reset(); } else { setTab('entenda'); }
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = tabs[(i + step + tabs.length) % tabs.length];
    setTab(next.id);
    document.getElementById(`ptab-${next.id}`)?.focus();
  };

  return (
    <div className="mx-auto max-w-[1180px] space-y-5">
      <button onClick={onBack}
        className="inline-flex min-h-9 items-center gap-1.5 rounded text-sm text-slate-400 transition-colors hover:text-slate-100">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar a {config.title}
      </button>

      <header className="overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex">
          <span className={`w-1 shrink-0 ${config.bar}`} aria-hidden="true" />
          <div className="min-w-0 flex-1 px-5 py-4">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span className="font-mono font-semibold text-slate-200">{mod.code ?? config.codePrefix + String(mod.order).padStart(2, '0')}</span>
              <span>{config.title}</span>
              {finished && (
                <Pill className="border-[var(--color-defense)]/40 text-[var(--color-defense)]">
                  <CheckCircle2 size={12} aria-hidden="true" /> Concluído
                </Pill>
              )}
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold text-slate-100">{mod.title}</h1>
            <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-slate-400">{mod.summary}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-y divide-[var(--color-line)] border-t border-[var(--color-line)] sm:grid-cols-3 sm:divide-y-0">
          <Fact label="Duração estimada">{mod.minutes} min</Fact>
          <Fact label="Cenários">{doneCount}/{mod.scenarios.length} resolvidos</Fact>
          <Fact label={config.refLabel}><span className="text-xs leading-snug text-slate-300">{mod.legalBasis}</span></Fact>
        </dl>
      </header>

      <div role="tablist" aria-label="Etapas do módulo"
        className="sticky top-[53px] z-10 flex flex-wrap gap-1 border-b border-[var(--color-line)] bg-[var(--color-ink)]/95 backdrop-blur lg:top-0">
        {tabs.map((t, i) => (
          <button key={t.id} id={`ptab-${t.id}`} role="tab" aria-selected={tab === t.id} aria-controls="privacy-panel"
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)} onKeyDown={(e) => onTabKey(e, i)}
            className={`-mb-px flex min-h-10 items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors ${
              tab === t.id ? 'border-[var(--color-offense)] text-slate-100' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div id="privacy-panel" role="tabpanel" aria-labelledby={`ptab-${tab}`} className="space-y-4">
        {tab === 'contexto' && (
          <>
          {mod.diagram && (
            <Panel title="Visão rápida" tone="info" icon={<Lightbulb size={15} className="text-sky-400" aria-hidden="true" />}>
              <ModuleDiagram kind={mod.diagram} />
            </Panel>
          )}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <Panel title="Contexto" tone="info" icon={<BookOpen size={15} className="text-sky-400" aria-hidden="true" />}>
              <RichText text={mod.context} accent={ACCENT} />
            </Panel>
            <div className="min-w-0 space-y-4">
              <Panel title={`Como este ${config.unit} funciona`} tone="defense">
                <ol className="space-y-2 text-sm text-slate-300">
                  <li className="flex gap-3"><span className="font-mono text-xs text-[var(--color-offense-soft)]">1</span><span>Leia o contexto.</span></li>
                  <li className="flex gap-3"><span className="font-mono text-xs text-[var(--color-offense-soft)]">2</span><span>Decida em {mod.scenarios.length} cenários.</span></li>
                  <li className="flex gap-3"><span className="font-mono text-xs text-[var(--color-offense-soft)]">3</span><span>Entenda o porquê e fixe as boas práticas.</span></li>
                </ol>
                <button onClick={() => setTab('decida')} className={`${BTN} mt-4 bg-[var(--color-offense)] text-slate-950 hover:bg-[var(--color-offense-soft)]`}>
                  Ir para os cenários
                </button>
              </Panel>
              {(mod.cases?.length ?? 0) > 0 && (
                <Panel title="Caso real neste módulo" tone="warn">
                  <p className="text-sm leading-relaxed text-slate-300">Veja como isso aconteceu na prática, com fonte pública.</p>
                  <button onClick={() => setTab('caso')} className={`${BTN} mt-3 border border-[var(--color-line)] text-slate-100 hover:bg-[var(--color-surface-2)]`}>Ver o caso</button>
                </Panel>
              )}
              {mod.safeguards && mod.safeguards.length > 0 && (
                <Panel title={config.keyItemsLabel} tone="info" icon={<ShieldCheck size={15} className="text-sky-400" aria-hidden="true" />}>
                  <ul className="space-y-2">
                    {mod.safeguards.map((g) => (
                      <li key={g.id} className="flex gap-3 text-sm leading-snug text-slate-300">
                        <span className="mt-px min-w-11 shrink-0 rounded border border-violet-400/40 bg-violet-400/10 px-1 py-px text-center font-mono text-xs text-violet-200">{g.id}</span>
                        <span className="min-w-0">{g.title}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">{config.keyItemsNote}</p>
                </Panel>
              )}
              <PrivacyNotice config={config} />
            </div>
          </div>
          </>
        )}

        {tab === 'caso' && (
          <div className="space-y-5">
            <p className="max-w-[70ch] text-sm leading-relaxed text-slate-400">
              Casos reais de fonte pública, resumidos para treinamento. Os números e fatos vêm das fontes citadas em cada caso; onde elas divergem ou faltam informações, isso aparece em "Limites da fonte".
            </p>
            {mod.cases?.map((c) => <PrivacyCaseCard key={c.id} item={c} />)}
            <button onClick={() => setTab('decida')} className={`${BTN} bg-[var(--color-offense)] text-slate-950 hover:bg-[var(--color-offense-soft)]`}>Ir para os cenários</button>
          </div>
        )}

        {tab === 'decida' && (
          <div className="mx-auto max-w-[820px] space-y-4">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Progresso dos cenários">
              {mod.scenarios.map((s, i) => {
                const d = Boolean(progress.done[s.id]);
                const current = i === idx;
                return (
                  <li key={s.id} className="flex items-center gap-2">
                    <button onClick={() => { setIdx(i); reset(); }} aria-current={current ? 'step' : undefined}
                      aria-label={`Cenário ${i + 1}${d ? ', resolvido' : ''}`}
                      className={`grid h-8 w-8 place-items-center rounded-full border font-mono text-xs font-semibold transition-colors ${
                        d ? 'border-[var(--color-defense)] bg-[var(--color-defense)] text-[#06110c]'
                          : current ? 'border-[var(--color-offense)] text-slate-100' : 'border-[var(--color-line)] text-slate-400 hover:text-slate-200'}`}>
                      {d ? <CheckCircle2 size={15} aria-hidden="true" /> : i + 1}
                    </button>
                    {i < mod.scenarios.length - 1 && <span className="h-px w-3 bg-[var(--color-line)]" aria-hidden="true" />}
                  </li>
                );
              })}
            </ol>

            {finished && (
              <div className="rounded-md border border-[var(--color-defense)]/40 bg-[var(--color-defense)]/10 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-defense)]">
                  <CheckCircle2 size={18} aria-hidden="true" /> Módulo concluído. Agora entenda o porquê das respostas.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setTab('entenda')} className={`${BTN} border border-[var(--color-line)] text-slate-100 hover:bg-[var(--color-surface-2)]`}>Entender as respostas</button>
                  <button onClick={() => setTab('praticas')} className={`${BTN} border border-[var(--color-line)] text-slate-100 hover:bg-[var(--color-surface-2)]`}>Ver boas práticas</button>
                </div>
              </div>
            )}

            <Panel title={`Cenário ${idx + 1} de ${mod.scenarios.length}`} tone="warn">
              <Prose text={scenario.situation} className="text-slate-200" />
              {scenario.visual && <div className="mt-4"><ScenarioVisualView visual={scenario.visual} /></div>}
              <p className="mt-4 font-display text-base font-semibold text-slate-100">{scenario.question}</p>

              <ul className="mt-3 space-y-2" aria-label="Opções de resposta">
                {scenario.options.map((o, i) => {
                  const isWrong = wrong.includes(i);
                  const isRight = Boolean(result?.correct) && picked === i;
                  const locked = isWrong || Boolean(result?.correct) || scenarioDone || busy;
                  let style = 'border-[var(--color-line)] bg-[var(--color-ink)]/40 text-slate-200 hover:border-slate-500 hover:bg-[var(--color-surface-2)]';
                  if (isRight) style = 'border-[var(--color-defense)] bg-[var(--color-defense)]/10 text-slate-100';
                  else if (isWrong) style = 'border-rose-400/50 bg-rose-400/5 text-slate-400';
                  return (
                    <li key={o.text}>
                      <button onClick={() => choose(i)} disabled={locked}
                        className={`flex min-h-12 w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-[15px] leading-relaxed transition-colors disabled:cursor-default ${style}`}>
                        <span className="mt-0.5 shrink-0" aria-hidden="true">
                          {isRight ? <CheckCircle2 size={17} className="text-[var(--color-defense)]" />
                            : isWrong ? <XCircle size={17} className="text-rose-400" />
                              : <span className="grid h-[17px] w-[17px] place-items-center rounded-full border border-slate-500 font-mono text-[10px] text-slate-400">{String.fromCharCode(65 + i)}</span>}
                        </span>
                        <span className="min-w-0 flex-1"><Inline text={o.text} /></span>
                        {isRight && <span className="sr-only">Resposta correta</span>}
                        {isWrong && <span className="sr-only">Resposta incorreta</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div role="status" aria-live="polite">
                {netError && (
                  <p className="mt-3 rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-sm text-rose-200">
                    Não foi possível validar a resposta. Confirme se o backend (API :4000) está rodando e tente de novo.
                  </p>
                )}
                {result && (
                  <div className={`mt-3 rounded-md border px-4 py-3 text-sm leading-relaxed ${
                    result.correct ? 'border-[var(--color-defense)]/40 bg-[var(--color-defense)]/10 text-slate-200' : 'border-amber-400/40 bg-amber-400/5 text-slate-200'}`}>
                    <p className={`mb-1 font-semibold ${result.correct ? 'text-[var(--color-defense)]' : 'text-amber-300'}`}>
                      {result.correct ? 'Resposta correta' : 'Ainda não é essa. Releia e tente outra opção.'}
                    </p>
                    <Inline text={result.feedback} />
                  </div>
                )}
              </div>

              {result?.correct && (
                <button onClick={goNext} className={`${BTN} mt-4 bg-[var(--color-offense)] text-slate-950 hover:bg-[var(--color-offense-soft)]`}>
                  {nextOpen >= 0 ? 'Próximo cenário' : 'Concluir e entender as respostas'}
                </button>
              )}
              {scenarioDone && !result && (
                <p className="mt-3 text-sm text-slate-500">Cenário já resolvido. Escolha outro no topo ou avance para a aba Entenda.</p>
              )}
            </Panel>
          </div>
        )}

        {tab === 'entenda' && (finished ? (
          <Panel title="Por que essas são as respostas certas" tone="defense">
            <RichText text={mod.understand} accent={ACCENT} />
          </Panel>
        ) : <Locked onGo={() => setTab('decida')} />)}

        {tab === 'praticas' && (finished ? (
          <Panel title="Boas práticas do dia a dia" tone="defense">
            <ul className="max-w-[70ch] space-y-3">
              {mod.goodPractices.map((p) => (
                <li key={p} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-300">
                  <CheckCircle2 size={16} className="mt-1 shrink-0 text-[var(--color-defense)]" aria-hidden="true" /> <span><Inline text={p} /></span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : <Locked onGo={() => setTab('decida')} />)}

        {tab === 'refs' && (
          <Panel title="Referências e para se aprofundar" tone="info" icon={<Scale size={15} className="text-sky-400" aria-hidden="true" />}>
            <ul className="divide-y divide-[var(--color-line-soft)]">
              {mod.references.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer"
                    className="flex min-h-10 items-center gap-2 text-sm text-sky-300 transition-colors hover:text-sky-200 hover:underline">
                    <ExternalLink size={14} className="shrink-0" aria-hidden="true" /> {r.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">Cursos externos: confirme vagas, certificado e carga horária na página oficial de cada plataforma.</p>
          </Panel>
        )}
      </div>
    </div>
  );
}
