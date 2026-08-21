# Phase 1 — The calendrical layer

The core of the project, and the phase that must be finished properly before
anything else begins.

1. `time.ts` — local → UT conversion. Reusable almost verbatim from the
   reference, including ambiguous-hour and nonexistent-hour warnings.
2. `true-solar.ts` — equation of time and longitude correction. Four minutes per
   degree: decisive for the hour pillar.
3. `solar-terms.ts` — the 24 terms of a year, cached. Returns the UT instant,
   the local time, and the term in force at a given date.
4. `lunar.ts` — new moons, month numbering, intercalary month, lunar date.
5. `ganzhi.ts` — the four cycles. Day from a continuous count on the Julian day
   with a known epoch; month from the jie boundaries via Wuhu Dun; hour from the
   day stem via Wushu Dun; year from the chosen boundary.

**Verification**: published tables from the Hong Kong Observatory (lunisolar
calendar and solar terms, 1901–2100) and the Central Weather Administration of
Taiwan. Tests assert expected values, never snapshots. Mandatory edge cases: a
solar term straddling midnight, a year with an intercalary month, a birth in the
late Zi hour, a birth in China between 1940 and 1949, one during Chinese summer
time 1986–1991.

> Commits: `Converts local time to Universal Time` · `Computes true solar time` · `Finds the twenty-four solar terms` · `Reconstructs the lunar calendar` · `Derives the sexagenary cycles of the four pillars`

**Done.** `resolveMoment` in `pillars.ts` assembles the phase: an instant in,
four pillars plus the term, the jie and the lunar date out. Verified against
`lunar-javascript` on 1 926 dates spread from 1902 to 2098 — year, month, day
and hour pillars and the lunar date all agree on every one of them.

Three findings worth keeping:

- **The lunar calendar is reckoned on 120°E**, not on the chart's timezone. It
  is published, not observed, so the same instant carries the same lunar date
  everywhere; and it ignores China's wartime clocks of 1942-45, which the
  civil day does not.
- **Month eleven is the month *containing* the solstice**, compared by day and
  not by instant. When the solstice falls at 00:23 and the new moon at 19:47
  of the same date, comparing instants picks the wrong month and shifts the
  whole year's numbering.
- **Almanac values recalled from memory were wrong** more often than they were
  right. Every anchor in the tests is one that survived an independent check.
