/**
 * Cenários AVANÇADOS dos Controles CIS 10 a 18 (dois por controle: s3 inspirado em caso real, s4 100% fictício).
 * Situações fictícias (domínios .test, IPs RFC 5737/10.x). Os casos reais citados usam apenas os fatos já presentes
 * em cisCases7to12.ts e cisCasesRest.ts. A numeração das salvaguardas segue cisControls.ts (seleção editorial a conferir na fonte oficial).
 * RASCUNHO para revisão humana (Segurança da Informação).
 */
import { o } from './cisContentA.js';
import type { PrivacyScenario } from './privacy.js';
import type { ScenarioVisual } from './privacyExtras.js';

export const CIS_ADVANCED_B: Record<number, { scenarios: PrivacyScenario[]; visuals: Record<string, ScenarioVisual> }> = {
  10: {
    scenarios: [
      {
        id: 'c10-s3',
        situation:
          'Você é o(a) responsável pela infraestrutura de uma rede de clínicas da empresa-exemplo. A situação é parecida com a do caso WannaCry no NHS: houve um aviso interno para atualizar os sistemas, mas ninguém verifica se o aviso virou ação. A planilha de confirmação das unidades marca tudo como "ok", preenchida pelos próprios gerentes locais. Hoje a proteção de endpoints alertou uma tentativa de propagação por compartilhamento de arquivos a partir de um PC de recepção. Um inventário rápido, feito agora, mostra que três estações de equipamentos de exame ainda rodam um Windows sem suporte, e o fabricante do equipamento diz que não homologa atualização. A diretoria clínica pede que nada pare de atender hoje.',
        question: 'Qual é a melhor decisão agora?',
        options: [
          o('Confiar na planilha de confirmação e tratar o alerta como falso positivo isolado, pois as unidades declararam estar atualizadas.', 'Autodeclaração sem verificação é exatamente a lacuna do caso real: o aviso existiu, mas não havia como checar o cumprimento. O inventário mostra o contrário.'),
          o('Conter o PC da recepção, verificar o estado real por inventário (não pela planilha) e isolar as estações sem suporte.', 'Correto. Combina contenção do alerta, verificação independente e redução do alcance do que não pode ser corrigido (salvaguardas 10.1 e 12.2). Mantém o atendimento sem deixar a máquina frágil na rede geral.', true),
          o('Desligar da rede todas as estações de exame das três unidades imediatamente, até concluir a atualização do sistema operacional.', 'Para o atendimento sem necessidade e sem resolver a causa: o fabricante não homologa a atualização, então o desligamento não teria data de fim.'),
          o('Instalar uma segunda ferramenta antimalware nas estações sem suporte, já que elas não podem ser atualizadas, e manter a rede como está.', 'Ajuda um pouco, mas antimalware não substitui correção nem segmentação. As estações continuam alcançáveis pela mesma rede por onde o alerta surgiu.'),
        ],
      },
      {
        id: 'c10-s4',
        situation:
          'O time de desenvolvimento da empresa-exemplo reclama que o antimalware deixa o build lento: a compilação passou de 6 para 19 minutos, e uma entrega para o cliente-exemplo.test vence na sexta. O líder técnico pede ao time de segurança uma exclusão de varredura para toda a pasta C:\\dev. O gerente de produto apoia, citando o prazo contratual. O analista de segurança lembra que a política exige aprovação por escrito de qualquer exclusão. Ao pedir a evidência, o analista abre o histórico de detecções e vê que a pasta C:\\dev\\tools teve uma detecção na semana passada, ainda sem conclusão do chamado.',
        question: 'O que o time de segurança deve decidir?',
        options: [
          o('Aprovar a exclusão de C:\\dev inteira por 30 dias, com revisão ao final, pois o prazo comercial é concreto e a pasta é de uso interno.', 'A exclusão ampla esconde justamente a pasta com detecção em aberto. Prazo é razão para otimizar, não para cegar a ferramenta onde há sinal de problema.'),
          o('Negar qualquer exclusão e pedir que o time aceite o build lento até a entrega, para não abrir exceção na política de segurança.', 'É seguro, mas ignora o negócio e empurra o time a contornar o controle (desativar a proteção por conta própria), que é pior.'),
          o('Investigar a detecção em C:\dev\tools e aprovar uma exclusão estreita só para a pasta de saída do build, com escopo e prazo.', 'Correto. Resolve a lentidão no ponto real, preserva a cobertura onde há sinal de risco e mantém a exceção documentada (salvaguardas 10.1 e 10.2).', true),
          o('Pedir que o time rode os builds em um notebook pessoal sem antimalware, mais rápido, e copie o resultado depois para a rede.', 'Move o código e o artefato para fora do controle da empresa. O atalho cria um problema maior que a lentidão.'),
        ],
      },
    ],
    visuals: {
      'c10-s3': { kind: 'sheet', title: 'conformidade_atualizacao_unidades.xlsx (confirmação x inventário de hoje)', columns: ['Unidade', 'Confirmação do gerente', 'Estações com SO sem suporte (inventário)', 'Segmento de rede'], rows: [['Clínica Centro', 'ok, 100% atualizado', '0', 'rede geral'], ['Clínica Norte', 'ok, 100% atualizado', '3 (equipamentos de exame)', 'rede geral'], ['Clínica Sul', 'ok, 100% atualizado', '0', 'rede geral']], note: 'Dados fictícios. O alerta de propagação veio de PC da recepção da unidade Norte.' },
      'c10-s4': { kind: 'chat', channel: 'Segurança x Dev · pedido de exclusão', messages: [{ who: 'Líder dev', text: 'Preciso excluir C:\\dev da varredura hoje. Build foi de 6 para 19 min e entregamos na sexta.' }, { who: 'Gerente de produto', text: 'É contrato com o cliente-exemplo.test. Dá pra aprovar logo?' }, { who: 'Analista SI', text: 'Antes: o histórico mostra detecção "Trojan.Generic" em C:\\dev\\tools em 28/10, chamado ainda aberto sem conclusão.' }] },
    },
  },

  11: {
    scenarios: [
      {
        id: 'c11-s3',
        situation:
          'Você é o(a) responsável por continuidade de TI de uma indústria da empresa-exemplo. A situação é parecida com a do caso Norsk Hydro: os sistemas poderiam ser reconstruídos a partir de backups, mas a recuperação seria complexa e as operações precisariam rodar em modo manual enquanto isso, com processos administrativos como faturamento atrasando. Em um teste de restauração desta semana, os dados voltaram sem erro. Porém o tempo total ficou muito acima do que o negócio espera, e o faturamento só volta depois do diretório de identidades. A diretoria financeira quer assinar com um cliente um compromisso de retomada em 8 horas. Hoje ninguém definiu a ordem de restauração nem o procedimento manual de faturamento.',
        question: 'Qual é a melhor condução?',
        options: [
          o('Assinar o compromisso de 8 horas, pois os dados restauraram sem erro, e ganhar velocidade durante o incidente real.', 'Dado restaurado não é o mesmo que serviço restaurado. A medição aponta mais de 8 horas, então o compromisso nasceria descumprido.'),
          o('Comprar mais armazenamento de backup para guardar mais cópias e só depois decidir sobre o plano de recuperação.', 'Mais cópias não reduzem o tempo de recuperação nem resolvem a ordem de dependências. O problema medido é o prazo, não a quantidade de dados.'),
          o('Restaurar todos os sistemas em paralelo na próxima simulação, sem definir ordem de dependência, para encurtar o prazo total.', 'Sem respeitar dependências (identidades antes do ERP), a paralelização pode travar sistemas sem base e piorar o tempo, além de sobrecarregar a infraestrutura.'),
          o('Documentar a ordem de restauração por dependência, repetir o teste medindo o tempo e definir o faturamento manual.', 'Correto. Une plano, teste e operação manual, como no caso real, e dá à diretoria um número sustentado por medição (salvaguardas 11.1 e 11.5). Qualquer compromisso externo deve vir depois e passar por revisão jurídica.', true),
        ],
      },
      {
        id: 'c11-s4',
        situation:
          'A empresa-exemplo migrou o CRM para um serviço SaaS. A diretoria comercial afirma que "backup é problema do fornecedor", e o orçamento de TI do ano já foi fechado. Ontem, um administrador percebeu que cerca de 4 mil contatos e oportunidades foram apagados em massa por uma importação mal feita há 45 dias, e o time quer recuperá-los. O jurídico lembra que há contrato com o cliente-exemplo.test que depende desses registros para o fechamento do trimestre. O fornecedor oferece um módulo de backup pago, mas caro, e propõe uma reunião na semana que vem.',
        question: 'Qual é a decisão mais sólida?',
        options: [
          o('Aceitar o risco e pedir ao fornecedor, por cortesia, uma restauração pontual dos registros apagados há 45 dias.', 'Depender de cortesia não é plano. A evidência mostra que a retenção do fornecedor é menor que o intervalo em que o dano foi percebido.'),
          o('Contratar de imediato o módulo de backup pago para todos os módulos do CRM, sem analisar retenção ou restauração parcial.', 'Pode ser necessário, mas fechar sem analisar retenção e restauração parcial gasta o orçamento sem garantir cobertura das entidades que realmente importam.'),
          o('Exportar por API as entidades críticas do CRM para uma cópia isolada, com teste de restauração, e registrar o risco residual.', 'Correto. O SaaS não elimina a necessidade de cópia própria sob seu controle (salvaguardas 11.2, 11.4 e 11.5), e o custo é calibrado pelo que é crítico, com risco residual explícito.', true),
          o('Orientar o time comercial a manter planilhas manuais paralelas de todos os contatos, atualizadas toda semana, para o caso de novo problema.', 'Planilha paralela sem controle cria dado duplicado, desatualizado e fora das proteções do sistema. Não substitui uma cópia isolada e testável.'),
        ],
      },
    ],
    visuals: {
      'c11-s3': { kind: 'sheet', title: 'plano_restauracao_teste.xlsx', columns: ['Sistema', 'Depende de', 'Prazo que o negócio quer', 'Tempo medido no teste'], rows: [['Diretório de identidades (AD/DNS)', '(nenhum)', '2 h', '5 h'], ['ERP e faturamento', 'Diretório de identidades', '8 h', '14 h (após o diretório)'], ['Fileserver', 'Diretório de identidades', '12 h', '9 h (após o diretório)'], ['Procedimento manual de faturamento', '(não existe)', '-', '-']], note: 'Dados fictícios. Os dados restauraram sem erro; o tempo total do ERP ficou em cerca de 19 h.' },
      'c11-s4': { kind: 'email', from: 'suporte@crm-fornecedor-exemplo.test', to: 'ti@empresa-exemplo.test', subject: 'Re: restauração de registros apagados', body: ['A lixeira de registros apagados mantém os itens por 30 dias. Após esse período não há restauração granular.', 'Itens apagados há 45 dias não estão mais na lixeira. Há exportação manual de dados, sem agendamento no plano atual.', 'O módulo de backup avançado é um adicional pago e pode ser apresentado em reunião.'], flag: 'Registros apagados há 45 dias, retenção de 30.' },
    },
  },

  12: {
    scenarios: [
      {
        id: 'c12-s3',
        situation:
          'Você é o(a) responsável pela rede da empresa-exemplo. A situação é parecida com a do caso Ivanti Connect Secure: falhas encadeadas em um gateway de acesso, persistência que sobrevive a um reset de fábrica e uma ferramenta de integridade do fabricante que não basta para detectar o comprometimento. No seu caso, o fabricante publicou a correção e a ferramenta de integridade rodou agora, com resultado "sem anomalias". A diretoria quer encerrar o assunto hoje, pois 400 pessoas dependem da VPN. Ao revisar os logs do gateway, porém, você vê conexões de saída fora do expediente e uma conta de serviço abrindo sessões internas incomuns. O caso real não trata do que fazer quando o resultado do verificador do fabricante contradiz o seu log.',
        question: 'O que você decide?',
        options: [
          o('Considerar o equipamento limpo pelo resultado da ferramenta, rotacionar a senha da conta de serviço e voltar à operação normal.', 'O caso real mostra que a ferramenta do fabricante pode não detectar o comprometimento. Um resultado limpo não vale mais que o seu log.'),
          o('Fazer um reset de fábrica no gateway, reaplicar a configuração salva e voltar à operação normal ainda hoje em todas as filiais.', 'Era exatamente a persistência que sobrevivia ao reset no caso real. Reset sem investigar pode devolver o acesso ao invasor e apagar evidências.'),
          o('Tratar como comprometimento: preservar logs e imagem, subir gateway novo de fonte confiável e rotacionar credenciais.', 'Correto. Combina investigação com substituição planejada e continuidade, sem confiar só no verificador (salvaguardas 12.1 e 12.3).', true),
          o('Desligar a VPN para os 400 usuários até a investigação terminar, sem alternativa de acesso, para eliminar o risco de vez.', 'Contém, mas para 400 pessoas sem necessidade de ficar sem alternativa. Um gateway substituto e o isolamento do suspeito reduzem risco com menos impacto.'),
        ],
      },
      {
        id: 'c12-s4',
        situation:
          'A empresa-exemplo vai trocar o firewall da matriz em uma janela de sábado, com a campanha de vendas começando na segunda. O diretor de operações exige "zero risco de queda" e a equipe de rede propõe subir a nova regra base como "any para any" por 72 horas, para depois restringir. O auditor interno avisa que já viu "regra temporária" virar permanente. A planilha de regras mostra que a regra 14 tem a expiração marcada como "nunca" e atinge o segmento onde ficam os servidores de pagamento. O fornecedor do firewall oferece suporte durante a janela, mas só até as 18h.',
        question: 'Qual é a melhor decisão de arquitetura?',
        options: [
          o('Publicar a regra "any para any" por 72 horas como o plano prevê e marcar um alarme para revisá-la na segunda, após a campanha.', 'O alarme não impede o risco nas 72 horas, e a regra 14 mostra que o "temporário" já se perpetua. O segmento de pagamentos fica exposto durante a campanha.'),
          o('Publicar regras por fluxo documentado, com expiração real, manter pagamentos fechado e deixar o não mapeado para uma segunda janela, com reversão.', 'Correto. Reduz o risco de queda com reversão e escopo, sem abrir a rede inteira (salvaguarda 12.2), e é honesto sobre o que fica para depois.', true),
          o('Adiar a troca do firewall para depois da campanha e manter o equipamento antigo sem alteração, mesmo com a regra 14 aberta.', 'Pode ser uma opção legítima, mas aqui não é a mais completa: mantém um equipamento que precisa de troca sem tratar a regra 14 existente e sem plano de entrada.'),
          o('Subir a regra ampla, mas restringir somente o segmento de pagamentos, deixando o resto da rede aberto durante a campanha.', 'Meia-medida: protege um segmento, mas deixa os demais ativos alcançáveis a partir de qualquer ponto. Basta um host comprometido para chegar a vários sistemas.'),
        ],
      },
    ],
    visuals: {
      'c12-s3': { kind: 'log', title: 'Gateway VPN: ferramenta de integridade x logs de conexão', lines: ['integrity-check (fabricante): "nenhuma anomalia detectada"', '02:14  saída  gw-vpn-01 -> 198.51.100.77:8443  conexão estabelecida (fora do expediente)', '02:19  sessão interna aberta pela conta svc-vpn-sync em 10.0.5.20 (servidor de arquivos)', '02:31  sessão interna aberta pela conta svc-vpn-sync em 10.0.5.31 (servidor de impressão)', 'histórico: svc-vpn-sync nunca abriu sessões internas antes de hoje'], note: 'Dados fictícios.' },
      'c12-s4': { kind: 'sheet', title: 'regras_firewall_nova_matriz.csv (trecho)', columns: ['#', 'Origem', 'Destino', 'Porta', 'Justificativa', 'Expira em'], rows: [['9', 'LAN usuários', 'Servidores internos', '443', 'Aplicações web', '2027-06-30'], ['14', 'any', 'Segmento de pagamentos (10.0.9.0/24)', 'any', 'Temporária para a janela', 'nunca'], ['15', 'VPN', 'Servidores internos', '3389', 'Suporte remoto', '2026-12-31']], note: 'Dados fictícios.' },
    },
  },

  13: {
    scenarios: [
      {
        id: 'c13-s3',
        situation:
          'Você é o(a) gerente de monitoramento de uma varejista da empresa-exemplo. A situação é parecida com a do caso Target: o sistema automático gerou alertas sobre a instalação de um malware e sobre rotas de extração de dados, e eles não foram tratados. No seu caso, a triagem é feita por um provedor de monitoramento terceirizado, que envia os alertas por e-mail a uma caixa compartilhada. Ao auditar a fila, você encontra um alerta de três dias atrás, classificado como informativo, mas com um destino externo nunca visto e transferências repetidas. Ninguém abriu o e-mail, e não há dono nem prazo de reconhecimento definidos para a caixa. Hoje há campanha, e a equipe interna é de dois analistas.',
        question: 'Qual é a sequência correta de ações?',
        options: [
          o('Reconfigurar primeiro os limiares dos alertas para reduzir ruído e só depois olhar o alerta específico, quando houver folga na equipe.', 'Ajustar limiares é necessário (salvaguarda 13.11), mas fazer isso antes de tratar o alerta deixa uma possível extração de dados em andamento.'),
          o('Responder ao provedor pedindo mais detalhes do alerta e aguardar o retorno dele antes de qualquer ação interna sobre o host.', 'A resposta de um terceiro não precisa ser pré-requisito. Cada hora de espera é tempo para uma extração em curso.'),
          o('Tratar o alerta agora como incidente (triagem e contenção do host e do destino) e depois definir dono, reconhecimento e escalonamento no contrato.', 'Correto. O caso real mostra que alerta sem resposta não protege. Primeiro a ameaça possivelmente ativa, depois o processo que deixou o alerta passar (salvaguardas 13.1 e 13.11).', true),
          o('Contratar uma segunda ferramenta de detecção para ter redundância de alertas e dividir a triagem entre as duas plataformas.', 'Mais ferramentas geram mais alertas sem resolver a falta de dono e de resposta. O problema é o processo, não a quantidade de sensores.'),
        ],
      },
      {
        id: 'c13-s4',
        situation:
          'A equipe de monitoramento da empresa-exemplo tem 2 analistas e recebe cerca de 900 alertas por semana, a maioria falsos positivos. O fornecedor de rede propõe desativar a regra de comunicação periódica suspeita (beaconing), responsável sozinha por quase metade do ruído. O gerente de TI apoia, pois a equipe está no limite e um analista já pediu demissão. O auditor lembra que, no último teste de invasão, essa mesma regra foi a única que detectou o movimento do testador. A diretoria quer reduzir horas extras sem enfraquecer a detecção, e o prazo da auditoria é em 30 dias.',
        question: 'O que a equipe deve fazer com a regra?',
        options: [
          o('Desativar a regra, já que o ruído é insustentável, e compensar com mais revisão manual dos logs de rede a cada semana.', 'Desativar sem critério elimina a única detecção validada no teste. A revisão manual não escala com 2 analistas.'),
          o('Manter a regra exatamente como está e pedir mais um analista, deixando qualquer ajuste para quando houver orçamento.', 'Preserva a detecção, mas mantém a equipe sobrecarregada e o risco de que alertas reais se percam no volume.'),
          o('Ajustar a regra com lista de permissão para destinos legítimos documentados e limiar por perfil, mantendo-a ativa.', 'Correto. Reduz falsos positivos sem perder o sinal que provou valor (salvaguarda 13.11), com evidência para o auditor e critério de revisão.', true),
          o('Mudar a regra para apenas registrar em log, sem gerar alerta, e revisar esses registros uma vez por semana em lote.', 'Na prática é desativar: um alerta que só aparece semanas depois não permite contenção a tempo.'),
        ],
      },
    ],
    visuals: {
      'c13-s3': { kind: 'email', from: 'noc@monitoramento-exemplo.test', to: 'alertas-compartilhado@empresa-exemplo.test', subject: '[INFO] Conexão incomum de srv-atendimento-03', body: ['Detectamos 14 conexões de saída de srv-atendimento-03 para 203.0.113.140, destino nunca visto na base de 90 dias.', 'Volume agregado: 6,2 GB em 3 horas. Classificação automática: informativo (destino não está em lista de reputação).', 'Status do chamado: enviado, sem confirmação de leitura.'], flag: 'Caixa compartilhada sem dono; recebido há 3 dias.' },
      'c13-s4': { kind: 'sheet', title: 'ruido_alertas_semana_42.csv', columns: ['Regra', 'Alertas/semana', 'Falsos positivos', 'Verdadeiros positivos', 'Observação'], rows: [['beaconing_suspeito', '410', '92%', '0 na semana', 'Detectou o teste de invasão de outubro'], ['varredura_portas_interna', '260', '99%', '0', 'Origem: scanner de vulnerabilidades legítimo'], ['login_fora_horario', '150', '40%', '3', '-']], note: 'Dados fictícios. Os destinos dos falsos positivos de beaconing são, em sua maioria, os servidores de backup e de atualização.' },
    },
  },

  14: {
    scenarios: [
      {
        id: 'c14-s3',
        situation:
          'Você é o(a) responsável pelo programa de conscientização da empresa-exemplo. A situação é parecida com a do caso Twitter: atacantes ligaram para funcionários se passando pela TI e conseguiram credenciais, e os controles técnicos (acesso mínimo, MFA resistente a golpes, monitoramento) também importavam. No seu caso, o alvo foi o help desk: alguém ligou como um diretor, pediu o reset do MFA e o atendente fez o reset após perguntar só nome e matrícula, dados que estão no perfil público da empresa em redes profissionais. O atendente é novo e cumpriu o roteiro que recebeu. O diretor de RH quer uma campanha geral de e-mail e punição para o atendente, e há uma auditoria na próxima semana.',
        question: 'Qual é a resposta mais eficaz?',
        options: [
          o('Disparar a campanha geral de e-mail sobre phishing para todos os colaboradores e considerar o tema tratado até a auditoria.', 'O vetor foi o telefone e o help desk. Uma campanha genérica de e-mail não toca no ponto fraco real nem no processo de reset.'),
          o('Advertir formalmente o atendente por ter feito o reset sem desconfiar e reforçar o treino de atenção do time inteiro do help desk.', 'Ele seguiu o roteiro. Punir quem cumpre um processo fraco desencoraja o reporte e não corrige a causa, que é a verificação insuficiente.'),
          o('Mudar o reset de MFA para exigir canal independente e aprovação do gestor, treinar o help desk e registrar o incidente.', 'Correto. Une processo, treino focado e registro (salvaguardas 14.2 e 14.6), reconhecendo que a pessoa sozinha não deve ser a única barreira.', true),
          o('Bloquear qualquer reset de MFA por telefone, sem criar um caminho alternativo para quem realmente perdeu o dispositivo.', 'Reduz o risco, mas deixa pessoas legítimas sem acesso e sem caminho de suporte, o que estimula contornos informais.'),
        ],
      },
      {
        id: 'c14-s4',
        situation:
          'O orçamento de conscientização da empresa-exemplo é limitado e o diretor financeiro (CFO) quer focar o treinamento nas áreas com maior taxa de clique no último exercício de phishing, que ele lê como o melhor indicador de risco. A planilha por área mostra que a Operação teve muito clique, mas também muito reporte. O Financeiro, que aprova pagamentos, teve poucos cliques. O gerente de TI está a 30 dias de uma auditoria e quer um número "limpo" para apresentar, de preferência com clique perto de zero.',
        question: 'Qual é a melhor priorização?',
        options: [
          o('Concentrar o treinamento na Operação, por ter a maior taxa de clique, e repetir o exercício a cada mês até o clique cair.', 'Ignora que a Operação reporta bastante e o Financeiro quase não. Clique isolado não mede o risco que cada função representa.'),
          o('Montar programa por função, com foco em fraude de pagamento para o Financeiro, e medir reporte e tempo de reporte, não só clique.', 'Correto. O risco depende do que a função pode fazer, e o reporte é um indicador melhor de cultura (salvaguardas 14.1, 14.2 e 14.6). A baixa taxa de abertura do Financeiro também precisa ser entendida.', true),
          o('Treinar todas as áreas igualmente, com o mesmo conteúdo e a mesma carga horária, para manter a justiça e a simplicidade.', 'Simples, porém desperdiça orçamento limitado e não prioriza quem pode causar o maior dano, como quem aprova pagamentos.'),
          o('Retirar do exercício as mensagens mais difíceis para melhorar o resultado antes da auditoria e apresentar o clique perto de zero.', 'Melhora o número, mas não o risco. Maquiar a métrica esconde o ponto fraco e enfraquece o valor do exercício.'),
        ],
      },
    ],
    visuals: {
      'c14-s3': { kind: 'log', title: 'Chamado do help desk (trecho)', lines: ['14:02  Ligação recebida: "sou o diretor de Operações, perdi o celular, preciso reativar o MFA agora, estou em reunião externa"', '14:03  Verificação feita: nome completo e matrícula (confere com o cadastro)', '14:05  Reset de MFA executado; novo dispositivo registrado', '14:41  Login do diretor de um IP desconhecido (198.51.100.120)', '15:10  Diretor real abre chamado: "meu MFA foi desligado, não pedi nada"'], note: 'Dados fictícios. Nome e matrícula do diretor constam em perfil público.' },
      'c14-s4': { kind: 'sheet', title: 'exercicio_phishing_por_area.csv', columns: ['Área', 'Enviados', 'Abriram', 'Clicaram', 'Reportaram'], rows: [['Operação', '120', '104 (87%)', '17 (14%)', '46 (38%)'], ['Financeiro', '42', '12 (29%)', '1 (2%)', '0 (0%)'], ['Desenvolvimento', '90', '78 (87%)', '6 (7%)', '41 (46%)']], note: 'Dados fictícios. No Financeiro, 71% não abriu a mensagem.' },
    },
  },

  15: {
    scenarios: [
      {
        id: 'c15-s3',
        situation:
          'Você é o(a) responsável pela gestão de fornecedores de um provedor de TI da empresa-exemplo, que presta serviço a vários clientes usando uma ferramenta de gestão remota com acesso privilegiado. A situação é parecida com a do caso Kaseya: o fornecedor orienta desligar os servidores locais (on-premises) da ferramenta e afirma que não há evidência de comprometimento no serviço em nuvem. No inventário de fornecedores, sua ferramenta consta como "nuvem". O gestor de infraestrutura lembra, porém, que migrou para uma instalação local há um ano. São 23h de sexta, e três clientes têm contrato com cláusula de notificação de incidentes. O caso real não trata de como o seu inventário desatualizado muda a sua resposta.',
        question: 'O que fazer primeiro?',
        options: [
          o('Seguir o inventário, que diz "nuvem", e aguardar a atualização do fornecedor, já que o aviso diz que a nuvem não tem evidência.', 'O inventário está desatualizado. A orientação de desligar vale justamente para a instalação local, que é a sua.'),
          o('Confirmar o tipo real da instalação, desligar a ferramenta local, acionar a resposta a incidentes e avisar os clientes.', 'Correto. A realidade do ambiente vale mais que o cadastro, e a contenção e a notificação aos clientes seguem o contrato (salvaguardas 15.1 e 15.6).', true),
          o('Desligar a ferramenta local e esperar até segunda-feira para avisar os clientes, para não alarmar sem ter mais detalhes confirmados.', 'A contenção está certa, mas segurar a comunicação aos clientes com cláusula de notificação, sem decisão consciente, pode virar descumprimento e piora a confiança.'),
          o('Enviar agora um e-mail a todos os clientes dizendo que a empresa foi atingida, antes de confirmar o escopo ou falar com a liderança.', 'Comunicar cedo é bom, mas sem confirmar escopo e sem alinhar conteúdo e responsável pode gerar informação errada e obrigações não pretendidas.'),
        ],
      },
      {
        id: 'c15-s4',
        situation:
          'O time comercial da empresa-exemplo quer usar um serviço de transcrição de reuniões com IA, de um fornecedor novo, em uma apresentação para o cliente-exemplo.test em duas semanas. O fornecedor respondeu ao questionário de segurança com "sim" para quase tudo, sem anexar evidências. A minuta de contrato fala em notificar incidentes em "prazo razoável" e deixa a lista de subprocessadores "a ser informada". O diretor comercial diz que, sem a ferramenta, a proposta perde força. O jurídico pede que nenhum dado de cliente entre sem cláusulas ajustadas.',
        question: 'Qual é a decisão mais equilibrada?',
        options: [
          o('Aprovar o uso em produção com dados reais, com base nas respostas "sim" do questionário, e pedir as evidências depois da apresentação.', 'Resposta sem evidência não é controle, e depois do uso o poder de negociar cai. Dados de cliente entrariam em um serviço sem condições definidas.'),
          o('Autorizar um piloto com dados fictícios e condicionar o uso em produção a evidências, subprocessadores listados e prazo de notificação no contrato.', 'Correto. Atende ao prazo comercial sem expor dados e mantém a exigência contratual (salvaguardas 15.2 e 15.4), com um critério claro para avançar.', true),
          o('Bloquear o uso da ferramenta por completo até o fim da análise de risco, sem alternativa para o time comercial apresentar.', 'É seguro, mas ignora o negócio. Um piloto com dados fictícios reduz o risco quase a zero e permite avaliar a ferramenta.'),
          o('Aceitar a minuta como está e pedir ao fornecedor um e-mail informal prometendo avisar "rápido" e informar os subprocessadores depois.', 'Promessa informal não cria prazo nem obrigação, e os subprocessadores continuam desconhecidos.'),
        ],
      },
    ],
    visuals: {
      'c15-s3': { kind: 'email', from: 'incidentes@fornecedor-gestao-exemplo.test', to: 'ti@empresa-exemplo.test', subject: 'Aviso: desligue os servidores locais da ferramenta', body: ['Estamos investigando um incidente. Orientamos desligar imediatamente os servidores locais (on-premises) da ferramenta de gestão.', 'No momento, não temos evidência de comprometimento do nosso serviço em nuvem.', 'Mais informações serão publicadas à medida que forem confirmadas.'], flag: 'Inventário de fornecedores: "tipo de instalação: nuvem" (cadastro de 2 anos atrás).' },
      'c15-s4': { kind: 'sheet', title: 'questionario_seguranca_fornecedor_ia.xlsx (trecho)', columns: ['Item', 'Resposta do fornecedor', 'Evidência anexada', 'Contrato'], rows: [['Criptografia em trânsito e em repouso', 'Sim', '(nenhuma)', '-'], ['Retenção e exclusão de dados', 'Sim, configurável', '(nenhuma)', 'Não detalha prazo'], ['Notificação de incidentes', 'Sim', '(nenhuma)', '"prazo razoável"'], ['Subprocessadores', 'A informar', '(nenhuma)', 'Lista "a ser informada"']], note: 'Dados fictícios.' },
    },
  },

  16: {
    scenarios: [
      {
        id: 'c16-s3',
        situation:
          'Você é o(a) responsável por segurança de aplicações na empresa-exemplo, que usa um produto de transferência de arquivos de terceiro, exposto à internet. A situação é parecida com a do caso MOVEit: uma injeção de SQL foi explorada e aplicações web expostas receberam um web shell usado para roubar dados dos bancos de dados. O fabricante publicou a correção hoje de manhã, e o time de infraestrutura já a aplicou. A diretoria pergunta se o assunto está encerrado. Ao revisar o servidor, você nota um arquivo de página novo no diretório da aplicação, criado três dias antes do patch, com um nome que não consta em nenhuma versão do produto. A conta de banco usada pela aplicação tem permissão de leitura e escrita em todas as bases.',
        question: 'O que você responde e faz?',
        options: [
          o('Encerrar o assunto com a diretoria, pois a correção foi aplicada e o produto está na versão recomendada pelo fabricante.', 'A correção fecha a falha, mas não remove um acesso que já possa ter sido obtido. O arquivo novo criado antes do patch exige investigação.'),
          o('Colocar um WAF na frente do produto e considerar o risco mitigado, mantendo o servidor atual em operação normal.', 'Um WAF ajuda contra novas tentativas, mas não elimina um possível web shell já instalado nem avalia se houve acesso a dados.'),
          o('Retirar o produto do ar de vez e substituí-lo por outro de outro fornecedor, descartando o servidor atual sem investigação.', 'Pode ser decisão futura, mas sem investigar não se sabe o que foi acessado, e a troca de produto não responde às obrigações do incidente.'),
          o('Preservar evidências, analisar o arquivo suspeito e os acessos ao banco e reduzir o privilégio da conta de banco.', 'Correto. Une investigação, contenção e privilégio mínimo (salvaguardas 16.2 e 16.4), reconhecendo que o patch por si só não remove um acesso já obtido.', true),
        ],
      },
      {
        id: 'c16-s4',
        situation:
          'A empresa-exemplo ativou uma análise estática (SAST) no pipeline. O primeiro resultado trouxe 2 achados de severidade alta no código novo e 41 de severidade média no código legado. O líder de produto quer desativar o bloqueio do pipeline para publicar a versão prometida ao cliente-exemplo.test na sexta, e propõe "tratar tudo em um sprint depois". O time de segurança acha que bloquear tudo, inclusive o legado, travaria todas as equipes. Um dos achados altos é um token de API escrito em um arquivo de configuração do repositório, com o valor mascarado na saída da ferramenta.',
        question: 'Qual é a decisão mais adequada?',
        options: [
          o('Manter o bloqueio total, incluindo o legado, e adiar a entrega ao cliente até que todos os 43 achados estejam resolvidos.', 'Rígido demais: trava a empresa por achados antigos de risco menor e estimula o time a desativar a ferramenta no futuro.'),
          o('Desativar o bloqueio do pipeline apenas para a versão de sexta e reativá-lo logo depois que a entrega for feita ao cliente.', 'O token em repositório e o achado alto entrariam em produção, e a reativação costuma ser esquecida.'),
          o('Bloquear só novos achados altos e críticos, corrigir os 2 altos antes da entrega, rotacionar o token e abrir backlog com dono para o legado.', 'Correto. Equilibra prazo e segurança com uma linha de base para o legado (salvaguardas 16.1 e 16.12) e trata o segredo no repositório como comprometido, mesmo que a saída esteja mascarada.', true),
          o('Corrigir os achados altos, mas manter o token no repositório, pois o repositório é privado e o acesso é restrito ao time.', 'Repositório privado não impede acesso por quem já o clonou ou por contas comprometidas, e o histórico mantém o valor. O token deve ser rotacionado.'),
        ],
      },
    ],
    visuals: {
      'c16-s3': { kind: 'log', title: 'Servidor da aplicação de transferência de arquivos (verificação pós-patch)', lines: ['patch aplicado: 09:40 de hoje (versão corrigida confirmada)', 'arquivos no diretório web criados nos últimos 7 dias:', '  2026-11-01 02:12  /app/webroot/health-chk.aspx   (não consta no pacote oficial)', 'acessos a /app/webroot/health-chk.aspx: 31 requisições de 203.0.113.58 entre 01/11 e 03/11', 'conta db_app: SELECT, INSERT, UPDATE, DELETE em todas as bases'], note: 'Dados fictícios.' },
      'c16-s4': { kind: 'log', title: 'Resultado do SAST no pipeline (release 5.2)', lines: ['ALTA   config/api.js:12  segredo em texto claro (token de API: ****mascarado****)', 'ALTA   src/relatorios/exportar.js:88  desserialização insegura de entrada do usuário', 'MÉDIA  41 achados em módulos legados (módulos criados antes de 2024)', 'gate do pipeline: BLOQUEANTE para alta e crítica', 'prazo de entrega ao cliente: sexta-feira'], note: 'Dados fictícios.' },
    },
  },

  17: {
    scenarios: [
      {
        id: 'c17-s3',
        situation:
          'Você é o(a) responsável por resposta a incidentes da empresa-exemplo. A situação é parecida com a do caso Uber: invasores acessaram dados de consumidores, receberam um pagamento por um programa de recompensa por vulnerabilidades e a empresa só avisou depois de cerca de um ano, enquanto já havia investigação de um incidente anterior semelhante. No seu caso, o invasor escreveu mostrando amostras de registros de clientes e pediu um pagamento pelo programa de recompensa, com um acordo de confidencialidade. O diretor executivo quer resolver depressa, para não afetar um fechamento com investidores, e diz que "não precisa envolver o jurídico ainda". O contrato com o cliente-exemplo.test tem cláusula de notificação, e o caso real não trata de como separar a pressão do fechamento da decisão de comunicar.',
        question: 'Qual é a conduta adequada?',
        options: [
          o('Pagar pelo programa de recompensa, assinar o acordo de confidencialidade e informar os clientes depois do fechamento.', 'É o padrão do caso real: pagamento e silêncio. A confidencialidade do invasor não substitui obrigações de comunicação, e a demora tende a agravar o resultado.'),
          o('Recusar tudo e apagar a mensagem e as amostras, pois a empresa não negocia com invasores, e seguir com o fechamento.', 'A recusa pode ser a decisão final, mas apagar a mensagem destrói evidência e impede a avaliação do que foi acessado.'),
          o('Escalar à liderança e ao jurídico, preservar a mensagem e as amostras, validar o que foi acessado e avaliar as obrigações de notificação.', 'Correto. O pagamento e a comunicação não são decisão individual nem encerram o incidente (salvaguardas 17.1, 17.3 e 17.4). O fechamento com investidores entra na avaliação de impacto, sem ditar o processo.', true),
          o('Avisar todos os clientes imediatamente por e-mail, sem validar o que foi acessado nem passar pelo jurídico, para evitar acusações de demora.', 'Comunicar cedo é desejável, mas sem escopo validado nem revisão do conteúdo pode gerar informação errada. O ritmo vem do processo, com o jurídico.'),
        ],
      },
      {
        id: 'c17-s4',
        situation:
          'Sábado, 22h, no meio de uma campanha de vendas da empresa-exemplo. O plantonista recebe um alerta: a conta de serviço do checkout está autenticando, também, a partir de um IP externo. A conta é usada pelo sistema de pagamento em produção. O diretor de vendas, que está no telefone, diz que desabilitar a conta derrubaria o checkout durante a campanha. O jurídico, acionado, só responde na manhã seguinte. O fornecedor de TI terceirizado se oferece para "resolver tudo sozinho" com acesso remoto, mas não tem o histórico do ambiente.',
        question: 'Qual é a melhor primeira ação?',
        options: [
          o('Desabilitar a conta de serviço imediatamente, mesmo derrubando o checkout, porque a segurança vem antes das vendas.', 'Contém, mas é uma medida cega: derruba a receita sem saber se há opção cirúrgica, e sem aprovação de quem decide o impacto.'),
          o('Aguardar o jurídico e o diretor na manhã seguinte, para decidir com todos os atores, mantendo o monitoramento do alerta.', 'Esperar 10 horas mantém uma credencial privilegiada possivelmente nas mãos de um invasor. A comunicação com o jurídico não precisa bloquear a contenção.'),
          o('Deixar o fornecedor terceirizado resolver remotamente, sem registro formal, para ganhar velocidade durante a campanha.', 'Dá acesso privilegiado a quem não conhece o ambiente, sem registro nem comando definido, e dificulta a investigação posterior.'),
          o('Acionar o comando de incidentes, bloquear o IP externo, restringir o escopo da conta e informar negócio e jurídico.', 'Correto. Uma contenção cirúrgica reduz o risco com menos impacto e segue o processo de resposta (salvaguarda 17.4), com decisões registradas e comunicadas.', true),
        ],
      },
    ],
    visuals: {
      'c17-s3': { kind: 'email', from: 'contato@anonimo-exemplo.test', to: 'seguranca@empresa-exemplo.test', subject: 'Registros de clientes e programa de recompensa', body: ['Acessamos a base de clientes. Seguem 5 registros como prova (dados fictícios para este exercício).', 'Aceitamos um pagamento pelo programa de recompensa e assinamos um acordo de confidencialidade. Prazo: 72 horas.'], attachments: ['amostra_registros.csv'], flag: 'Contrato com o cliente-exemplo.test tem cláusula de notificação de incidentes.' },
      'c17-s4': { kind: 'log', title: 'Autenticações da conta svc-checkout (últimas 2 h)', lines: ['20:15-21:55  svc-checkout  origem 10.0.4.12 (servidor de checkout)  padrão normal', '21:48  svc-checkout  origem 198.51.100.44 (externo)  autenticação bem-sucedida', '21:49  svc-checkout  consulta à tabela de pedidos (SELECT em massa)', '21:52  svc-checkout  origem 198.51.100.44  nova autenticação', 'permissões da conta: leitura e escrita nas bases de pedidos e pagamento'], note: 'Dados fictícios. Campanha de vendas em curso.' },
    },
  },

  18: {
    scenarios: [
      {
        id: 'c18-s3',
        situation:
          'Você é o(a) responsável por contratar um teste de invasão para a empresa-exemplo. A situação é parecida com a do caso de Iowa: duas partes acreditavam ter combinado as avaliações físicas e interpretaram o escopo de formas diferentes, e o dono do local pode não ter feito parte da autorização. Aqui, o contrato com o fornecedor-exemplo.test prevê "avaliação física das instalações" e engenharia social, com carta de autorização assinada pela diretoria. A planilha de endereços mostra que a filial 2 fica em um andar alugado de um prédio com segurança terceirizada, e o locador não foi consultado. A janela de teste é na próxima terça. O caso real não trata do que fazer quando a empresa contratante não é dona do local.',
        question: 'O que deve ser feito antes da janela?',
        options: [
          o('Manter a carta da diretoria como autorização suficiente, pois a empresa é a contratante e responsável pelo teste, e seguir com a janela de terça.', 'A diretoria autoriza o que é da empresa, mas não necessariamente o prédio nem a empresa de segurança. Foi esse tipo de lacuna que o caso real deixou aberta.'),
          o('Começar pelos endereços autorizados e orientar o fornecedor a improvisar na filial 2 se surgir oportunidade, sem contato com o prédio.', 'Improvisar fora do escopo documentado é o que transforma teste em incidente, e deixa a equipe de teste sem cobertura se for abordada.'),
          o('Retirar a filial 2 da janela até haver autorização escrita do locador e da segurança do prédio, com contato de emergência 24 horas.', 'Correto. Só quem é dono do alvo pode autorizar, e o plano de contato evita que uma abordagem vire crise (salvaguarda 18.1). A filial 2 pode entrar em nova janela, depois da autorização.', true),
          o('Cancelar o teste físico em todas as unidades e fazer apenas testes remotos, sem rever autorizações, para evitar problemas.', 'Evita o risco físico, mas perde cobertura e não resolve o problema de autorização, que também vale para outros alvos.'),
        ],
      },
      {
        id: 'c18-s4',
        situation:
          'A empresa-exemplo vai fazer o teste de invasão interno periódico, antes de uma versão grande do produto que vence em três semanas. O fornecedor quer testar em produção, pois o ambiente de homologação (staging) tem dados sintéticos, outra versão de biblioteca e sem o WAF. O time de produto prefere testar só no staging para não arriscar disponibilidade. O SOC teme ser pego de surpresa e o diretor de risco pergunta sobre os achados do último teste: ao revisar a planilha, dois achados críticos da rodada anterior aparecem como "corrigidos", mas sem retest.',
        question: 'Qual é a melhor definição de escopo?',
        options: [
          o('Testar apenas no staging, que é seguro para a disponibilidade, e tratar os resultados como representativos da produção real.', 'O staging difere da produção (versão de biblioteca, WAF), então os resultados podem não refletir o risco real nem os críticos anteriores.'),
          o('Adiar o teste para depois da versão grande, para não arriscar o prazo, e revisar os achados antigos com o time de produto depois.', 'Empurra a verificação para depois da publicação, quando os críticos podem já estar em produção. O teste agora é justamente para informar a versão.'),
          o('Testar em produção sem avisar o SOC, para medir a capacidade real de detecção, e repetir os dois críticos antigos ao final do teste.', 'Pode ser válido em um exercício planejado de red team, mas aqui há risco de disponibilidade e sem coordenação o SOC pode acionar resposta desnecessária.'),
          o('Testar em produção com técnicas não destrutivas, janela e contatos combinados com o SOC, e retest dos dois críticos anteriores.', 'Correto. Cobre o ambiente real com salvaguardas e fecha o ciclo de correção dos achados anteriores (salvaguardas 18.3 e 18.5), equilibrando disponibilidade, prazo e risco.', true),
        ],
      },
    ],
    visuals: {
      'c18-s3': { kind: 'sheet', title: 'escopo_fisico_pentest.xlsx', columns: ['Local', 'Dono do imóvel / segurança', 'Autorização escrita obtida', 'Contato 24 h'], rows: [['Matriz', 'Empresa-exemplo', 'sim (carta da diretoria)', 'definido'], ['Filial 1', 'Empresa-exemplo', 'sim (carta da diretoria)', 'definido'], ['Filial 2 (andar alugado)', 'Locador + empresa de segurança do prédio', 'não: somente carta da diretoria', 'não definido']], note: 'Dados fictícios. Janela do teste: terça-feira.' },
      'c18-s4': { kind: 'sheet', title: 'ambientes_e_achados_anteriores.xlsx', columns: ['Item', 'Staging', 'Produção', 'Observação'], rows: [['Biblioteca de autenticação', 'v2.4', 'v2.1', 'Versões diferentes'], ['WAF', 'ausente', 'ativo', 'Comportamento de bloqueio diferente'], ['Achado crítico 1 (rodada anterior)', '-', '"corrigido"', 'Sem retest'], ['Achado crítico 2 (rodada anterior)', '-', '"corrigido"', 'Sem retest']], note: 'Dados fictícios.' },
    },
  },
};
