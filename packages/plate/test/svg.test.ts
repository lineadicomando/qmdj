import { describe, expect, it } from 'vitest';
import { WRITTEN_ORDER, cells, layout } from '../src/geometry.js';
import { STRENGTH_MARKS, renderChartSvg } from '../src/svg.js';
import type { PlateChart } from '../src/types.js';

/** A stem *is* a phase, and a real `Stem` says which. So does the fixture. */
const STEM_ELEMENT: Record<string, string> = {
  jia: 'mu', yi: 'mu',
  bing: 'huo', ding: 'huo',
  wu: 'tu', ji: 'tu',
  geng: 'jin', xin: 'jin',
  ren: 'shui', gui: 'shui',
};

/**
 * A chart built by hand rather than computed: this package draws what it is
 * handed and must be testable without the engine anywhere near it.
 */
const CHART: PlateChart = {
  ju: { yang: true, number: 9 },
  chief: { star: { hanzi: '天蓬' }, palace: { number: 5 } },
  chiefGate: { gate: { hanzi: '休門' }, palace: { number: 1 } },
  moment: {
    local: '2024-06-15T14:00:00+08:00',
    pillars: {
      year: { hanzi: '甲辰' },
      month: { hanzi: '庚午' },
      day: { hanzi: '庚戌' },
      hour: { hanzi: '癸未' },
    },
  },
  patterns: [
    { id: 'kongwang', hanzi: '空亡', valence: { id: 'jixiong', hanzi: '吉凶' }, palace: 2 },
    { id: 'kongwang', hanzi: '空亡', valence: { id: 'jixiong', hanzi: '吉凶' }, palace: 7 },
    { id: 'jixing', hanzi: '擊刑', valence: { id: 'xiong', hanzi: '凶' }, palace: 4 },
    { id: 'fuyin', hanzi: '伏吟', valence: { id: 'xiong', hanzi: '凶' }, layer: 'gate' },
  ],
  palaces: [
    cell(1, 'kan', '坎', 'shui', 'ji', '己', 'ren', '壬', 'tianfu', '天輔', 'xiu', '休', 'xiumen', '休門', 'qiu', '囚', 'liuhe', '六合'),
    cell(2, 'kun', '坤', 'tu', 'geng', '庚', 'ji', '己', 'tianpeng', '天蓬', 'qiu', '囚', 'simen', '死門', 'xiang', '相', 'zhifu', '值符'),
    cell(3, 'zhen', '震', 'mu', 'xin', '辛', 'geng', '庚', 'tianrui', '天芮', 'xiang', '相', 'shangmen', '傷門', 'xiu', '休', 'zhuque', '朱雀'),
    cell(4, 'xun', '巽', 'mu', 'ren', '壬', 'bing', '丙', 'tianzhu', '天柱', 'si', '死', 'dumen', '杜門', 'xiu', '休', 'jiudi', '九地'),
    {
      ...cell(5, 'zhong', '中', 'tu', 'gui', '癸', 'gui', '癸', 'tianqin', '天禽', 'xiang', '相', '', '', '', '', '', ''),
      gate: undefined,
      gateStrength: undefined,
      spirit: undefined,
    },
    cell(6, 'qian', '乾', 'jin', 'ding', '丁', 'xin', '辛', 'tianchong', '天沖', 'xiu', '休', 'kaimen', '開門', 'si', '死', 'taiyin', '太陰'),
    cell(7, 'dui', '兌', 'jin', 'bing', '丙', 'yi', '乙', 'tianren', '天任', 'xiang', '相', 'jing1men', '驚門', 'si', '死', 'tengshe', '螣蛇'),
    cell(8, 'gen', '艮', 'tu', 'yi', '乙', 'wu', '戊', 'tianying', '天英', 'wang', '旺', 'shengmen', '生門', 'xiang', '相', 'gouchen', '勾陳'),
    cell(9, 'li', '離', 'huo', 'wu', '戊', 'ding', '丁', 'tianxin', '天心', 'si', '死', 'jing3men', '景門', 'wang', '旺', 'jiutian', '九天'),
  ],
};

/** Everything on a plate carries both a name and the identifier to look it up by. */
function cell(
  number: number,
  palaceId: string,
  hanzi: string,
  element: string,
  earthId: string,
  earth: string,
  heavenId: string,
  heaven: string,
  starId: string,
  star: string,
  starStrengthId: string,
  starStrength: string,
  gateId: string,
  gate: string,
  gateStrengthId: string,
  gateStrength: string,
  spiritId: string,
  spirit: string,
) {
  return {
    palace: { number, hanzi, id: palaceId, element },
    earth: { hanzi: earth, id: earthId, element: STEM_ELEMENT[earthId] },
    heaven: { hanzi: heaven, id: heavenId, element: STEM_ELEMENT[heavenId] },
    star: { hanzi: star, id: starId },
    starStrength: { hanzi: starStrength, id: starStrengthId },
    gate: { hanzi: gate, id: gateId },
    gateStrength: { hanzi: gateStrength, id: gateStrengthId },
    spirit: { hanzi: spirit, id: spiritId },
  };
}

describe('the board', () => {
  it('puts south at the top', () => {
    // A Qi Men chart is drawn as a Chinese map is. Turning it the European
    // way round would make it unreadable to anyone who knows the subject.
    expect(WRITTEN_ORDER.slice(0, 3)).toEqual([4, 9, 2]);
    expect(WRITTEN_ORDER[1]).toBe(9); // Li, the south, top middle
    expect(WRITTEN_ORDER[7]).toBe(1); // Kan, the north, bottom middle
    expect(WRITTEN_ORDER[4]).toBe(5); // the centre, in the centre
  });

  it('lays nine cells in three rows of three', () => {
    const grid = cells();

    expect(grid).toHaveLength(9);
    expect(new Set(grid.map((c) => c.palace)).size).toBe(9);
    expect(grid.filter((c) => c.row === 0)).toHaveLength(3);
    expect(grid.filter((c) => c.column === 2)).toHaveLength(3);
  });
});

describe('renderChartSvg', () => {
  it('produces a square SVG, until it is given a list to carry', () => {
    const svg = renderChartSvg(CHART, { size: 500 });

    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
    expect(svg).toContain('viewBox="0 0 500 500"');

    // The band is written on paper the square grew, so the width is still the
    // number it was given and the height is the one that moved.
    const listed = renderChartSvg(CHART, {
      size: 500,
      captions: { configurations: 'Configurations' },
    });
    const box = /viewBox="0 0 (\d+) ([\d.]+)"/.exec(listed);

    expect(Number(box?.[1])).toBe(500);
    expect(Number(box?.[2])).toBeGreaterThan(500);
  });

  it('carries every glyph of the chart', () => {
    const svg = renderChartSvg(CHART);

    for (const palace of CHART.palaces) {
      expect(svg).toContain(palace.earth.hanzi);
      expect(svg).toContain(palace.heaven.hanzi);
      expect(svg).toContain(palace.star.hanzi);
    }
    expect(svg).toContain('休門');
    expect(svg).toContain('值符');
  });

  it('marks the palaces a configuration fell in', () => {
    const svg = renderChartSvg(CHART);

    expect(svg).toContain('空亡');
    expect(svg).toContain('擊刑');
    // A configuration belonging to the whole board has no palace to mark, and
    // without the band asked for below it goes unmentioned — which is the
    // reason the band exists.
    expect(svg).not.toContain('伏吟');
  });

  it('writes the word under the name it renders, never instead of it', () => {
    const worded = renderChartSvg(CHART, {
      labels: {
        palace: { kan: 'north' },
        gate: { xiumen: 'Rest' },
        star: { tianfu: 'Assistant' },
        stem: { ji: 'Yin Earth', ren: 'Yang Water' },
      },
    });

    expect(worded).toContain('Rest');
    expect(worded).toContain('Yin Earth');
    // 休門 is not the Chinese for "Rest": it is what the gate is called, and
    // it stays on the board whatever language the reader is given. It leads,
    // set large, and the word sits under it — same column, smaller, quieter.
    //
    // Quieter is `word` and no longer `faint`, which is the register the small
    // hanzi and the corner number kept. For a reader with no Chinese this line
    // is the content, and it is held at 7:1 rather than at the 4.6:1 that
    // suits something merely glossing what is already legible.
    const gate = /<text x="([\d.]+)" y="([\d.]+)" font-size="([\d.]+)"[^>]*>休門/.exec(worded);
    const word = /<text x="([\d.]+)" y="([\d.]+)" class="word" font-size="([\d.]+)"[^>]*>Rest/.exec(
      worded,
    );

    expect(gate).not.toBeNull();
    expect(word).not.toBeNull();
    expect(word?.[1]).toBe(gate?.[1]);
    expect(Number(word?.[2])).toBeGreaterThan(Number(gate?.[2]));
    expect(Number(word?.[3])).toBeLessThan(Number(gate?.[3]));
    // What it was not given a word for stands as its name alone.
    expect(worded).toContain('值符');
  });

  it('hangs the state of a star and of a gate off the word line, as the ramp it publishes', () => {
    const svg = renderChartSvg(CHART, {
      labels: { star: { tianying: 'Hero' }, gate: { shengmen: 'Life' } },
    });

    // 天英 stands in 旺 in the fixture and 生門 in 相. The mark rides at the
    // end of the line under the name — it qualifies what is above it and is
    // not a seventh thing standing in the palace.
    expect(svg).toContain(`>Hero ${STRENGTH_MARKS.wang}</text>`);
    expect(svg).toContain(`>Life ${STRENGTH_MARKS.xiang}</text>`);
    // A surface glosses the ramp in words, and this is where it reads it
    // from: a mark changed here without the legend following would be a
    // shape nothing on the page explains.
    expect(Object.keys(STRENGTH_MARKS)).toEqual(['wang', 'xiang', 'xiu', 'qiu', 'si']);
  });

  it('lays a palace out in two columns, the plates apart from what stands over them', () => {
    // One palace on the board, so that a glyph standing in two of them
    // cannot be mistaken for the one being measured.
    const alone = CHART.palaces.find((each) => each.palace.number === 6);
    const svg = renderChartSvg({ ...CHART, palaces: [alone as (typeof CHART.palaces)[number]] });
    const place = (hanzi: string): { x: number; y: number } => {
      const found = new RegExp(`<text x="([\\d.]+)" y="([\\d.]+)"[^>]*>(<tspan[^>]*>)?${hanzi}`).exec(svg);
      return { x: Number(found?.[1]), y: Number(found?.[2]) };
    };

    // 丁 on the earth plate, 辛 on the heaven plate, 天沖 the star, 開門 the
    // gate. The two plates share a column, heaven above earth; the star and
    // the gate share the other; every palace puts them in the same place.
    expect(place('丁').x).toBe(place('辛').x);
    expect(place('辛').y).toBeLessThan(place('丁').y);
    expect(place('天沖').x).toBe(place('開門').x);
    expect(place('丁').x).toBeLessThan(place('天沖').x);
    // The trigram closes the plates' column rather than starting a third.
    expect(place('乾').x).toBe(place('丁').x);
  });

  it('writes a stem in the colour of its phase, and everything else in ink', () => {
    const svg = renderChartSvg(CHART, { size: 900 });
    const sheet = svg.slice(0, svg.indexOf('</style>'));

    // The relation between the two stems standing in a palace is the first
    // thing read off a chart, and in one colour it has to be looked up twice.
    expect(svg).toContain('<tspan class="huo">丁</tspan>');
    expect(svg).toContain('<tspan class="shui">壬</tspan>');
    expect(sheet).toContain('--qmdj-ink-huo');
    // A star has a phase only by way of the palace it rests in, so it is not
    // given one here: five colours is a vocabulary, twelve is a decoration.
    expect(svg).toMatch(/<text[^>]*>天沖/);
  });

  it('wraps a word too long for its column instead of shrinking it', () => {
    const size = (svg: string, word: string): number =>
      Number(new RegExp(`<text x="[\\d.]+" y="[\\d.]+" class="word" font-size="([\\d.]+)"[^>]*>${word}<`).exec(svg)?.[1]);
    const svg = renderChartSvg(CHART, {
      size: 900,
      labels: { spirit: { liuhe: 'Assemblea', zhifu: 'Guerriero Oscuro' } },
    });

    // That each of the three was found at all, before anything is compared
    // about them. A regex that matches nothing yields `NaN`, and `NaN` is
    // `Object.is`-equal to `NaN` — so the two assertions below went on holding
    // after the class this looks for had been renamed out from under them.
    for (const word of ['Guerriero', 'Oscuro', 'Assemblea']) {
      expect(size(svg, word)).not.toBeNaN();
    }

    // Both halves are set at the size a word that fitted would have been:
    // a column half a palace wide holds neither on one line, and shrinking
    // to fit would leave one palace legible and its neighbour not.
    expect(size(svg, 'Guerriero')).toBe(size(svg, 'Assemblea'));
    expect(size(svg, 'Oscuro')).toBe(size(svg, 'Assemblea'));
  });

  it('falls back to the glyphs for anything unnamed', () => {
    // A caller that hands it nothing gets what it drew before there was any
    // way to ask for anything else.
    expect(renderChartSvg(CHART)).toContain('休門');
  });

  it('is locale-independent without captions', () => {
    const svg = renderChartSvg(CHART);

    // Nothing but hanzi, digits and the machinery. No word in any language.
    expect(svg).not.toMatch(/>[A-Za-z ]{4,}</);
  });

  it('adds captions only when given them, already translated', () => {
    const bare = renderChartSvg(CHART);
    const captioned = renderChartSvg(CHART, {
      captions: { ju: 'yang dun 9', chief: 'chief', note: 'not an interpretation' },
    });

    expect(bare).not.toContain('yang dun 9');
    expect(captioned).toContain('yang dun 9');
    expect(captioned).toContain('not an interpretation');
    // The pillars ride along with the caption line.
    expect(captioned).toContain('甲辰');
  });

  it('numbers a palace from its corner, and says so on the line', () => {
    const svg = renderChartSvg(CHART, { size: 900, labels: { palace: { qian: 'northwest' } } });
    const sheet = svg.slice(0, svg.indexOf('</style>'));

    // The Luoshu number alone. The word for the palace is not up here: it
    // belongs under the trigram, which is the thing it glosses.
    expect(svg).toMatch(/<text[^>]*text-anchor="start"[^>]*>6</);
    expect(svg).not.toMatch(/text-anchor="start"[^>]*>6\s?northwest/);
    // And nothing in the sheet may anchor anything: a declaration outranks a
    // presentation attribute, so a rule here would centre the number on the
    // corner it starts from and hang half of it in the palace next door.
    expect(sheet).not.toContain('text-anchor');
  });

  it('shrinks a word no split can fit in its column', () => {
    const size = (svg: string, word: string): number =>
      Number(new RegExp(`font-size="([\\d.]+)"[^>]*>${word}<`).exec(svg)?.[1]);
    const svg = renderChartSvg(CHART, {
      size: 900,
      labels: { palace: { qian: 'nw', kan: 'northwestbywestandalittlefurther' } },
    });

    // Wrapping is the first answer and this is the second: one word with
    // nowhere to break comes down in size rather than crossing into the
    // palace next door.
    expect(size(svg, 'northwestbywestandalittlefurther')).toBeLessThan(size(svg, 'nw'));
  });

  it('holds two captions apart with a mark, not with spaces', () => {
    const svg = renderChartSvg(CHART, {
      captions: { chief: 'chief Canopy 天蓬', chiefGate: 'chief gate Rest 休門' },
    });

    // SVG collapses a run of spaces, and the two halves would arrive touching.
    expect(svg).toContain('chief Canopy 天蓬 — chief gate Rest 休門');
  });

  it('carries both colour schemes by default', () => {
    const auto = renderChartSvg(CHART);

    // A drawing dropped into a page nobody controls has to survive the night.
    expect(auto).toContain('prefers-color-scheme: dark');
  });

  it('resolves to one scheme when asked', () => {
    const dark = renderChartSvg(CHART, { scheme: 'dark' });

    expect(dark).not.toContain('prefers-color-scheme');
    expect(dark).toContain('--qmdj-ink');
  });

  it('describes itself for a reader who cannot see it', () => {
    const svg = renderChartSvg(CHART);

    expect(svg).toContain('role="img"');
    expect(svg).toMatch(/aria-label="陽遁9局/);
  });

  it('escapes what it writes', () => {
    const hostile: PlateChart = {
      ...CHART,
      moment: { ...CHART.moment, pillars: { ...CHART.moment.pillars, year: { hanzi: '<&">' } } },
    };
    const svg = renderChartSvg(hostile, { captions: { ju: '<script>' } });

    expect(svg).toContain('&lt;script&gt;');
    expect(svg).not.toContain('<script>');
  });

  it('scales everything from one number', () => {
    const small = renderChartSvg(CHART, { size: 320 });
    const large = renderChartSvg(CHART, { size: 1280 });

    expect(small).toContain('width="320"');
    expect(large).toContain('width="1280"');
    // Same content, different measurements.
    expect(small.match(/<text/g)?.length).toBe(large.match(/<text/g)?.length);
  });
});

describe('the compass', () => {
  const WORDS = { n: 'N', ne: 'NE', e: 'E', se: 'SE', s: 'S', sw: 'SW', w: 'W', nw: 'NW' };

  /** Where a line was written, whatever it was written in. */
  const place = (svg: string, content: string): { x: number; y: number } => {
    const found = new RegExp(`<text x="([\\d.]+)" y="([\\d.]+)"[^>]*>${content}<`).exec(svg);
    return { x: Number(found?.[1]), y: Number(found?.[2]) };
  };

  it('is drawn only when the words are given', () => {
    // 子 is nowhere else on the board: no palace holds it and no pillar of
    // the fixture names it.
    expect(renderChartSvg(CHART)).not.toContain('子');
    expect(renderChartSvg(CHART, { compass: WORDS })).toContain('子');
    expect(renderChartSvg(CHART, { compass: WORDS })).toContain('>NE<');
  });

  it('stands each branch over the palace whose quarter of the sky it falls in', () => {
    const svg = renderChartSvg(CHART, { size: 900, compass: WORDS });
    const grid = layout(900, { compass: true });
    const column = (index: number): number => grid.margin + grid.cell * (index + 0.5);

    // 午 is due south and the south is at the top, so it stands over the
    // middle of the top row and above the grid; 子 is due north and stands
    // under the middle of the bottom row.
    expect(place(svg, '午').x).toBeCloseTo(column(1), 1);
    expect(place(svg, '午').y).toBeLessThan(grid.margin);
    expect(place(svg, '子').x).toBeCloseTo(column(1), 1);
    expect(place(svg, '子').y).toBeGreaterThan(grid.margin + grid.cell * 3);

    // 卯 is due east, which is on the left, and 酉 due west. Across the side
    // it is the middle row, not a point: a baseline sits below the centre of
    // the line it carries.
    expect(place(svg, '卯').y).toBeGreaterThan(grid.margin + grid.cell);
    expect(place(svg, '卯').y).toBeLessThan(grid.margin + grid.cell * 2);
    expect(place(svg, '卯').x).toBeLessThan(grid.margin);
    expect(place(svg, '酉').x).toBeGreaterThan(grid.margin + grid.cell * 3);

    // And the eight that are not cardinal fall either side of them: 巳 in the
    // southeast, over the same column as the palace of Xun.
    expect(place(svg, '巳').x).toBeCloseTo(column(0), 1);
    expect(place(svg, '未').x).toBeCloseTo(column(2), 1);
  });

  it('writes the direction outside the branch, and the corners on the diagonal', () => {
    const svg = renderChartSvg(CHART, { size: 900, compass: WORDS });
    const grid = layout(900, { compass: true });

    // The word for the direction stands further from the grid than the
    // branch it names, so the two rings read as two rings.
    expect(place(svg, 'S').y).toBeLessThan(place(svg, '午').y);
    expect(place(svg, 'N').y).toBeGreaterThan(place(svg, '子').y);
    expect(place(svg, 'E').x).toBeLessThan(place(svg, '卯').x);
    expect(place(svg, 'W').x).toBeGreaterThan(place(svg, '酉').x);

    // A corner holds no branch, and the word for it sits outside the grid on
    // both axes at once. Southeast is the top left, because south is up.
    expect(place(svg, 'SE').x).toBeLessThan(grid.margin);
    expect(place(svg, 'SE').y).toBeLessThan(grid.margin);
    expect(place(svg, 'NW').x).toBeGreaterThan(grid.margin + grid.cell * 3);
    expect(place(svg, 'NW').y).toBeGreaterThan(grid.margin + grid.cell * 3);
  });

  it('takes its band out of the grid and leaves the captions where they were', () => {
    const bare = layout(900, { captions: true });
    const framed = layout(900, { captions: true, compass: true });

    // The drawing does not grow, so the palaces come down by the width of
    // the band. What the reader gains is a frame; what it costs is this.
    expect(framed.cell).toBeLessThan(bare.cell);
    expect(framed.margin - framed.compass.band).toBeCloseTo(bare.margin, 6);

    // And the lines around the grid stay against the paper's edge rather
    // than riding out with the margin: the foot would land on the frame.
    const foot = (svg: string): number => place(svg, 'chief Canopy').y;
    const captions = { chief: 'chief Canopy' };
    expect(foot(renderChartSvg(CHART, { size: 900, captions }))).toBeCloseTo(
      foot(renderChartSvg(CHART, { size: 900, captions, compass: WORDS })),
      6,
    );
  });

  it('draws the branches alone when it is given no words', () => {
    // A compass in Chinese, which is a legitimate thing to want and the only
    // way the drawing stays free of any language.
    const svg = renderChartSvg(CHART, { compass: {} });

    expect(svg).toContain('子');
    expect(svg).not.toMatch(/>[A-Za-z ]{1,3}</);
  });
});

describe('the band of configurations', () => {
  const LABELS = {
    palace: { kun: 'southwest', dui: 'west', xun: 'southeast' },
    pattern: { kongwang: 'void', jixing: 'instrument struck', fuyin: 'the board come home' },
    valence: { xiong: 'inauspicious', jixiong: 'auspicious and inauspicious' },
    layer: { gate: 'the gates' },
  };
  const BAND = { captions: { configurations: 'Configurations' }, labels: LABELS };

  it('is drawn only when it is given a heading', () => {
    expect(renderChartSvg(CHART, { labels: LABELS })).not.toContain('伏吟');
    expect(renderChartSvg(CHART, BAND)).toContain('伏吟');
  });

  it('says what a palace has no room to say', () => {
    const svg = renderChartSvg(CHART, BAND);

    // The fortune, in a word and in the name of it — the reason the band
    // exists rather than a glyph appended in the palace, where the word would
    // not fit and the glyph would stand without a gloss.
    expect(svg).toContain('inauspicious');
    expect(svg).toContain('凶');
    expect(svg).toContain('auspicious and inauspicious');
    expect(svg).toContain('吉凶');
  });

  it('reaches the configurations that belong to the whole board', () => {
    // 伏吟 has no palace, so until there was a band the drawing never named
    // it at all. It is placed by the layer it came home on instead.
    const svg = renderChartSvg(CHART, BAND);

    expect(svg).toContain('the board come home');
    expect(svg).toContain('the gates');
  });

  it('lists a configuration once, with every palace it fell in', () => {
    const svg = renderChartSvg(CHART, BAND);
    const lines = svg.match(/void/g) ?? [];

    // Twice in the whole drawing: the foot of palace 2 and the foot of palace
    // 7 each carry the mark, and the band carries one entry naming both.
    expect(lines).toHaveLength(3);
    expect(svg).toContain('2 southwest, 7 west');
  });

  it('keeps the engine’s order and does not sort by fortune', () => {
    const svg = renderChartSvg(CHART, BAND);
    const band = svg.slice(svg.indexOf('Configurations'));

    expect(band.indexOf('void')).toBeLessThan(band.indexOf('instrument struck'));
    expect(band.indexOf('instrument struck')).toBeLessThan(band.indexOf('the board come home'));
  });

  it('costs the paper its own height, and nothing when it carries nothing', () => {
    const bare = layout(900, { captions: true });
    const two = layout(900, { captions: true, configurations: 2 });
    const six = layout(900, { captions: true, configurations: 6 });

    expect(bare.height).toBe(900);
    expect(layout(900, { captions: true, configurations: 0 }).height).toBe(bare.height);
    expect(two.height).toBeGreaterThan(bare.height);
    expect(six.height).toBeGreaterThan(two.height);
    // Exactly what it needs and not a fraction more.
    expect(six.height - 900).toBeCloseTo(six.foot.band, 6);
  });

  it('leaves the board the same size however long the list is', () => {
    // The regression this exists for: the band used to come out of the grid,
    // and the grid is square — so a list one line longer shrank the palaces in
    // both directions. Stepping the hour resized the board under the reader
    // with the window untouched, by a third of its side across the range of
    // configuration counts a real year of charts produces.
    const sizes = [0, 1, 2, 3, 5, 6, 9].map(
      (configurations) => layout(900, { captions: true, compass: true, configurations }).cell,
    );

    for (const cell of sizes) expect(cell).toBeCloseTo(sizes[0] as number, 6);

    // And it is centred across the paper, which follows from the grid taking
    // the whole square rather than being anything this has to arrange.
    const geometry = layout(900, { captions: true, compass: true, configurations: 6 });
    expect(geometry.margin * 2 + geometry.cell * 3).toBeCloseTo(900, 6);
  });

  it('leaves the band clear of the grid above it and the captions below', () => {
    const svg = renderChartSvg(CHART, {
      size: 900,
      captions: { configurations: 'Configurations', chief: 'chief Canopy' },
      labels: LABELS,
    });
    const geometry = layout(900, { captions: true, configurations: 3 });
    // Measured inside the band: "void" is written in the foot of palace 2 as
    // well, and that is the earlier of the two in the document.
    const band = svg.slice(svg.indexOf('>Configurations<') - 120);
    const at = (content: string): number => {
      const found = new RegExp(`<text x="[\\d.]+" y="([\\d.]+)"[^>]*>(<tspan[^>]*>)?${content}`).exec(band);
      return Number(found?.[1]);
    };

    const gridBottom = geometry.margin + geometry.cell * 3;
    expect(at('Configurations')).toBeGreaterThan(gridBottom);
    expect(at('void')).toBeGreaterThan(at('Configurations'));
    expect(at('void')).toBeLessThan(at('chief Canopy'));
  });
});
