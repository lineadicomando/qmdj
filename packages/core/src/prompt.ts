import type { Translator } from '@qimendunjia/i18n';
import type { QimenChart } from './dunjia/index.js';
import { formatMoment, formatQimenChart, formatWarnings } from './format.js';
import type { Moment } from './pillars.js';

/**
 * The chart handed to somebody who will read it, with what they have to know.
 *
 * This engine computes a chart and refuses to read it, which is the rule it
 * is built on and not a missing feature. The consequence is that whoever
 * wants a reading takes the date to a model — and a model given a date and a
 * place casts the chart from memory and gets it wrong. A wrong chart read
 * well is the worst thing this project can produce, because nothing
 * downstream can catch it: it looks exactly like a right one.
 *
 * So the chart travels already computed, and the conditions travel with it.
 * `readingPrompt` is `docs/agent-prompt.md` said to a model that has no MCP
 * connection and no documentation — the 用神 is the reader's, the fortunes do
 * not add up to a score, a 凶 is not advice, and the reading belongs to
 * whoever gives it. Handing over the chart without that would be this
 * project outsourcing in one paragraph what it declines to do in code.
 *
 * It builds readable text from a `Translator`, exactly as `format.ts` does
 * and for the same reason: the surface chooses the language, the engine holds
 * no catalog and decides nothing about who is reading.
 */

export interface ReadingRequest {
  /** Where the chart can be seen again, if the caller knows an address. */
  source?: string;
  /**
   * The question, when the caller has it.
   *
   * Three cases, and the third is the one that needs saying:
   *
   * - `undefined` — nothing was asked. The prompt says so and tells the
   *   reader to describe the chart rather than invent a question for it.
   * - a string — the question, written where it belongs.
   * - `''` — a question exists and the caller is keeping it. The prompt ends
   *   on the line that introduces it, for the caller to append the text.
   *
   * The empty string is what the web surface passes, and it is not a
   * flourish: the question is somebody's own — *should I leave, will the
   * illness pass* — and putting it in a query string writes it into every
   * access log between the browser and the server. The frame is built here,
   * once, and the browser adds the one line that must not leave it.
   */
  question?: string;
}

/**
 * The chart said in full: the instant, its pillars, the nine palaces, the
 * configurations, and whatever the calculation wants known.
 *
 * What the CLI prints, what the interface offers to copy, and what goes
 * inside the prompt — one rendering, because three that drifted apart would
 * mean the text somebody pasted was not the chart they were looking at.
 */
export function chartTranscript(
  moment: Moment,
  chart: QimenChart,
  t: Translator,
  source?: string,
): string {
  const warnings = formatWarnings(moment, t);
  return [
    formatMoment(moment, t),
    '',
    formatQimenChart(chart, t),
    ...(warnings ? ['', warnings] : []),
    ...(source ? ['', `  ${t('prompt.source', { url: source })}`] : []),
  ].join('\n');
}

/** The chart, the instructions for reading it, and the question it is read for. */
export function readingPrompt(
  moment: Moment,
  chart: QimenChart,
  t: Translator,
  request: ReadingRequest = {},
): string {
  const asked =
    request.question === undefined
      ? t('prompt.noQuestion')
      : // A newline and nothing after it: the caller appends the question, and
        // an empty one is the caller saying it will.
        `${t('prompt.asked')}\n${request.question}`;

  return [
    `# ${t('prompt.heading')}`,
    '',
    t('prompt.role'),
    '',
    t('prompt.language'),
    '',
    `- ${t('prompt.yongshen')}`,
    // Straight after the 用神, because it is what that rule costs in practice:
    // a question arrives short, the palace cannot be chosen from it, and the
    // reader has to ask rather than read whatever the sentence suggested.
    `- ${t('prompt.tooLittle')}`,
    `- ${t('prompt.noScore')}`,
    `- ${t('prompt.noAdvice')}`,
    `- ${t('prompt.yours')}`,
    '',
    t('prompt.whatToAsk'),
    '',
    t('prompt.certainty'),
    '',
    t('prompt.names'),
    '',
    // Last of the instructions, immediately before the data: it is the one
    // the reading has to carry back out, and the last thing read before the
    // chart is the likeliest to survive into the answer.
    t('prompt.disclaimer'),
    '',
    `## ${t('prompt.chart')}`,
    '',
    // Fenced, so that the column alignment survives and so that the boundary
    // between what was computed and what is being asked is unmistakable:
    // everything in here is data, and none of it is an instruction.
    '```',
    chartTranscript(moment, chart, t, request.source),
    '```',
    '',
    asked,
  ].join('\n');
}
