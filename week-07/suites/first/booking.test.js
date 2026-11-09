// app/src/booking.test.js
// Unit tests for canBook (AC1-AC5). booking.js is imported as-is, not modified.
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { canBook } from './booking.js';

const NOW = 540; // 09:00, the supplied current time for every case

// Fresh fixture for every test: new object, new bookings array, new booking objects.
function makeInput(start, end, overrides = {}) {
  return {
    start,
    end,
    now: NOW,
    blocked: false,
    bookings: [{ start: 600, end: 660 }],
    ...structuredClone(overrides),
  };
}

beforeEach(() => {
  // Fixed wall clock, deliberately far from now = 540 (23:30 local).
  // If canBook ever read Date instead of the supplied `now`, T01/T06/T08/T14/X1 would fail.
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 0, 15, 23, 30, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

const cases = [
  { id: 'T01', start: 660,  end: 720,  overrides: {},                expected: true,  ac: 'AC4',     note: 'touching after' },
  { id: 'T02', start: 540,  end: 570,  overrides: {},                expected: false, ac: 'AC1',     note: 'starts exactly now' },
  { id: 'T03', start: 720,  end: 720,  overrides: {},                expected: false, ac: 'AC1',     note: 'zero duration' },
  { id: 'T04', start: 750,  end: 720,  overrides: {},                expected: false, ac: 'AC1',     note: 'reversed' },
  { id: 'T05', start: 1380, end: 1441, overrides: {},                expected: false, ac: 'AC1',     note: 'past day end' },
  { id: 'T06', start: 720,  end: 840,  overrides: {},                expected: true,  ac: 'AC2',     note: 'exactly 120 min' },
  { id: 'T07', start: 720,  end: 841,  overrides: {},                expected: false, ac: 'AC2',     note: '121 min' },
  { id: 'T08', start: 570,  end: 600,  overrides: {},                expected: true,  ac: 'AC4',     note: 'touching before' },
  { id: 'T09', start: 630,  end: 690,  overrides: {},                expected: false, ac: 'AC4',     note: 'partial overlap' },
  { id: 'T10', start: 570,  end: 690,  overrides: {},                expected: false, ac: 'AC4',     note: 'contains booking' },
  { id: 'T11', start: 615,  end: 645,  overrides: {},                expected: false, ac: 'AC4',     note: 'inside booking' },
  { id: 'T12', start: 600,  end: 660,  overrides: {},                expected: false, ac: 'AC4',     note: 'identical interval' },
  { id: 'T13', start: 660,  end: 720,  overrides: { blocked: true }, expected: false, ac: 'AC3',     note: 'room blocked' },
  { id: 'T14', start: 630,  end: 690,  overrides: { bookings: [] },  expected: true,  ac: 'AC4',     note: 'no bookings' },
  { id: 'X1',  start: 1320, end: 1440, overrides: {},                expected: true,  ac: 'AC1+AC2', note: 'ends at 24:00, 120 min' },
  {
    id: 'X2', start: 660, end: 750,
    overrides: { bookings: [{ start: 600, end: 660 }, { start: 720, end: 780 }] },
    expected: false, ac: 'AC4', note: 'overlaps second booking',
  },
];

describe('canBook - reviewed case table', () => {
  test.each(cases)('$id $start-$end ($note) -> $expected [$ac]', ({ start, end, overrides, expected }) => {
    const input = makeInput(start, end, overrides);
    const before = structuredClone(input);

    const result = canBook(input);

    expect(result).toBe(expected);   // exact boolean, not truthy/falsy
    expect(input).toEqual(before);   // no input field or booking changed
  });
});

describe('AC5 - decision only, booking data unchanged', () => {
  test('Available request (660-720) does not add itself or change the 600-660 entry', () => {
    const input = makeInput(660, 720);
    const bookingsRef = input.bookings;
    const entryRef = input.bookings[0];

    const result = canBook(input);

    expect(result).toBe(true);
    expect(input.bookings).toBe(bookingsRef);
    expect(input.bookings).toHaveLength(1);
    expect(input.bookings[0]).toBe(entryRef);
    expect(input.bookings).toEqual([{ start: 600, end: 660 }]);
  });

  test('Unavailable request (630-690) also leaves bookings unchanged', () => {
    const input = makeInput(630, 690);

    const result = canBook(input);

    expect(result).toBe(false);
    expect(input.bookings).toEqual([{ start: 600, end: 660 }]);
  });

  test('frozen inputs: canBook never tries to write (ESM is strict, a write would throw)', () => {
    const input = makeInput(660, 720);
    input.bookings.forEach(Object.freeze);
    Object.freeze(input.bookings);
    Object.freeze(input);

    let result;
    expect(() => { result = canBook(input); }).not.toThrow();
    expect(result).toBe(true);
  });
});

describe('fixed time - decision depends only on supplied now', () => {
  test('same input gives the same decision at a different wall-clock time', () => {
    const first = canBook(makeInput(660, 720));
    vi.setSystemTime(new Date(2026, 0, 15, 6, 0, 0));
    const second = canBook(makeInput(660, 720));

    expect(first).toBe(true);
    expect(second).toBe(true);
  });
});
