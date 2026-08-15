/**
 * The options that make a chart reproducible.
 *
 * Different schools produce different charts from identical input. Every such
 * divergence is a parameter here, with a declared default, and it is present
 * from the first release even where only one value is implemented yet:
 * adding one later would break the API, the MCP tools, the CLI and every
 * shared URL at once.
 *
 * No function in the engine reads a global default. Options travel as
 * arguments and a chart carries them in its own output, so that a chart saved
 * today reproduces identically tomorrow.
 */
export interface ChartOptions {
  /**
   * How the ju number is established: 拆補, 置閏 or 茅山.
   *
   * The most divisive parameter of the whole engine. Two practitioners of
   * different schools, given the same instant, will lay out different plates
   * and neither is making a mistake.
   */
  method: 'chaibu' | 'zhirun' | 'maoshan';

  /**
   * Where the yuan is read from, under 拆補.
   *
   * A divergence *inside* 拆補, and one that changes the ju of most days.
   * `term` cuts the fifteen days of the term into three fives from the
   * instant it began, so the yuan turns with the term. `futou` reads it from
   * the day instead: the days run in five-day stretches headed by a 甲 or 己
   * day (the 符頭), and where the day stands in that fifteen-day cycle is the
   * yuan, whatever the term is doing. The two agree only when a term happens
   * to open on a 符頭.
   *
   * `term` is the default because it is what this engine shipped and what
   * `qimen-dunjia` computes; `futou` is what `kinqimen` and
   * fengshui-hacks.com compute, which is the two independent sources
   * `docs/sources.md` asks for before a reading is offered at all.
   *
   * It has no bearing under 置閏, where the yuan is the 符頭's by
   * construction — that is what the method *is*, not a choice inside it.
   */
  yuan: 'term' | 'futou';

  /**
   * How the heaven plate is derived: rotating (轉盤) or flying (飛盤).
   */
  plate: 'zhuan' | 'fei';

  /**
   * Whether to correct clock time to true solar time at the place.
   *
   * The correction has two parts: the longitude's offset from the meridian
   * that defines the zone, and the equation of time. Together they reach a
   * little over an hour, which is more than the width of an hour pillar.
   */
  trueSolarTime: boolean;

  /**
   * Where the year of the pillars begins: at Lichun (立春) or at the lunar
   * new year (正月初一).
   *
   * Lichun is the near-universal choice for the Four Pillars. The lunar new
   * year exists here because some almanac traditions count by it, and because
   * a chart cast between the two dates differs by a full year pillar.
   *
   * **It moves the month pillar with it, and that is not a second decision.**
   * The month branch is the solar term's in either case, but its *stem* comes
   * from the year stem by 五虎遁, so a year pillar that turned at a different
   * instant hands the mnemonic a different stem. Between the two dates
   * `chunjie` therefore reports a month pillar no lichun almanac prints —
   * 2024-02-06 is 癸卯年甲寅月 under it and 甲辰年丙寅月 under lichun.
   * Which of the two an almanac counting by the lunar new year would itself
   * print is a question no source consulted here answers, so the rule is
   * applied as stated rather than special-cased. See `docs/sources.md`.
   */
  yearBoundary: 'lichun' | 'chunjie';

  /**
   * Where the day pillar turns over.
   *
   * `zishi` turns it at 23:00, when the hour of the Rat opens; `midnight`
   * holds it to the civil date. They disagree only for births in that one
   * hour, and there they disagree about the day pillar — a quarter of the
   * chart, changing nothing else.
   *
   * The hour pillar is *not* in dispute: from 23:00 its stem is read from the
   * day the hour of the Rat opens, under either setting. That is what the
   * doctrine of the late hour of the Rat says, and it is why `midnight` is
   * not simply "everything stays put".
   */
  dayBoundary: 'zishi' | 'midnight';

  /**
   * Which family of Qi Men chart: hour, day, month or year.
   */
  system: 'shijia' | 'rijia' | 'yuejia' | 'nianjia';

  /**
   * Where the centre lodges (寄宮).
   *
   * The centre has no direction, no gate and no spirit, so whatever the ju
   * puts there has to be read somewhere else. `kun` sends it to the palace of
   * Kun always, which is the common choice and the one implemented; `dun`
   * sends it to Kun in a yang chart and to Gen in a yin one, which other
   * schools hold to.
   *
   * It is a parameter and not a constant for the reason every divergence here
   * is one: the palace the centre lodges in decides which palace the chief and
   * the chief gate are read from, so two schools cast measurably different
   * charts from it. It was a hardcoded 2 until the parameter existed, which
   * made this engine's school implicit — the one thing this project says it
   * will not do.
   */
  centreLodging: 'kun' | 'dun';

  /**
   * Which register of 神煞 the almanac's page carries (曆注).
   *
   * `xieji` is the only value implemented: what 《協紀辨方書》 ratifies, cut to
   * what bears on the quality of a day and the bearing of a direction. There
   * are hundreds of 神煞 and they diverge by lineage far more than the schools
   * of dunjia do, so a second register must be able to arrive without breaking
   * a shared link — which is why this exists before there is anything to
   * choose.
   *
   * **It is the one option the page reads, and the exception proves the rule
   * it lives by.** `dayBoundary` and `trueSolarTime` say how an *instant* is
   * read and never reach the almanac, because a page belongs to a date and the
   * same date is the same page for everybody. This says which *book* was
   * copied out, which is a fact about the page itself — the parallel of
   * `method` in dunjia, not of `dayBoundary`.
   */
  shensha: 'xieji';
}

/**
 * What the engine assumes when a surface says nothing.
 *
 * Read this only where a surface builds its own defaults. Passing it into the
 * engine is the caller's job, never the engine's. Frozen, because a surface
 * that could write to it would change what "default" means for every caller
 * after it: spread it and set the copy.
 */
export const DEFAULT_OPTIONS: ChartOptions = Object.freeze({
  method: 'chaibu',
  yuan: 'term',
  plate: 'zhuan',
  trueSolarTime: true,
  yearBoundary: 'lichun',
  dayBoundary: 'zishi',
  system: 'shijia',
  centreLodging: 'kun',
  shensha: 'xieji',
});

/** Where on Earth the chart is cast. */
export interface Place {
  /** Decimal degrees, positive north. */
  latitude: number;
  /** Decimal degrees, positive east. */
  longitude: number;
  /** IANA identifier, e.g. `Asia/Shanghai`. */
  timezone: string;
}

/** The five phases. Toneless pinyin, as everywhere the domain is Chinese. */
export type Element = 'mu' | 'huo' | 'tu' | 'jin' | 'shui';

export const ELEMENT_HANZI: Record<Element, string> = {
  mu: '木',
  huo: '火',
  tu: '土',
  jin: '金',
  shui: '水',
};
