# SIS #04 — Report: Evolving the Smart Campus Room Availability Checker

<!-- The ONLY file you write prose in. Keep every numbered heading (## 1. … ## 10.), every
     ### sub-heading and every **Label:** word — the checker finds your answers by them.
     Replace every "(write here)" and "(paste here)". Delete these <!-- --> comments if you like. -->

## 1. Setup and starting point

| Item | Value |
| --- | --- |
| Assistant (tool) | Claude (claude.ai, agent session; fresh sub-sessions for the analysis and implementation chats) |
| Assistant model | Claude Opus 5.5 (claude-opus-5-5) |
| Starting point | week-08 |
| Baseline commit | 245dd7e |
| Language (ts or js) | js |
| Vitest version | 3.2.7 |
| Where I ran the tests | Linux workspace of the Claude agent session, Node v22.23.4, `npx vitest run` inside `sis-04/app` |

### 1.1 Baseline run

Run inside `sis-04/app` at the baseline commit `245dd7e`, right after `npm install`:

```text
 RUN  v3.2.7 /home/claude/se-practice/sis-04/app

 ✓ src/booking.test.js (25 tests) 7ms

 Test Files  1 passed (1)
      Tests  25 passed (25)
   Start at  23:23:17
   Duration  233ms (transform 40ms, setup 0ms, collect 28ms, tests 7ms, environment 0ms, prepare 53ms)
```

## 2. Context for the assistant

### 2.1 Repository map

```text
sis-04/app (plain JavaScript + Vite, tests with Vitest 3)
index.html            - the page: form (current time, room select, "room is blocked" checkbox, start, end), styles, result box
src/main.js           - all UI logic: holds the rooms array (3 rooms: id, name, blocked, bookings), fills the select,
                        showRoom() shows the room's bookings, reasonFor() picks the message for an Unavailable result,
                        the click handler reads the times, calls canBook and writes the result HTML;
                        the blocked checkbox handler writes room.blocked
src/booking.js        - canBook({ start, end, now, blocked, bookings }): boolean, the AC1-AC5 rules (minutes after midnight)
src/booking.test.js   - 25 Vitest tests for canBook, titles carry IDs (T01-T14, X1, X2, B1-B6, BUG-A, BUG-B, AC1-AC5)
package.json          - scripts dev / build / test, devDependencies vite and vitest
```

### 2.2 The context message as sent

The first message of the analysis chat (fresh session, 2026-11-15), unedited. It ends with the
code of `booking.js`, `main.js`, the body of `index.html` and the test titles.

```text
I am extending a small existing web app and I want a maintainability review and a plan of small steps. No code yet, and not a full rewrite.

REPOSITORY MAP (sis-04/app, plain JavaScript + Vite, tests with Vitest 3)
index.html            - the page: form (current time, room select, "room is blocked" checkbox, start, end), styles, result box
src/main.js           - all UI logic: holds the rooms array (3 rooms: id, name, blocked, bookings), fills the select,
                        showRoom() shows the room's bookings, reasonFor() picks the message for an Unavailable result,
                        the click handler reads the times, calls canBook and writes the result HTML;
                        the blocked checkbox handler writes room.blocked
src/booking.js        - canBook({ start, end, now, blocked, bookings }): boolean, the AC1-AC5 rules (minutes after midnight)
src/booking.test.js   - 25 Vitest tests for canBook, titles carry IDs (T01-T14, X1, X2, B1-B6, BUG-A, BUG-B, AC1-AC5)
package.json          - scripts dev / build / test, devDependencies vite and vitest

REQUIREMENTS TO PRESERVE (AC1-AC6)
AC1 Reject start >= end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Clear, responsive feedback on desktop and mobile.

NEW REQUIREMENTS (room catalog of at least 4 fictional rooms: id, name, capacity, equipment list, blocked, own bookings)
F1 Capacity filter: room capacity must be greater than or equal to the requested attendees.
F2 Equipment filter: the room must contain ALL selected required items.
F3 A blocked room cannot be reported as available.
F4 Show a clear empty state when no rooms match.
F5 Changing the selected room must refresh the availability result appropriately.

FIXED LAYOUT I must end with: src/rooms.js (type Room + ROOMS), src/filter.js filterRooms(rooms, { attendees, equipment }),
src/booking.js canBook (unchanged) + checkRoom(rooms, roomId, { start, end, now }) which calls canBook with that room's
blocked and bookings; the UI only imports these and holds no room data and no rule of its own.

CONSTRAINTS
No login, no payments, no live APIs, no database, no browser storage. Fictional data only. canBook must not change.

Please give me:
1. The maintainability risks you see in this code, each with the file and function it is in and why it is a risk.
2. A short prioritised plan of small, safe steps (smallest first), each step small enough to test and commit on its own.
Again: no code and no full rewrite, just the risks and the plan.

Here is the code.

--- src/booking.js ---
// canBook - the booking decision, extracted from checkAvailability() in the Week 06 page.
// start, end, now: minutes after midnight on the same day (600 = 10:00, 1440 = 24:00)
// blocked: true when the room is blocked
// bookings: the room's existing bookings, e.g. [{ start: 600, end: 660 }]
// returns true (Available) or false (Unavailable). It only reads its inputs.
export function canBook({ start, end, now, blocked, bookings }) {
  if (!(0 <= start && start < end && end <= 1440)) return false;
  if (!(start > now)) return false;
  if (end - start > 120) return false;
  if (blocked) return false;
  for (const b of bookings) {
    if (start < b.end && end > b.start) return false;
  }
  return true;
}

--- src/main.js ---
import { canBook } from './booking.js';

const rooms = [
  { id: "A101", name: "A101 - Lecture Hall", blocked: false, bookings: [{ start: 600, end: 660 }] },
  { id: "B204", name: "B204 - Seminar Room", blocked: false, bookings: [{ start: 540, end: 600 }, { start: 780, end: 840 }] },
  { id: "C310", name: "C310 - Computer Lab", blocked: true, bookings: [] }
];

const roomSelect = document.getElementById("room");
rooms.forEach(r => {
  const o = document.createElement("option");
  o.value = r.id; o.textContent = r.name;
  roomSelect.appendChild(o);
});

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function toHHMM(min) {
  return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
}

function showRoom() {
  const room = rooms.find(r => r.id === roomSelect.value);
  document.getElementById("blocked").checked = room.blocked;
  const list = room.bookings.map(b => "<li>" + toHHMM(b.start) + " - " + toHHMM(b.end) + "</li>").join("");
  document.getElementById("roomInfo").innerHTML =
    (room.blocked ? '<span class="tag">Blocked</span>' : "") +
    "<div><b>Existing bookings:</b>" + (list ? "<ul>" + list + "</ul>" : " none") + "</div>";
}

// The decision comes from canBook. This only picks the message to show for an Unavailable
// result: the first rule that fails, in the order of AC1-AC4 (same texts as in Week 06).
function reasonFor(room, start, end, current) {
  if (!(start >= 0 && start < end && end <= 1440))
    return "The end time must be later than the start time (AC1).";
  if (start <= current)
    return "The start time must be after the current time " + toHHMM(current) + " (AC1).";
  if (end - start > 120)
    return "The booking is " + (end - start) + " minutes; the limit is 120 minutes (AC2).";
  if (room.blocked)
    return "This room is blocked (AC3).";
  const b = room.bookings.find(b => start < b.end && b.start < end);
  if (b)
    return "Overlaps the existing booking " + toHHMM(b.start) + " - " + toHHMM(b.end) + " (AC4).";
  return "Unavailable.";
}

document.getElementById("check").addEventListener("click", () => {
  const room = rooms.find(r => r.id === roomSelect.value);
  // AC6: an empty time field gets its own message instead of a misleading AC1 reason.
  const empty = [["now", "current time"], ["start", "start time"], ["end", "end time"]]
    .filter(([id]) => !document.getElementById(id).value).map(([, label]) => label);
  if (empty.length) {
    document.getElementById("result").innerHTML =
      '<div class="result no" role="alert">Please fill in the ' + empty.join(" and the ") + '.' +
      '<div class="reason">No decision was made - a time field is empty.</div></div>';
    return;
  }
  const start = toMinutes(document.getElementById("start").value);
  const end = toMinutes(document.getElementById("end").value);
  const current = toMinutes(document.getElementById("now").value);
  const ok = canBook({ start, end, now: current, blocked: room.blocked, bookings: room.bookings });
  const reason = ok ? "No conflicts. Nothing has been saved - this only checks availability."
                    : reasonFor(room, start, end, current);
  document.getElementById("result").innerHTML =
    '<div class="result ' + (ok ? "ok" : "no") + '" role="status">' + (ok ? "Available" : "Unavailable") +
    '<div class="reason">' + reason + "</div></div>";
});

roomSelect.addEventListener("change", showRoom);
document.getElementById("blocked").addEventListener("change", e => {
  rooms.find(r => r.id === roomSelect.value).blocked = e.target.checked;
  showRoom();
});
showRoom();

--- index.html (body only) ---
<body>
<main>
  <h1>Smart Campus Room Availability Checker</h1>
  <p class="sub">Check if a room is free for a time slot. Sample data only.</p>

  <div class="card">
    <label for="now">Current time</label>
    <input type="time" id="now" value="09:00">

    <label for="room" style="margin-top:14px">Room</label>
    <select id="room"></select>
    <label class="check" style="margin-top:12px;font-weight:400"><input type="checkbox" id="blocked" style="width:auto"> Room is blocked (e.g. maintenance)</label>
    <div id="roomInfo" style="margin-top:12px"></div>

    <div class="row">
      <div><label for="start">Start</label><input type="time" id="start" value="11:00"></div>
      <div><label for="end">End</label><input type="time" id="end" value="12:00"></div>
    </div>
    <button id="check">Check availability</button>
  </div>

  <div id="result"></div>
</main>

<script type="module" src="/src/main.js"></script>
</body>

--- src/booking.test.js (titles only) ---
T02 AC1: 540-570 starts exactly at now (540) is rejected
T03 AC1: 720-720 zero duration is rejected
T04 AC1: 750-720 reversed interval is rejected
T05 AC1: 1380-1441 ends one minute after 24:00 and is rejected
X1 AC1 AC2: 1320-1440 ends exactly at 24:00 with 120 minutes and is accepted
B1 AC1: 541-571 starts one minute after now and is accepted
B2 AC1: 530-570 starts before now (540) but ends after it and is rejected
T06 AC2: 720-840 is exactly 120 minutes and is accepted
T07 AC2: 720-841 is 121 minutes and is rejected
T13 AC3: 660-720 in a blocked room is rejected
T01 AC4: 660-720 touches the end of 600-660 and is accepted
T08 AC4: 570-600 touches the start of 600-660 and is accepted
T09 AC4: 630-690 partly overlaps 600-660 and is rejected
T10 AC4: 570-690 contains the whole booking 600-660 and is rejected
T11 AC4: 615-645 lies inside 600-660 and is rejected
T12 AC4: 600-660 is identical to the booking and is rejected
T14 AC4: 630-690 with no bookings ([]) is accepted
X2 AC4: 660-750 touches 600-660 but overlaps the second booking 720-780 and is rejected
B3 AC4: 659-719 overlaps the end of 600-660 by one minute and is rejected
B4 AC4: 571-601 overlaps the start of 600-660 by one minute and is rejected
B5 AC4: 630-690 with unsorted bookings [720-780, 600-660] overlaps the later entry and is rejected
B6 AC4: 660-720 fills the gap between 600-660 and 720-780, touching both, and is accepted
AC5: an Available request (660-720) leaves the bookings exactly as before
BUG-A AC4: 1380-1440 touches the end of 1320-1380 and ends at 24:00, so it is Available
BUG-B AC5: an Available request 720-780 that touches nothing leaves the bookings unchanged
```

## 3. Codebase analysis (Task 1)

### 3.1 Maintainability risks

Each row was checked in the baseline code (`git show 245dd7e:sis-04/app/src/main.js`), line numbers
from `grep -n` on that file.

| # | Risk | Where (file / function) | Evidence | Priority |
| --- | --- | --- | --- | --- |
| 1 | The booking rules exist twice: the page re-implements AC1-AC4 to pick the message, so a rule change in one place leaves the other wrong | `src/main.js`, `reasonFor()` | Line 40 `if (end - start > 120)` and line 44 `start < b.end && b.start < end` repeat the checks of `canBook()` in `src/booking.js`; nothing tests that the two agree | High |
| 2 | The UI writes room data, so a blocked room can be made Available from the page (breaks F3, against AC5) | `src/main.js`, the `#blocked` change handler | Line 74 `rooms.find(r => r.id === roomSelect.value).blocked = e.target.checked;` - selecting C310 (blocked) and unticking the box changes the room object itself, and the next check returns Available | High |
| 3 | The old result stays on screen when the room changes, so it looks like the new room's answer (F5) | `src/main.js`, `roomSelect` change handler and `showRoom()` | Line 72 `roomSelect.addEventListener("change", showRoom);` - `showRoom()` only rewrites `#roomInfo`, `#result` is never touched | High |
| 4 | Room data lives inside the UI file, with no capacity or equipment, so a filter has nothing pure to test against | `src/main.js`, `const rooms` | Lines 3-7 define the three rooms inside the page script; `booking.test.js` cannot import them without loading the DOM code | Medium |
| 5 | Test ID collision: the Week 07 suite already uses B1-B6 for other cases, so the SIS boundary IDs would point at the wrong tests | `src/booking.test.js`, the B1-B6 test titles | Old `B3 AC4: 659-719 overlaps ... and is rejected` expects false, but SIS B3 is "touching -> true"; old B1 is "one minute after now", SIS B1 is "exactly 120 minutes" (the assistant did not see this one) | Medium |
| 6 | The same room lookup is written three times, and none of them handles "no room selected" (an empty filter result would throw) | `src/main.js`, `showRoom()`, the click handler, the `#blocked` handler | `rooms.find(r => r.id === roomSelect.value)` on lines 25, 51 and 74, each followed by `room.blocked` with no `undefined` check | Low |

### 3.2 Improvement plan — before editing

Written from the assistant's revised plan (8.2), changed where noted in 3.3. Every code step: the
failing test first, then the code, then `npx vitest run` for the whole suite, then a commit.

1. Rename the old B1-B6 test titles in `booking.test.js` to W1-W6 (titles only, assertions untouched); the suite must still be 25/25. (Risk 5)
2. Create `src/rooms.js` with the `Room` typedef and `ROOMS` (5 fictional rooms with capacity and equipment, the three old rooms keep their bookings); `main.js` imports `ROOMS` instead of its own array. (Risk 4)
3. Tests first for `checkRoom` in `src/checkRoom.test.js` (B1-B4, F3, F5, AC5, unknown id, fixed catalog in the file), then add `checkRoom(rooms, roomId, { start, end, now }): boolean` to `booking.js`, calling `canBook` with that room's `blocked` and `bookings`. `canBook` stays byte-for-byte unchanged.
4. Tests first for `filterRooms` in `src/filter.test.js` (F1, F2, B5, B6, F4 empty result, INT = filterRooms then checkRoom), then add `src/filter.js`.
5. Tests first for `unavailableReason` (the message code) in `booking.js`, then move the reason out of `main.js`: the page takes the decision from `checkRoom` and only turns the code into text. Delete `reasonFor()`. (Risk 1)
6. Remove the blocked checkbox; the page shows a "Blocked" tag from the data instead and never writes room data. (Risk 2)
7. Page: attendees input and equipment checkboxes, the room list from `filterRooms`, an empty state when nothing matches (F4), and the result re-checked for the new room when the room changes (F5). (Risks 3, 6)
8. Remove the duplicated UI code (one room lookup, one result renderer, rendering helpers in their own module), check the page at phone width (AC6), then diagrams, screenshots and the report.

### 3.3 One AI suggestion I rejected or modified

| Suggestion (as the assistant made it) | Decision | Why — with the AC, F-rule, test or file behind it |
| --- | --- | --- |
| "`checkRoom` returns `{ available, reason }`, where `reason` is a code plus details" (8.1, plan step 5) | Rejected | README section 7 fixes `checkRoom(rooms, roomId, { start, end, now }): boolean`, and my F3 and F5 tests assert `toBe(true)` / `toBe(false)` on it; an object would always be truthy on the page. The reason goes into a separate `unavailableReason()` in `src/booking.js` (plan step 5). |
| "rename the titles of the old B1-B6 to unused IDs (for example E1-E6)" and reason tests "with titles like R1-R5" (8.2) | Modified | E1-E3 and R1-R3 are check IDs of `tests/check_sis.py` (screenshots and runs), so those names would be confusing in the report; I use W1-W6 for the old Week 07 boundary tests and M1-M5 for the message tests. |
| "The blocked checkbox becomes read-only (disabled, shows `room.blocked`)" (8.2, step 6) | Modified | A disabled checkbox still looks like a control the user could use. F3 says a blocked room is never Available, and blocked is room data (README section 7), so I remove the checkbox and show a "Blocked" label from `ROOMS`. |

## 4. Feature extension (Task 2)

### 4.1 What I added

<!-- Short: the catalog (how many rooms, which equipment), how the filter is chosen on the page,
     what the empty state says, what happens to an old result when the room changes. -->

(write here)

### 4.2 Demonstration

<!-- One row per screenshot in evidence/. Say what is on it: the filter values, the rooms shown,
     the room selected, the times entered and the result. -->

| Screenshot | What it shows |
| --- | --- |
| `evidence/filter-match.png` | (write here) |
| `evidence/filter-empty.png` | (write here) |
| `evidence/switch-a.png` | (write here) |
| `evidence/switch-b.png` | (write here) |
| `evidence/narrow.png` | (write here) |

## 5. Refactoring (Task 3)

<!-- The diagrams are diagrams/before.puml and diagrams/after.puml (README section 8). -->

### 5.1 Module responsibilities after

| Module or component | Responsibility |
| --- | --- |
| `src/rooms.ts` | (write here) |
| `src/booking.ts` | (write here) |
| `src/filter.ts` | (write here) |
| (write here) | (write here) |

### 5.2 Design decisions

<!-- At least two. The alternative is what you could have done instead (often what the assistant
     proposed). The why names an AC, an F-rule, a test or a risk from 3.1. -->

| Decision | Alternative I did not take | Why |
| --- | --- | --- |
| (write here) | (write here) | (write here) |
| (write here) | (write here) | (write here) |

### 5.3 Duplication removed

<!-- One row per duplicated location that is gone. Count what you can point at, nothing else. -->

| Before (file / function, what was repeated) | After (where it lives now) |
| --- | --- |
| (write here) | (write here) |

## 6. Automated tests (Task 4)

### 6.1 Test plan

<!-- One row per required ID. A test may carry several IDs in its title,
     e.g. test('T06 B1 AC2: exactly 120 minutes is available', …) covers B1 and AC2. -->

| ID | Test title (as in the file) | Input → expected |
| --- | --- | --- |
| AC1 | (write here) | (write here) |
| AC2 | (write here) | (write here) |
| AC3 | (write here) | (write here) |
| AC4 | (write here) | (write here) |
| AC5 | (write here) | (write here) |
| F1 | (write here) | (write here) |
| F2 | (write here) | (write here) |
| F3 | (write here) | (write here) |
| F4 | (write here) | (write here) |
| F5 | (write here) | (write here) |
| B1 | (write here) | (write here) |
| B2 | (write here) | (write here) |
| B3 | (write here) | (write here) |
| B4 | (write here) | (write here) |
| B5 | (write here) | (write here) |
| B6 | (write here) | (write here) |
| INT | (write here) | (write here) |

### 6.2 Commands

<!-- The commands exactly as you typed them, from app/. -->

```text
(paste here)
```

### 6.3 Final run

<!-- The REAL output of the full run on your final code. Every test passes, and the number of
     tests equals what your test files hold (R2). -->

```text
(paste here)
```

## 7. Quality evaluation (Task 5)

<!-- Original = your baseline commit. Final = what you submit. "How I obtained it" says how you
     measured, so someone else could repeat it: "1.1 and 6.3 runs", "counted in 5.3",
     "git ls-files app/src". Do not invent a metric. Tests: write passed/total, e.g. 19/19. -->

| Measure | Original | Final | How I obtained it |
| --- | --- | --- | --- |
| Automated tests passed / total | (write here) | (write here) | (write here) |
| Duplicated logic locations removed | (write here) | (write here) | (write here) |
| Code structure: modules and their responsibilities | (write here) | (write here) | (write here) |
| Remaining limitation | (write here) | (write here) | (write here) |

## 8. AI evidence appendix

<!-- At least three exchanges, one ### 8.N block each: the analysis (Task 1), the plan, and at
     least one implementation, refactoring or test exchange. Copy the block for more.
     The prompt as you sent it; the output may be cut to the part you used, with "[…]" where
     you cut. Verified by: the test, run, file or check that confirmed it — not "it looked right". -->

### 8.1 Exchange 1

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

### 8.2 Exchange 2

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

### 8.3 Exchange 3

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

## 9. Checker results and known fails

<!-- Every check still FAIL or ERROR in your last run of python tests/check_sis.py, and why.
     The same IDs go in submission.yml known_fails. None left? Write: none. -->

| Check | Why it still fails |
| --- | --- |
| (write here) | (write here) |

## 10. AI reflection (Task 6)

<!-- 200–300 words, your own words, no assistant. Answer all five:
     What context did you provide the AI assistant? Which generated suggestions were useful or
     incorrect? What did you personally verify? How did tests influence your engineering
     decisions? What would you improve next? -->

(write here)
