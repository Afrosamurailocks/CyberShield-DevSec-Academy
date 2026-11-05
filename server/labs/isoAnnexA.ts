/**
 * Conteúdo didático dos 4 temas do Anexo A da ISO/IEC 27001:2022 (i08 a i11). 100% fictício nos cenários
 * (domínios .test, IPs RFC 5737). Texto parafraseado; numeração dos controles é seleção editorial a conferir
 * na norma adquirida (ISO/IEC 27001:2022 e ISO/IEC 27002:2022).
 * RASCUNHO para revisão humana (Segurança da Informação e de Compliance).
 */
import { o } from './cisContentA.js';
import type { IsoModuleContent } from './isoTypes.js';

export const ISO_ANNEX_A: IsoModuleContent[] = [
  // ---------------------------------------------------------------- i08 · A.5
  {
    id: 'i08',
    order: 8,
    code: 'A.5',
    title: 'Controles organizacionais',
    summary: 'Políticas, papéis, acesso, fornecedores, nuvem, incidentes, continuidade e privacidade: o maior tema do Anexo A.',
    minutes: 20,
    legalBasis: 'ISO/IEC 27001:2022, Anexo A, tema 5: Controles organizacionais (ISO/IEC 27002:2022 como guia)',
    context:
      'O QUE É O TEMA ORGANIZACIONAL? É o maior grupo do Anexo A (37 controles, numerados A.5.1 a A.5.37, segundo a seleção editorial a conferir na norma). Cobre o que a organização decide e governa: políticas, papéis e responsabilidades, segregação de funções, inteligência de ameaças (A.5.7), classificação e transferência de informação, controle de acesso e identidades (A.5.15 a A.5.18), fornecedores (A.5.19 a A.5.22), serviços em nuvem (A.5.23), incidentes (A.5.24 a A.5.28), continuidade e prontidão de TIC (A.5.29 e A.5.30), requisitos legais e privacidade (A.5.31 a A.5.34) e revisão independente.\n\n' +
      'O ANEXO A NÃO É UM CHECKLIST. Os controles do Anexo A entram no SGSI a partir do tratamento de riscos (cláusula 6.1.3): você compara os controles necessários com os do Anexo A para conferir que nada relevante ficou de fora. A Declaração de Aplicabilidade (SoA) registra quais controles foram incluídos, por quê, se estão implementados e justifica as exclusões. Controle excluído sem justificativa, ou incluído sem evidência, é não conformidade.\n\n' +
      'NA PRÁTICA: 1) para cada controle organizacional, ligue-o a um risco tratado e a um dono; 2) guarde evidência de operação (registros, aprovações, revisões), não só a política; 3) registre na SoA o motivo de cada inclusão ou exclusão e revise quando o contexto mudar.',
    scenarios: [
      {
        id: 'i08-s1',
        situation:
          'A analista de projetos precisa enviar ao consultor externo do cliente-exemplo.test uma planilha de usuários da plataforma, com nome, e-mail e perfil de acesso. O prazo da reunião é em duas horas. A política da empresa-exemplo.test classifica esse tipo de arquivo como "Confidencial" e prevê regras para transferir informação a terceiros. O arquivo já está rotulado, mas o consultor só tem e-mail pessoal, e o contrato com o cliente-exemplo.test tem uma cláusula de confidencialidade geral.',
        question: 'Qual é a melhor decisão para transferir a planilha?',
        options: [
          o('Enviar ao e-mail pessoal do consultor, já que o arquivo está rotulado Confidencial e há cláusula contratual.', 'O rótulo e a cláusula não substituem o canal. A regra de transferência exige destinatário e meio autorizados, e e-mail pessoal foge ao controle da organização.'),
          o('Usar o canal aprovado para externos, com destinatário validado, acesso temporário e registro do envio.', 'Correto. A.5.14 pede regras, procedimentos e acordos para transferir informação conforme a classificação, e o canal aprovado entrega o prazo sem abrir mão do controle.', true),
          o('Remover as colunas de e-mail e perfil e enviar o restante ao e-mail pessoal do consultor.', 'Reduzir dados ajuda, mas o canal continua inadequado e a planilha pode ainda permitir reidentificação. A regra de transferência não foi aplicada.'),
          o('Adiar a reunião até o consultor receber um e-mail corporativo, para garantir conformidade total.', 'Existe canal aprovado que atende ao prazo. Interromper o negócio sem necessidade é uma resposta desproporcional ao risco.'),
        ],
      },
      {
        id: 'i08-s2',
        situation:
          'Durante a preparação para a auditoria interna, a área de produtos da empresa-exemplo.test é questionada sobre uma ferramenta SaaS usada para armazenar anexos de clientes. A ferramenta foi contratada pela equipe com cartão corporativo, sem passar por TI ou Compliance. O líder defende que o serviço "é de um fornecedor grande" e funciona bem. A SoA da empresa tem o controle de serviços em nuvem como aplicável, mas o inventário de serviços em nuvem não lista essa ferramenta. O contrato com o cliente-exemplo.test proíbe uso de subprocessadores sem aviso prévio.',
        question: 'Qual é a primeira ação mais adequada?',
        options: [
          o('Bloquear hoje o acesso à ferramenta e migrar os anexos ao repositório interno, sem avaliar o impacto nem avisar o cliente.', 'Pode parar o negócio e perder dados. Bloquear sem plano trata o sintoma e não cria o processo de aquisição e saída.'),
          o('Aceitar o serviço pela reputação do fornecedor e apenas incluí-lo no inventário antes da auditoria.', 'Inventariar é necessário, mas reputação não equivale a avaliação de riscos, responsabilidades e cláusulas contratuais com o cliente.'),
          o('Passar a ferramenta pelo processo de nuvem: avaliar riscos e contrato, definir saída e avisar o cliente.', 'Correto. A.5.23 pede processos para adquirir, usar, gerir e encerrar serviços em nuvem, e a cláusula de subprocessadores torna a avaliação e o aviso ao cliente parte da decisão.', true),
          o('Excluir o controle de nuvem da SoA, já que a empresa não tem política para esse tipo de serviço.', 'Excluir porque falta processo inverte a lógica. O controle é aplicável pelo risco, e a SoA deve refletir a realidade e a lacuna.'),
        ],
      },
      {
        id: 'i08-s3',
        situation:
          'Às 22h40, o monitoramento detecta que um servidor de aplicação do cliente-exemplo.test, operado pela empresa-exemplo.test, tem conexões ativas para um endereço externo desconhecido. O plantonista propõe reinstalar o servidor imediatamente a partir da imagem padrão para "voltar ao ar". O gerente quer saber se houve vazamento antes de qualquer mudança. O procedimento de incidentes prevê contenção, preservação de evidências e comunicação conforme a gravidade.',
        question: 'Qual é a melhor ação imediata?',
        options: [
          o('Reinstalar o servidor agora, pois a disponibilidade é prioridade, e analisar depois pelos logs.', 'A reinstalação apaga memória, processos e artefatos que permitem entender o que aconteceu, e os logs sozinhos podem estar incompletos ou adulterados.'),
          o('Isolar o servidor da rede mantendo-o ligado, preservar disco, memória e logs e acionar o processo de incidentes.', 'Correto. A.5.26 e A.5.28 pedem resposta conforme os procedimentos e coleta de evidências identificáveis e preservadas, e isolar sem desligar contém sem destruir provas.', true),
          o('Desligar o servidor da tomada para impedir qualquer vazamento e abrir um chamado para a manhã seguinte.', 'Desligar bruscamente perde a memória volátil, e deixar para a manhã atrasa a triagem de um incidente que pode ter obrigações de notificação.'),
          o('Bloquear só o endereço externo no firewall e encerrar o alerta como mitigado após o bloqueio.', 'O bloqueio é útil, mas o invasor pode ter outros caminhos e a causa não foi analisada. Encerrar sem investigar deixa o incidente aberto.'),
        ],
      },
    ],
    visuals: {
      'i08-s1': {
        kind: 'email',
        from: 'analista.projetos@empresa-exemplo.test',
        to: 'consultor.externo@exemplo-pessoal.test',
        subject: 'Planilha de usuários para a reunião das 15h',
        attachments: ['usuarios_plataforma.xlsx (rótulo: CONFIDENCIAL)'],
        body: ['Segue a planilha completa para a reunião de hoje.', 'Como você não tem e-mail corporativo ainda, mando para o seu e-mail pessoal.'],
        flag: 'Destinatário externo, domínio pessoal, sem canal aprovado',
      },
      'i08-s2': {
        kind: 'sheet',
        title: 'servicos_nuvem_inventario.csv',
        columns: ['Serviço', 'Listado no inventário?', 'Dados de cliente?', 'Cláusula do cliente sobre subprocessadores'],
        rows: [
          ['Repositório interno de documentos', 'sim', 'sim', 'coberto'],
          ['Ferramenta de anexos (SaaS, cartão corporativo)', 'não', 'sim, anexos do cliente-exemplo.test', 'aviso prévio exigido'],
          ['Ferramenta de videoconferência', 'sim', 'não', 'n/a'],
        ],
        note: 'Dados fictícios.',
      },
      'i08-s3': {
        kind: 'log',
        title: 'Alertas do monitoramento · SRV-APP-07 (10.20.5.17)',
        lines: [
          '22:38:11 ALERTA  conexão de saída 10.20.5.17 -> 198.51.100.44:443 (destino sem histórico)',
          '22:39:02 ALERTA  processo desconhecido "svc-update" iniciado por usuário www',
          '22:40:15 ALERTA  transferência de 1,8 GB para 198.51.100.44 em curso',
          '22:41:00 INFO    plantonista solicita reinstalação a partir da imagem padrão',
        ],
        note: 'A conexão continua ativa no momento da decisão.',
      },
    },
    understand:
      'COMO O TEMA ORGANIZACIONAL SE CONECTA AO SGSI? Estes controles dependem de governança: política aprovada pela direção, papéis atribuídos, processos operando e evidências guardadas. Muitos são novos ou foram consolidados na edição 2022, como inteligência de ameaças (A.5.7), uso de serviços em nuvem (A.5.23) e prontidão de TIC para a continuidade (A.5.30), segundo a seleção editorial a conferir na norma.\n\n' +
      'COMO PENSAR: para cada controle, pergunte qual risco ele trata, quem é o dono, qual processo o executa e qual evidência prova que funciona. Se a SoA diz "implementado" e ninguém acha o registro, o controle existe só no papel.',
    goodPractices: [
      'Ligue cada controle organizacional a um risco do tratamento e a um dono nomeado.',
      'Mantenha inventário de serviços em nuvem e de fornecedores, e passe toda nova contratação pelo mesmo processo.',
      'Defina canais aprovados para transferir informação por classificação, e deixe o caminho aprovado mais fácil que o atalho.',
      'Ensaie o procedimento de incidentes, incluindo preservação de evidências e critérios de comunicação.',
      'Revise a SoA quando houver mudança de escopo, de risco ou de contrato, e registre a justificativa de cada exclusão.',
    ],
    safeguards: [
      { id: 'A.5.1', title: 'Políticas de segurança da informação' },
      { id: 'A.5.3', title: 'Segregação de funções' },
      { id: 'A.5.7', title: 'Inteligência de ameaças' },
      { id: 'A.5.15', title: 'Controle de acesso' },
      { id: 'A.5.23', title: 'Segurança no uso de serviços em nuvem' },
      { id: 'A.5.26', title: 'Resposta a incidentes de segurança' },
      { id: 'A.5.30', title: 'Prontidão de TIC para a continuidade' },
      { id: 'A.5.34', title: 'Privacidade e proteção de dados pessoais' },
    ],
  },

  // ---------------------------------------------------------------- i09 · A.6
  {
    id: 'i09',
    order: 9,
    code: 'A.6',
    title: 'Controles de pessoas',
    summary: 'Triagem, termos, conscientização, desligamento, confidencialidade, trabalho remoto e reporte de eventos.',
    minutes: 18,
    legalBasis: 'ISO/IEC 27001:2022, Anexo A, tema 6: Controles de pessoas (ISO/IEC 27002:2022 como guia)',
    context:
      'O QUE É O TEMA DE PESSOAS? São 8 controles (A.6.1 a A.6.8, seleção editorial a conferir na norma) sobre o ciclo de vida de quem trabalha com a informação: triagem antes da contratação, termos e condições de trabalho, conscientização e treinamento (A.6.3), processo disciplinar, responsabilidades após desligamento ou mudança de função, acordos de confidencialidade, trabalho remoto (A.6.7) e reporte de eventos de segurança (A.6.8).\n\n' +
      'POR QUE NÃO É UM CHECKLIST? A necessidade de cada controle vem do risco. Triagem de um estagiário sem acesso a dados sensíveis pode ser proporcional; a de um administrador de produção, não. A SoA justifica a profundidade adotada e as exclusões, e o treinamento deve ser medido pelo comportamento, não só pela presença.\n\n' +
      'NA PRÁTICA: 1) alinhe triagem e termos ao nível de acesso de cada papel; 2) transforme treinamento em hábito, com reporte fácil e sem punição por boa-fé; 3) trate entrada, mudança e saída de pessoas como eventos que ajustam acessos no mesmo dia.',
    scenarios: [
      {
        id: 'i09-s1',
        situation:
          'Um desenvolvedor da empresa-exemplo.test clicou em um link de uma mensagem de "atualização do sistema de ponto" na sexta à tarde e digitou a senha. A página fechou sem erro. Ele não tem certeza se era phishing e teme ser criticado, porque a empresa divulgou a taxa de cliques do último simulado em uma reunião. Na segunda de manhã ele cogita trocar a senha por conta própria e não avisar ninguém.',
        question: 'Qual é a melhor orientação para ele?',
        options: [
          o('Trocar a senha por conta própria e monitorar se algo estranho acontece, já que o problema parece resolvido.', 'Trocar a senha ajuda, mas sem reporte a empresa não verifica sessões, outros acessos e se a mesma mensagem chegou a colegas.'),
          o('Esperar a próxima reunião de segurança para relatar, quando todos puderem discutir o caso com calma.', 'O atraso dá tempo ao invasor. Reportar rápido é o ponto do controle, e não deve depender de uma reunião.'),
          o('Reportar agora pelo canal de eventos, trocar a senha com a equipe e permitir verificar sessões.', 'Correto. A.6.8 pede mecanismo para que as pessoas reportem eventos observados ou suspeitos de forma rápida pelos canais apropriados, e reportar em boa-fé não deve gerar punição.', true),
          o('Perguntar aos colegas se receberam a mesma mensagem antes de decidir se vale a pena reportar.', 'Ajuda a medir o alcance, mas não substitui o reporte. A decisão de avaliar o evento é da equipe de segurança.'),
        ],
      },
      {
        id: 'i09-s2',
        situation:
          'O RH da empresa-exemplo.test comunica a saída de um analista contratado como consultor, que atuava em dois projetos. O último dia foi quinta. Na segunda, a revisão de acessos mostra que a conta dele ainda está ativa em ferramentas de projeto e no repositório de código, e o crachá segue habilitado. O gestor diz que a pessoa "foi embora numa boa" e que podem deixar tudo até o fim do mês para facilitar a passagem de conhecimento. O contrato do consultor tem cláusula de confidencialidade que continua após a saída.',
        question: 'Qual é a melhor decisão?',
        options: [
          o('Manter os acessos até o fim do mês, confiando na cláusula de confidencialidade, que segue válida após a saída.', 'A cláusula é um controle de pessoas, mas não substitui revogar o acesso. Acesso ativo sem necessidade é risco evitável.'),
          o('Revogar só o crachá e a conta de e-mail, que são os acessos mais visíveis, e revisar o resto no fim do mês.', 'O repositório e as ferramentas de projeto continuam abertos. O desligamento precisa cobrir todos os acessos e ativos.'),
          o('Criar uma conta nova para o consultor transferir o conhecimento e apagar tudo ao final do mês, quando o projeto acabar.', 'Cria um acesso extra sem base. A passagem de conhecimento se resolve com um período planejado e acessos mínimos.'),
          o('Revogar todos os acessos e recolher os ativos hoje, registrar a saída e lembrar as obrigações pós-desligamento.', 'Correto. A.6.5 trata das responsabilidades que permanecem após o desligamento ou a mudança de função, e a passagem de conhecimento deve ser planejada antes da saída.', true),
        ],
      },
      {
        id: 'i09-s3',
        situation:
          'Uma analista da empresa-exemplo.test trabalha de casa e, quando a conexão da VPN cai, usa o notebook pessoal da família com a sessão do navegador corporativo, apenas para "terminar uma entrega". A empresa tem política de trabalho remoto que exige dispositivo corporativo para dados de clientes. O log de acesso mostra um padrão: o mesmo usuário acessa o repositório de documentos de clientes por dois dispositivos diferentes, um deles não gerenciado. O gestor sabe, mas diz que a entrega é prioridade.',
        question: 'Qual é a melhor resposta?',
        options: [
          o('Aceitar a exceção enquanto durar a entrega, pois a analista é de confiança, o acesso é só de leitura e o prazo é crítico.', 'Confiança na pessoa não substitui controles sobre o dispositivo. Dispositivo não gerenciado com dados de clientes foge da política e do risco aceito.'),
          o('Aplicar a regra do trabalho remoto: bloquear dados de clientes em dispositivo não gerenciado e corrigir a VPN.', 'Correto. A.6.7 pede medidas para proteger informação acessada, tratada ou armazenada fora das instalações, e tratar a causa (VPN instável) evita que o atalho volte.', true),
          o('Orientar a analista a usar janela anônima no dispositivo pessoal, que não guarda histórico da sessão.', 'A janela anônima não resolve o risco de malware, captura de tela, cópia de arquivos e perda do dispositivo.'),
          o('Liberar acesso integral dos dispositivos pessoais de toda a equipe, para evitar situações como essa.', 'Amplia a superfície e o risco. A solução é tornar o acesso corporativo confiável, não liberar o não gerenciado.'),
        ],
      },
    ],
    visuals: {
      'i09-s1': {
        kind: 'chat',
        channel: 'Canal privado · desenvolvedor e colega',
        messages: [
          { who: 'Desenvolvedor', text: 'Cliquei no link do ponto na sexta e coloquei a senha. Acho que era golpe.' },
          { who: 'Colega', text: 'Melhor não falar nada. Na reunião de quarta mostraram a lista de quem clicou no simulado.' },
          { who: 'Desenvolvedor', text: 'Vou só trocar a senha na segunda e ver se acontece algo.' },
        ],
      },
      'i09-s2': {
        kind: 'sheet',
        title: 'revisao_acessos_desligamento.csv',
        columns: ['Sistema', 'Conta do consultor', 'Último acesso', 'Status'],
        rows: [
          ['Repositório de código', 'consultor.exemplo', 'sexta, 16:12', 'ATIVA'],
          ['Ferramenta de projetos', 'consultor.exemplo', 'sexta, 17:03', 'ATIVA'],
          ['Controle de acesso predial', 'crachá 4471', 'segunda, 07:55', 'HABILITADO'],
          ['E-mail corporativo', 'consultor.exemplo', 'quinta, 18:00', 'desativada'],
        ],
        note: 'Dados fictícios. Note o último acesso do crachá.',
      },
      'i09-s3': {
        kind: 'log',
        title: 'Acessos ao repositório de documentos de clientes · usuária analista.exemplo',
        lines: [
          '09:14 login  disp=NB-CORP-0231 (gerenciado)    via VPN  origem=203.0.113.18',
          '14:52 queda da VPN 14:52-15:30 (ticket de rede aberto 3x neste mês)',
          '15:03 login  disp=desconhecido (navegador pessoal)  sem VPN  origem=198.51.100.60',
          '15:07 download pasta "cliente-exemplo/contratos" (212 arquivos)',
        ],
        note: 'IPs de documentação (RFC 5737).',
      },
    },
    understand:
      'COMO O TEMA DE PESSOAS FUNCIONA NA PRÁTICA? Pessoas são a camada que mais muda: entram, trocam de função, trabalham de casa e saem. Os controles pedem que cada passo tenha regra, responsável e registro, e que o treinamento (A.6.3) seja avaliado por resultado, e não pela lista de presença.\n\n' +
      'COMO PENSAR: um bom controle de pessoas reduz atrito e protege quem relata erro. Se reportar gera constrangimento, o evento só será descoberto quando o dano for maior.',
    goodPractices: [
      'Ligue a triagem e os termos de trabalho ao nível de acesso do papel, de forma proporcional ao risco.',
      'Meça a conscientização por comportamento (reporte, cliques em simulados) e use o resultado para ajustar o treinamento.',
      'Torne o reporte de eventos simples e sem punição por boa-fé; divulgue a taxa de reporte, não só a de cliques.',
      'Trate desligamento e mudança de função como eventos com checklist: acessos, ativos, passagem de conhecimento e lembrete de confidencialidade.',
      'Defina o que é permitido no trabalho remoto e corrija as causas que levam as pessoas ao atalho.',
    ],
    safeguards: [
      { id: 'A.6.1', title: 'Triagem' },
      { id: 'A.6.2', title: 'Termos e condições de contratação' },
      { id: 'A.6.3', title: 'Conscientização, educação e treinamento' },
      { id: 'A.6.4', title: 'Processo disciplinar' },
      { id: 'A.6.5', title: 'Responsabilidades após desligamento ou mudança' },
      { id: 'A.6.6', title: 'Acordos de confidencialidade' },
      { id: 'A.6.7', title: 'Trabalho remoto' },
      { id: 'A.6.8', title: 'Reporte de eventos de segurança' },
    ],
  },

  // ---------------------------------------------------------------- i10 · A.7
  {
    id: 'i10',
    order: 10,
    code: 'A.7',
    title: 'Controles físicos',
    summary: 'Perímetros, entrada, monitoramento físico, mesa limpa, equipamentos, mídias e descarte seguro.',
    minutes: 18,
    legalBasis: 'ISO/IEC 27001:2022, Anexo A, tema 7: Controles físicos (ISO/IEC 27002:2022 como guia)',
    context:
      'O QUE É O TEMA FÍSICO? São 14 controles (A.7.1 a A.7.14, seleção editorial a conferir na norma) sobre o ambiente onde a informação vive: perímetros, entrada física, escritórios e salas, monitoramento da segurança física (A.7.4, novo na edição 2022), proteção contra ameaças físicas e ambientais, trabalho em áreas seguras, mesa e tela limpas (A.7.7), posicionamento de equipamentos, segurança de ativos fora das instalações, mídias, utilidades, cabeamento, manutenção e descarte ou reutilização seguros (A.7.14).\n\n' +
      'POR QUE NÃO É UM CHECKLIST? O que vale para um datacenter não vale para um escritório de coworking. A seleção vem do risco: onde estão os ativos, quem entra, o que acontece se falhar. A SoA pode excluir um controle com justificativa, por exemplo quando o local é de um provedor de nuvem que mantém a certificação e a responsabilidade compartilhada está documentada.\n\n' +
      'NA PRÁTICA: 1) classifique as áreas por criticidade e ajuste entrada e monitoramento; 2) garanta que alarmes e câmeras tenham dono, destino e teste de resposta; 3) trate descarte e manutenção como etapas do ciclo de vida do ativo, com evidência.',
    scenarios: [
      {
        id: 'i10-s1',
        situation:
          'Após o expediente, a equipe de limpeza da empresa-exemplo.test encontra uma sala de reuniões com um quadro branco com diagrama de rede e senhas anotadas, pastas com contratos impressos do cliente-exemplo.test e um notebook sem bloqueio de tela. A sala fica em um andar com acesso de visitantes. A política de mesa e tela limpas existe, mas a verificação ao fim do dia é informal. O gerente responsável diz que "foi só um dia corrido".',
        question: 'Qual é a melhor ação?',
        options: [
          o('Pedir à equipe de limpeza que apague o quadro e deixe papéis e notebook como estão até a manhã.', 'Apagar o quadro ajuda, mas deixar papéis e notebook expostos mantém o risco, e a equipe de limpeza não deve manusear ativos de informação.'),
          o('Recolher e guardar os ativos com segurança, registrar o desvio e reforçar a verificação de mesa limpa.', 'Correto. A.7.7 pede regras de mesa limpa para papéis e mídias e de tela limpa para recursos de processamento, e um desvio repetido sugere ajustar o hábito, e não só orientar.', true),
          o('Tratar como episódio isolado de um dia corrido e enviar um e-mail geral lembrando a política de mesa e tela limpas.', 'O lembrete ajuda, mas sem recolher os ativos agora nem registrar o desvio, o risco permanece e não gera aprendizado.'),
          o('Trocar o acesso do andar por biometria, para barrar visitantes na entrada e resolver o problema.', 'A biometria dificulta a entrada, mas o problema é o que fica exposto dentro. É um controle diferente do que o caso exige.'),
        ],
      },
      {
        id: 'i10-s2',
        situation:
          'A sala de servidores da empresa-exemplo.test tem porta com controle de acesso, câmera e sensor de abertura. Em uma revisão, o time percebe que alarmes de porta forçada são enviados para uma caixa de e-mail de um ex-funcionário e que, na última madrugada, um alarme não teve resposta. O líder de infraestrutura afirma que o sistema "funciona, está tudo instalado". Há também uma gravação de câmera que ninguém revisa.',
        question: 'Qual é a lacuna mais importante a tratar?',
        options: [
          o('Comprar mais câmeras e sensores para ampliar a cobertura da sala de servidores e o tempo de gravação.', 'Mais dispositivos não resolvem um alarme que ninguém recebe. A cobertura só vale com resposta.'),
          o('Definir dono e destino dos alarmes, procedimento de resposta e testes periódicos de acionamento.', 'Correto. A.7.4 pede monitoramento contínuo das instalações contra acesso físico não autorizado, o que só funciona se alguém recebe, avalia e age sobre o alarme.', true),
          o('Excluir o monitoramento físico da SoA, já que a sala já tem porta com controle de acesso.', 'A porta é um controle de entrada. O monitoramento detecta o que a entrada não impede, e a exclusão não é justificada pelo risco.'),
          o('Guardar as gravações das câmeras por tempo indefinido, para ter evidência em caso de incidente.', 'Retenção sem critério gera custo e risco de privacidade, e não resolve o alarme sem resposta.'),
        ],
      },
      {
        id: 'i10-s3',
        situation:
          'A empresa-exemplo.test vai descartar 40 notebooks antigos e 12 discos de servidores. O fornecedor-exemplo.test de reciclagem oferece coleta gratuita no mesmo dia e diz que "destrói tudo". A planilha de baixa mostra que parte dos equipamentos teve o disco apagado pelo time e parte não foi verificada. Alguns discos guardavam bases de clientes que já saíram do escopo. O contrato com o fornecedor não prevê certificado de destruição nem rastreio por número de série.',
        question: 'Qual é a melhor decisão antes de liberar a coleta?',
        options: [
          o('Liberar a coleta gratuita, já que o fornecedor afirma destruir tudo e isso economiza verba do projeto.', 'A afirmação verbal não é evidência. Sem contrato, rastreio e certificado, a empresa não prova que a informação foi destruída.'),
          o('Rodar formatação rápida nos discos pendentes e liberar a coleta ainda hoje, no horário oferecido.', 'A formatação rápida não elimina os dados de forma confiável, e o contrato continua sem as garantias de rastreio e destruição.'),
          o('Reter os equipamentos, sem verificação, até definir uma política de descarte no próximo ano.', 'Reter indefinidamente mantém dados em equipamentos sem controle e adia a decisão. Há soluções simples agora.'),
          o('Verificar os pendentes, sanitizar ou destruir conforme a classificação e exigir certificado e rastreio por série.', 'Correto. A.7.14 pede conferir se dados e software licenciado foram removidos ou sobrescritos com segurança antes do descarte, e o contrato precisa gerar evidência.', true),
        ],
      },
    ],
    visuals: {
      'i10-s1': {
        kind: 'chat',
        channel: 'Limpeza · relato ao facilities (18h40)',
        messages: [
          { who: 'Limpeza', text: 'Sala 4B: quadro com desenho de rede e uma lista de "usuario/senha". Pastas "cliente-exemplo contratos" em cima da mesa.', attachment: 'foto_quadro_4B.jpg' },
          { who: 'Limpeza', text: 'Também tem um notebook ligado, tela aberta, sem ninguém. Andar com visitantes até 19h.' },
        ],
      },
      'i10-s2': {
        kind: 'log',
        title: 'Eventos do controle de acesso da sala de servidores',
        lines: [
          '02:14 ALARME  porta SALA-SRV forçada (sensor de abertura)  destino: ti-antigo@empresa-exemplo.test',
          '02:14 INFO    câmera 07 gravando; sem operador de monitoramento',
          '02:31 ALARME  porta SALA-SRV fechada',
          '08:05 INFO    nenhuma resposta registrada ao alarme das 02:14',
        ],
        note: 'A caixa de destino pertence a um ex-funcionário (conta sem uso).',
      },
      'i10-s3': {
        kind: 'sheet',
        title: 'baixa_equipamentos.xlsx',
        columns: ['Item', 'Disco', 'Dados de cliente?', 'Verificado?'],
        rows: [
          ['Notebooks (1 a 22)', 'apagado pelo time', 'não', 'sim'],
          ['Notebooks (23 a 40)', 'não verificado', 'possível', 'não'],
          ['Discos de servidor (1 a 12)', 'não verificado', 'sim, bases de ex-clientes', 'não'],
        ],
        note: 'Contrato do fornecedor-exemplo.test: coleta gratuita; sem certificado de destruição; sem rastreio por número de série.',
      },
    },
    understand:
      'COMO O TEMA FÍSICO SE CONECTA AO RESTO? Muita segurança lógica cai por uma porta aberta, um disco que vai para o lixo ou uma tela destravada. Os controles físicos pedem proporcionalidade: o rigor sobe com a criticidade da área e da informação.\n\n' +
      'COMO PENSAR: um alarme, uma câmera ou uma política de descarte só valem se alguém responde, registra e prova. Evidência de operação conta mais que equipamento instalado.',
    goodPractices: [
      'Classifique as áreas por criticidade e ajuste entrada, monitoramento e regras de permanência.',
      'Dê dono e destino a cada alarme e teste o fluxo de resposta fora do horário comercial.',
      'Aplique mesa e tela limpas com verificação simples ao fim do dia e trate desvios como aprendizado.',
      'Controle mídias e equipamentos do início ao fim: inventário, transporte, manutenção e descarte.',
      'Exija certificado de destruição e rastreio por número de série de fornecedores de descarte.',
    ],
    safeguards: [
      { id: 'A.7.1', title: 'Perímetros de segurança física' },
      { id: 'A.7.2', title: 'Entrada física' },
      { id: 'A.7.3', title: 'Proteção de escritórios, salas e instalações' },
      { id: 'A.7.4', title: 'Monitoramento da segurança física' },
      { id: 'A.7.7', title: 'Mesa limpa e tela limpa' },
      { id: 'A.7.9', title: 'Segurança de ativos fora das instalações' },
      { id: 'A.7.10', title: 'Mídias de armazenamento' },
      { id: 'A.7.14', title: 'Descarte ou reutilização segura de equipamentos' },
    ],
  },

  // ---------------------------------------------------------------- i11 · A.8
  {
    id: 'i11',
    order: 11,
    code: 'A.8',
    title: 'Controles tecnológicos',
    summary: 'Endpoints, acessos privilegiados, vulnerabilidades, configuração, exclusão, backup, logging, criptografia, desenvolvimento e mudanças.',
    minutes: 20,
    legalBasis: 'ISO/IEC 27001:2022, Anexo A, tema 8: Controles tecnológicos (ISO/IEC 27002:2022 como guia)',
    context:
      'O QUE É O TEMA TECNOLÓGICO? São 34 controles (A.8.1 a A.8.34, seleção editorial a conferir na norma) sobre como a tecnologia protege a informação: endpoints, acesso privilegiado, autenticação segura, malware, gestão de vulnerabilidades técnicas (A.8.8), gestão de configuração (A.8.9), exclusão de informação (A.8.10), mascaramento de dados (A.8.11), prevenção de vazamento (A.8.12), backup (A.8.13), logging (A.8.15), monitoramento (A.8.16), filtro web (A.8.23), criptografia (A.8.24), ciclo de desenvolvimento seguro (A.8.25 a A.8.29), separação de ambientes (A.8.31), gestão de mudanças (A.8.32) e dados de teste (A.8.33). Vários são novos na edição 2022, como A.8.9 a A.8.12, A.8.16, A.8.23 e A.8.28, a conferir na norma.\n\n' +
      'POR QUE NÃO É UM CHECKLIST? Nem todo controle tecnológico se aplica a todo ambiente. A escolha vem do risco e do contexto (por exemplo, nuvem versus datacenter próprio), e a SoA explica o que foi adotado, o que foi excluído e quem prova que funciona. Ferramenta instalada sem processo e sem evidência não conta como controle operando.\n\n' +
      'NA PRÁTICA: 1) defina baselines de configuração e meça o desvio; 2) trate vulnerabilidades por exposição e criticidade, com prazos e exceções registradas; 3) aplique mudanças, dados de teste e retenção como processos com registro, não como hábitos.',
    scenarios: [
      {
        id: 'i11-s1',
        situation:
          'A empresa-exemplo.test encerrou o contrato com o cliente-exemplo.test há 14 meses. O contrato previa a eliminação dos dados após 90 dias do término. Em uma revisão para a auditoria interna, o time encontra cópias da base do cliente em um ambiente de homologação, em um bucket de backups antigos e na pasta de um ex-analista. A política de retenção existe, mas não há rotina para aplicar a exclusão em backups e ambientes de teste. O time acha que "apagar do banco principal" resolve.',
        question: 'Qual é a melhor ação?',
        options: [
          o('Apagar só a cópia de homologação, por ser a mais acessada, e deixar os backups para a rotação natural.', 'A exclusão parcial deixa dados em outros locais. A rotação natural pode levar anos e ultrapassa o prazo contratual.'),
          o('Manter todas as cópias como evidência de que o trabalho foi feito, reforçando os controles de acesso.', 'Reter sem base jurídica contraria o contrato e a política. A evidência do trabalho se mantém sem a base de dados do cliente.'),
          o('Localizar todas as cópias, excluir conforme contrato e política, tratar backups e testes e registrar a evidência.', 'Correto. A.8.10 pede excluir informação em sistemas, dispositivos e outras mídias quando não for mais necessária, e o registro prova a conformidade com o contrato.', true),
          o('Anonimizar a base do cliente e mantê-la para treinar modelos de análise internos da empresa.', 'Reuso para nova finalidade exige base contratual e jurídica própria. A anonimização não autoriza ignorar a cláusula de eliminação.'),
        ],
      },
      {
        id: 'i11-s2',
        situation:
          'O relatório mensal do scanner de vulnerabilidades da empresa-exemplo.test lista uma falha crítica de execução remota em um servidor de aplicação. O time sugere adiar a correção porque o CMDB marca o servidor como "interno" e porque há uma janela de mudança só no fim do mês. A equipe de redes percebe que um NAT recente publicou a porta do serviço na internet. Existe uma mitigação temporária do fabricante e a exploração da falha já foi noticiada.',
        question: 'Qual é a melhor decisão?',
        options: [
          o('Seguir o CMDB e a janela mensal, pois o servidor é interno e a política de mudanças deve ser respeitada.', 'O CMDB está desatualizado: a exposição mudou o risco. Respeitar o processo não exige ignorar o fato novo.'),
          o('Reavaliar o risco pela exposição real, aplicar a mitigação agora como mudança emergencial e corrigir o CMDB.', 'Correto. A.8.8 pede obter informação sobre vulnerabilidades, avaliar a exposição e tomar medidas apropriadas, e a exposição real muda a prioridade e o prazo.', true),
          o('Desativar o servidor até o fim do mês, eliminando o risco sem alterar a configuração de rede.', 'Pode parar o negócio sem necessidade. Há mitigação disponível e ajustar a exposição resolve com menos impacto.'),
          o('Registrar exceção por 90 dias, assumindo o risco, e comunicar o dono do sistema no e-mail mensal.', 'Aceitar o risco de uma falha crítica exposta e explorada sem análise é fraco. A exceção precisa de risco avaliado, dono e prazo curto.'),
        ],
      },
      {
        id: 'i11-s3',
        situation:
          'Numa sexta às 17h30, um desenvolvedor da empresa-exemplo.test quer publicar uma correção direto em produção, fora da esteira, porque o cliente-exemplo.test reclama de um erro de cálculo. O gestor autoriza por chat, sem registro de mudança. A revisão por pares está pendente e não há plano de reversão. Na semana anterior, uma mudança semelhante, também sem registro, derrubou o serviço por duas horas. A política de mudanças prevê um caminho emergencial com aprovação e revisão posterior.',
        question: 'Qual é a melhor condução?',
        options: [
          o('Publicar agora, pois o gestor autorizou e o cliente está reclamando, e formalizar a mudança na segunda-feira.', 'A autorização por chat sem registro nem reversão repete o erro da semana anterior e ignora o caminho emergencial da política.'),
          o('Cancelar a correção até a próxima janela normal, mesmo com o impacto contínuo sobre o cliente.', 'A política prevê um caminho emergencial. Adiar tudo ignora o impacto e leva as pessoas a fugirem do processo.'),
          o('Usar o caminho emergencial: registro, revisão rápida, plano de reversão e revisão posterior da mudança.', 'Correto. A.8.32 pede que mudanças em instalações e sistemas de informação sigam procedimentos de gestão de mudanças, e o caminho emergencial permite agilidade com controle.', true),
          o('Publicar só em homologação pela esteira e copiar manualmente para produção depois que os testes passarem.', 'A cópia manual cria divergência entre ambientes e foge da trilha de auditoria. O problema é o processo, e não a esteira.'),
        ],
      },
    ],
    visuals: {
      'i11-s1': {
        kind: 'sheet',
        title: 'varredura_dados_cliente_encerrado.csv',
        columns: ['Local', 'Conteúdo', 'Último acesso', 'Coberto pela rotina de exclusão?'],
        rows: [
          ['Banco principal', 'base cliente-exemplo.test', 'excluído há 13 meses', 'sim'],
          ['homolog-db', 'cópia completa (2023)', 'há 4 meses', 'não'],
          ['bucket backups-antigos', 'dump mensal (12 arquivos)', 'há 9 meses', 'não'],
          ['pasta do ex-analista', 'extração em planilha', 'há 11 meses', 'não'],
        ],
        note: 'Contrato: eliminação em até 90 dias após o término. Dados fictícios.',
      },
      'i11-s2': {
        kind: 'log',
        title: 'Relatório do scanner · SRV-APP-12 (10.20.8.12)',
        lines: [
          'CRÍTICA  execução remota de código no serviço de integração  (correção do fabricante disponível)',
          'CMDB: ambiente = interno · exposição = nenhuma  (última atualização: há 14 meses)',
          'Regra NAT 203.0.113.55:8443 -> 10.20.8.12:8443  criada há 6 dias (chamado de redes)',
          'Mitigação do fabricante disponível: desativar o módulo de integração remota',
        ],
        note: 'IPs de documentação (RFC 5737).',
      },
      'i11-s3': {
        kind: 'chat',
        channel: 'Canal #plantao-dev · sexta 17h32',
        messages: [
          { who: 'Dev', text: 'Cliente-exemplo.test está reclamando do cálculo. Posso subir o fix direto em prod? Sem revisão, só um script.' },
          { who: 'Gestor', text: 'Pode subir, depois a gente registra a mudança na segunda.' },
          { who: 'Dev', text: 'Não tenho rollback pronto. Semana passada deu ruim assim.' },
          { who: 'Gestor', text: 'Vai rápido que o cliente está no meu pé.' },
        ],
      },
    },
    understand:
      'COMO O TEMA TECNOLÓGICO SE CONECTA AO SGSI? A tecnologia entrega proteção real quando é configurada, medida e mantida: baseline de configuração, vulnerabilidades tratadas por exposição, logs e alertas que alguém lê, mudanças registradas e dados de teste controlados. Ferramenta sem processo vira falsa sensação de segurança.\n\n' +
      'COMO PENSAR: para cada controle tecnológico, pergunte qual risco trata, qual dado o prova (log, relatório, ticket) e quem age quando falha. Agilidade e controle não se opõem: um caminho de exceção bem desenhado evita que o atalho vire a regra.',
    goodPractices: [
      'Defina baselines de configuração (A.8.9), meça o desvio e mantenha CMDB e exposição de rede sincronizados.',
      'Priorize vulnerabilidades por exposição real e exploração conhecida, com prazos e exceções registradas e revisadas.',
      'Aplique retenção e exclusão a bancos, backups, ambientes de teste e pastas pessoais, com evidência do que foi apagado.',
      'Use dados mascarados ou sintéticos em teste e separe desenvolvimento, teste e produção.',
      'Mantenha um caminho de mudança emergencial com registro, revisão rápida e plano de reversão.',
    ],
    safeguards: [
      { id: 'A.8.8', title: 'Gestão de vulnerabilidades técnicas' },
      { id: 'A.8.9', title: 'Gestão de configuração' },
      { id: 'A.8.10', title: 'Exclusão de informação' },
      { id: 'A.8.13', title: 'Backup da informação' },
      { id: 'A.8.15', title: 'Logging' },
      { id: 'A.8.16', title: 'Atividades de monitoramento' },
      { id: 'A.8.24', title: 'Uso de criptografia' },
      { id: 'A.8.32', title: 'Gestão de mudanças' },
    ],
  },
];
