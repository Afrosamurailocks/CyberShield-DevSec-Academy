/**
 * Casos reais da trilha ISO/IEC 27001:2022 (módulos i01 a i11). RASCUNHO para revisão humana.
 * O mapeamento de cada caso a uma cláusula/controle é EDITORIAL. Nenhum nome de pessoa é citado.
 * Casos novos (lidos via WebFetch): SolarWinds, Optus, LastPass, MGM Resorts, Okta.
 * Reaproveitados da trilha CIS (c17, c04, c14, c13, c18, c05; todos de cisCasesRest): ver caveat de cada um.
 *
 * Verificação da edição 2022 (iso.org/standard/27001 e iso.org/standard/82875.html retornaram HTTP 403; ICO também):
 * - LIDO (Kiwa, organismo certificador, não a ISO): publicação em 25/10/2022; Anexo A com 93 controles em 4 temas
 *   (A.5 Organizacional 37, A.6 Pessoas 8, A.7 Físico 14, A.8 Tecnológico 34); antes eram 114 controles em 14 seções;
 *   certificados da edição 2013 expiram em 31/10/2025; auditorias iniciais/recertificação só pela 2022 após 30/04/2024.
 *   URL: https://www.kiwa.com/en/news/changes--to-isoiec-270012022/
 * - NÃO VERIFICADO em fonte oficial (ISO/IAF MD 26): confirmar data e prazo antes de uso externo.
 * - Não lidos (bloqueio 403): páginas do ICO (British Airways, Marriott); Maersk não teve fonte primária lida. Nada disso foi usado.
 */
import type { PrivacyCase } from './privacyExtras.js';
import { CIS_CASES_REST } from './cisCasesRest.js';

const NOTE_CIS = ' Reaproveitado da trilha CIS; o mapeamento a esta cláusula/tema é editorial.';
const NOTE_ISO =
  ' O mapeamento à cláusula/controle da ISO/IEC 27001 é editorial, e o incidente NÃO implica que a organização citada tenha ou não tivesse certificação ISO 27001.';

function reuse(c: PrivacyCase): PrivacyCase {
  return { ...c, id: `iso-${c.id}`, caveat: `${c.caveat ?? ''}${NOTE_CIS}${NOTE_ISO}`.trim() };
}

export const ISO_CASES: Record<string, PrivacyCase> = {
  // Cláusula 4: contexto, partes interessadas e escopo.
  i01: {
    id: 'iso-solarwinds', kind: 'incidente',
    title: 'SolarWinds Orion: quando o build do fornecedor vira risco de todos os clientes',
    authority: 'SolarWinds (security advisory da própria empresa)',
    date: 'Advisory atualizado em abr/2021 (investigação ainda em andamento na página)',
    facts: [
      { label: 'Versões Orion afetadas', value: '3 (2019.4 HF 5; 2020.2; 2020.2 HF 1)' },
      { label: 'Versão recomendada', value: '2020.2.5 (ou 2019.4.2)' },
      { label: 'Atribuição verificada pela empresa', value: 'Não' },
    ],
    happened:
      'Segundo o advisory, uma vulnerabilidade chamada SUNBURST foi inserida nos builds do Orion Platform em um ataque à cadeia de suprimentos. Se presente e ativada, ela podia permitir que um atacante comprometesse o servidor onde os produtos Orion rodam. A página afirma que o malware SUNSPOT injetava o código SUNBURST durante o processo de build, e que a exploração exigia intervenção manual, o que sugere uso direcionado. A empresa disse ter sido informada de que o ataque pode ter sido conduzido por um Estado-nação, mas não verificou a identidade do atacante.',
    outcome:
      'A empresa recomendou atualizar para a versão 2020.2.5 (ou 2019.4.2), reaplicar patches após reinstalação e manter a plataforma atrás de firewalls, sem acesso à internet e com portas limitadas. A página lida não traz multa, período do ataque nem número de clientes afetados.',
    lessons: [
      'Partes interessadas incluem fornecedores de ferramentas privilegiadas: o ambiente de build deles entra no seu contexto de risco.',
      'Defina no escopo do SGSI quais ferramentas de gestão têm acesso amplo e quem responde por elas.',
      'Saber qual versão e qual hotfix está instalado em cada servidor é condição para agir quando o aviso chega.',
    ],
    caveat:
      'A única fonte lida é o advisory da própria SolarWinds, parte interessada, com texto de abr/2021 e investigação em andamento; período do ataque e número de clientes não constam e não são usados. Outras fontes (CISA, SEC) não foram lidas.' + NOTE_ISO,
    sources: [
      { label: 'SolarWinds: Security Advisory (SUNBURST e SUPERNOVA)', url: 'https://www.solarwinds.com/securityadvisory' },
    ],
  },

  // Cláusula 5: liderança.
  i02: reuse(CIS_CASES_REST.c17),

  // Cláusula 6: planejamento e tratamento de riscos.
  i03: reuse(CIS_CASES_REST.c04),

  // Cláusula 7: apoio (competência, conscientização).
  i04: reuse(CIS_CASES_REST.c14),

  // Cláusula 8: operação (controle de mudanças).
  i05: {
    id: 'iso-optus', kind: 'incidente',
    title: 'Optus (2022): um erro de código em controle de acesso que só foi corrigido no site principal',
    authority: 'ACMA (alegações em ação judicial), segundo reportagem do iTnews',
    date: 'Violação em set/2022; reportagem de 20/06/2024',
    facts: [
      { label: 'Erro identificado pela Optus (só no site principal)', value: 'Ago/2021' },
      { label: 'Endpoint desativado', value: '21/09/2022' },
      { label: 'Clientes reembolsados por reemissão de documento', value: '20.071' },
    ],
    happened:
      'Segundo a ACMA, um erro de codificação em um controle de acesso deixou uma API exposta à internet aberta a abuso. A agência alega que o controle existia, mas foi enfraquecido por uma mudança de código, permitindo contorná-lo, e que o endpoint estava "dormant" (sem uso) por longo período. A Optus teria identificado o erro em agosto de 2021 apenas no site principal; a ACMA alega que houve ao menos três chances de perceber que o mesmo problema afetava a API. O endpoint foi desativado em 21/09/2022.',
    outcome:
      'Trata-se de ação da ACMA, com alegações ainda não decididas na reportagem lida. A Optus confirma a vulnerabilidade, diz que era "previously unknown" e que pretende contestar a ação. A reportagem cita reembolso a 20.071 clientes atuais e ex-clientes pela reemissão de documentos de identidade.',
    lessons: [
      'Mudança de código em controle de acesso precisa de revisão e teste de regressão, inclusive para endpoints pouco usados.',
      'Ao corrigir uma falha em um ponto, procure o mesmo padrão em todos os outros pontos expostos.',
      'Endpoints dormentes e expostos à internet devem ser inventariados e desativados quando não usados.',
    ],
    caveat:
      'Todas as afirmações técnicas são ALEGAÇÕES da ACMA, não fatos estabelecidos; a Optus discorda de parte delas. A fonte é uma reportagem (secundária), e a página da ACMA não pôde ser lida (timeout). O relatório forense citado não foi lido. Contagens totais de clientes vistas em buscas não foram usadas.' + NOTE_ISO,
    sources: [
      { label: 'iTnews: violação da Optus teria sido causada por erro de código em controle de acesso', url: 'https://www.itnews.com.au/news/optus-breach-allegedly-enabled-by-access-control-coding-error-608985' },
    ],
  },

  // Cláusula 9: monitoramento, medição e análise crítica.
  i06: reuse(CIS_CASES_REST.c13),

  // Cláusula 10: melhoria e ação corretiva.
  i07: {
    id: 'iso-lastpass', kind: 'incidente',
    title: 'LastPass (2022): a correção do primeiro incidente não cobriu o que o atacante já tinha levado',
    authority: 'LastPass (comunicado da própria empresa, com atualizações de ago, nov e dez/2022)',
    date: 'Ago/2022 a 22/12/2022',
    facts: [
      { label: 'Primeira avaliação (15/09/2022)', value: 'Sem acesso a dados de clientes' },
      { label: 'Atividade incomum em nuvem compartilhada', value: '30/11/2022' },
      { label: 'Clientes Business notificados diretamente', value: 'Menos de 3%' },
    ],
    happened:
      'Segundo a empresa, em agosto de 2022 houve acesso a partes do ambiente de desenvolvimento por meio de uma conta de desenvolvedor comprometida, e código-fonte e informações técnicas foram copiados. Em 15/09/2022, após investigação com a Mandiant, a empresa disse não haver acesso a dados de clientes ou cofres. Em 30/11/2022 foi detectada atividade incomum em um serviço de nuvem compartilhado com uma afiliada. Em dezembro a empresa informou que o atacante usou informações do primeiro incidente para obter credenciais e chaves de descriptografia e copiou backups com dados de conta e cópias de cofres cujos campos sensíveis são criptografados.',
    outcome:
      'Após o primeiro incidente, a empresa relata ter reconstruído o ambiente de desenvolvimento, trocado máquinas e processos de autenticação de desenvolvedores e adicionado logging, alertas e EDR. Após o segundo, relata rotação de credenciais e certificados e análise de contas suspeitas. Autoridades e reguladores foram notificados. Não foi encontrada multa na página lida.',
    lessons: [
      'Ação corretiva deve tratar a causa-raiz e também o que o atacante pode ter levado e reutilizado depois.',
      'Uma conclusão de escopo ("sem dados de clientes") precisa ser revisitada quando surge novo fato.',
      'Credenciais e chaves precisam ser rotacionadas e segregadas entre ambientes, inclusive o armazenamento em nuvem compartilhado.',
    ],
    caveat:
      'Fonte única: a própria empresa, com a caracterização dela. O comunicado lido não tem seção de lições aprendidas; as lições acima são leitura editorial. A página remete a uma atualização de mar/2023 que não foi lida.' + NOTE_ISO,
    sources: [
      { label: 'LastPass: aviso de incidente de segurança recente (com atualizações)', url: 'https://blog.lastpass.com/posts/notice-of-recent-security-incident' },
    ],
  },

  // Anexo A.5: controles organizacionais (incidentes, continuidade, fornecedores).
  i08: {
    id: 'iso-mgm', kind: 'incidente',
    title: 'MGM Resorts (2023): desligar sistemas para conter e operar com impacto',
    authority: 'MGM Resorts (Form 8-K à SEC, 05/10/2023)',
    date: 'Comunicado em 12/09/2023; 8-K de 05/10/2023',
    facts: [
      { label: 'Impacto estimado em setembro (Adjusted Property EBITDAR)', value: '~US$ 100 mi' },
      { label: 'Ocupação em setembro', value: '88% (93% no ano anterior)' },
      { label: 'Despesas one-time no 3º tri', value: 'Menos de US$ 10 mi' },
    ],
    happened:
      'Segundo o 8-K, a empresa identificou um incidente de cibersegurança em seus sistemas dos EUA e desligou sistemas para reduzir o risco às informações de clientes. Houve disrupção operacional em setembro. Em 05/10 a empresa disse que praticamente todos os sistemas voltados ao hóspede haviam sido restaurados e que trabalhou com especialistas externos para reforçar salvaguardas. Dados obtidos pelos atores criminosos incluíam, para clientes anteriores a março de 2019, nome, contatos, gênero, data de nascimento e CNH; para um número limitado, também Social Security e passaporte.',
    outcome:
      'A empresa estimou o impacto negativo em ~US$ 100 milhões e disse crer que o seguro cibernético cobrirá o impacto financeiro, mas o escopo total dos custos ainda não estava determinado. Informou que não acreditava que senhas, contas bancárias ou dados de cartão tivessem sido obtidos. Não foi encontrada multa na página lida.',
    lessons: [
      'Conter um incidente pode exigir parar a operação: o plano de continuidade precisa prever como operar sem os sistemas.',
      'Comunicação com o mercado e com afetados é parte da gestão de incidentes, com números marcados como preliminares.',
      'Seguro cibernético ajuda no custo, mas não substitui contenção, restauração e priorização de sistemas críticos.',
    ],
    caveat:
      'O 8-K NÃO informa causa raiz nem vetor de ataque, então o caso ilustra gestão de incidente e continuidade, não uma falha de controle específica. Números são estimativas preliminares da empresa. Atualizações posteriores e atribuições vistas na imprensa não foram lidas nem usadas.' + NOTE_ISO,
    sources: [
      { label: 'SEC: MGM Resorts, Form 8-K de 05/10/2023', url: 'https://www.sec.gov/Archives/edgar/data/789570/000119312523251667/d461062d8k.htm' },
    ],
  },

  // Anexo A.6: controles de pessoas (trabalho remoto, contas pessoais).
  i09: {
    id: 'iso-okta', kind: 'incidente',
    title: 'Okta (2023): credencial de service account salva em perfil Google pessoal',
    authority: 'Okta (relato de causa raiz da própria empresa, 03/11/2023)',
    date: 'Acesso de 28/09/2023 a 17/10/2023; relato em 03/11/2023',
    facts: [
      { label: 'Clientes associados aos arquivos acessados', value: '134 (menos de 1%)' },
      { label: 'Clientes-alvo de sequestro de sessão', value: '5' },
      { label: 'Downloads sem log esperado', value: '14 dias' },
    ],
    happened:
      'Segundo a Okta, o acesso não autorizado ao sistema de suporte usou uma service account guardada no próprio sistema. A empresa afirma que o usuário e a senha dessa conta haviam sido salvos na conta Google pessoal de um funcionário, após login em um navegador Chrome gerenciado pela empresa com perfil pessoal. A Okta considera mais provável o comprometimento da conta ou do dispositivo pessoal, o que descreve como hipótese. Os arquivos acessados incluíam arquivos HAR com session tokens, usados em sequestro de sessão.',
    outcome:
      'A Okta desabilitou a conta, bloqueou o login no Chrome com perfis Google pessoais em laptops gerenciados, adicionou regras de detecção no sistema de suporte e vinculou tokens de sessão de administradores à localização de rede. Não foi encontrada multa na página lida.',
    lessons: [
      'Misturar identidade pessoal e corporativa no mesmo navegador cria um caminho para credenciais de trabalho.',
      'Regras claras sobre onde credenciais podem ser guardadas valem para todos, e controles técnicos devem reforçá-las.',
      'Service accounts precisam de dono, privilégio mínimo e monitoramento próprio.',
    ],
    caveat:
      'Fonte única: o relato da própria Okta; a causa exata do comprometimento é hipótese dela. Não lemos fontes independentes. O caso toca vários controles (identidade, logging), e o enquadramento em A.6 é uma escolha editorial.' + NOTE_ISO,
    sources: [
      { label: 'Okta: causa raiz do acesso ao sistema de casos de suporte', url: 'https://sec.okta.com/articles/2023/11/unauthorized-access-oktas-support-case-management-system-root-cause/' },
    ],
  },

  // Anexo A.7: controles físicos.
  i10: reuse(CIS_CASES_REST.c18),

  // Anexo A.8: controles tecnológicos.
  i11: reuse(CIS_CASES_REST.c05),
};

