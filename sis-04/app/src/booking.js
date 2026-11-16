// canBook - the booking decision, extracted from checkAvailability() in the Week 06 page.
// start, end, now: minutes after midnight on the same day (600 = 10:00, 1440 = 24:00)
// blocked: true when the room is blocked
// bookings: the room's existing bookings, e.g. [{ start: 600, end: 660 }]
// returns true (Available) or false (Unavailable). It only reads its inputs.
export function canBook({ start, end, now, blocked, bookings }) {
  if (!(0 <= start && start < end && end <= 1440)) return false;
  if (!(start > now)) return false;
  if (end - start > 120) return false;
  if (blocked) return false;
  for (const b of bookings) {
    if (start < b.end && end > b.start) return false;
  }
  return true;
}

// The one place that looks a room up by its id (undefined when there is none).
function findRoom(rooms, roomId) {
  return rooms.find((r) => r.id === roomId);
}

// checkRoom - the availability check for one room of a catalog (F3, F5).
// Finds the room by id and asks canBook with THAT room's own blocked flag and bookings.
// An unknown id is not available. It only reads its inputs (AC5).
export function checkRoom(rooms, roomId, { start, end, now }) {
  const room = findRoom(rooms, roomId);
  if (!room) return false;
  return canBook({ start, end, now, blocked: room.blocked, bookings: room.bookings });
}

// unavailableReason - WHY a request is Unavailable, so the page can explain it (AC6) without a
// rule of its own. null when checkRoom says Available. The decision always comes from checkRoom;
// this only names the first failed rule, in the Week 06 order AC1, AC2, AC3, AC4.
// The overlapping booking is found by asking canBook about each booking on its own, so the
// overlap comparison exists only in canBook.
export function unavailableReason(rooms, roomId, { start, end, now }) {
  const room = findRoom(rooms, roomId);
  if (!room) return { code: "NO_ROOM" };
  if (checkRoom(rooms, roomId, { start, end, now })) return null;
  if (!(0 <= start && start < end && end <= 1440)) return { code: "AC1_ORDER" };
  if (!(start > now)) return { code: "AC1_PAST", now };
  if (end - start > 120) return { code: "AC2", minutes: end - start };
  if (room.blocked) return { code: "AC3" };
  const booking = room.bookings.find((b) => !canBook({ start, end, now, blocked: false, bookings: [b] }));
  return { code: "AC4", booking };
}
