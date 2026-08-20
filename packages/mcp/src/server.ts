import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  GATES,
  PALACES,
  PURPOSES,
  SOLAR_TERMS,
  SPIRITS_YANG,
  SPIRITS_YIN,
  STARS,
} from '@qimendunjia/core';
import { createTranslator, type MessageKey } from '@qimendunjia/i18n';
import {
  registerComputeBazi,
  registerComputeLiuren,
  registerComputeQimenChart,
  registerComputeQizheng,
  registerComputeZiwei,
  registerComputeTaiyi,
  registerDrawLiuren,
  registerDrawQimenChart,
  registerLunarDate,
  registerScanMoments,
  registerSearchLocation,
  registerSolarTerms,
} from './tools.js';
import type { ToolContext } from './shared.js';

export const SERVER_NAME = 'qimendunjia';
export const SERVER_VERSION = '0.0.0';

/**
 * Builds the MCP server.
 *
 * The instructions are the only thing a client always sees, so they carry the
 * two facts that keep an agent from producing something plausible and wrong:
 * a place is looked up rather than guessed, and the current date comes from
 * the server rather than from the model.
 */
export function createServer(context: ToolContext = {}): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        'Casts Qi Men Dun Jia charts and computes the Four Pillars. ' +
        'The usual flow: search_location to turn a place name into a location_id, then ' +
        'compute_qimen_chart or compute_bazi. Dates and times are given in local clock time, ' +
        'as they were read on a clock at the place; the conversion happens here. ' +
        'For the present moment omit date and time entirely — the server knows the current ' +
        'date and you do not. ' +
        'To SHOW a chart rather than read it there is draw_qimen_chart, which is called after ' +
        'compute_qimen_chart and never instead of it: a picture carries the glyphs but not the ' +
        'warnings. ' +
        'To CHOOSE a time rather than read one there is scan_moments, which walks an interval ' +
        'and reports where in it a thing stands. Its answers carry a direction as well as an ' +
        'hour, and the direction is half of the answer: never report the hour alone. ' +
        'The server returns arrangements and relations only. It will tell you that a gate ' +
        'stands over a palace whose element it controls, and it will not tell you what that ' +
        'means. Interpretation, if the person asks for one, is yours — and so is the ' +
        'responsibility for it. ' +
        'Charts are cast by the chaibu method unless the method parameter chooses zhirun; the ' +
        'two are different schools and lay out different charts from the same instant, so never ' +
        'switch method between charts you are comparing. maoshan is not implemented and is ' +
        'refused rather than silently substituted, because a chart cast by the wrong method ' +
        'looks right and is not.',
    },
  );

  registerSearchLocation(server, context);
  registerComputeQimenChart(server, context);
  registerComputeBazi(server, context);
  registerComputeLiuren(server, context);
  registerComputeQizheng(server, context);
  registerComputeZiwei(server, context);
  registerComputeTaiyi(server);
  registerDrawQimenChart(server, context);
  registerDrawLiuren(server, context);
  registerSolarTerms(server, context);
  registerLunarDate(server, context);
  registerScanMoments(server, context);
  registerReferences(server);

  return server;
}

/**
 * Reference material, loaded on request.
 *
 * It lives in resources rather than in the tool descriptions so that it costs
 * nothing in a conversation that only wants a chart. An agent reaches for it
 * when it has to explain or justify a name, not when it merely reports one.
 */
function registerReferences(server: McpServer): void {
  const resources: [string, string, string, () => string][] = [
    [
      'palaces',
      'The nine palaces',
      'The nine palaces with their Luoshu numbers, trigrams, phases and directions. Consult it to explain where something stands.',
      palaceReference,
    ],
    [
      'gates-stars-spirits',
      'Gates, stars and spirits',
      'The eight gates, the nine stars and the eight spirits, with the palace each belongs to at rest. Consult it to explain why a chart is said to have come home or turned about.',
      layerReference,
    ],
    [
      'solar-terms',
      'The twenty-four solar terms',
      'The terms with their solar longitudes, and which of them open a month. Consult it to explain why a month or a year pillar changed when it did.',
      termReference,
    ],
    [
      'purposes',
      'What each gate is chosen for',
      'The undertakings the tradition puts under each of the eight gates. Read it BEFORE scan_moments when somebody names an errand rather than an arrangement — the tool takes a gate, and this is what turns "I want to open a shop" into one. It is a reference and not a rule: the server does not apply it, you do, and you say that you did.',
      purposeReference,
    ],
  ];

  for (const [slug, title, description, render] of resources) {
    server.registerResource(
      slug,
      `qimendunjia://reference/${slug}`,
      { title, description, mimeType: 'text/markdown' },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: 'text/markdown', text: render() }],
      }),
    );
  }
}

function palaceReference(): string {
  return [
    '# The nine palaces',
    '',
    'A chart is drawn three by three with **south at the top**, as a Chinese map is.',
    'The centre has no direction, no gate and no spirit; what falls there is read at',
    'the palace of Kun.',
    '',
    '| Luoshu | Trigram | Phase | Direction |',
    '|---|---|---|---|',
    ...PALACES.map(
      (palace) =>
        `| ${palace.number} | ${palace.hanzi} ${palace.pinyin} \`${palace.id}\` | ${palace.element} | ${palace.direction ?? '—'} |`,
    ),
  ].join('\n');
}

function layerReference(): string {
  return [
    '# Gates, stars and spirits',
    '',
    'Each gate and star belongs to a palace when nothing has moved. That is what',
    'makes 伏吟 and 反吟 checkable: the board has come home when every one of them',
    'stands in its own palace, and turned about when every one stands in the palace',
    'facing it.',
    '',
    '## The eight gates',
    '',
    '| Gate | Home |',
    '|---|---|',
    ...GATES.map((gate) => `| ${gate.hanzi} ${gate.pinyin} \`${gate.id}\` | ${gate.home} |`),
    '',
    '## The nine stars',
    '',
    '| Star | Home |',
    '|---|---|',
    ...STARS.map((star) => `| ${star.hanzi} ${star.pinyin} \`${star.id}\` | ${star.home} |`),
    '',
    '## The eight spirits',
    '',
    'The fifth and sixth differ between the halves of the year in the convention',
    'this engine follows.',
    '',
    `- yang dun: ${SPIRITS_YANG.map((spirit) => `${spirit.hanzi} ${spirit.pinyin}`).join(' · ')}`,
    `- yin dun: ${SPIRITS_YIN.map((spirit) => `${spirit.hanzi} ${spirit.pinyin}`).join(' · ')}`,
  ].join('\n');
}

/**
 * The errands, as a document rather than as an argument of the tool.
 *
 * `scan_moments` deliberately takes the arrangement and never the errand.
 * Putting the mapping here instead of in the schema keeps the server from
 * applying a doctrine silently: an agent reads it, chooses, and is told to
 * say that the choice was its own.
 */
function purposeReference(): string {
  const t = createTranslator('en');
  const gateOf = (id: string): (typeof GATES)[number] =>
    GATES.find((gate) => gate.id === id) as (typeof GATES)[number];

  return [
    '# What each gate is chosen for',
    '',
    'The eight gates and the undertakings the transmitted lists put under them.',
    'Pass the gate to `scan_moments`; this table is how an errand becomes one.',
    '',
    '**Eight entries, because there are eight gates.** This is the gates read from',
    'the other side, not a list of good things to do — which is why 死門 and 傷門',
    'are here with their own uses. A gate being right for an errand is not the same',
    'as an hour being a good one, and this table says nothing about the second.',
    '',
    '**How sure this is**: transmitted from Chinese-language sources, with no',
    'runnable reference and no authority publishing the answer. It is shippable',
    'where the rest of the 用神 doctrine is not because three independent',
    'witnesses carry these domains and carry them alike — the Tang 《太乙金鏡式',
    '經》, an eight-line verse surviving in both the 道藏 and 《奇門遁甲統宗》,',
    'and the 統宗\'s own 八門所主. Each line below says what those say and stops:',
    'the modern manuals put more under several of these gates, and the surplus',
    'was cut. The stems as significators of people, the nine stars and the eight',
    'spirits are **not** here: there the schools genuinely diverge. If you supply a',
    'mapping from those, say plainly that it is yours and not this server\'s.',
    '',
    '| Errand | Gate |',
    '|---|---|',
    ...PURPOSES.map((purpose) => {
      const gate = gateOf(purpose.gate);
      return `| ${t(`label.purpose.${purpose.id}` as MessageKey)} | ${gate.hanzi} ${gate.pinyin} \`${gate.id}\` |`;
    }),
  ].join('\n');
}

function termReference(): string {
  return [
    '# The twenty-four solar terms',
    '',
    'A term begins at the instant the Sun reaches a longitude. The twelve marked',
    '`jie` open a month of the pillars; the twelve marked `qi` do not, and the lunar',
    'calendar counts those instead. Two different calendars read two different',
    'halves of one list.',
    '',
    '| Term | Longitude | Kind | Opens the month of |',
    '|---|---|---|---|',
    ...SOLAR_TERMS.map(
      (term) =>
        `| ${term.hanzi} ${term.pinyin} \`${term.id}\` | ${term.longitude}° | ${term.kind} | ${term.monthBranch ?? '—'} |`,
    ),
  ].join('\n');
}
