import { describe, expect, it } from 'vitest';
import {
  chartQuery,
  intervalQuery,
  keptKey,
  keptParam,
  readKept,
  scanCarry,
  scanFields,
  scanQuery,
  sortKept,
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
  method: 'chaibu',
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

describe('the hours set aside', () => {
  const address = (kept: string): URL => new URL(`http://localhost/it/moments?kept=${kept}`);

  it('names an hour by its minute and its palace', () => {
    // The run's own `start` carries seconds, milliseconds and an offset. The
    // section already names that moment `time=04:10` everywhere else, and the
    // runs it points at are bisected to the minute.
    expect(keptKey('2026-09-01T04:10:18.750+02:00', 'qian')).toBe('2026-09-01T04:10@qian');
  });

  it('reads a shortlist back out of the address', () => {
    expect(readKept(address('2026-09-01T04:10@qian,2026-09-03T22:10@xun'))).toEqual([
      { start: '2026-09-01T04:10', palace: 'qian' },
      { start: '2026-09-03T22:10', palace: 'xun' },
    ]);
  });

  it('has none when the address says nothing', () => {
    expect(readKept(new URL('http://localhost/it/moments?from=2026-09-01'))).toEqual([]);
  });

  it('drops what it cannot read rather than refusing the page', () => {
    // A truncated link is still a link to a scan, and losing an hour off the
    // end of one is a smaller failure than a section that will not open.
    // `wuxing` is the shape of a palace and not one of the nine: the strip
    // names them out of PALACES and would otherwise print a key.
    expect(readKept(address('2026-09-01T04:10@qian,rubbish,2026-09-03@xun,2026-09-04T08:00@wuxing')))
      .toEqual([{ start: '2026-09-01T04:10', palace: 'qian' }]);
  });

  it('is the same address however it was collected', () => {
    // A person ticks boxes in the order they read the table; two people who
    // chose the same four hours share the same link.
    const one = readKept(address('2026-09-03T22:10@xun,2026-09-01T04:10@qian'));
    const other = readKept(address('2026-09-01T04:10@qian,2026-09-03T22:10@xun'));
    expect(keptParam(one)).toBe(keptParam(other));

    // And the same hour ticked twice is one hour, not two.
    expect(readKept(address('2026-09-01T04:10@qian,2026-09-01T04:10@qian'))).toHaveLength(1);
  });

  it('keeps the two palaces of one hour apart', () => {
    // What was chosen is a palace, not a run: the same double hour can hold
    // an answer to the southeast worth keeping and one in the centre worth
    // nothing.
    expect(readKept(address('2026-09-01T04:10@qian,2026-09-01T04:10@xun'))).toHaveLength(2);
  });

  it('round-trips through the address it writes', () => {
    const kept = sortKept([
      { start: '2026-09-03T22:10', palace: 'xun' },
      { start: '2026-09-01T04:10', palace: 'qian' },
    ]);
    expect(readKept(address(keptParam(kept)))).toEqual(kept);
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

  it('brings the shortlist back with it', () => {
    // A reader opens the whole board for one hour and comes back: the other
    // four they had set aside must still be there. `kept` is not a criterion
    // and rides along exactly as one does.
    const kept = [{ start: '2026-09-01T04:10', palace: 'qian' }];
    const url = new URL(
      `http://localhost/en?${chartQuery('2026-09-03T08:00', INTERVAL, scanCarry(INTERVAL, LOOKING, kept))}`,
    );

    expect(readKept(url)).toEqual(kept);
    expect(readKept(new URL(`http://localhost/it/moments?${scanQuery(url)}`))).toEqual(kept);
    expect(scanQuery(url)).toBe(intervalQuery(INTERVAL, LOOKING, { kept: keptParam(kept) }));
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
