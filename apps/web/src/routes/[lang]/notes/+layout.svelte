<!--
  The section's own way around, under the header and not in it.

  The notes are the one part of this site that is several pages about one
  subject, and the header lists sections rather than pages: putting four more
  entries up there would say they are four sections, which they are not. So
  the way to the rest sits inside the section, where a reader who has arrived
  at one page of it can see the others exist.

  It prints. A sheet has nowhere else to go, which is the argument for hiding
  a nav on paper everywhere else here — but this one is also the list of what
  the section *contains*, and a printed page of notes that did not say what
  else was checked would be a page claiming to be the whole account.
-->
<script lang="ts">
  import { page } from '$app/state';
  import { NOTE_PAGES } from '$lib/notes';

  let { data, children } = $props();
  const t = $derived(data.t);

  const here = (slug: string): string =>
    slug ? `/${t.locale}/notes/${slug}` : `/${t.locale}/notes`;
</script>

<nav aria-label={t('notes.title')}>
  {#each NOTE_PAGES as note (note.slug)}
    {@const address = here(note.slug)}
    <a href={address} aria-current={page.url.pathname === address ? 'page' : undefined}>
      {t(note.title)}
    </a>
  {/each}
</nav>

{@render children()}

<style>
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.1rem;
    margin-bottom: 1.6rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--rule);
    font-size: 0.9rem;
  }
  a { color: var(--faint); text-decoration: none; }
  a:hover { color: var(--ink); text-decoration: underline; }
  /* The page being read is named and not linked away from — it is still a
     link, because a reader who clicks it should get the page rather than
     nothing, but it stops looking like somewhere to go. */
  a[aria-current='page'] { color: var(--ink); font-weight: 500; }

  @media print {
    nav { color: var(--ink); }
    a { color: var(--ink); }
  }
</style>
