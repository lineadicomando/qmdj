# Phase 18 — The consultation takes every instrument

**Done, and it revises phase 14 rather than extending it.** The
consultation carries the two boards of 卜 and is the only surface that builds
a prompt. This phase gives it the two boards of 命 as well — 八字 and
七政四餘 — so that every board this engine computes can be handed to a model
from one place, and only from there.

**Two findings put it on the list, and neither is a preference.**

The first is that **the nav lists four bare names.** `Qi Men`, `Liu Ren`,
`Qi Zheng Si Yu`, `Ba Zi` — an instrument is named and a name does not
translate, which is right, and `navigation.ts` accepted the cost knowingly:
«a reader who clicks a name they do not know lands on a page that says what it
is». That sentence assumes the click. Somebody arriving wanting a chart of a
life sees four transliterations, has no way to weigh them, and may click none
— while two of the four are exactly what they came for. The gloss belongs on
the heading, still; what was missing is anything upstream of the heading that
says the thing exists.

The second is an **asymmetry nobody chose**. `/api/chart` and `/api/liuren`
each carry `/text`, `/plate` and `/prompt`. `/api/qizheng` carries `/text` and
`/plate` and no prompt, by phase 16's decision. `/api/bazi` carries **neither
`/text` nor `/prompt`** — not by decision, by never having been asked for. So
of four boards, two can be handed to a model and two cannot, and the older of
the two holes is the substrate every other board is built on.

**What this phase keeps, and keeps harder.** One instrument to a
consultation, chosen before the press and at no point after it. The rule does
more work at four boards than it did at two, and the overlaps are now worth
enumerating: the Qi Men chart and the 六壬 board share the day pillar, the 旬,
the 空亡, the 遁干 and seven of the eight 八神; the twelve 宮 of 七政四餘
*are* the ring 六壬 seats its 月將 on; and a 八字 is the four pillars every
other board is laid from, so beside any of them it is the same fact a second
time. **Nothing is fused, because nothing is ever in the fence together.** The
comparison stays where phase 14 put it, in the sections that are addresses,
where nothing is being asked.

Also kept: the question never reaches the server, the board travels computed
and never as a date, and the consultation prints from the page.

**What it pays, said plainly.** Phase 14 wrote that a consultation *is an
act*, that the question comes first, and that the instant of asking is the
instant that is cast. Of those three, the third stops being true of the whole
section: under an instrument of 命 the instant is a birth, and the board is
laid on it rather than on now. The first is narrowed with it — the section
stops being one act and becomes the place where a board is prepared to be
read, by the reader or by a model, which is the honest description of what it
already did and of what it now does over four boards.

The second survives untouched, and that is deliberate. **This phase adds no
door.** The choice of instrument stays a field inside the one form, below the
question, exactly where phase 14 put it and for the reason phase 14 gave: a
step in front of the question would make a reader classify what they have
before they have written it, and writing it is what reveals its kind. What
changes is that the field grows from two options to four and stops being a
`<select>`, which gives one line to an option and stops scaling at about
three. What replaces it says what each instrument is *for*, one line of gloss
apiece, all four legible at once.

**The hard part is the prose, and it is one paragraph per 命 board.** On a
board of 卜 the refusal is a withholding — the 用神 is the reader's, and a
board without one is a map with no pin. That lever is absent here: 七政四餘
hands over 財帛, 官祿, 疾厄 and nine more already seated, because those are
the transmitted names of the seats, and a model given a palace already called
wealth has nothing left to refuse. So the fence must carry what the label
cannot: the twelve are named and not assigned; which of them answers what was
asked is the reader's exactly as the 用神 is; and the direction they are
numbered in stands on one source and three derivations, which is written out
in the 人事十二宮 section of `docs/sources.md` and is the weakest ground
anything on that board stands on. 八字 needs the same paragraph against its
own doctrine. This is the work of the phase; the rest is plumbing.

**The plumbing, and the debt it pays.** `consult` selects its instrument
through a bare `string` and a derived boolean — `const liuren = instrument ===
'liuren'` — and **seventeen branch points** hang off that boolean: the
endpoint, the key the board comes back under, the route, whether a birth is
offered, the legend, the ring class, the strength legend, the drawing's
measures. At three instruments each becomes a ternary; at four, a chain. It
has begun to rot already — `width={liuren ? 900 : 900}` stands in two places,
a ternary that has not chosen anything since the two boards' drawings came out
the same width, and which nobody saw because a binary hides it.

What replaces it is a descriptor per instrument — `{ id, needs, endpoint,
resultKey, route, plate, … }` — where `needs: 'question' | 'birth'` is the
whole of the new branching: two instruments ask a question and cast now, two
ask a birth and cast then, `missing` requires one or the other, and the moment
fields change their labels and not their nature. **Build the registry first
and alone**, against the two boards that exist: it stands up by itself, kills
the dead ternaries, and turns every step after it into a data entry.

**The surfaces to cross**, in the order the `new-feature` skill sets: two new
prompt bodies in `core/src/prompt.ts` beside the two that are there, and a
`/text` for 八字 which has none; `/api/bazi/text`, `/api/bazi/prompt`,
`/api/qizheng/prompt`; both catalogs; the consultation itself; and
`docs/agent-prompt.md`, which is written as a shared preamble and two halves
and becomes a preamble and four.

**Left open on purpose.** Whether the consultation, under an instrument of 命,
should show the board it is about to hand over as fully as the instrument's
own section does, or less. Phase 14 left the same question open for 六壬 and
it is still open; a fourth board is not the occasion to answer it.

**What it found, which is the part worth carrying forward.** Two live defects,
both on the consultation, both invisible to every test in the repository, and
both of the same kind: **a page that read one board's shape and assumed all of
them.** Neither was found by reasoning about the code. They were found by
opening the site and pressing the button, which is the lesson.

The first had been shipping since phase 14. `/api/liuren` hands the moment
over beside the board; `/api/chart` keeps it inside the chart, because a chart
carries its own. Phase 14 changed one line from `chart.moment` to `body.moment`
so that it would serve both, and it serves one: **every Qi Men press threw on
the line after the fetch**, was caught by the outer handler, and came back as
«The board could not be laid.» On the section the site opens with, under the
default instrument, for the whole of phases 15 to 17 — while 六壬 worked, which
is why nothing looked broken from the inside. The engine was never wrong; the
page could not read what it was handed. `test/api.test.ts` now asserts the
moment is reachable on all four endpoints, by exactly the expression the page
uses.

The second this phase introduced and then caught. The result was rendered by
the component of the **currently selected** instrument rather than the one the
standing answer was laid with — so moving the field over a cast board handed a
Qi Men chart to 八字's reading, which looks for four pillars on an object that
has nine palaces. It threw. At two boards the same gap was survivable, because
the two components failed quietly on each other's shape; the third and fourth
made it fatal, which is the ordinary way a latent defect surfaces. The fix is
`castInstrument`, pinned at the cast beside the address, the question and the
moment — **which the page already did for all three of those and had never
thought to do for the instrument itself.**

Both say the same thing about this section: everything under the answer
belongs to the instant that was laid, and everything in the form belongs to
the reader. The page knew that rule and applied it to the data it carried,
never to the *shape* of that data. There is no component test harness here,
so the second class of defect still has no automated guard — the honest note
to leave rather than a test that would not have caught it.
