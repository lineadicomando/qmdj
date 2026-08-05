import { DEFAULT_LOCALE, type Locale } from '@qimendunjia/i18n';
import { normalizeName, openDatabase } from './database.js';
import { GeoError, type Location, type SearchOptions } from './types.js';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

interface LocationRow {
  id: number;
  name: string;
  country_code: string;
  country: string;
  region: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  population: number;
  exact: number;
}

/**
 * Name selection expressions for the requested language.
 *
 * English reads the primary GeoNames columns directly: the dataset already
 * stores the international exonym there ("Rome", "Munich", "Naples"). Italian
 * prefers its own variant and falls back to English when none exists — minor
 * towns rarely have an exonym, and an empty field would be worse than the
 * international name.
 */
function nameColumns(lang: Locale): string {
  if (lang === 'it') {
    return `COALESCE(l.name_it, l.name_en) AS name,
            COALESCE(l.country_it, l.country_en) AS country,
            COALESCE(l.region_it, l.region_en) AS region`;
  }
  return 'l.name_en AS name, l.country_en AS country, l.region_en AS region';
}

/**
 * Searches places by name, returning the candidates ranked by relevance.
 *
 * Disambiguation is **explicit**: the function does not pick for you among
 * the dozens of "Rome" in the world, it returns the list. That is the
 * premise for agent use — guessing here produces charts that are wrong in
 * silence.
 *
 * The search runs over every known name of a place, in any language,
 * independently of `lang`: one can search "Munich" and receive "Monaco di
 * Baviera".
 *
 * Ranking: exact matches first, then by descending population.
 */
export function searchLocations(query: string, options: SearchOptions = {}): Location[] {
  const normalized = normalizeName(query);
  if (normalized.length === 0) {
    throw new GeoError('EMPTY_QUERY');
  }

  const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const database = openDatabase(options.databasePath);

  // A range comparison rather than `LIKE 'prefix%'`, which reads as an
  // equivalent and is not: under the default collation SQLite cannot use an
  // index for LIKE and falls back to scanning every name in the table.
  // Measured on this dataset, the same prefix costs 111 ms as a scan against
  // 2.9 ms as an index seek — the difference between an autocomplete that
  // keeps up with typing and one that does not.
  const conditions = ['n.search_name >= ? AND n.search_name < ?'];
  const parameters: (string | number)[] = [normalized, prefixUpperBound(normalized)];

  if (options.countryCode) {
    conditions.push('l.country_code = ?');
    parameters.push(options.countryCode.toUpperCase());
  }

  // `MAX(...)` over the exact-match flag: a place can have several alternate
  // names, and what matters is the best of them.
  const statement = database.prepare(`
    SELECT l.id, ${nameColumns(options.lang ?? DEFAULT_LOCALE)},
           l.country_code, l.latitude, l.longitude, l.timezone, l.population,
           MAX(CASE WHEN n.search_name = ? THEN 1 ELSE 0 END) AS exact
    FROM location_names n
    JOIN locations l ON l.id = n.location_id
    WHERE ${conditions.join(' AND ')}
    GROUP BY l.id
    ORDER BY exact DESC, l.population DESC, name ASC
    LIMIT ?
  `);

  const rows = statement.all(normalized, ...parameters, limit) as unknown as LocationRow[];
  return rows.map(toLocation);
}

/** Returns a place from its GeoNames identifier. */
export function getLocation(id: number, options: SearchOptions = {}): Location | undefined {
  const database = openDatabase(options.databasePath);
  const row = database
    .prepare(
      `SELECT l.id, ${nameColumns(options.lang ?? DEFAULT_LOCALE)},
              l.country_code, l.latitude, l.longitude, l.timezone, l.population, 1 AS exact
       FROM locations l WHERE l.id = ?`,
    )
    .get(id) as unknown as LocationRow | undefined;
  return row ? toLocation(row) : undefined;
}

/** Import metadata: dataset source, date, number of places. */
export function databaseInfo(options: SearchOptions = {}): Record<string, string> {
  const database = openDatabase(options.databasePath);
  const rows = database.prepare('SELECT key, value FROM metadata').all() as unknown as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

function toLocation(row: LocationRow): Location {
  const location: Location = {
    id: row.id,
    name: row.name,
    countryCode: row.country_code,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: row.timezone,
    population: row.population,
  };
  if (row.region) location.region = row.region;
  return location;
}

/**
 * The exclusive upper bound of every string starting with `prefix`.
 *
 * Obtained by incrementing the last code point, so that `san g` yields
 * `san h`: any name beginning with `san g` sorts below it, whatever follows.
 * Working on code points rather than UTF-16 units keeps names outside the
 * Basic Multilingual Plane in range.
 *
 * A side effect worth having: `%` and `_` carry no meaning here, so a query
 * made of wildcards matches nothing instead of everything.
 */
function prefixUpperBound(prefix: string): string {
  const points = [...prefix];
  const last = points.pop();
  if (last === undefined) return prefix;

  let next = (last.codePointAt(0) as number) + 1;
  // Surrogates are not characters: stepping over them keeps the bound a
  // well-formed string.
  if (next >= 0xd800 && next <= 0xdfff) next = 0xe000;
  if (next > 0x10ffff) return `${prefix}\u{10FFFF}`;

  return points.join('') + String.fromCodePoint(next);
}
