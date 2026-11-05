import React from 'react';

/**
 * Renderizador de texto didático. Não altera o conteúdo: apenas dá hierarquia visual ao que
 * já está escrito nos labs.
 *  - abertura em MAIÚSCULAS ("O QUE É IDOR (…)?", "COMO EXPLORAR:") vira subtítulo;
 *  - passos "1) … 2) …" viram lista numerada;
 *  - caminhos (/users/{id}), JSON, IPs, CWE/CVE/A0X viram código inline;
 *  - palavras em MAIÚSCULAS viram ênfase (negrito), siglas permanecem como estão;
 *  - parágrafo "Referências:" vira uma linha de fontes.
 */

const ACRONYMS = new Set([
  'IDOR', 'IIFE', 'CRLF', 'SSRF', 'BOLA', 'OWASP', 'HTTP', 'HTTPS', 'JSON', 'HTML', 'JWT', 'SQL', 'SQLI', 'API', 'URL',
  'CWE', 'CVE', 'RCE', 'SOC', 'XSS', 'DAST', 'WAF', 'ORM', 'PII', 'TLS', 'CSS', 'DOS', 'AWS', 'CTF', 'XML', 'XXE', 'CSRF',
  'CORS', 'SHA', 'MD', 'HMAC', 'RSA', 'AES', 'JS', 'ID', 'IP', 'DNS', 'CPU', 'RAM', 'OTP', 'SSO', 'MFA',
  'ANPD', 'LGPD', 'RIPD', 'DPO', 'CPF', 'NDA', 'MPDFT', 'DOU', 'CGF', 'SES', 'TAC', 'TI', 'PF', 'UFF', 'ENAP', 'SUS',
]);
const SQL_WORDS = new Set(['UNION', 'SELECT', 'FROM', 'WHERE', 'ORDER', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'LIMIT', 'NULL']);

// Ordem importa: referências > caminhos > JSON > chave=valor > IP > ênfase em maiúsculas.
const INLINE = new RegExp([
  String.raw`(?<ref>\b(?:CVE-\d{4}-\d{4,}|CWE-\d+|A(?:0\d|10):2021|API\d{1,2}:\d{4})\b)`,
  String.raw`(?<path>(?<=^|[\s("'])\/[A-Za-z][\w\-.]*(?:\/(?:[\w\-.:]+|\{\w+\}))*)`,
  String.raw`(?<json>\{"[^}\n]*\})`,
  String.raw`(?<kv>\b[a-z_]{2,}=[A-Za-z0-9_\-]+)`,
  String.raw`(?<ip>\b\d{1,3}(?:\.\d{1,3}){3}\b)`,
  String.raw`(?<caps>(?<![\p{L}\d])\p{Lu}{3,}(?![\p{L}\d]))`,
].join('|'), 'gu');

const CODE = 'rounded border border-[var(--color-line)] bg-[var(--color-ink)] px-1.5 py-px font-mono text-[0.86em] text-[var(--color-offense-soft)]';
const REF = 'rounded border border-sky-400/30 bg-sky-400/10 px-1.5 py-px font-mono text-[0.82em] text-sky-300';

/** Ênfase e código inline, sem estrutura de bloco. */
export function Inline({ text }: Readonly<{ text: string }>) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const g = m.groups ?? {};
    const raw = m[0];
    const key = `${idx}-${n++}`;
    if (g.ref) out.push(<span key={key} className={REF}>{raw}</span>);
    else if (g.path || g.json || g.kv || g.ip || (g.caps && SQL_WORDS.has(raw))) out.push(<code key={key} className={CODE}>{raw}</code>);
    else if (g.caps && !ACRONYMS.has(raw)) out.push(<strong key={key} className="text-[0.94em] font-semibold tracking-wide text-slate-50">{raw}</strong>);
    else out.push(raw);
    last = idx + raw.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

const hasLetter = (t: string) => /\p{L}/u.test(t);
const isCaps = (t: string) => hasLetter(t) && !/\p{Ll}/u.test(t);
const isJoiner = (t: string) => /^[/&+\-–—]$/.test(t) || /^\d+(\.\d+)*$/.test(t); // número solto ("CLÁUSULA 6 PEDE?") não quebra o lead-in
const END = /[:?,]$/;

/** "O QUE É IDOR (Insecure Direct Object Reference)?" → { lead, sub, rest } */
function splitLead(p: string): { lead: string; sub?: string; runIn: boolean; rest: string } | null {
  const toks = [...p.matchAll(/\S+/g)].map((m) => ({ t: m[0], end: (m.index ?? 0) + m[0].length }));
  let i = 0;
  let caps = 0;
  while (i < toks.length && (isCaps(toks[i].t) || isJoiner(toks[i].t))) {
    if (!isJoiner(toks[i].t)) caps++;
    i++;
    if (END.test(toks[i - 1].t)) break;
  }
  if (caps < 2) return null;
  let leadEnd = toks[i - 1].end;
  let sub: string | undefined;
  let closed = END.test(toks[i - 1].t);
  // Parêntese explicativo logo após a abertura: "(Insecure Direct Object Reference)?"
  if (!closed && i < toks.length && toks[i].t.startsWith('(')) {
    const start = toks[i].end - toks[i].t.length;
    let j = i;
    while (j < toks.length && !toks[j].t.includes(')')) j++;
    if (j < toks.length) {
      sub = p.slice(start, toks[j].end);
      leadEnd = toks[j].end;
      closed = END.test(toks[j].t) || /\)[:?,]?$/.test(toks[j].t);
      i = j + 1;
      // pontuação logo depois do parêntese já está no token
    }
  }
  if (!closed) return null;
  const rawLead = p.slice(0, sub ? p.indexOf(sub) : leadEnd).trim();
  const tail = p.slice(leadEnd).trim();
  const endChar = (sub ?? rawLead).slice(-1);
  const clean = (s: string) => s.replace(/[:,]$/, '').trim();
  return { lead: clean(rawLead), sub: sub ? clean(sub) : undefined, runIn: endChar === ',', rest: tail };
}

function sentenceCase(s: string) {
  return s.split(/\s+/).map((w, i) => {
    const bare = w.replace(/[^\p{L}\d]/gu, '');
    const keep = ACRONYMS.has(bare) || /\d/.test(bare) || (bare.length <= 1 && w === '/');
    const lower = keep ? w : w.toLowerCase();
    return i === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
  }).join(' ');
}

/** Divide "intro 1) a; 2) b" em { intro, items }. Só aceita se for uma sequência 1,2,… */
function splitSteps(s: string): { intro: string; items: string[] } | null {
  const marks = [...s.matchAll(/(?:^|[\s(])\(?(\d)\)\s+/g)];
  if (marks.length < 2) return null;
  const nums = marks.map((m) => Number(m[1]));
  if (nums[0] !== 1 || nums.some((n, i) => n !== i + 1)) return null;
  const cuts = marks.map((m) => ({ start: m.index ?? 0, end: (m.index ?? 0) + m[0].length }));
  const intro = s.slice(0, cuts[0].start).trim();
  const items = cuts.map((c, i) => s.slice(c.end, cuts[i + 1]?.start ?? s.length).trim().replace(/[;,]\s*$/, ''));
  return { intro, items };
}

function Steps({ items }: Readonly<{ items: string[] }>) {
  return (
    <ol className="mt-2.5 space-y-2">
      {items.map((it, i) => (
        <li key={it} className="flex gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-[var(--color-line)] bg-[var(--color-ink)] font-mono text-[11px] font-semibold text-[var(--color-offense-soft)]">{i + 1}</span>
          <span className="min-w-0 flex-1"><Inline text={it} /></span>
        </li>
      ))}
    </ol>
  );
}

function Sources({ text }: Readonly<{ text: string }>) {
  const body = text.replace(/^Referências:\s*/, '').replace(/\s*Links na aba Referências\.?\s*$/, '').replace(/\.$/, '');
  const items = body.split(/\s·\s/).map((s) => s.trim()).filter(Boolean);
  return (
    <div className="border-t border-[var(--color-line-soft)] pt-3">
      <p className="mb-2 text-xs font-medium text-slate-500">Fontes · detalhes na aba Referências</p>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <li key={s} className="rounded border border-[var(--color-line)] bg-[var(--color-ink)]/60 px-2 py-1 font-mono text-xs leading-snug text-slate-400">{s}</li>
        ))}
      </ul>
    </div>
  );
}

/** Texto em blocos (separados por linha em branco). `accent` = classe de cor do subtítulo. */
export function RichText({ text, accent = 'text-[var(--color-offense-soft)]', className = '' }: Readonly<{ text: string; accent?: string; className?: string }>) {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={`max-w-[68ch] space-y-6 text-[15px] leading-[1.8] text-slate-300 ${className}`}>
      {paras.map((p) => {
        if (/^Referências:/.test(p)) return <Sources key={p} text={p} />;
        const head = splitLead(p);
        const body = head ? head.rest : p;
        const steps = splitSteps(body);
        const runInLead = head?.runIn ? (
          <strong className={`font-semibold ${accent}`}>{sentenceCase(head.lead)}, </strong>
        ) : null;
        return (
          <div key={p}>
            {head && !head.runIn && (
              <h4 className="mb-1.5 flex flex-wrap items-baseline gap-x-2 font-display text-base font-semibold text-slate-100">
                <span className={`mr-0.5 inline-block h-4 w-0.5 translate-y-0.5 rounded-full bg-current ${accent}`} aria-hidden="true" />
                {sentenceCase(head.lead)}
                {head.sub && <span className="text-sm font-normal text-slate-400">{head.sub}</span>}
              </h4>
            )}
            {steps ? (
              <>
                {steps.intro && <p><Inline text={steps.intro} /></p>}
                <Steps items={steps.items} />
              </>
            ) : (
              <p className="whitespace-pre-line">{runInLead}<Inline text={body} /></p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Parágrafo curto (objetivo, causa, impacto): ênfase, código inline e passos "(1) … (2) …" em lista. */
export function Prose({ text, className = '' }: Readonly<{ text: string; className?: string }>) {
  const base = `max-w-[68ch] text-[15px] leading-[1.75] text-slate-300 ${className}`;
  const steps = splitSteps(text);
  if (!steps) return <p className={base}><Inline text={text} /></p>;
  return (
    <div className={base}>
      {steps.intro && <p><Inline text={steps.intro} /></p>}
      <Steps items={steps.items} />
    </div>
  );
}
