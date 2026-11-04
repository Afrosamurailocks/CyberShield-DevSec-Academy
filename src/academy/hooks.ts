import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Lab, Progress, PrivacyModule, PrivacyProgress, TrailKind } from './types';
import { fetchLabs, loadProgress, saveProgress, fetchTrail, loadTrailProgress, saveTrailProgress } from './api';

/** Carrega o catálogo de labs do backend, com cleanup para evitar setState pós-unmount. */
export function useLabs() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchLabs()
      .then((l) => { if (alive) setLabs(l); })
      .catch(() => { if (alive) setError('Não foi possível carregar os laboratórios. O backend (API :4000) está rodando? Use "npm run dev".'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return { labs, loading, error };
}

/** Progresso do aluno persistido em localStorage. */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  useEffect(() => { saveProgress(progress); }, [progress]);

  const solve = useCallback((labId: string, flag: string, points: number) => {
    setProgress((prev) => (prev.solved[labId]
      ? prev
      : { solved: { ...prev.solved, [labId]: { flag, points, at: new Date().toISOString() } } }));
  }, []);

  const reset = useCallback(() => setProgress({ solved: {} }), []);

  return { progress, solve, reset };
}

/** Catálogo de uma trilha (Privacidade ou CIS) + progresso (localStorage, chave própria por trilha). */
export function useTrail(kind: TrailKind) {
  const [modules, setModules] = useState<PrivacyModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<PrivacyProgress>(() => loadTrailProgress(kind));
  const latest = useRef(progress);
  latest.current = progress;

  useEffect(() => {
    let alive = true;
    fetchTrail(kind)
      .then((m) => { if (alive) setModules(m); })
      .catch(() => { if (alive) setError('Não foi possível carregar o conteúdo. O backend (API :4000) está rodando?'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [kind]);

  /** Registra o acerto de um cenário (idempotente) e conta tentativas. */
  const complete = useCallback((scenarioId: string, attempts: number) => {
    const prev = latest.current;
    if (prev.done[scenarioId]) return;
    const next: PrivacyProgress = { done: { ...prev.done, [scenarioId]: { at: new Date().toISOString(), attempts } } };
    latest.current = next;
    saveTrailProgress(kind, next); // grava já, sem esperar o próximo render (evita perder o acerto ao recarregar rápido)
    setProgress(next);
  }, [kind]);

  const reset = useCallback(() => {
    const empty: PrivacyProgress = { done: {} };
    latest.current = empty;
    saveTrailProgress(kind, empty);
    setProgress(empty);
  }, [kind]);

  const doneModuleIds = useMemo(() => new Set(
    modules.filter((m) => m.scenarios.length > 0 && m.scenarios.every((s) => progress.done[s.id])).map((m) => m.id),
  ), [modules, progress]);

  return { modules, loading, error, progress, complete, reset, doneModuleIds };
}
