import type { Translator } from '@shipan/i18n';
import type { Bazi } from './bazi/index.js';
import type { QimenChart } from './dunjia/index.js';
import {
  formatBazi,
  formatLiuren,
  formatMoment,
  formatNianming,
  formatQimenChart,
  formatQizheng,
  formatZiwei,
  formatTaiyi,
  formatWarnings,
} from './format.js';
import type { LiurenBoard } from './liuren.js';
import type { Nianming } from './nianming.js';
import type { Moment } from './pillars.js';
import type { QizhengBoard } from './qizheng.js';
import type { TaiyiBoard } from './taiyi.js';
import type { ZiweiBoard } from './ziwei/index.js';

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
 *
 * **There are six boards and there is one in a prompt.** Not because a reader
 * could not hold two, but because a model given two will merge them into a
 * verdict no text licenses, and — worse — will read their agreement as
 * corroboration when they overlap. And five of the six overlap everywhere:
 * the chart and the 六壬 board share the day pillar, the decade, the void
 * branches and seven of the eight spirits; the twelve palaces of a 七政四餘
 * board *are* the ring the 六壬 generals are seated on, and the twelve seats
 * of a 紫微斗數 board are laid against that ring too, with their 四化 taken off
 * the year stem and their 五行局 cut by a 納音; and a 八字 is the four pillars
 * every one of the other four is laid from. Where two agree it is
 * frequently one fact printed twice. So the functions below never meet: a
 * consultation takes one instrument, and comparing instruments happens where
 * nothing is being asked. The rule is `docs/readings.md`; the decisions are
 * `docs/history/` phases 14 and 18.
 *
 * **This paragraph counts, so a board that lands makes it wrong.** It said
 * five while there were six, having been written when there were four, and
 * the number is what the argument rests on rather than a detail beside it.
 *
 * **太乙 overlaps none of them, and the rule holds for it anyway.** Its subject
 * is a year and it shares not one quantity with the other five, so the
 * duplicate-fact argument does not reach it — what does reach it is the first
 * half: a model handed a board of a year beside a board of a person will read
 * the year onto the person, which is the whole of what `prompt.taiyi.notPersonal`
 * exists to forbid, and putting the two in one fence would be this file
 * inviting it.
 *
 * **Three kinds, not two.** A board of 卜 is cast for a question and the prompt
 * ends on the line that introduces one. A board of 命 is laid on a birth,
 * nothing is asked of it, and the prompt ends on what to do with it instead —
 * which is also why `MingReadingRequest` has no `question` field to leave
 * empty. A board of 天 — 太乙, and it is the only one — is laid on a year,
 * nothing is asked of it either, and its subject is nobody: it ends on its own
 * closing, and the thing it has to be stopped from becoming is not a verdict
 * but a forecast. See `docs/history/` phase 21.
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
 *
 * **The almanac's officer is the one thing left out**, and it is left out here
 * rather than at one of the three callers precisely to keep that invariant:
 * the officer is a function of the month branch and the day branch, both
 * printed a few lines below it, so inside a fence it is one datum wearing two
 * names and a model reads the second as confirming the first. The surfaces
 * that are *addresses* print it beside this block instead — the page does,
 * under the pillars, and the CLI does with `formatAlmanac`. See
 * `docs/history/` phase 15.
 */
export function chartTranscript(
  moment: Moment,
  chart: QimenChart,
  t: Translator,
  extra: { source?: string; nianming?: Nianming } = {},
): string {
  const warnings = formatWarnings(moment, t);
  return [
    formatMoment(moment, t, { almanac: false }),
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

/**
 * What is being asked of a Liu Ren board.
 *
 * The same as a chart's, less the 年命. A birth is not offered with this board
 * and the omission is structural rather than cautious: the person asking is
 * already in it. The first course stands on the day stem, which *is* them, and
 * the third on the day branch, which is the matter or the other party. A 本命
 * laid beside that would be a second name for one person, and two names for
 * one person is how a reading acquires a relation that was never there.
 */
export interface LiurenReadingRequest {
  source?: string;
  /** As `ReadingRequest.question`, including the empty string. */
  question?: string;
}

/**
 * The board said in full: the instant, its pillars, the plate, the courses,
 * the transmissions and the rule that drew them.
 *
 * One rendering, as the chart has one, so that what somebody pastes is what
 * they were looking at.
 */
export function liurenTranscript(
  moment: Moment,
  board: LiurenBoard,
  t: Translator,
  extra: { source?: string } = {},
): string {
  const warnings = formatWarnings(moment, t);
  return [
    formatMoment(moment, t, { almanac: false }),
    '',
    formatLiuren(board, t),
    ...(warnings ? ['', warnings] : []),
    ...(extra.source ? ['', `  ${t('prompt.source', { url: extra.source })}`] : []),
  ].join('\n');
}

/** The board, the instructions for reading it, and what it is being read for. */
export function liurenReadingPrompt(
  moment: Moment,
  board: LiurenBoard,
  t: Translator,
  request: LiurenReadingRequest = {},
): string {
  const aim =
    request.question === undefined
      ? t('prompt.liuren.noQuestion')
      : `${t('prompt.asked')}\n${request.question}`;

  return [
    `# ${t('prompt.liuren.heading')}`,
    '',
    t('prompt.liuren.role'),
    '',
    t('prompt.language'),
    '',
    // First, because it is the one thing about this board a model will get
    // wrong by helpfulness: the transmissions are the output of a procedure
    // and not something to be re-derived or reordered. Said and bounded in
    // the same breath — what the board hands over is a sequence, not the
    // answer to a question it was never told.
    `- ${t('prompt.liuren.drawn')}`,
    `- ${t('prompt.liuren.yongshen')}`,
    `- ${t('prompt.tooLittle')}`,
    `- ${t('prompt.liuren.noScore')}`,
    `- ${t('prompt.liuren.keti')}`,
    `- ${t('prompt.yours')}`,
    // Only where the rule that drew this board is one nothing could check.
    ...(board.unverified ? [`- ${t('prompt.liuren.unverified')}`] : []),
    '',
    t('prompt.whatToAsk'),
    '',
    t('prompt.names'),
    '',
    t('prompt.disclaimer'),
    '',
    `## ${t('prompt.liuren.board')}`,
    '',
    '```',
    liurenTranscript(moment, board, t, request.source ? { source: request.source } : {}),
    '```',
    '',
    aim,
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

/**
 * What is being asked of a board of 命, which is nothing.
 *
 * There is no `question`, and the absence is the design rather than a field
 * nobody got round to. A board of 卜 is cast *for* a question and cannot be
 * read without one being chosen; a board of 命 is laid on a birth and stands
 * whether anybody asks anything or not. The themes a reading traverses are
 * commissioned in the prompt itself, and what the reader wants to look at
 * next belongs to the conversation that follows. See `CLAUDE.md` and
 * `docs/history/` phases 18 and 19.
 */
export interface MingReadingRequest {
  /** Where the board can be seen again, if the caller knows an address. */
  source?: string;
}

/**
 * The 七政四餘 board said in full: the instant, its pillars, the eleven bodies
 * with their lodges and degrees, the 命宮 and the twelve seats.
 *
 * One rendering, as the other five have one, so that what somebody pastes is
 * what they were looking at. The almanac's officer is left out for the reason
 * `chartTranscript` leaves it out, and it bites harder here: this board prints
 * a lodge against every body, and the almanac's 值日宿 is a lodge of another
 * kind entirely — the day's place in a cycle of twenty-eight, not anything's
 * position in the sky. Two unlike things under one word, inside one fence, is
 * a confusion a model has no way to catch.
 */
export function qizhengTranscript(
  moment: Moment,
  board: QizhengBoard,
  t: Translator,
  extra: { source?: string } = {},
): string {
  const warnings = formatWarnings(moment, t);
  return [
    formatMoment(moment, t, { almanac: false }),
    '',
    formatQizheng(board, t),
    ...(warnings ? ['', warnings] : []),
    ...(extra.source ? ['', `  ${t('prompt.source', { url: extra.source })}`] : []),
  ].join('\n');
}

/**
 * The 太乙 board of a year said in full.
 *
 * The shortest transcript here, and it takes no `Moment`: this board is a
 * function of a year and there is no instant, no place and no set of pillars
 * under it. Phase 20 shipped it without a prompt beside it, on the ground that
 * what such a board would be handed over *for* had not been designed; phase 21
 * designed it, and `taiyiReadingPrompt` is below.
 *
 * **The two standing lines are inside this fence and not around it.** The
 * numbering one seat off the 洛書 and the account of how this board is checked
 * both come out of `formatTaiyi`, so every surface that prints the transcript
 * carries them without having to remember to. The prompt states the numbering
 * a second time among its rules, because there it is not a caption on the data
 * but an instruction governing how every position below is read.
 */
export function taiyiTranscript(
  board: TaiyiBoard,
  t: Translator,
  extra: { source?: string } = {},
): string {
  return [
    formatTaiyi(board, t),
    ...(extra.source ? ['', `  ${t('prompt.source', { url: extra.source })}`] : []),
  ].join('\n');
}

/**
 * What is being asked of a 太乙 board, which is nothing and for a third reason.
 *
 * Not `MingReadingRequest`, although the two fields are identical today. A
 * board of 命 has no question because it is laid on a person and stands whether
 * anybody asks anything or not; this one has no question because **there is
 * nobody to ask on behalf of**. Its subject is a year and the reader is not in
 * it. Folding the two types together would put one name on two reasons, and the
 * day either grows a field it would grow the wrong one.
 */
export interface TaiyiReadingRequest {
  /** Where the board can be seen again, if the caller knows an address. */
  source?: string;
  /**
   * **The matter being looked at** — and it is not a question.
   *
   * The distinction is the whole of why this board can be handed over at all.
   * A question asks what will happen and puts the person asking inside a figure
   * they are not in, which is what `prompt.taiyi.notPersonal` refuses. A matter
   * names a *field of view* — two organisations, two sides of a negotiation, a
   * domain with parties in it — and it is what the assignment of 主 and 客 has
   * to be made **for**. `prompt.taiyi.hostguest` has always said the choice is
   * made «for the matter being looked at»; until this field existed it named
   * something the callers structurally could not supply, and the reading came
   * back a description of a figure with no subject.
   *
   * Three cases, as `ReadingRequest.question` has three and for the same
   * reason:
   *
   * - `undefined` — none was given. The prompt reads the figure and says so.
   * - a string — the matter, written where it belongs.
   * - `''` — a matter exists and the caller is keeping it. The prompt ends on
   *   the line that introduces it, for the caller to append.
   *
   * The empty string is what the web surface passes. A matter is somebody's own
   * — the merger they are watching, the dispute they are in — and one in a query
   * string is one written into every access log between the browser and the
   * server. Same rule as the question, same reason.
   */
  matter?: string;
}

/**
 * The board, the instructions for reading it, and the year it is laid on.
 *
 * **The only prompt here without a `Moment`**, matching `taiyiTranscript`: a
 * 年計 board is a function of a year and there is no instant, no place and no
 * set of pillars under it. Nobody's data enters it, which is what lets the
 * endpoint that serves this be cached in public — the first prompt on this site
 * that can be.
 *
 * The register it commissions is **descriptive and never predictive**, and that
 * is the design phase 20 said was missing rather than a bound bolted onto one
 * that already existed. Two things it has to stop, and they pull in opposite
 * directions: the received doctrine, which is dynastic and dated and would
 * arrive as commentary on real events that nobody can falsify
 * (`prompt.taiyi.noDoctrine`); and the reader, who is not on this board at all
 * and whom a model will otherwise put there (`prompt.taiyi.notPersonal`) — the
 * natal-Qimen error arriving in a new register. What is left between them is the
 * figure of a year, said as a figure.
 *
 * **主 and 客 are chosen here and nowhere upstream.** The engine names two
 * counts and stops, exactly as it names nine palaces and chooses no 用神; the
 * prompt says so, commissions the choice, and requires it signed. That is the
 * one interpretive act this board cannot be read without, and moving it into
 * the engine would be answering the question this project does not ask.
 */
export function taiyiReadingPrompt(
  board: TaiyiBoard,
  t: Translator,
  request: TaiyiReadingRequest = {},
): string {
  /** Whether there is something for the figure to be read *about*. */
  const about = request.matter !== undefined;

  return [
    `# ${t('prompt.taiyi.heading')}`,
    '',
    t('prompt.taiyi.role'),
    '',
    t('prompt.language'),
    '',
    // The subject first, as under both boards of 命 and for the same reason:
    // bounds with nothing above them read as an instruction to say nothing.
    // Here it does a second job — it says what the subject is *not*, which on
    // this board is where a reader is likeliest to be put wrongly.
    `- ${t('prompt.taiyi.subject')}`,
    // The matter, straight after the subject and before the assignment it is
    // the ground of. Only where there is one: a rule naming a thing that is not
    // in the message is how this prompt read as a caption in the first place.
    ...(about ? [`- ${t('prompt.taiyi.matter')}`] : []),
    // Nothing below means anything until the two parties are named. It is this
    // board's 用神, and it is the one rule here that turns on whether a matter
    // arrived: with one the assignment is commissioned, without one there is
    // nothing to make it *for*, and the prompt says so rather than sending a
    // model to invent a pair of parties.
    `- ${t(about ? 'prompt.taiyi.hostguest' : 'prompt.taiyi.hostguestNoMatter')}`,
    // Before the counts and the conditions, since both are read off positions
    // and a model carrying a chart's numbering across reads all eight one seat
    // wrong with nothing anywhere to contradict it.
    `- ${t('prompt.taiyi.palaces')}`,
    `- ${t('prompt.taiyi.counts')}`,
    `- ${t('prompt.taiyi.conditions')}`,
    // The two refusals, and they are the load-bearing pair.
    `- ${t('prompt.taiyi.noDoctrine')}`,
    `- ${t('prompt.taiyi.notPersonal')}`,
    `- ${t('prompt.ming.noRecital')}`,
    `- ${t('prompt.ming.explain')}`,
    `- ${t('prompt.taiyi.register')}`,
    // Last of the bounds and about all of them, as under the boards of 命: a
    // rule kept by being obeyed never has to be announced.
    `- ${t('prompt.ming.rulesStayOut')}`,
    `- ${t('prompt.yours')}`,
    '',
    t('prompt.names'),
    '',
    t('prompt.disclaimer'),
    '',
    `## ${t('prompt.taiyi.board')}`,
    '',
    '```',
    taiyiTranscript(board, t, request.source ? { source: request.source } : {}),
    '```',
    '',
    ...taiyiClosing(t, about),
    // The matter last, where a board of 卜 puts the question and for the same
    // reason: a newline and nothing after it is the caller saying it will
    // append. It is outside the fence, because it is the one thing here that is
    // not data.
    ...(about ? ['', `${t('prompt.taiyi.about')}\n${request.matter}`] : []),
  ].join('\n');
}

/**
 * How a reading of a board of 天 is laid out, said after the fence.
 *
 * The shape `mingClosing` has and not the contents, and the difference is the
 * fourth step. There the themes are **themes of a life** and are titled for one;
 * here they are **parts of a figure** and are titled for one, because a section
 * titled for a part of the world — the economy, a war, a country — is the
 * dynastic reading arriving under a heading, which is precisely what the rule
 * above the fence spent a paragraph refusing.
 *
 * **The first step turns on whether there is a matter**, and that is the one
 * place the two readings genuinely part. With one, the sections bear on it and
 * the reply is *about* something. Without one, they describe a figure — which
 * is honest and is what the first cut of this prompt produced throughout: a
 * precise account of a board that never answers «and so?».
 */
function taiyiClosing(t: Translator, about: boolean): string[] {
  return [
    t(about ? 'prompt.taiyi.forMatter' : 'prompt.taiyi.noQuestion'),
    '',
    t('prompt.taiyi.opening'),
    '',
    t('prompt.taiyi.panorama'),
    '',
    t('prompt.taiyi.sections'),
    '',
    t('prompt.taiyi.read'),
    '',
    t('prompt.taiyi.invite'),
  ];
}

/** The board, the instructions for reading it, and what it is laid on. */
export function qizhengReadingPrompt(
  moment: Moment,
  board: QizhengBoard,
  t: Translator,
  request: MingReadingRequest = {},
): string {
  return [
    `# ${t('prompt.qizheng.heading')}`,
    '',
    t('prompt.qizheng.role'),
    '',
    t('prompt.language'),
    '',
    // The subject first: everything under it is a bound or a place to look,
    // and a list of bounds with nothing above it reads as an instruction to
    // say nothing.
    `- ${t('prompt.ming.configuration')}`,
    `- ${t('prompt.qizheng.houses')}`,
    `- ${t('prompt.ming.time')}`,
    `- ${t('prompt.qizheng.remainders')}`,
    `- ${t('prompt.qizheng.noScore')}`,
    `- ${t('prompt.ming.limits')}`,
    `- ${t('prompt.ming.noRecital')}`,
    `- ${t('prompt.ming.explain')}`,
    `- ${t('prompt.ming.register')}`,
    // What to do with a relation of control, where every other rule here
    // only says what not to do with one.
    `- ${t('prompt.ming.tension')}`,
    // Last of the bounds and about all of them: a rule kept by being obeyed
    // never has to be announced, and announcing them is how a reading turns
    // into a page of preamble.
    `- ${t('prompt.ming.rulesStayOut')}`,
    `- ${t('prompt.yours')}`,
    // How sure, said among the rules rather than in a document: the direction
    // the twelve are numbered in is the weakest quantity on this board, and
    // the frame the lodges are cut by is the one thing here that no runnable
    // reference covers. A model that recites neither will read both as fact.
    `- ${t('prompt.qizheng.direction')}`,
    `- ${t('prompt.qizheng.frame')}`,
    '',
    t('prompt.names'),
    '',
    t('prompt.disclaimer'),
    '',
    `## ${t('prompt.qizheng.board')}`,
    '',
    '```',
    qizhengTranscript(moment, board, t, request.source ? { source: request.source } : {}),
    '```',
    '',
    // Where a board of 卜 ends on the question, this ends on the shape of the
    // answer.
    ...mingClosing(t, 'qizheng'),
  ].join('\n');
}

/**
 * A 紫微斗數 board said in full: the birth, the lunar date it is counted on,
 * the bureau, and the twelve seats with what was counted into each.
 *
 * The almanac's line is left out for the reason it is left out of a 八字 —
 * this is the moment read as a person — and here for a second reason as well:
 * 曆注's 值日宿 is a lodge of the sky, and this board has no sky to confuse it
 * with.
 */
export function ziweiTranscript(
  moment: Moment,
  board: ZiweiBoard,
  t: Translator,
  extra: { source?: string } = {},
): string {
  const warnings = formatWarnings(moment, t);
  return [
    formatMoment(moment, t, { almanac: false }),
    '',
    formatZiwei(board, t),
    ...(warnings ? ['', warnings] : []),
    ...(extra.source ? ['', `  ${t('prompt.source', { url: extra.source })}`] : []),
  ].join('\n');
}

/**
 * The twelve seats, the instructions for reading them, and the birth they
 * were counted from.
 *
 * The rule that leads is the one the other two boards of 命 never needed:
 * **nothing here is in the sky.** A model handed twelve palaces on twelve
 * branches, with stars in them, will reach for planets unless the first thing
 * it reads forbids it — and a reading built on that reach would be fluent,
 * confident and about a different art.
 */
export function ziweiReadingPrompt(
  moment: Moment,
  board: ZiweiBoard,
  t: Translator,
  request: MingReadingRequest = {},
): string {
  return [
    `# ${t('prompt.ziwei.heading')}`,
    '',
    t('prompt.ziwei.role'),
    '',
    t('prompt.language'),
    '',
    `- ${t('prompt.ming.configuration')}`,
    `- ${t('prompt.ziwei.houses')}`,
    `- ${t('prompt.ming.time')}`,
    `- ${t('prompt.ziwei.brightness')}`,
    `- ${t('prompt.ziwei.sihua')}`,
    `- ${t('prompt.ziwei.limits')}`,
    // The one-board rule, and it is stated on this board rather than left to
    // the documentation because this is the board it bites hardest on: the
    // year stem that carries the 四化 here carries the ten gods there.
    `- ${t('prompt.ziwei.substrate')}`,
    `- ${t('prompt.ming.limits')}`,
    `- ${t('prompt.ming.noRecital')}`,
    `- ${t('prompt.ming.explain')}`,
    `- ${t('prompt.ming.register')}`,
    `- ${t('prompt.ming.tension')}`,
    `- ${t('prompt.ming.rulesStayOut')}`,
    `- ${t('prompt.yours')}`,
    '',
    t('prompt.names'),
    '',
    t('prompt.disclaimer'),
    '',
    `## ${t('prompt.ziwei.board')}`,
    '',
    '```',
    ziweiTranscript(moment, board, t, request.source ? { source: request.source } : {}),
    '```',
    '',
    ...mingClosing(t, 'ziwei'),
  ].join('\n');
}

/**
 * How a reading of a board of 命 is laid out, said after the fence.
 *
 * Everything above this is a bound or a place to look, and what follows from
 * bounds alone is a technical description addressed to somebody who did not
 * need one. These six are the other half, in the order the reply is written:
 * that no question was asked and none is needed, the birth situated in the
 * model's own words, the board read whole from a centre, the themes of a life
 * in short sections, the inspection list those sections draw on, and an
 * opening for whatever the reader wants to ask next.
 *
 * The situating and the inspection list are per board because the boards
 * differ — a 八字 is a birth written in a calendar and a 七政四餘 board is a
 * birth written in the sky; the rest is shared.
 */
function mingClosing(t: Translator, board: 'bazi' | 'qizheng' | 'ziwei'): string[] {
  return [
    t('prompt.ming.noQuestion'),
    '',
    t(`prompt.${board}.opening` as const),
    '',
    t('prompt.ming.panorama'),
    '',
    t('prompt.ming.sections'),
    '',
    t(`prompt.${board}.read` as const),
    '',
    t('prompt.ming.invite'),
  ];
}

/**
 * The 八字 said in full: the instant, the four pillars, the day master, the
 * void branches, the gods and concealed stems of each pillar, and the decade
 * luck where a direction was given for it.
 *
 * `formatMoment` prints the four pillars and `formatBazi` follows it with what
 * is read *off* them — which is how the CLI prints a birth and why the second
 * block does not repeat the first in words.
 */
export function baziTranscript(
  moment: Moment,
  bazi: Bazi,
  t: Translator,
  extra: { source?: string } = {},
): string {
  const warnings = formatWarnings(moment, t);
  return [
    formatMoment(moment, t, { almanac: false }),
    '',
    formatBazi(bazi, t),
    ...(warnings ? ['', warnings] : []),
    ...(extra.source ? ['', `  ${t('prompt.source', { url: extra.source })}`] : []),
  ].join('\n');
}

/** The pillars, the instructions for reading them, and what they are laid on. */
export function baziReadingPrompt(
  moment: Moment,
  bazi: Bazi,
  t: Translator,
  request: MingReadingRequest = {},
): string {
  return [
    `# ${t('prompt.bazi.heading')}`,
    '',
    t('prompt.bazi.role'),
    '',
    t('prompt.language'),
    '',
    // The subject first, for the reason it is first on the 七政四餘 board:
    // what follows are bounds and places to look, and bounds alone are read
    // as an instruction to withhold.
    `- ${t('prompt.ming.configuration')}`,
    `- ${t('prompt.bazi.yongshen')}`,
    `- ${t('prompt.ming.time')}`,
    `- ${t('prompt.bazi.gods')}`,
    `- ${t('prompt.bazi.stages')}`,
    // Only where a direction was given for the cycles, since without one they
    // are absent from the transcript and the rule would name nothing.
    ...(bazi.luck ? [`- ${t('prompt.bazi.luck')}`] : []),
    `- ${t('prompt.bazi.distribution')}`,
    `- ${t('prompt.bazi.noScore')}`,
    `- ${t('prompt.ming.limits')}`,
    `- ${t('prompt.ming.noRecital')}`,
    `- ${t('prompt.ming.explain')}`,
    `- ${t('prompt.ming.register')}`,
    // What to do with a relation of control, where every other rule here
    // only says what not to do with one.
    `- ${t('prompt.ming.tension')}`,
    // Last of the bounds and about all of them: a rule kept by being obeyed
    // never has to be announced, and announcing them is how a reading turns
    // into a page of preamble.
    `- ${t('prompt.ming.rulesStayOut')}`,
    `- ${t('prompt.yours')}`,
    '',
    t('prompt.names'),
    '',
    t('prompt.disclaimer'),
    '',
    `## ${t('prompt.bazi.board')}`,
    '',
    '```',
    baziTranscript(moment, bazi, t, request.source ? { source: request.source } : {}),
    '```',
    '',
    ...mingClosing(t, 'bazi'),
  ].join('\n');
}
