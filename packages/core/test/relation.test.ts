import { beforeAll, describe, expect, it } from 'vitest';
import { computeQimenChart, type QimenChart } from '../src/dunjia/index.js';
import { palace, PALACES } from '../src/dunjia/palaces.js';
import { GATES, STARS } from '../src/dunjia/plates.js';
import { RELATION_IDS, relationOf } from '../src/dunjia/relation.js';
import { CONTROLS, GENERATES } from '../src/bazi/relations.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { resolveMoment } from '../src/pillars.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Element, type Place } from '../src/types.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };
const CLOCK: ChartOptions = { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' };
const ELEMENTS: Element[] = ['mu', 'huo', 'tu', 'jin', 'shui'];

function cast(date: string, time: string): QimenChart {
  return computeQimenChart(
    resolveMoment({ date, time, timezone: 'Asia/Shanghai' }, BEIJING, CLOCK, context),
    CLOCK,
  );
}

describe('門宮 · 星宮 — how a thing stands to its palace', () => {
  it('gives every pair of phases exactly one of the five relations', () => {
    for (const mine of ELEMENTS) {
      for (const ground of ELEMENTS) {
        expect(RELATION_IDS).toContain(relationOf(mine, ground).id);
      }
    }
  });

  it('reads the two cycles the way the rest of the engine does', () => {
    for (const mine of ELEMENTS) {
      expect(relationOf(mine, mine).id).toBe('bihe');
      // The palace feeds it; it feeds the palace; and the two controls.
      expect(relationOf(GENERATES[mine], mine).id).toBe('shengwo');
      expect(relationOf(mine, GENERATES[mine]).id).toBe('wosheng');
      expect(relationOf(CONTROLS[mine], mine).id).toBe('kewo');
      expect(relationOf(mine, CONTROLS[mine]).id).toBe('woke');
    }
  });

  it('is the opposite relation seen from the other side', () => {
    const mirror: Record<string, string> = {
      bihe: 'bihe',
      shengwo: 'wosheng',
      wosheng: 'shengwo',
      kewo: 'woke',
      woke: 'kewo',
    };
    for (const mine of ELEMENTS) {
      for (const ground of ELEMENTS) {
        expect(relationOf(ground, mine).id).toBe(mirror[relationOf(mine, ground).id]);
      }
    }
  });

  it('gives each palace of a chart a relation for its star, and for its gate', () => {
    for (const cell of cast('2024-06-15', '14:00').palaces) {
      expect(RELATION_IDS).toContain(cell.starRelation.id);
      // The centre has no gate, and so has no relation for one.
      if (cell.gate) expect(RELATION_IDS).toContain((cell.gateRelation as { id: string }).id);
      else expect(cell.gateRelation).toBeUndefined();
    }
  });

  it('reads a thing at home as of a kind with the palace it is at home in', () => {
    // A star or a gate resting in its own palace is trivially 比和 — same
    // element, because it is the same palace. It is worth pinning because it
    // is what makes 伏吟 a board of nine 比和 and nothing else.
    for (const star of STARS) {
      expect(relationOf(palace(star.home).element, palace(star.home).element).id).toBe('bihe');
    }
    for (const gate of GATES) {
      expect(relationOf(palace(gate.home).element, palace(gate.home).element).id).toBe('bihe');
    }
  });

  it('agrees with 門迫 wherever the chart reports one', () => {
    // 門迫 is the name and the fortune the tradition puts on one of the five
    // relations. The two must never disagree: a palace marked 門迫 whose gate
    // reads anything but 我剋 would mean the rule had been written twice.
    for (const date of ['2005-05-05', '2015-08-08', '2022-02-22', '2024-06-15']) {
      for (const hour of ['01:00', '14:00', '23:30']) {
        const chart = cast(date, hour);
        const oppressed = new Set(
          chart.patterns.filter((one) => one.id === 'menpo').map((one) => one.palace),
        );

        for (const cell of chart.palaces) {
          if (!cell.gate) continue;
          expect(oppressed.has(cell.palace.number)).toBe(cell.gateRelation?.id === 'woke');
        }
      }
    }
  });

  it('carries the relation as an identifier and a glyph, never as prose', () => {
    const serialised = JSON.stringify(cast('2024-06-15', '14:00').palaces).toLowerCase();

    for (const word of ['generated', 'controlled', 'generata', 'dominata', 'same phase']) {
      expect(serialised).not.toContain(word);
    }
  });

  it('leaves every palace of the board with an element to be read against', () => {
    for (const one of PALACES) expect(ELEMENTS).toContain(one.element);
  });
});
