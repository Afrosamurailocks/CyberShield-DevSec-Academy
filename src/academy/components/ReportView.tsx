import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Printer, FileJson, FileSpreadsheet, ShieldCheck, ShieldAlert, ChevronRight, ChevronDown, Search, RefreshCw, AlertTriangle, Info, CheckCircle2, Clock, CircleDashed, Hourglass } from 'lucide-react';
import { fetchReport, exportReport, verifyReport, type ReportDoc, type ReportRow } from '../auth';
import { useSession } from './AuthGate';

export const TRACK_LABEL: Record<string, string> = {
  privacy: 'LGPD', cis: 'CIS v8.1', iso: 'ISO 27001', owasp: 'OWASP 2025', llm: 'LLM', llmlab: 'Lab. prompts (final)',
};
const TRACK_ORDER = ['privacy', 'cis', 'iso', 'owasp', 'llm', 'llmlab'];
const SIT = {
  Aprovado: { cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', icon: CheckCircle2 },
  'Final pendente': { cls: 'border-amber-400/40 bg-amber-400/10 text-amber-300', icon: Hourglass },
  'Em andamento': { cls: 'border-sky-400/40 bg-sky-400/10 text-sky-300', icon: Clock },
  'Não iniciado': { cls: 'border-slate-500/40 bg-slate-500/10 text-slate-300', icon: CircleDashed },
} as const;
const SCOPE: Record<string, string> = { organization: 'Toda a organização', team: 'Minha equipe', self: 'Somente eu' };

export const fmtDate = (s: string | null | undefined) => (s ? new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—');
const fmtDay = (s: string | null | undefined) => (s ? new Date(s).toLocaleDateString('pt-BR') : '—');

export function SituationBadge({ s }: Readonly<{ s: ReportRow['situation'] }>) {
  const { cls, icon: Icon } = SIT[s];
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}><Icon size={12} aria-hidden="true" />{s}</span>;
}
function Bar({ pct, label }: Readonly<{ pct: number; label: string }>) {
  return (
    <div className="flex items-center gap-2" role="img" aria-label={`${label}: ${pct}%`}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-line)]"><div className={`h-full ${pct >= 100 ? 'bg-[var(--color-defense)]' : 'bg-[var(--color-offense)]'}`} style={{ width: `${pct}%` }} /></div>
      <span className="w-9 text-right font-mono text-xs text-slate-300">{pct}%</span>
    </div>
  );
}
function Kpi({ label, value, hint, tone }: Readonly<{ label: string; value: string | number; hint?: string; tone?: string }>) {
  return (
    <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${tone ?? 'text-slate-100'}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

const ctl = 'min-h-10 rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-3 text-sm text-slate-100 focus:border-[var(--color-offense)] focus:outline-none focus:ring-1 focus:ring-[var(--color-offense)]';
const btn = 'inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--color-line)] px-3 text-sm font-medium text-slate-200 transition-colors hover:bg-[var(--color-surface-2)] disabled:opacity-50';

export function ReportView() {
  const { user } = useSession();
  const [doc, setDoc] = useState<ReportDoc | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(''); const [team, setTeam] = useState(''); const [situation, setSituation] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; t: string } | null>(null);
  const [printing, setPrinting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const filters = useMemo(() => ({ q: q.trim() || undefined, team: team || undefined, situation: situation || undefined }), [q, team, situation]);

  const load = useCallback(() => {
    setLoading(true); setErr(null);
    fetchReport(filters).then(setDoc).catch((e) => setErr(e instanceof Error ? e.message : 'Falha ao carregar o relatório.')).finally(() => setLoading(false));
  }, [filters]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);
  // equipes disponíveis independem do filtro de equipe aplicado
  const [teams, setTeams] = useState<string[]>([]);
  useEffect(() => { if (doc && !team && !situation && !q) setTeams(doc.summary.byTeam.map((t) => t.team).filter((t) => t !== '(sem equipe)')); }, [doc, team, situation, q]);

  const doExport = async (format: 'xlsx' | 'json') => {
    setBusy(format); setNote(null);
    try { const name = await exportReport(format, filters); setNote({ ok: true, t: `Arquivo gerado: ${name}. A exportação foi registrada na trilha de auditoria.` }); }
    catch (e) { setNote({ ok: false, t: e instanceof Error ? e.message : 'Falha ao exportar.' }); }
    finally { setBusy(null); }
  };
  const doPrint = () => {
    setPrinting(true);
    document.body.classList.add('report-print');
    const done = () => { document.body.classList.remove('report-print'); setPrinting(false); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 50);
  };
  const doVerify = async (f: File | undefined) => {
    if (!f) return; setBusy('verify'); setNote(null);
    try {
      if (f.size > 250_000) throw new Error('Arquivo grande demais para verificação (limite de 250 KB).');
      const r = await verifyReport(JSON.parse(await f.text()));
      setNote(r.valid ? { ok: true, t: `Íntegro: ${r.reportId}, gerado em ${fmtDate(r.generatedAt)} por ${r.generatedBy}. O conteúdo confere com a assinatura do servidor.` }
        : { ok: false, t: `NÃO confere: ${r.reason ?? 'assinatura inválida'}.` });
    } catch (e) { setNote({ ok: false, t: e instanceof SyntaxError ? 'O arquivo não é um JSON válido.' : (e instanceof Error ? e.message : 'Falha ao verificar.') }); }
    finally { setBusy(null); if (fileRef.current) fileRef.current.value = ''; }
  };

  if (!doc && loading) return <div className="flex items-center justify-center gap-2 py-24 text-slate-400"><Loader2 className="animate-spin" aria-hidden="true" /> Gerando relatório…</div>;
  if (!doc) return <div role="alert" className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-center text-rose-200"><AlertTriangle className="mx-auto mb-2" aria-hidden="true" />{err ?? 'Relatório indisponível.'}</div>;
  const s = doc.summary; const isSelf = doc.meta.scope === 'self';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-line)] pb-5">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold">{isSelf ? 'Meu desempenho' : 'Relatório de desempenho'}</h2>
          <p className="mt-1.5 max-w-3xl text-[15px] leading-relaxed text-slate-400">
            Conclusão do treinamento por pessoa e por trilha, com base no registro validado pelo servidor. Escopo: <strong className="font-semibold text-slate-200">{SCOPE[doc.meta.scope]}</strong>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Exportação do relatório">
          <button className={`${btn} !border-[var(--color-offense)]/60 !bg-[var(--color-offense)]/10`} onClick={() => doExport('xlsx')} disabled={busy !== null}>{busy === 'xlsx' ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <FileSpreadsheet size={15} aria-hidden="true" />} Excel</button>
          <button className={btn} onClick={() => doExport('json')} disabled={busy !== null}>{busy === 'json' ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <FileJson size={15} aria-hidden="true" />} JSON assinado</button>
          <button className={btn} onClick={doPrint} disabled={busy !== null}><Printer size={15} aria-hidden="true" /> Imprimir / PDF</button>
        </div>
      </header>

      <p className="flex max-w-4xl gap-2 border-l-2 border-amber-400/70 bg-[var(--color-surface)] px-3 py-2 text-xs leading-relaxed text-slate-400">
        <Info size={14} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <span><strong className="font-semibold text-slate-200">Rascunho para revisão humana.</strong> Valide critérios, retenção e uso como evidência com a Conformidade e o DPO antes de apresentar a uma auditoria. Só acertos validados são registrados (não há tentativas, erros ou tempo de estudo). Contém dados pessoais: compartilhe só com quem precisa.</span>
      </p>

      {note && <p role={note.ok ? 'status' : 'alert'} className={`rounded-md border px-3 py-2 text-sm ${note.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'}`}>{note.t}</p>}

      <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label={isSelf ? 'Situação' : 'Pessoas'} value={isSelf ? doc.rows[0]?.situation ?? '—' : s.users} hint={isSelf ? undefined : `${s.byStatus.active ?? 0} ativas · ${s.disabled} desativadas`} />
        <Kpi label="Aprovados" value={s.bySituation.Aprovado} hint={`${s.approvalRatePct}% do escopo`} tone="text-[var(--color-defense)]" />
        <Kpi label="Final pendente" value={s.bySituation['Final pendente']} hint="avaliação obrigatória" tone="text-amber-300" />
        <Kpi label="Em andamento" value={s.bySituation['Em andamento']} tone="text-sky-300" />
        <Kpi label="Não iniciado" value={s.bySituation['Não iniciado']} hint={`${s.neverLoggedIn} nunca acessaram`} />
        <Kpi label="Média geral" value={`${s.averageOverallPct}%`} hint="média das 6 trilhas" />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="by-track" className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
          <h3 id="by-track" className="border-b border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold">Conclusão média por trilha</h3>
          <table className="w-full text-sm"><caption className="sr-only">Percentual médio e quantidade de pessoas com a trilha concluída</caption>
            <thead><tr className="text-left text-[11px] uppercase tracking-wide text-slate-500"><th scope="col" className="px-4 py-2 font-semibold">Trilha</th><th scope="col" className="px-2 py-2 font-semibold">Média</th><th scope="col" className="px-4 py-2 text-right font-semibold">100%</th></tr></thead>
            <tbody>{TRACK_ORDER.map((t) => (
              <tr key={t} className="border-t border-[var(--color-line-soft)]"><th scope="row" className="px-4 py-2 text-left font-normal text-slate-200">{doc.meta.criteria.mandatoryFinals.includes(t) && t === 'llmlab' ? 'Lab. de prompts (avaliação final LLM)' : TRACK_LABEL[t]}<span className="ml-1 text-xs text-slate-500">({doc.meta.trackTotals[t]} itens)</span></th>
                <td className="px-2 py-2"><Bar pct={s.byTrack[t]?.averagePct ?? 0} label={TRACK_LABEL[t]} /></td><td className="px-4 py-2 text-right font-mono text-xs text-slate-300">{s.byTrack[t]?.completed ?? 0}</td></tr>))}</tbody></table>
        </section>
        <section aria-labelledby="by-team" className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
          <h3 id="by-team" className="border-b border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold">Por equipe</h3>
          <div className="max-h-72 overflow-auto"><table className="w-full text-sm"><caption className="sr-only">Pessoas, aprovados e média geral por equipe</caption>
            <thead><tr className="text-left text-[11px] uppercase tracking-wide text-slate-500"><th scope="col" className="px-4 py-2 font-semibold">Equipe</th><th scope="col" className="px-2 py-2 text-right font-semibold">Pessoas</th><th scope="col" className="px-2 py-2 text-right font-semibold">Aprovados</th><th scope="col" className="px-4 py-2 font-semibold">Média</th></tr></thead>
            <tbody>{s.byTeam.length === 0 && <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-500">Sem dados.</td></tr>}
              {s.byTeam.map((t) => (<tr key={t.team} className="border-t border-[var(--color-line-soft)]"><th scope="row" className="px-4 py-2 text-left font-normal text-slate-200">{t.team}</th>
                <td className="px-2 py-2 text-right font-mono text-xs">{t.users}</td><td className="px-2 py-2 text-right font-mono text-xs">{t.approved} <span className="text-slate-500">({t.approvalRatePct}%)</span></td><td className="px-4 py-2"><Bar pct={t.averageOverallPct} label={`Média de ${t.team}`} /></td></tr>))}</tbody></table></div>
        </section>
      </div>

      <section aria-labelledby="trainings" className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
        <h3 id="trainings" className="border-b border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold">Treinamentos avaliados <span className="font-normal text-slate-500">({doc.meta.trainings?.length ?? 0})</span></h3>
        <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-sm"><caption className="sr-only">Ficha básica de cada treinamento: referência, formato, tamanho e avaliação final</caption>
          <thead><tr className="text-left text-[11px] uppercase tracking-wide text-slate-500"><th scope="col" className="px-4 py-2 font-semibold">Treinamento</th><th scope="col" className="px-2 py-2 font-semibold">Referência e formato</th><th scope="col" className="px-2 py-2 text-right font-semibold">Módulos</th><th scope="col" className="px-2 py-2 text-right font-semibold">Itens</th><th scope="col" className="px-2 py-2 font-semibold">Avaliação final</th><th scope="col" className="px-4 py-2 font-semibold">Média</th></tr></thead>
          <tbody>{(doc.meta.trainings ?? []).map((t) => (
            <tr key={t.id} className="border-t border-[var(--color-line-soft)] align-top">
              <th scope="row" className="px-4 py-2.5 text-left font-normal"><span className="font-semibold text-slate-100">{t.title}</span><span className="mt-0.5 block max-w-xs text-xs text-slate-400">{t.description}</span><span className="mt-0.5 block text-[11px] text-slate-500">Público: {t.audience}</span></th>
              <td className="px-2 py-2.5 text-xs text-slate-300"><span className="block text-slate-200">{t.reference}</span><span className="block text-slate-400">{t.format}</span><span className="mt-0.5 block text-[11px] text-slate-500">{t.sourceNote}</span></td>
              <td className="px-2 py-2.5 text-right font-mono text-xs">{t.modules ?? '—'}</td>
              <td className="px-2 py-2.5 text-right font-mono text-xs">{t.items} <span className="font-sans text-slate-500">{t.itemUnit}</span>{t.points != null && <span className="block font-sans text-[11px] text-slate-500">{t.points} pts</span>}</td>
              <td className="px-2 py-2.5 text-xs text-slate-300">{t.finalEvaluation}</td>
              <td className="px-4 py-2.5"><Bar pct={s.byTrack[t.id]?.averagePct ?? 0} label={t.title} /><span className="text-[11px] text-slate-500">{s.byTrack[t.id]?.completed ?? 0} com 100%</span></td>
            </tr>))}</tbody></table></div>
      </section>

      <section aria-labelledby="people">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h3 id="people" className="text-lg font-semibold">{isSelf ? 'Meu registro' : 'Pessoas'} <span className="text-sm font-normal text-slate-500">({doc.rows.length})</span></h3>
          {!isSelf && (
            <div className="flex flex-wrap items-end gap-2">
              <div><label htmlFor="rf-q" className="block text-[11px] font-medium text-slate-400">Buscar</label>
                <div className="relative"><Search size={14} className="pointer-events-none absolute left-2.5 top-3 text-slate-500" aria-hidden="true" /><input id="rf-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome ou e-mail" className={`${ctl} w-52 pl-8`} /></div></div>
              <div><label htmlFor="rf-team" className="block text-[11px] font-medium text-slate-400">Equipe</label>
                <select id="rf-team" value={team} onChange={(e) => setTeam(e.target.value)} className={ctl}><option value="">Todas</option>{teams.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label htmlFor="rf-sit" className="block text-[11px] font-medium text-slate-400">Situação</label>
                <select id="rf-sit" value={situation} onChange={(e) => setSituation(e.target.value)} className={ctl}><option value="">Todas</option>{Object.keys(SIT).map((t) => <option key={t}>{t}</option>)}</select></div>
              <button className={btn} onClick={load} aria-label="Atualizar relatório"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" /></button>
            </div>)}
        </div>
        {err && <p role="alert" className="mb-3 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{err}</p>}
        <div className="overflow-x-auto rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
          <table className="w-full min-w-[920px] text-sm">
            <caption className="sr-only">Situação de treinamento por pessoa</caption>
            <thead><tr className="border-b border-[var(--color-line)] text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="w-8 px-2 py-2"><span className="sr-only">Detalhes</span></th><th scope="col" className="px-2 py-2 font-semibold">Pessoa</th><th scope="col" className="px-2 py-2 font-semibold">Equipe</th>
              <th scope="col" className="px-2 py-2 font-semibold">Situação</th><th scope="col" className="px-2 py-2 font-semibold">Geral</th><th scope="col" className="px-2 py-2 font-semibold">Nível</th><th scope="col" className="px-2 py-2 font-semibold">Última atividade</th><th scope="col" className="px-2 py-2 font-semibold">Selo</th></tr></thead>
            <tbody>
              {doc.rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">Nenhuma pessoa encontrada para os filtros.</td></tr>}
              {doc.rows.map((r) => {
                const isOpen = open === r.userId;
                return (
                  <React.Fragment key={r.userId}>
                    <tr className={`border-t border-[var(--color-line-soft)] ${r.status === 'disabled' ? 'opacity-60' : ''} ${isOpen ? 'bg-[var(--color-surface-2)]/50' : ''}`}>
                      <td className="px-2 py-2"><button onClick={() => setOpen(isOpen ? null : r.userId)} aria-expanded={isOpen} aria-label={`Detalhes de ${r.name}`} className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-[var(--color-surface-2)] hover:text-slate-100">{isOpen ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronRight size={15} aria-hidden="true" />}</button></td>
                      <th scope="row" className="px-2 py-2 text-left font-normal"><span className="block font-medium text-slate-100">{r.name}</span><span className="block text-xs text-slate-500">{r.email}{r.status === 'disabled' ? ' · desativada' : ''}</span></th>
                      <td className="px-2 py-2 text-slate-300">{r.team || '—'}</td>
                      <td className="px-2 py-2"><SituationBadge s={r.situation} />{r.pendingFinals.length > 0 && <span className="mt-0.5 block text-[10.5px] text-amber-300/80">final: {r.pendingFinals.map((p) => TRACK_LABEL[p] ?? p).join(', ')}</span>}</td>
                      <td className="px-2 py-2"><Bar pct={r.overallPct} label={`Geral de ${r.name}`} /></td>
                      <td className="px-2 py-2 text-slate-300">{r.tier || '—'}</td>
                      <td className="px-2 py-2 text-xs text-slate-400">{fmtDate(r.lastActivity)}</td>
                      <td className="px-2 py-2 font-mono text-[11px] text-slate-400">{r.sealId ?? '—'}</td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-[var(--color-surface-2)]/30"><td /><td colSpan={7} className="px-2 pb-4 pt-1">
                        <dl className="mb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
                          <div><dt className="text-slate-500">Perfil</dt><dd className="text-slate-200">{r.role}</dd></div><div><dt className="text-slate-500">Gestor</dt><dd className="text-slate-200">{r.manager || '—'}</dd></div>
                          <div><dt className="text-slate-500">Primeira atividade</dt><dd className="text-slate-200">{fmtDate(r.firstActivity)}</dd></div><div><dt className="text-slate-500">Último login</dt><dd className="text-slate-200">{fmtDate(r.lastLogin)}</dd></div>
                        </dl>
                        <table className="w-full max-w-3xl text-xs"><caption className="sr-only">Detalhe por trilha de {r.name}</caption>
                          <thead><tr className="text-left text-slate-500"><th scope="col" className="py-1 pr-3 font-semibold">Trilha</th><th scope="col" className="py-1 pr-3 font-semibold">Concluídos</th><th scope="col" className="py-1 pr-3 font-semibold">Progresso</th><th scope="col" className="py-1 font-semibold">Última conclusão</th></tr></thead>
                          <tbody>{TRACK_ORDER.map((t) => { const c = r.tracks[t]; if (!c) return null; return (
                            <tr key={t} className="border-t border-[var(--color-line-soft)]"><th scope="row" className="py-1 pr-3 text-left font-normal text-slate-200">{TRACK_LABEL[t]}{c.finalPending && <span className="ml-1.5 rounded bg-amber-400/10 px-1 text-[10px] text-amber-300">final pendente</span>}</th>
                              <td className="py-1 pr-3 font-mono">{c.done}/{c.total}</td><td className="py-1 pr-3"><Bar pct={c.pct} label={TRACK_LABEL[t]} /></td><td className="py-1 text-slate-400">{fmtDate(c.last)}</td></tr>); })}</tbody></table>
                      </td></tr>)}
                  </React.Fragment>);
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="integrity" className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <h3 id="integrity" className="flex items-center gap-2 text-base font-semibold"><ShieldCheck size={17} className="text-[var(--color-defense)]" aria-hidden="true" /> Integridade e rastreabilidade</h3>
        <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm md:grid-cols-2">
          <div><dt className="text-xs text-slate-500">Identificador</dt><dd className="font-mono text-slate-100">{doc.meta.reportId}</dd></div>
          <div><dt className="text-xs text-slate-500">Gerado em / por</dt><dd className="text-slate-200">{fmtDate(doc.meta.generatedAt)} · {doc.meta.generatedBy.email}</dd></div>
          <div className="md:col-span-2"><dt className="text-xs text-slate-500">SHA-256 do conteúdo</dt><dd className="break-all font-mono text-xs text-slate-300">{doc.integrity.contentSha256}</dd></div>
          <div className="md:col-span-2"><dt className="text-xs text-slate-500">Assinatura ({doc.integrity.algorithm})</dt><dd className="break-all font-mono text-xs text-slate-300">{doc.integrity.signature}</dd></div>
        </dl>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-500">O JSON exportado leva esta assinatura. Para provar que um arquivo não foi alterado depois de gerado, envie-o abaixo: o servidor recalcula o hash e a assinatura. O Excel traz o identificador e o SHA-256 do mesmo relatório. A assinatura prova integridade, não aderência a uma norma específica.</p>
        <div className="mt-3"><label className={`${btn} cursor-pointer`}><ShieldAlert size={15} aria-hidden="true" /> Verificar arquivo JSON do relatório
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => void doVerify(e.target.files?.[0])} /></label></div>
      </section>

      {printing && createPortal(<ReportPrint doc={doc} />, document.body)}
    </div>
  );
}

/** Versão para impressão/PDF (tema claro, A4 paisagem, cabeçalho com a marca, rastreabilidade e rodapé de rascunho). */
function ReportPrint({ doc }: Readonly<{ doc: ReportDoc }>) {
  const s = doc.summary; const f = doc.meta.filters;
  const filt = [f.team && `equipe: ${f.team}`, f.situation && `situação: ${f.situation}`, f.q && `busca: "${f.q}"`].filter(Boolean).join(' · ') || 'sem filtros';
  return (
    <div id="report-print">
      <div className="rp-head"><img src="/brand/cybershield-logo.png" alt="CyberShield DevSec Academy" /><div><p className="rp-eyebrow">CyberShield DevSec Academy</p><h1>Relatório de desempenho do treinamento</h1></div></div>
      <p className="rp-draft">RASCUNHO PARA REVISÃO HUMANA · validar com Conformidade e DPO antes de uso como evidência de auditoria · contém dados pessoais</p>
      <table className="rp-meta"><tbody>
        <tr><th>Identificador</th><td className="mono">{doc.meta.reportId}</td><th>Gerado em</th><td>{fmtDate(doc.meta.generatedAt)}</td></tr>
        <tr><th>Gerado por</th><td>{doc.meta.generatedBy.email} ({doc.meta.generatedBy.role})</td><th>Escopo</th><td>{SCOPE[doc.meta.scope]} · {filt}</td></tr>
        <tr><th>SHA-256</th><td className="mono" colSpan={3}>{doc.integrity.contentSha256}</td></tr>
        <tr><th>Assinatura</th><td className="mono" colSpan={3}>{doc.integrity.signature}</td></tr>
      </tbody></table>
      <div className="rp-kpis">
        {([['Pessoas', s.users], ['Aprovados', `${s.bySituation.Aprovado} (${s.approvalRatePct}%)`], ['Final pendente', s.bySituation['Final pendente']], ['Em andamento', s.bySituation['Em andamento']], ['Não iniciado', s.bySituation['Não iniciado']], ['Média geral', `${s.averageOverallPct}%`]] as const).map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}
      </div>
      <h2>Conclusão média por trilha</h2>
      <table className="rp-table"><thead><tr><th>Trilha</th><th>Itens</th><th>Média</th><th>Com 100%</th></tr></thead><tbody>{TRACK_ORDER.map((t) => <tr key={t}><td>{TRACK_LABEL[t]}</td><td>{doc.meta.trackTotals[t]}</td><td>{s.byTrack[t]?.averagePct ?? 0}%</td><td>{s.byTrack[t]?.completed ?? 0}</td></tr>)}</tbody></table>
      <h2>Treinamentos avaliados</h2>
      <table className="rp-table"><thead><tr><th>Treinamento</th><th>Referência e formato</th><th>Módulos</th><th>Itens</th><th>Avaliação final</th></tr></thead>
        <tbody>{(doc.meta.trainings ?? []).map((t) => <tr key={t.id}><td><b>{t.title}</b><br /><span>{t.description}</span><br /><span>Público: {t.audience}</span></td><td>{t.reference}<br /><span>{t.format}</span><br /><span>{t.sourceNote}</span></td><td>{t.modules ?? '—'}</td><td>{t.items} {t.itemUnit}{t.points != null ? ` · ${t.points} pts` : ''}</td><td>{t.finalEvaluation}</td></tr>)}</tbody></table>
      <h2>Por pessoa</h2>
      <table className="rp-table rp-people"><thead><tr><th>Pessoa</th><th>Equipe</th><th>Situação</th><th>Geral</th><th>Nível</th>{TRACK_ORDER.map((t) => <th key={t}>{TRACK_LABEL[t]}</th>)}<th>Última atividade</th><th>Selo</th></tr></thead>
        <tbody>{doc.rows.map((r) => <tr key={r.userId}><td><b>{r.name}</b><br /><span>{r.email}</span></td><td>{r.team || '—'}</td><td>{r.situation}{r.pendingFinals.length > 0 && <><br /><span>final pendente</span></>}</td><td>{r.overallPct}%</td><td>{r.tier || '—'}</td>
          {TRACK_ORDER.map((t) => <td key={t}>{r.tracks[t]?.done ?? 0}/{r.tracks[t]?.total ?? 0}</td>)}<td>{fmtDay(r.lastActivity)}</td><td className="mono">{r.sealId ?? '—'}</td></tr>)}</tbody></table>
      <h2>Critérios e limites</h2>
      <ul className="rp-notes">
        {Object.entries(doc.meta.criteria.situations).map(([k, v]) => <li key={k}><b>{k}:</b> {v}</li>)}
        <li><b>Níveis:</b> {doc.meta.criteria.tiers.map((t) => `${t.label} ≥ ${t.minPctPerTrack}% em cada trilha`).join('; ')}. Avaliações finais obrigatórias: {doc.meta.criteria.mandatoryFinals.map((t) => TRACK_LABEL[t] ?? t).join(', ')}.</li>
        {doc.meta.notes.map((n) => <li key={n}>{n}</li>)}
        <li>Para verificar a integridade, exporte o JSON assinado do mesmo relatório (identificador acima) e use “Verificar arquivo JSON do relatório” no sistema.</li>
      </ul>
      <p className="rp-foot">{doc.meta.reportId} · gerado em {fmtDate(doc.meta.generatedAt)} · rascunho para revisão humana</p>
    </div>
  );
}
