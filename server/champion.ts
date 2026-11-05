/**
 * Registro de progresso e emissão do selo Security Champion NO SERVIDOR.
 *
 * RASCUNHO para revisão humana (Segurança da Informação e AI Guild).
 * - O progresso só é gravado quando o servidor VALIDA a resposta/flag (o cliente não "declara" progresso).
 * - O selo é calculado aqui a partir do registro, assinado com HMAC-SHA256 e verificável por ID público.
 * - Identidade: chave pseudônima do aluno (UUID v4 gerado no navegador e enviado em `x-learner-id`). NÃO é
 *   autenticação: quem tiver a chave age como o aluno. Para vínculo com pessoa real, integrar SSO
 *   [inserir provedor SSO Opah] e trocar `learnerOf` por identidade autenticada.
 * - Dados pessoais: só o nome digitado na emissão, visível a quem tiver o ID do selo. O aluno pode remover o
 *   selo ou apagar todos os seus dados (endpoints DELETE).
 * - Persistência: arquivo JSON em `data/` (fora do git), gravação atômica. Reiniciar o processo mantém os dados.
 * - Limitação: o gabarito dos quizzes é de 3 a 4 opções; um script pode tentar todas as opções (há limite de
 *   requisições por IP). O registro reduz fraude casual, não impede quem automatiza as respostas.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { evaluate, cleanName, TIERS, type TierId, type TrackCount } from '../src/academy/championCore.js';

export const LEARNER_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const SEAL_ID_RE = /^SC-[0-9A-Z]{10}$/;
export type TrailId = 'privacy' | 'cis' | 'iso' | 'llm';
export type TrackId = TrailId | 'owasp' | 'llmlab';
export type Totals = Record<TrackId, number>;
const TRACK_ORDER: TrackId[] = ['privacy', 'cis', 'iso', 'owasp', 'llm', 'llmlab'];

interface SealRec { id: string; name: string; tier: TierId; issuedAt: string; pcts: Record<string, number>; sig: string }
interface Learner { createdAt: string; scenarios: Record<string, string>; labs: Record<string, string>; promptLabs: Record<string, string>; seal?: SealRec }
interface Db { v: 1; learners: Record<string, Learner> }

export interface PublicSeal { id: string; name: string; tier: TierId; issuedAt: string; pcts: Record<string, number> }
const toPublic = (s: SealRec): PublicSeal => ({ id: s.id, name: s.name, tier: s.tier, issuedAt: s.issuedAt, pcts: s.pcts });

const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const base32 = (buf: Buffer, len: number) => { let out = ''; for (const b of buf) out += B32[b % 32]; return out.slice(0, len); };

export interface LedgerOpts {
  dir: string; key?: Buffer; totals: () => Totals; maxLearners?: number;
  /**
   * Avaliação final OBRIGATÓRIA por trilha de conteúdo: ids dos cenários da avaliação final (sem o prefixo `trilha:`).
   * A trilha `llmlab` (Laboratório de prompts) é, por definição, a avaliação final da trilha LLM e exige 100%.
   * Sem concluir todas as avaliações finais, o selo não é emitido em nenhum nível.
   */
  finals?: () => Partial<Record<TrailId, string[]>>;
}

export function createLedger(opts: LedgerOpts) {
  const file = path.join(opts.dir, 'champion-ledger.json');
  const maxLearners = opts.maxLearners ?? 20000;
  fs.mkdirSync(opts.dir, { recursive: true });

  const key = (() => {
    if (opts.key) return opts.key;
    if (process.env.CHAMPION_SIGNING_KEY) return crypto.createHash('sha256').update(process.env.CHAMPION_SIGNING_KEY).digest();
    const kf = path.join(opts.dir, '.signing-key');
    try { return Buffer.from(fs.readFileSync(kf, 'utf8').trim(), 'hex'); } catch { /* gera abaixo */ }
    const k = crypto.randomBytes(32);
    fs.writeFileSync(kf, k.toString('hex'), { mode: 0o600 });
    return k;
  })();

  let db: Db = { v: 1, learners: {} };
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (raw && raw.v === 1 && typeof raw.learners === 'object') db = raw;
  } catch { /* arquivo ausente ou inválido: começa vazio */ }

  let timer: NodeJS.Timeout | null = null;
  const flush = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db));
    fs.renameSync(tmp, file);
  };
  const dirty = () => { if (!timer) { timer = setTimeout(flush, 400); timer.unref?.(); } };

  const hmac = (s: string) => crypto.createHmac('sha256', key).update(s).digest();
  const sigOf = (r: Omit<SealRec, 'sig'>) =>
    hmac(`${r.id}|${r.name}|${r.tier}|${r.issuedAt}|${Object.keys(r.pcts).sort().map((k) => `${k}=${r.pcts[k]}`).join(',')}`).toString('hex');
  const idOf = (lid: string, tier: TierId) => `SC-${base32(hmac(`id|${lid}|${tier}`), 10)}`;

  const sealIndex = new Map<string, string>();
  for (const [lid, l] of Object.entries(db.learners)) if (l.seal) sealIndex.set(l.seal.id, lid);

  const learner = (lid: string, create: boolean): Learner | null => {
    let l = db.learners[lid];
    if (!l && create) {
      if (Object.keys(db.learners).length >= maxLearners) return null;
      l = db.learners[lid] = { createdAt: new Date().toISOString(), scenarios: {}, labs: {}, promptLabs: {} };
    }
    return l ?? null;
  };

  const counts = (l: Learner | null): TrackCount[] => {
    const t = opts.totals();
    const n = (rec: Record<string, string> | undefined, prefix?: string) =>
      rec ? Object.keys(rec).filter((k) => (prefix ? k.startsWith(prefix) : true)).length : 0;
    return TRACK_ORDER.map((id) => {
      let done = 0;
      if (l) {
        if (id === 'owasp') done = n(l.labs);
        else if (id === 'llmlab') done = n(l.promptLabs);
        else done = n(l.scenarios, `${id}:`);
      }
      const base: TrackCount = { id, done: Math.min(done, t[id]), total: t[id] };
      if (id === 'llmlab') return { ...base, final: { done: base.done, total: base.total } };
      const ids = id === 'owasp' ? undefined : opts.finals?.()[id as TrailId];
      if (ids && ids.length) {
        const got = l ? ids.filter((sid) => l.scenarios[`${id}:${sid}`]).length : 0;
        return { ...base, final: { done: got, total: ids.length } };
      }
      return base;
    });
  };

  return {
    LEARNER_RE,
    /** Registra um cenário respondido corretamente (chamado SÓ depois de o servidor validar a resposta). */
    recordScenario(lid: string, trail: TrailId, scenarioId: string, at = new Date().toISOString()): boolean {
      const l = learner(lid, true); if (!l) return false;
      const k = `${trail}:${scenarioId}`;
      if (!l.scenarios[k]) { l.scenarios[k] = at; dirty(); }
      return true;
    },
    recordLab(lid: string, labId: string, at = new Date().toISOString()): boolean {
      const l = learner(lid, true); if (!l) return false;
      if (!l.labs[labId]) { l.labs[labId] = at; dirty(); }
      return true;
    },
    recordPromptLab(lid: string, labId: string, at = new Date().toISOString()): boolean {
      const l = learner(lid, true); if (!l) return false;
      if (!l.promptLabs[labId]) { l.promptLabs[labId] = at; dirty(); }
      return true;
    },
    me(lid: string) {
      const l = learner(lid, false);
      return { tracks: counts(l), seal: l?.seal ? toPublic(l.seal) : null };
    },
    /** Há registro para esta chave? (usado para vincular o progresso anônimo a uma conta). */
    has(lid: string): boolean { return Boolean(db.learners[lid]); },
    /** Registro de progresso com datas de conclusão (base do relatório e da hidratação do navegador). Somente leitura. */
    detail(lid: string) {
      const l = learner(lid, false);
      return {
        scenarios: { ...(l?.scenarios ?? {}) }, labs: { ...(l?.labs ?? {}) }, promptLabs: { ...(l?.promptLabs ?? {}) },
        createdAt: l?.createdAt ?? null,
      };
    },
    /** Contagens por trilha + avaliação (mesma regra do selo) para uma chave, sem criar registro. */
    status(lid: string) { return evaluate(counts(learner(lid, false))); },
    issue(lid: string, rawName: unknown): { ok: true; seal: PublicSeal } | { ok: false; error: string } {
      const name = typeof rawName === 'string' ? cleanName(rawName) : '';
      if (name.length < 2) return { ok: false, error: 'nome inválido (mínimo de 2 caracteres)' };
      const l = learner(lid, false);
      const status = evaluate(counts(l));
      if (!l || !status.tier) {
        return { ok: false, error: status.pendingFinals.length
          ? `conclua as avaliações finais obrigatórias: ${status.pendingFinals.join(', ')}`
          : 'trilhas incompletas para o nível mínimo' };
      }
      const prev = l.seal;
      const id = idOf(lid, status.tier.id);
      const issuedAt = prev && prev.id === id ? prev.issuedAt : new Date().toISOString();
      const base = { id, name, tier: status.tier.id, issuedAt, pcts: Object.fromEntries(status.tracks.map((t) => [t.id, t.pct])) };
      if (prev) sealIndex.delete(prev.id);
      l.seal = { ...base, sig: sigOf(base) };
      sealIndex.set(id, lid);
      flush();
      return { ok: true, seal: toPublic(l.seal) };
    },
    /** Verificação pública por ID. Recalcula a assinatura para detectar adulteração do arquivo. */
    verify(id: unknown): PublicSeal | null {
      if (typeof id !== 'string' || !SEAL_ID_RE.test(id)) return null;
      const lid = sealIndex.get(id);
      const s = lid ? db.learners[lid]?.seal : undefined;
      if (!s) return null;
      const { sig, ...rest } = s;
      const expected = Buffer.from(sigOf(rest), 'hex');
      const got = Buffer.from(sig, 'hex');
      if (expected.length !== got.length || !crypto.timingSafeEqual(expected, got)) return null;
      return toPublic(s);
    },
    revokeSeal(lid: string): boolean {
      const l = learner(lid, false);
      if (!l?.seal) return false;
      sealIndex.delete(l.seal.id); delete l.seal; flush(); return true;
    },
    erase(lid: string): boolean {
      const l = learner(lid, false);
      if (!l) return false;
      if (l.seal) sealIndex.delete(l.seal.id);
      delete db.learners[lid]; flush(); return true;
    },
    /** Chave de assinatura derivada por finalidade (selos, relatórios e trilha de auditoria não compartilham o mesmo uso da chave). */
    derive(purpose: string): Buffer { return hmac(`derive|${purpose}`); },
    flush,
    tiers: TIERS,
  };
}
export type Ledger = ReturnType<typeof createLedger>;
