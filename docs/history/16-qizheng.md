# Phase 16 — 七政四餘

**Done.** What follows is what it settled, because the settling was the phase.

**The half that was free.** `ephemeris.ts` already spoke to Swiss Ephemeris
for the Sun and the Moon and nothing else. This project pays the AGPL for
sweph and used a fraction of it; the 七政 were seven more calls, and the
speed came back with them, so 順 and 逆 cost nothing.

**The 四餘 were the phase, and one of them was a trap.** 羅睺 is not Rahu.
The name moved twice — ascending node, then descending from the late Tang,
then back again under 湯若望 for the 時憲曆 — and the 星命家 never followed
the last move. The art keeps the old law: 羅睺 at the descending node as 火餘,
計都 at the ascending as 土餘, 月孛 at the lunar apogee as 水餘. So `luohou`
defaults to `descending`, which is the reverse of what anyone reasoning from
India would set, and both values ship because it is one call either way.
**紫氣 has no referent** and is `off` — and that, rather than any gap in the
sources, is the whole reason. A rule exists and two witnesses carry it with
its epoch constant. What cannot be had is a check: calibrated together at
1300, the same table's 羅睺 is good to 0.25° in 2026 and its 月孛 is 69° out,
and telling which case 紫氣 falls in requires a position in the sky to compare
against. The board reports 三餘 and says so, which is the exit that claims
least. The three that do compute are **mean** elements
deliberately: they are 隱曜, and a mean motion is the only thing any text
naming them was ever describing.

**The frame was the decision, and it was answered by refusing to tabulate.**
*Where* a planet is, is arithmetic; *which 宿 and at what 度* looked like a
commitment to one 曆's table and one epoch. It is not. A 宿 begins at its
距星 — that is what a 宿 *is*, and the tables exist because someone measured
those stars — so `data/sefstars.txt` carries the twenty-eight and sweph places
them at the instant asked for. No epoch is chosen, the frame is right in the
eleventh century and the twenty-third alike, and `shixian` and `shoushi`
survive as declared values for whenever a table arrives with a citable epoch.

**The one place the star list is a choice is 觜 and 參, and it decides the
board.** Precession drove the width of 觜 through zero: after the thirteenth
century φ¹ Ori stood east of δ Ori, the two 宿 came out reversed, and the
needle of the twenty-eight took its neighbour's width. 《儀象考成》 (1752)
restored the transmitted order by moving the two distances to λ Ori and ζ Ori,
and that is what ships. Laid the old way the ring has one pair out of order
and 觜 measures −1.24°; laid the Qing way all twenty-eight are ordered and 觜
measures 0.97°. **That measurement is also the whole verification of the
frame**, and it is worth being plain about why: nothing is checked against a
published table, because no table is being copied and there is no reference
implementation of "the boundaries are where the stars are". What stands in its
place is over-determination — twenty-eight widths each with a transmitted
shape, a ring that must close on 360°, and 觜 as a one-degree needle only the
right pair threads. It is the argument the 值日宿 epoch stands on, and it is
weaker evidence than a runnable reference. Say so at the surface.

**That last paragraph was true when the phase closed and is no longer the
whole of it.** 《儀象考成》 reached the shelf afterwards — 卷一~卷十六, from
the CADAL scans on archive.org — and it carries two things the phase had to do
without. The 觜/參 assignment is argued there in the compilers' own words,
three earlier assignments named and refused, ending on 「觜宿黃道度恆在參前
一度弱」, which is the 0.97° above stated by the source. And 卷二~卷十三 are a
star table for 乾隆九年甲子 (1744), one 宮 to a 卷, in which the same two 距星
give a width of 0°59′27″ against this engine's 0°58′29″.

**The residuals are the part worth carrying forward.** Three 距星 have been
read off: 0.5″, 7.6″ and 50.5″ in ecliptic longitude. The first invited a
conclusion the third refuses — the table is good to about a minute of arc, not
to a second — which is still a seventieth of 觜, the narrowest question the
frame answers. The frame still copies no table and still stands on
over-determination; what changed is that this is no longer the only thing said
for it. See the 七政四餘 section of `docs/sources.md`.

**命宮 is 立命 by 加時**, which the texts state in a line: the hour laid on the
Sun's palace, counted forward to 卯. It gives a palace and no degree, which is
what the rule has to give, and it is checked against the sky rather than
against a worked example — at 卯時 it returns the Sun's own palace, which is
sunrise; at 酉時 the opposite, which is sunset. `ascendant` is declared and
refused: a second method, not a sharper reading of the first.

**What it reads, and what it does not.** 《果老星宗》 and 《星學大成》
(萬民英, Ming) are the texts, and they are prose-verdict doctrine of exactly
the kind this engine does not import. The engine computes the geometry — the
positions, the lodges, the 命宮, the twelve 次 — names what the tradition
names, and stops. That it is a fate art changes what is on the board. It does
not change what the board is allowed to say.

**The twelve 人事宮 nearly did not ship, and the reason they did is worth
knowing.** 命宮, 財帛, 兄弟 and the rest follow from the 命宮 by counting, and
no source consulted states which way the counting runs in terms another could
be held against — so two agreeing sources was not on offer, and the first pass
left them out. What carried them in the end is the 值日宿 epoch's argument:
these are the Hellenistic twelve in the Hellenistic order, they are *not*
紫微斗數's twelve, and **only one direction fits the names** — laid zodiacally
田宅 falls where the sky is deepest and 官祿 where it is highest, and laid the
other way those two swap and ten of the twelve come out wrong. A separately
transmitted quantity agrees: the 運限 walk 命 → 相貌 → 福德 → 官祿, the
numbering descending, so the numbering climbs zodiacally. Weigh it as one
source and three derivations, which is weaker than a runnable reference and
is written down as such; whoever finds 《果老星宗》 stating the direction
outright confirms or overturns it in one commit, and nothing else moves.

**Every surface has crossed.** The calculation and its tests, both catalogs,
`format.ts`, `qimen qizheng`, `compute_qizheng`, `/api/qizheng`, `/text` and
`/plate`, the drawing, the section at `/[lang]/qizheng`, the README,
`docs/sources.md` and `docs/agent-prompt.md`.

**The drawing is the 六壬 board's ring, and that is a finding rather than a
saving.** The twelve palaces of this board *are* the twelve of that one —
thirty-degree stretches of the ecliptic under the branches that name them — so
drawing them differently would have said they were different things. What
parted the two files is what stands on the ring: a 六壬 board turns one thing
over each palace, where this one lets the sky fall where it falls, so a palace
holds nothing on most mornings and four bodies on some. That crowding is what
put the eleven in a *listing* above the ring, glossed, and left the ring
carrying glyphs alone — a glyph may stand unglossed where it was glossed a
line before, which is the bargain the 六壬 ring already strikes with the branch
of its ground.

> There is deliberately **no `/prompt`** — and phase 18 reverses it, for a
> reason worth setting down rather than quietly overwriting. The argument made
> here was that the twelve 宮 of this board are the ring a 六壬 board's 月將 is
> seated on, so handing a model both would be one fact counted twice. Every
> clause of that is true and still stands. It simply never reached this
> conclusion: a consultation hands over **one** board, so the two are never in
> a fence together and the double count cannot arise. The rule invoked forbids
> the pair, not the member. What did have to be settled before this board could
> be handed to a model was a different thing and a harder one — its twelve 宮
> arrive already *named* — and that is settled in phase 18 and in `CLAUDE.md`.
