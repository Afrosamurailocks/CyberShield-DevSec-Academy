import React from 'react';
import { Terminal, Bug, ShieldCheck, Target, Trophy, TrendingUp } from 'lucide-react';
import type { Lab } from '../types';
import { LabCatalog } from './LabCatalog';
import { KillChainMap } from './KillChainMap';

const METHOD = [
  { icon: <Terminal size={18} />, color: 'var(--color-offense)', title: '1 · Atacar', desc: 'Dispare requisições HTTP cruas contra o endpoint vulnerável, como no Burp. A flag aparece realçada na resposta.' },
  { icon: <Bug size={18} />, color: '#fb7185', title: '2 · Entender', desc: 'Veja a causa-raiz e o código exato que o dev escreveu errado.' },
  { icon: <ShieldCheck size={18} />, color: 'var(--color-defense)', title: '3 · Corrigir', desc: 'Estude a versão segura (secure coding) e o checklist de remediação.' },
];

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-2 text-slate-400">{icon}<span className="text-xs">{label}</span></div>
      <p className="mt-1.5 text-2xl font-bold text-slate-100">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

export function Dashboard({ labs, solvedIds, totalPoints, maxPoints, onOpen }: {
  labs: Lab[]; solvedIds: Set<string>; totalPoints: number; maxPoints: number; onOpen: (lab: Lab) => void;
}) {
  const pct = labs.length ? Math.round((solvedIds.size / labs.length) * 100) : 0;
  const nextLab = [...labs].sort((a, b) => a.owaspId.localeCompare(b.owaspId)).find((l) => !solvedIds.has(l.id));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Visão geral</h2>
        <p className="text-sm text-slate-400">Capacitação de desenvolvedores em segurança — aprenda atacando e corrigindo cada falha do OWASP Top 10.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={<Target size={15} className="text-sky-400" aria-hidden="true" />} label="Laboratórios" value={`${solvedIds.size}/${labs.length}`} sub={`${pct}% concluído`} />
        <StatCard icon={<Trophy size={15} className="text-amber-400" aria-hidden="true" />} label="Pontos" value={String(totalPoints)} sub={`de ${maxPoints} possíveis`} />
        <StatCard icon={<TrendingUp size={15} className="text-[var(--color-defense)]" aria-hidden="true" />} label="Próximo passo"
          value={nextLab ? nextLab.owaspId : '✓'} sub={nextLab ? nextLab.title : 'Tudo resolvido — parabéns!'} />
      </div>

      {/* Método em 3 passos */}
      <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <h3 className="text-sm font-semibold text-slate-100">Como funciona — o ciclo de cada laboratório</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {METHOD.map((s) => (
            <div key={s.title} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)]/40 p-3">
              <span className="grid h-8 w-8 place-items-center rounded-md" style={{ color: s.color, background: `color-mix(in oklab, ${s.color} 14%, transparent)` }} aria-hidden="true">{s.icon}</span>
              <h4 className="mt-2 text-sm font-semibold text-slate-100">{s.title}</h4>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <KillChainMap labs={labs} solvedIds={solvedIds} onOpen={onOpen} />

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-lg font-bold">Laboratórios</h3>
          <span className="text-xs text-slate-500">uma falha real por categoria OWASP</span>
        </div>
        <LabCatalog labs={labs} solvedIds={solvedIds} onOpen={onOpen} />
      </section>
    </div>
  );
}
