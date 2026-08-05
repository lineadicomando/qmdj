#!/usr/bin/env node
/**
 * Builds the local location database from the GeoNames dumps.
 *
 * Sources (CC BY 4.0, https://www.geonames.org/):
 *   cities500.zip         places with more than 500 inhabitants (~13 MB compressed)
 *   admin1CodesASCII.txt  first-level subdivisions
 *   countryInfo.txt       countries
 *   alternateNames.zip    translated names, every language (~200 MB compressed)
 *
 * `cities500` and not `allCountries`: the larger dump reaches every hamlet on
 * Earth, at the price of five million rows and a database above a gigabyte.
 * Someone born in a place below five hundred inhabitants has to enter
 * coordinates and timezone by hand — the API accepts them in place of an
 * identifier — which is the trade this project has chosen.
 *
 * Only Italian is extracted from `alternateNames`, and this is not an
 * oversight: GeoNames already stores the international exonym in the primary
 * `name` column — "Rome", "Munich", "Naples" — which is exactly what the
 * English locale wants. English therefore costs nothing, and the expensive
 * streaming pass exists solely for the second language.
 *
 * That file is large and exceeds a gigabyte uncompressed: it is read as a
 * stream and filtered, never loaded into memory. It covers cities, regions
 * and countries, so a single source resolves all three levels of the
 * displayed name.
 *
 * The resulting database is NOT versioned: it is a regenerable artefact.
 */
import { createReadStream } from 'node:fs';
import { mkdir, open, readFile, rm, stat } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { createInflateRaw, inflateRawSync } from 'node:zlib';

const BASE_URL = process.env.GEONAMES_BASE_URL ?? 'https://download.geonames.org/export/dump/';

/**
 * The language of the translations to import.
 *
 * English is absent on purpose: it is already the primary name in the dataset.
 */
const LANG = 'it';

const packageRoot = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const dataDir = join(packageRoot, 'data');
const cacheDir = join(dataDir, 'cache');
const databasePath = process.env.GEONAMES_DB_PATH ?? join(dataDir, 'geonames.db');

/** Column indices of cities500.txt, per the GeoNames layout. */
const CITY = {
  id: 0,
  name: 1,
  asciiName: 2,
  alternateNames: 3,
  latitude: 4,
  longitude: 5,
  countryCode: 8,
  admin1: 10,
  population: 14,
  timezone: 17,
};

/** Column indices of alternateNames.txt. */
const ALT = {
  geonameId: 1,
  language: 2,
  name: 3,
  isPreferred: 4,
  isShort: 5,
  isColloquial: 6,
  isHistoric: 7,
};

function normalizeName(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc\u0060]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Administrative qualifiers to strip from the Italian names of subdivisions.
 *
 * GeoNames reports the official denomination ("Regione Emilia-Romagna",
 * "Cantone di Zurigo"), correct but verbose in a picker, where the row
 * already reads "City, Region, Country". Only the toponym is kept, which is
 * what a person recognises.
 */
const ADMIN_QUALIFIER =
  /^(?:Regione(?:\s+autonoma)?|Provincia(?:\s+autonoma)?\s+di|Provincia|Città\s+metropolitana\s+di|Città-Stato\s+di|Cantone\s+di|Canton|Stato\s+(?:federato\s+)?di|Land|Contea\s+di|Distretto\s+di|Dipartimento\s+di|Comunità\s+autonoma\s+(?:di|del|della))\s+/i;

function stripAdminQualifier(name) {
  if (!name) return name;
  const stripped = name.replace(ADMIN_QUALIFIER, '').trim();
  // If nothing is left, the qualifier *was* the name: keep the original.
  return stripped.length > 0 ? stripped : name;
}

function mb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function count(value) {
  return value.toLocaleString('en');
}

/** Downloads to the cache as a stream: large files never pass through memory. */
async function fetchCached(fileName) {
  const cached = join(cacheDir, fileName);
  try {
    const info = await stat(cached);
    if (info.size > 0) {
      console.log(`  ${fileName.padEnd(22)} cached (${mb(info.size)})`);
      return cached;
    }
  } catch {
    // not cached: download it
  }

  process.stdout.write(`  ${fileName.padEnd(22)} downloading ... `);
  const response = await fetch(`${BASE_URL}${fileName}`);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${BASE_URL}${fileName}`);
  if (!response.body) throw new Error(`empty response body for ${fileName}`);

  const handle = await open(cached, 'w');
  try {
    await pipeline(Readable.fromWeb(response.body), handle.createWriteStream());
  } finally {
    await handle.close();
  }
  console.log(`ok (${mb((await stat(cached)).size)})`);
  return cached;
}

/**
 * Enumerates the entries of a ZIP archive by reading its central directory.
 *
 * Returns the offset and length of the compressed data rather than the
 * contents: large archives have to be inflated as a stream. The central
 * directory sits at the end of the file and carries the real sizes — the
 * fields of the local header may be zeroed in archives written as a stream.
 *
 * The enumeration is necessary, not a luxury: alternateNames.zip contains two
 * files, and the first is not the one needed.
 */
async function listZipEntries(path) {
  const size = (await stat(path)).size;
  const tailLength = Math.min(size, 65_557);
  const handle = await open(path, 'r');

  try {
    const tail = Buffer.alloc(tailLength);
    await handle.read(tail, 0, tailLength, size - tailLength);

    let eocd = -1;
    for (let i = tail.length - 22; i >= 0; i -= 1) {
      if (tail.readUInt32LE(i) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    if (eocd === -1) throw new Error('Invalid ZIP archive: no end-of-directory record.');

    const entryCount = tail.readUInt16LE(eocd + 10);
    const centralSize = tail.readUInt32LE(eocd + 12);
    const centralOffset = tail.readUInt32LE(eocd + 16);
    if (centralOffset === 0xffffffff || centralSize === 0xffffffff) {
      throw new Error('ZIP64 archives are not supported.');
    }

    const central = Buffer.alloc(centralSize);
    await handle.read(central, 0, centralSize, centralOffset);

    const entries = [];
    let cursor = 0;
    for (let i = 0; i < entryCount; i += 1) {
      if (central.readUInt32LE(cursor) !== 0x02014b50) {
        throw new Error('Invalid ZIP archive: malformed central directory entry.');
      }
      const nameLength = central.readUInt16LE(cursor + 28);
      const extraLength = central.readUInt16LE(cursor + 30);
      const commentLength = central.readUInt16LE(cursor + 32);

      entries.push({
        name: central.toString('utf8', cursor + 46, cursor + 46 + nameLength),
        method: central.readUInt16LE(cursor + 10),
        compressedSize: central.readUInt32LE(cursor + 20),
        localOffset: central.readUInt32LE(cursor + 42),
      });

      cursor += 46 + nameLength + extraLength + commentLength;
    }
    return entries;
  } finally {
    await handle.close();
  }
}

/**
 * Locates an entry by name, with the exact extent of its compressed data.
 *
 * The local header has to be reread because its variable-length fields may
 * differ in size from those recorded in the central directory.
 */
async function locateZipEntry(path, entryName) {
  const entries = await listZipEntries(path);
  const entry = entries.find((candidate) => candidate.name === entryName);
  if (!entry) {
    throw new Error(
      `Entry "${entryName}" not found in ${path}. Present: ${entries.map((e) => e.name).join(', ')}`,
    );
  }
  if (entry.method !== 0 && entry.method !== 8) {
    throw new Error(`ZIP compression method ${entry.method} is not supported.`);
  }

  const handle = await open(path, 'r');
  try {
    const local = Buffer.alloc(30);
    await handle.read(local, 0, 30, entry.localOffset);
    if (local.readUInt32LE(0) !== 0x04034b50) {
      throw new Error('Invalid ZIP archive: no local header.');
    }
    const start = entry.localOffset + 30 + local.readUInt16LE(26) + local.readUInt16LE(28);
    return { ...entry, start, end: start + entry.compressedSize - 1 };
  } finally {
    await handle.close();
  }
}

/** Reads a ZIP entry line by line, without ever buffering it. */
async function* zipEntryLines(path, entryName) {
  const entry = await locateZipEntry(path, entryName);

  // The stream is bounded to the exact extent of the compressed data, so the
  // inflater meets neither the data descriptor nor the trailing directory.
  const raw = createReadStream(path, { start: entry.start, end: entry.end });
  const source = entry.method === 8 ? raw.pipe(createInflateRaw()) : raw;

  for await (const line of createInterface({ input: source, crlfDelay: Infinity })) {
    yield line;
  }
}

/** Reads a whole entry into memory. For small files only. */
async function readWholeZipEntry(path, entryName) {
  const entry = await locateZipEntry(path, entryName);
  const handle = await open(path, 'r');
  try {
    const compressed = Buffer.alloc(entry.end - entry.start + 1);
    await handle.read(compressed, 0, compressed.length, entry.start);
    const content = entry.method === 8 ? inflateRawSync(compressed) : compressed;
    return { name: entry.name, content };
  } finally {
    await handle.close();
  }
}

function parseCountries(text) {
  const byCode = new Map();
  for (const line of text.split('\n')) {
    if (line.startsWith('#') || line.trim() === '') continue;
    const f = line.split('\t');
    // 0: ISO code, 4: English name, 16: geonameid of the country
    if (f[0] && f[4]) byCode.set(f[0], { name: f[4], geonameId: Number(f[16]) || 0 });
  }
  return byCode;
}

function parseAdmin1(text) {
  const byKey = new Map();
  for (const line of text.split('\n')) {
    if (line.trim() === '') continue;
    const f = line.split('\t');
    // 0: key "IT.07", 1: name, 3: geonameid of the subdivision
    if (f[0] && f[1]) byKey.set(f[0], { name: f[1], geonameId: Number(f[3]) || 0 });
  }
  return byKey;
}

/**
 * Extracts the Italian names of the requested identifiers.
 *
 * Among several variants the one marked `isPreferredName` wins; on a tie the
 * first is kept. Colloquial and historic forms are discarded — correct, but
 * unsuited to a picker ("Urbe" for Rome).
 */
async function collectTranslations(path, wantedIds) {
  const names = new Map();
  const preferred = new Set();
  let scanned = 0;

  for await (const line of zipEntryLines(path, 'alternateNames.txt')) {
    scanned += 1;
    if (scanned % 2_000_000 === 0) {
      process.stdout.write(`\r  translations ... ${(scanned / 1e6).toFixed(0)}M lines scanned`);
    }

    // Filter on the language before splitting: it is the most selective
    // condition, and it saves splitting more than sixteen million lines.
    if (!line.includes(`\t${LANG}\t`)) continue;

    const f = line.split('\t');
    if (f[ALT.language] !== LANG) continue;

    const id = Number(f[ALT.geonameId]);
    if (!wantedIds.has(id)) continue;
    if (f[ALT.isColloquial] === '1' || f[ALT.isHistoric] === '1') continue;

    const name = f[ALT.name];
    if (!name) continue;

    const isPreferred = f[ALT.isPreferred] === '1';
    if (isPreferred) {
      names.set(id, name);
      preferred.add(id);
    } else if (!preferred.has(id) && !names.has(id)) {
      names.set(id, name);
    }
  }

  process.stdout.write(
    `\r  translations ... ${(scanned / 1e6).toFixed(1)}M lines scanned, ${count(names.size)} Italian names\n`,
  );
  return names;
}

async function main() {
  await mkdir(cacheDir, { recursive: true });
  console.log(`GeoNames dataset → ${databasePath}\n`);

  const citiesPath = await fetchCached('cities500.zip');
  const admin1Path = await fetchCached('admin1CodesASCII.txt');
  const countryPath = await fetchCached('countryInfo.txt');
  const alternatePath = await fetchCached('alternateNames.zip');

  const countries = parseCountries(await readFile(countryPath, 'utf8'));
  const admin1 = parseAdmin1(await readFile(admin1Path, 'utf8'));

  process.stdout.write('\n  extracting cities500.zip ... ');
  const cities = await readWholeZipEntry(citiesPath, 'cities500.txt');
  console.log(`ok (${cities.name}, ${mb(cities.content.length)})`);

  // First pass: collect the cities and every identifier to translate.
  const rows = [];
  const wantedIds = new Set();
  for (const line of cities.content.toString('utf8').split('\n')) {
    if (line.trim() === '') continue;
    const f = line.split('\t');

    const id = Number(f[CITY.id]);
    const name = f[CITY.name];
    const countryCode = f[CITY.countryCode];
    const timezone = f[CITY.timezone];
    // Without a timezone the place cannot be used to compute anything: local
    // time could not be converted to Universal Time, and no pillar would hold.
    if (!Number.isFinite(id) || !name || !countryCode || !timezone) continue;

    rows.push({
      id,
      name,
      countryCode,
      timezone,
      admin1Key: `${countryCode}.${f[CITY.admin1] ?? ''}`,
      latitude: Number(f[CITY.latitude]),
      longitude: Number(f[CITY.longitude]),
      population: Number(f[CITY.population]) || 0,
      variants: [name, f[CITY.asciiName] ?? '', ...(f[CITY.alternateNames] ?? '').split(',')],
    });
    wantedIds.add(id);
  }
  for (const country of countries.values()) if (country.geonameId) wantedIds.add(country.geonameId);
  for (const region of admin1.values()) if (region.geonameId) wantedIds.add(region.geonameId);

  console.log(
    `  ${count(rows.length)} places, ${count(wantedIds.size)} identifiers to translate\n`,
  );

  const italian = await collectTranslations(alternatePath, wantedIds);

  await rm(databasePath, { force: true });
  await rm(`${databasePath}-wal`, { force: true });
  await rm(`${databasePath}-shm`, { force: true });
  const database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    ${(await readFile(join(packageRoot, 'schema.sql'), 'utf8')).trim()}
  `);

  const insertLocation = database.prepare(
    `INSERT INTO locations (id, name_en, name_it, country_code, country_en, country_it,
                            region_en, region_it, latitude, longitude, timezone, population)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertName = database.prepare(
    'INSERT INTO location_names (location_id, search_name) VALUES (?, ?)',
  );

  process.stdout.write('  writing the database ... ');
  database.exec('BEGIN');

  let nameRows = 0;
  let translatedCities = 0;
  for (const row of rows) {
    const country = countries.get(row.countryCode);
    const region = admin1.get(row.admin1Key);
    const nameIt = italian.get(row.id) ?? null;
    if (nameIt) translatedCities += 1;

    insertLocation.run(
      row.id,
      row.name,
      nameIt,
      row.countryCode,
      country?.name ?? row.countryCode,
      (country?.geonameId && italian.get(country.geonameId)) || null,
      region?.name ?? null,
      stripAdminQualifier((region?.geonameId && italian.get(region.geonameId)) || null),
      row.latitude,
      row.longitude,
      row.timezone,
      row.population,
    );

    // Every known name is searchable, the Italian variant included: one must
    // be able to search both "Munich" and "Monaco di Baviera".
    const variants = new Set(row.variants);
    if (nameIt) variants.add(nameIt);
    for (const variant of variants) {
      const normalized = normalizeName(variant);
      if (normalized.length === 0 || normalized.length > 120) continue;
      insertName.run(row.id, normalized);
      nameRows += 1;
    }
  }

  const insertMeta = database.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)');
  insertMeta.run('source', 'GeoNames cities500 + alternateNames (CC BY 4.0)');
  insertMeta.run('imported_at', new Date().toISOString());
  insertMeta.run('locations', String(rows.length));
  insertMeta.run('search_names', String(nameRows));
  insertMeta.run('translated_it', String(translatedCities));

  database.exec('COMMIT');
  database.exec('ANALYZE');

  // WAL only serves to write fast here: after the import the database never
  // changes. Leaving it in WAL mode would make it unopenable from a read-only
  // mount — SQLite must be able to create the `-shm` file even to read —
  // which is exactly the container case.
  database.exec('PRAGMA journal_mode = DELETE;');
  database.close();

  const info = await stat(databasePath);
  console.log('ok\n');
  console.log(`  places:            ${count(rows.length)}`);
  console.log(`  with Italian name: ${count(translatedCities)}`);
  console.log(`  searchable names:  ${count(nameRows)}`);
  console.log(`  database:          ${mb(info.size)}`);
  console.log(`\nDone. Source cache in ${cacheDir} (removable, ~215 MB).`);
}

try {
  await main();
} catch (error) {
  console.error(`\nImport failed: ${error.message}`);
  process.exitCode = 1;
}
