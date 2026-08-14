import { FONT_STACK, styleSheet } from './palette.js';
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

/** Side of the square, in pixels, unless told otherwise. */
export const DEFAULT_LIUREN_SIZE = 720;

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
  const upper = size * 0.26;
  const ring = size - margin * 2;
  const cell = ring / 4;
  const foot = board.unverified && labels.unverified ? size * 0.05 : 0;
  const height = margin + headingRoom + upper + ring + margin + foot;

  const ringTop = margin + headingRoom + upper;

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${round(height)}" ` +
      `width="${size}" height="${round(height)}" role="img" aria-label="${escape(ariaLabel(board))}">`,
    `<style>${styleSheet(options.scheme ?? 'auto')}
      .qmdj { font-family: ${FONT_STACK}; }
      .qmdj text { fill: var(--qmdj-ink); }
      .qmdj .faint { fill: var(--qmdj-faint); }
      .qmdj .rule { stroke: var(--qmdj-rule); fill: none; }
      .qmdj .ground { fill: var(--qmdj-ground); }
    </style>`,
    '<g class="qmdj">',
    `<rect x="0" y="0" width="${size}" height="${round(height)}" class="ground"/>`,
  ];

  if (options.heading) {
    parts.push(text(size / 2, margin + headingRoom * 0.62, options.heading, size * 0.028, 'faint'));
  }

  parts.push(...upperBlock(board, labels, { size, margin, top: margin + headingRoom, height: upper }));
  parts.push(...ringOf(board, { left: margin, top: ringTop, cell }));
  parts.push(...middle(board, labels, { left: margin, top: ringTop, cell }));

  if (foot > 0) {
    parts.push(
      text(size / 2, ringTop + ring + margin + foot * 0.5, labels.unverified as string, size * 0.024, 'faint'),
    );
  }

  parts.push('</g>', '</svg>');
  return parts.join('\n');
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

  const glyph = size * 0.044;
  const small = size * 0.022;
  const column = (size - margin * 2) / 9;

  // 四課, right to left: the first lesson takes the rightmost column, which is
  // where a reader of the tradition looks for it.
  board.courses.forEach((course: PlateCourse, index) => {
    const x = size - margin - column * (index + 0.5);
    parts.push(text(x, top + height * 0.34, course.upper.hanzi, glyph));
    parts.push(text(x, top + height * 0.66, course.lower.hanzi, glyph, 'faint'));
    parts.push(text(x, top + height * 0.9, String(course.number), small, 'faint'));
  });

  // 三傳, downwards on the left, each on **one** baseline: the name of the
  // position, the branch, the general riding it, and the stem covering it —
  // or the word for the absence of one, which is what 空亡 is.
  const rows = board.transmissions.length;
  board.transmissions.forEach((transmission: PlateTransmission, index) => {
    const y = top + height * (0.3 + (index * 0.56) / Math.max(1, rows - 1));
    let x = margin;

    const name = labels.transmission?.[transmission.position];
    if (name) parts.push(text(x, y, name, small, 'faint', 'start'));
    x += column * 1.15;

    parts.push(text(x, y, transmission.branch.hanzi, glyph, undefined, 'start'));
    x += column * 0.8;
    parts.push(text(x, y, transmission.general.hanzi, small, 'faint', 'start'));
    x += column * 1.05;
    parts.push(
      text(
        x,
        y,
        transmission.hiddenStem ? transmission.hiddenStem.hanzi : (labels.empty ?? ''),
        small,
        'faint',
        'start',
      ),
    );
  });

  return parts;
}

/** The twelve palaces, and what has come to stand on each. */
function ringOf(board: PlateLiuren, box: { left: number; top: number; cell: number }): string[] {
  const parts: string[] = [];
  const { left, top, cell } = box;

  for (let branch = 0; branch < 12; branch += 1) {
    const [row, column] = SEAT[branch] as readonly [number, number];
    const x = left + column * cell;
    const y = top + row * cell;

    parts.push(
      `<rect x="${round(x)}" y="${round(y)}" width="${round(cell)}" height="${round(cell)}" class="rule"/>`,
    );
    // The general rides above, the 天盤 branch stands in the middle at full
    // size, and the palace's own branch sits under it faintly: the ground is
    // what the reader orients by, not what they read.
    parts.push(text(x + cell / 2, y + cell * 0.26, board.generals[branch]?.hanzi ?? '', cell * 0.2, 'faint'));
    parts.push(text(x + cell / 2, y + cell * 0.62, board.heaven[branch]?.hanzi ?? '', cell * 0.34));
    parts.push(text(x + cell / 2, y + cell * 0.88, HANZI[branch] as string, cell * 0.18, 'faint'));
  }

  return parts;
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
  const keti = board.keti ? labels.keti?.[board.keti] : undefined;

  return [
    text(centre, top + box.cell * 0.86, rule ?? '', fitted(rule ?? '', box.cell * 0.2, room)),
    text(centre, top + box.cell * 1.3, keti ?? '', fitted(keti ?? '', box.cell * 0.17, room), 'faint'),
  ];
}

/**
 * A font size that keeps a line inside the room it was given.
 *
 * Measured rather than assumed, and crudely on purpose: a hanzi occupies about
 * one em and a Latin letter about half of one, which is close enough to keep
 * type off a rule and far cheaper than laying the glyphs out. It only ever
 * shrinks — a short caption is not blown up to fill the middle.
 */
function fitted(content: string, size: number, room: number): number {
  if (!content) return size;
  let ems = 0;
  for (const character of content) ems += character.codePointAt(0)! > 0x2e7f ? 1 : 0.52;
  const width = ems * size;
  return width <= room ? size : (size * room) / width;
}

/** The twelve branches, for the ground of each palace. */
const HANZI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

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
