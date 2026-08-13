import { beforeAll, describe, expect, it } from 'vitest';
import { ChartError } from '../src/errors.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import {
  MAX_TERMS,
  SOLAR_TERMS,
  jieAt,
  solarTermAt,
  solarTermsBetween,
  solarTermsOfYear,
} from '../src/solar-terms.js';
import { fromJulianDay, resolveTime } from '../src/time.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING = 'Asia/Shanghai';

function beijingTime(julianDayUT: number): string {
  return fromJulianDay(julianDayUT, BEIJING).toFormat('yyyy-MM-dd HH:mm');
}

function at(date: string, time: string, timezone = BEIJING): number {
  return resolveTime({ date, time, timezone }).time.julianDayUT;
}

describe('the list of terms', () => {
  it('has twenty-four, fifteen degrees apart', () => {
    expect(SOLAR_TERMS).toHaveLength(24);

    for (let i = 0; i < SOLAR_TERMS.length; i += 1) {
      const expected = (315 + i * 15) % 360;
      expect(SOLAR_TERMS[i]?.longitude).toBe(expected);
    }
  });

  it('alternates jie and qi', () => {
    // The month pillar reads only the jie; the lunar calendar counts only the
    // qi. Getting the alternation wrong breaks both at once.
    for (const term of SOLAR_TERMS) {
      expect(term.kind).toBe(term.longitude % 30 === 15 ? 'jie' : 'qi');
    }
  });

  it('gives a month branch to every jie and to no qi', () => {
    const jie = SOLAR_TERMS.filter((term) => term.kind === 'jie');

    expect(jie).toHaveLength(12);
    expect(jie.every((term) => typeof term.monthBranch === 'number')).toBe(true);
    expect(SOLAR_TERMS.filter((term) => term.kind === 'qi').every((t) => t.monthBranch === undefined)).toBe(true);
  });

  it('opens the year with the month of the Tiger', () => {
    // Lichun is where the year of the pillars begins, and the first month is
    // 寅 rather than 子 — which is why the list starts at 315° and not at 0°.
    expect(SOLAR_TERMS[0]?.id).toBe('lichun');
    expect(SOLAR_TERMS[0]?.monthBranch).toBe(2);
  });
});

describe('solarTermsOfYear', () => {
  it('finds twenty-four terms in a year', () => {
    expect(solarTermsOfYear(2024, BEIJING, context)).toHaveLength(24);
    expect(solarTermsOfYear(1970, BEIJING, context)).toHaveLength(24);
  });

  it('matches published instants to the minute', () => {
    const terms = solarTermsOfYear(2024, BEIJING, context);
    const find = (id: string) => terms.find((term) => term.term.id === id);

    expect(beijingTime(find('lichun')!.julianDayUT)).toBe('2024-02-04 16:27');
    expect(beijingTime(find('chunfen')!.julianDayUT)).toBe('2024-03-20 11:06');
    expect(beijingTime(find('xiazhi')!.julianDayUT)).toBe('2024-06-21 04:50');
    expect(beijingTime(find('dongzhi')!.julianDayUT)).toBe('2024-12-21 17:20');
  });

  it('dates the same instant differently from another zone', () => {
    // Not a formality. The 2024 summer solstice fell at 04:50 in Beijing on
    // 21 June, which was still the evening of the 20th in Rome — so an
    // almanac printed in each city gives the term a different date.
    const solstice = solarTermsOfYear(2024, BEIJING, context).find((t) => t.term.id === 'xiazhi');

    expect(beijingTime(solstice!.julianDayUT)).toBe('2024-06-21 04:50');
    expect(fromJulianDay(solstice!.julianDayUT, 'Europe/Rome').toFormat('yyyy-MM-dd HH:mm')).toBe(
      '2024-06-20 22:50',
    );
  });

  it('returns them in order', () => {
    const terms = solarTermsOfYear(2024, BEIJING, context);

    for (let i = 1; i < terms.length; i += 1) {
      expect(terms[i]!.julianDayUT).toBeGreaterThan(terms[i - 1]!.julianDayUT);
    }
  });
});

describe('solarTermAt', () => {
  it('reports the term already begun, not the nearest one', () => {
    // Three days before Lichun the year has not turned: the term in force is
    // still Dahan, from a fortnight earlier.
    const term = solarTermAt(at('2024-02-01', '12:00'), context);

    expect(term.term.id).toBe('dahan');
    expect(beijingTime(term.julianDayUT)).toBe('2024-01-20 22:07');
  });

  it('switches exactly at the crossing', () => {
    expect(solarTermAt(at('2024-02-04', '16:26'), context).term.id).toBe('dahan');
    expect(solarTermAt(at('2024-02-04', '16:28'), context).term.id).toBe('lichun');
  });
});

describe('solarTermsBetween', () => {
  it('refuses an interval too wide to answer, rather than cutting the list', () => {
    // A list stopped at four hundred reads exactly like an interval that held
    // four hundred, and nothing downstream could tell the two apart.
    expect(() => solarTermsBetween(at('2000-01-01', '00:00'), at('2100-01-01', '00:00'), context))
      .toThrow(ChartError);
    expect(() => solarTermsBetween(at('2000-01-01', '00:00'), at('2100-01-01', '00:00'), context))
      .toThrow(expect.objectContaining({ code: 'INTERVAL_TOO_LONG' }));
  });

  it('answers the widest interval it does admit', () => {
    const terms = solarTermsBetween(at('2000-01-01', '00:00'), at('2016-01-01', '00:00'), context);

    expect(terms.length).toBeGreaterThan(380);
    expect(terms.length).toBeLessThanOrEqual(MAX_TERMS);
  });
});

describe('jieAt', () => {
  it('skips over a qi to the jie that opened the month', () => {
    // On 1 March the term in force is Yushui, a qi. The month began at
    // Lichun, a fortnight before it.
    const jie = jieAt(at('2024-03-01', '12:00'), context);

    expect(jie.term.id).toBe('lichun');
    expect(jie.term.monthBranch).toBe(2);
  });

  it('returns the term itself when that term is a jie', () => {
    const jie = jieAt(at('2024-03-10', '12:00'), context);

    expect(jie.term.id).toBe('jingzhe');
    expect(jie.term.monthBranch).toBe(3);
  });

  it('always lands on a jie', () => {
    for (let day = 1; day <= 28; day += 1) {
      const date = `2024-02-${String(day).padStart(2, '0')}`;
      expect(jieAt(at(date, '09:00'), context).term.kind).toBe('jie');
    }
  });
});
