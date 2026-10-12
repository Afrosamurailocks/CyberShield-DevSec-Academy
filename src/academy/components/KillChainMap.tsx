import React from 'react';
import { ArrowDown, CheckCircle2, Crosshair, Target } from 'lucide-react';
import type { Lab } from '../types';
import { OWASP_META } from './ui';

/** Mapa da kill chain: ordena os labs pela etapa e mostra o que cada um entrega/usa. */
export function KillChainMap({ labs, solvedIds, onOpen }: {
  labs: Lab[]; solvedIds: Set<string>; onOpen: (lab: Lab) => void;
}) {
  const chain = labs
    .filter((l) => l.killChain)
    .sort((a, b) => (a.killChain!.step - b.killChain!.step));
  if (!chain.length) return null;

  return (
    <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center gap-2">
        <Crosshair size={18} className="text-[var(--color-offense)]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-100">Kill chain — o achado de um lab alimenta o próximo</h3>
      </div>
      <p className="mt-0.5 text-[13px] text-slate-400">Resolva na ordem para viver um ataque encadeado real: foothold → credenciais → escalonamento → pivot → RCE → cobrir rastros. Cada lab também é resolvível de forma independente.</p>

      <ol className="mt-4 space-y-1">
        {chain.map((lab, i) => {
          const meta = OWASP_META[lab.owaspId];
          const done = solvedIds.has(lab.id);
          return (
            <li key={lab.id}>
              <button onClick={() => onOpen(lab)}
                className={`group flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  done ? 'border-[var(--color-defense)]/40 bg-[var(--color-defense)]/5' : 'border-[var(--color-line)] bg-[var(--color-ink)]/40 hover:border-slate-600'}`}>
                <span className="relative flex flex-col items-center">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                    done ? 'bg-[var(--color-defense)] text-[#06110c]' : 'bg-[var(--color-surface-2)] text-slate-300 ring-1 ring-[var(--color-line)]'}`}>
                    {lab.killChain!.step}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded ${meta.accent} px-1.5 py-0.5 text-[10px] font-bold text-slate-950`}>{lab.owaspId}</span>
                    <span className="truncate text-[13px] font-semibold text-slate-100">{lab.title}</span>
                    {done && <CheckCircle2 size={14} className="shrink-0 text-[var(--color-defense)]" aria-label="resolvido" />}
                  </div>
                  {lab.killChain!.uses && (
                    <p className="mt-1 text-[11.5px] text-sky-300/90"><span className="font-semibold">usa:</span> {lab.killChain!.uses}</p>
                  )}
                  {lab.killChain!.provides && (
                    <p className="mt-0.5 text-[11.5px] text-[var(--color-offense-soft)]"><span className="font-semibold">entrega:</span> {lab.killChain!.provides}</p>
                  )}
                </div>
                <Target size={14} className="mt-1 shrink-0 text-slate-600 group-hover:text-[var(--color-offense)] transition-colors" aria-hidden="true" />
              </button>
              {i < chain.length - 1 && (
                <div className="flex justify-center py-0.5" aria-hidden="true">
                  <ArrowDown size={14} className="text-slate-600" />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
