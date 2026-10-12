export type Difficulty = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Expert';

export type Category = 
  | 'Web Security' 
  | 'Engenharia Social' 
  | 'Criptografia & Senhas' 
  | 'Forense & Logs' 
  | 'Cloud & APIs' 
  | 'Redes & Infra';

export interface ChallengeHint {
  id: string;
  cost: number;
  content: string;
  revealed?: boolean;
}

export interface TerminalCommandResponse {
  output: string;
  isError?: boolean;
  highlight?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  points: number;
  description: string;
  corporateContext: string; // Ex: Sistema de faturamento, CRM de clientes, etc.
  flag: string; // CYBER{...}
  hints: ChallengeHint[];
  author: string;
  solveCount: number;
  tags: string[];
  // Interactive sandbox features
  sandboxType: 'terminal' | 'web_inspector' | 'log_viewer' | 'code_review';
  initialFiles?: { [filename: string]: string };
  terminalPrompt?: string;
  networkLogs?: Array<{ time: string; source: string; destination: string; protocol: string; payload: string; flagged?: boolean }>;
  mockHttpEndpoint?: {
    method: 'GET' | 'POST';
    url: string;
    params?: { [key: string]: string };
    responseBody: string;
    vulnerableParam?: string;
  };
  sourceCodeSnippet?: {
    language: string;
    code: string;
    fileName: string;
  };
  explanation: {
    rootCause: string;
    realWorldImpact: string;
    mitigationBestPractices: string[];
    cweReference?: string;
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: Category | 'Geral';
  icon: string;
  rarity: 'Comum' | 'Raro' | 'Épico' | 'Lendário';
  unlockedAt?: string;
  requirement: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  totalScore: number;
  completedChallengeIds: string[];
  solvedCount: number;
  streakDays: number;
  lastActiveDate: string;
  unlockedBadgeIds: string[];
  phishingSimulationsTested: number;
  phishingSimulationsReported: number;
  phishingSimulationsFailed: number;
}

export interface DepartmentScore {
  department: string;
  memberCount: number;
  totalPoints: number;
  avgScore: number;
  completionRate: number;
  phishingResilience: number; // 0-100%
  color: string;
}

export interface PhishingEmail {
  id: string;
  campaignTitle: string;
  difficulty: Difficulty;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  previewText: string;
  headers: {
    from: string;
    replyTo: string;
    returnPath: string;
    spf: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL';
    dkim: 'PASS' | 'FAIL' | 'NONE';
    dmarc: 'PASS' | 'FAIL' | 'NONE';
    authResults: string;
  };
  bodyHtml: string;
  fakeAttachment?: {
    name: string;
    size: string;
    extension: string;
    isDangerous: boolean;
  };
  suspiciousLink?: {
    displayText: string;
    actualUrl: string;
  };
  redFlags: {
    id: string;
    title: string;
    description: string;
    severity: 'Alta' | 'Média' | 'Crítica';
  }[];
  educationalExplanation: {
    tactic: string;
    psychologicalTrigger: string; // Urgência, autoridade, ganância, medo
    howToPrevent: string[];
  };
}

export interface VulnerabilityItem {
  id: string;
  cveOrName: string;
  title: string;
  systemAffected: string;
  category: Category;
  severity: 'Crítica' | 'Alta' | 'Média' | 'Baixa';
  cvssScore: number;
  occurrencesInCompany: number;
  status: 'Ativa' | 'Em Mitigação' | 'Controlada' | 'Corrigida';
  discoveryDate: string;
  impactDescription: string;
  internalIncidentsCount: number;
  departmentsMostExposed: string[];
  recommendedMitigations: string[];
}

export interface SecurityAlert {
  id: string;
  title: string;
  urgency: 'Crítico' | 'Alto' | 'Informativo';
  timestamp: string;
  message: string;
  actionRequired?: string;
  isRead: boolean;
  category: string;
}

export interface DailyTip {
  id: string;
  dayIndex: number;
  title: string;
  shortTip: string;
  detailedAction: string;
  category: string;
  author: string;
}
