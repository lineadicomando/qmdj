# Phase 4 — Command line

`cli.ts` in `core`: the cheapest way to exercise the engine before the other
surfaces exist. Subcommands `chart`, `bazi`, `terms`, `calendar`. Readable
output plus `--json`, `--lang` honoured throughout.

> Commits: `Exposes the calculation on the command line`

**Done.** `cli.ts` and `format.ts` in `core`, binary `qimen`, subcommands
`chart`, `bazi`, `terms`, `calendar`, each with `--json` and `--lang`.

The CLI is the first real surface, so it is the first thing to obey the i18n
rule end to end: it negotiates a locale from `--lang` then the environment,
prints every name as **hanzi followed by a gloss** — 休門 Rest, never one
without the other — and translates caught errors by their code. `--json`
emits identifiers and hanzi with no glosses at all, which is the shape a
program consumes.

Two things worth keeping:

- **The catalog is where the surfaces meet.** Adding the CLI meant adding
  about a hundred label keys, and the typed catalog caught every Italian one
  that was missing before it could ship.
- **Columns are counted in printed width, not code points.** Hanzi occupy two
  terminal columns; padding by `length` misaligns every table.
