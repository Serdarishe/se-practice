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
| Assistant I debugged with (tool) | |
| Exact model (with its version, or `not displayed`) | |
| Where the skill was installed (ChatGPT / Claude web / Claude Code / prompt-only simulation) | |
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
(paste here)
```

---

## 3. Defect log

One row per defect. At least **BUG-A and BUG-B**. "Suspected cause" is your hypothesis
**before** you ask any assistant: the line and why.

| Defect | Test ID | Input | Expected | Actual | Suspected cause (line and why) |
| --- | --- | --- | --- | --- | --- |
| BUG-A | | | | | |
| BUG-B | | | | | |

---

## 4. Tasks 2–3 — the skill

**The checks from the deck, before you zip it.** Answer each one yes / no:

| Check | yes / no |
| --- | --- |
| The file is plain UTF-8 text, named exactly `SKILL.md` (not `SKILL.md.txt`) | yes / no |
| The first and the closing YAML delimiter are exactly three hyphens: `---` | yes / no |
| `name` is lowercase with hyphens, and `description` says WHEN to use it | yes / no |
| I read the whole file once: no passwords, API keys or private student data | yes / no |

**The contents of `skills/bug-detector.zip`.** Paste the listing (Windows: open the ZIP and copy
the paths; macOS/Linux: `unzip -l skills/bug-detector.zip`):

```text
(paste here)
```

**Installation.** Where you uploaded it, what the upload said, and whether a new chat showed the
skill as enabled. If upload was not available, write `prompt-only simulation` and say why.
Screenshot of the result: `evidence/install.png`.

<!-- Write below this line -->

---

## 5. Task 4 — without the skill

A **fresh chat, with no skill enabled**. Paste exactly what you sent: the deck's question, then
the same input you will use in section 6 (AC1–AC6, the failing test output, the code of
`canBook`):

```text
(paste here)
```

**The assistant's answer, pasted unedited:**

```text
(paste here)
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
