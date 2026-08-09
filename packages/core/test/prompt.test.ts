import { createTranslator } from '@qimendunjia/i18n';
import { beforeAll, describe, expect, it } from 'vitest';
import { computeQimenChart } from '../src/dunjia/index.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { resolveMoment, type Moment } from '../src/pillars.js';
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
    expect(chartTranscript(at, chart, en, 'https://example.org/en?date=2024-06-15')).toContain(
      'https://example.org/en?date=2024-06-15',
    );
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
    // And the fallback for when nobody answers: the prompt can end up
    // pasted where there is no one to ask.
    expect(text).toContain('name what you are missing instead of filling it in');
  });

  /**
   * The prompt travels, and a disclaimer left on the page it was copied from
   * does not travel with it. So the reading is told to carry it — to say it,
   * not to have been told it.
   */
  it('tells the reading to say what it is for, and whose the decision is', () => {
    const at = moment();
    const text = readingPrompt(at, computeQimenChart(at, DEFAULT_OPTIONS), en);

    expect(text).toContain('this is for entertainment');
    expect(text).toContain('their own decision and their own responsibility');
    expect(text).toContain('no medical, legal or financial advice');
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
 * The other frame: a chart cast for a birth, read as a chart of a life.
 *
 * What is asserted is that it is a frame and not a method — the application
 * is named as modern and minority, the mapping of palaces to parts of a life
 * is refused, and nothing that belongs to a question survives into it.
 */
describe('the prompt for a chart of a birth', () => {
  function destiny(t = en): string {
    const at = moment();
    return readingPrompt(at, computeQimenChart(at, DEFAULT_OPTIONS), t, { frame: 'destiny' });
  }

  it('says what this application is, and that the schools disagree', () => {
    expect(destiny()).toContain('modern and minority application');
    expect(destiny()).toContain('do not agree with one another');
  });

  it('refuses the mapping of palaces onto parts of a life', () => {
    const text = destiny();

    expect(text).toContain('which palace stands for which part of a life');
    expect(text).toContain('say plainly that it is yours');
  });

  it('describes and then hands the turn back, rather than answering nobody', () => {
    const text = destiny();

    expect(text).toContain('let the person ask');
    // A prompt is pasted into a conversation: the questions come after.
    expect(text).toContain('conversation and not a document');
  });

  it('carries nothing that belongs to a question', () => {
    const text = destiny();

    expect(text).not.toContain('用神');
    expect(text).not.toContain('The question asked is');
    expect(text).not.toContain('No question was asked');
    expect(text).not.toContain('ask before you read');
  });

  it('keeps every bound the other frame has', () => {
    const text = destiny();

    expect(text).toContain('Do not rank the palaces');
    expect(text).toContain('this is for entertainment');
    expect(text).toContain('with no runnable reference at all');
    // And the chart itself, which is the point of all of it.
    expect(text).toContain('離');
  });

  it('is written in the locale it was handed', () => {
    expect(destiny(createTranslator('it'))).toContain('moderna e minoritaria');
  });
});
