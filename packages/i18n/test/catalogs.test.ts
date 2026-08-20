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

  /**
   * A reading of 命 is addressed to the person the board was laid on, and the
   * board is told their gender. The prompt must not presume it instead.
   *
   * This began as a real report: an Italian reading addressed a man in the
   * feminine throughout. The English rule says «address them»; the Italian
   * rendered it «rivolgiti a lei», whose antecedent is «chi legge», which
   * takes masculine agreement — so there was no feminine antecedent and the
   * line simply read «address her». One mistranslated pronoun in an operative
   * rule, and every reading in the language obeyed it.
   *
   * The two other «lei» in this block are correct and stay: they agree with
   * «la persona», feminine in Italian whatever the person's sex.
   */
  it('never tells the reading which gender to address', () => {
    for (const [locale, catalog] of Object.entries(catalogs)) {
      const register = catalog['prompt.ming.register' as keyof typeof en];
      for (const presumed of [' a lei', ' a lui', ' her,', ' him,']) {
        expect(register, `${locale} / prompt.ming.register`).not.toContain(presumed);
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
