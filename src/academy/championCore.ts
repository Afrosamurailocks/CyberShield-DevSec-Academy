// Núcleo da Jornada Security Champion, compartilhado entre o front e o servidor (sem imports, só lógica pura).
// RASCUNHO: os limites por nível são premissa editorial [a validar com os mantenedores e a Segurança da Informação].

export type TierId = 'bronze' | 'prata' | 'ouro';
export interface Tier { id: TierId; label: string; /** % mínimo de conclusão em CADA trilha. */ min: number; color: string }

export const TIERS: Tier[] = [
  { id: 'bronze', label: 'Bronze', min: 70, color: '#b8793f' },
  { id: 'prata', label: 'Prata', min: 85, color: '#aeb8c4' },
  { id: 'ouro', label: 'Ouro', min: 100, color: '#dfb04a' },
];

/** Contagem mínima por trilha (é tudo que o servidor precisa saber). */
export interface TrackCount {
  id: string; done: number; total: number;
  /** Avaliação final da trilha, quando houver: é OBRIGATÓRIA. Sem concluí-la, nenhum nível é liberado. */
  final?: { done: number; total: number };
}

/** A avaliação final da trilha existe e ainda não foi concluída. */
export const finalPending = (t: { final?: { done: number; total: number } }): boolean =>
  Boolean(t.final && t.final.total > 0 && t.final.done < t.final.total);

export const pct = (done: number, total: number): number =>
  total > 0 ? Math.min(100, Math.floor((Math.max(0, done) / total) * 100)) : 0;

export interface MissingItem { id: string; units: number; /** O que falta inclui a avaliação final (obrigatória). */ final?: boolean }
export interface ChampionStatus<T extends TrackCount = TrackCount> {
  tracks: (T & { pct: number; finalPending: boolean })[];
  /** Trilhas cuja avaliação final obrigatória ainda não foi concluída. */
  pendingFinals: string[];
  /** Média simples dos percentuais das trilhas. */
  overall: number;
  /** Menor percentual entre as trilhas (o gargalo define o nível). */
  floor: number;
  tier: Tier | null;
  next: { tier: Tier; missing: MissingItem[] } | null;
}

export function evaluate<T extends TrackCount>(inputs: T[]): ChampionStatus<T> {
  const tracks = inputs.map((t) => ({ ...t, pct: pct(t.done, t.total), finalPending: finalPending(t) }));
  const pendingFinals = tracks.filter((t) => t.finalPending).map((t) => t.id);
  const floor = tracks.length ? Math.min(...tracks.map((t) => t.pct)) : 0;
  const overall = tracks.length ? Math.round(tracks.reduce((s, t) => s + t.pct, 0) / tracks.length) : 0;
  const valid = tracks.length > 0 && tracks.every((t) => t.total > 0);
  // Avaliações finais são obrigatórias: com qualquer uma pendente, não há nível (nem Bronze), mesmo com % alto.
  const reached = valid && pendingFinals.length === 0 ? [...TIERS].reverse().find((t) => floor >= t.min) ?? null : null;
  const nextTier = TIERS.find((t) => !reached || t.min > reached.min) ?? null;
  const next = nextTier
    ? {
      tier: nextTier,
      missing: tracks
        .map((t): MissingItem => {
          const byPct = Math.max(0, Math.ceil((nextTier.min / 100) * t.total) - t.done);
          if (!t.finalPending || !t.final) return { id: t.id, units: byPct };
          return { id: t.id, units: Math.max(byPct, t.final.total - t.final.done), final: true };
        })
        .filter((m) => m.units > 0),
    }
    : null;
  return { tracks, pendingFinals, overall, floor, tier: reached, next };
}

/** Nome exibido: sem caracteres de controle e sem < >, espaços colapsados, até 60 caracteres. */
export function cleanName(raw: string): string {
  return raw.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
}
