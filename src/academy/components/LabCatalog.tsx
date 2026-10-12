import React from 'react';
import { CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';
import type { Lab } from '../types';
import { OWASP_META, DIFFICULTY_COLOR, Pill } from './ui';

export function LabCatalog({ labs, solvedIds, onOpen }: {
  labs: Lab[]; solvedIds: Set<string>; onOpen: (lab: Lab) => void;
}) {
  const ordered = [...labs].sort((a, b) => a.owaspId.localeCompare(b.owaspId));
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {ordered.map((lab) => {
        const meta = OWASP_META[lab.owaspId];
        const done = solvedIds.has(lab.id);
        return (
          <button key={lab.id} onClick={() => onOpen(lab)}
            className={`group text-left rounded-xl border bg-slate-900/40 p-4 transition-all hover:bg-slate-900/80 hover:-translate-y-0.5 ${
              done ? 'border-emerald-500/40' : 'border-slate-800 hover:border-slate-600'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center gap-1 rounded-md ${meta.accent} px-2 py-0.5 text-xs font-bold text-slate-950`}>
                {lab.owaspId}
              </span>
              {done
                ? <CheckCircle2 size={18} className="text-emerald-400" />
                : <ShieldAlert size={18} className="text-slate-600 group-hover:text-slate-400" />}
            </div>
            <h3 className="text-base font-semibold text-slate-100 leading-snug">{lab.title}</h3>
            <p className={`mt-0.5 text-xs font-medium ${meta.text}`}>{lab.owaspTitle}</p>
            <p className="mt-2 text-[13px] text-slate-400 line-clamp-2">{lab.objective}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Pill className={DIFFICULTY_COLOR[lab.difficulty]}>{lab.difficulty}</Pill>
              <Pill className="border-slate-700 bg-slate-800/50 text-slate-400">{lab.cwe}</Pill>
              <span className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-slate-300">
                {lab.points} pts <ChevronRight size={14} className="text-slate-500 group-hover:text-emerald-300 transition-colors" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
