import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Lab } from '../types';

/**
 * Ordena pela ordem REAL de exploração (killChain.step), não pelo número OWASP.
 * Alguns labs exigem tecnicamente um achado de um lab posterior na numeração OWASP
 * (ex.: A08 exige a chave roubada no A10) — navegar por A01..A10 faria o aluno
 * travar numa dependência que ainda não existe. Usado em Sidebar, LabCatalog e no
 * "Continuar" do Dashboard para que a navegação siga sempre a ordem resolvível.
 */
export function byKillChainOrder(labs: Lab[]): Lab[] {
  return [...labs].sort((a, b) => (a.killChain?.step ?? 99) - (b.killChain?.step ?? 99));
}

// Paleta por categoria OWASP (consistente em todo o app).
export const OWASP_META: Record<string, { label: string; accent: string; ring: string; text: string }> = {
  A01: { label: 'Broken Access Control', accent: 'bg-rose-500', ring: 'ring-rose-500/30', text: 'text-rose-300' },
  A02: { label: 'Cryptographic Failures', accent: 'bg-amber-500', ring: 'ring-amber-500/30', text: 'text-amber-300' },
  A03: { label: 'Injection', accent: 'bg-red-500', ring: 'ring-red-500/30', text: 'text-red-300' },
  A04: { label: 'Insecure Design', accent: 'bg-fuchsia-500', ring: 'ring-fuchsia-500/30', text: 'text-fuchsia-300' },
  A05: { label: 'Security Misconfiguration', accent: 'bg-orange-500', ring: 'ring-orange-500/30', text: 'text-orange-300' },
  A06: { label: 'Vulnerable Components', accent: 'bg-yellow-500', ring: 'ring-yellow-500/30', text: 'text-yellow-300' },
  A07: { label: 'Auth Failures', accent: 'bg-sky-500', ring: 'ring-sky-500/30', text: 'text-sky-300' },
  A08: { label: 'Integrity Failures', accent: 'bg-violet-500', ring: 'ring-violet-500/30', text: 'text-violet-300' },
  A09: { label: 'Logging & Monitoring', accent: 'bg-teal-500', ring: 'ring-teal-500/30', text: 'text-teal-300' },
  A10: { label: 'SSRF', accent: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-300' },
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

export function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function CodeBlock({ code, language, label }: { code: string; language?: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { /* clipboard indisponivel */ }
  };
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 bg-slate-900/60">
        <span className="font-mono text-[11px] text-slate-400">{label ?? language ?? 'code'}</span>
        <button onClick={copy} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300 transition-colors">
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'copiado' : 'copiar'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[12.5px] leading-relaxed">
        <code className="font-mono text-slate-200 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
