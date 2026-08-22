# How it went

**These files say how this project got here. They do not say what it is
now.**

A phase is written when it is planned and revised while it runs; it is
**never rewritten afterwards to match the present**. Phase 13 still calls
六壬 planned, phase 12 describes an address that has since moved, and phase 3
lists modules that were split later. That is not rot to be repaired — it is
what makes the record worth keeping. A decision that was reversed is only
legible beside the reasoning that produced it.

So: **nothing here is normative.** For what holds today,

| For | Read |
|---|---|
| the rules that bind any change | `CLAUDE.md` |
| what the packages are and how they depend | `docs/architecture.md` |
| the school parameters and their defaults | `docs/parameters.md` |
| where every number comes from | `docs/sources.md` |
| what is deliberately not computed | `docs/refusals.md` |
| what happens when a board reaches a model | `docs/readings.md` |
| what crosses the language boundary | `docs/i18n.md` |
| what an agent calling this has to know | `docs/agent-prompt.md` |
| what is not built yet | `ROADMAP.md` |

When a decision changes, **change `docs/`, and let the new phase say that it
revises the old one** — as phase 18 says of phase 14. Do not edit the old
phase.

## The phases

| | | |
|---|---|---|
| 0 | [Scaffolding](00-scaffolding.md) | done |
| 1 | [The calendrical layer](01-calendrical-layer.md) | done — the pivot, and where the risk was |
| 2 | [Four Pillars](02-four-pillars.md) | done — the test bench for phase 1 |
| 3 | [The Qi Men chart](03-qimen-chart.md) | done |
| 4 | [Command line](04-command-line.md) | done |
| 5 | [The drawing](05-drawing.md) | done — and why `plate` imports nothing |
| 6 | [The surfaces, together](06-surfaces-together.md) | done — REST, web, MCP |
| 7 | [Distribution and documentation](07-distribution.md) | done |
| 8 | [Choosing a time](08-choosing-a-time.md) | done — 擇時擇方, and «the palace is the answer, not the run» |
| 9 | [Reading the palace, not just laying it out](09-reading-the-palace.md) | done — 門宮, 星宮, and where the sources stop |
| 10 | [The chart, handed to something that will read it](10-handing-the-chart-over.md) | done — the origin of the prompt discipline |
| 11 | [The readings under the board](11-readings-under-the-board.md) | done — a name carries its reading |
| 12 | [The consultation takes the lead, and the chart goes to paper](12-consultation-takes-the-lead.md) | done — `/[lang]` becomes the consultation |
| — | [The scope widens, and the standard does not move](scope-widens.md) | the argument admitting boards that are not dunjia |
| 13 | [The second board](13-liuren.md) | done, though the text still says planned — 大六壬 |
| 14 | [The consultation takes a second instrument](14-consultation-second-instrument.md) | done — one board to a prompt, never two |
| 15 | [The almanac layer](15-almanac-layer.md) | done — 曆注, beside a chart and not inside one |
| 16 | [七政四餘](16-qizheng.md) | done — the 宿 frame taken from the 距星 |
| 17 | [The notes: the organisation now, the contents last](17-notes.md) | done — the organisation, and the argument for deferring the contents. Revised by phase 27 |
| 18 | [The consultation takes every instrument](18-consultation-every-instrument.md) | done — revises phase 14 |
| 19 | [The reading takes the person](19-reading-takes-the-person.md) | done — the 命 prompt |
| 20 | [太乙神數, and the reading that gated it](20-taiyi.md) | done — the board shipped, the reading was withheld |
| 21 | [The consultation takes the board of a year](21-consultation-taiyi.md) | done — what phase 20 withheld, designed |
| 22 | [A place said in degrees](22-place-in-degrees.md) | done — a place refined by coordinates |
| 23 | [紫微斗數, the third board of 命](23-ziwei.md) | done — 《全書》's fourteen 正曜, and not the other book's eighteen |
| 24 | [The sections say the names they are](24-section-names.md) | done — `/chart` becomes `/qimen` |
| 25 | [The project takes its name](25-the-project-takes-its-name.md) | done — the project is shipan 式盤 |
| 26 | [The frame a caller reads first](26-the-frame-a-caller-reads.md) | done — supersedes phase 25's last section |
| 27 | [The notes get built](27-notes-built.md) | done — revises phase 17: the registries it assumed did not exist, and the ladder moves into `docs/` |

## The rest of the record

| | |
|---|---|
| [`risks.md`](risks.md) | the risk register as it stood, worst first. The evidence in item 1 has since been superseded by `docs/sources.md`, which carries it per quantity |
| [`order.md`](order.md) | why the phases were sequenced as they were. Entirely retrospective except for what it says about phase 17 |
