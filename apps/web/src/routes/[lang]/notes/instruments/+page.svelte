<!--
  What is computed, layer by layer, with every school divergence under it.

  Nothing on this page is written down here. The layers come from `$lib/notes`,
  the parameters from the engine's own declaration, and the values, the
  defaults and which of them are refused come with them — so a school that
  ships, or a value that moves from refused to computed, changes this page by
  changing the engine. That is the whole arrangement: what moves when a board
  lands must not be prose. See `docs/notes.md`.

  What *is* written is the frame — what each layer is, what it is computed
  from, and what each parameter decides. Those do not move when a board lands,
  and they are the half that doubles with every language.
-->
<script lang="ts">
  import type { MessageKey } from '@shipan/i18n';
  import { glyph } from '$lib/glyph';
  import { INSTRUMENTS } from '$lib/instruments';

  let { data } = $props();
  const t = $derived(data.t);

  /**
   * The name a layer wears, wherever it is kept.
   *
   * Six of the nine are instruments and carry theirs in `INSTRUMENTS`; two are
   * named arts that are not instruments and carry theirs in `LAYERS`; one is
   * the calendrical layer, which is described rather than named and has a
   * heading in the reader's own language instead.
   */
  const nameOf = (id: string): { hanzi: string; pinyin: string } | undefined =>
    INSTRUMENTS.find((instrument) => instrument.id === id)?.name;
</script>

<svelte:head><title>{t('notes.instruments.title')}</title></svelte:head>

<article>
  <h1>{t('notes.instruments.title')}</h1>
  <p class="lead">{t('notes.instruments.lead')}</p>
  <!-- The reason the nav is shorter than this page, said rather than left to
       be noticed: what a consultation may be laid on is a narrower question
       than what is computed here. -->
  <p class="lead">{t('notes.instruments.wider')}</p>

  {#each data.layers as layer (layer.id)}
    {@const name = layer.name ?? nameOf(layer.id)}
    <section>
      <h2>
        {#if name}
          <span class="said">{name.pinyin}</span>
          <span class="glyph">{name.hanzi}</span>
        {:else if layer.title}
          {t(layer.title)}
        {/if}
      </h2>
      <p class="does">{t(layer.does)}</p>
      <p class="takes"><span class="label">{t('notes.takes')}</span> {t(layer.takes)}</p>

      {#if layer.parameters.length}
        <table>
          <thead>
            <tr>
              <th scope="col">{t('notes.column.parameter')}</th>
              <th scope="col">{t('notes.column.values')}</th>
            </tr>
          </thead>
          <tbody>
            {#each layer.parameters as parameter (parameter.id)}
              <tr>
                <th scope="row">
                  <code>{parameter.id}</code>
                  <span class="decides">{t(`notes.parameter.${parameter.id}` as MessageKey)}</span>
                </th>
                <td>
                  <ul>
                    {#each parameter.values as value (value.id)}
                      <li class:refused={!value.implemented}>
                        <code>{value.id}</code>
                        {#if value.name}<span class="glyph">{glyph(value.name)}</span>{/if}
                        {#if value.id === parameter.default}
                          <span class="mark">{t('notes.default')}</span>
                        {/if}
                        <!-- A declared value the engine will not compute. It is
                             in the type and in the address, and asking for it
                             is an error rather than a chart cast by the nearest
                             rule the engine does have. -->
                        {#if !value.implemented}
                          <span class="mark refusal">{t('notes.refused')}</span>
                        {/if}
                      </li>
                    {/each}
                  </ul>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p class="none">{t('notes.noParameters')}</p>
      {/if}
    </section>
  {/each}
</article>

<style>
  article { max-width: 52rem; }
  h1 { font-size: 1.25rem; font-weight: 500; }
  .lead { margin: 1rem 0; max-width: 40rem; }

  section { margin-top: 2.4rem; }
  h2 {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.1rem 0.6rem;
    margin: 0;
    font-size: 1.05rem;
    font-weight: 500;
  }
  /* The name said aloud leads and the glyph stands beside it, which is the
     order every other heading on this site keeps. */
  .glyph { font-size: 0.85rem; color: var(--faint); font-weight: 400; }
  .said { letter-spacing: 0.01em; }

  .does { margin: 0.4rem 0 0; max-width: 40rem; }
  .takes { margin: 0.3rem 0 0.9rem; color: var(--faint); font-size: 0.9rem; }
  .label { text-transform: lowercase; }
  .none { margin: 0.3rem 0 0; color: var(--faint); font-size: 0.9rem; }

  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { text-align: left; vertical-align: top; padding: 0.45rem 0.6rem 0.45rem 0; }
  thead th { font-weight: 500; color: var(--faint); border-bottom: 1px solid var(--rule); }
  tbody tr { border-bottom: 1px solid var(--rule); }
  tbody th { font-weight: 400; width: 42%; }
  .decides { display: block; color: var(--faint); font-size: 0.9em; margin-top: 0.15rem; }

  ul { margin: 0; padding: 0; list-style: none; }
  li { margin: 0 0 0.2rem; }
  /* Quieter, never struck through: a refused value is a real value of a real
     parameter that this engine does not compute, and struck text reads as
     removed. */
  li.refused code { color: var(--faint); }

  code { font-size: 0.95em; }
  .mark {
    font-size: 0.75rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .refusal { color: var(--ink); opacity: 0.7; }

  /*
   * It belongs on a sheet.
   *
   * This is the page somebody prints to have beside them while they check a
   * chart against something else, which is the whole errand of the section.
   * Rows are kept whole because a parameter split across a page break loses
   * either what it decides or what it can be set to.
   */
  @media print {
    section { break-inside: avoid; }
    tbody tr { break-inside: avoid; }
    .glyph, .takes, .decides, .mark { color: var(--ink); }
  }
</style>
