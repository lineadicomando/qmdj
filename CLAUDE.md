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
| `packages/core` | calculation engine and the `qimen` CLI: solar terms, lunar calendar, sexagenary cycles, Four Pillars, Qi Men charts, Liu Ren boards, 紫微斗數 boards, 太乙 boards, scanning an interval |
| `packages/plate` | the drawings: the nine palaces of a chart, the ring of twelve a 六壬 board and a 七政四餘 board share, the 太乙 grid with its empty middle and sixteen border seats, the 紫微斗數 four by four with the birth in the middle, glyphs, SVG and PNG |
| `packages/mcp` | MCP server: twelve tools, four resources, stdio transport |
| `apps/web` | SvelteKit: eight sections at `/en` and `/it`, plus twenty-six GET endpoints under `/api` |

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
  place of birth. The solar terms are `public`; they are about the sky. **So is
  a 太乙 board**, and for the same reason rather than by exception: a 年計 board
  is a function of the year and holds nobody's data, which makes `/[lang]/taiyi`
  the one section here that can be linked, shared and indexed as it stands.
- **Errors cross HTTP as `code` + `messageKey` + `params`.** The surface
  translates; nobody parses prose. See `lib/server/errors.ts`.
- **A chart handed to a model travels computed, and never as a date.** A model
  given a date and a place casts the chart from memory and gets it wrong, and
  a wrong chart read well is unfalsifiable. The prompt builders in
  `core/src/prompt.ts` put the board inside a fence and `docs/agent-prompt.md`
  around it — the 用神 is the reader's, the fortunes are not a score, a 凶 is
  not advice, and the reading says what it is for. Handing over the chart
  without that would be this project outsourcing in a paragraph what it
  declines to do in code. How sure each number is stays in
  `docs/agent-prompt.md`, for an agent that can look it up: in the pasted
  prompt it was a paragraph the model recited unasked, beside a disclaimer
  that already says this is entertainment. **The exception is a bound on a
  quantity the prompt is already telling a model how to read.** The direction
  the twelve 人事宮 are numbered in travels inside the 七政四餘 prompt, and so
  does the frame the 宿 are cut by, because that prompt spends a paragraph
  saying those seats are names and not assignments — and a caution about a
  quantity, arriving with the instruction that governs it, is part of the
  instruction rather than a recital beside it. The test is whether removing
  the line would leave an instruction a model could follow confidently and
  wrongly. A general account of how this engine knows things fails that test
  and stays where it was.
- **太乙 is a board of 天, and its subject is a year.** It has a section, four
  endpoints, a drawing, an MCP tool and — since phase 21 — a prompt and a seat
  in the consultation. Phase 20 withheld both, and not out of caution about the
  board: the ground was that what such a board would be handed over *for* had
  not been designed, its subject being neither a question nor a person. Phase
  21 designed it, and the register is the whole of the answer: a reading here
  is **descriptive and never predictive**, its sections are titled for parts of
  a figure rather than for anything in the world, and two refusals bound it.
  **A reading is for a matter, and the matter is not a question.** That is what
  the first cut of the register got wrong and what the first output showed: with
  the doctrine refused and nobody on the board, a prompt made of bounds alone
  produced a precise account of a figure that never says «and so?». A **matter**
  — `--about`, `about=true`, a required field in the consultation — names what
  is being *looked at*: a field of view with two sides in it, which is what the
  two counts are counts of. A question asks what will happen and puts the reader
  inside a figure they are not in; a matter is the frame that makes the figure
  readable and is what the assignment of 主 and 客 has to be made **for** — the
  prompt had always said «chosen for the matter being looked at» while every
  caller was structurally unable to supply one. It travels as `asked` does:
  a boolean to the server, the text appended by the browser, never in a query
  string. Without one the prompt reads the figure and **says the assignment was
  never made**, rather than sending a model to invent a pair of parties.
  The received doctrine — dynastic, dated, falsifiable by nobody — stays out.
  **What each condition *is* travels; what it foretells does not.** 卷三 states
  each of the seven three times over — a trigger, a 之義 saying what the shape
  is, then 若… and 嵗計遇之… saying what will befall the realm — and only the
  middle one is carried, as `PATTERNS[id].meaning`, for the reason
  `Pattern.valence` is carried. 對 has no such sentence and carries none: where
  the sources say nothing the silence travels, and a seventh line invented so
  the table looked even would be this engine founding a school. **The per-palace
  readings of 卷二 are declined entirely**, because they are a Tang province and
  a dynastic omen and there is no third thing behind them — there is no
  non-dynastic interpretive layer in this text to extract, and `docs/sources.md`
  now says so as a refusal rather than by omission. The clauses ride **inside
  the fence**, out of `formatTaiyi`, which is also why «a name carries its
  reading» needs no exemption for them: a quoted classical clause is not a name,
  and in a transcript that distinction never has to be drawn.
  And **nobody is on this board**: the reader is not in it, no seat here stands
  for a part of their life, and a forecast for them is the natal-Qimen error
  arriving in a new register. Which is why nothing is asked of it anywhere —
  no question box in the consultation, no `asked` on `/api/taiyi/prompt`, and
  `--ask` refused by the CLI with a message of its own.
  **The engine still never says who is 主 and who is 客.** That is the first
  interpretive act the system asks for and it is the reader's exactly as the
  用神 is; what the prompt does is commission it and require it signed, which
  is what `prompt.yongshen` already does for a chart. Assigning it upstream
  would be answering the question this project does not ask.
  One thing every surface printing this board must say, and it is the
  numbering: its **nine palaces are numbered one seat off the 洛書** (卷二:
  九宮皆差一位), so 一宮 is the north-west here and the north in a chart — a
  reader holding a chart beside this board reads all eight one seat wrong
  otherwise, and the line is what stops them. It is inside the transcript, so
  every surface carries it without remembering to; the prompt states it a
  second time among its rules, because there it is not a caption on the data
  but an instruction governing every position below it.
  **That this board is checked against the text that states it and against
  nothing that runs** is the other thing that has to be said, and it is said
  once rather than on every sheet: it is a fact about the figure and not a
  caption to one year's board, so it belongs in the notes, and the section
  stopped printing it under a picture where it read as a disclaimer on that
  picture. The transcript keeps it — `cli.value.taiyiEvidence`, printed by
  `format.ts` — because a transcript travels to where no notes page follows it,
  and it reaches the prompt inside the fence for the same reason. The MCP tool
  says it in its own description. **Until the notes section is written the
  account is only in the transcript and in `docs/sources.md`**, which is a debt
  and not an arrangement. See `PLAN.md` § 4 phases 20 and 21 and the 太乙
  section of `docs/sources.md`.
- **One board goes into a prompt, never two of one instant.** A consultation
  takes one instrument, chosen before the press and at no point after it — a
  control that switched boards over a standing answer would either cast again,
  at an instant nobody asked at, or show one laid for a moment nobody asked
  at. The reason is not tidiness, and **it does more work now that there are
  five boards rather than less**: a Qi Men chart and a 六壬 board share the day
  pillar, the 旬, the 空亡, the 遁干 and seven of the eight 八神; the twelve 宮
  of a 七政四餘 board *are* the ring a 六壬 board's 月將 is seated on; and a
  八字 is the substrate the other three are built from, so beside any of them
  it is the same four pillars a second time. **Where two boards agree it is
  frequently one fact printed twice**, and a model reading that as
  corroboration counts one datum as two with complete confidence. No
  transmitted rule combines the 三式 — they were read separately and compared.
  That comparison is still available, in the sections that are addresses,
  where nothing is being asked. **太乙 overlaps none of the other four and the
  rule holds for it anyway**, on the first half rather than the second: a model
  handed a board of a year beside a board of a person reads the year onto the
  person, which is the one thing that board's prompt spends a paragraph
  refusing. See `PLAN.md` § 4 phases 14, 18 and 21.
- **The question never reaches the server.** A prompt endpoint is told
  `asked=true` and nothing more, and the prompt ends on the line that
  introduces a question for the browser to append. What somebody asks a chart
  is theirs, and a query string is written into every log along the way. Under
  an instrument of 命 or of 天 there is no question to withhold — nothing is
  asked of those boards — and the line the prompt ends on is not there either.
  Under 天 that is what makes `/api/taiyi/prompt` the one prompt endpoint
  cacheable `public`: with nothing withheld there is nothing to keep out of a
  shared key, because a 年計 board and its instructions are a pure function of
  a year and hold nobody's data.
- **A consultation is where a board is handed over, and it is the only surface
  that builds a prompt.** `/[lang]` — the root of a language, and the section
  the nav lists first — is the one place where the answer is not in the URL:
  the board is cast by `fetch` and held in the component, and only the setup
  travels in the address. It carries every instrument, in **three** kinds, and
  **the kind decides what the reader is asked for**. Under an instrument of 卜
  — a Qi Men chart, a 六壬 board — the reader is asked a question, and the
  instant of asking is the instant that is cast: the question comes before the
  casting or it is a caption on a board that was already there, which is why
  the date and the time sit under the options and empty, and empty is the
  press. Under an instrument of 命 — 八字, 七政四餘 — there is no question and
  the instant is not now: the board is laid on a birth, and the fields ask for
  that instead. Under an instrument of 天 — 太乙, and it is the only one —
  there is no question and no person: the board is laid on a **year**, no place
  and no hour enter it, so `MomentForm` is absent altogether and the whole of
  the form is one number. Empty there is the year being lived, which is where
  this section's original instinct survives into a kind that asks nothing and
  for the reason it always had: an empty year is everybody's answer where an
  empty birth is nobody's. The three values live in `needs`, in
  `instruments.ts`, which also settles the address and whether a moment comes
  back at all — a 年計 board has none, and reading `castMoment` unguarded is an
  exception in the middle of a successful cast. What does not turn with the
  kind is the rest of the rule — one
  instrument to a consultation, chosen before the press, and the prompt built
  here and nowhere else. The sections that are addresses show boards and their
  transcripts, and asking there is navigating: the chart is `/[lang]/chart`,
  which is where it moved from the root when the consultation took the lead.
  A prompt is an asking and belongs where the asking is. See `navigation.ts`
  for what that cost and bought, and `PLAN.md` § 4 phase 18 for the widening.
- **A 命 prompt asks for a reading of the person, and the themes are
  commissioned in it.** The subject is the person the board was laid on —
  `prompt.ming.configuration` opens on who they are, and the reply is laid out
  by `mingClosing` in six steps: the disclaimer, the birth situated in the
  model's own words, the board read whole from a centre, the themes of a life
  in short sections titled for a theme and never a factor
  (`prompt.ming.sections`: temperament, the forces in conflict, the work on
  oneself, undertakings as functions, the ties), the per-board inspection list
  those sections draw on, and an ending that opens. Every choice travels
  signed: which seat, god or element carries a theme is said as it is made,
  and a school's method arrives named as that school's — the seats of 七政四餘
  are read by their transmitted names (`prompt.qizheng.houses`), the ten gods'
  readings toward a life arrive as named teachings (`prompt.bazi.gods`), and
  the favourable element stays uncomputed and is chosen aloud
  (`prompt.bazi.yongshen`). What a reading never does is in
  `prompt.ming.limits` and `prompt.ming.register`: no dated predictions, no
  medical, psychiatric, legal or financial counsel, no lucky numbers or
  gambling, no partner judged and no compatibility settled, and the verbs held
  conditional — «tends to», never «you will». A tension is never handed back
  as a defect (`prompt.ming.tension`), a bound is named where it bites and
  never as an opening section (`prompt.ming.rulesStayOut`), the transcript is
  never recited back (`prompt.ming.noRecital`), and every term is explained at
  first use (`prompt.ming.explain`). The direction the twelve 人事宮 are
  numbered in still travels as the weakest quantity on that board
  (`prompt.qizheng.direction`), and it matters more now that the seats work.
- **The five elements arrive counted, and the count is not a verdict.**
  `bazi/distribution.ts` counts the eight characters — each stem by its
  element, each branch by its own — zeroes included, because an absence weighs
  as much as an abundance. The transcript prints it so a model never recounts;
  declaring the day master strong or weak from it, and choosing what
  compensates an absence, are method steps and travel signed
  (`prompt.bazi.noScore`, `prompt.bazi.distribution`). This engine still
  computes no 用神 and no 格局.
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
  board.** It is not loosened by the one below it, and not by the consultation
  carrying both kinds of instrument: a 命 board standing beside dunjia in one
  select lends dunjia nothing.
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
- **紫微斗數 names two boards, and this engine computes one of them.** What is
  here is 《全書》's fourteen 正曜, cut by a 五行局 and a lunar day. The other
  transmission — the 十八飛星 of 《全集》 and 《捷覽》 — has eighteen stars
  counted off the **year branch**, no 五行局, no 天府, no mirrored second file,
  and not one of the fourteen on it. Both are now on the shelf in
  `texts/ziwei`, and the shelf is the trap: 天貴, 天福 and 天壽 have no rule in
  卷二 and a rule in the other book, and what 《全書》 calls 天空 is what that
  book calls 地空. A placement carried across is a graft and not a gap being
  filled — the natal-Qimen error, made smaller and between two books that share
  a title. See the 紫微斗數 section of `docs/sources.md`.
- **The lunar calendar is reckoned on 120°E, never on the chart's zone.** It
  is a published artefact: the same instant carries the same lunar date in
  Rome and in Beijing. Chinese wartime and summer clocks do not move it. The
  *civil* day, which the day pillar reads, does follow the chart's zone.
- **Verify against an independent implementation, not against memory.** Every
  pillar in the tests was checked against `lunar-javascript` over two
  centuries. Recalled almanac values were wrong more often than not.
- **A place is an identifier, or coordinates, or an identifier refined by
  coordinates — and never a name.** Nothing here turns a name into a place:
  there are dozens of towns called Rome, and picking the most populous for
  somebody produces a chart that looks right and is wrong. What the surfaces
  take is a `locationId` out of `/api/locations`, or a `latitude` and a
  `longitude` with a `timezone`, or both together. **The third is a
  refinement and not a contradiction**: the coordinates replace the pair
  GeoNames holds, the zone stays the named place's, and a `timezone` sent
  beside an identifier is ignored, because the identifier already answered it
  — a search knows the town and not the hamlet three valleys up, and the
  longitude is what the correction to true solar time is made of. Half a pair
  is refused rather than half-read: a latitude alone would be answered on the
  meridian of Greenwich and look exactly like the chart that was asked for.
  The answer then **says both halves** — `Rome, Lazio, Italy · 41.8919,
  13.5113` — since a sheet naming a town for a board laid fifty kilometres
  away is untrue and nothing downstream could tell. One rule reads the same on
  every surface: `readPlace` in `lib/server/params.ts`, `resolvePlace` in
  `mcp/src/shared.ts`, and `LocationSearch.svelte` for the two forms that ask.
  **In the forms a chosen place fills those fields with its own, and what is
  filled is not what is asked for.** A refinement is a nudge, and nobody
  nudges an empty box whose starting point they would have to go and look up;
  but «filled» then stops saying anything, so what travels is what *departs* —
  `refines` in `lib/moment.ts`, the same rule by which `chaibu` is never
  written into an address. An untouched pair is the place said twice: carried,
  it would put a doorstep in every link and print «Roma · 41.8919, 12.5113»
  under every chart of Rome as a refinement nobody made.
  In this engine **the longitude is what moves a board**; the latitude is
  carried and printed and enters no calculation — 七政四餘's 宮 division by
  houses is the one method that would read it, and `qizheng.ts` declares and
  refuses it. That bound is stated here and in the README, and **not in the
  form**: nothing under that fold explains itself, on the ground that a
  control somebody opens on purpose to type a longitude into is opened by
  somebody who knows what one is. Keep it that way — the place to widen is
  the documentation, not a paragraph over three fields.
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
