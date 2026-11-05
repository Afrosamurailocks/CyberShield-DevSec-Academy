import React from 'react';
import { ExternalLink, Gavel, Handshake, Siren, Info, CheckCircle2 } from 'lucide-react';
import type { PrivacyCase } from '../types';
import { Pill } from './ui';
import { Prose } from './RichText';

const KIND: Record<PrivacyCase['kind'], { label: string; icon: React.ReactNode; cls: string }> = {
  sancao: { label: 'Sanção', icon: <Gavel size={12} aria-hidden="true" />, cls: 'border-rose-400/40 text-rose-300' },
  acordo: { label: 'Acordo com autoridades', icon: <Handshake size={12} aria-hidden="true" />, cls: 'border-amber-400/40 text-amber-300' },
  incidente: { label: 'Incidente documentado', icon: <Siren size={12} aria-hidden="true" />, cls: 'border-sky-400/40 text-sky-300' },
};

/** Caso real: só fatos presentes nas fontes públicas citadas, com ressalvas explícitas. */
export function PrivacyCaseCard({ item }: Readonly<{ item: PrivacyCase }>) {
  const k = KIND[item.kind];
  return (
    <article className="surface-lit overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]" aria-labelledby={`case-${item.id}`}>
      <header className="border-b border-[var(--color-line-soft)] px-5 py-4">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400">
          <Pill className={k.cls}>{k.icon} {k.label}</Pill>
          <span>{item.authority}</span>
          <span className="text-slate-500">{item.date}</span>
        </p>
        <h3 id={`case-${item.id}`} className="mt-2 text-lg font-semibold text-slate-100">{item.title}</h3>
      </header>

      <dl className="grid grid-cols-1 divide-y divide-[var(--color-line)] border-b border-[var(--color-line)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {item.facts.map((f) => (
          <div key={f.label} className="px-5 py-3">
            <dt className="text-xs text-slate-500">{f.label}</dt>
            <dd className="mt-0.5 font-display text-lg font-semibold text-slate-100">{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 px-5 py-5 lg:grid-cols-2">
        <section>
          <h4 className="mb-1.5 flex items-center gap-2 font-display text-base font-semibold text-slate-100">
            <span className="h-4 w-0.5 rounded-full bg-sky-400" aria-hidden="true" /> O que aconteceu
          </h4>
          <Prose text={item.happened} />
        </section>
        <section>
          <h4 className="mb-1.5 flex items-center gap-2 font-display text-base font-semibold text-slate-100">
            <span className="h-4 w-0.5 rounded-full bg-amber-400" aria-hidden="true" /> Resultado
          </h4>
          <Prose text={item.outcome} />
        </section>
      </div>

      <section className="border-t border-[var(--color-line-soft)] px-5 py-5">
        <h4 className="mb-2 flex items-center gap-2 font-display text-base font-semibold text-slate-100">
          <span className="h-4 w-0.5 rounded-full bg-[var(--color-defense)]" aria-hidden="true" /> O que aprender
        </h4>
        <ul className="grid gap-2 md:grid-cols-2">
          {item.lessons.map((l) => (
            <li key={l} className="flex gap-2.5 rounded-md border border-[var(--color-line-soft)] bg-[var(--color-ink)]/40 px-3 py-2.5 text-sm leading-relaxed text-slate-300">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--color-defense)]" aria-hidden="true" /> <span>{l}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="space-y-3 border-t border-[var(--color-line-soft)] px-5 py-4">
        {item.caveat && (
          <p className="flex gap-2 border-l-2 border-amber-400/70 bg-[var(--color-ink)]/40 px-3 py-2 text-xs leading-relaxed text-slate-400">
            <Info size={13} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" /> <span><strong className="font-semibold text-slate-300">Limites da fonte:</strong> {item.caveat}</span>
          </p>
        )}
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Fontes públicas</p>
          <ul className="space-y-0.5">
            {item.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer"
                  className="inline-flex min-h-8 items-center gap-1.5 text-sm text-sky-300 transition-colors hover:text-sky-200 hover:underline">
                  <ExternalLink size={13} className="shrink-0" aria-hidden="true" /> {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </article>
  );
}
