import { broken, escape, fitted, folded, round } from './fit.js';
import { FONT_STACK, styleSheet } from './palette.js';
import { drawReadings, said, wrapped, type Said } from './readings.js';
import type {
  PlateTaiyi,
  PlateTaiyiGod,
  PlateTaiyiLabels,
  PlateTaiyiOptions,
  PlateTaiyiSide,
} from './types.js';

/**
 * The 太乙 board: nine palaces with an empty middle, and sixteen seats round them.
 *
 * **It is a grid and not a ring, and that is the whole of the drawing's
 * argument.** The eight 宮 of this board *are* the nine palaces of a Qi Men
 * chart less the middle one, in the same 洛書 arrangement of directions — so
 * laying them as a circle would say they were the ring 六壬 and 七政四餘
 * share, which they are not, and a reader who had just looked at a chart would
 * learn a false thing about both figures at once.
 *
 * **The middle stays empty and the emptiness is content.** 太乙不入中宮: it
 * walks eight and never nine, and a centre filled with anything at all would
 * be the drawing answering a question the method refuses.
 *
 * The sixteen fall out of the geometry exactly. A five by five has sixteen
 * border cells and a three by three inside it; the four corners of that border
 * land on the four corner trigrams, and the four edge-middles on 子午卯酉,
 * which is precisely where 卷二 seats them. Nothing is squeezed to fit.
 *
 * **The numbers written in the palaces are this board's own.** 卷二 shifts
 * every one of them a seat from the Luoshu so that 一 reaches 乾, so 一宮 here
 * is the north-west and not the north. The drawing places a palace by the
 * direction it is handed and never by its number, so a figure that looks like
 * a chart cannot quietly be laid out like one; and a line under the grid says
 * so to the reader, because the picture cannot.
 *
 * **Every cell is tinted by its phase, and every name in one is glossed.** The
 * board is drawn at the measure of a page rather than of a column, so a cell
 * has room for a second line under the name — and what goes in it is the word
 * in the reader's language, as it is in every other drawing here. The reading
 * is not what belongs there: 太蔟 tàicù under a glyph tells a reader who does
 * not read Chinese how to *say* a thing they still cannot place, where «la
 * grande adunata» tells them what it is. The readings are said all together in
 * the band under the grid, which is the one lookup that stays a lookup.
 *
 * The tint is the seat's own element, which 卷六 states for the ring and which
 * the eight palaces inherit from the seat each of them stands on: nothing here
 * is a phase this board's own text does not hand down. The middle is left the
 * colour of the paper, because it stands on no seat and has no element to
 * take.
 *
 * Like the other three it holds no catalog and knows no language. South is at
 * the top, as everywhere here.
 */

/** The five phases, as classes the sheet turns into ink colours. */
const PHASES = ['mu', 'huo', 'tu', 'jin', 'shui'] as const;

/** Side of the square, in pixels, unless told otherwise. */
export const DEFAULT_TAIYI_SIZE = 900;

/**
 * The sixteen border cells of a five by five, in ring order from 子.
 *
 * Read as (row, column) with south at the top, so north is row four and east
 * is column zero. Walking the compass forward from 子 — 子丑艮寅卯辰巽… — runs
 * anticlockwise on the sheet, because east and west are the other way round
 * from a European map.
 */
const RING_SEAT: readonly (readonly [number, number])[] = [
  [4, 2], // 子, north
  [4, 1], // 丑
  [4, 0], // 艮, north-east
  [3, 0], // 寅
  [2, 0], // 卯, east
  [1, 0], // 辰
  [0, 0], // 巽, south-east
  [0, 1], // 巳
  [0, 2], // 午, south
  [0, 3], // 未
  [0, 4], // 坤, south-west
  [1, 4], // 申
  [2, 4], // 酉, west
  [3, 4], // 戌
  [4, 4], // 乾, north-west
  [4, 3], // 亥
];

/** Where each direction sits in the inner three by three, south at the top. */
const PALACE_SEAT: Record<string, readonly [number, number]> = {
  se: [1, 1],
  s: [1, 2],
  sw: [1, 3],
  e: [2, 1],
  w: [2, 3],
  ne: [3, 1],
  n: [3, 2],
  nw: [3, 3],
};

export function renderTaiyiSvg(board: PlateTaiyi, options: PlateTaiyiOptions = {}): string {
  const size = options.size ?? DEFAULT_TAIYI_SIZE;
  const labels = options.labels ?? {};

  const margin = size * 0.045;
  const headingRoom = options.heading ? size * 0.055 : 0;
  // Four rows: the two eyes and the two counts. Fixed, because this board
  // produces exactly two of each at every year there has ever been.
  const upper = size * 0.15;
  const grid = size - margin * 2;
  const cell = grid / 5;

  const conditions = board.patterns.length > 0 ? size * 0.028 * (board.patterns.length + 1) : 0;

  // The standing line, wrapped: it is a sentence rather than a caption, and a
  // sentence set on one line runs off the sheet in either language and off the
  // wider one first. An SVG neither wraps nor clips of its own accord, so the
  // wrapping is done here or not at all.
  const noteSize = size * 0.016;
  const noteStep = size * 0.023;
  const notes = labels.palaces ? folded(labels.palaces, grid / noteSize) : [];
  const foot = notes.length ? noteStep * notes.length + size * 0.02 : 0;

  const reading = size * 0.017;
  const readingStep = size * 0.023;
  const aloud = options.readings ? wrapped(saidOnBoard(board), grid / reading) : [];
  const band = aloud.length ? size * 0.05 + readingStep * aloud.length + size * 0.012 : 0;

  const gridTop = margin + headingRoom + upper;
  const height = gridTop + grid + conditions + band + margin + foot;

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${round(height)}" ` +
      `width="${size}" height="${round(height)}" role="img" aria-label="${escape(ariaLabel(board))}">`,
    `<style>${styleSheet(options.scheme ?? 'auto')}
      .qmdj { font-family: ${FONT_STACK}; }
      .qmdj text { fill: var(--qmdj-ink); }
      .qmdj .faint { fill: var(--qmdj-faint); }
      .qmdj .word { fill: var(--qmdj-word); }
      ${PHASES.map((phase) => `.qmdj .${phase} { fill: var(--qmdj-ink-${phase}); }`).join('\n      ')}
      .qmdj .rule { stroke: var(--qmdj-rule); fill: none; }
      /* No fill declared here, unlike the frame above it: every cell on this
         board carries its own, and a declaration in the sheet would beat the
         attribute that says which phase the cell is. */
      .qmdj .cell { stroke: var(--qmdj-rule); }
      .qmdj .ground { fill: var(--qmdj-ground); }
    </style>`,
    '<g class="qmdj">',
    `<rect x="0" y="0" width="${size}" height="${round(height)}" class="ground"/>`,
  ];

  if (options.heading) {
    parts.push(text(size / 2, margin + headingRoom * 0.62, options.heading, size * 0.028, 'faint'));
  }

  parts.push(...listing(board, labels, { size, margin, top: margin + headingRoom, height: upper }));
  parts.push(...palaces(board, { left: margin, top: gridTop, cell }));
  parts.push(...ring(board, labels, { left: margin, top: gridTop, cell }));

  if (board.patterns.length > 0) {
    parts.push(...conditionsOf(board, labels, { size, margin, top: gridTop + grid }));
  }

  if (aloud.length > 0) {
    const top = gridTop + grid + conditions + size * 0.05;
    parts.push(
      ...drawReadings(aloud, options.readings as string, {
        x: margin,
        heading: top,
        first: top + readingStep * 0.8,
        step: readingStep,
        size: reading,
        maxWidth: grid,
      }),
    );
  }

  notes.forEach((note, index) => {
    parts.push(
      text(
        margin,
        height - margin * 0.4 - noteStep * (notes.length - 1 - index),
        note,
        noteSize,
        'faint',
        'start',
      ),
    );
  });

  parts.push('</g>', '</svg>');
  return parts.join('\n');
}

/**
 * The two eyes and the two counts, above the grid.
 *
 * Side by side and neither first: 文昌 belongs to the host and 始擊 to the
 * guest, and **which party is which is not on this sheet and never will be**.
 * Deciding that is the reader's first act, for the reason choosing a 用神 is,
 * so the two columns are the same width and carry the same registers.
 */
function listing(
  board: PlateTaiyi,
  labels: PlateTaiyiLabels,
  box: { size: number; margin: number; top: number; height: number },
): string[] {
  const { size, margin, top, height } = box;
  const columnWidth = (size - margin * 2) / 2;
  const parts: string[] = [];

  const sides: [PlateTaiyiGod, PlateTaiyiSide, string | undefined, string | undefined][] = [
    [board.wenchang, board.host, labels.wenchang, labels.hostCount],
    [board.shiji, board.guest, labels.shiji, labels.guestCount],
  ];

  sides.forEach(([eye, side, eyeWord, countWord], index) => {
    const left = margin + columnWidth * index;
    const middle = left + columnWidth / 2;

    if (eyeWord) parts.push(text(middle, top + height * 0.2, eyeWord, size * 0.019, 'word'));
    parts.push(text(middle, top + height * 0.5, eye.hanzi, size * 0.042, eye.element));

    const generals = [
      `${labels.general ?? ''} ${side.general.hanzi}${side.general.number}`,
      side.assistant ? `${labels.assistant ?? ''} ${side.assistant.hanzi}${side.assistant.number}` : '',
    ]
      .filter(Boolean)
      .join('   ');
    parts.push(
      text(middle, top + height * 0.74, `${countWord ?? ''} ${side.count}`, size * 0.022),
      text(middle, top + height * 0.93, generals, size * 0.019, 'faint'),
    );
  });

  return parts;
}

/**
 * The eight palaces, and the empty middle.
 *
 * Each carries its trigram and this board's number for it, and under them
 * whatever the year put there — 太乙 itself, the four generals, the 大遊. A
 * palace with nothing in it is drawn all the same, because the eight are the
 * board whether or not anything landed on them.
 *
 * The tint is the phase of the seat the palace stands on, taken from the god
 * seated there rather than declared again here: 卷六 states the element of the
 * sixteen, and the eight 正宮 are eight of the sixteen — 子 is the north and is
 * water, 卯 the east and wood, 艮 the north-east and earth. So a palace and the
 * border cell it touches are the same colour, which is the one thing about
 * this figure a reader should be able to see before reading anything.
 */
function palaces(
  board: PlateTaiyi,
  box: { left: number; top: number; cell: number },
): string[] {
  const parts: string[] = [];
  const { left, top, cell } = box;

  // Which number each direction carries, taken from the eight gods that stand
  // at a palace rather than from the numbers themselves. This is the one
  // place the drawing could quietly become a Qi Men chart, and it is closed
  // here: no number on this sheet decides where anything is drawn.
  const numberAt = new Map<string, number>();
  const phaseAt = new Map<string, string>();
  board.gods.forEach((god, index) => {
    const direction = SEAT_DIRECTION[index];
    if (!direction) return;
    if (god.palace !== undefined) numberAt.set(direction, god.palace);
    phaseAt.set(direction, god.element);
  });

  const standing = new Map<number, string[]>();
  const put = (palace: number | undefined, glyph: string) => {
    if (palace === undefined) return;
    standing.set(palace, [...(standing.get(palace) ?? []), glyph]);
  };
  put(board.taiyi.palace.number, '太乙');
  put(board.host.general.number, '主將');
  put(board.host.assistant?.number, '主參');
  put(board.guest.general.number, '客將');
  put(board.guest.assistant?.number, '客參');

  for (const [direction, seat] of Object.entries(PALACE_SEAT)) {
    const [row, column] = seat;
    const x = left + column * cell;
    const y = top + row * cell;
    const middle = x + cell / 2;

    // The colour of the paper where the caller handed over no phase, never a
    // phase picked here: a wrongly coloured palace is a wrong statement about
    // the board, and an uncoloured one is only a plainer drawing.
    const phase = phaseAt.get(direction);
    parts.push(
      `<rect x="${round(x)}" y="${round(y)}" width="${round(cell)}" height="${round(cell)}" ` +
        `fill="${phase ? `var(--qmdj-element-${phase})` : 'var(--qmdj-ground)'}" class="cell"/>`,
    );

    const number = numberAt.get(direction);
    if (number === undefined) continue;
    parts.push(text(middle, y + cell * 0.3, String(number), cell * 0.24, 'faint'));

    (standing.get(number) ?? []).forEach((glyph, index) => {
      const isTaiyi = glyph === '太乙';
      parts.push(
        text(
          middle,
          y + cell * (0.55 + index * 0.16),
          glyph,
          cell * (isTaiyi ? 0.19 : 0.14),
          isTaiyi ? undefined : 'word',
        ),
      );
    });
  }

  // The middle. 太乙不入中宮 — it walks eight and never nine — so the cell is
  // drawn and 太乙 is never in it, and that emptiness is content rather than a
  // gap. **A general can be there, and then it is drawn.** A count that
  // reduces to five seats its 大將 in the centre, which is what the 立成 of
  // 卷三 prints at 隂局 1; the drawing shows it rather than swallowing it,
  // because the listing above already says 中5 and a grid that then held
  // nothing would read as a mistake in one of the two.
  // Left the colour of the paper while the eight around it are tinted, which
  // says with a colour what the method says in four characters: the middle is
  // on no seat, takes no phase from one, and is not walked.
  const centre = left + cell * 2;
  parts.push(
    `<rect x="${round(centre)}" y="${round(top + cell * 2)}" width="${round(cell)}" ` +
      `height="${round(cell)}" fill="var(--qmdj-ground)" class="cell"/>`,
    text(centre + cell / 2, top + cell * 2.42, '中', cell * 0.2, 'faint'),
  );
  (standing.get(5) ?? []).forEach((glyph, index) => {
    parts.push(
      text(centre + cell / 2, top + cell * (2.66 + index * 0.16), glyph, cell * 0.14, 'word'),
    );
  });

  return parts;
}

/**
 * The sixteen, on the border of the grid.
 *
 * Each cell carries the seat it stands on — a branch, or a corner trigram —
 * the god's name under it, and under that the word for the name in the
 * reader's language, on at most two lines. The same bargain the other three
 * drawings strike: the hanzi is the name and the word beside it is what makes
 * the board legible to the reader this is built for, who would otherwise be
 * looking at sixteen shapes.
 *
 * The cell is tinted by the seat's own phase and the name is inked in it. The
 * two eyes are ruled rather than tinted: they are the only two of the sixteen
 * the year singles out, and a tint would have to compete with the phase
 * already there.
 */
function ring(
  board: PlateTaiyi,
  labels: PlateTaiyiLabels,
  box: { left: number; top: number; cell: number },
): string[] {
  const parts: string[] = [];
  const { left, top, cell } = box;
  const room = cell * 0.88;

  board.gods.forEach((god, index) => {
    const [row, column] = RING_SEAT[index] as readonly [number, number];
    const x = left + column * cell;
    const y = top + row * cell;
    const middle = x + cell / 2;

    parts.push(
      `<rect x="${round(x)}" y="${round(y)}" width="${round(cell)}" height="${round(cell)}" ` +
        `fill="var(--qmdj-element-${god.element})" class="cell"/>`,
    );

    if (god.id === board.wenchang.id || god.id === board.shiji.id) {
      const inset = cell * 0.06;
      parts.push(
        `<rect x="${round(x + inset)}" y="${round(y + inset)}" ` +
          `width="${round(cell - inset * 2)}" height="${round(cell - inset * 2)}" class="rule"/>`,
      );
    }

    // The seat, the name, and the word for it. The room for a second line of
    // word is reserved rather than hoped for: «la virtù della concordia» and
    // `the great gathering` are the ordinary case in both languages, not the
    // exception, and a line that ran on would run into the cell below.
    parts.push(
      text(middle, y + cell * 0.28, SEAT_GLYPH[index] as string, cell * 0.17, 'faint'),
      text(middle, y + cell * 0.6, god.hanzi, cell * 0.17, god.element),
      ...worded(middle, y + cell * 0.78, labels.god?.[god.id], cell * 0.085, room),
    );
  });

  return parts;
}

/**
 * The conditions, listed under the grid in the order the engine found them.
 *
 * Never sorted by fortune: a board with six adverse conditions is not a worse
 * board, because worse is a word about somebody's undertaking and no
 * undertaking is known here.
 */
function conditionsOf(
  board: PlateTaiyi,
  labels: PlateTaiyiLabels,
  box: { size: number; margin: number; top: number },
): string[] {
  const step = box.size * 0.028;
  return board.patterns.map((pattern, index) =>
    text(
      box.margin,
      box.top + step * (index + 1),
      `${pattern.hanzi} ${pattern.valence.hanzi}  ${labels.pattern?.[pattern.id] ?? ''}`,
      box.size * 0.02,
      'faint',
      'start',
    ),
  );
}

/** Which direction each of the sixteen seats faces, in ring order from 子. */
const SEAT_DIRECTION: readonly (string | null)[] = [
  'n', null, 'ne', null, 'e', null, 'se', null, 's', null, 'sw', null, 'w', null, 'nw', null,
];

/** The seat each of the sixteen stands on: a branch, or a corner trigram. */
const SEAT_GLYPH: readonly string[] = [
  '子', '丑', '艮', '寅', '卯', '辰', '巽', '巳',
  '午', '未', '坤', '申', '酉', '戌', '乾', '亥',
];

/**
 * A word under a name, on at most two lines.
 *
 * Two and never three: a third would run into the cell below, and the cell
 * below is another name. Where no split leaves both halves inside the width
 * the word comes back whole and is shrunk to fit, which is the only answer
 * left for a language that puts «il signore della terra» where the hanzi put
 * two characters. The same helper the ring of twelve has, kept local as that
 * one is: the two drawings measure different rooms and share no geometry.
 */
function worded(x: number, y: number, word: string | undefined, size: number, room: number): string[] {
  if (!word) return [];
  return broken(word, size, room).map((line, index) =>
    text(x, y + index * size * 1.15, line, fitted(line, size, room), 'word'),
  );
}

function saidOnBoard(board: PlateTaiyi): Said[][] {
  return [said(board.gods)].filter((group) => group.length > 0);
}

function ariaLabel(board: PlateTaiyi): string {
  return (
    `太乙 ${board.year} ${board.sui.hanzi} · ` +
    `太乙${board.taiyi.palace.hanzi}${board.taiyi.palace.number}宮 · ` +
    `主算${board.host.count} 客算${board.guest.count}`
  );
}

function text(
  x: number,
  y: number,
  content: string,
  size: number,
  className?: string | undefined,
  anchor: 'start' | 'middle' = 'middle',
): string {
  if (!content) return '';
  const cls = className ? ` class="${className}"` : '';
  return (
    `<text x="${round(x)}" y="${round(y)}" font-size="${round(size)}" ` +
    `text-anchor="${anchor}"${cls}>${escape(content)}</text>`
  );
}
