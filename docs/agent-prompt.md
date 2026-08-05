# What an agent needs to know

The contract for a model using this project, whether through the MCP server or
through the REST API. It is the document to read before writing a prompt that
calls any of it.

## The one rule

**The engine reports arrangements and relations. It does not interpret, and
neither does anything in this repository.**

It will tell you that 休門 stands over the palace of Li, that the gate's phase
controls the palace's, and that the configuration is called 門迫. It will not
tell you whether that is good news. If the person asked for a reading, the
reading is yours — and so is the responsibility for it. Do not present one as
though the software had produced it.

## The three ways to be plausibly wrong

Each of these produces an answer that looks correct and is not, and none of
them can be caught downstream.

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
- **Only one method is implemented.** Charts are cast by 拆補; 置閏 and 茅山
  are refused with `METHOD_NOT_IMPLEMENTED` rather than silently substituted,
  because a chart cast by the wrong method looks right and is not. If someone
  asks for one of those, say it is not available.
- **三奇得使 is not computed.** The sources consulted do not agree on which
  pairings count. Its absence is deliberate; do not fill the gap yourself.

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
| `compute_qimen_chart` | the nine palaces, the plates, the configurations |
| `compute_bazi` | the four pillars, read out. `gender` only affects the luck cycles |
| `draw_qimen_chart` | the picture. After the calculation, never instead of it |
| `solar_terms` | the twenty-four terms of a year, with exact instants |
| `lunar_date` | the lunisolar date. Reckoned on 120°E by convention, not on the zone you pass |

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
```

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
