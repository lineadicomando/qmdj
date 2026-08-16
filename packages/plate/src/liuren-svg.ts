import { broken, escape, fitted, round } from './fit.js';
import { FONT_STACK, styleSheet } from './palette.js';
import { drawReadings, said, wrapped, type Said } from './readings.js';
import type {
  PlateCourse,
  PlateLiuren,
  PlateLiurenLabels,
  PlateLiurenOptions,
  PlateTransmission,
} from './types.js';

/**
 * The Liu Ren board, drawn the way the tradition prints it.
 *
 * Not a grid of nine. The 六壬 board is a **ring of twelve**: the branches sit
 * round the edge of a square four cells to a side, and the twelve perimeter
 * cells are the twelve palaces of the 地盤 — which never move. What moves is
 * what stands over them, so each cell carries three things stacked: the
 * general on top, the 天盤 branch large in the middle, and the palace's own
 * branch small underneath, faint, because it is the ground and not the news.
 *
 * The ring is not a decision this file made. 巳午未申 across the top, 亥子丑寅
 * across the bottom, 辰卯 and 酉戌 down the sides: that is the arrangement
 * every printed 課式 uses, and it puts the south at the top like the compass
 * on the other board in this package.
 *
 * Above it stand the two things drawn *from* the ring — the four lessons,
 * written right to left as the tradition writes them, and the three
 * transmissions, read downwards. The middle of the ring is left for what the
 * board turned out to be: the rule that drew the transmissions and the name of
 * the shape.
 *
 * Like the chart, it holds no catalog and knows no language. Words arrive
 * already chosen.
 */

/** The five phases, as classes the sheet turns into ink colours. */
const PHASES = ['mu', 'huo', 'tu', 'jin', 'shui'] as const;

/** Side of the square, in pixels, unless told otherwise. */
export const DEFAULT_LIUREN_SIZE = 900;

/**
 * Where each branch sits on the ring, as (row, column) of a four by four.
 *
 * Indexed by the branch's own number, 子 first. Reading them in order walks
 * the ring: 子 at the bottom, anticlockwise along the foot to 寅 in the corner,
 * up the left side, across the top, down the right.
 */
const SEAT: readonly (readonly [number, number])[] = [
  [3, 2], // 子
  [3, 1], // 丑
  [3, 0], // 寅
  [2, 0], // 卯
  [1, 0], // 辰
  [0, 0], // 巳
  [0, 1], // 午
  [0, 2], // 未
  [0, 3], // 申
  [1, 3], // 酉
  [2, 3], // 戌
  [3, 3], // 亥
];

export function renderLiurenSvg(board: PlateLiuren, options: PlateLiurenOptions = {}): string {
  const size = options.size ?? DEFAULT_LIUREN_SIZE;
  const labels = options.labels ?? {};

  // Every measurement is a fraction of the side, so `size` settles the
  // intrinsic size and nothing else — as on the other board.
  const margin = size * 0.045;
  const headingRoom = options.heading ? size * 0.055 : 0;
  const upper = size * 0.3;
  const ring = size - margin * 2;
  const cell = ring / 4;
  const foot = board.unverified && labels.unverified ? size * 0.05 : 0;

  // The names said aloud, under the ring. The wrap needs a width and the paper
  // needs the wrap, and here the width is settled before either — the ring is
  // the side less two margins, and no band moves it.
  const reading = size * 0.017;
  const readingStep = size * 0.023;
  const aloud = options.readings ? wrapped(saidOnBoard(board), ring / reading) : [];
  // The air over the heading is the ring's own rule doubled: the cells are
  // drawn edge to edge and a line set close under them reads as a thirteenth
  // palace rather than as something said about the twelve.
  const band = aloud.length ? size * 0.05 + readingStep * aloud.length + size * 0.012 : 0;

  const height = margin + headingRoom + upper + ring + band + margin + foot;

  const ringTop = margin + headingRoom + upper;

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
      /* No fill declared here, so the tint each palace carries as an
         attribute is the one that lands: a declaration would outrank it,
         which is the trap the chart's stylesheet notes for its anchors. */
      .qmdj .cell { stroke: var(--qmdj-rule); }
      .qmdj .ground { fill: var(--qmdj-ground); }
    </style>`,
    '<g class="qmdj">',
    `<rect x="0" y="0" width="${size}" height="${round(height)}" class="ground"/>`,
  ];

  if (options.heading) {
    parts.push(text(size / 2, margin + headingRoom * 0.62, options.heading, size * 0.028, 'faint'));
  }

  parts.push(...upperBlock(board, labels, { size, margin, top: margin + headingRoom, height: upper }));
  parts.push(...ringOf(board, labels, { left: margin, top: ringTop, cell }));
  parts.push(...middle(board, labels, { left: margin, top: ringTop, cell }));

  if (aloud.length > 0) {
    parts.push(
      ...drawReadings(aloud, options.readings as string, {
        x: margin,
        heading: ringTop + ring + size * 0.05,
        first: ringTop + ring + size * 0.05 + readingStep * 0.8,
        step: readingStep,
        size: reading,
        maxWidth: ring,
      }),
    );
  }

  if (foot > 0) {
    parts.push(
      text(size / 2, ringTop + ring + band + margin + foot * 0.5, labels.unverified as string, size * 0.024, 'faint'),
    );
  }

  parts.push('</g>', '</svg>');
  return parts.join('\n');
}

/**
 * Everything the ring names, gathered register by register.
 *
 * Two groups of twelve and a short third, and the two twelves are on every
 * board there is: the 天盤 is the 地盤 turned, so all twelve branches stand
 * somewhere whatever the hour, and the twelve generals are one to a palace.
 * What varies is the stems — the day's, under the first lesson, and whichever
 * the transmissions came covered by, between one and four of them, which is a
 * line either way. So this band, like the chart's, is very nearly the same
 * height at every hour.
 *
 * The branches are taken from the 天盤 rather than from the ground under it,
 * although both print the same twelve: the ground is written out inside this
 * file and the heaven arrives from the engine with its reading on it. The rule
 * and the 課體 are not here at all — they are set in the middle of the ring as
 * words in the reader's language, and a word has no reading to give.
 */
function saidOnBoard(board: PlateLiuren): Said[][] {
  const branches = said([...board.heaven].sort((one, other) => one.index - other.index));
  // 一課 stands on the day stem and the other three stand on branches, and the
  // shape this file was handed does not say which is which. It does not have
  // to: the twelve branches are all in the group above, so whatever was said
  // there is not a stem and is not said twice.
  const already = new Set(branches.map((one) => one.hanzi));
  const stems = said([
    ...board.courses.map((course) => course.lower),
    ...board.transmissions.map((transmission) => transmission.hiddenStem),
  ]).filter((one) => !already.has(one.hanzi));

  return [branches, said(board.generals), stems].filter((group) => group.length > 0);
}

/**
 * The four lessons and the three transmissions, over the ring they came from.
 *
 * The lessons take the right of the block because they are written right to
 * left — 一課 outermost, where a reader of the tradition looks for it first —
 * and the transmissions take the left, read downwards, because that is the
 * order they were drawn in.
 */
function upperBlock(
  board: PlateLiuren,
  labels: PlateLiurenLabels,
  box: { size: number; margin: number; top: number; height: number },
): string[] {
  const parts: string[] = [];
  const { size, margin, top, height } = box;

  const glyph = size * 0.04;
  const small = size * 0.019;
  const column = (size - margin * 2) / 9;

  // 四課, right to left: the first lesson takes the rightmost column, which is
  // where a reader of the tradition looks for it. What stands over, what it
  // stands on, and a word under each — the lower of the first lesson is the
  // day stem and takes a stem's word, which is why the two maps are separate.
  board.courses.forEach((course: PlateCourse, index) => {
    const x = size - margin - column * (index + 0.5);
    parts.push(text(x, top + height * 0.22, course.upper.hanzi, glyph, course.upper.element));
    parts.push(...worded(x, top + height * 0.33, labels.branch?.[course.upper.id], small, column * 0.95));
    parts.push(text(x, top + height * 0.62, course.lower.hanzi, glyph, course.lower.element));
    parts.push(
      ...worded(
        x,
        top + height * 0.73,
        labels.branch?.[course.lower.id] ?? labels.stem?.[course.lower.id],
        small,
        column * 0.95,
      ),
    );
    parts.push(text(x, top + height * 0.95, String(course.number), small, 'faint'));
  });

  // 三傳, downwards on the left, each on one baseline: the name of the
  // position, the branch, the general riding it, and the stem covering it —
  // or the word for the absence of one, which is what 空亡 is. Each name takes
  // its word underneath, so the picture says in the reader's own language
  // what it says in glyphs.
  const rows = board.transmissions.length;
  board.transmissions.forEach((transmission: PlateTransmission, index) => {
    // Three rows over the block, with the room a two-line word needs left
    // under each: `Metallo yin` and `il serpente alato` are what a European
    // language does to four characters.
    const y = top + height * (0.18 + (index * 0.6) / Math.max(1, rows - 1));
    let x = margin;

    const name = labels.transmission?.[transmission.position];
    if (name) parts.push(text(x, y, name, small, 'faint', 'start'));
    x += column * 1.1;

    parts.push(text(x, y, transmission.branch.hanzi, glyph, transmission.branch.element, 'start'));
    parts.push(...worded(x, y + small * 1.5, labels.branch?.[transmission.branch.id], small, column, 'start'));
    x += column * 0.85;

    parts.push(text(x, y, transmission.general.hanzi, small * 1.3, 'faint', 'start'));
    parts.push(
      ...worded(x, y + small * 1.5, labels.general?.[transmission.general.id], small, column * 1.7, 'start'),
    );
    x += column * 1.75;

    if (transmission.hiddenStem) {
      parts.push(
        text(x, y, transmission.hiddenStem.hanzi, small * 1.3, transmission.hiddenStem.element, 'start'),
      );
      parts.push(
        ...worded(x, y + small * 1.5, labels.stem?.[transmission.hiddenStem.id], small, column * 1.25, 'start'),
      );
    } else if (labels.empty) {
      parts.push(text(x, y, labels.empty, small, 'faint', 'start'));
    }
  });

  return parts;
}

/**
 * The twelve palaces, and what has come to stand on each.
 *
 * Three registers to a cell, and only two of them take a word. The general
 * and the branch standing over the palace are what the board *says*, and a
 * reader who does not read Chinese needs both said — the same bargain the
 * chart strikes with its stars and its stems. The palace's own branch takes
 * none: it is the ground, it never moves, and the twelve of them in order are
 * the frame rather than the news. The chart's compass ring is written in
 * hanzi alone for exactly that reason.
 */
function ringOf(
  board: PlateLiuren,
  labels: PlateLiurenLabels,
  box: { left: number; top: number; cell: number },
): string[] {
  const parts: string[] = [];
  const { left, top, cell } = box;
  const room = cell * 0.88;

  for (let branch = 0; branch < 12; branch += 1) {
    const [row, column] = SEAT[branch] as readonly [number, number];
    const x = left + column * cell;
    const y = top + row * cell;
    const middleX = x + cell / 2;

    // The tint comes from the palace's **own** branch and therefore never
    // moves: the ring is a fixed ground, and what changes from hour to hour is
    // the ink standing on it. The chart tints a palace by its phase for the
    // same reason and to the same faintness — enough to group the board at a
    // glance, never enough to be read instead of the glyphs.
    parts.push(
      `<rect x="${round(x)}" y="${round(y)}" width="${round(cell)}" height="${round(cell)}" ` +
        `fill="var(--qmdj-element-${GROUND[branch]})" class="cell"/>`,
    );

    const general = board.generals[branch];
    const over = board.heaven[branch];

    // The rhythm is set by the branch, which is the headline: at 0.24 of the
    // cell its glyph rises about 0.19 above its own baseline, so the register
    // over it has to have finished by 0.45 — and a general's word runs to two
    // lines often enough (`the celestial queen`, `the six harmonies`) that the
    // room for the second is reserved rather than hoped for.
    parts.push(text(middleX, y + cell * 0.145, general?.hanzi ?? '', cell * 0.13, 'faint'));
    parts.push(...worded(middleX, y + cell * 0.26, labels.general?.[general?.id ?? ''], cell * 0.082, room));
    parts.push(text(middleX, y + cell * 0.68, over?.hanzi ?? '', cell * 0.24, over?.element));
    parts.push(...worded(middleX, y + cell * 0.8, labels.branch?.[over?.id ?? ''], cell * 0.082, room));
    parts.push(text(middleX, y + cell * 0.95, HANZI[branch] as string, cell * 0.115, 'faint'));
  }

  return parts;
}

/**
 * A word under a name, on at most two lines.
 *
 * Two and never three: a third would run into the register below it, and the
 * register below it is another name. Where no split leaves both halves inside
 * the width the word comes back whole and is shrunk to fit, which is the only
 * answer left for a language that puts `the winter snake, eyes covered` where
 * the hanzi put four characters.
 */
function worded(
  x: number,
  y: number,
  word: string | undefined,
  size: number,
  room: number,
  anchor: 'start' | 'middle' = 'middle',
): string[] {
  if (!word) return [];
  const lines = broken(word, size, room);
  return lines.map((line, index) =>
    text(x, y + index * size * 1.15, line, fitted(line, size, room), 'word', anchor),
  );
}

/**
 * What the board turned out to be, written in the space the ring leaves.
 *
 * The room is two cells wide and no wider, and the words arrive from a caller
 * in a language this file does not know — an English gloss is three times the
 * width of the hanzi it renders. So the type is fitted to the space rather
 * than set at a size and hoped for: a caption that would overrun the middle
 * comes down until it does not, and the ring is never written over.
 */
function middle(
  board: PlateLiuren,
  labels: PlateLiurenLabels,
  box: { left: number; top: number; cell: number },
): string[] {
  const centre = box.left + box.cell * 2;
  const top = box.top + box.cell;
  const room = box.cell * 1.85;
  const rule = labels.rule?.[board.rule];
  const named = board.keti ? labels.keti?.[board.keti] : undefined;
  // 八專, 別責 and 涉害 name the shape with the same words as the rule that
  // found it, so a board drawn by one of those would carry the same line
  // twice. Said once.
  const keti = named === rule ? undefined : named;

  return [
    text(centre, top + box.cell * (keti ? 0.86 : 1.05), rule ?? '', fitted(rule ?? '', box.cell * 0.2, room)),
    text(centre, top + box.cell * 1.3, keti ?? '', fitted(keti ?? '', box.cell * 0.17, room), 'faint'),
  ];
}

/** The twelve branches, for the ground of each palace, and their phases. */
const HANZI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/**
 * The phase of each palace of the 地盤, which is the phase of its own branch.
 *
 * Written out rather than taken from the board, because the ground is not
 * something a board reports: 子 is water at every hour of every day, and a
 * drawing that had to be told so could be told wrongly.
 */
const GROUND = ['shui', 'tu', 'mu', 'mu', 'tu', 'huo', 'huo', 'tu', 'jin', 'jin', 'tu', 'shui'] as const;

function ariaLabel(board: PlateLiuren): string {
  const three = board.transmissions.map((t) => t.branch.hanzi).join('');
  return `大六壬 ${board.day.hanzi}日 ${board.hour.hanzi}時 · 月將${board.yuejiang.branch.hanzi} · 三傳${three}`;
}

function text(
  x: number,
  y: number,
  content: string,
  size: number,
  className?: string,
  anchor: 'start' | 'middle' = 'middle',
): string {
  if (!content) return '';
  const cls = className ? ` class="${className}"` : '';
  return (
    `<text x="${round(x)}" y="${round(y)}" font-size="${round(size)}" ` +
    `text-anchor="${anchor}"${cls}>${escape(content)}</text>`
  );
}
