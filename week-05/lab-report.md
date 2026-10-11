# Week 05 — Lab report

**Name:** Serdar Dundar
**Group:** Monday 16:00-19:00
**Date:** 2026-10-11

Fill in every section. **Do not delete, rename or renumber the headings** — the checker and the
grader find your answers by them. Add rows to any table; never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Assistant (tool) | Claude (Anthropic), agentic coding session in the Claude app |
| **Exact** model name | claude-opus-5-5 (Claude Opus 5.5) |
| Language and version | Python 3.13.16 |
| Path | A |
| My Week 04 declaration for touching bookings | allowed |

<!-- If your Week 04 model said touching bookings are NOT allowed: AC4 now says they are.
     One sentence here on what that changes in your Week 04 diagrams. This is a finding, not a penalty. -->

---

## 2. Task 1 — the plan

**The assistant's plan, pasted unedited:**

```text
Implementation plan for can_book(start, end, now, blocked, existing) in Python 3

Checks, in order. The function returns False at the first check that fails and
True only after all of them pass. No check has a side effect, so the order does
not change the result; the cheap checks go first and the loop goes last.

1. Time order and day bounds (AC1): require 0 <= start < end <= 1440.
   This rejects a negative start, a zero-length request (start == end),
   a reversed request (start > end) and an end after midnight (end > 1440).
2. Start is in the future (AC1): require start > now. Strict: start == now is rejected.
3. Duration (AC2): require end - start <= 120. Exactly 120 minutes is allowed, 121 is not.
4. Blocked room (AC3): if blocked is True, return False.
5. Overlap (AC4): for every (b_start, b_end) in existing, the request overlaps it when
   start < b_end and b_start < end. If any booking overlaps, return False.
   Intervals are half-open [start, end), so end == b_start and start == b_end
   are touching, not overlapping, and are allowed.
6. Return True (AC5).

Assumptions
- Inputs follow the contract: times are integers, now is in 0..1439, blocked is a
  Boolean, existing holds valid (start, end) tuples for this room's active bookings.
  The plan adds no validation of things the contract already guarantees.
- existing may be empty (then step 5 rejects nothing) and may be in any order.
  Every booking is examined; the list is only read, never sorted, stored or appended to.
- The function only decides. Saving the booking and the confirmation belong to the
  complete system, not to can_book.
- The result is a real Boolean (True or False), never None, 0/1 or a string.
- Open point, not decided by the contract: what happens when a time is not an
  integer (600.5 or "600"). The plan does not handle it; you need to decide.

Boundary cases that could expose an incorrect implementation
(base input: now=540, blocked=False, existing=[(600, 660)])
- Touching after: (660, 720) -> True. Touching before: (570, 600) -> True.
  Catches <= or >= in the overlap test.
- Overlap kinds: (630, 690) partial over the end, (570, 630) partial over the start,
  (615, 645) inside, (570, 690) contains, (600, 660) identical -> all False.
- Duration: (720, 840) is exactly 120 -> True; (720, 841) -> False.
- Start against now: (540, 570) -> False; (541, 571) -> True. Catches start >= now.
- Zero length (700, 700) -> False; reversed (720, 700) -> False.
- Day bounds: (1380, 1440) -> True; (1380, 1441) -> False.
- Blocked with an otherwise valid request: (660, 720), blocked=True -> False.
- existing=[] with a valid request -> True; several unsorted bookings where only
  the last one overlaps -> False. Catches a loop that stops after the first booking.
- A slot that fits exactly between two bookings: (660, 720) with
  [(600, 660), (720, 780)] -> True.
- After any call, existing is equal to what it was before the call.
```

**What the plan invented or changed.** One row for every rule in the plan that is not in the
contract or in AC1–AC5, or that says something different from them. If you found none, write one
row saying which lines of the plan you checked against which AC.

| # | What the plan said | What the contract or the AC says | What I did |
| --- | --- | --- | --- |
| 1 | Steps 1-6: `0 <= start < end <= 1440`, `start > now`, `end - start <= 120`, blocked -> False, overlap when `start < b_end and b_start < end`, then True | Step 1 and 2 are AC1 word for word, step 3 is AC2 ("at most 120"), step 4 is AC3, step 5 is AC4 plus "Intervals include the start and exclude the end", step 6 is AC5 | Checked every step against its AC. No invented rule found: no gap between bookings, no minimum duration, no sorting, no saving. Nothing to drop. |
| 2 | "The cheap checks go first and the loop goes last" | The contract and AC1-AC5 give no order for the checks | Not a rule, only an implementation choice. Kept, because every check is a pure comparison, so the order cannot change the returned value. |
| 3 | "The plan adds no validation of things the contract already guarantees" | Contract: "now is valid (0-1439). blocked is a Boolean. existing contains valid (start, end) tuples" | Agrees with the contract. Kept: I will reject any later suggestion to validate `now`, `blocked` or the tuples in `existing`. |
| 4 | "Open point ... what happens when a time is not an integer. The plan does not handle it; you need to decide" | Contract: "Times are integer minutes" and nothing about other types | The plan did not invent a rule here and left the decision to me. Decision is in section 9.2. |

**Boundary cases the assistant suggested that I kept as tests:**

- Touching before `(570, 600)` and the slot exactly between two bookings: `test_touching_start_is_allowed`,
  `test_slot_exactly_between_two_bookings_is_allowed`.
- The four other overlap kinds `(570, 630)`, `(615, 645)`, `(570, 690)`, `(600, 660)`:
  `test_overlap_over_the_start_is_rejected`, `test_request_inside_existing_is_rejected`,
  `test_request_containing_existing_is_rejected`, `test_identical_request_is_rejected`.
- `(541, 571)` one minute after now: `test_start_one_minute_after_now_is_allowed`.
- Zero length `(700, 700)` and reversed `(720, 700)`: `test_zero_length_is_rejected`,
  `test_reversed_times_are_rejected`.
- Day bounds `(1380, 1440)` and `(1380, 1441)`: `test_end_exactly_at_midnight_is_allowed`,
  `test_end_after_midnight_is_rejected`.
- `existing=[]`, and an unsorted list where only the last booking overlaps:
  `test_empty_existing_is_allowed`, `test_overlap_in_unsorted_list_is_rejected`.
- `existing` equal before and after the call: the three `test_existing_unchanged_...` tests.

Not from the plan, added from AC1-AC5 directly: `now=0` with start 0 and start 1, a start in the past,
a one-minute booking, a blocked room with no bookings, an overlap with the first and with the second of
several bookings, a free slot among three bookings.

---

## 3. Task 2 — the first version (v1), read before it was run

v1 is saved as `code/original/booking_v1.<ext>`, exactly as the assistant returned it: yes

**AC map.** One row per condition in v1. Quote the line.

| # | Line in v1 | AC it implements | Correct as written? If not, why |
| --- | --- | --- | --- |
| 1 | `if not (0 <= start < end <= 1440): return False` | AC1 (time order and day bounds) | Yes. The chained comparison rejects a negative start, `start == end`, `start > end` and `end > 1440`. `end == 1440` passes because of `<=`. |
| 2 | `if start <= now: return False` | AC1 (`start > now`) | Yes. `start == now` is rejected, `start == now + 1` passes. This is the exact negation of `start > now`. |
| 3 | `if end - start > 120: return False` | AC2 (at most 120 minutes) | Yes. Duration 120 is not greater than 120, so it passes; 121 is rejected. |
| 4 | `if blocked: return False` | AC3 (room is not blocked) | Yes. The contract says `blocked` is a Boolean, so truthiness is enough. |
| 5 | `for other_start, other_end in existing:` / `if start < other_end and other_start < end: return False` | AC4 (no overlap, touching allowed) | Yes, checked by hand on the README table against `(600, 660)`: `(630, 690)` gives 630 < 660 and 600 < 690, overlap; `(615, 645)` and `(570, 690)` also both true, overlap; `(660, 720)` gives 660 < 660 false, so no overlap. Both comparisons are strict, so touching on either side passes. The `return False` is inside the loop and `return True` is after it, so every booking is examined. |
| 6 | `return True` (last line, after the loop) | AC5 (True only when AC1-AC4 hold) | Yes. It is reachable only when none of rows 1-5 returned. Every return is the literal `True` or `False`. `existing` is only iterated, never sorted, appended to or reassigned. |

**What I expected to fail, written before the first run:** nothing. Reading v1 line by line I found no
condition that differs from its AC, so I expected all six table cases to pass. The places where a
one-character mistake would be invisible to a quick read are the comparison operators in rows 2, 3 and 5,
so those are the boundaries my tests in section 4 press on.

**Anything in v1 that no AC asks for** (extra validation, a buffer between bookings, logging,
saving the booking, a different return type):

- Nothing. v1 has no type checks, no validation of `now`, `blocked` or `existing`, no gap between
  bookings, no logging, no saving and no exception. Apart from the six conditions above it holds only a
  docstring and comments.

---

## 4. Task 3 — my tests

Base input for every row unless the row says otherwise: `now=540, blocked=False, existing=[(600, 660)]`.

| # | Test name | Request (start, end) | What differs from the base input | Expected | AC | Result on v1 | Result on final |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `test_touching_end_is_allowed` | `(660, 720)` | nothing | True | AC4 | pass | pass |
| 2 | `test_partial_overlap_is_rejected` | `(630, 690)` | nothing | False | AC4 | pass | pass |
| 3 | `test_blocked_room_is_rejected` | `(660, 720)` | `blocked=True` | False | AC3 | pass | pass |
| 4 | `test_exactly_two_hours_is_allowed` | `(720, 840)` | nothing | True | AC2 | pass | pass |
| 5 | `test_over_two_hours_is_rejected` | `(720, 841)` | nothing | False | AC2 | pass | pass |
| 6 | `test_start_equal_to_now_is_rejected` | `(540, 570)` | nothing | False | AC1 (`start > now`) | pass | pass |
| 7 | `test_zero_length_is_rejected` | `(700, 700)` | nothing | False | AC1 (`start < end`) | pass | pass |
| 8 | `test_reversed_times_are_rejected` | `(720, 700)` | nothing | False | AC1 (`start < end`) | pass | pass |
| 9 | `test_end_exactly_at_midnight_is_allowed` | `(1380, 1440)` | nothing | True | AC1 (`end <= 1440`) | pass | pass |
| 10 | `test_end_after_midnight_is_rejected` | `(1380, 1441)` | nothing | False | AC1 (`end <= 1440`) | pass | pass |
| 11 | `test_earliest_start_of_the_day_is_allowed` | `(1, 61)` | `now=0` | True | AC1 (`start > now`) | pass | pass |
| 12 | `test_start_zero_when_now_is_zero_is_rejected` | `(0, 60)` | `now=0` | False | AC1 (`start > now`) | pass | pass |
| 13 | `test_start_one_minute_after_now_is_allowed` | `(541, 571)` | nothing | True | AC1 (`start > now`) | pass | pass |
| 14 | `test_start_in_the_past_is_rejected` | `(500, 530)` | nothing | False | AC1 (`start > now`) | pass | pass |
| 15 | `test_one_minute_booking_is_allowed` | `(720, 721)` | nothing | True | AC1, AC2 (no minimum length) | pass | pass |
| 16 | `test_blocked_room_with_no_bookings_is_rejected` | `(660, 720)` | `blocked=True`, `existing=[]` | False | AC3 | pass | pass |
| 17 | `test_overlap_over_the_start_is_rejected` | `(570, 630)` | nothing | False | AC4 | pass | pass |
| 18 | `test_request_inside_existing_is_rejected` | `(615, 645)` | nothing | False | AC4 | pass | pass |
| 19 | `test_request_containing_existing_is_rejected` | `(570, 690)` | nothing | False | AC4 | pass | pass |
| 20 | `test_identical_request_is_rejected` | `(600, 660)` | nothing | False | AC4 | pass | pass |
| 21 | `test_touching_start_is_allowed` | `(570, 600)` | nothing | True | AC4 (touching allowed) | pass | pass |
| 22 | `test_slot_exactly_between_two_bookings_is_allowed` | `(660, 720)` | `existing=[(600, 660), (720, 780)]` | True | AC4 (touching allowed) | pass | pass |
| 23 | `test_empty_existing_is_allowed` | `(600, 660)` | `existing=[]` | True | AC4 | pass | pass |
| 24 | `test_overlap_with_second_booking_is_rejected` | `(720, 780)` | `existing=[(600, 660), (700, 760)]` | False | AC4 (every booking checked) | pass | pass |
| 25 | `test_overlap_with_first_of_several_is_rejected` | `(610, 650)` | `existing=[(600, 660), (900, 960)]` | False | AC4 (every booking checked) | pass | pass |
| 26 | `test_overlap_in_unsorted_list_is_rejected` | `(610, 650)` | `existing=[(900, 960), (600, 660)]` | False | AC4 (every booking checked) | pass | pass |
| 27 | `test_free_slot_among_three_bookings_is_allowed` | `(760, 800)` | `existing=[(600, 660), (700, 760), (800, 860)]` | True | AC4 | pass | pass |
| 28 | `test_existing_unchanged_after_accepted_request` | `(780, 840)` | `existing=[(900, 960), (600, 660), (700, 760)]` | `existing` equal to its copy made before the call | AC5 (never alter existing) | pass | pass |
| 29 | `test_existing_unchanged_after_rejected_request` | `(610, 650)` | `existing=[(900, 960), (600, 660), (700, 760)]` | `existing` equal to its copy made before the call | AC5 (never alter existing) | pass | pass |
| 30 | `test_existing_unchanged_when_room_is_blocked` | `(780, 840)` | `blocked=True`, `existing=[(900, 960), (600, 660), (700, 760)]` | `existing` equal to its copy made before the call | AC5 (never alter existing) | pass | pass |
| 31 | `test_last_two_hours_of_the_day_are_allowed` | `(1320, 1440)` | `now=1319`, `existing=[(1200, 1320)]` | True | AC1, AC2, AC4 (all four boundaries at once) | pass | pass |

---

## 5. Task 4 — debugging with evidence

One row per defect you found — in v1, in a later version, or in your own tests. If v1 passed
everything, the row is the **new edge case you added**, with expected and actual equal, and the
cause column says why no change was needed.

| # | Input (the full call) | Expected | Actual | Cause (quote the line) | Fix | Who proposed the fix |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `can_book(1320, 1440, 1319, False, [(1200, 1320)])` - the new edge case: the last two hours of the day, with all four boundaries at once | True. AC1: `0 <= 1320 < 1440 <= 1440` and `1320 > 1319`. AC2: 1440 - 1320 = 120. AC3: not blocked. AC4: only touches `(1200, 1320)` | True | No defect in v1. `if start < other_end and other_start < end` gives `1320 < 1320`, false, so the touching booking is not an overlap; `if end - start > 120` gives `120 > 120`, false; `if start <= now` gives `1320 <= 1319`, false; `end <= 1440` holds for 1440 | No change to `code/booking.py`. Kept as `test_last_two_hours_of_the_day_are_allowed` | Claude suggested the case; expected value worked out from AC1-AC4 before the call was run |
| 2 | `can_book(1380, 1441, 540, False, [(600, 660)])` | False (AC1: `end <= 1440`) | False on v1 | Defect in my tests, not in v1: with only the six table cases, fault **M2 (AC1)** survived. No table case ends after 1440 | Added `test_end_after_midnight_is_rejected`; M2 is now caught by it | Claude wrote the test from AC1; the checker only named the AC |
| 3 | `can_book(700, 700, 540, False, [(600, 660)])` | False (AC1: `start < end`) | False on v1 | Defect in my tests: fault **M3 (AC1)** survived the six table cases. No table case has `start == end` | Added `test_zero_length_is_rejected`; M3 is now caught by it and by nothing else | Claude wrote the test from AC1 |
| 4 | `can_book(720, 780, 540, False, [(600, 660), (700, 760)])` | False (AC4: overlaps the second booking) | False on v1 | Defect in my tests: fault **M7 (AC4)** survived. Every table case has exactly one booking in `existing`, so a function that looks at one booking only passes | Added `test_overlap_with_second_booking_is_rejected` and `test_overlap_in_unsorted_list_is_rejected`; M7 is now caught by both | Claude wrote the tests from AC4 |
| 5 | `can_book(570, 690, 540, False, [(600, 660)])` | False (AC4: contains the existing booking) | False on v1 | Defect in my tests: fault **M8 (AC4)** survived. The only overlap in the table cases is a partial one, `(630, 690)` | Added `test_request_containing_existing_is_rejected`; M8 is now caught by it and by nothing else | Claude wrote the test from the README overlap table |
| 6 | `existing = [(900, 960), (600, 660), (700, 760)]`, then `can_book(780, 840, 540, False, existing)` | `existing` still `[(900, 960), (600, 660), (700, 760)]` (AC5: never alter existing) | unchanged on v1 | Defect in my tests: faults **M9 and M10 (AC5)** survived. All six table cases assert only the returned value and never look at the list after the call | Added the three `test_existing_unchanged_...` tests; M9 is caught by the accepted-request one, M10 by the accepted and the rejected one | Claude wrote the tests from AC5 |

v1 passed the six table cases, the 24 boundary tests added after them and F1-F10, so rows 2-6 are holes in the test suite that the
checker run made when the suite held only the six table cases showed (19 PASS, 13 FAIL), not defects in the
function. No debug prompt was sent, because no call returned a wrong result.

**The debug prompt I sent, and the assistant's answer** (leave the block empty if you did not use it):

```text
```

---

## 6. Task 5 — the critique

**The assistant's critique, pasted unedited:**

```text
I found no line that violates AC1-AC5. The points below are the only places where the
code depends on something the contract promises rather than on something it checks.

1. Line: `if not (0 <= start < end <= 1440):`
   Concerns: contract line "Times are integer minutes after midnight on one date".
   The function never checks that start, end and now are integers. A float such as
   600.5 is compared like a number and can be accepted; a string such as "600" raises
   TypeError on this line, so the caller gets neither True nor False (contract line
   "Return True or False"). Suggestion: add a type check at the top and return False,
   or raise ValueError, for a non-integer time.

2. Line: `if blocked:`
   Concerns: AC3 and contract line "blocked is a Boolean".
   The test uses truthiness, so any truthy value (1, "no", a non-empty list) counts as
   blocked and any falsy value (0, None, "") counts as free. Suggestion: compare with
   `blocked is True`, or validate that blocked is a bool.

3. Line: `for other_start, other_end in existing:`
   Concerns: AC4 and contract line "existing contains valid (start, end) tuples".
   The loop trusts every tuple. A malformed booking such as (660, 600) can never make
   `start < other_end and other_start < end` true for a request that lies between its
   two numbers, so it would be silently ignored. Suggestion: validate each tuple
   (other_start < other_end) before using it.

4. Line: `if blocked:` (its position, after the AC1 and AC2 checks)
   Concerns: AC3.
   For a blocked room the function still evaluates AC1 and AC2 first. The result is
   the same, because no check has a side effect, so this is a readability point, not
   a defect. Suggestion: move the blocked check to the top.

Nothing to report for AC2 (`if end - start > 120:` allows exactly 120), for the overlap
test of AC4 (both comparisons are strict, so touching endpoints pass) or for AC5
(every return is a literal True or False and existing is only iterated).
```

| # | Suggestion | accept / reject | Reason — cite the AC or the contract line | Suite after the change |
| --- | --- | --- | --- | --- |
| 1 | Add a type check for non-integer times and return False or raise ValueError | reject | Contract: "Times are integer minutes", so this would check something the contract already promises. Raising an exception would break the contract line "Return True or False" and AC5 "Return False otherwise". Returning False for a float would be a new rule that no AC states. What the function does outside the contract is declared in section 9.2 instead of being coded. | no change made; 31 tests, OK |
| 2 | Replace `if blocked:` with `blocked is True` or validate that it is a bool | reject | Contract: "blocked is a Boolean". For `True` and `False` truthiness gives exactly AC3. The stricter form changes nothing for any input the contract allows. | no change made; 31 tests, OK |
| 3 | Validate each tuple in `existing` (`other_start < other_end`) | reject | Contract: "existing contains valid (start, end) tuples". This is the invented validation the plan review (section 2, row 3) already ruled out, and no AC says what to return for an invalid booking. | no change made; 31 tests, OK |
| 4 | Move the blocked check to the top | reject | AC1-AC5 give no order for the checks and AC5 only asks that all four hold. The returned value is identical for every input, so it is a change with no AC behind it and no test that could move. | no change made; 31 tests, OK |

---

## 7. Change log — v1 to final

| # | What changed (the line, before → after) | Why | Evidence: the test or check that moved |
| --- | --- | --- | --- |
| 1 | Nothing. `code/booking.py` is the same as `code/original/booking_v1.py`, line for line | v1 passed the six table cases, the 25 further tests and F1-F10, so section 5 holds no defect of the function, and all four critique points in section 6 were rejected because each one asked for something the contract already guarantees or no AC asks for | No test or check moved on the function. Checker line: `v1 (code/original/booking_v1.py): passes F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 - fails nothing - identical to your final: yes`. What moved was the suite: M2, M3, M7, M8, M9, M10 went from FAIL to PASS between the run with the six table cases and the run with the boundary tests |

---

## 8. Evidence — real output

### 8.1 My suite, final run

Paste the **complete** terminal output. For Python: everything `python -m unittest -v` printed.

```text
test_blocked_room_is_rejected (test_booking.BookingTests.test_blocked_room_is_rejected) ... ok
test_blocked_room_with_no_bookings_is_rejected (test_booking.BookingTests.test_blocked_room_with_no_bookings_is_rejected) ... ok
test_earliest_start_of_the_day_is_allowed (test_booking.BookingTests.test_earliest_start_of_the_day_is_allowed) ... ok
test_empty_existing_is_allowed (test_booking.BookingTests.test_empty_existing_is_allowed) ... ok
test_end_after_midnight_is_rejected (test_booking.BookingTests.test_end_after_midnight_is_rejected) ... ok
test_end_exactly_at_midnight_is_allowed (test_booking.BookingTests.test_end_exactly_at_midnight_is_allowed) ... ok
test_exactly_two_hours_is_allowed (test_booking.BookingTests.test_exactly_two_hours_is_allowed) ... ok
test_existing_unchanged_after_accepted_request (test_booking.BookingTests.test_existing_unchanged_after_accepted_request) ... ok
test_existing_unchanged_after_rejected_request (test_booking.BookingTests.test_existing_unchanged_after_rejected_request) ... ok
test_existing_unchanged_when_room_is_blocked (test_booking.BookingTests.test_existing_unchanged_when_room_is_blocked) ... ok
test_free_slot_among_three_bookings_is_allowed (test_booking.BookingTests.test_free_slot_among_three_bookings_is_allowed) ... ok
test_identical_request_is_rejected (test_booking.BookingTests.test_identical_request_is_rejected) ... ok
test_last_two_hours_of_the_day_are_allowed (test_booking.BookingTests.test_last_two_hours_of_the_day_are_allowed) ... ok
test_one_minute_booking_is_allowed (test_booking.BookingTests.test_one_minute_booking_is_allowed) ... ok
test_over_two_hours_is_rejected (test_booking.BookingTests.test_over_two_hours_is_rejected) ... ok
test_overlap_in_unsorted_list_is_rejected (test_booking.BookingTests.test_overlap_in_unsorted_list_is_rejected) ... ok
test_overlap_over_the_start_is_rejected (test_booking.BookingTests.test_overlap_over_the_start_is_rejected) ... ok
test_overlap_with_first_of_several_is_rejected (test_booking.BookingTests.test_overlap_with_first_of_several_is_rejected) ... ok
test_overlap_with_second_booking_is_rejected (test_booking.BookingTests.test_overlap_with_second_booking_is_rejected) ... ok
test_partial_overlap_is_rejected (test_booking.BookingTests.test_partial_overlap_is_rejected) ... ok
test_request_containing_existing_is_rejected (test_booking.BookingTests.test_request_containing_existing_is_rejected) ... ok
test_request_inside_existing_is_rejected (test_booking.BookingTests.test_request_inside_existing_is_rejected) ... ok
test_reversed_times_are_rejected (test_booking.BookingTests.test_reversed_times_are_rejected) ... ok
test_slot_exactly_between_two_bookings_is_allowed (test_booking.BookingTests.test_slot_exactly_between_two_bookings_is_allowed) ... ok
test_start_equal_to_now_is_rejected (test_booking.BookingTests.test_start_equal_to_now_is_rejected) ... ok
test_start_in_the_past_is_rejected (test_booking.BookingTests.test_start_in_the_past_is_rejected) ... ok
test_start_one_minute_after_now_is_allowed (test_booking.BookingTests.test_start_one_minute_after_now_is_allowed) ... ok
test_start_zero_when_now_is_zero_is_rejected (test_booking.BookingTests.test_start_zero_when_now_is_zero_is_rejected) ... ok
test_touching_end_is_allowed (test_booking.BookingTests.test_touching_end_is_allowed) ... ok
test_touching_start_is_allowed (test_booking.BookingTests.test_touching_start_is_allowed) ... ok
test_zero_length_is_rejected (test_booking.BookingTests.test_zero_length_is_rejected) ... ok

----------------------------------------------------------------------
Ran 31 tests in 0.001s

OK
```

### 8.2 The checker, final run

Paste the **complete** output of `python tests/check_booking.py`. Paste it **last**: if you edit
this file afterwards, run the checker again and paste again.

```text
Week 05 - can_book: the function, your tests, the evidence   (Path A)

PASS   F1   the six cases from the task table           6 of 6 cases
PASS   F2   AC1 time order and day bounds               5 of 5 cases
PASS   F3   AC1 the start is in the future              5 of 5 cases
PASS   F4   AC2 at most 120 minutes                     3 of 3 cases
PASS   F5   AC3 a blocked room accepts nothing          2 of 2 cases
PASS   F6   AC4 every kind of overlap is rejected       5 of 5 cases
PASS   F7   AC4 touching endpoints are allowed          3 of 3 cases
PASS   F8   AC4 every existing booking is checked       4 of 4 cases
PASS   F9   AC5 the result is a real Boolean            3 of 3 cases
PASS   F10  AC5 the inputs are left unchanged           2 of 2 cases
PASS   O1   the assistant's first version is kept       v1 kept (26 lines)
PASS   S1   your suite has at least 11 tests            31 tests
PASS   S2   your suite is green on your own code        31 tests, OK
PASS   M1   your tests catch a fault in AC1             caught by test_start_equal_to_now_is_rejected, test_start_zero_when_now_is_zero_is_rejected
PASS   M2   your tests catch a fault in AC1             caught by test_end_after_midnight_is_rejected
PASS   M3   your tests catch a fault in AC1             caught by test_zero_length_is_rejected
PASS   M4   your tests catch a fault in AC2             caught by test_exactly_two_hours_is_allowed, test_last_two_hours_of_the_day_are_allowed
PASS   M5   your tests catch a fault in AC3             caught by test_blocked_room_is_rejected, test_blocked_room_with_no_bookings_is_rejected
PASS   M6   your tests catch a fault in AC4             caught by test_free_slot_among_three_bookings_is_allowed, test_last_two_hours_of_the_day_are_allowed, test_slot_exactly_between_two_bookings_is_allowed and 2 more
PASS   M7   your tests catch a fault in AC4             caught by test_overlap_in_unsorted_list_is_rejected, test_overlap_with_second_booking_is_rejected
PASS   M8   your tests catch a fault in AC4             caught by test_request_containing_existing_is_rejected
PASS   M9   your tests catch a fault in AC5             caught by test_existing_unchanged_after_accepted_request
PASS   M10  your tests catch a fault in AC5             caught by test_existing_unchanged_after_accepted_request, test_existing_unchanged_after_rejected_request
PASS   L1   report 1: tool, model and language          tool, model and language recorded
PASS   L2   report 2: the plan, and what you corrected  plan pasted, 4 row(s) on what you corrected or verified
PASS   L3   report 3: v1 mapped to AC1-AC4              6 conditions mapped, AC1-AC4 all present
PASS   L4   report 4: at least 11 of your tests listed  31 tests listed
PASS   L5   report 5: debugging evidence                6 row(s) of input / expected / actual
PASS   L6   report 6: the critique, each point judged   critique pasted, 4 points judged
PASS   L7   report 7: change log                        1 change-log row(s)
PASS   L8   report 8.1: real output of your suite       suite output pasted
PASS   L9   report 10: conclusion of 120-180 words      167 words
------------------------------------------------------------------------------
v1 (code/original/booking_v1.py): passes F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 - fails nothing - identical to your final: yes
SUMMARY pass=32 fail=0 error=0   (32 checks)
Behaviour and shape are clean. This says nothing about the quality of your review.
```

### 8.3 Path B only — three faults I planted myself

Break your own function on purpose, one line at a time, run your suite, restore the line.

| # | Line I changed (before → after) | AC it breaks | Test that failed |
| --- | --- | --- | --- |
| 1 | | | |
| 2 | | | |
| 3 | | | |

The three failing runs (Path A students leave this block empty):

```text
```

---

## 9. What still fails, and what the contract does not say

### 9.1 Checks I am keeping as FAIL or ERROR

The same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| none | The run is clean: every check is PASS, so `known_fails` in `submission.yml` is empty. |

### 9.2 Outside the contract

The contract says times are integers. It does not say what `can_book` does when one is not —
`600.5`, or the string `"600"`. What does **your** function do, and why is that the right call?

- It does not handle them (`not-handled` in `submission.yml`). A float is compared like any other
  number: `can_book(600.5, 660, 540, False, [])` returns `True`. A string stops at the first
  comparison: `can_book("600", 660, 540, False, [])` raises
  `TypeError: '<=' not supported between instances of 'int' and 'str'`.
- Why I keep it that way: the contract promises integer minutes, so a non-integer time is a mistake of
  the caller, not a booking decision. Returning `False` for it would hide that mistake behind an answer
  that reads as "this slot is not available". AC5's "Return False otherwise" is about requests that
  break AC1-AC4, and none of them mentions types. A type check would also be code that no AC asks for,
  which is why critique point 1 was rejected in section 6.
- The weak side of this decision is the float: `600.5` is accepted silently instead of failing loudly
  like the string does. I accept that, because the system that calls `can_book` builds its times as
  integer minutes.

### 9.3 A bound that never decides

One of the bounds written in AC1 can never be the *only* reason a request is rejected. Which one,
and why?

- The lower bound, `0 <= start`. The contract says `now` is between 0 and 1439, and AC1 also asks for
  `start > now`. So every start below 0 is also not greater than `now` and is already rejected by
  `start > now`; the smallest start that can ever be accepted is 1.
- That is why my suite has no test with a negative start. `(-30, 30)` with `now=540` is rejected by
  `start > now` even if `0 <=` is deleted from the function, so such a test could not tell the two
  versions apart. The other bounds can each decide alone: `(1380, 1441)` is rejected only by
  `end <= 1440`, and `(700, 700)` only by `start < end`.

---

## 10. Conclusion (120–180 words)

<!-- Answer all three, in your own words, without the assistant:
     (a) Explain the overlap condition in your final code — why those two comparisons, and why
         they let touching bookings through.
     (b) Which fault did your tests miss the longest, and what did the missing test have in common
         with the ones you already had?
     (c) What did you have to decide that neither the contract nor the assistant decided for you?
     Worthless: "the AI made a mistake and I fixed it."
     Worth everything: "F7 failed on can_book(570, 600, ...): v1 compared with <= on the start
     side, so a booking that ends exactly when another begins was rejected." -->

<!-- Write your conclusion below this line -->

The overlap test in my final code is `start < other_end and other_start < end`. Two half-open
intervals share a minute only when each one starts before the other one ends, so both comparisons are
needed. Both are strict because the end minute is excluded: for `(660, 720)` against `(600, 660)` the
first comparison is `660 < 660`, false, so touching bookings pass.

The function itself had no fault, v1 passed F1-F10. My six table tests missed M2, M3, M7, M8, M9 and
M10, and all six were closed together by the boundary tests, so none lasted longer than the others.
The tests I already had all shared one shape: one booking in `existing` and an assertion on the
returned value only, so nothing looked at a second booking or at the list after the call.

What I had to decide myself was a non-integer time. The contract is silent and the plan left it open,
so I declared `not-handled` and rejected the type check from the critique.