import type { MessageKey, Translator } from '@qimendunjia/i18n';
import { BRANCHES, STEMS, type Ganzhi } from './ganzhi.js';
import { GENERALS, KETI, LIUREN_RULES } from './liuren.js';
import { CI, HOUSES, MOTIONS, QIZHENG_BODIES } from './qizheng.js';
import {
  DIRECTIONS,
  GATES,
  PALACES,
  PATTERN_IDS,
  SPIRITS_YANG,
  SPIRITS_YIN,
  STARS,
  VALENCE_IDS,
} from './dunjia/index.js';

/**
 * The words for what a chart contains, in one locale.
 *
 * Built once and handed to whatever draws or prints, so that the drawing
 * package can stay free of any catalog and the three surfaces cannot drift
 * into naming the same gate two different ways.
 */
export interface ChartLabels {
  palace: Record<string, string>;
  /**
   * The eight directions, abbreviated: `SE`, `NO`.
   *
   * Not `palace` cut short. The palace is named by its direction in full —
   * "southeast" — and this is the map's abbreviation of it, which is a
   * different word in every language and is asked for separately for that
   * reason. It is what the frame around the drawing is written in.
   */
  direction: Record<string, string>;
  star: Record<string, string>;
  gate: Record<string, string>;
  spirit: Record<string, string>;
  stem: Record<string, string>;
  pattern: Record<string, string>;
  /** 吉, 凶, or both — the fortune a configuration is transmitted with. */
  valence: Record<string, string>;
  /** The gates, the stars, or both: where a whole-board configuration came home. */
  layer: Record<string, string>;
}

/**
 * Not read off a runtime list the way the rest is, because there is none: a
 * layer is a field of `Pattern` with three values and no table behind it.
 */
const LAYERS = ['gate', 'star', 'both'];

export function chartLabels(t: Translator): ChartLabels {
  const from = <T extends { id: string }>(items: readonly T[], prefix: string) =>
    Object.fromEntries(items.map((item) => [item.id, t(`label.${prefix}.${item.id}` as MessageKey)]));

  return {
    palace: from(PALACES, 'palace'),
    direction: Object.fromEntries(
      DIRECTIONS.map((id) => [id, t(`label.compass.${id}` as MessageKey)]),
    ),
    star: from(STARS, 'star'),
    gate: from(GATES, 'gate'),
    spirit: { ...from(SPIRITS_YANG, 'spirit'), ...from(SPIRITS_YIN, 'spirit') },
    stem: from(STEMS, 'stem'),
    pattern: Object.fromEntries(
      PATTERN_IDS.map((id) => [id, t(`label.pattern.${id}` as MessageKey)]),
    ),
    valence: Object.fromEntries(
      VALENCE_IDS.map((id) => [id, t(`label.valence.${id}` as MessageKey)]),
    ),
    layer: Object.fromEntries(LAYERS.map((id) => [id, t(`label.layer.${id}` as MessageKey)])),
  };
}

/**
 * The words for what a Liu Ren board contains, in one locale.
 *
 * Built for the same reason `chartLabels` is: the drawing knows no language,
 * and two surfaces naming the same rule differently is the drift this exists
 * to prevent.
 */
export interface LiurenLabels {
  general: Record<string, string>;
  /** The twelve branches and the ten stems, for the drawing and the page. */
  branch: Record<string, string>;
  stem: Record<string, string>;
  rule: Record<string, string>;
  keti: Record<string, string>;
  transmission: Record<string, string>;
  /** The word for 空亡, where a transmission has no stem under it. */
  empty: string;
  /** The line a board carries when nothing could check the rule that drew it. */
  unverified: string;
}

export function liurenLabels(t: Translator): LiurenLabels {
  return {
    general: Object.fromEntries(
      GENERALS.map((general) => [general.id, t(`label.general.${general.id}` as MessageKey)]),
    ),
    branch: Object.fromEntries(
      BRANCHES.map((branch) => [branch.id, t(`label.branch.${branch.id}` as MessageKey)]),
    ),
    stem: Object.fromEntries(
      STEMS.map((stem) => [stem.id, t(`label.stem.${stem.id}` as MessageKey)]),
    ),
    rule: Object.fromEntries(
      Object.keys(LIUREN_RULES).map((id) => [id, t(`label.liurenRule.${id}` as MessageKey)]),
    ),
    keti: Object.fromEntries(
      Object.keys(KETI).map((id) => [id, t(`label.keti.${id}` as MessageKey)]),
    ),
    transmission: Object.fromEntries(
      ['chu', 'zhong', 'mo'].map((id) => [id, t(`label.transmission.${id}` as MessageKey)]),
    ),
    empty: t('cli.value.emptyBranch'),
    unverified: t('cli.value.liurenUnverified'),
  };
}

/**
 * The words a 七政四餘 drawing needs, in the reader's language.
 *
 * The eleven bodies and the twelve 人事宮 are the load-bearing pair: the ring
 * writes both in glyphs and neither is guessable from the shape. The twelve
 * 次 are here for the band of readings rather than for the ring, which has no
 * room for a word beside a name that is already two characters.
 *
 * The two lines under the board are labels and not captions: they say how
 * many remainders the board carries and where the 宿 begin, and both are true
 * of every board this engine draws. A picture travels further than the page
 * it was made on, so they travel on its face.
 */
export interface QizhengLabels {
  /** The eleven — the seven governors and the four remainders. */
  body: Record<string, string>;
  /** The twelve 人事宮, written under the palace each fell on. */
  house: Record<string, string>;
  /** The twelve 次, for the band of readings. */
  ci: Record<string, string>;
  motion: Record<string, string>;
  minggong: string;
  remainders: string;
  frame: string;
}

export function qizhengLabels(t: Translator): QizhengLabels {
  return {
    body: Object.fromEntries(
      QIZHENG_BODIES.map((one) => [one.id, t(`label.qizheng.${one.id}` as MessageKey)]),
    ),
    house: Object.fromEntries(
      HOUSES.map((house) => [house.id, t(`label.house.${house.id}` as MessageKey)]),
    ),
    ci: Object.fromEntries(CI.map((ci) => [ci.id, t(`label.ci.${ci.id}` as MessageKey)])),
    motion: Object.fromEntries(
      Object.keys(MOTIONS).map((id) => [id, t(`label.motion.${id}` as MessageKey)]),
    ),
    minggong: t('cli.field.minggong'),
    remainders: t('cli.value.threeRemainders'),
    frame: t('cli.value.qizhengFrame'),
  };
}

/**
 * A sexagenary pair, said in a European language.
 *
 * `甲辰` becomes "Yang Wood · Dragon". The stem is a phase with a polarity and
 * the branch is an animal — both of which a reader can hold on to, where the
 * two characters are two shapes to memorise. The pair is still the pair; this
 * only says it out loud.
 */
export function sayGanzhi(pair: Ganzhi, t: Translator): string {
  const stem = t(`label.stem.${pair.stem.id}` as MessageKey);
  const branch = t(`label.branch.${pair.branch.id}` as MessageKey);
  return `${stem} · ${branch}`;
}

/** The animal alone, for places where the phase is already said. */
export function sayBranch(index: number, t: Translator): string {
  const branch = BRANCHES[index];
  return branch ? t(`label.branch.${branch.id}` as MessageKey) : '';
}
