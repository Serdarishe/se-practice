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
