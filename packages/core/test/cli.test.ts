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

  it('says which method it used', async () => {
    await run(['chart', ...MOMENT, '--lang', 'en']);

    expect(out).toContain('chaibu');
  });

  it('casts by the method it is asked for', async () => {
    // The same instant under the two methods: the readings differ, and the
    // zhirun chart says which term its ju was taken from.
    await run(['chart', ...MOMENT, '--method', 'zhirun', '--lang', 'en']);

    expect(out).toContain('zhirun');
    expect(out).not.toContain('chaibu');
  });

  it('refuses a method it has never heard of', async () => {
    const code = await run(['chart', ...MOMENT, '--method', 'zhirn', '--lang', 'en']);

    expect(code).toBe(2);
    expect(err).toContain('zhirn');
  });

  it('reads the yuan from the futou when asked, and says it did', async () => {
    // 1999-01-06 stands in the middle of a futou stretch and in the first
    // five days of Xiaohan, so the two readings part company.
    const at = ['--date', '1999-01-06', '--time', '12:00', '--tz', 'Asia/Shanghai',
                '--no-true-solar', '--lang', 'en'];

    await run(['chart', ...at]);
    expect(out).toContain('upper yuan');

    out = '';
    await run(['chart', ...at, '--yuan', 'futou']);
    expect(out).toContain('middle yuan');
    expect(out).toContain('futou cycle');
  });

  it('says nothing about the futou when it was not asked for', async () => {
    await run(['chart', ...MOMENT, '--lang', 'en']);

    expect(out).not.toContain('futou');
  });

  it('refuses a yuan it has never heard of', async () => {
    const code = await run(['chart', ...MOMENT, '--yuan', 'futuo', '--lang', 'en']);

    expect(code).toBe(2);
    expect(err).toContain('futuo');
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

describe('scan', () => {
  const INTERVAL = [
    'scan',
    '--date', '2026-09-01',
    '--until', '2026-09-02',
    '--tz', 'Asia/Shanghai',
    '--lon', '116.4',
    '--no-true-solar',
    '--day-boundary', 'midnight',
    // Stated, as everywhere else here: the environment's locale is not the
    // test's, and a suite that reads differently on another machine is not a
    // suite.
    '--lang', 'en',
  ];

  it('walks the interval and names the palace of every line', async () => {
    expect(await run([...INTERVAL, '--gate', 'kaimen'])).toBe(0);

    expect(out).toContain('2026-09-01');
    expect(out).toContain('2026-09-02');
    // The word for the gate, the name beside it, and where to face.
    expect(out).toContain('Open');
    expect(out).toMatch(/\d southeast 巽|\d north 坎|\d west 兌/);
  });

  it('opens the interval at midnight, not at the hour it was typed', async () => {
    expect(await run(INTERVAL)).toBe(0);
    expect(out).toContain('2026-09-01 00:00');
  });

  it('scans the day `--until` names whole, not up to where it begins', async () => {
    // Two days named are all of them: the evening of the second must be in
    // the answer, and nothing may open on the day after. Its midnight still
    // appears once, as the close of the last run.
    expect(await run(INTERVAL)).toBe(0);
    expect(out).toContain('2026-09-02 23:00');
    expect(out.split('2026-09-03').length - 1).toBe(1);
  });

  it('accepts the spirits of a yin chart, not one plate of them', async () => {
    // baihu stands only in a yin chart; September charts are yin, so the
    // question is answerable — and a list built from the yang plate alone
    // would refuse it as a typo.
    expect(await run([...INTERVAL, '--spirit', 'baihu'])).toBe(0);
    expect(err).toBe('');
    expect(out).toContain('White Tiger');
  });

  it('narrows as more is asked of it, and never widens', async () => {
    await run([...INTERVAL, '--gate', 'kaimen']);
    const loose = out.split('\n').length;

    out = '';
    await run([...INTERVAL, '--gate', 'kaimen', '--towards', 'se,s']);
    expect(out.split('\n').length).toBeLessThan(loose);
  });

  it('says that nothing answered rather than printing an empty table', async () => {
    expect(await run([...INTERVAL, '--gate', 'kaimen', '--star', 'tianpeng', '--spirit', 'zhifu'])).toBe(0);
    // Either something did answer, or it said so in words.
    if (!out.includes('Open')) expect(out).toContain('No palace');
  });

  it('expands an errand into a gate and says which', async () => {
    expect(await run([...INTERVAL, '--for', 'wealth'])).toBe(0);

    // Said out loud: a shorthand that worked silently would leave the reader
    // unable to check it or to vary it.
    expect(out).toMatch(/Money.*→.*Life 生門/);
    expect(out).toContain('Life');
  });

  it('answers an errand exactly as the gate it stands for', async () => {
    // Compared as data. The printed forms differ by one line — the errand
    // says what it expanded into — and that line is the point of it.
    await run([...INTERVAL, '--for', 'wealth', '--json']);
    const errand = out;

    out = '';
    await run([...INTERVAL, '--gate', 'shengmen', '--json']);
    expect(JSON.parse(out)).toEqual(JSON.parse(errand));
  });

  it('refuses an errand and a gate that name different things', async () => {
    expect(await run([...INTERVAL, '--for', 'wealth', '--gate', 'kaimen'])).toBe(2);

    expect(err).toContain('--for');
    expect(err).toContain('--gate');
    expect(out).toBe('');
  });

  it('takes an errand and the gate it stands for together, being the same thing', async () => {
    expect(await run([...INTERVAL, '--for', 'wealth', '--gate', 'shengmen'])).toBe(0);
  });

  it('refuses an interval with no end', async () => {
    expect(await run(['scan', '--date', '2026-09-01'])).toBe(2);
    expect(err).toContain('--until');
  });

  it('refuses a value the engine has no identifier for', async () => {
    // Left unchecked it would match nothing, which reads exactly like an
    // arrangement that never occurred.
    expect(await run([...INTERVAL, '--gate', 'kaimen1'])).toBe(2);
    expect(err).toContain('kaimen1');
    expect(out).toBe('');
  });

  it('carries no verdict about any hour it reports', async () => {
    await run(INTERVAL);

    for (const word of ['lucky', 'favourable', 'auspicious', 'best', 'avoid']) {
      expect(out.toLowerCase()).not.toContain(word);
    }
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

  it('renders a mistake in the call rather than throwing it at the reader', async () => {
    expect(await run(['bazi', '--date', '1990-01-01', '--gender', 'neither'])).toBe(2);

    expect(err).toContain('--gender');
    expect(err).not.toContain('at ');
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
