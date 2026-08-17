'use client';

import React from 'react';
import { Locale, Translations } from '../lib/i18n';
import { getKoppenBreakdown } from '../lib/koppen';
import { X } from 'lucide-react';
import { useDialogA11y } from '../lib/useDialogA11y';

interface KoppenModalProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  is2050?: boolean;
  t: Translations;
}

export const KoppenModal: React.FC<KoppenModalProps> = ({
  code,
  isOpen,
  onClose,
  locale,
  is2050 = false,
  t,
}) => {
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, onClose);
  if (!isOpen) return null;

  const b = getKoppenBreakdown(code, locale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="koppen-title" className="relative w-full max-w-lg rounded-lg border border-[rgba(232,236,240,0.18)] bg-[#10141C] text-[#F4F6F8] shadow-2xl p-5 sm:p-6 flex flex-col gap-4 font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={t.closeLabel}
          className="absolute top-4 right-4 p-1.5 rounded text-[#7d8b99] hover:text-[#F4F6F8] hover:bg-[#18212e] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Nothing-OS dot-matrix style */}
        <div className="flex items-center gap-3 border-b border-[rgba(232,236,240,0.08)] pb-3">
          <div className="w-10 h-10 rounded border border-[#3FD17C] bg-[#3FD17C]/20 flex items-center justify-center text-[#34D67E] font-bold text-lg">
            {code}
          </div>
          <div>
            <span className="stamp text-[0.62rem] text-[#3FD17C] block">
              {is2050 ? t.koppenProjected2050Header : t.koppenCurrentClassHeader}
            </span>
            <h3 id="koppen-title" className="text-base sm:text-lg font-bold text-[#F4F6F8] serif">
              {b.name}
            </h3>
          </div>
        </div>

        {/* 3-Letter Scientific Breakdown */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="stamp text-[0.6rem] text-[#7d8b99]">
            {t.koppenCodeBreakdownHeader}
          </span>

          {/* Letter 1 */}
          <div className="p-3 rounded border border-[rgba(232,236,240,0.08)] bg-[#0A0C10] flex items-start gap-3">
            <div className="w-7 h-7 rounded bg-[#3FD17C]/20 border border-[#3FD17C]/40 text-[#34D67E] font-bold flex items-center justify-center text-sm shrink-0">
              {b.letter1.letter}
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-bold text-[#F4F6F8]">
                {t.koppenLetter1Label} {b.letter1.name}
              </span>
              <span className="text-[#8a97a5] text-[0.72rem] leading-relaxed mt-0.5">
                {b.letter1.desc}
              </span>
            </div>
          </div>

          {/* Letter 2 */}
          <div className="p-3 rounded border border-[rgba(232,236,240,0.08)] bg-[#0A0C10] flex items-start gap-3">
            <div className="w-7 h-7 rounded bg-[#FFB238]/20 border border-[#FFB238]/40 text-[#FFB238] font-bold flex items-center justify-center text-sm shrink-0">
              {b.letter2.letter}
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-bold text-[#F4F6F8]">
                {t.koppenLetter2Label} {b.letter2.name}
              </span>
              <span className="text-[#8a97a5] text-[0.72rem] leading-relaxed mt-0.5">
                {b.letter2.desc}
              </span>
            </div>
          </div>

          {/* Letter 3 */}
          {b.letter3 && (
            <div className="p-3 rounded border border-[rgba(232,236,240,0.08)] bg-[#0A0C10] flex items-start gap-3">
              <div className="w-7 h-7 rounded bg-red-500/20 border border-red-500/40 text-red-400 font-bold flex items-center justify-center text-sm shrink-0">
                {b.letter3.letter}
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-[#F4F6F8]">
                  {t.koppenLetter3Label} {b.letter3.name}
                </span>
                <span className="text-[#8a97a5] text-[0.72rem] leading-relaxed mt-0.5">
                  {b.letter3.desc}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Full Explanation Summary */}
        <div className="p-3 rounded bg-[#10141C] border border-[#2a3340] text-xs text-[#aab6c2] leading-relaxed">
          <p>{b.fullExplanation}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded bg-[#3FD17C] hover:bg-[#3FD17C]/90 text-[#0A0C10] font-bold text-xs mono uppercase transition-colors"
        >
          {t.closeExplanationLabel}
        </button>
      </div>
    </div>
  );
};
