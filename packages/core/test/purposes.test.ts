import { translate } from '@qimendunjia/i18n';
import { beforeAll, describe, expect, it } from 'vitest';
import { GATES } from '../src/dunjia/index.js';
import { ChartError } from '../src/errors.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { PURPOSES, purposeCriteria, purposeOfGate } from '../src/purposes.js';
import { matchRuns, scanCharts, type ScanRun } from '../src/scan.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';

let context: EphemerisContext;
let week: ScanRun[];

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };
const CLOCK: ChartOptions = { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' };

function scan(): ScanRun[] {
  return (week ??= scanCharts(
    { date: '2026-09-01', time: '00:00', timezone: BEIJING.timezone },
    { date: '2026-09-08', time: '00:00', timezone: BEIJING.timezone },
    BEIJING,
    CLOCK,
    context,
  ));
}

describe('the table of purposes', () => {
  it('is the eight gates read from the other side, and nothing more', () => {
    expect(PURPOSES).toHaveLength(GATES.length);

    // A bijection. Not a list of undertakings somebody chose: every gate has
    // one purpose and every purpose one gate, which is what keeps the table
    // from growing into a catalogue of recommendations.
    const gates = PURPOSES.map((purpose) => purpose.gate);
    expect(new Set(gates).size).toBe(PURPOSES.length);
    for (const gate of GATES) expect(gates).toContain(gate.id);
  });

  it('keeps the gates nobody calls auspicious, with their own uses', () => {
    // 死門 and 傷門 are here because this is a table of transmitted
    // associations and not a list of good things to do. Their absence would
    // have turned it into the second.
    expect(purposeOfGate('simen').id).toBe('ending');
    expect(purposeOfGate('shangmen').id).toBe('pursuit');
  });

  it('names an errand in the language of whoever reads it, never a gate', () => {
    for (const locale of ['en', 'it'] as const) {
      for (const purpose of PURPOSES) {
        const said = translate(locale, `label.purpose.${purpose.id}`, {});

        expect(said).not.toBe('');
        // The label has to let somebody choose. A word that only renamed the
        // gate — "Open", "Rest" — would leave them exactly where they were.
        expect(said.length).toBeGreaterThan(12);
        expect(said).not.toMatch(/門/);
      }
    }
  });
});

describe('purposeCriteria', () => {
  it('expands to the gate alone', () => {
    for (const purpose of PURPOSES) {
      expect(purposeCriteria(purpose.id)).toEqual({ gate: purpose.gate });
    }
  });

  it('adds no floor under the strength and excludes no configuration', () => {
    // Both would be readings. What comes back is only ever what a caller
    // could have typed into the same form.
    for (const purpose of PURPOSES) {
      const criteria = purposeCriteria(purpose.id) as Record<string, unknown>;
      expect(Object.keys(criteria)).toEqual(['gate']);
    }
  });

  it('answers exactly as the criteria written by hand would', () => {
    const runs = scan();

    for (const purpose of PURPOSES) {
      expect(matchRuns(runs, purposeCriteria(purpose.id))).toEqual(
        matchRuns(runs, { gate: purpose.gate }),
      );
    }
  });

  it('refuses an errand it has no gate for', () => {
    expect(() => purposeCriteria('prosperity' as never)).toThrow(ChartError);
    expect(() => purposeCriteria('prosperity' as never)).toThrow(
      expect.objectContaining({ code: 'UNKNOWN_IDENTIFIER' }),
    );
  });

  it('carries no verdict, in either language', () => {
    const said = PURPOSES.flatMap((purpose) =>
      (['en', 'it'] as const).map((locale) =>
        translate(locale, `label.purpose.${purpose.id}`, {}).toLowerCase(),
      ),
    ).join(' ');

    // "Avoiding" is deliberately not on this list, though the sibling tests
    // ban it: 杜門 is the gate of keeping out of sight, so avoiding is the
    // errand here and not advice about an hour. What is banned is a
    // judgement — that a time is good, lucky, or the one to pick.
    for (const word of ['lucky', 'auspicious', 'favourable', 'best', 'should', 'ideal']) {
      expect(said).not.toContain(word);
    }
    for (const word of ['fortunato', 'propizio', 'favorevole', 'migliore', 'dovresti', 'ideale']) {
      expect(said).not.toContain(word);
    }
  });
});
