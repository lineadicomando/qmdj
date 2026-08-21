# Phase 8 — Choosing a time

The engine casts a chart for an instant. 擇時擇方 is the other question, and
the older one: which instants, in a stretch of days, hold which chart, and
which way to face in them. `scan.ts` walks an interval; `matchRuns` narrows
it to the palaces answering stated criteria; `qimen scan`, `/api/moments`,
`/[lang]/moments` and `scan_moments` are the four surfaces of it.

**The palace is the answer, not the run.** An interval does not hold a good
hour, it holds an hour in which something stands to the southeast. Every
surface carries the direction, and the MCP description forbids reporting the
hour alone: drop it and what is left is an almanac that any other art already
provides.

**Done.** Four findings, the first two of which changed the design:

- **The Moon costs fifty times what the Sun does.** Measured before building:
  resolving a moment took 2.19 ms, of which the lunar date was 1.61 ms — three
  quarters of it, for a value no chart cast by 拆補 ever reads. `Moment.lunar`
  is now computed the first time it is read. A resolve fell to 0.558 ms and a
  month scans in 1.7 s instead of seven. The memoisation this plan expected to
  need — caching the solar terms across the interval — would have saved
  nothing: `sunCrossing` costs 0.035 ms.
- **A run is not a double hour.** Under 拆補 the yuan turns five days into the
  term counted from the *instant* the term began, which is not midnight: the
  third yuan of 處暑 2026 opens on 2 September at 10:18:48, inside the double
  hour of 巳. So a double hour can open under one ju and close under the next.
  Probing hourly would have placed that change at 11:00 and claimed for the
  preceding run forty-two minutes it does not hold; every disagreement between
  two probes is now bisected to the minute.
- **A chart shows eight spirits, but which eight depends on the dun.** 勾陳
  and 朱雀 stand in a yang chart, 白虎 and 玄武 in a yin one — ten in all. Both
  the web form and the MCP schema were built from `SPIRITS_YANG`, which made
  白虎 unaskable for half the charts of the year. Caught by the test that keeps
  `$lib/vocabulary` honest, within a minute of writing it. Hence `SPIRIT_IDS`.
- **Naming a gate removes no hour.** The open gate stands somewhere in every
  chart, so a criterion on it narrows the palaces of an hour from nine to one
  and leaves the hours alone. Hours go only when what is asked can be absent
  from one: a direction, a floor under the strength, an exclusion. A test
  asserted the opposite before the engine corrected it.

**The table of purposes came later, and smaller than the doctrine.** This
phase first shipped without one, because the transmitted mapping from an
undertaking to its 用神 varies by school, and a table in the engine makes a
school implicit. What `purposes.ts` now carries is the part the manuals do
not dispute: the eight gates and their errands, a bijection, expanded by
`purposeCriteria` into criteria a caller could have written by hand —
`matchRuns` never hears of a purpose, and nothing is applied where it cannot
be seen or edited. Everything past the gates — the stems as significators,
the stars, the spirits — stays out, for the original reason; 三奇得使 remains
the precedent for saying so rather than guessing. The `tradition` parameter
this plan expected a second strand of associations to need was retired as a
finding, not a deferral: laid side by side, the classical sources and the
modern manuals put all eight errands at the same gate, and what they dispute
is how *wide* each gate's domain runs — the gloss, not the chart — so the
parameter would have selected between two identical columns. The divergences
that are real name errands the table does not carry, and a table longer than
eight stops being the gates read from the other side. Nothing forecloses it:
a purpose is still not in a chart's address, the criteria it expands to are,
so if that longer table is ever wanted the parameter can arrive without
breaking a shared link. See the 八門 section of `docs/sources.md`.

**The natal question is not answered here by comparing two charts.** Setting a
birth chart against the chart of a moment is a modern and minority practice,
and where it is done the bridge is the ganzhi rather than any geometry between
two plates. The filter this file left the door open to has since arrived, and
it came as promised — a criterion like the others: `benming` admits only the
palaces one person's year pillar stands on, which is the half of
「必人生年命乘本局吉星奇門生旺之方」 that can be computed. What makes a palace
worth standing on stays where it was, in the criteria the reader sets.

**A list of hours is read scrolling, and the section was built to be read in
one glance.** Two things followed from that, neither of them in the engine.

- **The date left the row and became a rowgroup.** It had been written into
  the first hour of each day and left out of the rest, which is right for a
  table taken in at once and wrong for one scrolled: twenty rows down, the
  date qualifying the hours is off the top of the screen. It sticks now, with
  the column names above it and the hour to its left, which cost the frame
  around the table a height — a sticky cell sticks to the nearest scroll
  container, and `overflow-x: auto` makes one on *both* axes, so inside a
  frame that only ever scrolled sideways nothing would ever have stuck. The
  heading names the civil date and no day pillar: under the default boundary
  the pillar turns at 23:00, so one ganzhi over the group is wrong for the
  last row of most of them.
- **Choosing ends in setting aside, and what is set aside is a palace.** An
  hour kept is `2026-09-01T04:10@qian` in the address, for the reason the
  whole phase turns on — an interval does not hold a good hour, it holds an
  hour in which something stands to the northwest — and because the address
  is where this application's state lives: a shortlist on disk would be a
  different promise than the one the privacy note publishes. It survives
  narrowing the criteria, which is how a shortlist gets built, and does not
  survive moving the place, since an hour kept is a clock time and the clock
  is the place's. That is also why the strip listing them stands above the
  answer rather than in it: the scan that comes back with nothing must not be
  able to take it away.
