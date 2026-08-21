import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadSchema, normalizeName } from '../src/database.js';
import { databaseInfo, getLocation, searchLocations } from '../src/search.js';
import { GeoError } from '../src/types.js';

/**
 * The tests use a database built on the fly instead of the full GeoNames
 * dataset (90 MB, not versioned): they stay fast and reproducible in CI.
 */
let directory: string;
let databasePath: string;

interface Fixture {
  id: number;
  nameEn: string;
  nameIt: string | null;
  countryCode: string;
  countryEn: string;
  countryIt: string | null;
  regionEn: string | null;
  regionIt: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  population: number;
  names: string[];
}

const FIXTURES: Fixture[] = [
  {
    id: 3169070,
    nameEn: 'Rome',
    nameIt: 'Roma',
    countryCode: 'IT',
    countryEn: 'Italy',
    countryIt: 'Italia',
    regionEn: 'Lazio',
    regionIt: 'Lazio',
    latitude: 41.8919,
    longitude: 12.5113,
    timezone: 'Europe/Rome',
    population: 2_318_895,
    names: ['Rome', 'Roma', 'Rom'],
  },
  {
    id: 4219762,
    nameEn: 'Rome',
    // Places without an Italian exonym keep the international name.
    nameIt: null,
    countryCode: 'US',
    countryEn: 'United States',
    countryIt: 'Stati Uniti',
    regionEn: 'Georgia',
    regionIt: 'Georgia',
    latitude: 34.257,
    longitude: -85.1647,
    timezone: 'America/New_York',
    population: 36_323,
    names: ['Rome'],
  },
  {
    id: 2867714,
    nameEn: 'Munich',
    nameIt: 'Monaco di Baviera',
    countryCode: 'DE',
    countryEn: 'Germany',
    countryIt: 'Germania',
    regionEn: 'Bavaria',
    regionIt: 'Baviera',
    latitude: 48.1374,
    longitude: 11.5755,
    timezone: 'Europe/Berlin',
    population: 1_505_005,
    names: ['Munich', 'München', 'Monaco di Baviera'],
  },
  {
    id: 1816670,
    nameEn: 'Beijing',
    nameIt: 'Pechino',
    countryCode: 'CN',
    countryEn: 'China',
    countryIt: 'Cina',
    regionEn: 'Beijing',
    regionIt: 'Pechino',
    latitude: 39.9075,
    longitude: 116.3972,
    timezone: 'Asia/Shanghai',
    population: 18_960_744,
    names: ['Beijing', 'Peking', 'Pechino', '北京'],
  },
];

beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), 'shipan-geo-'));
  databasePath = join(directory, 'test.db');

  const database = new DatabaseSync(databasePath);
  database.exec(loadSchema());

  const insertLocation = database.prepare(
    `INSERT INTO locations (id, name_en, name_it, country_code, country_en, country_it,
                            region_en, region_it, latitude, longitude, timezone, population)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertName = database.prepare(
    'INSERT INTO location_names (location_id, search_name) VALUES (?, ?)',
  );

  for (const fixture of FIXTURES) {
    insertLocation.run(
      fixture.id,
      fixture.nameEn,
      fixture.nameIt,
      fixture.countryCode,
      fixture.countryEn,
      fixture.countryIt,
      fixture.regionEn,
      fixture.regionIt,
      fixture.latitude,
      fixture.longitude,
      fixture.timezone,
      fixture.population,
    );
    for (const name of fixture.names) insertName.run(fixture.id, normalizeName(name));
  }

  const insertMeta = database.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)');
  insertMeta.run('source', 'test fixture');
  insertMeta.run('locations', String(FIXTURES.length));
  database.close();
});

afterAll(() => {
  rmSync(directory, { recursive: true, force: true });
});

describe('normalizeName', () => {
  it('strips diacritics and case', () => {
    expect(normalizeName('Zürich')).toBe('zurich');
    expect(normalizeName('MÜNCHEN')).toBe('munchen');
    expect(normalizeName("L'Aquila")).toBe("l'aquila");
  });

  it('collapses whitespace', () => {
    expect(normalizeName('  San   Giovanni  ')).toBe('san giovanni');
  });

  it('unifies typographic apostrophes', () => {
    expect(normalizeName('L’Aquila')).toBe(normalizeName("L'Aquila"));
  });

  it('leaves Chinese characters intact', () => {
    // Nothing to fold: a search for 北京 must reach the row it was indexed on.
    expect(normalizeName('北京')).toBe('北京');
  });
});

describe('searchLocations', () => {
  it('returns every homonym, without choosing for the caller', () => {
    const results = searchLocations('Rome', { databasePath });

    // Two distinct "Rome": disambiguation belongs to whoever consumes it.
    expect(results).toHaveLength(2);
    expect(new Set(results.map((r) => r.countryCode))).toEqual(new Set(['IT', 'US']));
  });

  it('ranks by descending population', () => {
    const results = searchLocations('Rome', { databasePath });

    expect(results[0]?.countryCode).toBe('IT');
    expect(results[0]?.population).toBeGreaterThan(results[1]!.population);
  });

  it('finds a place by exonym', () => {
    expect(searchLocations('Monaco di Baviera', { databasePath })[0]?.id).toBe(2867714);
    expect(searchLocations('Pechino', { databasePath })[0]?.id).toBe(1816670);
    expect(searchLocations('Roma', { databasePath })[0]?.countryCode).toBe('IT');
  });

  it('finds a place by its Chinese name', () => {
    expect(searchLocations('北京', { databasePath })[0]?.id).toBe(1816670);
  });

  it('ignores accents and case in the query', () => {
    expect(searchLocations('München', { databasePath })[0]?.id).toBe(2867714);
    expect(searchLocations('MUNCHEN', { databasePath })[0]?.id).toBe(2867714);
  });

  it('searches by prefix', () => {
    expect(searchLocations('Muni', { databasePath }).map((r) => r.id)).toContain(2867714);
  });

  it('always returns the IANA timezone', () => {
    for (const result of searchLocations('Rome', { databasePath })) {
      expect(result.timezone).toMatch(/^[A-Za-z]+\/[A-Za-z_]+$/);
    }
  });

  it('filters by country', () => {
    const results = searchLocations('Rome', { databasePath, countryCode: 'us' });

    expect(results).toHaveLength(1);
    expect(results[0]?.region).toBe('Georgia');
  });

  it('honours the limit and keeps it within the maximum', () => {
    expect(searchLocations('Rome', { databasePath, limit: 1 })).toHaveLength(1);
    expect(() => searchLocations('Rome', { databasePath, limit: 9999 })).not.toThrow();
  });

  it('treats SQL wildcards as ordinary text', () => {
    // The prefix is matched by range comparison, so "%" is just a character
    // no place name starts with, rather than a pattern matching everything.
    expect(searchLocations('%', { databasePath })).toHaveLength(0);
    expect(searchLocations('_ome', { databasePath })).toHaveLength(0);
  });

  it('rejects an empty query', () => {
    expect(() => searchLocations('   ', { databasePath })).toThrow(GeoError);
  });

  it('reports a missing database explicitly', () => {
    expect(() => searchLocations('Rome', { databasePath: '/tmp/does-not-exist.db' })).toThrow(
      /geo:import/,
    );
  });
});

describe('prefix matching uses the index', () => {
  it('seeks instead of scanning', () => {
    // A regression guard with teeth. `LIKE 'prefix%'` reads identically but
    // cannot use the index under the default collation: it degrades to a
    // scan of every name in the table, measured at 111 ms against 2.9 ms for
    // the seek on the real dataset. That is per keystroke of autocomplete.
    const database = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const plan = database
        .prepare(
          `EXPLAIN QUERY PLAN
           SELECT l.id FROM location_names n JOIN locations l ON l.id = n.location_id
           WHERE n.search_name >= ? AND n.search_name < ?`,
        )
        .all('roma', 'romb') as unknown as { detail: string }[];

      expect(plan.map((step) => step.detail).join(' ')).toContain('idx_location_names_search');
      expect(plan.map((step) => step.detail).join(' ')).not.toContain('SCAN n');
    } finally {
      database.close();
    }
  });

  it('bounds a prefix ending in a non-ASCII character', () => {
    // The upper bound is computed on code points: an accented or Chinese
    // last character must not push the bound below the names it should cover.
    expect(searchLocations('北', { databasePath })[0]?.id).toBe(1816670);
    expect(searchLocations('Mün', { databasePath })[0]?.id).toBe(2867714);
  });
});

describe('errors carry a code, not a sentence', () => {
  it('exposes the code and the parameters of the failure', () => {
    // The surface translates from these; the message is only a fallback.
    try {
      searchLocations('Rome', { databasePath: '/tmp/does-not-exist.db' });
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(GeoError);
      const geoError = error as GeoError;
      expect(geoError.code).toBe('DATABASE_MISSING');
      expect(geoError.messageKey).toBe('geo.error.DATABASE_MISSING');
      expect(geoError.params['path']).toBe('/tmp/does-not-exist.db');
    }
  });

  it('carries no parameter when the failure has none', () => {
    try {
      searchLocations('   ', { databasePath });
      expect.unreachable('should have thrown');
    } catch (error) {
      expect((error as GeoError).code).toBe('EMPTY_QUERY');
      expect((error as GeoError).params).toEqual({});
    }
  });
});

describe('language of the returned names', () => {
  it('uses English by default', () => {
    const [rome] = searchLocations('Roma', { databasePath, countryCode: 'IT' });

    expect(rome?.name).toBe('Rome');
    expect(rome?.country).toBe('Italy');
    expect(rome?.region).toBe('Lazio');
  });

  it('returns the Italian names with lang: it', () => {
    const [rome] = searchLocations('Rome', { databasePath, countryCode: 'IT', lang: 'it' });

    expect(rome?.name).toBe('Roma');
    expect(rome?.country).toBe('Italia');
  });

  it('translates foreign places too', () => {
    const [munich] = searchLocations('Munich', { databasePath, lang: 'it' });

    expect(munich?.name).toBe('Monaco di Baviera');
    expect(munich?.region).toBe('Baviera');
    expect(munich?.country).toBe('Germania');
  });

  it('falls back to the international name when no Italian variant exists', () => {
    // Most towns have no exonym: an empty field would be worse than the
    // international name.
    const [romeUs] = searchLocations('Rome', { databasePath, countryCode: 'US', lang: 'it' });

    expect(romeUs?.name).toBe('Rome');
    expect(romeUs?.country).toBe('Stati Uniti');
  });

  it('searches across every language regardless of lang', () => {
    // One must be able to type "Munich" and receive "Monaco di Baviera".
    expect(searchLocations('Munich', { databasePath, lang: 'it' })[0]?.name).toBe(
      'Monaco di Baviera',
    );
    expect(searchLocations('Monaco di Baviera', { databasePath, lang: 'en' })[0]?.name).toBe(
      'Munich',
    );
  });
});

describe('getLocation', () => {
  it('returns the place from its GeoNames identifier', () => {
    const location = getLocation(3169070, { databasePath });

    expect(location?.name).toBe('Rome');
    expect(location?.timezone).toBe('Europe/Rome');
  });

  it('honours the requested language', () => {
    expect(getLocation(3169070, { databasePath, lang: 'it' })?.name).toBe('Roma');
  });

  it('returns undefined for an unknown identifier', () => {
    expect(getLocation(1, { databasePath })).toBeUndefined();
  });
});

describe('databaseInfo', () => {
  it('exposes the import metadata', () => {
    expect(databaseInfo({ databasePath })['locations']).toBe(String(FIXTURES.length));
  });
});
