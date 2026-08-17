'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Translations } from '../lib/i18n';

interface ExploreMenuProps {
  t: Translations;
}

interface ExploreLink {
  href: string;
  label: string;
}

interface ExploreLinkGroup {
  id: string;
  caption: string;
  links: ExploreLink[];
}

// Matches the menu panel's `w-56` Tailwind class below — kept as a named
// constant since the overflow check needs the same number in JS.
const MENU_WIDTH_PX = 224;

// Caps the dropdown's visible height so a future 8th link (or a long
// locale's captions) can't silently push the panel past the viewport —
// mirrors SearchInput.tsx's autocomplete dropdown (`max-h-72
// overflow-y-auto`), the existing convention for scrollable floating
// panels in this codebase.
const MENU_MAX_HEIGHT_CLASS = 'max-h-72 overflow-y-auto';

/**
 * Consolidates Atlas/Almanac/Marathon behind a single header icon (Phase 4,
 * Workstream Y) — replaces the old standalone Atlas `<Link>` icon so the
 * header gains two new destinations with zero new permanent icons.
 *
 * Keyboard support: Enter/Space/ArrowDown on the trigger opens the menu and
 * focuses the first item; ArrowUp/ArrowDown move between items; Escape
 * closes and returns focus to the trigger; Tab moves through items in DOM
 * order and closes the menu on exit (either end). A mousedown outside the
 * whole component also closes it. Visual style mirrors SearchInput.tsx's
 * autocomplete dropdown (same border/background/hover treatment) so the
 * app has one consistent floating-panel language.
 *
 * Anchor side is measured, not a fixed breakpoint: the header's own
 * `flex-wrap` means whether this trigger ends up near the left edge of its
 * row (small viewports, but also plenty of in-between widths where the
 * header hasn't yet fit on one line) or embedded mid-row near the right
 * edge (full desktop width) depends on actual content width, not a clean
 * viewport cutoff — confirmed by testing 375px (wraps, trigger near left)
 * and 640px (*also* still wraps there, trigger still near left) before
 * landing on measuring the trigger's real position instead of guessing.
 */
export const ExploreMenu = ({ t }: ExploreMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<'left' | 'right'>('right');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Same 7 destinations as before, just clustered under quiet dividers so
  // the flat list gets some visual hierarchy. Grouping is purely visual —
  // hrefs, labels, and the order within each group are unchanged, and
  // group wrapper elements don't affect [role="menuitem"] traversal below
  // (querySelectorAll walks DOM order regardless of nesting).
  const groups: ExploreLinkGroup[] = [
    {
      id: 'reference',
      caption: t.exploreGroupReferenceLabel,
      links: [
        { href: '/atlas', label: t.openAtlasLabel },
        { href: '/almanac', label: t.openAlmanacLabel },
      ],
    },
    {
      id: 'play',
      caption: t.exploreGroupPlayLabel,
      links: [
        { href: '/marathon', label: t.openMarathonLabel },
        { href: '/playlists', label: t.openPlaylistsLabel },
        { href: '/time-machine', label: t.openTimeMachineLabel },
        { href: '/quickfire', label: t.openQuickfireLabel },
      ],
    },
    {
      id: 'read',
      caption: t.exploreGroupReadLabel,
      links: [{ href: '/notes', label: t.openNotesLabel }],
    },
  ];

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      // Right-anchored (opens leftward) is the default, matching the
      // trigger's usual spot near the header's right edge. Flip to
      // left-anchored (opens rightward) whenever a right-anchored menu of
      // this width would run past the left edge of the viewport.
      setMenuAnchor(rect.right - MENU_WIDTH_PX < 0 ? 'left' : 'right');
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // Move focus onto the first menu item once it mounts, matching standard
    // native menu behavior (mirrors how a <select> or OS menu focuses its
    // first option on open).
    const firstItem = containerRef.current?.querySelector<HTMLAnchorElement>('[role="menuitem"]');
    firstItem?.focus();
  }, [isOpen]);

  const getItems = () =>
    Array.from(containerRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') ?? []);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu();
    }
  };

  const handleItemKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const items = getItems();
    const currentIndex = items.indexOf(event.currentTarget);
    if (currentIndex === -1) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = items[(currentIndex + 1) % items.length];
      next?.focus();
      // The list now scrolls (MENU_MAX_HEIGHT_CLASS), so wrapping from the
      // last item back to the first — or just moving past the visible
      // edge — needs an explicit scroll; focus() alone doesn't reposition
      // the panel's scroll offset.
      next?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = items[(currentIndex - 1 + items.length) % items.length];
      prev?.focus();
      prev?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Tab' && !event.shiftKey && currentIndex === items.length - 1) {
      // Tabbing forward off the last item — let focus continue naturally,
      // just close the now-orphaned menu behind it.
      setIsOpen(false);
    } else if (event.key === 'Tab' && event.shiftKey && currentIndex === 0) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t.exploreMenuLabel}
        title={t.exploreMenuLabel}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="icon-button shrink-0"
      >
        <Compass className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={t.exploreMenuLabel}
          className={`absolute top-full z-50 mt-1 w-56 rounded border border-[rgba(232,236,240,0.18)] bg-[#10141C] shadow-2xl backdrop-blur-md ${MENU_MAX_HEIGHT_CLASS} ${
            menuAnchor === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {groups.map((group, groupIndex) => (
            <div
              key={group.id}
              className={groupIndex > 0 ? 'border-t border-[rgba(232,236,240,0.08)]' : undefined}
            >
              <p className="stamp px-3.5 pb-1 pt-2.5 text-[0.58rem]">{group.caption}</p>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  onKeyDown={handleItemKeyDown}
                  className="block w-full border-b border-[rgba(232,236,240,0.05)] px-3.5 py-2.5 text-left text-sm font-semibold text-[#aab6c2] transition-colors last:border-b-0 hover:bg-[#18212e] hover:text-[#F4F6F8] focus:bg-[#18212e] focus:text-[#F4F6F8] focus:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
