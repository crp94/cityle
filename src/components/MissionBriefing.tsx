'use client';

import { ChevronDown, Target } from 'lucide-react';
import { Translations } from '../lib/i18n';

export const MissionBriefing = ({ t }: { t: Translations }) => (
  <details className="nothing-widget group border-[#3FD17C]/30 bg-[#10141C]/92 p-3">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3FD17C]/12 text-[#3FD17C]">
          <Target className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          {/* The single most important line of copy in the app — was
              text-sm (14px), the smallest text on the page, which buried the
              hook. Now the loudest thing here besides the logo. */}
          <p className="text-xl font-bold leading-snug text-[#F4F6F8] sm:text-2xl">{t.missionBriefingTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#8f9dac] sm:text-sm">{t.missionBriefingSubtitle}</p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#3FD17C]">
        {t.howToPlay}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </span>
    </summary>
    <div className="mt-3 grid gap-2 border-t border-white/8 pt-3 text-xs leading-relaxed text-[#aeb8c2] sm:grid-cols-3">
      <p><strong className="text-[#F4F6F8]">{t.briefingRead}</strong> {t.briefingReadDesc}</p>
      <p><strong className="text-[#F4F6F8]">{t.briefingGuess}</strong> {t.briefingGuessDesc}</p>
      <p><strong className="text-[#F4F6F8]">{t.briefingUnlock}</strong> {t.briefingUnlockDesc}</p>
    </div>
    <p className="mt-3 border-t border-white/8 pt-3 text-xs leading-relaxed text-[#9eabb6]">
      {t.missionBriefingFootnote}
    </p>
  </details>
);
