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
