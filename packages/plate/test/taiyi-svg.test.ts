import { describe, expect, it } from 'vitest';
import { renderTaiyiSvg } from '../src/taiyi-svg.js';
import type { PlateTaiyi, PlateTaiyiGod, PlateTaiyiPalace } from '../src/types.js';

/**
 * A board laid by hand, so this file depends on no engine.
 *
 * It is the board of 開元十二年 — 太乙 in 一宮, which is the north-west, with
 * 太炅 for the lower eye and 太陽 for the upper — because that is the year the
 * text checks itself against, and because it puts 太乙 in a corner where a
 * drawing laid out from the Luoshu would put it in the middle of an edge.
 */

const RING: readonly [string, string, string, string, number | undefined][] = [
  ['地主', 'dizhu', 'dìzhǔ', 'shui', 8],
  ['陽德', 'yangde', 'yángdé', 'tu', undefined],
  ['和德', 'hede', 'hédé', 'tu', 3],
  ['呂申', 'lushen', 'lǚshēn', 'mu', undefined],
  ['高叢', 'gaocong', 'gāocóng', 'mu', 4],
  ['太陽', 'taiyang', 'tàiyáng', 'tu', undefined],
  ['太炅', 'taijiong', 'tàijiǒng', 'mu', 9],
  ['太神', 'taishen', 'tàishén', 'huo', undefined],
  ['大威', 'dawei', 'dàwēi', 'huo', 2],
  ['天道', 'tiandao', 'tiāndào', 'tu', undefined],
  ['大武', 'dawu', 'dàwǔ', 'tu', 7],
  ['武德', 'wude', 'wǔdé', 'jin', undefined],
  ['太蔟', 'taicu', 'tàicù', 'jin', 6],
  ['陰主', 'yinzhu', 'yīnzhǔ', 'tu', undefined],
  ['陰德', 'yinde', 'yīndé', 'jin', 1],
  ['大義', 'dayi', 'dàyì', 'shui', undefined],
];

const GODS: PlateTaiyiGod[] = RING.map(([hanzi, id, pinyin, element, palace]) => ({
  hanzi,
  id,
  pinyin,
  element,
  ...(palace === undefined ? {} : { palace }),
}));

const god = (id: string): PlateTaiyiGod => GODS.find((one) => one.id === id) as PlateTaiyiGod;

const palace = (number: number, hanzi: string, id: string, direction: string): PlateTaiyiPalace => ({
  number,
  hanzi,
  id,
  direction,
});

const BOARD: PlateTaiyi = {
  year: 724,
  sui: { hanzi: '甲子' },
  taiyi: { palace: palace(1, '乾', 'qian', 'nw'), year: 1 },
  wenchang: god('taijiong'),
  shiji: god('taiyang'),
  host: {
    count: 24,
    general: palace(4, '震', 'zhen', 'e'),
    assistant: palace(2, '離', 'li', 's'),
  },
  guest: {
    count: 25,
    general: palace(6, '兌', 'dui', 'w'),
    assistant: palace(8, '坎', 'kan', 'n'),
  },
  gods: GODS,
  patterns: [
    { hanzi: '迫', id: 'po', valence: { hanzi: '凶' }, subject: 'shiji', kind: 'houchen' },
  ],
};

describe('the 太乙 drawing', () => {
  const svg = renderTaiyiSvg(BOARD, {
    labels: {
      god: { taijiong: 'the great blaze', taiyang: 'the great yang' },
      pattern: { po: 'pressing' },
      standing: {
        taiyi: 'the great one',
        hostGeneral: 'the host’s great general',
        hostAssistant: 'the host’s adjutant',
        guestGeneral: 'the guest’s great general',
        guestAssistant: 'the guest’s adjutant',
      },
      wenchang: 'the lower eye',
      shiji: 'the upper eye',
      hostCount: 'the host’s count',
      guestCount: 'the guest’s count',
      palaces: 'one seat from the Luoshu',
    },
    heading: '724 · 甲子',
    readings: 'Said aloud',
  });

  it('draws twenty-five cells: nine palaces and the sixteen around them', () => {
    expect([...svg.matchAll(/class="cell"/g)]).toHaveLength(25);
  });

  it('leaves the middle empty, which is the method and not a gap', () => {
    // 太乙不入中宮. The centre is drawn, labelled 中, and holds nothing else.
    expect(svg).toContain('>中<');
    expect(svg).toContain('>太乙<');
  });

  it('seats every one of the sixteen', () => {
    for (const [hanzi] of RING) expect(svg).toContain(`>${hanzi}<`);
    // The four corner trigrams and the four cardinal branches, which are the
    // seats the eight palaces stand on.
    for (const seat of ['艮', '巽', '坤', '乾', '子', '午', '卯', '酉']) {
      expect(svg).toContain(`>${seat}<`);
    }
  });

  it('writes this board’s numbers and lays nothing out by them', () => {
    // 一 in the north-west and 九 in the south-east, which is where 卷二 puts
    // them and the reverse of where a Luoshu grid would.
    //
    // Taken at the palace number's own size and not at any digit's: the band's
    // keys are digits too, and one of them sits in the corner of every cell on
    // the border. A test that matched on the shape would be reading sixteen
    // indices as though they were palaces.
    const cells = [
      ...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)" font-size="([\d.]+)"[^>]*>([1-9])<\/text>/g),
    ].filter((one) => Number(one[3]) > 20);
    const at = new Map(cells.map((one) => [one[4] as string, [Number(one[1]), Number(one[2])]]));

    const one = at.get('1') as number[];
    const nine = at.get('9') as number[];
    // South is at the top and east is at the left, so the north-west is the
    // bottom right and the south-east is the top left.
    expect(one[0]).toBeGreaterThan(nine[0] as number);
    expect(one[1]).toBeGreaterThan(nine[1] as number);
  });

  it('gives the two parties the same weight and names neither', () => {
    expect(svg).toContain('the host’s count');
    expect(svg).toContain('the guest’s count');
    expect(svg).not.toMatch(/wins|favou?rs|stronger/i);
  });

  it('carries its standing line on its own face', () => {
    expect(svg).toContain('one seat from the Luoshu');
  });

  it('glosses a name in the cell and says it aloud under the grid', () => {
    // The word in the cell, where a reader meets the glyph; the reading in the
    // band, which is a lookup and is laid out as one.
    expect(svg).toContain('>the great blaze<');
    expect(svg).toContain('Said aloud');
    expect(svg).toContain('tàijiǒng');
    expect(svg).toContain('lǚshēn');
  });

  it('glosses what stands in a palace, which used to be bare glyphs', () => {
    // 太乙 and the four generals are the part of this figure that moves from
    // year to year, and they were the one part a reader without Chinese could
    // not read at all.
    expect(svg).toContain('>the great one<');
    // Broken over two lines where it will not go on one, which in a palace is
    // the ordinary case rather than the exception: a square crossed by its own
    // number holds «il gran generale di chi riceve» only in halves.
    expect(svg).toContain('>the host’s<');
    expect(svg).toContain('>great general<');
    expect(svg).toContain('>adjutant<');
  });

  it('keys the border to the band, and sets the band in three columns', () => {
    const rings = [...svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)"[^>]*class="ring"\/>/g)].map(
      (one) => ({ x: Number(one[1]), y: Number(one[2]) }),
    );
    // Sixteen in the grid and sixteen in the band: the same numeral at both
    // ends of one lookup, and nothing keyed that is not in the list.
    expect(rings).toHaveLength(32);

    // The band is under the grid, so the sixteen deepest are its own. They
    // stand at three left edges, which is what a columned band is.
    const ordered = [...rings].sort((a, b) => a.y - b.y);
    expect(new Set(ordered.slice(16).map((one) => one.x)).size).toBe(3);
    // The border's sixteen stand at five, one to each column of the grid.
    expect(new Set(ordered.slice(0, 16).map((one) => one.x)).size).toBe(5);
  });

  it('tints every cell by its phase and leaves the middle the colour of the paper', () => {
    // The sixteen of the border and the eight palaces: twenty-four tinted
    // cells, and the twenty-fifth is the middle, which stands on no seat and
    // so takes no phase.
    expect([...svg.matchAll(/fill="var\(--qmdj-element-\w+\)"/g)]).toHaveLength(24);
    expect([...svg.matchAll(/fill="var\(--qmdj-ground\)" class="cell"/g)]).toHaveLength(1);
    // A palace and the border cell it touches are the same colour, because
    // both take the element of the seat: 地主 at 子 is water and so is the
    // north palace it stands at, and 大義 at 亥 is the third of the three.
    expect([...svg.matchAll(/fill="var\(--qmdj-element-shui\)"/g)]).toHaveLength(3);
  });

  it('is well formed and sized from its content', () => {
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
    const viewBox = /viewBox="0 0 (\d+) ([\d.]+)"/.exec(svg) as RegExpExecArray;
    expect(Number(viewBox[2])).toBeGreaterThan(Number(viewBox[1]));
  });
});
