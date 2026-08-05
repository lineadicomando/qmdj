#!/usr/bin/env node
/**
 * Downloads the Swiss Ephemeris data files needed for `swisseph` mode.
 *
 * The files are NOT versioned (see .gitignore): they are a few megabytes of
 * binary data redistributed by Astrodienst. Without them the engine falls
 * back to the Moshier ephemeris, which needs no external file.
 *
 * Coverage of the downloaded files: 1800-2399 CE. For a wider range see the
 * `ephe/` directory of the official repository.
 */
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';

// Official Swiss Ephemeris repository (Astrodienst). The old path
// www.astro.com/ftp/swisseph/ephe/ returns 404.
const BASE_URL =
  process.env.SE_EPHE_BASE_URL ?? 'https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/';

const FILES = [
  { name: 'sepl_18.se1', description: 'main planets, 1800-2399', required: true },
  { name: 'semo_18.se1', description: 'Moon, 1800-2399', required: true },
];

const packageRoot = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const targetDir = process.env.SE_EPHE_PATH ?? join(packageRoot, 'ephe');

async function alreadyPresent(path) {
  try {
    const info = await stat(path);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

async function download(file) {
  const target = join(targetDir, file.name);

  if (await alreadyPresent(target)) {
    console.log(`  ${file.name.padEnd(14)} already present, skipping`);
    return true;
  }

  const url = `${BASE_URL}${file.name}`;
  process.stdout.write(`  ${file.name.padEnd(14)} downloading from ${url} ... `);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`FAILED (HTTP ${response.status})`);
      return false;
    }
    if (!response.body) {
      console.log('FAILED (empty response body)');
      return false;
    }
    await pipeline(Readable.fromWeb(response.body), createWriteStream(target));
    const info = await stat(target);
    console.log(`ok (${(info.size / 1024 / 1024).toFixed(1)} MB)`);
    return true;
  } catch (error) {
    console.log(`FAILED (${error.message})`);
    return false;
  }
}

await mkdir(targetDir, { recursive: true });
console.log(`Swiss Ephemeris data → ${targetDir}\n`);

let missingRequired = false;
for (const file of FILES) {
  const ok = await download(file);
  if (!ok && file.required) missingRequired = true;
}

console.log('');
if (missingRequired) {
  console.error(
    'Some required files were not downloaded. The engine will use the Moshier\n' +
      'ephemeris: it still works, at slightly lower precision.',
  );
  process.exitCode = 1;
} else {
  console.log('Done. The engine will use the Swiss Ephemeris files.');
}
