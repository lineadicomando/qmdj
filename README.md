# qimendunjia

Qi Men Dun Jia charts and Four Pillars: a **pure engine** and **adapters** that
expose it on a command line, over HTTP, to AI agents, and in a browser.

Everything runs locally. No third-party API is called at runtime — not for the
ephemerides, not for the places, not for anything.

```
$ qimen chart --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --lon 116.4

Four Pillars
  year   Yang Wood · Dragon  甲辰 jiǎchén
  month  Yang Metal · Horse  庚午 gēngwǔ
  day    Yang Metal · Dog    庚戌 gēngxū
  hour   Yin Water · Goat    癸未 guǐwèi

Qi Men chart
  ju               yang dun 9 · lower yuan 下元 xiàyuán
  concealing 甲    Yin Earth 己 jǐ
  chief            Canopy 天蓬 tiānpéng → centre 中 zhōng
  chief gate       Rest 休門 xiūmén → north 坎 kǎn

Nine palaces
  palace               earth               heaven
  1 north 坎 kǎn       Yin Earth 己 jǐ     Yang Water 壬 rén
  2 southwest 坤 kūn   Yang Metal 庚 gēng  Yin Earth 己 jǐ
  …

What stands in each
  palace      star                   gate                spirit
  1 坎 kǎn    Assistant 天輔 tiānfǔ  Rest 休門 xiūmén    Union 六合 liùhé
  2 坤 kūn    Canopy 天蓬 tiānpéng   Death 死門 sǐmén    Chief 值符 zhífú
  …

How each of them stands
  palace      star                              gate
  1 坎 kǎn    resting · generated 生我 shēngwǒ  imprisoned · same phase 比和 bǐhé
  2 坤 kūn    imprisoned · controlled 剋我 kèwǒ  supported · same phase 比和 bǐhé
  …
```

Every name arrives three ways at once: the word you read, the name as it is
written, and the name as it is said. None of the three is optional — see
[the vocabulary](#three-kinds-of-string).

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

## Handing a chart to something that will read it

The refusal above has a consequence: somebody who wants a reading takes the
date to a model, and a model handed a date and a place casts the chart from
memory and gets it wrong. A wrong chart read well is the worst thing this
project can produce, because nothing downstream catches it — it looks exactly
like a right one.

So the chart travels **already computed**, and the conditions travel with it:

```sh
qimen chart --date 2024-06-15 --time 14:00 --tz Asia/Shanghai \
            --ask "Will the contract be signed as it stands?"
qimen chart --date 1968-03-12 --time 14:30 --tz Europe/Rome --natal
```

What comes out is the chart set out in full inside a fence, wrapped in what
whoever reads it has to be told — that the 用神 belongs to the reader and is
chosen for the question asked, that the fortunes do not add up to a score,
that a 凶 is not advice, that the reading belongs to whoever gives it, and
which of the three tiers of certainty each number sits in. It is
[`docs/agent-prompt.md`](docs/agent-prompt.md) said to a model that will never
read it.

**Two frames, and they do not overlap.** A question asked now is the classical
use. A chart cast for a birth and read as a chart of a life is a modern and
minority application, widespread enough to be worth framing honestly and
disputed enough that a frame is all that is offered: the prompt says the
schools do not agree, and it refuses to say which palace stands for which part
of a life — that is the doctrine `purposes.ts` declines to carry, from the
sources it names as unusable, and it is where a model invents most
confidently. A chart of a birth carrying a question would be a third thing,
and `--natal` refuses `--ask` rather than resolving it.

In the interface both live in their own section, `/en/consult`, and not under
the board. The reason is an order the chart section cannot keep: **the instant
of asking is the instant that is cast**, so the question comes before the
casting or it is a caption on a chart that was already there. There is nothing
else on that page. The question never leaves the browser — the server is told
only that one exists — and the consultation is not in the address: it is an
act, not a link, and reloading finds the fields ready rather than the answer
preserved.

This project talks to no model, holds no key and sends nothing anywhere. The
prompt goes to a clipboard.

The prompt also carries the disclaimer the site's footer carries, as an
instruction to say it: this is for entertainment, and whatever anybody does on
the strength of a reading is entirely their own decision and their own
responsibility. A prompt travels, and a disclaimer left behind on the page it
was copied from was written for somebody who is no longer there.

## Layout

| | |
|---|---|
| `packages/i18n` | message catalogs and locale negotiation. A leaf: depends on nothing |
| `packages/geo` | location lookup over a local GeoNames dataset (SQLite) |
| `packages/core` | the engine, and the `qimen` command |
| `packages/plate` | the drawing: nine palaces framed by the compass, the configurations listed under them, SVG and PNG |
| `packages/mcp` | MCP server, seven tools, stdio |
| `apps/web` | SvelteKit: four sections at `/en` and `/it`, eight endpoints under `/api` |

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
qimen chart --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --ask "Will it be signed?"

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

The fourth section breaks that promise on purpose, and is the only thing here
that does. `/en/consult` poses a chart in order to hand it to something that
will read it, and a consultation is an act rather than an address: the chart
is cast at the instant it is asked for, it holds somebody's question, and
neither is in the URL. See the section above.

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

English and Italian, English by default. But there are four kinds of string
here, not two:

<a id="three-kinds-of-string"></a>

| | example | where it lives |
|---|---|---|
| identifier | `xiumen`, `tianpeng` | the engine, toneless pinyin, never translated |
| hanzi | 休門, 天蓬 | the engine — **domain data, not a locale** |
| pinyin | xiūmén, tiānpéng | the engine — the same, said aloud |
| gloss | "Rest" / "Riposo" | the catalog, keyed by identifier |

The middle two are the ones usually got wrong. 休門 is not the Chinese
rendering of "Rest Gate": it is the name of the gate, and an Italian reader
wants to see it as much as a Chinese one does. So hanzi travels in the
engine's output whatever the locale, and the catalog only supplies the gloss
beside it.

The transliteration travels with it and for the reader who most needs it. A
glyph alone is, to someone who does not read Chinese, a shape with no sound:
it cannot be pronounced, looked up in a dictionary, or asked about out loud.
`xiūmén` is what carries the name out of the screen. It is a property of the
name and not of a language — 休門 is xiūmén on `/it` and on `/en` — which is
why it sits in the engine beside the hanzi and not in a catalog. The tones are
kept because they are what the identifiers had to drop: `jing1men` and
`jing3men` carry a digit precisely because `jingmen` cannot say whether it
means 驚門 jīngmén or 景門 jǐngmén.

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
