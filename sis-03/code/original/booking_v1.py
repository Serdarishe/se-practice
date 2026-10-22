def can_book(start, end, now, blocked, existing):
    """Return True only when the request satisfies AC1-AC4; never modifies existing."""
    # AC3: a blocked room rejects every request
    if blocked:
        return False

    # AC1: integer minutes (bool is excluded, it is a subclass of int)
    for value in (start, end):
        if not isinstance(value, int) or isinstance(value, bool):
            return False

    # AC1: inside the day and in the right order
    if not (0 <= start < end <= 1440):
        return False

    # AC1: the start must be strictly after now
    if start <= now:
        return False

    # AC2: at most 120 minutes, exactly 120 is allowed
    if end - start > 120:
        return False

    # AC4: half-open intervals [start, end) and [b_start, b_end) overlap
    # only when each one starts before the other ends; touching is allowed
    for b_start, b_end in existing:
        if start < b_end and b_start < end:
            return False

    return True
