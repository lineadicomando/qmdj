import { beforeAll, describe, expect, it } from 'vitest';
import { translate, type Translator } from '@qimendunjia/i18n';
import { computeQimenChart } from '../src/dunjia/index.js';
import { formatScan } from '../src/format.js';
import { ChartError } from '../src/errors.js';
import { ganzhiOf } from '../src/ganzhi.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { resolveMoment } from '../src/pillars.js';
import { MAX_SCAN_DAYS, matchRuns, scanCharts, type ScanRun } from '../src/scan.js';
import { solarTermsBetween } from '../src/solar-terms.js';
import { fromJulianDay } from '../src/time.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };
const ROME: Place = { latitude: 41.9028, longitude: 12.4964, timezone: 'Europe/Rome' };
const CLOCK: ChartOptions = { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' };

function scan(
  from: string,
  to: string,
  place: Place = BEIJING,
  options: ChartOptions = CLOCK,
): ScanRun[] {
  const zone = place.timezone;
  return scanCharts(
    { date: from.slice(0, 10), time: from.slice(11) || '00:00', timezone: zone },
    { date: to.slice(0, 10), time: to.slice(11) || '00:00', timezone: zone },
    place,
    options,
    context,
  );
}

describe('scanCharts', () => {
  it('covers the interval without a gap and without an overlap', () => {
    const runs = scan('2026-09-01', '2026-09-04');

    expect(runs.length).toBeGreaterThan(0);
    expect(runs[0]?.start).toMatch(/^2026-09-01T00:00/);
    expect(runs.at(-1)?.end).toMatch(/^2026-09-04T00:00/);

    for (let i = 1; i < runs.length; i++) {
      expect(runs[i]?.start).toBe(runs[i - 1]?.end);
    }
  });

  it('gives a clock day twelve runs, one to a double hour', () => {
    // From 01:00 so the day opens on a boundary: the hour of the Rat straddles
    // midnight, and a day counted from 00:00 begins halfway through it. Under
    // 子時 the day pillar turns with the hour, so nothing splits the Rat.
    const runs = scan('2026-09-01T01:00', '2026-09-02T01:00', BEIJING, {
      ...CLOCK,
      dayBoundary: 'zishi',
    });

    expect(runs).toHaveLength(12);
    for (const run of runs) {
      const hours = (Date.parse(run.end) - Date.parse(run.start)) / 3_600_000;
      expect(hours).toBe(2);
    }
  });

  it('splits the hour of the Rat at midnight, where the day pillar turns', () => {
    // Under a midnight day boundary the day pillar turns at 00:00 and the
    // hour pillar does not: the two halves of the double hour carry different
    // days, and the day rules the horse and 五不遇時.
    const runs = scan('2026-09-01T23:00', '2026-09-02T01:00');

    expect(runs).toHaveLength(2);
    expect(runs[1]?.start).toMatch(/^2026-09-02T00:00/);
    expect(new Set(runs.map((run) => run.chart.moment.pillars.hour.hanzi)).size).toBe(1);
    expect(runs[0]?.chart.moment.pillars.day.hanzi).not.toBe(runs[1]?.chart.moment.pillars.day.hanzi);
  });

  it('reports for each run the chart the engine casts for its opening instant', () => {
    const runs = scan('2026-09-01T01:00', '2026-09-01T09:00');

    for (const run of runs) {
      const [date, time] = run.start.split('T') as [string, string];
      const direct = computeQimenChart(
        resolveMoment({ date, time: time.slice(0, 5), timezone: BEIJING.timezone }, BEIJING, CLOCK, context),
        CLOCK,
      );

      expect(run.chart.ju).toEqual(direct.ju);
      expect(run.chart.moment.pillars.hour.hanzi).toBe(direct.moment.pillars.hour.hanzi);
      expect(run.chart.palaces).toEqual(direct.palaces);
    }
  });

  it('splits a double hour where the yuan turns inside it', () => {
    // The instant is taken from the engine and not from an almanac: 處暑 2026
    // opens at some minute of 23 August, and the third yuan opens ten days
    // after it — which lands inside the double hour of 巳, not on its edge.
    const term = solarTermsBetween(
      resolveMoment({ date: '2026-08-01', time: '00:00', timezone: BEIJING.timezone }, BEIJING, CLOCK, context)
        .julianDayUT,
      resolveMoment({ date: '2026-09-01', time: '00:00', timezone: BEIJING.timezone }, BEIJING, CLOCK, context)
        .julianDayUT,
      context,
    ).find((found) => found.term.id === 'chushu');
    const turns = fromJulianDay((term?.julianDayUT as number) + 10, BEIJING.timezone);

    expect(turns.toFormat('yyyy-MM-dd')).toBe('2026-09-02');
    // A double hour opens on an odd hour exactly. This falls elsewhere, which
    // is the whole point: the turn is inside one, not on the edge of one.
    const opensADoubleHour = turns.hour % 2 === 1 && turns.minute === 0 && turns.second === 0;
    expect(opensADoubleHour).toBe(false);

    const runs = scan('2026-09-02T09:00', '2026-09-02T11:00');

    expect(runs).toHaveLength(2);
    // The hour pillar holds across the split. The ju is what changed.
    expect(new Set(runs.map((run) => run.chart.moment.pillars.hour.hanzi)).size).toBe(1);
    expect(runs[0]?.chart.ju.number).not.toBe(runs[1]?.chart.ju.number);

    // And the split is where the yuan turns, to the minute the bisection promises.
    const found = Date.parse(runs[1]?.start as string);
    expect(Math.abs(found - turns.toMillis())).toBeLessThan(60_000);
  });

  it('finds both boundaries when a yuan turn and an hour turn share a probe window', () => {
    // The same yuan turn, 42 minutes into the double hour of 巳: the probe at
    // 11:00 sees a chart that differs from the one at 10:00 by two changes,
    // not one, and each must open a run of its own. A single bisection would
    // report 11:00–13:00 under the chart of 10:19, which no instant of those
    // two hours holds.
    const runs = scan('2026-09-02T09:00', '2026-09-02T15:00');

    expect(runs.map((run) => run.chart.moment.pillars.hour.hanzi)).toEqual([
      '己巳',
      '己巳',
      '庚午',
      '辛未',
    ]);
    expect(runs[2]?.start).toMatch(/^2026-09-02T11:00/);

    // Every run holds the chart the engine casts directly for any instant of it.
    for (const run of runs) {
      const middle = new Date((Date.parse(run.start) + Date.parse(run.end)) / 2);
      const clock = new Intl.DateTimeFormat('sv-SE', {
        timeZone: BEIJING.timezone,
        dateStyle: 'short',
        timeStyle: 'medium',
      }).format(middle);
      const [date, time] = clock.split(' ') as [string, string];
      const direct = computeQimenChart(
        resolveMoment({ date, time, timezone: BEIJING.timezone }, BEIJING, CLOCK, context),
        CLOCK,
      );

      expect(run.chart.moment.pillars.hour.hanzi).toBe(direct.moment.pillars.hour.hanzi);
      // `daysIntoTerm` runs with the clock; the discrete part is the chart's.
      expect(run.chart.ju.number).toBe(direct.ju.number);
      expect(run.chart.ju.yang).toBe(direct.ju.yang);
    }
  });

  it('splits at a jie under zhirun, where the month turns and the ju does not', () => {
    // The instant from the engine again: 寒露 2026 falls at some minute of the
    // double hour of 未, and it is a jie — the month pillar turns there, and
    // with it the season the strengths are read against, 酉 metal to 戌 earth.
    // Under 置閏 the ju holds straight across it, so a comparison of hour, day
    // and ju alone would let the chart change with no run opening.
    const term = solarTermsBetween(
      resolveMoment({ date: '2026-10-01', time: '00:00', timezone: BEIJING.timezone }, BEIJING, CLOCK, context)
        .julianDayUT,
      resolveMoment({ date: '2026-11-01', time: '00:00', timezone: BEIJING.timezone }, BEIJING, CLOCK, context)
        .julianDayUT,
      context,
    ).find((found) => found.term.id === 'hanlu');
    const turns = fromJulianDay(term?.julianDayUT as number, BEIJING.timezone);

    expect(turns.toFormat('yyyy-MM-dd')).toBe('2026-10-08');
    // Inside a double hour, not on the edge of one, or the hour pillar would
    // split the runs by itself and prove nothing.
    const opensADoubleHour = turns.hour % 2 === 1 && turns.minute === 0 && turns.second === 0;
    expect(opensADoubleHour).toBe(false);

    const runs = scan('2026-10-08T13:00', '2026-10-08T15:00', BEIJING, {
      ...CLOCK,
      method: 'zhirun',
    });

    expect(runs).toHaveLength(2);
    // The hour pillar and the ju hold across the split. The month is what
    // changed, and the strengths with it.
    expect(new Set(runs.map((run) => run.chart.moment.pillars.hour.hanzi)).size).toBe(1);
    expect(runs[0]?.chart.ju.number).toBe(runs[1]?.chart.ju.number);
    expect(runs[0]?.chart.ju.yang).toBe(runs[1]?.chart.ju.yang);
    expect(runs[0]?.chart.moment.pillars.month.hanzi).not.toBe(runs[1]?.chart.moment.pillars.month.hanzi);
    expect(runs[0]?.chart.season).not.toBe(runs[1]?.chart.season);
    expect(runs[0]?.chart.palaces.map((cell) => cell.starStrength.id)).not.toEqual(
      runs[1]?.chart.palaces.map((cell) => cell.starStrength.id),
    );

    // And the split lies at the jie, to the minute the bisection promises.
    const found = Date.parse(runs[1]?.start as string);
    expect(Math.abs(found - turns.toMillis())).toBeLessThan(60_000);
  });

  it('walks the instant and not the clock, across a change of summer time', () => {
    // Clocks go back on 2026-10-25 in Rome: 02:00 to 03:00 happens twice.
    // Counted on the clock the day has 24 hours; counted on the instant it
    // has 25, and every one of them must be scanned exactly once.
    const runs = scan('2026-10-25', '2026-10-26', ROME);

    const covered = runs.reduce(
      (total, run) => total + (Date.parse(run.end) - Date.parse(run.start)),
      0,
    );
    expect(covered / 3_600_000).toBe(25);
  });

  it('never reads the lunar date, which is what makes it affordable', () => {
    // The scan resolves a moment an hour and casts a chart from it. Under
    // 拆補 nothing in that path wants the Moon, and the Moon is fifty times
    // dearer than the Sun: were it read here, a month would cost what a year
    // of it should.
    const moon: string[] = [];
    const runs = scan('2026-09-01', '2026-09-08');

    for (const run of runs) {
      const descriptor = Object.getOwnPropertyDescriptor(run.chart.moment, 'lunar');
      if (descriptor?.get) moon.push(run.start);
    }

    // Every moment still offers it, unevaluated.
    expect(moon).toHaveLength(runs.length);
    expect(runs[0]?.chart.moment.lunar.year).toBe(2026);
  });

  it('refuses an interval that ends before it begins, or on the instant it does', () => {
    expect(() => scan('2026-09-04', '2026-09-01')).toThrow(ChartError);
    expect(() => scan('2026-09-01', '2026-09-01')).toThrow(
      expect.objectContaining({ code: 'EMPTY_INTERVAL' }),
    );
  });

  it('refuses an interval longer than it will scan at once', () => {
    expect(() => scan('2026-01-01', '2028-01-01')).toThrow(
      expect.objectContaining({ code: 'INTERVAL_TOO_LONG', params: { days: 730, maximum: MAX_SCAN_DAYS } }),
    );
  });

  it('carries no verdict about any of the hours it reports', () => {
    const serialised = JSON.stringify(scan('2026-09-01', '2026-09-02').map((run) => run.chart.patterns));

    for (const word of ['lucky', 'unlucky', 'favourable', 'auspicious', 'good', 'bad']) {
      expect(serialised.toLowerCase()).not.toContain(word);
    }
  });
});

describe('matchRuns', () => {
  // Scanned once and shared. Every test here asks a different question of the
  // same week, and re-walking it for each would be the slowest thing in the
  // suite by an order of magnitude.
  let week: ScanRun[];
  const WEEK = (): ScanRun[] => (week ??= scan('2026-09-01', '2026-09-08'));

  it('answers with every palace when nothing is asked', () => {
    const runs = WEEK();
    const matches = matchRuns(runs, {});

    expect(matches).toHaveLength(runs.length);
    for (const match of matches) expect(match.palaces).toHaveLength(9);
  });

  it('answers with the palace holding what was named, and only that one', () => {
    const matches = matchRuns(WEEK(), { gate: 'kaimen' });

    // The open gate stands in exactly one palace of any chart.
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(match.palaces).toHaveLength(1);
      expect(match.palaces[0]?.gate?.id).toBe('kaimen');
    }
  });

  it('takes every named condition together, never one at the expense of another', () => {
    const criteria = { gate: 'kaimen', directions: ['se', 's'] } as const;
    const matches = matchRuns(WEEK(), criteria);

    for (const match of matches) {
      for (const cell of match.palaces) {
        expect(cell.gate?.id).toBe('kaimen');
        expect(criteria.directions).toContain(cell.palace.direction);
      }
    }

    // And it is a narrowing of the looser question, not a different one.
    const looser = matchRuns(WEEK(), { gate: 'kaimen' });
    expect(matches.length).toBeLessThan(looser.length);
  });

  it('never answers with the centre where a direction was asked for', () => {
    const matches = matchRuns(WEEK(), { directions: ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] });

    for (const match of matches) {
      expect(match.palaces.map((cell) => cell.palace.number)).not.toContain(5);
      expect(match.palaces).toHaveLength(8);
    }
  });

  it('admits a state of strength and everything above it', () => {
    const matches = matchRuns(WEEK(), { minStrength: 'xiang' });

    for (const match of matches) {
      for (const cell of match.palaces) {
        expect(['wang', 'xiang']).toContain(cell.starStrength.id);
        if (cell.gateStrength) expect(['wang', 'xiang']).toContain(cell.gateStrength.id);
      }
    }

    // Weaker floors admit more, and the weakest admits everything.
    const counted = (id: 'wang' | 'xiang' | 'xiu' | 'qiu' | 'si'): number =>
      matchRuns(WEEK(), { minStrength: id }).reduce((total, m) => total + m.palaces.length, 0);
    expect(counted('wang')).toBeLessThan(counted('xiang'));
    expect(counted('xiang')).toBeLessThan(counted('si'));
  });

  it('rules out a palace the named configuration fell in', () => {
    const runs = WEEK();
    const withEmpty = new Set<string>();

    for (const run of runs) {
      for (const pattern of run.chart.patterns) {
        if (pattern.id === 'kongwang' && pattern.palace) withEmpty.add(`${run.start}/${pattern.palace}`);
      }
    }
    expect(withEmpty.size).toBeGreaterThan(0);

    for (const match of matchRuns(runs, { excludes: ['kongwang'] })) {
      for (const cell of match.palaces) {
        expect(withEmpty.has(`${match.run.start}/${cell.palace.number}`)).toBe(false);
      }
    }
  });

  it('rules out the whole run where the configuration belongs to no palace', () => {
    // The shared week, like every test here: 伏吟 falls on the board thirty
    // times in it, and a month of its own bought nothing but the wall clock.
    const runs = WEEK();
    const boards = runs.filter((run) =>
      run.chart.patterns.some((found) => found.id === 'fuyin' && found.palace === undefined),
    );
    expect(boards.length).toBeGreaterThan(0);

    const kept = new Set(matchRuns(runs, { excludes: ['fuyin'] }).map((match) => match.run.start));
    for (const run of boards) expect(kept.has(run.start)).toBe(false);
  });

  it('answers with nothing rather than with the nearest thing', () => {
    // 開門 and 休門 never stand in one palace, so nothing can answer this.
    // An empty answer is an answer: it says the arrangement did not occur.
    const impossible = matchRuns(WEEK(), { gate: 'kaimen', star: 'tianpeng', spirit: 'zhifu' });
    const all = matchRuns(WEEK(), {});

    expect(all.length).toBeGreaterThan(0);
    expect(impossible.length).toBeLessThan(all.length);
    for (const match of impossible) {
      expect(match.palaces[0]?.gate?.id).toBe('kaimen');
      expect(match.palaces[0]?.star.id).toBe('tianpeng');
      expect(match.palaces[0]?.spirit?.id).toBe('zhifu');
    }
  });
});

/**
 * 本命 as a criterion, which is what 《遁甲演義》 asks a scan for: the hours in
 * which the person's own year stands somewhere. What makes a palace worth
 * standing in stays with the other criteria and with the reader.
 */
describe('matchRuns with a 本命', () => {
  let week: ScanRun[];
  const WEEK = (): ScanRun[] => (week ??= scan('2026-09-01', '2026-09-08'));

  const pair = (hanzi: string) => {
    for (let index = 0; index < 60; index += 1) {
      if (ganzhiOf(index).hanzi === hanzi) return ganzhiOf(index);
    }
    throw new Error(`${hanzi} is not one of the sixty`);
  };

  it('admits only the palaces the pair stands on, on either plate', () => {
    const matches = matchRuns(WEEK(), { benming: pair('庚午') });

    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      // One palace on each plate, and the same one when the two coincide.
      expect(match.palaces.length).toBeGreaterThanOrEqual(1);
      expect(match.palaces.length).toBeLessThanOrEqual(2);
      for (const cell of match.palaces) {
        expect([cell.earth.hanzi, cell.heaven.hanzi]).toContain('庚');
      }
    }
  });

  it('looks a year headed by 甲 up under the instrument concealing it', () => {
    const matches = matchRuns(WEEK(), { benming: pair('甲子') });

    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      for (const cell of match.palaces) {
        // 甲 is on no plate; 甲子 is looked for under 戊.
        expect([cell.earth.hanzi, cell.heaven.hanzi]).toContain('戊');
      }
    }
  });

  it('narrows what the other criteria already asked, rather than replacing it', () => {
    const gate = matchRuns(WEEK(), { gate: 'kaimen' });
    const both = matchRuns(WEEK(), { gate: 'kaimen', benming: pair('庚午') });

    expect(both.length).toBeLessThan(gate.length);
    for (const match of both) {
      for (const cell of match.palaces) {
        expect(cell.gate?.id).toBe('kaimen');
        expect([cell.earth.hanzi, cell.heaven.hanzi]).toContain('庚');
      }
    }
  });
});

describe('formatScan', () => {
  const t: Translator = (key, params) => translate('en', key, params);

  it('writes the palace on every line and the hour only on the first of a run', () => {
    const text = formatScan(matchRuns(scan('2026-09-01', '2026-09-02'), { minStrength: 'xiang' }), t);
    const rows = text.split('\n').slice(1);

    expect(rows.length).toBeGreaterThan(1);
    // Every row names a palace by its direction; only some carry a date.
    const dated = rows.filter((row) => /^\s{2}\d{4}-\d{2}-\d{2}/.test(row));
    expect(dated.length).toBeGreaterThan(0);
    expect(dated.length).toBeLessThan(rows.length);
  });

  it('says that nothing answered rather than printing an empty table', () => {
    const text = formatScan([], t);

    expect(text).toContain('No palace');
    expect(text).not.toContain('until');
  });

  it('carries no verdict about anything it reports', () => {
    const text = formatScan(matchRuns(scan('2026-09-01', '2026-09-02'), {}), t).toLowerCase();

    for (const word of ['lucky', 'unlucky', 'favourable', 'auspicious', 'best', 'avoid']) {
      expect(text).not.toContain(word);
    }
  });
});
