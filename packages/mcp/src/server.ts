import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GATES, PALACES, SOLAR_TERMS, SPIRITS_YANG, SPIRITS_YIN, STARS } from '@qimendunjia/core';
import {
  registerComputeBazi,
  registerComputeQimenChart,
  registerDrawQimenChart,
  registerLunarDate,
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
        'The server returns arrangements and relations only. It will tell you that a gate ' +
        'stands over a palace whose element it controls, and it will not tell you what that ' +
        'means. Interpretation, if the person asks for one, is yours — and so is the ' +
        'responsibility for it. ' +
        'Charts are cast by the chaibu method; the zhirun and maoshan methods are not ' +
        'implemented and are refused rather than silently substituted, because a chart cast by ' +
        'the wrong method looks right and is not.',
    },
  );

  registerSearchLocation(server, context);
  registerComputeQimenChart(server, context);
  registerComputeBazi(server, context);
  registerDrawQimenChart(server, context);
  registerSolarTerms(server, context);
  registerLunarDate(server, context);
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
        `| ${palace.number} | ${palace.hanzi} ${palace.id} | ${palace.element} | ${palace.direction ?? '—'} |`,
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
    ...GATES.map((gate) => `| ${gate.hanzi} ${gate.id} | ${gate.home} |`),
    '',
    '## The nine stars',
    '',
    '| Star | Home |',
    '|---|---|',
    ...STARS.map((star) => `| ${star.hanzi} ${star.id} | ${star.home} |`),
    '',
    '## The eight spirits',
    '',
    'The fifth and sixth differ between the halves of the year in the convention',
    'this engine follows.',
    '',
    `- yang dun: ${SPIRITS_YANG.map((spirit) => spirit.hanzi).join(' ')}`,
    `- yin dun: ${SPIRITS_YIN.map((spirit) => spirit.hanzi).join(' ')}`,
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
        `| ${term.hanzi} ${term.id} | ${term.longitude}° | ${term.kind} | ${term.monthBranch ?? '—'} |`,
    ),
  ].join('\n');
}
