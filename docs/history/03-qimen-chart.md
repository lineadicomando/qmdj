# Phase 3 — The Qi Men chart

`dunjia/`, one module per layer of the chart:

| | |
|---|---|
| `ju.ts` | yang/yin dun and the ju number, for each of the three methods. The three yuan from the futou |
| `earth-plate.ts` | the three marvels and six instruments across the nine palaces, per the ju |
| `heaven-plate.ts` | zhifu over the hour-stem palace; rotation or flight |
| `stars.ts` | the nine stars |
| `gates.ts` | the eight gates, zhishi from the hour palace |
| `spirits.ts` | the eight spirits, direction per yang/yin dun |
| `patterns.ts` | fuyin, fanyin, sanqi deshi, qinglong fanshou, feiniao diexue, wubuyu shi, menpo, jixing, rumu, void |
| `strength.ts` | the five seasonal states of strength |

**The line not to cross** — *restated, and the first version of it was in the
wrong place.* It read: a configuration such as qinglong fanshou is a structural
fact, that it is auspicious is not, and the engine reports the one and never
the other. That line does not exist in the tradition it is drawn across. The
classical sources do not name an arrangement and rate it in a second step:
門迫 *is* 迫, oppression; 擊刑 *is* 刑, punishment; the name and the fortune
arrive in the same line of the same text. Splitting them meant reporting half
of what was read.

And it did not hold. The fortune came in anyway, through the glosses —
`label.pattern.menpo` was «gate oppressed», which is not a neutral phrase —
where it could not be tested, sourced or contradicted, and where it existed
once per locale rather than once. The rule was pushing the judgement into the
least accountable layer in the repository.

**Where the line actually is**: an attribute belongs in the engine when the
sources hand it down concordantly *and* it is a property of the configuration
rather than of somebody's situation. The engine stops at everything that needs
a question to have been asked — choosing the 用神, ranking palaces, ordering
hours, dating an outcome, advising. `Pattern.valence` is 吉, 凶 or 吉凶, an
identifier and a glyph, never prose, glossed at the surface like every other
name. The type system still shows the boundary; it now shows the right one.

Note what did *not* change: `formatChart` prints the configurations in the
order the engine found them and no surface sorts them by fortune, because a
ranking is the thing being refused. Nothing counts 吉 against 凶.

Two findings:

- **空亡 is 吉凶, and that is transmitted rather than hedged.** The void
  withholds whatever falls into it: what was wanted does not arrive, and
  凶格落空則凶不成 — a baleful configuration fallen into the void does not come
  off either. Two halves of one rule, not two schools, so it is a third value
  and not a missing one.
- **A fortune stated against occurrences is not stated at all.** The first test
  read each fortune off charts cast for a handful of dates and asserted the
  mapping. 青龍返首 wants heaven's 戊 over earth's 丙 and never appeared in the
  sample, so the assertion passed on `undefined`. `valenceOf` exists so the
  table can be asserted whole, and a surface can name a fortune without waiting
  for a chart to exhibit one.

> Commits: `Determines the dun and the ju number` · `Lays out the earth plate` · `Rotates the heaven plate and the nine stars` · `Places the eight gates and the eight spirits` · `Recognises the configurations of the chart`

**Partly done.** `computeQimenChart` in `dunjia/` casts the 時家 chart by the
拆補 method: the dun and ju, the earth plate, the heaven plate and the nine
stars, the eight gates and the eight spirits, the chief and the chief gate.
Verified against `qimen-dunjia` on 160 charts from 2000 to 2023 — all thirteen
quantities compared agree on every one, and the derived earth plate reproduces
all eighteen published arrangements without a cell out of place.

Read that agreement for what it is: consistency with one implementation of a
contested tradition, not verification against an authority. See § 5.

**Now done too**: `patterns.ts` and `strength.ts`. The chart is read as well
as cast — 空亡, 入墓, 門迫, 擊刑, 伏吟, 反吟, 五不遇時, 青龍返首, 飛鳥跌穴,
and 旺相休囚死 for every star and gate.

There is **no runnable reference** for any of this, unlike the layout: the
rules come from Chinese-language sources and the tests state each rule against
the transmitted list it is supposed to reproduce. Where the sources disagree,
the code says so and picks one; where they were too thin to pick from, nothing
was written. **三奇得使 is deliberately absent** for that reason.

**The zhirun method is implemented too**, and choosable on every surface:
`--method` on the CLI, `method` in the address and the MCP schema, a select
in the form. `zhirun.ts` sits in the calendrical layer, not in `dunjia/`:
the 超神接氣 bookkeeping is a fact about days and terms, and the ju only
reads it. The assignment needs no history — pinning each solstice's block
inside its one-block window fixes every block between two solstices, and a
thirteenth block between two pins *is* the intercalation, repeating 芒種 or
大雪. Four findings:

- **The futou follows the day pillar.** The 符頭 is a fact about the day
  ganzhi, so it moves with `dayBoundary` and true solar time exactly as the
  pillar does, and the same instant at 23:30 can stand on either side of an
  intercalation. The alternative — reckoning the blocks on 120°E like the
  lunar calendar — would let a chart's ju contradict its own day pillar.
- **The drift bounds are looser than the pin.** The window holds 超神 to
  eight days *at the solstices*; between them it crests at ten or eleven —
  which is the classical trigger, "nine or ten days and the leap must be
  set" — and 接氣 deepens through the short winter terms. Measured over
  2018–2027: −7 to +11 days. The first version of the invariant test
  asserted the pin's bounds everywhere and was wrong.
- **The two methods disagree about more than the yuan.** Around a term's
  edges they disagree which term the ju belongs to, and near a solstice
  about the dun itself: 15 June 2024 is a yang chart under 拆補 and a yin
  one under 置閏, whose block already serves 夏至. `Ju.term` says which term
  was used, and the surfaces show it.
- **The threshold is the contested pin.** Nine days of 超神 force the leap
  here and in `kinqimen`; some sources say ten, and a Japanese tradition
  says "the futou nearest the solstice", each shifting the window by a day.
  One value is implemented and the comment on `MAX_CHAOSHEN` declares it.

**拆補 itself splits in two, and the split was found by comparison.** A second
runnable reference — fengshui-hacks.com — was read cell for cell over 266
moments and matched nothing this engine cast: 26% under `chaibu`, 56% under
`zhirun`. The measurement that explained it is that the disagreement alternated
**every five days and not every fifteen**, which is a yuan and not a block, so
it could not be a 置閏 whose intercalation was pinned differently. The term in
force plus the yuan read from the day's place in the fifteen-day 符頭 cycle
reproduces that reference on 260 of the 266, the six exceptions all falling in
超神 windows. That is the divergence `docs/sources.md` had already recorded
inside 拆補 from `kinqimen`, and finding it a second time independently is what
let it be shipped: `yuan`, defaulting to `term`. Two further things fell out:

- **Hold the ju equal and the layout engine is confirmed.** Cast under the
  reading that reference follows, 260 of the 266 charts agree cell for cell —
  plates, stars, gates, spirits, 值符, 值使, 旬首, 空亡, 驛馬. A disagreement
  about the ju had been masking a complete agreement about everything else,
  which is the argument for comparing a chart layer by layer rather than as a
  whole.
- **The engine wrote one creature under two glyphs.** 滕蛇 on the spirit plate
  against 螣蛇夭矯 among the configurations, where `docs/sources.md` had already
  settled 螣 from three sources. Nothing internal caught it — the identifier
  `tengshe` is the same either way, and the pinyin test only asserts a reading
  exists. Comparing hanzi against an outside implementation did.

Still to come: `maoshan`. `determineJu` throws `METHOD_NOT_IMPLEMENTED` for
it rather than quietly substituting, because a chart cast by the wrong method
looks right and is not. The same refusal covers the flying plate and the
systems beyond 時家: `plate` and `system` stood in the type from day one, as
§ 3 requires, but the engine never read either field — a caller asking for a
flying plate received a rotating chart with `fei` written on it.
`computeQimenChart` throws `OPTION_NOT_IMPLEMENTED` for both.

Three findings from the reading layer:

- **門迫 is derivable.** A gate is oppressed where its element controls the
  palace's. The transmitted list — metal gates in wood palaces, the water gate
  in the fire palace, and so on — is exactly the set the rule produces, so the
  list became a test instead of a table.
- **五不遇時 strikes twice on two days out of ten.** Twelve hours draw their
  stems from a cycle of ten, so two stems repeat within a day: on a 己 day the
  rule catches 乙丑 *and* 乙亥, on a 庚 day 丙子 *and* 丙戌. The mnemonic names
  only the earlier of each, and reading it as exhaustive would have been wrong.
- **入墓 does not follow the twelve stages.** The stages put the tomb of 乙 at
  戌, in Qian; the Qi Men tradition puts it in Kun with 甲, and some schools
  give it both. The table is transmitted, not derived, and it is commented as
  such so nobody 'fixes' it later.

Three findings:

- **The earth plate is two sentences, not eighteen tables.** From the palace
  the ju is numbered for, lay the six instruments and the three marvels one to
  a palace, counting up through the Luoshu numbers in a yang chart and down in
  a yin one. Deriving it makes the published tables a test rather than data.
- **The centre is not on the ring.** The turn that makes the heaven plate runs
  along the eight, so a plate whose centre holds the instrument leaves it there
  and turns what stands at the lodging palace instead. The invariant "the
  instrument ends over the hour's stem" is false in exactly that case.
- **The gates fly, they do not turn.** They count through the Luoshu numbers
  themselves and so pass through the centre, which the ring never does. Two
  different geometries in one chart.
