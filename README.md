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
| Qi Men charts | 時家 by the 拆補 or 置閏 method: four plates, configurations, seasonal states, 門宮 and 星宮 relations, the post horse of the day and of the hour |
| Choosing a time | 擇時擇方: every chart over an interval, narrowed to the palaces answering stated criteria |

It reports **arrangements and what the tradition calls them**. A gate stands
over a palace whose phase it controls; the configuration is called 門迫; 迫 is
oppression, so it comes back marked 凶. That last part is an attribute of the
arrangement, transmitted with its name in the same line of the same text, and
carrying it is reporting rather than interpreting — an engine that dropped it
would be editing its sources, which it did, into glosses like "gate oppressed"
where nothing could test it.

What it does **not** do is everything that needs a question to have been asked:
it does not choose the 用神 for what you want to know, does not rank palaces,
does not order two hours, does not date an outcome, and does not advise. A
chart holding four 凶 configurations is not a bad time to do anything — bad is
a word about an undertaking, and no undertaking is known here.
See [`docs/agent-prompt.md`](docs/agent-prompt.md).

## Layout

| | |
|---|---|
| `packages/i18n` | message catalogs and locale negotiation. A leaf: depends on nothing |
| `packages/geo` | location lookup over a local GeoNames dataset (SQLite) |
| `packages/core` | the engine, and the `qimen` command |
| `packages/plate` | the drawing: nine palaces framed by the compass, the configurations listed under them, SVG and PNG |
| `packages/mcp` | MCP server, seven tools, stdio |
| `apps/web` | SvelteKit: interface at `/en` and `/it`, six endpoints under `/api` |

npm workspaces, Node ≥ 22, ESM, TypeScript.

## Getting started

```sh
npm install
npm run geo:import -w @qimendunjia/geo   # ~215 MB, once
npm run build
npm test
```

The location import is the only slow step and it is needed only for searching
places by name; everything else works without it — except the tests that
search. `npm run geo:fixture -w @qimendunjia/geo` writes a four-place stand-in
in seconds, enough for every suite, and refuses to touch a database that
already exists. It is what continuous integration uses. The ephemeris files are
fetched by `npm run ephe:download -w @qimendunjia/core` (~2 MB) and are
optional — without them the engine falls back to Moshier, which needs no files
and is accurate to about a tenth of an arc second. That is far below anything
a pillar turns on.

## The surfaces

```sh
qimen chart --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --lang en
qimen chart --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --method zhirun
qimen bazi  --date 1968-03-12 --time 14:30 --tz Europe/Rome --gender male
qimen terms --year 2024 --tz Asia/Shanghai
qimen calendar --date 2023-04-01
qimen scan  --date 2026-09-01 --until 2026-09-08 --tz Europe/Rome --gate kaimen --towards se,s

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

The third section is the other question. The chart and the pillars ask what
stands *now*; `/it/moments` asks *when, in a stretch of days, does a thing
stand — and which way is it*. That second half is not decoration: a chart is
consulted for a direction as much as for an hour, and an answer of times
alone would have thrown away what this art has and the others do not. Each
row links back to the whole board for its hour, and the hours worth comparing
are set aside into a shortlist that rides in the address with the scan — so it
survives narrowing the criteria and running them again, and can be sent to
somebody as a link.

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
| `centreLodging` | the centre lodges in 坤, or in 坤 by yang dun and 艮 by yin | `kun` |
| `trueSolarTime` | correct clock time to the Sun | `true` |
| `yearBoundary` | 立春 or 正月初一 | `lichun` |
| `dayBoundary` | the day pillar turns at 23:00 or at midnight | `zishi` |

`method` accepts `chaibu` and `zhirun` today, and they are different schools,
not approximations of one another: under 拆補 each term is split into three
five-day thirds from the instant it begins, while under 置閏 the yuan follows
the day's 符頭 through whole fifteen-day blocks and the drift is paid off with
an intercalated 芒種 or 大雪 — so around a term's edges the two disagree even
about which term the ju belongs to, and occasionally about the dun itself.
A zhirun chart names the term its ju was taken from. `maoshan` raises
`METHOD_NOT_IMPLEMENTED` rather than being silently substituted, because a
chart cast by the wrong method looks right and is not; the same refusal
covers the unimplemented values of `plate` and `system`.

A chart carries the options that produced it, so a saved one reproduces
identically.

## How sure the numbers are

Not uniformly, and the difference is worth stating. The solar terms are
published astronomy, checked against an almanac over 1 926 dates; the Qi Men
layout is consistent with one implementation of a contested tradition, checked
over 160 charts; the configurations come from Chinese-language sources with no
runnable reference at all.

**[`docs/sources.md`](docs/sources.md) holds the whole register**: every
source by name, what each was checked against, the licences, and — where two
sources disagreed — which was followed and why. It is the document to read
before trusting any single number, and the one to add to before shipping a new
one.

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
locale-independent, because the palaces carry hanzi. Only its captions, the
eight directions around its frame and the band of configurations under it are
text in a language — and the frame keeps the twelve branches beside them, since
子 is due north in every language.

The band is where a fortune is written, and the reason it exists: 吉 set alone
in a palace would be a name with no gloss, and there is no room beside it for
the word. It also carries 伏吟 and 反吟, which belong to the whole board and
have no palace to be marked in — without it the picture never mentions them.

## Contributing

`CLAUDE.md` holds the constraints that have to be known before touching
anything. `PLAN.md` holds the development history and the reasoning behind
each phase, including the mistakes. A feature crosses several surfaces and has
a procedure of its own: see `.claude/skills/new-feature`.
