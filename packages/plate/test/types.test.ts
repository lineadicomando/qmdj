import {
  computeQimenChart,
  initEphemeris,
  liurenBoard,
  resolveMoment,
  DEFAULT_LIUREN_OPTIONS,
  DEFAULT_OPTIONS,
} from '@qimendunjia/core';
import type { LiurenBoard, QimenChart } from '@qimendunjia/core';
import { describe, expect, it } from 'vitest';
import type { PlateChart, PlateLiuren } from '../src/types.js';

/**
 * The guard on the one rule this package exists to keep.
 *
 * `plate` redeclares the shape of a chart instead of importing it, so that a
 * drawing can never reach into the engine. The cost of that is a second copy
 * of the shape, and the risk of a second copy is that it drifts. This file is
 * where the drift is caught: at compile time, because a real chart has to be
 * assignable to the redeclared type without a cast, and at run time, because
 * a real chart has to actually carry every field the drawing reads.
 */

const chart: QimenChart = computeQimenChart(
  resolveMoment(
    { date: '2024-06-15', time: '14:00', timezone: 'Asia/Shanghai' },
    { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' },
    { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' },
    initEphemeris(),
  ),
  { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' },
);

describe('the redeclared shape', () => {
  it('accepts a real chart without a cast', () => {
    // If the engine renames a field the drawing reads, this line stops
    // compiling — which is the whole point of the file.
    const asPlate: PlateChart = chart;

    expect(asPlate.palaces).toHaveLength(9);
  });

  it('finds every field the drawing reads', () => {
    const plate: PlateChart = chart;

    expect(typeof plate.ju.yang).toBe('boolean');
    expect(typeof plate.ju.number).toBe('number');
    expect(typeof plate.chief.star.hanzi).toBe('string');
    expect(typeof plate.chief.palace.number).toBe('number');
    expect(typeof plate.chiefGate.gate.hanzi).toBe('string');
    expect(typeof plate.moment.local).toBe('string');

    for (const pillar of ['year', 'month', 'day', 'hour'] as const) {
      expect(plate.moment.pillars[pillar].hanzi).toMatch(/^.{2}$/);
    }

    for (const palace of plate.palaces) {
      expect(typeof palace.palace.number).toBe('number');
      expect(typeof palace.palace.hanzi).toBe('string');
      expect(typeof palace.palace.element).toBe('string');
      expect(typeof palace.earth.hanzi).toBe('string');
      expect(typeof palace.heaven.hanzi).toBe('string');
      expect(typeof palace.star.hanzi).toBe('string');
      expect(typeof palace.starStrength.hanzi).toBe('string');
    }
  });

  it('hands over a reading for every name the band under it says aloud', () => {
    // The readings are optional in the redeclared shape — a caller on an older
    // engine draws a shorter band rather than failing — which is exactly why
    // it has to be checked here that this engine leaves none of them out. A
    // name silently missing its reading is a name that quietly stops being
    // listed, and nothing else would notice.
    const plate: PlateChart = chart;

    for (const palace of plate.palaces) {
      for (const named of [palace.palace, palace.earth, palace.heaven, palace.star]) {
        expect(named.pinyin).toMatch(/\S/);
      }
      // The centre has neither, and says so by their absence rather than by a
      // blank standing in for them.
      if (palace.gate) expect(palace.gate.pinyin).toMatch(/\S/);
      if (palace.spirit) expect(palace.spirit.pinyin).toMatch(/\S/);
    }

    for (const pattern of plate.patterns) expect(pattern.pinyin).toMatch(/\S/);
  });

  it('names the five phases the way the palette keys them', () => {
    // The palette looks its tints up by the engine's element identifiers. A
    // rename there would leave every palace untinted and nothing would fail.
    const elements = new Set(chart.palaces.map((palace) => palace.palace.element));

    expect([...elements].sort()).toEqual(['huo', 'jin', 'mu', 'shui', 'tu']);
  });

  it('leaves the centre without a gate or a spirit', () => {
    const centre = chart.palaces.find((palace) => palace.palace.number === 5);

    expect(centre?.gate).toBeUndefined();
    expect(centre?.spirit).toBeUndefined();
  });
});

const board: LiurenBoard = liurenBoard(
  {
    term: chart.moment.solarTerm.term,
    day: chart.moment.pillars.day,
    hour: chart.moment.hourBranch,
  },
  DEFAULT_LIUREN_OPTIONS,
);

describe('the redeclared board', () => {
  it('accepts a real Liu Ren board without a cast', () => {
    const asPlate: PlateLiuren = board;

    expect(asPlate.heaven).toHaveLength(12);
    expect(asPlate.generals).toHaveLength(12);
  });

  it('finds every field the drawing reads', () => {
    const plate: PlateLiuren = board;

    expect(plate.yuejiang.hanzi).toMatch(/^.{2}$/);
    expect(typeof plate.yuejiang.branch.index).toBe('number');
    expect(plate.day.hanzi).toMatch(/^.{2}$/);
    expect(typeof plate.hour.index).toBe('number');
    expect(typeof plate.rule).toBe('string');

    for (const cell of plate.heaven) expect(typeof cell.hanzi).toBe('string');
    for (const general of plate.generals) expect(typeof general.id).toBe('string');

    expect(plate.courses).toHaveLength(4);
    for (const course of plate.courses) {
      expect(typeof course.number).toBe('number');
      expect(typeof course.upper.hanzi).toBe('string');
      // 一課 stands on the day stem and the other three on branches; the
      // drawing writes whichever it is handed and does not ask which.
      expect(typeof course.lower.hanzi).toBe('string');
    }

    expect(plate.transmissions).toHaveLength(3);
    for (const cell of plate.heaven) expect(cell.pinyin).toMatch(/\S/);
    for (const general of plate.generals) expect(general.pinyin).toMatch(/\S/);

    for (const transmission of plate.transmissions) {
      expect(typeof transmission.position).toBe('string');
      expect(typeof transmission.empty).toBe('boolean');
      // The stem is absent exactly when the branch is 空亡, and the drawing
      // reads that absence rather than a flag.
      expect(transmission.hiddenStem === undefined).toBe(transmission.empty);
    }
  });
});
