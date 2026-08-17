'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { City } from '../lib/types';
import { Translations } from '../lib/i18n';
import { getCountryFlag } from '../lib/geo';
import { Search, CornerDownLeft } from 'lucide-react';

interface SearchInputProps {
  cities: City[];
  onSelectCity: (city: City) => void;
  disabled?: boolean;
  alreadyGuessedIds: string[];
  t: Translations;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  cities,
  onSelectCity,
  disabled = false,
  alreadyGuessedIds,
  t,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  // Normalize query and filter
  const cleanQuery = query.trim().toLowerCase();
  const filtered = cleanQuery.length >= 1
    ? cities
        .filter(
          (c) =>
            !alreadyGuessedIds.includes(c.id) &&
            (c.name.toLowerCase().includes(cleanQuery) ||
              c.country.toLowerCase().includes(cleanQuery) ||
              c.countryCode.toLowerCase().includes(cleanQuery))
        )
        .slice(0, 10)
    : [];

  // The dropdown (suggestions OR a "no matches" message) is visible whenever
  // the user has typed something and hasn't dismissed it.
  const dropdownVisible = isOpen && cleanQuery.length >= 1;
  const hasResults = filtered.length > 0;
  // Guard against selectedIndex momentarily pointing past the end of a
  // shorter `filtered` array (e.g. props changing outside of typing).
  const activeIndex = hasResults ? Math.min(selectedIndex, filtered.length - 1) : -1;
  const activeOptionId =
    dropdownVisible && hasResults ? `${listboxId}-option-${filtered[activeIndex].id}` : undefined;

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: City) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape should always be able to close an open dropdown, even when
    // there are zero matches (the "no cities match" state).
    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
      return;
    }

    // Once the dropdown is closed (e.g. via Escape or an outside click),
    // arrow keys/Enter must not keep moving the internal selection or
    // silently select a city the user can no longer see highlighted.
    if (disabled || !isOpen || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[selectedIndex] ?? filtered[0];
      if (target) {
        handleSelect(target);
      }
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center rounded border border-[rgba(232,236,240,0.18)] bg-[#10141C] focus-within:border-[#3FD17C] focus-within:ring-1 focus-within:ring-[#3FD17C] transition-all shadow-sm">
        <div className="pl-3.5 pr-2 text-[#7d8b99]">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? t.gameFinished : t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          aria-autocomplete="list"
          role="combobox"
          aria-expanded={dropdownVisible}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          className="w-full bg-transparent py-2.5 pr-3 text-sm text-[#F4F6F8] placeholder-[#7d8b99] focus:outline-hidden disabled:opacity-50"
        />
        <div className="pr-3 hidden sm:flex items-center gap-1 text-[0.65rem] mono text-[#7d8b99]">
          <span className="p-1 rounded bg-[#0A0C10] border border-[#2a3340]">
            <CornerDownLeft className="w-3 h-3 inline" />
          </span>
          <span>{t.guesses.toUpperCase()}</span>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {dropdownVisible && (
        <div
          ref={dropdownRef}
          id={listboxId}
          role="listbox"
          aria-label={t.searchPlaceholder}
          className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-y-auto rounded border border-[rgba(232,236,240,0.18)] bg-[#10141C] shadow-2xl backdrop-blur-md"
        >
          {hasResults ? (
            filtered.map((city, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={city.id}
                  id={`${listboxId}-option-${city.id}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between border-b border-[rgba(232,236,240,0.05)] transition-colors ${
                    isSelected
                      ? 'bg-[#18212e] text-[#F4F6F8]'
                      : 'text-[#aab6c2] hover:bg-[#18212e]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">
                      {getCountryFlag(city.countryCode)}
                    </span>
                    <div>
                      <span className="font-semibold text-sm text-[#F4F6F8]">
                        {city.name}
                      </span>
                      <span className="text-xs text-[#7d8b99] ml-1.5">
                        {city.country}
                      </span>
                    </div>
                  </div>

                </button>
              );
            })
          ) : (
            <div
              role="status"
              aria-live="polite"
              className="px-3.5 py-3 text-sm text-[#7d8b99]"
            >
              No cities match &ldquo;{query.trim()}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
