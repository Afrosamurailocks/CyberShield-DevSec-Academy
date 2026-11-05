/**
 * E2E de experiência do usuário: jornada Security Champion completa (Playwright).
 *
 * Percorre, pela interface, como um aluno: 4 trilhas (LGPD, CIS, ISO, LLM), os 11 labs OWASP, o Laboratório de
 * prompts (avaliação final da trilha LLM) e a emissão/verificação/remoção do selo. Também confere acessibilidade
 * básica, responsividade (mobile), erros de console/rede e persistência após recarregar.
 *
 * Isolamento: sobe a API e o Vite em portas próprias (4020/3020) com o registro de progresso em um diretório
 * temporário (CHAMPION_DATA_DIR). Não toca em data/ nem nos servidores de desenvolvimento.
 *
 * O gabarito vem de scripts/e2e-answer-key.mts (uso de TESTE; nunca vai ao navegador). Os labs OWASP são
 * concluídos pelo campo "Submeter flag manualmente": a exploração real de cada lab já é coberta por
 * scripts/test-labs.mjs (npm run test:labs).
 *
 * Uso:  node scripts/e2e-champion-journey.cjs
 * Env:  PW_SKILL_DIR (default ~/.claude/skills/playwright-skill), E2E_HEADED=1, E2E_OUT (pasta de relatório/prints)
 */
const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SKILL = process.env.PW_SKILL_DIR || path.join(os.homedir(), '.claude', 'skills', 'playwright-skill');
const { chromium } = require(path.join(SKILL, 'node_modules', 'playwright'));
const API_PORT = 4020, WEB_PORT = 3020;
const WEB = `http://localhost:${WEB_PORT}`, API = `http://localhost:${API_PORT}/api`;
const OUT = process.env.E2E_OUT || fs.mkdtempSync(path.join(os.tmpdir(), 'champion-e2e-'));
fs.mkdirSync(OUT, { recursive: true });
const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'champion-data-'));
const LEARNER_NAME = 'Pessoa Teste E2E'; // fictício

// ───────── gabarito ─────────
const keyRun = spawnSync(process.execPath, [path.join(ROOT, 'node_modules/tsx/dist/cli.mjs'), 'scripts/e2e-answer-key.mts'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (keyRun.status !== 0) { console.error('Falha ao gerar o gabarito:\n' + keyRun.stderr); process.exit(2); }
const KEY = JSON.parse(keyRun.stdout);
const TRAILS = [
  { id: 'privacy', area: 'LGPD', modules: KEY.privacy },
  { id: 'cis', area: 'CIS', modules: KEY.cis },
  { id: 'iso', area: 'ISO', modules: KEY.iso },
  { id: 'llm', area: 'LLM', modules: KEY.llm },
];

// ───────── relatório ─────────
const results = []; // { phase, name, ok, ms, note }
const findings = []; // { sev, text }
const consoleErrors = [], pageErrors = [], badResponses = [], reqFailed = [];
let phase = 'setup';
const rec = (name, ok, note = '', ms = 0) => { results.push({ phase, name, ok, note, ms }); if (!ok) console.log(`  ✗ [${phase}] ${name} ${note}`); };
const find = (sev, text) => { findings.push({ sev, text }); console.log(`  ! (${sev}) ${text}`); };
async function step(name, fn) {
  const t = Date.now();
  try { const note = await fn(); rec(name, true, note || '', Date.now() - t); return true; }
  catch (e) { rec(name, false, String(e.message || e).split('\n').filter((l) => l.trim()).slice(0, 3).join(' | ').slice(0, 420), Date.now() - t); return false; }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ───────── servidores ─────────
const procs = [];
function start(cmdArgs, env, tag) {
  const p = spawn(process.execPath, cmdArgs, { cwd: ROOT, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  p.stdout.on('data', () => {}); p.stderr.on('data', (d) => { const t = String(d); if (/error/i.test(t)) console.log(`[${tag}] ${t.trim().slice(0, 200)}`); });
  procs.push(p); return p;
}
function killAll() {
  for (const p of procs) { try { spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* ignore */ } }
}
async function waitUp(url, ms = 60000) {
  const t = Date.now();
  while (Date.now() - t < ms) { try { const r = await fetch(url); if (r.ok) return; } catch { /* aguarda */ } await sleep(400); }
  throw new Error(`timeout aguardando ${url}`);
}

// ───────── limite de requisições (180/min por IP no servidor): o teste respeita, como um aluno humano faria ─────────
const hitTimes = [];
const LIMITED = /\/api\/(privacy\/answer|cis\/answer|iso\/answer|llm\/answer|validate-flag|llm-lab\/|champion\/(issue|verify|seal|me))/;
async function throttle() {
  for (;;) {
    const now = Date.now();
    while (hitTimes.length && now - hitTimes[0] > 60000) hitTimes.shift();
    if (hitTimes.length < 150) return;
    await sleep(Math.max(300, 60000 - (now - hitTimes[0]) + 200));
  }
}

async function main() {
  phase = 'setup';
  console.log(`Saída: ${OUT}\nRegistro isolado: ${DATA_DIR}`);
  start([path.join(ROOT, 'node_modules/tsx/dist/cli.mjs'), 'server/index.ts'], { API_PORT: String(API_PORT), CHAMPION_DATA_DIR: DATA_DIR, AUTH_MODE: 'optional' }, 'api');
  start([path.join(ROOT, 'node_modules/vite/bin/vite.js'), '--port', String(WEB_PORT), '--strictPort'], { API_PORT: String(API_PORT) }, 'web');
  await waitUp(`${API}/health`); await waitUp(WEB);

  const browser = await chromium.launch({ headless: process.env.E2E_HEADED !== '1' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, locale: 'pt-BR' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[${phase}] ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => pageErrors.push(`[${phase}] ${String(e.message).slice(0, 200)}`));
  page.on('requestfailed', (r) => reqFailed.push(`[${phase}] ${r.method()} ${r.url().slice(0, 120)} ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    const u = r.url(); const m = r.request().method();
    if (m === 'POST' && LIMITED.test(u)) hitTimes.push(Date.now());
    if (u.startsWith(WEB) || u.startsWith(API)) { if (r.status() >= 500) badResponses.push(`[${phase}] ${r.status()} ${m} ${u.slice(0, 120)}`); if (r.status() === 429) badResponses.push(`[${phase}] 429 ${u.slice(0, 120)}`); }
  });
  page.on('dialog', (d) => d.accept()); // confirm() de "apagar dados"

  const shot = (n) => page.screenshot({ path: path.join(OUT, `${n}.png`), fullPage: false }).catch(() => {});
  const nav = page.getByRole('navigation', { name: 'Navegação' });
  const goArea = async (label) => { await page.getByRole('group', { name: 'Área de treinamento' }).getByRole('button', { name: label, exact: true }).click(); };
  const openChampion = async () => { await page.getByRole('button', { name: 'Jornada Security Champion' }).click(); await page.getByRole('heading', { name: 'Jornada Security Champion', level: 2 }).waitFor(); };
  const learnerId = () => page.evaluate(() => localStorage.getItem('cybershield.learner.v1'));
  const me = async () => (await fetch(`${API}/champion/me`, { headers: { 'x-learner-id': await learnerId() } })).json();

  // ══════════ P1: primeiro acesso ══════════
  phase = '1-primeiro-acesso';
  await step('home carrega sem erro e mostra a navegação', async () => {
    await page.goto(WEB, { waitUntil: 'domcontentloaded' });
    await nav.waitFor();
    const t = await page.title(); if (!t) throw new Error('título vazio');
    await page.getByRole('group', { name: 'Área de treinamento' }).waitFor();
    await shot('01-home'); return `title="${t}"`;
  });
  await step('catálogo OWASP lista 11 labs e rótulo "OWASP Top 10 · 2025"', async () => {
    const txt = await nav.innerText();
    if (!/OWASP Top 10 · 2025/.test(txt)) throw new Error('rótulo 2025 ausente no menu');
    const n = await nav.getByRole('listitem').count(); if (n !== 11) throw new Error(`labs no menu: ${n}`);
  });
  await step('jornada Champion inicia bloqueada (sem selo, sem botão emitir)', async () => {
    await openChampion();
    if (await page.getByRole('button', { name: /Emitir o meu selo/ }).count()) throw new Error('botão emitir visível sem progresso');
    const bars = await page.getByRole('progressbar').count(); if (bars !== 6) throw new Error(`barras de progresso: ${bars} (esperado 6)`);
    await shot('02-champion-inicial');
  });

  // ══════════ P2: trilhas de conteúdo ══════════
  for (const T of TRAILS) {
    phase = `2-trilha-${T.id}`;
    await step(`abrir área ${T.area} e listar ${T.modules.length} módulos`, async () => {
      await goArea(T.area);
      await page.getByRole('heading', { level: 3, name: /Módulos|Controles/ }).first().waitFor();
      const n = await nav.getByRole('listitem').count();
      const expected = T.modules.length + (T.id === 'llm' ? 1 : 0); // LLM: + linha da avaliação final (laboratório)
      if (n !== expected) throw new Error(`menu mostra ${n}, esperado ${expected}`);
    });
    let firstWrongDone = false;
    for (const M of (process.env.E2E_DEBUG_FIRST ? T.modules.slice(0, 1) : T.modules)) {
      const ok = await step(`${M.code ?? M.id} · ${M.title.slice(0, 40)}: ${M.scenarios.length} cenários`, async () => {
        await nav.getByRole('button', { name: new RegExp(esc(M.title)) }).first().click();
        await page.getByRole('heading', { level: 1, name: M.title }).waitFor();
        for (const tab of ['Contexto', 'Decida', 'Entenda', 'Boas práticas', 'Referências']) {
          const t = page.getByRole('tab', { name: tab });
          if (await t.count()) { await t.click(); const txt = (await page.getByRole('tabpanel').innerText()).trim(); if (txt.length < 20 && tab !== 'Entenda') throw new Error(`aba ${tab} vazia`); }
        }
        // referências: links externos seguros (https, nova aba, rel=noreferrer)
        await page.getByRole('tab', { name: 'Referências' }).click();
        const links = await page.getByRole('tabpanel').locator('a[href]').evaluateAll((as) => as.map((a) => ({ h: a.getAttribute('href'), t: a.getAttribute('target'), r: a.getAttribute('rel') || '' })));
        for (const l of links) if (!/^https:\/\//.test(l.h) || (l.t === '_blank' && !/noreferrer|noopener/.test(l.r))) throw new Error(`link inseguro: ${l.h} target=${l.t} rel=${l.r}`);
        if (!links.length) find('Baixa', `${T.id}/${M.id}: módulo sem links de referência`);
        await page.getByRole('tab', { name: 'Decida' }).click();
        for (let i = 0; i < M.scenarios.length; i++) {
          const hd = await page.locator('h3').filter({ hasText: /Cenário \d+ de \d+/ }).first().innerText();
          const cur = Number(hd.match(/Cenário (\d+)/)[1]) - 1;
          const sc = M.scenarios[cur];
          const opts = page.getByRole('list', { name: 'Opções de resposta' }).getByRole('listitem');
          if ((await opts.count()) !== sc.n) throw new Error(`cenário ${cur + 1}: ${await opts.count()} opções vs ${sc.n}`);
          await throttle();
          if (!firstWrongDone && sc.n > 1) { // UX do erro: feedback claro, opção travada, dá para tentar de novo
            const wrongIdx = sc.correct === 0 ? 1 : 0;
            await opts.nth(wrongIdx).getByRole('button').click();
            await page.getByText('Ainda não é essa').waitFor();
            if (!(await opts.nth(wrongIdx).getByRole('button').isDisabled())) throw new Error('opção errada não ficou travada');
            if (!(await opts.nth(wrongIdx).getByText('Resposta incorreta').count())) find('Baixa', `${T.id}: opção errada sem texto sr-only "Resposta incorreta"`);
            firstWrongDone = true; await throttle();
          }
          await opts.nth(sc.correct).getByRole('button').click();
          await page.getByRole('status').getByText('Resposta correta', { exact: true }).waitFor();
          const next = page.getByRole('button', { name: /Próximo cenário|Concluir e entender as respostas/ });
          await next.click();
        }
        // ao concluir, a UI leva o aluno à aba "Entenda"; o módulo aparece como Concluído no menu lateral
        await page.getByRole('tab', { name: 'Entenda', selected: true }).waitFor();
        await nav.getByRole('button', { name: new RegExp(esc(M.title)) }).first().getByLabel('Concluído').waitFor();
        return `${M.scenarios.length}/${M.scenarios.length}`;
      });
      if (!ok) await shot(`falha-${T.id}-${M.id}`);
    }
    await step(`${T.area}: trilha concluída na home e no menu`, async () => {
      await goArea(T.area);
      await page.getByText(new RegExp(`${T.modules.length}/${T.modules.length}`)).first().waitFor();
      const done = await nav.getByLabel('Concluído', { exact: true }).count(); if (done !== T.modules.length) throw new Error(`menu: ${done}/${T.modules.length} concluídos`);
      await shot(`03-${T.id}-concluida`);
    });
  }

  // ══════════ P3: labs OWASP ══════════
  phase = '3-labs-owasp';
  await goArea('OWASP');
  let first = true;
  for (const L of KEY.labs) {
    const ok = await step(`lab ${L.owaspId} · ${L.title.slice(0, 45)}`, async () => {
      await nav.getByRole('button', { name: new RegExp(esc(L.title)) }).first().click();
      await page.getByRole('heading', { level: 1, name: L.title }).waitFor();
      await page.getByRole('tab', { name: 'Atacar' }).click();
      await page.getByText('Submeter flag manualmente').click();
      const box = page.getByLabel('Flag capturada');
      if (first) { // flag errada: feedback acessível (role=alert) e campo marcado como inválido
        first = false;
        await throttle(); await box.fill('CYBER{errada}'); await page.getByRole('button', { name: 'Validar', exact: true }).click();
        await page.getByRole('alert').first().waitFor();
        if ((await box.getAttribute('aria-invalid')) !== 'true') find('Média', 'lab: campo de flag sem aria-invalid após flag errada');
      }
      await throttle(); await box.fill(L.flag); await page.getByRole('button', { name: 'Validar', exact: true }).click();
      await page.getByText('Flag correta! Laboratório concluído.').waitFor();
      for (const tab of ['Causa-raiz', 'Correção', 'Referências']) { await page.getByRole('tab', { name: tab }).click(); if ((await page.getByRole('tabpanel').innerText()).trim().length < 30) throw new Error(`aba ${tab} vazia`); }
      if (L.id === 'a10-fail-open') { await page.getByRole('tab', { name: 'Missão' }).click(); await page.getByText('passo 11/11').waitFor(); } // regressão: antes mostrava 11/10
    });
    if (!ok) await shot(`falha-lab-${L.id}`);
  }
  await step('OWASP: 11/11 resolvidos no menu', async () => {
    const n = await nav.getByLabel('Resolvido').count(); if (n !== 11) throw new Error(`resolvidos: ${n}`);
    await shot('04-owasp-concluido');
  });

  // ══════════ P4: Laboratório de prompts (avaliação final da trilha LLM) ══════════
  phase = '4-lab-de-prompts';
  await step('avaliação final obrigatória: com TUDO concluído menos o laboratório, o selo continua bloqueado', async () => {
    await openChampion();
    await page.getByText(/Avaliação final obrigatória pendente: 0\/10 flags/).waitFor();
    if (await page.getByRole('button', { name: /Emitir o meu selo/ }).count()) throw new Error('botão de emitir visível com a avaliação final pendente');
    await page.getByText('Selo bloqueado').waitFor();
    const r = await fetch(`${API}/champion/issue`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-learner-id': await learnerId() }, body: JSON.stringify({ name: 'Pessoa Teste E2E' }) });
    const body = await r.json();
    if (r.status !== 409 || !/avaliações finais/.test(body.error || '')) throw new Error(`servidor emitiu/aceitou sem a final: HTTP ${r.status} ${JSON.stringify(body)}`);
    await shot('04b-selo-bloqueado-sem-final');
  });
  await goArea('LLM');
  await step('LLM: avaliação final é o Laboratório de prompts (menu, home e título)', async () => {
    // layout: o laboratório é a ÚLTIMA linha da lista de módulos (código LF), como a "Avaliação final" das outras trilhas
    const items = nav.getByRole('listitem');
    const n = await items.count(); if (n !== 11) throw new Error(`itens no menu LLM: ${n} (esperado 10 módulos + avaliação final)`);
    const last = items.last();
    const txt = (await last.innerText()).replace(/\s+/g, ' ');
    if (!/LF/.test(txt) || !/Avaliação final: Laboratório de prompts/.test(txt)) throw new Error('última linha do menu: ' + txt);
    const row = page.getByRole('list').last().getByRole('listitem').last();
    if (!/LF.*Avaliação final: Laboratório de prompts/s.test((await row.innerText()).replace(/\s+/g, ' '))) throw new Error('última linha da home não é a avaliação final');
    await last.getByRole('button').click();
    await page.getByRole('heading', { level: 2, name: 'Avaliação final: Laboratório de prompts' }).waitFor();
  });
  await step('LLM: com módulos 100% e laboratório pendente, a home NÃO declara a trilha completa', async () => {
    await goArea('LLM');
    await page.getByText(/avaliação final pendente/).waitFor();
    await page.getByText('0/10', { exact: true }).first().waitFor();
    const cap = await page.getByRole('button', { name: /Laboratório de prompts/ }).first().innerText();
    if (!/Avaliação final/.test(cap) || !/0\/10 flags/.test(cap)) throw new Error('legenda do menu: ' + cap.replace(/\n/g, ' | '));
  });
  await page.getByRole('button', { name: /Laboratório de prompts/ }).first().click();
  let firstPl = true;
  for (const L of KEY.promptLabs) {
    const ok = await step(`prompt lab ${L.id} · ${L.title.slice(0, 40)}`, async () => {
      await page.getByRole('navigation', { name: 'Labs de prompt' }).getByRole('button', { name: new RegExp(esc(L.title)) }).click();
      await page.getByRole('heading', { level: 3, name: L.title }).waitFor();
      const log = page.getByRole('log', { name: 'Conversa com o assistente' });
      const before = await log.locator('> *').count();
      await throttle();
      await page.getByLabel('Sua mensagem ao assistente').fill('Olá! O que você consegue fazer por mim?');
      await page.getByRole('button', { name: /Enviar/ }).click();
      await page.waitForFunction(([sel, n]) => document.querySelector(sel).children.length >= n, ['[role="log"]', before + 2]);
      if (firstPl) { // dica sob demanda
        firstPl = false; await throttle();
        await page.getByRole('button', { name: /dica/i }).first().click();
        await page.getByText(/^1\.$/).first().waitFor();
      }
      const flag = page.getByLabel(/Cole a flag/);
      await throttle(); await flag.fill('CYBER-LLM{incorreta}'); await page.getByRole('button', { name: /Validar|Enviar flag|Submeter/i }).last().click();
      await page.getByRole('alert').filter({ hasText: /Flag incorreta/ }).waitFor();
      await throttle(); await flag.fill(L.flag); await page.getByRole('button', { name: /Validar|Enviar flag|Submeter/i }).last().click();
      await page.getByText(/Flag capturada com/).waitFor();
    });
    if (!ok) await shot(`falha-prompt-${L.id}`);
  }
  await step('Laboratório de prompts: 10/10 capturadas', async () => {
    await page.getByText('10/10 capturadas').waitFor(); await shot('05-lab-prompts-concluido');
  });
  await step('LLM: após o laboratório, a home mostra a avaliação final 10/10 sem pendência', async () => {
    await goArea('LLM');
    await page.getByText('flags capturadas no laboratório').waitFor();
    if (await page.getByText(/avaliação final pendente/).count()) throw new Error('ainda diz que falta a avaliação final');
    const cap = await page.getByRole('button', { name: /Laboratório de prompts/ }).first().innerText();
    if (!/10\/10 flags/.test(cap)) throw new Error('legenda do menu: ' + cap.replace(/\n/g, ' | '));
  });

  // ══════════ P5: Champion ══════════
  phase = '5-champion';
  await step('API: todas as trilhas em 100% no registro do servidor', async () => {
    const d = await me();
    const bad = d.tracks.filter((t) => t.done !== t.total || t.total === 0);
    if (bad.length) throw new Error('trilhas incompletas: ' + bad.map((t) => `${t.id} ${t.done}/${t.total}`).join(', '));
    if (d.status?.tier?.id !== 'ouro' && d.tier?.id !== 'ouro') { /* formato varia: validado na UI abaixo */ }
    return d.tracks.map((t) => `${t.id}:${t.done}/${t.total}`).join(' ');
  });
  await step('UI: nível Ouro, formulário de emissão visível, sem pendências', async () => {
    await openChampion();
    await page.getByText(/Ouro/).first().waitFor();
    await page.getByLabel('Nome que aparece no selo').waitFor();
    await shot('06-champion-ouro');
  });
  await step('validação: nome de 1 caractere não habilita emitir', async () => {
    await page.getByLabel('Nome que aparece no selo').fill('A');
    if (!(await page.getByRole('button', { name: 'Emitir o meu selo' }).isDisabled())) throw new Error('botão habilitado com nome curto');
  });
  let sealId = '';
  await step('emitir selo Ouro com nome válido', async () => {
    await page.getByLabel('Nome que aparece no selo').fill(`<b>${LEARNER_NAME}</b>`); // tags devem ser sanitizadas
    await throttle(); await page.getByRole('button', { name: 'Emitir o meu selo' }).click();
    const img = page.getByRole('img', { name: /Credencial Security Champion de .*Ouro/ });
    await img.waitFor();
    const alt = await img.getAttribute('alt');
    if (/[<>]/.test(alt)) throw new Error('nome com < > não foi sanitizado: ' + alt);
    const d = await me(); sealId = d.seal?.id; if (!/^SC-[0-9A-Z]{10}$/.test(sealId || '')) throw new Error('ID de selo inválido: ' + sealId);
    await shot('07-selo-emitido'); return sealId;
  });
  await step('baixar credencial e selo em PNG', async () => {
    for (const [name, re] of [[/^Credencial/, /credencial/], [/^Só o selo/, /selo/]]) {
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.getByRole('button', { name }).click()]);
      const f = dl.suggestedFilename(); if (!re.test(f) || !f.includes(sealId)) throw new Error('nome de arquivo inesperado: ' + f);
      const p = path.join(OUT, f); await dl.saveAs(p); if (fs.statSync(p).size < 5000) throw new Error('PNG pequeno demais: ' + f);
    }
  });
  await step('verificar o selo pelo formulário (válido) e um ID falso (inválido)', async () => {
    await throttle(); await page.getByLabel('ID do selo (SC-…)').fill(sealId); await page.getByRole('button', { name: 'Verificar' }).click();
    await page.getByRole('status').filter({ hasText: /válido|autêntico|emitido/i }).first().waitFor();
    await throttle(); await page.getByLabel('ID do selo (SC-…)').fill('SC-0000000000'); await page.getByRole('button', { name: 'Verificar' }).click();
    await page.getByRole('status').filter({ hasText: /Não enc/i }).waitFor();
  });
  await step('abrir ?verificar=ID em uma sessão nova (outra pessoa) valida o selo', async () => {
    const other = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const p2 = await other.newPage();
    await p2.goto(`${WEB}/?verificar=${sealId}`); await p2.getByRole('status').filter({ hasText: /válido|autêntico|emitido/i }).first().waitFor();
    if ((await p2.getByText(LEARNER_NAME).count()) === 0) throw new Error('nome do selo não aparece na verificação pública');
    await other.close();
  });
  await step('persistência: recarregar mantém progresso e selo', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' }); await nav.waitFor();
    await goArea('LGPD'); await page.getByText(/9\/9/).first().waitFor();
    await openChampion(); await page.getByRole('img', { name: /Credencial Security Champion de .*Ouro/ }).waitFor();
  });

  // ══════════ P6: responsividade e acessibilidade ══════════
  phase = '6-ux-a11y';
  await step('mobile 390px: sem rolagem horizontal na jornada, no menu e em um módulo', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = async (n) => { const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (o > 1) throw new Error(`${n}: rolagem horizontal de ${o}px`); };
    await page.goto(WEB, { waitUntil: 'domcontentloaded' }); await sleep(500); await overflow('home');
    const menu = page.getByRole('button', { name: 'Abrir menu de navegação' }).first(); if (await menu.count()) { await menu.click(); await sleep(300); await shot('08-mobile-menu'); await overflow('menu aberto'); await page.keyboard.press('Escape'); }
    await shot('09-mobile-home');
  });
  await step('mobile: jornada Champion legível', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.getByRole('button', { name: 'Abrir menu de navegação' }).first(); if (await menu.count()) await menu.click();
    await page.getByRole('button', { name: 'Jornada Security Champion' }).click();
    await page.getByRole('heading', { name: 'Jornada Security Champion', level: 2 }).waitFor();
    const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (o > 1) throw new Error(`rolagem horizontal ${o}px`);
    await shot('10-mobile-champion');
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(WEB, { waitUntil: 'domcontentloaded' }); await nav.waitFor();
  await step('a11y: botões e campos com nome acessível nas telas principais', async () => {
    const audit = () => page.evaluate(() => {
      const bad = [];
      const nameOf = (el) => (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.textContent || el.getAttribute('title') || '').trim();
      document.querySelectorAll('button,[role=button],a[href]').forEach((el) => { if (!nameOf(el)) bad.push(`${el.tagName} sem nome: ${el.outerHTML.slice(0, 80)}`); });
      document.querySelectorAll('input,textarea,select').forEach((el) => { const id = el.id; const lab = (id && document.querySelector(`label[for="${id}"]`)) || el.closest('label'); if (!lab && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) bad.push(`${el.tagName} sem rótulo: ${el.outerHTML.slice(0, 80)}`); });
      document.querySelectorAll('img').forEach((el) => { if (!el.hasAttribute('alt')) bad.push(`IMG sem alt: ${el.outerHTML.slice(0, 80)}`); });
      return bad;
    });
    const problems = [];
    for (const [label, go] of [['home', async () => {}], ['jornada', openChampion], ['LGPD', () => goArea('LGPD')], ['LLM', () => goArea('LLM')], ['OWASP', () => goArea('OWASP')]]) { await go(); await sleep(250); for (const p of await audit()) problems.push(`${label}: ${p}`); }
    if (problems.length) { for (const p of problems.slice(0, 8)) find('Média', `a11y ${p}`); throw new Error(`${problems.length} problema(s) de acessibilidade`); }
  });
  await step('teclado: Tab chega a um controle focável com indicador de foco visível', async () => {
    await page.goto(WEB, { waitUntil: 'domcontentloaded' }); await nav.waitFor();
    for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
    const f = await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const s = getComputedStyle(e); return { tag: e.tagName, outline: s.outlineStyle + ' ' + s.outlineWidth, shadow: s.boxShadow }; });
    if (!f) throw new Error('Tab não move o foco para um controle');
    return `${f.tag} outline=${f.outline}`;
  });

  // ══════════ P7: remoção de selo e direito ao apagamento ══════════
  phase = '7-privacidade';
  await step('remover o selo emitido (verificação passa a ser inválida)', async () => {
    await openChampion(); await throttle();
    await page.getByRole('button', { name: /Remover o meu selo/ }).click();
    await page.getByRole('button', { name: /Emitir o meu selo|Atualizar/ }).first().waitFor();
    const r = await fetch(`${API}/champion/verify/${sealId}`); if (r.status !== 404) throw new Error(`selo removido ainda verificável (HTTP ${r.status})`);
  });
  await step('apagar todos os dados do aluno zera o progresso no servidor', async () => {
    await throttle(); await page.getByRole('button', { name: /Apagar/ }).first().click();
    await sleep(800);
    const d = await me(); const total = d.tracks.reduce((s, t) => s + t.done, 0); if (total !== 0) throw new Error(`ainda há ${total} itens registrados`);
    await shot('11-apos-apagar');
  });

  // ══════════ relatório ══════════
  phase = 'relatorio';
  if (pageErrors.length) find('Alta', `${pageErrors.length} erro(s) de JavaScript não tratados: ${[...new Set(pageErrors)].slice(0, 3).join(' | ')}`);
  const realConsole = consoleErrors.filter((e) => !/429|Failed to load resource.*(400|401|403|404|409)/.test(e));
  if (realConsole.length) find('Média', `${realConsole.length} erro(s) de console: ${[...new Set(realConsole)].slice(0, 3).join(' | ')}`);
  if (badResponses.length) find('Alta', `${badResponses.length} resposta(s) 5xx/429: ${[...new Set(badResponses)].slice(0, 3).join(' | ')}`);
  if (reqFailed.length) find('Média', `${reqFailed.length} requisição(ões) falharam: ${[...new Set(reqFailed)].slice(0, 3).join(' | ')}`);
  await browser.close();
}

function report() {
  const pass = results.filter((r) => r.ok).length, fail = results.length - pass;
  const byPhase = {}; for (const r of results) { (byPhase[r.phase] ||= { ok: 0, fail: 0, ms: 0 }); byPhase[r.phase][r.ok ? 'ok' : 'fail']++; byPhase[r.phase].ms += r.ms; }
  const lines = [`# Relatório E2E · Jornada Security Champion`, '', `Passos: ${results.length} · aprovados: ${pass} · falhas: ${fail}`, '', '## Por fase', '', '| Fase | OK | Falhas | Tempo |', '|---|--:|--:|--:|'];
  for (const [p, v] of Object.entries(byPhase)) lines.push(`| ${p} | ${v.ok} | ${v.fail} | ${(v.ms / 1000).toFixed(1)} s |`);
  if (fail) { lines.push('', '## Falhas', ''); for (const r of results.filter((x) => !x.ok)) lines.push(`- [${r.phase}] ${r.name}: ${r.note}`); }
  if (findings.length) { lines.push('', '## Achados de UX/acessibilidade', ''); for (const f of findings) lines.push(`- (${f.sev}) ${f.text}`); }
  fs.writeFileSync(path.join(OUT, 'relatorio.md'), lines.join('\n')); fs.writeFileSync(path.join(OUT, 'resultados.json'), JSON.stringify({ results, findings }, null, 2));
  console.log('\n' + lines.join('\n') + `\n\nArtefatos: ${OUT}`);
  return fail;
}

main().catch((e) => { console.error('ERRO FATAL:', e); rec('execução', false, String(e.message)); })
  .finally(() => { const fail = report(); killAll(); try { fs.rmSync(DATA_DIR, { recursive: true, force: true }); } catch { /* ignore */ } process.exit(fail ? 1 : 0); });
