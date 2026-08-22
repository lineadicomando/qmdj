import {
  BOSHI_GODS,
  BRANCHES,
  BRIGHTNESSES,
  CI,
  ELEMENT_HANZI,
  GATES,
  GENERALS,
  HOUSES,
  KETI,
  LODGES,
  NIANMING_NAMES,
  OFFICERS,
  PALACES,
  QIZHENG_BODIES,
  SOLAR_TERMS,
  SPIRITS_YANG,
  SPIRITS_YIN,
  STARS,
  STEMS,
  TAIYI_GODS,
  TAIYI_PALACES,
  YUAN_HANZI,
  ZIWEI_HOUSES,
  ZIWEI_STARS,
} from '@shipan/core';
import { describe, expect, it } from 'vitest';
import { ENGINE_NAMES, ENGINE_NAMES_BY_ART } from '../src/lib/glyphs';

/** A registry is a list of named things or a table of them; both carry `hanzi`. */
type Named = { readonly hanzi: string };
const hanzi = (registry: readonly Named[] | Record<string, Named | string>): string[] =>
  (Array.isArray(registry) ? registry : Object.values(registry)).map((one: Named | string) =>
    typeof one === 'string' ? one : one.hanzi,
  );

/**
 * What the engine names, art by art, in the order `glyphs.ts` lists them.
 *
 * The pool is the same claim as `vocabulary.ts` makes about the form's
 * identifiers: a copy in the browser that is not allowed to drift. A board
 * landing with a registry of its own belongs in both places, and the test
 * that says so is this one.
 */
const ENGINE: Record<keyof typeof ENGINE_NAMES_BY_ART, string[]> = {
  ganzhi: [...hanzi(STEMS), ...hanzi(BRANCHES), ...hanzi(ELEMENT_HANZI)],
  jieqi: [...hanzi(SOLAR_TERMS), ...hanzi(YUAN_HANZI)],
  qimen: [
    ...hanzi(PALACES),
    ...hanzi(GATES),
    ...hanzi(STARS),
    ...hanzi(SPIRITS_YANG),
    ...hanzi(SPIRITS_YIN),
  ],
  liuren: [...hanzi(GENERALS), ...hanzi(KETI)],
  ziwei: [...hanzi(ZIWEI_STARS), ...hanzi(ZIWEI_HOUSES), ...hanzi(BOSHI_GODS), ...hanzi(BRIGHTNESSES)],
  taiyi: [...hanzi(TAIYI_GODS), ...hanzi(TAIYI_PALACES)],
  almanac: [...hanzi(LODGES), ...hanzi(OFFICERS)],
  qizheng: [...hanzi(QIZHENG_BODIES), ...hanzi(HOUSES), ...hanzi(CI)],
  nianming: [...hanzi(NIANMING_NAMES)],
};

describe('the rain falls in the engine vocabulary', () => {
  for (const [art, engine] of Object.entries(ENGINE)) {
    it(`${art} names exactly what the engine names`, () => {
      const declared = ENGINE_NAMES_BY_ART[art as keyof typeof ENGINE_NAMES_BY_ART];
      expect([...declared].sort()).toEqual([...new Set(engine)].sort());
    });
  }

  it('carries every name once', () => {
    expect(new Set(ENGINE_NAMES).size).toBe(ENGINE_NAMES.length);
  });

  /*
   * The pool is drawn from at random and indexed into character by character,
   * so an empty string would put a blank cell in a column and a Latin
   * identifier would put a stray letter in a page of hanzi.
   */
  it('is hanzi and nothing else', () => {
    for (const name of ENGINE_NAMES) {
      expect(name.length).toBeGreaterThan(0);
      expect(name).toMatch(/^\p{Script=Han}+$/u);
    }
  });
});
