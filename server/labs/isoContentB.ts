/**
 * Conteúdo didático da trilha ISO/IEC 27001:2022, cláusulas 8 a 10 (módulos i05 a i07).
 * Cenários 100% fictícios (domínios .test). Texto da norma PARAFRASEADO; numeração e títulos a conferir
 * na norma oficial. RASCUNHO para revisão humana (Segurança da Informação, Compliance e AI Guild).
 */
import type { IsoModuleContent } from './isoTypes.js';
import { o } from './cisContentA.js';

export const ISO_CONTENT_B: IsoModuleContent[] = [
  // ───────────────────────── i05: Cláusula 8 ─────────────────────────
  {
    id: 'i05',
    order: 5,
    code: 'CL8',
    title: 'Operação',
    summary: 'Como colocar o plano em prática: controlar processos (inclusive os terceirizados), reavaliar riscos quando algo muda e guardar evidências do tratamento.',
    minutes: 17,
    legalBasis: 'ISO/IEC 27001:2022, Cláusula 8: Operação',
    context:
      'O QUE A CLÁUSULA 8 PEDE? Que o que foi planejado nas cláusulas 4 a 7 realmente aconteça no dia a dia. A organização define critérios para os processos que sustentam o SGSI, opera conforme esses critérios, guarda informação suficiente para mostrar que foi feito como planejado e controla os processos, produtos e serviços fornecidos por terceiros que sejam relevantes para o SGSI (conferir redação do 8.1 na norma).\n\n' +
      'POR QUE O RISCO PRECISA SER REFEITO? A avaliação de riscos é uma fotografia. Quando a empresa migra para a nuvem, lança um produto ou troca um fornecedor crítico, a fotografia envelhece. O 8.2 pede avaliações em intervalos planejados e também quando houver mudanças significativas ou propostas de mudança (conferir na norma). O 8.3 exige executar o plano de tratamento e reter as evidências dos resultados.\n\n' +
      'NA PRÁTICA: 1) defina critérios e responsáveis para cada processo do SGSI; 2) inclua os terceirizados no mesmo controle (contrato, requisitos, monitoramento); 3) amarre a gestão de mudanças ao gatilho de reavaliação de riscos; 4) guarde, em local controlado e com prazo de retenção, a prova de que cada tratamento foi executado.',
    scenarios: [
      {
        id: 'i05-s1',
        situation:
          'A empresa-exemplo.test terceirizou o suporte de segundo nível para a fornecedor-exemplo.test há oito meses. Os analistas do fornecedor acessam o ambiente de produção para resolver chamados. Na revisão do SGSI, a coordenadora de segurança percebe que o processo consta no escopo, mas ninguém da empresa revisou o contrato desde a assinatura, não há relatório periódico de acessos e o requisito de confidencialidade existe apenas num anexo genérico. A área de TI argumenta que o fornecedor "tem uma certificação própria" e que isso basta.',
        question: 'Qual é a melhor leitura do requisito de operação aplicado a esse processo terceirizado?',
        options: [
          o('Manter o processo no SGSI: definir requisitos, monitorar o fornecedor e registrar a evidência.', 'Correto. Terceirizar a execução não terceiriza a responsabilidade; o controle precisa ser definido, aplicado e comprovável.', true),
          o('Aceitar a certificação do fornecedor como prova suficiente e retirar o processo de suporte N2 do escopo do SGSI.', 'A certificação do fornecedor pode ajudar como insumo, mas não substitui os requisitos e o monitoramento da própria organização. Retirar do escopo só esconde o risco.'),
          o('Reforçar o contrato com cláusulas mais rígidas de confidencialidade e dispensar o acompanhamento operacional.', 'Contrato melhor é parte da resposta, mas sem monitoramento ninguém sabe se as cláusulas são cumpridas.'),
          o('Pedir ao fornecedor uma declaração anual de que segue boas práticas de segurança e arquivá-la como evidência.', 'Declaração genérica uma vez por ano não é controle operacional nem evidência verificável.'),
        ],
      },
      {
        id: 'i05-s2',
        situation:
          'A cliente-exemplo.test é uma plataforma de pagamentos. A política do SGSI diz que a avaliação de riscos é refeita uma vez por ano, e a última foi feita em janeiro, dentro do prazo. Desde então, o time migrou o ambiente de produção para uma nova região de nuvem e lançou um módulo de integração com parceiros. O diretor de tecnologia afirma que "a avaliação está em dia" e quer apresentar isso à auditoria. Em paralelo, o time de engenharia pede mais uma semana para concluir a migração sem "travar o cronograma com burocracia".',
        question: 'Qual é a falha central que o registro de mudanças e a avaliação de riscos revelam?',
        options: [
          o('Falta de equipe: com mais analistas de segurança a avaliação anual, em janeiro, já seria suficiente.', 'O problema não é capacidade, é o gatilho. Mesmo com mais pessoas, a avaliação anual não enxerga mudanças que ocorrem entre uma revisão e outra.'),
          o('A migração deveria ter esperado a próxima avaliação anual, para só então ser liberada pela segurança.', 'Bloquear mudanças não é o objetivo. O ponto é reavaliar os riscos quando a mudança ocorre, de forma proporcional.'),
          o('Falha apenas documental: o prazo anual está certo e basta incluir a migração na ata do próximo ciclo.', 'Registrar depois não reavalia nada. Duas mudanças relevantes ficaram sem análise de risco por meses.'),
          o('Falta um gatilho: mudança significativa deve forçar nova avaliação de riscos.', 'Correto. O calendário cobre o planejado; mudanças significativas exigem reavaliação própria, com critério de o que é "significativo".', true),
        ],
      },
      {
        id: 'i05-s3',
        situation:
          'Durante a preparação para a auditoria, a analista pede a evidência de que o risco R-14 (acesso administrativo sem MFA) foi tratado, conforme o plano aprovado. O responsável pelo tratamento garante que o MFA foi ativado em todas as contas privilegiadas no trimestre passado, mas os chamados que comprovariam a execução ficaram numa ferramenta de tickets que foi desativada na troca de plataforma e não foram exportados. A auditoria interna é em cinco dias. Um colega sugere gerar um relatório novo com a data do trimestre passado para "fechar a lacuna".',
        question: 'Qual é a melhor conduta?',
        options: [
          o('Reconstruir a prova com a configuração e os logs do IdP, rotulando como reconstrução com data real, e registrar a lacuna.', 'Correto. Evidência reconstruída honestamente é aceitável; a causa (perda de registros na troca de ferramenta) deve virar ação.', true),
          o('Gerar o relatório com a data do trimestre passado, pois o MFA foi ativado e o conteúdo é verdadeiro.', 'Datar um documento como se fosse do passado é fraude documental, ainda que o fato seja verdadeiro, e compromete a credibilidade de todo o SGSI.'),
          o('Reabrir o R-14 como não tratado e refazer o rollout de MFA nas contas privilegiadas para gerar novas evidências.', 'Refazer o trabalho desperdiça esforço: o controle existe e é verificável por outras fontes. O que faltou foi guardar a prova.'),
          o('Avisar o auditor de que a evidência não existe e deixar que ele decida se aceita o tratamento do risco.', 'Declarar a lacuna é correto, mas sem tentar reconstruir a prova por fontes disponíveis a organização transfere ao auditor um trabalho que era dela.'),
        ],
      },
    ],
    visuals: {
      'i05-s1': {
        kind: 'sheet',
        title: 'processos_sgsi_controle.csv (trecho)',
        columns: ['Processo', 'Executor', 'Requisitos definidos', 'Monitoramento', 'Último registro'],
        rows: [
          ['Gestão de acessos', 'Interno (TI)', 'sim', 'mensal', 'há 3 semanas'],
          ['Suporte N2 em produção', 'fornecedor-exemplo.test', 'só anexo genérico', 'nenhum', '(vazio)'],
          ['Backup e restauração', 'Interno (Infra)', 'sim', 'semanal', 'há 5 dias'],
        ],
        note: 'Dados fictícios.',
      },
      'i05-s2': {
        kind: 'sheet',
        title: 'mudancas_vs_avaliacao_riscos.csv',
        columns: ['Data', 'Evento', 'Risco reavaliado?', 'Responsável'],
        rows: [
          ['Janeiro', 'Avaliação anual de riscos', 'sim (ciclo anual)', 'Segurança'],
          ['Março', 'Migração de produção para nova região de nuvem', 'NÃO', 'Engenharia'],
          ['Junho', 'Lançamento do módulo de integração com parceiros', 'NÃO', 'Produto'],
          ['Hoje', 'Próxima avaliação anual prevista', 'em 2 meses', 'Segurança'],
        ],
        note: 'Dados fictícios. A avaliação de janeiro foi feita no prazo.',
      },
      'i05-s3': {
        kind: 'chat',
        channel: '#preparacao-auditoria',
        messages: [
          { who: 'Analista de conformidade', text: 'Preciso da evidência do tratamento do R-14 (MFA nas contas administrativas) até sexta.' },
          { who: 'Responsável pelo tratamento', text: 'Ativamos em todas as contas privilegiadas no trimestre passado. Os chamados estavam na ferramenta antiga, que foi desligada. Não exportamos.' },
          { who: 'Colega de TI', text: 'Gera um relatório novo com a data de lá e pronto. O MFA está ativo mesmo.' },
          { who: 'Analista de conformidade', text: 'A configuração atual do provedor de identidade ainda mostra o histórico de ativação por conta.' },
        ],
      },
    },
    understand:
      'O QUE LIGA OS TRÊS CASOS? Em todos, o plano existia, mas a operação deixou lacunas: um fornecedor sem controle real, uma avaliação de riscos que não acompanhou as mudanças e um tratamento executado sem prova guardada. O 8.1 pede controle dos processos, inclusive terceirizados; o 8.2, reavaliação periódica e em mudanças significativas; o 8.3, executar o tratamento e reter o resultado (conferir redação na norma).\n\n' +
      'COMO PENSAR: a auditoria não pergunta "o que você planejou?", e sim "como sei que foi feito e que continua valendo?". Calendário fixo sem gatilho de mudança e execução sem registro são os dois pontos cegos mais comuns.',
    goodPractices: [
      'Liste os processos terceirizados do escopo e defina, para cada um, requisitos, responsável interno e forma de monitoramento.',
      'Amarre a gestão de mudanças ao SGSI: toda mudança significativa abre uma revisão proporcional do risco.',
      'Defina o que é "mudança significativa" com critérios objetivos (nova nuvem, novo fornecedor crítico, novo tipo de dado).',
      'Guarde a evidência do tratamento (quem, o quê, quando) em repositório controlado, com prazo de retenção e sem depender de uma única ferramenta.',
      'Nunca date documentos retroativamente: se a prova se perdeu, reconstrua com fontes reais e registre a lacuna.',
    ],
    safeguards: [
      { id: '8.1', title: 'Planejamento e controle operacional' },
      { id: '8.1 (terceiros)', title: 'Controle de processos fornecidos por terceiros' },
      { id: '8.2', title: 'Avaliação de riscos em intervalos e em mudanças' },
      { id: '8.3', title: 'Execução do plano de tratamento de riscos' },
      { id: '8.3 (evidências)', title: 'Retenção de informação documentada dos resultados' },
    ],
  },

  // ───────────────────────── i06: Cláusula 9 ─────────────────────────
  {
    id: 'i06',
    order: 6,
    code: 'CL9',
    title: 'Avaliação de desempenho',
    summary: 'Medir se o SGSI funciona: indicadores que informam, auditoria interna independente e análise crítica da direção que termina em decisões.',
    minutes: 18,
    legalBasis: 'ISO/IEC 27001:2022, Cláusula 9: Avaliação de desempenho',
    context:
      'O QUE A CLÁUSULA 9 PEDE? Que a organização verifique, com dados e com olhar independente, se o SGSI está funcionando. Isso tem três partes: monitorar e medir (9.1), auditar internamente (9.2) e a direção analisar criticamente o conjunto (9.3).\n\n' +
      'COMO FUNCIONA CADA PARTE? No 9.1 você define o que medir, como medir, quando medir, quem mede e quem analisa os resultados (conferir na norma). No 9.2 você mantém um programa de auditoria, com critérios e escopo, escolhe auditores que garantam objetividade e imparcialidade, e relata os resultados à gestão responsável. No 9.3 a direção analisa entradas como o estado das ações anteriores, mudanças, desempenho, feedback das partes interessadas, resultados de riscos e oportunidades de melhoria, e produz saídas: decisões sobre melhoria e necessidade de mudanças.\n\n' +
      'NA PRÁTICA: 1) prefira poucos indicadores que possam piorar e que gerem ação; 2) separe quem executa de quem audita; 3) trate a análise crítica como reunião de decisão, com ata que registre responsáveis e datas, e não como apresentação de slides.',
    scenarios: [
      {
        id: 'i06-s1',
        situation:
          'O painel de indicadores do SGSI da empresa-exemplo.test está sempre verde há dois anos. A direção gosta e usa o painel para mostrar maturidade a clientes. Ao revisar a definição dos indicadores, o gerente de segurança nota que "treinamento de conscientização" mede o percentual de colaboradores que abriram o e-mail do curso, e "antivírus ativo" mede o número de dispositivos com agente instalado, sem checar se ele está atualizado ou reportando. Nos últimos 12 meses houve três incidentes de phishing com credenciais comprometidas.',
        question: 'Qual é o problema mais importante nesses indicadores?',
        options: [
          o('Aumentar a frequência de medição, passando a medir semanalmente, o que faria os indicadores mostrarem os problemas.', 'Medir com mais frequência algo que mede a coisa errada só produz mais verde. O defeito está no que é medido.'),
          o('Medem atividade, e não resultado: não pioram quando o risco sobe, então não servem para decidir.', 'Correto. Um bom indicador reflete eficácia (ex.: taxa de cliques em simulação, agentes atualizados e reportando) e pode ficar vermelho.', true),
          o('Acrescentar uma dezena de métricas ao painel, para que todos os controles tenham ao menos um indicador de cobertura.', 'Mais métricas do mesmo tipo aumentam a vaidade, não a informação. Poucos indicadores bem definidos são melhores.'),
          o('Manter o painel para os clientes e criar uma versão detalhada, só para uso interno, com os dados reais.', 'Dois painéis sem corrigir a definição só institucionalizam a discrepância entre a imagem e a realidade.'),
        ],
      },
      {
        id: 'i06-s2',
        situation:
          'A cliente-exemplo.test é uma empresa de médio porte com uma equipe de segurança de quatro pessoas. O programa de auditoria interna deste ciclo foi montado pelo próprio gerente do SGSI. Ele designou a si mesmo para auditar o processo de gestão de acessos, que ele desenhou e opera, alegando que "é quem mais entende". Para o processo de backup, indicou um analista que responde diretamente a ele. O orçamento é limitado e a auditoria externa de certificação é em três meses. Há um auditor interno treinado na área de qualidade, sem relação hierárquica com a segurança.',
        question: 'Qual é a melhor decisão sobre o programa de auditoria?',
        options: [
          o('Manter o programa, pois quem conhece o processo acha mais falhas, e registrar a declaração técnica do gerente.', 'Conhecimento técnico não substitui independência: quem audita o próprio trabalho tende a não ver as falhas que ele mesmo criou.'),
          o('Trocar só o auditor do backup por outro analista da equipe de segurança e manter o gerente na gestão de acessos.', 'Corrige metade do problema. A gestão de acessos continua autoauditada e o conflito principal permanece.'),
          o('Adiar a auditoria interna para o próximo ciclo e reforçar as evidências de controle até a auditoria externa.', 'Auditoria interna é requisito e deve ocorrer em intervalos planejados. Adiar substitui verificação independente por autoavaliação.'),
          o('Reatribuir as auditorias a pessoas sem envolvimento, como o auditor da qualidade, e registrar a justificativa.', 'Correto. Objetividade e imparcialidade exigem separar auditor de auditado; apoio técnico é permitido, desde que não decida sobre os achados.', true),
        ],
      },
      {
        id: 'i06-s3',
        situation:
          'A análise crítica pela direção do SGSI da empresa-exemplo.test ocorre trimestralmente. A equipe de segurança apresenta 40 slides com indicadores, resultados de auditoria e situação das ações. A diretoria assiste, comenta que "está tudo sob controle" e a reunião termina em 50 minutos. A ata registra apenas "apresentação realizada e tomado conhecimento". No mês seguinte, a equipe informa que a solicitação de orçamento para um sistema de monitoramento, citada na apresentação, segue sem resposta e que duas ações de melhoria seguem sem responsável.',
        question: 'O que mais falta para que essa análise crítica cumpra o seu propósito?',
        options: [
          o('Reduzir a apresentação para 10 slides, para a direção se concentrar no que é essencial em cada trimestre.', 'Menos slides podem ajudar, mas se continuar sem decisão a reunião seguirá sendo informativa, não crítica.'),
          o('Registrar saídas na ata: decisões sobre melhoria, mudanças e recursos, com responsável e data.', 'Correto. A análise crítica deve gerar decisões e ações rastreáveis, como orçamento aprovado ou negado e dono para cada ação.', true),
          o('Aumentar a frequência para mensal, para que a direção acompanhe de perto as ações e o orçamento.', 'Mais reuniões sem decisões produzem mais atas vazias. O ponto é o resultado da reunião, não a cadência.'),
          o('Enviar os indicadores por e-mail antes da reunião e usá-la só para tirar dúvidas dos diretores.', 'Ajuda a preparação, mas não garante que a direção decida. A ata continuaria sem saídas.'),
        ],
      },
    ],
    visuals: {
      'i06-s1': {
        kind: 'sheet',
        title: 'painel_indicadores_sgsi.csv',
        columns: ['Indicador', 'Como é medido', 'Meta', 'Resultado (24 meses)', 'Status'],
        rows: [
          ['Conscientização', '% que abriu o e-mail do curso', '90%', '96% a 99%', 'Verde'],
          ['Antivírus ativo', 'Nº de dispositivos com agente instalado', '100%', '100%', 'Verde'],
          ['Incidentes de phishing com credencial', 'Contagem trimestral', '0', '1 por trimestre (média)', 'Não está no painel'],
        ],
        note: 'Dados fictícios. O terceiro indicador existe no registro de incidentes, mas não no painel.',
      },
      'i06-s2': {
        kind: 'sheet',
        title: 'programa_auditoria_interna.csv',
        columns: ['Processo auditado', 'Dono do processo', 'Auditor designado', 'Relação auditor x dono'],
        rows: [
          ['Gestão de acessos', 'Gerente do SGSI', 'Gerente do SGSI', 'Mesma pessoa'],
          ['Backup e restauração', 'Analista de infra', 'Analista de segurança', 'Subordinado do gerente do SGSI'],
          ['Desenvolvimento seguro', 'Líder de engenharia', 'Auditor da qualidade', 'Sem relação hierárquica'],
        ],
        note: 'Dados fictícios.',
      },
      'i06-s3': {
        kind: 'log',
        title: 'Ata da análise crítica pela direção (trecho)',
        lines: [
          'Participantes: diretoria executiva, gerente do SGSI',
          'Pauta: indicadores, resultados de auditoria, situação das ações, riscos',
          'Registro: "Apresentação realizada. Direção tomou conhecimento."',
          'Decisões: (nenhuma registrada)',
          'Responsáveis e prazos: (não informados)',
          'Pendência citada na apresentação: orçamento do sistema de monitoramento, sem deliberação',
        ],
        note: 'Exemplo fictício.',
      },
    },
    understand:
      'O QUE UNE OS TRÊS CASOS? Todos tinham a forma da cláusula 9, com painel, programa de auditoria e reunião da direção, mas faltava o conteúdo: indicadores que não podem piorar, auditor que se audita e análise crítica sem saída. O 9.1 pede métricas que avaliem desempenho e eficácia; o 9.2 pede objetividade e imparcialidade; o 9.3 pede entradas definidas e saídas com decisões (conferir redação na norma).\n\n' +
      'COMO PENSAR: pergunte sempre "o que isto me diz que eu não sabia?" para o indicador, "quem verifica o verificador?" para a auditoria e "o que mudou depois da reunião?" para a análise crítica.',
    goodPractices: [
      'Para cada indicador, defina objetivo, método, frequência, responsável e o que será feito se o resultado piorar.',
      'Prefira indicadores de resultado (eficácia) a indicadores de atividade; revise os que nunca saem do verde.',
      'Construa o programa de auditoria interna com critérios, escopo e frequência, e separe auditor de auditado.',
      'Quando faltar auditor independente, use pessoas de outra área ou apoio externo, com apoio técnico pontual e sem decisão sobre os achados.',
      'Estruture a análise crítica com entradas definidas e uma ata com decisões, responsáveis e datas.',
    ],
    safeguards: [
      { id: '9.1', title: 'Monitoramento, medição, análise e avaliação' },
      { id: '9.2.1', title: 'Auditorias internas em intervalos planejados' },
      { id: '9.2.2', title: 'Programa, objetividade, imparcialidade e relato' },
      { id: '9.3.2', title: 'Entradas da análise crítica pela direção' },
      { id: '9.3.3', title: 'Saídas: decisões de melhoria e mudanças no SGSI' },
    ],
  },

  // ───────────────────────── i07: Cláusula 10 ─────────────────────────
  {
    id: 'i07',
    order: 7,
    code: 'CL10',
    title: 'Melhoria',
    summary: 'Como reagir a falhas e evoluir o SGSI: tratar a causa (não só o sintoma), verificar a eficácia e registrar o que foi feito.',
    minutes: 16,
    legalBasis: 'ISO/IEC 27001:2022, Cláusula 10: Melhoria',
    context:
      'O QUE A CLÁUSULA 10 PEDE? Que o SGSI evolua. Na edição 2022, o 10.1 trata da melhoria contínua (a organização melhora continuamente a adequação, a pertinência e a eficácia do SGSI) e o 10.2 trata de não conformidade e ação corretiva. Atenção: a ordem desses dois itens foi invertida em relação à edição de 2013 (conferir na norma).\n\n' +
      'COMO TRATAR UMA NÃO CONFORMIDADE? O 10.2 descreve um ciclo: reagir à não conformidade (controlar, corrigir, lidar com as consequências); avaliar a necessidade de eliminar as causas, para que não se repita nem ocorra em outro lugar; implementar a ação necessária; analisar criticamente a eficácia da ação; e, se necessário, mudar o SGSI. Tudo isso deve ficar registrado como informação documentada (conferir na norma).\n\n' +
      'NA PRÁTICA: 1) separe correção (resolver o que aconteceu) de ação corretiva (eliminar a causa); 2) pergunte "por que" até chegar a algo que o processo possa mudar; 3) defina como e quando você vai verificar que a ação funcionou; 4) registre achado, causa, ação, responsável, prazo e verificação, e use o histórico para detectar recorrência.',
    scenarios: [
      {
        id: 'i07-s1',
        situation:
          'Na auditoria interna, a equipe da empresa-exemplo.test descobre que a conta de um ex-funcionário do financeiro seguia ativa 40 dias após o desligamento. A TI desativou a conta no mesmo dia e o registro da não conformidade foi fechado com a ação "conta desativada". A gerente de segurança estranha: no semestre anterior houve um caso idêntico com outro ex-funcionário. O RH confirma que avisa a TI "quando lembra", por e-mail, sem rotina formal.',
        question: 'O que falta nesse tratamento da não conformidade?',
        options: [
          o('Aplicar penalidade ao analista de TI que deixou de desativar a conta no momento do desligamento.', 'Punir a pessoa não elimina a causa: o processo depende de alguém lembrar. O problema volta com outro analista.'),
          o('Dar o caso por encerrado: a conta foi desativada no mesmo dia e a não conformidade foi corrigida.', 'Foi apenas correção. Sem tratar a causa, o próximo desligamento repete o problema, como já ocorreu uma vez.'),
          o('Investigar a causa (o desligamento não dispara a TI), mudar o processo e encerrar só após verificar o resultado.', 'Correto. Correção resolve o caso; ação corretiva elimina a causa. O histórico de recorrência confirma que o processo é a raiz.', true),
          o('Pedir ao RH que envie os e-mails de desligamento mais cedo, sem alterar o processo nem criar rotina formal.', 'Um lembrete sem mecanismo continua dependendo de memória. Falta gatilho e responsável formal.'),
        ],
      },
      {
        id: 'i07-s2',
        situation:
          'O registro de não conformidades da cliente-exemplo.test mostra o mesmo achado, "servidores sem correção de segurança além do prazo definido", em três auditorias consecutivas. Nas duas primeiras, a ação foi "aplicar patches pendentes" e "treinar a equipe de infraestrutura". As duas foram encerradas como concluídas. A terceira ocorrência acaba de ser aberta e o responsável propõe, de novo, aplicar os patches e fazer um comunicado. A equipe de infraestrutura tem oito pessoas e um único janela de manutenção por mês, aprovada pelo negócio.',
        question: 'Qual é a decisão mais adequada para essa terceira ocorrência?',
        options: [
          o('Tratar como recorrência: reabrir a análise de causa (a janela mensal), propor mudança e levar à análise crítica.', 'Correto. A repetição mostra que as ações anteriores trataram o sintoma. A causa provável é estrutural e exige decisão de quem pode mudar a janela.', true),
          o('Repetir a ação das ocorrências anteriores, aplicando os patches com prazo mais curto e cobrança direta do responsável.', 'A mesma ação com mais pressão tende ao mesmo resultado. A causa (janela única mensal) continua intacta.'),
          o('Encerrar como aceitação de risco, pois o problema é antigo e a equipe de infraestrutura faz o que pode.', 'Aceitar risco precisa ser decisão formal da gestão, com critério. Encerrar a não conformidade por cansaço oculta o problema.'),
          o('Aplicar um treinamento mais longo e obrigatório à equipe de infraestrutura sobre gestão de patches.', 'O treinamento já foi tentado e não alterou o resultado. Não há evidência de que o conhecimento seja a causa.'),
        ],
      },
      {
        id: 'i07-s3',
        situation:
          'Um organismo de certificação-exemplo apontou, na auditoria externa da empresa-exemplo.test, que a revisão periódica de acessos privilegiados não vinha sendo feita. A equipe corrigiu em cinco dias: executou uma revisão, removeu quatro acessos indevidos e registrou a ação como "concluída, revisão realizada em reunião de conscientização". O encerramento do achado está agendado para amanhã e o gerente pergunta se pode fechar. Não há critério definido para dizer se a ação funcionou, e a próxima revisão só está prevista para daqui a seis meses.',
        question: 'O que impede encerrar o achado com segurança?',
        options: [
          o('Falta critério de eficácia e verificação, depois de um ciclo, de que a revisão ocorre sem cobrança.', 'Correto. Concluir uma ação não prova que ela funciona. A verificação de eficácia exige critério e evidência posterior.', true),
          o('Nada: o organismo de certificação aceitará o fechamento, porque a correção foi feita em apenas cinco dias.', 'Rapidez não é eficácia. O próprio ciclo de 10.2 inclui analisar criticamente o resultado da ação.'),
          o('Esperar a próxima auditoria externa: se o achado não reaparecer, a ação terá sido considerada eficaz.', 'Esperar a auditoria transfere a verificação para terceiros e atrasa a detecção de falha, que será descoberta só mais um ano depois.'),
          o('Repetir a reunião de conscientização para reforçar a mensagem aos gestores antes de fechar o achado.', 'Mais uma reunião repete a ação anterior, não verifica o resultado e continua sem critério para medir eficácia.'),
        ],
      },
    ],
    visuals: {
      'i07-s1': {
        kind: 'sheet',
        title: 'registro_nao_conformidades.csv (trecho)',
        columns: ['ID', 'Achado', 'Ação registrada', 'Causa investigada?', 'Status'],
        rows: [
          ['NC-018', 'Conta de ex-funcionário ativa há 40 dias', 'Conta desativada', 'não', 'Fechada'],
          ['NC-009 (semestre anterior)', 'Conta de ex-funcionário ativa há 22 dias', 'Conta desativada', 'não', 'Fechada'],
        ],
        note: 'Dados fictícios. Nota do RH: avisa a TI "quando lembra", por e-mail.',
      },
      'i07-s2': {
        kind: 'sheet',
        title: 'historico_nc_patches.csv',
        columns: ['Ciclo', 'Achado', 'Ação', 'Status', 'Causa registrada'],
        rows: [
          ['Auditoria 1', 'Servidores sem correção além do prazo', 'Aplicar patches pendentes', 'Concluída', '(vazio)'],
          ['Auditoria 2', 'Servidores sem correção além do prazo', 'Treinar equipe de infraestrutura', 'Concluída', '(vazio)'],
          ['Auditoria 3', 'Servidores sem correção além do prazo', 'Proposta: aplicar patches e emitir comunicado', 'Aberta', '(vazio)'],
        ],
        note: 'Dados fictícios. Janela de manutenção aprovada: uma por mês.',
      },
      'i07-s3': {
        kind: 'email',
        from: 'gerente.sgsi@empresa-exemplo.test',
        to: 'qualidade@empresa-exemplo.test',
        subject: 'Fechamento do achado externo AC-02 (revisão de acessos privilegiados)',
        body: [
          'Boa tarde,',
          'A correção do AC-02 foi feita em 5 dias: revisão executada, 4 acessos removidos e reunião de conscientização realizada.',
          'Posso fechar o achado amanhã?',
          'Observação: não definimos como medir se a ação deu resultado, e a próxima revisão prevista é só em 6 meses.',
        ],
        flag: 'Exemplo fictício.',
      },
    },
    understand:
      'O QUE UNE OS TRÊS CASOS? Em todos, a organização reagiu, mas parou antes do fim do ciclo do 10.2: tratou o sintoma, repetiu uma ação que não funcionava ou encerrou sem verificar a eficácia. A norma pede reagir, avaliar a necessidade de eliminar causas, implementar a ação, analisar a eficácia e registrar (conferir na norma).\n\n' +
      'COMO PENSAR: um achado só está fechado quando você consegue responder "como sei que não vai voltar?". A recorrência é o melhor sinal de que a causa não foi tratada, e é entrada natural para a análise crítica da direção e para a melhoria contínua do 10.1.',
    goodPractices: [
      'Separe, no registro, correção imediata, causa raiz e ação corretiva; não aceite "conta desativada" como ação corretiva.',
      'Use um método simples de causa raiz (por exemplo, cinco porquês) e pergunte se o problema pode ocorrer em outros processos.',
      'Defina, na abertura da ação, o critério de eficácia e a data da verificação; só encerre depois dela.',
      'Analise o histórico para detectar recorrência e escale ao responsável com poder de mudar o processo ou os recursos.',
      'Registre achado, causa, ação, responsável, prazo e verificação, e use esse registro como entrada da análise crítica.',
    ],
    safeguards: [
      { id: '10.1', title: 'Melhoria contínua do SGSI' },
      { id: '10.2 (reagir)', title: 'Reagir à não conformidade e corrigir' },
      { id: '10.2 (causa)', title: 'Avaliar e eliminar as causas' },
      { id: '10.2 (eficácia)', title: 'Analisar a eficácia da ação corretiva' },
      { id: '10.2 (registro)', title: 'Reter informação documentada do tratamento' },
    ],
  },
];
