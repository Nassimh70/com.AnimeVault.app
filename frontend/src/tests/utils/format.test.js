import { describe, expect, it } from 'vitest';
import {
  clamp,
  cn,
  formatDate,
  formatDateTime,
  formatEpisodes,
  formatHours,
  formatMonth,
  initials,
  pluralize,
  progressPercent,
  splitList,
} from '@/utils/format';

describe('format', () => {
  it('borne la progression entre 0 et 100 %', () => {
    expect(progressPercent(5, 10)).toBe(50);
    expect(progressPercent(-2, 10)).toBe(0);
    expect(progressPercent(15, 13)).toBe(100);
    expect(progressPercent(5, 0)).toBe(0);
    expect(clamp(12, 0, 10)).toBe(10);
  });

  it('formate les dates françaises et refuse les valeurs invalides', () => {
    expect(formatDate('2018-01-11')).toMatch(/11.*janv.*2018/);
    expect(formatDate('2018-01-11', 'long')).toMatch(/11.*janvier.*2018/);
    expect(formatDate('pas-une-date')).toBe('—');
    expect(formatDate(null)).toBe('—');
    expect(formatDateTime('2026-01-01T10:30:00.000Z')).toMatch(/2026/);
  });

  it('formate les durées et les épisodes', () => {
    expect(formatHours(0)).toBe('0 h');
    expect(formatHours(8)).toBe('8 h');
    expect(formatHours(50)).toBe('2 j 2 h');
    expect(formatHours(48)).toBe('2 j');
    expect(formatEpisodes(5, 13)).toBe('5 / 13');
    expect(formatEpisodes(0, 0)).toBe('0 / ?');
  });

  it('formate les mois et les libellés', () => {
    expect(formatMonth('2026-10')).toMatch(/oct/i);
    expect(formatMonth('invalide')).toBe('invalide');
    expect(pluralize(1, 'anime')).toBe('1 anime');
    expect(pluralize(3, 'anime')).toBe('3 animes');
    expect(pluralize(0, 'anime')).toBe('0 anime');
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });

  it('calcule des initiales et nettoie les listes', () => {
    expect(initials('  Nassim  Ben ')).toBe('NB');
    expect(initials('')).toBe('');
    expect(splitList('Action, Drame, action,, Fantasy')).toEqual(['Action', 'Drame', 'Fantasy']);
    expect(splitList('')).toEqual([]);
  });
});
