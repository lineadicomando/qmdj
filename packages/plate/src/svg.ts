import {
  CORNERS,
  EDGES,
  cells,
  layout,
  origin,
  type Cell,
  type Layout,
  type Register,
} from './geometry.js';
import { FONT_STACK, styleSheet } from './palette.js';
import type {
  Named,
  PlateChart,
  PlateDirections,
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

/**
 * How big the drawing is unless told otherwise.
 *
 * Every measurement below is a fraction of the side, so this changes what the
 * numbers in the file are and nothing about the layout: what is shrunk at 900
 * is shrunk at 400, and what fits at 400 fits at 900. It is the intrinsic
 * size — what the SVG takes up where nobody constrains it, and what the
 * raster is that many pixels wide by default.
 *
 * 900 rather than the old 640 because a palace now holds six names, each with
 * a word under it, where it used to hold five lines. Dropped into a document
 * at its intrinsic size, 640 renders that dense enough to need a lens.
 */
export const DEFAULT_SIZE = 900;

/** The five phases, as classes the sheet turns into ink colours. */
const PHASES = ['mu', 'huo', 'tu', 'jin', 'shui'] as const;

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
  const compass = options.compass;
  const geometry = layout(size, { captions: captions !== undefined, compass: compass !== undefined });
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
      ${PHASES.map((phase) => `.qmdj .${phase} { fill: var(--qmdj-ink-${phase}); }`).join('\n      ')}
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
  if (compass) parts.push(drawCompass(compass, geometry));
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
 * A thing said twice on one line: the word for it, then the name it renders.
 *
 * This is how the foot of a palace is written and not how a palace is — a
 * configuration is a footnote, and a footnote reads left to right rather than
 * stacking. In the palace proper the name leads and the word sits under it;
 * see `register`.
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

  const [top, centre, bottom] = geometry.line.row;
  const left = x + side * geometry.column.left;
  const right = x + side * geometry.column.right;
  /** A column is half a palace; a line inside it keeps clear of the seam. */
  const column = side * geometry.columnWidth;

  const entry = (
    at_: Register,
    column_: number,
    thing: Named | undefined,
    from: Record<string, string> | undefined,
    strength?: Named | undefined,
  ): string => register(column_, y + side * at_.glyph, y + side * at_.word, thing, from, strength, geometry, column);

  const parts = [
    `<rect x="${x}" y="${y}" width="${side}" height="${side}" fill="${tint}"/>`,

    // Left: the board as it was dealt. Heaven over earth, which is the
    // convention and the reason neither is labelled, and under them the
    // palace itself — the one thing here that never moves.
    entry(top, left, palace.heaven, labels.stem),
    entry(centre, left, palace.earth, labels.stem),
    entry(bottom, left, palace.palace, labels.palace),

    // Right: what came to stand over it, in the order it is always recited.
    entry(top, right, palace.spirit, labels.spirit),
    entry(centre, right, palace.star, labels.star, palace.starStrength),
    entry(bottom, right, palace.gate, labels.gate, palace.gateStrength),
  ];

  // The Luoshu number in the corner, small: it is the palace's identity for
  // anyone counting with it, and an interruption for everyone else. The word
  // for the palace is not here — it is under the trigram, where the trigram
  // can gloss it.
  //
  // Written from the left edge inwards, so the width left to it is what
  // remains to the far side — a line set from the corner has the whole inset
  // against it, not half of it as a centred line would.
  const inset = side * 0.06;
  parts.push(
    text(x + inset, at(geometry.line.number), String(palace.palace.number), geometry.font.number, {
      className: 'faint',
      maxWidth: side - inset * 2,
      anchor: 'start',
    }),
  );

  // On a line of their own along the foot, centred and small. Anywhere in a
  // corner they meet either the palace's own number or the next palace's.
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
        geometry.font.word,
        { className: 'mark', maxWidth: side * 0.9 },
      ),
    );
  }

  return parts.filter(Boolean).join('\n');
}

/**
 * One thing in a palace: its name, and the word for it underneath.
 *
 * The name is set large and, where the thing named is a phase, in that
 * phase's colour. The word is set small and faint below it, wrapping onto a
 * second line rather than shrinking, because a column half a palace wide will
 * not hold "Guerriero Oscuro" on one line at any size worth reading.
 *
 * Nothing is drawn for what is not there. The centre has no gate and no
 * spirit, and two blank registers are the honest picture of that.
 */
function register(
  x: number,
  glyphLine: number,
  wordLine: number,
  thing: Named | undefined,
  from: Record<string, string> | undefined,
  strength: Named | undefined,
  geometry: Layout,
  maxWidth: number,
): string {
  if (!thing) return '';

  const word = from?.[thing.id];
  // The state of strength rides at the end of the line under the name, in the
  // manner of a qualifier: it says something about the star, it is not a
  // seventh thing standing in the palace. Not on the name itself, because a
  // mark hanging off 天輔 pushes it off centre, and six names all pushed by a
  // different amount are what stops a column looking like a column.
  const mark = strength ? ` ${STRENGTH_MARK[strength.id] ?? strength.hanzi}` : '';

  const lines = [
    text(x, glyphLine, [{ text: thing.hanzi, className: thing.element }], geometry.font.glyph, {
      maxWidth,
    }),
  ];

  const size = geometry.font.word;
  // The mark shares the last line, so the width it takes is not the word's
  // to spend — counted here rather than discovered by `fit`, which would
  // shrink that one line and leave the palace next door set larger.
  const room = maxWidth / size - measure([{ text: mark }]);
  const parts = word ? broken(word, room) : [];
  // With no word for it the mark has nothing to hang off, and goes on the
  // line the word would have taken.
  if (parts.length === 0 && mark) parts.push(mark.trim());
  else if (mark) parts[parts.length - 1] += mark;

  for (const [index, part] of parts.entries()) {
    lines.push(text(x, wordLine + index * size * 1.08, part, size, { className: 'faint', maxWidth }));
  }

  return lines.filter(Boolean).join('\n');
}

/**
 * A word split across at most two lines, or left whole where it fits.
 *
 * Only ever two: a third line would run into the register below it. Where no
 * split leaves both halves inside the width — one very long word — it comes
 * back whole and `fit` shrinks it, which is the old behaviour and the right
 * one for a case with no better answer.
 *
 * The split is the one that leaves the two halves most nearly equal, so a
 * wrapped word reads as a block rather than as a line with a crumb under it.
 */
function broken(word: string, ems: number): string[] {
  if (measure([{ text: word }]) <= ems) return [word];

  const spaces = [...word].flatMap((character, index) => (character === ' ' ? [index] : []));
  let best: string[] | undefined;
  let widest = Infinity;

  for (const index of spaces) {
    const halves = [word.slice(0, index), word.slice(index + 1)];
    const width = Math.max(...halves.map((half) => measure([{ text: half }])));
    if (width < widest) {
      widest = width;
      best = halves;
    }
  }

  return best && widest <= ems ? best : [word];
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
 * The frame of directions, outside the grid.
 *
 * Two rings and a box. Against the grid, the twelve branches, each standing
 * over the palace whose quarter of the sky it falls in; outside them, the
 * word for each of the eight directions, at the middle of a side or in a
 * corner. The branches are set faint and the words in ink, which is the
 * palaces' arrangement turned around on purpose: inside a palace the name is
 * the content and the word glosses it, and out here the direction is what the
 * reader came for and the branch is what refines it.
 */
function drawCompass(directions: PlateDirections, geometry: Layout): string {
  const { margin, cell, compass, font } = geometry;
  const end = margin + cell * 3;
  const outer = margin - compass.band;
  const side = end - outer + compass.band;

  const parts = [
    `<rect class="rule" x="${round(outer)}" y="${round(outer)}" width="${round(side)}" height="${round(side)}"/>`,
  ];

  /** How far out a ring falls, on the near side of the grid or on the far one. */
  const ring = (distance: number, outward: -1 | 1): number =>
    outward < 0 ? margin - distance : end + distance;

  for (const edge of EDGES) {
    const horizontal = edge.along === 'x';
    const write = (along: number, distance: number, word: string, size: number, line: Line): string => {
      const across = ring(distance, edge.outward);
      return text(
        horizontal ? along : across,
        baseline(horizontal ? across : along, size),
        word,
        size,
        line,
      );
    };

    for (const [index, branch] of edge.branches.entries()) {
      parts.push(write(margin + cell * (index + 0.5), compass.branch, branch, font.branch, {
        className: 'faint',
        maxWidth: cell,
      }));
    }

    const word = directions[edge.direction];
    // The middle of the side, which is the palace the direction is named for:
    // 午 is due south and Li is the southern palace, and the word belongs over
    // both rather than floating between the three.
    if (word) {
      parts.push(write(margin + cell * 1.5, compass.word, word, font.direction, { maxWidth: cell }));
    }
  }

  for (const corner of CORNERS) {
    const word = directions[corner.direction];
    if (!word) continue;
    // On the diagonal, where the two bands meet and no branch stands: the
    // corner palaces hold two branches each, one on each of their outer
    // sides, and neither of them is the corner.
    parts.push(
      text(
        ring(compass.word, corner.x),
        baseline(ring(compass.word, corner.y), font.direction),
        word,
        font.direction,
        { maxWidth: compass.band * 1.7 },
      ),
    );
  }

  return parts.filter(Boolean).join('\n');
}

/**
 * A line centred on a ring rather than standing on it.
 *
 * A baseline is the foot of the letters, so a line placed at the centre of
 * the band hangs above it. Half the cap height back down puts the ink where
 * the number said, which is what keeps the two rings evenly apart on all four
 * sides of the board.
 */
function baseline(centre: number, size: number): number {
  return centre + size * 0.35;
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
  // What is left of the margin once the compass has its band, which is what
  // the captions were always set in. Measured from the paper's edge and not
  // from the grid's, so a drawing that grew a frame does not push its own
  // lines out with it — the foot would land on the frame, and the head would
  // drift halfway up the page.
  const outside = margin - geometry.compass.band;

  const head = [
    captions.ju,
    captions.pillars ??
      [pillars.year.hanzi, pillars.month.hanzi, pillars.day.hanzi, pillars.hour.hanzi].join(' '),
  ]
    .filter(Boolean)
    .join(BETWEEN);
  parts.push(text(middle, outside * 0.45, head, font.caption, { maxWidth: size * 0.94 }));

  const foot = [captions.chief, captions.chiefGate].filter(Boolean).join(BETWEEN);
  parts.push(text(middle, size - outside * 0.58, foot, font.caption, { maxWidth: size * 0.94 }));

  // The disclaimer travels with the picture, because a picture travels
  // further than the page it was made on.
  if (captions.note) {
    parts.push(text(middle, size - outside * 0.22, captions.note, font.caption * 0.82, { className: 'faint' }));
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
 * The last resort, not the first: an over-long word is broken across two
 * lines before it is shrunk, and only a word with nowhere to break gets here.
 * An SVG neither wraps nor clips of its own accord, so a line that does
 * neither simply runs into the palace next door.
 */
function fit(runs: Run[], size: number, maxWidth?: number): number {
  if (!maxWidth) return size;

  // Each run is measured at its own size, and the whole line is shrunk by
  // whatever it takes: the word and the name it renders keep their
  // proportion to one another whatever the line has to come down to.
  const needed = measure(runs) * size;

  return needed > maxWidth ? (size * maxWidth) / needed : size;
}

/**
 * How wide a line is, in ems of its own size.
 *
 * Estimated rather than measured: there is no text engine here, and the
 * estimate only has to be close enough to keep the line inside its palace.
 * A CJK glyph is square; a Latin letter is roughly half as wide.
 */
function measure(runs: Run[]): number {
  let width = 0;
  for (const run of runs) {
    let ems = 0;
    for (const character of run.text) ems += /[⺀-鿿＀-｠]/.test(character) ? 1 : 0.54;
    width += ems * (run.scale ?? 1);
  }
  return width;
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
