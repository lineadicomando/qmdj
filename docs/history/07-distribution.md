# Phase 7 — Distribution and documentation

Multi-stage `Dockerfile` and `compose.yaml` on the reference's model: a single
image for web, MCP and dataset import. Ephemerides (~2 MB) in the image,
GeoNames on a volume.

`README.md`, `docs/agent-prompt.md` (the contract agents actually read),
`.claude/skills/new-feature/`. All in English.

**Done**, and the image was built and run rather than assumed.

Three findings, all from actually building it:

- **The root `build` script never built the web application.** It had been
  built by hand every time, so nothing caught it until the image tried to copy
  a directory that did not exist.
- **resvg does not apply CSS class selectors.** The font stack was declared on
  `.qmdj` in the stylesheet and so never reached the rasteriser; it worked
  locally only because the machine's *default* font happened to cover Chinese.
  The family is now a presentation attribute as well.
- **Font files without `fontconfig` are font files nobody can find.** The
  image installed `fonts-noto-cjk` and still drew an empty grid: with the
  files present but no index, the rasteriser behaves exactly as if none were
  installed. `fontconfig` and `fc-cache -f` are part of the fix, not a nicety.

And one thing worth more than the three: `png.ts` **claimed in a comment** to
check for a missing font and raise, and did not. The claim was written before
the check and never became true. The check exists now — it rasterises the same
tiny image twice, once holding 休 and once holding nothing, and refuses to
draw if they come out identical — and it is what turned a silent empty grid
into a message naming the package to install.

**Continuous integration came later**, on 2026-08-08, and finding out what a
fresh machine needs was the point of adding it. Two findings:

- **`npm test` on a fresh clone did not pass.** The web and MCP suites reach
  for the imported GeoNames dataset — the two Romes that prove a search
  chooses nothing, the Munich that proves the Italian exonym answers — and
  nothing said so until a machine without the 90 MB tried. The fixture the
  geo suite already built in a temp directory became a script,
  `geo:fixture`: the same four places at the default path, refused where a
  database already exists so it can never wear the dataset's name.
- **Moshier is not precise enough for the tests, though it is for charts.**
  The anchors were made at Swiss Ephemeris precision and asserted to the
  minute; an ephemeris accurate to a tenth of an arc second moves a term's
  instant by seconds, which is a different minute often enough. CI downloads
  the ~2 MB of files and caches them rather than letting the fallback shift
  an anchor.

The workflow builds in order, typechecks, runs every suite with the fonts
the drawing needs, and builds the Docker image without pushing it — each
step one that failed silently at least once before it existed. `.nvmrc` pins
the Node major the runtime image runs on, which is also the closest thing
there is to pinning `tzdata`: the zone rules live in the ICU data Node
bundles.
