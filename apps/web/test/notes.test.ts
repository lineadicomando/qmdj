import { PARAMETERS } from '@shipan/core';
import { catalogs, LOCALES, type MessageKey } from '@shipan/i18n';
import { describe, expect, it } from 'vitest';
import { INSTRUMENTS } from '../src/lib/instruments';
import { LAYERS, NOTE_PAGES } from '../src/lib/notes';
import { REGISTER } from '../src/lib/server/register';
import { load as instruments } from '../src/routes/[lang]/notes/instruments/+page.server';
import { load as sources } from '../src/routes/[lang]/notes/sources/+page.server';

/**
 * The section of notes is two pages derived from two registries, and the
 * failure a derived page has is not a wrong answer — it is a **silent
 * omission**. Both loads group their rows by layer, so a board the section
 * has never heard of does not draw a broken row: it draws nothing, and a
 * whole art disappears from the page that exists to list what is computed.
 *
 * So what is asserted here is coverage in both directions, and the messages
 * the templates build. A key like `notes.parameter.xiudu` is never written
 * out anywhere — the page interpolates it — so nothing else in this
 * repository can notice when a parameter arrives without a gloss.
 */
const asked = { setHeaders: () => undefined } as never;

describe('the layers the section lays out', () => {
  it('covers every board the engine declares a parameter for', () => {
    const laid = new Set(LAYERS.map((layer) => layer.id));
    for (const board of new Set(PARAMETERS.map((parameter) => parameter.board))) {
      expect(laid.has(board), `${board} has parameters and no layer to print them under`).toBe(true);
    }
  });

  it('covers every instrument a consultation can be laid on', () => {
    // The wider list has to contain the narrower one. 八字 is the row that
    // makes the point: it has no divergence of its own, so a registry built
    // from the parameters alone would leave the four pillars off the page.
    const laid = new Set(LAYERS.map((layer) => layer.id));
    for (const instrument of INSTRUMENTS) {
      expect(laid.has(instrument.id), `${instrument.id} is an instrument and not a layer`).toBe(
        true,
      );
    }
  });

  it('covers every board the register weighs a quantity for', () => {
    // The sources page drops layers with no rows, so a row whose board is
    // misspelled would take its quantity off the page in silence.
    const laid = new Set(LAYERS.map((layer) => layer.id));
    for (const row of REGISTER) {
      expect(laid.has(row.board), `docs/sources.tsv weighs "${row.quantity}" under ${row.board}`).toBe(
        true,
      );
    }
  });

  it('gives each layer a name or a heading, and never both', () => {
    for (const layer of LAYERS) {
      const named = layer.name ?? INSTRUMENTS.find((one) => one.id === layer.id)?.name;
      // An art is named and a name does not translate; a way of reading an
      // instant is described and a description does. One or the other.
      expect(Boolean(named) !== Boolean(layer.title), `${layer.id}`).toBe(true);
    }
  });
});

describe('the messages the pages build from an identifier', () => {
  const missing = (locale: (typeof LOCALES)[number], keys: string[]): string[] =>
    keys.filter((key) => !(key in catalogs[locale]));

  it('glosses every parameter, in every language', () => {
    const keys = [...new Set(PARAMETERS.map((parameter) => parameter.id))].map(
      (id) => `notes.parameter.${id}`,
    );
    expect(keys.length).toBeGreaterThan(0);
    for (const locale of LOCALES) {
      expect(missing(locale, keys), `${locale} is missing a parameter gloss`).toEqual([]);
    }
  });

  it('names and explains every rung the register uses, in every language', () => {
    const keys = [...new Set(REGISTER.map((row) => row.rung))].flatMap((rung) => {
      const named = rung === '-' ? 'none' : rung;
      return [`notes.rung.${named}`, `notes.rung.${named}.means`];
    });
    // Seven values, each with a name and a definition: a rung a reader cannot
    // read is a column of numbers standing for nothing.
    expect(keys).toHaveLength(14);
    for (const locale of LOCALES) {
      expect(missing(locale, keys), `${locale} is missing a rung`).toEqual([]);
    }
  });

  it('says what each layer is and what it is computed from, in every language', () => {
    const keys = LAYERS.flatMap((layer) =>
      [layer.takes, layer.does, layer.title].filter((key): key is MessageKey => Boolean(key)),
    );
    for (const locale of LOCALES) {
      expect(missing(locale, keys), `${locale} is missing a layer`).toEqual([]);
    }
  });
});

describe('what the two derived pages are handed', () => {
  it('gives the instruments page every parameter, under its own layer', () => {
    const data = instruments(asked) as { layers: { id: string; parameters: unknown[] }[] };
    const printed = data.layers.reduce((total, layer) => total + layer.parameters.length, 0);
    expect(printed).toBe(PARAMETERS.length);

    // And in the registry's order rather than the engine's, so the two pages
    // of the section lay the engine out the same way.
    expect(data.layers.map((layer) => layer.id)).toEqual(LAYERS.map((layer) => layer.id));
  });

  it('gives the sources page every row, and a tally that adds up', () => {
    const data = sources(asked) as {
      layers: { quantities: unknown[] }[];
      tally: { rung: string; count: number }[];
    };
    const printed = data.layers.reduce((total, layer) => total + layer.quantities.length, 0);
    expect(printed).toBe(REGISTER.length);

    // The tally is what a reader weighs the whole engine by, so it has to
    // count every row and no row twice.
    expect(data.tally.reduce((total, entry) => total + entry.count, 0)).toBe(REGISTER.length);
  });

  it('leads to every page of the section but the one being read', () => {
    // The index lists the rest; the nav lists them all. A page added to the
    // section and not to this list is a page nothing links to.
    expect(NOTE_PAGES.map((note) => note.slug)).toEqual(['', 'instruments', 'sources']);
    expect(NOTE_PAGES.filter((note) => note.answers).length).toBe(NOTE_PAGES.length - 1);
  });
});
