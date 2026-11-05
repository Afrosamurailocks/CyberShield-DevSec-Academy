/**
 * Casos reais da trilha CIS, controles 7 a 12. Só fatos lidos nas fontes citadas.
 * O mapeamento de cada caso a um controle é EDITORIAL (não é conclusão oficial dos órgãos citados).
 */
import type { PrivacyCase } from './privacyExtras.js';

export const CIS_CASES_7_12: Record<string, PrivacyCase> = {
  c07: {
    id: 'equifax', kind: 'acordo',
    title: 'Equifax: vulnerabilidade crítica conhecida e correção que ninguém verificou',
    authority: 'FTC, CFPB e estados (acordo); GAO (relatório)',
    date: 'Incidente anunciado em set/2017; acordo em jul/2019',
    facts: [
      { label: 'Pessoas afetadas (FTC)', value: '~147 milhões' },
      { label: 'Acordo (mínimo)', value: 'US$ 575 mi' },
      { label: 'Alerta recebido', value: 'Mar/2017' },
    ],
    happened:
      'Segundo a FTC, a Equifax foi avisada em março de 2017 sobre uma vulnerabilidade crítica em um ambiente de banco de dados. A equipe de segurança mandou corrigir em até 48 horas, mas não verificou se a correção foi feita. Os invasores só foram percebidos em julho de 2017, após tráfego suspeito. Segundo a FTC, eles chegaram a um arquivo com credenciais de administrador em texto puro e ficaram na rede por meses. O GAO descreve a exploração de um portal de disputas voltado à internet.',
    outcome:
      'Em julho de 2019, acordo global com FTC, CFPB e estados de no mínimo US$ 575 milhões e até US$ 700 milhões, incluindo avaliações independentes periódicas e certificação anual do conselho de administração.',
    lessons: [
      'Ter um processo de vulnerabilidades inclui verificar se a correção foi mesmo aplicada, e não só mandar aplicar.',
      'Uma vulnerabilidade crítica conhecida precisa de dono e prazo, com varredura para confirmar o resultado.',
      'Credenciais em texto puro e rede sem segmentação transformam uma brecha em um incidente enorme.',
    ],
    caveat: 'Nenhuma das páginas lidas cita o componente específico (a imprensa costuma mencionar Apache Struts, mas isso não foi confirmado nas fontes abaixo). O GAO fala em um portal de disputas e a FTC em um ambiente de banco de dados. A página de reembolso da FTC cita "até US$ 425 milhões" para consumidores, que é uma parte do acordo total.',
    sources: [
      { label: 'FTC: Equifax pagará US$ 575 milhões em acordo (jul/2019)', url: 'https://www.ftc.gov/news-events/news/press-releases/2019/07/equifax-pay-575-million-part-settlement-ftc-cfpb-states-related-2017-data-breach' },
      { label: 'GAO-18-559: relatório sobre o incidente da Equifax', url: 'https://www.gao.gov/products/gao-18-559' },
    ],
  },

  c08: {
    id: 'storm0558', kind: 'incidente',
    title: 'Storm-0558: sem logs, a causa raiz não pôde ser comprovada',
    authority: 'Microsoft (relatos próprios de investigação)',
    date: 'Mai a jul/2023; relato de set/2023 (adendo de mar/2024)',
    facts: [
      { label: 'Início do acesso', value: '15/05/2023' },
      { label: 'Detectado por', value: 'Cliente (16/06)' },
      { label: 'Organizações (Microsoft)', value: '~25' },
    ],
    happened:
      'Segundo a Microsoft, tokens de autenticação forjados foram usados para acessar e-mails no Exchange Online a partir de 15 de maio de 2023. Um cliente relatou acessos anômalos em 16 de junho. Ao investigar como o atacante obteve a chave de assinatura, a própria Microsoft afirma que, por causa das políticas de retenção de logs, não tem registros com evidência específica da exfiltração da chave. A explicação mais provável apresentada é uma hipótese, não uma prova.',
    outcome:
      'Não foi encontrada multa. O caso ficou como exemplo de investigação limitada pela retenção de logs. Foi um incidente complexo, com várias lições além dos logs.',
    lessons: [
      'Logs que expiram antes da investigação impedem confirmar como o ataque começou.',
      'A retenção precisa cobrir o tempo que um atacante pode levar até ser percebido.',
      'Quando quem percebe é o cliente, e não o monitoramento, há lacuna de detecção a tratar.',
    ],
    caveat: 'Ambas as fontes são relatos da própria Microsoft, não de um órgão independente. O relatório do Cyber Safety Review Board (CSRB) não pôde ser lido nesta pesquisa: outros números sobre o caso (inclusive contagens de organizações) divergem e não foram verificados. É mais um caso de retenção insuficiente prejudicando a análise do que uma falha clássica de coleta.',
    sources: [
      { label: 'Microsoft MSRC: resultados da investigação sobre a aquisição da chave (Storm-0558)', url: 'https://www.microsoft.com/en-us/msrc/blog/2023/09/results-of-major-technical-investigations-for-storm-0558-key-acquisition' },
      { label: 'Microsoft Security: análise das técnicas do Storm-0558 (jul/2023)', url: 'https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/' },
    ],
  },

  c09: {
    id: 'bec-ic3', kind: 'incidente',
    title: 'Fraude por e-mail corporativo (BEC): o que o FBI registrou em dados agregados',
    authority: 'FBI IC3 (alerta público PSA230609)',
    date: 'Alerta de 09/06/2023 (dados de 2013 a 2022)',
    facts: [
      { label: 'Incidentes (2013–2022)', value: '277.918' },
      { label: 'Perdas expostas', value: 'US$ 50,8 bi' },
      { label: 'Alta das perdas (dez/21–dez/22)', value: '17%' },
    ],
    happened:
      'O FBI define BEC como golpe que usa e-mail para enganar uma empresa e levá-la a transferir dinheiro ou dados. Entre outubro de 2013 e dezembro de 2022, o IC3 registrou 277.918 incidentes, com perdas expostas de cerca de US$ 50,8 bilhões. As perdas expostas globais subiram 17% entre dezembro de 2021 e dezembro de 2022. O alerta traz dicas de prevenção.',
    outcome:
      'Este item é um dado agregado, não um caso individual. "Perdas expostas" significa valor tentado ou perdido, e não perda final depois de recuperações.',
    lessons: [
      'BEC muitas vezes passa por filtros técnicos: o e-mail é "limpo", o engano está no pedido.',
      'Filtros e autenticação de e-mail (como DMARC) ajudam, mas a verificação de pagamentos por outro canal é a barreira decisiva.',
      'Treinamento (Controle 14) e proteção de e-mail (Controle 9) se complementam.',
    ],
    caveat: 'Não foi possível ler as páginas do Departamento de Justiça dos EUA sobre casos individuais de BEC. Por isso usamos o dado agregado do FBI, uma fonte oficial lida na íntegra. Antes de usar um caso individual, leia o comunicado do DOJ diretamente.',
    sources: [
      { label: 'FBI IC3: alerta PSA230609 sobre BEC', url: 'https://www.ic3.gov/PSA/2023/PSA230609' },
    ],
  },

  c10: {
    id: 'wannacry', kind: 'incidente',
    title: 'WannaCry: o ransomware que parou hospitais do NHS',
    authority: 'National Audit Office (Reino Unido), relatório de out/2017',
    date: '12/05/2017',
    facts: [
      { label: 'Hospitais afetados', value: '81 de 236' },
      { label: 'Consultas canceladas', value: '6.912 (est. 19 mil+)' },
      { label: 'Pronto-socorros desviados', value: '5' },
    ],
    happened:
      'Em 12 de maio de 2017, o ransomware WannaCry atingiu ao menos 81 dos 236 hospitais do NHS inglês e 603 organizações no total, incluindo 595 clínicas de médicos de família. O NAO afirma que a causa foi o uso de sistemas Windows sem correção ou sem suporte. Houve avisos anteriores (cartas em 2014 e alertas críticos em março e abril de 2017), mas nenhum mecanismo para verificar o cumprimento local. O ataque foi descrito como tecnicamente pouco sofisticado.',
    outcome:
      'Segundo o NAO, 6.912 consultas foram confirmadas como canceladas (a estimativa passa de 19 mil) e cinco pronto-socorros desviaram pacientes. Nenhum resgate foi pago, segundo as autoridades citadas. O custo total não foi calculado pelo Departamento de Saúde.',
    lessons: [
      'Defesas contra malware funcionam em camadas: antimalware atualizado, correção de sistemas e firewalls bem geridos.',
      'Avisar não basta: é preciso verificar que o aviso virou ação.',
      'Um malware que se espalha pela rede exige contenção rápida e segmentação.',
    ],
    caveat: 'O resumo do NAO atribui o problema principalmente a sistemas sem correção e à gestão de firewalls (Controles 7 e 12). Ele não discute lacunas de antimalware. Usamos o caso aqui por ser a referência pública mais documentada de propagação de malware, e por mostrar que os controles se somam.',
    sources: [
      { label: 'National Audit Office: investigação do ataque WannaCry ao NHS', url: 'https://www.nao.org.uk/reports/investigation-wannacry-cyber-attack-and-the-nhs/' },
    ],
  },

  c11: {
    id: 'norsk-hydro', kind: 'incidente',
    title: 'Norsk Hydro: backups permitiram reconstruir sistemas após um ciberataque',
    authority: 'Norsk Hydro (comunicados da própria empresa)',
    date: '19/03/2019',
    facts: [
      { label: 'Operações quase normais', value: 'Até 12/04/2019' },
      { label: 'Custo (estimativa da empresa)', value: '~800 mi NOK' },
      { label: 'Recuperação', value: 'Via backups' },
    ],
    happened:
      'Na madrugada de 19 de março de 2019, um ataque atingiu toda a organização, sendo a unidade Extruded Solutions a mais afetada. A empresa informou que PCs e servidores criptografados foram reconstruídos a partir de backups. Operações ficaram em modo manual por um tempo, e processos administrativos (relatórios, cobrança e faturamento) atrasaram. Em 12 de abril de 2019, a maior parte das operações estava próxima do normal.',
    outcome:
      'A empresa estimou o custo total em cerca de 800 milhões de coroas norueguesas (sem detalhamento) e possuía seguro cibernético. Não foi encontrada multa nas páginas lidas.',
    lessons: [
      'Backup é o que separa um incidente grave de uma crise sem saída.',
      'Recuperar leva tempo: sem plano e testes, é mais lento e mais caro.',
      'Ter modo de operação manual reduz o impacto enquanto os sistemas voltam.',
    ],
    caveat: 'As páginas da empresa lidas não citam o tipo de malware nem se houve pedido de resgate. Outras fontes citam valores diferentes de custo (não verificadas). É um exemplo positivo do Controle 11: o caso mostra recuperação, não falta de backup.',
    sources: [
      { label: 'Hydro: página sobre o ciberataque', url: 'https://www.hydro.com/en/global/media/on-the-agenda/cyber-attack/' },
      { label: 'Hydro: atualização de 12/04/2019', url: 'https://www.hydro.com/en/global/media/news/2019/update-on-cyber-attack-april-12' },
    ],
  },

  c12: {
    id: 'ivanti', kind: 'incidente',
    title: 'Ivanti Connect Secure: o gateway de acesso virou porta de entrada',
    authority: 'CISA e parceiros (aviso AA24-060B)',
    date: 'Dez/2023 a fev/2024; aviso de 29/02/2024',
    facts: [
      { label: 'Vulnerabilidades encadeadas', value: '3 (CVE-2023-46805, -21887, -21893)' },
      { label: 'Persistência', value: 'Sobrevive a reset de fábrica' },
      { label: 'Aviso', value: 'AA24-060B' },
    ],
    happened:
      'Segundo o aviso, atacantes encadearam uma falha de bypass de autenticação e duas de execução de comandos em gateways Ivanti Connect Secure e Policy Secure para rodar comandos com privilégios elevados. Mantiveram persistência, inclusive em nível de root que sobrevive a um reset de fábrica, e podiam ficar dormentes. A ferramenta de verificação de integridade do fabricante não era suficiente para detectar o comprometimento. A CISA orientou considerar o risco de manter esses dispositivos em operação.',
    outcome:
      'O resumo lido não traz contagem de vítimas nem multas. O caso mostra o risco de dispositivos de borda expostos à internet.',
    lessons: [
      'Dispositivos de borda (VPN, firewall, gateway) são alvos de alto valor: precisam de gestão e atualização prioritárias.',
      'Manter inventário e versão desses equipamentos permite agir rápido quando uma falha é anunciada.',
      'Se o equipamento pode estar comprometido, "atualizar" pode não bastar: é preciso um plano de isolamento e substituição.',
    ],
    caveat: 'Eram falhas desconhecidas na época (zero-days), então "não aplicou o patch" não descreve o caso por inteiro. A lição é a gestão de dispositivos expostos e a velocidade de resposta. Datas de exploração e de diretivas federais vistas só em resumos de busca não foram usadas.',
    sources: [
      { label: 'CISA (boletim): aviso AA24-060B sobre Ivanti Connect Secure e Policy Secure', url: 'https://content.govdelivery.com/accounts/USDHSCISA/bulletins/38e0c8f' },
    ],
  },
};
