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
    mark: '#c98a63',
  },
};

const VARIABLES = [
  'ink',
  'faint',
  'rule',
  'ground',
  'mark',
  'element-mu',
  'element-huo',
  'element-tu',
  'element-jin',
  'element-shui',
] as const;

function declarations(palette: Palette): string {
  return VARIABLES.map((name) => {
    const value = name.startsWith('element-')
      ? (palette.element[name.slice('element-'.length)] as string)
      : (palette[name as 'ink' | 'faint' | 'rule' | 'ground' | 'mark'] as string);
    return `--qmdj-${name}: ${value};`;
  }).join(' ');
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
