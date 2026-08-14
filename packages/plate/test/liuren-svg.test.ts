import { describe, expect, it } from 'vitest';
import { renderLiurenSvg } from '../src/liuren-svg.js';
import type { PlateLiuren } from '../src/types.js';

/** A branch is its phase, and so is a stem. The board reads this for ink. */
const ELEMENT: Record<string, string> = {
  子: 'shui', 丑: 'tu', 寅: 'mu', 卯: 'mu', 辰: 'tu', 巳: 'huo',
  午: 'huo', 未: 'tu', 申: 'jin', 酉: 'jin', 戌: 'tu', 亥: 'shui',
};

/**
 * How each name is said, keyed by the glyph that says it.
 *
 * 戌 xū and 戊 wù are a pair the identifiers cannot part and the tones can,
 * which is the whole argument for carrying the reading: the ring prints both.
 */
const READING: Record<string, string> = {
  子: 'zǐ', 丑: 'chǒu', 寅: 'yín', 卯: 'mǎo', 辰: 'chén', 巳: 'sì',
  午: 'wǔ', 未: 'wèi', 申: 'shēn', 酉: 'yǒu', 戌: 'xū', 亥: 'hài',
  丁: 'dīng', 辛: 'xīn',
  貴人: 'guìrén', 螣蛇: 'téngshé', 朱雀: 'zhūquè', 六合: 'liùhé',
  勾陳: 'gōuchén', 青龍: 'qīnglóng', 天空: 'tiānkōng', 白虎: 'báihǔ',
  太常: 'tàicháng', 玄武: 'xuánwǔ', 太陰: 'tàiyīn', 天后: 'tiānhòu',
};

/** A branch wherever one stands: on a lesson, under a transmission, on the ring. */
function branch(hanzi: string, id: string) {
  return {
    hanzi,
    id,
    element: ELEMENT[hanzi] as string,
    pinyin: READING[hanzi] as string,
  };
}

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
  heaven: [
    ['申', 'shen'], ['酉', 'you'], ['戌', 'xu'], ['亥', 'hai'],
    ['子', 'zi'], ['丑', 'chou'], ['寅', 'yin'], ['卯', 'mao'],
    ['辰', 'chen'], ['巳', 'si'], ['午', 'wu'], ['未', 'wei'],
  ].map(([hanzi, id], index) => ({
    hanzi: hanzi as string,
    id: id as string,
    index,
    element: ELEMENT[hanzi as string] as string,
    pinyin: READING[hanzi as string] as string,
  })),
  generals: ['玄武', '太陰', '天后', '貴人', '螣蛇', '朱雀', '六合', '勾陳', '青龍', '天空', '白虎', '太常'].map(
    (hanzi, i) => ({ hanzi, id: `g${i}`, pinyin: READING[hanzi] as string }),
  ),
  courses: [
    { number: 1, upper: branch('卯', 'mao'), lower: { hanzi: '丁', id: 'ding', element: 'huo', pinyin: 'dīng' } },
    { number: 2, upper: branch('亥', 'hai'), lower: branch('卯', 'mao') },
    { number: 3, upper: branch('卯', 'mao'), lower: branch('未', 'wei') },
    { number: 4, upper: branch('亥', 'hai'), lower: branch('卯', 'mao') },
  ],
  transmissions: [
    {
      position: 'chu',
      branch: branch('卯', 'mao'),
      general: { hanzi: '勾陳', id: 'gouchen', pinyin: 'gōuchén' },
      empty: true,
    },
    {
      position: 'zhong',
      branch: branch('亥', 'hai'),
      general: { hanzi: '貴人', id: 'guiren', pinyin: 'guìrén' },
      hiddenStem: { hanzi: '辛', id: 'xin', element: 'jin', pinyin: 'xīn' },
      empty: false,
    },
    {
      position: 'mo',
      branch: branch('未', 'wei'),
      general: { hanzi: '太常', id: 'taichang', pinyin: 'tàicháng' },
      hiddenStem: { hanzi: '丁', id: 'ding', element: 'huo', pinyin: 'dīng' },
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
    expect(svg).toMatch(/viewBox="0 0 900 \d/);
  });

  it('draws twelve palaces and no more', () => {
    // Four by four is sixteen cells; only the twelve on the edge are palaces.
    expect(svg.match(/<rect[^>]*class="cell"/g) ?? []).toHaveLength(12);
    // Each carries the tint of its own branch, which never moves: the ring is
    // a fixed ground and what changes hour to hour is the ink on it.
    expect(svg).toContain('fill="var(--qmdj-element-shui)" class="cell"');
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

  it('writes a word under every name it is given one for', () => {
    // The point of the whole file: a reader who does not read Chinese has to
    // be able to read the picture, and the picture is what travels.
    const glossed = renderLiurenSvg(BOARD, {
      labels: {
        general: { guiren: 'the noble', gouchen: 'the hooked array', taichang: 'the constant' },
        branch: { mao: 'Rabbit', hai: 'Pig', wei: 'Goat', zi: 'Rat' },
        stem: { xin: 'Yin Metal', ding: 'Yin Fire' },
      },
    });
    // In a palace of the ring, beside the general and beside what stands over
    // it — and in the transmissions above.
    expect(glossed).toContain('the noble');
    expect(glossed).toContain('Rabbit');
    expect(glossed).toContain('Yin Metal');
    // The palace's own branch takes no word: it is the ground, and the twelve
    // of them in order are the frame rather than the news.
    expect((glossed.match(/Rat/g) ?? []).length).toBeLessThan(2);
  });

  it('falls back to the hanzi for a name it was given no word for', () => {
    const partial = renderLiurenSvg(BOARD, { labels: { general: { guiren: 'the noble' } } });
    expect(partial).toContain('the noble');
    expect(partial).toContain('勾陳');
    expect(partial).not.toContain('undefined');
  });

  it('scales without changing the layout', () => {
    const small = renderLiurenSvg(BOARD, { size: 360 });
    expect(small).toMatch(/viewBox="0 0 360 \d/);
    expect((small.match(/<rect[^>]*class="cell"/g) ?? []).length).toBe(12);
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

describe('the band of readings', () => {
  const ALOUD = { readings: 'Said aloud' };
  const bandOf = (svg: string): string => svg.slice(svg.indexOf('>Said aloud<'));

  it('is drawn only when it is given a heading', () => {
    expect(renderLiurenSvg(BOARD)).not.toContain('guìrén');
    expect(renderLiurenSvg(BOARD, ALOUD)).toContain('guìrén');
  });

  it('says the twelve branches, the twelve generals and the stems that turned up', () => {
    const band = bandOf(renderLiurenSvg(BOARD, ALOUD));

    for (const reading of ['zǐ', 'hài', 'guìrén', 'tiānhòu', 'dīng', 'xīn']) {
      expect(band).toContain(reading);
    }
    // The ground and the heaven print the same twelve, and the band says each
    // of them once: the 天盤 is the 地盤 turned, not a second set of names.
    expect(band.match(/mǎo/g) ?? []).toHaveLength(1);
    // 卯 stands under three of the four lessons and is a branch wherever it
    // stands, so it is not said again among the stems.
    expect(band.indexOf('dīng')).toBeGreaterThan(band.indexOf('guìrén'));
  });

  it('gives each register its own lines', () => {
    const lines = [...bandOf(renderLiurenSvg(BOARD, ALOUD)).matchAll(/<text[^>]*>(.*?)<\/text>/g)].map(
      (found) => found[1] as string,
    );
    const holding = (reading: string): string[] => lines.filter((line) => line.includes(reading));

    expect(holding('zǐ')[0]).not.toContain('guìrén');
    expect(holding('guìrén')[0]).not.toContain('dīng');
  });

  it('grows the paper downward and leaves the ring alone', () => {
    const box = (svg: string): number => Number(/viewBox="0 0 900 ([\d.]+)"/.exec(svg)?.[1]);
    const bare = renderLiurenSvg(BOARD);
    const banded = renderLiurenSvg(BOARD, ALOUD);

    expect(box(banded)).toBeGreaterThan(box(bare));
    // The twelve cells of the ring are where they were: the band is written on
    // the paper the ring grew, exactly as on the other board.
    const cells = (svg: string): string[] => svg.match(/<rect[^>]*class="cell"\/>/g) ?? [];
    expect(cells(banded)).toEqual(cells(bare));
  });

  it('keeps the line about an unchecked rule under it', () => {
    // The band is between the ring and that line, and the line is the last
    // thing on the paper wherever it stands.
    const svg = renderLiurenSvg(
      { ...BOARD, rule: 'fanyin', unverified: true },
      { ...ALOUD, labels: { unverified: 'No reference implementation covers this rule' } },
    );
    const at = (content: string): number =>
      Number(new RegExp(`<text x="[\\d.]+" y="([\\d.]+)"[^>]*>(<tspan[^>]*>)?${content}`).exec(svg)?.[1]);

    expect(at('Said aloud')).toBeLessThan(at('No reference'));
    expect(at('No reference')).toBeLessThan(Number(/viewBox="0 0 900 ([\d.]+)"/.exec(svg)?.[1]));
  });

  it('lists nothing that arrived without a reading', () => {
    const mute = JSON.parse(JSON.stringify(BOARD), (key: string, value: unknown) =>
      key === 'pinyin' ? undefined : value,
    ) as PlateLiuren;

    expect(renderLiurenSvg(mute, ALOUD)).not.toContain('Said aloud');
  });
});
