import unittest
from booking import can_book


class BookingTests(unittest.TestCase):
    # Base input from the task: now=540, blocked=False, existing=[(600, 660)].

    # ---- the six cases from the task table ----

    def test_touching_end_is_allowed(self):
        result = can_book(660, 720, 540, False, [(600, 660)])
        self.assertIs(result, True)

    def test_partial_overlap_is_rejected(self):
        # AC4: 630-690 shares 630-660 with the existing booking.
        result = can_book(630, 690, 540, False, [(600, 660)])
        self.assertIs(result, False)

    def test_blocked_room_is_rejected(self):
        # AC3: the same request is accepted when blocked=False (first test).
        result = can_book(660, 720, 540, True, [(600, 660)])
        self.assertIs(result, False)

    def test_exactly_two_hours_is_allowed(self):
        # AC2: 840 - 720 = 120, and "at most 120" includes 120.
        result = can_book(720, 840, 540, False, [(600, 660)])
        self.assertIs(result, True)

    def test_over_two_hours_is_rejected(self):
        # AC2: 841 - 720 = 121.
        result = can_book(720, 841, 540, False, [(600, 660)])
        self.assertIs(result, False)

    def test_start_equal_to_now_is_rejected(self):
        # AC1: start > now is strict, 540 > 540 is false.
        result = can_book(540, 570, 540, False, [(600, 660)])
        self.assertIs(result, False)

    # ---- AC1: zero-length and reversed times ----

    def test_zero_length_is_rejected(self):
        # AC1: start < end is strict. 700-700 is after now, 0 minutes long,
        # not blocked and overlaps nothing, so only the order rule rejects it.
        result = can_book(700, 700, 540, False, [(600, 660)])
        self.assertIs(result, False)

    def test_reversed_times_are_rejected(self):
        # AC1: start < end. 720-700 breaks no other rule.
        result = can_book(720, 700, 540, False, [(600, 660)])
        self.assertIs(result, False)

    # ---- AC1: the day bounds ----

    def test_end_exactly_at_midnight_is_allowed(self):
        # AC1: end <= 1440 includes 1440.
        result = can_book(1380, 1440, 540, False, [(600, 660)])
        self.assertIs(result, True)

    def test_end_after_midnight_is_rejected(self):
        # AC1: end <= 1440. 61 minutes long, so AC2 does not reject it.
        result = can_book(1380, 1441, 540, False, [(600, 660)])
        self.assertIs(result, False)

    def test_earliest_start_of_the_day_is_allowed(self):
        # AC1: with now=0 the first start that satisfies start > now is 1.
        result = can_book(1, 61, 0, False, [(600, 660)])
        self.assertIs(result, True)

    def test_start_zero_when_now_is_zero_is_rejected(self):
        # AC1: start > now, 0 > 0 is false.
        result = can_book(0, 60, 0, False, [(600, 660)])
        self.assertIs(result, False)

    # ---- AC1: the start is in the future ----

    def test_start_one_minute_after_now_is_allowed(self):
        # AC1: 541 > 540.
        result = can_book(541, 571, 540, False, [(600, 660)])
        self.assertIs(result, True)

    def test_start_in_the_past_is_rejected(self):
        # AC1: 500 > 540 is false. 500-530 breaks no other rule.
        result = can_book(500, 530, 540, False, [(600, 660)])
        self.assertIs(result, False)

    # ---- AC2: duration ----

    def test_one_minute_booking_is_allowed(self):
        # AC1 and AC2 give no minimum length other than start < end.
        result = can_book(720, 721, 540, False, [(600, 660)])
        self.assertIs(result, True)

    # ---- AC3: blocked ----

    def test_blocked_room_with_no_bookings_is_rejected(self):
        # AC3 does not depend on existing: nothing to overlap, still blocked.
        result = can_book(660, 720, 540, True, [])
        self.assertIs(result, False)

    # ---- AC4: the other overlap relationships ----

    def test_overlap_over_the_start_is_rejected(self):
        # AC4: 570-630 shares 600-630 with the existing booking.
        result = can_book(570, 630, 540, False, [(600, 660)])
        self.assertIs(result, False)

    def test_request_inside_existing_is_rejected(self):
        # AC4: 615-645 lies completely inside 600-660.
        result = can_book(615, 645, 540, False, [(600, 660)])
        self.assertIs(result, False)

    def test_request_containing_existing_is_rejected(self):
        # AC4: 570-690 contains 600-660. Exactly 120 minutes, so AC2 holds.
        result = can_book(570, 690, 540, False, [(600, 660)])
        self.assertIs(result, False)

    def test_identical_request_is_rejected(self):
        # AC4: the same interval as the existing booking.
        result = can_book(600, 660, 540, False, [(600, 660)])
        self.assertIs(result, False)

    def test_touching_start_is_allowed(self):
        # AC4: the end is excluded, so 570-600 ends before 600-660 begins.
        result = can_book(570, 600, 540, False, [(600, 660)])
        self.assertIs(result, True)

    def test_slot_exactly_between_two_bookings_is_allowed(self):
        # AC4: touching on both sides at once.
        result = can_book(660, 720, 540, False, [(600, 660), (720, 780)])
        self.assertIs(result, True)

    # ---- AC4: an empty existing, and an existing with several bookings ----

    def test_empty_existing_is_allowed(self):
        # AC4: with no bookings there is nothing to overlap.
        result = can_book(600, 660, 540, False, [])
        self.assertIs(result, True)

    def test_overlap_with_second_booking_is_rejected(self):
        # AC4: free against 600-660, overlaps 700-760.
        result = can_book(720, 780, 540, False, [(600, 660), (700, 760)])
        self.assertIs(result, False)

    def test_overlap_with_first_of_several_is_rejected(self):
        # AC4: overlaps 600-660, free against 900-960.
        result = can_book(610, 650, 540, False, [(600, 660), (900, 960)])
        self.assertIs(result, False)

    def test_overlap_in_unsorted_list_is_rejected(self):
        # AC4: the contract does not promise an order. The later booking comes first.
        result = can_book(610, 650, 540, False, [(900, 960), (600, 660)])
        self.assertIs(result, False)

    def test_free_slot_among_three_bookings_is_allowed(self):
        # AC4: 760-800 touches 700-760 and 800-860 and overlaps none of the three.
        result = can_book(760, 800, 540, False, [(600, 660), (700, 760), (800, 860)])
        self.assertIs(result, True)

    # ---- AC5: unchanged input ----

    def test_existing_unchanged_after_accepted_request(self):
        # AC5: "never alter existing". Unsorted on purpose, so sorting shows.
        existing = [(900, 960), (600, 660), (700, 760)]
        before = list(existing)
        can_book(780, 840, 540, False, existing)
        self.assertEqual(existing, before)

    def test_existing_unchanged_after_rejected_request(self):
        # AC5: the list must be untouched on the False path as well.
        existing = [(900, 960), (600, 660), (700, 760)]
        before = list(existing)
        can_book(610, 650, 540, False, existing)
        self.assertEqual(existing, before)

    def test_existing_unchanged_when_room_is_blocked(self):
        # AC5: the list must be untouched when the request is rejected by AC3.
        existing = [(900, 960), (600, 660), (700, 760)]
        before = list(existing)
        can_book(780, 840, 540, True, existing)
        self.assertEqual(existing, before)

    # ---- Part 4: new edge case, all four boundaries at once ----

    def test_last_two_hours_of_the_day_are_allowed(self):
        # AC1: 1320 > 1319 and end == 1440. AC2: exactly 120 minutes.
        # AC4: only touches the booking that ends at 1320.
        result = can_book(1320, 1440, 1319, False, [(1200, 1320)])
        self.assertIs(result, True)


if __name__ == "__main__":
    unittest.main()
