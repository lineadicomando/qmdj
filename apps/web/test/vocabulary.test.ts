import { GATES, PATTERN_IDS, SPIRITS_YANG, SPIRITS_YIN, SPIRIT_IDS as ENGINE_SPIRIT_IDS, STARS } from '@qimendunjia/core';
import { describe, expect, it } from 'vitest';
import {
  DIRECTIONS,
  GATE_IDS,
  PATTERN_IDS as FORM_PATTERN_IDS,
  SPIRIT_IDS,
  STAR_IDS,
} from '../src/lib/vocabulary';

/**
 * `$lib/vocabulary` redeclares what the engine already knows, because the
 * client imports only types from `core` and these are values. This is the
 * test that keeps the copy honest — the same bargain `@qimendunjia/plate`
 * makes with its own redeclared types.
 *
 * A form offering a gate the engine has never heard of comes back with an
 * error; a form missing one makes it silently unaskable, which is worse.
 */
describe('the identifiers a form offers', () => {
  const ids = (entries: readonly { id: string }[]): string[] => entries.map((entry) => entry.id);

  it('are the gates the engine knows, in its order', () => {
    expect([...GATE_IDS]).toEqual(ids(GATES));
  });

  it('are the stars the engine knows', () => {
    expect([...STAR_IDS]).toEqual(ids(STARS));
  });

  it('are every spirit the engine can show, which is ten and not eight', () => {
    expect([...SPIRIT_IDS]).toEqual([...ENGINE_SPIRIT_IDS]);

    // Because a chart shows eight of them and which eight depends on the dun.
    // Offering one plate's worth would make baihu unaskable for half the year.
    expect(SPIRIT_IDS).toHaveLength(10);
    for (const spirit of [...SPIRITS_YANG, ...SPIRITS_YIN]) {
      expect(SPIRIT_IDS).toContain(spirit.id);
    }
  });

  it('are the configurations the engine can report', () => {
    expect([...FORM_PATTERN_IDS]).toEqual([...PATTERN_IDS]);
  });

  it('leave the centre out, which faces nowhere and can never answer', () => {
    expect(DIRECTIONS).toHaveLength(8);
    expect(DIRECTIONS).not.toContain('centre');
  });
});
