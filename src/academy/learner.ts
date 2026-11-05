// Chave pseudônima do aluno (UUID v4), gerada no navegador e enviada ao servidor em `x-learner-id`.
// NÃO é autenticação: serve para o servidor registrar o progresso validado. Para vincular a uma pessoa real,
// integrar SSO [inserir provedor SSO].
const KEY = 'cybershield.learner.v1';
const RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
let memo: string | null = null;

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function getLearnerId(): string {
  if (memo) return memo;
  try {
    const v = localStorage.getItem(KEY);
    if (v && RE.test(v)) return (memo = v);
  } catch { /* storage indisponivel */ }
  const id = uuidv4();
  memo = id;
  try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  return id;
}

export const learnerHeaders = (): Record<string, string> => ({ 'x-learner-id': getLearnerId() });
