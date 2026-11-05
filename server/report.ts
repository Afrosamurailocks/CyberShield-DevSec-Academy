/**
 * Relatório de desempenho / evidência de conformidade do treinamento.
 *
 * RASCUNHO para revisão humana: a Conformidade/DPO deve validar critérios, retenção e uso como evidência antes de
 * apresentá-lo a um auditor. Os números vêm SOMENTE do registro validado pelo servidor (ledger); nada é declarado pelo cliente.
 * - Escopo por perfil: administrador e auditor veem tudo; gestor vê a própria equipe; aluno vê só a si.
 * - JSON assinado: HMAC-SHA256 sobre o conteúdo canônico (+ SHA-256 do conteúdo). `verifyReport` refaz o cálculo.
 * - Excel (.xlsx): planilha formatada (server/reportXlsx.ts), com o id e o SHA-256 do relatório assinado.
 * Limites: o registro guarda apenas ACERTOS validados e suas datas (não há tentativas/erros nem tempo de estudo); "desempenho"
 * aqui significa conclusão, avaliações finais e nível Security Champion. A assinatura prova integridade desde a geração
 * (não prova que a política de treinamento atende a uma norma específica).
 */
import crypto from 'node:crypto';
import { canonical } from './audit.js';
import type { UserRec, Role } from './auth.js';
import type { Ledger } from './champion.js';
import { TIERS } from '../src/academy/championCore.js';

export const TRACKS = ['privacy', 'cis', 'iso', 'owasp', 'llm', 'llmlab'] as const;
export const TRACK_LABEL: Record<string, string> = {
  privacy: 'LGPD / Privacidade', cis: 'CIS Controls v8.1', iso: 'ISO/IEC 27001', owasp: 'OWASP Top 10:2025 (labs)', llm: 'LLM Top 10 (trilha)', llmlab: 'Laboratório de prompts (avaliação final LLM)',
};
/** Ficha básica de cada treinamento (trilha): o que é, referência, formato, tamanho e como é avaliado. */
export interface TrainingInfo {
  id: string; title: string; reference: string; description: string; audience: string; format: string;
  modules: number | null; items: number; itemUnit: string; points: number | null;
  finalEvaluation: string; sourceNote: string;
}
/** Dados dinâmicos (contagens reais do conteúdo) que o servidor informa; o resto da ficha é texto estático abaixo. */
export interface TrainingFacts { modules?: number; points?: number; finalItems?: number }
const CATALOG: Record<string, Omit<TrainingInfo, 'id' | 'modules' | 'items' | 'points' | 'finalEvaluation'> & { final: (n?: number) => string }> = {
  privacy: {
    title: 'LGPD / Privacidade', reference: 'LGPD (Lei nº 13.709/2018)', audience: 'Todos os colaboradores', format: 'Módulos com caso real e cenários de decisão (resposta validada no servidor)', itemUnit: 'cenários',
    description: 'Privacidade e proteção de dados pessoais aplicadas ao dia a dia, em cenários práticos.',
    final: (n) => `Sim — avaliação final obrigatória${n ? ` (${n} cenários)` : ''}`,
    sourceNote: 'Conteúdo educativo, não é parecer jurídico; exige revisão de Privacidade/Jurídico.',
  },
  cis: {
    title: 'CIS Controls v8.1', reference: 'CIS Critical Security Controls v8.1', audience: '[definir público-alvo]', format: 'Um módulo por controle, com caso real e cenários de decisão (resposta validada no servidor)', itemUnit: 'cenários',
    description: 'Os 18 controles de segurança do CIS, com caso real, salvaguardas-chave e cenários; avaliação final integrada que cruza controles.',
    final: (n) => `Sim — avaliação final integrada${n ? ` (${n} cenários)` : ''}`,
    sourceNote: 'As salvaguardas exibidas são seleção editorial; conferir no CIS Controls Navigator.',
  },
  iso: {
    title: 'ISO/IEC 27001', reference: 'ISO/IEC 27001:2022', audience: '[definir público-alvo]', format: 'Módulos com caso real e cenários de decisão (resposta validada no servidor)', itemUnit: 'cenários',
    description: 'Preparação para a certificação: cláusulas 4 a 10, os quatro temas do Anexo A e avaliação final em formato de auditoria.',
    final: (n) => `Sim — avaliação final em formato de auditoria${n ? ` (${n} cenários)` : ''}`,
    sourceNote: 'Paráfrase didática (a norma é paga); numeração de requisitos e controles é seleção editorial — conferir na edição oficial.',
  },
  owasp: {
    title: 'OWASP Top 10:2025 (laboratórios)', reference: 'OWASP Top 10:2025', audience: 'Desenvolvedores', format: 'Laboratórios práticos encadeados; conclui ao capturar a flag (validada no servidor)', itemUnit: 'laboratórios',
    description: 'Pentest black-box encadeado em empresa fictícia: o aluno explora a falha, entende a causa-raiz e vê a correção em código seguro.',
    final: () => 'Não há avaliação final obrigatória',
    sourceNote: 'Os identificadores internos dos laboratórios não acompanham a numeração 2025; a categoria exibida segue a edição 2025.',
  },
  llm: {
    title: 'LLM Top 10 (trilha)', reference: 'OWASP Top 10 for LLM Applications 2025', audience: '[definir público-alvo]', format: 'Módulos LLM01 a LLM10 com cenários (inclui conversas multi-turn); resposta validada no servidor', itemUnit: 'cenários',
    description: 'Riscos de segurança em aplicações com modelos de linguagem, uma categoria por módulo.',
    final: () => 'A avaliação final é o Laboratório de prompts (item abaixo)',
    sourceNote: 'Nomes em português das categorias são tradução editorial; conferir em genai.owasp.org.',
  },
  llmlab: {
    title: 'Laboratório de prompts (avaliação final LLM)', reference: 'OWASP Top 10 for LLM Applications 2025', audience: '[definir público-alvo]', format: 'Assistentes simulados; uma flag por categoria (validada no servidor)', itemUnit: 'assistentes',
    description: 'Prática de ataque e defesa contra assistentes de IA simulados; é a avaliação final da trilha LLM.',
    final: () => 'Sim — é a avaliação final obrigatória da trilha LLM',
    sourceNote: 'Os assistentes são simulados no próprio laboratório; uma flag por categoria da lista LLM.',
  },
};
export const SITUATIONS = ['Aprovado', 'Final pendente', 'Em andamento', 'Não iniciado'] as const;
export type Situation = typeof SITUATIONS[number];

export interface Actor { id: string; email: string; role: Role }
export interface ReportFilters { team?: string; situation?: string; q?: string }
export interface TrackCell { done: number; total: number; pct: number; last: string | null; finalPending: boolean }
export interface ReportRow {
  userId: string; name: string; email: string; role: Role; team: string; manager: string; status: 'active' | 'disabled';
  situation: Situation; tier: string; overallPct: number; pendingFinals: string[];
  firstActivity: string | null; lastActivity: string | null; lastLogin: string | null; createdAt: string;
  sealId: string | null; sealIssuedAt: string | null; tracks: Record<string, TrackCell>;
}
export interface ReportDoc {
  meta: {
    reportId: string; schema: 'cybershield.compliance-report/1'; generatedAt: string; generatedBy: Actor; scope: 'organization' | 'team' | 'self';
    filters: ReportFilters; trackTotals: Record<string, number>; trainings: TrainingInfo[];
    criteria: { tiers: { id: string; label: string; minPctPerTrack: number }[]; mandatoryFinals: string[]; situations: Record<string, string> };
    notes: string[];
  };
  summary: {
    users: number; byStatus: Record<string, number>; bySituation: Record<Situation, number>; approvalRatePct: number; averageOverallPct: number;
    neverLoggedIn: number; disabled: number; byTier: Record<string, number>;
    byTrack: Record<string, { averagePct: number; completed: number }>;
    byTeam: { team: string; users: number; approved: number; approvalRatePct: number; averageOverallPct: number }[];
  };
  rows: ReportRow[];
  integrity?: { algorithm: 'HMAC-SHA256'; contentSha256: string; signature: string };
}

const max = (a: (string | null)[]) => a.filter(Boolean).sort().at(-1) ?? null;
const min = (a: (string | null)[]) => a.filter(Boolean).sort()[0] ?? null;
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function scopeOf(actor: Actor, all: UserRec[]): { scope: ReportDoc['meta']['scope']; users: UserRec[] } {
  if (actor.role === 'admin' || actor.role === 'auditor') return { scope: 'organization', users: all };
  if (actor.role === 'manager') return { scope: 'team', users: all.filter((u) => u.managerId === actor.id || u.id === actor.id) };
  return { scope: 'self', users: all.filter((u) => u.id === actor.id) };
}

export interface ReportDeps { ledger: Ledger; users: () => UserRec[]; totals: () => Record<string, number>; finals: () => string[]; facts?: () => Record<string, TrainingFacts>; now?: () => Date }

export function createReports(deps: ReportDeps) {
  const key = deps.ledger.derive('report-v1');
  const sign = (body: unknown) => {
    const c = canonical(body);
    return { contentSha256: crypto.createHash('sha256').update(c).digest('hex'), signature: crypto.createHmac('sha256', key).update(c).digest('hex') };
  };

  function rowOf(u: UserRec, byId: Map<string, UserRec>): ReportRow {
    const d = deps.ledger.detail(u.learnerId);
    const st = deps.ledger.status(u.learnerId);
    const seal = deps.ledger.me(u.learnerId).seal;
    const stamps: Record<string, string[]> = Object.fromEntries(TRACKS.map((t) => [t, [] as string[]]));
    for (const [k, at] of Object.entries(d.scenarios)) stamps[k.split(':')[0]]?.push(at);
    stamps.owasp.push(...Object.values(d.labs)); stamps.llmlab.push(...Object.values(d.promptLabs));
    const tracks: Record<string, TrackCell> = {};
    for (const t of st.tracks) tracks[t.id] = { done: t.done, total: t.total, pct: t.pct, last: max(stamps[t.id] ?? []), finalPending: t.finalPending };
    const all = Object.values(stamps).flat();
    const anyDone = st.tracks.some((t) => t.done > 0);
    const bronzePct = st.tracks.length > 0 && st.floor >= TIERS[0].min;
    const situation: Situation = st.tier ? 'Aprovado' : !anyDone ? 'Não iniciado' : bronzePct && st.pendingFinals.length ? 'Final pendente' : 'Em andamento';
    return {
      userId: u.id, name: u.name, email: u.email, role: u.role, team: u.team, manager: u.managerId ? byId.get(u.managerId)?.name ?? '' : '', status: u.status,
      situation, tier: st.tier?.label ?? '', overallPct: st.overall, pendingFinals: st.pendingFinals,
      firstActivity: min(all), lastActivity: max(all), lastLogin: u.lastLoginAt, createdAt: u.createdAt,
      sealId: seal?.id ?? null, sealIssuedAt: seal?.issuedAt ?? null, tracks,
    };
  }

  return {
    build(actor: Actor, filters: ReportFilters = {}): ReportDoc {
      const all = deps.users(); const byId = new Map(all.map((u) => [u.id, u]));
      const { scope, users } = scopeOf(actor, all);
      const q = filters.q?.trim().toLowerCase();
      let rows = users.map((u) => rowOf(u, byId));
      if (filters.team) rows = rows.filter((r) => r.team === filters.team);
      if (filters.situation) rows = rows.filter((r) => r.situation === filters.situation);
      if (q) rows = rows.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(q));
      rows.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      const n = rows.length; const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : 0);
      const bySituation = Object.fromEntries(SITUATIONS.map((s) => [s, rows.filter((r) => r.situation === s).length])) as Record<Situation, number>;
      const teams = [...new Set(rows.map((r) => r.team || '(sem equipe)'))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
      const generatedAt = (deps.now?.() ?? new Date()).toISOString();
      const finals = deps.finals();
      const totals = deps.totals(); const facts = deps.facts?.() ?? {};
      const trainings: TrainingInfo[] = TRACKS.map((id) => {
        const { final, ...c } = CATALOG[id]; const fa = facts[id] ?? {};
        return { id, ...c, modules: fa.modules ?? null, items: totals[id] ?? 0, points: fa.points ?? null, finalEvaluation: final(fa.finalItems) };
      });
      const doc: ReportDoc = {
        meta: {
          reportId: '', schema: 'cybershield.compliance-report/1', generatedAt, generatedBy: { id: actor.id, email: actor.email, role: actor.role }, scope,
          filters: { ...(filters.team ? { team: filters.team } : {}), ...(filters.situation ? { situation: filters.situation } : {}), ...(q ? { q } : {}) },
          trackTotals: totals, trainings,
          criteria: {
            tiers: TIERS.map((t) => ({ id: t.id, label: t.label, minPctPerTrack: t.min })), mandatoryFinals: finals,
            situations: {
              Aprovado: 'Atingiu ao menos o nível Bronze em TODAS as trilhas e concluiu todas as avaliações finais obrigatórias.',
              'Final pendente': 'Atingiu o percentual mínimo do Bronze em todas as trilhas, mas falta ao menos uma avaliação final obrigatória.',
              'Em andamento': 'Concluiu ao menos um item e ainda não atende aos critérios de aprovação.',
              'Não iniciado': 'Nenhum item concluído e validado.',
            },
          },
          notes: [
            'RASCUNHO para revisão humana: validar critérios, retenção e uso como evidência com a Conformidade e o DPO antes de apresentá-lo a auditoria.',
            'Os dados vêm do registro validado no servidor. Só acertos são registrados; tentativas, erros e tempo de estudo não constam.',
            'Contém dados pessoais (nome e e-mail). Compartilhe apenas com quem tem necessidade e base legal [definir com o DPO].',
            'A assinatura comprova integridade desde a geração; não comprova, por si, aderência a uma norma específica.',
          ],
        },
        summary: {
          users: n, byStatus: { active: rows.filter((r) => r.status === 'active').length, disabled: rows.filter((r) => r.status === 'disabled').length },
          bySituation, approvalRatePct: n ? Math.round((bySituation.Aprovado / n) * 100) : 0, averageOverallPct: avg(rows.map((r) => r.overallPct)),
          neverLoggedIn: rows.filter((r) => !r.lastLogin).length, disabled: rows.filter((r) => r.status === 'disabled').length,
          byTier: Object.fromEntries(TIERS.map((t) => [t.label, rows.filter((r) => r.tier === t.label).length])),
          byTrack: Object.fromEntries(TRACKS.map((t) => [t, { averagePct: avg(rows.map((r) => r.tracks[t]?.pct ?? 0)), completed: rows.filter((r) => (r.tracks[t]?.pct ?? 0) >= 100).length }])),
          byTeam: teams.map((t) => {
            const g = rows.filter((r) => (r.team || '(sem equipe)') === t); const ap = g.filter((r) => r.situation === 'Aprovado').length;
            return { team: t, users: g.length, approved: ap, approvalRatePct: g.length ? Math.round((ap / g.length) * 100) : 0, averageOverallPct: avg(g.map((r) => r.overallPct)) };
          }),
        },
        rows,
      };
      const { contentSha256, signature } = sign({ meta: { ...doc.meta, reportId: undefined }, summary: doc.summary, rows: doc.rows });
      const stamp = generatedAt.slice(0, 10).replaceAll('-', '');
      const id = [...Buffer.from(contentSha256, 'hex').subarray(0, 6)].map((b) => B32[b % 32]).join('');
      doc.meta.reportId = `RPT-${stamp}-${id}`;
      doc.integrity = { algorithm: 'HMAC-SHA256', contentSha256, signature };
      return doc;
    },

    /** Reconfere um relatório JSON exportado: recalcula hash e assinatura sobre o conteúdo recebido. */
    verify(doc: unknown): { valid: boolean; reportId?: string; generatedAt?: string; generatedBy?: string; reason?: string } {
      const d = doc as Partial<ReportDoc> | null;
      if (!d || typeof d !== 'object' || !d.meta || !d.summary || !Array.isArray(d.rows) || !d.integrity) return { valid: false, reason: 'estrutura inválida' };
      const { contentSha256, signature } = sign({ meta: { ...d.meta, reportId: undefined }, summary: d.summary, rows: d.rows });
      const a = Buffer.from(signature, 'hex'); const b = Buffer.from(String(d.integrity.signature), 'hex');
      const ok = a.length === b.length && crypto.timingSafeEqual(a, b) && contentSha256 === d.integrity.contentSha256;
      const stamp = String(d.meta.generatedAt ?? '').slice(0, 10).replaceAll('-', '');
      const id = [...Buffer.from(contentSha256, 'hex').subarray(0, 6)].map((x) => B32[x % 32]).join('');
      if (ok && d.meta.reportId !== `RPT-${stamp}-${id}`) return { valid: false, reason: 'identificador do relatório inconsistente' };
      return ok
        ? { valid: true, reportId: d.meta.reportId, generatedAt: d.meta.generatedAt, generatedBy: d.meta.generatedBy?.email }
        : { valid: false, reason: 'o conteúdo foi alterado após a geração (assinatura não confere)' };
    },
  };
}
export type Reports = ReturnType<typeof createReports>;

/** Neutraliza CSV/formula injection (=, +, -, @, tab, CR) e escapa aspas/separador. */
export function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export const SHORT: Record<string, string> = { privacy: 'LGPD', cis: 'CIS v8.1', iso: 'ISO 27001', owasp: 'OWASP 2025', llm: 'LLM', llmlab: 'Lab. de prompts (final)' };
