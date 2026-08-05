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

export interface Layout {
  size: number;
  /** Space around the grid, which the captions live in. */
  margin: number;
  /** Side of one palace. */
  cell: number;
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
  font: { glyph: number; word: number; number: number; caption: number };
}

/**
 * Proportions, derived from the side so that one number scales the whole
 * drawing and nothing has to be re-tuned.
 */
export function layout(size: number, hasCaptions: boolean): Layout {
  const margin = hasCaptions ? size * 0.085 : size * 0.03;
  const cell = (size - margin * 2) / 3;

  return {
    size,
    margin,
    cell,
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
    },
  };
}

/** Top-left corner of a cell, in pixels. */
export function origin(cell: Cell, geometry: Layout): { x: number; y: number } {
  return {
    x: geometry.margin + cell.column * geometry.cell,
    y: geometry.margin + cell.row * geometry.cell,
  };
}
