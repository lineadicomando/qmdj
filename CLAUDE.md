# qimendunjia

Qi Men Dun Jia charts and Four Pillars: a **pure engine** (`packages/core`) and
**adapters** that expose it on different surfaces. `PLAN.md` holds the
development plan; this file holds only what has to be known before touching
anything.

## Map

| | |
|---|---|
| `packages/i18n` | message catalogs and locale negotiation. A leaf: depends on nothing |
| `packages/geo` | location lookup over a local GeoNames dataset (SQLite) |
| `packages/core` | calculation engine and the `qimen` CLI: solar terms, lunar calendar, sexagenary cycles, Four Pillars, Qi Men charts, Liu Ren boards, scanning an interval |
| `packages/plate` | the drawings: the nine palaces of a chart, the ring of twelve of a 六壬 board, glyphs, SVG and PNG |
| `packages/mcp` | MCP server: nine tools, four resources, stdio transport |
| `apps/web` | SvelteKit: five sections at `/en` and `/it`, plus twelve GET endpoints under `/api` |

npm workspaces monorepo, Node ≥ 22, ESM, TypeScript.

`docs/` holds the reference documents — things a reader looks things up in
rather than reads through. **`docs/sources.md` is the register of where every
number comes from**, and it is not optional bookkeeping: a quantity added to
the engine without an entry there is a quantity nobody can weigh. See
`docs/README.md` for what belongs in that directory and what belongs in
`PLAN.md` instead.

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

## Constraints

- **English is the language of the source.** Code, comments, identifiers, error
  codes, documentation and commit messages. Italian exists only as a locale in
  the catalogs of `packages/i18n`, never in the source.
- **The engine does not localise.** `core` returns identifiers, hanzi and
  numbers; readable text is produced at the surface. A function that returns a
  translated string is a design error.
- **The engine answers no question, which is not the same as saying nothing.**
  It carries an attribute of a configuration when the sources hand it down
  concordantly and it belongs to the configuration rather than to somebody's
  situation — which is why `Pattern` has a `valence`: 門迫 *is* oppression and
  擊刑 *is* punishment, named and weighed in one line of one text, and a table
  that split them would report half of what it read. It stops at everything
  that needs a question to have been asked: choosing the 用神, ranking palaces,
  ordering hours, dating an outcome, advising. Any such attribute travels as an
  identifier and a glyph, **never as prose** — a verdict that arrives inside an
  English gloss is a verdict nothing can test.
- **Chinese characters are not a locale.** 休門 is not the Chinese rendering of
  "Rest Gate": it is the name of the gate, and every reader expects to see it.
  Hanzi travels in the engine's output at all times; the catalog supplies only
  the gloss beside it. Identifiers are toneless pinyin (`xiumen`, `tianpeng`).
- **A name carries its reading.** Every named thing in the engine has a
  `pinyin` beside its `hanzi` — tone marks, one word, `xiūmén`. It is part of
  the name and not a locale: 休門 is xiūmén to every reader, and a function
  that returned a different one per language would be the same design error a
  translated string is. A surface that prints the hanzi prints the reading
  with it, because a glyph alone is, to the reader this is built for, a shape
  with no sound — unsayable, unsearchable, unaskable. The tones are what the
  identifiers had to drop, and they part what the identifiers cannot: 戊 wù
  from 午 wǔ, 驚門 jīngmén from 景門 jǐngmén. See `docs/sources.md` for the
  readings that were chosen deliberately, and `test/pinyin.test.ts` for the
  check that no name is missing one.
- **The interface is read by someone who does not read Chinese**, and it must
  be usable by them without a glossary. This does not contradict the rule
  above, it bounds it: hanzi accompany the engine's output — the palaces, the
  tables, the names of things — always beside a gloss, never alone.
  Everything the reader is expected to *operate* or *decide from* leads in
  their own language: buttons, labels, options, the choices in a `select`.
  A control whose face is a glyph, or an option that reads `zishi`, is one
  nobody can use on purpose; a `title` attribute does not rescue it, since
  nobody hovers what they cannot recognise. The hanzi stands beside the word
  only where what is named is Chinese — 時辰 is, a day is not.
- **Errors carry a `code` and `params`, never a sentence.** `message` is an
  English rendering for logs; a surface translates `messageKey` with `params`.
  See `GeoError`.
- **Licence AGPL-3.0-or-later**, imposed by Swiss Ephemeris. Every new
  dependency must be compatible with it.
- **No school is implicit.** Different schools produce different charts from
  identical input: every divergence is an explicit parameter with a declared
  default, present in the input type from the start. See `PLAN.md` § 3.
- **A chart carries the options that produced it.** No function in `core` reads
  a global default: a saved chart must reproduce identically.
- **`packages/plate` imports nothing from `core`, not even types.** It
  redeclares the shape it needs — of a chart and of a 六壬 board alike — and a
  test asserts the copies still agree. The
  CLI lives in `core` and draws, so the other direction would close a cycle —
  and a drawing that could reach the engine would end up computing.
- **The PNG lives at `@qimendunjia/plate/png`**, a separate entry point: it
  pulls a native module that must never reach the browser.
- **A PNG needs a CJK font *and* `fontconfig`.** The glyphs are the content;
  without either the drawing comes out an empty grid, silently. `png.ts`
  refuses to draw when it detects it, and the runtime image installs both.
- **The client imports only types from `core`.** A value import would drag the
  ephemerides and a native module into the browser bundle.
- **A chart is cacheable `private`, never `public`.** It is a pure function of
  its URL, but the key of a shared cache would hold somebody's date, time and
  place of birth. The solar terms are `public`; they are about the sky.
- **Errors cross HTTP as `code` + `messageKey` + `params`.** The surface
  translates; nobody parses prose. See `lib/server/errors.ts`.
- **A chart handed to a model travels computed, and never as a date.** A model
  given a date and a place casts the chart from memory and gets it wrong, and
  a wrong chart read well is unfalsifiable. `readingPrompt` in
  `core/src/prompt.ts` puts the chart inside a fence and `docs/agent-prompt.md`
  around it — the 用神 is the reader's, the fortunes are not a score, a 凶 is
  not advice, and the reading says what it is for. Handing over the chart
  without that would be this project outsourcing in a paragraph what it
  declines to do in code. How sure each number is stays in
  `docs/agent-prompt.md`, for an agent that can look it up: in the pasted
  prompt it was a paragraph the model recited unasked, beside a disclaimer
  that already says this is entertainment.
- **One board goes into a prompt, never two of one instant.** A consultation
  is an act and takes one instrument, chosen before the press and at no point
  after it — a control that switched boards over a standing answer would
  either cast again, at an instant nobody asked at, or show one laid for a
  moment nobody asked at. The reason is not tidiness: a Qi Men chart and a
  六壬 board share the day pillar, the 旬, the 空亡, the 遁干 and seven of the
  eight 八神, so **where they agree it is frequently one fact printed twice**,
  and a model reading that as corroboration counts one datum as two with
  complete confidence. No transmitted rule combines the 三式 — they were read
  separately and compared. That comparison is still available, in the sections
  that are addresses, where nothing is being asked. See `PLAN.md` § 4 phase 14.
- **The question never reaches the server.** `/api/chart/prompt` is told
  `asked=true` and nothing more, and the prompt ends on the line that
  introduces a question for the browser to append. What somebody asks a chart
  is theirs, and a query string is written into every log along the way.
- **A consultation is an act, not an address.** `/[lang]` — the root of a
  language, and the section the nav lists first — is the one place where the
  answer is not in the URL: the chart is cast by `fetch` at the instant it is
  asked for and held in the component, because **the instant of asking is the
  instant that is cast** — the question comes before the casting or it is a
  caption on a chart that was already there. Which is why the page asks two
  things in the open, the question and the place: the date and the time are
  under the options and empty, and empty is the press. A reader who means
  another instant fills them, and that is a choice they made rather than a
  field they had to get past. Only the setup travels in the address.
  Everywhere else, asking is navigating — the chart is `/[lang]/chart`, which
  is where it moved from the root when the consultation took the lead. See
  `navigation.ts` for what that cost and what it bought.
- **A chart prints, and paper is the fourth appearance.** Not light: light is
  a paper-*coloured* screen, set against a lit surface. `@media print` in
  `app.css` resets the properties for white, at the specificity of
  `[data-color-scheme='dark']` so a reader who picked dark does not print a
  page of toner; each component says whether it belongs on a sheet, and the
  table of palaces drops its scrolling frame — a frame that still clips on
  paper prints three palaces of nine and gives no sign of the other six. The
  board is the exception the CSS cannot reach: an `<img>` carries its colours
  in its address, so both pages draw a second copy at `scheme=light`, hidden
  on screen and warmed as soon as the chart is cast, since `beforeprint`
  cannot wait for a picture. **The consultation prints from the page and never
  from a route of its own**, for the reason above it: a route would have to be
  told the question.
- **A birth enters a chart, never the other way about.** There is one frame
  and it is divination. A birth is placed *inside* the chart of the moment —
  `nianming.ts`: 本命, the year pillar of the birth, and 行年, the year being
  lived — which is what 《遁甲演義》 prescribes and the reverse of a natal
  chart. It reports the palaces the two pairs fall in, the mooring of the
  branch and the 納音 against that ground, and stops: 生旺 and 囚死 are the
  text's own verdicts and need a question to have been asked. **Which palace
  stands for which part of a life is refused wherever a 年命 appears** — that
  is the doctrine `purposes.ts` declines, from the sources it names as
  unusable, and it is where a model invents most confidently. The natal frame
  that used to say so instead of saying anything is gone; see `PLAN.md` § 4
  and the 年命 section of `docs/sources.md`. **This rule is about the dunjia
  board and is not loosened by the one below it.**
- **An art that is natively about a life gets a board of its own, never
  dunjia's.** The engine computes 命 (mìng), the fate arts, as well as 卜
  (bǔ), the divinatory boards — 八字 was always here, as the substrate a chart
  is cast from, and `PLAN.md` § 4 phases 13, 15 and 16 add 六壬, the almanac layer
  and 七政四餘. Calling that class "the natal chart" is the error that
  produced the modern natal Qi Men: the Western natal chart is one instance of
  a class the tradition already fills several ways, and naming the class after
  that instance sends people looking for the missing Chinese one and grafting
  it onto whatever board is at hand. Each board arrives with its own input
  type, its own output and its own sources; none inherits a default from
  dunjia's, and none lends dunjia a doctrine it does not have. **The scope
  widened, the standard did not**: a board earns its place by having a
  procedure a source states, never by filling a hole in a catalogue.
- **The lunar calendar is reckoned on 120°E, never on the chart's zone.** It
  is a published artefact: the same instant carries the same lunar date in
  Rome and in Beijing. Chinese wartime and summer clocks do not move it. The
  *civil* day, which the day pillar reads, does follow the chart's zone.
- **Verify against an independent implementation, not against memory.** Every
  pillar in the tests was checked against `lunar-javascript` over two
  centuries. Recalled almanac values were wrong more often than not.
- **Location search matches by range, never with `LIKE`.** SQLite cannot use
  an index for `LIKE 'prefix%'` under the default collation and falls back to
  scanning every name in the table. See `prefixUpperBound` in `geo/search.ts`
  and the query-plan test that guards it.

## Style

Commit messages in English, third person present, saying what the code does
rather than what was done. No conventional prefixes. Examples:
«Finds the twenty-four solar terms», «Exposes the chart over HTTP»,
«Determines the dun and the ju number».

**One commit a session is enough now, however many surfaces it crossed.** The
history up to the readings under the board is layered one stage at a time —
the calculation, then the surfaces, then the documentation — because while the
engine was being built each stage was a thing that could be wrong on its own
and had to be findable on its own. That is done. What a session produces now
is a change to an interface that already works, and splitting it three ways
buys a history nobody reads at the cost of commits that do not stand up alone.
The subject still says what the change does; what used to be three subjects
becomes the body, one paragraph a movement.

Domain identifiers are toneless pinyin where the domain is Chinese
(`ganzhi`, `jieqi`, `zhifu`, `xiumen`); everything else is English. Where
dropping the tone would collide, and only there, the tone number is kept:
`jing1men` is 驚門 and `jing3men` is 景門.

## Adding a feature

A feature crosses several surfaces and has a procedure of its own — see the
`new-feature` skill.
