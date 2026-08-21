# Phase 0 — Scaffolding

Monorepo, `tsconfig.base.json`, workspaces, vitest, `.gitignore`, LICENSE
AGPL-3.0-or-later, `CLAUDE.md` with the constraints, `graphics/`.

`packages/i18n` first, even while nearly empty: it is a dependency of everything
else, and retrofitting it is what produces hardcoded strings.

`packages/geo` ported from undicesimacasa: `database.ts`, `search.ts`,
`types.ts`, `schema.sql`, `scripts/import-geonames.mjs`. Scope, comments and
error codes translated; default locale to `en`. Dataset and schema follow the
reference exactly — `cities500`, ~235 000 places, a database of about 90 MB.

Reading `allCountries` instead was tried and reverted. It does make every
hamlet findable, but it costs 5 048 805 places and a 1.25 GB database, and it
drags a second-level subdivision and a denormalised index in with it to keep
search responsive. Someone born below five hundred inhabitants enters
coordinates and timezone by hand, which the API accepts in place of an
identifier. If that trade is ever revisited, the measurements are in § 5.

One deliberate departure from the reference remains: **prefix matching is a
range comparison, not `LIKE`**. Under the default collation SQLite cannot use
an index for `LIKE 'prefix%'` and scans every name in the table — 111 ms
against 2.9 ms for the seek, per keystroke. The behaviour is identical; only
the query plan differs. A test asserts the plan.

> Commits: `Sets up the monorepo and its packages` · `Provides message catalogs for English and Italian` · `Searches locations against the local GeoNames dataset`
