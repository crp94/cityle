import { describe, it, expect } from 'vitest';
import { encodeChallenge, decodeChallenge } from './challengeCode';

describe('encodeChallenge / decodeChallenge round-trip', () => {
  it('round-trips a handful of real city ids', () => {
    for (const id of ['madrid-es', 'rome-it', 'a', 'tokyo-jp', 'new-york-city-us']) {
      expect(decodeChallenge(encodeChallenge(id))).toBe(id);
    }
  });

  it("matches the documented real example: encodeChallenge('rome-it') === 'B-2Jls009Fk'", () => {
    // Verified against the actual current implementation (not assumed from
    // the comment in challengeCode.ts) — this literal still holds.
    expect(encodeChallenge('rome-it')).toBe('B-2Jls009Fk');
  });
});

describe('decodeChallenge malformed input', () => {
  it('returns null, and does not throw, for garbage strings', () => {
    expect(() => decodeChallenge('!!!not-valid-base64!!!')).not.toThrow();
    expect(decodeChallenge('!!!not-valid-base64!!!')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(decodeChallenge('')).toBeNull();
  });

  it('returns null for strings with invalid base64url characters', () => {
    const invalidInputs = ['%%%%', '@#$%', 'has spaces here', 'ünïcödé'];
    for (const input of invalidInputs) {
      expect(() => decodeChallenge(input)).not.toThrow();
      expect(decodeChallenge(input)).toBeNull();
    }
  });

  it('returns null when the declared length byte does not match the payload', () => {
    // A single base64url-encoded byte (length prefix only, no payload bytes)
    // declares a length that the (empty) remainder can't satisfy.
    const bogus = Buffer.from([5]).toString('base64url');
    expect(decodeChallenge(bogus)).toBeNull();
  });

  it('never throws across a batch of assorted garbage input', () => {
    const garbageInputs = ['', ' ', 'null', 'undefined', '====', '-_-_-_', '🏙️', 'a'.repeat(500)];
    for (const input of garbageInputs) {
      expect(() => decodeChallenge(input)).not.toThrow();
    }
  });
});
