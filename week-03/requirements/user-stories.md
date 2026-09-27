# User stories — Smart Campus study room booking

6 to 8 stories. Keep the shape exactly: ID, the As/I want/so that sentence, a priority, one
assumption. Roles are **Student** or **Administrator** only.

---

### US-01
**Story:** As a Student, I want to see which study rooms are free on a chosen date and in which time slots, so that I can pick a room and time before I try to book.
**Priority:** High
**Assumption:** A blocked room is shown as not available for the whole period it is blocked (R4).

### US-02
**Story:** As a Student, I want to book a free study room for one time slot, so that I have a guaranteed place to study alone or with my group.
**Priority:** High
**Assumption:** A booking is accepted only if it starts in the future (R1), lasts at most two hours with exactly two hours allowed (R2), does not overlap another booking of the same room where a booking ending exactly when another starts is not an overlap (R3), and the room is not blocked (R4).

### US-03
**Story:** As a Student, I want to cancel a booking I made, so that the room is released and other students can book that time.
**Priority:** Medium
**Assumption:** A Student can cancel only their own bookings, and only before the booking has started.

### US-04
**Story:** As a Student, I want to get a confirmation after I book or cancel a room, so that I know my booking or cancellation really went through.
**Priority:** Medium
**Assumption:** The system sends exactly one confirmation per successful booking and one per successful cancellation; the delivery channel is not settled by the scenario and is left open.

### US-05
**Story:** As an Administrator, I want to block a room that cannot be used and unblock it when it is usable again, so that students cannot book a room that is out of service.
**Priority:** High
**Assumption:** Blocking stops new bookings for that room (R4); what happens to bookings made before the block is not settled by the scenario and is not changed by this story.

### US-06
**Story:** As an Administrator, I want to review how each room was used over a period I choose, so that I can see which rooms and times are in demand.
**Priority:** Low
**Assumption:** Usage means the bookings and cancellations recorded per room for the chosen period; no other data is collected.
