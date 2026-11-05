/**
 * Trilha CIS Controls v8.1: 18 módulos (um por controle), cada um com caso real de fonte pública,
 * salvaguardas-chave, 2 cenários de decisão (fictícios) e boas práticas.
 *
 * RASCUNHO para revisão humana (Segurança da Informação).
 * - Versão: a v8.1 (publicada em 24/06/2024) é a mais recente verificada em cisecurity.org; não há v9 nem
 *   edição 2026 no site oficial. O nome "CIS Controls 2026" NÃO é usado como rótulo de versão.
 * - Salvaguardas: seleção editorial, a conferir no CIS Controls Navigator (ver cisControls.ts).
 * - Casos: o mapeamento caso → controle é editorial. Alguns incidentes aparecem em dois controles
 *   (Colonial Pipeline em C01/C06; Uber 2016 em C03/C17), sinalizado no campo "Limites da fonte".
 */
import type { PrivacyModuleDefinition, PrivacyScenario } from './privacy.js';
import type { PrivacyCase, ScenarioVisual } from './privacyExtras.js';
import { CIS_BASE } from './cisControls.js';
import { CIS_CASES_7_12 } from './cisCases7to12.js';
import { CIS_CASES_REST } from './cisCasesRest.js';
import { CIS_CONTENT_A } from './cisContentA.js';
import { CIS_CONTENT_B } from './cisContentB.js';
import { CIS_ADVANCED_A } from './cisAdvancedA.js';
import { CIS_ADVANCED_B } from './cisAdvancedB.js';
import { CIS_FINAL, CIS_FINAL_VISUALS } from './cisFinal.js';

const CASES: Record<string, PrivacyCase> = { ...CIS_CASES_REST, ...CIS_CASES_7_12 };
const CONTENT = { ...CIS_CONTENT_A, ...CIS_CONTENT_B };
const ADVANCED = { ...CIS_ADVANCED_A, ...CIS_ADVANCED_B };

/** Embaralhamento determinístico (semente = id do cenário): evita a resposta certa sempre na mesma posição. */
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

const CIS_LIST = { label: 'CIS: os 18 controles (página oficial)', url: 'https://www.cisecurity.org/controls/cis-controls-list' };
const CIS_V81 = { label: 'CIS: Critical Security Controls v8.1 (página oficial)', url: 'https://www.cisecurity.org/controls/v8-1' };
const CIS_NAV = { label: 'CIS Controls Navigator (confira salvaguardas e grupos de implementação)', url: 'https://www.cisecurity.org/controls/cis-controls-navigator' };

const visuals: Record<string, ScenarioVisual> = {};

const CONTROL_MODULES: PrivacyModuleDefinition[] = CIS_BASE.map((b) => {
  const c = CONTENT[b.n];
  const key = `c${String(b.n).padStart(2, '0')}`;
  const kase = CASES[key];
  const adv = ADVANCED[b.n];
  Object.assign(visuals, c.visuals, adv?.visuals);
  return {
    id: key,
    code: b.code,
    order: b.n,
    title: b.pt,
    summary: b.summary,
    minutes: b.minutes,
    legalBasis: `CIS Controls v8.1, Controle ${b.n}: ${b.en}`,
    context: c.context,
    scenarios: [...c.scenarios, ...(adv?.scenarios ?? [])].map(shuffleOptions),
    understand: c.understand,
    goodPractices: c.goodPractices,
    references: [CIS_LIST, CIS_V81, CIS_NAV, ...(kase?.sources ?? [])],
    safeguards: b.safeguards,
    cases: kase ? [kase] : [],
  };
});

Object.assign(visuals, CIS_FINAL_VISUALS);

export const CIS_MODULES: PrivacyModuleDefinition[] = [
  ...CONTROL_MODULES,
  { ...CIS_FINAL, scenarios: CIS_FINAL.scenarios.map(shuffleOptions), references: [CIS_LIST, CIS_V81, CIS_NAV] },
];

export const CIS_VISUALS: Record<string, ScenarioVisual> = visuals;
