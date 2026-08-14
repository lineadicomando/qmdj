import { describe, expect, it } from 'vitest';
import { BRANCHES, ganzhiOf, type Branch, type Ganzhi } from '../src/ganzhi.js';
import {
  DEFAULT_LIUREN_OPTIONS,
  GENERALS,
  liurenBoard,
  lodgingOf,
  yuejiangOf,
  type LiurenOptions,
} from '../src/liuren.js';
import { SOLAR_TERMS, type SolarTermDefinition, type SolarTermId } from '../src/solar-terms.js';

const term = (id: SolarTermId): SolarTermDefinition =>
  SOLAR_TERMS.find((t) => t.id === id) as SolarTermDefinition;

const day = (hanzi: string): Ganzhi => {
  for (let i = 0; i < 60; i += 1) if (ganzhiOf(i).hanzi === hanzi) return ganzhiOf(i);
  throw new Error(`no pair ${hanzi}`);
};

const branch = (hanzi: string): Branch =>
  BRANCHES.find((b) => b.hanzi === hanzi) as Branch;

const board = (t: SolarTermId, d: string, h: string, options?: Partial<LiurenOptions>) =>
  liurenBoard(
    { term: term(t), day: day(d), hour: branch(h) },
    { ...DEFAULT_LIUREN_OPTIONS, ...options },
  );

const chuan = (t: SolarTermId, d: string, h: string) =>
  board(t, d, h).transmissions.map((x) => x.branch.hanzi).join('');

describe('月將', () => {
  it('seats the general on the 中氣', () => {
    expect(yuejiangOf(term('dongzhi'), DEFAULT_LIUREN_OPTIONS)).toMatchObject({
      id: 'daji',
      hanzi: '大吉',
      pinyin: 'dàjí',
    });
    expect(yuejiangOf(term('dongzhi'), DEFAULT_LIUREN_OPTIONS).branch.hanzi).toBe('丑');
  });

  it('holds it through the 節氣 that follows', () => {
    // 冬至 and 小寒 are one board; 大寒 turns it. This is what `yuejiang:
    // zhongqi` means, and both references read it the same way.
    expect(yuejiangOf(term('xiaohan'), DEFAULT_LIUREN_OPTIONS).branch.hanzi).toBe('丑');
    expect(yuejiangOf(term('dahan'), DEFAULT_LIUREN_OPTIONS).branch.hanzi).toBe('子');
    expect(yuejiangOf(term('lichun'), DEFAULT_LIUREN_OPTIONS).branch.hanzi).toBe('子');
    expect(yuejiangOf(term('yushui'), DEFAULT_LIUREN_OPTIONS).branch.hanzi).toBe('亥');
  });

  it('steps back one branch at each 中氣, over the whole year', () => {
    const qi = SOLAR_TERMS.filter((t) => t.kind === 'qi');
    const seats = qi.map((t) => yuejiangOf(t, DEFAULT_LIUREN_OPTIONS).branch.index);
    expect(new Set(seats).size).toBe(12);
    for (let i = 1; i < seats.length; i += 1) {
      expect(((seats[i - 1] as number) - (seats[i] as number) + 12) % 12).toBe(1);
    }
  });

  it('refuses the readings it does not implement', () => {
    expect(() => yuejiangOf(term('dongzhi'), { ...DEFAULT_LIUREN_OPTIONS, yuejiang: 'jieqi' }))
      .toThrow(/OPTION_NOT_IMPLEMENTED|not implemented/i);
  });
});

describe('寄宮', () => {
  it('lodges each stem where 六壬 puts it', () => {
    // 甲寄寅, 乙寄辰, 丙戊寄巳, 丁己寄未, 庚寄申, 辛寄戌, 壬寄亥, 癸寄丑.
    const lodgings = '甲乙丙丁戊己庚辛壬癸'
      .split('')
      .map((s) => lodgingOf(day(`${s}${s === '甲' || s === '丙' || s === '戊' || s === '庚' || s === '壬' ? '子' : '丑'}`).stem).hanzi);
    expect(lodgings).toEqual(['寅', '辰', '巳', '未', '巳', '未', '申', '戌', '亥', '丑']);
  });
});

describe('天地盤', () => {
  it('sets the general of the month on the palace of the hour', () => {
    // 月將 丑 on the hour of 巳: every branch stands four palaces on from home.
    const laid = board('dongzhi', '丁未', '巳');
    expect(laid.heaven[5]?.hanzi).toBe('丑');
    expect(laid.heaven[11]?.hanzi).toBe('未');
    expect(laid.heaven.map((b) => b.hanzi).join('')).toBe('申酉戌亥子丑寅卯辰巳午未');
  });

  it('reads the four courses off the lodging and the day branch', () => {
    const laid = board('dongzhi', '丁未', '巳');
    expect(laid.courses.map((c) => c.upper.hanzi)).toEqual(['卯', '亥', '卯', '亥']);
    expect(laid.courses[0].lower.hanzi).toBe('丁');
    expect(laid.courses[0].lowerIsStem).toBe(true);
    expect(laid.courses[2].lower.hanzi).toBe('未');
  });

  it('carries the decade under the transmissions, and its two empty branches', () => {
    // 丁未 is in the decade of 甲辰, which leaves out 寅 and 卯.
    const laid = board('dongzhi', '丁未', '巳');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['卯', '亥', '未']);
    expect(laid.transmissions[0].empty).toBe(true);
    expect(laid.transmissions[0].hiddenStem).toBeUndefined();
    expect(laid.transmissions[1].hiddenStem?.hanzi).toBe('辛');
    expect(laid.transmissions[2].hiddenStem?.hanzi).toBe('丁');
  });
});

describe('十二天將', () => {
  it('lays the noble and the rest around it', () => {
    // 丁 by day seats the noble at 亥, which stands over 卯 — one of the six
    // palaces that rise — so the others are laid forwards from it.
    const laid = board('dongzhi', '丁未', '巳');
    expect(laid.half).toBe('day');
    expect(laid.generals[3]?.hanzi).toBe('貴人');
    expect(laid.generals[5]?.hanzi).toBe('朱雀');
    expect(new Set(laid.generals.map((g) => g.id)).size).toBe(12);
  });

  it('cuts the day on the hour branch, 卯 to 申', () => {
    expect(board('dongzhi', '丁未', '申').half).toBe('day');
    expect(board('dongzhi', '丁未', '酉').half).toBe('night');
    expect(board('dongzhi', '丁未', '寅').half).toBe('night');
    expect(board('dongzhi', '丁未', '卯').half).toBe('day');
  });

  it('moves the generals under the other verse, and never the transmissions', () => {
    // The one thing worth knowing about `guiren` before reading a board by it.
    for (const hour of BRANCHES) {
      const a = board('dahan', '甲子', hour.hanzi);
      const b = board('dahan', '甲子', hour.hanzi, { guiren: 'wei' });
      expect(b.transmissions.map((t) => t.branch.hanzi)).toEqual(
        a.transmissions.map((t) => t.branch.hanzi),
      );
    }
    // And it does move them: 甲 sits at 丑 under one verse and at 未 under the
    // other, which is the whole of the divergence.
    const chou = board('dahan', '甲子', '巳');
    const wei = board('dahan', '甲子', '巳', { guiren: 'wei' });
    expect(chou.generals).not.toEqual(wei.generals);
  });
});

/**
 * One board per rule, and every one of them agrees with **both** references —
 * `kinliuren` 0.1.2.9 and `liuren-ts-lib` 3.1.0. Where those two disagree with
 * each other, which is 17.6 % of the space, nothing is asserted here.
 * See `PLAN.md` § 4 phase 13.
 */
describe('九宗門', () => {
  it('賊剋 · 元首 — one upper controls its ground', () => {
    const laid = board('dahan', '甲子', '卯');
    expect(laid.rule).toBe('zeike');
    expect(laid.keti).toBe('yuanshou');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['午', '卯', '子']);
  });

  it('賊剋 · 重審 — one ground controls its upper, and outranks the other kind', () => {
    const laid = board('dahan', '甲子', '辰');
    expect(laid.rule).toBe('zeike');
    expect(laid.keti).toBe('zhongshen');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['戌', '午', '寅']);
  });

  it('比用 · 知一 — several, and the day stem keeps one', () => {
    const laid = board('dahan', '甲子', '巳');
    expect(laid.rule).toBe('biyong');
    expect(laid.keti).toBe('zhiyi');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['寅', '酉', '辰']);
  });

  it('涉害 — several alike, and the deepest wading inside its own group', () => {
    const laid = board('dahan', '甲子', '寅');
    expect(laid.rule).toBe('shehai');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['戌', '申', '午']);
  });

  it('遙剋 · 蒿矢 — nothing near, and an upper controls the stem', () => {
    const laid = board('dahan', '丁卯', '卯');
    expect(laid.rule).toBe('yaoke');
    expect(laid.keti).toBe('haoshi');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['子', '酉', '午']);
  });

  it('遙剋 · 彈射 — the stem controls an upper instead', () => {
    const laid = board('dahan', '戊辰', '申');
    expect(laid.rule).toBe('yaoke');
    expect(laid.keti).toBe('tanshe');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['子', '辰', '申']);
  });

  it('昴星 · 冬蛇掩目 — nothing at all, on a yin day', () => {
    const laid = board('dahan', '己巳', '亥');
    expect(laid.rule).toBe('maoxing');
    expect(laid.keti).toBe('dongshe');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['申', '申', '午']);
  });

  it('別責 — three courses where there should be four', () => {
    const laid = board('dahan', '戊辰', '亥');
    expect(laid.rule).toBe('bieze');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['寅', '午', '午']);
  });

  it('伏吟 · 自任 — the plate has not moved, on a yang day', () => {
    const laid = board('dahan', '甲子', '子');
    expect(laid.rule).toBe('fuyin');
    expect(laid.keti).toBe('ziren');
    // 甲寄寅, and each transmission punishes the one before it: 寅刑巳, 巳刑申.
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['寅', '巳', '申']);
  });

  it('伏吟 · 自信 — the same, on a yin day, opening at the branch', () => {
    const laid = board('dahan', '己巳', '子');
    expect(laid.rule).toBe('fuyin');
    expect(laid.keti).toBe('zixin');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['巳', '申', '寅']);
  });

  it('伏吟 · 杜傳 — a still plate that still shows a control', () => {
    // 乙 stands on 辰 and controls it, so the board is answered by the
    // ordinary rule. This is why every 乙 and every 癸 day opens at the
    // lodging where 丁, 己 and 辛 open at the branch — a consequence of the
    // stem's phase, not a rule about the stem.
    const laid = board('dahan', '乙丑', '子');
    expect(laid.rule).toBe('fuyin');
    expect(laid.keti).toBe('duchuan');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['辰', '丑', '戌']);
  });

  it('返吟 · 無依 — the plate has turned half, and a control remains', () => {
    const laid = board('dahan', '丙寅', '午');
    expect(laid.rule).toBe('fanyin');
    expect(laid.keti).toBe('wuyi');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['寅', '申', '寅']);
  });

  it('八專 — the stem lodges where the branch already stands', () => {
    // 己寄未 on a 未 day. The rule is reached before 遙剋, because its
    // condition is that no course controls its ground — which a distant
    // control is not.
    const laid = board('dahan', '己未', '寅');
    expect(laid.rule).toBe('bazhuan');
    expect(laid.transmissions.map((t) => t.branch.hanzi)).toEqual(['丑', '巳', '巳']);
  });

  it('takes the degenerate plates by their own condition', () => {
    // 伏吟 when the general falls on its own hour, 返吟 when it faces it.
    expect(board('dahan', '甲子', '子').rule).toBe('fuyin');
    expect(board('dahan', '甲子', '午').rule).toBe('fanyin');
    // 冬至 seats the general at 丑, so it is the hour of 丑 that stills this
    // plate and the hour of 未 that turns it half. Any other hour is an
    // ordinary board.
    expect(board('dongzhi', '甲子', '丑').rule).toBe('fuyin');
    expect(board('dongzhi', '甲子', '未').rule).toBe('fanyin');
    expect(board('dongzhi', '甲子', '寅').rule).not.toBe('fuyin');
    expect(board('dongzhi', '甲子', '寅').rule).not.toBe('fanyin');
  });
});

describe('the board as a whole', () => {
  // A minute of CPU to itself and it takes a second; run beside five other
  // workspaces it does not, and the default five seconds is a limit on the
  // machine's load rather than on the engine. The point of the test is that
  // it is the *whole* space, so it is given room instead of being sampled.
  it('answers on every input the space holds', { timeout: 60_000 }, () => {
    // Twenty-four terms by sixty pairs by twelve branches is the whole space a
    // board can occupy, and nothing in it may throw or come back short.
    let boards = 0;
    for (const t of SOLAR_TERMS) {
      for (let d = 0; d < 60; d += 1) {
        for (const hour of BRANCHES) {
          const laid = liurenBoard(
            { term: t, day: ganzhiOf(d), hour },
            DEFAULT_LIUREN_OPTIONS,
          );
          expect(laid.transmissions).toHaveLength(3);
          expect(laid.courses).toHaveLength(4);
          expect(laid.generals).toHaveLength(12);
          boards += 1;
        }
      }
    }
    expect(boards).toBe(24 * 60 * 12);
  });

  it('carries the options that produced it', () => {
    expect(board('dahan', '甲子', '巳').options).toEqual(DEFAULT_LIUREN_OPTIONS);
  });

  it('names every general with a reading', () => {
    for (const general of GENERALS) {
      expect(general.hanzi).toMatch(/^[一-鿿]+$/);
      expect(general.pinyin).toMatch(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/);
    }
  });
});
