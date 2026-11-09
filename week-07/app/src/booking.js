// canBook - the booking decision, extracted from checkAvailability() in the Week 06 page.
// start, end, now: minutes after midnight on the same day (600 = 10:00, 1440 = 24:00)
// blocked: true when the room is blocked
// bookings: the room's existing bookings, e.g. [{ start: 600, end: 660 }]
// returns true (Available) or false (Unavailable). It only reads its inputs.
export function canBook({ start, end, now, blocked, bookings }) {
  // AC1: 0 <= start < end <= 1440
  if (!(start >= 0 && start < end && end <= 1440)) return false;
  // AC1: start must be after the supplied current time
  if (start <= now) return false;
  // AC2: longer than 120 minutes is rejected
  if (end - start > 120) return false;
  // AC3: blocked room
  if (blocked) return false;
  // AC4: overlap with an existing booking; touching endpoints are allowed
  for (const b of bookings) {
    if (start < b.end && b.start < end) return false;
  }
  return true;
}
