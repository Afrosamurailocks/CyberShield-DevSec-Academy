/**
 * Conteúdo didático da trilha ISO/IEC 27001:2022, requisitos do SGSI (cláusulas 4 a 7).
 * Cenários 100% fictícios (domínios .test). Texto PARAFRASEADO; a norma é paga e tem copyright.
 * Numeração das cláusulas: conferir na norma oficial. RASCUNHO para revisão humana
 * (Segurança da Informação e de Compliance).
 */
import type { IsoModuleContent } from './isoTypes.js';
import { o } from './cisContentA.js';

export const ISO_CONTENT_A: IsoModuleContent[] = [
  // ───────────────────────── i01 · Cláusula 4 ─────────────────────────
  {
    id: 'i01',
    order: 1,
    code: 'CL4',
    title: 'Contexto da organização',
    summary: 'Entender o contexto, as partes interessadas e definir o escopo do SGSI com fronteiras justificadas.',
    minutes: 16,
    legalBasis: 'ISO/IEC 27001:2022, Cláusula 4: Contexto da organização',
    context:
      'O QUE A CLÁUSULA 4 PEDE? Antes de falar de controle, a organização precisa responder três perguntas: o que no nosso contexto interno e externo afeta a segurança da informação (4.1), quem tem requisitos sobre isso (4.2) e onde exatamente o SGSI se aplica (4.3). A 4.4 fecha o ciclo: estabelecer, manter e melhorar o sistema de gestão. A edição 2022 também pede que as partes interessadas tenham seus requisitos relevantes determinados, inclusive os que viram obrigação legal ou contratual (conferir na norma).\n\n' +
      'POR QUE O ESCOPO É O PONTO MAIS SENSÍVEL? Ele define o que o auditor vai olhar e o que o cliente vai assumir que está protegido. Escopo pequeno demais, ou recortado para evitar o ambiente difícil, vira certificado que não protege o que importa. As fronteiras e interfaces (o que fica fora, mas conversa com o que está dentro) precisam estar documentadas e justificadas.\n\n' +
      'NA PRÁTICA: 1) mantenha uma análise de contexto viva (mercado, regulação, tecnologia, cultura, dependência de terceiros), revisada em fatos como M&A, novo cliente grande ou nova nuvem; 2) liste partes interessadas com o requisito de cada uma e se ele é obrigatório ou voluntário; 3) escreva o escopo com unidades, localidades, ativos, processos e exclusões justificadas, e valide com quem responde pelo risco.',
    scenarios: [
      {
        id: 'i01-s1',
        situation:
          'A empresa-exemplo.test, consultoria de software, quer certificar o SGSI em seis meses. O rascunho de escopo cobre "o escritório e os serviços de suporte ao cliente". Fora ficam os ambientes de desenvolvimento e de CI/CD, "porque os times de produto são muito autônomos e atrasariam o projeto". O diretor comercial já usa a certificação como argumento de venda para clientes que exigem proteção do código-fonte. O auditor de pré-avaliação pergunta como o código do cliente é protegido.',
        question: 'Qual é o principal problema do escopo proposto?',
        options: [
          o('Incluir também as filiais menores no escopo, já que costumam ser o elo mais fraco, e inventariar os ativos de cada uma.', 'Filiais podem importar, mas o ponto aqui é outro: o escopo exclui justamente onde o ativo crítico (código do cliente) é produzido e armazenado.'),
          o('Rever o escopo: excluir dev e CI/CD contradiz o requisito do cliente e se apoia em conveniência, e não em risco.', 'Correto. A exclusão precisa ser justificada por risco e fronteira, e não por conforto. Além disso, o requisito do cliente (4.2) aponta para o dev/CI.', true),
          o('Manter o escopo menor na primeira certificação, por ser mais simples de auditar, e ampliá-lo na revisão do ano seguinte.', 'Ampliar depois é possível, mas escopo menor não pode contradizer o que se promete a clientes nem esconder ativos críticos.'),
          o('Aceitar o escopo, pois a autonomia dos times de produto os torna unidades separadas, e documentar isso como justificativa.', 'Autonomia gerencial não cria fronteira de segurança. Se o time opera ativos da mesma organização, a exclusão precisa de justificativa e controle das interfaces.'),
        ],
      },
      {
        id: 'i01-s2',
        situation:
          'Você é consultor de GRC na empresa-exemplo.test, que mantém um SGSI certificado. O cliente-exemplo.test enviou um aditivo contratual exigindo registro de acesso privilegiado por 12 meses e notificação de incidente em prazo fixo. O Comercial assinou sem passar pelo time de segurança. O registro de partes interessadas foi atualizado pela última vez antes desse contrato, e a retenção atual de logs é de 90 dias. A auditoria interna ocorre em duas semanas.',
        question: 'Qual é a leitura correta à luz da Cláusula 4?',
        options: [
          o('Tratar como questão contratual e pedir ao Jurídico que renegocie o aditivo para igualar à retenção de 90 dias hoje praticada.', 'Renegociar pode ser uma opção, mas o SGSI precisa ao menos refletir o requisito e decidir como atendê-lo. Ignorá-lo no sistema de gestão é a falha.'),
          o('Aumentar a retenção de logs privilegiados para 12 meses e manter a revisão do registro de partes interessadas no ciclo anual.', 'Resolve o sintoma técnico, mas deixa o processo quebrado: o requisito entrou por fora do SGSI e pode acontecer de novo.'),
          o('Registrar o requisito do cliente, avaliar o impacto nos riscos e controles e criar gatilho para o Comercial acionar a segurança antes de assinar.', 'Correto. O requisito de parte interessada precisa ser determinado e tratado, e o processo deve impedir que isso se repita.', true),
          o('Aguardar a auditoria interna, deixar que ela aponte a não conformidade e abrir a ação corretiva a partir do achado formal.', 'Esperar torna a falha parte do achado em vez de resolvê-la. O requisito já é conhecido e o prazo de atendimento corre.'),
        ],
      },
      {
        id: 'i01-s3',
        situation:
          'A empresa-exemplo.test, com SGSI certificado cobrindo "desenvolvimento e operação da plataforma de pagamentos", adquiriu a startup fornecedor-exemplo.test. A startup roda em outra nuvem, tem seus próprios acessos de administrador e já está sendo integrada à plataforma por API. A diretoria quer comunicar "tudo certificado" ao mercado. A análise de contexto (4.1) e o escopo (4.3) não foram revisados, e a próxima auditoria de manutenção é em quatro meses.',
        question: 'Qual é a primeira ação?',
        options: [
          o('Declarar a startup fora do escopo, documentar a integração por API como interface com controles de fronteira e reavaliar a inclusão depois.', 'Excluir pode até ser a decisão final, mas tomada antes de reavaliar contexto e riscos repete o erro de recortar por conveniência. A análise vem primeiro.'),
          o('Reavaliar contexto e escopo diante da aquisição, decidir o que entra com justificativa e segurar o comunicado "tudo certificado" até lá.', 'Correto. M&A muda contexto e fronteira; a decisão de escopo deve ser consciente, e a comunicação ao mercado não pode superar o escopo certificado.', true),
          o('Aguardar a auditoria de manutenção, em quatro meses, para revisar o escopo e a análise de contexto dentro do ciclo já planejado.', 'A necessidade de revisão surge com a mudança, e não com o calendário da auditoria. Quatro meses de integração sem análise é exposição.'),
          o('Estender o certificado à startup por declaração interna, já que agora pertence à mesma empresa, e publicar o comunicado hoje.', 'O escopo do certificado é o que foi avaliado. Estender por declaração cria uma afirmação que a evidência não sustenta.'),
        ],
      },
    ],
    visuals: {
      'i01-s1': {
        kind: 'sheet',
        title: 'escopo_sgsi_rascunho_v3.xlsx',
        columns: ['Área', 'No escopo?', 'Justificativa registrada', 'Guarda código de cliente?'],
        rows: [
          ['Escritório e rede corporativa', 'sim', 'infraestrutura de suporte', 'não'],
          ['Suporte ao cliente (service desk)', 'sim', 'processo de atendimento', 'não'],
          ['Ambientes de desenvolvimento', 'NÃO', '"autonomia dos times"', 'SIM'],
          ['CI/CD e repositórios', 'NÃO', '"atrasaria o projeto"', 'SIM'],
        ],
        note: 'Dados fictícios. Exemplo da empresa-exemplo.test.',
      },
      'i01-s2': {
        kind: 'sheet',
        title: 'partes_interessadas_v2.xlsx',
        columns: ['Parte interessada', 'Requisito', 'Origem', 'Última revisão'],
        rows: [
          ['Clientes em geral', 'confidencialidade do projeto', 'contrato padrão', 'há 9 meses'],
          ['Órgão regulador', 'proteção de dados pessoais', 'lei', 'há 9 meses'],
          ['cliente-exemplo.test', '(não registrado)', 'aditivo recente: logs 12 meses + notificação em prazo fixo', '(nunca)'],
        ],
        note: 'Dados fictícios. Retenção atual de logs privilegiados: 90 dias.',
      },
      'i01-s3': {
        kind: 'email',
        from: 'diretoria@empresa-exemplo.test',
        to: 'grc@empresa-exemplo.test',
        subject: 'Comunicado sobre a aquisição da startup',
        body: [
          'Time, fechamos a aquisição da fornecedor-exemplo.test.',
          'Quero publicar hoje que "toda a empresa mantém o selo de segurança" para não perder a janela de vendas.',
          'A integração por API entra em produção em 3 semanas. Qualquer impedimento?',
        ],
        flag: 'Escopo certificado: "desenvolvimento e operação da plataforma de pagamentos" (a startup não está nele).',
      },
    },
    understand:
      'O QUE LIGA OS TRÊS CASOS? Em todos, o escopo ou o contexto ficou desatualizado em relação ao negócio: uma exclusão por conveniência, um requisito de cliente que entrou por fora e uma aquisição que mudou a fronteira. A Cláusula 4 existe para impedir que o SGSI descreva uma empresa que já não existe.\n\n' +
      'COMO PENSAR: escopo é uma promessa verificável. Pergunte sempre "o que o cliente acha que está protegido?" e compare com o que está escrito. Onde houver diferença, ou o escopo muda ou a comunicação muda.',
    goodPractices: [
      'Justifique cada exclusão do escopo por risco e fronteira, e não por conveniência ou prazo.',
      'Mantenha o registro de partes interessadas com o requisito, a origem (lei, contrato, voluntário) e o responsável.',
      'Defina gatilhos de revisão de contexto e escopo: M&A, novo cliente relevante, nova nuvem, mudança regulatória.',
      'Documente as interfaces entre o que está dentro e o que está fora do escopo.',
      'Alinhe a comunicação comercial ao escopo realmente certificado.',
    ],
    safeguards: [
      { id: '4.1', title: 'Entender a organização e seu contexto' },
      { id: '4.2', title: 'Entender as necessidades das partes interessadas' },
      { id: '4.3', title: 'Determinar o escopo do SGSI' },
      { id: '4.4', title: 'Sistema de gestão da segurança da informação' },
    ],
  },

  // ───────────────────────── i02 · Cláusula 5 ─────────────────────────
  {
    id: 'i02',
    order: 2,
    code: 'CL5',
    title: 'Liderança',
    summary: 'Comprometimento da alta direção, política de segurança da informação e papéis com autoridade real.',
    minutes: 15,
    legalBasis: 'ISO/IEC 27001:2022, Cláusula 5: Liderança',
    context:
      'O QUE A CLÁUSULA 5 PEDE? Que a alta direção demonstre, com atos, que o SGSI é prioridade: integrar os requisitos aos processos de negócio, garantir recursos, comunicar a importância e apoiar quem executa (5.1). Que exista uma política de segurança da informação adequada ao propósito da organização, com objetivos ou uma estrutura para defini-los, compromisso de atender requisitos e de melhorar continuamente, documentada e comunicada (5.2). E que papéis, responsabilidades e autoridades estejam atribuídos e entendidos (5.3).\n\n' +
      'POR QUE ISSO NÃO É BUROCRACIA? Auditor e cliente não procuram só o documento, mas evidência de que a política orienta decisões. Política que ninguém leu e papel sem autoridade para decidir ou parar uma entrega são as falhas mais comuns da cláusula.\n\n' +
      'NA PRÁTICA: 1) peça evidência de liderança que não seja assinatura (pauta de comitê, orçamento, decisão tomada); 2) teste a política: pergunte a quem opera o que ela diz e onde achar; 3) verifique se cada papel tem nome, mandato e canal direto com a direção.',
    scenarios: [
      {
        id: 'i02-s1',
        situation:
          'Na empresa-exemplo.test, a política de segurança da informação foi aprovada e publicada na intranet há dois anos. Em uma pré-auditoria, o auditor entrevistou cinco desenvolvedores e dois analistas de suporte: ninguém soube dizer onde a política está nem citar um compromisso dela. A gerente de segurança argumenta que "a política está aprovada e assinada pela diretoria, então a cláusula está atendida". Há uma campanha de e-mail marcada para o próximo trimestre.',
        question: 'Qual é a avaliação mais adequada?',
        options: [
          o('Considerar a cláusula atendida, pois aprovação e publicação são os critérios, e tratar a comunicação como boa prática, e não como requisito.', 'A política precisa também ser comunicada e estar disponível às partes interessadas relevantes. Só publicar na intranet não demonstra isso.'),
          o('Tratar como lacuna de comunicação: levar a política aos canais do dia a dia e medir o entendimento, e não só enviar e-mail.', 'Correto. O requisito é comunicar e tornar disponível; a evidência de entendimento (quiz, pauta de time, onboarding) é o que fecha a lacuna.', true),
          o('Tratar como lacuna de conteúdo: reescrever a política em linguagem mais curta e deixar a divulgação para depois da nova versão.', 'Linguagem melhor pode ajudar, mas o achado concreto é de comunicação. Reescrever sem tratar a divulgação não resolve.'),
          o('Tratar como problema de competência e encaminhar o caso apenas à Cláusula 7, sem alterar a comunicação da política.', 'Há ligação com a Cláusula 7, mas a comunicação da política é um requisito da própria Cláusula 5.'),
        ],
      },
      {
        id: 'i02-s2',
        situation:
          'A empresa-exemplo.test tem um comitê de segurança que, segundo a ata, se reúne trimestralmente. As três últimas atas registram "presença do CTO" e "sem pendências", mas o líder de produto relata que um pedido de orçamento para MFA no pipeline está há seis meses sem resposta. O CTO diz que apoia o SGSI "100%". O CISO é subordinado ao gerente de TI e não tem acesso ao orçamento.',
        question: 'Que fato mais enfraquece a evidência de comprometimento da direção?',
        options: [
          o('A frequência trimestral do comitê, baixa demais para um tema tão sensível e que deveria ser mensal.', 'A frequência pode ser discutida, mas o frágil é a ausência de decisões e de recursos, e não o calendário em si.'),
          o('O CISO responder ao gerente de TI, arranjo que, por si só, já impediria a certificação do SGSI.', 'A estrutura reduz a independência, mas a norma não proíbe esse arranjo. O ponto é a ausência de recursos e decisão.'),
          o('O apoio verbal do CTO, que não deveria ser considerado evidência de comprometimento em nenhuma hipótese.', 'Declarações podem compor a evidência, mas sozinhas não bastam. A questão é que a prática as contradiz.'),
          o('Atas sem decisão e orçamento de MFA parado: apoio declarado, mas sem recurso.', 'Correto. O comprometimento aparece em recursos e decisões; a ata vazia e o orçamento parado mostram que o SGSI não está integrado às prioridades.', true),
        ],
      },
      {
        id: 'i02-s3',
        situation:
          'Na empresa-exemplo.test, o organograma do SGSI nomeia "Gestor de segurança" como responsável pelo tratamento de incidentes. Num incidente de sábado, o gestor estava de férias e o substituto formal não tinha permissão para isolar o ambiente de produção, que só o time de plataforma podia fazer. A decisão levou 5 horas. A RACI diz "Responsável: Segurança; Aprovador: Diretoria". O time de plataforma alega que nunca foi informado de que fazia parte do processo.',
        question: 'Qual é a causa-raiz sob a ótica da Cláusula 5.3?',
        options: [
          o('Papéis atribuídos só no papel: sem autoridade operacional nem comunicação a quem executa a ação crítica.', 'Correto. A 5.3 exige atribuição e comunicação; sem autoridade operacional e sem o time de plataforma ciente, o papel não funciona.', true),
          o('Falta de um segundo gestor de segurança, bastando nomear mais uma pessoa para cobrir as férias do titular.', 'Cobrir ausência ajuda, mas o gargalo era a autoridade para isolar, que continuaria com outro time.'),
          o('O time de plataforma deveria ter agido por iniciativa própria, já que conhece o ambiente melhor que ninguém.', 'Responsabilizar quem não foi designado nem informado transfere a culpa e não corrige o desenho do processo.'),
          o('A aprovação da diretoria atrasou a decisão, então a RACI deveria dispensar a aprovação em incidentes.', 'A aprovação pode ser revista, mas o relato não mostra a diretoria como causa do atraso. O atraso veio da falta de autoridade e comunicação.'),
        ],
      },
    ],
    visuals: {
      'i02-s1': {
        kind: 'chat',
        channel: '#preauditoria-sgsi (resumo das entrevistas)',
        messages: [
          { who: 'Auditor', text: 'Dev 1: onde fica a política de segurança?' },
          { who: 'Dev 1', text: 'Acho que na intranet. Nunca abri.' },
          { who: 'Auditor', text: 'Suporte 2: cite um compromisso da política.' },
          { who: 'Suporte 2', text: 'Não lembro. Fiz um treinamento no onboarding, só isso.' },
          { who: 'Gerente de segurança', text: 'Política aprovada pela diretoria em jan/2024. A campanha de e-mail sai no próximo trimestre.' },
        ],
      },
      'i02-s2': {
        kind: 'sheet',
        title: 'comite_seguranca_atas.xlsx',
        columns: ['Data', 'Participantes', 'Decisões registradas', 'Pedido pendente'],
        rows: [
          ['T1', 'CTO, gerente de TI, CISO', 'nenhuma ("sem pendências")', 'MFA no pipeline (aberto há 6 meses)'],
          ['T2', 'CTO, gerente de TI', 'nenhuma ("sem pendências")', 'MFA no pipeline'],
          ['T3', 'CTO, gerente de TI, CISO', 'nenhuma ("sem pendências")', 'MFA no pipeline'],
        ],
        note: 'Dados fictícios. O CISO responde ao gerente de TI e não tem orçamento próprio.',
      },
      'i02-s3': {
        kind: 'log',
        title: 'Linha do tempo do incidente (sábado)',
        lines: [
          '02:10  alerta de acesso suspeito em produção',
          '02:25  gestor de segurança (titular) em férias; acionado o substituto',
          '03:00  substituto: "não tenho permissão para isolar o ambiente"',
          '04:40  identificado que só o time de plataforma pode isolar; ninguém de plantão',
          '07:15  isolamento executado',
          'RACI: Responsável = Segurança; Aprovador = Diretoria; Plataforma = (não consta)',
        ],
        note: 'Exemplo fictício.',
      },
    },
    understand:
      'O QUE LIGA OS TRÊS CASOS? Em cada um, o artefato existia (política, comitê, organograma), mas não produzia efeito: ninguém conhecia a política, o comitê não decidia, o papel não tinha autoridade. A Cláusula 5 mede efeito, e não documento.\n\n' +
      'COMO PENSAR: para cada evidência, pergunte "o que mudou na prática por causa disso?". Se a resposta for "nada", a evidência é cosmética.',
    goodPractices: [
      'Registre decisões e recursos nas atas do comitê, e não só presença.',
      'Teste a política perguntando a quem opera o que ela diz e onde achar.',
      'Dê aos papéis do SGSI autoridade real (acesso, orçamento, canal direto com a direção).',
      'Inclua na RACI todos os times que executam ações críticas e comunique a eles.',
      'Designe substitutos com a mesma autoridade operacional do titular.',
    ],
    safeguards: [
      { id: '5.1', title: 'Liderança e comprometimento' },
      { id: '5.2', title: 'Política de segurança da informação' },
      { id: '5.3', title: 'Papéis, responsabilidades e autoridades organizacionais' },
    ],
  },

  // ───────────────────────── i03 · Cláusula 6 ─────────────────────────
  {
    id: 'i03',
    order: 3,
    code: 'CL6',
    title: 'Planejamento',
    summary: 'Avaliar e tratar riscos, manter a SoA coerente, obter aceite do dono do risco e planejar mudanças.',
    minutes: 18,
    legalBasis: 'ISO/IEC 27001:2022, Cláusula 6: Planejamento',
    context:
      'O QUE A CLÁUSULA 6 PEDE? É o coração do SGSI. A 6.1.2 exige um processo de avaliação de riscos definido: critérios de risco e de aceitação, identificação de riscos com seus donos, análise e priorização. A 6.1.3 exige tratar esses riscos: escolher opções de tratamento, determinar os controles necessários, compará-los com o Anexo A para não esquecer nada relevante, produzir a Declaração de Aplicabilidade (SoA) com justificativa de inclusões e exclusões, formular um plano de tratamento e obter aprovação dos donos dos riscos para o plano e para os riscos residuais. A 6.2 trata de objetivos mensuráveis de segurança e a 6.3 do planejamento de mudanças no SGSI (conferir a numeração na norma).\n\n' +
      'ONDE MAIS SE ERRA? A SoA não é uma lista de controles marcada por inércia: ela precisa ser coerente com o tratamento. Controle "implementado" na SoA sem evidência, risco sem dono e aceite feito por quem não tem autoridade sobre o ativo são os achados mais frequentes. O Anexo A tem 93 controles em 4 temas (organizacionais 37, pessoas 8, físicos 14, tecnológicos 34), mas a lista de controles necessários vem do tratamento do risco.\n\n' +
      'NA PRÁTICA: 1) defina critérios de risco e aceitação antes de avaliar; 2) amarre cada risco a um dono nominal; 3) mantenha a SoA, o plano de tratamento e o registro de riscos em consistência, e revise juntos; 4) trate mudanças relevantes no SGSI com avaliação prévia.',
    scenarios: [
      {
        id: 'i03-s1',
        situation:
          'A empresa-exemplo.test fez sua primeira avaliação de riscos. A planilha tem 48 riscos, cada um com probabilidade e impacto. A coluna "Dono do risco" está preenchida com "TI" ou "Segurança". Na reunião de tratamento, ninguém se compromete a aprovar o plano para o risco de "acesso privilegiado sem MFA em produção". A gerente de segurança diz: "vou aprovar como dona, para fechar logo".',
        question: 'Qual é o problema mais relevante na gestão desses riscos?',
        options: [
          o('Falta dono nominal com autoridade: a coluna aponta áreas, e ninguém aceita o plano e o risco residual.', 'Correto. O dono do risco deve ser uma pessoa ou função com responsabilidade e autoridade sobre o ativo ou processo, e é ele quem aprova o plano e o residual.', true),
          o('A planilha tem poucos riscos: 48 parece pouco para uma consultoria com tantos sistemas, e o inventário deveria ser ampliado.', 'Quantidade não é o critério. A completude depende de método e escopo, e a lacuna descrita é de propriedade.'),
          o('Probabilidade e impacto não bastam, pois a norma exige uma escala de cinco níveis em cada eixo da avaliação.', 'A norma não impõe escala. Exige critérios definidos e consistentes, que a empresa escolhe.'),
          o('Nenhum problema relevante: a gerente de segurança é quem mais entende de risco técnico e pode aprovar como dona.', 'Qualificação técnica não é autoridade sobre o negócio. Quem opera e responde pelo ativo precisa aceitar o risco.'),
        ],
      },
      {
        id: 'i03-s2',
        situation:
          'Auditoria interna na empresa-exemplo.test: a SoA marca A.8.15 (registro de logs) como "implementado". No plano de tratamento, o risco R-17 (acesso indevido a banco de produção) tem como ação "habilitar auditoria no banco", com status "em andamento, previsto 3 meses". A SoA também exclui o controle de segurança física de áreas seguras com a justificativa "trabalho remoto", mas existe um datacenter de laboratório no escritório com equipamentos de clientes. O gerente de compliance quer "só ajustar o texto da SoA".',
        question: 'O que a leitura cruzada dos dois documentos mostra?',
        options: [
          o('SoA e plano estão desalinhados: há controle "implementado" que não está e exclusão com justificativa falsa.', 'Correto. A SoA deve refletir o estado real e as justificativas devem ser verdadeiras; ajustar o texto sem corrigir o controle ou o plano é maquiagem.', true),
          o('O plano de tratamento está atrasado, e a correção é acelerar a ação do risco R-17 antes da auditoria.', 'Acelerar ajuda, mas o achado maior é de coerência: a SoA declara como pronto algo que o plano diz estar em andamento.'),
          o('A SoA está correta: "implementado" registra a intenção da direção para o controle, e não o estado atual dele.', 'Não há essa leitura. A SoA registra se o controle está implementado, e não uma intenção.'),
          o('Só a exclusão da segurança física precisa de ajuste; o resto é questão de atualizar prazos no plano.', 'A exclusão é um problema, mas o descompasso do A.8.15 entre SoA e plano também é, e é independente de prazo.'),
        ],
      },
      {
        id: 'i03-s3',
        situation:
          'Na empresa-exemplo.test, o risco R-31 (vazamento de dados de clientes por integração legada, nota alta) não pôde ser reduzido a tempo. O gerente de infraestrutura assinou o "aceite do risco residual" para fechar o ciclo antes da auditoria externa. O sistema legado pertence à unidade de negócios de Pagamentos, cuja diretoria nunca foi consultada; o contrato com o cliente-exemplo.test prevê reporte de riscos altos a ele. A política de risco diz que riscos "altos" só podem ser aceitos pela diretoria da unidade dona do ativo.',
        question: 'Qual é a melhor decisão?',
        options: [
          o('Manter o aceite do gerente de infraestrutura, que conhece bem a tecnologia, e esperar que a auditoria o considere equivalente.', 'Conhecer a tecnologia não substitui a autoridade definida pela política de risco. O aceite não é válido.'),
          o('Registrar o aceite como provisório e informar a diretoria de Pagamentos só depois da auditoria externa, com o plano.', 'Atrasar a comunicação preserva o desconforto e a falha de governança. O aceite precisa vir de quem tem autoridade, antes.'),
          o('Tratar o aceite como inválido e levar risco e plano à diretoria de Pagamentos para decisão formal, checando o reporte ao cliente.', 'Correto. O aceite deve ser dado por quem a política define, com plano e residual explícitos; e o requisito contratual deve ser tratado.', true),
          o('Rebaixar a nota do risco para médio e deixar a infraestrutura aceitar dentro da alçada, com nova justificativa técnica.', 'Alterar a nota para caber na alçada manipula o resultado. Se mudar a avaliação, deve ser por critérios e evidência.'),
        ],
      },
    ],
    visuals: {
      'i03-s1': {
        kind: 'sheet',
        title: 'registro_riscos_v1.xlsx (trecho)',
        columns: ['ID', 'Risco', 'Nível', 'Dono do risco', 'Plano aprovado por'],
        rows: [
          ['R-04', 'Falha de backup em banco de produção', 'Alto', 'TI', '(vazio)'],
          ['R-09', 'Credencial de serviço sem rotação', 'Alto', 'TI', '(vazio)'],
          ['R-12', 'Acesso privilegiado sem MFA em produção', 'Crítico', 'Segurança', '(vazio)'],
          ['R-21', 'Fornecedor de nuvem sem avaliação', 'Médio', 'TI', '(vazio)'],
        ],
        note: 'Dados fictícios. Nenhum dono nominal e nenhuma aprovação de plano.',
      },
      'i03-s2': {
        kind: 'sheet',
        title: 'soa_vs_plano_tratamento.xlsx',
        columns: ['Controle / risco', 'Status na SoA', 'Plano de tratamento', 'Justificativa de exclusão'],
        rows: [
          ['A.8.15 Registro (logging)', 'implementado', 'R-17: "habilitar auditoria no banco" (em andamento, 3 meses)', '(n/a)'],
          ['A.7.x Segurança física de áreas', 'excluído', '(n/a)', '"trabalho remoto"'],
          ['A.5.19 Fornecedores', 'implementado', 'sem ação pendente', '(n/a)'],
        ],
        note: 'Dados fictícios. Há um datacenter de laboratório com equipamentos de clientes no escritório.',
      },
      'i03-s3': {
        kind: 'form',
        title: 'Formulário de aceite de risco residual (R-31)',
        fields: [
          { label: 'Risco: vazamento de dados por integração legada (nível: alto)', required: true },
          { label: 'Dono do ativo: Diretoria de Pagamentos', required: true },
          { label: 'Aceito por: Gerente de infraestrutura (assinado)', required: true },
          { label: 'Plano de tratamento anexado: não', required: true },
          { label: 'Alçada para risco alto (política): Diretoria da unidade dona do ativo', required: true },
        ],
        note: 'Dados fictícios. O formulário contradiz a própria política de risco.',
      },
    },
    understand:
      'O QUE LIGA OS TRÊS CASOS? A cláusula 6 pede coerência entre registro de risco, plano de tratamento e SoA, e pede decisão de quem tem autoridade. Nos casos, os documentos existiam, mas não conversavam entre si, e o aceite foi dado por quem estava à mão.\n\n' +
      'COMO PENSAR: leia os três documentos lado a lado (riscos, plano, SoA). Cada controle "implementado" deve ter evidência, cada risco deve ter dono nominal e cada residual deve ter aceite de quem responde pelo ativo. Exceções de alçada são decisões de governança, e não detalhes de formulário.',
    goodPractices: [
      'Defina critérios de risco e de aceitação antes de avaliar, e documente quem aceita o quê.',
      'Atribua dono nominal a cada risco, com autoridade sobre o ativo ou processo.',
      'Mantenha a SoA, o plano de tratamento e o registro de riscos em revisão conjunta.',
      'Justifique cada exclusão de controle com base em risco e fatos verificáveis.',
      'Defina objetivos de segurança mensuráveis e avalie mudanças no SGSI antes de implementá-las.',
    ],
    safeguards: [
      { id: '6.1.2', title: 'Processo de avaliação de riscos de segurança da informação' },
      { id: '6.1.3', title: 'Tratamento de riscos, SoA e aceite do residual' },
      { id: '6.1.3(d)', title: 'Declaração de Aplicabilidade com justificativas' },
      { id: '6.1.3(f)', title: 'Aprovação do plano e dos riscos residuais pelos donos' },
      { id: '6.2', title: 'Objetivos de segurança da informação e planejamento' },
      { id: '6.3', title: 'Planejamento de mudanças no SGSI' },
    ],
  },

  // ───────────────────────── i04 · Cláusula 7 ─────────────────────────
  {
    id: 'i04',
    order: 4,
    code: 'CL7',
    title: 'Apoio',
    summary: 'Recursos, competência, conscientização, comunicação e informação documentada que sustentem o SGSI.',
    minutes: 15,
    legalBasis: 'ISO/IEC 27001:2022, Cláusula 7: Apoio',
    context:
      'O QUE A CLÁUSULA 7 PEDE? Que o SGSI tenha o que precisa para funcionar. A 7.1 trata de recursos (pessoas, orçamento, ferramentas). A 7.2 exige determinar a competência necessária, garantir que as pessoas a tenham (formação, treinamento, experiência) e guardar evidência. A 7.3 pede conscientização: quem trabalha sob o controle da organização deve conhecer a política, sua contribuição e as consequências de não conformidade. A 7.4 define o que, quando, a quem e como comunicar. A 7.5 trata da informação documentada: criar, atualizar e controlar (identificação, versão, acesso, retenção).\n\n' +
      'POR QUE "ASSINAR A LISTA" NÃO BASTA? Competência e conscientização são resultados. Lista de presença prova que alguém esteve na sala, e não que mudou o comportamento. O mesmo vale para documentos: um procedimento desatualizado ou com várias versões em circulação é pior do que nenhum, porque as pessoas o seguem.\n\n' +
      'NA PRÁTICA: 1) ligue treinamento à função e ao risco (quem mexe em produção precisa de mais do que a trilha geral); 2) meça eficácia (quiz, simulação, incidentes evitados) e guarde evidência; 3) controle documentos com dono, versão, data de revisão e local oficial de consulta.',
    scenarios: [
      {
        id: 'i04-s1',
        situation:
          'A empresa-exemplo.test fez um treinamento anual de segurança de 40 minutos para 120 pessoas. A lista de presença tem 118 assinaturas, e o RH reporta "98% de conclusão". No trimestre seguinte, o time de phishing simulado registrou que 31% clicaram em um link falso e 9% digitaram credenciais. O gerente de TI diz que "o requisito de conscientização foi cumprido com a lista assinada".',
        question: 'Como avaliar a evidência de 7.2 e 7.3?',
        options: [
          o('Insuficiente: presença não prova eficácia; é preciso medir e treinar de novo quem errou.', 'Correto. A norma pede competência e conscientização reais; o resultado do phishing simulado mostra que a ação não surtiu o efeito esperado.', true),
          o('Suficiente: a norma exige apenas que o treinamento seja oferecido e a presença registrada pelo RH em lista.', 'A norma pede garantir que as pessoas sejam competentes e conscientes. Oferecer e registrar presença é só parte.'),
          o('Insuficiente só pelo tempo: 40 minutos é pouco, e o treinamento deveria ter pelo menos 4 horas de duração.', 'A norma não fixa carga horária. O problema é a falta de eficácia, e não a duração.'),
          o('Suficiente: o phishing simulado é teste de TI e não entra como evidência de conscientização no SGSI.', 'O simulado é uma forma legítima de avaliar a eficácia. Ignorá-lo esconde o resultado.'),
        ],
      },
      {
        id: 'i04-s2',
        situation:
          'Durante um incidente na empresa-exemplo.test, o analista de plantão seguiu o procedimento de resposta encontrado no wiki: rotacionar a credencial no serviço A e notificar o contato do cliente. O contato do procedimento era de uma pessoa que saiu da empresa-exemplo.test há 8 meses. Existe uma versão 3 do procedimento, em um drive do time de segurança, que cita outro canal. O wiki mostra "v2, revisado há 14 meses", e o próprio documento exige revisão anual.',
        question: 'Qual é a lacuna principal do ponto de vista da Cláusula 7.5?',
        options: [
          o('Falta de treinamento do analista de plantão, que deveria saber que o contato do procedimento estava desatualizado.', 'Treinamento ajuda, mas o analista seguiu o local oficial de consulta. O problema está no controle do documento.'),
          o('O procedimento é longo demais e deveria ser reduzido a uma página, com os passos principais em destaque.', 'A concisão pode ajudar, mas não explica o contato desatualizado nem a existência de duas versões.'),
          o('Falha de controle documental: duas versões coexistem, a oficial vencida e sem dono de revisão.', 'Correto. A 7.5 exige controlar versão, acesso e atualização; a versão correta deve ser a que as pessoas encontram.', true),
          o('Contatos de clientes não deveriam constar em procedimento; bastaria mover todos para um CRM com acesso restrito.', 'Pode ser uma boa melhoria, mas não resolve a causa: o controle de versão e revisão do documento.'),
        ],
      },
      {
        id: 'i04-s3',
        situation:
          'A empresa-exemplo.test faz uma auditoria interna e o plano de comunicação (7.4) aparece como "inexistente": cada área comunica incidentes como achar melhor. Em um caso recente, um vazamento em ambiente de teste foi comunicado ao cliente-exemplo.test por e-mail informal de um desenvolvedor, antes de a segurança avaliar. O contrato exige notificação por canal definido e com conteúdo mínimo. O desenvolvedor afirma ter agido "por transparência". A direção pergunta o que corrigir primeiro.',
        question: 'Qual é a melhor correção inicial?',
        options: [
          o('Centralizar toda comunicação ao cliente na diretoria, que passa a aprovar cada mensagem antes do envio.', 'Restringir a um único nível cria gargalo e atraso, além de contrariar o requisito de comunicação oportuna.'),
          o('Definir o plano de comunicação (o quê, quando, quem, canal, aprovação), alinhá-lo ao contrato e treinar os envolvidos.', 'Correto. A 7.4 pede determinar o que, quando, com quem, quem e como comunicar; o contrato é um requisito de entrada.', true),
          o('Aplicar medida disciplinar ao desenvolvedor pelo envio informal, para sinalizar a gravidade do caso às demais áreas.', 'Pode ser cabível em outro processo, mas a causa é a ausência de um fluxo definido. A medida isolada não evita a repetição.'),
          o('Criar um modelo de e-mail padrão e distribuí-lo, deixando cada área decidir quando e se vai utilizá-lo.', 'O modelo ajuda, mas sem definir quem decide e quando, a comunicação continua inconsistente.'),
        ],
      },
    ],
    visuals: {
      'i04-s1': {
        kind: 'sheet',
        title: 'treinamento_vs_phishing_2024.xlsx',
        columns: ['Indicador', 'Valor', 'Fonte'],
        rows: [
          ['Pessoas elegíveis', '120', 'RH'],
          ['Assinaturas na lista de presença', '118 (98%)', 'RH'],
          ['Clicaram no link do simulado', '31%', 'Segurança'],
          ['Digitaram credenciais no simulado', '9%', 'Segurança'],
          ['Quiz pós-treinamento', '(não aplicado)', '(n/a)'],
        ],
        note: 'Dados fictícios.',
      },
      'i04-s2': {
        kind: 'log',
        title: 'Registro do incidente e do documento',
        lines: [
          '03:12  analista abre wiki > "Procedimento de resposta a incidentes"',
          '03:12  documento: v2, última revisão há 14 meses (política: revisão anual)',
          '03:20  passo 4: "notificar contato do cliente: [ex-colaborador]@empresa-exemplo.test"',
          '03:25  e-mail devolvido: caixa inexistente',
          '04:05  alguém cita drive de segurança: "v3, canal novo"  (fora do wiki)',
        ],
        note: 'Exemplo fictício.',
      },
      'i04-s3': {
        kind: 'email',
        from: 'dev.exemplo@empresa-exemplo.test',
        to: 'contato@cliente-exemplo.test',
        subject: 'Possível exposição em ambiente de teste',
        body: [
          'Olá, identificamos hoje que um ambiente de teste ficou acessível externamente por algumas horas.',
          'Pode ter incluído dados de amostra dos seus clientes. Estamos investigando.',
          'Peço desculpas pelo ocorrido.',
        ],
        flag: 'Enviado sem avaliação da segurança; o contrato prevê canal formal e conteúdo mínimo.',
      },
    },
    understand:
      'O QUE LIGA OS TRÊS CASOS? Apoio é o que dá sustentação à rotina: pessoas capazes, informação certa e comunicação definida. Nos casos, havia treinamento sem eficácia, documento oficial vencido e comunicação sem fluxo. Quando o apoio falha, os controles e as cláusulas anteriores deixam de funcionar na prática.\n\n' +
      'COMO PENSAR: para cada requisito de apoio, procure o resultado, e não a atividade. Treinamento vale pelo comportamento; documento vale pela versão que está em uso; comunicação vale pelo canal certo no tempo certo.',
    goodPractices: [
      'Meça a eficácia do treinamento (quiz, simulação, incidentes) e use o resultado para ajustar.',
      'Treine por função e risco: administradores e desenvolvedores precisam de trilhas específicas.',
      'Defina dono, versão e data de revisão para cada documento do SGSI, com um único local oficial.',
      'Mantenha um plano de comunicação alinhado a contratos e requisitos legais.',
      'Planeje recursos (pessoas, orçamento, ferramentas) com base nos riscos e objetivos.',
    ],
    safeguards: [
      { id: '7.1', title: 'Recursos para o SGSI' },
      { id: '7.2', title: 'Competência das pessoas' },
      { id: '7.3', title: 'Conscientização' },
      { id: '7.4', title: 'Comunicação' },
      { id: '7.5', title: 'Informação documentada e seu controle' },
    ],
  },
];
