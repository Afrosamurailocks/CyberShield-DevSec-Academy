/**
 * Tipos do conteúdo da trilha ISO/IEC 27001:2022. RASCUNHO para revisão humana
 * (Segurança da Informação, Compliance e AI Guild).
 */
import type { PrivacyScenario, Safeguard } from './privacy.js';
import type { ScenarioVisual } from './privacyExtras.js';

/** Conteúdo didático de um módulo ISO (uma cláusula ou um tema do Anexo A). */
export interface IsoModuleContent {
  /** i01..i11 (i12 = avaliação final). */
  id: string;
  order: number;
  /** Rótulo curto na lista: "CL4", "CL5", ..., "A.5", "A.6", "A.7", "A.8", "AF". */
  code: string;
  title: string;
  summary: string;
  minutes: number;
  /** Ex.: "ISO/IEC 27001:2022, Cláusula 6: Planejamento". */
  legalBasis: string;
  context: string;
  scenarios: PrivacyScenario[];
  visuals: Record<string, ScenarioVisual>;
  understand: string;
  goodPractices: string[];
  /** Requisitos (ex.: "6.1.2") ou controles do Anexo A (ex.: "A.5.23") em destaque no módulo. */
  safeguards: Safeguard[];
}
