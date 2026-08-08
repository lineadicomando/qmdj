import { describe, expect, it } from 'vitest';
import {
  chartQuery,
  intervalQuery,
  scanCarry,
  scanFields,
  scanQuery,
  EMPTY_CRITERIA,
  type CriteriaInput,
  type IntervalInput,
} from '../src/lib/interval';

/**
 * The address of a scan, and the address of a chart reached from one.
 *
 * The second is the whole point of these: a chart carries the scan it came
 * from so that it can offer a way back, and it can only do that because the
 * two sections read disjoint parameters out of one address. That is an
 * arrangement nothing enforces at compile time, so it is asserted here — a
 * parameter added to one side and colliding with the other would otherwise
 * be found by a reader whose way back had quietly become a different scan.
 */

const ROME = { id: 3169070, name: 'Rome', country: 'Italy', timezone: 'Europe/Rome' };

const INTERVAL: IntervalInput = {
  from: '2026-09-01',
  to: '2026-09-08',
  place: ROME as never,
  trueSolarTime: true,
  dayBoundary: 'zishi',
};

const LOOKING: CriteriaInput = {
  gate: 'kaimen',
  star: 'tianxin',
  spirit: '',
  minStrength: 'wang',
  towards: ['se', 'e'],
  without: ['fugan'],
};

describe('the criteria as address fields', () => {
  it('leaves nothing empty behind', () => {
    // The fields themselves may be empty; what writes them drops those, and
    // the plainest question keeps the plainest address.
    expect(new URLSearchParams(intervalQuery(INTERVAL, EMPTY_CRITERIA)).toString()).toBe(
      'from=2026-09-01&to=2026-09-08&locationId=3169070',
    );
  });

  it('joins the lists the way the address carries them', () => {
    // A criterion asked of several directions at once is one parameter, not
    // one per direction: `towards` is read back by splitting on the comma.
    expect(scanCarry(INTERVAL, LOOKING)).toEqual({
      from: '2026-09-01',
      to: '2026-09-08',
      locationId: '3169070',
      gate: 'kaimen',
      star: 'tianxin',
      minStrength: 'wang',
      towards: 'se,e',
      without: 'fugan',
    });
  });
});

describe('a chart reached from a scan', () => {
  const address = new URL(
    `http://localhost/en?${chartQuery('2026-09-03T08:00', INTERVAL, scanCarry(INTERVAL, LOOKING))}`,
  );

  it('says its own moment first of all', () => {
    // What the chart page actually casts for. The scan riding along must not
    // touch any of it.
    expect(address.searchParams.get('date')).toBe('2026-09-03');
    expect(address.searchParams.get('time')).toBe('08:00');
    expect(address.searchParams.get('locationId')).toBe('3169070');
  });

  it('gives back the scan it came from', () => {
    const back = scanQuery(address);
    expect(back).toBeDefined();

    const returned = new URLSearchParams(back);
    expect(returned.get('from')).toBe('2026-09-01');
    expect(returned.get('to')).toBe('2026-09-08');
    expect(returned.get('gate')).toBe('kaimen');
    expect(returned.get('star')).toBe('tianxin');
    expect(returned.get('minStrength')).toBe('wang');
    expect(returned.get('towards')).toBe('se,e');
    expect(returned.get('without')).toBe('fugan');
    expect(returned.get('locationId')).toBe('3169070');
    // The moment is the chart's, not the scan's: it must not come back.
    expect(returned.get('date')).toBeNull();
    expect(returned.get('time')).toBeNull();
  });

  it('returns to the very scan that was run', () => {
    // The round trip, which is what the reader experiences: the address the
    // way back leads to is the address they left.
    expect(scanQuery(address)).toBe(intervalQuery(INTERVAL, LOOKING));
  });

  it('carries the options through in both directions', () => {
    const options: IntervalInput = { ...INTERVAL, trueSolarTime: false, dayBoundary: 'midnight' };
    const url = new URL(
      `http://localhost/en?${chartQuery('2026-09-03T08:00', options, scanCarry(options))}`,
    );

    // Shared between the two sections, and the same value in both — which is
    // what makes one address able to hold a moment and a scan at once.
    expect(url.searchParams.get('trueSolarTime')).toBe('false');
    expect(url.searchParams.get('dayBoundary')).toBe('midnight');
    expect(scanQuery(url)).toBe(intervalQuery(options, EMPTY_CRITERIA));
  });
});

describe('a chart reached some other way', () => {
  it('has no scan to go back to', () => {
    const url = new URL('http://localhost/en?date=2026-09-03&time=08:00&locationId=3169070');
    expect(scanQuery(url)).toBeUndefined();
  });

  it('has none with only half an interval either', () => {
    expect(scanQuery(new URL('http://localhost/en?from=2026-09-01'))).toBeUndefined();
    expect(scanQuery(new URL('http://localhost/en?to=2026-09-08'))).toBeUndefined();
  });

  it('adds nothing to the address it is stepped to', () => {
    // `show` on the chart page appends these to every step. With no scan in
    // the address there is nothing to append, and the plain chart stays plain.
    expect(scanFields(new URL('http://localhost/en?date=2026-09-03'))).toEqual({});
  });
});
