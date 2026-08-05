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
    // Anchoring stays out of the sheet: a rule here would outrank the
    // `text-anchor` each line carries — a declaration beats a presentation
    // attribute — and every line would centre, including the one written
    // from the corner, which would then hang half outside its palace.
    `<style>${styleSheet(options.scheme ?? 'auto')}
      .qmdj { font-family: ${FONT_STACK}; }
      .qmdj text { fill: var(--qmdj-ink); }
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

/**
 * How much smaller the name is set than the word that renders it.
 *
 * A hanzi is square where a letter is half as wide, so the same nominal size
 * already reads as larger. Set at three quarters it sits beside the word
 * without competing with it.
 */
const HANZI_SCALE = 0.75;

/** A hair space, which no renderer collapses the way it collapses a space. */
const GAP = ' ';

/**
 * A thing said twice: the word for it, and the name it renders.
 *
 * 天蓬 is not the Chinese for "Canopy", it is what the star is called, and a
 * reader who knows the subject looks for it. So the word leads — the drawing
 * has to be usable by someone who reads no Chinese — and the name follows it
 * smaller and fainter, exactly as the tables do it.
 *
 * A caller who supplied no words gets the name alone, which is what this
 * drew before there was any way to ask for anything else.
 */
function named(
  thing: Named,
  from: Record<string, string> | undefined,
  tail = '',
  /** Empty leaves the name the colour of its line, for a line already tinted. */
  className = 'faint',
): Run[] {
  const word = from?.[thing.id];
  if (!word) return [{ text: `${thing.hanzi}${tail}` }];

  return [{ text: word }, { text: `${GAP}${thing.hanzi}${tail}`, scale: HANZI_SCALE, className }];
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
      palace.spirit ? named(palace.spirit, labels.spirit) : [],
      geometry.font.small,
      { className: 'faint', maxWidth: inner },
    ),
    text(
      middle,
      at(geometry.line.star),
      named(palace.star, labels.star, strength(palace.starStrength)),
      geometry.font.small,
      { maxWidth: inner },
    ),
    text(
      middle,
      at(geometry.line.gate),
      palace.gate ? named(palace.gate, labels.gate, strength(palace.gateStrength)) : [],
      geometry.font.small,
      { maxWidth: inner },
    ),
    text(middle, at(geometry.line.heaven), named(palace.heaven, labels.stem), geometry.font.glyph, {
      maxWidth: inner,
    }),
    text(middle, at(geometry.line.earth), named(palace.earth, labels.stem), geometry.font.glyph, {
      maxWidth: inner,
    }),
  ];

  // The palace names itself in the corner, small: the reader who needs it
  // looks for it, and the reader who does not is not interrupted by it.
  //
  // Written from the left edge inwards, so the width left to it is what
  // remains to the far side of the palace — a name set from the corner has
  // the inset against it, not half of it as a centred line would.
  const inset = side * 0.06;
  parts.push(
    text(
      x + inset,
      at(geometry.line.name),
      [{ text: `${palace.palace.number}${GAP}` }, ...named(palace.palace, labels.palace)],
      geometry.font.small * 0.8,
      { className: 'faint', maxWidth: side - inset * 2, anchor: 'start' },
    ),
  );

  // On a line of their own along the foot, centred and small. Anywhere in a
  // corner they meet either the palace's own name or the next palace's.
  if (marks.length > 0) {
    parts.push(
      text(
        middle,
        at(geometry.line.marks),
        // The whole line is the mark's colour, names included: two colours
        // on one foot would read as two different things having happened.
        marks.flatMap((mark, index) => [
          ...(index > 0 ? [{ text: ' · ' }] : []),
          ...named(mark, labels.pattern, '', ''),
        ]),
        geometry.font.small * 0.8,
        { className: 'mark', maxWidth: inner },
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

/**
 * What separates two things on a caption line.
 *
 * A visible mark and not a run of spaces: SVG collapses whitespace, so a
 * caption set three spaces apart arrives with its two halves touching —
 * `capo Baldacchino porta del capo Riposo`, read as one phrase.
 */
const BETWEEN = ' — ';

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
    .join(BETWEEN);
  parts.push(text(middle, margin * 0.45, head, font.caption, { maxWidth: size * 0.94 }));

  const foot = [captions.chief, captions.chiefGate].filter(Boolean).join(BETWEEN);
  parts.push(text(middle, size - margin * 0.58, foot, font.caption, { maxWidth: size * 0.94 }));

  // The disclaimer travels with the picture, because a picture travels
  // further than the page it was made on.
  if (captions.note) {
    parts.push(text(middle, size - margin * 0.22, captions.note, font.caption * 0.82, { className: 'faint' }));
  }

  return parts.filter(Boolean).join('\n');
}

/** How a line is set, beyond where it goes and what it says. */
interface Line {
  className?: string;
  /** Beyond this the line is shrunk rather than allowed to run over. */
  maxWidth?: number;
  /** Default `middle`: everything is centred in its register but the name. */
  anchor?: 'start' | 'middle';
}

/**
 * A stretch of a line, set at its own size and in its own colour.
 *
 * One line carries two things at once — a word and the name it renders — and
 * they are not set alike. Everything else about them is shared, which is why
 * they are runs of one line rather than two lines that have to be kept level.
 */
interface Run {
  text: string;
  /** Relative to the size of the line. Default 1. */
  scale?: number;
  className?: string;
}

function text(x: number, y: number, content: string | Run[], size: number, line: Line = {}): string {
  const runs = (typeof content === 'string' ? [{ text: content }] : content).filter(
    (run) => run.text,
  );
  if (runs.length === 0) return '';

  const fitted = fit(runs, size, line.maxWidth);
  const attribute = line.className ? ` class="${line.className}"` : '';
  const anchor = line.anchor ?? 'middle';
  const body = runs.map((run) => setRun(run, fitted)).join('');

  return `<text x="${round(x)}" y="${round(y)}"${attribute} font-size="${round(fitted)}" text-anchor="${anchor}">${body}</text>`;
}

/** A run set apart from its line, or plain text where it is set like it. */
function setRun(run: Run, size: number): string {
  const scaled = run.scale !== undefined && run.scale !== 1;
  const attributes =
    (run.className ? ` class="${run.className}"` : '') +
    (scaled ? ` font-size="${round(size * (run.scale as number))}"` : '');

  return attributes ? `<tspan${attributes}>${escape(run.text)}</tspan>` : escape(run.text);
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
function fit(runs: Run[], size: number, maxWidth?: number): number {
  if (!maxWidth) return size;

  // Each run is measured at its own size, and the whole line is shrunk by
  // whatever it takes: the word and the name it renders keep their
  // proportion to one another whatever the line has to come down to.
  let width = 0;
  for (const run of runs) {
    let ems = 0;
    for (const character of run.text) ems += /[⺀-鿿＀-｠]/.test(character) ? 1 : 0.54;
    width += ems * (run.scale ?? 1);
  }
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
