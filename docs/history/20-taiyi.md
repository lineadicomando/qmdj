# Phase 20 — 太乙神數, and the reading that gated it

**Done.** The third of the 三式 has a board and a section. It is the first
thing here whose subject is neither a question nor a person: 太乙主天, and what
this board is laid on is a year.

**The reading came before the code, and the phase could legitimately have
ended in it.** 《太乙金鏡式經》 (王希明, 唐, c. 730, 十卷) is in the 四庫全書
and on Wikisource, and this repository had read it once already — `purposes.ts`
and the 八門 section of `docs/sources.md` lean on 卷二 for the domains of the
gates. It was read again against three questions, all three to answer before a
line was written:

1. Does it state a **上元積年** in figures, unambiguously?
2. Does it state the placements — 太乙, 計神, 文昌, 始擊, the 主 and 客 大將
   and 參將 — completely enough to cast from this text alone?
3. Does it, or 《太乙統宗寶鑑》, carry **worked boards for datable years**?

**All three answered, and the first answered in the most interesting way it
could have.** The text states *three* 上元積年 — 1,937,281 in 卷一, 40,801
beside it, 30,001 in 卷三 — differing by millions, one of them anchored on a
year that is not the 甲子 it is called. And all three are congruent modulo
三百六十, the 周紀法, which is the only residue any placement in the 年計
reduces by. **The magnitude is unsettled and the board is not.** 卷一's
「上考往古每年减一筭，下檢將来每年加一筭」 turns the figure into an anchor
rather than an origin, and the text then checks that anchor against itself
four separate ways at 開元十二年 — the 太歲, the 紀, the 直使 gate, and 五福 in
遼東 in its eleventh year — plus twenty-six datable 甲子 years in 卷二 running
back to 837 BCE. The full arithmetic is in the 太乙 section of
`docs/sources.md`.

The second answered completely but for one step: **參將 is nowhere stated in
words**, and is induced from fourteen worked instances that agree without
exception — a quarter turn clockwise from the 大將. It is marked as induced in
the code and in the register. The third answered abundantly: 卷三 prints a 立成
of seventy-two rows twice over, and 卷一, 卷六 and 卷九 work individual boards.

Had the first failed, § "The standard, stated once" of `docs/sources.md`
already said what happens: the entry left out and the absence written down.
**That outcome would have been a delivery and not a failure of the phase.**
That it did not fail is worth recording precisely because the phase was built
to survive its failing. 《太乙統宗寶鑑》 remains unread, which is why `epoch`
ships with one value rather than two.

**What it computes.** 太乙 walks the eight palaces and never enters the centre
— 太乙不入中宮 — one palace every three years in the 年計, so twenty-four years
close the circuit. Around them the **十六神**, the twelve branches and the four
corner trigrams under names of their own. Placed by counting: 計神, 文昌, 始擊,
主大將 and 主參將, 客大將 and 客參將, the 三基 (君基, 臣基, 民基), 五福, 大遊
and 小遊. From those positions the two numbers the board exists for, **主算 and
客算**, and the named conditions on them — 掩, 迫, 囚, 擊, 關, 格. Those last
are attributes of the configuration in the sources' own words and travel as
`Pattern` does, identifier and glyph and valence, never as prose.

**The reading found one thing the plan below had wrong**, and it is the
largest single fact about this board. 卷二: 「太乙式九宫皆差一位…所以差一宫以就
乾位」 — the palaces are **not** numbered as the 洛書 numbers them. Every number
has moved one seat anticlockwise so that 一 reaches 乾, so 一宮 is the
north-west here and the north in a Qi Men chart. The paragraph below about the
drawing said the eight are "in the same 洛書 arrangement", and what is the same
is the *arrangement of directions*, never the numbering. The drawing therefore
places every palace by its direction and never by its number, and both the
picture and the transcript carry a standing line saying so — a reader holding a
chart beside this would otherwise read all eight one seat wrong with nothing
anywhere to contradict them.

**The section is an address, and that is a property of the board rather than a
staging decision.** Every other board here is a pure function of somebody's
question or somebody's birth, which is why a chart is cacheable `private` and
never `public`. A 年計 board holds nobody's data: it is a function of the year.
So it is `public`, like the solar terms and for the same reason — it is about
something everyone is standing in. It can be linked, shared and indexed, and
it is the first thing on this site that can be.

**The consultation gains no instrument, and that is decided rather than
deferred by accident.** What this board is for is judged from the section
first. Two consequences follow and neither is optional: there is **no prompt**,
because `/[lang]` is the only surface that builds one, and the reflective
register such a board would need is therefore not designed here either. The
sentinel in `apps/web/test/load.test.ts` kept its assertion —
`?instrument=taiyi` still falls back to `qimen`, because it is still not an
instrument — and **its comment stopped being true and was rewritten**: what is
outside the consultation is no longer "a board this engine does not compute",
it is a board that is not an instrument of one. Unlike 七政四餘's, this
sentinel was not written to fail on the day the board lands, and the board has
landed.

> **Superseded by phase 21**, which designed that register and moved the board
> across. The paragraph stands because the ground it gave was a specification
> and not a verdict — the refusal was correct on the day it was made, and would
> still be correct had the register not been found. What phase 21 changed is
> the antecedent, never the reasoning: nothing about the board, and nothing
> about the standard.

**The drawing is the nine-palace grid with an empty centre, and not a ring.**
The 八宮 of this board *are* the nine palaces of a chart less the middle one,
in the same 洛書 arrangement — so laying them as a ring would say they were the
ring 六壬 and 七政四餘 share, which they are not, and a reader who had just
looked at a chart would learn a false thing about both figures at once. The
centre stays empty and the emptiness is content. The 十六神 sit outside the
grid on sixteen seats of its border, twelve branches and four corners, which
is the one figure `packages/plate` does not already own. Everything else the
section is made of — the table beside the drawing, the light and dark
appearances, the fourth appearance on paper, the second copy at `scheme=light`
warmed for `beforeprint` — is what the other sections already do, and this one
looks like them.

**Every cell carries its phase and every name in one carries its word.** Two
things the first cut of the drawing left to a legend and a stylesheet, and
both were wrong for the same reason: this board is drawn at the measure of a
page, and a cell a fifth of it wide has room for a second line that a narrower
figure has to send to the foot. What goes in it is the **gloss**, as it does
in every other drawing here — the reading went there first and was taken back
out, because 太蔟 tàicù under a glyph tells a reader who has no Chinese how to
say a thing they still cannot place, while «la grande adunata» tells them what
it is. The readings stayed where they were, in the band under the grid, which
is the one lookup that is honestly a lookup; what did go is the ring of
sixteen the table below the picture repeated after it. The tint is the seat's
own element, which 卷六 states for the ring — 「假今髙叢
木…」 — and which the eight palaces inherit from the seat each stands on, so a
palace and the border cell it touches are one colour and nothing here is a
phase the text does not hand down. The middle takes none, because it stands on
no seat; 太乙不入中宮 is now said by a colour as well as by an empty cell. The
tints were in the source before this and invisible: `.cell` declared
`fill: none`, and a CSS declaration beats the presentation attribute that
carried the phase, so the sixteen had been drawn plain since the day they
landed.

**The form is the bar the other sections are left with once they fold.** A
年計 board is a function of the year, so there is one field, and a disclosure
in front of one field is a door in front of a doorway: the panel is gone and
what stands over the board is a year to type, the two steps that move it, the
way back to the year being lived, and the clipboard and the printer in the
corner they keep everywhere. `MomentSteps` grew a `units` prop for it rather
than being copied — what a board is a function of is the section's to say, and
a row offering to step this board's month would offer to move something that
does not move. The title went offscreen and the paragraph under it went to the
notes, which is what every other board's page already does: the nav says which
section this is, and a page of preface stands between a reader and the picture
they came for.

**The verification has no runnable reference, and the substitute was named in
advance and turned out to be broad.** Nothing open computes 太乙, and the closed
programs that do disagree with each other, so the check is what the text itself
carries — the tradition auditing itself — transcribed into fixtures. That is
weaker evidence than `lunar-javascript` was for the pillars, in the way the
七政四餘 frame's over-determination was, and it is written down as such —
**once, where it is a statement about the figure, rather than under every
board as a caption to that year's**. It stood on the picture and under the
tables of the section, which is where a reader met it three times and read it
as a hedge on the board in front of them; it is in the transcript, in the
description of `compute_taiyi`, and in `docs/sources.md`, and its place on the
site is the notes. The notes section is a title and nothing else at the time
of writing, so this is a debt: until it is written, a reader who never copies
the board as text is not told.

What it turned out to be is **864 printed cells**, of which the engine
reproduces 850 exactly. The fourteen that diverge are listed in
`test/taiyi.test.ts` as errata rather than corrected in the fixture — a fixture
quietly edited to agree with the code under test has stopped being evidence —
and thirteen of them are settled by the text against itself, the same
configuration appearing elsewhere in one of the two 立成 with the value the
procedure gives. One of the thirteen is settled by a worked board in 卷一 that
states the number outright. The fourteenth has no parallel and is written down
as having none.

**What it refuses.** The received doctrine is dynastic — wars, famines,
mutations, dated — which is the class this engine already declines, arriving
in a register where it is more dangerous rather than less: an epochal reading
is falsifiable by nobody and travels as commentary on real events. The board
names positions and numbers and stops. **It never says who is 主 and who is
客.** Identifying host and guest is the first interpretive act the system asks
for, and it is the reader's, for the reason the 用神 is: a board that assigned
the two parties would be answering the question this engine does not ask.

**The surfaces crossed**, per the `new-feature` skill: `taiyi.ts` in `core`
with its tests, both catalogs, `format.ts` and `taiyiTranscript`, `qimen
taiyi`, `compute_taiyi`, `/api/taiyi` with `/text` and `/plate`,
`renderTaiyiSvg` in `plate`, the section at `/[lang]/taiyi`, the README,
`docs/sources.md` and `docs/agent-prompt.md`. No `/prompt`, per above.

**What is computed and what is not.** Computed: the 積年 and the 紀, the 局,
太乙 and its 小遊 (which 卷五 says are one thing), 文昌, 始擊, 計神, 合神, the
主算 and 客算, the 大將 and 參將 of each side, the 八門直使, the 三基, 五福,
大遊, and the conditions 掩 擊 迫 囚 關 格 對. Not computed, each with its
reason written down: 月計 · 日計 · 時計 (the parameter waits for them); 四神,
天乙, 地乙 and 直符太乙 (they walk twelve palaces, not eight — a different
figure on a different ring); 四郭固, 四郭杜, 執提 and 提挾 (they turn on which
party is 主, which is the question this board does not ask); and 陰陽和不和
(卷二 gives two accounts and they do not line up).

**The identifier is free, and the register says why it looks taken.** `taiyi`
already names the 月將 巳 of a 六壬 board (`liuren.ts:114`,
`label.yuejiang.taiyi`). The catalogs are namespaced and nothing collides, but
the two are unrelated and a reader who meets both is owed the sentence.

**What did not move.** The 年命 rule and `purposes.ts`; one board to a prompt;
the question never reaching the server, which under this board is vacuous
because nothing is asked of it; and the standard, which is what the gate at the
top of this phase existed to hold — and did.
