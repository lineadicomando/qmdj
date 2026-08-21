# Phase 6 — The surfaces, together

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
