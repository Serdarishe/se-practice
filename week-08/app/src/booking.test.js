// Final suite for canBook (Practice #07). Started from the assistant's first suite
// (suites/first/booking.test.js) and revised after the review in lab-report.md section 5.
// Expected values come from AC1-AC4 and the plan in lab-report.md section 3, not from the code.
import { describe, test, expect } from 'vitest';
import { canBook } from './booking';

// Fresh default fixture for every call: now 09:00, not blocked, one booking 10:00-11:00.
function fixture(start, end, changes = {}) {
  return { start, end, now: 540, blocked: false, bookings: [{ start: 600, end: 660 }], ...changes };
}

// Calls the real canBook and also checks that the call did not change the input (AC5).
function decide(input) {
  const before = JSON.stringify(input);
  const result = canBook(input);
  expect(JSON.stringify(input)).toBe(before);
  return result;
}

describe('AC1 - valid interval after the supplied current time', () => {
  test('T02 AC1: 540-570 starts exactly at now (540) is rejected', () => {
    expect(decide(fixture(540, 570))).toBe(false);
  });

  test('T03 AC1: 720-720 zero duration is rejected', () => {
    expect(decide(fixture(720, 720))).toBe(false);
  });

  test('T04 AC1: 750-720 reversed interval is rejected', () => {
    expect(decide(fixture(750, 720))).toBe(false);
  });

  test('T05 AC1: 1380-1441 ends one minute after 24:00 and is rejected', () => {
    expect(decide(fixture(1380, 1441))).toBe(false);
  });

  test('X1 AC1 AC2: 1320-1440 ends exactly at 24:00 with 120 minutes and is accepted', () => {
    expect(decide(fixture(1320, 1440))).toBe(true);
  });

  // Added after the improvement review (lab-report.md 6.2): the accept side next to T02.
  test('B1 AC1: 541-571 starts one minute after now and is accepted', () => {
    expect(decide(fixture(541, 571))).toBe(true);
  });

  test('B2 AC1: 530-570 starts before now (540) but ends after it and is rejected', () => {
    expect(decide(fixture(530, 570))).toBe(false);
  });
});

describe('AC2 - at most 120 minutes', () => {
  test('T06 AC2: 720-840 is exactly 120 minutes and is accepted', () => {
    expect(decide(fixture(720, 840))).toBe(true);
  });

  test('T07 AC2: 720-841 is 121 minutes and is rejected', () => {
    expect(decide(fixture(720, 841))).toBe(false);
  });
});

describe('AC3 - blocked room', () => {
  test('T13 AC3: 660-720 in a blocked room is rejected', () => {
    expect(decide(fixture(660, 720, { blocked: true }))).toBe(false);
  });
});

describe('AC4 - no overlap, touching endpoints allowed', () => {
  test('T01 AC4: 660-720 touches the end of 600-660 and is accepted', () => {
    expect(decide(fixture(660, 720))).toBe(true);
  });

  test('T08 AC4: 570-600 touches the start of 600-660 and is accepted', () => {
    expect(decide(fixture(570, 600))).toBe(true);
  });

  test('T09 AC4: 630-690 partly overlaps 600-660 and is rejected', () => {
    expect(decide(fixture(630, 690))).toBe(false);
  });

  test('T10 AC4: 570-690 contains the whole booking 600-660 and is rejected', () => {
    expect(decide(fixture(570, 690))).toBe(false);
  });

  test('T11 AC4: 615-645 lies inside 600-660 and is rejected', () => {
    expect(decide(fixture(615, 645))).toBe(false);
  });

  test('T12 AC4: 600-660 is identical to the booking and is rejected', () => {
    expect(decide(fixture(600, 660))).toBe(false);
  });

  test('T14 AC4: 630-690 with no bookings ([]) is accepted', () => {
    expect(decide(fixture(630, 690, { bookings: [] }))).toBe(true);
  });

  test('X2 AC4: 660-750 touches 600-660 but overlaps the second booking 720-780 and is rejected', () => {
    const bookings = [{ start: 600, end: 660 }, { start: 720, end: 780 }];
    expect(decide(fixture(660, 750, { bookings }))).toBe(false);
  });

  // Added after the improvement review (lab-report.md 6.2): 1-minute overlaps and two bookings.
  test('B3 AC4: 659-719 overlaps the end of 600-660 by one minute and is rejected', () => {
    expect(decide(fixture(659, 719))).toBe(false);
  });

  test('B4 AC4: 571-601 overlaps the start of 600-660 by one minute and is rejected', () => {
    expect(decide(fixture(571, 601))).toBe(false);
  });

  test('B5 AC4: 630-690 with unsorted bookings [720-780, 600-660] overlaps the later entry and is rejected', () => {
    const bookings = [{ start: 720, end: 780 }, { start: 600, end: 660 }];
    expect(decide(fixture(630, 690, { bookings }))).toBe(false);
  });

  test('B6 AC4: 660-720 fills the gap between 600-660 and 720-780, touching both, and is accepted', () => {
    const bookings = [{ start: 600, end: 660 }, { start: 720, end: 780 }];
    expect(decide(fixture(660, 720, { bookings }))).toBe(true);
  });
});

describe('AC5 - decision only, existing bookings unchanged', () => {
  test('AC5: an Available request (660-720) leaves the bookings exactly as before', () => {
    const bookings = [{ start: 600, end: 660 }];
    const before = structuredClone(bookings);

    const result = canBook({ start: 660, end: 720, now: 540, blocked: false, bookings });

    expect(result).toBe(true);
    expect(bookings).toStrictEqual(before);
    expect(bookings).toHaveLength(1);
  });
});

describe('Week 08 regression tests', () => {
  // BUG-A only: canBook is called directly (no data check), so BUG-B cannot make this test fail.
  test('BUG-A AC4: 1380-1440 touches the end of 1320-1380 and ends at 24:00, so it is Available', () => {
    const result = canBook({ start: 1380, end: 1440, now: 540, blocked: false, bookings: [{ start: 1320, end: 1380 }] });
    expect(result).toBe(true);
  });

  // BUG-B only: 720-780 touches nothing (the booking is 600-660), so BUG-A cannot reject it first.
  test('BUG-B AC5: an Available request 720-780 that touches nothing leaves the bookings unchanged', () => {
    const bookings = [{ start: 600, end: 660 }];
    const before = structuredClone(bookings);

    const result = canBook({ start: 720, end: 780, now: 540, blocked: false, bookings });

    expect(result).toBe(true);
    expect(bookings).toStrictEqual(before);
  });
});
