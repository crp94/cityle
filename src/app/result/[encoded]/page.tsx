import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Swords, Trophy } from 'lucide-react';
import { RobinsonMap } from '../../../components/RobinsonMap';
import { encodeChallenge } from '../../../lib/challengeCode';
import { generateShareText } from '../../../lib/gameLogic';
import { getCountryFlag } from '../../../lib/geo';
import { getTranslation } from '../../../lib/i18n';
import { formatModeBadge, resolveResult } from './resultImageContent';

interface ResultPageProps {
  params: Promise<{ encoded: string }>;
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { encoded } = await params;
  const resolved = resolveResult(encoded);

  if (!resolved) {
    return {
      title: 'Result not found — Cityle',
      description: 'This Cityle result link is invalid or has expired.',
    };
  }

  const { targetCity, guesses, won } = resolved;
  const scoreText = won ? `${guesses.length}/6` : 'X/6';
  const title = `${won ? 'Solved' : 'Missed'} ${targetCity.name} in ${scoreText} — Cityle`;
  const description = `Can you find ${targetCity.name} faster? Play Cityle, the daily city-guessing game built on real climate and urban data.`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { encoded } = await params;
  const resolved = resolveResult(encoded);

  if (!resolved) {
    notFound();
  }

  const { decoded, targetCity, guesses, won } = resolved;
  // This is a fresh, unauthenticated share page with no way to know the
  // visitor's saved locale ahead of render (that lives in the original
  // player's localStorage, on a possibly different device) — English is a
  // deliberate, simple default rather than a partial/flashing i18n setup.
  const t = getTranslation('en');
  const shareText = generateShareText(decoded.dailyNumber, guesses, won, decoded.mode);
  const modeBadge = formatModeBadge(decoded);
  const challengeHref = `/challenge/${encodeChallenge(targetCity.id)}`;

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-8 sm:px-5">
        <div className="flex items-center justify-between">
          <span className="stamp text-[0.68rem] text-[#3FD17C]">Cityle Result</span>
          <span className="stamp text-[0.65rem] text-[#8f9dac] mono">{modeBadge}</span>
        </div>

        <div className="pr-2">
          <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${won ? 'bg-[#3FD17C]/15 text-[#3FD17C]' : 'bg-[#FF4D4D]/15 text-[#FF4D4D]'}`}>
            {won ? <Trophy className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
          </div>
          <h1
            className="text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl"
            style={{ color: won ? '#3FD17C' : '#FF4D4D' }}
          >
            {won ? 'SOLVED IT.' : 'NOT TODAY.'}
          </h1>
          <p className="mt-3 text-lg font-semibold text-[#F4F6F8]">
            {getCountryFlag(targetCity.countryCode)} {targetCity.name}
          </p>
          <p className="mt-1 text-sm text-[#9aa7b3]">
            {targetCity.country} · {targetCity.continent} ·{' '}
            {won ? `Solved in ${guesses.length}/6 guesses` : 'Revealed after 6 attempts'}
          </p>
        </div>

        <div className="nothing-widget p-3 sm:p-4">
          <p className="stamp text-[0.65rem] text-[#FFB238]">Score Grid</p>
          <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[#d6dce1] sm:text-sm">
            {shareText}
          </pre>
        </div>

        <RobinsonMap guesses={guesses} targetCity={targetCity} isGameOver t={t} />

        <div className="flex flex-col gap-2 border-t border-white/8 pt-4 sm:flex-row">
          <Link href="/" className="nothing-button flex items-center justify-center gap-2 bg-[#3FD17C] text-[#0A0C10] hover:bg-[#3FD17C]/85">
            <Trophy className="h-4 w-4" /> Play Cityle
          </Link>
          <Link
            href={challengeHref}
            className="nothing-button flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-[#F4F6F8] hover:bg-white/10"
          >
            <Swords className="h-4 w-4" /> Challenge a friend to this exact city
          </Link>
        </div>
      </main>
    </div>
  );
}
