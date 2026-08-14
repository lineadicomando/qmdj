import { describe, expect, it } from 'vitest';
import { renderLiurenSvg } from '../src/liuren-svg.js';
import type { PlateLiuren } from '../src/types.js';

/**
 * A board laid by hand, so this file depends on no engine.
 *
 * 冬至 seats the general at 丑; on the hour of 巳 every branch stands four
 * palaces on from home. The day is 丁未, whose decade is 甲辰 and therefore
 * leaves out 寅 and 卯 — which is why the first transmission carries no stem.
 */
const BOARD: PlateLiuren = {
  yuejiang: { hanzi: '大吉', branch: { hanzi: '丑', index: 1 } },
  day: { hanzi: '丁未' },
  hour: { hanzi: '巳', index: 5 },
  heaven: ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'].map(
    (hanzi, index) => ({ hanzi, index }),
  ),
  generals: ['玄武', '太陰', '天后', '貴人', '螣蛇', '朱雀', '六合', '勾陳', '青龍', '天空', '白虎', '太常'].map(
    (hanzi, i) => ({ hanzi, id: `g${i}` }),
  ),
  courses: [
    { number: 1, upper: { hanzi: '卯' }, lower: { hanzi: '丁' } },
    { number: 2, upper: { hanzi: '亥' }, lower: { hanzi: '卯' } },
    { number: 3, upper: { hanzi: '卯' }, lower: { hanzi: '未' } },
    { number: 4, upper: { hanzi: '亥' }, lower: { hanzi: '卯' } },
  ],
  transmissions: [
    { position: 'chu', branch: { hanzi: '卯' }, general: { hanzi: '勾陳', id: 'gouchen' }, empty: true },
    {
      position: 'zhong',
      branch: { hanzi: '亥' },
      general: { hanzi: '貴人', id: 'guiren' },
      hiddenStem: { hanzi: '辛' },
      empty: false,
    },
    {
      position: 'mo',
      branch: { hanzi: '未' },
      general: { hanzi: '太常', id: 'taichang' },
      hiddenStem: { hanzi: '丁' },
      empty: false,
    },
  ],
  rule: 'zeike',
  keti: 'yuanshou',
};

describe('the Liu Ren drawing', () => {
  const svg = renderLiurenSvg(BOARD);

  it('is a square-ish SVG with a viewBox', () => {
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
    expect(svg).toMatch(/viewBox="0 0 720 \d/);
  });

  it('draws twelve palaces and no more', () => {
    // Four by four is sixteen cells; only the twelve on the edge are palaces.
    expect(svg.match(/<rect[^>]*class="rule"/g) ?? []).toHaveLength(12);
  });

  it('writes each palace its own branch, its 天盤 and its general', () => {
    // 巳 is the top-left palace, and at this hour the general of the month
    // stands on it: 丑 over 巳.
    expect(svg).toContain('丑');
    expect(svg).toContain('巳');
    for (const general of ['貴人', '螣蛇', '朱雀', '玄武']) expect(svg).toContain(general);
    // Every one of the twelve grounds is written.
    for (const branch of ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']) {
      expect(svg).toContain(branch);
    }
  });

  it('says what the board is, in the aria label, for a reader who cannot see it', () => {
    expect(svg).toMatch(/aria-label="大六壬 丁未日 巳時 · 月將丑 · 三傳卯亥未"/);
  });

  it('writes the words it is handed and invents none', () => {
    const bare = renderLiurenSvg(BOARD);
    expect(bare).not.toContain('元首');

    const glossed = renderLiurenSvg(BOARD, {
      labels: {
        rule: { zeike: 'robbery and control' },
        keti: { yuanshou: 'the head' },
        transmission: { chu: 'first', zhong: 'middle', mo: 'last' },
        empty: 'empty',
      },
    });
    expect(glossed).toContain('robbery and control');
    expect(glossed).toContain('the head');
    expect(glossed).toContain('first');
    // The first transmission is 空亡, so the word for it stands where a stem
    // would have.
    expect(glossed).toContain('empty');
  });

  it('says on the face of a board when its rule could not be checked', () => {
    const unverified = renderLiurenSvg(
      { ...BOARD, rule: 'fanyin', unverified: true },
      { labels: { unverified: 'this rule is unfalsified' } },
    );
    expect(unverified).toContain('this rule is unfalsified');
    // And the paper is taller by exactly what that line needs.
    expect(heightOf(unverified)).toBeGreaterThan(heightOf(svg));
  });

  it('scales without changing the layout', () => {
    const small = renderLiurenSvg(BOARD, { size: 360 });
    expect(small).toMatch(/viewBox="0 0 360 \d/);
    expect((small.match(/<rect[^>]*class="rule"/g) ?? []).length).toBe(12);
  });

  it('carries both schemes when asked for neither', () => {
    expect(svg).toContain('prefers-color-scheme: dark');
    expect(renderLiurenSvg(BOARD, { scheme: 'light' })).not.toContain('prefers-color-scheme');
  });

  it('escapes what a caller hands it', () => {
    const nasty = renderLiurenSvg(BOARD, { heading: 'a & b <c>' });
    expect(nasty).toContain('a &amp; b &lt;c&gt;');
    expect(nasty).not.toContain('<c>');
  });
});

function heightOf(svg: string): number {
  return Number(/height="([\d.]+)"/.exec(svg)?.[1]);
}
