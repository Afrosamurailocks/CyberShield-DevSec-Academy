/**
 * Camada de conversa dos assistentes SIMULADOS do Laboratório de prompts.
 *
 * Problema que resolve: fora dos gatilhos do exercício, os assistentes devolviam uma de três frases genéricas
 * escolhidas por hash ("Posso ajudar com isso...") e, em alguns casos, dados inventados. Aqui cada persona responde
 * de forma coerente, curta e VERDADEIRA dentro do seu escopo, e diz com clareza quando não sabe ou está fora do escopo.
 *
 * Princípios (anti-alucinação):
 *  - Só afirma o que é conhecimento geral correto de segurança/TI. Nada de números, políticas, nomes ou IDs inventados.
 *  - Quando faltar dado (saldo, chamado, política interna), diz que NÃO tem acesso e a quem recorrer.
 *  - Fora do escopo: recusa objetiva e lista do que PODE fazer; cita o tema da pergunta sem fingir resposta.
 *  - Determinístico (sem LLM, sem rede, sem aleatoriedade): mesma entrada, mesma saída. Não toca nas flags: os
 *    gatilhos de cada lab (llmLab.ts) rodam ANTES desta camada.
 */

/** Minúsculas e sem acento (mesma normalização de llmLab.ts). */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export interface FaqItem { kw: RegExp; a: string }
export interface Persona {
  /** Como o assistente se apresenta ("o assistente de TI"). */
  who: string;
  /** O que ele faz, em uma frase (usada em apresentação e fora de escopo). */
  scope: string;
  faq: FaqItem[];
  /** Quando o aluno pergunta algo de que o assistente não tem dado (ex.: saldo, chamado específico). */
  noData?: { kw: RegExp; a: string };
}

const GREETING = /^\s*(oi+|ola+|opa|e ai|bom dia|boa tarde|boa noite|hello|hi|hey|salve)\b/;
const IDENTITY = /(quem (e|eh|sao) (voce|vc)|qual (e )?(o )?seu nome|o que (voce|vc) (e|eh|faz|pode|consegue|sabe)|como (voce|vc) pode (me )?ajudar|em que (voce|vc) pode (me )?ajudar|o que posso (te )?pedir|(qual|que) (e )?(a )?(sua |seu )?(funcao|papel|especialidade)|para que (voce|vc) serve|\bajuda\b|\bhelp\b|que tipo de)/;
const THANKS = /\b(obrigad[oa]|valeu|agradec|thanks|brigad[oa])\b/;
const BYE = /\b(tchau|ate (mais|logo)|encerrar|era so isso|so isso)\b/;
const FOLLOWUP = /^\s*(e |mais |como assim|pode (explicar|detalhar)|explica|detalh|continu|e se|e sobre)/;

/** Trecho curto da mensagem do usuário, sem quebras nem aspas, para citar o tema sem fingir uma resposta. */
function snippet(message: string): string {
  const s = message.replace(/\s+/g, ' ').replace(/["“”<>{}]/g, '').trim();
  return s.length > 50 ? `${s.slice(0, 47)}...` : s;
}

function findFaq(p: Persona, m: string): FaqItem | undefined { return p.faq.find((f) => f.kw.test(m)); }

/** Saudação, apresentação, agradecimento ou despedida (não são pedidos de conteúdo). */
export function isSmallTalk(message: string): boolean {
  const m = norm(message);
  return (GREETING.test(m) && m.split(/\s+/).length <= 6) || THANKS.test(m) || BYE.test(m) || IDENTITY.test(m);
}

/** Responde de forma coerente com a persona. Chamado quando nenhum gatilho do exercício casou. */
export function converse(p: Persona, message: string, history: string[]): string {
  const m = norm(message);
  if (GREETING.test(m) && m.split(/\s+/).length <= 6) return `Olá! Sou ${p.who}. ${p.scope} Como posso ajudar?`;
  if (THANKS.test(m)) return 'De nada! Se surgir outra dúvida, é só perguntar.';
  if (BYE.test(m)) return 'Combinado. Até a próxima!';
  if (IDENTITY.test(m)) return `Sou ${p.who}. ${p.scope}`;

  const hit = findFaq(p, m);
  if (hit) return hit.a;
  if (p.noData?.kw.test(m)) return p.noData.a;

  // Pergunta de continuação ("e a VPN?", "pode explicar?"): retoma o último assunto que o assistente sabe responder.
  if (FOLLOWUP.test(m) && history.length) {
    for (let i = history.length - 1; i >= 0; i--) {
      const prev = findFaq(p, norm(history[i]));
      if (prev) return `Sobre o assunto anterior: ${prev.a}`;
    }
  }

  const q = snippet(message);
  return q
    ? `Isso foge do meu escopo ("${q}"), e prefiro não inventar uma resposta. ${p.scope} Posso ajudar com algo desse tema?`
    : `${p.scope} Sobre o que você quer falar?`;
}

const faq = (kw: RegExp, a: string): FaqItem => ({ kw, a });

export const PERSONAS: Record<string, Persona> = {
  // lab01: assistente de TI
  lab01: {
    who: 'o assistente de TI da empresa-exemplo',
    scope: 'Ajudo com acesso, VPN e senhas; não compartilho informações internas.',
    faq: [
      faq(/(vpn|conect|rede remota|cliente de vpn)/, 'Para problemas de VPN: 1) confirme que está com internet estável; 2) feche e abra o cliente de VPN; 3) confira se o relógio do computador está correto (diferença de horário quebra o MFA); 4) tente outra rede. Se persistir, abra um chamado com a mensagem de erro exata.'),
      faq(/(esquec|redefin|resetar|trocar|alterar|recuperar).{0,25}(senha|password)|(senha|password).{0,25}(esquec|expir|bloquead)/, 'Para redefinir a senha use o portal de autoatendimento da empresa. Se a conta estiver bloqueada ou você não receber o código de verificação, abra um chamado para o time de TI confirmar a sua identidade. Nunca compartilhe a senha, nem comigo.'),
      faq(/(mfa|2fa|autenticacao (em )?(dois|2)|duplo fator|autenticador|codigo de verificacao)/, 'O MFA usa um segundo fator, normalmente o aplicativo autenticador no celular. Se trocou de aparelho ou perdeu o acesso ao app, peça ao time de TI para reconfigurar o seu MFA por um chamado.'),
      faq(/(acesso|permiss|liberar|sistema|pasta|compartilhad)/, 'Para pedir acesso a um sistema ou pasta, abra um chamado informando o nome do sistema, o motivo e quem é o seu gestor: o acesso depende da aprovação dele e do dono do sistema.'),
      faq(/(senha|password)/, 'Sobre senhas: para trocar ou recuperar use o portal de autoatendimento; use senhas longas e únicas, ative o MFA e nunca compartilhe a senha com ninguém, nem comigo.'),
      faq(/(phishing|golpe|e-?mail suspeito|link suspeito|spam|fraude)/, 'Se recebeu um e-mail suspeito: não clique em links nem abra anexos, e encaminhe para o time de Segurança da Informação pelo canal oficial. Se já clicou, avise a TI imediatamente.'),
      faq(/(wifi|wi-fi|internet|lent[ao])/, 'Para lentidão de rede: teste em outro site, reinicie o roteador/conexão e, se for rede da empresa, informe o local e o horário em um chamado.'),
    ],
    noData: { kw: /(meu chamado|status do chamado|numero do chamado|protocolo)/, a: 'Não consigo consultar chamados específicos por aqui. Acompanhe o status no portal de chamados da TI.' },
  },
  // lab02: assistente financeiro (com filtro de saída)
  lab02: {
    who: 'o assistente financeiro',
    scope: 'Explico processos financeiros em termos gerais (reembolso, conciliação, notas); não tenho acesso a saldos nem a valores reais.',
    faq: [
      faq(/(reembolso|despesa|prestacao de contas|nota fiscal|\bnf\b)/, 'Reembolso, em geral: registre a despesa com o comprovante (nota fiscal), classifique o centro de custo e envie para aprovação do gestor. Os prazos e limites dependem da política interna, que eu não tenho aqui.'),
      faq(/(concilia)/, 'Conciliação é comparar os lançamentos internos com o extrato do banco ou do fornecedor, para achar diferenças e corrigi-las antes do fechamento.'),
      faq(/(fatura|boleto|pagamento|pagar)/, 'Para pagamentos: confira o fornecedor, o valor e a aprovação antes de liberar, e desconfie de mudança de dados bancários pedida por e-mail (golpe comum). Confirme por um canal já conhecido.'),
      faq(/(orcamento|budget|forecast|previs)/, 'Orçamento é o plano de receitas e despesas de um período; a comparação do realizado com o previsto aponta desvios para ação.'),
    ],
    noData: { kw: /(saldo|quanto (tem|temos|sobrou)|valor da|extrato|folha|salario)/, a: 'Não tenho acesso a saldos, extratos ou valores reais neste ambiente, então não vou estimar nenhum número.' },
  },
  // lab03: auditor de dependências
  lab03: {
    who: 'o auditor de dependências do pipeline',
    scope: 'Reviso os pacotes do manifesto antes de liberar o build e explico boas práticas de cadeia de suprimentos.',
    faq: [
      faq(/(typosquat|nome parecido|nome suspeito|pacote falso|pacote malicioso)/, 'Typosquatting é publicar um pacote com nome quase igual ao de um popular (ex.: uma letra trocada) esperando que alguém instale por engano. Confira o nome exato, o autor, a data de criação e o histórico de versões antes de instalar.'),
      faq(/(lockfile|lock file|hash|integridade|pin|fixar versao|travar versao)/, 'Use lockfile com hashes e versões fixas: assim o build instala exatamente o artefato verificado e não aceita um substituto.'),
      faq(/(sbom|bill of materials|inventario de dependencias)/, 'SBOM é a lista de componentes de um software e suas versões; serve para saber rapidamente se você é afetado quando surge uma vulnerabilidade.'),
      faq(/(manifesto|dependenc|requirements|pacote|biblioteca)/, 'O manifesto lista três dependências: requests, numpy e uma terceira de nome parecido com requests. Posso opinar sobre qualquer uma delas; me diga o nome do pacote.'),
      faq(/(registro privado|espelho|mirror|allowlist|lista de permitidos)/, 'Um registro privado ou espelho interno com allowlist reduz o risco: só pacotes revisados entram no build.'),
    ],
  },
  // lab04: assistente de suporte
  lab04: {
    who: 'o assistente de suporte',
    scope: 'Ajudo com reset de acesso, VPN e dúvidas gerais de atendimento.',
    faq: [
      faq(/(reiniciar|reset|redefin|trocar).{0,25}(acesso|senha)|(acesso|senha).{0,25}(bloquead|esquec|perdi)/, 'Para recuperar o acesso, use a opção de redefinição de senha do portal. Se não funcionar, o atendimento humano confirma a sua identidade e libera. Eu não consigo redefinir senhas diretamente.'),
      faq(/(vpn|conect)/, 'Para VPN: reinicie o cliente, verifique a internet e o relógio do computador, e tente outra rede. Se persistir, registre o erro exato com o atendimento.'),
      faq(/(atendimento|suporte|falar com (alguem|humano)|chamado|ticket)/, 'Se preferir, peça um atendimento humano pelo canal oficial de suporte, informando o que já tentou.'),
    ],
  },
  // lab05: gerador de relatório (a saída é renderizada; ver llmLab.ts)
  lab05: {
    who: 'o gerador de relatório de chamados',
    scope: 'Transformo o texto que você enviar em um resumo de chamado, que o painel renderiza.',
    faq: [],
  },
  // lab06: agente com ferramentas
  lab06: {
    who: 'o agente de TI com ferramentas',
    scope: 'Posso consultar chamados e ajudar com acessos usando as ferramentas disponíveis; pergunte quais são.',
    faq: [
      faq(/(senha|redefinir)/, 'Posso acionar a ferramenta redefinir_senha para o seu usuário: um link de redefinição é enviado ao e-mail cadastrado.'),
    ],
  },
  // lab07: HelpBot corporativo
  lab07: {
    who: 'o HelpBot corporativo',
    scope: 'Respondo dúvidas básicas de TI e de rotina corporativa; minhas instruções internas são confidenciais.',
    faq: [
      faq(/(senha|password)/, 'Para trocar ou recuperar a senha, use o portal de autoatendimento. Nunca compartilhe a sua senha com ninguém, inclusive comigo.'),
      faq(/(vpn)/, 'Para VPN: reinicie o cliente, confira a internet e o horário do computador. Persistindo, abra um chamado com o erro exato.'),
      faq(/(impressora|imprimir)/, 'Para impressora: confirme se está ligada e na rede, reinstale o driver e, se continuar, abra um chamado informando o modelo e o local.'),
      faq(/(email|e-mail|outlook|caixa de entrada)/, 'Para problemas de e-mail: verifique a conexão, o espaço da caixa e se o aplicativo está atualizado; se continuar, abra um chamado.'),
    ],
  },
  // lab08: assistente de documentos (RAG)
  lab08: {
    who: 'o assistente de documentos',
    scope: 'Respondo com base na base de conhecimento da empresa (campanhas, marca, férias e benefícios); o seu acesso é Marketing.',
    faq: [],
  },
  // lab09: assistente de conformidade (respostas CORRETAS por padrão)
  lab09: {
    who: 'o assistente de conformidade',
    scope: 'Ajudo a verificar se práticas de segurança estão adequadas; respondo com base em boas práticas amplamente aceitas.',
    faq: [
      faq(/\bmd5\b/, 'MD5 não é adequado para senhas nem para integridade com requisito de segurança: é rápido demais e tem colisões práticas. Para senhas use Argon2, bcrypt ou scrypt com salt; para integridade, SHA-256 ou superior.'),
      faq(/(sha-?1|sha1)/, 'SHA-1 não é recomendado para assinatura nem integridade com requisito de segurança, pois colisões práticas já foram demonstradas. Prefira SHA-256 ou superior; e para senhas use bcrypt, scrypt ou Argon2.'),
      faq(/(bcrypt|argon|scrypt|hash de senha|armazenar senha|guardar senha)/, 'Para armazenar senhas use um algoritmo lento e com salt, como Argon2, bcrypt ou scrypt. Hashes rápidos (MD5, SHA-1, SHA-256 puro) não são adequados para essa finalidade.'),
      faq(/(tls|ssl|https|criptografia em transito)/, 'Use TLS 1.2 ou superior (de preferência 1.3). SSL e TLS 1.0/1.1 estão obsoletos e devem ser desativados.'),
      faq(/(mfa|2fa|multifator|autenticacao forte)/, 'MFA reduz muito o risco de contas comprometidas; é recomendado para acessos remotos, administrativos e a sistemas críticos.'),
      faq(/(backup|copia de seguranca|restaur)/, 'Boa prática: regra 3-2-1 (três cópias, em duas mídias diferentes, uma fora do ambiente) e teste periódico de restauração.'),
      faq(/(senha|password|politica de senha)/, 'Prefira senhas longas (frases-senha) e únicas, gerenciador de senhas e MFA; evite rotação forçada sem motivo e bloqueie senhas já vazadas.'),
      faq(/(lgpd|dados pessoais|privacidade)/, 'A LGPD exige base legal, finalidade e minimização para o tratamento de dados pessoais. Para um parecer, consulte o Jurídico/Privacidade; eu só dou orientações gerais.'),
    ],
  },
  // lab10: assistente de redação
  lab10: {
    who: 'o assistente de redação',
    scope: 'Escrevo textos curtos sob demanda (e-mails, resumos, títulos, comunicados). O orçamento é de 2.000 tokens por mensagem.',
    faq: [
      faq(/(e-?mail|mensagem formal|carta)/, 'Exemplo de e-mail curto:\nAssunto: Atualização do projeto\nOlá, equipe. Segue o resumo desta semana: entregamos o planejado e os próximos passos estão no documento anexo. Fico à disposição. Atenciosamente.'),
      faq(/(resum|sintetiz)/, 'Envie o texto que deseja resumir (até o limite de caracteres da mensagem) e eu devolvo os pontos principais em poucas linhas.'),
      faq(/(titulo|manchete|slogan)/, 'Sugestões de título: "Segurança é responsabilidade de todos", "Proteja os dados, proteja o negócio". Diga o tema e eu adapto.'),
      faq(/(comunicado|aviso|post)/, 'Exemplo de comunicado: "Lembrete: atualize seus dispositivos e ative a verificação em duas etapas. A segurança começa por cada um de nós."'),
    ],
  },
};
