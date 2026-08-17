import { describe, it, expect } from 'vitest';
import { encodeResult, decodeResult } from './resultEncoding';
import { GameMode } from './types';

describe('encodeResult / decodeResult round-trip', () => {
  // resultEncoding.ts is designed as a genuine round-trip for day-having
  // modes: decodeResult reconstructs exactly {mode, dailyNumber, targetId,
  // guessIds} from what encodeResult was given, for every field *except*
  // day-agnostic modes (unlimited/challenge/photo), where encodeResult
  // deliberately zeroes dailyNumber via isDayAgnosticMode — so the decoded
  // dailyNumber for those modes is always 0, not whatever was originally
  // passed in. That asymmetry is intentional (see module comment), not a bug,
  // so it's tested explicitly below rather than assumed away.

  it('round-trips a daily result exactly, including a non-zero dailyNumber', () => {
    const encoded = encodeResult('daily', 42, 'madrid-es', ['barcelona-es', 'madrid-es']);
    const decoded = decodeResult(encoded);
    expect(decoded).toEqual({
      mode: 'daily',
      dailyNumber: 42,
      targetId: 'madrid-es',
      guessIds: ['barcelona-es', 'madrid-es'],
    });
  });

  it('round-trips an archive result exactly, including its dailyNumber', () => {
    const encoded = encodeResult('archive', 17, 'rome-it', ['rome-it']);
    const decoded = decodeResult(encoded);
    expect(decoded).toEqual({
      mode: 'archive',
      dailyNumber: 17,
      targetId: 'rome-it',
      guessIds: ['rome-it'],
    });
  });

  it.each<GameMode>(['unlimited', 'challenge', 'photo'])(
    'zeroes dailyNumber for day-agnostic mode "%s" rather than round-tripping it',
    (mode) => {
      const encoded = encodeResult(mode, 999, 'tokyo-jp', ['tokyo-jp']);
      const decoded = decodeResult(encoded);
      expect(decoded?.dailyNumber).toBe(0);
      expect(decoded?.mode).toBe(mode);
      expect(decoded?.targetId).toBe('tokyo-jp');
      expect(decoded?.guessIds).toEqual(['tokyo-jp']);
    }
  );

  it('round-trips multiple guessIds in order', () => {
    const guessIds = ['a-city', 'b-city', 'c-city', 'target-city'];
    const encoded = encodeResult('daily', 1, 'target-city', guessIds);
    expect(decodeResult(encoded)?.guessIds).toEqual(guessIds);
  });
});

describe('decodeResult malformed input', () => {
  it('returns null, and does not throw, for garbage strings', () => {
    expect(() => decodeResult('not-a-real-encoded-string')).not.toThrow();
    expect(decodeResult('not-a-real-encoded-string')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(decodeResult('')).toBeNull();
  });

  it('returns null for the wrong number of dot-separated parts', () => {
    expect(decodeResult('v1.d.5.madrid-es')).toBeNull(); // missing guessIds part
    expect(decodeResult('v1.d.5.madrid-es.a_b.extra')).toBeNull(); // one part too many
  });

  it('returns null for an unknown version tag', () => {
    expect(decodeResult('v2.d.5.madrid-es.madrid-es')).toBeNull();
  });

  it('returns null for an unknown mode character', () => {
    expect(decodeResult('v1.z.5.madrid-es.madrid-es')).toBeNull();
  });

  it('returns null for a non-integer dailyNumber', () => {
    expect(decodeResult('v1.d.abc.madrid-es.madrid-es')).toBeNull();
    expect(decodeResult('v1.d.5.5.madrid-es.madrid-es')).toBeNull(); // "5.5" split across dots
    expect(decodeResult('v1.d.-1.madrid-es.madrid-es')).toBeNull(); // negative sign not in \d+
  });

  it('returns null for an empty targetId', () => {
    expect(decodeResult('v1.d.5..madrid-es')).toBeNull();
  });

  it('returns null when guessIds is empty', () => {
    expect(decodeResult('v1.d.5.madrid-es.')).toBeNull();
  });

  it('never throws across a batch of assorted garbage input', () => {
    const garbageInputs = [
      '....',
      'v1',
      '🏙️',
      'v1.d.5.madrid-es.madrid-es.',
      '   ',
      'null',
      'undefined',
      String(Number.MAX_SAFE_INTEGER),
    ];
    for (const input of garbageInputs) {
      expect(() => decodeResult(input)).not.toThrow();
    }
  });
});
