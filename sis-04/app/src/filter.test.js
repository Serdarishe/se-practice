// filterRooms: F1 capacity, F2 ALL selected equipment, F4 empty result, B5/B6 capacity boundary,
// and INT: filterRooms, then checkRoom on what it returned.
// Started from the assistant's suite (report.md 8.3); the F4 equipment case and the
// no-change test were added by me. Fixed catalog: the app's ROOMS is never read here.
import { describe, it, expect } from 'vitest';
import { filterRooms } from './filter.js';
import { checkRoom } from './booking.js';

const ROOMS = [
  { id: 'a', name: 'Small', capacity: 4, equipment: ['projector'], blocked: false, bookings: [] },
  { id: 'b', name: 'Medium', capacity: 6, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [{ start: 600, end: 660 }] },
  { id: 'c', name: 'Large', capacity: 12, equipment: ['whiteboard'], blocked: true, bookings: [] },
];

const ids = (rooms) => rooms.map((r) => r.id);

describe('filterRooms', () => {
  it('F1: 5 attendees keeps only rooms with capacity >= 5 (b: 6, c: 12), blocked rooms stay', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 5, equipment: [] }))).toEqual(['b', 'c']);
  });

  it('F2: projector + whiteboard keeps only the room that has ALL of them (b), not rooms with one (a, c)', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 1, equipment: ['projector', 'whiteboard'] }))).toEqual(['b']);
  });

  it('F4: 20 attendees matches no room, so the result is an empty list', () => {
    expect(filterRooms(ROOMS, { attendees: 20, equipment: [] })).toEqual([]);
  });

  it('F4 F2: equipment that no room has (computers) gives an empty list', () => {
    expect(filterRooms(ROOMS, { attendees: 1, equipment: ['computers'] })).toEqual([]);
  });

  it('B5 F1: capacity 6 with exactly 6 attendees is included', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 6, equipment: [] }))).toContain('b');
  });

  it('B6 F1: capacity 6 with 7 attendees (one more than the capacity) is excluded', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 7, equipment: [] }))).not.toContain('b');
  });

  it('filterRooms: returns a new list and leaves the catalog unchanged', () => {
    const before = structuredClone(ROOMS);
    filterRooms(ROOMS, { attendees: 5, equipment: ['projector'] });
    expect(ROOMS).toEqual(before);
  });

  it('INT: filterRooms (5 people, projector) returns b, then checkRoom on b: 660-720 touches 600-660 and is available', () => {
    const found = filterRooms(ROOMS, { attendees: 5, equipment: ['projector'] });
    expect(ids(found)).toEqual(['b']);
    expect(checkRoom(ROOMS, found[0].id, { start: 660, end: 720, now: 480 })).toBe(true);
  });
});
