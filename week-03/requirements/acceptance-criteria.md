# Acceptance criteria — three selected stories

Assumptions first, then the criteria. Each block names the story it belongs to. 3 to 5 criteria per
story, every one in Given / When / Then form, and every set covers a validation or error case — not
three happy paths.

---

## Assumptions

- **Overlap:** a booking that ends exactly when another begins is **allowed** under R3 (it is not an overlap), because a booking covers the interval from its start up to, but not including, its end — 12:00–14:00 and 14:00–16:00 share no minute.
- **Duration:** a booking of exactly two hours is **allowed** under R2, because R2 says "at most two hours", and "at most" includes the maximum itself.
- "In the future" (R1) means the start time is later than the current time at the moment the Student submits the booking.
- A Student can cancel only a booking they made themselves, and only before its start time.
- Blocking a room prevents new bookings; bookings made before the block are not changed by the criteria below (the scenario does not settle this).
- All times are campus local time; the dates in the examples are relative to "today".

---

## US-02 — Book a free study room

### AC-01
- **Given** Room 101 is not blocked and has no booking tomorrow between 14:00 and 16:00
- **When** a Student books Room 101 tomorrow from 14:00 to 16:00 (exactly two hours)
- **Then** the booking is accepted and Room 101 is no longer free tomorrow from 14:00 to 16:00

### AC-02
- **Given** the current time is 10:00 today
- **When** a Student tries to book a free room today from 09:00 to 10:00
- **Then** the booking is rejected because it does not start in the future (R1), and no booking is created

### AC-03
- **Given** Room 101 is free tomorrow from 10:00 to 13:00
- **When** a Student tries to book Room 101 tomorrow from 10:00 to 12:30
- **Then** the booking is rejected because it is longer than two hours (R2), and no booking is created

### AC-04
- **Given** Room 101 is booked tomorrow from 14:00 to 15:00
- **When** another Student tries to book Room 101 tomorrow from 14:30 to 15:30
- **Then** the booking is rejected because it would overlap the existing booking (R3), and the existing booking is unchanged

### AC-05
- **Given** Room 101 is booked tomorrow from 12:00 to 14:00
- **When** a Student books Room 101 tomorrow from 14:00 to 15:00
- **Then** the booking is accepted, because touching bookings do not overlap under R3

---

## US-03 — Cancel my own booking

### AC-06
- **Given** a Student has a booking for Room 102 tomorrow from 10:00 to 11:00
- **When** that Student cancels the booking
- **Then** the booking is cancelled and Room 102 is free again tomorrow from 10:00 to 11:00

### AC-07
- **Given** Student A has a booking for Room 102 tomorrow from 10:00 to 11:00
- **When** Student B tries to cancel that booking
- **Then** the cancellation is rejected because the booking is not Student B's, and the booking stays active

### AC-08
- **Given** a Student has a booking for Room 102 today from 09:00 to 11:00 and the current time is 09:30
- **When** that Student tries to cancel the booking
- **Then** the cancellation is rejected because the booking has already started, and the booking stays active

---

## US-05 — Block or unblock a room

### AC-09
- **Given** Room 103 is not blocked
- **When** an Administrator blocks Room 103
- **Then** Room 103 is shown as not available to Students for every future time slot

### AC-10
- **Given** Room 103 is blocked
- **When** a Student tries to book Room 103 tomorrow from 10:00 to 11:00
- **Then** the booking is rejected because the room is blocked (R4), and no booking is created

### AC-11
- **Given** Room 103 is blocked and has no bookings tomorrow
- **When** an Administrator unblocks Room 103 and a Student then books it tomorrow from 10:00 to 11:00
- **Then** the booking is accepted

### AC-12
- **Given** Room 103 is not blocked
- **When** a Student tries to block Room 103
- **Then** the request is refused because only an Administrator can block a room, and Room 103 stays bookable
