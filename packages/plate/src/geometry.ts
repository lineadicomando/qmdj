/**
 * Where everything sits on the board.
 *
 * The one thing to know: **south is at the top**. A Qi Men chart is drawn the
 * way a Chinese map is, which is upside down against a European compass, and
 * a drawing that quietly rotated it would be unreadable to everyone who knows
 * the subject.
 */

/** The nine palaces in reading order, three rows of three. */
export const WRITTEN_ORDER: readonly number[] = [4, 9, 2, 3, 5, 7, 8, 1, 6];

export interface Cell {
  /** Luoshu number of the palace drawn here. */
  palace: number;
  column: number;
  row: number;
}

export function cells(): Cell[] {
  return WRITTEN_ORDER.map((palace, index) => ({
    palace,
    column: index % 3,
    row: Math.floor(index / 3),
  }));
}

/**
 * One thing standing in a palace: the name, and the word that renders it.
 *
 * Two baselines rather than one line carrying both. Set side by side they
 * compete for a width that is half a palace wide, and the longer word wins by
 * shrinking the glyph it was supposed to gloss; stacked, each gets the whole
 * column and the glyph keeps its size whatever language the reader asked for.
 */
export interface Register {
  /** Baseline of the name, set large. */
  glyph: number;
  /** Baseline of the word under it, set small. */
  word: number;
}

/**
 * The band outside the grid, and the two rings written in it.
 *
 * Two rings and not one line: the branches sit against the grid, where they
 * point at the palace they fall in, and the words for the eight directions
 * stand outside them, where they read as a frame rather than as something the
 * palace contains. Both are measured outward from the edge of the grid, so
 * the same two numbers place a line above, below, or to either side of it.
 */
export interface Compass {
  /** Width of the band. Zero where the drawing has no compass. */
  band: number;
  /** Centre of the ring of branches, outward from the grid. */
  branch: number;
  /** Centre of the ring of direction words, outward from the branches. */
  word: number;
}

/**
 * The band under the grid where the configurations are listed.
 *
 * Its height is a function of what it carries rather than a constant, which
 * is the difference between this band and the compass's: a frame is the same
 * frame on every chart, and a list is as long as the chart made it.
 *
 * **What it is a function of is the paper's height, and nothing else.** It
 * used to come out of the grid, and the grid is square: a list one line longer
 * shrank the palaces in both directions, so stepping the hour resized the
 * board under the reader's eyes without the window having moved. Over a year
 * of hours a chart falls into between one and nine configurations — mostly
 * three to six — and that swing was a third of the board's side.
 *
 * So the paper grows downward by exactly what the list needs, and the grid
 * keeps the whole square whatever the hour. The board is the same size on
 * every chart, and it is larger on all of them than the largest it used to be.
 */
export interface Foot {
  /** Total height. Zero where the drawing has no band. */
  band: number;
  /** Baseline of the heading, downward from the top of the band. */
  heading: number;
  /** Baseline of the first entry, and the step to each one after it. */
  first: number;
  step: number;
}

export interface Layout {
  /**
   * The side of the square: the width of the paper, and the height of
   * everything down to the foot of the grid.
   *
   * Every proportion here is a fraction of it, so one number still scales the
   * whole drawing. It is no longer the height — see `height`.
   */
  size: number;
  /** Space around the grid, which the captions and the compass live in. */
  margin: number;
  /**
   * The height of the paper: the square, plus whatever the list needs.
   *
   * Equal to `size` on a drawing with no band, which is what this was before
   * there was a band at all.
   */
  height: number;
  /** Side of one palace. */
  cell: number;
  /** The band the compass is written in. Zero where there is none. */
  compass: Compass;
  /** The band the configurations are listed in. Zero where there is none. */
  foot: Foot;
  /** Centres of the two columns, as fractions of the side. */
  column: { left: number; right: number };
  /** Widest a line inside a column may be, as a fraction of the side. */
  columnWidth: number;
  /** Baselines within a cell, as fractions of its side. */
  line: {
    /** The Luoshu number, in the corner. */
    number: number;
    /** Three registers to a column, read top to bottom. */
    row: readonly [Register, Register, Register];
    /** Whatever configurations fell here, along the foot. */
    marks: number;
  };
  font: {
    glyph: number;
    word: number;
    number: number;
    caption: number;
    branch: number;
    direction: number;
    /** One line of the band under the grid. */
    entry: number;
  };
}

/** What the drawing was asked to carry around the grid, which decides the margin. */
export interface Around {
  captions?: boolean;
  compass?: boolean;
  /** How many configurations the band under the grid has to list. */
  configurations?: number;
}

/**
 * Proportions, derived from the side so that one number scales the whole
 * drawing and nothing has to be re-tuned.
 *
 * The compass takes a band of its own rather than sharing the captions':
 * squeezed into the same margin it would meet the caption line at the top and
 * both the chief's line and the note at the foot. The grid comes down by the
 * width of the band, which is the honest cost of a frame that says which way
 * the board faces.
 */
export function layout(size: number, around: Around = {}): Layout {
  const band = around.compass ? size * 0.055 : 0;
  // A caption is one line, and the head sits at 0.45 of this and the foot at
  // 0.58 of it from the far edge: at 0.085 the line had two of its own heights
  // of air above it and the grid paid for all of it, twice over. Enough to
  // stand the line clear of the frame, and no more.
  const margin = (around.captions ? size * 0.07 : size * 0.03) + band;

  // The heading, then one line per configuration, then the air that keeps the
  // last of them off the caption below. Zero lines is no band at all rather
  // than a heading over nothing.
  const entries = around.configurations ?? 0;
  const step = size * 0.026;
  const foot: Foot = entries
    ? { band: size * 0.034 + step * entries + size * 0.012, heading: size * 0.026, first: size * 0.034 + step * 0.75, step }
    : { band: 0, heading: 0, first: 0, step };

  // The square, and nothing but the square. The band does not come into it:
  // it is written on the paper the square grew, not out of the square.
  const cell = (size - margin * 2) / 3;

  return {
    size,
    margin,
    height: size + foot.band,
    cell,
    compass: { band, branch: band * 0.27, word: band * 0.76 },
    foot,
    // Two columns, three registers each. On the left the board as it was
    // dealt — the two plates, then the palace itself; on the right what came
    // to stand over it — the spirit, the star, the gate. Every palace puts
    // the same thing in the same place, so the reader stops reading labels
    // and starts reading positions.
    column: { left: 0.27, right: 0.73 },
    columnWidth: 0.42,
    // The registers are spaced for the worst case, which is a word that went
    // to a second line: 巽 has one word under it and 坤 has "Guerriero
    // Oscuro", and the two have to be laid out alike or the palaces stop
    // lining up. Two lines under every name, then, whether or not the word
    // takes them — the air is what the crowded palace needs, and the empty
    // one does not mind having it.
    line: {
      number: 0.07,
      row: [
        { glyph: 0.23, word: 0.295 },
        { glyph: 0.485, word: 0.55 },
        { glyph: 0.74, word: 0.805 },
      ],
      marks: 0.95,
    },
    font: {
      glyph: cell * 0.12,
      word: cell * 0.055,
      number: cell * 0.07,
      caption: size * 0.021,
      // Off the side and not off the palace: the band is a fraction of the
      // whole drawing, and a branch set from the cell would overrun it. The
      // two together, plus the air between them, are what the band is wide
      // enough for and no wider.
      branch: size * 0.023,
      direction: size * 0.016,
      // A shade under the captions': the band is a list and reads as one, and
      // a list set at caption size competes with the line naming the chart.
      entry: size * 0.019,
    },
  };
}

/**
 * The eight directions, keyed as the engine keys them.
 *
 * Redeclared here for the same reason the shape of a chart is: this package
 * imports nothing from `core`. They are the ids, never words — the words for
 * them arrive from the caller, in whatever language the reader asked for.
 */
export type DirectionId = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

/**
 * One side of the board: three branches, and the direction the side faces.
 *
 * The twelve branches are a compass of thirty degrees a step — 子 is due
 * north, and each one after it is thirty degrees on — so three of them span
 * the ninety degrees of a side, and each falls squarely over the palace whose
 * quarter of the sky it belongs to. 丑 stands over Gen and 寅 beside it,
 * because both are in the northeast; 子 stands over Kan alone.
 *
 * `along` is the axis the three run down, and `outward` says which end of it
 * the band lies at: -1 above or to the left of the grid, +1 below or to the
 * right. South is at the top, which puts the east on the left: the board is
 * the map turned through half a turn, not held up to a mirror, so the ring
 * still runs clockwise on the page exactly as it runs round the horizon.
 */
export interface Edge {
  direction: DirectionId;
  branches: readonly [string, string, string];
  along: 'x' | 'y';
  outward: -1 | 1;
}

export const EDGES: readonly Edge[] = [
  { direction: 's', branches: ['巳', '午', '未'], along: 'x', outward: -1 },
  { direction: 'n', branches: ['丑', '子', '亥'], along: 'x', outward: 1 },
  { direction: 'e', branches: ['辰', '卯', '寅'], along: 'y', outward: -1 },
  { direction: 'w', branches: ['申', '酉', '戌'], along: 'y', outward: 1 },
];

/** The four corners, where a direction has a quarter of the sky and no branch of its own. */
export interface Corner {
  direction: DirectionId;
  x: -1 | 1;
  y: -1 | 1;
}

export const CORNERS: readonly Corner[] = [
  { direction: 'se', x: -1, y: -1 },
  { direction: 'sw', x: 1, y: -1 },
  { direction: 'ne', x: -1, y: 1 },
  { direction: 'nw', x: 1, y: 1 },
];

/** Top-left corner of a cell, in pixels. */
export function origin(cell: Cell, geometry: Layout): { x: number; y: number } {
  return {
    x: geometry.margin + cell.column * geometry.cell,
    y: geometry.margin + cell.row * geometry.cell,
  };
}
