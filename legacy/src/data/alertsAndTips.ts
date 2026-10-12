import { SecurityAlert, DailyTip } from '../types';

export const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: 'alt-01',
    title: 'ALERTA URGENTE: Campanha Ativa de Phishing com Falso Bônus Salarial',
    urgency: 'Crítico',
    timestamp: 'Há 18 minutos',
    message: 'O SOC detectou disparos em massa de e-mails fingindo ser do RH da empresa prometendo reajuste salarial com link para "emprersa-beneficios.net". Não clique em links e reporte imediatamente através do botão de simulação!',
    actionRequired: 'Verificar remetentes e não abrir anexos suspeitos',
    isRead: false,
    category: 'Engenharia Social'
  },
  {
    id: 'alt-02',
    title: 'AVISO DE PATCH: Vulnerabilidade Crítica de Execução de Código em Clientes VPN',
    urgency: 'Alto',
    timestamp: 'Hoje, 07:30',
    message: 'Foi liberada a atualização emergencial v5.2.8 do nosso cliente VPN oficial para corrigir CVE-2026-3841. Reinicie seu notebook corporativo para aplicar a atualização automática.',
    actionRequired: 'Reiniciar a máquina corporativa ao final do expediente',
    isRead: false,
    category: 'Infraestrutura'
  },
  {
    id: 'alt-03',
    title: 'COMUNICADO: Migração Obrigatória para Chaves Passkey (WebAuthn)',
    urgency: 'Informativo',
    timestamp: 'Ontem, 14:00',
    message: 'A partir de 1º de Novembro, o acesso ao GitLab e AWS exigirá biometria ou chave de segurança física FIDO2, eliminando autenticações vulneráveis por SMS.',
    actionRequired: 'Configurar sua chave no portal de identidade',
    isRead: true,
    category: 'Identidade'
  }
];

export const DAILY_TIPS: DailyTip[] = [
  {
    id: 'tip-01',
    dayIndex: 1,
    title: 'Dica do Dia: O Atalho Mais Valioso da Sua Mesa',
    shortTip: 'Sempre bloqueie sua tela ao se levantar: aperte Windows + L (ou Control + Command + Q no Mac).',
    detailedAction: 'Deixar sua máquina desbloqueada enquanto vai tomar café ou almoçar permite ataques do tipo "Evil Maid", onde qualquer pessoa pode plugar um Rubber Ducky USB ou acessar seus e-mails em menos de 10 segundos.',
    category: 'Segurança Física & Estação',
    author: 'CISO Office'
  },
  {
    id: 'tip-02',
    dayIndex: 2,
    title: 'Dica do Dia: Como Identificar Links Falsos em 2 Segundos',
    shortTip: 'Passe o cursor sobre qualquer botão antes de clicar e olhe o canto inferior esquerdo da tela.',
    detailedAction: 'Criminosos frequentemente usam textos visuais como "https://microsoft.com" cujo link real por trás aponta para domínios maliciosos. O navegador sempre exibe a verdade no rodapé da janela!',
    category: 'Navegação Segura',
    author: 'SOC Corporativo'
  },
  {
    id: 'tip-03',
    dayIndex: 3,
    title: 'Dica do Dia: Frases-Senha vs Senhas Complexas Impossíveis',
    shortTip: 'Prefira 4 palavras aleatórias fáceis de lembrar (ex: cavalo-azul-sorvete-relampago) a "P@$$w0rd!".',
    detailedAction: 'O comprimento é o fator determinante contra ataques de força bruta. Uma frase de 20 caracteres leva séculos para ser quebrada por supercomputadores e é fácil de você memorizar sem anotar em post-its.',
    category: 'Gestão de Senhas',
    author: 'Blue Team'
  },
  {
    id: 'tip-04',
    dayIndex: 4,
    title: 'Dica do Dia: Cuidado com o Perigo dos Wi-Fi Abertos',
    shortTip: 'Em cafés e aeroportos, jamais acesse sistemas internos sem ligar a VPN corporativa.',
    detailedAction: 'Redes públicas desprotegidas permitem que invasores realizem ataques Man-in-the-Middle (MitM) ou criem redes gêmeas falsas (Evil Twin) para interceptar seu tráfego de navegação.',
    category: 'Rede & Trabalho Remoto',
    author: 'Infraestrutura'
  },
  {
    id: 'tip-05',
    dayIndex: 5,
    title: 'Dica do Dia: A Regra de Ouro Contra Golpes de CEO / BEC',
    shortTip: 'Recebeu pedido de PIX ou envio de documentos urgentes de um diretor? Confirme por telefone.',
    detailedAction: 'Criminosos fingem ser executivos alegando reuniões sigilosas. A política corporativa proíbe ordens financeiras apenas por e-mail: faça uma chamada de voz curta para confirmar antes de executar.',
    category: 'Engenharia Social',
    author: 'Compliance'
  }
];
