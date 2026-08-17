import { describe, it, expect } from 'vitest';
import { CURATOR_NOTES, CuratorNote, getCuratorNoteForDay } from './curatorNotes';

describe('CURATOR_NOTES pool', () => {
  it('has between 18 and 24 notes', () => {
    expect(CURATOR_NOTES.length).toBeGreaterThanOrEqual(18);
    expect(CURATOR_NOTES.length).toBeLessThanOrEqual(24);
  });

  it('every note has a unique id', () => {
    const ids = CURATOR_NOTES.map((note) => note.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every note has a non-empty title and 2-4 non-empty paragraphs', () => {
    for (const note of CURATOR_NOTES) {
      expect(note.title.trim().length).toBeGreaterThan(0);
      expect(note.paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(note.paragraphs.length).toBeLessThanOrEqual(4);
      for (const paragraph of note.paragraphs) {
        expect(paragraph.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe('getCuratorNoteForDay', () => {
  // A small synthetic pool (distinct from the real CURATOR_NOTES content)
  // so the cycling-math assertions below don't need updating every time a
  // note gets added or reworded.
  const pool: CuratorNote[] = [
    { id: 'a', title: 'A', paragraphs: ['a1'] },
    { id: 'b', title: 'B', paragraphs: ['b1'] },
    { id: 'c', title: 'C', paragraphs: ['c1'] },
  ];

  it('cycles deterministically through the pool starting at day 1', () => {
    expect(getCuratorNoteForDay(1, pool).id).toBe('a');
    expect(getCuratorNoteForDay(2, pool).id).toBe('b');
    expect(getCuratorNoteForDay(3, pool).id).toBe('c');
    expect(getCuratorNoteForDay(4, pool).id).toBe('a');
  });

  it('the same dailyNumber always returns the same note', () => {
    expect(getCuratorNoteForDay(42, pool).id).toBe(getCuratorNoteForDay(42, pool).id);
  });

  it('two different dailyNumbers within one cycle return genuinely different notes', () => {
    expect(getCuratorNoteForDay(1, pool).id).not.toBe(getCuratorNoteForDay(2, pool).id);
  });

  it('clamps a non-positive dailyNumber to day 1 instead of throwing', () => {
    expect(getCuratorNoteForDay(0, pool).id).toBe('a');
    expect(getCuratorNoteForDay(-5, pool).id).toBe('a');
  });

  it('throws on an empty notes pool rather than returning undefined', () => {
    expect(() => getCuratorNoteForDay(1, [])).toThrow();
  });

  it('the real CURATOR_NOTES pool produces a different featured note across two different daily numbers', () => {
    const first = getCuratorNoteForDay(1, CURATOR_NOTES);
    const second = getCuratorNoteForDay(2, CURATOR_NOTES);
    expect(first.id).not.toBe(second.id);
  });
});
