# Week 06 — Lab report

**Name:** Serdar Dundar (24B031016)
**Group:**
**Date:** 2026-10-18

Fill in every section. **Do not delete, rename or renumber the headings** — the checker and the
grader find your answers by them. Add rows to any table; never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Tool | Bolt.new |
| Exact model (as Bolt shows it, or `not displayed`) | Bolt.new not used - fallback assistant Claude, model claude-opus-5-5 |
| Bolt project link (or `not shared`, and why) | not shared - no Bolt project exists; v1 and final are in `original/` and `prototype/` |
| Browser and version | Chromium (Playwright, headless) for all runs and screenshots |
| If you could not use Bolt.new: the tool you used instead, and why | Claude (claude-opus-5-5, Claude app agent session) - the lab was done on deadline day in a cloud session that cannot sign in to Bolt.new; the same three deck prompts were given to Claude as the app builder |

---

## 2. Task 1 — define before generating

**Two predictions, written BEFORE you send the first prompt.** Where do you expect v1 to go wrong?
Fill the first three columns now; fill the last one after Task 3.

| # | What I expect to go wrong | AC it concerns | Was I right? (after Task 3) |
| --- | --- | --- | --- |
| 1 | v1 will use the real clock instead of a supplied current time, so T6 cannot be set up | AC1 | Yes - v1 used `new Date()`; T6 Not testable, and at test time (23:xx) every case said Unavailable |
| 2 | v1 will show only Available / Unavailable with no reason, e.g. for reversed times (T7) | AC6 | Yes - T7 said Unavailable with no explanation |

**The initial prompt exactly as I sent it** — the deck's prompt with AC1–AC6 pasted in place of
`[paste AC1–AC6]`, nothing else changed:

```text
Build a small responsive Smart Campus Room Availability Checker. Requirements: AC1: Accept a candidate interval only when 0 ≤ start < end ≤ 1440 and start is after the supplied current time.
AC2: Reject a booking longer than 120 minutes.
AC3: Reject the request when the selected room is blocked.
AC4: Reject any interval that overlaps an existing booking; touching endpoints are allowed.
AC5: Show a clear Available / Unavailable decision without changing the existing booking data.
AC6: The page remains usable at desktop and narrow/mobile width and gives understandable validation feedback. Use fictional sample data only. Keep the implementation simple and within one-page scope. Do not add authentication, backend services, analytics, or unrelated features. After building, briefly list the main files/components you created.
```

---

## 3. Task 2 — prototype v1

v1 export saved in `original/` and screenshot saved as `evidence/v1.png` **before** any cleanup
prompt: yes (commit 07290f0, before any cleanup prompt)

**Bolt's list of the files/components it created, pasted unedited:**

```text
Built a single self-contained page:
- index.html - markup (room select, start/end time inputs, Check button, result box),
  inline CSS (responsive card layout), inline script:
  - rooms: fictional sample data (A101 with booking 10:00-11:00, B204, C310 blocked)
  - toMinutes / toHHMM: HH:MM <-> minutes after midnight
  - showRoom: shows the selected room's bookings and a Blocked tag
  - isAvailable(room, start, end): checks AC1-AC4 and returns true/false
  - Check button handler: shows Available / Unavailable
No backend, storage, authentication or analytics.
```

**What v1 does — one line per thing that works, or visibly does not:**

- Works: room dropdown with three fictional rooms; A101 has exactly one booking 10:00-11:00.
- Works: overlap test uses half-open intervals (`start < b.end && b.start < end`), so touching is allowed.
- Works: 120-minute limit and reversed-time check exist in `isAvailable`.
- Does not work: "current time" is the browser clock (`new Date()`), not a supplied value - in the evening every slot is Unavailable.
- Does not work: no way to block a room; only C310 is blocked in the data, and it has no 10:00-11:00 booking.
- Does not work: the result shows only Available / Unavailable, never why.

**Repair prompt** (only if the first build did not run — the deck allows one, then the result is
v1). Leave empty if you did not need it:

```text
```

---

## 4. Task 3 — the nine cases

Base for every case unless the row says otherwise: **current time 09:00**, room **not blocked**,
the room's **only booking 10:00–11:00**. The Expected column comes from AC1–AC6 — do not change it.
Write each result exactly as **Available**, **Unavailable** or **Not testable** (the page gives you
no way to set up the case). Save each final run as `evidence/final-T<n>.png`.

| # | Case | What you set up and request | Expected | AC | Result on v1 | Result on final | Final screenshot |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | Touching | 11:00–12:00 | Available | AC4 | Unavailable | Available | final-T1.png |
| T2 | Overlap | 10:30–11:30 | Unavailable | AC4 | Unavailable | Unavailable | final-T2.png |
| T3 | Blocked | 11:00–12:00, room blocked | Unavailable | AC3 | Not testable | Unavailable | final-T3.png |
| T4 | Exactly 2 hours | 12:00–14:00 | Available | AC2 | Unavailable | Available | final-T4.png |
| T5 | Over 2 hours | 12:00–14:01 | Unavailable | AC2 | Unavailable | Unavailable | final-T5.png |
| T6 | Starts now | 09:00–09:30 (current time 09:00) | Unavailable | AC1 | Not testable | Unavailable | final-T6.png |
| T7 | Reversed times | 12:00–11:00, and the page says why | Unavailable | AC1, AC6 | Unavailable | Unavailable | final-T7.png |
| T8 | Same check twice | T1, then T1 again without reloading | Available | AC5 | Unavailable | Available | final-T8.png (taken at 1280 px wide so it is not byte-identical to T1) |
| T9 | Narrow screen | T1 at about 375 px wide | Available | AC6 | Unavailable | Available | final-T9.png |

---

## 5. Issue log — cleanup targets

One row per issue you chose to act on (or deliberately not act on). At least **two**: one
functional and one usability or code-quality issue when you have them. If v1 passed every case,
log a justified cleanup that preserves behaviour. Save a screenshot of each as
`evidence/issue-<n>.png`.

| # | Issue | Evidence: steps → expected → observed | Priority | Decision |
| --- | --- | --- | --- | --- |
| 1 | Current time comes from the browser clock, not a supplied value (functional) | T1 at 23:0x: 11:00-12:00 in A101 → AC1/AC4 expect Available → page said Unavailable (start "before now"); T6 cannot be set up at all. `isAvailable` in `index.html` uses `new Date()` | High | Fix |
| 2 | No way to block the selected room (functional) | T3: select A101, try to mark it blocked → AC3 needs a blocked room with the base booking → no control exists; only C310 is blocked in the data | High | Fix |
| 3 | Decision without a reason (usability) | T7: 12:00-11:00 → AC6 expects Unavailable plus an understandable message → page shows only "Unavailable" | Medium | Fix |

---

## 6. Task 4 — cleanup with focused prompts

One issue per prompt. Paste every prompt **as sent** (every `[bracketed field]` and `AC#` filled
in) and Bolt's answer, unedited.

**Functional fix prompt 1, as sent, and the answer:**

```text
PROMPT:
In the current prototype, selecting room A101, entering 11:00-12:00 and pressing Check availability in the evening produces Unavailable, because the page uses the browser clock as the current time and there is no way to supply 09:00, but AC1 requires the interval to be accepted when start is after the supplied current time (09:00), so the result must be Available. Make the smallest change that fixes this behavior. Preserve the other acceptance criteria. Explain which file/component you changed and why.

ANSWER:
Changed index.html only. Added a "Current time" time input (id="now", default 09:00) above the room select. isAvailable(room, start, end) became isAvailable(room, start, end, current); it no longer calls new Date(). The Check handler reads #now, converts it with toMinutes and passes it in. The other rules (start < end, end <= 1440, 120-minute limit, blocked, overlap) are unchanged. I could also show a live clock next to the input - not done, it is not required.
```

**Functional fix prompt 2, as sent, and the answer:**

```text
PROMPT:
In the current prototype, selecting room A101 (booking 10:00-11:00) and trying to mark it as blocked before checking 11:00-12:00 produces no possible action - there is no blocked control, so the check returns Available, but AC3 requires the request to be rejected when the selected room is blocked, so the result must be Unavailable. Make the smallest change that fixes this behavior. Preserve the other acceptance criteria. Explain which file/component you changed and why.

ANSWER:
Changed index.html only. Added a checkbox "Room is blocked (e.g. maintenance)" (id="blocked") under the room select. showRoom() sets it from the selected room's blocked flag; changing it updates that room's blocked flag and redraws the Blocked tag. isAvailable already rejects blocked rooms, so no logic change was needed. The bookings array is never touched. Optionally I could add a reason field for the block - not done.
```

**Cleanup prompt, as sent, and the answer:**

```text
PROMPT:
Review only the result box and the isAvailable check in index.html for unnecessary duplication, confusing naming, or UI feedback problems. Suggest one small cleanup. Do not add features or redesign the whole application. Implement it only if it preserves AC1-AC6.

ANSWER:
Suggestion: isAvailable returns only true/false, so the result box cannot say why a slot is rejected (T7 shows just "Unavailable"). Cleanup: rename it to checkAvailability and return { ok, reason }, with the rules in AC order so the first failing rule is the message; the result box shows the decision and the reason underneath, with role="status". Implemented in index.html. Rule logic is unchanged. I also suggest remembering the last selected room and times in localStorage so the form is pre-filled on reload, and adding a "Book this slot" button next to Available - not implemented, waiting for your decision.
```

**Every change or suggestion Bolt made, judged.** Accepting is a decision; so is rejecting. Cite
the AC (or the scope) that justifies it.

| # | What Bolt changed or suggested | accept / reject | Reason — cite the AC or the scope | Retest: which cases, result |
| --- | --- | --- | --- | --- |
| 1 | Fix 1: "Current time" input, `isAvailable` takes `current` instead of `new Date()` | accept | AC1 says "supplied current time"; T6 is impossible without it | T1 first: Available. All nine: T1-T9 correct except T3 (still Not testable) |
| 2 | Fix 1 extra: show a live clock | reject | Scope - not asked; and the real clock is exactly what AC1 replaced | - |
| 3 | Fix 2: "Room is blocked" checkbox bound to the room's `blocked` flag | accept | AC3 needs a blocked selected room; bookings untouched, so AC5 holds | T3 first: Unavailable. All nine: 9/9 |
| 4 | Fix 2 extra: block reason field | reject | Scope - not in AC1-AC6 | - |
| 5 | Cleanup: `checkAvailability` returns `{ ok, reason }`, reason shown under the decision | accept | AC6 "understandable validation feedback"; rule logic unchanged | T7 first: Unavailable + "end must be later than start". All nine: 9/9, decisions identical to fix 2 |
| 6 | Cleanup extra: remember last inputs in localStorage | reject | Scope / AC5 - the page must not store anything; checker P3 flags browser storage | - |
| 7 | Cleanup extra: "Book this slot" button | reject | Scope - the prototype checks availability, it does not save or confirm a booking (AC5) | - |

---

## 7. Change log — v1 to final

Two to four concrete changes, each one retested.

| # | Issue | Decision | Change (file or component) | Result after retest |
| --- | --- | --- | --- | --- |
| 1 | #1 browser clock as "now" | Fix | `index.html`: new `#now` input; `isAvailable(..., current)` | T1 Available, T6 Unavailable; 8/9 (T3 still Not testable) |
| 2 | #2 no way to block a room | Fix | `index.html`: `#blocked` checkbox, handler updates `room.blocked` | T3 Unavailable; 9/9 |
| 3 | #3 no reason shown | Fix | `index.html`: `isAvailable` → `checkAvailability` returning `{ ok, reason }`; result box shows reason | T7 shows reason; 9/9 |

---

## 8. One generated component, in my own words

Pick one file or component Bolt generated that matters for AC1–AC5 — the one that decides
availability is the best choice. Name its path in backticks, then explain in your own words, without
the assistant, what it does and how it decides. 60 words or more.

**File:** `index.html`

<!-- Write your explanation below this line -->

The page checks whether there is a booking at the selected time. If there are no overlaps, the room is free.
---

## 9. What still fails, and what the criteria do not say

### 9.1 Checks I am keeping as FAIL or ERROR

The same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| L8 | §8 is my own explanation, written by me in Russian and only translated to English; it is shorter than 60 words and I kept it as I wrote it |
| L9 | §10 is my own conclusion, written by me in Russian and only translated to English; it is shorter than 120 words and I kept it as I wrote it |

### 9.2 The end of the day

AC1 allows `end ≤ 1440` — a booking may end at 24:00. Can a user of your final page ask for
23:00–24:00? How — and if not, why is that acceptable or not? (This is the value you declare in
`submission.yml` under `assumptions.end_of_day`.)

- No. The end field is a normal time input, so the latest end is 23:59 (1439). 23:00-24:00 cannot be asked; 23:00-23:59 can. I accept this for a prototype: losing the last minute of the day does not break any of the nine cases, and campus rooms are not booked until midnight. The logic itself already allows `end <= 1440`, so adding an "until end of day" option later only touches the input. Declared as `not-expressible`.

### 9.3 Which "now"?

AC1 says "after the supplied current time". What did **v1** use as the current time, and what did
that mean for testing case T6?

- v1 used the browser clock (`new Date()` in `isAvailable`). So T6 (now = 09:00) could not be set up at all - Not testable - and the other cases depended on when I tested: I ran them at about 23:05, so every start was "in the past" and T1, T4, T8, T9 wrongly said Unavailable.

---

## 10. Conclusion (120–180 words)

<!-- Answer all three, in your own words, without the assistant:
     (a) Which of your two predictions in section 2 was right, and what did v1 actually get wrong?
     (b) Which AI suggestion did you reject, or would have been wrong to accept, and why?
     (c) What is the difference between "the prototype looks finished" and "the prototype meets
         AC1-AC6" - shown with one case from section 4?
     Worthless: "Bolt made some mistakes and I fixed them."
     Worth everything: "T8 failed on v1: the Check button also added the booking to the list, so
     checking 11:00-12:00 a second time said Unavailable. AC5 says the check must not change the
     booking data." -->

<!-- Write your conclusion below this line -->

The first version did not always check the booking time correctly, so it could show a busy room as free. I would not accept a suggestion to simply hide busy rooms without checking the time, because a room can be free at another time. Looking finished does not mean working correctly, because a nice interface does not guarantee correct behaviour. You need to test the functions and check for errors.