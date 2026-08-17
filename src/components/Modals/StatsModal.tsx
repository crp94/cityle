'use client';

import React, { useState } from 'react';
import {
  ACHIEVEMENT_IDS,
  AchievementId,
  AchievementsState,
  createDefaultAchievementsState,
} from '../../lib/achievements';
import { GameMode, GameStats } from '../../lib/types';
import { Translations } from '../../lib/i18n';
import { Award, BarChart3, Flame, Lock, Trophy, X, Zap } from 'lucide-react';
import { useDialogA11y } from '../../lib/useDialogA11y';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  achievements?: AchievementsState;
  mode?: GameMode;
  t: Translations;
}

type StatsTab = 'daily' | 'unlimited' | 'badges';

const BADGE_COPY: Record<AchievementId, { name: keyof Translations; desc: keyof Translations }> = {
  'first-flight': { name: 'badgeFirstFlightName', desc: 'badgeFirstFlightDesc' },
  'continental-hop': { name: 'badgeContinentalHopName', desc: 'badgeContinentalHopDesc' },
  'climate-cartographer': {
    name: 'badgeClimateCartographerName',
    desc: 'badgeClimateCartographerDesc',
  },
  'first-guess-ace': { name: 'badgeFirstGuessAceName', desc: 'badgeFirstGuessAceDesc' },
  'streak-keeper': { name: 'badgeStreakKeeperName', desc: 'badgeStreakKeeperDesc' },
  marathoner: { name: 'badgeMarathonerName', desc: 'badgeMarathonerDesc' },
  'deep-diver': { name: 'badgeDeepDiverName', desc: 'badgeDeepDiverDesc' },
  'hard-mode-cartographer': {
    name: 'badgeHardModeCartographerName',
    desc: 'badgeHardModeCartographerDesc',
  },
};

function GuessDistributionChart({
  distribution,
  t,
}: {
  distribution: Record<number, number>;
  t: Translations;
}) {
  const maxDistribution = Math.max(1, ...Object.values(distribution || {}));

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-[rgba(232,236,240,0.07)]">
      <span className="stamp text-[0.62rem] text-[#7d8b99]">{t.guessDistribution}</span>

      <div className="flex flex-col gap-1.5 mono text-xs">
        {[1, 2, 3, 4, 5, 6].map((guessNum) => {
          const count = distribution?.[guessNum] || 0;
          const widthPct = Math.max(7, Math.round((count / maxDistribution) * 100));

          return (
            <div key={guessNum} className="flex items-center gap-2">
              <span className="w-3 text-[#7d8b99] text-right">{guessNum}</span>
              <div className="flex-1 bg-[#0A0C10] rounded-xs overflow-hidden h-5 flex items-center">
                <div
                  style={{ width: `${count > 0 ? widthPct : 7}%` }}
                  className={`h-full flex items-center justify-end px-2 text-[0.68rem] font-bold rounded-xs transition-all ${
                    count > 0
                      ? 'bg-[#3FD17C] text-[#0A0C10]'
                      : 'bg-[#2a3340]/40 text-[#7d8b99]'
                  }`}
                >
                  {count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon,
  valueClassName = 'text-[#F4F6F8]',
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  icon?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="p-3 rounded bg-[#0A0C10] border border-[#2a3340] flex flex-col">
      <span className={`text-xl sm:text-2xl font-bold ${valueClassName}`}>{value}</span>
      <span className="stamp mt-1 flex items-center justify-center gap-0.5 text-[0.65rem] text-[#8f9dac]">
        {icon} {label}
      </span>
    </div>
  );
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  achievements = createDefaultAchievementsState(),
  mode,
  t,
}) => {
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, onClose);
  const [activeTab, setActiveTab] = useState<StatsTab>(mode === 'unlimited' ? 'unlimited' : 'daily');

  if (!isOpen) return null;

  const winPct = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  const tabs: { id: StatsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'daily', label: t.daily, icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'unlimited', label: t.unlimited, icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'badges', label: t.badgesTabLabel, icon: <Award className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="stats-title" className="relative w-full max-w-md rounded-lg border border-[rgba(232,236,240,0.18)] bg-[#10141C] text-[#F4F6F8] shadow-2xl p-5 sm:p-6 flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close statistics"
          className="absolute top-4 right-4 p-1.5 rounded text-[#7d8b99] hover:text-[#F4F6F8] hover:bg-[#18212e] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 border-b border-[rgba(232,236,240,0.07)] pb-3">
          <BarChart3 className="w-5 h-5 text-[#3FD17C]" />
          <h2 id="stats-title" className="text-lg font-bold serif text-[#F4F6F8]">
            {t.statsTitle}
          </h2>
        </div>

        {/* Tab switcher */}
        <div role="tablist" aria-label={t.statsTitle} className="flex rounded-md border border-[#2a3340] bg-[#10151c] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab.id ? 'bg-[#F4F6F8] text-[#0A0C10]' : 'text-[#96a3af] hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'daily' && (
          <>
            <div className="grid grid-cols-4 gap-2 text-center mono">
              <StatCard value={stats.played} label={t.played} />
              <StatCard value={`${winPct}%`} label={t.winRate} valueClassName="text-[#34D67E]" />
              <StatCard
                value={stats.currentStreak}
                label={t.currentStreak}
                icon={<Flame className="w-2.5 h-2.5 text-[#FFB238]" />}
                valueClassName="text-[#FFB238]"
              />
              <StatCard
                value={stats.maxStreak}
                label={t.maxStreak}
                icon={<Trophy className="w-2.5 h-2.5 text-[#3FD17C]" />}
              />
            </div>
            <GuessDistributionChart distribution={stats.guessDistribution} t={t} />
          </>
        )}

        {activeTab === 'unlimited' && (
          <>
            <div className="grid grid-cols-4 gap-2 text-center mono">
              <StatCard value={stats.unlimited.played} label={t.played} />
              <StatCard value={stats.unlimited.won} label={t.wonLabel} valueClassName="text-[#34D67E]" />
              <StatCard
                value={stats.unlimited.currentRun}
                label={t.currentRunLabel}
                icon={<Zap className="w-2.5 h-2.5 text-[#FFB238]" />}
                valueClassName="text-[#FFB238]"
              />
              <StatCard
                value={stats.unlimited.bestRun}
                label={t.bestRunLabel}
                icon={<Trophy className="w-2.5 h-2.5 text-[#3FD17C]" />}
              />
            </div>
            {typeof stats.unlimited.bestGuessCount === 'number' && (
              <div className="text-center text-xs text-[#8f9dac]">
                {t.bestGuessLabel}: <span className="font-bold text-[#F4F6F8]">{stats.unlimited.bestGuessCount}</span>
              </div>
            )}
            <GuessDistributionChart distribution={stats.unlimited.guessDistribution} t={t} />
          </>
        )}

        {activeTab === 'badges' && (
          <div className="flex flex-col gap-2">
            {ACHIEVEMENT_IDS.map((id) => {
              const unlockedAt = achievements.unlocked[id];
              const copy = BADGE_COPY[id];
              const isUnlocked = Boolean(unlockedAt);

              return (
                <div
                  key={id}
                  className={`flex items-start gap-2.5 rounded border p-2.5 ${
                    isUnlocked
                      ? 'border-[#3FD17C]/30 bg-[#3FD17C]/8'
                      : 'border-[#2a3340] bg-[#0A0C10]'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      isUnlocked ? 'bg-[#3FD17C]/20 text-[#b5c69b]' : 'bg-[#1a212b] text-[#565f68]'
                    }`}
                  >
                    {isUnlocked ? <Award className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                  </span>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${isUnlocked ? 'text-[#eef1f3]' : 'text-[#9aa7b3]'}`}>
                      {t[copy.name]}
                    </p>
                    <p className="mt-0.5 text-[0.68rem] leading-relaxed text-[#8f9dac]">
                      {t[copy.desc]}
                    </p>
                    <p className="mt-1 text-[0.62rem] uppercase tracking-wide text-[#6a7480]">
                      {isUnlocked
                        ? t.badgeUnlockedOn.replace('{date}', new Date(unlockedAt).toLocaleDateString())
                        : t.badgeLockedLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
