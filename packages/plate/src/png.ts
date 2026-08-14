import { Resvg } from '@resvg/resvg-js';
import { FONT_STACK, PALETTES, type Scheme } from './palette.js';
import { DEFAULT_SIZE, renderChartSvg } from './svg.js';
import type { PlateChart, PlateOptions } from './types.js';

/**
 * PNG rendering, behind its own entry point.
 *
 * `@resvg/resvg-js` is a native module. Importing it from the package index
 * would drag it into every bundle that so much as wanted an SVG, including
 * the browser's, where it cannot run at all. Anything that needs a raster
 * imports `@qimendunjia/plate/png` and knows it is asking for a native
 * dependency.
 */

export interface PngOptions extends Omit<PlateOptions, 'scheme'> {
  /**
   * A raster cannot ask the page what it prefers, so it has to be told. There
   * is no `auto` here for that reason.
   */
  scheme?: Scheme;
  /**
   * Width in pixels. The height follows from it.
   *
   * Square, unless the drawing was asked for a list of configurations — that
   * band is written on paper the square grew downward, so the taller the list
   * the taller the raster. See `Foot`.
   */
  width?: number;
}

/**
 * Draws a chart as a PNG.
 *
 * **The glyphs are the drawing.** resvg rasterises with the fonts it finds on
 * the machine, and a machine with no Chinese font draws an empty grid: a
 * picture that looks like a chart and says nothing. Nothing about that
 * failure is visible from the calling code — the buffer is a valid PNG of the
 * right size — so it is checked for here rather than discovered by whoever
 * opens the file.
 */
export function renderChartPng(chart: PlateChart, options: PngOptions = {}): Buffer {
  assertGlyphsRender(options.captions?.readings !== undefined);
  const scheme = options.scheme ?? 'light';
  const svg = renderChartSvg(chart, {
    ...options,
    // The stylesheet resolves to one scheme: custom properties survive
    // rasterisation, media queries do not.
    scheme,
  });

  const renderer = new Resvg(inlineColours(svg, scheme), {
    fitTo: { mode: 'width', value: options.width ?? options.size ?? DEFAULT_SIZE },
    font: { loadSystemFonts: true },
  });

  return Buffer.from(renderer.render().asPng());
}

let glyphsChecked: boolean | undefined;
let readingsChecked: boolean | undefined;

/**
 * Refuses to draw where the glyphs would not appear.
 *
 * There is no way to ask resvg which fonts it loaded, so the question is put
 * to it directly: the same tiny image is rasterised twice, once holding a
 * Chinese character and once holding nothing. If the two come out identical,
 * the character drew no pixels and every chart from this process would be an
 * empty grid.
 *
 * **A second question, asked only where the readings were.** `FONT_STACK` is
 * CJK faces and `serif`, and the macron and the caron of ā ǎ ǖ live in Latin
 * Extended-A and B, which those faces cover unevenly and the fallback covers
 * or does not. A band of readings rasterised as a row of boxes — or as
 * nothing — is the silent failure the first probe exists to prevent, one step
 * further on: the picture still looks like a chart, and the half of it that
 * exists for the reader with no Chinese is gone.
 *
 * Checked once per process — fonts do not appear while a program runs — and
 * each message names the fix rather than the symptom.
 */
function assertGlyphsRender(readings: boolean): void {
  if (glyphsChecked && (readingsChecked || !readings)) return;

  const probe = (content: string): Buffer => {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">` +
      `<text x="16" y="26" font-size="28" font-family="${FONT_STACK.replace(/"/g, '&quot;')}" ` +
      `text-anchor="middle">${content}</text></svg>`;
    return Buffer.from(
      new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng(),
    );
  };

  if (!glyphsChecked) {
    if (probe('休').equals(probe(''))) {
      throw new Error(
        'No font on this system can draw Chinese characters, so every palace of the chart would come out empty. ' +
          'Install one — on Debian and Ubuntu, `fonts-noto-cjk`; on Alpine, `font-noto-cjk`; on macOS one is present already. ' +
          'SVG output is unaffected: it names the fonts and lets whoever displays it resolve them.',
      );
    }
    glyphsChecked = true;
  }

  if (readings && !readingsChecked) {
    // Two ways for a reading to be unreadable, and both are asked about: drawn
    // as nothing, which is the same test as above, and drawn as the box a font
    // puts where it has no glyph — which is why the second comparison is
    // against a private-use character no font has ever heard of.
    const tone = probe('ǎ');
    if (tone.equals(probe('')) || tone.equals(probe('\u{e000}'))) {
      throw new Error(
        'No font on this system can draw the tone marks of the pinyin, so the band of readings would come out empty or boxed. ' +
          'Install a face with Latin Extended-A and B — on Debian and Ubuntu, `fonts-dejavu` beside the CJK one; on macOS one is present already — ' +
          'or draw the chart without asking for `captions.readings`. SVG output is unaffected.',
      );
    }
    readingsChecked = true;
  }
}

/**
 * Replaces the custom properties with their values.
 *
 * resvg does not resolve `var()`, so a drawing handed to it unchanged comes
 * out with every fill missing. Substituting here keeps one stylesheet for
 * both outputs instead of two that drift apart.
 *
 * Exported for the test that checks nothing was left behind. A property added
 * to the palette and forgotten here does not throw and does not look wrong in
 * the browser — it goes missing only in the raster, which is the one output
 * nobody looks at twice.
 */
export function inlineColours(svg: string, scheme: Scheme): string {
  const palette = PALETTES[scheme];
  const values: Record<string, string> = {
    '--qmdj-ink': palette.ink,
    '--qmdj-faint': palette.faint,
    '--qmdj-word': palette.word,
    '--qmdj-rule': palette.rule,
    '--qmdj-ground': palette.ground,
    '--qmdj-mark': palette.mark,
  };
  for (const [element, colour] of Object.entries(palette.element)) {
    values[`--qmdj-element-${element}`] = colour;
  }
  for (const [element, colour] of Object.entries(palette.elementInk)) {
    values[`--qmdj-ink-${element}`] = colour;
  }

  return svg.replace(/var\((--qmdj-[a-z-]+)\)/g, (whole, name: string) => values[name] ?? whole);
}
