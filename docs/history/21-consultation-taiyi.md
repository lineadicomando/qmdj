# Phase 21 — The consultation takes the board of a year

**Done.** 太乙 becomes the fifth instrument and the third *kind*. It gains a
prompt, a `/prompt` endpoint, `--prompt` on the CLI and a seat in the select at
`/[lang]`.

**It answers phase 20 rather than reversing it.** That phase declined the
prompt and the instrument, and the ground it gave was not caution about the
board: it was that **what such a board would be handed over *for* had not been
designed**. That sentence is a specification, and this phase meets it. Nothing
about the board changed, nothing about the standard changed, and phase 20's
account stays where it is because it is correct history — the refusal was right
on the day it was made and would still be right if this register had not been
found.

**The register, which is the phase.** A reading here is **descriptive and never
predictive**. Its subject is the figure of a year, so its sections are titled
for parts of the figure — where 太乙 stands, the two eyes, the counts, the
conditions, the longer circuits — and never for anything in the world, because
a section titled for a war or an economy is the dynastic doctrine arriving under
a heading. Two refusals bound it and they pull opposite ways. The received
readings are dynastic, dated and falsifiable by nobody, and they stay out. And
**nobody is on this board**: the reader is not in it, no seat here stands for a
part of their life, and turning it into a forecast for them is the natal-Qimen
error arriving in a register where it would be harder to see. `prompt.taiyi.*`
carries both.

**主 and 客 move from refused to commissioned, and the engine does not move.**
It still names two counts and stops, exactly as it names nine palaces and
chooses no 用神. What the prompt adds is the sentence `prompt.yongshen` already
says for a chart: nothing below chooses, the choice is yours, say which you take
and why. That is not a relaxation — it is where the act was always supposed to
happen, and phase 20 had nowhere to put it because there was no prompt.

**The first output showed the register was half built, and finished it.** The
phase shipped, a board was read, and the reply came back a precise account of a
figure that never says «and so?» — correct in every line and useless to the
reader it was written for. The diagnosis is worth keeping because it generalises:
for 八字 or 七政四餘 there is a transmitted interpretive layer that is not
predictive, so removing the prophecy leaves a reading. **For 太乙 the transmitted
layer *is* the dynastic doctrine** — the board was built for state divination —
so «no doctrine» plus «nobody on the board» plus «never predictive» does not
leave a soberer reading. It leaves a caption. The option was named and rejected
when this was planned, on exactly that ground, and the other two refusals
reproduced it anyway.

**What was missing was a subject, and the prompt had been naming it all along.**
`prompt.taiyi.hostguest` said the assignment is «chosen for the matter being
looked at» while the consultation guaranteed no matter would ever arrive and the
next clause admitted it. So the fix is a field rather than a loosening: a
**matter** — what is being *looked at*, a field of view with two sides in it —
which is what the two counts are counts of. It is emphatically **not a
question**: a question asks what will happen and puts the reader inside a figure
they are not in, which is the refusal this board cannot give up. `--about` on
the CLI, `about=true` over HTTP, a required field in the consultation; the text
never travels, exactly as a question never travels, and the browser appends it.
Without one the prompt reads the figure and **says the assignment was not made**,
rather than sending a model to invent a pair of parties — which is a second
string (`hostguestNoMatter`) and not a missing clause, because a rule pointing at
a matter that is not in the message is the defect in miniature.

**A false reading the transcript caused, found in the same output.** The three
bases were the only circuit printed without their period — `丑 chǒu · 23` where
五福 prints `8/45`. 卷五 gives them thirty years, three and one over the same
ring, so 民基 stands at 1 every year of every board by construction; read beside
a sovereign at 23 it was taken for a base newly begun. `TaiyiFief` now carries
`period` and the transcript prints `1/1`, which cannot be read that way. **This
is the failure mode this project is built around** — a model reading a fact that
nobody computed — and it arrived not through a wrong number but through a right
number printed without the thing that makes it legible.

**A third value in one column, and that is the whole cost of the widening.**
`instruments.ts` gained `needs: 'year'` beside `'question'` and `'birth'`; the
table gained a row. Phase 18's argument for the descriptor is what got paid off
here: at the fourteen conditionals it replaced, a board that is neither of the
two kinds would have been fourteen edits and a page nobody could read
afterwards. `needs` also settles the address and whether a moment comes back —
one reason and not two folded, since it is the column that says what a board is
a function of.

**One real defect and one latent one, both found by the third kind.** The
consultation read `castMoment.input.date` unconditionally, and `/api/taiyi`
returns no moment: an exception in the middle of a successful cast, on a board
that is a function of a year and has no instant under it. The latent one was
older and had been sitting under the two boards of 命 since phase 18 — the
question box is *hidden* under the kinds that ask nothing, not cleared, so a
sentence typed under Qi Men and never cast was still in the component's state
when a 八字 board came back, and it was printed over that board in the ink at
the top of the sheet and appended to the copied prompt. Both are guarded on the
kind now.

**The prompt endpoint is the first here that is cacheable `public`**, and it is
the privacy rule arriving at its own conclusion rather than an exception to it.
Nothing that is anybody's reaches the server: there is no question, and the
matter travels as `about=true` and is appended by the browser exactly as a
question is. A boolean varies the response; the matter would have varied the
key. The board endpoint was already `public` for the same reason.

**Every glyph in this prompt carries its reading, and a test holds it there.**
This is the glyph-densest prompt here — a Tang text, a line of it, two eyes,
seven conditions, four circuits — and every one of those names is something the
reader is being told how to weigh. The rule cost the book brackets: 《》 cannot
be followed by a reading, so the title is written 太乙金鏡式經 tàiyǐ
jīnjìngshìjīng in the prompt and keeps its brackets everywhere else. The test is
the one the two boards of 命 already pass; 六壬's prompt still does not, which is
recorded here rather than fixed in passing.

**What did not move.** The standard; one board to a prompt, which 太乙 keeps
despite overlapping none of the other four — a model handed a board of a year
beside a board of a person reads the year onto the person, which is the first
half of that rule and enough on its own. The numbering line, which is inside the
transcript and now stated a second time among the prompt's rules, where it
governs how every position below is read. The evidence line, which stays inside
the fence and stays a debt against the notes. And the 年命 rule: a board of 天
standing in one select beside dunjia lends dunjia nothing.

**The surfaces crossed**, per the `new-feature` skill: `prompt.ts` with
`taiyiReadingPrompt` and `taiyiClosing`, `taiyi.ts` and `format.ts` for the
periods of the bases, both catalogs, `qimen taiyi --prompt` and `--about` with a
refusal for `--ask` that points at it, `/api/taiyi/prompt`, `instruments.ts`,
the consultation at `/[lang]`, the tests in `prompt.test.ts`, `taiyi.test.ts`,
`api.test.ts` and `load.test.ts`, and the documentation. No MCP tool, because
MCP exposes no prompts at all.

**The conditions gained what 卷三 says they are, and the reading that forced it
was a test.** A model was given this board cold, with none of this project's
framing, and asked what five of its quantities mean — with a scale to grade
itself on that separated *recalling the doctrine* from *reasoning off the
characters*. The result was unambiguous and is worth keeping: it holds the
**vocabulary and the mechanics** of 太乙 solidly — the sixteen 神 and their
names, the two eyes, three years to a palace and twenty-four to a 紀, the names
of the seven conditions, the fact of a divergent numbering — and holds **none of
the interpretive doctrine**. Asked what 太乙 in 艮 means it graded itself D and
said outright that anything it offered would be the 說卦's trigram gloss, 奇門's
鬼門, or general five-phase cosmology. Asked about 囚 it could not state the
trigger and flagged its own candidate definition as 門迫/擊刑 imported from 奇門.

Two findings from it that changed the design rather than confirming it:

- **On 掩 it landed on the text's own word — 掩襲 — and could not tell that it
  had**, grading a substantially correct answer B-shading-to-C. So asking a
  model to flag its own uncertainty does not rescue this: it cannot separate
  recall from reconstruction, and errs in both directions.
- **On the two counts it reached for magnitude** — 算多者勝 — where 卷三
  conditions three times on **parity**, 筭和 / 不和, a quantity this engine
  declines because 卷二 gives two accounts of it. The obvious reading of two
  numbers is not the text's reading, and nothing in the output said so.

Hence `PATTERNS[id].meaning`: the source's own characterisation, quoted, beside
the fortune it earns. Six of the seven have one; 對 has none and carries none,
because 卷三 gives it a trigger and a list of events and nothing that says what
it *is*. The clauses travel **inside the fence**, out of `formatTaiyi`, so the
CLI, the section, the MCP tool and the prompt all gain them at once — and so
that no exemption has to be carved out of «a name carries its reading»: a quoted
classical clause is not a name, and inside the transcript that distinction never
has to be made.

**What is still open, and it is the honest residue.** The per-palace readings
are not carried and cannot be: 卷二 gives each palace a Tang province and a
dynastic omen — 「三宮在艮，主青州。若始擊臨之，嬖寵進中宮，兵起」, which is this
very board's configuration — and there is no third thing behind them. **There is
no non-dynastic interpretive layer in this text to extract**, which is the real
answer to whether the meanings could be shipped: for the conditions there is one
sentence each and it is carried; for the palaces there is nothing that survives
the standard. Both are now written down in `docs/sources.md`, the second as a
refusal, which it was not before — the register quoted the palace line truncated
before the omens and never said they had been declined.
