import { createTranslator } from '@qimendunjia/i18n';
import { beforeAll, describe, expect, it } from 'vitest';
import { computeQimenChart } from '../src/dunjia/index.js';
import { ganzhiOf } from '../src/ganzhi.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { resolveMoment, type Moment } from '../src/pillars.js';
import { nianmingOf } from '../src/nianming.js';
import { chartTranscript, readingPrompt } from '../src/prompt.js';
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
    expect(text).toContain('What cannot be asked for is more chart');
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

    expect(text).toContain('food for thought and as entertainment');
    // Not a softer way of saying nothing: the line has to deny that a reading
    // settles what is the case, which is what somebody asking about another
    // person's feelings will otherwise take from it.
    expect(text).toContain('establishes no facts');
    expect(text).toContain('in no way a substitute for medical, legal or financial advice');
    expect(text).toContain('remains yours alone, and your responsibility');
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
    expect(text).toContain('food for thought and as entertainment');
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
