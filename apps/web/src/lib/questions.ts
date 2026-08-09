import type { MessageKey } from '@qimendunjia/i18n';
import { PURPOSES } from './vocabulary';

/**
 * Examples of a question, to show somebody the shape of one.
 *
 * **They are not questions to ask.** A question nobody has asked has no 用神,
 * and a chart read towards one is a reading about nothing — which is why the
 * button offers them as examples, says so beside itself, and drops them in a
 * field that can be typed over. What is being taught here is how a question
 * is put, not what to want.
 *
 * Grouped by the eight errands of the engine's `purposes.ts`, which is a
 * table it already carries and the same one the scan offers under *what are
 * you choosing a time for*. The alternative was combinatorial — a domain, an
 * action and a horizon assembled at random — and a grammar that builds a
 * sentence from parts writes nonsense in two languages instead of one, with
 * Italian agreement to get wrong on top. Forty curated strings cost less than
 * a grammar and are all well formed.
 *
 * The keys are written out rather than composed from a number, so that a
 * catalog entry renamed or missing is a compilation error here instead of the
 * literal string `question.wealth.4` appearing in somebody's field.
 */
export const QUESTIONS = {
  opening: [
    'question.opening.1',
    'question.opening.2',
    'question.opening.3',
    'question.opening.4',
    'question.opening.5',
  ],
  meeting: [
    'question.meeting.1',
    'question.meeting.2',
    'question.meeting.3',
    'question.meeting.4',
    'question.meeting.5',
  ],
  wealth: [
    'question.wealth.1',
    'question.wealth.2',
    'question.wealth.3',
    'question.wealth.4',
    'question.wealth.5',
  ],
  documents: [
    'question.documents.1',
    'question.documents.2',
    'question.documents.3',
    'question.documents.4',
    'question.documents.5',
  ],
  concealment: [
    'question.concealment.1',
    'question.concealment.2',
    'question.concealment.3',
    'question.concealment.4',
    'question.concealment.5',
  ],
  pursuit: [
    'question.pursuit.1',
    'question.pursuit.2',
    'question.pursuit.3',
    'question.pursuit.4',
    'question.pursuit.5',
  ],
  ending: [
    'question.ending.1',
    'question.ending.2',
    'question.ending.3',
    'question.ending.4',
    'question.ending.5',
  ],
  dispute: [
    'question.dispute.1',
    'question.dispute.2',
    'question.dispute.3',
    'question.dispute.4',
    'question.dispute.5',
  ],
} satisfies Record<(typeof PURPOSES)[number]['id'], readonly MessageKey[]>;

export type Scope = keyof typeof QUESTIONS | 'any';

/** Every example there is, for the reader who has not said what this is about. */
const ALL: readonly MessageKey[] = Object.values(QUESTIONS).flat();

/**
 * One example, drawn.
 *
 * `shown` is the one already offered: a button that gives the same sentence
 * twice running reads as broken, and one pool of five is small enough that it
 * happens often.
 */
export function suggest(scope: Scope, shown?: MessageKey): MessageKey {
  const pool: readonly MessageKey[] = scope === 'any' ? ALL : QUESTIONS[scope];
  const left = pool.length > 1 ? pool.filter((key) => key !== shown) : pool;
  return left[Math.floor(Math.random() * left.length)] as MessageKey;
}
