import { describe, expect, it } from 'vitest';
import { createTranslator, format, translate } from '../src/index.js';

describe('format', () => {
  it('fills placeholders', () => {
    expect(format('Cannot open {path}: {reason}', { path: '/tmp/a.db', reason: 'locked' })).toBe(
      'Cannot open /tmp/a.db: locked',
    );
  });

  it('converts numbers', () => {
    expect(format('{count} locations', { count: 12 })).toBe('12 locations');
  });

  it('leaves an unfilled placeholder visible', () => {
    // Blanking it would hide the mistake; leaving it makes someone report it.
    expect(format('Cannot open {path}', {})).toBe('Cannot open {path}');
  });

  it('returns the template untouched without parameters', () => {
    expect(format('The search string is empty.')).toBe('The search string is empty.');
  });
});

describe('translate', () => {
  it('renders in the requested locale', () => {
    expect(translate('en', 'geo.error.EMPTY_QUERY')).toBe('The search string is empty.');
    expect(translate('it', 'geo.error.EMPTY_QUERY')).toBe('La stringa di ricerca è vuota.');
  });

  it('interpolates in every locale', () => {
    for (const locale of ['en', 'it'] as const) {
      expect(translate(locale, 'geo.error.DATABASE_MISSING', { path: '/data/geonames.db' })).toContain(
        '/data/geonames.db',
      );
    }
  });
});

describe('createTranslator', () => {
  it('binds a locale and carries it', () => {
    const t = createTranslator('it');

    expect(t.locale).toBe('it');
    expect(t('geo.error.EMPTY_QUERY')).toBe('La stringa di ricerca è vuota.');
  });
});
