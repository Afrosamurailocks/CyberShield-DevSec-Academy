/**
 * Cenários AVANÇADOS dos Controles CIS 1 a 9 (s3 = "Caso real, decisão sua"; s4 = avançado fictício com trade-offs).
 * 100% fictício (domínios .test, IPs RFC 5737 ou 10.x). Os cenários s3 se inspiram APENAS nos padrões já
 * descritos em cisCasesRest.ts e cisCases7to12.ts. Números de salvaguarda: seleção editorial a conferir no
 * CIS Controls Navigator v8.1. RASCUNHO para revisão humana (Segurança da Informação e AI Guild).
 */
import type { PrivacyScenario } from './privacy.js';
import type { ScenarioVisual } from './privacyExtras.js';
import { o } from './cisContentA.js';

export const CIS_ADVANCED_A: Record<number, { scenarios: PrivacyScenario[]; visuals: Record<string, ScenarioVisual> }> = {
  1: {
    scenarios: [
      {
        id: 'c01-s3',
        situation:
          'Você é o(a) responsável por infraestrutura na empresa-exemplo. A situação lembra o caso Colonial Pipeline, em que um perfil de VPN legado não apareceu nos testes de invasão, mas com um desdobramento: o pentest anual da empresa acabou de fechar com "nenhum achado crítico" e a diretoria quer arquivar o relatório hoje. Você compara o escopo do teste com a configuração real do concentrador de VPN. O escopo foi montado a partir do inventário de ativos. O concentrador tem perfis de acesso que não constam no inventário e, portanto, não foram testados. Um deles foi usado há dois dias.',
        question: 'Qual é a melhor decisão agora?',
        options: [
          o('Arquivar o relatório, pois o teste cumpriu o escopo contratado e a empresa passou sem achados críticos, e registrar a conclusão para a diretoria ainda hoje.', 'O teste só prova o que foi escopado. Perfis fora do inventário ficaram sem teste, então "sem achados" não vale para eles.'),
          o('Contratar um novo pentest completo com outro fornecedor e adiar qualquer ajuste na VPN até o resultado sair, previsto para algumas semanas.', 'Um novo teste usaria o mesmo inventário incompleto. Primeiro é preciso corrigir o que o teste não enxerga.'),
          o('Desativar hoje todos os perfis de VPN fora do inventário, sem consultar os donos, e comunicar a diretoria depois para eliminar o risco.', 'Um deles foi usado há dois dias e pode sustentar um processo legítimo. Desligar sem identificar o dono pode causar indisponibilidade.'),
          o('Tratar como achado de inventário (1.1 e 1.2): achar dono e uso de cada perfil, desativar o injustificado e reescopar o teste.', 'Correto. O erro de origem é o escopo depender de um inventário desatualizado. Corrigir o inventário e comparar com a realidade fecha a lacuna e torna o próximo teste confiável.', true),
        ],
      },
      {
        id: 'c01-s4',
        situation:
          'A empresa-exemplo roda uma fábrica com equipamentos de automação. A descoberta ativa (1.3) apontou 6 dispositivos desconhecidos na rede 10.60.0.0/24, ligada à linha de produção. O gerente de operações avisa que o controlador da linha reinicia quando recebe varredura agressiva e que uma parada custa caro. O time de segurança quer excluir a rede da varredura "para sempre". O diretor industrial só aceita mexer na linha no fim de semana. Existe ainda uma auditoria de cliente em 3 semanas que vai pedir o inventário completo.',
        question: 'Qual é a melhor abordagem?',
        options: [
          o('Excluir a rede 10.60.0.0/24 da varredura e registrar "ativos industriais fora de escopo" no inventário, com revisão anual pela Operação.', 'Excluir sem alternativa cria um ponto cego permanente, justamente onde há dispositivos desconhecidos.'),
          o('Manter a varredura ativa normal nessa rede, em horário comercial, pois a segurança tem prioridade sobre a produção.', 'Ignorar o impacto conhecido tende a gerar parada e, depois, resistência a qualquer varredura. O risco operacional precisa entrar na decisão.'),
          o('Usar descoberta passiva e consulta ao switch para identificar os 6 dispositivos, isolá-los com a Operação e agendar varredura leve no fim de semana.', 'Correto. Combina visibilidade sem risco à linha, dono definido (1.1), tratamento do que for não autorizado (1.2) e prazo realista antes da auditoria.', true),
          o('Pedir aos fornecedores a lista de equipamentos instalados e usá-la como inventário da linha, sem comparar com o tráfego real da rede.', 'A lista do fornecedor mostra o que foi vendido, não o que está ligado. Os 6 desconhecidos podem justamente não estar nela.'),
        ],
      },
    ],
    visuals: {
      'c01-s3': {
        kind: 'sheet',
        title: 'escopo_pentest_vs_perfis_vpn.csv',
        columns: ['Perfil VPN', 'No inventário?', 'No escopo do pentest?', 'Último uso', 'Autenticação'],
        rows: [
          ['vpn-equipe-ti', 'sim', 'sim', 'ontem', 'senha + MFA'],
          ['vpn-diretoria', 'sim', 'sim', 'hoje', 'senha + MFA'],
          ['vpn-migracao-2022', 'NÃO', 'NÃO', 'há 2 dias', 'somente senha'],
          ['vpn-forn-backup', 'NÃO', 'NÃO', 'há 90 dias', 'somente senha'],
        ],
        note: 'Dados fictícios. Escopo do pentest gerado a partir do inventário.',
      },
      'c01-s4': {
        kind: 'log',
        title: 'Descoberta ativa vs passiva (rede 10.60.0.0/24)',
        lines: [
          'descoberta ativa  10.60.0.31  resposta: sem fingerprint conhecido',
          'varredura ativa   10.60.0.12  controlador-linha-2  EVENTO: reinício em 4 s do início da varredura',
          'descoberta passiva (7 dias): 6 MACs sem registro; 2 falam protocolo industrial com 10.60.0.12',
          'inventário: 41 ativos industriais; dono definido em 33; auditoria de cliente em 21 dias',
        ],
        note: 'Dados fictícios.',
      },
    },
  },

  2: {
    scenarios: [
      {
        id: 'c02-s3',
        situation:
          'Você é o(a) responsável por segurança de plataforma na empresa-exemplo. Como no caso Log4Shell, saiu o alerta de uma biblioteca de compressão muito usada e a primeira pergunta é "onde isso roda?". Desdobramento: a busca nos repositórios próprios não achou nada, e o líder de arquitetura quer encerrar. Você nota que a empresa também opera, em produção, um appliance de um fornecedor-exemplo, entregue como imagem de contêiner fechada, que não está no SBOM interno. O fornecedor respondeu por e-mail "nosso produto não é afetado", sem versão nem evidência. O prazo do alerta interno é o fim do dia.',
        question: 'O que falta antes de encerrar o alerta?',
        options: [
          o('Aceitar a resposta do fornecedor e fechar o alerta no prazo, pois ele é o dono do produto e sabe o que há dentro da imagem.', 'Uma frase sem versão nem evidência não é inventário. Em Log4Shell, a dificuldade foi exatamente a biblioteca estar embutida em produtos de terceiros.'),
          o('Inspecionar as camadas da imagem do appliance por conta própria, mesmo violando os termos de uso, para confirmar a biblioteca.', 'Abrir o produto fora do contratado cria outro problema. O caminho é exigir a evidência do fornecedor, e não contorná-lo.'),
          o('Repetir a busca nos repositórios com outros termos e outras ferramentas de composição, já que a primeira pode ter falhado.', 'Melhora a cobertura interna, mas não alcança o appliance, que é a lacuna real.'),
          o('Inventariar o appliance (2.1), exigir SBOM ou declaração por componente do fornecedor e limitar a exposição dele.', 'Correto. A resposta precisa vir de dados, inclusive para produtos de terceiros, e o item fica registrado como risco em aberto, com mitigação.', true),
        ],
      },
      {
        id: 'c02-s4',
        situation:
          'A empresa-exemplo tem dois sistemas rodando em runtime sem suporte do fabricante (2.2). O portal de clientes, exposto à internet, guarda dados cadastrais. O sistema de relatórios fiscais é interno. A migração do portal leva cerca de 4 meses e o time só consegue tocar um projeto de cada vez. O financeiro pressiona para migrar primeiro o sistema fiscal, porque o fechamento do trimestre está próximo. Um cliente-exemplo vai auditar o fornecimento em 6 semanas. Há ainda uma ferramenta de captura de tela instalada por um dev, fora de qualquer lista de software autorizado.',
        question: 'Qual é a melhor priorização?',
        options: [
          o('Migrar primeiro o sistema fiscal, porque o fechamento do trimestre é o evento de maior pressão, e tratar o portal na etapa seguinte.', 'A pressão é real, mas o portal exposto sem suporte tem risco maior. O fiscal pode ser tratado com exceção e mitigação.'),
          o('Migrar o portal primeiro, mitigar agora (WAF, restrição de exposição), dar exceção com dono e prazo ao fiscal e tratar a ferramenta (2.3).', 'Correto. Prioriza o que está exposto, protege enquanto a migração não termina e não deixa o software não autorizado fora da gestão.', true),
          o('Pausar os dois projetos e pedir orçamento extra para migrar tudo ao mesmo tempo, com prazo a definir junto ao financeiro.', 'Esperar orçamento mantém o portal exposto por mais tempo. O risco precisa de medidas agora, não só de projeto futuro.'),
          o('Mostrar ao cliente só o plano de migração do portal e omitir o sistema fiscal por ser interno e sem exposição à internet.', 'Omitir o que está sem suporte afeta a credibilidade da empresa e não reduz o risco. A auditoria deve receber um quadro honesto, com plano e prazos [a definir pela liderança].'),
        ],
      },
    ],
    visuals: {
      'c02-s3': {
        kind: 'email',
        from: 'suporte@fornecedor-exemplo.test',
        to: 'seguranca@empresa-exemplo.test',
        subject: 'RE: Alerta sobre biblioteca de compressão',
        body: [
          'Prezados, nosso produto não é afetado pela falha divulgada.',
          'Pedimos que não executem varreduras no appliance, pois isso pode afetar o suporte.',
        ],
        flag: 'Sem versão, sem lista de componentes e sem evidência. Produto fora do SBOM interno.',
      },
      'c02-s4': {
        kind: 'sheet',
        title: 'inventario_software_riscos.csv',
        columns: ['Sistema', 'Suporte do fabricante', 'Exposição', 'Dados', 'Autorizado?'],
        rows: [
          ['Portal de clientes', 'ENCERRADO há 5 meses', 'Internet', 'Cadastrais de clientes', 'sim'],
          ['Relatórios fiscais', 'ENCERRADO há 9 meses', 'Interna', 'Financeiros', 'sim'],
          ['Captura de tela (dev)', 'ativo', 'Estação de dev', 'Possível tela de produção', 'NÃO'],
        ],
        note: 'Dados fictícios.',
      },
    },
  },

  3: {
    scenarios: [
      {
        id: 'c03-s3',
        situation:
          'Você é o(a) líder de engenharia de dados da empresa-exemplo. O caso lembra a Uber: uma chave de acesso em um site de código deu acesso a arquivos sem criptografia em nuvem. Aqui a varredura de segredos acusou uma chave de armazenamento num repositório privado e você a revogou em minutos. O desdobramento que o caso não trata: a mesma chave era usada por três pipelines em produção, que pararam, e a pressão da diretoria é "voltar tudo agora com uma chave nova igual". Ao revisar a política da chave, você vê que ela dava leitura e escrita em todos os buckets, inclusive o de exportações com dados de clientes, sem criptografia em repouso.',
        question: 'Qual é a decisão mais adequada para restabelecer o serviço e tratar a causa?',
        options: [
          o('Emitir uma chave nova com as mesmas permissões e guardá-la em arquivo de configuração fora do repositório, para os pipelines voltarem hoje.', 'Restabelece o serviço, mas repete o escopo amplo e mantém o segredo em arquivo. A causa que ampliou o dano continua.'),
          o('Manter os pipelines parados até a empresa toda migrar para um cofre de segredos, com cronograma a ser definido pela plataforma.', 'Uma migração completa é o destino, mas parar a produção por semanas é desproporcional quando existe uma solução intermediária segura.'),
          o('Criar uma credencial por pipeline com permissão mínima (3.3), em cofre, e criptografar o bucket de exportações (3.11).', 'Correto. Restabelece o serviço sem repetir o excesso de privilégio e trata a causa que amplia o dano: acesso largo e dado em texto puro.', true),
          o('Voltar com a chave antiga, já que o repositório é privado e o segredo não saiu da empresa, e revisar a política na próxima sprint.', 'Um segredo detectado em local não destinado a ele deve ser considerado exposto. Reativar o mesmo valor mantém o risco e anula a revogação.'),
        ],
      },
      {
        id: 'c03-s4',
        situation:
          'Um diretor da empresa-exemplo perdeu o notebook em um aeroporto. Ele guardava planilhas de propostas e extratos de um cliente-exemplo. O diretor garante: "o disco é criptografado, a política exige". O time de TI está pressionado para dar uma resposta ao cliente em duas horas. O painel de gerenciamento de dispositivos mostra, para este notebook, "criptografia: suspensa" desde uma atualização de firmware, três semanas atrás. O jurídico pergunta se pode dizer ao cliente que os dados estavam protegidos.',
        question: 'Qual é a primeira decisão?',
        options: [
          o('Confirmar o estado no MDM, bloquear e apagar o notebook, revogar sessões e informar ao jurídico que a criptografia estava suspensa.', 'Correto. A política (3.6) não prova o estado real. Contenção rápida e informação fiel ao jurídico evitam uma comunicação errada ao cliente.', true),
          o('Dizer ao cliente que os dados estavam criptografados, pois a política exige e o diretor confirmou, e investigar o painel depois.', 'A evidência do painel contradiz a política. Afirmar proteção sem prova pode ser pior que o incidente.'),
          o('Aguardar a localização do notebook antes de qualquer ação, para não apagar dados sem necessidade, e reavaliar em 24 horas.', 'Esperar mantém um dispositivo possivelmente desprotegido ao alcance de terceiros. Bloqueio e revogação podem ser feitos agora.'),
          o('Trocar a senha do diretor e retomar a comunicação com o cliente, tratando o notebook apenas como perda de equipamento.', 'A senha ajuda, mas não cobre tokens, sessões abertas nem dados locais do disco.'),
        ],
      },
    ],
    visuals: {
      'c03-s3': {
        kind: 'log',
        title: 'Política da chave revogada (resumo)',
        lines: [
          'chave: svc-pipelines  criada há 14 meses  usos: 3 pipelines de produção',
          'permissões: leitura e escrita em TODOS os buckets da conta',
          'bucket "exportacoes-clientes": criptografia em repouso: DESLIGADA',
          'varredura de segredos: encontrada em repo privado "infra-dados" (commit antigo)',
        ],
        note: 'Dados fictícios. Valor da chave omitido.',
      },
      'c03-s4': {
        kind: 'sheet',
        title: 'mdm_dispositivos_executivos.csv (trecho)',
        columns: ['Dispositivo', 'Dono', 'Criptografia de disco', 'Desde', 'Último check-in'],
        rows: [
          ['nb-dir-014', 'Diretoria', 'SUSPENSA (atualização de firmware)', 'há 21 dias', 'há 3 h'],
          ['nb-fin-022', 'Financeiro', 'ativa', 'há 8 meses', 'hoje'],
          ['nb-com-007', 'Comercial', 'ativa', 'há 11 meses', 'ontem'],
        ],
        note: 'Dados fictícios.',
      },
    },
  },

  4: {
    scenarios: [
      {
        id: 'c04-s3',
        situation:
          'Você é o(a) responsável pela migração de cargas para a nuvem da empresa-exemplo. A situação lembra o caso Capital One, em que o regulador destacou a avaliação de risco antes da migração e a demora em corrigir deficiências. Desdobramento: a auditoria interna listou 9 deficiências de configuração (regras do WAF e grupos de segurança) e as duas mais graves estão abertas há 5 meses, "aceitas" sem dono. A onda 3 da migração, com dados de clientes, está marcada para o mês que vem. O diretor comercial quer cumprir a data prometida a um cliente-exemplo.',
        question: 'Qual é a melhor decisão para a onda 3?',
        options: [
          o('Seguir com a onda 3 na data e corrigir as 9 deficiências em paralelo com o mesmo time, começando pelas de maior severidade.', 'Migrar dados de clientes sobre uma base com deficiências críticas conhecidas é o padrão que o caso real critica. Em paralelo, as correções disputam o mesmo time.'),
          o('Congelar toda migração por tempo indeterminado até zerar as 9 deficiências e só então reavaliar a data com o cliente-exemplo.', 'Exagera e não separa o que é crítico do que é rotina. Falta um critério com prazo.'),
          o('Corrigir as deficiências mais simples neste mês e abrir um novo ciclo de auditoria no fim do ano, mantendo a onda 3 na data.', 'Mexer só no fácil deixa as deficiências críticas, que são as que importam, sem tratamento e sem prazo.'),
          o('Exigir baseline (4.1), fechar as 2 deficiências graves com dono e prazo e migrar na data só cargas sem dados sensíveis.', 'Correto. Usa risco como critério de liberação, dá dono e prazo às deficiências e preserva parte da entrega ao negócio.', true),
        ],
      },
      {
        id: 'c04-s4',
        situation:
          'A empresa-exemplo vai colocar em produção um appliance de monitoramento comprado do fornecedor-exemplo. A varredura pré-produção encontrou a conta de fábrica ativa, um serviço de acesso remoto sem criptografia e uma comunidade SNMP padrão. O fornecedor diz que desativar o acesso remoto "invalida o suporte". A área de negócio quer o go-live na sexta, por contrato com um cliente-exemplo. O time de rede propõe apenas "bloquear essas portas no firewall e seguir".',
        question: 'Qual é a decisão mais equilibrada?',
        options: [
          o('Bloquear no firewall as portas do acesso remoto e do SNMP e manter o resto como está, por ser a solução mais rápida antes da sexta.', 'O firewall ajuda, mas deixa a conta padrão e o serviço inseguro dentro do equipamento. Uma regra alterada no futuro reabre tudo.'),
          o('Trocar a credencial padrão e desativar o serviço sem criptografia e o SNMP padrão (4.7 e 4.8), mantendo suporte por acesso sob demanda.', 'Correto. Elimina os padrões inseguros, mantém o suporte por um caminho aceitável e deixa a decisão com evidência registrada.', true),
          o('Fazer o go-live na sexta com tudo como veio e registrar uma exceção de 90 dias aprovada pela área de negócio do contrato.', 'Exceção sem mitigação, para itens que se resolvem com uma alteração simples, é risco aceito sem necessidade.'),
          o('Cancelar a compra do appliance e procurar outro fornecedor, aceitando o atraso no contrato com o cliente-exemplo e refazendo a avaliação.', 'Medida desproporcional. O problema é de configuração e de acesso de suporte, ambos tratáveis antes da produção.'),
        ],
      },
    ],
    visuals: {
      'c04-s3': {
        kind: 'sheet',
        title: 'auditoria_configuracao_nuvem.csv',
        columns: ['Achado', 'Severidade', 'Aberto há', 'Dono', 'Status'],
        rows: [
          ['WAF em modo apenas-detecção', 'Crítica', '150 dias', '(vazio)', 'Aceito'],
          ['Grupo de segurança 0.0.0.0/0 na porta de administração', 'Crítica', '152 dias', '(vazio)', 'Aceito'],
          ['Logs de balanceador desligados', 'Alta', '90 dias', 'Plataforma', 'Em análise'],
          ['Tags de dono ausentes (6 achados)', 'Baixa', '40 a 120 dias', 'Plataforma', 'Aberto'],
        ],
        note: 'Dados fictícios. Onda 3 inclui dados de clientes.',
      },
      'c04-s4': {
        kind: 'log',
        title: 'Varredura pré-produção do appliance (10.50.2.20)',
        lines: [
          'conta admin / senha de fábrica: ACEITA',
          'serviço de acesso remoto sem criptografia: porta 23 ABERTA',
          'SNMP v2: comunidade padrão "public" responde',
          'e-mail do fornecedor: "desativar o acesso remoto invalida o suporte"',
          'go-live: sexta-feira',
        ],
        note: 'Dados fictícios.',
      },
    },
  },

  5: {
    scenarios: [
      {
        id: 'c05-s3',
        situation:
          'Você é o(a) responsável por identidade na empresa-exemplo. O caso Midnight Blizzard começou em uma conta de teste sem MFA e chegou a uma aplicação de teste com acesso elevado. Seu desdobramento: a revisão de contas de usuário está limpa, mas ao olhar as contas de aplicação e de serviço você acha "app-teste-integracao", criada por um colaborador que saiu, com permissão para ler todas as caixas de e-mail e um segredo sem data de validade. O dono do inventário diz que "é só um teste antigo". O log mostra uso há três dias.',
        question: 'Qual deve ser a conduta?',
        options: [
          o('Apagar a aplicação agora, por ser de teste e o responsável já ter saído, e avisar o dono do inventário depois da remoção.', 'O uso recente indica que algo depende dela, ou que alguém a está usando. Apagar sem identificar impede investigar e pode derrubar um processo.'),
          o('Manter a aplicação e renovar o segredo com validade de 12 meses, sem alterar as permissões que ela tem hoje nas caixas.', 'Renovar sem reduzir permissões mantém o acesso a todas as caixas de e-mail com dono ausente.'),
          o('Investigar o uso recente, revogar o segredo, reduzir as permissões e inventariar contas de serviço (5.1).', 'Correto. O uso recente muda a decisão: primeiro entender e conter, depois reduzir privilégios, e só então remover. A lacuna de origem é o inventário não incluir contas de serviço.', true),
          o('Considerar o risco baixo, pois a aplicação não é de produção, e registrar a pendência para revisão no próximo ano.', 'Um ambiente de teste com acesso elevado é exatamente o caminho do caso real. Adiar um ano deixa o acesso aberto.'),
        ],
      },
      {
        id: 'c05-s4',
        situation:
          'A empresa-exemplo tem uma conta de administrador compartilhada, "adm-plantao", usada pelas três pessoas que fazem plantão de infraestrutura. A auditoria pede contas nominais e dedicadas ao administrativo (5.4). O time diz que, de madrugada, não dá para esperar aprovação de ninguém e que a conta compartilhada é "o que funciona". Ao revisar os logs da semana, você vê dois logins da mesma conta, no mesmo minuto, de dois locais distintos, sendo um deles fora do horário de plantão.',
        question: 'Qual é a melhor decisão?',
        options: [
          o('Manter a conta compartilhada e trocar a senha toda semana, guardando a nova senha em um cofre usado pelas três pessoas.', 'A rotação não atribui ações a pessoas e não impede o uso simultâneo de dois locais. A auditoria continuaria sem rastreabilidade.'),
          o('Proibir o plantão de madrugada para eliminar a necessidade da conta, atendendo as chamadas só em horário comercial normal.', 'Compromete a operação. O problema é a conta compartilhada, não o plantão.'),
          o('Dar permissão de administrador permanente às contas pessoais das três pessoas, para simplificar o plantão e a auditoria.', 'Reúne o uso diário e o administrativo na mesma conta e amplia o dano de um phishing. Contas dedicadas devem ser separadas.'),
          o('Investigar o login simultâneo, criar contas administrativas nominais com MFA e manter uma conta de emergência em cofre.', 'Correto. Resolve a rastreabilidade sem travar o plantão, e o login simultâneo é evidência que exige investigação imediata.', true),
        ],
      },
    ],
    visuals: {
      'c05-s3': {
        kind: 'sheet',
        title: 'revisao_contas_servico_e_apps.csv',
        columns: ['Conta ou app', 'Dono', 'Permissão', 'Segredo expira?', 'Último uso'],
        rows: [
          ['svc-backup', 'Infra', 'Leitura em volumes', 'sim', 'ontem'],
          ['app-teste-integracao', '(colaborador desligado)', 'Ler TODAS as caixas de e-mail', 'NÃO', 'há 3 dias'],
          ['svc-monitoria', 'Plataforma', 'Leitura de métricas', 'sim', 'hoje'],
        ],
        note: 'Dados fictícios.',
      },
      'c05-s4': {
        kind: 'log',
        title: 'Autenticações da conta adm-plantao (7 dias)',
        lines: [
          'ter 21:10  login  origem 10.20.5.14   (infra, plantão)',
          'qui 03:41  login  origem 10.20.5.14   (infra, plantão)',
          'sex 02:07  login  origem 198.51.100.77  (externo)',
          'sex 02:07  login  origem 10.20.5.14   (mesmo minuto)',
          'MFA: não exigido nesta conta  ·  contas com acesso: 3 pessoas + 1 script',
        ],
        note: 'Dados fictícios.',
      },
    },
  },

  6: {
    scenarios: [
      {
        id: 'c06-s3',
        situation:
          'Você é o(a) responsável pelo acesso remoto da empresa-exemplo. No caso Colonial Pipeline, o ponto não foi a falta de MFA no caminho oficial, e sim um perfil de VPN legado com autenticação de fator único. Aqui o portal novo tem MFA desde o ano passado, e a diretoria considera o assunto resolvido. Desdobramento: o gateway antigo continua ativo para um fornecedor-exemplo cujo cliente de VPN não suporta MFA, e o contrato do fornecedor depende desse acesso. O log do gateway antigo mostra o login de uma conta do fornecedor a partir de um IP incomum.',
        question: 'Qual é a melhor decisão?',
        options: [
          o('Considerar resolvido, pois o caminho oficial tem MFA e o legado é de uso restrito de um fornecedor conhecido, e revisar na próxima auditoria.', 'O atacante usa o caminho mais fraco, não o oficial. O login incomum no legado é a evidência de que ele está sendo tentado.'),
          o('Desligar hoje o gateway antigo, sem avisar o fornecedor, para eliminar o risco imediatamente e depois tratar o contrato.', 'Elimina o caminho, mas derruba um serviço contratado sem aviso e ainda não investiga o login incomum.'),
          o('Investigar o login, limitar o gateway antigo ao IP do fornecedor e exigir MFA em todos os caminhos externos (6.4).', 'Correto. Contém o risco atual, reduz a exposição do caminho legado e fecha a lacuna do MFA com uma data, sem romper o contrato de forma abrupta.', true),
          o('Exigir senha mais longa e troca mensal na conta do fornecedor, mantendo o gateway como está e sem prazo para migrar.', 'Senha forte não substitui MFA em acesso remoto, como mostra o próprio caso real. A conta com login incomum já poderia ter uma senha longa.'),
        ],
      },
      {
        id: 'c06-s4',
        situation:
          'O projeto de migração da empresa-exemplo terminou e o contrato de 40 consultores da consultoria-exemplo acaba hoje. O RH enviou a lista de desligamento com 38 nomes. Ao consultar o provedor de identidade, você encontra 43 contas ativas do domínio da consultoria, algumas com acesso a produção e ao repositório de código. O gerente do projeto pede para manter 6 pessoas por mais duas semanas "para o repasse", sem registro formal. O Jurídico quer que tudo seja feito até o fim do dia.',
        question: 'Qual é a melhor conduta?',
        options: [
          o('Revogar apenas os 38 nomes da lista do RH, por ser a fonte oficial, e tratar as demais contas na próxima revisão trimestral de acessos.', 'A lista do RH tem 5 contas a menos que o provedor de identidade. Revogar só a lista deixa 5 contas sem dono e sem justificativa.'),
          o('Manter as 6 pessoas com o mesmo acesso por duas semanas, pois o gerente do projeto é quem conduz o repasse e responde por elas.', 'O gerente pode pedir a extensão, mas ela precisa de escopo, aprovação e prazo. Manter acesso integral sem registro não é uma concessão controlada (6.1).'),
          o('Revogar hoje o acesso crítico da consultoria, conciliar a lista do RH com o IdP (6.2) e dar aos 6 do repasse acesso mínimo e temporário.', 'Correto. Prioriza o acesso crítico, reconcilia as 5 contas fora da lista, e atende ao repasse com escopo e prazo, sem abrir exceção informal.', true),
          o('Desativar as 43 contas hoje, sem exceção, e conduzir o repasse apenas com as equipes internas e a documentação existente.', 'Radical e sem alinhamento: pode comprometer o repasse. O acesso mínimo e temporário atende ao objetivo com o risco controlado.'),
        ],
      },
    ],
    visuals: {
      'c06-s3': {
        kind: 'log',
        title: 'Gateway legado vpn-legado.empresa-exemplo.test (últimos 7 dias)',
        lines: [
          'autenticação: usuário + senha (MFA: não suportado neste gateway)',
          'qua 10:12  conta fornecedor-ana  origem 198.51.100.40  (IP habitual do fornecedor)',
          'sex 04:55  conta fornecedor-ana  origem 203.0.113.88   (primeiro acesso deste IP, fora do horário)',
          'sex 04:58  acesso a 10.30.0.0/24 (rede de gestão)',
          'portal novo: MFA obrigatório para todos os perfis',
        ],
        note: 'Dados fictícios.',
      },
      'c06-s4': {
        kind: 'sheet',
        title: 'conciliacao_rh_vs_idp.csv (resumo)',
        columns: ['Fonte', 'Contas da consultoria', 'Com acesso a produção', 'Com acesso ao repositório'],
        rows: [
          ['Lista de desligamento do RH', '38', 'n/d', 'n/d'],
          ['Provedor de identidade (ativas)', '43', '17', '29'],
          ['Diferença (no IdP, não no RH)', '5', '2', '4'],
          ['Pedido do gerente de projeto (repasse)', '6 pessoas', 'sem escopo informado', 'sem prazo informado'],
        ],
        note: 'Dados fictícios.',
      },
    },
  },

  7: {
    scenarios: [
      {
        id: 'c07-s3',
        situation:
          'Você é o(a) responsável por gestão de vulnerabilidades na empresa-exemplo. No caso Equifax, mandaram corrigir em até 48 horas e ninguém verificou. Depois do incidente interno, vocês passaram a exigir verificação por varredura antes de fechar o chamado. Desdobramento: uma vulnerabilidade crítica em um servidor exposto à internet foi corrigida e o chamado está "verificado" pelo time. Ao abrir o relatório da varredura, você vê que o servidor aparece como "não vulnerável" porque a varredura foi pulada por tempo esgotado, três vezes seguidas. Há uma cobrança da diretoria para zerar os críticos até o fim do dia.',
        question: 'Qual é a melhor decisão?',
        options: [
          o('Fechar o chamado, pois o relatório da varredura não lista a vulnerabilidade para esse servidor, e cumprir a meta de zerar os críticos.', 'Ausência de resultado não é resultado negativo. Se o servidor não foi varrido, não houve verificação.'),
          o('Reabrir o chamado até haver varredura concluída com credenciais, tratando a falha de cobertura como lacuna do processo (7.5).', 'Correto. O ciclo só fecha com evidência positiva de que a falha sumiu e o host foi testado. A falha de cobertura passa a ser tratada como achado do processo.', true),
          o('Pedir ao responsável do servidor uma captura de tela da versão instalada e fechar o chamado com essa evidência ainda hoje.', 'Ajuda como evidência complementar, mas não substitui a varredura e não corrige a causa: o servidor ficando fora da cobertura.'),
          o('Excluir o servidor da varredura para o relatório não mostrar falha de cobertura e manter o chamado como verificado.', 'Esconde a lacuna em vez de resolvê-la, justamente em um servidor exposto à internet.'),
        ],
      },
      {
        id: 'c07-s4',
        situation:
          'A varredura da empresa-exemplo trouxe três itens e o time só consegue tratar dois nesta semana. A diretoria financeira pediu congelamento de mudanças no ERP até o fechamento do mês, em 5 dias. O item A é crítico (nota 9,8), em servidor de arquivos interno, sem exploração conhecida. O item B tem nota 7,5, está no portal de clientes exposto à internet, com exploração ativa conhecida e correção que exige 15 minutos de indisponibilidade. O item C é crítico (9,1), em sistema legado exposto só pela VPN, sem correção do fabricante. O responsável do portal teme reclamações de clientes pela parada.',
        question: 'Qual é a melhor priorização (7.2)?',
        options: [
          o('Corrigir primeiro A e C, que têm as notas mais altas, e deixar B para a janela normal da semana seguinte por ter nota menor.', 'A nota isolada engana. B está exposto e já é explorado na prática, e tem correção disponível.'),
          o('Tratar B agora em janela curta com aviso aos clientes, programar A fora do ERP e mitigar C (restringir acesso, monitorar) com plano de substituição.', 'Correto. Prioriza exposição e exploração conhecida, respeita o congelamento do ERP e dá um tratamento realista ao item sem correção.', true),
          o('Respeitar o congelamento e não alterar nenhum sistema até o fechamento do mês, em 5 dias, concentrando o time na revisão de logs.', 'O congelamento vale para o ERP. B está em outro sistema e não deve esperar 5 dias com exploração ativa.'),
          o('Tratar os três itens ao mesmo tempo com toda a equipe nesta semana, para não deixar nenhuma pendência antes do fechamento do mês.', 'Dispersa o time, aumenta o risco de erro e ignora que C não tem correção. Priorização existe por causa da capacidade limitada.'),
        ],
      },
    ],
    visuals: {
      'c07-s3': {
        kind: 'log',
        title: 'Relatório de varredura do chamado 5310',
        lines: [
          'chamado 5310: "corrigir vulnerabilidade crítica em srv-portal-02 (internet)"  status: VERIFICADO',
          'varredura 1: srv-portal-02  SKIPPED (timeout)',
          'varredura 2: srv-portal-02  SKIPPED (timeout)',
          'varredura 3: srv-portal-02  SKIPPED (timeout)',
          'achados abertos para srv-portal-02: 0  (sem varredura concluída)',
        ],
        note: 'Dados fictícios.',
      },
      'c07-s4': {
        kind: 'sheet',
        title: 'priorizacao_vulnerabilidades.csv',
        columns: ['Item', 'Nota', 'Exposição', 'Exploração conhecida', 'Correção disponível', 'Custo da mudança'],
        rows: [
          ['A  servidor de arquivos', '9,8', 'Interna', 'não', 'sim', 'janela noturna padrão'],
          ['B  portal de clientes', '7,5', 'Internet', 'SIM', 'sim', '15 min de indisponibilidade'],
          ['C  sistema legado', '9,1', 'Somente VPN', 'não', 'NÃO', 'substituição planejada'],
        ],
        note: 'Dados fictícios. Congelamento do ERP por 5 dias.',
      },
    },
  },

  8: {
    scenarios: [
      {
        id: 'c08-s3',
        situation:
          'Você é o(a) responsável pelo SOC da empresa-exemplo. O caso Storm-0558 ficou como exemplo de investigação limitada pela retenção de logs, com a causa provável tratada como hipótese. Aqui, depois de um incidente anterior, a retenção de autenticação foi ampliada para 180 dias. Desdobramento: um cliente-exemplo avisa de acessos estranhos a caixas de e-mail que podem ter começado há 60 dias. Os logs do provedor de identidade cobrem o período, mas os logs de acesso à plataforma de e-mail só ficam 30 dias no fornecedor e nunca foram exportados. O diretor quer um relatório conclusivo ainda hoje.',
        question: 'Como conduzir a conclusão e o que mudar?',
        options: [
          o('Concluir que a causa foi uma credencial vazada, por ser o cenário mais comum, e encerrar o caso com um relatório conclusivo hoje.', 'Sem evidência da plataforma de e-mail, a causa é uma hipótese. Apresentá-la como fato esconde a lacuna.'),
          o('Aumentar a retenção dos logs de autenticação para 365 dias e considerar o assunto resolvido, entregando o relatório hoje.', 'A lacuna estava em outra fonte. Aumentar o que já cobria o período não resolve o que ficou sem registro.'),
          o('Reportar a causa como hipótese, declarando a lacuna, e exportar os logs de e-mail ao armazenamento central (8.9, 8.10).', 'Correto. Separa fato de hipótese, extrai o máximo do que existe e corrige a fonte sem retenção, como a lição do caso real.', true),
          o('Pedir ao fornecedor da plataforma os logs dos últimos 60 dias e emitir o relatório só quando eles chegarem, sem versão parcial.', 'Pode ser tentado em paralelo, mas se o fornecedor não retém, o relatório fica parado sem prazo. Convém emitir uma versão com as lacunas declaradas.'),
        ],
      },
      {
        id: 'c08-s4',
        situation:
          'O orçamento de armazenamento de logs da empresa-exemplo vai ser cortado em 40%. O financeiro propõe reduzir a retenção de todas as fontes na mesma proporção. Um cliente-exemplo pediu, em contrato, 12 meses de registro dos acessos a seus dados [valor a validar com o Jurídico]. A privacidade lembra que guardar logs de depuração com dados pessoais por muito tempo é um problema. Os números mostram que um único sistema gera a maior parte do volume, quase todo de depuração, e que a autenticação é uma fração pequena do total.',
        question: 'Qual é a melhor decisão?',
        options: [
          o('Reduzir a retenção de todas as fontes na mesma proporção, aplicando o corte de 40% a cada sistema sem distinção de valor.', 'O corte linear atinge também autenticação e acesso aos dados do cliente, que são as fontes de maior valor para investigação.'),
          o('Manter toda a retenção atual e pedir orçamento adicional ao financeiro, pois logs de segurança não devem ser reduzidos de forma alguma.', 'Ignora o limite de orçamento e o volume de logs de baixo valor. A questão é como gastar melhor, não só quanto.'),
          o('Reter 12 meses de autenticação, ações administrativas e acesso a dados de clientes, manter curta a depuração e cortar o ruído do maior sistema.', 'Correto. A retenção segue o risco e a necessidade (8.1), preserva a evidência importante e atinge a meta de custo onde o valor é menor.', true),
          o('Cortar a retenção de autenticação, que ocupa pouco espaço, e preservar a do sistema mais ruidoso, que gera a maior parte do volume.', 'Inverte a lógica: corta o que tem maior valor para um incidente e preserva o que mais ocupa e menos ajuda.'),
        ],
      },
    ],
    visuals: {
      'c08-s3': {
        kind: 'sheet',
        title: 'cobertura_de_logs_incidente.csv',
        columns: ['Fonte de log', 'Retenção', 'Exportado ao central?', 'Cobre os últimos 60 dias?'],
        rows: [
          ['Provedor de identidade (autenticação)', '180 dias', 'sim', 'sim'],
          ['Plataforma de e-mail (acesso às caixas)', '30 dias no fornecedor', 'NÃO', 'NÃO'],
          ['Proxy web', '90 dias', 'sim', 'sim'],
        ],
        note: 'Dados fictícios. Cliente-exemplo relata acessos suspeitos.',
      },
      'c08-s4': {
        kind: 'sheet',
        title: 'volume_e_custo_logs.csv',
        columns: ['Fonte', 'Volume diário', 'Parte do total', 'Retenção atual', 'Valor para investigação'],
        rows: [
          ['App A (depuração verbosa)', '420 GB', '71%', '90 dias', 'baixo'],
          ['Acesso a dados de clientes', '60 GB', '10%', '90 dias', 'alto'],
          ['Ações administrativas', '15 GB', '3%', '90 dias', 'alto'],
          ['Autenticação', '12 GB', '2%', '90 dias', 'alto'],
          ['Demais fontes', '85 GB', '14%', '90 dias', 'médio'],
        ],
        note: 'Dados fictícios. Meta: reduzir o custo em 40%.',
      },
    },
  },

  9: {
    scenarios: [
      {
        id: 'c09-s3',
        situation:
          'Você é o(a) gerente de TI da empresa-exemplo. O caso de BEC do FBI mostra que o golpe costuma passar pelos filtros porque a mensagem é "limpa". Sua empresa já aplica DMARC com política de rejeição (9.5) e o financeiro se sente seguro. Desdobramento: chega, dentro de uma conversa real sobre uma fatura, um e-mail de um fornecedor-exemplo pedindo a troca da conta bancária. O domínio é o legítimo e a mensagem passa em SPF, DKIM e DMARC. O pedido é para "pagar hoje, pois a conta antiga foi bloqueada", e o financeiro pergunta se pode confiar, já que "a autenticação passou".',
        question: 'Qual é a orientação correta?',
        options: [
          o('Pagar, pois a mensagem veio do domínio legítimo e passou em SPF, DKIM e DMARC, e arquivar o e-mail no chamado da fatura.', 'A autenticação prova de qual domínio veio, não que o remetente é quem diz. Uma conta legítima comprometida passa nos três testes.'),
          o('Responder ao próprio e-mail pedindo que o fornecedor confirme a troca de conta e pagar assim que ele responder positivamente.', 'Se a conta do fornecedor estiver controlada por um golpista, a confirmação virá do próprio golpista.'),
          o('Bloquear de forma permanente o domínio do fornecedor em todas as caixas e abrir um chamado para a Segurança investigar o caso.', 'Pode interromper uma relação legítima e não resolve: o problema é o pedido, não o domínio.'),
          o('Segurar o pagamento, confirmar a troca pelo telefone já cadastrado e reportar à Segurança, avisando o fornecedor.', 'Correto. A verificação por outro canal é a barreira decisiva, mesmo com DMARC em dia. O aviso ao fornecedor também protege a cadeia.', true),
        ],
      },
      {
        id: 'c09-s4',
        situation:
          'O time comercial da empresa-exemplo reclama de propostas atrasadas: o filtro de e-mail bloqueia anexos compactados e arquivos HTML. A diretora comercial pede para liberar todo o domínio de três clientes-exemplo. A Segurança vê, na quarentena, que a maioria das mensagens bloqueadas é de uma campanha de phishing com anexo HTML. Uma mensagem legítima de um cliente foi retida. O time de TI tem uma proposta de portal de troca de arquivos, mas só estará pronto em três semanas.',
        question: 'Qual é a melhor solução?',
        options: [
          o('Liberar os três domínios inteiros, já que são clientes conhecidos, e revisar a lista de liberados em seis meses.', 'Domínios de clientes também podem ser falsificados ou comprometidos. Liberar o domínio inteiro tira uma camada de defesa de todos os tipos de arquivo.'),
          o('Desativar o bloqueio de anexos compactados e HTML para toda a empresa até o portal de troca de arquivos ficar pronto.', 'Resolve o atraso, mas expõe todos a uma campanha ativa que a própria quarentena mostra.'),
          o('Manter o bloqueio, liberar a mensagem legítima após sandbox e criar exceção com dono e prazo, com antimalware (9.7) ativo.', 'Correto. Resolve o caso de negócio de forma controlada, mantém a proteção contra a campanha e dá uma saída temporária com data para acabar.', true),
          o('Orientar o time a pedir aos clientes que renomeiem as extensões dos arquivos para passar no filtro, enquanto o portal não chega.', 'Ensina a contornar o controle e normaliza uma prática que o phishing também usa.'),
        ],
      },
    ],
    visuals: {
      'c09-s3': {
        kind: 'email',
        from: 'financeiro@fornecedor-exemplo.test',
        to: 'contas-a-pagar@empresa-exemplo.test',
        subject: 'RE: Fatura 2291 - atualização de dados bancários',
        body: [
          'Boa tarde. A conta antiga foi bloqueada. Por favor, pague hoje a fatura 2291 na conta abaixo.',
          'Banco 000  Ag. 0000  Conta 00000-0 (dados fictícios). Não ligue, estamos em auditoria.',
        ],
        flag: 'Cabeçalhos: spf=pass dkim=pass dmarc=pass. Reply-To aponta para outro domínio; pedido de urgência e de não ligar.',
      },
      'c09-s4': {
        kind: 'sheet',
        title: 'quarentena_de_email_7_dias.csv (resumo)',
        columns: ['Tipo de bloqueio', 'Mensagens', 'Avaliadas como maliciosas', 'Legítimas'],
        rows: [
          ['Anexo HTML', '9', '8', '1 (cliente-exemplo)'],
          ['Anexo compactado com senha', '5', '5', '0'],
          ['Anexo compactado sem senha', '3', '2', '1'],
        ],
        note: 'Dados fictícios. Portal de troca de arquivos: previsto em 3 semanas.',
      },
    },
  },
};
