# Phase 23 — 紫微斗數, the third board of 命

**Done, and the gate it was to stand behind was paid in the planning of it.**
The sixth
instrument, the third of 命 beside 八字 and 七政四餘 — and the first board
here whose sky is no sky: nothing on it is a position, every star is a seat
in a count, and the whole construction is arithmetic on a birth. It clears
the standard the interlude above set, and clears it in the only way that
counts: 卷二 of 《紫微斗數全書》 states the procedure, nearly all of it in
verses quotable to the line — 安身命例 with its worked example and its 閏月
rule, 安十二宮例, the 五虎遁 and the 納音歌 that cut the 五行局, the
fourteen-star verse (紫微天機逆行旁…), a placement rule for every auxiliary
this board will carry, the 四化 verse, 大限, 小限, 童限, 命主 and 身主. The
board is not here to fill the catalogue; the text in hand states it.

**What the shelf held, and what paid the gate.** Three OCR files: the large
one carries 卷一 through 卷三; the two others are Chrome print-offs of the
Wikisource 卷一 and 卷三 and duplicate it. So 卷二 — the one procedural juan
— had a single witness, and precisely its tables were wrecked: the five
per-bureau grids placing 紫微 by day, the 安天府圖 and the seven-grade
brightness table were printed as boxed diagrams and the OCR scattered their
cells, while every verse and prose caption beside them survives. The
retrieval that was to gate the phase was instead done in the planning of
it. The three juan now sit on the shelf as wikitext pinned by `oldid`
(7913704 · 1963110 · 2268626), with rows in `docs/provenance.tsv`, and the
tables come back whole: the grids are preformatted diagrams whose day
numbers read down column pairs, and the 水二局, decoded cell for cell,
agrees with its own verse and with the received table — 初一 at 丑, two
days a palace, 三十 landing on 辰; the seven-grade table is a plain grid,
one row a branch, seven columns of single-character star names; the 天府圖
carries its mirror caption intact. The 大限 verse reads in the second copy
exactly as the OCR had it — 「陽男陰女從命前一宮起順行」, the first decade
in the palace *beside* 命宮 — so the adjacent-palace start is the text's
reading and not an artefact, and the starting ages are still nowhere a
sentence, carried only by the opening words of the bureau verses (二歲行,
三歲起, 四歲花… — induced, and to be marked as induced, the 參將 precedent).

**What the retrieval also settled is what the shelf is not.** None of the
three PDFs is a scan — two are prints of Wikisource itself, the third a
LibreOffice text PDF of undeclared descent — so the copies in hand are
digital transcriptions that may share one lineage, and no independent
witness of this text stands here. One exists in the world: the Ming 南陽堂
woodblock, 《新鐫希夷陳先生紫微斗數全書》 in seven juan, 潘希尹補輯,
scanned at shuge.org — a different recension under the same title, recorded
as the adjudicator to fetch if the copies ever disagree about something
that matters, and the only free place the 批命 material of the fuller
recensions could be read from. The recension Wikisource carries is three
juan and complete at three: there is no 卷四 to fetch, so the worked-chart
check goes without, which costs nothing that was promised.

**What it computes.** 命宮 and 身宮 by the stated count, the leap month
counted into the following month as the text prescribes (「閏正月生者要在
二月內起安身命」, generalised in place); the twelve palaces under the text's
own names — 妻妾, 奴僕, 官祿, not the modern 夫妻, 交友, 事業, and not
七政四餘's twelve, which `docs/sources.md` already says lend each other
nothing; the 五行局 by 五虎遁 and 納音; 紫微 by bureau and day of the lunar
month; the thirteen from 紫微 and from 天府, which mirrors it across 寅申;
every auxiliary the text places — 昌曲, 輔弼, 魁鉞 (the 甲戊庚牛羊 school,
which is this text's), 祿存 with 羊陀 about it, 火鈴 by year triplicity,
天馬, the 空劫 pair under the text's own names (it calls the backward one
天空 and knows no separate 地空), 傷使, 刑姚, 三台八座, 哭虛, 池閣, 台輔
封誥, 鸞喜, the 長生 and 博士 rings, 截路 and 旬中空亡 — and **no star it
does not**: 恩光天貴, 咸池, 孤辰寡宿 and the rest of the modern furniture
have no rule in this text and are absent with the absence written down. The
四化 by this text's table, its readings on the disputed stems recorded as
its own (戊: 貪陰弼機; 庚: 日武陰同; 壬: 梁紫府武). Brightness as the text
grades it. 命主 and 身主 — whose 子午 line names 火鈴 jointly, an ambiguity
the witness may settle and the register records either way. The 大限, 小限
and 童限, gender entering exactly as it enters bazi's luck cycles and those
blocks omitted without it, as bazi omits its. The lunar date arrives from
the engine's own calendar on 120°E; the hour is the birth's own clock, the
bazi convention, and no ephemeris enters at any point.

**What waits, and what stays out.** The flow-year apparatus — 流祿, 流羊陀,
喪門白虎, 斗君 — is placement the text states, but its subject is a year
laid on a person, and what it would be handed over *for* has not been
designed; the phase-20 ground, postponing rather than refusing. The 格局
catalogues of 卷一 (定富局, 定貴局…) are one-line definitions precise enough
to compute and could travel as `Pattern`s one day; not in this phase. The fu
poems, the per-palace star readings of 卷二 and the grading doctrine of 卷三
are prose-verdict doctrine of exactly the kind this engine does not import,
and stay out on the 果老星宗 ground. What *does* travel — 四化 names,
brightness grades — travels on the `Pattern.valence` ground: named and
weighed in the text, attributes of the configuration and never of somebody's
situation, identifiers and glyphs and no prose.

**The parameters, to move into § 3 when the board lands.** `leapMonth`:
`following` (the text) | `current` | `split`, only the first implemented.
`sihua`: `quanshu` alone — the other tables are schools nobody here has
read, and not values until a source arrives, the `tongzong` precedent.
`huoling`: `fixed` (year-triplicity seats, which is all this text states) |
`hour` (the widespread count-on-by-birth-hour, in no text on this shelf),
only the first implemented. `daxian`: `adjacent` (the text, both copies
verbatim) | `ming` (the widespread start in 命宮 itself, in no text on this
shelf), only the first implemented. `zishi`: the
text's passage on the split 子時 is corrupt in the OCR (上午刻 where 上五刻
must be meant) and doctrinally odd as printed; one implemented value, the
plain hour, with the passage quoted in the register as the reason. Every
unimplemented value refused with `OPTION_NOT_IMPLEMENTED`, never
substituted.

**Verification, and the two things it caught.** Tier 3 all the way down — no
published fact bears on any of it, and the surfaces say so. The tables were
pinned twice over before a reference was consulted. The five grids placing
紫微 were read cell by cell and held against the arithmetic the tradition
carries beside them, which is not in this book and is therefore a check on it
rather than a restatement: it reproduces **148 of the 150 printed cells** and
disagrees exactly where the page is short — one character in 木三局's 寅 cell,
one dropped column in 金四局's 亥. The seven-grade table counted itself:
eighteen stars in twelve branches and three in eight, those three being
祿存 with 擎羊 and 陀羅 about it, which can reach only eight; a misread grid
does not come out 12 and 8 by accident, and 卷三's coarse summaries agree with
all three eight-branch rows outright.

Then `iztro` (npm, MIT), read for its settings before a single comparison was
believed — `yearDivide: 'normal'`, which is this engine's default and the
reason the two are comparable — over **544 births**: 1930 to 2020, four hours
apiece, both sexes, every birth outside a leap month and on a +08:00 clock.
**Sixty-three quantities compared, fifty-seven agreeing in every chart**: the
bureau, both palaces, both masters, all fourteen main stars, every auxiliary
but four.

**It earned its keep before it produced a number.** The first run agreed on
77.6 % of the main stars, and every divergence fell on a board whose 命宮
landed on 子 or 丑 — the stems of the twelve palaces are dealt out walking the
ring forward from 寅, so the count is taken mod twelve *before* mod ten, and
子 is ten steps along rather than two steps back. Two steps back is a
different stem, a different 納音, a different bureau, and therefore a different
紫微 and a different everything. The engine was wrong, the reference found it,
and it is the phase-1 lesson arriving in a sixth art.

**The residue is six lines and each is this book saying something the modern
tables do not**: 火星 and 鈴星 off the hour (agreement 25.0 %, which is exactly
the quarter of the sample whose hour offset is zero — the figure identified the
divergence rather than confirming a guess); 天鉞 and 天魁 at 丙丁 and 辛;
解神 placed off the year rather than the month; 壬 giving 科 to 天府. A seventh
class was excluded rather than explained away, and it is not about this art at
all: a birth at 00:30 on a Chinese wartime or summer clock falls on the
previous day at 120°E, so the lunar date moves and 紫微 with it. The engine is
right by its own stated rule and the Chinese libraries take the civil date.

**A second edition arrived after the fact, and it corrected the engine
twice.** The gate this phase was to stand behind asked for a second witness;
what was available at the time was Wikisource alone, and the board shipped on
it with the divergences recorded rather than resolved. The witness turned up
later — 周宣屹's 簡體整理本 of the first three juan, set from an unnamed 古本
scanned page by page and, crucially, **printing the original character beside
each of its 166 emendations**. Collating it against what had shipped:

- **Two of the six recorded divergences were not divergences but errors of
  mine.** 天魁 and 天鉞 had been given 亥 and 戌 at 丙丁 off 「丙丁豬狗位」,
  and 寅 then 午 at 辛 off 「六辛逢虎馬」, and both were written up as this
  book standing against the modern tables. The second edition prints 豬**雞**
  (酉) and 逢**馬虎** (午, 寅), notes no emendation at either line, and the
  runnable reference computes the same two. Two independent readings against
  one, and the one belongs to the lineage documented as carrying several
  errors to the page. Corrected; agreement on both stars went from 69.1 % and
  91.2 % to **100 %**, and the comparison now stands at fifty-nine of
  sixty-three quantities agreeing in every chart.
- **Both repaired grid cells were printed whole**: 木三局's 寅 reads 初三 初五
  and 金四局's 亥 reads 初一 三十. The arithmetic had forced exactly those, and
  a witness now says the same. Its *own* grids are corrupt elsewhere and its
  labels shuffled — the grid headed 木三局 is in fact 火六局 — which is the
  useful part: two copies corrupt in different places narrow the truth where
  one cannot.
- **Four divergences stand, three of them now with two witnesses**: 火鈴 off
  the hour, 解神 off the year, 壬 giving 科 to 天府. And 庚 turns out to be the
  one line the two editions disagree about — 陰同 against 同陰 — which is the
  famous split at 庚 arriving as a textual variant rather than as a school's
  choice. Carried as a variant, recorded, not settled.
- **身主 is not rescued.** Both editions print the defective 火玲, so the
  ambiguity is the work's and not a copyist's, and the second witness that was
  expected to resolve it confirms instead that there is nothing to resolve it
  with. The withdrawal below stands on the same ground it stood on.

**What this says about the standard.** The board was built and shipped on one
witness, with every place it might be wrong written down as a place it might
be wrong. That is what made the collation cheap when the second witness
arrived: nothing had to be re-derived, only looked up. A divergence recorded
is a divergence that can be corrected in an afternoon; a divergence resolved
by preference is one nobody knows to go back to.

**And then the other transmission arrived, and moved nothing.** Two texts of
the 十八飛星 line came in together — the 《萬曆續道藏》 紫微斗數 in three juan
and the 《十八飛星策天紫微斗數全集》 reprinted in 《中國絕學》第五冊 — and they
are one work, the 論次序 running word for word the same in both, the second
legible where the first is damaged (安命例 whole, and 身宮 where the first
prints 申宮 twice). This is the witness the register had been listing as
missing, and having it is worth exactly three things and not a fourth.
**One**: the gap in `docs/sources.md` closes, and 「紫微斗數」 is written down
as the name of *two* boards rather than one — eighteen stars off the year
branch with no 五行局, no 天府, no mirrored file, and not one of the fourteen
on it. **Two**: 天刑 and 天姚 are the only placements the two transmissions
share and they agree character for character, which lifts those two off the
single-lineage footing the rest of this board stands on — the first tier-3
quantity here to gain a second lineage. **Three**: `daxian: 'ming'` is refused
*harder*. That opening is now traceable to a text, and the text states it over
a board where every span is a flat ten years and inherits no starting age,
while the variant asked for here keeps the bureau's opening age and moves only
the palace. Borrowing the palace and keeping the ages is the graft this plan
names elsewhere; a refusal that was resting on «no text says this» now rests on
«a text says it, about something else». The fourth thing it is *not* worth is a
second board: the procedure is stated well enough to compute, so it would clear
the gate, but a board needs an answer to what it is handed over for and that
has not been designed. Not refused. Not scheduled either.

**And the adjudicator turns out to be held.** The paragraph above that calls
the Ming 南陽堂 woodblock a thing to fetch was true when it was written and is
not true now: 《新鐫希夷陳先生紫微斗數全書》 in seven juan, from the
日本内閣文庫 copy by way of shuge.org, is on the shelf at 528 pages — image
only, no text layer, and a clean enough block to read by eye. It is the only
witness here that is neither a transcription nor descended from one, and it is
**unread**. That makes it the largest thing outstanding on this board, and the
register now carries the list it would settle: the defective 火玲 of 安身主,
the 庚 line of the 四化 where the editions read 陰同 against 同陰, 火鈴 off the
hour, 解神 off the year, 壬 giving 科 to 天府, the two repaired grid cells, and
the starting age of the 大限 that is induced rather than stated. Five hundred
pages of woodblock to adjudicate perhaps eight lines — a debt with a price on
it, entered as such rather than scheduled.

**And a manual arrived that names what the register had been refusing
anonymously.** Aloysius Han's *Zi Wei Dou Shu* (2014, self-published, English,
中州派) states no plotting rule at all and is otherwise the verdict doctrine
this project declines — but it prints its 四化 table whole and it names the
lineage behind the disputed stems. Its table agrees with 《全書》 at 戊 and at
庚, the second under 「庚日武阴同为首」, which is the reading kept here against
the other edition's 同陰; it parts at 壬 alone, giving 科 to 左輔. And it
reports that the branch departing from the received table at 戊, 庚 and 壬 is
**王亭之's**, resting on 『紫微星訣』, unpublished. So `sihua` keeps its single
value and the reason improves: the second table is still unread, but what
would overturn the refusal is now a findable book instead of a rumour. The
untraceable LibreOffice PDF was chased at the same time and came back
untraceable — recorded as that, which is worse than undeclared and more
useful.

**One induction was made and withdrawn, and the withdrawal is worth more than
the reading.** 身主's first line prints 火鈴, which is the name of no star,
where every other line names one. The compressed reading — 火 to 子, 鈴 to 午 —
was taken first on a structural argument: 安命主 pairs ten branches and leaves
子 and 午 alone with different stars. It rested on the shape of a line and
nothing else, and **no worked instance in this book carries a 身主**, so the
induction had no instances to be induced from — which parts it from 太乙's
參將 rather than likening it to it, since that one had fourteen agreeing
without exception. Against it: a reference agreeing with the table in eleven
branches of twelve and giving 火星 at 午. One reading with an argument and no
witness, one with a witness and no argument. The witness carried it, and the
other reading is in `docs/sources.md` so an edition printing the line whole
overturns it in one commit.

**A parameter the plan did not foresee.** `yearBoundary` — `lichun` or
`chunjie`, both implemented, `chunjie` the default. The book says nothing
either way, which is exactly why it is a parameter rather than a silence: the
board counts its month and day on the lunar calendar, so the year that opened
at 正月初一 is the coherent reckoning, and the year stem carries the 四化,
祿存, 天魁 and 天鉞 — a birth in the weeks between 正月初一 and 立春 lays out
two different boards and only one can be printed.

**The surfaces**, per the `new-feature` skill. `ziwei/` in core, a directory
as `bazi/` is, since it is the same kind of table arithmetic; its constants
join the pinyin test (and 天府 tiānfǔ arrives beside dunjia's 天輔 tiānfǔ —
same sound, different star, parted by table and by catalog namespace, since
they never share either). Both catalogs; `formatZiwei`; `qimen ziwei` with
`--gender` as bazi has and `--ask` refused as 命 refuses it. **A drawing of its own, and the layout is an argument rather than a
preference.** Twelve seats round the border of a four by four with the birth
in the middle, and emphatically **not** the ring of twelve: those palaces are
stretches of the ecliptic and these are seats in a count, so drawing them
round would assert the thing `docs/sources.md` spends a subsection denying.
What settles the grid is that **卷二 prints its own five tables of 紫微 in
exactly this figure** — twelve branches round a four by four, 寅 at the lower
left, the middle open for a caption — so the drawing reproduces the book's
diagram rather than inventing one. The branches are fixed and the palaces fall
where they land, which costs the reading order, since that order runs
backwards round the ring and a grid cannot show a direction; the order is
written into the cells instead, each carrying its palace's name. **The middle
is full, and that is what parts it from the 太乙 grid it resembles**: there
the emptiness is content (太乙不入中宮) and filling it would answer a question
the method refuses, where here a board of 命 has a subject and the subject
goes in the middle. A cell can hold ten names with a grade and a
transformation on each — denser than anything else drawn here — so the star
lines shrink with their count while the seat's own name and its ground never
do, those two being how a cell is found at all. `/api/ziwei` with `/text`,
`/plate` and `/prompt`, all `private` — a birth in every address.

**The board carried a second standing line for a while and no longer does.**
It said that nothing here is in the sky, and it was printed under the
transcript, under the section's table and on the face of the drawing — the
place a 七政四餘 board carries its two, on the ground that a picture travels
to where no page follows it. It came off because it is the one thing a reader
of *this* section can be assumed to know: they navigated to an art whose
whole name is on the page, and a caption restating what the section is reads
as a disclaimer on the board rather than a fact about it. The taiyi
precedent is the same one, arriving at the same answer for a different
reason. **What survives is the reader who is not a reader**: `prompt.ziwei.role`
opens on it at length and `compute_ziwei` says it in its description, because
a model handed twelve palaces with stars in them is precisely who reaches for
planets. The line that stayed on the sheet is the one nobody could supply for
themselves — which book the placements came from, and where its tables part
from the modern ones. The section at
`/[lang]/ziwei`, form-first as bazi's is, because an empty birth is
nobody's. The sixth seat in the consultation's select — `needs: 'birth'`,
`takesGender: true`, one row in the registry and no new kind, which is the
descriptor paying for itself a second time. `compute_ziwei`
in MCP with the warnings in its description. README, `docs/agent-prompt.md`,
and a 紫微斗數 section of `docs/sources.md` written as the rules land, not
after. In front of phase 17, for the reason 20 and 21 were.

**The prompt.** `mingClosing` widens to a third board, and `prompt.ziwei.*`
carries the one rule the other two never needed: **these stars are not
bodies.** Nothing on this board is in the sky; 紫微 is not a star a
telescope finds; a model that reaches for planets, aspects or transits is
inventing a different art, and the line that stops it is an instruction
governing everything below it, not a caption. The one-board rule bites
hardest beside 八字 — the same four pillars a second time, 四化 and 祿存
both hanging off the year stem, one fact printed twice for a model to count
as two.

**The phases arrived after the drawing did, and they are why the drawing is
coloured.** The first cut of the board was ink on paper, because a colour on
these sheets means a phase and no phase had been established for this art.
Then the question was put properly to 卷二, and it answers three times over:
it tabulates a phase for every star it places bar thirteen; it says what to do
with the table — 「星曜全明生剋制化之機，**次看落於何宮**，如廉貞屬火在寅宮，
乃木鄉能生廉貞之火」, the star weighed against the phase of the palace it fell
in, which is its branch's; and it closes with what is checked, 「金入火鄉，
火入水鄉，水入土鄉，土入木鄉，俱為受制」. The word for the palace's phase is
鄉, a country, which is a tint and not a legend. So the cells take their
branch's phase and the names take their own, and a reader meeting 太陰 in
water ink on an earth-tinted 辰 sees 「水入土鄉」 without looking anything up.
It is the argument the Qi Men chart colours its stems on, arriving in a second
art: a stem *is* its phase, and so is a star here.

**Three stars are left uncoloured on purpose and one gained a colour from the
second witness.** 天同屬水金, 貪狼屬水木 and 七殺屬火金 carry two phases
apiece, and a glyph has one colour, so those take none rather than the drawing
picking; the thirteen the list passes over take none for the other reason.
And 左輔 and 右弼 are inked at all only because 周宣屹's edition prints
「輔弼二星屬土」 where Wikisource drops the two characters — a collation
showing up as a colour on a sheet, which is the most concrete the difference
between two witnesses has been.

**Nothing computes the relation, and that is the line.** The sheet shows a
water star in an earth country. It does not say 受制, does not sum, does not
rank, and does not report. The text's own verdict word stays where the text's
verdicts stay.

**The board had to be made readable by somebody who does not read Chinese,
and that took three passes and one measurement each.** The first cut set the
cells in hanzi alone — which is what every other drawing here had stopped
doing, and `taiyi-svg` says so in its own comment: the word in the reader's
language goes under the name, «as it is in every other drawing here». This one
had quietly become the exception.

The first attempt glossed the eighteen 正曜 and came out too small to read.
The cause was a number rather than a dead end: the 太乙 grid sets its name at
0.14 of a cell and its word at 0.085, and this drawing had the word at 0.06 —
a third under the precedent, and shrinking further with crowding where 太乙's
never does, because that grid holds one name to a cell. **The second attempt
narrowed to one word a cell and set it at the precedent's ratio**, which is
what shipped.

**Which star gets the word was the reader's idea and turned out to be an
invariant.** «Only the first» sounded like a compromise and is not: the stars
are seated in placement order — 紫微's chain, 天府's chain, then the
auxiliaries — so wherever a seat holds one of the 十四主星, the first in its
list is one of them. Measured over 4,608 seats, no exceptions. A seat holding
none is a 空宮, read through the palace opposite, and it shows no word, which
is right.

**A modal was considered and refused, and the reason is the art rather than
the architecture.** This board is read by weighing a seat *against* others —
the palace opposite, the 三方四正 — so a panel that covers the board to show
one cell breaks the method it is meant to serve. The architecture argues the
same way: the drawing travels as an `<img>`, and making it clickable means
either inlining an SVG whose `<style>` declares `:root` into the page, or
giving up the print copy and the pasteable artefact.

**So the detail went where there is room for it.** The table under the
drawing lists twelve seats and had been showing every star, every ring and
every stage in bare glyphs — four columns of five. It now says all of them:
one star to a line, the word leading, the reading beside it, and the grade and
transformation attached to the star they qualify rather than gathered in a
legend. And the band under the drawing, which already said every name aloud,
now says what each one means as well — name, then sound, then meaning, which
is the order a reader needs them in. The band grew from eight lines to
twenty-one and the sheet by about two centimetres, which is what a picture
that travels alone costs.

**The section had invented a width, and giving it up widened the table too.**
The drawing was set at 56rem of this section's own, where every other board on
the site takes `--board` from `app.css` — which is precisely the fault the
七政四餘 section had already argued out of, in a comment that ends «what it
never argued for was a width no other board shares». Corrected, and two things
followed. The frame now takes the measure and the picture fills it rather than
the picture taking it inside a wider frame, because the twelve hit-areas are
positioned in per cent *of that box*: a frame wider than the image it holds
would lay them beside the seats instead of on them. And the table came with
it — **prose keeps the reading measure and the table takes the board's**,
since a caption is a sentence and this table is five columns each carrying a
word, a name and a reading, which at 44rem sat cramped under a drawing half
again as wide and read as something forgotten. Under it went the
`minmax(0, 1fr)` floor the same 七政四餘 comment names, so the table scrolls
inside its own frame on a narrow screen instead of taking the page sideways
with it.

**The band went into columns, and the reason is what a reader does with it.**
The four boards before this one name a dozen things apiece and a filled line
suits them: the eye sweeps it once. This one names fifty-seven, each with a
reading and now a word, and run together they were a wall — because the reader
is not sweeping that list, they are *looking one up*, and looking up wants a
straight edge to run down. Three columns is what the widest entry allows: the
band is about fifty-three ems across, so three give seventeen to an entry
against a median of sixteen.

**What happens to the ones that do not fit changed once, and the second answer
is the right one.** They were shrunk to their column, which is what `fitted`
is for — but 截路空亡 and 旬中空亡 were giving up a third of their size, and a
name set at two thirds beside its neighbours does not read as a long name, it
reads as a mistake. Now an entry that would have to go below **92 %** breaks
after its reading instead, and the word sits on a line of its own, indented
under the name it belongs to and at full size. The measurement said this would
cost little and it does: eleven entries of fifty-seven in English and eight in
Italian take a second line, and nothing on the sheet is set below 94 % of the
band's own size. Nothing needs both treatments — the longest half of any entry
is sixteen ems against a column of seventeen — so a broken entry is never
shrunk as well.

That took the columns off a shared row: each runs on its own cursor, since a
row advancing three columns together would have had one break push its
neighbours out of line. The columns are filled to an even number of *lines*
rather than of names, so they end level, and a half-line parts one group from
the next — without it the twelve seats ran straight on from the stars in
whichever column was deepest, as though they were more of them.

**The band and the grid are keyed to each other by a numeral, which is the
only way from a glyph to its meaning that does not go through the reading.**
A cell affords one word and the band holds the other fifty-six, so a reader
meeting 陀羅 in a seat had to know how it was said before they could find out
what it was. Now the same ringed number sits beside the name in the grid and
beside its entry in the band — one run from 1 to 57 across both groups,
because somebody holding 24 wants one place to look, not two lists each
starting at one. The numerals are drawn rather than typed: Unicode's circled
digits stop at fifty and come out full-width in a CJK font.

**It has a price and the price is measured.** The numeral takes about a third
of an em from every column, which doubled the entries that break onto a second
line — eleven of fifty-seven became twenty-two — and added a hundred and
sixteen pixels to the sheet. Tightening the ring to just over its own diameter
gave back most of the *shrinking* (fifteen entries to seven, none below 95 %)
but not the breaks; below that the ring sits on the glyph beside it, which
buys nothing.

**Where the numeral goes down further than the words do is deliberate.** The
gloss in a cell is dropped below about eight pixels because a word at that
size is a smear. A numeral is one or two digits and survives being small — and
the seat holding eleven names is exactly the seat where only one of them is
glossed and the key is the whole of what a reader has. A first cut used the
same floor for both and took the ladder away at the top; a test on an
eleven-name seat is what caught it.

**The picture and the table are bound to each other, and that is what a
panel would have been.** Pointing at a seat on the drawing lights the row that
says what is in it, and pointing at the row lights the seat — both stay
visible, which is the whole argument: this art reads a seat *against* the
others, so anything that covers the board to explain one cell puts out the
light it was read by. The twelve are transparent buttons laid over the
`<img>` from geometry `plate` exports as `ziweiSeatBoxes`, because an image
cannot be asked what is where and copying the layout constants into a Svelte
component would let the first change here break them in silence. They are
buttons rather than boxes so that a reader who does not use a mouse can reach
them, and clicking one takes the page to its row. **The return leg is a mark
beside the seat's name**, which scrolls the drawing back into view with that
cell lit.

It was the name *itself* first, on the reasoning that the name is the one
thing in a row that is the seat and that a column of arrows would be twelve
things to ignore. That was wrong in the way only looking catches: a word which
is also a control looks like neither, so the return was there and nobody could
see it. An arrow is a control at a glance, and up is the whole of what it
means. It is the first mark in `Icon.svelte` to stand without a word beside
it, and the exception is written into that file rather than taken quietly:
what makes it admissible is that the control is chrome and not content —
nothing is decided from it, the row already names the seat in the reader's
language, and the button carries that name as its accessible label. The mark
is bound to the reading with `nowrap`, because the column is narrow enough to
wrap and an arrow alone on a last line reads as something that fell off; and
the two columns with declared minimums gave back a rem and a half when the
seat's column grew, so the table still fits its measure at a desk width.

**Two things were learned building it, and the second is about testing.** The
first: the handlers were written with an `{@const}` inside an `{#if}` inside
the `{#each}`, and rebuilt as a keyed list of pairs computed up front — the
kind of construct where a closure and an attribute can end up reading
different items, which shows up as a highlight that works and highlights the
wrong thing. The second: **synthetic events do not reach Svelte 5's handlers
at all.** Dispatching `mouseenter` on a seat did nothing, which looked like a
bug and was not — a real hover worked the whole time. A round of "fixing"
went into moving focus handling onto the container before a real Tab press
proved the plain `onfocus` on the button had always worked, and it was put
back. Verify this layer with real input or do not verify it.

**What does not move.** The engine computes no verdict and ranks no palace;
which seat carries which theme of a life is the reader's and travels signed
(`prompt.ming.sections`); `nianming.ts` is untouched, and a birth still
enters no dunjia chart by this door.
