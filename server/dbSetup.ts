/**
 * Sobe o schema + dados-semente para o Supabase/Postgres.
 * Uso:  defina DATABASE_URL no .env e rode `npm run db:setup`.
 * (Em modo SQLite local isso não faz sentido — o banco é recriado no boot.)
 */
import 'dotenv/config';
import { initDb, usingPostgres } from './db.js';

if (!usingPostgres) {
  console.error('❌ DATABASE_URL não definido. Defina a connection string do Supabase no .env e rode de novo.');
  console.error('   Ex.: DATABASE_URL=postgresql://postgres.<ref>:<senha>@aws-0-<regiao>.pooler.supabase.com:5432/postgres');
  process.exit(1);
}

console.log('→ Conectando ao Postgres/Supabase e (re)criando schema + seed…');
initDb()
  .then(() => { console.log('✅ Pronto: tabelas users/invoices/products/reset_tokens criadas e populadas no Supabase.'); process.exit(0); })
  .catch((e) => { console.error('❌ Falha no setup:', e?.message ?? e); process.exit(1); });
