import { describe, expect, it } from 'vitest';
import { step } from '../src/lib/step';

/**
 * The arithmetic of the stepper, which is calendar arithmetic and nothing
 * else: what it produces is the same pair of strings a person could have
 * typed into the form, and the engine is what reads them.
 */
describe('step', () => {
  it('moves a double hour at a time, which is two hours', () => {
    // Twelve branches over the day, so a fixed two hours is one branch on and
    // keeps its place inside it.
    expect(step({ date: '2024-06-15', time: '14:00' }, 'shichen', 1)).toEqual({
      date: '2024-06-15',
      time: '16:00',
    });
    expect(step({ date: '2024-06-15', time: '14:37' }, 'shichen', -1)).toEqual({
      date: '2024-06-15',
      time: '12:37',
    });
  });

  it('carries a double hour over midnight in both directions', () => {
    expect(step({ date: '2024-06-15', time: '23:30' }, 'shichen', 1)).toEqual({
      date: '2024-06-16',
      time: '01:30',
    });
    expect(step({ date: '2024-06-15', time: '00:30' }, 'shichen', -1)).toEqual({
      date: '2024-06-14',
      time: '22:30',
    });
  });

  it('twelve double hours make a day', () => {
    let at = { date: '2024-06-15', time: '07:00' };
    for (let count = 0; count < 12; count += 1) at = step(at, 'shichen', 1);

    expect(at).toEqual({ date: '2024-06-16', time: '07:00' });
  });

  it('steps a day across the end of a month and of a leap February', () => {
    expect(step({ date: '2024-02-28', time: '09:00' }, 'day', 1).date).toBe('2024-02-29');
    expect(step({ date: '2023-02-28', time: '09:00' }, 'day', 1).date).toBe('2023-03-01');
    expect(step({ date: '2024-01-01', time: '09:00' }, 'day', -1).date).toBe('2023-12-31');
  });

  it('keeps the clock where it was when stepping a day', () => {
    expect(step({ date: '2024-06-15', time: '23:45' }, 'day', 1)).toEqual({
      date: '2024-06-16',
      time: '23:45',
    });
  });

  it('clamps the day of the month rather than spilling into the next one', () => {
    // The 31st of January a month on is the end of February. Adding thirty-one
    // days instead would land on the 3rd of March and look deliberate.
    expect(step({ date: '2024-01-31', time: '10:00' }, 'month', 1).date).toBe('2024-02-29');
    expect(step({ date: '2023-01-31', time: '10:00' }, 'month', 1).date).toBe('2023-02-28');
    expect(step({ date: '2024-03-31', time: '10:00' }, 'month', -1).date).toBe('2024-02-29');
  });

  it('crosses the turn of the year in both directions', () => {
    expect(step({ date: '2024-12-15', time: '10:00' }, 'month', 1).date).toBe('2025-01-15');
    expect(step({ date: '2024-01-15', time: '10:00' }, 'month', -1).date).toBe('2023-12-15');
  });

  it('steps a year, and the 29th of February with it', () => {
    expect(step({ date: '2023-06-15', time: '10:00' }, 'year', 1).date).toBe('2024-06-15');
    expect(step({ date: '2024-02-29', time: '10:00' }, 'year', 1).date).toBe('2025-02-28');
    expect(step({ date: '2024-02-29', time: '10:00' }, 'year', -1).date).toBe('2023-02-28');
  });

  it('takes an empty clock for midnight, as the address does', () => {
    expect(step({ date: '2024-06-15', time: '' }, 'shichen', 1)).toEqual({
      date: '2024-06-15',
      time: '02:00',
    });
  });

  it('writes a year of three digits with its leading zero', () => {
    // `Date.UTC` reads a year of 98 as 1998; the calendar here must not.
    expect(step({ date: '0998-06-15', time: '10:00' }, 'day', 1).date).toBe('0998-06-16');
    expect(step({ date: '0998-12-31', time: '10:00' }, 'day', 1).date).toBe('0999-01-01');
  });
});
