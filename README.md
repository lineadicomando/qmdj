# qimendunjia

Qi Men Dun Jia charts and Four Pillars: a **pure engine** and **adapters** that
expose it on a command line, over HTTP, to AI agents, and in a browser.

Everything runs locally. No third-party API is called at runtime — not for the
ephemerides, not for the places, not for anything.

```
$ qimen chart --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --lon 116.4

Qi Men chart
  ju                  yang dun 9 · 下元 (lower yuan)
  chief               天蓬 (Canopy) → 中 (centre)
  chief gate          休門 (Rest) → 坎 (north)

Nine palaces
  palace            earth heaven  star                  gate                  spirit
  1 坎 north        己    壬      天輔休 Assistant      休門囚 Rest           六合 Union
  2 坤 southwest    庚    己      天蓬囚 Canopy         死門相 Death          值符 Chief
  …
```

## Licence

**AGPL-3.0-or-later**, imposed by Swiss Ephemeris. Every dependency must be
compatible with it. The GeoNames data is CC BY 4.0.

## What it computes

| | |
|---|---|
| Solar terms | the twenty-four 節氣, to the second, from Swiss Ephemeris |
| Lunar calendar | months, intercalary months, lunar dates, reckoned on 120°E |
| Four pillars | 四柱 with 藏干, 十神, 納音, 十二長生, 空亡, 大運 |
| Qi Men charts | 時家 by the 拆補 method: four plates, configurations, seasonal states |

It does **not** interpret. It reports that a gate stands over a palace whose
phase it controls and that the configuration is called 門迫; what that means
belongs to whoever reads it. See [`docs/agent-prompt.md`](docs/agent-prompt.md).

## Layout

| | |
|---|---|
| `packages/i18n` | message catalogs and locale negotiation. A leaf: depends on nothing |
| `packages/geo` | location lookup over a local GeoNames dataset (SQLite) |
| `packages/core` | the engine, and the `qimen` command |
| `packages/plate` | the drawing: nine palaces, SVG and PNG |
| `packages/mcp` | MCP server, six tools, stdio |
| `apps/web` | SvelteKit: interface at `/en` and `/it`, five endpoints under `/api` |

npm workspaces, Node ≥ 22, ESM, TypeScript.

## Getting started

```sh
npm install
npm run geo:import -w @qimendunjia/geo   # ~215 MB, once
npm run build
npm test
```

The location import is the only slow step and it is needed only for searching
places by name; everything else works without it. The ephemeris files are
fetched by `npm run ephe:download -w @qimendunjia/core` (~2 MB) and are
optional — without them the engine falls back to Moshier, which needs no files
and is accurate to about a tenth of an arc second. That is far below anything
a pillar turns on.

## The surfaces

```sh
qimen chart --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --lang en
qimen bazi  --date 1968-03-12 --time 14:30 --tz Europe/Rome --gender male
qimen terms --year 2024 --tz Asia/Shanghai
qimen calendar --date 2023-04-01

npm run dev -w @qimendunjia/web    # http://localhost:5173
npm start   -w @qimendunjia/web    # http://localhost:3000, after build
npm start   -w @qimendunjia/mcp    # MCP on stdio
```

Every surface takes the same parameters and answers the same way. A chart is a
pure function of its input, so the web address of one is shareable and
reproducible — the interface included: `/it?date=1984-03-12&time=07:30&
locationId=1816670` is a chart, a link, and the same query string the API
takes. Which is also how the moment follows a reader from the chart to the
four pillars and back.

One exception, and it is the same rule read carefully: an address that does
not say *when* means now, and now is a different answer every hour. Those are
`no-store`; only an address that fixes the instant is cacheable.

## Docker

```sh
docker compose --profile setup run --rm geo-import   # once, ~215 MB
docker compose up -d                                 # http://localhost:3000
docker compose run --rm -T mcp                       # MCP on stdio
```

One image serves all three; only the command differs. The runtime image
installs `fonts-noto-cjk` on purpose: a chart is nine palaces of Chinese
characters, and without a font that can draw them the PNG renders a grid of
empty boxes — a picture that looks like a chart and says nothing.

## No school is implicit

Different schools produce different charts from identical input. Every
divergence is a parameter with a declared default, present in the input type
from the first release:

| | | default |
|---|---|---|
| `method` | 拆補 / 置閏 / 茅山 | `chaibu` |
| `plate` | 轉盤 / 飛盤 | `zhuan` |
| `trueSolarTime` | correct clock time to the Sun | `true` |
| `yearBoundary` | 立春 or 正月初一 | `lichun` |
| `dayBoundary` | the day pillar turns at 23:00 or at midnight | `zishi` |

`method` accepts only `chaibu` today. The other two raise
`METHOD_NOT_IMPLEMENTED` rather than being silently substituted, because a
chart cast by the wrong method looks right and is not.

A chart carries the options that produced it, so a saved one reproduces
identically.

## How sure the numbers are

Not uniformly, and the difference is worth stating.

- **Solar terms, lunar calendar, four pillars** — verified against
  `lunar-javascript` over 1 926 dates from 1902 to 2098. Year, month, day and
  hour pillars and the lunar date agree on every one of them.
- **The Qi Men layout** — verified against `qimen-dunjia` over 160 charts; all
  thirteen quantities compared agree on every one, and the derived earth plate
  reproduces all eighteen published arrangements. This means *consistent with
  one implementation of a contested tradition*, not *verified against an
  authority*: no observatory publishes Qi Men charts.
- **The configurations and the seasonal states** — from Chinese-language
  sources, each rule tested against the transmitted list it should reproduce.
  There is no runnable reference for these at all.

Working from memory was tried and abandoned: recalled almanac values were
wrong more often than not, and the tests only became trustworthy once every
anchor had survived an independent check.

## Two languages, and a third thing that is not a language

English and Italian, English by default. But there are three kinds of string
here, not two:

| | example | where it lives |
|---|---|---|
| identifier | `xiumen`, `tianpeng` | the engine, toneless pinyin, never translated |
| hanzi | 休門, 天蓬 | the engine — **domain data, not a locale** |
| gloss | "Rest" / "Riposo" | the catalog, keyed by identifier |

The middle row is the one usually got wrong. 休門 is not the Chinese rendering
of "Rest Gate": it is the name of the gate, and an Italian reader wants to see
it as much as a Chinese one does. So hanzi travels in the engine's output
whatever the locale, and the catalog only supplies the gloss beside it.

A consequence worth having: the drawing is almost entirely
locale-independent, because the palaces carry hanzi. Only its captions are
text in a language.

## Contributing

`CLAUDE.md` holds the constraints that have to be known before touching
anything. `PLAN.md` holds the development history and the reasoning behind
each phase, including the mistakes. A feature crosses several surfaces and has
a procedure of its own: see `.claude/skills/new-feature`.
