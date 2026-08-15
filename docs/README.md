# Documentation

The README says what the project is and how to run it. These say the things
that are too long to live there and too important to live only in a commit
message.

| | |
|---|---|
| [`sources.md`](sources.md) | where every number comes from, what it was checked against, and what the checks disagreed about. The register of references, with licences |
| [`agent-prompt.md`](agent-prompt.md) | the contract a model calling this project has to read first — through MCP or through the REST API |
| [`provenance.tsv`](provenance.tsv) | every file this project was read off that came from the network: URL, revision, date taken, sha256 |

`PLAN.md` at the root holds the development history: what each phase set out
to do, what it found, and what it got wrong on the way. `CLAUDE.md` holds the
constraints that have to be known before touching any code.

The scans `sources.md` was read off are **not in the repository**. Most were
bought and cannot be redistributed, so they are held locally in `texts/`,
which `.gitignore` excludes and whose own README lists what is on the shelf.
`sources.md` therefore cites by title, edition and chapter — never by path —
and every claim in it has to stand for a reader who has only the citation.

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

## Where a new document belongs here

When it is **reference** — something a reader returns to and looks things up
in. `sources.md` is consulted whenever a number's provenance is in question;
`agent-prompt.md` is read once before writing a prompt and then again when
something goes wrong.

Not the reasoning behind a decision, which belongs in `PLAN.md` beside the
phase that took it, or in a comment beside the code that embodies it. This
project keeps its arguments next to what they justify.
