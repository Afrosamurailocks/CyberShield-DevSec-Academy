import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Loader2, LogIn, KeyRound, Eye, EyeOff, ShieldCheck, Check, X, AlertTriangle } from 'lucide-react';
import { verifyChampionSeal } from '../api';
import { TIERS } from '../championCore';
import type { PublicSeal } from '../champion';
import { fetchMe, login, logout, changePassword, syncProgressAfterLogin, clearLocalProgress, type SessionUser, type MeResponse } from '../auth';

interface SessionCtx { user: SessionUser | null; mode: 'required' | 'optional'; signOut: () => Promise<void> }
const Ctx = createContext<SessionCtx>({ user: null, mode: 'optional', signOut: async () => {} });
export const useSession = () => useContext(Ctx);

const field = 'mt-1.5 block w-full rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[var(--color-offense)] focus:outline-none focus:ring-1 focus:ring-[var(--color-offense)]';
const primary = 'flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-offense)] px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[var(--color-offense-soft)] disabled:cursor-not-allowed disabled:opacity-60';

function Shell({ title, subtitle, children }: Readonly<{ title: string; subtitle: string; children: React.ReactNode }>) {
  return (
    <div className="app-bg flex min-h-screen items-center justify-center px-4 py-10 text-slate-100">
      <main className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3"><img src="/brand/cybershield-mark.svg" alt="" aria-hidden="true" className="h-10 w-10" /><div><p className="text-lg font-semibold leading-tight">CyberShield</p><p className="text-xs leading-tight text-slate-400">DevSec Academy</p></div></div>
        <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-xl sm:p-8">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-4 flex gap-2 text-[11px] leading-relaxed text-slate-500">
          <ShieldCheck size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>Ambiente de treinamento corporativo. O acesso, as conclusões e as exportações são registrados em trilha de auditoria. Rascunho sujeito à revisão da Segurança da Informação.</span>
        </p>
      </main>
    </div>
  );
}

function PasswordInput({ id, label, value, onChange, autoComplete, describedBy }: Readonly<{ id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string; describedBy?: string }>) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">{label}</label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required
          aria-describedby={describedBy} className={`${field} pr-11`} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={show}
          className="absolute right-1 top-1.5 flex h-9 w-9 items-center justify-center rounded text-slate-400 hover:text-slate-100">
          {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

function LoginView({ onDone }: Readonly<{ onDone: (u: SessionUser) => void }>) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (busy) return; setBusy(true); setErr(null);
    try { const r = await login(email, password); onDone(r.user); }
    catch (x) { setErr(x instanceof Error ? x.message : 'Falha ao entrar.'); setPassword(''); }
    finally { setBusy(false); }
  };
  return (
    <Shell title="Entrar" subtitle="CyberShield DevSec Academy · acesso com a sua conta corporativa.">
      <form onSubmit={submit} className="space-y-4" noValidate={false}>
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-200">E-mail</label>
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus
            placeholder="nome.sobrenome@empresa.com.br" className={field} />
        </div>
        <PasswordInput id="login-password" label="Senha" value={password} onChange={setPassword} autoComplete="current-password" describedBy={err ? 'login-error' : undefined} />
        {err && <p id="login-error" role="alert" className="flex gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{err}</p>}
        <button type="submit" disabled={busy || !email || !password} className={primary}>
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <LogIn size={16} aria-hidden="true" />} {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="text-xs leading-relaxed text-slate-500">Esqueceu a senha ou a conta foi bloqueada? Peça a um administrador para redefinir [inserir canal de suporte]. A conta é bloqueada por 15 minutos após 5 tentativas incorretas.</p>
      </form>
    </Shell>
  );
}

const RULES: { id: string; label: string; ok: (p: string) => boolean }[] = [
  { id: 'len', label: 'Mínimo de 12 caracteres', ok: (p) => p.length >= 12 },
  { id: 'mix', label: 'Ao menos 3 tipos: minúscula, maiúscula, número, símbolo', ok: (p) => [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length >= 3 },
];

function ChangePasswordView({ user, onDone, onCancel }: Readonly<{ user: SessionUser; onDone: (u: SessionUser) => void; onCancel: () => void }>) {
  const [cur, setCur] = useState(''); const [next, setNext] = useState(''); const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const valid = RULES.every((r) => r.ok(next)) && next === again && next !== cur;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!valid || busy) return; setBusy(true); setErr(null);
    try { const r = await changePassword(cur, next); onDone(r.user); }
    catch (x) { setErr(x instanceof Error ? x.message : 'Falha ao trocar a senha.'); }
    finally { setBusy(false); }
  };
  return (
    <Shell title="Defina a sua senha" subtitle={`Olá, ${user.name}. Por segurança, troque a senha provisória antes de continuar.`}>
      <form onSubmit={submit} className="space-y-4">
        <PasswordInput id="pw-current" label="Senha provisória atual" value={cur} onChange={setCur} autoComplete="current-password" />
        <PasswordInput id="pw-new" label="Nova senha" value={next} onChange={setNext} autoComplete="new-password" describedBy="pw-rules" />
        <ul id="pw-rules" className="space-y-1 text-xs">
          {[...RULES, { id: 'diff', label: 'Diferente da senha atual', ok: (p: string) => p.length > 0 && p !== cur }].map((r) => {
            const ok = r.ok(next);
            return <li key={r.id} className={`flex items-center gap-1.5 ${ok ? 'text-[var(--color-defense)]' : 'text-slate-400'}`}>
              {ok ? <Check size={13} aria-hidden="true" /> : <X size={13} aria-hidden="true" />}<span>{r.label}</span><span className="sr-only">{ok ? ' (atendido)' : ' (pendente)'}</span></li>;
          })}
        </ul>
        <PasswordInput id="pw-again" label="Repita a nova senha" value={again} onChange={setAgain} autoComplete="new-password" />
        {again && next !== again && <p className="text-xs text-rose-300">As senhas não conferem.</p>}
        {err && <p role="alert" className="flex gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{err}</p>}
        <button type="submit" disabled={!valid || busy} className={primary}>
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <KeyRound size={16} aria-hidden="true" />} {busy ? 'Salvando…' : 'Salvar nova senha'}
        </button>
        <button type="button" onClick={onCancel} className="w-full text-center text-xs text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline">Sair</button>
        <p className="text-xs leading-relaxed text-slate-500">Use uma senha única, de preferência de um gerenciador de senhas. Nunca compartilhe a sua senha.</p>
      </form>
    </Shell>
  );
}

/** Troca de senha voluntária (a partir do menu da conta). */
export function ChangePasswordPanel({ onClose }: Readonly<{ onClose: () => void }>) {
  const { user } = useSession();
  const [cur, setCur] = useState(''); const [next, setNext] = useState(''); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false);
  if (!user) return null;
  const valid = RULES.every((r) => r.ok(next)) && next !== cur;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!valid || busy) return; setBusy(true); setMsg(null);
    try { await changePassword(cur, next); setMsg({ ok: true, t: 'Senha alterada. As outras sessões foram encerradas.' }); setCur(''); setNext(''); }
    catch (x) { setMsg({ ok: false, t: x instanceof Error ? x.message : 'Falha ao trocar a senha.' }); }
    finally { setBusy(false); }
  };
  return (
    <section aria-labelledby="pw-title" className="max-w-md space-y-4">
      <h2 id="pw-title" className="text-2xl font-semibold">Minha conta</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm"><dt className="text-slate-500">Nome</dt><dd>{user.name}</dd><dt className="text-slate-500">E-mail</dt><dd>{user.email}</dd><dt className="text-slate-500">Perfil</dt><dd>{user.roleLabel}</dd><dt className="text-slate-500">Equipe</dt><dd>{user.team || '—'}</dd></dl>
      <form onSubmit={submit} className="space-y-4 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <h3 className="text-base font-semibold">Trocar senha</h3>
        <PasswordInput id="acc-current" label="Senha atual" value={cur} onChange={setCur} autoComplete="current-password" />
        <PasswordInput id="acc-new" label="Nova senha" value={next} onChange={setNext} autoComplete="new-password" describedBy="acc-rules" />
        <p id="acc-rules" className="text-xs text-slate-400">Mínimo de 12 caracteres, com ao menos 3 tipos (minúscula, maiúscula, número, símbolo).</p>
        {msg && <p role={msg.ok ? 'status' : 'alert'} className={`rounded-md border px-3 py-2 text-sm ${msg.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'}`}>{msg.t}</p>}
        <div className="flex gap-3"><button type="submit" disabled={!valid || busy} className={`${primary} !w-auto`}>Salvar</button>
          <button type="button" onClick={onClose} className="rounded-md border border-[var(--color-line)] px-4 text-sm text-slate-300 hover:bg-[var(--color-surface-2)]">Voltar</button></div>
      </form>
    </section>
  );
}

/** Verificação PÚBLICA de selo (link ?verificar=ID): não exige login, só confirma a autenticidade do selo. */
function PublicSealCheck({ id }: Readonly<{ id: string }>) {
  const [state, setState] = useState<'loading' | 'invalid' | PublicSeal>('loading');
  useEffect(() => { verifyChampionSeal(id).then((s) => setState(s ?? 'invalid')).catch(() => setState('invalid')); }, [id]);
  return (
    <Shell title="Verificação de selo" subtitle={`Selo ${id.toUpperCase()}`}>
      {state === 'loading' && <p className="flex items-center gap-2 text-sm text-slate-400"><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Verificando…</p>}
      {state === 'invalid' && <p role="alert" className="flex gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />Selo não encontrado, removido ou com assinatura inválida.</p>}
      {typeof state === 'object' && (
        <div role="status" className="space-y-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <p className="flex items-center gap-2 font-semibold"><Check size={15} aria-hidden="true" /> Selo autêntico</p>
          <p>{state.name} · nível {TIERS.find((t) => t.id === state.tier)?.label ?? state.tier}</p>
          <p className="text-xs text-emerald-200/80">Emitido em {new Date(state.issuedAt).toLocaleDateString('pt-BR')}. Selo interno de conclusão de trilha, não é certificação profissional.</p>
        </div>)}
    </Shell>
  );
}

/**
 * Porta de entrada: exige sessão quando o servidor está em modo `required`. Após o login, sincroniza o progresso da conta
 * com o navegador e só então monta o app (os hooks leem o armazenamento no mount; `key` remonta ao trocar de usuário).
 */
export function AuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [ready, setReady] = useState(false);
  const [booting, setBooting] = useState(true);
  const [fatal, setFatal] = useState<string | null>(null);

  const enter = useCallback(async (user: SessionUser | null) => {
    if (user && !user.mustChange) { try { await syncProgressAfterLogin(); } catch { /* segue com o que houver */ } }
    setMe((m) => ({ mode: m?.mode ?? 'required', user })); setReady(true);
  }, []);

  useEffect(() => {
    let alive = true;
    fetchMe().then(async (r) => {
      if (!alive) return;
      setMe(r);
      if (r.user && !r.user.mustChange) { try { await syncProgressAfterLogin(); } catch { /* ignore */ } }
      if (alive) setReady(true);
    }).catch(() => { if (alive) setFatal('Não foi possível falar com o servidor. O backend (API :4000) está rodando?'); })
      .finally(() => { if (alive) setBooting(false); });
    return () => { alive = false; };
  }, []);

  const signOut = useCallback(async () => {
    try { await logout(); } catch { /* sessão já inválida */ }
    clearLocalProgress(); setReady(false); setMe((m) => ({ mode: m?.mode ?? 'required', user: null }));
  }, []);

  // sessão expirada no servidor (inatividade): qualquer 401 em /api/auth/me ao voltar à aba leva ao login
  useEffect(() => {
    if (!me?.user) return;
    const onVis = () => { if (document.visibilityState === 'visible') fetchMe().then((r) => { if (!r.user) { clearLocalProgress(); setReady(false); setMe(r); } }).catch(() => {}); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [me?.user]);

  const value = useMemo<SessionCtx>(() => ({ user: me?.user ?? null, mode: me?.mode ?? 'required', signOut }), [me, signOut]);

  const verifyId = new URLSearchParams(window.location.search).get('verificar');
  if (verifyId && !me?.user && !booting) return <PublicSealCheck id={verifyId} />;
  if (booting) return <div className="app-bg flex min-h-screen items-center justify-center gap-2 text-slate-400"><Loader2 className="animate-spin" aria-hidden="true" /> Carregando…</div>;
  if (fatal) return <div className="app-bg flex min-h-screen items-center justify-center px-4"><p role="alert" className="max-w-md rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-center text-rose-200">{fatal}</p></div>;
  if (me?.mode === 'required' && !me.user) return <LoginView onDone={(u) => { void enter(u); }} />;
  if (me?.user?.mustChange) return <ChangePasswordView user={me.user} onDone={(u) => { void enter(u); }} onCancel={() => { void signOut(); }} />;
  if (me?.mode === 'required' && !ready) return <div className="app-bg flex min-h-screen items-center justify-center gap-2 text-slate-400"><Loader2 className="animate-spin" aria-hidden="true" /> Carregando seu progresso…</div>;
  return <Ctx.Provider value={value}><React.Fragment key={me?.user?.id ?? 'anon'}>{children}</React.Fragment></Ctx.Provider>;
}
