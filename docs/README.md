# Documentation

The README says what the project is and how to run it. These say the things
that are too long to live there and too important to live only in a commit
message.

| | |
|---|---|
| [`sources.md`](sources.md) | where every number comes from, what it was checked against, and what the checks disagreed about. The register of references, with licences |
| [`agent-prompt.md`](agent-prompt.md) | the contract a model calling this project has to read first — through MCP or through the REST API |

`PLAN.md` at the root holds the development history: what each phase set out
to do, what it found, and what it got wrong on the way. `CLAUDE.md` holds the
constraints that have to be known before touching any code.

## Where a new document belongs here

When it is **reference** — something a reader returns to and looks things up
in. `sources.md` is consulted whenever a number's provenance is in question;
`agent-prompt.md` is read once before writing a prompt and then again when
something goes wrong.

Not the reasoning behind a decision, which belongs in `PLAN.md` beside the
phase that took it, or in a comment beside the code that embodies it. This
project keeps its arguments next to what they justify.
