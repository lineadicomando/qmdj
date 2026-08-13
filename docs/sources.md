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
| **2 · Runnable reference** | No authority, but another implementation computes it and can be run against this one | the Qi Men layout, the zhirun ju |
| **3 · Transmitted text** | Chinese-language sources only; agreement is between readings, not against a measurement | the configurations, the seasonal states, 十干克應 |

**Tier 2 is not tier 1 in disguise.** An almanac encodes published astronomy;
a Qi Men implementation encodes one author's reading of a contested tradition.
Agreement with it means *consistent with a common implementation*, never
*verified*.

---

## Tier 1 — the calendrical layer

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

**The identifier `dispute` now outruns its label.** The sources put catching a
thief under 驚門 and litigation under 死門 and 杜門; the label was corrected and
the identifier was not, because it reaches the CLI's `--for` and the errand
list of the MCP reference. It is a wart, and it is written down here rather
than fixed quietly.

---

## What is refused, and why

| | Reason |
|---|---|
| 三奇得使 | the sources consulted disagree on which pairings count |
| the 統宗's 六親 mapping | one late compilation, and it is interpretation from the first character |
| counting the 泊宮 through the palaces | 《遁甲演義》 states it in four characters that admit two readings |
| the other 70 cells of 十干克應 | complete tables exist but each is a single uncited source; two are needed |
| 茅山 | no reference at all. `METHOD_NOT_IMPLEMENTED` rather than a silent substitution |
| 飛盤 | a whole family. `OPTION_NOT_IMPLEMENTED` |
| 日家 · 月家 · 年家 | same |
| 寄宮 `dun` | the parameter exists and the second value is refused rather than guessed |

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
