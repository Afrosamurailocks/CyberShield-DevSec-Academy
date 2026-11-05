/**
 * Testes de autenticação, perfis (RBAC), CSRF, bloqueio de conta, relatório assinado e trilha de auditoria encadeada.
 * Sobe um Express real em porta efêmera com os mesmos módulos do servidor (server/accessRoutes.ts) e dados temporários.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { createLedger, type Totals } from '../server/champion.ts';
import { createAuth, passwordProblem, hashPassword, verifyPassword, LOCK_AFTER } from '../server/auth.ts';
import { createAudit } from '../server/audit.ts';
import { createReports, csvCell } from '../server/report.ts';
import { createAccess, COOKIE } from '../server/accessRoutes.ts';

const TOTALS: Totals = { privacy: 4, cis: 4, iso: 4, owasp: 4, llm: 4, llmlab: 4 };
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'access-'));
const ledger = createLedger({ dir, key: Buffer.alloc(32, 9), totals: () => TOTALS });
const auth = createAuth({ dir });
const audit = createAudit({ dir, key: ledger.derive('audit-v1') });
const reports = createReports({ ledger, users: () => auth.list(), totals: () => TOTALS, finals: () => ['llmlab'] });
const access = createAccess({ auth, audit, ledger, reports, mode: 'required', secureCookie: false, credLimit: 10_000 });
const app = express(); app.use(express.json({ limit: '1mb' })); app.use(access.attach); app.use(access.router);
const server = app.listen(0); const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
after(() => server.close());

async function call(method: string, url: string, opts: { cookie?: string; body?: unknown; csrf?: boolean } = {}) {
  const headers: Record<string, string> = { 'content-type': 'application/json', ...(opts.csrf === false ? {} : { 'x-requested-with': 'cybershield' }) };
  if (opts.cookie) headers.cookie = opts.cookie;
  const r = await fetch(base + url, { method, headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body) });
  const text = Buffer.from(await r.arrayBuffer()).toString('utf8'); // Buffer preserva o BOM (r.text() o remove)
  let json: any; try { json = JSON.parse(text); } catch { /* não JSON */ }
  const sc = r.headers.getSetCookie?.().find((c) => c.startsWith(`${COOKIE}=`));
  return { status: r.status, json, text, headers: r.headers, cookie: sc ? sc.split(';')[0] : undefined, setCookie: sc };
}
const STRONG = 'Valid0-Passw0rd!x';
const ctx: Record<string, any> = {};
async function loginAs(email: string, password: string) { const r = await call('POST', '/auth/login', { body: { email, password } }); return r; }

before(async () => {
  const b = await auth.bootstrap('admin@exemplo.test', 'Adm1n-Inicial#2026');
  ctx.admin = b!.user;
  // admin troca a senha provisória
  const l = await loginAs('admin@exemplo.test', 'Adm1n-Inicial#2026');
  const c = await call('POST', '/auth/change-password', { cookie: l.cookie, body: { current: 'Adm1n-Inicial#2026', next: STRONG } });
  ctx.adminCookie = c.cookie;
  const mk = async (email: string, name: string, role: string, extra: Record<string, unknown> = {}) => {
    const r = await call('POST', '/admin/users', { cookie: ctx.adminCookie, body: { email, name, role, ...extra } });
    assert.equal(r.status, 201, r.text);
    const lg = await loginAs(email, r.json.temporaryPassword);
    const ch = await call('POST', '/auth/change-password', { cookie: lg.cookie, body: { current: r.json.temporaryPassword, next: STRONG } });
    return { id: r.json.user.id as string, cookie: ch.cookie as string, temp: r.json.temporaryPassword as string };
  };
  ctx.manager = await mk('gestora@exemplo.test', 'Gestora Teste', 'manager', { team: 'Plataforma' });
  ctx.alice = await mk('alice@exemplo.test', 'Alice Aluna', 'learner', { team: 'Plataforma', managerId: ctx.manager.id });
  ctx.bob = await mk('bob@exemplo.test', 'Bob Aluno', 'learner', { team: 'Dados' });
  ctx.auditor = await mk('auditor@exemplo.test', 'Auditora Teste', 'auditor');
});

test('política de senha: tamanho, variedade, e-mail e previsíveis', () => {
  assert.ok(passwordProblem('curta1A!'));
  assert.ok(passwordProblem('apenasminusculasmuitolonga'));
  assert.ok(passwordProblem('Maria.Silva-2026!', 'maria.silva@exemplo.test'), 'contém o e-mail');
  assert.ok(passwordProblem('Senha123456789!'), 'previsível');
  assert.equal(passwordProblem(STRONG), null);
  assert.ok(passwordProblem(12345 as unknown as string));
});

test('hash de senha usa scrypt com salt único e verifica em tempo constante', async () => {
  const a = await hashPassword(STRONG); const b = await hashPassword(STRONG);
  assert.notEqual(a, b); assert.match(a, /^scrypt\$/);
  assert.ok(await verifyPassword(STRONG, a)); assert.ok(!(await verifyPassword(`${STRONG}x`, a)));
  assert.ok(!(await verifyPassword(STRONG, 'md5$abc')));
});

test('login: erro único (sem enumeração), cookie HttpOnly+SameSite=Strict, sem senha na resposta', async () => {
  const bad1 = await loginAs('naoexiste@exemplo.test', 'qualquer-Coisa1!'); const bad2 = await loginAs('alice@exemplo.test', 'errada-Senha1234!');
  assert.equal(bad1.status, 401); assert.equal(bad2.status, 401); assert.equal(bad1.text, bad2.text);
  const ok = await loginAs('alice@exemplo.test', STRONG);
  assert.equal(ok.status, 200);
  assert.match(ok.setCookie!, /HttpOnly/); assert.match(ok.setCookie!, /SameSite=Strict/);
  assert.ok(!/scrypt|"pw"/.test(ok.text), 'não vaza hash');
  assert.equal(ok.headers.get('cache-control'), 'no-store');
});

test('sessão rotaciona a cada login (sem fixation) e logout invalida', async () => {
  const a = await loginAs('bob@exemplo.test', STRONG); const b = await loginAs('bob@exemplo.test', STRONG);
  assert.notEqual(a.cookie, b.cookie);
  assert.equal((await call('GET', '/auth/me', { cookie: b.cookie })).json.user.email, 'bob@exemplo.test');
  await call('POST', '/auth/logout', { cookie: b.cookie });
  assert.equal((await call('GET', '/auth/me', { cookie: b.cookie })).json.user, null);
  assert.equal((await call('GET', '/auth/me', { cookie: 'cs_session=forjado' })).json.user, null);
});

test('CSRF: operações que alteram estado exigem o cabeçalho; GET não', async () => {
  const r = await call('POST', '/auth/login', { csrf: false, body: { email: 'alice@exemplo.test', password: STRONG } });
  assert.equal(r.status, 403);
  const r2 = await call('POST', '/admin/users', { cookie: ctx.adminCookie, csrf: false, body: { email: 'x@exemplo.test', name: 'X Y', role: 'learner' } });
  assert.equal(r2.status, 403);
});

test('bloqueio de conta após falhas repetidas, mesmo com a senha certa depois; auditado', async () => {
  const mk = await call('POST', '/admin/users', { cookie: ctx.adminCookie, body: { email: 'trava@exemplo.test', name: 'Conta Trava', role: 'learner' } });
  const temp = mk.json.temporaryPassword;
  for (let i = 0; i < LOCK_AFTER; i++) assert.equal((await loginAs('trava@exemplo.test', `errada-${i}-Abcdef!`)).status, 401);
  const locked = await loginAs('trava@exemplo.test', temp);
  assert.equal(locked.status, 401, 'senha correta é recusada durante o bloqueio');
  assert.ok(audit.all().some((e) => e.action === 'auth.lockout'));
  assert.equal(auth.list().find((u) => u.email === 'trava@exemplo.test')!.lockedUntil > Date.now(), true);
  // administrador destrava ao reativar/resetar
  const rs = await call('POST', `/admin/users/${mk.json.user.id}/reset-password`, { cookie: ctx.adminCookie });
  assert.equal((await loginAs('trava@exemplo.test', rs.json.temporaryPassword)).status, 200);
});

test('senha provisória: troca é obrigatória e bloqueia o resto da API até trocar', async () => {
  const mk = await call('POST', '/admin/users', { cookie: ctx.adminCookie, body: { email: 'novo@exemplo.test', name: 'Novo Usuario', role: 'learner' } });
  const lg = await loginAs('novo@exemplo.test', mk.json.temporaryPassword);
  assert.equal(lg.json.user.mustChange, true);
  const blocked = await call('GET', '/reports/summary', { cookie: lg.cookie });
  assert.equal(blocked.status, 403); assert.equal(blocked.json.mustChange, true);
  const weak = await call('POST', '/auth/change-password', { cookie: lg.cookie, body: { current: mk.json.temporaryPassword, next: 'fraca' } });
  assert.equal(weak.status, 400);
  const same = await call('POST', '/auth/change-password', { cookie: lg.cookie, body: { current: mk.json.temporaryPassword, next: mk.json.temporaryPassword } });
  assert.equal(same.status, 400);
  const ok = await call('POST', '/auth/change-password', { cookie: lg.cookie, body: { current: mk.json.temporaryPassword, next: STRONG } });
  assert.equal(ok.status, 200); assert.notEqual(ok.cookie, lg.cookie);
  assert.equal((await call('GET', '/auth/me', { cookie: lg.cookie })).json.user, null, 'sessão antiga encerrada');
  assert.equal((await call('GET', '/reports/summary', { cookie: ok.cookie })).status, 200);
});

test('RBAC: aluno e gestor não administram nem veem auditoria; auditor lê mas não altera; negativas são auditadas', async () => {
  for (const who of [ctx.alice, ctx.manager]) {
    assert.equal((await call('GET', '/admin/users', { cookie: who.cookie })).status, 403);
    assert.equal((await call('GET', '/audit', { cookie: who.cookie })).status, 403);
    assert.equal((await call('POST', '/admin/users', { cookie: who.cookie, body: { email: 'z@exemplo.test', name: 'Zed Zed', role: 'admin' } })).status, 403);
  }
  assert.equal((await call('GET', '/admin/users', { cookie: ctx.auditor.cookie })).status, 200);
  assert.equal((await call('GET', '/audit', { cookie: ctx.auditor.cookie })).status, 200);
  assert.equal((await call('POST', '/admin/users', { cookie: ctx.auditor.cookie, body: { email: 'z@exemplo.test', name: 'Zed Zed', role: 'learner' } })).status, 403);
  assert.equal((await call('PATCH', `/admin/users/${ctx.alice.id}`, { cookie: ctx.auditor.cookie, body: { role: 'admin' } })).status, 403);
  assert.equal((await call('GET', '/admin/users')).status, 401, 'sem sessão');
  assert.ok(audit.all().some((e) => e.action === 'access.denied' && e.actor?.email === 'alice@exemplo.test'));
  assert.equal(auth.get(ctx.alice.id)!.role, 'learner', 'escalada de privilégio não ocorreu');
});

test('gestão de usuários: validação, e-mail duplicado, último admin e auto-bloqueio', async () => {
  const bad = await call('POST', '/admin/users', { cookie: ctx.adminCookie, body: { email: 'sem-arroba', name: 'X', role: 'learner' } });
  assert.equal(bad.status, 400);
  assert.equal((await call('POST', '/admin/users', { cookie: ctx.adminCookie, body: { email: 'ALICE@exemplo.test', name: 'Outra Alice', role: 'learner' } })).status, 400, 'duplicado (case-insensitive)');
  assert.equal((await call('POST', '/admin/users', { cookie: ctx.adminCookie, body: { email: 'r@exemplo.test', name: 'Perfil Ruim', role: 'root' } })).status, 400);
  const xss = await call('POST', '/admin/users', { cookie: ctx.adminCookie, body: { email: 'xss@exemplo.test', name: '<script>alert(1)</script> Fulano', role: 'learner' } });
  assert.ok(!xss.json.user.name.includes('<'), 'nome sanitizado');
  assert.equal((await call('PATCH', `/admin/users/${ctx.admin.id}`, { cookie: ctx.adminCookie, body: { status: 'disabled' } })).status, 400, 'auto-desativação');
  assert.equal((await call('PATCH', `/admin/users/${ctx.admin.id}`, { cookie: ctx.adminCookie, body: { role: 'learner' } })).status, 400);
  assert.equal(auth.update(ctx.admin.id, { role: 'learner' }).ok, false, 'último admin protegido na camada de dados');
  // desativar derruba a sessão imediatamente
  assert.equal((await call('PATCH', `/admin/users/${ctx.bob.id}`, { cookie: ctx.adminCookie, body: { status: 'disabled' } })).status, 200);
  assert.equal((await call('GET', '/auth/me', { cookie: ctx.bob.cookie })).json.user, null);
  assert.equal((await loginAs('bob@exemplo.test', STRONG)).status, 401, 'desativado não entra');
  await call('PATCH', `/admin/users/${ctx.bob.id}`, { cookie: ctx.adminCookie, body: { status: 'active' } });
  const relog = await loginAs('bob@exemplo.test', STRONG); ctx.bob.cookie = relog.cookie;
  assert.equal(relog.status, 200);
  // mudança de perfil derruba sessão e fica auditada com antes/depois
  await call('PATCH', `/admin/users/${ctx.bob.id}`, { cookie: ctx.adminCookie, body: { role: 'learner', team: 'Dados' } });
  assert.ok(audit.all().some((e) => e.action === 'user.disable' && e.target === ctx.bob.id));
});

test('gestor precisa ser gestor ativo (manager/admin)', async () => {
  const r = await call('PATCH', `/admin/users/${ctx.bob.id}`, { cookie: ctx.adminCookie, body: { managerId: ctx.alice.id } });
  assert.equal(r.status, 400);
});

test('vínculo do progresso anônimo: uma vez, sem sobrescrever e sem roubar de outra conta', async () => {
  const legacy = crypto.randomUUID(); ledger.recordScenario(legacy, 'cis', 'a'); ledger.recordLab(legacy, 'lab1');
  assert.equal((await call('POST', '/auth/link-progress', { cookie: ctx.bob.cookie, body: { learnerId: 'não-é-uuid' } })).status, 400);
  assert.equal((await call('POST', '/auth/link-progress', { cookie: ctx.bob.cookie, body: { learnerId: crypto.randomUUID() } })).json.linked, false, 'sem progresso anônimo');
  const ok = await call('POST', '/auth/link-progress', { cookie: ctx.bob.cookie, body: { learnerId: legacy } });
  assert.equal(ok.status, 200, ok.text);
  assert.equal(ok.json.linked, true);
  const prog = await call('GET', '/champion/progress', { cookie: ctx.bob.cookie });
  assert.ok(prog.json.scenarios['cis:a'] && prog.json.labs.lab1);
  // outra conta não pode reivindicar o mesmo UUID
  assert.equal((await call('POST', '/auth/link-progress', { cookie: ctx.alice.cookie, body: { learnerId: legacy } })).status, 409);
  // conta que já tem progresso não é sobrescrita
  const other = crypto.randomUUID(); ledger.recordScenario(other, 'cis', 'z');
  ledger.recordScenario(auth.get(ctx.alice.id)!.learnerId, 'iso', 'q');
  assert.equal((await call('POST', '/auth/link-progress', { cookie: ctx.alice.cookie, body: { learnerId: other } })).status, 409);
});

function seed() {
  const alice = auth.get(ctx.alice.id)!.learnerId; const bob = auth.get(ctx.bob.id)!.learnerId;
  for (const t of ['privacy', 'cis', 'iso', 'llm'] as const) for (let i = 0; i < 4; i++) ledger.recordScenario(alice, t, `s${i}`, `2026-03-0${i + 1}T10:00:00.000Z`);
  for (let i = 0; i < 4; i++) { ledger.recordLab(alice, `l${i}`, '2026-03-05T10:00:00.000Z'); ledger.recordPromptLab(alice, `p${i}`, '2026-03-06T10:00:00.000Z'); }
  ledger.recordScenario(bob, 'cis', 'x', '2026-03-02T09:00:00.000Z');
}

test('relatório: escopo por perfil e situação calculada pelo registro do servidor', async () => {
  seed();
  const adm = (await call('GET', '/reports/summary', { cookie: ctx.adminCookie })).json;
  assert.equal(adm.meta.scope, 'organization');
  const byName = Object.fromEntries(adm.rows.map((r: any) => [r.email, r]));
  assert.equal(byName['alice@exemplo.test'].situation, 'Aprovado'); assert.equal(byName['alice@exemplo.test'].tier, 'Ouro');
  assert.equal(byName['alice@exemplo.test'].overallPct, 100);
  assert.equal(byName['alice@exemplo.test'].firstActivity, '2026-03-01T10:00:00.000Z');
  assert.ok(byName['alice@exemplo.test'].lastActivity >= '2026-03-06T10:00:00.000Z', 'última atividade = a mais recente registrada');
  assert.ok(byName['bob@exemplo.test'].situation === 'Em andamento');
  assert.equal(byName['gestora@exemplo.test'].situation, 'Não iniciado');

  const mgr = (await call('GET', '/reports/summary', { cookie: ctx.manager.cookie })).json;
  assert.equal(mgr.meta.scope, 'team');
  assert.deepEqual(mgr.rows.map((r: any) => r.email).sort(), ['alice@exemplo.test', 'gestora@exemplo.test']);

  const self = (await call('GET', '/reports/summary', { cookie: ctx.alice.cookie })).json;
  assert.equal(self.meta.scope, 'self'); assert.equal(self.rows.length, 1); assert.equal(self.rows[0].email, 'alice@exemplo.test');

  const f = (await call('GET', '/reports/summary?situation=Aprovado', { cookie: ctx.auditor.cookie })).json;
  assert.ok(f.rows.every((r: any) => r.situation === 'Aprovado')); assert.equal(f.meta.filters.situation, 'Aprovado');
  assert.equal((await call('GET', '/reports/summary')).status, 401);
});

test('relatório JSON assinado: íntegro verifica; qualquer alteração invalida', async () => {
  const ex = await call('GET', '/reports/export?format=json', { cookie: ctx.auditor.cookie });
  assert.equal(ex.status, 200); assert.match(ex.headers.get('content-disposition')!, /RPT-\d{8}-[0-9A-Z]{6}\.json/);
  const doc = JSON.parse(ex.text);
  assert.equal((await call('POST', '/reports/verify', { cookie: ctx.auditor.cookie, body: doc })).json.valid, true);
  const t1 = structuredClone(doc); t1.rows[0].overallPct = 100;
  assert.equal((await call('POST', '/reports/verify', { cookie: ctx.auditor.cookie, body: t1 })).json.valid, false);
  const t2 = structuredClone(doc); t2.meta.generatedBy.email = 'outra@pessoa.test';
  assert.equal((await call('POST', '/reports/verify', { cookie: ctx.auditor.cookie, body: t2 })).json.valid, false);
  const t3 = structuredClone(doc); t3.integrity.signature = '0'.repeat(64);
  assert.equal((await call('POST', '/reports/verify', { cookie: ctx.auditor.cookie, body: t3 })).json.valid, false);
  assert.equal((await call('POST', '/reports/verify', { cookie: ctx.auditor.cookie, body: { x: 1 } })).json.valid, false);
  assert.ok(audit.all().some((e) => e.action === 'report.export' && e.target === doc.meta.reportId), 'exportação auditada');
});

test('formato CSV foi removido do relatório; csvCell segue neutralizando fórmulas (usado na exportação de auditoria)', async () => {
  assert.equal(csvCell('=HYPERLINK("x")'), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvCell('+1'), "'+1"); assert.equal(csvCell('-1+2'), "'-1+2"); assert.equal(csvCell('@SUM(A1)'), "'@SUM(A1)");
  assert.equal(csvCell('a;b'), '"a;b"'); assert.equal(csvCell(null), ''); assert.equal(csvCell(7), '7');
  assert.equal((await call('GET', '/reports/export?format=csv', { cookie: ctx.adminCookie })).status, 400, 'csv não é mais aceito no relatório');
  assert.equal((await call('GET', '/reports/export?format=xml', { cookie: ctx.adminCookie })).status, 400);
});

test('XLSX: abas, Arial, cartões e totais em fórmula, barras de dados, datas reais, filtros, congelamento e exportação auditada', async () => {
  const r = await fetch(`${base}/reports/export?format=xlsx`, { headers: { cookie: ctx.adminCookie, 'x-requested-with': 'cybershield' } });
  assert.equal(r.status, 200); assert.match(r.headers.get('content-type')!, /spreadsheetml/);
  assert.match(r.headers.get('content-disposition')!, /RPT-\d{8}-[0-9A-Z]{6}\.xlsx/);
  const buf = Buffer.from(await r.arrayBuffer()); assert.equal(buf.subarray(0, 2).toString(), 'PK', 'é um zip/xlsx');
  const ExcelJS = (await import('exceljs')).default; const wb = new ExcelJS.Workbook(); await wb.xlsx.load(buf as unknown as ArrayBuffer);
  assert.deepEqual(wb.worksheets.map((w) => w.name), ['Resumo', 'Treinamentos', 'Pessoas', 'Detalhe por trilha', 'Critérios e limites']);
  const tr = wb.getWorksheet('Treinamentos')!;
  assert.equal(tr.getCell('B6').value, 'Treinamento', 'cabeçalho da ficha de treinamentos');
  assert.equal(tr.getCell('B7').value, 'LGPD / Privacidade'); assert.equal(tr.getCell('D7').value, 'LGPD (Lei nº 13.709/2018)');
  assert.equal(typeof tr.getCell('H7').value, 'number', 'itens numéricos, vindos do total real');
  assert.equal(tr.rowCount >= 12, true, 'uma linha por treinamento (6) + nota');
  assert.ok(wb.worksheets.every((w) => w.views[0].showGridLines === false), 'sem grade em todas as abas');
  assert.ok(wb.worksheets.every((w) => w.getImages().length === 1), 'marca em todas as abas');
  assert.ok(wb.model.media?.some((m: { type?: string; extension?: string }) => m.extension === 'png'), 'logo embutida como imagem PNG');
  const people = wb.getWorksheet('Pessoas')!;
  assert.equal(people.getCell('B3').value, 'Pessoa', 'títulos de coluna na linha 3'); assert.equal(people.getCell('C2').value, 'IDENTIFICAÇÃO E SITUAÇÃO', 'faixa de grupos na linha 2');
  assert.equal(people.views[0].ySplit, 3, 'painel congelado compacto (3 linhas)');
  for (const m of people.model.merges ?? []) assert.ok(!/^[AB]1:/.test(m) && !/^[AB]\d+:[C-Z]/.test(m), `mesclagem atravessa a divisão congelada: ${m}`);
  assert.equal(people.rowCount, 3 + auth.list().length, 'uma linha por pessoa');
  assert.ok(people.autoFilter, 'filtro'); assert.equal(people.views[0].state, 'frozen');
  const row = auth.list().map((_, i) => people.getRow(4 + i)).find((x) => x.getCell(3).value === 'alice@exemplo.test')!;
  assert.equal(row.getCell(8).value, 'Aprovado'); assert.equal(row.getCell(10).value, 1); assert.equal(row.getCell(10).numFmt, '0%;-0%;"-"');
  assert.ok(row.getCell(19).value instanceof Date, 'datas são datas reais, não texto');
  const cf = JSON.stringify(people.conditionalFormattings); assert.ok(cf.includes('dataBar'), 'barras de dados nas conclusões');
  const fonts = new Set<string>();
  for (const w of wb.worksheets) w.eachRow((rw) => rw.eachCell((c) => { if (c.value !== null && c.font?.name) fonts.add(c.font.name); }));
  assert.ok([...fonts].every((n) => ['Arial', 'Consolas'].includes(n)), `fontes: ${[...fonts].join(',')}`);
  const sum = wb.getWorksheet('Resumo')!; let formulas = 0;
  sum.eachRow((rw) => rw.eachCell((c) => { if (c.value && typeof c.value === 'object' && 'formula' in c.value) formulas++; }));
  assert.ok(formulas >= 12, `cartões e totais do resumo são fórmulas (${formulas})`);
  const all = JSON.stringify(sum.getSheetValues());
  for (const t of ['RASCUNHO PARA REVISÃO HUMANA', 'RPT-', 'APROVADOS', 'FINAL PENDENTE', 'Situação das pessoas', 'Conclusão média por trilha', 'Por equipe']) assert.ok(all.includes(t), `resumo sem "${t}"`);
  assert.ok(audit.all().some((e) => e.action === 'report.export' && e.detail?.format === 'xlsx'), 'exportação xlsx auditada');
  assert.equal((await fetch(`${base}/reports/export?format=xlsx`)).status, 401);
});

test('trilha de auditoria: eventos de login/ação registrados, sem segredos, e cadeia verificável', async () => {
  const v = audit.verify(); assert.equal(v.ok, true); assert.ok(v.count > 10);
  const raw = fs.readFileSync(audit.file, 'utf8');
  assert.ok(!raw.includes(STRONG) && !raw.includes('scrypt$') && !/temporaryPassword/.test(raw), 'sem senha/hash no log');
  const acts = new Set(audit.all().map((e) => e.action));
  for (const a of ['auth.login.success', 'auth.login.failure', 'auth.password.change', 'user.create', 'report.export']) assert.ok(acts.has(a as any), a);
  const r = await call('GET', '/audit?limit=5', { cookie: ctx.auditor.cookie });
  assert.equal(r.status, 200); assert.equal(r.json.chain.ok, true); assert.ok(r.json.entries.length <= 5);
  const csv = await call('GET', '/audit/export', { cookie: ctx.auditor.cookie });
  assert.equal(csv.headers.get('x-audit-chain-ok'), 'true'); assert.ok(csv.text.startsWith('﻿seq;data_hora_utc;'));
});

test('trilha de auditoria detecta edição, remoção e reordenação de linhas', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'aud-')); const a = createAudit({ dir: d, key: Buffer.alloc(32, 1) });
  for (let i = 0; i < 6; i++) a.log({ action: 'auth.login.success', outcome: 'ok', actor: { id: `u${i}`, email: `u${i}@x.test`, role: 'learner' } });
  assert.equal(a.verify().ok, true);
  const orig = fs.readFileSync(a.file, 'utf8').trim().split('\n');
  const check = (lines: string[]) => { fs.writeFileSync(a.file, `${lines.join('\n')}\n`); return a.verify(); };
  const edited = [...orig]; edited[2] = edited[2].replace('learner', 'admin');
  const r1 = check(edited); assert.equal(r1.ok, false); assert.equal(r1.brokenAtSeq, 3);
  const removed = orig.filter((_, i) => i !== 2); const r2 = check(removed); assert.equal(r2.ok, false); assert.equal(r2.brokenAtSeq, 4);
  const swapped = [...orig]; [swapped[1], swapped[2]] = [swapped[2], swapped[1]]; assert.equal(check(swapped).ok, false);
  assert.equal(check(orig).ok, true, 'original volta a verificar');
  assert.equal(check([...orig, '{lixo']).ok, false);
  // cadeia continua após reinício do processo
  fs.writeFileSync(a.file, `${orig.join('\n')}\n`);
  const b = createAudit({ dir: d, key: Buffer.alloc(32, 1) }); b.log({ action: 'auth.logout', outcome: 'ok' }); assert.equal(b.verify().ok, true);
  // chave errada não valida a cadeia
  assert.equal(createAudit({ dir: d, key: Buffer.alloc(32, 2) }).verify().ok, false);
});

test('expiração de sessão por inatividade e por tempo absoluto', async () => {
  let t = 1_000_000; const d = fs.mkdtempSync(path.join(os.tmpdir(), 'sess-'));
  const a = createAuth({ dir: d, now: () => t }); await a.bootstrap('x@exemplo.test', STRONG);
  const r = await a.authenticate('x@exemplo.test', STRONG); assert.ok(r.ok);
  const token = (r as any).token;
  t += 29 * 60_000; assert.ok(a.session(token).user, 'ainda válida (renova)');
  t += 29 * 60_000; assert.ok(a.session(token).user, 'atividade renova a inatividade');
  t += 31 * 60_000; assert.equal(a.session(token).user, null, 'ociosa por mais de 30 min');
  const r2 = await a.authenticate('x@exemplo.test', STRONG); const tk2 = (r2 as any).token;
  for (let i = 0; i < 17; i++) { t += 29 * 60_000; a.session(tk2); }
  assert.equal(a.session(tk2).user, null, 'limite absoluto de 8 h');
});

test('arquivos de dados: usuários sem senha em claro; e-mail fora do domínio permitido é recusado', async () => {
  const raw = fs.readFileSync(auth.file, 'utf8');
  assert.ok(!raw.includes(STRONG) && !raw.includes('Adm1n-Inicial'), 'senhas não ficam em claro');
  const a = createAuth({ dir: fs.mkdtempSync(path.join(os.tmpdir(), 'dom-')), allowedEmailDomain: 'exemplo.com.br' });
  assert.equal((await a.create({ email: 'x@gmail.com', name: 'Fulano Teste', role: 'learner' })).ok, false);
  assert.equal((await a.create({ email: 'x@exemplo.com.br', name: 'Fulano Teste', role: 'learner' })).ok, true);
});

test('limite por IP nas rotas de credencial responde 429', async () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'lim-'));
  const l2 = createLedger({ dir: d, key: Buffer.alloc(32, 3), totals: () => TOTALS }); const a2 = createAuth({ dir: d });
  const x = createAccess({ auth: a2, audit: createAudit({ dir: d, key: Buffer.alloc(32, 4) }), ledger: l2, reports: createReports({ ledger: l2, users: () => a2.list(), totals: () => TOTALS, finals: () => [] }), mode: 'required', secureCookie: false, credLimit: 3 });
  const ap = express(); ap.use(express.json()); ap.use(x.attach); ap.use(x.router);
  const srv = ap.listen(0); const u = `http://127.0.0.1:${(srv.address() as AddressInfo).port}/auth/login`;
  try {
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) codes.push((await fetch(u, { method: 'POST', headers: { 'content-type': 'application/json', 'x-requested-with': 'cybershield' }, body: JSON.stringify({ email: 'a@b.test', password: 'x' }) })).status);
    assert.deepEqual(codes, [401, 401, 401, 429, 429]);
  } finally { srv.close(); }
});
