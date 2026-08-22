# No school is implicit

Different schools produce different charts from identical input. The engine
cannot have an implicit "correct" behaviour, so **every divergence is an
explicit parameter with a declared default, present in the input type from the
start**. Adding one later breaks the API, MCP, the CLI and every shared URL at
once.

A parameter may ship with a single implemented value, provided the parameter
already exists in the type and an unimplemented value is **refused rather than
silently substituted** — `METHOD_NOT_IMPLEMENTED` exists because a chart cast
by the wrong method looks right and is not.

**Each board carries its own input type. None inherits a default from
dunjia's.**

## The Qi Men chart

| Parameter | Values | Default |
|---|---|---|
| `method` | `chaibu` (拆補), `zhirun` (置閏), `maoshan` (茅山) | `chaibu` |
| `yuan` | `term`, `futou` (符頭) — inside 拆補 | `term` |
| `plate` | `zhuan` (轉盤), `fei` (飛盤) | `zhuan` |
| `centreLodging` | `kun` (寄坤二), `dun` (陽遁寄二 · 陰遁寄八) | `kun` |
| `system` | `shijia` (時家), later `rijia` (日家), `yuejia` (月家), `nianjia` (年家) | `shijia` |

`method` and `yuan` are the two most divisive and neither is optional. 茅山 has
no reference at all and is refused.

## The calendrical layer under every board

These three are declared in `ChartOptions` beside dunjia's own, because that
is the type a chart carries, and they are not dunjia's. They say how an
*instant* is read into pillars, and every board built on those pillars
inherits the answer: 八字 has no divergence of its own and stands on these,
奇門 and 六壬 are cast at an hour these decide the stem of, and a board that
read the day differently from the pillars printed beside it would be two
calendars in one output.

| Parameter | Values | Default |
|---|---|---|
| `trueSolarTime` | `true`, `false` — the one boolean here | `true` |
| `yearBoundary` | `lichun` (立春), `chunjie` (正月初一) | `lichun` |
| `dayBoundary` | `zishi` (子時, 23:00 → next day), `midnight` | `zishi` |

太乙 and 紫微斗數 cut the counted year by a boundary of their own, and the
almanac takes none of these at all. Both are below.

## The other boards

| Board | Parameter | Values | Default |
|---|---|---|---|
| 六壬 | `yuejiang` | `zhongqi` (太陽過宮 at the 中氣), `jieqi` (節氣, half a term earlier), `true` (太陽實躔) | `zhongqi` |
| 六壬 | `guiren` | `chou` (甲 shares 丑未 with 戊庚), `wei` (甲 stands alone at 未丑) | `chou` |
| 六壬 | `zhouye` | `branch` (晝 from 卯 to 申), `solar` (actual sunrise and sunset) | `branch` |
| 曆注 | `shensha` | `xieji` (only those 《協紀辨方書》 ratifies, cut to the day and the direction), later a named lineage | `xieji` |
| 七政四餘 | `xiudu` | where the 宿 begin: `juxing` (at the 距星, placed at the instant), or a 曆's table — `shixian` (時憲曆), `shoushi` (授時曆) | `juxing` |
| 七政四餘 | `ziqi` | `off`, or `yinianyisu` (一年一宿), once an epoch can be cited | `off` |
| 七政四餘 | `luohou` | which node is 羅睺: `descending` (the 星命 law), `ascending` (湯若望 and the 時憲曆) | `descending` |
| 七政四餘 | `minggong` | `yuejiang` (立命 by 加時, the hour laid on the 月將's palace), `ascendant` (the true rising degree) | `yuejiang` |
| 七政四餘 | `gong` | where the twelve 宮 are cut: `zhongqi` (太陽過宮 at the 中氣), `ci` (the 次 as stretches of 宿度) | `zhongqi` |
| 太乙 | `epoch` | which 上元積年 the count runs from: `jinjing` (《太乙金鏡式經》) | `jinjing` |
| 太乙 | `ji` | which register: `nianji` (年計), later `yueji` · `riji` · `shiji` | `nianji` |
| 太乙 | `yearBoundary` | where the counted year begins: `lichun` (立春), `dongzhi` (冬至), `chunjie` (正月初一) | `lichun` |
| 紫微斗數 | `leapMonth` | what a birth in an intercalary month counts as: `following` (the month after it, which is the book's), `current`, `split` | `following` |
| 紫微斗數 | `sihua` | which table of the 四化: `quanshu` (《紫微斗數全書》's own), later a lineage that has been read | `quanshu` |
| 紫微斗數 | `huoling` | how 火星 and 鈴星 are placed: `fixed` (a seat apiece from the year's triplicity, which is all 卷二 states), `hour` | `fixed` |
| 紫微斗數 | `daxian` | where the first decade opens: `adjacent` (the palace beside the 命宮), `ming` (命宮 itself) | `adjacent` |
| 紫微斗數 | `yearBoundary` | which reckoning gives the year its stem and branch: `lichun` (立春), `chunjie` (正月初一) | `chunjie` |
| 年命 | `count` | how the years lived are counted: `sui` (虛歲), `turns` (the turns of the year pillar alone) | `sui` |

**The 曆注 are not a board**, and take nothing from the layer above: the
almanac is a page of a published book, a pure function of the civil date
reckoned as the lunar date is, and an almanac belongs to a date — the same
date is the same page for everybody who opens it. Its one divergence is which
神煞 enter, which says not how an instant was read but which book was copied
out.

**年命 is the last row and is not a board either.** It is a birth placed
inside a chart of a moment — 本命 and 行年 — and it has one divergence because
the sources count the years lived two ways. It is in this table rather than in
a section of its own because it is a parameter with a declared default like
every other row, and a reader looking one up should find them in one place.

## Rows that are not like the others

**`epoch` is upstream of every placement on a 太乙 board**, where every other
row here is a method with branches whose output a reader could be told the
shape of. A wrong epoch rotates the whole figure silently and nothing in the
output disagrees. It ships with one value because a branch nobody has read is
worse than a branch that does not exist — the load-bearing quantity turned out
to be an *anchor* the text states in datable form and checks four ways, not
the magnitude the three chapters disagree about. See the 太乙 section of
`docs/sources.md`.

**紫微斗數's `yearBoundary` defaults to `chunjie` where the pillars' defaults
to `lichun`**, and the two are not in disagreement: they are different
questions. The pillars are cut at 立春 because that is what every almanac
printing four pillars does. This board counts its month and its day on the
lunar calendar, so the year that opened at 正月初一 is the reckoning coherent
with the rest of it. 《紫微斗數全書》 says nothing either way, which is
precisely why it is a parameter — the year stem carries the 四化, 祿存, 天魁
and 天鉞, so a birth in the weeks between the two lays out two different
boards and only one of them can be printed.

**`xiudu` gained `juxing`, and `gong` did not exist until the board was
written.** Both are the same discovery arriving twice: the 宿度 and the 十二次
are one question and the sources answer it in two frames. `juxing` is the
answer that commits to no epoch, which is why it is the default and why the
two 曆 tables can wait. `gong` had to exist because the palaces can be cut by
the seasons or by the stars and precession has parted the two by weeks — which
is exactly the breakage this page opens by describing.

## The derived constraint

**No function in `core` reads a global default.** Options arrive as arguments,
and a chart carries them in its own output. A saved chart must reproduce
identically.

## This page is checked against the engine

Every parameter above is declared as data in `packages/core/src/parameters.ts`
— its values, which of them the engine computes, and what it assumes when
nobody says — and the refusals inside the engine read that declaration instead
of restating it. `packages/core/test/parameters.test.ts` holds this page to
it: a row whose values or whose default have drifted from the code fails that
suite, and a parameter added to an input type without an entry does not
compile.

What lives here and cannot live there is the argument — why a divergence
exists, what the schools disagree about, and which of them a value names. What
lives there and is deliberately not written here is **which values are
implemented**, because that is the one fact on this page that moves.
