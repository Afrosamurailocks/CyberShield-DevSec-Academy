import React, { memo } from 'react';
import { CheckCircle2, Trophy, LayoutGrid, Lock } from 'lucide-react';
import type { Lab } from '../types';
import { OWASP_META, ProgressRing, byKillChainOrder } from './ui';

interface SidebarProps {
  labs: Lab[];
  solvedIds: Set<string>;
  activeId: string | null;
  totalPoints: number;
  maxPoints: number;
  onSelect: (lab: Lab | null) => void;
  onNavigate?: () => void; // fecha o drawer no mobile
}

/** Navegação persistente estilo workbench: marca, progresso e lista de labs A01–A10. */
export const Sidebar = memo(function Sidebar({ labs, solvedIds, activeId, totalPoints, maxPoints, onSelect, onNavigate }: SidebarProps) {
  const ordered = byKillChainOrder(labs);
  const go = (lab: Lab | null) => { onSelect(lab); onNavigate?.(); };

  return (
    <nav aria-label="Navegação dos laboratórios" className="flex h-full flex-col bg-[var(--color-surface)]">
      {/* Marca */}
      <div className="border-b border-[var(--color-line)] px-4 py-4">
        <img src="/brand/opah-logo-white.png" alt="Opah IT" className="h-6 w-auto" />
        <div className="mt-3 min-w-0">
          <h1 className="truncate text-sm font-semibold leading-tight">CyberShield</h1>
          <p className="truncate text-[11px] leading-tight text-slate-400">DevSec Academy</p>
        </div>
      </div>

      {/* Progresso */}
      <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-4">
        <ProgressRing value={solvedIds.size} max={labs.length || 10} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
            <Trophy size={14} className="text-amber-400" aria-hidden="true" /> {totalPoints}<span className="text-slate-500">/{maxPoints} pts</span>
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">OWASP Top 10 · 2021</p>
        </div>
      </div>

      {/* Overview / dashboard */}
      <button onClick={() => go(null)}
        aria-current={activeId === null ? 'page' : undefined}
        className={`mx-2 mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          activeId === null ? 'bg-[var(--color-surface-2)] text-slate-100' : 'text-slate-400 hover:bg-[var(--color-surface-2)]/60 hover:text-slate-200'}`}>
        <LayoutGrid size={16} aria-hidden="true" /> Visão geral
      </button>

      {/* Lista de labs */}
      <div className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
        <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-500">Laboratórios (ordem de exploração)</p>
        <ul className="space-y-0.5">
          {ordered.map((lab) => {
            const done = solvedIds.has(lab.id);
            const active = lab.id === activeId;
            const meta = OWASP_META[lab.owaspId];
            return (
              <li key={lab.id}>
                <button onClick={() => go(lab)}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                    active ? 'bg-[var(--color-surface-2)]' : 'hover:bg-[var(--color-surface-2)]/60'}`}>
                  <span className={`grid h-6 w-9 shrink-0 place-items-center rounded ${meta.accent} text-[10px] font-bold text-slate-950`}>
                    {lab.owaspId}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[13px] font-medium ${active ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100'}`}>{lab.title}</span>
                    <span className="block truncate text-[10.5px] text-slate-500">{lab.owaspTitle}</span>
                  </span>
                  {done
                    ? <CheckCircle2 size={15} className="shrink-0 text-[var(--color-defense)]" aria-label="Resolvido" />
                    : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" aria-label="Não resolvido" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-[var(--color-line)] px-4 py-2.5 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><Lock size={11} aria-hidden="true" /> Treino local · backend vulnerável</span>
      </div>
    </nav>
  );
});
