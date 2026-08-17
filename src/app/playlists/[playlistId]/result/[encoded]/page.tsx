import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ListMusic, Trophy, X } from 'lucide-react';
import { getCountryFlag } from '../../../../../lib/geo';
import { MARATHON_MAX_GUESSES_PER_ROUND } from '../../../../../lib/marathonLogic';
import { resolveMultiRoundResult } from '../../../../multiRoundImageContent';

interface PlaylistResultPageProps {
  params: Promise<{ playlistId: string; encoded: string }>;
}

export async function generateMetadata({ params }: PlaylistResultPageProps): Promise<Metadata> {
  const { playlistId, encoded } = await params;
  const resolved = resolveMultiRoundResult(encoded);

  if (!resolved || resolved.kind !== 'playlist' || resolved.collectionId !== playlistId || !resolved.playlist) {
    return {
      title: 'Result not found — Cityle',
      description: 'This Cityle Playlist result link is invalid or has expired.',
    };
  }

  const { playlist, totalScore, maxScore } = resolved;
  const title = `${playlist.name} — ${totalScore}/${maxScore} — Cityle`;
  const description = `Can you beat this run through ${playlist.name}? Play Cityle's curated playlists, built on real climate and urban data.`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  };
}

export default async function PlaylistResultPage({ params }: PlaylistResultPageProps) {
  const { playlistId, encoded } = await params;
  const resolved = resolveMultiRoundResult(encoded);

  // Wrong kind, or an otherwise-valid playlist result encoded for a
  // *different* playlist than the one in this URL's [playlistId] segment,
  // are both treated as not-found — mirrors /result/[encoded]/page.tsx's
  // notFound() precedent over a friendly inline card, since a broken share
  // link isn't the anti-spoiler case /challenge/[code] guards against.
  if (!resolved || resolved.kind !== 'playlist' || resolved.collectionId !== playlistId || !resolved.playlist) {
    notFound();
  }

  const { playlist, rounds, totalScore, maxScore } = resolved;

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-8 sm:px-5">
        <div className="flex items-center justify-between">
          <span className="stamp text-[0.68rem] text-[#3FD17C]">Cityle Playlist Result</span>
          <span className="stamp text-[0.65rem] text-[#8f9dac] mono">{playlist.name.toUpperCase()}</span>
        </div>

        <div className="nothing-widget flex flex-col items-center gap-1.5 p-6 text-center sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3FD17C]/15 text-[#3FD17C]">
            <ListMusic className="h-5 w-5" />
          </span>
          <p className="stamp text-[#3FD17C]">PLAYLIST RUN</p>
          <h1 className="text-3xl font-bold leading-[0.95] tracking-tight text-[#F4F6F8] sm:text-4xl">
            {playlist.name}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-[#8f9dac]">{playlist.blurb}</p>
          <p className="mt-2 text-4xl font-bold text-[#FFB238]">
            {totalScore}
            <span className="text-lg text-[#8f9dac]">/{maxScore}</span>
          </p>
          <p className="stamp text-[#8f9dac]">TOTAL SCORE</p>
        </div>

        <div className="nothing-widget overflow-x-auto p-3 sm:p-4">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-[#8f9dac]">
                <th className="py-2 pr-2 font-semibold">City</th>
                <th className="py-2 pr-2 font-semibold">Guesses</th>
                <th className="py-2 pr-2 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, index) => (
                <tr key={`${round.targetCity.id}-${index}`} className="border-b border-white/6 last:border-0">
                  <td className="py-2 pr-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden>{getCountryFlag(round.targetCity.countryCode)}</span>
                      <span className="font-semibold text-[#F4F6F8]">{round.targetCity.name}</span>
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-[#c5ced7]">
                    {round.won ? round.guessesUsed : `${MARATHON_MAX_GUESSES_PER_ROUND}+`}
                  </td>
                  <td className="py-2 pr-2">
                    {round.won ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3FD17C]">
                        <Check className="h-3.5 w-3.5" /> Solved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4D4D]">
                        <X className="h-3.5 w-3.5" /> Missed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/8 pt-4 sm:flex-row">
          <Link
            href={`/playlists/${playlist.id}`}
            className="nothing-button flex items-center justify-center gap-2 bg-[#3FD17C] text-[#0A0C10] hover:bg-[#3FD17C]/85"
          >
            <Trophy className="h-4 w-4" /> Play This Playlist
          </Link>
          <Link
            href="/playlists"
            className="nothing-button flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-[#F4F6F8] hover:bg-white/10"
          >
            <ListMusic className="h-4 w-4" /> All Playlists
          </Link>
        </div>
      </main>
    </div>
  );
}
