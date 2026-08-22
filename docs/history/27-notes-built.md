# Phase 27 — The notes get built, and the registries they needed get written

**Revises phase 17.** That phase settled the section's *organisation* and
deferred its contents, which was right, and it left two things that turned out
to be wrong in the same way: it said the derived pages «read a registry and a
register, both of which exist», and it put the ladder of evidence in a phase
file. Neither held. Nothing in `docs/history/` is normative, so a column of
numbers whose meaning lived here was a column nobody could read; and the
registry did not exist as data at all.

## What was actually there when this phase opened

Phase 17's sentence was written in good faith and was false in two halves.

**The parameters were not a registry.** Which values a school parameter can
take was in prose in `docs/parameters.md`; the defaults were in six frozen
constants; which of them the engine computes was spelled out at sixteen
`throw` sites, again in that page, again in the list a web form may offer,
again in the words after a CLI flag, and again in the enum an agent is handed.
Five copies of one fact, and the only one a compiler could see was the literal
inside a throw. The page had already drifted by a whole board: 紫微斗數's five
divergences arrived with the sixth board and never reached it, and 年命's
`count` had never been on it.

**The register was not interrogable.** `docs/sources.md` is the argument, at
whatever length each argument takes, and there is no way to sort two thousand
eight hundred lines of prose or to count what rests on what.

So most of this phase was not the pages. It was making the two things the
pages were supposed to read.

## The parameters, declared once

`packages/core/src/parameters.ts` holds every divergence as data — its values,
which of them the engine computes, its default, and the error code its refusal
carries. The sets are mapped over their own options types, so an option added
to an interface without an entry does not compile.

The refusals read it. That is the half that matters: a `false` turned `true`
without the code behind it now fails a board's own tests rather than answering
with the wrong chart.

**Three parameters were substituting silently.** An unrecognised `yuan` fell
through to the term's reading and cast a chart nobody asked for; an
unrecognised `luohou` seated 羅睺 at the descending node; an unrecognised
`guiren` reached a missing table row and a TypeError. The rule said refuse and
the code did not, at three places nobody had looked at because each was a
default that happened to be right.

**A value carries its name and its reading.** This was got wrong first: the
argument made here was that an option value is named by its identifier, which
is already the toneless reading — and it is not. `xieji` is 協紀辨方書 and says
two of five syllables; `quanshu` is 紫微斗數全書 and says two of six; `zhuan`
is 轉盤 and says one of two. The rule this project already had was the right
one and the exception invented for it was wrong. `pinyin.test.ts` now gathers
these with the gates and the stars.

## The ladder moves into `docs/`, and gains a rung

`docs/notes.md` states it, because `docs/sources.tsv` carries a `rung` for
every quantity and the meaning of that column cannot live in a file that binds
nobody.

Three things phase 17 had not said, and they came out of tagging
forty-seven quantities rather than out of thinking about the ladder:

- **A rung is the strongest check actually run.** Where two could be argued
  for the same check, the register takes the weaker: 四德 is rung 4 for the
  合 partner that confirms it exactly, not rung 1 for a comparison leaving an
  unexplained residue on 0.7 % of the days.
- **A rung is not a property of the quantity.** It moves when the shelf does,
  in either direction — which is what made `docs/sources.md` § "When a source
  arrives later" necessary, since nothing had ever said what happens when a
  source turns up *after* a quantity shipped.
- **The five rungs order the evidence for a rule handed down**, and a quantity
  read off the sky is not on that ladder. Filed under rung 1 it claims a
  second implementation that for the true-solar correction does not exist;
  filed at the bottom it calls Swiss Ephemeris a single unchecked text. **Rung
  0** says what it is. **And a dash** says the other thing nobody had a way to
  write down: the engine carries the five phases of the 十二天將 and no source
  stands behind them, which is why the drawing leaves them uncoloured.

## The pages

Four, and the index. The two derived ones read the two registries and are
server-rendered, because `PARAMETERS` is a value in `core` and importing
values from that package into anything the browser runs drags the native
ephemeris binding into the bundle. Both are cacheable `public`, which is
unusual here and is the point: they hold nobody's data.

`lib/notes.ts` is the registry phase 17 said `instruments.ts` could not be,
and the gap is the one that phase predicted: nine layers against six
instruments — the calendrical layer under all of them, the almanac, and the
年命. The page says so rather than leaving a reader to notice that the nav is
shorter.

The two written ones carry the date each entry was last checked, shown. What
they say is `docs/refusals.md` and `docs/readings.md` condensed for somebody
who has just met a board rather than for a reader of the repository.

## What the two derived pages cost in a second language, and what that settled

Almost nothing, which is the phase's own claim measured. What doubled was the
frame: the rungs and their definitions, what each layer is and is computed
from, what each parameter settles. What did not double is the register, which
is quoted — a list of editions, chapters, programs and the spans they were run
over, kept in the language of the source, with the page saying so in the
reader's own.

That distinction is what made the glossary question answerable. It stays on
probation and `ROADMAP.md` now says what would have to happen before it is
built: a terminology pass first — the rule that a glyph shown to a person
carries its reading is stated and unenforced — and derivation rather than
prose if it is ever built at all.

## What this phase did not do

The glossary. The terminology pass. And `docs/sources.tsv` weighs the
quantities that were already argued in `docs/sources.md`: it adds no evidence
and settles no open question, which is why forty-seven rows could be written
against a document nobody had to re-read.
