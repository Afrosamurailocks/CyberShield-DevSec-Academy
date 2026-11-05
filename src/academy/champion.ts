// Jornada Security Champion no front: tipos e metadados de exibição. A lógica de nível vive em championCore
// (compartilhada com o servidor) e o progresso e o selo são registrados e assinados NO SERVIDOR.
import type { AppArea } from './types';
import type { TrackCount, TierId } from './championCore';

export * from './championCore';

/** Trilha com metadados de exibição (a contagem vem do servidor). */
export interface TrackInput extends TrackCount {
  label: string;
  /** Rótulo curto (selo e credencial). */
  short: string;
  /** Área do portal onde a trilha vive. */
  area: AppArea;
  /** O que conta como unidade (cenários, labs, flags). */
  unit: string;
  /** Frase curta do porquê da trilha na jornada. */
  why: string;
}
export type TrackStatus = TrackInput & { pct: number };

/** Selo como o servidor devolve (assinado; verificável por ID). */
export interface PublicSeal { id: string; name: string; tier: TierId; issuedAt: string; pcts: Record<string, number> }

export const TRACK_META: Omit<TrackInput, 'done' | 'total'>[] = [
  { id: 'privacy', label: 'Privacidade e LGPD', short: 'LGPD', area: 'privacidade', unit: 'cenários', why: 'A base: como tratar dados de pessoas, de clientes e de colegas no dia a dia.' },
  { id: 'cis', label: 'CIS Controls v8.1', short: 'CIS Controls', area: 'cis', unit: 'cenários', why: 'Os 18 controles práticos que previnem os incidentes mais comuns, com casos reais.' },
  { id: 'iso', label: 'ISO/IEC 27001:2022', short: 'ISO 27001', area: 'iso', unit: 'cenários', why: 'O sistema de gestão por trás da certificação: cláusulas, riscos e Anexo A.' },
  { id: 'owasp', label: 'OWASP Top 10 (labs web)', short: 'OWASP web', area: 'seguranca', unit: 'labs', why: 'Atacar para entender: explore as falhas web e aprenda a corrigir.' },
  { id: 'llm', label: 'Segurança com LLM (trilha)', short: 'LLM trilha', area: 'llm', unit: 'cenários', why: 'Riscos de chatbots, RAG e agentes: o OWASP Top 10 for LLM Applications.' },
  { id: 'llmlab', label: 'Segurança com LLM (avaliação final: laboratório)', short: 'LLM lab', area: 'llm', unit: 'flags', why: 'Prática: ataque assistentes simulados e capture as 10 flags.' },
];
