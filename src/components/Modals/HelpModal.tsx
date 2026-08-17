'use client';

import { Database, HelpCircle, X } from 'lucide-react';
import { Translations } from '../../lib/i18n';
import { useDialogA11y } from '../../lib/useDialogA11y';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWelcome: () => void;
  t: Translations;
}

export const HelpModal = ({ isOpen, onClose, onOpenWelcome, t }: HelpModalProps) => {
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, onClose);
  if (!isOpen) return null;

  const clueSteps = [
    t.clueStart,
    t.clueG1,
    t.clueG2,
    t.clueG3,
    t.clueG4,
    t.clueG5,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="help-title" className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/15 bg-[#10141C] p-4 text-[#d7dde2] shadow-2xl sm:p-6">
        <button onClick={onClose} aria-label={t.closeLabel} className="icon-button absolute right-3 top-3"><X className="h-4 w-4" /></button>
        <div className="flex items-center gap-2 pr-12">
          <HelpCircle className="h-5 w-5 text-[#9cad84]" />
          <h2 id="help-title" className="text-xl font-semibold">{t.helpTitle}</h2>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenWelcome();
          }}
          className="mt-2 text-xs text-[#b5c69b] underline underline-offset-2 hover:text-[#dce5d1]"
        >
          {t.replayWelcomeGuide}
        </button>

        <div className="mt-5 space-y-5 text-sm leading-relaxed">
          <section>
            <h3 className="text-sm font-semibold text-[#eef1f3]">{t.howToPlay}</h3>
            <p className="mt-1 text-[#aeb8c2]">{t.objectiveText}</p>
            <ol className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              {clueSteps.map((item, index) => (
                <li key={item} className="rounded border border-white/8 bg-[#0A0C10] p-2.5">
                  <span className="font-semibold text-[#9cad84]">#{index === 0 ? 'Start' : `Guess ${index}`}: </span>
                  {item}
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-md border border-[#FFB238]/25 bg-[#FFB238]/7 p-4">
            <div className="flex items-center gap-2 text-[#FFB238]"><Database className="h-4 w-4" /><h3 className="text-sm font-semibold">{t.dataStatusTitle}</h3></div>
            <p className="mt-2 text-[#c2cbd3]">{t.dataStatusP1}</p>
            <p className="mt-2 text-[#c2cbd3]">{t.dataStatusP2} {t.dataStatusP3}</p>
          </section>

          <section className="rounded-md border border-[#3FD17C]/25 bg-[#3FD17C]/7 p-4">
            <h3 className="text-sm font-semibold text-[#dce5d1]">{t.howToReadCity}</h3>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[#b8c2cb]">
              <li><strong className="text-[#eef1f3]">{t.readCityPoint1Title}</strong> {t.readCityPoint1Desc}</li>
              <li><strong className="text-[#eef1f3]">{t.readCityPoint2Title}</strong> {t.readCityPoint2Desc}</li>
              <li><strong className="text-[#eef1f3]">{t.readCityPoint3Title}</strong> {t.readCityPoint3Desc}</li>
              <li><strong className="text-[#eef1f3]">{t.readCityPoint4Title}</strong> {t.readCityPoint4Desc}</li>
              <li><strong className="text-[#eef1f3]">{t.readCityPoint5Title}</strong> {t.readCityPoint5Desc}</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[#eef1f3]">{t.referencesAndAttribution}</h3>
            <ul className="mt-2 space-y-2 text-xs text-[#aeb8c2]">
              <li>{t.sourceKoppen}</li>
              <li>{t.sourceAir}</li>
              <li>{t.sourceSocio}</li>
              <li>{t.osmCartoAttribution}</li>
              <li>
                {t.accessUnscoredNote}
                {' '}<a href="https://www.who.int/teams/environment-climate-change-and-health/healthy-urban-environments/transport" target="_blank" rel="noopener noreferrer" className="text-[#b5c69b] underline underline-offset-2">{t.whoTransportGuidance}</a>
              </li>
            </ul>
          </section>

          <p className="text-xs text-[#8f9dac]">{t.moreWaysToPlayNote}</p>
        </div>
      </div>
    </div>
  );
};
