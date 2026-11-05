/**
 * Planilha Excel (.xlsx) do relatório de desempenho, (grafite + laranja, Arial, marca).
 * RASCUNHO para revisão humana. A planilha é para LEITURA/análise; a versão ASSINADA do relatório é o JSON com o mesmo ID
 * (o SHA-256 do conteúdo vai no Resumo para ligar as duas). Totais do Resumo são FÓRMULAS sobre a aba "Pessoas".
 *
 * Design: sem grade; Resumo com cartões de KPI (degradê suave, filete de cor), títulos de seção com marcador laranja e barras
 * de dados; abas de dados (Pessoas, Detalhe) com CABEÇALHO COMPACTO (1 linha de marca + faixa de grupos + títulos de coluna em
 * degradê grafite com filete laranja) para que o painel congelado ocupe pouco espaço, sem células mescladas atravessando a
 * divisão de colunas congeladas; faixas alternadas, linhas horizontais finas, cores semânticas sempre acompanhadas de texto e
 * níveis com cor de medalha (Ouro, Prata, Bronze).
 * Abas: Resumo · Treinamentos · Pessoas · Detalhe por trilha · Critérios e limites.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';
import { TRACKS, TRACK_LABEL, SHORT, type ReportDoc } from './report.js';

const C = {
  ink: 'FF1E1E20', ink2: 'FF2F2F34', ink3: 'FF3A3A40', orange: 'FFEE7D30', orangeSoft: 'FFF4A23F', orangeTint: 'FFFDEBDD', paper: 'FFFFFFFF', zebra: 'FFF7F7F8', card: 'FFF1F1F4',
  hair: 'FFE2E2E5', text: 'FF1E1E20', muted: 'FF6B6B70', ok: 'FF1F9D6B', okBg: 'FFDDF3E8', okText: 'FF0B6B45', warn: 'FFE5A100', warnBg: 'FFFFF1D6', warnText: 'FF8A5A00',
  info: 'FF3B82C4', infoBg: 'FFDDEBFA', infoText: 'FF1F5A99', idle: 'FF9A9AA0', idleBg: 'FFEAEAEC', idleText: 'FF55555A', draft: 'FFFFF4E5',
};
const FONT = 'Arial';

/** Marca CyberShield. Lida uma vez; se o arquivo faltar, o relatório sai sem ela em vez de falhar. */
const LOGO = (() => {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  for (const p of [path.resolve(dir, '../public/brand/cybershield-mark.png'), path.resolve(process.cwd(), 'public/brand/cybershield-mark.png')]) {
    try { const buffer = fs.readFileSync(p); return { buffer, ratio: buffer.readUInt32BE(16) / buffer.readUInt32BE(20) }; } catch { /* tenta o próximo */ }
  }
  return null;
})();
const LOGO_H = 28; // px
const f = (o: Partial<ExcelJS.Font> = {}): Partial<ExcelJS.Font> => ({ name: FONT, size: 10, color: { argb: C.text }, ...o });
const fill = (argb: string): ExcelJS.Fill => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
/** Degradê linear (degree 0 = esquerda→direita, 90 = cima→baixo). */
const grad = (a: string, b: string, degree = 90): ExcelJS.Fill => ({ type: 'gradient', gradient: 'angle', degree, stops: [{ position: 0, color: { argb: a } }, { position: 1, color: { argb: b } }] });
const hairline: Partial<ExcelJS.Borders> = { bottom: { style: 'thin', color: { argb: C.hair } } };
const PCT = '0%;-0%;"-"'; const DT = 'dd/mm/yyyy hh:mm';
const SCOPE: Record<string, string> = { organization: 'Toda a organização', team: 'Equipe do gestor', self: 'Somente o próprio usuário' };
const ROLE: Record<string, string> = { learner: 'Aluno', manager: 'Gestor', auditor: 'Auditor', admin: 'Administrador' };
const SIT: Record<string, { bg: string; fg: string; bar: string }> = {
  Aprovado: { bg: C.okBg, fg: C.okText, bar: C.ok }, 'Final pendente': { bg: C.warnBg, fg: C.warnText, bar: C.warn },
  'Em andamento': { bg: C.infoBg, fg: C.infoText, bar: C.info }, 'Não iniciado': { bg: C.idleBg, fg: C.idleText, bar: C.idle },
};
const MEDAL: Record<string, { bg: string; fg: string }> = { Ouro: { bg: 'FFFFE9A8', fg: 'FF7A5A00' }, Prata: { bg: 'FFE6EAF0', fg: 'FF4A5565' }, Bronze: { bg: 'FFF3D9C4', fg: 'FF8A4A1F' } };
const asDate = (s: string | null) => (s ? new Date(s) : null);
const SHEET = { trainings: 'Treinamentos', people: 'Pessoas', detail: 'Detalhe por trilha', summary: 'Resumo', crit: 'Critérios e limites' };
const DRAFT = 'RASCUNHO PARA REVISÃO HUMANA · validar critérios, retenção e uso como evidência com a Conformidade e o DPO · contém dados pessoais';
const col = (n: number) => { let s = ''; for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s; return s; };

const logo = (ws: ExcelJS.Worksheet, id: number | undefined, row = 0.2) => {
  if (id !== undefined && LOGO) ws.addImage(id, { tl: { col: 1.08, row }, ext: { width: Math.round(LOGO_H * LOGO.ratio), height: LOGO_H }, editAs: 'oneCell' });
};

/** Faixa grande (Resumo e Critérios): marca, título e aviso de rascunho. Coluna A é margem. */
function banner(ws: ExcelJS.Worksheet, cols: number, title: string, sub: string, logoId?: number) {
  for (let c = 1; c <= cols; c++) { ws.getCell(1, c).fill = grad(C.ink, C.ink2, 0); ws.getCell(2, c).fill = grad(C.ink, C.ink2, 0); ws.getCell(3, c).fill = grad(C.orange, C.orangeSoft, 0); ws.getCell(4, c).fill = fill(C.draft); }
  ws.mergeCells(1, 2, 1, cols); ws.mergeCells(2, 2, 2, cols); ws.mergeCells(4, 2, 4, cols);
  const a = ws.getCell(1, 2); a.value = 'CYBERSHIELD DEVSEC ACADEMY'; a.font = f({ size: 9, bold: true, color: { argb: C.orangeSoft } }); a.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
  logo(ws, logoId, 0.17);
  const b = ws.getCell(2, 2); b.value = title; b.font = f({ size: 20, bold: true, color: { argb: C.paper } }); b.alignment = { vertical: 'middle' };
  const d = ws.getCell(4, 2); d.value = sub; d.font = f({ size: 8.5, bold: true, color: { argb: 'FF7A3D00' } }); d.alignment = { vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 38; ws.getRow(2).height = 34; ws.getRow(3).height = 3; ws.getRow(4).height = 24;
}
/**
 * Faixa COMPACTA (abas de dados, painel congelado): uma linha com logo (coluna B), título e selo de rascunho. As mesclagens
 * começam depois da coluna B para nunca atravessar a divisão das colunas congeladas.
 */
function compactBanner(ws: ExcelJS.Worksheet, cols: number, title: string, logoId?: number) {
  for (let c = 1; c <= cols; c++) { const x = ws.getCell(1, c); x.fill = grad(C.ink, C.ink3, 0); x.border = { bottom: { style: 'thick', color: { argb: C.orange } } }; }
  ws.mergeCells(1, 3, 1, cols - 3); ws.mergeCells(1, cols - 2, 1, cols);
  const t = ws.getCell(1, 3); t.value = title; t.font = f({ size: 15, bold: true, color: { argb: C.paper } }); t.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  const d = ws.getCell(1, cols - 2); d.value = 'RASCUNHO · REVISÃO HUMANA'; d.font = f({ size: 8, bold: true, color: { argb: C.orangeSoft } }); d.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
  logo(ws, logoId, 0.15); ws.getRow(1).height = 38;
}
/** Títulos de coluna: degradê grafite, texto branco, filete laranja embaixo e separadores finos. */
function headRow(row: ExcelJS.Row, from: number, to?: number, h = 32) {
  for (let n = from; n <= (to ?? row.cellCount); n++) {
    const c = row.getCell(n);
    c.font = f({ bold: true, color: { argb: C.paper }, size: 9 }); c.fill = grad(C.ink3, C.ink, 90);
    c.border = { bottom: { style: 'thick', color: { argb: C.orange } }, left: { style: 'thin', color: { argb: C.ink3 } }, right: { style: 'thin', color: { argb: C.ink3 } } };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  }
  row.height = h;
}
function printSetup(ws: ExcelJS.Worksheet, doc: ReportDoc, titleRows: number) {
  ws.pageSetup = { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.25 }, printTitlesRow: `1:${titleRows}` } as ExcelJS.PageSetup;
  ws.headerFooter = { oddFooter: `&L&8${doc.meta.reportId} · rascunho para revisão humana&C&8CyberShield&R&8Página &P de &N` };
}
/** Barra de dados (cor sólida, sem gradiente) para valores de 0 a 1. */
const dataBar = (ref: string, argb: string, priority: number): ExcelJS.ConditionalFormattingOptions => ({
  ref, rules: [{ type: 'dataBar', priority, gradient: false, minLength: 0, maxLength: 100, showValue: true, color: { argb }, cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 1 }] } as unknown as ExcelJS.DataBarRuleType],
});

export async function reportToXlsx(doc: ReportDoc): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'CyberShield DevSec Academy'; wb.title = `Relatório de desempenho ${doc.meta.reportId}`; wb.created = new Date(doc.meta.generatedAt);
  const ws = wb.addWorksheet(SHEET.summary, { views: [{ showGridLines: false }], properties: { tabColor: { argb: C.orange } } });
  const wt = wb.addWorksheet(SHEET.trainings, { views: [{ showGridLines: false }], properties: { tabColor: { argb: C.orangeSoft } } });
  const wp = wb.addWorksheet(SHEET.people, { views: [{ state: 'frozen', xSplit: 2, ySplit: 3, topLeftCell: 'C4', activeCell: 'C4', showGridLines: false, zoomScale: 100 }], properties: { tabColor: { argb: C.ink } } });
  const wd = wb.addWorksheet(SHEET.detail, { views: [{ state: 'frozen', ySplit: 3, topLeftCell: 'A4', activeCell: 'B4', showGridLines: false, zoomScale: 100 }], properties: { tabColor: { argb: C.ink2 } } });
  const wc = wb.addWorksheet(SHEET.crit, { views: [{ showGridLines: false }], properties: { tabColor: { argb: C.idle } } });
  const s = doc.summary;
  const logoId = LOGO ? wb.addImage({ buffer: LOGO.buffer as unknown as ExcelJS.Buffer, extension: 'png' }) : undefined;

  // ═════════ Pessoas ═════════ (linha 1: marca · 2: grupos · 3: títulos · dados a partir da 4)
  const base = ['Pessoa', 'E-mail', 'Perfil', 'Equipe', 'Gestor', 'Conta', 'Situação', 'Nível', 'Geral'];
  const tail = ['Avaliações finais pendentes', 'Primeira atividade (UTC)', 'Última atividade (UTC)', 'Último login (UTC)', 'Selo', 'Selo emitido em (UTC)'];
  const pHead = ['', ...base, ...TRACKS.map((t) => SHORT[t]), ...tail];
  const nP = pHead.length;
  const cGeral = 1 + base.length;
  const cT0 = cGeral + 1; const cT1 = cGeral + TRACKS.length; const cFin = cT1 + 1;
  const cDt = [cFin + 1, cFin + 2, cFin + 3]; const cSeal = cFin + 4; const cSealAt = cFin + 5;
  const cSit = 2 + base.indexOf('Situação'); const cNivel = 2 + base.indexOf('Nível');
  compactBanner(wp, nP, 'Pessoas e situação do treinamento', logoId);
  const groups: [number, number, string][] = [[3, cGeral, 'IDENTIFICAÇÃO E SITUAÇÃO'], [cT0, cT1, 'CONCLUSÃO POR TRILHA'], [cFin, nP, 'ATIVIDADE E SELO']];
  for (const [a, b, t] of groups) {
    wp.mergeCells(2, a, 2, b); wp.getCell(2, a).value = t;
    for (let c = a; c <= b; c++) { const x = wp.getCell(2, c); x.font = f({ size: 8.5, bold: true, color: { argb: C.ink } }); x.fill = grad(C.orange, C.orangeSoft, 0); x.alignment = { horizontal: 'center', vertical: 'middle' }; x.border = { left: c === a ? { style: 'medium', color: { argb: C.paper } } : undefined, right: c === b ? { style: 'medium', color: { argb: C.paper } } : undefined }; }
  }
  { const x = wp.getCell(2, 2); x.fill = grad(C.orange, C.orangeSoft, 0); x.border = { right: { style: 'medium', color: { argb: C.paper } } }; } // B2 fica fora das mesclagens: coluna congelada
  wp.getRow(2).height = 20;
  wp.getRow(3).values = pHead; headRow(wp.getRow(3), 2, nP, 34);
  doc.rows.forEach((r, i) => {
    const row = wp.getRow(4 + i);
    row.values = ['', r.name, r.email, ROLE[r.role] ?? r.role, r.team || '—', r.manager || '—', r.status === 'active' ? 'Ativa' : 'Desativada', r.situation, r.tier || '—', r.overallPct / 100,
      ...TRACKS.map((t) => (r.tracks[t]?.pct ?? 0) / 100), r.pendingFinals.map((p) => SHORT[p] ?? p).join(', ') || '—',
      asDate(r.firstActivity), asDate(r.lastActivity), asDate(r.lastLogin), r.sealId ?? '—', asDate(r.sealIssuedAt)];
    for (let c = 2; c <= nP; c++) { const x = row.getCell(c); x.font = f(); x.border = hairline; x.alignment = { vertical: 'middle', horizontal: c <= 6 || c === cFin ? 'left' : 'center', indent: c === 2 ? 1 : 0, wrapText: c === cFin }; if (i % 2 === 1) x.fill = fill(C.zebra); }
    row.getCell(2).font = f({ bold: true }); row.getCell(3).font = f({ color: { argb: C.muted }, size: 9 });
    for (let c = cGeral; c <= cT1; c++) row.getCell(c).numFmt = PCT;
    for (const c of [...cDt, cSealAt]) row.getCell(c).numFmt = DT;
    row.getCell(cSeal).font = f({ name: 'Consolas', size: 9 });
    const st = SIT[r.situation] ?? SIT['Não iniciado']; const sc = row.getCell(cSit);
    sc.fill = fill(st.bg); sc.font = f({ bold: true, color: { argb: st.fg }, size: 9 }); sc.alignment = { horizontal: 'center', vertical: 'middle' };
    const lv = row.getCell(cNivel); const md = MEDAL[r.tier];
    if (md) { lv.fill = fill(md.bg); lv.font = f({ bold: true, color: { argb: md.fg }, size: 9 }); lv.alignment = { horizontal: 'center', vertical: 'middle' }; }
    if (r.status === 'disabled') for (const c of [2, 3, 4, 5, 6, 7]) row.getCell(c).font = f({ color: { argb: C.muted }, italic: true });
    row.height = 24;
  });
  const lastP = 3 + doc.rows.length;
  const widths: Record<number, number> = { 1: 2, 2: 28, 3: 32, 4: 16, 5: 20, 6: 22, 7: 12, 8: 17, 9: 11, [cGeral]: 13 };
  for (let c = 1; c <= nP; c++) wp.getColumn(c).width = widths[c] ?? (c >= cT0 && c <= cT1 ? 15 : c === cFin ? 32 : c === cSeal ? 18 : 22);
  if (doc.rows.length) {
    const rng = `${col(cGeral)}4:${col(cT1)}${lastP}`;
    wp.autoFilter = { from: { row: 3, column: 2 }, to: { row: lastP, column: nP } };
    wp.addConditionalFormatting(dataBar(rng, C.orangeSoft, 1));
    wp.addConditionalFormatting({ ref: rng, rules: [
      { type: 'cellIs', operator: 'greaterThanOrEqual', formulae: [1], priority: 2, style: { font: { bold: true, color: { argb: C.okText } } } },
      { type: 'cellIs', operator: 'equal', formulae: [0], priority: 3, style: { font: { color: { argb: 'FFB0B0B5' } } } },
    ] });
  }
  printSetup(wp, doc, 3);

  // ═════════ Detalhe por trilha (formato longo, bom para tabela dinâmica) ═════════
  const dHead = ['', 'Pessoa', 'E-mail', 'Equipe', 'Trilha', 'Concluídos', 'Total', 'Progresso', 'Última conclusão (UTC)', 'Avaliação final pendente'];
  compactBanner(wd, dHead.length, 'Detalhe por pessoa e trilha', logoId);
  wd.getRow(2).height = 4; for (let c = 2; c <= dHead.length; c++) wd.getCell(2, c).fill = fill(C.paper);
  wd.getRow(3).values = dHead; headRow(wd.getRow(3), 2, dHead.length, 30);
  let n = 0; let dr = 4;
  for (const r of doc.rows) for (const t of TRACKS) {
    const c = r.tracks[t]; if (!c) continue;
    const row = wd.getRow(dr++);
    row.values = ['', r.name, r.email, r.team || '—', SHORT[t], c.done, c.total, { formula: `IF(G${row.number}=0,0,MIN(1,F${row.number}/G${row.number}))`, result: c.total ? Math.min(1, c.done / c.total) : 0 }, asDate(c.last), c.finalPending ? 'Sim' : 'Não'];
    row.getCell(8).numFmt = PCT; row.getCell(9).numFmt = DT;
    for (let k = 2; k <= dHead.length; k++) { const x = row.getCell(k); x.font = f(); x.border = hairline; x.alignment = { vertical: 'middle', horizontal: k >= 6 ? 'center' : 'left', indent: k === 2 ? 1 : 0 }; if (n % 2 === 1) x.fill = fill(C.zebra); }
    row.getCell(2).font = f({ bold: true }); row.getCell(3).font = f({ size: 9, color: { argb: C.muted } });
    if (c.finalPending) { row.getCell(10).fill = fill(C.warnBg); row.getCell(10).font = f({ bold: true, color: { argb: C.warnText }, size: 9 }); }
    row.height = 22; n++;
  }
  [2, 28, 32, 18, 26, 13, 10, 16, 22, 22].forEach((w, i) => { wd.getColumn(i + 1).width = w; });
  if (n) { wd.autoFilter = { from: { row: 3, column: 2 }, to: { row: 3 + n, column: dHead.length } }; wd.addConditionalFormatting(dataBar(`H4:H${3 + n}`, C.orangeSoft, 1)); }
  printSetup(wd, doc, 3);

  // ═════════ Resumo (painel) ═════════
  const W = 13; // A (margem) + B..M (12 colunas)
  for (let c = 1; c <= W; c++) ws.getColumn(c).width = c === 1 ? 2 : 12.5;
  banner(ws, W, 'Relatório de desempenho do treinamento', DRAFT, logoId);
  const P = `'${SHEET.people}'`; const last = Math.max(4, lastP);
  const rngSit = `${P}!$${col(cSit)}$4:$${col(cSit)}$${last}`; const rngGeral = `${P}!$${col(cGeral)}$4:$${col(cGeral)}$${last}`; const rngName = `${P}!$B$4:$B$${last}`;
  /** Título de seção: marcador laranja à esquerda, degradê suave e filete laranja embaixo. */
  const sect = (row: number, text: string) => {
    ws.mergeCells(row, 2, row, W);
    for (let k = 2; k <= W; k++) { const x = ws.getCell(row, k); x.fill = grad(C.orangeTint, C.paper, 0); x.border = { bottom: { style: 'medium', color: { argb: C.orange } }, left: k === 2 ? { style: 'thick', color: { argb: C.orange } } : undefined }; }
    const c = ws.getCell(row, 2); c.value = text; c.font = f({ bold: true, size: 13 }); c.alignment = { vertical: 'middle', indent: 1 }; ws.getRow(row).height = 26;
  };

  const filt = [doc.meta.filters.team && `equipe: ${doc.meta.filters.team}`, doc.meta.filters.situation && `situação: ${doc.meta.filters.situation}`, doc.meta.filters.q && `busca: "${doc.meta.filters.q}"`].filter(Boolean).join(' · ') || 'sem filtros';
  const meta: [string, string, boolean][] = [['Identificador', doc.meta.reportId, true], ['Gerado em (UTC)', doc.meta.generatedAt.replace('T', ' ').slice(0, 19), false],
    ['Gerado por', `${doc.meta.generatedBy.email} (${ROLE[doc.meta.generatedBy.role] ?? doc.meta.generatedBy.role})`, false], ['Escopo', `${SCOPE[doc.meta.scope]} · ${filt}`, false],
    ['SHA-256', doc.integrity?.contentSha256 ?? '', true], ['Assinatura HMAC', doc.integrity?.signature ?? '', true]];
  let r = 6;
  for (const [k, v, mono] of meta) {
    ws.mergeCells(r, 2, r, 3); ws.mergeCells(r, 4, r, W);
    const a = ws.getCell(r, 2); a.value = k; a.font = f({ bold: true, size: 9, color: { argb: C.muted } }); a.alignment = { indent: 1, vertical: 'middle' };
    const b = ws.getCell(r, 4); b.value = v; b.font = f(mono ? { name: 'Consolas', size: 9 } : {}); b.alignment = { vertical: 'middle' };
    for (let c = 2; c <= W; c++) ws.getCell(r, c).border = hairline; ws.getRow(r).height = 19; r++;
  }
  ws.mergeCells(r, 2, r, W); const nt = ws.getCell(r, 2); nt.value = 'Planilha para leitura e análise. A versão assinada deste relatório é o JSON com o mesmo identificador; o SHA-256 acima liga os dois arquivos.'; nt.font = f({ size: 8, italic: true, color: { argb: C.muted } }); r += 2;

  sect(r, 'Visão geral'); r += 2;
  const cards = [
    { label: 'PESSOAS', formula: `COUNTA(${rngName})`, result: s.users, fmt: '0', accent: C.ink, fg: C.text, sub: `${s.byStatus.active ?? 0} ativas · ${s.disabled} desativadas` },
    { label: 'APROVADOS', formula: `COUNTIF(${rngSit},"Aprovado")`, result: s.bySituation.Aprovado, fmt: '0', accent: C.ok, fg: C.okText, sub: `${s.approvalRatePct}% do escopo` },
    { label: 'FINAL PENDENTE', formula: `COUNTIF(${rngSit},"Final pendente")`, result: s.bySituation['Final pendente'], fmt: '0', accent: C.warn, fg: C.warnText, sub: 'avaliação obrigatória' },
    { label: 'EM ANDAMENTO', formula: `COUNTIF(${rngSit},"Em andamento")`, result: s.bySituation['Em andamento'], fmt: '0', accent: C.info, fg: C.infoText, sub: 'treinamento em curso' },
    { label: 'NÃO INICIADO', formula: `COUNTIF(${rngSit},"Não iniciado")`, result: s.bySituation['Não iniciado'], fmt: '0', accent: C.idle, fg: C.idleText, sub: `${s.neverLoggedIn} nunca acessaram` },
    { label: 'MÉDIA GERAL', formula: `IFERROR(AVERAGE(${rngGeral}),0)`, result: s.averageOverallPct / 100, fmt: '0%', accent: C.orange, fg: C.text, sub: 'média das 6 trilhas' },
  ];
  const top = r;
  cards.forEach((k, i) => {
    const c0 = 2 + i * 2; const c1 = c0 + 1;
    for (let rr = top; rr <= top + 3; rr++) for (let cc = c0; cc <= c1; cc++) ws.getCell(rr, cc).fill = grad(C.paper, C.card, 90);
    ws.mergeCells(top, c0, top, c1); ws.mergeCells(top + 1, c0, top + 2, c1); ws.mergeCells(top + 3, c0, top + 3, c1);
    const l = ws.getCell(top, c0); l.value = k.label; l.font = f({ size: 8, bold: true, color: { argb: C.muted } }); l.alignment = { horizontal: 'center', vertical: 'middle' };
    const v = ws.getCell(top + 1, c0); v.value = { formula: k.formula, result: k.result }; v.numFmt = k.fmt; v.font = f({ size: 30, bold: true, color: { argb: k.fg } }); v.alignment = { horizontal: 'center', vertical: 'middle' };
    const d = ws.getCell(top + 3, c0); d.value = k.sub; d.font = f({ size: 8, color: { argb: C.muted } }); d.alignment = { horizontal: 'center', vertical: 'middle' };
    for (let cc = c0; cc <= c1; cc++) { ws.getCell(top, cc).border = { top: { style: 'thick', color: { argb: k.accent } } }; ws.getCell(top + 3, cc).border = { bottom: { style: 'thin', color: { argb: C.hair } } }; }
    ws.getCell(top, c0).border = { top: { style: 'thick', color: { argb: k.accent } }, left: { style: 'thin', color: { argb: C.hair } } };
    ws.getCell(top, c1).border = { top: { style: 'thick', color: { argb: k.accent } }, right: { style: 'thin', color: { argb: C.hair } } };
  });
  ws.getCell(top + 3, 4).value = { formula: `IF(B${top + 1}=0,"0% do escopo",TEXT(D${top + 1}/B${top + 1},"0%")&" do escopo")`, result: `${s.approvalRatePct}% do escopo` };
  ws.getRow(top).height = 18; ws.getRow(top + 1).height = 22; ws.getRow(top + 2).height = 22; ws.getRow(top + 3).height = 18; r = top + 5;

  const bars: { ref: string; color: string }[] = [];
  const tableHead = (row: number, parts: [number, number, string][]) => {
    for (const [a, b, t] of parts) { if (b > a) ws.mergeCells(row, a, row, b); ws.getCell(row, a).value = t; headRow(ws.getRow(row), a, b, 26); }
  };
  const rowFmt = (row: number, parts: [number, number][], zebra: boolean) => {
    for (const [a, b] of parts) { if (b > a) ws.mergeCells(row, a, row, b); for (let k = a; k <= b; k++) { const c = ws.getCell(row, k); c.border = hairline; if (zebra) c.fill = fill(C.zebra); c.font = f(); c.alignment = { vertical: 'middle', horizontal: 'center' }; } }
    const l = ws.getCell(row, parts[0][0]); l.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }; l.font = f({ bold: true }); ws.getRow(row).height = 21;
  };

  sect(r, 'Situação das pessoas'); r += 2;
  tableHead(r, [[2, 5, 'Situação'], [6, 6, 'Pessoas'], [7, 10, '% do escopo']]); r++;
  const sit0 = r;
  (['Aprovado', 'Final pendente', 'Em andamento', 'Não iniciado'] as const).forEach((k, i) => {
    rowFmt(r, [[2, 5], [6, 6], [7, 10]], i % 2 === 1);
    const lab = ws.getCell(r, 2); lab.value = k; lab.font = f({ bold: true, color: { argb: SIT[k].fg } });
    for (let cc = 2; cc <= 5; cc++) ws.getCell(r, cc).fill = fill(SIT[k].bg);
    ws.getCell(r, 6).value = { formula: `COUNTIF(${rngSit},"${k}")`, result: s.bySituation[k] }; ws.getCell(r, 6).numFmt = '0';
    ws.getCell(r, 7).value = { formula: `IF($F$${sit0 + 4}=0,0,F${r}/$F$${sit0 + 4})`, result: s.users ? s.bySituation[k] / s.users : 0 }; ws.getCell(r, 7).numFmt = PCT;
    bars.push({ ref: `G${r}`, color: SIT[k].bar }); r++;
  });
  rowFmt(r, [[2, 5], [6, 6], [7, 10]], false); ws.getCell(r, 2).value = 'Total'; ws.getCell(r, 6).value = { formula: `SUM(F${sit0}:F${r - 1})`, result: s.users }; ws.getCell(r, 6).font = f({ bold: true });
  for (let cc = 2; cc <= 10; cc++) ws.getCell(r, cc).border = { top: { style: 'thin', color: { argb: C.ink } }, bottom: { style: 'double', color: { argb: C.ink } } };
  r += 2;

  sect(r, 'Conclusão média por trilha'); r += 2;
  tableHead(r, [[2, 5, 'Trilha'], [6, 6, 'Itens'], [7, 10, 'Média de conclusão'], [11, 12, 'Com 100%']]); r++;
  TRACKS.forEach((t, i) => {
    rowFmt(r, [[2, 5], [6, 6], [7, 10], [11, 12]], i % 2 === 1);
    ws.getCell(r, 2).value = TRACK_LABEL[t]; ws.getCell(r, 6).value = doc.meta.trackTotals[t]; ws.getCell(r, 6).numFmt = '0';
    ws.getCell(r, 7).value = (s.byTrack[t]?.averagePct ?? 0) / 100; ws.getCell(r, 7).numFmt = PCT; ws.getCell(r, 11).value = s.byTrack[t]?.completed ?? 0;
    bars.push({ ref: `G${r}`, color: C.orangeSoft }); r++;
  });
  r++;

  sect(r, 'Por equipe'); r += 2;
  tableHead(r, [[2, 5, 'Equipe'], [6, 6, 'Pessoas'], [7, 7, 'Aprovados'], [8, 8, 'Taxa'], [9, 12, 'Média geral']]); r++;
  if (!s.byTeam.length) { rowFmt(r, [[2, 12]], false); ws.getCell(r, 2).value = 'Sem dados.'; r++; }
  s.byTeam.forEach((t, i) => {
    rowFmt(r, [[2, 5], [6, 6], [7, 7], [8, 8], [9, 12]], i % 2 === 1);
    ws.getCell(r, 2).value = t.team; ws.getCell(r, 6).value = t.users; ws.getCell(r, 7).value = t.approved; ws.getCell(r, 8).value = t.approvalRatePct / 100; ws.getCell(r, 8).numFmt = PCT;
    ws.getCell(r, 9).value = t.averageOverallPct / 100; ws.getCell(r, 9).numFmt = PCT; bars.push({ ref: `I${r}`, color: C.orangeSoft }); r++;
  });
  r++;
  sect(r, 'Níveis Security Champion'); r += 2;
  tableHead(r, [[2, 5, 'Nível'], [6, 6, 'Pessoas']]); r++;
  Object.entries(s.byTier).forEach(([k, v], i) => {
    rowFmt(r, [[2, 5], [6, 6]], i % 2 === 1); ws.getCell(r, 2).value = k; ws.getCell(r, 6).value = v;
    const md = MEDAL[k]; if (md) { for (let cc = 2; cc <= 5; cc++) ws.getCell(r, cc).fill = fill(md.bg); ws.getCell(r, 2).font = f({ bold: true, color: { argb: md.fg } }); }
    r++;
  });
  bars.forEach((b, i) => ws.addConditionalFormatting(dataBar(b.ref, b.color, i + 1)));
  printSetup(ws, doc, 4);

  // ═════════ Treinamentos (ficha básica de cada trilha) ═════════
  {
    const heads = ['Treinamento', 'O que é', 'Referência', 'Público-alvo', 'Formato', 'Módulos', 'Itens', 'Unidade', 'Pontos', 'Avaliação final', 'Média de conclusão', 'Com 100%', 'Observação de fonte'];
    const widths = [28, 46, 28, 20, 38, 10, 9, 13, 9, 34, 14, 10, 46];
    const nT = heads.length + 1;
    banner(wt, nT, 'Treinamentos avaliados', DRAFT, logoId); wt.getColumn(1).width = 2; widths.forEach((w, i) => { wt.getColumn(i + 2).width = w; });
    wt.getRow(6).values = ['', ...heads]; headRow(wt.getRow(6), 2, nT, 34);
    doc.meta.trainings.forEach((t, i) => {
      const row = wt.getRow(7 + i);
      row.values = ['', t.title, t.description, t.reference, t.audience, t.format, t.modules ?? '—', t.items, t.itemUnit, t.points ?? '—', t.finalEvaluation, (s.byTrack[t.id]?.averagePct ?? 0) / 100, s.byTrack[t.id]?.completed ?? 0, t.sourceNote];
      for (let c = 2; c <= nT; c++) {
        const x = row.getCell(c); x.font = f({ size: 9.5 }); x.border = hairline; if (i % 2 === 1) x.fill = fill(C.zebra);
        x.alignment = { vertical: 'middle', horizontal: [7, 8, 10, 12, 13].includes(c) ? 'center' : 'left', wrapText: true, indent: c === 2 ? 1 : 0 };
      }
      row.getCell(2).font = f({ bold: true }); row.getCell(12).numFmt = PCT; row.getCell(14).font = f({ size: 9, color: { argb: C.muted } });
      const longest = Math.max(...[t.description.length / 46, t.format.length / 38, t.finalEvaluation.length / 34, t.sourceNote.length / 46, t.title.length / 28]);
      row.height = Math.max(36, Math.ceil(longest) * 13.5 + 10);
    });
    wt.addConditionalFormatting(dataBar(`L7:L${6 + doc.meta.trainings.length}`, C.orangeSoft, 1));
    const note = wt.getCell(8 + doc.meta.trainings.length, 2); note.value = 'Itens = cenários, laboratórios ou assistentes concluídos para contar 100% da trilha. "Média de conclusão" e "Com 100%" valem para as pessoas deste relatório. Campos [definir …] precisam de validação humana.';
    note.font = f({ size: 8.5, italic: true, color: { argb: C.muted } });
    printSetup(wt, doc, 6);
  }

  // ═════════ Critérios e limites ═════════
  banner(wc, 3, 'Critérios, limites e como verificar', DRAFT, logoId); wc.getColumn(1).width = 2; wc.getColumn(2).width = 28; wc.getColumn(3).width = 110;
  let k = 6;
  const para = (a: string, b: string, bg?: string, fg?: string) => {
    const x = wc.getCell(k, 2); x.value = a; x.font = f({ bold: true, color: { argb: fg ?? C.text } }); x.alignment = { vertical: 'top', indent: 1, wrapText: true }; x.border = hairline; x.fill = fill(bg ?? C.card);
    const y = wc.getCell(k, 3); y.value = b; y.font = f(); y.alignment = { wrapText: true, vertical: 'top', indent: 1 }; y.border = hairline; wc.getRow(k).height = Math.max(22, Math.ceil(b.length / 100) * 14 + 8); k++;
  };
  const sec = (t: string) => {
    wc.mergeCells(k, 2, k, 3);
    for (let c = 2; c <= 3; c++) { const x = wc.getCell(k, c); x.fill = grad(C.orangeTint, C.paper, 0); x.border = { bottom: { style: 'medium', color: { argb: C.orange } }, left: c === 2 ? { style: 'thick', color: { argb: C.orange } } : undefined }; }
    const c = wc.getCell(k, 2); c.value = t; c.font = f({ bold: true, size: 13 }); c.alignment = { vertical: 'middle', indent: 1 }; wc.getRow(k).height = 26; k += 1;
  };
  sec('Situações');
  for (const [a, b] of Object.entries(doc.meta.criteria.situations)) para(a, b, SIT[a]?.bg, SIT[a]?.fg);
  k++; sec('Níveis e avaliações finais');
  para('Níveis', doc.meta.criteria.tiers.map((t) => `${t.label}: ≥ ${t.minPctPerTrack}% em cada trilha`).join(' · '));
  para('Avaliações finais obrigatórias', doc.meta.criteria.mandatoryFinals.map((t) => TRACK_LABEL[t] ?? t).join(' · '));
  k++; sec('Limites e uso');
  doc.meta.notes.forEach((t, i) => para(`Nota ${i + 1}`, t));
  para('Como verificar', 'Exporte o JSON assinado do mesmo relatório (mesmo identificador) e use "Verificar arquivo JSON do relatório" no sistema: o servidor recalcula o hash e a assinatura e detecta qualquer alteração.');
  printSetup(wc, doc, 4);

  return Buffer.from(await wb.xlsx.writeBuffer());
}
