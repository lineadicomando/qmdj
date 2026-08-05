import { describe, expect, it } from 'vitest';
import { en } from '../src/catalogs/en.js';
import { it as italian } from '../src/catalogs/it.js';
import { LOCALES, catalogs } from '../src/index.js';

/**
 * The typing already makes a missing Italian key a compilation error. These
 * tests cover what types cannot: a key left behind after an English one is
 * renamed, and a translation whose placeholders no longer match the original.
 */
describe('catalog parity', () => {
  it('covers every locale', () => {
    expect(Object.keys(catalogs).sort()).toEqual([...LOCALES].sort());
  });

  it('has the same keys in both directions', () => {
    expect(Object.keys(italian).sort()).toEqual(Object.keys(en).sort());
  });

  it('has no empty message', () => {
    for (const [locale, catalog] of Object.entries(catalogs)) {
      for (const [key, message] of Object.entries(catalog)) {
        expect(message.trim(), `${locale} / ${key}`).not.toBe('');
      }
    }
  });

  it('uses the same placeholders in every translation', () => {
    for (const [key, original] of Object.entries(en)) {
      const expected = placeholders(original);
      for (const [locale, catalog] of Object.entries(catalogs)) {
        expect(placeholders(catalog[key as keyof typeof en]), `${locale} / ${key}`).toEqual(
          expected,
        );
      }
    }
  });
});

function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1] as string).sort();
}
