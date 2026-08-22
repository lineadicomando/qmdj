<!--
  The index: what this section is, and the way to the rest.

  It is the one page here that is prose alone, and the only one of the section
  a reader can arrive at from the footer — so it has to say what the section
  claims and then get out of the way. What each page answers is read off
  `NOTE_PAGES`, and so is whether it is derived or written, because that
  division is the section's own subject and not a note about its plumbing: a
  derived page cannot fall behind the engine, and a written one can, which is
  why it is the written ones that will carry a date.
-->
<script lang="ts">
  import { NOTE_PAGES } from '$lib/notes';

  let { data } = $props();
  const t = $derived(data.t);

  /** Every page but this one: the index does not lead to itself. */
  const rest = NOTE_PAGES.filter((note) => note.slug);
</script>

<svelte:head><title>{t('notes.title')}</title></svelte:head>

<article>
  <h1>{t('notes.title')}</h1>
  <p>{t('notes.lead')}</p>
  <p>{t('notes.claim')}</p>

  <ul>
    {#each rest as note (note.slug)}
      <li>
        <a href="/{t.locale}/notes/{note.slug}">{t(note.title)}</a>
        <span class="kind">{t(`notes.kind.${note.kind}`)}</span>
        {#if note.answers}<span class="answers">{t(note.answers)}</span>{/if}
      </li>
    {/each}
  </ul>

  <!-- The section is not finished, and saying so is not an apology: the
       reader here is the one who came to check, and a page that let them
       assume the account was complete would mislead exactly them. -->
  <p class="building">{t('notes.building')}</p>
</article>

<style>
  article { max-width: 38rem; }
  h1 { font-size: 1.25rem; font-weight: 500; }
  p { margin: 1rem 0; }

  ul { margin: 1.6rem 0; padding: 0; list-style: none; }
  li { margin: 0 0 1.1rem; }
  a { font-weight: 500; }
  .kind {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .answers { display: block; margin-top: 0.15rem; color: var(--faint); font-size: 0.9rem; }
  .building { color: var(--faint); font-size: 0.9rem; }

  @media print {
    .kind, .answers, .building { color: var(--ink); }
  }
</style>
