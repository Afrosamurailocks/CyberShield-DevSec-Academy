// Gera o gabarito para o teste E2E da jornada (uso de TESTE: o gabarito nunca vai ao navegador).
// Saida: JSON em stdout. Uso: tsx scripts/e2e-answer-key.mts > key.json
import { PRIVACY_MODULES } from '../server/labs/privacy.ts';
import { CIS_MODULES } from '../server/labs/cis.ts';
import { ISO_MODULES } from '../server/labs/iso.ts';
import { LLM_MODULES } from '../server/labs/llm.ts';
import { LABS } from '../server/labs/metadata.ts';
import { PROMPT_LABS } from '../server/labs/llmLab.ts';

const trail = (mods: typeof CIS_MODULES) => mods.map((m) => ({
  id: m.id, code: m.code, title: m.title,
  scenarios: m.scenarios.map((s) => ({ id: s.id, correct: s.options.findIndex((o: { correct: boolean }) => o.correct), n: s.options.length })),
}));
console.log(JSON.stringify({
  privacy: trail(PRIVACY_MODULES), cis: trail(CIS_MODULES), iso: trail(ISO_MODULES), llm: trail(LLM_MODULES),
  labs: LABS.map((l) => ({ id: l.id, owaspId: l.owaspId, title: l.title, flag: l.flag })),
  promptLabs: (PROMPT_LABS as any[]).map((l) => ({ id: l.id, flag: l.flag, title: l.title })),
}));
