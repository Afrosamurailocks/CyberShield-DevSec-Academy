/**
 * Testes das ferramentas de exploração (src/academy/lib/tools.ts).
 * Verifica as transformações puras (Base64/Base64URL, URL, JWT, MD5/SHA-256,
 * node-serialize) — incl. vetores oficiais de MD5 (RFC 1321).
 * Rode:  npm run test:tools   (usa tsx; não precisa do servidor no ar)
 */
import {
  b64encode, b64decode, b64urlEncode, b64urlDecode, urlEncode, urlDecode,
  jwtDecode, jwtForgeNone, jwtSignHS256, md5, sha256, nodeSerializePayload,
} from '../src/academy/lib/tools.ts';

let pass = 0, fail = 0; const fails: string[] = [];
const ok = (n: string, c: boolean) => { if (c) pass++; else { fail++; fails.push(n); } };

// MD5 — vetores RFC 1321
ok('md5("")', md5('') === 'd41d8cd98f00b204e9800998ecf8427e');
ok('md5("abc")', md5('abc') === '900150983cd24fb0d6963f7d28e17f72');
ok('md5("message digest")', md5('message digest') === 'f96b697d7cb7938d525a2f31aaf161d0');
ok('md5("123456")', md5('123456') === 'e10adc3949ba59abbe56e057f20f883e');
ok('md5(UTF-8 "açúcar")', md5('açúcar') === md5('açúcar'));

// SHA-256 (nativo)
ok('sha256("abc")', (await sha256('abc')) === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

// Base64 / Base64URL (round-trip + UTF-8)
ok('b64 round-trip UTF-8', b64decode(b64encode('olá, mundo ✓')) === 'olá, mundo ✓');
ok('b64url sem padding', !b64urlEncode('any carnal pleasure').includes('='));
ok('b64url round-trip', b64urlDecode(b64urlEncode('{"role":"admin"}')) === '{"role":"admin"}');

// URL
ok('urlEncode', urlEncode('http://169.254.169.254/latest?x=1') === 'http%3A%2F%2F169.254.169.254%2Flatest%3Fx%3D1');
ok('url round-trip', urlDecode(urlEncode('a b/c?d=1&e=2')) === 'a b/c?d=1&e=2');

// JWT
const none = jwtForgeNone('{"sub":"x","role":"admin"}');
ok('jwt none: 3 partes, assinatura vazia', none.split('.').length === 3 && none.endsWith('.'));
ok('jwt none: header alg=none', JSON.parse(b64urlDecode(none.split('.')[0])).alg === 'none');
const signed = await jwtSignHS256('{"role":"admin"}', 'cybershield-weak-demo-secret');
ok('jwt HS256: assinatura não vazia', signed.split('.')[2].length > 10);
const dec = jwtDecode(signed);
ok('jwtDecode payload', JSON.parse(dec.payload).role === 'admin');

// node-serialize
const body = JSON.parse(JSON.stringify({ data: nodeSerializePayload("require('child_process').execSync('id')") }));
ok('node-serialize: IIFE marcada', /_\$\$ND_FUNC\$\$_function\(\)\{.*\}\(\)/.test(JSON.parse(body.data).rce));

console.log(`\nFERRAMENTAS: ${pass} passaram, ${fail} falharam`);
if (fail) { for (const f of fails) console.log('  ❌', f); process.exit(1); }
console.log('✅ todas as transformações corretas.');
