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
