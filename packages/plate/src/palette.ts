/**
 * The colours, and the reason there are so few of them.
 *
 * A palace already says which phase it belongs to, in a character anyone
 * reading this chart can read. Colouring it as well is a second copy of the
 * same fact, so the tint here is faint — enough to group the board at a
 * glance, not enough to be read instead of the glyphs.
 *
 * Everything is emitted as a custom property, which is what lets one drawing
 * carry both schemes and let the page decide.
 */

export type Scheme = 'light' | 'dark';

export interface Palette {
  ink: string;
  /**
   * What glosses something, and never the gloss itself.
   *
   * The corner number, the branches around the frame, the hanzi set small
   * beside a word that renders it: things a reader glances at or already knows
   * the shape of. See `word` for the other half of what this used to carry.
   */
  faint: string;
  /**
   * The reader's own language, wherever it appears on the board.
   *
   * It was drawn in `faint`, on the reasoning that the hanzi is the content
   * and the word beside it is an aid. That is true of a reader who reads
   * Chinese and false of the one this drawing is for — for them the word *is*
   * the content and the hanzi is what they cannot use, and it was the content
   * that was set at 4.6:1 under a name set at 17:1. Held at 7:1 or better on
   * the paper and on all five tints, which is what small text set at a
   * twentieth of a palace has to be.
   *
   * Still under `ink`, and under it by a factor of two: the name leads and the
   * word follows. What changed is that following is no longer whispering.
   */
  word: string;
  rule: string;
  ground: string;
  /** One faint tint per phase, keyed by the engine's identifiers. */
  element: Record<string, string>;
  /**
   * The same five phases at ink strength, for the glyphs that *are* a phase.
   *
   * A stem is its phase — 丙 is fire, not a thing that happens to be filed
   * under fire — and the relation between the two stems standing in a palace
   * is the first thing anyone reads off a chart. Written in the phase's own
   * colour that relation is visible before a single character is; written in
   * plain ink it has to be looked up twice and held in the head.
   *
   * Only the phases are coloured, and only where the glyph is one. Everything
   * else stays ink: five colours is a vocabulary, twelve is a decoration.
   */
  elementInk: Record<string, string>;
  /** Where a configuration is marked. */
  mark: string;
}

export const PALETTES: Record<Scheme, Palette> = {
  light: {
    ink: '#1a1a1a',
    faint: '#6a6a6a',
    // 8.1:1 on the paper, and 7.1:1 on the water tint, which is the darkest of
    // the five and so the case that decides.
    word: '#524e47',
    // The grid is not decoration on this drawing — it is what says where one
    // palace ends and the next begins, so it answers to the 3:1 asked of a
    // graphic somebody has to read. At #c9c4bb it was 1.7:1 and the board came
    // out a wash with characters floating in it.
    rule: '#948c80',
    ground: '#fdfcfa',
    element: {
      mu: '#eef4ea',
      huo: '#faeeea',
      tu: '#f6f1e6',
      jin: '#eff1f4',
      shui: '#e9eef3',
    },
    // Metal is white and water is black in the tradition, and neither is
    // legible as ink on paper. They are taken here at the nearest thing the
    // eye still files under the phase: steel, and deep blue.
    elementInk: {
      mu: '#2f6b3a',
      huo: '#a5372a',
      tu: '#8a6620',
      jin: '#556170',
      shui: '#2a4c7d',
    },
    // 8.5:1 on the paper and 7.5:1 on the water tint. It is a word in the
    // reader's language too — «vuoto», «la grande barriera» — and it was
    // sitting at 4.6:1 along the foot of a palace, which is the smallest type
    // on the board. It stays a shade ahead of `word` on purpose: on a line of
    // the band the configuration leads and its fortune follows, and a band
    // whose heaviest word is the fortune would be ranking the hour.
    mark: '#6e3f28',
  },
  dark: {
    ink: '#e8e4dd',
    faint: '#8f8a82',
    /* 7.9:1 on the ground, 7.2:1 on the wood tint — the lightest of the five,
       which on a dark ground is the one that decides. */
    word: '#b0aaa1',
    /* 1.6:1 against the ground, for the same reason and with the same fix. */
    rule: '#6b665e',
    ground: '#16150f',
    element: {
      mu: '#1a2118',
      huo: '#241a17',
      tu: '#211d15',
      jin: '#191c20',
      shui: '#161d24',
    },
    elementInk: {
      mu: '#87bb8b',
      huo: '#dd8f80',
      tu: '#d0af66',
      jin: '#a6b3c0',
      shui: '#86a9d6',
    },
    /* 8.7:1 on the ground and 7.8:1 on the wood tint, and ahead of `word` for
       the same reason as in the light palette. */
    mark: '#dda880',
  },
};

const PHASES = ['mu', 'huo', 'tu', 'jin', 'shui'] as const;

const FLAT = ['ink', 'faint', 'word', 'rule', 'ground', 'mark'] as const;

function declarations(palette: Palette): string {
  return [
    ...FLAT.map((name) => `--qmdj-${name}: ${palette[name]};`),
    ...PHASES.map((phase) => `--qmdj-element-${phase}: ${palette.element[phase] as string};`),
    ...PHASES.map((phase) => `--qmdj-ink-${phase}: ${palette.elementInk[phase] as string};`),
  ].join(' ');
}

/**
 * The stylesheet the drawing carries with it.
 *
 * With `auto`, the light values are the declared ones and the dark values
 * arrive through a media query: a drawing saved to a file, mailed, or dropped
 * into a page nobody controls still reads correctly at night.
 */
export function styleSheet(scheme: 'light' | 'dark' | 'auto'): string {
  if (scheme !== 'auto') return `:root { ${declarations(PALETTES[scheme])} }`;

  return [
    `:root { ${declarations(PALETTES.light)} }`,
    `@media (prefers-color-scheme: dark) { :root { ${declarations(PALETTES.dark)} } }`,
  ].join('\n');
}

/**
 * The font stack.
 *
 * The glyphs are the drawing. A renderer that finds none of these produces an
 * empty grid rather than a wrong chart, which is the better failure of the
 * two but still a failure — and a silent one, so `png.ts` checks for it.
 *
 * The serif families come first because the chart reads better in one, and
 * the sans families follow because a bare `fonts-noto-cjk` installs those —
 * a stack that named only the serifs would fall through to a Latin default
 * with no Chinese coverage at all.
 */
export const FONT_STACK =
  "'Noto Serif CJK SC', 'Noto Serif CJK TC', 'Source Han Serif', 'Songti SC', " +
  "'Noto Sans CJK SC', 'Noto Sans CJK TC', 'PingFang SC', 'Microsoft YaHei', " +
  "'WenQuanYi Zen Hei', serif";
