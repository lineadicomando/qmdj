import { computeQimenChart, initEphemeris, resolveMoment, DEFAULT_OPTIONS } from '@qimendunjia/core';
import type { QimenChart } from '@qimendunjia/core';
import { describe, expect, it } from 'vitest';
import type { PlateChart } from '../src/types.js';

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
