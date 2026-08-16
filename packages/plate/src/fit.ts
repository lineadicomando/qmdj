/**
 * Making type fit a space, and the two chores every drawing here shares.
 *
 * There is no text engine in this package and there is not going to be one:
 * the drawings emit SVG and something else lays the glyphs out. What they need
 * is an estimate good enough to keep a word off a rule, and they all use the
 * same one — a CJK glyph is square, a Latin letter about half as wide, a tone
 * mark rides over its vowel without widening it.
 *
 * It lives here because it was the fourth board that made the point: the same
 * estimate, the same splitting rule and the same two string chores had been
 * hand-copied into every drawing as it was written, and a correction to the
 * width of a codepoint range would have landed on whichever one its author was
 * reading. Two measures stay where they are and do not come here — `svg.ts`
 * measures runs rather than strings, and `readings.ts` counts a Latin letter
 * at 0.54 for the band it sets — which is a difference that can only be
 * deliberate once there is one measure to differ from.
 */

/** How wide a string is, in ems of its own size. */
export function measure(value: string): number {
  let ems = 0;
  for (const character of value) ems += (character.codePointAt(0) as number) > 0x2e7f ? 1 : 0.52;
  return ems;
}

/**
 * A font size that keeps a line inside the room it was given.
 *
 * It only ever shrinks: a short word is not blown up to fill a cell.
 */
export function fitted(content: string, size: number, room: number): number {
  if (!content) return size;
  const width = measure(content) * size;
  return width <= room ? size : (size * room) / width;
}

/**
 * A word over at most two lines, split where the halves come out most even.
 *
 * Two and never three: a third line runs into the cell below, and the cell
 * below is another name. Where no split leaves both halves inside the width
 * the word comes back whole, for the caller to shrink — which is the only
 * answer left for a language that puts «il signore della terra» where the
 * hanzi put two characters.
 */
export function broken(word: string, size: number, room: number): string[] {
  if (fitted(word, size, room) === size) return [word];
  const spaces = [...word].flatMap((character, index) => (character === ' ' ? [index] : []));
  if (spaces.length === 0) return [word];

  const middle = word.length / 2;
  const at = spaces.reduce((best, index) =>
    Math.abs(index - middle) < Math.abs(best - middle) ? index : best,
  );
  const halves = [word.slice(0, at), word.slice(at + 1)];
  return halves.every((half) => fitted(half, size, room) === size) ? halves : [word];
}

/**
 * A line broken into as many as it needs, measured in ems.
 *
 * The same estimate applied to breaking rather than to shrinking, because
 * shrinking a sentence to fit a sheet makes it a sentence nobody reads.
 */
export function folded(line: string, ems: number): string[] {
  const lines: string[] = [];
  let current = '';
  let width = 0;

  for (const word of line.split(' ')) {
    const measured = measure(`${current ? ' ' : ''}${word}`);
    if (current && width + measured > ems) {
      lines.push(current);
      current = word;
      width = measure(word);
      continue;
    }
    current += `${current ? ' ' : ''}${word}`;
    width += measured;
  }

  if (current) lines.push(current);
  return lines;
}

/** Two decimals, which is finer than any of these drawings can show. */
export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** The four characters that would otherwise close a tag somebody's name is in. */
export function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
