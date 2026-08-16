import { createTranslator } from '@qimendunjia/i18n';
import { beforeAll, describe, expect, it } from 'vitest';
import { computeQimenChart } from '../src/dunjia/index.js';
import { ganzhiOf } from '../src/ganzhi.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { resolveMoment, type Moment } from '../src/pillars.js';
import { nianmingOf } from '../src/nianming.js';
import {
  baziReadingPrompt,
  baziTranscript,
  chartTranscript,
  qizhengReadingPrompt,
  qizhengTranscript,
  readingPrompt,
  taiyiReadingPrompt,
  taiyiTranscript,
} from '../src/prompt.js';
import { computeBazi } from '../src/bazi/index.js';
import { qizhengBoard, DEFAULT_QIZHENG_OPTIONS } from '../src/qizheng.js';
import { taiyiBoard, DEFAULT_TAIYI_OPTIONS } from '../src/taiyi.js';
import { DEFAULT_OPTIONS, type Place } from '../src/types.js';

/**
 * What is asserted here is not the wording — that is a catalog and moves —
 * but the four things a prompt is wrong without: the chart is in it, the
 * question is in it, the rules that bound the reading are in it, and a
 * question nobody asked is reported as absent rather than filled in.
 */

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };

function moment(): Moment {
  return resolveMoment(
    { date: '2024-06-15', time: '14:00', timezone: 'Asia/Shanghai' },
    BEIJING,
    DEFAULT_OPTIONS,
    context,
  );
}

const en = createTranslator('en');

/** A birth of 庚午 placed in the chart above, with the year it is living. */
function placed() {
  const at = moment();
  return nianmingOf(
    computeQimenChart(at, DEFAULT_OPTIONS),
    { birthYear: ganzhiOf(6), years: 35, gender: 'male' },
    { count: 'sui' },
  );
}

describe('the transcript', () => {
  it('carries the instant, the ju and all nine palaces', () => {
    const at = moment();
    const text = chartTranscript(at, computeQimenChart(at, DEFAULT_OPTIONS), en);

    expect(text).toContain('2024-06-15T14:00:00+08:00');
    expect(text).toContain('yang dun');
    // Every palace by its glyph: a transcript missing one is a chart the
    // reader cannot check against the board.
    for (const palace of ['坎', '坤', '震', '巽', '中', '乾', '兌', '艮', '離']) {
      expect(text).toContain(palace);
    }
  });

  it('names where the chart can be seen again, and only when told', () => {
    const at = moment();
    const chart = computeQimenChart(at, DEFAULT_OPTIONS);

    expect(chartTranscript(at, chart, en)).not.toContain('http');
    expect(
      chartTranscript(at, chart, en, { source: 'https://example.org/en?date=2024-06-15' }),
    ).toContain('https://example.org/en?date=2024-06-15');
  });
});

describe('the prompt', () => {
  it('holds the chart inside a fence, and the rules outside it', () => {
    const at = moment();
    const text = readingPrompt(at, computeQimenChart(at, DEFAULT_OPTIONS), en, {
      question: 'Will the contract be signed?',
    });

    expect(text).toContain(chartTranscript(at, computeQimenChart(at, DEFAULT_OPTIONS), en));
    expect(text).toContain('```');
    expect(text).toContain('用神');
    expect(text).toContain('Do not rank the palaces');
    expect(text).toContain('Will the contract be signed?');
  });

  /**
   * A question arrives short — *will it go well* — and a palace cannot be
   * chosen from it. Guessing one is the same failure as inventing a place,
   * reached from the other side, so the reader is told to ask. Bounded on
   * both sides: not a questionnaire, and never a request for chart the
   * conversation cannot supply.
   */
  it('tells the reader to ask for what would change which palace is read', () => {
    const at = moment();
    const text = readingPrompt(at, computeQimenChart(at, DEFAULT_OPTIONS), en, { question: '' });

    expect(text).toContain('ask before you read');
    expect(text).toContain('not a questionnaire');
    // "board" and not "chart": the sentence is shared with the 六壬
    // prompt, where a palace is not a thing that exists.
    expect(text).toContain('What cannot be asked for is more board');
    // Asking has to end the turn, or it is a caption on a reading that was
    // given anyway, on the information the reader just called insufficient.
    expect(text).toContain('in place of the reading and never alongside it');
    // And the fallback, which their answer licenses and nothing else does.
    expect(text).toContain('name what you are missing instead of filling it in');
  });

  /**
   * The prompt travels, and a disclaimer left on the page it was copied from
   * does not travel with it. So the reading is told to carry it — to say it,
   * not to have been told it.
   *
   * In fixed words, first, once. A disclaimer written in the model's own
   * words comes out written about the question, which is a reading with a
   * caveat's manners; and an opening line is the only one a model can check
   * it already said, which is what keeps it from coming back under every
   * answer until nobody reads it.
   */
  it('tells the reading to say what it is for, and whose the decision is', () => {
    const at = moment();
    const text = readingPrompt(at, computeQimenChart(at, DEFAULT_OPTIONS), en);

    expect(text).toContain('food for thought and entertainment');
    // Not a softer way of saying nothing: the line has to deny that a reading
    // settles what is the case, which is what somebody asking about another
    // person's feelings will otherwise take from it.
    expect(text).toContain('not as a source of absolute truths');
    expect(text).toContain('a substitute for professional advice');
    expect(text).toContain('the power over your choices and your path is always yours');
    expect(text).toContain('Those words and no others');
    expect(text).toContain('do not name the person or the matter inside it');
    expect(text).toContain('Open your first reply');
    expect(text).toContain('Then never again');
    // The test the model can actually run on itself.
    expect(text).toContain('already somewhere in this conversation');
  });

  /**
   * The rule the whole project is written on, said to the one surface that
   * could break it — and obeyed by the instructions that say it, because the
   * strongest instruction a model has is the example in front of it. A glyph
   * without its reading is, to the reader this is built for, a shape with no
   * sound: unsayable, unsearchable, unaskable.
   */
  it('asks for a reading beside every glyph, and carries one beside its own', () => {
    const at = moment();
    const chart = computeQimenChart(at, DEFAULT_OPTIONS);

    for (const t of [en, createTranslator('it')]) {
      for (const request of [{}, { nianming: placed() }]) {
        const text = readingPrompt(at, chart, t, request);
        // Everything before the fence: what the reading is told to do, as
        // opposed to the transcript, which is data and pairs them already.
        const instructions = text.slice(0, text.indexOf('```'));

        expect(instructions).toContain('pinyin');
        for (const glyphs of instructions.matchAll(/[一-鿿]+/gu)) {
          const beside = instructions.slice(glyphs.index, glyphs.index + glyphs[0].length + 2);
          expect(beside).toMatch(/[一-鿿] \p{Script=Latin}/u);
        }
      }
    }
  });

  it('says no question was asked rather than inventing one', () => {
    const at = moment();
    const text = readingPrompt(at, computeQimenChart(at, DEFAULT_OPTIONS), en);

    expect(text).toContain('No question was asked');
    expect(text).not.toContain('The question asked is');
  });

  /**
   * The web surface keeps the question in the browser and appends it to what
   * the server built. What it appends to has to be the line that introduces
   * one, ending where the text goes.
   */
  it('ends on the line that introduces a question the caller is keeping', () => {
    const at = moment();
    const text = readingPrompt(at, computeQimenChart(at, DEFAULT_OPTIONS), en, { question: '' });

    expect(text.endsWith('The question asked is:\n')).toBe(true);
    expect(`${text}Where is my cat?`).toContain('The question asked is:\nWhere is my cat?');
  });

  it('is written in the locale it was handed', () => {
    const at = moment();
    const chart = computeQimenChart(at, DEFAULT_OPTIONS);
    const text = readingPrompt(at, chart, createTranslator('it'));

    expect(text).toContain('Rispondi in italiano.');
    expect(text).toContain('Nessuna domanda è stata posta');
    // The names are not a locale, and are there in both.
    expect(text).toContain('用神');
    expect(text).toContain('離');
  });
});

/**
 * 年命 — a birth looked up inside the chart of a moment.
 *
 * What is asserted is what the prompt has to hold around it: the two pairs
 * are in the fence with the chart, the reading is told what this is not, and
 * the mapping of palaces onto parts of a life is refused as loudly here as
 * the natal frame this replaced refused it.
 */
describe('the prompt with a 年命 in it', () => {
  function withBirth(t = en): string {
    const at = moment();
    return readingPrompt(at, computeQimenChart(at, DEFAULT_OPTIONS), t, {
      question: 'Should I take the offer?',
      nianming: placed(),
    });
  }

  it('puts the two pairs inside the fence, with the chart', () => {
    const text = withBirth();
    const fenced = text.slice(text.indexOf('```'), text.lastIndexOf('```'));

    expect(fenced).toContain('本命');
    expect(fenced).toContain('行年');
    expect(fenced).toContain('庚午');
  });

  it('says what it is not, before the fence', () => {
    const instructions = withBirth().slice(0, withBirth().indexOf('```'));

    expect(instructions).toContain('not a chart of a birth');
    expect(instructions).toContain('which palace stands for which part of a life');
  });

  /**
   * The mistake the first wording produced, and the one worth a test: a model
   * told to say where the pairs fell wrote a section of its own describing
   * them, which is the palace table said twice and a reading that answers
   * nobody. A 年命 is who is asking, and it belongs in the answer.
   */
  it('refuses it a section of its own', () => {
    const instructions = withBirth().slice(0, withBirth().indexOf('```'));

    expect(instructions).toContain('not a second reading');
    expect(instructions).toContain('Do not give it a section of its own');
  });

  it('still carries the question and every bound the prompt has', () => {
    const text = withBirth();

    expect(text).toContain('用神');
    expect(text).toContain('The question asked is');
    expect(text).toContain('Do not rank the palaces');
    expect(text).toContain('food for thought and entertainment');
  });

  it('says nothing about a 年命 when none was placed', () => {
    const at = moment();
    const text = readingPrompt(at, computeQimenChart(at, DEFAULT_OPTIONS), en);

    expect(text).not.toContain('本命');
    expect(text).not.toContain('niánmìng');
  });

  it('is written in the locale it was handed', () => {
    expect(withBirth(createTranslator('it'))).toContain('Non è la carta di una nascita');
  });
});

/**
 * The boards of 命, whose prompts ask for a reading of the person.
 *
 * What has to be asserted: the subject is the person the board was laid on,
 * the themes of a life are commissioned by name with their bounds beside
 * them, every choice travels signed, and no question machinery is anywhere in
 * them — nothing is asked of these boards, so the line the 卜 boards end on
 * must be absent rather than empty.
 */
describe('the prompt for a board of 命', () => {
  function board() {
    const at = moment();
    return qizhengBoard(
      { julianDay: at.julianDayUT, hour: at.hourBranch },
      DEFAULT_QIZHENG_OPTIONS,
      context,
    );
  }

  /** A birth with a direction for the count, so the decade cycles are there. */
  function pillars() {
    return computeBazi(moment(), { gender: 'male' }, context);
  }

  it('puts the 七政四餘 board inside a fence and its bounds outside', () => {
    const at = moment();
    const text = qizhengReadingPrompt(at, board(), en);
    const fenced = text.slice(text.indexOf('```'), text.lastIndexOf('```'));
    const instructions = text.slice(0, text.indexOf('```'));

    expect(fenced).toContain('命宮');
    expect(fenced).toContain('2024-06-15T14:00:00+08:00');
    // The seats are read by their transmitted names, and the choice of which
    // carries which theme is said rather than smuggled.
    expect(instructions).toContain('what the tradition reads at that seat');
    expect(instructions).toContain('a choice reads better said than smuggled');
  });

  /**
   * The two lines that say how sure this board is. They are the reason a
   * `/prompt` could be written for it at all: its weakest quantity and its
   * unverifiable frame both travel inside the prompt, where a model that
   * would otherwise recite them as fact has to read them first.
   */
  it('carries what the 七政四餘 board is least sure of', () => {
    const instructions = qizhengReadingPrompt(moment(), board(), en);

    expect(instructions).toContain('one source and three derivations');
    expect(instructions).toContain('over-determination');
    // 紫氣 is absent from the board and the prompt says so rather than leaving
    // a reader to count three where a name promises four.
    expect(instructions).toContain('紫氣');
    expect(instructions).toContain('Do not supply it');
  });

  it('puts the four pillars inside a fence and the withheld 用神 outside', () => {
    const at = moment();
    const text = baziReadingPrompt(at, pillars(), en);
    const fenced = text.slice(text.indexOf('```'), text.lastIndexOf('```'));
    const instructions = text.slice(0, text.indexOf('```'));

    expect(fenced).toContain('2024-06-15T14:00:00+08:00');
    // The count travels computed, and the prompt says it is already done.
    expect(fenced).toContain('five elements');
    expect(instructions).toContain('arithmetic already done');
    expect(instructions).toContain('用神');
    expect(instructions).toContain('this engine does not choose');
    // The 大運 are a timeline of pillars, read as direction and never dated.
    expect(instructions).toContain('大運');
    expect(instructions).toContain('not a timeline of events');
  });

  /** Without a direction for the count there are no cycles, so the rule that
   * bounds them would be naming something absent from the fence. */
  it('says nothing about the decades when none were computed', () => {
    const text = baziReadingPrompt(moment(), computeBazi(moment(), {}, context), en);

    expect(text).not.toContain('大運');
  });

  /**
   * What these two end on, and it is an instruction to read rather than one to
   * stop. And that no question machinery is anywhere in them: nothing is asked
   * of a board of 命, so the line the 卜 boards end on must be absent rather
   * than empty.
   */
  it('ends by asking for a reading, and never on a question line', () => {
    const at = moment();

    for (const text of [qizhengReadingPrompt(at, board(), en), baziReadingPrompt(at, pillars(), en)]) {
      expect(text).toContain('none is needed');
      expect(text).toMatch(/So read (it|them)\./);
      expect(text).not.toContain('stop there');
      // The 卜 machinery, absent rather than empty: there is no question to
      // withhold and no line for a browser to append one to.
      expect(text).not.toContain('The question asked is');
      expect(text).not.toContain('No question was asked. Describe how the chart stands');
      // What stays out of a reading, on both boards: dated predictions, the
      // professions, the games.
      expect(text).toContain('predictions with dates on them');
      expect(text).toContain('games of chance');
    }
  });

  /**
   * The six steps after the fence, in the order the reply is to be written
   * in. Asserted as an order and not as six substrings, because the order is
   * the point: a panorama under the detail is a summary nobody needed, and
   * the themes without the whole are a report with no thesis.
   */
  it('lays out the reply after the fence, in order', () => {
    const at = moment();

    for (const [text, written] of [
      [qizhengReadingPrompt(at, board(), en), 'the sky'],
      [baziReadingPrompt(at, pillars(), en), 'a calendar'],
    ] as const) {
      const closing = text.slice(text.lastIndexOf('```') + 3);
      const steps = [
        'none is needed',
        `a birth written in ${written}`,
        'read the board whole',
        'Then the themes',
        'Where to look for all of that',
        'End by opening',
      ].map((step) => closing.indexOf(step));

      expect(steps).not.toContain(-1);
      expect(steps).toStrictEqual([...steps].sort((a, b) => a - b));
    }
  });

  /**
   * The birth is situated in the model's own words — the one fixed line in a
   * prompt is the disclaimer, and there is exactly one of it. What situating
   * may not become is a frame: no paragraph on the art or on destiny before
   * the reading starts.
   */
  it('situates the birth, and fixes no words for it', () => {
    for (const [text, written] of [
      [baziReadingPrompt(moment(), pillars(), en), 'a calendar'],
      [qizhengReadingPrompt(moment(), board(), en), 'the sky'],
    ] as const) {
      expect(text).toContain('situate the birth');
      expect(text).toContain(`a birth written in ${written}`);
      expect(text).toContain('Situate and move on');
      // The disclaimer is the only fixed-words instruction in the prompt.
      expect(text.match(/Those words and no others/g)).toHaveLength(1);
      // And no destiny frame stands in front of the reading.
      expect(text).not.toContain('了凡四訓');
    }
  });

  /**
   * The subject of the reading is the person the board was laid on, and the
   * register holds it descriptive: conditional verbs, warmth without
   * flattery, and none of the professions' work.
   */
  it('reads the person, with the verbs held conditional', () => {
    for (const text of [
      qizhengReadingPrompt(moment(), board(), en),
      baziReadingPrompt(moment(), pillars(), en),
    ]) {
      expect(text).toContain('the person they were laid on');
      expect(text).toContain('Start from who they are');
      expect(text).toContain('never deterministic');
      expect(text).toContain('never flattering');
      // The themes, commissioned by name and bounded where they bite.
      expect(text).toContain('a theme of the life');
      expect(text).toContain('functions, not professions');
      expect(text).toContain('no partner judged and no compatibility settled');
    }
  });

  /**
   * The two rules that turn the panorama from a summary into a reading, both
   * of them the answer to a reply that obeyed every bound and was unreadable.
   * The first says an inspection order is not a writing order; the second says
   * a bound kept by being obeyed never has to be announced — which is what a
   * model does with `prompt.ming.time` and the two 七政四餘 bounds when nothing
   * tells it otherwise, promoting each to a heading before the reading starts.
   */
  it('parts the order it is looked at in from the order it is written in', () => {
    for (const text of [
      qizhengReadingPrompt(moment(), board(), en),
      baziReadingPrompt(moment(), pillars(), en),
    ]) {
      expect(text).toContain('the order you look, not the order you write');
      expect(text).toContain('two or three forces');
      expect(text).toContain('rather than opening the paragraphs');
      expect(text).toContain('do not go into the reading');
      expect(text).toContain('where it bites and at the point where it bites');
      // A relation of control is a tension and not a defect, which is the one
      // thing the bounds never said — a verdict arriving as a diagnosis slips
      // past every rule aimed at a forecast.
      expect(text).toContain('not a fault in it');
      expect(text).toContain('A chart wants nothing');
    }
  });

  it('asks for a reading of the person and refuses the recital', () => {
    const at = moment();

    for (const text of [qizhengReadingPrompt(at, board(), en), baziReadingPrompt(at, pillars(), en)]) {
      // The subject, said first: the reading is not the transcript in prose.
      expect(text).toContain('its subject is not the pillars');
      expect(text).toContain('Do not give it back to them');
      // «Usable without a glossary», which the pages are held to and the
      // prompt was not.
      expect(text).toContain('never seen this system');
    }
  });

  it('carries the bounds every prompt has', () => {
    const at = moment();

    for (const text of [qizhengReadingPrompt(at, board(), en), baziReadingPrompt(at, pillars(), en)]) {
      expect(text).toContain('food for thought and entertainment');
      expect(text).toContain('The reading is yours');
      // The birth time, which is load-bearing on both and on neither of the
      // two boards of 卜: those are cast at an instant somebody was present for.
      expect(text).toContain('時辰');
    }
  });

  it('is written in the locale it was handed', () => {
    const at = moment();
    const it = createTranslator('it');

    expect(qizhengReadingPrompt(at, board(), it)).toContain('Rispondi in italiano.');
    expect(qizhengReadingPrompt(at, board(), it)).toContain('la tradizione legge a quel seggio');
    expect(baziReadingPrompt(at, pillars(), it)).toContain('elemento favorevole');
    // The names are not a locale and stand in both.
    expect(baziReadingPrompt(at, pillars(), it)).toContain('用神');
  });

  /**
   * The same rule the chart's prompt is held to, and these two need it more.
   * Their instructions name far more glyphs than a chart's do — twelve seats,
   * ten gods, twelve stages, four remainders — and every one of them is a name
   * the reader is being told *not* to read as a verdict. A name somebody
   * cannot say is a name they cannot look up to check that.
   */
  it('carries a reading beside every glyph it writes', () => {
    const at = moment();

    for (const t of [en, createTranslator('it')]) {
      for (const text of [qizhengReadingPrompt(at, board(), t), baziReadingPrompt(at, pillars(), t)]) {
        const instructions = text.slice(0, text.indexOf('```'));

        for (const glyphs of instructions.matchAll(/[一-鿿]+/gu)) {
          const beside = instructions.slice(glyphs.index, glyphs.index + glyphs[0].length + 2);
          expect(beside).toMatch(/[一-鿿] \p{Script=Latin}/u);
        }
      }
    }
  });

  it('names where each board can be seen again, and only when told', () => {
    const at = moment();

    expect(qizhengTranscript(at, board(), en)).not.toContain('http');
    expect(qizhengTranscript(at, board(), en, { source: 'https://example.org/q' })).toContain(
      'https://example.org/q',
    );
    expect(baziTranscript(at, pillars(), en)).not.toContain('http');
    expect(baziTranscript(at, pillars(), en, { source: 'https://example.org/b' })).toContain(
      'https://example.org/b',
    );
  });
});

/**
 * The third kind, and the one whose register had to be designed rather than
 * adapted. What is asserted is not the wording but the five things this prompt
 * is wrong without: the board is in it; nothing is asked of it and no line
 * invites a question; the two parties are commissioned rather than assigned;
 * the numbering that makes every position on it readable is stated among the
 * instructions and not only inside the fence; and the two refusals that bound
 * it — the dynastic doctrine, and the reader who is not on this board.
 *
 * See `PLAN.md` § 4 phase 21.
 */
describe('the prompt for a board of 天', () => {
  const board = () => taiyiBoard({ year: 2026 }, DEFAULT_TAIYI_OPTIONS);

  it('puts the 太乙 board inside a fence and its bounds outside', () => {
    const text = taiyiReadingPrompt(board(), en);
    const fenced = text.slice(text.indexOf('```'), text.lastIndexOf('```'));
    const instructions = text.slice(0, text.indexOf('```'));

    // The transcript verbatim, so what is pasted is what the CLI prints and
    // what the section shows.
    expect(fenced).toContain(taiyiTranscript(board(), en));
    expect(fenced).toContain('2026');
    expect(instructions).toContain('a year');
  });

  /**
   * It takes no `Moment`, which no other prompt here can say. A 年計 board is a
   * function of a year: there is no instant, no place and no set of pillars
   * under it, and nobody's data is in it — which is what lets the endpoint that
   * serves it be cached in public.
   */
  it('carries no instant, no place and no pillars', () => {
    const text = taiyiReadingPrompt(board(), en);

    expect(text).not.toContain('2024-06-15T14:00:00+08:00');
    expect(text).not.toContain('Beijing');
    expect(text).not.toContain('Four Pillars');
  });

  /**
   * Nothing is asked of this board and there is no line for a question to land
   * after — which is not the same reason a board of 命 has none. There the
   * question would name a seat the board prints; here there is nobody to ask on
   * behalf of at all.
   */
  it('ends on its closing and never on a question', () => {
    for (const t of [en, createTranslator('it')]) {
      const text = taiyiReadingPrompt(board(), t);

      expect(text).not.toContain(t('prompt.asked'));
      expect(text).not.toContain(t('prompt.noQuestion'));
      expect(text.trimEnd().endsWith(t('prompt.taiyi.invite'))).toBe(true);
    }
  });

  /**
   * The matter is what turned this prompt from a caption into a reading, and
   * the three cases are the ones `ReadingRequest.question` has. The third is
   * the one that matters in practice: the web surface passes `''`, so the
   * prompt ends on the line that introduces the matter and the browser adds
   * the text — which never leaves it, because a matter is somebody's own and a
   * query string is written into every log along the way.
   */
  it('ends on the line the matter lands on, and never carries it for the caller', () => {
    for (const t of [en, createTranslator('it')]) {
      const held = taiyiReadingPrompt(board(), t, { matter: '' });
      expect(held.trimEnd().endsWith(t('prompt.taiyi.about'))).toBe(true);

      const written = taiyiReadingPrompt(board(), t, { matter: 'two firms merging' });
      expect(written.trimEnd().endsWith('two firms merging')).toBe(true);
      // Outside the fence: it is the one thing here that is not data.
      expect(written.indexOf('two firms merging')).toBeGreaterThan(written.lastIndexOf('```'));

      // And none of it appears when none was given.
      expect(taiyiReadingPrompt(board(), t)).not.toContain(t('prompt.taiyi.about'));
    }
  });

  /**
   * A matter is a field of view and a question asks what will happen, and the
   * whole of this board's admission to the consultation rests on the two being
   * different things. A matter that arrived and was answered as a question
   * would put the reader inside a figure they are not in.
   */
  it('takes the matter as a frame and refuses to answer it', () => {
    const text = taiyiReadingPrompt(board(), en, { matter: 'two firms merging' });
    const instructions = text.slice(0, text.indexOf('```'));

    expect(instructions).toContain('It is not a question and must not be answered as one');
    expect(instructions).toContain('do not say who prevails');
    // The reader is still not on the board, and the rule says so about the
    // case a matter creates: a matter that is the reader's own.
    expect(instructions).toContain('when the matter they named is their own');
  });

  /**
   * The 用神 rule arriving on the board that needs it most. The engine names
   * two counts and stops; the choice is the model's and has to travel signed,
   * exactly as the palace a chart is read for does.
   *
   * It is also the one rule that turns on whether a matter arrived, and the two
   * arms are not decoration. With a matter there is something to make the
   * assignment *for*, so it is commissioned. Without one there is not, and the
   * prompt has to say so — a rule that pointed at a matter which is not in the
   * message is how the first cut of this prompt sent a model to invent a pair
   * of parties and then read a whole figure onto them.
   */
  it('commissions 主 and 客 where there is a matter to choose them for', () => {
    const text = taiyiReadingPrompt(board(), en, { matter: 'two firms merging' });
    const instructions = text.slice(0, text.indexOf('```'));

    expect(instructions).toContain('is **not** below and never will be');
    expect(instructions).toContain('The choice is yours to make');
    // The counts are named, and named as the output of a procedure rather than
    // as a score anybody can compare.
    expect(instructions).toContain('not scores of good and bad');
  });

  it('refuses to invent the pair where there is no matter', () => {
    const text = taiyiReadingPrompt(board(), en);
    const instructions = text.slice(0, text.indexOf('```'));

    expect(instructions).toContain('**No matter was given here**');
    expect(instructions).toContain('do not invent a pair in order to have one');
    // And the rule that would have pointed at an absent matter is not there.
    expect(instructions).not.toContain('it is at the end of this message');
  });

  /**
   * The numbering, said twice on purpose. Inside the fence it comes out of
   * `formatTaiyi` and is a caption on the data; among the instructions it is a
   * rule governing how every position below is read — and a model that carries
   * a chart's numbering across reads all eight one seat wrong with nothing
   * anywhere to contradict it.
   */
  it('states the numbering among the rules and not only in the fence', () => {
    const text = taiyiReadingPrompt(board(), en);
    const instructions = text.slice(0, text.indexOf('```'));

    expect(instructions).toContain('九宮皆差一位');
    expect(instructions).toContain('do not carry it across');
    expect(taiyiTranscript(board(), en)).toContain('one seat from the Luoshu');
  });

  /** The two refusals, and they are why this board waited for a register. */
  it('keeps the dynastic doctrine out and the reader off the board', () => {
    const instructions = taiyiReadingPrompt(board(), en).slice(
      0,
      taiyiReadingPrompt(board(), en).indexOf('```'),
    );

    expect(instructions).toContain('dynastic');
    expect(instructions).toContain('Do not predict events');
    expect(instructions).toContain('it is not the reader');
    expect(instructions).toContain('no seat here stands for a part of their life');
  });

  it('carries the bounds every prompt has, in either locale', () => {
    for (const [t, opening] of [
      [en, 'food for thought and entertainment'],
      [createTranslator('it'), 'spunto di riflessione'],
    ] as const) {
      const text = taiyiReadingPrompt(board(), t);

      expect(text).toContain(opening);
      expect(text).toContain(t('prompt.yours'));
      expect(text).toContain(t('prompt.language'));
    }
  });

  /**
   * The rule the two boards of 命 are held to, and this board is denser in
   * glyphs than either: its instructions name a Tang text, a line of it, two
   * eyes, seven conditions and four circuits, and every one of them is a name
   * the reader is being told how to weigh. A name somebody cannot say is a name
   * they cannot look up to check that.
   */
  it('carries a reading beside every glyph it writes', () => {
    for (const t of [en, createTranslator('it')]) {
      const text = taiyiReadingPrompt(board(), t);
      const instructions = text.slice(0, text.indexOf('```'));

      for (const glyphs of instructions.matchAll(/[一-鿿]+/gu)) {
        const beside = instructions.slice(glyphs.index, glyphs.index + glyphs[0].length + 2);
        expect(beside).toMatch(/[一-鿿] \p{Script=Latin}/u);
      }
    }
  });

  it('names where the board can be seen again, and only when told', () => {
    expect(taiyiTranscript(board(), en)).not.toContain('http');
    expect(taiyiReadingPrompt(board(), en, { source: 'https://example.org/t' })).toContain(
      'https://example.org/t',
    );
  });
});
