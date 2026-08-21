# What an agent needs to know

The contract for a model using this project, whether through the MCP server or
through the REST API. It is the document to read before writing a prompt that
calls any of it.

**There are two ways a board reaches a model, and this document is the contract
for one of them.** You are on the path where a board arrives as *data*: you
called a tool or an endpoint, you are holding a chart, and nothing came with it
to say what may be done with it. That is what this is for. The other path is a
prompt built by the engine — `prompt.ts` puts the board in a fence and the
rules around it, and the interface copies the result for somebody to paste
into a model that has no connection to any of this. **A model on that path has
already been told everything it needs and does not read this.** Which is also
why nothing here should be duplicated into a prompt, and why a rule that
belongs in both has to be worth its length twice.

## The one rule

**The engine reports arrangements, and the names and fortunes the tradition
attaches to them. It answers no question, and neither does anything else in
this repository.**

It will tell you that 休門 stands over the palace of Li, that the gate's phase
controls the palace's, that the configuration is called 門迫, and that 門迫 is
transmitted as 凶. That last is a property of the configuration — 迫 *means*
oppression, and the sources name and weigh it in one breath — not a verdict
the server reached about the hour, the chart, or the person.

Two mistakes follow from confusing the two, and both are yours to avoid:

- **Do not sum the fortunes.** Counting 吉 against 凶 and calling the result a
  score for the hour is an arithmetic the tradition does not have and the
  output does not license. There is no ranking here, and you must not build
  one and attribute it to the software.
- **Do not read a fortune as advice.** A palace marked 凶 is not "avoid this
  time". Which palace even bears on the question is the 用神, chosen by the
  reader for the question asked; the server does not choose it and does not
  know the question.

If the person asked for a reading, the reading is yours — and so is the
responsibility for it. Do not present one as though the software had produced
it.

## The four ways to be plausibly wrong

Each of these produces an answer that looks correct and is not, and none of
them can be caught downstream. The first three are things you would pass to a
tool; the fourth is something you would do with what came back, and it is the
one nobody thinks to guard.

### Inventing a place

There are dozens of places called Rome, and they sit in different timezones.
Guessing coordinates or a zone moves the hour pillar, and with it a quarter of
the chart.

Call `search_location` (or `GET /api/locations`), show the candidates, and let
the person choose. Then pass `location_id`. Never pass coordinates you did not
receive from somewhere.

### Inventing the current date

You do not know today's date. The server does.

For the present moment **omit `date` and `time` entirely**. Do not fill them
from your own sense of when "now" is.

### Inventing a birth time

An unknown birth time is not a reason to pick noon. It changes the hour pillar
outright and, near midnight, the day pillar too.

Ask. If the person does not know, say what that costs rather than choosing.

### Inventing what the question is about

Questions arrive short. *Will it go well* names no undertaking, no other
party, no place and no horizon, and a 用神 cannot be chosen from it — so
whatever palace you read is the one the sentence happened to suggest, and the
reading rests on it entirely. Nothing in the answer records that you picked
it, which is what makes this the hardest of the four to catch: the reading
looks exactly as confident as one made for a question somebody actually asked.

Ask instead. What the matter is really about, whom it concerns and whether
that is the person asking, whether it is already under way, whether a place or
a direction is part of it, by when they need to know. One or two of those —
whichever would change which palace you read — and not a questionnaire.

Two bounds on the asking. Nothing missing from the chart can be got this way:
no answer moves a palace, and a conversation is not a reason to recompute
anything. And if the person cannot say or would rather not, read what can be
read and name what you are missing, rather than filling it in.

## What to pass, and in what form

- **Dates are ISO**, `YYYY-MM-DD`, in every language. The format never follows
  the locale, because an address must mean one thing everywhere.
- **Times are local clock time**, exactly as they were read on a clock at the
  place — as written on the birth record. The conversion to Universal Time
  happens inside, with the historical rules of the zone. **Do not convert it
  yourself.** Those rules include China's five zones before 1949, its wartime
  clocks of 1942–45 and its summer time of 1986–91, none of which you should
  be applying by hand.
- **`lang`** changes the readable glosses and nothing else. The hanzi, the
  identifiers and the numbers are the same in every language: 休門 is the name
  of the gate, not its Chinese translation.

## The almanac line, and what it is not

The register it carries is `shensha`, and `xieji` is its only value: what
《協紀辨方書》 ratifies. Passing anything else is refused rather than answered
with this one. Say which register you are quoting if you quote a 神煞.

A chart and a 六壬 board both come back with the day's officer beside them —
建 jiàn, 除 chú, 滿 mǎn and the rest; the lodge of the day with its 七政 —
胃土 wèi, 鬼金 guǐ; and the god of the day with a 吉 or a 凶 — in a tool's
answer and over the REST
API. It is deliberately **absent from every prompt the engine builds**, and
from all four transcripts inside them: the officer is derived from two of the
pillars printed beside it, and one datum under two names inside a fence is read
as two. Three things to know before quoting it.

It is **not part of the board**. It is the page the tradition read a chart
*against*, and it is reported beside one for that reason. Merging the two into
one verdict is inventing a correspondence nobody transmitted.

It carries **its own ganzhi**, and that is not redundancy. The page turns on
120°E and on the date; the chart's day pillar turns on the chart's zone and, by
default, at 23:00. Most days the two agree. In the 子 hours and in the hours
before a 節 strikes they do not, and each is right about a different question.

And it is **a name, not a verdict** — with one exception that is a valence and
not advice. 危 is the officer called danger the way 死門 is the gate called
death. The day's *god* does carry a 吉 or a 凶, on the same footing a
configuration does: the source names and weighs the twelve in one line, six and
six, and it is an attribute of the god rather than of anybody's day. It is not
a rating of the date and it does not combine with anything. What the 協紀辨方書 says each officer suits — the
宜忌 — is not here and is not coming: that is advice, and this project computes
rather than advises. Do not supply it from memory.

## What the answers do not contain

- **A drawing carries no warnings.** `draw_qimen_chart` and
  `/api/qimen/plate` return a picture with the glyphs and the note that it is
  not a reading. It does not carry the note about an ambiguous local hour, or
  about the method. Call the drawing **after** the calculation and show both,
  or show the data alone.
- **Two methods are implemented, and they are different schools.** Charts are
  cast by 拆補 unless `method` chooses 置閏, whose ju follows the day's 符頭
  and can belong to a term the Sun has not reached yet — the answer says
  which. Never switch method between charts you are comparing, and never
  present one method's chart as the other's. 茅山 is refused with
  `METHOD_NOT_IMPLEMENTED` rather than silently substituted, because a chart
  cast by the wrong method looks right and is not; if someone asks for it,
  say it is not available.
- **拆補 itself splits in two, and `yuan` says which.** `term` counts the
  three fives from the instant the term began; `futou` reads them off the
  days, by where the day pillar stands in the fifteen-day cycle headed by 甲
  and 己. They disagree on most days, both are held by schools that call
  themselves 拆補, and the default is `term`. The same rule as above holds:
  do not switch it between charts you are comparing.
- **The centre is read somewhere else (寄宮).** It has no direction, no gate
  and no spirit, so the stem the ju puts there is read at its host — 坤 by
  default — and the host's palace says so with `lodged`. That palace therefore
  carries two stems on the earth plate, its own and the centre's, and both are
  in play there. Do not drop either, and do not move the centre's out of the
  centre: it is one stem read in two places, not two stems.
- **三奇得使 is not computed.** The sources consulted do not agree on which
  pairings count. Its absence is deliberate; do not fill the gap yourself.
- **A 太乙 board never says who is 主 and who is 客.** Identifying the host and
  the guest is the first interpretive act the system asks for, and it is the
  reader's — the same refusal as the 用神. The board gives both counts and both
  pairs of generals, weighted alike, and calls neither party. Do not assign
  them from the numbers: a larger 算 is not a winner, and the tradition's own
  rules for reading them turn on knowing which party is which first. The
  assignment is made from **what is being looked at** — a matter, a field of
  view with two sides in it — and it is made out loud. That is what
  `taiyi/prompt` commissions of a model told what is being looked at; told
  nothing, it says the assignment was not made. The engine's silence is not a
  gap to be closed by arithmetic, and it is not closed by inventing a pair of
  parties in order to have one either.
- **What each 太乙 condition *is* is printed; what it foretells is not.** 卷三
  states each of the seven three times — a trigger, a clause saying what the
  configuration is, then clauses saying what will befall the realm. The middle
  one travels beside the fortune (掩 is 掩襲刼殺之義, 囚 is 簒戮之義) and is the
  source's own words, not this engine's. Read it as a characterisation of the
  shape and never as a forecast. **對 is printed without one** because 卷三 gives
  it none — that is the text being quoted faithfully, not a field left empty.
- **The received doctrine of 太乙 is dynastic and is not here.** What the
  manuals hang on this board is epochal — which state falls, which year an army
  breaks, 陽九之災 and 百六之厄 — dated, falsifiable by nobody, and read as
  commentary on real events. The engine names positions and numbers and stops.
  Do not supply the layer it declines.
- **The per-palace readings of 卷二 are not here either.** That chapter gives
  each of the eight palaces a Tang province (分野) and a political omen —
  「三宮在艮，主青州。若始擊臨之，嬖寵進中宮，兵起」 — and neither is computed.
  The doctrine exists and is specific; it is declined, not missing. Do not
  supply it, and do not substitute the trigram's 易經 meaning, 奇門's 鬼門, or
  general five-phase reasoning for it: those are other systems and saying what
  a palace means here from them is the likeliest way to be fluent and wrong.
- **月計, 日計 and 時計 are not computed.** The text states all four registers
  and the engine computes the 年計. `ji` is the parameter that waits for the
  others; a board for a month or a day is not available and must not be
  improvised from the year's.
- **The errands live in a reference, not in the tool.** The `purposes`
  resource holds the one mapping the manuals do not dispute — the eight gates
  and what each is chosen for — and nothing past the gates: the stems, stars
  and spirits as significators vary by school, and the engine takes no
  position on them. `scan_moments` still takes the arrangement you are
  looking for, never the errand: read the resource, name the gate it gives
  you, and say that you did. If you supply a mapping beyond it, say plainly
  that it is yours and not the server's.
- **A scan ranks nothing.** There is no score in the answer and no order but
  time. A palace answering your question is a fact; a palace being a good
  place to be is a reading.
- **A Liu Ren board hands over its 三傳 already drawn, and that is not a
  reading.** The nine rules 九宗門 produced them from the four courses by
  procedure, and the board says which rule. Do not re-derive them, do not
  reorder them, do not substitute the rule you would have applied. But the
  用神 is still the reader's: **which of the four courses bears on what was
  asked, the board does not say.** The first two stand on the day stem, which
  is the person asking; the third and fourth on the day branch, which is the
  matter or the other party. Say which you read from.
- **A 課體 is a name, not a verdict.** 元首, 重審, 涉害 and the rest name the
  shape the board fell into, exactly as a configuration of the nine palaces
  does. Where 返吟 drew a board, the answer says the rule is unfalsified — no
  independent implementation covers its clause, where every other rule here
  was checked against two.
- **羅睺 is not Rahu here, and 計都 is not Ketu.** The board follows the
  astrologers' law, where 羅睺 is the **descending** node and 計都 the
  ascending — which is the reverse of the Indian convention and of the
  時憲曆's, and the reverse of what you will produce if you reason from Vedic
  astrology. `luohou` can flip it, and the answer says which was used. Read
  the name off the board, never off your own memory of what the name means.
- **A 紫微斗數 board is not a sky and must never be read as one.** 紫微 is not
  a star a telescope finds; none of the names on that board is a body, none
  has a position, none rises or sets. Twelve palaces on twelve branches with
  stars in them invites the reach for planets, and a reading built on that
  reach is fluent, confident and about a different art. Four of its tables
  also part from what modern software carries — 火星 and 鈴星 take a seat from
  the year's triplicity and the birth hour never enters, 天魁 and 天鉞 go to
  亥 and 戌 for 丙 and 丁, 解神 is placed off the birth year rather than the
  month, and 壬 gives 化科 to 天府 rather than 左輔. Those are 《紫微斗數全書》
  卷二 against later lineages, not errors. And a seat named 妻妾 is a **name
  and not an assignment**: which theme is read from which seat is the reader's
  act, said aloud as it is made.
- **The 七政四餘 board carries three remainders and not four.** 紫氣 is a
  table rather than a body, and a rule for it does exist. What does not is any
  way to check the rule, since checking means comparing against a position in
  the sky and 紫氣 has none; the two remainders in the same table that can be
  checked come out 0.25° and 69° wrong over the same span. So it is omitted
  rather than invented. If someone asks where 紫氣 is, the answer is that this
  engine will not say, not that it is somewhere in particular.
- **The 宿 boundaries are stars, not a table.** They are the 距星 placed at
  the instant of the chart, so they move with precession and match no printed
  table exactly. Do not attribute them to 《時憲曆》 or to 《授時曆》; those are
  declared options and both are refused. A degree of 入宿度 quoted here will
  differ a little from an almanac's, and the reason is not an error.
- **The twelve 人事宮 carry their transmitted names, and a reading from them
  is a choice to say.** 財帛 is wealth and 田宅 is land and house: the names
  say what the tradition reads at each seat, and reading from them is what
  they are printed for. What the engine does not do is choose — which seat
  carries which part of a reading is the reader's step, said as it is taken,
  and what a body standing in a seat means is doctrine the engine does not
  import: where you draw on a tradition for it, name the tradition.
- **A 八字 withholds the favourable element, and that omission is the whole of
  what it withholds.** The pillars arrive complete — the ten gods, the stems
  each branch conceals with the god each one is, the void branches, the 納音,
  the stage the day master stands at in every branch, the count of the five
  elements over the eight characters, and the 大運 where a direction was
  given. What is not there is 用神, 喜用神 or a named 格局: the schools divide
  on how they are chosen, and the engine chooses nothing. So reading the
  pillars is yours to do and the transcript is no obstacle to it; settling on
  an element is a further step, and one to name as yours together with the
  method it follows. Declaring the day master strong or weak from the printed
  count is that same step under another name — the count itself is arithmetic
  and arrives done.
- **One board goes to a model, never two of one instant.** A Qi Men chart and
  a Liu Ren board share the day pillar, the decade, the void branches and
  seven of the eight spirits: where they agree it is frequently one fact
  printed twice, and reading that as corroboration counts one datum as two.
  Compare them yourself if you must; do not hand a person a reading that
  merges them, and do not present their agreement as evidence. No transmitted
  rule combines the 三式 — they were read separately and then compared.
  **A 七政四餘 board is under the same rule and for a sharper reason**: its
  twelve 宮 are the ring the 月將 of a 六壬 board is seated on, so the Sun's
  palace on one is the general of the other. That is not two witnesses.
  **And a 八字 is under it most of all**, which is easy to miss because it
  looks like the mildest of the four: it *is* the four pillars, and the other
  three are laid from them. Beside any of the others it is not a second
  reading of one instant, it is the same instant's pillars printed again with
  the ten gods read off them. **A 紫微斗數 board is under it beside the 八字
  most of all**, and for the same reason turned around: it is built from that
  same birth, and the year stem carrying its 四化, 祿存, 天魁 and 天鉞 is the
  year stem carrying the other's gods. Five boards, one to a reading.

## How sure the numbers are

Not uniformly, and the difference matters when you are asked to justify one.

- **Solar terms, lunar calendar, four pillars** — checked against published
  astronomical tables through an independent implementation, over 1 926 dates
  from 1902 to 2098, agreeing on every one. These are as solid as the
  ephemerides.
- **The Qi Men layout** — checked against two open implementations, over 160
  charts and over 266, agreeing on every quantity compared once both were
  asked for the same ju. That means *consistent with common implementations*,
  not *verified*: no authority publishes Qi Men charts the way an observatory
  publishes solstices.
- **The configurations** (門迫, 擊刑, 入墓, 伏吟, 反吟, 五不遇時 …) — from
  Chinese-language sources, with each rule tested against the transmitted list
  it should reproduce. There is no runnable reference at all.
- **The Liu Ren board** — two levels, and they are not the same. What the
  board is *built* from — the 天地盤 by 月將加時, the 寄宮 table, the 四課 and
  which of them controls its ground — was compared against an implementation
  over **all 17 280 boards the input space holds**, agreeing on every one:
  that space is finite and nothing was sampled. The **selection among the
  candidates**, which is the 九宗門, is checked against *two* independent
  implementations that agree with each other on only 82 % of boards; where
  they do agree, this engine agrees with them on 99.7 %. One narrow clause of
  涉害 is unimplemented and 0.24 % of boards differ because of it. A board
  drawn by 返吟 carries a line saying its rule rests on something no reference
  covers — which now means *checked against a text and not against something
  that runs*: 《六壬大全》 names every day that rule can draw a board on, and
  this engine returns those and no others.
- **The 七政四餘 board** — a different kind of evidence from everything above
  it, and the difference is the point. The **positions** are the strongest
  numbers this project holds: Swiss Ephemeris, the same library the solar
  terms rest on, asked directly for the seven, for the mean node and for the
  mean lunar apogee. The **frame** — where each 宿 begins — has *no reference
  of any kind*, because nothing is being copied: the boundaries are the
  twenty-eight 距星 themselves, placed at the instant of the chart. What
  stands in for a reference is over-determination: all twenty-eight widths
  have a transmitted shape, the ring has to close on 360°, and 觜 is a
  one-degree needle that only the right pair of stars threads. The **twelve
  人事宮** are weaker still — one source and three derivations, set out in
  `docs/sources.md`. If you are asked where the lodge boundaries come from,
  the honest answer is "the stars, computed", not "the 時憲曆".
- **The 紫微斗數 board** — the only board here with **no tier-1 quantity in it
  at all**, and that is a fact about the art rather than a weakness of the
  computation. Nothing on it is astronomical: 紫微 is not a star, no name on
  the board has a position, and the whole construction is arithmetic on a
  lunar date, an hour branch and a year pillar. The only tier-1 input is the
  lunar calendar underneath it. Against that, the *transcription* is unusually
  well pinned: an arithmetic the tradition carries beside the printed tables
  reproduces 148 of their 150 cells and disagrees only at the two cells where
  the page has visibly dropped a character and a column; and a comparison
  against an independent implementation over 544 births agrees on 57 of 63
  quantities in every chart, the residue being six places where this book
  states something the modern tables do not. If you are asked how sure the
  board is, the honest answer is «the placements are as sure as a well-read
  text can make them, and none of it is a measurement».
- **The almanac's page** (建除十二神 and 二十八宿值日) — both agreeing with an
  independent implementation on **all 14 600 days of 2000 to 2039**. The
  officer's one awkward clause, the doubling at a 節, is stated outright by
  《協紀辨方書》; the lodge's epoch is additionally pinned by the fact that
  twenty-eight is four weeks, so each lodge keeps a fixed weekday and its 七政
  names it. The **十二神** agree over 7 300 days, and their rule is one the
  協紀 derived itself after rejecting the two it inherited. Of the almanac's
  twenty-eight 神煞, **three have no runnable reference of any kind** — no
  implementation consulted carries 兵禁, 四絕 or 四離 — though the last two rest
  on solar terms this project verifies to the second, where 兵禁 rests on a
  table nothing checks. 地囊 has the weakest real agreement at 94.9 %. Both are in `docs/sources.md`; say so if you quote either. The **six 年神** are
  the exception in this layer: they have no runnable reference at all, and rest
  on 《協紀辨方書》卷三 with the source's own worked lists reproduced in tests.
  Say so if you quote a bearing.

- **The 太乙 board** — the weakest evidence in the engine, and the only kind
  available: **nothing open computes this board**, and the closed programs that
  do disagree with each other. So it is checked against 《太乙金鏡式經》 itself
  — the 立成 of seventy-two rows that 卷三 prints twice over, the boards 卷一,
  卷六 and 卷九 work out in words, and the twenty-six datable 甲子 years 卷二
  lists against the 紀 each enters. That is the tradition auditing itself, not
  an independent implementation. It is broad — 850 of 864 printed cells
  reproduce exactly, and the fourteen that do not are mostly settled by the
  text against itself — but say what it is if you are asked. Two things about
  this board that a reader will otherwise get wrong: its **nine palaces are
  numbered one seat off the Luoshu** (一宮 is the north-west here, the north in
  a Qi Men chart), and the 上元積年 is stated three times in the text with
  figures that differ by millions and agree modulo 360, which is the only
  residue the year board reads.

If you are asked how the software knows something, say which of these three it
is. Do not describe the third as though it were the first.

**Two of these lines are not only here**, and the exception says where the
boundary runs. The direction the twelve 人事宮 are numbered in, and the frame
the 宿 are cut by, travel *inside* the 七政四餘 prompt as well — because that
prompt already spends a paragraph on how the twelve seats are read, and a
bound on a quantity that arrives with the instruction governing it is part of
that instruction. Everything else on this
page stays on this page. The test is whether striking the line would leave an
instruction somebody could follow confidently and wrongly: a caution attached
to a rule passes it, a general account of how this engine knows things does
not. You are reading the general account, which is why it is here and not in a
prompt — it was in one once, and what a model did with it was recite it.

## The tools, in the order they are usually needed

| | |
|---|---|
| `search_location` | a name → candidates with coordinates and zone. Always first when you have a name |
| `compute_qimen_chart` | the nine palaces, the plates, the configurations, how each star and gate stands to its palace, and both post horses — 日馬 and 時馬, never one of the two. With `born`, also a 年命: the birth placed *inside* this chart |
| `compute_bazi` | the four pillars, read out. `gender` only affects the luck cycles |
| `compute_liuren` | the 大六壬 board — the other 式, laid on the same instant and answering the same shape of question. Lay it for the moment of the asking, never for a birth |
| `compute_ziwei` | the 紫微斗數 board — the twelve seats counted from a birth, with 紫微 and the thirteen that hang off it, the auxiliaries, the 四化, the brightness grades, the two masters and the limits. **Nothing on it is in the sky**: do not read planets, aspects or transits into it |
| `compute_qizheng` | the 七政四餘 board — the seven governors and three remainders on the sky, each said twice over: the 宿 with its 入宿度 and the 宮 with its 宮度. A 命 art, so it is laid for a birth as readily as for a question, and it borrows nothing from the other two boards |
| `compute_taiyi` | the 太乙 board of a year — 年計. Takes a year and nothing else: no place, no hour, nobody's birth. Never says who is 主 and who is 客, and its palace numbers are not a Qi Men chart's |
| `draw_qimen_chart` | the picture, framed by the eight directions, with the configurations and their fortunes listed under the grid. After the calculation, never instead of it |
| `draw_liuren` | the Liu Ren board as a picture: a ring of twelve, the lessons written right to left, the transmissions read downwards. After the calculation, never instead of it |
| `solar_terms` | the twenty-four terms of a year, with exact instants |
| `lunar_date` | the lunisolar date. Reckoned on 120°E by convention, not on the zone you pass |
| `scan_moments` | every chart over an interval, narrowed to what you name — including, with `born`, to the palaces one person's 本命 stands on. For **choosing** a time rather than reading one |

Reference material — the nine palaces, the gates and stars and spirits, the
terms, and the errands each gate is chosen for — is available as MCP
resources. Read it when you have to explain or justify a name, not when you
are merely reporting one. The errands are the exception: read them *before*
`scan_moments` when what you were handed is an errand rather than an
arrangement.

## The REST equivalent

Every tool but `lunar_date` has an endpoint — the lunisolar date is the CLI's
`qimen calendar` and nothing over HTTP — and tool and endpoint read the same
query string, so a chart is a shareable address.

```
GET /api/locations?q=Beijing&lang=en
GET /api/locations?id=1816670&lang=en          # the way back from an address
GET /api/qimen?date=2024-06-15&time=14:00&locationId=1816670
GET /api/bazi?date=1968-03-12&time=14:30&locationId=3169070&gender=male
GET /api/bazi/text?date=1968-03-12&time=14:30&locationId=3169070&gender=male
GET /api/bazi/prompt?date=1968-03-12&time=14:30&locationId=3169070&gender=male
GET /api/liuren?date=2024-06-15&time=14:00&locationId=1816670
GET /api/liuren/plate?date=2024-06-15&time=14:00&locationId=1816670
GET /api/liuren/text?date=2024-06-15&time=14:00&locationId=1816670
GET /api/liuren/prompt?date=2024-06-15&time=14:00&locationId=1816670&asked=true
GET /api/taiyi?year=2026
GET /api/taiyi/text?year=2026&lang=en
GET /api/taiyi/plate?year=2026
GET /api/taiyi/prompt?year=2026&lang=en&about=true
GET /api/qizheng?date=1968-03-12&time=14:30&locationId=3169070
GET /api/qizheng/text?date=1968-03-12&time=14:30&locationId=3169070
GET /api/qizheng/prompt?date=1968-03-12&time=14:30&locationId=3169070
GET /api/terms?year=2024&timezone=Asia/Shanghai
GET /api/qimen/plate?date=2024-06-15&time=14:00&locationId=1816670
GET /api/moments?from=2026-09-01&to=2026-09-08&locationId=3169070&gate=kaimen&towards=se,s
GET /api/qimen/text?date=2024-06-15&time=14:00&locationId=1816670
GET /api/qimen/prompt?date=2024-06-15&time=14:00&locationId=1816670&asked=true
GET /api/qimen?date=2024-06-15&time=14:00&locationId=1816670&born=1968-03-12&gender=female
GET /api/qimen?date=2024-06-15&time=14:00&latitude=39.9075&longitude=116.3972&timezone=Asia/Shanghai
GET /api/qimen?date=2024-06-15&time=14:00&locationId=1816670&latitude=39.8000&longitude=116.6000
```

A place is a `locationId`, or a `latitude` and a `longitude` with a
`timezone`, or a `locationId` **refined by** coordinates — the last of those
replaces the pair GeoNames holds and keeps the named place's zone, which is
what somebody who knows the hamlet and not the town is saying. Half a pair is
refused rather than half-read, and `timezone` beside a `locationId` is ignored,
since the place already answered it. Refine only with coordinates you were
given: a pair invented to sharpen a town you were told the name of is a chart
of somewhere nobody named.

`chart/text` and `chart/prompt` answer `text/plain` rather than JSON. `text`
is the chart said in words, exactly as the CLI prints it. `prompt` is that
chart in a fence with its own rules around it, addressed to a model with no
connection to any of this — what the interface copies to a clipboard for
somebody to paste elsewhere.

It is **not this document condensed**, and that distinction is worth keeping
straight now that there is a prompt for each board. Each is written for the
board it carries and says what that board in particular invites a reader to
get wrong: a chart withholds the 用神, a 六壬 board hands over transmissions
that were drawn by procedure, a 七政四餘 board arrives with its twelve seats
already named, a 八字 withholds the favourable element, and a 太乙 board is a
figure of a year that a reader will otherwise read as a forecast of their own.
**You do not need any of them**: you are holding the data, and you have read
this. They exist for the model that is not.

`asked` is a yes or a no and never the question itself. With it the answer
ends on the line that introduces a question, for the caller to append; without
it the prompt says plainly that none was asked. A question is somebody's own,
and one in a query string is one written into every log along the way.

**Only the two boards of 卜 answer to it.** `bazi/prompt`, `qizheng/prompt`
and `taiyi/prompt` have no `asked`, and it is not an omission. The two boards of
命 are laid on a birth and nothing is asked of them, so there is no line for a
question to go on: the themes a reading traverses are commissioned in the prompt
itself, and what the person wants to look at next belongs to the conversation
that follows. The board of 天 is laid on a year and there is **nobody to ask on
behalf of** — the reader is not on that board, and a question is how they get
written into a figure they are not in. The CLI refuses `--ask` on all three
commands rather than dropping it, with a message of its own for the year; over
HTTP the parameter simply has nothing to reach, and the answer is the same
either way.

**`about` is what a question is not, and only `taiyi/prompt` takes it.** A
matter names what is being *looked at* — a field of view with two sides in it —
where a question asks what will happen. It is the frame the assignment of 主 and
客 has to be made for, and without it a reading of this board can only describe
the figure. It obeys the same rule as `asked`: a yes or a no, never the text, the
prompt ending on the line that introduces it and the caller appending what must
not travel.

`taiyi/prompt` is also the one prompt endpoint that answers
`cache-control: public`, and that follows from the same fact rather than
excepting it: with no question and no birth in the query, and the matter
withheld by the caller exactly as a question is, nothing in that response is
anybody's — so there is nothing to keep out of a shared key. A boolean varies the
response; the matter would have varied the key. The board endpoint under it is
`public` for the same reason.

## 年命 — where a person stands in a chart of a moment

`born=1968-03-12`, on the chart tools and on the scan, places a birth **inside**
the chart that was cast: 本命, the year pillar of that birth, and — with
`gender`, read for the direction of the count and nothing else — 行年, the
year being lived. Each comes back as the palace it falls in on either plate,
the palace its branch moors in, and its 納音 image weighed against that
ground.

This is the classical direction and the reverse of a natal chart. 《遁甲演義》
(程道生, Ming, in the 四庫全書) holds that a reading which leaves the two out
has missed the fine part of the method, and has the person's own year ride a
palace where a good star and gate stand in strength — which on a scan is what
`born` narrows to, with the rest of the criteria saying what makes a palace
worth standing on.

**The chart does not move for it, and neither should your reading.** What the
software reports is where two pairs fell. 生旺 and 囚死 are the text's own
weighing and need a question to have been asked; the strengths, the relations
and the configurations are already in the chart, and they are what a reader
weighs with.

**No palace here stands for a part of a life, and if you are asked for a natal
reading that refusal is yours to keep too.** A chart cast on a birth and read
as a chart of a life is a modern and minority application; the mapping of
palaces onto career, marriage or health is not in the engine, not in the
resources, and supplying one from memory would attribute to this software a
doctrine it declines to hold — for the same reason 三奇得使 is absent. There is
one classical text that does map a life, 《奇門遁甲統宗》卷十二, and it maps it
through the 六親 of the stems rather than through the palaces; `docs/sources.md`
records it and says why nothing imports it. If you use a mapping of your own,
say plainly that it is yours and whose it is.

Failures come back with a `code`, a `messageKey` and `params` rather than a
sentence to parse:

```json
{
  "code": "INVALID_DATE",
  "messageKey": "core.error.INVALID_DATE",
  "params": { "date": "15/06/2024" },
  "message": "Date \"15/06/2024\" is not valid: expected the format YYYY-MM-DD."
}
```
