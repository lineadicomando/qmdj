import { describe, expect, it } from 'vitest';
import { renderQizhengSvg } from '../src/qizheng-svg.js';
import type { PlatePlacement, PlateQizheng } from '../src/types.js';

/**
 * A board laid by hand, so this file depends on no engine.
 *
 * The point of the fixture is the crowding: 午 holds three bodies and six of
 * the twelve palaces hold none. That is what a real board looks like — the
 * sky bunches — and it is the one thing about this drawing that could not be
 * got right by laying out a tidy one.
 */
function placed(
  hanzi: string,
  id: string,
  element: string | undefined,
  lodge: [string, string, string],
  degree: number,
  palace: [string, number],
  motion: string,
): PlatePlacement {
  return {
    body: { hanzi, id, ...(element ? { element } : {}), pinyin: READING[hanzi] as string },
    lodge: { hanzi: lodge[0], id: lodge[1], pinyin: lodge[2] },
    lodgeDegree: degree,
    palace: { hanzi: palace[0], index: palace[1] },
    motion,
  };
}

const READING: Record<string, string> = {
  太陽: 'tàiyáng', 太陰: 'tàiyīn', 水星: 'shuǐxīng', 金星: 'jīnxīng',
  火星: 'huǒxīng', 木星: 'mùxīng', 土星: 'tǔxīng',
  羅睺: 'luóhóu', 計都: 'jìdū', 月孛: 'yuèbèi',
};

const BOARD: PlateQizheng = {
  governors: [
    placed('太陽', 'taiyang', undefined, ['柳', 'liu', 'liǔ'], 11.7, ['午', 6], 'shun'),
    placed('太陰', 'taiyin', undefined, ['翼', 'yi', 'yì'], 0.13, ['巳', 5], 'shun'),
    placed('水星', 'shuixing', 'shui', ['鬼', 'gui', 'guǐ'], 3.47, ['午', 6], 'shun'),
    placed('金星', 'jinxing', 'jin', ['翼', 'yi', 'yì'], 14.19, ['辰', 4], 'shun'),
    placed('火星', 'huoxing', 'huo', ['參', 'shen', 'shēn'], 7.46, ['未', 7], 'shun'),
    placed('木星', 'muxing', 'mu', ['鬼', 'gui', 'guǐ'], 3.99, ['午', 6], 'shun'),
    placed('土星', 'tuxing', 'tu', ['壁', 'bi13', 'bì'], 4.9, ['戌', 10], 'ni'),
  ],
  remainders: [
    placed('羅睺', 'luohou', 'huo', ['星', 'xing', 'xīng'], 2.55, ['巳', 5], 'ni'),
    placed('計都', 'jidu', 'tu', ['虛', 'xu', 'xū'], 6.42, ['亥', 11], 'ni'),
    placed('月孛', 'yuebei', 'shui', ['尾', 'wei3', 'wěi'], 10.05, ['寅', 2], 'shun'),
  ],
  minggong: { palace: { hanzi: '卯', index: 3 }, ci: { hanzi: '大火', id: 'dahuo', pinyin: 'dàhuǒ' } },
  houses: (
    [
      ['命宮', 'ming', 'mìnggōng', 3, '大火', 'dahuo', 'dàhuǒ'],
      ['財帛宮', 'caibo', 'cáibógōng', 2, '析木', 'ximu', 'xīmù'],
      ['兄弟宮', 'xiongdi', 'xiōngdìgōng', 1, '星紀', 'xingji', 'xīngjì'],
      ['田宅宮', 'tianzhai', 'tiánzháigōng', 0, '玄枵', 'xuanxiao', 'xuánxiāo'],
      ['男女宮', 'nannv', 'nánnǚgōng', 11, '娵訾', 'juzi', 'jūzī'],
      ['奴僕宮', 'nupu', 'núpúgōng', 10, '降婁', 'jianglou', 'jiànglóu'],
      ['夫妻宮', 'fuqi', 'fūqīgōng', 9, '大梁', 'daliang', 'dàliáng'],
      ['疾厄宮', 'jie', 'jíègōng', 8, '實沈', 'shichen', 'shíchén'],
      ['遷移宮', 'qianyi', 'qiānyígōng', 7, '鶉首', 'chunshou', 'chúnshǒu'],
      ['官祿宮', 'guanlu', 'guānlùgōng', 6, '鶉火', 'chunhuo', 'chúnhuǒ'],
      ['福德宮', 'fude', 'fúdégōng', 5, '鶉尾', 'chunwei', 'chúnwěi'],
      ['相貌宮', 'xiangmao', 'xiàngmàogōng', 4, '壽星', 'shouxing', 'shòuxīng'],
    ] as const
  ).map(([hanzi, id, pinyin, index, ci, ciId, ciPinyin]) => ({
    house: { hanzi, id, pinyin },
    palace: { index },
    ci: { hanzi: ci, id: ciId, pinyin: ciPinyin },
  })),
};

const LABELS = {
  body: {
    taiyang: 'the sun', taiyin: 'the moon', shuixing: 'Mercury', jinxing: 'Venus',
    huoxing: 'Mars', muxing: 'Jupiter', tuxing: 'Saturn',
    luohou: 'the eclipse head', jidu: 'the eclipse tail', yuebei: 'the lunar apogee',
  },
  house: {
    ming: 'the life', caibo: 'wealth', xiongdi: 'siblings', tianzhai: 'land and house',
    nannv: 'children', nupu: 'servants', fuqi: 'husband and wife',
    jie: 'illness and hardship', qianyi: 'removal', guanlu: 'office and salary',
    fude: 'fortune and virtue', xiangmao: 'countenance',
  },
  motion: { shun: 'direct', ni: 'retrograde' },
  minggong: 'palace of the life',
  remainders: 'three, not four: 紫氣 is a rule without an epoch',
  frame: 'the lodges begin at their determinative stars',
};

const svg = (options = {}) => renderQizhengSvg(BOARD, { labels: LABELS, ...options });

describe('the ring', () => {
  it('draws twelve palaces and no thirteenth', () => {
    expect(svg().match(/<rect [^>]*class="cell"/g)).toHaveLength(12);
  });

  it('writes every branch of the ground once', () => {
    const drawn = svg();
    for (const branch of ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']) {
      expect(drawn).toContain(branch);
    }
  });

  it('seats a body on the palace it was given and nowhere else', () => {
    // 火星 is at 未 and 未 sits top row, third column, so its glyph has to
    // land inside that cell rather than wherever the list above put it.
    const drawn = svg({ size: 800 });
    const mars = drawn.match(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>火星</g);

    // Once in the listing above the ring, once on the ring itself.
    expect(mars).toHaveLength(2);
  });

  it('stacks a crowded palace without moving an empty one', () => {
    // 午 holds three. They are stacked downwards from the same first
    // baseline every palace uses, so the ring reads as twelve of one thing.
    const drawn = svg({ size: 800 });
    const heights = ['太陽', '水星', '木星'].map((body) => {
      const at = drawn.match(new RegExp(`<text x="[\\d.]+" y="([\\d.]+)"[^>]*>${body}<`, 'g'));
      return (at as string[])[1];
    });

    expect(new Set(heights).size).toBe(3);
  });

  it('marks the palace of the life, and only that one', () => {
    expect(svg().match(/<rect [^>]*class="rule"/g)).toHaveLength(1);
  });
});

describe('the listing over the ring', () => {
  it('glosses all eleven names it draws, which the ring then need not', () => {
    const drawn = svg();
    for (const gloss of Object.values(LABELS.body)) expect(drawn).toContain(gloss);
  });

  it('says the lodge and the degrees past its determinative star together', () => {
    // Neither means anything alone: a degree with no lodge is a number.
    expect(svg()).toContain('柳 11.70°');
    expect(svg()).toContain('壁 4.90°');
  });

  it('does not print the 宮度 beside the 入宿度', () => {
    // Two numbers on one line meaning different things is the one confusion
    // this board is most able to cause, and the ring below is the 宮.
    expect(svg()).not.toContain('22.61');
  });

  it('says which way each body runs', () => {
    expect(svg()).toContain('retrograde');
    expect(svg()).toContain('direct');
  });
});

describe('what it says under the board', () => {
  it('says the count is three and why, on the sheet', () => {
    expect(svg()).toContain('three, not four');
  });

  it('says the frame is the stars and not a table', () => {
    expect(svg()).toContain('determinative stars');
  });

  it('leaves both out when it was given neither', () => {
    const bare = renderQizhengSvg(BOARD);

    expect(bare).not.toContain('three, not four');
    expect(bare).toContain('<svg');
  });
});

describe('the band of readings', () => {
  it('is drawn only when asked for', () => {
    expect(svg()).not.toContain('tàiyáng');
    expect(svg({ readings: 'Said aloud' })).toContain('tàiyáng');
  });

  it('says the lodges, which are the hardest names on the board', () => {
    const drawn = svg({ readings: 'Said aloud' });

    expect(drawn).toContain('liǔ');
    expect(drawn).toContain('wěi');
    // And the 次, which even a reader of Chinese may never have had to say.
    expect(drawn).toContain('jūzī');
  });

  it('says a lodge once however many bodies fell in it', () => {
    // 鬼 holds 水星 and 木星, and 翼 holds 太陰 and 金星.
    const drawn = svg({ readings: 'Said aloud' });

    expect(drawn.match(/guǐ/g)).toHaveLength(1);
    expect(drawn.match(/yì/g)).toHaveLength(1);
  });
});

describe('the drawing itself', () => {
  it('is proportional, so size settles the intrinsic size and nothing else', () => {
    const small = svg({ size: 400 });
    const large = svg({ size: 800 });

    expect(small).toContain('viewBox="0 0 400');
    expect(large).toContain('viewBox="0 0 800');
    // The same words at both, since nothing is dropped to make room.
    expect(small).toContain('office and salary');
    expect(large).toContain('office and salary');
  });

  it('names itself for a reader who cannot see it', () => {
    expect(svg()).toMatch(/aria-label="七政四餘 太陽柳11\.7度 · 命宮卯大火"/);
  });

  it('carries one scheme when told which, and both when not', () => {
    expect(svg({ scheme: 'light' })).not.toContain('prefers-color-scheme');
    expect(svg()).toContain('prefers-color-scheme');
  });
});
