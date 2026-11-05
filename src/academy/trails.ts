// Configuração das trilhas de conteúdo (Privacidade/LGPD e CIS Controls): mesmo motor, textos próprios.
import type { TrailKind } from './types';

export interface TrailConfig {
  kind: TrailKind;
  /** Nome curto no seletor de área. */
  tab: string;
  /** Título da página inicial da trilha. */
  title: string;
  intro: string;
  /** Prefixo do código do item (P01, C01). */
  codePrefix: string;
  unit: string;      // "módulo" | "controle"
  unitPlural: string;
  /** Classe Tailwind do filete de cor da trilha. */
  bar: string;
  /** Texto do aviso fixo da trilha. */
  noticeLead: string;
  noticeRest: string;
  progressLabel: string;
  /** Rótulo do campo de referência no cabeçalho do módulo. */
  refLabel: string;
  /** Título e nota do painel de itens-chave do módulo (salvaguardas CIS, requisitos/controles ISO). */
  keyItemsLabel: string;
  keyItemsNote: string;
  sidebarFoot: string;
}

export const TRAILS: Record<TrailKind, TrailConfig> = {
  privacy: {
    kind: 'privacy',
    tab: 'LGPD',
    title: 'Privacidade e LGPD',
    intro: 'Trilha para todos os colaboradores. Em cada módulo você lê o contexto, decide em situações do dia a dia, entende o porquê e fixa as boas práticas.',
    codePrefix: 'P',
    unit: 'módulo', unitPlural: 'módulos',
    bar: 'bg-sky-500',
    noticeLead: 'rascunho sujeito a revisão',
    noticeRest: 'de Privacidade/Jurídico; não é parecer jurídico. Cenários fictícios. Dúvidas: [inserir canal do encarregado/DPO].',
    progressLabel: 'Privacidade e LGPD',
    refLabel: 'Base legal',
    keyItemsLabel: 'Pontos-chave',
    keyItemsNote: '',
    sidebarFoot: 'Conteúdo educativo · rascunho',
  },
  cis: {
    kind: 'cis',
    tab: 'CIS',
    title: 'CIS Controls v8.1',
    intro: 'Os 18 controles do CIS Critical Security Controls, um por módulo. Cada controle traz um caso real documentado em fonte pública, as salvaguardas que o previnem e cenários de decisão para praticar.',
    codePrefix: 'C',
    unit: 'controle', unitPlural: 'controles',
    bar: 'bg-violet-500',
    noticeLead: 'rascunho sujeito a revisão',
    noticeRest: 'da Segurança da Informação. Cenários de decisão fictícios; casos reais com fonte citada. O mapeamento de cada caso a um controle é editorial, não uma conclusão oficial dos órgãos citados.',
    progressLabel: 'CIS Controls v8.1',
    refLabel: 'Referência',
    keyItemsLabel: 'Salvaguardas-chave',
    keyItemsNote: 'Seleção editorial. Confira numeração, descrição e grupo de implementação (IG) no CIS Controls Navigator v8.1 antes de usar como referência formal.',
    sidebarFoot: 'Conteúdo educativo · rascunho',
  },
  iso: {
    kind: 'iso',
    tab: 'ISO',
    title: 'ISO/IEC 27001:2022',
    intro: 'Preparação para a certificação ISO/IEC 27001:2022 em 12 módulos: as cláusulas 4 a 10 do SGSI, os quatro temas do Anexo A e uma avaliação final em formato de auditoria. Cada módulo traz um caso real de fonte pública e cenários de decisão complexos.',
    codePrefix: 'I',
    unit: 'módulo', unitPlural: 'módulos',
    bar: 'bg-emerald-500',
    noticeLead: 'rascunho sujeito a revisão',
    noticeRest: 'da Segurança da Informação e de Compliance. Paráfrase didática: a norma ISO/IEC 27001 é paga e não é reproduzida aqui. Cenários fictícios; casos reais com fonte citada e mapeamento editorial. A organização ainda não é certificada: a trilha apoia a preparação. Escopo do SGSI a certificar: [inserir escopo do SGSI].',
    progressLabel: 'ISO/IEC 27001:2022',
    refLabel: 'Referência',
    keyItemsLabel: 'Requisitos e controles-chave',
    keyItemsNote: 'Seleção editorial e paráfrase. Confira numeração e texto na edição oficial da ISO/IEC 27001:2022 e da ISO/IEC 27002:2022 antes de usar como referência formal.',
    sidebarFoot: 'Conteúdo educativo · rascunho',
  },
  llm: {
    kind: 'llm',
    tab: 'LLM',
    title: 'Segurança de aplicações com LLM',
    intro: 'OWASP Top 10 for LLM Applications 2025 em 10 módulos e, como avaliação final, o Laboratório de prompts: você ataca assistentes vulneráveis e captura uma flag por categoria. Cada módulo traz um incidente real documentado, cenários em que você reconhece o ataque (inclusive multi-turn) e decide a mitigação, e as defesas que de fato resolvem.',
    codePrefix: 'L',
    unit: 'módulo', unitPlural: 'módulos',
    bar: 'bg-fuchsia-500',
    noticeLead: 'rascunho sujeito a revisão',
    noticeRest: 'da Segurança da Informação e de Arquitetura. Cenários fictícios e originais; casos reais com fonte citada e mapeamento editorial às categorias OWASP. Estrutura temática inspirada no range público LLMVault (MIT); para praticar na mão, rode-o isolado e revise o código antes.',
    progressLabel: 'OWASP LLM Top 10 · 2025',
    refLabel: 'Categoria',
    keyItemsLabel: 'Mitigações-chave',
    keyItemsNote: 'Seleção editorial de contramedidas. Valide contra a documentação oficial do OWASP GenAI Security Project e a arquitetura do seu sistema.',
    sidebarFoot: 'Conteúdo educativo · rascunho',
  },
};
