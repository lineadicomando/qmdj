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
 * Shared by every board rather than written five times. The grid of nine, the
 * ring of twelve and the five-by-five have different geometries and the same
 * problem, and a band that drifted between them would teach a reader as many
 * habits as there are drawings for one lookup.
 *
 * **Columned on all five.** The band began as lines run end to end behind
 * interpuncts, filled to the width; that is a paragraph to be searched where a
 * column is a list to be scanned, and the run-on form went when the last board
 * left it. How many columns is each drawing's own — the boards that carry the
 * word beside the reading take three, and the two whose entries are a name and
 * a reading and nothing else take four, because a third of the width would
 * otherwise stand empty.
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
 *
 * **`over` is the size of the line it keys, and it is not the size of the
 * ring.** A key drawn at the height of what it points at grows with it, and a
 * board that sets a name at twice the band's size then carries a numeral at
 * twice the band's — which reads as a second register of content rather than
 * as an index, and reads as a *different* index at every seat of one grid.
 * The ring stays the small mark it is at both ends of the lookup; what it
 * borrows from the line is only where to sit, so it centres on the glyph
 * instead of hanging under it. Callers whose line and ring are one size pass
 * nothing.
 */
export function ringed(index: number, x: number, y: number, size: number, over = size): string {
  const r = size * 0.56;
  const cx = x + r;
  const cy = y - over * 0.28;
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

/** How wide one column is, given the width of the band and how many there are. */
function columnRoom(at: { size: number; maxWidth: number; columns: number }): number {
  const gutter = at.size * 1.2;
  return (at.maxWidth + gutter) / at.columns - gutter;
}

/** One entry, with what it costs: one line, or two where it has to break. */
interface Measured {
  one: Said;
  head: string;
  whole: string;
  broken: boolean;
  lines: number;
}

/**
 * What an entry costs, decided once and read by both the depth and the drawing.
 *
 * The two used to work it out apiece from the same rule, which held only for
 * as long as nobody edited one of them.
 */
function measured(one: Said, room: number, size: number): Measured {
  const head = `${one.hanzi}${BREATH}${one.pinyin}`;
  const whole = one.word ? `${head}${BREATH}${one.word}` : head;
  const scale = (room - (one.index ? ringRoom(size) : 0)) / (measure(whole) * size);
  const broken = Boolean(one.word) && scale < KEEP;
  return { one, head, whole, broken, lines: broken ? 2 : 1 };
}

/**
 * A group shared out into columns, filled to an even number of *lines*.
 *
 * Lines and not entries, so a column holding two broken entries takes two
 * fewer names than the one beside it and both end level.
 *
 * **Every column gets a quota before the first entry is placed, and the
 * quotas differ by at most a line.** Filling each column to `ceil(total /
 * columns)` in turn is the same depth and not the same picture: nine names in
 * four columns come out three, three, three and an empty fourth, which reads
 * as a column that failed to fill rather than as a list. Three, two, two, two
 * is the same three lines deep and uses the width it was given.
 *
 * The last column takes whatever is left over whether or not that is its
 * quota — an entry has to go somewhere — which is why the depth is measured
 * from the columns this returns rather than predicted from the count.
 */
function shareOut(entries: readonly Measured[], columns: number): Measured[][] {
  const total = entries.reduce((n, entry) => n + entry.lines, 0);
  const base = Math.floor(total / columns);
  const spare = total % columns;

  const out: Measured[][] = [];
  let here: Measured[] = [];
  let used = 0;
  for (const entry of entries) {
    const quota = base + (out.length < spare ? 1 : 0);
    if (here.length > 0 && used + entry.lines > quota && out.length < columns - 1) {
      out.push(here);
      here = [];
      used = 0;
    }
    here.push(entry);
    used += entry.lines;
  }
  if (here.length > 0) out.push(here);
  return out;
}

/** How deep a group comes out, which is the deepest of its columns. */
function depthOf(columns: readonly (readonly Measured[])[]): number {
  return Math.max(
    0,
    ...columns.map((column) => column.reduce((n, entry) => n + entry.lines, 0)),
  );
}

/**
 * How many lines the columned band will take.
 *
 * Asked before the sheet is sized, because the answer is not the number of
 * names: some break onto a second line and the columns are filled to an even
 * number of lines. The caller has to know the depth to give the band room, and
 * guessing it short runs the band off the paper.
 *
 * **Measured from the same share-out the drawing performs, not predicted from
 * the count.** `ceil(total / columns)` is what the columns come to when every
 * entry is one line and is a line short when a broken entry closes a column
 * early and the leftovers pile into the last one — a band that runs off the
 * paper in exactly the case the breaking was introduced for.
 */
export function readingDepth(
  groups: readonly (readonly Said[])[],
  at: { size: number; maxWidth: number; columns: number },
): number {
  const room = columnRoom(at);

  let deep = 0;
  for (const group of groups) {
    if (group.length === 0) continue;
    if (deep > 0) deep += GROUP_GAP;
    deep += depthOf(shareOut(group.map((one) => measured(one, room, at.size)), at.columns));
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
 * How a group is shared out is `shareOut`'s, and it is the same call
 * `readingDepth` makes: the height of the paper was settled by that answer
 * before this ran, so working it out a second way here would be two rules for
 * one band. A group never shares its columns with another: the seats begin
 * under the tallest column of the stars.
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
  const room = columnRoom(at);

  const parts = [line(at.x, at.heading, [{ text: heading, className: 'word' }], at)];
  let top = at.first;

  for (const group of filled) {
    const columns = shareOut(
      group.map((one) => measured(one, room, at.size)),
      at.columns,
    );

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
