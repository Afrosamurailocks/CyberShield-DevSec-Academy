/**
 * Trilha ISO/IEC 27001:2022: 12 módulos (cláusulas 4 a 10, quatro temas do Anexo A e avaliação final).
 *
 * RASCUNHO para revisão humana (Segurança da Informação e de Compliance).
 * - A norma é paga: o conteúdo é paráfrase didática, sem reprodução de texto. Numeração de requisitos e
 *   controles é seleção editorial, a conferir na edição oficial (ISO/IEC 27001:2022 e 27002:2022).
 * - Casos reais: fonte pública citada; o mapeamento caso → cláusula/controle é editorial e não afirma nada
 *   sobre certificação das organizações citadas.
 * - A organização ainda NÃO é certificada (informado pelo solicitante): a trilha apoia a preparação. Escopo a definir: [inserir escopo do SGSI].
 */
import type { PrivacyModuleDefinition, PrivacyScenario } from './privacy.js';
import type { ScenarioVisual } from './privacyExtras.js';
import type { IsoModuleContent } from './isoTypes.js';
import { ISO_CONTENT_A } from './isoContentA.js';
import { ISO_CONTENT_B } from './isoContentB.js';
import { ISO_ANNEX_A } from './isoAnnexA.js';
import { ISO_FINAL } from './isoFinal.js';
import { ISO_CASES } from './isoCases.js';

/** Embaralhamento determinístico (semente = id do cenário): a resposta certa não fica sempre na mesma posição. */
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}
function shuffleOptions(s: PrivacyScenario): PrivacyScenario {
  const rnd = seeded(s.id);
  const opts = [...s.options];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { ...s, options: opts };
}

const ISO_PAGE = { label: 'ISO/IEC 27001:2022 (página oficial da ISO)', url: 'https://www.iso.org/standard/27001' };

const CONTENT: IsoModuleContent[] = [...ISO_CONTENT_A, ...ISO_CONTENT_B, ...ISO_ANNEX_A, ISO_FINAL]
  .sort((a, b) => a.order - b.order);

const visuals: Record<string, ScenarioVisual> = {};

export const ISO_MODULES: PrivacyModuleDefinition[] = CONTENT.map((c) => {
  const kase = ISO_CASES[c.id];
  Object.assign(visuals, c.visuals);
  return {
    id: c.id,
    code: c.code,
    order: c.order,
    title: c.title,
    summary: c.summary,
    minutes: c.minutes,
    legalBasis: c.legalBasis,
    context: c.context,
    scenarios: c.scenarios.map(shuffleOptions),
    understand: c.understand,
    goodPractices: c.goodPractices,
    references: [ISO_PAGE, ...(kase?.sources ?? [])],
    safeguards: c.safeguards,
    cases: kase ? [kase] : [],
  };
});

export const ISO_VISUALS: Record<string, ScenarioVisual> = visuals;
