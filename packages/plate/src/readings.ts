import { escape, fitted, round } from './fit.js';
/**
 * The band where the board says its names aloud.
 *
 * Every named thing in the engine carries its reading, and every surface that
 * sets type prints it — the tables beside the drawing, the CLI, the transcript.
 * The drawing was the exception, and not by choice: a register in a palace is
 * a glyph with a word wrapped under it, and the third line a reading would
 * take is the register below it. The drawing is proportional throughout, so
 * asking for more pixels buys a larger picture of the same crowding.
 *
 * So the readings go under the board, on the precedent the configurations set:
 * the paper grows downward by what the list needs and the square above it does
 * not move. A glyph alone is, to the reader this is built for, a shape with no
 * sound — unsayable, unsearchable, unaskable — and the picture is the half of
 * this that travels furthest from the page that made it.
 *
 * Shared by both boards rather than written twice. The grid of nine and the
 * ring of twelve have different geometries and the same problem, and a band
 * that drifted between them would teach a reader two habits for one lookup.
 */

/** A name, the sound of it, and — where a caller has one — the word for it. */
export interface Said {
  hanzi: string;
  pinyin: string;
  /**
   * The entry's place in the band, from one.
   *
   * Set by the caller when the drawing means to key its cells to this list:
   * the same numeral goes beside the name in the grid, so a reader meeting a
   * glyph can find what it means without knowing how it is said.
   */
  index?: number | undefined;
  /**
   * What the name means, in the reader's language.
   *
   * Optional, and supplied by one board rather than by all: a drawing whose
   * cells have room for the word beside the glyph does not need it repeated
   * here, and a drawing whose cells do not is the one that does. 紫微斗數
   * sets forty names in twelve squares and can afford the word on one to a
   * square, so its band is where the other thirty-nine are said. The rest pass
   * nothing and their bands are unchanged.
   */
  word?: string | undefined;
}

/**
 * A ringed numeral, drawn rather than typed.
 *
 * The circled digits Unicode carries stop at fifty and come out full-width in
 * a CJK font, which is twice the room this has. Drawn, it is the same mark at
 * any count and it sits on the line it belongs to.
 *
 * Faint and smaller than the name it keys: it is an index, not a reading, and
 * a reader who is not looking one up has to be able to look past it.
 */
export function ringed(index: number, x: number, y: number, size: number): string {
  const r = size * 0.56;
  const cx = x + r;
  const cy = y - size * 0.28;
  return (
    `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" class="ring"/>` +
    `<text x="${round(cx)}" y="${round(cy + size * 0.28)}" font-size="${round(size * 0.76)}" ` +
    `text-anchor="middle" class="faint">${index}</text>`
  );
}

/**
 * How much room a ringed numeral takes on a line, in the units it is drawn in.
 *
 * A shade over the ring's own diameter, which is what keeps it off the glyph
 * beside it. Tightening it below that does not buy a narrower entry, it buys
 * a numeral sitting on a name.
 */
export function ringRoom(size: number): number {
  return size * 1.32;
}

/**
 * Between the name and its reading.
 *
 * A thin space and not an ordinary one: the two are separate runs of the line,
 * set in different inks, and a renderer collapses ordinary whitespace at the
 * seam between two tspans — which welds the reading to the glyph.
 */
const BREATH = ' ';

/** Between two entries of a line, as in the band above this one. */
const WITHIN = ' · ';

/**
 * One register's worth of names, each said once, in the order they arrived.
 *
 * Gathered by glyph: a chart puts the same star in one palace and the same
 * stem in two, and a list that repeated them would be longer without saying
 * more. The order is the engine's — sorting by reading would be an index a
 * reader cannot enter, since somebody looking a glyph up does not know how it
 * is said, which is why they are looking.
 *
 * **Nothing without a reading is listed.** The shapes here are the drawing's
 * own, and their readings are optional in it, so a caller on an older engine
 * draws a shorter band rather than a band of blanks.
 */
export function said(
  names: Iterable<{ hanzi: string; pinyin?: string | undefined; id?: string } | undefined>,
  words: Record<string, string> = {},
): Said[] {
  const gathered = new Map<string, Said>();
  for (const name of names) {
    if (!name?.pinyin || !name.hanzi || gathered.has(name.hanzi)) continue;
    const word = name.id ? words[name.id] : undefined;
    gathered.set(name.hanzi, { hanzi: name.hanzi, pinyin: name.pinyin, ...(word ? { word } : {}) });
  }
  return [...gathered.values()];
}

/**
 * The groups laid into lines, and a group never sharing one with another.
 *
 * The groups are not named, because the shapes rhyme: a line of 門 is
 * self-evidently the gates, and a reader who learned that the gate is the
 * bottom-right register lands in the right neighbourhood by shape alone. A
 * heading over each would cost five lines to say what five lines already say.
 *
 * `ems` is the width of the band in ems of the line's own size, which is how
 * the width of a drawing reaches a wrap that has no text engine behind it.
 */
export function wrapped(groups: readonly (readonly Said[])[], ems: number): Said[][] {
  const lines: Said[][] = [];

  for (const group of groups) {
    // Filled to an even share of the width rather than to the width itself.
    // A group takes the lines it takes either way — the count is the same —
    // and filling each to the brim leaves the last of them holding one name,
    // which reads as a mistake in a list whose whole job is to be scanned.
    const whole = group.reduce((ems_, one) => ems_ + measure(WITHIN) + measure(one), -measure(WITHIN));
    const share = whole / Math.max(1, Math.ceil(whole / ems));

    let line: Said[] = [];
    let width = 0;

    for (const one of group) {
      const separated = line.length > 0 ? measure(WITHIN) + measure(one) : measure(one);
      // Never past the width, and past the share only where stopping short
      // would cost a line that the width itself would not have.
      if (line.length > 0 && (width + separated > ems || width >= share)) {
        lines.push(line);
        line = [];
        width = measure(one);
      } else {
        width += separated;
      }
      line.push(one);
    }

    if (line.length > 0) lines.push(line);
  }

  return lines;
}

/** Where a band goes, in the units the drawing that asked for it measures in. */
export interface Placed {
  /** Left edge. The band is flush left, as the list of configurations is. */
  x: number;
  /** Baseline of the heading. */
  heading: number;
  /** Baseline of the first line, and the step to each one after it. */
  first: number;
  step: number;
  size: number;
  /** Beyond this a line is shrunk rather than allowed to run over. */
  maxWidth: number;
}

/**
 * The band, drawn.
 *
 * Asked for by its heading, like the band above it and the frame around it:
 * the heading is a word in the reader's language and therefore the caller's to
 * supply, which keeps this package holding no catalog. No lines is no band
 * rather than a heading over nothing.
 */
/**
 * How small an entry may be set to keep it on one line.
 *
 * Above this it is shrunk, which nobody sees; below it the entry breaks after
 * its reading and the word goes on a line of its own at full size. Measured
 * over both catalogs, that is six or seven entries of fifty-seven — and the
 * longest half of any of them still fits a column, so a broken entry never
 * needs shrinking as well.
 */
const KEEP = 0.92;

/**
 * The breath between one group and the next, in lines.
 *
 * The groups start level, so the shallowest columns show the join and the
 * deepest one does not — and in that column the twelve seats ran straight on
 * from the stars as though they were more of them. Half a line is enough to
 * part them without reading as a heading nobody wrote.
 */
const GROUP_GAP = 0.6;

/**
 * How many lines the columned band will take.
 *
 * Asked before the sheet is sized, because the answer is not the number of
 * names: some break onto a second line and the columns are filled to an even
 * number of lines. The caller has to know the depth to give the band room, and
 * guessing it short runs the band off the paper.
 */
export function readingDepth(
  groups: readonly (readonly Said[])[],
  at: { size: number; maxWidth: number; columns: number },
): number {
  const gutter = at.size * 1.2;
  const room = (at.maxWidth + gutter) / at.columns - gutter;

  let deep = 0;
  for (const group of groups) {
    if (group.length === 0) continue;
    const lines = group.map((one) => {
      if (!one.word) return 1;
      const whole = `${one.hanzi}${BREATH}${one.pinyin}${BREATH}${one.word}`;
      const usable = room - (one.index ? ringRoom(at.size) : 0);
      return usable / (measure(whole) * at.size) < KEEP ? 2 : 1;
    });
    if (deep > 0) deep += GROUP_GAP;
    deep += Math.ceil(lines.reduce((n, count) => n + count, 0) / at.columns);
  }
  return deep;
}

/**
 * The band, drawn in columns.
 *
 * **Each column runs on its own, and that is what lets an entry take two
 * lines.** A row shared across three columns has to advance them together, so
 * one entry breaking would have pushed its neighbours out of line or over each
 * other; given its own cursor, a column simply grows a line longer than its
 * neighbours, which is what a column of a printed list does.
 *
 * The columns are filled to an even number of *lines* rather than of entries,
 * so a column holding two broken entries takes two fewer names than the one
 * beside it and both end level. A group never shares its columns with another:
 * the seats begin under the tallest column of the stars.
 */
export function drawReadingColumns(
  groups: readonly (readonly Said[])[],
  heading: string,
  at: Placed & { columns: number },
): string[] {
  const filled = groups.filter((group) => group.length > 0);
  if (filled.length === 0) return [];

  const gutter = at.size * 1.2;
  const column = (at.maxWidth + gutter) / at.columns;
  const room = column - gutter;

  const parts = [line(at.x, at.heading, [{ text: heading, className: 'word' }], at)];
  let top = at.first;

  for (const group of filled) {
    // What each entry costs: one line, or two where keeping it on one would
    // set it below what a reader can take in.
    const measured = group.map((one) => {
      const head = `${one.hanzi}${BREATH}${one.pinyin}`;
      const whole = one.word ? `${head}${BREATH}${one.word}` : head;
      const scale = (room - (one.index ? ringRoom(at.size) : 0)) / (measure(whole) * at.size);
      const broken = Boolean(one.word) && scale < KEEP;
      return { one, head, whole, broken, lines: broken ? 2 : 1 };
    });

    // Filled to an even share of the lines, never past it unless the column
    // is still empty — one entry has to go somewhere.
    const total = measured.reduce((n, entry) => n + entry.lines, 0);
    const share = Math.ceil(total / at.columns);
    const columns: (typeof measured)[] = [[]];
    let used = 0;
    for (const entry of measured) {
      const here = columns[columns.length - 1] as typeof measured;
      if (here.length > 0 && used + entry.lines > share && columns.length < at.columns) {
        columns.push([entry]);
        used = entry.lines;
      } else {
        here.push(entry);
        used += entry.lines;
      }
    }

    let deepest = 0;
    columns.forEach((entries, place) => {
      const x = at.x + column * place;
      let y = top;
      for (const entry of entries) {
        const key = entry.one.index;
        const indent = key ? ringRoom(at.size) : 0;
        if (key) parts.push(ringed(key, x, y, at.size));
        if (entry.broken) {
          parts.push(
            line(x + indent, y, [
              { text: entry.one.hanzi },
              { text: `${BREATH}${entry.one.pinyin}`, className: 'word' },
            ], { ...at, maxWidth: room }),
          );
          y += at.step;
          // Indented under the name it belongs to, so the eye keeps them
          // together where a flush second line would read as a new entry.
          parts.push(
            line(
              x + indent + at.size * 0.9,
              y,
              [{ text: entry.one.word as string, className: 'faint' }],
              { ...at, maxWidth: room - indent },
            ),
          );
          y += at.step;
        } else {
          const runs: Run[] = [
            { text: entry.one.hanzi },
            { text: `${BREATH}${entry.one.pinyin}`, className: 'word' },
          ];
          if (entry.one.word) runs.push({ text: `${BREATH}${entry.one.word}`, className: 'faint' });
          const size = fitted(entry.whole, at.size, room - indent);
          parts.push(line(x + indent, y, runs, { ...at, size, maxWidth: room - indent }));
          y += at.step;
        }
      }
      deepest = Math.max(deepest, y);
    });

    top = deepest + at.step * GROUP_GAP;
  }

  return parts.filter(Boolean);
}

export function drawReadings(lines: readonly (readonly Said[])[], heading: string, at: Placed): string[] {
  if (lines.length === 0) return [];

  const parts = [line(at.x, at.heading, [{ text: heading, className: 'word' }], at)];

  lines.forEach((entries, index) => {
    const runs: Run[] = [];
    for (const one of entries) {
      if (runs.length > 0) runs.push({ text: WITHIN, className: 'faint' });
      // The glyph in full ink and the reading beside it in the word's, which
      // is the register the words under the palaces are set in: the reading is
      // what a reader without Chinese takes away, and it is held there rather
      // than whispered at the faintness of a gloss on something already legible.
      runs.push({ text: one.hanzi }, { text: `${BREATH}${one.pinyin}`, className: 'word' });
      // The word after the reading and fainter than it, because the order is
      // the order of use: a reader meets the glyph on the board, needs the
      // sound to ask about it, and the meaning last. Fainter, because unlike
      // the reading it is a gloss on something the line has already said.
      if (one.word) runs.push({ text: `${BREATH}${one.word}`, className: 'faint' });
    }
    parts.push(line(at.x, at.first + at.step * index, runs, at));
  });

  return parts.filter(Boolean);
}

interface Run {
  text: string;
  className?: string;
}

function line(x: number, y: number, runs: readonly Run[], at: Placed): string {
  const written = runs.filter((run) => run.text);
  if (written.length === 0) return '';

  // An SVG neither wraps nor clips of its own accord, so a line with one entry
  // too wide for the band comes down in size rather than running off the paper.
  const needed = written.reduce((ems, run) => ems + measure(run.text), 0) * at.size;
  const size = needed > at.maxWidth ? (at.size * at.maxWidth) / needed : at.size;

  const body = written
    .map((run) =>
      run.className ? `<tspan class="${run.className}">${escape(run.text)}</tspan>` : escape(run.text),
    )
    .join('');

  return `<text x="${round(x)}" y="${round(y)}" font-size="${round(size)}" text-anchor="start">${body}</text>`;
}

/**
 * How wide something is, in ems of its own size.
 *
 * Estimated rather than measured, as everywhere else here: there is no text
 * engine in this package, and the estimate only has to keep a line inside the
 * paper. A CJK glyph is square; a Latin letter is roughly half as wide, and a
 * tone mark rides over one without widening it.
 */
function measure(content: string | Said): number {
  const text =
    typeof content === 'string'
      ? content
      : `${content.hanzi}${BREATH}${content.pinyin}${content.word ? `${BREATH}${content.word}` : ''}`;
  let ems = 0;
  for (const character of text) ems += /[⺀-鿿＀-｠]/.test(character) ? 1 : 0.54;
  return ems;
}
