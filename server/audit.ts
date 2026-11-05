/**
 * Trilha de auditoria (audit log) append-only, ENCADEADA POR HASH.
 *
 * RASCUNHO para revisão humana (Segurança da Informação, Conformidade e DPO).
 * - Cada evento grava `prev` (hash do evento anterior) e `hash` = HMAC-SHA256(chave, prev + conteúdo canônico).
 *   Alterar, remover ou reordenar qualquer linha quebra a cadeia e `verify()` aponta a primeira linha inconsistente.
 * - Limite honesto: quem tem acesso ao arquivo E à chave pode refazer a cadeia inteira. Para evidência forte,
 *   exporte periodicamente o `head` (último hash) para um repositório externo imutável [definir repositório com a Conformidade].
 * - Dados pessoais: guarda e-mail/ID do ator e IP (necessários para rastreabilidade). Retenção e base legal
 *   [a definir com o DPO]; nunca registra senhas, tokens nem corpo de requisição.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export type AuditAction =
  | 'auth.login.success' | 'auth.login.failure' | 'auth.lockout' | 'auth.logout' | 'auth.session.expired'
  | 'auth.password.change' | 'auth.password.reset' | 'auth.bootstrap'
  | 'user.create' | 'user.update' | 'user.disable' | 'user.enable'
  | 'progress.link' | 'seal.issue' | 'seal.revoke' | 'data.erase.denied'
  | 'report.view' | 'report.export' | 'audit.view' | 'audit.export' | 'access.denied';

export interface AuditActor { id: string; email: string; role: string }
export interface AuditEntry {
  seq: number; ts: string; action: AuditAction; outcome: 'ok' | 'fail' | 'denied';
  actor: AuditActor | null; target?: string; ip?: string; detail?: Record<string, string | number | boolean | null>;
  prev: string; hash: string;
}
export type AuditInput = Pick<AuditEntry, 'action' | 'outcome'> & Partial<Pick<AuditEntry, 'actor' | 'target' | 'ip' | 'detail'>>;

const GENESIS = '0'.repeat(64);

/** Serialização canônica (chaves ordenadas) para o hash ser reprodutível. */
export function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o).filter((k) => o[k] !== undefined).sort((a, b) => a.localeCompare(b)).map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`).join(',')}}`;
  }
  return JSON.stringify(v) ?? 'null';
}

export function createAudit(opts: { dir: string; key: Buffer }) {
  const file = path.join(opts.dir, 'audit-log.jsonl');
  fs.mkdirSync(opts.dir, { recursive: true });
  const hashOf = (prev: string, body: Omit<AuditEntry, 'prev' | 'hash'>) =>
    crypto.createHmac('sha256', opts.key).update(prev).update('|').update(canonical(body)).digest('hex');

  const readAll = (): { entries: AuditEntry[]; badLines: number[] } => {
    let raw = '';
    try { raw = fs.readFileSync(file, 'utf8'); } catch { /* ainda não existe */ }
    const entries: AuditEntry[] = []; const badLines: number[] = [];
    raw.split('\n').forEach((line, i) => {
      if (!line.trim()) return;
      try { entries.push(JSON.parse(line)); } catch { badLines.push(i + 1); }
    });
    return { entries, badLines };
  };

  let seq = 0; let head = GENESIS;
  const init = readAll();
  if (init.entries.length) { const last = init.entries.at(-1)!; seq = last.seq; head = last.hash; }

  return {
    file,
    /** Acrescenta um evento. Nunca lança: falha de log não deve derrubar a requisição, mas é reportada no console. */
    log(input: AuditInput): AuditEntry | null {
      try {
        const body: Omit<AuditEntry, 'prev' | 'hash'> = {
          seq: seq + 1, ts: new Date().toISOString(), action: input.action, outcome: input.outcome,
          actor: input.actor ?? null, ...(input.target ? { target: input.target } : {}),
          ...(input.ip ? { ip: input.ip } : {}), ...(input.detail ? { detail: input.detail } : {}),
        };
        const entry: AuditEntry = { ...body, prev: head, hash: hashOf(head, body) };
        fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, { mode: 0o600 });
        seq = entry.seq; head = entry.hash;
        return entry;
      } catch (e) {
        console.error('[audit] FALHA ao gravar evento de auditoria:', (e as Error).message);
        return null;
      }
    },
    /** Eventos mais recentes primeiro, com filtros simples. */
    list(f: { action?: string; actorEmail?: string; from?: string; to?: string; limit?: number; offset?: number } = {}) {
      const { entries } = readAll();
      const q = f.actorEmail?.trim().toLowerCase();
      const rows = entries.filter((e) =>
        (!f.action || e.action === f.action || e.action.startsWith(`${f.action}.`)) &&
        (!q || `${e.actor?.email ?? ''} ${e.target ?? ''}`.toLowerCase().includes(q)) &&
        (!f.from || e.ts >= f.from) && (!f.to || e.ts <= f.to)).reverse();
      const offset = Math.max(0, f.offset ?? 0); const limit = Math.min(1000, Math.max(1, f.limit ?? 100));
      return { total: rows.length, entries: rows.slice(offset, offset + limit) };
    },
    all: () => readAll().entries,
    /** Recalcula a cadeia inteira. `ok=false` indica adulteração, remoção ou reordenação. */
    verify(): { ok: boolean; count: number; head: string; brokenAtSeq?: number; reason?: string } {
      const { entries, badLines } = readAll();
      if (badLines.length) return { ok: false, count: entries.length, head, reason: `linha(s) ilegível(is): ${badLines.slice(0, 5).join(', ')}` };
      let prev = GENESIS; let expectedSeq = 1;
      for (const e of entries) {
        const { prev: p, hash, ...body } = e;
        if (e.seq !== expectedSeq) return { ok: false, count: entries.length, head, brokenAtSeq: e.seq, reason: 'sequência interrompida (evento removido ou reordenado)' };
        if (p !== prev) return { ok: false, count: entries.length, head, brokenAtSeq: e.seq, reason: 'encadeamento inválido' };
        const expected = Buffer.from(hashOf(prev, body), 'hex'); const got = Buffer.from(String(hash), 'hex');
        if (expected.length !== got.length || !crypto.timingSafeEqual(expected, got)) return { ok: false, count: entries.length, head, brokenAtSeq: e.seq, reason: 'conteúdo alterado' };
        prev = hash; expectedSeq++;
      }
      return { ok: true, count: entries.length, head: prev };
    },
  };
}
export type Audit = ReturnType<typeof createAudit>;
