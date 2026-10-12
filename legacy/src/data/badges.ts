import { Badge } from '../types';

export const BADGES: Badge[] = [
  {
    id: 'badge-first-flag',
    title: 'Primeiro Escudo',
    description: 'Resolveu com sucesso o seu primeiro desafio CTF na plataforma corporativa.',
    category: 'Geral',
    icon: 'ShieldCheck',
    rarity: 'Comum',
    requirement: 'Capturar 1 flag'
  },
  {
    id: 'badge-phish-buster',
    title: 'Caçador de Phishing',
    description: 'Identificou e reportou com sucesso todas as simulações de phishing corporativo sem cair em armadilhas.',
    category: 'Engenharia Social',
    icon: 'MailCheck',
    rarity: 'Raro',
    requirement: 'Reportar corretamente 3 simulações de phishing'
  },
  {
    id: 'badge-web-sentinel',
    title: 'Sentinela Web',
    description: 'Dominou os desafios de vulnerabilidades web (SQLi, IDOR e XSS).',
    category: 'Web Security',
    icon: 'Globe',
    rarity: 'Raro',
    requirement: 'Completar 2 desafios da categoria Web Security'
  },
  {
    id: 'badge-crypto-analyst',
    title: 'Mestre da Criptoanálise',
    description: 'Decifrou hashes, chaves expostas e segredos criptográficos.',
    category: 'Criptografia & Senhas',
    icon: 'KeyRound',
    rarity: 'Épico',
    requirement: 'Completar 2 desafios de Criptografia & Senhas'
  },
  {
    id: 'badge-soc-investigator',
    title: 'Investigador SOC L1',
    description: 'Rastreou com sucesso tráfego anômalo de rede e comandos maliciosos em logs corporativos.',
    category: 'Forense & Logs',
    icon: 'SearchCheck',
    rarity: 'Épico',
    requirement: 'Completar desafio avançado de Forense & Logs'
  },
  {
    id: 'badge-cloud-defender',
    title: 'Guardião da Nuvem',
    description: 'Auditou permissões de armazenamento em nuvem e manipulou tokens JWT.',
    category: 'Cloud & APIs',
    icon: 'CloudLightning',
    rarity: 'Épico',
    requirement: 'Resolver desafios de Cloud & APIs'
  },
  {
    id: 'badge-streak-fire',
    title: 'Disciplina Blindada',
    description: 'Manteve uma sequência ativa de treinamento em segurança por 5 dias seguidos.',
    category: 'Geral',
    icon: 'Flame',
    rarity: 'Raro',
    requirement: 'Manter sequência de 5 dias'
  },
  {
    id: 'badge-hall-of-fame',
    title: 'Top Defender Corporativo',
    description: 'Alcançou a elite dos 3 maiores pontuadores do ranking da organização.',
    category: 'Geral',
    icon: 'Trophy',
    rarity: 'Lendário',
    requirement: 'Ficar no Top 3 do Leaderboard Geral'
  }
];
