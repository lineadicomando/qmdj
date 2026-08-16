import { describe, expect, it } from 'vitest';
import { initEphemeris } from '../src/ephemeris.js';
import { yearGanzhi } from '../src/ganzhi.js';
import { resolveTime } from '../src/time.js';
import {
  DEFAULT_TAIYI_OPTIONS,
  TAIYI_GODS,
  taiyiBoard,
  taiyiJu,
  taiyiPatternName,
  taiyiYearAt,
  taiyiYearOf,
  type TaiyiOptions,
} from '../src/taiyi.js';

/**
 * 太乙 is checked against the text that states it, because nothing else can.
 *
 * There is no `lunar-javascript` here. Nothing open computes this board, and
 * the closed programs that do disagree with each other — so the reference is
 * 《太乙金鏡式經》 itself, which happens to be unusually well equipped to be
 * one. 卷三 prints a 立成 of seventy-two rows twice over, 卷一, 卷六 and 卷九
 * work individual boards, and 卷二 lists twenty-six datable 甲子 years against
 * the 紀 each falls in. That is the tradition auditing itself rather than an
 * independent implementation, and it is **weaker evidence** than the pillars
 * have — every surface says so — but it is evidence over the whole domain: the
 * tables below cover all one hundred and forty-four rows of both 局, and every
 * quantity in them is produced by the same code the year board is.
 */

const options: TaiyiOptions = DEFAULT_TAIYI_OPTIONS;

/**
 * 卷三 陽局天目地目計神主客大小將立成, all seventy-two rows.
 *
 * Each row is 太乙宮, 天目, 主算, 客目 (始擊), 客算, 計神 — the columns the
 * table prints for every row. 大將 and 參將 it prints only for the first,
 * which is why those are checked from the worked boards further down.
 */
const YANG_JU = `
1  乾 武德 7  大武 13 寅
2  乾 太蔟 6  陰主 1  丑
3  乾 陰主 1  大義 40 子
4  離 陰德 25 陽德 17 亥
5  離 陰德 25 呂申 14 戌
6  離 大義 25 太陽 10 酉
7  艮 地主 8  太神 25 申
8  艮 陽德 1  大武 22 未
9  艮 和德 3  太蔟 15 午
10 震 呂申 1  陰德 12 巳
11 震 高叢 4  陽德 4  辰
12 震 太陽 37 呂申 1  卯
13 兌 太炅 18 太陽 19 寅
14 兌 太神 10 大威 9  丑
15 兌 大威 9  大武 7  子
16 坤 天道 1  太蔟 33 亥
17 坤 大武 7  大義 27 戌
18 坤 大武 7  地主 26 酉
19 坎 武德 8  和德 32 申
20 坎 太蔟 7  太陽 26 未
21 坎 陰主 2  太神 17 午
22 巽 陰德 16 天道 30 巳
23 巽 陰德 16 武德 23 辰
24 巽 大義 16 陰主 17 卯
25 乾 地主 39 大義 40 寅
26 乾 陽德 32 和德 31 丑
27 乾 和德 31 高叢 28 子
28 離 呂申 14 太炅 9  亥
29 離 高叢 13 天道 39 戌
30 離 太陽 10 武德 32 酉
31 艮 太炅 33 陰主 10 申
32 艮 太神 25 地主 8  未
33 艮 大威 24 和德 3  午
34 震 天道 26 高叢 4  巳
35 震 大武 25 太神 28 辰
36 震 大武 25 大威 27 卯
37 兌 武德 1  大武 7  寅
38 兌 太蔟 6  陰主 35 丑
39 兌 陰主 25 大義 34 子
40 坤 陰德 27 陽德 19 亥
41 坤 陰德 27 呂申 16 戌
42 坤 大義 27 太陽 12 酉
43 坎 地主 8  太神 17 申
44 坎 陽德 33 大武 14 未
45 坎 和德 32 太蔟 7  午
46 巽 呂申 5  陰德 16 巳
47 巽 高叢 4  陽德 8  辰
48 巽 太陽 1  呂申 5  卯
49 乾 太炅 24 太陽 25 寅
50 乾 太神 6  大威 15 丑
51 乾 大威 15 大武 13 子
52 離 天道 39 太蔟 31 亥
53 離 大武 38 大義 25 戌
54 離 大武 38 地主 24 酉
55 艮 武德 16 和德 3  申
56 艮 太蔟 15 太陽 34 未
57 艮 陰主 10 太神 25 午
58 震 陰德 12 天道 26 巳
59 震 陰德 12 武德 19 辰
60 震 大義 12 陰主 13 卯
61 兌 地主 33 大義 34 寅
62 兌 陽德 26 和德 25 丑
63 兌 和德 25 高叢 22 子
64 坤 呂申 16 太炅 11 亥
65 坤 高叢 15 天道 1  戌
66 坤 太陽 12 武德 34 酉
67 坎 太炅 25 陰主 2  申
68 坎 太神 17 地主 8  未
69 坎 大威 16 和德 32 午
70 巽 天道 30 高叢 4  巳
71 巽 大武 29 太神 32 辰
72 巽 大武 29 大威 31 卯
`;

/** 卷三 隂局天目地目計神主客大小將立成, the same seventy-two counted backwards. */
const YIN_JU = `
1  巽 呂申 5  大武 29 申
2  巽 高叢 4  陰主 17 未
3  巽 太陽 1  大義 16 午
4  坎 太炅 25 陽德 33 巳
5  坎 太炅 25 呂申 30 辰
6  坎 太神 17 太陽 26 卯
7  坤 大威 2  太神 3  寅
8  坤 天道 1  大武 7  丑
9  坤 大武 7  太蔟 33 子
10 兌 武德 1  陰德 34 亥
11 兌 太蔟 6  陽德 36 戌
12 兌 陰主 35 呂申 23 酉
13 震 陰德 12 太陽 37 申
14 震 大義 12 大威 27 未
15 震 地主 11 大武 29 午
16 艮 陽德 1  太蔟 15 巳
17 艮 和德 3  大義 9  辰
18 艮 和德 3  地主 8  卯
19 離 呂申 14 和德 16 寅
20 離 高叢 13 太陽 10 丑
21 離 太陽 10 太神 1  子
22 乾 太炅 24 天道 14 亥
23 乾 太炅 24 武德 7  戌
24 乾 太神 16 陰主 1  酉
25 巽 大威 21 大義 16 申
26 巽 天道 31 和德 7  未
27 巽 大武 39 高叢 4  午
28 坎 武德 8  太炅 25 巳
29 坎 太蔟 7  天道 15 辰
30 坎 陰主 2  武德 8  卯
31 坤 陰德 27 陰主 28 寅
32 坤 大義 27 地主 26 丑
33 坤 地主 26 和德 18 子
34 兌 陽德 26 高叢 22 亥
35 兌 和德 25 太神 10 戌
36 兌 和德 25 大威 9  酉
37 震 呂申 1  大威 25 申
38 震 高叢 4  陰主 13 未
39 震 太陽 37 大義 12 午
40 艮 太炅 33 陽德 1  巳
41 艮 太炅 33 呂申 38 辰
42 艮 太神 25 太陽 34 卯
43 離 大威 2  大武 38 寅
44 離 天道 39 太蔟 31 丑
45 離 大武 38 太蔟 31 子
46 乾 武德 7  陰德 2  亥
47 乾 太蔟 6  陽德 32 戌
48 乾 陰主 1  呂申 29 酉
49 巽 陰德 16 太陽 1  申
50 巽 大義 16 大威 31 未
51 巽 地主 15 大武 29 午
52 坎 陽德 33 太蔟 7  巳
53 坎 和德 32 大義 1  辰
54 坎 和德 32 地主 8  卯
55 坤 呂申 16 和德 18 寅
56 坤 高叢 15 太陽 12 丑
57 坤 太陽 12 太神 3  子
58 兌 太炅 18 天道 8  亥
59 兌 太炅 18 武德 1  戌
60 兌 太神 10 陰主 35 酉
61 震 大威 27 大義 12 申
62 震 天道 26 和德 3  未
63 震 大武 25 高叢 4  午
64 艮 武德 16 太炅 33 巳
65 艮 太蔟 15 天道 23 辰
66 艮 陰主 10 武德 16 卯
67 離 陰德 25 陰主 26 寅
68 離 大義 25 地主 24 丑
69 離 地主 24 和德 16 子
70 乾 陽德 22 高叢 28 亥
71 乾 和德 31 太神 16 戌
72 乾 和德 31 大威 15 酉
`;

interface Row {
  ju: number;
  palace: string;
  wenchang: string;
  hostCount: number;
  shiji: string;
  guestCount: number;
  jishen: string;
}

function rows(table: string): Row[] {
  return table
    .trim()
    .split('\n')
    .map((line) => {
      const [ju, palace, wenchang, host, shiji, guest, jishen] = line.trim().split(/\s+/) as string[];
      return {
        ju: Number(ju),
        palace: palace as string,
        wenchang: wenchang as string,
        hostCount: Number(host),
        shiji: shiji as string,
        guestCount: Number(guest),
        jishen: jishen as string,
      };
    });
}

/**
 * Where the printed tables and the procedure they print disagree.
 *
 * Fourteen cells out of eight hundred and sixty-four, across twelve rows, and
 * **thirteen of them are settled by the text against itself**: the same
 * configuration — the same eye,
 * on the same seat, with 太乙 in the same palace — is printed elsewhere in one
 * of the two tables with the value the procedure gives, so the odd cell is a
 * copying error and the witness is named beside it. They are kept here rather
 * than corrected in the fixture above, because a fixture quietly edited to
 * agree with the code under test has stopped being evidence.
 *
 * The fourteenth, 隂局 46, has no parallel row. It is the only place either
 * table shows a 正宮 eye standing in 太乙's own palace at 一宮, and 陽局 43
 * shows the same case at 八宮 — 地主 for 天目, 太乙 in 八宮, 主算 八 — which
 * is the rule 「至太乙宫止」 applied to a walk of no length. One is what that
 * rule gives at 一宮; the table prints 二.
 */
const ERRATA: readonly {
  dun: 'yang' | 'yin';
  ju: number;
  column: keyof Row;
  computed: string | number;
  witness: string;
}[] = [
  { dun: 'yang', ju: 39, column: 'hostCount', computed: 35, witness: '隂局 60, and 陽局 38 beside it' },
  { dun: 'yang', ju: 50, column: 'hostCount', computed: 16, witness: '隂局 24' },
  { dun: 'yin', ju: 11, column: 'guestCount', computed: 26, witness: '陽局 62' },
  { dun: 'yin', ju: 15, column: 'guestCount', computed: 25, witness: '陽局 35 and 隂局 63' },
  { dun: 'yin', ju: 25, column: 'hostCount', computed: 31, witness: '隂局 50' },
  { dun: 'yin', ju: 26, column: 'hostCount', computed: 30, witness: '陽局 70' },
  { dun: 'yin', ju: 27, column: 'hostCount', computed: 29, witness: '卷一 推太乙當時法, which states 主筭得二十九' },
  { dun: 'yin', ju: 37, column: 'shiji', computed: '大武', witness: '隂局 1, on the same 天目 and 計神' },
  { dun: 'yin', ju: 43, column: 'shiji', computed: '太神', witness: '隂局 21' },
  { dun: 'yin', ju: 43, column: 'guestCount', computed: 1, witness: '隂局 21' },
  { dun: 'yin', ju: 44, column: 'shiji', computed: '大武', witness: '陽局 53 and 54' },
  { dun: 'yin', ju: 44, column: 'guestCount', computed: 38, witness: '陽局 53 and 54' },
  { dun: 'yin', ju: 46, column: 'guestCount', computed: 1, witness: '陽局 43, the same case at 八宮' },
  { dun: 'yin', ju: 70, column: 'hostCount', computed: 32, witness: '陽局 26' },
];

describe('the 立成 of seventy-two', () => {
  for (const [dun, table] of [
    ['yang', YANG_JU],
    ['yin', YIN_JU],
  ] as const) {
    it(`reproduces every row of the ${dun} 局`, () => {
      const printed = rows(table);
      expect(printed).toHaveLength(72);

      // The printed table with its known errata applied, each one carrying the
      // row elsewhere in the text that settles it.
      const expected = printed.map((row) => {
        const amended = { ...row };
        for (const erratum of ERRATA) {
          if (erratum.dun !== dun || erratum.ju !== row.ju) continue;
          (amended[erratum.column] as string | number) = erratum.computed;
        }
        return amended;
      });

      const produced = printed.map((row) => {
        const board = taiyiJu(row.ju, dun);
        return {
          ju: row.ju,
          palace: board.taiyi.palace.hanzi,
          wenchang: board.wenchang.hanzi,
          hostCount: board.host.count,
          shiji: board.shiji.hanzi,
          guestCount: board.guest.count,
          jishen: board.jishen.hanzi,
        };
      });

      expect(produced).toEqual(expected);
    });
  }

  it('diverges from the printed tables in those cells and no others', () => {
    const diverging = (['yang', 'yin'] as const).flatMap((dun) =>
      rows(dun === 'yang' ? YANG_JU : YIN_JU).flatMap((row) => {
        const board = taiyiJu(row.ju, dun);
        const produced: Record<string, string | number> = {
          palace: board.taiyi.palace.hanzi,
          wenchang: board.wenchang.hanzi,
          hostCount: board.host.count,
          shiji: board.shiji.hanzi,
          guestCount: board.guest.count,
          jishen: board.jishen.hanzi,
        };
        return Object.keys(produced)
          .filter((column) => produced[column] !== row[column as keyof Row])
          .map((column) => `${dun} ${row.ju} ${column}`);
      }),
    );

    expect(new Set(diverging)).toEqual(
      new Set(ERRATA.map((erratum) => `${erratum.dun} ${erratum.ju} ${erratum.column}`)),
    );
  });

  it('walks three years to a palace and twenty-four to the circuit', () => {
    const walked = Array.from({ length: 24 }, (_, index) => taiyiJu(index + 1, 'yang'));
    expect(walked.map((board) => board.taiyi.palace.number)).toEqual([
      1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9,
    ]);
    expect(walked.map((board) => board.taiyi.year)).toEqual([
      1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3,
    ]);
  });
});

/**
 * The boards the text works out in words, each naming its own 局.
 *
 * These are the only place 大將 and 參將 are printed often enough to check,
 * and they are what settles the 參將: the text never states the step, and
 * eleven worked boards put it a quarter turn clockwise from the 大將 without
 * a single exception.
 */
describe('the worked boards', () => {
  const worked = [
    // 卷六 推白雲捲空術三 — 「太乙在一宫，武徳為天目，主筭七，大將七，參將
    // 一，寅為計神，始擊将臨大武，客筭十三，大將三，參將九」. The chapter
    // calls it 第二局 and prints the first; the 局 is what the values fit.
    { ju: 1, dun: 'yang', host: [7, 7, 1], guest: [13, 3, 9] },
    // 卷六 推雷公入水術五 — 第一甲子元十三局.
    { ju: 13, dun: 'yang', host: [18, 8, 4], guest: [19, 9, 7] },
    // 卷六 推白龍得雲術六 — 第一甲子元二十二局.
    { ju: 22, dun: 'yang', host: [16, 6, 8], guest: [30, 3, 9] },
    // 卷六 推逥軍無言術七 — 第一紀第一甲子元二十八局.
    { ju: 28, dun: 'yang', host: [14, 4, 2], guest: [9, 9, 7] },
    // 卷九 推敵使言虚實 — 陽遁第一紀二十五局, 「客筭四十，大將四宫，參將二
    // 宫」. The count that settles how a whole number of tens reduces.
    { ju: 25, dun: 'yang', guest: [40, 4, 2] },
    // 卷九 推敵國有無間諜 — 陽遁第一紀第二局, 「客計得一，客大將一」.
    { ju: 2, dun: 'yang', guest: [1, 1, 3] },
    // 卷九 推敵國動靜 — 隂遁第三紀第五十二局, 「客計得七，大将七，參将一」.
    { ju: 52, dun: 'yin', guest: [7, 7, 1] },
    // 卷一 推太乙當時法 — 隂遁第六紀壬子元二十七局, 「太乙在九宫，大武為天
    // 目，午為計神，巳為合神，主筭得二十九，主大將在九宫，主參將在七宫…客
    // 筭得單四，客大將在四宫，參將在二宫」. The one worked board that states
    // a 主算 the 立成 prints differently, and it agrees with the procedure.
    { ju: 27, dun: 'yin', host: [29, 9, 7], guest: [4, 4, 2] },
  ] as const;

  for (const board of worked) {
    it(`agrees with the ${board.dun} board at 局 ${board.ju}`, () => {
      const cast = taiyiJu(board.ju, board.dun);
      for (const [side, expected] of [
        ['host', 'host' in board ? board.host : undefined],
        ['guest', 'guest' in board ? board.guest : undefined],
      ] as const) {
        if (!expected) continue;
        const party = cast[side];
        expect([party.count, party.general.number, party.assistant?.number]).toEqual([...expected]);
      }
    });
  }

  it('reads the guest count of 卷九 第八局 off the board', () => {
    // 「陽遁第一紀第八局…太乙在三宫…陽徳為天目，未為計神，始擊將在大武，
    // 客筭二十二」.
    const cast = taiyiJu(8, 'yang');
    expect(cast.taiyi.palace.number).toBe(3);
    expect(cast.wenchang.hanzi).toBe('陽德');
    expect(cast.jishen.hanzi).toBe('未');
    expect(cast.shiji.hanzi).toBe('大武');
    expect(cast.guest.count).toBe(22);
  });
});

/**
 * 開元十二年甲子, the year the whole epoch is anchored on.
 *
 * The text states the board of this year piece by piece across four chapters,
 * and it is the one year every count in it can be checked at once.
 */
describe('開元十二年 (724)', () => {
  const board = taiyiBoard({ year: 724 }, options);

  it('is 甲子, which is what the count of 積年 has to yield', () => {
    // 「置上元甲子積年，以三百六十去之，不盡以六十去之，又不盡，命甲子筭外」.
    expect(board.sui.hanzi).toBe('甲子');
    expect(board.accumulated.taiyi).toBe(1_937_281);
  });

  it('stands in the third 紀, which 卷二 says it does', () => {
    // 「大唐開元十二年甲子入第三紀」.
    expect(board.liuji).toEqual({ number: 3, year: 1 });
  });

  it('falls on 局 49 and opens the walk of 太乙', () => {
    expect(board.ju).toBe(49);
    expect(board.taiyi.palace.number).toBe(1);
    expect(board.taiyi.palace.hanzi).toBe('乾');
    expect(board.taiyi.year).toBe(1);
  });

  it('seats the two eyes and the two counts as the 立成 prints them', () => {
    expect(board.wenchang.hanzi).toBe('太炅');
    expect(board.shiji.hanzi).toBe('太陽');
    expect(board.host.count).toBe(24);
    expect(board.guest.count).toBe(25);
    expect(board.jishen.hanzi).toBe('寅');
    // 卷一 推六紀月建法: 「太乙在一宫，武徳為天目，計神寅，合神丑」.
    expect(board.heshen.hanzi).toBe('丑');
  });

  it('takes 開門 as its 直使, which 卷一 checks against a date', () => {
    // 「假令今開元十二年甲子，即開門為直使，至三十一年甲午嵗即休門為直使」.
    expect(board.gate.gate.hanzi).toBe('開門');
    expect(board.gate.year).toBe(1);
    expect(taiyiBoard({ year: 754 }, options).gate.gate.hanzi).toBe('休門');
    expect(taiyiBoard({ year: 753 }, options).gate.gate.hanzi).toBe('開門');
  });

  it('puts 五福 in 遼東 in its eleventh year, which the text says outright', () => {
    // 「今開元十二年甲子在遼東十一年也」 — 黃始宮, 在遼東之艮地.
    expect(board.wufu.palace.hanzi).toBe('黃始宮');
    expect(board.wufu.palace.palace.hanzi).toBe('艮');
    expect(board.wufu.year).toBe(11);
  });

  it('has 大遊 three hundred and seventy-one years into its era', () => {
    // 「今從晉穆帝永和十年甲寅為上元，至今開元十二年甲子計三百七十一年也，
    // 不足以紀法除之，即為入上元第一紀三百七十一年」.
    expect(board.accumulated.wufu % 4320).toBe(371);
  });

  /**
   * 卷五 gives the three bases three different periods over the same ring of
   * twelve, and the period travels beside the count because the count alone is
   * unreadable in a way that does not look unreadable.
   *
   * 民基 is the one that shows why. It moves a fief every year, so its count is
   * the constant 1 and can never say anything else — and printed as a bare `1`
   * beside a sovereign at `23` it was read as a base newly begun, which is a
   * reading of something nobody computed. The invariant is the point: whatever
   * the year, the people are 1 of 1.
   */
  /**
   * The sentence that earns the fortune, carried beside it.
   *
   * 卷三 states each condition three times over — an 經曰 giving the trigger, a
   * 之義 or 者…也 saying what the shape *is*, and 若… / 嵗計遇之… clauses saying
   * what will befall the realm. Only the middle kind travels, for the reason
   * `Pattern.valence` travels. What is asserted here is the line between the
   * two: the characterisation is in, the omen is out, and neither is this
   * engine's words.
   */
  it('carries what 卷三 says each condition is, and none of what it foretells', () => {
    const clauses = new Map(
      (['yan', 'ji', 'po', 'qiu', 'guan', 'ge'] as const).map((id) => [
        id,
        taiyiPatternName(id).meaning,
      ]),
    );

    expect(clauses.get('yan')).toBe('掩襲刼殺之義');
    expect(clauses.get('qiu')).toBe('囚者，簒戮之義也');
    expect(clauses.get('ge')).toBe('言政事上下格也');

    for (const [id, clause] of clauses) {
      expect(clause, id).toBeDefined();
      // The omens the chapter puts around each one. A clause that grew to
      // include any of these would be the dynastic layer arriving inside the
      // quantity that was admitted precisely because it is not that.
      for (const omen of ['嵗計遇', '王綱失序', '人君慎之', '大凶', '必敗', '禳']) {
        expect(clause, `${id} carries the omen ${omen}`).not.toContain(omen);
      }
    }
  });

  /**
   * 對 has no such sentence, and the absence is the entry rather than a gap
   * somebody forgot to fill. 卷三 gives it a trigger and then a 若…皆為… list of
   * events — 「大臣懐二心，君逐良將…」 — and nothing that says what 對 *is*.
   * Where the sources say nothing, the silence travels; a seventh line invented
   * so the table looked even would be this engine founding a school.
   */
  it('leaves 對 without one, because 卷三 gives it none', () => {
    expect(taiyiPatternName('dui').meaning).toBeUndefined();
    expect(taiyiPatternName('dui').valence).toBeDefined();
  });

  it('carries the period of each base, so a constant cannot read as news', () => {
    expect(board.sanji.jun.period).toBe(30);
    expect(board.sanji.chen.period).toBe(3);
    expect(board.sanji.min.period).toBe(1);

    for (const year of [1, 724, 1644, 2026, 9999]) {
      const other = taiyiBoard({ year }, DEFAULT_TAIYI_OPTIONS);
      expect(other.sanji.min.year).toBe(1);
      expect(other.sanji.jun.year).toBeLessThanOrEqual(other.sanji.jun.period);
      expect(other.sanji.chen.year).toBeLessThanOrEqual(other.sanji.chen.period);
    }
  });
});

/**
 * 卷二 推帝王年紀法 — twenty-six 甲子 years, each with the 紀 it enters.
 *
 * The longest check the text offers, and the only one that reaches outside the
 * Tang: it spans 837 BCE to 724 CE and every entry is a datable reign year.
 * One is transposed in the transmitted text — 周惠王二十一年 and 周桓王三年
 * stand in each other's place, and 桓王三年 is the 甲子 that belongs third —
 * so the list here carries the years the sequence requires, and the wrinkle is
 * written down in `docs/sources.md` rather than smoothed away.
 */
describe('the twenty-six reigns of 卷二', () => {
  it('enters the 紀 the text assigns, at every one of them', () => {
    const first = 724 - 1560; // 周厲王三十七年甲子, 837 BCE in astronomical numbering.
    const entered = Array.from({ length: 26 }, (_, index) => {
      const year = first + index * 60;
      const board = taiyiBoard({ year }, options);
      expect(board.sui.hanzi).toBe('甲子');
      expect(board.liuji.year).toBe(1);
      return board.liuji.number;
    });

    // 第一紀 through 第六紀, over and over, for twenty-six sixties.
    expect(entered).toEqual([
      1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2,
    ]);
  });
});

describe('the year board', () => {
  it('agrees with the year pillar for two centuries either side of now', () => {
    // The one check here that does not come from the text: the 太歲 the count
    // yields is the year pillar every almanac prints, and if the epoch were
    // wrong by a year this would be the first thing to say so.
    for (let year = 1800; year <= 2200; year += 1) {
      expect(taiyiBoard({ year }, options).sui.index).toBe(yearGanzhi(year).index);
    }
  });

  it('carries the options that produced it', () => {
    expect(taiyiBoard({ year: 2026 }, options).options).toBe(options);
  });

  it('refuses an epoch and a register it has not read', () => {
    expect(() => taiyiBoard({ year: 2026 }, { ...options, epoch: 'tongzong' as 'jinjing' })).toThrow(
      /OPTION_NOT_IMPLEMENTED|not implemented/i,
    );
    expect(() => taiyiBoard({ year: 2026 }, { ...options, ji: 'yueji' as 'nianji' })).toThrow(
      /OPTION_NOT_IMPLEMENTED|not implemented/i,
    );
  });

  it('cuts the year where the pillars cut it', () => {
    expect(taiyiYearOf({ civilYear: 2026, sui: yearGanzhi(2026) }, options)).toBe(2026);
    expect(taiyiYearOf({ civilYear: 2026, sui: yearGanzhi(2025) }, options)).toBe(2025);
  });

  it('refuses every boundary it has not implemented, and not only the one', () => {
    // 春節 was declared beside 冬至 and only 冬至 threw, so a board asked for
    // the lunar boundary was answered by the 立春 rule and recorded the option
    // it had not used. The guard is one refusal now, so a fourth boundary
    // cannot arrive quietly answered by this one.
    for (const yearBoundary of ['dongzhi', 'chunjie'] as const) {
      expect(() => taiyiYearOf({ civilYear: 2026, sui: yearGanzhi(2026) }, { ...options, yearBoundary })).toThrow(
        /OPTION_NOT_IMPLEMENTED|not implemented/i,
      );
      expect(() => taiyiBoard({ year: 2026 }, { ...options, yearBoundary })).toThrow(
        /OPTION_NOT_IMPLEMENTED|not implemented/i,
      );
    }
  });

  it('answers «now» from 立春 and not from the calendar', () => {
    const context = initEphemeris();
    // 立春 2026 falls on 4 February. The whole of the divergence this settles
    // is the month between New Year and it: every surface asked for the year
    // being lived has to answer 2025 there, and the civil calendar answers
    // 2026.
    const at = (date: string) =>
      taiyiYearAt(resolveTime({ date, time: '12:00', timezone: 'UTC' }).time.julianDayUT, options, context);
    expect(at('2026-01-15')).toBe(2025);
    expect(at('2026-02-03')).toBe(2025);
    expect(at('2026-02-10')).toBe(2026);
    expect(at('2026-12-31')).toBe(2026);
  });
});

describe('the ring of sixteen', () => {
  it('seats eight gods at palaces and eight between them', () => {
    expect(TAIYI_GODS).toHaveLength(16);
    const atPalaces = TAIYI_GODS.filter((god) => god.palace !== undefined);
    expect(atPalaces.map((god) => god.palace).sort((a, b) => (a as number) - (b as number))).toEqual([
      1, 2, 3, 4, 6, 7, 8, 9,
    ]);
    // 卷二 gives the four corners to the trigrams and the rest to the branches.
    expect(TAIYI_GODS.filter((god) => god.seat.kind === 'trigram')).toHaveLength(4);
  });

  it('takes the element of each god from the seat it stands on', () => {
    // 卷六: 「假今髙叢木，以吕申、大炅同類為旺；以大義、地主為相；武徳、太蔟
    // 為死；和徳、大武、太陽、天道為囚；大神、大威為休」.
    const element = (hanzi: string) =>
      TAIYI_GODS.find((god) => god.hanzi === hanzi)?.element as string;
    expect(['高叢', '呂申', '太炅'].map(element)).toEqual(['mu', 'mu', 'mu']);
    expect(['大義', '地主'].map(element)).toEqual(['shui', 'shui']);
    expect(['武德', '太蔟'].map(element)).toEqual(['jin', 'jin']);
    expect(['和德', '大武', '太陽', '天道'].map(element)).toEqual(['tu', 'tu', 'tu', 'tu']);
    expect(['太神', '大威'].map(element)).toEqual(['huo', 'huo']);
  });
});

describe('the named conditions', () => {
  it('finds 掩 where the guest eye stands on 太乙', () => {
    // 卷三: 「始擊將臨太乙宫謂之掩」.
    const found = [...Array(72).keys()]
      .map((index) => taiyiJu(index + 1, 'yang'))
      .filter((board) => board.patterns.some((pattern) => pattern.id === 'yan'));
    for (const board of found) {
      expect(board.shiji.palace).toBe(board.taiyi.palace.number);
    }
    expect(found.length).toBeGreaterThan(0);
  });

  it('names 撃 and 迫 by the four distances 卷三 separates', () => {
    const kinds = new Set(
      [...Array(72).keys()]
        .flatMap((index) => taiyiJu(index + 1, 'yang').patterns)
        .filter((pattern) => pattern.id === 'ji' || pattern.id === 'po')
        .map((pattern) => pattern.kind),
    );
    expect(kinds).toEqual(new Set(['qianchen', 'houchen', 'qiangong', 'hougong']));
  });

  it('keeps 格 to the guest, which is the only party 卷三 names in it', () => {
    // 「客目大小將與太乙對宫為格」. The chapter writes 主客 where it means both
    // sides — 主客大小四將 at 囚, 主客大小將 at 關 — so the 客 here qualifies
    // the generals after it. A 格 on the host's would be a condition reported
    // for a configuration the source states for nobody.
    const subjects = new Set(
      (['yang', 'yin'] as const).flatMap((dun) =>
        [...Array(72).keys()]
          .flatMap((index) => taiyiJu(index + 1, dun).patterns)
          .filter((pattern) => pattern.id === 'ge')
          .map((pattern) => pattern.subject),
      ),
    );
    expect(subjects.size).toBeGreaterThan(0);
    for (const subject of subjects) {
      expect(['shiji', 'guestGeneral', 'guestAssistant']).toContain(subject);
    }
  });

  it('weighs every condition, because 卷三 does', () => {
    const patterns = [...Array(72).keys()].flatMap((index) => taiyiJu(index + 1, 'yang').patterns);
    expect(patterns.length).toBeGreaterThan(0);
    for (const pattern of patterns) {
      expect(pattern.valence.hanzi).toBe('凶');
      expect(pattern.hanzi).toBeTruthy();
    }
  });
});
