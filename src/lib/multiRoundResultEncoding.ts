/**
 * Encodes/decodes a completed (or in-progress) multi-round run — Marathon or
 * Playlist, which share the exact same shape (a day-locked or freely-
 * repeatable sequence of single-target rounds) — into a compact, URL-safe
 * string for the personalized `/marathon/result/[encoded]` and
 * `/playlists/[playlistId]/result/[encoded]` share pages (Workstream DD).
 *
 * Generalizes `resultEncoding.ts`'s single-target format rather than
 * duplicating it twice for Marathon and Playlist. Same conventions:
 * deliberately does NOT import curated-cities.json or playlists.ts, and does
 * NOT validate any id against the live dataset — that coupling belongs to
 * the caller (the two result routes, via a `resolveMultiRoundResult`-style
 * function in `../app/multiRoundImageContent.tsx`, mirroring
 * `resultImageContent.tsx`'s `resolveResult`), since a malformed-but-well-
 * formed encoded string can still reference a since-removed/bogus city id or
 * a playlist id that no longer exists. Keeping this module dataset-free also
 * means it works identically on the client and in any server context.
 *
 * Format: `mv1.{kindChar}.{collectionId}.{round1}~{round2}~...~{roundN}`
 *   - kindChar: 'm' = marathon, 'p' = playlist
 *   - collectionId: the marathon number as a string (kind 'm'), or the
 *     playlist id (kind 'p') — never an array index, so links never break as
 *     more playlists are added or as marathon numbers advance
 *   - Each round is `{targetId}_{guessId1}_{guessId2}_..._{guessIdN}` —
 *     the round's target city id first, followed by every guessed city id in
 *     order, all `_`-joined (mirrors resultEncoding.ts's `_`-joined guess
 *     ids within a single result).
 *   - Rounds are joined with `~`, a separator distinct from both the
 *     top-level `.` and the intra-round `_`, so a decoder can unambiguously
 *     split "list of rounds" from "list of ids within a round".
 *
 * Per-round win/loss is deliberately NOT stored — mirrors resultEncoding.ts,
 * callers derive it the same way: `round.guessIds.at(-1) === round.targetId`.
 */

export type MultiRoundKind = 'marathon' | 'playlist';

export interface MultiRoundResult {
  kind: MultiRoundKind;
  /** Marathon number as a string (kind 'marathon') or playlist id (kind 'playlist'). */
  collectionId: string;
  rounds: { targetId: string; guessIds: string[] }[];
}

const KIND_TO_CHAR: Record<MultiRoundKind, string> = {
  marathon: 'm',
  playlist: 'p',
};

const CHAR_TO_KIND: Record<string, MultiRoundKind> = {
  m: 'marathon',
  p: 'playlist',
};

export function encodeMultiRoundResult(result: MultiRoundResult): string {
  const kindChar = KIND_TO_CHAR[result.kind];
  const roundsStr = result.rounds
    .map((round) => [round.targetId, ...round.guessIds].join('_'))
    .join('~');
  return `mv1.${kindChar}.${result.collectionId}.${roundsStr}`;
}

/**
 * Never throws — returns null on any malformed input (wrong part count,
 * unknown kind char, empty collection id, a non-numeric collection id for
 * kind 'marathon', no rounds, or any round missing a target id / guess id).
 * Does NOT validate targetId/guessIds/collectionId against the live dataset;
 * see module comment above.
 */
export function decodeMultiRoundResult(encoded: string): MultiRoundResult | null {
  if (typeof encoded !== 'string' || encoded.length === 0) return null;

  // Split into exactly 4 top-level '.'-separated fields. The rounds field
  // itself may legitimately contain further structure ('~' and '_') but
  // never a literal '.', so a plain 4-way split (not a limited/greedy one)
  // is safe and matches resultEncoding.ts's own strict part-count check.
  const parts = encoded.split('.');
  if (parts.length !== 4) return null;

  const [version, kindChar, collectionId, roundsStr] = parts;
  if (version !== 'mv1') return null;

  const kind = CHAR_TO_KIND[kindChar];
  if (!kind) return null;

  if (!collectionId) return null;
  if (kind === 'marathon' && !/^\d+$/.test(collectionId)) return null;

  if (!roundsStr) return null;
  const roundParts = roundsStr.split('~').filter((part) => part.length > 0);
  if (roundParts.length === 0) return null;

  const rounds: { targetId: string; guessIds: string[] }[] = [];
  for (const roundPart of roundParts) {
    const ids = roundPart.split('_').filter((id) => id.length > 0);
    if (ids.length < 2) return null; // need a target id plus at least one guess id

    const [targetId, ...guessIds] = ids;
    rounds.push({ targetId, guessIds });
  }

  return { kind, collectionId, rounds };
}
