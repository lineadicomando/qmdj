---
name: new-feature
description: Use when ADDING or EXTENDING a calculation in qimendunjia that has to reach users or agents — a new computation in core, a new /api endpoint, a new MCP tool, a new section of the interface, a new CLI option, a new pattern in dunjia. Lists the surfaces to cross (core, i18n, CLI, plate, web, MCP, README, agent-prompt) and how to split them into commits. Triggers: new calculation, new endpoint, new MCP tool, new section, expose to agents, new CLI option, new pattern.
---

# Adding a feature to qimendunjia

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
docs/agent-prompt.md                  the contract agents actually read
PLAN.md                               what was learned, especially if wrong
```

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
5. **The documentation**, last and never omitted.
6. `npm test && npm run typecheck`.

## The commits

One per stage, in the order the repo has always had them:

```
Recognises the configurations of the chart          → core + i18n + test
Shows the configurations in the interface and to agents → web + mcp
Documents the configurations and opens them over HTTP   → README + docs
```

English, third person present, no conventional prefix.

## Rules that bite harder here than elsewhere

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
