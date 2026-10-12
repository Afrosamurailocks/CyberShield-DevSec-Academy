import { useState, useEffect, useCallback } from 'react';
import type { Lab, Progress } from './types';
import { fetchLabs, loadProgress, saveProgress } from './api';

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
