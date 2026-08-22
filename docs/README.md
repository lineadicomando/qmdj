# Documentation

**Everything in this directory describes the project as it is now.** How it
got here is in [`history/`](history/README.md); what is not built yet is in
`ROADMAP.md`. Keeping those three apart is the whole arrangement: a reader —
or an agent — must be able to tell at a glance whether a page binds them.

| | |
|---|---|
| [`architecture.md`](architecture.md) | the packages, what depends on what, and the three absences that are load-bearing |
| [`parameters.md`](parameters.md) | every school divergence as an explicit parameter, with its declared default |
| [`i18n.md`](i18n.md) | the four kinds of string, the catalogs, and what leads in the reader's language |
| [`sources.md`](sources.md) | where every number comes from, what it was checked against, and what the checks disagreed about. The register, with licences |
| [`refusals.md`](refusals.md) | what is deliberately not computed, who asks for it, and why it is not here |
| [`readings.md`](readings.md) | what happens when a board reaches a model: the three kinds, the one-board rule, what a prompt commissions and forbids |
| [`notes.md`](notes.md) | what this project claims and how the claim is kept honest: the ladder a quantity is weighed on, derived against written, and the date a written entry shows |
| [`agent-prompt.md`](agent-prompt.md) | the contract a model calling this project has to read first — through MCP or through the REST API |
| [`sources.tsv`](sources.tsv) | the register as a table: one row a quantity, the rung it stands on, what it was checked against, and the section of `sources.md` that argues it |
| [`provenance.tsv`](provenance.tsv) | every file this project was read off that came from the network: URL, revision, date taken, sha256 |

`CLAUDE.md` at the root holds the rules that bind any change, one line each,
pointing here. `README.md` says what the project is and how to run it.

## One fact, one home

A rule stated in three places drifts in two of them. So each page above owns
its subject outright and everything else links to it: the school parameters
live in `parameters.md` and nowhere else, the prompt discipline in
`readings.md` and nowhere else. `CLAUDE.md` carries the imperative and a line
of reason, never the argument.

Counts written by hand — how many tools, how many endpoints — drift too, and
one of them had. They are asserted against the code by
`apps/web/test/docs.test.ts`.

## Where a new document belongs

Here, when it is **reference**: something a reader returns to and looks things
up in. `sources.md` is consulted whenever a number's provenance is in
question; `agent-prompt.md` is read once before writing a prompt and again
when something goes wrong.

In [`history/`](history/README.md) when it is the **record of a decision** —
what a phase set out to do, what it found, what it got wrong. Those files are
never rewritten to match the present; a phase that reverses an earlier one
says so, and the earlier one stands.

In a comment when it justifies **one piece of code** and nothing else. This
project keeps its arguments next to what they justify.

## The sources themselves are not here

The scans `sources.md` was read off are **not in the repository**. Most were
bought and cannot be redistributed, so they are held locally in `texts/`,
which `.gitignore` excludes and whose own README lists what is on the shelf.
`sources.md` therefore cites by title, edition and chapter — never by path —
and every claim in it has to stand for a reader who has only the citation.

**`sources.tsv` is that file read the other way.** `sources.md` argues one
quantity at a time, at whatever length the argument takes; the register is the
same claims as a table a reader can sort, count and print, with a `section`
column joining each row back to its argument. It states nothing `sources.md`
does not, and `apps/web/test/docs.test.ts` holds every row's pointer to a
heading that exists. What it adds is the rung, and what a rung means is
[`notes.md`](notes.md).

**`provenance.tsv` is the exception, and it is here because it is the one part
of that shelf worth sharing.** It holds no source and reproduces nothing: it
says which URL each retrieved file came from, at which revision, on which day,
and what its bytes hash to. Four kilobytes that let somebody else assemble the
same shelf and know they got the same bytes — which is exactly what the
gitignored copies cannot do for them. Paths are relative to the repository
root and point into `texts/`, so a clone that has fetched the files can check
the lot:

```sh
awk -F'\t' 'NR>1 {print $5 "  " $1}' docs/provenance.tsv | sha256sum -c
```

It covers what came off the network — Wikisource wikitext at its `oldid`,
the ctext pages, three smaller sites, and the reference implementations this
engine measures itself against, pinned to a version or a commit. It does not
cover the bought scans, which have no URL and no revision; those are named in
`texts/README.md` and cited by edition in `sources.md`. And it does not
displace the rule at the foot of `sources.md`: a link is not the evidence, the
extract is. This is provenance for the copies, not a substitute for quoting.
