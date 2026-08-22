import { describe, expect, it } from 'vitest';
import { nayin } from '../src/bazi/nayin.js';
import { twelveStage } from '../src/bazi/hidden-stems.js';
import { tenGod } from '../src/bazi/relations.js';
import { YUAN_PINYIN, type Yuan } from '../src/dunjia/ju.js';
import { PALACES } from '../src/dunjia/palaces.js';
import { PATTERN_IDS, patternName, valenceOf } from '../src/dunjia/patterns.js';
import { GATES, SPIRITS_YANG, SPIRITS_YIN, STARS } from '../src/dunjia/plates.js';
import { RELATION_IDS, relationOf } from '../src/dunjia/relation.js';
import { strengthOf } from '../src/dunjia/strength.js';
import { BRANCHES, STEMS, ganzhiOf } from '../src/ganzhi.js';
import { PARAMETERS } from '../src/parameters.js';
import { CI, HOUSES, MOTIONS, QIZHENG_BODIES } from '../src/qizheng.js';
import {
  BOSHI_GODS,
  BRIGHTNESSES,
  BUREAUS,
  TRANSFORMS,
  ZIWEI_HOUSES,
  ZIWEI_STARS,
} from '../src/ziwei/index.js';
import { SOLAR_TERMS } from '../src/solar-terms.js';
import {
  TAIYI_GODS,
  TAIYI_PALACES,
  TAIYI_PATTERN_IDS,
  TAIYI_WUFU_PALACES,
  taiyiPatternName,
} from '../src/taiyi.js';
import type { Element } from '../src/types.js';

/**
 * The transliteration is data written by hand, and the reader it exists for
 * is precisely the one who cannot tell when it is wrong.
 *
 * So it is checked structurally rather than by eye. One character of a name is
 * one syllable, and one syllable carries exactly one toned vowel — which makes
 * the count of tone marks a cheap total check on the count of syllables. A
 * dropped syllable, a doubled one, or a reading pasted against the wrong name
 * all fail it. What it cannot catch is a *plausible* wrong reading, and for
 * those `docs/sources.md` names the ones that were decided deliberately.
 */

const TONED = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ';

/** Every phase, for driving the tables that are computed from two of them. */
const ELEMENTS: readonly Element[] = ['mu', 'huo', 'tu', 'jin', 'shui'];

function syllables(pinyin: string): number {
  return [...pinyin].filter((character) => TONED.includes(character)).length;
}

/** Every named thing the engine can produce, gathered once. */
function everything(): { hanzi: string; pinyin: string }[] {
  const named: { hanzi: string; pinyin: string }[] = [
    ...STEMS,
    ...BRANCHES,
    ...SOLAR_TERMS,
    ...PALACES,
    ...STARS,
    ...GATES,
    ...SPIRITS_YANG,
    ...SPIRITS_YIN,
    ...PATTERN_IDS.map(patternName),
    ...PATTERN_IDS.map(valenceOf),
    ...QIZHENG_BODIES,
    ...CI,
    ...HOUSES,
    ...Object.values(MOTIONS),
    ...TAIYI_GODS,
    ...TAIYI_PALACES,
    ...TAIYI_WUFU_PALACES,
    ...TAIYI_PATTERN_IDS.map(taiyiPatternName),
    ...ZIWEI_STARS,
    ...ZIWEI_HOUSES,
    ...BUREAUS,
    ...BRIGHTNESSES,
    ...TRANSFORMS,
    ...BOSHI_GODS,
    // The values a school parameter can take, where the value names
    // something: 拆補 and 置閏, the books a register was copied out of, the
    // boundaries a year is cut at. They are named things the engine hands
    // out like any other, and the surface that prints what is computed
    // prints these — so a reader who cannot read the glyph meets the same
    // pair here as in a palace.
    ...PARAMETERS.flatMap((parameter) =>
      parameter.values.map((value) => value.name).filter((name) => name !== undefined),
    ),
  ];

  for (const yuan of ['shang', 'zhong', 'xia'] as Yuan[]) {
    named.push({ hanzi: `${{ shang: '上', zhong: '中', xia: '下' }[yuan]}元`, pinyin: YUAN_PINYIN[yuan] });
  }

  // The tables that are reached through a computation rather than exported:
  // driven over their whole domain, so none of them is sampled.
  for (let index = 0; index < 60; index += 1) {
    const pair = ganzhiOf(index);
    named.push(pair, nayin(pair));
    for (const stem of STEMS) named.push(twelveStage(stem, pair.branch), tenGod(stem, pair.stem));
  }
  for (const mine of ELEMENTS) {
    for (const ground of ELEMENTS) named.push(relationOf(mine, ground), strengthOf(mine, ground));
  }

  return named;
}

describe('the transliteration', () => {
  it('is on every name the engine can produce', () => {
    for (const entity of everything()) {
      expect(entity.pinyin, `${entity.hanzi} has no reading`).toBeTruthy();
    }
  });

  it('has one toned syllable for each character of the name', () => {
    for (const { hanzi, pinyin } of everything()) {
      expect(syllables(pinyin), `${hanzi} ${pinyin}`).toBe([...hanzi].length);
    }
  });

  it('is written in pinyin and nothing else', () => {
    // Lower case, no spaces, no tone numbers, no `v` standing in for `ü`: a
    // name is one word, and the identifier is the thing that carries digits.
    for (const { hanzi, pinyin } of everything()) {
      expect(pinyin, `${hanzi} ${pinyin}`).toMatch(new RegExp(`^[a-züǖǘǚǜ${TONED}]+$`));
    }
  });

  it('parts the names the identifiers cannot', () => {
    // Both are `wu` once the tone is dropped, and the two gates are the reason
    // `jing1men` and `jing3men` carry a digit at all. The reading tells all
    // three apart without one.
    expect(STEMS[4]?.pinyin).toBe('wù');
    expect(BRANCHES[6]?.pinyin).toBe('wǔ');

    const gate = (id: string) => GATES.find((candidate) => candidate.id === id)?.pinyin;
    expect(gate('jing1men')).toBe('jīngmén');
    expect(gate('jing3men')).toBe('jǐngmén');
  });

  it('reads a pair as its stem and its branch, joined', () => {
    // Not a sixty-row table of its own: neither character is read differently
    // for standing next to the other, so writing them out again could only
    // ever introduce a disagreement.
    for (let index = 0; index < 60; index += 1) {
      const pair = ganzhiOf(index);
      expect(pair.pinyin).toBe(`${pair.stem.pinyin}${pair.branch.pinyin}`);
    }
    expect(ganzhiOf(0).pinyin).toBe('jiǎzǐ');
    expect(ganzhiOf(54).pinyin).toBe('wùwǔ');
  });

  it('reaches every relation and every state of the season', () => {
    // Total rather than sampled: the two tables are keyed by a pair of phases
    // and it would be easy to leave a reading off the case no chart in the
    // suite happens to produce.
    const relations = new Set<string>();
    const strengths = new Set<string>();
    for (const mine of ELEMENTS) {
      for (const ground of ELEMENTS) {
        relations.add(relationOf(mine, ground).id);
        strengths.add(strengthOf(mine, ground).id);
      }
    }
    expect([...relations].sort()).toEqual([...RELATION_IDS].sort());
    expect(strengths.size).toBe(5);

    expect(relationOf('jin', 'mu').pinyin).toBe('wǒkè');
    expect(strengthOf('mu', 'mu').pinyin).toBe('wàng');
  });
});
