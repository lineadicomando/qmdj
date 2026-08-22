import table from '../../../../../docs/sources.tsv?raw';

/**
 * `docs/sources.tsv`, read into rows.
 *
 * **Imported rather than read from disk**, and `?raw` is what makes that
 * possible: Vite inlines the file at build time, so the register travels
 * inside the bundle and the built server has no path to a repository it is
 * not standing in. `readFileSync` of a path relative to the source would work
 * in development and fail wherever this is deployed from a `build/`
 * directory — which is the failure that would only appear in production.
 *
 * It stays on the server side for one reason: this is four columns of prose
 * over forty-odd rows, and the page renders it whole. Shipping it to the
 * browser as data would send it twice, once as HTML and once as JSON.
 *
 * The parsing is a `split`, deliberately. A TSV whose fields are guaranteed
 * free of tabs and newlines is not CSV — there is no quoting, no escaping and
 * nothing to get wrong — and `docs.test.ts` asserts the file's shape from the
 * repository side, so a malformed row fails a test rather than a page.
 */
export interface RegisterRow {
  /** The layer, keyed as `ParameterBoard` and `LAYERS` key it. */
  board: string;
  quantity: string;
  /**
   * `0` to `5`, or `-` where nothing is registered.
   *
   * A string and not a number, because one of the values is not one. What
   * each means is `docs/notes.md` § "The ladder of evidence", and the page
   * prints the ladder above the table rather than expecting it to be known.
   */
  rung: string;
  standsOn: string;
  checkedAgainst: string;
  /** The heading in `docs/sources.md` where the argument is written out. */
  section: string;
}

const COLUMNS = ['board', 'quantity', 'rung', 'stands_on', 'checked_against', 'section'];

function rows(): RegisterRow[] {
  const [header, ...lines] = table.trim().split('\n');
  if (header?.split('\t').join() !== COLUMNS.join()) {
    throw new Error(`docs/sources.tsv does not carry the columns ${COLUMNS.join(', ')}`);
  }

  return lines.map((line) => {
    const [board = '', quantity = '', rung = '', standsOn = '', checkedAgainst = '', section = ''] =
      line.split('\t');
    return { board, quantity, rung, standsOn, checkedAgainst, section };
  });
}

/** Every quantity the engine reports, with what it stands on. */
export const REGISTER: readonly RegisterRow[] = rows();
