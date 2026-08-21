# qimendunjia

Qi Men Dun Jia charts and Four Pillars: a **pure engine** (`packages/core`) and
**adapters** that expose it on different surfaces.

**This file is the rules, one line each.** Where a rule has an argument behind
it, the argument is in `docs/` and the line points there. Read the pointer
before changing anything the rule covers — the reasoning is what stops a
correct-looking fix from being wrong.

| | |
|---|---|
| `CLAUDE.md` | the rules that bind any change. Here |
| [`docs/`](docs/README.md) | **the project as it is now**: architecture, parameters, sources, refusals, readings, i18n |
| [`docs/history/`](docs/history/README.md) | **how it got here.** Never normative. Never rewritten to match the present |
| [`ROADMAP.md`](ROADMAP.md) | what is not built yet |
| [`README.md`](README.md) | what this is, for somebody arriving |

## Map

| | |
|---|---|
| `packages/i18n` | message catalogs and locale negotiation. A leaf: depends on nothing |
| `packages/geo` | location lookup over a local GeoNames dataset (SQLite) |
| `packages/core` | the engine and the `qimen` CLI: solar terms, lunar calendar, sexagenary cycles, 八字, 奇門, 六壬, 紫微斗數, 太乙, 曆注, scanning an interval |
| `packages/plate` | the drawings: SVG, and PNG at a separate entry point |
| `packages/mcp` | MCP server, stdio transport |
| `apps/web` | SvelteKit: the interface at `/en` and `/it`, and the REST API under `/api` |

npm workspaces monorepo, Node ≥ 22, ESM, TypeScript. Details, and the three
package boundaries that are load-bearing, in [`docs/architecture.md`](docs/architecture.md).

## Commands

```sh
npm test                                # every workspace (vitest)
npm run test:watch -w @qimendunjia/geo
npm run typecheck
npm run build
npm run cli -w @qimendunjia/core -- chart   # or `qimen chart` once built
npm run dev -w @qimendunjia/web             # http://localhost:5173
npm start -w @qimendunjia/web               # http://localhost:3000, after build
```

`npm run geo:import -w @qimendunjia/geo` downloads **~215 MB**: run it once,
when location search does not work. Not something to run out of habit.
`npm run geo:fixture -w @qimendunjia/geo` writes a four-place stand-in
instead — enough for every test suite, refused if a database already exists.
`npm run ephe:download -w @qimendunjia/core` (~2 MB) is optional — without it
the engine falls back to Moshier, which needs no files.

## The rules

### The engine

- **English is the language of the source.** Code, comments, identifiers,
  error codes, documentation and commit messages. Italian exists only as a
  locale in the catalogs. → [`docs/i18n.md`](docs/i18n.md)
- **The engine does not localise.** `core` returns identifiers, hanzi, pinyin
  and numbers; readable text is produced at the surface. A function that
  returns a translated string is a design error. → [`docs/i18n.md`](docs/i18n.md)
- **Hanzi are not a locale, and a name carries its reading.** 休門 is the name
  of the gate, not its Chinese rendering, and it is xiūmén to every reader.
  Both travel in the engine's output at all times; the catalog supplies only
  the gloss. Identifiers are toneless pinyin, tone-numbered only where they
  would collide (`jing1men`, `jing3men`). → [`docs/i18n.md`](docs/i18n.md)
- **The engine answers no question, which is not the same as saying nothing.**
  It carries an attribute the sources hand down concordantly when it belongs
  to the configuration rather than to somebody's situation — which is why
  `Pattern` has a `valence`. It stops at the 用神, ranking, ordering hours,
  dating an outcome, advising. Such an attribute travels as an identifier and
  a glyph, **never as prose**. → [`docs/refusals.md`](docs/refusals.md)
- **No school is implicit, and a chart carries the options that produced it.**
  Every divergence is an explicit parameter with a declared default, present
  in the input type from the start; an unimplemented value is refused, never
  substituted. No function in `core` reads a global default. →
  [`docs/parameters.md`](docs/parameters.md)
- **An art natively about a life gets a board of its own, never dunjia's**, and
  **a birth enters a chart, never the other way about.** Both are the same
  refusal: the natal-Qimen graft. Each board arrives with its own input type,
  output and sources. → [`docs/refusals.md`](docs/refusals.md)
- **The five elements arrive counted, and the count is not a verdict.** Zeroes
  included: an absence weighs as much as an abundance. Strong or weak, and
  what compensates, are method steps that travel signed in a prompt.
- **Errors carry a `code` and `params`, never a sentence.** `message` is an
  English rendering for logs; a surface translates `messageKey` with `params`.
  See `GeoError`. → [`docs/i18n.md`](docs/i18n.md)
- **The lunar calendar is reckoned on 120°E, never on the chart's zone.** It is
  a published artefact: the same instant carries the same lunar date in Rome
  and in Beijing, and Chinese wartime clocks do not move it. The *civil* day,
  which the day pillar reads, does follow the chart's zone.
- **Verify against an independent implementation, not against memory.** Every
  pillar in the tests was checked against `lunar-javascript` over two
  centuries. Recalled almanac values were wrong more often than not. →
  [`docs/sources.md`](docs/sources.md)
- **A quantity added without an entry in `docs/sources.md` is a quantity
  nobody can weigh.** That register is not optional bookkeeping.

### The surfaces

- **The interface is read by someone who does not read Chinese**, and must be
  usable without a glossary. Hanzi accompany the output, always beside a
  gloss; everything the reader *operates* or *decides from* leads in their own
  language. A `title` attribute does not rescue a control whose face is a
  glyph. → [`docs/i18n.md`](docs/i18n.md)
- **A place is an identifier, or coordinates, or an identifier refined by
  coordinates — and never a name.** Half a pair is refused rather than
  half-read, and the answer says both halves. In the forms, what travels is
  what *departs* from the chosen place (`refines` in `lib/moment.ts`). One
  rule on every surface: `readPlace`, `resolvePlace`, `LocationSearch.svelte`.
  → [`docs/refusals.md`](docs/refusals.md)
- **The longitude moves a board; the latitude enters no calculation.** It is
  carried and printed. 七政四餘's 宮 division by houses is the one method that
  would read it, and `qizheng.ts` declares and refuses it. Say so in the
  documentation and **not in the form**.
- **Errors cross HTTP as `code` + `messageKey` + `params`.** The surface
  translates; nobody parses prose. See `lib/server/errors.ts`.
- **A chart is cacheable `private`, never `public`.** Its URL holds somebody's
  date, time and place of birth. The solar terms are `public`, and so is a
  太乙 年計 board and its prompt — they are about the sky and a year, and hold
  nobody's data. → [`docs/readings.md`](docs/readings.md)
- **A chart prints, and paper is the fourth appearance** — not light, which is
  a paper-*coloured* screen. Each component says whether it belongs on a
  sheet, and the drawn board is the exception CSS cannot reach. →
  [`docs/architecture.md`](docs/architecture.md)
- **Licence AGPL-3.0-or-later**, imposed by Swiss Ephemeris. Every new
  dependency must be compatible with it.

### Handing a board over

Every line here has its argument in [`docs/readings.md`](docs/readings.md);
read it before changing a prompt.

- **A board handed to a model travels computed, and never as a date.** A model
  given a date and a place casts the chart from memory and gets it wrong, and
  a wrong chart read well is unfalsifiable.
- **One board goes into a prompt, never two of one instant.** Where two boards
  agree it is frequently one fact printed twice, and a model reads that as
  corroboration. The instrument is chosen before the press and at no point
  after it.
- **The question never reaches the server.** A prompt endpoint is told
  `asked=true` and nothing more; the browser appends the text. A matter
  (`about=true`, 太乙's alone) travels the same way.
- **A consultation is where a board is handed over, and it is the only surface
  that builds a prompt.** `/[lang]` is that section — the one place here where
  the answer is not in the address. Three kinds of instrument, and the kind
  decides what the reader is asked for: 卜 a question, 命 a birth, 天 a year
  and a matter. `needs` in `instruments.ts` settles it.
- **A section is addressed by the art it lays out, and so is its endpoint.**
  `/api/qimen` answers a `qimen`. The consultation is the exception, having no
  art of its own; `/[lang]/consult` is its *name*, not a second address.
- **A 命 prompt asks for a reading of the person, and every choice travels
  signed.** The themes are commissioned in it, titled for a theme and never a
  factor; a school's method arrives named as that school's; the 用神 stays
  uncomputed and is chosen aloud.
- **Nobody is on a 太乙 board.** Its subject is a year — no question, no
  person, and `--ask` refused with a message of its own. Its nine palaces are
  numbered **one seat off the 洛書**, and every surface printing it says so.
- **How sure the numbers are stays in `docs/agent-prompt.md`**, not in a
  pasted prompt — unless it is a bound on a quantity that prompt is already
  telling a model how to read.

## Style

Commit messages in English, third person present, saying what the code does
rather than what was done. No conventional prefixes. Examples:
«Finds the twenty-four solar terms», «Exposes the chart over HTTP»,
«Determines the dun and the ju number».

**One commit a session is enough, however many surfaces it crossed.** What a
session produces now is a change to an interface that already works, and
splitting it three ways buys a history nobody reads at the cost of commits
that do not stand up alone. The subject says what the change does; what used
to be three subjects becomes the body, one paragraph a movement.

Domain identifiers are toneless pinyin where the domain is Chinese (`ganzhi`,
`jieqi`, `zhifu`, `xiumen`); everything else is English.

## Writing documentation

- **One fact, one home.** A rule stated in three places drifts in two of them.
  `docs/` owns the subject; this file carries the imperative and a pointer.
- **`docs/` is the present, `docs/history/` is the past.** A phase file is
  never edited to match what the code does now — a later phase says it revises
  an earlier one, and `docs/` changes. Nothing in `history/` is normative.
- **Do not write counts by hand.** `apps/web/test/docs.test.ts` asserts the
  ones that exist against the code, because the last hand-written count drifted.
- **Say what holds, not what changed.** «It used to be X and now is Y» belongs
  in a phase file, not in `README.md` or in `docs/`.

## Adding a feature

A feature crosses several surfaces and has a procedure of its own — see the
`new-feature` skill.
