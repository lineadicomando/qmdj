import { escape, round } from './fit.js';
import { FONT_STACK, styleSheet } from './palette.js';
import {
  drawReadingColumns,
  readingDepth,
  ringRoom,
  ringed,
  said,
  type Said,
} from './readings.js';
import type {
  PlateZiwei,
  PlateZiweiLabels,
  PlateZiweiOptions,
  PlateZiweiPalace,
} from './types.js';

/**
 * The 紫微斗數 board: twelve seats round the edge of a four by four, and the
 * birth in the middle of it.
 *
 * **It is a grid and not the ring of twelve, and that is the drawing's whole
 * argument.** Six and 七政四餘 share a ring because their twelve palaces are
 * the same twelve — thirty-degree stretches of the ecliptic under the branches
 * that name them. These twelve are not those: they are seats in a count, and
 * nothing on this board has a position in the sky at all. Drawing them round
 * would say the two figures were one thing, which `docs/sources.md` spends a
 * subsection denying.
 *
 * **The four by four is the book's own figure, not a convenience.** 卷二
 * prints its five tables of 紫微 as exactly this diagram — twelve branches
 * round the border of a four by four, 寅 at the lower left, the middle open
 * for a caption — and the boards of every practitioner since are laid the same
 * way. Reproducing it is the one layout decision here that needs no argument
 * beyond pointing at the source.
 *
 * **The branches are fixed and the palaces fall where they fall.** A reader
 * looks up a seat by its ground, not by its number, so 寅 is always the same
 * corner and 命宮 moves. That costs the reading order, which runs *backwards*
 * round this ring — 命宮, 兄弟, 妻妾 — and a grid cannot show a direction. So
 * the order is written into the cells: each carries its palace's name, and the
 * name is what the order is made of. A reader following the twelve in
 * sequence walks anticlockwise and can see that they do.
 *
 * **The middle is full, and that parts it from the 太乙 grid it resembles.**
 * There the emptiness is content — 太乙不入中宮 — and filling it would answer
 * a question the method refuses. Here the centre is where the board says what
 * it was laid on: the birth, the bureau, and the two masters. A board of 命
 * has a subject, and the subject goes in the middle.
 *
 * **The cells are tinted by phase and the names are inked by theirs, and that
 * is a reading rather than a decoration.** 卷二 does not merely file each star
 * under a phase; it says what to do with the filing —
 * 「星曜全明生剋制化之機，**次看落於何宮**，如廉貞屬火在寅宮，乃木鄉能生
 * 廉貞之火」 — read the star's phase against the phase of the *palace it fell
 * in*, and the palace's phase is its branch's. The book calls that phase the
 * palace's 鄉, its country, which is what a tint depicts; and it closes with
 * the table of what is checked: 「金入火鄉，火入水鄉，水入土鄉，土入木鄉，
 * 俱為受制」. So a reader meeting 廉貞 in fire ink on a wood-tinted 寅 sees
 * 木生火 without looking anything up, which is the operation the 太微賦 opens
 * the whole art with: 「辨生剋制化，以定窮通」.
 *
 * This is the argument the Qi Men chart colours its stems on, arriving in a
 * second art: a stem *is* its phase, and so is a star here. Sixteen names are
 * inked and three are not — 天同, 貪狼 and 七殺 carry two phases apiece and a
 * glyph has one colour, so those take none rather than the drawing picking —
 * and neither do the thirteen the book passes over in silence.
 *
 * A cell can hold eleven names with a grade and a transformation on each,
 * which is denser than anything else drawn here, so the star lines shrink with
 * the count rather than the cell growing with it. What never shrinks is the
 * seat's own name and its ground: those two are how a reader finds the cell.
 *
 * **One word to a cell, and it goes under the star that leads it.** This board
 * sets forty names in twelve squares and cannot gloss them where they stand:
 * a word under each would want eighteen line-slots in a cell that holds
 * twelve, and everything on the sheet would shrink to make room for text
 * nobody could read. So the cell says one thing in the reader's language —
 * the leading star — and the band beneath says the other thirty-nine.
 *
 * **The leading star is the seat's principal star, and that is an invariant
 * rather than a hope.** The stars are seated in the order they are placed:
 * 紫微's chain, then 天府's, then the auxiliaries. So wherever a seat holds
 * any of the 十四主星, the first in its list is one of them — measured over
 * 4,608 seats without an exception. Where a seat holds none it is a 空宮, read
 * through the palace opposite, and it correctly shows no word at all.
 *
 * The word is set at the ratio the 太乙 grid uses for the same job, and it is
 * dropped rather than set below about eight pixels: in the three seats in a
 * hundred that crowd past it, a Latin line at that size costs the glyphs their
 * room and gives nothing back.
 *
 * Like the other four it holds no catalog and knows no language. The caller
 * supplies the captions already translated.
 */

/**
 * How much of a name's line a gloss under it takes.
 *
 * Two thirds: the word is set at about half the size of the name it belongs
 * to, and the rest is the air that keeps it attached to that name rather than
 * floating between two.
 */
const GLOSS_SHARE = 0.66;

/** The five phases, as classes the sheet turns into tints and inks. */
const PHASES = ['mu', 'huo', 'tu', 'jin', 'shui'] as const;

/** Side of the square, in pixels, unless told otherwise. */
export const DEFAULT_ZIWEI_SIZE = 900;

/**
 * Where each branch sits on the border of a four by four, as (row, column).
 *
 * 寅 at the lower left and the count running anticlockwise round the border —
 * 寅卯辰巳 up the left side, 巳午未申 across the top — which is the
 * arrangement 卷二's own tables are printed in. South is at the top, as
 * everywhere here, so this is the compass laid the way a Chinese diagram lays
 * it rather than the way a European map does.
 */
const SEAT: Record<string, readonly [number, number]> = {
  yin: [3, 0],
  mao: [2, 0],
  chen: [1, 0],
  si: [0, 0],
  wu: [0, 1],
  wei: [0, 2],
  shen: [0, 3],
  you: [1, 3],
  xu: [2, 3],
  hai: [3, 3],
  zi: [3, 2],
  chou: [3, 1],
};

/** One seat's square on the sheet, as fractions of the drawing's own box. */
export interface ZiweiSeatBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Where each seat sits on the finished sheet, in fractions of it.
 *
 * **Exported so that nobody has to guess it.** The drawing travels as an
 * `<img>`, which cannot be asked what is where, so a page that wants to point
 * at a seat — to light up the row that says what is in it — has to know the
 * geometry. Deriving it at the far end would mean copying this file's
 * constants into a Svelte component, where the first change here would break
 * them silently. It is one function instead, in the package that owns the
 * arithmetic.
 *
 * `height` is the whole sheet including the band beneath the grid, which grows
 * with the number of names: a caller reads it off the image once it has
 * loaded rather than assuming it.
 */
export function ziweiSeatBoxes(
  width: number,
  height: number,
  options: { heading?: boolean } = {},
): Record<string, ZiweiSeatBox> {
  const margin = width * 0.045;
  const gridTop = margin + (options.heading ? width * 0.055 : 0);
  const cell = (width - margin * 2) / 4;

  const boxes: Record<string, ZiweiSeatBox> = {};
  for (const [branch, seat] of Object.entries(SEAT)) {
    const [row, column] = seat;
    boxes[branch] = {
      left: (margin + column * cell) / width,
      top: (gridTop + row * cell) / height,
      width: cell / width,
      height: cell / height,
    };
  }
  return boxes;
}

export function renderZiweiSvg(board: PlateZiwei, options: PlateZiweiOptions = {}): string {
  const size = options.size ?? DEFAULT_ZIWEI_SIZE;
  const labels = options.labels ?? {};

  const margin = size * 0.045;
  const headingRoom = options.heading ? size * 0.055 : 0;
  const grid = size - margin * 2;
  const cell = grid / 4;
  const gridTop = margin + headingRoom;

  const reading = size * 0.017;
  const readingStep = size * 0.023;
  /**
   * Three columns, which is what the widest entry allows.
   *
   * The band is about fifty-three ems across at this size, so three columns
   * give roughly eighteen to an entry — over the median of sixteen and under
   * the longest. Four would put a third of the names under the shrink and two
   * would run the band half a page longer for no gain in reading.
   */
  /**
   * The band, numbered — and the same numbers keyed into the grid.
   *
   * A cell has room for one word and the band has the other fifty-six, so
   * without a key the reader who meets 陀羅 in a seat has to know how it is
   * said before they can find out what it is. The numeral is that key: it
   * costs a cell almost nothing and it is the only way from a glyph to its
   * meaning that does not go through the reading.
   *
   * Numbered only when the band is drawn at all. A sheet with no band has
   * nothing for the numbers to point at, and twelve cells of numerals
   * pointing nowhere would be worse than none.
   */
  const aloud = options.readings
    ? numbered(saidOnBoard(board, labels.star ?? {}, labels.house ?? {}))
    : [];
  const key = new Map<string, number>(
    aloud.flat().map((one) => [one.hanzi, one.index as number] as const),
  );
  /**
   * How deep the band comes out, which is no longer a count of entries.
   *
   * Six or seven of fifty-seven break onto a second line, and the columns are
   * filled to an even number of lines rather than of names — so the depth is
   * the number of lines the tallest column takes, and the only way to know it
   * is to lay it out. It is laid out once and measured, not guessed: a guess
   * short by two lines is a band that runs off the sheet.
   */
  const bandLines = aloud.length
    ? readingDepth(aloud, { size: reading, maxWidth: grid, columns: 3 })
    : 0;
  const band = bandLines ? size * 0.05 + readingStep * bandLines + size * 0.012 : 0;

  const height = gridTop + grid + band + margin;

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${round(height)}" ` +
      `width="${size}" height="${round(height)}" role="img" aria-label="${escape(ariaLabel(board))}">`,
    `<style>${styleSheet(options.scheme ?? 'auto')}
      .qmdj { font-family: ${FONT_STACK}; }
      .qmdj text { fill: var(--qmdj-ink); }
      .qmdj .faint { fill: var(--qmdj-faint); }
      .qmdj .word { fill: var(--qmdj-word); }
      .qmdj .rule { stroke: var(--qmdj-rule); fill: none; }
      /* No fill declared here: every cell carries its own, and a declaration
         in the sheet would beat the attribute that says which phase it is. */
      .qmdj .cell { stroke: var(--qmdj-rule); }
      ${PHASES.map((phase) => `.qmdj .tint-${phase} { fill: var(--qmdj-element-${phase}); }`).join('\n      ')}
      ${PHASES.map((phase) => `.qmdj .ink-${phase} { fill: var(--qmdj-ink-${phase}); }`).join('\n      ')}
      .qmdj .ground { fill: var(--qmdj-ground); }
      .qmdj .ring { fill: none; stroke: var(--qmdj-faint); stroke-width: 0.7; }
      /* The seat the 身宮 shares, marked on the cell and not only in it: it is
         the one thing on this board true of a whole seat. Marked by its rule
         rather than by a wash, because a wash would have to be a colour, and
         every colour on these drawings means a phase — this seat has no phase
         and inventing one for it would be the picture saying something the
         board does not. */
      .qmdj .body { stroke: var(--qmdj-mark); stroke-width: 2; }
    </style>`,
    '<g class="qmdj">',
    `<rect x="0" y="0" width="${size}" height="${round(height)}" class="ground"/>`,
  ];

  if (options.heading) {
    parts.push(text(size / 2, margin + headingRoom * 0.62, options.heading, size * 0.028, 'faint'));
  }

  parts.push(...seats(board, labels.star ?? {}, key, { left: margin, top: gridTop, cell }));
  parts.push(...middle(board, labels, { left: margin, top: gridTop, cell }));

  if (aloud.length > 0) {
    const top = gridTop + grid + size * 0.05;
    parts.push(
      ...drawReadingColumns(aloud, options.readings as string, {
        columns: 3,
        x: margin,
        heading: top,
        first: top + readingStep * 0.8,
        step: readingStep,
        size: reading,
        maxWidth: grid,
      }),
    );
  }

  parts.push('</g>', '</svg>');
  return parts.join('\n');
}

/**
 * The twelve cells.
 *
 * Each is found by its ground and never by its number, so a seat that moves
 * from one board to the next moves on the sheet too, and a reader holding two
 * boards of two births compares them by looking at the same corner.
 */
function seats(
  board: PlateZiwei,
  glosses: Record<string, string>,
  key: ReadonlyMap<string, number>,
  at: { left: number; top: number; cell: number },
): string[] {
  const parts: string[] = [];

  for (const palace of board.palaces) {
    const seat = SEAT[palace.branch.id];
    if (!seat) continue;
    const [row, column] = seat;
    const x = at.left + column * at.cell;
    const y = at.top + row * at.cell;

    const tint = PHASES.includes(palace.branch.element as (typeof PHASES)[number])
      ? ` tint-${palace.branch.element}`
      : '';
    parts.push(
      `<rect x="${round(x)}" y="${round(y)}" width="${round(at.cell)}" ` +
        `height="${round(at.cell)}" class="cell${tint}${palace.body ? ' body' : ''}"/>`,
    );
    parts.push(...inside(palace, glosses, key, { x, y, cell: at.cell }));
  }

  return parts;
}

/**
 * What stands in one cell.
 *
 * The stars first and largest, because they are what the cell is for; the
 * ground and the seat's name in the two lower corners, where they can be found
 * without reading the cell; the rings and the decade along the top, faint,
 * because they are the board's scaffolding rather than its content.
 *
 * The star lines shrink with their count. A seat can hold ten names, each with
 * a grade and a transformation, and a cell that grew to fit its fullest would
 * make eleven others too big for what they hold.
 */
function inside(
  palace: PlateZiweiPalace,
  glosses: Record<string, string>,
  key: ReadonlyMap<string, number>,
  at: { x: number; y: number; cell: number },
): string[] {
  const parts: string[] = [];
  const pad = at.cell * 0.07;

  // Along the top, faint: the ring of 長生, the ring of 博士, and the decade.
  const scaffolding = [
    palace.changsheng?.hanzi,
    palace.boshi?.hanzi,
    palace.majorLimit ? `${palace.majorLimit.from}–${palace.majorLimit.to}` : undefined,
  ].filter((one): one is string => Boolean(one));
  if (scaffolding.length > 0) {
    parts.push(
      text(
        at.x + pad,
        at.y + pad + at.cell * 0.075,
        scaffolding.join(' '),
        at.cell * 0.075,
        'faint',
        'start',
      ),
    );
  }

  // The stars, one to a line, each with whatever the book hangs on it — and
  // under the eighteen 正曜, the word for the name.
  const lines = palace.stars.map((seat, position) => {
    const grade = seat.brightness ? seat.brightness.hanzi : '';
    const change = seat.transform ? seat.transform.hanzi : '';
    // Inked only where the book gives exactly one phase. Two, and a glyph
    // cannot hold both; none, and there is nothing to hold.
    const only = seat.star.elements.length === 1 ? seat.star.elements[0] : undefined;
    const ink =
      only && PHASES.includes(only as (typeof PHASES)[number]) ? `ink-${only}` : undefined;
    const lead = position === 0 && seat.star.starClass === 'main';
    const gloss = lead ? glosses[seat.star.id] : undefined;
    return {
      content: `${seat.star.hanzi}${grade}${change}`,
      ink,
      gloss,
      index: key.get(seat.star.hanzi),
    };
  });

  if (lines.length > 0) {
    // A gloss takes about two-thirds of a name's line, so the cell is shared
    // out in those units rather than in names. That is what keeps a seat
    // holding two stars and two words from setting them at the size of a seat
    // holding four of each.
    const glossed = lines.filter((line) => line.gloss).length;
    const slots = lines.length + glossed * GLOSS_SHARE;
    const step = Math.min(at.cell * 0.135, (at.cell * 0.62) / slots);
    const starSize = Math.min(at.cell * 0.115, step * 0.86);
    // The 太乙 grid's own ratio, which is this project's precedent for a word
    // under a name: the name at 0.14 of a cell and the word at 0.085 of it.
    // No floor under it — a floor would set a word taller than the line it
    // has to sit in, and the crowded seats are exactly where that happens.
    const glossSize = starSize * 0.61;

    // **The words go only where they can be read.** Below about seven pixels
    // a Latin line is a grey smear that costs the names their room and gives
    // nothing back, so the busiest seats in twelve keep their glyphs alone and
    // the band under the board carries every word regardless. A drawing that
    // set eleven names and eleven words at four pixels apiece would be
    // keeping the letter of the rule and breaking the whole of it.
    const readable = glossSize >= at.cell * 0.04;

    // The numeral keys the name to the band, and it goes down much further
    // than the words do. A word at seven pixels is a smear; a numeral is one
    // or two digits, which survives being small — and the seat that holds
    // eleven names is exactly the seat where only one of them is glossed and
    // the key is the whole of what a reader has. Dropping it there would be
    // taking the ladder away at the top.
    const keyed = starSize >= at.cell * 0.04;
    const indent = keyed ? ringRoom(starSize) : 0;

    let line_ = at.y + at.cell * 0.29;
    for (const line of lines) {
      if (keyed && line.index) parts.push(ringed(line.index, at.x + pad, line_, starSize));
      parts.push(text(at.x + pad + indent, line_, line.content, starSize, line.ink, 'start'));
      line_ += step;
      if (line.gloss && readable) {
        parts.push(
          text(
            at.x + pad + indent + starSize * 0.3,
            line_ - step * 0.28,
            line.gloss,
            glossSize,
            'word',
            'start',
          ),
        );
        line_ += step * GLOSS_SHARE;
      }
    }
  }

  // The two lower corners: the ground on the left, the seat's name on the
  // right. Neither shrinks — they are how the cell is found.
  parts.push(
    text(
      at.x + pad,
      at.y + at.cell - pad,
      `${palace.stem.hanzi}${palace.branch.hanzi}`,
      at.cell * 0.1,
      'faint',
      'start',
    ),
  );
  // The seat's own name is keyed too, and it has to be: the band numbers the
  // twelve along with the forty-five, and a numeral in the list with nothing
  // in the grid to meet it is a key to a door that is not there.
  const houseSize = at.cell * 0.1;
  const houseText = palace.house.hanzi + (palace.body ? ' 身' : '');
  const houseKey = key.get(palace.house.hanzi);
  parts.push(
    text(at.x + at.cell - pad, at.y + at.cell - pad, houseText, houseSize, 'word', 'end'),
  );
  if (houseKey) {
    parts.push(
      ringed(
        houseKey,
        at.x + at.cell - pad - measured(houseText, houseSize) - ringRoom(houseSize),
        at.y + at.cell - pad,
        houseSize,
      ),
    );
  }

  return parts;
}

/**
 * The middle two by two: what the board was laid on.
 *
 * The lunar date the seats were counted from, the bureau that cut them, and
 * the two masters. Not the birth's clock time and not its place: those are on
 * the transcript, and a picture that carried them would be a picture somebody
 * could not paste anywhere.
 */
function middle(
  board: PlateZiwei,
  labels: PlateZiweiLabels,
  at: { left: number; top: number; cell: number },
): string[] {
  const x = at.left + at.cell;
  const y = at.top + at.cell;
  const side = at.cell * 2;
  const centre = x + side / 2;

  const leap = board.lunar.leap ? '閏' : '';
  const rows: [string, string][] = [
    ['', `${board.lunar.year} · ${leap}${board.lunar.month}/${board.lunar.day} · ${board.hourBranch.hanzi}`],
    ['', board.yearPillar.hanzi],
    [labels.bureau ?? '', `${board.bureau.hanzi} · ${board.minggongPillar.hanzi} ${board.nayin.hanzi}`],
    [labels.lifeMaster ?? '', board.lifeMaster.hanzi],
    // The 身主 alone. Where the 身宮 *fell* is marked on the seat itself, and
    // saying it here beside the master would read as though the branch were
    // part of the master's name: 身主 is a star and 身宮 is a ground, and the
    // one line joining them with a dot was the drawing conflating two things
    // the board keeps apart.
    [labels.bodyMaster ?? '', board.bodyMaster.hanzi],
  ];

  const step = side * 0.115;
  const first = y + side * 0.26;
  const parts: string[] = [];

  rows.forEach(([word, value], index) => {
    const top = first + step * index * 1.35;
    if (word) parts.push(text(centre, top, word, side * 0.048, 'faint'));
    parts.push(text(centre, top + (word ? side * 0.072 : 0), value, side * 0.066));
  });

  return parts;
}

/**
 * Every name on the board, for the band beneath it.
 *
 * Two groups and not one: the stars are what a reader is looking at, and the
 * twelve seats are the frame they are looked at in. A single alphabet of
 * forty names would make the reader hunt for the one they wanted.
 */
/**
 * The band's entries counted from one, across the groups and not within them.
 *
 * One run of numbers, because a reader holding 24 wants one place to look, and
 * two lists each starting at one would send them to the wrong half half the
 * time.
 */
function numbered(groups: Said[][]): Said[][] {
  let count = 0;
  return groups.map((group) => group.map((one) => ({ ...one, index: (count += 1) })));
}

function saidOnBoard(
  board: PlateZiwei,
  words: Record<string, string>,
  houses: Record<string, string>,
): Said[][] {
  const stars = said(
    board.palaces.flatMap((palace) => palace.stars.map((seat) => seat.star)),
    words,
  );
  const seatNames = said(board.palaces.map((palace) => palace.house), houses);
  return [stars, seatNames].filter((group) => group.length > 0);
}

function ariaLabel(board: PlateZiwei): string {
  const ming = board.palaces[0];
  return (
    `紫微斗數 ${board.lunar.year}/${board.lunar.month}/${board.lunar.day} · ` +
    `${board.bureau.hanzi} · 命宮${ming ? ming.branch.hanzi : ''} · 身宮${board.bodyBranch.hanzi}`
  );
}

/** How wide a string is at a size, for placing something before it. */
function measured(value: string, size: number): number {
  let ems = 0;
  for (const character of value) ems += /[⺀-鿿＀-｠]/.test(character) ? 1 : 0.52;
  return ems * size;
}

function text(
  x: number,
  y: number,
  content: string,
  size: number,
  className?: string | undefined,
  anchor: 'start' | 'middle' | 'end' = 'middle',
): string {
  if (!content) return '';
  const cls = className ? ` class="${className}"` : '';
  return (
    `<text x="${round(x)}" y="${round(y)}" font-size="${round(size)}" ` +
    `text-anchor="${anchor}"${cls}>${escape(content)}</text>`
  );
}
