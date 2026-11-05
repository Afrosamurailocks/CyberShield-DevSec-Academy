/**
 * Conteúdo didático dos Controles CIS 1 a 9. 100% fictício nos cenários (domínios .test, IPs RFC 5737).
 * RASCUNHO para revisão humana (Segurança da Informação).
 */
import type { PrivacyScenario } from './privacy.js';
import type { ScenarioVisual } from './privacyExtras.js';

export interface CisContent {
  context: string;
  scenarios: PrivacyScenario[];
  visuals: Record<string, ScenarioVisual>;
  understand: string;
  goodPractices: string[];
}

export const o = (text: string, feedback: string, correct = false) => ({ text, feedback, correct });

export const CIS_CONTENT_A: Record<number, CisContent> = {
  1: {
    context:
      'O QUE É UM ATIVO CORPORATIVO? Qualquer equipamento que guarda, processa ou transmite dados da empresa: notebooks, celulares, servidores, equipamentos de rede, dispositivos IoT, máquinas virtuais e recursos em nuvem. O Controle 1 pede que você saiba o que existe, quem é o dono e se está autorizado.\n\n' +
      'POR QUE ISSO VEM PRIMEIRO? Você não protege, não atualiza e não monitora o que não sabe que existe. Equipamentos desconhecidos e acessos antigos esquecidos são portas abertas que ninguém está vigiando.\n\n' +
      'NA PRÁTICA: 1) mantenha um inventário com dono e finalidade; 2) use descoberta ativa para comparar o que existe com o que está no inventário; 3) trate rápido o que for desconhecido: identifique, autorize ou remova.',
    scenarios: [
      {
        id: 'c01-s1',
        situation: 'A varredura semanal da rede encontrou três dispositivos que não constam no inventário. Um deles responde na sub-rede dos servidores financeiros.',
        question: 'Qual é a ação mais adequada?',
        options: [
          o('Cadastrar os três no inventário hoje mesmo, para a lista da próxima auditoria ficar completa.', 'Registrar sem verificar legitima um possível intruso. Primeiro é preciso saber o que são e quem os colocou.'),
          o('Isolar o dispositivo da sub-rede financeira, identificar o dono de cada um e só então autorizar ou remover.', 'Correto. Descobrir, investigar, decidir e só então registrar ou remover, começando pelo de maior risco.', true),
          o('Aguardar a próxima varredura semanal para ver se os três continuam aparecendo antes de agir.', 'Esperar uma semana deixa um possível intruso na sub-rede financeira. A varredura existe para provocar ação imediata sobre o que é desconhecido.'),
        ],
      },
      {
        id: 'c01-s2',
        situation: 'Ao revisar os perfis de acesso remoto, a equipe encontra um perfil de VPN criado há mais de um ano para um fornecedor. Ninguém sabe quem o solicitou e não há registro dele no inventário.',
        question: 'O que fazer?',
        options: [
          o('Manter o perfil como está, já que ninguém reclamou do acesso e o fornecedor ainda o usa a cada poucos dias.', 'Acesso sem dono é risco. A ausência de reclamação não prova uso legítimo.'),
          o('Apagar o perfil na hora, sem confirmar com o fornecedor nem checar se algum serviço depende dele.', 'Pode derrubar um serviço legítimo sem aviso. O caminho é identificar o dono e o uso antes de desligar.'),
          o('Tratar como ativo: achar dono e uso pelos logs e desativar se não houver justificativa.', 'Isso mesmo. Caminhos de acesso também são ativos, e acesso sem dono deve ser revisado e, se não justificado, desligado.', true),
        ],
      },
    ],
    visuals: {
      'c01-s1': { kind: 'sheet', title: 'varredura_rede_vs_inventario.csv', columns: ['IP', 'Nome', 'No inventário?', 'Sub-rede'], rows: [['10.20.1.14', 'srv-fin-02', 'sim', 'Financeiro'], ['10.20.1.77', '(desconhecido)', 'NÃO', 'Financeiro'], ['10.30.4.9', '(desconhecido)', 'NÃO', 'Visitantes'], ['10.30.4.12', '(desconhecido)', 'NÃO', 'Visitantes']], note: 'Dados fictícios. Resultado da varredura semanal.' },
      'c01-s2': { kind: 'sheet', title: 'perfis_vpn_revisao.csv', columns: ['Perfil', 'Criado', 'Último uso', 'Dono', 'MFA'], rows: [['vpn-equipe-ti', 'há 8 meses', 'ontem', 'TI', 'sim'], ['vpn-forn-legado', 'há 14 meses', 'há 3 dias', '(vazio)', 'não'], ['vpn-diretoria', 'há 2 anos', 'hoje', 'Diretoria', 'sim']], note: 'Dados fictícios.' },
    },
    understand:
      'O QUE LIGA OS DOIS CASOS? Em ambos, o risco estava no que a empresa não enxergava: dispositivos fora do inventário e um acesso sem dono. O caso Colonial Pipeline mostra o mesmo padrão: um acesso antigo que não aparecia nos testes.\n\n' +
      'COMO PENSAR: o inventário é um processo de comparação, e não uma planilha parada. A pergunta é sempre "o que existe que eu não sei?".',
    goodPractices: [
      'Mantenha inventário com dono, finalidade e data de revisão para cada ativo.',
      'Compare periodicamente o inventário com o que a rede realmente mostra (descoberta ativa).',
      'Trate ativo desconhecido como incidente em potencial até provar o contrário.',
      'Inclua perfis de acesso remoto e contas de fornecedores na revisão de ativos.',
    ],
  },

  2: {
    context:
      'O QUE É UM ATIVO DE SOFTWARE? Sistemas operacionais, aplicações, bibliotecas, serviços e scripts que rodam no seu ambiente, inclusive os que vêm embutidos em outros produtos. O Controle 2 pede um inventário e a garantia de que só roda o que é autorizado e tem suporte.\n\n' +
      'POR QUE ISSO IMPORTA? Quando uma vulnerabilidade é anunciada, a primeira pergunta é "onde isso roda na minha empresa?". Sem inventário, a resposta leva dias, e o atacante não espera.\n\n' +
      'NA PRÁTICA: 1) liste o software com versão e responsável; 2) marque o que está fora de suporte; 3) mantenha o inventário de componentes das aplicações próprias (SBOM) para saber quais bibliotecas elas usam.',
    scenarios: [
      {
        id: 'c02-s1',
        situation: 'Saiu um alerta crítico sobre uma biblioteca de log muito usada. O líder de um time diz: "Não usamos essa biblioteca, pode seguir." Ninguém conferiu.',
        question: 'Qual é o próximo passo?',
        options: [
          o('Confiar no líder e encerrar o alerta, já que o time dele conhece bem o próprio código.', 'A memória das pessoas não é um inventário. Bibliotecas costumam vir embutidas em outros componentes.'),
          o('Pedir a cada fornecedor que confirme por e-mail e aguardar as respostas antes de fazer qualquer busca interna.', 'Ajuda em produtos de terceiros, mas não cobre o que a empresa desenvolveu. A verificação interna vem primeiro.'),
          o('Buscar a biblioteca no inventário, no SBOM e nos repositórios, e consultar os fornecedores de terceiros.', 'Correto. A resposta vem de dados, e não de memória, e inclui dependências indiretas e produtos de terceiros.', true),
        ],
      },
      {
        id: 'c02-s2',
        situation: 'O inventário mostra que um sistema interno de controle de contratos roda em uma versão sem suporte do fabricante desde o ano passado. A área de negócio pede para "deixar como está, funciona bem".',
        question: 'Como tratar?',
        options: [
          o('Registrar o risco com dono e prazo, isolar e monitorar o sistema e planejar a migração.', 'Isso mesmo. Software sem suporte não recebe correções: o risco precisa de dono, prazo e proteção enquanto não sai.', true),
          o('Aceitar o risco sem registro formal, pois o sistema é interno e a área de negócio já o aprovou.', 'Interno não significa seguro. Sem registro formal, o risco desaparece da gestão.'),
          o('Desligar o sistema agora mesmo e comunicar o negócio depois, pelo risco de uma falha sem correção.', 'Ignorar o impacto no negócio costuma levar a exceções informais. O plano deve equilibrar risco e continuidade.'),
        ],
      },
    ],
    visuals: {
      'c02-s1': { kind: 'chat', channel: '#seguranca-alertas', messages: [{ who: 'Segurança', text: 'Alerta crítico em uma biblioteca de log muito usada. Todos os times, confirmem se usam.' }, { who: 'Líder do time A', text: 'Não usamos essa biblioteca, pode seguir.' }] },
      'c02-s2': { kind: 'sheet', title: 'inventario_software.csv (trecho)', columns: ['Sistema', 'Versão', 'Suporte do fabricante', 'Responsável'], rows: [['Portal de RH', '5.4', 'ativo', 'RH/TI'], ['Controle de contratos', '2.1', 'ENCERRADO há 14 meses', 'Jurídico'], ['Wiki interna', '9.1', 'ativo', 'TI']], note: 'Dados fictícios.' },
    },
    understand:
      'O QUE O LOG4SHELL ENSINOU? A pergunta "onde está esse software?" foi difícil de responder para muitas organizações, porque a biblioteca estava dentro de outros produtos. A FTC e o relatório do CSRB reforçaram a importância do inventário e do SBOM.\n\n' +
      'COMO PENSAR: inventário de software não é só "o que instalamos", é também "o que vem dentro do que instalamos".',
    goodPractices: [
      'Mantenha inventário de software com versão, dono e status de suporte.',
      'Gere e guarde o SBOM das aplicações que você desenvolve ou contrata.',
      'Planeje a saída do software sem suporte; enquanto não sai, isole e monitore.',
      'Use dados (varredura, repositórios) para responder a alertas, não suposições.',
    ],
  },

  3: {
    context:
      'O QUE É PROTEÇÃO DE DADOS NO CIS? É saber quais dados a empresa tem, onde estão e quem acessa, e protegê-los conforme a sensibilidade: classificação, controle de acesso, criptografia, retenção e descarte.\n\n' +
      'POR QUE A CRIPTOGRAFIA E O ACESSO MÍNIMO? Dado em texto puro com acesso amplo transforma qualquer vazamento de chave ou conta em um vazamento de dados completo.\n\n' +
      'NA PRÁTICA: 1) classifique os dados; 2) restrinja o acesso ao necessário; 3) criptografe dados sensíveis em repouso e em dispositivos; 4) nunca deixe chaves, senhas e tokens em código ou repositórios.',
    scenarios: [
      {
        id: 'c03-s1',
        situation: 'Um desenvolvedor percebe que enviou, por engano, um arquivo de configuração com uma chave de acesso do armazenamento em nuvem para um repositório de código público. Ele apaga o arquivo no commit seguinte e segue trabalhando.',
        question: 'Qual deve ser a conduta?',
        options: [
          o('Considerar resolvido, pois o arquivo foi removido do repositório no commit seguinte, sem deixar vestígio.', 'O histórico do repositório mantém o arquivo, e a chave já pode ter sido copiada. Apagar não basta.'),
          o('Revogar e trocar a chave, limpar o histórico, revisar os logs e reportar à Segurança.', 'Correto. Segredo exposto é segredo comprometido: troque, investigue o uso, reporte e previna.', true),
          o('Trocar a chave só se o monitoramento ou algum colega apontar acesso estranho nos próximos dias.', 'Esperar um sinal é arriscado. Acessos indevidos podem passar sem ser percebidos.'),
          o('Manter a chave atual e tornar o repositório privado para impedir novas consultas externas.', 'Tornar privado ajuda daqui para frente, mas a chave já esteve exposta e deve ser trocada.'),
        ],
      },
      {
        id: 'c03-s2',
        situation: 'Uma pasta de rede chamada "Exportações" contém planilhas de clientes com CPF e dados financeiros. Qualquer colaborador da empresa consegue abrir, e os arquivos ficam sem criptografia.',
        question: 'O que é mais adequado?',
        options: [
          o('Orientar as pessoas por e-mail a terem cuidado e a não compartilharem o conteúdo da pasta.', 'Orientação sem controle técnico não reduz o risco.'),
          o('Classificar os dados, restringir o acesso a quem precisa, criptografar e definir retenção.', 'Isso mesmo. Classificação, acesso mínimo, criptografia e retenção trabalham juntos.', true),
          o('Renomear a pasta para um nome genérico e ocultá-la da listagem padrão do servidor de arquivos.', 'Esconder o nome não é controle de acesso. A pasta continua aberta.'),
        ],
      },
    ],
    visuals: {
      'c03-s1': { kind: 'log', title: 'Histórico do repositório (resumo)', lines: ['commit a91f  "adiciona configuração do projeto"', '  + config.env  (contém STORAGE_ACCESS_KEY=...)', 'commit b02c  "remove config.env"', 'repositório: público'], note: 'Valor da chave omitido. Exemplo fictício.' },
      'c03-s2': { kind: 'sheet', title: '\\\\servidor\\Exportacoes (permissões)', columns: ['Pasta', 'Quem acessa', 'Conteúdo', 'Criptografia'], rows: [['Exportações', 'Todos os colaboradores', 'Clientes com CPF e renda', 'não'], ['Financeiro-restrito', 'Equipe financeira', 'Relatórios consolidados', 'sim']], note: 'Dados fictícios.' },
    },
    understand:
      'O QUE O CASO DA UBER MOSTRA? Segundo a FTC, uma chave publicada em um site de código deu acesso a arquivos sem criptografia em um provedor de nuvem de terceiros. Criptografar, restringir o acesso e manter segredos fora do código reduzem muito o dano.\n\n' +
      'ERRO COMUM: achar que apagar o arquivo do repositório resolve. O segredo exposto precisa ser trocado.',
    goodPractices: [
      'Nunca guarde chaves, senhas ou tokens em código; use um cofre de segredos.',
      'Ative a varredura automática de segredos nos repositórios.',
      'Classifique os dados e restrinja o acesso ao mínimo necessário.',
      'Criptografe dados sensíveis em repouso e em notebooks e celulares.',
    ],
  },

  4: {
    context:
      'O QUE É CONFIGURAÇÃO SEGURA? É definir, aplicar e manter um padrão de configuração para sistemas, dispositivos e aplicações, em vez de aceitar o que vem de fábrica. Configurações padrão costumam privilegiar a facilidade, e não a segurança.\n\n' +
      'O QUE COSTUMA DAR ERRADO: contas e senhas padrão ativas, serviços desnecessários ligados, portas abertas, regras de firewall "temporárias" que ficam para sempre e ambientes em nuvem criados sem revisão.\n\n' +
      'NA PRÁTICA: 1) tenha uma baseline de configuração por tipo de ativo; 2) automatize e verifique desvios; 3) toda exceção deve ter prazo, dono e aprovação.',
    scenarios: [
      {
        id: 'c04-s1',
        situation: 'O time de plataforma vai publicar um novo ambiente na nuvem para um cliente. O prazo é amanhã. O ambiente foi criado com as configurações padrão do provedor e ainda tem a conta de administrador inicial.',
        question: 'O que fazer antes de publicar?',
        options: [
          o('Publicar amanhã no prazo e endurecer a configuração na primeira semana, quando houver folga.', '"Depois" costuma não chegar. Um ambiente exposto com padrões é o cenário clássico de incidente.'),
          o('Aplicar a baseline segura (portas, contas padrão, logs e MFA) e revisar antes do go-live.', 'Correto. A baseline é parte da entrega, e não um extra. Configuração como código facilita revisão e repetição.', true),
          o('Trocar a senha do administrador inicial e ativar o MFA nessa conta antes de publicar.', 'É necessário, mas insuficiente: portas, serviços, logs e acessos também fazem parte da configuração.'),
        ],
      },
      {
        id: 'c04-s2',
        situation: 'Durante um incidente de lentidão, um engenheiro libera "tudo para todos" em uma regra do firewall de aplicação "só por algumas horas". Três semanas depois, a regra continua ativa.',
        question: 'Qual é o processo correto para exceções como essa?',
        options: [
          o('Manter a regra até o próximo trimestre: se nada aconteceu em três semanas, o risco é baixo.', 'Nada aconteceu que você saiba. Uma regra aberta continua sendo um risco enquanto existir.'),
          o('Registrar a mudança com dono e prazo, reverter a regra e revisar os acessos do período.', 'Isso mesmo. Exceção só é segura com dono, prazo e revisão. Verificar o período aberto também é parte da resposta.', true),
          o('Remover a regra hoje mesmo, sem abrir registro, para não gerar discussão com o time.', 'Remover é certo, mas sem registro e sem verificar o período aberto você perde a chance de achar um acesso indevido.'),
        ],
      },
    ],
    visuals: {
      'c04-s1': { kind: 'log', title: 'Checklist do novo ambiente (resumo)', lines: ['[x] ambiente criado com configurações padrão do provedor', '[x] conta de administrador inicial ativa', '[ ] baseline de segurança aplicada', '[ ] logs habilitados', '[ ] MFA para administradores', 'go-live: amanhã'] },
      'c04-s2': { kind: 'log', title: 'Regras do firewall de aplicação', lines: ['regra 214  origem: 0.0.0.0/0  destino: qualquer  porta: qualquer  ação: PERMITIR', 'criada há 21 dias por: engenharia (incidente de lentidão)', 'comentário: "temporário, remover depois"', 'expiração: (não definida)'] },
    },
    understand:
      'O QUE O CASO CAPITAL ONE ENSINA? Segundo a Procuradoria, a intrusão passou por um firewall de aplicação web mal configurado. O regulador (OCC) destacou a avaliação de risco na migração para a nuvem e a demora em corrigir deficiências. Configuração segura é processo, não evento.\n\n' +
      'COMO PENSAR: padrão de fábrica é ponto de partida. Toda exceção precisa de dono e prazo.',
    goodPractices: [
      'Defina uma baseline por tipo de ativo e verifique desvios de forma automática.',
      'Troque ou desative contas padrão e desligue serviços desnecessários.',
      'Exceções temporárias precisam de aprovação, responsável e data para expirar.',
      'Reavalie a configuração e os riscos ao migrar sistemas para a nuvem.',
    ],
  },

  5: {
    context:
      'O QUE É GESTÃO DE CONTAS? É controlar o ciclo de vida de todas as contas: de usuário, de administrador e de serviço. Cada conta precisa de dono, finalidade e revisão, e deve ser desativada quando deixa de ser necessária.\n\n' +
      'POR QUE ESSAS CONTAS SÃO UM ALVO? Contas esquecidas, de teste ou de serviço costumam ter senhas fracas, sem MFA e sem ninguém olhando. Um atacante só precisa de uma.\n\n' +
      'NA PRÁTICA: 1) mantenha um inventário de contas com dono; 2) desative contas inativas; 3) use contas separadas para tarefas administrativas.',
    scenarios: [
      {
        id: 'c05-s1',
        situation: 'Uma revisão de contas encontra "svc-teste-legado", sem uso há 400 dias, sem dono identificado, com permissões de administrador e sem MFA.',
        question: 'Qual é a conduta mais adequada?',
        options: [
          o('Manter a conta ativa por precaução, já que ninguém reclamou e ela pode servir a algum processo.', 'Conta sem dono e sem uso é o alvo ideal. A ausência de reclamação não é justificativa.'),
          o('Apagar a conta imediatamente e comunicar o time só depois, para evitar acúmulo de ativos órfãos.', 'Pode quebrar um processo escondido. O caminho seguro é desativar e observar antes de apagar.'),
          o('Achar o dono, desativar sem apagar, reduzir as permissões e registrar no inventário.', 'Correto. Desativar primeiro permite reverter se houver dependência, e reduzir privilégios elimina o risco enquanto isso.', true),
        ],
      },
      {
        id: 'c05-s2',
        situation: 'Uma pessoa da TI usa a mesma conta de administrador de domínio para ler e-mails, navegar na internet e administrar servidores.',
        question: 'O que deve mudar?',
        options: [
          o('Manter como está, desde que a senha seja forte e trocada a cada 90 dias.', 'Senha forte não protege contra um link malicioso aberto com uma conta de alto privilégio.'),
          o('Separar as contas: uma comum no dia a dia e outra, com MFA, só para administração.', 'Isso mesmo. Reduz o que um phishing ou malware consegue alcançar, e facilita a auditoria.', true),
          o('Reservar a conta de administrador a um único dia da semana e anotar cada uso em planilha.', 'Reduzir a frequência não elimina o risco quando ela é usada.'),
        ],
      },
    ],
    visuals: {
      'c05-s1': { kind: 'sheet', title: 'revisao_contas.csv (trecho)', columns: ['Conta', 'Dono', 'Último login', 'Perfil', 'MFA'], rows: [['ana.exemplo', 'Ana (TI)', 'hoje', 'Usuário', 'sim'], ['svc-teste-legado', '(vazio)', 'há 400 dias', 'Administrador', 'não'], ['svc-backup', 'Infra', 'ontem', 'Serviço', 'n/a']], note: 'Dados fictícios.' },
      'c05-s2': { kind: 'log', title: 'Atividade da conta adm-geral (últimas 24 h)', lines: ['08:02  leitura de e-mail (cliente de e-mail)', '08:40  navegação web (site externo)', '09:15  acesso administrativo a srv-ad-01', '11:30  download de arquivo anexo de e-mail'] },
    },
    understand:
      'O QUE O CASO MIDNIGHT BLIZZARD MOSTRA? Segundo a Microsoft, o ataque começou em uma conta legada de teste sem MFA, atingida por password spray, e chegou a uma aplicação de teste com acesso elevado. Contas esquecidas abrem caminho para acessos grandes.\n\n' +
      'COMO PENSAR: se uma conta existe e ninguém é dono dela, assuma que ninguém está cuidando dela.',
    goodPractices: [
      'Tenha um inventário de contas (usuário, administrador e serviço) com dono.',
      'Desative contas inativas e remova permissões que não são mais necessárias.',
      'Separe a conta de administração da conta de uso diário.',
      'Revise aplicações e permissões de ambientes de teste e legados.',
    ],
  },

  6: {
    context:
      'O QUE É CONTROLE DE ACESSO? É conceder, alterar e revogar acessos pelo princípio do mínimo necessário, e exigir autenticação forte (MFA) onde o risco é maior: acesso remoto, aplicações expostas à internet e contas administrativas.\n\n' +
      'POR QUE SENHA NÃO BASTA? Senhas vazam, são adivinhadas e reaproveitadas. O segundo fator impede que uma senha sozinha abra a porta.\n\n' +
      'NA PRÁTICA: 1) tenha um processo formal de concessão e de revogação; 2) exija MFA em todo acesso remoto e administrativo; 3) revogue o acesso no mesmo dia em que a pessoa sai ou muda de função.',
    scenarios: [
      {
        id: 'c06-s1',
        situation: 'Um parceiro precisa de acesso remoto à rede para um projeto de três meses. O gestor aprova por chat e pede para "liberar rapidinho, sem MFA, porque o parceiro tem pressa".',
        question: 'Como proceder?',
        options: [
          o('Liberar o acesso como o gestor pediu, sem MFA, e registrar a aprovação do chat no chamado.', 'A aprovação existe, mas o acesso remoto sem MFA é justamente o ponto de maior risco.'),
          o('Seguir o processo: acesso só aos sistemas do projeto, com MFA, prazo e dono responsável.', 'Correto. Mínimo necessário, MFA e prazo para acabar são o conjunto que protege.', true),
          o('Liberar sem MFA, exigindo do parceiro uma senha longa e a troca dela a cada 30 dias.', 'Senha longa ajuda, mas não substitui o segundo fator em acesso remoto.'),
        ],
      },
      {
        id: 'c06-s2',
        situation: 'Uma pessoa que saiu da empresa há três semanas ainda tem conta ativa. Os logs mostram dois acessos à pasta de projetos depois da data de saída.',
        question: 'Qual é a sequência mais adequada?',
        options: [
          o('Desativar a conta e encerrar o assunto, pois a pessoa já saiu e o risco acabou.', 'Desativar é necessário, mas os acessos depois da saída precisam ser investigados.'),
          o('Desativar a conta, investigar os acessos, reportar à Segurança e corrigir o desligamento.', 'Isso mesmo. Contém, investiga, reporta e corrige a causa: o gatilho de revogação que não funcionou.', true),
          o('Aguardar o RH atualizar o cadastro de desligamento para só então desativar a conta no sistema.', 'Esperar mantém o risco aberto. A revogação deve acontecer no mesmo dia.'),
        ],
      },
    ],
    visuals: {
      'c06-s1': { kind: 'chat', channel: 'Gestor · conversa direta', messages: [{ who: 'Gestor', text: 'Libera a VPN pro parceiro hoje, sem MFA mesmo, que ele está com pressa. Aprovo por aqui.' }] },
      'c06-s2': { kind: 'log', title: 'Acessos da conta ex.colaborador', lines: ['data de saída registrada no RH: há 21 dias', 'status da conta: ATIVA', 'há 6 dias   login  203.0.113.40  pasta "Projetos/Clientes"', 'há 2 dias   login  203.0.113.40  pasta "Projetos/Clientes"'] },
    },
    understand:
      'O QUE O CASO COLONIAL PIPELINE MOSTRA? Segundo o CEO, o atacante usou um perfil de VPN legado com autenticação de fator único; a senha era complexa. Senha forte sem MFA, em acesso remoto, não foi suficiente.\n\n' +
      'COMO PENSAR: acesso é concedido com prazo e escopo e revogado no mesmo dia da saída ou mudança.',
    goodPractices: [
      'Exija MFA em acesso remoto, aplicações expostas e contas administrativas.',
      'Conceda o mínimo necessário e com data de expiração.',
      'Automatize a revogação no desligamento, ligando RH e TI.',
      'Revise acessos periodicamente e investigue acessos após a saída.',
    ],
  },

  7: {
    context:
      'O QUE É GESTÃO CONTÍNUA DE VULNERABILIDADES? É um ciclo: descobrir vulnerabilidades (varreduras, alertas), priorizar pelo risco, corrigir ou mitigar, e verificar que a correção funcionou, repetidamente.\n\n' +
      'POR QUE A VELOCIDADE IMPORTA? A janela entre o anúncio de uma falha e a exploração por atacantes pode ser curta. Sistemas expostos à internet e falhas já exploradas devem ter prioridade.\n\n' +
      'NA PRÁTICA: 1) priorize por exposição e exploração conhecida; 2) defina prazos de correção; 3) confirme com nova varredura que a correção foi aplicada.',
    scenarios: [
      {
        id: 'c07-s1',
        situation: 'A varredura aponta uma vulnerabilidade crítica, já explorada publicamente, em um servidor voltado à internet. O responsável diz que só há janela de manutenção daqui a 40 dias.',
        question: 'Qual é a melhor resposta?',
        options: [
          o('Aguardar a janela normal de 40 dias, pois mudar fora do calendário exige aprovação do comitê.', '40 dias é uma eternidade para uma falha crítica já explorada em um sistema exposto.'),
          o('Tratar como emergência: aplicar a correção ou mitigação já e confirmar com nova varredura.', 'Correto. Exposição somada a exploração conhecida exige ação rápida, mesmo fora do calendário, e verificação ao final.', true),
          o('Registrar no relatório de risco do trimestre e reavaliar a prioridade na próxima reunião.', 'Registrar sem agir deixa a janela aberta. Risco precisa de ação e prazo.'),
        ],
      },
      {
        id: 'c07-s2',
        situation: 'Um chamado de correção foi fechado como "aplicado". A varredura da semana seguinte ainda mostra a mesma vulnerabilidade no servidor.',
        question: 'O que fazer?',
        options: [
          o('Considerar falso positivo do scanner, pois o chamado já foi fechado como aplicado, e seguir.', 'Pode ser, mas é preciso comprovar. Presumir sem verificar é o erro que custa caro.'),
          o('Reabrir o chamado, achar por que a correção falhou e validar com nova varredura.', 'Isso mesmo. Mandar corrigir não é o mesmo que ter corrigido: a verificação fecha o ciclo.', true),
          o('Registrar a vulnerabilidade como exceção permanente, com a justificativa de que o chamado foi fechado.', 'Exceção sem análise esconde um risco real.'),
        ],
      },
    ],
    visuals: {
      'c07-s1': { kind: 'sheet', title: 'varredura_vulnerabilidades.csv (trecho)', columns: ['Host', 'Exposição', 'Severidade', 'Exploração pública', 'Prazo'], rows: [['srv-portal-01', 'Internet', 'Crítica', 'sim', 'janela em 40 dias'], ['srv-rh-03', 'Interna', 'Média', 'não', 'janela em 40 dias']], note: 'Dados fictícios.' },
      'c07-s2': { kind: 'log', title: 'Chamado 4821 vs varredura', lines: ['chamado 4821: "aplicar correção no servidor srv-app-07"  status: FECHADO (aplicado)', 'varredura de 7 dias depois: srv-app-07  vulnerabilidade crítica AINDA PRESENTE'] },
    },
    understand:
      'O QUE O CASO EQUIFAX MOSTRA? Segundo a FTC, a empresa foi avisada em março de 2017 sobre uma vulnerabilidade crítica; a equipe mandou corrigir em até 48 horas, mas não verificou se foi feito. Os invasores só foram percebidos em julho.\n\n' +
      'COMO PENSAR: o ciclo só fecha quando alguém confirma que a falha sumiu.',
    goodPractices: [
      'Priorize pela exposição à internet e pela exploração conhecida.',
      'Defina prazos de correção por severidade e acompanhe o cumprimento.',
      'Verifique a correção com uma nova varredura antes de fechar o chamado.',
      'Tenha um caminho de emergência para falhas críticas, fora do calendário normal.',
    ],
  },

  8: {
    context:
      'O QUE É GESTÃO DE LOGS DE AUDITORIA? É coletar, centralizar, proteger, revisar e reter registros de eventos (logins, mudanças, acessos) que permitam detectar problemas e investigar incidentes.\n\n' +
      'POR QUE A RETENÇÃO IMPORTA? Um atacante pode ficar semanas ou meses sem ser percebido. Se os logs expiram antes disso, não dá para saber como entrou, o que fez ou o tamanho do dano.\n\n' +
      'NA PRÁTICA: 1) colete logs dos sistemas críticos; 2) centralize em um local protegido; 3) defina retenção suficiente para investigação; 4) alguém precisa revisar ou ser alertado.',
    scenarios: [
      {
        id: 'c08-s1',
        situation: 'Um cliente avisa que viu atividade estranha em sua conta. A equipe tenta investigar, mas os logs de autenticação só guardam 7 dias, e a atividade suspeita começou há cerca de 30 dias.',
        question: 'O que a empresa deve fazer, além de investigar com o que tem?',
        options: [
          o('Manter a retenção de 7 dias, pois armazenar mais logs custa caro e a equipe já tem pouco espaço.', 'O custo de não ter log em um incidente costuma ser muito maior que o do armazenamento.'),
          o('Definir retenção por risco, cobrindo o tempo típico de detecção, e centralizar os logs em local protegido.', 'Correto. Retenção e proteção dos logs permitem reconstruir o que aconteceu. Confirme os prazos recomendados no CIS Controls Navigator.', true),
          o('Guardar todos os logs de todos os sistemas por tempo ilimitado, em qualquer servidor disponível.', 'Excesso gera custo, ruído e risco de privacidade. A retenção deve ser definida por risco e necessidade.'),
        ],
      },
      {
        id: 'c08-s2',
        situation: 'O sistema de logs registra 500 tentativas de login falhas, em 10 minutos, vindas de um mesmo endereço contra várias contas. Ninguém lê esses logs, e não há alerta configurado.',
        question: 'Qual é a melhor melhoria?',
        options: [
          o('Pedir que alguém revise os logs toda segunda-feira e avise se algo parecer estranho.', 'Revisão manual esporádica chega tarde para esse tipo de evento.'),
          o('Centralizar os logs, alertar sobre falhas de login em massa e definir dono e resposta.', 'Isso mesmo. Coleta sem alerta e sem dono não detecta nada.', true),
          o('Desligar o registro de falhas de login para reduzir o ruído e o volume armazenado.', 'Seria perder justamente o sinal mais útil para detectar ataques.'),
        ],
      },
    ],
    visuals: {
      'c08-s1': { kind: 'log', title: 'Política atual de retenção (resumo)', lines: ['autenticação: 7 dias', 'acesso a arquivos: 14 dias', 'alterações administrativas: 30 dias', 'logs armazenados no próprio servidor de origem (sem cópia central)'] },
      'c08-s2': { kind: 'log', title: 'Registro de autenticação (trecho)', lines: ['02:14:03 FALHA login contas=17 origem=198.51.100.23', '02:14:05 FALHA login contas=17 origem=198.51.100.23', '... (500 eventos em 10 minutos)', 'alerta configurado: nenhum  ·  responsável pela revisão: (vazio)'] },
    },
    understand:
      'O QUE O CASO STORM-0558 MOSTRA? Segundo a Microsoft, por causa das políticas de retenção de logs, não havia registros com evidência específica da exfiltração da chave, e a explicação mais provável ficou como hipótese. Sem logs, a causa raiz não pôde ser comprovada.\n\n' +
      'COMO PENSAR: log que ninguém lê e log que expira cedo demais valem pouco quando o incidente chega.',
    goodPractices: [
      'Centralize logs dos sistemas críticos em local protegido contra alteração.',
      'Defina retenção por risco, cobrindo o tempo típico de detecção.',
      'Crie alertas para padrões suspeitos e designe quem os trata.',
      'Garanta armazenamento adequado e sincronização de horário entre sistemas.',
    ],
  },

  9: {
    context:
      'O QUE SÃO PROTEÇÕES DE E-MAIL E NAVEGADOR? Medidas que reduzem o que chega e o que é aberto: clientes e navegadores com suporte e atualizados, filtros de DNS e de URL, bloqueio de tipos de arquivo perigosos, antimalware no e-mail e autenticação do domínio (como SPF, DKIM e DMARC).\n\n' +
      'POR QUE SOMENTE FILTROS NÃO BASTAM? Fraudes de e-mail corporativo (BEC) muitas vezes não têm anexo nem link malicioso: são mensagens limpas que pedem uma ação. A defesa depende também de processo e de pessoas.\n\n' +
      'NA PRÁTICA: 1) aplique filtros e autenticação de e-mail; 2) mantenha navegadores atualizados; 3) exija confirmação por outro canal para pagamentos e mudanças de dados bancários.',
    scenarios: [
      {
        id: 'c09-s1',
        situation: 'Você recebe um e-mail que parece do RH: "Atualize seus dados no portal até hoje ou o acesso será bloqueado." O link aponta para um domínio parecido com o da empresa, mas com uma letra trocada.',
        question: 'O que fazer?',
        options: [
          o('Clicar no link e conferir se a página lembra a do RH antes de digitar qualquer dado.', 'Páginas falsas são copiadas com fidelidade. Aparência não prova legitimidade.'),
          o('Não clicar, reportar pelo canal de phishing e confirmar com o RH por um canal conhecido.', 'Correto. Pressa e domínio parecido são sinais clássicos, e o reporte ajuda a bloquear a campanha para todos.', true),
          o('Encaminhar a mensagem aos colegas do setor para ver se mais alguém recebeu algo parecido.', 'Espalhar a mensagem aumenta a chance de alguém clicar. Reporte ao canal responsável.'),
        ],
      },
      {
        id: 'c09-s2',
        situation: 'O financeiro recebe um e-mail do "diretor", enviado de um endereço quase igual ao dele, pedindo urgência e sigilo para pagar uma fatura a um novo banco. Não há anexo nem link.',
        question: 'Qual é a conduta correta?',
        options: [
          o('Pagar ainda hoje, já que o pedido vem do diretor e menciona prazo e sigilo.', 'Urgência, sigilo e conta nova são o roteiro típico do golpe de e-mail corporativo (BEC).'),
          o('Responder ao próprio e-mail pedindo o comprovante da operação e a confirmação do banco.', 'Se a conta do remetente for falsa ou estiver comprometida, a resposta vai para o golpista.'),
          o('Não pagar, confirmar por canal conhecido e seguir o procedimento de dados bancários.', 'Isso mesmo. A verificação por um segundo canal e o procedimento formal são a barreira decisiva.', true),
        ],
      },
    ],
    visuals: {
      'c09-s1': { kind: 'email', from: 'rh@empresa-exernplo.test', to: 'voce@empresa-exemplo.test', subject: 'Última chamada: atualize seus dados', body: ['Atualize seus dados no portal até hoje ou o acesso será bloqueado.', 'Clique aqui: https://portal-rh.empresa-exernplo.test/atualizar'], flag: 'Domínio do remetente diferente do oficial (r-n em vez de m)' },
      'c09-s2': { kind: 'email', from: 'diretor.exemplo@empresa-exempIo.test', to: 'financeiro@empresa-exemplo.test', subject: 'Urgente e confidencial', body: ['Preciso que pague hoje a fatura 7781 neste novo banco. Não comente com ninguém por enquanto.', 'Estou em reunião e sem telefone.'], flag: 'Remetente com letra trocada, urgência, sigilo e conta bancária nova' },
    },
    understand:
      'O QUE OS DADOS DO FBI MOSTRAM? O FBI (IC3) registrou 277.918 incidentes de BEC entre 2013 e 2022, com perdas expostas de cerca de US$ 50,8 bilhões. Esse golpe muitas vezes passa pelos filtros técnicos.\n\n' +
      'COMO PENSAR: o filtro reduz o volume, mas a decisão final de pagar ou clicar é humana. Por isso, a verificação por outro canal e o treinamento (Controle 14) completam esta defesa.',
    goodPractices: [
      'Ative SPF, DKIM e DMARC e filtros de DNS e de URL.',
      'Mantenha navegadores e clientes de e-mail atualizados e com suporte.',
      'Exija confirmação por outro canal para pagamentos e mudanças de dados bancários.',
      'Reporte e-mails suspeitos pelo canal oficial, sem encaminhar a colegas.',
    ],
  },
};
