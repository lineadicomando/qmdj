#!/usr/bin/env node
/**
 * Builds a four-place location database, for running the tests without the
 * GeoNames dataset.
 *
 * The real import downloads ~215 MB and produces a database of ~90 MB;
 * continuous integration does neither. What the tests across the workspaces
 * actually reach for is small and stable — the two Romes that prove a search
 * chooses nothing, the Munich that proves the Italian exonym answers, the
 * Beijing the charts are cast for — so those four places, with their real
 * GeoNames identifiers, are enough to run every suite.
 *
 * It refuses to touch an existing database: the file it would replace might
 * be the imported dataset, and a fixture wearing its path would turn every
 * search into four answers with nothing to say why. The metadata row names
 * this database a fixture, and `databaseInfo` shows it.
 */
import { readFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const packageRoot = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const databasePath =
  process.argv[2] ?? process.env.GEONAMES_DB_PATH ?? join(packageRoot, 'data', 'geonames.db');

// The same normalization the import applies; a name searched must be stored
// the way `search.ts` will look for it.
function normalizeName(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc\u0060]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const PLACES = [
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

const exists = await stat(databasePath).then(
  (info) => info.isFile() && info.size > 0,
  () => false,
);
if (exists) {
  console.error(
    `${databasePath} already exists and will not be replaced.\n` +
      'If it is the imported dataset, there is nothing to do; if a fixture is\n' +
      'really wanted in its place, remove the file first.',
  );
  process.exit(1);
}

await mkdir(dirname(databasePath), { recursive: true });
const database = new DatabaseSync(databasePath);
database.exec((await readFile(join(packageRoot, 'schema.sql'), 'utf8')).trim());

const insertLocation = database.prepare(
  `INSERT INTO locations (id, name_en, name_it, country_code, country_en, country_it,
                          region_en, region_it, latitude, longitude, timezone, population)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);
const insertName = database.prepare(
  'INSERT INTO location_names (location_id, search_name) VALUES (?, ?)',
);

for (const place of PLACES) {
  insertLocation.run(
    place.id,
    place.nameEn,
    place.nameIt,
    place.countryCode,
    place.countryEn,
    place.countryIt,
    place.regionEn,
    place.regionIt,
    place.latitude,
    place.longitude,
    place.timezone,
    place.population,
  );
  for (const name of place.names) insertName.run(place.id, normalizeName(name));
}

const insertMeta = database.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)');
insertMeta.run('source', 'fixture (four places, not the GeoNames dataset)');
insertMeta.run('imported_at', new Date().toISOString());
insertMeta.run('locations', String(PLACES.length));

database.close();
console.log(`Fixture database written to ${databasePath}: ${PLACES.length} places.`);
