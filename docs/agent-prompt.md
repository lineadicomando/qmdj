# What an agent needs to know

The contract for a model using this project, whether through the MCP server or
through the REST API. It is the document to read before writing a prompt that
calls any of it.

## The one rule

**The engine reports arrangements, and the names and fortunes the tradition
attaches to them. It answers no question, and neither does anything else in
this repository.**

It will tell you that 休門 stands over the palace of Li, that the gate's phase
controls the palace's, that the configuration is called 門迫, and that 門迫 is
transmitted as 凶. That last is a property of the configuration — 迫 *means*
oppression, and the sources name and weigh it in one breath — not a verdict
the server reached about the hour, the chart, or the person.

Two mistakes follow from confusing the two, and both are yours to avoid:

- **Do not sum the fortunes.** Counting 吉 against 凶 and calling the result a
  score for the hour is an arithmetic the tradition does not have and the
  output does not license. There is no ranking here, and you must not build
  one and attribute it to the software.
- **Do not read a fortune as advice.** A palace marked 凶 is not "avoid this
  time". Which palace even bears on the question is the 用神, chosen by the
  reader for the question asked; the server does not choose it and does not
  know the question.

If the person asked for a reading, the reading is yours — and so is the
responsibility for it. Do not present one as though the software had produced
it.

## The four ways to be plausibly wrong

Each of these produces an answer that looks correct and is not, and none of
them can be caught downstream. The first three are things you would pass to a
tool; the fourth is something you would do with what came back, and it is the
one nobody thinks to guard.

### Inventing a place

There are dozens of places called Rome, and they sit in different timezones.
Guessing coordinates or a zone moves the hour pillar, and with it a quarter of
the chart.

Call `search_location` (or `GET /api/locations`), show the candidates, and let
the person choose. Then pass `location_id`. Never pass coordinates you did not
receive from somewhere.

### Inventing the current date

You do not know today's date. The server does.

For the present moment **omit `date` and `time` entirely**. Do not fill them
from your own sense of when "now" is.

### Inventing a birth time

An unknown birth time is not a reason to pick noon. It changes the hour pillar
outright and, near midnight, the day pillar too.

Ask. If the person does not know, say what that costs rather than choosing.

### Inventing what the question is about

Questions arrive short. *Will it go well* names no undertaking, no other
party, no place and no horizon, and a 用神 cannot be chosen from it — so
whatever palace you read is the one the sentence happened to suggest, and the
reading rests on it entirely. Nothing in the answer records that you picked
it, which is what makes this the hardest of the four to catch: the reading
looks exactly as confident as one made for a question somebody actually asked.

Ask instead. What the matter is really about, whom it concerns and whether
that is the person asking, whether it is already under way, whether a place or
a direction is part of it, by when they need to know. One or two of those —
whichever would change which palace you read — and not a questionnaire.

Two bounds on the asking. Nothing missing from the chart can be got this way:
no answer moves a palace, and a conversation is not a reason to recompute
anything. And if the person cannot say or would rather not, read what can be
read and name what you are missing, rather than filling it in.

## What to pass, and in what form

- **Dates are ISO**, `YYYY-MM-DD`, in every language. The format never follows
  the locale, because an address must mean one thing everywhere.
- **Times are local clock time**, exactly as they were read on a clock at the
  place — as written on the birth record. The conversion to Universal Time
  happens inside, with the historical rules of the zone. **Do not convert it
  yourself.** Those rules include China's five zones before 1949, its wartime
  clocks of 1942–45 and its summer time of 1986–91, none of which you should
  be applying by hand.
- **`lang`** changes the readable glosses and nothing else. The hanzi, the
  identifiers and the numbers are the same in every language: 休門 is the name
  of the gate, not its Chinese translation.

## What the answers do not contain

- **A drawing carries no warnings.** `draw_qimen_chart` and
  `/api/chart/plate` return a picture with the glyphs and the note that it is
  not a reading. It does not carry the note about an ambiguous local hour, or
  about the method. Call the drawing **after** the calculation and show both,
  or show the data alone.
- **Two methods are implemented, and they are different schools.** Charts are
  cast by 拆補 unless `method` chooses 置閏, whose ju follows the day's 符頭
  and can belong to a term the Sun has not reached yet — the answer says
  which. Never switch method between charts you are comparing, and never
  present one method's chart as the other's. 茅山 is refused with
  `METHOD_NOT_IMPLEMENTED` rather than silently substituted, because a chart
  cast by the wrong method looks right and is not; if someone asks for it,
  say it is not available.
- **三奇得使 is not computed.** The sources consulted do not agree on which
  pairings count. Its absence is deliberate; do not fill the gap yourself.
- **No table says which gate suits which undertaking.** The transmitted
  mapping — the open gate for negotiation, the life gate for money — varies by
  school, and the engine takes no position on it. `scan_moments` therefore
  takes the arrangement you are looking for, never the errand. If you supply a
  mapping yourself, say plainly that it is yours and not the server's.
- **A scan ranks nothing.** There is no score in the answer and no order but
  time. A palace answering your question is a fact; a palace being a good
  place to be is a reading.

## How sure the numbers are

Not uniformly, and the difference matters when you are asked to justify one.

- **Solar terms, lunar calendar, four pillars** — checked against published
  astronomical tables through an independent implementation, over 1 926 dates
  from 1902 to 2098, agreeing on every one. These are as solid as the
  ephemerides.
- **The Qi Men layout** — checked against one open implementation over 160
  charts, agreeing on every quantity compared. That means *consistent with a
  common implementation*, not *verified*: no authority publishes Qi Men charts
  the way an observatory publishes solstices.
- **The configurations** (門迫, 擊刑, 入墓, 伏吟, 反吟, 五不遇時 …) — from
  Chinese-language sources, with each rule tested against the transmitted list
  it should reproduce. There is no runnable reference at all.

If you are asked how the software knows something, say which of these three it
is. Do not describe the third as though it were the first.

## The tools, in the order they are usually needed

| | |
|---|---|
| `search_location` | a name → candidates with coordinates and zone. Always first when you have a name |
| `compute_qimen_chart` | the nine palaces, the plates, the configurations, how each star and gate stands to its palace, and both post horses — 日馬 and 時馬, never one of the two |
| `compute_bazi` | the four pillars, read out. `gender` only affects the luck cycles |
| `draw_qimen_chart` | the picture, framed by the eight directions, with the configurations and their fortunes listed under the grid. After the calculation, never instead of it |
| `solar_terms` | the twenty-four terms of a year, with exact instants |
| `lunar_date` | the lunisolar date. Reckoned on 120°E by convention, not on the zone you pass |
| `scan_moments` | every chart over an interval, narrowed to what you name. For **choosing** a time rather than reading one |

Reference material — the nine palaces, the gates and stars and spirits, the
terms — is available as MCP resources. Read it when you have to explain or
justify a name, not when you are merely reporting one.

## The REST equivalent

Every tool has an endpoint, and both read the same query string, so a chart is
a shareable address.

```
GET /api/locations?q=Beijing&lang=en
GET /api/locations?id=1816670&lang=en          # the way back from an address
GET /api/chart?date=2024-06-15&time=14:00&locationId=1816670
GET /api/bazi?date=1968-03-12&time=14:30&locationId=3169070&gender=male
GET /api/terms?year=2024&timezone=Asia/Shanghai
GET /api/chart/plate?date=2024-06-15&time=14:00&locationId=1816670
GET /api/moments?from=2026-09-01&to=2026-09-08&locationId=3169070&gate=kaimen&towards=se,s
GET /api/chart/text?date=2024-06-15&time=14:00&locationId=1816670
GET /api/chart/prompt?date=2024-06-15&time=14:00&locationId=1816670&asked=true
```

The last two answer `text/plain` rather than JSON. `text` is the chart said in
words, exactly as the CLI prints it. `prompt` is that chart wrapped in this
document, condensed and addressed to a model with no connection to any of
this — what the interface copies to a clipboard for somebody to paste
elsewhere. **You do not need either of them**: you are holding the data, and
you have read this. They exist for the model that is not.

`asked` is a yes or a no and never the question itself. With it the answer
ends on the line that introduces a question, for the caller to append; without
it the prompt says plainly that none was asked. A question is somebody's own,
and one in a query string is one written into every log along the way.

`frame=natal` asks for the other reading: a chart cast for a birth and read as
a chart of a life. It takes no question — the two do not overlap — and the
prompt it returns names that application as modern, minority and
school-divergent, and refuses to say which palace stands for which part of a
life. **If you are asked for a natal reading, that refusal is yours to keep
too.** The mapping is not in the engine, it is not in the resources, and
supplying one from memory would be attributing to this software a doctrine it
declines to hold — for the same reason 三奇得使 is absent.

Failures come back with a `code`, a `messageKey` and `params` rather than a
sentence to parse:

```json
{
  "code": "INVALID_DATE",
  "messageKey": "core.error.INVALID_DATE",
  "params": { "date": "15/06/2024" },
  "message": "Date \"15/06/2024\" is not valid: expected the format YYYY-MM-DD."
}
```
