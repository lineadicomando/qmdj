# Where the numbers come from

Every quantity this engine reports was checked against something outside
itself, and not everything was checked against something equally good. This
document says which is which, names the sources, and records what the checks
found — including where they found disagreement.

It exists because the alternative is a codebase whose confidence is uniform
and whose accuracy is not. A solar term and a named configuration are not the
same kind of fact, and a reader who cannot tell them apart has been misled by
the presentation rather than by the data.

## The three tiers

| | What it means | Where it applies |
|---|---|---|
| **1 · Published fact** | An authority publishes the answer and anyone can check it | solar terms, lunar calendar, four pillars |
| **2 · Runnable reference** | No authority, but another implementation computes it and can be run against this one | the Qi Men layout, the zhirun ju, the 六壬 transmissions, the almanac's officer |
| **3 · Transmitted text** | Chinese-language sources only; agreement is between readings, not against a measurement | the configurations, the seasonal states, 十干克應 |

**Tier 2 is not tier 1 in disguise.** An almanac encodes published astronomy;
a Qi Men implementation encodes one author's reading of a contested tradition.
Agreement with it means *consistent with a common implementation*, never
*verified*.

---

## Tier 1 — the calendrical layer

**Swiss Ephemeris** (the `sweph` binding) — the one entry in this file that is
not a check but the computation itself: every astronomical instant is asked of
it, and the comparisons below are what weighed its answers. A solar term is
the instant the Sun's apparent longitude — aberration and nutation included,
which is what every published almanac tabulates — crosses a multiple of 15°,
found with its own crossing solver (`ephemeris.ts`); a new moon is the Moon's
elongation from the Sun driven to zero on the same longitudes (`lunar.ts`);
and the equation of time inside the true-solar correction is its `lmt_to_lat`
(`true-solar.ts`) — up to sixteen minutes either way, and the whole of the
correction for a place on its zone's meridian.

Without the `.se1` files (~2 MB, `npm run ephe:download -w @shipan/core`)
it falls back to its built-in Moshier mode: analytical, needing no files, and
accurate to about a tenth of an arc second for the Sun and the Moon. A tenth
of an arc second of solar longitude moves a solar term by well under a second
of time, and no pillar turns on that; the fallback still raises the
`MOSHIER_FALLBACK` warning rather than passing for the files it does not have.

**`lunar-javascript`** — 1 926 dates from 1902 to 2098. Year, month, day and
hour pillars and the lunar date agree on every one.

The same reference checked the reading layer of the pillars — the 納音 images,
the concealed stems, the ten gods, the twelve stages, the void branches, the
direction and start of the luck cycles — on 479 charts spread over the same
two centuries, agreeing on every one once it is given a zone whose offset
never moves; `docs/history/02-four-pillars.md` records the check and the eleven
disagreements that all fell inside China's moving clocks. These quantities are
transmitted tables and derivations from them, not published astronomy: the
agreement is tier 2, consistency with a runnable reference.

Working from memory was tried first and abandoned: recalled almanac values
were wrong more often than right. Nothing in this repository is anchored on
recollection, and this is the rule the rest of the document exists to keep.

---

## Tier 2 — the layout, and the zhirun ju

**`qimen-dunjia`** (npm 2.1.0) — 160 charts from 2000 to 2023, all thirteen
quantities compared. The derived earth plate reproduces all eighteen published
arrangements without a cell out of place. Covers 拆補 only.

*Two defects found in it, for whoever uses it next*: its 局數 table is keyed in
traditional characters while it reads term names from `lunar-javascript`, which
emits simplified, so it throws outright on five of the 24 terms; and its 八神
uses 勾陳/朱雀 in yang dun against 白虎/玄武 in yin, which is one convention
among several.

**`kinqimen`** (PyPI 0.0.6.6) — 3 652 days. The yuan agrees on every one; the
term agrees wherever that reference follows the classical bookkeeping, about
two days in three. Installs under Python 3.9 only. Re-verified 2026-08-08.

*It is a different 拆補.* `kinqimen` assigns the yuan from the day's 符頭 where
`qimen-dunjia` — and this engine with it — splits the term into three five-day
thirds from the instant it begins. For 2026-09-02 11:00 in Beijing the two
return 陰遁一局上元 and 陰遁七局下元 from the same instant, each internally
consistent. That is a school divergence *inside* 拆補; it is now shipped as
`yuan`, for the reason the entry below gives.

**fengshui-hacks.com** (`cgi-bin/plotChart.pl`) — 266 moments from 1935 to
2020, every cell of the nine palaces compared. Reads clock time on 120°E with
no true-solar correction and turns the day at 23:00. Checked 2026-08-13.

*It is the second source for the 符頭 yuan*, which is what let that reading be
shipped: the standard below asks for two, and `kinqimen` was one. The rule
this reference follows — **the term in force at the instant, and the yuan from
the day's place in the fifteen-day 符頭 cycle** — reproduces its ju on 260 of
the 266, the six exceptions being 超神 windows around 寒露 and 小雪. It is not
置閏, which it superficially resembles: our 置閏 agrees with it only 56% of the
time and the disagreement alternates every five days, which is a yuan and not
a block.

*What it confirmed*: cast under `chaibu` with `yuan: 'futou'`, all 260 charts
whose ju agrees agree cell for cell — earth plate including the lodged stem,
the turn of the heaven plate, the nine stars, the eight gates, the eight
spirits, 值符, 值使, 旬首, 空亡 and 驛馬. The disagreement about the ju had
been masking a complete agreement about everything else, which is the argument
for comparing a chart layer by layer rather than as a whole.

*What it corrected here*: this engine wrote the second spirit 滕蛇 in
`plates.ts` and 螣蛇夭矯 in `patterns.ts` — the same creature under two
glyphs, of which the table above had already settled 螣. The reference writes
螣蛇, and 滕 is a surname. Fixed to 螣蛇. It also showed 寄宮 as a reading and
not only as a rule: it prints the centre's stem in the host palace, where this
engine computed the lodging and reported only its consequence for the chief
gate. `PalaceContents.lodged` now says it. The two still part on the heaven
plate, where that reference turns the lodged stem with its host and this one
leaves the centre out of the turn — a divergence in the derivation of the
plate, not in the lodging.

*Three conventions it does not share, none of them a defect in either*: it
merges 天芮 and 天禽 into one cell and leaves the centre starless where this
engine keeps 天禽 at the centre; it writes 白虎 and 玄武 in both dun where this
engine follows the 陰陽異名 convention and renames them 勾陳 and 朱雀 in a yang
chart, which the `qimen-dunjia` entry above already notes as one convention
among several; and it corrects no clock time to the Sun.

*Two defects found in it, for whoever uses it next*: its month pillar turns on
the **civil day** of the jie rather than at the jie, so a chart cast between
midnight and the term is a month out — 1984-05-05 12:00 comes back 己巳 where
立夏 does not begin until 15:50, and `lunar-javascript` says 戊辰. Its own ju
turns at the instant, so the two halves of its own output disagree. And its
year field stops at 2020 while it will cast any year it is handed.

**ktonko.com** (Japanese) — used to confirm the classical structure of 置閏
piecewise: the four 符頭 heads, the solstice anchor, the 195-day leap. An
independent tradition, which is what makes it valuable.

### 置閏 has a dated worked example, and it moves the pin by a day

《奇門遁甲統宗》卷一 置閏法 states the method and then works it, by name and
by date, over three years of the Kangxi reign — 康熙五十六年 to 五十八年, which
is 1717 to 1719. It is the only source in this file that says when its rule
fires and shows the days it fires on, and it was on the shelf unread while the
pin below was decided from a Python package.

The passage was read off the ctext transcription of 卷一 and then confirmed on
a photographic edition, 故宮珍本叢刊 第426冊 《奇門遁甲統宗大全》, 故宮博物院編,
海南出版社, at that volume's page 11 — the same characters, including the two
the argument turns on. (The 叢刊 numbers its own pages and prints two leaves of
the original to each; citations to it here are by that pagination.)

**Where that copy came from, and why the address is written down.** The scan is
one of thirteen files taken from **白雲深處人家**, an archive of Daoist and
術數 texts online since 2005 at `www.byscrj.com`, downloaded in 2012. That host
no longer exists; the library survives at `www.homeinmists.com` and at the
overseas site <https://homeinmists.ilotus.org/>. The archive distributed its
holdings inside RAR anthologies, so **no address ever pointed at this PDF** and
none can be given — `docs/provenance.tsv` carries the origin and the sha256 and
says outright that the per-file URL does not exist. This file's rule is that a
link is not the evidence and the extract is; here the link is gone and the
extract is what remains, which is the case the rule was written for.

**Every date in it is reproduced.** Twelve of its lunar dates carry a day
pillar, and all twelve come back with that pillar; a thirteenth pillar is the
error discussed below. The four terms the text dates fall on the civil days it
puts them on:

| the text | the engine |
|---|---|
| 康熙56 五月十一日甲子, 十三日丙寅 交夏至 | 1717-06-19 甲子, 1717-06-21 丙寅 |
| 康熙56 十一月二十日庚午 寅正 交冬至 | 1717-12-22 庚午, 冬至 at 04:47 |
| 康熙57 五月二十四日壬申 卯初二度 交夏至 | 1718-06-22 壬申, 夏至 at 06:32 |
| 康熙58 六月二十三日立秋, 甲子符頭恰當日 | 1719-08-08 甲子, 立秋 that day |
| 康熙58 七月初九日庚辰 處暑 | 1719-08-24 庚辰, 處暑 that day |

The two instants stated to the quarter-hour both come back about an hour late
here, in the same direction; a quarter of that is Beijing standing at 116.4°E
where this reckoning stands at 120°E, and the rest is what an eighteenth-century
computation was worth. Nothing in the method turns on it, because the method
reads the *day*.

**What the text counts in is inclusive, and that is what moves the pin.**
Three times it names a 符頭 and says how far the block has run ahead: 甲子
against a 夏至 two days later is 超三日, 甲子 against a 冬至 six days later is
超七日, and 甲子 against a 夏至 eight days later is 超九日 — which is the one
that triggers the intercalation, 「宜先於芒種節上置閏」. So 統宗's nine days is
a gap of eight, and its rule 「超遇九日十日或十一日則仍置閏」 intercalates when
the block head stands eight days or more before the solstice's day.

`MAX_CHAOSHEN` in `zhirun.ts` is 8, meaning the head may stand up to eight days
before and the intercalation waits for nine. It follows `kinqimen`, the one
runnable reference, and `zhirun.ts` calls this «the contested pin of the whole
method» — reading the classical 九日 as a gap of nine. **It is a gap of eight,
and the engine is one day loose.** The 1718 case is exactly the cell where the
two part: 夏至 falls on 壬申, whose position in the block is 8, so this engine
seats 五月十六日甲子 as 夏至上元 where the 統宗 makes it 芒種閏奇上元 and does
not reach 夏至上局 until 六月初二日己卯. Both the 1717 cases, at positions 2 and
6, agree.

This is **not** a change made in the code, and the reason is the standard: one
text against one runnable reference is one against one. What it does is name
the disagreement precisely — a single day, at a single position, in one
direction — where before there was a comment saying the pin was contested and
no witness that could say which way.

**One error in the text, caught by the engine.** For the 1717 winter solstice
it writes 「去符頭甲午日共超七日」, and 甲午 stands thirty-six days before 庚午,
not six. The head that fits its own 超七日 is 甲子, and the photographic edition
reads 甲午 too, so the slip is the compiler's and not a transcription's. It is
recorded because a reader collating this passage will meet it, and because a
worked example that survives its own arithmetic error is still worth more than
a rule stated without one.

**And one aside that does not fit.** After the 正授 of 康熙五十八年 the text
adds 「上元至七月初九日庚辰處暑即超一日矣」; the head there is 己卯, one day
before 庚辰, which is a gap of one and an inclusive count of two. Three
instances inside the worked computation count inclusively and this remark does
not. It is left standing rather than reconciled, because the three that decide
the rule agree with each other and this one decides nothing.

---

## Tier 3 — the reading layer

No runnable reference exists for any of this. Each rule is instead tested
against the transmitted list it is supposed to reproduce — which only works
where the rule can be *derived*. Where it cannot, the standard is **two
independent sources naming the same thing the same way**.

### Derived, with the transmitted list as the test

| Rule | Derived from | The list that tests it |
|---|---|---|
| 門迫 | the gate's phase controls the palace's | 《奇門遁甲統宗》卷一 迫, and see below |
| 五不遇時 | the hour's stem controls the day's, same polarity | the ten transmitted pairings — and the rule found the mnemonic **incomplete**: on two days in ten the condition strikes twice and the mnemonic names one |
| 驛馬 | the branch facing the triad's 長生 | 申子辰馬在寅 and its three fellows |
| the earth plate | count the instruments and marvels through the Luoshu | all eighteen published arrangements |
| 旺相休囚死 | the five-phase reckoning against the season | stateable in a sentence and checked against it |
| 門宮 · 星宮 | the five relations of the phases | 門迫 is one of the five, and a test asserts the two never disagree |

**The list that tests 門迫 is two cells shorter than the rule.** 《統宗》卷一
迫 — ctext, and 故宮珍本叢刊 第426冊 page 13 — prints eight lines — 開門臨三四宮（金克木）· 休門臨九宮 · 生門臨一宮 ·
傷門臨八宮 · 景門臨六宮 · 死門臨一宮 · 驚門臨三四宮 · 杜門臨二八宮 — which is
eleven cells, where the derivation yields thirteen. The two it does not print
are 傷門臨二宮 and 景門臨七宮. **Neither is a doctrine the list holds against
the rule**, and the list says so itself: it gives 杜門, the other gate of wood,
both earth palaces, and it gives 開門 and 驚門, the two gates of metal, both
palaces of wood. A compiler who knew wood oppresses 二 and 八 under 杜門, and
that metal oppresses 三 and 四 twice over, has dropped two lines rather than
excluded two cells. The parenthesised reasons in his own list are the argument.

### Transmitted, not derived

These are tables. They cannot be derived, so the code holds them and a comment
says so — **`TOMB` and `STRIKE` in `patterns.ts` are marked as transmitted
precisely so nobody "fixes" them later.** 入墓 in particular does *not* follow
the twelve stages: those put the tomb of 乙 at 戌 in Qian, while the Qi Men
tradition puts it in Kun with 甲.

**Both now have a printed witness, and it agrees cell for cell.** 《奇門遁甲
統宗》卷一 奇門四十格 tabulates them, and these two entries fall after the leaf
the photographic 故宮珍本叢刊 第426冊 is missing, so they were read there —
page 12 — as well as off ctext:

> 三奇入墓　乙奇坤宮　丙奇乾宮　丁奇艮宮
> 六儀擊刑　甲子直符三　甲戌直符二　甲申直符八　甲午直符九　甲辰直符四　甲寅直符四

`STRIKE` is the six of them exactly, decade for decade and palace for palace,
which is the first source in this file to state that table rather than have it
inferred. `TOMB` holds four and the list holds three: 乙 in Kun is the reading
that parts from the twelve stages, and it is here in print, while 戊 in Qian
has no line of its own — 戊 is an instrument and not a 奇, so the heading it
would have to stand under excludes it. That is where the fourth entry stands:
transmitted, and not witnessed by this list.

---

## The transliteration

Every named thing in the engine carries a `pinyin` beside its `hanzi`: the
stems and branches, the sixty pairs, the twenty-four terms, the nine palaces,
the nine stars, the eight gates, the ten spirits, the configurations and their
fortunes, the five relations, the five states of the season, the three yuan,
the thirty images of 納音, the twelve stages and the ten gods.

**This is not a quantity and nothing is computed from it.** It is here because
it is data that was written by hand and can therefore be wrong, and a reader
who does not read Chinese has no way to catch it — which is exactly the reader
it exists for.

It is **standard Hanyu Pinyin with tone marks**, one word per name, taken from
the character readings in the *Xiandai Hanyu Cidian* / Unihan `kMandarin`
tradition. The tones are the point: they carry what the identifiers had to
drop, and they part the pairs the identifiers cannot — 戊 wù from 午 wǔ, 驚門
jīngmén from 景門 jǐngmén.

Where a name uses a character in other than its commonest reading, the choice
is written next to the entry rather than left to be noticed:

| Name | Reading | Not |
|---|---|---|
| 芒種 | mángzhòng | zhǒng, the seed |
| 處暑 | chǔshǔ | chù, the place |
| 乾 (the trigram) | qián | gān, dry |
| 相 (of 旺相) | xiàng | xiāng, mutual |
| 長生 | chángshēng | zhǎng, to grow |

A sexagenary pair is **not** in any table: `ganzhiOf` joins its stem's reading
to its branch's, because neither is read differently for standing next to the
other. A test asserts that, and asserts that no named thing anywhere in the
engine is missing its reading.

**The drawing prints it under the board and not in the palace**, which is a
placement rather than an omission: a register in a palace is a glyph and a word
wrapped to at most two lines, and the line a reading would take is the register
beneath it — six names to a palace, nine palaces, at every size, since the
plate is proportional. So both boards carry a band under them, asked for by a
heading, where every name on the paper is said once: the palaces, the stems,
the stars, the gates, the spirits and the branches of the compass on the grid
of nine; the twelve branches, the twelve generals and whatever stems turned up
on the ring of twelve. The list is the same length at every hour, because what
the hour changes is where the names stand and not which of them stand. See
`packages/plate/src/readings.ts`, and the tone-mark probe in `png.ts` that
refuses to rasterise a reading no font on the machine can draw.

---

## 十干克應 — what was checked, one pairing at a time

The table has eighty-one cells: nine stems on the heaven plate over nine on
the earth plate, 甲 excluded because it never stands on a plate. **Eleven are
implemented.** The other seventy are absent, and the reason is below.

### The sources consulted

| Key | Source | Kind | Licence | Cites its own source? |
|---|---|---|---|---|
| **V** | [煙波釣叟歌, Wikisource](https://zh.wikisource.org/zh-hant/%E7%85%99%E6%B3%A2%E9%87%A3%E5%8F%9F%E6%AD%8C) ([rev](https://zh.wikisource.org/w/index.php?oldid=1336835)) | Song-dynasty verse, complete | public domain | is the source |
| **T** | 《奇門遁甲統宗》卷一 奇門四十格 | Ming compilation, **forty formations as a table**, each with its stem condition | public domain | is a source |
| **Y** | 《奇門遁甲元靈經》卷二 天盤加地盤吉凶 — 海昌 許松如 署, preface 光緒九年 (1883), held only as a transcription from 白雲深處人家 ([mirror](https://homeinmists.ilotus.org/), origin `www.byscrj.com` defunct) | Qing, the table itself — one stem over another, named and weighed, in prose | public domain | is a source |
| **K** | [ktonko.com, 奇門遁甲の凶格局](https://ktonko.com/html/syoi/32_kyo.html) | Japanese tradition, 16 formations with explicit stem conditions | — | no |
| **B** | [`perfhelf/bigfishmarquis-qimen`](https://github.com/perfhelf/bigfishmarquis-qimen), `src/data/shi_gan_ke_ying.json` | all 81, with name and fortune | MIT | no |
| **H** | [`HeiGeAi/HeiGe-SuanMing`](https://github.com/HeiGeAi/HeiGe-SuanMing), `references/22_qimen_duanju.md` | all 81, declared cross-checked against three named Chinese sources | **PolyForm Noncommercial 1.0.0** | yes, three sources |

**H cannot be copied from.** PolyForm Noncommercial is incompatible with
AGPL-3.0-or-later: it forbids commercial use, which the AGPL forbids
forbidding. It was consulted for comparison only, which is what a fact permits
and an expression does not.

Also surveyed and not used: [`dxbuyi/qimen.skill`](https://github.com/dxbuyi/qimen.skill)
(MIT, 20 combinations, uncited), [`3metaJun/3meta`](https://github.com/3metaJun/3meta)
(MIT, no stem-pair table), [`oceanjustinlin/qimen`](https://github.com/oceanjustinlin/qimen)
(MIT, a scoring engine — which is the layer this project declines to have),
[道音文化](https://www.daoisms.com.cn/2010/29/19/23446/) and
[靈匣網](https://www.lnka.tw/html/topic/986_2.html) (Chinese, uncited).

**The 統宗 entry used to stand in that list**, saying that the chapter checked
carried commentary in verse rather than the table, and that the full text was
there for whoever located the right one. It is 卷一, and it is located: the
survey above was built out of two GitHub repositories and a Japanese web page
while the tabular form sat in a Ming compilation on this project's own shelf.
That is the finding to keep from this section — not the cells it changed, of
which there is one, but that the search had stopped at the first four sources
that came back.

### The cross-check

甲 is concealed by the instrument of its decade, so the verse's 丙加甲 and
甲加丙 are read as 丙 over 戊 and 戊 over 丙. **T and Y write those two cells
with 甲 outright** — 甲直符加地盤丙奇, 天盤丙加地盤甲 — which is the reading
this engine had to supply, arriving stated.

| above + below | V | T | Y | K | B | shipped as |
|---|---|---|---|---|---|---|
| 丙 + 戊 | 鳥跌穴 | 鳥跌穴 | 飛鳥跌穴 | — | 飞鸟跌穴 | **飛鳥跌穴** 吉 |
| 戊 + 丙 | 龍返首 | 龍**回**首 | 青龍返首 | — | 青龙**转光** | **青龍返首** 吉 |
| 庚 + 丙 | 白入熒 | 太白入熒 | — | 太白入熒 | 太白入荧 | **太白入熒** 凶 |
| 丙 + 庚 | 熒入白 | 火入**金鄉** | **織女尋牛郎** | 熒入太白 | 荧入太白 | **熒入太白** 凶 |
| 庚 + 癸 | 大格 | 大格 | — | 大格 | 太白**冲刑** | **大格** 凶 |
| 庚 + 己 | 刑格 | 刑格 | — | 刑格 | 太白**大刑** | **刑格** 凶 |
| 庚 + 庚 | — | — | — | 戦格 | 太白**同宫** | **戰格** 凶 |
| 癸 + 丁 | 蛇夭矯 | 蛇**妖**矯 | — | 騰蛇妖矯 | 螣蛇夭矫 | **螣蛇夭矯** 凶 |
| 丁 + 癸 | 雀投江 | 雀投江 | — | 朱雀投江 | 朱雀投江 | **朱雀投江** 凶 |
| 乙 + 辛 | 龍逃走 | 龍逃走 | 青龍逃走 | 青龍逃走 | 青龙逃走 | **青龍逃走** 凶 |
| 辛 + 乙 | 虎猖狂 | 虎猖狂 | — | 白虎猖狂 | 白虎猖狂 | **白虎猖狂** 凶 |
| 庚 + 壬 | — | 小格 | — | 小格 | 太白退位 | **not shipped — and see below** |

`test/stem-pairs.test.ts` states each couplet of the verse as data and asserts
the engine reproduces it. Ten of the eleven are pinned to a line of the song;
戰格 is pinned to K and H agreeing.

**T is read off a transcription, and the printed copy here cannot confirm it.**
The photographic edition on the shelf — 故宮珍本叢刊 第426冊 — carries the
四十格 across two leaves and prints, between them, 「卷一原書缺第10面。」: the
original the Palace Museum reproduced is missing leaf 10 of 卷一. The entries
before the gap are 龍回首 · 鳥跌穴 · the nine 遁 · 龍逃走 · 虎猖狂 · 蛇妖矯 ·
雀投江 · 三奇得使, and the entries after it are 三奇入墓 · 時墓 · 六儀擊刑 ·
六儀受制 · 地羅遮蔽 · 天網四張 · 尺寸高低. **The leaf that is gone is the one
carrying 大格, 刑格, 小格, 太白入熒 and 火入金鄉** — which is to say every T
cell the survey above leans on that is not also in the verse, and the whole of
the 小格 finding. Those five stand on the ctext transcription alone, from a
complete copy this shelf does not hold. The six that survive the gap are
confirmed in print, and so are 三奇入墓 and 六儀擊刑 above.

**Y covers 甲, 乙 and 丙 over all nine and stops.** Twenty-seven cells of the
eighty-one, of which the nine under 甲 are cells this engine has no place for.
Where the transcription held ends, 卷三 begins; whether the rest was ever there
is not established from the copy on the shelf, and the four rows it would have
answered — 丁, 庚, 辛, 癸 — are four of the six the shipped table draws on.

**And Y stands one degree below T and V**, for the reason 六壬大全's extract
once did: no printed edition has been consulted. What is held is a
simplified-character transcription of unstated editorial provenance, from an
archive that no longer exists at the address it was taken from. It is used
here to corroborate names three other sources already carry and to record one
dissent; nothing rests on it alone, and nothing should until a print is found.

### Four findings

**The pairing is agreed far more widely than the name.** Every source marks
庚 over 癸 as a named configuration. V and K call it 大格; B calls it 太白沖刑.
The same happens at 刑格 and 戰格, and at the two 甲/庚 pairings K names
伏宮格 · 飛宮格 where B names 天乙伏宮 · 值符飛宮. Where the sources name a
pairing differently the classical verse decides — it is the text the others
descend from — and the divergence is recorded here rather than resolved in
silence. **T and Y widen the spread without moving a single pairing**: every
cell either of them carries is a cell the shipped table already has, at the
same two stems, and 丙 over 庚 alone now answers to four names across five
witnesses — 熒入白, 熒入太白, 火入金鄉, 織女尋牛郎. The verse still decides.

**One pairing was excluded for want of a second source, and it has one.**
庚 over 壬 was 小格 in K alone. 《統宗》卷一 prints 「小格　庚臨壬」, which is a
classical witness naming it what the Japanese tradition names it, and the
standard this file sets — two independent sources, the same thing the same way
— **is met.** It is still not shipped, because meeting the standard is what
makes a pairing eligible and not what adds it: a twelfth entry needs an id, a
hanzi, a reading, a valence and a line in `test/stem-pairs.test.ts`, and it
needs the 凶 it would carry to be read off a source rather than assumed from
its neighbours in the list. And it stands on the leaf the printed copy here is
missing, per the note below. **This is a decision that is now waiting, not a
refusal.** 三奇得使 is no longer its precedent: there the sources disagree,
which is a different thing from there being only one, and only the second was
ever true here.

**B dissents on 戊 over 丙**, calling it 青龍轉光 where V and H call it
青龍返首. The engine keeps 青龍返首, and Y is the fourth source and the second
classical one to write it out in full. T writes 龍**回**首 for the same cell,
which is the variant to know when collating: 回 and 返 both say the dragon
turns its head, and no source seen puts a different configuration there.

**A name in Y belongs to a pairing the engine gives to another.** Its 乙 row
has 乙加地盤丁　朱雀入江格, where 朱雀投江 is shipped for 丁 over 癸 on the
authority of V, K and B together. 入江 and 投江 are not the same word and the
two need not be the same formation, but a reader collating Y against this table
will meet the collision, so it is written down. Nothing is taken from it.

### What is deliberately not imported

The two complete tables carry a `desc` field of interpretive prose —
《百事大吉不劳而成》, everything auspicious and achieved without effort. That
is a reading of the querent's situation, and it stays out. What is imported is
the pairing, the name, and the fortune: the three things `Pattern` and
`Valence` already carry.

The sources also grade the fortune in four or five steps — 大吉 · 吉 · 平 ·
凶 · 大凶 — where this engine has three. The intensity is more disputed than
the sign, so it is flattened; 平 would be the honest fourth value if a
neutral pairing is ever shipped.

---

## 年命 — the birth inside a chart of a moment

This is the one thing here that rests on a **primary text** rather than on
implementations, and the tier has to be read differently because of it: there
is nothing to run it against. What there is, is a Ming treatise in the
四庫全書 that states the rule and states it as a defect to leave out.

《遁甲演義》, 程道生, c. 1613, 卷一 遁甲錯誤須檢點
([Wikisource](https://zh.wikisource.org/zh-hant/遁甲演義),
[rev](https://zh.wikisource.org/w/index.php?oldid=2082234)):

> 夫用遁之法，不推本命行年，未見精妙，必人生年命乘本局吉星奇門生旺之方，始得
> 神將護持，無不利也。若命入囚死刑克之宮，而又加以惡星，雖所謀事合生開吉門，
> 終不為美，故遣將先擇其年命利者為主，否則當候直符移易可也。法以生命隨局順逆
> 為主，行年隨命，數至泊宮為是。男順寅，女逆申，皆起五虎，遁其泊宮生克刑害，
> 須以納音而論歲月用支……緣五日為一局，一局六十時，而一時之中，善惡不一，若不
> 參之以年命，烏足以盡其美哉。

The 四庫全書提要 of the same work singles the doctrine out —
「至論本命行年，謂欲乘本局中吉星生旺，其說亦他書所未及」 — which is worth more
than a second source agreeing: the Qing editors are saying the other books do
*not* carry it. It is one text, and it is written down here as one text.

**What was taken.** The two pairs and where they fall: 本命, the year pillar
of the birth, and 行年, the year being lived, opened at 丙寅 forwards or 壬申
backwards and stepped one pair to a year. The openings are **derived** rather
than copied — 五虎遁 gives the month of 寅 in a 甲 year as 丙寅 and its month
of 申 as 壬申 — and a test asserts that derivation against the pairs the
tradition transmits alongside it (一歲丙寅, 十一歲丙子; 一歲壬申, 十一歲壬戌).
The mooring is the palace of the branch, which is the board's own table. The
納音 is weighed against that palace because 「須以納音而論歲月用支」 says to,
and `nayin.ts` already held the thirty images.

**What was left out, and why.** 「生命隨局順逆為主……數至泊宮」 admits at least
two readings — the pair moored at the palace of its branch, or counted through
the palaces in the direction of the ju — and the text is four characters where
it would need a sentence. The engine takes the branch's palace, which is
uncontested, and does not implement a count it would have to guess at.
`行年` is refused outright without both the years and the direction: a rule
that runs one way from 寅 and the other from 申 has no reading that does
without that.

**Its verdicts are not taken either.** 生旺之方 and 囚死刑克之宮 are the text's
own weighing, and they need a question to have been asked. The chart already
carries 旺相休囚死, the relations and the configurations; what is placed here
is a pair and a palace.

**The natal chart is a different thing, and it has a text too.**
《奇門遁甲統宗》卷之十二 (玄機賦下,
[ctext](https://ctext.org/wiki.pl?if=gb&chapter=730643)) does cast a chart on
the hour of a birth and read a whole life from it —
「推人命運，以本人生時奇門之局為主……取其本命之局，以推其一生之窮通、壽夭、
吉凶、禍福、妻財子祿，俱可知也」 — and maps 六親 onto the generation and
control between the reader's own stem and the 奇儀, qualified gate by gate.
That is doctrine of exactly the kind this file refuses elsewhere: prose
verdicts, one late compilation, and a mapping the commercial lineages have
since replaced with a different one they attribute to nobody. It is recorded
here because it exists and because the absence would otherwise read as
ignorance of it — not because anything imports it.

---

## 八門 — what each gate is chosen for

`PURPOSES` in `purposes.ts` is the one table in the engine that says anything
about human affairs, so it carries the heaviest burden of citation here. Three
witnesses, and they are independent of one another: a Tang treatise, a Daozang
verse, and a Ming–Qing compilation that transmits both the verse and a prose
table of its own.

### The Tang witness — the domains

《太乙金鏡式經》, 唐 王希明, c. 730, 卷二 推八門所主法, 四庫全書本
([Wikisource](https://zh.wikisource.org/wiki/太乙金鏡式經_(四庫全書本)/卷02),
[rev](https://zh.wikisource.org/w/index.php?oldid=773930)):

> 𤣥女云：天有八門以通八風也……開門直乾，位在西北，主開向通達。休門直坎，
> 位正北，主休息安居。生門直艮，位東北，主生育萬物。傷門直震，位正東，主疾
> 病灾殃。杜門直巽，位東南，主閉塞不通。景門直離，位正南，主鬼怪亡遺、驚恐
> 奔走。死門直坤，位在西南，主死喪葬埋。驚門直兑，位正西，主驚恐奔走。

The earliest of the three by some seven centuries. It gives each gate a
**domain** rather than a list of errands, which is what makes it the check on
the other two: an errand belongs where the domain already was.

### The verse — the errands, in two independent redactions

《黃帝太一八門逆順生死訣》, 《正統道藏》洞玄部眾術類, author unknown, so
before 1445 ([Wikisource](https://zh.wikisource.org/wiki/黃帝太一八門逆順生死訣),
[rev](https://zh.wikisource.org/w/index.php?oldid=2352262)), under 發用出門訣:

> 欲求財利往生方、捕獵先知死路強。若與遠行開上去，盜捉逢驚因向得，
> 休門最好遇君王。杜門有事好逃藏。取債旦憑傷上去，思量酒食問景方。

《奇門遁甲統宗》卷一, 論八門執事歌 — the same eight lines, transmitted
separately ([ctext](https://ctext.org/wiki.pl?if=gb&chapter=666094)):

> 欲求財利往生方。葬獵須知死路強。／征戰遠行開門吉。休門見貴最爲良。
> 捉賊驚門無不獲。杜門無事好逃藏。／索債須防傷上去。思量飲酒景門高。

Two witnesses, centuries apart, assigning the same eight errands to the same
eight gates. The variants are lexical and none of them moves an errand:
捕獵 · 葬獵, 若與遠行 · 征戰遠行, 盜捉逢驚 · 捉賊驚門, 遇君王 · 見貴,
有事 · 無事好逃藏, 取債 · 索債, 酒食 · 飲酒. **This is what the two-source
standard was written for**, and it is why the table ships where the rest of
the 用神 doctrine does not.

### The prose table

《奇門遁甲統宗》卷二, 八門所主
([ctext](https://ctext.org/wiki.pl?if=gb&chapter=491157)):

> 開門宜征討謀望、入官見貴、應舉遠行、嫁娶移徙、商賈營建，不宜治政，有私人
> 窺伺。／休門宜面君謁貴、上官到任、嫁娶移徙、商賈營建，諸事皆吉，不宜行刑
> 斷獄。／生門宜征討謀望、入官見貴、嫁娶移徙，諸事皆吉，不宜埋葬治喪。／
> 傷門宜漁獵、討捕索債、博戲、收斂貨財，餘俱不宜。／杜門宜捕盜剪凶、決隱獄
> 形、填塞溝壑，餘俱不宜。／景門宜上書獻策、招賢謁貴、拜職遣使、行誅突陣、
> 破齒等事，餘俱不宜。／死門宜決斷刑獄、吊喪埋葬等事。／驚門宜掩捕盜賊、恐
> 惑亂眾等事。／右八門最怕迫制，吉門有氣益吉，無氣減吉；凶門有氣益凶，無氣
> 減凶。

**Both 統宗 passages were checked against a printed edition**, not against the
transcription: 上海文明書局, 第一冊, 卷一 頁一三 and 卷二 頁一五–一六. The
transcription agrees character for character, with one variant — the print
reads 招賢**調**貴 where ctext reads 招賢**謁**貴.

A second printed edition now stands behind 卷一 論八門執事歌: 故宮珍本叢刊
第426冊 《奇門遁甲統宗大全》, page 13, where the four couplets read as
transcribed. It is the copy with a leaf missing further back — see the 十干克應
section — and the gap falls well before this passage.

### What each entry stands on

| id | gate | 金鏡 | verse | 統宗 卷二 |
|---|---|---|---|---|
| `opening` | 開門 | 主開向通達 | 遠行 | 入官見貴 · 應舉遠行 · 商賈營建 |
| `meeting` | 休門 | 主休息安居 | 遇君王 · 見貴 | 面君謁貴 · 上官到任 · 嫁娶 |
| `wealth` | 生門 | 主生育萬物 | 欲求財利 | — |
| `documents` | 景門 | 主鬼怪亡遺 | 酒食 · 飲酒 | 上書獻策 · 招賢 · 拜職遣使 |
| `concealment` | 杜門 | 主閉塞不通 | 好逃藏 | 捕盜剪凶 · 填塞溝壑 |
| `pursuit` | 傷門 | 主疾病灾殃 | 取債 · 索債 | 漁獵 · 討捕索債 · 博戲 |
| `ending` | 死門 | 主死喪葬埋 | 捕獵 · 葬獵 | 決斷刑獄 · 吊喪埋葬 |
| `dispute` | 驚門 | 主驚恐奔走 | 盜捉 · 捉賊 | 掩捕盜賊 · 恐惑亂眾 |

### What was cut, and why

The labels used to carry more than any of this. The surplus came from the
modern manuals — 《圖解奇門遁甲大全》, 唐頤, 陝西師範大學出版社, is
representative and was consulted — and it was cut rather than shipped:

| Cut | Where the tradition actually puts it |
|---|---|
| 生門 · trade, building | 商賈營建 is 開門's and 休門's, in the same 統宗 list |
| 生門 · treatment | a **star**, not a gate: 「求仙合藥見天心」, 《遁甲演義》卷三 |
| 景門 · examinations | 應舉 is 開門's |
| 景門 · making a thing known | no witness carries it |
| 杜門 · work of the hands | no witness carries it |
| 驚門 · litigation, dispute | 刑獄 is 死門's and 獄形 is 杜門's. Only the modern manuals moved it, and 《圖解》 does: 驚門宜斗訟官司 |

**Hunting is left off both gates it belongs to.** The verse puts it under 死門
(捕獵 · 葬獵) and the 統宗 under 傷門 (漁獵); the modern manual carries it under
both. That is not a divergence to resolve — the domain genuinely overlaps — but
an errand offered under two options is not a choice, so it names neither label.

**景門 is the one gate whose witnesses name different errands**: 鬼怪亡遺 in
the Tang text, 酒食 in the verse, 上書獻策 in the 統宗. They do not contradict
so much as bound a domain wider than any one of them, and the modern manual
lists both the document and the banquet under it. The label carries both and
this file says why, which is the alternative the standard allows to refusing
the entry.

### What is not here

《遁甲演義》, the text this file leans on for 年命, **carries no gate-purpose
table at all** — not the verse, not a prose list, nothing under 所主. It was
searched for every phrase above. The absence is recorded because the reader
would otherwise expect the project's own primary text to be the source, and it
is not.

《奇門遁甲統宗》卷十二 玄機賦下 does carry a per-gate reading —
開門主豁達開暢, 驚門主驚惶不安, and so on — but it carries it *inside* the
natal doctrine this file already refuses, qualified 父母逢生 · 財帛逢傷 palace
by palace. Nothing is taken from it, for the reason given in the 年命 section.

### Why there is no `tradition` parameter

`purposes.ts` used to say one was deferred, on the assumption that a second
strand would want a second table. Laying the two side by side says otherwise:
**the gate does not move.** All eight entries sit at the same gate classically
and in the manuals — money at 生門, the document at 景門, the thief at 驚門.
The two strands differ about how *wide* each gate's domain runs, which is the
gloss and not the chart, and a parameter over the table above would select
between two identical columns.

The divergences that are real name errands the table does not carry, and each
would have to become an entry of its own before a parameter had anything to
choose:

| Errand | Classically | In the manuals |
|---|---|---|
| 醫療, seeking treatment | a **star**: 「求仙合藥見天心」 — no gate at all | 生門 |
| 訟, litigation | 死門 (決斷刑獄), 杜門 (決隱獄形) | 驚門 (鬥訟官司) |
| 商賈, trade | 開門, 休門 | 生門 (生意), and 開門 still |
| 技巧, work of the hands | no witness carries it | 杜門 |

A modern table holding those would be longer than eight, and eight is what
keeps this the gates read from the other side rather than a catalogue of
undertakings somebody chose. The parameter remains free to arrive if that
table is ever wanted — a purpose is not in a chart's address, so no shared
link would break — but it is not wanted for a difference that turns out to be
in the wording.

**The identifier `dispute` now outruns its label.** The sources put catching a
thief under 驚門 and litigation under 死門 and 杜門; the label was corrected and
the identifier was not, because it reaches the CLI's `--for` and the errand
list of the MCP reference. It is a wart, and it is written down here rather
than fixed quietly.

---

## 六壬 — the board built from references, and the text that arrived after

The second board was built the way phase 13 said it had to be: no rule written
from memory, two runnable references found first, and the construction measured
against the whole space before any doctrine was argued about. **Then the
classical text was read, and it turned out to state — outright, in a verse of
four-character lines — three clauses this engine had recovered by scoring
itself against those references.** That is the happiest result this file
records and the sharpest lesson in it, and both halves are written down below.

### The text

《六壬大全》, 十二卷, 四庫全書本, 卷一 **入手法** — the opening chapter, which
is a mnemonic verse with the compilers' interlinear notes running through it.
The 四庫 catalogue gives no author; the first juan carries the name of 郭載騋,
a Ming judge of 懷慶府
([Wikisource](https://zh.wikisource.org/wiki/六壬大全_(四庫全書本)/卷01),
[oldid 763659](https://zh.wikisource.org/w/index.php?oldid=763659)).

**The extract is the raw wikitext, not a rendering of it.** Two passes of a
page-reader over the same page disagreed on a character — 隂 against 隐 in the
比用 line — so the transcription was taken from the API instead and is
reproduced here as the edition has it, `{{SKchar}}` placeholders expanded and
interlinear notes moved into 〈〉.

**It has since been collated against two modern typesettings, and that closes
the reservation this entry used to carry.** As first written it said that no
printed edition had been consulted, unlike the 統宗 passages above, and that
the extract therefore stood one degree weaker than those — a transcription of
a photographic edition, checked only against itself. It is now checked against
精校本六壬大全 (簡體), which reprints the 四庫 提要 ahead of the text, and
against a second collated 六壬大全 卷一到十. Neither is a photographic
edition either, so the 四庫 wording above remains the one quoted; what the two
supply is agreement on the places where reading it required a decision.

**Those places are the 己/巳 confusion, and the collation carries every
instance of it.** The 四庫 text writes 己 and 巳 for each other,
which is the ordinary scribal confusion of the two graphs, and this file read
three instances the way the sense requires. Both typesettings print
丙戊課**巳** and 丁**己**課未 outright — which does not make the first two
certain, since an editor emending is still an editor, but it does move them
off this file's own conjecture and onto a reading two editors arrived at
independently. The third, 丁**巳**辛 in the 返吟 line, splits, and the split is
worth more than concord would have been:

| | 入手法, the line quoted above | the same rule restated later in the same volume |
|---|---|---|
| 精校本 | 丑未同干**丁己辛** | 井欄丑未**乙巳辛** — 乙 for 丁 is a slip |
| 卷一到十 | 丑未同干**丁巳辛**, the 四庫 reading kept | 井欄丑未**丁己辛** |

Each edition emends in one place and does not in the other, and they do not
agree on which — so neither is silently normalising 巳 to 己 wherever it meets
it, which is the failure a concordant pair would not have ruled out. Both
places have a witness for 己, and no witness anywhere reads the line in a way
that would change what `liuren.ts` computes.

The extract also uses the edition's variant forms throughout — 尅 for 剋, 渉
for 涉, 隂 for 陰, 逓 for 遞, 别 for 別, 眀 for 明.

> 　　入手法
> 　　**十干寄宫**
> 　　甲課寅兮乙課辰丙戊課己不須論丁巳課未庚申土辛戌壬亥是其真癸課原来丑宮坐分眀不用四正神
> 　　**一賊尅法**〈一下尅上曰重審一上尅下曰元首〉
> 　　取課先從下賊呼如無下賊上尅初初傳之上名中次中上加臨是末居三傳既定天盤将此是入式法第一
> 　　**二比用法**〈即知一也〉
> 　　下賊或三二四侵若逢上尅亦同云常将天日比神用陽日用陽隂用隂若或俱比俱不比立法别有渉害陳
> 　　**三渉害法**
> 　　渉害行来本家止路逢多尅為用取孟深仲淺季當休復等柔辰剛日宜
> 　　**四遙尅法**〈神遙尅日曰蒿矢日遙尅神曰彈射〉
> 　　四課無尅號為遥日與神兮逓互招先取神遥尅其日如無方取日来遥或有日尅乎兩神復有兩神来尅日擇與日干比者用陽日用陽隂用隂
> 　　**五昴星法**
> 　　無遙無尅昴星窮陽仰隂俯酉位中〈論初傳也〉剛日先辰而後日柔日先日而後辰〈論中末也〉
> 　　**六别責法**〈戊辰戊午丙辰三剛日各一課辛未二課辛丑二課丁酉　辛酉各一課〉
> 　　四課不全三課備無遥無尅别責例剛日干合上頭神柔日支前三合取皆以天上作初傳隂陽中末干中寄剛三柔六共九課此課先賢俱隠秘戊午戊辰與丙辰干上皆午是為親辛丑辛未各二日下上皆是丑未真丁酉當為己丁是辛酉原来是酉辛
> 　　**七八專法**〈論尅不論遥〉
> 　　兩課無尅號八專陽日日陽順行三〈連本位數〉隂日辰隂逆三位中末總向日上眠
> 　　**八伏吟法**
> 　　伏吟有尅還為用無尅剛干柔取辰迤邐刑之作中末従兹玉厯職其真若也自刑為發用次傳顛倒日辰併〈陽日用辰隂日用日〉次傳更復自刑者冲取末傳不論刑
> 　　**九返吟法**
> 　　返吟有尅亦為用無尅别有井欄名若知六日該無尅丑未同干丁巳辛丑日登眀未太乙辰申日未識原因〈辰上作申日上作未〉

### 寄宮, which the verse gives before the rules

「甲課寅兮乙課辰，丙戊課巳不須論，丁己課未庚申土，辛戌壬亥是其真，癸課原來
丑宮坐，分明不用四正神」 — 甲寅 乙辰 丙戊巳 丁己未 庚申 辛戌 壬亥 癸丑, and
the closing line is the table's own check: no stem lodges on a cardinal branch.
`LODGING` in `liuren.ts` is that table character for character. **It is not
dunjia's 寄宮**, which asks which palace the centre is read at; the two words
name two different detours and this file keeps them apart.

### The nine rules, line against implementation

| rule | the verse | what `liuren.ts` does |
|---|---|---|
| 賊剋 | 取課先從下賊呼，如無下賊上尅初 · 〈一下尅上曰重審，一上尅下曰元首〉 | 下賊上 taken before 上剋下; one candidate of either kind settles it, and the 課體 is 重審 or 元首 exactly as the note assigns them |
| 比用 | 常將天日比神用，陽日用陽隂用隂 · 〈即知一也〉 | the upper sharing the day stem's polarity; 知一 is the note's own gloss and is the `keti` |
| 涉害 | 渉害行来本家止，路逢多尅為用取，孟深仲淺季當休 | counts harms walking **forward to the home palace**, and asks 孟 · 仲 · 季 **before** depth |
| 遙剋 | 先取神遥尅其日，如無方取日来遥 · 〈神遙尅日曰蒿矢，日遙尅神曰彈射〉 | upper-controls-stem first, then stem-controls-upper; 蒿矢 and 彈射 as the note assigns them; ties by 比 |
| 昴星 | 無遙無尅昴星窮，陽仰隂俯酉位中 · 剛日先辰而後日，柔日先日而後辰 | 酉, taken from above on a yang day and from below on a yin one, and the middle and last in the two orders the second line gives |
| 別責 | 剛日干合上頭神，柔日支前三合取，皆以天上作初傳，隂陽中末干中寄 | yang day from the 寄宮 of the stem's 合 partner, yin day from the 三合 corner ahead; middle and last both the stem's seat |
| 八專 | 陽日日陽順行三〈連本位數〉，隂日辰隂逆三位，中末總向日上眠 | three forward and three back **counting the starting position**, which is why the code steps by two |
| 伏吟 | 伏吟有尅還為用，無尅剛干柔取辰，迤邐刑之作中末 · 若也自刑為發用，次傳顛倒日辰併〈陽日用辰，隂日用日〉 | a control on a still board answers it by the ordinary rule; otherwise the stem's seat on a yang day and the branch on a yin one, punished onward, crossing to the other seat when the opening punishes itself |
| 返吟 | 返吟有尅亦為用，無尅别有井欄名 · 若知六日該無尅，丑未同干丁己辛，丑日登眀未太乙 | a control answers it by the ordinary rule; otherwise the 驛馬 |

### Three clauses the engine recovered, and the text states

`docs/history/13-liuren.md` records three corrections found by asking what rule
reproduces two independent implementations where they agree. Each is in the
verse, and none was known to be there when it was made:

- **伏吟有尅還為用.** The engine had dispatched 伏吟 before 賊剋, so a still
  board was never asked whether it showed a control. The correction — the
  board is answered by the ordinary rule and named 杜傳 — is the verse's own
  first clause, and 「若也自刑為發用」 confirms the crossing that follows it.
- **孟深仲淺季當休.** That where a candidate stands is asked before how deep it
  waded was inferred by scoring one ordering against the other, 95.8 % to
  90.5 %. It is a whole line of the verse. So is 「行来本家止」, which is the
  direction the count runs — forward to the home palace, the reading that
  scored 95.8 % against 58.2 % for counting backwards.
- **論尅不論遙.** That 八專 is decided before the board is read at a distance
  was inferred from every remaining 遙剋 disagreement falling on a 八專 day.
  The compilers put it in the section's interlinear note, in four characters.

**The lesson is not that the method worked.** It is that the text was available
throughout, and reading it first would have cost an afternoon and saved three
rounds of scoring. The order phase 13 set — find a runnable reference before
writing a rule down — is right against memory and wrong against a text that can
be quoted. Phase 15 was written with that in front of it.

### 返吟, which no reference could check, and the text checks exhaustively

`liurenBoard` marks every 返吟 board `unverified`, and still does — but what
the surfaces say under that flag has changed, because what they said became
false. «This rule is unfalsified» was true when no implementation covered it
and nothing else did either. `kinliuren` defines
the method and never dispatches to it. The verse closes that gap and closes it
completely: 「若知六日該無尅，丑未同干丁己辛，丑日登眀未太乙」 — only six day
pillars can reach a 返吟 with no control, they are the 丑 and 未 days of stems
丁 · 己 · 辛, and the 初傳 is 登明 on a 丑 day and 太乙 on a 未 day.

Laying every 返吟 board this engine can produce gives **丁丑 己丑 辛丑 丁未 己未
辛未 and no others**, opening on 亥 for the three 丑 days and 巳 for the three
未 days. 登明 is 亥 and 太乙 is 巳; 亥 is the 驛馬 of 丑 (巳酉丑) and 巳 is the
驛馬 of 未 (亥卯未). The engine reaches both through `horseBranch`, so the text
and this implementation agree on the whole of the rule's domain by two different
routes — the verse enumerating six cases, the engine deriving them.

**So the flag stays and the sentence under it goes.** The field still names a
true fact — no runnable reference covers this rule — and that fact is worth
raising, because it is the one board here whose doctrine no second
implementation could contradict. What it may no longer say is that the rule is
unchecked. The CLI, the drawing, the page and the prompt now report the flag
for what it is: a rule checked against a text rather than against something
that runs, with the text naming every board it can draw. Removing the flag
outright was the other option and was refused for the same reason it exists —
a surface that stops distinguishing kinds of evidence is a surface whose
confidence is uniform and whose accuracy is not.

The same passage's 別責 note enumerates the day pillars that rule arises on —
戊辰 戊午 丙辰 辛未 辛丑 丁酉 辛酉 — and the engine produces exactly those seven
and no others. Neither of these is a sample.

### What the text settled, once it was measured

Three things the verse says and the engine did not. Each was implemented and
run over the whole space before anything was concluded, which is what turned
two of them into something other than what they looked like.

- **復等柔辰剛日宜 — a clause with nothing to do.** 涉害 ties are broken in the
  verse: an equal depth goes to the branch's seat on a yin day and the stem's
  on a yang one. The 四庫 text is unpunctuated and the clause has to be cut out
  of the line by the reader; the two typesettings collated above disagree on
  where — 精校本 gives 「孟深仲淺季當休，復等柔辰剛日宜」, which is the cut read
  here, while 卷一到十 sets the comma one phrase earlier. The difference cannot
  reach the engine, for the reason the rest of this bullet gives, but it is
  what the punctuation of a modern edition is worth: an editor's reading, not
  a witness. `shehai` left a surviving tie to the order of the courses, and
  `docs/history/13-liuren.md` called the disagreements that remain "a question
  for 《六壬大全》".
  The question was put. **A tie survives the palaces on 540 of the 1 380 涉害
  boards, and on none of them does the clause change the answer.** It was tried
  under all three readings of what 辰 and 日 name — the 天盤 branch over the
  day's seat, the seat itself, and the candidate standing on that palace — and
  every one of them either agrees with the course order or has no opinion:

  | reading of 柔辰剛日 | ties | clause agrees | clause has no candidate | **boards moved** |
  |---|---|---|---|---|
  | the 上神 over the seat | 540 | 240 | 300 | **0** |
  | the seat itself | 540 | 24 | 516 | **0** |
  | standing on that palace | 540 | 240 | 300 | **0** |

  So the clause is not carried. A branch that cannot be taken is not a rule,
  and the engine already satisfies the verse wherever the verse has anything
  to say. That the two coincide over 8 640 boards is itself the check.

- **孟深仲淺季當休 — the one place text and implementations part.** The verse's
  own order puts depth first and the palaces second: 「路逢多尅為用取」 then
  「孟深仲淺季當休」. This engine does the reverse, grouping by palace and
  letting depth decide inside the group, which is how phase 13 read it after
  scoring one order against the other. Read in the verse's syntactic order the
  engine scores **8 484 / 8 640 = 98.19 %** against `liuren-ts-lib`; grouped
  first it scores **8 604 / 8 640 = 99.58 %**. The 36 boards that separate them
  are three day pillars — 丁卯, 辛卯, 己亥 — where a candidate on a 季 palace
  is much the deeper and both references take it over a shallower 仲.

  **This is a divergence and is left standing as one.** A verse is not a
  program and its clause order need not be its evaluation order; two
  implementations that disagree with each other 17.6 % of the time agree here.
  The engine follows them, this file says it is a choice, and the alternative
  reading is written down with its score so that changing it is a decision and
  not a discovery.

- **井欄, not 無親 — a name the register caught.** The verse names the 返吟
  board that shows no control 井欄: 「無尅别有井欄名」. This engine's `KETI`
  called it 無親, which no source consulted carries and which nothing in this
  file could ever have supported. It is now `jinglan` 井欄 jǐnglán. This is
  what the register is for, and it took writing the section to notice.

- **One clause is still the engine's own.** `fuyin` takes the 冲 for the last
  transmission when the punishment revisits the middle *or the opening*. The
  verse gives only the first — 「次傳更復自刑者，冲取末傳不論刑」 — and the
  second disjunct is this implementation's reading of a case the line does not
  address. It is marked here rather than left in a comment.

### The runnable references, and what they weigh

Both were run over the whole input space, which this board uniquely permits:
keyed by 月將 rather than by term it is 12 × 12 × 60 = **8 640 boards, and that
is not a sample of the space but the space**.

- **`kinliuren` 0.1.2.9** (PyPI, Ken Tang, MIT) — one pure-Python module, no
  dependencies, and it takes 節氣 · 農曆月 · 日干支 · 時干支 rather than an
  instant, so a comparison isolates the 六壬 construction with no calendar of
  its own to disagree with. Its nine functions are the 九宗門 one for one.
- **`liuren-ts-lib` 3.1.0** (npm, Apache-2.0) — a `jiuZongMen` directory of
  nine modules, taking 月將 · 占時 · 日干支 directly. It answers on all 8 640
  without throwing. (`mingyu-core`, MIT, is the third to try when one is
  needed.)

| | | |
|---|---|---|
| the two references, **to each other** | 7 120 / 8 640 | **82.4 %** |
| this engine vs `liuren-ts-lib` | 8 604 / 8 640 | **99.6 %** |
| this engine where the two references agree | 7 099 / 7 120 | **99.7 %** |

**The middle row is not the interesting one; the first is.** Two independent
implementations of a transmitted procedure agree with each other on 82.4 % of
its input space, which means there was never a single answer to measure
against, and any figure quoted against one of them alone measures distance from
that author's idiosyncrasies as much as from the tradition. The bottom row is
the one that means something: where two disagreeing witnesses agree, that is
the transmitted board.

**And the construction was verified apart from the doctrine.** `kinliuren`
exposes what it built before it chose anything, and over all 17 280 term-keyed
boards the four courses agree **17 280 / 17 280** and the 上剋下 · 下賊上
marking agrees **17 280 / 17 280**. 月將加時, the 寄宮 table, the four courses
and the phase arithmetic under them are correct over the whole space a board can
occupy. What remains contestable is the selection among candidates, which is
doctrine and not computation — and which the verse above now adjudicates.

**Where the disagreements are.** The 21 boards left against `liuren-ts-lib` are
all 涉害 and all one clause: candidates on a 仲 palace against candidates on a
季, where the 季 is much the deeper and both references take it. Tuning past
this point would fit this engine to one implementation rather than to the
tradition, and 0.24 % of the space is a smaller error than the 17.6 % the two
references differ from each other by.

### What the board does not carry

The 課體 travel as `Pattern` does — an identifier, the hanzi, the reading — and
they name a shape of the board. What the manuals hang on that shape does not
travel: choosing the 用神, ranking the transmissions, dating an outcome. The
line is `purposes.ts`'s and falls in the same place.

The **十二天將** carry five-phase assignments the tradition transmits, and the
drawing leaves them in neutral ink for the reason this whole file exists: no
source is registered for them here. They stay uncoloured until one is.

---

## 曆注 — the almanac's page, and the block its own source refuses

**The layer has one option and it is `shensha`.** `dayBoundary` and
`trueSolarTime` say how an *instant* is read and never reach here, because a
page belongs to a date and the same date is the same page for everybody who
opens it. `shensha` is not of that kind: it says which register was copied out,
which is a fact about the page rather than about the reader, and it is the
parallel of dunjia's `method`. Only `xieji` exists — what the 協紀 ratifies, cut
to the day and the bearing — and anything else is refused with
`OPTION_NOT_IMPLEMENTED` rather than quietly served this one. It travels in the
URL, in the MCP schema and on the CLI from before there is a second register,
for the reason `docs/parameters.md` gives: added later it would break every shared
address at once.

The layer dunjia was read beside. It arrives one block at a time; **建除十二神
is the first**, and it is the block whose one dangerous decision the source
turned out to state in a clause.

### The text

《欽定協紀辨方書》, 三十六卷, imperially commissioned in 乾隆四年 (1739) and in
the 四庫全書 — the one work of its kind that adjudicates between conflicting
rules and says which it rejects, 卷三十六 being a whole chapter of rejections
(辨訛). 卷四 義例二, under 建除十二神, quoting the 厯書
([Wikisource](https://zh.wikisource.org/wiki/欽定協紀辨方書_(四庫全書本)/卷04),
[rev](https://zh.wikisource.org/w/index.php?oldid=787340)):

> 厯書曰厯家以建除滿平定執破危成收開閉凡十二日周而復始觀所值以定吉凶**每月交
> 節則疊兩值日**其法從月建上起建與斗杓所指相應如正月建寅則寅日起建順行十二辰
> 是也

Two rules in one sentence, and this engine implements both: 建 opens on the day
whose branch is the month's and the twelve run forward, and **the officer is
doubled at the 交節**.

### The doubling is not a second rule

「每月交節則疊兩值日」 reads like a special case and is not one. Nothing in
`almanac.ts` tests for it. The month branch advances on the same date the day
branch does, so their difference — which is the officer — stands still for one
day, and the doubling falls out of the day grain by itself. The `doubled` flag
is reported so that a reader who sees 執 twice can tell a doubling from a
mistake; it changes no arithmetic.

**What makes that work is the grain, and the grain is the decision.** The page
turns on the *date*: the whole of a 節's day belongs to the month the 節 opens,
where a month *pillar* turns at the instant the Sun reaches it. So a chart cast
at nine in the morning of a 節 striking at eight in the evening carries the old
month pillar and the new month's officer, and both are right about different
questions. Had this been built on the pillars instead, the doubling would have
had to be special-cased, and the special case would have been the tell that the
grain was wrong. The rule is 「疊兩**值日**」 — a rule that doubles a *day*
cannot be a rule about an instant.

The day itself is reckoned on **120°E**, as the lunar date is and for the same
reason: an almanac page is a published artefact, and the same instant carries
the same page in Rome and in Beijing. `dayBoundary` and `trueSolarTime` never
reach this layer. This is why the page prints its own ganzhi beside the
officer — in the 子 hours and before a 節 strikes it is not the chart's day
pillar, and a reader is owed the difference rather than left to assume it away.

### What it was checked against

`lunar-javascript`, the same independent implementation every pillar in this
project was verified against, over **every day from 2000 to 2039**:

| | | |
|---|---|---|
| officer and day pillar together | 14 600 / 14 600 | **100 %** |
| doubled days found | 480 | 12 a year, over 40 years |

Tier 2 — consistent with a common implementation — but with a tier-3 text
stating the rule the comparison could most easily have got wrong, which is a
better position than either alone. `liuren-ts-lib` exports a `jianChu` of its
own and is the second runnable witness when a second is wanted.

### 二十八宿值日 — the count, shipped without the doctrine

Its whole content is one number, and one number is what `almanac.ts` holds:
`(dayNumber + 11) % 28`, which puts 井 on 2026-01-01. Nothing about a date
enters it — the cycle counts days, so it crosses a 節 unbroken where 建除
doubles. The two blocks disagree about what a boundary is and both are right.

**The epoch is over-determined, which is why one reference suffices for it.**
Twenty-eight is four sevens, so a lodge keeps one weekday for ever, and the
tradition wrote that check into the names: the 金 of 鬼金羊 is Friday. An epoch
wrong by anything that is not a multiple of seven breaks all twenty-eight names
at once, and a test walks four hundred days asserting the lock.

Against `lunar-javascript`, over the same span as the officer:

| | | |
|---|---|---|
| lodge **and** its 七政 | 14 600 / 14 600 | **100 %** |

**A check the source suggests, which fails and is worth recording anyway.**
卷三十六 says the 楊公忌 are the days the count gives 室 —
「二十八宿次序順數值室宿之日即為楊公忌，不論月之大小，二十八日一週，每月遞退
二日」 — with the received list running 正月十三, 二月十一 and so on. Laying
this engine's 室 days against that list over six years gives **2 of 78**. The
disagreement is the 協紀's own point and the reason the passage sits in 辨訛:
「不論月之大小」 is the complaint, not the rule. A list of fixed lunar dates
cannot track a count of days once the months differ in length, so the folk rule
and the cycle it claims to come from have come apart. The numbers here say by
how much.

### 十二神 — the block where the source does its own work

The one entry here whose rule the 協紀 did not inherit but **derived**, after
rejecting the two accounts it was handed. 卷七 quotes 曹震圭's derivation from
納甲 and calls it 荒唐不經; it quotes 邵泰衢's attempt to pair the twelve with
建除 and says it cannot work, since six of the gods are yang and six yin and
建除 has no such split — 徒多遁詞. Then:

> 今按司命即是子，勾陳即是丑，青龍即是寅，明堂即是卯，天刑即是辰，朱雀即是巳，
> 金匱即是午，天德即是未，白虎即是申，玉堂即是酉，天牢即是戌，元武即是亥。
> **其法以天罡加於建上**，視各神所臨之辰，神吉則吉，神凶則凶。

Each god simply *is* a branch, and the plate is turned by laying the 天罡 on
the 建. The 天罡 is the 厭對, the branch facing the 月厭, so it is `6 − month`;
laying it on the month branch turns the seated twelve by `month − 天罡`, and
`dayGodOf` is that in one line. The source works three months out in full and
all three fall out of it — 卯 and 酉 stand still (it calls that 伏吟), 子 and
午 turn half way (反吟), 寅 and 申 agree. **Those three worked months are the
test**, asserted from the text rather than from the reference.

| | | |
|---|---|---|
| against `lunar-javascript`, 2010–2029 | 7 300 / 7 300 | **100 %** |

**The valence travels; 黃道 and 黑道 do not.** Six gods carry 吉 and six 凶,
named and weighed in one line of 《神樞經》 as quoted there, which is exactly
the case `Pattern`'s valence was written for: an attribute of the god, fixed,
never of anybody's situation. What the engine does **not** repeat is the pair
of words usually used for it, because the same passage empties them:

> 又此司命以下十二神向以黄道黑道命之，今按黄道為日行躔度，無只以子午卯酉寅未
> 為黄道之理；若黑道之説葢不見經傳……然則此所為黄黑道云者，**亦即吉凶之别名
> 而非有深義**決矣。

A source that tells you its own vocabulary is a synonym has told you which of
the two to carry. And the 宜忌 in the same 神樞經 passage —
「所值之日皆宜興衆務」, 「皆不可興土功營屋舍移徙逺行嫁娶出軍」 — is advice and
stays where the officers' 宜忌 stayed.

The 四庫 text writes 元武 throughout, avoiding the 玄 of the reigning emperor's
name. The god is 玄武, as the 六壬 board already has it.

### 年神 — six bearings, and why six is a boundary and not a set

The other axis. A chart chooses an hour **and a direction**, and the 年神 are
what the almanac puts on the second — 卷三 describes each as 所理之地 or
所在之方, a bearing held for a year.

Twenty-six are implemented, which is all of 卷三 but one. Each is one whose position 卷三 states outright and
completely, in its own entry, without leaning on a god defined elsewhere:

| | the source's words | |
|---|---|---|
| 太歲 | the year's own branch | — |
| 歲破 | 「太歲所衝之辰也……子年在午，順行十二辰是也」 | opposite |
| 大將軍 | 「常居四正之位而從歲君之後：寅夘辰歲……居正北，巳午未……正東，申酉戌……正南，亥子丑……正西」 | the cardinal behind the triad |
| 太陰 | 「常居太歲後二辰……子年則在戌，丑年則在亥，寅年則在子是也」 | two behind |
| 黃幡 | 「常居三合墓辰……寅午戌歲在戌，申子辰歲在辰，亥夘未歲在未，巳酉丑歲在丑」 | the 墓 of the triad |
| 豹尾 | 「常居黄幡對衝」 | opposite the 黃幡 |
| 喪門 | 「常居歲前二辰」 | two ahead |
| 弔客 | 「常居歲後二辰」 | two behind |
| 白虎 | 「常居歲後四辰」 | four behind |
| 病符 | 「常居歲後一辰」 | one behind |
| 死符 | 「常居歲前五辰」 | five ahead |
| 大煞 | 「子年在子，丑年在酉，寅年在午，夘年在夘，辰年又在子」, with 「申子辰三合為水，水旺於子」 | the cardinal the year's triad prospers in |
| 劫煞 · 災煞 · 歲煞 | 考原:「劫煞災煞歲煞是為三煞……三合五行絕胎養之位也」, with 李鼎祚's 「寅午戌煞在丑，巳酉丑煞在辰，申子辰煞在未，亥夘未煞在戌」 | the 絕, the 胎 and the 養 of the year's triad |
| 大耗 | 「太歲所衝為大耗」 | opposite, with 歲破 |
| 小耗 | 「常居大耗後一辰」, and 「舊歲破為小耗」 | five ahead |
| 歲枝德 | 「甲既在子則巳上必己，己甲之合也，其所合之神所居之枝」, landing where the entry then says: 「其辰又為死符，又為小耗」 | five ahead |
| 歲德 | 廣聖厯:「甲德在甲，乙德在庚，丙德在丙，丁德在壬，戊德在戊，己德在甲，庚德在庚，辛德在丙，壬德在壬，癸德在戊」 | **a stem**, from the year's stem |
| 歲德合 | 考原:「歲德合者，歲德五合之干是也：甲年在己，乙年在乙，丙年在辛……」 | **a stem**, the 五合 of the above |
| 破敗五鬼 | 厯例:「甲壬年在巽，乙癸年在艮，丙年在坤，丁年在震，戊年在離，己年在坎，庚年在兑，辛年在乾」 | **a trigram**, from the year's stem |
| 奏書 · 博士 · 力士 · 蠶室 | 「常居近歲後維方……初起於乾」, 「常與奏書對衝，如奏書在艮，博士在坤也」, 「在太歲之前隅」, 「與力士對衝」 | **a corner trigram**, by the year's quarter |
| 金神 | 「以年幹五虎元厯之逢庚辛及納音金之位者是也……故甲己年午未申酉為金神也」 | **several branches**, by running the year's months |

**Every one of those enumerations is asserted in `almanac.test.ts`**, from the
text rather than from an implementation — which matters here more than
elsewhere, because this is the one block of the layer with **no runnable
reference to speak of**. `lunar-javascript` returns a direction for 太歲 and
nothing for the other five, and 太歲 is the one that needs no checking, being
the year's branch by definition. So the evidence is tier 3: a text, quoted, and
its own worked lists reproduced.

What *is* checked against an implementation is the year the page belongs to.
The almanac turns its year at 立春 and gives the whole of that date to the new
year, as it gives the whole of a 節's date to the new month; `yearBoundary`
never reaches here, as `dayBoundary` does not.

| | | |
|---|---|---|
| the page's year, against `lunar-javascript` | 10 950 / 10 950 | **100 %** |

**The 三煞 are one rule and are taken as one.** They are also the entry where
two accounts in the same passage check each other: 考原 derives all three as the
絕, 胎 and 養 of the phase the year's triad belongs to, and 李鼎祚 enumerates
歲煞 alone by triad — the two agree on every year, and 歲煞「常居四季」 falls out,
since the 養 of any of the four phases is one of 丑辰未戌. **災煞 has no entry
of its own** in 卷三 and is carried anyway, because the passage states the rule
for all three at once; splitting a group the source states as a group would be
worse than the asymmetry, so the asymmetry is recorded here instead.

**Seats are shared on purpose, and the source states the principle twice.**
太陰 and 弔客 both stand on 歲後二辰. 卷三's 總論 raises exactly that objection
— 「然太隂之方又為弔客者何歟」 — and answers it: 「隂陽之義，美惡不嫌同位，各從
其所用耳」. It gives the geometry too: 歲後二位 and 歲前二位 always form a 三合
with the branch that controls or clashes with the 太歲 — 「太歲在午則後二辰前二
申，申與辰必暗拱子以尅太歲矣」.

The 歲枝德 entry says it again, in general terms, of a branch that is three
things at once: 「其辰又為死符又為小耗……然美惡不嫌同位，吉凶不嫌同名」. And
大耗 stands where 歲破 does. So four of the eighteen share a seat with another
and one branch a year carries three names. **The engine reports all of them, on
the one branch**, and a test holds each pair together across all twelve years.
A table that quietly deduplicated them would be reporting a tidiness nobody
transmitted — and the part that would resolve which name applies is the part
the same passage supplies and this engine refuses: 「死符為營塚等事所忌，小耗
為市易造作等事所忌」, which is 宜忌, an undertaking, a question somebody has to
have asked.

**Two the source itself gives up on.** 蠶室: 「其方位所在必有每歲蠶絲豐歉之占，
**而今不可考矣**」 — there was a divination in it and it can no longer be
recovered. 蠶命: the received table is set out and then disowned in three
characters, 「**此恐有悞**」, with a variant from 《萬全廣濟》 beside it. Neither
is here. A source that says where its own knowledge stopped is the reason this
one was chosen, and taking what it disclaims would be reading past the part that
makes it worth reading.

**The four corner gods are the one entry here that is derived rather than
enumerated, and it has a check.** 卷三 states each of the four as a relation —
the corner behind, the corner ahead, and the two opposites — and says where the
count opens, 「初起於乾」, but gives no per-year table. What supplies the table
is an enumeration of one of the four, quoted from 《萬全廣濟》 in the 蠶命
entry: 「亥子丑年未坤申，寅夘辰年戌乾亥，巳午未年丑艮寅，申酉戌年辰巽巳」, with
the worked case 「假如亥子丑年……蠶室在坤」. The derivation reproduces it on all
four quarters, and since the other three are fixed to 蠶室 by 對衝 and by
前隅 · 後維, one row checks all of them. The footing is weaker than an
enumeration and stronger than a derivation alone, and is recorded as that.

**Not every seat is a branch, and the kinds are not converted into one
another.** 歲德 and 歲德合 are given as **stems**, keyed to the year's stem, so
that is what they carry. A 二十四山 compass does seat eight of the ten stems,
which would let a stem be reported as a direction — but it seats neither 戊 nor
己, and 己 is in the source's own table twice over. Any mapping would be this
file supplying the part the source left out, so `YearGodSeat` is a union and a
surface says which kind it has.

A third kind is a **trigram**, and it is reported as the palace it is rather
than as a compass point, because the source's word is 艮 and not «northeast».

A fourth is **several branches at once**, and it exists for one god. 金神 is not
looked up but *run*: lay the year's twelve month pillars by 五虎遁 and take the
branch of every month whose stem is 庚 or 辛, and of every month whose 納音 is
metal. Both are machinery this file already has and this document already
weighed — the month pillars against `lunar-javascript` over two centuries, the
納音 over 479 charts — so the only new thing is the selection, and the source's
one worked year checks it: 甲己年 comes back 午未申酉, which is what 卷三 says.

**日遊神 cannot be read from this source as it stands.** It is the last anchor
of 卷三 and its body is **empty** in the Wikisource transcription — the heading
is there and the text runs straight on to the chapter's 總論 — and the name
appears nowhere in 卷四 to 卷八 either. So it is neither implemented nor
refused: a printed edition would settle it and none was consulted. Recorded
here rather than filled in, which is the whole habit this file exists to keep.

**Twenty-six, and 卷三 is otherwise read**;
some are stated only inside a discussion the source marks as one opinion among
several — 大耗 and 小耗 arrive inside a 「是亦一説也」 and are not taken on
that footing; and 羣醜 turns out not to be a seat at all but a condition, the
years in which 太陰 and 大將軍 coincide. Each needs reading one at a time,
which is what was done for the twelve above. The boundary is declared here so
that it is a boundary and not an accident.

**And nearly everything the source says about them is left behind.** The bulk
of each entry is 宜忌 — 「其地不可興造移徙嫁娶逺行」, 「所理之地不可興修」,
「不可嫁娶納奴婢進六畜及興造」. None of it travels. What remains is a name and
a bearing, which is exactly what this engine says of a gate or a star.

### 四德 — the first of the month gods

The layer's other half opens here. 卷四 says most of the 月神 are 建除 under
other names — 「凡月神之以十二辰起例者……今一以建除統之」 — so what is worth
adding are the ones that are not, and the four virtues are the first of those:
enumerated, important enough that every printed almanac carries them, and
reckoned from the month's branch rather than round the twelve.

| | the source's words |
|---|---|
| 月德 | 歴例:「正五九月在丙，二六十月在甲，三七十一月在壬，四八十二月在庚」, with 曹震圭's reason, 「寅午戌三合為火，以丙為徳」 |
| 月德合 | 「正五九月在辛，二六十月在己，三七十一月在丁，四八十二月在乙」, and 「即各以月徳所合之干為之」 |
| 天德 | 堪輿經:「正月丁，二月坤，三月壬，四月辛，五月乾，六月甲，七月癸，八月艮，九月丙，十月乙，十一月巽，十二月庚」 |
| 天德合 | 「正月壬，三月丁，四月丙，六月己，七月戊，九月辛，十月庚，十二月乙是也。**四仲之月天徳居四維，故無合也**」 |

**Four tables that are really two.** Each 合 is the 五合 of its own 德 and the
source says so, so the pair states the same fact twice and the second is a check
on the first. The 天德 of the four 仲 months is a **corner trigram**, not a stem
— which is why those months have no 天德合, and why no day can carry a 天德
there: 「所理之方」 is a bearing and 「所值之日」 is a day, and a trigram is only
ever the first.

**Against the reference, and the disagreement is left standing.**

| | | |
|---|---|---|
| 天德合 | 3 650 / 3 650 | **100 %** |
| 月德合 | 3 645 / 3 650 | 99.86 % |
| 天德 | 3 635 / 3 650 | 99.59 % |
| 月德 | 3 624 / 3 650 | 99.29 % |

`lunar-javascript`'s 吉神 list marks these on a handful of days the quoted tables
do not, and by a rule that has not been identified. **The tables are shipped as
quoted**: each is enumerated whole in the source, each is confirmed by its own
五合 partner, and 天德合 agreeing on every one of 3 650 days is a strong check
on the 天德 table it is derived from. The reference is one implementation and
the register weighs it as one. The disagreement is recorded rather than tuned
away, and it is unexplained rather than dismissed.

**An error this comparison caught**, worth recording because it is the kind the
tests could not: the 天德 table was first entered with 癸 where the text has 庚
for the 丑 month. 天德合 fell to 98.4 % and 天德 to 98.0 % at once, and fixing
the one cell took 天德合 to 100 %. A table checked only against itself would
have kept it.

### 神煞 — the seven a day carries or does not

From 卷五, and they share a shape rather than a key: each is a quality a day
either has or has not, and what decides it is the month's branch, the season, or
nothing at all. They are the first entries under the `shensha` parameter of
`docs/parameters.md`.

| | the source's words | keyed to |
|---|---|---|
| 天赦 | 「春戊寅，夏甲午，秋戊申，冬甲子是也」 | the season, and a whole pillar |
| 四相 | 「春丙丁，夏戊己，秋壬癸，冬甲乙」, with 曹震圭's 「春木王生丙丁」 | the season, day stems |
| 解神 | 「正二月申，三四月戌，五六月子，七八月寅，九十月辰，十一月十二月午也」 | the month, one branch to each pair |
| 九空 | 「正月在辰，逆行四季」, and 曹震圭's 「寅午戌月火庫在戌，辰能衝散也」 | the month's triad |
| 五虛 | 「春巳酉丑，夏申子辰，秋亥卯未，冬寅午戌」, 「春木旺，巳酉丑金絶也」 | the season's 絕 triad |
| 五合 · 五離 | 「五合者寅夘日也」 and 「反此則為申酉」 | nothing — the day branch alone |
| 三合 | 考原:「各與其月建㑹成三合局也」, and 卷六's own twelve-month list | the month's triad, two days in twelve |
| 臨日 | 「陽建之月在三合前辰，隂建之月在三合後辰」, the 按 naming them 定日 and 成日 | the month, one branch |
| 六合 | 「正月在亥，逆行十二辰」, and 考原's 「月建與月將相合也」 | the month's own 六合 partner |
| 天倉 | 「正月起寅，逆行十二辰」 | the month, one branch |
| 大時 | 「正月起夘，逆行四仲」, and 曹震圭's 「月建三合五行沐浴之辰」 | the 沐浴 of the month's triad |
| 遊禍 | 「正月起巳，逆行四孟」, and 「三合五行臨官之神」 | the 臨官 of the month's triad |
| 歸忌 | 「孟月丑，仲月寅，季月子」 | which third of the year the month is |
| 隂德 | 「正月起酉，逆行六隂辰」 | the month, and never a yang branch |
| 要安 · 金堂 · 普護 · 聖心 · 續世 | enumerated month by month, with 曹震圭's 「陽建之月歴寅夘辰巳午未，隂建之月歴申酉戌亥子丑」 | the month, one branch each |
| 陽德 · 天馬 · 兵禁 | 「正月起戌，順行六陽辰」, 「正月起午，順行六陽辰」, 「正月起寅，逆行六陽辰」 | the six yang branches, never a yin one |
| 土符 | enumerated, with 曹震圭's 「春三月歴巳酉丑……夏三月歴寅午戌」 | the month, one branch |
| 月煞 | 「正月起丑，逆行四季」, and the 按: 「在嵗為嵗煞，在月為月煞，無二義也」 | the year god's own rule, read on the month |
| 地囊 | enumerated: 「正月庚子庚午，二月癸未癸丑，三月甲子甲寅……」 | two whole day pillars to a month |
| 月害 | 「正月起巳，逆行十二辰」, and 曹震圭's 六害 reading | the 六害 of the month's branch |
| 天吏 | 「正月起酉，逆行四仲」, and 「三合五行死氣之位」 | the 死 of the month's triad |
| 四絕 | 「四立前一辰也」 | **calendrical**: the eve of each 立 |
| 四離 | 「冬至前一日水離，夏至前一日火離，春分前一日……秋分前一日……」 | **calendrical**: the eve of each 分 and 至 |

**三合's enumeration has one cell that contradicts its own rule, and the rule
is what ships.** 卷六 lists the twelve months and the twelfth reads 丑巳 — which
is the eighth month's entry repeated verbatim — where 「各與其月建㑹成三合局」
gives 巳酉. A month cannot appear in its own 三合, since the list is what forms
a triad *with* it, so this is a copying slip rather than a divergence. The other
eleven cells reproduce the rule exactly, and `lunar-javascript` agrees with the
rule on every one of 3 650 days, which settles it from outside the text.

**臨日 is the reverse case: a derivation that reproduces an enumeration whole.**
「陽建之月在三合前辰，隂建之月在三合後辰」, and the 按 names those the 定 day
and the 成 day — two clauses of 建除, which this layer already computes. All
twelve of 歴例's branches fall out.

**Most of these are stated twice, and the second statement is the check.** 六合
is walked — 「正月在亥，逆行十二辰」 — and also named, 「月建與月將相合也」; 大時
and 遊禍 are each walked round the 仲 or the 孟 and also given as a stage of the
month's own triad, the 沐浴 and the 臨官. Where a source says a thing two ways,
implementing one and testing against the other costs nothing and catches the
transcription.

**九神, of which five are here.** 卷六 says 「自要安至續世凡九神」 and enumerates
要安, 金堂, 普護, 聖心, 續世 month by month; the other four of the nine are not
enumerated in that run and are not guessed at. 曹震圭 gives the shape all five
share — 「陽建之月歴寅夘辰巳午未，隂建之月歴申酉戌亥子丑」, a yang month walking
the yang branches and a yin month the yin — which is what makes five tables one
pattern rather than five things to get wrong separately.

**九空 is stated twice and the two agree.** 「逆行四季」 walks backward round
辰丑戌未; 曹震圭 instead names the branch that clashes with the 墓 of the
month's own triad. They give the same twelve answers, which is the check.

**四相 refuses two stems inside its own derivation**, and the source says so:
「惟庚辛者金也，能殺萬物，故不用」. The producing-phase rule would hand autumn
庚辛 and does not. A test asserts the absence, because that is exactly the
clause an implementation regularises without noticing.

**The valence travels here as it does for the 十二神.** Each entry opens by
naming what kind of thing it is — 解神「月中善神也」, 九空「月内殺神也」,
五合「月内良日也」 — which is `Pattern`'s case: named and weighed in one line,
an attribute of the god rather than of anybody's day. What follows in the same
sentence is 宜忌 — 「其日忌修造倉庫出入貨財」 — and does not travel.

**Against `lunar-javascript`, over 3 650 days:**

| | | |
|---|---|---|
| 天赦 · 四相 · 五離 · 三合 · 臨日 · 大時 · 要安 · 聖心 · 續世 | 3 650 / 3 650 | **100 %** |
| 六合 · 遊禍 · 歸忌 | 3 645 / 3 650 | 99.86 % |
| 金堂 · 普護 | 3 641 / 3 650 | 99.75 % |
| 天倉 | 3 639 / 3 650 | 99.70 % |
| 月害 | 3 650 / 3 650 | **100 %** |
| 天吏 | 3 644 / 3 650 | 99.84 % |
| 隂德 · 陽德 | ~3 625 / 3 650 | 99.3 % |
| 地囊 | 3 462 / 3 650 | **94.85 %**, the weakest here |

**Three of the twenty-eight have no runnable reference, and they are not in one
position.** `lunar-javascript` carries no 兵禁, no 四絕 and no 四離, so no
agreement figure exists for any of the three — the percentages the comparison
first printed for them, 91.7 %, 98.9 % and 98.8 %, were this engine's own days
measured against a constant no, and they are withheld.

But the three do not rest on the same thing. **兵禁 rests on a table nothing
checks.** 四絕 and 四離 rest on one clause each — 「四立前一辰也」, and the eve of
each 分 and 至 — over solar terms this project computes to the second and has
verified against published astronomy. That is tier 1 underneath a rule with no
room in it to be wrong, and it is a stronger position than most of the entries
above with a percentage beside them. The register distinguishes them rather than
filing all three as unverified.

**兵禁 has no figure, and that is the finding.** `lunar-javascript` carries no
such name in either of its lists, so the 91.7 % this comparison first printed
was **this engine's 303 days measured against a constant no** — not an
agreement at all. Of the twenty-six 神煞 here it is the only one the reference
does not carry; it rests on 「正月起寅，逆行六陽辰」 and on nothing that runs.
An agreement percentage against a reference that lacks the entry is not an
agreement percentage, and the number is withheld rather than quoted.

**地囊 caught an error of this file's own, and keeps a real disagreement.** The
first implementation matched the day against a *run* of the month's two pillars
as one string, so `辛未辛酉` matched `未辛` — a day the source never names. That
is fixed. What remains is 94.85 %, the weakest agreement in the layer, and it is
a genuine divergence: the reference marks 地囊 on more days than the enumeration
gives, which suggests a longer table than 卷六 prints. Recorded, not tuned.
| 九空 · 五合 | 3 645 / 3 650 | 99.86 % |
| 解神 | 3 637 / 3 650 | 99.64 % |
| 五虛 | 3 635 / 3 650 | 99.59 % |

The residuals were tested against the obvious explanation and it is not the
right one: **one of the thirty-three disagreements falls on a term day**, so the
month grain is not what parts them. They are unexplained, the quoted tables are
what ships, and 五離 agreeing on every day while 五合 — its own mirror — misses
five is the sharpest hint that what differs is in the reference rather than in
the rule.

**母倉 was read and is not here.** Its table is 「春亥子，夏寅卯，秋辰戌丑未，
冬申酉，**土王後巳午**」, and the last clause needs the 土旺用事 stretches — the
eighteen days before each season closes, when 土 rules — which this engine does
not compute. A 母倉 without them would be right for most of a year and silently
wrong for seventy-two days of it, which is worse than not having one.

### What the source refuses, and what that cost

The phase this block belongs to named 二十八宿值日 as its cheap middle third,
on the assumption that the 協紀 stood behind it. **It does not.** 卷一 records
the compilers searching for a Chinese basis and finding none —
「徧閱羣書莫可考究，及見西域《吉凶時日善惡宿曜經》乃得其說」 — and 卷三十六
辨訛 disposes of it: 「二十八宿選擇之法來自西域……與中國風俗逈然不同……並不可
從」.

A source chosen because it rejects things rejected something, which is the
strongest evidence available that it was the right source. The consequence is
recorded rather than worked around: what 辨訛 refuses is the **宜忌**, the
lodges as grounds for choosing a day, and this engine ships no 宜忌 of any
kind. What may still travel is the **count**, which every printed almanac
carries and which the 協紀 describes accurately while declining to follow it —
but it will travel with the refusal beside it, and its epoch takes its warrant
from the implementations and from the weekday lock, **never from this book**.

### What is not here

**The 禽象**, the animal in the full name 鬼金羊. 卷一 calls the images
「近代方有之」 and then shows how they were made: the four cardinal lodges taken
as rat, hare, horse and cock, and the rest fitted round them by resemblance —
附會, the source's own word for it. A construction a source dates late and
shows the workings of is not a transmission. Out, as 三奇得使 is. The 七政 do
travel, because they are how the lodge is named and because they are the check
above.

**Three lodge identifiers are not bare pinyin.** 尾 wěi, 危 wēi and 胃 wèi
collide once the tone is dropped, so they keep tone numbers — `wei3`, `wei1`,
`wei4` — as 驚門 and 景門 do. 壁 and 畢 are both **bì**, the same syllable in
the same tone, where the tone number has nothing left to say; they take the one
thing the cycle already orders them by, their place in it: `bi13` and `bi18`.
This is the rule in `CLAUDE.md` extended by exactly one case, and it is written
down here because it is the kind of thing that otherwise gets re-decided
differently next time.

The 宜忌 of each officer — what the 協紀 says 建 suits and 破 forbids — is the
largest and best-attested thing in the source, and it is refused. It is advice:
ordering days, dating an act, telling somebody what to do. The line is
`purposes.ts`'s, and it falls in the same place it falls for the gates. The
glosses in the catalogs translate the officer's *name* and nothing else: 危 is
the officer called danger exactly as 死門 is the gate called death.

The ~100 further entries of 義例 (卷三 to 卷八) are not here yet. Much of what
looks like a hundred quantities is one quantity under a hundred names — 卷四
says so itself, 「凡月神之以十二辰起例者……今一以建除統之」 — and the block
above is that one quantity.

---

## 七政四餘 — the board whose numbers come from the sky

The first board here that computes nothing by cycle. Where dunjia turns nine
palaces by rule and 六壬 twelve, this one asks an ephemeris where eleven
things are and says which 宿 and which 宮 that falls in. So the tiers work out
differently from everywhere else in this file: the *positions* are tier 1 and
not by a small margin — Swiss Ephemeris, the same library the solar terms
already stand on — and every difficulty has moved into the **frame**, which is
the question of where the twenty-eight begin.

### The frame, which is twenty-eight stars and not a table

A 宿 begins at its 距星. That is not this project's reading of anything; it is
what a 宿 is, and the 曆 tabulated widths *because* they had measured those
stars. The tables then disagree with each other because they were measured
centuries apart and precession moved everything between: the 黃道宿度 of
《授時曆》 and of 《時憲曆》 are the same sky read twice, a little under four
degrees apart.

So the boundaries here are not tabulated. `packages/core/data/sefstars.txt`
holds the twenty-eight 距星 and sweph places them at the instant of the chart,
proper motion and precession included. **No epoch is chosen, because none has
to be**, and the frame is correct in the eleventh century and the twenty-third
alike. `xiudu` keeps `shixian` and `shoushi` as declared values, refused with
`OPTION_NOT_IMPLEMENTED`, for whenever one of those tables arrives with an
epoch that can be cited.

**A source inside the tradition makes the same argument.** 曹仁麟's
《星度指南》 prints a 同治甲子黃道新尺歌 — the lodges against the twelve palaces,
laid for an epoch of 1864 — and then annotates its own table: 「按各宿度，歷數
十年而有差移。但未滿一度，無關出入。若歲月積久，則須改用新尺，星曆家可依歲差
定例推算而知也。」 The degrees drift over decades; under one degree it does not
matter; once enough time has passed the ruler has to be replaced, and
precession is how a 星曆家 knows the new one. That is this section's argument,
made by a practitioner in 1941 about a table of his own — and it is the reason
the two 曆 tables stay refused rather than shipped as constants: a constant is
a ruler nobody replaces.

Twenty-six of the twenty-eight lines are copied **verbatim** from the
`sefstars.txt` distributed with Swiss Ephemeris, which is AGPL as this project
is. Two are below its magnitude 5 cut — 胃宿一 (35 Ari, V 4.67) and 鬼宿一
(θ Cnc, V 5.34) — and carry SIMBAD's ICRS astrometry in the same columns,
marked as such in the file. The identification of all twenty-eight is the
standard one and is the list the Chinese Wikipedia article on the 二十八宿
gives; three of them are corroborated from inside the Swiss Ephemeris file
itself, which happens to carry 亢, 房 and 張 under their Chinese names against
κ Vir, π Sco and υ¹ Hya.

### 觜 and 參, which is the finding

The one place the list is a choice, and it is a large one.

Precession does not move the 距星 together. It drove the width of 觜 down
through zero, so that after the thirteenth century φ¹ Ori stood **east** of
δ Ori and the two 宿 came out in the wrong order — with 觜, the needle of the
twenty-eight, holding 參's width and 參 reduced to a sliver. The Jesuits at the
end of the Ming met this by printing 參 before 觜, which was resisted. In
乾隆十七年 (1752) 《儀象考成》 settled it the other way: it **moved the two
distances**, to λ Ori for 觜 and ζ Ori for 參, and the transmitted order came
back.

**《欽定儀象考成》, 允祿 et al., 四庫全書本 子部 天文算法類, 卷一 恆星總紀** —
the work states it, and states its reasoning, in one passage:

> 二十八宿次舍，自古皆觜宿在前，參宿在後。其以何星作距，古無明文。《唐書》云
> 「古以參右肩為距」，失之太遠。《文獻通考》載宋兩朝《天文志》云「觜三星距西
> 南星，參十星距中星西第一星」。西法觜宿距中上星，參宿亦距中西一星。今按：
> 觜宿中上星在西南星前僅六分餘，而西南星小、中上星大，則以中上星作距可也。
> 若參宿以中西一星作距，則觜宿之黃道度已在參宿後一度餘，即赤道度亦在參宿後
> 三十一分餘。今依次順序，以參宿中三星之東一星作距星，則觜宿黃道度恆在參前
> 一度弱，與觜前參後之序合。

觜's 距 is 中上星, which is λ Ori; 參's is 中三星之東一星, the eastern of the
belt's three, which is ζ Ori. Three prior assignments are named and refused on
the way — the 《唐書》's 參右肩 as 失之太遠, the Song 《天文志》's pair by way of
《文獻通考》, and the 西法's own 參距中西一星 — so the choice is argued and not
merely decreed. The passage is at PDF pp. 7–8 of the 卷一~卷三 scan on the
shelf; the reading was taken off the page images, the OCR of that volume being
worthless.

This engine takes the Qing assignment, and the measurement agrees with the
authority rather than standing in for it:

| laid with | ring closes | out of order | width of 觜 |
|---|---|---|---|
| φ¹ Ori and δ Ori | yes | **1 of 28** | **−1.24°** |
| λ Ori and ζ Ori | yes | 0 of 28 | 0.97° |

**0.97° is the text's own 一度弱, and the text's own table says so twice
over.** 儀象考成 counts 360 to the circle, as its 宮度分秒 columns do, so
「觜宿黃道度恆在參前一度弱」 is the quantity this engine measures from the
stars. It is also a quantity the work computes, in 卷七 恆星黃道經緯度表六
黃道實沈宮, where the two 距星 stand at 觜宿一 申 20° 07′ 18″ and 參宿一 申
21° 06′ 45″:

| 觜's width, 參宿一 less 觜宿一 | |
|---|---|
| the table's own two numbers | 0° 59′ 27″ = **0.9908°** |
| the stars, through sweph | 0° 58′ 29″ = **0.9747°** |

Fifty-eight arcseconds apart, both of them 一度弱, and neither derived from
the other. **The 距星 the engine reads and the 距星 the source tabulates are
the same two stars in the same place to within a minute of arc**, which is the
comparison this section could not make while the work was only cited.

The same page carries the prose's other number. 卷一 says the 中上星 stands
「僅六分餘」 ahead of the 西南星; the table puts 觜宿二, the 西南星, at
申 20° 00′ 51″, which is **6′ 27″** behind 觜宿一. The argument and the
ephemeris agree with each other, which is not something either could establish
alone.

**The verification of the frame is over-determination, and it is now joined by
three stars checked against printed places.** Nothing here copies a table of
宿度 — there is no reference implementation of "the boundaries are where the
stars are" — so what carries the frame is the same argument the 值日宿 epoch
stands on: twenty-eight widths, each with a transmitted shape, and the ring
has to close on 360°. A single wrong 距星 either reverses a pair or doubles a
width. 觜 is the tightest of the twenty-eight constraints, about a degree wide,
and only one pair of stars threads it. The test walks the ring at five epochs
from 1700 to 2200.

**What the 儀象考成 scan adds is printed places at a stated epoch.** 卷二
declares it — 「今以乾隆九年甲子恆星黃赤經緯度…各將赤道歲差列於其下」, so
**1744, with per-star precession** — and 卷二 to 卷十三 carry one 宮 apiece,
which is where the twenty-eight are. Three have been read off so far, the two
of the 觜/參 finding above and 斗宿一, which is the one whose row can be given
in full because its page carries every column:

| 斗宿一 φ Sgr | 儀象考成, 1744 | this engine, 1744-01-01 | Δ |
|---|---|---|---|
| 黃道經 | 丑 6° 35′ 42″ | 丑 6° 35′ 41.5″ | **0.5″** |
| 黃道緯 | 南 3° 54′ 35″ | 南 3° 55′ 17.1″ | 42.1″ |
| 赤道經 | 丑 7° 24′ 13″ | 丑 7° 24′ 12.4″ | **0.6″** |
| 赤道緯 | 南 27° 13′ 25″ | 南 27° 13′ 34.7″ | 9.7″ |
| 赤道歲差 | 加 57.07″/yr | 56.32″/yr by m + n·sin α·tan δ | 0.75″ |

**The column that misses is not the column the frame reads, and the table
misses it against itself.** Carry the table's own 赤道 place to the ecliptic
under 儀象考成's own 黃赤大距 of 23°29′30″ and its 黃道經 comes back to the
last printed digit, 0.0″; its 黃道緯 comes back 29″ away. Under the true
obliquity of 1744, 23°28′28″, the longitude is still right to 0.5″ and the
latitude is 32″ off the other way. So the 黃道 columns are computed from the
赤道 ones rather than measured twice — they are not two witnesses — and the
latitude column is the weak one in the source, not here.

**斗宿一's sub-arcsecond agreement is luckier than the catalogue is good, and
觜宿一 is the proof.** Three stars now have residuals in ecliptic longitude:
0.5″ for 斗宿一, 7.6″ for 參宿一, and **50.5″ for 觜宿一**. Tens of
arcseconds is the honest scale of an eighteenth-century place — the
declination residual said so before there was a second star to confirm it —
and a coordinate landing inside a second is chance. Read the table as good to
about a minute of arc per star and no better.

A minute of arc is still far finer than anything this frame is asked for. A 宿
boundary decides which lodge a planet is in; the narrowest of the twenty-eight,
觜, is a degree wide, so the worst residual here is a seventieth of the
tightest question the frame ever answers, and against an average 宿 of some
thirteen degrees it is under a thousandth. **What the check establishes is
that this frame and a printed
Qing frame describe the same stars, at an epoch 282 years back, well inside
the tolerance the board reads them at.** Twenty-five of the twenty-eight
remain unread; 卷二 to 卷十三 are on the shelf, so it is work rather than a
gap.

Against the transmitted 赤道距度 in 365¼ 度 — which is a *different quantity*,
equatorial where these are ecliptic, and so a check on shape and never on
value — the twenty-eight come out ordered alike and sized alike: 井 widest at
both (30.4° against 33), 鬼 narrow at both (4.6 against 4), 房 4.9 against 5,
室 15.7 against 16, 張 18.0 against 18. Read that as the shape agreeing, not
as the numbers agreeing; where they differ by three or four degrees, the
obliquity is the reason and neither is wrong.

### 四餘 — three of them, and why the fourth is missing

**羅睺 is not Rahu, and this is the parameter most likely to be set wrong by
someone reasoning from India.** The name moved twice. 羅睺 began as the
ascending node; from the late Tang and early Song it was the **descending**
node (交初), and 計都, which had begun as the lunar apogee, took the ascending
one (交中). 湯若望's reform for the 時憲曆 put them back the Indian way round.
The 星命家 did not follow: the astrological tradition keeps the old law, 羅睺
at the descending node as 火餘 and 計都 at the ascending as 土餘. So `luohou`
defaults to `descending` — the art's convention, not the calendar office's —
and `ascending` is implemented, since it is one call either way and a reader
working from a Qing 曆 needs it.

月孛 is the lunar apogee, which is 計都's original definition inherited, and it
is 水餘.

**The three that are computed are computed as mean elements, deliberately.**
They are 隱曜 — positions rather than bodies, none of them ever observed — and
what the tradition transmits for them is a mean motion: eighteen years and
some for the nodes, a little under nine for the apogee. The osculating node
swings a degree and a half either side of the mean inside a fortnight, which
is a quantity no text that names 羅睺 was ever describing. `SE_MEAN_NODE` and
`SE_MEAN_APOG`, and the choice is stated here because nothing in the output
would reveal it.

**紫氣 is off, and the output says 三餘 — but the reason is narrower than it
looks, and one wrong version of it is worth stating so nobody re-derives it.**

The rate is not in dispute. It arrives three ways and they are one motion:

| transmission | rate | round |
|---|---|---|
| 一年一宿, one lodge a year — the common statement, referred to the 閏法, since nineteen years take seven intercalations and twenty-eight about ten | 12.857 °/yr | 28.00 yr |
| 一日行一度 over twenty-eight days — 劉定之 (1409–1469) 《雜志》, in a table of Babylonian goal-years; reported in Kotyk, *The Sinicization of Indo-Iranian Astrology in Medieval China*, Sino-Platonic Papers 282, pp. 54 and 79 | 12.857 °/yr | 28.00 yr |
| 一日行三分五十七秒 — 《三辰通載》, quoted in 《古今圖書集成》 星命部 | 12.857 °/yr | 28.00 yr |

**The trap is the unit, and it is the reason this row exists.** A 度 is
¹⁄₃₆₅.₂₅ of the circle, not ¹⁄₃₆₀. Read "one degree every twenty-eight days"
as ¹⁄₃₆₀ and the round comes out 27.60 years and the rate 13.044 °/yr, which
disagrees with 一年一宿 by 0.19 °/yr — enough to look like a second tradition
and to put 紫氣 two lodges elsewhere within a century. Read it as 度 and it is
365.25 ⁄ 28 = one circuit in twenty-eight years, which is 一年一宿 stated
arithmetically. The two are the same rate and always were. A 七政四餘天星擇日
lecture giving 每日行兩分六秒 sexagesimally — 12.783 °/yr — is the same figure
rounded, 2′07″ being the exact value.

**It is stated as a procedure, with an epoch constant, in two independent
lines.** 《古今圖書集成》 星命部 carries a 定度法 for each of the eleven under
the heading 三辰通載·紫氣, and 《張果星宗》 卷八 氣星篇 carries the same one.
Both read, character for character:

> 置積日減一千二百八十八。以一萬二百二十八大數除之。不盡爲殘分。轉一當十。以
> 二百八十爲一度。二十八爲一分。次下除爲秒。平行：一日行三分五十七秒。

Two witnesses, which is the count this file asks for everywhere else.

Take the accumulated days, **subtract 1288**, divide by the 大數 10228, take
the residue tenfold, 280 to the 度 and 28 to the 分. The scheme closes on
itself: 10228 × 10 ⁄ 280 = 365.29 度, a circle; the rate 10⁄280 = ¹⁄₂₈ 度 a day
is 3.57 分 at 一度百分, which is the 三分五十七秒 printed; and 10228 days is
28.001 tropical years. Nothing here is approximate except the arithmetic of a
fourteenth-century almanac.

**And the system it sits in is checkable, which is what gives it weight.** The
same 定度法 series gives 羅睺 「置積日加五百六十，以六千七百九十四逆遊數除之」
and 月孛 「置積日加一千二百三十五，以三千二百二十五大數除之」 — 月孛's also in
both witnesses, 計都 being 「將羅睺定度加半周天數」 and so not independent.
Against the sky:

| | 大數 | true period | error |
|---|---|---|---|
| 羅睺 · 計都 | 6794 d | 6793.48 d, the mean node | **0.01 %** |
| 月孛 | 3225 d | 3231.50 d, the mean apogee | 0.20 % |
| 紫氣 | 10228 d | — | — |

So this is not a table someone invented for a quantity with no referent: it is
a working ephemeris whose two verifiable constants are right, carrying a third
for a body that has none.

**The origin those constants count from is not stated, and was solved for
here — twice, both times inconclusively.** The offsets are all present, −1288
for 紫氣, +560 for 羅睺, +1235 for 月孛, but they are offsets *within* an era
whose origin the passage never gives; the modern gloss beside it is confused,
calling 積日 「太初元曆起始至作者著書的年數」, years where the arithmetic needs
days.

Inverting the two real rules against this engine's own positions does not
recover it. The residues cannot: 羅睺 fixes 積日 modulo 6794 and 月孛 modulo
3225, and since gcd(6794, 10228) = 2, **no combination of the two determines
紫氣's phase modulo 10228** — the moduli are near-coprime and the information
simply is not there. Searching the absolute origin instead needs the zero of
the 度 scale, which the passage also does not state: left free it absorbs
everything, and candidate origins recur about every six years. Fixed at
角宿初度 — the reading the source's own 二十八宿度數 table argues for, since it
begins 「角木十一度，亢金十度」 — the search returns one origin per 1395 years,
but on an assumption no source supports.

**And it would not matter, which is the finding.** Calibrate the whole system
at 1300, near the texts' own era, and let the two checkable rules run:

| | 1300 | 1500 | 1700 | 1886 | 2026 |
|---|---|---|---|---|---|
| 羅睺 | 0.92° | 0.59° | 0.26° | 0.03° | 0.25° |
| 月孛 | 0.42° | 17.95° | 37.51° | 55.56° | **69.23°** |

Two remainders, one table, one kind of rule, and after seven centuries one is
good to a quarter of a degree and the other is wrong by a fifth of the circle
— more than two palaces. The difference is the 大數: 6794 days against a true
6793.48 is an error of 0.01 %, while 3225 against 3231.50 is 0.20 %, and 0.20 %
compounds to 69° over 726 years.

紫氣's 大數 is 10228 and there is nothing to weigh it against. It might be a
羅睺 and it might be a 月孛, and **the test that would say which is having a
referent in the sky, which is the one thing 紫氣 does not have.** So the
uncertainty on a modern 紫氣 is not a missing epoch that better sources would
supply: it is unbounded in principle, somewhere between a quarter of a degree
and a couple of palaces, and no source can close it because closing it is not
a matter of transmission. `ziqi` keeps `off` as its default and `yinianyisu`
as a named, refused value. The board reports three remainders rather than
quietly printing four.

For what it is worth against a future check: 曹仁麟's 《星度指南》 (preface
民國三十年, 1941) 第七篇 works a chart for 光緒丙戌年十月十一日寅時 —
**1886-11-06**, whose four pillars 丙戌 · 戊戌 · 庚午 · 戊寅 and lunar date
10/11 this engine reproduces — and puts 炁 in 巳宮, with 羅 and 孛 in 亥宮 and
計 in 巳宮 where the engine computes 羅睺 亥 3.55°, 月孛 亥 9.16°, 計都 巳
3.55°. It fixes a palace and not a degree, ±15°, the plate that would carry
the degree being a scan whose cells do not resolve — but it is an independent
test any solved origin has to pass.

### 命宮 and the twelve 宮

The palaces are cut at the 中氣, which is to say at every thirtieth degree of
the Sun's own longitude: 春分 opens 降婁 at 戌, and the twelve run backwards
against the branches down to 娵訾 at 亥. **This is the same ring that seats
the 月將 of a 六壬 board**, and where the two boards are laid on one instant it
is one fact printed twice — which is the reason a prompt takes one board and
never two. The older definition, where a 次 is a stretch of 宿度 (星紀 from
斗十二度 to 女七度) and so rides the stars instead of the seasons, is the
declared and refused value `gong: 'ci'`; the two were one thing once and
precession has parted them by weeks.

命宮 is 立命 by 加時, which the texts state in one line: 「以生時加在太陽所在
之宮，順數至卯，即是命宮」. The hour of the birth is laid on the palace the
Sun stands in, and the palaces are counted forward to 卯. **It yields a palace
and no degree**, which is what the rule has to give; `minggong: 'ascendant'`,
the degree actually rising, is declared and refused because it is a second
method and not a sharper reading of the first.

The rule is checked against the sky rather than against a worked example,
which is stronger than either: at 卯時 it returns the Sun's own palace, which
is what sunrise means; at 酉時 the opposite palace, which is sunset; and at
午時 the palace ninety degrees along, which is where the ascendant stands when
the Sun culminates. A rule laid the other way round fails all three.

### 人事十二宮 — carried on over-determination, and the check written out

命宮, 財帛, 兄弟, 田宅, 男女, 奴僕, 夫妻, 疾厄, 遷移, 官祿, 福德, 相貌. They
follow from the 命宮 by counting, and **the counting has a direction that no
source consulted states in terms another could be held against.** Two agreeing
sources was not available. What is here instead is the argument the 值日宿
epoch is here on: a structure with more constraints than it has freedom, so a
wrong answer breaks many things at once and the right one breaks none.

**First, these are the Hellenistic houses in the Hellenistic order.** Wealth
second, siblings third, home fourth, children fifth, servants sixth, spouse
seventh, illness eighth, travel ninth, office tenth, fortune eleventh. Twelve
for twelve, and that is not surprising — 七政四餘 reached China through the
Persian and Indian transmission that carries the same twelve.

**Second, they are not 紫微斗數's twelve**, which is the list one would fear a
Chinese ring of branches had been contaminated by, since that system shares
the ring and counts 逆 around it. Its order is 命, 兄弟, 夫妻, 子女, 財帛,
疾厄, 遷移, 奴僕, 官祿, 田宅, 福德, 父母 — a different list in a different
order, so its convention has nothing to lend.

**Third, and this is what settles it: only one direction fits the names.** Lay
the twelve zodiacally, ascending against the branches, and 田宅 — land and
house — falls a quarter turn along where the sky is deepest, and 官祿 — office
— three quarters along where it is highest. Lay them the other way and those
two swap: the home lands on the tenth place and the office on the fourth. Ten
of the twelve come out wrong. Only 命 and 夫妻 survive a reversal, because
those two are the axis it turns about, which is exactly why the axis proves
nothing on its own. `test/qizheng.test.ts` asserts the ten.

**Fourth, an independent quantity agrees.** The 運限 — how many years each
palace holds, and the order they are walked in — is transmitted separately:
命宮十五, 貌宮十, 福德妻宮十一, 官祿十五, 遷移八, 疾厄七, 財帛兄弟五,
田宅子孫奴僕四年半, walked from 命宮 「順行」 and glossed by the source that
carries it as 「西洋占星逆行」. The limits therefore run 命 → 相貌 → 福德 →
官祿, which is the numbering *descending*; so the numbering climbs the other
way, which is zodiacally, which is this. The allotments themselves are not
implemented — that is a 運限 layer and this phase has none.

**Weigh this as what it is.** It is one web source for the 運限 gloss and
three derivations, not two independent statements of the rule. It is the same
class of evidence as the 值日宿 epoch and a weaker class than a runnable
reference, and it is recorded here so that whoever finds 《果老星宗》 stating
the direction outright can confirm it or overturn it in one commit — nothing
else on the board moves with it.

**One identifier is not bare toneless pinyin, for a new reason.** 疾厄 is
jí-è, and toneless that is `jie`, which reads as one syllable and is not. The
reading carries it back — and carries it back **without the apostrophe**
standard pinyin would write (jí'è), because the convention this project
already keeps does the same work: one tone mark to a syllable, so `jíè` is
plainly two where `jié` would be one. The apostrophe is only load-bearing in
toneless pinyin, and nothing here is toneless.

### What is not here

**留.** 順 and 逆 are read off the sign of the daily motion, which is a fact
about the sky. A station is a *threshold* on that number — how slow is
stationary — and no source consulted states one. The speed travels in the
output, so a surface that has a threshold can apply its own.

**化曜, 十神, 度主 and the 生剋恩難 relations.** Doctrine, and the layer
《果老星宗》 and 《星學大成》 are made of. The engine computes the geometry and
names what the tradition names, exactly as it does for the gates.

---

## 太乙 — the board whose epoch survives being unsettled

The phase that added this board was **gated on a reading rather than scheduled
as work**, because one quantity could have ended it: an 上元積年 is a single
integer upstream of every placement, and getting it wrong rotates the whole
figure with nothing in the output to complain. `docs/history/20-taiyi.md` put
three questions to the text and said that failing the first was a delivery and
not a failure — the entry left out, the absence written down. All three
answered. What follows is the reading, and it is longer than the others in
this file because the argument for the epoch *is* the evidence.

The text is **《太乙金鏡式經》, 唐 王希明, c. 730, 十卷, 四庫全書本**
([Wikisource](https://zh.wikisource.org/wiki/太乙金鏡式經_(四庫全書本)), the
same edition the 八門 section above leans on for 卷二). It is 王希明's own —
he addresses 玄宗 in the first person throughout and dates one audience to
開元十八年三月二十日 — with one interpolation by a later hand, 卷七's
「置演紀上元甲子嵗至今大宋景祐元年甲戌嵗」, which names a Song year and is not
used here.

### The epoch, which the text states three times and disagrees with itself about

卷一 推上元積年 gives two figures in one paragraph:

> 　　自上元以来嵗代綿逺紀法差殊雖設繁詞備而靡用今從上元甲子到唐開元十五年
> 甲子嵗通前計四萬八百一筭臣按宋琨置元似童兒戯推求人紀之年下求不得日辰上求
> 不得冬至自三百餘年學者何多逮於淳風但效尤而已臣今别修甲子元四分厯法與太乙
> 同元舉而備用得上元甲子冬至引而下之齊距嵗計太乙行宫進不違於四分退不失於元
> 紀自上元混沌甲子之嵗至今大唐開元十二年甲子嵗積得一百九十三萬七千二百八十
> 一筭
>
> 　　上考往古每年减一筭下檢將来每年加一筭

卷三 五子元積年立成法 gives a third:

> 　　置上元甲子至開元十二年甲子嵗積三萬一筭先以周紀法三百六十去之餘以七十
> 二約之不盡為入元局數也

So: **1,937,281**, **40,801** and **30,001**, differing by millions, and the
first of them anchored on 開元十五年 — which is 丁卯, not 甲子, where 開元十
二年 (724 CE) is 甲子. On the face of it this is the failure the phase was
gated against.

It is not, and the arithmetic is the whole finding:

```
1 937 281  mod 360 = 121
   40 801  mod 360 = 121
   30 001  mod 360 = 121
```

**All three are congruent modulo 三百六十, the 周紀法** — and 360 is the
modulus every placement in the 年計 reduces by before anything else happens.
太乙 itself is 積年 mod 360 mod 72 mod 24; the 局 of the 立成 is mod 360 mod
72; the 紀 is mod 360 mod 60; 計神 is mod 60, and 60 divides 360. The three
figures are therefore **one epoch for this register**, and the magnitude is a
question about how far back the mythical 上元 lies rather than a question about
the board. 上考往古每年减一筭下檢將来每年加一筭 does the rest: the count is
one per year in either direction from a stated year, so the epoch is really an
*anchor* — and an anchor is a thing a text can check.

### The text checking its own anchor, four ways

`taiyiBoard({ year: 724 })` has to reproduce every one of these, and
`test/taiyi.test.ts` asserts each:

| 卷 | what the text states for 開元十二年 | from |
|---|---|---|
| 卷一 | 太歲 甲子 | 「置上元甲子積年以三百六十去之不盡以六十去之又不盡命甲子筭外即太嵗所在辰也」 → 1 937 281 mod 60 = 1 → 甲子 |
| 卷二 | 「大唐開元十二年甲子入第三紀」 | 121 = 2×60 + 1 → third 紀, first year |
| 卷一 | 「假令今開元十二年甲子即開門為直使至三十一年甲午嵗即休門為直使」 | 3 361 mod 240 = 1 → 開門, year 1 of 30; thirty years on, 休門 |
| 卷五 | 「今開元十二年甲子在遼東十一年也」 | 13 331 mod 225 = 56, 56 = 45 + 11 → 黃始宮 (遼東之艮地), year 11 |
| 卷五 | 「至今開元十二年甲子計三百七十一年也」 | 13 331 mod 4 320 = 371 |
| 卷三 | 局 49 of the 立成, with every column of that row | 121 mod 72 = 49 |

卷二 推帝王年紀法 then extends the check **outside the Tang and over sixteen
centuries**, listing twenty-six 甲子 years by reign against the 紀 each enters:

> 　　臣希明自周厲王三十七年甲子為上元至大唐開元十二年甲子嵗通計積一千五百
> 六十一年矣
>
> 　　周厲王三十七年甲子入第一紀 … 隋文帝仁夀四年甲子入第一紀　大唐髙祖龍
> ▢四年甲子入第二紀　大唐開元十二年甲子入第三紀

1,561 counted inclusively is 1,560 elapsed, which is 26 × 60 — so both ends
are 甲子, as stated, and 837 BCE through 724 CE is a sixty-year ladder every
rung of which is a datable reign year. Spot-checked against the standard
chronology: 周幽王五年 = 777 BCE, 周定王十年 = 597, 周敬王四十三年 = 477,
秦始皇十年 = 237, 漢武帝元狩六年 = 117, 漢平帝元始四年 = 4 CE, 魏齊王正始五年
= 244, 隋文帝仁壽四年 = 604, and 724 CE at the end. **One entry is
transposed**: 周惠王二十一年 stands third where the ladder wants 周桓王三年
(717 BCE), and 惠王's own 甲子 is 657 BCE, which is the fourth rung. The
transposition is in the list of names and not in the count, and the test
carries the years the ladder requires.

### The parameter, and why it has one value

`epoch` is declared with `jinjing` alone. 《太乙統宗寶鑑》 states another
上元積年 and has **not been read here**, so it is not a value: a branch nobody
has read is worse than a branch that does not exist, and the parameter exists
from the first release so that reading it later cannot break a shared link.
See `docs/parameters.md`, which says exactly this about every divergence and said it
about this one before the reading.

`yearBoundary` is a genuine divergence and stays one. The text nowhere says
where its counted year begins; 立春 is the default because the pillars beside
it turn there, and a board that cut the year elsewhere would be two calendars
in one output. `dongzhi` and `chunjie` are declared and refused — **both of
them, and the refusal is now written as one**: for a while only 冬至 threw and
春節 fell through into the 立春 arithmetic, so a board asked for the lunar
boundary was answered by the solar rule and then recorded, in its own
`options`, the boundary it had not been cut at. The guard names the value it
implements rather than the values it does not, which is what keeps a fourth
one from arriving quietly answered by this one. It bites in `taiyiYearOf` and
in `taiyiBoard` alike: the second takes a year already decided and cuts
nothing, but a board carries the options that produced it, and one that
recorded a boundary nothing here can compute would be saying it was cut
somewhere it was not.

**Which year is being lived is the same question and is answered in one
place.** `taiyiYearAt` reads it off the sky — the civil year of the last time
the Sun reached 315° — and the CLI, the four endpoints and the section all go
through it. Read from each surface's own calendar instead, as they were, the
command cut the year at 立春 while the endpoints cut it at midnight on the
first of January in UTC and the pages in the browser's zone: three answers,
disagreeing for the month between New Year and 立春, one of them cached in
public for a week.

`ji` is the register. 卷二 推太乙用式不同法 sorts the four by subject —
「王者用嵗計，卿士惟月計，師尹惟日計，故時通上下」 — and this engine computes
年計. The other three run the same placements over a count of months, days or
hours.

### The nine palaces, which are not the nine palaces

**The largest thing a reader can get wrong, and the output will never say so.**
卷二 推九宫所主法:

> 　　黄帝又命風后為太乙式九宫皆差一位自晉以前莫詳所以推郭璞曜靈經云地缺東
> 南宫數多者不出於九故差九以填之樂産曰太乙寄理以明人事后王得之以統一天下所
> 以差一宫以就乾位王希明曰太乙統人事以知未来之道故聖人特差一宫以明先知之義
> 也一宫在乾主兾州并州…二宫在離主荆州…三宫在艮主青州…四宫在震主徐州…六宫
> 在兑主雍州…七宫在坤主梁益州…八宫在坎主兖州…九宫在巽主幽州

| | 乾 | 坎 | 艮 | 震 | 巽 | 離 | 坤 | 兌 |
|---|---|---|---|---|---|---|---|---|
| 洛書 | 6 | 1 | 8 | 3 | 4 | 9 | 2 | 7 |
| 太乙 | **1** | **8** | **3** | **4** | **9** | **2** | **7** | **6** |

Every number has moved one seat anticlockwise, so that 一 reaches 乾 —
「所以差一宫以就乾位」. A Qi Men chart and a 太乙 board look identical and agree
nowhere: 一宮 is the north-west here and the north there. This is also why
`packages/plate` draws the board on the nine-palace grid rather than on the
ring 六壬 and 七政四餘 share — the seats *are* the eight outer palaces of a
chart — while every number printed in them is this board's own.

**太乙 walks the numbers, not the compass.** 「命起一宫順行八宫不遊中五」, and
卷三's 立成 settles which order that is by printing 太乙 in 一宮 for 局 1–3,
二宮 for 4–6, and so on to 九宮 at 22–24. So the walk is 1 2 3 4 6 7 8 9, which
zigzags across the board exactly as 順飛 does in dunjia, three years to a
palace and twenty-four to the circuit. The centre is skipped, which is what
makes it eight.

### The sixteen gods, and the eighteen counts they take

卷二 推十六神所主法 gives all sixteen with the reason for each name — 「子神曰
地主，建子之月，陽氣初發，萬物隂生，故曰地主也」 down to 「亥神曰大義」 —
twelve branches and the four corner trigrams:

| 子 | 丑 | 艮 | 寅 | 卯 | 辰 | 巽 | 巳 | 午 | 未 | 坤 | 申 | 酉 | 戌 | 乾 | 亥 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 地主 | 陽德 | 和德 | 呂申 | 高叢 | 太陽 | 太炅 | 太神 | 大威 | 天道 | 大武 | 武德 | 太蔟 | 陰主 | 陰德 | 大義 |

Eight stand at a palace (正宮) and eight between palaces (間神), and that
difference decides what a count opens on. **The element of each is the seat's
own**, which 卷六 states for thirteen of the sixteen in one passage —
「假今髙叢木，以吕申、大炅同類為旺；以大義、地主為相；武徳、太蔟為死；和徳、
大武、太陽、天道為囚；大神、大威為休」 — every one of them the element of the
branch or trigram it stands on, so the remaining three follow rather than being
guessed at.

**The eight palaces take their phase from this table and from nothing else.**
The drawing tints a palace with the element of the 正宮 seat it stands on — the
north is 子 and is water, the east 卯 and wood, the north-east 艮 and earth —
so the eight are coloured by a list 卷六 states rather than by the 洛書
correspondence a reader might assume, which for these directions agrees with
it. The centre is left the colour of the paper: it stands on no seat, and this
board never enters it.

The 天目 counts through them with a period of **eighteen**, because two seats
are held twice, and 卷一 says which and why: 「乾坤二宫二時一移宫，乾為天門，
坤為人門，吉凶之主，天目鬼星之使，至於此門施法奉令，故二時一移」. The yang
count opens at 武德 and pauses at 陰德 (乾) and 大武 (坤); the yin count opens
at 呂申, the seat facing 武德, and pauses at 太炅 (巽) and 和德 (艮). 卷七's
天皇太乙 corroborates the mechanic from the other side: it has a 小周 of
**twenty** and pauses at all four corners, 16 + 4.

### 主算 and 客算, which is what the board exists to produce

卷二 推太乙運式法 states the count in a sentence and then works it:

> 　　第八論主客置筭若得十置一若得二十四棄二十置四餘皆以例而推之各視天目所
> 在宫而行筭若天目在正宫則按本數若天目間神則加一數而行筭至太乙宫止矣
>
> 　　假令太乙在九宫大義為天目後大義一筭地主八筭和徳三髙叢四計得十六

Open on the eye's own palace number if it stands at one, and on **one** if it
stands between two; walk the ring clockwise adding the number of every palace
passed; stop on reaching 太乙's. The worked example is 亥 → 子(8) → 艮(3) →
卯(4), stopping before 巽, and 1 + 8 + 3 + 4 = 16. An eye already standing in
太乙's palace has walked nowhere and its count is the opening term alone, which
is what 陽局 43 prints — 地主 for 天目, 太乙 in 八宮, 主算 八.

始擊, the guest's eye, is a turn of the ring rather than a count: 「以計神加和
徳宫，求文昌所臨宫，以艮為鬼門方求幽冥吉凶，故加和徳而計之」. The 計神 is set
on 和德's seat, the north-east corner, and 始擊 is the seat 文昌 has been
carried to.

**大將** is the count with its tens dropped — 「若得十置一，若得二十四棄二十置
四」 — and a count that is a whole number of tens gives the tens, which is what
若得十置一 says and what 卷九's 「客筭四十大將四宫參將二宫」 confirms.

**參將 is the one step the text never states in words.** It is read off the
text's own worked boards, which put it a quarter turn clockwise from the 大將
without exception:

| source | 大將 | 參將 | | source | 大將 | 參將 |
|---|---|---|---|---|---|---|
| 卷三 陽局 1 主 | 7 坤 | 1 乾 | | 卷六 術三 客 | 3 艮 | 9 巽 |
| 卷三 陽局 1 客 | 3 艮 | 9 巽 | | 卷六 術五 主 | 8 坎 | 4 震 |
| 卷三 陰局 1 客 | 9 巽 | 7 坤 | | 卷六 術五 客 | 9 巽 | 7 坤 |
| 卷一 假十月五日 主 | 9 巽 | 7 坤 | | 卷六 術六 主 | 6 兌 | 8 坎 |
| 卷一 假十月五日 客 | 4 震 | 2 離 | | 卷六 術六 客 | 3 艮 | 9 巽 |
| 卷九 敵使言虚實 客 | 4 震 | 2 離 | | 卷六 術七 主 | 4 震 | 2 離 |
| 卷九 敵國動靜 客 | 7 坤 | 1 乾 | | 卷六 術七 客 | 9 巽 | 7 坤 |

Fourteen instances, one rule, no exception: 乾→艮, 坎→震, 艮→巽, 震→離,
巽→坤, 離→兌, 坤→乾, 兌→坎. **It is induced and not transmitted, and the
engine says so** — `TaiyiSide.assistant` carries the note, and where a count
reduces to the centre the 參將 is `undefined` rather than invented, since the
centre is on no ring and no worked board places one from there.

### The verification, and what it is worth

There is no `lunar-javascript` here. Nothing open computes this board, and the
closed programs that do disagree with each other — so the reference is the
text, which is unusually well equipped to be one. 卷三 prints a **立成 of
seventy-two rows twice over**, 陽局 and 陰局, giving 太乙宮, 天目, 主算, 客目,
客算 and 計神 for every row. `test/taiyi.test.ts` carries all one hundred and
forty-four and drives the same code the year board uses.

**This is the tradition auditing itself, not an independent implementation,
and it is weaker evidence than the pillars have.** Every surface says so. What
it is not is narrow: 864 cells, of which the engine reproduces 850 exactly.

The fourteen that diverge are listed in the test with the row that settles
each, because **thirteen of them are settled by the text against itself** — the
same eye on the same seat with 太乙 in the same palace is printed elsewhere in
one of the two tables with the value the procedure gives:

| | printed | computed | witness |
|---|---|---|---|
| 陽局 39 主算 | 25 | 35 | 陰局 60, and 陽局 38 immediately above it |
| 陽局 50 主算 | 6 | 16 | 陰局 24 |
| 陰局 11 客算 | 36 | 26 | 陽局 62 |
| 陰局 15 客算 | 29 | 25 | 陽局 35, 陰局 63 |
| 陰局 25 主算 | 21 | 31 | 陰局 50 |
| 陰局 26 主算 | 31 | 30 | 陽局 70 |
| 陰局 27 主算 | 39 | 29 | 卷一 推太乙當時法, which states 主筭得二十九 outright |
| 陰局 37 客目 | 大威 | 大武 | 陰局 1, on the same 天目 and 計神 |
| 陰局 43–44 客目·客算 | shifted one row | — | the column re-syncs at 45; 陰局 21 and 陽局 53–54 hold the two values |
| 陰局 70 主算 | 22 | 32 | 陽局 26 |

The one with no parallel is **陰局 46 客算**, printed 二 where the procedure
gives 一. It is the only place either table shows a 正宮 eye standing in 太乙's
own palace at 一宮; 陽局 43 shows the same case at 八宮 and gives 八, which is
「至太乙宫止」 applied to a walk of no length. The engine follows the rule and
the divergence is written down here rather than smoothed away.

Beside the tables, the boards 卷一, 卷六 and 卷九 work out in words are
checked individually — each names its own 局 and prints 大將 and 參將, which
the tables do not — and the 太歲 the count yields is checked against
`yearGanzhi` over four centuries, which is the one check here that does not
come from the text.

### The transliteration decided deliberately

- **太炅 tàijiǒng.** 炅 is jiǒng, brightness, and 卷二 says why the seat is
  called that: 「巽神曰太炅，春夏將交，盛暑方至，陽氣炎酷，故曰太炅」. The
  text writes it 大炅 as often as 太炅; one name is carried.
- **太蔟 tàicù**, as in the pitch-pipe, not `zú`.
- **呂申 lǚshēn**, whose identifier has to drop the umlaut and becomes
  `lushen`. Nothing else in the engine reads `lu`, so the collision the tone
  marks usually guard against does not arise; the reading keeps the ǚ.
- **黃始宮 huángshǐgōng and 黃室宮 huángshìgōng**, two of the five 五福 seats,
  which are the one collision on this board: dropping the tones leaves both
  `huangshi`. They take the tone number, as 驚門 `jing1men` and 景門 `jing3men`
  do — `huangshi3` for 始 and `huangshi4` for 室 — and both carry one, since a
  digit on only the second would say the first is the ordinary one. They were
  `huangshi` and `huangshi2` at first, which numbers the pair by the order the
  table happens to list them in and says nothing a reader could use.
- **太乙 the god of this board and 太乙 the 月將 巳 of a 六壬 board are
  unrelated**, and a reader meeting both is owed the sentence. `liuren.ts:114`
  names the second `label.yuejiang.taiyi`; the catalogs are namespaced and
  nothing collides.

### What is not here

**月計, 日計 and 時計.** Stated in 卷一 and computable from the same tables —
卷六 and 卷九's worked boards are 日計 and 時計 boards — but each needs its own
accumulated count and 卷一's 日計 arithmetic is damaged in this edition
(推時計差法 has a 闕 in the middle of a constant). `ji` is the parameter that
waits for them.

**四神, 天乙, 地乙 and 直符太乙.** 卷五 places all four, and they walk **twelve**
palaces rather than eight — the nine plus 絳宮, 明堂 and 玉堂, which 卷八 gives
分野 for. A different figure on a different ring; not computed, and not drawn.

**掩, 擊, 迫, 囚, 關, 格 and 對 are computed; 四郭固, 四郭杜, 執提 and 提挾 are
not.** The first seven are stated in 卷三 as relations between bodies this
engine places, and each is named and weighed there, so the valence travels as
`Pattern`'s does — and, since phase 21, so does the sentence that earns it.
The last four need the three gates and the five generals read together, and
卷三's account of them turns on which party is 主 and which 客, which is the
question this board does not ask.

### What 卷三 says each condition is, and what it says will happen

The chapter states each one **three times over**, and the three are not the
same kind of sentence. An 經曰 gives the trigger; a 之義 or 者…也 says what the
configuration *is*; then 若… and 嵗計遇之… say what will befall the realm. The
middle kind travels in the output, quoted, for the reason `Pattern.valence`
travels — it belongs to the configuration rather than to anybody's situation.
The third kind does not, and is the dynastic layer this engine declines.

| | carried — what it **is** | left out — what it **foretells** |
|---|---|---|
| 掩 | 掩襲刼殺之義 | 嵗計遇之，王綱失序，臣張君弱，宜修徳以禳之 · 若掩太乙在陽絶之地君凶，隂絶之地臣誅 |
| 擊 | 所為撃者，臣凌君，卑凌尊，下凌上，僭也 | 嵗計遇之，將相相伐之義也 |
| 迫 | 宫迫災㣲緩，辰迫災急疾 | 嵗計遇迫，人君慎之 |
| 囚 | 囚者，簒戮之義也 | 若在陽氣絶氣之地大凶 · 若在絶陽絶隂之地自敗臣受誅 |
| 關 | 闗之為義，但將相怕忌之事，不及於君也 | — |
| 格 | 言政事上下格也 | 若在陽絶之地又與嵗計遇，格不利 · 主客筭不和者必敗 |
| 對 | **none — see below** | 若下目相對之時，皆為大臣懐二心，君逐良將，兇奸生，下臣欺上 |

Three judgements, recorded because they are judgements:

- **迫 has no 之義.** What it has is a paired characterisation of the two
  distances, which says what each *is* rather than what will happen, and which
  the engine already distinguishes in `kind`. Carried on that ground.
- **關's clause is 王希明's own voice**, not the 經's: 「王希明曰，闗之為義…」.
  The transcript does not say so, because a name in every row is provenance
  printed as content; this table is where it is said.
- **格 has a second clause**, 「若格太乙者，盜侮其君」, for the sub-case where
  太乙 itself is blocked. Left out: `TaiyiPatternSubject` admits no 太乙, so the
  engine cannot tell that sub-case apart and the sentence would attach to
  configurations that are not it.

**對 has no such sentence and carries none.** 卷三 gives it a trigger — 「下目
文昌將與太乙衝而相當者為對」 — and then a 若…皆為… list of events, with nothing
saying what 對 *is*. Six of the seven are glossed and the seventh is not, which
is the table telling the truth about its source rather than levelling itself.

### Whose bodies enter each condition

The triggers name their subjects, and the chapter is careful about it in a way
that is easy to read past. Two readings are recorded here because they decide
what the engine reports.

- **格 is the guest's alone.** 「客目大小將與太乙對宫為格」: the 客 qualifies
  the eye *and* the two generals after it. The chapter writes 主客 wherever it
  means both parties — 「若文昌將并主客大小四將」 at 囚, 「主客大小將同宫數齊
  皆為闗」 at 關, three lines above and three below — so a 格 marked on the
  host's 大將 or 參將 would be a condition reported for a configuration the
  source states for nobody. It was marked on all four until this reading was
  made; `test/taiyi.test.ts` now holds it to the guest's three.
- **囚 is reported per body, and 俱 is read as the collective.** 「若文昌將并
  主客大小四將，俱與太乙同宫，總名曰囚」 can be read strictly — all five in
  太乙's palace at once — or as 總名曰囚 naming the class of these standings.
  The second is carried. The first would suppress the condition at nearly
  every year there has ever been, which is a large claim to found on one
  particle; and the engine already reports each body separately in 迫, where
  the same list of bodies is meant one at a time. Recorded as a judgement
  rather than left to the code, because it is one.

Several of the omitted clauses turn on 筭和 / 不和, which this engine does not
compute — see 陰陽和不和 below. That is a second reason they could not travel
even if the first did not hold: they are conditional on a quantity that is not
in the output.

### The per-palace readings of 卷二 — declined

卷二 gives each of the eight palaces a province and an omen, in the same breath
as the numbering quoted above: 「一宫在乾主兾州并州…若文昌將闗囚，必有迫脇君父
之象矣」, 「二宫在離主荆州…若太乙臨之，君誅大臣將相矣」, 「三宫在艮主青州…若
始撃臨之，嬖寵進中宫，兵起」, 「八宫在坎主兖州…若太乙臨之，臣欺君也」.

Neither layer is computed. The 分野 is the geography of the Tang empire and
answers a question nobody here is asking; the omens are dynastic prediction,
which is the class declined throughout. **This is written down because the
readings exist and are specific** — 三宮在艮 with 始擊臨之 is an ordinary
configuration that boards of many years fall into, and the text says exactly
what it portends. A reader who finds this engine silent about it is owed the
reason, which is not that the doctrine is missing.

It is also the answer to a question worth stating plainly: **there is no
non-dynastic interpretive layer in this text to extract.** What 太乙 hands down
for a palace is a province and a political omen. The 之義 clauses of 卷三 are
the whole of what can be carried under the standard this project holds, which
is why the conditions have them and the palaces have nothing.

**陰陽和不和.** 卷二 gives two accounts of it, 張良經's and 王希明's, and they
do not line up: one reads the parity of the 算 against the polarity of the eye's
seat and the other against the polarity of 太乙's palace, and the worked
numbers in between fit neither cleanly. The structural facts both accounts are
built from *are* in the output — 太乙's palace carries `yang` per 卷二's
「八三四九為陽，二七六一為隂」, and the parity of a count is readable from the
count — and the judgement built on them is left out. Where sources disagree,
the entry is left out and the absence is written down.

**Who is 主 and who is 客.** The first interpretive act the system asks for,
and the reader's, for the reason the 用神 is. And the whole received dynastic
layer with it: 卷四 through 卷十 are mostly military and epochal divination —
which state falls, which year an army breaks, 陽九之災 and 百六之厄 — the class
this engine already declines, arriving in a register where it is more dangerous
rather than less, because an epochal reading is falsifiable by nobody and
travels as commentary on real events.

Both of those stayed exactly where they were when the board gained a prompt in
phase 21, and the distinction is worth stating because the two refusals are not
the same shape. The dynastic layer is **refused outright** and the prompt
refuses it a second time in its own words. The assignment of 主 and 客 is
**withheld by the engine and commissioned in the prompt**, which is what already
happens to the 用神: nothing computed chooses it, the reading cannot proceed
without it, and whoever reads says which they took and why. It is made from what
is being looked at and never from the counts — a larger 算 is not a winner — and
this engine still names two numbers and stops.

«What is being looked at» is a **matter**, and it reaches the prompt as one: a
field of view with two sides in it, supplied by the reader, never computed and
never sent to any server. Where none is given the prompt says the assignment was
not made rather than having a model invent a pair of parties, which would be the
whole reading resting on nothing. A matter is not a question, and the difference
is what lets this board be handed over at all: a question about a year puts the
reader inside a figure they are not in. See `prompt.taiyi.hostguest`,
`prompt.taiyi.matter` and `docs/history/21-consultation-taiyi.md`.

**三基 print their period beside their count**, and the reason is a defect this
board produced. 卷五 gives the sovereign thirty years to a fief, the minister
three and the people one, so 民基 stands at 1 on every board ever laid. Printed
as a bare `1` beside a sovereign at `23` it was read as a base newly begun — a
fact nobody computed, produced by a right number without the thing that makes it
legible. `TaiyiFief` carries `period`; the transcript prints `1/1`.

**三基 is computed and unchecked.** 君基, 臣基 and 民基 run on 卷五's opening
count, 「自上元甲寅之嵗至大唐開元十二年甲子嵗積得二十八萬五千一十一筭」, with
「臣今恐速要，自漢安帝元初甲寅為近，至開元十二年甲子嵗積得六百十一筭」 beside
it — and 285,011 ≡ 611 (mod 360), so the two agree as the three main figures
do. It is the one count in this board the text never checks against a date.

**小遊太乙 is the year board's own 太乙, and the text says so:** 「小遊主事見
在嵗計中，自此不復載，天目亦然也」. The two counts bear it out — 3,361 and
1,937,281 are both ≡ 1 (mod 24) and both advance one a year, so they never
part. It is not reported twice.

---

## 五行 of the eight characters — a count, not a weighing

`bazi/distribution.ts` counts the five elements over the eight characters of
a birth: each stem by its element, each branch by its own — the 本氣, the
element the branch *is* in every table this engine already carries. Zeroes are
printed, because the absence of an element is half of what the count exists to
show.

The basis needs no second source: the element of each stem and branch is
tier-1 material, shared with the chart's seasonal states and the 納音, and the
count is arithmetic over it. What **stops at the count** is deliberate: no
weights for the concealed stems, no seasonal multiplier, no 得令/得地/得勢,
no declaration that the day master is strong or weak. Those are the opening
steps of the 扶抑 method and its rivals, the schools state them differently,
and any one of them shipped here would be a school chosen silently. The prompt
says the count is done and that everything past it is a method's step to be
named — see `prompt.bazi.distribution` and `prompt.bazi.noScore`.

---

## 紫微斗數 — a board with no sky, and the two cells the page lost

The tiers invert here in the opposite direction from 七政四餘. There, every
position was tier 1 and all the difficulty was in the frame. Here **nothing is
tier 1 and nothing can be**: not one quantity on this board is astronomical.
紫微 is not a star; no name on the board has a position; the whole construction
is arithmetic on a lunar date, an hour branch and a year pillar. The only
tier-1 input is the lunar calendar underneath it, which phase 1 settled. What
this section has to establish is therefore only ever two things: that the rules
were read off the page correctly, and that the page is the page it claims.

### The witness, and the one that is not on the shelf

**《紫微斗數全書》, 題 陳希夷 撰, Wikisource, in three juan.** 卷一 (`oldid`
7913704), 卷二 (`oldid` 1963110), 卷三 (`oldid` 2268626), each retrieved as
wikitext on 2026-08-20 with a row in `docs/provenance.tsv`. 卷二 is the whole
of the placement layer and the only juan that matters for a computation; 卷一
and 卷三 are interpretive and are not drawn on. **There is no 卷四 to fetch**:
this recension is complete at three, and the 批命 material of the longer
recensions is not in it.

**《紫微斗數全書》(前三卷), 周宣屹 整編, 紫微斗數圈, 簡體整理本.** A second
edition, and the one that turned two of this section's findings around. Its
editor states his method in a preface: an old edition scanned page by page,
converted from traditional to simplified, punctuated, and — the part that
makes it usable as a witness — **where he judges the old text to carry a
copyist's slip he corrects it and prints the original character beside his
correction**. There are 166 such notes, of the form 「'庚'（古文為'甲'）」.
Its base edition is **not named**, which is its one serious weakness and the
reason nothing here rests on it alone; but that base cannot be the Wikisource
lineage, because it carries a 卷四 the Wikisource recension does not have and
because the two disagree in places where neither notes an emendation. Its 卷四
is not reproduced — «由於本卷均為實際案例» — which costs nothing, that juan
being worked 批命 and exactly the material this project declines.

**What is on the shelf and is not a source.** A 456-page 心一堂 facsimile of
the 《紫微斗數捷覽》 (明刊孤本, 1581) with its 點校本 was retrieved and is
**39 watermarked pages drawn at random from it**, sold as a teaser for the
rest. The pages are genuine facsimile of the Ming block and would be worth
having whole — 捷覽 belongs to the *other* transmission, the one 《全集》
belongs to — but a random ninth of a book, with no text layer and the plates
rotated, settles nothing. It has a row in `docs/provenance.tsv` saying so.
**That transmission is no longer the gap it was**: two witnesses of it arrived
and have a section to themselves below.

Three OCR files were on the shelf before this and are **not independent
witnesses**. Two are Chrome print-offs of the same Wikisource 卷一 and 卷三;
the third is a LibreOffice PDF carrying 卷一 through 卷三 whose descent the
owner searched for in August 2026 and could not establish — most likely out of
an old personal backup, and recorded as **untraceable** rather than merely
undeclared, which is a stronger statement and a worse one. None is a scan. The copies in hand may therefore share one lineage, and
this section never rests on their agreement.

**A shelf of school manuals, kept and not used.** 《中國絕學》 (方外人,
臺北金林文化, 1986), eleven volumes, in `texts/juexue`. Volume five is the
《全集》 described below and is filed with the 紫微斗數 texts instead. Four of
the other ten carry 紫微斗數 material — 同步斷訣, 河洛歸元, 細說星情 and
四化斷訣 in the first; 闡微, 析論 and 特例命譜 in the sixth; 四化飛伏斷訣 and
the 占驗·南·北 schools in the seventh; 逍遙子紫微郎秘訣 in the tenth — and all
of it is twentieth-century school teaching: 飛星 and 四化 method, worked
verdicts, per-palace doctrine. **None of it is a source here**, on the ground
《果老星宗》 is declined on. They are kept because a divergence may one day need
a school's name attached to it, and a school manual is where a school's name
lives. Each has a row in `docs/provenance.tsv` saying what it holds. The rest
of the set — 鐵版神數, 奇門易數, 邵子神數, 皇極天書, 玄空金口訣 — is arts this
project does not compute.

**One manual kept for what it names.** Aloysius Han, *Zi Wei Dou Shu 紫微斗数*,
fifth revision (2014), self-published in English, 341 pages, of declared
中州派 lineage. **It states no plotting rule at all** — not for 解神, not for
魁鉞, not for 火鈴 — and what fills it is per-star and per-palace verdict
doctrine, the class declined here. Two things in it earn the shelf space.

Its **四化 table is printed whole**, and it agrees with 《全書》 at 戊
(貪狼·太陰·右弼·天機) and at 庚 (太陽·武曲·太陰·天同, under the verse
「庚日武阴同为首」 — which is the reading kept here against the second
edition's 同陰, now with a modern school agreeing). It parts from this book at
**壬 alone**, giving 科 to 左輔 where 《全書》 gives it to 天府:
「壬梁紫**輔**武宿是」 against 「壬梁紫**府**武宿是」.

And it **names the lineage that diverges**. 中州派 splits into 陸斌兆's line
and 王亭之's, the first resting on 『世傳欽天監秘笈』 and the second on
『紫微星訣』, neither published; the school as a whole it calls 「比較接近傳統
『全書』和『全集』等古籍的學派」 — which is a third party placing those two
titles side by side as the classical pair, exactly as the section above found
them; and it is **王亭之's branch**, it says, whose 四化 depart from the
received table at 戊, 庚 and 壬. That is the first name this section has been
able to put to a divergence it refuses an option for, and the refusal is
restated below in those terms.

**The adjudicator, held and not yet read.** The Ming 南陽堂 woodblock —
《新鐫希夷陳先生紫微斗數全書》, 題 宋 陳摶 撰, 明 潘希尹 補輯, in seven juan —
was fetched from shuge.org, which took it from the 日本内閣文庫 copy.
**528 pages, image-only, and the block is clean enough to read by eye.** It is
a *different recension* under the same title, and the only witness on this
shelf that is neither a transcription nor descended from one.

Nothing in this section depends on it, and that sentence has changed meaning:
it used to describe a book nobody owned and now describes work nobody has
done. It is the standing adjudicator for every question this section leaves
open, and the list is short enough to write down. The defective 火玲 line of
安身主, which both editions in hand print identically and neither can settle.
The 庚 line of the 四化, where the two editions read 陰同 against 同陰 and the
split is carried as a variant rather than resolved. 火星 and 鈴星 off the hour,
解神 off the year, and 壬 giving 科 to 天府 — each standing on two witnesses of
one lineage, which is not the same as two lineages. The two repaired grid
cells, forced by arithmetic and confirmed by a transcription. And the starting
age of the 大限, which is nowhere a sentence in either edition and is induced
from the opening words of the bureau verses. A seven-juan recension also
carries the 批命 material the three-juan one lacks, which is the part this
project declines and would not read.

**Reading it is the largest thing outstanding on this board**, and it is not
cheap: 528 pages of woodblock with no text layer, to adjudicate perhaps eight
lines. Recorded as a debt with a price on it, not as a plan.

### The other transmission, and why having it changes two stars and no rule

Two texts arrived that are **not 《全書》 and not editions of it**, and the
first thing to establish about them is that they are one work.

**《紫微斗數》, 三卷, 撰人不詳, 《萬曆續道藏》.** A plain text file in GBK with
no scan behind it and no editor named — the weakest kind of witness this
register accepts, and one that would settle nothing alone. Its condition is
visible on every page: two lacunae left as editorial marks (＃１, ＃２), 王 for
壬, 實 for 貴, 大陰 for 太陰, and a 十干所屬陰陽 line printed with the two
halves exchanged (「甲丙戊庚王屬陰，乙丁己辛癸屬陽」), which is the reverse of
what every text in this project's bibliography says and is read here as one
more slip rather than as a doctrine.

**《十八飛星策天紫微斗數全集》**, 題 大宋扶搖子白雲先生陳摶 撰, 徐良弼 校正,
金陵益軒唐謙 鏤梓 — reprinted as PDF pages 240–305 of 《中國絕學》第五冊
(方外人, 臺北金林文化, 1986). A facsimile of a block-printed edition,
**image-only**: it has no text layer, so every line quoted from it below was
read off the plate by eye, which is a weaker operation than reading a
transcription and is declared rather than hidden.

They are witnesses of one text. The 論次序 that opens both runs word for word
the same — 「一定時刻，二起八字，三立格局，四排星辰，五立坐命，六起大運，七起
大限，八書化曜，九書喜忌，十排吉凶」 — and so do the 起例 that follow it.
**And the second is legible in three places where the first is not**, which is
what makes the pair worth more than the sum:

| | 續道藏 | 全集 |
|---|---|---|
| 安命例 | 「本人生時是**印時**，則從子上起申，順數**至未**逢卯」 | 「假如枝星在子，本人生時是**申**，則從子上起申，順數至本逢卯，便是命宮」 |
| 起大限例 | 陰男陽女，從**申**宮逆數 | 陰男陽女，從**身**宮逆數 |
| 起小運例 | 陽男陰女，從**申**宮逆數 | 陽男陰女，從**身**宮逆數 |

The 續道藏's 安命例 cannot be followed as printed: 「是印時」 swallows the
worked example's own input, and 「至未逢卯」 counts to two palaces at once.
申 and 身 differ by one stroke, and 身宮 is an anchor the rest of that text
uses at every turn while 申宮 appears nowhere else in it. This is not an
adjudication between two readings — it is one witness being legible where the
other is damaged.

**What the transmission is.** Not another layout of the board computed here: a
different board under the same title. **Eighteen stars and no 五行局.** Twelve
— 紫微, 天虛, 天貴, 天印, 天壽, 天空, 紅鸞, 天庫, 天貫, 文昌, 天福, 天祿 —
are counted from 未 by the **year branch** and laid out counter-clockwise, one
to a palace; four — 天杖, 天異, 毛頭, 天刃 — from 子 by the **birth month**;
then 天刑 from 酉 and 天姚 from 丑 by month, and 天哭 on the year's 六合.
紫微 arrives by the year, not by a bureau and a lunar day; there is no 天府,
no mirrored second file, and not one of 天機, 太陽, 武曲, 天同, 廉貞, 太陰,
貪狼, 巨門, 天相, 天梁, 七殺, 破軍 is on the board. 「命係星辰十八位」 is the
總論's own line, and the eighteen are the nine 陽星 and the nine 陰星 the text
lists by name — 天空 being placed and then not weighed, which is how twelve
and four and three come to eighteen.

**What it settles here, which is two stars.** Where the two transmissions use
the same name they mostly do not use the same rule: 文昌 by the year here and
by the hour in 《全書》; 龍池 and 鳳閣 by the birth hour here and by the year
branch there; 三台 and 八座 from 戌 and 辰 by month and then day, against
《全書》 counting them off 左輔 and 右弼; 天哭 on the 六合 of the year, against
《全書》 counting back from 午. **Exactly two rules survive the crossing, and
they agree:**

| | 續道藏 · 全集 | 《紫微斗數全書》 卷二 |
|---|---|---|
| 天刑 | 「凡起天刑，從酉上起，正月順數，至本人生月安天刑」 | 「天刑星从酉上起正月顺至本生月便安之」 |
| 天姚 | 「天姚在丑順行」 · 「丑上順正月」 | 「天姚星从丑上起正月顺至本生月即安之」 |

Two lineages that share no other placement share these two, which lifts them
off the single-lineage footing everything else on this board stands on. The
engine already places both that way and nothing changes; what changed is what
is known about them.

**What it does not license, and this is the part that matters.** 《全書》 opens
the 大限 in the palace *beside* the 命宮 — 「陽男陰女從命前一宮起順行 是父母
宮」 — and `daxian: 'ming'`, the widespread practice of opening it in the 命宮
itself, is refused below as a lineage nobody had read. A lineage has now been
read, and it does open in the 命宮: 「陽男陰女，從命宮順數，十年行一宮」, in
both witnesses. **That is not a reason to admit the option. It is a firmer
reason to refuse it.** The rule is stated over a board with **no 五行局**,
where every span is a flat ten years and the run has no starting age to
inherit — while the variant asked for on 《全書》's board keeps the bureau's
opening age (二歲, 三歲, 四歲…) and moves only the palace. They are not the
same rule. Taking the starting palace from one system while keeping the
starting ages of another is the graft this project names elsewhere as the
natal Qi Men error, and it would be no better for being made between two books
that share a title. The refusal stands, and now stands on something.

**And none of it is implemented.** A board of eighteen stars placed off the
year, with brightness verses of its own (諸星入廟樂旺詩訣) and limits of its
own, is a second instrument and not a parameter. The standard is unchanged: it
would earn a place by having a procedure a source states, which it now
demonstrably does, and it would then need its own input type, its own output,
its own drawing, and its own answer to what such a board is handed over *for*.
None of that is designed and none of it is claimed here. What this register
now says is only that 「紫微斗數」 **names two boards**; that the one computed
here is 《全書》's fourteen; and that the other is on the shelf whole, instead
of being named and missing.

### The two cells the page lost, and why the repair is forced

The five grids placing 紫微 by bureau and by day of the lunar month are printed
as boxed diagrams, the day numbers running down column pairs. Read cell by
cell, three of the five give all thirty days without a gap or a repetition.
Two do not:

| Bureau | What the page prints | What is missing |
|---|---|---|
| 木三局 | the 寅 cell reads 初三 · 初九 | 初九 already stands in 辰; 初五 stands nowhere |
| 金四局 | the 亥 cell reads 初一 alone | 三十 stands nowhere |

The repair is **not chosen, it is forced**, and the forcing is over-determination
of the kind the 觜/參 finding rests on. The tradition carries an arithmetic
beside the grids: take `q = ceil(day / 局)` and `r = q × 局 − day`, then count
`q + r` palaces from 寅 when `r` is even and `q − r` when it is odd. That rule
is **not in this book** — which is exactly what makes it a check on the book
rather than a restatement of it. It reproduces **148 of the 150 printed cells
exactly**, and it disagrees with the page at precisely the two places the page
is short. A rule that agreed with a defective page would prove nothing; one
that agrees everywhere except where the page has visibly dropped a character
and a column is telling you what the page said before it lost them.
`test/ziwei.test.ts` holds all 150 cells against that arithmetic.

**The second edition then printed both cells whole**: 木三局's 寅 reads
初三 初五 there, and 金四局's 亥 reads 初一 三十. A rule and a witness agreeing
where one page failed, which is as close to settled as a tier-3 quantity gets.
That edition's own grids are defective elsewhere and differently — its labels
are shuffled, so the grid headed 木三局 is in fact 火六局 — which is itself
useful: two copies corrupt in different places narrow the truth where one
cannot.

The text also checks itself once, in prose: 「如甲生人安命在寅卻起甲己之年丙為
首，是丙寅丁卯爐中火，卻去火局尋某日生期起紫微帝王，如是正月初一生者是火局，
酉宮起初一日」 — a 甲 year with 命宮 at 寅 gives 丙寅, whose 納音 is 爐中火,
whose bureau is 火六局, whose first day sits at 酉. The engine reproduces every
step, and the last of them is a cell of the grid.

### The table of seven grades, which counted itself

The brightness table closing 卷二 is a plain grid, one row a branch and seven
columns of single-character star names. Twenty-one stars carry a grade.
**Eighteen of them appear in all twelve branches and three appear in exactly
eight** — 祿存, 擎羊, 陀羅 — and that is not a gap in the transcription: 祿存
follows the year stem, which never sends it to the four 墓庫, and the other two
flank it. A misread grid does not come out 12 and 8 by accident.

The coarse per-star summaries of 卷三 agree with the fine table where they
overlap, and on the two stars where the agreement is checkable end to end it is
exact: 「擎羊 廟辰戌丑未 陷子午卯酉」 and 「陀羅 廟辰戌丑未 陷巳亥寅申」 name
precisely the廟 and 陷 rows of those two eight-branch entries. 「紫微 廟丑未午
旺寅申卯酉巳亥 平子 無陷」 likewise agrees, and the two branches it does not
mention are the two the fine table grades 得地.

### The comparison, and what it is worth

Two independent runnable references exist, both MIT: **`iztro`** (npm,
TypeScript, maintained) and **`fortel-ziweidoushu`** (npm), the latter of
declared 中州派 lineage. `iztro` was read for its settings before a single
comparison was believed — the kinliuren lesson — and its defaults are
`yearDivide: 'normal'` (the year opening at 正月初一, which is this engine's
default and the reason the two are comparable at all) and `algorithm:
'default'`.

**544 births compared**: 1930 to 2020, six dates a year, four hours apiece,
both sexes — every birth outside a leap month and on a +08:00 clock, for
reasons given below. **Sixty-three quantities were compared and fifty-seven
agreed in every single chart**: the bureau, the 命宮, the 身宮, both masters,
all fourteen main stars, and every auxiliary but four.

The comparison earned its keep before it produced a number. A first run agreed
on only 77.6 % of the main stars, and the divergences fell entirely on boards
whose 命宮 landed on 子 or 丑. The stems of the twelve palaces are dealt out
walking the ring forward from 寅, so the count must be taken mod twelve before
it is taken mod ten — 子 is ten steps along, not two steps back. Two steps back
is a different stem, a different 納音, a different bureau, and therefore a
different position for 紫微 and everything hanging off it. The engine was
wrong; the reference found it; the rule stands.

**The residue was six lines. The second edition took two of them away, and
they were mine.** What follows is the whole of it, after collation.

| Quantity | Agreement | What it turned out to be |
|---|---|---|
| 天魁 · 天鉞 at 丙丁 | was 69.1 % · **now 100 %** | **a correction.** The Wikisource text prints 「丙丁豬**狗**位」 — 狗 is 戌 — and that was carried as this book parting from the modern tables. The second edition prints 豬**雞** (酉) with no emendation noted, and the reference computes 酉. Two independent readings against one, and the one belongs to the lineage documented as carrying several errors to the page |
| 天魁 · 天鉞 at 辛 | was 91.2 % · **now 100 %** | the same correction. 「六辛逢**馬虎**」 puts 魁 on 午 and 鉞 on 寅; Wikisource transposes to 虎馬 |
| 火星 · 鈴星 | 25.0 % | **stands, and both editions agree.** Each takes a seat from the year's triplicity and the birth hour never enters, where the widespread practice counts on from those seats by the hour — which is why agreement is exactly the quarter of the sample whose hour offset is zero. `huoling` names it. The second edition prints 寅午戌人**午**卯方 where the first prints 丑卯, and 丑 is kept: 午 already stands as a triplicity head two characters earlier, and the received seats are 丑 and 卯 |
| 解神 | 10.3 % | **stands, and both editions agree.** 「解神從戌上起子，逆數至當生年太歲上是也」 — placed off the **birth year**. What modern software carries under this name is the 月系 star, placed off the month. Two quantities wearing one name |
| 天府 taking 化科 at 壬 | 0 % | **stands, with two witnesses behind it.** Both editions read 「壬梁紫府武宿是」. Later lineages give 科 to 左輔, and one of them is now on the shelf with a name on it — the 中州派 manual above prints 「壬梁紫輔武宿是」. The divergence is unchanged; what changed is that the other side of it is no longer anonymous |
| 化科 and 化忌 at 庚 | — | **the one line the two editions disagree about.** This text reads 庚日武**陰同**為首 (科 to 太陰, 忌 to 天同); the second reads 庚日武**同陰**為首, swapping them. That is the famous split at 庚, and it is carried as a variant rather than settled — the reading kept is the one the reference also computes, and the other is written here so nobody rediscovers that the line has two forms. **A third party has since sided with the reading kept**: the 中州派 manual described above prints 「庚日武阴同为首」 and a table to match, which is a school agreeing rather than a witness, and is worth exactly that much |
| 命宮 in a leap month | excluded | this book counts a leap month as the month **after** it (「凡有閏月俱要依此為例」); `iztro` splits the month at its middle. `leapMonth` names all three readings and implements the book's |

After the two corrections the comparison stands at **fifty-nine of
sixty-three quantities agreeing in every chart**.

One class of divergence is **not** about this art and is excluded above rather
than explained away: a birth at 00:30 on a Chinese wartime or summer clock
(1944 and 1986 in the sample) falls on the previous day at 120°E, so the lunar
date — and therefore 紫微 — moves by one. The engine is right by its own stated
rule, which is that the lunar calendar is a published artefact reckoned on
120°E and that Chinese wartime and summer clocks do not move it. `iztro` and
`lunar-typescript` both take the civil date. Anybody comparing this engine
against Chinese software on a DST-era birth will meet this, and it is the
calendar rule and not a 紫微斗數 rule.

**Two of the sixty-three have a second kind of check**, which is not a run but
a reading. 天刑 and 天姚 are the only placements 《全書》 shares with the
十八飛星 transmission, and across that gap the two agree character for
character — 酉 起正月順數 and 丑 起正月順數 in both. Everything else on this
board rests on one lineage plus an implementation that could have inherited it;
those two rest on two lineages that agree about nothing else at all. The
transmission and its witnesses are described above.

### The five phases, which this board reads and does not merely file

The drawing tints its cells and inks its names by phase, and that needed
establishing before it could be drawn, because a colour on these sheets is an
assertion. Three passages of 卷二 carry it, and both editions agree on all
three word for word.

**The stars have phases, and the book tabulates them.**
「論諸星分屬南北斗化吉凶並分屬五行」 gives one to every star it places bar
thirteen: 紫微屬土, 天機屬木, 太陽屬火, 武曲屬金, 廉貞屬火, 天府屬土,
太陰屬水, 巨門屬水, 天相屬水, 天梁屬土, 破軍屬水, 文昌屬金, 文曲屬水,
祿存屬土, 魁鉞二星屬火, 天馬屬火, 擎羊屬金, 陀羅屬金, 火星鈴星屬火,
天空地劫屬火, 天傷天使屬水, 紅鸞天喜屬水. **Three carry two apiece** —
天同屬水金, 貪狼屬水木, 七殺屬火金 — and both travel, because the book means
both. **輔弼二星屬土 is the second edition's**: the Wikisource text drops the
two characters and prints only 「輔弼二星北斗善住雨令星」, so 左輔 and 右弼
have a colour on the sheet because a second witness supplied it.

**And the book says what to do with the table**, which is what parts this from
mere filing:

> 星曜全明生剋制化之機，次看落於何宮，如廉貞屬火在寅宮，乃木鄉能生廉貞之火，
> 若武曲金星與廉貞同度，則武曲為財而無用也，餘倣此。
>
> 金入火鄉，火入水鄉，水入土鄉，土入木鄉，俱為受制。

A star's phase is read against the phase of **the palace it fell in**, and the
palace's phase is its branch's — 寅宮乃木鄉, 寅 is wood country. The word is
鄉, a country, which is what a tint depicts rather than what a legend lists.
卷一 works the same relation between two stars in one seat
(「廉貞屬火，七殺屬金，是火能制金」, where it treats 七殺 as metal alone), and
the 太微賦 opens the art on it: 「辨生剋制化，以定窮通」.

**What the engine does with it, and what it does not.** `ZiweiStar.elements`
carries the phases; the drawing tints a cell by its branch and inks a name in
its phase where there is exactly one. Sixteen names are inked; the three
dual-phase stars are not, because a glyph has one colour and picking one would
be this engine choosing where the book gives two; nor are the thirteen the
list passes over, which is the book being silent rather than the star being
phaseless. **Nothing computes the relation.** That 太陰 is water in an earth
palace is visible on the sheet and is not summed, scored, or reported as a
verdict: 受制 is the text's own word for it and stays the reader's to say.

The list also gives phases to the 四化 (化祿屬土, 化權屬木, 化科屬水,
化忌屬水) and to the 博士 ring. Neither is carried yet: those ride on a star
or fill every seat, and a second colour on a name already inked would be two
assertions in one glyph.

### 身主, where an induction was made and then withdrawn

The 身主 line reads 「子午人火玲星」, where 玲 is 鈴, **and both editions print
it that way** — so the defect is the work's rather than one copyist's, and the
second witness that was expected to resolve it instead confirms there is
nothing to resolve it with. Every other line of that
table names **one** star for a pair of opposite branches, in a six-character
slot; this one fills the same slot with 火鈴, which is the name of no star.

The first reading taken here was the compressed one — 火 to 子 and 鈴 to 午 —
and the argument for it was structural: the sibling rule 安命主 pairs ten
branches and leaves 子 and 午 standing alone with *different* stars, so those
two are exactly the pair the tradition treats singly.

**It is withdrawn, and the withdrawal is the point.** The argument rested on
the shape of the line and on nothing else. No worked instance in this book
carries a 身主, so the induction had no instances to be induced *from* — which
is what parts it from 太乙's 參將, where fourteen worked instances agreed
without exception, rather than likening it to it. Against it stands a runnable
reference agreeing with this table in eleven branches of twelve and giving 火星
at 午. One reading with an argument and no witness, one with a witness and no
argument: the witness carries it. The other reading is recorded here rather
than lost, so that an edition printing the line whole overturns this in one
commit.

### What is not here

**What the second edition confirmed rather than changed**: the 大限 opening in
the palace beside the 命宮 (it drops the words 順行 and 逆行 and keeps
「從命前一宮起 是父母宮」, which is the half that decides where the run opens);
the leap month counted as the month after; 大耗 where the first witness prints
天耗; and 封誥 counted from 寅, where the first witness garbles the line to
「由寅起宮子順數」 and the second notes the transposition and fixes it. The
**starting age of the 大限 is still nowhere stated as a sentence** in either
edition — it is carried only by the opening words of the bureau verses
(二歲行, 三歲起, 四歲花…) and remains induced.

The **flow-year layer** — 流祿, 流羊, 流陀, 喪門, 白虎, 吊客, 官府, 斗君, the
天德 and 月德, the 飛天三殺 — is placement 卷二 states, and it is postponed
rather than refused. Its subject is a year laid on a person, and what such a
thing would be handed over *for* has not been designed. That is phase 20's
ground, and it is a debt.

The **格局 catalogues of 卷一** (定富局, 定貴局, 定貧賤局, 定雜局) define their
patterns precisely enough to compute — 「財蔭夾印 相守命武梁來夾是也」 — and
could travel as `Pattern`s do. Not yet.

The **fu poems of 卷一, the per-palace star readings of 卷二 and the grading
doctrine of 卷三** are declined entirely, on the ground 《果老星宗》 is declined
on: they are prose-verdict doctrine, and a verdict arriving inside an English
gloss is a verdict nothing can test. What travels from this book toward meaning
is what it *names and weighs in one line* — a brightness grade, a
transformation — which is the ground `Pattern.valence` stands on.

The **stars with no rule in 卷二** are absent rather than blank: 恩光, 天貴,
天官, 天福, 咸池, 孤辰, 寡宿, 華蓋, 破碎, 天才, 天壽, 天廚, the year-branch
大耗, and a 地空 distinct from this text's 天空. Modern boards carry them. This
one carries what its book places.

Three of that list — 天貴, 天福, 天壽 — **do have a rule, in the other
transmission**, where they are three of the twelve counted from 未 off the year
branch. That is not a rule this board can borrow: it is stated for a ring of
eighteen that has no 天府 and no bureau, and lifting three names out of it onto
《全書》's fourteen would be the graft refused two paragraphs up, made smaller.
The same reading settles where the missing 地空 comes from. The 1986 editor of
the 全集 notes, in his own voice and not the Ming text's, that 天空 there is
「駕前一位」 — one palace past 太歲, off the year — while 地空 is counted off
the birth hour, and that 俗本 print the second under the first's name. 《全書》
counts its 天空 back from 亥 by the hour, which is to say that the star this
engine calls 天空 is the star that transmission calls 地空. The engine follows
its own book and keeps the name its own book gives; the collision is recorded
because a reader holding the other kind of chart will otherwise think one of
the two is wrong.

The **子時 passage** of 卷三 divides the hour — 「如子時有十刻，上午刻屬昨夜亥
時，下午刻屬今日子時」 — but 上午刻 must be 上五刻, the OCR is corrupt at the
character that carries the arithmetic, and 「屬昨夜亥時」 is doctrinally odd as
printed. The engine takes the plain hour and the day boundary its own
calendrical layer settles. Recorded as a passage read and not used.

---

## What is refused, and why

| | Reason |
|---|---|
| 三奇得使 | the sources consulted disagree on which pairings count |
| the 統宗's 六親 mapping | one late compilation, and it is interpretation from the first character |
| counting the 泊宮 through the palaces | 《遁甲演義》 states it in four characters that admit two readings |
| the month pillar a 春節 almanac prints | 五虎遁 reads the year stem, so `chunjie` moves the month with the year and reports a pillar no lichun almanac carries. Whether an almanac counting by the lunar new year prints that one or the solar one, no source consulted says. The rule is applied as stated and the consequence is pinned by a test, so that changing it has to be deliberate |
| the other 70 cells of 十干克應 | complete tables exist but each is a single uncited source; two are needed |
| 茅山 | no reference at all. `METHOD_NOT_IMPLEMENTED` rather than a silent substitution |
| 飛盤 | a whole family. `OPTION_NOT_IMPLEMENTED` |
| 日家 · 月家 · 年家 | same |
| 寄宮 `dun` | the parameter exists and the second value is refused rather than guessed |
| 六壬 `yuejiang` `jieqi` · `true` | the 四庫 verse's own table turns the general at the 中氣, and both references read it so. The other two values exist in the type and are refused rather than guessed |
| 六壬 `zhouye` `solar` | no source consulted cuts the day at the actual sunrise. `OPTION_NOT_IMPLEMENTED` |
| the 涉害 復等 clause | implemented, measured, and dropped: it moves none of the 8 640 boards under any of three readings, because the order of the courses already gives what it asks for. See the 六壬 section |
| 二十八宿值日's 宜忌 | 《協紀辨方書》卷三十六 辨訛 rejects the lodge-day selection outright as an import: 來自西域, 並不可從. The count may still travel; the doctrine attached to it may not, and the epoch takes its warrant elsewhere |
| the 宜忌 of the twelve officers | the largest thing in the 協紀 and the clearest refusal here: 宜 and 忌 are advice — ordering days, dating an act — which is `purposes.ts`'s line in a second place |
| the verse's clause order in 涉害 | 「孟深仲淺季當休」 read as evaluation order scores 98.19 % where the grouping this engine uses scores 99.58 %. Both references take the deeper 季; the divergence is recorded rather than resolved by preference |
| 紫氣 | the rate is settled and 《張果星宗》 and 《三辰通載》 both give a procedure carrying an epoch constant, so the refusal is not for want of a rule. Calibrated together at 1300, the same table's 羅睺 holds to 0.25° through 2026 and its 月孛 drifts to 69°, and nothing weighs 紫氣's own constant because weighing it means having a referent, which is the one thing it lacks. The error on a modern 紫氣 is unbounded in principle rather than merely unknown. See the 四餘 section |
| 七政四餘 `xiudu` `shixian` · `shoushi` | the boundaries are taken from the 距星 themselves, so no epoch is chosen. The two 曆 tables are declared and refused until one arrives with an epoch that can be cited |
| 七政四餘 `minggong` `ascendant` | 立命 by 加時 is what the texts state and gives a palace. The rising degree is a second method, not a sharper reading of the first. `OPTION_NOT_IMPLEMENTED` |
| 七政四餘 `gong` `ci` | the 次 as stretches of 宿度 needs the same table `xiudu` is waiting for |
| 留 | a station is a threshold on the daily motion and no source consulted states one. The speed travels in the output instead |
| 紫微斗數 `huoling` `hour` | the widespread practice counts 火星 and 鈴星 on from the year's seats by the birth hour. No verse in 卷二 does, and agreement with a reference that does falls to exactly the quarter of a sample whose hour offset is zero. `OPTION_NOT_IMPLEMENTED` |
| 紫微斗數 `leapMonth` `current` · `split` | 「凡有閏月俱要依此為例」 counts a leap month as the one after it. The other two readings are other schools' and neither is in this book |
| 紫微斗數 `daxian` `ming` | 「陽男陰女從命前一宮起順行 是父母宮」 opens the run *beside* the 命宮, in both copies verbatim. Opening it in the 命宮 is now traceable — it is the 十八飛星 transmission's rule, in both witnesses of it — and that makes the refusal firmer rather than looser: there the spans are a flat ten years on a board with **no 五行局**, so the rule inherits no starting age, while the variant asked for here keeps the bureau's. Not the same rule, and not this book's |
| 紫微斗數 `sihua` | one value, and the divergent lineage now has a name without having a text. A 中州派 manual on the shelf reports that it is **王亭之's branch** that departs from the received table at 戊, 庚 and 壬, and names what it rests on — 『紫微星訣』, unpublished. That manual's *own* table agrees with this book at 戊 and 庚 and parts from it at 壬 alone (科 to 左輔, not 天府), so the three-stem table that would be the second value is still unread. A lineage named is not yet a lineage read: the `tongzong` precedent holds, and what would overturn it is now a findable book rather than a rumour |
| the 流年 layer of 紫微斗數 | placement 卷二 states, postponed rather than refused: its subject is a year laid on a person, and what that would be handed over for has not been designed |
| the per-palace readings and fu of 紫微斗數全書 | prose-verdict doctrine, declined on the ground 《果老星宗》 is declined on. What is carried is what the book names and weighs in one line: a brightness grade, a transformation |

`bigfishmarquis-qimen` implements 茅山, 置閏 and all four systems, and is
therefore a candidate reference for several of these. It is five months old
with four commits at the time of writing, which is why nothing here leans on
it alone.

---

## The standard, stated once

A source is usable here when it is **complete** for what it covers,
**unambiguous**, **interrogable in bulk**, **independent** of the sources this
engine already uses, **declared** as to school, **citable**, and **stable**.
For anything that cannot be derived, **two** such sources must agree.

Where they do not, the divergence becomes an explicit parameter with a
declared default, or the entry is left out and the absence is written down.
It is never resolved by preference.

**A link is not the evidence; the extract is.** Every passage this file leans
on is quoted here in full, because a wiki page can be edited or deleted — one
ctext chapter already answers 該資料已刪除 under its other URL. The links are a
courtesy to a reader who wants the surrounding text, and where the source is
Wikisource one of them is an `oldid`, which names the revision that was read
and cannot change under it. Where a printed edition was consulted, **that** is
the citation: an edition and a page number outlive every URL here.
