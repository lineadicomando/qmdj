# Phase 9 — Reading the palace, not just laying it out

The chart was cast correctly and read thinly: four plates and nine named
configurations, and nothing about how a gate stood to the ground it had landed
on. This phase adds what is **derivable or transmitted concordantly** and stops
where the sources stop.

**門宮 and 星宮 — done.** `relation.ts` reports which of the five relations of
the phases holds between a gate or a star and the palace it rests in, from the
traveller's side: 比和, 生我, 我生, 剋我, 我剋. Two things worth keeping:

- **The relations, not a school's labels for them.** 義, 和, 迫, 制 are
  transmitted, do not agree between sources on which relation takes which word,
  and carry a fortune with them. The five-phase vocabulary carries none and is
  disputed by nobody. One of the five already had such a name here and keeps
  it: 我剋 for a gate is 門迫, and `patterns.ts` reports it with its fortune.
- **門迫 is now said once.** `oppressedGates` asks `relationOf` instead of
  reaching for `CONTROLS` a second time, so the configuration and the relation
  cannot drift apart. A test asserts they never do, over a spread of charts —
  a palace marked 門迫 whose gate reads anything but 我剋 would mean the rule
  had been written twice and one copy edited.

**驛馬 — done, and derived.** The four transmitted couplets — 申子辰馬在寅 and
its three fellows — are one rule said four times: each triad is the frame of a
phase, and the horse is the branch facing that phase's 長生. So the couplets
became a test and the code holds no table. **Both horses travel**, 日馬 and
時馬, each labelled with the pillar it was reckoned from: they are two things
the tradition names apart, not two readings of one, and choosing between them
in the engine would be a school chosen in a line of output.

**寄宮 — a parameter at last.** The centre lodged in Kun by a hardcoded `2`,
which made this engine's school implicit in the one place the project says it
never will be — and it is not a cosmetic choice, since the lodging decides
which palace the chief and the chief gate are read from. `centreLodging` is
`kun` or `dun` (Kun in a yang chart, Gen in a yin one); `kun` is implemented
and `dun` is refused with `OPTION_NOT_IMPLEMENTED`, as `plate` and `system`
are. Like those two it stays off the surfaces: a parameter with one working
value is offered nowhere and exists in the type, which is what keeps the API,
the MCP schema and every shared link from breaking when the second arrives.

**寄宮 was computed and not reported**, which comparison found later. The
lodging already decided which palace the chief gate is read at, and every path
that needed it went through `lodge` — but the chart printed the host's own
stem and nothing else, so a reader standing at 坤 saw one stem where the
doctrine gives them two and had no way to learn from the chart that the centre
lodges there at all. `PalaceContents.lodged` says it now, on the host's row.
**One stem and not two**: 轉盤 turns the ring of eight and never the centre, so
what the ju put there stands on both plates. Schools that instead glue the
lodged stem to its host and turn the pair together get a heaven plate carrying
it elsewhere — a divergence in how the plate is derived, and one for `plate`
rather than for this field. The drawing does not show it: its cell has six
registers and all six are full on the host, and a picture is not where notes
go.

Also moved: `BRANCH_PALACE` and `branchesOf` from `patterns.ts` to
`palaces.ts`. Which palace a branch falls in is a fact about the board, and by
now three unrelated things ask it — the void palaces of a decade, the post
horse, and the frame of branches drawn around the grid.

**十干克應 — eleven of eighty-one, and the eleven are the point.** This was
written up first as an outright refusal: the table has some sixty named cells,
neither runnable reference this project uses computes them, and writing them
from recollection is what § 5 says has been wrong more often than right. A
search for public sources then changed the answer, and the way it changed it is
worth recording.

- **A classical text is online, complete and in the public domain.** The
  煙波釣叟歌 on Wikisource carries the famous pairings *in verse, verbatim* —
  六庚加丙白入熒, 庚加癸兮為大格, 六乙加辛龍逃走, and the rest. That is a
  tier-1 source for this layer, which nothing here had before. It also
  **confirms the two pairings already implemented**: the song's 丙加甲 and
  甲加丙 are 丙 over 戊 and 戊 over 丙, since 甲 is concealed by 戊.
- **Two complete 81-cell tables exist in open source**, one MIT and one under
  PolyForm Noncommercial — the latter unusable here, since it forbids
  commercial use and the AGPL forbids forbidding it.
- **So the standard was met for eleven cells and no more.** Nine were added:
  the eight the verse names outright plus 戰格, which two independent sources
  name alike. 庚 over 壬 was excluded although a complete table offers it,
  because only one source calls it 小格.

Three findings, and the first is the useful one:

- **The pairing is agreed far more widely than the name.** Every source marks
  庚 over 癸 as a named configuration; the verse and the Japanese tradition
  call it 大格, a modern implementation calls it 太白沖刑. Same at 刑格, at
  戰格, and at both 甲/庚 pairings. Had the check been «does a source name this
  pairing», all eighty-one would have passed. The check that matters is
  «do two sources name it the *same way*».
- **A complete table is not a better source than a partial one.** The
  eighty-one-cell files are complete, uncited and five months old; the verse
  is partial, eight hundred years old and citable to a line. The partial one
  carried more weight, and the test file states it couplet by couplet.
- **The interpretive column had to be dropped on the floor.** Both tables ship
  a `desc` of the form «everything auspicious, achieved without effort». That
  is a reading of somebody's situation and it stays out; what came in is the
  pairing, the name and the fortune — which is exactly the shape `Pattern` and
  `Valence` were given a phase earlier, without knowing this was coming.

The seventy remaining cells stay out, and `docs/sources.md` now holds the
register: every source by name and licence, the cross-check pairing by
pairing, and the one entry a fourth source should be pointed at first — 戊 over
丙, where the MIT table dissents from the verse.

**And the documentation moved.** `README.md` was carrying a section on how
sure each number is, which was already too long and was about to double. The
provenance now lives in `docs/sources.md` and the README points at it. See
`docs/README.md` for what belongs there and what belongs in this file.

> Commits: `Says how a gate stands to the palace it rests in` · `Finds the post horse of the day and of the hour` · `Lets the school that lodges the centre be named` · `Names the stem pairs the sources agree on` · `Records where every number comes from`
