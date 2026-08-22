/**
 * Whether the rain is falling, shared across the page.
 *
 * Nothing is written to storage and nothing is written to the address. The
 * appearance is a setting somebody chose and is remembered for that reason;
 * this is not a setting, it is something found — and a thing found should be
 * findable again rather than owed to the reader on every load. A reload puts
 * the page back the way it is shipped.
 *
 * The privacy note says one thing is kept in the browser. It stays one.
 */
export const rain = $state<{ falling: boolean }>({ falling: false });

export function toggleRain(): void {
  rain.falling = !rain.falling;
}
