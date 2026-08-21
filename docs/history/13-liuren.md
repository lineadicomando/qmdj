# Phase 13 — The second board

**Planned.** 大六壬. The extension the engine is already built for: the same
instant, the same 時辰, the same ganzhi machinery, and an act of the same
shape as the consultation — a question asked now, answered from the moment it
was asked in.

**Why it is cheap here.** `ganzhi.ts`, `pillars.ts` and `time.ts` are most of
the substrate. What is new is one construction, and it is procedural
throughout — which is what makes it fit a project whose engine answers no
question:

1. **天地盤** — the 地盤 fixed, the 天盤 turned so the 月將 sits on the branch
   of the hour (月將加時).
2. **四課** — the day stem through its 寄宮, the day branch, and the 天盤
   above each, twice over.
3. **三傳** — 初傳, 中傳, 末傳, by the 九宗門 applied in order: 賊剋, 比用,
   涉害, 遙剋, 昴星, 別責, 八專, and the two degenerate boards 伏吟 and 返吟.
   Nine named rules with stated conditions and a stated precedence. This is
   the part that has to be right, and it is the part that is testable.
4. **十二天將** — 貴人 placed from the day stem and the half of the day, the
   other eleven laid forward or backward from it.
5. **遁干 and 空亡** from the day's 旬, both of which the engine already has.

**Its divergences are few and famous**, which is unusual and welcome: when the
太陽 changes palace, whether 庚 or 辛 rides with 甲戊 in the 貴人 verse, and
where the day half is cut. All three are in § 3.

**What it will not carry.** The 課體 — 元首, 重審, 涉害, 蒿矢, 冬蛇掩目 and
the rest — are *names of configurations* and belong in the output exactly as
`Pattern` does, hanzi and pinyin and identifier. The 占斷 that the manuals
hang on them do not: choosing the 用神, ranking the transmissions, dating an
outcome. The line is the one already drawn, and it falls in the same place.

**Sources, and the rule that bites hardest.** 《大六壬大全》 (四庫全書) and
《六壬指南》 (陳公獻, Ming) state the construction; 《六壬視斯》 is a third
witness on the 九宗門. But **none of this may be written down from memory** —
phases 1 to 3 learned that more than once. A runnable reference has to be
found and agreed with before a single rule enters `docs/sources.md`.

**The reference was found and run, and it is a better one than phase 3 had.**
`kinliuren` 0.1.2.9 (PyPI, Ken Tang — the author of the `kinqimen` used in
phase 3), MIT, **one pure-Python module of 142 kB and no dependencies at all**.
It installs and runs under Python 3.14, which is worth saying because
`kinqimen` still needs 3.9 and a pair of prebuilt wheels.

Two things about it matter more than that it runs:

- **It takes no instant.** `Liuren(節氣, 農曆月, 日干支, 時干支)` — the solar
  term and the pillars, which are precisely what phases 1 and 2 already
  compute and already verified against `lunar-javascript`. So a comparison
  isolates the 六壬 construction and nothing else: no calendar of its own to
  disagree with. Nothing in this project's reference history has been that
  clean. (`農曆月` is echoed in the output and does not enter the board —
  `正` and `十一` give an identical chart. It feeds the monthly variants.)
- **Its nine methods are the 九宗門, one function each** — `zeike`, `biyung`,
  `shehai`, `yaoke`, `maosing`, `bieze`, `bazhuan`, `fuyin`, `fanyin` — which
  is independent confirmation that the structure planned above is the
  structure the tradition transmits, and not a shape recalled to fit.

**What it settles.** Its 月將 table pairs each 中氣 with the 節氣 that follows
it — (雨水, 驚蟄)→亥, (冬至, 小寒)→丑, (大寒, 立春)→子 — so the 太陽 changes
palace **at the 中氣**, and `yuejiang: zhongqi` is the reference's reading as
well as the proposed default. Its 晝夜 is cut on the hour branch, 卯 to 申
against 酉 to 寅, which makes `zhouye: branch` the implemented value; `solar`
stays in the type unimplemented until a source states it, as § 3 permits.

**What it settles differently from what was guessed here**, which is the whole
reason one runs a reference: it ships the 貴人 divergence *as an option of its
own*, and the two verses it carries are not the pair this document first named.
They are 甲戊庚→丑未, 乙己→子申, 丙丁→亥酉, 壬癸→巳卯, 辛→午寅 against a finer
table that stands 甲 apart at 未丑 and splits 丙 from 丁, 壬 from 癸, 乙 from
己. § 3 was corrected to those two. And the divergence is bounded in a way
worth knowing before the tests are written: on a 甲子 day it moves the generals
— 貴 or 空 on the 巳 of the 地盤 — and leaves the branches of the 三傳
untouched, 戌·午·寅 either way. **The 貴人 moves the generals, never the
transmissions.**

**Defects in it, for whoever uses it after this**, recorded in the same spirit
as `kinqimen`'s in § 5:

- The course name leaks an index: `蒿矢11`, `涉害1`, `杜傳1`.
- **It throws on six inputs.** `IndexError` on 雨水·乙丑·庚辰, 驚蟄·乙丑·庚辰,
  春分·己巳·庚午, 清明·己巳·庚午, 小雪·乙丑·癸未, 大雪·乙丑·癸未 — six of
  17 280, but they are six boards nothing can be checked on.
- **It classifies the two degenerate boards unreliably.** Of the 1 440 true
  返吟 boards it labels 1 226; 214 fall through to 遙剋, 賊剋, 別責 or 八專.
  Against that it labels 返吟 on 144 boards that are 伏吟 and on 352 that are
  neither. Some of the 214 are defensible — a 返吟 showing a control is drawn
  by the ordinary rule and only *named* 無依 — but 496 false positives are
  not.

**And one thing this document got wrong and is correcting.** It said above
that `fanyin` is defined and never dispatched, and concluded that 返吟 has no
reference at all. The first half is true — `result()` runs eight methods and
`fanyin()` returns a vector of relations rather than transmissions — but the
conclusion was wrong: `zeike` carries its own 返吟 guard (`sike_list[9]`), so
the reference does produce 返吟 boards, just not through the method named for
them. 返吟 is therefore checkable, and it is checked below. What it is not is
*trustworthy*, per the defect above.

One more to check rather than to claim: 伏吟 on the 陰日 丁未 returns 自任
where the rule as usually stated gives 自任 to a 陽日 and 自信 to a 陰日. That
may be this document misremembering the rule, which is why it is written here
as a question for the texts and not as a finding.

**The comparison, run over the whole input space.** This board has a property
nothing else in this engine has: **its inputs are finite and few.** Twenty-four
terms by sixty day pillars by twelve hour branches is 17 280 boards, and that
is not a sample of the space, it is the space. Phase 3 could compare 3 652
days out of an unbounded calendar; here there is nothing left over to be wrong
about.

`liuren.ts` against `kinliuren` over all 17 274 boards it answers on:

| rule | agreement | |
|---|---|---|
| 賊剋 | 7 888 / 7 956 | 99.1 % |
| 昴星 | 264 / 264 | 100 % |
| 遙剋 | 1 536 / 1 728 | 88.9 % |
| 別責 | 150 / 206 | 72.8 % |
| 伏吟 | 890 / 1 296 | 68.7 % |
| 比用 | 1 340 / 2 116 | 63.3 % |
| 涉害 | 1 060 / 1 674 | 63.3 % |
| 返吟 | 870 / 1 722 | 50.5 % |
| 八專 | 120 / 312 | 38.5 % |
| | **14 118 / 17 274** | **81.7 %** |

**The construction is verified exhaustively, and separately from the rules.**
`all_sike()` and `find_sike_relations()` expose what the reference *built*
before it chose anything, and those can be compared on their own. Over all
17 280 boards, the four courses agree **17 280 / 17 280** and the 上剋下 ·
下賊上 marking agrees **17 280 / 17 280**. Nothing is approximate here and
nothing is sampled: 月將加時, the 寄宮 table, the four courses and the phase
arithmetic under them are correct over the whole space a board can occupy.
What is left to be right or wrong about is **the selection among candidates**,
which is doctrine rather than computation.

**What the first table's shape said, and it was not "81.7 % correct".** 賊剋 alone is 46 % of
the space and it agrees at 99.1 %, and 昴星 agrees exactly. Those two agreeing
is a proof about everything underneath them: a 天地盤 turned wrongly, a 四課
read from the wrong lodging, or a chain that climbed the wrong plate would
drive 賊剋 to near zero rather than to 99. **The construction is right; what
disagrees is the tie-breaking.**

And the tie-breakers are exactly where the reference stops being a reference.
Its `zeike` is some forty hand-tuned branches over a `sike_list` of nine
positions, and 比用 and 涉害 are entangled in it — 352 of this engine's 涉害
are its 比用 and 164 the reverse, which is one boundary drawn in two places
rather than two rules disagreeing. There are boards where it opens on a course
carrying no control at all: 立春·辛未·丙申 has 賊 on 一課 and 三課, 比用 on a
辛 day keeps 亥, and the reference answers 卯未亥 — 卯 being the 四課 upper,
which stands on 亥 and is generated by it.

**So a second reference was found, and it changes the verdict.** Raising the
first table's numbers by matching `kinliuren` would have been fitting this
engine to forty conditionals nobody wrote down. `liuren-ts-lib` 3.1.0 (npm,
Apache-2.0) is the alternative: it carries a `jiuZongMen` directory — the nine
rules as nine modules — and `getLiuRenByYueJiang(月將, 占時, 日干支)` takes the
board's inputs directly, without even a term table in between. It answers on
all 8 640 boards without throwing. (`mingyu-core`, MIT, names all seven
ordinary rules too and is the third to try when one is needed.)

The space keyed by 月將 rather than by term is 12 × 12 × 60 = 8 640 — the term
reaches the board only through the general, so 雨水 and 驚蟄 are one board.
All three over all of it:

| | | |
|---|---|---|
| the two references, **to each other** | 7 120 / 8 640 | **82.4 %** |
| this engine vs `liuren-ts-lib` | 8 208 / 8 640 | **95.0 %** |
| this engine vs `kinliuren` | 7 083 / 8 640 | 82.0 % |
| **this engine where the two agree** | **6 983 / 7 120** | **98.1 %** |

**The two references agree with each other 82.4 % of the time.** There was
never a single answer to be measured against, and the first table was this
engine's distance from one implementation's idiosyncrasies as much as from the
tradition. The last row is the one that means anything: where two independent
implementations agree, that is the transmitted board, and this engine gives it
on 98.1 % of them. Every contested case sampled goes the same way — this
engine and `liuren-ts-lib` against `kinliuren` — which is the second witness
`docs/sources.md` asks for before anything is written down.

**Three clauses were wrong, and the agreeing witnesses said which.** The method
was the one that had just worked for the reference itself: where two
independent implementations agree, ask what rule reproduces them, and take the
rule rather than the table.

- **伏吟 is not a rule about stems.** The pattern looked like one — every 乙
  and every 癸 day opened on the stem's seat where 丁, 己 and 辛 opened on the
  branch's, which no statement of 剛日干上神 · 柔日支上神 accounts for. It is
  **杜傳**: a still plate can still show one control, and where it does the
  board is answered by the ordinary rule instead of by its own silence. Only
  the first course can show it — the other three stand on themselves — and 乙
  木 over 辰 土 is always a 賊 while 癸 水 under 丑 土 is always a 剋, where
  丁 and 己 over 未 and 辛 over 戌 never are. The per-stem pattern was a
  consequence of the phases, not a rule. **伏吟 dispatched before 賊剋 was the
  error**, and the fix took the comparison from 95.0 % to 97.2 %.
- **涉害 asks where before it asks how deep.** 「孟深仲淺季當休」 orders the
  clauses: a candidate standing on one of the four 孟 palaces is preferred
  outright, a 仲 only when no 孟 is present, and depth decides *inside* that
  group rather than across it. Scored over the 505 boards both references
  agree on, 孟 → 仲 → depth gives 95.8 % against 90.5 % for depth → 孟 → 仲,
  which is what this engine had. Counting backwards to the home palace instead
  of forwards was also tried and is much worse — 58.2 % at best. 97.2 % to
  98.6 %.
- **八專 comes before 遙剋, not after.** Its condition is 「如無上下相剋」, and
  a distant control is not a control between a course and its ground — it is
  what the board is asked *once no such control exists*. Every remaining 遙剋
  disagreement was a 八專 day. 98.6 % to 99.6 %.

**Where it stands.** Against `liuren-ts-lib`, **8 604 / 8 640 = 99.6 %**;
where the two references agree with each other, **7 099 / 7 120 = 99.7 %**.

**The 21 that remain** are all 涉害, and they are one narrow clause: candidates
on a 仲 palace against candidates on a 季, where the 季 is much the deeper and
the references take it. The 復等 clauses of 涉害 go further than 孟 · 仲 · 季
and this engine does not implement them. **It stops here deliberately.** Tuning
past this point would be fitting to one implementation rather than to the
tradition, which is what this phase set out not to do, and 0.24 % of the space
is a smaller error than the 17.6 % the two references differ from each other
by. What is left is a question for 《六壬大全》, not for another round of
scoring.

**And 《六壬大全》 was read, one phase later, and answered it.** Paying this
board's debt to `docs/sources.md` before phase 15 meant finding the text, and
卷一 入手法 is the whole procedure in a mnemonic verse: the 寄宮 table, the nine
rules line by line, and the compilers' interlinear notes. Three of the clauses
above — 伏吟有尅還為用, 孟深仲淺季當休, and 八專's 論尅不論遥 — are stated
there outright, having been recovered here by scoring against two references
that could not both be right. **Reading it first would have cost an afternoon
and saved three rounds.** The rule this phase set — no rule from memory, a
runnable reference before anything is written down — holds against
recollection and was applied too widely: a text that can be quoted outranks an
implementation that can be run, and the register wants the quotation anyway.
What the verse settles beyond the three is recorded where it belongs, in the
六壬 section of `docs/sources.md`, and each of those was measured before it was
believed. The 復等 tie-break turned out to have nothing to do: it was
implemented under all three readings of 「柔辰剛日」 and moves none of the 8 640
boards, because the order of the courses already gives what it asks for. The
返吟 no reference could check, the text checks exhaustively — six days named,
six days produced — so the `unverified` flag keeps its field and loses its
sentence, which had come to claim more doubt than there is. 無親 was a 課體
name nothing carries and is now 井欄, which the verse gives. And 「孟深仲淺季
當休」 read as evaluation order scores 98.19 % where this engine's grouping
scores 99.58 %, which is left standing as a divergence: a verse is not a
program, its clause order need not be its evaluation order, and two
implementations that agree with each other only 82.4 % of the time agree here.

Where this engine ends up differing deliberately, that is a divergence to
declare — possibly a parameter, as `yuan` became in phase 3 when the same
thing happened with 拆補.

**The tests carry their values in the open**, as every test here does:
`test/liuren.test.ts` asserts one board per rule and per 課體, and **every one
of them is a board both references agree on**. Nothing is asserted from the
17.6 % where they do not. Two structural checks stand beside them — the
general steps back one branch at each of the twelve 中氣, and the `guiren`
divergence moves the generals over every hour of a day while leaving the
transmissions identical — and one that lays all 17 280 boards to prove none
throws or comes back short.

> The corpus is generated outside the repo, as phase 3's comparisons were: a
> ~40-line script over `kinliuren`, whose output feeds a throwaway test. No
> fixture is committed — every shipped test in this project carries its
> expected values in the open, and a 17 280-row oracle is not a test, it is
> the thing tests are written *from*.

**Surfaces.** The `new-feature` procedure, unchanged, and the one addition
that was not small is done: `packages/plate` carries a **second drawing**. Not
a grid of nine — the 六壬 board is a *ring of twelve*, the branches round the
edge of a four-by-four with the four inner cells left for what the board
turned out to be, which is the arrangement every printed 課式 uses and puts the
south at the top like the compass on the other board. Each palace stacks three
things: the general above, the 天盤 branch large in the middle, the palace's
own branch faint underneath, because the ground is what a reader orients by
and not what they read. The lessons are written right to left and the
transmissions downwards.

**And a section of its own**, at `/[lang]/liuren`, second in the nav because
六壬 is the sibling of the board beside it and not an instrument the way the
pillars and the scan are. Laying is navigating here, as casting is for the
chart: the address holds the moment, an empty one is the present minute — a
board of this minute is what a 六壬 reader wants most often, where a chart of
birth for whoever opened the page would be a wrong answer — and the one
divergence offered, `guiren`, travels in it. The page prints, with the same
pair of pictures the chart draws: an `<img>` carries its colours in its
address, so the copy for paper is a second one drawn at `scheme=light` and
warmed the moment the board is laid.

**One thing was said twice and is now said once.** 八專, 別責 and 涉害 name the
shape of the board with the same words as the rule that found it, so a board
drawn by one of them carried `the eight concentrated` in the middle of the
picture and again underneath. Both the drawing and the page now drop the 課體
when it repeats the rule.

**And it is coloured, by the argument the palette already makes.** `palette.ts`
keeps `elementInk` for *the glyphs that are a phase* — «a stem is fire, not a
thing filed under fire, and the relation between the two stems standing in a
palace is the first thing anyone reads off a chart». That transfers to this
board and lands harder: a branch is its phase exactly as a stem is, and the
relation between what stands on a palace and what it stands on is not the
first thing read here, **it is the rule**. 賊剋 asks which of the two controls
the other, and written in the phases' own inks that question is answered
before a character is.

So the branches take the ink — on the ring, in the four lessons, in the three
transmissions — and each palace takes a **tint from its own branch**, which
never moves. The ring is a fixed ground and what changes hour to hour is the
ink standing on it, which is what the board *is*. On a 伏吟 board the two
agree in every cell, and the picture is what 伏吟 means.

Not a line of doctrine was added for it: `Branch.element` has been in
`ganzhi.ts` since phase 1. **What was left alone is the 十二天將.** They carry
five-phase assignments the tradition transmits, and colouring them would be
this file adding a table from memory with no entry in `docs/sources.md` — the
one thing that is never done here. They stay in the neutral ink until a source
is registered for them.

**And it is read in a European language, as the chart is.** Every name on the
board carries its word underneath — the twelve generals, and the branch that
has come to stand on each palace — because the picture is what travels and a
reader who does not read Chinese has to be able to read it. Two things bound
that. The palace's **own** branch takes no word: it is the ground, it never
moves, and the twelve of them in order are the frame rather than the news —
which is the same bargain the chart's compass ring strikes, hanzi against the
grid and words outside them. And the board grew from 720 to 900, the chart's
own size, because five registers to a cell need the room the chart already
gives six.

The first render of that was wrong in a way only looking could catch: `the six
harmonies` and `the celestial queen` wrap to two lines, and the second line
landed inside the branch glyph below. The rhythm of a cell is set by that
glyph — at 0.24 of the cell it rises about 0.19 above its own baseline — so
the room for a second line is reserved rather than hoped for.

Two things it had to learn that the first drawing already knew. Type is
**fitted** to the middle rather than set at a size and hoped for: the caption
arrives from a caller in a language this package does not know, and an English
gloss is three times the width of the hanzi it renders — the first render put
`the eight concentrated` straight through two palaces. And `plate` still
imports nothing from `core`, so the board's shape is redeclared beside the
chart's and `test/types.test.ts` proves both copies still take the real thing
without a cast.
