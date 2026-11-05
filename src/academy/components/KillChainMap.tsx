import React from 'react';
import { CheckCircle2, Crosshair, Target } from 'lucide-react';
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
    <section className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center gap-2">
        <Crosshair size={18} className="text-[var(--color-offense)]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-100">Kill chain — o achado de um lab alimenta o próximo</h3>
      </div>
      <p className="mt-0.5 text-[13px] text-slate-400">Resolva na ordem para viver um ataque encadeado real: foothold → credenciais → escalonamento → pivot → RCE → cobrir rastros. Cada lab também é resolvível de forma independente.</p>

      {/* Trilho: a linha vertical é a cadeia; segmentos já percorridos ficam verdes. */}
      <ol className="mt-5">
        {chain.map((lab, i) => {
          const meta = OWASP_META[lab.owaspId];
          const done = solvedIds.has(lab.id);
          const last = i === chain.length - 1;
          const nextDone = !last && solvedIds.has(chain[i + 1].id);
          let railColor = 'bg-[var(--color-line)]';
          if (done) railColor = nextDone ? 'bg-[var(--color-defense)]' : 'bg-gradient-to-b from-[var(--color-defense)] to-[var(--color-line)]';
          return (
            <li key={lab.id} className="relative pl-11">
              {!last && (
                <span aria-hidden="true"
                  className={`absolute left-[13px] top-7 bottom-0 w-px ${railColor}`} />
              )}
              <span aria-hidden="true"
                className={`absolute left-0 top-1.5 grid h-7 w-7 place-items-center rounded-full border font-mono text-xs font-semibold ${
                  done ? 'border-[var(--color-defense)] bg-[var(--color-defense)] text-[#06110c]' : 'border-[var(--color-line)] bg-[var(--color-ink)] text-slate-300'}`}>
                {lab.killChain!.step}
              </span>
              <button onClick={() => onOpen(lab)}
                aria-label={`Passo ${lab.killChain!.step}: ${lab.owaspId} ${lab.title}${done ? ' (resolvido)' : ''}`}
                className="group mb-2 flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-[var(--color-surface-2)]">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-3.5 w-0.5 rounded-full ${meta.accent}`} aria-hidden="true" />
                    <span className="font-mono text-xs font-semibold text-slate-300">{lab.owaspId}</span>
                    <span className="truncate text-[13px] font-semibold text-slate-100">{lab.title}</span>
                    {done && <CheckCircle2 size={14} className="shrink-0 text-[var(--color-defense)]" aria-hidden="true" />}
                  </div>
                  {lab.killChain!.uses && (
                    <p className="mt-1 text-xs text-sky-300/90"><span className="font-semibold">Usa:</span> {lab.killChain!.uses}</p>
                  )}
                  {lab.killChain!.provides && (
                    <p className="mt-0.5 text-xs text-[var(--color-offense-soft)]"><span className="font-semibold">Entrega:</span> {lab.killChain!.provides}</p>
                  )}
                </div>
                <Target size={14} className="mt-1 shrink-0 text-slate-600 transition-colors group-hover:text-[var(--color-offense)]" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
