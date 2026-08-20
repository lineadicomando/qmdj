import { describe, expect, it } from 'vitest';

import { BRANCHES, STEMS, ganzhiFrom } from '../src/ganzhi.js';
import { nayin } from '../src/bazi/nayin.js';
import { resolveMoment } from '../src/pillars.js';
import { initEphemeris } from '../src/ephemeris.js';
import type { ChartError } from '../src/errors.js';
import { DEFAULT_OPTIONS } from '../src/types.js';
import type { ChartOptions, Place } from '../src/types.js';
import {
  BRIGHTNESS,
  BUREAUS,
  DEFAULT_ZIWEI_OPTIONS,
  KUIYUE,
  SIHUA,
  ZIWEI_BY_DAY,
  ZIWEI_HOUSES,
  ZIWEI_STARS,
  computeZiwei,
  type ZiweiBoard,
  type ZiweiOptions,
} from '../src/ziwei/index.js';

const context = initEphemeris();

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };

/** Clock time, as a birth is read off a clock. */
const CLOCK: ChartOptions = { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' };

function board(
  date: string,
  time: string,
  options: Partial<ZiweiOptions> = {},
): ZiweiBoard {
  const moment = resolveMoment(
    { date, time, timezone: 'Asia/Shanghai' },
    BEIJING,
    CLOCK,
    context,
  );
  return computeZiwei(moment, { ...DEFAULT_ZIWEI_OPTIONS, ...options });
}

const branchOf = (b: ZiweiBoard, house: string): string =>
  b.palaces.find((p) => p.house.id === house)!.branch.hanzi;

const seatOf = (b: ZiweiBoard, starId: string): string =>
  b.palaces.find((p) => p.stars.some((s) => s.star.id === starId))!.branch.hanzi;

describe('the table of 紫微, against the arithmetic the tradition also carries', () => {
  // 求商 q = ceil(day / 局), 餘 r = q × 局 − day; count q + r palaces from 寅
  // when r is even, q − r when it is odd. It is not in this book — it is the
  // rule the tradition carries beside the grids — which is exactly what makes
  // it a check on them rather than a restatement of them.
  const received = (day: number, ju: number): string => {
    const q = Math.ceil(day / ju);
    const r = q * ju - day;
    const v = r % 2 === 0 ? q + r : q - r;
    return BRANCHES[(((2 + v - 1) % 12) + 12) % 12]!.id;
  };

  it('agrees in all 150 cells of the five printed grids', () => {
    for (const bureau of BUREAUS) {
      const row = ZIWEI_BY_DAY[bureau.id];
      expect(row).toHaveLength(30);
      for (let day = 1; day <= 30; day += 1) {
        expect(`${bureau.id} ${day} ${row[day - 1]}`).toBe(
          `${bureau.id} ${day} ${received(day, bureau.number)}`,
        );
      }
    }
  });

  it('sends each bureau to the anchor days its verse names', () => {
    // 「初一起丑初二寅」 · 「初一起龍初二牛」 · 「初一尋豬初二龍」 ·
    // 「初一午上二亥宮」 · 「初二騎馬初四龍」.
    expect(ZIWEI_BY_DAY.shuierju[0]).toBe('chou');
    expect(ZIWEI_BY_DAY.shuierju[1]).toBe('yin');
    expect(ZIWEI_BY_DAY.musanju[0]).toBe('chen');
    expect(ZIWEI_BY_DAY.musanju[1]).toBe('chou');
    expect(ZIWEI_BY_DAY.jinsiju[0]).toBe('hai');
    expect(ZIWEI_BY_DAY.jinsiju[1]).toBe('chen');
    expect(ZIWEI_BY_DAY.tuwuju[0]).toBe('wu');
    expect(ZIWEI_BY_DAY.tuwuju[1]).toBe('hai');
    expect(ZIWEI_BY_DAY.huoliuju[1]).toBe('wu');
    expect(ZIWEI_BY_DAY.huoliuju[3]).toBe('chen');
  });
});

describe("安身命例, on the text's own worked example", () => {
  // 「假如正月生子時就在寅宮安身命，丑時逆轉丑安命，順去卯安身，寅時逆轉
  // 子安命，順至辰安身」 — the one place the book lays out its own arithmetic
  // step by step, so it is the one place a check owes nothing to anybody else.
  const cases: [number, string, string][] = [
    [0, '寅', '寅'],
    [1, '丑', '卯'],
    [2, '子', '辰'],
  ];

  for (const [hourIndex, ming, shen] of cases) {
    it(`puts 命 at ${ming} and 身 at ${shen} for a first-month birth at ${BRANCHES[hourIndex]!.hanzi}時`, () => {
      // A first lunar month, and the hour walked over the three the text works.
      const b = board('2023-01-22', `${String(hourIndex * 2).padStart(2, '0')}:30`);
      expect(b.lunar.month).toBe(1);
      expect(b.lunar.day).toBe(1);
      expect(branchOf(b, 'ming')).toBe(ming);
      expect(b.bodyBranch.hanzi).toBe(shen);
    });
  }

  it('cuts the bureau the way the text cuts it, and lands where it says', () => {
    // 「如甲生人安命在寅卻起甲己之年丙為首，是丙寅丁卯爐中火，卻去火局尋某日
    // 生期起紫微帝王，如是正月初一生者是火局，酉宮起初一日」.
    const jiaYearYinMing = ganzhiFrom(
      STEMS.find((s) => s.id === 'bing')!.index,
      BRANCHES.find((br) => br.id === 'yin')!.index,
    );
    expect(jiaYearYinMing.hanzi).toBe('丙寅');
    expect(nayin(jiaYearYinMing).hanzi).toBe('爐中火');
    expect(ZIWEI_BY_DAY.huoliuju[0]).toBe('you');
  });
});

describe('the twelve seats', () => {
  const b = board('1984-05-05', '14:30', { gender: 'male' });

  it("carries the text's own names, in the text's order", () => {
    expect(ZIWEI_HOUSES.map((h) => h.hanzi)).toEqual([
      '命宮', '兄弟', '妻妾', '子女', '財帛', '疾厄',
      '遷移', '奴僕', '官祿', '田宅', '福德', '父母',
    ]);
  });

  it('lays them 逆, against the branches', () => {
    // 「男女俱從逆轉切忌莫順去」.
    for (let n = 1; n < 12; n += 1) {
      const expected = (b.palaces[0]!.branch.index - n + 12) % 12;
      expect(b.palaces[n]!.branch.index).toBe(expected);
    }
  });

  it('covers every branch exactly once', () => {
    expect(new Set(b.palaces.map((p) => p.branch.id)).size).toBe(12);
  });

  it('stems the palaces by 五虎遁 from the year stem', () => {
    // 「甲己之歲起丙寅」 and the rest: whatever the year, 寅 takes the stem
    // the rule gives it and the ring follows.
    const yin = b.palaces.find((p) => p.branch.id === 'yin')!;
    const expected = (((b.yearPillar.stem.index % 5) * 2 + 2) % 10 + 10) % 10;
    expect(yin.stem.index).toBe(expected);
  });
});

describe('the fourteen, and the mirror that seats 天府', () => {
  const b = board('1984-05-05', '14:30');
  const at = (id: string) => BRANCHES.findIndex((br) => br.hanzi === seatOf(b, id));

  it('hangs the five off 紫微 at the gaps the verse names', () => {
    // 「紫微天機逆行旁，隔一陽武天同當，又隔二位廉貞地，空三復見紫微郎」.
    const z = at('ziwei');
    expect(at('tianji')).toBe((z + 11) % 12);
    expect(at('taiyang')).toBe((z + 9) % 12);
    expect(at('wuqu')).toBe((z + 8) % 12);
    expect(at('tiantong')).toBe((z + 7) % 12);
    expect(at('lianzhen')).toBe((z + 4) % 12);
  });

  it('hangs the seven off 天府 順, with three skipped before 破軍', () => {
    // 「天府太陰與貪狼，巨門天相及天梁，七殺空三破軍位，八星順數細推詳」.
    const f = at('tianfu');
    expect(at('taiyin')).toBe((f + 1) % 12);
    expect(at('tanlang')).toBe((f + 2) % 12);
    expect(at('jumen')).toBe((f + 3) % 12);
    expect(at('tianxiang')).toBe((f + 4) % 12);
    expect(at('tianliang')).toBe((f + 5) % 12);
    expect(at('qisha')).toBe((f + 6) % 12);
    expect(at('pojun')).toBe((f + 10) % 12);
  });

  it('mirrors 天府 across the 寅–申 axis, and only there do the two meet', () => {
    // 「天府惟寅申二宮紫府同宮，餘宮俱各填協作對如紫居丑則府居卯矣」.
    for (let z = 0; z < 12; z += 1) {
      const f = ((4 - z) % 12 + 12) % 12;
      if (z === 2 || z === 8) expect(f).toBe(z);
      else expect(f).not.toBe(z);
    }
    // The caption's own instance: 紫 at 丑 puts 府 at 卯.
    expect(((4 - 1) % 12 + 12) % 12).toBe(3);
  });
});

describe('the auxiliaries, each against the verse that places it', () => {
  it('puts 劫 and 空 together at 亥 at 子時, and apart by the hour after', () => {
    // 「亥上起子順安劫，逆向便是天空鄉」, with the prose working three hours:
    // 子時 both at 亥, 丑時 劫 at 子 and 空 at 戌, 午時 both at 巳.
    const zi = board('1984-05-05', '00:30');
    expect(seatOf(zi, 'dijie')).toBe('亥');
    expect(seatOf(zi, 'tiankong')).toBe('亥');
    const chou = board('1984-05-05', '02:30');
    expect(seatOf(chou, 'dijie')).toBe('子');
    expect(seatOf(chou, 'tiankong')).toBe('戌');
    const wu = board('1984-05-05', '12:30');
    expect(seatOf(wu, 'dijie')).toBe('巳');
    expect(seatOf(wu, 'tiankong')).toBe('巳');
  });

  it('flanks 祿存 with 擎羊 ahead and 陀羅 behind', () => {
    // 「祿前擎羊後陀羅」, and the prose: 癸祿在子, 丑宮安擎羊, 亥宮安陀羅.
    const b = board('1984-05-05', '14:30');
    const lu = BRANCHES.findIndex((br) => br.hanzi === seatOf(b, 'lucun'));
    expect(BRANCHES.findIndex((br) => br.hanzi === seatOf(b, 'qingyang'))).toBe((lu + 1) % 12);
    expect(BRANCHES.findIndex((br) => br.hanzi === seatOf(b, 'tuoluo'))).toBe((lu + 11) % 12);
  });

  it('seats 天傷 in 奴僕 and 天使 in 疾厄, whatever the branch', () => {
    // The verse counts six either way; the prose beside it names the palaces,
    // and the palaces are what travel.
    for (const time of ['00:30', '09:30', '14:30', '21:30']) {
      const b = board('1984-05-05', time);
      const shang = b.palaces.find((p) => p.stars.some((s) => s.star.id === 'tianshang'))!;
      const shi = b.palaces.find((p) => p.stars.some((s) => s.star.id === 'tianshi'))!;
      expect(shang.house.id).toBe('nupu');
      expect(shi.house.id).toBe('jie');
    }
  });

  it('puts 天喜 opposite 紅鸞, always', () => {
    // 「坐守此宮紅鸞位，對宮天喜不差移」.
    for (const date of ['1984-05-05', '1990-11-02', '2001-03-17']) {
      const b = board(date, '14:30');
      const luan = BRANCHES.findIndex((br) => br.hanzi === seatOf(b, 'hongluan'));
      const xi = BRANCHES.findIndex((br) => br.hanzi === seatOf(b, 'tianxi'));
      expect(xi).toBe((luan + 6) % 12);
    }
  });

  it('places every star it knows, and no star it does not', () => {
    const b = board('1984-05-05', '14:30');
    const placed = b.palaces.flatMap((p) => p.stars.map((s) => s.star.id));
    // 截路空亡 and 旬中空亡 each take two branches; the rest take one.
    expect(placed.filter((id) => id === 'jielukongwang')).toHaveLength(2);
    expect(placed.filter((id) => id === 'xunzhongkongwang')).toHaveLength(2);
    expect(new Set(placed).size).toBe(ZIWEI_STARS.length);
  });
});

describe('四化, the table 《全書》 prints', () => {
  it('gives 甲 the four the text works out in prose', () => {
    // 「如甲生人廉貞化祿、破軍化權、武曲化科、太陽化忌是也」.
    expect(SIHUA.jia).toEqual(['lianzhen', 'pojun', 'wuqu', 'taiyang']);
  });

  it("keeps this book's readings where the schools part", () => {
    // 戊 gives 科 to 右弼, not 太陽; 庚 gives 科 to 太陰 and 忌 to 天同;
    // 壬 gives 科 to 天府, not 左輔. Recorded so a later table cannot drift
    // in unnoticed.
    expect(SIHUA.wu[2]).toBe('youbi');
    expect(SIHUA.geng[2]).toBe('taiyin');
    expect(SIHUA.geng[3]).toBe('tiantong');
    expect(SIHUA.ren[2]).toBe('tianfu');
  });

  it('transforms exactly four seated stars on any board', () => {
    const b = board('1984-05-05', '14:30');
    const marked = b.palaces
      .flatMap((p) => p.stars)
      .filter((s) => s.transform !== null);
    expect(marked).toHaveLength(4);
    expect(marked.map((s) => s.star.id).sort()).toEqual(
      [...SIHUA[b.yearPillar.stem.id]].sort(),
    );
  });
});

describe('where this book parts from the modern tables, pinned so it cannot drift', () => {
  // Compared exhaustively against `iztro` (npm, MIT) over 544 births — every
  // birth outside a leap month and on a +08:00 clock, four hours apiece, both
  // sexes, 1930 to 2020 — and then against a second edition of 《紫微斗數全書》
  // set from a different 古本. Sixty-three quantities were compared and
  // fifty-seven agreed in every chart. What follows is the residue, sorted by
  // what the second edition did to it.

  it('gives 魁 and 鉞 to 亥 and 酉 for 丙丁, which is a correction and not a reading', () => {
    // The first pass followed 「丙丁豬狗位」 — 狗 is 戌 — off the Wikisource
    // text, and recorded 戌 as this book parting from the modern tables. The
    // second edition prints 豬雞 (酉) with no emendation noted, and an
    // independent implementation computes 酉. The divergence was a corruption
    // in one lineage, and the lineage is the one documented as carrying
    // several errors to the page.
    expect(KUIYUE.bing).toEqual(['hai', 'you']);
    expect(KUIYUE.ding).toEqual(['hai', 'you']);
  });

  it('reads 辛 as 魁 at 午 and 鉞 at 寅, the order the second edition gives', () => {
    // 「六辛逢馬虎」: 馬 first, 虎 second. The Wikisource text transposes them
    // to 虎馬, and the transposition was carried until the second edition and
    // the reference agreed against it.
    expect(KUIYUE.xin).toEqual(['wu', 'yin']);
  });

  it('places 解神 off the birth year, not off the month', () => {
    // 「解神從戌上起子，逆數至當生年太歲上是也」, and both editions read it so.
    // What modern software usually carries under this name is the 月系 star,
    // placed off the month; the two are different quantities wearing one name.
    const b = board('1984-05-05', '14:30');
    const seat = seatOf(b, 'jieshen');
    const expected = BRANCHES[((10 - b.yearPillar.branch.index) % 12 + 12) % 12]!.hanzi;
    expect(seat).toBe(expected);
  });

  it('keeps 火星 and 鈴星 off the hour, which is what `huoling` names', () => {
    // Two births differing only in the hour must seat them identically.
    // Neither edition makes the placement hourly; the widespread practice
    // counts on from these seats by the hour, and agreement with a reference
    // that does falls to exactly the hours whose offset is zero — which is how
    // the divergence was identified rather than guessed.
    const morning = board('1984-05-05', '06:30');
    const evening = board('1984-05-05', '22:30');
    expect(seatOf(morning, 'huoxing')).toBe(seatOf(evening, 'huoxing'));
    expect(seatOf(morning, 'lingxing')).toBe(seatOf(evening, 'lingxing'));
  });

  it('gives 化科 to 天府 at 壬, which both editions agree on', () => {
    // The one 四化 line where this work stands against the modern tables with
    // two witnesses behind it: 「壬梁紫府武宿是」. Later lineages give 科 to
    // 左輔 instead.
    expect(SIHUA.ren[2]).toBe('tianfu');
  });

  it('keeps the 庚 line the editions themselves disagree about, and keeps it one way', () => {
    // 庚日武陰同 here, 庚日武同陰 in the second edition: 科 and 忌 swapped
    // between 太陰 and 天同. The famous split at 庚, carried as a variant
    // rather than settled. The reading kept is the one the reference also
    // computes; the other is in docs/sources.md.
    expect(SIHUA.geng[2]).toBe('taiyin');
    expect(SIHUA.geng[3]).toBe('tiantong');
  });
});

describe('what the second edition confirmed rather than changed', () => {
  it('prints both repaired cells whole', () => {
    // 木三局's 寅 reads 初三 初五 there, where the first witness printed
    // 初三 初九 and 初五 stood nowhere; 金四局's 亥 reads 初一 三十, where the
    // first printed 初一 alone. A rule and a witness, agreeing where one page
    // failed.
    expect(ZIWEI_BY_DAY.musanju[4]).toBe('yin');
    expect(ZIWEI_BY_DAY.musanju[2]).toBe('yin');
    expect(ZIWEI_BY_DAY.jinsiju[29]).toBe('hai');
    expect(ZIWEI_BY_DAY.jinsiju[0]).toBe('hai');
  });

  it('opens the 大限 beside the 命宮 in both editions', () => {
    // 「陽男陰女從命前一宮起 是父母宮。陰男陽女從命後一宮起 是兄弟宮」 —
    // the second edition drops the words 順行 and 逆行 and keeps the palaces,
    // which is the half that decides where the run opens.
    const b = board('1984-05-05', '14:30', { gender: 'male' });
    const first = b.palaces.find((p) => p.majorLimit?.from === b.bureau.number)!;
    expect(first.house.id).not.toBe('ming');
  });
});

describe('the two placements the other transmission also carries', () => {
  // 紫微斗數 names two boards. The 十八飛星 line — 《萬曆續道藏》紫微斗數 and
  // the 《十八飛星策天紫微斗數全集》, two witnesses of one work — has eighteen
  // stars counted off the year branch, no 五行局 and no 天府, and it shares
  // with 《全書》 exactly two rules. They agree character for character, which
  // makes 天刑 and 天姚 the only quantities on this board resting on two
  // lineages instead of one. Pinned here so a later hand does not "fix" the
  // best-attested placements in the file. See docs/sources.md.

  it('counts 天刑 from 酉 and 天姚 from 丑, both forward by the lunar month', () => {
    // 《全書》 卷二: 「天刑星从酉上起正月顺至本生月便安之」·
    // 「天姚星从丑上起正月顺至本生月即安之」. The 全集: 「凡起天刑，從酉上起，
    // 正月順數，至本人生月安之」·「天姚丑上順正月」.
    for (const date of ['1984-05-05', '1990-11-02', '2001-03-17', '1962-01-09']) {
      const b = board(date, '14:30');
      const month = b.lunar.month;
      const at = (start: number) => BRANCHES[(start + month - 1) % 12]!.hanzi;
      expect(seatOf(b, 'tianxing')).toBe(at(9));
      expect(seatOf(b, 'tianyao')).toBe(at(1));
    }
  });

  it('holds 天刑 eight palaces ahead of 天姚 on any board', () => {
    // 酉 is eight forward of 丑 and both walk by the same month, so the gap is
    // the invariant the two verses amount to together.
    for (const date of ['1984-05-05', '1990-11-02', '2001-03-17', '1962-01-09']) {
      const b = board(date, '09:30');
      const xing = BRANCHES.findIndex((br) => br.hanzi === seatOf(b, 'tianxing'));
      const yao = BRANCHES.findIndex((br) => br.hanzi === seatOf(b, 'tianyao'));
      expect(xing).toBe((yao + 8) % 12);
    }
  });
});

describe('the seven grades', () => {
  it('grades eighteen stars in all twelve branches', () => {
    const twelve = Object.entries(BRIGHTNESS).filter(
      ([, row]) => Object.keys(row!).length === 12,
    );
    expect(twelve).toHaveLength(18);
  });

  it('grades 祿存, 擎羊 and 陀羅 in exactly the eight they can reach', () => {
    // Not a gap: 祿存 follows the year stem, which never sends it to the four
    // 墓庫, and 擎羊 and 陀羅 flank it. The table knowing that is what says it
    // was read off the page correctly.
    for (const id of ['lucun', 'qingyang', 'tuoluo'] as const) {
      expect(Object.keys(BRIGHTNESS[id]!)).toHaveLength(8);
    }
    expect(Object.keys(BRIGHTNESS.lucun!).sort()).toEqual(
      ['hai', 'mao', 'shen', 'si', 'wu', 'yin', 'you', 'zi'],
    );
  });

  it('agrees with the coarse summaries of 卷三 on 擎羊 and 陀羅', () => {
    // 「擎羊 廟辰戌丑未 陷子午卯酉」 · 「陀羅 廟辰戌丑未 陷巳亥寅申」.
    for (const branch of ['chen', 'xu', 'chou', 'wei'] as const) {
      expect(BRIGHTNESS.qingyang![branch]).toBe('miao');
      expect(BRIGHTNESS.tuoluo![branch]).toBe('miao');
    }
    for (const branch of ['zi', 'wu', 'mao', 'you'] as const) {
      expect(BRIGHTNESS.qingyang![branch]).toBe('luoxian');
    }
    for (const branch of ['si', 'hai', 'yin', 'shen'] as const) {
      expect(BRIGHTNESS.tuoluo![branch]).toBe('luoxian');
    }
  });

  it('agrees with 卷三 on 紫微, which it says never falls', () => {
    // 「紫微 廟丑未午 旺寅申卯酉巳亥 平子 無陷」.
    expect(BRIGHTNESS.ziwei!.chou).toBe('miao');
    expect(BRIGHTNESS.ziwei!.wei).toBe('miao');
    expect(BRIGHTNESS.ziwei!.wu).toBe('miao');
    expect(BRIGHTNESS.ziwei!.zi).toBe('pinghe');
    expect(Object.values(BRIGHTNESS.ziwei!)).not.toContain('luoxian');
  });
});

describe('the limits, and what a missing gender costs', () => {
  it('opens the 大限 beside the 命宮 and never in it', () => {
    // 「陽男陰女從命前一宮起順行 是父母宮。陰男陽女從命後一宮起逆行 是兄弟宮」.
    for (const gender of ['male', 'female'] as const) {
      const b = board('1984-05-05', '14:30', { gender });
      const first = b.palaces.find((p) => p.majorLimit?.from === b.bureau.number)!;
      expect(['fumu', 'xiongdi']).toContain(first.house.id);
      expect(first.house.id).not.toBe('ming');
    }
  });

  it("starts the first decade at the bureau's own number", () => {
    const b = board('1984-05-05', '14:30', { gender: 'male' });
    const froms = b.palaces.map((p) => p.majorLimit!.from).sort((x, y) => x - y);
    expect(froms[0]).toBe(b.bureau.number);
    expect(froms).toEqual(
      Array.from({ length: 12 }, (_, n) => b.bureau.number + n * 10),
    );
  });

  it('walks the 小限 forward for a man and backward for a woman', () => {
    // 「不論陰陽男俱順數不論陰陽女俱逆數」.
    const man = board('1984-05-05', '14:30', { gender: 'male' });
    const woman = board('1984-05-05', '14:30', { gender: 'female' });
    const ageOne = (b: ZiweiBoard) =>
      b.palaces.find((p) => p.minorLimitAge === 1)!.branch.index;
    expect(ageOne(man)).toBe(ageOne(woman));
    const ageTwo = (b: ZiweiBoard) =>
      b.palaces.find((p) => p.minorLimitAge === 2)!.branch.index;
    expect(ageTwo(man)).toBe((ageOne(man) + 1) % 12);
    expect(ageTwo(woman)).toBe((ageOne(woman) + 11) % 12);
  });

  it('puts the 童限 on the six palaces the verse names', () => {
    // 「一命二財三疾厄，四妻五福六官祿」.
    const b = board('1984-05-05', '14:30');
    const by = (age: number) =>
      b.palaces.find((p) => p.childLimit.includes(age))!.house.id;
    expect(by(1)).toBe('ming');
    expect(by(2)).toBe('caibo');
    expect(by(3)).toBe('jie');
    expect(by(4)).toBe('qiqie');
    expect(by(5)).toBe('fude');
    expect(by(6)).toBe('guanlu');
  });

  it('leaves out the four that need a gender, and keeps the seats', () => {
    const b = board('1984-05-05', '14:30');
    expect(b.palaces.every((p) => p.majorLimit === null)).toBe(true);
    expect(b.palaces.every((p) => p.minorLimitAge === null)).toBe(true);
    expect(b.palaces.every((p) => p.changsheng === null)).toBe(true);
    expect(b.palaces.every((p) => p.boshi === null)).toBe(true);
    expect(b.palaces.flatMap((p) => p.stars).length).toBeGreaterThan(0);
    expect(b.palaces.some((p) => p.childLimit.length > 0)).toBe(true);
  });

  it('walks both rings over all twelve when a gender is given', () => {
    const b = board('1984-05-05', '14:30', { gender: 'female' });
    expect(new Set(b.palaces.map((p) => p.changsheng!.id)).size).toBe(12);
    expect(new Set(b.palaces.map((p) => p.boshi!.id)).size).toBe(12);
    // 博士 itself stands on 祿存, which is what the ring is counted from.
    const boshi = b.palaces.find((p) => p.boshi!.id === 'boshi')!;
    expect(boshi.stars.some((s) => s.star.id === 'lucun')).toBe(true);
  });
});

describe('the masters', () => {
  it('takes 命主 from the branch of the 命宮', () => {
    // 「假如午宮安命尋破軍星在何宮即命主也，子宮安命尋貪狼星在何宮即命主也」.
    for (const time of ['00:30', '04:30', '08:30', '12:30', '16:30', '20:30']) {
      const b = board('1984-05-05', time);
      const branch = b.palaces[0]!.branch.id;
      if (branch === 'wu') expect(b.lifeMaster.id).toBe('pojun');
      if (branch === 'zi') expect(b.lifeMaster.id).toBe('tanlang');
    }
  });

  it('takes 身主 from the branch of the birth year', () => {
    // 「丑未人天相星，寅申人天梁星，卯酉人天同星，辰戌人文昌星，巳亥人天機星」.
    const pairs: [string, string][] = [
      ['1985-05-05', 'tianxiang'], // 乙丑
      ['1986-05-05', 'tianliang'], // 丙寅
      ['1987-05-05', 'tiantong'], // 丁卯
      ['1988-05-05', 'wenchang'], // 戊辰
      ['1989-05-05', 'tianji'], // 己巳
    ];
    for (const [date, expected] of pairs) {
      expect(board(date, '14:30').bodyMaster.id).toBe(expected);
    }
  });
});

describe('the options', () => {
  it('refuses what it has not implemented rather than substituting', () => {
    for (const [option, value] of [
      ['leapMonth', 'current'],
      ['leapMonth', 'split'],
      ['huoling', 'hour'],
      ['daxian', 'ming'],
    ] as const) {
      let code: string | undefined;
      try {
        board('1984-05-05', '14:30', { [option]: value } as never);
      } catch (error) {
        code = (error as ChartError).code;
      }
      expect(`${option}=${value}: ${code}`).toBe(`${option}=${value}: OPTION_NOT_IMPLEMENTED`);
    }
  });

  it('carries the options that produced it', () => {
    const b = board('1984-05-05', '14:30', { gender: 'male' });
    expect(b.options.sihua).toBe('quanshu');
    expect(b.options.gender).toBe('male');
  });

  it('lays two different boards on the two year boundaries, and says which', () => {
    // A birth after 正月初一 but before 立春 is the whole of why this is a
    // parameter: the year stem carries the 四化 and 祿存.
    const chunjie = board('1985-02-20', '14:30', { yearBoundary: 'chunjie' });
    const lichun = board('1985-02-20', '14:30', { yearBoundary: 'lichun' });
    expect(chunjie.yearPillar.hanzi).toBe(lichun.yearPillar.hanzi);
    expect(chunjie.options.yearBoundary).toBe('chunjie');
    expect(lichun.options.yearBoundary).toBe('lichun');
  });
});

describe('a leap month counts as the month after it', () => {
  it('counts a leap fourth month as a fifth', () => {
    // 「凡有閏月俱要依此為例」. 2020 had a leap fourth month.
    const b = board('2020-06-01', '14:30');
    expect(b.lunar.leap).toBe(true);
    expect(b.lunar.month).toBe(4);
    expect(b.countedMonth).toBe(5);
  });
});
