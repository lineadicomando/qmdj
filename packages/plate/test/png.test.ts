import { describe, expect, it } from 'vitest';
import { inlineColours, renderChartPng } from '../src/png.js';
import { renderChartSvg } from '../src/svg.js';
import type { PlateChart } from '../src/types.js';

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
  patterns: [],
  palaces: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => ({
    palace: { number, hanzi: '坎', id: 'kan', element: 'shui' },
    earth: { hanzi: '丙', id: 'bing', element: 'huo' },
    heaven: { hanzi: '己', id: 'ji', element: 'tu' },
    star: { hanzi: '天蓬', id: 'tianpeng' },
    starStrength: { hanzi: '旺', id: 'wang' },
    gate: number === 5 ? undefined : { hanzi: '休門', id: 'xiumen' },
    gateStrength: number === 5 ? undefined : { hanzi: '旺', id: 'wang' },
    spirit: number === 5 ? undefined : { hanzi: '值符', id: 'zhifu' },
  })),
};

describe('renderChartPng', () => {
  it('produces a PNG', () => {
    const png = renderChartPng(CHART, { width: 400 });

    // The eight-byte signature, which is the only claim worth making about a
    // raster without decoding it.
    expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(png.length).toBeGreaterThan(1000);
  });

  it('honours the width it is given', () => {
    // The width sits at bytes 16-19 of the IHDR chunk.
    expect(renderChartPng(CHART, { width: 400 }).readUInt32BE(16)).toBe(400);
    expect(renderChartPng(CHART, { width: 900 }).readUInt32BE(16)).toBe(900);
  });

  it('renders a different image in each scheme', () => {
    const light = renderChartPng(CHART, { width: 200, scheme: 'light' });
    const dark = renderChartPng(CHART, { width: 200, scheme: 'dark' });

    // A raster cannot ask the page what it prefers, so the two are genuinely
    // different files rather than one with a media query inside it.
    expect(light.equals(dark)).toBe(false);
  });

  it('leaves no unresolved custom property in what it rasterises', () => {
    // resvg does not resolve `var()`. A drawing handed to it unchanged comes
    // out with every fill missing, and looks like a blank grid rather than
    // like an error — which is why the substitution is tested and not assumed.
    const svg = renderChartSvg(CHART, { scheme: 'light' });

    expect(svg).toContain('var(--qmdj-ink)');
    expect(svg).toContain('var(--qmdj-ink-huo)');
    expect(inlineColours(svg, 'light')).not.toContain('var(');
    expect(renderChartPng(CHART, { width: 200 }).length).toBeGreaterThan(1000);
  });
});
