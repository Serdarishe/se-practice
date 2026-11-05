# Week 08 — Lab report

**Name:** Serdar Dundar (24B031016)
**Group:** CSCI-2208
**Date:** 2026-11-05

Fill in every section. **Do not delete, rename or renumber the headings.** The checker and the
grader find your answers by them. You can add rows to any table, but never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Assistant I debugged with (tool) | Claude (claude.ai web app) |
| Exact model (with its version, or `not displayed`) | Claude Opus 5.5 (model picker "Opus 5.5", effort High) |
| Where the skill was installed (ChatGPT / Claude web / Claude Code / prompt-only simulation) | Claude web (claude.ai, Pro plan) - uploaded `bug-detector.zip` in Settings → Customize → Skills, enabled |
| Where I ran the tests (Bolt terminal / my computer / Codespace) | Claude cloud session (Linux container, Node 22.23.4), `npx vitest run` in `week-08/app/` - the same commands work on my computer |
| Vitest version (the `RUN  v…` line of a run) | 3.2.7 |
| Language of my booking module (`ts` or `js`) — the file I copied from `buggy/` | js - `app/src/booking.js`, copied from `buggy/booking.js` |

---

## 2. Task 1 — baseline, buggy code, failing tests

### 2.1 My Week 07 suite on my own code

The **real** output of your Week 07 suite, run in `week-08/app/` **before** you replace
anything. It should be green. If it is not, say why under the block.

```text
 RUN  v3.2.7 /home/claude/se-practice/week-08/app

 ✓ src/booking.test.js (23 tests) 10ms

 Test Files  1 passed (1)
      Tests  23 passed (23)
   Start at  20:07:14
   Duration  341ms (transform 55ms, setup 0ms, collect 40ms, tests 10ms, environment 0ms, prepare 98ms)
```

### 2.2 The same suite on the provided canBook

You copied the whole `canBook` function from `buggy/booking.ts` (or `.js`) over yours and changed
nothing else. This is the real output:

```text
 RUN  v3.2.7 /home/claude/se-practice/week-08/app

 ❯ src/booking.test.js (23 tests | 8 failed) 24ms
   ✓ AC1 - valid interval after the supplied current time > T02 AC1: 540-570 starts exactly at now (540) is rejected 2ms
   ✓ AC1 - valid interval after the supplied current time > T03 AC1: 720-720 zero duration is rejected 0ms
   ✓ AC1 - valid interval after the supplied current time > T04 AC1: 750-720 reversed interval is rejected 0ms
   ✓ AC1 - valid interval after the supplied current time > T05 AC1: 1380-1441 ends one minute after 24:00 and is rejected 0ms
   × AC1 - valid interval after the supplied current time > X1 AC1 AC2: 1320-1440 ends exactly at 24:00 with 120 minutes and is accepted 9ms
     → expected '{"start":1320,"end":1440,"now":540,"b…' to be '{"start":1320,"end":1440,"now":540,"b…' // Object.is equality
   × AC1 - valid interval after the supplied current time > B1 AC1: 541-571 starts one minute after now and is accepted 1ms
     → expected '{"start":541,"end":571,"now":540,"blo…' to be '{"start":541,"end":571,"now":540,"blo…' // Object.is equality
   ✓ AC1 - valid interval after the supplied current time > B2 AC1: 530-570 starts before now (540) but ends after it and is rejected 0ms
   × AC2 - at most 120 minutes > T06 AC2: 720-840 is exactly 120 minutes and is accepted 1ms
     → expected '{"start":720,"end":840,"now":540,"blo…' to be '{"start":720,"end":840,"now":540,"blo…' // Object.is equality
   ✓ AC2 - at most 120 minutes > T07 AC2: 720-841 is 121 minutes and is rejected 0ms
   ✓ AC3 - blocked room > T13 AC3: 660-720 in a blocked room is rejected 0ms
   × AC4 - no overlap, touching endpoints allowed > T01 AC4: 660-720 touches the end of 600-660 and is accepted 3ms
     → expected false to be true // Object.is equality
   × AC4 - no overlap, touching endpoints allowed > T08 AC4: 570-600 touches the start of 600-660 and is accepted 1ms
     → expected false to be true // Object.is equality
   ✓ AC4 - no overlap, touching endpoints allowed > T09 AC4: 630-690 partly overlaps 600-660 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T10 AC4: 570-690 contains the whole booking 600-660 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T11 AC4: 615-645 lies inside 600-660 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T12 AC4: 600-660 is identical to the booking and is rejected 0ms
   × AC4 - no overlap, touching endpoints allowed > T14 AC4: 630-690 with no bookings ([]) is accepted 1ms
     → expected '{"start":630,"end":690,"now":540,"blo…' to be '{"start":630,"end":690,"now":540,"blo…' // Object.is equality
   ✓ AC4 - no overlap, touching endpoints allowed > X2 AC4: 660-750 touches 600-660 but overlaps the second booking 720-780 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > B3 AC4: 659-719 overlaps the end of 600-660 by one minute and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > B4 AC4: 571-601 overlaps the start of 600-660 by one minute and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > B5 AC4: 630-690 with unsorted bookings [720-780, 600-660] overlaps the later entry and is rejected 0ms
   × AC4 - no overlap, touching endpoints allowed > B6 AC4: 660-720 fills the gap between 600-660 and 720-780, touching both, and is accepted 0ms
     → expected false to be true // Object.is equality
   × AC5 - decision only, existing bookings unchanged > AC5: an Available request (660-720) leaves the bookings exactly as before 1ms
     → expected false to be true // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/booking.test.js > AC1 - valid interval after the supplied current time > X1 AC1 AC2: 1320-1440 ends exactly at 24:00 with 120 minutes and is accepted
AssertionError: expected '{"start":1320,"end":1440,"now":540,"b…' to be '{"start":1320,"end":1440,"now":540,"b…' // Object.is equality

Expected: "{"start":1320,"end":1440,"now":540,"blocked":false,"bookings":[{"start":600,"end":660}]}"
Received: "{"start":1320,"end":1440,"now":540,"blocked":false,"bookings":[{"start":600,"end":660},{"start":1320,"end":1440}]}"

 ❯ decide src/booking.test.js:16:33
     14|   const before = JSON.stringify(input);
     15|   const result = canBook(input);
     16|   expect(JSON.stringify(input)).toBe(before);
       |                                 ^
     17|   return result;
     18| }
 ❯ src/booking.test.js:38:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  src/booking.test.js > AC1 - valid interval after the supplied current time > B1 AC1: 541-571 starts one minute after now and is accepted
AssertionError: expected '{"start":541,"end":571,"now":540,"blo…' to be '{"start":541,"end":571,"now":540,"blo…' // Object.is equality

Expected: "{"start":541,"end":571,"now":540,"blocked":false,"bookings":[{"start":600,"end":660}]}"
Received: "{"start":541,"end":571,"now":540,"blocked":false,"bookings":[{"start":600,"end":660},{"start":541,"end":571}]}"

 ❯ decide src/booking.test.js:16:33
     14|   const before = JSON.stringify(input);
     15|   const result = canBook(input);
     16|   expect(JSON.stringify(input)).toBe(before);
       |                                 ^
     17|   return result;
     18| }
 ❯ src/booking.test.js:43:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  src/booking.test.js > AC2 - at most 120 minutes > T06 AC2: 720-840 is exactly 120 minutes and is accepted
AssertionError: expected '{"start":720,"end":840,"now":540,"blo…' to be '{"start":720,"end":840,"now":540,"blo…' // Object.is equality

Expected: "{"start":720,"end":840,"now":540,"blocked":false,"bookings":[{"start":600,"end":660}]}"
Received: "{"start":720,"end":840,"now":540,"blocked":false,"bookings":[{"start":600,"end":660},{"start":720,"end":840}]}"

 ❯ decide src/booking.test.js:16:33
     14|   const before = JSON.stringify(input);
     15|   const result = canBook(input);
     16|   expect(JSON.stringify(input)).toBe(before);
       |                                 ^
     17|   return result;
     18| }
 ❯ src/booking.test.js:53:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > T01 AC4: 660-720 touches the end of 600-660 and is accepted
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.js:69:39
     67| describe('AC4 - no overlap, touching endpoints allowed', () => {
     68|   test('T01 AC4: 660-720 touches the end of 600-660 and is accepted', …
     69|     expect(decide(fixture(660, 720))).toBe(true);
       |                                       ^
     70|   });
     71| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > T08 AC4: 570-600 touches the start of 600-660 and is accepted
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.js:73:39
     71| 
     72|   test('T08 AC4: 570-600 touches the start of 600-660 and is accepted'…
     73|     expect(decide(fixture(570, 600))).toBe(true);
       |                                       ^
     74|   });
     75| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > T14 AC4: 630-690 with no bookings ([]) is accepted
AssertionError: expected '{"start":630,"end":690,"now":540,"blo…' to be '{"start":630,"end":690,"now":540,"blo…' // Object.is equality

Expected: "{"start":630,"end":690,"now":540,"blocked":false,"bookings":[]}"
Received: "{"start":630,"end":690,"now":540,"blocked":false,"bookings":[{"start":630,"end":690}]}"

 ❯ decide src/booking.test.js:16:33
     14|   const before = JSON.stringify(input);
     15|   const result = canBook(input);
     16|   expect(JSON.stringify(input)).toBe(before);
       |                                 ^
     17|   return result;
     18| }
 ❯ src/booking.test.js:93:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > B6 AC4: 660-720 fills the gap between 600-660 and 720-780, touching both, and is accepted
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.js:117:53
    115|   test('B6 AC4: 660-720 fills the gap between 600-660 and 720-780, tou…
    116|     const bookings = [{ start: 600, end: 660 }, { start: 720, end: 780…
    117|     expect(decide(fixture(660, 720, { bookings }))).toBe(true);
       |                                                     ^
    118|   });
    119| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  src/booking.test.js > AC5 - decision only, existing bookings unchanged > AC5: an Available request (660-720) leaves the bookings exactly as before
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.js:128:20
    126|     const result = canBook({ start: 660, end: 720, now: 540, blocked: …
    127| 
    128|     expect(result).toBe(true);
       |                    ^
    129|     expect(bookings).toStrictEqual(before);
    130|     expect(bookings).toHaveLength(1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 15 passed (23)
   Start at  20:07:31
   Duration  305ms (transform 45ms, setup 0ms, collect 32ms, tests 24ms, environment 0ms, prepare 65ms)
```

### 2.3 One failing test per bug

Add the two regression tests from README Part 1, step 5: one named `BUG-A` and one named `BUG-B`.
Run them **on the buggy code**. Both must fail here. That is the evidence that each test can see
its bug.

```text
 RUN  v3.2.7 /home/claude/se-practice/week-08/app

 ❯ src/booking.test.js (25 tests | 10 failed) 38ms
   ✓ AC1 - valid interval after the supplied current time > T02 AC1: 540-570 starts exactly at now (540) is rejected 2ms
   ✓ AC1 - valid interval after the supplied current time > T03 AC1: 720-720 zero duration is rejected 0ms
   ✓ AC1 - valid interval after the supplied current time > T04 AC1: 750-720 reversed interval is rejected 0ms
   ✓ AC1 - valid interval after the supplied current time > T05 AC1: 1380-1441 ends one minute after 24:00 and is rejected 0ms
   × AC1 - valid interval after the supplied current time > X1 AC1 AC2: 1320-1440 ends exactly at 24:00 with 120 minutes and is accepted 14ms
     → expected '{"start":1320,"end":1440,"now":540,"b…' to be '{"start":1320,"end":1440,"now":540,"b…' // Object.is equality
   × AC1 - valid interval after the supplied current time > B1 AC1: 541-571 starts one minute after now and is accepted 1ms
     → expected '{"start":541,"end":571,"now":540,"blo…' to be '{"start":541,"end":571,"now":540,"blo…' // Object.is equality
   ✓ AC1 - valid interval after the supplied current time > B2 AC1: 530-570 starts before now (540) but ends after it and is rejected 0ms
   × AC2 - at most 120 minutes > T06 AC2: 720-840 is exactly 120 minutes and is accepted 1ms
     → expected '{"start":720,"end":840,"now":540,"blo…' to be '{"start":720,"end":840,"now":540,"blo…' // Object.is equality
   ✓ AC2 - at most 120 minutes > T07 AC2: 720-841 is 121 minutes and is rejected 0ms
   ✓ AC3 - blocked room > T13 AC3: 660-720 in a blocked room is rejected 0ms
   × AC4 - no overlap, touching endpoints allowed > T01 AC4: 660-720 touches the end of 600-660 and is accepted 3ms
     → expected false to be true // Object.is equality
   × AC4 - no overlap, touching endpoints allowed > T08 AC4: 570-600 touches the start of 600-660 and is accepted 1ms
     → expected false to be true // Object.is equality
   ✓ AC4 - no overlap, touching endpoints allowed > T09 AC4: 630-690 partly overlaps 600-660 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T10 AC4: 570-690 contains the whole booking 600-660 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T11 AC4: 615-645 lies inside 600-660 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T12 AC4: 600-660 is identical to the booking and is rejected 0ms
   × AC4 - no overlap, touching endpoints allowed > T14 AC4: 630-690 with no bookings ([]) is accepted 1ms
     → expected '{"start":630,"end":690,"now":540,"blo…' to be '{"start":630,"end":690,"now":540,"blo…' // Object.is equality
   ✓ AC4 - no overlap, touching endpoints allowed > X2 AC4: 660-750 touches 600-660 but overlaps the second booking 720-780 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > B3 AC4: 659-719 overlaps the end of 600-660 by one minute and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > B4 AC4: 571-601 overlaps the start of 600-660 by one minute and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > B5 AC4: 630-690 with unsorted bookings [720-780, 600-660] overlaps the later entry and is rejected 0ms
   × AC4 - no overlap, touching endpoints allowed > B6 AC4: 660-720 fills the gap between 600-660 and 720-780, touching both, and is accepted 1ms
     → expected false to be true // Object.is equality
   × AC5 - decision only, existing bookings unchanged > AC5: an Available request (660-720) leaves the bookings exactly as before 1ms
     → expected false to be true // Object.is equality
   × Week 08 regression tests > BUG-A AC4: 1380-1440 touches the end of 1320-1380 and ends at 24:00, so it is Available 1ms
     → expected false to be true // Object.is equality
   × Week 08 regression tests > BUG-B AC5: an Available request 720-780 that touches nothing leaves the bookings unchanged 5ms
     → expected [ { start: 600, end: 660 }, …(1) ] to strictly equal [ { start: 600, end: 660 } ]

⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/booking.test.js > AC1 - valid interval after the supplied current time > X1 AC1 AC2: 1320-1440 ends exactly at 24:00 with 120 minutes and is accepted
AssertionError: expected '{"start":1320,"end":1440,"now":540,"b…' to be '{"start":1320,"end":1440,"now":540,"b…' // Object.is equality

Expected: "{"start":1320,"end":1440,"now":540,"blocked":false,"bookings":[{"start":600,"end":660}]}"
Received: "{"start":1320,"end":1440,"now":540,"blocked":false,"bookings":[{"start":600,"end":660},{"start":1320,"end":1440}]}"

 ❯ decide src/booking.test.js:16:33
     14|   const before = JSON.stringify(input);
     15|   const result = canBook(input);
     16|   expect(JSON.stringify(input)).toBe(before);
       |                                 ^
     17|   return result;
     18| }
 ❯ src/booking.test.js:38:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

 FAIL  src/booking.test.js > AC1 - valid interval after the supplied current time > B1 AC1: 541-571 starts one minute after now and is accepted
AssertionError: expected '{"start":541,"end":571,"now":540,"blo…' to be '{"start":541,"end":571,"now":540,"blo…' // Object.is equality

Expected: "{"start":541,"end":571,"now":540,"blocked":false,"bookings":[{"start":600,"end":660}]}"
Received: "{"start":541,"end":571,"now":540,"blocked":false,"bookings":[{"start":600,"end":660},{"start":541,"end":571}]}"

 ❯ decide src/booking.test.js:16:33
     14|   const before = JSON.stringify(input);
     15|   const result = canBook(input);
     16|   expect(JSON.stringify(input)).toBe(before);
       |                                 ^
     17|   return result;
     18| }
 ❯ src/booking.test.js:43:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

 FAIL  src/booking.test.js > AC2 - at most 120 minutes > T06 AC2: 720-840 is exactly 120 minutes and is accepted
AssertionError: expected '{"start":720,"end":840,"now":540,"blo…' to be '{"start":720,"end":840,"now":540,"blo…' // Object.is equality

Expected: "{"start":720,"end":840,"now":540,"blocked":false,"bookings":[{"start":600,"end":660}]}"
Received: "{"start":720,"end":840,"now":540,"blocked":false,"bookings":[{"start":600,"end":660},{"start":720,"end":840}]}"

 ❯ decide src/booking.test.js:16:33
     14|   const before = JSON.stringify(input);
     15|   const result = canBook(input);
     16|   expect(JSON.stringify(input)).toBe(before);
       |                                 ^
     17|   return result;
     18| }
 ❯ src/booking.test.js:53:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > T01 AC4: 660-720 touches the end of 600-660 and is accepted
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.js:69:39
     67| describe('AC4 - no overlap, touching endpoints allowed', () => {
     68|   test('T01 AC4: 660-720 touches the end of 600-660 and is accepted', …
     69|     expect(decide(fixture(660, 720))).toBe(true);
       |                                       ^
     70|   });
     71| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯

 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > T08 AC4: 570-600 touches the start of 600-660 and is accepted
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.js:73:39
     71| 
     72|   test('T08 AC4: 570-600 touches the start of 600-660 and is accepted'…
     73|     expect(decide(fixture(570, 600))).toBe(true);
       |                                       ^
     74|   });
     75| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯

 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > T14 AC4: 630-690 with no bookings ([]) is accepted
AssertionError: expected '{"start":630,"end":690,"now":540,"blo…' to be '{"start":630,"end":690,"now":540,"blo…' // Object.is equality

Expected: "{"start":630,"end":690,"now":540,"blocked":false,"bookings":[]}"
Received: "{"start":630,"end":690,"now":540,"blocked":false,"bookings":[{"start":630,"end":690}]}"

 ❯ decide src/booking.test.js:16:33
     14|   const before = JSON.stringify(input);
     15|   const result = canBook(input);
     16|   expect(JSON.stringify(input)).toBe(before);
       |                                 ^
     17|   return result;
     18| }
 ❯ src/booking.test.js:93:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/10]⎯

 FAIL  src/booking.test.js > AC4 - no overlap, touching endpoints allowed > B6 AC4: 660-720 fills the gap between 600-660 and 720-780, touching both, and is accepted
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.js:117:53
    115|   test('B6 AC4: 660-720 fills the gap between 600-660 and 720-780, tou…
    116|     const bookings = [{ start: 600, end: 660 }, { start: 720, end: 780…
    117|     expect(decide(fixture(660, 720, { bookings }))).toBe(true);
       |                                                     ^
    118|   });
    119| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/10]⎯

 FAIL  src/booking.test.js > AC5 - decision only, existing bookings unchanged > AC5: an Available request (660-720) leaves the bookings exactly as before
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.js:128:20
    126|     const result = canBook({ start: 660, end: 720, now: 540, blocked: …
    127| 
    128|     expect(result).toBe(true);
       |                    ^
    129|     expect(bookings).toStrictEqual(before);
    130|     expect(bookings).toHaveLength(1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/10]⎯

 FAIL  src/booking.test.js > Week 08 regression tests > BUG-A AC4: 1380-1440 touches the end of 1320-1380 and ends at 24:00, so it is Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.js:138:20
    136|   test('BUG-A AC4: 1380-1440 touches the end of 1320-1380 and ends at …
    137|     const result = canBook({ start: 1380, end: 1440, now: 540, blocked…
    138|     expect(result).toBe(true);
       |                    ^
    139|   });
    140| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/10]⎯

 FAIL  src/booking.test.js > Week 08 regression tests > BUG-B AC5: an Available request 720-780 that touches nothing leaves the bookings unchanged
AssertionError: expected [ { start: 600, end: 660 }, …(1) ] to strictly equal [ { start: 600, end: 660 } ]

- Expected
+ Received

  [
    {
      "end": 660,
      "start": 600,
    },
+   {
+     "end": 780,
+     "start": 720,
+   },
  ]

 ❯ src/booking.test.js:149:22
    147| 
    148|     expect(result).toBe(true);
    149|     expect(bookings).toStrictEqual(before);
       |                      ^
    150|   });
    151| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/10]⎯


 Test Files  1 failed (1)
      Tests  10 failed | 15 passed (25)
   Start at  20:07:58
   Duration  374ms (transform 61ms, setup 0ms, collect 40ms, tests 38ms, environment 0ms, prepare 88ms)
```

---

## 3. Defect log

One row per defect. At least **BUG-A and BUG-B**. "Suspected cause" is your hypothesis
**before** you ask any assistant: the line and why.

My hypotheses below are my own words (written in Russian before asking any assistant, translated by Claude).

| Defect | Test ID | Input | Expected | Actual | Suspected cause (line and why) |
| --- | --- | --- | --- | --- | --- |
| BUG-A | BUG-A (also T01, T08, B6, AC5 in 2.2) | 1380-1440, bookings [{1320-1380}], now 540 | true | false | Line `if (start <= b.end && end >= b.start) return false;` - for touching intervals like 660-720 and 600-660, `660 <= 660` is true. So the function thinks the bookings overlap and returns false (refusal). But they only touch at the endpoints, so the request should be allowed (AC4). |
| BUG-B | BUG-B (also X1, B1, T06, T14 in 2.2) | 720-780, bookings [{600-660}], now 540 | true, bookings unchanged | true, but bookings become [{600-660}, {720-780}] | Line `bookings.push({ start, end });` - it adds the new booking to the original array, so it changes it. This breaks AC5 - canBook should only check whether the booking is possible, without changing the data. |

---

## 4. Tasks 2–3 — the skill

**The checks from the deck, before you zip it.** Answer each one yes / no:

| Check | yes / no |
| --- | --- |
| The file is plain UTF-8 text, named exactly `SKILL.md` (not `SKILL.md.txt`) | yes |
| The first and the closing YAML delimiter are exactly three hyphens: `---` | yes |
| `name` is lowercase with hyphens, and `description` says WHEN to use it | yes |
| I read the whole file once: no passwords, API keys or private student data | yes |

**The contents of `skills/bug-detector.zip`.** Paste the listing (Windows: open the ZIP and copy
the paths; macOS/Linux: `unzip -l skills/bug-detector.zip`):

```text
$ unzip -l skills/bug-detector.zip
Archive:  skills/bug-detector.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  2026-11-05 20:27   bug-detector/
      570  2026-11-05 20:27   bug-detector/SKILL.md
---------                     -------
      570                     2 files
```

**Installation.** Where you uploaded it, what the upload said, and whether a new chat showed the
skill as enabled. If upload was not available, write `prompt-only simulation` and say why.
Screenshot of the result: `evidence/install.png`.

<!-- Write below this line -->

I uploaded `skills/bug-detector.zip` on claude.ai (Pro plan): Settings → Customize → Skills → upload. The upload gave no error. The skill shows as **bug-detector**, "by you · v1", with the toggle switched on, and its Contents tab shows `SKILL.md` with the seven steps (`evidence/install.png`). I installed it only after the no-skill chat in section 5, so that chat had no skill.

---

## 5. Task 4 — without the skill

A **fresh chat, with no skill enabled**. Paste exactly what you sent: the deck's question, then
the same input you will use in section 6 (AC1–AC6, the failing test output, the code of
`canBook`):

```text
Find the root cause of the failed room-booking test. Propose minimal patch and regression test. Do not edit code.

Acceptance criteria:
AC1 Reject start ≥ end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Preserve clear UI feedback on desktop and mobile.

Failing test output (Vitest 3.2.7, one test):

 FAIL  src/booking.test.js > AC5 - decision only, existing bookings unchanged > AC5: an Available request (660-720) leaves the bookings exactly as before
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.js:128:20
    126|     const result = canBook({ start: 660, end: 720, now: 540, blocked: …
    127| 
    128|     expect(result).toBe(true);
       |                    ^
    129|     expect(bookings).toStrictEqual(before);
    130|     expect(bookings).toHaveLength(1);

The test:

  test('AC5: an Available request (660-720) leaves the bookings exactly as before', () => {
    const bookings = [{ start: 600, end: 660 }];
    const before = structuredClone(bookings);
    const result = canBook({ start: 660, end: 720, now: 540, blocked: false, bookings });
    expect(result).toBe(true);
    expect(bookings).toStrictEqual(before);
    expect(bookings).toHaveLength(1);
  });

The code of canBook (app/src/booking.js):

export function canBook({ start, end, now, blocked, bookings }) {
  if (!(0 <= start && start < end && end <= 1440)) return false;
  if (!(start > now)) return false;
  if (end - start > 120) return false;
  if (blocked) return false;
  for (const b of bookings) {
    if (start <= b.end && end >= b.start) return false;
  }
  // keep the room's list current with the slot that was just found free
  bookings.push({ start, end });
  return true;
}
```

**The assistant's answer, pasted unedited** (claude.ai, Claude Opus 5.5, High; a new chat with no skill installed yet). Its code fences are shown as `~~~` so this block does not break; "js" / "diff" lines are the copy button's language labels:

```text
Root cause
The failure is in the overlap check:
js

~~~js
if (start <= b.end && end >= b.start) return false;
~~~

The comparisons are inclusive, so two bookings that only touch count as overlapping. For the request 660-720 against the existing 600-660, `660 <= 660 && 720 >= 600` is true, and `canBook` returns `false`. That breaks AC4: endpoints may touch. The other checks all pass for this input (range valid, 660 > 540, 60 ≤ 120, not blocked), so this line is the only reason for the `false`.
There is also a second defect. Line 128 fails first, so the test never reaches it yet:
js

~~~js
bookings.push({ start, end });
~~~

This mutates the caller’s array, which breaks AC5 (“decision only”). If you fix only the overlap check, the test will fail again at line 129 (`toStrictEqual(before)`) and line 130 (`toHaveLength(1)`). Both changes are needed for the test to go green.
Minimal patch (proposed, not applied)
diff

~~~diff
--- a/app/src/booking.js
+++ b/app/src/booking.js
@@
   for (const b of bookings) {
-    if (start <= b.end && end >= b.start) return false;
+    if (start < b.end && end > b.start) return false;
   }
-  // keep the room's list current with the slot that was just found free
-  bookings.push({ start, end });
   return true;
 }
~~~

Half-open intervals `[start, end)` overlap only when `start < b.end && end > b.start`. AC1-AC3 are unchanged. AC6 (UI) is not touched by this function.
Regression tests (add to `src/booking.test.js`)
js

~~~js
describe('Regression - endpoint touching and no mutation', () => {
  const base = { now: 540, blocked: false };

  test('AC4: request starting exactly at an existing end is allowed', () => {
    const bookings = [{ start: 600, end: 660 }];
    expect(canBook({ ...base, start: 660, end: 720, bookings })).toBe(true);
  });

  test('AC4: request ending exactly at an existing start is allowed', () => {
    const bookings = [{ start: 660, end: 720 }];
    expect(canBook({ ...base, start: 600, end: 660, bookings })).toBe(true);
  });

  test('AC4: a 1-minute overlap is still rejected', () => {
    const bookings = [{ start: 600, end: 660 }];
    expect(canBook({ ...base, start: 659, end: 720, bookings })).toBe(false);
  });

  test('AC5: same Available request asked twice gives the same answer', () => {
    const bookings = [{ start: 600, end: 660 }];
    const req = { ...base, start: 660, end: 720, bookings };
    expect(canBook(req)).toBe(true);
    expect(canBook(req)).toBe(true); // would be false if canBook pushed the slot
    expect(bookings).toEqual([{ start: 600, end: 660 }]);
  });

  test('AC5: input array is not mutated (frozen input does not throw)', () => {
    const bookings = Object.freeze([Object.freeze({ start: 600, end: 660 })]);
    expect(() => canBook({ ...base, start: 660, end: 720, bookings })).not.toThrow();
  });
});
~~~

The touch tests check both sides of the boundary, the 1-minute test makes sure the fix didn’t make overlaps too loose, and the last two catch any future write to `bookings`. The frozen-array test throws in strict mode, which ES modules use.
Run with:

~~~
npx vitest run src/booking.test.js
~~~
```

---

## 6. Task 5 — with the skill

**Another fresh chat, with `bug-detector` enabled.** Send exactly the same input as in section 5.
Only the question changes, to the deck's skill question:

```text
(paste here)
```

**The assistant's answer, pasted unedited:**

```text
(paste here)
```

Did the environment show that the skill was invoked? yes / no / not shown

---

## 7. Comparison — judged against the actual code

Do not assume the skill did better. Judge both answers against the code and against what your
tests showed. Write a short verdict in each cell, and give a reason where they differ.

| Criterion | No skill | With skill |
| --- | --- | --- |
| Correct root cause | | |
| Reproducible test | | |
| Minimal proposed patch | | |
| Unsupported claims | | |
| Clarity of explanation | | |

**Which bugs did each answer find?** (BUG-A, BUG-B, both, neither)

-

---

## 8. Task 6 — repair and regression

Review the proposed patch yourself, then make **one minimal change per bug**, one commit each.
Rerun the test that was failing, then the full suite.

### 8.1 The BUG-A patch

The change as a diff (`git diff`, or the old and the new line), then the real run:

```text
(paste here)
```

### 8.2 The BUG-B patch and the final run

The change as a diff, then the real output of the **full** suite. Every test must pass.

```text
(paste here)
```

---

## 9. What still fails, and what AI-assisted debugging cannot do

### 9.1 Checks I am keeping as FAIL or ERROR

Use the same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| | |

### 9.2 One limitation of AI-assisted debugging

<!-- Use something that actually happened in sections 5-8. 20 words or more. -->
-

---

## 10. Conclusion (80–150 words)

<!-- Answer both, in your own words, without the assistant (3-5 sentences, as the deck asks):
     (a) Did the skill help? Show it with one row of section 7.
     (b) What did your tests actually prove - and what did they not?
     Worthless: "The skill made the AI much better at debugging."
     Worth everything: "Both answers found BUG-A from the T01 failure. Only the skill answer
     separated BUG-B as a hypothesis instead of a fact, because step 4 told it to. BUG-B was only
     visible after the BUG-A patch: the AC5 test had been failing for the wrong reason." -->

<!-- Write your conclusion below this line -->
