/**
 * Redefine a senha do administrador (recuperação local). Rode com o servidor PARADO:
 *   npx tsx scripts/reset-admin.mts [email]
 * Gera uma senha provisória aleatória, imprime-a UMA vez e exige troca no próximo login. Registra o evento na auditoria.
 * Útil quando a senha do 1º administrador se perdeu e não há outro administrador para redefini-la.
 */
import path from 'node:path';
import { createAuth } from '../server/auth.ts';
import { createAudit } from '../server/audit.ts';
import { createLedger } from '../server/champion.ts';

const dir = process.env.CHAMPION_DATA_DIR ?? path.join(process.cwd(), 'data');
const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? 'admin@opah.local').trim().toLowerCase();
const auth = createAuth({ dir });
const u = auth.byEmail(email);
if (!u) { console.error(`Usuário não encontrado: ${email}`); process.exit(1); }
if (u.role !== 'admin') { console.error('Por segurança, este script só redefine contas de administrador.'); process.exit(1); }
const ledger = createLedger({ dir, totals: () => ({ privacy: 0, cis: 0, iso: 0, owasp: 0, llm: 0, llmlab: 0 }) });
const audit = createAudit({ dir, key: ledger.derive('audit-v1') });
const r = await auth.resetPassword(u.id);
if (!r.ok) { console.error(r.error); process.exit(1); }
audit.log({ action: 'auth.password.reset', outcome: 'ok', actor: null, target: u.id, detail: { email: u.email, via: 'reset-admin-script' } });
console.log(`Senha provisória de ${u.email} (exibida uma única vez; troca obrigatória no próximo login):`);
console.log(r.password);
