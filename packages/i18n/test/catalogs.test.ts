import { describe, expect, it } from 'vitest';
import { en } from '../src/catalogs/en.js';
import { loadCatalog, translatorOver } from '../src/translate.js';
import { it as italian } from '../src/catalogs/it.js';
import { LOCALES, catalogs, type MessageKey } from '../src/index.js';

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

/**
 * The split that keeps one reader from paying for the other's catalog.
 *
 * `catalogs` reaches both, which is what a bundler follows; these two reach
 * one. The saving is real only if what comes back is the same catalog the
 * static path holds, and only if a translator over it renders what the
 * translator over both does — so both halves are asserted rather than the
 * mechanism.
 */
describe('one catalog at a time', () => {
  it('loads the same catalog the static path holds', async () => {
    for (const locale of LOCALES) {
      expect(await loadCatalog(locale)).toBe(catalogs[locale]);
    }
  });

  it('renders what a translator over both renders', async () => {
    for (const locale of LOCALES) {
      const over = translatorOver(locale, await loadCatalog(locale));
      expect(over.locale).toBe(locale);
      for (const key of Object.keys(en) as (keyof typeof en)[]) {
        expect(over(key), `${locale} / ${key}`).toBe(catalogs[locale][key]);
      }
    }
  });

  /**
   * The one behaviour given up with the second catalog, asserted so that it is
   * a decision on the record rather than a surprise.
   *
   * `translate` falls back to English before it falls back to the key. Over a
   * single catalog there is no English to reach, so a key it lacks degrades
   * straight to the key — which the type system does not permit and
   * `catalogs.test.ts` asserts against besides. What must not happen is the
   * word `undefined` appearing in the middle of a board.
   */
  it('degrades a key it has no message for to the key, never to undefined', () => {
    const over = translatorOver('it', {} as Record<MessageKey, string>);
    expect(over('cli.heading.warnings')).toBe('cli.heading.warnings');
  });
});
