# Lab report — Practice #03, Requirements Engineering with AI

Fill in every section. **Do not delete or renumber the headings** — the README points at them and a
missing heading reads as a missing section.

Name: Serdar Dundar
Student ID: 24B031016
GitHub username: Serdarishe

---

## 1. Setup

| | |
| --- | --- |
| AI assistant (tool) | Claude (claude.ai) |
| Exact model name and version | claude-opus-5-5 (Claude Opus 5.5) |
| Date of the session | 2026-09-27 |
| Diagram renderer used | plantuml.com online server (PNG link in section 6) |

One tool and one model for all three prompts. If you switched, say why here — it changes what your
findings mean.

Same tool and same model for all three prompts. Limitation: the three prompts were not run in three
separate fresh chats — they were run in one Claude session that already contained the README. This
is disclosed in `AI_USAGE.md`.

---

## 2. Original AI output — user stories (Part 1)

Paste the **unedited** response to Prompt 1. Do not tidy it. If it is long, paste all of it anyway;
this is the baseline everything else is measured against.

```
Here are user stories for the Smart Campus study room booking system:

Student Stories

1. View room availability
As a student, I want to see which study rooms are available and at what times, so that I can plan my study sessions.
- Priority: High
- Assumption: Availability is shown in real time.

2. Book a study room
As a student, I want to reserve an available study room for a specific time slot, so that I have a guaranteed place to study with my group.
- Priority: High
- Assumption: Students can only book rooms that are not blocked and not already booked.

3. Cancel a booking
As a student, I want to cancel my reservation, so that the room becomes available for other students.
- Priority: Medium
- Assumption: Students can cancel only their own bookings, at any time before the booking starts.

4. Receive booking confirmation
As a student, I want to receive a confirmation when I book or cancel a room, so that I know my action was successful.
- Priority: Medium
- Assumption: Confirmation is sent by email, and a reminder is sent 15 minutes before the booking starts.

5. View my bookings
As a student, I want to see a list of my upcoming bookings, so that I can keep track of my reservations.
- Priority: Low
- Assumption: Students must be logged in to see their bookings.

Administrator Stories

6. Block a room
As an administrator, I want to block a room for maintenance, so that students cannot book a room that is not usable.
- Priority: High
- Assumption: Blocking a room cancels existing bookings in that period.

7. Manage rooms
As an administrator, I want to add, edit, and remove study rooms, so that the system reflects the actual rooms in the library.
- Priority: Medium
- Assumption: Each room has a capacity and a list of equipment.

8. Review room usage
As an administrator, I want to view reports on room usage, so that I can identify popular rooms and times and plan resources better.
- Priority: Low
- Assumption: Reports can be filtered by date range and exported to Excel.
```

---

## 3. Story review (Part 2)

One row per change you made. "Kept unchanged" is a valid row and needs a reason too.

| Story (as generated) | What I did | Why | Final ID |
| --- | --- | --- | --- |
| 1. View room availability | Rewrote goal and reason; replaced assumption | "Plan my study sessions" is vague; the real value is choosing a room/time before booking. "Shown in real time" is untestable and says nothing about R4 — new assumption: a blocked room shows as not available. | US-01 |
| 2. Book a study room | Kept story; replaced assumption | Story is fine (Student, one outcome, testable). The assumption covered only R3 and R4 and missed R1, R2 — rewrote it to list all four rules and my two decisions (touching = allowed, exactly 2 h = allowed). | US-02 |
| 3. Cancel a booking | Kept almost unchanged ("a booking I made") | Good story; "only own bookings, only before start" is a clear, testable assumption. Only made "own" explicit in the sentence. | US-03 |
| 4. Receive booking confirmation | Kept story; rewrote assumption | Story traces to UC-06. The assumption invented "a reminder 15 minutes before" — reminders are explicitly out of scope — and "by email" is a channel the scenario does not set. Replaced with: one confirmation per booking/cancellation, channel left open. | US-04 |
| 5. View my bookings | Deleted | Not one of the six functions in section 1 (no UC behind it), and its assumption "must be logged in" is authentication, which is out of scope. | — |
| 6. Block a room | Rewrote: block **and unblock**, removed "for maintenance", replaced assumption | UC-04 is "Block or unblock room", the AI dropped unblock. "Maintenance" is on the out-of-scope list. "Blocking cancels existing bookings" is an invented rule that also conflicts with nothing stated in R1–R4 — removed; the scenario does not settle it. | US-05 |
| 7. Manage rooms | Deleted | Adding/editing/removing rooms is not one of the six use cases; "capacity and a list of equipment" brings in equipment, which is out of scope. Scope creep. | — |
| 8. Review room usage | Rewrote reason and assumption | "Plan resources" and "exported to Excel" widen the scenario (Excel is a file format / tool detail). Kept the core: Administrator reviews usage over a chosen period. | US-06 |

**Did the assistant invent anything outside the scenario?** Yes, five times against the
out-of-scope list: a 15-minute **reminder** (story 4 — "reminder notifications beyond UC-06"),
**logged in** (story 5 — authentication), **maintenance** (story 6), **equipment** (story 7), and
Excel export (story 8 — not a function in section 1). It also invented two rules not in R1–R4:
"blocking cancels existing bookings" (story 6) and email as the confirmation channel (story 4).
I checked by reading each story and assumption against the out-of-scope list word by word, then
checked that every remaining story maps to one of UC-01…UC-06.

**How many stories did you end with, and why that number?** 6. I deleted two stories that belong to
no use case (5 and 7). Each of the six use cases now has exactly one story behind it; I did not add
filler stories just to reach 7 or 8.

---

## 4. Original AI output — acceptance criteria (Part 3)

Selected stories given to the prompt: Book a study room (US-02), Cancel a booking (US-03),
Block or unblock a room (US-05).

```
Assumptions
1. All times are in the campus local time zone.
2. Bookings are made in 30-minute increments.
3. A student must be logged in to book or cancel.
4. "Future" means the start time is later than the current system time.
5. An administrator can block a room for any period.

Story: Book room

AC1 – Successful booking
Given a logged-in student and Room 101 is free from 14:00 to 16:00 tomorrow
When the student books Room 101 from 14:00 to 16:00
Then the booking is saved in the database and a confirmation message is shown on the screen.

AC2 – Booking in the past
Given the current time is 10:00
When the student tries to book a room for 09:00 today
Then the system rejects the booking with the error "Bookings must be in the future."

AC3 – Exceeding maximum duration
Given a free room
When the student tries to book it from 10:00 to 13:00
Then the system rejects the booking with "Maximum booking duration is two hours."

AC4 – Overlapping booking
Given Room 101 is booked from 14:00 to 15:00
When another student tries to book Room 101 from 14:30 to 15:30
Then the booking is rejected because the room is not available.

AC5 – Blocked room
Given Room 102 is blocked by an administrator
When a student tries to book Room 102
Then the system shows an error that the room is unavailable.

Story: Cancel booking

AC1 – Successful cancellation
Given a student has an upcoming booking
When the student cancels it
Then the booking is removed and the room becomes available again.

AC2 – Cancellation confirmation
Given a student has cancelled a booking
When the cancellation is completed
Then the student receives a confirmation email.

AC3 – Cancel another student's booking
Given a booking belongs to another student
When the student tries to cancel it
Then the cancel button is not displayed.

Story: Block or unblock room

AC1 – Block a room
Given an administrator is logged in
When the administrator blocks Room 103
Then Room 103 is marked as blocked and cannot be booked.

AC2 – Existing bookings
Given Room 103 has bookings for tomorrow
When the administrator blocks Room 103
Then all existing bookings are cancelled and affected students are notified by SMS.

AC3 – Unblock a room
Given Room 103 is blocked
When the administrator unblocks it
Then the room becomes available for booking again.
```

---

## 5. Criteria review (Part 3)

| Criterion (as generated) | Problem | What I changed it to | Final ID |
| --- | --- | --- | --- |
| Assumption 2 "30-minute increments" | Invented rule, not in R1–R4 | Removed | — |
| Assumption 3 "must be logged in" | Authentication is out of scope | Removed | — |
| Book AC1 Successful booking | "Saved in the database" and "shown on the screen" — database and screen in a criterion; two results in one Then. The 14:00–16:00 case is exactly two hours, but the AI never says whether that is intended. | Result is observable behaviour only ("accepted, room no longer free"); stated that 14:00–16:00 is the exactly-two-hours boundary | AC-01 |
| Book AC2 Booking in the past | "Today" not stated in Given; tests the error text, not the rule | Rewrote Given with date; Then = rejected under R1, no booking created | AC-02 |
| Book AC3 Exceeding duration | 10:00–13:00 is three hours — far from the boundary, and the Given does not say the room is free for that period | Given states the room is free; used 2 h 30 min to test closer to the limit | AC-03 |
| Book AC4 Overlapping | Fine, but "not available" is vague | Then names R3 and says existing booking unchanged | AC-04 |
| (missing) | No criterion for touching bookings — the R3 boundary | Added: 12:00–14:00 then 14:00–15:00 is accepted | AC-05 |
| Book AC5 Blocked room | "Shows an error" — screen wording; belongs to the block story | Moved to US-05, rewrote Then as rejection under R4 | AC-10 |
| Cancel AC1 | "Upcoming" is vague; "removed" | Concrete booking and time; "cancelled, room free again" | AC-06 |
| Cancel AC2 Confirmation email | Tests UC-06, not cancelling; "email" is an invented channel | Removed from US-03 (confirmation is US-04, see traceability gap) | — |
| Cancel AC3 Another student's booking | "Cancel button is not displayed" is a UI detail, not behaviour | Then = cancellation rejected, booking stays active | AC-07 |
| (missing) | No case for cancelling a booking that already started, although the story's own assumption says "only before it starts" | Added | AC-08 |
| Block AC1 | "Administrator is logged in" = authentication; two results in one Then | Split: AC-09 blocking → shown as not available; AC-10 booking a blocked room rejected | AC-09, AC-10 |
| Block AC2 Existing bookings | Invents "bookings are cancelled" and "notified by SMS" — SMS is on the out-of-scope list | Removed; what happens to existing bookings is left open in assumptions | — |
| Block AC3 Unblock | "Available again" not observable as a test | Unblock then a booking is accepted | AC-11 |
| (missing) | Block story had no invalid case at all | Added: a Student cannot block a room | AC-12 |

**The two open questions.** Write your decision and the reason. Either answer is accepted.

| Question | My decision | Why |
| --- | --- | --- |
| A booking ending exactly when another begins — overlap under R3? | allowed | A booking covers [start, end): 12:00–14:00 and 14:00–16:00 share no minute, and forbidding it would waste every slot boundary. |
| Is exactly two hours allowed under R2? | allowed | R2 says "at most two hours"; "at most" includes the maximum. |

**Which invalid or boundary case did the assistant leave out?** The touching-bookings case under
R3 (now AC-05); cancelling a booking that has already started (AC-08); any invalid case for
blocking (AC-12). It also used exactly two hours in its happy path without ever saying that was a
boundary.

---

## 6. Original AI output — use-case diagram (Part 4)

```
@startuml
left to right direction
skinparam packageStyle rectangle

actor Student
actor Administrator

rectangle "Smart Campus Study Room Booking System" {
  usecase "View Availability" as UC1
  usecase "Book Room" as UC2
  usecase "Cancel Booking" as UC3
  usecase "Block or Unblock Room" as UC4
  usecase "Review Usage" as UC5
  usecase "Send Confirmation" as UC6
}

Student --> UC1
Student --> UC2
Student --> UC3
Student --> UC6

Administrator --> UC1
Administrator --> UC4
Administrator --> UC5

UC2 ..> UC1 : <<include>>
UC2 ..> UC6 : <<include>>
UC3 ..> UC6 : <<include>>
@enduml
```

Rendered diagram (image, or a link):

- AI original: https://www.plantuml.com/plantuml/png/TLBBReCm4BplLwnoJwI6X4CLeQJyGH2zRun3BVn0zf8ALVtt6aGZIDERnpEpinxv69WyTqQ3bbT6TkXL_S5OAIy5AsSXDCgsvCbWIwAXMXRSQua3JRRM4e04Euy5TvMqFA5JPPHLWJr5171NuwemCH1pCcqNHbEFP-SClZaNasei-i3IhF0B4BiW1OLeUbVo4qytKfekIYlkLqW1o_nbBXecZBCcSZidSx92wj-KIP4ixDg91kFkfRsCnzcetLnubhTXdJB4CYP-F-SBQIlCdRqgRsZeS1Aby0qmrOJhTJRklyJR1vmyu1HWqUnzpBFRtTFRFK3CmSrcDE8h7WxA2XrJicp6f7-Ov1_c69yxVA0V
- Reviewed (`requirements/use-cases.puml`): https://www.plantuml.com/plantuml/png/XLFBRjim4BppAmQ-D0PY8V6hG10OINtgjQfxfwMrJ8GY3P9oQXG5-X7zmdv9bwITM4wBy4AHdDtPcLqz-21Tw5ejFc3bQLH9JwYLR9niyUVNRvGjlsCfsrtduKDN7-2iRR6szacP1bUEzegUgSQUd5VM33dJrsSBMGNh_3Li5xog2M5B7DIPMhf3WL9zHyTKaOz1oYIC2WL7BxVIDEInzodeyNFCiUi2f2DevGEJAGCjroD7E-j2qTRmL0LcnyT224sRW63XLBCDhCRbDo5IJIXP1PbmF3tMhJASr4a-2H6nJAy9WtUa3_1388f8dWs-iGkGUwcuBgLLE0oGblHOBMzkpw6VE45ATOISLeQEpw5BQIhIhvHzwAINLTlg2QoeC-lqUMJ8qEavz4lg6PzbGuCt1SpEeIMP6fKr6-LQ6LtioPgBdu8xTdGKWHrlU0nWZJwaveMj8tePbardKYSyhbRbwERs6d4Rvsqo5ASyez4YctPnCRwyc4JsNWTVQqWcH5R92f9Kv5dDvBFCEX-AVlmny_JVrxCazz8JA7_YvTbSP-d-m9FQGcu2ESWN3smyLAcjEWUdSgP34GMYA1BF77UulrUcqgntiOXla_-zYGUk9_x2Vm40

---

## 7. Diagram review (Part 4)

| Element | Problem | What I changed |
| --- | --- | --- |
| `Student --> UC6` (Send confirmation) | A Student does not trigger a confirmation; the system sends it after UC-02/UC-03. Wrong association. | Removed. UC-06 is reached only through `<<include>>` from UC-02 and UC-03. |
| `Administrator --> UC1` (View availability) | No revised story has the Administrator viewing availability (US-01 is a Student story) — the element does not trace to a story. | Removed. |
| `UC2 ..> UC1 : <<include>>` | Booking does not always include the Student viewing availability — the Student may already know the free slot; the availability check inside a booking is part of R3/R4, not the View availability use case. Include is not "clear" here. | Removed. |
| `UC2 ..> UC6`, `UC3 ..> UC6` `<<include>>` | Correct: every successful booking and cancellation triggers a confirmation (US-04). | Kept. |
| Use-case names in Title Case, aliases UC1…UC6 | Differ from the fixed names/IDs in section 1 (UC-01…UC-06) | Renamed to the exact names and aliases UC01…UC06. |
| `skinparam packageStyle rectangle` | Not needed with a `rectangle` boundary | Removed. |

**Associations.** Which actor–use-case links did the assistant draw that a person does not actually
trigger? Name them. **Student → Send confirmation (UC-06).** Confirmation is a system action after
UC-02/UC-03, not something a person starts. Also removed Administrator → View availability (UC-01)
because no story supports it.

**Did any screen, database or internal component appear as a use case or an actor?** Not in the
diagram — no third actor, no "System" actor, no database. (Screens and a database did appear in the
acceptance-criteria output, section 5.)

---

## 8. Traceability (Part 5)

Summarise what the table in `requirements/traceability.md` shows:

- Use cases with **no story** behind them: none after review. Before review, UC-06 was covered only by the AI's story 4 with an invented reminder, and two AI stories (5, 7) mapped to no use case at all.
- Stories with **no use case** they belong to: none (the AI's "View my bookings" and "Manage rooms" were deleted for exactly this reason).
- Criteria that test **no rule** from section 1: AC-06, AC-07, AC-08, AC-12 test ownership/cancel timing/who may block — these come from story assumptions, not from R1–R4. AC-09 and AC-11 test R4 only indirectly.

Use cases with no acceptance criteria: **UC-05 Review usage** and **UC-06 Send confirmation**;
UC-01 is only indirectly tested by AC-09.

**What does the largest gap tell you about the generated requirements?** The AI is good where
rules exist: R1–R4 produced clear, testable criteria for booking. The functions with no rule
(UC-05 Review usage, UC-06 Send confirmation) have nothing that tests them, and UC-06 is exactly
where the AI got the actor wrong and invented reminders and SMS. Where the scenario is thin, the AI
fills the space with invented features instead of leaving a visible gap.

---

## 9. Checker runs

Paste the **real terminal output** of both runs. A table with nothing behind it does not count.

```
$ python tests/check_requirements.py
PASS   US-1  user-stories.md         no placeholders left
PASS   US-2  user-stories.md         6 stories, IDs US-01…US-06
PASS   US-3  user-stories.md         every story has the required sentence shape
PASS   US-4  user-stories.md         every story has a priority
PASS   US-5  user-stories.md         every story declares an assumption
PASS   US-6  user-stories.md         only Student and Administrator appear as roles
PASS   US-7  user-stories.md         nothing from the out-of-scope list appears
PASS   AC-1  acceptance-criteria.md  no placeholders left
PASS   AC-2  acceptance-criteria.md  three sections, all naming real stories: US-02, US-03, US-05
PASS   AC-3  acceptance-criteria.md  every section has 3 to 5 uniquely numbered criteria
PASS   AC-4  acceptance-criteria.md  all 12 criteria are complete Given/When/Then
PASS   AC-5  acceptance-criteria.md  every section covers an invalid or boundary case
PASS   AC-6  acceptance-criteria.md  6 assumptions listed before the criteria
PASS   AC-7  acceptance-criteria.md  both open questions are settled in the assumptions
PASS   PU-1  use-cases.puml          valid PlantUML block, no placeholders
PASS   PU-2  use-cases.puml          exactly two actors: Student, Administrator
PASS   PU-3  use-cases.puml          all six use cases present
PASS   PU-4  use-cases.puml          system boundary present
PASS   PU-5  use-cases.puml          no screens, databases or internal components
PASS   PU-6  use-cases.puml          no unjustified actor associations found
PASS   TR-1  traceability.md         all six use cases have a row
PASS   TR-2  traceability.md         every ID in the table resolves
PASS   TR-3  traceability.md         every story appears in the table
------------------------------------------------------------------------
23 PASS · 0 FAIL · 0 ERROR   (23 checks)
Shape is clean. This says nothing about whether the requirements are good.
```

```
$ python tests/validate_submission.py
submission.yml — submission.yml
------------------------------------------------------------------------
PASS   schema                                    1
PASS   week                                      03
PASS   student.name                              Serdar Dundar
PASS   student.student_id                        24B031016
PASS   student.github                            Serdarishe
PASS   assistant.tool                            Claude
PASS   assistant.model                           claude-opus-5-5
PASS   counts.user_stories                       6
PASS   counts.acceptance_criteria_sets           3
PASS   checker                                   23 PASS · 0 FAIL · 0 ERROR
NOTE   checker                                   you are claiming a clean run — it will be re-run at your commit, so make sure it is true
PASS   checker.commit                            038a006
PASS   assumptions.overlap_touching_bookings     allowed
PASS   assumptions.exactly_two_hours             allowed
PASS   traceability.use_cases_not_covered        UC-05, UC-06
PASS   traceability.stories_not_traced           []
PASS   review_findings                           6 findings
PASS   review_findings[1]                        UC-06 Send confirmation: the AI diagram linked Student to it…
PASS   review_findings[2]                        US-04: the AI assumption added a 15-minute reminder (out of …
PASS   review_findings[3]                        US-05: the AI story blocked a room for maintenance (out of s…
PASS   review_findings[4]                        AC-05: the AI criteria never tested touching bookings (R3 bo…
PASS   review_findings[5]                        AC-07: the AI version said the cancel button is not displaye…
PASS   review_findings[6]                        UC-05 Review usage and UC-06 Send confirmation have stories …
PASS   honesty.can_explain_everything_submitted  yes
PASS   honesty.ai_usage_disclosed                yes
------------------------------------------------------------------------
24 PASS · 0 FAIL · 0 ERROR · 1 note
Shape is fine. This says nothing about whether the work is good.
```

| | PASS | FAIL | ERROR |
| --- | --- | --- | --- |
| `check_requirements.py` | 23 | 0 | 0 |

Commit these numbers were produced at (`git rev-parse --short HEAD`): 038a006

**Every FAIL, one line each: what it is and what you decided to do about it.** A FAIL you report and
explain costs you nothing.

No FAIL and no ERROR in `check_requirements.py`. Note: the checker could not see the problems I
fixed in review (for example, it passes a story that uses "logged in", and it cannot tell that a
criterion tests UC-06 instead of its own story) — it checks shape only.

**Did you run the checks by hand instead of with Python?** No — both checkers were run with Python 3.

---

## 10. Conclusion (150–200 words)

Answer all three:

1. Which part of the generated requirements was most wrong, and how would you have caught it without
   a checker?
2. What did the assistant get right that would have taken you noticeably longer by hand?
3. You are handing these requirements to someone who will implement them, and you will not be in the
   room. Which single one would you rewrite first, and why?

The most wrong part was everything around UC-06 Send confirmation. The AI connected Student to Send
confirmation in the diagram, gave its story an out-of-scope 15-minute reminder, and in the criteria
added a "confirmation email" to the cancel story and "notified by SMS" to the block story. None of
this needs a checker to catch: reading each line against the out-of-scope list and asking "who
presses the button for this?" finds all of it.

What the AI got right was the rule-driven part. The booking criteria for R1, R3 and R4 (my AC-02,
AC-04, AC-10) came out almost usable, with concrete times, and writing that many Given/When/Then
cases by hand would have taken me much longer.

The one I would rewrite first is US-04 (UC-06). It is the only use case whose trigger is the system,
not a person, it still has no acceptance criteria, and its assumption leaves the channel open. An
implementer alone with it would guess — probably email plus reminders, exactly the scope the AI
already invented.
