def can_book(start, end, now, blocked, existing):
    """Return True if the request [start, end) may be booked, otherwise False."""
    # AC1: the request has a positive length and lies inside one day.
    if not (0 <= start < end <= 1440):
        return False

    # AC1: the request starts strictly after the current time.
    if start <= now:
        return False

    # AC2: the duration is at most 120 minutes (exactly 120 is allowed).
    if end - start > 120:
        return False

    # AC3: a blocked room accepts no booking.
    if blocked:
        return False

    # AC4: half-open intervals overlap only when each one starts before the
    # other one ends. Touching endpoints are not an overlap.
    for other_start, other_end in existing:
        if start < other_end and other_start < end:
            return False

    # AC5: all of AC1-AC4 hold. existing was only read, never changed.
    return True
