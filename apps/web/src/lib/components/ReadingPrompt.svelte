<!--
  The chart, carried to somebody who reads it.

  This project computes a chart and refuses to read it — the rule it is built
  on, and not a missing feature. The consequence is that whoever wants a
  reading takes the date to a model, and a model handed a date and a place
  casts the chart from memory and gets it wrong. A wrong chart read well is
  the worst thing this could produce: nothing downstream can catch it, because
  it looks exactly like a right one.

  So the chart goes across already computed, and the conditions go with it —
  the 用神 is the reader's, the fortunes do not add up to a score, a 凶 is not
  advice, and the reading belongs to whoever gives it. That is what makes this
  consistent with the rest rather than a way around it: the site is not
  outsourcing in a button what it declines to do in code, it is handing over
  the data with the terms attached.

  Nothing is sent anywhere from here. The prompt goes to the clipboard, and
  where it goes next is the reader's decision — which is also why there is no
  chat on this page: a box that answered would mean posting somebody's date,
  time and place of birth to a third party, and the privacy note says this
  browser contacts no other server.

  The question is the part that never leaves: it goes in the field, not in the
  address, and the server is told only that one exists. See the endpoint.
-->
<script lang="ts">
  import { Copier, fetchText } from '$lib/copy.svelte';
  import { suggest, type Scope } from '$lib/questions';
  import { PURPOSES } from '$lib/vocabulary';
  import type { MessageKey, Translator } from '@qimendunjia/i18n';

  interface Props {
    t: Translator;
    /** The chart's query string, which the endpoint reads exactly as the page does. */
    query: string;
  }

  let { t, query }: Props = $props();

  let question = $state('');
  let scope = $state<Scope>('any');
  /** The last example offered, so the next one is a different sentence. */
  let offered = $state<MessageKey | undefined>();

  const copier = new Copier();
  const id = $props.id();

  function example(): void {
    offered = suggest(scope, offered);
    question = t(offered);
  }

  /**
   * The frame from the server, the question from here.
   *
   * `asked` says a question exists; the prompt then ends on the line that
   * introduces one and this appends it. What somebody asks a chart is theirs,
   * and a query string is written into every log between here and the server.
   */
  async function copy(): Promise<string> {
    const asked = question.trim();
    const frame = await fetchText(
      `/api/chart/prompt?${query}${asked ? '&asked=true' : ''}`,
    );
    return asked ? `${frame}${asked}\n` : frame;
  }
</script>

<section class="prompt">
  <h2>{t('form.promptTitle')}</h2>
  <p>{t('form.promptNote')}</p>
  <p>{t('form.promptCarries')}</p>

  <label for={id}>{t('form.question')}</label>
  <textarea
    {id}
    bind:value={question}
    rows="2"
    placeholder={t('form.questionPlaceholder')}
    oninput={() => (offered = undefined)}
  ></textarea>
  <p class="note">{t('form.questionNote')}</p>

  <!--
    The examples, and what they are for. The face of every control here is a
    word in the reader's language: `opening` and `dispute` are what the engine
    calls the eight errands, and an option reading `concealment` is an option
    nobody can choose on purpose.
  -->
  <div class="controls">
    <label class="scope">
      {t('form.suggestScope')}
      <select bind:value={scope}>
        <option value="any">{t('form.any')}</option>
        {#each PURPOSES as purpose}
          <option value={purpose.id}>{t(`label.purpose.${purpose.id}` as MessageKey)}</option>
        {/each}
      </select>
    </label>
    <button type="button" onclick={example}>{t('form.suggest')}</button>
  </div>
  <p class="note">{t('form.suggestNote')}</p>

  <div class="controls">
    <button type="button" class="copy" onclick={() => copier.run(copy)} disabled={copier.busy} aria-live="polite">
      {copier.busy ? t('form.copying') : copier.copied ? t('form.copied') : t('form.copyPrompt')}
    </button>
  </div>
  <p class="note">{t('form.promptPrivacy')}</p>

  {#if copier.failed}<p class="failure" role="alert">{t('form.copyUnread')}</p>{/if}

  {#if copier.fallback}
    <p class="note">{t('form.copyFailed')}</p>
    <textarea readonly rows="8" class="fallback" aria-label={t('form.copyFallback')}
      >{copier.fallback}</textarea
    >
  {/if}
</section>

<style>
  /* It opens under the reading and keeps its voice down: an offer, not the
     reason anybody came here. The rule above it does the parting — without a
     mark the block reads as the last paragraph of the chart. */
  .prompt {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--rule);
    max-width: 62ch;
  }
  h2 { font-size: 1rem; font-weight: 500; margin: 0 0 0.5rem; }
  p { margin: 0 0 0.6rem; font-size: 0.85rem; line-height: 1.55; color: var(--faint); }
  .note { font-size: 0.8rem; }
  label { display: block; font-size: 0.85rem; margin: 1rem 0 0.3rem; }
  textarea {
    width: 100%;
    padding: 0.4rem;
    font: inherit;
    font-size: 0.9rem;
    background: var(--ground);
    color: var(--ink);
    border: 1px solid var(--rule);
  }
  .fallback {
    background: var(--tint);
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-top: 0.75rem; }
  .scope { display: flex; align-items: center; gap: 0.4rem; margin: 0; font-size: 0.8rem; }
  select { font: inherit; font-size: 0.8rem; color: var(--ink); background: var(--ground); border: 1px solid var(--rule); padding: 0.2rem; max-width: 22rem; }
  button {
    font: inherit;
    font-size: 0.8rem;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    border: 1px solid var(--rule);
    background: none;
    color: var(--faint);
  }
  button:hover:not(:disabled) { color: var(--ink); border-color: var(--edge); }
  button:disabled { cursor: progress; opacity: 0.6; }
  /* The one thing in this block anybody arrived at it to press. */
  .copy { color: var(--ink); border-color: var(--edge); }
  .failure { color: var(--alarm); }
</style>
