/**
 * API do CyberShield DevSec Academy.
 * Backend PROPOSITALMENTE vulneravel para treino de desenvolvedores (OWASP Top 10).
 * Rode apenas localmente, em ambiente de treinamento.
 */
import 'dotenv/config';
import express from 'express';
import { publicLabs, findLab } from './labs/metadata.js';
import { mountLabs } from './labs/routes.js';
import { initDb, usingPostgres } from './db.js';

const app = express();
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
api.post('/validate-flag', (req, res) => {
  const { labId, flag } = req.body ?? {};
  const lab = findLab(String(labId));
  if (!lab) return res.status(404).json({ correct: false, error: 'lab inexistente' });
  const correct = typeof flag === 'string' && flag.trim() === lab.flag;
  res.json({ correct, points: correct ? lab.points : 0, owaspId: lab.owaspId });
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
