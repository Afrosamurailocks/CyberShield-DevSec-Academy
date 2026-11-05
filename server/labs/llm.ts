/**
 * Trilha LLM: OWASP Top 10 for LLM Applications 2025 (LLM01 a LLM10). A avaliação final da trilha é o Laboratório de prompts (llmLab.ts),
 * não mais um módulo de cenários: o antigo módulo l11 (llmFinal.ts) deixou de ser carregado.
 *
 * RASCUNHO para revisão humana (Segurança da Informação, Arquitetura e AI Guild).
 * - Estrutura temática inspirada no range público LLMVault (github.com/CyberSunil/LLMVault, MIT): categorias,
 *   progressão core → avançado e os cenários "live". Texto, cenários e prompts aqui são ORIGINAIS e fictícios;
 *   nada do código, das flags ou dos payloads do LLMVault foi copiado (o código dos labs não foi lido).
 *   A marca LLMVault™ não é da Opah; o projeto é citado só como referência de prática.
 * - Casos reais: fonte pública citada; mapeamento caso → categoria é editorial.
 */
import type { PrivacyModuleDefinition, PrivacyScenario } from './privacy.js';
import type { ScenarioVisual } from './privacyExtras.js';
import type { LlmModuleContent } from './llmTypes.js';
import { LLM_CONTENT_A } from './llmContentA.js';
import { LLM_CONTENT_B } from './llmContentB.js';
import { LLM_CASES } from './llmCases.js';

/** Embaralhamento determinístico (semente = id do cenário). */
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

const OWASP_LLM = { label: 'OWASP GenAI Security Project: Top 10 for LLM Applications (página oficial)', url: 'https://genai.owasp.org/llm-top-10/' };
const LLMVAULT = { label: 'Pratique (referência externa): LLMVault, range CTF de LLM (MIT). Rode isolado, sem expor à rede, e revise o código antes de uso corporativo', url: 'https://github.com/CyberSunil/LLMVault' };

const CONTENT: LlmModuleContent[] = [...LLM_CONTENT_A, ...LLM_CONTENT_B].sort((a, b) => a.order - b.order);
const visuals: Record<string, ScenarioVisual> = {};

export const LLM_MODULES: PrivacyModuleDefinition[] = CONTENT.map((c) => {
  const kase = LLM_CASES[c.id];
  Object.assign(visuals, c.visuals);
  return {
    id: c.id, code: c.code, order: c.order, title: c.title, summary: c.summary, minutes: c.minutes,
    legalBasis: c.legalBasis, context: c.context,
    scenarios: c.scenarios.map(shuffleOptions),
    understand: c.understand, goodPractices: c.goodPractices,
    references: [OWASP_LLM, ...(kase?.sources ?? []), LLMVAULT],
    safeguards: c.safeguards,
    cases: kase ? [kase] : [],
  };
});

export const LLM_VISUALS: Record<string, ScenarioVisual> = visuals;
