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
consistent. That is a school divergence *inside* 拆補; if both readings are
ever shipped it becomes a new explicit parameter, not a correction.

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

## 十干克應 — what was checked, one pairing at a time

The table has eighty-one cells: nine stems on the heaven plate over nine on
the earth plate, 甲 excluded because it never stands on a plate. **Eleven are
implemented.** The other seventy are absent, and the reason is below.

### The sources consulted

| Key | Source | Kind | Licence | Cites its own source? |
|---|---|---|---|---|
| **V** | [煙波釣叟歌, Wikisource](https://zh.wikisource.org/zh-hant/%E7%85%99%E6%B3%A2%E9%87%A3%E5%8F%9F%E6%AD%8C) | Song-dynasty verse, complete | public domain | is the source |
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

## What is refused, and why

| | Reason |
|---|---|
| 三奇得使 | the sources consulted disagree on which pairings count |
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
