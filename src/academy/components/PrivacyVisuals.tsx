import React from 'react';
import {
  Archive, Bot, Building2, Database, Eye, FileSpreadsheet, FileText, Fingerprint, Flag, HeartPulse, Image as ImageIcon,
  Inbox, Landmark, Lock, Mail, Megaphone, MessageSquare, Minimize2, Paperclip, Play, Reply, Scale, Search, Send, Share2,
  ShieldCheck, Siren, Target, Trash2, User, UserCheck, Wrench, AlertTriangle, ArrowRight, ArrowDown,
} from 'lucide-react';
import type { DiagramKind, ScenarioVisual } from '../types';

/* ───────────────────────── Artefatos dos cenários (fictícios) ───────────────────────── */

function Window({ title, children, note }: Readonly<{ title: string; children: React.ReactNode; note?: string }>) {
  return (
    <figure className="overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-ink)]">
      <figcaption className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5">
        <span className="flex gap-1" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-rose-400/70" /><span className="h-2 w-2 rounded-full bg-amber-400/70" /><span className="h-2 w-2 rounded-full bg-emerald-400/70" />
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-400">{title}</span>
        <span className="rounded border border-[var(--color-line)] px-1.5 py-px text-[10px] text-slate-500">Exemplo fictício</span>
      </figcaption>
      <div>{children}</div>
      {note && <p className="border-t border-[var(--color-line)] px-3 py-2 text-xs text-slate-400">{note}</p>}
    </figure>
  );
}

function Row({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex gap-3 border-b border-[var(--color-line-soft)] px-3 py-1.5 text-[13px]">
      <span className="w-14 shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 break-words text-slate-200">{children}</span>
    </div>
  );
}

export function ScenarioVisualView({ visual }: Readonly<{ visual: ScenarioVisual }>) {
  switch (visual.kind) {
    case 'email':
      return (
        <Window title={`E-mail · ${visual.subject}`}>
          <Row label="De">{visual.from}</Row>
          <Row label="Para">{visual.to}</Row>
          <Row label="Assunto"><strong className="font-semibold">{visual.subject}</strong></Row>
          {visual.attachments && (
            <div className="flex flex-wrap gap-2 border-b border-[var(--color-line-soft)] px-3 py-2">
              {visual.attachments.map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5 rounded border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 font-mono text-xs text-slate-300">
                  <Paperclip size={12} aria-hidden="true" /> {a}
                </span>
              ))}
            </div>
          )}
          <div className="space-y-2 px-3 py-3 text-sm leading-relaxed text-slate-300">
            {visual.body.map((p) => <p key={p}>{p}</p>)}
          </div>
          {visual.flag && (
            <p className="flex items-center gap-2 border-t border-rose-400/30 bg-rose-400/5 px-3 py-2 text-xs text-rose-300">
              <AlertTriangle size={13} aria-hidden="true" /> {visual.flag}
            </p>
          )}
        </Window>
      );
    case 'sheet':
      return (
        <Window title={visual.title} note={visual.note}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="bg-[var(--color-surface)]">
                  <th scope="col" className="w-8 border-b border-r border-[var(--color-line)] px-2 py-1.5 text-center font-mono text-xs text-slate-600"><FileSpreadsheet size={12} className="mx-auto" aria-hidden="true" /></th>
                  {visual.columns.map((c) => <th key={c} scope="col" className="border-b border-r border-[var(--color-line)] px-3 py-1.5 font-semibold text-slate-200">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {visual.rows.map((r, i) => (
                  <tr key={r.join('|')} className="odd:bg-white/[0.015]">
                    <th scope="row" className="border-b border-r border-[var(--color-line-soft)] px-2 py-1.5 text-center font-mono text-xs font-normal text-slate-600">{i + 1}</th>
                    {r.map((c, j) => <td key={`${i}-${visual.columns[j]}`} className="border-b border-r border-[var(--color-line-soft)] px-3 py-1.5 font-mono text-xs text-slate-300">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Window>
      );
    case 'chat':
      return (
        <Window title={visual.channel}>
          <div className="space-y-3 px-3 py-3">
            {visual.messages.map((m) => (
              <div key={m.text} className="flex gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--color-surface-2)] text-xs font-semibold text-slate-300" aria-hidden="true">{m.who.charAt(0)}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-400">{m.who}</p>
                  <p className="text-sm leading-relaxed text-slate-200">{m.text}</p>
                  {m.attachment && (
                    <p className="mt-1.5 inline-flex items-center gap-2 rounded border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-slate-300">
                      <ImageIcon size={14} className="shrink-0 text-sky-400" aria-hidden="true" /> {m.attachment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Window>
      );
    case 'form':
      return (
        <Window title={visual.title} note={visual.note}>
          <div className="grid gap-3 px-3 py-3 sm:grid-cols-2">
            {visual.fields.map((f) => (
              <div key={f.label}>
                <p className="mb-1 text-xs text-slate-400">{f.label}{f.required && <span className="ml-0.5 text-rose-400" aria-label="obrigatório">*</span>}</p>
                <div className="h-8 rounded border border-[var(--color-line)] bg-[var(--color-surface)]" aria-hidden="true" />
              </div>
            ))}
          </div>
        </Window>
      );
    default:
      return (
        <Window title={visual.title} note={visual.note}>
          <pre className="overflow-x-auto px-3 py-3 font-mono text-xs leading-relaxed text-slate-300">{visual.lines.join('\n')}</pre>
        </Window>
      );
  }
}

/* ───────────────────────── Diagramas por módulo ───────────────────────── */

interface FlowStep { icon: React.ReactNode; title: string; text: string; you?: boolean }

function Flow({ steps, caption }: Readonly<{ steps: FlowStep[]; caption?: string }>) {
  return (
    <div>
      <ol className="grid gap-2 md:grid-flow-col md:auto-cols-fr">
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex md:block">
            <div className={`flex-1 rounded-md border p-3 ${s.you ? 'border-[var(--color-offense)]/50 bg-[var(--color-offense)]/5' : 'border-[var(--color-line)] bg-[var(--color-ink)]/40'}`}>
              <div className="mb-1.5 flex items-center gap-2">
                <span className={`grid h-7 w-7 place-items-center rounded ${s.you ? 'bg-[var(--color-offense)] text-slate-950' : 'bg-[var(--color-surface-2)] text-slate-300'}`} aria-hidden="true">{s.icon}</span>
                {s.you && <span className="text-[11px] font-semibold text-[var(--color-offense-soft)]">Seu papel</span>}
              </div>
              <p className="text-sm font-semibold text-slate-100">{s.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{s.text}</p>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight size={14} className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-[var(--color-surface)] text-slate-500 md:block" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
      {caption && <p className="mt-2 text-xs text-slate-500">{caption}</p>}
    </div>
  );
}

const I = 15;

function Chips({ items, tone }: Readonly<{ items: string[]; tone: 'info' | 'warn' }>) {
  const cls = tone === 'warn' ? 'border-amber-400/40 bg-amber-400/10 text-amber-200' : 'border-sky-400/30 bg-sky-400/10 text-sky-200';
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => <li key={t} className={`rounded border px-2 py-1 text-xs ${cls}`}>{t}</li>)}
    </ul>
  );
}

function DataMap() {
  return (
    <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
      <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-ink)]/40 p-3">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100"><Fingerprint size={I} className="text-sky-400" aria-hidden="true" /> Dado pessoal</p>
        <p className="mb-2 text-xs text-slate-400">Identifica alguém, sozinho ou combinado com outro dado.</p>
        <Chips tone="info" items={['Nome', 'CPF', 'E-mail', 'Telefone', 'Endereço', 'IP', 'ID de usuário', 'Cargo + nome']} />
      </div>
      <div className="grid place-items-center">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-2)] text-slate-300" aria-label="Pessoa">
          <User size={20} aria-hidden="true" />
        </span>
      </div>
      <div className="rounded-md border border-amber-400/30 bg-amber-400/5 p-3">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100"><HeartPulse size={I} className="text-amber-400" aria-hidden="true" /> Dado sensível</p>
        <p className="mb-2 text-xs text-slate-400">Pede cuidado reforçado: o uso indevido pode discriminar.</p>
        <Chips tone="warn" items={['Saúde', 'Biometria', 'Dado genético', 'Origem racial ou étnica', 'Religião', 'Opinião política', 'Filiação sindical', 'Vida sexual']} />
      </div>
    </div>
  );
}

function LeakMap() {
  const items = [
    { icon: <Mail size={I} />, t: 'E-mail', risk: 'Destinatário errado, anexo sem proteção.', care: 'Confira os endereços; envie só o necessário.' },
    { icon: <MessageSquare size={I} />, t: 'Chat', risk: 'Grupo amplo, mensagem encaminhada.', care: 'Compartilhe só com quem precisa.' },
    { icon: <FileSpreadsheet size={I} />, t: 'Planilha', risk: 'Pasta aberta, cópia "para testes".', care: 'Acesso restrito; dados fictícios em teste.' },
    { icon: <ImageIcon size={I} />, t: 'Print de tela', risk: 'Mostra mais do que o necessário.', care: 'Mascare dados pessoais antes.' },
    { icon: <Bot size={I} />, t: 'Ferramenta de IA', risk: 'Dado enviado a serviço externo.', care: 'Anonimize ou use ferramenta aprovada.' },
  ];
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((it) => (
        <li key={it.t} className="rounded-md border border-[var(--color-line)] bg-[var(--color-ink)]/40 p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100"><span className="text-sky-400" aria-hidden="true">{it.icon}</span>{it.t}</p>
          <p className="text-xs leading-relaxed text-rose-300/90"><span className="font-semibold">Risco:</span> {it.risk}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-emerald-300/90"><span className="font-semibold">Cuidado:</span> {it.care}</p>
        </li>
      ))}
    </ul>
  );
}

function RoleCard({ icon, title, text, accent }: Readonly<{ icon: React.ReactNode; title: string; text: string; accent?: boolean }>) {
  return (
    <div className={`rounded-md border p-3 ${accent ? 'border-sky-400/40 bg-sky-400/5' : 'border-[var(--color-line)] bg-[var(--color-ink)]/40'}`}>
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-100"><span className="text-sky-400" aria-hidden="true">{icon}</span>{title}</p>
      <p className="text-xs leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}

function Roles() {
  const Arrow = ({ label }: { label: string }) => (
    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500" aria-hidden="true">
      <span className="hidden sm:inline">{label}</span><ArrowRight size={14} className="hidden sm:block" /><ArrowDown size={14} className="sm:hidden" />
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <RoleCard icon={<User size={I} />} title="Titular" text="A pessoa a quem os dados se referem." />
        <Arrow label="dados de" />
        <RoleCard icon={<Building2 size={I} />} title="Controlador" text="Decide as finalidades e os meios do tratamento." accent />
        <Arrow label="instrui" />
        <RoleCard icon={<Wrench size={I} />} title="Operador" text="Trata os dados em nome do controlador, seguindo as instruções." accent />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <RoleCard icon={<UserCheck size={I} />} title="Encarregado" text="Canal de comunicação entre o controlador, os titulares e a ANPD." />
        <RoleCard icon={<Landmark size={I} />} title="ANPD" text="Autoridade que orienta, fiscaliza e pode aplicar sanções." />
      </div>
    </div>
  );
}

export function ModuleDiagram({ kind }: Readonly<{ kind: DiagramKind }>) {
  switch (kind) {
    case 'data-map': return <DataMap />;
    case 'leak-map': return <LeakMap />;
    case 'roles': return <Roles />;
    case 'three-gates':
      return (
        <Flow caption="Se uma das três perguntas não fecha, pare e consulte Privacidade." steps={[
          { icon: <Target size={I} />, title: 'Finalidade', text: 'Para quê vou usar este dado?', you: true },
          { icon: <Minimize2 size={I} />, title: 'Necessidade', text: 'Preciso só do mínimo para isso?', you: true },
          { icon: <Scale size={I} />, title: 'Base legal', text: 'Qual justificativa permite este uso?', you: true },
          { icon: <ShieldCheck size={I} />, title: 'Pode tratar', text: 'Com segurança e transparência.' },
        ]} />
      );
    case 'rights-flow':
      return (
        <Flow caption="Você não responde sozinho: reconhecer e encaminhar é o que resolve." steps={[
          { icon: <Inbox size={I} />, title: 'Recebe o pedido', text: 'Por e-mail, chat ou telefone.', you: true },
          { icon: <FileText size={I} />, title: 'Registra', text: 'Anota quem pediu e o quê.', you: true },
          { icon: <Send size={I} />, title: 'Encaminha', text: 'Ao canal de privacidade, sem demora.', you: true },
          { icon: <Search size={I} />, title: 'Valida e busca', text: 'Confirma identidade e localiza os dados.' },
          { icon: <Reply size={I} />, title: 'Responde', text: 'No padrão e prazo definidos pela empresa.' },
        ]} />
      );
    case 'incident-timeline':
      return (
        <Flow caption="A decisão de comunicar à ANPD e aos titulares é do controlador e considera risco ou dano relevante." steps={[
          { icon: <Eye size={I} />, title: 'Perceber', text: 'Algo saiu do esperado com dados pessoais.', you: true },
          { icon: <Siren size={I} />, title: 'Reportar já', text: 'Segurança e encarregado, com o que sabe.', you: true },
          { icon: <Search size={I} />, title: 'Avaliar', text: 'Quais dados, quantas pessoas, que risco.' },
          { icon: <Megaphone size={I} />, title: 'Comunicar', text: 'ANPD e titulares, se houver risco ou dano relevante.' },
          { icon: <Wrench size={I} />, title: 'Corrigir', text: 'Conter, remediar e prevenir.' },
        ]} />
      );
    case 'sharing-gates':
      return (
        <Flow caption="NDA protege sigilo; não substitui o contrato sobre como o dado pessoal será tratado." steps={[
          { icon: <Building2 size={I} />, title: 'Dado na empresa', text: 'Coletado para uma finalidade.' },
          { icon: <Minimize2 size={I} />, title: 'Mínimo necessário', text: 'Só os campos que o outro lado precisa.', you: true },
          { icon: <Lock size={I} />, title: 'Canal seguro', text: 'Ferramenta aprovada, nada de app pessoal.', you: true },
          { icon: <FileText size={I} />, title: 'Contrato', text: 'Cláusulas de proteção de dados.', you: true },
          { icon: <Share2 size={I} />, title: 'Terceiro', text: 'Recebe com limites definidos.' },
        ]} />
      );
    case 'lifecycle':
      return (
        <Flow caption="Em cada etapa, as mesmas perguntas: precisa? quem acessa? por quanto tempo?" steps={[
          { icon: <Play size={I} />, title: 'Coletar', text: 'Só o necessário.', you: true },
          { icon: <Database size={I} />, title: 'Usar', text: 'Dentro da finalidade informada.', you: true },
          { icon: <Archive size={I} />, title: 'Guardar', text: 'Acesso mínimo e prazo definido.', you: true },
          { icon: <Share2 size={I} />, title: 'Compartilhar', text: 'Com contrato e canal seguro.' },
          { icon: <Trash2 size={I} />, title: 'Eliminar', text: 'Quando a finalidade acaba.' },
        ]} />
      );
    default:
      return <Flag size={I} aria-hidden="true" />;
  }
}
