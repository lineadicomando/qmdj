import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  DEFAULT_LIUREN_OPTIONS,
  DEFAULT_QIZHENG_OPTIONS,
  DEFAULT_ZIWEI_OPTIONS,
  DEFAULT_TAIYI_OPTIONS,
  GATES,
  PATTERN_IDS,
  SPIRIT_IDS,
  STARS,
  STEMS,
  chartLabels,
  computeBazi,
  computeQimenChart,
  formatBazi,
  formatLiuren,
  formatMoment,
  formatNianming,
  formatQimenChart,
  formatQizheng,
  formatZiwei,
  computeZiwei,
  formatScan,
  formatSolarTerms,
  formatTaiyi,
  formatWarnings,
  liurenBoard,
  liurenLabels,
  lunarDate,
  matchRuns,
  qizhengBoard,
  sayGanzhi,
  scanCharts,
  solarTermsOfYear,
  systemTimezone,
  taiyiBoard,
  type LiurenOptions,
  type QizhengOptions,
  type ZiweiOptions,
  type ScanCriteria,
} from '@qimendunjia/core';
import { searchLocations } from '@qimendunjia/geo';
import { renderChartSvg, renderLiurenSvg } from '@qimendunjia/plate';
import { z } from 'zod';
import {
  birthSchema,
  dateSchema,
  describeError,
  ephemerisOf,
  fail,
  langSchema,
  ok,
  optionSchema,
  placeSchema,
  resolveBirth,
  resolveInput,
  resolveNianming,
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
            `${t('search.none', { query: args.query })}\n\n${t('search.coverage')}`,
          );
        }

        const lines = results.map(
          (place) =>
            `${place.id}  ${[place.name, place.region, place.country].filter(Boolean).join(', ')}` +
            `  ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}  ${place.timezone}` +
            (place.population > 0 ? `  pop ${place.population.toLocaleString('en')}` : ''),
        );

        const heading =
          results.length === 1
            ? t('search.candidate', { query: args.query })
            : t('search.candidates', { count: results.length, query: args.query });

        return ok(`${heading}\n${t('search.column')}\n\n${lines.join('\n')}`);
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
        'the nine stars, the eight gates, the eight spirits, the configurations the chart ' +
        'has fallen into, how each star and gate stands to the palace it rests in, and the ' +
        'post horse of the day and of the hour. ' +
        'Both horses come back, never one: 日馬 and 時馬 are two things the tradition names ' +
        'apart, and which of them bears on a question is the reader\'s to decide. ' +
        'Returns arrangements only, each with the fortune its name is transmitted with: 門迫 ' +
        'comes back as an oppressed gate marked xiong, because oppression is what the sources ' +
        'call it, not because the server has weighed the hour. Read that fortune as a property ' +
        'of the arrangement and of nothing else. It does not rank the palaces, it does not make ' +
        'one hour better than another, and a chart holding four xiong configurations is not a ' +
        "bad time to do anything — that judgement is not in the output and is not the server's " +
        'to make. If the person wants a reading, it is yours to give and yours to own. ' +
        'For the present moment OMIT date and time: the server supplies them, and you do not ' +
        'know the current date. Give the place with location_id from search_location, or with ' +
        'latitude + longitude + timezone together, or with a location_id and coordinates both — ' +
        'which refines it, the coordinates replacing the ones GeoNames holds while the zone ' +
        'stays the named place\'s. Refine only with coordinates somebody gave you: do not ' +
        'invent a pair to sharpen a town you were told the name of. ' +
        'The chart is cast by the chaibu method unless method says otherwise; zhirun is the ' +
        'other one implemented, the two are different schools, and the answer says which one ' +
        'cast it. Inside chaibu, yuan says whether the third of the term is counted from the ' +
        'term or from the day\'s futou — two schools again, and they disagree on most days. ' +
        'Pass born, and gender for the 行年, to place a 年命 in the chart: a birth looked up ' +
        'inside the chart of the moment, which is the classical direction and comes from ' +
        '《遁甲演義》. It is not a chart of a birth. The answer says which palaces the two pairs ' +
        'fell in and what stands there, and nothing about what that means for a life: ' +
        'no palace here stands for a part of one, and that mapping is not the server\'s to ' +
        'supply. If you use one, say whose it is.',
      inputSchema: {
        date: dateSchema,
        time: timeSchema,
        ...placeSchema,
        ...birthSchema,
        ...optionSchema,
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const { moment, label } = resolveInput(args, context);
        const chart = computeQimenChart(moment, moment.options);
        // 年命, when a birth was given: two pairs looked up in the chart that
        // was just laid. The chart is not recast for it.
        const nianming = resolveNianming(args, chart, context);

        return ok(
          [
            `${t('cli.field.place')}: ${label}`,
            '',
            formatMoment(moment, t),
            '',
            formatQimenChart(chart, t),
            nianming ? `\n${formatNianming(nianming, t)}` : '',
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

export function registerComputeLiuren(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'compute_liuren',
    {
      title: 'Lay the 大六壬 board',
      description:
        'Lays the Da Liu Ren board for an instant: the 天地盤 turned by setting the general of ' +
        'the month (月將) on the palace of the hour, the four lessons (四課) read off the ' +
        "stem's lodging and the day branch, the three transmissions (三傳) drawn from them by " +
        'the nine rules (九宗門), the twelve generals laid from the noble, and the hidden stem ' +
        'and void state of each transmission. ' +
        'Liu Ren is the sibling of Qi Men inside the 三式 and answers the same shape of ' +
        'question: one asked now, read from the board the asking fell on. Lay it for the ' +
        'instant of the question, not for a birth. ' +
        'It reports which rule drew the transmissions and what the arrangement is called, and ' +
        'nothing beyond that. It does not choose the 用神, rank the transmissions, date an ' +
        'outcome or advise; those need a question to have been asked and belong to the reader. ' +
        'A board drawn by 返吟 says so: that rule rests on a clause no reference implementation ' +
        'covers.',
      inputSchema: {
        date: dateSchema,
        time: timeSchema,
        ...placeSchema,
        guiren: z
          .enum(['chou', 'wei'])
          .optional()
          .describe(
            'Which verse seats the 貴人. It moves the twelve generals and never the three ' +
              'transmissions. Default chou.',
          ),
        ...optionSchema,
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const { moment, label } = resolveInput(args, context);
        const options: LiurenOptions = { ...DEFAULT_LIUREN_OPTIONS };
        if (args.guiren) options.guiren = args.guiren;

        const board = liurenBoard(
          { term: moment.solarTerm.term, day: moment.pillars.day, hour: moment.hourBranch },
          options,
        );

        return ok(
          [
            `${t('cli.field.place')}: ${label}`,
            '',
            formatMoment(moment, t),
            '',
            formatLiuren(board, t),
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

export function registerComputeQizheng(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'compute_qizheng',
    {
      title: 'Lay the 七政四餘 board',
      description:
        'Places the seven governors (七政: 太陽 太陰 水星 金星 火星 木星 土星) and the ' +
        'remainders (四餘) for an instant, from the ephemeris rather than from any cycle. ' +
        'Each is reported twice over, in the two frames the board holds at once: the lodge ' +
        '(宿) it falls in with the degrees past that lodge’s determinative star (入宿度), and ' +
        'the palace of the twelve (次) with the degrees into it (宮度). It also reports 順 or ' +
        '逆 from the daily motion, the 命宮 by 立命加時, and the twelve 人事宮 numbered from ' +
        'it. ' +
        'Unlike Qi Men and Liu Ren this is a 命 art, so it is laid for a birth as readily as ' +
        'for a question — but it is its own board and borrows nothing from theirs. ' +
        'Three things to state when reporting it. **The board carries three remainders, not ' +
        'four**: 紫氣 is transmitted as a rule without an epoch, so it is omitted rather than ' +
        'invented. **羅睺 is the descending node here, not the ascending one** — the ' +
        'astrologers’ law, which is the reverse of the Indian convention and of the 時憲曆’s; ' +
        '計都 takes the other. **The lodge boundaries are the determinative stars themselves**, ' +
        'placed at this instant with precession in them, so no table of 宿度 and no epoch ' +
        'enters — and correspondingly nothing published can be held against them. ' +
        'It names what the tradition names and stops. It does not read the 化曜 or the 十神, ' +
        'weigh a 度主, rank a palace or say what a placement means for a life; those need a ' +
        'question to have been asked and belong to the reader.',
      inputSchema: {
        date: dateSchema,
        time: timeSchema,
        ...placeSchema,
        luohou: z
          .enum(['descending', 'ascending'])
          .optional()
          .describe(
            'Which node bears the name 羅睺, the other taking 計都. Default descending, ' +
              'which is the astrologers’ law rather than the calendar office’s.',
          ),
        ...optionSchema,
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const { moment, label } = resolveInput(args, context);
        const options: QizhengOptions = { ...DEFAULT_QIZHENG_OPTIONS };
        if (args.luohou) options.luohou = args.luohou;

        const board = qizhengBoard(
          { julianDay: moment.julianDayUT, hour: moment.hourBranch },
          options,
          ephemerisOf(context),
        );

        return ok(
          [
            `${t('cli.field.place')}: ${label}`,
            '',
            formatMoment(moment, t),
            '',
            formatQizheng(board, t),
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

export function registerComputeZiwei(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'compute_ziwei',
    {
      title: 'Lay the 紫微斗數 board of a birth',
      description:
        'Counts the twelve seats of a 紫微斗數 board from a birth, placing 紫微 and the ' +
        'thirteen that hang off it, the auxiliaries, the 四化, the two masters, the 大限, the ' +
        '小限 and the rings of 長生 and 博士. ' +
        '**Nothing on this board is in the sky, and a report that treats it as a sky is about ' +
        'a different art.** 紫微 is not a star a telescope finds; none of these names is a ' +
        'body, none has a position, none rises or sets. The board is arithmetic: the month ' +
        'and hour give the 命宮, its 納音 gives the bureau, the bureau and the day of the ' +
        'lunar month give 紫微, and the rest follows by counting. No ephemeris is consulted. ' +
        'Do not import planets, aspects, transits or a house system, and do not translate it ' +
        'into one to read it. ' +
        'Every placement is 《紫微斗數全書》 卷二, and four of its tables part from the ones ' +
        'modern software carries — say so if you report those four. **火星 and 鈴星 take a ' +
        'seat apiece from the year’s triplicity and the birth hour never enters**, where the ' +
        'widespread practice counts on from those seats by the hour. **天魁 and 天鉞 go to 亥 ' +
        'and 戌 for 丙 and 丁** (「丙丁豬狗位」), where the modern verse reads 豬雞; and 辛 ' +
        'takes 寅 then 午. **解神 is placed off the birth year**, not off the month. **壬 ' +
        'gives 化科 to 天府**, not to 左輔. ' +
        'gender is needed only for the 大限, the 小限 and the two rings; without it the seats ' +
        'are complete and those four are absent, which is the right answer and not a degraded ' +
        'one. Do not guess it. ' +
        'It reports where the seats fall and what the book grades them. It does not say what a ' +
        'seat means, which palace matters, or how a life goes: that a seat is named 妻妾 is a ' +
        'name and not an assignment, and a 落陷 is not a misfortune. Those need a question to ' +
        'have been asked and belong to the reader.',
      inputSchema: {
        date: dateSchema,
        time: timeSchema,
        ...placeSchema,
        gender: z
          .enum(['male', 'female'])
          .optional()
          .describe(
            'Only the 大限, the 小限 and the rings of 長生 and 博士 depend on it. Do not guess it.',
          ),
        ...optionSchema,
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const { moment, label } = resolveInput(args, context);
        const options: ZiweiOptions = { ...DEFAULT_ZIWEI_OPTIONS };
        if (args.gender) options.gender = args.gender;

        const board = computeZiwei(moment, options);

        return ok(
          [
            `${t('cli.field.place')}: ${label}`,
            '',
            // The almanac's line stays out, as it does under 八字: this is the
            // moment read as a person.
            formatMoment(moment, t, { almanac: false }),
            '',
            formatZiwei(board, t),
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

export function registerComputeTaiyi(server: McpServer): void {
  server.registerTool(
    'compute_taiyi',
    {
      title: 'Lay the 太乙 board of a year',
      description:
        'Lays the 太乙神數 board of a year in the 年計, the register of the year, from ' +
        '《太乙金鏡式經》 (王希明, 唐, c. 730). It places 太乙 itself, which walks eight ' +
        'palaces and never the centre (太乙不入中宮) at three years a palace; the two eyes — ' +
        '文昌 the lower, 始擊 the upper; 計神 and 合神; the 主算 and 客算 counted from the ' +
        'two eyes; the 大將 and 參將 each count seats; the 八門直使; the 三基 (君基 臣基 ' +
        '民基), 五福, and 大遊. It also names the conditions 卷三 states — 掩 擊 迫 囚 關 ' +
        '格 對 — each with the fortune that chapter gives it. ' +
        'The input is a year and nothing else: no place, no hour, nobody’s birth. This board ' +
        'is 太乙主天 and its subject is the year the world is standing in, which is why it is ' +
        'the one board here that holds nobody’s data. ' +
        'Three things to state when reporting it. **The nine palaces are not numbered as a Qi ' +
        'Men chart numbers them**: 卷二 says 九宮皆差一位, so 一宮 is the north-west here ' +
        'and the north there, and every number is one seat off the 洛書. **It never says who ' +
        'is 主 and who is 客** — identifying host and guest is the first interpretive act the ' +
        'system asks for, and it is the reader’s, exactly as choosing a 用神 is. **It is ' +
        'checked against the text itself and not against any independent implementation**, ' +
        'because none exists: 卷三 prints a 立成 of seventy-two rows twice over and 卷一, 卷 ' +
        '六 and 卷九 work individual boards, which is the tradition auditing itself and is ' +
        'weaker evidence than a second program would be. ' +
        'The received readings of this board are dynastic — which state falls, which year an ' +
        'army breaks — and are not here. It names positions and numbers and stops.',
      inputSchema: {
        year: z
          .number()
          .int()
          .describe(
            'The year the board is laid on, counted from 立春 as the pillars are. ' +
              'Astronomical numbering, so 1 BCE is 0.',
          ),
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const board = taiyiBoard({ year: args.year }, DEFAULT_TAIYI_OPTIONS);
        return ok(formatTaiyi(board, t));
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
        'tradition draws it, framed by the eight directions and the twelve branches so that ' +
        'the picture says which way it faces. Every name on it is said aloud in a band ' +
        'underneath, so it can be read by somebody who does not read Chinese. ' +
        'CALL THIS AFTER compute_qimen_chart, not instead of it: a picture carries the glyphs ' +
        'and their readings but not the warnings, and not the note about which method cast it. ' +
        'Show the person both, or show them the data alone.',
      inputSchema: {
        date: dateSchema,
        time: timeSchema,
        ...placeSchema,
        ...optionSchema,
        size: z.number().int().min(240).max(2048).optional().describe('Side in pixels. Default 900.'),
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
          // The word and the name it renders, as everywhere else on the board.
          .map((pair) => `${sayGanzhi(pair, t)} ${pair.hanzi}`)
          // A visible separator, not spaces: SVG collapses runs of whitespace,
          // so four pillars set three spaces apart arrive as one long phrase.
          .join(' / ');

        const svg = renderChartSvg(chart, {
          size: args.size ?? 900,
          // The palaces are written in words, each beside the name it
          // renders — the same drawing the web surface serves.
          labels,
          // And the frame of directions around it, for the same reason: the
          // answer to "which way" is half of what a chart is asked for.
          compass: labels.direction,
          captions: {
            ju: `${chart.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun')} ${chart.ju.number}`,
            pillars: PILLARS,
            chief: `${t('cli.field.chief')} ${labels.star[chart.chief.star.id]} ${chart.chief.star.hanzi}`,
            chiefGate: `${t('cli.field.chiefGate')} ${labels.gate[chart.chiefGate.gate.id]} ${chart.chiefGate.gate.hanzi}`,
            // The band under the grid. A palace has room for a configuration's
            // name and not for its fortune, and 伏吟 and 反吟 have no palace at
            // all — without this the picture is silent about both.
            configurations: t('cli.heading.patterns'),
            // And the band under that, where every name is said aloud. A model
            // has no use for a reading and the person it hands the picture to
            // does: this is the one output here that leaves for a screen
            // nobody controls, with no table beside it to look a glyph up in.
            readings: t('cli.heading.readings'),
          },
        });

        return ok(svg);
      } catch (error) {
        return fail(describeError(error, t));
      }
    },
  );
}

export function registerDrawLiuren(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'draw_liuren',
    {
      title: 'Draw a 大六壬 board',
      description:
        'Renders a Liu Ren board as an SVG: a ring of twelve rather than a grid of nine, with ' +
        'each palace of the 地盤 carrying the general above it and the 天盤 branch over its own ' +
        'ground, the four lessons written right to left, and the three transmissions read ' +
        'downwards. ' +
        'Every name on it is said aloud in a band underneath, so the picture can be read by ' +
        'somebody who does not read Chinese. ' +
        'CALL THIS AFTER compute_liuren, not instead of it: a picture carries the glyphs and ' +
        'their readings but not the warnings, and not the rule that drew the transmissions in ' +
        'words. Show the person both, or show them the data alone.',
      inputSchema: {
        date: dateSchema,
        time: timeSchema,
        ...placeSchema,
        guiren: z.enum(['chou', 'wei']).optional().describe('Which verse seats the 貴人.'),
        ...optionSchema,
        size: z.number().int().min(240).max(2048).optional().describe('Side in pixels. Default 900.'),
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        const { moment } = resolveInput(args, context);
        const options: LiurenOptions = { ...DEFAULT_LIUREN_OPTIONS };
        if (args.guiren) options.guiren = args.guiren;

        const board = liurenBoard(
          { term: moment.solarTerm.term, day: moment.pillars.day, hour: moment.hourBranch },
          options,
        );

        return ok(
          renderLiurenSvg(board, {
            size: args.size ?? 900,
            labels: liurenLabels(t),
            heading:
              `${sayGanzhi(board.day, t)} ${board.day.hanzi} · ${board.hour.hanzi} · ` +
              `${t('cli.field.yuejiang')} ${board.yuejiang.hanzi} ${board.yuejiang.branch.hanzi}`,
            // The names said aloud under the ring, as on the chart's plate and
            // for the same reason: whoever is shown this picture is being shown
            // twelve branches and twelve generals with no table beside them.
            readings: t('cli.heading.readings'),
          }),
        );
      } catch (error) {
        return fail(describeError(error, t));
      }
    },
  );
}

/**
 * Choosing a time, which is the oldest thing the art was used for.
 *
 * The other tools answer *what stands now*. This one answers *when, in a
 * stretch of days, does something stand — and which way is it*. The direction
 * is half the answer and is never dropped: an interval does not hold a good
 * hour, it holds an hour in which something stands to the southeast.
 */
export function registerScanMoments(server: McpServer, context: ToolContext): void {
  const ids = (entries: readonly { id: string }[]): [string, ...string[]] =>
    entries.map((entry) => entry.id) as [string, ...string[]];

  server.registerTool(
    'scan_moments',
    {
      title: 'Scan an interval for the charts standing over it',
      description:
        'Walks an interval and reports every chart that stands over part of it, narrowed to the ' +
        'palaces answering what you asked for. Use it when someone wants to CHOOSE a time — ' +
        'when to sign, to travel, to ask — rather than to read one. ' +
        'Give from and to as dates; both are required, and the interval cannot exceed a year. ' +
        'Narrow it with gate, star, spirit, stem, towards, min_strength and without. Naming ' +
        'nothing returns every palace of every hour, which is a great deal of output and rarely ' +
        'what is wanted. ' +
        'Each answer carries the direction of the palace, and the direction is half of it: report ' +
        'both the hour and the way to face, never the hour alone. ' +
        'It ranks nothing and recommends nothing. There is no score in the output and no order ' +
        'but time, because a palace answering a question is a fact and a palace being a good ' +
        'place to be is a reading — yours to make if the person wants one, and yours to own. ' +
        'An empty answer means the arrangement did not occur in that interval; say so plainly ' +
        'rather than loosening the question and presenting the result as what was asked. ' +
        'Which gate suits which undertaking is NOT in this server: that mapping varies by ' +
        'school, and the engine takes no position on it. If you supply one, say it is yours. ' +
        'Call compute_qimen_chart for the whole board of any hour this returns.',
      inputSchema: {
        from: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('First day of the interval, YYYY-MM-DD, local at the place. Required.'),
        to: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('Day the interval ends, exclusive. Required.'),
        gate: z.enum(ids(GATES)).optional().describe('One of the eight gates, e.g. kaimen 開門.'),
        star: z.enum(ids(STARS)).optional().describe('One of the nine stars, e.g. tianxin 天心.'),
        spirit: z
          .enum(SPIRIT_IDS as unknown as [string, ...string[]])
          .optional()
          .describe(
            'One of the spirits. A chart shows eight, but which eight depends on the dun: gouchen and zhuque stand in a yang chart, baihu and xuanwu in a yin one.',
          ),
        stem: z.enum(ids(STEMS)).optional().describe('A stem on either plate of the palace.'),
        towards: z
          .array(z.enum(['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']))
          .optional()
          .describe('Directions the palace may face. The centre faces none and never answers.'),
        min_strength: z
          .enum(['wang', 'xiang', 'xiu', 'qiu', 'si'])
          .optional()
          .describe(
            'The weakest seasonal state admitted, strongest first (旺相休囚死). Filters the star and the gate of the palace.',
          ),
        without: z
          .array(z.enum(PATTERN_IDS as unknown as [string, ...string[]]))
          .optional()
          .describe(
            'Configurations that rule a palace out — or the whole hour, for fuyin and fanyin, which belong to the board.',
          ),
        born: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe(
            'Date of birth. Admits only the palaces the 本命 stands on — the year pillar of that birth, on either plate — which is the criterion 《遁甲演義》 asks a scan for. The other criteria say what makes a palace worth standing in; this one says which palaces are that person\'s. It reports no verdict about them.',
          ),
        born_time: z
          .string()
          .regex(/^\d{2}:\d{2}(:\d{2})?$/)
          .optional()
          .describe('Clock time of the birth. Default noon; it decides the year pillar only for a birth within hours of 立春.'),
        born_timezone: z
          .string()
          .optional()
          .describe('IANA zone of the birth. Default the interval\'s own.'),
        ...placeSchema,
        ...optionSchema,
        lang: langSchema,
      },
    },
    async (args) => {
      const t = translatorFor(args.lang);
      try {
        // The place and the options are resolved by the same code every other
        // tool uses; only the interval is this tool's own.
        const { moment, place, label } = resolveInput({ ...args, date: args.from, time: '00:00' }, context);
        const zone = moment.input.timezone;

        const runs = scanCharts(
          { date: args.from, time: '00:00', timezone: zone },
          { date: args.to, time: '00:00', timezone: zone },
          place,
          moment.options,
          ephemerisOf(context),
        );

        const criteria: ScanCriteria = {};
        if (args.gate) criteria.gate = args.gate as ScanCriteria['gate'];
        if (args.star) criteria.star = args.star as ScanCriteria['star'];
        if (args.spirit) criteria.spirit = args.spirit as ScanCriteria['spirit'];
        if (args.stem) criteria.stem = args.stem as ScanCriteria['stem'];
        if (args.towards?.length) criteria.directions = args.towards;
        if (args.min_strength) criteria.minStrength = args.min_strength;
        if (args.without?.length) criteria.excludes = args.without as ScanCriteria['excludes'];
        if (args.born) {
          // The same resolution the chart tool's 年命 uses: the birth's own
          // zone wins over the interval's place, and the birth is read on the
          // clock, not the sun. Resolving it like the interval would let a
          // `location_id` zone, or the solar correction, move a birth near
          // 立春 across it — and admit another year's palaces.
          criteria.benming = resolveBirth(args, zone, moment.options, context).pillars.year;
        }

        const matches = matchRuns(runs, criteria);

        return ok(
          [
            `${t('cli.field.place')}: ${label}`,
            t('cli.heading.scan', { from: args.from, to: args.to }),
            '',
            formatScan(matches, t),
          ].join('\n'),
        );
      } catch (error) {
        return fail(describeError(error, t));
      }
    },
  );
}
