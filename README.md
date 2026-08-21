# shipan 式盤

式盤 shìpán is the diviner's board itself: the round heaven turning on the
square earth, and the ancestor the three 式 — 奇門, 六壬, 太乙 — have in common.
Here it is a **pure engine** and **adapters** that expose it on a command
line, over HTTP, to AI agents, and in a browser.

Everything runs locally. No third-party API is called at runtime — not for the
ephemerides, not for the places, not for anything.

```
$ shipan qimen --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --lon 116.4

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
[the four kinds of string](#the-four-kinds-of-string).

**Licence AGPL-3.0-or-later**, imposed by Swiss Ephemeris. Every dependency
must be compatible with it. The GeoNames data is CC BY 4.0.

## What it computes

| | |
|---|---|
| Solar terms | the twenty-four 節氣, to the second, from Swiss Ephemeris |
| Lunar calendar | months, intercalary months, lunar dates, reckoned on 120°E |
| Four pillars | 四柱 with 藏干, 十神, 納音, 十二長生, 空亡, 大運, and the five elements counted over the eight characters |
| Qi Men charts | 時家 by the 拆補 or 置閏 method: four plates, configurations, seasonal states, 門宮 and 星宮 relations, the post horse of the day and of the hour |
| Liu Ren boards | 大六壬: the 天地盤 by 月將加時, the 四課, the 三傳 by the 九宗門, the 十二天將, the 遁干 and the 空亡 |
| 七政四餘 boards | the seven governors and three of the four remainders, placed by ephemeris: the 宿 and the 入宿度 with the boundaries taken from the 距星 themselves, the twelve 次 and the 宮度, 順 and 逆, the 命宮 by 加時 and the 人事十二宮 numbered from it |
| 紫微斗數 boards | the twelve seats counted from a birth: 紫微 by the 五行局 and the day of the lunar month with the thirteen that hang off it, the auxiliaries 卷二 places, the 四化, the seven grades of brightness, the two masters, the 大限, the 小限 and the rings of 長生 and 博士. Nothing on it is in the sky |
| 太乙 boards | 太乙神數 in the 年計: 太乙 walking the eight palaces and never the centre, the 十六神, 文昌 and 始擊, the 主算 and 客算 with the 大將 and 參將 each seats, the 八門直使, the 三基, 五福 and 大遊, and the conditions 掩 擊 迫 囚 關 格 對 |
| Almanac | 曆注: 建除十二神, 二十八宿值日, the 十二神, twenty-six 年神, the four 德 of the month and twenty-eight 神煞 — reckoned on 120°E beside the chart rather than inside it |
| Choosing a time | 擇時擇方: every chart over an interval, narrowed to the palaces answering stated criteria |

It reports **arrangements and what the tradition calls them**. A gate stands
over a palace whose phase it controls; the configuration is called 門迫; 迫 is
oppression, so it comes back marked 凶. That last part is an attribute of the
arrangement, transmitted with its name in the same line of the same text, and
carrying it is reporting rather than interpreting — an engine that dropped it
would be editing its sources into glosses like "gate oppressed", where nothing
could test it.

What it does **not** do is everything that needs a question to have been
asked: it does not choose the 用神, does not rank palaces, does not order two
hours, does not date an outcome, and does not advise. A chart holding four 凶
configurations is not a bad time to do anything — bad is a word about an
undertaking, and no undertaking is known here.

Every refusal is written down, with who asks for it and why it is not here:
[`docs/refusals.md`](docs/refusals.md).

## Handing a board to something that will read it

That refusal has a consequence: somebody who wants a reading takes the date to
a model, and a model handed a date and a place casts the chart from memory and
gets it wrong. A wrong chart read well is the worst thing this project can
produce, because nothing downstream catches it.

So the board travels **already computed**, and the conditions travel with it:

```sh
shipan qimen --date 2024-06-15 --time 14:00 --tz Asia/Shanghai \
             --ask "Will the contract be signed as it stands?"
shipan bazi  --date 1968-03-12 --time 14:30 --tz Asia/Shanghai \
             --gender female --prompt
shipan taiyi --year 2026 --about "the merger our two firms are negotiating"
```

What comes out is the board set out in full inside a fence, wrapped in what
whoever reads it has to be told — that the reading belongs to whoever gives
it, that the fortunes do not add up to a score, that a 凶 is not advice.

**Six boards, in three kinds, and the kind decides what is asked for.**

| Kind | Boards | What it is laid on | What the reader supplies |
|---|---|---|---|
| 卜 divination | 奇門, 六壬 | the instant of asking | a question |
| 命 fate | 八字, 七政四餘, 紫微斗數 | a birth | nothing asked; the themes are commissioned in the prompt |
| 天 heaven | 太乙 | a year | a **matter** — what is being looked at, with two sides in it |

A 卜 board withholds the 用神 and says so: which palace bears on the question
is the reader's, and without one the board is a map with no pin. A 命 reading
traverses the themes of a life — temperament, tensions, the work on oneself,
undertakings, ties — with every claim standing on the board and every choice
said as it is made. A 天 reading is descriptive and never predictive: its
subject is a year, nobody is on the board, and 太乙's received dynastic
readings stay out.

`--ask` works on `chart` and `liuren` and is **refused** on the others rather
than quietly dropped; `--about` is 太乙's alone and refused everywhere else.
Neither a question nor a matter ever reaches the server: over HTTP `asked=true`
and `about=true` say one exists, and the browser appends the text.

This project talks to no model, holds no key and sends nothing anywhere. The
prompt goes to a clipboard.

Full account: [`docs/readings.md`](docs/readings.md), and
[`docs/agent-prompt.md`](docs/agent-prompt.md) for what an agent calling this
has to know first.

### A birth inside a chart of a moment

`--born` adds a 年命: 本命, the year pillar of the birth, and — with `--gender`,
read for the direction of the count and nothing else — 行年, the year being
lived, each looked up **inside the chart of the moment**. The chart does not
move for it. That is 《遁甲演義》's own prescription and the reverse of a natal
chart: 「夫用遁之法，不推本命行年，未見精妙」.

What comes back is where the two pairs fell, the palace their branch moors in,
and the 納音 image weighed against that ground. Nothing more. The same pair is
a criterion for a scan — `shipan scan --born …` admits only the palaces that
person's year stands on. The doctrine mapping palaces onto parts of a life is
refused wherever a 年命 appears; an art natively about a life gets a board of
its own instead, which is what the three boards of 命 are.

## Getting started

```sh
npm install
npm run geo:import -w @shipan/geo   # ~215 MB, once
npm run build
npm test
```

The location import is the only slow step and is needed only for searching
places by name; everything else works without it, except the tests that
search. `npm run geo:fixture -w @shipan/geo` writes a four-place stand-in
in seconds — enough for every suite, refused if a database already exists, and
what continuous integration uses. The ephemeris files come from
`npm run ephe:download -w @shipan/core` (~2 MB) and are optional: without
them the engine falls back to Moshier, accurate to about a tenth of an arc
second, which is far below anything a pillar turns on.

## The surfaces

```sh
shipan qimen    --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --lang en
shipan qimen    --date 2024-06-15 --time 14:00 --tz Asia/Shanghai --method zhirun
shipan liuren   --date 2024-06-15 --time 14:00 --tz Asia/Shanghai
shipan qizheng  --date 2024-06-15 --time 14:00 --tz Asia/Shanghai
shipan ziwei    --date 1984-05-05 --time 14:30 --tz Asia/Shanghai --gender male
shipan bazi     --date 1968-03-12 --time 14:30 --tz Europe/Rome  --gender male
shipan taiyi    --year 2026
shipan terms    --year 2024 --tz Asia/Shanghai
shipan calendar --date 2023-04-01
shipan scan     --date 2026-09-01 --until 2026-09-08 --tz Europe/Rome \
                --gate kaimen --towards se,s

npm run dev -w @shipan/web    # http://localhost:5173
npm start   -w @shipan/web    # http://localhost:3000, after build
npm start   -w @shipan/mcp    # MCP on stdio
```

Every surface takes the same parameters and answers the same way. A chart is a
pure function of its input, so a web address is shareable and reproducible:
`/it/qimen?date=1984-03-12&time=07:30&locationId=1816670` is a chart, a link,
and the same query string the API takes. It is also how the moment follows a
reader from one board to another and back.

**Every section is addressed by the art it lays out** — `/it/qimen`,
`/it/liuren`, `/it/qizheng`, `/it/ziwei`, `/it/taiyi` — and so is the endpoint
under it. The consultation is the one section with no art of its own, because
it takes any of them: it answers at `/it`, the root of a language, and
`/it/consult` and `/consult` are the word for it rather than a second address.

**A consultation is an act rather than an address.** The board is cast at the
instant it is asked for and holds somebody's question, and neither is in the
URL — reloading finds the fields ready, not the answer preserved. An address
that does not say *when* means now, and now is a different answer every hour:
those are `no-store`, and only an address that fixes the instant is cacheable.

**A place is a `locationId` from the search, or a `latitude` and a `longitude`
with a `timezone`, or an identifier refined by a pair of coordinates.** The
third exists because the search knows the town and not the hamlet three
valleys up, and the longitude is what the correction to true solar time is
made of: the coordinates replace the ones GeoNames holds, and the zone stays
the named place's. Only what *departs* from the chosen place is written into
the address, so the plainest question keeps the plainest address; where
something did depart, the answer says both halves — `Rome, Lazio, Italy ·
41.8919, 13.5113` — because a sheet reading «Rome» over a board laid fifty
kilometres off says something untrue.

In this engine it is the longitude that moves a board. The latitude is carried
and printed and enters no calculation.

**Choosing a time is the other question.** A board asks what stands *now*;
`/it/moments` asks *when, in a stretch of days, does a thing stand — and which
way is it*. The direction is half of the answer, not decoration. Each row
links back to the whole board for its hour, and the hours worth comparing ride
in the address as a shortlist, so they survive a re-run and can be sent to
somebody as a link.

**And there is a printer.** A stylesheet for paper redraws the board in paper
colours whichever appearance is on screen, drops the fields and the switches,
and sets the nine palaces to a width that fits a sheet.

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

Different schools produce different charts from identical input, so every
divergence is a parameter with a declared default, present in the input type
from the first release. The Qi Men chart's, in brief:

| | | default |
|---|---|---|
| `method` | 拆補 / 置閏 / 茅山 | `chaibu` |
| `yuan` | under 拆補, the third of the term counted from the term or from the day's 符頭 | `term` |
| `plate` | 轉盤 / 飛盤 | `zhuan` |
| `centreLodging` | the centre lodges in 坤, or in 坤 by yang dun and 艮 by yin | `kun` |
| `trueSolarTime` | correct clock time to the Sun | `true` |
| `yearBoundary` | 立春 or 正月初一 | `lichun` |
| `dayBoundary` | the day pillar turns at 23:00 or at midnight | `zishi` |
| `system` | which family of chart: 時家, or the day's, month's or year's | `shijia` |

Each other board keeps its own, because each is a board and not a view of the
first: a saved one has to reproduce on its own terms. The full table, every
board, is [`docs/parameters.md`](docs/parameters.md).

Two of these are worth knowing before reading any chart from here.

**`chaibu` and `zhirun` are different schools, not approximations of one
another.** Under 拆補 each term splits into three five-day thirds from the
instant it begins; under 置閏 the yuan follows the day's 符頭 through whole
fifteen-day blocks and the drift is paid off with an intercalated 芒種 or 大雪.
Around a term's edges the two disagree about which term the ju belongs to, and
occasionally about the dun itself. A zhirun chart names the term its ju was
taken from.

**`yuan` is a divergence inside 拆補, and it moves the ju on most days.**
`term` counts the three fives from the instant the term began; `futou` reads
them off the days instead. Both are held by schools that name themselves 拆補.

An unimplemented value raises `METHOD_NOT_IMPLEMENTED` or
`OPTION_NOT_IMPLEMENTED` rather than being silently substituted, because a
chart cast by the wrong method looks right and is not. A chart carries the
options that produced it, so a saved one reproduces identically.

## How sure the numbers are

Not uniformly, and the difference is worth stating. The solar terms are
published astronomy, checked against an almanac over 1 926 dates; the Qi Men
layout is consistent with two independent implementations of a contested
tradition, checked over 160 charts and over 266; the configurations come from
Chinese-language sources with no runnable reference at all; the 太乙 board is
checked against the text that states it and against nothing that runs.

**[`docs/sources.md`](docs/sources.md) holds the whole register**: every source
by name, what each was checked against, the licences, and — where two sources
disagreed — which was followed and why. It is the document to read before
trusting any single number, and the one to add to before shipping a new one.

Working from memory was tried and abandoned: recalled almanac values were
wrong more often than not, and the tests only became trustworthy once every
anchor had survived an independent check.

## The four kinds of string

English and Italian, English by default. But there are four kinds of string
here, not two:

| | example | where it lives |
|---|---|---|
| identifier | `xiumen`, `tianpeng` | the engine, toneless pinyin, never translated |
| hanzi | 休門, 天蓬 | the engine — **domain data, not a locale** |
| pinyin | xiūmén, tiānpéng | the engine — the same, said aloud |
| gloss | "Rest" / "Riposo" | the catalog, keyed by identifier |

The middle two are the ones usually got wrong. 休門 is not the Chinese
rendering of "Rest Gate": it is the name of the gate, and an Italian reader
wants to see it as much as a Chinese one does. And a glyph alone is, to
someone who does not read Chinese, a shape with no sound — it cannot be
pronounced, looked up, or asked about out loud. `xiūmén` is what carries the
name out of the screen, and it is a property of the name rather than of a
language: 休門 is xiūmén on `/it` and on `/en` alike.

A consequence worth having: the drawing is almost entirely
locale-independent, because the palaces carry hanzi. Only its captions, the
eight directions around its frame and the two bands under it are text in a
language — a band of glosses, since 吉 alone in a palace would be a name with
no gloss, and a band where every name on the board is said aloud, since the
picture is the half of this that travels and has no table beside it.

More: [`docs/i18n.md`](docs/i18n.md).

## The documents

| | |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | the rules that bind any change, one line each |
| [`docs/`](docs/README.md) | the project as it is now: architecture, parameters, sources, refusals, readings, i18n |
| [`docs/history/`](docs/history/README.md) | how it got here, phase by phase, including the mistakes. Never normative |
| [`ROADMAP.md`](ROADMAP.md) | what is not built yet |

A feature crosses several surfaces and has a procedure of its own: see
`.claude/skills/new-feature`.
