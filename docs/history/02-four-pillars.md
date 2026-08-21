# Phase 2 — Four Pillars

Simpler than Qi Men and built on the same foundation: it validates that
foundation before the contested part is attempted.

`bazi/` — the four pillars, hidden stems, ten gods, nayin, twelve stages, void
branches, luck cycles with the starting age derived from the distance to the
solar term, annual pillars. No interpretive text: verifiable relations only.

`formatBaziCompact` in `format.ts`, the dense rendering for agents, locale-aware
through `i18n`.

> Commits: `Computes the four pillars with their hidden stems` · `Derives the ten gods and the decade luck cycles`

**Done.** `computeBazi` in `bazi/`. Verified against `lunar-javascript` on 479
charts spread from 1902 to 2098: images, ten gods, concealed stems, twelve
stages, void branches, the direction of the run and the start of it all agree
on every one, once the reference is given a zone whose offset never moves.

Two findings:

- **The late hour of the Rat is not "everything stays put".** From 23:00 the
  hour stem is read from the day the hour opens, under either setting; what
  the schools dispute is the *day pillar* alone. `dayBoundary` says only that,
  and the first version of it was wrong.
- **The start of the run has two readings.** The classical one counts whole
  double hours — a double hour is ten days — and yields starting days in
  multiples of ten; the other divides down to the minute. They differ by up to
  ten days. `luckGranularity`, default `shichen`.

The eleven charts that still disagreed all fell inside China's wartime clocks,
its post-war summer time, or the summer time of 1986-91 — periods the
reference cannot express, having no notion of a timezone. On a constant-offset
zone the disagreement is zero.
