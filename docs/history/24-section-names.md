# Phase 24 — The sections say the names they are

**Done, and it is one rename and one word.** `/[lang]/chart` is now
`/[lang]/qimen`, the four endpoints under `/api/chart` are now under
`/api/qimen`, and the consultation — which stays at the root of a language —
answers to `/[lang]/consult` and `/consult` as well.

**A slug is a name, and `chart` was a shape.** Every other instrument here is
addressed by the art it lays out: `liuren`, `qizheng`, `ziwei`, `taiyi`,
`bazi`. That one was addressed by what its answer comes out as — which read as
a generic where its neighbours read as names, and stopped distinguishing
anything the day six sections drew a board apiece. The label above it never
said *Chart*: `nav.chart` has held the string `Qi Men` since there was a nav,
which is the whole argument in one line — the address was the only place on
this site where the section went by a different word than the one the reader
sees. Nothing in the interface moved; only the address did, to where the word
already was.

**The rename found an invariant that was true by coincidence.**
`Instrument.api` is one field and not two because «every board endpoint
returns its board named after itself», and the consultation depends on it
literally: it reads `body[instrument.api]`. Five endpoints kept that. The
sixth was `/api/chart` answering with a `chart` — the same word in both
places, so the field stayed one and the exception was invisible. Renaming only
the path would have broken the consultation's Qi Men press silently, so the
payload key moved with it and `/api/qimen` now answers with a `qimen`. That
this is the *second* time this exact contract has failed quietly on this exact
board — phase 18's note records `body.moment` doing it for a year of commits
— is the argument for the test that now covers both: the endpoint table in
`api.test.ts` asserts the key, and it is the assertion that would have caught
this one before the page did.

**The line drawn, since a rename with no line runs to the end of the
codebase.** What took the art's name is what is an **address or a wire
format** — the route, the endpoint, the payload key, the two catalog keys. What
kept the English word is everything internal: `data.chart` on the page,
`ChartReading`, `QimenChart` in the engine, and every sentence of prose that
says «the chart section», because `chart` is the English for the object and
`qimen` is the name of the art. Renaming the prose too would have been fifty
edits buying a reader nothing.

**No redirect from the old address.** The same call phase 12 made when the
chart moved off the root, and for a stronger reason: nothing here is released,
so the links that would break are ours. A ghost route kept alive out of habit
is a route somebody has to decide to delete later.

**The consultation gains a name and does not gain an address.** It is the one
section with no art of its own — it takes any of the six — so the root of a
language stays right for it, and `nav.consult` stays the only nav entry
pointing at a bare `/[lang]`. What was wrong was that the section which
**leads** was the only one a reader had to know was *nowhere* in order to
reach: every other name typed after a language resolves, and `consult` was a
404. So the name resolves now, and it resolves **to** the root rather than
beside it — 308 under a language, where the destination is fixed, and 307 at
`/consult`, where it is negotiated from the request and a permanent answer
would be one reader's language remembered for the next one. Both carry the
search string, because under this section that string is the setup and a
consultation configured as nobody asked looks exactly like the one they were
sent.

**It does not reverse «a consultation is an act, not a link».** That rule is
about the *answer* — the board is cast at the instant of the press, the
question never leaves the browser, and neither is in the address. A redirect
leads to the form and to nothing else: reloading it finds the fields ready, as
reloading the root always has. What was named is the section. What is still
nameless, and stays so, is the consultation itself.
