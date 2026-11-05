/**
 * Casos reais da trilha CIS, controles 1 a 6 e 13 a 18. Só fatos lidos nas fontes citadas.
 * O mapeamento de cada caso a um controle é EDITORIAL (não é conclusão oficial dos órgãos citados).
 * Nenhum nome de pessoa (incluindo réus) é citado.
 */
import type { PrivacyCase } from './privacyExtras.js';

export const CIS_CASES_REST: Record<string, PrivacyCase> = {
  c01: {
    id: 'colonial-inventario', kind: 'incidente',
    title: 'Colonial Pipeline: o acesso remoto antigo que ninguém estava enxergando',
    authority: 'Senado dos EUA (audiência pública, jun/2021)',
    date: 'Ataque identificado em 07/05/2021; audiência em 08/06/2021',
    facts: [
      { label: 'Resgate pago (testemunho)', value: '~US$ 4,4 mi' },
      { label: 'Operação interrompida', value: 'Sex. a qua. seguinte' },
      { label: 'Ativo problemático', value: 'Perfil de VPN legado' },
    ],
    happened:
      'Na audiência no Senado, o CEO da Colonial Pipeline declarou que o atacante entrou por um perfil de VPN legado que não deveria estar em uso. Segundo ele, esse acesso não apareceu nos testes de invasão da empresa, o que chamou de "infeliz". A empresa interrompeu a operação do oleoduto a partir de 7 de maio de 2021.',
    outcome:
      'O CEO relatou o pagamento de cerca de US$ 4,4 milhões (75 bitcoins) em 8 de maio. Em audiência, um senador citou que o Departamento de Justiça recuperou 63,7 bitcoins. Não foi encontrada multa na página lida.',
    lessons: [
      'Um acesso que não está no inventário não é testado, monitorado nem desligado.',
      'Inventário de ativos inclui perfis e caminhos de acesso remoto antigos, não só servidores e notebooks.',
      'Teste de invasão e varredura só cobrem o que se sabe que existe.',
    ],
    caveat: 'Este é o MESMO incidente do Controle 6 (MFA), visto por outro ângulo: o que se enxerga. O mapeamento ao Controle 1 é editorial e aproximado: o testemunho fala de um acesso "não visto", não de falta formal de inventário. O CEO disse que a empresa ainda não sabia como a credencial foi obtida.',
    sources: [
      { label: 'Senado dos EUA: audiência sobre o ataque à Colonial Pipeline (Hearing 117-429)', url: 'https://www.govinfo.gov/content/pkg/CHRG-117shrg46569/html/CHRG-117shrg46569.htm' },
    ],
  },

  c02: {
    id: 'log4shell', kind: 'incidente',
    title: 'Log4Shell: "onde está o Log4j?" virou a pergunta que muita empresa não sabia responder',
    authority: 'FTC (alerta público) e imprensa especializada sobre o relatório do CSRB',
    date: 'Alerta da FTC em 04/01/2022; relatório do CSRB em jul/2022',
    facts: [
      { label: 'Vulnerabilidade', value: 'CVE-2021-44228' },
      { label: 'Alerta da FTC', value: '04/01/2022' },
      { label: 'Principal recomendação', value: 'Inventário de componentes (SBOM)' },
    ],
    happened:
      'Em dezembro de 2021 foi divulgada a vulnerabilidade Log4Shell em uma biblioteca de log muito usada, o Log4j. A FTC avisou que a biblioteca é "onipresente" em produtos de consumo, software corporativo e aplicações web, e orientou as empresas a verificar se a usam, atualizar e repassar o alerta. Segundo a imprensa especializada, o presidente do comitê que revisou o caso (CSRB) disse que, como a biblioteca estava embutida em muitos produtos, era difícil para as organizações saber onde estava o risco no próprio ambiente.',
    outcome:
      'Não houve multa ou acusação. O caso ficou como exemplo de que a primeira etapa de uma resposta é saber que software você tem e onde.',
    lessons: [
      'Sem inventário de software e de componentes, cada vulnerabilidade nova vira uma caça ao tesouro.',
      'Um software que a empresa "não instalou" pode vir embutido em outro produto.',
      'Inventário de componentes (SBOM) encurta o tempo entre o alerta e a ação.',
    ],
    caveat: 'O relatório do CSRB não pôde ser lido nesta pesquisa (acesso bloqueado). A afirmação sobre a dificuldade de localizar a biblioteca vem de uma fonte secundária (Infosecurity Magazine). Números de organizações afetadas e de horas de trabalho vistos em resumos de busca não foram usados.',
    sources: [
      { label: 'FTC: alerta às empresas sobre a vulnerabilidade do Log4j', url: 'https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2022/01/ftc-warns-companies-remediate-log4j-security-vulnerability' },
      { label: 'Infosecurity Magazine: o que o CSRB disse na Black Hat 2022', url: 'https://www.infosecurity-magazine.com/news/bhusa-the-cyber-safety-review/' },
    ],
  },

  c03: {
    id: 'uber-dados', kind: 'acordo',
    title: 'Uber (2016): dados sem criptografia e uma chave exposta em um site de código',
    authority: 'FTC (comunicado de abr/2018)',
    date: 'Acesso em nov/2016; acordo ampliado anunciado em 12/04/2018',
    facts: [
      { label: 'Nomes e e-mails', value: '25 milhões+' },
      { label: 'Nomes e celulares', value: '22 milhões' },
      { label: 'Nomes e CNHs (EUA)', value: '600 mil' },
    ],
    happened:
      'Segundo a FTC, invasores acessaram dados de consumidores guardados em um provedor de nuvem de terceiros usando uma chave de acesso que um engenheiro da Uber havia publicado em um site de compartilhamento de código. Eles baixaram arquivos sem criptografia. A FTC contabilizou mais de 25 milhões de nomes e e-mails, 22 milhões de nomes e números de celular e 600 mil nomes e números de carteira de motorista nos EUA.',
    outcome:
      'A FTC ampliou o acordo anterior com a empresa: ela deve notificar a FTC sobre incidentes futuros e entregar os relatórios de auditoria de terceiros, sob pena de multas civis. O comunicado lido não cita multa pelo incidente em si.',
    lessons: [
      'Criptografar dados em repouso reduz o dano quando uma chave ou acesso vaza.',
      'Chaves de acesso nunca devem ir para repositórios ou sites de código.',
      'Acesso a dados em nuvem deve ser restrito pelo mínimo necessário, e não depender de uma única chave.',
    ],
    caveat: 'O comunicado da FTC cita apenas "um provedor de nuvem de terceiros" e "um site de compartilhamento de código". Os nomes de provedor e de site vistos em outras fontes não foram confirmados em página lida. Este é o MESMO incidente do Controle 17 (resposta e encobrimento), visto aqui pelo ângulo da proteção de dados.',
    sources: [
      { label: 'FTC: Uber concorda com acordo ampliado (abr/2018)', url: 'https://www.ftc.gov/news-events/news/press-releases/2018/04/uber-agrees-expanded-settlement-ftc-related-privacy-security-claims' },
    ],
  },

  c04: {
    id: 'capital-one', kind: 'acordo',
    title: 'Capital One (2019): um firewall de aplicação mal configurado na nuvem',
    authority: 'Procuradoria dos EUA (Seattle) e OCC (regulador bancário)',
    date: 'Alerta em 17/07/2019; multa do OCC em 06/08/2020',
    facts: [
      { label: 'Alerta recebido', value: '17/07/2019' },
      { label: 'Intrusão confirmada', value: '19/07/2019' },
      { label: 'Multa do OCC', value: 'US$ 80 milhões' },
    ],
    happened:
      'Segundo a página do caso na Procuradoria, a intrusão nos dados armazenados do banco ocorreu por meio de um firewall de aplicação web (WAF) mal configurado. O banco foi alertado por um usuário de uma plataforma de código em 17 de julho de 2019, confirmou a intrusão em 19 de julho e acionou o FBI.',
    outcome:
      'Em agosto de 2020, o OCC aplicou multa de US$ 80 milhões. O motivo declarado foi a falha em estabelecer processos eficazes de avaliação de risco antes de migrar operações de TI relevantes para a nuvem pública, e a demora em corrigir as deficiências. O OCC reconheceu a notificação aos clientes e a remediação feitas pelo banco.',
    lessons: [
      'Configuração segura é um processo contínuo, e não uma tarefa de implantação.',
      'Mover sistemas para a nuvem exige reavaliar riscos e baselines de configuração antes.',
      'Corrigir deficiências conhecidas com rapidez pesa na avaliação do regulador.',
    ],
    caveat: 'O motivo oficial da multa do OCC foi a avaliação de risco na migração para a nuvem e a demora em corrigir, e não a configuração do firewall em si; não devemos afirmar mais do que isso. Número de vítimas e janela de tempo do roubo apareceram só em resumos de busca e foram omitidos. Não citamos o réu do processo criminal.',
    sources: [
      { label: 'Procuradoria dos EUA (Seattle): página do caso', url: 'https://www.justice.gov/usao-wdwa/united-states-v-paige-thompson' },
      { label: 'OCC: comunicado 2020-101 sobre a multa de US$ 80 milhões', url: 'https://www.occ.gov/news-issuances/news-releases/2020/nr-occ-2020-101.html' },
    ],
  },

  c05: {
    id: 'midnight-blizzard', kind: 'incidente',
    title: 'Midnight Blizzard: uma conta de teste esquecida e sem MFA abriu a porta',
    authority: 'Microsoft (relato próprio de resposta)',
    date: 'Detectado em 12/01/2024; relato de 25/01/2024',
    facts: [
      { label: 'Detecção', value: '12/01/2024' },
      { label: 'Técnica inicial', value: 'Password spray' },
      { label: 'Conta atacada', value: 'Teste legada, sem MFA' },
    ],
    happened:
      'Segundo a Microsoft, o ataque começou com uma técnica de password spray (tentativas de poucas senhas em muitas contas) contra uma conta legada de um ambiente de teste que não tinha MFA. Os atacantes usaram poucas tentativas e proxies residenciais para evitar detecção. A partir dessa conta, comprometeram uma aplicação OAuth de teste, também legada, com acesso elevado ao ambiente corporativo, e concederam a si mesmos uma permissão que dava acesso a caixas de e-mail.',
    outcome:
      'Não foi encontrada multa na página lida. A Microsoft afirma que um ambiente de teste criado hoje já teria MFA e proteções ativados por política.',
    lessons: [
      'Contas de teste, legadas e de serviço esquecidas são alvo preferido: precisam de dono, inventário e desativação.',
      'Aplicações com permissões amplas devem ser revisadas e removidas quando não usadas.',
      'Sem MFA, uma senha adivinhada basta.',
    ],
    caveat: 'A fonte é o relato da própria Microsoft, e os termos "legada" e "de teste" são a caracterização dela. Outras fontes não lidas podem discordar. Atualizações posteriores da empresa não foram consultadas.',
    sources: [
      { label: 'Microsoft Security: Midnight Blizzard, orientação para respondedores (25/01/2024)', url: 'https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/' },
    ],
  },

  c06: {
    id: 'colonial-acesso', kind: 'incidente',
    title: 'Colonial Pipeline: VPN sem autenticação de múltiplos fatores',
    authority: 'Senado dos EUA (audiência pública, jun/2021)',
    date: 'Ataque identificado em 07/05/2021; audiência em 08/06/2021',
    facts: [
      { label: 'Autenticação do VPN atacado', value: 'Fator único' },
      { label: 'Resgate pago (testemunho)', value: '~US$ 4,4 mi (75 BTC)' },
      { label: 'Recuperado pelo DOJ (citado)', value: '63,7 BTC' },
    ],
    happened:
      'Segundo o CEO, o atacante usou um perfil de VPN legado que tinha autenticação de fator único. A senha era complexa, e o uso normal da VPN envolvia um token RSA. Ele concordou que MFA é a orientação correta. A investigação da Mandiant estava em andamento na época, e o CEO disse que ainda não havia evidência de acesso à tecnologia operacional.',
    outcome:
      'A empresa pagou o resgate em 8 de maio de 2021 e a operação ficou interrompida até a quarta-feira seguinte, segundo o testemunho. Não foi encontrada multa na página lida.',
    lessons: [
      'Senha forte não substitui MFA em acesso remoto exposto à internet.',
      'Perfis de acesso antigos precisam ser revogados quando deixam de ser usados.',
      'MFA deve valer para todo caminho de acesso externo, e não apenas para o caminho "oficial".',
    ],
    caveat: 'Este é o MESMO incidente do Controle 1, visto pelo ângulo do acesso. O CEO disse que a empresa não sabia como a credencial foi obtida: isso é o que foi testemunhado, não uma conclusão de investigação. Valores de resgate variam entre veículos (US$ 4,3 a 5 milhões); usamos o da audiência.',
    sources: [
      { label: 'Senado dos EUA: audiência sobre o ataque à Colonial Pipeline (Hearing 117-429)', url: 'https://www.govinfo.gov/content/pkg/CHRG-117shrg46569/html/CHRG-117shrg46569.htm' },
    ],
  },

  c13: {
    id: 'target-monitoramento', kind: 'acordo',
    title: 'Target (2013): os alertas dispararam, mas ninguém agiu',
    authority: 'Procuradoria-Geral do Distrito de Colúmbia (acordo) e imprensa sobre o relatório do Senado',
    date: 'Incidente em nov/2013; acordo anunciado em 23/05/2017',
    facts: [
      { label: 'Contas de cartão afetadas', value: '41 milhões+' },
      { label: 'Clientes com contato exposto', value: '60 milhões+' },
      { label: 'Acordo entre estados', value: 'US$ 18,5 milhões' },
    ],
    happened:
      'Segundo a Procuradoria de Colúmbia, atacantes usaram credenciais roubadas de um fornecedor para chegar a um servidor de entrada da Target e depois a um banco de dados de atendimento ao cliente, onde instalaram malware e capturaram dados. De acordo com a imprensa, o relatório da equipe do Senado concluiu que a empresa não respondeu a vários alertas automáticos do próprio sistema contra intrusão, que cobriam a instalação do malware e as rotas planejadas de extração.',
    outcome:
      'Acordo de US$ 18,5 milhões com os estados. Entre as exigências: programa de segurança da informação, executivo responsável, avaliação independente, segmentação do ambiente de dados de cartão e autenticação em dois fatores para certas contas.',
    lessons: [
      'Monitoramento só protege se alguém recebe, prioriza e responde aos alertas.',
      'Alertas importantes precisam de dono, prazo e escalonamento.',
      'Segmentar a rede limita o que um acesso de fornecedor consegue alcançar.',
    ],
    caveat: 'O relatório do Senado não pôde ser lido (acesso bloqueado); a conclusão sobre os alertas ignorados vem da NBC News, fonte secundária. O comunicado da Procuradoria diz "46 estados", mas a própria lista indica 47 mais o Distrito. Contagens de clientes variam entre fontes; usamos as da Procuradoria.',
    sources: [
      { label: 'Procuradoria de Colúmbia: acordo multiestadual com a Target', url: 'https://oag.dc.gov/node/128' },
      { label: 'NBC News: Target ignorou sinais de alerta, diz relatório do Senado', url: 'https://www.nbcnews.com/business/consumer/target-missed-many-warning-signs-leading-breach-senate-report-n62021' },
    ],
  },

  c14: {
    id: 'twitter-2020', kind: 'incidente',
    title: 'Twitter (2020): telefonemas se passando pela TI levaram a contas famosas sequestradas',
    authority: 'Departamento de Serviços Financeiros de Nova York (NYDFS)',
    date: 'Ataque em 15/07/2020; relatório em 14/10/2020',
    facts: [
      { label: 'Funcionários induzidos', value: '4' },
      { label: 'Valor desviado de consumidores', value: 'US$ 118 mil+' },
      { label: 'Canal do ataque', value: 'Telefone' },
    ],
    happened:
      'Segundo o NYDFS, atacantes ligaram para funcionários da empresa se passando pelo departamento de TI e induziram quatro deles a entregar credenciais. Com isso, tomaram contas de figuras públicas e de empresas de criptomoedas e publicaram mensagens do tipo "dobre seus bitcoins", que levaram consumidores a transferir mais de US$ 118 mil. O NYDFS também apontou que a empresa não tinha um diretor de segurança (CISO) na época e que havia falhas de controle de acesso, de gestão de identidades e de monitoramento.',
    outcome:
      'O comunicado lido não menciona multa ou acordo. O órgão recomendou uma estrutura regulatória para grandes redes sociais. Plataformas de criptomoedas bloquearam rapidamente transferências para os endereços dos fraudadores.',
    lessons: [
      'O ataque foi por telefone: engenharia social não acontece só por e-mail.',
      'Funcionários precisam saber como confirmar a identidade de quem diz ser da TI, por um canal independente.',
      'Treinamento ajuda, mas controles técnicos (acesso mínimo, MFA resistente a golpes, monitoramento) são necessários também.',
    ],
    caveat: 'O comunicado do NYDFS descreve a personificação por telefone e não menciona treinamento: a ligação com o Controle 14 é editorial. Não lemos o relatório completo. Não afirmamos que o órgão recomendou treinar funcionários.',
    sources: [
      { label: 'NYDFS: comunicado do relatório sobre o ataque ao Twitter (14/10/2020)', url: 'https://www.dfs.ny.gov/reports_and_publications/press_releases/pr202010141' },
    ],
  },

  c15: {
    id: 'kaseya', kind: 'incidente',
    title: 'Kaseya VSA (2021): um fornecedor comprometido, centenas de clientes do cliente afetados',
    authority: 'Kaseya (visão geral do incidente publicada pela própria empresa)',
    date: 'A partir de sexta-feira, 02/07/2021 (ano inferido da própria página)',
    facts: [
      { label: 'Clientes diretos comprometidos', value: 'Menos de 60' },
      { label: 'Empresas afetadas depois (prelim.)', value: 'Menos de 1.500' },
      { label: 'Ferramenta de detecção (03/07)', value: '2.000+ downloads' },
    ],
    happened:
      'Segundo a Kaseya, atacantes exploraram vulnerabilidades ainda desconhecidas no VSA instalado nos clientes (on-premises) para burlar a autenticação e executar comandos, e usaram as próprias funções do VSA para distribuir ransomware aos computadores. Menos de 60 clientes diretos foram comprometidos, muitos deles provedores de TI, e o impacto total em empresas clientes deles ficou abaixo de 1.500, conforme os números preliminares da empresa.',
    outcome:
      'A empresa pediu que os clientes desligassem os servidores VSA locais e desligou preventivamente o serviço em nuvem. Contratou a Mandiant e liberou uma ferramenta de detecção em 3 de julho. A empresa afirma não ter evidência de comprometimento do serviço em nuvem nem de alteração maliciosa do código do produto.',
    lessons: [
      'Um fornecedor de ferramenta de gestão tem acesso privilegiado a muitos ambientes: o risco dele vira risco seu.',
      'Contratos e monitoramento de provedores precisam prever incidentes, comunicação e prazos.',
      'Saber quais fornecedores têm acesso privilegiado permite agir rápido quando um deles é atacado.',
    ],
    caveat: 'A única fonte é a própria Kaseya, parte interessada, com números explicitamente preliminares ("até agora"). As páginas da CISA e do FBI estavam bloqueadas, então não atribuímos nada a elas. Afirmações sobre grupo atacante, decifrador e prisões vistas só em resumos de busca não foram usadas.',
    sources: [
      { label: 'Kaseya: visão geral do incidente e detalhes técnicos', url: 'https://helpdesk.kaseya.com/hc/en-gb/articles/4403584098961-Incident-Overview-Technical-Details' },
    ],
  },

  c16: {
    id: 'moveit', kind: 'incidente',
    title: 'MOVEit Transfer (2023): injeção de SQL em um produto de transferência de arquivos',
    authority: 'FBI e CISA (aviso conjunto AA23-158A)',
    date: 'Exploração desde 27/05/2023; aviso de 07/06/2023',
    facts: [
      { label: 'Vulnerabilidade', value: 'CVE-2023-34362' },
      { label: 'Tipo', value: 'Injeção de SQL (zero-day)' },
      { label: 'Início (fontes abertas)', value: '27/05/2023' },
    ],
    happened:
      'Segundo o aviso do FBI e da CISA, o grupo CL0P passou a explorar uma vulnerabilidade de injeção de SQL ainda desconhecida no MOVEit Transfer. Aplicações web do produto expostas à internet foram infectadas com um web shell chamado LEMURLOOT, usado para roubar dados dos bancos de dados. O aviso lembra campanhas parecidas do mesmo grupo contra o Accellion FTA (2020 a 2021) e o GoAnywhere MFT (início de 2023).',
    outcome:
      'O aviso recomenda, entre outras medidas, inventário de ativos e de software, atualização, avaliações de vulnerabilidade, privilégio mínimo e lista de permissões. O trecho lido não traz contagem de vítimas, prazos de correção nem multas.',
    lessons: [
      'Injeção de SQL é uma falha clássica, e ainda aparece em produtos corporativos populares.',
      'Entradas de usuário precisam de validação e consultas parametrizadas desde o desenvolvimento.',
      'Quem usa o produto precisa de processo para receber, avaliar e aplicar correções rapidamente.',
    ],
    caveat: 'A versão em HTML da CISA estava bloqueada; lemos o PDF do aviso no site do FBI/IC3 (extraído localmente). Li apenas o início do texto: contagens de vítimas, pontuação de severidade e data da correção não foram verificadas e não são usadas. O início em 27/05/2023 é atribuído a "informações de fontes abertas" no aviso.',
    sources: [
      { label: 'FBI/CISA: aviso conjunto AA23-158A sobre o MOVEit Transfer (PDF)', url: 'https://www.ic3.gov/CSA/2023/230607.pdf' },
    ],
  },

  c17: {
    id: 'uber-resposta', kind: 'acordo',
    title: 'Uber (2016): um incidente respondido com pagamento e silêncio',
    authority: 'FTC e Procuradoria-Geral do Tennessee (em nome de 50 estados e DC)',
    date: 'Incidente em nov/2016; divulgado em nov/2017; acordo dos estados em 26/09/2018',
    facts: [
      { label: 'Pago aos invasores', value: 'US$ 100 mil' },
      { label: 'Tempo sem avisar', value: '~1 ano' },
      { label: 'Acordo com os estados', value: 'US$ 148 milhões' },
    ],
    happened:
      'Segundo a FTC, depois de invasores acessarem dados de consumidores, a Uber pagou US$ 100 mil a eles pelo programa de recompensa por vulnerabilidades e só informou consumidores e a própria FTC em novembro de 2017, cerca de um ano depois. A FTC lembra que investigava na época um incidente de 2014 que chamou de "extremamente semelhante". A Procuradoria do Tennessee confirma a demora de cerca de um ano para notificar e o pagamento de US$ 100 mil.',
    outcome:
      'Acordo de US$ 148 milhões com os 50 estados e o Distrito de Colúmbia, e acordo ampliado com a FTC, que exige notificar a FTC sobre incidentes futuros, sob pena de multa civil. Segundo a NBC News (fonte secundária), um júri federal condenou o ex-responsável de segurança por obstrução de justiça e ocultação de crime; a empresa cooperou e fechou um acordo que evitou acusações criminais contra ela.',
    lessons: [
      'Resposta a incidentes inclui decidir quem comunica, a quem e quando, antes que o incidente aconteça.',
      'Pagar invasores por um programa de recompensa não transforma um incidente em um achado de pesquisa.',
      'Esconder um incidente costuma custar mais caro que o incidente.',
    ],
    caveat: 'Este é o MESMO incidente do Controle 3, visto pelo ângulo da resposta. Os comunicados do Departamento de Justiça estavam bloqueados, então o resultado criminal vem de fonte secundária. Detalhes de pena que só apareceram em resumos de busca não foram usados. Não citamos pessoas.',
    sources: [
      { label: 'FTC: Uber concorda com acordo ampliado (abr/2018)', url: 'https://www.ftc.gov/news-events/news/press-releases/2018/04/uber-agrees-expanded-settlement-ftc-related-privacy-security-claims' },
      { label: 'Procuradoria-Geral do Tennessee: acordo de US$ 148 milhões (26/09/2018)', url: 'https://www.tn.gov/attorneygeneral/news/2018/9/26/pr18-26.html' },
      { label: 'NBC News: veredito no julgamento criminal (secundária)', url: 'https://www.nbcnews.com/news/us-news/former-uber-security-chief-found-guilty-concealing-data-breach-rcna50967' },
    ],
  },

  c18: {
    id: 'iowa-coalfire', kind: 'incidente',
    title: 'Iowa (2019): testadores de invasão presos durante um teste "autorizado"',
    authority: 'Administração dos Tribunais de Iowa (comunicado de 18/09/2019)',
    date: 'Comunicado de 18/09/2019',
    facts: [
      { label: 'Profissionais presos', value: '2' },
      { label: 'Local', value: 'Fórum do condado de Dallas' },
      { label: 'Documentos publicados', value: '5 (contrato e regras)' },
    ],
    happened:
      'Dois testadores de invasão da empresa Coalfire foram presos no fórum do condado de Dallas durante um trabalho de teste de segurança. A Administração dos Tribunais afirma que as duas partes acreditavam ter acordado as avaliações físicas nos locais do escopo, mas que os acontecimentos mostraram que interpretaram o escopo de formas diferentes. As duas partes concordaram em publicar, com trechos ocultados, os documentos do contrato: requisitos e premissas, ordem de serviço, regras de engajamento, autorização para engenharia social e contrato-mestre.',
    outcome:
      'Cada lado conduziu uma revisão independente, e a Administração pediu desculpas aos xerifes e conselhos dos condados de Dallas e Polk pela confusão e pelo impacto. O comunicado não traz acusações, data da prisão nem conclusões das revisões.',
    lessons: [
      'Teste de invasão precisa de escopo, regras de engajamento e autorização por escrito, claros para todas as partes.',
      'Quem é dono do local ou do sistema testado também precisa saber e autorizar.',
      'Combinar contatos de emergência e o que fazer se o teste for interrompido evita que o teste vire incidente.',
    ],
    caveat: 'O comunicado não diz quem autorizou qual atividade em qual local, nem se o proprietário do prédio (o condado) fazia parte da autorização. Detalhes vistos só em resumos de busca (data das prisões, valor do contrato, arquivamento de acusações) não foram usados. Não citamos pessoas.',
    sources: [
      { label: 'Tribunais de Iowa: comunicado da Administração dos Tribunais Estaduais', url: 'https://www.iowacourts.gov/announcements/state-court-administration-statement' },
    ],
  },
};
