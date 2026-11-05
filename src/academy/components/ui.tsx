import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Lab } from '../types';

/**
 * Ordena pela ordem REAL de exploração (killChain.step), não pelo número OWASP.
 * Alguns labs exigem tecnicamente um achado de um lab posterior na numeração OWASP
 * (ex.: A08 exige a chave roubada no lab de SSRF, que na edição 2025 é parte do A01) — navegar por A01..A10 faria o aluno
 * travar numa dependência que ainda não existe. Usado em Sidebar, LabCatalog e no
 * "Continuar" do Dashboard para que a navegação siga sempre a ordem resolvível.
 */
export function byKillChainOrder(labs: Lab[]): Lab[] {
  return [...labs].sort((a, b) => (a.killChain?.step ?? 99) - (b.killChain?.step ?? 99));
}

// Paleta por categoria OWASP (consistente em todo o app).
// `accent` é usado apenas como filete/marcador: a cor identifica a categoria, não preenche blocos.
export const OWASP_META: Record<string, { label: string; accent: string; ring: string; text: string }> = {
  A01: { label: 'Broken Access Control', accent: 'bg-pink-500', ring: 'ring-pink-500/30', text: 'text-pink-300' },
  A02: { label: 'Security Misconfiguration', accent: 'bg-orange-500', ring: 'ring-orange-500/30', text: 'text-orange-300' },
  A03: { label: 'Supply Chain Failures', accent: 'bg-yellow-500', ring: 'ring-yellow-500/30', text: 'text-yellow-300' },
  A04: { label: 'Cryptographic Failures', accent: 'bg-amber-500', ring: 'ring-amber-500/30', text: 'text-amber-300' },
  A05: { label: 'Injection', accent: 'bg-red-500', ring: 'ring-red-500/30', text: 'text-red-300' },
  A06: { label: 'Insecure Design', accent: 'bg-fuchsia-500', ring: 'ring-fuchsia-500/30', text: 'text-fuchsia-300' },
  A07: { label: 'Authentication Failures', accent: 'bg-sky-500', ring: 'ring-sky-500/30', text: 'text-sky-300' },
  A08: { label: 'Integrity Failures', accent: 'bg-violet-500', ring: 'ring-violet-500/30', text: 'text-violet-300' },
  A09: { label: 'Logging & Alerting', accent: 'bg-teal-500', ring: 'ring-teal-500/30', text: 'text-teal-300' },
  A10: { label: 'Exceptional Conditions', accent: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-300' },
};

export const DIFFICULTY_COLOR: Record<string, string> = {
  Iniciante: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  Intermediario: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  Avancado: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
};

/** Anel de progresso circular (SVG), acessível. */
export function ProgressRing({ value, max, size = 56, stroke = 5 }: { value: number; max: number; size?: number; stroke?: number }) {
  const pct = max > 0 ? value / max : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" role="img" aria-label={`${value} de ${max} laboratórios concluídos`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-defense)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <span className="absolute text-xs font-bold text-slate-100">{value}<span className="text-slate-500">/{max}</span></span>
    </div>
  );
}

/** Rótulo compacto (raio de 4px, sem pílula): é metadado, não botão. */
export function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export type Tone = 'neutral' | 'info' | 'warn' | 'offense' | 'defense';
const TONE_DOT: Record<Tone, string> = {
  neutral: 'bg-slate-500',
  info: 'bg-sky-400',
  warn: 'bg-amber-400',
  offense: 'bg-rose-400',
  defense: 'bg-[var(--color-defense)]',
};

/** Painel padrão das telas de laboratório: hairline, raio 6px, título com marcador semântico. */
export function Panel({ title, tone = 'neutral', icon, aside, children, className = '' }: {
  title?: string; tone?: Tone; icon?: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`surface-lit rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-line-soft)] px-4 py-2.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            {icon ?? <span className={`h-2 w-2 rounded-full ${TONE_DOT[tone]}`} aria-hidden="true" />}{title}
          </h3>
          {aside && <span className="text-xs text-slate-500">{aside}</span>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function CodeBlock({ code, language, label, tone = 'neutral' }: { code: string; language?: string; label?: string; tone?: Tone }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { /* clipboard indisponivel */ }
  };
  return (
    <div className="overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-ink)]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1">
        <span className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className={`h-2 w-2 rounded-full ${TONE_DOT[tone]}`} aria-hidden="true" />{label ?? language ?? 'code'}
        </span>
        <button onClick={copy} aria-label={copied ? 'Código copiado' : 'Copiar código'}
          className="flex min-h-8 items-center gap-1.5 rounded px-2 text-xs text-slate-400 transition-colors hover:bg-[var(--color-surface-2)] hover:text-slate-100">
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          <span aria-live="polite">{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed" tabIndex={0}>
        <code className="whitespace-pre font-mono text-slate-200">{code}</code>
      </pre>
    </div>
  );
}
