# Phase 5 — The drawing

`packages/plate`: a three-by-three grid, each palace layered (spirit, star,
gate, heavenly stem, earthly branch, trigram and number). Pure SVG; PNG behind a
separate entry point `@qimendunjia/plate/png` via `@resvg/resvg-js`, because it
pulls a native module that must never reach the browser.

As in the reference, it **does not import from `core`, not even types**: it
redeclares them in `types.ts` and a test asserts the two agree. This breaks the
cycle with the CLI, which lives in `core` and draws.

Locale reaches it only for captions and legend — the palaces carry hanzi.

> Commits: `Draws the chart across the nine palaces` · `Renders the drawing as PNG`

**Done.** `packages/plate`: `geometry.ts`, `palette.ts`, `svg.ts`, and PNG
behind `@qimendunjia/plate/png`.

It keeps the rule it exists for — it redeclares the shape of a chart instead
of importing it, so a drawing can never reach back into a calculation — and
`test/types.test.ts` guards the copy against drift, at compile time by
assigning a real `QimenChart` to the redeclared type without a cast, and at
run time by reading every field the drawing uses.

Four things worth keeping:

- **South is at the top.** A Qi Men chart is drawn the way a Chinese map is.
  Turning it the European way round would make it unreadable to anyone who
  knows the subject, so the written order is a tested constant.
- **The drawing is locale-independent, and a test asserts it.** With no
  captions the SVG contains no word in any language — only hanzi, digits and
  markup. Captions come in already translated; the package has no catalog.
- **`auto` carries both schemes.** An SVG dropped into a page nobody controls
  has to survive the night, so the default emits light values plus a
  `prefers-color-scheme` block. A PNG cannot ask, so it has no `auto`.
- **resvg does not resolve `var()`.** Handed the stylesheet unchanged it
  rasterises every fill as missing — a blank grid that looks like a drawing
  rather than like an error. `png.ts` substitutes the values first, and the
  test covers it.

**The band of configurations came later**, with `Pattern.valence`, and it
answers two things the palaces could not.

- **A palace has room for a name and nothing else.** Its foot is one shrunk
  line shared by every configuration that fell there. A fortune needs a word
  beside the glyph — 吉 set alone is a name with no gloss, which is the one
  thing not done to a reader who does not read Chinese — and the word does not
  fit. Colour was the other way out and is worse: a palace *is* a direction,
  and three palaces tinted red say «do not face these ways» before a single
  character is read, which is a reading delivered without words.
- **伏吟 and 反吟 were not in the drawing at all.** They belong to the whole
  board and have no palace to be marked in, so `markedPalaces` skipped them
  and a test asserted their absence. The picture is the thing that travels
  furthest, and it was silent about the two configurations that describe the
  whole of it.

The band costs the grid **what it carries and no more**: `Around.configurations`
is a count of lines, not a flag, so a chart that fell into two configurations
does not pay for one that fell into six. The honest figure at 900px with a
compass and captions: two entries take about a tenth off the side of a palace,
four take about a sixth. It is asked for by giving it a heading, as the compass
is asked for by giving it words, and the entries are gathered before the layout
is settled rather than after — which is the whole reason `renderChartSvg` now
groups the configurations up front.

Grouped by name, and in the engine's order. 空亡 in two palaces is one entry
naming both, because two entries would read as two things having happened; and
nothing is sorted by fortune, there or anywhere else, because that ordering is
exactly the ranking the project refuses to produce.
