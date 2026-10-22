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
| Coding assistant (tool) | Claude (claude.ai app) |
| Coding assistant model | claude-opus-5-5 |
| Bolt.new model | not displayed |
| Bolt project link | https://bolt.new/~/sb1-naz8xqvv |
| Language | Python |
| Path | A |
| Python v1 from | fresh |
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
| `if blocked: return False` | AC3 | Yes | It is the first check, so a blocked room is rejected even when the time is free (T3 False). |
| `for value in (start, end): if not isinstance(value, int) or isinstance(value, bool): return False` | AC1 | Yes | Only whole minutes pass; `True`/`False` are excluded although `bool` is a subclass of `int`. It returns False instead of raising, as the contract asks. |
| `if not (0 <= start < end <= 1440): return False` | AC1 | Yes | One chained comparison rejects negative start, zero length (700-700), reversed times (T7) and ending after midnight (T9), and still allows ending exactly at 1440 (T8 True). |
| `if start <= now: return False` | AC1 | Yes | `<=` rejects a start equal to now (T6 False); 541 with now 540 passes. |
| `if end - start > 120: return False` | AC2 | Yes | Strict `>` keeps exactly 120 allowed (T4 True) and rejects 121 (T5 False). |
| `for b_start, b_end in existing: if start < b_end and b_start < end: return False` | AC4, AC5 | Yes | Half-open overlap test: touching endpoints make one side false, so T1 is True and T2 is False; the loop checks every booking (T10 False) and only reads `existing`, so it is never changed (T11 True twice). |

v1 was already correct: it gives the expected result on T1-T11, and my 28-test suite is green on it too (`python -m unittest` with v1 copied as `booking.py`: `Ran 28 tests ... OK`). The final `code/booking.py` keeps the same checks and only names the constants (`DAY_END`, `MAX_DURATION`) and moves the integer check into `_is_minute()`, so v1 and final give the same results.

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
| T1 | Touching | 660–720 | Available | True | True | Available | Available |
| T2 | Overlap | 630–690 | Unavailable | False | False | Unavailable | Unavailable |
| T3 | Blocked | 660–720, blocked | Unavailable | False | False | Unavailable | Unavailable |
| T4 | Exactly 120 min | 720–840 | Available | True | True | Available | Available |
| T5 | 121 min | 720–841 | Unavailable | False | False | Unavailable | Unavailable |
| T6 | Starts now | 540–570 | Unavailable | False | False | Unavailable | Unavailable |
| T7 | Reversed | 720–660 | Unavailable | False | False | Unavailable | Unavailable |
| T8 | Ends at midnight | 1380–1440 | Available | True | True | Not testable | Available |
| T9 | Past midnight | 1380–1441 | Unavailable | False | False | Not testable | Not testable |
| T10 | Second booking | 720–780, existing (600–660), (700–760) | Unavailable | False | False | Unavailable | Unavailable |
| T11 | Same check twice | 660–720, twice | Available | True | True | Available | Available |
| T12 | Narrow screen | T1 at ~375 px wide | Available | n/a | n/a | Available | Available |

**How the page cases were run:** v1 - every case was entered by hand in the Bolt preview (screenshots in `evidence/v1-cases/`, T12 in Chrome DevTools as iPhone SE 375x667) and repeated on the exported code in Chromium with a Playwright script; both runs gave the same results. Final - the downloaded `web/final/` code was started with `npm run dev` and every case was entered in Chromium with the same Playwright script (a fresh page per case; screenshots in `evidence/final-cases/`); T8 and T12 were also checked by hand in the Bolt preview (`T8.png`, `T12-bolt-devtools.png`). On v1, T8 and T9 are Not testable: a `type="time"` input does not accept 24:00 or 24:01; the nearest input 23:00-00:00 showed Unavailable ("start before end"). On the final, T8 uses the new "Ends at midnight (24:00)" checkbox (issue 3); T9 (24:01) still cannot be entered. Python results come from the checker run of each file.

## 6. Traceability

<!-- His table. Implementation / file: where the rule lives (booking.py line, a component).
     Test input: the case IDs from section 5. v1 / final actual: what those cases gave. -->

| AC | Implementation / file | Test input | Expected | v1 actual | Final actual |
| --- | --- | --- | --- | --- | --- |
| AC1 | `code/booking.py` lines 23-28 (integer check, `0 <= start < end <= DAY_END`, `start <= now`); page: `web/final/src/App.tsx` `checkAvailability` (`start < 0`, `end > 1440`, `start >= end`, `start <= NOW`) and the "Ends at midnight" checkbox (end = 1440) | T6, T7, T8, T9 | T8 Available; T6, T7, T9 Unavailable | Python v1: T6 False, T7 False, T8 True, T9 False; page: T6, T7 Unavailable, T8, T9 Not testable | Python: T6 False, T7 False, T8 True, T9 False; page: T6, T7 Unavailable, T8 Available, T9 Not testable |
| AC2 | `code/booking.py` line 31 (`end - start > MAX_DURATION`); page: `web/final/src/App.tsx` `end - start > 120` | T4, T5 | T4 Available; T5 Unavailable | Python v1: T4 True, T5 False; page: T4 Available, T5 Unavailable | Python: T4 True, T5 False; page: T4 Available, T5 Unavailable |
| AC3 | `code/booking.py` line 19 (`if blocked`); page: `web/final/src/App.tsx` `if (blocked)` first in `checkAvailability` | T3 | Unavailable | Python v1: T3 False; page: T3 Unavailable, but a stale Available stayed after switching Blocked on (issue 1) | Python: T3 False; page: T3 Unavailable, stale result cleared |
| AC4 | `code/booking.py` lines 36-38 (`start < b_end and b_start < end`); page: `web/final/src/App.tsx` loop `start < b.end && b.start < end` | T1, T2, T10 | T1 Available; T2, T10 Unavailable | Python v1: T1 True, T2 False, T10 False; page: T1 Available, T2, T10 Unavailable | Python: T1 True, T2 False, T10 False; page: T1 Available, T2, T10 Unavailable |
| AC5 | `code/booking.py` returns only `True`/`False`, reads `existing` without changing it; page: `web/final/src/App.tsx` result card shows only "Available"/"Unavailable"; bookings are constants; `setResult(null)` on every input change | T11, T1-T10 (one clear result each) | T11 Available on the second check too; existing unchanged | Python v1: T11 True, existing unchanged; page: T11 Available twice, but the result did not follow input changes (issue 1) | Python: T11 True, existing unchanged (tests); page: T11 Available twice, result cleared on change |
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
| 1 | Python AC1 is only "partially satisfied" because `now` is not validated: `can_book(600, 660, -1, False, [])` returns True; it should validate `now` as an integer 0-1439 | Ran the call: it returns True, so the observation is true. Checked the brief: "Assume now is valid (0-1439)" (README section 1), and my baseline assumption 2.4 says the same | Reject | The contract assumes a valid `now`; validating it adds behaviour outside AC1-AC4 and changes no case T1-T11. AC1 is about `start` and `end` |
| 2 | AC6: `grid grid-cols-2` forces two columns, so the time inputs may clip or overflow on a narrow screen | Opened the final page in Chromium at 375 px and 320 px (Playwright, T1 entered). 375 px: page width 375, each input 141 px, nothing cut (evidence/final-narrow.png). 320 px: no horizontal scroll, but the input text is cut to "11:00 A" / "12:00 P" (evidence/final-cases/critique-320px.png) | Modify | AC6 asks for ~375 px (T12), where the layout works, so no change to the final. The clipping below 375 px is real and goes to section 13 as a limitation with a one-class fix (`grid-cols-1 sm:grid-cols-2`) |
| 3 | AC2-AC5 pass in both: 120 allowed, 121 rejected, blocked rejected, touching allowed, `existing` not mutated | Ran the calls from the review: (660, 780) True, (660, 781) False, blocked False, (570, 630) False, (660, 690) True, `existing == before` True; suite 28 tests OK; page T1-T5, T10, T11 on the final | Accept | T1, T2, T3, T4, T5, T10, T11 all give the expected result on both final artifacts |
| 4 | The line numbers it cites (Python "lines 35-40", "line 43", "lines 48-50"; React "line 187", "line 296") | Compared with the files: `code/booking.py` has 40 lines, the checks are on lines 19-38; `App.tsx` has 262 lines, the grid is on line 133 and the blocked check on line 34 | Reject | The citations are wrong (the Python ones are the React line numbers), so I used my own line references in sections 3 and 6 |

## 9. Coding-agent analysis

### 9.1 The loop

<!-- One real pass: the Bolt repair of issue 1. -->

| Step | What happened in this assignment |
| --- | --- |
| User goal | Make the page stop showing a stale "Available" after Room blocked is switched on or the times change (issue 1, AC3/AC5). |
| Model / plan | Bolt answered with a plan in one sentence: "I'll add setResult(null) to each of the four control change handlers so the result clears whenever inputs change." |
| Tool call | Bolt edited `src/App.tsx` and rebuilt the project; its chat showed "2 actions taken" and saved "Version 2: Clear result on input change". |
| Observation | In the preview: 11:00-12:00 -> Check -> Available; switching Room blocked on without pressing Check made the result card disappear (evidence/after-1.png). |
| Next step | Bolt offered follow-ups "Add preset time buttons" and "Show daily schedule timeline"; I ignored them and sent the next focused prompt (remove @supabase/supabase-js). |
| Human review | I read the diff between `web/original/src/App.tsx` and `web/final/src/App.tsx` (only `setResult(null)` in four handlers, plus the later midnight checkbox) and reran T1-T12 on the final page and the checker. |

### 9.2 Context, tools and permissions

| Tool | Context it used | Tools or permissions | Observed or assumed |
| --- | --- | --- | --- |
| Bolt.new | My prompt with AC1-AC6 and the existing project files | Read files ("4 files read"), wrote `src/App.tsx`, ran a command and a build ("Ran command", "Build passes"), saved versions | Observed (shown in the Bolt chat) |
| Bolt.new | A starter template that already listed `@supabase/supabase-js` in `package.json` | Installs npm packages and runs the dev server inside the browser (WebContainer); it can change any file in the project without asking | Assumed (inferred from the dependency it added and from the preview; not shown) |
| Claude (claude.ai app) | Only the text of my Plan and Generate prompts in the chat | Answered with a plan and one code block; I saved the code myself as `code/original/booking_v1.py` | Observed |
| Claude (claude.ai app) | The model and its version are shown in the app, the system prompt and sampling settings are not | Unknown internal limits on context and tools | Assumed |
| Critique chat | The prompt with AC1-AC6, `booking.py` and `App.tsx` pasted in | No file or run access: it cited wrong line numbers and said "actual visual failure needs browser testing" | Observed (from its answer) |

### 9.3 Checkpoint and dependability

**Safety checkpoint:** Before accepting any AI change I read the diff of the files it touched, check that only the requested behaviour changed (no new dependency, no network, storage or login), rerun T1-T12 on the page and `python tests/check_sis.py`, and only then download and commit.

**Reliability, security, responsibility:** The AI produced code that looked correct, but it also added a database client nobody asked for and left a stale result on screen, and the critique cited wrong line numbers. Reliability comes from tests I run, not from the AI's confidence. Security means watching what the tool may install or call. I submit the code, so the review, the permissions I give the tools and the final decision are my responsibility.

## 10. Reflection

<!-- 100-200 words, in your own words, no AI. Compare AI-assisted coding (the Python part) with
     vibe coding (the Bolt part); one example each of a reliability, an availability/usability and
     a security risk; why review, tool permissions and tests stay human responsibilities; one AI
     recommendation you rejected or modified, and why; what you would improve next without
     expanding the scope. -->

With Python I worked step by step: I asked the AI for a plan, then the code, then I tested it, so I could check the logic. With Bolt I only described the page and got the interface and code at once. It was faster, but harder to control every detail.

Reliability risk: the page still showed "Available" after I turned on "Room blocked". A blocked room must always be unavailable, so I asked Bolt to clear the result when an input changes. Usability risk: users could not enter 24:00, and on a 320 px screen the time fields are cut. I added a midnight checkbox; the small-screen layout is still open. Security risk: Bolt added the Supabase database library without asking. The page stores nothing, so I removed it.

AI can be wrong even when the code looks right, so a human must review the code, control tool permissions and run the tests. I am responsible for the result, not the AI.

I rejected Bolt's "Add preset time buttons" because AC1-AC6 do not need them. Next, without new features, I would fix the narrow layout and make the messages clearer.

## 11. Appendix A — AI exchanges

<!-- At least four. Complete prompts and complete responses, as text — never screenshots. Paste
     each inside the ~~~~ block that follows its label.
     Stage: Plan, Generate, Critique or Repair (the brief's A-D) — at least one of each.
     Source: this SIS, week-05 or week-06. Reused exchanges keep their original date.
     The Generate exchange for Python must contain your v1 exactly as it is in code/original/.
     Add B5, B6 … if you ran more. -->

### B1

- **Tool:** Claude (claude.ai app)
- **Model:** claude-opus-5-5
- **Date:** 2026-10-22
- **Stage:** Plan
- **Source:** this SIS

**Prompt:**

~~~~text
I am implementing a Python function can_book(start, end, now, blocked, existing) for a Smart Campus Room Availability Checker. Do not write code yet. Give me a short plan: the checks in order, your assumptions, and boundary tests. The rules are fixed:
AC1 integer minutes after midnight, 0 <= start < end <= 1440, start strictly after now.
AC2 duration at most 120 minutes, exactly 120 is allowed.
AC3 reject every request when the room is blocked.
AC4 reject overlap with any existing (start, end) booking; touching at an endpoint is not overlap. Intervals include start and exclude end.
AC5 return only True or False and never modify existing.
Return True only when AC1-AC4 all hold.
~~~~

**Response:**

~~~~text
Plan for `can_book(start, end, now, blocked, existing)`

**Checks, in order (return False at the first one that fails):**

1. **AC3 - blocked room.** If `blocked` is True, return False right away. A blocked room rejects every request, so nothing else matters.
2. **AC1 - integer minutes.** `start` and `end` must be integers. Exclude `bool` (in Python `True` is also an `int`). If they are not integers, return False rather than raising, because the contract says to return a Boolean.
3. **AC1 - day bounds and order.** Require `0 <= start < end <= 1440`. This one chained comparison rejects negative times, zero-length and reversed intervals, and anything ending after midnight.
4. **AC1 - start in the future.** Require `start > now` (strictly). `start == now` is rejected.
5. **AC2 - duration.** Require `end - start <= 120`. Exactly 120 passes, 121 fails.
6. **AC4 - overlap.** For every `(b_start, b_end)` in `existing`, half-open intervals `[start, end)` and `[b_start, b_end)` overlap only when `start < b_end and b_start < end`. If any booking overlaps, return False. Touching (`start == b_end` or `end == b_start`) makes one of the comparisons false, so it is allowed.
7. If every check passes, return True.

**AC5:** only iterate over `existing`. Never sort it, append to it or remove from it, and never assign to its elements. Return the literals `True` and `False`, not truthy values.

**Assumptions:**
- `now` is a valid minute (0-1439), as the brief says, so it is not validated.
- The pairs in `existing` are valid `(start, end)` tuples with `start < end`. They may be unsorted, and the list may be empty.
- All times are on the same day. Nothing wraps past midnight.
- Invalid input gives False, not an exception.
- Standard library only, no extra helpers outside the contract.

**Boundary tests (base: now = 540, blocked = False, existing = [(600, 660)]):**

| Case | Input | Expected |
| --- | --- | --- |
| Touching after | 660-720 | True |
| Touching before | 570-600 | True |
| Partial overlap | 630-690 | False |
| Inside / containing / identical | 615-645, 570-690, 600-660 | False |
| Blocked | 660-720, blocked = True | False |
| Exactly 120 | 720-840 | True |
| 121 minutes | 720-841 | False |
| Starts now | 540-570 | False |
| One minute after now | 541-571 | True |
| Reversed / zero length | 720-660, 700-700 | False |
| Ends at 1440 / after 1440 | 1380-1440 / 1380-1441 | True / False |
| Negative start | -30 to 30 | False |
| Second booking overlaps | 720-780, existing [(600,660),(700,760)] | False |
| Unsorted list | 610-650, existing [(900,960),(600,660)] | False |
| Empty list | 600-660, existing [] | True |
| Same call twice, list unchanged | 660-720 twice | True both times, `existing` equal before and after |
| Return type | any case | `type(result) is bool` |

If this plan works for you, approve it and I will write the function.
~~~~

### B2

- **Tool:** Claude (claude.ai app)
- **Model:** claude-opus-5-5
- **Date:** 2026-10-22
- **Stage:** Generate
- **Source:** this SIS

**Prompt:**

~~~~text
I approve the plan. Now write can_book(start, end, now, blocked, existing) in Python using only the standard library. Keep the signature exactly as given, return True or False, do not change existing, and add nothing beyond AC1-AC4. Give the whole function in one code block.
~~~~

**Response:**

~~~~text
```python
def can_book(start, end, now, blocked, existing):
    """Return True only when the request satisfies AC1-AC4; never modifies existing."""
    # AC3: a blocked room rejects every request
    if blocked:
        return False

    # AC1: integer minutes (bool is excluded, it is a subclass of int)
    for value in (start, end):
        if not isinstance(value, int) or isinstance(value, bool):
            return False

    # AC1: inside the day and in the right order
    if not (0 <= start < end <= 1440):
        return False

    # AC1: the start must be strictly after now
    if start <= now:
        return False

    # AC2: at most 120 minutes, exactly 120 is allowed
    if end - start > 120:
        return False

    # AC4: half-open intervals [start, end) and [b_start, b_end) overlap
    # only when each one starts before the other ends; touching is allowed
    for b_start, b_end in existing:
        if start < b_end and b_start < end:
            return False

    return True
```

The checks run in the order of the plan, and each one returns False as soon as it fails. `existing` is only read in the `for` loop, never sorted or changed, and the function returns only the literals `True` and `False`.
~~~~

### B3

- **Tool:** ChatGPT (new chat)
- **Model:** GPT-6
- **Date:** 2026-10-22
- **Stage:** Critique
- **Source:** this SIS

**Prompt:**

~~~~text
Review this Python function and this React page against the acceptance criteria below. For each of AC1-AC6 say whether it is satisfied, cite the exact line, and give concrete test inputs that would prove a defect. Do not suggest new features.

Acceptance criteria:
AC1 integer minutes after midnight, 0 <= start < end <= 1440; start strictly after now.
AC2 duration at most 120 minutes; exactly 120 is permitted.
AC3 reject every request when the room is blocked.
AC4 reject overlap with any existing booking; touching at an endpoint is NOT overlap. Intervals include start and exclude end.
AC5 an unambiguous Available / Unavailable result; never mutate existing bookings.
AC6 understandable validation feedback; usable narrow/mobile layout.
Contract: can_book(start, end, now, blocked, existing) returns True only when AC1-AC4 hold.

=== code/booking.py ===
DAY_END = 1440      # minutes in a day; a booking may end exactly at midnight (AC1)
MAX_DURATION = 120  # minutes; exactly 120 is allowed (AC2)


def _is_minute(value):
    # bool is a subclass of int in Python, so exclude it explicitly
    return isinstance(value, int) and not isinstance(value, bool)


def can_book(start, end, now, blocked, existing):
    """Return True only when AC1-AC4 all hold. Never changes `existing`.

    start, end - integer minutes after midnight, interval is [start, end)
    now        - current minute (0-1439), the start must be strictly after it
    blocked    - True when the selected room accepts no requests
    existing   - collection of (start, end) pairs, read only
    """
    # AC3: a blocked room rejects every request
    if blocked:
        return False

    # AC1: integer minutes, 0 <= start < end <= 1440, start strictly after now
    if not (_is_minute(start) and _is_minute(end)):
        return False
    if not (0 <= start < end <= DAY_END):
        return False
    if start <= now:
        return False

    # AC2: at most 120 minutes
    if end - start > MAX_DURATION:
        return False

    # AC4: [start, end) overlaps [b_start, b_end) only when each starts before the other ends;
    # touching at an endpoint is not overlap
    for b_start, b_end in existing:
        if start < b_end and b_start < end:
            return False

    return True

=== web/final/src/App.tsx ===
import { useMemo, useState } from "react";
import { Clock, DoorClosed, CheckCircle2, XCircle, Lock, Info, Calendar } from "lucide-react";

type Booking = { start: number; end: number; label: string };

const NOW = 9 * 60; // 09:00 fixed
const ROOM = "Room 204";

const PRIMARY_BOOKING: Booking = { start: 10 * 60, end: 11 * 60, label: "10:00 – 11:00" };
const SECONDARY_BOOKING: Booking = { start: 11 * 60 + 40, end: 12 * 60 + 40, label: "11:40 – 12:40" };

function toMinutes(time: string): number | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function toHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const mm = min % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

type Result =
  | { status: "available" }
  | { status: "unavailable"; reason: string };

function checkAvailability(
  start: number,
  end: number,
  blocked: boolean,
  bookings: Booking[],
): Result {
  if (blocked) {
    return { status: "unavailable", reason: `${ROOM} is currently blocked and cannot be booked.` };
  }
  if (start < 0 || end > 1440 || start >= end) {
    return { status: "unavailable", reason: "Times must be valid: start before end, between 00:00 and 24:00." };
  }
  if (start <= NOW) {
    return { status: "unavailable", reason: `Start time must be after the current time (${toHHMM(NOW)}).` };
  }
  if (end - start > 120) {
    return { status: "unavailable", reason: `Booking duration is ${end - start} minutes. The maximum allowed is 120 minutes.` };
  }
  for (const b of bookings) {
    // overlap if start < b.end && b.start < end; touching endpoints allowed
    if (start < b.end && b.start < end) {
      return { status: "unavailable", reason: `Overlaps an existing booking (${b.label}).` };
    }
  }
  return { status: "available" };
}

export default function App() {
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("12:00");
  const [midnight, setMidnight] = useState(false);
  const [includeSecond, setIncludeSecond] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const bookings = useMemo<Booking[]>(
    () => (includeSecond ? [PRIMARY_BOOKING, SECONDARY_BOOKING] : [PRIMARY_BOOKING]),
    [includeSecond],
  );

  function handleCheck() {
    const s = toMinutes(startTime);
    if (s === null) {
      setResult({ status: "unavailable", reason: "Please enter valid times in HH:MM format." });
      return;
    }
    const e = midnight ? 1440 : toMinutes(endTime);
    if (e === null) {
      setResult({ status: "unavailable", reason: "Please enter valid times in HH:MM format." });
      return;
    }
    setResult(checkAvailability(s, e, blocked, bookings));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <DoorClosed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Smart Campus Room Availability Checker</h1>
              <p className="text-sm text-slate-500">Check a room's availability before booking.</p>
            </div>
          </div>
        </header>

        {/* Room card */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Selected room</p>
                <p className="text-lg font-semibold">{ROOM}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">Current time: {toHHMM(NOW)}</span>
            </div>
          </div>

          {/* Bookings today */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Bookings today</p>
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li key={b.label} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span className="font-medium text-slate-700">{b.label}</span>
                  <span className="text-slate-400">· booked</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Controls card */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Check a time slot</h2>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">Start time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
            setStartTime(e.target.value);
            setResult(null);
          }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">End time</span>
              <input
                type="time"
                value={endTime}
                disabled={midnight}
                onChange={(e) => {
            setEndTime(e.target.value);
            setResult(null);
          }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:opacity-50"
              />
              <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={midnight}
                  onChange={(e) => {
                    setMidnight(e.target.checked);
                    setResult(null);
                  }}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                />
                Ends at midnight (24:00)
              </label>
            </label>
          </div>

          <div className="mt-5 space-y-3">
            {/* Test data checkbox */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100">
              <input
                type="checkbox"
                checked={includeSecond}
                onChange={(e) => {
            setIncludeSecond(e.target.checked);
            setResult(null);
          }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
              />
              <span className="text-sm text-slate-700">
                Include test booking <span className="font-medium">11:40 – 12:40</span>
              </span>
            </label>

            {/* Room blocked toggle */}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <label htmlFor="blocked" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Lock className="h-4 w-4 text-slate-500" />
                Room blocked
              </label>
              <button
                id="blocked"
                type="button"
                role="switch"
                aria-checked={blocked}
                onClick={() => {
            setBlocked((v) => !v);
            setResult(null);
          }}
                className={`relative h-6 w-11 rounded-full transition-colors ${blocked ? "bg-rose-500" : "bg-slate-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${blocked ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheck}
            className="mt-5 w-full rounded-lg bg-sky-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99]"
          >
            Check availability
          </button>
        </section>

        {/* Result */}
        {result && (
          <section
            className={`rounded-2xl border p-5 shadow-sm transition ${
              result.status === "available"
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.status === "available" ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-rose-600" />
              )}
              <div>
                <p
                  className={`text-lg font-semibold ${result.status === "available" ? "text-emerald-700" : "text-rose-700"}`}
                >
                  {result.status === "available" ? "Available" : "Unavailable"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {result.status === "available"
                    ? `${ROOM} is free from ${startTime} to ${midnight ? "24:00" : endTime}. You can proceed to book it.`
                    : result.reason}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Helper note */}
        <p className="mt-5 flex items-start gap-2 text-xs text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          This tool only checks availability. It does not create, save, or confirm any booking.
        </p>
      </div>
    </div>
  );
}
~~~~

**Response:**

~~~~text
Code Review — AC1–AC6
Overall: The Python function satisfies AC1–AC5 under the documented input assumptions. The React page has one clear AC6 issue with its mobile layout. AC1 also has a potential validation gap in Python because now is not validated.
AC	Python	React
AC1 — Valid times	Partially satisfied	Satisfied for UI inputs
AC2 — Max 120 minutes	Pass	Pass
AC3 — Blocked room	Pass	Pass
AC4 — Booking overlap	Pass	Pass
AC5 — Result and no mutation	Pass	Pass
AC6 — Feedback and mobile	N/A	Partially satisfied

AC1 — Valid integer times
Python: Lines 35–40 validate start and end, but do not validate that now is an integer within 0–1439.

Defect test:
can_book(600, 660, -1, False, [])# Actual: True# Expected: False if now must be a valid minute after midnight



React: Lines 66–69 parse valid HH:MM values. Lines 91–95 check the interval and require the start to be after NOW.

Test: start 09:00, end 09:30 → Unavailable. Start 09:01, end 09:30 → Available.

The fixed NOW = 09:00 on line 60 is a documented demo assumption, rather than necessarily a defect.
AC2 — Maximum duration
Satisfied in both.

Python line 43 and React line 97 reject durations greater than 120 minutes.

Tests:
can_book(660, 780, 540, False, [])# True — exactly 120 minutescan_book(660, 781, 540, False, [])# False — 121 minutes



No defect demonstrated.
AC3 — Blocked room
Satisfied in both.

Python lines 30–32 and React lines 88–89 reject requests when blocked is true.

Test:
can_book(660, 720, 540, True, [])# False



React test: enable Room blocked, choose 11:00–11:30, and press Check availability.

Expected and actual: Unavailable.
AC4 — Existing bookings
Satisfied in both.

Python lines 48–50 and React lines 100–103 correctly use:
start < b_end and b_start < end



Tests with existing booking (600, 660):
Requested interval	Expected
09:30–10:30	Unavailable
10:30–11:30	Unavailable
11:00–11:30	Available
09:00–10:00	Unavailable if starting now; otherwise touching is allowed

The interval 11:00–11:30 touches the existing booking's ending boundary without overlapping.

No defect demonstrated.
AC5 — Clear result and no mutation
Satisfied in both.

Python line 52 returns True when all checks pass. Lines 31–50 return False when a rule fails.

React line 296 displays either Available or Unavailable.

React lines 117–119 build the displayed booking list without changing the original bookings. The checker only reads that list.

Mutation test:
existing = [(600, 660)]before = existing.copy()can_book(660, 720, 540, False, existing)assert existing == before



Expected: assertion passes.
AC6 — Validation feedback and mobile layout
Partially satisfied in React.

Validation messages are understandable:
- Lines 124–130: invalid time format.
- Lines 91–98: invalid interval, past start or excessive duration.
- Lines 100–103: overlapping booking.
- Lines 278–302: visible result and explanation.
Defect: Line 187 uses:
<div className="grid grid-cols-2 gap-4">


This forces two columns even on narrow mobile screens.

Concrete test: open the page in browser developer tools with a 320px viewport, inspect the Start time and End time controls, and check whether the labels, time inputs and midnight checkbox fit without clipping or overflow.

The code shows a potential narrow-screen usability issue, but actual visual failure needs browser testing.

Conclusion
The backend and frontend implement the main booking rules consistently for normal inputs. The review identifies two points requiring attention:
1. Python AC1: now is not type- or range-validated (lines 34–40). Whether this is a contract defect depends on whether callers must already supply a valid now.
2. React AC6: The two-column time-input layout is not responsive at narrow widths (line 187). Actual overflow should be confirmed in a mobile viewport.
No defects were demonstrated for AC2–AC5. The code also correctly permits bookings lasting exactly 120 minutes and bookings that touch existing reservation endpoints without overlapping.
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
| Checker: all 55 checks PASS | Nothing to declare under known_fails | - |
| Order of work: the Bolt part was done before the baseline commit | The Bolt prompt, v1, the repairs and the page tests (sections 4-7) were made before I wrote and committed section 2; the Python Plan and Generate exchanges came after the baseline commit | Next time write and push section 2 first, before opening Bolt |
| T9 on the page is Not testable | A `type="time"` input stops at 23:59 and the "Ends at midnight" checkbox gives exactly 24:00, so an end of 24:01 (1441) cannot be entered; the Python function rejects it (T9 False) | Nothing in scope - the input itself prevents the invalid value |
| Time inputs are clipped below ~375 px (critique claim 2) | At 320 px the two-column grid leaves each time input 113 px wide and the text is cut to "11:00 A" (evidence/final-cases/critique-320px.png); at 375 px, the AC6 target (T12), it is fine | One focused prompt: use `grid-cols-1 sm:grid-cols-2` for the two time inputs |
| The Available text still says "You can proceed to book it." | The page never books anything (the footer says so), but this sentence suggests a next step that does not exist | One focused prompt: change the text to "Room 204 is free from HH:MM to HH:MM." and nothing else |
| The "Ends at midnight" checkbox sits inside the End time `<label>` | The end time input's accessible name becomes "End time Ends at midnight (24:00)"; found while scripting the final run, it changes no result | Move the checkbox out of the End time label so each control has its own name |