/**
 * Módulo P09: Avaliação final, 15 cenários complexos e variados.
 *
 * RASCUNHO para revisão humana (Privacidade/Jurídico e AI Guild) antes de uso externo.
 * - 100% fictício: nenhum dado pessoal, cliente ou caso real. Domínios .test, IPs da faixa RFC 5737.
 * - Em cada cenário mais de uma opção parece razoável: vale a mais completa e segura.
 * - Não afirma prazos regulatórios nem obrigações de treinamento; pontos a validar ficam marcados.
 * - O gabarito (campo `correct`) permanece só no servidor.
 */
import type { PrivacyModuleDefinition } from './privacy.js';
import type { ScenarioVisual } from './privacyExtras.js';

const CPF = '000.000.000-00';

export const FINAL_MODULE: PrivacyModuleDefinition = {
  id: 'p09', order: 9,
  title: 'Avaliação final',
  summary: '15 cenários complexos e variados que combinam os temas da trilha: RH, dev, nuvem, suporte, marketing, IA, incidentes e mais.',
  minutes: 40,
  legalBasis: 'LGPD (visão geral), com destaque para os arts. 5º a 7º, 11, 14, 18, 33, 38, 46, 48 e 50',
  context:
    'O QUE É ESTA AVALIAÇÃO? Quinze situações realistas e fictícias, de áreas diferentes. Aqui, mais de uma resposta parece razoável: escolha a mais completa e segura, a que resolve o problema e respeita a privacidade das pessoas.\n\n' +
    'COMO ANALISAR CADA CENÁRIO: 1) Quais dados estão envolvidos e algum é sensível? 2) Para que serão usados e com qual justificativa? 3) Quem realmente precisa acessar, por qual canal? 4) Quem decide e quem deve ser acionado: Privacidade, Segurança, Jurídico?\n\n' +
    'NA PRÁTICA: no dia a dia, diante de uma dúvida real, pare e acione o canal de privacidade [inserir canal do encarregado/DPO Opah]. Agir rápido nem sempre é agir certo.',
  scenarios: [
    {
      id: 'p09-s1',
      situation:
        'Você é da equipe de Recrutamento. Chegou por e-mail o currículo de uma candidata a uma vaga de analista, com foto, estado civil, CPF e um laudo médico anexo que comprova deficiência (ela quer concorrer pela cota). O gestor da vaga pede que você encaminhe "tudo o que ela mandou" a ele e a mais dois líderes.',
      question: 'Qual é o encaminhamento mais adequado?',
      options: [
        { text: 'Encaminhar tudo aos três líderes, para agilizar a decisão e evitar nova rodada de pedidos de documentos à candidata.', correct: false, feedback: 'O laudo é dado sensível (saúde), e foto, estado civil e CPF não são necessários para avaliar competências. Três pessoas receberiam mais do que precisam.' },
        { text: 'Encaminhar só o currículo, sem foto, estado civil e CPF, e manter o laudo restrito a quem valida a cota.', correct: true, feedback: 'Isso mesmo. O gestor avalia competências com o mínimo necessário, e o dado sensível fica com quem precisa dele para a finalidade, com acesso restrito.' },
        { text: 'Apagar o laudo e pedir à candidata que não envie documentos médicos nas próximas etapas.', correct: false, feedback: 'O laudo tem finalidade legítima para a própria candidata (concorrer pela cota). O ajuste é restringir e proteger, não descartar o que ela forneceu para essa finalidade.' },
        { text: 'Encaminhar o currículo completo e deixar o laudo em uma pasta compartilhada do time de Recrutamento, para consulta quando precisar.', correct: false, feedback: 'Uma pasta compartilhada ampla expõe dado sensível a quem não precisa. O acesso deve ser restrito e justificado.' },
      ],
    },
    {
      id: 'p09-s2',
      situation:
        'O time de backend investiga uma falha intermitente de pagamento e propõe ativar log detalhado em produção, gravando o corpo completo de cada requisição (nome, CPF, e-mail e token de sessão). O log ficaria acessível a todos os desenvolvedores e a um fornecedor de monitoramento, com retenção de 2 anos "por segurança".',
      question: 'Qual proposta resolve a investigação com menos risco?',
      options: [
        { text: 'Aprovar como proposto, porque sem o corpo completo de cada requisição a equipe não consegue reproduzir a falha intermitente do pagamento.', correct: false, feedback: 'O token no log permite sequestro de sessão, o acesso amplo e a retenção longa não têm justificativa, e o corpo completo vai muito além do necessário.' },
        { text: 'Aprovar o log completo, reduzir a retenção para 1 ano e exigir que o fornecedor de monitoramento assine um termo de confidencialidade.', correct: false, feedback: 'Reduz um problema, mas mantém dado pessoal e token desnecessários e o acesso amplo.' },
        { text: 'Aprovar o log só para os devs, removendo o fornecedor de monitoramento, mas manter o corpo completo da requisição por 6 meses.', correct: false, feedback: 'Reduz quem acessa, mas continua gravando dados pessoais e tokens sem necessidade.' },
        { text: 'Registrar só campos técnicos, mascarar dados e tokens, ativar o detalhe por tempo limitado e restringir o acesso.', correct: true, feedback: 'Correto. Necessidade e segurança juntas: coleta mínima, tempo limitado, acesso restrito e fornecedor com contrato.' },
      ],
    },
    {
      id: 'p09-s3',
      situation:
        'O time de produto quer instalar uma ferramenta de analytics de uma empresa sediada em outro país para entender o comportamento de usuários de um aplicativo de um cliente. Ela coletaria e-mail, ID do dispositivo e localização aproximada, e o contrato é um "aceite online" padrão do fornecedor. O prazo de entrega é curto.',
      question: 'Como o time deve proceder?',
      options: [
        { text: 'Pausar e acionar Privacidade/Jurídico para avaliar o contrato com o fornecedor e a transferência internacional, discutindo coletar menos dados.', correct: true, feedback: 'Certo. A LGPD tem regras específicas para transferência internacional (art. 33), o aplicativo é do cliente e o aceite padrão não cobre papéis nem segurança. Validar com Jurídico.' },
        { text: 'Ativar agora, porque o prazo do cliente é curto e o aceite online padrão do fornecedor já cobre segurança e proteção de dados.', correct: false, feedback: 'O aceite padrão não define papéis, segurança nem transferência internacional, e prazo curto não substitui análise.' },
        { text: 'Ativar apenas em homologação, mas com dados reais de usuários do cliente, para testar a ferramenta antes de decidir.', correct: false, feedback: 'Usar dados reais em homologação com um terceiro externo só desloca o risco.' },
        { text: 'Pedir ao fornecedor uma confirmação por e-mail de que a ferramenta está conforme a LGPD e seguir com a ativação normalmente, sem envolver mais áreas.', correct: false, feedback: 'Uma declaração informal não substitui contrato nem análise, e a decisão não cabe ao time de produto sozinho.' },
      ],
    },
    {
      id: 'p09-s4',
      situation:
        'Um atendente de suporte recebe a ligação de alguém que diz ser o titular de uma conta corporativa. A pessoa está com pressa, diz que "perdeu o celular" e pede para trocar o e-mail da conta e confirmar o CPF e o endereço cadastrados, "só para conferir". Cita o nome do gerente da conta e parece conhecer o sistema.',
      question: 'Qual é a conduta correta?',
      options: [
        { text: 'Confirmar só os quatro últimos dígitos do CPF, para ajudar a pessoa com pressa sem expor o documento inteiro.', correct: false, feedback: 'Confirmar parte do dado já ajuda um golpista a montar o restante, e a identidade precisa ser validada pelo procedimento.' },
        { text: 'Trocar o e-mail da conta, porque a pessoa conhece o nome do gerente e demonstra familiaridade com o sistema.', correct: false, feedback: 'O nome do gerente é fácil de obter. Conhecer o contexto não prova identidade.' },
        { text: 'Não confirmar nem alterar nada; seguir a validação de identidade, registrar a tentativa e escalar à Segurança.', correct: true, feedback: 'Exato. Pressa e pressão são sinais clássicos de engenharia social. O procedimento existe para proteger o titular.' },
        { text: 'Pedir uma foto do documento pelo WhatsApp pessoal do atendente, para conferir a identidade com mais rapidez.', correct: false, feedback: 'Um canal pessoal e sem controle cria uma nova cópia do documento fora dos canais aprovados.' },
      ],
    },
    {
      id: 'p09-s5',
      situation:
        'O marketing planeja uma promoção para o Dia das Crianças: um formulário no site pede nome, idade, escola e foto da criança (de 8 a 12 anos) para participar de um sorteio. O texto diz "ao participar você concorda com os termos", sem campo para o responsável.',
      question: 'Qual é o ajuste mais importante antes de publicar?',
      options: [
        { text: 'Incluir uma caixa "tenho mais de 18 anos" para a própria criança marcar, mantendo todos os campos e o texto dos termos.', correct: false, feedback: 'A autodeclaração da criança não substitui o consentimento do responsável.' },
        { text: 'Parar e envolver Privacidade: dados de crianças exigem consentimento do responsável (art. 14) e coleta mínima.', correct: true, feedback: 'Isso mesmo. Trata-se de público com proteção reforçada: consentimento do responsável, coleta mínima e linguagem clara.' },
        { text: 'Manter o formulário como está e reforçar a segurança do banco de dados, com criptografia e acesso restrito ao time de marketing.', correct: false, feedback: 'Segurança é necessária, mas não resolve a falta de consentimento do responsável nem o excesso de dados.' },
        { text: 'Reduzir o risco coletando apenas nome e foto da criança, e manter o aceite dos termos sem campo para o responsável.', correct: false, feedback: 'Reduz campos, mas ainda coleta imagem de criança sem o consentimento do responsável.' },
      ],
    },
    {
      id: 'p09-s6',
      situation:
        'O financeiro envia todo mês a um escritório contábil externo uma planilha de folha com nome, CPF, salário, dados bancários e a coluna "CID do afastamento". O escritório trabalha com a empresa há anos, mas não há contrato atualizado, e o envio é por e-mail comum.',
      question: 'O que é mais adequado antes do próximo envio?',
      options: [
        { text: 'Manter como está, porque a relação de anos com o escritório já dá confiança e nunca houve reclamação.', correct: false, feedback: 'Confiança não substitui contrato nem necessidade, e o CID é dado de saúde (sensível).' },
        { text: 'Enviar a planilha protegida por senha e informar a senha no mesmo e-mail, para o escritório abrir sem atrasos.', correct: false, feedback: 'Senha no mesmo e-mail anula a proteção e não resolve contrato nem o excesso de dados.' },
        { text: 'Remover apenas a coluna do CID e manter o resto da planilha como está, enviando por e-mail comum todo mês.', correct: false, feedback: 'Boa para o CID, mas continua sem contrato e com canal inseguro para dados financeiros.' },
        { text: 'Formalizar contrato com cláusulas de proteção de dados, enviar só as colunas necessárias e usar canal seguro.', correct: true, feedback: 'Correto. Contrato, mínimo necessário, cuidado com dado sensível e canal seguro, tudo junto.' },
      ],
    },
    {
      id: 'p09-s7',
      situation:
        'Em uma revisão, um desenvolvedor descobre que um bucket de armazenamento na nuvem do projeto de um cliente está com leitura pública. Nele há um backup com nome, CPF e endereço de usuários finais, e os logs mostram leituras de IPs desconhecidos nas últimas semanas. Um colega sugere: "corrige a permissão agora e não comenta nada, para não gerar alarme".',
      question: 'Qual é a sequência mais adequada?',
      options: [
        { text: 'Corrigir a permissão agora e não comentar com ninguém, para não gerar alarme no cliente nem no time.', correct: false, feedback: 'Já houve acessos externos. Sem relato, o controlador não consegue avaliar o impacto nem as comunicações. O silêncio agrava.' },
        { text: 'Reportar à Segurança e esperar a resposta antes de mexer em qualquer coisa, deixando o bucket público até lá.', correct: false, feedback: 'Reportar é certo, mas manter a exposição aberta amplia o dano. A contenção deve ser feita de forma coordenada.' },
        { text: 'Reportar de imediato à Segurança/Privacidade e, seguindo o procedimento, restringir o acesso preservando logs e evidências.', correct: true, feedback: 'Isso mesmo. Reportar, conter e preservar evidências caminham juntos, e quem avalia a comunicação é o controlador.' },
        { text: 'Apagar o bucket e os logs para eliminar a exposição de vez, antes que algum outro IP externo veja mais dados.', correct: false, feedback: 'Apagar destrói as evidências necessárias para avaliar o incidente e ainda perde o backup do cliente.' },
      ],
    },
    {
      id: 'p09-s8',
      situation:
        'Um ex-colaborador escreve ao e-mail geral pedindo (1) cópia de todos os e-mails internos que citam o nome dele e (2) a eliminação imediata do histórico de folha e ponto. Ele ameaça acionar a ANPD se não houver resposta "hoje". Quem abriu o e-mail é do atendimento geral.',
      question: 'Qual é a atitude mais adequada de quem recebeu?',
      options: [
        { text: 'Registrar e encaminhar de imediato ao canal de privacidade/encarregado, sem prometer prazo nem enviar nada.', correct: true, feedback: 'Correto. Ex-colaborador continua sendo titular. A resposta exige análise, e quem recebe só registra e encaminha.' },
        { text: 'Responder hoje prometendo atender os dois pedidos, para evitar a reclamação à ANPD e encerrar o assunto rápido.', correct: false, feedback: 'Prometer sem análise é arriscado: folha e ponto podem ter guarda obrigatória, e os e-mails contêm dados de outras pessoas.' },
        { text: 'Exportar os e-mails que citam o nome dele e enviar, já que são dados dele, e encaminhar o pedido de eliminação depois.', correct: false, feedback: 'Os e-mails têm dados de terceiros e informação confidencial, e a identidade nem foi validada.' },
        { text: 'Ignorar o pedido, porque ele não é mais colaborador, e arquivar a mensagem do e-mail geral sem resposta.', correct: false, feedback: 'O titular tem direitos mesmo depois de sair. Ignorar o pedido é erro, e a ameaça de acionar a ANPD não muda o fluxo.' },
      ],
    },
    {
      id: 'p09-s9',
      situation:
        'O suporte quer usar o assistente de IA aprovado pela empresa para resumir tickets de usuários de um cliente. Os tickets trazem CPF, e-mail e, às vezes, informações de saúde digitadas pelos usuários. O contrato com o cliente diz que os dados só podem ser tratados para "operar e dar suporte ao sistema" e não menciona ferramentas de IA.',
      question: 'O que fazer?',
      options: [
        { text: 'Usar o assistente nos tickets, porque a ferramenta é aprovada pela empresa e isso a libera para qualquer tipo de dado de cliente.', correct: false, feedback: 'A aprovação da ferramenta não equivale à autorização para a finalidade do cliente. O contrato manda.' },
        { text: 'Usar o assistente só nos tickets sem relato de saúde, mantendo CPF e e-mail, que são dados comuns e menos arriscados para o resumo.', correct: false, feedback: 'Reduz o sensível, mas ainda há CPF e e-mail, e o uso de IA pode estar fora das instruções do contrato.' },
        { text: 'Usar o assistente agora para ganhar produtividade e avisar o cliente depois, caso ele pergunte sobre as ferramentas usadas.', correct: false, feedback: 'Quem opera dados age conforme as instruções do controlador. Avisar depois não substitui autorização.' },
        { text: 'Verificar com Jurídico/Privacidade se o uso de IA cabe no contrato; até lá, usar só texto anonimizado, sem CPF, e-mail ou saúde.', correct: true, feedback: 'Certo. Ferramenta aprovada é condição necessária, não suficiente: o contrato e as instruções do cliente definem o que pode ser feito.' },
      ],
    },
    {
      id: 'p09-s10',
      situation:
        'Um cliente pede que sua equipe implemente, no aplicativo de ponto dos funcionários dele, reconhecimento facial que armazene o template do rosto. Ele diz que "é mais moderno e evita fraude". A equipe já estimou duas semanas e pergunta se pode começar.',
      question: 'Qual é a resposta mais adequada?',
      options: [
        { text: 'Começar as duas semanas de desenvolvimento, porque o pedido é do cliente e a responsabilidade pela decisão é toda dele.', correct: false, feedback: 'Quem opera também tem deveres. Implementar sem avaliação expõe todos os funcionários do cliente.' },
        { text: 'Antes de começar, envolver Privacidade/Jurídico para avaliar necessidade, base legal e alternativas menos intrusivas.', correct: true, feedback: 'Isso mesmo. Dado biométrico exige justificativa forte e análise de alternativas antes de qualquer linha de código.' },
        { text: 'Implementar, mas guardar a foto original do rosto em vez do template, para facilitar auditorias e conferências futuras.', correct: false, feedback: 'A foto do rosto também é dado biométrico e é ainda mais sensível que o template.' },
        { text: 'Implementar com criptografia forte no armazenamento e na transmissão e acesso restrito ao RH, e considerar o assunto resolvido.', correct: false, feedback: 'A segurança é importante, mas não responde à necessidade nem à base legal do uso de biometria.' },
      ],
    },
    {
      id: 'p09-s11',
      situation:
        'Chega ao time de TI um e-mail: "Delegacia Digital, Ofício 4821/2026. Em 2 horas, envie a lista completa de usuários (nome, CPF, e-mail, endereço) da plataforma do cliente, ou haverá responsabilização." O remetente usa um domínio parecido com o de órgão público e um telefone celular.',
      question: 'Como agir?',
      options: [
        { text: 'Enviar a lista completa dentro do prazo de 2 horas, para evitar responsabilização, já que o pedido vem de uma autoridade.', correct: false, feedback: 'Sem verificar a autenticidade nem a base legal, isso pode ser um golpe, e o cliente (controlador) nem foi consultado.' },
        { text: 'Enviar só nome e e-mail dentro do prazo, para reduzir o risco, e pedir os demais dados quando o ofício for confirmado.', correct: false, feedback: 'Continua sendo envio de dados pessoais sem verificar o pedido.' },
        { text: 'Não enviar nada; acionar Jurídico/Privacidade e Segurança para verificar por canal oficial independente, tratando como possível golpe.', correct: true, feedback: 'Correto. Urgência, ameaça e domínio suspeito são sinais de fraude, e pedidos de autoridade passam pelo Jurídico.' },
        { text: 'Ligar para o telefone que consta no próprio e-mail para confirmar o ofício antes de decidir sobre o envio da lista.', correct: false, feedback: 'Confirmar pelo contato informado no e-mail suspeito é circular. A verificação usa um canal oficial independente, via Jurídico.' },
      ],
    },
    {
      id: 'p09-s12',
      situation:
        'O comercial recebeu a oferta de uma "lista de 50 mil contatos de gestores de TI, 100% adequada à LGPD, com WhatsApp e e-mail". O vendedor garante que todos "aceitaram receber ofertas" e pede pagamento hoje, com desconto. A amostra enviada não informa onde nem quando houve consentimento. O time quer disparar uma campanha na semana que vem.',
      question: 'Qual é a postura mais adequada?',
      options: [
        { text: 'Não comprar nem disparar antes de Privacidade validar origem, base legal e contrato; garantia verbal não basta.', correct: true, feedback: 'Certo. É o mesmo tipo de falha do caso da Telekall: ter o contato não significa ter base legal para usá-lo.' },
        { text: 'Comprar a lista, mas disparar a campanha só por e-mail, que é menos invasivo que WhatsApp, e responder a quem reclamar.', correct: false, feedback: 'O canal não cria base legal. A origem e a finalidade continuam sem validação.' },
        { text: 'Comprar a lista e incluir link de descadastro em todas as mensagens, removendo da base quem pedir para sair da campanha.', correct: false, feedback: 'O descadastro é boa prática, mas não substitui a base legal.' },
        { text: 'Comprar só uma amostra pequena e testar a reação dos gestores antes de decidir sobre a lista completa de 50 mil contatos.', correct: false, feedback: 'Testar já é tratar dados, e a amostra também precisa de base legal.' },
      ],
    },
    {
      id: 'p09-s13',
      situation:
        'Uma analista vai publicar em uma página interna ampla um painel "anonimizado" de absenteísmo. Ela removeu nome e CPF, mas manteve cargo, CEP, data de nascimento, data de admissão e motivo do afastamento (inclusive saúde). Em unidades pequenas há apenas uma pessoa por cargo e CEP.',
      question: 'O que a análise deve concluir?',
      options: [
        { text: 'Está anonimizado: sem nome e CPF, ninguém consegue saber quem é a pessoa por trás de cada linha do painel.', correct: false, feedback: 'Combinados, cargo, CEP e datas permitem identificar pessoas, e o motivo de afastamento é dado de saúde.' },
        { text: 'Basta restringir o painel aos gestores da empresa, mantendo todos os campos, já que eles precisam acompanhar o absenteísmo.', correct: false, feedback: 'Reduz o público, mas a identificação continua possível, e os gestores precisam de justificativa para ver dado de saúde.' },
        { text: 'Basta renomear o arquivo para dados anonimizados e avisar o time de que o painel já passou pela revisão.', correct: false, feedback: 'O rótulo não anonimiza nada.' },
        { text: 'Não está anonimizado: agregar por área e faixas, retirar o motivo detalhado e limitar quem vê, validando com Privacidade.', correct: true, feedback: 'Exato. Anonimizar exige que a reidentificação não seja razoavelmente possível, e unidades pequenas pioram o risco.' },
      ],
    },
    {
      id: 'p09-s14',
      situation:
        'Um projeto com um cliente terminou. O contrato diz que, ao final, as bases recebidas devem ser devolvidas ou eliminadas, com comprovação. No inventário, o time encontra cópias da base em dois notebooks, em um drive pessoal na nuvem e em anexos antigos de e-mail. Alguém sugere guardar uma cópia "por garantia, caso o cliente reclame".',
      question: 'O que fazer?',
      options: [
        { text: 'Eliminar só as cópias dos notebooks e registrar a eliminação, tratando o drive pessoal e os e-mails como cópias de conveniência.', correct: false, feedback: 'O contrato vale para todas as cópias. Drive pessoal e anexos também são locais de guarda.' },
        { text: 'Seguir o contrato: localizar todas as cópias, eliminar ou devolver, registrar a evidência e avisar Segurança/Privacidade.', correct: true, feedback: 'Correto. Eliminar com comprovação cumpre o contrato, e a cópia em local pessoal precisa ser tratada como evento a reportar.' },
        { text: 'Guardar uma cópia criptografada por garantia, sem avisar o cliente, para o caso de ele reclamar do trabalho depois.', correct: false, feedback: 'Retenção sem base nem autorização não é permitida pela criptografia. Criptografar não cria o direito de guardar.' },
        { text: 'Eliminar as cópias e manter uma pasta de segurança que só o responsável pelo projeto conhece, para emergências.', correct: false, feedback: 'Uma cópia escondida é pior: some do inventário e do controle da empresa.' },
      ],
    },
    {
      id: 'p09-s15',
      situation:
        'A Segurança de uma consultoria percebe que um colaborador em aviso prévio (saída na semana que vem) copiou, nos últimos dois dias, um volume grande de arquivos de clientes com dados pessoais para um pen drive e para um e-mail pessoal. Um gestor próximo a ele quer "conversar primeiro" e já pensa em abrir o notebook dele para ver o que foi copiado.',
      question: 'Qual é a conduta mais adequada do gestor?',
      options: [
        { text: 'Conversar com o colaborador e pedir que apague tudo, sem registrar nada, para resolver de forma discreta.', correct: false, feedback: 'Pode destruir evidências e alertar o colaborador, sem registro e sem acionar quem decide.' },
        { text: 'Abrir o notebook para checar o que foi copiado, já que o equipamento é da empresa e o gestor responde pela equipe.', correct: false, feedback: 'Acesso ad hoc, fora de procedimento, pode violar a privacidade do colaborador e comprometer evidências.' },
        { text: 'Não confrontar nem abrir o equipamento; acionar Segurança e RH/Jurídico, preservar evidências e seguir o procedimento.', correct: true, feedback: 'Certo. Incidente interno também é incidente: reportar rápido, preservar evidências e deixar quem tem competência conduzir.' },
        { text: 'Aguardar a saída dele e só depois verificar se aparece algum problema, para não criar um clima ruim no time e perder a equipe.', correct: false, feedback: 'Os dados já saíram. Esperar só amplia a janela de exposição.' },
      ],
    },
  ],
  understand:
    'O QUE SE REPETE NOS 15 CASOS? Em quase todos, a resposta certa combina mais de uma ideia: coletar o mínimo, proteger o dado sensível, ter contrato e instrução clara, usar o canal aprovado e acionar quem tem competência (Privacidade, Segurança, Jurídico).\n\n' +
    'ARMADILHAS COMUNS: 1) Segurança sem necessidade: criptografar ou colocar senha não justifica coletar ou guardar demais; 2) Velocidade sem validação: urgência e pressão são sinais de alerta; 3) Confiança no rótulo: "aprovada", "anonimizada" ou "100% LGPD" não substituem análise; 4) Silêncio: corrigir sem relatar impede avaliar o impacto.\n\n' +
    'ATENÇÃO: este conteúdo é educativo. Nos casos reais, a decisão final sobre base legal, contratos e comunicações cabe a [inserir responsável jurídico/privacidade Opah].',
  goodPractices: [
    'Pergunte sempre: que dados, para quê, quem acessa, por qual canal e quem decide.',
    'Dado sensível e dado de crianças pedem cuidado e justificativa reforçados.',
    'Ferramenta aprovada, contrato com o fornecedor e instruções do cliente são coisas diferentes: confira as três.',
    'Em incidente, reporte de imediato, preserve evidências e deixe a contenção e a comunicação com quem tem competência.',
    'Desconfie de urgência, ameaça e domínio parecido: verifique por um canal oficial independente.',
    'Elimine ou devolva dados ao fim do projeto conforme o contrato, com comprovação.',
  ],
  references: [
    { label: 'Lei 13.709/2018 (LGPD), texto oficial no Planalto', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm' },
    { label: 'ANPD: materiais educativos e publicações (guias orientativos)', url: 'https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes' },
    { label: 'Aprofunde: cursos de LGPD da Enap/EV.G (confirme vagas e certificado na plataforma)', url: 'https://serpro.gov.br/menu/noticias/noticias-2022/curso-lgpd-enap' },
  ],
};

export const FINAL_VISUALS: Record<string, ScenarioVisual> = {
  'p09-s1': {
    kind: 'email', from: 'candidata.exemplo@exemplo.test', to: 'recrutamento@empresa-exemplo.test',
    subject: 'Candidatura: Analista de Dados (PCD)',
    attachments: ['curriculo_candidata.pdf', 'laudo_medico.pdf'],
    body: ['Olá! Segue meu currículo (com foto, estado civil e CPF) e o laudo que comprova minha deficiência, para concorrer pela cota.'],
  },
  'p09-s2': {
    kind: 'log', title: 'Proposta de configuração de log',
    lines: ['nivel: DEBUG (producao)', 'campos: corpo_completo_da_requisicao (nome, CPF, e-mail, token de sessao)', 'acesso: todos os devs + fornecedor de monitoramento', 'retencao: 2 anos'],
  },
  'p09-s3': {
    kind: 'email', from: 'contato@analytics-exemplo.test', to: 'produto@empresa-exemplo.test',
    subject: 'Ative em 5 minutos',
    body: ['Basta colar o código no app e aceitar os termos online.', 'Os dados coletados (e-mail, ID do dispositivo, localização aproximada) são armazenados em nossos servidores no exterior.'],
  },
  'p09-s4': {
    kind: 'chat', channel: 'Registro da chamada (resumo)',
    messages: [{ who: 'Ligante', text: 'Perdi meu celular e preciso trocar o e-mail da conta agora. Pode confirmar o CPF e o endereço que aparecem aí? O gerente da conta, o Fulano, sabe quem eu sou.' }],
  },
  'p09-s5': {
    kind: 'form', title: 'Formulário da promoção (rascunho)',
    fields: [{ label: 'Nome da criança', required: true }, { label: 'Idade (8 a 12 anos)', required: true }, { label: 'Escola', required: true }, { label: 'Foto da criança' }, { label: '"Ao participar você concorda com os termos"' }],
    note: 'Não há campo para o responsável legal.',
  },
  'p09-s6': {
    kind: 'sheet', title: 'folha_pagamento_mes.xlsx',
    columns: ['Nome', 'CPF', 'Salário', 'Conta bancária', 'CID do afastamento'],
    rows: [
      ['Pessoa Exemplo 1', CPF, 'R$ 0,00', 'Ag. 0000 · C/C 00000-0', '(vazio)'],
      ['Pessoa Exemplo 2', CPF, 'R$ 0,00', 'Ag. 0000 · C/C 00000-0', 'CID informado'],
    ],
    note: 'Envio mensal por e-mail comum, sem contrato atualizado com o escritório.',
  },
  'p09-s7': {
    kind: 'log', title: 'Console do provedor de nuvem (resumo)',
    lines: ['bucket: backup-clientes-exemplo   acesso: PUBLICO (leitura)', 'conteudo: backup com nome, CPF e endereco de usuarios finais', 'ultima alteracao de permissao: ha 41 dias', 'leituras de IPs desconhecidos: 37 nas ultimas semanas'],
  },
  'p09-s8': {
    kind: 'email', from: 'ex.colaborador@exemplo.test', to: 'contato@empresa-exemplo.test',
    subject: 'Pedido sobre meus dados: resposta hoje',
    body: ['Quero (1) cópia de todos os e-mails internos que citam meu nome e (2) a eliminação imediata do meu histórico de folha e ponto.', 'Se não houver resposta hoje, vou acionar a ANPD.'],
  },
  'p09-s9': {
    kind: 'chat', channel: 'Time de suporte',
    messages: [
      { who: 'Líder de suporte', text: 'A ferramenta de IA é aprovada pela empresa, então dá para jogar os tickets lá, certo?' },
      { who: 'Analista', text: 'Alguns tickets têm CPF e até relato de saúde dos usuários. E o contrato com o cliente não fala de IA.' },
    ],
  },
  'p09-s10': {
    kind: 'form', title: 'Escopo solicitado pelo cliente',
    fields: [{ label: 'Captura do rosto na entrada e saída' }, { label: 'Armazenamento do template facial' }, { label: 'Acesso do RH ao histórico completo' }],
    note: 'Justificativa do cliente: "é mais moderno e evita fraude".',
  },
  'p09-s11': {
    kind: 'email', from: 'oficio@delegacia-digital-exemplo.test', to: 'ti@empresa-exemplo.test',
    subject: 'URGENTE: Ofício 4821/2026',
    body: ['Em 2 horas, enviar a lista completa de usuários (nome, CPF, e-mail e endereço) da plataforma do cliente.', 'O descumprimento acarretará responsabilização.'],
    flag: 'Domínio não institucional, prazo de 2 horas e pedido de lista completa',
  },
  'p09-s12': {
    kind: 'sheet', title: 'amostra_lista_gestores_ti.csv',
    columns: ['Nome', 'Cargo', 'E-mail', 'WhatsApp', 'Origem do consentimento'],
    rows: [
      ['Pessoa Exemplo 1', 'Gestor de TI', 'pessoa1@exemplo.test', '(00) 00000-0000', 'não informado'],
      ['Pessoa Exemplo 2', 'Gestora de TI', 'pessoa2@exemplo.test', '(00) 00000-0000', 'não informado'],
    ],
    note: 'Oferta: "100% adequada à LGPD". A amostra não mostra onde nem quando houve consentimento.',
  },
  'p09-s13': {
    kind: 'sheet', title: 'painel_absenteismo.xlsx',
    columns: ['Cargo', 'CEP', 'Nascimento', 'Admissão', 'Motivo do afastamento'],
    rows: [
      ['Coordenadora', '00000-000', '00/00/0000', '00/00/0000', 'Tratamento de saúde'],
      ['Analista', '00000-001', '00/00/0000', '00/00/0000', 'Licença médica'],
    ],
    note: 'Nome e CPF removidos. Em unidades pequenas há uma pessoa por cargo e CEP.',
  },
  'p09-s14': {
    kind: 'log', title: 'Inventário: onde está a base do cliente',
    lines: ['notebook A (pasta Downloads)', 'notebook B (pasta do projeto)', 'drive pessoal na nuvem', 'anexos de e-mail (3 mensagens antigas)', 'contrato: devolver ou eliminar ao final, com comprovação'],
  },
  'p09-s15': {
    kind: 'log', title: 'Alertas de prevenção de perda de dados (resumo)',
    lines: ['colaborador: C-1127 (aviso prévio, saída na próxima semana)', '19 arquivos com CPF copiados para dispositivo USB', '8 anexos enviados para e-mail pessoal', 'periodo: ultimos 2 dias'],
  },
};
