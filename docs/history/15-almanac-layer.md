# Phase 15 — The almanac layer

**Done**, and it delivered more than the three blocks it named. What it set out
to add was 建除十二神, 二十八宿值日 and the 神煞 「but only some」; what
`almanac.ts` holds is those three, the 十二神 of 卷七 and twenty-six 年神 — some
seventy quantities, each with a citation, a comparison where one was possible,
and an entry in `docs/sources.md` written the day it landed. It reaches the CLI,
the REST answers, four MCP tools and both board pages, and deliberately not the
prompt's fence or `packages/plate`.

**And the page said nothing about which layer it was showing.** The almanac
arrived under the pillars as a run of glyphs — 定 dìng beside 庚戌 — with no
word to say it was a second art rather than another field of the first, which
is the confusion this project refuses everywhere else and was sitting in the
markup. Meanwhile the *calendar* the chart is cast from — the term, the jie, the
lunar date — was not on the page at all, though the CLI has printed all three
since phase 4. `CalendarAndAlmanac.svelte` names the two groups apart and says
which relation each has to the board: the calendar is what a chart was cast
**from**, the almanac is what it was read **beside**. One component for both
boards, since there were two copies of it drifting.

**The web lagged the engine by two blocks and was caught by being asked.** The
page rendered the officer, the lodge, the day's god and the 年神 and stopped
there, while the CLI, the JSON and the MCP tools already carried the 四德 and
the 神煞 — a feature that had crossed five surfaces of six and looked finished
from every one of them. Both components now show all of it. The lesson is the
`new-feature` skill's own and it needed relearning: a surface left behind does
not announce itself, because everything that *is* there works.

**And the pillars page was the sixth surface, but only for half the layer.**
Asked whether the almanac belonged in `/[lang]/bazi` too, the answer came back
split, and the split is the finding. The **calendar** belonged there and was
missing — more plainly than anywhere else, because on the chart page the term
decides the ju while here the 節 decides one of the four columns being read: a
birth three hours from 立秋 stood on a boundary and the page gave no sign of
it. The **almanac** does not belong there, and the three reasons are not the
ones the two board pages face. 曆注 is 擇日, a day weighed as the occasion of
an undertaking, and a birth is not an undertaking — no source reads this page
against a nativity, so putting it there is a graft, which is what the modern
natal Qi Men is made of. 天德, 月德, 天馬, 劫煞, 三合, 六合, 太陰, 白虎 and 大耗
are all names the 八字 tradition also uses and derives otherwise, so beside
four pillars a reader folds two arts into one — worse than a datum counted
twice, which is two arts sharing glyphs. And phase 14's double-counting
argument holds here by eye rather than by inference: 建除 comes from the month
and day branches printed a hand's width above it. So `CalendarAndAlmanac`
takes an `almanac` prop and the pillars page passes `false`.

**The CLI had already decided it, the other way and by default.** `qimen bazi`
printed the officer's line because `formatMoment` prints it unless told not
to, and the one caller that told it not to was the prompt. It is the second
now. The JSON still carries the layer under `bazi --json`, and the difference
is the one the whole layer turns on: a caller reading JSON asked for it, a
reader looking at a transcript is being shown it.

**What it does not hold is declared rather than missing**, and the phase's own
「but only some」 is where that was allowed for: 往亡, 氣往亡, 反支, 上朔 and the
four of 卷六's nine it does not enumerate are unread; 母倉 waits on the 土旺用事
stretches this engine does not compute; 月忌日 waits on a lunar date, which is
the one expensive thing a page would have to buy; 日遊神 has an empty body in
the transcription consulted. None of them blocks anything, and each is in the
register with its reason.

It was the cheapest of the three and the one a reader of
dunjia would notice missing, because dunjia already chooses hours and
directions and the almanac is what that choice was always read beside:
建除十二神, 二十八宿值日, and the 神煞 — but only some. It is also the one
of the three that adds no board: nothing is laid and nothing is asked, and
an almanac is the same page for everybody who opens it on the same day. It
is a *layer*, as its name has said all along, and the difference does work
twice below — it keeps the layer out of the consultation, and it decides
which day the page describes.

**Three blocks, and their costs are not alike**: a day's work, a number, and
the phase.

- **建除十二神** is arithmetic on two branches the engine has carried since
  phase 2: 建 where the day branch meets the month branch, the other eleven
  in order behind it. The rule was run against the reference before it was
  written down here: 2026-08-04 to -11 gives 平定執 · 執破危成收, the month
  changing at 立秋 between the doubled 執 — and the famous doubling is not a
  second rule but the month branch stepping on a day the day branch also
  steps.
- **二十八宿值日** is a continuous count of days, and its whole content is
  one number, the epoch. The epoch is over-determined in a way almost
  nothing in this project is: twenty-eight is four weeks, so each lodge
  rides a fixed weekday, and the tradition wrote the check into the names —
  the planet in 鬼金羊 is 金, and 2026-08-14, a Friday, is 鬼 in the
  reference, which holds the lock (日 on Sunday through 土 on Saturday) on
  every one of four hundred sampled days. The count crosses the 節 unbroken
  where 建除 doubles; the two blocks disagree about what a boundary is, and
  both are right. **And the 協紀 will not warrant it** — see below, because
  that is the finding that reshaped this phase.
- **The 神煞 are the phase**, and the rest of this section is mostly about
  bounding them.

**The source is why this phase exists at all.** 《欽定協紀辨方書》, 三十六卷,
imperially commissioned in 乾隆四年 (1739) and in the 四庫全書 — this document
said 1741, which is the date usually given for its presentation rather than its
commission, and the two should not be conflated again. It is the one work of
its kind that **adjudicates between conflicting folk rules and says which it
rejects and why**: 卷三十六 is 辨訛, a whole chapter of rejections. For a
project whose register of numbers is `docs/sources.md`, a source that shows its
own reasoning is worth more than three that agree. And it is a book of 選擇 —
choosing days and bearings is what it is *for* — which is why it can bound the
phase twice, below.

**It was read before any of this was written, and it moved three things.**
That is the order phase 13 learned the hard way and paid for; here it was
followed first, and the reading is what the rest of this section reports.

**The 神煞 are the risk, and the bound is two cuts, not one.** There are
hundreds of them and they diverge by lineage. The first cut is the source's:
only those the 協紀 itself ratifies are defensible here; the rest are left
out and said to be left out, as 三奇得使 was. **That register has now been
counted rather than guessed at: 義例, 卷三 to 卷八, carries about a hundred
entries**, each with its derivation and the compilers' argument for it. A
hundred names is four hundred catalog lines in two languages, which is why the
first cut alone does not bound this phase.

The second cut is the layer's purpose, and it is what makes the first
affordable: dunjia chooses hours and directions, so what enters is what the
協紀 attaches to **the quality of the day and the bearing of a direction** —
not the full register it ratifies for weddings, burials and the digging of
wells. **The source splits its own register on very nearly that line**, which
is why the cut is a reading of it rather than something imposed on it: the
年神 govern bearings — 大將軍, 豹尾, 歲破, 太陰, 白虎 — and the 月神 govern
days. And 卷四 states a consolidation that shrinks the block again before it
is written: 「凡月神之以十二辰起例者……今一以建除統之」 — every month-god
reckoned round the twelve branches is 建除 under another name, and the
compilers say so explicitly, 「今為類聚之而悉統於建除」. A good part of what
looks like a hundred separate quantities is one quantity with a hundred names,
which is the opposite of the problem this phase feared. The 時家 hour-gods stay out with
that register: the page's grain is the day, and the hour already has a whole
art standing on it. The arithmetic behind the second cut is the catalog's:
every name is hanzi, a toned pinyin and a gloss in two languages, so the
twelve and the twenty-eight arrive bounded by definition and every 神煞
beyond them is four catalog lines that have to be worth writing — the
largest set of names any phase has added, if it is let grow. The set ships
as `shensha` in § 3, one implemented value from day one: lineages diverge
here the way schools diverge in dunjia, and a second set must be able to
arrive without breaking a shared URL.

**And the source refuses one of the three blocks, which is the finding this
phase turned on.** 二十八宿值日 was listed above as the cheap middle block, on
the assumption that the 協紀 stood behind it. It does not. 卷一 records that
the compilers went looking for a Chinese basis for the lodge-day assignment and
found none — 「徧閱羣書莫可考究，及見西域《吉凶時日善惡宿曜經》乃得其說。蓋
彼國不知十干十二支之名而用二十八宿以紀日」 — and 卷三十六 辨訛 disposes of
it outright: 「二十八宿選擇之法來自西域……與中國風俗逈然不同……**並不可從**」.

**A source chosen because it rejects things rejected something.** The honest
consequence is not to drop the block but to stop claiming the wrong warrant
for it, and the distinction the 協紀 itself draws is the one this engine
already lives by. What 辨訛 refuses is the **宜忌** — the lodges as grounds for
choosing a day, the 密日, the thirteen lodges said to suit the cutting of
cloth. This engine was never going to ship a 宜忌; that was settled two
sections above, for every 神煞 at once. What remains is the **count**, which is
a calendrical artefact every printed almanac carries, which the 協紀 describes
accurately even while declining to follow it, and which is checkable against
two implementations and against the weekday lock. So the lodge ships as a
count and a name, with the source's refusal of its doctrine recorded beside it
rather than hidden — and the epoch, being what the block *is*, takes its
warrant from the references and from the lock, never from the 協紀.

**A runnable reference exists and is already in the house.**
`lunar-javascript` — the witness every pillar was verified against in phases
1 and 2 — computes the whole layer per civil date: the 值星, the lodge, and
the day's lists of 吉神 and 凶煞. So this layer can be compared before it is
written, which is a luxury phase 13 had to go abroad for. Two reservations,
recorded before use rather than after:

- **It emits simplified characters** — the 值星 arrive as 开 and 闭, 天倉 as
  天仓 — the defect that makes `kinqimen` throw on five terms of twenty-four
  (§ 5). The comparison normalises before comparing, and none of its strings
  enter the engine.
- **It encodes a modern 通書, not the 協紀.** Its 神煞 lists are somebody's
  compilation. Where the two disagree, the 協紀 adjudicates — that is what
  it is here for — and the disagreement goes into `docs/sources.md`.
  Agreement with it weighs what § 5 says agreement with `qimen-dunjia`
  weighs: consistent with a common implementation, never verified.

**A page, not an instant — decided here, because this is where the layer
could have gone wrong quietly.** 值日 names its own grain: the layer
describes a civil day, and the day is reckoned as the lunar date is — on
120°E, the same instant carrying the same page in Rome and in Beijing,
`dayBoundary` and `trueSolarTime` never consulted. The alternative was
considered and set aside: reading the chart's pillars instead would move the
值星 at 23:00 under `zishi` and hold the old month until the 節's own hour —
an instant-grain 建除 no source consulted states, where the page's grain is
stated by every page: the reference gives the whole 節 day to the new month,
執執 across 立秋 and 閉閉 across 白露 alike. What the decision costs is
already priced in: every chart prints a 120°E lunar date beside a
zone-following day pillar, and the layer stands on the lunar date's side of
that line. On most days the page's ganzhi and the chart's day pillar agree;
in the hours where they part — the 子 hours, the hours before a 節 strikes —
the pillars describe the chart and the page describes the day, each says
which it is, and a test pins both.

**The 協紀 was asked, and it states the day grain in one clause.** 卷四
建除十二神, quoting the 厯書: 「厯家以建除滿平定執破危成收開閉凡十二日周而
復始，觀所值以定吉凶。**每月交節則疊兩值日**。其法從月建上起建，與斗杓所指
相應。如正月建寅則寅日起建，順行十二辰是也」. The doubling at the 交節 is
stated outright, and it is stated as a doubled **值日** — a rule that doubles a
*day* cannot be a rule about an instant, because an instant-grained 建除 would
move the god mid-day and double nothing. The same sentence gives the
construction: 建 opens on the day whose branch is the month's, and the twelve
run forward. This is what was measured against `lunar-javascript` before the
text was found — 執執 across 立秋, 閉閉 across 白露 — so the reference, the
text and the plan agree, and the paragraph above stands as written.

**Valence travels, advice does not, and this layer is where the two arrive
welded together.** A 神煞's name is frequently its verdict — 天德 is a
blessing and 月破 is a breaking, named and weighed in one line of the source
— and that is `Pattern`'s valence over again: an attribute of the
configuration, carried as identifier, hanzi and glyph, never as prose. But
the 協紀 hands nearly every one down *inside* its 宜忌 — this day suits,
this day forbids — and a 宜忌 is advice: ordering days, dating an act,
telling somebody what to do, the engine's own stated stop. The line falls
where `purposes.ts` already drew it for the gates. What a gate is chosen
*for* ships there on three concordant witnesses, and it ships expanding into
criteria a caller could have written by hand, shown and editable, never a
filter applied out of sight — so if the almanac ever feeds the scan, that is
the shape it feeds it in: a criterion somebody chose, not a day the engine
blessed. What never ships is the register itself, 宜嫁娶 and 忌動土 day by
day — a catalogue of undertakings longer than eight is exactly what
`purposes.ts` says the eight protect against, and a surface printing
«suitable for travel» under a date would be this project advising in a
caption what it declines to compute in code.

**It is not an instrument, and the consultation rules catch it from both
sides.** Nothing is asked of an almanac, so there is nothing for the
question to come before: it takes no place in the instrument field. And it
does not enter the fence, by phase 14's own argument: the 值星 is a function
of the month and day branch the board already shows, so a model reading 平
beside the pillars that yield 平 counts one datum twice and calls it
corroboration. Where the layer lives is **the sections that are addresses**
— the day's line beside the pillars on the chart and 六壬 pages, where
nothing is being asked — and, when it earns it, the scan: 擇日 is what the
協紀 is for, and choosing a time is the one place this engine already lets a
purpose expand into criteria that can be seen.

**And one debt is paid before the layer starts.** `docs/sources.md` has no
六壬 section: the 月將 table, the 寄宮, the 九宗門 and their precedence
stand in this file and in `liuren.ts`'s comments, not in the register
CLAUDE.md calls mandatory. A third layer's tables do not land in a register
the second board never entered.

**The layer's one option exists, and it is the one § 3 named.** `shensha`
reaches `ChartOptions`, the URL, the MCP schema and the CLI, with `xieji` its
only value and anything else refused. It was very nearly left out: the layer
was written optionless on the argument that a page has no options, and that
argument is right about `dayBoundary` and `trueSolarTime` — which say how an
instant is read — and wrong about this one, which says which book was copied.
§ 3's rule held: a parameter added after the addresses exist breaks them all.

**建除十二神, 二十八宿值日, the 十二神, twenty-six 年神, the 四德 and twenty-eight 神煞 are built; the rest of 卷三 is not.** `almanac.ts`, `almanacAt`, and the
page beside the pillars on the CLI, the API, the MCP tools, the chart page and
the 六壬 page. Agreement with `lunar-javascript` on **14 600 / 14 600 days of
2000 to 2039** for the officer and again for the lodge with its 七政; the 480
doubled days are twelve a year for forty years. `docs/sources.md` has the 曆注
section, written the day each quantity landed rather than owed.

**The lodge shipped as a count, which is what the source left of it.** Its
whole content is `(dayNumber + 11) % 28`, and the epoch is over-determined:
twenty-eight is four sevens, so each lodge keeps one weekday for ever and the
七政 in the name says which. An epoch out by anything but a multiple of seven
breaks all twenty-eight at once, and a test asserts the lock over four hundred
days — which is why one runnable reference was enough here where two are
usually asked for. The 禽象 are out: 卷一 dates the animal images 近代 and
shows them being built by 附會, and a construction a source dates late and
explains the making of is not a transmission.

**A check the source offered, which failed usefully.** 卷三十六 says the 楊公忌
are the days the count gives 室. Laid against the received list of fixed lunar
dates, this engine's 室 days match **2 of 78** over six years — and that is the
協紀's own point rather than a defect here, since 「不論月之大小」 is its
complaint: a list of fixed lunar dates cannot track a count of days once months
differ in length. The passage is in 辨訛 because the folk rule has come apart
from the cycle it claims, and the engine now says by how much.

**The 十二神 are the block that repaid the choice of source.** 卷七 does not
transmit their rule, it *derives* one — after quoting 曹震圭's 納甲 account and
calling it 荒唐不經, and 邵泰衢's attempt to pair the twelve with 建除 and
showing it cannot work. What it puts there instead is 「其法以天罡加於建上」,
each god seated on the branch it *is*, and that is one line of arithmetic which
agrees with the reference on 7 300 / 7 300 days. The three months the source
works out in full are the test, asserted from the text rather than from the
reference. **This is what «a source that shows its own reasoning is worth more
than three that agree» was a bet on, and it paid.**

**And it settled a valence question by emptying it.** The twelve are usually
called 黃道 and 黑道, and this engine carries neither word: the same passage
says 「此所為黄黑道云者，亦即吉凶之别名而非有深義決矣」 — the pair is a
synonym for 吉 and 凶 and nothing more. So the fortune travels as a `Valence`,
on the footing `Pattern` established, and the vocabulary the source empties
does not. The 宜忌 hung on the twelve in the same passage stays out with the
officers'.

**The 年神 are the layer's other axis, and its weakest evidence.** A chart
chooses an hour *and a direction*, and 卷三 puts the year's gods on the second.
Eighteen are in — 太歲, 歲破, 大將軍, 太陰, 黃幡, 豹尾, 喪門, 弔客, 白虎, 病符,
死符, 大煞, the three 煞, 大耗, 小耗, 歲枝德, 歲德 and its 合, 破敗五鬼, the
four corner gods and 金神 — each one whose seat the source states outright and completely
without leaning on a god defined elsewhere, and each of its worked enumerations
asserted in the tests. **Seats are shared and stay shared**: 太陰 and 弔客 are
both 歲後二辰, 大耗 stands where 歲破 does, and one branch a year is 死符, 小耗
and 歲枝德 at once. The source states the principle twice, 「美惡不嫌同位，吉凶
不嫌同名」, so deduplicating would report a tidiness nobody transmitted — and
what *would* pick between the names is 宜忌, an undertaking, which is the part
this engine declines. **This is
the one block with no runnable reference**: `lunar-javascript` answers for 太歲,
which needs no answering, and for none of the other five. Tier 3, said so.
What *is* checked is the year the page turns on — 立春, on the date, 10 950 /
10 950 — because a page that disagreed with itself about its own year would
put every bearing one year out at once. **And two entries the source gives up on are the reason it was chosen.** 蠶室
has a divination in it 「而今不可考矣」; 蠶命's received table is disowned where
it stands, 「此恐有悞」. Neither is taken. Reading past the places a source
marks as beyond it would waste the only property that made it better than three
that agree.

**A seat is not always a branch, and the union says so.** 歲德 and its 合 are
given as *stems* keyed to the year's stem, and they are carried as stems: the
二十四山 seats eight of the ten, but not 戊 and not 己, and 己 is in that very
table — so converting would be this layer supplying what the source withheld.
The third arm is a **trigram**, and it arrived with the entries that needed it:
破敗五鬼 enumerated whole by 厯例, and the four corner gods — 奏書, 博士, 力士,
蠶室 — which are the one derived table in this block and the one with a check
from outside it. 卷三 states them as relations and says where the count opens;
《萬全廣濟》, quoted in the 蠶命 entry, enumerates 蠶室 by quarter, and since the
other three are fixed to it by 對衝 and by 前隅 · 後維, that one row checks all
four. Weaker than an enumeration, stronger than a derivation alone, said to be
both.

**And a fourth arm, for one god that is not one bearing.** 金神 is *run* rather
than looked up: the year's twelve month pillars by 五虎遁, and the branch of
every month whose stem is 庚 or 辛 or whose 納音 is metal. Everything under it
was already built and already weighed, so the only new thing is the selection,
and 卷三's one worked year checks it — 甲己年 午未申酉. **卷三 is now read but
for 日遊神.**

The rest of 卷三 is **unread rather than refused**; 大耗 and 小耗 are stated only inside a 「是亦一説也」 and are not
taken on that footing, and 羣醜 turns out not to be a seat at all but the
condition of 太陰 and 大將軍 coinciding. The boundary is declared so that it is
a boundary.

**One convention was extended, and only by one case.** 尾 wěi, 危 wēi and 胃
wèi keep tone numbers, which is the existing rule. 壁 and 畢 are both bì in the
same tone, where a tone number has nothing to say, so they take their place in
the cycle: `bi13` and `bi18`. Written into `docs/sources.md` so it is not
re-decided differently next time.

**The doubling needed no code, which is how the grain proved itself.** Nothing
in `almanac.ts` tests for a 節. The month branch advances on the same date the
day branch does, so their difference stands still for one day and
「每月交節則疊兩值日」 falls out. Built on the pillars instead it would have
needed a special case — and the special case would have been the tell that the
grain was wrong.

**And it nearly went into the fence.** `chartTranscript` is what the CLI
prints, what the page offers to copy *and* what `readingPrompt` puts inside the
fence, all deliberately one rendering — so adding the officer to `formatMoment`
put it in front of a model, beside the two pillars it is derived from, which is
the exact double-counting phase 14 was written to prevent. The fix is not a
flag on the transcript, which would break the one-rendering invariant it exists
for: the officer stays out of the transcript, and the surfaces that are
addresses print it *beside* that block — the page under the pillars, the CLI
through `formatAlmanac`. A test in `almanac.test.ts` keeps it out.

**The one judgment call, recorded as one.** It is absent from the fence and
present in the MCP tools and the REST answers, where a model also reads it. The
difference is that those have a contract — `docs/agent-prompt.md`, which now
says the officer is not part of the board, carries its own ganzhi for a reason,
and is a name rather than a verdict — where a pasted transcript travels with
nothing. Suppressing it everywhere a model might read would also take it from
the agent that asked for a page on purpose.
