# shipan — marks

`shipan` is the identifier, 式盤 is the name, shìpán is the reading — the same
three-part shape every named thing in the engine has.

式盤 is the diviner's board itself: the round heaven turning on the square
earth, and the ancestor the three 式 have in common — 奇門, 六壬 and 太乙 are
counted as «the three 式». The seal carries 式, the first character of the
name, as the queru seal carried 闕.

**This branch is a candidate.** `queru-mark` carries 闕如 and `dunjia-mark`
carries 遁甲.

| file | what it is | use it |
|---|---|---|
| `seal.svg` | 白文 seal: the name cut in white out of a cinnabar field | 64px and up — header, README, social card, print |
| `mark.svg` | 式 in a tighter field, narrower border | below 64px — favicon, app icon |
| `seal-vertical.svg` | 2:3 field, glyph unweighted at native size | print, colophon, anywhere unconstrained |
| `lockup.svg` | seal, wordmark, and the reading | the primary lockup |

**The small mark is a character here, not a device.** 闕 had 18 strokes and
turned to mush below 64px, which is why queru needed an abstract gate; 式 has
six and holds at 24px, and at 32px — what a tab actually uses on a HiDPI
screen — it is crisp. It gets a tighter field and a narrower border than the
seal proper, because at that size every pixel spent on margin is one the
strokes do not get.

`studies/` keeps the rejected drafts from the 闕如 round, including the one that
read as a Christian cross and the one that split the seal in half. The abstract
gate they arrived at was the etymology of 闕 and does not carry over.

## Cutting another name

`make-marks.py` generates every mark from a name, so trying an alternative
costs a command. It needs fontTools and the font (see below); pass `--font` if
that lives elsewhere.

```sh
python3 design/logo/make-marks.py --hanzi 闕如 --seal 闕 --name queru --pinyin quērú
python3 design/logo/make-marks.py --hanzi 遁甲 --name dunjia --pinyin dùnjiǎ --favicon 甲
```

`--seal` cuts fewer characters than the name has, `--favicon` cuts a single one
for the small mark where it holds up at 24px, and several characters read right
to left as seals do unless `--ltr` says otherwise.

**The bitten edges are quiet.** A stone wears at its corners and along an edge
or two, not evenly all the way round: six even nicks read as a decorative
border. A dense character hides that and an open one shows it, which is how the
first cut of them — set against 闕 — turned to noise around 式.

**The field follows the name, and the name decides the shape.** A single 小篆
character runs about 1:1.6 and gets an upright 2:3 companion; two side by side
run wider than tall and get a 3:2 one — 闕 measures 606×966 of ink where 遁甲
measures 1600×992, and a two-character name in a square field stands half as
tall as a one-character name does. The square is what a favicon and a header
need, so it is always written, but it is not always what the name wants. The
header sizes the seal by height and lets the width follow, for the same reason.

## The glyph

`seal.svg`, `seal-vertical.svg` and `lockup.svg` carry 式 in **崇羲篆體**
(Chong Xi Small Seal), the small-seal face built on the 說文解字 by 王心怡,
謝清俊 and 莊德明 at Academia Sinica, 2022 — 11,608 glyphs, released
free of charge to everyone.

**Licence: [CC BY-ND 3.0 TW or later](https://xiaoxue.iis.sinica.edu.tw/chongxi/copyright.htm).**
Commercial use is permitted (重製、散布、傳輸本著作（包括商業性利用）); derivative
works are not (不得修改本著作 / 整體字型禁止被修改); the authors' names must be
carried (應表彰原作者姓名). **This asset is therefore not under the project's
AGPL** — mark it as such wherever the licences are listed.

That ND clause is a design constraint and not just paperwork: the glyph is
placed by **uniform scale and fill colour only**. No stretching, no stroke
weighting, no retouching. Which is why a 1:1.6 character does not fill a square
field and is not made to — `seal-vertical.svg` gives it a 2:3 field instead, and
in the square the cinnabar around it is the composition rather than a gap.

The licence says nothing about extracting outlines into a logo. Embedding one
unmodified glyph is the most defensible reading of it, but if the mark ever
becomes a registered thing, ask Academia Sinica in writing.

**The fallback, if that answer is ever no** covers 闕 only, and would have to be
redone for 式: `studies/seal-shuowen-pd.svg` keeps that character in the 說文 form from
[`File:闕-seal.svg`](https://commons.wikimedia.org/wiki/File:%E9%97%95-seal.svg)
on Wikimedia Commons — **public domain**, no conditions at all. It is flatter
and heavier than 崇羲, and it was the only source available before this font:
no free 繆篆 face exists, and [LxgwSeal](https://github.com/lxgw/LxgwSeal)
(SIL OFL 1.1) is alpha at 239 glyphs and does not contain 闕.

## Colour

Cinnabar `#B4322B` on paper `#FAF7F2`. Both hold on a white page and on a dark
one, and the seal prints without a colour reset.

## currentColor

`lockup.svg` sets its text to `currentColor`, so inlined in the DOM it inherits
the page. Served as `<img>` it has no page to inherit from and falls back to
black — the same bind the drawn board is in, and it takes the same fix: a second
copy with the colours written out.
