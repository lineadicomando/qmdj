import { beforeAll, describe, expect, it } from 'vitest';
import { computeQimenChart, type QimenChart } from '../src/dunjia/index.js';
import { PATTERN_IDS, valenceOf } from '../src/dunjia/patterns.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { resolveMoment } from '../src/pillars.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';

let context: EphemerisContext;
/** Filled by `beforeAll`: the sample cannot be cast before the ephemeris is up. */
let found: Map<string, { above: string; below: string }>;

beforeAll(() => {
  context = initEphemeris();
  found = everyPairingFound();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };
const CLOCK: ChartOptions = { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' };

function cast(date: string, time: string): QimenChart {
  return computeQimenChart(
    resolveMoment({ date, time, timezone: 'Asia/Shanghai' }, BEIJING, CLOCK, context),
    CLOCK,
  );
}

/**
 * A spread wide enough to meet every pairing the table holds. Two years of
 * charts at four hours a day is some three thousand boards, which is far more
 * than enough: each of the eleven pairings needs only one palace, anywhere,
 * on any of them.
 */
function everyPairingFound(): Map<string, { above: string; below: string }> {
  const seen = new Map<string, { above: string; below: string }>();
  for (const year of [2024, 2025]) {
    for (let month = 1; month <= 12; month += 1) {
      for (const day of [3, 11, 19, 27]) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        for (const hour of ['01:00', '07:00', '13:00', '19:00', '23:30']) {
          const chart = cast(date, hour);
          for (const pattern of chart.patterns) {
            if (pattern.palace === undefined) continue;
            const cell = chart.palaces.find((one) => one.palace.number === pattern.palace);
            if (cell) seen.set(pattern.id, { above: cell.heaven.id, below: cell.earth.id });
          }
        }
      }
    }
  }
  return seen;
}

// Some five hundred charts are cast to meet every pairing, which is quick but
// not instant, and the suite has been bitten twice by the five-second default.
describe('十干克應 — the stem above over the stem below', { timeout: 30_000 }, () => {
  /**
   * The couplets of the 煙波釣叟歌, verbatim from the Wikisource text — see
   * `docs/sources.md`. This is the data; `patterns.ts` holds the pairings and
   * the names, and the two have to agree.
   *
   * 甲 never stands on a plate, so the song's 丙加甲 and 甲加丙 are read as
   * 丙 over 戊 and 戊 over 丙, 戊 being the instrument concealing 甲子.
   */
  const VERSE: [string, string, string, string][] = [
    ['六庚加丙白入熒', 'geng', 'bing', 'taibairuying'],
    ['六丙加庚熒入白', 'bing', 'geng', 'yingrutaibai'],
    ['庚加癸兮為大格', 'geng', 'gui', 'dage'],
    ['加己為刑最不宜', 'geng', 'ji', 'xingge'],
    ['六癸加丁蛇夭矯', 'gui', 'ding', 'tengsheyaojiao'],
    ['六丁加癸雀投江', 'ding', 'gui', 'zhuquetoujiang'],
    ['六乙加辛龍逃走', 'yi', 'xin', 'qinglongtaozou'],
    ['六辛加乙虎猖狂', 'xin', 'yi', 'baihuchangkuang'],
    ['丙加甲兮鳥跌穴', 'bing', 'wu', 'feiniaodiexue'],
    ['甲加丙兮龍返首', 'wu', 'bing', 'qinglongfanshou'],
  ];

  for (const [line, above, below, id] of VERSE) {
    it(`${line} — ${id}`, () => {
      const where = found.get(id);
      expect(where, `${id} never occurred in the sample`).toBeDefined();
      expect(where).toEqual({ above, below });
    });
  }

  it('reports 戰格 where 庚 stands over 庚', () => {
    // Not in the couplets above: named alike by two independent sources
    // instead — see `docs/sources.md`. It is here rather than with the verse
    // so that the tier it belongs to is visible in the test file too.
    expect(found.get('zhange')).toEqual({ above: 'geng', below: 'geng' });
  });

  it('gives every pairing of the table a fortune, and every one of them 凶 but two', () => {
    const pairings = PATTERN_IDS.filter((id) => found.has(id));
    // The two the tradition marks 吉 are the two that were already here; the
    // nine added by the cross-check are all 凶.
    const auspicious = pairings.filter((id) => valenceOf(id).id === 'ji');
    expect([...auspicious].sort()).toEqual(['feiniaodiexue', 'qinglongfanshou']);
  });

  it('never reports two names for one palace’s pair of stems', () => {
    // The table is a function of the pair, so a palace cannot fall into two of
    // these at once. A duplicated row would make it, and nothing else would.
    for (const date of ['2024-03-11', '2025-07-19']) {
      for (const hour of ['07:00', '19:00']) {
        const chart = cast(date, hour);
        const byPalace = new Map<number, number>();
        for (const pattern of chart.patterns) {
          if (!PAIR_IDS.includes(pattern.id) || pattern.palace === undefined) continue;
          byPalace.set(pattern.palace, (byPalace.get(pattern.palace) ?? 0) + 1);
        }
        for (const count of byPalace.values()) expect(count).toBe(1);
      }
    }
  });
});

const PAIR_IDS: string[] = [
  'qinglongfanshou', 'feiniaodiexue', 'taibairuying', 'yingrutaibai', 'dage',
  'xingge', 'zhange', 'tengsheyaojiao', 'zhuquetoujiang', 'qinglongtaozou',
  'baihuchangkuang',
];
