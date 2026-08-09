# qimendunjia — development plan

Qi Men Dun Jia charts and Four Pillars: a **pure engine** plus **adapters** that
expose it on different surfaces. It follows the architecture of
`it-undicesimacasa` — npm workspaces monorepo, Node ≥ 22, ESM, TypeScript,
`sweph` for ephemerides, GeoNames on SQLite for locations, AGPL-3.0-or-later.

Two things differ from that model:

1. A **Chinese calendrical layer** sits between the ephemerides and the chart.
   It does not exist in the reference project, and it carries nearly all of the
   technical risk.
2. The project is **bilingual from the first commit** — English and Italian,
   English as the default. The reference is monolingual Italian down to its
   identifiers; here everything reverses.

**Language policy**: source code, comments, identifiers, error codes,
documentation, README, and commit messages are in English. Italian exists only
as a locale in the message catalogs, never in the source.

---

## 1. Layout

| | |
|---|---|
| `packages/core` | calculation engine and the `qimen` CLI. No dependency on HTTP, frameworks, or MCP |
| `packages/i18n` | message catalogs and locale negotiation. A leaf package: depends on nothing |
| `packages/geo` | location lookup over a local GeoNames dataset (SQLite) — **ported from undicesimacasa** |
| `packages/plate` | the drawing: nine-palace grid, glyphs, colours, SVG and PNG. Does not depend on `core` |
| `packages/mcp` | MCP server, stdio transport |
| `apps/web` | SvelteKit: interface plus REST API, GET endpoints |

npm scope `@qimendunjia/*`. CLI binary `qimen`. The drawing package is `plate`
because a Qi Men chart is a 盤 — a nine-cell board, not a wheel.

### The layer undicesimacasa does not have

```
packages/core/src/
├── time.ts            local → UT (luxon + IANA), as in the reference
├── true-solar.ts      true solar time: equation of time + longitude correction
├── solar-terms.ts     the 24 jieqi, from sweph.solcross_ut
├── lunar.ts           new moons, lunar months, intercalary month
├── ganzhi.ts          the sexagenary cycles of year, month, day, hour
├── nine-palaces.ts    Luoshu grid, trigrams, elements, the palace hosting 5
├── bazi/              the Four Pillars
└── dunjia/            the Qi Men chart
```

`solar-terms.ts` is the pivot. The 24 solar terms are the instants at which the
Sun's apparent longitude crosses a multiple of 15°; `sweph.solcross_ut` returns
them directly, at Swiss Ephemeris precision. From there follow the year boundary
(Lichun), the month pillar, the ju number, and the luck cycles.

New moons — needed for the Zhirun method and for the lunar calendar — have no
dedicated function in `sweph`; they are found by iterative search on Sun–Moon
elongation. `mooncross_ut` covers crossings of a fixed longitude instead.

---

## 2. Internationalisation

### The rule

**The engine does not localise, exactly as it does not interpret.** `core`
returns stable identifiers and machine-readable data. Human-readable text is
produced at the surface, from the catalogs in `packages/i18n`. Any function in
`core` that returns a translated string is a design error: it makes the same
result untestable across locales and couples the engine to a UI concern.

### Three kinds of string, three treatments

| | Example | Where it lives |
|---|---|---|
| **Identifier** | `xiumen`, `tianpeng`, `zhifu` | `core`, ASCII pinyin without tones, never translated |
| **Hanzi** | `休門`, `天蓬`, `值符` | `core`, part of the domain data — **not** a locale |
| **Label** | "Rest Gate" / "Porta del Riposo" | `i18n`, keyed by identifier |

The middle row matters. Chinese characters are not an English or Italian
rendering of anything: an Italian reader and an English reader both want to see
休門 in the palace. Hanzi therefore travels in the engine's output regardless of
locale, and the catalog supplies only the vernacular gloss beside it.

A useful consequence: the SVG drawing is **largely locale-independent**, because
the palaces contain hanzi. `plate` needs a locale only for captions and legend,
which keeps it a near-pure rendering package.

### Errors

`ChartError` carries an English `code` (`INVALID_DATE`, `UNKNOWN_TIMEZONE`,
`INVALID_COORDINATES`, `EPHEMERIS_FAILURE`, …) plus a `params` record. The
`message` is an English fallback for logs and stack traces; surfaces translate
by code. Throwing localised sentences from a pure engine would reintroduce the
coupling the whole design avoids.

The same holds for warnings — an ambiguous local hour, a nonexistent hour, a
polar-latitude fallback. Each is a `{ code, params }` pair, not a sentence.

### The catalog

No i18n framework. The message set is mostly nominal labels, and two locales do
not justify a runtime dependency that must also clear AGPL compatibility.

```ts
export type Locale = 'en' | 'it';
export type MessageKey = keyof typeof en;

export const catalogs: Record<Locale, Record<MessageKey, string>> = { en, it };
```

Typing the Italian catalog as `Record<MessageKey, string>` makes a missing key a
compile error rather than a runtime fallback. A test asserts key parity in both
directions, so a stale Italian entry surfaces too. Interpolation is a ten-line
`format(template, params)`; if UI copy later grows past labels and short
warnings, Paraglide is the upgrade path.

Dates and numbers go through `Intl.DateTimeFormat` and `Intl.NumberFormat`.
**Input formats do not follow the locale**: dates are always ISO `YYYY-MM-DD` on
every surface, so a shared URL means the same thing everywhere.

### Locale on each surface

| Surface | Negotiation |
|---|---|
| Web | path prefix `/en/…`, `/it/…`; `/` redirects on `Accept-Language`, falling back to `en`. Canonical English slugs (`/chart`, `/bazi`, `/calendar`) |
| REST API | `?lang=` query parameter, default `en`. Affects `label` fields and warning text only — identifiers, hanzi and numbers never change |
| MCP | `lang` parameter per tool, default `en`; server instructions in English |
| CLI | `--lang` flag, otherwise `LC_ALL`/`LANG`/`LANGUAGE`, otherwise `en` |

The path prefix rather than a query parameter is deliberate: the interface is
public and indexable, and the two languages should be distinct addresses.
The API keeps `lang` as a query parameter because it composes with the other
chart parameters already in the URL.

### `geo` is already bilingual, and English is free

`packages/geo` in the reference already has a two-locale type and a `lang`
option: only the default flips to `en`.

The import script needs no change at all for English. GeoNames stores the
international exonym in the primary `name` column — verified against the
reference dataset: `Rome`, `Munich`, `Naples`, `Paris`, `Beijing` — which is
exactly what the English locale wants. `countryInfo.txt` likewise carries
English country names. The expensive streaming pass over `alternateNames.zip`
therefore exists solely for Italian, and `LANG = 'it'` stays as it is.

---

## 3. Decisions to take before writing code

The engine cannot have an implicit "correct" behaviour: different schools
produce different charts from identical input. Every divergence must be an
**explicit parameter with a declared default**, present in the input model from
day one — as `house_system` is in undicesimacasa.

| Parameter | Values | Proposed default |
|---|---|---|
| `method` | `chaibu` (拆補), `zhirun` (置閏), `maoshan` (茅山) | `chaibu` |
| `plate` | `zhuan` (轉盤), `fei` (飛盤) | `zhuan` |
| `centreLodging` | `kun` (寄坤二), `dun` (陽遁寄二 · 陰遁寄八) | `kun` |
| `trueSolarTime` | boolean | `true` |
| `yearBoundary` | `lichun` (立春), `chunjie` (正月初一) | `lichun` |
| `ziHour` | `late` (23:00 → next day), `single` | `late` |
| `system` | `shijia` (時家), later `rijia`/`yuejia`/`nianjia` | `shijia` |

The first two are the most divisive and are not optional. The rest may ship with
a single implemented value provided the parameter already exists in the type:
adding it later breaks the API, MCP, the CLI, and every shared URL at once.

**Derived constraint**: no function in `core` reads a global default. Options
arrive as arguments, and the chart carries them in its own output — a saved
chart must reproduce identically.

---

## 4. Phases

### Phase 0 — Scaffolding

Monorepo, `tsconfig.base.json`, workspaces, vitest, `.gitignore`, LICENSE
AGPL-3.0-or-later, `CLAUDE.md` with the constraints, `graphics/`.

`packages/i18n` first, even while nearly empty: it is a dependency of everything
else, and retrofitting it is what produces hardcoded strings.

`packages/geo` ported from undicesimacasa: `database.ts`, `search.ts`,
`types.ts`, `schema.sql`, `scripts/import-geonames.mjs`. Scope, comments and
error codes translated; default locale to `en`. Dataset and schema follow the
reference exactly — `cities500`, ~235 000 places, a database of about 90 MB.

Reading `allCountries` instead was tried and reverted. It does make every
hamlet findable, but it costs 5 048 805 places and a 1.25 GB database, and it
drags a second-level subdivision and a denormalised index in with it to keep
search responsive. Someone born below five hundred inhabitants enters
coordinates and timezone by hand, which the API accepts in place of an
identifier. If that trade is ever revisited, the measurements are in § 5.

One deliberate departure from the reference remains: **prefix matching is a
range comparison, not `LIKE`**. Under the default collation SQLite cannot use
an index for `LIKE 'prefix%'` and scans every name in the table — 111 ms
against 2.9 ms for the seek, per keystroke. The behaviour is identical; only
the query plan differs. A test asserts the plan.

> Commits: `Sets up the monorepo and its packages` · `Provides message catalogs for English and Italian` · `Searches locations against the local GeoNames dataset`

### Phase 1 — The calendrical layer

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

### Phase 2 — Four Pillars

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

### Phase 3 — The Qi Men chart

`dunjia/`, one module per layer of the chart:

| | |
|---|---|
| `ju.ts` | yang/yin dun and the ju number, for each of the three methods. The three yuan from the futou |
| `earth-plate.ts` | the three marvels and six instruments across the nine palaces, per the ju |
| `heaven-plate.ts` | zhifu over the hour-stem palace; rotation or flight |
| `stars.ts` | the nine stars |
| `gates.ts` | the eight gates, zhishi from the hour palace |
| `spirits.ts` | the eight spirits, direction per yang/yin dun |
| `patterns.ts` | fuyin, fanyin, sanqi deshi, qinglong fanshou, feiniao diexue, wubuyu shi, menpo, jixing, rumu, void |
| `strength.ts` | the five seasonal states of strength |

**The line not to cross** — *restated, and the first version of it was in the
wrong place.* It read: a configuration such as qinglong fanshou is a structural
fact, that it is auspicious is not, and the engine reports the one and never
the other. That line does not exist in the tradition it is drawn across. The
classical sources do not name an arrangement and rate it in a second step:
門迫 *is* 迫, oppression; 擊刑 *is* 刑, punishment; the name and the fortune
arrive in the same line of the same text. Splitting them meant reporting half
of what was read.

And it did not hold. The fortune came in anyway, through the glosses —
`label.pattern.menpo` was «gate oppressed», which is not a neutral phrase —
where it could not be tested, sourced or contradicted, and where it existed
once per locale rather than once. The rule was pushing the judgement into the
least accountable layer in the repository.

**Where the line actually is**: an attribute belongs in the engine when the
sources hand it down concordantly *and* it is a property of the configuration
rather than of somebody's situation. The engine stops at everything that needs
a question to have been asked — choosing the 用神, ranking palaces, ordering
hours, dating an outcome, advising. `Pattern.valence` is 吉, 凶 or 吉凶, an
identifier and a glyph, never prose, glossed at the surface like every other
name. The type system still shows the boundary; it now shows the right one.

Note what did *not* change: `formatChart` prints the configurations in the
order the engine found them and no surface sorts them by fortune, because a
ranking is the thing being refused. Nothing counts 吉 against 凶.

Two findings:

- **空亡 is 吉凶, and that is transmitted rather than hedged.** The void
  withholds whatever falls into it: what was wanted does not arrive, and
  凶格落空則凶不成 — a baleful configuration fallen into the void does not come
  off either. Two halves of one rule, not two schools, so it is a third value
  and not a missing one.
- **A fortune stated against occurrences is not stated at all.** The first test
  read each fortune off charts cast for a handful of dates and asserted the
  mapping. 青龍返首 wants heaven's 戊 over earth's 丙 and never appeared in the
  sample, so the assertion passed on `undefined`. `valenceOf` exists so the
  table can be asserted whole, and a surface can name a fortune without waiting
  for a chart to exhibit one.

> Commits: `Determines the dun and the ju number` · `Lays out the earth plate` · `Rotates the heaven plate and the nine stars` · `Places the eight gates and the eight spirits` · `Recognises the configurations of the chart`

**Partly done.** `computeQimenChart` in `dunjia/` casts the 時家 chart by the
拆補 method: the dun and ju, the earth plate, the heaven plate and the nine
stars, the eight gates and the eight spirits, the chief and the chief gate.
Verified against `qimen-dunjia` on 160 charts from 2000 to 2023 — all thirteen
quantities compared agree on every one, and the derived earth plate reproduces
all eighteen published arrangements without a cell out of place.

Read that agreement for what it is: consistency with one implementation of a
contested tradition, not verification against an authority. See § 5.

**Now done too**: `patterns.ts` and `strength.ts`. The chart is read as well
as cast — 空亡, 入墓, 門迫, 擊刑, 伏吟, 反吟, 五不遇時, 青龍返首, 飛鳥跌穴,
and 旺相休囚死 for every star and gate.

There is **no runnable reference** for any of this, unlike the layout: the
rules come from Chinese-language sources and the tests state each rule against
the transmitted list it is supposed to reproduce. Where the sources disagree,
the code says so and picks one; where they were too thin to pick from, nothing
was written. **三奇得使 is deliberately absent** for that reason.

**The zhirun method is implemented too**, and choosable on every surface:
`--method` on the CLI, `method` in the address and the MCP schema, a select
in the form. `zhirun.ts` sits in the calendrical layer, not in `dunjia/`:
the 超神接氣 bookkeeping is a fact about days and terms, and the ju only
reads it. The assignment needs no history — pinning each solstice's block
inside its one-block window fixes every block between two solstices, and a
thirteenth block between two pins *is* the intercalation, repeating 芒種 or
大雪. Four findings:

- **The futou follows the day pillar.** The 符頭 is a fact about the day
  ganzhi, so it moves with `dayBoundary` and true solar time exactly as the
  pillar does, and the same instant at 23:30 can stand on either side of an
  intercalation. The alternative — reckoning the blocks on 120°E like the
  lunar calendar — would let a chart's ju contradict its own day pillar.
- **The drift bounds are looser than the pin.** The window holds 超神 to
  eight days *at the solstices*; between them it crests at ten or eleven —
  which is the classical trigger, "nine or ten days and the leap must be
  set" — and 接氣 deepens through the short winter terms. Measured over
  2018–2027: −7 to +11 days. The first version of the invariant test
  asserted the pin's bounds everywhere and was wrong.
- **The two methods disagree about more than the yuan.** Around a term's
  edges they disagree which term the ju belongs to, and near a solstice
  about the dun itself: 15 June 2024 is a yang chart under 拆補 and a yin
  one under 置閏, whose block already serves 夏至. `Ju.term` says which term
  was used, and the surfaces show it.
- **The threshold is the contested pin.** Nine days of 超神 force the leap
  here and in `kinqimen`; some sources say ten, and a Japanese tradition
  says "the futou nearest the solstice", each shifting the window by a day.
  One value is implemented and the comment on `MAX_CHAOSHEN` declares it.

Still to come: `maoshan`. `determineJu` throws `METHOD_NOT_IMPLEMENTED` for
it rather than quietly substituting, because a chart cast by the wrong method
looks right and is not. The same refusal covers the flying plate and the
systems beyond 時家: `plate` and `system` stood in the type from day one, as
§ 3 requires, but the engine never read either field — a caller asking for a
flying plate received a rotating chart with `fei` written on it.
`computeQimenChart` throws `OPTION_NOT_IMPLEMENTED` for both.

Three findings from the reading layer:

- **門迫 is derivable.** A gate is oppressed where its element controls the
  palace's. The transmitted list — metal gates in wood palaces, the water gate
  in the fire palace, and so on — is exactly the set the rule produces, so the
  list became a test instead of a table.
- **五不遇時 strikes twice on two days out of ten.** Twelve hours draw their
  stems from a cycle of ten, so two stems repeat within a day: on a 己 day the
  rule catches 乙丑 *and* 乙亥, on a 庚 day 丙子 *and* 丙戌. The mnemonic names
  only the earlier of each, and reading it as exhaustive would have been wrong.
- **入墓 does not follow the twelve stages.** The stages put the tomb of 乙 at
  戌, in Qian; the Qi Men tradition puts it in Kun with 甲, and some schools
  give it both. The table is transmitted, not derived, and it is commented as
  such so nobody 'fixes' it later.

Three findings:

- **The earth plate is two sentences, not eighteen tables.** From the palace
  the ju is numbered for, lay the six instruments and the three marvels one to
  a palace, counting up through the Luoshu numbers in a yang chart and down in
  a yin one. Deriving it makes the published tables a test rather than data.
- **The centre is not on the ring.** The turn that makes the heaven plate runs
  along the eight, so a plate whose centre holds the instrument leaves it there
  and turns what stands at the lodging palace instead. The invariant "the
  instrument ends over the hour's stem" is false in exactly that case.
- **The gates fly, they do not turn.** They count through the Luoshu numbers
  themselves and so pass through the centre, which the ring never does. Two
  different geometries in one chart.

### Phase 4 — Command line

`cli.ts` in `core`: the cheapest way to exercise the engine before the other
surfaces exist. Subcommands `chart`, `bazi`, `terms`, `calendar`. Readable
output plus `--json`, `--lang` honoured throughout.

> Commits: `Exposes the calculation on the command line`

**Done.** `cli.ts` and `format.ts` in `core`, binary `qimen`, subcommands
`chart`, `bazi`, `terms`, `calendar`, each with `--json` and `--lang`.

The CLI is the first real surface, so it is the first thing to obey the i18n
rule end to end: it negotiates a locale from `--lang` then the environment,
prints every name as **hanzi followed by a gloss** — 休門 Rest, never one
without the other — and translates caught errors by their code. `--json`
emits identifiers and hanzi with no glosses at all, which is the shape a
program consumes.

Two things worth keeping:

- **The catalog is where the surfaces meet.** Adding the CLI meant adding
  about a hundred label keys, and the typed catalog caught every Italian one
  that was missing before it could ship.
- **Columns are counted in printed width, not code points.** Hanzi occupy two
  terminal columns; padding by `length` misaligns every table.

### Phase 5 — The drawing

`packages/plate`: a three-by-three grid, each palace layered (spirit, star,
gate, heavenly stem, earthly branch, trigram and number). Pure SVG; PNG behind a
separate entry point `@qimendunjia/plate/png` via `@resvg/resvg-js`, because it
pulls a native module that must never reach the browser.

As in the reference, it **does not import from `core`, not even types**: it
redeclares them in `types.ts` and a test asserts the two agree. This breaks the
cycle with the CLI, which lives in `core` and draws.

Locale reaches it only for captions and legend — the palaces carry hanzi.

> Commits: `Draws the chart across the nine palaces` · `Renders the drawing as PNG`

**Done.** `packages/plate`: `geometry.ts`, `palette.ts`, `svg.ts`, and PNG
behind `@qimendunjia/plate/png`.

It keeps the rule it exists for — it redeclares the shape of a chart instead
of importing it, so a drawing can never reach back into a calculation — and
`test/types.test.ts` guards the copy against drift, at compile time by
assigning a real `QimenChart` to the redeclared type without a cast, and at
run time by reading every field the drawing uses.

Four things worth keeping:

- **South is at the top.** A Qi Men chart is drawn the way a Chinese map is.
  Turning it the European way round would make it unreadable to anyone who
  knows the subject, so the written order is a tested constant.
- **The drawing is locale-independent, and a test asserts it.** With no
  captions the SVG contains no word in any language — only hanzi, digits and
  markup. Captions come in already translated; the package has no catalog.
- **`auto` carries both schemes.** An SVG dropped into a page nobody controls
  has to survive the night, so the default emits light values plus a
  `prefers-color-scheme` block. A PNG cannot ask, so it has no `auto`.
- **resvg does not resolve `var()`.** Handed the stylesheet unchanged it
  rasterises every fill as missing — a blank grid that looks like a drawing
  rather than like an error. `png.ts` substitutes the values first, and the
  test covers it.

**The band of configurations came later**, with `Pattern.valence`, and it
answers two things the palaces could not.

- **A palace has room for a name and nothing else.** Its foot is one shrunk
  line shared by every configuration that fell there. A fortune needs a word
  beside the glyph — 吉 set alone is a name with no gloss, which is the one
  thing not done to a reader who does not read Chinese — and the word does not
  fit. Colour was the other way out and is worse: a palace *is* a direction,
  and three palaces tinted red say «do not face these ways» before a single
  character is read, which is a reading delivered without words.
- **伏吟 and 反吟 were not in the drawing at all.** They belong to the whole
  board and have no palace to be marked in, so `markedPalaces` skipped them
  and a test asserted their absence. The picture is the thing that travels
  furthest, and it was silent about the two configurations that describe the
  whole of it.

The band costs the grid **what it carries and no more**: `Around.configurations`
is a count of lines, not a flag, so a chart that fell into two configurations
does not pay for one that fell into six. The honest figure at 900px with a
compass and captions: two entries take about a tenth off the side of a palace,
four take about a sixth. It is asked for by giving it a heading, as the compass
is asked for by giving it words, and the entries are gathered before the layout
is settled rather than after — which is the whole reason `renderChartSvg` now
groups the configurations up front.

Grouped by name, and in the engine's order. 空亡 in two palaces is one entry
naming both, because two entries would read as two things having happened; and
nothing is sorted by fortune, there or anywhere else, because that ordering is
exactly the ranking the project refuses to produce.

### Phase 6 — The surfaces, together

- `apps/web/src/routes/api/` — GET endpoints: `/api/chart`, `/api/bazi`,
  `/api/terms`, `/api/locations`, `/api/chart/plate`. Parameters read through a
  shared `lib/server/*`, `cache-control: private` as in the reference.
- Interface under `/[lang]/`: birth form with location search, the drawn chart,
  and tables that take **the data, not the chart** — otherwise they become
  unusable for a chart of the present moment.
- `packages/mcp` — tools `search_location`, `compute_qimen_chart`,
  `compute_bazi`, `solar_terms`, `draw_qimen_chart`. Reference resources loaded
  on demand: nine palaces, three marvels and six instruments, eight gates, eight
  spirits, the configurations.

The reference's rules for tool descriptions carry over: the server supplies the
current date and the agent must not invent it; location lookup stays an explicit
step separate from calculation; the drawing is called after the calculation and
never instead of it.

> Commits: `Exposes the chart over HTTP and to agents` · `Shows the chart in the interface`

**MCP done; the web application is not yet started.**

`packages/mcp` exposes seven tools — `search_location`, `compute_qimen_chart`,
`compute_bazi`, `draw_qimen_chart`, `solar_terms`, `lunar_date`,
`scan_moments` — and three
reference resources rendered from the engine's own tables rather than from a
copy. Tested through a real client over an in-memory transport, so the schemas
and descriptions asserted are the ones a client actually receives.

The descriptions carry the rules that keep an agent from producing something
plausible and wrong, and a test asserts each is still there: omit the date for
the present moment, never invent coordinates, never guess a birth time, and
call the drawing after the calculation rather than instead of it.

Two findings:

- **A timezone alone is a complete answer** for the calendar and the terms,
  which do not depend on where they are read. Requiring the full triple broke
  `lunar_date` outright. Where a place does matter, a bare timezone now means
  the meridian that zone is named for — the same assumption the CLI makes, and
  the one that leaves the correction at zero rather than wrong by half an hour.
- **Schema validation is the one thing this server does not translate.** A
  malformed date is refused by the tool's own schema before the engine runs,
  and that message comes from the protocol. Semantic errors — an unknown zone
  — reach the engine and are translated by code as everywhere else.

**The web application is done too.**

`apps/web` serves six GET endpoints — `/api/chart`, `/api/bazi`, `/api/terms`,
`/api/locations`, `/api/chart/plate`, `/api/moments` — and an interface at
`/en` and `/it`.
Every parameter travels in the query string, so a chart is a shareable address
and the interface and the API read exactly the same one.

Verified by driving the built application in a browser: the form, the location
search, the drawing and the tables, end to end.

Three things worth keeping:

- **A chart is cacheable `private`, never `public`.** It is a pure function of
  its URL, so it may be cached — but the key of a shared cache would be an
  address holding somebody's date, time and place of birth. The solar terms,
  which are a fact about the sky and not about a person, are `public`.
- **Failures cross HTTP as a code, not as prose.** The body carries `code`,
  `messageKey` and `params`; the interface translates it through the same
  catalog everything else uses, and a client that only logs it still has the
  English sentence.
- **The locale is a path, not a switch.** `/en` and `/it` are distinct
  addresses, `/` redirects on `Accept-Language`, and an unknown language is a
  404 rather than a silent fallback — which would make `/fr` and `/en` the
  same page under two names.

**The address is the chart — now for the interface too.**

The claim above was true of the API and false of the pages: the parameters
went into the `fetch` and the address stayed `/it`. So a link was not a chart,
a reload lost the moment, and the two sections could not hand one to each
other. The load functions now read the address and casting is navigating, so
all three come from the same code — and the privacy note, which said the
parameters travel in the address, describes what happens.

That is also why the moment is not kept in `localStorage`: the note says
nothing typed is stored, and a birth date on disk would be a different promise
than the one already published.

`/api/locations?id=` exists for the way back — an address carries an
identifier and a form reopening from one needs the name again.

The chart alone is stepped, by the double hour, the day, the month and the
year from the closed panel. The Four Pillars are not: a moment of birth is one
moment. Five findings:

- **The steps were first drawn as bare glyphs — 時 日 月 年 — with the word
  only in the `title`.** It reads beautifully to someone who already knows the
  subject and is unusable to the person the interface exists for, who does not
  hover what they cannot recognise. The rule that hanzi always travel is about
  the engine's *output*; a control is not output. The word leads now, and 時辰
  keeps its hanzi beside it because it alone names something Chinese — a day
  is the civil calendar's and has a word in every language already. The same
  pass replaced `zishi — 23:00` in the form's own `select`, which had the
  identifier where the reader's language belonged. See the constraint in
  `CLAUDE.md`.

- **The step that matters is the double hour.** A 時家 chart changes with it
  and with nothing smaller — day, month and year at a fixed clock time all
  leave the chart in the same 時辰. Two hours on the wall clock is one branch
  on, because the branches are two hours wide and the step keeps its place
  inside one.
- **The step starts from the moment the engine resolved, not from the
  browser's clock.** An empty address means now, and the server worked that
  out in the *place's* zone. Stepping a Beijing chart from a clock in Rome
  jumps by the offset between them.
- **A chart of "now" is not cacheable, and was marked cacheable for a day.**
  "A pure function of its URL" holds only where the URL says when.
  `momentIsFixed` decides it now, and without a date and a time the answer is
  `no-store`.
- **An unresolvable place must be a refusal.** Building the API query from the
  *resolved* place meant an identifier that matched nothing simply vanished
  from it, and the chart came back cast for the server's own zone — looking
  exactly like a chart, of somewhere else. Found by driving the browser, not
  by a test; there is a test now.

### Phase 7 — Distribution and documentation

Multi-stage `Dockerfile` and `compose.yaml` on the reference's model: a single
image for web, MCP and dataset import. Ephemerides (~2 MB) in the image,
GeoNames on a volume.

`README.md`, `docs/agent-prompt.md` (the contract agents actually read),
`.claude/skills/new-feature/`. All in English.

**Done**, and the image was built and run rather than assumed.

Three findings, all from actually building it:

- **The root `build` script never built the web application.** It had been
  built by hand every time, so nothing caught it until the image tried to copy
  a directory that did not exist.
- **resvg does not apply CSS class selectors.** The font stack was declared on
  `.qmdj` in the stylesheet and so never reached the rasteriser; it worked
  locally only because the machine's *default* font happened to cover Chinese.
  The family is now a presentation attribute as well.
- **Font files without `fontconfig` are font files nobody can find.** The
  image installed `fonts-noto-cjk` and still drew an empty grid: with the
  files present but no index, the rasteriser behaves exactly as if none were
  installed. `fontconfig` and `fc-cache -f` are part of the fix, not a nicety.

And one thing worth more than the three: `png.ts` **claimed in a comment** to
check for a missing font and raise, and did not. The claim was written before
the check and never became true. The check exists now — it rasterises the same
tiny image twice, once holding 休 and once holding nothing, and refuses to
draw if they come out identical — and it is what turned a silent empty grid
into a message naming the package to install.

**Continuous integration came later**, on 2026-08-08, and finding out what a
fresh machine needs was the point of adding it. Two findings:

- **`npm test` on a fresh clone did not pass.** The web and MCP suites reach
  for the imported GeoNames dataset — the two Romes that prove a search
  chooses nothing, the Munich that proves the Italian exonym answers — and
  nothing said so until a machine without the 90 MB tried. The fixture the
  geo suite already built in a temp directory became a script,
  `geo:fixture`: the same four places at the default path, refused where a
  database already exists so it can never wear the dataset's name.
- **Moshier is not precise enough for the tests, though it is for charts.**
  The anchors were made at Swiss Ephemeris precision and asserted to the
  minute; an ephemeris accurate to a tenth of an arc second moves a term's
  instant by seconds, which is a different minute often enough. CI downloads
  the ~2 MB of files and caches them rather than letting the fallback shift
  an anchor.

The workflow builds in order, typechecks, runs every suite with the fonts
the drawing needs, and builds the Docker image without pushing it — each
step one that failed silently at least once before it existed. `.nvmrc` pins
the Node major the runtime image runs on, which is also the closest thing
there is to pinning `tzdata`: the zone rules live in the ICU data Node
bundles.

### Phase 8 — Choosing a time

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
the precedent for saying so rather than guessing. A second tradition of
associations, if one arrives, is a second table behind a `tradition`
parameter, and no shared link breaks: a purpose is not in a chart's address,
the criteria it expands to are.

**The natal question is not answered here and was never meant to be.**
Comparing a birth chart against the chart of a moment is a modern and
minority practice, and where it is done the bridge is the ganzhi rather than
any geometry between two plates. The scan stands on its own; a natal filter,
if it ever comes, is a criterion like the others.

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

---

### Phase 9 — Reading the palace, not just laying it out

The chart was cast correctly and read thinly: four plates and nine named
configurations, and nothing about how a gate stood to the ground it had landed
on. This phase adds what is **derivable or transmitted concordantly** and stops
where the sources stop.

**門宮 and 星宮 — done.** `relation.ts` reports which of the five relations of
the phases holds between a gate or a star and the palace it rests in, from the
traveller's side: 比和, 生我, 我生, 剋我, 我剋. Two things worth keeping:

- **The relations, not a school's labels for them.** 義, 和, 迫, 制 are
  transmitted, do not agree between sources on which relation takes which word,
  and carry a fortune with them. The five-phase vocabulary carries none and is
  disputed by nobody. One of the five already had such a name here and keeps
  it: 我剋 for a gate is 門迫, and `patterns.ts` reports it with its fortune.
- **門迫 is now said once.** `oppressedGates` asks `relationOf` instead of
  reaching for `CONTROLS` a second time, so the configuration and the relation
  cannot drift apart. A test asserts they never do, over a spread of charts —
  a palace marked 門迫 whose gate reads anything but 我剋 would mean the rule
  had been written twice and one copy edited.

**驛馬 — done, and derived.** The four transmitted couplets — 申子辰馬在寅 and
its three fellows — are one rule said four times: each triad is the frame of a
phase, and the horse is the branch facing that phase's 長生. So the couplets
became a test and the code holds no table. **Both horses travel**, 日馬 and
時馬, each labelled with the pillar it was reckoned from: they are two things
the tradition names apart, not two readings of one, and choosing between them
in the engine would be a school chosen in a line of output.

**寄宮 — a parameter at last.** The centre lodged in Kun by a hardcoded `2`,
which made this engine's school implicit in the one place the project says it
never will be — and it is not a cosmetic choice, since the lodging decides
which palace the chief and the chief gate are read from. `centreLodging` is
`kun` or `dun` (Kun in a yang chart, Gen in a yin one); `kun` is implemented
and `dun` is refused with `OPTION_NOT_IMPLEMENTED`, as `plate` and `system`
are. Like those two it stays off the surfaces: a parameter with one working
value is offered nowhere and exists in the type, which is what keeps the API,
the MCP schema and every shared link from breaking when the second arrives.

Also moved: `BRANCH_PALACE` and `branchesOf` from `patterns.ts` to
`palaces.ts`. Which palace a branch falls in is a fact about the board, and by
now three unrelated things ask it — the void palaces of a decade, the post
horse, and the frame of branches drawn around the grid.

**十干克應 — eleven of eighty-one, and the eleven are the point.** This was
written up first as an outright refusal: the table has some sixty named cells,
neither runnable reference this project uses computes them, and writing them
from recollection is what § 5 says has been wrong more often than right. A
search for public sources then changed the answer, and the way it changed it is
worth recording.

- **A classical text is online, complete and in the public domain.** The
  煙波釣叟歌 on Wikisource carries the famous pairings *in verse, verbatim* —
  六庚加丙白入熒, 庚加癸兮為大格, 六乙加辛龍逃走, and the rest. That is a
  tier-1 source for this layer, which nothing here had before. It also
  **confirms the two pairings already implemented**: the song's 丙加甲 and
  甲加丙 are 丙 over 戊 and 戊 over 丙, since 甲 is concealed by 戊.
- **Two complete 81-cell tables exist in open source**, one MIT and one under
  PolyForm Noncommercial — the latter unusable here, since it forbids
  commercial use and the AGPL forbids forbidding it.
- **So the standard was met for eleven cells and no more.** Nine were added:
  the eight the verse names outright plus 戰格, which two independent sources
  name alike. 庚 over 壬 was excluded although a complete table offers it,
  because only one source calls it 小格.

Three findings, and the first is the useful one:

- **The pairing is agreed far more widely than the name.** Every source marks
  庚 over 癸 as a named configuration; the verse and the Japanese tradition
  call it 大格, a modern implementation calls it 太白沖刑. Same at 刑格, at
  戰格, and at both 甲/庚 pairings. Had the check been «does a source name this
  pairing», all eighty-one would have passed. The check that matters is
  «do two sources name it the *same way*».
- **A complete table is not a better source than a partial one.** The
  eighty-one-cell files are complete, uncited and five months old; the verse
  is partial, eight hundred years old and citable to a line. The partial one
  carried more weight, and the test file states it couplet by couplet.
- **The interpretive column had to be dropped on the floor.** Both tables ship
  a `desc` of the form «everything auspicious, achieved without effort». That
  is a reading of somebody's situation and it stays out; what came in is the
  pairing, the name and the fortune — which is exactly the shape `Pattern` and
  `Valence` were given a phase earlier, without knowing this was coming.

The seventy remaining cells stay out, and `docs/sources.md` now holds the
register: every source by name and licence, the cross-check pairing by
pairing, and the one entry a fourth source should be pointed at first — 戊 over
丙, where the MIT table dissents from the verse.

**And the documentation moved.** `README.md` was carrying a section on how
sure each number is, which was already too long and was about to double. The
provenance now lives in `docs/sources.md` and the README points at it. See
`docs/README.md` for what belongs there and what belongs in this file.

> Commits: `Says how a gate stands to the palace it rests in` · `Finds the post horse of the day and of the hour` · `Lets the school that lodges the centre be named` · `Names the stem pairs the sources agree on` · `Records where every number comes from`

### Phase 10 — The chart, handed to something that will read it

The refusal to interpret has a consequence nobody had followed to the end.
Somebody who wants a reading was always going to take the date to a model,
and a model handed a date and a place casts the chart **from memory** and gets
it wrong — the same failure `docs/agent-prompt.md` calls inventing a place,
arriving from the other direction. A wrong chart read well is the worst thing
this project can produce: nothing downstream catches it, because it looks
exactly like a right one. Refusing to help was not neutrality; it was leaving
the likeliest use of this engine to be served badly by something else.

So the chart travels **already computed**, and the conditions travel with it.
`readingPrompt` puts the transcript inside a fence and this repository's own
document around it, condensed and addressed to a model that will never read
it. `chartTranscript` is the one rendering the CLI, the endpoint and the
prompt all use — three that drifted apart would mean the text somebody pasted
was not the chart they were looking at.

What this is *not* is the site reading a chart. Nothing is sent anywhere,
there is no key to spend and no chat on the page: the prompt goes to a
clipboard and the reader decides where it goes next. Four things had to be
settled to keep that true.

- **The question never reaches the server.** `/api/chart/prompt` is told
  `asked=true` and nothing else, and the prompt ends on the line that
  introduces a question for the browser to append. A question is somebody's
  own — *will the illness pass*, *should I leave* — and one in a query string
  is one written into every access log between the two. This is why
  `ReadingRequest.question` distinguishes `undefined` from `''`, which reads
  as a flourish until you ask where the alternative would have put the text.
- **Two controls, not one.** The chart as words and the chart as a prompt are
  two errands, and burying the first inside the second would make plain text
  unreachable to whoever wants nothing to do with a model. `/api/chart/text`
  and `/api/chart/prompt`, a light tools row and a section of its own.
- **The suggested questions were built and then taken out.** Forty of them,
  hand-written in both languages and grouped by the eight errands of
  `purposes.ts` — curated rather than combinatorial, since a grammar
  assembling a question from a domain, an action and a horizon writes nonsense
  in two languages instead of one, with Italian agreement to get wrong on top.
  They were labelled as examples and said to be examples, and it was not
  enough: **a question nobody has asked has no 用神**, and one sitting in the
  field is indistinguishable from one the reader meant. A control that fills
  the one field the whole prompt turns on is a control that answers for
  somebody. The field is now typed into or left empty, and empty is a state
  the prompt already reports honestly. Deleted rather than hidden: the keys,
  `$lib/questions.ts` and the picker are all gone, and this note is what
  remains, so that the idea is not had a second time without its answer.
- **The disclaimer is in two places because it has to travel.** The footer
  carries it for whoever is reading the site, and `prompt.disclaimer` tells
  the reading to *say* it — a prompt goes somewhere else, and a disclaimer
  left on the page it was copied from was written for somebody who is no
  longer there. What it says is bounded the way everything else here is: the
  calculations are checked and the divination is not a science, and the
  second does not inherit the standing of the first.
- **A fourth way to be plausibly wrong turned up while writing the prompt.**
  `docs/agent-prompt.md` listed three, all of them things passed *into* a
  tool: a place, a date, a birth time. The fourth is done with what comes
  back. Questions arrive short — *will it go well* names no undertaking, no
  other party, no place, no horizon — and a 用神 cannot be chosen from one, so
  whatever palace gets read is the one the sentence happened to suggest.
  Nothing in the answer records that it was picked, which is what makes it the
  hardest of the four to catch. So both the document and the prompt now say:
  ask. Bounded on both sides — one or two questions and not a questionnaire,
  never a request for chart that no answer could supply, and if nobody
  answers, read what can be read and name what is missing rather than filling
  it in. That last clause is not politeness: a prompt can be pasted where
  there is no one to ask.
- **MCP got nothing, deliberately.** An agent holding the chart over MCP has
  read the contract and does not need it read to it. The prompt exists for the
  model that is not connected to any of this.

**And then the prompt was given a section of its own, which is where the
methodological problem turned out to live.** The block sat under the board,
and under the board a question can only be asked *after* the chart is on
screen — which is backwards. The instant of asking is the instant that is
cast; a chart looked at idly and given a question afterwards is a chart with a
caption on it.

Gating the chart section was considered and refused. Every way of doing it
broke something documented: a link that still rendered a chart would make the
gate theatre, one that did not would kill the shareable address; the arrows
either bypassed the gate or went; and the question would have had to sit in
the address, which is the one place it must never be. So the ceremony moved to
a section that can keep it, and the chart section went back to being an
instrument.

`/[lang]/consult` is therefore the only page here where **asking is not
navigating**. A consultation is an act rather than an address: cast by `fetch`
at the instant of the press, held in the component, gone on a reload. Only the
setup travels in the URL. That is not a shortcoming of the page, it is what a
consultation is — and it is also the only shape under which the question can
stay out of the address for good.

**The natal frame is the concession, and it is bounded like everything else
here.** Reading a Qi Men chart as a chart of a life is common in the West and
is not the classical use. The engine does not notice — a chart of a birth is
the same computation — so the whole of the decision is in the prompt, and the
prompt gives **a frame and never a method**: it says the application is modern
and minority, says the schools disagree, and refuses to map palaces onto parts
of a life. That refusal is the same one `purposes.ts` makes about everything
past the eight gates, and it matters more here than anywhere: natal material
is abundant in a model's training data and comes overwhelmingly from the
commercial lineages this project named as unusable, so a prompt that merely
stayed silent would be filled in confidently and wrongly.

The two frames do not overlap, and the type says so: `ReadingRequest` is a
union, `--natal` refuses `--ask`, and `asked` is not read under `frame=natal`.
A natal chart carrying a question is a third thing — a chart of a life
compared against the chart of a moment — which this file had already declined
under the scan.

> Commits: `Says what a prompt for a model has to carry` · `Hands the chart over with the conditions attached` · `Asks the terminal for a prompt, and for the question it is read for` · `Puts the chart in the clipboard, as words and as a prompt` · `Poses a chart where the question can come first`

---

## 5. Risks, worst first

1. **Sources of truth — partly resolved, and worth reading carefully.**

   Official tables exist for solar terms and the lunar calendar, and phases 1
   and 2 were checked against them through `lunar-javascript`. For Qi Men no
   such authority exists.

   What a search of Chinese-language sources did turn up:

   - The **局數 table** — which ju each of the 24 terms takes in each of its
     three yuan — is agreed by three independent sources: the classical
     mnemonic 陰陽二遁三元定局歌 as quoted by two sites, and the table built
     into the `qimen-dunjia` npm package. All three match on all 24 terms,
     including the two the mnemonic is often quoted without, 立秋 2·5·8 and
     大雪 4·7·1.
   - `qimen-dunjia` (npm, 2.1.0) is a **runnable reference** for 時家奇門
     拆補轉盤. It emits the ju, the 旬首 and 符首, the 值符 and 值使 with
     their palaces, and all four plates across the nine palaces. It builds its
     pillars on `lunar-javascript`, which phases 1 and 2 already agree with.
   - `kinqimen` (PyPI, 0.0.6.6) covers 拆補 *and* 置閏, plus 金函玉鏡 (日家)
     and 刻家. It **does install under Python 3.9** — `sxtwl` and `ephem`
     ship prebuilt wheels for it, while the source build still fails on
     everything newer — and it runs once the package directory is put on
     `sys.path`, because `kinqimen.py` says `import config` where it means
     its own module. Re-verified 2026-08-08.

     Its 置閏, used as the reference for this engine's, needed the same
     care: it re-derives the term day by day from the term astronomically
     in force, so it can express neither a sustained 超神 nor a real 接氣,
     and it changes the ju in the middle of a five-day stretch — which no
     account of the method allows, including its own futou-based yuan.
     Agreement over 2018–2027 is exact on the yuan (3 652 of 3 652) and
     two-in-three on the term, everywhere the drift phase makes the two
     readings coincide. The classical structure was instead confirmed
     piecewise: the four 符頭 heads, the anchor at the solstice, and the
     195-day leap each match an independent Japanese source (ktonko.com).

     Runnable is not the same as agreeing: **its 拆補 is a different 拆補.**
     `kinqimen` assigns the yuan from the day's 符頭 — a 己卯 day opens an
     upper yuan wherever it falls in the term — where `qimen-dunjia`, and
     this engine with it, split the term into three five-day thirds from the
     instant it begins. For 2026-09-02 11:00 in Beijing the two return
     陰遁一局上元 and 陰遁七局下元 from the same instant, each internally
     consistent. So the method the two references share by name they do not
     share in fact, and a `zhirun` implementation checked against `kinqimen`
     inherits its futou-based reading of the yuan with it. That is a school
     divergence inside `chaibu` itself; if both readings are ever shipped,
     the split is a new explicit parameter, not a correction.

   **The weight of this evidence is not the weight of phase 1's.** An almanac
   encodes published astronomical fact; a Qi Men implementation encodes one
   author's reading of a contested tradition. Agreement with `qimen-dunjia`
   means "consistent with a common implementation", never "verified". It also
   covers only 拆補. 置閏 now has a runnable reference in `kinqimen` — see
   below, and weigh it the same way; 茅山 has no reference at all, and
   shipping it means shipping something unfalsified. Say so at the surface.

   Two known defects in that reference, for whoever uses it: its 局數 table is
   keyed in traditional characters while it reads term names from
   `lunar-javascript`, which emits simplified — so it throws outright on five
   of the 24 terms; and its 八神 uses 勾陳/朱雀 in yang dun against 白虎/玄武
   in yin, which is one convention among several.
2. **Divergence between schools.** Mitigated by the explicit parameters of
   section 3, but only if they exist from day one.
3. **The Zi hour and the day boundary.** It shifts two pillars out of four. It
   deserves its own tests and a visible note in the interface.
4. **Reproducibility.** Pin `tzdata` in `package.json`, version the GeoNames
   snapshot, and store resolved values (coordinates, timezone, options) in the
   chart rather than identifiers alone.
5. **i18n drift.** Cheap to prevent, expensive to repair: catalogs typed against
   a single key union, a parity test in both directions, and a lint rule or
   review habit against string literals in `core`.
6. **AGPL.** Imposed by Swiss Ephemeris, as in the reference. Every new
   dependency must be compatible with it.

### Measured, for whoever revisits the location dataset

From a full `allCountries` import run on 2026-08-04, kept here so the decision
does not have to be re-measured:

| | `cities500` | `allCountries`, class P |
|---|---|---|
| download | ~215 MB | ~620 MB |
| places | 235 073 | 5 048 805 |
| searchable names | 1 217 417 | 12 404 962 |
| database | 90 MB | 1256 MB |

At the larger size a two-letter prefix matches 334 848 name rows over 192 314
distinct places, and ranking them costs 644 ms because every candidate
follows a rowid into the large table. Copying `population` and `country_code`
into `location_names` fixes it — the index then covers the ranking and only
the surviving rows are read — but that is the cost of entry, not an optional
refinement.

---

## 6. Suggested order

Phases 1 and 2 are not negotiable as a sequence: the Four Pillars are the test
bench for the calendrical layer, and an error there propagates everywhere. From
phase 3 onward work can proceed surface by surface, following the procedure of
the `new-feature` skill: calculation in `core` with tests, then the CLI, then the
surfaces together, then the documentation — never omitted.
