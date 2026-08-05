import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  chartLabels,
  computeBazi,
  computeQimenChart,
  formatBazi,
  formatMoment,
  formatQimenChart,
  formatSolarTerms,
  formatWarnings,
  lunarDate,
  sayGanzhi,
  solarTermsOfYear,
  systemTimezone,
} from '@qimendunjia/core';
import { searchLocations } from '@qimendunjia/geo';
import { renderChartSvg } from '@qimendunjia/plate';
import { z } from 'zod';
import {
  dateSchema,
  describeError,
  ephemerisOf,
  fail,
  langSchema,
  ok,
  optionSchema,
  placeSchema,
  resolveInput,
  timeSchema,
  translatorFor,
  type ToolContext,
} from './shared.js';

/**
 * Looking a place up is a step of its own, on purpose.
 *
 * Choosing among the dozens of places called Rome produces a chart that looks
 * right and is wrong, and nothing downstream can detect it. So the engine
 * never geocodes: an agent asks here, shows what came back, and passes an
 * identifier on.
 */
export function registerSearchLocation(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'search_location',
    {
      title: 'Search for a place',
      description:
        'Finds a place by name and returns its coordinates and IANA timezone. ' +
        'CALL THIS BEFORE compute_qimen_chart or compute_bazi whenever you have a place name ' +
        'rather than coordinates you already know: do not invent a latitude, a longitude or a ' +
        'timezone. Many names are ambiguous — there are dozens of places called Rome — so if ' +
        'more than one candidate is plausible, ask the person which they mean instead of taking ' +
        'the most populous. Then pass location_id on.',
      inputSchema: {
        query: z.string().min(1).describe('Place name. Exonyms work: "Peking" finds 北京.'),
        country_code: z
          .string()
          .length(2)
          .optional()
          .describe('Narrows the search to one country, ISO 3166-1 alpha-2, e.g. "CN".'),
        limit: z.number().int().min(1).max(50).optional().describe('Maximum candidates. Default 10.'),
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const options: Parameters<typeof searchLocations>[1] = { lang: t.locale };
        if (context.databasePath) options.databasePath = context.databasePath;
        if (args.country_code) options.countryCode = args.country_code;
        if (args.limit !== undefined) options.limit = args.limit;

        const results = searchLocations(args.query, options);
        if (results.length === 0) {
          return ok(
            `No place found for "${args.query}".\n\n` +
              'The dataset covers populated places above five hundred inhabitants, plus every ' +
              'administrative seat whatever its size. Worth trying: the local spelling, the ' +
              'name of the municipality rather than the hamlet, or a larger place nearby.',
          );
        }

        const lines = results.map(
          (place) =>
            `${place.id}  ${[place.name, place.region, place.country].filter(Boolean).join(', ')}` +
            `  ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}  ${place.timezone}` +
            (place.population > 0 ? `  pop ${place.population.toLocaleString('en')}` : ''),
        );

        return ok(
          `${results.length} candidate${results.length === 1 ? '' : 's'} for "${args.query}".\n` +
            'The first column is location_id.\n\n' +
            lines.join('\n'),
        );
      } catch (error) {
        return fail(describeError(error, t));
      }
    },
  );
}

export function registerComputeQimenChart(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'compute_qimen_chart',
    {
      title: 'Cast a Qi Men Dun Jia chart',
      description:
        'Casts the nine palaces for a moment: the dun and the ju, the earth and heaven plates, ' +
        'the nine stars, the eight gates, the eight spirits, and the configurations the chart ' +
        'has fallen into. ' +
        'Returns arrangements only. It reports that a gate stands over a palace whose element ' +
        'it controls; whether that is a good thing to know is not in the output and is not the ' +
        "server's to say — if the person wants a reading, that is yours to give and yours to own. " +
        'For the present moment OMIT date and time: the server supplies them, and you do not ' +
        'know the current date. Give the place with location_id from search_location, or with ' +
        'latitude + longitude + timezone together. ' +
        'The chart is cast by the chaibu method; other schools lay out other charts from the ' +
        'same instant, and the answer says so.',
      inputSchema: {
        date: dateSchema,
        time: timeSchema,
        ...placeSchema,
        ...optionSchema,
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const { moment, label } = resolveInput(args, context);
        const chart = computeQimenChart(moment, moment.options);

        return ok(
          [
            `${t('cli.field.place')}: ${label}`,
            '',
            formatMoment(moment, t),
            '',
            formatQimenChart(chart, t),
            formatWarnings(moment, t),
          ]
            .filter((part) => part !== '')
            .join('\n'),
        );
      } catch (error) {
        return fail(describeError(error, t));
      }
    },
  );
}

export function registerComputeBazi(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'compute_bazi',
    {
      title: 'Compute the Four Pillars',
      description:
        'Computes the four pillars of an instant and reads them out: the stems each branch ' +
        'conceals, how each stands to the day master, the image of each pair, where the day ' +
        'master falls among the twelve stages, and the void branches. ' +
        'Returns relations, never judgements. ' +
        'Give date and time AS THEY ARE WRITTEN on the birth record, in local clock time; the ' +
        'conversion to Universal Time happens here, with the historical rules of the zone. Do ' +
        'not convert it yourself, and do not guess an unknown birth time — ask. ' +
        'gender is needed only for the decade luck cycles, whose direction the tradition takes ' +
        'from it; without it the pillars are still complete and the cycles are left out.',
      inputSchema: {
        date: dateSchema,
        time: timeSchema,
        ...placeSchema,
        gender: z
          .enum(['male', 'female'])
          .optional()
          .describe('Only the direction of the luck cycles depends on it. Do not guess it.'),
        cycles: z.number().int().min(1).max(12).optional().describe('How many decades. Default 8.'),
        ...optionSchema,
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const { moment, label } = resolveInput(args, context);
        const options: Parameters<typeof computeBazi>[1] = {};
        if (args.gender) options.gender = args.gender;
        if (args.cycles !== undefined) options.cycles = args.cycles;

        const bazi = computeBazi(moment, options, ephemerisOf(context));

        return ok(
          [
            `${t('cli.field.place')}: ${label}`,
            '',
            formatMoment(moment, t),
            '',
            formatBazi(bazi, t),
            args.gender ? '' : `\n  ${t('cli.error.genderRequired')}`,
            formatWarnings(moment, t),
          ]
            .filter((part) => part !== '')
            .join('\n'),
        );
      } catch (error) {
        return fail(describeError(error, t));
      }
    },
  );
}

export function registerSolarTerms(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'solar_terms',
    {
      title: 'The twenty-four solar terms of a year',
      description:
        'Lists the twenty-four solar terms of a year with the exact instant each begins, as ' +
        'read in a timezone. The terms are what the year and month pillars turn on, and what ' +
        'fixes the ju, so this is the tool for questions about when a month or a year changes. ' +
        'The zone matters: a term beginning at 00:30 in Shanghai began the previous evening in ' +
        'Rome, and the two calendars date it to different days.',
      inputSchema: {
        year: z.number().int().min(1800).max(2399).describe('Gregorian year. Ephemerides cover 1800-2399.'),
        timezone: z
          .string()
          .optional()
          .describe('IANA identifier the instants are read in. Default: the server\'s zone.'),
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const timezone = args.timezone ?? systemTimezone();
        const terms = solarTermsOfYear(args.year, timezone, ephemerisOf(context));
        return ok(`${timezone}\n\n${formatSolarTerms(terms, args.year, timezone, t)}`);
      } catch (error) {
        return fail(describeError(error, t));
      }
    },
  );
}

export function registerLunarDate(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'lunar_date',
    {
      title: 'The lunar date of a moment',
      description:
        'Gives the Chinese lunisolar date of an instant: the year, the month, whether that ' +
        'month is the intercalary repetition, and the day. ' +
        'The calendar is reckoned on 120°E by convention, not on the timezone you pass: it is ' +
        'a published artefact, so the same instant carries the same lunar date in Rome and in ' +
        'Beijing. The timezone only says which instant you mean.',
      inputSchema: {
        date: dateSchema,
        time: timeSchema,
        timezone: z.string().optional().describe('IANA identifier of the clock the date is read on.'),
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const { moment } = resolveInput(args, context);
        const lunar = lunarDate(moment.julianDayUT, ephemerisOf(context));
        const leap = lunar.leap ? `${t('cli.value.leapMonth')} ` : '';

        return ok(
          [
            formatMoment(moment, t),
            '',
            `${t('cli.heading.calendar')}`,
            `  ${lunar.year} · ${leap}${lunar.month}/${lunar.day}`,
            formatWarnings(moment, t),
          ]
            .filter((part) => part !== '')
            .join('\n'),
        );
      } catch (error) {
        return fail(describeError(error, t));
      }
    },
  );
}

export function registerDrawQimenChart(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'draw_qimen_chart',
    {
      title: 'Draw a Qi Men chart',
      description:
        'Renders a chart as an SVG picture of the nine palaces, south at the top as the ' +
        'tradition draws it. ' +
        'CALL THIS AFTER compute_qimen_chart, not instead of it: a picture carries the glyphs ' +
        'but not the warnings, and not the note about which method cast it. Show the person ' +
        'both, or show them the data alone.',
      inputSchema: {
        date: dateSchema,
        time: timeSchema,
        ...placeSchema,
        ...optionSchema,
        size: z.number().int().min(240).max(2048).optional().describe('Side in pixels. Default 640.'),
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const { moment } = resolveInput(args, context);
        const chart = computeQimenChart(moment, moment.options);
        const labels = chartLabels(t);
        const PILLARS = [
          moment.pillars.year,
          moment.pillars.month,
          moment.pillars.day,
          moment.pillars.hour,
        ]
          .map((pair) => sayGanzhi(pair, t))
          // A visible separator, not spaces: SVG collapses runs of whitespace,
          // so four pillars set three spaces apart arrive as one long phrase.
          .join(' / ');

        const svg = renderChartSvg(chart, {
          size: args.size ?? 640,
          // The palaces are written in words. The data the agent reads comes
          // from compute_qimen_chart and carries the hanzi alongside.
          labels,
          captions: {
            ju: `${chart.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun')} ${chart.ju.number}`,
            pillars: PILLARS,
            chief: `${t('cli.field.chief')} ${labels.star[chart.chief.star.id]}`,
            chiefGate: `${t('cli.field.chiefGate')} ${labels.gate[chart.chiefGate.gate.id]}`,
          },
        });

        return ok(svg);
      } catch (error) {
        return fail(describeError(error, t));
      }
    },
  );
}
