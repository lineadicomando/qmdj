import { escape, fitted, round } from './fit.js';
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
  PlatePlacement,
  PlateQizheng,
  PlateQizhengLabels,
  PlateQizhengOptions,
} from './types.js';

/**
 * The 七政四餘 board: eleven positions on a ring of twelve.
 *
 * The ring is the 六壬 board's, cell for cell — 巳午未申 across the top,
 * 亥子丑寅 across the foot — and that is not a borrowing but the same object:
 * twelve thirty-degree stretches of the ecliptic under the branches that name
 * them. Where the two drawings part is what stands on the ring. A 六壬 board
 * turns one thing over each palace and this one lets the sky fall where it
 * falls, so a palace here holds nothing on most mornings and four bodies on
 * some.
 *
 * **That crowding is what settles the layout.** Every other drawing in this
 * package gives each register a fixed place and a word under it; here the
 * count per palace is not known until the sky is asked, and a gloss under
 * each of four bodies in one cell has nowhere to go. So the eleven are
 * *listed* above the ring instead — glossed, with the 宿 and the 入宿度 each
 * one fell on, and 順 or 逆 — and the ring below carries their glyphs alone.
 * A glyph may stand unglossed where it is repeated from somewhere it was
 * glossed a moment before; that is the same bargain the 六壬 ring strikes
 * with the branch of its ground, and the chart's compass ring with the eight
 * directions.
 *
 * The middle of the ring holds the 命宮, which is the one thing on the board
 * that is neither a body nor a palace but an answer about one.
 *
 * **What the sheet cannot gloss, it keys.** Two registers here carry no word
 * and cannot be given one where they stand: a 宿 sits in the rows above beside
 * its 入宿度, in a slot the width of a number, and a 次 heads a palace beside
 * the branch that names it. Both take a ringed numeral instead, and the band
 * under the ring says the name, the reading and the word against that numeral
 * — the same lookup 紫微斗數 keys its seats with, at the same size, so a reader
 * carrying the habit from one board finds it works on the other. The 人事宮 in
 * the foot of a palace is keyed for the opposite reason: there the word is all
 * that is printed, and the key is how a reader gets from it back to 兄弟宮.
 *
 * **The eleven are keyed in the ring and not in the rows.** A key earns its
 * room where a glyph stands with no word beside it, and in the rows the word
 * is already there — while the room it would take there comes straight out of
 * that word, which is the one thing on a row that shrinks to what it is
 * given. «la testa dell'eclissi» set at two thirds of the gloss beside it
 * would be the drawing paying for a shortcut with the thing the shortcut
 * leads to. In a palace there is room and no word, so that is where it goes.
 *
 * Like the other two it holds no catalog and knows no language. Words arrive
 * already chosen.
 */

/** The five phases, as classes the sheet turns into ink colours. */
const PHASES = ['mu', 'huo', 'tu', 'jin', 'shui'] as const;

/**
 * How many columns the band is set in.
 *
 * Three, as the other two columned bands are. This one carries four groups
 * where 紫微斗數 carries two, so the gain is larger: forty-six entries run as
 * lines end to end are a paragraph to be searched, and in columns they are
 * four blocks a reader lands in by shape.
 */
const COLUMNS = 3;

/** Side of the square, in pixels, unless told otherwise. */
export const DEFAULT_QIZHENG_SIZE = 900;

/**
 * Where each branch sits on the ring, as (row, column) of a four by four.
 *
 * The same seating as the 六壬 board, and deliberately identical: a reader
 * who has learned where 午 is on one should not have to learn it twice.
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

export function renderQizhengSvg(board: PlateQizheng, options: PlateQizhengOptions = {}): string {
  const size = options.size ?? DEFAULT_QIZHENG_SIZE;
  const labels = options.labels ?? {};

  const margin = size * 0.045;
  const headingRoom = options.heading ? size * 0.055 : 0;
  // Seven rows on the left and four on the right, so the block is set by the
  // seven: the governors are the same seven at every instant, which is the
  // one thing about this board that never varies in height.
  const upper = size * 0.26;
  const ring = size - margin * 2;
  const cell = ring / 4;
  // Two lines, always: how many remainders the board carries, and where the
  // 宿 came from. Neither is a caveat about *this* board — they are true of
  // every board this engine draws — and both are things a reader counting
  // names or comparing an almanac needs on the sheet rather than in a file.
  const noteStep = size * 0.024;
  const notes = [labels.remainders, labels.frame].filter((one): one is string => Boolean(one));
  const foot = notes.length ? noteStep * notes.length + size * 0.02 : 0;

  const reading = size * 0.017;
  const readingStep = size * 0.023;
  // Numbered only where the band is drawn: numerals in the rows and the
  // palaces with no list under them to meet would key nothing.
  const aloud = options.readings ? numbered(saidOnBoard(board, labels)) : [];
  const key = new Map<string, number>(
    aloud.flat().map((one) => [one.hanzi, one.index as number] as const),
  );
  // Laid out once and measured, because the depth is not the number of names:
  // an entry too wide for its column takes two lines, and the columns are
  // filled to an even number of lines rather than of entries.
  const bandLines = aloud.length
    ? readingDepth(aloud, { size: reading, maxWidth: ring, columns: COLUMNS })
    : 0;
  const band = bandLines ? size * 0.05 + readingStep * bandLines + size * 0.012 : 0;

  const ringTop = margin + headingRoom + upper;
  const height = ringTop + ring + band + margin + foot;

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
      .qmdj .cell { stroke: var(--qmdj-rule); }
      .qmdj .ground { fill: var(--qmdj-ground); }
      .qmdj .ring { fill: none; stroke: var(--qmdj-faint); stroke-width: 0.7; }
    </style>`,
    '<g class="qmdj">',
    `<rect x="0" y="0" width="${size}" height="${round(height)}" class="ground"/>`,
  ];

  if (options.heading) {
    parts.push(text(size / 2, margin + headingRoom * 0.62, options.heading, size * 0.028, 'faint'));
  }

  parts.push(
    ...listing(board, labels, key, {
      size,
      margin,
      top: margin + headingRoom,
      height: upper,
      key: reading,
    }),
  );
  parts.push(...ringOf(board, labels, key, { left: margin, top: ringTop, cell, key: reading }));
  parts.push(...middle(board, labels, { left: margin, top: ringTop, cell }));

  if (aloud.length > 0) {
    parts.push(
      ...drawReadingColumns(aloud, options.readings as string, {
        columns: COLUMNS,
        x: margin,
        heading: ringTop + ring + size * 0.05,
        first: ringTop + ring + size * 0.05 + readingStep * 0.8,
        step: readingStep,
        size: reading,
        maxWidth: ring,
      }),
    );
  }

  notes.forEach((note, index) => {
    parts.push(
      text(
        size / 2,
        ringTop + ring + band + margin + noteStep * (index + 0.8),
        note,
        fitted(note, size * 0.019, ring),
        'faint',
      ),
    );
  });

  parts.push('</g>', '</svg>');
  return parts.join('\n');
}

/**
 * Everything the board names, gathered register by register.
 *
 * Four groups, and the fourth is the reason this band is worth drawing at
 * all: the eleven, the twenty-eight 宿 that came up, the twelve 次 and the
 * twelve 人事宮. The 宿 are the only group whose membership varies — eleven
 * bodies land on at most eleven of the twenty-eight — and they are the group
 * a reader is least able to say, since a lodge name is a single character
 * that turns up nowhere else in daily reading.
 */
function saidOnBoard(board: PlateQizheng, labels: PlateQizhengLabels): Said[][] {
  const placed = [...board.governors, ...board.remainders];
  return [
    said(placed.map((one) => one.body), labels.body ?? {}),
    said(placed.map((one) => one.lodge), labels.lodge ?? {}),
    said(board.houses.map((seat) => seat.ci), labels.ci ?? {}),
    said(board.houses.map((seat) => seat.house), labels.house ?? {}),
  ].filter((group) => group.length > 0);
}

/**
 * The band's entries counted from one, across the groups and not within them.
 *
 * One run of numbers over four registers: a reader holding 31 wants one place
 * to look, and four lists each starting at one would send them to the wrong
 * quarter three times out of four.
 */
function numbered(groups: Said[][]): Said[][] {
  let count = 0;
  return groups.map((group) => group.map((one) => ({ ...one, index: (count += 1) })));
}

/**
 * The eleven, listed and glossed, over the ring they were placed on.
 *
 * Governors on the left and remainders on the right, which is the order the
 * tradition counts them in and also the order of certainty: the seven are
 * bodies somebody can point at, and the four are 隱曜, computed positions
 * that were never seen. Where a board carries three of the four — which is
 * every board this engine draws — the fourth is simply absent, and the note
 * under the ring says why rather than leaving a gap to be wondered at.
 *
 * A row says the body, its gloss, the 宿 it fell in with the degrees past
 * that 宿's determinative star, and which way it runs. The 宮度 is not here:
 * the ring below *is* the 宮, so printing the degree into it beside the lodge
 * degree would put two numbers on one line that mean different things, which
 * is the one confusion this board is most able to cause.
 */
function listing(
  board: PlateQizheng,
  labels: PlateQizhengLabels,
  key: ReadonlyMap<string, number>,
  box: { size: number; margin: number; top: number; height: number; key: number },
): string[] {
  const parts: string[] = [];
  const { size, margin, top, height } = box;
  const columnWidth = (size - margin * 2) / 2;
  const rows = Math.max(board.governors.length, board.remainders.length);
  const step = height / (rows + 0.6);
  const glyph = size * 0.026;
  const small = size * 0.0185;
  const indent = ringRoom(box.key);

  // Where a row's four slots start, as fractions of the column.
  //
  // **The room the two keys take comes out of the gloss and out of nothing
  // else.** The 入宿度 is a number that must not be cut, and 順 and 逆 share
  // one slot cut for the longer of them — set `retrograde` smaller than
  // `direct` beside it and the drawing has made which way a planet runs into
  // a quieter fact than it is. A gloss is the one thing on the row that
  // already shrinks to what it is given, so it is the one thing that can give.
  const GLOSS = 0.14;
  const LODGE = 0.545;
  const MOTION = 0.775;

  const column = (placed: readonly PlatePlacement[], left: number): void => {
    placed.forEach((one, index) => {
      const y = top + step * (index + 0.9);

      parts.push(text(left, y, one.body.hanzi, glyph, one.body.element, 'start'));

      const gloss = labels.body?.[one.body.id];
      if (gloss) {
        // Stopping short of the numeral that opens the next slot, rather than
        // running under it.
        const room = columnWidth * (LODGE - GLOSS) - small * 0.4;
        parts.push(
          text(left + columnWidth * GLOSS, y, gloss, fitted(gloss, small, room), 'word', 'start'),
        );
      }

      // The 宿 and the 入宿度 together, because neither says anything alone:
      // a degree with no lodge is a number and a lodge with no degree is a
      // twelfth of the sky. The word for the lodge is in the band, against
      // the numeral in front of it: there is no room for it here, and this is
      // the register on this board a reader is least able to say.
      const lodgeKey = key.get(one.lodge.hanzi);
      const lodgeAt = left + columnWidth * LODGE;
      if (lodgeKey !== undefined) parts.push(ringed(lodgeKey, lodgeAt, y, box.key, small));
      parts.push(
        text(
          lodgeAt + indent,
          y,
          `${one.lodge.hanzi} ${one.lodgeDegree.toFixed(2)}°`,
          small,
          undefined,
          'start',
        ),
      );

      // The room is cut for the longer of the two words rather than for the
      // commoner one: `retrograde` shrunk to fit beside a full-sized `direct`
      // reads as a quieter fact, and which way a planet runs is not.
      const motion = labels.motion?.[one.motion];
      if (motion) {
        parts.push(
          text(
            left + columnWidth * MOTION,
            y,
            motion,
            fitted(motion, small, columnWidth * (1 - MOTION)),
            'word',
            'start',
          ),
        );
      }
    });
  };

  column(board.governors, margin);
  column(board.remainders, margin + columnWidth);
  return parts;
}

/**
 * The twelve palaces, and whatever the sky put in each.
 *
 * Three registers, and only the outer two are fixed. The head of a cell is
 * the 次 with the branch that names it — the ground, which never moves — and
 * the foot is the 人事宮 that fell there, which moves with the 命宮 and is
 * therefore news. Between them stand the bodies, as many as landed, and that
 * count is what the middle of the cell is sized for rather than filled to.
 *
 * The tint is the branch's own phase, as on the 六壬 ring, and for the same
 * reason: the ground is a fixed thing and colouring it by what stands on it
 * would make the board look different every hour for no reason a reader
 * could name.
 */
function ringOf(
  board: PlateQizheng,
  labels: PlateQizhengLabels,
  key: ReadonlyMap<string, number>,
  box: { left: number; top: number; cell: number; key: number },
): string[] {
  const parts: string[] = [];
  const { left, top, cell } = box;
  const room = cell * 0.9;
  const placed = [...board.governors, ...board.remainders];
  const minggong = board.minggong.palace.index;

  for (let branch = 0; branch < 12; branch += 1) {
    const [row, column] = SEAT[branch] as readonly [number, number];
    const x = left + column * cell;
    const y = top + row * cell;
    const middleX = x + cell / 2;

    parts.push(
      `<rect x="${round(x)}" y="${round(y)}" width="${round(cell)}" height="${round(cell)}" ` +
        `fill="var(--qmdj-element-${GROUND[branch]})" class="cell"/>`,
    );

    // The palace of the life gets a second rule inside the first. It is the
    // one cell a reader looks for before any other, and a tint would have to
    // compete with the phase tint already carrying the ground.
    if (branch === minggong) {
      const inset = cell * 0.035;
      parts.push(
        `<rect x="${round(x + inset)}" y="${round(y + inset)}" ` +
          `width="${round(cell - inset * 2)}" height="${round(cell - inset * 2)}" class="rule"/>`,
      );
    }

    // The head: the 次 with the branch that names it, and the numeral that
    // takes the reader to the word for the 次. Keyed rather than glossed, and
    // the whole reason this board has keys at all — a cell holding four
    // bodies has no line to spare, and a cell holding none would then be the
    // only one that could afford a word.
    const ci = board.houses.find((seat) => seat.palace.index === branch)?.ci;
    const head = `${ci?.hanzi ?? ''} ${HANZI[branch] as string}`;
    const headSize = cell * 0.1;
    const ciKey = ci ? key.get(ci.hanzi) : undefined;
    parts.push(
      ...keyed(head, headSize, 'faint', {
        middle: middleX,
        y: y + cell * 0.145,
        index: ciKey,
        key: box.key,
        room: cell * 0.94,
      }),
    );

    // The bodies, stacked from a fixed first baseline rather than centred on
    // the room they need: an empty palace and a crowded one then begin at the
    // same height, and the ring reads as twelve of one thing.
    const here = placed.filter((one) => one.palace.index === branch);
    here.forEach((one, index) => {
      parts.push(
        ...keyed(one.body.hanzi, cell * 0.125, one.body.element, {
          middle: middleX,
          y: y + cell * (0.36 + index * 0.15),
          index: key.get(one.body.hanzi),
          key: box.key,
          room,
        }),
      );
    });

    // The foot: the 人事宮 that fell here, in the reader's language alone. The
    // numeral runs the other way from every other on this sheet — from a word
    // somebody can read to the glyph and the reading they cannot see, which is
    // the only place 兄弟宮 is said on the whole board.
    const house = board.houses.find((seat) => seat.palace.index === branch)?.house;
    const word = house ? labels.house?.[house.id] : undefined;
    if (word) {
      parts.push(
        ...keyed(word, cell * 0.085, 'word', {
          middle: middleX,
          y: y + cell * 0.94,
          index: house ? key.get(house.hanzi) : undefined,
          key: box.key,
          room,
        }),
      );
    }
  }

  return parts;
}

/**
 * A centred line with its key in front of it, the pair centred as one.
 *
 * The numeral is not part of the line and is not set at its size — it is the
 * small mark it is in the band, sitting level with the glyphs it precedes —
 * but it *is* part of what the cell has to hold, so the line is fitted to
 * what is left rather than to the whole width.
 *
 * **The line hangs off the ring, and not the other way about.** Where the
 * pair goes is estimated, because this package has no text engine and a Latin
 * word's width is a guess here; what the estimate must never cost is the gap
 * between the two, so the text is anchored a fixed step to the right of the
 * ring rather than centred on a guessed middle with the ring hung off its
 * left edge. Under that arrangement `countenance` — eleven letters the guess
 * reads as nine — pulled the ring onto its own first stroke. Now a wrong
 * guess moves the pair a few pixels off centre in a cell two hundred wide,
 * which is a thing nobody can see.
 */
function keyed(
  content: string,
  size: number,
  className: string | undefined,
  at: { middle: number; y: number; index: number | undefined; key: number; room: number },
): string[] {
  if (at.index === undefined) {
    return [text(at.middle, at.y, content, fitted(content, size, at.room), className)];
  }
  // `ringRoom` is the ring plus the hair that keeps it off a glyph set at its
  // own size. Here it precedes a line set larger — a body glyph is eight times
  // the ring's stroke — and the same hair reads as a collision, so a quarter
  // of the ring is added to it.
  const indent = ringRoom(at.key) + at.key * 0.25;
  const set = fitted(content, size, at.room - indent);
  const left = at.middle - (measured(content, set) + indent) / 2;
  return [
    ringed(at.index, left, at.y, at.key, set),
    text(left + indent, at.y, content, set, className, 'start'),
  ];
}

/** How wide a string is at a size, for placing something before it. */
function measured(value: string, size: number): number {
  let ems = 0;
  for (const character of value) ems += /[⺀-鿿＀-｠]/.test(character) ? 1 : 0.52;
  return ems * size;
}

/**
 * The 命宮, written in the space the ring leaves.
 *
 * It is a palace and a name for one, and both are said: the branch and its
 * 次 in glyphs, the word for what the palace *is* under them. Under 加時 it
 * carries no degree, so there is no number here and the absence is the
 * method's rather than the drawing's.
 */
function middle(
  board: PlateQizheng,
  labels: PlateQizhengLabels,
  box: { left: number; top: number; cell: number },
): string[] {
  const centre = box.left + box.cell * 2;
  const top = box.top + box.cell;
  const room = box.cell * 1.85;
  const word = labels.minggong;
  const glyphs = `${board.minggong.palace.hanzi} ${board.minggong.ci.hanzi}`;

  return [
    text(centre, top + box.cell * 0.95, glyphs, fitted(glyphs, box.cell * 0.22, room)),
    text(centre, top + box.cell * 1.22, word ?? '', fitted(word ?? '', box.cell * 0.15, room), 'word'),
  ];
}

/** The twelve branches, for the ground of each palace. */
const HANZI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/**
 * The phase of each palace, which is the phase of its own branch.
 *
 * Written out rather than taken from the board, as on the 六壬 ring: 子 is
 * water at every instant, and a drawing that had to be told so could be told
 * wrongly.
 */
const GROUND = ['shui', 'tu', 'mu', 'mu', 'tu', 'huo', 'huo', 'tu', 'jin', 'jin', 'tu', 'shui'] as const;

function ariaLabel(board: PlateQizheng): string {
  const sun = board.governors[0];
  const where = sun ? `太陽${sun.lodge.hanzi}${sun.lodgeDegree.toFixed(1)}度` : '';
  return `七政四餘 ${where} · 命宮${board.minggong.palace.hanzi}${board.minggong.ci.hanzi}`;
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
