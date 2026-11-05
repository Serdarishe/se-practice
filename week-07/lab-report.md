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
| Assistant that generated the tests (tool) | Claude - a fresh Claude Code agent chat with no earlier context, started from my Claude app session (Bolt.new not available, as in Week 06) |
| Exact model (with its version, or `not displayed`) | claude-opus-5-5 |
| Where I ran the tests (Bolt terminal / my computer / Codespace) | Claude cloud session (Linux container, Node 22.23.4), the same as running it on my computer with `npm install` and `npx vitest run` in `app/` |
| Vitest version (the `RUN  v…` line of a run) | 3.2.7 |
| Test command | `npx vitest run` (same as `npm test`) from `week-07/app/` |

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

Later change, found by UI check U3 (section 8): an empty time field gave the misleading AC1 message "The end time must be later than the start time". I added an empty-field check at the top of the click handler in `src/main.js` (page only, `booking.js` untouched): it now says which field to fill in and makes no decision.

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
| 1 | `test.each(cases)` for T01-T14, X1, X2 | Table-driven: the 16 cases share one test body, so a case has no name of its own and a failing row is hard to find; the course rule is one test per case with the ID in the title | revise | Every ID needs its own test (`test('T06 AC2: ...')`). The inputs and expected values in the table are kept, they match my section 3 plan |
| 2 | Expected values and inputs of T01-T14, X1, X2 | I checked all 16 rows against section 3 before running: same start/end, T13 blocked, T14 `[]`, X2 two bookings; expected values come from the ACs, not copied from the code (not "expected = current output") | accept | AC1 (T02-T05), AC2 (T06, T07, X1), AC3 (T13), AC4 (T01, T08-T12, T14, X2) |
| 3 | `beforeEach` with `vi.useFakeTimers()` + `vi.setSystemTime(new Date(...))`, and the "fixed time" test at the end | The suite itself reads and fakes the clock (`new Date`), although `canBook` never touches it; the last test only repeats T01 at another wall time | reject | AC1 says "the supplied current time": `now` is a number we pass (540). Fixed time = no clock in the suite at all |
| 4 | AC5 test 3: frozen inputs + `expect(...).not.toThrow()` | Weak kind "no exception occurred": it depends on strict mode throwing on a write and duplicates AC5 test 1, which already asserts `true` | reject | AC5 is better checked by comparing `bookings` with a copy taken before the call |
| 5 | AC5 test 1 (Available 660-720) | Good: asserts `.toBe(true)` and compares the bookings, but against a hand-written literal; no `AC5` ID in the title | revise | AC5: take `structuredClone(bookings)` before the call and `toEqual` it after; put `AC5` in the title |
| 6 | AC5 test 2 (Unavailable 630-690, bookings unchanged) | A rejected request returns before the overlap loop ends, so it may never reach code that could change the data - proves little | reject | AC5 (README Part 4: "a rejected request may never reach the code that changes them") |
| 7 | Imports: `import { canBook } from './booking.js'`, no `vi.mock` | The real module used by the page is imported, nothing is mocked | accept | Deck's weak test "mocked booking function" is not present; the page imports the same file |

---

## 6. Task 5 — running, diagnosing, improving

### 6.1 The first run

The **real** terminal output of the first run of the first suite, pasted unedited. Include the
`RUN  v…` line and the `Tests` summary line. A build message or the assistant saying "tests pass"
is not a run.

```text

 RUN  v3.2.7 /home/claude/se-practice/week-07/app

 ✓ src/booking.test.js (20 tests) 23ms

 Test Files  1 passed (1)
      Tests  20 passed (20)
   Start at  17:23:45
   Duration  427ms (transform 55ms, setup 0ms, collect 45ms, tests 23ms, environment 0ms, prepare 111ms)
```

**Each failure, diagnosed** (the deck's table: import/runner error · assertion mismatch · result
changing per run · no tests discovered). Write `none` in the first row if nothing failed.

| Failing test | Observed failure | First check | Test repair or implementation fix? | Action taken |
| --- | --- | --- | --- | --- |
| none | nothing failed: 20 passed (20), all 16 table cases plus 4 extra tests | expected values checked against section 3 before the run (section 5, row 2): all 16 match the ACs, so a green run here is not "expected = current output" | neither - no failure to repair | kept the expectations; the suite still had to be revised for the rules in section 5 (test.each, clock, weak AC5 tests) |

### 6.2 The improvement prompt

The deck's improvement prompt exactly as sent, followed by the actual output from 6.1. Then
paste the assistant's answer, unedited:

```text
=== PROMPT AS SENT (same assistant chat as Task 3) ===

Review this test suite against AC1–AC6 and our case table. Identify incorrect expectations, weak assertions, duplicated cases, and missing boundaries.

For each proposed change, explain the requirement and the defect it could detect. Improve the tests without changing correct expectations to match buggy behavior.

Use the actual failure output below. Separate test repairs from implementation fixes.

 RUN  v3.2.7 /home/claude/se-practice/week-07/app

 ✓ src/booking.test.js (20 tests) 23ms

 Test Files  1 passed (1)
      Tests  20 passed (20)
   Start at  17:23:45
   Duration  427ms (transform 55ms, setup 0ms, collect 45ms, tests 23ms, environment 0ms, prepare 111ms)

[Chat-only reply again: answer in text, do not create files, read files or run commands.]

=== THE ASSISTANT'S ANSWER, UNEDITED (its code fences shown as 4-space indented lines and its numbered headings indented by 2 spaces, so this block does not break the report's own section numbers) ===

I reviewed the suite against AC1-AC6 and the case table. Your run passed all 20 tests, so there was no failure output to work from, and none of the findings point to a bug in `booking.js`. The run does show the expectations agree with the code. It doesn't show the tests would catch a bug, which is what the missing-boundary cases below are for.

I also need to correct my last report: it said "all 19 table cases". The suite actually had 16 table cases, 3 AC5 tests and 1 fixed-time test, which is the 20 your run reports. (The case table has 17 rows; its AC5 row is covered by the separate AC5 tests.)

  ## 1. Incorrect expectations

None. I checked all 16 table cases against AC1-AC4 directly, not against the code, and every expected value follows from the AC wording. Nothing was adjusted to match the implementation.

  ## 2. Test repairs

**Weak assertions**

- **R1 - Freeze the inputs in every case, not just one.**
  - *Requirement:* AC5 and "only reads its inputs".
  - *Defect it catches:* a `canBook` that sorts `bookings` in place (for example to scan them in order). The data comes back looking the same, so a before/after comparison passes. A write to a frozen array throws in strict mode, so freezing catches even a temporary write.
- **R2 - Compare with `toStrictEqual` instead of `toEqual`.**
  - *Requirement:* AC5, data unchanged.
  - *Defect it catches:* a field added with the value `undefined` (for example `b.checked = undefined`). `toEqual` ignores such fields; `toStrictEqual` doesn't. It stays in even with freezing because it's the readable "data unchanged" check.

**Duplicates removed**

- **R3 - The "Unavailable leaves bookings unchanged" test.** T09 already checks this.
- **R4 - The separate frozen test.** R1 now covers every case.
- **R5 - The "fixed time" test.** The `beforeEach` clock (23:30) already breaks T01, T06, T08, T14 and X1 if `canBook` reads the real time instead of `now`.
- **Merged:** the Available AC5 test now keeps only what T01 doesn't check: that the same array and the same booking object are still there.

**Missing boundaries added**

- **B1 - 541-571 gives true (AC1).** T02 only checks the reject side (start equal to now), not one minute after.
  - *Catches:* an off-by-one or hidden buffer, such as `start <= now + 1` or a "book at least N minutes ahead" rule nobody asked for.
- **B2 - 530-570 gives false (AC1).** Here the start is before now but the end is after it.
  - *Catches:* comparing `end` with `now` instead of `start`, or checking only `start === now`.
- **B3 - 659-719 gives false (AC4).** It overlaps the booking's end by 1 minute.
  - *Catches:* an off-by-one that also lets real overlaps through, such as `start < b.end - 1`. T09 overlaps by 30 minutes, which is too much to catch this.
- **B4 - 571-601 gives false (AC4).** It overlaps the booking's start by 1 minute.
  - *Catches:* the same mistake on the other side, such as `b.start + 1 < end`.
- **X3 - 630-690 with bookings [{720-780}, {600-660}] gives false (AC4).** The bookings are out of order.
  - *Catches:* a loop that assumes sorted bookings and stops early (`if (b.start >= end) break`). X2 has its bookings sorted, so it misses this.
- **X4 - 660-720 between 600-660 and 720-780 gives true (AC4).** It touches both bookings at once.
  - *Catches:* touching handled correctly on one side but not the other, or a check that only works with a single booking.
- **B0 - Lower bound start = 0 (AC1).** It is written but skipped until someone answers the question about negative `now` (see section 5).
  - *Catches:* `start > 0` instead of `start >= 0`.

I traced every new case by hand against the current `canBook` and all should pass. What you should see is **23 passed, 2 skipped**.

  ## 3. Implementation fixes

None. No test fails, and no expectation that follows from the ACs disagrees with `booking.js`. Section 5 has requirement questions, which aren't bugs.

  ## 4. Revised `app/src/booking.test.js`

    // app/src/booking.test.js
    // Unit tests for canBook (AC1-AC5). booking.js is imported as-is, not modified.
    import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
    import { canBook } from './booking.js';

    const NOW = 540; // 09:00, the supplied current time

    // Fresh fixture for every test: new object, new array, new booking objects.
    function makeInput(start, end, overrides = {}) {
      return {
        start,
        end,
        now: NOW,
        blocked: false,
        bookings: [{ start: 600, end: 660 }],
        ...structuredClone(overrides),
      };
    }

    // AC5: any write (push, sort, field change), even a temporary one, throws in strict-mode ESM.
    function deepFreeze(input) {
      input.bookings.forEach(Object.freeze);
      Object.freeze(input.bookings);
      return Object.freeze(input);
    }

    function checkCase({ start, end, overrides, expected }) {
      const input = makeInput(start, end, overrides);
      const before = structuredClone(input);
      deepFreeze(input);

      let result;
      expect(() => { result = canBook(input); }).not.toThrow();
      expect(result).toBe(expected);          // exact boolean
      expect(input).toStrictEqual(before);    // data unchanged, no added undefined fields
    }

    beforeEach(() => {
      // Wall clock fixed far from now = 540 (23:30 local): a canBook that read Date
      // instead of the supplied now would fail T01, T06, T08, T14, X1, B1, X4.
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 15, 23, 30, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const TWO = [{ start: 600, end: 660 }, { start: 720, end: 780 }];

    const cases = [
      // Reviewed case table
      { id: 'T01', start: 660,  end: 720,  overrides: {},                expected: true,  ac: 'AC4',     note: 'touching after' },
      { id: 'T02', start: 540,  end: 570,  overrides: {},                expected: false, ac: 'AC1',     note: 'starts exactly now' },
      { id: 'T03', start: 720,  end: 720,  overrides: {},                expected: false, ac: 'AC1',     note: 'zero duration' },
      { id: 'T04', start: 750,  end: 720,  overrides: {},                expected: false, ac: 'AC1',     note: 'reversed' },
      { id: 'T05', start: 1380, end: 1441, overrides: {},                expected: false, ac: 'AC1',     note: 'one minute past day end' },
      { id: 'T06', start: 720,  end: 840,  overrides: {},                expected: true,  ac: 'AC2',     note: 'exactly 120 min' },
      { id: 'T07', start: 720,  end: 841,  overrides: {},                expected: false, ac: 'AC2',     note: '121 min' },
      { id: 'T08', start: 570,  end: 600,  overrides: {},                expected: true,  ac: 'AC4',     note: 'touching before' },
      { id: 'T09', start: 630,  end: 690,  overrides: {},                expected: false, ac: 'AC4',     note: 'partial overlap' },
      { id: 'T10', start: 570,  end: 690,  overrides: {},                expected: false, ac: 'AC4',     note: 'contains booking' },
      { id: 'T11', start: 615,  end: 645,  overrides: {},                expected: false, ac: 'AC4',     note: 'inside booking' },
      { id: 'T12', start: 600,  end: 660,  overrides: {},                expected: false, ac: 'AC4',     note: 'identical interval' },
      { id: 'T13', start: 660,  end: 720,  overrides: { blocked: true }, expected: false, ac: 'AC3',     note: 'room blocked' },
      { id: 'T14', start: 630,  end: 690,  overrides: { bookings: [] },  expected: true,  ac: 'AC4',     note: 'no bookings' },
      { id: 'X1',  start: 1320, end: 1440, overrides: {},                expected: true,  ac: 'AC1+AC2', note: 'ends exactly at 24:00, 120 min' },
      { id: 'X2',  start: 660,  end: 750,  overrides: { bookings: TWO }, expected: false, ac: 'AC4',     note: 'overlaps second booking' },

      // Added boundaries (review)
      { id: 'B1',  start: 541,  end: 571,  overrides: {},                expected: true,  ac: 'AC1',     note: 'one minute after now' },
      { id: 'B2',  start: 530,  end: 570,  overrides: {},                expected: false, ac: 'AC1',     note: 'starts before now, ends after now' },
      { id: 'B3',  start: 659,  end: 719,  overrides: {},                expected: false, ac: 'AC4',     note: '1-minute overlap at booking end' },
      { id: 'B4',  start: 571,  end: 601,  overrides: {},                expected: false, ac: 'AC4',     note: '1-minute overlap at booking start' },
      {
        id: 'X3', start: 630, end: 690,
        overrides: { bookings: [{ start: 720, end: 780 }, { start: 600, end: 660 }] },
        expected: false, ac: 'AC4', note: 'unsorted bookings, overlap with the later entry',
      },
      { id: 'X4',  start: 660,  end: 720,  overrides: { bookings: TWO }, expected: true,  ac: 'AC4',     note: 'fills the gap, touches both bookings' },
    ];

    describe('canBook - case table and boundaries', () => {
      test.each(cases)('$id $start-$end ($note) -> $expected [$ac]', checkCase);
    });

    describe('AC5 - decision only, booking data unchanged', () => {
      test('Available answer keeps the same array and the same 600-660 entry', () => {
        const input = makeInput(660, 720);
        const bookingsRef = input.bookings;
        const entryRef = input.bookings[0];

        expect(canBook(input)).toBe(true);
        expect(input.bookings).toBe(bookingsRef);
        expect(input.bookings[0]).toBe(entryRef);
        expect(input.bookings).toStrictEqual([{ start: 600, end: 660 }]);
      });
    });

    // Skipped until the requirement is clarified: can the supplied now be negative?
    // With now = 540 the start >= 0 check can never be reached.
    describe.skip('AC1 lower bound start >= 0 (needs requirement decision)', () => {
      test.each([
        { id: 'B0a', start: 0,  end: 30, overrides: { now: -1 }, expected: true,  ac: 'AC1', note: 'start exactly 0' },
        { id: 'B0b', start: -1, end: 30, overrides: { now: -2 }, expected: false, ac: 'AC1', note: 'start below 0' },
      ])('$id $start-$end ($note) -> $expected [$ac]', checkCase);
    });

**Run** (from `week-07/app`):

    npx vitest run src/booking.test.js

  ## 5. AC mapping and open requirement questions

| AC | Covered by |
| --- | --- |
| AC1 | T02, T03, T04, T05, X1, B1, B2 (B0 skipped) |
| AC2 | T06, T07, X1 |
| AC3 | T13 |
| AC4 | T01, T08-T12, T14, X2, B3, B4, X3, X4 |
| AC5 | Every case: freeze plus `toStrictEqual`, and the reference test. The display part is not covered. |
| AC6 | Not covered |

- **AC6 and the AC5 display can't be checked by unit tests of `canBook`.** They need a check of `main.js` at desktop and narrow width (manual, or Playwright at about 1280px and 375px). I haven't seen `main.js`, so I didn't write that test.
- **AC6 asks for "understandable validation feedback", but `canBook` only returns true/false.** The page can't say why a request was rejected. Either change the requirement or have the function return a reason. That's a design decision, not a test repair.
- **Can `now` be negative or above 1440?** This decides whether B0 gets turned on or deleted.
- **Bad input isn't specified.** Nothing covers NaN, non-integer minutes, a missing `bookings` array (the current code throws) or invalid stored bookings. No tests were written for these on purpose.
```

**What I applied from this answer** (my decisions, the suite is `app/src/booking.test.js`):

- Accepted: "no incorrect expectations" - I agree, all 16 expected values match section 3. No implementation fix: nothing failed.
- Accepted: R2 (`toStrictEqual` in the AC5 test) and removing R3, R4, R5 (Unavailable AC5 test, frozen test, fixed-time test) - the same as my section 5 decisions 3, 4 and 6.
- Accepted as new tests: B1 (541-571 true), B2 (530-570 false), B3 (659-719 false), B4 (571-601 false), its X3 renamed **B5** (unsorted bookings, false) and its X4 renamed **B6** (touches two bookings, true). I renamed them because X1/X2 are reserved for my own cases. Each expected value follows from AC1/AC4, I checked them myself.
- Rejected: `test.each` again (course rule: one named test per case), the fake clock with `new Date` (now is a supplied number, AC1), R1 freezing every input with `not.toThrow()` (a "no exception" style check; every test already compares `JSON.stringify(input)` before and after the call), and B0 with `describe.skip` (skipped tests are not allowed, and a negative `now` is outside the scenario).


### 6.3 The final run

The **real** output of the final suite (`booking.test.*` beside your module), after every
change and after restoring the correct code from section 7. Every test must pass. If a real defect
is still open, leave its test failing and explain it in 9.1.

```text

 RUN  v3.2.7 /home/claude/se-practice/week-07/app

 ✓ src/booking.test.js (23 tests) 13ms

 Test Files  1 passed (1)
      Tests  23 passed (23)
   Start at  17:27:27
   Duration  397ms (transform 54ms, setup 0ms, collect 45ms, tests 13ms, environment 0ms, prepare 106ms)
```

---

## 7. Task 6 — deliberate defects

You need a reviewed, passing suite first. Then introduce **one** defect at a time in your booking
module, leave the tests unchanged, run, record, and **restore** the code. A syntax or import
error does not count as detection.

| Trial | Intentional change | Detected / Survived | Failing test ID(s) | If it survived: why, and what you added |
| --- | --- | --- | --- | --- |
| M1 | Reject duration >= 120 instead of > 120 | Detected | T06, X1 | - (detected: `expected false to be true` on exactly 120 minutes, 720-840 and 1320-1440) |
| M2 | Treat touching endpoints as an overlap | Detected | T01, T08, AC5 | - (detected; my B6 touching two bookings failed too, and the AC5 test because its Available request 660-720 touches the booking) |
| M3 | Remove the blocked-room rejection | Detected | T13 | - (detected: `expected true to be false`; only T13 has blocked = true, so it is the only guard of AC3) |

**The run of each mutant, pasted unedited.** Paste the `Tests` summary line and the failing test
names at least:

```text
M1 - `if (end - start >= 120) return false;` in src/booking.js (lines with the failing tests and the summary, copied from the run)
 RUN  v3.2.7 /home/claude/se-practice/week-07/app
 ❯ src/booking.test.js (23 tests | 2 failed) 27ms
   × AC1 - valid interval after the supplied current time > X1 AC1 AC2: 1320-1440 ends exactly at 24:00 with 120 minutes and is accepted 13ms
     → expected false to be true // Object.is equality
   × AC2 - at most 120 minutes > T06 AC2: 720-840 is exactly 120 minutes and is accepted 1ms
     → expected false to be true // Object.is equality
 FAIL  src/booking.test.js > AC1 - valid interval after the supplied current time > X1 AC1 AC2: 1320-1440 ends exactly at 24:00 with 120 minutes and is accepted
 ❯ src/booking.test.js:38:41
 FAIL  src/booking.test.js > AC2 - at most 120 minutes > T06 AC2: 720-840 is exactly 120 minutes and is accepted
 ❯ src/booking.test.js:53:39
 Test Files  1 failed (1)
      Tests  2 failed | 21 passed (23)
```

```text
M2 - `if (start <= b.end && b.start <= end) return false;` in src/booking.js (lines with the failing tests and the summary, copied from the run)
 RUN  v3.2.7 /home/claude/se-practice/week-07/app
 ❯ src/booking.test.js (23 tests | 4 failed) 25ms
   × AC4 - no overlap, touching endpoints allowed > T01 AC4: 660-720 touches the end of 600-660 and is accepted 13ms
     → expected false to be true // Object.is equality
   × AC4 - no overlap, touching endpoints allowed > T08 AC4: 570-600 touches the start of 600-660 and is accepted 1ms
     → expected false to be true // Object.is equality
   × AC4 - no overlap, touching endpoints allowed > B6 AC4: 660-720 fills the gap between 600-660 and 720-780, touching both, and is accepted 1ms
     → expected false to be true // Object.is equality
   × AC5 - decision only, existing bookings unchanged > AC5: an Available request (660-720) leaves the bookings exactly as before 1ms
     → expected false to be true // Object.is equality
 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > T01 AC4: 660-720 touches the end of 600-660 and is accepted
 ❯ src/booking.test.js:69:39
 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > T08 AC4: 570-600 touches the start of 600-660 and is accepted
 ❯ src/booking.test.js:73:39
 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > B6 AC4: 660-720 fills the gap between 600-660 and 720-780, touching both, and is accepted
 ❯ src/booking.test.js:117:53
 FAIL  src/booking.test.js > AC5 - decision only, existing bookings unchanged > AC5: an Available request (660-720) leaves the bookings exactly as before
 ❯ src/booking.test.js:128:20
 Test Files  1 failed (1)
      Tests  4 failed | 19 passed (23)
```

```text
M3 - `if (blocked) return false;` removed from src/booking.js (lines with the failing tests and the summary, copied from the run)
 RUN  v3.2.7 /home/claude/se-practice/week-07/app
 ❯ src/booking.test.js (23 tests | 1 failed) 19ms
   × AC3 - blocked room > T13 AC3: 660-720 in a blocked room is rejected 11ms
     → expected true to be false // Object.is equality
 FAIL  src/booking.test.js > AC3 - blocked room > T13 AC3: 660-720 in a blocked room is rejected
 ❯ src/booking.test.js:63:58
 Test Files  1 failed (1)
      Tests  1 failed | 22 passed (23)
```

All three changes reverted, and the full suite run again (section 6.3): yes - each mutant was made with one sed edit, run, and undone with `git checkout -- app/src/booking.js`; `git status` showed booking.js clean before the final run

---

## 8. Task 7 — manual UI checks

Use `now = 09:00` and an existing `10:00–11:00` booking. Do them in the page in a browser. Save a
screenshot of each as `evidence/ui-1.png` … `evidence/ui-5.png`. Take **ui-4 at phone width**
(about 375 px, portrait).

All five checks were done in Chromium (Playwright, driven by Claude in this session, see AI_USAGE.md) on the Vite dev page `http://localhost:5173/`; the screenshots are the real page at those moments.

| # | Action | Expected observation | AC | What I observed | Pass / Fail / Not testable |
| --- | --- | --- | --- | --- | --- |
| U1 | Check 11:00–12:00, unblocked | Available, with the fixed sample booking | AC5 | Room A101, now 09:00, 11:00-12:00, not blocked: green "Available - No conflicts. Nothing has been saved"; the 10:00 - 11:00 booking is still listed (ui-1) | Pass |
| U2 | Enable blocked, then check again | Unavailable replaces the earlier result | AC3, AC5 | Ticked "Room is blocked" and checked again: the green result was replaced by red "Unavailable - This room is blocked (AC3)"; a Blocked tag appears, the booking list is the same (ui-2) | Pass |
| U3 | Clear a required input and submit | Understandable validation feedback | AC6 | First try (evidence/ui-3-before.png): clearing Start gave "Unavailable - The end time must be later than the start time (AC1)", which is misleading. I added a small empty-field check in `src/main.js` (logged in section 2). Now: "Please fill in the start time. No decision was made - a time field is empty." (ui-3) | Pass |
| U4 | Use a narrow (phone) width | Controls and result remain usable | AC6 | 375 x 812 portrait (Chromium with the iPhone X device profile, the same emulation as the F12 device toolbar): all inputs, the button and the result are full width and readable, Start/End side by side, no horizontal scroll (scrollWidth = 375); 10:30-11:30 shows Unavailable with the overlap reason (ui-4) | Pass |
| U5 | Repeat the checks on the same data | Existing bookings remain unchanged | AC5 | Five checks in a row on A101 (11:00-12:00, 10:30-11:30, 11:00-12:00, 12:00-14:00, 10:00-11:00) gave Available, Unavailable, Available, Available, Unavailable; after all of them and a last 12:00-14:00 check the list still shows only 10:00 - 11:00 - no request was added (ui-5) | Pass |

---

## 9. Comparison and what still fails

### 9.1 Checks I am keeping as FAIL or ERROR

Use the same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| none | `python tests/check_suite.py` gives 33 PASS / 0 FAIL / 0 ERROR (run with no `node_modules/` in `app/`, as in a fresh clone) |

### 9.2 Original and improved suites

| Measure | First suite | Improved suite |
| --- | --- | --- |
| Executed / passed / failed | 20 / 20 / 0 (16 table cases inside one `test.each`, 3 AC5 tests, 1 fixed-time test) | 23 / 23 / 0 (T01-T14, X1, X2, AC5, B1-B6, one named test each) |
| Requirements with meaningful tests (AC IDs and gaps) | AC1-AC4: all 16 planned cases with correct expected values; AC5: input compared on every case + one Available test vs a hand-written literal; gaps: no 1-minute boundaries, AC6 none, and two weak tests (Unavailable AC5, frozen `not.toThrow`) | AC1: T02-T05, X1, B1, B2; AC2: T06, T07, X1; AC3: T13 only; AC4: T01, T08-T12, T14, X2, B3-B6; AC5: `JSON.stringify` before/after in every test + AC5 vs `structuredClone`; AC6: only the manual checks U3, U4 |
| Selected mutants detected | 3 / 3 when I ran M1-M3 on it as well (M1: T06, X1; M2: T01, T08 + 3 AC5/clock tests; M3: T13). An extra defect `start < b.end - 1` (1-minute overlap allowed) SURVIVED: 20 passed | 3 / 3 (M1: T06, X1; M2: T01, T08, B6, AC5; M3: T13); the extra `start < b.end - 1` defect is caught by B3 |
| Accepted / revised / rejected tests | section 5: 2 accepted (expected values + inputs, real import), 2 revised (`test.each` split into named tests, AC5 Available test), 3 rejected (fake clock + fixed-time test, frozen `not.toThrow` test, Unavailable AC5 test) | from the improvement answer: accepted `toStrictEqual`, the 3 removals and 6 new boundary tests (B1-B6); rejected `test.each`, the fake clock, freezing every input with `not.toThrow`, and `describe.skip` B0 |
| Remaining limitations | could not be read case by case, used a faked `Date` clock, missed 1-minute overlaps | AC3 is guarded by one test (T13); the `start >= 0` branch cannot be reached with now = 540; no tests for bad input (NaN, missing `bookings`) or reversed existing bookings (9.3); AC6 and the page messages are checked only by hand |

### 9.3 What no AC decides

Call your function with `bookings = [{ start: 700, end: 650 }]` (a reversed existing booking)
and a request of 660–720. What does it return? Does any AC say what it should return? (This is
the value you declare in `submission.yml` under `assumptions.invalid_existing_booking`.)

- I called it with node: `canBook({ start: 660, end: 720, now: 540, blocked: false, bookings: [{ start: 700, end: 650 }] })` returns **true** (Available). For control, the same request with the normal booking `{ start: 650, end: 700 }` returns false.
- Why: the overlap test is `start < b.end && b.start < end` = `660 < 650 && ...`, which is false, so a reversed booking never counts as an overlap. It does not throw either.
- No AC decides it. AC4 talks about overlapping "an existing booking" but assumes the booking is a real interval, and AC1 only checks the candidate. My view: a reversed stored booking is a data error, and accepting a request on top of it is risky (if it was meant as 650-700, we just double-booked). But fixing it would be a new rule, not the extraction, so I left `canBook` as it is, declared `returns-true` and listed it as a limitation in 9.2.

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

(a) No expected value in the first suite was wrong: all 16 matched my plan, and it even caught M1-M3. The real mistake was missing boundaries. Its smallest overlap was T09 with 30 minutes, so a canBook with `start < b.end - 1` (a one-minute overlap allowed) passed all 20 tests. I found it by trying that extra defect on both suites: only my improved B3 (659-719) failed.

(b) The final green run (23/23) proves that this canBook gives the planned answers for these 23 inputs and does not change the bookings it receives. It does not prove the page is right. U3 showed that: with an empty Start field the page said "end time must be later than the start time", a wrong message that no unit test could see, because canBook only gets numbers.

(c) AC3 depends on one test, T13. If it were wrong, M3 would survive.
