import { beforeAll, describe, expect, it } from 'vitest';
import { determineJu, type Ju } from '../src/dunjia/ju.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { dayGanzhi } from '../src/ganzhi.js';
import { localDayNumber } from '../src/lunar.js';
import { resolveMoment, type Moment } from '../src/pillars.js';
import { solarTermsBetween } from '../src/solar-terms.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };

/** The settings the reference values below were checked under. */
const ZHIRUN: ChartOptions = {
  ...DEFAULT_OPTIONS,
  method: 'zhirun',
  trueSolarTime: false,
  dayBoundary: 'midnight',
};

function momentAt(date: string, time = '12:00', options: ChartOptions = ZHIRUN): Moment {
  return resolveMoment({ date, time, timezone: 'Asia/Shanghai' }, BEIJING, options, context);
}

function juAt(date: string, time = '12:00', options: ChartOptions = ZHIRUN): Ju {
  return determineJu(momentAt(date, time, options), options);
}

/**
 * How sure this is, in this project's three tiers: the second, and only in
 * part. `kinqimen` (PyPI, 0.0.6.6) is the one runnable reference for 置閏,
 * and these dates were checked against it on 2026-08-08. But its zhirun
 * re-derives the term day by day from the term astronomically in force, so
 * it can express neither a sustained 超神 nor a real 接氣, and it changes
 * the ju in the middle of a five-day stretch — which no account of the
 * method allows. Agreement is therefore total only where the drift phase
 * makes the two readings coincide: 2 447 of 3 652 days over 2018–2027. The
 * dates below are all in that region; where the two disagree, the tests on
 * the block structure say which reading this engine keeps, and why.
 */
const AGREED_WITH_KINQIMEN: Array<[string, boolean, number, Ju['yuan'], string]> = [
  ['2018-01-03', true, 2, 'shang', 'xiaohan'],
  ['2018-06-10', true, 3, 'zhong', 'mangzhong'],
  ['2019-09-10', false, 9, 'shang', 'bailu'],
  ['2024-07-09', false, 5, 'xia', 'xiaoshu'],
  ['2025-10-11', false, 6, 'shang', 'hanlu'],
  ['2027-01-08', true, 8, 'zhong', 'xiaohan'],
];

// These walk a decade of days through the ephemeris and are slow by nature:
// the drift bounds alone take some 2.4 s on their own, and more when the other
// files are running beside them. Against a 5 s default that is not a passing
// test, it is a test waiting for a busier machine — which is exactly how it
// failed once the suite grew two files.
describe('the zhirun method', { timeout: 30_000 }, () => {
  it('matches the runnable reference where the readings coincide', () => {
    for (const [date, yang, number, yuan, term] of AGREED_WITH_KINQIMEN) {
      const ju = juAt(date);
      expect({ date, yang: ju.yang, number: ju.number, yuan: ju.yuan, term: ju.term.id }).toEqual({
        date,
        yang,
        number,
        yuan,
        term,
      });
    }
  });

  it('reads the yuan from the futou, never from the term', () => {
    // Sixty consecutive days — a whole cycle. The stretch a day belongs to
    // is a fact about its day pillar: index 0-4 past a 甲 or 己 day is one
    // yuan, and the three yuan cycle 上中下 with the fifteen-day blocks.
    const start = new Date('2019-03-01T00:00:00Z');
    for (let offset = 0; offset < 60; offset += 1) {
      const date = new Date(start.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
      const moment = momentAt(date);
      const ju = determineJu(moment, ZHIRUN);
      const position = dayGanzhi(localDayNumber(moment.julianDayUT, 'Asia/Shanghai')).index % 15;
      const expected = (['shang', 'zhong', 'xia'] as const)[Math.floor(position / 5)];
      expect(`${date} ${ju.yuan}`).toBe(`${date} ${expected}`);
    }
  });

  it('serves whole blocks to one term', () => {
    // Under chaibu a stretch can change ju in the middle, when the yuan
    // turns inside a double hour; under zhirun it cannot — the whole
    // fifteen-day block takes one term, and the ju moves only with the
    // futou. A year of days, grouped by block, must show one term, one
    // leap flag and the yuan in transmitted order per block.
    const blocks = new Map<number, Array<{ ju: Ju; day: number }>>();
    const start = new Date('2018-01-01T00:00:00Z');
    for (let offset = 0; offset < 365; offset += 1) {
      const date = new Date(start.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
      const moment = momentAt(date);
      const day = localDayNumber(moment.julianDayUT, 'Asia/Shanghai');
      const head = day - (dayGanzhi(day).index % 15);
      blocks.set(head, [...(blocks.get(head) ?? []), { ju: determineJu(moment, ZHIRUN), day }]);
    }

    for (const [head, entries] of blocks) {
      const terms = new Set(entries.map((e) => e.ju.term.id));
      const leaps = new Set(entries.map((e) => e.ju.leap));
      expect(terms.size).toBe(1);
      expect(leaps.size).toBe(1);
      for (const { ju, day } of entries) {
        expect(ju.yuan).toBe((['shang', 'zhong', 'xia'] as const)[Math.floor((day - head) / 5)]);
      }
    }
  });

  it('keeps the drift inside the bounds the intercalation implies', () => {
    // The pin holds the drift to eight days of 超神 and six of 接氣 *at the
    // solstices*; in between it keeps moving, because the terms are not
    // fifteen days long. 超神 crests at ten or eleven just before an
    // intercalation — which is the classical trigger, "nine or ten days and
    // the leap must be set" — and 接氣 deepens by a day through the short
    // winter terms. Measured daily over 2018–2027 the drift spans −7 to 11;
    // what a bound past twelve would mean is a missed intercalation, the
    // block a whole term away from where the Sun is.
    const terms = solarTermsBetween(2458000, 2462000, context); // 2017-09 … 2028-08
    const start = new Date('2018-01-01T00:00:00Z');
    for (let offset = 0; offset < 3652; offset += 3) {
      const date = new Date(start.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
      const moment = momentAt(date);
      const ju = determineJu(moment, ZHIRUN);
      const day = localDayNumber(moment.julianDayUT, 'Asia/Shanghai');
      const head = day - (dayGanzhi(day).index % 15);
      const occurrence = terms
        .filter((t) => t.term.id === ju.term.id)
        .map((t) => localDayNumber(t.julianDayUT, 'Asia/Shanghai'))
        .reduce((a, b) => (Math.abs(b - head) < Math.abs(a - head) ? b : a));
      const drift = occurrence - head;
      expect(drift).toBeGreaterThanOrEqual(-8);
      expect(drift).toBeLessThanOrEqual(12);
    }
  });

  it('intercalates a repeated Daxue where the blocks demand it', () => {
    // The pin can be checked by hand for 2018. The winter solstice fell on
    // 22 December, a 戊子 day, cycle index 24: nine past the 己卯 of
    // 13 December, so outside the eight the 超神 allows, and the solstice
    // takes the 甲午 of 28 December instead — 195 days after the summer
    // pin, thirteen blocks, one more than the twelve terms between the
    // solstices. The thirteenth repeats 大雪: that is the 閏.
    expect(juAt('2018-12-12')).toMatchObject({ yang: false, number: 1, yuan: 'xia', term: { id: 'daxue' }, leap: false });
    expect(juAt('2018-12-13')).toMatchObject({ yang: false, number: 4, yuan: 'shang', term: { id: 'daxue' }, leap: true });
    expect(juAt('2018-12-27')).toMatchObject({ yang: false, number: 1, yuan: 'xia', term: { id: 'daxue' }, leap: true });
    expect(juAt('2018-12-28')).toMatchObject({ yang: true, number: 1, yuan: 'shang', term: { id: 'dongzhi' }, leap: false });
  });

  it('intercalates every few years, and only against a solstice', () => {
    // One leap roughly every three years is what five and a quarter days of
    // annual drift against a fifteen-day block produces. Over 2018–2027 the
    // bookkeeping places four, all repeating 大雪 — none of the ten years
    // happened to demand a 閏芒種, which is the rarer of the two.
    const onsets: string[] = [];
    let inLeap = false;
    const start = new Date('2018-01-01T00:00:00Z');
    for (let offset = 0; offset < 3652; offset += 5) {
      const date = new Date(start.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
      const ju = juAt(date);
      if (ju.leap && !inLeap) onsets.push(`${ju.term.id} near ${date}`);
      inLeap = ju.leap;
      if (ju.leap) expect(['mangzhong', 'daxue']).toContain(ju.term.id);
    }
    expect(onsets).toHaveLength(4);
    expect(onsets.every((o) => o.startsWith('daxue'))).toBe(true);
  });

  it('disagrees with chaibu about the term itself, not only the yuan', () => {
    // 2 September 2026, the date the two readings of 拆補 were told apart
    // by. Chaibu reads the term in force — 處暑, ten days in, lower yuan.
    // Zhirun reads the day: 己卯 opens a block, and that block already
    // serves 白露, five days before the Sun gets there (超神).
    const chaibu: ChartOptions = { ...ZHIRUN, method: 'chaibu' };
    expect(juAt('2026-09-02', '11:00', chaibu)).toMatchObject({
      yang: false, number: 7, yuan: 'xia', term: { id: 'chushu' }, leap: false,
    });
    expect(juAt('2026-09-02', '11:00')).toMatchObject({
      yang: false, number: 9, yuan: 'shang', term: { id: 'bailu' }, leap: false,
    });
  });

  it('follows the day pillar across the late hour of the Rat', () => {
    // The futou is a fact about the day pillar, so where `dayBoundary`
    // moves the pillar at 23:00, the block moves with it. On the eve of the
    // 2018 intercalation the same instant stands on either side.
    const zishi: ChartOptions = { ...ZHIRUN, dayBoundary: 'zishi' };
    expect(juAt('2018-12-12', '23:30')).toMatchObject({ term: { id: 'daxue' }, leap: false, yuan: 'xia' });
    expect(juAt('2018-12-12', '23:30', zishi)).toMatchObject({ term: { id: 'daxue' }, leap: true, yuan: 'shang' });
  });

  it('names the term under chaibu too, and never a leap', () => {
    const chaibu: ChartOptions = { ...ZHIRUN, method: 'chaibu' };
    const moment = momentAt('2024-06-15', '14:00', chaibu);
    const ju = determineJu(moment, chaibu);
    expect(ju.term.id).toBe(moment.solarTerm.term.id);
    expect(ju.leap).toBe(false);
  });
});
