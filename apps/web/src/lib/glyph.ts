/**
 * A name in its script and said aloud: `休門 xiūmén`.
 *
 * The interface is read by someone who does not read Chinese. For them a
 * glyph alone is a shape with no sound — it cannot be pronounced, looked up,
 * or asked about — so the transliteration travels beside it everywhere the
 * hanzi does. It is not a locale and does not vary with one: 休門 is xiūmén on
 * `/it` and on `/en`, and only the gloss beside it changes.
 *
 * `pinyin` is optional for the same reason `starRelation` is guarded where it
 * is read: a chart is cacheable `private` for a day, so a field added to the
 * engine meets charts cast before it existed. Those come back with the hanzi
 * alone rather than with the word `undefined` printed after it.
 */
export function glyph(entity: { hanzi: string; pinyin?: string }): string {
  return entity.pinyin ? `${entity.hanzi} ${entity.pinyin}` : entity.hanzi;
}
