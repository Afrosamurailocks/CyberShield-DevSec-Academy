/**
 * Camada de banco DUAL-MODE para o CyberShield DevSec Academy.
 *
 *  - Sem DATABASE_URL  -> SQLite nativo em memória (node:sqlite). Dev local, zero setup.
 *  - Com DATABASE_URL  -> Postgres (Supabase), via `pg`. Para subir o banco na nuvem.
 *
 * A fachada expõe a MESMA API nos dois modos: `db.prepare(sql).get/all/run(...)`
 * (agora assíncronos) + `db.exec(sql)`. Placeholders `?` são traduzidos para `$1,$2…`
 * no Postgres. IMPORTANTE: usamos conexão Postgres DIRETA (não supabase-js/PostgREST)
 * de propósito, para que o lab A03 (SQL Injection por concatenação) continue real.
 *
 * ATENÇÃO (contexto didático): o schema é propositalmente inseguro (senhas MD5 sem
 * salt, segredos em claro) porque é alvo dos laboratórios OWASP. NUNCA use em produção.
 */
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import pg from 'pg';

/** MD5 sem salt — intencionalmente fraco (alvo dos labs). */
export const md5 = (s: string) => crypto.createHash('md5').update(s).digest('hex');

/** true quando o backend ativo é o Postgres/Supabase (DATABASE_URL definido). */
export const usingPostgres = !!process.env.DATABASE_URL;

export interface Stmt {
  get(...params: unknown[]): Promise<any>;
  all(...params: unknown[]): Promise<any[]>;
  run(...params: unknown[]): Promise<void>;
}
export interface Db {
  prepare(sql: string): Stmt;
  exec(sql: string): Promise<void>;
}

// ───────────────────────── SQLite (local, em memória) ─────────────────────────
function makeSqlite(): Db {
  const s = new DatabaseSync(':memory:');
  return {
    prepare(sql: string): Stmt {
      const st = s.prepare(sql);
      return {
        get: async (...p) => st.get(...(p as any[])),
        all: async (...p) => st.all(...(p as any[])) as any[],
        run: async (...p) => { st.run(...(p as any[])); },
      };
    },
    exec: async (sql: string) => { s.exec(sql); },
  };
}

// ───────────────────────── Postgres (Supabase) ─────────────────────────
function makePostgres(): Db {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Supabase exige TLS
    max: 5,
  });
  // traduz "?" posicional (estilo SQLite) para "$1,$2…" (estilo Postgres)
  const toPg = (sql: string) => { let i = 0; return sql.replace(/\?/g, () => `$${++i}`); };
  return {
    prepare(sql: string): Stmt {
      const text = toPg(sql);
      return {
        get: async (...p) => (await pool.query(text, p as any[])).rows[0],
        all: async (...p) => (await pool.query(text, p as any[])).rows,
        run: async (...p) => { await pool.query(text, p as any[]); },
      };
    },
    exec: async (sql: string) => { await pool.query(sql); },
  };
}

export const db: Db = usingPostgres ? makePostgres() : makeSqlite();

// DDL compatível com SQLite E Postgres. DROP+CREATE a cada boot => labs sempre
// em estado conhecido (ex.: o A04 reseta a senha do admin; o reseed restaura).
const SCHEMA = `
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS reset_tokens;
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_md5 TEXT NOT NULL,       -- MD5 sem salt (A02/A03)
  role TEXT NOT NULL DEFAULT 'user',
  full_name TEXT,
  salary INTEGER,
  cpf TEXT,
  api_key TEXT
);
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  amount TEXT NOT NULL,
  description TEXT,
  secret_note TEXT
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  category TEXT
);
CREATE TABLE reset_tokens (
  username TEXT,
  token TEXT,
  created_at INTEGER
);
`;

/** Cria o schema e popula os dados-semente. Chamado uma vez no boot (index.ts). */
export async function initDb(): Promise<void> {
  await db.exec(SCHEMA);

  const insUser = db.prepare(
    `INSERT INTO users (id, username, password_md5, role, full_name, salary, cpf, api_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  await insUser.run(1, 'admin', md5('S3nh@Corp#Admin'), 'admin', 'Diretor Executivo', 48000, '111.111.111-11', 'sk_live_admin_9f82hd72hds');
  await insUser.run(2, 'suporte_financeiro', md5('123456'), 'user', 'Analista Financeiro', 6500, '222.222.222-22', null);
  await insUser.run(3, 'dev_junior', md5('qwerty'), 'user', 'Desenvolvedor Junior', 7200, '333.333.333-33', null);
  await insUser.run(4, 'joana.rh', md5('Primavera2025'), 'user', 'Analista de RH', 7800, '444.444.444-44', null);

  const insInv = db.prepare(
    `INSERT INTO invoices (id, owner_id, amount, description, secret_note) VALUES (?, ?, ?, ?, ?)`
  );
  await insInv.run(1001, 1, 'R$ 48.000,00', 'Holerite Diretoria - Outubro', 'Bonus confidencial de retencao: R$ 15.000');
  await insInv.run(1042, 2, 'R$ 6.500,00', 'Holerite Analista Financeiro - Outubro', 'Reajuste previsto para dezembro');
  await insInv.run(1043, 3, 'R$ 7.200,00', 'Holerite Dev - Outubro', null);
  await insInv.run(1044, 4, 'R$ 7.800,00', 'Holerite Analista RH - Outubro', 'Dossie confidencial de clima organizacional');

  const insProd = db.prepare(`INSERT INTO products (id, name, price, category) VALUES (?, ?, ?, ?)`);
  await insProd.run(1, 'Licenca ERP Corporativo', 'R$ 1.200,00', 'software');
  await insProd.run(2, 'Suporte Premium 24x7', 'R$ 3.500,00', 'servico');
  await insProd.run(3, 'Treinamento SecDev', 'R$ 900,00', 'treinamento');
}
