import { beforeAll, describe, expect, it } from 'vitest';
import { almanacAt, dayGodOf, lodgeOn, monthGodsOf, officerOf, shenshaOf, yearGodsOf, DAY_GOD_LIST, LODGES, OFFICERS } from '../src/almanac.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { BRANCHES, ganzhiOf, type Branch, type Ganzhi } from '../src/ganzhi.js';
import { toJulianDay } from '../src/time.js';
import { computeQimenChart } from '../src/dunjia/index.js';
import { chartTranscript } from '../src/prompt.js';
import { resolveMoment } from '../src/pillars.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';
import { createTranslator } from '@qimendunjia/i18n';

/**
 * The values below were read off `lunar-javascript`, which every pillar in
 * this project was already verified against, and the boundaries were checked
 * against 《協紀辨方書》卷四 before they were written down. Nothing here is
 * recalled: see the 曆注 section of `docs/sources.md`.
 */

let ephemeris: EphemerisContext;
beforeAll(() => {
  ephemeris = initEphemeris();
});
const context = (): EphemerisContext => ephemeris;

/** Noon on 120°E, which is the meridian the page is reckoned on. */
const noonAt = (year: number, month: number, day: number): number =>
  toJulianDay(year, month, day, 12) - 8 / 24;

const branch = (hanzi: string): Branch => BRANCHES.find((b) => b.hanzi === hanzi) as Branch;

/** A year whose branch is `hanzi`; the stem does not matter to a branch seat. */
const yearWithBranch = (hanzi: string): Ganzhi =>
  Array.from({ length: 60 }, (_, i) => ganzhiOf(i)).find(
    (g) => g.branch.hanzi === hanzi,
  ) as Ganzhi;

const branchSeat = (year: string, god: string): string => {
  const seat = yearGodsOf(yearWithBranch(year)).find((g) => g.id === god)?.seat;
  return seat?.kind === 'branch' ? seat.branch.hanzi : '';
};

describe('建除十二神', () => {
  it('opens the count where the month branch and the day branch meet', () => {
    // 「如正月建寅則寅日起建」 — the month of 寅, on a 寅 day, is 建.
    expect(officerOf(branch('寅'), branch('寅')).hanzi).toBe('建');
    expect(officerOf(branch('寅'), branch('卯')).hanzi).toBe('除');
    expect(officerOf(branch('寅'), branch('丑')).hanzi).toBe('閉');
  });

  it('runs the twelve forward and closes the ring', () => {
    const run = BRANCHES.map((day) => officerOf(branch('子'), day).hanzi).join('');
    expect(run).toBe('建除滿平定執破危成收開閉');
    expect(OFFICERS).toHaveLength(12);
  });

  it('names the officer of an ordinary day', () => {
    const page = almanacAt(noonAt(2026, 8, 4), context());
    expect(page.day.hanzi).toBe('庚戌');
    expect(page.monthBranch.hanzi).toBe('未');
    expect(page.officer.hanzi).toBe('平');
    expect(page.doubled).toBe(false);
  });

  it('gives the same officer to the two days a 交節 doubles', () => {
    // 立秋 falls on 2026-08-07. 「每月交節則疊兩值日」.
    const before = almanacAt(noonAt(2026, 8, 6), context());
    const onTheJie = almanacAt(noonAt(2026, 8, 7), context());
    const after = almanacAt(noonAt(2026, 8, 8), context());

    expect([before.day.hanzi, onTheJie.day.hanzi, after.day.hanzi]).toEqual([
      '壬子',
      '癸丑',
      '甲寅',
    ]);
    expect(before.officer.hanzi).toBe('執');
    expect(onTheJie.officer.hanzi).toBe('執');
    expect(after.officer.hanzi).toBe('破');
  });

  it('marks the second of the doubled days and not the first', () => {
    expect(almanacAt(noonAt(2026, 8, 6), context()).doubled).toBe(false);
    expect(almanacAt(noonAt(2026, 8, 7), context()).doubled).toBe(true);
    expect(almanacAt(noonAt(2026, 8, 8), context()).doubled).toBe(false);
  });

  it('gives the whole of a 節 day to the new month, hour by hour', () => {
    // 白露 2026 strikes late on 9 September UT; every hour of that date, before
    // the crossing as well as after it, carries the month the 節 opens. This is
    // the difference between the page and the month pillar, and it is the one
    // thing about this layer that could have gone wrong silently.
    for (const hour of [0, 6, 12, 18, 23]) {
      const page = almanacAt(toJulianDay(2026, 9, 7, hour) - 8 / 24, context());
      expect(page.monthBranch.hanzi).toBe('酉');
      expect(page.officer.hanzi).toBe('閉');
      expect(page.doubled).toBe(true);
    }
  });

  it('turns its day on 120°E and not on the reader', () => {
    // 16:00 UT on 15 March is already one in the morning of the 16th at the
    // meridian the calendar is reckoned on, so the page is the 16th's — in
    // Rome, where it is still the evening of the 15th, exactly as in Beijing.
    // The layer takes no timezone at all, which is what makes that true.
    const evening = toJulianDay(2026, 3, 15, 16);
    expect(almanacAt(evening, context()).day.hanzi).toBe('己丑');
    expect(almanacAt(evening, context()).officer.hanzi).toBe('開');

    const morning = toJulianDay(2026, 3, 15, 4);
    expect(almanacAt(morning, context()).day.hanzi).toBe('戊子');
    expect(almanacAt(morning, context()).officer.hanzi).toBe('收');
  });

  it('stays out of what a model is handed', () => {
    // The officer is a function of the month branch and the day branch, and a
    // transcript prints both. Inside a fence that is one datum twice, and a
    // model reads the second as confirming the first. It belongs in the
    // sections that are addresses, where nothing is being asked.
    const options: ChartOptions = { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' };
    const place: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };
    const when = resolveMoment(
      { date: '2024-06-15', time: '14:00', timezone: 'Asia/Shanghai' },
      place,
      options,
      context(),
    );
    const en = createTranslator('en');
    const chart = computeQimenChart(when, options);

    // The officer of that day is 定, and the pillar it stands on is 庚戌.
    expect(when.almanac.officer.hanzi).toBe('定');
    const fenced = chartTranscript(when, chart, en, {});

    expect(fenced).toContain('庚戌');
    expect(fenced).not.toContain('定 dìng');
    expect(fenced).not.toContain(en('cli.field.jianchu'));
  });

  it('runs the twenty-eight lodges in their own order, unbroken', () => {
    // A count of days and nothing else: it crosses a 節 where 建除 doubles.
    const run = Array.from({ length: 30 }, (_, i) => lodgeOn(2461042 + i).hanzi).join('');
    expect(run).toBe('井鬼柳星張翼軫角亢氐房心尾箕斗牛女虛危室壁奎婁胃昴畢觜參井鬼');
    expect(LODGES).toHaveLength(28);
  });

  it('keeps every lodge on its own weekday, which is what fixes the epoch', () => {
    // Twenty-eight is four sevens, so a lodge holds one weekday for ever, and
    // the tradition wrote the check into the names: the 金 in 鬼金羊 is Friday.
    // An epoch out by anything that is not a multiple of seven breaks all 28.
    const WEEKDAY_OF_PLANET: Record<string, number> = {
      日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6,
    };
    for (let dayNumber = 2461042; dayNumber < 2461042 + 400; dayNumber += 1) {
      const lodge = lodgeOn(dayNumber);
      // Julian Day Number 0 was a Monday, so this is the weekday with 0 = Sunday.
      expect(WEEKDAY_OF_PLANET[lodge.planet.hanzi]).toBe((dayNumber + 1) % 7);
    }
  });

  it('holds the lodge across a 節, where the officer doubles', () => {
    const before = almanacAt(noonAt(2026, 8, 6), context());
    const onTheJie = almanacAt(noonAt(2026, 8, 7), context());

    expect(before.officer.hanzi).toBe(onTheJie.officer.hanzi);
    expect(before.lodge.hanzi).not.toBe(onTheJie.lodge.hanzi);
    expect(onTheJie.lodge.hanzi).toBe('婁');
  });

  it("reproduces the source's own worked months for the twelve gods", () => {
    // 《協紀辨方書》卷七 works three cases out in full. They are the test.
    // 寅月: 「寅天刑卯朱雀辰金匱巳天德午白虎未玉堂申天牢酉元武戌司命亥勾陳子青龍丑明堂」
    const run = (month: string): string =>
      BRANCHES.map((d) => dayGodOf(branch(month), d).hanzi).join('');

    // Written from 子 round to 亥, which is the order BRANCHES runs in.
    expect(run('寅')).toBe('青龍明堂天刑朱雀金匱天德白虎玉堂天牢玄武司命勾陳');
    // 卯月 and 酉月 stand still — the source calls it 伏吟: 「卯明堂辰天刑…」
    expect(run('卯')).toBe('司命勾陳青龍明堂天刑朱雀金匱天德白虎玉堂天牢玄武');
    // 午月 and 子月 turn half way — 反吟: 「午司命未勾陳申青龍…」
    expect(run('午')).toBe('金匱天德白虎玉堂天牢玄武司命勾陳青龍明堂天刑朱雀');
    expect(run('申')).toBe(run('寅'));
    expect(run('酉')).toBe(run('卯'));
  });

  it('carries the fortune of the god and none of its errands', () => {
    // Six 吉 and six 凶 — 《神樞經》 by way of 卷七. The valence travels as
    // `Pattern`'s does; the 宜忌 in the same passage does not.
    const lucky = DAY_GOD_LIST.filter((g) => g.valence.id === 'ji').map((g) => g.hanzi);
    expect(lucky).toEqual(['司命', '青龍', '明堂', '金匱', '天德', '玉堂']);
    expect(DAY_GOD_LIST.filter((g) => g.valence.id === 'xiong')).toHaveLength(6);
  });

  it("seats the year gods where 卷三 enumerates them", () => {
    // Every one of these is the source's own worked list, not a derivation of
    // this file's. 「歲破者，太歲所衝之辰也……子年在午」; 太陰「子年則在戌，
    // 丑年則在亥，寅年則在子」; 大將軍「寅夘辰歲……居正北，巳午未……正東，
    // 申酉戌……正南，亥子丑……正西」; 黄幡「寅午戌歲在戌，申子辰歲在辰，
    // 亥夘未歲在未，巳酉丑歲在丑」; 豹尾「常居黄幡對衝」.
    const seat = (year: string, god: string): string => branchSeat(year, god);

    expect(seat('子', 'suipo')).toBe('午');
    expect([seat('子', 'taiyin'), seat('丑', 'taiyin'), seat('寅', 'taiyin')]).toEqual([
      '戌', '亥', '子',
    ]);
    for (const y of ['寅', '卯', '辰']) expect(seat(y, 'dajiangjun')).toBe('子');
    for (const y of ['巳', '午', '未']) expect(seat(y, 'dajiangjun')).toBe('卯');
    for (const y of ['申', '酉', '戌']) expect(seat(y, 'dajiangjun')).toBe('午');
    for (const y of ['亥', '子', '丑']) expect(seat(y, 'dajiangjun')).toBe('酉');
    for (const y of ['寅', '午', '戌']) expect(seat(y, 'huangfan')).toBe('戌');
    for (const y of ['申', '子', '辰']) expect(seat(y, 'huangfan')).toBe('辰');
    for (const y of ['亥', '卯', '未']) expect(seat(y, 'huangfan')).toBe('未');
    for (const y of ['巳', '酉', '丑']) expect(seat(y, 'huangfan')).toBe('丑');
    expect(seat('寅', 'baowei')).toBe('辰');
    expect(seat('申', 'taisui')).toBe('申');

    // 喪門「常居歲前二辰」, 弔客「常居歲後二辰」, 白虎「常居歲後四辰」,
    // 病符「常居歲後一辰」, 死符「常居歲前五辰」.
    expect(seat('子', 'sangmen')).toBe('寅');
    expect(seat('子', 'diaoke')).toBe('戌');
    expect(seat('子', 'baihu')).toBe('申');
    expect(seat('子', 'bingfu')).toBe('亥');
    expect(seat('子', 'sifu')).toBe('巳');
    // 「大煞子年在子，丑年在酉，寅年在午，夘年在夘，辰年又在子」.
    expect(['子', '丑', '寅', '卯', '辰'].map((y) => seat(y, 'dasha'))).toEqual([
      '子', '酉', '午', '卯', '子',
    ]);
  });

  it('seats the 三煞 on the 絕, the 胎 and the 養 of the year\'s triad', () => {
    const seat = (year: string, god: string): string => branchSeat(year, god);

    // 李鼎祚's enumeration is of 歲煞 alone, and it checks the other two:
    // 「寅午戌煞在丑，巳酉丑煞在辰，申子辰煞在未，亥夘未煞在戌」.
    for (const y of ['寅', '午', '戌']) expect(seat(y, 'suisha')).toBe('丑');
    for (const y of ['巳', '酉', '丑']) expect(seat(y, 'suisha')).toBe('辰');
    for (const y of ['申', '子', '辰']) expect(seat(y, 'suisha')).toBe('未');
    for (const y of ['亥', '卯', '未']) expect(seat(y, 'suisha')).toBe('戌');

    // 「三煞在南方巳午未」 for a 申子辰 year, in the order 絕 · 胎 · 養.
    expect([seat('子', 'jiesha'), seat('子', 'zaisha'), seat('子', 'suisha')]).toEqual([
      '巳', '午', '未',
    ]);

    // 歲煞「常居四季」 — and only ever there.
    for (const y of BRANCHES) expect(['丑', '辰', '未', '戌']).toContain(seat(y.hanzi, 'suisha'));
  });

  it('seats 歲德 and its 合 on a stem, as the source gives them', () => {
    // Both are enumerated, in two quotations of the one entry. 考原 for the
    // 合: 「甲年在己，乙年在乙，丙年在辛，丁年在丁，戊年在癸，己年在己，庚年
    // 在乙，辛年在辛，壬年在丁，癸年在癸」. 廣聖厯 for 歲德 itself: 「甲德在
    // 甲，乙德在庚，丙德在丙，丁德在壬，戊德在戊，己德在甲，庚德在庚，辛德在
    // 丙，壬德在壬，癸德在戊」. And the two are each other's 五合, which is the
    // same fact stated a third time.
    const stemSeat = (yearStem: string, god: string): string => {
      const year = Array.from({ length: 60 }, (_, i) => ganzhiOf(i)).find(
        (g) => g.stem.hanzi === yearStem,
      ) as Ganzhi;
      const seat = yearGodsOf(year).find((g) => g.id === god)?.seat;
      return seat?.kind === 'stem' ? seat.stem.hanzi : '';
    };

    const table = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    expect(table.map((y) => stemSeat(y, 'suidehe'))).toEqual([
      '己', '乙', '辛', '丁', '癸', '己', '乙', '辛', '丁', '癸',
    ]);
    expect(table.map((y) => stemSeat(y, 'suide'))).toEqual([
      '甲', '庚', '丙', '壬', '戊', '甲', '庚', '丙', '壬', '戊',
    ]);
  });

  it('puts the corner gods where 《萬全廣濟》 says the 蠶室 is', () => {
    // The four are derived from statements rather than from a table: 奏書
    // 「常居近歲後維方……初起於乾」, 力士 「在太歲之前隅」, and each of the
    // other two is the opposite of one of those. What checks the derivation is
    // an enumeration of one of them, quoted in the 蠶命 entry: 「萬全廣濟云：
    // 亥子丑年未坤申，寅夘辰年戌乾亥，巳午未年丑艮寅，申酉戌年辰巽巳」, with
    // the worked case 「假如亥子丑年……蠶室在坤」.
    const corner = (year: string, god: string): string => {
      const seat = yearGodsOf(yearWithBranch(year)).find((g) => g.id === god)?.seat;
      return seat?.kind === 'trigram' ? seat.trigram.hanzi : '';
    };

    for (const y of ['亥', '子', '丑']) expect(corner(y, 'canshi')).toBe('坤');
    for (const y of ['寅', '卯', '辰']) expect(corner(y, 'canshi')).toBe('乾');
    for (const y of ['巳', '午', '未']) expect(corner(y, 'canshi')).toBe('艮');
    for (const y of ['申', '酉', '戌']) expect(corner(y, 'canshi')).toBe('巽');

    // 「初起於乾」 — the count opens there, on the quarter 亥子丑.
    expect(corner('子', 'zoushu')).toBe('乾');
    // 「如奏書在艮，博士在坤也」.
    expect(corner('寅', 'zoushu')).toBe('艮');
    expect(corner('寅', 'boshi')).toBe('坤');
    // 蠶室 is 力士's opposite, so the four fill the four corners and never
    // double up.
    for (const y of BRANCHES) {
      const corners = ['zoushu', 'boshi', 'lishi', 'canshi'].map((g) => corner(y.hanzi, g));
      expect(new Set(corners).size).toBe(4);
    }
  });

  it('seats 破敗五鬼 on the trigram 厯例 enumerates for each stem', () => {
    // 「甲壬年在巽，乙癸年在艮，丙年在坤，丁年在震，戊年在離，己年在坎，
    // 庚年在兑，辛年在乾」 — ten stems, ten answers, nothing derived.
    const at = (yearStem: string): string => {
      const year = Array.from({ length: 60 }, (_, i) => ganzhiOf(i)).find(
        (g) => g.stem.hanzi === yearStem,
      ) as Ganzhi;
      const seat = yearGodsOf(year).find((g) => g.id === 'pobaiwugui')?.seat;
      return seat?.kind === 'trigram' ? seat.trigram.hanzi : '';
    };

    expect(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].map(at)).toEqual([
      '巽', '艮', '坤', '震', '離', '坎', '兌', '乾', '巽', '艮',
    ]);
  });

  it('finds 金神 by running the calendar, not by looking it up', () => {
    // 「假如甲己之年起丙寅順行，得庚午辛未，又壬申癸酉納音為劍鋒金，故甲己年
    // 午未申酉為金神也」 — the branch of every month whose stem is 庚 or 辛,
    // and of every month whose 納音 is metal. It is the one god here that holds
    // more than one bearing.
    const seats = (yearStem: string): string => {
      const year = Array.from({ length: 60 }, (_, i) => ganzhiOf(i)).find(
        (g) => g.stem.hanzi === yearStem,
      ) as Ganzhi;
      const seat = yearGodsOf(year).find((g) => g.id === 'jinshen')?.seat;
      return seat?.kind === 'branches' ? seat.branches.map((b) => b.hanzi).join('') : '';
    };

    expect(seats('甲')).toBe('午未申酉');
    expect(seats('己')).toBe('午未申酉');
    // 五虎遁 repeats every five stems, so the ten years give five answers.
    expect(seats('乙')).toBe(seats('庚'));
    expect(seats('丙')).toBe(seats('辛'));
    expect(new Set(['甲', '乙', '丙', '丁', '戊'].map(seats)).size).toBe(5);
  });

  it('gives the month its four virtues, as the tables enumerate them', () => {
    const virtue = (month: string, id: string): string => {
      const seat = monthGodsOf(branch(month), ganzhiOf(0)).find((g) => g.id === id)?.seat;
      if (!seat) return '—';
      return seat.kind === 'stem' ? seat.stem.hanzi : seat.kind === 'trigram' ? seat.trigram.hanzi : '';
    };

    // 歴例:「月徳者，正五九月在丙，二六十月在甲，三七十一月在壬，四八十二月在
    // 庚」 — the months counted from 寅.
    for (const m of ['寅', '午', '戌']) expect(virtue(m, 'yuede')).toBe('丙');
    for (const m of ['卯', '未', '亥']) expect(virtue(m, 'yuede')).toBe('甲');
    for (const m of ['辰', '申', '子']) expect(virtue(m, 'yuede')).toBe('壬');
    for (const m of ['巳', '酉', '丑']) expect(virtue(m, 'yuede')).toBe('庚');
    // 「月徳合者……正五九月在辛，二六十月在己，三七十一月在丁，四八十二月在乙」
    expect(virtue('寅', 'yuedehe')).toBe('辛');
    expect(virtue('卯', 'yuedehe')).toBe('己');

    // 堪輿經:「天徳者，正月丁，二月坤，三月壬，四月辛，五月乾，六月甲，七月癸，
    // 八月艮，九月丙，十月乙，十一月巽，十二月庚」.
    const months = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    expect(months.map((m) => virtue(m, 'tiande'))).toEqual([
      '丁', '坤', '壬', '辛', '乾', '甲', '癸', '艮', '丙', '乙', '巽', '庚',
    ]);
    // 「四仲之月天徳居四維，故無合也」 — and only there.
    for (const m of ['卯', '午', '酉', '子']) expect(virtue(m, 'tiandehe')).toBe('—');
    for (const m of ['寅', '辰', '巳', '未']) expect(virtue(m, 'tiandehe')).not.toBe('—');
    // 「天徳合者……正月壬，三月丁，四月丙，六月己，七月戊，九月辛，十月庚，
    // 十二月乙是也」.
    expect(['寅', '辰', '巳', '未', '申', '戌', '亥', '丑'].map((m) => virtue(m, 'tiandehe'))).toEqual([
      '壬', '丁', '丙', '己', '戊', '辛', '庚', '乙',
    ]);
  });

  it('marks 所值之日 only where a virtue sits on a stem', () => {
    // A god on a trigram is a bearing and no day can carry it.
    const gods = (month: string, dayIndex: number) => monthGodsOf(branch(month), ganzhiOf(dayIndex));
    // 寅月 天德 is 丁; a 丁 day carries it.
    const dingDay = Array.from({ length: 60 }, (_, i) => i).find(
      (i) => ganzhiOf(i).stem.hanzi === '丁',
    ) as number;
    expect(gods('寅', dingDay).find((g) => g.id === 'tiande')?.onDay).toBe(true);
    // 午月 天德 is 乾, so no day of any stem carries it.
    for (let i = 0; i < 60; i += 1) {
      expect(gods('午', i).find((g) => g.id === 'tiande')?.onDay).toBe(false);
    }
  });

  it('gives the season its two days, and only on the pillars named', () => {
    const carries = (month: string, dayIndex: number, id: string): boolean =>
      shenshaOf(branch(month), ganzhiOf(dayIndex)).find((g) => g.id === id)?.onDay ?? false;
    const pillar = (hanzi: string): number =>
      Array.from({ length: 60 }, (_, i) => i).find(
        (i) => `${ganzhiOf(i).stem.hanzi}${ganzhiOf(i).branch.hanzi}` === hanzi,
      ) as number;

    // 歴例:「天赦者，春戊寅，夏甲午，秋戊申，冬甲子是也」 — a whole pillar, so
    // it is the rarest thing this layer reports.
    expect(carries('寅', pillar('戊寅'), 'tianshe')).toBe(true);
    expect(carries('午', pillar('甲午'), 'tianshe')).toBe(true);
    expect(carries('申', pillar('戊申'), 'tianshe')).toBe(true);
    expect(carries('子', pillar('甲子'), 'tianshe')).toBe(true);
    // The right pillar in the wrong season is not one.
    expect(carries('午', pillar('戊寅'), 'tianshe')).toBe(false);
    // And a whole spring holds exactly one 天赦 pillar in the sixty.
    expect(
      Array.from({ length: 60 }, (_, i) => carries('卯', i, 'tianshe')).filter(Boolean),
    ).toHaveLength(1);

    // 「四相者，春丙丁，夏戊己，秋壬癸，冬甲乙」 — stems, so two days in ten.
    expect(carries('寅', pillar('丙子'), 'sixiang')).toBe(true);
    expect(carries('寅', pillar('丁丑'), 'sixiang')).toBe(true);
    expect(carries('寅', pillar('甲子'), 'sixiang')).toBe(false);
    expect(carries('亥', pillar('甲子'), 'sixiang')).toBe(true);
    // 「惟庚辛者金也，能殺萬物，故不用」 — no season gives them.
    for (const m of ['寅', '巳', '申', '亥']) {
      for (const p of ['庚', '辛']) {
        const day = Array.from({ length: 60 }, (_, i) => i).find(
          (i) => ganzhiOf(i).stem.hanzi === p,
        ) as number;
        expect(carries(m, day, 'sixiang')).toBe(false);
      }
    }
  });

  it('carries the 神煞 of 卷五 on the days their tables name', () => {
    const carries = (month: string, dayBranch: string, id: string): boolean => {
      const day = Array.from({ length: 60 }, (_, i) => ganzhiOf(i)).find(
        (g) => g.branch.hanzi === dayBranch,
      ) as Ganzhi;
      return shenshaOf(branch(month), day).find((g) => g.id === id)?.onDay ?? false;
    };

    // 解神:「正二月申，三四月戌，五六月子，七八月寅，九十月辰，十一月十二月午」.
    for (const [m, b] of [['寅', '申'], ['卯', '申'], ['辰', '戌'], ['午', '子'], ['申', '寅'], ['戌', '辰'], ['子', '午']] as const) {
      expect(carries(m, b, 'jieshen')).toBe(true);
    }
    expect(carries('寅', '戌', 'jieshen')).toBe(false);

    // 九空: 「正月在辰，逆行四季」, which 曹震圭 gives as the branch clashing
    // with the 墓 of the month's triad — 「寅午戌月火庫在戌，辰能衝散也」.
    for (const m of ['寅', '午', '戌']) expect(carries(m, '辰', 'jiukong')).toBe(true);
    for (const m of ['亥', '卯', '未']) expect(carries(m, '丑', 'jiukong')).toBe(true);
    for (const m of ['申', '子', '辰']) expect(carries(m, '戌', 'jiukong')).toBe(true);
    for (const m of ['巳', '酉', '丑']) expect(carries(m, '未', 'jiukong')).toBe(true);

    // 五虛:「春巳酉丑，夏申子辰，秋亥卯未，冬寅午戌」 — the season's 絕 triad.
    for (const b of ['巳', '酉', '丑']) expect(carries('卯', b, 'wuxu')).toBe(true);
    for (const b of ['申', '子', '辰']) expect(carries('午', b, 'wuxu')).toBe(true);
    expect(carries('卯', '申', 'wuxu')).toBe(false);

    // 五合「寅夘日也」 and 五離 「反此則為申酉」 — neither looks at the month.
    for (const m of ['寅', '午', '戌', '子']) {
      expect(carries(m, '寅', 'wuhe')).toBe(true);
      expect(carries(m, '卯', 'wuhe')).toBe(true);
      expect(carries(m, '申', 'wuli')).toBe(true);
      expect(carries(m, '酉', 'wuli')).toBe(true);
      expect(carries(m, '辰', 'wuhe')).toBe(false);
    }
  });

  it('keeps every seat the source gives to more than one god', () => {
    // 「美惡不嫌同位，吉凶不嫌同名」. 卷三 says this twice — of 太陰 and 弔客
    // in the 總論, and of 死符 · 小耗 · 歲枝德 in the 歲枝德 entry — and 大耗
    // stands where 歲破 does. Deduplicating any of them would report a
    // tidiness nobody transmitted.
    for (const year of BRANCHES) {
      const at = (id: string): string => branchSeat(year.hanzi, id);

      expect(at('taiyin')).toBe(at('diaoke'));
      expect(at('suipo')).toBe(at('dahao'));
      expect(at('sifu')).toBe(at('xiaohao'));
      expect(at('sifu')).toBe(at('suizhide'));
    }
  });

  it('turns the page\'s year at 立春, giving the whole of that date to it', () => {
    // 2026 立春 falls on 4 February. The chart's `yearBoundary` never reaches
    // here: a page turns its year on the date, as it turns its month.
    expect(almanacAt(noonAt(2026, 2, 3), context()).year.hanzi).toBe('乙巳');
    expect(almanacAt(noonAt(2026, 2, 4), context()).year.hanzi).toBe('丙午');
    // Every hour of the 立春 date, before the crossing as well as after it.
    for (const hour of [0, 12, 23]) {
      expect(almanacAt(toJulianDay(2026, 2, 4, hour) - 8 / 24, context()).year.hanzi).toBe('丙午');
    }
  });

  it('carries the 節 that opened the month it counted from', () => {
    const page = almanacAt(noonAt(2026, 8, 4), context());
    expect(page.jie.hanzi).toBe('小暑');
    expect(page.jie.kind).toBe('jie');
  });
});
