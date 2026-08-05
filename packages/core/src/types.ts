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
}

/**
 * What the engine assumes when a surface says nothing.
 *
 * Read this only where a surface builds its own defaults. Passing it into the
 * engine is the caller's job, never the engine's.
 */
export const DEFAULT_OPTIONS: ChartOptions = {
  method: 'chaibu',
  plate: 'zhuan',
  trueSolarTime: true,
  yearBoundary: 'lichun',
  dayBoundary: 'zishi',
  system: 'shijia',
};

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
