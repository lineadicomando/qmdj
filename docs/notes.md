# What this project claims, and how the claim is kept honest

There is a section of the interface whose reader did not come to cast anything.
They came to check: to find out what is computed here, what each number stands
on, and what is deliberately absent. This page is what that section is built
out of — the ladder a quantity is weighed on, the line between what is derived
and what is written, and the one thing a written entry must always show.

It binds whether or not the section is built. `docs/sources.tsv` already
carries a `rung` for every quantity, and a column of numbers whose meaning
lived in a phase file would be a column nobody could read: `docs/history/` is
never normative, so what a rung *means* has to be here.

## The ladder of evidence

Not everything checked was checked against something equally good, and a
register that records what each quantity stands on still leaves a reader
unable to weigh one against another. These are the rungs, **strongest first**.

| | | |
|---|---|---|
| **0** | **Measured, not transmitted.** An ephemeris answer: the sky is asked and the answer is read off | the solar terms, the lunar date, the places of the seven governors |
| **1** | **A runnable independent reference**, run over the domain rather than sampled | the pillars against `lunar-javascript` over two centuries |
| **2** | **Two transmitted sources agreeing**, which is the standard `docs/sources.md` § "The standard, stated once" states | the eleven pairings of 十干克應; what each of the eight gates is chosen for |
| **3** | **Over-determination** — a structure with more constraints than it has freedom, so a wrong answer breaks many things at once and the right one breaks none | the 宿 frame; the direction the twelve 人事宮 are counted in |
| **4** | **A single text that checks itself** — one witness, exhaustive or redundant about the thing in question | 返吟; 太乙's 立成 of 864 cells; each 德 confirmed by its own 五合 |
| **5** | **A single text with no check available** | 年命; the 年神 bearings; 太乙's 大將 and 參將 |
| **—** | **Nothing registered.** The engine carries the quantity and no source stands behind it | the five phases of the 十二天將, which is why the drawing leaves them uncoloured |

**Rung 0 is this page's addition to the five, and the five are unchanged.**
The ladder as first drawn ordered the evidence for a *rule handed down*, and
every example on it was one. A quantity read off the sky is not on that ladder
at all: filed under rung 1 it would claim a second implementation that may not
exist, and filed at the bottom it would be described as «one source, nothing
to check it against» — true of the check and false of the fact. Zero says what
it is, and it sits above rung 1 because the ladder descends.

**A rung is the strongest check actually run**, not the best that could be
imagined and not the weakest that also applies. Where two rungs could be
argued for the *same* check, the register takes the weaker: 四德 is rung 4 for
the 合 partner that confirms it exactly, and not rung 1 for a comparison that
leaves an unexplained residue on 0.7 % of the days.

**A rung is the reading of today's evidence and not a property of the
quantity.** It moves when the shelf does, in either direction, and
`docs/sources.md` § "When a source arrives later" says what moves with it: a
source that only confirms is the difference between rung 5 and rung 2, and one
that contradicts turns a settled answer into a divergence rather than into an
error.

**And a rung is not a verdict.** 觜宿一's place is 50.5″ from the Qing
catalogue's, which is over-determined evidence and rung 3, and the top rung
would not have made it righter — the frame is asked for degrees and the worst
residual is a seventieth of the narrowest question it ever answers. Rung 0 is
not a boast either: it says the sky was asked, and asking the sky is what an
ephemeris is for. What the ladder orders is **what could go wrong unnoticed**,
which is a different thing from how wrong anything is.

**What the rung does not carry is what agreement means.** A runnable reference
for a contested tradition is one author's reading of it: agreeing with
`qimen-dunjia` is *consistent with a common implementation*, never *verified*,
and `docs/sources.md` § "The three tiers" is where that distinction lives. The
register's `checked_against` column says what was run and how far, so that a
reader who wants the difference has it in the row; the argument is in the
section the row's last column names.

## The register

`docs/sources.tsv` — one row a quantity, six columns, tab-separated, sitting
beside `docs/provenance.tsv` and readable the same way.

| | |
|---|---|
| `board` | which layer it belongs to: a board, `pillars` for the calendrical layer under all of them, `almanac`, `nianming` |
| `quantity` | the thing computed, as a reader would ask for it |
| `rung` | one of the values above |
| `stands_on` | what the engine derives it from, or the text that states the rule |
| `checked_against` | what it was actually measured against, and how far — counts, spans, percentages |
| `section` | the heading in `docs/sources.md` where the whole argument is written out |

**The register does not replace `docs/sources.md` and cannot.** That file is
where a claim is argued, quoted and dated; this is an index over it that can
be sorted, counted and printed. The `section` column is the join, and
`apps/web/test/docs.test.ts` asserts every one of them is a heading that
exists — a row pointing at an argument that has been renamed is a row a reader
cannot follow.

**A quantity added without a row is a quantity nobody can weigh.** That is
`CLAUDE.md`'s standing rule about the register, and it now has two halves: the
entry in `docs/sources.md`, which is the argument, and the row here, which is
what a surface can read.

## Derived beats written

What changes when a board lands must not be written at all.

The list of boards, their parameters, the defaults, the schools those values
name, the counts, the spans the pillars were checked over, the references the
layout was compared against — all of that is data the engine already declares,
and a page that says it should read it. `packages/core/src/parameters.ts` is
that declaration for the school divergences; this register is that declaration
for the evidence.

**When a new board makes somebody want to hand-write a paragraph, that is the
signal that a descriptor is missing a field**, and the fix is upstream of the
page and never on it.

What stays written is what does not move when a board lands: the standard, the
refusals, the shape of an argument, the discipline of a reading. That half is
kept small deliberately — everything derived is identifiers, hanzi, pinyin and
numbers out of the engine, with the catalog supplying only glosses it already
owns, and everything written doubles with every language. See
[`i18n.md`](i18n.md) § "Who is reading": a gloss beside a name costs a new
language one line, and a paragraph of argument costs it a translator who has
to follow the argument.

## Every written entry shows the date it was last checked

Shown to the reader, not recorded in a comment.

A note lags because somebody has to remember to change it, and the reader who
opens this section is the one person here who came to check rather than to
read — which is exactly the reader a stale paragraph misinforms. That is not
answered by a resolution to be careful. It is answered by making the staleness
legible to the one reader equipped to discount it, who is the same reader it
would otherwise mislead.

A date beside a paragraph makes the paragraph a weaker claim. Weaker is what
it should be.
