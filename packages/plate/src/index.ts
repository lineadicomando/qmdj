/**
 * @qimendunjia/plate — the drawing.
 *
 * Given a chart, it produces a picture of it. It does not know how to compute
 * one, and by design it cannot: it declares the shape it needs in `types.ts`
 * rather than importing the engine's, so nothing here can reach back into a
 * calculation.
 *
 * Very nearly locale-independent, because the palaces carry hanzi — the names
 * of the gates and stars, not a rendering of them. Only the captions around
 * the grid are text in a language, and the caller supplies those already
 * translated.
 *
 * PNG lives at `@qimendunjia/plate/png`, which pulls a native module.
 */

export {
  cells,
  layout,
  origin,
  CORNERS,
  EDGES,
  WRITTEN_ORDER,
  type Cell,
  type Corner,
  type DirectionId,
  type Edge,
  type Layout,
} from './geometry.js';
export { FONT_STACK, PALETTES, styleSheet, type Palette, type Scheme } from './palette.js';
export { renderChartSvg } from './svg.js';
export type {
  Named,
  PlateCaptions,
  PlateChart,
  PlateDirections,
  PlateLabels,
  PlateOptions,
  PlatePalace,
  PlatePattern,
} from './types.js';
