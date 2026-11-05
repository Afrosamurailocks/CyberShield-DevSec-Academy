/** Testes da Jornada Security Champion: níveis do selo, gargalo, nome e geração segura do SVG. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, pct, cleanName, TIERS } from '../src/academy/champion.ts';
import type { TrackInput } from '../src/academy/champion.ts';
import { cardSvg, sealSvg, esc } from '../src/academy/championSvg.ts';

const mk = (donePct: number[], total = 100): TrackInput[] =>
  donePct.map((p, i) => ({ id: `t${i}`, label: `Trilha ${i}`, short: `T${i}`, area: 'cis', unit: 'cenários', done: Math.round((p / 100) * total), total, why: 'x' }));

test('pct: limites e total zero', () => {
  assert.equal(pct(0, 0), 0);
  assert.equal(pct(5, 0), 0);
  assert.equal(pct(150, 100), 100);
  assert.equal(pct(-3, 10), 0);
  assert.equal(pct(69, 100), 69);
});

test('nível = o MENOR percentual entre as trilhas (gargalo)', () => {
  assert.equal(evaluate(mk([100, 100, 100, 100, 100, 69])).tier, null);
  assert.equal(evaluate(mk([100, 100, 100, 100, 100, 70])).tier?.id, 'bronze');
  assert.equal(evaluate(mk([100, 100, 100, 100, 100, 85])).tier?.id, 'prata');
  assert.equal(evaluate(mk([100, 100, 100, 100, 100, 100])).tier?.id, 'ouro');
  assert.equal(evaluate(mk([100, 99, 100, 100, 100, 100])).tier?.id, 'prata');
});

test('trilha sem conteúdo carregado (total 0) não libera selo', () => {
  const inputs = mk([100, 100, 100, 100, 100, 100]);
  inputs[2] = { ...inputs[2], done: 0, total: 0 };
  assert.equal(evaluate(inputs).tier, null);
  assert.equal(evaluate([]).tier, null);
});

test('próximo nível lista o que falta em unidades', () => {
  const s = evaluate(mk([50, 70, 100, 100, 100, 100]));
  assert.equal(s.tier, null);
  assert.equal(s.next?.tier.id, 'bronze');
  assert.deepEqual(s.next?.missing.map((m) => [m.id, m.units]), [['t0', 20]]);
  const g = evaluate(mk([100, 100, 100, 100, 100, 100]));
  assert.equal(g.next, null, 'ouro não tem próximo');
});

test('limites dos níveis são crescentes', () => {
  assert.deepEqual(TIERS.map((t) => t.min), [...TIERS.map((t) => t.min)].sort((a, b) => a - b));
});

test('cleanName: remove controle e < >, colapsa espaços, corta em 60', () => {
  assert.equal(cleanName('  Ana\u0000   <b>Souza</b>\n '), 'Ana bSouza/b');
  assert.equal(cleanName('x'.repeat(100)).length, 60);
});

test('SVG: o nome é escapado (sem injeção de markup/script)', () => {
  const tracks = evaluate(mk([100, 100, 100, 100, 100, 100])).tracks;
  const evil = '"><script>alert(1)</script><image href="x" onerror="1"/>&';
  const svg = cardSvg({ name: evil, tier: 'ouro', tracks, issuedAt: '2026-11-04T10:00:00Z', id: 'SC-0000001' });
  assert.ok(!svg.includes('<script'), 'script vazou');
  assert.ok(!/<image[^>]*onerror/.test(svg), 'onerror vazou');
  assert.ok(svg.includes('&lt;script&gt;'));
  assert.equal(esc(`<&>"'`), '&lt;&amp;&gt;&quot;&#39;');
});

test('SVG do selo: bem formado, com um segmento por trilha e estado bloqueado', () => {
  const tracks = evaluate(mk([100, 80, 40, 0, 100, 100])).tracks;
  const open = sealSvg({ tracks, tier: 'bronze' });
  const locked = sealSvg({ tracks, tier: null, locked: true });
  assert.ok(open.startsWith('<svg') && open.endsWith('</svg>'));
  assert.ok(open.includes('Nível Bronze') && locked.includes('Em andamento'));
  assert.equal((open.match(/stroke-width="16"/g) ?? []).length >= 6 * 1, true);
});

test('avaliação final obrigatória: sem ela não há nível, nem Bronze, mesmo com 100% nas demais', () => {
  const t = mk([100, 100, 100, 100, 100, 100]);
  t[1] = { ...t[1], final: { done: 14, total: 15 } }; // 99% da trilha, final pendente
  const s = evaluate(t);
  assert.equal(s.tier, null);
  assert.deepEqual(s.pendingFinals, ['t1']);
  assert.equal(s.next?.tier.id, 'bronze');
  assert.deepEqual(s.next?.missing.map((m) => [m.id, m.final]), [['t1', true]]);
  t[1] = { ...t[1], done: 100, final: { done: 15, total: 15 } };
  assert.equal(evaluate(t).tier?.id, 'ouro', 'final concluída libera o nível');
});

test('avaliação final pendente também bloqueia quando o percentual da trilha já passa de 85%', () => {
  const t = mk([100, 100, 100, 100, 100, 100]);
  t[0] = { ...t[0], done: 93, final: { done: 3, total: 15 } };
  assert.equal(evaluate(t).tier, null);
  assert.equal(evaluate(mk([100, 100, 100, 100, 100, 100])).pendingFinals.length, 0);
});
