/**
 * Material de apoio da trilha de Privacidade: casos reais (com fonte pública), "imagens" dos
 * cenários (artefatos fictícios: e-mail, planilha, chat, formulário, log) e diagramas por módulo.
 *
 * RASCUNHO para revisão humana. Regras editoriais:
 * - Casos reais só com fatos presentes na fonte citada; onde as fontes divergem, o texto diz isso.
 * - Nenhum dado institucional da Opah IT. Artefatos visuais são 100% fictícios (domínios .test,
 *   faixa de IP de documentação RFC 5737, CPF "000.000.000-00").
 */
import type { PrivacyRef } from './privacy.js';

// ───────── Casos reais ─────────
export interface PrivacyCase {
  id: string;
  kind: 'sancao' | 'acordo' | 'incidente';
  title: string;
  /** Autoridade ou veículo que divulgou. */
  authority: string;
  date: string;
  /** Números-chave exibidos em destaque (todos presentes na fonte). */
  facts: { label: string; value: string }[];
  happened: string;
  outcome: string;
  lessons: string[];
  caveat?: string;
  sources: PrivacyRef[];
}

export const PRIVACY_CASES: Record<string, PrivacyCase> = {
  telekall: {
    id: 'telekall',
    kind: 'sancao',
    title: 'Primeira sanção da ANPD: contatos de eleitores sem base legal',
    authority: 'ANPD (Coordenação-Geral de Fiscalização)',
    date: 'Publicada no DOU em 06/07/2023',
    facts: [
      { label: 'Total aplicado', value: 'R$ 14.400' },
      { label: 'Porte da empresa', value: 'Microempresa' },
      { label: 'Dispositivos', value: 'LGPD arts. 7º e 41' },
    ],
    happened:
      'Após uma denúncia, a ANPD apurou que a empresa Telekall Infoservice ofereceu listas de contatos de WhatsApp de eleitores para divulgar material de campanha na eleição municipal de 2020 em Ubatuba/SP. Também não comprovou ter indicado um encarregado nem demonstrou estar dispensada dessa exigência, e não atendeu a determinações da equipe de fiscalização.',
    outcome:
      'Multa simples pelo tratamento sem base legal (art. 7º) e pelo descumprimento de determinações da fiscalização; advertência pela falta de comprovação do encarregado (art. 41). Por ser microempresa, o valor de cada infração foi limitado a 2% do faturamento bruto; o total informado foi de R$ 14.400. A empresa apresentou defesa, mas a ANPD concluiu pela infração. Cabe recurso ao Conselho Diretor.',
    lessons: [
      'Ter o número de telefone de alguém não significa ter base legal para usá-lo em outra finalidade.',
      'O tamanho da empresa reduz o valor da multa, mas não afasta a obrigação de respeitar a LGPD.',
      'Ignorar pedidos da fiscalização é uma infração por si só.',
      'Indicar e comprovar o encarregado faz parte do básico da governança.',
    ],
    caveat: 'O texto da ANPD não informa o valor individual de cada penalidade nem se houve recurso depois da decisão.',
    sources: [
      { label: 'ANPD: "ANPD aplica a primeira multa por descumprimento à LGPD"', url: 'https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aplica-a-primeira-multa-por-descumprimento-a-lgpd' },
    ],
  },

  sessc: {
    id: 'sessc',
    kind: 'sancao',
    title: 'Incidente em órgão de saúde: titulares não foram avisados',
    authority: 'ANPD (Coordenação-Geral de Fiscalização)',
    date: 'Notícia da ANPD de 18/10/2023',
    facts: [
      { label: 'Titulares sem aviso', value: '~300 mil' },
      { label: 'Infrações', value: '4 (3 graves)' },
      { label: 'Sanção', value: '4 advertências' },
    ],
    happened:
      'A ANPD sancionou a Secretaria de Estado da Saúde de Santa Catarina após um incidente de segurança. Apontou falhas na segurança dos sistemas que guardam dados de milhões de cidadãos atendidos pelo sistema público de saúde, ausência de comunicação clara e tempestiva sobre quais dados foram afetados (cerca de 300 mil titulares não receberam aviso), não entrega do Relatório de Impacto à Proteção de Dados Pessoais (RIPD) solicitado e falta de resposta a outras requisições da Autoridade.',
    outcome:
      'Quatro advertências, uma para cada infração (arts. 38, 48 e 49 da LGPD e art. 5º do Regulamento de Fiscalização). Entre as medidas corretivas, manter um comunicado do incidente no site por 90 dias e informar diretamente os titulares identificados como vítimas. Cabe recurso ao Conselho Diretor.',
    lessons: [
      'Em incidente, o que pesa não é só a falha técnica: é também avisar quem foi afetado, de forma clara e no prazo.',
      'Comunicar o incidente é obrigação do controlador, e começa com alguém reportar internamente.',
      'Quando a autoridade pede um documento (como o RIPD), a resposta é obrigatória.',
      'Dados de saúde são sensíveis: o risco ao titular é maior.',
    ],
    caveat: 'A notícia não descreve a natureza técnica do incidente nem a data em que ocorreu, e não informa o andamento depois da decisão.',
    sources: [
      { label: 'ANPD: "ANPD sanciona mais um órgão público"', url: 'https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-sanciona-mais-um-orgao-publico' },
    ],
  },

  netshoes: {
    id: 'netshoes',
    kind: 'acordo',
    title: 'Vazamento de cadastro de clientes e acordo com o Ministério Público',
    authority: 'MPDFT (acordo divulgado pela imprensa em fev/2019)',
    date: 'Acordo divulgado em fevereiro de 2019',
    facts: [
      { label: 'Clientes expostos', value: '1.999.704' },
      { label: 'Indenização', value: 'R$ 500 mil' },
      { label: 'Senhas e cartões', value: 'Não afetados' },
    ],
    happened:
      'Um incidente expôs dados cadastrais de quase 2 milhões de clientes da varejista Netshoes: nome completo, e-mail, CPF, data de nascimento e produtos comprados. Segundo as reportagens, senhas e números de cartão não foram comprometidos. O Ministério Público recomendou que a empresa avisasse os clientes (ela havia enviado apenas um e-mail genérico sobre segurança) e que não pagasse o suposto autor do incidente.',
    outcome:
      'A empresa firmou um acordo (TAC) com o MPDFT: informar os clientes, pagar R$ 500 mil por danos morais coletivos (destinados a um fundo de defesa de direitos difusos) e reforçar seu programa de proteção de dados. O caso é anterior à entrada em vigor da LGPD, mas ficou como referência de incidente com dado cadastral.',
    lessons: [
      'Sem senha ou cartão, o vazamento continua grave: nome, CPF e data de nascimento bastam para golpes e fraudes.',
      'Um aviso genérico não substitui comunicar o que foi exposto e a quem.',
      'Dado "só cadastral" é dado pessoal e precisa de proteção proporcional.',
    ],
    caveat: 'As reportagens divergem quanto à data exata do vazamento (entre 2017 e 2018) e quanto à data da assinatura do acordo. Confirme no site do MPDFT antes de usar fora do ambiente de treino.',
    sources: [
      { label: 'Tecnoblog: Netshoes paga R$ 500 mil em danos morais após vazamento de dados', url: 'https://tecnoblog.net/noticias/netshoes-acordo-mpdft-vazamento-dados/' },
      { label: 'MobileTime: MPDFT e Netshoes firmam acordo (05/02/2019)', url: 'https://www.mobiletime.com.br/noticias/05/02/2019/mpdft-e-netshoes-firmam-acordo-para-pagamento-de-danos-morais-apos-vazamento-de-dados/' },
    ],
  },

  conectesus: {
    id: 'conectesus',
    kind: 'incidente',
    title: 'Ataque ao Ministério da Saúde: o incidente que tirou sistemas do ar',
    authority: 'Imprensa e Polícia Federal (fontes jornalísticas)',
    date: '10/12/2021',
    facts: [
      { label: 'Sistemas citados', value: 'ConecteSUS, e-SUS Notifica, SI-PNI' },
      { label: 'Reivindicação', value: 'Grupo Lapsus$' },
      { label: 'Investigação', value: 'Polícia Federal' },
    ],
    happened:
      'Em 10 de dezembro de 2021, sites e aplicativos do Ministério da Saúde saíram do ar após um ataque, e dados de vacinação deixaram de aparecer no ConecteSUS. O grupo Lapsus$ assumiu a autoria. A Polícia Federal abriu inquérito e, em agosto de 2022, fez uma operação sobre o caso. Segundo a PF, os bancos de dados não foram criptografados pelos atacantes.',
    outcome:
      'O ministério informou que o aplicativo foi restabelecido em 23/12/2021; outras reportagens indicam que a instabilidade durou mais. O caso mostra que um incidente pode ser de disponibilidade (sistema fora do ar), e não apenas de vazamento.',
    lessons: [
      'Incidente com dado pessoal inclui indisponibilidade: o titular fica sem acesso ao próprio histórico.',
      'Backup e plano de resposta precisam existir antes do incidente.',
      'Dados de saúde são sensíveis, e a pressão pública é maior quando o serviço é essencial.',
    ],
    caveat: 'As fontes divergem sobre a duração da indisponibilidade. Não encontrei relatório técnico oficial com a causa raiz; este caso não traz sanção da ANPD.',
    sources: [
      { label: 'Tecnoblog: ConecteSUS não exibe vacinas após ataque hacker', url: 'https://tecnoblog.net/539903/conectesus-nao-exibe-vacinas-apos-ataque-hacker-ao-ministerio-da-saude/' },
      { label: 'Tecnoblog: PF diz que dados do Ministério da Saúde não foram criptografados', url: 'https://tecnoblog.net/540278/pf-diz-que-dados-do-ministerio-da-saude-nao-foram-criptografados-por-hackers/' },
      { label: 'IstoÉ Dinheiro: aplicativo ConecteSUS é restabelecido (23/12/2021)', url: 'https://istoedinheiro.com.br/aplicativo-conectesus-e-restabelecido-diz-ministerio-da-saude' },
    ],
  },
};

/** Quais casos aparecem em cada módulo (só onde há caso real verificado). */
export const MODULE_CASES: Record<string, string[]> = {
  p01: ['netshoes'],
  p02: ['telekall'],
  p05: ['telekall'],
  p06: ['sessc', 'conectesus'],
  p07: ['netshoes'],
  p09: ['telekall', 'sessc'],
};

// ───────── Diagramas por módulo ─────────
export type DiagramKind =
  | 'data-map' | 'three-gates' | 'rights-flow' | 'leak-map'
  | 'roles' | 'incident-timeline' | 'sharing-gates' | 'lifecycle';

export const MODULE_DIAGRAM: Record<string, DiagramKind> = {
  p01: 'data-map',
  p02: 'three-gates',
  p03: 'rights-flow',
  p04: 'leak-map',
  p05: 'roles',
  p06: 'incident-timeline',
  p07: 'sharing-gates',
  p08: 'lifecycle',
};

// ───────── "Imagens" dos cenários (artefatos fictícios) ─────────
export type ScenarioVisual =
  | { kind: 'email'; from: string; to: string; subject: string; attachments?: string[]; body: string[]; flag?: string }
  | { kind: 'sheet'; title: string; columns: string[]; rows: string[][]; note?: string }
  | { kind: 'chat'; channel: string; messages: { who: string; text: string; attachment?: string }[] }
  | { kind: 'form'; title: string; fields: { label: string; required?: boolean }[]; note?: string }
  | { kind: 'log'; title: string; lines: string[]; note?: string };

const CPF = '000.000.000-00';

export const SCENARIO_VISUALS: Record<string, ScenarioVisual> = {
  'p01-s1': {
    kind: 'sheet', title: 'testes_cadastro.xlsx',
    columns: ['Nome', 'CPF', 'E-mail corporativo', 'Cargo', 'Atestado médico'],
    rows: [
      ['Pessoa Exemplo 1', CPF, 'pessoa1@exemplo.test', 'Analista', 'atestado_01.pdf'],
      ['Pessoa Exemplo 2', CPF, 'pessoa2@exemplo.test', 'Gerente', 'atestado_02.pdf'],
      ['Pessoa Exemplo 3', CPF, 'pessoa3@exemplo.test', 'Estagiária', '(sem anexo)'],
    ],
    note: 'Planilha fictícia recebida para testes.',
  },
  'p01-s2': {
    kind: 'log', title: 'app.log (trecho)',
    lines: [
      '09:12:41 INFO  GET /painel        ip=203.0.113.25 ua=Chrome/124 uid=48213',
      '09:12:44 INFO  GET /relatorios    ip=203.0.113.25 ua=Chrome/124 uid=48213',
      '09:13:02 INFO  POST /perfil/editar ip=198.51.100.7 ua=Firefox/125 uid=51877',
    ],
    note: 'IPs na faixa reservada para documentação (RFC 5737).',
  },
  'p02-s1': {
    kind: 'sheet', title: 'base_contatos.csv',
    columns: ['E-mail', 'Origem do dado', 'Finalidade original'],
    rows: [
      ['pessoa1@exemplo.test', 'Chamado de suporte', 'Atendimento'],
      ['pessoa2@exemplo.test', 'Chamado de suporte', 'Atendimento'],
      ['pessoa3@exemplo.test', 'Chamado de suporte', 'Atendimento'],
    ],
    note: 'Uso pretendido pelo time comercial: campanha de divulgação de um novo produto.',
  },
  'p02-s2': {
    kind: 'form', title: 'Inscrição no webinar (formulário atual)',
    fields: [
      { label: 'Nome completo', required: true },
      { label: 'E-mail', required: true },
      { label: 'CPF', required: true },
      { label: 'Data de nascimento', required: true },
      { label: 'Endereço completo', required: true },
    ],
    note: 'Finalidade informada: enviar o link da transmissão ao vivo.',
  },
  'p03-s1': {
    kind: 'email', from: 'pessoa.exemplo@exemplo.test', to: 'gerente.projeto@empresa-exemplo.test',
    subject: 'Solicitação sobre meus dados',
    body: ['Olá! Gostaria de receber todos os dados que vocês têm sobre mim.', 'Obrigada.'],
  },
  'p03-s2': {
    kind: 'email', from: 'ex.candidato@exemplo.test', to: 'selecao@empresa-exemplo.test',
    subject: 'Pedido de exclusão de dados',
    body: ['Participei de um processo seletivo no ano passado.', 'Peço a exclusão de todos os meus dados do banco de candidatos.'],
  },
  'p04-s1': {
    kind: 'sheet', title: 'reclamacoes_clientes.xlsx',
    columns: ['Cliente', 'CPF', 'Reclamação'],
    rows: [
      ['Pessoa Exemplo 1', CPF, 'Cobrança duplicada em março'],
      ['Pessoa Exemplo 2', CPF, 'Demora na entrega'],
      ['Pessoa Exemplo 3', CPF, 'Produto com defeito'],
    ],
    note: 'Você pensa em colar esta planilha em uma ferramenta de IA aberta, para resumir.',
  },
  'p04-s2': {
    kind: 'chat', channel: '#projetos-geral · 312 membros',
    messages: [
      { who: 'Você', text: 'Pessoal, olhem o erro que aparece na tela de cadastro:', attachment: 'print_cadastro.png (mostra nome, CPF e endereço de uma pessoa)' },
    ],
  },
  'p05-s1': {
    kind: 'email', from: 'ti@cliente-exemplo.test', to: 'equipe-projeto@empresa-exemplo.test',
    subject: 'Acesso para validar a migração',
    body: ['Segue o acesso de leitura à base de usuários do sistema, para validarem a migração.'],
  },
  'p05-s2': {
    kind: 'chat', channel: 'Cliente Exemplo · conversa direta',
    messages: [
      { who: 'Cliente', text: 'Podemos usar a mesma base para enviar uma pesquisa de satisfação? Não está no contrato, mas é rapidinho.' },
    ],
  },
  'p06-s1': {
    kind: 'email', from: 'voce@empresa-exemplo.test', to: 'contato@outra-empresa.test',
    subject: 'Planilha combinada',
    attachments: ['clientes_ativos.xlsx'],
    body: ['Segue a planilha conforme combinado.'],
    flag: 'Destinatário externo: não era a pessoa pretendida',
  },
  'p06-s2': {
    kind: 'log', title: 'Inventário de equipamentos',
    lines: [
      'NB-0421  Notebook corporativo   status: SEM CHECK-IN há 18 h',
      'Último local conhecido: aeroporto (viagem a trabalho)',
      'Armazenamento: arquivos de projeto com dados pessoais de clientes (fictício)',
    ],
  },
  'p07-s1': {
    kind: 'email', from: 'comercial@fornecedor-exemplo.test', to: 'equipe-projeto@empresa-exemplo.test',
    subject: 'Demonstração com dados reais',
    body: ['Para mostrar o produto funcionando, podem liberar acesso à base de produção com dados reais?', 'Assinamos um NDA, se precisarem.'],
  },
  'p07-s2': {
    kind: 'email', from: 'gestor@cliente-exemplo.test', to: 'voce@empresa-exemplo.test',
    subject: 'Conferência de usuários',
    body: ['Pode enviar por e-mail a lista de usuários, com CPF e e-mail, para conferirmos? Pode ser em Excel mesmo.'],
  },
  'p08-s1': {
    kind: 'form', title: 'Novo sistema: dados que o cadastro vai guardar',
    fields: [
      { label: 'Nome' }, { label: 'E-mail' }, { label: 'CPF' },
      { label: 'Data de nascimento' }, { label: 'Foto do rosto' }, { label: 'Localização em tempo real' },
    ],
    note: 'O time pergunta: em que momento mapeamos esses dados?',
  },
  'p08-s2': {
    kind: 'log', title: 'Solicitação para o ambiente de testes',
    lines: [
      'Pedido: copiar prod_db → homolog_db',
      'Volume: 2,3 milhões de registros (fictício)',
      'Acesso à homologação: 14 pessoas, inclusive terceiros',
    ],
  },
};
