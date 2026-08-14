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
  The centre lodges in 2 southwest 坤 kūn, where its Yin Water 癸 guǐ is read.

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
| Liu Ren boards | 大六壬: the 天地盤 by 月將加時, the 四課, the 三傳 by the 九宗門, the 十二天將, the 遁干 and the 空亡 |
| Almanac | 曆注: 建除十二神, 二十八宿值日, the 十二神, twenty-six 年神 and the four 德 of the month — the officer, the lodge and the god of the day, and the bearings the year holds, reckoned on 120°E beside the chart rather than inside it |
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
qimen chart --date 2024-06-15 --time 14:00 --tz Asia/Shanghai \
            --born 1968-03-12 --gender female --prompt
```

What comes out is the chart set out in full inside a fence, wrapped in what
whoever reads it has to be told — that the 用神 belongs to the reader and is
chosen for the question asked, that the fortunes do not add up to a score,
that a 凶 is not advice, that the reading belongs to whoever gives it, and
which of the three tiers of certainty each number sits in. It is
[`docs/agent-prompt.md`](docs/agent-prompt.md) said to a model that will never
read it.

**A birth enters a chart the way the classics put it there.** `--born` adds a
年命: 本命, the year pillar of the birth, and — with `--gender`, which is read
for the direction of the count and nothing else — 行年, the year being lived,
each looked up **inside the chart of the moment**. The chart does not move for
it. That is the whole of the direction, and it is the reverse of a natal
chart: 《遁甲演義》 (程道生, Ming, in the 四庫全書) holds that a reading which
leaves the two out has missed the fine part of the method — 「夫用遁之法，不推
本命行年，未見精妙」 — and has the person's own year ride a palace where a good
star and gate stand in strength.

What comes back is where the two pairs fell, the palace their branch moors in,
and the 納音 image weighed against that ground. Nothing more: 生旺 and 囚死 are
the text's own verdicts and they need a question to have been asked. The same
pair is a criterion for a scan — `qimen scan --born …` admits only the palaces
that person's year stands on — which is the other half of what the 演義 asks
for, with what makes a palace worth standing in left to whoever is asking.

**A chart cast on a birth and read as a chart of a life was offered here once,
and is not any more.** What that frame could honestly hand a model was a
warning; this hands it two pairs and two palaces. The doctrine mapping palaces
onto parts of a life stays refused wherever a 年命 appears — the prompt, the
MCP tool and the interface all say so — for the reason `purposes.ts` gives
about everything past the eight gates. `docs/sources.md` records the natal
text that does exist, 《奇門遁甲統宗》卷十二, and why nothing imports it.

The interface section is `/en` — the root of a language — and it is not under
the board. The reason is an order the chart section cannot keep: **the instant
of asking is the instant that is cast**, so the question comes before the
casting or it is a caption on a chart that was already there. What the page
asks in the open is the question and the place; the date and the time are
under the options and empty, and empty is the instant of the press. The
question never leaves the browser — the server is told only that one exists —
and the consultation is not in the address: it is an act, not a link, and
reloading finds the fields ready rather than the answer preserved.

This project talks to no model, holds no key and sends nothing anywhere. The
prompt goes to a clipboard.

The prompt also carries the disclaimer the site's footer carries, as an
instruction to say it: this is food for thought and entertainment, it is no
substitute for professional advice on anything, and the power over a person's
choices and their path stays theirs. A prompt travels, and a disclaimer left
behind on the page it was copied from was written for somebody who is no
longer there.

## Layout

| | |
|---|---|
| `packages/i18n` | message catalogs and locale negotiation. A leaf: depends on nothing |
| `packages/geo` | location lookup over a local GeoNames dataset (SQLite) |
| `packages/core` | the engine, and the `qimen` command |
| `packages/plate` | the drawings: the nine palaces framed by the compass with the configurations under them, and the ring of twelve of a 六壬 board, SVG and PNG |
| `packages/mcp` | MCP server, nine tools, stdio |
| `apps/web` | SvelteKit: five sections at `/en` and `/it`, twelve endpoints under `/api` |

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
qimen liuren --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --lang en
qimen bazi  --date 1968-03-12 --time 14:30 --tz Europe/Rome --gender male
qimen terms --year 2024 --tz Asia/Shanghai
qimen calendar --date 2023-04-01
qimen scan  --date 2026-09-01 --until 2026-09-08 --tz Europe/Rome --gate kaimen --towards se,s
qimen chart --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --ask "Will it be signed?"
qimen chart --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --born 1968-03-12 --gender female

npm run dev -w @qimendunjia/web    # http://localhost:5173
npm start   -w @qimendunjia/web    # http://localhost:3000, after build
npm start   -w @qimendunjia/mcp    # MCP on stdio
```

Every surface takes the same parameters and answers the same way. A chart is a
pure function of its input, so the web address of one is shareable and
reproducible — the interface included: `/it/chart?date=1984-03-12&time=07:30&
locationId=1816670` is a chart, a link, and the same query string the API
takes. Which is also how the moment follows a reader from the chart to the
four pillars and back.

The two are shown together, up to a point. The chart draws the four pillars it
was cast from, as four tinted squares under the board — every calculator that
shows this board shows them, and they are what the ju, the chief and both post
horses are counted from — and leads to the section where the same instant is
opened out into concealed stems, gods and stages. It leads there and does not
fold it in: what a pillar conceals is another method's question, and a page
that answered it under the board would be reading the chart for somebody.

The scan is the other question. The chart and the pillars ask what
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

The section that leads breaks that promise on purpose, and is the only thing
here that does. `/en` — the root of a language, and the first entry in the
nav — poses a chart in order to hand it to something that will read it, and a
consultation is an act rather than an address: the chart is cast at the
instant it is asked for, it holds somebody's question, and neither is in the
URL. Which is the trade it makes to stand first: the classical use of this
method is a question put at an instant, and the three sections after it are
the instruments that use serves itself with. What it costs is the chart's old
address, `/en`, now `/en/chart`. See the section above.

The other way out of a cast chart is a printer. There is a stylesheet for
paper — the board redrawn in the colours of paper whichever appearance is on
screen, the fields and the switches gone, the nine palaces set to a width that
fits a sheet instead of a frame that scrolls — and what comes off it is the
question, the board, the four pillars, the reading and the disclaimer. It
prints from the page and not from a route of its own, because a route would
have to be told the question, and the question does not travel.

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
| `yuan` | under 拆補, the third of the term is counted from the term or from the day's 符頭 | `term` |
| `plate` | 轉盤 / 飛盤 | `zhuan` |
| `centreLodging` | the centre lodges in 坤, or in 坤 by yang dun and 艮 by yin | `kun` |
| `trueSolarTime` | correct clock time to the Sun | `true` |
| `yearBoundary` | 立春 or 正月初一 | `lichun` |
| `dayBoundary` | the day pillar turns at 23:00 or at midnight | `zishi` |
| `system` | which family of chart: the hour's (時家), the day's, the month's or the year's | `shijia` |

The Liu Ren board keeps its own, because it is a second board and not a view
of the first: a saved one has to reproduce on its own terms.

| | | Default |
|---|---|---|
| `yuejiang` | when the 太陽 changes palace: at the 中氣, at the 節氣, or by its true longitude | `zhongqi` |
| `guiren` | which verse seats the 貴人. It moves the twelve generals and never the three transmissions | `chou` |
| `zhouye` | where the day is cut for the noble's two seats: on the hour branch, or at the real sunrise | `branch` |

`method` accepts `chaibu` and `zhirun` today, and they are different schools,
not approximations of one another: under 拆補 each term is split into three
five-day thirds from the instant it begins, while under 置閏 the yuan follows
the day's 符頭 through whole fifteen-day blocks and the drift is paid off with
an intercalated 芒種 or 大雪 — so around a term's edges the two disagree even
about which term the ju belongs to, and occasionally about the dun itself.
A zhirun chart names the term its ju was taken from.

`yuan` is a divergence *inside* 拆補, and it moves the ju on most days: `term`
counts the three fives from the instant the term began, `futou` reads them off
the days instead — where the day pillar stands in the fifteen-day cycle headed
by 甲 and 己 is the yuan, and the term's own edge does not move it. Both
readings are held by schools that name themselves 拆補, and both are checked
against a runnable implementation; see `docs/sources.md`. It has no bearing
under 置閏, where the yuan is the 符頭's by construction.

`maoshan` raises `METHOD_NOT_IMPLEMENTED` rather than being silently
substituted, because a
chart cast by the wrong method looks right and is not; the same refusal
covers the unimplemented values of `plate` and `system`.

`centreLodging` is a reading and not only a rule: the centre has no direction,
no gate and no spirit, so what the ju puts there is read at its host. The
chart says so on the host's own row — `lodged` in the data, a line under the
plates on the command line, the cell itself in the interface — because
computing the consequence and printing only the host's own stem left it to be
known from somewhere other than the chart. The centre keeps it too: 轉盤 turns
the ring of eight and never the centre, so the stem stands on both plates and
there is one of it, said in both places it is read.

A chart carries the options that produced it, so a saved one reproduces
identically.

## How sure the numbers are

Not uniformly, and the difference is worth stating. The solar terms are
published astronomy, checked against an almanac over 1 926 dates; the Qi Men
layout is consistent with two independent implementations of a contested
tradition, checked over 160 charts and over 266; the configurations come from
Chinese-language sources with no runnable reference at all.

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

Under it stands a second band, where every name on the board is said aloud —
the palaces, the stems, the stars, the gates, the spirits, the branches of the
frame; on the 六壬 board the twelve branches, the twelve generals and whatever
stems the transmissions came covered by. It is the same list at every hour,
since what the hour changes is where the names stand and not which of them
stand, so the paper is the same height on every chart. The readings are in the
table beside the drawing too — but the picture is the half of this that
travels, saved, printed or handed to somebody, and there it has no table to be
looked up in.

## Contributing

`CLAUDE.md` holds the constraints that have to be known before touching
anything. `PLAN.md` holds the development history and the reasoning behind
each phase, including the mistakes. A feature crosses several surfaces and has
a procedure of its own: see `.claude/skills/new-feature`.
