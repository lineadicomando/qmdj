# Handing a board to something that will read it

The refusals of `docs/refusals.md` have a consequence: somebody who wants a
reading takes the date to a model, and **a model handed a date and a place
casts the chart from memory and gets it wrong**. A wrong chart read well is
the worst thing this project can produce, because nothing downstream catches
it — it looks exactly like a right one.

So **a board travels computed, and never as a date.** The builders in
`packages/core/src/prompt.ts` put the board inside a fence and
`docs/agent-prompt.md` around it. Handing the chart over without that would be
this project outsourcing in a paragraph what it declines to do in code.

## One board, never two of one instant

A consultation takes **one** instrument, chosen before the press and at no
point after it. A control that switched boards over a standing answer would
either cast again, at an instant nobody asked at, or show one laid for a
moment nobody asked at.

The reason is not tidiness, and it does **more** work now that there are six
boards rather than less. A Qi Men chart and a 六壬 board share the day pillar,
the 旬, the 空亡, the 遁干 and five of the eight 八神; the twelve 宮 of a
七政四餘 board *are* the ring a 六壬 board's 月將 is seated on; and a 八字 is the
substrate the others are built from, so beside any of them it is the same four
pillars a second time. **Where two boards agree it is frequently one fact
printed twice**, and a model reading that as corroboration counts one datum as
two with complete confidence.

No transmitted rule combines the 三式 — they were read separately and compared.
That comparison is still available in the sections that are addresses, where
nothing is being asked.

**太乙 overlaps none of the other five and the rule holds for it anyway**, on
the first half rather than the second: a model handed a board of a year beside
a board of a person reads the year onto the person, which is the one thing
that board's prompt spends a paragraph refusing.

## Three kinds, and the kind decides what is asked for

`apps/web/src/lib/instruments.ts` holds the registry. `needs` is the field
that settles it — and also settles the address, and whether a moment comes
back at all.

| Kind | Instruments | `needs` | What the reader supplies |
|---|---|---|---|
| 卜 | 奇門, 六壬 | `question` | a question. The instant of asking is the instant cast |
| 命 | 八字, 七政四餘, 紫微斗數 | `birth` | a birth. No question is asked |
| 天 | 太乙 | `year` | a year, and a **matter**. No question, no person, no place, no hour |

**Under 卜 the question comes before the casting** or it is a caption on a
board that was already there. That is why the date and the time sit under the
options and empty, and empty is the press.

**Under 命 the instant is not now.** The board is laid on a birth and the
fields ask for that instead.

**Under 天 there is no person.** `MomentForm` is absent altogether and the
whole of the form is one number. Empty there is the year being lived: an empty
year is everybody's answer where an empty birth is nobody's. A 年計 board has
no moment, so reading `castMoment` unguarded is an exception in the middle of
a successful cast.

## The question never reaches the server

A prompt endpoint is told `asked=true` and nothing more, and the prompt ends
on the line that introduces a question for the browser to append. What
somebody asks a chart is theirs, and a query string is written into every log
along the way.

Under 命 or 天 there is nothing to withhold — nothing is asked of those boards
— and the line the prompt ends on is not there either. Under 天 that is what
makes `/api/taiyi/prompt` the one prompt endpoint cacheable `public`: a 年計
board and its instructions are a pure function of a year and hold nobody's
data. Everything else is `private`, never `public`: a chart is a pure function
of its URL, but the key of a shared cache would hold somebody's date, time and
place of birth. The solar terms are `public`; they are about the sky.

**A matter travels as a question does.** `--about`, `about=true`, a required
field in the consultation: a boolean to the server, the text appended by the
browser, never in a query string.

## The consultation is the only surface that builds a prompt

`/[lang]` — the root of a language, the section the nav lists first — is the
one place here where the answer is not in the address: the board is cast by
`fetch` and held in the component, and only the setup travels in the URL. **A
prompt is an asking and belongs where the asking is.** The sections that are
addresses show boards and their transcripts, and asking there is navigating.

This project talks to no model, holds no key and sends nothing anywhere. The
prompt goes to a clipboard.

**The consultation prints from the page and never from a route of its own**,
for the same reason: a route would have to be told the question.

## What a 卜 prompt commissions

A chart **withholds the 用神** and says so: which palace bears on the question
is the reader's choice, and the prompt requires it declared. A 六壬 board hands
its 三傳 over already drawn, by procedure, and the prompt says not to re-derive
them — while which of the four courses to read from is still the reader's.

## What a 命 prompt commissions

The subject is **the person the board was laid on**.
`prompt.ming.configuration` opens on who they are, and `mingClosing` lays the
reply out in six steps:

1. the disclaimer;
2. the birth situated in the model's own words;
3. the board read whole, from a centre;
4. the themes of a life, in short sections titled **for a theme and never for
   a factor** (`prompt.ming.sections`): temperament, the forces in conflict,
   the work on oneself, undertakings as functions, the ties;
5. the per-board inspection list those sections draw on;
6. an ending that opens.

**Every choice travels signed.** Which seat, god or element carries a theme is
said as it is made, and a school's method arrives named as that school's: the
seats of 七政四餘 are read by their transmitted names
(`prompt.qizheng.houses`), the ten gods' readings toward a life arrive as
named teachings (`prompt.bazi.gods`), and the favourable element stays
uncomputed and is chosen aloud (`prompt.bazi.yongshen`).

The bounds are in `prompt.ming.limits` and `prompt.ming.register`, and they
are the refusals of `docs/refusals.md` said to a model that will never read
that file. Beside them, four disciplines that are about *how* rather than
*what*:

- a tension is never handed back as a defect (`prompt.ming.tension`);
- a bound is named **where it bites** and never as an opening section
  (`prompt.ming.rulesStayOut`);
- the transcript is never recited back (`prompt.ming.noRecital`);
- every term is explained at first use (`prompt.ming.explain`).

## What a 天 prompt commissions

**A reading is for a matter, and the matter is not a question.** A matter names
what is being *looked at*: a field of view with two sides in it — two
organisations, two parties to a negotiation — which is what the two counts are
counts of. A question asks what will happen and puts the reader inside a
figure they are not in.

Without a matter the prompt reads the figure and **says the assignment was
never made**, rather than sending a model to invent a pair of parties. That is
what the first cut of this register got wrong, and what its first output
showed: with the doctrine refused and nobody on the board, a prompt made of
bounds alone produced a precise account of a figure that never says «and so?».

The register is **descriptive and never predictive**. Its sections are titled
for parts of a figure — where 太乙 stands, the two eyes, the two counts, the
conditions, the longer circuits — and never for anything in the world.

One thing every surface printing this board must say, and it is the numbering:
its **nine palaces are numbered one seat off the 洛書** (卷二: 九宮皆差一位), so
一宮 is the north-west here and the north in a chart. A reader holding a chart
beside this board reads all eight one seat wrong otherwise. It is inside the
transcript, so every surface carries it without remembering to; the prompt
states it a second time among its rules, because there it is not a caption on
the data but an instruction governing every position below it.

## What stays out of a prompt

**How sure each number is stays in `docs/agent-prompt.md`**, for an agent that
can look it up. In the pasted prompt it was a paragraph the model recited
unasked, beside a disclaimer that already says this is entertainment.

**The exception is a bound on a quantity the prompt is already telling a model
how to read.** The direction the twelve 人事宮 are numbered in travels inside
the 七政四餘 prompt, and so does the frame the 宿 are cut by, because that
prompt spends a paragraph saying those seats are names and not assignments —
and a caution about a quantity, arriving with the instruction that governs it,
is part of the instruction rather than a recital beside it.

**The test is whether removing the line would leave an instruction a model
could follow confidently and wrongly.** A general account of how this engine
knows things fails that test and stays where it was.

The one exception in the other direction is 太乙's evidence line — that the
board is checked against the text that states it and against nothing that runs.
It rides inside the fence because a transcript travels to where no notes page
follows it.

## The disclaimer travels

The prompt carries the disclaimer the site's footer carries, as an instruction
to say it: this is food for thought and entertainment, it is no substitute for
professional advice on anything, and the power over a person's choices and
their path stays theirs. **A prompt travels, and a disclaimer left behind on
the page it was copied from was written for somebody who is no longer there.**
