import { describe, expect, it } from 'vitest';
import { WRITTEN_ORDER, cells } from '../src/geometry.js';
import { renderChartSvg } from '../src/svg.js';
import type { PlateChart } from '../src/types.js';

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
    { id: 'kongwang', hanzi: '空亡', palace: 2 },
    { id: 'jixing', hanzi: '擊刑', palace: 4 },
    { id: 'fuyin', hanzi: '伏吟' },
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
    cell(7, 'dui', '兌', 'jin', 'bing', '丙', 'yi', '乙', 'tianren', '天任', 'xiang', '相', 'jing1men', '驚門', 'si', '死', 'tengshe', '滕蛇'),
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
    earth: { hanzi: earth, id: earthId },
    heaven: { hanzi: heaven, id: heavenId },
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
  it('produces a square SVG', () => {
    const svg = renderChartSvg(CHART, { size: 500 });

    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
    expect(svg).toContain('viewBox="0 0 500 500"');
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
    // A configuration belonging to the whole board has no palace to mark.
    expect(svg).not.toContain('伏吟');
  });

  it('writes words where it is given them', () => {
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
    // What it was given a word for stops appearing as a glyph.
    expect(worded).not.toContain('休門');
    // What it was not given a word for keeps its name.
    expect(worded).toContain('值符');
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
