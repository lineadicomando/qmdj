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

/** A name and the sound of it: `休門 xiūmén`. */
export interface Said {
  hanzi: string;
  pinyin: string;
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
export function said(names: Iterable<{ hanzi: string; pinyin?: string | undefined } | undefined>): Said[] {
  const gathered = new Map<string, Said>();
  for (const name of names) {
    if (!name?.pinyin || !name.hanzi || gathered.has(name.hanzi)) continue;
    gathered.set(name.hanzi, { hanzi: name.hanzi, pinyin: name.pinyin });
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
  const text = typeof content === 'string' ? content : `${content.hanzi}${BREATH}${content.pinyin}`;
  let ems = 0;
  for (const character of text) ems += /[⺀-鿿＀-｠]/.test(character) ? 1 : 0.54;
  return ems;
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
