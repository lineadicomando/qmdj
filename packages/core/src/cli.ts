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
  SPIRIT_IDS,
  STARS,
  computeQimenChart,
  type Direction,
  type QimenChart,
  type GateId,
  type PatternId,
  type SpiritId,
  type StarId,
  type StrengthId,
} from './dunjia/index.js';
import { initEphemeris, type EphemerisContext } from './ephemeris.js';
import { ChartError } from './errors.js';
import { STEMS, type StemId } from './ganzhi.js';
import {
  formatBazi,
  formatMoment,
  formatNianming,
  formatScan,
  formatSolarTerms,
  formatWarnings,
} from './format.js';
import { lunarDate } from './lunar.js';
import { nianmingOf, yearsLived, type Nianming, type NianmingOptions } from './nianming.js';
import { resolveMoment, type Moment } from './pillars.js';
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
  born?: string;
  bornTime?: string;
  bornTz?: string;
  years?: string;
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
  --gender male|female   for \`bazi\`, where the luck cycles need it, and for
                         the 行年 of \`chart --born\`. In both it is read for
                         the traditional rule and for nothing else

Narrowing a scan
  --until YYYY-MM-DD     the end of the interval; --date opens it
  --for opening|meeting|wealth|documents|concealment|pursuit|ending|dispute
                         the errand, which stands for a gate and says which
  --gate, --star, --spirit, --stem   by identifier, e.g. kaimen, tianxin
  --towards n,ne,e,se,s,sw,w,nw      one or more; the centre faces none
  --min-strength wang|xiang|xiu|qiu|si   the weakest state admitted
  --without id,id        configurations that rule a palace out, e.g. kongwang
  --born YYYY-MM-DD      only the palaces the 本命 stands on — the year pillar
                         of that birth, on either plate. The other criteria
                         say what makes a palace worth standing in; this one
                         says which palaces are the person's
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
  --born, with --prompt  the 年命 travels inside the prompt with the chart,
                         and the prompt says what it is not: not a chart of a
                         birth, and no palace standing for a part of a life

Placing a birth in the chart (年命)
  --born YYYY-MM-DD      for \`chart\`: look the birth up inside the chart —
                         本命, the year pillar of the birth, and with --gender
                         also 行年, the year being lived. The chart stays the
                         chart of its own moment: this is the classical
                         direction, and it is not a chart of a birth
  --born-time HH:mm      default: 12:00. It bears on nothing but a birth
                         within hours of 立春, where it decides the year
  --born-tz IANA-zone    default: the chart's zone, for the same reason
  --years sui|turns      how the years are counted for 行年: 虛歲, counting
                         the year of the birth itself, or the turns of the
                         year pillar. Default: sui, which is the count the
                         rule was written for

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
    // them: the interval closes where the day after `--until` opens, so the
    // named day is scanned whole. Falling back to the present hour, as a
    // single chart does, would open the interval wherever the command
    // happened to be typed.
    const opens = { ...input, time: options.time ?? '00:00' };
    const closes = { ...opens, time: '00:00', date: dayAfter(options.until) };
    const runs = scanCharts(opens, closes, place, chartOptions, context);
    const criteria = resolveCriteria(options, t);
    // 本命 as a criterion like the others, which is what 《遁甲演義》 asks a
    // scan for: the hours in which the person's own year stands somewhere
    // worth standing. It narrows the palaces; what makes one worth standing
    // in is the rest of the criteria, set by whoever is asking.
    if (options.born) {
      criteria.benming = birthMoment(options, chartOptions, context).pillars.year;
    }
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
      throw new UsageError(t('cli.error.unknownValue', { option: '--gender', value: gender }));
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
  // The birth is looked up inside the chart, which does not move: 年命 is the
  // classical direction, and the chart stays the chart of its own moment.
  const nianming = options.born
    ? placeBirth(options, chart, chartOptions, context, t)
    : undefined;
  if (options.json) {
    return JSON.stringify(nianming ? { ...chart, nianming } : chart, null, 2);
  }

  // A question asked is a question meant to be carried, so it turns the plain
  // printing into the prompt by itself: `--ask` without `--prompt` that
  // printed a chart and dropped the question would be a flag that did nothing.
  if (options.prompt || options.ask !== undefined) {
    return readingPrompt(moment, chart, t, {
      ...(options.ask !== undefined ? { question: options.ask } : {}),
      // A 年命 travels inside the prompt's fence when one was asked for: it
      // is part of the chart that was laid, not a remark about it.
      ...(nianming ? { nianming } : {}),
    });
  }
  return [chartTranscript(moment, chart, t), ...(nianming ? ['', formatNianming(nianming, t)] : [])]
    .join('\n');
}

/**
 * The moment a birth was, resolved with the chart's own options.
 *
 * The pillars a birth is read for are the same pillars: a year that turned at
 * 立春 for the chart turned at 立春 for the birth. What is not shared is the
 * instant — the hour of the birth is nobody's business here, only its year.
 */
function birthMoment(
  options: Options,
  chartOptions: ChartOptions,
  context: EphemerisContext,
): Moment {
  const born = {
    date: options.born as string,
    // Noon, so that a date given alone lands in the middle of its day. It
    // decides nothing but a birth within hours of 立春, and there the hour
    // has to be given.
    time: options.bornTime ?? '12:00',
    timezone: options.bornTz ?? options.timezone ?? systemTimezone(),
  };
  return resolveMoment(born, resolvePlace(options, born), chartOptions, context);
}

/**
 * Resolves the birth and places it on the chart.
 *
 * The birth is resolved with the chart's own options, because the pillars it
 * is read for are the same pillars — a year that turned at 立春 for the chart
 * turned at 立春 for the birth. What it does not share is the moment: the
 * hour of the birth is nobody's here, only its year.
 */
function placeBirth(
  options: Options,
  chart: QimenChart,
  chartOptions: ChartOptions,
  context: EphemerisContext,
  t: ReturnType<typeof createTranslator>,
): Nianming {
  if (options.years !== undefined && options.years !== 'sui' && options.years !== 'turns') {
    throw new UsageError(t('cli.error.unknownValue', { option: '--years', value: options.years }));
  }
  const nianmingOptions: NianmingOptions = { count: (options.years as 'sui' | 'turns') ?? 'sui' };

  const gender = options.gender as Gender | undefined;
  if (gender && gender !== 'male' && gender !== 'female') {
    throw new UsageError(t('cli.error.unknownValue', { option: '--gender', value: gender }));
  }

  const birth = birthMoment(
    { ...options, bornTz: options.bornTz ?? chart.moment.input.timezone },
    chartOptions,
    context,
  );
  return nianmingOf(
    chart,
    {
      birthYear: birth.pillars.year,
      // 行年 needs the direction of the count as much as the count itself,
      // and there is no reading of the rule that does without it.
      ...(gender
        ? { years: yearsLived(birth, chart.moment, nianmingOptions), gender }
        : {}),
    },
    nianmingOptions,
  );
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

/** The civil day after an ISO date. Set, not constructed: `Date.UTC` reads a
 * year under 100 as one under 2000, and the engine admits any year. */
function dayAfter(date: string): string {
  // The shape the engine itself asks of a date, checked here so that what a
  // mistyped `--until` is refused by is the value typed, not its arithmetic.
  const parts = /^(-?\d{4,})-(\d{2})-(\d{2})$/.exec(date);
  if (!parts) throw new ChartError('INVALID_DATE', { date });
  const [year, month, day] = parts.slice(1).map(Number) as [number, number, number];
  const next = new Date(0);
  next.setUTCFullYear(year, month - 1, day + 1);
  const sign = next.getUTCFullYear() < 0 ? '-' : '';
  return [
    sign + String(Math.abs(next.getUTCFullYear())).padStart(4, '0'),
    String(next.getUTCMonth() + 1).padStart(2, '0'),
    String(next.getUTCDate()).padStart(2, '0'),
  ].join('-');
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
  // The full list of ten, not either dun's eight: a scan crosses terms, and
  // 白虎 is unaskable for half the charts of the year on the yang list alone.
  const spirit = one<SpiritId>(options.spirit, SPIRIT_IDS, '--spirit');
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
  '--born': 'born',
  '--born-time': 'bornTime',
  '--born-tz': 'bornTz',
  '--years': 'years',
};

function parse(argv: string[]): { command?: Command; options: Options } {
  const options: Options = { json: false, help: false, prompt: false };
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
