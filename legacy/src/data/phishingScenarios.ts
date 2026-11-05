import { PhishingEmail } from '../types';

export const PHISHING_SCENARIOS: PhishingEmail[] = [
  {
    id: 'phish-01',
    campaignTitle: 'Simulação 01: Comunicado Urgente de Atualização Salarial do RH',
    difficulty: 'Iniciante',
    senderName: 'Recursos Humanos - Portal de Benefícios',
    senderEmail: 'rh-notificacoes@emprersa-beneficios.net', // Typosquatting
    subject: '[CONFIDENCIAL] Atualização da Tabela Salarial e Bônus Anual 2026',
    date: 'Hoje, 09:12',
    previewText: 'Prezado colaborador, segue a nova tabela salarial aprovada pela diretoria. O prazo para confirmação dos dados bancários termina hoje às 18h.',
    headers: {
      from: 'Recursos Humanos <rh-notificacoes@emprersa-beneficios.net>',
      replyTo: 'coleta-dados@servidor-externo-ru.com',
      returnPath: 'bounce@servidor-externo-ru.com',
      spf: 'FAIL',
      dkim: 'FAIL',
      dmarc: 'FAIL',
      authResults: 'spf=fail (IP 185.190.22.10 not authorized) dkim=fail'
    },
    bodyHtml: `
      <div style="font-family: sans-serif; color: #1e293b; line-height: 1.5;">
        <div style="background-color: #0f172a; padding: 12px 20px; border-radius: 6px 6px 0 0; color: white;">
          <strong style="font-size: 15px; letter-spacing: 0.5px;">PORTAL DE TALENTOS & BENEFÍCIOS</strong>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; background-color: #ffffff; border-radius: 0 0 6px 6px;">
          <p>Olá, Colaborador(a),</p>
          <p>Temos o prazer de anunciar a homologação do novo <strong>Plano de Cargos e Salários 2026</strong>, aprovado pelo Conselho de Administração na última sexta-feira.</p>
          <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px; margin: 15px 0;">
            <p style="margin: 0; font-size: 13px; color: #334155;"><strong>ATENÇÃO:</strong> Todos os funcionários ativos devem confirmar suas informações bancárias e aceitar o aditivo contratual até <strong>hoje às 18:00</strong> para garantir a liberação do crédito na folha corrente.</p>
          </div>
          <p>Para visualizar a sua nova faixa salarial e validar os dados bancários com segurança:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://portal-rh-confirmacao-beneficios.online/login" target="_blank" style="background-color: #0284c7; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Acessar Minha Tabela de Remuneração &rarr;
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b;">Caso a confirmação não ocorra no prazo estabelecido, o pagamento poderá ser retido até o próximo ciclo financeiro de fechamento.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8;">Mensagem automática gerada pelo Sistema Integrado de Gestão de Pessoas. Não responda a este e-mail.</p>
        </div>
      </div>
    `,
    suspiciousLink: {
      displayText: 'Acessar Minha Tabela de Remuneração',
      actualUrl: 'https://portal-rh-confirmacao-beneficios.online/login'
    },
    redFlags: [
      {
        id: 'rf-1',
        title: 'Domínio do Remetente Falsificado (Typosquatting)',
        description: 'O email veio de "emprersa-beneficios.net" (com erro ortográfico intencional) e não do domínio corporativo oficial "@empresa.com.br".',
        severity: 'Crítica'
      },
      {
        id: 'rf-2',
        title: 'Urgência Artificial e Ameaça de Penalidade',
        description: 'Prazo curto ("até hoje às 18h") com ameaça de retenção salarial para pressionar a vítima a agir sem pensar.',
        severity: 'Alta'
      },
      {
        id: 'rf-3',
        title: 'Falha Total em SPF e DMARC nos Cabeçalhos',
        description: 'O servidor de correio não possui autorização legítima para disparar e-mails pela organização.',
        severity: 'Crítica'
      },
      {
        id: 'rf-4',
        title: 'Destino do Link Aponta para Domínio Externo Genérico',
        description: 'O botão aponta para ".online" em vez do portal interno da intranet da empresa.',
        severity: 'Alta'
      }
    ],
    educationalExplanation: {
      tactic: 'Phishing de Credenciais focado em Benefícios e Salários (Spear Phishing Temático).',
      psychologicalTrigger: 'Ganância (curiosidade sobre aumento salarial) e Medo (receio de não receber o salário no prazo).',
      howToPrevent: [
        'Sempre verifique o domínio exato do remetente após o "@" antes de abrir links.',
        'Passe o mouse por cima do botão sem clicar para conferir a URL real no rodapé do navegador.',
        'Em caso de dúvidas sobre holerites ou comunicados de RH, acesse a intranet digitando o endereço diretamente no navegador.'
      ]
    }
  },
  {
    id: 'phish-02',
    campaignTitle: 'Simulação 02: Ataque BEC (Comprometimento de Email do CEO)',
    difficulty: 'Intermediário',
    senderName: 'Carlos Mendonça - CEO',
    senderEmail: 'carlos.mendonca@empresa-directors.com',
    subject: '[RESTRITO] Solicitação Urgente e Confidencial de Transferência PIX',
    date: 'Ontem, 16:45',
    previewText: 'Olá, estou em reunião confidencial de M&A com investidores e sem acesso ao telefone. Preciso de um adiantamento urgente para um fornecedor homologado.',
    headers: {
      from: 'Carlos Mendonça <carlos.mendonca@empresa-directors.com>',
      replyTo: 'carlos.financeiro.exec@gmail.com', // Reply-to diferente!
      returnPath: 'mailer@vps-frankfurt-outbound.net',
      spf: 'NEUTRAL',
      dkim: 'NONE',
      dmarc: 'FAIL',
      authResults: 'dmarc=fail sender=empresa-directors.com'
    },
    bodyHtml: `
      <div style="font-family: sans-serif; color: #1e293b; line-height: 1.5; padding: 15px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
        <p>Prezada equipe financeira,</p>
        <p>Estou em uma reunião presencial sigilosa de aquisição com o conselho e não posso atender ligações no momento.</p>
        <p>Precisamos liquidar uma taxa de consultoria jurídica urgente no valor de <strong>R$ 47.850,00</strong> ainda hoje para não atrasar a assinatura do contrato.</p>
        <div style="background-color: #f1f5f9; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 13px; margin: 15px 0;">
          Favorecido: Consultoria Estratégica Alpha Ltda<br>
          Chave PIX (Aleatória): a8b3c941-7e12-4d2b-98f1-8899aabbccdd<br>
          Banco: 260 - Nu Pagamentos S.A.<br>
          Valor: R$ 47.850,00
        </div>
        <p>Por favor, realize a transferência e me envie o comprovante diretamente respondendo a este e-mail assim que concluído. Mantenham discrição absoluta.</p>
        <p>Atenciosamente,<br><strong>Carlos Mendonça</strong><br><span style="font-size: 12px; color: #64748b;">Chief Executive Officer (CEO)</span></p>
      </div>
    `,
    redFlags: [
      {
        id: 'rf-b1',
        title: 'Reply-To apontando para conta pessoal externa (@gmail.com)',
        description: 'Ao clicar em responder, a mensagem seria enviada para um endereço público não corporativo.',
        severity: 'Crítica'
      },
      {
        id: 'rf-b2',
        title: 'Tentativa de Bypass no Processo Padrão de Pagamentos',
        description: 'Pedidos de transferência sem abertura de chamado no ERP e sem aprovação de dupla custódia financeira.',
        severity: 'Crítica'
      },
      {
        id: 'rf-b3',
        title: 'Apelo à Autoridade Máxima com Imposição de Silêncio',
        description: 'O invasor se passa pelo CEO e exige sigilo ("reunião sigilosa", "não posso atender ligações") para impedir validação telefônica.',
        severity: 'Alta'
      }
    ],
    educationalExplanation: {
      tactic: 'Business Email Compromise (BEC) / CEO Fraud (Golpe do Falso Presidente).',
      psychologicalTrigger: 'Autoridade (figura do CEO) e Urgência com isolamento (proibição de ligar ou checar).',
      howToPrevent: [
        'NUNCA realize pagamentos extraordinários solicitados por e-mail sem confirmação por canal secundário seguro (ligação de voz conhecida ou presencial).',
        'Exija estritamente o fluxo de aprovação de 2 assinaturas corporativas para qualquer transação financeira.',
        'Inspecione o campo "Reply-To" em mensagens financeiras sensíveis.'
      ]
    }
  },
  {
    id: 'phish-03',
    campaignTitle: 'Simulação 03: Alerta de Quota do Microsoft 365 com Anexo Falso HTML',
    difficulty: 'Avançado',
    senderName: 'Microsoft Security Team',
    senderEmail: 'postmaster@outlook-security-admin.org',
    subject: '[ALERTA DE SEGURANÇA] Sua caixa postal excedeu 98% da capacidade máxima',
    date: 'Hoje, 08:05',
    previewText: 'Avisamos que 14 mensagens pendentes foram retidas no servidor. Abra o relatório anexo para liberar o recebimento de e-mails.',
    headers: {
      from: 'Microsoft 365 Postmaster <postmaster@outlook-security-admin.org>',
      replyTo: 'postmaster@outlook-security-admin.org',
      returnPath: 'mailer@relay-mx-cloud.net',
      spf: 'PASS',
      dkim: 'PASS',
      dmarc: 'NONE',
      authResults: 'spf=pass (mas domínio não pertence à Microsoft oficial)'
    },
    bodyHtml: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #242424; background: #faf9f8; padding: 20px; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <div style="width: 24px; height: 24px; background: #0078d4; border-radius: 2px; display: inline-block;"></div>
          <span style="font-weight: 600; font-size: 16px; color: #0078d4;">Microsoft 365</span>
        </div>
        <h2 style="font-size: 18px; margin: 0 0 10px 0; color: #d83b01;">Aviso de Esgotamento de Armazenamento</h2>
        <p style="font-size: 14px; margin: 0 0 15px 0;">A conta corporativa atingiu <strong>49.2 GB de 50.0 GB</strong>. A partir de hoje, e-mails recebidos de clientes externos estão sendo colocados em quarentena.</p>
        <p style="font-size: 14px;">Para evitar a exclusão permanente de mensagens recebidas, abra o arquivo de validação anexado abaixo e confirme sua cota:</p>
        <div style="border: 1px solid #d1d1d1; background: #ffffff; padding: 12px; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; margin: 20px 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: #fdf2f2; padding: 8px; border-radius: 4px; font-weight: bold; color: #e11d48; font-size: 11px;">HTML</div>
            <div>
              <div style="font-size: 13px; font-weight: 600;">Liberar_Quota_Armazenamento.html</div>
              <div style="font-size: 11px; color: #666;">24.5 KB &bull; Verificado por Antivírus</div>
            </div>
          </div>
          <span style="background: #0078d4; color: white; padding: 6px 14px; font-size: 12px; border-radius: 4px; font-weight: 600;">Baixar</span>
        </div>
        <p style="font-size: 12px; color: #666;">ID do Incidente: MS-EXCHANGE-2026-9941</p>
      </div>
    `,
    fakeAttachment: {
      name: 'Liberar_Quota_Armazenamento.html',
      size: '24.5 KB',
      extension: '.html',
      isDangerous: true
    },
    redFlags: [
      {
        id: 'rf-c1',
        title: 'Anexo em formato HTML com formulário falso embutido',
        description: 'Anexos .html ou .svg são comumente usados para hospedar páginas clonadas de login da Microsoft fora do alcance de firewalls da nuvem.',
        severity: 'Crítica'
      },
      {
        id: 'rf-c2',
        title: 'Domínio do Remetente Não Pertence à Microsoft',
        description: 'O domínio é "outlook-security-admin.org" registrado por criminosos, e não "microsoft.com".',
        severity: 'Crítica'
      },
      {
        id: 'rf-c3',
        title: 'Falso Sentimento de Gravidade Operacional',
        description: 'Informa que clientes não conseguirão entrar em contato, gerando aflição no funcionário.',
        severity: 'Alta'
      }
    ],
    educationalExplanation: {
      tactic: 'HTML Smuggling / Offline Credential Harvester.',
      psychologicalTrigger: 'Medo de perda de dados e interrupção do trabalho diário.',
      howToPrevent: [
        'NUNCA abra arquivos anexos com extensões .html, .hta, .js, .exe ou .vbs recebidos por e-mail.',
        'A Microsoft e equipes internas de TI nunca enviam arquivos HTML para ajuste de cota de caixa postal.',
        'Reporte imediatamente usando o botão corporativo de denúncia de phishing.'
      ]
    }
  }
];
