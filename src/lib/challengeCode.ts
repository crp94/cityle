/**
 * Obfuscated (not encrypted) city-id encoding for challenge links
 * (`/challenge/[code]`, Workstream J). Uses `btoa`/`atob` rather than
 * `Buffer` so this module works unmodified in both the browser and any
 * server context (Next.js route handlers, RSC, etc.).
 *
 * This is the exact algorithm already implemented and test-verified in the
 * design phase — copied precisely, not redesigned.
 */

const SALT = 'cityle-challenge-v1';

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function seededRandom(seed: number): number {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function keystreamByte(baseSeed: number, index: number): number {
  return Math.floor(seededRandom(baseSeed + index * 7919) * 256);
}

function toBase64Url(bytes: number[]): string {
  const bin = bytes.map((b) => String.fromCharCode(b)).join('');
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code: string): number[] | null {
  try {
    let b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return Array.from(atob(b64)).map((ch) => ch.charCodeAt(0));
  } catch {
    return null;
  }
}

export function encodeChallenge(id: string): string {
  const bytes = Array.from(id).map((ch) => ch.charCodeAt(0));
  const baseSeed = fnv1a(SALT);
  const xored = bytes.map((b, i) => b ^ keystreamByte(baseSeed, i));
  return toBase64Url([bytes.length, ...xored]);
}

/** Returns null for any malformed code — caller must ALSO verify the
 *  result against the live city dataset before trusting it. This is
 *  obfuscation against casual glancing/hovering, not cryptographic
 *  security — decode logic necessarily ships in the client bundle for
 *  a static app with no backend. That is the correct, stated threat model. */
export function decodeChallenge(code: string): string | null {
  const payload = fromBase64Url(code);
  if (!payload || payload.length < 1) return null;
  const [len, ...xored] = payload;
  if (xored.length !== len) return null;
  const baseSeed = fnv1a(SALT);
  return xored.map((b, i) => String.fromCharCode(b ^ keystreamByte(baseSeed, i))).join('');
}
