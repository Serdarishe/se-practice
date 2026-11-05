# Week 07 — Lab report

**Name:** Serdar Dundar (24B031016)
**Group:** CSCI-2208
**Date:** 2026-11-05

Fill in every section. **Do not delete, rename or renumber the headings.** The checker and the
grader find your answers by them. You can add rows to any table, but never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Project I continue (`week-06` = my Week 06 Bolt project, `starter` = the provided starter) | week-06 - my Week 06 prototype (`week-06/prototype/index.html`, plain HTML + JS, no Bolt) |
| Bolt project link (or `not shared`, and why) | not shared - no Bolt project exists; in Week 06 Bolt.new was not available and Claude built the page, which is committed in `week-06/prototype/` |
| Assistant that generated the tests (tool) | |
| Exact model (with its version, or `not displayed`) | |
| Where I ran the tests (Bolt terminal / my computer / Codespace) | |
| Vitest version (the `RUN  v…` line of a run) | |
| Test command | |

---

## 2. Task 1 — baseline and the booking function

**Before editing:** where did the booking decision live in the project you started from?

| | |
| --- | --- |
| File and function (or "inside the page component") | `week-06/prototype/index.html`, inline `<script>`, function `checkAvailability(room, start, end, current)` |
| Its inputs | the room object (`blocked`, `bookings`), start and end in minutes, the current time in minutes (from the "Current time" input) |
| What it returned | an object `{ ok, reason }` - `ok` true/false and a reason message naming the AC that failed |
| How the page used it | the "Check availability" click handler converted HH:MM to minutes, called it, and showed Available / Unavailable from `ok` and the text from `reason` |

**What I changed to extract `canBook`.** Say which file it now lives in, what you moved, and why
the behaviour did not change. Also say which file of the page now calls it. 40 words or more.

<!-- Write below this line -->

The decision now lives in `app/src/booking.js` as `export function canBook({ start, end, now, blocked, bookings })`. I copied the five conditions of `checkAvailability` in the same order and with the same operators (`start >= 0 && start < end && end <= 1440`, `start <= now`, `end - start > 120`, `blocked`, `start < b.end && b.start < end`), but each one now returns `false` instead of `{ ok: false, reason }`, and the end returns `true`. The inline `<script>` moved to `app/src/main.js`, which does `import { canBook } from './booking.js'` and calls it in the "Check availability" handler. The HH:MM to minutes conversion and the reason messages stay in the page: `reasonFor()` in `main.js` only chooses the text after `canBook` has said false. I added `package.json` with Vite (to serve the module page) and Vitest. To check that nothing changed, I ran the same 12 inputs (all three rooms, blocked toggle, 120/121 minutes, touching, reversed, empty start) on the old `index.html` and on the new page in Chromium: all 12 results and messages were identical.

---

## 3. Task 2 — the test plan

Default fixture: `now = 540`, `blocked = false`, `bookings = [{ start: 600, end: 660 }]`, fresh
for every test. **The Expected column comes from AC1–AC4, never from the code.** Write the
**reason** for each expected result **before** you send the generation prompt.

| ID | Candidate / changed input | Expected | AC | Reason (in your words) |
| --- | --- | --- | --- | --- |
| T01 | 660–720 (touching after) | true | AC4 | 660 is the end of the 600-660 booking and the start of the request, so they share only a point and do not overlap; 9:00 < 11:00 and 60 min |
| T02 | 540–570 (starts now) | false | AC1 | start 540 equals now 540; AC1 needs start strictly after now, and 'now' is not 'after now' |
| T03 | 720–720 (zero duration) | false | AC1 | start 720 = end 720, so start < end is false; a zero-minute slot is not an interval |
| T04 | 750–720 (reversed) | false | AC1 | start 750 is bigger than end 720, so start < end fails; a reversed interval is rejected by AC1 |
| T05 | 1380–1441 (past day end) | false | AC1 | end 1441 is one minute past 1440 (24:00), so end <= 1440 fails even though it is 61 minutes |
| T06 | 720–840 (120 minutes) | true | AC2 | 840 - 720 = 120, and AC2 rejects only LONGER than 120, so exactly 120 is still allowed; no overlap with 600-660 |
| T07 | 720–841 (121 minutes) | false | AC2 | 841 - 720 = 121 minutes, one more than the 120 limit, so AC2 rejects it |
| T08 | 570–600 (touching before) | true | AC4 | 600 is the end of the request and the start of the booking: they only touch, and 570 is after now 540 |
| T09 | 630–690 (partial overlap) | false | AC4 | 630-690 and 600-660 share 630-660 (30 minutes), so the request overlaps the booking |
| T10 | 570–690 (contains booking) | false | AC4 | 570-690 covers the whole booking 600-660 inside it, so they overlap for 60 minutes |
| T11 | 615–645 (inside booking) | false | AC4 | 615-645 lies fully inside 600-660, every minute of it is already booked |
| T12 | 600–660 (identical interval) | false | AC4 | the same 600-660 interval as the booking overlaps it completely |
| T13 | 660–720, blocked = true | false | AC3 | 660-720 alone would be fine (touching, like T01), so the only reason to reject is the blocked room (AC3) |
| T14 | 630–690, bookings = [] | true | AC4 | 630-690 overlapped the booking in T09, but with no bookings there is nothing to overlap and AC1/AC2 pass (60 min, after 9:00) |
| AC5 | an Available request — the bookings after the call equal the bookings before | true, data unchanged | AC5 | canBook only answers a question; an Available answer must not add the request to bookings or change the 600-660 entry |
| X1 | 1320-1440 (ends exactly at 24:00, 120 minutes) | true | AC1, AC2 | 1440 is the allowed upper end (end <= 1440) and 1440 - 1320 = 120 is not longer than 120; T05 only tests one minute past the end, not the end itself |
| X2 | 660-750, bookings = [{600-660}, {720-780}] | false | AC4 | touches the first booking at 660 (allowed) but overlaps the SECOND booking 720-780 for 30 minutes; T01-T14 have at most one booking, so a canBook that only checks bookings[0] would pass all of them |

X1 and X2 are **your own two cases**: a boundary or a state that T01–T14 do not reach. Fill all
five columns.

---

## 4. Task 3 — the generation prompt and the first suite

**The prompt exactly as I sent it.** Use the deck's prompt with `[our test framework]` replaced by
`Vitest`, followed by the case table from section 3:

```text
[Chat-only reply: answer in text in this chat. Do not create files, read files or run commands.]

Generate tests for the existing booking function using Vitest. Use AC1–AC6 and the reviewed case table below.

Import the real function used by the page. Keep its code unchanged. Use fixed time and fresh fixtures. Assert exact decisions and unchanged booking data.

Return the test file, run command, and AC mapping. Flag unclear requirements. We will run the tests ourselves.

AC1: Accept a candidate interval only when 0 ≤ start < end ≤ 1440 and start is after the supplied current time.
AC2: Reject a booking longer than 120 minutes.
AC3: Reject the request when the selected room is blocked.
AC4: Reject any interval that overlaps an existing booking; touching endpoints are allowed.
AC5: Show a clear Available / Unavailable decision without changing the existing booking data.
AC6: The page remains usable at desktop and narrow/mobile width and gives understandable validation feedback.

Case table (default fixture: now = 540, blocked = false, bookings = [{ start: 600, end: 660 }], fresh for every test):

| ID | Candidate / changed input | Expected | AC | Reason (in your words) |
| --- | --- | --- | --- | --- |
| T01 | 660–720 (touching after) | true | AC4 | 660 is the end of the 600-660 booking and the start of the request, so they share only a point and do not overlap; 9:00 < 11:00 and 60 min |
| T02 | 540–570 (starts now) | false | AC1 | start 540 equals now 540; AC1 needs start strictly after now, and 'now' is not 'after now' |
| T03 | 720–720 (zero duration) | false | AC1 | start 720 = end 720, so start < end is false; a zero-minute slot is not an interval |
| T04 | 750–720 (reversed) | false | AC1 | start 750 is bigger than end 720, so start < end fails; a reversed interval is rejected by AC1 |
| T05 | 1380–1441 (past day end) | false | AC1 | end 1441 is one minute past 1440 (24:00), so end <= 1440 fails even though it is 61 minutes |
| T06 | 720–840 (120 minutes) | true | AC2 | 840 - 720 = 120, and AC2 rejects only LONGER than 120, so exactly 120 is still allowed; no overlap with 600-660 |
| T07 | 720–841 (121 minutes) | false | AC2 | 841 - 720 = 121 minutes, one more than the 120 limit, so AC2 rejects it |
| T08 | 570–600 (touching before) | true | AC4 | 600 is the end of the request and the start of the booking: they only touch, and 570 is after now 540 |
| T09 | 630–690 (partial overlap) | false | AC4 | 630-690 and 600-660 share 630-660 (30 minutes), so the request overlaps the booking |
| T10 | 570–690 (contains booking) | false | AC4 | 570-690 covers the whole booking 600-660 inside it, so they overlap for 60 minutes |
| T11 | 615–645 (inside booking) | false | AC4 | 615-645 lies fully inside 600-660, every minute of it is already booked |
| T12 | 600–660 (identical interval) | false | AC4 | the same 600-660 interval as the booking overlaps it completely |
| T13 | 660–720, blocked = true | false | AC3 | 660-720 alone would be fine (touching, like T01), so the only reason to reject is the blocked room (AC3) |
| T14 | 630–690, bookings = [] | true | AC4 | 630-690 overlapped the booking in T09, but with no bookings there is nothing to overlap and AC1/AC2 pass (60 min, after 9:00) |
| AC5 | an Available request — the bookings after the call equal the bookings before | true, data unchanged | AC5 | canBook only answers a question; an Available answer must not add the request to bookings or change the 600-660 entry |
| X1 | 1320-1440 (ends exactly at 24:00, 120 minutes) | true | AC1, AC2 | 1440 is the allowed upper end (end <= 1440) and 1440 - 1320 = 120 is not longer than 120; T05 only tests one minute past the end, not the end itself |
| X2 | 660-750, bookings = [{600-660}, {720-780}] | false | AC4 | touches the first booking at 660 (allowed) but overlaps the SECOND booking 720-780 for 30 minutes; T01-T14 have at most one booking, so a canBook that only checks bookings[0] would pass all of them |

The function, app/src/booking.js (the page app/src/main.js imports it with `import { canBook } from './booking.js'`):

[here followed the full code of app/src/booking.js at commit 400ecd4, inside a js code fence - shown in section 2 / app/src/booking.js; the fence is left out here only so this markdown block does not break]
```

**The assistant's answer: run command, AC mapping and any unclear requirements it flagged,
pasted unedited.** Its test file goes to `suites/first/` and is not pasted here. The assistant was a fresh Claude agent (claude-opus-5-5) with no earlier context; the first line in brackets above was the only thing added to the deck's prompt, so it would answer as a chat instead of writing files. Its answer is pasted unedited, except that the test file is replaced by a pointer and the run command's code fence is shown as indented lines (so this block does not break):

```text
Here's the test file, run command, AC mapping and the requirement flags. I didn't create any files or run anything, as you asked.

I traced every row by hand against the current `canBook`, and all 19 table cases should pass as the code is now. Your own run is the real check.

### Test file: `app/src/booking.test.js`

It sits next to `booking.js` and uses the same import path as `main.js`.

[test file - saved unedited as suites/first/booking.test.js]

### Run command

Run this from the `app/` folder (Vitest needs Node 18 or newer):

    npm install -D vitest
    npx vitest run src/booking.test.js

If you want, add `"test": "vitest run"` to `app/package.json` and then just run `npm test`.

### AC mapping

| AC | Covered by |
| --- | --- |
| AC1 | T02, T03, T04, T05, X1 |
| AC2 | T06, T07, X1 |
| AC3 | T13 |
| AC4 | T01, T08, T09, T10, T11, T12, T14, X2 |
| AC5 | Every table case checks the input is unchanged, plus the 3 AC5 tests. The UI display part is not covered. |
| AC6 | Not covered. These are unit tests and can't check layout or feedback (see flag 1). |

### Unclear requirements

1. **AC6 and the display part of AC5 can't be unit-tested here.** Desktop vs mobile layout and how the decision is shown in `main.js` need a manual check or a browser test (for example Playwright at about 1280px and 375px wide).
2. **`canBook` only returns true/false, with no reason.** AC6 asks for "understandable validation feedback". The page can't explain why a request was rejected (blocked, overlap, too long or bad time) without its own extra checks. Should the function return a reason?
3. **The `start >= 0` check is never reached by the table.** With now = 540, any negative start is already rejected by `start <= now`. You'd need a case with a negative `now` to test it. Can `now` be negative or above 1440 at all? The spec doesn't say.
4. **"After the current time" is read as strictly after (T02).** This matches the code and the table, but the AC wording should say so explicitly.
5. **Bad input isn't specified.** Nothing says what should happen with non-integer minutes, NaN, strings, a missing `bookings` array (the current code would throw) or invalid existing bookings (end <= start). The tests assume input is always valid.
6. **The AC5 row doesn't give a candidate.** I used T01's 660-720 for the Available case and added 630-690 as an Unavailable check.
7. **"Fixed time" only applies to `canBook` itself, because it takes `now` as input.** If `main.js` builds `now` from `Date`, that conversion is not tested here.
```

The first suite was saved to `suites/first/` **before** I changed anything in it: yes

---

## 5. Task 4 — review of the first suite

Review it **before** you run it. Look at the imports, the expected values, isolation, duplicates
and skipped tests. Make one row per decision. At least **two** rows, and each one names the kind of
weakness (the deck's table: *no exception occurred* · *expected = current output* · *only valid
requests* · *mocked booking function*, or your own) and the AC that decides it.

| # | Test or part of the suite | What is weak or wrong | Decision: accept / revise / reject | AC or reason |
| --- | --- | --- | --- | --- |
| 1 | | | accept / revise / reject | |
| 2 | | | accept / revise / reject | |

---

## 6. Task 5 — running, diagnosing, improving

### 6.1 The first run

The **real** terminal output of the first run of the first suite, pasted unedited. Include the
`RUN  v…` line and the `Tests` summary line. A build message or the assistant saying "tests pass"
is not a run.

```text
(paste here)
```

**Each failure, diagnosed** (the deck's table: import/runner error · assertion mismatch · result
changing per run · no tests discovered). Write `none` in the first row if nothing failed.

| Failing test | Observed failure | First check | Test repair or implementation fix? | Action taken |
| --- | --- | --- | --- | --- |
| | | | | |

### 6.2 The improvement prompt

The deck's improvement prompt exactly as sent, followed by the actual output from 6.1. Then
paste the assistant's answer, unedited:

```text
(paste here)
```

### 6.3 The final run

The **real** output of the final suite (`booking.test.*` beside your module), after every
change and after restoring the correct code from section 7. Every test must pass. If a real defect
is still open, leave its test failing and explain it in 9.1.

```text
(paste here)
```

---

## 7. Task 6 — deliberate defects

You need a reviewed, passing suite first. Then introduce **one** defect at a time in your booking
module, leave the tests unchanged, run, record, and **restore** the code. A syntax or import
error does not count as detection.

| Trial | Intentional change | Detected / Survived | Failing test ID(s) | If it survived: why, and what you added |
| --- | --- | --- | --- | --- |
| M1 | Reject duration >= 120 instead of > 120 | Detected / Survived | | |
| M2 | Treat touching endpoints as an overlap | Detected / Survived | | |
| M3 | Remove the blocked-room rejection | Detected / Survived | | |

**The run of each mutant, pasted unedited.** Paste the `Tests` summary line and the failing test
names at least:

```text
(paste here)
```

All three changes reverted, and the full suite run again (section 6.3): yes / no

---

## 8. Task 7 — manual UI checks

Use `now = 09:00` and an existing `10:00–11:00` booking. Do them in the page in a browser. Save a
screenshot of each as `evidence/ui-1.png` … `evidence/ui-5.png`. Take **ui-4 at phone width**
(about 375 px, portrait).

| # | Action | Expected observation | AC | What I observed | Pass / Fail / Not testable |
| --- | --- | --- | --- | --- | --- |
| U1 | Check 11:00–12:00, unblocked | Available, with the fixed sample booking | AC5 | | Pass / Fail / Not testable |
| U2 | Enable blocked, then check again | Unavailable replaces the earlier result | AC3, AC5 | | Pass / Fail / Not testable |
| U3 | Clear a required input and submit | Understandable validation feedback | AC6 | | Pass / Fail / Not testable |
| U4 | Use a narrow (phone) width | Controls and result remain usable | AC6 | | Pass / Fail / Not testable |
| U5 | Repeat the checks on the same data | Existing bookings remain unchanged | AC5 | | Pass / Fail / Not testable |

---

## 9. Comparison and what still fails

### 9.1 Checks I am keeping as FAIL or ERROR

Use the same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| | |

### 9.2 Original and improved suites

| Measure | First suite | Improved suite |
| --- | --- | --- |
| Executed / passed / failed | | |
| Requirements with meaningful tests (AC IDs and gaps) | | |
| Selected mutants detected | | |
| Accepted / revised / rejected tests | | |
| Remaining limitations | | |

### 9.3 What no AC decides

Call your function with `bookings = [{ start: 700, end: 650 }]` (a reversed existing booking)
and a request of 660–720. What does it return? Does any AC say what it should return? (This is
the value you declare in `submission.yml` under `assumptions.invalid_existing_booking`.)

-

---

## 10. Conclusion (120–180 words)

<!-- Answer all three in your own words, without the assistant:
     (a) Which mistake in the FIRST suite would have let a wrong canBook pass, and how did you find it?
     (b) What does your final green run prove, and what does it NOT prove? Use a mutant or a UI check.
     (c) One testing limitation that remains.
     Worthless: "The AI wrote good tests and they all passed."
     Worth everything: "The first suite expected T06 (exactly 120 minutes) to be rejected. That
     contradicts AC2, and it failed on a correct canBook. If I had changed the code to make it
     pass, M1 would have become the real behaviour." -->

<!-- Write your conclusion below this line -->
