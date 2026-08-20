import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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

  it("prints the almanac's officer beside the pillars", async () => {
    // 曆注, a line and not a section: the page dunjia was read against, with
    // its own ganzhi because it turns on 120°E and not on the chart's zone.
    await run(['chart', ...MOMENT, '--lang', 'en']);

    expect(out).toContain('Day officer');
    expect(out).toContain('定 dìng settle');
    expect(out).toContain('庚戌');
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

  it('refuses a day boundary it has never heard of', async () => {
    // Strict like the other two, and for a sharper reason: nothing printed
    // says which boundary was read, so a fallback would move the day pillar
    // of the 23:00 hour with nothing on the page to show for it.
    const code = await run(['chart', ...MOMENT, '--day-boundary', 'midnght', '--lang', 'en']);

    expect(code).toBe(2);
    expect(err).toContain('midnght');
  });

  it('refuses a yuan it has never heard of', async () => {
    const code = await run(['chart', ...MOMENT, '--yuan', 'futuo', '--lang', 'en']);

    expect(code).toBe(2);
    expect(err).toContain('futuo');
  });
});

describe('taiyi', () => {
  it('lays the board of a year and takes no place and no hour', async () => {
    expect(await run(['taiyi', '--year', '724', '--lang', 'en'])).toBe(0);

    // 開元十二年甲子, the year the whole epoch is anchored on, and the four
    // things 《太乙金鏡式經》 states about it in its own words.
    expect(out).toContain('甲子');
    expect(out).toContain('乾 qián');
    expect(out).toContain('開門');
    expect(out).toContain('黃始宮');
  });

  it('says on the page that its palaces are not a chart\u2019s', async () => {
    expect(await run(['taiyi', '--year', '2026', '--lang', 'en'])).toBe(0);

    expect(out).toContain('one seat from the Luoshu');
    expect(out).toContain('no independent implementation');
  });

  it('never says which party is host and which is guest', async () => {
    expect(await run(['taiyi', '--year', '2026', '--lang', 'en'])).toBe(0);

    // Both counts are printed and neither is preferred: naming the parties is
    // the reader's first act, for the reason choosing a 用神 is.
    expect(out).toContain('the host\u2019s count');
    expect(out).toContain('the guest\u2019s count');
    expect(out).not.toMatch(/favou?rs|advantage|wins/i);
  });

  it('refuses an epoch and a boundary it has not read', async () => {
    expect(await run(['taiyi', '--year', 'MMXXVI', '--lang', 'en'])).toBe(2);
    expect(err).toContain('--year');

    // A declared value that is not implemented is the engine refusing, not
    // the caller mistyping: it comes back as a ChartError and says so.
    expect(await run(['taiyi', '--year-boundary', 'dongzhi', '--lang', 'en'])).toBe(1);
    expect(err).toContain('not implemented');
    expect(await run(['taiyi', '--year-boundary', 'qiufen', '--lang', 'en'])).toBe(2);

    // 春節 passed validation and was answered by the 立春 rule, on a board that
    // then recorded the boundary it had not used.
    expect(await run(['taiyi', '--year-boundary', 'chunjie', '--lang', 'en'])).toBe(1);
    expect(err).toContain('not implemented');
  });

  it('carries a matter into the prompt rather than dropping it', async () => {
    expect(await run(['taiyi', '--year', '2026', '--about', 'a merger', '--lang', 'en'])).toBe(0);

    expect(out).toContain('a merger');
    expect(out).toContain('主');
  });
});

/**
 * The two flags that name what a board is read for, on the commands that do
 * not take them.
 *
 * Both exist because a question or a matter dropped in silence is worse than
 * one refused: it was the whole reason for the run. `--about` reached every
 * command and was read by one, and under `--json` it was dropped even there.
 */
describe('--ask and --about where they do not belong', () => {
  it('refuses a matter on every command but the board of a year', async () => {
    for (const command of ['chart', 'liuren', 'bazi', 'qizheng']) {
      expect(await run([command, ...MOMENT, '--about', 'a merger', '--lang', 'en'])).toBe(2);
      expect(err).toContain('--about');
    }
    expect(await run(['terms', '--year', '2026', '--about', 'a merger', '--lang', 'en'])).toBe(2);
  });

  it('refuses either of them beside --json, which would print neither', async () => {
    expect(await run(['taiyi', '--year', '2026', '--about', 'a merger', '--json', '--lang', 'en'])).toBe(2);
    expect(err).toContain('--json');
    expect(await run(['chart', ...MOMENT, '--ask', 'Will it go well?', '--json', '--lang', 'en'])).toBe(2);
    expect(err).toContain('--json');
  });
});

describe('ziwei', () => {
  const BIRTH = [
    '--date', '1984-05-05', '--time', '14:30', '--tz', 'Asia/Shanghai',
    '--lon', '116.4', '--no-true-solar', '--day-boundary', 'midnight',
  ];

  it('lays a board on a birth, under this book\'s names', async () => {
    expect(await run(['ziwei', ...BIRTH, '--lang', 'en'])).toBe(0);

    expect(out).toContain('The Zi Wei Dou Shu board');
    expect(out).toContain('火六局');
    // The twelve seats keep 卷二's names and not the modern ones.
    expect(out).toContain('妻妾');
    expect(out).toContain('奴僕');
    expect(out).not.toContain('夫妻');
  });

  it('closes the board with the one line a reader cannot supply', async () => {
    // Which book, and where its tables part from the modern ones. The board
    // used to carry a second line saying nothing on it is in the sky; it was
    // dropped as something anybody reading this already knows, and the prompt
    // still opens on it for the one reader who does not.
    await run(['ziwei', ...BIRTH, '--lang', 'en']);

    expect(out).toContain('卷二');
  });

  it('leaves out the limits without a gender and prints them with one', async () => {
    await run(['ziwei', ...BIRTH, '--lang', 'en']);
    expect(out).not.toContain('116–125');

    out = '';
    await run(['ziwei', ...BIRTH, '--gender', 'male', '--lang', 'en']);
    expect(out).toContain('116–125');
  });

  /**
   * The gender moved the board, so the board says so.
   *
   * It turns the 大限 and the 小限 round, which is why every decade printed
   * depends on it — and it is the only biographical fact this board is given.
   * A transcript that withheld it left a model to guess who it was writing
   * to, and one reading in Italian duly addressed a man in the feminine
   * throughout. An input that reached the arithmetic reaches the page.
   */
  it('says the gender it was given, and says nothing where it was not', async () => {
    // The whole row, not the word: `male` is a substring of `female`, so an
    // assertion on the word alone would pass on the wrong answer.
    const row = (text: string) =>
      text
        .split('\n')
        .find((line) => line.trimStart().startsWith('gender'))
        ?.trim();

    await run(['ziwei', ...BIRTH, '--gender', 'male', '--lang', 'en']);
    expect(row(out)?.split(/\s{2,}/)).toEqual(['gender', 'male']);

    out = '';
    await run(['ziwei', ...BIRTH, '--gender', 'female', '--lang', 'en']);
    expect(row(out)?.split(/\s{2,}/)).toEqual(['gender', 'female']);

    out = '';
    await run(['ziwei', ...BIRTH, '--lang', 'en']);
    expect(row(out)).toBeUndefined();
  });

  it('refuses --ask, and says why rather than dropping it', async () => {
    expect(
      await run(['ziwei', ...BIRTH, '--ask', 'how is my career', '--lang', 'en']),
    ).not.toBe(0);
    expect(err).toContain('--ask');
  });

  it('builds a prompt that forbids the sky before anything else', async () => {
    expect(await run(['ziwei', ...BIRTH, '--prompt', '--lang', 'en'])).toBe(0);

    expect(out).toContain('Nothing on this board is in the sky');
    expect(out).toContain('no planets, no aspects, no transits');
    // One board to a reading, said where it bites hardest.
    expect(out).toContain('one fact twice and not two witnesses');
  });
});

describe('qizheng', () => {
  it('prints the eleven names and places the seven', async () => {
    expect(await run(['qizheng', ...MOMENT, '--lang', 'en'])).toBe(0);

    for (const name of ['太陽', '太陰', '水星', '金星', '火星', '木星', '土星']) {
      expect(out).toContain(name);
    }
    for (const gloss of ['the sun', 'Mercury', 'Saturn']) expect(out).toContain(gloss);
    expect(out).toContain('palace of the life');
    // Degrees in both frames, which is what a row of this board says twice.
    expect(out).toMatch(/\d+\.\d\d°/);
  });

  it('carries three remainders and says on the page why not four', async () => {
    expect(await run(['qizheng', ...MOMENT, '--lang', 'en'])).toBe(0);

    expect(out).toContain('羅睺');
    expect(out).toContain('計都');
    expect(out).toContain('月孛');
    // 紫氣 is on the page, in the line that says why it is not on the board.
    // What must be absent is a row for it.
    expect(out).not.toContain('the purple vapour');
    expect(out).toContain('three, not four');
  });

  it('swaps the two nodes when told which law to follow', async () => {
    expect(await run(['qizheng', ...MOMENT, '--lang', 'en'])).toBe(0);
    const astrologers = out;
    out = '';
    expect(await run(['qizheng', ...MOMENT, '--lang', 'en', '--luohou', 'ascending'])).toBe(0);

    // The same two seats under the other two names, and nothing else moved.
    expect(out).not.toBe(astrologers);
    const seatOf = (text: string, name: string) =>
      (text.split('\n').find((line) => line.includes(name)) as string)
        .match(/\S+\s+\d+\.\d\d°\s+\S+\s+\d+\.\d\d°/)?.[0];
    expect(seatOf(out, '羅睺')).toBe(seatOf(astrologers, '計都'));
    expect(seatOf(out, '計都')).toBe(seatOf(astrologers, '羅睺'));
    expect(seatOf(out, '月孛')).toBe(seatOf(astrologers, '月孛'));
  });

  it('refuses a node convention it has never heard of', async () => {
    expect(await run(['qizheng', ...MOMENT, '--luohou', 'north', '--lang', 'en'])).toBe(2);
    expect(err).toContain('--luohou');
  });

  it('says the frame is the stars and not a table', async () => {
    expect(await run(['qizheng', ...MOMENT, '--lang', 'en'])).toBe(0);
    expect(out).toContain('determinative stars');
    expect(out).toContain('宿度');
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

  it("leaves the almanac's line out, where every other command prints it", async () => {
    // The instant read as a person. 曆注 weighs a day as the occasion of an
    // undertaking, and a birth is not one — while 天德, 劫煞 and half a dozen
    // more are names 八字 also uses and derives otherwise. The calendar the
    // pillars turn on stays: the 節 is what the month column moves at.
    await run(['bazi', ...MOMENT, '--gender', 'male', '--lang', 'en']);

    expect(out).not.toContain('Day officer');
    expect(out).not.toContain('定 dìng');
    expect(out).toContain('month opened at');
  });

  // Beside the direction it decided, because 陽男陰女 turns the run one way and
  // 陰男陽女 the other: `forward` alone cannot be read back to a gender without
  // also weighing the year stem, so the run carries the gender rather than
  // leaving a reader to solve for it.
  it('names the gender beside the direction of the run', async () => {
    await run(['bazi', ...MOMENT, '--gender', 'female', '--lang', 'en']);
    const heading = out.split('\n').find((line) => line.includes('Luck cycles'))!;
    expect(heading).toContain('female');
  });

  it('carries the almanac in the JSON, which is asked for rather than shown', async () => {
    await run(['bazi', ...MOMENT, '--gender', 'male', '--json']);

    expect(JSON.parse(out).moment.almanac.officer.id).toBe('ding');
  });
});

/**
 * `--prompt` on the two boards that are laid on a birth.
 *
 * The flag reaches all four commands now. What parts these two from the other
 * two is `--ask`, which is refused rather than dropped: nothing is asked of a
 * board of 命, and the themes a reading traverses are commissioned in the
 * prompt itself.
 */
describe('--prompt on a board of 命', () => {
  it('wraps the four pillars in what a reader has to be told', async () => {
    expect(await run(['bazi', ...MOMENT, '--gender', 'male', '--prompt', '--lang', 'en'])).toBe(0);

    expect(out).toContain('用神');
    expect(out).toContain('this engine does not choose');
    expect(out).toContain('food for thought and entertainment');
  });

  it('wraps the 七政四餘 board in how its twelve seats are read', async () => {
    expect(await run(['qizheng', ...MOMENT, '--prompt', '--lang', 'en'])).toBe(0);

    expect(out).toContain('what the tradition reads at that seat');
    expect(out).toContain('one source and three derivations');
  });

  it('refuses a question rather than printing a board that ignored it', async () => {
    for (const command of ['bazi', 'qizheng']) {
      expect(await run([command, ...MOMENT, '--ask', 'Will it go well?', '--lang', 'en'])).toBe(2);
      expect(err).toContain('nothing is asked of it');
    }
  });

  it('still takes a question on the two boards that are cast for one', async () => {
    expect(await run(['chart', ...MOMENT, '--ask', 'Will it go well?', '--lang', 'en'])).toBe(0);
    expect(out).toContain('Will it go well?');
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

  it('refuses a year that is not a number, rather than throwing it at the reader', async () => {
    // `Number('20x4')` is NaN, and unchecked it reached the calendar and came
    // back as a stack trace addressed to nobody.
    const code = await run(['terms', '--year', '20x4', '--tz', 'Asia/Shanghai', '--lang', 'en']);

    expect(code).toBe(2);
    expect(err).toContain('20x4');
    expect(err).not.toContain('at ');
    expect(out).toBe('');
  });

  it('reads the year of a date before our era whole, not its first four characters', async () => {
    // An ISO year runs to six digits and a sign: `-000044` sliced to four
    // characters is `-000`, and the terms printed were the year zero's.
    const code = await run(['terms', '--date', '-000044-06-01', '--time', '12:00',
                            '--tz', 'Asia/Shanghai', '--json']);

    expect(code).toBe(0);
    const printed = JSON.parse(out);
    expect(printed.year).toBe(-44);
    expect(printed.terms).toHaveLength(24);
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
    expect(
      await run(['bazi', '--date', '1990-01-01', '--gender', 'neither', '--lang', 'en']),
    ).toBe(2);

    expect(err).toContain('--gender');
    // A stack frame, not the word: a sentence that explains itself says
    // «that», and a guard on `at ` would fail on the explanation.
    expect(err).not.toMatch(/^\s+at /m);
    expect(out).toBe('');
  });

  it('reports a mistake in the arguments themselves in the requested locale', async () => {
    // Thrown by `parse`, before there is anything parsed to read a locale
    // from — so the locale is taken off the raw arguments first. These three
    // were English sentences no catalog could reach.
    expect(await run(['chart', '--rising-sign', '--lang', 'it'])).toBe(2);
    expect(err).toContain('sconosciuta');

    err = '';
    expect(await run(['horoscope', '--lang', 'it'])).toBe(2);
    expect(err).toContain('sconosciuto');

    err = '';
    expect(await run(['chart', '--date', '--lang', 'it'])).toBe(2);
    expect(err).toContain('richiede un valore');
  });

  it('prints help and stops when asked', async () => {
    expect(await run(['--help'])).toBe(0);
    expect(out).toContain('qimen chart');
  });

  it('prints help and fails when given nothing', async () => {
    expect(await run([])).toBe(2);
  });
});

describe('the installed bin', () => {
  // The symlink npm lays in `.bin`, which has no extension: the guard at the
  // foot of cli.ts once sniffed the path for `cli.js`, and through the
  // symlink the whole program was a silent exit 0. Only a spawn exercises
  // that guard — everything above imports `run`, which must not fire it.
  const BIN = fileURLToPath(new URL('../../../node_modules/.bin/qimen', import.meta.url));

  // Skipped where `dist` has not been built: the suite runs from source and
  // must not demand a build first.
  it.skipIf(!existsSync(BIN))('runs when invoked through the symlink', () => {
    const result = spawnSync(process.execPath, [BIN, 'terms', '--year', '2024',
      '--tz', 'Asia/Shanghai', '--lang', 'en'], { encoding: 'utf8' });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('立春');
  });
});
