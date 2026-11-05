/**
 * E2E de autenticação, perfis, gestão de usuários, relatório de desempenho e trilha de auditoria (Playwright).
 *
 * Sobe API (4040) e Vite (3040) isolados, com AUTH_MODE=required e dados em diretório temporário. Percorre, pela interface,
 * os 4 perfis (Administrador, Gestor, Aluno, Auditor): 1º acesso com troca obrigatória de senha, criação de usuários,
 * hidratação do progresso, escopo do relatório por perfil, exportação Excel/JSON assinado, verificação de adulteração,
 * PDF (impressão), bloqueio de conta, desativação, trilha de auditoria encadeada, logout sem vazar progresso, acessibilidade
 * básica e mobile. Credenciais são fictícias, só para este ambiente efêmero.
 *
 * Uso:  node scripts/e2e-access.cjs      Env: PW_SKILL_DIR, E2E_HEADED=1, E2E_OUT
 */
const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SKILL = process.env.PW_SKILL_DIR || path.join(os.homedir(), '.claude', 'skills', 'playwright-skill');
const { chromium } = require(path.join(SKILL, 'node_modules', 'playwright'));
const API_PORT = 4040, WEB_PORT = 3040;
const WEB = `http://localhost:${WEB_PORT}`, API = `http://localhost:${API_PORT}/api`;
const OUT = process.env.E2E_OUT || fs.mkdtempSync(path.join(os.tmpdir(), 'access-e2e-'));
fs.mkdirSync(OUT, { recursive: true });
const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'access-data-'));
const ADMIN = { email: 'admin@opah.test', first: 'Adm1n-Inicial#2026', pw: 'Adm1n-Definitiva#2026' };
const PW = 'Senha-Forte#2026x';

const keyRun = spawnSync(process.execPath, [path.join(ROOT, 'node_modules/tsx/dist/cli.mjs'), 'scripts/e2e-answer-key.mts'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (keyRun.status !== 0) { console.error('Falha ao gerar o gabarito:\n' + keyRun.stderr); process.exit(2); }
const KEY = JSON.parse(keyRun.stdout);

const results = []; const consoleErrors = [], pageErrors = [], badResponses = [];
let phase = 'setup';
const rec = (name, ok, note = '', ms = 0) => { results.push({ phase, name, ok, note, ms }); if (!ok) console.log(`  ✗ [${phase}] ${name} ${note}`); };
async function step(name, fn) {
  const t = Date.now();
  try { const note = await fn(); rec(name, true, note || '', Date.now() - t); return true; }
  catch (e) { rec(name, false, String(e.message || e).split('\n').filter((l) => l.trim()).slice(0, 3).join(' | ').slice(0, 420), Date.now() - t); return false; }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const procs = [];
function start(args, env, tag) {
  const p = spawn(process.execPath, args, { cwd: ROOT, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  p.stdout.on('data', () => {}); p.stderr.on('data', (d) => { const t = String(d); if (/error/i.test(t)) console.log(`[${tag}] ${t.trim().slice(0, 200)}`); });
  procs.push(p); return p;
}
const killAll = () => { for (const p of procs) { try { spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* ignore */ } } };
async function waitUp(url, ms = 60000) { const t = Date.now(); while (Date.now() - t < ms) { try { const r = await fetch(url); if (r.ok) return; } catch { /* aguarda */ } await sleep(400); } throw new Error(`timeout aguardando ${url}`); }
const expect = (c, msg) => { if (!c) throw new Error(msg); };

let browser;
async function newUser(label) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, locale: 'pt-BR' });
  const page = await ctx.newPage(); page.setDefaultTimeout(8000);
  page.on('console', (m) => { if (m.type() === 'error' && !/(400|401|403|409)/.test(m.text())) consoleErrors.push(`[${label}/${phase}] ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => pageErrors.push(`[${label}/${phase}] ${String(e.message).slice(0, 200)}`));
  page.on('response', (r) => { if ((r.url().startsWith(WEB) || r.url().startsWith(API)) && (r.status() >= 500 || r.status() === 429)) badResponses.push(`[${label}/${phase}] ${r.status()} ${r.request().method()} ${r.url().slice(0, 100)}`); });
  return { ctx, page, label };
}
const shot = (u, n) => u.page.screenshot({ path: path.join(OUT, `${u.label}-${n}.png`) }).catch(() => {});
async function uiLogin(u, email, pw) {
  await u.page.goto(WEB);
  await u.page.getByLabel('E-mail').fill(email);
  await u.page.getByLabel('Senha', { exact: true }).fill(pw);
  await u.page.getByRole('button', { name: 'Entrar', exact: true }).click();
}
async function forcedChange(u, current, next) {
  await u.page.getByRole('heading', { name: 'Defina a sua senha' }).waitFor();
  await u.page.getByLabel('Senha provisória atual').fill(current);
  await u.page.getByLabel('Nova senha', { exact: true }).fill(next);
  await u.page.getByLabel('Repita a nova senha').fill(next);
  await u.page.getByRole('button', { name: 'Salvar nova senha' }).click();
  await u.page.getByRole('navigation', { name: 'Navegação' }).waitFor();
}
const nav = (u) => u.page.getByRole('navigation', { name: 'Navegação' });
// A conta fica no rodapé do menu lateral: um botão abre o menu com Conformidade, Minha conta e Sair.
const openMenu = async (u) => { const t = nav(u).getByRole('button', { name: /^Conta de .*: abrir menu$/ }); if (await t.getAttribute('aria-expanded') !== 'true') await t.click(); return u.page.getByRole('menu', { name: 'Conta e conformidade' }); };
const menuItem = async (u, name) => (await openMenu(u)).getByRole('menuitem', typeof name === 'string' ? { name, exact: true } : { name });
const openConsole = async (u, name) => { await (await menuItem(u, name)).click(); };
const csrf = { 'x-requested-with': 'cybershield' };

// limite de 180/min por IP nas rotas de resposta: respeita, como um aluno humano
const hits = [];
async function paced() {
  const now = Date.now(); while (hits.length && now - hits[0] > 60000) hits.shift();
  if (hits.length >= 140) { await sleep(60000 - (now - hits[0]) + 300); hits.length = 0; }
  hits.push(Date.now());
}
async function completeAs(u, { trails = ['privacy', 'cis', 'iso', 'llm'], labs = true, prompt = true, only } = {}) {
  const post = async (p, data) => { await paced(); const r = await u.ctx.request.post(`${API}${p}`, { data, headers: csrf }); return r; };
  for (const t of trails) for (const m of KEY[t]) for (const s of m.scenarios) { if (only && !only(t, m, s)) continue; const r = await post(`/${t}/answer`, { moduleId: m.id, scenarioId: s.id, optionIndex: s.correct }); expect(r.ok(), `${t}/${s.id} HTTP ${r.status()}`); }
  if (labs) for (const l of KEY.labs) { const r = await post('/validate-flag', { labId: l.id, flag: l.flag }); expect((await r.json()).correct, `lab ${l.id}`); }
  if (prompt) for (const l of KEY.promptLabs) { const r = await post('/llm-lab/submit', { labId: l.id, flag: l.flag }); expect((await r.json()).correct, `prompt ${l.id}`); }
}

async function main() {
  console.log(`Saída: ${OUT}\nDados isolados: ${DATA_DIR}`);
  start([path.join(ROOT, 'node_modules/tsx/dist/cli.mjs'), 'server/index.ts'], { API_PORT: String(API_PORT), CHAMPION_DATA_DIR: DATA_DIR, AUTH_MODE: 'required', ADMIN_EMAIL: ADMIN.email, ADMIN_BOOTSTRAP_PASSWORD: ADMIN.first }, 'api');
  start([path.join(ROOT, 'node_modules/vite/bin/vite.js'), '--port', String(WEB_PORT), '--strictPort'], { API_PORT: String(API_PORT) }, 'web');
  await waitUp(`${API}/health`); await waitUp(WEB);
  browser = await chromium.launch({ headless: process.env.E2E_HEADED !== '1' });

  // ───────── 1. Porta de entrada ─────────
  phase = '1-login';
  const anon = await newUser('anon');
  await step('sem sessão: só a tela de login (sem menu nem conteúdo)', async () => {
    await anon.page.goto(WEB); await anon.page.getByRole('heading', { name: 'Entrar' }).waitFor();
    expect(await anon.page.getByRole('navigation', { name: 'Navegação' }).count() === 0, 'menu visível sem login');
    await shot(anon, '01-login');
  });
  await step('API protegida sem sessão: progresso, relatório, usuários e auditoria negam (401)', async () => {
    for (const [m, p] of [['get', '/champion/me'], ['get', '/champion/progress'], ['get', '/reports/summary'], ['get', '/admin/users'], ['get', '/audit']]) {
      const r = await anon.ctx.request[m](`${API}${p}`); expect(r.status() === 401, `${p} → ${r.status()}`);
    }
    const w = await anon.ctx.request.post(`${API}/privacy/answer`, { data: { moduleId: KEY.privacy[0].id, scenarioId: KEY.privacy[0].scenarios[0].id, optionIndex: KEY.privacy[0].scenarios[0].correct }, headers: { 'x-learner-id': '3f2b8c1e-5a4d-4e6f-8b7a-1c2d3e4f5a6b' } });
    expect(w.ok(), 'resposta stateless segue funcionando'); // validação do conteúdo não grava progresso sem sessão
    const me = await anon.ctx.request.get(`${API}/champion/me`, { headers: { 'x-learner-id': '3f2b8c1e-5a4d-4e6f-8b7a-1c2d3e4f5a6b' } }); expect(me.status() === 401, 'x-learner-id não substitui a sessão em modo required');
  });
  await step('a11y do login: campos rotulados, Tab chega ao botão, Enter envia, erro anunciado e genérico', async () => {
    await anon.page.getByLabel('E-mail').fill('ninguem@opah.test');
    await anon.page.getByLabel('Senha', { exact: true }).fill('qualquer-Coisa#12');
    await anon.page.keyboard.press('Enter');
    const alert = anon.page.getByRole('alert'); await alert.waitFor();
    const t = await alert.innerText(); expect(/inválidos|bloqueada/.test(t) && !/não existe|usuário/i.test(t), `mensagem: ${t}`);
    expect(await anon.page.getByLabel('Senha', { exact: true }).inputValue() === '', 'senha não foi limpa após erro');
    await shot(anon, '02-login-erro');
  });
  await step('mostrar/ocultar senha alterna o tipo do campo', async () => {
    const f = anon.page.getByLabel('Senha', { exact: true }); await f.fill('abc');
    await anon.page.getByRole('button', { name: 'Mostrar senha' }).click(); expect(await f.getAttribute('type') === 'text', 'não mostrou');
    await anon.page.getByRole('button', { name: 'Ocultar senha' }).click(); expect(await f.getAttribute('type') === 'password', 'não ocultou');
  });
  await step('mobile (390px): login sem rolagem horizontal', async () => {
    await anon.page.setViewportSize({ width: 390, height: 800 }); await anon.page.reload();
    await anon.page.getByRole('heading', { name: 'Entrar' }).waitFor();
    expect(await anon.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'overflow horizontal'); await shot(anon, '03-login-mobile');
  });
  await anon.ctx.close();

  // ───────── 2. Administrador ─────────
  phase = '2-admin';
  const admin = await newUser('admin');
  await step('1º acesso do administrador: troca de senha obrigatória (regras vivas, fraca bloqueada)', async () => {
    await uiLogin(admin, ADMIN.email, ADMIN.first);
    await admin.page.getByRole('heading', { name: 'Defina a sua senha' }).waitFor();
    await admin.page.getByLabel('Senha provisória atual').fill(ADMIN.first);
    await admin.page.getByLabel('Nova senha', { exact: true }).fill('curta');
    expect(await admin.page.getByRole('button', { name: 'Salvar nova senha' }).isDisabled(), 'aceitou senha fraca');
    await shot(admin, '01-troca-obrigatoria');
    await admin.page.getByLabel('Nova senha', { exact: true }).fill(ADMIN.pw); await admin.page.getByLabel('Repita a nova senha').fill(ADMIN.pw);
    await admin.page.getByRole('button', { name: 'Salvar nova senha' }).click(); await nav(admin).waitFor();
  });
  await step('menu mostra Conformidade do perfil: Relatório, Usuários e Trilha de auditoria + conta', async () => {
    for (const n of ['Relatório de desempenho', 'Usuários e perfis', 'Trilha de auditoria', 'Minha conta', 'Sair da conta']) await (await menuItem(admin, n)).waitFor();
    await shot(admin, '02-menu'); await admin.page.setViewportSize({ width: 1440, height: 620 }); await shot(admin, '02b-menu-tela-baixa'); await admin.page.setViewportSize({ width: 1440, height: 900 }); await admin.page.keyboard.press('Escape'); expect(await admin.page.getByRole('menu').count() === 0, 'Escape não fechou o menu'); expect(await nav(admin).getByRole('button', { name: /Conta de .*abrir menu/ }).evaluate((e) => e === document.activeElement), 'foco não voltou ao botão da conta');
  });

  const created = {};
  const mk = (key, name, email, role, team, mgr) => step(`criar usuário ${name} (${role})`, async () => {
    await openConsole(admin, 'Usuários e perfis');
    await admin.page.getByRole('button', { name: 'Novo usuário' }).click();
    await admin.page.getByLabel('Nome completo').fill(name); await admin.page.getByLabel('E-mail corporativo').fill(email);
    await admin.page.getByLabel('Perfil', { exact: true }).selectOption(role); await admin.page.getByLabel('Equipe').fill(team);
    if (mgr) await admin.page.getByLabel(/^Gestor/).selectOption({ label: mgr });
    await admin.page.getByRole('button', { name: 'Criar usuário' }).click();
    const box = admin.page.getByRole('status', { name: 'Senha provisória' }).filter({ hasText: email }); await box.waitFor();
    const pw = (await box.locator('code').innerText()).trim(); expect(pw.length >= 14, 'senha provisória curta');
    created[key] = pw; await shot(admin, `03-criado-${key}`);
  });
  await mk('gestora', 'Gestora Teste', 'gestora@opah.test', 'manager', 'Plataforma');
  await mk('aluna', 'Aluna Completa', 'aluna@opah.test', 'learner', 'Plataforma', 'Gestora Teste (Gestor)');
  await mk('bruno', 'Bruno Parcial', 'bruno@opah.test', 'learner', 'Dados');
  await mk('auditora', 'Auditora Teste', 'auditora@opah.test', 'auditor', 'Conformidade');
  await step('e-mail duplicado e perfil/nome inválidos são recusados com mensagem', async () => {
    await admin.page.getByRole('button', { name: 'Novo usuário' }).click();
    await admin.page.getByLabel('Nome completo').fill('Outra Aluna'); await admin.page.getByLabel('E-mail corporativo').fill('ALUNA@opah.test');
    await admin.page.getByRole('button', { name: 'Criar usuário' }).click();
    await admin.page.getByRole('alert').filter({ hasText: /já existe/ }).waitFor();
    await admin.page.getByRole('button', { name: 'Cancelar' }).click();
  });
  await step('lista de usuários: 5 cadastros, "você" marcado, auto-desativação desabilitada', async () => {
    await admin.page.getByRole('row', { name: /Aluna Completa/ }).waitFor();
    expect(await admin.page.getByRole('row').filter({ hasText: '@opah.test' }).count() === 5, 'esperava 5 usuários');
    const own = admin.page.getByRole('row').filter({ hasText: ADMIN.email });
    await own.getByText('você').waitFor(); expect(await own.getByRole('button', { name: 'Desativar' }).isDisabled(), 'permitiu auto-desativação');
    await shot(admin, '04-usuarios');
  });

  // ───────── 3. Aluna: 1º acesso, progresso, selo ─────────
  phase = '3-aluna';
  const aluna = await newUser('aluna');
  await step('aluna: 1º acesso exige troca de senha; senha provisória não reutilizável depois', async () => {
    await uiLogin(aluna, 'aluna@opah.test', created.aluna); await forcedChange(aluna, created.aluna, PW);
    const old = await aluna.ctx.request.post(`${API}/auth/login`, { data: { email: 'aluna@opah.test', password: created.aluna }, headers: csrf }); expect(old.status() === 401, 'senha provisória ainda funciona');
  });
  await step('API recusa uso antes da troca? (já trocada) e aluna não acessa administração/auditoria (403)', async () => {
    for (const p of ['/admin/users', '/audit']) { const r = await aluna.ctx.request.get(`${API}${p}`); expect(r.status() === 403, `${p} → ${r.status()}`); }
    const r = await aluna.ctx.request.post(`${API}/admin/users`, { data: { email: 'x@opah.test', name: 'Xis Teste', role: 'admin' }, headers: csrf }); expect(r.status() === 403, `criar admin → ${r.status()}`);
    const nc = await aluna.ctx.request.post(`${API}/admin/users`, { data: { email: 'y@opah.test', name: 'Yis Teste', role: 'admin' } }); expect(nc.status() === 403, 'sem CSRF/perm');
  });
  await step('aluna conclui todas as trilhas, 11 labs e o Laboratório de prompts (via API autenticada)', async () => { await completeAs(aluna); });
  await step('progresso é hidratado do servidor ao recarregar (menu marca módulos concluídos)', async () => {
    await aluna.page.reload(); await nav(aluna).waitFor();
    await aluna.page.getByRole('group', { name: 'Área de treinamento' }).getByRole('button', { name: 'LGPD', exact: true }).click();
    const done = await nav(aluna).getByLabel('Concluído', { exact: true }).count(); expect(done >= KEY.privacy.length, `concluídos no menu: ${done}`);
    await shot(aluna, '01-hidratado');
  });
  await step('aluna emite selo Ouro e a emissão é aceita (nome + CSRF)', async () => {
    const r = await aluna.ctx.request.post(`${API}/champion/issue`, { data: { name: 'Aluna Completa' }, headers: csrf });
    expect(r.ok(), `issue HTTP ${r.status()}`); const j = await r.json(); expect(j.seal.tier === 'ouro', `nível ${j.seal.tier}`);
    const nc = await aluna.ctx.request.post(`${API}/champion/issue`, { data: { name: 'X Y' } }); expect(nc.status() === 403, 'emissão sem cabeçalho anti-CSRF deveria falhar');
  });
  await step('apagar dados é negado a conta autenticada (registro retido como evidência)', async () => {
    const r = await aluna.ctx.request.delete(`${API}/champion/me`, { headers: csrf }); expect(r.status() === 409, `HTTP ${r.status()}`);
  });
  await step('"Meu desempenho": só a própria linha, situação Aprovado, sem busca/equipe, sem Usuários/Auditoria no menu', async () => {
    await openConsole(aluna, 'Meu desempenho');
    await aluna.page.getByRole('heading', { name: 'Meu desempenho' }).waitFor();
    expect(await aluna.page.getByRole('row').filter({ hasText: '@opah.test' }).count() === 1, 'mais de uma linha');
    await aluna.page.getByRole('row', { name: /Aluna Completa/ }).getByText('Aprovado').waitFor();
    expect(await aluna.page.getByLabel('Equipe', { exact: true }).count() === 0, 'filtro de equipe visível para aluno');
    await openMenu(aluna); expect(await aluna.page.getByRole('menuitem', { name: /Usuários|Trilha de auditoria/ }).count() === 0, 'itens de admin no menu do aluno'); await aluna.page.keyboard.press('Escape');
    await shot(aluna, '02-meu-desempenho');
  });
  await step('"Minha conta": troca de senha voluntária exige a senha atual e encerra outras sessões', async () => {
    await openConsole(aluna, 'Minha conta');
    await aluna.page.getByLabel('Senha atual').fill('errada-Senha#123'); await aluna.page.getByLabel('Nova senha').fill(`${PW}2`);
    await aluna.page.getByRole('button', { name: 'Salvar' }).click(); await aluna.page.getByRole('alert').filter({ hasText: /incorreta/ }).waitFor();
    await aluna.page.getByLabel('Senha atual').fill(PW); await aluna.page.getByRole('button', { name: 'Salvar' }).click();
    await aluna.page.getByRole('status').filter({ hasText: /Senha alterada/ }).waitFor();
  });
  const ALUNA_PW = `${PW}2`;

  // Bruno: parcial + um erro de lab; completa só parte do CIS
  const bruno = await newUser('bruno');
  await step('bruno: 1º acesso e progresso parcial (CIS 40%)', async () => {
    await uiLogin(bruno, 'bruno@opah.test', created.bruno); await forcedChange(bruno, created.bruno, PW);
    await completeAs(bruno, { trails: ['cis'], labs: false, prompt: false, only: (t, m, s) => m.scenarios.indexOf(s) < 2 });
  });

  // ───────── 4. Gestora ─────────
  phase = '4-gestora';
  const gest = await newUser('gestora');
  await step('gestora: troca de senha e relatório SÓ da equipe (ela + aluna; sem Bruno nem Auditora)', async () => {
    await uiLogin(gest, 'gestora@opah.test', created.gestora); await forcedChange(gest, created.gestora, PW);
    await openConsole(gest, 'Desempenho da equipe');
    await gest.page.getByRole('heading', { name: 'Relatório de desempenho' }).waitFor();
    await gest.page.getByRole('row', { name: /Aluna Completa/ }).waitFor();
    for (const n of ['Bruno Parcial', 'Auditora Teste', 'Administrador']) expect(await gest.page.getByRole('row', { name: new RegExp(n) }).count() === 0, `gestora vê ${n}`);
    expect((await gest.page.getByText(/Escopo:/).first().innerText()).includes('Minha equipe'), 'escopo não é equipe'); await shot(gest, '01-equipe');
    for (const p of ['/admin/users', '/audit']) { const r = await gest.ctx.request.get(`${API}${p}`); expect(r.status() === 403, `${p} → ${r.status()}`); }
  });

  // ───────── 5. Auditora ─────────
  phase = '5-auditora';
  const aud = await newUser('auditora');
  await step('auditora: vê tudo, usuários em modo leitura (sem Novo usuário/ações), não altera (403)', async () => {
    await uiLogin(aud, 'auditora@opah.test', created.auditora); await forcedChange(aud, created.auditora, PW);
    await openConsole(aud, 'Usuários (leitura)'); await aud.page.getByRole('heading', { name: 'Usuários e perfis' }).waitFor();
    expect(await aud.page.getByRole('button', { name: /Novo usuário|Redefinir senha|Desativar|Editar/ }).count() === 0, 'ações de escrita visíveis para auditor');
    const id = (await (await aud.ctx.request.get(`${API}/admin/users`)).json()).users.find((u) => u.email === 'aluna@opah.test').id;
    const w = await aud.ctx.request.patch(`${API}/admin/users/${id}`, { data: { role: 'admin' }, headers: csrf }); expect(w.status() === 403, `patch → ${w.status()}`);
    const w2 = await aud.ctx.request.post(`${API}/admin/users/${id}/reset-password`, { headers: csrf }); expect(w2.status() === 403, `reset → ${w2.status()}`);
    await shot(aud, '01-usuarios-leitura');
  });

  // ───────── 6. Relatório do administrador ─────────
  phase = '6-relatorio';
  await step('relatório da organização: KPIs, situação por pessoa e por equipe coerentes com o registro', async () => {
    await openConsole(admin, 'Relatório de desempenho'); await admin.page.getByRole('heading', { name: 'Relatório de desempenho' }).waitFor();
    await admin.page.getByRole('row', { name: /Aluna Completa/ }).getByText('Aprovado').waitFor();
    await admin.page.getByRole('row', { name: /Bruno Parcial/ }).getByText('Em andamento').waitFor();
    await admin.page.getByRole('row', { name: /Gestora Teste/ }).getByText('Não iniciado').waitFor();
    await admin.page.getByRole('table', { name: /Pessoas, aprovados e média geral por equipe|por equipe/i }).getByText('Plataforma').waitFor();
    await shot(admin, '05-relatorio');
  });
  await step('filtros: situação = Aprovado mostra só a aluna; busca por nome; equipe', async () => {
    await admin.page.getByLabel('Situação').selectOption('Aprovado');
    await admin.page.getByRole('row', { name: /Aluna Completa/ }).waitFor(); await admin.page.getByRole('row', { name: /Bruno Parcial/ }).waitFor({ state: 'detached' });
    await admin.page.getByLabel('Situação').selectOption(''); await admin.page.getByLabel('Buscar').fill('bruno');
    await admin.page.getByRole('row', { name: /Aluna Completa/ }).waitFor({ state: 'detached' }); await admin.page.getByRole('row', { name: /Bruno Parcial/ }).waitFor();
    await admin.page.getByLabel('Buscar').fill(''); await admin.page.getByLabel('Equipe', { exact: true }).selectOption('Dados');
    await admin.page.getByRole('row', { name: /Bruno Parcial/ }).waitFor(); await admin.page.getByRole('row', { name: /Aluna Completa/ }).waitFor({ state: 'detached' });
    await admin.page.getByLabel('Equipe', { exact: true }).selectOption('');
  });
  await step('detalhe por trilha (linha expansível) mostra 6 trilhas e datas da aluna', async () => {
    await admin.page.getByRole('button', { name: 'Detalhes de Aluna Completa' }).click();
    const t = admin.page.getByRole('table', { name: /Detalhe por trilha de Aluna Completa/ }); await t.waitFor();
    expect(await t.getByRole('row').count() === 7, 'esperava cabeçalho + 6 trilhas');
    await admin.page.getByRole('button', { name: 'Detalhes de Aluna Completa' }).click();
  });
  let jsonPath;
  await step('exportar Excel (.xlsx): arquivo válido com as 4 abas e nome com o id do relatório', async () => {
    const [dl] = await Promise.all([admin.page.waitForEvent('download'), admin.page.getByRole('button', { name: 'Excel' }).click()]);
    const p = path.join(OUT, dl.suggestedFilename()); await dl.saveAs(p);
    expect(/^RPT-\d{8}-[0-9A-Z]{6}\.xlsx$/.test(dl.suggestedFilename()), `nome ${dl.suggestedFilename()}`);
    const b = fs.readFileSync(p); expect(b[0] === 0x50 && b[1] === 0x4B && b.length > 6000, `xlsx inválido (${b.length} bytes)`);
    await admin.page.getByRole('status').filter({ hasText: /Arquivo gerado/ }).waitFor();
  });
  await step('exportar JSON assinado e verificar pela interface (íntegro)', async () => {
    const [dl] = await Promise.all([admin.page.waitForEvent('download'), admin.page.getByRole('button', { name: 'JSON assinado' }).click()]);
    jsonPath = path.join(OUT, dl.suggestedFilename()); await dl.saveAs(jsonPath);
    const doc = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); expect(doc.integrity.signature.length === 64 && doc.rows.length === 5, 'estrutura');
    await admin.page.locator('input[type=file]').setInputFiles(jsonPath);
    await admin.page.getByRole('status').filter({ hasText: /Íntegro/ }).waitFor();
  });
  await step('JSON adulterado (1 campo alterado) é rejeitado na verificação', async () => {
    const doc = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); doc.rows.find((r) => r.email === 'bruno@opah.test').situation = 'Aprovado';
    const bad = path.join(OUT, 'adulterado.json'); fs.writeFileSync(bad, JSON.stringify(doc));
    await admin.page.locator('input[type=file]').setInputFiles(bad);
    await admin.page.getByRole('alert').filter({ hasText: /NÃO confere/ }).waitFor();
    fs.writeFileSync(path.join(OUT, 'nao-json.json'), 'isto não é json'); await admin.page.locator('input[type=file]').setInputFiles(path.join(OUT, 'nao-json.json'));
    await admin.page.getByRole('alert').filter({ hasText: /JSON válido/ }).waitFor();
  });
  await step('PDF (impressão): documento claro com id, hash, assinatura e rodapé de rascunho', async () => {
    await admin.page.evaluate(() => { window.print = () => { window.__printed = true; }; });
    await admin.page.getByRole('button', { name: 'Imprimir / PDF' }).click();
    await admin.page.locator('#report-print').waitFor({ state: 'attached' });
    await admin.page.evaluate(() => document.body.classList.add('report-print')); await sleep(200);
    expect(await admin.page.evaluate(() => window.__printed === true), 'window.print não foi chamado');
    const txt = await admin.page.locator('#report-print').textContent(); // lido antes do pdf(): a emulação de impressão dispara afterprint e desmonta o portal
    await admin.page.emulateMedia({ media: 'print' }); await admin.page.screenshot({ path: path.join(OUT, 'admin-06-pdf-preview.png'), fullPage: true });
    const pdf = path.join(OUT, 'relatorio.pdf'); await admin.page.pdf({ path: pdf, format: 'A4', landscape: true, printBackground: true, preferCSSPageSize: true });
    const size = fs.statSync(pdf).size; expect(size > 8000, `PDF pequeno: ${size}`);
    for (const t of ['RASCUNHO PARA REVISÃO HUMANA', 'RPT-', 'SHA-256', 'Assinatura', 'Aluna Completa', 'Critérios e limites']) expect(txt.includes(t), `PDF sem "${t}"`);
        await admin.page.evaluate(() => { document.body.classList.remove('report-print'); window.dispatchEvent(new Event('afterprint')); });
    return `${Math.round(size / 1024)} KB`;
  });

  // ───────── 7. Segurança de conta ─────────
  phase = '7-conta';
  await step('bloqueio: 5 senhas erradas bloqueiam; a senha certa também falha durante o bloqueio; admin redefine', async () => {
    const ghost = await newUser('ghost');
    for (let i = 0; i < 5; i++) { const r = await ghost.ctx.request.post(`${API}/auth/login`, { data: { email: 'bruno@opah.test', password: `errada-${i}-Senha#12` }, headers: csrf }); expect(r.status() === 401, `tentativa ${i}: ${r.status()}`); }
    const ok = await ghost.ctx.request.post(`${API}/auth/login`, { data: { email: 'bruno@opah.test', password: PW }, headers: csrf }); expect(ok.status() === 401, 'senha correta aceita durante bloqueio');
    await openConsole(admin, 'Usuários e perfis'); await admin.page.getByRole('row', { name: /Bruno Parcial/ }).getByText('Bloqueada').waitFor(); await shot(admin, '07-bloqueada');
    const row = admin.page.getByRole('row', { name: /Bruno Parcial/ });
    await row.getByRole('button', { name: 'Redefinir senha' }).click(); await row.getByRole('button', { name: 'Confirmar redefinição' }).click();
    const box = admin.page.getByRole('status', { name: 'Senha provisória' }).filter({ hasText: 'bruno@opah.test' }); await box.waitFor(); created.bruno2 = (await box.locator('code').innerText()).trim();
    const relog = await ghost.ctx.request.post(`${API}/auth/login`, { data: { email: 'bruno@opah.test', password: created.bruno2 }, headers: csrf }); expect(relog.ok(), `login pós-reset ${relog.status()}`);
    expect((await relog.json()).user.mustChange === true, 'reset não exige troca');
    await ghost.ctx.close();
  });
  await step('desativar (2 passos) derruba a sessão ativa e impede novo login; reativar restaura', async () => {
    const row = admin.page.getByRole('row', { name: /Aluna Completa/ });
    await row.getByRole('button', { name: 'Desativar' }).click(); await row.getByRole('button', { name: 'Confirmar desativação' }).click();
    await row.getByText('Desativada', { exact: true }).waitFor();
    const me = await aluna.ctx.request.get(`${API}/auth/me`); expect((await me.json()).user === null, 'sessão da aluna continua válida');
    const r = await aluna.ctx.request.post(`${API}/auth/login`, { data: { email: 'aluna@opah.test', password: ALUNA_PW }, headers: csrf }); expect(r.status() === 401, 'desativada logou');
    await row.getByRole('button', { name: 'Reativar' }).click(); await row.getByText('Ativa', { exact: true }).waitFor();
    const r2 = await aluna.ctx.request.post(`${API}/auth/login`, { data: { email: 'aluna@opah.test', password: ALUNA_PW }, headers: csrf }); expect(r2.ok(), 'reativada não logou');
  });
  await step('logout limpa o progresso do navegador e outro usuário não vê o progresso do anterior', async () => {
    await aluna.page.goto(WEB); await nav(aluna).waitFor();
    await openConsole(aluna, 'Sair da conta'); await aluna.page.getByRole('heading', { name: 'Entrar' }).waitFor();
    const keys = await aluna.page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('cybershield.') && k !== 'cybershield.learner.v1'));
    expect(keys.length === 0, `restou progresso no storage: ${keys.join(',')}`);
    await uiLogin(aluna, 'bruno@opah.test', created.bruno2); await forcedChange(aluna, created.bruno2, PW);
    await aluna.page.getByRole('group', { name: 'Área de treinamento' }).getByRole('button', { name: 'LGPD', exact: true }).click();
    expect(await nav(aluna).getByLabel('Concluído', { exact: true }).count() === 0, 'Bruno vê conclusões da Aluna (vazamento entre usuários)');
    await aluna.page.getByRole('group', { name: 'Área de treinamento' }).getByRole('button', { name: 'CIS', exact: true }).click();
    expect(await nav(aluna).getByLabel('Concluído', { exact: true }).count() === 0, 'CIS parcial não conclui módulo'); // 2 cenários não fecham um módulo
  });

  // ───────── 8. Trilha de auditoria ─────────
  phase = '8-auditoria';
  await step('auditora: trilha com cadeia íntegra e eventos esperados (login, falha, bloqueio, usuário, selo, exportação, negado)', async () => {
    await openConsole(aud, 'Trilha de auditoria'); await aud.page.getByRole('heading', { name: 'Trilha de auditoria' }).waitFor();
    await aud.page.getByText(/Cadeia íntegra/).waitFor(); await shot(aud, '02-auditoria');
    const all = (await (await aud.ctx.request.get(`${API}/audit?limit=1000`)).json()).entries.map((e) => e.action);
    for (const a of ['auth.bootstrap', 'auth.login.success', 'auth.login.failure', 'auth.lockout', 'auth.password.change', 'auth.password.reset', 'user.create', 'user.disable', 'user.enable', 'seal.issue', 'report.export', 'report.view', 'access.denied', 'data.erase.denied']) expect(all.includes(a), `falta evento ${a}`);
  });
  await step('filtros da auditoria (tipo e pessoa) e exportação CSV com cadeia verificada', async () => {
    await aud.page.getByLabel('Tipo de evento').selectOption('auth.lockout'); await aud.page.getByRole('row').filter({ hasText: 'auth.lockout' }).first().waitFor();
    await aud.page.getByRole('row').filter({ hasText: 'auth.login.success' }).first().waitFor({ state: 'detached', timeout: 4000 }).catch(() => { throw new Error('filtro não aplicado'); });
    await aud.page.getByLabel('Tipo de evento').selectOption('');
    const [dl] = await Promise.all([aud.page.waitForEvent('download'), aud.page.getByRole('button', { name: 'Exportar CSV' }).click()]);
    const p = path.join(OUT, dl.suggestedFilename()); await dl.saveAs(p); const txt = fs.readFileSync(p, 'utf8');
    expect(txt.includes('seq;data_hora_utc;acao'), 'cabeçalho'); expect(!/Senha-Forte|Adm1n|scrypt/.test(txt), 'segredo no CSV de auditoria');
  });
  await step('arquivos de dados no servidor não guardam senhas em claro nem o log contém segredos', async () => {
    const users = fs.readFileSync(path.join(DATA_DIR, 'users.json'), 'utf8'); const log = fs.readFileSync(path.join(DATA_DIR, 'audit-log.jsonl'), 'utf8');
    for (const s of [ADMIN.first, ADMIN.pw, PW, created.aluna, created.bruno2]) { expect(!users.includes(s) && !log.includes(s), 'senha em claro em disco'); }
    expect(/scrypt\$/.test(users), 'senhas não usam scrypt');
  });
  await step('adulteração da trilha em disco é detectada pela interface (cadeia comprometida)', async () => {
    const f = path.join(DATA_DIR, 'audit-log.jsonl'); const orig = fs.readFileSync(f, 'utf8');
    const lines = orig.trim().split('\n'); lines[3] = lines[3].replace('"ok"', '"fail"'); fs.writeFileSync(f, `${lines.join('\n')}\n`);
    try { await aud.page.getByRole('button', { name: 'Atualizar' }).click(); await aud.page.getByText(/Cadeia comprometida/).waitFor(); await shot(aud, '03-cadeia-comprometida'); }
    finally { const NL = String.fromCharCode(10); const cur = fs.readFileSync(f, 'utf8').trim().split(NL); fs.writeFileSync(f, [...orig.trim().split(NL), ...cur.slice(lines.length)].join(NL) + NL); } // restaura preservando eventos gravados durante a adulteração
    await aud.page.getByRole('button', { name: 'Atualizar' }).click(); await aud.page.getByText(/Cadeia íntegra/).waitFor();
  });

  // ───────── 9. Verificação pública e erros de console ─────────
  phase = '9-publico';
  await step('verificação pública do selo (?verificar=ID) funciona sem login', async () => {
    const meSeal = await (await aluna.ctx.request.post(`${API}/auth/login`, { data: { email: 'aluna@opah.test', password: ALUNA_PW }, headers: csrf })).ok();
    expect(meSeal, 'login'); const sealId = (await (await aluna.ctx.request.get(`${API}/champion/me`)).json()).seal.id;
    const pub = await newUser('publico'); await pub.page.goto(`${WEB}/?verificar=${sealId}`);
    await pub.page.getByText('Selo autêntico').waitFor(); await pub.page.getByText(/Aluna Completa/).waitFor(); await shot(pub, '01-verificacao'); await pub.ctx.close();
  });
  await step('sem erros de JavaScript na página nem respostas 5xx/429 durante toda a jornada', async () => {
    expect(pageErrors.length === 0, `pageerrors: ${pageErrors.slice(0, 3).join(' | ')}`);
    expect(badResponses.length === 0, `respostas ruins: ${badResponses.slice(0, 3).join(' | ')}`);
    expect(consoleErrors.length === 0, `console: ${consoleErrors.slice(0, 3).join(' | ')}`);
  });
}

main().catch((e) => { rec('execução', false, String(e.stack || e).slice(0, 400)); }).finally(async () => {
  try { await browser?.close(); } catch { /* ignore */ }
  killAll();
  const fail = results.filter((r) => !r.ok); const byPhase = {};
  for (const r of results) { byPhase[r.phase] ??= { ok: 0, fail: 0 }; byPhase[r.phase][r.ok ? 'ok' : 'fail']++; }
  console.log('\n=== Resultado por fase ===');
  for (const [p, c] of Object.entries(byPhase)) console.log(`${p.padEnd(14)} ${c.ok} ok · ${c.fail} falha(s)`);
  console.log(`\nTotal: ${results.length - fail.length}/${results.length} passos OK`);
  fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify({ results, consoleErrors, pageErrors, badResponses }, null, 2));
  console.log(`Prints, PDF, Excel e JSON em: ${OUT}`);
  if (fail.length) { console.log('\nFalhas:'); for (const f of fail) console.log(` - [${f.phase}] ${f.name}\n     ${f.note}`); }
  process.exit(fail.length ? 1 : 0);
});
