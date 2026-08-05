export type MessageParams = Record<string, string | number>;

/**
 * Fills `{name}` placeholders in a message template.
 *
 * Deliberately not an i18n framework. The catalog holds labels and short
 * warnings, not prose with plurals and gendered agreement; when it stops
 * being true, this is the seam to replace.
 *
 * An unknown placeholder is left in the output as written rather than being
 * blanked. A visible `{path}` on screen is a bug someone reports; an empty
 * space is a bug nobody notices.
 */
export function format(template: string, params?: MessageParams): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name];
    return value === undefined ? placeholder : String(value);
  });
}
