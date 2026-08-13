#!/usr/bin/env node
/**
 * `qimen` — the engine on the command line.
 *
 * The cheapest surface there is, and the first one built: it exercises every
 * calculation before an API or an interface exists to get in the way. It is
 * also a real surface, so it obeys the same rules as the others — it resolves
 * a locale, it translates by code, and it never interprets.
 */
import {
  createTranslator,
  resolveLocale,
  type Locale,
  type MessageKey,
  type Translator,
} from '@qimendunjia/i18n';
import { computeBazi, type Gender } from './bazi/index.js';
import {
  GATES,
  PATTERN_IDS,
  SPIRITS_YANG,
  STARS,
  computeQimenChart,
  type Direction,
  type GateId,
  type PatternId,
  type SpiritId,
  type StarId,
  type StrengthId,
} from './dunjia/index.js';
import { initEphemeris } from './ephemeris.js';
import { ChartError } from './errors.js';
import { STEMS, type StemId } from './ganzhi.js';
import {
  formatBazi,
  formatMoment,
  formatScan,
  formatSolarTerms,
  formatWarnings,
} from './format.js';
import { lunarDate } from './lunar.js';
import { resolveMoment } from './pillars.js';
import { chartTranscript, readingPrompt } from './prompt.js';
import { PURPOSES, purposeCriteria, type PurposeId } from './purposes.js';
import { matchRuns, scanCharts, type ScanCriteria } from './scan.js';
import { solarTermsOfYear } from './solar-terms.js';
import { currentMoment, systemTimezone, zoneMeridian, type LocalMoment } from './time.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from './types.js';

/**
 * A mistake in how the command was called.
 *
 * Its message is already translated and already meant for whoever typed it,
 * so `run` prints it and stops. Anything else thrown out of `execute` is a
 * fault in the engine, and a fault deserves its stack trace.
 */
class UsageError extends Error {}

const COMMANDS = ['chart', 'bazi', 'terms', 'calendar', 'scan'] as const;
type Command = (typeof COMMANDS)[number];

interface Options {
  date?: string;
  time?: string;
  timezone?: string;
  latitude?: string;
  longitude?: string;
  year?: string;
  gender?: string;
  lang?: string;
  json: boolean;
  help: boolean;
  prompt: boolean;
  ask?: string;
  natal: boolean;
  trueSolar?: boolean;
  dayBoundary?: string;
  method?: string;
  yuan?: string;
  until?: string;
  gate?: string;
  star?: string;
  spirit?: string;
  stem?: string;
  towards?: string;
  minStrength?: string;
  without?: string;
  for?: string;
}

const HELP = `qimen — Qi Men Dun Jia charts and Four Pillars

Usage
  qimen chart     [options]     the nine palaces for a moment
  qimen bazi      [options]     the four pillars, read out
  qimen terms     [options]     the twenty-four solar terms of a year
  qimen calendar  [options]     the lunar date of a moment
  qimen scan      [options]     every chart between two moments

Options
  --date YYYY-MM-DD      default: today
  --time HH:mm[:ss]      default: now
  --tz  IANA-zone        default: the system zone
  --lat, --lon degrees   default: the meridian the zone is named for
  --year N               for \`terms\`; default: the year of --date
  --gender male|female   for \`bazi\`; only the luck cycles need it

Narrowing a scan
  --until YYYY-MM-DD     the end of the interval; --date opens it
  --for opening|meeting|wealth|documents|concealment|pursuit|ending|dispute
                         the errand, which stands for a gate and says which
  --gate, --star, --spirit, --stem   by identifier, e.g. kaimen, tianxin
  --towards n,ne,e,se,s,sw,w,nw      one or more; the centre faces none
  --min-strength wang|xiang|xiu|qiu|si   the weakest state admitted
  --without id,id        configurations that rule a palace out, e.g. kongwang
  --true-solar, --no-true-solar   default: on
  --day-boundary zishi|midnight   default: zishi
  --method chaibu|zhirun          how the ju is determined; default: chaibu
  --yuan term|futou               under chaibu, where the third of the term is
                                  counted from; default: term
  --lang en|it           default: the environment, then English
  --json                 the data, unformatted and untranslated
  --help

Handing a chart to a model
  --prompt               for \`chart\`: the chart wrapped in the instructions
                         for reading it, to paste into an assistant that has
                         no connection to this engine
  --ask "…"              the question it is to be read for; implies --prompt.
                         Without one the prompt says none was asked, which is
                         not the same as choosing a 用神 on nobody's behalf
  --natal                frame the prompt as a chart of a life rather than of
                         a question — a modern, minority and school-divergent
                         application, which the prompt says. Refuses --ask:
                         a chart of a birth carrying a question is a third
                         thing, and not one this engine takes a position on

A note on what this prints
  The engine reports arrangements — which gate stands over which palace, how
  a stem stands to the day master. What they mean belongs to whoever reads
  them, and nothing here will tell you. A scan is the same: it answers the
  question you asked it, and calls no hour good.
`;

export async function run(argv: string[]): Promise<number> {
  let command: Command | undefined;
  let options: Options;

  try {
    ({ command, options } = parse(argv));
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n`);
    return 2;
  }

  const locale = resolveLocale(options.lang, process.env['LC_ALL'], process.env['LANG']);
  const t = createTranslator(locale);

  if (options.help || !command) {
    process.stdout.write(HELP);
    return command ? 0 : options.help ? 0 : 2;
  }

  try {
    process.stdout.write(`${await execute(command, options, locale)}\n`);
    return 0;
  } catch (error) {
    if (error instanceof ChartError) {
      process.stderr.write(`${t(error.messageKey, error.params)}\n`);
      return 1;
    }
    if (error instanceof UsageError) {
      process.stderr.write(`${error.message}\n`);
      return 2;
    }
    throw error;
  }
}

async function execute(command: Command, options: Options, locale: Locale): Promise<string> {
  const t = createTranslator(locale);
  const context = initEphemeris();
  const timezone = options.timezone ?? systemTimezone();
  const now = currentMoment(timezone);

  const input = {
    date: options.date ?? now.date,
    time: options.time ?? now.time,
    timezone,
  };

  if (command === 'terms') {
    const year = Number(options.year ?? input.date.slice(0, 4));
    const terms = solarTermsOfYear(year, timezone, context);
    if (options.json) {
      return JSON.stringify({ year, timezone, terms }, null, 2);
    }
    return formatSolarTerms(terms, year, timezone, t);
  }

  const place = resolvePlace(options, input);
  const chartOptions = resolveOptions(options, t);
  const moment = resolveMoment(input, place, chartOptions, context);

  if (command === 'scan') {
    if (!options.until) throw new UsageError(t('cli.error.missingValue', { option: '--until' }));

    // `--date 2026-09-01 --until 2026-09-03` names two days and means all of
    // them. Falling back to the present hour, as a single chart does, would
    // open the interval wherever the command happened to be typed.
    const opens = { ...input, time: options.time ?? '00:00' };
    const runs = scanCharts(opens, { ...opens, date: options.until }, place, chartOptions, context);
    const criteria = resolveCriteria(options, t);
    const matches = matchRuns(runs, criteria);

    if (options.json) return JSON.stringify({ criteria, matches }, null, 2);
    return [
      `${t('cli.heading.scan', { from: input.date, to: options.until })}`,
      // What an errand expanded into, said out loud. A shorthand that worked
      // silently would leave the reader unable to check it or to vary it.
      expansionOf(options, t),
      '',
      formatScan(matches, t),
      warningsOf(moment, t),
    ]
      .filter((part) => part !== '')
      .join('\n');
  }

  if (command === 'calendar') {
    const date = lunarDate(moment.julianDayUT, context);
    if (options.json) return JSON.stringify({ moment, lunar: date }, null, 2);
    return [
      formatMoment(moment, t),
      '',
      `${t('cli.heading.calendar')}`,
      `  ${date.year} · ${date.leap ? `${t('cli.value.leapMonth')} ` : ''}${date.month}/${date.day}`,
      warningsOf(moment, t),
    ].join('\n');
  }

  if (command === 'bazi') {
    const gender = options.gender as Gender | undefined;
    if (gender && gender !== 'male' && gender !== 'female') {
      throw new UsageError(t('cli.error.missingValue', { option: '--gender' }));
    }
    const bazi = computeBazi(moment, gender ? { gender } : {}, context);
    if (options.json) return JSON.stringify({ moment, bazi }, null, 2);
    return [
      formatMoment(moment, t),
      '',
      formatBazi(bazi, t),
      gender ? '' : `\n  ${t('cli.error.genderRequired')}`,
      warningsOf(moment, t),
    ].join('\n');
  }

  const chart = computeQimenChart(moment, chartOptions);
  if (options.json) return JSON.stringify(chart, null, 2);

  // The two frames do not overlap: a chart of a birth carrying a question is
  // a natal chart compared against a chart of a moment, which is a third
  // thing and a modern, minority one. Refused rather than resolved.
  if (options.natal && options.ask !== undefined) {
    throw new UsageError(t('cli.error.exclusive', { option: '--natal', other: '--ask' }));
  }

  // A question asked is a question meant to be carried, so it turns the plain
  // printing into the prompt by itself: `--ask` without `--prompt` that
  // printed a chart and dropped the question would be a flag that did nothing.
  if (options.prompt || options.natal || options.ask !== undefined) {
    return readingPrompt(
      moment,
      chart,
      t,
      options.natal ? { frame: 'destiny' } : options.ask ? { question: options.ask } : {},
    );
  }
  return chartTranscript(moment, chart, t);
}

function warningsOf(moment: Parameters<typeof formatWarnings>[0], t: Parameters<typeof formatWarnings>[1]): string {
  const text = formatWarnings(moment, t);
  return text ? `\n${text}` : '';
}

/**
 * Where the chart is cast from.
 *
 * With no coordinates the place is taken to sit on the meridian the zone's
 * clock keeps at the chart's moment. That makes the longitude correction
 * exactly zero and leaves only the equation of time — the least wrong
 * assumption available, and one that never silently moves an hour pillar by
 * half an hour. The moment matters: today's offset would put a winter chart
 * an hour of summer time off its own zone.
 */
function resolvePlace(options: Options, input: LocalMoment): Place {
  if (options.longitude !== undefined) {
    return {
      latitude: Number(options.latitude ?? 0),
      longitude: Number(options.longitude),
      timezone: input.timezone,
    };
  }

  return {
    latitude: Number(options.latitude ?? 0),
    longitude: zoneMeridian(input),
    timezone: input.timezone,
  };
}

/** `Asked for  Opening, starting … → Open 開門 kāimén`, or nothing if no errand. */
function expansionOf(options: Options, t: ReturnType<typeof createTranslator>): string {
  if (!options.for) return '';
  const gate = purposeCriteria(options.for as PurposeId).gate as string;
  const named = GATES.find((candidate) => candidate.id === gate) as (typeof GATES)[number];

  return `  ${t('cli.heading.criteria')}: ${t(`label.purpose.${options.for}` as MessageKey)} → ${t(`label.gate.${gate}` as MessageKey)} ${named.hanzi} ${named.pinyin}`;
}

const DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;
const STRENGTHS = ['wang', 'xiang', 'xiu', 'qiu', 'si'] as const;

/**
 * What the scan was asked for.
 *
 * Every value is checked against the identifiers the engine actually knows.
 * An unchecked one would not fail: it would match nothing, and the scan would
 * report that the arrangement never occurred — which is the same answer a
 * correct question can get, and indistinguishable from it.
 */
function resolveCriteria(options: Options, t: ReturnType<typeof createTranslator>): ScanCriteria {
  const one = <T extends string>(
    value: string | undefined,
    known: readonly { id: string }[] | readonly string[],
    flag: string,
  ): T | undefined => {
    if (value === undefined) return undefined;
    const ids = known.map((entry) => (typeof entry === 'string' ? entry : entry.id));
    if (!ids.includes(value)) {
      throw new UsageError(t('cli.error.unknownValue', { option: flag, value }));
    }
    return value as T;
  };

  const many = <T extends string>(
    value: string | undefined,
    known: readonly string[],
    flag: string,
  ): T[] | undefined =>
    value
      ?.split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => one<T>(entry, known, flag) as T);

  const criteria: ScanCriteria = {};

  // An errand stands for a gate, so naming both is either a repetition or a
  // contradiction. Neither is worth guessing at.
  const errand = one<PurposeId>(options.for, PURPOSES, '--for');
  const fromErrand = errand ? purposeCriteria(errand).gate : undefined;
  if (fromErrand && options.gate && options.gate !== fromErrand) {
    throw new UsageError(t('cli.error.contradiction', { option: '--for', other: '--gate' }));
  }

  const gate = one<GateId>(options.gate ?? fromErrand, GATES, '--gate');
  const star = one<StarId>(options.star, STARS, '--star');
  const spirit = one<SpiritId>(options.spirit, SPIRITS_YANG, '--spirit');
  const stem = one<StemId>(options.stem, STEMS, '--stem');
  const directions = many<Direction>(options.towards, DIRECTIONS, '--towards');
  const minStrength = one<StrengthId>(options.minStrength, STRENGTHS, '--min-strength');
  const excludes = many<PatternId>(options.without, PATTERN_IDS, '--without');

  if (gate) criteria.gate = gate;
  if (star) criteria.star = star;
  if (spirit) criteria.spirit = spirit;
  if (stem) criteria.stem = stem;
  if (directions?.length) criteria.directions = directions;
  if (minStrength) criteria.minStrength = minStrength;
  if (excludes?.length) criteria.excludes = excludes;

  return criteria;
}

function resolveOptions(options: Options, t: Translator): ChartOptions {
  const chartOptions: ChartOptions = { ...DEFAULT_OPTIONS };
  if (options.trueSolar !== undefined) chartOptions.trueSolarTime = options.trueSolar;
  if (options.dayBoundary === 'midnight' || options.dayBoundary === 'zishi') {
    chartOptions.dayBoundary = options.dayBoundary;
  }
  // Strict, unlike the two above: their misspellings fall back to a default
  // that shows in the output, but a chart cast by the wrong method looks
  // right and is not. maoshan passes through and the engine refuses it.
  if (options.method !== undefined) {
    if (options.method !== 'chaibu' && options.method !== 'zhirun' && options.method !== 'maoshan') {
      throw new UsageError(t('cli.error.unknownValue', { option: '--method', value: options.method }));
    }
    chartOptions.method = options.method;
  }
  // Strict for the same reason: a yuan read from the wrong end moves the ju
  // on most days, and a misspelling that fell back would do it silently.
  if (options.yuan !== undefined) {
    if (options.yuan !== 'term' && options.yuan !== 'futou') {
      throw new UsageError(t('cli.error.unknownValue', { option: '--yuan', value: options.yuan }));
    }
    chartOptions.yuan = options.yuan;
  }
  return chartOptions;
}

const FLAGS: Record<string, keyof Options> = {
  '--date': 'date',
  '--time': 'time',
  '--tz': 'timezone',
  '--timezone': 'timezone',
  '--lat': 'latitude',
  '--lon': 'longitude',
  '--year': 'year',
  '--gender': 'gender',
  '--lang': 'lang',
  '--day-boundary': 'dayBoundary',
  '--method': 'method',
  '--yuan': 'yuan',
  '--until': 'until',
  '--gate': 'gate',
  '--star': 'star',
  '--spirit': 'spirit',
  '--stem': 'stem',
  '--towards': 'towards',
  '--min-strength': 'minStrength',
  '--without': 'without',
  '--for': 'for',
  '--ask': 'ask',
};

function parse(argv: string[]): { command?: Command; options: Options } {
  const options: Options = { json: false, help: false, prompt: false, natal: false };
  let command: Command | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const argument = argv[i] as string;

    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }
    if (argument === '--json') {
      options.json = true;
      continue;
    }
    if (argument === '--prompt') {
      options.prompt = true;
      continue;
    }
    if (argument === '--natal') {
      options.natal = true;
      continue;
    }
    if (argument === '--true-solar') {
      options.trueSolar = true;
      continue;
    }
    if (argument === '--no-true-solar') {
      options.trueSolar = false;
      continue;
    }

    const key = FLAGS[argument];
    if (key) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) {
        throw new Error(`Option "${argument}" needs a value.`);
      }
      (options as unknown as Record<string, string>)[key] = value;
      i += 1;
      continue;
    }

    if (argument.startsWith('-')) {
      throw new Error(`Unknown option "${argument}". Try \`qimen --help\`.`);
    }
    if (!command && (COMMANDS as readonly string[]).includes(argument)) {
      command = argument as Command;
      continue;
    }
    throw new Error(`Unknown command "${argument}". Try \`qimen --help\`.`);
  }

  return { command, options };
}

// Only when run as a program, never when imported by a test.
if (process.argv[1] && /cli\.(ts|js)$/.test(process.argv[1])) {
  process.exitCode = await run(process.argv.slice(2));
}
