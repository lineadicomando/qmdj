# The shape of the thing

One **pure engine** and the **adapters** that expose it. The engine computes;
it does not localise, does not interpret, and does not know it is being called
over HTTP. Everything a surface adds — a language, a picture, a route, a
prompt — is added outside it.

npm workspaces monorepo, npm scope `@shipan/*`, Node ≥ 22, ESM,
TypeScript, AGPL-3.0-or-later.

## The packages

| | Depends on | |
|---|---|---|
| `packages/i18n` | nothing | message catalogs and locale negotiation. A leaf |
| `packages/geo` | `i18n` | location lookup over a local GeoNames dataset (SQLite) |
| `packages/core` | `i18n`, `geo` | the calculation engine and the `shipan` command |
| `packages/plate` | nothing | the drawings: SVG, and PNG at a separate entry point |
| `packages/mcp` | `core`, `geo`, `i18n` | MCP server, stdio transport |
| `apps/web` | all of them | SvelteKit: the interface and the REST API |

Three of the edges above are absences, and each is load-bearing.

**`plate` imports nothing from `core`, not even types.** It redeclares the
shape it needs — of a chart, of a 六壬 board, of a 太乙 grid alike — and
`packages/plate/test/types.test.ts` asserts the copies still agree. The CLI
lives in `core` and draws, so the other direction would close a cycle; and a
drawing package that could reach the engine would end up computing.

**The PNG lives at `@shipan/plate/png`**, a separate entry point, because
it pulls a native module that must never reach the browser. It also needs a
CJK font *and* `fontconfig` — the glyphs are the content, and without either
the drawing comes out an empty grid, silently. `png.ts` refuses to draw when
it detects it, and the runtime image installs both.

**The client imports only types from `core`.** A value import would drag the
ephemerides and a native module into the browser bundle.

## Inside `core`

```
packages/core/src/
├── time.ts             local → UT (luxon + IANA)
├── true-solar.ts       equation of time and the longitude correction
├── solar-terms.ts      the 24 節氣, from sweph.solcross_ut
├── lunar.ts            new moons, lunar months, the intercalary month
├── ganzhi.ts           the sexagenary cycles of year, month, day, hour
├── pillars.ts          the four pillars, the substrate of everything else
├── zhirun.ts           the 置閏 term drift, kept apart from the layout
├── bazi/               八字: hidden stems, 納音, relations, luck, distribution
├── dunjia/             the Qi Men chart: ju, palaces, plates, patterns, …
├── liuren.ts           大六壬
├── qizheng.ts          七政四餘
├── ziwei.ts, ziwei/    紫微斗數
├── taiyi.ts            太乙神數
├── almanac.ts          曆注, beside a chart rather than inside one
├── nianming.ts         年命: a birth placed inside a chart of a moment
├── scan.ts             every chart over an interval
├── purposes.ts         what each gate is chosen for — and what it refuses
├── format.ts           the dense rendering, for the CLI and for agents
├── prompt.ts           the prompt builders, one per board
├── labels.ts           identifier → hanzi → pinyin
├── types.ts            the options, and every board's input type
└── cli.ts              the `shipan` command
```

`solar-terms.ts` is the pivot. The 24 terms are the instants at which the
Sun's apparent longitude crosses a multiple of 15°; from them follow the year
boundary, the month pillar, the ju number and the luck cycles. New moons have
no dedicated function in `sweph` and are found by iterative search on
Sun–Moon elongation.

**The calendrical layer is where nearly all the technical risk sits**, and it
is why `docs/sources.md` exists. See it before touching any of the four files
above the boards.

## The surfaces

| | |
|---|---|
| CLI | `shipan`, nine commands: `qimen` `liuren` `qizheng` `taiyi` `bazi` `ziwei` `terms` `calendar` `scan` |
| REST | 26 GET endpoints under `/api`. Six boards × (board, `plate`, `text`, `prompt`), plus `/api/locations`, `/api/terms`, `/api/moments` — and `/api/bazi` has no `plate` |
| Web | eight sections at `/en` and `/it`: two acts, six instruments. See `apps/web/src/lib/navigation.ts`. Under the footer, five notes pages and a privacy page, which are not sections and are not addressed by an art |
| MCP | 12 tools and 4 reference resources, stdio. See `packages/mcp/src/server.ts` |

Those four counts are asserted against the code by
`apps/web/test/docs.test.ts`, because a number written by hand in a document
drifts and the last one did.

**A section is addressed by the art it lays out, and so is its endpoint.**
`/api/qimen` answers a `qimen`, `/api/liuren` a `liuren`. The one exception is
the consultation, which has no art of its own because it takes any of them,
and therefore keeps `/[lang]` — the root of a language. `/[lang]/consult` is
the *name* of that section rather than a second address for it, and redirects
there carrying the setup.

## Paper is the fourth appearance

Not light: light is a paper-*coloured* screen, set against a lit surface.
Paper is its own target.

`@media print` in `app.css` resets the properties for white, **at the
specificity of `[data-color-scheme='dark']`**, so a reader who picked dark does
not print a page of toner. Each component says whether it belongs on a sheet,
and the table of palaces drops its scrolling frame — a frame that still clips
on paper prints three palaces of nine and gives no sign of the other six.

The board is the exception the CSS cannot reach: an `<img>` carries its
colours in its address, so both pages draw a second copy at `scheme=light`,
hidden on screen and warmed as soon as the chart is cast, since `beforeprint`
cannot wait for a picture.

**The consultation prints from the page and never from a route of its own**,
because a route would have to be told the question. See `docs/readings.md`.

## `geo`, and the dataset it stands on

Location search matches by **range, never with `LIKE`**: SQLite cannot use an
index for `LIKE 'prefix%'` under the default collation and falls back to
scanning every name in the table. See `prefixUpperBound` in `geo/search.ts`
and the query-plan test that guards it.

Measured from a full `allCountries` import on 2026-08-04, kept so the decision
does not have to be re-measured:

| | `cities500` | `allCountries`, class P |
|---|---|---|
| download | ~215 MB | ~620 MB |
| places | 235 073 | 5 048 805 |
| searchable names | 1 217 417 | 12 404 962 |
| database | 90 MB | 1256 MB |

At the larger size a two-letter prefix matches 334 848 name rows over 192 314
distinct places, and ranking them costs 644 ms because every candidate follows
a rowid into the large table. Copying `population` and `country_code` into
`location_names` fixes it — the index then covers the ranking and only the
surviving rows are read — but that is the cost of entry, not an optional
refinement.

## Reproducibility

A chart is a pure function of its input **and of the options that produced
it**, which it carries in its own output. No function in `core` reads a global
default. `tzdata` is pinned, the GeoNames snapshot is versioned, and a place
is stored resolved — coordinates, timezone, options — rather than as an
identifier alone.

See `docs/parameters.md` for the options themselves, `docs/i18n.md` for what
crosses the language boundary, and `docs/refusals.md` for where the engine
stops.
