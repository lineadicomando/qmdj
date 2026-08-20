import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  chartQuery,
  defaultInterval,
  intervalQuery,
  keptKey,
  keptParam,
  readInterval,
  readKept,
  sortKept,
  EMPTY_CRITERIA,
  type CriteriaInput,
  type IntervalInput,
} from '../src/lib/interval';

/**
 * The address of a scan, and the address of a chart reached from one.
 *
 * The chart's address used to carry the whole scan alongside its moment, so
 * that the chart section could offer a way back. It does not any more: the
 * board over the list holds the whole reading, nobody makes that journey, and
 * what was left was a dozen parameters nothing read. What is asserted here is
 * the other half of that — a row's `href` still answers on its own, which is
 * what a middle click and a browser with no scripts get.
 */

const ROME = {
  id: 3169070,
  name: 'Rome',
  country: 'Italy',
  timezone: 'Europe/Rome',
  latitude: 41.8919,
  longitude: 12.5113,
};

const INTERVAL: IntervalInput = {
  from: '2026-09-01',
  to: '2026-09-08',
  fromTime: '',
  toTime: '',
  place: ROME as never,
  latitude: '',
  longitude: '',
  timezone: '',
  trueSolarTime: true,
  dayBoundary: 'zishi',
  method: 'chaibu',
  yuan: 'term',
};

const LOOKING: CriteriaInput = {
  gate: 'kaimen',
  star: 'tianxin',
  spirit: '',
  minStrength: 'wang',
  towards: ['se', 'e'],
  without: ['menpo'],
  born: '1990-06-01',
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
    const params = new URLSearchParams(intervalQuery(INTERVAL, LOOKING));

    expect(params.get('towards')).toBe('se,e');
    expect(params.get('without')).toBe('menpo');
    // 本命 travels as the date it was given as: the year pillar is read off
    // it on the server, where the solar terms are.
    expect(params.get('born')).toBe('1990-06-01');
    expect(params.get('gate')).toBe('kaimen');
    expect(params.get('minStrength')).toBe('wang');
  });

  it('round-trips everything the server honours', () => {
    // The page's `load` re-serializes the address it was opened with before
    // asking `/api/moments`, so a parameter the server honours and this type
    // dropped would make the scan answer a different question than the
    // address states — `yuan=futou` moves the ju on most days, and the times
    // of day move the two ends of the interval.
    const url = new URL(
      'http://localhost/it/moments?from=2026-09-01&to=2026-09-08&fromTime=06:00&toTime=18:30&yuan=futou',
    );
    const { input } = readInterval(url);

    expect(input.yuan).toBe('futou');
    expect(input.fromTime).toBe('06:00');
    expect(input.toTime).toBe('18:30');

    const out = new URLSearchParams(intervalQuery({ ...input }));
    expect(out.get('yuan')).toBe('futou');
    expect(out.get('fromTime')).toBe('06:00');
    expect(out.get('toTime')).toBe('18:30');
  });

  it('carries a place said in degrees, with the clock it is read on', () => {
    const url = new URL(
      'http://localhost/it/moments?from=2026-09-01&to=2026-09-08' +
        '&latitude=41.8919&longitude=13.5113&timezone=Europe/Rome',
    );
    const { input } = readInterval(url);

    expect(input.latitude).toBe('41.8919');
    expect(input.timezone).toBe('Europe/Rome');

    const out = new URLSearchParams(intervalQuery({ ...input }));
    expect(out.get('latitude')).toBe('41.8919');
    expect(out.get('longitude')).toBe('13.5113');
    expect(out.get('timezone')).toBe('Europe/Rome');
  });

  it('drops the zone beside a named place, which already carries one', () => {
    // A parameter that decides nothing has no business in an address: with an
    // identifier the server reads the zone off the place, and a `timezone`
    // riding along would read as a setting that bears on the answer.
    const out = new URLSearchParams(
      intervalQuery({ ...INTERVAL, latitude: '41.8919', longitude: '13.5113', timezone: 'Europe/Rome' }),
    );

    expect(out.get('locationId')).toBe('3169070');
    expect(out.get('latitude')).toBe('41.8919');
    expect(out.get('timezone')).toBeNull();
  });

  it('leaves out coordinates that only repeat the place', () => {
    // The fields arrive filled with the town's own, so «filled» stops meaning
    // «asked for». Carried anyway, every address of Rome would hold a pair of
    // degrees and every answer would print them as a refinement nobody made.
    const out = new URLSearchParams(
      intervalQuery({ ...INTERVAL, latitude: String(ROME.latitude), longitude: String(ROME.longitude) }),
    );

    expect(out.get('locationId')).toBe('3169070');
    expect(out.get('latitude')).toBeNull();
    expect(out.get('longitude')).toBeNull();
  });

  it('writes them as soon as one of the two is moved', () => {
    const out = new URLSearchParams(
      intervalQuery({ ...INTERVAL, latitude: String(ROME.latitude), longitude: '13.5113' }),
    );

    expect(out.get('locationId')).toBe('3169070');
    expect(out.get('latitude')).toBe('41.8919');
    expect(out.get('longitude')).toBe('13.5113');
  });

  it('writes half a pair rather than losing it', () => {
    // The form cannot submit one of the two — the fields require each other —
    // but an address can be typed. Dropping the half that is there would turn
    // a question the server refuses into a scan run somewhere else entirely.
    const out = new URLSearchParams(intervalQuery({ ...INTERVAL, place: undefined, latitude: '41.8919' }));

    expect(out.get('latitude')).toBe('41.8919');
    expect(out.get('longitude')).toBeNull();
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

describe('the interval offered before one is asked', () => {
  const zone = process.env['TZ'];

  afterEach(() => {
    vi.useRealTimers();
    if (zone === undefined) delete process.env['TZ'];
    else process.env['TZ'] = zone;
  });

  it("opens on the reader's own today, not on UTC's", () => {
    // 03:00 UTC is still yesterday evening in New York: `toISOString` read
    // the UTC date, and the form offered a `from` of tomorrow. The week it
    // closes on crosses a summer-time change (8 March 2026), so this also
    // holds `to` to seven calendar days rather than 168 hours.
    process.env['TZ'] = 'America/New_York';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-05T03:00:00Z'));

    expect(defaultInterval()).toEqual({ from: '2026-03-04', to: '2026-03-11' });
  });
});

describe('a chart reached from a scan', () => {
  const address = new URL(`http://localhost/en?${chartQuery('2026-09-03T08:00', INTERVAL)}`);

  it('says its own moment, and the place and options it was scanned under', () => {
    // Everything the chart page needs to cast exactly the hour that was
    // clicked, and nothing else. This is the address a middle click opens.
    expect(address.searchParams.get('date')).toBe('2026-09-03');
    expect(address.searchParams.get('time')).toBe('08:00');
    expect(address.searchParams.get('locationId')).toBe('3169070');
  });

  it('carries the options the scan ran under', () => {
    const options: IntervalInput = {
      ...INTERVAL,
      trueSolarTime: false,
      dayBoundary: 'midnight',
      yuan: 'futou',
    };
    const url = new URL(`http://localhost/en?${chartQuery('2026-09-03T08:00', options)}`);

    // A chart cast under different options is a different chart, so these are
    // the one thing that must survive the crossing between the two sections.
    expect(url.searchParams.get('trueSolarTime')).toBe('false');
    expect(url.searchParams.get('dayBoundary')).toBe('midnight');
    expect(url.searchParams.get('yuan')).toBe('futou');
  });

  it('carries nothing of the scan itself', () => {
    // The criteria and the shortlist stay in the scan's own address. They were
    // never part of the question a chart answers, and an address that hauls
    // them about is one nobody can read and everybody might share.
    const url = new URL(
      `http://localhost/en?${chartQuery('2026-09-03T08:00', { ...INTERVAL }, {})}`,
    );

    for (const name of ['from', 'to', 'gate', 'star', 'minStrength', 'towards', 'without', 'kept']) {
      expect(url.searchParams.get(name)).toBeNull();
    }
  });
});
