/**
 * Testes do registro Security Champion no servidor (server/champion.ts): progresso só por registro validado,
 * emissão exige nível, selo assinado e verificável, adulteração detectada, remoção/apagamento e limites.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createLedger, LEARNER_RE, SEAL_ID_RE, type Totals } from '../server/champion.ts';

const TOTALS: Totals = { privacy: 10, cis: 10, iso: 10, owasp: 10, llm: 10, llmlab: 10 };
const mkDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'champ-'));
const uid = () => crypto.randomUUID();
const KEY = Buffer.alloc(32, 7);
const mk = (dir = mkDir(), extra: Partial<Parameters<typeof createLedger>[0]> = {}) => createLedger({ dir, key: KEY, totals: () => TOTALS, ...extra });

function fill(l: ReturnType<typeof mk>, lid: string, upTo = 10, skip?: 'llmlab') {
  for (let i = 0; i < upTo; i++) {
    for (const t of ['privacy', 'cis', 'iso', 'llm'] as const) l.recordScenario(lid, t, `s${i}`);
    l.recordLab(lid, `lab${i}`);
    if (skip !== 'llmlab') l.recordPromptLab(lid, `pl${i}`);
  }
}

test('chave do aluno precisa ser UUID v4', () => {
  assert.ok(LEARNER_RE.test(uid()));
  for (const bad of ['', 'abc', '1234', "' OR 1=1 --", '../../etc/passwd', uid() + 'x']) assert.ok(!LEARNER_RE.test(bad), bad);
});

test('progresso conta uma vez por cenário e nunca passa do total', () => {
  const l = mk(); const lid = uid();
  l.recordScenario(lid, 'cis', 'a'); l.recordScenario(lid, 'cis', 'a'); l.recordScenario(lid, 'cis', 'b');
  assert.equal(l.me(lid).tracks.find((t) => t.id === 'cis')?.done, 2);
  for (let i = 0; i < 50; i++) l.recordScenario(lid, 'iso', `x${i}`);
  assert.equal(l.me(lid).tracks.find((t) => t.id === 'iso')?.done, 10, 'limitado ao total');
});

test('sem registro suficiente, não emite selo (nem com nome válido)', () => {
  const l = mk(); const lid = uid();
  assert.equal(l.issue(lid, 'Maria Exemplo').ok, false);
  fill(l, lid, 6); // 60% < 70%
  assert.equal(l.issue(lid, 'Maria Exemplo').ok, false);
});

test('a trilha mais atrasada impede o selo', () => {
  const l = mk(); const lid = uid();
  fill(l, lid, 10, 'llmlab');
  assert.equal(l.issue(lid, 'Maria Exemplo').ok, false);
  for (let i = 0; i < 6; i++) l.recordPromptLab(lid, `pl${i}`);
  assert.equal(l.issue(lid, 'Maria Exemplo').ok, false, '60% no lab ainda não chega a 70%');
  l.recordPromptLab(lid, 'pl6');
  const r = l.issue(lid, 'Maria Exemplo');
  assert.ok(r.ok && r.seal.tier === 'bronze');
});

test('emite, verifica por ID e valida o formato do ID', () => {
  const l = mk(); const lid = uid(); fill(l, lid);
  const r = l.issue(lid, '  Maria   <b>Exemplo</b> ');
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.seal.tier, 'ouro');
  assert.match(r.seal.id, SEAL_ID_RE);
  assert.equal(r.seal.name, 'Maria bExemplo/b');
  const v = l.verify(r.seal.id);
  assert.equal(v?.name, r.seal.name);
  assert.equal(l.verify('SC-0000000000'), null);
  for (const bad of ['', 'sc-abc', "SC-' OR 1", 123, null, undefined]) assert.equal(l.verify(bad), null);
  assert.ok(!JSON.stringify(v).includes(lid), 'verificação pública não expõe a chave do aluno');
});

test('selo é estável por nível e muda ao subir de nível', () => {
  const l = mk(); const lid = uid();
  fill(l, lid, 9, 'llmlab'); for (let i = 0; i < 9; i++) l.recordPromptLab(lid, `pl${i}`);
  const a = l.issue(lid, 'Maria Exemplo'); assert.ok(a.ok && a.seal.tier === 'prata');
  const a2 = l.issue(lid, 'Maria Exemplo'); assert.ok(a2.ok && a.ok && a2.seal.id === a.seal.id && a2.seal.issuedAt === a.seal.issuedAt);
  fill(l, lid, 10);
  const b = l.issue(lid, 'Maria Exemplo'); assert.ok(b.ok && a.ok && b.seal.tier === 'ouro' && b.seal.id !== a.seal.id);
  assert.equal(l.verify(a.ok ? a.seal.id : ''), null, 'ID antigo deixa de valer');
});

test('adulteração do arquivo é detectada pela assinatura', () => {
  const dir = mkDir(); const l = mk(dir); const lid = uid(); fill(l, lid);
  const r = l.issue(lid, 'Maria Exemplo'); assert.ok(r.ok); if (!r.ok) return;
  const file = path.join(dir, 'champion-ledger.json');
  const db = JSON.parse(fs.readFileSync(file, 'utf8'));
  db.learners[lid].seal.name = 'Pessoa Forjada';
  fs.writeFileSync(file, JSON.stringify(db));
  assert.equal(mk(dir).verify(r.seal.id), null, 'nome adulterado deve invalidar');
  db.learners[lid].seal.name = 'Maria Exemplo'; db.learners[lid].seal.tier = 'bronze';
  fs.writeFileSync(file, JSON.stringify(db));
  assert.equal(mk(dir).verify(r.seal.id), null, 'nível adulterado deve invalidar');
});

test('chave de assinatura diferente invalida selos antigos', () => {
  const dir = mkDir(); const l = mk(dir); const lid = uid(); fill(l, lid);
  const r = l.issue(lid, 'Maria Exemplo'); assert.ok(r.ok); if (!r.ok) return;
  const other = createLedger({ dir, key: Buffer.alloc(32, 9), totals: () => TOTALS });
  assert.equal(other.verify(r.seal.id), null);
});

test('persistência: reabrir o registro mantém progresso e selo', () => {
  const dir = mkDir(); const l = mk(dir); const lid = uid(); fill(l, lid);
  const r = l.issue(lid, 'Maria Exemplo'); l.flush(); assert.ok(r.ok); if (!r.ok) return;
  const again = mk(dir);
  assert.equal(again.me(lid).seal?.id, r.seal.id);
  assert.equal(again.verify(r.seal.id)?.tier, 'ouro');
});

test('remover o selo e apagar os dados (direito do titular)', () => {
  const l = mk(); const lid = uid(); fill(l, lid);
  const r = l.issue(lid, 'Maria Exemplo'); assert.ok(r.ok); if (!r.ok) return;
  assert.equal(l.revokeSeal(lid), true);
  assert.equal(l.verify(r.seal.id), null);
  assert.equal(l.me(lid).tracks.find((t) => t.id === 'cis')?.done, 10, 'progresso permanece após remover só o selo');
  assert.equal(l.erase(lid), true);
  assert.equal(l.me(lid).tracks.every((t) => t.done === 0), true);
  assert.equal(l.erase(lid), false);
});

test('limite de alunos no registro (proteção contra enchimento)', () => {
  const l = mk(mkDir(), { maxLearners: 3 });
  for (let i = 0; i < 3; i++) assert.equal(l.recordScenario(uid(), 'cis', 'a'), true);
  assert.equal(l.recordScenario(uid(), 'cis', 'a'), false);
});

test('nome inválido é recusado', () => {
  const l = mk(); const lid = uid(); fill(l, lid);
  for (const bad of ['', ' ', 'a', '<>', 123, null, undefined]) assert.equal(l.issue(lid, bad).ok, false, String(bad));
});
