/**
 * Testes de integridade do conteúdo das trilhas (LGPD, CIS, ISO, LLM). Rode: npm run test:content
 *
 * Garante: um gabarito por cenário, ids únicos, feedback em todas as opções, visuais presentes,
 * nenhum vazamento do gabarito na API pública, casos reais com fonte e ressalva, ausência de
 * credenciais/e-mails reais nos cenários e, principalmente, que o TAMANHO da opção não entrega a resposta
 * (viés "a correta é sempre a mais longa") nem a POSIÇÃO.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRIVACY_MODULES, publicModules, publicPrivacyModules, checkAnswer } from '../server/labs/privacy.ts';
import { CIS_MODULES, CIS_VISUALS } from '../server/labs/cis.ts';
import { ISO_MODULES, ISO_VISUALS } from '../server/labs/iso.ts';
import { PRIVACY_CASES } from '../server/labs/privacyExtras.ts';
import type { PrivacyModuleDefinition } from '../server/labs/privacy.ts';

type Trail = { name: string; modules: PrivacyModuleDefinition[]; visuals?: Record<string, unknown>; needVisual: boolean };

const trails: Trail[] = [
  { name: 'lgpd', modules: PRIVACY_MODULES, needVisual: false },
  { name: 'cis', modules: CIS_MODULES, visuals: CIS_VISUALS, needVisual: true },
  { name: 'iso', modules: ISO_MODULES, visuals: ISO_VISUALS, needVisual: true },
];
try {
  const { LLM_MODULES, LLM_VISUALS } = await import('../server/labs/llm.ts');
  trails.push({ name: 'llm', modules: LLM_MODULES, visuals: LLM_VISUALS, needVisual: true });
} catch (e) {
  console.warn('trilha LLM não carregada:', (e as Error).message);
}

const scenarios = (t: Trail) => t.modules.flatMap((m) => m.scenarios.map((s) => ({ m, s })));
const SECRET = /(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|xox[bp]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY)/;
const EMAIL = /[\w.+-]+@([\w-]+\.)+[a-z]{2,}/gi;
const OK_DOMAIN = /\.(test|example|invalid)$|^(exemplo\.com\.br)$/i;

for (const t of trails) {
  test(`${t.name}: estrutura (um gabarito, ids únicos, feedback)`, () => {
    const ids = new Set<string>();
    assert.ok(t.modules.length >= 8, 'módulos suficientes');
    for (const { m, s } of scenarios(t)) {
      assert.ok(!ids.has(s.id), `id duplicado ${s.id}`); ids.add(s.id);
      assert.ok(s.id.startsWith(m.id.slice(0, 2)) || s.id.includes('-'), `id fora do padrão ${s.id}`);
      assert.ok(s.options.length >= 3 && s.options.length <= 5, `${s.id}: nº de opções`);
      assert.equal(s.options.filter((o) => o.correct).length, 1, `${s.id}: exatamente 1 correta`);
      for (const o of s.options) {
        assert.ok(o.text.trim().length > 10, `${s.id}: opção vazia`);
        assert.ok(o.feedback.trim().length > 20, `${s.id}: feedback ausente/curto`);
      }
      assert.equal(new Set(s.options.map((o) => o.text)).size, s.options.length, `${s.id}: opções repetidas`);
      assert.ok(s.situation.length > 80 && s.question.endsWith('?'), `${s.id}: situação/pergunta`);
    }
  });

  if (t.needVisual) {
    test(`${t.name}: todo cenário tem visual`, () => {
      for (const { s } of scenarios(t)) assert.ok(t.visuals?.[s.id], `${s.id}: sem visual`);
    });
  }

  test(`${t.name}: API pública não vaza gabarito e a validação responde certo`, () => {
    const pub = t.name === 'lgpd' ? publicPrivacyModules() : publicModules(t.modules, t.visuals ?? {});
    const raw = JSON.stringify(pub);
    assert.ok(!raw.includes('"correct"') && !raw.includes('"feedback"'), 'vazou correct/feedback');
    const { m, s } = scenarios(t)[0];
    const ci = s.options.findIndex((o) => o.correct);
    const wi = s.options.findIndex((o) => !o.correct);
    const right = checkAnswer(t.modules, m.id, s.id, ci);
    const wrong = checkAnswer(t.modules, m.id, s.id, wi);
    assert.ok(right.ok && right.correct, 'correta deveria acertar');
    assert.ok(wrong.ok && !wrong.correct, 'errada deveria errar');
    assert.ok(!checkAnswer(t.modules, m.id, s.id, 99).ok, 'índice inválido deve ser rejeitado');
    assert.ok(!checkAnswer(t.modules, 'zz', s.id, 0).ok, 'módulo inexistente deve ser rejeitado');
  });

  test(`${t.name}: sem credenciais reais nem e-mails/domínios reais nos cenários`, () => {
    for (const { m, s } of scenarios(t)) {
      const txt = [s.situation, s.question, ...s.options.map((o) => o.text + ' ' + o.feedback), JSON.stringify(t.visuals?.[s.id] ?? '')].join(' ');
      assert.ok(!SECRET.test(txt), `${s.id}: parece credencial real`);
      for (const e of txt.match(EMAIL) ?? []) {
        const dom = e.split('@')[1];
        assert.ok(OK_DOMAIN.test(dom), `${m.id}/${s.id}: e-mail com domínio não fictício (${e})`);
      }
    }
  });

  test(`${t.name}: o tamanho da opção NÃO entrega a resposta`, () => {
    let longest = 0, shortest = 0, sum = 0; const out: string[] = [];
    const all = scenarios(t);
    for (const { s } of all) {
      const L = s.options.map((o) => o.text.length);
      const c = s.options.findIndex((o) => o.correct);
      const others = L.filter((_, i) => i !== c);
      const r = L[c] / (others.reduce((a, b) => a + b, 0) / others.length);
      sum += r; if (L[c] === Math.max(...L)) longest++; if (L[c] === Math.min(...L)) shortest++;
      if (r > 1.45 || r < 0.65) out.push(`${s.id}(${r.toFixed(2)})`);
    }
    const n = all.length;
    assert.ok(sum / n > 0.85 && sum / n < 1.2, `razão média ${(sum / n).toFixed(2)} fora de 0,85-1,20`);
    assert.ok(longest / n <= 0.4, `correta é a mais longa em ${(100 * longest / n).toFixed(0)}% (máx. 40%)`);
    assert.ok(shortest / n >= 0.1, `correta é a mais curta em só ${(100 * shortest / n).toFixed(0)}% (mín. 10%)`);
    assert.deepEqual(out, [], `cenários com razão fora de 0,65-1,45: ${out.join(' ')}`);
  });

  test(`${t.name}: a POSIÇÃO da correta é bem distribuída`, () => {
    const all = scenarios(t);
    const pos = new Map<number, number>();
    for (const { s } of all) { const c = s.options.findIndex((o) => o.correct); pos.set(c, (pos.get(c) ?? 0) + 1); }
    for (const [p, c] of pos) assert.ok(c / all.length <= 0.45, `posição ${p} concentra ${(100 * c / all.length).toFixed(0)}% das corretas`);
  });

  test(`${t.name}: casos reais têm fonte https e ressalva`, () => {
    for (const m of t.modules) for (const c of m.cases ?? []) {
      assert.ok(c.sources.length > 0 && c.sources.every((x) => x.url.startsWith('https://')), `${c.id}: fontes`);
      assert.ok((c.caveat ?? '').length > 30, `${c.id}: sem "Limites da fonte"`);
      assert.ok(c.lessons.length >= 2 && c.happened.length > 80, `${c.id}: conteúdo curto`);
    }
  });
}

test('lgpd: casos mapeados existem', () => {
  assert.ok(Object.keys(PRIVACY_CASES).length >= 3);
});
