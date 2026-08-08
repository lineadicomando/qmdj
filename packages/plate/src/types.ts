/**
 * What the drawing needs to know about a chart — and no more.
 *
 * These types are **redeclared here rather than imported from `core`**, which
 * looks like duplication and is not. The CLI lives in `core` and draws, so a
 * dependency the other way would close a cycle; and a drawing that could
 * reach into the engine would sooner or later compute something instead of
 * rendering what it was handed.
 *
 * They are deliberately looser than the engine's: every field the drawing
 * reads, nothing it does not. Structural typing then does the work — a real
 * `QimenChart` satisfies this without being converted — and `test/types.test.ts`
 * asserts that it still does.
 */

import type { DirectionId } from './geometry.js';

export interface PlateChart {
  ju: { yang: boolean; number: number };
  chief: { star: { hanzi: string }; palace: { number: number } };
  chiefGate: { gate: { hanzi: string }; palace: { number: number } };
  palaces: readonly PlatePalace[];
  patterns: readonly PlatePattern[];
  moment: {
    local: string;
    pillars: {
      year: { hanzi: string };
      month: { hanzi: string };
      day: { hanzi: string };
      hour: { hanzi: string };
    };
  };
}

export interface PlatePalace {
  palace: { number: number; hanzi: string; id: string; element: string };
  earth: Named;
  heaven: Named;
  star: Named;
  starStrength: Named;
  gate?: Named | undefined;
  gateStrength?: Named | undefined;
  spirit?: Named | undefined;
}

/**
 * Everything on a plate has both: the hanzi is the name, the identifier is
 * how a caller finds a label for it.
 */
export interface Named {
  hanzi: string;
  id: string;
  /**
   * The phase, where the thing named *is* one — a stem, a trigram. Absent on
   * a star or a gate, which have a phase only by way of the palace they rest
   * in, and are drawn in plain ink because of it.
   */
  element?: string | undefined;
}

export interface PlatePattern {
  id: string;
  hanzi: string;
  palace?: number | undefined;
  /**
   * The fortune the tradition transmits with the name — 吉, 凶, or both.
   *
   * Optional, as everything here is optional that the drawing can do without:
   * this package is handed charts and does not compute, so a caller on an
   * older engine draws the configurations without their fortunes rather than
   * failing. It is written in the band under the grid and never in a palace,
   * where the room for it does not exist and a bare glyph would be a name
   * with no gloss beside it.
   */
  valence?: { id: string; hanzi: string } | undefined;
  /** `gate`, `star` or `both`, for a configuration belonging to the whole board. */
  layer?: string | undefined;
}

/**
 * What to write in the palaces, keyed by the engine's identifiers.
 *
 * The package still has no catalog and still knows no language: the caller
 * hands it the words. What it decides is only the layout.
 *
 * Anything absent falls back to the hanzi, so a caller that passes nothing
 * gets the glyphs — which is what a reader who reads them wants, and what the
 * drawing did before there was any way to ask for anything else.
 */
export interface PlateLabels {
  palace?: Record<string, string>;
  star?: Record<string, string>;
  gate?: Record<string, string>;
  spirit?: Record<string, string>;
  stem?: Record<string, string>;
  pattern?: Record<string, string>;
  valence?: Record<string, string>;
  /** The word for a layer — the gates, the stars, both — as a place. */
  layer?: Record<string, string>;
}

/**
 * The text around the grid, supplied whole.
 *
 * Where a caption names something the chart contains, the caller writes the
 * name as well as the word for it: this package holds no catalog and cannot
 * know whether the reader wants 天蓬 or "Canopy".
 */
export interface PlateCaptions {
  /** e.g. `yang dun 9`. Absent leaves the line out. */
  ju?: string;
  /** The four pillars, said however the caller wants. Defaults to the hanzi. */
  pillars?: string;
  /** e.g. `chief Canopy`. Written whole, name included. */
  chief?: string;
  /** e.g. `chief gate Rest`. */
  chiefGate?: string;
  /** What the drawing is not, said where it will be read. */
  note?: string;
  /**
   * The word for the band of configurations under the grid, e.g. «Patterns».
   *
   * Giving it is what draws the band, exactly as giving `compass` is what
   * draws the frame, and the grid comes down in size to make room — by as much
   * as the band carries and no more, since a chart with two configurations
   * should not pay for a chart with six.
   *
   * The band exists because a palace has room for a configuration's name and
   * for nothing else. Its fortune needs a word beside the glyph, and 伏吟 and
   * 反吟 have no palace at all: they are properties of the whole board, and
   * without a band the drawing simply never mentions them.
   */
  configurations?: string;
}

/**
 * The words for the eight directions, keyed as the engine keys them.
 *
 * Short ones: they are written in a band a twentieth of the drawing wide, and
 * "nord-ovest" set there would be either unreadable or wider than the palace
 * it stands over. `NO`, `SE`, `N` — the abbreviations a map uses, which are
 * not the same in every language, which is why this package does not invent
 * them either.
 *
 * Partial, so that a caller with nothing to say for a direction leaves that
 * one blank rather than writing an identifier at the reader.
 */
export type PlateDirections = Partial<Record<DirectionId, string>>;

export interface PlateOptions {
  /**
   * Side of the square, in pixels. Default 900.
   *
   * The drawing is proportional throughout, so this settles its intrinsic
   * size and nothing else: the same words wrap and the same words are shrunk
   * at every value. Asking for more does not buy a roomier palace.
   */
  size?: number;
  /**
   * `light`, `dark`, or `auto` — which emits both and lets the page choose.
   *
   * `auto` is the default because an SVG dropped into a page has no idea
   * which it will be read in, and a chart that turns invisible at night is a
   * chart nobody uses.
   */
  scheme?: 'light' | 'dark' | 'auto';
  /** Text around the grid. Left out entirely when absent. */
  captions?: PlateCaptions;
  /**
   * The frame of directions outside the grid: the twelve branches around the
   * board, and a word at each of the eight quarters.
   *
   * Drawn only when this is given, and the grid comes down in size to make
   * room for it. A chart is consulted for a direction as often as for an
   * hour, and the trigram in each palace already says which one — but it says
   * it to a reader who knows that 巽 is the southeast, and this says it to
   * everyone else, on the side of the board they would actually face.
   *
   * `{}` draws the branches and no words, which is a compass in Chinese and
   * a legitimate thing to want.
   */
  compass?: PlateDirections;
  /**
   * Words for what stands in the palaces. Without it the drawing carries
   * hanzi and no language at all.
   */
  labels?: PlateLabels;
}
