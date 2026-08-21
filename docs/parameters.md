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
| `trueSolarTime` | boolean | `true` |
| `yearBoundary` | `lichun` (立春), `chunjie` (正月初一) | `lichun` |
| `dayBoundary` | `zishi` (23:00 → next day), `midnight` | `zishi` |
| `system` | `shijia` (時家), later `rijia`/`yuejia`/`nianjia` | `shijia` |

`method` and `yuan` are the two most divisive and neither is optional. 茅山 has
no reference at all and is refused.

## The other boards

| Board | Parameter | Values | Default |
|---|---|---|---|
| 六壬 | `yuejiang` | `zhongqi` (太陽過宮 at the 中氣), `jieqi`, `true` (太陽實躔) | `zhongqi` |
| 六壬 | `guiren` | `chou` (甲 shares 丑未 with 戊庚), `wei` (甲 stands alone at 未丑) | `chou` |
| 六壬 | `zhouye` | `branch` (晝 from 卯 to 申), `solar` (actual sunrise and sunset) | `branch` |
| 曆注 | `shensha` | `xieji` (only those 《協紀辨方書》 ratifies, cut to the day and the direction), later a named lineage | `xieji` |
| 七政四餘 | `xiudu` | where the 宿 begin: `juxing` (at the 距星, placed at the instant), or a 曆's table — `shixian` (時憲曆), `shoushi` (授時曆) | `juxing` |
| 七政四餘 | `ziqi` | `off`, or `yinianyisu` (一年一宿), once an epoch can be cited | `off` |
| 七政四餘 | `luohou` | which node is 羅睺: `descending` (the 星命 law), `ascending` (湯若望 and the 時憲曆) | `descending` |
| 七政四餘 | `minggong` | `yuejiang` (立命 by 加時), `ascendant` (the true rising degree) | `yuejiang` |
| 七政四餘 | `gong` | where the twelve 宮 are cut: `zhongqi` (太陽過宮 at the 中氣), `ci` (the 次 as stretches of 宿度) | `zhongqi` |
| 太乙 | `epoch` | which 上元積年 the count runs from: `jinjing` (《太乙金鏡式經》) | `jinjing` |
| 太乙 | `ji` | which register: `nianji` (年計), later `yueji` · `riji` · `shiji` | `nianji` |
| 太乙 | `yearBoundary` | where the counted year begins: `lichun` (立春), `dongzhi` (冬至), `chunjie` (正月初一) | `lichun` |

`dayBoundary` and `trueSolarTime` are shared with dunjia and keep their
meanings: a board that read the day differently from the pillars beside it
would be two calendars in one output.

The 曆注 share neither, because the almanac layer is **not a board**: it is a
page of a published book, a pure function of the civil date reckoned as the
lunar date is, and its one divergence of its own is which 神煞 enter.

## Two rows that are not like the others

**`epoch` is upstream of every placement on a 太乙 board**, where every other
row here is a method with branches whose output a reader could be told the
shape of. A wrong epoch rotates the whole figure silently and nothing in the
output disagrees. It ships with one value because a branch nobody has read is
worse than a branch that does not exist — the load-bearing quantity turned out
to be an *anchor* the text states in datable form and checks four ways, not
the magnitude the three chapters disagree about. See the 太乙 section of
`docs/sources.md`.

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
