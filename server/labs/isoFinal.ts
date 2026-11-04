/**
 * Módulo i12 (AF): Avaliação final da trilha ISO/IEC 27001:2022, 15 cenários de auditoria e operação do SGSI.
 *
 * RASCUNHO para revisão humana (Segurança da Informação, Compliance e AI Guild) antes de uso externo.
 * - 100% fictício: empresas .test, IPs de faixas reservadas, nenhum dado pessoal ou credencial real.
 * - Texto da norma é parafraseado. Numeração de cláusulas e controles é seleção editorial a conferir na fonte oficial.
 * - Regras de organismos certificadores não são afirmadas: onde aparecem, vêm como "prática comum de auditoria (a conferir com o organismo certificador)".
 * - Não afirma que a Opah IT seja certificada nem emite prazo, SLA ou obrigação em nome da Opah.
 * - O gabarito (campo `correct`) permanece só no servidor.
 */
import type { ScenarioVisual } from './privacyExtras.js';
import type { IsoModuleContent } from './isoTypes.js';
import { o } from './cisContentA.js';

export const ISO_FINAL: IsoModuleContent = {
  id: 'i12',
  order: 12,
  code: 'AF',
  title: 'Avaliação final: auditoria do SGSI',
  summary:
    '15 cenários de auditoria e operação que cruzam cláusulas 4 a 10 e controles do Anexo A: não conformidades, SoA, escopo, fornecedores, incidentes, direção, mudanças, nuvem, continuidade e pressão por certificação.',
  minutes: 45,
  legalBasis: 'ISO/IEC 27001:2022 (cláusulas 4 a 10 e Anexo A, visão integrada)',
  context:
    'O QUE É ESTA AVALIAÇÃO? Quinze situações fictícias de auditoria interna, auditoria externa e operação do SGSI. Em todas, mais de uma resposta parece razoável: vale a que trata a causa, produz evidência verificável e respeita a ordem correta (conter, avaliar o risco, corrigir, verificar eficácia).\n\n' +
    'COMO ANALISAR: 1) Qual requisito (cláusula) ou controle do Anexo A está em jogo? 2) A evidência apresentada realmente comprova o que se afirma? 3) A ação trata o sintoma ou a causa? 4) Quem tem autoridade para decidir e o registro existe?\n\n' +
    'ATENÇÃO: este material é um RASCUNHO para revisão da Segurança da Informação, Compliance e AI Guild, e apoia a preparação da Opah IT, que ainda não é certificada, para a certificação ISO/IEC 27001. Escopo do SGSI a certificar: [inserir escopo do SGSI Opah]. Regras de organismos certificadores aparecem como prática comum de auditoria e devem ser conferidas com o organismo certificador.',
  scenarios: [
    {
      id: 'i12-s1',
      situation:
        'Você é o líder do SGSI de uma empresa de software (empresa-exemplo.test) e recebe o relatório da auditoria interna. O auditor registrou que 6 dos 20 desenvolvedores amostrados mantêm acesso de administrador a produção, sem justificativa documentada. O gerente de engenharia pede para "resolver hoje" e propõe remover os 6 acessos e fechar o achado. A revisão periódica de direitos de acesso consta no procedimento, mas o último registro dela tem 14 meses. Ninguém sabe dizer quem deveria executá-la. A auditoria externa de certificação está marcada para daqui a dois meses.',
      question: 'Qual é a resposta mais completa ao achado?',
      options: [
        o('Remover os 6 acessos hoje, anexar o print como evidência e fechar o achado no mesmo dia, com o gerente de engenharia como aprovador.', 'Corrige apenas a correção imediata. Sem causa-raiz (revisão não executada, dono indefinido) o problema reaparece, e a cláusula 10.2 pede também ação para evitar recorrência e verificação de eficácia.'),
        o('Corrigir os 6 acessos, tratar a causa (revisão sem dono), definir responsável e rotina e verificar a eficácia depois.', 'Correto. Cláusula 10.2 (contenção/correção, causa, ação corretiva, eficácia) ligada ao controle A.5.18 (direitos de acesso) e A.8.2 (acessos privilegiados).', true),
        o('Aceitar o risco formalmente em ata, já que os 6 desenvolvedores são de confiança e a equipe pequena não comporta revisões frequentes.', 'Aceitação de risco exige avaliação e aprovação pelo dono do risco (6.1.2 e 6.1.3). Confiança pessoal não substitui o controle de acesso privilegiado.'),
        o('Pedir ao auditor que reclassifique o achado como observação, anexando o print, já que o problema foi corrigido antes da externa.', 'A classificação reflete o que foi encontrado, não o momento da correção. Negociar o rótulo é mau sinal e não trata a causa.'),
      ],
    },
    {
      id: 'i12-s2',
      situation:
        'Na auditoria interna de um provedor de serviços (empresa-exemplo.test), você compara a Declaração de Aplicabilidade (SoA) com o registro de riscos. A SoA exclui o controle de gestão de vulnerabilidades técnicas com a justificativa "não aplicável: usamos nuvem". O registro de riscos, porém, tem dois riscos altos ligados a falhas exploráveis em instâncias de VM e containers próprios. A equipe de plataforma garante que "patch é feito, só não está formalizado". Os dois riscos altos têm tratamento marcado como "reduzir mediante controles do Anexo A". A diretoria quer manter a SoA limpa, sem controles com lacuna.',
      question: 'Qual é o problema principal e a conduta correta?',
      options: [
        o('Incluir o controle na SoA, implementá-lo e evidenciá-lo, pois a exclusão contradiz os riscos altos.', 'Correto. A SoA (6.1.3) deve justificar inclusões e exclusões com base no tratamento de riscos. Aqui o controle A.8.8 (gestão de vulnerabilidades técnicas) é necessário para os riscos altos registrados.', true),
        o('Manter a exclusão e acrescentar à justificativa que o provedor de nuvem cuida da infraestrutura e dos patches das VMs.', 'Responsabilidade compartilhada não elimina a parte do cliente: VMs e containers próprios continuam sob sua gestão. A justificativa seguiria incoerente com o registro de riscos.'),
        o('Reduzir os dois riscos altos para médio no registro, alinhando-os à exclusão do controle, e documentar a nova avaliação.', 'Ajustar o risco para caber na SoA inverte a lógica. A avaliação de risco deve basear-se em critérios, não no resultado desejado.'),
        o('Formalizar o patching rapidamente com um procedimento curto e manter a exclusão na SoA até a certificação.', 'Formalizar é bom, mas manter a exclusão cria nova incoerência: o controle passa a existir e a SoA continua dizendo que não se aplica.'),
      ],
    },
    {
      id: 'i12-s3',
      situation:
        'Você está definindo o escopo do SGSI (cláusula 4.3) de uma fábrica de software (empresa-exemplo.test) que se prepara para a certificação. O escopo atual cobre "o ambiente de produção e o suporte ao cliente". O ambiente de desenvolvimento e o repositório de código ficaram de fora porque "não têm dado de cliente". Na verdade, a equipe copia massas de teste extraídas de produção para o ambiente de dev e guarda segredos de pipeline nos repositórios. O diretor argumenta que escopo menor facilita a certificação e reduz o custo de auditoria.',
      question: 'Qual é a melhor decisão sobre o escopo?',
      options: [
        o('Manter o escopo reduzido, com uma nota dizendo que dev e repositório estão fora por decisão da direção e custo de auditoria.', 'Uma nota não elimina a dependência: produção depende do pipeline e do código. Interfaces e dependências entre o escopo e o que está fora precisam ser consideradas e justificadas.'),
        o('Incluir apenas o repositório de código no escopo e deixar os ambientes de dev e teste fora, tratando a cópia de dados depois.', 'Resolve parte do problema, mas a cópia de dados de produção para dev continua fora de controle.'),
        o('Reavaliar o escopo considerando interfaces e dependências, incluindo dev, repositório e pipeline, e tratar dados de produção em teste.', 'Correto. A cláusula 4.3 pede considerar interfaces e dependências, e os controles A.8.31 (separação de ambientes), A.8.33 (informação de teste) e A.8.4 (acesso ao código-fonte) estão diretamente em jogo.', true),
        o('Ampliar o escopo para toda a empresa sem análise prévia, para evitar questionamentos do auditor sobre fronteiras.', 'Escopo amplo demais sem análise é atalho que cria obrigações que a organização não consegue evidenciar. A decisão deve vir do contexto e dos riscos.'),
      ],
    },
    {
      id: 'i12-s4',
      situation:
        'A empresa-exemplo.test usa um fornecedor (fornecedor-exemplo.test) para hospedar e operar a base de clientes. Na auditoria interna, você vê que o fornecedor está na lista de fornecedores críticos, mas a última avaliação de segurança é de três anos atrás e o contrato não prevê notificação de incidentes. O gerente de compras diz que o fornecedor "tem uma certificação" e que isso basta. O certificado apresentado cobre apenas o escritório administrativo do fornecedor. O contrato vence em 60 dias e a renovação já está em negociação.',
      question: 'Qual é a conduta mais adequada?',
      options: [
        o('Aceitar o certificado como evidência suficiente, arquivar no dossiê do fornecedor e registrar a avaliação como atualizada.', 'O escopo do certificado não cobre o serviço contratado. Evidência fora de escopo não demonstra controle sobre a hospedagem.'),
        o('Reavaliar o fornecedor para o serviço contratado e exigir requisitos de segurança e notificação de incidentes na renovação.', 'Correto. Reúne A.5.19 a A.5.22 (relações com fornecedores, acordos e monitoramento) e o risco tratado conforme 6.1.3. A renovação é a janela para fixar requisitos.', true),
        o('Renovar o contrato agora, para não perder o prazo da negociação, e agendar a avaliação do fornecedor para o próximo semestre.', 'A janela da renovação é justamente quando há poder de negociação. Avaliar depois enfraquece a capacidade de exigir requisitos.'),
        o('Encerrar o contrato imediatamente por falta de avaliação e migrar a base de clientes para outro fornecedor já homologado.', 'Medida desproporcional e arriscada sem análise: a migração cria novos riscos e a avaliação pode resolver a lacuna.'),
      ],
    },
    {
      id: 'i12-s5',
      situation:
        'Ao auditar o processo de incidentes, você pede os registros do último trimestre. O registro oficial mostra zero incidentes. Em conversas, a equipe de infraestrutura menciona que, no mês passado, uma conta de serviço foi usada de um IP externo e o acesso foi bloqueado "na hora", sem abrir chamado, porque a equipe estava ocupada e o problema "foi resolvido". O log do firewall mostra a atividade. O responsável pelo SGSI teme que reportar isso piore a imagem na auditoria externa.',
      question: 'Qual é a ação correta do auditor interno e da gestão?',
      options: [
        o('Registrar o evento como incidente, mesmo tardio, apurar impacto e causa e tratar a falha de registro como não conformidade.', 'Correto. Controles A.5.24 a A.5.28 (planejamento, avaliação, resposta, aprendizado e evidências) e cláusula 10.2. Esconder o evento é pior que registrar com atraso.', true),
        o('Não registrar, pois o evento foi contido na hora e o log do firewall não mostra impacto, mantendo o registro oficial em zero.', 'Sem registro não há avaliação nem aprendizado. A conta de serviço pode ter sido usada para mais do que o observado.'),
        o('Registrar apenas uma observação informal na ata da próxima reunião, sem abrir incidente formal, para não alarmar a auditoria.', 'Observação informal não gera avaliação, causa-raiz nem evidência rastreável. Mantém o problema invisível.'),
        o('Abrir o incidente, mas datá-lo na semana atual, para que conste no trimestre de menor ocorrência e evite questionamentos.', 'Alterar datas compromete a integridade da evidência. O registro deve refletir a cronologia real.'),
      ],
    },
    {
      id: 'i12-s6',
      situation:
        'Na auditoria, você pede evidências da análise crítica pela direção (cláusula 9.3). Recebe uma ata de 15 minutos com a assinatura de três diretores. A ata lista os tópicos "resultados de auditoria", "riscos" e "objetivos", sem decisões, responsáveis nem prazos. O auditor percebe que o relatório de desempenho do SGSI foi distribuído no dia anterior e que nenhum item de melhoria saiu da reunião. O responsável pelo SGSI explica que "a direção está muito ocupada" e que a ata cumpre o requisito.',
      question: 'Como avaliar e responder a essa situação?',
      options: [
        o('Considerar conforme, pois a reunião ocorreu, a ata existe e está assinada pelos três diretores, e anotar uma recomendação de pauta.', 'A existência de ata não demonstra que as entradas foram consideradas nem que houve saídas. A cláusula 9.3 pede decisões sobre melhoria e necessidade de mudanças.'),
        o('Pedir à direção que assine uma segunda ata com decisões, datada da mesma reunião, para completar o registro e fechar o achado.', 'Registrar decisões que não foram tomadas é falsificar evidência. A solução honesta é realizar a análise de verdade.'),
        o('Reduzir o achado a uma oportunidade de melhoria, pois o conteúdo dos tópicos está correto, e acompanhar na próxima análise crítica.', 'Os tópicos corretos não suprem a ausência de saídas. A lacuna é de requisito e deve ser tratada como tal.'),
        o('Registrar não conformidade em 9.3, tratar a causa (pauta, entradas, saídas) e refazer a análise com decisões e prazos.', 'Correto. A cláusula 9.3.2 e 9.3.3 pedem entradas definidas e saídas com decisões sobre melhoria e mudanças no SGSI, conservadas como informação documentada.', true),
      ],
    },
    {
      id: 'i12-s7',
      situation:
        'Um cliente grande (cliente-exemplo.test) reporta lentidão grave às 18h de uma sexta. O time de operações propõe alterar uma regra de balanceamento e liberar uma porta no firewall para um IP externo (198.51.100.20) usado por um parceiro de diagnóstico. O gestor aprova por WhatsApp e pede para aplicar logo, deixando o chamado de mudança para segunda-feira. O procedimento prevê mudança emergencial, com avaliação de risco simplificada e aprovação registrada. Ninguém avaliou o impacto da liberação do IP externo nem sua duração.',
      question: 'Qual é a conduta mais adequada?',
      options: [
        o('Aplicar as duas mudanças agora com a aprovação do gestor por WhatsApp e registrar tudo na segunda-feira, já que o cliente é crítico.', 'Aprovação por mensagem não é o registro previsto, e a liberação de IP externo não teve avaliação de risco nem prazo de reversão.'),
        o('Aplicar a regra de balanceamento agora e adiar a liberação do IP para segunda-feira, deixando o registro de ambas para depois.', 'Separar os itens é razoável, mas deixar a mudança sem registro mantém a falha de processo.'),
        o('Recusar qualquer mudança até segunda-feira, seguindo o processo normal para não violar o controle, e avisar o cliente do atraso.', 'O processo prevê o caminho emergencial. Recusar tudo ignora a necessidade de negócio e o próprio procedimento.'),
        o('Usar o fluxo emergencial: registro imediato, avaliação de risco do IP externo com prazo de acesso, aprovação e plano de reversão.', 'Correto. A.8.32 (gestão de mudanças) com a cláusula 8.1 (planejar e controlar mudanças): urgência muda o rito, não elimina avaliação, aprovação e registro.', true),
      ],
    },
    {
      id: 'i12-s8',
      situation:
        'No controle de conscientização (A.6.3 e cláusula 7.2), você pede evidências do treinamento anual de segurança. Recebe uma lista de presença com 94% de assinaturas e um slide deck. O auditor percebe que as assinaturas de 30 pessoas têm a mesma data e horário, e que o deck não tem avaliação. Nos últimos seis meses, a empresa teve três incidentes de phishing com clique de colaboradores. Os dois treinamentos de papéis específicos (devs e administradores) não foram dados. O RH afirma que o indicador de 94% está acima da meta.',
      question: 'Qual é a leitura correta e a melhor resposta?',
      options: [
        o('Considerar a meta atendida e o controle eficaz pelo indicador de 94% de presença, e revisar o treinamento só no próximo ciclo anual.', 'Presença mede participação, não competência nem mudança de comportamento. Os incidentes de phishing contradizem a eficácia.'),
        o('Reaplicar o mesmo treinamento a todos e coletar novas assinaturas, até chegar a 100% de cobertura, com prazo de 30 dias.', 'Mais do mesmo formato repete o problema: assinatura não prova entendimento e os treinamentos por papel continuam ausentes.'),
        o('Tratar a eficácia: medir competência (avaliação, simulação de phishing), dar treinamentos por papel e analisar a causa dos cliques.', 'Correto. A cláusula 7.2 pede evidência de competência e A.6.3 conscientização e treinamento adequados aos papéis. Eficácia se mede por resultado, não por presença.', true),
        o('Descartar a lista de presença por suspeita de fraude e abrir processo disciplinar contra os 30 signatários, sem apurar antes.', 'A suspeita de assinatura em lote merece verificação, mas partir para punição sem apurar é precipitado e não resolve a causa do desenho do treinamento.'),
      ],
    },
    {
      id: 'i12-s9',
      situation:
        'Você audita o uso da nuvem (A.5.23) de uma empresa que hospeda sua plataforma em um provedor público. Em uma revisão do console, vê um bucket de armazenamento com backups, criado há 8 meses pela equipe de dados. A configuração é a padrão do provedor: sem criptografia com chave gerenciada pela empresa, sem registro de acesso, sem política de ciclo de vida e com a permissão de escrita ampla para a conta de aplicação. A equipe de dados argumenta que o provedor é seguro por padrão e que a responsabilidade é dele.',
      question: 'Qual é a avaliação e a ação mais adequada?',
      options: [
        o('Aceitar o argumento da equipe de dados, pois o provedor é certificado e cobre a segurança do armazenamento, e arquivar o certificado.', 'No modelo de responsabilidade compartilhada, configuração e acesso aos dados são do cliente. A certificação do provedor não cobre a configuração feita pela empresa.'),
        o('Corrigir a permissão ampla de escrita no bucket, revisar a conta de aplicação e registrar o achado como resolvido.', 'Reduz um risco, mas deixa criptografia, registro de acesso e ciclo de vida sem tratamento, e a causa (ausência de baseline) permanece.'),
        o('Migrar os backups para um novo bucket com a mesma configuração padrão e remover o antigo depois da cópia, validando a integridade.', 'Mudar de lugar sem mudar a configuração não corrige nada.'),
        o('Definir um baseline de configuração segura, corrigir este bucket, verificar os demais e rever a criação de recursos.', 'Correto. Cruza A.5.23 (serviços em nuvem), A.8.9 (gestão de configuração) e A.8.15 (registro): a causa é a ausência de padrão, não um bucket isolado.', true),
      ],
    },
    {
      id: 'i12-s10',
      situation:
        'Para investigar um acesso indevido, o auditor interno pede o log do sistema financeiro e entrevista o responsável. O responsável afirma que "ninguém além do time acessou o relatório de folha". O log, extraído do sistema, mostra três acessos de um usuário de outro departamento às 23h, de um endereço 203.0.113.50. O responsável alega que o log "deve estar errado" porque o relógio do servidor é impreciso. Há também uma diferença de uma hora entre o relógio do servidor e o do sistema de autenticação.',
      question: 'Como o auditor deve tratar a inconsistência entre relato e log?',
      options: [
        o('Priorizar o relato do responsável, que conhece o sistema, descartar o log por causa do relógio impreciso e encerrar a apuração.', 'O relato é evidência testemunhal. Descartar o log sem verificar a precisão do relógio é erro de método.'),
        o('Concluir que houve acesso indevido com base no log, já que registros técnicos são mais confiáveis que depoimentos, e acionar o RH.', 'Conclusão apressada: antes é preciso validar a integridade e a sincronização do log, pois a diferença de hora pode alterar a leitura.'),
        o('Verificar integridade e sincronização dos relógios, correlacionar com autenticação e rede e registrar a falha de sincronização.', 'Correto. Evidência deve ser corroborada. A.8.17 (sincronização de relógios) e A.8.15 (registro) são pontos de controle, e a divergência pode ser achado independente.', true),
        o('Pedir ao responsável que regenere o log do relatório de folha e confira se o resultado muda, sem guardar a cópia original.', 'Regenerar ou reexportar logs sem preservar o original compromete a evidência. É necessário preservar e corroborar, não substituir.'),
      ],
    },
    {
      id: 'i12-s11',
      situation:
        'O SGSI da empresa-exemplo.test tem um plano de continuidade de TI (A.5.30) aprovado há dois anos. O plano prevê restauração do banco de dados principal a partir de backup em outra região. Na auditoria, você pede o último teste. O responsável diz que os backups "rodam todo dia com sucesso" e mostra o painel verde. Nunca houve restauração completa, e o plano cita um servidor desativado há um ano. A diretoria definiu um RTO de 4 horas na análise de impacto, sem ter sido validado.',
      question: 'Qual é a conclusão e o encaminhamento mais adequado?',
      options: [
        o('Considerar o painel verde prova de prontidão, classificar como conforme e registrar uma recomendação de teste para o próximo ano.', 'Backup concluído não prova restauração nem cumprimento do RTO. O plano desatualizado reforça a lacuna.'),
        o('Atualizar o plano retirando o servidor desativado e manter o RTO de 4 horas como meta oficial aprovada pela diretoria.', 'Corrigir o texto não valida nada: sem teste, o RTO continua sem evidência de que é atingível.'),
        o('Testar a restauração apenas de uma tabela pequena para comprovar que o backup funciona e registrar o resultado no plano.', 'Teste parcial ajuda, mas não valida o cenário do plano nem o tempo total de recuperação.'),
        o('Registrar não conformidade, atualizar o plano e testar a restauração no cenário previsto, medindo o tempo contra o RTO.', 'Correto. A.5.30 (prontidão das TIC para continuidade), A.8.13 (backup) e a cláusula 10.2: o plano só é confiável quando exercitado e medido.', true),
      ],
    },
    {
      id: 'i12-s12',
      situation:
        'A empresa-exemplo.test mantém um SGSI baseado na edição 2013 da ISO/IEC 27001 e planeja migrar para a edição 2022. A SoA atual lista controles com a numeração antiga (A.12, A.14 etc.), e o gerente propõe apenas "renumerar" os controles com uma tabela de correspondência para acelerar. Há controles novos na edição 2022 (por exemplo, tratamento de ameaças, uso seguro de nuvem e monitoramento de atividades) sem tratamento na SoA. O prazo final de transição do organismo certificador ainda não foi confirmado internamente.',
      question: 'Qual é a melhor abordagem de transição?',
      options: [
        o('Renumerar a SoA pela tabela de correspondência e declarar a transição concluída, atualizando só o cabeçalho dos documentos.', 'Correspondência de números não cobre controles novos nem reavaliação de riscos. Transição é revisão, não renumeração.'),
        o('Aguardar a auditoria externa para saber o que falta e só então ajustar o SGSI, reservando orçamento para os achados.', 'Descobrir lacunas na auditoria externa é caro e arriscado. A análise de lacunas deve ser feita antes.'),
        o('Fazer análise de lacunas entre as edições, revisar riscos e SoA com os controles novos e confirmar o prazo com o certificador.', 'Correto. Cláusulas 6.1.2 e 6.1.3 (riscos e SoA) com a revisão do Anexo A 2022; prazo e rito de transição dependem do organismo (a conferir com o organismo certificador).', true),
        o('Excluir da SoA os controles novos com a justificativa "ainda não implementado", para evitar achados, e reavaliar no ciclo seguinte.', 'Falta de implementação não é justificativa de exclusão. A exclusão deve basear-se na ausência de necessidade conforme os riscos.'),
      ],
    },
    {
      id: 'i12-s13',
      situation:
        'A empresa-exemplo.test escalou o analista de TI que implementa o controle de backup como auditor interno do próprio processo de backup, porque "é quem mais entende". Ele relata que o processo está conforme e não registra nenhum achado. Na amostra, outro analista da equipe vê que o backup do servidor de e-mail não é testado há mais de um ano. O gerente de TI sugere manter o auditor, argumentando que a equipe de auditoria é pequena e o prazo da externa é curto.',
      question: 'Qual é o ponto central e a correção adequada?',
      options: [
        o('Treinar o analista em auditoria interna, mantê-lo no papel e acompanhar o próximo relatório, pois o problema central é competência.', 'Competência é necessária, mas o conflito de interesse persiste: ele audita o próprio trabalho.'),
        o('Manter o analista e pedir uma revisão cruzada ao gerente de TI, que também faz parte da equipe, antes da auditoria externa.', 'O gerente também não é independente do processo. A revisão simbólica não corrige a objetividade.'),
        o('Ignorar o relato do segundo analista, pois não há evidência formal do problema do backup de e-mail, e seguir o relatório.', 'O relato aponta algo verificável. Deve ser apurado, e não descartado por falta de registro.'),
        o('Designar auditor que não audite o próprio trabalho, reauditar o processo e tratar o achado do backup de e-mail.', 'Correto. A cláusula 9.2 exige objetividade e imparcialidade na seleção de auditores. A.5.35 (revisão independente) reforça o princípio.', true),
      ],
    },
    {
      id: 'i12-s14',
      situation:
        'No fim de um contrato, a empresa-exemplo.test deve eliminar os dados do cliente em até o prazo previsto no contrato [inserir prazo contratual validado]. A política de retenção diz que logs de aplicação são guardados por 12 meses, e as bases de teste, por 30 dias. O auditor interno encontra dados do cliente em um bucket de testes com 7 meses, em backups mensais com 14 meses e em tickets de suporte. O responsável explica que "apagar tudo quebra a restauração" e propõe guardar o que for possível "por garantia". Não há registro de eliminação.',
      question: 'Qual é a conduta mais adequada?',
      options: [
        o('Mapear onde estão os dados, aplicar retenção e eliminação conforme política e contrato e registrar as evidências.', 'Correto. A.8.10 (eliminação de informação) e A.5.33 (proteção de registros), com A.5.34 quando houver dados pessoais: política, contrato e evidência precisam concordar.', true),
        o('Apagar todos os locais de imediato, inclusive os backups, e registrar depois o impacto sobre a capacidade de restauração.', 'Eliminação sem análise pode quebrar a continuidade e outras obrigações. Backups costumam seguir rotação com justificativa documentada.'),
        o('Manter tudo como está, pois a política permite guardar logs por 12 meses, e guardar o restante por garantia contratual.', 'A política de logs não cobre os dados do cliente nos demais locais, e o contrato prevalece para o encerramento.'),
        o('Eliminar o bucket de testes e os tickets e deixar os backups sem tratamento por serem técnicos, registrando a eliminação.', 'Backups também contêm os dados do cliente. Omitir esse local deixa a eliminação incompleta e sem registro.'),
      ],
    },
    {
      id: 'i12-s15',
      situation:
        'Faltam três semanas para a auditoria externa de certificação. O diretor-executivo quer a certificação para fechar um contrato grande e pede que a equipe "feche todos os achados abertos até sexta". Existem 5 não conformidades abertas, incluindo duas ligadas a controle de acessos e à análise crítica da direção. Um coordenador sugere fechar os achados "em lote" com evidência genérica, ajustar as datas dos registros e orientar o time a "não mencionar" o incidente do mês passado. Isso evitaria adiar a certificação.',
      question: 'Qual é a resposta mais adequada do responsável pelo SGSI?',
      options: [
        o('Fechar os 5 achados em lote com evidência genérica até sexta, pois o prazo é comercial e a diretoria decide a prioridade.', 'Fechar sem evidência de eficácia infla o SGSI e cria risco maior na auditoria externa. A cláusula 10.2 exige verificar a eficácia das ações.'),
        o('Concordar com o ajuste de datas, pois os trabalhos já foram feitos informalmente, e omitir o incidente por ser tema encerrado.', 'Alterar datas e ocultar incidente comprometem a integridade das evidências e a honestidade perante a auditoria. É um problema ético e de conformidade.'),
        o('Priorizar as não conformidades por risco, corrigir com evidência real e levar à direção o que não ficará pronto para decidir o prazo.', 'Correto. Combina 10.2 (ação corretiva com eficácia), 9.3 (informação à direção para decidir) e transparência. O que vale como prazo ou pendência aberta é prática comum de auditoria (a conferir com o organismo certificador).', true),
        o('Pedir o adiamento da auditoria externa ao organismo certificador, sem consultar a direção, para evitar o risco de reprovação.', 'Adiar por conta própria ignora a autoridade da direção. A escolha entre prazos deve ser levada a quem decide, com os fatos.'),
      ],
    },
  ],
  visuals: {
    'i12-s1': {
      kind: 'sheet', title: 'Relatório de auditoria interna: acessos a produção (amostra)',
      columns: ['Usuário', 'Perfil em produção', 'Justificativa', 'Última revisão de acesso'],
      rows: [
        ['dev-01', 'admin', '(vazio)', '14 meses'],
        ['dev-02', 'admin', '(vazio)', '14 meses'],
        ['dev-03', 'leitura', 'suporte N3', '14 meses'],
        ['dev-04', 'admin', 'projeto encerrado', '14 meses'],
      ],
      note: 'Responsável pela revisão periódica: (não definido no procedimento). Seis de vinte usuários amostrados com perfil admin e sem justificativa.',
    },
    'i12-s2': {
      kind: 'sheet', title: 'SoA x registro de riscos (extrato)',
      columns: ['Item', 'Estado na SoA', 'Justificativa', 'Risco ligado (nível)'],
      rows: [
        ['Gestão de vulnerabilidades técnicas', 'EXCLUÍDO', 'não aplicável: usamos nuvem', 'R-14 exploração em VM (alto)'],
        ['Gestão de vulnerabilidades técnicas', 'EXCLUÍDO', 'não aplicável: usamos nuvem', 'R-19 imagem de container desatualizada (alto)'],
        ['Controle de acesso', 'INCLUÍDO', 'implementado', 'R-03 (médio)'],
      ],
      note: 'Tratamento dos riscos R-14 e R-19: reduzir mediante controles do Anexo A.',
    },
    'i12-s3': {
      kind: 'form', title: 'Definição de escopo do SGSI (rascunho)',
      fields: [
        { label: 'Dentro do escopo: produção e suporte ao cliente', required: true },
        { label: 'Fora do escopo: desenvolvimento e repositório de código' },
        { label: 'Interfaces e dependências analisadas' },
        { label: 'Justificativa: "sem dado de cliente em dev"' },
      ],
      note: 'Observação do auditor: pipeline de CI guarda segredos em repositórios e a equipe copia extrações de produção para dev. Campo "Interfaces e dependências analisadas" está vazio.',
    },
    'i12-s4': {
      kind: 'sheet', title: 'Ficha do fornecedor crítico: fornecedor-exemplo.test',
      columns: ['Campo', 'Valor'],
      rows: [
        ['Serviço', 'Hospedagem e operação da base de clientes'],
        ['Criticidade', 'Alta'],
        ['Última avaliação de segurança', 'há 3 anos'],
        ['Certificado apresentado', 'escopo: escritório administrativo'],
        ['Cláusula de notificação de incidentes', 'não prevista'],
        ['Vencimento do contrato', 'em 60 dias'],
      ],
      note: 'O escopo do certificado não inclui a hospedagem contratada.',
    },
    'i12-s5': {
      kind: 'log', title: 'Registro de incidentes x log do firewall',
      lines: [
        'registro oficial (ultimo trimestre): 0 incidentes',
        'firewall: 2026-10-07 02:14  conta svc-deploy  origem 203.0.113.77  login OK',
        'firewall: 2026-10-07 02:31  conta svc-deploy  acesso a 3 repositorios internos',
        'firewall: 2026-10-07 02:40  bloqueio manual da origem pela infra',
        'chamado aberto: nenhum',
      ],
      note: 'O bloqueio ocorreu 26 minutos após o primeiro login bem-sucedido e a conta continuou ativa.',
    },
    'i12-s6': {
      kind: 'email', from: 'sgsi@empresa-exemplo.test', to: 'auditor.interno@empresa-exemplo.test',
      subject: 'Evidência 9.3: ata da análise crítica',
      attachments: ['ata_analise_critica.pdf'],
      body: [
        'Segue a ata assinada pela direção. Duração da reunião: 15 minutos.',
        'Tópicos: resultados de auditoria, riscos, objetivos.',
        'Decisões: (nenhuma registrada). Responsáveis: (não informado). Prazos: (não informado).',
        'O relatório de desempenho do SGSI foi enviado à direção no dia anterior.',
      ],
      flag: 'Ata sem decisões, responsáveis nem prazos',
    },
    'i12-s7': {
      kind: 'chat', channel: 'Plantão de operações (sexta, 18h12)',
      messages: [
        { who: 'Operações', text: 'Cliente grande está lento. Preciso mudar o balanceamento e liberar 198.51.100.20 no firewall para o parceiro de diagnóstico.' },
        { who: 'Gestor', text: 'Aprovado. Aplica agora e abre o chamado de mudança na segunda.' },
        { who: 'Operações', text: 'A liberação do IP fica por quanto tempo? E o plano de reversão?' },
        { who: 'Gestor', text: 'Depois a gente vê.' },
      ],
    },
    'i12-s8': {
      kind: 'sheet', title: 'Treinamento anual de segurança: evidências',
      columns: ['Item', 'Resultado'],
      rows: [
        ['Presença assinada', '94% (30 assinaturas com data e hora idênticas)'],
        ['Avaliação de aprendizado', 'não existe'],
        ['Treinamento para devs', 'não realizado'],
        ['Treinamento para administradores', 'não realizado'],
        ['Incidentes de phishing com clique (6 meses)', '3'],
      ],
      note: 'O indicador do RH mede apenas assinatura de presença.',
    },
    'i12-s9': {
      kind: 'log', title: 'Console da nuvem: bucket backup-dados-exemplo',
      lines: [
        'criado ha 8 meses por: equipe de dados',
        'criptografia: padrao do provedor (sem chave gerenciada pela empresa)',
        'registro de acesso (logging): DESATIVADO',
        'ciclo de vida / retencao: nao configurado',
        'permissao de escrita: conta de aplicacao (ampla, sem restricao de prefixo)',
        'baseline de configuracao segura: nao existe na empresa',
      ],
    },
    'i12-s10': {
      kind: 'log', title: 'Log do sistema financeiro (extrato)',
      lines: [
        'servidor: 2026-10-14 23:02:11  user=u.vendas07  rel=folha_mensal  origem=203.0.113.50',
        'servidor: 2026-10-14 23:05:40  user=u.vendas07  rel=folha_mensal  origem=203.0.113.50',
        'autenticacao: 2026-10-14 22:03:09  user=u.vendas07  login OK',
        'ntp: servidor financeiro desvia +1h em relacao ao servico de autenticacao',
      ],
      note: 'O responsável alega que o log está errado. A divergência de uma hora entre fontes é real e mudaria a hora do acesso.',
    },
    'i12-s11': {
      kind: 'sheet', title: 'Prontidão de continuidade (extrato)',
      columns: ['Item', 'Situação'],
      rows: [
        ['Plano de continuidade de TI', 'aprovado há 2 anos'],
        ['Backups diários', 'concluídos com sucesso (painel verde)'],
        ['Último teste de restauração completa', 'nunca realizado'],
        ['Servidor citado no plano', 'desativado há 1 ano'],
        ['RTO definido na análise de impacto', '4 horas (não validado)'],
      ],
    },
    'i12-s12': {
      kind: 'sheet', title: 'SoA em transição (extrato)',
      columns: ['Controle (numeração 2013)', 'Correspondência 2022', 'Situação'],
      rows: [
        ['A.12.6.1 Vulnerabilidades técnicas', 'A.8.8', 'renumerado'],
        ['A.14.2.1 Desenvolvimento seguro', 'A.8.25', 'renumerado'],
        ['(sem equivalente na SoA)', 'Inteligência de ameaças', 'não tratado'],
        ['(sem equivalente na SoA)', 'Uso de serviços de nuvem', 'não tratado'],
        ['(sem equivalente na SoA)', 'Monitoramento de atividades', 'não tratado'],
      ],
      note: 'Avaliação de riscos ainda não revista após a mudança de edição. Prazo de transição do organismo certificador: [a confirmar].',
    },
    'i12-s13': {
      kind: 'form', title: 'Plano de auditoria interna: backup',
      fields: [
        { label: 'Processo auditado: backup e restauração', required: true },
        { label: 'Auditor: analista responsável pela implementação do backup', required: true },
        { label: 'Declaração de independência do auditor' },
        { label: 'Achados registrados: 0' },
      ],
      note: 'Outro analista relata que o backup do servidor de e-mail não é testado há mais de um ano. O campo de independência está vazio.',
    },
    'i12-s14': {
      kind: 'sheet', title: 'Inventário de dados do cliente: fim de contrato',
      columns: ['Local', 'Idade do dado', 'Política de retenção', 'Registro de eliminação'],
      rows: [
        ['Bucket de testes', '7 meses', '30 dias', 'nenhum'],
        ['Backups mensais', '14 meses', 'rotação a definir', 'nenhum'],
        ['Tickets de suporte', '11 meses', 'não definida', 'nenhum'],
        ['Logs de aplicação', '9 meses', '12 meses', 'não se aplica'],
      ],
      note: 'Contrato exige eliminação ao fim, com comprovação [inserir prazo contratual validado].',
    },
    'i12-s15': {
      kind: 'email', from: 'coordenacao@empresa-exemplo.test', to: 'sgsi@empresa-exemplo.test',
      subject: 'Plano para a sexta: fechar tudo antes da externa',
      body: [
        'Pessoal, vamos fechar as 5 não conformidades em lote na sexta, com a evidência genérica do último trimestre.',
        'Ajustem as datas dos registros para antes do corte e não citem o incidente do mês passado ao auditor.',
        'Status real: acessos (sem revisão feita), análise crítica (sem nova reunião), 3 itens menores em andamento.',
      ],
      flag: 'Pedido de evidência genérica, ajuste de datas e omissão de incidente',
    },
  } satisfies Record<string, ScenarioVisual>,
  understand:
    'O QUE SE REPETE NOS 15 CASOS? Quase sempre a resposta certa trata a causa (não só o sintoma), gera evidência verificável e respeita a ordem: conter, avaliar o risco, corrigir, verificar a eficácia (cláusula 10.2) e informar quem decide (cláusula 9.3).\n\n' +
    'ARMADILHAS COMUNS: 1) Fechar achado sem eficácia comprovada; 2) Evidência que não prova o que afirma (presença, painel verde, certificado fora de escopo); 3) SoA ou escopo moldados para facilitar a auditoria em vez de refletir riscos e dependências; 4) Pressão por prazo que leva a alterar datas, ocultar incidente ou reclassificar achado; 5) Auditor sem objetividade.\n\n' +
    'ATENÇÃO: conteúdo educativo e rascunho para revisão da Segurança da Informação, Compliance e AI Guild. Numeração de cláusulas e controles é seleção editorial a conferir na fonte oficial; regras de organismos certificadores devem ser conferidas com o organismo certificador. A Opah ainda não é certificada: este material apoia a preparação. Escopo do SGSI a certificar: [inserir escopo do SGSI Opah].',
  goodPractices: [
    'Trate achado em quatro passos: contenção/correção, causa-raiz, ação corretiva e verificação de eficácia, com registro de cada um.',
    'A SoA deve concordar com o registro de riscos e com o escopo: exclusão exige justificativa de risco, não conveniência.',
    'Evidência precisa provar o requisito: teste de restauração, avaliação de competência e revisão de acessos valem mais que presença ou painel verde.',
    'Em urgência, use o fluxo emergencial previsto (registro, avaliação simplificada, aprovação, reversão), e nunca altere datas nem omita incidentes.',
    'Garanta objetividade na auditoria interna e leve à direção os fatos reais, inclusive prazos que não serão cumpridos, para que ela decida.',
  ],
  safeguards: [],
};

export const ISO_FINAL_VISUALS: Record<string, ScenarioVisual> = ISO_FINAL.visuals;
