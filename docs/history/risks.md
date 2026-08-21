# Risks, worst first

*As the register stood while the engine was being built. The evidence in item 1
is now carried per quantity in `docs/sources.md`, which supersedes it; items 2
to 6 became the constraints in `CLAUDE.md`. Kept for the reasoning.*

1. **Sources of truth — partly resolved, and worth reading carefully.**

   Official tables exist for solar terms and the lunar calendar, and phases 1
   and 2 were checked against them through `lunar-javascript`. For Qi Men no
   such authority exists.

   What a search of Chinese-language sources did turn up:

   - The **局數 table** — which ju each of the 24 terms takes in each of its
     three yuan — is agreed by three independent sources: the classical
     mnemonic 陰陽二遁三元定局歌 as quoted by two sites, and the table built
     into the `qimen-dunjia` npm package. All three match on all 24 terms,
     including the two the mnemonic is often quoted without, 立秋 2·5·8 and
     大雪 4·7·1.
   - `qimen-dunjia` (npm, 2.1.0) is a **runnable reference** for 時家奇門
     拆補轉盤. It emits the ju, the 旬首 and 符首, the 值符 and 值使 with
     their palaces, and all four plates across the nine palaces. It builds its
     pillars on `lunar-javascript`, which phases 1 and 2 already agree with.
   - `kinqimen` (PyPI, 0.0.6.6) covers 拆補 *and* 置閏, plus 金函玉鏡 (日家)
     and 刻家. It **does install under Python 3.9** — `sxtwl` and `ephem`
     ship prebuilt wheels for it, while the source build still fails on
     everything newer — and it runs once the package directory is put on
     `sys.path`, because `kinqimen.py` says `import config` where it means
     its own module. Re-verified 2026-08-08.

     Its 置閏, used as the reference for this engine's, needed the same
     care: it re-derives the term day by day from the term astronomically
     in force, so it can express neither a sustained 超神 nor a real 接氣,
     and it changes the ju in the middle of a five-day stretch — which no
     account of the method allows, including its own futou-based yuan.
     Agreement over 2018–2027 is exact on the yuan (3 652 of 3 652) and
     two-in-three on the term, everywhere the drift phase makes the two
     readings coincide. The classical structure was instead confirmed
     piecewise: the four 符頭 heads, the anchor at the solstice, and the
     195-day leap each match an independent Japanese source (ktonko.com).

     Runnable is not the same as agreeing: **its 拆補 is a different 拆補.**
     `kinqimen` assigns the yuan from the day's 符頭 — a 己卯 day opens an
     upper yuan wherever it falls in the term — where `qimen-dunjia`, and
     this engine with it, split the term into three five-day thirds from the
     instant it begins. For 2026-09-02 11:00 in Beijing the two return
     陰遁一局上元 and 陰遁七局下元 from the same instant, each internally
     consistent. So the method the two references share by name they do not
     share in fact, and a `zhirun` implementation checked against `kinqimen`
     inherits its futou-based reading of the yuan with it. That is a school
     divergence inside `chaibu` itself, and a second reference —
     fengshui-hacks.com — reads it the same way, which is the two agreeing
     sources this document asks for. It is shipped as `yuan`.

   **The weight of this evidence is not the weight of phase 1's.** An almanac
   encodes published astronomical fact; a Qi Men implementation encodes one
   author's reading of a contested tradition. Agreement with `qimen-dunjia`
   means "consistent with a common implementation", never "verified". It also
   covers only 拆補. 置閏 now has a runnable reference in `kinqimen` — see
   below, and weigh it the same way; 茅山 has no reference at all, and
   shipping it means shipping something unfalsified. Say so at the surface.

   Two known defects in that reference, for whoever uses it: its 局數 table is
   keyed in traditional characters while it reads term names from
   `lunar-javascript`, which emits simplified — so it throws outright on five
   of the 24 terms; and its 八神 uses 勾陳/朱雀 in yang dun against 白虎/玄武
   in yin, which is one convention among several.
2. **Divergence between schools.** Mitigated by the explicit parameters of
   section 3, but only if they exist from day one.
3. **The Zi hour and the day boundary.** It shifts two pillars out of four. It
   deserves its own tests and a visible note in the interface.
4. **Reproducibility.** Pin `tzdata` in `package.json`, version the GeoNames
   snapshot, and store resolved values (coordinates, timezone, options) in the
   chart rather than identifiers alone.
5. **i18n drift.** Cheap to prevent, expensive to repair: catalogs typed against
   a single key union, a parity test in both directions, and a lint rule or
   review habit against string literals in `core`.
6. **AGPL.** Imposed by Swiss Ephemeris, as in the reference. Every new
   dependency must be compatible with it.

The measurements that used to close this section — the cost of the larger
GeoNames dataset — moved to `docs/architecture.md`, because they are a live
reference for a decision nobody has taken yet rather than a record of one.
