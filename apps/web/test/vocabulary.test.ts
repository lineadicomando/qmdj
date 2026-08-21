import {
  GATES,
  PALACES as ENGINE_PALACES,
  PATTERN_IDS,
  PURPOSES as ENGINE_PURPOSES,
  SPIRITS_YANG,
  SPIRITS_YIN,
  SPIRIT_IDS as ENGINE_SPIRIT_IDS,
  STARS,
  strengthOf,
} from '@shipan/core';
import { STRENGTH_MARKS } from '@shipan/plate';
import { describe, expect, it } from 'vitest';
import type { ChartOptions } from '@shipan/core';
import {
  DIRECTIONS,
  GATE_IDS,
  METHODS,
  PALACES,
  PALACE_OF,
  PATTERN_IDS as FORM_PATTERN_IDS,
  PURPOSES,
  SPIRIT_IDS,
  STAR_IDS,
  STRENGTHS,
  STRENGTH_KEY,
} from '../src/lib/vocabulary';

/**
 * `$lib/vocabulary` redeclares what the engine already knows, because the
 * client imports only types from `core` and these are values. This is the
 * test that keeps the copy honest — the same bargain `@shipan/plate`
 * makes with its own redeclared types.
 *
 * A form offering a gate the engine has never heard of comes back with an
 * error; a form missing one makes it silently unaskable, which is worse.
 */
describe('the identifiers a form offers', () => {
  const ids = (entries: readonly { id: string }[]): string[] => entries.map((entry) => entry.id);

  it('are the gates the engine knows, in its order', () => {
    expect([...GATE_IDS]).toEqual(ids(GATES));
  });

  it('are the stars the engine knows', () => {
    expect([...STAR_IDS]).toEqual(ids(STARS));
  });

  it('are every spirit the engine can show, which is ten and not eight', () => {
    expect([...SPIRIT_IDS]).toEqual([...ENGINE_SPIRIT_IDS]);

    // Because a chart shows eight of them and which eight depends on the dun.
    // Offering one plate's worth would make baihu unaskable for half the year.
    expect(SPIRIT_IDS).toHaveLength(10);
    for (const spirit of [...SPIRITS_YANG, ...SPIRITS_YIN]) {
      expect(SPIRIT_IDS).toContain(spirit.id);
    }
  });

  it('are the configurations the engine can report', () => {
    expect([...FORM_PATTERN_IDS]).toEqual([...PATTERN_IDS]);
  });

  it('pair each purpose with the gate the engine gives it', () => {
    // The form fills the gate field from the purpose, so it needs the pair
    // and not just the name. A pair that drifted would quietly scan for the
    // wrong gate — an answer, and the wrong one.
    expect(PURPOSES.map((purpose) => ({ ...purpose }))).toEqual(
      ENGINE_PURPOSES.map((purpose) => ({ ...purpose })),
    );
  });

  it('leave the centre out, which faces nowhere and can never answer', () => {
    expect(DIRECTIONS).toHaveLength(8);
    expect(DIRECTIONS).not.toContain('centre');
  });

  it('are the palaces the engine knows, number, name and glyph alike', () => {
    // The glyph is here because an hour set aside carries its palace in the
    // address and is named from this list alone, with no answer to read it
    // out of. A 巽 drifting onto the wrong number would be a direction
    // quietly renamed under somebody's shortlist.
    expect(
      PALACES.map(({ number, id, hanzi, pinyin, direction }) => ({
        number,
        id,
        hanzi,
        pinyin,
        direction,
      })),
    ).toEqual(
      ENGINE_PALACES.map(({ number, id, hanzi, pinyin, direction }) => ({
        number,
        id,
        hanzi,
        pinyin,
        direction,
      })),
    );
  });

  it('name the palace each direction faces', () => {
    expect(Object.keys(PALACE_OF).sort()).toEqual([...DIRECTIONS].sort());
    expect(PALACE_OF.se).toBe('xun');
    // The centre is a palace and not a direction: it can be kept, never faced.
    expect(Object.values(PALACE_OF)).not.toContain('zhong');
  });

  it('key the five states as the engine names them and the drawing marks them', () => {
    // The five come out of one season: what rules it prospers, what it
    // generates is supported, what generates it rests, what controls it is
    // imprisoned, and what it controls dies. Wood as the season gives all
    // five in one line each, which is a shorter way to get them than a table
    // this test would then be asserting against itself.
    const engine = {
      wang: strengthOf('mu', 'mu'),
      xiang: strengthOf('huo', 'mu'),
      xiu: strengthOf('shui', 'mu'),
      qiu: strengthOf('jin', 'mu'),
      si: strengthOf('tu', 'mu'),
    };

    // The ramp's order, 旺相休囚死, which is what the marks are read for.
    expect(STRENGTH_KEY.map((state) => state.id)).toEqual([...STRENGTHS]);

    for (const state of STRENGTH_KEY) {
      const named = engine[state.id];
      expect(named.id, state.id).toBe(state.id);
      // The name and its reading: a legend that printed 相 as xiāng would be
      // saying "each other" where the engine says "supported".
      expect({ hanzi: named.hanzi, pinyin: named.pinyin }, state.id).toEqual({
        hanzi: state.hanzi,
        pinyin: state.pinyin,
      });
      // And the shape the board actually draws for it. A ramp changed in the
      // drawing and not here would leave a legend explaining marks that are
      // no longer on the picture above it.
      expect(STRENGTH_MARKS[state.id], state.id).toBe(state.mark);
    }
  });

  it('offer only the methods the engine implements', () => {
    // The subset relation is checked by the compiler: a method the type has
    // never heard of would not assign. What the runtime check adds is the
    // exclusion — maoshan is in the type and deliberately not offered,
    // because the engine refuses it and an option that can only come back
    // as an error is not a choice. The API still accepts it and answers 501.
    const offered: ChartOptions['method'][] = [...METHODS];
    expect(offered).toEqual(['chaibu', 'zhirun']);
    expect(offered).not.toContain('maoshan');
  });
});
