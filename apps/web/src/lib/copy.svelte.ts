/**
 * Taking something off this page and putting it somewhere else.
 *
 * Two controls do it — the chart as words, and the chart wrapped in a prompt —
 * and both have the same three ways of not working, which is why this is one
 * object rather than the same twenty lines written twice.
 *
 * The clipboard is the one that has to be handled and not merely reported:
 * `navigator.clipboard` does not exist outside a secure context, and this
 * runs on local networks in the clear. Three thousand characters do not fit
 * in an error message, so what could not be written comes back as text for a
 * box the reader can select by hand. A control that failed silently would
 * leave somebody pasting the last thing they copied into a conversation and
 * wondering why it was a chart from yesterday.
 */
export class Copier {
  /** Between the press and the answer: the text is fetched, not held. */
  busy = $state(false);
  /** Said on the button itself for a moment, then it goes back to offering. */
  copied = $state(false);
  /** The chart could not be read again — a failure of the request, not of the clipboard. */
  failed = $state(false);
  /** What the clipboard refused, for the reader to copy by hand. */
  fallback = $state('');

  #timer: ReturnType<typeof setTimeout> | undefined;

  /** How long «copied» stays on the button. */
  static readonly CONFIRMS = 2500;

  async run(produce: () => Promise<string>): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.failed = false;
    this.fallback = '';

    try {
      const text = await produce();
      try {
        await navigator.clipboard.writeText(text);
        this.copied = true;
        clearTimeout(this.#timer);
        this.#timer = setTimeout(() => (this.copied = false), Copier.CONFIRMS);
      } catch {
        this.fallback = text;
      }
    } catch {
      this.failed = true;
    } finally {
      this.busy = false;
    }
  }
}

/**
 * The chart in one of its two written forms, asked of the server.
 *
 * Rendered there and not here: the transcript comes out of `core`, and the
 * client imports only types from it — a value import would drag the
 * ephemerides and a native module into the browser bundle. It is also what
 * keeps this text and the one the terminal prints the same text.
 */
export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(String(response.status));
  return await response.text();
}
