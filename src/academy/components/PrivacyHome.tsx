import React from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, Circle, Info } from 'lucide-react';
import type { PrivacyModule, PrivacyProgress } from '../types';
import type { TrailConfig } from '../trails';
import { Metric } from './Dashboard';

/** Aviso padrão da trilha (rascunho, não é parecer jurídico). */
export function PrivacyNotice({ config }: Readonly<{ config: TrailConfig }>) {
  return (
    <div className="flex items-start gap-2 border-l-2 border-sky-400/70 bg-[var(--color-surface)] px-3 py-2 text-xs leading-relaxed text-slate-400">
      <Info size={13} className="mt-0.5 shrink-0 text-sky-400" aria-hidden="true" />
      <span>
        Conteúdo educativo e <strong className="font-semibold text-slate-200">{config.noticeLead}</strong> {config.noticeRest}
      </span>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Visão geral da trilha de Privacidade e LGPD: lista densa, uma linha por módulo. */
export function PrivacyHome({ config, modules, progress, doneModuleIds, onOpen, onOpenLab, finalLab }: Readonly<{
  config: TrailConfig;
  modules: PrivacyModule[];
  progress: PrivacyProgress;
  doneModuleIds: Set<string>;
  onOpen: (m: PrivacyModule) => void;
  /** Abre o laboratório prático da trilha (só LLM). */
  onOpenLab?: () => void;
  /** Avaliação final da trilha (LLM): flags capturadas no Laboratório de prompts. */
  finalLab?: { solved: number; total: number };
}>) {
  const totalScenarios = modules.reduce((s, m) => s + m.scenarios.length, 0);
  const doneScenarios = Object.keys(progress.done).filter((id) => modules.some((m) => m.scenarios.some((s) => s.id === id))).length;
  const next = modules.find((m) => !doneModuleIds.has(m.id));
  const started = doneScenarios > 0;
  const minutes = modules.reduce((s, m) => s + m.minutes, 0);
  // avaliação final é obrigatória: LLM = Laboratório de prompts; demais trilhas = módulo "Avaliação final…"
  const finalMod = modules.find((m) => /^Avaliação final/i.test(m.title));
  const finalPending = finalLab?.total ? finalLab.solved < finalLab.total : Boolean(finalMod && !doneModuleIds.has(finalMod.id));

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">{config.title}</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-slate-400">
            {config.intro}
          </p>
        </div>
        {next && (
          <button onClick={() => onOpen(next)}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md bg-[var(--color-offense)] px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-[var(--color-offense-soft)]">
            {started ? 'Continuar' : 'Iniciar'} {config.unit} {next.code ?? config.codePrefix + pad(next.order)} <ArrowRight size={15} aria-hidden="true" />
          </button>
        )}
      </header>

      <PrivacyNotice config={config} />

      <dl className={`grid divide-y divide-[var(--color-line)] overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] sm:divide-x sm:divide-y-0 ${finalLab?.total ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <Metric label={`${config.unitPlural.charAt(0).toUpperCase()}${config.unitPlural.slice(1)} concluídos`} value={`${doneModuleIds.size}/${modules.length}`}
          detail={finalPending ? 'avaliação final pendente' : `${modules.length ? Math.round((doneModuleIds.size / modules.length) * 100) : 0}% da trilha`}
          progress={modules.length ? doneModuleIds.size / modules.length : 0} />
        <Metric label="Cenários resolvidos" value={`${doneScenarios}/${totalScenarios}`}
          detail="decisões corretas" progress={totalScenarios ? doneScenarios / totalScenarios : 0} />
        {finalLab?.total ? (
          <Metric label="Avaliação final" value={`${finalLab.solved}/${finalLab.total}`}
            detail={finalLab.solved >= finalLab.total ? 'flags capturadas no laboratório' : 'flags no Laboratório de prompts'}
            progress={finalLab.total ? finalLab.solved / finalLab.total : 0} />
        ) : null}
        <Metric label="Duração estimada" value={`${minutes} min`} detail="estimativa editorial, a validar no piloto" />
      </dl>

      <section aria-labelledby="privacy-modules">
        <h3 id="privacy-modules" className="mb-3 text-lg font-semibold">{config.unitPlural.charAt(0).toUpperCase()}{config.unitPlural.slice(1)}</h3>
        <div className="overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
          <div className="hidden grid-cols-[56px_minmax(0,1.5fr)_minmax(0,2fr)_84px_96px_24px] items-center gap-4 border-b border-[var(--color-line)] bg-[var(--color-surface-2)]/50 px-4 py-2 text-xs font-medium text-slate-500 md:grid">
            <span>ID</span><span>{config.unit.charAt(0).toUpperCase()}{config.unit.slice(1)}</span><span>O que você vai decidir</span><span>Duração</span><span>Situação</span><span />
          </div>
          <ul className="divide-y divide-[var(--color-line)]">
            {modules.map((m) => {
              const done = doneModuleIds.has(m.id);
              const solved = m.scenarios.filter((s) => progress.done[s.id]).length;
              return (
                <li key={m.id}>
                  <button onClick={() => onOpen(m)}
                    className="group grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-2)] md:grid-cols-[56px_minmax(0,1.5fr)_minmax(0,2fr)_84px_96px_24px]">
                    <span className="flex items-center gap-2">
                      <span className={`h-4 w-0.5 rounded-full ${config.bar}`} aria-hidden="true" />
                      <span className="font-mono text-xs font-medium text-slate-300">{m.code ?? config.codePrefix + pad(m.order)}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-100">{m.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500 md:hidden">{m.minutes} min · {solved}/{m.scenarios.length} cenários</span>
                    </span>
                    <span className="hidden truncate text-[13px] text-slate-400 md:block">{m.summary}</span>
                    <span className="hidden font-mono text-xs text-slate-400 md:block">{m.minutes} min</span>
                    <span className="flex items-center gap-1.5 text-[13px] text-slate-300">
                      {done
                        ? <><CheckCircle2 size={14} className="text-[var(--color-defense)]" aria-hidden="true" /> Concluído</>
                        : <><Circle size={12} className="text-slate-600" aria-hidden="true" /> {solved > 0 ? `${solved}/${m.scenarios.length}` : 'Pendente'}</>}
                    </span>
                    <ChevronRight size={14} className="hidden text-slate-600 transition-colors group-hover:text-slate-300 md:block" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
            {onOpenLab && (() => {
              const total = finalLab?.total ?? 0, got = finalLab?.solved ?? 0;
              const finished = total > 0 && got >= total;
              return (
                <li key="final-lab">
                  <button onClick={onOpenLab}
                    className="group grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-2)] md:grid-cols-[56px_minmax(0,1.5fr)_minmax(0,2fr)_84px_96px_24px]">
                    <span className="flex items-center gap-2">
                      <span className={`h-4 w-0.5 rounded-full ${config.bar}`} aria-hidden="true" />
                      <span className="font-mono text-xs font-medium text-slate-300">LF</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-100">Avaliação final: Laboratório de prompts</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500 md:hidden">{total ? `${got}/${total} flags` : 'laboratório'}</span>
                    </span>
                    <span className="hidden truncate text-[13px] text-slate-400 md:block">Ataque 10 assistentes propositalmente vulneráveis (um por categoria OWASP LLM) e capture a flag de cada um.</span>
                    <span className="hidden font-mono text-xs text-slate-400 md:block">{total ? `${total} flags` : 'prático'}</span>
                    <span className="flex items-center gap-1.5 text-[13px] text-slate-300">
                      {finished
                        ? <><CheckCircle2 size={14} className="text-[var(--color-defense)]" aria-hidden="true" /> Concluído</>
                        : <><Circle size={12} className="text-slate-600" aria-hidden="true" /> {got > 0 ? `${got}/${total}` : 'Pendente'}</>}
                    </span>
                    <ChevronRight size={14} className="hidden text-slate-600 transition-colors group-hover:text-slate-300 md:block" aria-hidden="true" />
                  </button>
                </li>
              );
            })()}
          </ul>
        </div>
      </section>
    </div>
  );
}
