'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface InertRecord {
  element: HTMLElement;
  wasInert: boolean;
  hadAriaHidden: boolean;
}

/**
 * Marks everything outside `keepInteractive`'s ancestor chain (up to
 * `document.body`) as inert, so the background page can't be scrolled into,
 * clicked, tabbed into, or reached by the accessibility tree while a modal
 * sits on top of it. Sets both the `inert` IDL attribute (blocks focus and
 * pointer events natively in browsers that support it) and `aria-hidden`
 * (a universally-supported belt-and-suspenders fallback for the handful of
 * older browsers/AT combinations that don't honor `inert` yet — cheaper and
 * more robust than branching on runtime feature support, since `inert` is a
 * silent no-op where it's unsupported). Returns a cleanup function that
 * restores exactly what it touched.
 */
function isolateBackground(keepInteractive: HTMLElement): () => void {
  const touched: InertRecord[] = [];

  let node: HTMLElement | null = keepInteractive;
  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (parent) {
      Array.from(parent.children).forEach((child) => {
        if (child === node || !(child instanceof HTMLElement)) return;
        const wasInert = child.inert;
        const hadAriaHidden = child.getAttribute('aria-hidden') === 'true';
        if (wasInert && hadAriaHidden) return; // already isolated by something else

        child.inert = true;
        child.setAttribute('aria-hidden', 'true');
        touched.push({ element: child, wasInert, hadAriaHidden });
      });
    }
    node = parent;
  }

  return () => {
    touched.forEach(({ element, wasInert, hadAriaHidden }) => {
      element.inert = wasInert;
      if (hadAriaHidden) {
        element.setAttribute('aria-hidden', 'true');
      } else {
        element.removeAttribute('aria-hidden');
      }
    });
  };
}

export function useDialogA11y<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void
) {
  const dialogRef = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });

    // Lock body scroll so the page behind the dialog can't move (which was
    // visibly breaking the dialog's own layout when the background got
    // scrolled while a modal was open).
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Isolate the rest of the app from input and the accessibility tree.
    // `dialogRef`'s own top-level wrapper (the fixed-position backdrop each
    // modal renders into) is what stays interactive; every sibling along
    // the path up to <body> gets marked inert.
    const isolationRoot = dialogRef.current?.parentElement ?? dialogRef.current;
    const restoreBackground = isolationRoot ? isolateBackground(isolationRoot) : null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreBackground?.();
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  return dialogRef;
}
