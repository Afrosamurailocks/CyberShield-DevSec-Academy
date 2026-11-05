import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, ShieldAlert, Download, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { fetchAudit, exportAudit, type AuditResponse } from '../auth';
import { fmtDate } from './ReportView';

const ACTIONS: { id: string; label: string }[] = [
  { id: '', label: 'Todos os eventos' }, { id: 'auth', label: 'Autenticação (todos)' }, { id: 'auth.login.failure', label: 'Falhas de login' }, { id: 'auth.lockout', label: 'Bloqueios de conta' },
  { id: 'user', label: 'Gestão de usuários' }, { id: 'report', label: 'Relatórios (visualização/exportação)' }, { id: 'seal', label: 'Selos Security Champion' }, { id: 'access.denied', label: 'Acessos negados' },
];
const OUTCOME = { ok: 'text-emerald-300', fail: 'text-amber-300', denied: 'text-rose-300' } as const;
const OUTCOME_LABEL = { ok: 'ok', fail: 'falha', denied: 'negado' } as const;
const ctl = 'min-h-10 rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-3 text-sm text-slate-100 focus:border-[var(--color-offense)] focus:outline-none focus:ring-1 focus:ring-[var(--color-offense)]';
const btn = 'inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--color-line)] px-3 text-sm font-medium text-slate-200 transition-colors hover:bg-[var(--color-surface-2)] disabled:opacity-50';
const PAGE = 50;

export function AuditView() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(''); const [q, setQ] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const [page, setPage] = useState(0); const [msg, setMsg] = useState<string | null>(null);

  const filters = { action: action || undefined, q: q.trim() || undefined, from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined, to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined };
  const load = useCallback(() => {
    setLoading(true); setErr(null);
    fetchAudit({ ...filters, limit: PAGE, offset: page * PAGE }).then(setData).catch((e) => setErr(e instanceof Error ? e.message : 'Falha ao carregar a auditoria.')).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, q, from, to, page]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);
  useEffect(() => setPage(0), [action, q, from, to]);

  const doExport = async () => { setMsg(null); try { const n = await exportAudit(filters); setMsg(`Arquivo gerado: ${n} (até 1000 eventos mais recentes dos filtros). A exportação foi registrada.`); } catch (e) { setErr(e instanceof Error ? e.message : 'Falha ao exportar.'); } };

  const chain = data?.chain;
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE)) : 1;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-line)] pb-5">
        <div>
          <h2 className="text-2xl font-semibold">Trilha de auditoria</h2>
          <p className="mt-1.5 max-w-3xl text-[15px] leading-relaxed text-slate-400">Registro cronológico de logins, falhas, mudanças de usuários, exportações e emissão de selos. Cada evento é encadeado por hash ao anterior para revelar edição ou remoção.</p>
        </div>
        <button className={btn} onClick={doExport}><Download size={15} aria-hidden="true" /> Exportar CSV</button>
      </header>

      {chain && (
        <p role={chain.ok ? 'status' : 'alert'} className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm ${chain.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/40 bg-rose-500/10 text-rose-200'}`}>
          {chain.ok ? <ShieldCheck size={17} className="mt-0.5 shrink-0" aria-hidden="true" /> : <ShieldAlert size={17} className="mt-0.5 shrink-0" aria-hidden="true" />}
          <span>{chain.ok
            ? <>Cadeia íntegra: {chain.count} eventos verificados. Hash do último evento: <code className="break-all font-mono text-xs">{chain.head}</code></>
            : <><strong>Cadeia comprometida</strong>{chain.brokenAtSeq ? ` a partir do evento #${chain.brokenAtSeq}` : ''}: {chain.reason}. Acione a Segurança da Informação e a AI Guild.</>}</span>
        </p>
      )}
      <p className="flex max-w-4xl gap-2 border-l-2 border-amber-400/70 bg-[var(--color-surface)] px-3 py-2 text-xs leading-relaxed text-slate-400">
        <Info size={14} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <span>Quem controla o arquivo <em>e</em> a chave consegue refazer a cadeia. Para evidência forte, guarde periodicamente o hash do último evento em um repositório externo imutável [definir com a Conformidade]. Contém e-mail e IP (dados pessoais): retenção e base legal [definir com o DPO]. Nunca registra senhas nem tokens.</span>
      </p>
      {msg && <p role="status" className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{msg}</p>}
      {err && <p role="alert" className="flex gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{err}</p>}

      <section aria-label="Filtros" className="flex flex-wrap items-end gap-2">
        <div><label htmlFor="af-action" className="block text-[11px] font-medium text-slate-400">Tipo de evento</label><select id="af-action" value={action} onChange={(e) => setAction(e.target.value)} className={ctl}>{ACTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</select></div>
        <div><label htmlFor="af-q" className="block text-[11px] font-medium text-slate-400">Pessoa (e-mail)</label><input id="af-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ex.: alice@" className={`${ctl} w-52`} /></div>
        <div><label htmlFor="af-from" className="block text-[11px] font-medium text-slate-400">De</label><input id="af-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={ctl} /></div>
        <div><label htmlFor="af-to" className="block text-[11px] font-medium text-slate-400">Até</label><input id="af-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className={ctl} /></div>
        <button className={btn} onClick={load} aria-label="Atualizar"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" /></button>
      </section>

      <div className="overflow-x-auto rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
        {!data ? <div className="flex items-center justify-center gap-2 py-16 text-slate-400"><Loader2 className="animate-spin" aria-hidden="true" /> Carregando…</div> : (
          <table className="w-full min-w-[900px] text-sm">
            <caption className="sr-only">Eventos de auditoria, mais recentes primeiro</caption>
            <thead><tr className="border-b border-[var(--color-line)] text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-3 py-2 font-semibold">#</th><th scope="col" className="px-3 py-2 font-semibold">Data/hora</th><th scope="col" className="px-3 py-2 font-semibold">Evento</th><th scope="col" className="px-3 py-2 font-semibold">Resultado</th>
              <th scope="col" className="px-3 py-2 font-semibold">Ator</th><th scope="col" className="px-3 py-2 font-semibold">Alvo / detalhe</th><th scope="col" className="px-3 py-2 font-semibold">IP</th></tr></thead>
            <tbody>
              {data.entries.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Nenhum evento para os filtros.</td></tr>}
              {data.entries.map((e) => (
                <tr key={e.seq} className="border-t border-[var(--color-line-soft)] align-top">
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">{e.seq}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-300">{fmtDate(e.ts)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-100">{e.action}</td>
                  <td className={`px-3 py-2 text-xs font-semibold ${OUTCOME[e.outcome]}`}>{OUTCOME_LABEL[e.outcome]}</td>
                  <td className="px-3 py-2 text-xs text-slate-300">{e.actor ? <>{e.actor.email}<span className="block text-slate-500">{e.actor.role}</span></> : <span className="text-slate-500">anônimo</span>}</td>
                  <td className="px-3 py-2 text-xs text-slate-400">{e.target && <span className="block break-all">{e.target}</span>}{e.detail && <span className="block break-all font-mono text-[11px] text-slate-500">{Object.entries(e.detail).map(([k, v]) => `${k}=${v}`).join(' · ')}</span>}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{e.ip ?? '—'}</td>
                </tr>))}
            </tbody>
          </table>)}
      </div>
      {data && <nav aria-label="Paginação" className="flex items-center justify-between text-sm text-slate-400">
        <span>{data.total} evento(s) · página {page + 1} de {pages}</span>
        <span className="flex gap-2"><button className={btn} onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Anterior</button><button className={btn} onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= pages}>Próxima</button></span>
      </nav>}
    </div>
  );
}
