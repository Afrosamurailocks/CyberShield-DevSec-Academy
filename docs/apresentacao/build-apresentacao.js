/* Apresentação à diretoria: CyberShield DevSec Academy (identidade Opah). Estruturada: tema, layouts, placeholders e seções. */
const path = require('node:path');
const fs = require('node:fs');
const pptxgen = require('pptxgenjs');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const sharp = require('sharp');
const Fi = require('react-icons/fi');
const SKILL = 'C:/Users/junio/.claude/skills/synced/142e85b5-e027-4581-b577-98baf3055960_c76e5788-fe3c-47c0-8140-0e8da8f0b26d/pptx';
const { applyTheme } = require(`${SKILL}/scripts/apply_theme.js`);

const A = path.join(__dirname, 'assets');
const OUT = process.argv[2] || path.join(__dirname, 'CyberShield_Apresentacao_Diretoria.pptx');
const SHOT = fs.existsSync(path.join(__dirname, 'shots-aluno', '01-home.png')) ? path.join(__dirname, 'shots-aluno') : null;

// ───────── tema (identidade Opah: grafite + laranja; Arial/Calibri para não quebrar em outra máquina) ─────────
const THEME = {
  name: 'Opah CyberShield', headFontFace: 'Arial', bodyFontFace: 'Calibri',
  colors: { dk1: '1E1E20', lt1: 'FFFFFF', dk2: '27272B', lt2: 'F1F1F2', accent1: 'EE7D30', accent2: 'F4A23F', accent3: '35D6A0', accent4: '4B97D8', accent5: 'E0566B', accent6: '9A9AA0', hlink: 'F4A23F', folHlink: '9A9AA0' },
};
// Deck escuro (identidade da marca e logo branca): "texto" = lt1, "fundo" = dk1, "cartão" = dk2.
const HEX = { ink: '1E1E20', card: '27272B', line: '3A3A40', muted: '9A9AA0', orange: 'EE7D30', soft: 'F4A23F', green: '35D6A0', blue: '4B97D8', rose: 'E0566B', white: 'FFFFFF' };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'CyberShield DevSec Academy: apresentação à diretoria';
pres.author = 'Opah IT';
pres.company = 'Opah IT';
pres.subject = 'Rascunho para revisão humana';
const C = pres.SchemeColor;
const W = 13.33, M = 0.6;

// ───────── layouts ─────────
const LOGO = path.join(A, 'logo.png');
const footer = [
  { image: { path: LOGO, x: M, y: 6.95, w: 0.9, h: 0.186 } },
  { text: { text: 'CyberShield DevSec Academy  ·  Rascunho para revisão humana', options: { x: 1.7, y: 6.9, w: 8, h: 0.3, fontSize: 10, color: C.accent6, fontFace: THEME.bodyFontFace, valign: 'middle', margin: 0 } } },
];
pres.defineSlideMaster({
  title: 'CAPA', background: { color: C.text1 },
  objects: [
    { image: { path: LOGO, x: M, y: 0.55, w: 1.5, h: 0.31 } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.35, w: 7.2, h: 2.0, fontSize: 48, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: M, y: 4.5, w: 6.8, h: 1.2, fontSize: 20, color: C.accent6, fontFace: THEME.bodyFontFace, valign: 'top', align: 'left', margin: 0 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'CONTEUDO', background: { color: C.text1 },
  objects: [
    ...footer,
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.42, w: W - 2 * M, h: 1.1, fontSize: 30, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: 'top', align: 'left', margin: 0 }, text: '' } },
  ],
  slideNumber: { x: W - M - 0.6, y: 6.9, w: 0.6, h: 0.3, color: C.accent6, fontSize: 10, align: 'right' },
});
pres.defineSlideMaster({
  title: 'FECHAMENTO', background: { color: C.text1 },
  objects: [
    { image: { path: LOGO, x: M, y: 0.55, w: 1.5, h: 0.31 } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.6, w: 8, h: 1.2, fontSize: 48, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: M, y: 3.9, w: 7.6, h: 1.6, fontSize: 18, color: C.accent6, fontFace: THEME.bodyFontFace, valign: 'top', align: 'left', margin: 0 }, text: '' } },
  ],
});

// ───────── utilidades ─────────
async function icon(name, color = '#1E1E20', size = 256) {
  const svg = renderToStaticMarkup(React.createElement(Fi[name], { color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}
const ICONS = {};
async function loadIcons(names) { for (const n of names) ICONS[n] = await icon(n); }
const T = (slide, text, o) => slide.addText(text, { isTextBox: true, fontFace: THEME.bodyFontFace, color: C.background1, margin: 0, valign: 'top', ...o });
const card = (slide, x, y, w, h, name) => slide.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: C.text2 }, line: { type: 'none' }, objectName: name || 'Cartão' });
const badge = (slide, ico, x, y, d = 0.6, color = C.accent1) => {
  slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color }, line: { type: 'none' }, objectName: 'Fundo do ícone' });
  slide.addImage({ data: ICONS[ico], x: x + d * 0.2, y: y + d * 0.2, w: d * 0.6, h: d * 0.6, altText: '' });
};
const chip = (slide, text, x, y, w, color = C.accent1, fg = C.text1) => {
  slide.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.34, rectRadius: 0.17, fill: { color }, line: { type: 'none' } });
  T(slide, text, { x, y, w, h: 0.34, fontSize: 12, bold: true, color: fg, align: 'center', valign: 'middle' });
};
const screenshot = (slide, file, x, y, w, caption) => {
  const h = w * 0.625; // capturas 1440x900
  slide.addShape(pres.ShapeType.roundRect, { x: x - 0.06, y: y - 0.06, w: w + 0.12, h: h + 0.12, rectRadius: 0.08, fill: { color: C.text2 }, line: { color: HEX.line, width: 1 }, objectName: 'Moldura da captura' });
  slide.addImage({ path: file, x, y, w, h, altText: caption });
  T(slide, caption, { x: x - 0.06, y: y + h + 0.12, w: w + 0.12, h: 0.3, fontSize: 11, color: C.accent6, italic: true });
};
const content = (title, notes, section) => {
  const s = pres.addSlide({ masterName: 'CONTEUDO', sectionTitle: section });
  s.addText(title, { placeholder: 'title' });
  if (notes) s.addNotes(notes);
  return s;
};
const asset = (f) => path.join(A, f);
const aluno = (f) => (SHOT && fs.existsSync(path.join(SHOT, f)) ? path.join(SHOT, f) : null);

const TR = 'C:/Users/junio/AppData/Local/Temp/deckwork/shots-treinos';
/** Slide de treinamento: captura à esquerda; ficha e "o que o aluno pratica" à direita. */
const detail = (title, notes, file, caption, facts, does, note) => {
  const sl = content(title, notes, 'Conteúdo');
  screenshot(sl, path.join(TR, file), M, 1.8, 6.9, caption);
  card(sl, 7.95, 1.8, 4.78, 2.5);
  T(sl, 'Ficha do treinamento', { x: 8.2, y: 1.9, w: 4.3, h: 0.4, fontSize: 16, bold: true, fontFace: THEME.headFontFace, color: C.accent2 });
  facts.forEach(([k, v], i) => {
    const y = 2.35 + i * 0.37;
    T(sl, k, { x: 8.2, y, w: 1.45, h: 0.37, fontSize: 12, color: C.accent6, valign: 'middle' });
    T(sl, v, { x: 9.65, y, w: 3.0, h: 0.37, fontSize: 13, valign: 'middle' });
  });
  card(sl, 7.95, 4.45, 4.78, 1.68);
  T(sl, 'O que o aluno pratica', { x: 8.2, y: 4.52, w: 4.3, h: 0.36, fontSize: 15, bold: true, fontFace: THEME.headFontFace, color: C.accent2 });
  T(sl, does.map((d, i) => ({ text: d, options: { bullet: true, breakLine: i < does.length - 1 } })), { x: 8.2, y: 4.9, w: 4.3, h: 1.2, fontSize: 12.5, color: C.background2, paraSpaceAfter: 4 });
  if (note) T(sl, note, { x: 7.95, y: 6.3, w: 4.78, h: 0.6, fontSize: 11, italic: true, color: C.accent6 });
  return sl;
};
(async () => {
  await loadIcons(['FiBookOpen', 'FiCheckCircle', 'FiShield', 'FiUsers', 'FiLock', 'FiFileText', 'FiBarChart2', 'FiTarget', 'FiAward', 'FiCpu', 'FiAlertTriangle', 'FiKey', 'FiList', 'FiEye', 'FiServer', 'FiTerminal', 'FiActivity', 'FiClipboard', 'FiFlag', 'FiSearch', 'FiDatabase', 'FiHelpCircle', 'FiClock', 'FiGlobe', 'FiUserCheck', 'FiRepeat', 'FiSlash', 'FiLayers', 'FiTrendingUp', 'FiCalendar', 'FiMail']);

  // ═══ 1. Capa ═══
  pres.addSection({ title: 'Abertura' });
  let s = pres.addSlide({ masterName: 'CAPA', sectionTitle: 'Abertura' });
  s.addText('CyberShield DevSec Academy', { placeholder: 'title' });
  s.addText('Treinamento prático de segurança, com evidência pronta para auditoria', { placeholder: 'body' });
  chip(s, 'RASCUNHO PARA REVISÃO HUMANA', M, 6.2, 3.3);
  T(s, 'Apresentação à diretoria  ·  Opah IT  ·  [inserir data e apresentador]', { x: M + 3.5, y: 6.2, w: 6, h: 0.34, fontSize: 12, color: C.accent6, valign: 'middle' });
  s.addImage({ path: asset('seal.png'), x: 8.4, y: 1.2, w: 4.4, h: 4.4 * (850 / 860), altText: 'Selo Security Champion, nível Ouro' });
  s.addNotes('Abertura. Mensagem: a Opah pode treinar suas equipes em segurança e, ao mesmo tempo, comprovar quem concluiu o quê, quando e com que resultado. Este material é um rascunho para revisão humana; dados institucionais da Opah (datas, responsáveis, prazos) estão marcados entre colchetes.');

  // ═══ 2. Resumo executivo ═══
  pres.addSection({ title: 'Visão geral' });
  s = content('Uma plataforma para treinar, comprovar e auditar a capacitação em segurança',
    'Resumo executivo em uma página. Três verbos: treinar (conteúdo e laboratórios práticos), comprovar (selo assinado e relatório) e governar (acesso por perfil e trilha de auditoria). Os números de conteúdo vêm do estado atual da plataforma. No fim, antecipe o pedido: patrocínio de um piloto e definição de responsáveis.', 'Visão geral');
  const cols = [
    ['FiBookOpen', 'Treinar', 'Seis trilhas com laboratórios práticos e cenários: aplicações web, LGPD, CIS Controls, ISO 27001 e segurança de IA.'],
    ['FiAward', 'Comprovar', 'Selo Security Champion assinado e verificável, com avaliações finais obrigatórias.'],
    ['FiShield', 'Governar', 'Login por perfil, relatório de desempenho (Excel, JSON assinado, PDF) e trilha de auditoria.'],
  ];
  cols.forEach(([ic, t, b], i) => {
    const x = M + i * 4.1;
    card(s, x, 1.75, 3.9, 3.45);
    badge(s, ic, x + 0.35, 2.05, 0.7);
    T(s, t, { x: x + 0.35, y: 2.95, w: 3.2, h: 0.5, fontSize: 24, bold: true, fontFace: THEME.headFontFace });
    T(s, b, { x: x + 0.35, y: 3.55, w: 3.25, h: 1.5, fontSize: 16, color: C.background2 });
  });
  card(s, M, 5.45, W - 2 * M, 1.1);
  badge(s, 'FiFlag', M + 0.3, 5.7, 0.6);
  T(s, [{ text: 'O que pedimos hoje: ', options: { bold: true, color: C.accent2 } }, { text: 'patrocínio de um piloto e a definição de responsáveis por Segurança, DPO e Conformidade (ver Decisões).', options: {} }], { x: M + 1.15, y: 5.55, w: W - 2 * M - 1.5, h: 0.9, fontSize: 18, valign: 'middle' });

  // ═══ 3. Perguntas de auditoria ═══
  s = content('Perguntas que uma auditoria faz, e que a plataforma responde com evidência',
    'Em vez de afirmar problemas da Opah, partimos de perguntas que qualquer auditoria de conscientização faz. Cada pergunta tem uma resposta técnica na plataforma. Se houver um caso real de auditoria da Opah, inclua aqui [inserir caso validado].', 'Visão geral');
  const qa = [
    ['FiUsers', 'Quem concluiu o treinamento?', 'Relatório por pessoa, equipe e organização, com situação: Aprovado, Final pendente, Em andamento ou Não iniciado.'],
    ['FiCalendar', 'Quando e em quais trilhas?', 'Data de conclusão por trilha, primeira e última atividade de cada pessoa.'],
    ['FiCheckCircle', 'Dá para confiar nos números?', 'Só conta o que o servidor valida. O relatório sai assinado e qualquer alteração é detectada.'],
    ['FiEye', 'Quem acessou e quem mudou o quê?', 'Trilha de auditoria encadeada por hash: logins, falhas, mudanças de usuário e exportações.'],
  ];
  qa.forEach(([ic, q, a], i) => {
    const x = M + (i % 2) * 6.15, y = 1.75 + Math.floor(i / 2) * 2.45;
    card(s, x, y, 5.95, 2.25);
    badge(s, ic, x + 0.3, y + 0.3, 0.62);
    T(s, q, { x: x + 1.2, y: y + 0.3, w: 4.5, h: 0.6, fontSize: 20, bold: true, fontFace: THEME.headFontFace, valign: 'middle' });
    T(s, a, { x: x + 1.2, y: y + 1.0, w: 4.5, h: 1.15, fontSize: 15, color: C.background2 });
  });

  // ═══ 4. Como funciona ═══
  s = content('Como funciona: o servidor valida, registra e assina; o navegador só apresenta',
    'Arquitetura em uma página, sem jargão. Princípio central: o navegador nunca declara progresso. O servidor confere cada resposta e cada flag, grava no registro e só então o progresso conta. Daí saem o selo, o relatório e a auditoria. Tecnicamente: front em React, API em Node/Express, registros em arquivos locais nesta versão.', 'Visão geral');
  const flow = [['FiUsers', 'Pessoas', 'Aluno, Gestor, Auditor e Administrador'], ['FiGlobe', 'Plataforma web', 'Trilhas, laboratórios e painéis'], ['FiServer', 'API de validação', 'Confere respostas e flags; assina'], ['FiDatabase', 'Registros', 'Progresso, usuários e auditoria'], ['FiFileText', 'Saídas', 'Selo, Excel, JSON assinado, PDF']];
  const bw = 2.2, gap = 0.28;
  flow.forEach(([ic, t, b], i) => {
    const x = M + i * (bw + gap);
    card(s, x, 2.0, bw, 2.75);
    badge(s, ic, x + 0.3, 2.3, 0.6);
    T(s, t, { x: x + 0.3, y: 3.1, w: bw - 0.5, h: 0.75, fontSize: 16, bold: true, fontFace: THEME.headFontFace });
    T(s, b, { x: x + 0.3, y: 3.9, w: bw - 0.5, h: 0.8, fontSize: 14, color: C.background2 });
    if (i < flow.length - 1) s.addShape(pres.ShapeType.line, { x: x + bw + 0.02, y: 3.37, w: gap - 0.04, h: 0, line: { color: HEX.orange, width: 2, endArrowType: 'triangle' } });
  });
  card(s, M, 5.15, W - 2 * M, 1.4);
  badge(s, 'FiLock', M + 0.3, 5.5, 0.6);
  T(s, [{ text: 'Princípio de confiança: ', options: { bold: true, color: C.accent2 } }, { text: 'editar o armazenamento do navegador não gera selo nem progresso. A identidade vem da conta autenticada e o registro fica no servidor.', options: {} }], { x: M + 1.15, y: 5.3, w: W - 2 * M - 1.5, h: 1.1, fontSize: 17, valign: 'middle' });

  // ═══ 5. Conteúdo ═══
  pres.addSection({ title: 'Conteúdo' });
  s = content('Seis trilhas cobrem aplicações, privacidade, controles, gestão e inteligência artificial',
    'Conteúdo atual da plataforma. As contagens foram extraídas do próprio conteúdo: 11 laboratórios web (OWASP Top 10:2025), 31 cenários de LGPD, 87 de CIS Controls v8.1, 48 de ISO/IEC 27001:2022, 30 de OWASP LLM Top 10 e 10 laboratórios de prompts. Em LGPD, CIS, ISO e LLM há uma avaliação final obrigatória para a conclusão. Fontes: top10.owasp.org/2025 e documentos dos respectivos frameworks.', 'Conteúdo');
  const tr = [
    ['FiTerminal', '11', 'laboratórios web', 'OWASP Top 10:2025', 'Atacar, entender e corrigir. 1.760 pontos.'],
    ['FiShield', '31', 'cenários', 'LGPD', 'Privacidade no dia a dia, com avaliação final.'],
    ['FiList', '87', 'cenários', 'CIS Controls v8.1', 'Controles que previnem os incidentes mais comuns.'],
    ['FiClipboard', '48', 'cenários', 'ISO/IEC 27001:2022', 'Cláusulas, riscos e Anexo A.'],
    ['FiCpu', '30', 'cenários', 'OWASP LLM Top 10 (2025)', 'Riscos de aplicações com IA generativa.'],
    ['FiTarget', '10', 'laboratórios', 'Laboratório de prompts', 'Avaliação final da trilha de IA.'],
  ];
  tr.forEach(([ic, n, u, name, d], i) => {
    const x = M + (i % 3) * 4.1, y = 1.75 + Math.floor(i / 3) * 2.5;
    card(s, x, y, 3.9, 2.3);
    badge(s, ic, x + 0.3, y + 0.28, 0.55);
    T(s, n, { x: x + 1.05, y: y + 0.2, w: 1.3, h: 0.75, fontSize: 40, bold: true, color: C.accent2, fontFace: THEME.headFontFace, valign: 'middle' });
    T(s, u, { x: x + 2.15, y: y + 0.38, w: 1.6, h: 0.5, fontSize: 13, color: C.accent6, valign: 'middle' });
    T(s, name, { x: x + 0.3, y: y + 1.1, w: 3.4, h: 0.4, fontSize: 17, bold: true, fontFace: THEME.headFontFace });
    T(s, d, { x: x + 0.3, y: y + 1.55, w: 3.4, h: 0.65, fontSize: 14, color: C.background2 });
  });

  // ═══ 5b. Anatomia de um módulo ═══
  s = content('Como é um módulo: seis passos, e a resposta é conferida no servidor',
    'Nas trilhas de LGPD, CIS, ISO e LLM, cada módulo segue a mesma sequência: contexto, caso real, decisão em cenários, explicação, boas práticas e referências. A tela mostra um cenário do módulo P01 de LGPD, com uma planilha fictícia. O servidor guarda o gabarito: a resposta correta só aparece depois que o aluno decide, e só acertos validados contam para o progresso. A captura é do ambiente de teste, com dados fictícios.', 'Conteúdo');
  screenshot(s, path.join(TR, 'privacy-decida.png'), M, 1.8, 6.9, 'Aba Decida: cenário com planilha fictícia e alternativas (módulo P01, LGPD)');
  const anat = [['Contexto', 'Por que o tema importa no dia a dia.'], ['Caso real', 'Incidente documentado, com fonte pública citada.'], ['Decida', 'Cenários com alternativas; o servidor confere.'], ['Entenda', 'Explica o porquê de cada alternativa.'], ['Boas práticas', 'O que fazer no trabalho, a partir de agora.'], ['Referências', 'Fontes para aprofundar.']];
  anat.forEach(([t, b], i) => {
    const y = 1.8 + i * 0.72, hot = i === 2;
    card(s, 7.95, y, 4.78, 0.62);
    s.addShape(pres.ShapeType.ellipse, { x: 8.1, y: y + 0.1, w: 0.42, h: 0.42, fill: { color: hot ? C.accent1 : C.text1 }, line: { type: 'none' }, objectName: `Passo ${i + 1}` });
    T(s, String(i + 1), { x: 8.1, y: y + 0.1, w: 0.42, h: 0.42, fontSize: 13, bold: true, align: 'center', valign: 'middle', color: hot ? C.text1 : C.background1 });
    T(s, t, { x: 8.65, y, w: 1.6, h: 0.62, fontSize: 14, bold: true, fontFace: THEME.headFontFace, valign: 'middle' });
    T(s, b, { x: 10.2, y, w: 2.45, h: 0.62, fontSize: 11.5, color: C.background2, valign: 'middle' });
  });
  chip(s, 'Só acertos validados contam como progresso', 7.95, 6.3, 4.78, C.accent2);

  // ═══ 6. Aprender fazendo ═══
  s = content('Aprender fazendo: o aluno ataca, entende a causa e aplica a correção',
    'Os laboratórios web seguem o ciclo atacar, entender e corrigir e são encadeados (kill chain): o achado de um lab alimenta o próximo. O backend é propositalmente vulnerável e deve ser usado apenas em ambiente local de treino. Isso é dito na própria tela. A captura é do ambiente de teste, com dados fictícios.', 'Conteúdo');
  screenshot(s, path.join(TR, 'owasp-lab.png'), M, 1.8, 6.9, 'Laboratório A01: missão, nível, pontos e kill chain (ambiente de teste)');
  const steps = [['FiTerminal', 'Atacar', 'Requisições HTTP reais contra o endpoint vulnerável; a flag aparece na resposta.'], ['FiSearch', 'Entender', 'Causa-raiz e o código exato que o desenvolvedor escreveu.'], ['FiCheckCircle', 'Corrigir', 'Versão segura e checklist de remediação.']];
  steps.forEach(([ic, t, b], i) => {
    const y = 1.8 + i * 1.5;
    card(s, 7.95, y, 4.78, 1.3);
    badge(s, ic, 8.2, y + 0.33, 0.62);
    T(s, t, { x: 9.05, y: y + 0.15, w: 3.5, h: 0.4, fontSize: 18, bold: true, fontFace: THEME.headFontFace });
    T(s, b, { x: 9.05, y: y + 0.58, w: 3.5, h: 0.7, fontSize: 13, color: C.background2 });
  });
  chip(s, 'Ambiente de treino isolado: uso apenas local', 7.95, 6.3, 4.78, C.accent2);

  // ═══ 6b. Um slide por treinamento ═══
  detail('LGPD: privacidade para todos os colaboradores, em situações do dia a dia',
    'Trilha de privacidade e proteção de dados, voltada a todos os colaboradores. Nove módulos, 31 cenários; o último módulo (P09) é a avaliação final, com 15 cenários que combinam os temas. A duração de 128 minutos é a estimativa editorial exibida na tela e deve ser validada no piloto. O conteúdo é educativo, não é parecer jurídico, e precisa de revisão de Privacidade e Jurídico antes de uso amplo. A captura é do ambiente de teste.',
    'privacy-visao.png', 'Visão da trilha LGPD: módulos, cenários e duração estimada',
    [['Referência', 'LGPD (Lei 13.709/2018)'], ['Público', 'Todos os colaboradores'], ['Estrutura', '9 módulos · 31 cenários'], ['Duração', '128 min (estimativa editorial)'], ['Final', 'P09 · 15 cenários']],
    ['Reconhecer dado pessoal e dado sensível', 'Decidir sobre bases legais e direitos do titular', 'Agir em incidentes e ao compartilhar com terceiros'],
    'Conteúdo educativo, não é parecer jurídico. Revisão de Privacidade/Jurídico [pendente].');

  detail('CIS Controls v8.1: os 18 controles que previnem os incidentes mais comuns',
    'Um módulo por controle (C01 a C18) e uma avaliação final integrada (C19). Cada controle traz um caso real com fonte pública, salvaguardas-chave e cenários de decisão: 87 no total. Duração estimada na tela: 297 minutos, a validar no piloto. A lista de salvaguardas é uma seleção editorial e deve ser conferida no CIS Controls Navigator antes de uso externo. Não existe uma edição CIS 2026; a versão atual verificada é a v8.1.',
    'cis-visao.png', 'Visão da trilha CIS: controles concluídos e situação de cada um',
    [['Referência', 'CIS Controls v8.1'], ['Público', '[definir público-alvo]'], ['Estrutura', '19 módulos · 87 cenários'], ['Duração', '297 min (estimativa editorial)'], ['Final', 'C19 · avaliação integrada']],
    ['Um controle por módulo, com caso real de fonte pública', 'Decidir em cenários base e avançados', 'Cruzar controles na avaliação final'],
    'Salvaguardas são seleção editorial; conferir no CIS Controls Navigator.');

  detail('ISO/IEC 27001:2022: preparação para o sistema de gestão, até a avaliação em formato de auditoria',
    'Preparação para a norma: cláusulas 4 a 10 e os quatro temas do Anexo A (organizacionais, pessoas, físicos e tecnológicos), mais uma avaliação final em formato de auditoria. Doze módulos e 48 cenários; 236 minutos de estimativa editorial. A norma é paga: o conteúdo é paráfrase didática e a numeração de requisitos e controles é seleção editorial, a conferir na edição oficial. O escopo do sistema de gestão da Opah é [inserir escopo do SGSI Opah].',
    'iso-visao.png', 'Visão da trilha ISO/IEC 27001:2022: cláusulas e temas do Anexo A',
    [['Referência', 'ISO/IEC 27001:2022'], ['Público', '[definir público-alvo]'], ['Estrutura', '12 módulos · 48 cenários'], ['Duração', '236 min (estimativa editorial)'], ['Final', 'Formato de auditoria']],
    ['Cláusulas 4 a 10: contexto, liderança, planejamento, apoio, operação', 'Os quatro temas do Anexo A', 'Responder a uma avaliação em formato de auditoria'],
    'Paráfrase didática (norma paga). Escopo do SGSI: [inserir escopo].');

  detail('Segurança com LLM: os dez riscos da OWASP em aplicações com IA generativa',
    'Dez módulos (LLM01 a LLM10), um por categoria do OWASP Top 10 for LLM Applications 2025, com 30 cenários, incluindo conversas de várias rodadas. A avaliação final da trilha é o Laboratório de prompts, no próximo slide. Duração estimada na tela: 172 minutos, a validar no piloto. Os nomes em português das categorias são tradução editorial; conferir em genai.owasp.org.',
    'llm-visao.png', 'Visão da trilha LLM: módulos, cenários e avaliação final no laboratório',
    [['Referência', 'OWASP LLM Top 10 (2025)'], ['Público', '[definir público-alvo]'], ['Estrutura', '10 módulos · 30 cenários'], ['Duração', '172 min (estimativa editorial)'], ['Final', 'Laboratório de prompts']],
    ['Reconhecer injeção de prompt e vazamento de dados', 'Avaliar dependências, plugins e agentes com permissão demais', 'Decidir a mitigação em cenários multi-turn'],
    'Nomes das categorias em português: tradução editorial.');

  // ═══ 7. Laboratório de prompts ═══
  s = content('Laboratório de prompts: segurança de IA na prática, com ajuda gradual ao analista',
    'Dez assistentes simulados, cada um com uma falha do OWASP LLM Top 10. São simulados de propósito: não usam LLM real nem API externa, o que torna o exercício reproduzível e sem exposição de dados. Cada laboratório tem quatro níveis de dica, do mais sutil ao exemplo pronto, e a flag é validada no servidor. Limite: simulação não substitui teste em modelo real.', 'Conteúdo');
  const hints = [['Observe', 'O que fazer primeiro e o que reparar na resposta.'], ['Por quê', 'O conceito por trás da falha e a categoria do OWASP.'], ['Monte o prompt', 'A estrutura do ataque, em partes.'], ['Na prática', 'Exemplo pronto e nota para o relatório.']];
  hints.forEach(([t, b], i) => {
    const h = 1.4 + i * 0.6, x = M + i * 3.05, y = 5.45 - h;
    s.addShape(pres.ShapeType.roundRect, { x, y: 1.95 + (3.5 - h) + 0, w: 2.85, h: h + 0.0, rectRadius: 0.1, fill: { color: i === 3 ? C.accent1 : C.text2 }, line: { type: 'none' }, objectName: `Degrau ${i + 1}` });
    T(s, t, { x: x + 0.25, y: 1.95 + (3.5 - h) + 0.2, w: 2.4, h: 0.45, fontSize: 18, bold: true, fontFace: THEME.headFontFace, color: i === 3 ? C.text1 : C.background1 });
    T(s, b, { x: x + 0.25, y: 1.95 + (3.5 - h) + 0.7, w: 2.4, h: h - 0.8, fontSize: 14, color: i === 3 ? C.text1 : C.background2 });
  });
  card(s, M, 5.7, W - 2 * M, 0.95);
  T(s, [{ text: 'Assistentes simulados: ', options: { bold: true, color: C.accent2 } }, { text: 'sem LLM real e sem API externa, portanto reproduzíveis e sem exposição de dados. Cada exercício termina com uma lição de correção.', options: {} }], { x: M + 0.35, y: 5.7, w: W - 2 * M - 0.7, h: 0.95, fontSize: 16, valign: 'middle' });

  // ═══ 7b. Laboratório de prompts na prática ═══
  detail('Laboratório de prompts na prática: conversar com o assistente, capturar a flag, aprender a correção',
    'Esta é a avaliação final da trilha LLM. São dez assistentes simulados no servidor, um por categoria do OWASP LLM Top 10, sem modelo real nem dados reais. O aluno conversa com o assistente, tenta cumprir o objetivo e valida a flag; pode pedir dicas em quatro níveis. Depois de capturar, vê por que funcionou e como corrigir. Limite: simulação não substitui teste em modelo real. A captura é do ambiente de teste.',
    'llm-labprompts.png', 'Laboratório de prompts: assistente simulado, dicas e validação da flag',
    [['Referência', 'OWASP LLM Top 10 (2025)'], ['Papel', 'Avaliação final da trilha LLM'], ['Estrutura', '10 assistentes · 1 flag cada'], ['Ajuda', 'Dicas em 4 níveis'], ['Validação', 'Flag conferida no servidor']],
    ['Conversar com o assistente e tentar o ataque', 'Pedir dica só se travar, do sutil ao exemplo pronto', 'Ler a lição de correção depois da captura'],
    'Assistentes simulados: não substituem teste em modelo real.');

  // ═══ 8. Security Champion ═══
  pres.addSection({ title: 'Comprovação' });
  s = content('Jornada Security Champion: nível pelo menor desempenho e selo assinado pelo servidor',
    'O nível é definido pela trilha mais atrasada, de modo que não se chega a Ouro com lacuna em um tema. Bronze 70%, Prata 85%, Ouro 100% em cada trilha. As avaliações finais são obrigatórias. O selo é assinado (HMAC) e pode ser verificado por qualquer pessoa pelo ID. É um selo interno de conclusão de trilha, não uma certificação profissional. Os limites por nível são premissa editorial a validar com a AI Guild e a Segurança da Informação.', 'Comprovação');
  s.addImage({ path: asset('seal.png'), x: M + 0.2, y: 1.8, w: 4.2, h: 4.2 * (850 / 860), altText: 'Selo Security Champion, nível Ouro' });
  const tiers = [['Bronze', '70%', 'B8793F'], ['Prata', '85%', 'AEB8C4'], ['Ouro', '100%', 'DFB04A']];
  tiers.forEach(([n, p, col], i) => {
    const y = 1.8 + i * 1.12;
    card(s, 5.2, y, 7.53, 0.95);
    s.addShape(pres.ShapeType.ellipse, { x: 5.45, y: y + 0.2, w: 0.55, h: 0.55, fill: { color: col }, line: { type: 'none' }, objectName: `Medalha ${n}` });
    T(s, n, { x: 6.25, y, w: 2.2, h: 0.95, fontSize: 22, bold: true, fontFace: THEME.headFontFace, valign: 'middle' });
    T(s, `${p} em cada trilha`, { x: 8.3, y, w: 4.2, h: 0.95, fontSize: 18, color: C.background2, valign: 'middle', align: 'right' });
  });
  card(s, 5.2, 5.2, 7.53, 1.45);
  T(s, [
    { text: 'Avaliações finais obrigatórias: ', options: { bold: true, color: C.accent2 } }, { text: 'sem concluí-las, nenhum nível é liberado, mesmo com percentual alto.', options: { breakLine: true } },
    { text: 'Verificação pública: ', options: { bold: true, color: C.accent2 } }, { text: 'cada selo tem ID e assinatura conferíveis pelo servidor.', options: {} },
  ], { x: 5.5, y: 5.3, w: 7.0, h: 1.25, fontSize: 15, valign: 'middle', paraSpaceAfter: 6 });

  // ═══ 9. Perfis ═══
  pres.addSection({ title: 'Governança' });
  s = content('Governança de acesso: quatro perfis, com separação de funções',
    'O acesso é por conta e perfil. O Auditor é somente leitura: lê e exporta, mas não altera nada, o que dá independência à evidência. O Gestor enxerga apenas a própria equipe. O Administrador gerencia usuários e não pode desativar a si mesmo nem remover o último administrador. Login local nesta versão; ponto de extensão para SSO corporativo [inserir provedor SSO Opah].', 'Governança');
  const hdr = (t) => ({ text: t, options: { bold: true, color: HEX.ink, fill: { color: HEX.orange }, fontFace: THEME.headFontFace, fontSize: 14, valign: 'middle' } });
  const cell = (t, o = {}) => ({ text: t, options: { color: HEX.white, fill: { color: HEX.card }, fontFace: THEME.bodyFontFace, fontSize: 15, valign: 'middle', ...o } });
  s.addTable([
    [hdr('Perfil'), hdr('Vê'), hdr('Pode')],
    [cell('Aluno', { bold: true }), cell('O próprio progresso e relatório'), cell('Treinar, emitir o seu selo, exportar o seu desempenho')],
    [cell('Gestor', { bold: true, fill: { color: '2F2F34' } }), cell('Relatório da sua equipe', { fill: { color: '2F2F34' } }), cell('Acompanhar e exportar o desempenho da equipe', { fill: { color: '2F2F34' } })],
    [cell('Auditor', { bold: true }), cell('Usuários, relatórios e trilha de auditoria'), cell('Somente leitura; exporta evidências; não altera nada')],
    [cell('Administrador', { bold: true, fill: { color: '2F2F34' } }), cell('Tudo, incluindo a administração', { fill: { color: '2F2F34' } }), cell('Criar, editar e desativar usuários; redefinir senhas', { fill: { color: '2F2F34' } })],
  ], { x: M, y: 1.85, w: W - 2 * M, colW: [2.4, 4.6, 5.13], rowH: [0.55, 0.85, 0.85, 0.85, 0.85], border: { type: 'solid', color: HEX.line, pt: 1 }, margin: [0.05, 0.18, 0.05, 0.18], objectName: 'Tabela de perfis' });
  chip(s, 'Login local hoje; SSO corporativo como próximo passo', M, 6.3, 5.7, C.accent2);

  // ═══ 10. Relatório ═══
  s = content('Relatório de desempenho: da visão executiva ao registro de cada pessoa',
    'O relatório mostra indicadores, conclusão por trilha, por equipe e por pessoa, com filtros e datas. Exporta em Excel (painel formatado com a marca), JSON assinado e PDF. O JSON assinado pode ser verificado na própria tela: o servidor recalcula hash e assinatura e acusa qualquer alteração. A assinatura prova integridade desde a geração, não aderência a uma norma. A captura é do ambiente de teste com dados fictícios.', 'Governança');
  screenshot(s, path.join('C:/Users/junio/AppData/Local/Temp/access-e2e-k3h0vE', 'admin-05-relatorio.png'), M, 1.8, 6.9, 'Relatório de desempenho (ambiente de teste, dados fictícios)');
  const outs = [['FiBarChart2', 'Excel', 'Painel com indicadores, barras e abas por pessoa e trilha'], ['FiLock', 'JSON assinado', 'Verificável: qualquer alteração é detectada'], ['FiFileText', 'PDF', 'Impressão com id, hash e rodapé de rascunho']];
  outs.forEach(([ic, t, b], i) => {
    const y = 1.8 + i * 1.5;
    card(s, 7.95, y, 4.78, 1.3);
    badge(s, ic, 8.2, y + 0.33, 0.62);
    T(s, t, { x: 9.05, y: y + 0.15, w: 3.5, h: 0.4, fontSize: 18, bold: true, fontFace: THEME.headFontFace });
    T(s, b, { x: 9.05, y: y + 0.58, w: 3.5, h: 0.7, fontSize: 13, color: C.background2 });
  });
  chip(s, 'Só acertos validados são registrados', 7.95, 6.3, 4.78, C.accent2);

  // ═══ 11. Auditoria ═══
  s = content('Trilha de auditoria: cada evento é amarrado ao anterior por hash',
    'Todo login, falha, bloqueio, troca de senha, mudança de usuário, vínculo de progresso, emissão de selo e exportação vira um evento. Cada evento carrega o hash do anterior. Editar, remover ou reordenar uma linha quebra a cadeia e a tela mostra Cadeia comprometida. Limite honesto: quem controla o arquivo e a chave consegue refazer a cadeia; recomenda-se guardar o hash do último evento em repositório externo imutável [definir com a Conformidade].', 'Governança');
  screenshot(s, path.join('C:/Users/junio/AppData/Local/Temp/access-e2e-k3h0vE', 'auditora-02-auditoria.png'), M, 1.8, 6.9, 'Trilha de auditoria (ambiente de teste, dados fictícios)');
  const au = [['FiEye', 'O que registra', 'Acessos, falhas, mudanças, exportações e acessos negados. Nunca senhas nem tokens.'], ['FiRepeat', 'Como protege', 'Edição, remoção ou reordenação quebram a cadeia e são exibidas na tela.'], ['FiAlertTriangle', 'Limite conhecido', 'Para evidência forte, guardar o hash final fora do servidor [definir].']];
  au.forEach(([ic, t, b], i) => {
    const y = 1.8 + i * 1.5;
    card(s, 7.95, y, 4.78, 1.3);
    badge(s, ic, 8.2, y + 0.33, 0.62, i === 2 ? C.accent2 : C.accent1);
    T(s, t, { x: 9.05, y: y + 0.15, w: 3.5, h: 0.4, fontSize: 18, bold: true, fontFace: THEME.headFontFace });
    T(s, b, { x: 9.05, y: y + 0.58, w: 3.5, h: 0.7, fontSize: 13, color: C.background2 });
  });

  // ═══ 12. Segurança da plataforma ═══
  pres.addSection({ title: 'Confiança' });
  s = content('A própria plataforma foi construída com controles de segurança e testada de ponta a ponta',
    'Controles implementados e cobertos por testes automatizados: senha com scrypt, bloqueio por tentativas, mensagem de erro única, sessão com cookie HttpOnly e SameSite, proteção contra CSRF, controle de acesso por perfil negado por padrão e log sem segredos. Verificação: 106 testes automatizados de conteúdo, segurança e relatório, 44 testes dos laboratórios e duas jornadas ponta a ponta com navegador real (Playwright). Isto reduz risco, mas não substitui uma revisão independente de segurança [definir].', 'Confiança');
  const sec = [['FiKey', 'Senhas', 'Hash scrypt com salt; política de 12+ caracteres; troca obrigatória no primeiro acesso.'], ['FiSlash', 'Bloqueio', 'Cinco falhas bloqueiam a conta por 15 minutos; erro único, sem revelar se o e-mail existe.'], ['FiLock', 'Sessão', 'Cookie HttpOnly e SameSite; expira por inatividade e por tempo; encerra ao desativar.'], ['FiUserCheck', 'Acesso', 'Perfis negados por padrão; tentativas negadas são auditadas; anti-CSRF.'], ['FiEye', 'Rastro', 'Auditoria encadeada, sem segredos; último administrador protegido.'], ['FiDatabase', 'Dados', 'Senhas nunca em claro, nem nos arquivos nem no log de auditoria.']];
  sec.forEach(([ic, t, b], i) => {
    const x = M + (i % 3) * 4.1, y = 1.75 + Math.floor(i / 3) * 1.95;
    card(s, x, y, 3.9, 1.75);
    badge(s, ic, x + 0.28, y + 0.25, 0.55);
    T(s, t, { x: x + 1.05, y: y + 0.25, w: 2.6, h: 0.55, fontSize: 18, bold: true, fontFace: THEME.headFontFace, valign: 'middle' });
    T(s, b, { x: x + 0.28, y: y + 0.9, w: 3.4, h: 0.8, fontSize: 13, color: C.background2 });
  });
  card(s, M, 5.75, W - 2 * M, 0.9);
  T(s, [{ text: 'Verificação automatizada: ', options: { bold: true, color: C.accent2 } }, { text: '106 testes de conteúdo, segurança e relatório · 44 testes dos laboratórios · 2 jornadas ponta a ponta com navegador real.', options: {} }], { x: M + 0.35, y: 5.75, w: W - 2 * M - 0.7, h: 0.9, fontSize: 16, valign: 'middle' });

  // ═══ 13. LGPD ═══
  s = content('Privacidade e LGPD: dados mínimos hoje, política de retenção a definir',
    'A plataforma coleta o mínimo para cumprir o propósito de comprovar treinamento: nome, e-mail, equipe e progresso, e na auditoria também o IP. O registro de treinamento de uma conta é retido porque é evidência; pedidos de eliminação seguem o DPO. Base legal, prazo de retenção e canal de atendimento ao titular não foram definidos e dependem do DPO [definir].', 'Confiança');
  card(s, M, 1.8, 5.95, 4.55);
  T(s, 'O que a plataforma guarda', { x: M + 0.4, y: 2.05, w: 5.2, h: 0.5, fontSize: 22, bold: true, fontFace: THEME.headFontFace });
  T(s, [
    { text: 'Nome, e-mail, perfil e equipe', options: { bullet: true, breakLine: true } },
    { text: 'Respostas corretas e datas de conclusão', options: { bullet: true, breakLine: true } },
    { text: 'Na auditoria: e-mail do autor e IP de acesso', options: { bullet: true, breakLine: true } },
    { text: 'Nunca: senhas em claro, tokens ou corpo das requisições', options: { bullet: true } },
  ], { x: M + 0.4, y: 2.75, w: 5.2, h: 3.5, fontSize: 19, paraSpaceAfter: 16, color: C.background2 });
  card(s, 6.78, 1.8, 5.95, 4.55);
  badge(s, 'FiHelpCircle', 7.18, 2.05, 0.5, C.accent2);
  T(s, 'Decisões pendentes com o DPO', { x: 7.85, y: 2.05, w: 4.7, h: 0.5, fontSize: 22, bold: true, fontFace: THEME.headFontFace, valign: 'middle' });
  T(s, [
    { text: 'Base legal do tratamento [definir]', options: { bullet: true, breakLine: true } },
    { text: 'Prazo de retenção do registro [definir]', options: { bullet: true, breakLine: true } },
    { text: 'Canal e prazo de eliminação a pedido do titular [definir]', options: { bullet: true, breakLine: true } },
    { text: 'Quem pode ver relatórios com dados pessoais [definir]', options: { bullet: true } },
  ], { x: 7.18, y: 2.75, w: 5.2, h: 3.5, fontSize: 19, paraSpaceAfter: 16, color: C.background2 });

  // ═══ 14. Estado atual ═══
  pres.addSection({ title: 'Maturidade' });
  s = content('Onde estamos: o núcleo está pronto; faltam decisões e integrações corporativas',
    'À esquerda, o que já existe e foi testado. À direita, o que depende de decisão ou insumo da Opah: SSO, MFA, banco corporativo, recuperação de senha, repositório imutável para o hash de auditoria e aprovação dos critérios do selo. Também há um item de conteúdo: o gabarito em PDF do professor ainda está na numeração do OWASP 2021 e precisa ser regenerado para 2025.', 'Maturidade');
  card(s, M, 1.8, 5.95, 4.6);
  badge(s, 'FiCheckCircle', M + 0.35, 2.05, 0.55, C.accent3);
  T(s, 'Pronto e testado', { x: M + 1.1, y: 2.05, w: 4.5, h: 0.55, fontSize: 22, bold: true, fontFace: THEME.headFontFace, valign: 'middle' });
  T(s, [
    { text: 'Seis trilhas e 11 laboratórios web (OWASP 2025)', options: { bullet: true, breakLine: true } },
    { text: 'Laboratório de prompts com 4 níveis de dica', options: { bullet: true, breakLine: true } },
    { text: 'Selo assinado e avaliações finais obrigatórias', options: { bullet: true, breakLine: true } },
    { text: 'Login, perfis e gestão de usuários', options: { bullet: true, breakLine: true } },
    { text: 'Relatório em Excel, JSON assinado e PDF', options: { bullet: true, breakLine: true } },
    { text: 'Trilha de auditoria encadeada', options: { bullet: true } },
  ], { x: M + 0.4, y: 2.85, w: 5.2, h: 3.6, fontSize: 18, paraSpaceAfter: 12, color: C.background2 });
  card(s, 6.78, 1.8, 5.95, 4.6);
  badge(s, 'FiClock', 7.13, 2.05, 0.55, C.accent2);
  T(s, 'Depende de decisão ou insumo', { x: 7.88, y: 2.05, w: 4.7, h: 0.55, fontSize: 22, bold: true, fontFace: THEME.headFontFace, valign: 'middle' });
  T(s, [
    { text: 'SSO corporativo [inserir provedor SSO Opah]', options: { bullet: true, breakLine: true } },
    { text: 'Autenticação multifator', options: { bullet: true, breakLine: true } },
    { text: 'Banco corporativo e alta disponibilidade', options: { bullet: true, breakLine: true } },
    { text: 'Recuperação de senha por e-mail', options: { bullet: true, breakLine: true } },
    { text: 'Repositório imutável para o hash de auditoria', options: { bullet: true, breakLine: true } },
    { text: 'Aprovação dos critérios de nível e do selo', options: { bullet: true } },
  ], { x: 7.18, y: 2.85, w: 5.2, h: 3.6, fontSize: 18, paraSpaceAfter: 12, color: C.background2 });

  // ═══ 15. Limites ═══
  s = content('Limites que a diretoria deve conhecer antes de usar como evidência',
    'Transparência sobre limites. O selo é interno, não uma certificação. Os assistentes de IA são simulados. Os quizzes têm 3 ou 4 opções e podem ser automatizados dentro do limite de requisições; o registro reduz fraude casual, não quem automatiza. Só acertos são registrados. A versão atual roda em instância única com arquivos locais. Cada limite tem uma mitigação proposta.', 'Maturidade');
  const lim = [['Selo interno', 'Não é certificação profissional. Aprovação pendente [inserir responsável pela emissão].'], ['IA simulada', 'Os assistentes não são modelos reais; não substituem teste em modelo real.'], ['Quizzes automatizáveis', 'O registro reduz fraude casual. Combinar com SSO e revisão humana quando necessário.'], ['Só acertos', 'Sem tentativas, erros ou tempo de estudo. Desempenho = conclusão e datas.'], ['Instância única', 'Arquivos locais e sessões em memória. Produção pede banco e gestão de segredos.'], ['Auditoria refazível', 'Quem controla arquivo e chave refaz a cadeia. Guardar o hash final fora do servidor.']];
  lim.forEach(([t, b], i) => {
    const x = M + (i % 3) * 4.1, y = 1.75 + Math.floor(i / 3) * 2.45;
    card(s, x, y, 3.9, 2.25);
    badge(s, 'FiAlertTriangle', x + 0.3, y + 0.28, 0.5, C.accent2);
    T(s, t, { x: x + 1.0, y: y + 0.28, w: 2.7, h: 0.5, fontSize: 17, bold: true, fontFace: THEME.headFontFace, valign: 'middle' });
    T(s, b, { x: x + 0.3, y: y + 1.0, w: 3.35, h: 1.2, fontSize: 14, color: C.background2 });
  });

  // ═══ 16. Decisões ═══
  pres.addSection({ title: 'Decisão' });
  s = content('Decisões que pedimos à diretoria',
    'Quatro decisões. Nenhuma envolve compromisso de prazo ou orçamento nesta fase; esses pontos ficam para depois do alinhamento. Sugestão de fala: queremos começar por um piloto controlado para validar o valor antes de escalar. Escopo, público e responsáveis são itens a preencher: [inserir].', 'Decisão');
  const dec = [['FiFlag', 'Patrocinar um piloto', 'Escolher o público e o escopo do piloto [inserir].'], ['FiUsers', 'Designar responsáveis', 'Segurança da Informação, DPO, Conformidade e AI Guild [inserir nomes].'], ['FiKey', 'Definir acesso e retenção', 'Provedor de SSO e política de retenção dos registros [definir].'], ['FiAward', 'Validar os critérios', 'Níveis do selo e avaliações finais obrigatórias [aprovar].']];
  dec.forEach(([ic, t, b], i) => {
    const x = M + (i % 2) * 6.15, y = 1.75 + Math.floor(i / 2) * 2.45;
    card(s, x, y, 5.95, 2.25);
    badge(s, ic, x + 0.35, y + 0.35, 0.7);
    T(s, t, { x: x + 1.35, y: y + 0.35, w: 4.4, h: 0.7, fontSize: 22, bold: true, fontFace: THEME.headFontFace, valign: 'middle' });
    T(s, b, { x: x + 1.35, y: y + 1.2, w: 4.4, h: 0.95, fontSize: 16, color: C.background2 });
  });

  // ═══ 17. Próximos passos ═══
  s = content('Próximos passos propostos, em três fases',
    'Roadmap sem datas, porque prazos e responsáveis ainda dependem das decisões anteriores. Fase 1: revisar e validar. Fase 2: piloto com um grupo. Fase 3: ampliar. Os prazos serão definidos junto com a diretoria [definir prazos e responsáveis].', 'Decisão');
  const ph = [['Validar', 'Revisão da Segurança, do DPO e da Conformidade; decisão de SSO; aprovação dos critérios.'], ['Pilotar', 'Grupo reduzido usa a plataforma; medir conclusão e coletar feedback; ajustar conteúdo.'], ['Ampliar', 'Integrar SSO, banco corporativo e auditoria externa; expandir o público.']];
  ph.forEach(([t, b], i) => {
    const x = M + i * 4.1;
    s.addShape(pres.ShapeType.chevron, { x, y: 1.9, w: 4.0, h: 1.1, fill: { color: i === 0 ? C.accent1 : C.text2 }, line: { type: 'none' }, objectName: `Fase ${i + 1}` });
    T(s, `Fase ${i + 1}: ${t}`, { x: x + 0.7, y: 1.9, w: 2.7, h: 1.1, fontSize: 18, bold: true, fontFace: THEME.headFontFace, valign: 'middle', color: i === 0 ? C.text1 : C.background1 });
    card(s, x, 3.3, 3.85, 2.2);
    T(s, b, { x: x + 0.3, y: 3.55, w: 3.3, h: 1.8, fontSize: 16, color: C.background2 });
  });
  T(s, 'Prazos, responsáveis e orçamento: [definir com a diretoria]', { x: M, y: 5.85, w: W - 2 * M, h: 0.5, fontSize: 16, color: C.accent2, bold: true });

  // ═══ 18. Fechamento ═══
  s = pres.addSlide({ masterName: 'FECHAMENTO', sectionTitle: 'Decisão' });
  s.addText('Perguntas?', { placeholder: 'title' });
  s.addText('Contato: [inserir responsável e e-mail]\nMaterial em rascunho para revisão humana. Dados institucionais da Opah marcados entre colchetes.', { placeholder: 'body' });
  s.addImage({ path: asset('seal.png'), x: 8.6, y: 1.5, w: 4.2, h: 4.2 * (850 / 860), altText: 'Selo Security Champion' });
  s.addNotes('Encerramento e perguntas. Reforce o pedido: patrocínio de um piloto e responsáveis. Tenha à mão a demonstração ao vivo (ambiente de treino local) e o relatório de exemplo.');

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('gerado:', OUT);
})();
