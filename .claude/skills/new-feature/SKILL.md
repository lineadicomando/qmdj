---
name: new-feature
description: Use when ADDING or EXTENDING a calculation in shipan that has to reach users or agents — a new computation in core, a new /api endpoint, a new MCP tool, a new section of the interface, a new CLI option, a new pattern in dunjia. Lists the surfaces to cross (core, i18n, CLI, plate, web, MCP, README, agent-prompt) and the order to work through them in. Triggers: new calculation, new endpoint, new MCP tool, new section, expose to agents, new CLI option, new pattern.
---

# Adding a feature to shipan

There is one engine and **six surfaces** that tell it. A feature that stops
halfway leaves a README describing five endpoints when there are six, or an
MCP tool no prompt knows it can call. The work is not done until every
pertinent surface agrees.

## The surfaces

```
packages/core/src/<feature>.ts        the calculation
  ├── types.ts                        the options, if a school diverges
  ├── index.ts                        the public export
  ├── format.ts                       the dense rendering, for the CLI and for agents
  ├── cli.ts                          the option or subcommand
  └── test/<feature>.test.ts          obligatory

packages/i18n/src/catalogs/en.ts      the keys — and `it.ts`, which will not
                                      compile until it has them too

packages/plate/                       only if the drawing must show it;
                                      remember it redeclares its own types

apps/web/
  ├── src/routes/api/<...>/+server.ts endpoint, GET
  ├── src/lib/server/params.ts        parameter reading, already shared
  ├── src/lib/components/<Xxx>.svelte
  └── src/routes/[lang]/<...>         if it is a new page

packages/mcp/src/tools.ts             registerXxx(server, context)
packages/mcp/src/server.ts            the registration
packages/mcp/test/server.test.ts      obligatory

README.md                             the description and the tables
docs/sources.md                       where the number comes from — never skip
docs/parameters.md                    if a school diverges
docs/refusals.md                      if something is deliberately left out
docs/readings.md                      if it reaches a prompt
docs/agent-prompt.md                  the contract agents actually read
docs/history/<n>-<slug>.md            what was learned, especially if wrong
CLAUDE.md                             only if a new rule binds every change
```

**`docs/` is the present tense and `docs/history/` is the past.** State the
rule in the page that owns it and write the record in a new phase file; never
edit an old phase to match what the code does now. `CLAUDE.md` gets a line and
a pointer, not the argument — and only if the rule really does bind every
change.

## Procedure

1. **The calculation, in `core`.** A pure function; no notion of HTTP or MCP.
   Options in `types.ts`, export from `index.ts`, a `formatXxx` in `format.ts`
   if it is meant for agents too. Tests with expected values, never snapshots.
2. **The catalog**, immediately after. `en.ts` first, then `it.ts` — which
   will not compile until it matches, which is the point.
3. **The CLI**, if it makes sense from a terminal: the cheapest way to try it
   before the other surfaces exist.
4. **The surfaces**, together: endpoint, interface, MCP tool. Reuse
   `lib/server/params.ts` instead of rewriting the validation, and let the
   Svelte tables take the rows, not the chart.
5. **The documentation**, last and never omitted. `docs/sources.md` first —
   a quantity without an entry there is a quantity nobody can weigh.
6. `npm test && npm run typecheck`. If the feature added an endpoint, a tool,
   a section or a command, `docs.test.ts` will fail until the count stated in
   `docs/architecture.md` is corrected. That is what it is for.

## The commit

**One, for the whole feature.** The history up to the readings under the board
splits a feature one stage at a time — core, then the surfaces, then the
documentation — and that layering is over: see `CLAUDE.md` § Style for why it
was worth having and why it no longer is. The order of the procedure above is
still the order to *work* in, because a surface built before the calculation
is a surface built against a guess. It is no longer the order to commit in.

English, third person present, no conventional prefix. The subject says what
the feature does; the body takes a paragraph per surface it crossed, which is
what the separate subjects used to carry:

```
Recognises the configurations of the chart

Names them in both catalogs, ...
Shows them in the interface and hands them to agents ...
Opens them over HTTP and says so in the README ...
```

## Rules that bite harder here than elsewhere

- **A board that lands makes every comment that counts boards wrong.** The
  comments here argue, and an argument that rests on «there are five boards»
  stops holding the day there are six — `prompt.ts` opened that way for a
  whole phase. Nothing can test this, so it is a step: grep the source for
  `boards`, `instruments`, `of 卜`, `of 命` and the number words beside them,
  and fix the ones the new board moved. Same for the counts in
  `docs/architecture.md`, which `docs.test.ts` *does* hold you to.
- **Verify against an independent implementation, not against memory.** This
  is the lesson of phases 1 to 3, learned the hard way more than once. A
  recalled almanac value has been wrong more often than right.
- **Say how sure you are.** Three tiers: published astronomical fact, one
  open implementation, a web source. Never let the third be read as the first.
- **No school is implicit.** If sources disagree, it is a parameter with a
  declared default — or, if they are too thin to choose from, it is left out
  and said to be left out. `三奇得使` is the precedent.
- **Never substitute a method quietly.** `METHOD_NOT_IMPLEMENTED` exists
  because a chart cast by the wrong method looks right and is not.
- **Nothing interprets.** Names of configurations, never verdicts. There is a
  test that greps the output for words like "auspicious"; keep it passing.
- **Hanzi are not a locale.** They travel in the engine's output always; the
  catalog supplies only the gloss beside them.
- **`packages/plate` imports nothing from `core`.** If the drawing needs a new
  field, add it to plate's own `types.ts` and let `test/types.test.ts` prove
  the two still agree.
- **A chart is `private` in a cache, never `public`.** Its URL holds somebody's
  date, time and place of birth.
