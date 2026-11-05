<div align="center">

# 🛡️ CyberShield DevSec Academy

**Trilha de formação de Security Champions: AppSec (OWASP), privacidade (LGPD), CIS Controls, ISO/IEC 27001 e segurança de aplicações com LLM.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![OWASP](https://img.shields.io/badge/OWASP-Top%2010%202025-red)
![Trilhas](https://img.shields.io/badge/trilhas-6-orange)
![Testes](https://img.shields.io/badge/testes%20de%20conte%C3%BAdo-73-brightgreen)

![Visão geral](docs/screenshots/visao-geral.jpg)

</div>

> ⚠️ **Ambiente de treinamento.** O backend dos labs OWASP é **intencionalmente vulnerável e realmente explorável**. Rode **apenas localmente**; nunca exponha à internet nem reutilize este código em produção.

> 📝 **Todo o conteúdo educativo (LGPD, CIS, ISO, LLM, laboratório de prompts e selo) é rascunho** e exige revisão humana (Segurança da Informação, Privacidade/Jurídico, Compliance e AI Guild) antes de uso externo. Casos reais só entram com fonte pública lida e "Limites da fonte"; cenários são fictícios.

---

## Sumário

- [Visão geral](#visão-geral)
- [A jornada Security Champion](#a-jornada-security-champion)
- [Novidades desta versão](#novidades-desta-versão)
- [Quick start](#quick-start)
- [Labs OWASP (AppSec)](#labs-owasp-appsec)
- [Trilhas de conteúdo](#trilhas-de-conteúdo): [LGPD](#lgpd) · [CIS Controls](#cis-controls-v81) · [ISO 27001](#isoiec-270012022) · [LLM](#segurança-com-llm-owasp-top-10-for-llm-applications-2025)
- [Laboratório de prompts](#laboratório-de-prompts)
- [Jornada e selo Security Champion](#jornada-e-selo-security-champion)
- [Autenticação, usuários e relatório de conformidade](#autenticação-usuários-e-relatório-de-conformidade)
- [Scripts](#scripts)
- [Configuração](#configuração)
- [Arquitetura](#arquitetura)
- [Garantias de segurança do host](#garantias-de-segurança-do-host)
- [Testes](#testes)
- [Referências](#referências)

---

## Visão geral

| Item | Detalhe |
|------|---------|
| **Objetivo** | Formar Security Champions: o colaborador percorre 6 trilhas e, ao final, emite um selo interno de conclusão |
| **Público-alvo** | Desenvolvedores e demais colaboradores (LGPD e CIS são em linguagem não técnica; OWASP e LLM têm pegada técnica) |
| **Conteúdo** | 11 labs OWASP (1.760 pts) · trilha LGPD (9 módulos, 31 cenários) · CIS v8.1 (19 módulos, 87 cenários) · ISO 27001:2022 (12 módulos, 48 cenários) · LLM (10 módulos, 30 cenários + Laboratório de prompts como avaliação final) · 10 assistentes simulados no laboratório de prompts |
| **Casos reais** | 18 (CIS) + 11 (ISO) + 10 (LLM) + casos da LGPD, todos com fonte pública citada e "Limites da fonte" |
| **Ferramentas embutidas** | Console HTTP (repeater estilo Burp), workbench com Base64, JWT, hash, URL, CRLF, prototype pollution e `node-serialize` |
| **Progresso** | Quizzes e labs: UI no `localStorage`. **Selo:** registrado e assinado no servidor (ver [Jornada e selo](#jornada-e-selo-security-champion)) |
| **Banco** | SQLite em memória para os labs (zero setup); Postgres/Supabase opcional. Registro do selo em `data/` (arquivo JSON) |
| **Identidade visual** | Opah IT (Poppins/Open Sans/JetBrains Mono, fontes locais em `public/fonts`; laranja `#ee7d30` / grafite `#1e1e20`) |

## A jornada Security Champion

Ordem sugerida das seis trilhas (seletor **OWASP / LGPD / CIS / ISO / LLM** no menu lateral, mais o botão **Jornada Security Champion**):

| # | Trilha | O que cobre |
|---|--------|-------------|
| 1 | **LGPD** | Dados pessoais no dia a dia, direitos do titular, incidentes; avaliação final de 15 cenários |
| 2 | **CIS Controls v8.1** | Os 18 controles com caso real, cenários avançados e avaliação final integrada |
| 3 | **ISO/IEC 27001:2022** | Preparação para a certificação: cláusulas 4 a 10, Anexo A e avaliação em formato de auditoria |
| 4 | **OWASP web (labs)** | 11 labs de ataque e correção em kill chain |
| 5 | **LLM (trilha)** | OWASP Top 10 for LLM Applications 2025 com casos reais |
| 6 | **LLM (laboratório)** | Avaliação final da trilha LLM: ataque a assistentes simulados e captura de flags |

O **nível do selo** (Bronze 70%, Prata 85%, Ouro 100%) é o da trilha mais atrasada.

## Novidades desta versão

- **Quatro trilhas de conteúdo novas** (LGPD, CIS, ISO 27001, LLM) no mesmo motor: contexto → caso real → decisão → entenda → boas práticas → referências; gabarito só no servidor.
- **Laboratório de prompts**: 10 assistentes simulados e vulneráveis, flags fictícias, dicas e lição de correção.
- **Jornada Security Champion**: rota, níveis, selo SVG (anel de 6 segmentos) e credencial em PNG/PDF, com **progresso e selo registrados e assinados no servidor** e verificação pública por ID.
- **Qualidade do quiz**: corrigido o viés em que a resposta correta era a mais longa em 100% dos 166 cenários; opções reescritas, posição da correta embaralhada e testes que impedem a regressão.
- **Testes**: `npm run test:content` (73 testes) além de `test:labs` e `test:tools`.
- **Identidade visual Opah IT**, dashboard e catálogo sóbrios (hairlines, raios pequenos), acessibilidade (tablist com setas, `focus-visible`, `aria-hidden` em ícones) e limite de 180 requisições/min por IP nas rotas de resposta.
- Mantido do projeto original: navegação pela kill chain real, workbench de interceptação tolerante, A06 com caixa de e-mail simulada, A09 redesenhado e gabarito do professor em PDF.

## Quick start

**Pré-requisitos:** Node.js 22+ (o backend usa `node:sqlite`) e npm.

```bash
git clone https://github.com/Cyber-Opah/CyberShield-DevSec-Academy.git
cd CyberShield-DevSec-Academy
git checkout development

npm install --legacy-peer-deps
npm run dev
```

| Serviço | URL |
|---------|-----|
| Frontend (React/Vite) | http://localhost:3000 |
| Backend (Express + SQLite) | http://localhost:4000/api |

O Vite faz proxy de `/api` → `:4000`, então basta abrir a porta 3000.

## Labs OWASP (AppSec)

Cada laboratório conduz o aluno por quatro etapas:

| # | Etapa | O que acontece |
|---|-------|----------------|
| 1 | **Atacar** | Dispare requisições HTTP cruas contra o endpoint vulnerável; a flag aparece realçada na resposta |
| 2 | **Entender** | Veja a causa-raiz e o código exato que o dev escreveu |
| 3 | **Corrigir** | Estude a versão segura (secure coding) e o checklist de remediação |
| 4 | **Referenciar** | Aprofunde com OWASP, CWE e CVEs relacionados |

As requisições de exemplo são *baselines* legítimos: respostas `401/400/403/500` nelas são **intencionais**. O aluno precisa adulterar a requisição para explorar; o payload só aparece nas dicas (opt-in) e no writeup. Todos os labs são subsistemas de uma empresa fictícia (*Nexus Varejo S.A.*) e formam um pentest black-box encadeado.

| OWASP:2025 | Lab | CWE | Nível | Pts | Passo na kill chain |
|-----------|-----|-----|-------|----:|:-------------------:|
| A01 | IDOR no portal de holerites | CWE-639 | Iniciante | 100 | 3 |
| A01 (SSRF) | SSRF para metadados internos — o SSRF foi incorporado ao A01 em 2025 | CWE-918 | Avançado | 200 | 8 |
| A02 | Endpoint de debug exposto em produção | CWE-16 | Iniciante | 120 | 4 |
| A03 | Componente desatualizado com CVE conhecido (prototype pollution) | CWE-1104 | Intermediário | 150 | 7 |
| A04 | Token de sessão reversível (Base64 não é cifra) | CWE-311 | Iniciante | 120 | 2 |
| A05 | SQL Injection — bypass de autenticação e dump de dados | CWE-89 | Intermediário | 150 | 1 |
| A06 | Reset de senha com token previsível | CWE-640 | Avançado | 200 | 6 |
| A07 | JWT com algoritmo `none` (ou segredo vazado) | CWE-347 | Avançado | 200 | 5 |
| A08 | Desserialização insegura (`node-serialize` RCE) | CWE-502 | Avançado | 220 | 9 |
| A09 | Log injection → Stored XSS no dashboard do SOC | CWE-117 + CWE-79 | Intermediário | 150 | 10 |
| A10 | Fail-open: exceção do motor de risco aprova a transferência (categoria nova em 2025) | CWE-636 | Intermediário | 150 | 11 |

> Os `id` internos dos labs (ex.: `a05-misconfig-debug`) e as flags foram mantidos para preservar o progresso dos alunos; a numeração exibida e os endpoints `/api/aNN` seguem o OWASP Top 10:2025.

### Kill chain

O achado de um lab alimenta o próximo. Seguindo a ordem, o aluno vive um ataque encadeado real; cada lab também é resolvível de forma independente.

```mermaid
flowchart LR
  A05["1 · A05<br/>SQLi<br/>foothold"] --> A04["2 · A04<br/>Token Base64<br/>credencial"]
  A04 --> A01["3 · A01<br/>IDOR<br/>enumeração"]
  A01 --> A02["4 · A02<br/>Debug exposto<br/>leak"]
  A02 --> A07["5 · A07<br/>JWT none<br/>privesc"]
  A07 --> A06["6 · A06<br/>Reset previsível<br/>takeover"]
  A06 --> A03["7 · A03<br/>Prototype pollution"]
  A03 --> SSRF["8 · A01 SSRF<br/>pivot"]
  SSRF --> A08["9 · A08<br/>Deserialização<br/>RCE"]
  A08 --> A09["10 · A09<br/>Log injection<br/>cobertura de rastros"]
  A09 --> A10["11 · A10<br/>Fail-open<br/>exceção tratada errado"]
```

### Material do professor

[`docs/Gabarito_Professor_OWASP_Top10_CyberShield.pdf`](docs/Gabarito_Professor_OWASP_Top10_CyberShield.pdf) traz, para os 10 laboratórios da edição anterior (OWASP 2021; o lab A10 de 2025 ainda não consta), o objetivo, o caminho de exploração validado contra `scripts/test-labs.mjs`, a flag esperada e os critérios de correção. É gerado a partir de `server/labs/metadata.ts` (a mesma fonte que o backend usa para validar as flags); qualquer mudança nos labs deve vir acompanhada de uma nova geração desse PDF.

> 🔒 **Uso restrito ao corpo docente.** O arquivo contém todas as flags; não distribua aos alunos.

### Screenshots

Capturas da versão atual do portal (dados fictícios, ambiente local).

| Lab OWASP (A05) | Trilha ISO 27001 (cenário) |
|:---:|:---:|
| ![Lab OWASP A05](docs/screenshots/lab-owasp-a03.jpg) | ![Trilha ISO](docs/screenshots/trilha-iso.jpg) |
| **Laboratório de prompts (LLM)** | **Jornada Security Champion** |
| ![Laboratório de prompts](docs/screenshots/lab-prompts.jpg) | ![Jornada Security Champion](docs/screenshots/jornada-champion.jpg) |

Selo e credencial (SVG gerados pelo código; exemplo com nome fictício):

![Credencial de exemplo](docs/screenshots/selo-credencial.svg)

## Trilhas de conteúdo

As quatro trilhas usam o mesmo motor (`server/labs/privacy.ts` generaliza `publicModules` e `checkAnswer`; configuração por trilha em `src/academy/trails.ts`). Em cada módulo: **Contexto → Caso real → Decida → Entenda → Boas práticas → Referências**. O servidor guarda o gabarito (`POST /api/<trilha>/answer`); `GET /api/<trilha>/modules` não envia respostas nem feedback. As opções são embaralhadas de forma determinística por cenário. Progresso da UI no `localStorage` (`cybershield.<trilha>.v1`).

| Trilha | Módulos | Cenários | Casos reais | Código |
|--------|--------:|---------:|------------:|--------|
| LGPD | 9 (P01–P09) | 31 | sim | `server/labs/privacy*.ts` |
| CIS Controls v8.1 | 19 (C01–C18 + C19 final) | 87 | 18 | `server/labs/cis*.ts` |
| ISO/IEC 27001:2022 | 12 | 48 | 11 | `server/labs/iso*.ts` |
| LLM (OWASP LLM Top 10) | 11 | 45 | 10 | `server/labs/llm.ts`, `llmContent*.ts`, `llmFinal.ts`, `llmCases.ts` |

### LGPD

Voltada a **todos os colaboradores**, em cenários práticos. O P09 é a **avaliação final** (15 cenários complexos). Há casos com fonte pública, diagramas por módulo e artefatos (e-mail, planilha, chat, formulário, log) nos cenários.

> ⚠️ Conteúdo educativo, não é parecer jurídico. Exige revisão de Privacidade/Jurídico. Itens `[inserir canal do encarregado/DPO Opah]`, `[inserir responsável jurídico/privacidade Opah]` e a resolução vigente da ANPD sobre incidentes ainda precisam ser validados.

### CIS Controls v8.1

Os **18 controles**, um por módulo, com caso real, salvaguardas-chave e **4 cenários por controle** (2 base, mais 2 avançados: um inspirado no padrão do caso real e outro fictício com trade-offs). O C19 é a **avaliação final integrada** (15 cenários que cruzam controles).

- **Versão:** v8.1 (publicada em 24/06/2024), a mais recente verificada em cisecurity.org. **Não existe edição "2026"** no site oficial, então o rótulo é v8.1.
- **Limites:** a lista oficial de salvaguardas (IDs, títulos e grupos IG1/IG2/IG3) não pôde ser extraída do site; as exibidas são **seleção editorial a conferir no CIS Controls Navigator**. O mapeamento caso → controle é editorial; Colonial Pipeline aparece em C01/C06 e Uber 2016 em C03/C17.

### ISO/IEC 27001:2022

**Preparação** para a certificação (a Opah **ainda não é certificada**): cláusulas 4 a 10, os quatro temas do Anexo A (organizacionais, pessoas, físicos, tecnológicos) e uma avaliação final em formato de auditoria. Escopo do SGSI: `[inserir escopo do SGSI Opah]`.

- **A norma é paga:** o conteúdo é paráfrase didática. Numeração de requisitos e controles é seleção editorial; conferir na edição oficial (ISO/IEC 27001:2022 e 27002:2022).
- Não verificado em fonte oficial da ISO (as páginas retornaram 403): data de publicação e prazo de transição; conferir antes de uso externo.
- O mapeamento caso real → cláusula/controle é editorial e não afirma nada sobre a certificação das organizações citadas.

### Segurança com LLM (OWASP Top 10 for LLM Applications 2025)

10 módulos (LLM01 a LLM10): por módulo, 1 cenário médio e 2 avançados (incluindo chats multi-turn). A **avaliação final** da trilha é o **Laboratório de prompts** (10 assistentes, uma flag por categoria), que substitui o antigo módulo de 15 cenários.

- Estrutura temática inspirada no range público [LLMVault](https://github.com/CyberSunil/LLMVault) (MIT). Só o README e as listagens foram lidos; **nenhum texto, flag ou payload foi copiado** e a marca LLMVault™ não é da Opah. Para praticar com ele, rode isolado, sem expor à rede, e revise o código antes (o README cita `OPENAI_API_KEY` opcional: confirmar se há chamada a API externa).
- Casos com fonte fraca, marcados nos cards: Replit (alegações de um cliente), Air Canada (resumos de escritórios; decisão não lida), Slack AI (fonte única), EchoLeak (sem CVSS).
- Nomes em português das categorias são tradução editorial; confira em genai.owasp.org.

## Laboratório de prompts

Em **LLM → Laboratório de prompts**, o colaborador digita mensagens para **10 assistentes simulados** e propositalmente vulneráveis (um por categoria LLM01 a LLM10), tenta capturar uma flag fictícia `OPAH-LLM{...}`, valida no servidor e vê "por que funcionou e como corrigir". Há 3 dicas progressivas por lab; progresso em `localStorage` (`cybershield.llmlab.v1`).

- **Sem LLM real nem API externa:** cada assistente é uma regra determinística em `server/labs/llmLab.ts`. Flags e lógica ficam só no servidor; `GET /api/llm-lab/labs` não expõe flags nem dicas. Rotas `chat`, `hint` e `submit` (flag comparada por hash em tempo constante), com 180 req/min por IP, mensagem de até 400 caracteres e histórico de até 10 mensagens.
- O lab 5 avalia `{{...}}` só com aritmética (dígitos e operadores), sem `eval` de texto livre; há teste para isso.
- **Limitação:** por serem regras, aceitam as técnicas previstas e variações de redação, não qualquer prompt criativo como um modelo real. O modo "live" com modelo local (Ollama) **não** foi implementado.

## Jornada e selo Security Champion

Botão **Jornada Security Champion** no topo do menu lateral: rota das seis trilhas, progresso, critérios, emissão e **verificação** do selo.

- **Nível** (Bronze 70%, Prata 85%, Ouro 100%) = a trilha **mais atrasada**. Unidade: cenário respondido corretamente, lab web resolvido ou flag capturada. Limites são premissa editorial **[a validar com a AI Guild]** (`src/academy/championCore.ts`, compartilhado entre front e servidor).
- **Selo:** anel de 6 segmentos (um por trilha) preenchido pelo progresso real, escudo com check e nível. **Credencial** 1200x675 com nome, nível, conclusão por trilha, data e ID; exporta PNG (credencial e só o selo) e imprime em A4 paisagem ou PDF (`championSvg.ts`).

### Registro no servidor
- **Progresso validado pelo servidor:** só entra no registro quando o servidor confere a resposta ou a flag (`/api/*/answer`, `/api/validate-flag`, `/api/llm-lab/submit`). O cliente não "declara" progresso; editar o `localStorage` não gera selo.
- **Selo assinado:** `POST /api/champion/issue` recalcula o nível a partir do registro e grava o selo com **HMAC-SHA256**. O ID (`SC-` + 10 caracteres) não revela a chave do aluno. **Verificação pública** em `GET /api/champion/verify/:id` e na seção "Verificar um selo" da jornada (também abre com `/?verificar=SC-...`). Se o arquivo for adulterado ou a chave mudar, a verificação falha (testado).
- **Persistência:** `data/champion-ledger.json` (gravação atômica; fora do git). A chave vem de `CHAMPION_SIGNING_KEY` ou é gerada em `data/.signing-key`. Faça backup de `data/` e **não perca a chave**, ou os selos emitidos deixam de validar.
- **Privacidade (LGPD):** o único dado pessoal é o nome digitado na emissão, visível a quem tiver o ID; o aluno vê o aviso antes de emitir e pode **remover o selo** ou **apagar todos os seus dados** (`DELETE /api/champion/seal` e `/api/champion/me`).

### Limitações (leia antes de uso oficial)
- **Identidade:** com `AUTH_MODE=required` (padrão) o progresso e o selo pertencem a uma **conta autenticada** (próxima seção). Só no modo `optional` (dev/testes) o aluno é uma chave anônima (UUID v4 no navegador, header `x-learner-id`), que não é autenticação: quem tiver a chave age como o aluno. O nome no selo continua digitado pelo aluno.
- **Quizzes automatizáveis:** o gabarito tem 3 ou 4 opções e um script pode tentar todas dentro do limite de requisições. O registro impede fraude casual, não quem automatiza; combine com SSO e, se necessário, revisão humana na emissão.
- **Progresso anterior a esta versão não conta:** só respostas validadas pelo servidor depois dela entram no registro.
- **Servidor único:** o registro é um arquivo local, sem banco nem alta disponibilidade. Para produção, usar banco e gestão de segredos.
- **Aprovação pendente:** o selo diz "selo interno de conclusão de trilha, não é certificação profissional" e traz `[inserir responsável pela emissão do selo na Opah]`; aprovação da AI Guild e da Segurança da Informação.

## Autenticação, usuários e relatório de conformidade

> **Rascunho para revisão humana** (Segurança da Informação, Conformidade e DPO). Pensado para gerar **evidência de treinamento** em auditorias, mas não substitui a validação de critérios, retenção e base legal **[definir com o DPO]**.

**Resumo:** login local com sessão por cookie, 4 perfis, gestão de usuários, relatório de desempenho exportável (Excel, JSON assinado, PDF) e trilha de auditoria encadeada por hash. Há um ponto de extensão para SSO/OIDC **[inserir provedor SSO Opah]** (trocar `authenticate()` em `server/auth.ts`).

| Perfil | Pode |
|--------|------|
| **Aluno** | Fazer o treinamento; ver e exportar o **próprio** desempenho |
| **Gestor** | Relatório da **equipe** (pessoas que o têm como gestor) |
| **Auditor** | **Somente leitura** de usuários, relatórios e trilha de auditoria; exporta evidências |
| **Administrador** | Criar, editar e desativar usuários, redefinir senhas; lê e exporta relatórios e auditoria |

**Primeiro acesso:** na 1ª subida sem usuários, cria-se um administrador (`ADMIN_EMAIL`, padrão `admin@opah.local`). Com `ADMIN_BOOTSTRAP_PASSWORD` (que cumpra a política) ela é usada; sem ela, o servidor gera uma senha provisória **mostrada uma vez no console**. A troca é obrigatória no 1º login. Usuários criados na tela de administração recebem senha provisória aleatória exibida **uma única vez** ao administrador.

**Controles de segurança** (cobertos por `scripts/test-access.mts` e pelo E2E `scripts/e2e-access.cjs`):
- Senha com **scrypt** e salt por usuário; política (12+ caracteres, 3 tipos, sem partes do e-mail, sem senhas previsíveis); troca obrigatória no 1º acesso e após reset.
- **Bloqueio** de conta (5 falhas = 15 min), limite por IP, mensagem de erro única (sem enumeração) e custo de hash também para e-mail inexistente.
- Sessão: token de 256 bits guardado só como SHA-256; cookie `HttpOnly` + `SameSite=Strict` (+ `Secure` em produção); novo token a cada login e troca de senha; expiração por inatividade (30 min) e absoluta (8 h); encerrada ao desativar a conta ou mudar o perfil.
- **CSRF:** cabeçalho `x-requested-with` obrigatório nas rotas que alteram estado com sessão. **RBAC** negado por padrão; tentativas negadas são auditadas. O último administrador é protegido e ninguém desativa a si mesmo.
- O registro de treinamento de uma conta é **retido** (apagar é negado e auditado) porque é evidência. Pedidos de eliminação seguem o DPO.

**Relatório de desempenho** (menu "Conformidade"): KPIs, conclusão por trilha, por equipe e por pessoa (situação: Aprovado, Final pendente, Em andamento, Não iniciado), filtros e detalhe por trilha com datas de conclusão.
- **Excel (.xlsx)** no padrão visual Opah: abas Resumo (indicadores com fórmulas), Pessoas (filtros, cabeçalho congelado, cores por situação), Detalhe por trilha (formato longo, bom para tabela dinâmica) e Critérios e limites; painel com cartões de KPI e barras de dados, pronto para imprimir em A4 paisagem. **JSON assinado** (HMAC-SHA256 do conteúdo canônico, verificável pela interface; qualquer alteração é detectada) e **PDF** pela impressão do navegador (A4 paisagem, cabeçalho Opah, id/hash/assinatura, rodapé de rascunho).
- Só conta o que o servidor validou. **Limite:** apenas acertos e suas datas são registrados (sem tentativas, erros ou tempo de estudo). A assinatura prova integridade desde a geração, não aderência a uma norma.

**Trilha de auditoria** (`data/audit-log.jsonl`): login, falha, bloqueio, logout, troca e reset de senha, criação, edição e desativação de usuários, vínculo de progresso, selo, visualização e exportação de relatório, acessos negados. Cada evento traz o hash do anterior (HMAC); editar, remover ou reordenar linhas é detectado e a interface mostra "Cadeia comprometida". **Limite:** quem controla o arquivo **e** a chave refaz a cadeia; guarde o hash do último evento em um repositório imutável externo **[definir com a Conformidade]**. Contém e-mail e IP (dados pessoais) e nunca grava senhas nem tokens.

**Migração:** no 1º login, se o navegador tinha progresso anônimo e a conta ainda não tem progresso, ele é **vinculado à conta** (uma vez, sem sobrescrever e sem tomar de outra conta). Depois, o servidor é a fonte da verdade e o navegador é limpo no logout (computador compartilhado).

**Limitações:** usuários em arquivo JSON e sessões em memória (reiniciar o servidor encerra as sessões; instância única); sem recuperação de senha por e-mail (o administrador redefine); sem MFA; em produção, servir por HTTPS e definir `COOKIE_SECURE=true`.

## Scripts

| Script | Função |
|--------|--------|
| `npm run dev` | Sobe API + Web juntos (`concurrently`) |
| `npm run dev:web` | Só o frontend (Vite, porta 3000) |
| `npm run dev:api` | Só a API (`tsx watch`) |
| `npm run start:api` | API sem watch |
| `npm run build` | Build de produção do frontend |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | Type-check (`tsc --noEmit`) |
| `npm run test:labs` | Suíte E2E dos 11 labs OWASP |
| `npm run test:tools` | Testes das ferramentas do workbench |
| `npm run test:content` | Quizzes das 4 trilhas, labs de prompt, selo Champion e autenticação, perfis, relatório e auditoria |
| `node scripts/e2e-champion-journey.cjs` | E2E (Playwright) da jornada do aluno, em modo anônimo |
| `node scripts/e2e-access.cjs` | E2E (Playwright) de login, perfis, usuários, relatório (Excel/JSON/PDF) e auditoria |
| `npm run db:setup` | Cria schema e dados-semente no Postgres/Supabase |

## Configuração

Sem `.env`, tudo funciona com SQLite em memória. Para customizar, copie `.env.example` para `.env`:

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `DATABASE_URL` | Não | Connection string Postgres/Supabase. Sem ela, usa SQLite em memória. Depois de definir, rode `npm run db:setup` |
| `API_PORT` | Não | Porta do backend (padrão `4000`) |
| `CHAMPION_SIGNING_KEY` | Não | Chave de assinatura dos selos. Sem ela, o servidor gera `data/.signing-key`. Guarde-a: trocá-la invalida os selos já emitidos |
| `AUTH_MODE` | Não | `required` (padrão: exige login) ou `optional` (aluno anônimo; só dev/testes) |
| `ADMIN_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` | Não | E-mail e senha provisória do 1º administrador (só usados se não houver usuários). Sem a senha, é gerada e mostrada uma vez no console |
| `ALLOWED_EMAIL_DOMAIN` | Não | Restringe os e-mails dos usuários a um domínio (ex.: `suaempresa.com.br`) |
| `COOKIE_SECURE` | Não | `true` marca o cookie de sessão como `Secure` (obrigatório atrás de HTTPS; implícito com `NODE_ENV=production`) |
| `CHAMPION_DATA_DIR` | Não | Pasta de `champion-ledger.json`, `users.json` e `audit-log.jsonl` (padrão `data/`). Faça backup |
| `GEMINI_API_KEY` | Não | Presente no template; veja `.env.example` |
| `APP_URL` | Não | URL de hospedagem, usada pelo template |

> 🔐 Nunca versione o `.env` real nem a pasta `data/` (já estão no `.gitignore`). Se uma credencial vazar, rotacione imediatamente.

## Arquitetura

```
src/                          Frontend React
  App.tsx                     shell: sidebar, seletor de área, jornada
  academy/
    api.ts, hooks.ts          cliente HTTP, labs e progresso (localStorage)
    trails.ts                 configuração de cada trilha (LGPD, CIS, ISO, LLM)
    champion.ts, championCore.ts, championSvg.ts, learner.ts
                              jornada e selo (núcleo compartilhado com o servidor)
    types.ts                  tipos (espelham metadados do backend)
    lib/tools.ts              utilitários do workbench
    components/               Dashboard, Sidebar, LabView, HttpRepeater, ExploitToolkit,
                              KillChainMap, LabCatalog, ui, RichText, PrivacyHome,
                              PrivacyModuleView, PrivacyCaseCard, PrivacyVisuals,
                              LlmLab, ChampionJourney

server/                       Backend Express (rode só local)
  index.ts                    app, rotas das trilhas, lab de prompts e champion
  champion.ts                 registro de progresso e selo assinado (HMAC)
  db.ts, dbSetup.ts           SQLite (node:sqlite) ou Postgres, com seed vulnerável
  labs/
    metadata.ts, routes.ts    labs OWASP: fonte única (flag, writeup) e endpoints A01..A10 (OWASP Top 10:2025)
    privacy*.ts               trilha LGPD (motor genérico, casos, avaliação final)
    cis*.ts                   trilha CIS (controles, casos, cenários, avaliação final)
    iso*.ts                   trilha ISO 27001 (cláusulas, Anexo A, casos, avaliação final)
    llm*.ts                   trilha LLM e llmLab.ts (assistentes simulados)

scripts/                      test-labs.mjs, test-tools.mts, test-content.mts,
                              test-prompt-labs.mts, test-champion*.mts
data/                         registro do selo e chave (gerado; fora do git)
legacy/                       versão anterior do projeto (arquivada)
docs/screenshots/             imagens deste README
```

A `flag` dos labs fica só no backend: `GET /api/labs` expõe os metadados sem esse campo e a validação ocorre em `/api/validate-flag`. O mesmo vale para o gabarito das trilhas e as flags do laboratório de prompts.

## Garantias de segurança do host

Mesmo sendo "vulnerável", o backend não coloca a máquina do aluno em risco:

- ✅ **Sem execução de comandos no SO** (nenhum `child_process`).
- ✅ **Sem egress de rede real** no lab de SSRF: usa um *resolver mock* interno.
- ✅ **Prototype pollution** (A03) é revertida imediatamente após a prova.
- ✅ **Banco em memória** (`:memory:`), recriado a cada start.
- ✅ **Assistentes do laboratório de prompts são regras locais**: sem LLM, sem chamadas externas.

> O Vite sobe com `--host=0.0.0.0`, deixando a porta 3000 acessível na sua rede local. Em redes não confiáveis, rode `npx vite --port=3000` (somente `localhost`) e `npm run dev:api` separadamente.

## Testes

Os testes de lab exigem um servidor **recém-iniciado** (seed limpo), pois o A06 reseta a senha do admin.

```bash
npm run dev:api        # terminal 1
npm run test:labs      # terminal 2: exploit positivo + casos negativos dos 11 labs
npm run test:tools     # ferramentas do workbench
npm run test:content   # não precisa de servidor: conteúdo, labs de prompt e selo
npm run lint           # type-check
```

`npm run test:content` valida, para LGPD, CIS, ISO e LLM: 1 gabarito por cenário, ids únicos, feedback em todas as opções, visuais presentes, ausência de vazamento do gabarito na API, ausência de credenciais e e-mails reais, casos com fonte https e ressalva e, principalmente, que **o tamanho e a posição da opção correta não entreguem a resposta** (correta mais longa em no máximo 40% dos cenários; razão média correta/erradas entre 0,85 e 1,20; nenhuma posição com mais de 45% das corretas). Também cobre cada lab de prompt (não vaza com mensagens ingênuas, vaza com a técnica da dica, validação de flag, entradas inválidas) e o registro do selo (progresso só por registro, gargalo, assinatura, adulteração, persistência, remoção e apagamento, limites).

## Referências

- [OWASP Top 10:2025](https://top10.owasp.org/2025/) · [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) · [CWE / MITRE](https://cwe.mitre.org/)
- [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/)
- [CIS Critical Security Controls](https://www.cisecurity.org/controls/cis-controls-list) · [CIS Controls Navigator](https://www.cisecurity.org/controls/cis-controls-navigator)
- [ISO/IEC 27001](https://www.iso.org/standard/27001) (norma paga; este projeto não a reproduz)
- [Lei 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) · [ANPD: materiais educativos](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes)
- [LLMVault](https://github.com/CyberSunil/LLMVault) (referência de prática, MIT; marca LLMVault™ não coberta pela licença)

---

**Licença:** [inserir licença definida pela Opah IT]  ·  **Mantenedores:** Opah IT — DevSec Academy
