# Phase 22 — A place said in degrees

**Done.** Every form with a place field can now say that place in coordinates
as well: as a **refinement** of the one the search found, or **instead of** it.
`LocationSearch` folds the two fields under the place they belong to, so the
two surfaces that ask for a place — `MomentForm`, and the scan, which asks the
component directly — got it by the component getting it. `readPlace` and MCP's
`resolvePlace` read the same rule, and `CLAUDE.md` now states it.

**What made it worth doing is a decision this project had already taken and
only half kept.** `import-geonames.mjs` loads `cities500` and not
`allCountries`, and says why in its own words: the larger dump reaches every
hamlet on Earth at the price of five million rows and a database above a
gigabyte, so «someone born in a place below five hundred inhabitants has to
enter coordinates and timezone by hand — the API accepts them in place of an
identifier — which is the trade this project has chosen». The API did accept
them. **No form did**, so for anybody who came through the interface that
sentence was simply false, and the trade was a cost paid with nothing bought.
This phase is the other half of it.

**The accuracy it buys is small, and saying otherwise would be inventing a
reason.** Four minutes of solar time to the degree of longitude is, at Italian
latitudes, about three seconds to the kilometre: ten kilometres off the
nearest town is half a minute, fifty is under two and a half. Against an hour
branch two hours wide, that changes which branch an instant falls in for
something between half a percent and two percent of moments. **What it is
worth is the rest**: a place that is not in the dataset at all can now be
named rather than substituted, and a board says where it was actually laid
instead of naming a town somebody settled for. And when the boundary case does
land it takes everything with it — the hour pillar, the ju, the 值符 — which
is rare in frequency and total in consequence.

**Three things this phase had to decide and could have decided wrongly.**

*The zone.* Coordinates cannot carry one, and the server's fallback is the
machine serving the page — an hour wrong and indistinguishable from right. So
with an identifier the zone stays the identifier's, and a `timezone` sent
beside one is ignored because the place already answered it; where the
coordinates stand alone the form asks for the zone outright, starting from the
browser's — a guess, but one standing in a control the reader is looking at
rather than a default they would never see.

*Half a pair.* Refused rather than half-read, on the server and by the two
fields requiring each other in the browser: a latitude alone would be answered
on the meridian of Greenwich, and it would look exactly like the chart asked
for.

*What the answer says.* A refined place carries both halves — `Rome, Lazio,
Italy · 41.8919, 13.5113` — because a sheet naming a town for a board laid
fifty kilometres away is untrue and nothing downstream could catch it. Which
also means the address now carries a doorstep rather than a city, and
`privacy.address` says that in both catalogs.

**A chosen place fills the fields with its own, and that needed a fourth
decision.** The first cut left them empty, which made a refinement a thing you
could only do by going and finding out where the search thinks the town is and
typing both numbers back in — a nudge with no starting point is not a nudge.
Filled, they are usable; but «filled» then stops meaning «asked for», and
carried anyway they would have put a pair of degrees in every address of Rome
and printed it under every board as a refinement nobody made. So what travels
is what **departs** from the place — `refines` in `moment.ts`, which is the
rule `momentQuery` already keeps for `chaibu` and `zishi`, applied to a value
the reader can see. It governs the address, the line over the board and the
shut fold at once, which is why it is one function and not three tests: the
day they disagreed, a chart would be laid at one place and labelled at
another. The press under the fields turns with it too — with a place it is
«back to the place's own» and appears only once something has moved, and
without one it is still «remove», restoring empty.

**The latitude enters no calculation, and where that is said moved once.**
Only the longitude reaches a board here — the one method that would read a
latitude is 七政四餘's 宮 division by houses, which `qizheng.ts` declares and
refuses. A field that changed nothing silently is the thing this project
refuses elsewhere, the yuan select under zhirun, so the first cut put the
bound in a note under the fields. The note is gone, and deliberately: a fold
opened on purpose to type a longitude into is opened by somebody who knows
what one is, and two paragraphs over three fields is a lecture where a form
was wanted. **The bound is not gone with it** — it is in the README, in
`CLAUDE.md` and here, which is where a reader looks something up rather than
has it recited. The coordinate still travels and the answer still prints it,
so nothing silently disappears; what a reader loses is being told, in the
form, a thing they did not ask. When a latitude does start deciding
something, nothing here has to move.
