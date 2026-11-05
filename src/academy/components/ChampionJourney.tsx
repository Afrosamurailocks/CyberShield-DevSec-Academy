import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, BadgeCheck, Download, Info, Loader2, Lock, Printer, RefreshCw, SearchCheck, ShieldCheck, ShieldX, Trash2 } from 'lucide-react';
import type { AppArea } from '../types';
import {
  fetchChampionMe, issueChampionSeal, verifyChampionSeal, removeChampionSeal, eraseChampionData,
  type ChampionMe,
} from '../api';
import { TIERS, TRACK_META, evaluate, cleanName, type PublicSeal, type TrackInput, type TrackStatus } from '../champion';
import { cardSvg, sealSvg, svgDataUrl, svgToPng } from '../championSvg';

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-offense)]';
const BTN = `inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors ${FOCUS}`;
const tierRank = (id: string) => TIERS.findIndex((t) => t.id === id);
const tierLabel = (id: string) => TIERS.find((t) => t.id === id)?.label ?? id;
const fmtDate = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR'); };

/** Jornada Security Champion: rota das trilhas, critérios, emissão e verificação do selo (registrado e assinado no servidor). */
export function ChampionJourney({ onNavigate }: Readonly<{ onNavigate: (area: AppArea, opts?: { lab?: boolean }) => void }>) {
  const [me, setMe] = useState<ChampionMe | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<string | undefined>();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [verifyId, setVerifyId] = useState(() => new URLSearchParams(window.location.search).get('verificar') ?? '');
  const [verified, setVerified] = useState<{ ok: boolean; seal?: PublicSeal } | null>(null);

  const refresh = useCallback(() => {
    fetchChampionMe().then((m) => { setMe(m); setLoadErr(null); if (m.seal) setName((n) => n || m.seal!.name); })
      .catch(() => setLoadErr('Não foi possível carregar o seu progresso. O backend (API :4000) está rodando?'));
  }, []);

  useEffect(() => {
    let alive = true;
    refresh();
    fetch('/brand/cybershield-mark.png').then((r) => r.blob()).then((b) => new Promise<string>((res, rej) => {
      const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = rej; fr.readAsDataURL(b);
    })).then((u) => { if (alive) setLogo(u); }).catch(() => { /* sem logo: usa texto */ });
    return () => { alive = false; };
  }, [refresh]);

  const tracks: TrackInput[] = useMemo(() => TRACK_META.map((m) => {
    const c = me?.tracks.find((t) => t.id === m.id);
    return { ...m, done: c?.done ?? 0, total: c?.total ?? 0, final: c?.final };
  }), [me]);
  const status = useMemo(() => evaluate(tracks), [tracks]);
  const seal = me?.seal ?? null;
  const cleaned = cleanName(name);
  const canIssue = Boolean(status.tier) && cleaned.length >= 2 && !busy;
  const canUpgrade = Boolean(seal && status.tier && tierRank(status.tier.id) > tierRank(seal.tier));

  // O selo exibido usa o instantâneo assinado no servidor (não muda se o progresso for reiniciado depois).
  const shownTracks: TrackStatus[] = useMemo(
    () => (seal ? status.tracks.map((t) => ({ ...t, pct: seal.pcts[t.id] ?? t.pct })) : status.tracks),
    [seal, status.tracks],
  );
  const card = useMemo(() => (seal ? cardSvg({ name: seal.name, tier: seal.tier, tracks: shownTracks, issuedAt: seal.issuedAt, id: seal.id, logo }) : null), [seal, shownTracks, logo]);
  const preview = useMemo(() => (card ? svgDataUrl(card) : svgDataUrl(sealSvg({ tracks: status.tracks, tier: status.tier?.id ?? null, locked: !status.tier }))), [card, status]);

  const issue = async () => {
    if (!canIssue) return;
    setBusy(true); setMsg(null);
    try { const r = await issueChampionSeal(cleaned); setMe((m) => (m ? { ...m, seal: r.seal } : m)); }
    catch (e) { setMsg((e as Error).message === 'request failed' ? 'Não foi possível emitir agora.' : `Não foi possível emitir: ${(e as Error).message}.`); }
    finally { setBusy(false); }
  };

  const download = async (kind: 'card' | 'seal') => {
    if (!seal) return;
    try {
      const blob = kind === 'card'
        ? await svgToPng(cardSvg({ name: seal.name, tier: seal.tier, tracks: shownTracks, issuedAt: seal.issuedAt, id: seal.id, logo }), 2400, 1350)
        : await svgToPng(sealSvg({ tracks: shownTracks, tier: seal.tier, size: 1200 }), 1200, 1200);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `security-champion-${kind === 'card' ? 'credencial' : 'selo'}-${seal.id}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      setMsg(null);
    } catch { setMsg('Não foi possível gerar a imagem neste navegador. Use Imprimir e salve como PDF.'); }
  };

  const print = () => {
    setPrinting(true);
    document.body.classList.add('champion-print');
    const done = () => { document.body.classList.remove('champion-print'); setPrinting(false); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 50);
  };

  const removeSeal = async () => { try { await removeChampionSeal(); setMe((m) => (m ? { ...m, seal: null } : m)); setVerified(null); setMsg(null); } catch { setMsg('Não foi possível remover agora.'); } };
  const eraseAll = async () => {
    if (!window.confirm('Apagar do servidor todo o seu progresso e o seu selo? Esta ação não pode ser desfeita.')) return;
    try { await eraseChampionData(); setName(''); setVerified(null); refresh(); setMsg(null); } catch { setMsg('Não foi possível apagar agora.'); }
  };

  const verify = useCallback(async (id: string) => {
    if (!id.trim()) return;
    try { const s = await verifyChampionSeal(id); setVerified(s ? { ok: true, seal: s } : { ok: false }); }
    catch { setVerified({ ok: false }); }
  }, []);
  // Abertura com ?verificar=ID: confere uma vez.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (verifyId) void verify(verifyId); }, []);

  if (loadErr) return <div role="alert" className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-center text-rose-200">{loadErr}</div>;
  if (!me) return <div className="flex items-center justify-center gap-2 py-24 text-slate-400"><Loader2 className="animate-spin" aria-hidden="true" /> Carregando…</div>;

  return (
    <div className="space-y-8">
      <header className="border-b border-[var(--color-line)] pb-6">
        <h2 className="text-2xl font-semibold">Jornada Security Champion</h2>
        <p className="mt-1.5 max-w-3xl text-[15px] leading-relaxed text-slate-400">
          Percorra as seis trilhas na ordem sugerida. Quando todas passarem do mínimo do nível, você emite o seu selo de Security Champion, com o anel preenchido pelo que você realmente concluiu.
        </p>
        <p className="mt-3 flex max-w-3xl gap-2 border-l-2 border-amber-400/70 bg-[var(--color-surface)] px-3 py-2 text-xs leading-relaxed text-slate-400">
          <Info size={14} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
          <span><strong className="font-semibold text-slate-200">Rascunho sujeito à aprovação</strong> dos mantenedores e da Segurança da Informação [inserir responsável pela emissão do selo]. É um selo interno de conclusão de trilha, <strong className="font-semibold text-slate-200">não uma certificação profissional</strong>. O progresso só conta quando o servidor valida a sua resposta, e o selo é assinado pelo servidor. A sua identidade aqui é uma chave anônima deste navegador, não a sua conta corporativa [inserir provedor SSO].</span>
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem]">
        {/* rota */}
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="route-title">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h3 id="route-title" className="font-display text-lg font-semibold text-slate-100">Sua rota</h3>
              <p className="text-sm text-slate-400">Progresso geral <strong className="font-semibold text-slate-100">{status.overall}%</strong> · menor trilha <strong className="font-semibold text-slate-100">{status.floor}%</strong></p>
            </div>
            <ol className="divide-y divide-[var(--color-line)] overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
              {status.tracks.map((t, i) => {
                const complete = t.pct >= 100;
                return (
                  <li key={t.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center">
                    <span className="font-mono text-sm font-semibold text-slate-500" aria-hidden="true">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-slate-100">{t.label}</p>
                      <p className="mt-0.5 max-w-[68ch] text-sm leading-relaxed text-slate-400">{t.why}</p>
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--color-line)]" role="progressbar" aria-label={`Progresso em ${t.label}`} aria-valuenow={t.pct} aria-valuemin={0} aria-valuemax={100}>
                          <div className={`h-full rounded-full ${complete ? 'bg-[var(--color-defense)]' : 'bg-[var(--color-offense)]'}`} style={{ width: `${t.pct}%` }} />
                        </div>
                        <span className="shrink-0 font-mono text-xs text-slate-400">{t.done}/{t.total} {t.unit} · {t.pct}%</span>
                      </div>
                      {t.final && (
                        <p className={`mt-2 flex items-center gap-1.5 text-xs ${t.finalPending ? 'text-amber-300' : 'text-[var(--color-defense)]'}`}>
                          {t.finalPending
                            ? <>Avaliação final obrigatória pendente: {t.final.done}/{t.final.total} {t.id === 'llmlab' ? 'flags' : 'cenários'}</>
                            : <>Avaliação final concluída</>}
                        </p>
                      )}
                    </div>
                    <button onClick={() => onNavigate(t.area, { lab: t.id === 'llmlab' })}
                      className={`${BTN} border border-[var(--color-line)] text-slate-100 hover:bg-[var(--color-surface-2)] sm:justify-self-end`}>
                      {complete ? 'Revisar' : t.done > 0 ? 'Continuar' : 'Começar'} <ArrowRight size={15} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="crit-title">
            <h3 id="crit-title" className="mb-3 font-display text-lg font-semibold text-slate-100">Como o nível é definido</h3>
            <div className="overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)]/50 text-xs text-slate-500">
                  <tr><th scope="col" className="px-4 py-2 font-medium">Nível</th><th scope="col" className="px-4 py-2 font-medium">Mínimo em cada uma das 6 trilhas</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line)]">
                  {TIERS.map((t) => (
                    <tr key={t.id} className={status.tier?.id === t.id ? 'bg-[var(--color-surface-2)]/40' : ''}>
                      <th scope="row" className="px-4 py-2.5 font-medium text-slate-100"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: t.color }} aria-hidden="true" />{t.label}</th>
                      <td className="px-4 py-2.5 text-slate-300">{t.min}% de conclusão{status.tier?.id === t.id ? ' · seu nível atual' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-[var(--color-line)] px-4 py-2.5 text-xs leading-relaxed text-slate-500">As avaliações finais são obrigatórias: sem concluir a de cada trilha (e o Laboratório de prompts, na trilha LLM) o selo não é liberado, mesmo com o percentual mínimo. O nível é o da trilha mais atrasada. Unidade de conclusão: cenário respondido corretamente, lab web resolvido ou flag capturada, sempre validados pelo servidor. Limites são premissa editorial [a validar com os mantenedores].</p>
            </div>
          </section>

          <section aria-labelledby="verify-title">
            <h3 id="verify-title" className="mb-3 font-display text-lg font-semibold text-slate-100">Verificar um selo</h3>
            <div className="space-y-3 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <form onSubmit={(e) => { e.preventDefault(); void verify(verifyId); }} className="flex flex-wrap items-end gap-2">
                <div className="min-w-[12rem] flex-1">
                  <label htmlFor="verify-id" className="block text-sm text-slate-300">ID do selo (SC-…)</label>
                  <input id="verify-id" value={verifyId} onChange={(e) => setVerifyId(e.target.value)} maxLength={20} spellCheck={false} autoComplete="off" placeholder="SC-XXXXXXXXXX"
                    className={`mt-1 min-h-11 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 ${FOCUS}`} />
                </div>
                <button type="submit" disabled={!verifyId.trim()} className={`${BTN} border border-[var(--color-line)] text-slate-100 hover:bg-[var(--color-surface-2)] disabled:opacity-50`}><SearchCheck size={15} aria-hidden="true" /> Verificar</button>
              </form>
              {verified && (verified.ok && verified.seal ? (
                <p role="status" className="flex gap-2 text-sm leading-relaxed text-emerald-200"><BadgeCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Selo válido e assinado pelo servidor: <strong className="font-semibold">{verified.seal.name}</strong>, nível <strong className="font-semibold">{tierLabel(verified.seal.tier)}</strong>, emitido em {fmtDate(verified.seal.issuedAt)}.</span></p>
              ) : (
                <p role="status" className="flex gap-2 text-sm leading-relaxed text-rose-300"><ShieldX size={16} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Não encontramos um selo válido com esse ID (inexistente, removido ou alterado).</span></p>
              ))}
            </div>
          </section>
        </div>

        {/* selo */}
        <aside aria-labelledby="seal-title" className="lg:sticky lg:top-4 lg:self-start">
          <div className="space-y-4 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <h3 id="seal-title" className="flex items-center gap-2 font-display text-lg font-semibold text-slate-100">
              {seal ? <ShieldCheck size={18} className="text-[var(--color-defense)]" aria-hidden="true" /> : <Lock size={18} className="text-slate-500" aria-hidden="true" />}
              {seal ? 'Seu selo' : status.tier ? 'Pronto para emitir' : 'Selo bloqueado'}
            </h3>

            <img src={preview} alt={seal ? `Credencial Security Champion de ${seal.name}, nível ${tierLabel(seal.tier)}` : 'Prévia do selo Security Champion, ainda incompleto'}
              className={`w-full rounded border border-[var(--color-line)] ${seal ? 'aspect-[16/9]' : 'mx-auto aspect-square max-w-[16rem] border-0'}`} />

            {!status.tier && !seal && status.next && (
              <div className="text-sm leading-relaxed text-slate-300">
                <p>Para o nível <strong className="font-semibold text-slate-100">{status.next.tier.label}</strong> ({status.next.tier.min}% em todas), faltam:</p>
                <ul className="mt-2 space-y-1 text-slate-400">
                  {status.next.missing.map((m) => {
                    const t = tracks.find((x) => x.id === m.id);
                    return <li key={m.id} className="flex justify-between gap-3"><span>{t?.short ?? m.id}{m.final ? ' · avaliação final' : ''}</span><span className="font-mono text-xs text-slate-300">{m.units} {t?.unit}</span></li>;
                  })}
                </ul>
              </div>
            )}

            {status.tier && (!seal || canUpgrade) && (
              <div className="space-y-2.5">
                <p className="text-sm leading-relaxed text-slate-300">
                  {canUpgrade ? <>Você subiu para <strong className="font-semibold text-slate-100">{status.tier.label}</strong>. Atualize o seu selo.</> : <>Você atingiu o nível <strong className="font-semibold text-slate-100">{status.tier.label}</strong>.</>}
                </p>
                <label htmlFor="seal-name" className="block text-sm text-slate-300">Nome que aparece no selo</label>
                <input id="seal-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" placeholder="Nome e sobrenome"
                  aria-describedby="seal-name-help"
                  className={`min-h-11 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-ink)] px-3 text-sm text-slate-100 placeholder:text-slate-500 ${FOCUS}`} />
                <p id="seal-name-help" className="text-xs leading-relaxed text-slate-500">Mínimo de 2 caracteres. Ao emitir, o nome e o nível ficam registrados no servidor e podem ser consultados por quem tiver o ID do selo. Você pode remover quando quiser.</p>
                <button onClick={issue} disabled={!canIssue} className={`${BTN} w-full bg-[var(--color-offense)] text-slate-950 hover:bg-[var(--color-offense-soft)] disabled:opacity-50`}>
                  {busy ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : canUpgrade ? <RefreshCw size={15} aria-hidden="true" /> : <ShieldCheck size={15} aria-hidden="true" />}
                  {canUpgrade ? 'Atualizar o selo' : 'Emitir o meu selo'}
                </button>
              </div>
            )}

            {seal && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => download('card')} className={`${BTN} border border-[var(--color-line)] text-slate-100 hover:bg-[var(--color-surface-2)]`}><Download size={15} aria-hidden="true" /> Credencial</button>
                  <button onClick={() => download('seal')} className={`${BTN} border border-[var(--color-line)] text-slate-100 hover:bg-[var(--color-surface-2)]`}><Download size={15} aria-hidden="true" /> Só o selo</button>
                </div>
                <button onClick={print} className={`${BTN} w-full border border-[var(--color-line)] text-slate-100 hover:bg-[var(--color-surface-2)]`}><Printer size={15} aria-hidden="true" /> Imprimir ou salvar em PDF</button>
                <p className="font-mono text-xs text-slate-500">ID {seal.id} · assinado pelo servidor</p>
                <button onClick={removeSeal} className={`min-h-9 text-xs text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline ${FOCUS}`}>Remover o meu selo do servidor</button>
              </div>
            )}
            {msg && <p role="alert" className="text-sm text-rose-300">{msg}</p>}
            <button onClick={eraseAll} className={`inline-flex min-h-9 items-center gap-1.5 text-xs text-slate-500 underline-offset-2 hover:text-rose-300 hover:underline ${FOCUS}`}><Trash2 size={13} aria-hidden="true" /> Apagar todos os meus dados do servidor</button>
          </div>
        </aside>
      </div>

      {printing && card && createPortal(
        <div id="champion-print"><img src={svgDataUrl(card)} alt={`Credencial Security Champion de ${seal?.name ?? ''}`} /></div>,
        document.body,
      )}
    </div>
  );
}
