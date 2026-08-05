import { beforeAll, describe, expect, it } from 'vitest';
import { computeQimenChart, type QimenChart } from '../src/dunjia/index.js';
import { determineJu } from '../src/dunjia/ju.js';
import { CENTRE_HOST, PALACES, RING_CLOCKWISE, lodge } from '../src/dunjia/palaces.js';
import { GATES, STARS, earthPlate } from '../src/dunjia/plates.js';
import { ChartError } from '../src/errors.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { resolveMoment } from '../src/pillars.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };

/** The settings the reference charts below were checked under. */
const CLOCK: ChartOptions = {
  ...DEFAULT_OPTIONS,
  trueSolarTime: false,
  dayBoundary: 'midnight',
};

/**
 * The order a chart is conventionally written out in — three rows of three,
 * south at the top. Not the Luoshu order, which is how the engine keys the
 * palaces; this is only for comparing whole rows at a glance.
 */
const WRITTEN_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

function cast(date: string, time: string): QimenChart {
  return computeQimenChart(
    resolveMoment({ date, time, timezone: 'Asia/Shanghai' }, BEIJING, CLOCK, context),
    CLOCK,
  );
}

function row(chart: QimenChart, read: (p: QimenChart['palaces'][number]) => string): string {
  const byNumber = new Map(chart.palaces.map((p) => [p.palace.number, p]));
  return WRITTEN_ORDER.map((n) => read(byNumber.get(n)!)).join('');
}

describe('the nine palaces', () => {
  it('numbers them by the Luoshu', () => {
    expect(PALACES.map((p) => p.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(PALACES.map((p) => p.hanzi).join('')).toBe('坎坤震巽中乾兌艮離');
  });

  it('gives the centre no direction', () => {
    expect(PALACES.find((p) => p.number === 5)?.direction).toBeNull();
    expect(PALACES.filter((p) => p.direction === null)).toHaveLength(1);
  });

  it('lodges the centre, and leaves the rest alone', () => {
    expect(lodge(5)).toBe(CENTRE_HOST);
    for (const p of PALACES) if (p.number !== 5) expect(lodge(p.number)).toBe(p.number);
  });

  it('rings the eight without passing through the centre', () => {
    expect(RING_CLOCKWISE).toHaveLength(8);
    expect(RING_CLOCKWISE).not.toContain(5);
    expect(new Set(RING_CLOCKWISE).size).toBe(8);
  });
});

describe('the earth plate', () => {
  it('lays nine stems, one to a palace, and never 甲', () => {
    const plate = earthPlate(true, 1);
    const stems = Object.values(plate).map((s) => s.hanzi);

    expect(stems).toHaveLength(9);
    expect(new Set(stems).size).toBe(9);
    // 甲 is the hidden one the whole art is named for: it is on no plate.
    expect(stems).not.toContain('甲');
  });

  it('counts up from the ju in a yang chart', () => {
    // Yang dun, ju nine: 戊 opens at palace nine and the rest follow upward,
    // wrapping through one.
    const plate = earthPlate(true, 9);

    expect(plate[9]?.hanzi).toBe('戊');
    expect(plate[1]?.hanzi).toBe('己');
    expect(plate[2]?.hanzi).toBe('庚');
    expect(plate[8]?.hanzi).toBe('乙');
  });

  it('counts down from the ju in a yin chart', () => {
    const plate = earthPlate(false, 1);

    expect(plate[1]?.hanzi).toBe('戊');
    expect(plate[9]?.hanzi).toBe('己');
    expect(plate[8]?.hanzi).toBe('庚');
    expect(plate[2]?.hanzi).toBe('乙');
  });

  it('reproduces all eighteen published arrangements', () => {
    // Derived, not tabulated: these two lines are the whole rule, and the
    // eighteen tables printed in the manuals fall out of them. Spot-checked
    // here against four of the eighteen, in the written order.
    const written = (yang: boolean, ju: number) =>
      WRITTEN_ORDER.map((n) => earthPlate(yang, ju)[n]?.hanzi).join('');

    expect(written(true, 9)).toBe('壬戊庚辛癸丙乙己丁');
    expect(written(true, 5)).toBe('乙壬丁丙戊庚辛癸己');
    expect(written(true, 6)).toBe('丙辛癸丁乙己庚壬戊');
    expect(written(false, 1)).toBe('丁己乙丙癸辛庚戊壬');
  });
});

describe('a verified chart', () => {
  // 2024-06-15 14:00 in Beijing. Checked against an independent
  // implementation, as were the three that follow.
  let chart: QimenChart;

  beforeAll(() => {
    chart = cast('2024-06-15', '14:00');
  });

  it('determines the dun and the ju', () => {
    expect(chart.moment.solarTerm.term.id).toBe('mangzhong');
    expect(chart.ju).toMatchObject({ yang: true, number: 9, yuan: 'xia' });
  });

  it('finds the instrument concealing 甲', () => {
    // The hour is 癸未, in the decade of 甲戌, which 己 stands in for.
    expect(chart.moment.pillars.hour.hanzi).toBe('癸未');
    expect(chart.instrument.hanzi).toBe('己');
  });

  it('finds the chief and the chief gate', () => {
    expect(chart.chief.star.hanzi).toBe('天蓬');
    expect(chart.chief.palace.hanzi).toBe('中');
    expect(chart.chiefGate.gate.hanzi).toBe('休門');
    expect(chart.chiefGate.palace.hanzi).toBe('坎');
  });

  it('lays the four plates', () => {
    expect(row(chart, (p) => p.earth.hanzi)).toBe('壬戊庚辛癸丙乙己丁');
    expect(row(chart, (p) => p.heaven.hanzi)).toBe('丙丁己庚癸乙戊壬辛');
    expect(row(chart, (p) => p.star.hanzi)).toBe('天柱天心天蓬天芮天禽天任天英天輔天沖');
    expect(row(chart, (p) => p.gate?.hanzi ?? '')).toBe('杜門景門死門傷門驚門生門休門開門');
    expect(row(chart, (p) => p.spirit?.hanzi ?? '')).toBe('九地九天值符朱雀滕蛇勾陳六合太陰');
  });
});

describe('more verified charts', () => {
  it.each([
    ['2000-04-21', '21:00', 'guyu', true, 5, 'shang', '天心', '巽', '開門', '兌'],
    ['1984-02-02', '12:00', 'dahan', true, 6, 'xia', '天英', '離', '景門', '離'],
    ['2025-01-19', '03:00', 'xiaohan', true, 5, 'xia', '天蓬', '坎', '休門', '坎'],
  ])(
    '%s %s',
    (date, time, term, yang, ju, yuan, chief, chiefPalace, gate, gatePalace) => {
      const chart = cast(date as string, time as string);

      expect(chart.moment.solarTerm.term.id).toBe(term);
      expect(chart.ju).toMatchObject({ yang, number: ju, yuan });
      expect(chart.chief.star.hanzi).toBe(chief);
      expect(chart.chief.palace.hanzi).toBe(chiefPalace);
      expect(chart.chiefGate.gate.hanzi).toBe(gate);
      expect(chart.chiefGate.palace.hanzi).toBe(gatePalace);
    },
  );

  it('leaves the plates unturned when the hour stem is already in place', () => {
    // 1984-02-02 12:00: the hour is 甲午, so the hour stem *is* the
    // instrument, and the heaven plate has nowhere to turn to.
    const chart = cast('1984-02-02', '12:00');

    expect(chart.moment.pillars.hour.hanzi).toBe('甲午');
    expect(chart.hourStem.hanzi).toBe('辛');
    expect(row(chart, (p) => p.earth.hanzi)).toBe(row(chart, (p) => p.heaven.hanzi));
  });
});

describe('the yuan', () => {
  it('splits the term into three parts of five days', () => {
    // Lichun 2024 fell on 4 February at 16:27. Five days on, the yuan turns.
    expect(cast('2024-02-05', '12:00').ju.yuan).toBe('shang');
    expect(cast('2024-02-10', '12:00').ju.yuan).toBe('zhong');
    expect(cast('2024-02-15', '12:00').ju.yuan).toBe('xia');
  });

  it('steps the ju by six, modulo nine, from one yuan to the next', () => {
    // A regularity of the table, and a check that the three columns of a row
    // belong together.
    const shang = cast('2024-02-05', '12:00').ju.number;
    const zhong = cast('2024-02-10', '12:00').ju.number;
    const xia = cast('2024-02-15', '12:00').ju.number;

    expect(zhong).toBe(((shang + 6 - 1) % 9) + 1);
    expect(xia).toBe(((zhong + 6 - 1) % 9) + 1);
  });

  it('turns from yang to yin at the summer solstice, not at an equinox', () => {
    expect(cast('2024-06-20', '12:00').ju.yang).toBe(true);
    expect(cast('2024-06-22', '12:00').ju.yang).toBe(false);
    expect(cast('2024-12-20', '12:00').ju.yang).toBe(false);
    expect(cast('2024-12-23', '12:00').ju.yang).toBe(true);
  });
});

describe('what every chart must satisfy', () => {
  const SAMPLES = ['2001-03-07', '2009-08-19', '2017-11-30', '2023-05-05'];

  it.each(SAMPLES)('%s holds together', (date) => {
    for (const hour of ['01:00', '07:00', '13:00', '19:00']) {
      const chart = cast(date, hour);
      const byNumber = new Map(chart.palaces.map((p) => [p.palace.number, p]));

      // Nine palaces, nine distinct stems on each plate, nine distinct stars.
      expect(chart.palaces).toHaveLength(9);
      expect(new Set(chart.palaces.map((p) => p.earth.hanzi)).size).toBe(9);
      expect(new Set(chart.palaces.map((p) => p.heaven.hanzi)).size).toBe(9);
      expect(new Set(chart.palaces.map((p) => p.star.id)).size).toBe(9);

      // Eight gates and eight spirits, and none of them in the centre.
      const gates = chart.palaces.filter((p) => p.gate);
      const spirits = chart.palaces.filter((p) => p.spirit);
      expect(gates).toHaveLength(8);
      expect(spirits).toHaveLength(8);
      expect(byNumber.get(5)?.gate).toBeUndefined();
      expect(byNumber.get(5)?.spirit).toBeUndefined();
      expect(new Set(gates.map((p) => p.gate!.id)).size).toBe(8);
      expect(new Set(spirits.map((p) => p.spirit!.id)).size).toBe(8);

      // The chief gate landed where the chart says it did, and the chief
      // spirit stands over the chief's palace.
      expect(byNumber.get(chart.chiefGate.palace.number)?.gate?.id).toBe(chart.chiefGate.gate.id);
      expect(byNumber.get(lodge(chart.chief.palace.number))?.spirit?.id).toBe('zhifu');

      // The heaven plate carries the instrument to the hour's stem — except
      // where the centre is involved. The turn runs along the ring, which has
      // no centre on it, so a plate whose centre holds the instrument leaves
      // it there and turns what stands at the lodging palace instead.
      const instrumentPalace = chart.palaces.find((p) => p.heaven.id === chart.instrument.id)!;
      const hourStemPalace = chart.palaces.find((p) => p.earth.id === chart.hourStem.id)!;
      if (instrumentPalace.palace.number !== 5 && hourStemPalace.palace.number !== 5) {
        expect(instrumentPalace.palace.number).toBe(hourStemPalace.palace.number);
      }
    }
  });
});

describe('no school is implicit', () => {
  it('refuses a method it does not implement', () => {
    // A chart cast by the wrong method looks right and is not, so asking for
    // one that is missing is an error rather than a quiet substitution.
    for (const method of ['zhirun', 'maoshan'] as const) {
      const moment = resolveMoment(
        { date: '2024-06-15', time: '14:00', timezone: 'Asia/Shanghai' },
        BEIJING,
        { ...CLOCK, method },
        context,
      );

      expect(() => determineJu(moment, { ...CLOCK, method })).toThrow(ChartError);
      try {
        determineJu(moment, { ...CLOCK, method });
      } catch (error) {
        expect((error as ChartError).code).toBe('METHOD_NOT_IMPLEMENTED');
        expect((error as ChartError).params['method']).toBe(method);
      }
    }
  });

  it('keeps the options that produced it', () => {
    expect(cast('2024-06-15', '14:00').options).toEqual(CLOCK);
  });
});

describe('identifiers', () => {
  it('separates the two gates that collide without tones', () => {
    // 驚門 is jīng and 景門 is jǐng: toneless pinyin cannot tell them apart,
    // so these two, alone in the project, carry the tone number.
    const ids = GATES.map((gate) => gate.id);

    expect(new Set(ids).size).toBe(8);
    expect(ids).toContain('jing1men');
    expect(ids).toContain('jing3men');
    expect(GATES.find((g) => g.id === 'jing1men')?.hanzi).toBe('驚門');
    expect(GATES.find((g) => g.id === 'jing3men')?.hanzi).toBe('景門');
  });

  it('gives every gate and star a home palace', () => {
    expect(new Set(GATES.map((g) => g.home)).size).toBe(8);
    expect(GATES.map((g) => g.home)).not.toContain(5);
    expect(new Set(STARS.map((s) => s.home)).size).toBe(9);
  });
});
