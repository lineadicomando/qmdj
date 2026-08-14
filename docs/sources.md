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
| **2 · Runnable reference** | No authority, but another implementation computes it and can be run against this one | the Qi Men layout, the zhirun ju, the 六壬 transmissions |
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

Without the `.se1` files (~2 MB, `npm run ephe:download -w @qimendunjia/core`)
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
never moves; `PLAN.md`, Phase 2, records the check and the eleven
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

---

## Tier 3 — the reading layer

No runnable reference exists for any of this. Each rule is instead tested
against the transmitted list it is supposed to reproduce — which only works
where the rule can be *derived*. Where it cannot, the standard is **two
independent sources naming the same thing the same way**.

### Derived, with the transmitted list as the test

| Rule | Derived from | The list that tests it |
|---|---|---|
| 門迫 | the gate's phase controls the palace's | the published list of oppressed gates |
| 五不遇時 | the hour's stem controls the day's, same polarity | the ten transmitted pairings — and the rule found the mnemonic **incomplete**: on two days in ten the condition strikes twice and the mnemonic names one |
| 驛馬 | the branch facing the triad's 長生 | 申子辰馬在寅 and its three fellows |
| the earth plate | count the instruments and marvels through the Luoshu | all eighteen published arrangements |
| 旺相休囚死 | the five-phase reckoning against the season | stateable in a sentence and checked against it |
| 門宮 · 星宮 | the five relations of the phases | 門迫 is one of the five, and a test asserts the two never disagree |

### Transmitted, not derived

These are tables. They cannot be derived, so the code holds them and a comment
says so — **`TOMB` and `STRIKE` in `patterns.ts` are marked as transmitted
precisely so nobody "fixes" them later.** 入墓 in particular does *not* follow
the twelve stages: those put the tomb of 乙 at 戌 in Qian, while the Qi Men
tradition puts it in Kun with 甲.

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
[靈匣網](https://www.lnka.tw/html/topic/986_2.html) (Chinese, uncited),
[奇門遁甲統宗 on ctext.org](https://ctext.org/wiki.pl?if=gb&chapter=548853)
(the chapter checked carries commentary in verse, not the table in tabular
form; the full text is there and citable for whoever locates the right one).

### The cross-check

甲 is concealed by the instrument of its decade, so the verse's 丙加甲 and
甲加丙 are read as 丙 over 戊 and 戊 over 丙.

| above + below | V | K | B | shipped as |
|---|---|---|---|---|
| 丙 + 戊 | 鳥跌穴 | — | 飞鸟跌穴 | **飛鳥跌穴** 吉 |
| 戊 + 丙 | 龍返首 | — | 青龙**转光** | **青龍返首** 吉 |
| 庚 + 丙 | 白入熒 | 太白入熒 | 太白入荧 | **太白入熒** 凶 |
| 丙 + 庚 | 熒入白 | 熒入太白 | 荧入太白 | **熒入太白** 凶 |
| 庚 + 癸 | 大格 | 大格 | 太白**冲刑** | **大格** 凶 |
| 庚 + 己 | 刑格 | 刑格 | 太白**大刑** | **刑格** 凶 |
| 庚 + 庚 | — | 戦格 | 太白**同宫** | **戰格** 凶 |
| 癸 + 丁 | 蛇夭矯 | 騰蛇妖矯 | 螣蛇夭矫 | **螣蛇夭矯** 凶 |
| 丁 + 癸 | 雀投江 | 朱雀投江 | 朱雀投江 | **朱雀投江** 凶 |
| 乙 + 辛 | 龍逃走 | 青龍逃走 | 青龙逃走 | **青龍逃走** 凶 |
| 辛 + 乙 | 虎猖狂 | 白虎猖狂 | 白虎猖狂 | **白虎猖狂** 凶 |
| 庚 + 壬 | — | 小格 | 太白退位 | **not shipped** |

`test/stem-pairs.test.ts` states each couplet of the verse as data and asserts
the engine reproduces it. Ten of the eleven are pinned to a line of the song;
戰格 is pinned to K and H agreeing.

### Three findings

**The pairing is agreed far more widely than the name.** Every source marks
庚 over 癸 as a named configuration. V and K call it 大格; B calls it 太白沖刑.
The same happens at 刑格 and 戰格, and at the two 甲/庚 pairings K names
伏宮格 · 飛宮格 where B names 天乙伏宮 · 值符飛宮. Where the sources name a
pairing differently the classical verse decides — it is the text the others
descend from — and the divergence is recorded here rather than resolved in
silence.

**One pairing is excluded for exactly this reason.** 庚 over 壬 is 小格 in K
alone; the verse as fetched does not carry it and B calls it something else.
One source is not enough for a table that cannot be derived. 三奇得使 is the
precedent, and the two refusals differ only in cause: there the sources
disagree, here there is only one.

**B dissents on 戊 over 丙**, calling it 青龍轉光 where V and H call it
青龍返首. The engine keeps 青龍返首 — two sources including the classical
text — and this is the entry to revisit first if a fourth source turns up.

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
interlinear notes moved into 〈〉. **No printed edition was consulted**, unlike
the 統宗 passages above, so this extract stands one degree weaker than those:
it is a transcription of a photographic edition, checked against itself.

The 四庫 text writes 己 and 巳 for each other in two places (丙戊課**己**,
丁**巳**課未, 丁**巳**辛), which is the ordinary scribal confusion of the two
graphs and is read here as 巳 and 己 respectively. It also uses the edition's
variant forms throughout — 尅 for 剋, 渉 for 涉, 隂 for 陰, 逓 for 遞, 别 for
別, 眀 for 明.

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

`PLAN.md` § 4 phase 13 records three corrections found by asking what rule
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

`liurenBoard` marks every 返吟 board `unverified`, because `kinliuren` defines
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

The same passage's 別責 note enumerates the day pillars that rule arises on —
戊辰 戊午 丙辰 辛未 辛丑 丁酉 辛酉 — and the engine produces exactly those seven
and no others. Neither of these is a sample.

### What the text settles that the engine does not yet do

- **復等柔辰剛日宜.** 涉害 ties are broken in the verse — an equal depth goes to
  the branch's seat on a yin day and the stem's on a yang one. `shehai` leaves
  a surviving tie to the order of the courses and its comment says so, calling
  it "the one place in this rule it is choosing rather than following".
  `PLAN.md` calls the 21 remaining disagreements "a question for 《六壬大全》,
  not for another round of scoring". This is that question answered, and the
  clause is not implemented.
- **井欄, not 無親.** The verse names the 返吟 board that shows no control
  井欄〔射〕. This engine's `KETI` calls it `wuqin` 無親, which the verse does
  not carry. The name is the engine's and wants either a witness or a change.
- **One clause is the engine's own.** `fuyin` takes the 冲 for the last
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
| the 涉害 復等 clauses | **not refused — owed.** 「復等柔辰剛日宜」 is in the verse above and `shehai` does not implement it. See the 六壬 section |

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
