// Booking rules (AC1-AC4) - the only place they are written. Pure: no DOM, only reads its inputs.
// start, end, now: minutes after midnight on the same day (600 = 10:00, 1440 = 24:00)
// blocked: true when the room is blocked
// bookings: the room's existing bookings, e.g. [{ start: 600, end: 660 }]

// checkBooking - the decision plus the first rule that fails, in the order AC1-AC4.
// returns { ok: true } or { ok: false, rule } where rule is
// 'interval' | 'past' (AC1), 'duration' (AC2), 'blocked' (AC3), 'overlap' (AC4, with the booking hit).
export function checkBooking({ start, end, now, blocked, bookings }) {
  if (!(0 <= start && start < end && end <= 1440)) return { ok: false, rule: 'interval' };
  if (!(start > now)) return { ok: false, rule: 'past' };
  if (end - start > 120) return { ok: false, rule: 'duration' };
  if (blocked) return { ok: false, rule: 'blocked' };
  const b = bookings.find(b => start < b.end && end > b.start);
  if (b) return { ok: false, rule: 'overlap', booking: { start: b.start, end: b.end } };
  return { ok: true };
}

// canBook - unchanged contract: true (Available) or false (Unavailable).
export function canBook(input) {
  return checkBooking(input).ok;
}
