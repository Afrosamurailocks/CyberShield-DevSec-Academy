// Gera o selo e a credencial Security Champion como SVG (string). Mesma fonte para a prévia e para o PNG exportado.
// Ideia central: o anel do selo tem 6 segmentos, um por trilha, preenchidos conforme o progresso real.
import type { TierId, TrackStatus } from './champion';
import { TIERS } from './champion';

const C = {
  ink: '#121418', graphite: '#1b1e23', surface: '#22262c', line: '#343a43', text: '#e8eaed', muted: '#8d949e',
  orange: '#ee7d30', track: '#2b3037',
};
const FONT = "Poppins, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "'JetBrains Mono', Consolas, 'Courier New', monospace";

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const f = (n: number) => Number(n.toFixed(2));

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [f(cx + r * Math.cos(a)), f(cy + r * Math.sin(a))] as const;
};
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

export interface SealOpts { tracks: TrackStatus[]; tier: TierId | null; /** Selo apagado (ainda não conquistado). */ locked?: boolean }

/** Selo 400x400. Retorna o conteúdo do <svg> (sem o wrapper), para reaproveitar na credencial. */
export function sealInner({ tracks, tier, locked }: SealOpts): string {
  const t = TIERS.find((x) => x.id === tier);
  const metal = locked || !t ? '#59606a' : t.color;
  const n = Math.max(tracks.length, 1);
  const seg = 360 / n;
  const gap = 7;
  let ring = '';
  tracks.forEach((tr, i) => {
    const a0 = i * seg + gap / 2;
    const a1 = (i + 1) * seg - gap / 2;
    ring += `<path d="${arc(200, 200, 160, a0, a1)}" fill="none" stroke="${C.track}" stroke-width="16" stroke-linecap="butt"/>`;
    const fill = Math.min(100, tr.pct) / 100;
    if (fill > 0) {
      const aEnd = a0 + (a1 - a0) * fill;
      ring += `<path d="${arc(200, 200, 160, a0, aEnd)}" fill="none" stroke="${locked ? '#7a828d' : C.orange}" stroke-width="16" stroke-linecap="butt"/>`;
    }
  });
  const tierLabel = locked || !t ? 'Em andamento' : `Nível ${t.label}`;
  return `
  <circle cx="200" cy="200" r="190" fill="${C.ink}"/>
  <circle cx="200" cy="200" r="188" fill="none" stroke="${metal}" stroke-width="3"/>
  <circle cx="200" cy="200" r="178" fill="none" stroke="${C.line}" stroke-width="1"/>
  ${ring}
  <circle cx="200" cy="200" r="138" fill="${C.graphite}" stroke="${C.line}" stroke-width="1"/>
  <g transform="translate(200 166) scale(0.78) translate(-200 -197)">
    <path d="M200 112 L262 136 V196 C262 238 236 266 200 282 C164 266 138 238 138 196 V136 Z" fill="${C.surface}" stroke="${locked ? '#59606a' : C.orange}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M172 198 L194 220 L232 176" fill="none" stroke="${locked ? '#59606a' : C.orange}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="200" y="268" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="600" fill="${locked ? C.muted : C.text}">Security Champion</text>
  <rect x="144" y="279" width="112" height="22" rx="4" fill="none" stroke="${metal}" stroke-width="1.5"/>
  <text x="200" y="295" text-anchor="middle" font-family="${FONT}" font-size="12.5" font-weight="600" fill="${metal}">${esc(tierLabel)}</text>`;
}

export function sealSvg(opts: SealOpts & { size?: number }): string {
  const s = opts.size ?? 400;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 400 400" role="img" aria-label="Selo Security Champion">${sealInner(opts)}</svg>`;
}

export interface CardOpts {
  name: string;
  tier: TierId;
  tracks: TrackStatus[];
  /** ISO (data de emissão). */
  issuedAt: string;
  id: string;
  /** Marca como data URL (opcional). */
  logo?: string;
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso.slice(0, 10) : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

/** Credencial 1200x675. */
export function cardSvg(o: CardOpts): string {
  const tier = TIERS.find((x) => x.id === o.tier) ?? TIERS[0];
  const nameSize = o.name.length > 34 ? 30 : o.name.length > 24 ? 36 : 44;
  const rows = o.tracks.map((tr, i) => {
    const y = 372 + i * 34;
    const w = Math.round(250 * Math.min(100, tr.pct) / 100);
    return `<text x="560" y="${y}" font-family="${FONT}" font-size="14" fill="#c9ced6">${esc(tr.short)}</text>
    <rect x="800" y="${y - 10}" width="250" height="6" rx="3" fill="${C.track}"/>
    <rect x="800" y="${y - 10}" width="${w}" height="6" rx="3" fill="${C.orange}"/>
    <text x="1140" y="${y}" text-anchor="end" font-family="${MONO}" font-size="13" fill="${C.muted}">${tr.pct}%</text>`;
  }).join('');
  const logo = o.logo
    ? `<image href="${o.logo}" x="560" y="64" height="34" width="104" preserveAspectRatio="xMinYMid meet"/>`
    : `<text x="560" y="90" font-family="${FONT}" font-size="26" font-weight="700" fill="${C.text}">CyberShield</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="Credencial Security Champion de ${esc(o.name)}">
  <rect width="1200" height="675" fill="${C.ink}"/>
  <rect x="24" y="24" width="1152" height="627" rx="6" fill="none" stroke="${C.line}" stroke-width="1"/>
  <rect x="24" y="24" width="6" height="627" fill="${C.orange}"/>
  <g transform="translate(70 128) scale(1.1)">${sealInner({ tracks: o.tracks, tier: o.tier })}</g>
  ${logo}
  <text x="560" y="150" font-family="${FONT}" font-size="18" fill="${C.muted}">Trilha Security Champion</text>
  <text x="560" y="215" font-family="${FONT}" font-size="${nameSize}" font-weight="700" fill="#ffffff">${esc(o.name)}</text>
  <text x="560" y="262" font-family="${FONT}" font-size="22" fill="#c9ced6">concluiu a jornada com nível <tspan font-weight="700" fill="${tier.color}">${tier.label}</tspan></text>
  <line x1="560" y1="296" x2="1140" y2="296" stroke="${C.line}" stroke-width="1"/>
  <text x="560" y="328" font-family="${FONT}" font-size="14" font-weight="600" fill="${C.text}">Conclusão por trilha</text>
  ${rows}
  <line x1="560" y1="580" x2="1140" y2="580" stroke="${C.line}" stroke-width="1"/>
  <text x="560" y="606" font-family="${MONO}" font-size="13" fill="${C.muted}">${esc(fmtDate(o.issuedAt))}  ·  ${esc(o.id)}</text>
  <text x="560" y="628" font-family="${FONT}" font-size="11" fill="${C.muted}">Selo interno de conclusão de trilha de treinamento, autodeclarado. Não é certificação profissional.</text>
  <text x="560" y="643" font-family="${FONT}" font-size="11" fill="${C.muted}">Rascunho sujeito a aprovação: [inserir responsável pela emissão do selo ].</text>
</svg>`;
}

export const svgDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Rasteriza um SVG em PNG (Blob) no tamanho pedido. */
export function svgToPng(svg: string, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('canvas indisponível'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('falha ao gerar PNG'))), 'image/png');
    };
    img.onerror = () => reject(new Error('falha ao carregar o SVG'));
    img.src = svgDataUrl(svg);
  });
}
