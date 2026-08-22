# What is not built yet

Four kinds of open work, open for different reasons, and a fifth list that is
not work at all. The record of how everything else got here is in
[`docs/history/`](docs/history/README.md); what holds today is in
[`docs/`](docs/README.md).

**The open edge of this project is the shelf, not the code.** The boards, the
almanac layer and the calendrical layer under them are built, checked and
documented, and the section of notes that accounts for them is written. What
is left below is a page that may never be needed, a list of values waiting on
a source, and a third language waiting for the engine to stop moving. None of
the three is blocked on architecture. What will change this engine from here
is a **text** — one that adds a quantity, confirms one
already shipped, or contradicts it — and that is an ordinary change with a
stated procedure: `docs/sources.md` § "When a source arrives later" says what
moves and in what order. Reading the shelf is therefore the work, and writing
code is what happens afterwards.

## 1. The terminology pass

**A rule this project already states and nothing enforces**: a glyph shown to
a person carries its reading, because a glyph alone is, to the reader this is
built for, a shape with no sound — unsayable, unsearchable, unaskable. See
[`docs/i18n.md`](docs/i18n.md) § "Who is reading". The engine keeps it: every
named thing travels as an identifier, its hanzi and its reading, and
`pinyin.test.ts` holds the lot to one toned syllable per character. The
**catalogs** do not, and nobody has ever looked.

Measured once, in August 2026: of the messages carrying hanzi, about a third
carry no reading beside them. They fall into two kinds and only one is a
defect.

- **Prompts** — the strings that go to a model, which read 命宮, 大限, 四化
  bare. That is deliberate and stays: the reader there is not a person, and
  readings would lengthen a prompt without adding anything a model uses.
- **The interface** — «lo 行年 avanza da una nascita», «all'ora del Topo 子時»
  — perhaps a dozen strings per language, and these are the real misses.

**The deliverable is a test as much as a fix**, and the test is the half that
lasts: every catalog message a person reads must say the glyphs it shows, with
the prompt families excluded by prefix. Written that way it fails the day
somebody adds a thirteenth.

Two smaller things belong to the same pass. The notes section describes some
named things in the vernacular without the name beside them — «le ventotto
dimore», «l'ufficiale del giorno» for 宿 and 建除 — where the rest of the site
pairs them; and `shensha` appears there as bare pinyin with neither glyph nor
gloss, which is the worst of the three shapes.

## 2. The glossary, which is on probation

The notes section is built. `/[lang]/notes` is an index and four pages: what
is computed layer by layer, what each quantity stands on and how strongly,
what is deliberately not computed, and what happens when a board is handed to
a model. The first two are **derived** — they read
`packages/core/src/parameters.ts` and `docs/sources.tsv`, so a board that
lands or a value that stops being refused changes them by changing the engine.
The last two are **written**, and each entry shows the day it was last checked
against the engine. [`docs/notes.md`](docs/notes.md) is where that arrangement
binds from.

**What is left of that phase is one page that may never be written.** A
glossary — hanzi, reading and gloss in one list — was named a candidate and
put on probation, because `CLAUDE.md` requires the interface to be usable
**without** one. A glossary that becomes the answer to «where do I look this
up» is the sign that a control somewhere has stopped explaining itself, and
the fix is then upstream of it rather than in a list.

Two conditions, and the first is the real one. **The pass above comes first**,
because most of what would send a reader to a glossary is a name shown without
its reading — and that is a bug at the place it appears, not a gap in a list.
If terms remain afterwards with nowhere to be defined, *those* are the
argument for a glossary and the only one worth having.

**And if it is ever built it is derived**, off the named things the engine
already carries with their hanzi, reading and gloss. Written by hand it would
be a page maintained in every language and growing with every board — the
written half, in the one section built to keep that half small.

## 3. Parameters that are declared and refused

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

## 4. Spanish, once the engine has stopped moving

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

## 5. What is refused and stays refused

Not roadmap, and listed here only so nobody mistakes silence for an omission:
the 用神, 格局, ranking, dating, advice, the 年命 purposes doctrine, a natal
Qi Men chart, 太乙's dynastic readings, and the 十八飛星 placements grafted onto
a 《全書》 board. Each has an entry in [`docs/refusals.md`](docs/refusals.md)
saying who asks for it and why it is not here.
