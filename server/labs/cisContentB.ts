/**
 * Conteúdo didático dos Controles CIS 10 a 18. 100% fictício nos cenários (domínios .test, IPs RFC 5737).
 * RASCUNHO para revisão humana (Segurança da Informação).
 */
import { o, type CisContent } from './cisContentA.js';

export const CIS_CONTENT_B: Record<number, CisContent> = {
  10: {
    context:
      'O QUE SÃO DEFESAS CONTRA MALWARE? Medidas para impedir ou conter a instalação, a propagação e a execução de código malicioso: antimalware atualizado, controle de mídias removíveis, bloqueio de execução indevida e capacidade de isolar máquinas afetadas.\n\n' +
      'POR QUE CAMADAS? Nenhuma ferramenta pega tudo. O malware entra por e-mail, mídia removível, vulnerabilidades e downloads. Antimalware, correção de sistemas, filtros e segmentação se somam.\n\n' +
      'NA PRÁTICA: 1) mantenha antimalware ativo e atualizado em todos os equipamentos; 2) não permita que usuários o desativem; 3) tenha um procedimento de isolamento para máquinas infectadas.',
    scenarios: [
      {
        id: 'c10-s1',
        situation: 'No estacionamento da empresa, você encontra um pen drive com uma etiqueta escrita "Folha de pagamento 2026".',
        question: 'O que fazer?',
        options: [
          o('Conectar em um notebook de testes da empresa para descobrir a quem pertence e devolver.', 'É uma técnica clássica de ataque. Conectar mídia desconhecida pode instalar malware automaticamente.'),
          o('Não conectar em nenhum equipamento e entregar à Segurança, informando onde foi achado.', 'Correto. A equipe de segurança tem como analisar a mídia em ambiente isolado.', true),
          o('Conectar em um computador pessoal, que não guarda dados da empresa, e examinar os arquivos.', 'Você pode contaminar o computador e depois levar o problema para a empresa. Entregue à Segurança.'),
        ],
      },
      {
        id: 'c10-s2',
        situation: 'A ferramenta de proteção detecta, em poucos minutos, que vários computadores do mesmo andar estão criptografando arquivos e exibindo uma nota de resgate. A rede de arquivos está sendo afetada.',
        question: 'Qual é a primeira resposta mais adequada?',
        options: [
          o('Pagar o resgate o quanto antes para recuperar o acesso e voltar a operar no mesmo dia.', 'Pagar não garante recuperação, incentiva novos ataques e não é decisão individual. Primeiro contenha e acione a resposta a incidentes.'),
          o('Isolar os equipamentos afetados da rede, acionar a resposta a incidentes e preservar evidências.', 'Correto. Conter a propagação é prioridade, e a decisão sobre próximos passos cabe ao processo de incidentes.', true),
          o('Desligar só o monitor dos computadores afetados e seguir o expediente até a TI avisar.', 'Desligar o monitor não para a criptografia. O equipamento precisa ser isolado da rede.'),
          o('Reiniciar todos os servidores ao mesmo tempo para interromper o processo e limpar a memória.', 'Reiniciar sem análise pode destruir evidências e não impede a reinfecção.'),
        ],
      },
    ],
    visuals: {
      'c10-s1': { kind: 'chat', channel: 'Estacionamento · foto do achado', messages: [{ who: 'Você', text: 'Achei um pen drive no chão, perto da entrada.', attachment: 'pen_drive.jpg (etiqueta: "Folha de pagamento 2026")' }] },
      'c10-s2': { kind: 'log', title: 'Alertas da proteção de endpoints (últimos 5 min)', lines: ['PC-AND3-01  criptografia em massa de arquivos detectada', 'PC-AND3-02  criptografia em massa de arquivos detectada', 'PC-AND3-05  nota de resgate criada: LEIAME.txt', 'SRV-ARQ-01  acesso de gravação anômalo vindo de PC-AND3-01'] },
    },
    understand:
      'O QUE O CASO WANNACRY MOSTRA? Segundo o NAO, o ataque afetou ao menos 81 dos 236 hospitais do NHS e explorou sistemas Windows sem correção ou sem suporte; houve avisos, mas não havia como verificar o cumprimento local. O ransomware se espalhou pela rede.\n\n' +
      'COMO PENSAR: malware é problema de camadas. Contenção rápida, correção de sistemas e segmentação limitam o estrago.',
    goodPractices: [
      'Mantenha antimalware ativo, atualizado e protegido contra desativação por usuários.',
      'Nunca conecte mídias desconhecidas; entregue-as à Segurança.',
      'Tenha um procedimento de isolamento de equipamentos e de segmentos de rede.',
      'Combine antimalware com correção de sistemas e filtros de e-mail e web.',
    ],
  },

  11: {
    context:
      'O QUE É RECUPERAÇÃO DE DADOS? É a capacidade de restaurar sistemas e dados a um estado confiável depois de um incidente: ransomware, falha, erro humano ou desastre. Envolve backup automatizado, proteção das cópias, cópia isolada e testes de restauração.\n\n' +
      'POR QUE TESTAR? Um backup que nunca foi restaurado é uma esperança, e não uma garantia. É no teste que você descobre o tempo real de recuperação e as lacunas.\n\n' +
      'NA PRÁTICA: 1) automatize os backups dos dados críticos; 2) mantenha ao menos uma cópia isolada, que o atacante não alcance; 3) teste a restauração periodicamente e meça o tempo.',
    scenarios: [
      {
        id: 'c11-s1',
        situation: 'A empresa faz backup noturno dos servidores críticos há dois anos. Ninguém nunca restaurou um backup completo. Em uma simulação de ransomware, o time descobre que não sabe quanto tempo levaria para voltar.',
        question: 'Qual é a melhor ação?',
        options: [
          o('Considerar o backup confiável, já que roda todas as noites sem erro há dois anos.', 'Backup sem erro de execução não prova que a restauração funciona nem quanto tempo leva.'),
          o('Testar restaurações periodicamente, medir o tempo real e ajustar o plano de recuperação.', 'Correto. O teste revela a verdade sobre prazo e lacunas, e orienta investimentos.', true),
          o('Dobrar a frequência dos backups, para duas execuções por noite, e ampliar o armazenamento.', 'Mais cópias não resolvem a dúvida: ainda não se sabe se elas restauram.'),
        ],
      },
      {
        id: 'c11-s2',
        situation: 'Os backups ficam em um compartilhamento de rede que a conta de administrador do domínio consegue escrever e apagar. Uma análise mostra que um atacante com essa conta poderia apagar os backups.',
        question: 'O que melhorar?',
        options: [
          o('Manter o compartilhamento atual e pedir à equipe cuidado redobrado com a conta de administrador.', 'Cuidado individual não protege contra um atacante que obteve a conta.'),
          o('Criar cópia isolada e imutável, fora do domínio, e restringir quem altera os backups.', 'Isso mesmo. Backup alcançável pelo atacante é um backup que ele vai destruir. A cópia isolada é a última linha de defesa.', true),
          o('Renomear o compartilhamento e esconder o caminho dos backups na listagem de rede.', 'Esconder o nome não impede quem tem a conta e acesso à rede.'),
        ],
      },
    ],
    visuals: {
      'c11-s1': { kind: 'log', title: 'Relatório da simulação de recuperação', lines: ['backup noturno: executa sem erros há 730 dias', 'última restauração completa: nunca realizada', 'tempo estimado de recuperação (RTO): não medido', 'sistemas críticos mapeados: 14  ·  restauração testada: 0'] },
      'c11-s2': { kind: 'sheet', title: 'permissoes_backup.csv', columns: ['Local do backup', 'Quem escreve/apaga', 'Isolado do domínio?', 'Imutável?'], rows: [['\\\\srv-bkp\\diario', 'Administradores do domínio', 'não', 'não'], ['Cópia externa', '(não existe)', '-', '-']], note: 'Dados fictícios.' },
    },
    understand:
      'O QUE O CASO NORSK HYDRO MOSTRA? Segundo a empresa, PCs e servidores criptografados foram reconstruídos a partir de backups e, em 12 de abril de 2019, a maior parte das operações estava próxima do normal. Ainda assim, a recuperação foi complexa e demorada, e o custo estimado foi de cerca de 800 milhões de coroas norueguesas.\n\n' +
      'COMO PENSAR: backup é o que separa um incidente grave de uma crise sem saída; o teste e o isolamento decidem se ele funciona.',
    goodPractices: [
      'Automatize backups dos dados e sistemas críticos.',
      'Mantenha uma cópia isolada e imutável, fora do alcance das contas de administração.',
      'Teste restaurações com regularidade e meça o tempo real de recuperação.',
      'Tenha um plano de operação manual para o período de recuperação.',
    ],
  },

  12: {
    context:
      'O QUE É GESTÃO DA INFRAESTRUTURA DE REDE? É manter roteadores, firewalls, VPNs e demais equipamentos de rede atualizados, bem configurados e administrados com segurança, com arquitetura que limite o alcance de um comprometimento.\n\n' +
      'POR QUE OS EQUIPAMENTOS DE BORDA SÃO ALVO? Ficam expostos à internet, têm privilégios altos e muitas vezes não têm agente de segurança. Um aviso da CISA sobre gateways VPN mostra que falhas nesses equipamentos são exploradas em cadeia.\n\n' +
      'NA PRÁTICA: 1) mantenha inventário e versão dos equipamentos de borda; 2) não exponha interfaces de administração à internet; 3) tenha um plano de resposta para falhas críticas, incluindo isolamento e substituição.',
    scenarios: [
      {
        id: 'c12-s1',
        situation: 'O fabricante do gateway VPN da empresa publica um aviso: falhas críticas em cadeia estão sendo exploradas, ainda sem correção completa, e a recomendação é aplicar uma mitigação provisória. O equipamento está exposto à internet.',
        question: 'Qual é a melhor resposta?',
        options: [
          o('Aguardar a correção definitiva do fabricante, pois a mitigação provisória pode afetar a VPN.', 'Enquanto espera, o equipamento exposto continua vulnerável. Mitigações provisórias existem para isso.'),
          o('Aplicar a mitigação já, restringir a exposição e buscar sinais de comprometimento nos logs.', 'Correto. Em dispositivo de borda explorado ativamente, a ação é imediata e inclui verificar se já houve comprometimento.', true),
          o('Aplicar a mitigação provisória e arquivar o aviso, pois o fabricante já indicou o caminho.', 'Se a exploração começou antes do aviso, o equipamento pode já estar comprometido. É preciso verificar.'),
        ],
      },
      {
        id: 'c12-s2',
        situation: 'Uma varredura externa mostra que a interface de administração de um roteador da filial está acessível pela internet e ainda aceita o usuário e a senha padrão do fabricante.',
        question: 'Qual é a correção correta?',
        options: [
          o('Trocar a senha padrão do roteador e manter a interface de administração publicada na internet.', 'É necessário, mas deixar a interface exposta continua sendo um risco.'),
          o('Fechar a exposição na internet, administrar por rede dedicada com MFA e trocar credenciais.', 'Isso mesmo. Remover a exposição e proteger a administração resolve a causa, e a revisão dos logs verifica se houve abuso.', true),
          o('Desligar o roteador e deixar a filial sem rede até haver tempo para corrigir com calma.', 'Desligar interrompe o negócio sem necessidade. Fechar a exposição e trocar credenciais resolve com menos impacto.'),
        ],
      },
    ],
    visuals: {
      'c12-s1': { kind: 'email', from: 'seguranca@fabricante-exemplo.test', to: 'ti@empresa-exemplo.test', subject: 'Aviso urgente: falhas em cadeia no gateway VPN', body: ['Duas falhas críticas estão sendo exploradas em conjunto em gateways expostos à internet.', 'Há uma mitigação provisória disponível. A correção completa ainda será publicada.'] },
      'c12-s2': { kind: 'log', title: 'Varredura externa (resumo)', lines: ['alvo: 203.0.113.80  (roteador filial 3)', 'porta 443: interface de administração acessível da internet', 'autenticação: usuário e senha padrão do fabricante ACEITOS', 'versão do firmware: 2 anos sem atualização'] },
    },
    understand:
      'O QUE O AVISO DA CISA SOBRE O IVANTI MOSTRA? Segundo o aviso, atacantes encadearam três vulnerabilidades em gateways Ivanti Connect Secure e Policy Secure, mantiveram persistência que sobrevivia a um reset de fábrica, e a ferramenta de integridade do fabricante não era suficiente para detectar o comprometimento.\n\n' +
      'COMO PENSAR: equipamentos de borda precisam de atenção prioritária e de um plano de isolamento, não só de atualização.',
    goodPractices: [
      'Mantenha inventário e versão dos equipamentos de rede de borda.',
      'Nunca exponha interfaces de administração à internet; use rede de gerenciamento com MFA.',
      'Troque credenciais padrão e siga uma baseline de configuração.',
      'Tenha plano de resposta para falhas críticas: mitigar, verificar comprometimento e planejar substituição.',
    ],
  },

  13: {
    context:
      'O QUE É MONITORAMENTO E DEFESA DE REDE? É detectar atividade suspeita na rede e nos equipamentos (alertas de intrusão, tráfego anômalo, comportamento fora do padrão) e, principalmente, agir sobre o que é detectado.\n\n' +
      'POR QUE ALERTA SEM RESPOSTA NÃO PROTEGE? Segundo a imprensa sobre o relatório do Senado, a Target recebeu alertas automáticos sobre a instalação de malware e a extração de dados, mas não respondeu a vários deles. Ferramenta sem processo vira ruído.\n\n' +
      'NA PRÁTICA: 1) centralize e priorize alertas; 2) defina dono, prazo e escalonamento; 3) ajuste os limiares para reduzir falsos positivos; 4) segmente a rede para limitar o alcance de um acesso.',
    scenarios: [
      {
        id: 'c13-s1',
        situation: 'A fila do monitoramento tem 400 alertas sem triagem. Entre eles, um alerta de gravidade alta: transferência de grande volume de dados para um endereço externo desconhecido, às 3 da manhã, a partir de um servidor de banco de dados.',
        question: 'O que fazer?',
        options: [
          o('Processar a fila na ordem de chegada, do alerta mais antigo ao mais novo, sem reordenar.', 'Sem priorização por risco, o alerta grave pode ficar horas na fila.'),
          o('Triar o alerta crítico já, escalar, avaliar a contenção do servidor e depois ajustar a regra.', 'Correto. A triagem é por risco, e a melhoria do processo evita que alertas críticos se percam no volume.', true),
          o('Desativar os alertas de gravidade baixa e média para reduzir a fila e focar no que sobrar.', 'Pode ajudar a longo prazo se feito com análise, mas não resolve o alerta crítico agora, e desativar sem critério esconde sinais úteis.'),
        ],
      },
      {
        id: 'c13-s2',
        situation: 'Um fornecedor de climatização tem acesso remoto à rede para monitorar equipamentos. O diagrama mostra que a conta do fornecedor consegue alcançar também os servidores de pagamento.',
        question: 'Qual é a melhoria mais importante?',
        options: [
          o('Segmentar a rede para o fornecedor alcançar só a climatização, com MFA e sessões registradas.', 'Isso mesmo. Segmentação limita o alcance, e o monitoramento do acesso de terceiros permite detectar abuso.', true),
          o('Confiar no fornecedor e acompanhar o acesso apenas por reuniões trimestrais de revisão.', 'Confiança não substitui controle técnico. A conta do fornecedor pode ser roubada.'),
          o('Remover o diagrama de rede do alcance do fornecedor e mantê-lo apenas com a equipe de TI.', 'Esconder o desenho não muda o acesso real.'),
        ],
      },
    ],
    visuals: {
      'c13-s1': { kind: 'log', title: 'Fila de alertas (resumo)', lines: ['alertas aguardando triagem: 400', '03:07  ALTA   srv-db-02 → 203.0.113.99  412 GB enviados  (destino nunca visto antes)', '03:10  BAIXA  varredura de portas bloqueada pelo firewall', 'responsável pela fila fora do horário: (não definido)'] },
      'c13-s2': { kind: 'sheet', title: 'acessos_fornecedores.csv', columns: ['Conta', 'Fornecedor', 'Alcança', 'MFA', 'Sessão registrada'], rows: [['forn-clima', 'Climatização', 'Equipamentos + servidores de pagamento', 'não', 'não']], note: 'Dados fictícios.' },
    },
    understand:
      'O QUE O ACORDO DA TARGET EXIGIU? Segundo a Procuradoria de Colúmbia, o acordo inclui programa de segurança da informação, executivo responsável, avaliação independente, segmentação do ambiente de dados de cartão e autenticação em dois fatores para certas contas. A entrada foi por credenciais de um fornecedor.\n\n' +
      'COMO PENSAR: detectar é metade do trabalho. A outra metade é quem responde, em quanto tempo e com quais poderes.',
    goodPractices: [
      'Centralize alertas e defina dono, prazo e escalonamento por gravidade.',
      'Priorize a triagem por risco, e não por ordem de chegada.',
      'Segmente a rede para limitar o alcance de contas de fornecedores.',
      'Ajuste regras e limiares regularmente para reduzir falsos positivos.',
    ],
  },

  14: {
    context:
      'O QUE É TREINAMENTO DE CONSCIENTIZAÇÃO? É um programa contínuo que ajuda as pessoas a reconhecer, evitar e reportar ameaças, especialmente engenharia social: e-mail, telefone, mensagens e pessoas se passando por outras.\n\n' +
      'POR QUE NÃO É SÓ E-MAIL? O caso do Twitter em 2020 começou com telefonemas se passando pela TI. Qualquer canal pode ser usado para enganar alguém.\n\n' +
      'NA PRÁTICA: 1) ensine a verificar a identidade por um canal independente; 2) torne o reporte fácil e sem punição; 3) combine o treinamento com controles técnicos, porque nenhuma pessoa acerta sempre.',
    scenarios: [
      {
        id: 'c14-s1',
        situation: 'Você recebe uma ligação de alguém que diz ser "da TI". Ele afirma que há um problema na sua conta e pede que você leia em voz alta o código de verificação que acabou de chegar ao seu celular.',
        question: 'O que fazer?',
        options: [
          o('Ler o código ao ligante, já que ele conhece a estrutura da empresa e o nome do seu gestor.', 'Conhecer detalhes da empresa é fácil. Código de verificação nunca deve ser compartilhado com ninguém.'),
          o('Não passar o código, desligar, ligar de volta para o número oficial da TI e reportar.', 'Correto. Quem liga não prova identidade. A verificação é feita por um canal independente que você já conhece.', true),
          o('Pedir que a pessoa envie um e-mail e passar o código se a mensagem parecer oficial.', 'E-mails também podem ser falsificados. Código de verificação não se fornece por nenhum canal.'),
        ],
      },
      {
        id: 'c14-s2',
        situation: 'Em um exercício de phishing simulado, 12 pessoas clicaram no link. Um gestor propõe divulgar a lista de nomes para todos "como exemplo" e aplicar uma advertência.',
        question: 'Qual é a abordagem mais adequada?',
        options: [
          o('Divulgar a lista de nomes a todos como exemplo, pois a exposição muda o comportamento.', 'Exposição gera medo de reportar, e as pessoas passam a esconder erros reais.'),
          o('Orientar quem clicou sem punição, reforçar como reportar e medir também os reportes.', 'Isso mesmo. Cultura que valoriza o reporte rápido protege mais do que cultura de culpa.', true),
          o('Cancelar os próximos exercícios de phishing para não constranger ninguém e evitar reclamações.', 'Sem exercício e sem treino, a organização perde uma forma de medir e melhorar.'),
        ],
      },
    ],
    visuals: {
      'c14-s1': { kind: 'chat', channel: 'Registro da chamada (resumo)', messages: [{ who: 'Ligante', text: 'Oi, aqui é da TI. Detectamos um problema na sua conta. Vai chegar um código no seu celular. Pode ler ele pra mim para eu corrigir agora?' }] },
      'c14-s2': { kind: 'sheet', title: 'resultado_simulacao_phishing.csv', columns: ['Indicador', 'Valor'], rows: [['Mensagens enviadas', '300'], ['Clicaram no link', '12'], ['Reportaram como suspeita', '41'], ['Reportaram em até 10 min', '19']], note: 'Dados fictícios.' },
    },
    understand:
      'O QUE O CASO TWITTER MOSTRA? Segundo o NYDFS, atacantes ligaram para funcionários se passando pela TI e induziram quatro deles a entregar credenciais; com isso, contas de figuras públicas foram tomadas. O órgão também apontou falhas de controle de acesso, identidade e monitoramento.\n\n' +
      'COMO PENSAR: treinamento reduz o risco, mas precisa de controles técnicos ao lado, como acesso mínimo, MFA resistente a golpes e monitoramento.',
    goodPractices: [
      'Treine para verificar identidade por um canal independente, em qualquer meio.',
      'Facilite o reporte e não puna quem reporta ou clica e avisa.',
      'Meça reportes, e não só cliques, nos exercícios.',
      'Combine treinamento com controles técnicos (MFA, acesso mínimo, monitoramento).',
    ],
  },

  15: {
    context:
      'O QUE É GESTÃO DE PROVEDORES DE SERVIÇO? É conhecer, avaliar, contratar e acompanhar fornecedores que tratam dados sensíveis ou operam plataformas críticas: inventário, política, requisitos de segurança em contrato, notificação de incidentes e monitoramento.\n\n' +
      'POR QUE O RISCO É SEU TAMBÉM? Quando uma ferramenta de gestão tem acesso privilegiado a muitos ambientes, o comprometimento dela vira o comprometimento de todos. Foi o que a Kaseya descreveu em 2021.\n\n' +
      'NA PRÁTICA: 1) mantenha um inventário de fornecedores com o nível de acesso; 2) inclua segurança e notificação de incidentes no contrato; 3) tenha um plano para o dia em que o fornecedor for atacado.',
    scenarios: [
      {
        id: 'c15-s1',
        situation: 'Um fornecedor novo vai tratar dados de clientes em nome da empresa. O contrato padrão dele não traz nenhuma cláusula de segurança, de notificação de incidentes nem de auditoria. A área comercial quer assinar hoje.',
        question: 'O que fazer?',
        options: [
          o('Assinar hoje e negociar as cláusulas de segurança depois do primeiro mês de contrato.', 'Depois que o fornecedor já tem os dados, o poder de negociar cai. Os requisitos entram antes.'),
          o('Exigir no contrato segurança mínima, notificação de incidentes e direito de auditoria.', 'Correto. O contrato é a ferramenta que transforma expectativa em obrigação, e o inventário sustenta o acompanhamento.', true),
          o('Pedir ao fornecedor que garanta por e-mail que leva a segurança a sério e assinar hoje.', 'Uma declaração informal não cria obrigação nem prazo de notificação.'),
        ],
      },
      {
        id: 'c15-s2',
        situation: 'Às 23h, um fornecedor de gestão de TI avisa que sofreu um incidente em uma de suas ferramentas, e que clientes podem ser afetados. A empresa usa essa ferramenta com acesso privilegiado em vários servidores.',
        question: 'Qual é a primeira resposta mais adequada?',
        options: [
          o('Aguardar até segunda-feira para tratar com calma, com a equipe completa e o fornecedor disponível.', 'Cada hora a mais mantém o acesso privilegiado exposto. Incidentes de fornecedor exigem resposta imediata.'),
          o('Acionar a resposta a incidentes, desativar a integração do fornecedor e verificar os ambientes.', 'Isso mesmo. Tratar como incidente seu, conter o acesso do fornecedor e verificar se foi usado contra você.', true),
          o('Pedir mais detalhes ao fornecedor e aguardar o relatório técnico completo antes de qualquer ação.', 'Esperar detalhes mantém a exposição. A contenção começa em paralelo.'),
        ],
      },
    ],
    visuals: {
      'c15-s1': { kind: 'form', title: 'Checklist do contrato do fornecedor', fields: [{ label: 'Requisitos mínimos de segurança' }, { label: 'Notificação de incidentes (prazo)' }, { label: 'Direito de auditoria' }, { label: 'Devolução ou eliminação dos dados' }], note: 'Nenhum dos quatro itens consta no contrato padrão proposto.' },
      'c15-s2': { kind: 'email', from: 'incidentes@fornecedor-ti-exemplo.test', to: 'ti@empresa-exemplo.test', subject: 'Comunicado de incidente: ferramenta de gestão', body: ['Identificamos um incidente em nossa ferramenta de gestão remota.', 'Clientes podem ser afetados. Recomendamos desligar a ferramenta local até nova orientação.'] },
    },
    understand:
      'O QUE O CASO KASEYA MOSTRA? Segundo a própria Kaseya, atacantes exploraram falhas no VSA local e usaram as funções do produto para distribuir ransomware; menos de 60 clientes diretos foram comprometidos, muitos deles provedores de TI, com impacto preliminar abaixo de 1.500 empresas.\n\n' +
      'COMO PENSAR: o risco do fornecedor é risco seu. Contrato, inventário e plano de resposta preparam o dia do incidente.',
    goodPractices: [
      'Mantenha um inventário de fornecedores com tipo de dado e nível de acesso.',
      'Inclua segurança, notificação de incidentes e auditoria nos contratos.',
      'Limite e monitore o acesso privilegiado de fornecedores.',
      'Tenha um plano de ação para quando um fornecedor for atacado.',
    ],
  },

  16: {
    context:
      'O QUE É SEGURANÇA DE SOFTWARE DE APLICAÇÃO? É gerenciar a segurança durante todo o ciclo de vida do software que a empresa desenvolve, hospeda ou compra: requisitos, desenvolvimento, testes, correção e resposta a falhas reportadas.\n\n' +
      'POR QUE FALHAS CLÁSSICAS AINDA APARECEM? A injeção de SQL é conhecida há décadas, e ainda esteve no centro do ataque ao MOVEit Transfer em 2023. Falhas básicas escapam quando não há revisão, testes e processo.\n\n' +
      'NA PRÁTICA: 1) valide entradas e use consultas parametrizadas; 2) inclua análise de código e testes no pipeline; 3) tenha um canal e um processo para receber e tratar vulnerabilidades reportadas.',
    scenarios: [
      {
        id: 'c16-s1',
        situation: 'Em uma revisão de código, você vê que a busca de clientes monta a consulta ao banco concatenando o texto digitado pelo usuário diretamente na instrução SQL. O prazo de entrega é amanhã.',
        question: 'O que fazer?',
        options: [
          o('Aprovar a revisão, pois o prazo é curto e o sistema é de uso apenas interno.', 'Sistemas internos também são atacados, e uma injeção de SQL pode expor ou alterar toda a base.'),
          o('Pedir correção com consultas parametrizadas e incluir análise estática no pipeline.', 'Correto. A correção é pequena perto do impacto, e a automação evita a repetição do erro.', true),
          o('Aprovar e abrir um chamado para corrigir depois, quando houver folga no cronograma.', 'Chamado sem prazo e sem dono costuma ficar para sempre.'),
        ],
      },
      {
        id: 'c16-s2',
        situation: 'Um pesquisador de segurança envia um e-mail ao suporte da empresa relatando uma vulnerabilidade em um produto, com passos para reproduzir. O atendente não sabe o que fazer com a mensagem.',
        question: 'Como a empresa deveria tratar?',
        options: [
          o('Ignorar o e-mail, pois provavelmente é golpe ou tentativa de intimidar a empresa.', 'Relatos legítimos de pesquisadores são uma fonte valiosa de correção. Ignorar leva a divulgações sem aviso.'),
          o('Responder com uma notificação jurídica para que o pesquisador interrompa os testes e apague tudo.', 'Ameaçar afasta quem ajuda e pode levar a divulgação pública antes da correção.'),
          o('Encaminhar ao processo de vulnerabilidades: confirmar, triar e atribuir dono e prazo.', 'Isso mesmo. Ter um canal e um processo transforma o relato em correção e preserva a relação com a comunidade.', true),
        ],
      },
    ],
    visuals: {
      'c16-s1': { kind: 'log', title: 'Trecho do código em revisão', lines: ['const termo = req.query.nome;', 'const sql = "SELECT * FROM clientes WHERE nome = \'" + termo + "\'";', 'const resultado = await db.query(sql);', '// prazo de entrega: amanhã'] },
      'c16-s2': { kind: 'email', from: 'pesquisador.exemplo@exemplo.test', to: 'suporte@empresa-exemplo.test', subject: 'Possível vulnerabilidade no produto X', body: ['Encontrei uma falha que permite acessar dados de outros clientes. Segue o passo a passo para reproduzir.', 'Gostaria de coordenar a divulgação com vocês.'] },
    },
    understand:
      'O QUE O AVISO SOBRE O MOVEIT MOSTRA? Segundo o FBI e a CISA, o grupo CL0P explorou uma injeção de SQL ainda desconhecida no MOVEit Transfer e usou um web shell para roubar dados dos bancos de dados. O aviso lembra campanhas semelhantes contra outros produtos de transferência de arquivos.\n\n' +
      'COMO PENSAR: falha básica de código escala quando o produto é muito usado. Processo, testes e canal de vulnerabilidades reduzem o risco.',
    goodPractices: [
      'Use consultas parametrizadas e valide entradas em todo o código.',
      'Automatize análise estática e testes de segurança no pipeline.',
      'Mantenha inventário de componentes de terceiros (SBOM).',
      'Tenha um canal público e um processo para receber e tratar vulnerabilidades.',
    ],
  },

  17: {
    context:
      'O QUE É GESTÃO DE RESPOSTA A INCIDENTES? É ter, antes do incidente, pessoas designadas, contatos, um processo de reporte e um plano de resposta, e ensaiá-los: quem decide, quem comunica, o que preservar e em quanto tempo.\n\n' +
      'POR QUE O ENSAIO IMPORTA? No dia do incidente, ninguém tem tempo de inventar o processo. Exercícios revelam lacunas de contato, de decisão e de comunicação.\n\n' +
      'NA PRÁTICA: 1) defina responsáveis e substitutos; 2) mantenha contatos de reporte atualizados; 3) reporte de imediato, preserve evidências e deixe as decisões de comunicação e de pagamento com quem tem competência.',
    scenarios: [
      {
        id: 'c17-s1',
        situation: 'Na sexta às 18h, você percebe que uma conta administrativa fez acessos estranhos a servidores de clientes. Seu gestor sugere: "Vamos esperar a segunda-feira para não fazer alarme no fim de semana".',
        question: 'O que fazer?',
        options: [
          o('Esperar até segunda-feira, como o gestor sugeriu, para evitar alarme no fim de semana.', 'Cada hora a mais amplia o que o atacante pode fazer. Incidente não respeita o calendário.'),
          o('Acionar já o contato de incidentes, preservar logs e evidências e não tentar resolver sozinho.', 'Correto. Reportar rápido é o que permite avaliar, conter e decidir sobre comunicações a tempo.', true),
          o('Trocar a senha da conta, registrar a troca em um chamado comum e avisar só o gestor.', 'Trocar a senha pode ser parte da contenção, mas sem reporte não há investigação nem avaliação do alcance.'),
        ],
      },
      {
        id: 'c17-s2',
        situation: 'Depois de um acesso indevido a dados, o invasor escreve oferecendo "apagar tudo" em troca de dinheiro. Alguém da equipe sugere pagar discretamente pelo programa de recompensa por vulnerabilidades, "para encerrar logo e sem barulho".',
        question: 'Qual é a conduta adequada?',
        options: [
          o('Pagar discretamente pelo programa de recompensa, para encerrar logo e evitar publicidade.', 'Foi o que a Uber fez, e o encobrimento e a demora em avisar geraram acordos e processos. A decisão não cabe a uma pessoa sozinha.'),
          o('Escalar à liderança e ao jurídico, preservar evidências e avaliar as obrigações de comunicação.', 'Isso mesmo. Pagamento e comunicação são decisões de liderança e jurídico, com registro e avaliação de obrigações.', true),
          o('Apagar o e-mail do invasor e seguir sem comentar, para não alimentar o contato nem expor a equipe.', 'A mensagem é evidência importante e deve ser preservada e reportada.'),
        ],
      },
    ],
    visuals: {
      'c17-s1': { kind: 'chat', channel: 'Gestor · conversa direta (sexta, 18h)', messages: [{ who: 'Você', text: 'Vi acessos estranhos da conta adm-svc aos servidores de clientes às 17h40.' }, { who: 'Gestor', text: 'Vamos esperar segunda para não fazer alarme no fim de semana, ok?' }] },
      'c17-s2': { kind: 'email', from: 'contato@anonimo-exemplo.test', to: 'seguranca@empresa-exemplo.test', subject: 'Sobre os dados que obtivemos', body: ['Temos uma cópia dos dados. Podemos apagar tudo em troca de um pagamento pelo programa de vulnerabilidades.', 'Aguardamos resposta em 48 horas.'] },
    },
    understand:
      'O QUE O CASO UBER MOSTRA? Segundo a FTC, a empresa pagou US$ 100 mil aos invasores pelo programa de recompensa e só informou consumidores e a FTC cerca de um ano depois; a Procuradoria do Tennessee confirma a demora e o pagamento, e houve acordo de US$ 148 milhões com os estados.\n\n' +
      'COMO PENSAR: esconder um incidente costuma custar mais caro que o incidente. A resposta é processo, e não improviso.',
    goodPractices: [
      'Designe responsáveis e substitutos e mantenha contatos de reporte atualizados.',
      'Reporte de imediato, preserve evidências e não tente resolver sozinho.',
      'Deixe decisões de comunicação e de pagamento com a liderança e o jurídico.',
      'Faça exercícios de resposta a incidentes com regularidade.',
    ],
  },

  18: {
    context:
      'O QUE É TESTE DE INVASÃO? É simular as ações de um atacante contra pessoas, processos e tecnologia para descobrir fraquezas antes de um atacante real. Exige escopo, regras de engajamento e autorização formais de quem é dono de cada alvo.\n\n' +
      'POR QUE A AUTORIZAÇÃO É PARTE DO CONTROLE? Em 2019, dois profissionais de uma empresa de testes foram presos em um fórum em Iowa durante um trabalho contratado, porque as partes interpretaram o escopo de formas diferentes. Escopo ambíguo transforma teste em incidente.\n\n' +
      'NA PRÁTICA: 1) documente escopo, janelas de tempo e regras; 2) tenha autorização de todos os donos dos alvos; 3) defina contatos de emergência; 4) corrija os achados e confirme com um novo teste.',
    scenarios: [
      {
        id: 'c18-s1',
        situation: 'Uma área de negócio quer contratar um teste de invasão para a próxima semana. O e-mail de contratação diz apenas: "testar a segurança do nosso site". Parte da infraestrutura pertence a um provedor de nuvem e a um parceiro.',
        question: 'O que deve ser definido antes de começar?',
        options: [
          o('Definir apenas o preço e o prazo, pois o fornecedor de testes já sabe o que fazer e tem experiência.', 'Escopo vago é exatamente o que gera conflito, danos e até problemas legais.'),
          o('Documentar escopo, regras, autorização de todos os donos dos alvos e contatos de emergência.', 'Correto. Escopo, regras e autorização claros protegem quem testa e quem é testado.', true),
          o('Combinar o escopo por telefone com o fornecedor para agilizar e evitar burocracia.', 'Sem registro escrito, cada parte lembra um combinado diferente.'),
        ],
      },
      {
        id: 'c18-s2',
        situation: 'O relatório de um teste de invasão traz 12 achados, três deles críticos. A equipe responsável diz que vai corrigir "quando houver tempo" e arquivar o relatório.',
        question: 'O que melhorar?',
        options: [
          o('Arquivar o relatório, que já cumpriu o papel de documentar o estado atual da segurança.', 'Um relatório sem correção é só um mapa para o atacante.'),
          o('Priorizar por risco, atribuir dono e prazo, corrigir os críticos primeiro e repetir o teste.', 'Isso mesmo. O valor do teste está na correção e na verificação posterior.', true),
          o('Corrigir só os achados fáceis primeiro, para mostrar resultado rápido à diretoria.', 'Ignorar os críticos para mostrar números mascara o risco real.'),
        ],
      },
    ],
    visuals: {
      'c18-s1': { kind: 'email', from: 'negocios@empresa-exemplo.test', to: 'compras@empresa-exemplo.test', subject: 'Contratar teste de invasão', body: ['Preciso de um teste de invasão para a semana que vem. Basta testar a segurança do nosso site.', 'Parte do ambiente é hospedada em um provedor de nuvem e há integração com um parceiro.'] },
      'c18-s2': { kind: 'sheet', title: 'achados_teste_invasao.csv (resumo)', columns: ['Severidade', 'Quantidade', 'Responsável', 'Prazo'], rows: [['Crítica', '3', '(vazio)', '(vazio)'], ['Alta', '4', '(vazio)', '(vazio)'], ['Média', '5', '(vazio)', '(vazio)']], note: 'Dados fictícios. Nenhum achado tem dono ou prazo.' },
    },
    understand:
      'O QUE O CASO DE IOWA MOSTRA? Segundo a Administração dos Tribunais, as duas partes acreditavam ter acordado as avaliações físicas, mas interpretaram o escopo de formas diferentes. Os documentos do contrato (requisitos, regras de engajamento e autorização de engenharia social, entre outros) foram publicados depois.\n\n' +
      'COMO PENSAR: teste de invasão é uma operação autorizada. Sem escopo e autorização claros de todos os donos, o mesmo teste vira um problema.',
    goodPractices: [
      'Documente escopo, regras de engajamento, janelas e contatos de emergência.',
      'Obtenha autorização de todos os donos dos alvos, inclusive provedores e parceiros.',
      'Priorize os achados por risco, com dono e prazo.',
      'Repita o teste para confirmar as correções.',
    ],
  },
};
