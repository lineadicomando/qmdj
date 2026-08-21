# Phase 25 — The project takes its name

**Done, and the visual identity had arrived first.** The project is `shipan`,
式盤, shìpán. The seal was cut and landed in the web layout before the code
knew about it; what this phase did was carry the name inward, in five
commits, each of which builds and tests green on its own.

**What the name is.** 式盤 is the diviner's board itself — the round heaven
turning on the square earth — and it is the ancestor that 奇門, 六壬 and 太乙
have in common, which is what makes it the one word that covers a repository
holding all three and three more besides. The argument, the rejected rounds
(闕如, 遁甲) and the marks are in `design/logo/README.md`, which owns them; that
file called itself a candidate until this phase and does not any more.

**`qimendunjia` was the name of an art doing duty as the name of a project,
and the project outgrew it at phase 13.** Everything since — 六壬, the almanac,
七政四餘, 太乙, 紫微斗數 — is a board that is not dunjia, and `scope-widens.md` is
the argument that admitted them. The name was the last place still saying the
repository was about one of its six boards. This is that debt, not a
preference about words.

## The line drawn

Phase 24 drew this line in the opposite direction and this phase depends on
it: **`qimen` is the name of an art and `qimendunjia` was the name of a
project, and only the second moved.** `/api/qimen`, `/[lang]/qimen`, the
`compute_qimen_chart` tool, `QimenChart` in the engine, `nav.qimen.full` —
none of them is about the project's identity, and none of them changed. What
changed is what *named the repository*: the npm scope, the root package, the
binary, the MCP server, the compose project and image, the key in
`localStorage`, and the documents that open with a title.

**The scope could not land by halves.** `@qimendunjia/*` → `@shipan/*` is 192
occurrences over 102 files, and it is one substitution and a fresh install
rather than a gradual migration, because the lockfile and the workspace
symlinks are named for the scope: a tree with half of them renamed does not
resolve. Every other movement in this phase is small, which is the reason this
one went first — after it, each remaining diff is readable.

## The command was named after one of the six boards it lays

`qimen chart` is `shipan qimen`. Two renames in one, and the second is phase
24 arriving on the surface it started from: `chart` was addressed by what its
answer comes out as, where its eight neighbours are addressed by the art they
lay. The web fixed that a phase ago and the CLI still had it.

`cli.heading.chart` moved to `cli.heading.qimen` with the subcommand. The key
was named for the command, is read by the CLI and by three places on the Qi
Men page, and leaving it would have made the catalog the one surface still
saying the old word — the precise drift `docs/README.md` § "One fact, one
home" is about.

## What was not migrated, on purpose

**The stored colour scheme.** `qimendunjia:color-scheme` became
`shipan:color-scheme` with no read of the old key. A reader who had chosen a
theme chooses it again once. Nothing here is released, so the only preferences
that reset are ours — the same call phase 24 made about redirects, and for the
same reason: a compatibility shim added before there is anything to be
compatible with is a thing somebody has to decide to delete later.

**`docs/history/`.** `05-drawing.md` still says `@qimendunjia/plate/png`, and
it will keep saying it. A phase file is never edited to match the present; the
entry that supersedes it is this one.

**The repository and the remote.** They stay `qmdj`. Migrating them is done by
hand, outside the working tree, and a commit cannot do it.

## What this phase found and did not fix

Three package descriptions named two boards where there are six, and they
moved because they sit beside the `name` field that moved. **The MCP server's
`instructions` open the same way** — "Casts Qi Men Dun Jia charts and computes
the Four Pillars" — and they did not move. That text is the contract an agent
reads before its first call, it is incomplete rather than wrong, and its
staleness is older than this rename and independent of it. It belongs to
whatever phase next revises `docs/agent-prompt.md`, where the contract is
argued, and not to a phase about a name.
