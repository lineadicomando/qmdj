# What is not built yet

Three kinds of open work, open for different reasons, and a fourth list that
is not work at all. The record of how everything else got here is in
[`docs/history/`](docs/history/README.md); what holds today is in
[`docs/`](docs/README.md).

## 1. The notes section — the one open phase

`/[lang]/notes` is a heading in the footer with a page under it that says the
section is still being defined. That is the honest state.

**The organisation is settled and the contents are not**, deliberately: a page
written against an engine that has not stopped changing gets rewritten at
every board, in every language it is written in. What was fixed is the set of
addresses, what each is for, and which side of the derived/written line each
falls on.

| Page | What it answers | |
|---|---|---|
| `/[lang]/notes` | what this section is, and the way to the rest | written — its source is now `docs/notes.md` |
| `…/instruments` | what is computed, board by board: inputs, parameters, the school each value names | **derived** |
| `…/sources` | what each quantity stands on, and how strongly | **derived** |
| `…/refusals` | what is not computed, who asks for it, why it is not here | written — its source is now `docs/refusals.md` |
| `…/readings` | what a prompt commissions and forbids, and what never leaves the browser | written — its source is now `docs/readings.md` |
| `…/glossary` | hanzi, pinyin and gloss in one list | *candidate,* on probation |

**The derived pages depend on nothing and can be built at any time.** They
read a registry and a register, and both now exist as data:
`packages/core/src/parameters.ts` declares every school divergence with the
values the engine computes and the ones it refuses, and `docs/sources.tsv`
carries one row a quantity with the rung it stands on. Only the written pages
kept the old rule and go last — and all three now have a source in `docs/`
written against the finished engine, which is most of what made them
expensive.

The glossary is on probation because the interface must be usable **without**
one. A glossary that becomes load-bearing is the sign that a control somewhere
is failing, and the fix is then upstream of it.

The two standing rules of that phase — derived beats written, and every
written entry shows the date it was last checked against the engine — now bind
from [`docs/notes.md`](docs/notes.md), which is also where the ladder of
evidence is stated and what makes the register's `rung` column readable.

What the section still owes is its **contents**: the index page, and the
prose of the three written ones. Nothing else.

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

## 3. Spanish, once the engine has stopped moving

The interface is read in a vernacular and there are two of them, which is a
state and not a design — `docs/i18n.md` § "Who is reading" is where that is
argued. **Spanish is the third**, and it is deliberately not third *yet*: the
catalogs still gain a family of messages with every board, and a language
added now would be a language re-translated at each of them, by somebody who
has to follow the argument rather than look a word up.

So the condition is the engine's and not the catalogs': when the boards have
stopped arriving and the section of notes is written, the whole message set is
translated once. Nothing has to be prepared for it — `LOCALES` is a list,
`Record<MessageKey, string>` makes a missing key a compile error, and the
locale is negotiated the same way on all four surfaces. What has to be
*watched* is the ratio the notes section is built around: what is derived from
the engine costs a third language nothing, and what is written costs it a
paragraph. A page that grows written prose is a page that grows the price of
this.

The one thing that would change the design rather than the catalogs is a
language needing plural rules, gender agreement or message syntax — see
`docs/i18n.md` § "The catalog". Spanish needs none of the three.

## 4. What is refused and stays refused

Not roadmap, and listed here only so nobody mistakes silence for an omission:
the 用神, 格局, ranking, dating, advice, the 年命 purposes doctrine, a natal
Qi Men chart, 太乙's dynastic readings, and the 十八飛星 placements grafted onto
a 《全書》 board. Each has an entry in [`docs/refusals.md`](docs/refusals.md)
saying who asks for it and why it is not here.
