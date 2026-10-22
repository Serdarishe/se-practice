DAY_END = 1440      # minutes in a day; a booking may end exactly at midnight (AC1)
MAX_DURATION = 120  # minutes; exactly 120 is allowed (AC2)


def _is_minute(value):
    # bool is a subclass of int in Python, so exclude it explicitly
    return isinstance(value, int) and not isinstance(value, bool)


def can_book(start, end, now, blocked, existing):
    """Return True only when AC1-AC4 all hold. Never changes `existing`.

    start, end - integer minutes after midnight, interval is [start, end)
    now        - current minute (0-1439), the start must be strictly after it
    blocked    - True when the selected room accepts no requests
    existing   - collection of (start, end) pairs, read only
    """
    # AC3: a blocked room rejects every request
    if blocked:
        return False

    # AC1: integer minutes, 0 <= start < end <= 1440, start strictly after now
    if not (_is_minute(start) and _is_minute(end)):
        return False
    if not (0 <= start < end <= DAY_END):
        return False
    if start <= now:
        return False

    # AC2: at most 120 minutes
    if end - start > MAX_DURATION:
        return False

    # AC4: [start, end) overlaps [b_start, b_end) only when each starts before the other ends;
    # touching at an endpoint is not overlap
    for b_start, b_end in existing:
        if start < b_end and b_start < end:
            return False

    return True
