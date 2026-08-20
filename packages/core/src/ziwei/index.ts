import { ChartError } from '../errors.js';
import {
  BRANCHES,
  STEMS,
  decade,
  ganzhiFrom,
  yearGanzhi,
  type Branch,
  type BranchId,
  type Ganzhi,
  type Stem,
} from '../ganzhi.js';
import type { Moment } from '../pillars.js';
import type { Element } from '../types.js';
import { nayin, type Nayin } from '../bazi/nayin.js';
import type { Gender } from '../bazi/luck.js';
import { TWELVE_STAGES, type TwelveStage } from '../bazi/hidden-stems.js';
import {
  BODY_MASTER,
  BRIGHTNESS,
  CHANGSHENG_START,
  HUOLING,
  JIELU,
  KUIYUE,
  LIFE_MASTER,
  LUCUN,
  SIHUA,
  TIANMA,
  XIAOXIAN_START,
  YIN_STEM,
  ZIWEI_BY_DAY,
} from './tables.js';
import {
  BOSHI_GODS,
  BRIGHTNESSES,
  BUREAUS,
  TRANSFORMS,
  ZIWEI_HOUSES,
  star,
  type BoshiGod,
  type Brightness,
  type Bureau,
  type Transform,
  type ZiweiHouse,
  type ZiweiStar,
  type ZiweiStarId,
} from './stars.js';

export * from './stars.js';
export { BRIGHTNESS, KUIYUE, LUCUN, SIHUA, TIANMA, ZIWEI_BY_DAY } from './tables.js';

export interface ZiweiOptions {
  /**
   * Needed for everything the tradition walks in a direction: the 大限, the
   * 小限, the ring of 長生 and the ring of 博士 all read it together with the
   * polarity of the year. Omit it and the seats are still complete; only
   * those four are left out, exactly as `computeBazi` leaves out its cycles.
   */
  gender?: Gender;
  /**
   * What a birth in an intercalary month counts as.
   *
   * `following` is the text: 「又若閏正月生者要在二月內起安身命，凡有閏月
   * 俱要依此為例」 — a leap month is reckoned as the month after it, and the
   * closing clause generalises it to every month-counted placement, which is
   * why 左輔, 右弼, 天刑 and 天姚 follow the same adjusted month. The other
   * two values name what other schools do — count it as the month it repeats,
   * or split it at the middle of the month — and neither is in this book.
   */
  leapMonth: 'following' | 'current' | 'split';
  /**
   * Which table of the four transformations.
   *
   * One value, and it is 《紫微斗數全書》's own. The tables that differ at
   * 戊, 庚 and 壬 belong to lineages nobody here has read, and a lineage
   * nobody has read is not a value — the `tongzong` precedent.
   */
  sihua: 'quanshu';
  /**
   * How 火星 and 鈴星 are placed.
   *
   * `fixed` is all 卷二 states: a seat apiece from the triplicity of the
   * birth year, with the hour nowhere in the verse. `hour` names the
   * widespread practice of counting on from those seats by the birth hour,
   * which no text on this shelf supports.
   */
  huoling: 'fixed' | 'hour';
  /**
   * Where the first decade of the 大限 falls.
   *
   * `adjacent` is the text, in both copies verbatim: 「陽男陰女從命前一宮起
   * 順行 是父母宮。陰男陽女從命後一宮起逆行 是兄弟宮」 — the run opens in
   * the palace *beside* the 命宮, never in it. `ming` names the widespread
   * practice of opening in the 命宮 itself.
   */
  daxian: 'adjacent' | 'ming';
  /**
   * Which reckoning gives the year its stem and branch.
   *
   * The board counts its month and its day on the lunar calendar, so
   * `chunjie` — the year that opened at 正月初一 — is the reckoning coherent
   * with the rest of it, and it is the default here for that reason. The
   * book says nothing either way, which is precisely why this is a parameter
   * and not a silence: the year stem carries the 四化, 祿存, 天魁 and 天鉞,
   * so a birth in the weeks between 正月初一 and 立春 lays out two different
   * boards and only one of them can be printed.
   */
  yearBoundary: 'lichun' | 'chunjie';
}

export const DEFAULT_ZIWEI_OPTIONS: ZiweiOptions = Object.freeze({
  leapMonth: 'following',
  sihua: 'quanshu',
  huoling: 'fixed',
  daxian: 'adjacent',
  yearBoundary: 'chunjie',
});

/** A star in the seat it was counted into. */
export interface ZiweiSeat {
  star: ZiweiStar;
  /**
   * The grade the table of 卷二 gives this star in this branch, where it
   * grades it at all. Twenty-one stars have one; the rest are `null`, which
   * says the book is silent and not that the seat is poor.
   */
  brightness: Brightness | null;
  /** The transformation the birth year's stem works on it, if any. */
  transform: Transform | null;
}

export interface ZiweiPalace {
  /** Which of the twelve seats this is, 命宮 first. */
  house: ZiweiHouse;
  branch: Branch;
  /** The palace's own stem, from 五虎遁 on the year stem. */
  stem: Stem;
  stars: ZiweiSeat[];
  /** True where the 身宮 fell — it always shares a palace with another seat. */
  body: boolean;
  /** Where this palace stands in the ring of 長生. Absent without a gender. */
  changsheng: TwelveStage | null;
  /** Which of the 博士十二神 stands here. Absent without a gender. */
  boshi: BoshiGod | null;
  /** The decade of the 大限 this palace holds. Absent without a gender. */
  majorLimit: { from: number; to: number } | null;
  /**
   * The age, one to twelve, at which the 小限 first reaches this palace;
   * every twelfth year after it returns. Absent without a gender.
   */
  minorLimitAge: number | null;
  /** The years of the 童限 that fall here, of the six the verse names. */
  childLimit: number[];
}

export interface ZiweiBoard {
  /** The lunar date the board is counted on, as the calendar gave it. */
  lunar: { year: number; month: number; leap: boolean; day: number };
  /** The month actually counted, after the leap-month rule. */
  countedMonth: number;
  hourBranch: Branch;
  /** The year pillar, reckoned as `yearBoundary` says. */
  yearPillar: Ganzhi;
  /** The stem-branch of the 命宮, whose 納音 cut the bureau. */
  minggongPillar: Ganzhi;
  nayin: Nayin;
  bureau: Bureau;
  /** The twelve, 命宮 first, laid 逆 against the branches. */
  palaces: ZiweiPalace[];
  /** The branch the 身宮 fell on. */
  bodyBranch: Branch;
  /** 命主, by the branch of the 命宮. */
  lifeMaster: ZiweiStar;
  /** 身主, by the branch of the birth year. */
  bodyMaster: ZiweiStar;
  options: ZiweiOptions;
}

const step = (index: number, by: number): number => (((index + by) % 12) + 12) % 12;

const BUREAU_OF: Record<Element, Bureau['id']> = {
  shui: 'shuierju',
  mu: 'musanju',
  jin: 'jinsiju',
  tu: 'tuwuju',
  huo: 'huoliuju',
};

function refuse(option: string, value: string, implemented: string): never {
  throw new ChartError('OPTION_NOT_IMPLEMENTED', { option, value, implemented });
}

/**
 * A 紫微斗數 board, laid on a birth.
 *
 * **Nothing on this board is in the sky.** The whole of it is counting: from
 * the month and the hour to a 命宮, from the 命宮's 納音 to a bureau, from
 * the bureau and the day of the lunar month to 紫微, and from 紫微 to
 * everything else. No ephemeris is consulted at any point — what the instant
 * supplies is a lunar date, an hour branch and a year pillar, and the rest is
 * arithmetic the text states in verses.
 *
 * It reports where the seats fall and what the book grades them. It does not
 * say what a seat means, which palace matters, or how a life goes: 卷一's fu
 * poems and 卷二's per-palace readings are prose-verdict doctrine, and they
 * stay in the book.
 */
export function computeZiwei(moment: Moment, options: ZiweiOptions): ZiweiBoard {
  if (options.leapMonth !== 'following') {
    refuse('leapMonth', options.leapMonth, 'following');
  }
  if (options.sihua !== 'quanshu') refuse('sihua', options.sihua, 'quanshu');
  if (options.huoling !== 'fixed') refuse('huoling', options.huoling, 'fixed');
  if (options.daxian !== 'adjacent') refuse('daxian', options.daxian, 'adjacent');
  if (options.yearBoundary !== 'lichun' && options.yearBoundary !== 'chunjie') {
    refuse('yearBoundary', options.yearBoundary, 'lichun, chunjie');
  }

  const lunar = moment.lunar;
  const yearPillar =
    options.yearBoundary === 'chunjie' ? yearGanzhi(lunar.year) : moment.pillars.year;
  const yearStem = yearPillar.stem;
  const yearBranch = yearPillar.branch;
  const hour = moment.hourBranch;

  // 「又若閏正月生者要在二月內起安身命，凡有閏月俱要依此為例」.
  const countedMonth = lunar.month + (lunar.leap ? 1 : 0);

  // 「大抵人命俱從寅上起正月，順數至本生月止，又自人生月起子時逆至本生時
  // 安命，順至本生時安身。」
  const monthSeat = step(BRANCHES[2].index, countedMonth - 1);
  const mingIndex = step(monthSeat, -hour.index);
  const bodyIndex = step(monthSeat, hour.index);

  // 起五行寅例: the year stem puts a stem on 寅, and the rest follow the ring.
  const yinStem = STEMS.find((s) => s.id === YIN_STEM[yearStem.id])!;
  // The stems are dealt out walking the ring forward from 寅, so the count
  // is taken mod twelve *before* it is taken mod ten: 子 is ten steps along
  // and not two steps back. The two are the same number of branches and
  // different stems, and the difference lands on the 納音 that cuts the
  // bureau — which is to say on every star that hangs off 紫微.
  const stemAt = (branchIndex: number): Stem =>
    STEMS[(yinStem.index + (((branchIndex - 2) % 12) + 12) % 12) % 10] as Stem;

  const minggongPillar = ganzhiFrom(stemAt(mingIndex).index, mingIndex);
  const image = nayin(minggongPillar);
  const bureau = BUREAUS.find((b) => b.id === BUREAU_OF[image.element])!;

  const seats = new Map<number, ZiweiSeat[]>();
  const place = (id: ZiweiStarId, branchIndex: number): void => {
    const list = seats.get(branchIndex) ?? [];
    list.push({ star: star(id), brightness: null, transform: null });
    seats.set(branchIndex, list);
  };

  // 紫微 by bureau and by the day of the lunar month, then the thirteen that
  // hang off it — 「紫微天機逆行旁，隔一陽武天同當，又隔二位廉貞地，空三復見
  // 紫微郎」 and 「天府太陰與貪狼，巨門天相及天梁，七殺空三破軍位」.
  const ziweiBranchId = ZIWEI_BY_DAY[bureau.id][lunar.day - 1];
  const ziweiIndex = BRANCHES.findIndex((b) => b.id === ziweiBranchId);
  place('ziwei', ziweiIndex);
  place('tianji', step(ziweiIndex, -1));
  place('taiyang', step(ziweiIndex, -3));
  place('wuqu', step(ziweiIndex, -4));
  place('tiantong', step(ziweiIndex, -5));
  place('lianzhen', step(ziweiIndex, -8));

  // 「天府惟寅申二宮紫府同宮，餘宮俱各填協作對如紫居丑則府居卯矣」 — the
  // reflection that fixes 寅 and 申, which is what the caption describes.
  const tianfuIndex = step(4 - ziweiIndex, 0);
  place('tianfu', tianfuIndex);
  place('taiyin', step(tianfuIndex, 1));
  place('tanlang', step(tianfuIndex, 2));
  place('jumen', step(tianfuIndex, 3));
  place('tianxiang', step(tianfuIndex, 4));
  place('tianliang', step(tianfuIndex, 5));
  place('qisha', step(tianfuIndex, 6));
  place('pojun', step(tianfuIndex, 10));

  // 昌曲 by the hour, 輔弼 by the month.
  place('wenchang', step(10, -hour.index));
  place('wenqu', step(4, hour.index));
  const zuofuIndex = step(4, countedMonth - 1);
  const youbiIndex = step(10, -(countedMonth - 1));
  place('zuofu', zuofuIndex);
  place('youbi', youbiIndex);

  // 魁鉞, 天馬, 祿存 with 羊陀 about it, 火鈴 — all off the year.
  const [kui, yue] = KUIYUE[yearStem.id];
  place('tiankui', BRANCHES.findIndex((b) => b.id === kui));
  place('tianyue', BRANCHES.findIndex((b) => b.id === yue));
  place('tianma', BRANCHES.findIndex((b) => b.id === TIANMA[yearBranch.id]));
  const lucunIndex = BRANCHES.findIndex((b) => b.id === LUCUN[yearStem.id]);
  place('lucun', lucunIndex);
  place('qingyang', step(lucunIndex, 1));
  place('tuoluo', step(lucunIndex, -1));
  const [huo, ling] = HUOLING[yearBranch.id];
  place('huoxing', BRANCHES.findIndex((b) => b.id === huo));
  place('lingxing', BRANCHES.findIndex((b) => b.id === ling));

  // 「亥上起子順安劫，逆向便是天空鄉」.
  place('dijie', step(11, hour.index));
  place('tiankong', step(11, -hour.index));

  // 天傷 and 天使 are anchored by palace and not by branch: the verse counts
  // six either way, and the prose beside it settles which six —
  // 「天傷安在奴僕宮，天使安在疾厄宮」.
  place('tianshang', step(mingIndex, -7));
  place('tianshi', step(mingIndex, -5));

  // The only two placements 《全書》 shares with the 十八飛星 transmission, and
  // across that gap the two agree word for word. Every other quantity on this
  // board rests on one lineage; these rest on two that agree about nothing
  // else. Do not "tidy" them — see docs/sources.md.
  place('tianxing', step(9, countedMonth - 1));
  place('tianyao', step(1, countedMonth - 1));
  place('santai', step(zuofuIndex, lunar.day - 1));
  place('bazuo', step(youbiIndex, -(lunar.day - 1)));

  // 「天哭天虛起午宮。午宮起子兩分蹤。哭逆巳兮虛順未。」
  place('tianku', step(6, -yearBranch.index));
  place('tianxu', step(6, yearBranch.index));
  // 「龍池子順辰，鳳閣子戌逆。」
  place('longchi', step(4, yearBranch.index));
  place('fengge', step(10, -yearBranch.index));
  place('taifu', step(6, hour.index));
  place('fenggao', step(2, hour.index));
  // 「卯上起子逆數之，數到當生太歲支，坐守此宮紅鸞位，對宮天喜不差移。」
  const hongluanIndex = step(3, -yearBranch.index);
  place('hongluan', hongluanIndex);
  place('tianxi', step(hongluanIndex, 6));
  place('jieshen', step(10, -yearBranch.index));

  for (const branchId of JIELU[yearStem.id]) {
    place('jielukongwang', BRANCHES.findIndex((b) => b.id === branchId));
  }
  for (const branch of decade(yearGanzhi(lunar.year)).empty) {
    place('xunzhongkongwang', branch.index);
  }

  // 四化: the birth year's stem transforms four of the stars already seated.
  const transforms = SIHUA[yearStem.id];
  for (const [n, starId] of transforms.entries()) {
    for (const list of seats.values()) {
      for (const seat of list) {
        if (seat.star.id === starId) seat.transform = TRANSFORMS[n];
      }
    }
  }

  // The four quantities that need a gender, and the polarity they read it
  // against: 陽男陰女 one way, 陰男陽女 the other.
  const gender = options.gender;
  const yang = yearStem.yang;
  const yangManYinWoman = gender ? (gender === 'male') === yang : null;
  const forwardByGender = gender ? gender === 'male' : null;

  const changshengStart = BRANCHES.findIndex(
    (b) => b.id === CHANGSHENG_START[bureau.id],
  );
  const xiaoxianStart = BRANCHES.findIndex(
    (b) => b.id === XIAOXIAN_START[yearBranch.id],
  );

  const changshengAt = new Map<number, TwelveStage>();
  const boshiAt = new Map<number, BoshiGod>();
  const limitAt = new Map<number, { from: number; to: number }>();
  const minorAt = new Map<number, number>();
  if (gender) {
    // 「男命順數、女命逆數」.
    for (const [n, stage] of TWELVE_STAGES.entries()) {
      changshengAt.set(step(changshengStart, forwardByGender ? n : -n), stage);
    }
    // 「陽男陰女順推輪，陰男陽女逆流行」, walking from 祿存.
    for (const [n, god] of BOSHI_GODS.entries()) {
      boshiAt.set(step(lucunIndex, yangManYinWoman ? n : -n), god);
    }
    // 「陽男陰女從命前一宮起順行 是父母宮。陰男陽女從命後一宮起逆行 是兄弟宮」.
    const first = step(mingIndex, yangManYinWoman ? 1 : -1);
    for (let n = 0; n < 12; n += 1) {
      const from = bureau.number + n * 10;
      limitAt.set(step(first, yangManYinWoman ? n : -n), { from, to: from + 9 });
    }
    // 「不論陰陽男俱順數不論陰陽女俱逆數」, age one at the branch the year's
    // triplicity names.
    for (let n = 0; n < 12; n += 1) {
      minorAt.set(step(xiaoxianStart, forwardByGender ? n : -n), n + 1);
    }
  }

  // 「一命二財三疾厄，四妻五福六官祿」 — six ages on six named palaces.
  const CHILD: Record<number, number> = { 0: 1, 4: 2, 5: 3, 2: 4, 10: 5, 8: 6 };

  const palaces: ZiweiPalace[] = ZIWEI_HOUSES.map((house, position) => {
    // 「男女俱從逆轉切忌莫順去」.
    const branchIndex = step(mingIndex, -position);
    const branch = BRANCHES[branchIndex];
    const stars = (seats.get(branchIndex) ?? []).map((seat) => ({
      ...seat,
      brightness: brightnessOf(seat.star.id, branch.id),
    }));
    return {
      house,
      branch,
      stem: stemAt(branchIndex),
      stars,
      body: branchIndex === bodyIndex,
      changsheng: changshengAt.get(branchIndex) ?? null,
      boshi: boshiAt.get(branchIndex) ?? null,
      majorLimit: limitAt.get(branchIndex) ?? null,
      minorLimitAge: minorAt.get(branchIndex) ?? null,
      childLimit: CHILD[position] ? [CHILD[position]] : [],
    };
  });

  return {
    lunar: { year: lunar.year, month: lunar.month, leap: lunar.leap, day: lunar.day },
    countedMonth,
    hourBranch: hour,
    yearPillar,
    minggongPillar,
    nayin: image,
    bureau,
    palaces,
    bodyBranch: BRANCHES[bodyIndex],
    lifeMaster: star(LIFE_MASTER[BRANCHES[mingIndex].id]),
    bodyMaster: star(BODY_MASTER[yearBranch.id]),
    options,
  };
}

function brightnessOf(id: ZiweiStarId, branch: BranchId): Brightness | null {
  const grade = BRIGHTNESS[id]?.[branch];
  return grade ? BRIGHTNESSES.find((b) => b.id === grade)! : null;
}
