import {
  computeQimenChart,
  initEphemeris,
  liurenBoard,
  qizhengBoard,
  resolveMoment,
  DEFAULT_LIUREN_OPTIONS,
  DEFAULT_OPTIONS,
  DEFAULT_QIZHENG_OPTIONS,
  DEFAULT_TAIYI_OPTIONS,
  DEFAULT_ZIWEI_OPTIONS,
  computeZiwei,
  taiyiBoard,
} from '@shipan/core';
import type {
  LiurenBoard,
  QimenChart,
  QizhengBoard,
  TaiyiBoard,
  ZiweiBoard,
} from '@shipan/core';
import { describe, expect, it } from 'vitest';
import type {
  PlateChart,
  PlateLiuren,
  PlateQizheng,
  PlateTaiyi,
  PlateZiwei,
} from '../src/types.js';

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

const qizheng: QizhengBoard = qizhengBoard(
  { julianDay: chart.moment.julianDayUT, hour: chart.moment.hourBranch },
  DEFAULT_QIZHENG_OPTIONS,
  initEphemeris(),
);

describe('the redeclared 七政四餘 board', () => {
  it('accepts a real board without a cast', () => {
    const asPlate: PlateQizheng = qizheng;

    expect(asPlate.governors).toHaveLength(7);
    expect(asPlate.houses).toHaveLength(12);
  });

  it('finds every field the drawing reads', () => {
    const plate: PlateQizheng = qizheng;

    expect(typeof plate.minggong.palace.index).toBe('number');
    expect(plate.minggong.palace.hanzi).toMatch(/^.$/);
    expect(plate.minggong.ci.hanzi).toMatch(/^.{2}$/);

    for (const seat of plate.houses) {
      expect(typeof seat.palace.index).toBe('number');
      expect(seat.house.pinyin).toMatch(/\S/);
      expect(seat.ci.pinyin).toMatch(/\S/);
    }

    for (const one of [...plate.governors, ...plate.remainders]) {
      expect(typeof one.body.hanzi).toBe('string');
      expect(one.body.pinyin).toMatch(/\S/);
      expect(one.lodge.pinyin).toMatch(/\S/);
      expect(typeof one.lodgeDegree).toBe('number');
      expect(typeof one.palace.index).toBe('number');
      expect(typeof one.motion).toBe('string');
    }

    // The one place the redeclared shape is looser than the engine's on
    // purpose: 太陽 and 太陰 carry no phase, and the drawing inks them plain
    // rather than inventing one.
    expect(plate.governors[0]?.body.element).toBeUndefined();
    expect(plate.governors[2]?.body.element).toBe('shui');
  });
});

const taiyi: TaiyiBoard = taiyiBoard({ year: 2026 }, DEFAULT_TAIYI_OPTIONS);

describe('the redeclared 太乙 board', () => {
  it('accepts a real board without a cast', () => {
    const asPlate: PlateTaiyi = taiyi;

    expect(asPlate.gods).toHaveLength(16);
    expect(asPlate.taiyi.palace.number).toBeGreaterThan(0);
  });

  it('finds every field the drawing reads', () => {
    const plate: PlateTaiyi = taiyi;

    // Eight of the sixteen carry a palace and eight do not, which is what the
    // drawing seats the grid from — so a board that stopped saying which is
    // which would lay out as an empty figure rather than fail.
    expect(plate.gods.filter((god) => god.palace !== undefined)).toHaveLength(8);
    for (const god of plate.gods) {
      expect(god.hanzi).toMatch(/^.{2}$/);
      expect(god.pinyin).toMatch(/\S/);
      expect(god.element).toMatch(/^(mu|huo|tu|jin|shui)$/);
    }

    // The direction is what the palace is; the number is this board's own and
    // places nothing.
    expect(plate.taiyi.palace.direction).toMatch(/^(n|ne|e|se|s|sw|w|nw)$/);
    for (const pattern of plate.patterns) expect(pattern.valence.hanzi).toMatch(/^.$/);
  });
});

const ziwei: ZiweiBoard = computeZiwei(chart.moment, {
  ...DEFAULT_ZIWEI_OPTIONS,
  gender: 'male',
});

describe('the redeclared 紫微斗數 board', () => {
  it('accepts a real board without a cast', () => {
    const asPlate: PlateZiwei = ziwei;

    expect(asPlate.palaces).toHaveLength(12);
    expect(asPlate.bureau.hanzi).toMatch(/局$/);
  });

  it('finds every field the drawing reads', () => {
    const plate: PlateZiwei = ziwei;

    // The centre.
    expect(plate.minggongPillar.hanzi).toMatch(/^.{2}$/);
    expect(plate.nayin.hanzi).toMatch(/\S/);
    expect(plate.yearPillar.hanzi).toMatch(/^.{2}$/);
    expect(plate.hourBranch.hanzi).toMatch(/^.$/);
    expect(plate.bodyBranch.hanzi).toMatch(/^.$/);
    expect(plate.lifeMaster.hanzi).toMatch(/\S/);
    expect(plate.bodyMaster.hanzi).toMatch(/\S/);
    expect(typeof plate.lunar.year).toBe('number');
    expect(typeof plate.lunar.leap).toBe('boolean');

    // Each cell is placed by the identifier of its branch, so that identifier
    // has to be one the drawing's seating table knows.
    const grounds = new Set(plate.palaces.map((palace) => palace.branch.id));
    expect(grounds.size).toBe(12);

    for (const palace of plate.palaces) {
      expect(palace.house.hanzi).toMatch(/\S/);
      expect(palace.house.pinyin).toMatch(/\S/);
      expect(palace.stem.hanzi).toMatch(/^.$/);
      expect(typeof palace.body).toBe('boolean');
      for (const seat of palace.stars) {
        expect(seat.star.hanzi).toMatch(/\S/);
        expect(seat.star.pinyin).toMatch(/\S/);
        expect(typeof seat.star.starClass).toBe('string');
      }
    }

    // Exactly one seat carries the 身宮, and the scaffolding a sex buys is
    // present on every cell when one was given.
    expect(plate.palaces.filter((palace) => palace.body)).toHaveLength(1);
    expect(plate.palaces.every((palace) => palace.majorLimit)).toBe(true);
    expect(plate.palaces.every((palace) => palace.changsheng)).toBe(true);
    expect(plate.palaces.every((palace) => palace.boshi)).toBe(true);
  });

  it('accepts a board laid without a sex, which is what the loose fields are for', () => {
    const bare: PlateZiwei = computeZiwei(chart.moment, DEFAULT_ZIWEI_OPTIONS);

    expect(bare.palaces.every((palace) => palace.majorLimit === null)).toBe(true);
    expect(bare.palaces.every((palace) => palace.boshi === null)).toBe(true);
    expect(bare.palaces.some((palace) => palace.stars.length > 0)).toBe(true);
  });
});
