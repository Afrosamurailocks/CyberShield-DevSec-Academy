// Tipos do frontend — espelham os metadados publicos do backend (sem flag).

export interface LabReference { label: string; url: string; }

export interface LabWriteup {
  rootCause: string;
  impact: string;
  vulnerableCode: string;
  vulnerableLanguage: string;
  secureCode: string;
  secureLanguage: string;
  remediation: string[];
}

export interface LabRequestExample {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: string;
  note?: string;
  /** Endpoint protegido: carrega "Authorization: Bearer <token de sessão>" automaticamente. */
  auth?: boolean;
}

export interface LabKillChain {
  step: number;
  provides?: string;
  uses?: string;
}

export interface Lab {
  id: string;
  owaspId: string;
  owaspTitle: string;
  killChain?: LabKillChain;
  title: string;
  difficulty: 'Iniciante' | 'Intermediario' | 'Avancado';
  points: number;
  cwe: string;
  tags: string[];
  tools?: string[];
  primer?: string;
  objective: string;
  context: string;
  baseEndpoint: string;
  exampleRequests: LabRequestExample[];
  hints: string[];
  writeup: LabWriteup;
  references: LabReference[];
}

export interface Progress {
  solved: Record<string, { flag: string; at: string; points: number }>;
}

// ───────── Trilha de Privacidade / LGPD ─────────
export type ScenarioVisual =
  | { kind: 'email'; from: string; to: string; subject: string; attachments?: string[]; body: string[]; flag?: string }
  | { kind: 'sheet'; title: string; columns: string[]; rows: string[][]; note?: string }
  | { kind: 'chat'; channel: string; messages: { who: string; text: string; attachment?: string }[] }
  | { kind: 'form'; title: string; fields: { label: string; required?: boolean }[]; note?: string }
  | { kind: 'log'; title: string; lines: string[]; note?: string };

export type DiagramKind =
  | 'data-map' | 'three-gates' | 'rights-flow' | 'leak-map'
  | 'roles' | 'incident-timeline' | 'sharing-gates' | 'lifecycle';

export interface PrivacyCase {
  id: string;
  kind: 'sancao' | 'acordo' | 'incidente';
  title: string;
  authority: string;
  date: string;
  facts: { label: string; value: string }[];
  happened: string;
  outcome: string;
  lessons: string[];
  caveat?: string;
  sources: LabReference[];
}

export interface PrivacyScenario {
  id: string;
  situation: string;
  question: string;
  visual?: ScenarioVisual;
  /** Só o texto: o gabarito fica no servidor. */
  options: { text: string }[];
}

export interface PrivacyModule {
  id: string;
  order: number;
  title: string;
  summary: string;
  minutes: number;
  legalBasis: string;
  context: string;
  scenarios: PrivacyScenario[];
  understand: string;
  goodPractices: string[];
  references: LabReference[];
  diagram?: DiagramKind;
  cases?: PrivacyCase[];
  /** Código curto exibido na lista (ex.: C05). */
  code?: string;
  /** Salvaguardas do controle (trilha CIS). */
  safeguards?: Safeguard[];
}

export interface PrivacyProgress {
  /** scenarioId -> conclusão (acerto) */
  done: Record<string, { at: string; attempts: number }>;
}

export type AppArea = 'seguranca' | 'privacidade' | 'cis' | 'iso' | 'llm';
export type TrailKind = 'privacy' | 'cis' | 'iso' | 'llm';

export interface Safeguard { id: string; title: string; ig?: 1 | 2 | 3; }
