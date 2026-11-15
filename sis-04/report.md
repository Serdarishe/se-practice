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

- **Catalog** (`src/rooms.js`): 5 fictional rooms, every field filled: A101 Lecture Hall (80 seats, projector + microphone), B204 Seminar Room (24, projector + whiteboard), C310 Computer Lab (30, computers + projector + whiteboard, **blocked**), D115 Study Room (6, whiteboard), E220 Meeting Room (12, projector + whiteboard + video-call). The three old rooms keep their Week 08 bookings.
- **Filter on the page**: an "Attendees" number field and one checkbox per equipment name. The checkboxes are built from the catalog (`equipmentNames(ROOMS)`), not typed into the HTML. Every change re-runs `filterRooms` and redraws the room cards; the line above the cards says "N of 5 rooms match". An empty attendees field counts as 1.
- **Room choice**: the rooms that match are shown as cards (radio buttons) with seats, equipment, today's bookings and a red "Blocked" label for C310. If the selected room drops out of the filter, the first match is selected.
- **Empty state (F4)**: when nothing matches, the cards are replaced by a dashed box "No rooms match your filter." with the filter repeated ("Nothing in the catalog fits 50 people with whiteboard. Try fewer people or fewer equipment items."), and the Check button is disabled.
- **Room change (F5)**: once a result is on screen, choosing another room (or a filter that changes the selection) re-checks the same times for the new room at once; if no room is left, the result is cleared. Editing a time also re-checks.
- **Result**: the title names the room ("B204: Available", "A101: Unavailable") and the reason comes from `unavailableReason` (AC1-AC4 texts from Week 06).

### 4.2 Demonstration

Taken with Chrome (headless, Playwright) on the dev server (`npx vite`), current time 09:00.

| Screenshot | What it shows |
| --- | --- |
| `evidence/filter-match.png` | Filter 20 attendees + projector + whiteboard: "2 of 5 rooms match", only B204 (24 seats, projector, whiteboard) and C310 (30 seats, has both, shown with the Blocked label). A101 (no whiteboard), D115 (6 seats) and E220 (12 seats) are gone. |
| `evidence/filter-empty.png` | Filter 50 attendees + whiteboard: "0 of 5 rooms match" and the empty state "No rooms match your filter. Nothing in the catalog fits 50 people with whiteboard. [...]"; the Check button is disabled (F4). |
| `evidence/switch-a.png` | No filter (5 of 5), room A101 selected, 10:00-11:00: "A101: Unavailable - Overlaps the existing booking 10:00 - 11:00 (AC4)", from A101's own booking. |
| `evidence/switch-b.png` | The same times 10:00-11:00, B204 selected instead: the result refreshed by itself to "B204: Available - No conflicts. Nothing has been saved" (F5), because B204's bookings are 09:00-10:00 and 13:00-14:00 (10:00 only touches). |
| `evidence/narrow.png` | Phone width 390 px, portrait (780x3008 at 2x): 10 attendees + projector, 4 of 5 rooms in one column, E220 selected, 10:00-11:00 gives "E220: Unavailable - Overlaps the existing booking 10:00 - 11:30 (AC4)"; no sideways scrolling (scrollWidth 390). |

## 5. Refactoring (Task 3)

### 5.1 Module responsibilities after

| Module or component | Responsibility |
| --- | --- |
| `src/rooms.js` | Data only: the `Room` / `Booking` typedefs and `ROOMS`, 5 fictional rooms. No rule, no DOM. |
| `src/booking.js` | Booking rules: `canBook` (AC1-AC5, byte-for-byte as in Week 08), `checkRoom` (one room of a catalog, its own `blocked` and `bookings`, F3, F5), `unavailableReason` (which rule failed, for the message), one private `findRoom`. |
| `src/filter.js` | Filtering rules: `filterRooms` (F1 capacity >= attendees, F2 all selected equipment) and `equipmentNames` (the checkbox list from the data). |
| `src/view.js` | Presentation: HTML for equipment checkboxes, room cards, the empty state and the result box; `toMinutes` / `toHHMM`; turns a reason code into text. Checks no rule. |
| `src/main.js` | App wiring: reads the form, keeps the selected room and whether a result is shown, calls `filterRooms` / `checkRoom` / `unavailableReason`, writes the HTML from `view.js`. |
| `index.html` | The page skeleton and the CSS (one-column layout under 480 px for AC6). |

### 5.2 Design decisions

| Decision | Alternative I did not take | Why |
| --- | --- | --- |
| Blocked rooms stay in the filtered list with a red "Blocked" label; `filterRooms` does only F1/F2 | Hide blocked rooms in `filterRooms` | F3 is enforced once, in `checkRoom` (test `F3 AC3`), so the filter stays a pure F1/F2 rule (test F1 expects the blocked room `c` in the result). A user who needs 30 seats sees why C310 cannot be used instead of the room silently missing. |
| `checkRoom` stays a boolean; the reason is a separate `unavailableReason` in `booking.js` that finds the overlapping booking by asking `canBook` about each booking alone | The assistant's `checkRoom` returning `{ available, reason }` (8.1), or keeping `reasonFor()` in `main.js` | README section 7 fixes the boolean signature and the F3/F5/B1-B4 tests assert `toBe(true/false)`. Keeping the reason in `booking.js` takes the last rule out of the UI (risk 1, checker A5), and the overlap comparison now exists only in `canBook`. |
| When the room changes and a result is on screen, the same times are checked again for the new room at once | Only clear the old result and wait for another click on Check | F5 says the result must refresh; risk 3 was a stale result that looked like the new room's. Re-checking shows the difference directly (switch-a vs switch-b) and costs nothing because `checkRoom` only reads data. |

### 5.3 Duplication removed

Searched every file under `app/src` at the baseline (`git show 245dd7e:sis-04/app/src/main.js`) for repeated rule checks, room lookups and result rendering.

| Before (file / function, what was repeated) | After (where it lives now) |
| --- | --- |
| `main.js` `reasonFor()` line 44: the overlap test `start < b.end && b.start < end`, a copy of the loop in `canBook()` | Gone from the UI. `unavailableReason()` in `booking.js` finds the booking with `!canBook({ ..., bookings: [b] })`, so the comparison exists only in `canBook` (commit `ecd9b2e`, `66a7a85`) |
| `main.js` the room lookup `rooms.find(r => r.id === roomSelect.value)` three times: `showRoom()` line 25, the click handler line 51, the `#blocked` handler line 74 | One private `findRoom()` in `booking.js`, used by `checkRoom` and `unavailableReason`; the page only keeps `selectedId` |
| `main.js` click handler: the result HTML `'<div class="result ...">' ... '<div class="reason">'` written twice (empty-field message, decision) | One `resultBox(kind, title, detail)` in `view.js`, used for all three results |

## 6. Automated tests (Task 4)

### 6.1 Test plan

| ID | Test title (as in the file) | Input → expected |
| --- | --- | --- |
| AC1 | `T02 AC1: 540-570 starts exactly at now (540) is rejected` (booking.test.js) | canBook 540-570, now 540 → false |
| AC2 | `T07 AC2: 720-841 is 121 minutes and is rejected` (booking.test.js) | canBook 720-841 → false |
| AC3 | `T13 AC3: 660-720 in a blocked room is rejected` (booking.test.js); also `F3 AC3: ...` | canBook blocked: true → false |
| AC4 | `T09 AC4: 630-690 partly overlaps 600-660 and is rejected` (booking.test.js) | canBook 630-690 with 600-660 booked → false |
| AC5 | `AC5: checkRoom leaves the catalog unchanged` (checkRoom.test.js); `AC5: an Available request (660-720) leaves the bookings exactly as before` (booking.test.js) | four checkRoom calls → catalog `toEqual` its structuredClone |
| F1 | `F1: 5 attendees keeps only rooms with capacity >= 5 (b: 6, c: 12), blocked rooms stay` (filter.test.js) | filterRooms attendees 5 → ['b', 'c'] |
| F2 | `F2: projector + whiteboard keeps only the room that has ALL of them (b), not rooms with one (a, c)` | filterRooms [projector, whiteboard] → ['b'] |
| F3 | `F3 AC3: a blocked room is never available, the same slot in a free room is` (checkRoom.test.js) | checkRoom r3 (blocked) 720-780 → false; r2 → true |
| F4 | `F4: 20 attendees matches no room, so the result is an empty list`; `F4 F2: equipment that no room has (computers) gives an empty list` | filterRooms → [] |
| F5 | `F5: same times 600-660, two rooms, different result because each uses its own bookings` (checkRoom.test.js) | checkRoom r1 600-660 → false; r2 → true |
| B1 | `B1 AC2: exactly 120 minutes (720-840) is available` (checkRoom.test.js) | checkRoom r2 720-840 → true |
| B2 | `B2 AC2: 121 minutes (720-841) is rejected` | checkRoom r2 720-841 → false |
| B3 | `B3 AC4: touching the booking 600-660 at either end is available` | checkRoom r1 660-720 and 540-600 → true |
| B4 | `B4 AC4: overlapping the booking 600-660 (630-690) is rejected` | checkRoom r1 630-690 → false |
| B5 | `B5 F1: capacity 6 with exactly 6 attendees is included` (filter.test.js) | filterRooms attendees 6 → contains 'b' |
| B6 | `B6 F1: capacity 6 with 7 attendees (one more than the capacity) is excluded` | filterRooms attendees 7 → not 'b' |
| INT | `INT: filterRooms (5 people, projector) returns b, then checkRoom on b: 660-720 touches 600-660 and is available` | filterRooms → ['b'], then checkRoom b 660-720 → true |

The old Week 07 boundary tests B1-B6 were renamed W1-W6 (titles only, commit `3a4af6f`), so every
SIS ID points at the case README section 9 defines. M1-M7 (`reason.test.js`) test `unavailableReason`.

### 6.2 Commands

```text
cd sis-04/app
npm install
npx vitest run
```

### 6.3 Final run

```text
 RUN  v3.2.7 /home/claude/se-practice/sis-04/app

 ✓ src/booking.test.js (25 tests) 6ms
 ✓ src/filter.test.js (8 tests) 5ms
 ✓ src/checkRoom.test.js (8 tests) 4ms
 ✓ src/reason.test.js (7 tests) 5ms

 Test Files  4 passed (4)
      Tests  48 passed (48)
   Start at  23:34:43
   Duration  835ms (transform 56ms, setup 0ms, collect 84ms, tests 20ms, environment 1ms, prepare 206ms)
```

## 7. Quality evaluation (Task 5)

| Measure | Original | Final | How I obtained it |
| --- | --- | --- | --- |
| Automated tests passed / total | 25/25 | 48/48 | The `Tests` line of the baseline run (1.1, commit 245dd7e) and of the final run (6.3), both `npx vitest run` in `sis-04/app` |
| Duplicated logic locations removed | 0 | 3 | Counted the rows of 5.3; each row points at baseline lines (`git show 245dd7e:sis-04/app/src/main.js`, `grep -n`) |
| Code structure: modules and their responsibilities | 2 source modules (`booking.js` rules; `main.js` data + UI + a copy of the rules) + 1 test file | 5 source modules (`rooms.js` data, `booking.js` and `filter.js` rules, `view.js` rendering, `main.js` wiring) + 4 test files | `git ls-files sis-04/app/src` at 245dd7e (3 files) and at the final commit (9 files), read against 5.1 |
| Remaining limitation | - | The AC1/AC2 checks (`0 <= start < end <= 1440`, `start > now`, `end - start > 120`) still exist twice in `booking.js`: in `canBook` and in `unavailableReason`, because `canBook` must stay unchanged; only tests M1-M3 keep the messages in step. The page itself (`main.js`, F4/F5 on screen) has no committed test: it was checked with a Playwright script and the screenshots, not with Vitest. | Read `booking.js` after the refactor; `git ls-files` shows no test for `main.js` or `view.js` |

## 8. AI evidence appendix

### 8.1 Exchange 1

**Tool and model:** Claude, Claude Opus 5.5 (claude-opus-5-5), a fresh session with no earlier context
**Date:** 2026-11-15
**Purpose:** Task 1 - codebase analysis: maintainability risks and a first plan, no code

**Prompt:**

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

**Output used:** (every line indented by two spaces, so that the assistant's own "## 1." headings are not read as headings of this report)

```text
  ## 1. Maintainability risks

  **High**

  1. **The rules are written twice.** `src/main.js`, `reasonFor()`
     `reasonFor()` re-implements AC1-AC4 (range check, `start <= current`, 120-minute limit, blocked, overlap) next to `canBook()`. Right now they agree, but nothing checks that. [...] Your target layout also says the UI must hold no rule of its own, so this function has to leave `main.js`.

  2. **The UI changes room data.** `src/main.js`, the blocked checkbox `change` handler
     It writes `room.blocked = e.target.checked`. [...] It also conflicts with F3: anyone can untick "blocked" on C310 and get "Available". [...]

  3. **The result is not refreshed when the room changes (F5).** `src/main.js`, the `roomSelect` `change` handler and `showRoom()`
     Changing the room only redraws the room info. The old Available/Unavailable box stays on screen and now looks like it belongs to the new room. [...]

  4. **No handling for "no room selected" (F4).** `src/main.js`, `showRoom()` and the `check` click handler
     Both do `rooms.find(...)` and then read `room.blocked` with no check. When a filter leaves the select empty, `room` is `undefined`, so you get a TypeError instead of an empty state.

  **Medium**

  5. **Room data is inside the UI file.** `src/main.js`, the `rooms` array
     Data, DOM code and the select-filling loop are all in one file. [...]
  [...]
  ## 2. Plan of small steps (smallest first)
  [...]
  4. **Add `checkRoom` (decision only).** In `booking.js`, add `checkRoom(rooms, roomId, { start, end, now })`. It finds the room and calls `canBook` with that room's `blocked` and `bookings`. [...]
  5. **Move the reason out of the UI.** `checkRoom` returns `{ available, reason }`, where `reason` is a code plus details (for example `AC2` with the minutes, or `AC4` with the overlapping booking). [...]
  6. **Stop changing data from the UI.** Make the blocked checkbox a read-only indicator (disabled), or replace it with the "Blocked" tag. [...]
  [...]
  8. **Add `filterRooms`, logic only.** [...] Recommendation: `filterRooms` does only F1/F2 and keeps blocked rooms in the list, marked as blocked. `checkRoom` then guarantees F3, which keeps each function's job simple.
  [...]
```

**Problems found:** Plan step 5 makes `checkRoom` return `{ available, reason }`, which breaks the fixed boolean signature (README section 7). It did not notice that the old suite already uses B1-B6 for other cases (my risk 5). It proposed keeping the blocked checkbox as a disabled control.
**Changes made:** Rejected the object return (3.3); added risk 5 myself; removed the checkbox instead of disabling it (3.3, commit `b61976c`). Risks 1-3 and 6 were kept after I found them on the lines given in 3.1.
**Verified by:** `grep -n` on the baseline `main.js` (lines 25, 40, 44, 51, 72, 74, quoted in 3.1); README section 7 for the signature; the old B3 title in `booking.test.js` at 245dd7e.

### 8.2 Exchange 2

**Tool and model:** Claude, Claude Opus 5.5 (claude-opus-5-5), the same chat as 8.1
**Date:** 2026-11-15
**Purpose:** the improvement plan, revised for the boolean `checkRoom`, the fixed test IDs and test-first

**Prompt:**

```text
Thanks. I checked your risks in the code. Before I commit a plan, three things you need to know:

1. checkRoom must return a plain boolean: checkRoom(rooms, roomId, { start, end, now }): boolean. That signature is fixed by my assignment, and my F3/F5 tests will assert toBe(true) / toBe(false) on it. So your step 5 ({ available, reason }) does not fit.
2. My assignment requires these test IDs as words in test titles: B1 = exactly 120 minutes -> true, B2 = 121 minutes -> false, B3 = touching a booking -> true, B4 = overlapping -> false, B5 = capacity equal to attendees -> included, B6 = capacity one below -> excluded, plus INT = filterRooms then checkRoom on what it returned. My old suite already uses B1-B6 for different cases (for example old B3 = a 1-minute overlap, rejected). No test.each, .skip or .only; one test per case; a fixed catalog inside the test file.
3. Tests come first: for each rule I write the failing test, then the code, then run the whole suite, then commit.

Please give me a revised numbered plan (8 steps or fewer, smallest safe step first) that respects these three points. Say where the Unavailable reason should live if checkRoom stays boolean. Still no code.
```

**Output used:** (indented by two spaces, as in 8.1)

```text
  ## Where the Unavailable reason goes

  `checkRoom` returns only `true`/`false`. Put the reason in **one separate pure function in `src/booking.js`**, next to `canBook`, for example `unavailableReason(rooms, roomId, { start, end, now })`.

  - It returns a reason code, or `null` when the room is available [...]
  - The UI always takes the decision from `checkRoom`. It calls the reason function only to pick the message text, and turns the code into the same Week 06 sentences.
  [...]
  ## Revised plan (8 steps)
  [...]
  1. **Free up the IDs B1-B6.** In `booking.test.js`, rename the titles of the old B1-B6 to unused IDs (for example E1-E6). Change titles only, not assertions. Run the suite: still 25 passing. [...]
  2. **Move the data out, no rule change.** Create `src/rooms.js` with the `Room` typedef and `ROOMS`: at least 4 fictional rooms with `capacity` and `equipment`. [...]
  3. **`checkRoom` returning a boolean.** Write these tests in `src/checkRoom.test.js` first: [...] All of these should fail because `checkRoom` doesn't exist yet. [...]
  4. **`filterRooms` together with INT.** [...]
  5. **Move the reason into `booking.js`.** Write one test per reason code first, with titles like R1-R5 so they don't collide with the B IDs. [...]
  6. **Thin the UI, part 1.** [...] The blocked checkbox becomes read-only (disabled, shows `room.blocked`), so it no longer changes data. [...]
  7. **Filters in the UI and the empty state (F1, F2, F4).** [...]
  8. **F5 refresh, AC6 polish, final check.** [...]
```

**Problems found:** The new names it suggested, E1-E6 for the old tests and R1-R5 for the reason tests, are check IDs of `tests/check_sis.py` (E1-E3 screenshots, R1-R3 runs), so the report would mix two meanings. It put the blocked checkbox back as a disabled control.
**Changes made:** W1-W6 for the old Week 07 boundary tests, M1-M7 for the reason tests; the checkbox removed. The rest of the order became my plan in 3.2, committed in `5a93626` before the first change to `app/src`.
**Verified by:** After the rename `npx vitest run` gave `Tests 25 passed (25)` (commit `3a4af6f`); `git log --oneline` shows the plan commit `5a93626` before `3a4af6f`; `python tests/check_sis.py` S6 PASS.

### 8.3 Exchange 3

**Tool and model:** Claude, Claude Opus 5.5 (claude-opus-5-5), a new fresh session
**Date:** 2026-11-15
**Purpose:** tests first for `checkRoom` and `filterRooms`, then the two functions (Task 2 and Task 4)

**Prompt:**

```text
Plain JavaScript (ES modules), Vitest 3. I need two small functions and their tests. Tests first, please; I will run them before adding the code.

Existing, must not change (src/booking.js):
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
Times are minutes after midnight (600 = 10:00). A Room is { id, name, capacity, equipment: string[], blocked, bookings: [{ start, end }] }.

To add:
- src/booking.js: checkRoom(rooms, roomId, { start, end, now }): boolean - finds the room by id and returns canBook with THAT room's blocked and bookings. Unknown id -> false. Must not change anything.
- src/filter.js: filterRooms(rooms, { attendees, equipment }): Room[] - F1 capacity >= attendees; F2 the room has ALL selected equipment items. Blocked rooms stay in the result (checkRoom handles them).

Rules the tests must prove (one test per case, the ID as a word in the title):
F1 capacity >= attendees, F2 ALL selected items (not any), F3 a blocked room is never available (checkRoom), F4 no room matches -> empty list, F5 same times, two rooms, different result because each uses its own bookings (checkRoom),
B1 exactly 120 minutes -> true, B2 121 minutes -> false, B3 touching an existing booking -> true, B4 overlapping -> false (B1-B4 through checkRoom),
B5 capacity equal to attendees -> included, B6 capacity one below -> excluded,
INT filterRooms, then checkRoom on a room it returned,
AC5 checkRoom leaves the catalog unchanged.
Constraints: import from 'vitest' and the real ./booking and ./filter, no mocks, no test.each / .skip / .only, a fixed catalog inside each test file (not the app's ROOMS). Expected values must follow from the rules above.

Give me src/checkRoom.test.js, src/filter.test.js, then checkRoom and filterRooms. Keep it short.
```

**Output used:**

```text
Here are the two test files first. Run them now and they should fail because `checkRoom` and `filterRooms` don't exist yet. [...]

**src/checkRoom.test.js**
const NOW = 480; // 08:00
const ROOMS = [
  { id: 'r1', name: 'Alpha', capacity: 4, equipment: ['projector'], blocked: false, bookings: [{ start: 600, end: 660 }] },
  { id: 'r2', name: 'Beta', capacity: 8, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [] },
  { id: 'r3', name: 'Gamma', capacity: 10, equipment: [], blocked: true, bookings: [] },
];
  it('F3 a blocked room is never available', () => { [...] });
  it('F5 same times, two rooms, different result (own bookings)', () => { [...] });
  it('B1 exactly 120 minutes -> true', () => { [...] });
  [... B2, B3, B4, AC5 ...]

**src/filter.test.js**
  it('F1 capacity >= attendees (blocked rooms stay)', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 5, equipment: [] }))).toEqual(['b', 'c']);
  });
  it('F2 room must have ALL selected items, not any', () => { [...] toEqual(['b']) });
  it('F4 no room matches -> empty list', () => { [...] attendees: 20 [...] });
  [... B5, B6, INT ...]

**src/booking.js** (add this below `canBook` and leave `canBook` as it is)
export function checkRoom(rooms, roomId, { start, end, now }) {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return false;
  return canBook({ start, end, now, blocked: room.blocked, bookings: room.bookings });
}

**src/filter.js**
export function filterRooms(rooms, { attendees, equipment = [] }) {
  return rooms.filter(
    (r) => r.capacity >= attendees && equipment.every((item) => r.equipment.includes(item))
  );
}
[...]
- **Unknown id:** none of your listed rules covers `checkRoom` with an unknown id returning `false`, so no test checks it on its own. [...]
```

**Problems found:** No test for an unknown room id (it said so itself). `filterRooms` with an empty attendees field gets `undefined`, and `capacity >= undefined` is false, so every room would be filtered out and the page would show the F4 empty state wrongly. F4 was tested only with capacity, not with equipment. Nothing tested that `filterRooms` leaves the catalog alone.
**Changes made:** Added `checkRoom: an unknown room id is never available`, `F4 F2: equipment that no room has (computers) gives an empty list` and `filterRooms: returns a new list and leaves the catalog unchanged`; made the titles say the numbers and the rule (e.g. `B6 F1: capacity 6 with 7 attendees ...`); the page counts an empty attendees field as 1 (`criteria()` in `main.js`). The two functions were taken as given; `checkRoom` later got the shared `findRoom()`.
**Verified by:** Red first: with only `checkRoom.test.js` added, `npx vitest run` gave `Tests 8 failed | 25 passed (33)`; with `filter.test.js` added and no `filter.js`, `Cannot find module './filter.js'`. Green after each: 33/33 (commit `bdfa125`), 41/41 (commit `7b08da4`). On the page (Playwright): attendees empty → "5 of 5 rooms match", 80 → 1 room (A101), 81 → 0 rooms.

## 9. Checker results and known fails

| Check | Why it still fails |
| --- | --- |
| none | (filled in after the final run) |

## 10. AI reflection (Task 6)

<!-- 200–300 words, your own words, no assistant. Answer all five:
     What context did you provide the AI assistant? Which generated suggestions were useful or
     incorrect? What did you personally verify? How did tests influence your engineering
     decisions? What would you improve next? -->

(write here)
