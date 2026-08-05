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
| `packages/core` | calculation engine and the `qimen` CLI: solar terms, lunar calendar, sexagenary cycles, Four Pillars, Qi Men charts, scanning an interval |
| `packages/plate` | the drawing: nine palaces, glyphs, SVG and PNG |
| `packages/mcp` | MCP server: seven tools, three resources, stdio transport |
| `apps/web` | SvelteKit: interface at `/en` and `/it`, plus six GET endpoints under `/api` |

npm workspaces monorepo, Node ≥ 22, ESM, TypeScript.

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
`npm run ephe:download -w @qimendunjia/core` (~2 MB) is optional — without it
the engine falls back to Moshier, which needs no files.

## Constraints

- **English is the language of the source.** Code, comments, identifiers, error
  codes, documentation and commit messages. Italian exists only as a locale in
  the catalogs of `packages/i18n`, never in the source.
- **The engine does not localise, exactly as it does not interpret.** `core`
  returns identifiers, hanzi and numbers; readable text is produced at the
  surface. A function that returns a translated string is a design error.
- **Chinese characters are not a locale.** 休門 is not the Chinese rendering of
  "Rest Gate": it is the name of the gate, and every reader expects to see it.
  Hanzi travels in the engine's output at all times; the catalog supplies only
  the gloss beside it. Identifiers are toneless pinyin (`xiumen`, `tianpeng`).
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
  redeclares the shape it needs and a test asserts the two still agree. The
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

Domain identifiers are toneless pinyin where the domain is Chinese
(`ganzhi`, `jieqi`, `zhifu`, `xiumen`); everything else is English. Where
dropping the tone would collide, and only there, the tone number is kept:
`jing1men` is 驚門 and `jing3men` is 景門.

## Adding a feature

A feature crosses several surfaces and has a procedure of its own — see the
`new-feature` skill, once phase 6 exists.
