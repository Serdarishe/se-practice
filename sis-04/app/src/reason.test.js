// unavailableReason: which rule an Unavailable result failed, so the page can say why (AC6)
// without repeating any rule itself. The decision still comes from checkRoom; these tests pin
// the reason to the same cases. Order of reasons as in the Week 06 page: AC1, AC2, AC3, AC4.
// Fixed catalog: the app's ROOMS is never read here.
import { describe, it, expect } from 'vitest';
import { checkRoom, unavailableReason } from './booking.js';

const NOW = 540; // 09:00

const ROOMS = [
  { id: 'free', name: 'Free', capacity: 10, equipment: [], blocked: false, bookings: [{ start: 600, end: 660 }] },
  { id: 'shut', name: 'Shut', capacity: 10, equipment: [], blocked: true, bookings: [] },
];

describe('unavailableReason', () => {
  it('M1 AC1: end before start (720-700) gives AC1_ORDER', () => {
    expect(unavailableReason(ROOMS, 'free', { start: 720, end: 700, now: NOW })).toEqual({ code: 'AC1_ORDER' });
  });

  it('M2 AC1: a start at or before now (540-570) gives AC1_PAST with the current time', () => {
    expect(unavailableReason(ROOMS, 'free', { start: 540, end: 570, now: NOW })).toEqual({ code: 'AC1_PAST', now: 540 });
  });

  it('M3 AC2: 720-870 (150 minutes) gives AC2 with the length', () => {
    expect(unavailableReason(ROOMS, 'free', { start: 720, end: 870, now: NOW })).toEqual({ code: 'AC2', minutes: 150 });
  });

  it('M4 AC3: a valid slot in a blocked room gives AC3', () => {
    expect(unavailableReason(ROOMS, 'shut', { start: 720, end: 780, now: NOW })).toEqual({ code: 'AC3' });
  });

  it('M5 AC4: 630-690 gives AC4 and names the booking it overlaps (600-660)', () => {
    expect(unavailableReason(ROOMS, 'free', { start: 630, end: 690, now: NOW }))
      .toEqual({ code: 'AC4', booking: { start: 600, end: 660 } });
  });

  it('M6 AC4: touching 660-720 is available, so there is no reason (null) and checkRoom says true', () => {
    expect(checkRoom(ROOMS, 'free', { start: 660, end: 720, now: NOW })).toBe(true);
    expect(unavailableReason(ROOMS, 'free', { start: 660, end: 720, now: NOW })).toBe(null);
  });

  it('M7: an unknown room id gives NO_ROOM', () => {
    expect(unavailableReason(ROOMS, 'X1', { start: 720, end: 780, now: NOW })).toEqual({ code: 'NO_ROOM' });
  });
});
