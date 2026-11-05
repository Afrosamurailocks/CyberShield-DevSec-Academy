// Gera uma planilha de amostra (dados fictícios, diretório temporário) para conferência visual do design do Excel.
// Uso: npx tsx scripts/sample-xlsx.mts [saida.xlsx]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createLedger } from '../server/champion.ts';
import { createAuth } from '../server/auth.ts';
import { createReports } from '../server/report.ts';
import { reportToXlsx } from '../server/reportXlsx.ts';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sample-xlsx-'));
const TOTALS = { privacy: 4, cis: 4, iso: 4, owasp: 4, llm: 4, llmlab: 4 };
const ledger = createLedger({ dir, key: Buffer.alloc(32, 5), totals: () => TOTALS });
const auth = createAuth({ dir });
await auth.bootstrap('admin@exemplo.test', 'Exemplo-Senha#2026x');
const mk = async (email: string, name: string, role: string, team: string) => (await auth.create({ email, name, role, team }))!;
const a = await mk('ana@exemplo.test', 'Ana Exemplo', 'learner', 'Plataforma');
const b = await mk('bruno@exemplo.test', 'Bruno Exemplo', 'learner', 'Dados');
await mk('carla@exemplo.test', 'Carla Exemplo', 'manager', 'Plataforma');
if (a.ok) for (const t of ['privacy', 'cis', 'iso', 'llm'] as const) for (let i = 0; i < 4; i++) ledger.recordScenario(a.user.learnerId, t, `s${i}`, `2026-03-0${i + 1}T10:00:00.000Z`);
if (a.ok) for (let i = 0; i < 4; i++) { ledger.recordLab(a.user.learnerId, `l${i}`); ledger.recordPromptLab(a.user.learnerId, `p${i}`); }
if (b.ok) ledger.recordScenario(b.user.learnerId, 'cis', 'x', '2026-03-02T09:00:00.000Z');
const reports = createReports({ ledger, users: () => auth.list(), totals: () => TOTALS, finals: () => ['llmlab'] });
const doc = reports.build({ id: 'x', email: 'admin@exemplo.test', role: 'admin' });
const out = process.argv[2] ?? path.join(dir, 'amostra.xlsx');
fs.writeFileSync(out, await reportToXlsx(doc));
console.log(out);
