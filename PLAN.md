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
| `yuan` | `term`, `futou` (符頭) — inside 拆補 | `term` |
| `plate` | `zhuan` (轉盤), `fei` (飛盤) | `zhuan` |
| `centreLodging` | `kun` (寄坤二), `dun` (陽遁寄二 · 陰遁寄八) | `kun` |
| `trueSolarTime` | boolean | `true` |
| `yearBoundary` | `lichun` (立春), `chunjie` (正月初一) | `lichun` |
| `dayBoundary` | `zishi` (23:00 → next day), `midnight` | `zishi` |
| `system` | `shijia` (時家), later `rijia`/`yuejia`/`nianjia` | `shijia` |

The first two are the most divisive and are not optional. The rest may ship with
a single implemented value provided the parameter already exists in the type:
adding it later breaks the API, MCP, the CLI, and every shared URL at once.

The same rule governs the boards phases 13, 15 and 16 add, and their
divergences are
listed here rather than beside the phase because this table is where a reader
looks for them. Each board carries its own input type; none of them inherits a
default from dunjia's.

| Board | Parameter | Values | Proposed default |
|---|---|---|---|
| 六壬 | `yuejiang` | `zhongqi` (太陽過宮 at the 中氣), `jieqi`, `true` (太陽實躔) | `zhongqi` |
| 六壬 | `guiren` | `chou` (甲 shares 丑未 with 戊庚), `wei` (甲 stands alone at 未丑) | `chou` |
| 六壬 | `zhouye` | `branch` (晝 from 卯 to 申), `solar` (actual sunrise and sunset) | `branch` |
| 七政四餘 | `xiudu` | which 宿度 table, by 曆: `shixian` (時憲曆), `shoushi` (授時曆) | `shixian` |
| 七政四餘 | `ziqi` | `off`, or a named transmission with its epoch | `off` |
| 七政四餘 | `luohou` | which node is 羅睺: `ascending`, `descending` | to be decided |
| 七政四餘 | `minggong` | `ascendant` (the true rising degree), `yuejiang` (立命 by 月將加時) | to be decided |

`dayBoundary` and `trueSolarTime` are shared with dunjia and keep their
meanings: a board that read the day differently from the pillars beside it
would be two calendars in one output.

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

**拆補 itself splits in two, and the split was found by comparison.** A second
runnable reference — fengshui-hacks.com — was read cell for cell over 266
moments and matched nothing this engine cast: 26% under `chaibu`, 56% under
`zhirun`. The measurement that explained it is that the disagreement alternated
**every five days and not every fifteen**, which is a yuan and not a block, so
it could not be a 置閏 whose intercalation was pinned differently. The term in
force plus the yuan read from the day's place in the fifteen-day 符頭 cycle
reproduces that reference on 260 of the 266, the six exceptions all falling in
超神 windows. That is the divergence `docs/sources.md` had already recorded
inside 拆補 from `kinqimen`, and finding it a second time independently is what
let it be shipped: `yuan`, defaulting to `term`. Two further things fell out:

- **Hold the ju equal and the layout engine is confirmed.** Cast under the
  reading that reference follows, 260 of the 266 charts agree cell for cell —
  plates, stars, gates, spirits, 值符, 值使, 旬首, 空亡, 驛馬. A disagreement
  about the ju had been masking a complete agreement about everything else,
  which is the argument for comparing a chart layer by layer rather than as a
  whole.
- **The engine wrote one creature under two glyphs.** 滕蛇 on the spirit plate
  against 螣蛇夭矯 among the configurations, where `docs/sources.md` had already
  settled 螣 from three sources. Nothing internal caught it — the identifier
  `tengshe` is the same either way, and the pinyin test only asserts a reading
  exists. Comparing hanzi against an outside implementation did.

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
`scan_moments` — and four
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

`apps/web` serves eight GET endpoints — `/api/chart`, `/api/chart/plate`,
`/api/chart/text`, `/api/chart/prompt`, `/api/bazi`, `/api/terms`,
`/api/locations`, `/api/moments` — and an interface at
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

**The pillars came back under the board, where the terminal always had them.**
The services this is measured against show a chart of the four pillars beside
every Qi Men chart, and the reason they do is worth separating from the way
they do it. The four pillars of the *instant* are not an addition: the ju is
counted from the term and the hour, the chief from the day, both horses from a
branch below — `formatMoment` prints them above every chart the CLI draws, and
the drawing's caption has carried them since it had one. The page had them
nowhere else: inside an `alt=""` picture, uncopyable and unreadable aloud.
They are in `ChartReading` now, so all three places that show a chart show
them, and the pair alone — no concealed stems, no gods, no stages.

**What those services do beside it is the thing this declines.** A chart of
*birth* shown against a chart of the moment is there to pick the 用神 — the
consultant's day stem carried into the Qi Men board — which is choosing the
用神 and mapping a life onto palaces, the doctrine `purposes.ts` refuses. Two
charts set side by side are already an assertion: the reader builds the
bridge, or a model does. What *is* carried is the classical form of the same
wish, which needs no second chart: the 年命 of `nianming.ts`, one pair looked
up inside the chart of the moment.

So the chart leads to `/[lang]/bazi` with its own instant in the address, and
nothing is folded in — `method` and `yuan` are left behind, since
they decide how Qi Men counts a ju and mean nothing to the pillars, while
`dayBoundary` and the solar correction travel, because a moment handed over
under one boundary and read under another comes back on a different day
pillar than the chart was cast on. The link earns its place even beside a nav
that already carries the moment: the nav hands on the *address*, and the
address of the present chart says nothing, where the pillars have no "now" to
fall back on.

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

**寄宮 was computed and not reported**, which comparison found later. The
lodging already decided which palace the chief gate is read at, and every path
that needed it went through `lodge` — but the chart printed the host's own
stem and nothing else, so a reader standing at 坤 saw one stem where the
doctrine gives them two and had no way to learn from the chart that the centre
lodges there at all. `PalaceContents.lodged` says it now, on the host's row.
**One stem and not two**: 轉盤 turns the ring of eight and never the centre, so
what the ju put there stands on both plates. Schools that instead glue the
lodged stem to its host and turn the pair together get a heaven plate carrying
it elsewhere — a divergence in how the plate is derived, and one for `plate`
rather than for this field. The drawing does not show it: its cell has six
registers and all six are full on the host, and a picture is not where notes
go.

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

**The natal wish is answered by 年命, and the natal frame is gone.** Reading a
Qi Men chart as a chart of a life is common in the West and is not the
classical use. It was offered here once as a frame with the method withheld —
the application named as modern and minority, the mapping of palaces onto
parts of a life refused — and then withheld from the interface the day it was
built, because a frame and a warning is not much for a model to work with and
a mode that yields a poor reading teaches that this is what the method gives.

What replaced it is what the classics actually do with a birth: they look it
up inside the chart of the moment. 《遁甲演義》 (程道生, Ming, 四庫全書) —
「夫用遁之法，不推本命行年，未見精妙」 — has a reading consider 本命, the year
pillar of the birth, and 行年, the year being lived, before it considers
anything else, and has the person's own year ride a palace where a good star
and gate stand in strength. That is computable, checkable and small:
`nianming.ts` places two pairs and reports the palaces, the mooring of the
branch and the 納音 against that ground. Nothing else. 生旺 and 囚死 are the
text's own verdicts and need a question to have been asked.

**The refusal did not soften, it moved.** The prompt still says no palace
stands for a part of a life, and now says it beside something rather than
instead of it. `docs/sources.md` records the one classical text that does read
a life from a chart of a birth — 《奇門遁甲統宗》卷十二, which maps it through
the 六親 of the stems and not through the palaces at all — and why nothing
imports it.

**One birth, and everything else about it stays where it is.** Only the year
pillar is read: `born` is a date, `bornTime` and `bornTz` exist because a
birth within hours of 立春 belongs to the year before, and `gender` is read
for the direction of the 行年 count and nothing else — without it the year
being lived is left unplaced rather than guessed. The count itself is a
parameter like every other divergence, `sui` or `turns`, because 虛歲 is what
the rule was written for and is not what a reader thinking in birthdays
expects.

> Commits: `Says what a prompt for a model has to carry` · `Hands the chart over with the conditions attached` · `Asks the terminal for a prompt, and for the question it is read for` · `Puts the chart in the clipboard, as words and as a prompt` · `Poses a chart where the question can come first` · `Finds where a birth stands in the chart of a moment`

---

### Phase 11 — The readings under the board

**Planned.** The drawing is the one surface that prints hanzi without their
readings, against the rule that a name carries its reading. This is the design
that closes it.

**Why it cannot go in the palace, which is where it belongs.** A register is a
glyph with a word under it wrapped to at most two lines, and the spacing was
chosen for the worst case of that — `巽` has one word and `坤` has "Guerriero
Oscuro", and the two are laid out alike or the palaces stop lining up. The
third line a reading would take is the register below it. Six names to a
palace and nine palaces, and the drawing is proportional throughout, so there
is no size at which the room appears: asking for 1800 pixels instead of 900
buys a larger picture of the same crowding. Setting the reading beside the
gloss instead of under it fails on the same arithmetic — a column is 7.6 ems
of word and «Guerriero Oscuro» is 8.6 of them before a reading is added.

**So it goes in a band, on the precedent the band under the grid set.** The
paper grows downward by what the band needs and the square does not move,
which is the whole finding of `Foot`: a list that came out of the grid resized
the palaces as the reader stepped the hour.

**The band costs the same on every chart, and this is the fact the design
rests on.** A board carries **forty-three distinct named things** — nine
palaces, nine stems, nine stars, eight gates, eight spirits — and it carries
forty-three on every chart of every hour, because what the hour changes is
where they stand and not which of them stand. The two plates hold the same
nine stems between them; the centre has no gate and no spirit; a yin dun
swaps two spirits for two others and the count does not move. Measured over
yang and yin duns at four hours: nine, nine, nine, eight, eight, every time,
and eight lines of band at every one of them. Where the configurations band
swings between one line and nine, this one does not swing at all — so the
paper is the same height on every chart, and the reader who steps the hour
sees the picture hold still.

**The reading travels on the shape, never in the labels.** `Named` gains an
optional `pinyin` beside its `hanzi`, and `PlatePattern` the same. It cannot
arrive through `PlateLabels`: that is the channel for words chosen in a
language, and a reading is not one — 休門 is xiūmén to every reader, and a
reading handed over per locale would be the design error a translated string
is. Optional, as everything here is optional that the drawing can do without:
a caller on an older engine draws the board with no band rather than failing,
and the band lists only what came with a reading. Nothing with no reading is
listed, and no reading at all is no band, the way zero configurations are no
band rather than a heading over nothing.

**Asked for by a heading, like the band above it and the frame around it.**
`captions.readings` draws it; its absence leaves it out. The heading is a word
in the reader's language and therefore the caller's to supply, which keeps the
package holding no catalog.

**Grouped by register, and the groups are not named.** All the palaces, then
the stems, then the stars, the gates, the spirits — each group starting its
own line and never sharing one. A group needs no word in front of it because
the shapes rhyme: a line of 門 is self-evidently the gates, and a reader who
learned that the gate is the bottom-right register — which is what the palaces
teach by putting the same thing in the same place — lands in the right
neighbourhood by shape alone. Grouping costs two lines over a run-on list
(eight against six) and buys the only kind of lookup that works here. **Not
ordered by reading**, which would be an index a reader cannot enter: somebody
looking a glyph up does not know its reading, which is why they are looking.

**The configurations keep their own band and gain their reading inside it.**
Those lines are short and flush left, so `名 reading · fortune · palace` fits
where it already stands and costs no line at all. The bare glyphs marking a
palace stay bare and are glossed in the band, which is the bargain already
struck there for a fortune.

**Two passes over the layout, because each half needs the other.** The wrap
needs the width and the height needs the wrap. Margin and cell depend on
neither band, so a provisional `layout` yields the true width to wrap against
and the final one is called with the line count — and a test pins that
invariant, because a later change making `cell` depend on a band would
silently wrap against the wrong width.

**A tone mark is a Latin letter, and `FONT_STACK` is CJK fonts and `serif`.**
The macron and the caron of ā ǎ ǖ live in Latin Extended-B, which the CJK
faces cover unevenly and the fallback covers or does not. So the probe that
refuses to rasterise a board no font can draw gains a second question, asked
only where the band was asked for: a reading rendered as a row of boxes is
the silent failure the first probe exists to prevent, one step further on.

Out of scope, deliberately: the `aria-label`, which reads the hanzi palace by
palace to a screen reader that does not need the pinyin spelled at it; the
palace registers, per the arithmetic above; and the captions naming the chief
star and gate, which the caller composes whole and can spell as it likes.

The cost, at the default 900: the paper goes from 900×1012 to about 900×1204
on a chart with three configurations — a third taller than the square, and the
square itself unchanged. The two notes saying the drawing carries no reading —
on `Named` in `packages/plate/src/types.ts`, and in the transliteration section
of `docs/sources.md` — are replaced by what it now does when this lands.

> Commits: `Carries the reading beside the name on the board` · `Writes the readings under the grid` · `Says the configurations' names aloud too` · `Refuses to rasterise a reading no font can draw` · `Asks the drawing for the readings it can now write`

---

### Phase 12 — The consultation takes the lead, and the chart goes to paper

The section that poses a chart to be read was built last and listed last, and
it was named after what it produces: *AI prompt*. Both were true of a thing
added to the side of an instrument. Neither is true of the classical use of
the method, which is a question put at an instant — and that is what this
phase settles.

**It is named by the act, and it is the root of a language.** *Consultation*,
not *Reading* and not *Oracle*: the second two would have this project claim
in a nav label the one thing it declines to do in code, and the footer denies
on every page. The word the label gave up is carried by the first line of the
page, which says a prompt comes out of it before anybody types. `/[lang]` is
the consultation; the chart moved to `/[lang]/chart`.

**The cost was paid knowingly, and it is the chart's old address.** Every
link shared before this lands on a form instead of the board it named. No
redirect was written: the alternative — reading a moment out of the root's
query string and forwarding it — keeps those links alive at the price of an
address that means two different sections depending on what is in it, and the
section that leads is the one whose address means nothing at all. What is
bought is that the page which *cannot* be addressed is the one nobody has to
find. The landing page is now a form that does not survive a reload, which is
a real loss and the honest shape of the thing: a consultation is an act.

**The fields withdraw, and the two ways out stay.** The consultation adopts
the `FormPanel` the chart and the pillars use, closing on a cast that
answered and staying open on one that failed. What stands on the bar it
leaves is the pair of buttons the page exists for — copy the prompt, print —
so neither needs the panel reopened. The question is not on that bar: it is
set in full over the board, where it is read with the answer, and it is the
question as *posed* rather than as currently typed. The field goes on being
editable and the answer does not follow it.

**The four pillars are drawn wherever the board is.** They were always in the
reading, as a line of four pairs, and in the drawing's caption. Now they are
four tinted cells under the board — the form every calculator shows them in —
and `PillarPlate` serves both sections, taking a god and a stage where the
Four Pillars section has them and going without where a Qi Men chart has not.
What is *not* shown beside the board is what the other method reads off them:
gods, concealed stems, twelve stages. That refusal is older than this phase
and is why the plate is structural rather than fed from `/api/bazi`.

**Without those three registers the cell stops being a square**, because a box
visibly larger than what is in it reads as something that failed to load. It
is as tall as its type instead. **And it asks the room how many columns it can
have**: four under a board, two in the column of the scan's dialog, never
three, since four pillars broken 3 + 1 read as a table that ran out of room.
The question is about the plate and not about the window — the narrow case
happens on a wide screen — so the plate is wrapped in a frame that can be
queried, an element being unable to answer a query about itself.

**Under a board that has the page, the plate is the grid.** Not
approximately: `geometry.ts` derives the drawing from the side of the paper,
and with captions and a compass the margin is `0.125 · size`, so the nine
palaces occupy three quarters of it and one palace is a quarter. **Four
squares across those three palaces** — `0.1875 · size` each — so the plate
and the ruled square above it begin and end at the same two abscissae.
Measured on screen: 626px against 626, and the same left edge to the pixel.

The paper's own width was tried first and is wider than what anybody reads
the board at: the compass band puts the outermost rule 7% in from each edge,
and four palace-sized cells stood proud of it on both sides.

**The type is the board's, not the cell's.** A name set as a fraction of a
cell three quarters of a palace would come out a quarter under the board's,
which is the size it was before any of this — so the palace's fractions are
divided through by the ratio of the two cells: `0.03 · size` for the name over
`0.1875 · size` of cell is 16cqw, the word under it 7.33, the corner where a
palace writes its Luoshu number 9.33. Measured: 24.9px against the board's
25.0, 11.4 against 11.5. Nothing is capped, and that is the point — a cap is
what breaks the correspondence at exactly the sizes worth having it.

The measure the block itself takes is still the drawing's, mirrored from the
rule that sizes the `<img>` and marked in both places: a custom property set
by two pages and read in a component hides the coupling instead of naming it.
The plate is a percentage of that, so only one of the two has to know it.

**And the registers turn over.** On the board a palace sets the name large and
the word small under it; the plate did the opposite, so one grid read led by
Italian and the one above it led by hanzi. The ju, which stood flush left over
a centred plate, now centres on what it captions. On paper the two are kept
off a page break — which is where it first showed: a caption centred at the
foot of one sheet over its plate at the head of the next.

**The Four Pillars' own plate keeps the order it has**, and the scan's dialog
keeps the caption it has. There the plate is a section's whole answer and
stands alone, and what leads for a reader with no Chinese is the word; here it
stands under a board that has settled the question for the page already.

**Paper is the fourth appearance.** Light is not it: light is a
paper-coloured screen. `@media print` in `app.css` resets the properties for
white — at the specificity of `[data-color-scheme='dark']`, or a reader who
picked dark prints a page of toner — and each component says whether it
belongs on a sheet. Two of the rules are about losing data rather than about
ink: the palace table drops its scrolling frame, which on paper clips three
palaces of nine and says nothing about the other six, and the result grids
become blocks, since a grid broken across sheets is measured by its whole
rows and cost a page of white.

**The board is the one thing a stylesheet cannot reach.** An `<img>` carries
its colours in its address. So both pages draw a second copy at
`scheme=light`, hidden on screen and shown only in print, warmed the moment
the chart is cast — `beforeprint` is synchronous and cannot wait for a
picture, and printing starts from a menu as often as from a button. Not drawn
at all where the reader is already in light.

**And it prints from the page, never from a route.** A `/print` address would
have to be told the question, and the question does not travel. The one place
the rule and the convenience point the same way.

**And the commits stop being layered here.** Every phase above this one lists
several, one per stage, because while the engine was being built a stage was a
thing that could be wrong on its own and had to be findable on its own. This
one is a session's work on an interface that already runs, and it is one
commit with a paragraph per movement. `CLAUDE.md` § Style and the `new-feature`
skill say so; the lines below go on listing what a phase produced, which from
here is usually one entry.

> Commits: `Leads with the consultation, and prints a chart on paper`

---

### The scope widens, and the standard does not move

**Phases 13, 15 and 16 are a different kind of work from the twelve above
them.**
Those built one engine and told it on six surfaces. These add *boards this
project does not yet have*, and the reason to write the decision down before
the code is that the same widening, done carelessly, is precisely how the
modern natal Qi Men got invented.

**The class is 命, and calling it "the natal chart" is the mistake itself.**
The Western natal chart is one instance of a class the Chinese tradition
already fills several ways — 八字, 紫微斗數, 七政四餘 — and naming the class
after the Western instance is what makes people go looking for the missing
Chinese one and graft it onto whatever board is at hand. In the 五術
(山醫命相卜) the class is 命 (mìng), fate, and it is a sibling of 卜 (bǔ),
divination, not a gap inside it. Dunjia is 卜. So is 六壬. What phase 15 adds
is 命, and it is added *as* 命, on a board built for it.

**What this admits.** A second and a third engine under the same roof, each
with its own input type, its own output and its own entries in
`docs/sources.md`. 八字 was always here — it arrived as the substrate a dunjia
chart is cast from — and phase 15 makes explicit what that already implied:
this project computes fate arts as well as divinatory boards.

**What it does not admit, and this is the whole of it.** Reading a *dunjia*
chart as a chart of a life is still refused, and for the unchanged reason:
the mapping of the nine palaces onto parts of a life is attributed to nobody,
and where a classical text does read a life from a chart of a birth
(《奇門遁甲統宗》卷十二) it does so through the 六親 of the stems and not
through the palaces at all. `nianming.ts` stays exactly as it is. The scope
widened; the standard for what may be computed did not. A board earns its
place here by having a procedure a source states, never by filling a hole in
a catalogue.

**Phase 14 is the exception to all of this**, and it is not a board: it is what
the consultation has to become once there are two of them. It sits between
六壬 and the almanac because it is the debt phase 13 opened, and a debt is paid
before more is borrowed.

**And the order is by correlation, not by interest.** 六壬 is the sibling of
dunjia inside the 三式 — same input, same act, same substrate, and a Ming
practitioner held the three as one competence. 七政四餘 correlates with 八字,
not with dunjia; it is the most interesting of the three and the most
expensive, and it goes last because it is the only one with a question nobody
can answer from the sky.

### Phase 13 — The second board

**Planned.** 大六壬. The extension the engine is already built for: the same
instant, the same 時辰, the same ganzhi machinery, and an act of the same
shape as the consultation — a question asked now, answered from the moment it
was asked in.

**Why it is cheap here.** `ganzhi.ts`, `pillars.ts` and `time.ts` are most of
the substrate. What is new is one construction, and it is procedural
throughout — which is what makes it fit a project whose engine answers no
question:

1. **天地盤** — the 地盤 fixed, the 天盤 turned so the 月將 sits on the branch
   of the hour (月將加時).
2. **四課** — the day stem through its 寄宮, the day branch, and the 天盤
   above each, twice over.
3. **三傳** — 初傳, 中傳, 末傳, by the 九宗門 applied in order: 賊剋, 比用,
   涉害, 遙剋, 昴星, 別責, 八專, and the two degenerate boards 伏吟 and 返吟.
   Nine named rules with stated conditions and a stated precedence. This is
   the part that has to be right, and it is the part that is testable.
4. **十二天將** — 貴人 placed from the day stem and the half of the day, the
   other eleven laid forward or backward from it.
5. **遁干 and 空亡** from the day's 旬, both of which the engine already has.

**Its divergences are few and famous**, which is unusual and welcome: when the
太陽 changes palace, whether 庚 or 辛 rides with 甲戊 in the 貴人 verse, and
where the day half is cut. All three are in § 3.

**What it will not carry.** The 課體 — 元首, 重審, 涉害, 蒿矢, 冬蛇掩目 and
the rest — are *names of configurations* and belong in the output exactly as
`Pattern` does, hanzi and pinyin and identifier. The 占斷 that the manuals
hang on them do not: choosing the 用神, ranking the transmissions, dating an
outcome. The line is the one already drawn, and it falls in the same place.

**Sources, and the rule that bites hardest.** 《大六壬大全》 (四庫全書) and
《六壬指南》 (陳公獻, Ming) state the construction; 《六壬視斯》 is a third
witness on the 九宗門. But **none of this may be written down from memory** —
phases 1 to 3 learned that more than once. A runnable reference has to be
found and agreed with before a single rule enters `docs/sources.md`.

**The reference was found and run, and it is a better one than phase 3 had.**
`kinliuren` 0.1.2.9 (PyPI, Ken Tang — the author of the `kinqimen` used in
phase 3), MIT, **one pure-Python module of 142 kB and no dependencies at all**.
It installs and runs under Python 3.14, which is worth saying because
`kinqimen` still needs 3.9 and a pair of prebuilt wheels.

Two things about it matter more than that it runs:

- **It takes no instant.** `Liuren(節氣, 農曆月, 日干支, 時干支)` — the solar
  term and the pillars, which are precisely what phases 1 and 2 already
  compute and already verified against `lunar-javascript`. So a comparison
  isolates the 六壬 construction and nothing else: no calendar of its own to
  disagree with. Nothing in this project's reference history has been that
  clean. (`農曆月` is echoed in the output and does not enter the board —
  `正` and `十一` give an identical chart. It feeds the monthly variants.)
- **Its nine methods are the 九宗門, one function each** — `zeike`, `biyung`,
  `shehai`, `yaoke`, `maosing`, `bieze`, `bazhuan`, `fuyin`, `fanyin` — which
  is independent confirmation that the structure planned above is the
  structure the tradition transmits, and not a shape recalled to fit.

**What it settles.** Its 月將 table pairs each 中氣 with the 節氣 that follows
it — (雨水, 驚蟄)→亥, (冬至, 小寒)→丑, (大寒, 立春)→子 — so the 太陽 changes
palace **at the 中氣**, and `yuejiang: zhongqi` is the reference's reading as
well as the proposed default. Its 晝夜 is cut on the hour branch, 卯 to 申
against 酉 to 寅, which makes `zhouye: branch` the implemented value; `solar`
stays in the type unimplemented until a source states it, as § 3 permits.

**What it settles differently from what was guessed here**, which is the whole
reason one runs a reference: it ships the 貴人 divergence *as an option of its
own*, and the two verses it carries are not the pair this document first named.
They are 甲戊庚→丑未, 乙己→子申, 丙丁→亥酉, 壬癸→巳卯, 辛→午寅 against a finer
table that stands 甲 apart at 未丑 and splits 丙 from 丁, 壬 from 癸, 乙 from
己. § 3 was corrected to those two. And the divergence is bounded in a way
worth knowing before the tests are written: on a 甲子 day it moves the generals
— 貴 or 空 on the 巳 of the 地盤 — and leaves the branches of the 三傳
untouched, 戌·午·寅 either way. **The 貴人 moves the generals, never the
transmissions.**

**Defects in it, for whoever uses it after this**, recorded in the same spirit
as `kinqimen`'s in § 5:

- The course name leaks an index: `蒿矢11`, `涉害1`, `杜傳1`.
- **It throws on six inputs.** `IndexError` on 雨水·乙丑·庚辰, 驚蟄·乙丑·庚辰,
  春分·己巳·庚午, 清明·己巳·庚午, 小雪·乙丑·癸未, 大雪·乙丑·癸未 — six of
  17 280, but they are six boards nothing can be checked on.
- **It classifies the two degenerate boards unreliably.** Of the 1 440 true
  返吟 boards it labels 1 226; 214 fall through to 遙剋, 賊剋, 別責 or 八專.
  Against that it labels 返吟 on 144 boards that are 伏吟 and on 352 that are
  neither. Some of the 214 are defensible — a 返吟 showing a control is drawn
  by the ordinary rule and only *named* 無依 — but 496 false positives are
  not.

**And one thing this document got wrong and is correcting.** It said above
that `fanyin` is defined and never dispatched, and concluded that 返吟 has no
reference at all. The first half is true — `result()` runs eight methods and
`fanyin()` returns a vector of relations rather than transmissions — but the
conclusion was wrong: `zeike` carries its own 返吟 guard (`sike_list[9]`), so
the reference does produce 返吟 boards, just not through the method named for
them. 返吟 is therefore checkable, and it is checked below. What it is not is
*trustworthy*, per the defect above.

One more to check rather than to claim: 伏吟 on the 陰日 丁未 returns 自任
where the rule as usually stated gives 自任 to a 陽日 and 自信 to a 陰日. That
may be this document misremembering the rule, which is why it is written here
as a question for the texts and not as a finding.

**The comparison, run over the whole input space.** This board has a property
nothing else in this engine has: **its inputs are finite and few.** Twenty-four
terms by sixty day pillars by twelve hour branches is 17 280 boards, and that
is not a sample of the space, it is the space. Phase 3 could compare 3 652
days out of an unbounded calendar; here there is nothing left over to be wrong
about.

`liuren.ts` against `kinliuren` over all 17 274 boards it answers on:

| rule | agreement | |
|---|---|---|
| 賊剋 | 7 888 / 7 956 | 99.1 % |
| 昴星 | 264 / 264 | 100 % |
| 遙剋 | 1 536 / 1 728 | 88.9 % |
| 別責 | 150 / 206 | 72.8 % |
| 伏吟 | 890 / 1 296 | 68.7 % |
| 比用 | 1 340 / 2 116 | 63.3 % |
| 涉害 | 1 060 / 1 674 | 63.3 % |
| 返吟 | 870 / 1 722 | 50.5 % |
| 八專 | 120 / 312 | 38.5 % |
| | **14 118 / 17 274** | **81.7 %** |

**The construction is verified exhaustively, and separately from the rules.**
`all_sike()` and `find_sike_relations()` expose what the reference *built*
before it chose anything, and those can be compared on their own. Over all
17 280 boards, the four courses agree **17 280 / 17 280** and the 上剋下 ·
下賊上 marking agrees **17 280 / 17 280**. Nothing is approximate here and
nothing is sampled: 月將加時, the 寄宮 table, the four courses and the phase
arithmetic under them are correct over the whole space a board can occupy.
What is left to be right or wrong about is **the selection among candidates**,
which is doctrine rather than computation.

**What the first table's shape said, and it was not "81.7 % correct".** 賊剋 alone is 46 % of
the space and it agrees at 99.1 %, and 昴星 agrees exactly. Those two agreeing
is a proof about everything underneath them: a 天地盤 turned wrongly, a 四課
read from the wrong lodging, or a chain that climbed the wrong plate would
drive 賊剋 to near zero rather than to 99. **The construction is right; what
disagrees is the tie-breaking.**

And the tie-breakers are exactly where the reference stops being a reference.
Its `zeike` is some forty hand-tuned branches over a `sike_list` of nine
positions, and 比用 and 涉害 are entangled in it — 352 of this engine's 涉害
are its 比用 and 164 the reverse, which is one boundary drawn in two places
rather than two rules disagreeing. There are boards where it opens on a course
carrying no control at all: 立春·辛未·丙申 has 賊 on 一課 and 三課, 比用 on a
辛 day keeps 亥, and the reference answers 卯未亥 — 卯 being the 四課 upper,
which stands on 亥 and is generated by it.

**So a second reference was found, and it changes the verdict.** Raising the
first table's numbers by matching `kinliuren` would have been fitting this
engine to forty conditionals nobody wrote down. `liuren-ts-lib` 3.1.0 (npm,
Apache-2.0) is the alternative: it carries a `jiuZongMen` directory — the nine
rules as nine modules — and `getLiuRenByYueJiang(月將, 占時, 日干支)` takes the
board's inputs directly, without even a term table in between. It answers on
all 8 640 boards without throwing. (`mingyu-core`, MIT, names all seven
ordinary rules too and is the third to try when one is needed.)

The space keyed by 月將 rather than by term is 12 × 12 × 60 = 8 640 — the term
reaches the board only through the general, so 雨水 and 驚蟄 are one board.
All three over all of it:

| | | |
|---|---|---|
| the two references, **to each other** | 7 120 / 8 640 | **82.4 %** |
| this engine vs `liuren-ts-lib` | 8 208 / 8 640 | **95.0 %** |
| this engine vs `kinliuren` | 7 083 / 8 640 | 82.0 % |
| **this engine where the two agree** | **6 983 / 7 120** | **98.1 %** |

**The two references agree with each other 82.4 % of the time.** There was
never a single answer to be measured against, and the first table was this
engine's distance from one implementation's idiosyncrasies as much as from the
tradition. The last row is the one that means anything: where two independent
implementations agree, that is the transmitted board, and this engine gives it
on 98.1 % of them. Every contested case sampled goes the same way — this
engine and `liuren-ts-lib` against `kinliuren` — which is the second witness
`docs/sources.md` asks for before anything is written down.

**Three clauses were wrong, and the agreeing witnesses said which.** The method
was the one that had just worked for the reference itself: where two
independent implementations agree, ask what rule reproduces them, and take the
rule rather than the table.

- **伏吟 is not a rule about stems.** The pattern looked like one — every 乙
  and every 癸 day opened on the stem's seat where 丁, 己 and 辛 opened on the
  branch's, which no statement of 剛日干上神 · 柔日支上神 accounts for. It is
  **杜傳**: a still plate can still show one control, and where it does the
  board is answered by the ordinary rule instead of by its own silence. Only
  the first course can show it — the other three stand on themselves — and 乙
  木 over 辰 土 is always a 賊 while 癸 水 under 丑 土 is always a 剋, where
  丁 and 己 over 未 and 辛 over 戌 never are. The per-stem pattern was a
  consequence of the phases, not a rule. **伏吟 dispatched before 賊剋 was the
  error**, and the fix took the comparison from 95.0 % to 97.2 %.
- **涉害 asks where before it asks how deep.** 「孟深仲淺季當休」 orders the
  clauses: a candidate standing on one of the four 孟 palaces is preferred
  outright, a 仲 only when no 孟 is present, and depth decides *inside* that
  group rather than across it. Scored over the 505 boards both references
  agree on, 孟 → 仲 → depth gives 95.8 % against 90.5 % for depth → 孟 → 仲,
  which is what this engine had. Counting backwards to the home palace instead
  of forwards was also tried and is much worse — 58.2 % at best. 97.2 % to
  98.6 %.
- **八專 comes before 遙剋, not after.** Its condition is 「如無上下相剋」, and
  a distant control is not a control between a course and its ground — it is
  what the board is asked *once no such control exists*. Every remaining 遙剋
  disagreement was a 八專 day. 98.6 % to 99.6 %.

**Where it stands.** Against `liuren-ts-lib`, **8 604 / 8 640 = 99.6 %**;
where the two references agree with each other, **7 099 / 7 120 = 99.7 %**.

**The 21 that remain** are all 涉害, and they are one narrow clause: candidates
on a 仲 palace against candidates on a 季, where the 季 is much the deeper and
the references take it. The 復等 clauses of 涉害 go further than 孟 · 仲 · 季
and this engine does not implement them. **It stops here deliberately.** Tuning
past this point would be fitting to one implementation rather than to the
tradition, which is what this phase set out not to do, and 0.24 % of the space
is a smaller error than the 17.6 % the two references differ from each other
by. What is left is a question for 《六壬大全》, not for another round of
scoring.

Where this engine ends up differing deliberately, that is a divergence to
declare — possibly a parameter, as `yuan` became in phase 3 when the same
thing happened with 拆補.

**The tests carry their values in the open**, as every test here does:
`test/liuren.test.ts` asserts one board per rule and per 課體, and **every one
of them is a board both references agree on**. Nothing is asserted from the
17.6 % where they do not. Two structural checks stand beside them — the
general steps back one branch at each of the twelve 中氣, and the `guiren`
divergence moves the generals over every hour of a day while leaving the
transmissions identical — and one that lays all 17 280 boards to prove none
throws or comes back short.

> The corpus is generated outside the repo, as phase 3's comparisons were: a
> ~40-line script over `kinliuren`, whose output feeds a throwaway test. No
> fixture is committed — every shipped test in this project carries its
> expected values in the open, and a 17 280-row oracle is not a test, it is
> the thing tests are written *from*.

**Surfaces.** The `new-feature` procedure, unchanged, and the one addition
that was not small is done: `packages/plate` carries a **second drawing**. Not
a grid of nine — the 六壬 board is a *ring of twelve*, the branches round the
edge of a four-by-four with the four inner cells left for what the board
turned out to be, which is the arrangement every printed 課式 uses and puts the
south at the top like the compass on the other board. Each palace stacks three
things: the general above, the 天盤 branch large in the middle, the palace's
own branch faint underneath, because the ground is what a reader orients by
and not what they read. The lessons are written right to left and the
transmissions downwards.

**And a section of its own**, at `/[lang]/liuren`, second in the nav because
六壬 is the sibling of the board beside it and not an instrument the way the
pillars and the scan are. Laying is navigating here, as casting is for the
chart: the address holds the moment, an empty one is the present minute — a
board of this minute is what a 六壬 reader wants most often, where a chart of
birth for whoever opened the page would be a wrong answer — and the one
divergence offered, `guiren`, travels in it. The page prints, with the same
pair of pictures the chart draws: an `<img>` carries its colours in its
address, so the copy for paper is a second one drawn at `scheme=light` and
warmed the moment the board is laid.

**One thing was said twice and is now said once.** 八專, 別責 and 涉害 name the
shape of the board with the same words as the rule that found it, so a board
drawn by one of them carried `the eight concentrated` in the middle of the
picture and again underneath. Both the drawing and the page now drop the 課體
when it repeats the rule.

**And it is coloured, by the argument the palette already makes.** `palette.ts`
keeps `elementInk` for *the glyphs that are a phase* — «a stem is fire, not a
thing filed under fire, and the relation between the two stems standing in a
palace is the first thing anyone reads off a chart». That transfers to this
board and lands harder: a branch is its phase exactly as a stem is, and the
relation between what stands on a palace and what it stands on is not the
first thing read here, **it is the rule**. 賊剋 asks which of the two controls
the other, and written in the phases' own inks that question is answered
before a character is.

So the branches take the ink — on the ring, in the four lessons, in the three
transmissions — and each palace takes a **tint from its own branch**, which
never moves. The ring is a fixed ground and what changes hour to hour is the
ink standing on it, which is what the board *is*. On a 伏吟 board the two
agree in every cell, and the picture is what 伏吟 means.

Not a line of doctrine was added for it: `Branch.element` has been in
`ganzhi.ts` since phase 1. **What was left alone is the 十二天將.** They carry
five-phase assignments the tradition transmits, and colouring them would be
this file adding a table from memory with no entry in `docs/sources.md` — the
one thing that is never done here. They stay in the neutral ink until a source
is registered for them.

**And it is read in a European language, as the chart is.** Every name on the
board carries its word underneath — the twelve generals, and the branch that
has come to stand on each palace — because the picture is what travels and a
reader who does not read Chinese has to be able to read it. Two things bound
that. The palace's **own** branch takes no word: it is the ground, it never
moves, and the twelve of them in order are the frame rather than the news —
which is the same bargain the chart's compass ring strikes, hanzi against the
grid and words outside them. And the board grew from 720 to 900, the chart's
own size, because five registers to a cell need the room the chart already
gives six.

The first render of that was wrong in a way only looking could catch: `the six
harmonies` and `the celestial queen` wrap to two lines, and the second line
landed inside the branch glyph below. The rhythm of a cell is set by that
glyph — at 0.24 of the cell it rises about 0.19 above its own baseline — so
the room for a second line is reserved rather than hoped for.

Two things it had to learn that the first drawing already knew. Type is
**fitted** to the middle rather than set at a size and hoped for: the caption
arrives from a caller in a language this package does not know, and an English
gloss is three times the width of the hanzi it renders — the first render put
`the eight concentrated` straight through two palaces. And `plate` still
imports nothing from `core`, so the board's shape is redeclared beside the
chart's and `test/types.test.ts` proves both copies still take the real thing
without a cast.

### Phase 14 — The consultation takes a second instrument

**The debt phase 13 opened, and paid.** The consultation casts a Qi Men
chart at the instant of the asking. There are two boards now, and the question
is not which to show but *what a consultation is* when the act has more than
one instrument.

**One consultation, and the instrument is a field of it.** Not two
consultations side by side, which would privilege one art by the accident of
which was built first; not a door with two choices, which puts a click in
front of the question and the whole point of this page is that the question
comes first. The root of a language stays the one consultation, and what is
chosen before pressing is which board the instant is laid on.

**The options say what they are for, never what they are called.** «When to
move, and which way» against «what is going on, and with whom» — because
somebody arriving with a question recognises the shape of their own, and
somebody arriving at `Qi Men` and `Liu Ren` is choosing between two words they
cannot weigh. The same rule that makes an option reading `chou` unusable.

**And the choice stands before the press and nowhere after it.** This is the
constraint the rest follows from. A tab, a toggle, a «see the other board»
under the result: every one of them lies about the hour. Either it casts again
— and then it is a different instant, not the instant of the question — or it
shows a board laid for a moment nobody asked at. **The instrument may be
chosen anywhere before the casting and at no point after it.** A reader who
wants the other board changes the field and presses again, which is a new
consultation of a new instant, and the page says so rather than pretending the
two are one.

The question they typed survives that. It is the same question; only the
instant is new, and making them write it out again would be a punishment for
changing their mind.

**One board in the fence, and what that saves.** The prompt is where this decision earns its keep, and it is worth setting down
what the alternative would have cost — because the alternative was nearly
built.

Two boards of one instant in one prompt invite three failures. The obvious one
is that a model merges them into a single verdict, inventing a correspondence
doctrine that no text carries: the 三式 were held as one competence and read
**separately, then compared**, never fused.

The second is not obvious and is worse. **The two boards are not independent
witnesses.** They share the day pillar, the 旬, the 空亡, the 遁干 and seven of
the eight 八神 — 螣蛇, 太陰, 六合, 白虎, 玄武, 朱雀, 勾陳 all stand among the
十二天將. Where they agree, that is frequently *the same fact printed twice*.
A model writing "both boards confirm" would be counting one datum as two, and
would do it with complete confidence, because convergence is exactly the shape
a reading expects to find. Not a miscalculation — **a false evidence produced
by the shape of the output itself**, which is the worst failure this project
can ship.

The third is quieter. The refusal of the 用神 does not weigh the same on the
two. On a Qi Men chart it is total: without a 用神 the board is a map with no
pin, and a model must choose one to say anything at all. A Liu Ren board hands
over its 三傳 already drawn, by nine rules that ask the reader nothing. Put the
two in one prompt and a model will find the second far easier to talk about —
and the reading will lean that way **not because it is more pertinent but
because it is more readable without deciding**.

All three are gone by construction rather than by warning. No non-fusion
clause to write, no paragraph for a model to recite unasked — which
`agent-prompt.md` already records as the reason an earlier one was cut.

**What is not lost, and where it went.** Casting more than one 式 on an instant and comparing them is transmitted
practice, and forbidding it would be this project deciding against a text. It
is not forbidden: **it moved to the sections that are addresses.**
`/[lang]/chart` and `/[lang]/liuren` already take the same instant from the
same query string, and `carriedSearch` already walks a moment from one to the
other. There nothing is asked — no question travels, no prompt is built, the
reader is *looking* rather than *asking*.

> A consultation is an act and takes one instrument. Comparing instruments is
> an observation, and it lives where nothing is being asked.

Which is also the right line on the discipline. Comparing the 三式 is a
practitioner's technique, and the consultation is built for somebody who is not
one — which is precisely the reader who would invent the fusion.

**年命 is offered under one instrument and not the other.** The consultation
already asks for a birth, and hands the 本命 and 行年 to the
prompt inside the fence. That stays, under Qi Men, where a person is not in
the chart at all until they are placed in it.

Under Liu Ren it is **not offered**, and the reason is structural rather than
cautious: the querent is already in the board. The first course stands on the
day stem, which *is* the person asking, and the third on the day branch, which
is the matter or the other party. A 本命 laid beside that would be a second way
of naming somebody the board has already named, and two names for one person
is how a reading acquires a relation that was never there. The fields for the
birth appear with the instrument that uses them and are absent with the one
that does not.

**What it touches.** `readingPrompt` stops being about a chart. **Two bodies and a shared
preamble**, not one function over a union: one speaks of palaces, of the 用神
the reader still has to choose, and of a 凶 that is not advice; the other of
四課 and 三傳, of 課體 that are names and not verdicts, and of a 返吟 whose rule
no reference implementation covers. `/api/liuren/prompt` and `/api/liuren/text` stand
beside the chart's, and `asked=true` stays the only thing the server is ever
told about the question.

> This document said `/api/chart/prompt` would be renamed to the
> consultation's, with the instrument among its parameters. It was not, and
> the reason is worth the line: **the endpoint tree mirrors the boards, not
> the acts.** `/api/chart/plate` and `/api/liuren/plate` were already siblings
> before this phase, and a prompt is of a board — the consultation only
> chooses which. One rename avoided and one asymmetry avoided.

The instrument travels in the address, because the consultation's rule is that
the **setup** travels and the question does not, and which board to lay is
setup exactly as `trueSolarTime` is.

`docs/agent-prompt.md` is written throughout as though there were one board.
It has to become a shared preamble and two halves, and that is prose work
rather than code.

**Two things left open on purpose.**

- **Whether the Liu Ren prompt tells a model that the 三傳 arrive already
  drawn.** It is true, and it stops a model reordering them. It is also an
  invitation to treat them as *the* answer — and the 用神 is still the
  reader's: which of the four courses stands for what was asked, the board
  does not say.
- **How much the consultation shows under a Liu Ren board.** The section at
  `/[lang]/liuren` shows the drawing, the transmissions, the lessons, the
  whole 天地盤 and the rule. A consultation may want less: there the reader is
  not studying the board, they are about to hand it to something that will
  read it.

### Phase 15 — The almanac layer

**Planned.** The cheapest of the three and the one a reader of dunjia will
notice missing, because dunjia already chooses hours and directions and the
almanac is what that choice was always read beside: 建除十二神 (from the month
branch and the day branch), 二十八宿值日 (a continuous count from an epoch),
and the 神煞 — but only some.

**The source is why this phase exists at all.** 《協紀辨方書》 (1741,
imperially commissioned, in the 四庫全書) is the one work of its kind that
**adjudicates between conflicting folk rules and says which it rejects and
why**. For a project whose register of numbers is `docs/sources.md`, a source
that shows its own reasoning is worth more than three that agree.

**The 神煞 are the risk, and the source is also the bound on it.** There are
hundreds of them and they diverge by lineage. Only those the 協紀 itself
ratifies are defensible here; the rest are left out and said to be left out,
as 三奇得使 was.

### Phase 16 — 七政四餘

**Planned, and scoped before it is started, because two of its questions have
no answer in the sky.**

**The half that is free.** `ephemeris.ts` already exposes a generic
`bodyLongitude(jd, body, context)` over Swiss Ephemeris and calls it for the
Sun and the Moon and nothing else. This project pays the AGPL for sweph and
uses a fraction of it. The 七政 are seven more calls.

**The 四餘 are the phase.** 羅睺 and 計都 are the lunar nodes and are
computable, but which node bears which name diverges by lineage — a
parameter, which is fine, and the kind of thing this project is built to
carry. 月孛 is the lunar apogee, mean or true — again a parameter. **紫氣 has
no referent.** It is a conventional cycle of about twenty-eight years,
computed by table from an epoch, and the 萬年曆 do not agree with one another.
There are two honest exits and no third: omit it, and say the output is
七政三餘 rather than pretending otherwise; or ship it as a named transmission
with its epoch cited and its lineage named, which is a kind of entry
`docs/sources.md` has never had to make. `ziqi` defaults to `off` in § 3 for
that reason — the default is the exit that claims least.

**And the frame is a decision, not a detail.** *Where* a planet is, is
arithmetic; *which 宿 and at what 度* requires committing to a table of 宿度
and an epoch, and 《授時曆》 and 《時憲曆》 give different widths for the same
twenty-eight lodges. Likewise the 命宮: the true rising degree and the 立命 of
月將加時 are two methods, not one method described twice.

**What it reads, and what it does not.** 《果老星宗》 and 《星學大成》
(萬民英, Ming) are the texts, and they are prose-verdict doctrine of exactly
the kind this engine does not import. The engine computes the geometry — the
positions, the lodges, the 命宮, the twelve palaces — names what the tradition
names, and stops. That it is a fate art changes what is on the board. It does
not change what the board is allowed to say.

### Phase 17 — The notes, decided last

**Planned, and last on purpose.** `/[lang]/notes` is a heading in the footer
with nothing under it. It used to say what the engine computes and how sure it
is: it named 拆補 and the methods refused beside it, counted the dates the
pillars were checked over, and named the single open implementation the layout
was compared against. Not one of those sentences survived a second board.
**A note that lags behind the engine misinforms exactly the reader it exists
for**, because whoever opens it is the one person on the site who came to
check rather than to read — so the page now says the section is still being
defined, which is the honest state and the whole of it.

**What the section is for is deferred with what it says.** It began as a
summary of the engine's provenance and need not end as one: it is the only
place here that is neither an instrument nor an address, and what this wants
to say beside its instruments is not settled while the instruments are still
arriving. So this phase fixes no contents — no list of the paragraphs it owes,
no promise about which of them carry over. Doing that now would repeat the
error the old page made, one phase earlier: written against an engine that has
not stopped changing, it would be rewritten at every board, in two languages,
from the same register it was derived from the first time. Decided once, at
the end, it is written once.

**The register is not deferred with it.** `docs/sources.md` is where each
number is entered as it arrives, and the notes page is never where one is
first written down. Whatever the section turns out to be, a phase that adds a
quantity still owes the register its entry the day it lands — the page reads
from it, for somebody who will not open the repository, and nothing upstream
waits on the page to be decided.

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
     divergence inside `chaibu` itself, and a second reference —
     fengshui-hacks.com — reads it the same way, which is the two agreeing
     sources this document asks for. It is shipped as `yuan`.

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

Phases 13, 15 and 16 are ordered by correlation and by cost, and the order is
not arbitrary: 六壬 reuses the substrate and has few divergences, the almanac
layer is derivable from what phase 1 already computes and rests on a single
authoritative source, and 七政四餘 needs two decisions taken before any code —
the 宿度 table and what becomes of 紫氣. None of the three is a prerequisite of
another. Each is a board of its own, and 六壬 is the one that pays first.

**Phase 14 is not in that sequence and comes before the rest of it.** It adds
no board: it is what the consultation has to become now that there are two,
and it is a debt phase 13 opened rather than a thing anybody chose to build.
A second board reached every surface that reads the engine and stopped at the
one surface where somebody *asks* something — which is the surface where
getting it wrong costs most, because that is the one that hands a board to a
model.

**Phase 17 is not in that sequence either, and comes after all of it.** It is
the only phase whose input is every other phase's output, and the only one
whose subject is still open: what the notes section is for is decided together
with what it says, at the end, when there is a finished thing to write beside.
Written early it is written against a moving engine and rewritten at every
board; written last it is written once. Nothing waits on it, and it waits on
everything.
