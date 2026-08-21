# Phase 11 — The readings under the board

**Done**, and after phases 12, 13 and 14 rather than before them, which is why
it closes two surfaces and not one. The drawing was the one surface that
printed hanzi without their readings, against the rule that a name carries its
reading — and by the time this landed there were two drawings and the 六壬
section had opened two more places in HTML where a glyph stood with no sound:
the twelve branches of the 地盤 in its table, and the name of the rule that
drew the transmissions, both written out in the component with no reading
beside them because the client cannot import them from the engine. Fixed with
the band and not after it: the rule is the rule, and a phase named after it
that left two columns unsaid would be the same omission with a better excuse.

**Why it cannot go in the palace, which is where it belongs.** A register is a
glyph with a word under it wrapped to at most two lines, and the spacing was
chosen for the worst case of that — `巽` has one word and `坤` has "Guerriero
Oscuro", and the two are laid out alike or the palaces stop lining up. The
third line a reading would take is the register below it. Six names to a
palace and nine palaces, and the drawing is proportional throughout, so there
is no size at which the room appears: asking for 1800 pixels instead of 900
buys a larger picture of the same crowding. Setting the reading beside the
gloss instead of under it fails on the same arithmetic — a column is 7.6 ems
of word and «Guerriero Oscuro» is 8.6 of them before a reading is added.

**So it goes in a band, on the precedent the band under the grid set.** The
paper grows downward by what the band needs and the square does not move,
which is the whole finding of `Foot`: a list that came out of the grid resized
the palaces as the reader stepped the hour.

**The band costs the same on every chart, and this is the fact the design
rests on.** A board carries **forty-three distinct named things** — nine
palaces, nine stems, nine stars, eight gates, eight spirits — and it carries
forty-three on every chart of every hour, because what the hour changes is
where they stand and not which of them stand. The two plates hold the same
nine stems between them; the centre has no gate and no spirit; a yin dun
swaps two spirits for two others and the count does not move. Measured over
yang and yin duns at four hours: nine, nine, nine, eight, eight, every time,
and eight lines of band at every one of them. Where the configurations band
swings between one line and nine, this one does not swing at all — so the
paper is the same height on every chart, and the reader who steps the hour
sees the picture hold still.

**The reading travels on the shape, never in the labels.** `Named` gains an
optional `pinyin` beside its `hanzi`, and `PlatePattern` the same. It cannot
arrive through `PlateLabels`: that is the channel for words chosen in a
language, and a reading is not one — 休門 is xiūmén to every reader, and a
reading handed over per locale would be the design error a translated string
is. Optional, as everything here is optional that the drawing can do without:
a caller on an older engine draws the board with no band rather than failing,
and the band lists only what came with a reading. Nothing with no reading is
listed, and no reading at all is no band, the way zero configurations are no
band rather than a heading over nothing.

**Asked for by a heading, like the band above it and the frame around it.**
`captions.readings` draws it; its absence leaves it out. The heading is a word
in the reader's language and therefore the caller's to supply, which keeps the
package holding no catalog.

**Grouped by register, and the groups are not named.** All the palaces, then
the stems, then the stars, the gates, the spirits — each group starting its
own line and never sharing one. A group needs no word in front of it because
the shapes rhyme: a line of 門 is self-evidently the gates, and a reader who
learned that the gate is the bottom-right register — which is what the palaces
teach by putting the same thing in the same place — lands in the right
neighbourhood by shape alone. Grouping costs two lines over a run-on list
(eight against six) and buys the only kind of lookup that works here. **Not
ordered by reading**, which would be an index a reader cannot enter: somebody
looking a glyph up does not know its reading, which is why they are looking.

**The configurations keep their own band and gain their reading inside it.**
Those lines are short and flush left, so `名 reading · fortune · palace` fits
where it already stands and costs no line at all. The bare glyphs marking a
palace stay bare and are glossed in the band, which is the bargain already
struck there for a fortune.

**Two passes over the layout, because each half needs the other.** The wrap
needs the width and the height needs the wrap. Margin and cell depend on
neither band, so a provisional `layout` yields the true width to wrap against
and the final one is called with the line count — and a test pins that
invariant, because a later change making `cell` depend on a band would
silently wrap against the wrong width.

**A tone mark is a Latin letter, and `FONT_STACK` is CJK fonts and `serif`.**
The macron and the caron of ā ǎ ǖ live in Latin Extended-B, which the CJK
faces cover unevenly and the fallback covers or does not. So the probe that
refuses to rasterise a board no font can draw gains a second question, asked
only where the band was asked for: a reading rendered as a row of boxes is
the silent failure the first probe exists to prevent, one step further on.

Out of scope, deliberately: the `aria-label`, which reads the hanzi palace by
palace to a screen reader that does not need the pinyin spelled at it; the
palace registers, per the arithmetic above; and the captions naming the chief
star and gate, which the caller composes whole and can spell as it likes.

**The twelve branches of the compass came in, and they were not in the design.**
This was written before the frame was the frame it is now, and its list of what
the band carries was the list of what a palace holds. But the branches around
the grid are the one thing on the board glossed by nothing at all — the eight
directions are worded outside them and 丑 is not, because "second double hour"
is not what it means to anybody — so on a chart drawn with a compass they are
the line of this band that earns it most. They are written out in
`geometry.ts` beside the glyphs, which are written out there too: the frame is
the same frame on every chart, and a drawing that had to be told what stands
in it could be told wrongly.

**And the ring of twelve got the same band, from the same code.** `readings.ts`
holds the gathering, the wrap and the drawing of it, and both renderers call
it: two boards with different geometries and one problem, and a band that
drifted between them would teach a reader two habits for one lookup. The count
holds there too — twelve branches and twelve generals on every board there is,
plus the one to four stems the day and the transmissions turned up, which is a
line either way. What is not in it: the rule and the 課體, which are set in the
middle of the ring as words in the reader's own language and have no glyph to
be said aloud.

The cost, at the default 900: the grid goes from 900×1012 to 900×1300 on a
chart with four configurations and a compass — the square itself unchanged, and
ten lines of band under it, evenly filled rather than packed to the width,
since a group whose last line holds one name reads as a mistake. The ring goes
from 900×1220 to 900×1379. The two notes saying the drawing carries no reading
— on `Named` in `packages/plate/src/types.ts`, and in the transliteration
section of `docs/sources.md` — are replaced by what it now does.
