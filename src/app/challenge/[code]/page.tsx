import Link from 'next/link';
import { GameApp } from '../../../components/GameApp';
import citiesData from '../../../data/curated-cities.json';
import { decodeChallenge } from '../../../lib/challengeCode';
import { City } from '../../../lib/types';

const cities = citiesData as City[];

// Deliberately no opengraph-image.tsx/twitter-image.tsx in this route segment
// (Workstream J's load-bearing anti-spoiler decision) — a personalized image
// here would leak the target city the moment the link unfurls in a chat app
// preview, before anyone clicks. With no image file of its own, this segment
// inherits the nearest ancestor's opengraph-image (the root's static brand
// card) per Next's metadata fallback/inheritance rules — confirmed against
// this project's installed Next.js 16.3.1 docs
// (node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md,
// "Inheriting fields": a segment's openGraph metadata is only replaced when
// that segment defines its own, otherwise the parent's is inherited
// untouched). We also deliberately add no generateMetadata/metadata export
// here for the same reason — a dynamic title/description naming the target
// city would leak it just as much as a dynamic image would.

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  // params is a Promise in this Next.js version — must be awaited, not read
  // synchronously (see AGENTS.md / this project's installed Next docs).
  const { code } = await params;

  const decodedId = decodeChallenge(code);
  // decodeChallenge can return non-null garbage for a malformed/tampered code
  // (it only validates the base64url/byte-length shape, not that the bytes
  // spell a real id) — the mandatory second check is resolving the decoded
  // id against the live city dataset before trusting it for anything.
  const city = decodedId ? cities.find((c) => c.id === decodedId) : undefined;

  if (!city) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0C10] px-4 py-16 text-[#aab6c2] dot-matrix-bg">
        <div className="nothing-widget flex w-full max-w-md flex-col items-center gap-4 p-6 text-center sm:p-8">
          <span className="stamp stamp-gold text-[0.65rem]">CHALLENGE LINK</span>
          <h1 className="text-xl font-bold text-[#F4F6F8] sm:text-2xl">
            This challenge link looks broken.
          </h1>
          <p className="text-sm leading-relaxed text-[#8f9dac]">
            It may have been mistyped, cut off when it was shared, or it just isn&apos;t a valid
            Cityle challenge. No city was harmed — just head back and start a fresh game, or ask
            your friend to resend it.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-2 rounded bg-[#3FD17C] px-5 py-2.5 text-sm font-semibold text-[#0A0C10] transition-colors hover:bg-[#34D67E]"
          >
            Back to Cityle
          </Link>
        </div>
      </main>
    );
  }

  return <GameApp forcedMode="challenge" challengeTargetCity={city} />;
}
