import React, { memo, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Trophy, LayoutGrid, Lock, ShieldAlert, ShieldCheck, ListChecks, BadgeCheck, Bot, Award, LogOut, ChevronUp, UserCog } from 'lucide-react';
import type { Lab, PrivacyModule, AppArea } from '../types';
import type { TrailConfig } from '../trails';
import { OWASP_META, ProgressRing, byKillChainOrder } from './ui';

interface PrivacyNav {
  config: TrailConfig;
  modules: PrivacyModule[];
  doneIds: Set<string>;
  activeId: string | null;
  onSelect: (m: PrivacyModule | null) => void;
  /** Entrada extra da área (ex.: laboratório de prompts na trilha LLM). */
  lab?: { code?: string; label: string; caption?: string; solved?: number; total?: number; active: boolean; onOpen: () => void };
}

interface SidebarProps {
  area: AppArea;
  onArea: (a: AppArea) => void;
  labs: Lab[];
  solvedIds: Set<string>;
  activeId: string | null;
  totalPoints: number;
  maxPoints: number;
  onSelect: (lab: Lab | null) => void;
  privacy: PrivacyNav;
  /** Jornada Security Champion (selo). */
  champion?: { active: boolean; onOpen: () => void };
  onNavigate?: () => void; // fecha o drawer no mobile
  /** Conta autenticada: atalhos de conformidade por perfil, dados do usuário e saída. */
  account?: {
    name: string; roleLabel: string;
    items: { id: string; label: string; icon: React.ReactNode; active: boolean; onOpen: () => void }[];
    onAccount: () => void; accountActive: boolean; onLogout: () => void;
  };
}

const AREAS: { id: AppArea; label: string; icon: React.ReactNode }[] = [
  { id: 'seguranca', label: 'OWASP', icon: <ShieldAlert size={14} aria-hidden="true" /> },
  { id: 'privacidade', label: 'LGPD', icon: <ShieldCheck size={14} aria-hidden="true" /> },
  { id: 'cis', label: 'CIS', icon: <ListChecks size={14} aria-hidden="true" /> },
  { id: 'iso', label: 'ISO', icon: <BadgeCheck size={14} aria-hidden="true" /> },
  { id: 'llm', label: 'LLM', icon: <Bot size={14} aria-hidden="true" /> },
];

type Account = NonNullable<SidebarProps['account']>;

/** Conta no rodapé: uma linha (avatar, nome, perfil) que abre um menu com os atalhos de conformidade, a conta e a saída. */
function AccountMenu({ account, onNavigate }: Readonly<{ account: Account; onNavigate?: () => void }>) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstItem = useRef<HTMLButtonElement>(null);
  const activeInside = account.accountActive || account.items.some((i) => i.active);

  useEffect(() => {
    if (!open) return;
    firstItem.current?.focus();
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); e.stopPropagation(); } };
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const run = (fn: () => void) => () => { setOpen(false); fn(); onNavigate?.(); };
  const item = 'flex min-h-10 w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-offense)]';
  const entries = [...account.items, { id: 'account', label: 'Minha conta', icon: <UserCog size={15} aria-hidden="true" />, active: account.accountActive, onOpen: account.onAccount }];

  return (
    <div ref={root} className="relative border-t border-[var(--color-line)] p-2">
      {open && (
        <div role="menu" aria-label="Conta e conformidade"
          className="absolute inset-x-2 bottom-full z-30 mb-1 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-1 shadow-2xl shadow-black/50">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold text-slate-500">Conformidade</p>
          {entries.map((it, i) => (
            <button key={it.id} role="menuitem" ref={i === 0 ? firstItem : undefined} onClick={run(it.onOpen)} aria-current={it.active ? 'page' : undefined}
              className={`${item} ${it.active ? 'bg-[var(--color-offense)]/15 text-slate-100' : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'}`}>
              <span className={it.active ? 'text-[var(--color-offense)]' : 'text-slate-400'}>{it.icon}</span>{it.label}
            </button>
          ))}
          <div className="my-1 border-t border-[var(--color-line)]" role="separator" />
          <button role="menuitem" onClick={run(account.onLogout)} className={`${item} text-slate-300 hover:bg-rose-500/10 hover:text-rose-200`}>
            <LogOut size={15} aria-hidden="true" className="text-slate-400" />Sair da conta
          </button>
        </div>
      )}
      <button ref={trigger} onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={`Conta de ${account.name}: abrir menu`}
        className={`flex min-h-12 w-full items-center gap-2.5 rounded-lg px-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-offense)] ${
          open || activeInside ? 'bg-[var(--color-surface-2)]' : 'hover:bg-[var(--color-surface-2)]/60'}`}>
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-offense)]/20 text-[13px] font-bold text-[var(--color-offense-soft)]">{account.name.trim().charAt(0).toUpperCase()}</span>
        <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-slate-100">{account.name}</span><span className="block truncate text-[11px] text-slate-400">{account.roleLabel}</span></span>
        <ChevronUp size={15} aria-hidden="true" className={`shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}

/** Navegação persistente estilo workbench: marca, seletor de área, progresso e lista da área ativa. */
export const Sidebar = memo(function Sidebar({ area, onArea, labs, solvedIds, activeId, totalPoints, maxPoints, onSelect, privacy, champion, onNavigate, account }: Readonly<SidebarProps>) {
  const ordered = byKillChainOrder(labs);
  const go = (lab: Lab | null) => { onSelect(lab); onNavigate?.(); };
  const goPrivacy = (m: PrivacyModule | null) => { privacy.onSelect(m); onNavigate?.(); };
  const isPrivacy = area !== 'seguranca';

  return (
    <nav aria-label="Navegação" className="flex h-full flex-col bg-[var(--color-surface)]">
      {/* Marca */}
      <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
        <img src="/brand/cybershield-mark.svg" alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />
        <div className="min-w-0">
          <h1 className="truncate text-[13px] font-semibold leading-tight">CyberShield</h1>
          <p className="truncate text-[10.5px] leading-tight text-slate-400">DevSec Academy</p>
        </div>
      </div>

      {champion && (
        <button onClick={() => { champion.onOpen(); onNavigate?.(); }} aria-current={champion.active ? 'page' : undefined}
          className={`mx-3 mt-3 flex min-h-11 items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-offense)] ${
            champion.active ? 'border-[var(--color-offense)]/60 bg-[var(--color-offense)]/10 text-slate-100' : 'border-[var(--color-line)] text-slate-200 hover:bg-[var(--color-surface-2)]/60'}`}>
          <Award size={16} className="shrink-0 text-[var(--color-offense)]" aria-hidden="true" /> Jornada Security Champion
        </button>
      )}

      {/* Seletor de área */}
      <div role="group" aria-label="Área de treinamento" className="mx-3 mt-3 grid grid-cols-5 rounded-md border border-[var(--color-line)] p-0.5">
        {AREAS.map((a) => (
          <button key={a.id} onClick={() => onArea(a.id)} aria-pressed={!champion?.active && area === a.id}
            className={`flex min-h-9 min-w-0 items-center justify-center gap-1 rounded px-1 text-[11px] font-medium transition-colors ${
              !champion?.active && area === a.id ? 'bg-[var(--color-surface-2)] text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {/* Progresso */}
      <div className="mt-3 flex items-center gap-3 border-y border-[var(--color-line)] px-4 py-3">
        {isPrivacy ? (
          <>
            <ProgressRing value={privacy.doneIds.size} max={privacy.modules.length || 8} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100">{privacy.doneIds.size}<span className="text-slate-500">/{privacy.modules.length || 8} {privacy.config.unitPlural}</span></p>
              <p className="mt-0.5 text-[11px] text-slate-400">{privacy.config.progressLabel}</p>
            </div>
          </>
        ) : (
          <>
            <ProgressRing value={solvedIds.size} max={labs.length || 11} />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
                <Trophy size={14} className="text-amber-400" aria-hidden="true" /> {totalPoints}<span className="text-slate-500">/{maxPoints} pts</span>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">OWASP Top 10 · 2025</p>
            </div>
          </>
        )}
      </div>

      {/* Overview / dashboard */}
      <button onClick={() => (isPrivacy ? goPrivacy(null) : go(null))}
        aria-current={(isPrivacy ? privacy.activeId : activeId) === null ? 'page' : undefined}
        className={`mx-2 mt-2 flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          (isPrivacy ? privacy.activeId : activeId) === null ? 'bg-[var(--color-surface-2)] text-slate-100' : 'text-slate-400 hover:bg-[var(--color-surface-2)]/60 hover:text-slate-200'}`}>
        <LayoutGrid size={16} aria-hidden="true" /> {isPrivacy ? 'Visão da trilha' : 'Visão geral'}
      </button>

      {/* Lista da área ativa */}
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-500">
          {isPrivacy ? `${privacy.config.unitPlural.charAt(0).toUpperCase()}${privacy.config.unitPlural.slice(1)} (ordem sugerida)` : 'Laboratórios (ordem de exploração)'}
        </p>
        <ul className="space-y-0.5">
          {isPrivacy
            ? [...privacy.modules.map((m) => {
              const done = privacy.doneIds.has(m.id);
              const active = m.id === privacy.activeId;
              return (
                <li key={m.id}>
                  <button onClick={() => goPrivacy(m)} aria-current={active ? 'page' : undefined}
                    className={`group flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left transition-colors ${
                      active ? 'bg-[var(--color-surface-2)]' : 'hover:bg-[var(--color-surface-2)]/60'}`}>
                    <span className="flex w-10 shrink-0 items-center gap-2">
                      <span className={`h-5 w-0.5 rounded-full ${privacy.config.bar}`} aria-hidden="true" />
                      <span className={`font-mono text-xs font-semibold ${active ? 'text-slate-100' : 'text-slate-400'}`}>{m.code ?? privacy.config.codePrefix + String(m.order).padStart(2, '0')}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[13px] font-medium ${active ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100'}`}>{m.title}</span>
                      <span className="block truncate text-[10.5px] text-slate-500">{m.minutes} min</span>
                    </span>
                    {done
                      ? <CheckCircle2 size={15} className="shrink-0 text-[var(--color-defense)]" aria-label="Concluído" />
                      : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" aria-label="Pendente" />}
                  </button>
                </li>
              );
            }),
              ...(privacy.lab ? [(() => {
                const lab = privacy.lab;
                const finished = Boolean(lab.total) && (lab.solved ?? 0) >= (lab.total ?? 0);
                return (
                  <li key="final-lab">
                    <button onClick={() => { lab.onOpen(); onNavigate?.(); }} aria-current={lab.active ? 'page' : undefined}
                      className={`group flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left transition-colors ${
                        lab.active ? 'bg-[var(--color-surface-2)]' : 'hover:bg-[var(--color-surface-2)]/60'}`}>
                      <span className="flex w-10 shrink-0 items-center gap-2">
                        <span className={`h-5 w-0.5 rounded-full ${privacy.config.bar}`} aria-hidden="true" />
                        <span className={`font-mono text-xs font-semibold ${lab.active ? 'text-slate-100' : 'text-slate-400'}`}>{lab.code ?? 'LF'}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[13px] font-medium ${lab.active ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100'}`}>{lab.label}</span>
                        <span className="block truncate text-[10.5px] text-slate-500">{lab.caption}</span>
                      </span>
                      {finished
                        ? <CheckCircle2 size={15} className="shrink-0 text-[var(--color-defense)]" aria-label="Concluído" />
                        : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" aria-label="Pendente" />}
                    </button>
                  </li>
                );
              })()] : [])]
            : ordered.map((lab) => {
              const done = solvedIds.has(lab.id);
              const active = lab.id === activeId;
              const meta = OWASP_META[lab.owaspId];
              return (
                <li key={lab.id}>
                  <button onClick={() => go(lab)}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left transition-colors ${
                      active ? 'bg-[var(--color-surface-2)]' : 'hover:bg-[var(--color-surface-2)]/60'}`}>
                    <span className="flex w-10 shrink-0 items-center gap-2">
                      <span className={`h-5 w-0.5 rounded-full ${meta.accent}`} aria-hidden="true" />
                      <span className={`font-mono text-xs font-semibold ${active ? 'text-slate-100' : 'text-slate-400'}`}>{lab.owaspId}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[13px] font-medium ${active ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100'}`}>{lab.title}</span>
                      <span className="block truncate text-[10.5px] text-slate-500">{lab.owaspTitle}</span>
                    </span>
                    {done
                      ? <CheckCircle2 size={15} className="shrink-0 text-[var(--color-defense)]" aria-label="Resolvido" />
                      : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" aria-label="Não resolvido" />}
                  </button>
                </li>
              );
            })}
        </ul>
      </div>

      {account && <AccountMenu account={account} onNavigate={onNavigate} />}

      {!account && <div className="border-t border-[var(--color-line)] px-4 py-2.5 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Lock size={11} aria-hidden="true" /> {isPrivacy ? privacy.config.sidebarFoot : 'Treino local · backend vulnerável'}
        </span>
      </div>}
    </nav>
  );
});
