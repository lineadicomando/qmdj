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

export interface Layout {
  size: number;
  /** Space around the grid, which the captions live in. */
  margin: number;
  /** Side of one palace. */
  cell: number;
  /** Baselines within a cell, as fractions of its side. */
  line: {
    name: number;
    spirit: number;
    star: number;
    gate: number;
    heaven: number;
    earth: number;
    marks: number;
  };
  font: { glyph: number; small: number; caption: number };
}

/**
 * Proportions, derived from the side so that one number scales the whole
 * drawing and nothing has to be re-tuned.
 */
export function layout(size: number, hasCaptions: boolean): Layout {
  const margin = hasCaptions ? size * 0.11 : size * 0.03;
  const cell = (size - margin * 2) / 3;

  return {
    size,
    margin,
    cell,
    // Seven registers, read top to bottom: the palace names itself, then the
    // spirit, the star, the gate, and the two plates with heaven always above
    // earth. The last is for whatever configurations fell here.
    //
    // The spacing has to hold a word, not two hanzi. Two glyphs sit in a
    // quarter of the width and a word can fill it, so the rows are further
    // apart and the corner label is clear of the row below it.
    line: { name: 0.13, spirit: 0.27, star: 0.43, gate: 0.575, heaven: 0.735, earth: 0.875, marks: 0.965 },
    font: { glyph: cell * 0.135, small: cell * 0.105, caption: size * 0.026 },
  };
}

/** Top-left corner of a cell, in pixels. */
export function origin(cell: Cell, geometry: Layout): { x: number; y: number } {
  return {
    x: geometry.margin + cell.column * geometry.cell,
    y: geometry.margin + cell.row * geometry.cell,
  };
}
