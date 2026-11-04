/**
 * Módulo C19: Avaliação final integrada CIS, 15 cenários que cruzam vários controles.
 *
 * RASCUNHO para revisão humana (Segurança da Informação e AI Guild) antes de uso externo.
 * - 100% fictício: domínios .test, IPs das faixas RFC 5737 ou 10.x, nenhuma credencial real.
 * - Em cada cenário mais de uma opção é boa ação; vale a ordem certa (conter, preservar, corrigir a causa, decidir).
 * - A numeração e a relação cenário-controle são seleção editorial a conferir na fonte oficial (CIS Controls v8.1).
 * - O gabarito (campo `correct`) permanece só no servidor.
 */
import type { PrivacyModuleDefinition } from './privacy.js';
import type { ScenarioVisual } from './privacyExtras.js';
import { o } from './cisContentA.js';

export const CIS_FINAL: PrivacyModuleDefinition = {
  id: 'c19', code: 'CF', order: 19,
  title: 'Avaliação final integrada',
  summary: '15 cenários que cruzam de 2 a 4 controles CIS (inventário, vulnerabilidades, acessos, logs, fornecedores, incidentes e mais), em nuvem, CI/CD, e-mail, ransomware, endpoint, rede e pessoas.',
  minutes: 45,
  legalBasis: 'CIS Controls v8.1 (visão integrada dos 18 controles)',
  context:
    'O QUE É ESTA AVALIAÇÃO? Quinze situações fictícias em que um único problema envolve vários controles. Aqui, quase todas as opções são boas ações; o que muda é a ORDEM e a causa que cada uma ataca. Conteúdo em rascunho, para revisão da Segurança da Informação e da AI Guild.\n\n' +
    'COMO ANALISAR UM CENÁRIO MULTI-CONTROLE: 1) O que está exposto (ativo, dado, credencial, conta)? 2) Qual controle falhou primeiro (a causa que deixou o problema acontecer, não só o sintoma)? 3) O que CONTÉM o dano agora e o que CORRIGE a causa depois? 4) Quem decide e quem deve ser acionado (dono do ativo, Segurança, Jurídico, fornecedor, cliente)?\n\n' +
    'NA PRÁTICA: conter vem antes de investigar a fundo, preservar evidência vem antes de limpar, e corrigir a causa vem antes de declarar o caso encerrado. Dúvida real: acione [inserir canal de Segurança da Informação Opah].',
  scenarios: [
    {
      id: 'cf-s1',
      situation:
        'Alerta de custo: a conta de nuvem de um projeto do cliente-exemplo teve gasto 6 vezes maior que o normal em 48 horas. Você é analista de nuvem e abre o console. Há 14 instâncias de computação em uma região onde a empresa nunca operou, criadas por uma access key de um usuário de serviço antigo. A key foi criada há dois anos e não está no inventário de ativos nem no cofre de segredos. O gerente quer apenas "desligar as instâncias e seguir", pois há uma entrega no dia seguinte.',
      question: 'Qual é a melhor sequência de ações?',
      options: [
        o('Terminar as 14 instâncias de imediato para cortar o gasto e abrir um chamado para revisar custos e a região depois da entrega.', 'Interrompe o gasto, mas a key continua válida e o invasor recria tudo em minutos. Terminar sem snapshot também destrói evidência.', false),
        o('Trocar a senha do console de todos os administradores e manter as instâncias no ar por 24 horas para observar o comportamento do invasor.', 'A key de API não depende da senha do console. Observar sem contenção deixa o gasto e o risco crescendo.', false),
        o('Desativar a access key e revogar sessões ativas, preservar snapshots e logs, encerrar as instâncias e investigar o acesso inicial.', 'Contém na causa (credencial), preserva evidência e conecta inventário, logs e resposta a incidentes antes de limpar.', true),
        o('Criar um alarme de orçamento mais baixo e restringir a região por política, mantendo a key ativa até a entrega de amanhã para não travar o time.', 'Restringir região e alarmar são boas medidas preventivas, mas não removem a credencial já comprometida nem investigam o acesso.', false),
      ],
    },
    {
      id: 'cf-s2',
      situation:
        'Um desenvolvedor avisa no chat que o log público de um pipeline de CI imprimiu por engano uma variável de ambiente durante um passo de debug. O log ficou visível por cerca de 3 horas no repositório do cliente-exemplo, que é público, e foi indexado por buscadores automáticos. A variável era um token de deploy com permissão de escrita no registro de imagens de produção. O time propõe apagar o log, reescrever o histórico do pipeline e seguir, pois a janela de exposição foi curta.',
      question: 'O que é a decisão mais correta agora?',
      options: [
        o('Apagar o log do pipeline e reescrever o histórico das execuções, considerando o caso encerrado, já que a janela foi de apenas 3 horas.', 'Bots de varredura coletam segredos em minutos. Apagar o log não invalida o token que pode já ter sido copiado.', false),
        o('Mascarar o passo de debug no pipeline e adicionar um scanner de segredos nos commits para impedir novos casos desse tipo.', 'Corrige a causa raiz e é desejável, mas não neutraliza o token que já vazou.', false),
        o('Rotacionar o token, mas só depois de acabar a janela de deploy do dia, para não quebrar a esteira de entregas do cliente.', 'Adiar a revogação por conveniência mantém uma credencial de escrita em produção exposta. Planeje o deploy com o novo token, não com o vazado.', false),
        o('Revogar e rotacionar o token já, auditar pushes e pulls no registro e só então remover o log e mascarar o passo.', 'Invalida o segredo primeiro, verifica abuso nos logs do registro e depois corrige a prática no pipeline.', true),
      ],
    },
    {
      id: 'cf-s3',
      situation:
        'O fornecedor-exemplo, empresa de suporte gerenciado de TI, avisa por e-mail que sofreu um incidente em sua plataforma de acesso remoto e que "alguns clientes podem ter sido afetados". Sua empresa usa essa plataforma para administrar servidores do cliente-exemplo, com uma conta compartilhada de administrador que o fornecedor mantém. O contrato não tem cláusula de notificação de incidente com prazo. O e-mail não diz quais clientes nem quais dados foram afetados.',
      question: 'Qual é a primeira ação mais adequada?',
      options: [
        o('Restringir o acesso do fornecedor, trocar as credenciais compartilhadas, revisar os logs dele nos servidores e acionar o plano de resposta.', 'Contém o acesso de terceiro, rotaciona a credencial e verifica abuso antes de depender de informações do fornecedor.', true),
        o('Aguardar o relatório completo do fornecedor antes de qualquer ação, para não agir com informação incompleta nem gerar alarme.', 'Sem confirmação, o risco existe mesmo assim. A espera mantém o acesso privilegiado de terceiro aberto no ambiente.', false),
        o('Exigir por escrito os indicadores de comprometimento e um relatório pós-incidente, e revisar o contrato para incluir prazo de notificação de incidentes.', 'Pedir informação e rever contrato é correto, mas é o passo seguinte. Antes, é preciso proteger o ambiente.', false),
        o('Comunicar ao cliente-exemplo que nada foi afetado, pois o e-mail não cita o ambiente, e pedir que mantenha o monitoramento habitual.', 'Afirmar ausência de impacto sem evidência é arriscado. A ausência de menção não é prova.', false),
      ],
    },
    {
      id: 'cf-s4',
      situation:
        'A analista financeira da empresa-exemplo recebeu, em uma conversa de e-mail já existente com um fornecedor, uma mensagem pedindo para alterar a conta bancária do próximo pagamento (R$ 480 mil). O endereço do remetente parece o mesmo do fornecedor, mas ela desconfia. Antes de qualquer ação, a TI olha o cabeçalho e o log de auditoria do e-mail. O pagamento vence hoje à tarde. Ela já respondeu pedindo uma confirmação "por segurança", e a resposta chegou em 5 minutos com o mesmo pedido.',
      question: 'O que a evidência indica e qual é a melhor decisão?',
      options: [
        o('Tratar como spoofing simples de domínio: bloquear o domínio falso no gateway de e-mail e pagar na conta original ainda hoje.', 'O remetente é legítimo; o domínio não é falso. Bloquear não resolve se a conta de e-mail do fornecedor (ou a nossa) está comprometida.', false),
        o('Tratar como tentativa isolada já percebida: pagar na conta original e ignorar o pedido, sem avisar o fornecedor nem a Segurança.', 'Pagar na conta original talvez seja o desfecho, mas só após validação independente. Ignorar o sinal deixa uma conta comprometida ativa.', false),
        o('Tratar como possível comprometimento de caixa: suspender o pagamento, validar por canal independente e acionar a Segurança.', 'A regra oculta e a resposta imediata sugerem conta comprometida. Valida-se por telefone conhecido, protege-se o pagamento e investigam-se as caixas.', true),
        o('Tratar como falha de conscientização: treinar a equipe financeira sobre BEC ainda hoje e manter o pagamento como previsto.', 'Treinamento é útil, mas não substitui validar o pagamento nem investigar a caixa comprometida.', false),
      ],
    },
    {
      id: 'cf-s5',
      situation:
        'Sexta, 22h. Os usuários da empresa-exemplo não conseguem abrir arquivos do servidor de arquivos principal; aparece um bilhete de resgate. Dois dos quatro servidores de arquivos estão criptografados, os outros dois ainda respondem. O console de backup mostra o último job bem-sucedido há 9 dias e a conta de serviço do backup é a mesma de administrador de domínio usada nos servidores. O diretor quer "restaurar tudo do backup" antes de segunda-feira.',
      question: 'Qual é a ação mais importante agora?',
      options: [
        o('Iniciar de imediato a restauração do backup de 9 dias nos servidores afetados, para ganhar tempo até segunda e devolver o ambiente à diretoria.', 'Restaurar sem conter e sem validar o backup arrisca recriptografar o ambiente e perder os dados dos últimos 9 dias sem avaliar a extensão.', false),
        o('Isolar da rede os servidores afetados e os saudáveis, rotacionar a conta privilegiada, proteger o backup e acionar a resposta a incidentes.', 'Contém a propagação, protege o último ativo recuperável (backup) e preserva evidência. A restauração vem depois de validada.', true),
        o('Desligar da tomada todos os servidores da empresa para evitar que a criptografia avance e depois acionar a infraestrutura para religá-los.', 'Desligar tudo derruba o negócio e apaga memória volátil útil. Isolar da rede é mais seletivo e preserva evidência.', false),
        o('Pagar o resgate rapidamente, negociando com o invasor pelo canal do bilhete, pois o backup tem 9 dias de defasagem e o prazo é curto.', 'Pagar não garante recuperação e não elimina o acesso do invasor. A decisão não cabe à TI isolada e exige Jurídico e diretoria.', false),
      ],
    },
    {
      id: 'cf-s6',
      situation:
        'O EDR gerou um alerta de severidade alta em um notebook chamado NB-0412, mostrando execução de PowerShell codificado seguido de conexão para 198.51.100.77. Ao consultar o inventário, o equipamento não existe lá, mas aparece no diretório de contas com último logon ontem, por um usuário do time comercial. O agente do EDR está instalado, mas a versão do sistema tem 11 meses sem atualização. A diretoria pergunta se "é só um falso positivo".',
      question: 'Como conduzir?',
      options: [
        o('Tratar como falso positivo até haver um segundo alerta, já que o usuário do comercial raramente usa PowerShell no dia a dia.', 'PowerShell codificado com conexão externa é um padrão clássico de intrusão. Esperar mais alertas dá tempo ao invasor.', false),
        o('Atualizar o sistema operacional do notebook pela ferramenta de patch e só depois investigar o equipamento já corrigido.', 'Atualizar antes de coletar evidência altera artefatos e não contém o acesso já estabelecido.', false),
        o('Bloquear o IP 198.51.100.77 no firewall perimetral, revisar os logs de saída do proxy e encerrar o chamado.', 'Bloquear o IP é boa medida, mas o host continua comprometido e outros destinos podem ser usados.', false),
        o('Isolar o equipamento pelo EDR, preservar evidências, resetar credenciais e sessões do usuário e incluir o ativo no inventário.', 'Contém o host, protege as credenciais e fecha a lacuna de inventário que deixou o notebook fora de gestão.', true),
      ],
    },
    {
      id: 'cf-s7',
      situation:
        'O scan trimestral de vulnerabilidades da empresa-exemplo traz 1.340 achados. A analista de segurança precisa priorizar para o time de infraestrutura, que tem capacidade para corrigir 15 itens neste mês. Entre os candidatos: 40 itens CVSS 9.8 em servidores internos de laboratório sem acesso externo; 3 itens CVSS 7.5 em um firewall perimetral cuja gestão está exposta à internet, com exploração ativa conhecida em catálogos públicos; e 1 item CVSS 8.1 em um servidor legado que o scan não reconhece como pertencente a nenhum dono.',
      question: 'Qual abordagem de priorização é a melhor?',
      options: [
        o('Corrigir primeiro os 3 itens do firewall exposto, reduzir a exposição da gestão e dar dono ao servidor legado.', 'Combina exposição, exploração conhecida e contexto do ativo, e fecha a lacuna de inventário do legado.', true),
        o('Corrigir primeiro os itens de maior CVSS e depois os demais, pois a severidade técnica é o critério mais objetivo.', 'CVSS isolado ignora exposição e exploração real. Itens internos isolados podem esperar atrás de um perímetro explorado ativamente.', false),
        o('Atribuir todos os itens a todos os times e deixar cada um escolher pela rotina, com revisão no fim do mês.', 'Sem prioridade nem dono, o item mais perigoso concorre com o ruído e demora a ser tratado.', false),
        o('Aceitar o risco dos 3 itens do firewall por serem CVSS 7.5 e corrigir os 40 itens críticos do laboratório, com registro simples no chamado.', 'Rebaixa o item mais perigoso por causa da pontuação base. Aceitar risco exige análise e decisão documentada, não um número.', false),
      ],
    },
    {
      id: 'cf-s8',
      situation:
        'O time de desenvolvimento do cliente-exemplo pede uma cópia completa do banco de produção para reproduzir um bug em homologação. O banco tem dados pessoais e financeiros, e o ambiente de homologação tem 25 pessoas com acesso, incluindo prestadores, sem criptografia em repouso e com senhas fracas conhecidas. O prazo do bug é de dois dias e o líder técnico diz que "é só um dump pontual, depois apagamos".',
      question: 'Qual é a melhor resposta?',
      options: [
        o('Aprovar o dump cru, desde que o líder apague ao final e registre o pedido em chamado com data de eliminação.', 'O registro ajuda, mas o dado real chega a um ambiente fraco, sem criptografia, com acesso amplo e senhas fracas.', false),
        o('Aprovar o dump e trocar as senhas de homologação por senhas fortes antes da importação, avisando os 25 usuários.', 'Melhora um ponto, mas mantém dado real em ambiente sem criptografia e com 25 pessoas, incluindo prestadores.', false),
        o('Negar a cópia crua e oferecer dados mascarados ou sintéticos que reproduzam o caso, com acesso restrito e registrado.', 'Resolve o bug com o mínimo de dado, protege o ambiente e mantém decisão do dono do dado.', true),
        o('Negar o pedido e orientar o time a corrigir o bug apenas lendo o código, sem reproduzir, e pedir mais prazo à gerência.', 'Negar sem alternativa trava o time e incentiva atalhos. Há como reproduzir com dados mascarados.', false),
      ],
    },
    {
      id: 'cf-s9',
      situation:
        'Na revisão de desligamentos, o RH da empresa-exemplo entregou a lista de 6 pessoas que saíram no último mês. Ao cruzar com o provedor de identidade, a analista de segurança vê que 2 contas ainda estão ativas, uma delas com login por VPN 9 dias depois da data de saída, de um IP residencial. A conta é de um analista que tinha acesso a repositórios e à base de clientes, e também é a dona de uma conta de serviço compartilhada usada em um job noturno.',
      question: 'Qual é a decisão mais correta?',
      options: [
        o('Desativar as duas contas só ao fim do mês, junto do ciclo de revisão, para não afetar o job noturno, e registrar a pendência com o RH.', 'Um login de ex-colaborador por VPN é possível incidente. Aguardar o ciclo mantém o acesso à base de clientes.', false),
        o('Desativar a conta com acesso pós-saída, revogar sessões, preservar logs, rotacionar a conta de serviço e corrigir o fluxo entre RH e TI.', 'Contém o acesso, aciona a resposta, remove a dependência na conta de serviço e fecha a causa processual.', true),
        o('Enviar e-mail ao ex-colaborador pedindo que pare de acessar e devolva os equipamentos, com cópia ao gestor, e aguardar a resposta.', 'Alertar o possível autor sem conter o acesso nem preservar logs é arriscado e tardio.', false),
        o('Treinar os gestores sobre o procedimento de desligamento no próximo trimestre e cobrar do RH a lista mensal de saídas.', 'Treinamento ajuda, mas não trata o acesso ativo agora nem o gap técnico do processo.', false),
      ],
    },
    {
      id: 'cf-s10',
      situation:
        'A empresa-exemplo detectou um comprometimento de servidor web que parece ter começado há mais de 40 dias, pelo relato de um parceiro que encontrou dados da empresa à venda. Na investigação, o time descobre que o servidor retém logs de acesso por 30 dias e que os logs de autenticação do diretório são sobrescritos a cada 14 dias. O time de resposta pergunta o que mais falta para dimensionar o impacto.',
      question: 'Qual é o ponto mais crítico a corrigir para o futuro, além de conter o caso atual?',
      options: [
        o('Comprar mais armazenamento local para os servidores web e do diretório, mantendo a política de coleta como está hoje.', 'Mais disco no mesmo servidor não resolve: os logs continuam locais, sobrescritos e sujeitos a adulteração pelo invasor.', false),
        o('Habilitar logs mais verbosos no servidor web e no diretório para capturar mais detalhes dali em diante, mantendo a retenção atual.', 'Mais detalhe com a mesma retenção e o mesmo armazenamento local mantém a lacuna de 40 dias.', false),
        o('Contratar um pentest externo para descobrir como o invasor entrou e quais vulnerabilidades ainda estão abertas, com relatório em 30 dias.', 'Pentest mostra vulnerabilidades, mas não reconstrói o que o invasor fez. Falta evidência de auditoria.', false),
        o('Centralizar os logs em repositório protegido, com retenção definida pelo risco [inserir período definido pela Segurança Opah] e alertas.', 'Atende à causa: sem log centralizado e retido por tempo suficiente, não se reconstrói a linha do tempo.', true),
      ],
    },
    {
      id: 'cf-s11',
      situation:
        'O relatório de um pentest no portal do cliente-exemplo traz uma falha crítica: um endpoint de API permite acessar dados de outros clientes trocando o ID na URL (IDOR). Também aponta uma biblioteca desatualizada com CVE conhecida, que o time diz não ser alcançável. A release com uma funcionalidade comercial está marcada para daqui a 3 dias, e o product owner pede para "liberar e corrigir na próxima sprint".',
      question: 'Qual é a melhor decisão de gestão do risco?',
      options: [
        o('Corrigir a autorização no endpoint e retestar antes de liberar, tratando a biblioteca por prioridade com o alcance documentado.', 'Corrige o que é crítico e verificado, valida com reteste e trata o item de baixo alcance por prioridade.', true),
        o('Liberar a release e registrar a falha no backlog da próxima sprint, pois a funcionalidade comercial tem prazo contratual.', 'Uma falha crítica de acesso a dados de outros clientes em produção não é aceitável sem decisão formal do dono do risco.', false),
        o('Liberar com um WAF bloqueando padrões de IDOR na borda, sem alterar o código, e programar a correção para a próxima sprint.', 'WAF não entende a regra de autorização do negócio. É uma camada, não a correção da causa.', false),
        o('Atualizar a biblioteca e liberar a release no prazo, tratando a API na próxima sprint por ser a correção mais complexa.', 'Corrige o item de menor risco e adia o crítico, invertendo a prioridade.', false),
      ],
    },
    {
      id: 'cf-s12',
      situation:
        'Sábado, 02h10. O SIEM da empresa-exemplo alerta login de um administrador global em dois países em 12 minutos, seguido de criação de uma regra de encaminhamento de e-mail e de um novo método de MFA. O log mostra 11 notificações push de MFA recusadas e uma aceita na madrugada. O administrador de plantão acorda e propõe apenas redefinir a senha do administrador e voltar a dormir.',
      question: 'Qual é a melhor primeira ação?',
      options: [
        o('Redefinir a senha do administrador, ligar um alerta no SIEM para novos logins dele e acompanhar na segunda-feira.', 'Sem revogar sessões e o método de MFA novo, o invasor mantém o acesso mesmo com a senha trocada.', false),
        o('Desabilitar o MFA para todos temporariamente para evitar novos pushes e simplificar o acesso de emergência da equipe.', 'Remove uma barreira durante um ataque ativo. É o oposto do necessário.', false),
        o('Revogar sessões e tokens, remover o MFA e a regra criados, preservar logs e acionar a resposta a incidentes.', 'Contém a persistência (MFA e regra), preserva evidência e abre a resposta, antes de endurecer.', true),
        o('Bloquear os dois países no acesso condicional e dar o incidente por resolvido até a revisão de segunda-feira.', 'Bloqueio geográfico é boa medida, mas não remove a persistência já criada nem revela o impacto.', false),
      ],
    },
    {
      id: 'cf-s13',
      situation:
        'Um fabricante de appliance de rede divulga uma vulnerabilidade crítica de execução remota em uma biblioteca de logging muito usada. A empresa-exemplo não mantém inventário de software nem lista de componentes (SBOM). O time de TI diz que "provavelmente não usa". Uma busca rápida encontra a biblioteca em 2 aplicações próprias e em um appliance de um fornecedor, que o fornecedor-exemplo mantém e sobre o qual não há informação de versão.',
      question: 'Qual é o próximo passo mais adequado?',
      options: [
        o('Atualizar as 2 aplicações próprias e considerar o assunto encerrado, pois o appliance é de responsabilidade contratual do fornecedor.', 'Corrige o que é seu, mas o appliance pode estar exposto e a responsabilidade operacional pelo risco continua com a empresa.', false),
        o('Mapear onde a biblioteca existe, corrigir as 2 aplicações, cobrar versão e patch do fornecedor e mitigar a exposição do appliance.', 'Cobre o que é seu e o de terceiros, mitiga a exposição e corrige a causa (falta de inventário).', true),
        o('Aguardar o comunicado oficial do fornecedor do appliance e só então agir, mantendo o monitoramento atual dos logs de acesso.', 'Esperar mantém uma possível execução remota exposta sem mitigação.', false),
        o('Bloquear no firewall todo o tráfego de saída da rede por 48 horas, avisando as áreas, até identificar onde a biblioteca está.', 'Medida desproporcional que paralisa o negócio e não identifica onde está o componente.', false),
      ],
    },
    {
      id: 'cf-s14',
      situation:
        'Uma consultora da empresa-exemplo perdeu a mochila com um notebook em um aeroporto. O MDM mostra o equipamento com criptografia de disco desativada, por uma exceção aprovada há 5 meses "para um teste de desempenho" e nunca revertida. No notebook há cópias locais de planilhas de um cliente com dados pessoais. O último check-in com o MDM foi há 3 horas. A consultora pede para "esperar, talvez alguém devolva".',
      question: 'Qual é a conduta mais adequada?',
      options: [
        o('Esperar 48 horas pela devolução antes de agir, para não gerar alarde desnecessário com o cliente.', 'Sem criptografia, cada hora aumenta o risco. Decidir sobre comunicação cabe ao dono do dado, com informação, não com silêncio.', false),
        o('Trocar a senha da consultora e registrar o chamado de perda de ativo, mantendo o notebook ativo no MDM.', 'Trocar a senha não protege os arquivos locais nem as sessões salvas no equipamento.', false),
        o('Reportar a perda à seguradora e à polícia primeiro e só depois decidir o que fazer no equipamento.', 'Comunicações externas fazem parte do caso, mas a contenção técnica não pode esperar por elas.', false),
        o('Bloquear e limpar o notebook pelo MDM, revogar sessões e acionar o dono do dado e o Jurídico.', 'Contém pelo MDM, revoga credenciais e escala a decisão de comunicação, atacando a causa (exceção sem fim).', true),
      ],
    },
    {
      id: 'cf-s15',
      situation:
        'A empresa-exemplo adquiriu uma pequena empresa e a diretoria quer conectar as redes em duas semanas por um túnel VPN para "integração rápida". Na visita técnica, o time de segurança vê que a empresa adquirida não tem inventário de ativos, usa a mesma senha de administrador local em todos os servidores, mantém um servidor de arquivos exposto à internet e tem contas de ex-funcionários ativas. A diretoria pede que a TI "só abra o túnel".',
      question: 'Qual é a melhor proposta da segurança?',
      options: [
        o('Conectar só por um segmento isolado, com acesso mínimo por aplicação, e corrigir a higiene em paralelo antes de ampliar.', 'Entrega a integração de forma controlada, sem importar o risco para a rede principal, e corrige a higiene em paralelo.', true),
        o('Abrir o túnel como pedido, com regras de firewall bloqueando RDP e SMB entre as redes e revisão em 30 dias.', 'Bloqueio parcial não remove a confiança de uma rede não inventariada com credenciais compartilhadas.', false),
        o('Recusar qualquer conexão até que a empresa adquirida conclua uma auditoria completa, sem prazo definido para a decisão.', 'Sem alternativa viável o negócio contorna a segurança. Uma conexão restrita atende ambos os lados.', false),
        o('Conectar na rede principal e aplicar monitoramento reforçado do tráfego nos primeiros 30 dias, com alertas no SIEM.', 'Monitorar não substitui contenção: o invasor pode entrar por qualquer ativo fraco e mover-se lateralmente.', false),
      ],
    },
  ],
  understand:
    'O QUE SE REPETE NOS 15 CENÁRIOS? Quase toda boa resposta tem uma ordem: 1) conter (revogar credencial, isolar host, restringir acesso), 2) preservar evidência (logs, snapshots) antes de limpar, 3) corrigir a causa (inventário, configuração, processo), 4) decidir e comunicar com quem tem competência (dono do ativo, Segurança, Jurídico, cliente).\n\n' +
    'ARMADILHAS COMUNS: 1) Boa ação na ordem errada: restaurar antes de conter, apagar antes de preservar, treinar antes de revogar; 2) Tratar o sintoma: trocar senha sem revogar sessão, bloquear IP sem isolar o host; 3) Confiar em um único controle: WAF, MFA ou criptografia não substituem os demais; 4) Esperar terceiros: fornecedores e relatórios chegam depois, a contenção é sua.\n\n' +
    'ATENÇÃO: conteúdo educativo e em rascunho. A relação cenário-controle é seleção editorial a conferir na fonte oficial. Decisões reais cabem a [inserir responsável de Segurança da Informação Opah].',
  goodPractices: [
    'Pergunte sempre: o que está exposto, qual controle falhou primeiro, o que contém agora, o que corrige a causa e quem decide.',
    'Credencial suspeita: revogue sessões e tokens, não só a senha, e verifique persistência (regras, MFA novo, chaves).',
    'Preserve logs e snapshots antes de apagar ou reinstalar; isole da rede em vez de desligar.',
    'Priorize vulnerabilidades por exposição, exploração conhecida e contexto do ativo, não só pela pontuação base.',
    'Terceiros, exceções e ativos fora do inventário são a origem frequente do incidente: dê dono, prazo de revisão e monitoramento.',
  ],
  references: [],
  safeguards: [],
  cases: [],
};

export const CIS_FINAL_VISUALS: Record<string, ScenarioVisual> = {
  'cf-s1': {
    kind: 'log', title: 'Console de nuvem: resumo de atividade (conta cliente-exemplo)',
    lines: [
      'alerta de custo: +600% em 48h',
      'instancias novas: 14 (regiao nunca usada pela empresa)',
      'criadas por: access key AKIA-EXEMPLO (usuario de servico svc-legado)',
      'key criada ha 2 anos, ultimo uso legitimo: ha 8 meses',
      'key presente no cofre de segredos: NAO | presente no inventario: NAO',
    ],
    note: 'Valor de key fictício. A key nunca foi usada de forma legítima nos últimos 8 meses.',
  },
  'cf-s2': {
    kind: 'log', title: 'build #2291 (repositorio publico do cliente-exemplo)',
    lines: [
      '[step 4/7] debug: printenv',
      'DEPLOY_TOKEN=<valor visivel no log, omitido aqui>',
      'REGISTRY=registry.cliente-exemplo.test',
      'permissoes do token: write em imagens de PRODUCAO',
      'log visivel publicamente por ~3h; indexado por busca automatica',
      'ultimo push no registro com este token: 14 minutos apos a publicacao do log',
    ],
    note: 'Detalhe relevante: houve um push com o token logo após a exposição. Valor do token omitido.',
  },
  'cf-s3': {
    kind: 'email', from: 'seguranca@fornecedor-exemplo.test', to: 'clientes@empresa-exemplo.test',
    subject: 'Comunicado: incidente em plataforma de acesso remoto',
    body: [
      'Identificamos atividade não autorizada em nossa plataforma de acesso remoto. Alguns clientes podem ter sido afetados.',
      'Estamos investigando e enviaremos atualizações. Não há necessidade de ação imediata.',
      'Recomendamos manter o monitoramento habitual.',
    ],
    flag: 'Sem IOC, sem lista de clientes, sem prazo; "sem necessidade de ação" não equivale a "sem risco"',
  },
  'cf-s4': {
    kind: 'email', from: 'financeiro@fornecedor-exemplo.test', to: 'analista.fin@empresa-exemplo.test',
    subject: 'RE: Pagamento NF 7731: atualização de conta bancária',
    body: [
      'Boa tarde! Por favor use a nova conta abaixo para o pagamento de hoje: Banco 000, Ag. 0000, C/C 00000-0.',
      'Resposta ao seu pedido de confirmação: sim, é este mesmo. Conta antiga em encerramento.',
    ],
    flag: 'Log de auditoria: regra de caixa criada no e-mail do fornecedor (oculta, move respostas para RSS) e login de IP 203.0.113.50 às 03h',
  },
  'cf-s5': {
    kind: 'log', title: 'Console de backup e servidores de arquivos (resumo)',
    lines: [
      'FS-01: arquivos .locked (criptografado) | FS-02: arquivos .locked',
      'FS-03: operacional | FS-04: operacional',
      'ultimo job de backup com sucesso: ha 9 dias',
      'conta de servico do backup: mesma do administrador de dominio',
      'repositorio de backup: acessivel por SMB a partir de FS-01',
      'bilhete de resgate: exige contato em 72h',
    ],
    note: 'O repositório de backup é alcançável a partir de um servidor já comprometido.',
  },
  'cf-s6': {
    kind: 'log', title: 'Alerta EDR e inventario',
    lines: [
      'host: NB-0412 | severidade: ALTA',
      'powershell.exe -enc <payload codificado> iniciado por winword.exe',
      'conexao de saida: 198.51.100.77:443',
      'inventario de ativos: host NAO ENCONTRADO',
      'diretorio de contas: ultimo logon ontem (usuario: comercial)',
      'SO: ultima atualizacao ha 11 meses',
    ],
    note: 'O processo-pai é um documento do Word, o que indica provável abertura de arquivo malicioso.',
  },
  'cf-s7': {
    kind: 'sheet', title: 'priorizacao_scan_trimestral.xlsx',
    columns: ['Ativo', 'Achado', 'CVSS', 'Exposição', 'Exploração conhecida', 'Dono'],
    rows: [
      ['Servidores de laboratório (40 itens)', 'Múltiplas CVEs', '9.8', 'Interno, segmento isolado', 'Não', 'Infra'],
      ['Firewall perimetral FW-EDGE', '3 CVEs na interface de gestão', '7.5', 'Gestão exposta à internet', 'Sim (catálogo público)', 'Infra'],
      ['Servidor legado SRV-OLD-07', '1 CVE', '8.1', 'Interno', 'Não', '(sem dono)'],
    ],
    note: 'Capacidade do time: 15 correções no mês.',
  },
  'cf-s8': {
    kind: 'chat', channel: 'Time de desenvolvimento',
    messages: [
      { who: 'Líder técnico', text: 'Preciso de um dump completo da produção na homologação. É pontual, depois apagamos.' },
      { who: 'Analista de segurança', text: 'Homologação hoje: 25 pessoas com acesso (6 prestadores), disco sem criptografia, senhas de 6 caracteres conhecidas pelo time.' },
      { who: 'Líder técnico', text: 'O bug só acontece com o cliente 4471. Não precisa do resto da base.' },
    ],
  },
  'cf-s9': {
    kind: 'sheet', title: 'cruzamento_desligamentos_x_identidade.xlsx',
    columns: ['Colaborador', 'Saída (RH)', 'Conta ativa?', 'Último login', 'Acessos'],
    rows: [
      ['Pessoa Exemplo 1', '05/10', 'Não', '05/10', '-'],
      ['Pessoa Exemplo 2', '08/10', 'SIM', '17/10 (VPN, 198.51.100.200)', 'Repositórios, base de clientes, dona da conta svc-noturno'],
      ['Pessoa Exemplo 3', '12/10', 'SIM', '12/10', 'E-mail'],
    ],
    note: 'Datas fictícias. A conta svc-noturno é compartilhada e usada em um job noturno.',
  },
  'cf-s10': {
    kind: 'log', title: 'Retenção de logs e linha do tempo',
    lines: [
      'indicio inicial (parceiro): dados a venda | acesso inicial estimado: ha 40+ dias',
      'logs de acesso do servidor web: retencao 30 dias (locais)',
      'logs de autenticacao do diretorio: sobrescritos a cada 14 dias',
      'coleta centralizada: nenhuma | sincronizacao de horario: inconsistente',
      'registros disponiveis hoje: cobrem apenas os ultimos 14 a 30 dias',
    ],
    note: 'O período mais importante da investigação está fora do que foi retido.',
  },
  'cf-s11': {
    kind: 'sheet', title: 'relatorio_pentest_portal.xlsx (resumo)',
    columns: ['ID', 'Achado', 'Severidade', 'Evidência', 'Status'],
    rows: [
      ['PT-01', 'IDOR em /api/v1/clientes/{id}/faturas', 'Crítica', 'Leitura de faturas de outro cliente trocando o ID', 'Aberto'],
      ['PT-02', 'Biblioteca XML com CVE conhecida', 'Média', 'Time diz não ser alcançável; não reproduzido', 'Aberto'],
    ],
    note: 'Release comercial em 3 dias. A autorização no endpoint é por token, sem checagem de dono do recurso.',
  },
  'cf-s12': {
    kind: 'log', title: 'SIEM: alertas do administrador global (madrugada de sábado)',
    lines: [
      '02:04 login admin-global@empresa-exemplo.test pais=BR ip=203.0.113.10',
      '02:16 login admin-global@empresa-exemplo.test pais=outro ip=198.51.100.150',
      '02:17-02:28 MFA push recusado x11 | 02:29 MFA aprovado',
      '02:31 nova regra de encaminhamento: todas as mensagens -> externo@exemplo.test',
      '02:33 novo metodo de MFA registrado (app desconhecido)',
    ],
    note: 'A senha pode ter sido obtida antes; o invasor já criou persistência.',
  },
  'cf-s13': {
    kind: 'chat', channel: 'Gestão de vulnerabilidades',
    messages: [
      { who: 'TI', text: 'Saiu a CVE crítica de execução remota na biblioteca de logging. Acho que não usamos.' },
      { who: 'Analista', text: 'Grep rápido: achei nas apps Financeiro-API e Portal-Cliente. E o appliance de VPN do fornecedor-exemplo traz uma biblioteca equivalente, sem informação de versão.' },
      { who: 'TI', text: 'O appliance é do fornecedor, não é problema nosso. Interface de gestão dele está na internet, mas tem senha.' },
    ],
  },
  'cf-s14': {
    kind: 'log', title: 'MDM: estado do notebook NB-CONS-0231',
    lines: [
      'ultimo check-in: ha 3 horas | local aproximado: aeroporto',
      'criptografia de disco: DESATIVADA (excecao #118 aprovada ha 5 meses, sem data de fim)',
      'dados locais: planilhas do cliente-exemplo (dados pessoais)',
      'sessoes ativas: e-mail, VPN (token salvo)',
      'comando remoto disponivel: bloquear / limpar',
    ],
    note: 'A exceção foi aprovada para um teste de desempenho e nunca revertida.',
  },
  'cf-s15': {
    kind: 'sheet', title: 'visita_tecnica_empresa_adquirida.xlsx',
    columns: ['Item verificado', 'Achado', 'Risco'],
    rows: [
      ['Inventário de ativos', 'Inexistente', 'Alto'],
      ['Senha de administrador local', 'Mesma senha em todos os servidores', 'Alto'],
      ['Servidor de arquivos', 'Exposto à internet (203.0.113.80)', 'Alto'],
      ['Contas de ex-funcionários', '9 contas ativas', 'Médio'],
    ],
    note: 'Pedido da diretoria: abrir túnel VPN completo em 2 semanas.',
  },
};
