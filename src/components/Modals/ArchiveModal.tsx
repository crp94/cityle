'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getCycleInfo, getDailyGameNumber } from '../../lib/gameLogic';
import { Translations } from '../../lib/i18n';
import { getArchiveCompletionMap, getArchiveState } from '../../lib/storage';
import { City, GameStatus } from '../../lib/types';
import { useDialogA11y } from '../../lib/useDialogA11y';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: City[];
  currentDailyNumber: number;
  onSelectDay: (day: number) => void;
  t: Translations;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

const STATUS_BADGE_CLASS: Record<GameStatus | 'unplayed', string> = {
  won: 'bg-[#3FD17C] text-[#0A0C10] hover:brightness-110',
  lost: 'bg-[#8a4a42] text-[#f4e6e4] hover:brightness-110',
  playing: 'bg-[#FFB238]/40 text-[#eef1f3] hover:brightness-110',
  unplayed: 'bg-[#1a212b] text-[#8f9dac] hover:bg-[#232c38]',
};

export const ArchiveModal = ({
  isOpen,
  onClose,
  cities,
  currentDailyNumber,
  onSelectDay,
  t,
}: ArchiveModalProps) => {
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, onClose);
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today));

  if (!isOpen) return null;

  const currentMonthStart = startOfMonth(today);
  const canGoNext = visibleMonth.getTime() < currentMonthStart.getTime();

  const completionMap = getArchiveCompletionMap();
  const poolSize = cities.length || 1;
  const cycleInfo = getCycleInfo(currentDailyNumber, poolSize);
  const cycleStart = (cycleInfo.cycle - 1) * cycleInfo.poolSize + 1;
  const cycleEnd = cycleInfo.cycle * cycleInfo.poolSize;

  const firstWeekday = visibleMonth.getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();

  const leadingPad: null[] = new Array(firstWeekday).fill(null);
  const monthDates: Date[] = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    monthDates.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), d));
  }

  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' });
  const weekdayLabels = [0, 1, 2, 3, 4, 5, 6].map((offset) =>
    weekdayFormatter.format(new Date(2026, 7, 2 + offset)) // 2026-08-02 is a Sunday
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="archive-title" className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-lg border border-white/15 bg-[#10141C] p-4 text-[#F4F6F8] shadow-2xl sm:p-6">
        <button onClick={onClose} aria-label={t.closeArchive} className="icon-button absolute right-3 top-3"><X className="h-4 w-4" /></button>

        <div className="flex items-center gap-2 pr-12">
          <CalendarDays className="h-5 w-5 text-[#9cad84]" />
          <h2 id="archive-title" className="text-lg font-semibold">{t.archiveTitle}</h2>
        </div>

        <p className="mt-1 text-xs text-[#8f9dac]">
          {t.archiveCycleLabel
            .replace('{cycle}', String(cycleInfo.cycle))
            .replace('{start}', String(cycleStart))
            .replace('{end}', String(cycleEnd))}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
            aria-label={t.previousMonth}
            className="icon-button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold capitalize">{monthLabel}</span>
          <button
            type="button"
            onClick={() => canGoNext && setVisibleMonth((m) => addMonths(m, 1))}
            aria-label={t.nextMonth}
            disabled={!canGoNext}
            className="icon-button disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.65rem] text-[#7d8b99]">
          {weekdayLabels.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {leadingPad.map((_, index) => (
            <span key={`pad-${index}`} className="aspect-square" />
          ))}

          {monthDates.map((date) => {
            const dailyNum = getDailyGameNumber(date);
            const inRange = dailyNum >= 1 && dailyNum <= currentDailyNumber;
            const isToday = dailyNum === currentDailyNumber;

            if (!inRange) {
              return (
                <span
                  key={date.toISOString()}
                  className="flex aspect-square items-center justify-center rounded text-xs text-[#3a4552]"
                >
                  {date.getDate()}
                </span>
              );
            }

            const status = completionMap[dailyNum];
            const badgeKey: GameStatus | 'unplayed' = status ?? 'unplayed';
            const guessCount =
              status === 'won' ? getArchiveState(dailyNum)?.guesses.length : undefined;
            const statusLabel =
              status === 'won'
                ? t.archiveStatusWon
                : status === 'lost'
                  ? t.archiveStatusLost
                  : status === 'playing'
                    ? t.archiveStatusInProgress
                    : t.archiveStatusUnplayed;

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => onSelectDay(dailyNum)}
                aria-label={`${t.archiveDayLabel.replace('{n}', String(dailyNum))} · ${statusLabel}${isToday ? ` · ${t.archiveTodayLabel}` : ''}`}
                className={`relative aspect-square rounded text-xs font-semibold transition-colors ${STATUS_BADGE_CLASS[badgeKey]} ${isToday ? 'ring-2 ring-[#FFB238]' : ''}`}
              >
                <span>{date.getDate()}</span>
                {typeof guessCount === 'number' && (
                  <span className="absolute bottom-0.5 right-0.5 text-[0.55rem] font-bold leading-none">
                    {guessCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-[0.65rem] text-[#8f9dac]">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#3FD17C]" /> {t.archiveStatusWon}</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#8a4a42]" /> {t.archiveStatusLost}</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#FFB238]/60" /> {t.archiveStatusInProgress}</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full border border-[#2a3340] bg-[#1a212b]" /> {t.archiveStatusUnplayed}</span>
        </div>
      </div>
    </div>
  );
};
