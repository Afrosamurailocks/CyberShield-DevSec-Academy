/**
 * API do CyberShield DevSec Academy.
 * Backend PROPOSITALMENTE vulneravel para treino de desenvolvedores (OWASP Top 10).
 * Rode apenas localmente, em ambiente de treinamento.
 */
import 'dotenv/config';
import express from 'express';
import { publicLabs, findLab } from './labs/metadata.js';
import { mountLabs } from './labs/routes.js';
import { publicPrivacyModules, checkPrivacyAnswer, publicModules, checkAnswer, PRIVACY_MODULES } from './labs/privacy.js';
import { CIS_MODULES, CIS_VISUALS } from './labs/cis.js';
import { ISO_MODULES, ISO_VISUALS } from './labs/iso.js';
import { LLM_MODULES, LLM_VISUALS } from './labs/llm.js';
import { publicLabs as publicPromptLabs, labChat, labHint, labSubmit, PROMPT_LABS } from './labs/llmLab.js';
import { createLedger, LEARNER_RE, type TrailId } from './champion.js';
import path from 'node:path';
import { initDb, usingPostgres } from './db.js';

const app = express();
// Nao divulgar a versao/framework via header X-Powered-By (SonarCloud typescript:S5689).
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

// Banner de aviso em todas as respostas (ambiente de treino)
app.use((_req, res, next) => {
  res.setHeader('X-Training-Environment', 'CyberShield-DevSec-Academy');
  next();
});

const api = express.Router();

// catalogo (sem flags)
api.get('/labs', (_req, res) => res.json({ labs: publicLabs() }));
api.get('/health', (_req, res) => res.json({ status: 'ok', labs: publicLabs().length }));

// validacao de flag (confere + devolve pontos; progresso fica no client)
api.post('/validate-flag', answerLimiter, (req, res) => {
  const { labId, flag } = req.body ?? {};
  const lab = findLab(String(labId));
  if (!lab) return res.status(404).json({ correct: false, error: 'lab inexistente' });
  const correct = typeof flag === 'string' && flag.trim() === lab.flag;
  const lid = learnerOf(req);
  if (lid && correct) ledger.recordLab(lid, lab.id);
  res.json({ correct, points: correct ? lab.points : 0, owaspId: lab.owaspId });
});

// Limite simples por IP nas rotas de resposta das trilhas (evita forca bruta do gabarito).
const hits = new Map<string, { n: number; reset: number }>();
function answerLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const now = Date.now();
  const key = req.ip ?? 'local';
  const cur = hits.get(key);
  if (!cur || cur.reset < now) hits.set(key, { n: 1, reset: now + 60_000 });
  else if (++cur.n > 180) return res.status(429).json({ error: 'muitas tentativas; aguarde um minuto' });
  next();
}

// Registro de progresso no servidor (so grava quando o servidor valida a resposta/flag) e selo Security Champion.
const countScenarios = (mods: { scenarios: unknown[] }[]) => mods.reduce((n, m) => n + m.scenarios.length, 0);
const ledger = createLedger({
  dir: path.join(process.cwd(), 'data'),
  totals: () => ({
    privacy: countScenarios(PRIVACY_MODULES), cis: countScenarios(CIS_MODULES), iso: countScenarios(ISO_MODULES), llm: countScenarios(LLM_MODULES),
    owasp: publicLabs().length, llmlab: PROMPT_LABS.length,
  }),
});
process.on('exit', () => { try { ledger.flush(); } catch { /* ignore */ } });
/** Chave pseudonima do aluno (UUID v4 no header). NAO e autenticacao; ver server/champion.ts. */
const learnerOf = (req: express.Request): string | null => {
  const v = req.header('x-learner-id');
  return v && LEARNER_RE.test(v) ? v : null;
};
const track = (req: express.Request, trail: TrailId, scenarioId: unknown, correct: boolean) => {
  const lid = learnerOf(req);
  if (lid && correct && typeof scenarioId === 'string') ledger.recordScenario(lid, trail, scenarioId);
};

// trilhas de conteudo educativo (Privacidade/LGPD e CIS Controls); gabarito fica so no servidor
api.get('/privacy/modules', (_req, res) => res.json({ modules: publicPrivacyModules() }));
api.post('/privacy/answer', answerLimiter, (req, res) => {
  const { moduleId, scenarioId, optionIndex } = req.body ?? {};
  const r = checkPrivacyAnswer(moduleId, scenarioId, optionIndex);
  if (!r.ok) return res.status(400).json({ error: r.error });
  track(req, 'privacy', scenarioId, r.correct);
  res.json({ correct: r.correct, feedback: r.feedback });
});
api.get('/cis/modules', (_req, res) => res.json({ modules: publicModules(CIS_MODULES, CIS_VISUALS) }));
api.post('/cis/answer', answerLimiter, (req, res) => {
  const { moduleId, scenarioId, optionIndex } = req.body ?? {};
  const r = checkAnswer(CIS_MODULES, moduleId, scenarioId, optionIndex);
  if (!r.ok) return res.status(400).json({ error: r.error });
  track(req, 'cis', scenarioId, r.correct);
  res.json({ correct: r.correct, feedback: r.feedback });
});

api.get('/iso/modules', (_req, res) => res.json({ modules: publicModules(ISO_MODULES, ISO_VISUALS) }));
api.post('/iso/answer', answerLimiter, (req, res) => {
  const { moduleId, scenarioId, optionIndex } = req.body ?? {};
  const r = checkAnswer(ISO_MODULES, moduleId, scenarioId, optionIndex);
  if (!r.ok) return res.status(400).json({ error: r.error });
  track(req, 'iso', scenarioId, r.correct);
  res.json({ correct: r.correct, feedback: r.feedback });
});

api.get('/llm/modules', (_req, res) => res.json({ modules: publicModules(LLM_MODULES, LLM_VISUALS) }));
api.post('/llm/answer', answerLimiter, (req, res) => {
  const { moduleId, scenarioId, optionIndex } = req.body ?? {};
  const r = checkAnswer(LLM_MODULES, moduleId, scenarioId, optionIndex);
  if (!r.ok) return res.status(400).json({ error: r.error });
  track(req, 'llm', scenarioId, r.correct);
  res.json({ correct: r.correct, feedback: r.feedback });
});

// laboratorio interativo de prompts (assistentes simulados; sem LLM real nem API externa)
api.get('/llm-lab/labs', (_req, res) => res.json({ labs: publicPromptLabs() }));
api.post('/llm-lab/chat', answerLimiter, (req, res) => {
  const { labId, message, history } = req.body ?? {};
  const r = labChat(labId, message, history);
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ reply: r.reply, tokens: r.tokens });
});
api.post('/llm-lab/hint', answerLimiter, (req, res) => {
  const r = labHint(req.body?.labId, req.body?.n);
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ hint: r.hint });
});
api.post('/llm-lab/submit', answerLimiter, (req, res) => {
  const r = labSubmit(req.body?.labId, req.body?.flag);
  if (!r.ok) return res.status(400).json({ error: r.error });
  const lid = learnerOf(req);
  if (lid && r.correct && typeof req.body?.labId === 'string') ledger.recordPromptLab(lid, req.body.labId);
  res.json({ correct: r.correct, lesson: r.lesson });
});

// Jornada Security Champion: progresso e selo (assinado) no servidor
api.get('/champion/me', (req, res) => {
  const lid = learnerOf(req);
  if (!lid) return res.status(400).json({ error: 'x-learner-id ausente ou invalido' });
  res.json(ledger.me(lid));
});
api.post('/champion/issue', answerLimiter, (req, res) => {
  const lid = learnerOf(req);
  if (!lid) return res.status(400).json({ error: 'x-learner-id ausente ou invalido' });
  const r = ledger.issue(lid, req.body?.name);
  if (!r.ok) return res.status(409).json({ error: r.error });
  res.json({ seal: r.seal });
});
api.get('/champion/verify/:id', answerLimiter, (req, res) => {
  const seal = ledger.verify(req.params.id);
  if (!seal) return res.status(404).json({ valid: false });
  res.json({ valid: true, seal });
});
api.delete('/champion/seal', answerLimiter, (req, res) => {
  const lid = learnerOf(req);
  if (!lid) return res.status(400).json({ error: 'x-learner-id ausente ou invalido' });
  res.json({ removed: ledger.revokeSeal(lid) });
});
api.delete('/champion/me', answerLimiter, (req, res) => {
  const lid = learnerOf(req);
  if (!lid) return res.status(400).json({ error: 'x-learner-id ausente ou invalido' });
  res.json({ erased: ledger.erase(lid) });
});

// monta os 10 laboratorios vulneraveis em /api/a01 .. /api/a10
mountLabs(api);

app.use('/api', api);

// 404 em RFC 7807 (application/problem+json)
app.use('/api', (_req, res) => res.status(404).type('application/problem+json').json({
  type: 'https://cybershield.local/errors/not-found', title: 'Not Found', status: 404, detail: 'Rota não encontrada.',
}));

// Error handler global: SEMPRE RFC 7807 (sem vazar stack trace em HTML).
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const bad = err?.status === 400 || err?.type === 'entity.parse.failed';
  const status = bad ? 400 : 500;
  res.status(status).type('application/problem+json').json({
    type: `https://cybershield.local/errors/${bad ? 'bad-request' : 'internal'}`,
    title: bad ? 'Bad Request' : 'Internal Server Error',
    status,
    detail: bad ? 'JSON inválido no corpo da requisição.' : String(err?.message ?? err),
  });
});

const PORT = Number(process.env.API_PORT ?? 4000);

// cria/popula o schema (SQLite em memória OU Postgres/Supabase) antes de servir.
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[CyberShield API] banco: ${usingPostgres ? 'Postgres/Supabase (DATABASE_URL)' : 'SQLite em memória (local)'}`);
      console.log(`[CyberShield API] laboratorios OWASP ativos em http://localhost:${PORT}/api`);
      console.log(`[CyberShield API] ATENCAO: backend intencionalmente vulneravel — somente treino local.`);
    });
  })
  .catch((err) => {
    console.error('[CyberShield API] Falha ao inicializar o banco:', err);
    process.exit(1);
  });
