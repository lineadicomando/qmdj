/**
 * How the page looks: light, dark, or whatever the system says.
 *
 * `auto` is not a third colour but the absence of a choice — no attribute on
 * the document, no key in storage, and the colours go back to following
 * `prefers-color-scheme`. Someone who never touches the button leaves nothing
 * behind on their device, and someone who returns to `auto` erases what they
 * had left.
 */

export type ColorScheme = 'auto' | 'light' | 'dark';

/** The button's cycle, in the order the presses go round. */
export const COLOR_SCHEMES: readonly ColorScheme[] = ['auto', 'light', 'dark'];

/**
 * The key in `localStorage`, named in the privacy note: if it changes here it
 * changes there too.
 */
export const COLOR_SCHEME_KEY = 'qimendunjia:color-scheme';

/** The attribute the stylesheet watches on `<html>`. `app.html` writes it too. */
export const COLOR_SCHEME_ATTRIBUTE = 'data-color-scheme';

export function nextColorScheme(current: ColorScheme): ColorScheme {
  return COLOR_SCHEMES[(COLOR_SCHEMES.indexOf(current) + 1) % COLOR_SCHEMES.length] ?? 'auto';
}

/**
 * Whatever is in the browser's memory becomes one of the three: the key may
 * have been written by an older version of the site, or by the person
 * themselves from the developer tools.
 */
export function parseColorScheme(value: string | null | undefined): ColorScheme {
  return value === 'light' || value === 'dark' ? value : 'auto';
}

/** Outside a browser — while the server renders — it is `auto`. */
export function readColorScheme(): ColorScheme {
  if (typeof document === 'undefined') return 'auto';

  const attribute = document.documentElement.getAttribute(COLOR_SCHEME_ATTRIBUTE);
  if (attribute) return parseColorScheme(attribute);

  try {
    return parseColorScheme(localStorage.getItem(COLOR_SCHEME_KEY));
  } catch {
    // Storage refused by the browser's settings: `auto` stands.
    return 'auto';
  }
}

export function applyColorScheme(scheme: ColorScheme): void {
  if (typeof document === 'undefined') return;

  if (scheme === 'auto') document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
  else document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, scheme);

  try {
    if (scheme === 'auto') localStorage.removeItem(COLOR_SCHEME_KEY);
    else localStorage.setItem(COLOR_SCHEME_KEY, scheme);
  } catch {
    // The choice still holds for this page: not being able to remember it is
    // no reason not to apply it.
  }
}
