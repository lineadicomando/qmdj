import { readColorScheme, type ColorScheme } from './color-scheme';

/**
 * The appearance, shared across the page.
 *
 * The stylesheet can follow an attribute on `<html>`, but an `<img>` cannot:
 * whatever is inside it resolves its own media queries against the *system*,
 * not against what the reader picked here. So the drawing has to be *asked
 * for* in the chosen appearance, and the page has to know which that is.
 */
export const appearance = $state<{ current: ColorScheme }>({ current: 'auto' });

export function syncAppearance(): void {
  appearance.current = readColorScheme();
}
