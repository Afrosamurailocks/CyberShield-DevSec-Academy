import React, { useMemo, useState, useCallback } from 'react';
import { Loader2, AlertTriangle, Menu, X } from 'lucide-react';
import type { Lab } from './academy/types';
import { useLabs, useProgress } from './academy/hooks';
import { Sidebar } from './academy/components/Sidebar';
import { Dashboard } from './academy/components/Dashboard';
import { LabView } from './academy/components/LabView';
import { ErrorBoundary } from './academy/components/ErrorBoundary';

export default function App() {
  const { labs, loading, error } = useLabs();
  const { progress, solve } = useProgress();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const solvedIds = useMemo(() => new Set(Object.keys(progress.solved)), [progress]);
  const totalPoints = useMemo(() => Object.values(progress.solved).reduce((s, v) => s + v.points, 0), [progress]);
  const maxPoints = useMemo(() => labs.reduce((s, l) => s + l.points, 0), [labs]);
  const active = useMemo(() => labs.find((l) => l.id === activeId) ?? null, [labs, activeId]);

  const select = useCallback((lab: Lab | null) => {
    setActiveId(lab?.id ?? null);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  const handleSolved = useCallback((flag: string, points: number) => {
    if (active) solve(active.id, flag, points);
  }, [active, solve]);

  const sidebar = (
    <Sidebar
      labs={labs}
      solvedIds={solvedIds}
      activeId={activeId}
      totalPoints={totalPoints}
      maxPoints={maxPoints}
      onSelect={select}
      onNavigate={() => setDrawerOpen(false)}
    />
  );

  return (
    <div className="min-h-screen bg-[var(--color-ink)] text-slate-100 font-sans selection:bg-[var(--color-offense)] selection:text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Sidebar fixa (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[var(--color-line)] lg:block">
          {sidebar}
        </aside>

        {/* Drawer (mobile) */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <div className="absolute left-0 top-0 h-full w-72 border-r border-[var(--color-line)] shadow-2xl">
              <button onClick={() => setDrawerOpen(false)} aria-label="Fechar menu"
                className="absolute right-2 top-3 z-10 rounded-md p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800">
                <X size={18} aria-hidden="true" />
              </button>
              {sidebar}
            </div>
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar mobile */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-surface)]/90 px-4 py-3 backdrop-blur lg:hidden">
            <button onClick={() => setDrawerOpen(true)} aria-label="Abrir menu de laboratórios"
              className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800">
              <Menu size={20} aria-hidden="true" />
            </button>
            <span className="text-sm font-bold">CyberShield DevSec Academy</span>
            <span className="ml-auto text-xs text-slate-400">{solvedIds.size}/{labs.length}</span>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {/* aviso de ambiente */}
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-[12px] text-amber-200/90">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
              <span>Backend <strong>propositalmente vulnerável</strong> — ambiente de treino, use apenas localmente.</span>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
                <Loader2 className="animate-spin" aria-hidden="true" /> Carregando laboratórios…
              </div>
            )}

            {error && (
              <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-center text-rose-200">
                <AlertTriangle className="mx-auto mb-2" aria-hidden="true" /> {error}
              </div>
            )}

            {!loading && !error && (
              <ErrorBoundary>
                {active ? (
                  <LabView
                    key={active.id}
                    lab={active}
                    solved={solvedIds.has(active.id)}
                    onBack={() => select(null)}
                    onSolved={handleSolved}
                  />
                ) : (
                  <Dashboard labs={labs} solvedIds={solvedIds} totalPoints={totalPoints} maxPoints={maxPoints} onOpen={select} />
                )}
              </ErrorBoundary>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
