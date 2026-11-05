import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Circle } from 'lucide-react';
import type { Lab } from '../types';
import { OWASP_META, byKillChainOrder } from './ui';

type Filter = 'todos' | 'pendentes' | 'concluidos';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendentes', label: 'Pendentes' },
  { id: 'concluidos', label: 'Concluídos' },
];

const DIFFICULTY: Record<string, { label: string; dot: string }> = {
  Iniciante: { label: 'Iniciante', dot: 'bg-emerald-400' },
  Intermediario: { label: 'Intermediário', dot: 'bg-amber-400' },
  Avancado: { label: 'Avançado', dot: 'bg-rose-400' },
};

/** Catálogo em lista densa: leitura por colunas, uma linha por laboratório. */
export function LabCatalog({ labs, solvedIds, onOpen }: {
  labs: Lab[]; solvedIds: Set<string>; onOpen: (lab: Lab) => void;
}) {
  const [filter, setFilter] = useState<Filter>('todos');
  const ordered = byKillChainOrder(labs)
    .filter((l) => filter === 'todos' || (filter === 'concluidos') === solvedIds.has(l.id));

  return (
    <section aria-labelledby="catalog-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="catalog-title" className="text-lg font-semibold">Laboratórios</h3>
          <p className="text-xs text-slate-500">Falhas reais das categorias OWASP Top 10:2025 (SSRF faz parte do A01), na ordem em que a intrusão acontece.</p>
        </div>
        <div role="group" aria-label="Filtrar laboratórios" className="flex rounded-md border border-[var(--color-line)] p-0.5">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
              className={`min-h-8 rounded px-3 text-xs font-medium transition-colors ${
                filter === f.id ? 'bg-[var(--color-surface-2)] text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {ordered.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--color-line)] px-4 py-10 text-center text-sm text-slate-500">
          {filter === 'concluidos' ? 'Nenhum laboratório concluído ainda. Abra o próximo laboratório para começar.' : 'Nenhum laboratório pendente.'}
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
          <div className="hidden grid-cols-[64px_minmax(0,1.6fr)_minmax(0,1.2fr)_120px_96px_72px_24px] items-center gap-4 border-b border-[var(--color-line)] bg-[var(--color-surface-2)]/50 px-4 py-2 text-xs font-medium text-slate-500 md:grid">
            <span>ID</span><span>Laboratório</span><span>Categoria</span><span>Nível</span><span>CWE</span><span className="text-right">Pontos</span><span />
          </div>
          <ul className="divide-y divide-[var(--color-line)]">
            {ordered.map((lab) => {
              const meta = OWASP_META[lab.owaspId];
              const done = solvedIds.has(lab.id);
              const diff = DIFFICULTY[lab.difficulty] ?? DIFFICULTY.Iniciante;
              return (
                <li key={lab.id}>
                  <button onClick={() => onOpen(lab)}
                    className="group grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-2)] md:grid-cols-[64px_minmax(0,1.6fr)_minmax(0,1.2fr)_120px_96px_72px_24px]">
                    <span className="flex items-center gap-2">
                      <span className={`h-4 w-0.5 rounded-full ${meta.accent}`} aria-hidden="true" />
                      <span className="font-mono text-xs font-medium text-slate-300">{lab.owaspId}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-100">{lab.title}</span>
                        {done
                          ? <CheckCircle2 size={14} className="shrink-0 text-[var(--color-defense)]" aria-label="Resolvido" />
                          : <Circle size={12} className="shrink-0 text-slate-600" aria-label="Não resolvido" />}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500 md:hidden">{lab.owaspTitle} · {diff.label} · {lab.cwe}</span>
                    </span>
                    <span className="hidden truncate text-[13px] text-slate-400 md:block">{lab.owaspTitle}</span>
                    <span className="hidden items-center gap-2 text-[13px] text-slate-300 md:flex">
                      <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} aria-hidden="true" />{diff.label}
                    </span>
                    <span className="hidden font-mono text-xs text-slate-400 md:block">{lab.cwe}</span>
                    <span className="text-right font-mono text-[13px] tabular-nums text-slate-300">{lab.points}</span>
                    <ChevronRight size={14} className="hidden text-slate-600 transition-colors group-hover:text-slate-300 md:block" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
