// checkRoom: the availability check for ONE room of a catalog (F3, F5, B1-B4, AC5).
// Started from the assistant's suite (report.md 8.3) and extended with the unknown-id test.
// Fixed catalog: this file never reads the app's ROOMS, so demo data cannot change a result.
// Expected values come from AC1-AC5 and F3/F5 (README section 5), not from the code.
import { describe, it, expect } from 'vitest';
import { checkRoom } from './booking.js';

const NOW = 480; // 08:00

const ROOMS = [
  { id: 'r1', name: 'Alpha', capacity: 4, equipment: ['projector'], blocked: false, bookings: [{ start: 600, end: 660 }] },
  { id: 'r2', name: 'Beta', capacity: 8, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [] },
  { id: 'r3', name: 'Gamma', capacity: 10, equipment: [], blocked: true, bookings: [] },
];

describe('checkRoom', () => {
  it('F3 AC3: a blocked room is never available, the same slot in a free room is', () => {
    expect(checkRoom(ROOMS, 'r3', { start: 720, end: 780, now: NOW })).toBe(false);
    expect(checkRoom(ROOMS, 'r2', { start: 720, end: 780, now: NOW })).toBe(true);
  });

  it('F5: same times 600-660, two rooms, different result because each uses its own bookings', () => {
    const slot = { start: 600, end: 660, now: NOW };
    expect(checkRoom(ROOMS, 'r1', slot)).toBe(false);
    expect(checkRoom(ROOMS, 'r2', slot)).toBe(true);
  });

  it('B1 AC2: exactly 120 minutes (720-840) is available', () => {
    expect(checkRoom(ROOMS, 'r2', { start: 720, end: 840, now: NOW })).toBe(true);
  });

  it('B2 AC2: 121 minutes (720-841) is rejected', () => {
    expect(checkRoom(ROOMS, 'r2', { start: 720, end: 841, now: NOW })).toBe(false);
  });

  it('B3 AC4: touching the booking 600-660 at either end is available', () => {
    expect(checkRoom(ROOMS, 'r1', { start: 660, end: 720, now: NOW })).toBe(true);
    expect(checkRoom(ROOMS, 'r1', { start: 540, end: 600, now: NOW })).toBe(true);
  });

  it('B4 AC4: overlapping the booking 600-660 (630-690) is rejected', () => {
    expect(checkRoom(ROOMS, 'r1', { start: 630, end: 690, now: NOW })).toBe(false);
  });

  it('checkRoom: an unknown room id is never available', () => {
    expect(checkRoom(ROOMS, 'Z999', { start: 720, end: 780, now: NOW })).toBe(false);
  });

  it('AC5: checkRoom leaves the catalog unchanged', () => {
    const before = structuredClone(ROOMS);
    checkRoom(ROOMS, 'r1', { start: 660, end: 720, now: NOW });
    checkRoom(ROOMS, 'r2', { start: 720, end: 840, now: NOW });
    checkRoom(ROOMS, 'r3', { start: 600, end: 660, now: NOW });
    checkRoom(ROOMS, 'nope', { start: 600, end: 660, now: NOW });
    expect(ROOMS).toEqual(before);
  });
});
