# Phase 14 — The consultation takes a second instrument

> **Read this phase as the record of a decision later widened, not as the
> current shape.** What it settled about *one instrument to a consultation*
> stands, and phase 18 leans on it harder than this phase had to. What it
> settled about *what a consultation is* — an act, a question, an instant —
> was true of the two boards it had, and stopped being the whole of it when
> the consultation took the instruments of 命 as well. Phase 18 names which
> sentences below it kept, which it paid for, and what the price was.

**The debt phase 13 opened, and paid.** The consultation casts a Qi Men
chart at the instant of the asking. There are two boards now, and the question
is not which to show but *what a consultation is* when the act has more than
one instrument.

**One consultation, and the instrument is a field of it.** Not two
consultations side by side, which would privilege one art by the accident of
which was built first; not a door with two choices, which puts a click in
front of the question and the whole point of this page is that the question
comes first. The root of a language stays the one consultation, and what is
chosen before pressing is which board the instant is laid on.

**The options say what they are for, never what they are called.** «When to
move, and which way» against «what is going on, and with whom» — because
somebody arriving with a question recognises the shape of their own, and
somebody arriving at `Qi Men` and `Liu Ren` is choosing between two words they
cannot weigh. The same rule that makes an option reading `chou` unusable.

**And the choice stands before the press and nowhere after it.** This is the
constraint the rest follows from. A tab, a toggle, a «see the other board»
under the result: every one of them lies about the hour. Either it casts again
— and then it is a different instant, not the instant of the question — or it
shows a board laid for a moment nobody asked at. **The instrument may be
chosen anywhere before the casting and at no point after it.** A reader who
wants the other board changes the field and presses again, which is a new
consultation of a new instant, and the page says so rather than pretending the
two are one.

The question they typed survives that. It is the same question; only the
instant is new, and making them write it out again would be a punishment for
changing their mind.

**One board in the fence, and what that saves.** The prompt is where this decision earns its keep, and it is worth setting down
what the alternative would have cost — because the alternative was nearly
built.

Two boards of one instant in one prompt invite three failures. The obvious one
is that a model merges them into a single verdict, inventing a correspondence
doctrine that no text carries: the 三式 were held as one competence and read
**separately, then compared**, never fused.

The second is not obvious and is worse. **The two boards are not independent
witnesses.** They share the day pillar, the 旬, the 空亡, the 遁干 and seven of
the eight 八神 — 螣蛇, 太陰, 六合, 白虎, 玄武, 朱雀, 勾陳 all stand among the
十二天將. Where they agree, that is frequently *the same fact printed twice*.
A model writing "both boards confirm" would be counting one datum as two, and
would do it with complete confidence, because convergence is exactly the shape
a reading expects to find. Not a miscalculation — **a false evidence produced
by the shape of the output itself**, which is the worst failure this project
can ship.

The third is quieter. The refusal of the 用神 does not weigh the same on the
two. On a Qi Men chart it is total: without a 用神 the board is a map with no
pin, and a model must choose one to say anything at all. A Liu Ren board hands
over its 三傳 already drawn, by nine rules that ask the reader nothing. Put the
two in one prompt and a model will find the second far easier to talk about —
and the reading will lean that way **not because it is more pertinent but
because it is more readable without deciding**.

All three are gone by construction rather than by warning. No non-fusion
clause to write, no paragraph for a model to recite unasked — which
`agent-prompt.md` already records as the reason an earlier one was cut.

**What is not lost, and where it went.** Casting more than one 式 on an instant and comparing them is transmitted
practice, and forbidding it would be this project deciding against a text. It
is not forbidden: **it moved to the sections that are addresses.**
`/[lang]/chart` and `/[lang]/liuren` already take the same instant from the
same query string, and `carriedSearch` already walks a moment from one to the
other. There nothing is asked — no question travels, no prompt is built, the
reader is *looking* rather than *asking*.

> A consultation is an act and takes one instrument. Comparing instruments is
> an observation, and it lives where nothing is being asked.

Which is also the right line on the discipline. Comparing the 三式 is a
practitioner's technique, and the consultation is built for somebody who is not
one — which is precisely the reader who would invent the fusion.

**年命 is offered under one instrument and not the other.** The consultation
already asks for a birth, and hands the 本命 and 行年 to the
prompt inside the fence. That stays, under Qi Men, where a person is not in
the chart at all until they are placed in it.

Under Liu Ren it is **not offered**, and the reason is structural rather than
cautious: the querent is already in the board. The first course stands on the
day stem, which *is* the person asking, and the third on the day branch, which
is the matter or the other party. A 本命 laid beside that would be a second way
of naming somebody the board has already named, and two names for one person
is how a reading acquires a relation that was never there. The fields for the
birth appear with the instrument that uses them and are absent with the one
that does not.

**What it touches.** `readingPrompt` stops being about a chart. **Two bodies and a shared
preamble**, not one function over a union: one speaks of palaces, of the 用神
the reader still has to choose, and of a 凶 that is not advice; the other of
四課 and 三傳, of 課體 that are names and not verdicts, and of a 返吟 whose rule
no reference implementation covers. `/api/liuren/prompt` and `/api/liuren/text` stand
beside the chart's, and `asked=true` stays the only thing the server is ever
told about the question.

> This document said `/api/chart/prompt` would be renamed to the
> consultation's, with the instrument among its parameters. It was not, and
> the reason is worth the line: **the endpoint tree mirrors the boards, not
> the acts.** `/api/chart/plate` and `/api/liuren/plate` were already siblings
> before this phase, and a prompt is of a board — the consultation only
> chooses which. One rename avoided and one asymmetry avoided.

The instrument travels in the address, because the consultation's rule is that
the **setup** travels and the question does not, and which board to lay is
setup exactly as `trueSolarTime` is.

`docs/agent-prompt.md` is written throughout as though there were one board.
It has to become a shared preamble and two halves, and that is prose work
rather than code.

**Two things left open on purpose.**

- **Whether the Liu Ren prompt tells a model that the 三傳 arrive already
  drawn.** It is true, and it stops a model reordering them. It is also an
  invitation to treat them as *the* answer — and the 用神 is still the
  reader's: which of the four courses stands for what was asked, the board
  does not say.
- **How much the consultation shows under a Liu Ren board.** The section at
  `/[lang]/liuren` shows the drawing, the transmissions, the lessons, the
  whole 天地盤 and the rule. A consultation may want less: there the reader is
  not studying the board, they are about to hand it to something that will
  read it.
