# Phase 26 — The frame a caller reads first

**Done, and it is one paragraph and one test.** The MCP server's
`instructions` — the text a client receives at initialize, before any tool is
listed or called — named two boards where the server has been laying six.
They name all six now, and `packages/mcp/test/docs.test.ts` asserts that every
compute tool the server offers is named there.

**This phase exists because phase 25 predicted wrongly and a phase file is not
edited.** Phase 25 found the staleness, declined to fix it, and said it
belonged «to whatever phase next revises `docs/agent-prompt.md`». It was fixed
twenty minutes later and no revision of `docs/agent-prompt.md` was involved.
That paragraph stands where it is, as phase 12's address and phase 13's
«planned» stand; this is the entry that supersedes it.

## What was wrong, and why nothing could have noticed

The instructions opened on «Casts Qi Men Dun Jia charts and computes the Four
Pillars» and sent a caller to `compute_qimen_chart` or `compute_bazi`. Both
sentences were true when they were written, and phase 23 was the fourth board
to land without either being read. An agent reading the frame learned that two
tools existed; the other four it had to notice for itself, from a list where
they are named in hanzi. **The board that answers a given question is
frequently one of the four.**

This is the failure mode `apps/web/test/docs.test.ts` was written for one
phase after `README.md` said «eleven tools» over a server registering twelve,
and the frame had it worse than a count does: a count is wrong the moment the
code changes, where a frame that names two of six stays *true* and merely
stops being complete. Nothing fails. Nothing looks wrong on the page.

## Naming six created the failure naming two could not

`docs/readings.md` § "One board, never two of one instant" is the rule, and it
had never needed to reach an MCP caller: a frame offering two tools does not
tempt anybody to triangulate. A frame offering six does. An agent handed six
compute tools calls three and reports their agreement, and **the boards are
not independent** — a 奇門 chart and a 六壬 board share the day pillar, the
decade, the void branches and five of the eight spirits; a 七政四餘 board's
twelve 宮 are the ring a 六壬 general is seated on; a 八字 *is* the four pillars
the others are built from. Where two agree it is frequently one fact printed
twice.

So the line went into the frame, in capitals, and the argument stayed in
`docs/readings.md`. That is the split `CLAUDE.md` already uses — imperative
here, reasoning there — and the reason the imperative belongs at initialize
rather than in a tool description is that **the failure happens before
anything has been read**: by the time an agent is reading `compute_liuren`'s
description it has already decided to call it second.

Three smaller scopings came with it: `draw_liuren` stands beside
`draw_qimen_chart` under the call-after-compute rule, where only the latter
was named; `compute_taiyi` is called out as taking a year and nothing else,
because the flow sentence sends every caller to `search_location` first and
for that one tool it is wrong; and chaibu against zhirun is now said of *Qi
Men charts* rather than of *charts*, with a line saying every other board
declares its own divergences in its own tool.

## The test, and what it does not catch

The frame gets the bargain the hand-written counts got: `docs.test.ts` asks a
real client for the tool list, filters to `compute_*`, and requires each name
to appear in `client.getInstructions()`. A board added to this server now
fails the suite until the frame names it. A second assertion holds the
one-board line in place.

**It is a containment check and that is a real limit.** It would pass on a
frame that named a tool inside a sentence telling a caller not to use it, and
it says nothing about the other six tools, which are not `compute_*` and are
not asserted. What it defends is the one property that actually rotted — a
board arriving and the frame not mentioning it — and it should not be read as
defending more.

Verifying it bites took two attempts, which is worth recording because the
first attempt is the one that looks like success: removing `compute_taiyi`
from the opening list left the suite green, because the frame names that tool
**twice** — once in the list of boards and once in the sentence about its
input. A containment assertion over prose is only exercised by a mutation that
removes every mention, and a single-site mutation passing is not evidence the
test is sound.

## What this phase looked at and left alone

`docs/agent-prompt.md` was audited on the assumption that it had gone stale
the same way, and **it had not**. Its tool table carries all twelve tools with
all six boards, and its «How sure the numbers are» section carries all six
including 太乙's account of being checked against 《太乙金鏡式經》 itself. The
document phase 25 pointed at was already current; what was stale was the one
agent-facing text that no document owns, which is why it was the one nobody
had read.

That is the generalisable part, and it is not about this server. **The frame
was stale because it had no home in `docs/`.** Every other agent-facing claim
here is owned by a page that a phase touches when it adds a board —
`sources.md` takes the quantity, `parameters.md` takes the divergence,
`agent-prompt.md` takes the tool. The `instructions` string lived only in
`server.ts`, was read by no test and cited by no document, and so it was the
one surface where «the new-feature skill lists the surfaces to cross» quietly
did not apply. The test is what gives it an owner.
