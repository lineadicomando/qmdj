import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, isLocale, parseLocale, resolveLocale } from '../src/index.js';

describe('isLocale', () => {
  it('accepts the locales the project speaks', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('it')).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('it-CH')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe('parseLocale', () => {
  it('reads a plain tag', () => {
    expect(parseLocale('it')).toBe('it');
  });

  it('ignores the region', () => {
    // The project has no regional variants: rejecting `it-CH` would throw
    // away a perfectly clear preference.
    expect(parseLocale('it-CH')).toBe('it');
    expect(parseLocale('en-GB')).toBe('en');
  });

  it('reads a POSIX environment value', () => {
    expect(parseLocale('it_IT.UTF-8')).toBe('it');
  });

  it('honours the quality of an Accept-Language header', () => {
    expect(parseLocale('fr;q=0.9, it;q=0.8, en;q=0.7')).toBe('it');
    expect(parseLocale('it;q=0.3, en;q=0.9')).toBe('en');
  });

  it('keeps the header order at equal quality', () => {
    expect(parseLocale('it, en')).toBe('it');
    expect(parseLocale('en, it')).toBe('en');
  });

  it('discards a language refused with q=0', () => {
    expect(parseLocale('it;q=0, en')).toBe('en');
  });

  it('returns undefined when nothing matches', () => {
    // Distinguishing "said nothing" from "said English" is what lets
    // resolveLocale move on to the next candidate.
    expect(parseLocale('fr, de')).toBeUndefined();
    expect(parseLocale('*')).toBeUndefined();
    expect(parseLocale('')).toBeUndefined();
    expect(parseLocale(null)).toBeUndefined();
  });
});

describe('resolveLocale', () => {
  it('takes the first usable candidate', () => {
    expect(resolveLocale(null, 'it', 'en')).toBe('it');
  });

  it('skips candidates that say nothing', () => {
    expect(resolveLocale(undefined, '', 'fr', 'it-CH')).toBe('it');
  });

  it('falls back to English', () => {
    expect(resolveLocale()).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(null, undefined, 'de')).toBe('en');
  });
});
