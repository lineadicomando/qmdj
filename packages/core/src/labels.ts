import type { MessageKey, Translator } from '@qimendunjia/i18n';
import { BRANCHES, STEMS, type Ganzhi } from './ganzhi.js';
import { GENERALS, KETI, LIUREN_RULES } from './liuren.js';
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
