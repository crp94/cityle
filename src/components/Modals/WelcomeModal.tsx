'use client';

import { Compass, X } from 'lucide-react';
import { Translations } from '../../lib/i18n';
import { useDialogA11y } from '../../lib/useDialogA11y';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: Translations;
}

/**
 * First-run onboarding modal (Phase 5, Workstream BB). Shown automatically
 * once per browser — see storage.ts's hasSeenWelcome/markWelcomeSeen and the
 * mount effect in GameApp.tsx — and reachable afterward via a link in
 * HelpModal. Deliberately scoped to the core Daily mechanic only: the goal,
 * guess feedback, and the "Choose Your Clue" token economy. Every other
 * mode/feature (Atlas, Almanac, Marathon, Playlists, Photo, Hard Mode,
 * Lives, Archive, Challenge links) stays undiscovered on purpose — do not
 * add mentions of them here.
 */
export const WelcomeModal = ({ isOpen, onClose, t }: WelcomeModalProps) => {
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="welcome-title" className="relative w-full max-w-md rounded-lg border border-white/15 bg-[#10141C] p-5 text-[#d7dde2] shadow-2xl sm:p-6">
        <button onClick={onClose} aria-label="Close welcome guide" className="icon-button absolute right-3 top-3"><X className="h-4 w-4" /></button>
        <div className="flex items-center gap-2 pr-12">
          <Compass className="h-5 w-5 text-[#9cad84]" />
          <h2 id="welcome-title" className="text-xl font-semibold">{t.welcomeTitle}</h2>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#c2cbd3]">
          <p>{t.welcomeIntro}</p>
          <p>{t.welcomeGuessFeedback}</p>
          <p>{t.welcomeClueMechanic}</p>
        </div>

        <button
          onClick={onClose}
          className="nothing-button mt-5 flex w-full items-center justify-center gap-2 bg-[#3FD17C] text-[#0A0C10] hover:bg-[#3FD17C]/85"
        >
          {t.welcomeDismissCta}
        </button>
      </div>
    </div>
  );
};
