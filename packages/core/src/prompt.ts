import type { Translator } from '@qimendunjia/i18n';
import type { QimenChart } from './dunjia/index.js';
import { formatMoment, formatNianming, formatQimenChart, formatWarnings } from './format.js';
import type { Nianming } from './nianming.js';
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

/**
 * What is being asked of the chart, and what came with it.
 *
 * There is one frame and it is divination: a chart is cast for a question, or
 * for an hour, and read as that. A chart cast on a birth and read as a chart
 * of a life was offered here once, as a frame with the method withheld — the
 * frame was all this project could honestly give, and a frame is not a
 * reading. What stands in its place is `nianming`, which is what the classical
 * texts do with a birth: they look it up inside the chart of the moment. See
 * `nianming.ts` and `docs/sources.md`.
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
   * - `''` — a question exists and the caller is keeping it. The prompt
   *   ends on the line that introduces it, for the caller to append it.
   *
   * The empty string is what the web surface passes, and it is not a
   * flourish: the question is somebody's own — *should I leave, will the
   * illness pass* — and putting it in a query string writes it into every
   * access log between the browser and the server. The frame is built
   * here, once, and the browser adds the line that must not leave it.
   */
  question?: string;
  /**
   * 年命 — a birth placed inside this chart, when one was asked for.
   *
   * It travels inside the fence with the chart, because it is computed like
   * the rest of it: two pairs and the palaces they fall in. What the prompt
   * adds around it is the one thing a model cannot check — that this is not a
   * chart of a birth, and that no palace here stands for a part of a life.
   */
  nianming?: Nianming;
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
  extra: { source?: string; nianming?: Nianming } = {},
): string {
  const warnings = formatWarnings(moment, t);
  return [
    formatMoment(moment, t),
    '',
    formatQimenChart(chart, t),
    // Inside the transcript and not beside it: a 年命 is placed *in* this
    // chart, and a reader who received the two apart could pair the wrong
    // birth with the wrong hour and never see it.
    ...(extra.nianming ? ['', formatNianming(extra.nianming, t)] : []),
    ...(warnings ? ['', warnings] : []),
    ...(extra.source ? ['', `  ${t('prompt.source', { url: extra.source })}`] : []),
  ].join('\n');
}

/** The chart, the instructions for reading it, and what it is being read for. */
export function readingPrompt(
  moment: Moment,
  chart: QimenChart,
  t: Translator,
  request: ReadingRequest = {},
): string {
  /**
   * What the reading is aimed at, which is the last thing said either way:
   * the question, or the plain statement that none was asked.
   */
  const aim =
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
    // Straight after the 用神, because it is what that rule costs in
    // practice: a question arrives short, the palace cannot be chosen
    // from it, and the reader has to ask rather than read whatever the
    // sentence suggested.
    `- ${t('prompt.tooLittle')}`,
    `- ${t('prompt.noScore')}`,
    `- ${t('prompt.noAdvice')}`,
    `- ${t('prompt.yours')}`,
    // Only when one is in the fence. Said as a rule among the rules, because
    // what it rules out — a palace standing for a part of a life — is what a
    // model has most of in its training data and least of in this chart.
    ...(request.nianming ? [`- ${t('prompt.nianming')}`] : []),
    '',
    t('prompt.whatToAsk'),
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
    chartTranscript(moment, chart, t, {
      ...(request.source ? { source: request.source } : {}),
      ...(request.nianming ? { nianming: request.nianming } : {}),
    }),
    '```',
    '',
    aim,
  ].join('\n');
}
