'use client';

import { Accessibility, Footprints, HeartHandshake, MapPinned } from 'lucide-react';
import { Translations } from '../lib/i18n';
import { City } from '../lib/types';

function getFormContext(type: City['morphology']['type'], t: Translations): string {
  switch (type) {
    case 'radial-concentric':
      return t.formContextRadial;
    case 'linear-river':
      return t.formContextLinear;
    case 'coastal-bay':
      return t.formContextCoastal;
    case 'island-archipelago':
      return t.formContextIsland;
    case 'grid-sprawl':
      return t.formContextGrid;
    case 'valley-basin':
      return t.formContextValley;
    case 'delta-estuary':
      return t.formContextDelta;
    default:
      return t.formContextGrid;
  }
}

export const EverydayAccess = ({ city, t }: { city: City; t: Translations }) => (
  <div className="rounded-md border border-[#3FD17C]/25 bg-[#0A0C10]/70 p-3.5">
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3FD17C]/12 text-[#b5c69b]">
        <Footprints className="h-4 w-4" />
      </span>
      <div>
        <h4 className="text-sm font-semibold text-[#eef1f3]">{t.everydayAccessTitle}</h4>
        <p className="mt-1 text-xs leading-relaxed text-[#aeb8c2]">
          {t.everydayAccessDesc}
        </p>
      </div>
    </div>

    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <div className="rounded border border-white/8 bg-[#10141C] p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#cdd5dc]">
          <MapPinned className="h-3.5 w-3.5 text-[#9cad84]" /> {t.builtFormContext}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#9eabb6]">
          {getFormContext(city.morphology.type, t)}
        </p>
      </div>
      <div className="rounded border border-white/8 bg-[#10141C] p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#cdd5dc]">
          <HeartHandshake className="h-3.5 w-3.5 text-[#FFB238]" /> {t.socialInfrastructureTitle}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#9eabb6]">
          {t.socialInfrastructureDesc}
        </p>
      </div>
    </div>

    <div className="mt-2 flex gap-2 rounded border border-[#FFB238]/20 bg-[#FFB238]/6 p-2.5 text-xs leading-relaxed text-[#aeb8c2]">
      <Accessibility className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FFB238]" />
      <p>{t.accessUnscoredNote}</p>
    </div>

    <div className="mt-2 border-t border-white/8 pt-2.5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#9cad84]">
        {t.collectiveLeversTitle}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[#9eabb6]">
        {t.collectiveLeversDesc}
      </p>
    </div>
  </div>
);
