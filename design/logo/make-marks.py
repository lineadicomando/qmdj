#!/usr/bin/env python3
"""Cut a name into a seal.

Generates the marks for a candidate project name from a seal-script font,
so that trying another name costs a command rather than an afternoon.

    python3 design/logo/make-marks.py \
        --hanzi 闕如 --seal 闕 --name queru --pinyin quērú

The font is not in this repository: it is 崇羲篆體 by Academia Sinica under
CC BY-ND 3.0 TW, which forbids derivative works. That is why every glyph here
is placed by uniform scale and fill colour alone — no stretching, no stroke
weighting, no retouching — and why the outline is embedded rather than the
face redistributed. Pass --font if it lives somewhere else.

Needs fontTools:  python3 -m venv .venv && .venv/bin/pip install fonttools
"""

import argparse
import pathlib

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

CINNABAR = '#B4322B'
PAPER = '#FAF7F2'

# The bites a worn stone loses.
#
# Fewer and smaller than the first cut of them, because a seal is worn at its
# corners and along an edge or two, not all the way round: six even nicks read
# as a decorative border, and a dense character hides that while an open one
# shows it. Never circular — a circle is a hole punched in the field, not wear.
BITES = """  <mask id="bite">
    <rect width="256" height="256" fill="#fff"/>
    <path d="M16 16 L27 16 L20 20 L16 24 Z" fill="#000"/>
    <path d="M240 240 L240 229 L233 234 L227 240 Z" fill="#000"/>
    <path d="M16 154 L20 158 L17 166 L21 173 L16 178 Z" fill="#000"/>
    <path d="M176 16 L182 20 L193 17 L200 21 L205 16 Z" fill="#000"/>
    <rect x="237" y="104" width="3" height="26" fill="#000"/>
    <rect x="118" y="237" width="24" height="3" fill="#000"/>
  </mask>"""


def compose(font: TTFont, text: str, rtl: bool) -> tuple[str, tuple[float, ...]]:
    """Lay the characters out in a row and return their paths and ink bounds.

    Characters are advanced by the font's own metrics, so their sizes stay in
    the relation the type designer set. The ink bounds — not the em boxes —
    become the viewBox, so the seal is packed against the glyphs themselves
    and not against the whitespace the face reserves around them.

    A seal with more than one character reads right to left, as seals do.
    """
    glyphs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font['hmtx']
    order = reversed(text) if rtl else iter(text)

    parts, bounds, pen_x = [], [], 0.0
    for ch in order:
        if ord(ch) not in cmap:
            raise SystemExit(f"the font has no glyph for {ch} (U+{ord(ch):04X})")
        name = cmap[ord(ch)]
        svg_pen = SVGPathPen(glyphs)
        glyphs[name].draw(svg_pen)
        box_pen = BoundsPen(glyphs)
        glyphs[name].draw(box_pen)
        if box_pen.bounds:
            x0, y0, x1, y1 = box_pen.bounds
            bounds.append((x0 + pen_x, y0, x1 + pen_x, y1))
        parts.append(f'<g transform="translate({pen_x:.1f},0)">'
                     f'<path d="{svg_pen.getCommands()}"/></g>')
        pen_x += hmtx[name][0]

    x0 = min(b[0] for b in bounds); x1 = max(b[2] for b in bounds)
    y0 = min(b[1] for b in bounds); y1 = max(b[3] for b in bounds)
    # SVG's y runs down and the font's runs up, so the group is flipped and
    # the box flips with it.
    return ''.join(parts), (x0, -y1, x1 - x0, y1 - y0)


def block(vb: tuple[float, ...], paths: str, x: float, y: float,
          w: float, h: float, fill: str) -> str:
    box = ' '.join(f'{v:.2f}' for v in vb)
    return (f'  <svg x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" '
            f'viewBox="{box}" preserveAspectRatio="xMidYMid meet">\n'
            f'    <g transform="scale(1,-1)" fill="{fill}">{paths}</g>\n  </svg>')


def seal(vb, paths, credit, side=256, margin=16, fill=0.87) -> str:
    """A square 白文 seal: the name cut in white out of a cinnabar field.

    The glyphs keep their own proportions and the field is not asked to be
    filled: a single 小篆 character is about 1:1.6 and cannot fill a square
    unaided, so the cinnabar around it composes instead. Two characters side
    by side come out wider than tall, and there the width is what binds.
    """
    aspect = vb[3] / vb[2]
    field = side - 2 * margin
    h = field * fill
    w = h / aspect
    if w > field * 0.9:
        w = field * 0.9
        h = w * aspect
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side} {side}" '
            f'width="{side}" height="{side}">\n'
            f'  <title>{credit["title"]}</title>\n  <desc>{credit["desc"]}</desc>\n'
            f'{BITES}\n'
            f'  <g mask="url(#bite)"><rect x="{margin}" y="{margin}" '
            f'width="{side - 2 * margin}" height="{side - 2 * margin}" fill="{CINNABAR}"/></g>\n'
            f'{block(vb, paths, (side - w) / 2, (side - h) / 2, w, h, PAPER)}\n</svg>\n')


def oblong(vb, paths, credit, w=200, h=300, margin=12) -> str:
    """A field cut to the name rather than the other way round.

    One character wants 2:3 upright; two side by side want 3:2 across. The
    square is what a favicon and a header need, not what a 小篆 name is, so
    where the two disagree this is the shape that does not compromise.
    """
    aspect = vb[3] / vb[2]
    gh = (h - 2 * margin) * 0.92
    gw = gh / aspect
    if gw > (w - 2 * margin) * 0.92:
        gw = (w - 2 * margin) * 0.92
        gh = gw * aspect
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}">\n'
            f'  <title>{credit["title"]} — vertical</title>\n  <desc>{credit["desc"]}</desc>\n'
            f'{BITES.replace("width=\"256\" height=\"256\"", f"width=\"{w}\" height=\"{h}\"")}\n'
            f'  <g><rect x="{margin}" y="{margin}" width="{w - 2 * margin}" '
            f'height="{h - 2 * margin}" fill="{CINNABAR}"/></g>\n'
            f'{block(vb, paths, (w - gw) / 2, (h - gh) / 2, gw, gh, PAPER)}\n</svg>\n')


def lockup(vb, paths, credit, name, hanzi, pinyin) -> str:
    """Seal, wordmark and reading. The text inherits the page's colour."""
    aspect = vb[3] / vb[2]
    h = min(196.0, 224 * 0.87); w = h / aspect
    if w > 200: w, h = 200, 200 * aspect
    inner = block(vb, paths, (256 - w) / 2, (256 - h) / 2, w, h, PAPER)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 180" '
            f'width="620" height="180">\n'
            f'  <title>{name} {hanzi} {pinyin} — lockup</title>\n'
            f'  <desc>{credit["desc"]}</desc>\n'
            f'  <g transform="translate(20,10) scale(0.625)">\n{BITES}\n'
            f'    <g mask="url(#bite)"><rect x="16" y="16" width="224" height="224" '
            f'fill="{CINNABAR}"/></g>\n{inner}\n  </g>\n'
            f'  <text x="200" y="88" font-family="Noto Serif CJK TC, Georgia, serif" '
            f'font-size="62" fill="currentColor">{name}</text>\n'
            f'  <text x="202" y="126" font-family="Noto Serif CJK TC, Georgia, serif" '
            f'font-size="27" fill="currentColor" opacity="0.62">{hanzi} · {pinyin}</text>\n'
            f'</svg>\n')


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--hanzi', required=True, help='the name in characters, e.g. 闕如')
    p.add_argument('--name', required=True, help='the identifier, e.g. queru')
    p.add_argument('--pinyin', required=True, help='the reading with tones, e.g. quērú')
    p.add_argument('--seal', help='characters to cut, if fewer than --hanzi (default: all)')
    p.add_argument('--favicon', help='a single character for the small mark, if it '
                                     'holds up at 24px; otherwise leave mark.svg alone')
    p.add_argument('--font', default=str(pathlib.Path.home() / 'Scaricati/chongxi_seal.otf'))
    p.add_argument('--out', default=str(pathlib.Path(__file__).parent))
    p.add_argument('--ltr', action='store_true',
                   help='lay several characters left to right; seals read right to left')
    a = p.parse_args()

    font = TTFont(a.font)
    cut = a.seal or a.hanzi
    credit = {
        'title': f'{a.name} {a.hanzi} — 白文 seal',
        'desc': (f'{cut} in 崇羲篆體 (Chong Xi Small Seal) by Academia Sinica, '
                 'CC BY-ND 3.0 TW. Glyph unmodified: uniform scale only.'),
    }
    paths, vb = compose(font, cut, rtl=not a.ltr and len(cut) > 1)

    out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    (out / 'seal.svg').write_text(seal(vb, paths, credit))
    # Upright for a single character, across for a name that runs wide.
    wide = vb[3] < vb[2]
    second = 'seal-wide.svg' if wide else 'seal-vertical.svg'
    (out / second).write_text(
        oblong(vb, paths, credit, *((300, 200) if wide else (200, 300))))
    (out / 'lockup.svg').write_text(lockup(vb, paths, credit, a.name, a.hanzi, a.pinyin))
    written = ['seal.svg', second, 'lockup.svg']

    if a.favicon:
        fpaths, fvb = compose(font, a.favicon, rtl=False)
        fcredit = dict(credit, title=f'{a.name} {a.favicon} — small mark')
        # A tighter field and a narrower border than the seal proper. At 24px
        # every pixel spent on margin is a pixel the strokes do not get, and
        # the bitten edges stop reading as wear long before that size anyway.
        (out / 'mark.svg').write_text(seal(fvb, fpaths, fcredit, margin=8, fill=0.94))
        written.append('mark.svg')

    print(f"{a.name} {a.hanzi} {a.pinyin} — cut {cut}, ink {vb[2]:.0f}x{vb[3]:.0f}"
          f"{' right to left' if not a.ltr and len(cut) > 1 else ''}")
    for f in written:
        print(f"  {out / f}")


if __name__ == '__main__':
    main()
