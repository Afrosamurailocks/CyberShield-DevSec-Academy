import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Lab } from '../types';
import { LabCatalog } from './LabCatalog';
import { KillChainMap } from './KillChainMap';
import { byKillChainOrder } from './ui';

// Ciclo real de cada laboratório (sequência: a numeração aqui carrega informação).
const METHOD = [
  { title: 'Atacar', desc: 'Dispare requisições HTTP cruas contra o endpoint vulnerável, como no Burp. A flag aparece realçada na resposta.' },
  { title: 'Entender', desc: 'Veja a causa-raiz e o código exato que o desenvolvedor escreveu.' },
  { title: 'Corrigir', desc: 'Estude a versão segura e o checklist de remediação.' },
];

function Metric({ label, value, detail, progress }: { label: string; value: string; detail?: string; progress?: number }) {
  return (
    <div className="relative px-5 py-4">
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-100">{value}</dd>
      {detail && <dd className="mt-0.5 truncate text-xs text-slate-500">{detail}</dd>}
      {progress !== undefined && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-line)]" role="progressbar" aria-label={label}
          aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-[var(--color-defense)] transition-[width] duration-500" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
    </div>
  );
}

export function Dashboard({ labs, solvedIds, totalPoints, maxPoints, onOpen }: {
  labs: Lab[]; solvedIds: Set<string>; totalPoints: number; maxPoints: number; onOpen: (lab: Lab) => void;
}) {
  const pct = labs.length ? Math.round((solvedIds.size / labs.length) * 100) : 0;
  // Proximo passo segue a ordem REAL de exploracao (killChain.step), nao o numero
  // OWASP: o A08, por exemplo, exige um achado do A10, que vem depois dele na
  // numeracao. Ver byKillChainOrder em ./ui.tsx.
  const nextLab = byKillChainOrder(labs).find((l) => !solvedIds.has(l.id));

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">Visão geral</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            Dez falhas do OWASP Top 10 encadeadas em um pentest black-box. Explore cada vulnerabilidade, entenda a causa e aplique a correção.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a href="#kill-chain"
            className="inline-flex min-h-10 items-center rounded-md border border-[var(--color-line)] px-4 text-sm font-medium text-slate-300 transition-colors hover:bg-[var(--color-surface-2)] hover:text-slate-100">
            Kill chain
          </a>
          {nextLab && (
            <button onClick={() => onOpen(nextLab)}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--color-offense)] px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-[var(--color-offense-soft)]">
              {solvedIds.size === 0 ? 'Iniciar' : 'Continuar'} {nextLab.owaspId} <ArrowRight size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <dl className="grid divide-y divide-[var(--color-line)] overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Metric label="Laboratórios concluídos" value={`${solvedIds.size}/${labs.length}`} detail={`${pct}% do programa`} progress={labs.length ? solvedIds.size / labs.length : 0} />
        <Metric label="Pontuação" value={`${totalPoints}`} detail={`de ${maxPoints} pontos`} progress={maxPoints ? totalPoints / maxPoints : 0} />
        <Metric label="Próximo laboratório" value={nextLab ? nextLab.owaspId : '—'} detail={nextLab ? nextLab.title : 'Programa concluído'} />
      </dl>

      <section aria-labelledby="method-title">
        <h3 id="method-title" className="text-sm font-semibold text-slate-100">Ciclo de cada laboratório</h3>
        <ol className="mt-3 grid divide-y divide-[var(--color-line)] rounded-md border border-[var(--color-line)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {METHOD.map((s, i) => (
            <li key={s.title} className="px-5 py-4">
              <p className="flex items-baseline gap-2 text-sm font-semibold text-slate-100">
                <span className="font-mono text-xs font-medium text-[var(--color-offense)]">{i + 1}</span>{s.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <div id="kill-chain" className="scroll-mt-6">
        <KillChainMap labs={labs} solvedIds={solvedIds} onOpen={onOpen} />
      </div>

      <LabCatalog labs={labs} solvedIds={solvedIds} onOpen={onOpen} />
    </div>
  );
}
