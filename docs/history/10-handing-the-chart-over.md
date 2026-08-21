# Phase 10 — The chart, handed to something that will read it

The refusal to interpret has a consequence nobody had followed to the end.
Somebody who wants a reading was always going to take the date to a model,
and a model handed a date and a place casts the chart **from memory** and gets
it wrong — the same failure `docs/agent-prompt.md` calls inventing a place,
arriving from the other direction. A wrong chart read well is the worst thing
this project can produce: nothing downstream catches it, because it looks
exactly like a right one. Refusing to help was not neutrality; it was leaving
the likeliest use of this engine to be served badly by something else.

So the chart travels **already computed**, and the conditions travel with it.
`readingPrompt` puts the transcript inside a fence and this repository's own
document around it, condensed and addressed to a model that will never read
it. `chartTranscript` is the one rendering the CLI, the endpoint and the
prompt all use — three that drifted apart would mean the text somebody pasted
was not the chart they were looking at.

What this is *not* is the site reading a chart. Nothing is sent anywhere,
there is no key to spend and no chat on the page: the prompt goes to a
clipboard and the reader decides where it goes next. Four things had to be
settled to keep that true.

- **The question never reaches the server.** `/api/chart/prompt` is told
  `asked=true` and nothing else, and the prompt ends on the line that
  introduces a question for the browser to append. A question is somebody's
  own — *will the illness pass*, *should I leave* — and one in a query string
  is one written into every access log between the two. This is why
  `ReadingRequest.question` distinguishes `undefined` from `''`, which reads
  as a flourish until you ask where the alternative would have put the text.
- **Two controls, not one.** The chart as words and the chart as a prompt are
  two errands, and burying the first inside the second would make plain text
  unreachable to whoever wants nothing to do with a model. `/api/chart/text`
  and `/api/chart/prompt`, a light tools row and a section of its own.
- **The suggested questions were built and then taken out.** Forty of them,
  hand-written in both languages and grouped by the eight errands of
  `purposes.ts` — curated rather than combinatorial, since a grammar
  assembling a question from a domain, an action and a horizon writes nonsense
  in two languages instead of one, with Italian agreement to get wrong on top.
  They were labelled as examples and said to be examples, and it was not
  enough: **a question nobody has asked has no 用神**, and one sitting in the
  field is indistinguishable from one the reader meant. A control that fills
  the one field the whole prompt turns on is a control that answers for
  somebody. The field is now typed into or left empty, and empty is a state
  the prompt already reports honestly. Deleted rather than hidden: the keys,
  `$lib/questions.ts` and the picker are all gone, and this note is what
  remains, so that the idea is not had a second time without its answer.
- **The disclaimer is in two places because it has to travel.** The footer
  carries it for whoever is reading the site, and `prompt.disclaimer` tells
  the reading to *say* it — a prompt goes somewhere else, and a disclaimer
  left on the page it was copied from was written for somebody who is no
  longer there. What it says is bounded the way everything else here is: the
  calculations are checked and the divination is not a science, and the
  second does not inherit the standing of the first.
- **A fourth way to be plausibly wrong turned up while writing the prompt.**
  `docs/agent-prompt.md` listed three, all of them things passed *into* a
  tool: a place, a date, a birth time. The fourth is done with what comes
  back. Questions arrive short — *will it go well* names no undertaking, no
  other party, no place, no horizon — and a 用神 cannot be chosen from one, so
  whatever palace gets read is the one the sentence happened to suggest.
  Nothing in the answer records that it was picked, which is what makes it the
  hardest of the four to catch. So both the document and the prompt now say:
  ask. Bounded on both sides — one or two questions and not a questionnaire,
  never a request for chart that no answer could supply, and if nobody
  answers, read what can be read and name what is missing rather than filling
  it in. That last clause is not politeness: a prompt can be pasted where
  there is no one to ask.
- **MCP got nothing, deliberately.** An agent holding the chart over MCP has
  read the contract and does not need it read to it. The prompt exists for the
  model that is not connected to any of this.

**And then the prompt was given a section of its own, which is where the
methodological problem turned out to live.** The block sat under the board,
and under the board a question can only be asked *after* the chart is on
screen — which is backwards. The instant of asking is the instant that is
cast; a chart looked at idly and given a question afterwards is a chart with a
caption on it.

Gating the chart section was considered and refused. Every way of doing it
broke something documented: a link that still rendered a chart would make the
gate theatre, one that did not would kill the shareable address; the arrows
either bypassed the gate or went; and the question would have had to sit in
the address, which is the one place it must never be. So the ceremony moved to
a section that can keep it, and the chart section went back to being an
instrument.

`/[lang]/consult` is therefore the only page here where **asking is not
navigating**. A consultation is an act rather than an address: cast by `fetch`
at the instant of the press, held in the component, gone on a reload. Only the
setup travels in the URL. That is not a shortcoming of the page, it is what a
consultation is — and it is also the only shape under which the question can
stay out of the address for good.

**The natal wish is answered by 年命, and the natal frame is gone.** Reading a
Qi Men chart as a chart of a life is common in the West and is not the
classical use. It was offered here once as a frame with the method withheld —
the application named as modern and minority, the mapping of palaces onto
parts of a life refused — and then withheld from the interface the day it was
built, because a frame and a warning is not much for a model to work with and
a mode that yields a poor reading teaches that this is what the method gives.

What replaced it is what the classics actually do with a birth: they look it
up inside the chart of the moment. 《遁甲演義》 (程道生, Ming, 四庫全書) —
「夫用遁之法，不推本命行年，未見精妙」 — has a reading consider 本命, the year
pillar of the birth, and 行年, the year being lived, before it considers
anything else, and has the person's own year ride a palace where a good star
and gate stand in strength. That is computable, checkable and small:
`nianming.ts` places two pairs and reports the palaces, the mooring of the
branch and the 納音 against that ground. Nothing else. 生旺 and 囚死 are the
text's own verdicts and need a question to have been asked.

**The refusal did not soften, it moved.** The prompt still says no palace
stands for a part of a life, and now says it beside something rather than
instead of it. `docs/sources.md` records the one classical text that does read
a life from a chart of a birth — 《奇門遁甲統宗》卷十二, which maps it through
the 六親 of the stems and not through the palaces at all — and why nothing
imports it.

**One birth, and everything else about it stays where it is.** Only the year
pillar is read: `born` is a date, `bornTime` and `bornTz` exist because a
birth within hours of 立春 belongs to the year before, and `gender` is read
for the direction of the 行年 count and nothing else — without it the year
being lived is left unplaced rather than guessed. The count itself is a
parameter like every other divergence, `sui` or `turns`, because 虛歲 is what
the rule was written for and is not what a reader thinking in birthdays
expects.

> Commits: `Says what a prompt for a model has to carry` · `Hands the chart over with the conditions attached` · `Asks the terminal for a prompt, and for the question it is read for` · `Puts the chart in the clipboard, as words and as a prompt` · `Poses a chart where the question can come first` · `Finds where a birth stands in the chart of a moment`
