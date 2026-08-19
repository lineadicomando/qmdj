# queru — marks

`queru` is the identifier, 闕如 is the name, quērú is the reading — the same
three-part shape every named thing in the engine has.

| file | what it is | use it |
|---|---|---|
| `seal.svg` | 白文 seal: the name cut in white out of a cinnabar field | 64px and up — header, README, social card, print |
| `mark.svg` | abstract gate: lintel and two jambs | below 64px — favicon, app icon, anywhere the glyph turns to mush |
| `seal-vertical.svg` | 2:3 field, glyph unweighted at native size | print, colophon, anywhere unconstrained |
| `lockup.svg` | seal, wordmark, and the reading | the primary lockup |

`studies/` keeps the rejected drafts, including the one that read as a
Christian cross and the one that split the seal in half.

## The glyph

`seal.svg`, `seal-vertical.svg` and `lockup.svg` carry 闕 in **崇羲篆體**
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

**The fallback, if that answer is ever no:** `studies/seal-shuowen-pd.svg` keeps
the same character in the 說文 form from
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
