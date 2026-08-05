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
  faint: string;
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
    faint: '#7a7a7a',
    rule: '#c9c4bb',
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
    mark: '#9a5b3d',
  },
  dark: {
    ink: '#e8e4dd',
    faint: '#8f8a82',
    rule: '#3a3833',
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
    mark: '#c98a63',
  },
};

const PHASES = ['mu', 'huo', 'tu', 'jin', 'shui'] as const;

const FLAT = ['ink', 'faint', 'rule', 'ground', 'mark'] as const;

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
