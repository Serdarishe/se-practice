# SIS #03 — Report: Smart Campus Room Availability Checker

<!-- The ONLY file you write prose in. Keep every numbered heading (## 1. … ## 13.) and every
     ### sub-heading, and the **Label:** words — the checker finds your answers by them.
     Replace every "(write here)" and "(paste here)". Delete these <!-- --> comments if you like. -->

## 1. Setup and reuse

<!-- Model: the exact model with its version, as the tool shows it ("ChatGPT" is a tool, not a
     model). If the tool does not show it, write: not displayed
     Reuse: week-05 if code/original/booking_v1.py is your Week 05 v1, copied unedited;
     week-06 if web/original/ is your Week 06 v1 export; fresh if you generated it for this SIS. -->

| Item | Value |
| --- | --- |
| Coding assistant (tool) | (write here) |
| Coding assistant model | (write here) |
| Bolt.new model | not displayed |
| Bolt project link | https://bolt.new/~/sb1-naz8xqvv |
| Language | Python |
| Path | A |
| Python v1 from | (write here) |
| Web v1 from | fresh |

## 2. Baseline — before any new AI exchange

<!-- Written by you, without AI, before the first exchange of this SIS. Commit and push it
     first (README §2). Reusing Week 05/06 work does not exempt you: this section is new. -->

### 2.1 Scope in my own words

**Scope:** This page is for students. It checks if a room is free at the time they choose. It does not make a real booking, it does not save anything and it does not need an account.

### 2.2 The acceptance criteria in my own words

| AC | In my own words |
| --- | --- |
| AC1 | Time is in minutes from the start of the day, from 0 to 1440. Start must be before end, and start must be after the current time. For example start 600, end 660, now 500 is OK. |
| AC2 | A booking can be 120 minutes (2 hours) at most. 120 is OK, 121 is not. |
| AC3 | If the room is blocked, the answer is always no, even if the time is free. |
| AC4 | If the new booking uses any part of an old booking, it is rejected. 10:30-11:30 hits 10:00-11:00, but 11:00-12:00 does not. |
| AC5 | The answer is True if I can book and False if I cannot. The list of old bookings must not change. |
| AC6 | The page shows clear messages and works well on a phone. The user must see why the room is not free, not only "False". |

### 2.3 Likely failure points

| # | Failure point | AC | How I will check it |
| --- | --- | --- | --- |
| 1 | The code can think two bookings overlap when one ends at the same minute the other starts | AC4 | Old booking 10:00-11:00, new booking 11:00-12:00 (T1). It must be allowed. |
| 2 | The code can get the 120-minute limit wrong | AC2 | Try 120 minutes (T4, must be allowed) and 121 minutes (T5, must be rejected). |

### 2.4 The contract

| Parameter | Meaning | Type and allowed values |
| --- | --- | --- |
| `start` | Start time of the new booking | int, minutes 0-1440 |
| `end` | End time of the new booking | int, minutes 0-1440, bigger than start |
| `now` | The current time | int, minutes 0-1439 |
| `blocked` | Is the room blocked or not | bool, True or False |
| `existing` | The list of bookings that already exist | list of (start, end) pairs, must not change |
| returns | Can I book or not | bool: True = yes, False = no |

### 2.5 Initial assumptions and manual checks

**Assumptions:**

1. All bookings are on the same day.
2. The old bookings in `existing` already have correct times.

**Checked manually:**

- The edge cases by hand: 120 and 121 minutes, overlapping bookings, a blocked room, and the page on a narrow phone screen.

## 3. Python v1 review

<!-- One row per conditional branch in code/original/booking_v1.py (your language's v1 on
     Path B). Quote the condition exactly. AC1-AC4 must all appear in the AC column. -->

| Branch in v1 (quoted) | AC | Satisfies it? | Why |
| --- | --- | --- | --- |
| (write here) | (write here) | (write here) | (write here) |
| (write here) | (write here) | (write here) | (write here) |
| (write here) | (write here) | (write here) | (write here) |
| (write here) | (write here) | (write here) | (write here) |

## 4. Prototype v1 in Bolt.new

**Prompt as sent:**

~~~~text
Build a single responsive page: "Smart Campus Room Availability Checker".
User story: As a student, I want to check a room's availability so that I can choose a valid booking time.
One selected room (Room 204) with fictional, hard-coded bookings for today: 10:00-11:00.
Add a test-data checkbox "Include second booking 11:40-12:40" (off by default).
Current time is fixed at 09:00. Include a toggle "Room blocked".
The user picks a start time and an end time and presses "Check".
The page only CHECKS availability. It never creates, saves or confirms a booking.
Rules (all required):
AC1 times are integer minutes after midnight, 0 <= start < end <= 1440, start strictly after now.
AC2 duration at most 120 minutes; exactly 120 is permitted.
AC3 reject every request when the room is blocked.
AC4 reject overlap with any existing booking; touching at an endpoint (a start at 11:00 after a booking that ends at 11:00) is NOT overlap.
AC5 show an unambiguous "Available" or "Unavailable" result; never modify the existing bookings.
AC6 show an understandable message explaining why a request is unavailable, and keep the layout usable on a narrow mobile screen (~375 px).
Do NOT add login, accounts, a backend, a database, an external API, local storage, payments, or any unrelated features.
~~~~

<!-- Main generated files or components, with their path inside web/original/
     (for example src/App.tsx). At least two. -->

| Generated file or component | Path | Its role |
| --- | --- | --- |
| `App` component, `checkAvailability()`, `toMinutes()` | `src/App.tsx` | The whole page and all the rules: fixed NOW = 540, bookings 10:00-11:00 (+ optional 11:40-12:40), the checks for AC1-AC4 in `checkAvailability` (lines 28-53), the result card with Available / Unavailable and a reason |
| Entry point | `src/main.tsx` | Mounts `App` into `#root` |
| Page shell | `index.html` | HTML page with the viewport meta tag and the `#root` div |
| Dependencies | `package.json` | Vite + React + Tailwind + lucide-react, and also `@supabase/supabase-js`, which the page never uses (issue 2) |

**What v1 does:**

- Shows Room 204, current time 09:00 and today's booking 10:00-11:00; a checkbox adds the test booking 11:40-12:40.
- Two `type="time"` inputs, a "Room blocked" switch and a "Check availability" button.
- On Check it converts HH:MM to minutes and shows a green "Available" or red "Unavailable" card with a reason (blocked, invalid order, starts not after now, over 120 minutes, overlap).
- The checks match AC1-AC4, but the result card is not cleared when the inputs change (issue 1), and 24:00 cannot be entered in a time input, so T8/T9 cannot be tried.

## 5. Test cases — executed on both artifacts

<!-- Base for every case unless the row says otherwise: now = 540, blocked = False,
     existing = [(600, 660)]. Do not change the first four columns.
     Python columns: True, False or Error (it raised) — what the call actually returned.
       T11: the result of the SECOND call. T12: n/a.
       Path A: the checker runs both of your files on T1-T11 and compares (C2, C3).
     Page columns: Available, Unavailable or Not testable — what the page actually showed.
     Never write a result you did not observe. -->

| Case | Name | Input | Expected | Python v1 | Python final | Page v1 | Page final |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | Touching | 660–720 | Available |  | True | Available | Available |
| T2 | Overlap | 630–690 | Unavailable |  | False | Unavailable | Unavailable |
| T3 | Blocked | 660–720, blocked | Unavailable |  | False | Unavailable | Unavailable |
| T4 | Exactly 120 min | 720–840 | Available |  | True | Available | Available |
| T5 | 121 min | 720–841 | Unavailable |  | False | Unavailable | Unavailable |
| T6 | Starts now | 540–570 | Unavailable |  | False | Unavailable | Unavailable |
| T7 | Reversed | 720–660 | Unavailable |  | False | Unavailable | Unavailable |
| T8 | Ends at midnight | 1380–1440 | Available |  | True | Not testable | Available |
| T9 | Past midnight | 1380–1441 | Unavailable |  | False | Not testable | Not testable |
| T10 | Second booking | 720–780, existing (600–660), (700–760) | Unavailable |  | False | Unavailable | Unavailable |
| T11 | Same check twice | 660–720, twice | Available |  | True | Available | Available |
| T12 | Narrow screen | T1 at ~375 px wide | Available | n/a | n/a | Available | Available |

**How the page cases were run:** v1 - every case was entered by hand in the Bolt preview (screenshots in `evidence/v1-cases/`, T12 in Chrome DevTools as iPhone SE 375x667) and repeated on the exported code in Chromium with a Playwright script; both runs gave the same results. Final - the downloaded `web/final/` code was started with `npm run dev` and every case was entered in Chromium with the same Playwright script (a fresh page per case; screenshots in `evidence/final-cases/`); T8 and T12 were also checked by hand in the Bolt preview (`T8.png`, `T12-bolt-devtools.png`). On v1, T8 and T9 are Not testable: a `type="time"` input does not accept 24:00 or 24:01; the nearest input 23:00-00:00 showed Unavailable ("start before end"). On the final, T8 uses the new "Ends at midnight (24:00)" checkbox (issue 3); T9 (24:01) still cannot be entered. Python results come from the checker run of each file.

## 6. Traceability

<!-- His table. Implementation / file: where the rule lives (booking.py line, a component).
     Test input: the case IDs from section 5. v1 / final actual: what those cases gave. -->

| AC | Implementation / file | Test input | Expected | v1 actual | Final actual |
| --- | --- | --- | --- | --- | --- |
| AC1 | `code/booking.py` lines 23-28 (integer check, `0 <= start < end <= DAY_END`, `start <= now`); page: `web/final/src/App.tsx` `checkAvailability` (`start < 0 || end > 1440 || start >= end`, `start <= NOW`) and the "Ends at midnight" checkbox (end = 1440) | T6, T7, T8, T9 | T8 Available; T6, T7, T9 Unavailable | Python v1 (write here); page: T6, T7 Unavailable, T8, T9 Not testable | Python: T6 False, T7 False, T8 True, T9 False; page: T6, T7 Unavailable, T8 Available, T9 Not testable |
| AC2 | `code/booking.py` line 31 (`end - start > MAX_DURATION`); page: `web/final/src/App.tsx` `end - start > 120` | T4, T5 | T4 Available; T5 Unavailable | Python v1 (write here); page: T4 Available, T5 Unavailable | Python: T4 True, T5 False; page: T4 Available, T5 Unavailable |
| AC3 | `code/booking.py` line 19 (`if blocked`); page: `web/final/src/App.tsx` `if (blocked)` first in `checkAvailability` | T3 | Unavailable | Python v1 (write here); page: T3 Unavailable, but a stale Available stayed after switching Blocked on (issue 1) | Python: T3 False; page: T3 Unavailable, stale result cleared |
| AC4 | `code/booking.py` lines 36-38 (`start < b_end and b_start < end`); page: `web/final/src/App.tsx` loop `start < b.end && b.start < end` | T1, T2, T10 | T1 Available; T2, T10 Unavailable | Python v1 (write here); page: T1 Available, T2, T10 Unavailable | Python: T1 True, T2 False, T10 False; page: T1 Available, T2, T10 Unavailable |
| AC5 | `code/booking.py` returns only `True`/`False`, reads `existing` without changing it; page: `web/final/src/App.tsx` result card shows only "Available"/"Unavailable"; bookings are constants; `setResult(null)` on every input change | T11, T1-T10 (one clear result each) | T11 Available on the second check too; existing unchanged | Python v1 (write here); page: T11 Available twice, but the result did not follow input changes (issue 1) | Python: T11 True, existing unchanged (tests); page: T11 Available twice, result cleared on change |
| AC6 | page only: `web/final/src/App.tsx` reason text in the result card; Tailwind layout `max-w-2xl px-4`, `grid-cols-2`, `flex-wrap` | T12, T7 (feedback for reversed times) | T12 Available and readable at ~375 px; T7 shows a clear message | page: reasons shown (e.g. T7 "Times must be valid: start before end"); T12 Available, no horizontal scroll at 375 px | page: same reasons; T12 Available, scrollWidth 375 at 375 px (evidence/final-narrow.png) |

## 7. Issue log

<!-- At least two, from v1 — a functional defect and a usability or code-quality issue where you
     have them. If every case passed on v1, log the preventive cleanup and say why.
     Reproduction names a case (T1-T12) or an AC. Priority: High, Medium or Low.
     Prompt / change: the focused prompt you sent, and what changed. Never "make it better". -->

| # | Issue | Reproduction | Priority | Prompt / change | Retest result |
| --- | --- | --- | --- | --- | --- |
| 1 | The result card is not cleared when the inputs change, so it can show "Available" for a request that is blocked or overlapping | T1 (11:00-12:00) -> Check -> Available; then switch Room blocked on (T3 input) or change the times to 10:30-11:30 (T2 input) without pressing Check: the page still shows "Available - Room 204 is free from 10:30 to 11:30". Breaks AC5 (unambiguous result) and AC3 | High | Prompt: "Choosing 11:00-12:00 and pressing Check availability shows Available. If I then switch Room blocked on, or change the times to 10:30-11:30, without pressing Check again, the page still shows Available for the new inputs. AC5 says the result must be unambiguous and AC3 says a blocked room is always unavailable. Make the smallest change that fixes this: clear the result whenever the start time, end time, the test booking checkbox or the Room blocked switch changes. Do not change any rule and do not add features." Change: Bolt added `setResult(null)` to the four change handlers in `src/App.tsx` (start time, end time, test booking checkbox, Room blocked switch) - Bolt "Version 2: Clear result on input change" | 11:00-12:00 -> Check -> Available; then Room blocked switched on without pressing Check -> the result card disappears; Check again -> Unavailable "Room 204 is currently blocked". Fixed (evidence/after-1.png) |
| 2 | `package.json` depends on `@supabase/supabase-js`, a database/backend client that the page never imports | Scope of AC1-AC6 forbids a database and backend; `grep -n supabase web/original/package.json` -> line 14 | Medium | Prompt: "package.json lists @supabase/supabase-js, but the page never uses it and the brief forbids any database or backend. Remove this dependency from package.json and nothing else." Change: Bolt removed the `@supabase/supabase-js` line from `package.json`; no source file changed for this prompt | `diff web/original/package.json web/final/package.json` shows only the supabase line removed; the checker's scope scan (W3) finds nothing in `web/final/`; T1-T12 rerun on the final page give the expected results. Fixed |
| 3 | The page cannot express a booking that ends at midnight, so T8 cannot be tested and 23:00-00:00 is rejected | T8 (23:00-24:00): the time input does not accept 24:00; the nearest input 23:00-00:00 showed "Unavailable - start before end" (evidence/v1-cases/T8.png). AC1 allows end = 1440 | Medium | Prompt: "Case T8: AC1 allows a booking that ends exactly at midnight (end = 1440), but the end time input cannot hold 24:00, and 23:00-00:00 shows \"Unavailable - start before end\". Make the smallest change: add a checkbox \"Ends at midnight (24:00)\" next to End time; when it is checked, use 1440 as the end minute. Do not change any other rule and do not add other features." Change: Bolt added an "Ends at midnight (24:00)" checkbox under End time that disables the time picker and uses 1440; toggling it also clears the result (Version 4) | 23:00 + Ends at midnight -> Check -> Available "Room 204 is free from 23:00 to 24:00" (evidence/final-cases/T8.png). Fixed |

**Before / after:** `evidence/before-1.png` (v1 export in Chromium) → `evidence/after-1.png` (final, Bolt preview) show issue 1: v1 still shows Available after Room blocked is switched on and the times are changed to 10:30-11:30; after the fix the result is cleared until Check is pressed again.

## 8. Critique decisions

<!-- The AI's review against AC1-AC6 (stage C), claim by claim. At least three rows.
     How I verified it: the case, test or run that confirmed or refuted the claim.
     Decision: accept, reject or modify. At least one reject or modify — the reflection asks for it. -->

| # | AI claim or recommendation | How I verified it | Decision | Reason (AC or case) |
| --- | --- | --- | --- | --- |
| 1 | (write here) | (write here) | (write here) | (write here) |
| 2 | (write here) | (write here) | (write here) | (write here) |
| 3 | (write here) | (write here) | (write here) | (write here) |

## 9. Coding-agent analysis

### 9.1 The loop

<!-- One real pass through the loop from this assignment — with your assistant or with Bolt. -->

| Step | What happened in this assignment |
| --- | --- |
| User goal | (write here) |
| Model / plan | (write here) |
| Tool call | (write here) |
| Observation | (write here) |
| Next step | (write here) |
| Human review | (write here) |

### 9.2 Context, tools and permissions

<!-- At least three rows. Last column: Observed (you saw it happen) or Assumed (you infer it
     about the internals). Use both at least once. -->

| Tool | Context it used | Tools or permissions | Observed or assumed |
| --- | --- | --- | --- |
| (write here) | (write here) | (write here) | (write here) |
| (write here) | (write here) | (write here) | (write here) |
| (write here) | (write here) | (write here) | (write here) |

### 9.3 Checkpoint and dependability

**Safety checkpoint:** (write here)

**Reliability, security, responsibility:** (write here)

## 10. Reflection

<!-- 100-200 words, in your own words, no AI. Compare AI-assisted coding (the Python part) with
     vibe coding (the Bolt part); one example each of a reliability, an availability/usability and
     a security risk; why review, tool permissions and tests stay human responsibilities; one AI
     recommendation you rejected or modified, and why; what you would improve next without
     expanding the scope. -->

(write here)

## 11. Appendix A — AI exchanges

<!-- At least four. Complete prompts and complete responses, as text — never screenshots. Paste
     each inside the ~~~~ block that follows its label.
     Stage: Plan, Generate, Critique or Repair (the brief's A-D) — at least one of each.
     Source: this SIS, week-05 or week-06. Reused exchanges keep their original date.
     The Generate exchange for Python must contain your v1 exactly as it is in code/original/.
     Add B5, B6 … if you ran more. -->

### B1

- **Tool:** (write here)
- **Model:** (write here)
- **Date:** (write here)
- **Stage:** (write here)
- **Source:** (write here)

**Prompt:**

~~~~text
(paste here)
~~~~

**Response:**

~~~~text
(paste here)
~~~~

### B2

- **Tool:** (write here)
- **Model:** (write here)
- **Date:** (write here)
- **Stage:** (write here)
- **Source:** (write here)

**Prompt:**

~~~~text
(paste here)
~~~~

**Response:**

~~~~text
(paste here)
~~~~

### B3

- **Tool:** (write here)
- **Model:** (write here)
- **Date:** (write here)
- **Stage:** (write here)
- **Source:** (write here)

**Prompt:**

~~~~text
(paste here)
~~~~

**Response:**

~~~~text
(paste here)
~~~~

### B4

- **Tool:** Bolt.new
- **Model:** not displayed
- **Date:** 2026-10-22
- **Stage:** Repair
- **Source:** this SIS

**Prompt:**

~~~~text
Choosing 11:00-12:00 and pressing Check availability shows Available. If I then switch Room blocked on, or change the times to 10:30-11:30, without pressing Check again, the page still shows Available for the new inputs. AC5 says the result must be unambiguous and AC3 says a blocked room is always unavailable. Make the smallest change that fixes this: clear the result whenever the start time, end time, the test booking checkbox or the Room blocked switch changes. Do not change any rule and do not add features.
~~~~

**Response:**

~~~~text
I'll add setResult(null) to each of the four control change handlers so the result clears whenever inputs change.

[2 actions taken]

Now whenever you change the start time, end time, test-booking checkbox, or flip the Room blocked switch, the previous result disappears — so a stale "Available" can no longer mislead you when the new inputs would actually be unavailable. You just press "Check availability" again to get a fresh result. No rules or features were changed.

[Version 2: Clear result on input change]
[Follow up suggestions shown by Bolt: "Add preset time buttons", "Show daily schedule timeline" - not used]
~~~~

## 12. Appendix B — Test output

### 12.1 Your suite

<!-- The complete terminal output of your final suite. Path A: python -m unittest -v, run inside
     code/ — the part ending in "Ran N tests" and OK or FAILED. -->

~~~~text
test_t1_touching_end_is_allowed (test_booking.BriefCases.test_t1_touching_end_is_allowed) ... ok
test_t2_overlap_is_rejected (test_booking.BriefCases.test_t2_overlap_is_rejected) ... ok
test_t3_blocked_room_is_rejected (test_booking.BriefCases.test_t3_blocked_room_is_rejected) ... ok
test_t4_exactly_120_minutes_is_allowed (test_booking.BriefCases.test_t4_exactly_120_minutes_is_allowed) ... ok
test_t5_121_minutes_is_rejected (test_booking.BriefCases.test_t5_121_minutes_is_rejected) ... ok
test_t6_starts_now_is_rejected (test_booking.BriefCases.test_t6_starts_now_is_rejected) ... ok
test_accepts_tuple_of_bookings (test_booking.NoMutation.test_accepts_tuple_of_bookings) ... ok
test_existing_unchanged_after_accepted_request (test_booking.NoMutation.test_existing_unchanged_after_accepted_request) ... ok
test_existing_unchanged_after_rejected_request (test_booking.NoMutation.test_existing_unchanged_after_rejected_request) ... ok
test_t11_same_check_twice_gives_same_answer (test_booking.NoMutation.test_t11_same_check_twice_gives_same_answer) ... ok
test_blocked_with_no_bookings_is_rejected (test_booking.Overlaps.test_blocked_with_no_bookings_is_rejected) ... ok
test_containing_existing_is_rejected (test_booking.Overlaps.test_containing_existing_is_rejected) ... ok
test_ends_at_existing_start_is_allowed (test_booking.Overlaps.test_ends_at_existing_start_is_allowed) ... ok
test_fits_exactly_between_two_bookings (test_booking.Overlaps.test_fits_exactly_between_two_bookings) ... ok
test_identical_to_existing_is_rejected (test_booking.Overlaps.test_identical_to_existing_is_rejected) ... ok
test_inside_existing_is_rejected (test_booking.Overlaps.test_inside_existing_is_rejected) ... ok
test_no_bookings_at_all_is_allowed (test_booking.Overlaps.test_no_bookings_at_all_is_allowed) ... ok
test_overlap_in_unsorted_list_is_rejected (test_booking.Overlaps.test_overlap_in_unsorted_list_is_rejected) ... ok
test_partial_overlap_over_start_is_rejected (test_booking.Overlaps.test_partial_overlap_over_start_is_rejected) ... ok
test_t10_overlap_with_second_booking_is_rejected (test_booking.Overlaps.test_t10_overlap_with_second_booking_is_rejected) ... ok
test_negative_start_is_rejected (test_booking.TimeOrderAndBounds.test_negative_start_is_rejected) ... ok
test_one_minute_after_now_is_allowed (test_booking.TimeOrderAndBounds.test_one_minute_after_now_is_allowed) ... ok
test_start_in_the_past_is_rejected (test_booking.TimeOrderAndBounds.test_start_in_the_past_is_rejected) ... ok
test_start_zero_when_now_is_zero_is_rejected (test_booking.TimeOrderAndBounds.test_start_zero_when_now_is_zero_is_rejected) ... ok
test_t7_reversed_times_are_rejected (test_booking.TimeOrderAndBounds.test_t7_reversed_times_are_rejected) ... ok
test_t8_ending_at_1440_is_allowed (test_booking.TimeOrderAndBounds.test_t8_ending_at_1440_is_allowed) ... ok
test_t9_ending_after_1440_is_rejected (test_booking.TimeOrderAndBounds.test_t9_ending_after_1440_is_rejected) ... ok
test_zero_length_is_rejected (test_booking.TimeOrderAndBounds.test_zero_length_is_rejected) ... ok

----------------------------------------------------------------------
Ran 28 tests in 0.001s

OK
~~~~

### 12.2 Path B only — three faults you planted

<!-- Path A: leave this table as it is. Path B: three rows — the line you broke, the AC it
     breaks, the test that failed. -->

| # | Line you broke | AC | Test that failed |
| --- | --- | --- | --- |
| 1 | | | |
| 2 | | | |
| 3 | | | |

## 13. Remaining limitations and known fails

<!-- One row per check ID in submission.yml known_fails, and any limitation you know of.
     If the checker is clean and you know of none, one row that says so. -->

| Check ID or limitation | Why it stays | What I would do next |
| --- | --- | --- |
| (write here) | (write here) | (write here) |