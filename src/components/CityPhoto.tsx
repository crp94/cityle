'use client';

import React from 'react';
import { City } from '../lib/types';

interface CityPhotoProps {
  city: City;
}

/**
 * Renders a curated city photograph with visible attribution when the city has one.
 * Most cities in the pool do NOT have an image — this must degrade to rendering
 * nothing at all (never a placeholder image or generic icon) when image_url is absent.
 */
export const CityPhoto: React.FC<CityPhotoProps> = ({ city }) => {
  if (!city.image_url) return null;

  return (
    <figure className="nothing-widget flex flex-col overflow-hidden p-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={city.image_url}
        alt={city.image_caption || city.name}
        loading="lazy"
        className="h-48 w-full object-cover sm:h-64"
      />
      {(city.image_caption || city.image_author || city.image_license) && (
        <figcaption className="flex flex-col gap-0.5 border-t border-[rgba(232,236,240,0.08)] px-3 py-2 text-[0.68rem] leading-snug">
          {city.image_caption && (
            <span className="text-[#c3cbd3]">{city.image_caption}</span>
          )}
          {(city.image_author || city.image_license) && (
            <span className="text-[#7d8b99]">
              {city.image_author}
              {city.image_author && city.image_license ? ' · ' : ''}
              {city.image_license}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
};
