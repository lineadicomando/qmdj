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
  on a yang one. `shehai` left a surviving tie to the order of the courses, and
  `PLAN.md` called the disagreements that remain "a question for 《六壬大全》".
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

The layer dunjia was read beside. It arrives one block at a time; **建除十二神
is the first**, and it is the block whose one dangerous decision the source
turned out to state in a clause.

### The text

《欽定協紀辨方書》, 三十六卷, imperially commissioned in 乾隆四年 (1739) and in
the 四庫全書 — the one work of its kind that adjudicates between conflicting
rules and says which it rejects, 卷三十六 being a whole chapter of rejections
(辨訛). 卷四 義例二, under 建除十二神, quoting the 厯書
([Wikisource](https://zh.wikisource.org/wiki/欽定協紀辨方書_(四庫全書本)/卷04)):

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
`PLAN.md` § 3.

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
| 隂德 | 3 624 / 3 650 | 99.29 % |
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
