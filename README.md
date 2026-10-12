# CyberShield DevSec Academy

Plataforma de treinamento em **OWASP Top 10 (2021)** voltada para **capacitar desenvolvedores** em cibersegurança. Cada laboratório tem um **backend propositalmente vulnerável e realmente explorável**, e conduz o aluno pelo fluxo:

> **Explorar** a falha → **entender a causa-raiz no código** → **corrigir** (secure coding) → **estudar referências** (OWASP/CWE).

> ⚠️ **Ambiente de treinamento.** O backend é intencionalmente inseguro. Rode **apenas localmente**. Nunca exponha à internet nem reutilize este código em produção.

---

## Como rodar

```bash
npm install --legacy-peer-deps
npm run dev
```

- **Frontend (React/Vite):** http://localhost:3000
- **Backend (API Express + SQLite):** http://localhost:4000/api
- O Vite faz proxy de `/api` → `:4000`, então basta abrir a porta 3000.

Scripts úteis:

| Script | Função |
|--------|--------|
| `npm run dev` | Sobe API + Web juntos (concurrently) |
| `npm run dev:web` | Só o frontend (Vite) |
| `npm run dev:api` | Só a API (tsx watch) |
| `npm run lint` | Type-check do frontend |

## Laboratórios (OWASP Top 10 : 2021)

| ID | Categoria | Lab | CWE |
|----|-----------|-----|-----|
| A01 | Broken Access Control | IDOR no portal de holerites | CWE-639 |
| A02 | Cryptographic Failures | Quebra de hash MD5 sem salt | CWE-916 |
| A03 | Injection | SQL Injection — bypass de auth | CWE-89 |
| A04 | Insecure Design | Reset de senha com token previsível | CWE-640 |
| A05 | Security Misconfiguration | Endpoint de debug exposto | CWE-16 |
| A06 | Vulnerable Components | Prototype pollution (dep. desatualizada) | CWE-1104 |
| A07 | Auth Failures | JWT com `alg:none` | CWE-347 |
| A08 | Integrity Failures | Update sem verificação de assinatura | CWE-345 |
| A09 | Logging & Monitoring | Log injection (CRLF) | CWE-117 |
| A10 | SSRF | SSRF para metadados internos | CWE-918 |

## Arquitetura

```
src/                     Frontend React
  academy/
    api.ts               cliente HTTP + progresso (localStorage)
    types.ts             tipos (espelham metadados do backend)
    components/          LabCatalog, LabView, HttpConsole, ui
  App.tsx                shell: catálogo + lab + progresso

server/                  Backend Express (rode só local)
  index.ts               app + /api/labs + /api/validate-flag
  db.ts                  SQLite (node:sqlite) com seed vulnerável
  labs/
    metadata.ts          fonte única: objetivo, writeup, correção, refs, flag
    routes.ts            os 10 endpoints vulneráveis (A01..A10)

legacy/                  versão anterior do projeto (arquivada)
```

### Garantias de segurança do host

Mesmo sendo "vulnerável", o backend **não** coloca a máquina do aluno em risco:

- **Sem execução de comandos no SO** (nenhum `child_process`).
- **Sem egress de rede real** no lab de SSRF — usa um *resolver mock* interno.
- **Prototype pollution** (A06) é revertida imediatamente após a prova.
- Banco em memória (`:memory:`), recriado a cada start.

## Validação

Todos os 10 labs são exploráveis e devolvem a flag correta (teste automatizado em
`server` validado de ponta a ponta). Fluxo do aluno: abrir lab → aba **Atacar** →
console HTTP → capturar a flag na resposta → **Validar** → estudar **Causa-raiz** e **Correção**.

---

Baseado em [OWASP Top 10](https://owasp.org/Top10/), [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) e [CWE/MITRE](https://cwe.mitre.org/).
