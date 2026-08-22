import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  BRANCHES,
  CHART_PARAMETERS,
  DEFAULT_LIUREN_OPTIONS,
  DEFAULT_NIANMING_OPTIONS,
  DEFAULT_OPTIONS,
  DEFAULT_QIZHENG_OPTIONS,
  DEFAULT_TAIYI_OPTIONS,
  DEFAULT_ZIWEI_OPTIONS,
  LIUREN_PARAMETERS,
  NIANMING_PARAMETERS,
  PARAMETERS,
  QIZHENG_PARAMETERS,
  SOLAR_TERMS,
  TAIYI_PARAMETERS,
  ZIWEI_HOUSES,
  ZIWEI_PARAMETERS,
  implementedValues,
  requireImplemented,
  type ChartOptions,
} from '../src/index.js';

/**
 * The registry against the two things it is supposed to have replaced: the
 * defaults each board ships, and the page that describes them.
 *
 * `docs/parameters.md` used to be the only statement of what the values of a
 * parameter are, and nothing read it. It had drifted by a whole board — the
 * five divergences of 紫微斗數 landed with the sixth board and never reached
 * the page, and 年命's `count` had never been on it at all — which is the
 * failure this suite exists to make loud. What is asserted is the facts a
 * reader looks up: that every parameter is named, that its values are listed,
 * and that the default written down is the default the engine ships.
 *
 * What is deliberately **not** asserted is the prose. A row may argue what a
 * value names, in whatever words the page finds; the test reads the row for
 * the identifiers in it and leaves the sentence alone. A test that held the
 * documentation to a shape would be a page written for its test.
 */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

const PAGE = readFileSync(join(ROOT, 'docs/parameters.md'), 'utf8');

/** The CLI's own help, read as text: this test must not run the CLI. */
const HELP = readFileSync(join(ROOT, 'packages/core/src/cli.ts'), 'utf8');

/**
 * The lines of the page that could be a given parameter's row.
 *
 * A name is unique only within its board: `yearBoundary` is three parameters,
 * one of the pillars and one apiece on 太乙 and 紫微斗數, with different
 * values and different defaults. So the row is not looked up by name — every
 * line naming the parameter is a candidate, and the assertion is that **one
 * of them** states this parameter completely. That is enough to catch a
 * parameter with no row and a row that has fallen behind its values, and it
 * cannot be confused by two rows that share a name.
 */
const rowsNaming = (id: string): string[] =>
  PAGE.split('\n').filter((line) => line.includes(`\`${id}\``));

describe('the parameters the engine declares', () => {
  it('cover every option of every board, and only through the sets', () => {
    // The sets are mapped over their own options types, so a missing entry is
    // a compile error rather than a test failure — what this checks is the
    // flattening, which is hand-written in one line per set and is the one
    // place a whole board could go missing.
    expect(PARAMETERS.map((parameter) => parameter.id)).toEqual([
      ...Object.keys(CHART_PARAMETERS),
      ...Object.keys(LIUREN_PARAMETERS),
      ...Object.keys(QIZHENG_PARAMETERS),
      ...Object.keys(TAIYI_PARAMETERS),
      ...Object.keys(ZIWEI_PARAMETERS),
      ...Object.keys(NIANMING_PARAMETERS),
    ]);

    // Six boards, the calendrical layer under them, the almanac beside them,
    // and the birth placed inside a chart of a moment. 八字 is absent because
    // it has no divergence of its own: it stands on `pillars` entire, which
    // is the fact that made `pillars` a board here.
    expect([...new Set(PARAMETERS.map((parameter) => parameter.board))].sort()).toEqual([
      'almanac',
      'liuren',
      'nianming',
      'pillars',
      'qimen',
      'qizheng',
      'taiyi',
      'ziwei',
    ]);
  });

  it('declares at least one value it computes, for every one of them', () => {
    // A parameter with nothing implemented would be an option that can only
    // ever come back as an error, which is not a choice — and every default
    // below would be refusing itself.
    for (const parameter of PARAMETERS) {
      expect(implementedValues(parameter).length, parameter.id).toBeGreaterThan(0);
    }
  });

  it('names the default among its own values, and computes it', () => {
    for (const parameter of PARAMETERS) {
      const chosen = parameter.values.find((value) => value.id === parameter.default);
      expect(chosen, `${parameter.board}.${parameter.id}`).toBeDefined();
      // A default the engine refuses would make every caller that says
      // nothing an error, which no amount of documentation could rescue.
      expect(chosen?.implemented, `${parameter.board}.${parameter.id}`).toBe(true);
    }
  });

  it('are the defaults the boards actually ship', () => {
    // The registry states a default and each board froze one before the
    // registry existed. Two statements of one fact, and this is the seam:
    // `DEFAULT_OPTIONS` is what a surface spreads, so a registry disagreeing
    // with it would describe a chart nobody casts.
    const shipped: Array<[Record<string, unknown>, Record<string, { default: unknown }>]> = [
      [DEFAULT_OPTIONS, CHART_PARAMETERS],
      [DEFAULT_LIUREN_OPTIONS, LIUREN_PARAMETERS],
      [DEFAULT_QIZHENG_OPTIONS, QIZHENG_PARAMETERS],
      [DEFAULT_TAIYI_OPTIONS, TAIYI_PARAMETERS],
      [DEFAULT_ZIWEI_OPTIONS, ZIWEI_PARAMETERS],
      [DEFAULT_NIANMING_OPTIONS, NIANMING_PARAMETERS],
    ];

    for (const [defaults, set] of shipped) {
      for (const [id, parameter] of Object.entries(set)) {
        expect(defaults[id], id).toBe(parameter.default);
      }
      // And nothing shipped that the registry has not heard of. `gender` is
      // the one key of an options type that is not a parameter, and it is
      // absent from `DEFAULT_ZIWEI_OPTIONS` for the same reason it is absent
      // from the registry: a board is laid for a person or without one, and
      // neither is a school.
      expect(Object.keys(defaults).sort()).toEqual(Object.keys(set).sort());
    }
  });
});

describe('what refuses an option the engine does not compute', () => {
  it('says which values are computed, in the order they are declared', () => {
    const options: ChartOptions = { ...DEFAULT_OPTIONS, plate: 'fei' };

    try {
      requireImplemented(CHART_PARAMETERS, options, 'plate');
      expect.unreachable('a plate the engine does not turn should be refused');
    } catch (error) {
      expect((error as { code: string }).code).toBe('OPTION_NOT_IMPLEMENTED');
      expect((error as { params: Record<string, string> }).params).toEqual({
        option: 'plate',
        value: 'fei',
        implemented: 'zhuan',
      });
    }
  });

  it('joins them where a parameter computes more than one', () => {
    try {
      requireImplemented(ZIWEI_PARAMETERS, { yearBoundary: 'nonsense' } as never, 'yearBoundary');
      expect.unreachable('an undeclared boundary should be refused');
    } catch (error) {
      expect((error as { params: Record<string, string> }).params.implemented).toBe(
        'lichun, chunjie',
      );
    }
  });

  it('keeps the ju method on the code it shipped with', () => {
    // `METHOD_NOT_IMPLEMENTED` is part of the API a client reads and a surface
    // translates. Folding it into the general code to tidy the registry would
    // change what every existing caller sees for the most divisive option
    // here, so the parameter records its own.
    const options: ChartOptions = { ...DEFAULT_OPTIONS, method: 'maoshan' };

    try {
      requireImplemented(CHART_PARAMETERS, options, 'method');
      expect.unreachable('茅山 should be refused');
    } catch (error) {
      expect((error as { code: string }).code).toBe('METHOD_NOT_IMPLEMENTED');
      expect((error as { params: Record<string, string> }).params).toEqual({ method: 'maoshan' });
    }
  });

  it('refuses a value nobody declared, which is the true statement about it', () => {
    // An unknown string is not a school this engine has chosen not to compute;
    // it is not a school at all. A surface reading one off a URL says so with
    // `UNKNOWN_IDENTIFIER` before the engine is reached. Here, where the
    // engine has only the value, «not computed» is what can honestly be said.
    try {
      requireImplemented(LIUREN_PARAMETERS, { yuejiang: 'banana' } as never, 'yuejiang');
      expect.unreachable('an undeclared general should be refused');
    } catch (error) {
      expect((error as { code: string }).code).toBe('OPTION_NOT_IMPLEMENTED');
      expect((error as { params: Record<string, string> }).params.value).toBe('banana');
    }
  });
});

describe('docs/parameters.md', () => {
  it('has a row for every parameter, naming every value it can take', () => {
    for (const parameter of PARAMETERS) {
      const rows = rowsNaming(parameter.id);
      expect(rows.length, `docs/parameters.md names no \`${parameter.id}\``).toBeGreaterThan(0);

      const complete = rows.some((row) =>
        parameter.values.every((value) => row.includes(`\`${String(value.id)}\``)),
      );
      expect(
        complete,
        `docs/parameters.md has no row listing every value of \`${parameter.id}\`: ` +
          `${parameter.values.map((value) => String(value.id)).join(', ')}. ` +
          `The engine has gained or lost one and the page still says what it said.`,
      ).toBe(true);
    }
  });

  it('states the default the engine ships, on that same row', () => {
    for (const parameter of PARAMETERS) {
      const complete = rowsNaming(parameter.id).some(
        (row) =>
          parameter.values.every((value) => row.includes(`\`${String(value.id)}\``)) &&
          row.includes(`\`${String(parameter.default)}\``),
      );
      expect(
        complete,
        `docs/parameters.md does not give \`${parameter.id}\` the default the engine ships, ` +
          `which is \`${String(parameter.default)}\`.`,
      ).toBe(true);
    }
  });

  it('names each value in Chinese and says it, where it bears a name', () => {
    // The glyph **and** the reading, on this page as in the engine's output:
    // the reader here is the same reader, and a name whose sound is only in
    // the source is a name they cannot ask anybody about. A value renamed in
    // one and not the other is the drift this pair of files exists to
    // prevent.
    //
    // The two may be parted by a closing 》, because a book keeps its
    // brackets — 《協紀辨方書》 xiéjìbiànfāngshū — and by nothing else.
    for (const parameter of PARAMETERS) {
      for (const value of parameter.values) {
        if (!value.name) continue;
        const said = new RegExp(`${value.name.hanzi}[》」』]? ${value.name.pinyin}`);
        expect(
          said.test(PAGE),
          `docs/parameters.md does not write "${value.name.hanzi} ${value.name.pinyin}", ` +
            `which is what \`${String(value.id)}\` is called and how it is said.`,
        ).toBe(true);
      }
    }
  });
});

describe('the readings the values carry', () => {
  it('agrees with the engine wherever the same name is named twice', () => {
    // A reading is data written by hand, and the reader it exists for cannot
    // catch it. Four of these names are already in the engine's own tables —
    // two solar terms, two branches and a palace of 紫微斗數 — so those four
    // are not an opinion here: they are the same fact, and it must be the
    // same word. `pinyin.test.ts` covers the shape of all of them; this
    // covers the ones that can be checked against something.
    const elsewhere = new Map<string, string>([
      ...SOLAR_TERMS.map((term) => [term.hanzi, term.pinyin] as [string, string]),
      ...BRANCHES.map((branch) => [branch.hanzi, branch.pinyin] as [string, string]),
      ...ZIWEI_HOUSES.map((house) => [house.hanzi, house.pinyin] as [string, string]),
    ]);

    const checked: string[] = [];
    for (const parameter of PARAMETERS) {
      for (const value of parameter.values) {
        const known = value.name && elsewhere.get(value.name.hanzi);
        if (!known || !value.name) continue;
        expect(value.name.pinyin, value.name.hanzi).toBe(known);
        checked.push(value.name.hanzi);
      }
    }

    // 立春 and 冬至 as boundaries, 丑 and 未 as the noble's seats, 命宮 as
    // where a decade may open. An empty run would mean the values had lost
    // their names and this test had stopped saying anything.
    expect([...new Set(checked)].sort()).toEqual(['丑', '冬至', '命宮', '未', '立春']);
  });
});

describe('the CLI help', () => {
  /**
   * The flags whose help line spells the values out, and the parameter each
   * one sets.
   *
   * They name what the engine **computes** and not what the type declares,
   * which is the same choice the web form and the MCP schema make: a flag
   * offering 茅山 would be offering an error. That makes the help a copy of
   * the implemented list, in prose, where nothing could see it go stale.
   *
   * `--year-boundary` is deliberately not here and is the exception that
   * shows the rule is a choice: it lists all three of 太乙's values and says
   * in the line beneath that only 立春 is implemented, because that
   * parameter is upstream of the whole board and a reader who does not know
   * the other two exist cannot weigh the one that does.
   */
  const spelledOut: Array<[string, () => readonly (string | boolean)[]]> = [
    ['--method', () => implementedValues(CHART_PARAMETERS.method)],
    ['--yuan', () => implementedValues(CHART_PARAMETERS.yuan)],
    ['--day-boundary', () => implementedValues(CHART_PARAMETERS.dayBoundary)],
    ['--shensha', () => implementedValues(CHART_PARAMETERS.shensha)],
    ['--guiren', () => implementedValues(LIUREN_PARAMETERS.guiren)],
    ['--luohou', () => implementedValues(QIZHENG_PARAMETERS.luohou)],
    ['--years', () => implementedValues(NIANMING_PARAMETERS.count)],
  ];

  for (const [flag, values] of spelledOut) {
    it(`offers after ${flag} exactly what the engine computes`, () => {
      const line = HELP.split('\n').find((candidate) => candidate.includes(`  ${flag} `));
      expect(line, `the help has no line for ${flag}`).toBeDefined();
      expect(
        line?.includes(values().join('|')),
        `${flag} should be followed by ${values().join('|')}, and the help says: ${line?.trim()}`,
      ).toBe(true);
    });
  }
});
