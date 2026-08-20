import { describe, expect, it } from 'vitest';
import { renderZiweiSvg } from '../src/ziwei-svg.js';
import type { PlateZiwei, PlateZiweiPalace, PlateZiweiSeat } from '../src/types.js';

/**
 * A board laid by hand, so this file depends on no engine.
 *
 * The point of the fixture is the crowding, as it is on the 七政四餘 board and
 * for the opposite reason: there the sky bunches and most palaces are empty,
 * here almost every seat holds something and one holds ten. A drawing got
 * right on a tidy board is a drawing that has not met a real one.
 */
function seat(
  hanzi: string,
  pinyin: string,
  grade?: string,
  change?: string,
  elements: string[] = ['huo'],
  zhengyao = false,
): PlateZiweiSeat {
  return {
    star: { hanzi, id: hanzi, pinyin, starClass: 'main', elements, zhengyao },
    brightness: grade ? { hanzi: grade, id: grade, pinyin: 'miào' } : null,
    transform: change ? { hanzi: change, id: change, pinyin: 'huàlù' } : null,
  };
}

function palace(
  house: [string, string, string],
  branch: [string, string, string],
  stem: string,
  stars: PlateZiweiSeat[],
  extra: Partial<PlateZiweiPalace> = {},
): PlateZiweiPalace {
  return {
    house: { hanzi: house[0], id: house[1], pinyin: house[2] },
    branch: { hanzi: branch[0], id: branch[1], pinyin: 'zǐ', element: branch[2] },
    stem: { hanzi: stem, id: 'jia', pinyin: 'jiǎ' },
    stars,
    body: false,
    changsheng: { hanzi: '長生', id: 'changsheng', pinyin: 'chángshēng' },
    boshi: { hanzi: '博士', id: 'boshi', pinyin: 'bóshì' },
    majorLimit: { from: 6, to: 15 },
    ...extra,
  };
}

/** The twelve grounds, in the order the drawing seats them round the border. */
const GROUND: [string, string, string][] = [
  ['寅', 'yin', 'mu'], ['卯', 'mao', 'mu'], ['辰', 'chen', 'tu'], ['巳', 'si', 'huo'],
  ['午', 'wu', 'huo'], ['未', 'wei', 'tu'], ['申', 'shen', 'jin'], ['酉', 'you', 'jin'],
  ['戌', 'xu', 'tu'], ['亥', 'hai', 'shui'], ['子', 'zi', 'shui'], ['丑', 'chou', 'tu'],
];

const HOUSES: [string, string, string][] = [
  ['命宮', 'ming', 'mìnggōng'], ['兄弟', 'xiongdi', 'xiōngdì'],
  ['妻妾', 'qiqie', 'qīqiè'], ['子女', 'zinu', 'zǐnǚ'],
  ['財帛', 'caibo', 'cáibó'], ['疾厄', 'jie', 'jíè'],
  ['遷移', 'qianyi', 'qiānyí'], ['奴僕', 'nupu', 'núpú'],
  ['官祿', 'guanlu', 'guānlù'], ['田宅', 'tianzhai', 'tiánzhái'],
  ['福德', 'fude', 'fúdé'], ['父母', 'fumu', 'fùmǔ'],
];

const CROWDED = [
  seat('紫微', 'zǐwēi', '廟', '化權', ['tu'], true),
  seat('破軍', 'pòjūn', '旺', undefined, ['shui'], true),
  // Two phases, so the drawing inks it in neither.
  seat('七殺', 'qīshā', '旺', undefined, ['huo', 'jin']),
  // None stated, so the same.
  seat('三台', 'sāntái', undefined, undefined, []),
  seat('天魁', 'tiānkuí'),
  seat('陀羅', 'tuóluó', '廟', undefined, ['jin']),
  seat('台輔', 'táifǔ', undefined, undefined, []),
  seat('天哭', 'tiānkū', undefined, undefined, []),
  seat('龍池', 'lóngchí', undefined, undefined, []),
  seat('解神', 'jiěshén', undefined, undefined, []),
  seat('天馬', 'tiānmǎ'),
];

function board(): PlateZiwei {
  const palaces = HOUSES.map((house, index) => {
    const ground = GROUND[index] as [string, string, string];
    // One seat crowded to ten, one left empty, and the 身宮 on a third.
    const stars = index === 0 ? CROWDED : index === 3 ? [] : [seat('天府', 'tiānfǔ', '得地', undefined, ['tu'], true)];
    return palace(house, ground, '甲', stars, index === 5 ? { body: true } : {});
  });

  return {
    palaces,
    bureau: { hanzi: '火六局', id: 'huoliuju', pinyin: 'huǒliùjú' },
    bodyBranch: { hanzi: '未', id: 'wei', pinyin: 'wèi' },
    lifeMaster: { hanzi: '祿存', id: 'lucun', pinyin: 'lùcún' },
    bodyMaster: { hanzi: '火星', id: 'huoxing', pinyin: 'huǒxīng' },
    minggongPillar: { hanzi: '甲戌', id: 'jiaxu', pinyin: 'jiǎxū' },
    nayin: { hanzi: '山頭火', id: 'shantouhuo', pinyin: 'shāntóuhuǒ' },
    yearPillar: { hanzi: '甲子', id: 'jiazi', pinyin: 'jiǎzǐ' },
    hourBranch: { hanzi: '未', id: 'wei', pinyin: 'wèi' },
    lunar: { year: 1984, month: 4, leap: false, day: 5 },
  };
}

describe('renderZiweiSvg', () => {
  it('draws twelve cells and a middle', () => {
    const svg = renderZiweiSvg(board());

    // Twelve seats plus the sheet's own ground rectangle.
    expect(svg.match(/<rect /g)).toHaveLength(13);
    expect(svg).toContain('紫微');
    expect(svg).toContain('火六局');
  });

  it('seats every branch in its own corner, and never by a number', () => {
    const svg = renderZiweiSvg(board(), { size: 800 });

    // 寅 is the lower left of a four by four and 申 the upper right; a board
    // laid the other way round, or laid by palace order, would put 命宮 there
    // instead. The grid is 800 − 2×36 = 728 wide, so a cell is 182.
    const cell = (800 - 2 * 800 * 0.045) / 4;
    const left = 800 * 0.045;
    const top = 800 * 0.045;
    expect(svg).toContain(`x="${left}" y="${top + cell * 3}"`); // 寅, lower left
    expect(svg).toContain(`x="${left + cell * 3}" y="${top}"`); // 申, upper right
  });

  it('carries the grade and the transformation on the star they belong to', () => {
    const svg = renderZiweiSvg(board());

    // Not in a second table and not in a legend: both are attributes of that
    // star in that seat, and a reader who had to look them up elsewhere would
    // be reading a different board.
    expect(svg).toContain('紫微廟化權');
  });

  it('marks the seat the 身宮 shares, and marks exactly one', () => {
    const svg = renderZiweiSvg(board());

    expect(svg.match(/class="cell[^"]* body"/g)).toHaveLength(1);
    expect(svg).toContain('疾厄 身');
  });

  it('shrinks the star lines rather than the cell when a seat is crowded', () => {
    const svg = renderZiweiSvg(board());
    const sizes = [...svg.matchAll(/font-size="([\d.]+)"/g)].map((m) => Number(m[1]));

    // Every cell is the same square whatever it holds, so the ten-name seat
    // has to be set smaller than the one-name seats around it.
    expect(new Set(sizes).size).toBeGreaterThan(1);
    expect(Math.min(...sizes)).toBeGreaterThan(0);
  });

  it('tints each cell with the phase of its own ground', () => {
    const svg = renderZiweiSvg(board());

    // 卷二 calls a palace its phase's 鄉, its country: 寅 and 卯 are wood,
    // 巳 and 午 fire, 申 and 酉 metal, 亥 and 子 water, and the four 墓庫
    // earth. Two cells apiece for four phases and four for earth.
    for (const [phase, count] of [['mu', 2], ['huo', 2], ['jin', 2], ['shui', 2], ['tu', 4]] as const) {
      expect(svg.match(new RegExp(`class="cell tint-${phase}`, 'g'))).toHaveLength(count);
    }
  });

  it('inks a star in its phase, and only where the book gives exactly one', () => {
    const svg = renderZiweiSvg(board());

    // 紫微屬土 and 破軍屬水, so both are inked.
    expect(svg).toMatch(/class="ink-tu">紫微廟化權/);
    expect(svg).toMatch(/class="ink-shui">破軍旺/);
    // 七殺屬火金 — two phases, and a glyph has one colour, so it takes none
    // rather than the drawing picking one.
    expect(svg).toMatch(/<text[^>]*>七殺旺<\/text>/);
    expect(svg).not.toMatch(/class="ink-[a-z]+">七殺/);
    // 三台 is one of the thirteen the book passes over in silence.
    expect(svg).not.toMatch(/class="ink-[a-z]+">三台/);
  });

  it("puts the word under the seat's leading star and under nothing else", () => {
    const svg = renderZiweiSvg(board(), {
      labels: { star: { 天府: 'the celestial treasury', 陀羅: 'the spinning top' } },
    });

    // One word to a cell, on the star that leads it. That star is always one
    // of the 十四主星 wherever a seat holds any: the placement order runs
    // 紫微's chain, then 天府's, then the auxiliaries, so an auxiliary can
    // never come first. Measured over 4,608 seats without an exception.
    expect(svg).toContain('the celestial treasury');
    // Everything under the leading star keeps its glyphs alone, and the band
    // beneath the board carries every word regardless.
    expect(svg).not.toContain('the spinning top');
  });

  it('drops the words rather than setting them too small to read', () => {
    // The fixture's first seat holds eleven names. One word would fit by
    // count, but the names have shrunk so far to make room for each other
    // that the word derived from them falls under about eight pixels — a
    // smear that costs the glyphs their line and gives nothing back. Three
    // seats in a hundred go without; the band still says every name.
    const svg = renderZiweiSvg(board(), {
      labels: { star: { 紫微: 'the purple tenuity', 天府: 'the celestial treasury' } },
    });

    expect(svg).toContain('紫微');
    expect(svg).not.toContain('the purple tenuity');
    expect(svg).toContain('the celestial treasury');
  });

  it('says the names aloud under the board when asked, and not otherwise', () => {
    const plain = renderZiweiSvg(board());
    const withBand = renderZiweiSvg(board(), { readings: 'Said aloud' });

    expect(plain).not.toContain('zǐwēi');
    expect(withBand).toContain('Said aloud');
    expect(withBand).toContain('zǐwēi');
    // The seats are said as well as the stars: they are the frame the stars
    // are read in, and a reader who cannot pronounce 妻妾 cannot ask about it.
    expect(withBand).toContain('qīqiè');
  });

  it('lays the band in three columns, each entry on its own line', () => {
    const svg = renderZiweiSvg(board(), { readings: 'Said aloud' });
    const band = svg.slice(svg.indexOf('Said aloud'));

    // Fifty-odd names with a reading and a word apiece are a wall when they
    // are run together: the reader is not sweeping the list, they are looking
    // one up, and looking up wants a straight edge to run down. So the entries
    // start at three distinct left edges instead of one.
    const lefts = new Set([...band.matchAll(/<text x="([\d.]+)"/g)].map((m) => m[1]));
    expect(lefts.size).toBeGreaterThanOrEqual(3);
  });

  it('breaks a long entry onto a second line rather than setting it tiny', () => {
    // The longest gloss the catalogs actually carry is about this: too long to
    // sit after a name and a reading, short enough to hold a line of its own.
    const long = 'the void of the severed road';
    const svg = renderZiweiSvg(board(), {
      readings: 'Said aloud',
      labels: { star: { 陀羅: long, 天府: 'the celestial treasury' } },
    });
    const band = svg.slice(svg.indexOf('Said aloud'));

    // The word gets a line of its own — a run of faint text with no name in
    // front of it — instead of the whole entry being squeezed to fit. Setting
    // a name at two thirds beside its neighbours does not read as a long name,
    // it reads as a mistake.
    expect(band).toContain(long);
    expect(band).toMatch(/<text[^>]*>\s*<tspan class="faint">/);

    // And no *entry* is set below the floor that decides it: one either fits
    // at 92 % of the band's size or takes two lines at full size. (A word too
    // long to hold even a line of its own would still be shrunk by the line
    // drawer, which is its own guard against running off the sheet — no
    // catalog here has one.) The keying numerals are excluded by their anchor:
    // they are deliberately smaller than the names they key, being an index
    // and not a reading.
    const sizes = [...band.matchAll(/<text [^>]*font-size="([\d.]+)"[^>]*>/g)]
      .filter((m) => !m[0].includes('text-anchor="middle"'))
      .map((m) => Number(m[1]));
    expect(Math.min(...sizes) / Math.max(...sizes)).toBeGreaterThanOrEqual(0.92);
  });

  it('keys the grid to the band with the same numeral on both', () => {
    const svg = renderZiweiSvg(board(), {
      readings: 'Said aloud',
      labels: { star: { 天府: 'the celestial treasury' }, house: { ming: 'the life' } },
    });
    const band = svg.slice(svg.indexOf('Said aloud'));
    const grid = svg.slice(0, svg.indexOf('Said aloud'));

    // The two sets are the same: every entry in the band is met somewhere in
    // the grid, and the grid keys nothing the band does not list. Counts would
    // not do — a star standing in ten seats is keyed ten times and listed
    // once, which is the point of a key rather than a fault in it.
    const numeralsIn = (part: string) =>
      new Set([...part.matchAll(/class="faint">(\d+)<\/text>/g)].map((m) => Number(m[1])));
    const inBand = numeralsIn(band);
    const inGrid = numeralsIn(grid);
    expect(inBand.size).toBeGreaterThan(0);
    expect([...inGrid].sort((a, b) => a - b)).toEqual([...inBand].sort((a, b) => a - b));

    // Counted from one, in one run across both groups — a reader holding 24
    // wants one place to look, not two lists each starting at one.
    expect(Math.min(...inBand)).toBe(1);
    expect(inBand.size).toBe(Math.max(...inBand));
  });

  it('carries the word in the band for every name, not only the leading ones', () => {
    // The grid can afford one word to a cell; this is where the other
    // thirty-nine are said. Name, then sound, then meaning — the order a
    // reader needs them in.
    const svg = renderZiweiSvg(board(), {
      readings: 'Said aloud',
      labels: {
        star: { 天府: 'the celestial treasury', 陀羅: 'the spinning top' },
        // Keyed by identifier, as every label map here is — the fixture's
        // stars happen to use their glyph as an id and the seats do not,
        // which is what caught this the first time.
        house: { qiqie: 'wife and concubine' },
      },
    });

    // 天府 leads a cell and is glossed there too; 陀羅 leads nothing and is
    // said here or nowhere.
    expect(svg).toContain('the spinning top');
    expect(svg).toContain('wife and concubine');
  });

  it('draws a board laid without a sex, which has no rings and no decades', () => {
    const bare = board();
    const stripped: PlateZiwei = {
      ...bare,
      palaces: bare.palaces.map((palace) => ({
        ...palace,
        changsheng: null,
        boshi: null,
        majorLimit: null,
      })),
    };
    const svg = renderZiweiSvg(stripped);

    expect(svg).not.toContain('長生');
    expect(svg).not.toContain('博士');
    expect(svg).not.toContain('6–15');
    // The seats themselves are all still there.
    expect(svg.match(/<rect /g)).toHaveLength(13);
  });

  it('names the board for a reader who cannot see it', () => {
    const svg = renderZiweiSvg(board());

    expect(svg).toMatch(/aria-label="紫微斗數 1984\/4\/5 · 火六局 · 命宮寅 · 身宮未"/);
  });
});
