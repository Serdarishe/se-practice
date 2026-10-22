import copy
import unittest

from booking import can_book

# Base for every case unless the test says otherwise (brief T1-T12)
NOW = 540
EXISTING = [(600, 660)]


def check(start, end, now=NOW, blocked=False, existing=None):
    return can_book(start, end, now, blocked, list(EXISTING) if existing is None else existing)


class BriefCases(unittest.TestCase):
    """T1-T6: the six cases from the brief. Expected values come from AC1-AC4."""

    def test_t1_touching_end_is_allowed(self):            # AC4
        self.assertIs(check(660, 720), True)

    def test_t2_overlap_is_rejected(self):                 # AC4
        self.assertIs(check(630, 690), False)

    def test_t3_blocked_room_is_rejected(self):            # AC3
        self.assertIs(check(660, 720, blocked=True), False)

    def test_t4_exactly_120_minutes_is_allowed(self):      # AC2
        self.assertIs(check(720, 840), True)

    def test_t5_121_minutes_is_rejected(self):             # AC2
        self.assertIs(check(720, 841), False)

    def test_t6_starts_now_is_rejected(self):              # AC1
        self.assertIs(check(540, 570), False)


class TimeOrderAndBounds(unittest.TestCase):
    """AC1: 0 <= start < end <= 1440, start strictly after now."""

    def test_t7_reversed_times_are_rejected(self):
        self.assertIs(check(720, 660), False)

    def test_zero_length_is_rejected(self):
        self.assertIs(check(700, 700), False)

    def test_t8_ending_at_1440_is_allowed(self):
        self.assertIs(check(1380, 1440), True)

    def test_t9_ending_after_1440_is_rejected(self):
        self.assertIs(check(1380, 1441), False)

    def test_negative_start_is_rejected(self):
        self.assertIs(check(-30, 30, now=0), False)

    def test_one_minute_after_now_is_allowed(self):
        self.assertIs(check(541, 571), True)

    def test_start_in_the_past_is_rejected(self):
        self.assertIs(check(500, 530), False)

    def test_start_zero_when_now_is_zero_is_rejected(self):
        self.assertIs(check(0, 60, now=0), False)


class Overlaps(unittest.TestCase):
    """AC4: any overlap rejected, touching endpoints allowed."""

    def test_ends_at_existing_start_is_allowed(self):
        self.assertIs(check(570, 600), True)

    def test_partial_overlap_over_start_is_rejected(self):
        self.assertIs(check(570, 630), False)

    def test_inside_existing_is_rejected(self):
        self.assertIs(check(615, 645), False)

    def test_containing_existing_is_rejected(self):
        self.assertIs(check(570, 690), False)

    def test_identical_to_existing_is_rejected(self):
        self.assertIs(check(600, 660), False)

    def test_t10_overlap_with_second_booking_is_rejected(self):
        self.assertIs(check(720, 780, existing=[(600, 660), (700, 760)]), False)

    def test_overlap_in_unsorted_list_is_rejected(self):
        self.assertIs(check(610, 650, existing=[(900, 960), (600, 660)]), False)

    def test_fits_exactly_between_two_bookings(self):
        self.assertIs(check(660, 720, existing=[(600, 660), (720, 780)]), True)

    def test_no_bookings_at_all_is_allowed(self):
        self.assertIs(check(600, 660, existing=[]), True)

    def test_blocked_with_no_bookings_is_rejected(self):   # AC3
        self.assertIs(check(660, 720, blocked=True, existing=[]), False)


class NoMutation(unittest.TestCase):
    """AC5: the result is a real Boolean and the inputs stay the same."""

    def test_t11_same_check_twice_gives_same_answer(self):
        existing = [(600, 660)]
        first = can_book(660, 720, NOW, False, existing)
        second = can_book(660, 720, NOW, False, existing)
        self.assertIs(first, True)
        self.assertIs(second, True)

    def test_existing_unchanged_after_accepted_request(self):
        existing = [(900, 960), (600, 660), (700, 760)]
        before = copy.deepcopy(existing)
        self.assertIs(can_book(780, 840, NOW, False, existing), True)
        self.assertEqual(existing, before)

    def test_existing_unchanged_after_rejected_request(self):
        existing = [(900, 960), (600, 660), (700, 760)]
        before = copy.deepcopy(existing)
        self.assertIs(can_book(610, 650, NOW, False, existing), False)
        self.assertEqual(existing, before)

    def test_accepts_tuple_of_bookings(self):
        # existing is "a collection" in the contract, not only a list
        self.assertIs(can_book(660, 720, NOW, False, ((600, 660),)), True)


if __name__ == "__main__":
    unittest.main()
