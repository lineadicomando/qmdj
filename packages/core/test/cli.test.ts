import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { run } from '../src/cli.js';

/**
 * The CLI is a surface, so it is tested as one: what it writes, what it
 * returns, and whether it translates. The calculations underneath have their
 * own tests and are not repeated here.
 */
let out: string;
let err: string;
let writeOut: typeof process.stdout.write;
let writeErr: typeof process.stderr.write;

beforeEach(() => {
  out = '';
  err = '';
  writeOut = process.stdout.write.bind(process.stdout);
  writeErr = process.stderr.write.bind(process.stderr);
  process.stdout.write = ((chunk: string) => {
    out += chunk;
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string) => {
    err += chunk;
    return true;
  }) as typeof process.stderr.write;
});

afterEach(() => {
  process.stdout.write = writeOut;
  process.stderr.write = writeErr;
});

/** Fixed input, so that nothing here depends on the day it runs. */
const MOMENT = [
  '--date', '2024-06-15',
  '--time', '14:00',
  '--tz', 'Asia/Shanghai',
  '--lon', '116.4',
  '--no-true-solar',
  '--day-boundary', 'midnight',
];

describe('chart', () => {
  it('prints the ju, the chief and the nine palaces', async () => {
    expect(await run(['chart', ...MOMENT, '--lang', 'en'])).toBe(0);

    expect(out).toContain('yang dun 9');
    // Nine palaces, each named in the reader's language and each still
    // carrying its trigram.
    for (const direction of ['north', 'southwest', 'east', 'southeast', 'centre']) {
      expect(out).toContain(direction);
    }
    for (const trigram of ['坎', '坤', '震', '巽', '中', '乾', '兌', '艮', '離']) {
      expect(out).toContain(trigram);
    }
  });

  it('says which method it used, and that it does not interpret', async () => {
    await run(['chart', ...MOMENT, '--lang', 'en']);

    expect(out).toContain('chaibu');
    expect(out.toLowerCase()).toContain('what they mean');
  });
});

describe('bazi', () => {
  it('prints the pillars read out', async () => {
    expect(await run(['bazi', ...MOMENT, '--gender', 'male', '--lang', 'en'])).toBe(0);

    expect(out).toContain('day master');
    expect(out).toContain('Luck cycles');
  });

  it('leaves the cycles out without a gender, and says why', async () => {
    await run(['bazi', ...MOMENT, '--lang', 'en']);

    expect(out).not.toContain('Luck cycles');
    expect(out).toContain('--gender');
  });
});

describe('terms and calendar', () => {
  it('prints twenty-four terms', async () => {
    expect(await run(['terms', '--year', '2024', '--tz', 'Asia/Shanghai', '--lang', 'en'])).toBe(0);

    expect(out).toContain('立春');
    expect(out.trim().split('\n')).toHaveLength(25); // heading plus 24
  });

  it('prints a leap lunar month as one', async () => {
    await run(['calendar', '--date', '2023-04-01', '--tz', 'Asia/Shanghai', '--lang', 'en']);

    expect(out).toContain('leap month 2/11');
  });
});

describe('--json', () => {
  it('emits the data untranslated', async () => {
    expect(await run(['chart', ...MOMENT, '--json'])).toBe(0);

    const chart = JSON.parse(out);
    // Identifiers and hanzi, no glosses: the shape a program consumes.
    expect(chart.ju).toMatchObject({ yang: true, number: 9, yuan: 'xia' });
    expect(chart.palaces).toHaveLength(9);
    expect(chart.palaces[0].palace.id).toBe('kan');
    expect(out).not.toContain('yang dun');
  });

  it('carries the options that produced it', async () => {
    await run(['chart', ...MOMENT, '--json']);

    expect(JSON.parse(out).options).toMatchObject({
      method: 'chaibu',
      trueSolarTime: false,
      dayBoundary: 'midnight',
    });
  });

  it('leaves the longitude correction at zero when given only a zone', async () => {
    // The fallback meridian must be read from the offset at the chart's
    // moment, not from today's clock: whichever season this runs in, one of
    // the two dates would otherwise carry a spurious hour of correction.
    for (const date of ['2024-01-15', '2024-07-15']) {
      out = '';
      await run(['chart', '--date', date, '--time', '10:00', '--tz', 'Europe/Rome', '--json']);

      expect(JSON.parse(out).moment.solar.longitudeMinutes).toBe(0);
    }
  });
});

describe('the locale', () => {
  it('follows --lang', async () => {
    await run(['chart', ...MOMENT, '--lang', 'it']);
    const italian = out;
    out = '';
    await run(['chart', ...MOMENT, '--lang', 'en']);

    expect(italian).toContain('Nove palazzi');
    expect(out).toContain('Nine palaces');
    // The hanzi are the same in both: they are the names, not a translation.
    expect(italian).toContain('休門');
    expect(out).toContain('休門');
  });

  it('leads with the word and keeps the name beside it', async () => {
    await run(['chart', ...MOMENT, '--lang', 'en']);

    // The word comes first, because most readers cannot read the other; the
    // hanzi stays, because without it nothing here can be checked against a
    // book or a second implementation.
    expect(out).toMatch(/Rest 休門/);
    expect(out).toMatch(/Canopy 天蓬/);
  });
});

describe('failing', () => {
  it('reports an unknown command and asks for nothing', async () => {
    expect(await run(['horoscope'])).toBe(2);
    expect(err).toContain('horoscope');
    expect(out).toBe('');
  });

  it('reports an unknown option', async () => {
    expect(await run(['chart', '--rising-sign'])).toBe(2);
    expect(err).toContain('--rising-sign');
  });

  it('reports a domain error in the requested locale', async () => {
    expect(await run(['chart', '--date', '15/06/2024', '--lang', 'it'])).toBe(1);

    expect(err).toContain('non è valida');
    expect(out).toBe('');
  });

  it('prints help and stops when asked', async () => {
    expect(await run(['--help'])).toBe(0);
    expect(out).toContain('qimen chart');
  });

  it('prints help and fails when given nothing', async () => {
    expect(await run([])).toBe(2);
  });
});
