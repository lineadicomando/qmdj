import type { MessageKey, Translator } from '@qimendunjia/i18n';
import { BRANCHES, STEMS, type Ganzhi } from './ganzhi.js';
import { DIRECTIONS, GATES, PALACES, SPIRITS_YANG, SPIRITS_YIN, STARS } from './dunjia/index.js';

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
}

const PATTERN_IDS = [
  'kongwang',
  'rumu',
  'menpo',
  'jixing',
  'fuyin',
  'fanyin',
  'wubuyu',
  'qinglongfanshou',
  'feiniaodiexue',
];

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
