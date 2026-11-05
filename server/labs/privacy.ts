/**
 * Trilha de Privacidade e LGPD — conteúdo educativo para TODOS os colaboradores.
 *
 * RASCUNHO para revisão humana (Privacidade/Jurídico) antes de uso externo.
 * - Cenários 100% fictícios: nenhum dado pessoal, cliente ou caso real.
 * - Não afirma obrigatoriedade legal de treinamento, nem prazos regulatórios não confirmados.
 * - Pontos a validar estão marcados com [ ... ].
 * - O gabarito (índice correto) fica SOMENTE aqui; o front recebe apenas o texto das opções.
 */

export interface PrivacyRef { label: string; url: string; }

import { PRIVACY_CASES, MODULE_CASES, MODULE_DIAGRAM, SCENARIO_VISUALS } from './privacyExtras.js';
import type { PrivacyCase, ScenarioVisual } from './privacyExtras.js';
import { FINAL_MODULE, FINAL_VISUALS } from './privacyFinal.js';

export interface PrivacyOption {
  text: string;
  /** Explicação mostrada ao escolher esta opção. */
  feedback: string;
  correct: boolean;
}

export interface PrivacyScenario {
  id: string;
  situation: string;
  question: string;
  options: PrivacyOption[];
}

export interface Safeguard { id: string; title: string; ig?: 1 | 2 | 3; }

export interface PrivacyModuleDefinition {
  id: string;
  /** Rótulo curto do módulo na lista (ex.: "C05"); padrão: P + ordem. */
  code?: string;
  /** Salvaguardas do controle (trilha CIS). */
  safeguards?: Safeguard[];
  /** Casos reais próprios do módulo (trilha CIS); na Privacidade vêm de MODULE_CASES. */
  cases?: PrivacyCase[];
  order: number;
  title: string;
  summary: string;
  /** Duração estimada (premissa editorial, a validar com o piloto). */
  minutes: number;
  legalBasis: string;
  context: string;
  scenarios: PrivacyScenario[];
  understand: string;
  goodPractices: string[];
  references: PrivacyRef[];
}

const LEI: PrivacyRef = { label: 'Lei 13.709/2018 (LGPD), texto oficial no Planalto', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm' };
const ANPD_PUB: PrivacyRef = { label: 'ANPD: materiais educativos e publicações (guias orientativos)', url: 'https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes' };
const CURSOS: PrivacyRef[] = [
  { label: 'Aprofunde: cursos de LGPD da Enap/EV.G (confirme vagas e certificado na plataforma)', url: 'https://serpro.gov.br/menu/noticias/noticias-2022/curso-lgpd-enap' },
  { label: 'Aprofunde: curadoria de cursos de LGPD (EGGP/UFF)', url: 'https://capacitacaoeggp.vr.uff.br/wp-content/uploads/2024/08/Curadoria-EGGP-Cursos-LGPD.pdf' },
];

export const PRIVACY_MODULES: PrivacyModuleDefinition[] = [
  {
    id: 'p01', order: 1,
    title: 'O que é dado pessoal e dado sensível',
    summary: 'Reconheça quando uma informação identifica alguém, antes de copiar, enviar ou guardar.',
    minutes: 10,
    legalBasis: 'LGPD, art. 5º (definições de dado pessoal e dado pessoal sensível)',
    context:
      'O QUE É DADO PESSOAL? É toda informação relacionada a uma pessoa natural identificada ou identificável: nome, CPF, e-mail, telefone, endereço, número de IP, identificador de usuário. Um dado que parece "anônimo" sozinho pode identificar alguém quando combinado com outro.\n\n' +
      'O QUE É DADO SENSÍVEL? Dados sobre origem racial ou étnica, convicção religiosa, opinião política, filiação sindical, saúde, vida sexual, e dados genéticos ou biométricos. Pedem mais cuidado porque o uso indevido pode gerar discriminação.\n\n' +
      'NA PRÁTICA: antes de copiar, enviar ou guardar uma informação, pergunte "isso identifica alguém, sozinho ou junto com outra informação?". Se sim, trate como dado pessoal.',
    scenarios: [
      {
        id: 'p01-s1',
        situation: 'Você recebe uma planilha fictícia de testes com as colunas: nome, CPF, e-mail corporativo, cargo e "atestado médico (anexo)".',
        question: 'Como classificar essas informações?',
        options: [
          { text: 'Só o CPF é dado pessoal, por ser o único documento oficial; o resto é informação comum de trabalho.', correct: false, feedback: 'Nome, e-mail e cargo também identificam a pessoa, sozinhos ou combinados. Dado pessoal não se limita a documentos.' },
          { text: 'Nome, CPF, e-mail e cargo são dados pessoais; o atestado médico é dado sensível.', correct: true, feedback: 'Isso mesmo. Informação de saúde é dado sensível e pede cuidado reforçado: acesso restrito e só quando necessário.' },
          { text: 'Nenhuma é dado pessoal, porque a planilha é só de teste e não sai da rede interna da empresa.', correct: false, feedback: 'O uso interno não muda a natureza do dado. Se a planilha tem dados reais, ela continua sendo dado pessoal; para testes, prefira dados fictícios.' },
        ],
      },
      {
        id: 'p01-s2',
        situation: 'Um log de aplicação registra endereço IP, navegador e o ID interno do usuário em cada acesso.',
        question: 'Esse log contém dado pessoal?',
        options: [
          { text: 'Não, porque IP, navegador e ID interno são dados técnicos de funcionamento e não identificam ninguém.', correct: false, feedback: 'Dado técnico pode ser dado pessoal quando permite identificar alguém ou torná-lo identificável.' },
          { text: 'Pode conter: IP e ID de usuário podem identificar a pessoa, principalmente quando combinados com outras bases.', correct: true, feedback: 'Exato. Por isso logs também precisam de acesso controlado, finalidade clara e prazo de guarda definido.' },
          { text: 'Só seria dado pessoal se o log tivesse o nome completo ou o CPF do usuário gravado junto.', correct: false, feedback: 'Identificar não exige o nome. Basta que a pessoa seja identificável pelo conjunto de informações.' },
        ],
      },
    ],
    understand:
      'POR QUE A CLASSIFICAÇÃO IMPORTA? A forma de proteger depende do tipo de dado. Dado pessoal exige finalidade, base legal e segurança; dado sensível exige ainda mais rigor, porque o dano ao titular é maior se ele vazar ou for mal usado.\n\n' +
      'O ERRO MAIS COMUM é achar que só "documento" ou "dado de cliente" conta. Informações de colaboradores, candidatos, parceiros e usuários também são dados pessoais, e informações técnicas podem identificar alguém.',
    goodPractices: [
      'Pergunte "isso identifica alguém?" antes de copiar, enviar ou arquivar.',
      'Em testes e demonstrações, use dados fictícios ou anonimizados.',
      'Trate informação de saúde, biometria e afins como sensível: acesso mínimo e restrito.',
      'Na dúvida sobre a classificação, consulte o canal de privacidade [inserir canal do encarregado/DPO].',
    ],
    references: [LEI, ANPD_PUB, ...CURSOS],
  },
  {
    id: 'p02', order: 2,
    title: 'Princípios e bases legais',
    summary: 'Por que posso tratar este dado, para quê, e só o que for necessário.',
    minutes: 12,
    legalBasis: 'LGPD, art. 6º (princípios), art. 7º e art. 11 (bases legais)',
    context:
      'POR QUE PRECISO DE UMA JUSTIFICATIVA? Todo tratamento de dado pessoal precisa de uma base legal (art. 7º; para dados sensíveis, art. 11) e deve respeitar os princípios do art. 6º.\n\n' +
      'OS PRINCÍPIOS QUE MAIS APARECEM NO DIA A DIA: 1) Finalidade: usar o dado só para o propósito informado ao titular; 2) Necessidade: coletar e manter só o mínimo para essa finalidade; 3) Segurança: proteger o dado contra acesso indevido e vazamento.\n\n' +
      'NA PRÁTICA: um dado coletado para uma finalidade não pode ser reaproveitado livremente para outra. Antes de usar de um jeito novo, valide com a área de privacidade.',
    scenarios: [
      {
        id: 'p02-s1',
        situation: 'O time comercial fictício quer usar a lista de e-mails de pessoas que abriram chamados de suporte para divulgar um produto novo.',
        question: 'O que você faz?',
        options: [
          { text: 'Usa a lista, porque os e-mails já estão na base da empresa e o comercial é da mesma organização.', correct: false, feedback: 'Estar na base não autoriza qualquer uso. O dado foi coletado para suporte; usar em marketing é outra finalidade.' },
          { text: 'Verifica a compatibilidade da nova finalidade e a base legal, falando com Privacidade antes de usar.', correct: true, feedback: 'Correto. A compatibilidade da finalidade e a base legal precisam ser avaliadas antes, e não depois do envio.' },
          { text: 'Usa a lista e inclui um link de descadastro bem visível em todos os e-mails da campanha.', correct: false, feedback: 'O link de descadastro é uma boa prática, mas não substitui a base legal nem a análise de finalidade.' },
        ],
      },
      {
        id: 'p02-s2',
        situation: 'O formulário de inscrição de um webinar fictício pede CPF, data de nascimento e endereço completo, só para enviar o link da transmissão.',
        question: 'Qual o melhor ajuste?',
        options: [
          { text: 'Manter os campos: CPF e endereço podem ser úteis no futuro, em outra campanha ou para contato.', correct: false, feedback: 'Coletar "para o caso de precisar" fere o princípio da necessidade.' },
          { text: 'Coletar só o que o envio exige, como nome e e-mail, e cortar os demais campos.', correct: true, feedback: 'Isso mesmo. Quanto menos dado coletado, menor o risco e menor o que há para proteger.' },
          { text: 'Manter os campos, mas guardar tudo em uma pasta restrita, com acesso só para o time de eventos.', correct: false, feedback: 'Proteger bem é importante, mas não corrige o excesso. Segurança não substitui necessidade.' },
        ],
      },
    ],
    understand:
      'POR QUE OS DOIS CASOS ERRAM? No primeiro, o dado foi desviado da finalidade original; no segundo, foi coletado além do necessário. Em ambos, o problema nasce antes da segurança: é uma decisão sobre se deveria tratar o dado.\n\n' +
      'COMO PENSAR: finalidade (para quê?), necessidade (só o mínimo?) e base legal (com que justificativa?). Se uma das três não fecha, pare e consulte Privacidade.',
    goodPractices: [
      'Defina a finalidade antes de coletar e registre-a.',
      'Colete o mínimo; evite campos "para o futuro".',
      'Não reutilize dado para fins novos sem validar finalidade e base legal.',
      'Descadastro e transparência ajudam, mas não substituem a base legal.',
    ],
    references: [LEI, ANPD_PUB, ...CURSOS],
  },
  {
    id: 'p03', order: 3,
    title: 'Direitos do titular',
    summary: 'O que fazer quando uma pessoa pede acesso, correção ou exclusão dos próprios dados.',
    minutes: 10,
    legalBasis: 'LGPD, art. 18 (direitos do titular)',
    context:
      'QUAIS SÃO OS DIREITOS? O titular pode, entre outros, confirmar se há tratamento, acessar seus dados, corrigir dados incorretos, pedir anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos, pedir portabilidade e saber com quem os dados foram compartilhados. O art. 18 lista o conjunto completo.\n\n' +
      'QUEM RESPONDE? Não é você, individualmente. As solicitações seguem um fluxo próprio, com validação de identidade e análise de cada caso.\n\n' +
      'NA PRÁTICA: se alguém pedir qualquer coisa sobre os próprios dados, registre e encaminhe de imediato ao canal responsável [inserir canal do encarregado/DPO], sem prometer prazo nem enviar dados por conta própria.',
    scenarios: [
      {
        id: 'p03-s1',
        situation: 'Uma pessoa física fictícia escreve ao gerente de um projeto: "Quero receber todos os dados que vocês têm sobre mim."',
        question: 'Qual a atitude correta?',
        options: [
          { text: 'Ignorar o pedido, porque dados de titulares não são da área do gerente de projeto.', correct: false, feedback: 'Ignorar deixa o pedido sem resposta. Mesmo sem ser seu papel, é seu dever encaminhar.' },
          { text: 'Juntar o que encontrar nas pastas do projeto e responder diretamente à pessoa, para ganhar tempo.', correct: false, feedback: 'Responder por conta própria arrisca enviar dado a quem não é o titular e entregar informação incompleta. A identidade precisa ser validada.' },
          { text: 'Registrar e encaminhar de imediato ao canal de privacidade, sem enviar dados antes da validação.', correct: true, feedback: 'Correto. O fluxo oficial valida a identidade, busca em todas as fontes e responde no padrão da empresa.' },
        ],
      },
      {
        id: 'p03-s2',
        situation: 'Um ex-candidato fictício pede a exclusão de todos os seus dados. Parte deles pode precisar ser mantida por exigência legal.',
        question: 'O que fazer?',
        options: [
          { text: 'Apagar tudo imediatamente, em todos os sistemas, para atender ao pedido do ex-candidato.', correct: false, feedback: 'Pode haver dados que precisam ser guardados por obrigação legal ou para defesa em processos. A decisão exige análise.' },
          { text: 'Encaminhar ao canal de privacidade para decidir o que se elimina e o que se mantém.', correct: true, feedback: 'Isso mesmo. A análise caso a caso define o que será eliminado e o que será mantido, com justificativa ao titular.' },
          { text: 'Responder que a empresa não apaga dados de candidatos, porque a política interna não permite.', correct: false, feedback: 'Negar de forma genérica não é adequado. O titular tem direitos, e a resposta precisa ser fundamentada pelo canal responsável.' },
        ],
      },
    ],
    understand:
      'POR QUE ENCAMINHAR? Atender direitos do titular exige verificar identidade, localizar dados em vários sistemas e avaliar exceções. Quem responde sozinho tende a errar para os dois lados: entregar demais ou negar sem fundamento.\n\n' +
      'SEU PAPEL é simples e decisivo: reconhecer que se trata de um pedido de titular e acionar o canal certo rapidamente.',
    goodPractices: [
      'Reconheça pedidos como "o que vocês sabem sobre mim?" ou "apaguem meus dados" como pedidos de titular.',
      'Encaminhe de imediato ao canal de privacidade; guarde o registro da solicitação.',
      'Não prometa prazo nem envie dados antes da validação de identidade.',
      'Não apague dados por conta própria para "resolver" o pedido.',
    ],
    references: [LEI, ANPD_PUB, ...CURSOS],
  },
  {
    id: 'p04', order: 4,
    title: 'Dado pessoal no dia a dia',
    summary: 'E-mail, chat, planilhas, prints e ferramentas de IA: onde o dado mais escapa.',
    minutes: 12,
    legalBasis: 'LGPD, art. 6º (necessidade e segurança) e política interna da organização',
    context:
      'ONDE O DADO PESSOAL ESCAPA? Quase sempre em gestos comuns: e-mail para o destinatário errado, print de tela com dados em um chat amplo, planilha em pasta aberta, base copiada para teste, e texto colado em ferramentas de IA externas.\n\n' +
      'FERRAMENTAS DE IA: não cole dado pessoal, dado de cliente ou conteúdo sob NDA em ferramentas de IA não aprovadas pela empresa. Prefira dados fictícios ou anonimizados e use apenas ferramentas homologadas.\n\n' +
      'NA PRÁTICA: compartilhe o mínimo, com quem precisa, pelo canal aprovado.',
    scenarios: [
      {
        id: 'p04-s1',
        situation: 'Você precisa resumir uma planilha fictícia de reclamações com nome e CPF de cada cliente e pensa em usar uma ferramenta de IA aberta.',
        question: 'O que fazer?',
        options: [
          { text: 'Colar a planilha inteira, porque a ferramenta aberta resume mais rápido e o prazo é curto.', correct: false, feedback: 'Isso envia dado pessoal a um serviço externo sem controle. Velocidade não justifica o risco.' },
          { text: 'Anonimizar os identificadores antes, ou usar uma ferramenta aprovada pela empresa.', correct: true, feedback: 'Correto. Sem identificadores, o risco cai muito; e ferramentas homologadas têm regras de uso definidas.' },
          { text: 'Colar só metade das linhas, para reduzir a quantidade de dados pessoais que sai da empresa.', correct: false, feedback: 'Menos linhas ainda são dados pessoais enviados para fora. O problema não é o volume.' },
        ],
      },
      {
        id: 'p04-s2',
        situation: 'Para ilustrar um erro, você tem um print de tela com dados de uma pessoa e quer enviá-lo a um grupo grande de chat.',
        question: 'Qual a melhor conduta?',
        options: [
          { text: 'Enviar o print, porque o grupo é interno e só tem colaboradores da empresa.', correct: false, feedback: 'Ser interno não elimina o risco. Muita gente com acesso a dado desnecessário amplia a chance de vazamento.' },
          { text: 'Mascarar os dados pessoais (ou usar dados fictícios) e compartilhar só com quem precisa.', correct: true, feedback: 'Isso mesmo. Mostrar o problema não exige mostrar a pessoa.' },
          { text: 'Enviar o print e apagar a mensagem logo depois, para limitar o tempo de exposição.', correct: false, feedback: 'Quem viu ou baixou já tem o conteúdo. Apagar depois não desfaz o compartilhamento.' },
        ],
      },
    ],
    understand:
      'POR QUE O DIA A DIA É O RISCO MAIOR? Grande parte dos incidentes não vem de ataques sofisticados, e sim de decisões rápidas e bem-intencionadas: mandar para o grupo errado, colar onde não devia, copiar para "facilitar".\n\n' +
      'O PRINCÍPIO que resolve os dois casos é o mesmo: necessidade. Se o objetivo é resumir ou ilustrar, a pessoa por trás do dado não precisa aparecer.',
    goodPractices: [
      'Mascare ou anonimize antes de compartilhar prints, planilhas e textos.',
      'Não cole dado pessoal, de cliente ou sob NDA em IA externa não aprovada.',
      'Confira destinatários antes de enviar e-mails com anexos.',
      'Armazene e compartilhe apenas pelos canais aprovados, com acesso mínimo.',
    ],
    references: [LEI, ANPD_PUB, ...CURSOS],
  },
  {
    id: 'p05', order: 5,
    title: 'Papéis: controlador, operador e encarregado',
    summary: 'Quem decide, quem executa e quem é o canal de comunicação.',
    minutes: 10,
    legalBasis: 'LGPD, arts. 5º, 37 e 41; ANPD, Guia orientativo de agentes de tratamento e encarregado',
    context:
      'QUEM É QUEM? O controlador decide as finalidades e os meios do tratamento. O operador trata dados em nome do controlador, seguindo as instruções dele. O encarregado é o canal de comunicação entre o controlador, os titulares e a ANPD.\n\n' +
      'UM MESMO NEGÓCIO PODE TER PAPÉIS DIFERENTES: uma organização pode ser controladora dos dados dos próprios colaboradores e operadora dos dados que trata em nome de um cliente. O papel depende do caso concreto e do contrato.\n\n' +
      'NA PRÁTICA: antes de usar uma base de cliente, confirme o papel no contrato e as instruções documentadas.',
    scenarios: [
      {
        id: 'p05-s1',
        situation: 'Em um projeto fictício, a equipe desenvolve um sistema para um cliente e acessa a base de usuários dele para validar a migração.',
        question: 'Qual é, em geral, o papel da equipe em relação a essa base?',
        options: [
          { text: 'Controladora, porque tem acesso à base de usuários e define como a migração será feita.', correct: false, feedback: 'Ter acesso não faz de ninguém controlador. Quem decide finalidade e meios é o controlador.' },
          { text: 'Tipicamente operadora, tratando os dados em nome do cliente, conforme o contrato.', correct: true, feedback: 'Correto. O contrato e as instruções documentadas definem o que pode ser feito com o dado.' },
          { text: 'Encarregada, porque lida com proteção de dados e atende pedidos de titulares do projeto.', correct: false, feedback: 'O encarregado é o canal de comunicação (titulares e ANPD), não o papel de quem trata dados em projeto.' },
        ],
      },
      {
        id: 'p05-s2',
        situation: 'O cliente fictício pede, por mensagem informal, para usar a mesma base em outra finalidade que não consta no contrato.',
        question: 'Como agir?',
        options: [
          { text: 'Fazer o que o cliente pede, porque ele é quem define a finalidade do tratamento.', correct: false, feedback: 'O cliente decide, mas dentro do que foi formalizado. Uso novo precisa de instrução documentada e análise.' },
          { text: 'Checar se o uso consta no contrato e, se não constar, acionar Jurídico/Privacidade antes.', correct: true, feedback: 'Isso mesmo. Primeiro formalizar e validar; depois executar.' },
          { text: 'Fazer agora, para não atrasar o cliente, e documentar a instrução formalmente na semana seguinte.', correct: false, feedback: 'Documentar depois não corrige um uso que já aconteceu fora do combinado.' },
        ],
      },
    ],
    understand:
      'POR QUE O PAPEL IMPORTA? Ele define responsabilidades: quem responde ao titular, quem decide o uso do dado e quem pode ser responsabilizado por um desvio. Quem opera dados em nome de outro age dentro das instruções recebidas.\n\n' +
      'ATENÇÃO: a classificação exata de papéis em cada contrato é uma análise jurídica. Use este módulo para o raciocínio, e valide o caso concreto com [inserir responsável jurídico/privacidade].',
    goodPractices: [
      'Leia as instruções de tratamento do contrato antes de usar dados de cliente.',
      'Pedidos fora do escopo contratado devem ser formalizados antes de executados.',
      'Saiba quem é o encarregado e como acioná-lo [inserir canal do encarregado/DPO].',
      'Na dúvida sobre o papel da organização em um projeto, consulte Jurídico/Privacidade.',
    ],
    references: [LEI, ANPD_PUB, { label: 'ANPD: Guia orientativo, definições dos agentes de tratamento e do encarregado', url: 'https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-agentes-de-tratamento-e-encarregado-versao-1-0-defeso-eleitoral.pdf/@@display-file/file' }, ...CURSOS],
  },
  {
    id: 'p06', order: 6,
    title: 'Incidentes com dados pessoais',
    summary: 'O que reportar, a quem e por que a velocidade importa.',
    minutes: 12,
    legalBasis: 'LGPD, art. 48; ANPD, guias orientativos (incidentes e segurança da informação)',
    context:
      'O QUE É UM INCIDENTE? Qualquer evento adverso que comprometa a confidencialidade, integridade ou disponibilidade de dados pessoais: e-mail enviado ao destinatário errado, notebook perdido ou roubado, base exposta publicamente, acesso indevido.\n\n' +
      'QUEM DECIDE SE COMUNICA À ANPD? A comunicação à ANPD e aos titulares cabe ao controlador (art. 48), e nem todo incidente precisa ser comunicado: a avaliação considera se há risco ou dano relevante. Essa análise não é sua; o seu papel é reportar rápido. O prazo de comunicação segue a regulamentação da ANPD [validar texto vigente no site da ANPD].\n\n' +
      'NA PRÁTICA: reporte imediatamente à Segurança da Informação e ao encarregado [inserir canal do encarregado/DPO]. Não apague evidências e não tente resolver sozinho.',
    scenarios: [
      {
        id: 'p06-s1',
        situation: 'Você enviou por engano um e-mail com planilha fictícia de clientes a um destinatário externo errado.',
        question: 'O que fazer agora?',
        options: [
          { text: 'Pedir ao destinatário que apague o e-mail e confirme por escrito, sem avisar mais ninguém.', correct: false, feedback: 'Sem registro, a empresa não consegue avaliar o risco nem agir no prazo. Quem decide a gravidade não é você.' },
          { text: 'Reportar na hora ao canal de segurança/privacidade, descrevendo o que foi enviado e para quem.', correct: true, feedback: 'Correto. Reportar rápido permite avaliar o risco e, se necessário, cumprir os prazos de comunicação.' },
          { text: 'Esperar alguns dias para ver se o destinatário reclama, e só então acionar a segurança.', correct: false, feedback: 'Esperar atrasa a resposta e aumenta o dano potencial. Em incidente, tempo é fator crítico.' },
        ],
      },
      {
        id: 'p06-s2',
        situation: 'Seu notebook corporativo, com arquivos de projeto, foi roubado durante uma viagem.',
        question: 'Qual a primeira ação?',
        options: [
          { text: 'Pedir outro equipamento ao TI e seguir o trabalho normalmente, sem comentar o caso com ninguém.', correct: false, feedback: 'O equipamento pode dar acesso a dados. Sem relato, não há como bloquear acessos nem avaliar o risco.' },
          { text: 'Reportar na hora à Segurança da Informação, informando quais dados havia no notebook.', correct: true, feedback: 'Isso mesmo. Com a informação rápida, a equipe pode bloquear acessos e avaliar o impacto.' },
          { text: 'Avisar o gestor só na semana seguinte, quando voltar da viagem e puder explicar pessoalmente.', correct: false, feedback: 'Cada hora de atraso amplia a janela de exposição. O relato deve ser imediato.' },
        ],
      },
    ],
    understand:
      'POR QUE REPORTAR MESMO NA DÚVIDA? Quem tem o quadro completo (volume, tipo de dado, risco ao titular) é a área de Segurança e Privacidade. Você tem uma peça do quebra-cabeça: o que aconteceu e quando. Relatar rápido é o que permite tomar decisões a tempo.\n\n' +
      'NÃO EXISTE "INCIDENTE PEQUENO DEMAIS" para ser reportado: classificar a gravidade é função de quem tem a visão completa.',
    goodPractices: [
      'Reporte de imediato: o que aconteceu, quando, quais dados e quem pode estar envolvido.',
      'Não apague mensagens, logs ou arquivos que sirvam de evidência.',
      'Não tente "consertar" sozinho nem comunicar clientes ou titulares por conta própria.',
      'Conheça o canal de reporte antes de precisar [inserir canal de Segurança da Informação e encarregado].',
    ],
    references: [LEI, ANPD_PUB, { label: 'ANPD: Guia orientativo, segurança da informação para agentes de pequeno porte', url: 'https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf/@@display-file/file' }, ...CURSOS],
  },
  {
    id: 'p07', order: 7,
    title: 'Compartilhar com cliente e terceiros',
    summary: 'Parceiros, fornecedores e clientes: o que pode circular, por onde e com qual contrato.',
    minutes: 10,
    legalBasis: 'LGPD, arts. 6º (necessidade e segurança) e 39 (operador); contratos e política interna da organização',
    context:
      'QUANDO COMPARTILHAR É ARRISCADO? Sempre que um dado pessoal sai do ambiente onde foi coletado: para um cliente, um parceiro, um fornecedor de ferramenta. Cada saída precisa de finalidade, de acesso mínimo e de um contrato que defina as responsabilidades.\n\n' +
      'NDA NÃO É CONTRATO DE TRATAMENTO: um acordo de confidencialidade protege sigilo de informação, mas não substitui as cláusulas sobre como o dado pessoal será tratado e protegido.\n\n' +
      'NA PRÁTICA: use dados fictícios sempre que possível; se o dado real for necessário, compartilhe o mínimo, por canal seguro aprovado.',
    scenarios: [
      {
        id: 'p07-s1',
        situation: 'O fornecedor fictício de uma ferramenta pede acesso à base de produção, com dados reais, "para ver como fica".',
        question: 'Qual a postura adequada?',
        options: [
          { text: 'Liberar o acesso, porque o fornecedor é parceiro conhecido há anos e de total confiança.', correct: false, feedback: 'Confiança não substitui necessidade nem contrato. O acesso a dados reais precisa ser justificado.' },
          { text: 'Oferecer dados fictícios ou mascarados; dado real só com contrato de proteção de dados.', correct: true, feedback: 'Correto. Em muitos casos, dados fictícios resolvem a necessidade sem expor ninguém.' },
          { text: 'Liberar o acesso, desde que o fornecedor assine um NDA e use a base só para a demonstração.', correct: false, feedback: 'O NDA protege o sigilo, mas não define como o dado pessoal será tratado nem resolve a necessidade.' },
        ],
      },
      {
        id: 'p07-s2',
        situation: 'Um cliente fictício pede que você envie, por e-mail comum, a lista de usuários com dados pessoais para conferência.',
        question: 'Como proceder?',
        options: [
          { text: 'Enviar o arquivo compactado, sem senha, pois o cliente já conhece o conteúdo da lista.', correct: false, feedback: 'Compactar não protege. E-mail comum sem proteção é um dos caminhos mais frequentes de vazamento.' },
          { text: 'Usar o canal seguro aprovado e enviar só os campos necessários para a conferência do cliente.', correct: true, feedback: 'Isso mesmo. Canal seguro e mínimo necessário reduzem o risco de exposição.' },
          { text: 'Enviar tudo por aplicativo de mensagem pessoal, que é mais rápido e o cliente já usa.', correct: false, feedback: 'Aplicativos pessoais ficam fora do controle da empresa e do cliente. Não são canais aprovados para dado pessoal.' },
        ],
      },
    ],
    understand:
      'O QUE LIGA OS DOIS CASOS? Em ambos, o dado sai do controle direto da empresa. O que reduz o risco é combinar três coisas: só o necessário, por canal seguro e com contrato claro.\n\n' +
      'LEMBRE-SE: o compartilhamento é uma decisão de tratamento, e não um favor de conveniência. Se o objetivo pode ser alcançado com dado fictício, é essa a escolha.',
    goodPractices: [
      'Prefira dados fictícios ou mascarados em demonstrações, testes e suporte a fornecedores.',
      'Compartilhe apenas pelos canais aprovados e com acesso mínimo.',
      'Confirme que existe contrato com cláusulas de proteção de dados antes de liberar dado real.',
      'NDA e contrato de tratamento de dados são documentos diferentes.',
    ],
    references: [LEI, ANPD_PUB, ...CURSOS],
  },
  {
    id: 'p08', order: 8,
    title: 'Privacidade em projetos',
    summary: 'Pense em dado pessoal desde o início: coletar o necessário, definir retenção e controlar acesso.',
    minutes: 12,
    legalBasis: 'LGPD, art. 6º (necessidade, segurança, prevenção) e art. 50 (governança e boas práticas)',
    context:
      'PRIVACIDADE DESDE O DESENHO. Pensar em dados pessoais no início do projeto custa menos do que corrigir no fim. As perguntas básicas: quais dados serão tratados, para quê, quem acessa, por quanto tempo ficam guardados e como serão eliminados.\n\n' +
      'QUANDO O RISCO É MAIOR, pode ser necessário um relatório de impacto à proteção de dados pessoais (RIPD). Consulte Privacidade para saber se o seu projeto se enquadra.\n\n' +
      'NA PRÁTICA: faça um pequeno inventário dos dados do projeto na fase de desenho e use dados fictícios ou anonimizados em ambientes de teste.',
    scenarios: [
      {
        id: 'p08-s1',
        situation: 'Um time fictício vai lançar um sistema que armazenará dados de usuários e pergunta quando mapear os dados pessoais.',
        question: 'Qual o momento certo?',
        options: [
          { text: 'Depois do lançamento, quando o sistema estiver estável e o time tiver mais folga na agenda.', correct: false, feedback: 'Corrigir depois é mais caro e arriscado. As decisões sobre dados já estarão tomadas no código.' },
          { text: 'No início do projeto, definindo quais dados, para quê, quem acessa e por quanto tempo.', correct: true, feedback: 'Correto. É a base da privacidade desde o desenho.' },
          { text: 'Somente se o cliente pedir o mapeamento ou se houver exigência formal prevista no contrato.', correct: false, feedback: 'Boas práticas não dependem de pedido. O cliente espera uma entrega responsável com os dados dele.' },
        ],
      },
      {
        id: 'p08-s2',
        situation: 'Para testar uma funcionalidade, pedem uma cópia da base de produção para o ambiente de homologação.',
        question: 'O que é mais adequado?',
        options: [
          { text: 'Copiar a base inteira para ter testes realistas e achar mais bugs.', correct: false, feedback: 'Ambientes de teste costumam ter menos controles. Dado real ali amplia muito o risco.' },
          { text: 'Usar dados fictícios ou anonimizados que reproduzam bem o cenário de teste.', correct: true, feedback: 'Isso mesmo. Dá o mesmo resultado de teste sem expor pessoas reais.' },
          { text: 'Copiar a base e proteger o arquivo com senha forte antes de levar.', correct: false, feedback: 'A senha ajuda, mas o ambiente e quem o acessa continuam expostos. A melhor medida é não levar dado real.' },
        ],
      },
    ],
    understand:
      'POR QUE "DESDE O INÍCIO"? As escolhas de arquitetura (quais campos, onde armazenar, quem acessa, quanto tempo guardar) são difíceis de desfazer depois. Pensar nelas cedo é mais barato e mais seguro.\n\n' +
      'COMO ISSO SE CONECTA AOS OUTROS MÓDULOS: finalidade e necessidade (módulo 2), acesso mínimo (módulo 4), contratos (módulo 7) e resposta a incidentes (módulo 6) entram no projeto desde o desenho.',
    goodPractices: [
      'Faça um inventário simples dos dados pessoais já na fase de desenho.',
      'Defina prazo de retenção e forma de eliminação.',
      'Use dados fictícios ou anonimizados em desenvolvimento e homologação.',
      'Consulte Privacidade para avaliar a necessidade de um RIPD em projetos de maior risco.',
    ],
    references: [LEI, ANPD_PUB, ...CURSOS],
  },
];

// Avaliação final (P09): 15 cenários complexos, definidos em privacyFinal.ts
PRIVACY_MODULES.push(FINAL_MODULE);

/** Embaralhamento determinístico das opções (semente = id do cenário): a correta não fica sempre na mesma posição. */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}
for (const m of PRIVACY_MODULES) {
  m.scenarios = m.scenarios.map((s) => {
    const rnd = seededRandom(s.id);
    const opts = [...s.options];
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    return { ...s, options: opts };
  });
}

// ───────── Projeções públicas (sem gabarito) ─────────

/** Catálogo enviado ao front: opções SEM `correct` e SEM `feedback`. Serve qualquer trilha. */
export function publicModules(list: PrivacyModuleDefinition[], visuals: Record<string, ScenarioVisual> = {}) {
  return list.map((m) => ({
    ...m,
    diagram: MODULE_DIAGRAM[m.id],
    cases: m.cases ?? (MODULE_CASES[m.id] ?? []).map((id) => PRIVACY_CASES[id]).filter(Boolean),
    scenarios: m.scenarios.map((s) => ({
      id: s.id,
      situation: s.situation,
      question: s.question,
      visual: SCENARIO_VISUALS[s.id] ?? FINAL_VISUALS[s.id] ?? visuals[s.id],
      options: s.options.map((o) => ({ text: o.text })),
    })),
  }));
}

export function publicPrivacyModules() { return publicModules(PRIVACY_MODULES); }

export function checkPrivacyAnswer(moduleId: unknown, scenarioId: unknown, optionIndex: unknown) {
  return checkAnswer(PRIVACY_MODULES, moduleId, scenarioId, optionIndex);
}

export function checkAnswer(list: PrivacyModuleDefinition[], moduleId: unknown, scenarioId: unknown, optionIndex: unknown):
  | { ok: true; correct: boolean; feedback: string }
  | { ok: false; error: string } {
  const mod = list.find((m) => m.id === moduleId);
  const scenario = mod?.scenarios.find((s) => s.id === scenarioId);
  if (!mod || !scenario) return { ok: false, error: 'cenário inexistente' };
  if (!Number.isInteger(optionIndex)) return { ok: false, error: 'opção inválida' };
  const option = scenario.options[optionIndex as number];
  if (!option) return { ok: false, error: 'opção inválida' };
  return { ok: true, correct: option.correct, feedback: option.feedback };
}
