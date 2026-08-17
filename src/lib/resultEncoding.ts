import { isDayAgnosticMode } from './gameLogic';
import { GameMode } from './types';

/**
 * Encodes/decodes a completed (or in-progress) game result into a compact,
 * URL-safe string for the personalized `/result/[encoded]` share pages
 * (Workstream H). Deliberately does NOT import curated-cities.json or
 * validate city ids against the live dataset — that coupling belongs to the
 * caller (e.g. the `/result/[encoded]` route, which must re-verify every id
 * resolves to a real city before trusting it, since a malformed-but-well-
 * formed encoded string can still reference a since-removed or bogus id).
 * Keeping this module dataset-free also means it works identically on the
 * client and in any server context without dragging the city JSON along.
 *
 * Format: `v1.{modeChar}.{dailyNumber}.{targetId}.{guessId1}_{guessId2}_...`
 *   - modeChar: 'd' = daily, 'u' = unlimited, 'a' = archive, 'c' = challenge,
 *     'p' = photo
 *   - dailyNumber: '0' when not applicable (unlimited/challenge/photo)
 *   - targetId / guessIdN: stable City.id strings, never array indices, so
 *     links never break as the city pool keeps growing
 *
 * Win/loss is deliberately NOT stored in the encoding — callers derive it as
 * `guessIds.at(-1) === targetId`.
 */

const MODE_TO_CHAR: Record<GameMode, string> = {
  daily: 'd',
  unlimited: 'u',
  archive: 'a',
  challenge: 'c',
  photo: 'p',
};

const CHAR_TO_MODE: Record<string, GameMode> = {
  d: 'daily',
  u: 'unlimited',
  a: 'archive',
  c: 'challenge',
  p: 'photo',
};

export interface DecodedResult {
  mode: GameMode;
  dailyNumber: number;
  targetId: string;
  guessIds: string[];
}

export function encodeResult(
  mode: GameMode,
  dailyNumber: number,
  targetId: string,
  guessIds: string[]
): string {
  const modeChar = MODE_TO_CHAR[mode];
  const safeDailyNumber = isDayAgnosticMode(mode) ? 0 : dailyNumber;
  return `v1.${modeChar}.${safeDailyNumber}.${targetId}.${guessIds.join('_')}`;
}

/**
 * Never throws — returns null on any malformed input (wrong part count,
 * unknown mode char, non-integer daily number, empty guess list). Does NOT
 * validate targetId/guessIds against the dataset; see module comment above.
 */
export function decodeResult(encoded: string): DecodedResult | null {
  if (typeof encoded !== 'string' || encoded.length === 0) return null;

  const parts = encoded.split('.');
  if (parts.length !== 5) return null;

  const [version, modeChar, dailyNumberStr, targetId, guessIdsStr] = parts;
  if (version !== 'v1') return null;

  const mode = CHAR_TO_MODE[modeChar];
  if (!mode) return null;

  if (!/^\d+$/.test(dailyNumberStr)) return null;
  const dailyNumber = Number(dailyNumberStr);
  if (!Number.isInteger(dailyNumber)) return null;

  if (!targetId) return null;

  const guessIds = guessIdsStr.split('_').filter((id) => id.length > 0);
  if (guessIds.length === 0) return null;

  return { mode, dailyNumber, targetId, guessIds };
}
