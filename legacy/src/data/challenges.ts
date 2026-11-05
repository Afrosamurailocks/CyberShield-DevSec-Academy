import { Challenge } from '../types';

export const CHALLENGES: Challenge[] = [
  {
    id: 'ctf-01',
    title: 'Bypass de Login via SQL Injection no Portal de Vendas',
    category: 'Web Security',
    difficulty: 'Iniciante',
    points: 100,
    corporateContext: 'Sistema interno de gestão de vendas e emissão de notas fiscais (ERP Corporativo).',
    description: 'Um pentest interno identificou que o formulário de login do portal de vendas concatena diretamente as entradas do usuário nas consultas ao banco de dados SQL. Explore a falha usando a técnica clássica de bypass para obter acesso ao perfil de administrador e capturar a flag.',
    flag: 'CYBER{sql_injection_bypass_master_2026}',
    author: 'Equipe de Segurança Ofensiva (Red Team)',
    solveCount: 142,
    tags: ['OWASP Top 10', 'SQLi', 'Auth Bypass', 'Web'],
    sandboxType: 'web_inspector',
    mockHttpEndpoint: {
      method: 'POST',
      url: '/api/v1/auth/internal-login',
      params: { username: "admin' OR '1'='1' --", password: 'qualquer_senha' },
      responseBody: '{"status": 200, "message": "Bem-vindo Administrador", "role": "admin", "token": "jwt_adm_access", "flag": "CYBER{sql_injection_bypass_master_2026}"}',
      vulnerableParam: 'username'
    },
    hints: [
      { id: 'h1', cost: 15, content: 'Tente fechar a aspa simples do SQL e injetar uma condição booleana sempre verdadeira, como: \' OR \'1\'=\'1' },
      { id: 'h2', cost: 25, content: 'Use o caractere de comentário SQL (-- ou /*) para anular a verificação de senha subsequente.' }
    ],
    sourceCodeSnippet: {
      language: 'typescript',
      fileName: 'authController.ts',
      code: `// CÓDIGO VULNERÁVEL IDENTIFICADO NO SISTEMA INTERNO:
app.post('/api/v1/auth/internal-login', async (req, res) => {
  const { username, password } = req.body;
  
  // FALHA GRAVE: Concatenação direta sem Prepared Statements
  const query = "SELECT * FROM employees WHERE user = '" + username + "' AND pass = '" + password + "'";
  const user = await db.rawQuery(query);
  
  if (user && user.length > 0) {
    return res.json({ status: 200, role: user[0].role, flag: user[0].vault_flag });
  }
  return res.status(401).json({ error: "Credenciais inválidas" });
});`
    },
    explanation: {
      rootCause: 'Falta de sanitização e uso de interpolação direta de strings em comandos SQL em vez de consultas parametrizadas (Prepared Statements).',
      realWorldImpact: 'Permite que atacantes externos ou funcionários mal-intencionados obtenham privilégios administrativos sem senha, acessem dados salariais e vazem dados de clientes.',
      cweReference: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
      mitigationBestPractices: [
        'Utilizar sempre Prepared Statements ou bibliotecas ORM seguras (como Prisma, Drizzle ou Knex).',
        'Aplicar o princípio do menor privilégio na conta de serviço do banco de dados.',
        'Habilitar Web Application Firewall (WAF) com regras de detecção de SQLi.'
      ]
    }
  },
  {
    id: 'ctf-02',
    title: 'Análise de Hash MD5 de Senha de Banco Vazada',
    category: 'Criptografia & Senhas',
    difficulty: 'Iniciante',
    points: 100,
    corporateContext: 'Base de dados legada de testes migrada para o repositório de homologação.',
    description: 'Durante uma auditoria na filial, foi encontrado um dump de configuração contendo o hash MD5 da senha do usuário "suporte_financeiro": e10adc3949ba59abbe56e057f20f883e. Decifre essa senha fraca para construir a flag no formato CYBER{senha_revelada}.',
    flag: 'CYBER{123456}',
    author: 'SOC Corporativo',
    solveCount: 168,
    tags: ['Hashes', 'Criptografia', 'MD5', 'Senhas Fracas'],
    sandboxType: 'terminal',
    terminalPrompt: 'analyst@cybershield-soc:~$',
    initialFiles: {
      'leaked_hashes.txt': 'usuario: suporte_financeiro\nalgoritmo: MD5\nhash: e10adc3949ba59abbe56e057f20f883e\nobservacao: O funcionario utilizava uma sequencia numerica muito comum.',
      'wordlist_top10.txt': 'password\n123456\nqwerty\nadmin123\n12345678\nwelcome\nempresa2024'
    },
    hints: [
      { id: 'h1', cost: 10, content: 'Você pode testar calcular o hash md5 das senhas da wordlist usando o comando: md5 <palavra>' },
      { id: 'h2', cost: 20, content: 'A senha é uma das sequências numéricas de 6 dígitos mais comuns do mundo.' }
    ],
    explanation: {
      rootCause: 'Uso de algoritmo obsoleto e quebrado (MD5 sem salt) associado à ausência de política de complexidade de senhas na empresa.',
      realWorldImpact: 'Senhas baseadas em MD5 sem salt podem ser quebradas em microssegundos com tabelas Rainbow ou wordlists simples.',
      cweReference: 'CWE-328: Use of Weak Hash',
      mitigationBestPractices: [
        'Migrar obrigatoriamente para algoritmos modernos de derivação de chave como Argon2id ou bcrypt com fator de custo adequado.',
        'Impor senhas de no mínimo 14 caracteres com autenticação de dois fatores (2FA/MFA) obrigatória.',
        'Verificar se as senhas constam em bases de vazamentos públicos (HaveIBeenPwned API).'
      ]
    }
  },
  {
    id: 'ctf-03',
    title: 'Falha IDOR no Portal de Holerites dos Colaboradores',
    category: 'Web Security',
    difficulty: 'Intermediário',
    points: 200,
    corporateContext: 'Portal de Recursos Humanos e benefícios corporativos.',
    description: 'Um colaborador percebeu que ao baixar seu holerite na URL "/api/payrolls/user?employee_id=1042", a API não valida se o usuário autenticado na sessão realmente tem permissão para visualizar o ID requisitado. Altere o parâmetro da requisição para acessar o holerite da Diretoria (ID 1001) e capturar a flag de auditoria contida no documento.',
    flag: 'CYBER{idor_access_control_broken_1001}',
    author: 'Compliance & Cyber Audit',
    solveCount: 95,
    tags: ['IDOR', 'Broken Object Level Auth', 'API Security', 'OWASP'],
    sandboxType: 'web_inspector',
    mockHttpEndpoint: {
      method: 'GET',
      url: '/api/payrolls/user?employee_id=1001',
      params: { employee_id: '1001' },
      responseBody: '{"status": 200, "employee": "Diretor Executivo", "matricula": "1001", "salario_base": "R$ 48.000,00", "bonus": "R$ 15.000,00", "audit_token": "CYBER{idor_access_control_broken_1001}"}',
      vulnerableParam: 'employee_id'
    },
    hints: [
      { id: 'h1', cost: 15, content: 'Observe como o parâmetro employee_id é passado na URL. O que acontece se você mudar para 1001?' },
      { id: 'h2', cost: 30, content: 'Submeta a requisição GET com employee_id=1001 no console interativo da API.' }
    ],
    sourceCodeSnippet: {
      language: 'javascript',
      fileName: 'payrollService.js',
      code: `// CÓDIGO DA API DE HOLERITES:
router.get('/payrolls/user', async (req, res) => {
  // FALHA: Pega o id do query param sem checar se bate com req.session.user.id
  const requestedId = req.query.employee_id;
  const payroll = await db.query('SELECT * FROM payrolls WHERE employee_id = ?', [requestedId]);
  
  // Qualquer usuário logado pode visualizar o holerite de qualquer outro funcionário!
  res.json(payroll);
});`
    },
    explanation: {
      rootCause: 'Insecure Direct Object Reference (IDOR): A aplicação confia no identificador enviado pelo cliente sem checar autorização no nível do objeto.',
      realWorldImpact: 'Violação severa da LGPD/GDPR, vazamento de salários, CPF e dados bancários de todos os empregados da companhia.',
      cweReference: 'CWE-639: Authorization Bypass Through User-Controlled Key',
      mitigationBestPractices: [
        'Sempre validar se a entidade requisitada pertence ao usuário autenticado extraído do token de sessão.',
        'Utilizar UUIDs aleatórios em vez de IDs sequenciais previsíveis.',
        'Implementar testes automatizados de controle de acesso (ABAC/RBAC) no pipeline CI/CD.'
      ]
    }
  },
  {
    id: 'ctf-04',
    title: 'Adulteração de Privilégio em Token JWT no Painel Cloud',
    category: 'Cloud & APIs',
    difficulty: 'Intermediário',
    points: 250,
    corporateContext: 'Console de orquestração de microsserviços em Nuvem.',
    description: 'O painel de monitoramento em nuvem utiliza JSON Web Tokens (JWT) para identificar os usuários. Ao inspecionar seu cookie de sessão, você encontrou o payload codificado em Base64: {"sub":"colaborador_comum","role":"guest","exp":1799999999}. Decodifique, altere a claim "role" para "admin" ou explore a assinatura com algoritmo nulo para obter acesso administrativo.',
    flag: 'CYBER{jwt_privilege_escalation_jwt_2026}',
    author: 'Cloud Security Architect',
    solveCount: 78,
    tags: ['JWT', 'Privilege Escalation', 'API', 'Cloud'],
    sandboxType: 'terminal',
    terminalPrompt: 'dev@cloud-gateway:~$',
    initialFiles: {
      'current_token.jwt': 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJmdW5jaW9uYXJpbyIsInJvbGUiOiJndWVzdCIsImNvbXBhbnkiOiJjeWJlcnNoaWVsZCJ9.',
      'jwt_debugger.py': '# Dica: tokens com alg=none nao verificam assinatura!\n# O servidor aceita tokens adulterados com role=admin se alg for "none".'
    },
    hints: [
      { id: 'h1', cost: 20, content: 'Decodifique a parte do meio (payload) do JWT que está em Base64. Você verá {"sub":"funcionario","role":"guest",...}' },
      { id: 'h2', cost: 35, content: 'Modifique o payload para ter "role":"admin" e codifique de volta em Base64, depois execute o comando: curl -H "Authorization: Bearer <token>" /api/admin/flag' }
    ],
    explanation: {
      rootCause: 'Aceitação de algoritmo "none" na validação de JWT na biblioteca do backend, permitindo forja de tokens sem conhecer a chave secreta.',
      realWorldImpact: 'Elevação de privilégios irrestrita para qualquer usuário comum na nuvem interna.',
      cweReference: 'CWE-347: Improper Verification of Cryptographic Signature',
      mitigationBestPractices: [
        'Desabilitar explicitamente o algoritmo "none" e algoritmos fracos na validação de JWTs.',
        'Utilizar chaves assimétricas seguras (RS256 ou Ed25519) com rotação periódica via JWKS.',
        'Armazenar segredos de assinatura em cofres gerenciados (como Google Secret Manager ou AWS KMS).'
      ]
    }
  },
  {
    id: 'ctf-05',
    title: 'Investigação de Tráfego C2 em Logs de Firewall/Proxy',
    category: 'Forense & Logs',
    difficulty: 'Avançado',
    points: 300,
    corporateContext: 'Central de Operações de Segurança (SOC) corporativo.',
    description: 'O time de resposta a incidentes detectou tráfego anômalo saindo de um endpoint da equipe de Finanças. Analise os registros de rede do proxy corporativo, identifique o domínio de Comando e Controle (C2) que recebe requisições periódicas a cada 60 segundos com exfiltração em subdomínio codificado em Hex, e encontre a flag escondida nos pacotes.',
    flag: 'CYBER{dns_tunneling_c2_exfiltration_detected}',
    author: 'SOC Incident Responder (L3)',
    solveCount: 43,
    tags: ['SOC', 'Logs', 'Malware C2', 'Exfiltration', 'DNS'],
    sandboxType: 'log_viewer',
    networkLogs: [
      { time: '14:02:11', source: '192.168.10.45', destination: '8.8.8.8:53', protocol: 'DNS', payload: 'QUERY A google.com (Normal)' },
      { time: '14:03:00', source: '192.168.10.45', destination: '185.220.101.5:80', protocol: 'HTTP', payload: 'GET /checkin?host=fin-pc04 (Beaconing Heartbeat)' },
      { time: '14:04:00', source: '192.168.10.45', destination: '185.220.101.5:80', protocol: 'HTTP', payload: 'GET /checkin?host=fin-pc04 (Beaconing Heartbeat)' },
      { time: '14:05:00', source: '192.168.10.45', destination: '185.220.101.5:80', protocol: 'HTTP', payload: 'POST /data?exfil=Q1lCRVJ7ZG5zX3R1bm5lbGluZ19jMl9leGZpbHRyYXRpb25fZGV0ZWN0ZWR9 (Exfiltração Base64)', flagged: true },
      { time: '14:06:00', source: '192.168.10.45', destination: '185.220.101.5:80', protocol: 'HTTP', payload: 'GET /checkin?host=fin-pc04 (Beaconing Heartbeat)' }
    ],
    hints: [
      { id: 'h1', cost: 25, content: 'Procure por conexões que ocorrem em intervalos regulares exatos (beaconing) para o IP 185.220.101.5.' },
      { id: 'h2', cost: 40, content: 'No payload da requisição POST às 14:05:00, há uma string Base64 no parâmetro exfil. Decodifique-a!' }
    ],
    explanation: {
      rootCause: 'Endpoint corporativo infectado por trojan/downloader que estabelece canal de Comando e Controle (C2) e exfiltra dados sensíveis por HTTP/DNS.',
      realWorldImpact: 'Vazamento contínuo de credenciais corporativas, documentos internos e possibilidade de movimentação lateral para ransomware.',
      cweReference: 'CWE-319: Cleartext Transmission of Sensitive Information',
      mitigationBestPractices: [
        'Implantar solução de EDR (Endpoint Detection and Response) com bloqueio comportamental.',
        'Filtrar tráfego de saída (Egress Filtering) em firewall corporativo e inspecionar tráfego TLS com proxy.',
        'Isolar imediatamente máquinas que apresentem indicadores de comprometimento (IoCs).'
      ]
    }
  },
  {
    id: 'ctf-06',
    title: 'Vazamento de Chave de API no Git Corporativo (OSINT)',
    category: 'Cloud & APIs',
    difficulty: 'Iniciante',
    points: 150,
    corporateContext: 'Repositório de código-fonte interno da equipe de Desenvolvimento.',
    description: 'Um desenvolvedor júnior cometeu uma chave de produção no histórico de commits do repositório git do sistema de pagamentos. Embora o arquivo tenha sido deletado no commit mais recente, a chave ainda existe nos commits anteriores. Navegue no git log para recuperar o segredo e capturar a flag.',
    flag: 'CYBER{git_history_leaks_secrets_forever}',
    author: 'DevSecOps Team',
    solveCount: 112,
    tags: ['Git', 'Secrets Leak', 'OSINT', 'DevSecOps'],
    sandboxType: 'terminal',
    terminalPrompt: 'developer@workstation:~/payment-service$',
    initialFiles: {
      'README.md': '# Payment Service API\nServiço interno de processamento de pagamentos.\nStatus: Em produção.',
      '.git_history.log': `commit 9fa81bc (HEAD -> main)
Author: Dev Junior <junior@empresa.com>
Date:   Yesterday
    chore: remover config.json com credencial por seguranca

commit 4b21e89
Author: Dev Junior <junior@empresa.com>
Date:   2 days ago
    feat: adicionar conexao com gateway de producao
    diff:
    + const API_KEY = "CYBER{git_history_leaks_secrets_forever}";
    + const GATEWAY_URL = "https://pay.internal-secure.com";

commit 1c028aa
Author: Tech Lead <lead@empresa.com>
Date:   1 week ago
    init: setup inicial do projeto`
    },
    hints: [
      { id: 'h1', cost: 15, content: 'Leia o arquivo .git_history.log usando o comando "cat .git_history.log".' },
      { id: 'h2', cost: 25, content: 'Procure pelo commit "4b21e89" onde a chave foi adicionada no diff.' }
    ],
    explanation: {
      rootCause: 'Armazenamento de credenciais e chaves criptográficas em texto claro no controle de versão.',
      realWorldImpact: 'Qualquer pessoa com acesso de leitura ao repositório (ou caso o repositório seja tornado público acidentalmente) pode assumir o controle total dos serviços de pagamento.',
      cweReference: 'CWE-798: Use of Hard-coded Credentials',
      mitigationBestPractices: [
        'Utilizar ferramentas de Git Pre-commit Hooks (como git-secrets, Trufflehog ou Gitleaks) para impedir commits com tokens.',
        'Utilizar variáveis de ambiente injetadas em tempo de execução via Secret Managers.',
        'Rotacionar imediatamente qualquer credencial que tenha sido commitada, mesmo que em branches privadas.'
      ]
    }
  },
  {
    id: 'ctf-07',
    title: 'Engenharia Social: Falso Alerta de Segurança e Spoofing',
    category: 'Engenharia Social',
    difficulty: 'Iniciante',
    points: 120,
    corporateContext: 'Caixa postal dos colaboradores da área Administrativa.',
    description: 'Um email supostamente vindo de "suporte@sua-empresa.com" alertou sobre "Troca Obrigatória de Senha em 15 minutos". Ao inspecionar os cabeçalhos brutos da mensagem, descubra a falha de autenticação SPF/DMARC e identifique o servidor SMTP invasor que gerou a tentativa para extrair a flag.',
    flag: 'CYBER{spf_dmarc_fail_spoofed_sender_caught}',
    author: 'Security Awareness Lead',
    solveCount: 130,
    tags: ['Phishing', 'Email Security', 'SPF', 'DMARC', 'Spoofing'],
    sandboxType: 'code_review',
    sourceCodeSnippet: {
      language: 'http',
      fileName: 'email_headers.eml',
      code: `Received: from mail.attacker-spoof-relay.net (198.51.100.77)
    by mx.empresa-protegida.com with ESMTP id ABC1234
    for <colaborador@empresa-protegida.com>; Mon, 12 Oct 2026 09:14:22 -0300
From: "Equipe de TI Corporativa" <suporte@empresa-protegida.com>
Reply-To: <urgente-coleta@attacker-spoof-relay.net>
Subject: [URGENTE] Bloqueio Imediato da sua Conta Corporativa em 15 minutos!
Authentication-Results: mx.empresa-protegida.com;
    spf=fail (sender IP 198.51.100.77 is not permitted by domain)
    dkim=none (no signature found)
    dmarc=fail action=quarantine
X-Phish-Flag: CYBER{spf_dmarc_fail_spoofed_sender_caught}
Content-Type: text/html; charset="UTF-8"

Prezado Colaborador,
Sua conta sera desativada permanentemente. Clique no link para manter o acesso:
https://login-microsoft365-recadastro-falso.com/login`
    },
    hints: [
      { id: 'h1', cost: 15, content: 'Verifique as linhas Authentication-Results e os campos com "X-Phish-Flag".' },
      { id: 'h2', cost: 20, content: 'A flag está declarada em um dos cabeçalhos customizados inspecionados pelo gateway.' }
    ],
    explanation: {
      rootCause: 'Tentativa de falsificação de identidade (Email Spoofing) explorando senso de urgência e medo de desligamento/bloqueio.',
      realWorldImpact: 'Captura massiva de credenciais corporativas de colaboradores desavisados.',
      cweReference: 'CWE-290: Authentication Bypass by Spoofing',
      mitigationBestPractices: [
        'Configurar políticas DMARC rigorosas em modo "reject" (p=reject).',
        'Capacitar colaboradores a nunca clicar em links sob pressão de tempo sem confirmar pelo canal interno oficial de TI.',
        'Implementar botão de denúncia de phishing no cliente de email oficial.'
      ]
    }
  },
  {
    id: 'ctf-08',
    title: 'Bucket Cloud Storage Exposto com Backup de BD',
    category: 'Cloud & APIs',
    difficulty: 'Intermediário',
    points: 220,
    corporateContext: 'Infraestrutura de nuvem multi-cloud corporativa.',
    description: 'Um bucket de armazenamento na nuvem foi configurado por engano com permissões "AllUsers: READ" durante a homologação de um novo microserviço. Explore a listagem do bucket através da API de armazenamento e encontre o arquivo com as credenciais administrativas.',
    flag: 'CYBER{cloud_bucket_public_acl_misconfig_2026}',
    author: 'Cloud Infrastructure Security',
    solveCount: 88,
    tags: ['Cloud', 'S3/GCS', 'Misconfiguration', 'Bucket Leak'],
    sandboxType: 'terminal',
    terminalPrompt: 'auditor@sec-cloud-cli:~$',
    initialFiles: {
      'bucket_manifest.json': `{
  "bucket": "empresa-infra-prod-backup-public",
  "acl": "public-read",
  "objects": [
    {"name": "index.html", "size": "1.2KB"},
    {"name": "assets/logo.png", "size": "45KB"},
    {"name": "internal_confidential/db_master_credentials.txt", "size": "240B", "flag_included": true}
  ]
}`,
      'db_master_credentials.txt': `[CREDENCIAIS DE PRODUCAO VAZADAS VIA BUCKET PUBLICO]
DB_HOST=prod-cluster-01.internal
DB_USER=master_dba
DB_PASS=SuperSecr3t#2026
FLAG_AUDITORIA=CYBER{cloud_bucket_public_acl_misconfig_2026}
AVISO: Corrija as politicas IAM deste bucket imediatamente!`
    },
    hints: [
      { id: 'h1', cost: 15, content: 'Use "cat internal_confidential/db_master_credentials.txt" ou "cat db_master_credentials.txt".' },
      { id: 'h2', cost: 25, content: 'O arquivo de credenciais já está listado nos arquivos do bucket público.' }
    ],
    explanation: {
      rootCause: 'Configuração errônea de listas de controle de acesso (ACLs) permitindo leitura anônima global.',
      realWorldImpact: 'Exposição de dumps de bancos de dados inteiros na internet, levando a chantagens e vazamentos em massa.',
      cweReference: 'CWE-732: Incorrect Permission Assignment for Critical Resource',
      mitigationBestPractices: [
        'Habilitar bloqueio de acesso público a nível de conta na nuvem (Block Public Access / Organization Policies).',
        'Executar ferramentas de CSPM (Cloud Security Posture Management) que alertam sobre recursos públicos.',
        'Auditar periodicamente permissões de buckets de arquivos confidenciais.'
      ]
    }
  }
];
