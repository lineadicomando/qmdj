# What is not built yet

Three kinds of open work, and they are open for different reasons. The record
of how everything else got here is in [`docs/history/`](docs/history/README.md);
what holds today is in [`docs/`](docs/README.md).

## 1. The notes section — the one open phase

`/[lang]/notes` is a heading in the footer with a page under it that says the
section is still being defined. That is the honest state.

**The organisation is settled and the contents are not**, deliberately: a page
written against an engine that has not stopped changing gets rewritten at
every board, in two languages. What was fixed is the set of addresses, what
each is for, and which side of the derived/written line each falls on.

| Page | What it answers | |
|---|---|---|
| `/[lang]/notes` | what this section is, and the way to the rest | written |
| `…/instruments` | what is computed, board by board: inputs, parameters, the school each value names | **derived** |
| `…/sources` | what each quantity stands on, and how strongly | **derived** |
| `…/refusals` | what is not computed, who asks for it, why it is not here | written — its source is now `docs/refusals.md` |
| `…/readings` | what a prompt commissions and forbids, and what never leaves the browser | written — its source is now `docs/readings.md` |
| `…/glossary` | hanzi, pinyin and gloss in one list | *candidate,* on probation |

**The derived pages depend on nothing and can be built at any time.** They
read a registry and a register, both of which exist. Only the written pages
kept the old rule and go last — and two of the three now have a source in
`docs/` written against the finished engine, which is most of what made them
expensive.

The glossary is on probation because the interface must be usable **without**
one. A glossary that becomes load-bearing is the sign that a control somewhere
is failing, and the fix is then upstream of it.

Two standing rules from that phase, which hold whether or not it is built:

- **Derived beats written.** What changes when a board lands must not be
  written at all. When a new board makes somebody want to hand-write a
  paragraph, that is the signal that a descriptor is missing a field.
- **Every written entry carries, shown, the date it was last checked against
  the engine.** Staleness made legible to the one reader equipped to discount
  it beats a resolution to be careful.

Also owed there: **the account of what 太乙 is checked against.** It is
currently only in the transcript and in `docs/sources.md`. That is a debt and
not an arrangement.

See [`docs/history/17-notes.md`](docs/history/17-notes.md) for the full
argument, including the ladder of evidence — the five rungs a quantity can
stand on — which is that section's one idea and belongs nowhere else.

## 2. Parameters that are declared and refused

Every one of these already exists in an input type, is validated, and throws
`OPTION_NOT_IMPLEMENTED` or `METHOD_NOT_IMPLEMENTED` rather than falling back.
That is the whole point: **the API does not break when one lands.** See
`docs/parameters.md` for the values and what each names.

Implementing one is a matter of finding a source that meets the standard —
two transmitted witnesses agreeing, or one text that checks itself — not of
writing code. In rough order of how well the ground is prepared:

- 奇門: `plate: fei` (飛盤), `centreLodging: dun`, `system` beyond 時家.
- 六壬: `yuejiang: jieqi` and `true`, `guiren: wei`, `zhouye: solar`.
- 七政四餘: `xiudu` from a 曆 table (時憲曆, 授時曆), `luohou: ascending`,
  `minggong: ascendant`, `gong: ci`.
- 太乙: `ji` beyond 年計 — 月計, 日計, 時計.
- 曆注: `shensha` from a named lineage rather than only what 《協紀辨方書》
  ratifies.

`method: maoshan` is in the same list and is not expected to leave it: there
is no reference against which a 茅山 chart could be falsified. See
`docs/refusals.md`.

`ziqi: yinianyisu` is the one waiting on a single citable fact — an epoch. See
the 紫氣 entry in `docs/refusals.md`. The research behind it is on the local
shelf, in `texts/`, which `.gitignore` excludes — so a clone does not have it,
and nothing here depends on it: what a source establishes is in
`docs/sources.md`, cited by title and never by path. See `docs/README.md`
§ "The sources themselves are not here".

## 3. What is refused and stays refused

Not roadmap, and listed here only so nobody mistakes silence for an omission:
the 用神, 格局, ranking, dating, advice, the 年命 purposes doctrine, a natal
Qi Men chart, 太乙's dynastic readings, and the 十八飛星 placements grafted onto
a 《全書》 board. Each has an entry in [`docs/refusals.md`](docs/refusals.md)
saying who asks for it and why it is not here.
