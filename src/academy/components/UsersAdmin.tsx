import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, UserPlus, KeyRound, Ban, RotateCcw, Pencil, Copy, Check, AlertTriangle, Lock, X, Info } from 'lucide-react';
import { fetchUsers, createUser, updateUser, resetUserPassword, ROLE_LABEL, type AdminUser, type Role, type UserInput } from '../auth';
import { useSession } from './AuthGate';
import { fmtDate } from './ReportView';

const ctl = 'mt-1 block w-full min-h-10 rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-3 text-sm text-slate-100 focus:border-[var(--color-offense)] focus:outline-none focus:ring-1 focus:ring-[var(--color-offense)]';
const btn = 'inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[var(--color-line)] px-2.5 text-xs font-medium text-slate-200 transition-colors hover:bg-[var(--color-surface-2)] disabled:opacity-50';
const ROLES: Role[] = ['learner', 'manager', 'auditor', 'admin'];
const ROLE_HELP: Record<Role, string> = {
  learner: 'Faz o treinamento e vê o próprio desempenho.',
  manager: 'Vê o relatório da equipe (pessoas que o têm como gestor).',
  auditor: 'Leitura de usuários, relatórios e trilha de auditoria; exporta evidências; não altera nada.',
  admin: 'Gerencia usuários; também lê e exporta relatórios e auditoria.',
};

interface FormState { email: string; name: string; role: Role; team: string; managerId: string }
const EMPTY: FormState = { email: '', name: '', role: 'learner', team: '', managerId: '' };

/** Botão de confirmação em dois passos (evita confirm() nativo, que bloqueia leitores de tela e automação). */
function TwoStep({ label, confirmLabel, onConfirm, icon, disabled }: Readonly<{ label: string; confirmLabel: string; onConfirm: () => void; icon: React.ReactNode; disabled?: boolean }>) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 5000); return () => clearTimeout(t); }, [armed]);
  return armed
    ? <button className={`${btn} border-rose-500/50 text-rose-200`} onClick={() => { setArmed(false); onConfirm(); }}>{confirmLabel}</button>
    : <button className={btn} onClick={() => setArmed(true)} disabled={disabled}>{icon}{label}</button>;
}

export function UsersAdmin() {
  const { user: me } = useSession();
  const canEdit = me?.role === 'admin';
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<{ id: string | null; v: FormState } | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState<{ email: string; pw: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');

  const load = useCallback(() => { fetchUsers().then((r) => { setUsers(r.users); setErr(null); }).catch((e) => setErr(e instanceof Error ? e.message : 'Falha ao carregar usuários.')); }, []);
  useEffect(load, [load]);
  useEffect(() => () => setSecret(null), []);

  const managers = useMemo(() => (users ?? []).filter((u) => u.status === 'active' && (u.role === 'manager' || u.role === 'admin') && u.id !== form?.id), [users, form?.id]);
  const byId = useMemo(() => new Map((users ?? []).map((u) => [u.id, u])), [users]);
  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return (users ?? []).filter((u) => !q || `${u.name} ${u.email} ${u.team}`.toLowerCase().includes(q));
  }, [users, filter]);

  const run = async (fn: () => Promise<void>, fail = 'Operação não concluída.') => {
    setErr(null); try { await fn(); load(); } catch (e) { setErr(e instanceof Error ? e.message : fail); }
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form || busy) return; setBusy(true); setFormErr(null);
    const v = form.v; const input: UserInput = { email: v.email, name: v.name, role: v.role, team: v.team, managerId: v.managerId || null };
    try {
      if (form.id) await updateUser(form.id, input);
      else { const r = await createUser(input); setSecret({ email: r.user.email, pw: r.temporaryPassword }); setCopied(false); }
      setForm(null); load();
    } catch (x) { setFormErr(x instanceof Error ? x.message : 'Não foi possível salvar.'); }
    finally { setBusy(false); }
  };
  const copy = async () => { if (!secret) return; try { await navigator.clipboard.writeText(secret.pw); setCopied(true); } catch { /* sem permissão de clipboard */ } };
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => (f ? { ...f, v: { ...f.v, [k]: e.target.value } } : f));

  if (!users && !err) return <div className="flex items-center justify-center gap-2 py-24 text-slate-400"><Loader2 className="animate-spin" aria-hidden="true" /> Carregando…</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-line)] pb-5">
        <div>
          <h2 className="text-2xl font-semibold">Usuários e perfis</h2>
          <p className="mt-1.5 max-w-3xl text-[15px] leading-relaxed text-slate-400">
            {canEdit ? 'Cadastre pessoas, defina o perfil e a equipe, e redefina senhas.' : 'Consulta somente leitura (perfil Auditor).'} Toda alteração é registrada na trilha de auditoria.
          </p>
        </div>
        {canEdit && <button className={`${btn} !min-h-10 !bg-[var(--color-offense)] !px-3 !text-sm !font-semibold !text-slate-950 hover:!bg-[var(--color-offense-soft)]`} onClick={() => { setForm({ id: null, v: EMPTY }); setFormErr(null); }}><UserPlus size={15} aria-hidden="true" /> Novo usuário</button>}
      </header>

      {err && <p role="alert" className="flex gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{err}</p>}

      {secret && (
        <section role="status" aria-label="Senha provisória" className="rounded-md border border-amber-400/50 bg-amber-400/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-200"><KeyRound size={15} aria-hidden="true" /> Senha provisória de {secret.email}</p>
          <p className="mt-1 text-xs text-amber-100/80">Exibida <strong>uma única vez</strong>. Entregue por um canal seguro; a pessoa será obrigada a trocá-la no primeiro acesso. Não envie por e-mail comum nem a registre em chamados.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="select-all rounded bg-[var(--color-ink)] px-3 py-1.5 font-mono text-sm text-slate-100">{secret.pw}</code>
            <button className={btn} onClick={copy}>{copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copied ? 'Copiada' : 'Copiar'}</button>
            <button className={btn} onClick={() => setSecret(null)}><X size={14} aria-hidden="true" /> Já anotei, ocultar</button>
          </div>
        </section>
      )}

      {form && canEdit && (
        <form onSubmit={save} aria-labelledby="uf-title" className="rounded-md border border-[var(--color-offense)]/40 bg-[var(--color-surface)] p-5">
          <h3 id="uf-title" className="text-base font-semibold">{form.id ? 'Editar usuário' : 'Novo usuário'}</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div><label htmlFor="uf-name" className="block text-sm font-medium text-slate-200">Nome completo</label><input id="uf-name" required minLength={2} maxLength={80} value={form.v.name} onChange={set('name')} className={ctl} /></div>
            <div><label htmlFor="uf-email" className="block text-sm font-medium text-slate-200">E-mail corporativo</label><input id="uf-email" type="email" required value={form.v.email} onChange={set('email')} className={ctl} /></div>
            <div><label htmlFor="uf-role" className="block text-sm font-medium text-slate-200">Perfil</label>
              <select id="uf-role" value={form.v.role} onChange={set('role')} aria-describedby="uf-role-help" className={ctl}>{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select>
              <p id="uf-role-help" className="mt-1 text-xs text-slate-500">{ROLE_HELP[form.v.role]}</p></div>
            <div><label htmlFor="uf-team" className="block text-sm font-medium text-slate-200">Equipe</label><input id="uf-team" maxLength={60} value={form.v.team} onChange={set('team')} className={ctl} /></div>
            <div><label htmlFor="uf-mgr" className="block text-sm font-medium text-slate-200">Gestor (vê o desempenho desta pessoa)</label>
              <select id="uf-mgr" value={form.v.managerId} onChange={set('managerId')} className={ctl}><option value="">Sem gestor</option>{managers.map((m) => <option key={m.id} value={m.id}>{m.name} ({ROLE_LABEL[m.role]})</option>)}</select></div>
          </div>
          {formErr && <p role="alert" className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{formErr}</p>}
          {!form.id && <p className="mt-4 flex gap-2 text-xs text-slate-400"><Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />Uma senha provisória aleatória será gerada e mostrada uma vez. A pessoa define a própria senha no primeiro acesso.</p>}
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--color-offense)] px-4 text-sm font-semibold text-slate-950 hover:bg-[var(--color-offense-soft)] disabled:opacity-60">{busy && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}{form.id ? 'Salvar alterações' : 'Criar usuário'}</button>
            <button type="button" onClick={() => setForm(null)} className="rounded-md border border-[var(--color-line)] px-4 text-sm text-slate-300 hover:bg-[var(--color-surface-2)]">Cancelar</button>
          </div>
        </form>
      )}

      <section aria-labelledby="ul-title">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h3 id="ul-title" className="text-lg font-semibold">Cadastro <span className="text-sm font-normal text-slate-500">({shown.length}{shown.length !== users?.length ? ` de ${users?.length}` : ''})</span></h3>
          <div><label htmlFor="ul-q" className="block text-[11px] font-medium text-slate-400">Buscar</label><input id="ul-q" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Nome, e-mail ou equipe" className="min-h-10 w-60 rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-3 text-sm focus:border-[var(--color-offense)] focus:outline-none focus:ring-1 focus:ring-[var(--color-offense)]" /></div>
        </div>
        <div className="overflow-x-auto rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
          <table className="w-full min-w-[860px] text-sm">
            <caption className="sr-only">Usuários cadastrados</caption>
            <thead><tr className="border-b border-[var(--color-line)] text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-3 py-2 font-semibold">Pessoa</th><th scope="col" className="px-3 py-2 font-semibold">Perfil</th><th scope="col" className="px-3 py-2 font-semibold">Equipe / gestor</th>
              <th scope="col" className="px-3 py-2 font-semibold">Estado</th><th scope="col" className="px-3 py-2 font-semibold">Último acesso</th>{canEdit && <th scope="col" className="px-3 py-2 font-semibold">Ações</th>}</tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>}
              {shown.map((u) => {
                const self = u.id === me?.id;
                return (
                  <tr key={u.id} className={`border-t border-[var(--color-line-soft)] ${u.status === 'disabled' ? 'opacity-60' : ''}`}>
                    <th scope="row" className="px-3 py-2 text-left font-normal"><span className="block font-medium text-slate-100">{u.name}{self && <span className="ml-1.5 rounded bg-[var(--color-offense)]/15 px-1.5 text-[10px] font-semibold text-[var(--color-offense-soft)]">você</span>}</span><span className="block text-xs text-slate-500">{u.email}</span></th>
                    <td className="px-3 py-2 text-slate-300">{ROLE_LABEL[u.role]}</td>
                    <td className="px-3 py-2 text-slate-300">{u.team || '—'}<span className="block text-xs text-slate-500">{u.managerId ? byId.get(u.managerId)?.name ?? '—' : 'sem gestor'}</span></td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-semibold ${u.status === 'active' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-500/40 bg-slate-500/10 text-slate-300'}`}>{u.status === 'active' ? 'Ativa' : 'Desativada'}</span>
                      {u.locked && <span className="ml-1 inline-flex items-center gap-1 rounded border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-rose-300"><Lock size={11} aria-hidden="true" />Bloqueada</span>}
                      {u.mustChange && <span className="mt-0.5 block text-[10.5px] text-amber-300/80">troca de senha pendente</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-400">{fmtDate(u.lastLoginAt)}</td>
                    {canEdit && (
                      <td className="px-3 py-2"><div className="flex flex-wrap gap-1.5">
                        <button className={btn} onClick={() => { setForm({ id: u.id, v: { email: u.email, name: u.name, role: u.role, team: u.team, managerId: u.managerId ?? '' } }); setFormErr(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label={`Editar ${u.name}`}><Pencil size={13} aria-hidden="true" />Editar</button>
                        <TwoStep label="Redefinir senha" confirmLabel="Confirmar redefinição" icon={<KeyRound size={13} aria-hidden="true" />}
                          onConfirm={() => void run(async () => { const r = await resetUserPassword(u.id); setSecret({ email: u.email, pw: r.temporaryPassword }); setCopied(false); })} />
                        {u.status === 'active'
                          ? <TwoStep label="Desativar" confirmLabel="Confirmar desativação" disabled={self} icon={<Ban size={13} aria-hidden="true" />} onConfirm={() => void run(async () => { await updateUser(u.id, { status: 'disabled' }); })} />
                          : <button className={btn} onClick={() => void run(async () => { await updateUser(u.id, { status: 'active' }); })}><RotateCcw size={13} aria-hidden="true" />Reativar</button>}
                      </div></td>)}
                  </tr>);
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-500">Desativar encerra as sessões da pessoa e impede novo login, preservando o registro de treinamento (evidência). Não é possível desativar a si mesmo nem remover o último administrador. Provedor de login corporativo (SSO) [inserir provedor SSO] pode substituir as senhas locais futuramente.</p>
      </section>
    </div>
  );
}
