'use client';

import React from 'react';
import { City } from '../lib/types';

interface CityPhotoProps {
  city: City;
  // When true, suppresses anything that could name the target city before a
  // win: the descriptive image_caption (every one of the 255 captions in the
  // dataset names the city directly, e.g. "Nairobi skyline from Uhuru
  // Park..."), the alt text (which otherwise falls back to city.name), and
  // any city-name occurrence inside the free-text image_author field (a rare
  // but real case — a few Wikimedia usernames happen to contain the city
  // name, e.g. "Guangzhou Private Tours by..."). License/author attribution
  // itself still renders (redacted) since most of these photos' CC licenses
  // require attribution wherever the image is displayed, not just somewhere
  // in the app. Used by Dossier.tsx's in-game placements (the Place & Map
  // tab and Photo mode's pinned header) where the city is still secret;
  // AlmanacCard.tsx renders its own photo directly rather than through this
  // component, since the Almanac already shows the city's name/flag plainly
  // and has no spoiler to protect.
  spoilerSafe?: boolean;
}

function redactCityName(text: string, cityName: string): string {
  const escaped = cityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escaped, 'gi'), 'this city');
}

/**
 * Renders a curated city photograph with visible attribution when the city has one.
 * Most cities in the pool do NOT have an image — this must degrade to rendering
 * nothing at all (never a placeholder image or generic icon) when image_url is absent.
 */
export const CityPhoto: React.FC<CityPhotoProps> = ({ city, spoilerSafe = false }) => {
  if (!city.image_url) return null;

  const altText = spoilerSafe ? 'Photo clue — city name hidden until you win' : city.image_caption || city.name;
  const authorText = spoilerSafe && city.image_author ? redactCityName(city.image_author, city.name) : city.image_author;

  return (
    <figure className="nothing-widget flex flex-col overflow-hidden p-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={city.image_url}
        alt={altText}
        loading="lazy"
        className="h-48 w-full object-cover sm:h-64"
      />
      {((!spoilerSafe && city.image_caption) || city.image_author || city.image_license) && (
        <figcaption className="flex flex-col gap-0.5 border-t border-[rgba(232,236,240,0.08)] px-3 py-2 text-[0.68rem] leading-snug">
          {!spoilerSafe && city.image_caption && (
            <span className="text-[#c3cbd3]">{city.image_caption}</span>
          )}
          {(authorText || city.image_license) && (
            <span className="text-[#7d8b99]">
              {authorText}
              {authorText && city.image_license ? ' · ' : ''}
              {city.image_license}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
};
