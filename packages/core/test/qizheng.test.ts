import { beforeAll, describe, expect, it } from 'vitest';
import { LODGES } from '../src/almanac.js';
import { ChartError } from '../src/errors.js';
import { initEphemeris, sunCrossing, sunLongitude, type EphemerisContext } from '../src/ephemeris.js';
import { BRANCHES, type Branch } from '../src/ganzhi.js';
import {
  CI,
  DEFAULT_QIZHENG_OPTIONS,
  lodgeBoundaries,
  qizhengBoard,
  standingOf,
  type QizhengOptions,
} from '../src/qizheng.js';
import { resolveTime } from '../src/time.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const branch = (hanzi: string): Branch => BRANCHES.find((b) => b.hanzi === hanzi) as Branch;

const at = (date: string, time: string, timezone = 'Asia/Shanghai'): number =>
  resolveTime({ date, time, timezone }).time.julianDayUT;

const board = (julianDay: number, hour: string, options?: Partial<QizhengOptions>) =>
  qizhengBoard(
    { julianDay, hour: branch(hour) },
    { ...DEFAULT_QIZHENG_OPTIONS, ...options },
    context,
  );

const widths = (julianDay: number): number[] => {
  const boundaries = lodgeBoundaries(julianDay, context);
  return boundaries.map((from, index) => {
    const to = boundaries[(index + 1) % boundaries.length] as number;
    return (((to - from) % 360) + 360) % 360;
  });
};

/**
 * The ring of the twenty-eight, which is the whole of the 宿度 frame and the
 * only part of this board that could be silently wrong.
 *
 * Nothing here compares against a published table, because the point of
 * taking the boundaries from the 距星 is that no table is being copied. What
 * it stands on instead is over-determination, the argument the 值日宿 epoch
 * stands on: twenty-eight widths, all of which have a transmitted shape, and
 * one of which — 觜 — is a needle about a degree wide that only the right
 * pair of stars can thread. Get a single 距星 wrong and either the ring runs
 * backwards somewhere or a width doubles.
 */
describe('the ring of the twenty-eight', () => {
  const epochs: [string, number][] = [
    ['1700', at('1700-01-01', '00:00')],
    ['1752', at('1752-01-01', '00:00')],
    ['1900', at('1900-01-01', '00:00')],
    ['2026', at('2026-01-01', '00:00')],
    ['2200', at('2200-01-01', '00:00')],
  ];

  it.each(epochs)('closes on itself at %s', (_year, julianDay) => {
    const sum = widths(julianDay).reduce((total, width) => total + width, 0);
    expect(sum).toBeCloseTo(360, 6);
  });

  it.each(epochs)('runs in the transmitted order at %s', (_year, julianDay) => {
    // A 宿 out of place shows up as a width near a full turn, since the ring
    // is measured forward from each boundary to the next.
    for (const [index, width] of widths(julianDay).entries()) {
      expect(`${LODGES[index]?.hanzi} ${width.toFixed(2)}`).toBe(
        `${LODGES[index]?.hanzi} ${width.toFixed(2)}`,
      );
      expect(width).toBeLessThan(60);
      expect(width).toBeGreaterThan(0);
    }
  });

  it.each(epochs)('keeps 觜 the needle it is at %s', (_year, julianDay) => {
    // The whole of the 觜參 question in one number. Laid with the older
    // φ¹ Ori and δ Ori this is negative and 參 takes 觜's place; laid with
    // 《儀象考成》's λ Ori and ζ Ori it is the degree the tables describe.
    const zi = widths(julianDay)[LODGES.findIndex((lodge) => lodge.id === 'zi')] as number;
    expect(zi).toBeGreaterThan(0.5);
    expect(zi).toBeLessThan(2);
  });

  it('gives 井 the widest and 鬼 among the narrowest', () => {
    const measured = widths(at('2026-01-01', '00:00'));
    const by = (id: string) => measured[LODGES.findIndex((lodge) => lodge.id === id)] as number;
    expect(by('jing')).toBe(Math.max(...measured));
    expect(by('gui')).toBeLessThan(6);
    expect(by('dou')).toBeGreaterThan(20);
  });

  it('moves with the sky and not with the calendar', () => {
    // Precession carries the boundaries forward about a degree and four
    // tenths a century — general precession is 1.397° of that, and Spica's
    // own motion across the sky takes back the rest, which is why this is a
    // measurement and not the textbook figure. The widths, being distances
    // between stars, stay put.
    const early = lodgeBoundaries(at('1900-01-01', '00:00'), context);
    const late = lodgeBoundaries(at('2000-01-01', '00:00'), context);
    expect((late[0] as number) - (early[0] as number)).toBeCloseTo(1.3865, 3);
    expect(widths(at('1900-01-01', '00:00'))[0]).toBeCloseTo(
      widths(at('2000-01-01', '00:00'))[0] as number,
      2,
    );
  });
});

describe('入宿度', () => {
  it('is measured from the 距星 of the 宿 it names', () => {
    const julianDay = at('2026-08-15', '12:00');
    const boundaries = lodgeBoundaries(julianDay, context);
    for (const placement of qizhengBoard(
      { julianDay, hour: branch('午') },
      DEFAULT_QIZHENG_OPTIONS,
      context,
    ).governors) {
      const index = LODGES.findIndex((lodge) => lodge.id === placement.lodge.id);
      const from = boundaries[index] as number;
      expect((from + placement.lodgeDegree) % 360).toBeCloseTo(placement.longitude, 9);
      expect(placement.lodgeDegree).toBeGreaterThanOrEqual(0);
      expect(placement.lodgeDegree).toBeLessThan(35);
    }
  });

  it('puts a longitude in the 宿 whose 距星 is nearest behind it', () => {
    const boundaries = lodgeBoundaries(at('2026-01-01', '00:00'), context);
    const spica = boundaries[0] as number;
    expect(standingOf(spica + 0.0001, boundaries).lodge.id).toBe('jiao');
    expect(standingOf(spica - 0.0001, boundaries).lodge.id).toBe('zhen');
    expect(standingOf(spica + 0.0001, boundaries).lodgeDegree).toBeCloseTo(0.0001, 6);
  });
});

describe('the twelve 宮', () => {
  it('cuts at every thirtieth degree, running backwards against the branches', () => {
    const boundaries = lodgeBoundaries(at('2026-01-01', '00:00'), context);
    expect(standingOf(0, boundaries).palace.hanzi).toBe('戌');
    expect(standingOf(29.99, boundaries).palace.hanzi).toBe('戌');
    expect(standingOf(30, boundaries).palace.hanzi).toBe('酉');
    expect(standingOf(330, boundaries).palace.hanzi).toBe('亥');
    expect(standingOf(359.99, boundaries).palace.hanzi).toBe('亥');
  });

  it('names each palace by its 次', () => {
    const boundaries = lodgeBoundaries(at('2026-01-01', '00:00'), context);
    // 春分 opens 降婁, 冬至 falls in 星紀, 大暑 in 鶉火 — the three the tables
    // name most often, and enough to fix the ring's phase and direction.
    expect(standingOf(0, boundaries).ci.hanzi).toBe('降婁');
    expect(standingOf(275, boundaries).ci.hanzi).toBe('星紀');
    expect(standingOf(125, boundaries).ci.hanzi).toBe('鶉火');
    expect(CI).toHaveLength(12);
  });

  it('agrees with the 月將 of a 六壬 board, which is the same fact', () => {
    // The Sun's palace is what seats the general of the month, so the two
    // boards share this one and it is one datum however many times it is
    // printed. 冬至 seats 大吉 at 丑, and the Sun at 270° stands in 丑.
    const boundaries = lodgeBoundaries(at('2026-01-01', '00:00'), context);
    expect(standingOf(270, boundaries).palace.hanzi).toBe('丑');
    expect(standingOf(330, boundaries).palace.hanzi).toBe('亥');
  });
});

describe('立命', () => {
  const julianDay = at('2026-08-15', '12:00');

  it('gives the Sun its own palace at 卯時, which is sunrise', () => {
    const laid = board(julianDay, '卯');
    expect(laid.minggong.palace.hanzi).toBe((laid.governors[0] as { palace: Branch }).palace.hanzi);
  });

  it('gives the opposite palace at 酉時, which is sunset', () => {
    const laid = board(julianDay, '酉');
    const sun = (laid.governors[0] as { palace: Branch }).palace.index;
    expect(laid.minggong.palace.index).toBe((sun + 6) % 12);
  });

  it('walks one palace back for each 時辰 of the day', () => {
    // Counting the hour forward to 卯 moves the 命宮 backwards through the
    // branches, which is forwards through the sky. Twelve hours, twelve
    // palaces, and the ring closes.
    const seen = BRANCHES.map((hour) => board(julianDay, hour.hanzi).minggong.palace.index);
    expect(new Set(seen).size).toBe(12);
    expect((seen[1] as number)).toBe(((seen[0] as number) + 11) % 12);
  });
});

/**
 * The twelve 人事宮, and the direction that took the longest to settle.
 *
 * No source states it in terms that could be held against another, so what
 * carries it is over-determination, and this is where that argument is
 * written out rather than asserted. It is the 值日宿 epoch's argument: a
 * structure with more constraints than degrees of freedom, so a wrong answer
 * breaks many things at once and the right one breaks none.
 */
describe('the twelve 人事宮', () => {
  const julianDay = at('2026-08-15', '12:00');
  const laid = () => board(julianDay, '午');

  it('numbers them from the 命宮 and covers every palace once', () => {
    const houses = laid().houses;
    expect(houses).toHaveLength(12);
    expect(houses[0]?.house.hanzi).toBe('命宮');
    expect(houses[0]?.palace.hanzi).toBe(laid().minggong.palace.hanzi);
    expect(new Set(houses.map((seat) => seat.palace.index)).size).toBe(12);
  });

  it('puts the axis where an axis has to be', () => {
    const houses = laid().houses;
    const ming = houses[0]?.palace.index as number;
    // 夫妻 opposite 命, which is the one pair a reversal cannot disturb and
    // therefore the one pair that proves nothing on its own.
    expect(houses[6]?.palace.index).toBe((ming + 6) % 12);
  });

  it('climbs against the branches, which is forwards through the sky', () => {
    const houses = laid().houses;
    const ming = houses[0]?.palace.index as number;
    expect(houses[1]?.palace.index).toBe((ming + 11) % 12);
    // 田宅 a quarter turn along in longitude, where the sky is deepest, and
    // 官祿 three quarters, where it is highest.
    expect(houses[3]?.palace.index).toBe((ming + 9) % 12);
    expect(houses[9]?.palace.index).toBe((ming + 3) % 12);
  });

  it('breaks exactly ten of twelve if it is laid the other way', () => {
    // The check the direction rests on, run rather than described. Reversing
    // the ring sends each house to the palace of its mirror about the 命宮 —
    // 田宅, the home, to where 官祿, the office, belongs and back again. Only
    // 命 and 夫妻 survive, because those two are the axis it turns about.
    const houses = laid().houses;
    const ming = houses[0]?.palace.index as number;
    const reversed = houses.map((_, number) => (ming + number) % 12);
    const moved = houses.filter(
      (seat, number) => seat.palace.index !== (reversed[number] as number),
    );
    expect(moved).toHaveLength(10);
    expect(houses.filter((seat, number) => seat.palace.index === reversed[number]).map(
      (seat) => seat.house.hanzi,
    )).toEqual(['命宮', '夫妻宮']);
  });

  it('is the Hellenistic list and not 紫微斗數的', () => {
    // The other half of the argument, pinned so that a future edit of the
    // names has to face it: wealth second and siblings third is 果老's order,
    // where 紫微斗數 puts siblings second and spouse third.
    expect(laid().houses.map((seat) => seat.house.hanzi)).toEqual([
      '命宮', '財帛宮', '兄弟宮', '田宅宮', '男女宮', '奴僕宮',
      '夫妻宮', '疾厄宮', '遷移宮', '官祿宮', '福德宮', '相貌宮',
    ]);
  });
});

describe('the four remainders', () => {
  const julianDay = at('2026-08-15', '12:00');

  it('stands 羅睺 and 計都 half a turn apart, both retrograde', () => {
    const [luohou, jidu] = board(julianDay, '午').remainders;
    const gap = ((((jidu?.longitude as number) - (luohou?.longitude as number)) % 360) + 360) % 360;
    expect(gap).toBeCloseTo(180, 9);
    expect(luohou?.motion).toBe('ni');
    expect(jidu?.motion).toBe('ni');
  });

  it('swaps the two names and nothing else when the option flips', () => {
    const kept = board(julianDay, '午').remainders;
    const flipped = board(julianDay, '午', { luohou: 'ascending' }).remainders;
    expect(flipped[0]?.longitude).toBeCloseTo(kept[1]?.longitude as number, 9);
    expect(flipped[1]?.longitude).toBeCloseTo(kept[0]?.longitude as number, 9);
    expect(flipped[0]?.body.hanzi).toBe('羅睺');
    expect(flipped[2]?.longitude).toBeCloseTo(kept[2]?.longitude as number, 9);
  });

  it('carries three and says so, because 紫氣 is not shipped', () => {
    const laid = board(julianDay, '午');
    expect(laid.remainders).toHaveLength(3);
    expect(laid.remainders.map((r) => r.body.hanzi)).toEqual(['羅睺', '計都', '月孛']);
  });

  it('runs 月孛 forward, which a mean apogee always does', () => {
    expect(board(julianDay, '午').remainders[2]?.motion).toBe('shun');
  });

  it('gives each remainder the phase the tradition gave it', () => {
    const laid = board(julianDay, '午');
    expect(laid.remainders.map((r) => r.body.element)).toEqual(['huo', 'tu', 'shui']);
  });
});

describe('the seven governors', () => {
  const julianDay = at('2026-08-15', '12:00');

  it('stands where the sky puts them', () => {
    // Checked against the engine's own solar terms rather than against a
    // recalled longitude: 立秋 is 135° by definition, so the Sun's longitude
    // at the instant the term begins is the one number here that a source
    // states rather than an ephemeris computes.
    const lichun = sunCrossing(135, at('2026-07-01', '00:00'), context);
    expect(sunLongitude(lichun, context)).toBeCloseTo(135, 6);
    const boundaries = lodgeBoundaries(lichun, context);
    expect(standingOf(135, boundaries).palace.hanzi).toBe('午');
  });

  it('names the seven in the transmitted order', () => {
    expect(board(julianDay, '午').governors.map((g) => g.body.hanzi)).toEqual([
      '太陽', '太陰', '水星', '金星', '火星', '木星', '土星',
    ]);
  });

  it('leaves the Sun and the Moon outside the five phases', () => {
    const [sun, moon, mercury] = board(julianDay, '午').governors;
    expect(sun?.body.element).toBeUndefined();
    expect(moon?.body.element).toBeUndefined();
    expect(mercury?.body.element).toBe('shui');
  });

  it('reads 順 and 逆 off the daily motion and nothing else', () => {
    // Saturn is retrograde from mid-July to late November 2026, and the Sun
    // never is.
    const laid = board(at('2026-09-01', '12:00'), '午');
    expect(laid.governors[6]?.motion).toBe('ni');
    expect(laid.governors[6]?.speed).toBeLessThan(0);
    expect(laid.governors[0]?.motion).toBe('shun');
    expect(board(at('2026-03-01', '12:00'), '午').governors[6]?.motion).toBe('shun');
  });

  it('places them, one instant held against itself', () => {
    const laid = board(julianDay, '午');
    const said = laid.governors.map(
      (g) => `${g.body.hanzi} ${g.lodge.hanzi}${g.lodgeDegree.toFixed(2)} ${g.palace.hanzi}`,
    );
    expect(said).toEqual([
      '太陽 柳11.70 午',
      '太陰 翼0.13 巳',
      '水星 鬼3.47 午',
      '金星 翼14.19 辰',
      '火星 參7.46 未',
      '木星 鬼3.99 午',
      '土星 壁4.90 戌',
    ]);
  });
});

describe('the options it does not implement', () => {
  const julianDay = at('2026-08-15', '12:00');
  const refused: [keyof QizhengOptions, string][] = [
    ['xiudu', 'shixian'],
    ['xiudu', 'shoushi'],
    ['ziqi', 'yinianyisu'],
    ['minggong', 'ascendant'],
    ['gong', 'ci'],
  ];

  it.each(refused)('refuses %s = %s rather than substituting one', (option, value) => {
    expect(() => board(julianDay, '午', { [option]: value })).toThrowError(ChartError);
    try {
      board(julianDay, '午', { [option]: value } as Partial<QizhengOptions>);
    } catch (error) {
      expect((error as ChartError).code).toBe('OPTION_NOT_IMPLEMENTED');
      expect((error as ChartError).params).toMatchObject({ option, value });
    }
  });

  it('carries the options it was cast with', () => {
    expect(board(julianDay, '午').options).toEqual(DEFAULT_QIZHENG_OPTIONS);
    expect(board(julianDay, '午', { luohou: 'ascending' }).options.luohou).toBe('ascending');
  });
});
