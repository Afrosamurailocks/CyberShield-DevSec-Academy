import React, { useMemo, useState, useCallback } from 'react';
import { Loader2, AlertTriangle, Menu, X } from 'lucide-react';
import type { Lab, PrivacyModule, AppArea } from './academy/types';
import { useLabs, useProgress, useTrail } from './academy/hooks';
import { TRAILS } from './academy/trails';
import { Sidebar } from './academy/components/Sidebar';
import { Dashboard } from './academy/components/Dashboard';
import { LabView } from './academy/components/LabView';
import { PrivacyHome } from './academy/components/PrivacyHome';
import { PrivacyModuleView } from './academy/components/PrivacyModuleView';
import { LlmLab } from './academy/components/LlmLab';
import { ChampionJourney } from './academy/components/ChampionJourney';
import { ErrorBoundary } from './academy/components/ErrorBoundary';

const LAB_ID = '__lab';

export default function App() {
  const { labs, loading, error } = useLabs();
  const { progress, solve } = useProgress();
  const privacyTrail = useTrail('privacy');
  const cisTrail = useTrail('cis');
  const isoTrail = useTrail('iso');
  const llmTrail = useTrail('llm');
  const [area, setArea] = useState<AppArea>('seguranca');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [champion, setChampion] = useState(() => new URLSearchParams(window.location.search).has('verificar'));

  const solvedIds = useMemo(() => new Set(Object.keys(progress.solved)), [progress]);
  const totalPoints = useMemo(() => Object.values(progress.solved).reduce((s, v) => s + v.points, 0), [progress]);
  const maxPoints = useMemo(() => labs.reduce((s, l) => s + l.points, 0), [labs]);
  const active = useMemo(() => labs.find((l) => l.id === activeId) ?? null, [labs, activeId]);

  const select = useCallback((lab: Lab | null) => {
    setChampion(false);
    setActiveId(lab?.id ?? null);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  const selectModule = useCallback((m: PrivacyModule | null) => {
    setChampion(false);
    setActiveModuleId(m?.id ?? null);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, []);
  const openLab = useCallback(() => { setChampion(false); setActiveModuleId(LAB_ID); setDrawerOpen(false); window.scrollTo({ top: 0 }); }, []);
  const isPrivacy = area !== 'seguranca';
  const trailKind = area === 'cis' ? 'cis' : area === 'iso' ? 'iso' : area === 'llm' ? 'llm' : 'privacy';
  const trail = { cis: cisTrail, iso: isoTrail, llm: llmTrail, privacy: privacyTrail }[trailKind];
  const trailConfig = TRAILS[trailKind];
  const pageLoading = isPrivacy ? trail.loading : loading;
  const pageError = isPrivacy ? trail.error : error;
  const activeModule = useMemo(() => trail.modules.find((m) => m.id === activeModuleId) ?? null, [trail.modules, activeModuleId]);

  const goArea = useCallback((a: AppArea, opts?: { lab?: boolean }) => {
    setChampion(false); setArea(a); setActiveId(null);
    setActiveModuleId(opts?.lab ? LAB_ID : null);
    setDrawerOpen(false); window.scrollTo({ top: 0 });
  }, []);

  const handleSolved = useCallback((flag: string, points: number) => {
    if (active) solve(active.id, flag, points);
  }, [active, solve]);

  const sidebar = (
    <Sidebar
      area={area}
      onArea={(a) => goArea(a)}
      champion={{ active: champion, onOpen: () => { setChampion(true); setDrawerOpen(false); window.scrollTo({ top: 0 }); } }}
      privacy={{ config: trailConfig, modules: trail.modules, doneIds: trail.doneModuleIds, activeId: activeModuleId, onSelect: selectModule,
        lab: area === 'llm' ? { label: 'Laboratório de prompts', active: activeModuleId === LAB_ID, onOpen: openLab } : undefined }}
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
    <div className="app-bg min-h-screen text-slate-100 font-sans selection:bg-[var(--color-offense)] selection:text-slate-950">
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
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
            <button onClick={() => setDrawerOpen(true)} aria-label="Abrir menu de navegação"
              className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800">
              <Menu size={20} aria-hidden="true" />
            </button>
            <img src="/brand/opah-logo-white.png" alt="Opah IT" className="h-5 w-auto" />
            <span className="text-sm font-semibold text-slate-300">CyberShield DevSec Academy</span>
            <span className="ml-auto text-xs text-slate-400">{isPrivacy ? `${trail.doneModuleIds.size}/${trail.modules.length}` : `${solvedIds.size}/${labs.length}`}</span>
          </header>

          <main id="conteudo" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {/* aviso de ambiente */}
            {!isPrivacy && !champion && (
            <div className="mb-5 flex items-center gap-2 border-l-2 border-amber-400/70 bg-[var(--color-surface)] px-3 py-1.5 text-xs text-slate-400">
              <AlertTriangle size={13} className="shrink-0 text-amber-400" aria-hidden="true" />
              <span>Backend <strong className="font-semibold text-slate-200">propositalmente vulnerável</strong>. Ambiente de treino: use apenas localmente.</span>
            </div>
            )}

            {pageLoading && (
              <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
                <Loader2 className="animate-spin" aria-hidden="true" /> Carregando…
              </div>
            )}

            {pageError && (
              <div role="alert" className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-center text-rose-200">
                <AlertTriangle className="mx-auto mb-2" aria-hidden="true" /> {pageError}
              </div>
            )}

            {!pageLoading && !pageError && (
              <ErrorBoundary>
                {champion ? (
                  <ChampionJourney onNavigate={goArea} />
                ) : isPrivacy ? (
                  area === 'llm' && activeModuleId === LAB_ID ? (
                    <LlmLab />
                  ) : activeModule ? (
                    <PrivacyModuleView
                      key={`${area}-${activeModule.id}`}
                      config={trailConfig}
                      module={activeModule}
                      progress={trail.progress}
                      onComplete={trail.complete}
                      onBack={() => selectModule(null)}
                    />
                  ) : (
                    <PrivacyHome config={trailConfig} modules={trail.modules} progress={trail.progress} doneModuleIds={trail.doneModuleIds} onOpen={selectModule} onOpenLab={area === 'llm' ? openLab : undefined} />
                  )
                ) : active ? (
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
