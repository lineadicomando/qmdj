import { cells, layout, origin, type Cell, type Layout } from './geometry.js';
import { FONT_STACK, styleSheet } from './palette.js';
import type {
  Named,
  PlateChart,
  PlateLabels,
  PlateOptions,
  PlatePalace,
  PlatePattern,
} from './types.js';

/**
 * The five states of strength as a ramp rather than as words.
 *
 * "Prospering" and "imprisoned" are too long to sit in a palace, and the
 * thing they say is an ordering — five steps from full to spent. A ramp says
 * that at a glance and in no language, which is what the rest of the cell is
 * trying to be.
 */
const STRENGTH_MARK: Record<string, string> = {
  wang: '▲',
  xiang: '△',
  xiu: '○',
  qiu: '▽',
  si: '▼',
};

const DEFAULT_SIZE = 640;

/**
 * Draws a chart as SVG.
 *
 * What goes in the palaces is the caller's choice. Hand it `labels` and it
 * writes words; hand it none and it writes hanzi, which is what it did before
 * there was a choice. Either way it holds no catalog and knows no language —
 * the words arrive already chosen, and all this decides is where they go.
 */
export function renderChartSvg(chart: PlateChart, options: PlateOptions = {}): string {
  const size = options.size ?? DEFAULT_SIZE;
  const captions = options.captions;
  const geometry = layout(size, captions !== undefined);
  const byNumber = new Map(chart.palaces.map((palace) => [palace.palace.number, palace]));
  const marked = markedPalaces(chart);

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${escape(ariaLabel(chart))}">`,
    `<style>${styleSheet(options.scheme ?? 'auto')}
      .qmdj { font-family: ${FONT_STACK}; }
      .qmdj text { fill: var(--qmdj-ink); text-anchor: middle; }
      .qmdj .faint { fill: var(--qmdj-faint); }
      .qmdj .mark { fill: var(--qmdj-mark); }
      .qmdj .rule { stroke: var(--qmdj-rule); fill: none; }
    </style>`,
    // Both as an attribute and in the sheet: rasterisers apply
    // presentation attributes reliably and class selectors not at all.
    `<g class="qmdj" font-family="${FONT_STACK.replace(/"/g, '&quot;')}">`,
    `<rect x="0" y="0" width="${size}" height="${size}" fill="var(--qmdj-ground)"/>`,
  ];

  const labels = options.labels ?? {};
  for (const cell of cells()) {
    const palace = byNumber.get(cell.palace);
    if (palace) {
      parts.push(drawCell(cell, palace, geometry, marked.get(cell.palace) ?? [], labels));
    }
  }

  parts.push(drawGrid(geometry));
  if (captions) parts.push(drawCaptions(chart, captions, geometry));
  parts.push('</g></svg>');

  return parts.join('\n');
}

/** Which configurations fell where, so a palace can be marked with them. */
function markedPalaces(chart: PlateChart): Map<number, PlatePattern[]> {
  const marks = new Map<number, PlatePattern[]>();
  for (const pattern of chart.patterns) {
    if (pattern.palace === undefined) continue;
    marks.set(pattern.palace, [...(marks.get(pattern.palace) ?? []), pattern]);
  }
  return marks;
}

/** The word for a thing, or its hanzi where the caller supplied none. */
function word(named: Named, from: Record<string, string> | undefined): string {
  return from?.[named.id] ?? named.hanzi;
}

function drawCell(
  cell: Cell,
  palace: PlatePalace,
  geometry: Layout,
  marks: PlatePattern[],
  labels: PlateLabels,
): string {
  const { x, y } = origin(cell, geometry);
  const side = geometry.cell;
  const middle = x + side / 2;
  const tint = `var(--qmdj-element-${palace.palace.element})`;
  const at = (fraction: number): number => y + side * fraction;

  // Everything in a palace stays inside it, with a little air at the sides.
  const inner = side * 0.88;

  const strength = (state: Named | undefined): string =>
    state ? ` ${STRENGTH_MARK[state.id] ?? state.hanzi}` : '';

  const parts = [
    `<rect x="${x}" y="${y}" width="${side}" height="${side}" fill="${tint}"/>`,
    text(
      middle,
      at(geometry.line.spirit),
      palace.spirit ? word(palace.spirit, labels.spirit) : '',
      geometry.font.small,
      'faint',
      inner,
    ),
    text(
      middle,
      at(geometry.line.star),
      `${word(palace.star, labels.star)}${strength(palace.starStrength)}`,
      geometry.font.small,
      undefined,
      inner,
    ),
    text(
      middle,
      at(geometry.line.gate),
      palace.gate ? `${word(palace.gate, labels.gate)}${strength(palace.gateStrength)}` : '',
      geometry.font.small,
      undefined,
      inner,
    ),
    text(middle, at(geometry.line.heaven), word(palace.heaven, labels.stem), geometry.font.glyph, undefined, inner),
    text(middle, at(geometry.line.earth), word(palace.earth, labels.stem), geometry.font.glyph, undefined, inner),
  ];

  // The palace names itself in the corner, small: the reader who needs it
  // looks for it, and the reader who does not is not interrupted by it.
  parts.push(
    `<text x="${round(x + side * 0.06)}" y="${round(y + side * geometry.line.name)}" class="faint" font-size="${round(geometry.font.small * 0.8)}" text-anchor="start">${palace.palace.number} ${escape(labels.palace?.[palace.palace.id] ?? palace.palace.hanzi)}</text>`,
  );

  // On a line of their own along the foot, centred and small. Anywhere in a
  // corner they meet either the palace's own name or the next palace's.
  if (marks.length > 0) {
    parts.push(
      text(
        middle,
        at(geometry.line.marks),
        marks.map((mark) => labels.pattern?.[mark.id] ?? mark.hanzi).join(' · '),
        geometry.font.small * 0.8,
        'mark',
        inner,
      ),
    );
  }

  return parts.filter(Boolean).join('\n');
}

function drawGrid(geometry: Layout): string {
  const { margin, cell } = geometry;
  const end = margin + cell * 3;
  const lines: string[] = [];

  for (let i = 0; i <= 3; i += 1) {
    const at = round(margin + cell * i);
    lines.push(`<line class="rule" x1="${at}" y1="${round(margin)}" x2="${at}" y2="${round(end)}"/>`);
    lines.push(`<line class="rule" x1="${round(margin)}" y1="${at}" x2="${round(end)}" y2="${at}"/>`);
  }
  return lines.join('\n');
}

function drawCaptions(
  chart: PlateChart,
  captions: NonNullable<PlateOptions['captions']>,
  geometry: Layout,
): string {
  const { size, margin, font } = geometry;
  const middle = size / 2;
  const pillars = chart.moment.pillars;
  const parts: string[] = [];

  const head = [
    captions.ju,
    captions.pillars ??
      [pillars.year.hanzi, pillars.month.hanzi, pillars.day.hanzi, pillars.hour.hanzi].join(' '),
  ]
    .filter(Boolean)
    .join('   ');
  parts.push(text(middle, margin * 0.45, head, font.caption, undefined, size * 0.94));

  const foot = [captions.chief, captions.chiefGate].filter(Boolean).join('   ');
  parts.push(text(middle, size - margin * 0.58, foot, font.caption, undefined, size * 0.94));

  // The disclaimer travels with the picture, because a picture travels
  // further than the page it was made on.
  if (captions.note) {
    parts.push(text(middle, size - margin * 0.22, captions.note, font.caption * 0.82, 'faint'));
  }

  return parts.filter(Boolean).join('\n');
}

function text(
  x: number,
  y: number,
  content: string,
  size: number,
  className?: string,
  maxWidth?: number,
): string {
  if (!content) return '';
  const attribute = className ? ` class="${className}"` : '';
  return `<text x="${round(x)}" y="${round(y)}"${attribute} font-size="${round(fit(content, size, maxWidth))}">${escape(content)}</text>`;
}

/**
 * Shrinks a line until it fits the width it was given.
 *
 * The registers were proportioned for two hanzi. A word in a European
 * language is several times wider, so a cell that held 天蓬 comfortably will
 * not hold "Canopy" at the same size — and an SVG does not wrap or clip, it
 * simply runs into its neighbours.
 *
 * The width is estimated rather than measured: there is no text engine here,
 * and the estimate only has to be close enough to keep the line inside its
 * palace. A CJK glyph is square; a Latin letter is roughly half as wide.
 */
function fit(content: string, size: number, maxWidth?: number): number {
  if (!maxWidth) return size;

  let width = 0;
  for (const character of content) width += /[⺀-鿿＀-｠]/.test(character) ? 1 : 0.54;
  const needed = width * size;

  return needed > maxWidth ? (size * maxWidth) / needed : size;
}

/**
 * What a screen reader is told.
 *
 * A chart is a table of names, and read aloud it is exactly that: the hanzi,
 * palace by palace. There is nothing to describe about the picture that the
 * names do not already say.
 */
function ariaLabel(chart: PlateChart): string {
  const dun = chart.ju.yang ? '陽遁' : '陰遁';
  return `${dun}${chart.ju.number}局 — ${chart.palaces
    .map((palace) => `${palace.palace.hanzi}: ${palace.heaven.hanzi}${palace.earth.hanzi}`)
    .join(', ')}`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
