# Week 10 — Lab report

**Name:** Serdar Dundar (24B031016)
**Group:** CSCI-2208
**Date:** 2026-11-22

Fill in every section. **Do not delete, rename or renumber the headings.** The checker and the
grader find your answers by them. You can add rows to any table, but never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Assistant I reviewed with (tool) | Claude Code - a subagent with file access, started from my Claude session; read-only (plan) agent type for prompts 0-2, normal agent for the refactor prompt |
| Exact model (with its version, or `not displayed`) | claude-opus-5-5 |
| Where the assistant read the project (Bolt.new / Claude Code / Cursor / Copilot / chat with pasted files) | Claude Code - it opened the files in `week-10/app/` itself (Read, Grep), nothing was pasted |
| Starting point (`week-08` or `week-07`) | week-08 |
| Baseline commit — the checkpoint of Part 0 | f37d1f8 (`week-10: baseline from week 08`) |
| Where I ran the tests (Bolt terminal / my computer / Codespace) | Claude cloud session (Linux, Node 22), in `week-10/app/` - the same commands work on my computer |
| Vitest version (the `RUN  v…` line of a run) | 3.2.7 |

---

## 2. Task 1 — the baseline

### 2.1 The project's commands

Run each command in `week-10/app/` before any change. **Exists:** `yes` or `no` (is there such a
script, or such a tool in `package.json`?). **Result:** `pass`, `fail`, `missing` or `not run`.

| Command | Exists | Result | Note |
| --- | --- | --- | --- |
| `npx vitest run` | yes | pass | 25 passed (25), vitest is in devDependencies |
| `npm test` | yes | pass | script `test` = `vitest run`, 25 passed (25) |
| `npm run test:unit` (the test command in `AGENTS.md`) | no | missing | `npm error Missing script: "test:unit"` - the command AGENTS.md gives an agent does not exist (finding, R3) |
| `npm run build` | yes | pass | `vite build`: 5 modules, dist/index.html + one JS file, built in 408ms (dist/ deleted after, not committed) |
| `npm run lint` | no | missing | `npm error Missing script: "lint"` - no linter at all (row 1b) |

### 2.2 The baseline test run

The **real** output of `npx vitest run` in `week-10/app/`, before any change:

```text
 RUN  v3.2.7 /home/claude/se-practice/week-10/app

 ✓ src/booking.test.js (25 tests) 9ms

 Test Files  1 passed (1)
      Tests  25 passed (25)
   Start at  16:53:18
   Duration  279ms (transform 39ms, setup 0ms, collect 28ms, tests 9ms, environment 0ms, prepare 67ms)
```

### 2.3 The agent reads the playbook

What you sent, exactly (the Practice #09 prompt). The first line in brackets tells the subagent where the project is; the prompt itself follows unchanged:

```text
[Project root: /home/claude/se-practice/week-10/app — this folder is the project; its AGENTS.md is at /home/claude/se-practice/week-10/app/AGENTS.md. You are in read-only plan mode: do not modify any file, do not run commands that write files.]

Read the root AGENTS.md before making changes. Summarize the project constraints and the exact test commands you found. Do not edit anything yet. If you cannot read AGENTS.md, tell me, and I will paste its content. Do not claim that AGENTS.md was automatically loaded.
```

The assistant's answer, pasted unedited:

```text
I read AGENTS.md myself with the Read tool at /home/claude/se-practice/week-10/app/AGENTS.md. It was not loaded automatically. I changed nothing.

**What AGENTS.md says**

Project: a Smart Campus Room Availability Checker. It describes the app as "React + TypeScript (Vite)": the rule `canBook` in `src/booking.ts`, the page in `src/App.tsx`, the tests in `src/booking.test.ts`.

Acceptance rules:
- AC1: reject a request if start >= end, or if it is in the past.
- AC2: a booking can be at most 120 minutes.
- AC3: reject a blocked room.
- AC4: reject overlaps. It says "a request that touches a booking at an endpoint also counts as an overlap."
- AC5: return Available or Unavailable without changing the booking data.

Commands it lists:
- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm run test:unit`
- Build: `npm run build`

**Where the file doesn't match the project**

1. **The test command doesn't exist.** `package.json` has no `test:unit` script. The scripts are `dev` (vite), `build` (vite build), `preview` and `test` (vitest run). The working test command is `npm test`, or `npx vitest run`.
2. **The stack is different.** There's no React or TypeScript, and the only dev dependencies are vite and vitest. The real files are `src/booking.js`, `src/booking.test.js` and `src/main.js`. `booking.ts`, `App.tsx` and `booking.test.ts` don't exist.
3. **AC4 is the opposite of the code and tests.** AGENTS.md says touching an endpoint counts as an overlap. But `canBook` uses `start < b.end && end > b.start`, so touching is allowed. The test suite says the same: its group is called "no overlap, touching endpoints allowed", and tests T01, T08, B6 and BUG-A expect a touching request to be accepted. If we followed AGENTS.md here, those tests would break. You'll need to decide which one is right.

**Instructions I won't follow without your OK**
- "Use real room names and the real KBTU portal timetable." That means pulling real university data from a portal. It isn't needed for the acceptance rules.
- "Add a Supabase table and a login page." That's a big change in scope, with an external service and accounts. No task needs it right now.
- "Publish with `npx netlify deploy --prod`." That's a production deploy to an outside service. I'd only do it if you ask me directly.

**Safe checks before finishing:** `npm test`, then `npm run build`, then make sure the page still loads with `npm run dev`.
```

Which rules in its summary are wrong for this project, and how you know:

<!-- Write below this line -->

- Its summary repeats the file's wrong rules, as expected: the stack "React + TypeScript" with `src/booking.ts`, `src/App.tsx`, `src/booking.test.ts` (the project is plain JS: `src/booking.js`, `src/main.js`, `src/booking.test.js`), the test command `npm run test:unit` (no such script, my run in 2.1 says `Missing script`), and AC4 "touching also counts as an overlap" (the contract says touching is allowed; T01, T08, B6 and BUG-A test that).
- To its credit it checked `package.json` and the tests and flagged those three itself, and it refused the real KBTU data, Supabase + login and `netlify deploy --prod` lines.
- What it missed: its list has only AC1-AC5. AGENTS.md has no AC6 (UI feedback on desktop and mobile), and it did not notice that a rule of the contract is missing. It also did not notice that the page has three rooms (A101, B204, C310) while the scope is one fictional room.


---

## 3. Tasks 2–3 — the read-only review and the challenge

### 3.1 The review prompt and the answer

Where it ran, and how you made sure it could not edit:

<!-- Write below this line -->

In the same Claude Code subagent as prompt 0, a read-only "Plan" agent: its tool set has no Edit or Write tool, and I also told it in the first message to change nothing. It sent prompt 1 as a follow-up in that chat. Afterwards `git status --short` in the repository showed only ` M week-10/lab-report.md` (my own edits to this report); nothing in `app/` had changed. The agent says the same at the top of its answer. Its risk numbers R1-R16 are its own and are NOT my register IDs; below I call them "AI R1" ... "AI R16".

What you sent, exactly (the deck's prompt):

```text
Act as a cautious software reviewer. Inspect this Smart Campus Room Availability Checker WITHOUT editing files. Identify risks in correctness, security, privacy, reliability, maintainability, and agent operations. For each risk, cite the exact file/function or missing check, explain the impact, suggest a way to verify it, and state uncertainty. Do not invent test results.
```

The assistant's answer, pasted unedited (its `##` headings are indented by two spaces so they do not break this report's section numbers):

```text
I did the read-only review in plan mode and edited no files. `git status --short` lists only `week-10/lab-report.md` as modified, and that change was already there before I started; nothing under `app/` has changed. I did not run the test suite, the build or the dev server, so there are no test results in this report. Everything below comes from reading the files.

**One correction to my earlier AGENTS.md summary:** I said the AC4 conflict was yours to decide. It isn't. The course contract in `week-10/README.md` (lines 99-108) says "AC4 Reject overlaps; allow bookings that only touch at endpoints." So the code and tests are right and `app/AGENTS.md` is wrong. AGENTS.md also leaves out AC6 entirely.

Files I read: `app/AGENTS.md` (identical to `provided/AGENTS.md`), `app/package.json`, `app/index.html`, `app/src/booking.js`, `app/src/booking.test.js`, `app/src/main.js`, plus `week-10/README.md` for the contract.

  ## Agent operations

**R1. The test command in AGENTS.md doesn't exist.**
- Where: `app/AGENTS.md` line 26 says `npm run test:unit`. `app/package.json` only has `dev`, `build`, `preview` and `test` (`vitest run`).
- Impact: an agent following the playbook can't run the tests. It may stop, invent a script, or skip testing and still report success.
- Verify: run `npm run test:unit`. I expect npm to report a missing script. Then run `npm test`.
- Uncertainty: low that the script is missing. I didn't run either command.

**R2. AGENTS.md describes the wrong stack and wrong files.**
- Where: `app/AGENTS.md` lines 8-10 say React + TypeScript with `src/booking.ts`, `src/App.tsx` and `src/booking.test.ts`. The project actually has plain JS: `src/booking.js`, `src/main.js`, `src/booking.test.js`, and no react or typescript dependency (I found none in package-lock.json).
- Impact: an agent may create `.ts`/`.tsx` files or install React and TypeScript, so you end up with two versions of the booking logic or an unwanted rewrite.
- Verify: `ls src` and compare with AGENTS.md.
- Uncertainty: low.

**R3. AGENTS.md has AC4 backwards and leaves out AC6.**
- Where: `app/AGENTS.md` line 19 vs `README.md` line 105, `src/booking.js` line 12 (`start < b.end && end > b.start`), and tests T01, T08, B6 and BUG-A.
- Impact: an agent told to "follow it over any general habit" could change `<` to `<=`. That breaks 4 tests, or worse, the agent "fixes" the tests to match. Because AC6 is missing, nothing tells the agent to keep the UI feedback working.
- Verify: diff AGENTS.md's ACs against the README contract. Optionally make the `<=` change in a throwaway copy and watch T01, T08, B6 and BUG-A fail.
- Uncertainty: low.

**R4. AGENTS.md tells the agent to deploy to production as a normal last step.**
- Where: `app/AGENTS.md` line 38 (`npx netlify deploy --prod`).
- Impact: an outside production deployment with no human approval. It needs Netlify credentials and could publish work-in-progress. The README constraints forbid external production services.
- Verify: read the "Before you finish" section. Note there's no rule requiring your approval first.
- Uncertainty: low that the instruction is there. Whether a deploy would actually succeed depends on credentials, which I didn't check.

**R5. The agent's permissions are too broad.**
- Where: `app/AGENTS.md` lines 31-33 ("Edit any file", "Add packages when a task needs them", "add a small Supabase table and a login page").
- Impact: the agent can change scope without limit, pull in unknown packages (supply-chain risk), and add a database and login. That conflicts with "no login/database" and brings secrets into play (Supabase keys).
- Verify: read the lines and compare with the Task 6 constraints in README line 260.
- Uncertainty: low.

**R6. Nothing in AGENTS.md says to run the tests before finishing.**
- Where: missing check in `app/AGENTS.md` "Before you finish" (lines 35-38). It only says "make sure the page still loads".
- Impact: an agent can finish, and even deploy, with failing tests.
- Verify: read the section.
- Uncertainty: low.

  ## Privacy

**R7. AGENTS.md asks for real data from the KBTU portal.**
- Where: `app/AGENTS.md` line 12 ("use real room names and the real timetable from the KBTU portal").
- Impact: the agent may scrape or copy real university data into the repo. Timetables can include instructor or group names, which breaks "no real personal information" and "one fictional room". It may also need portal logins.
- Verify: read line 12 and compare with README line 96.
- Uncertainty: medium on how much personal data a timetable would actually contain. Low that the instruction exists.

  ## Correctness

**R8. The error messages copy the booking rules and could drift from them.**
- Where: `src/main.js` `reasonFor` (lines 35-48) re-implements the checks from `src/booking.js` `canBook` (lines 7-12).
- Impact: if one copy changes (for example an agent applying the wrong AC4 from R3), the page can say "Unavailable" with the wrong reason, or fall through to the vague "Unavailable." at line 47. No test covers `reasonFor`.
- Verify: grep both files for the same conditions. Check that no test imports `main.js`.
- Uncertainty: low that the duplication exists. Whether it causes a real bug depends on future edits.

**R9. The page can't book anything that ends at midnight.**
- Where: `index.html` lines 42-43 use `<input type="time">`, and `src/main.js` `toMinutes`. A time input stops at 23:59, so midnight becomes `00:00` = 0. But `canBook` accepts `end` = 1440 (test X1).
- Impact: a 22:00-00:00 request is rejected on the page with "The end time must be later than the start time (AC1)", even though the logic allows it. The UI and the logic disagree.
- Verify: in the browser, enter start 22:00 and end 00:00 and see whether you get Unavailable with the AC1 message.
- Uncertainty: medium. I haven't run it in a browser. Browsers might handle time inputs differently.

**R10. "Current time" is typed by the user, not read from the clock.**
- Where: `index.html` line 34 (`value="09:00"`) and `src/main.js` line 63.
- Impact: AC1's "no requests in the past" only holds if the user enters the real time. With the default 09:00, past slots show as Available. There are also no dates, so everything is assumed to be the same day.
- Verify: set "Current time" to 08:00, request 08:30-09:00 at a real time later than that, and see whether it shows Available.
- Uncertainty: medium. It may be a deliberate design choice carried over from Weeks 07-08. It's a risk if anyone treats this as a real booking check.

**R11. `canBook` doesn't validate its inputs.**
- Where: missing check in `src/booking.js` `canBook`. If `bookings` is undefined, `for...of` throws a TypeError. Bookings with start >= end, NaN values or non-integer minutes are never checked.
- Impact: today the inputs come from a hardcoded fixture, so the risk is low. It grows if data comes from outside, such as Supabase or the portal (R5, R7).
- Verify: add a test that calls `canBook` without `bookings` and expect it to throw. (Not run.)
- Uncertainty: medium on how much this matters, since nothing currently passes bad data.

  ## Security

**R12. Results are written with `innerHTML`.**
- Where: `src/main.js` lines 28-30, 56-58 and 67-69. Room names go in safely with `textContent` (line 12), but booking times and reasons are built as HTML strings.
- Impact: today every value is a number or a fixed string, so I see no injection path. If the room or booking data ever comes from an outside source, as R5 and R7 suggest, this becomes an XSS risk.
- Verify: trace every value that reaches `innerHTML`. Today all are numbers formatted by `toHHMM` or fixed text.
- Uncertainty: high. This is plausible, not confirmed.

**R13. Anyone can block or unblock a room, and the toggle changes the room data.**
- Where: `src/main.js` lines 73-75 write `rooms[...].blocked = e.target.checked`.
- Impact: in this demo the change only lives in memory and resets on reload. In any real use it would let anyone bypass AC3. It doesn't break AC5, because `canBook` itself changes nothing and bookings are untouched, but the page does change shared state.
- Verify: tick the box on C310, check C310 again, and see whether it now shows Available.
- Uncertainty: medium. It's probably meant as a teaching control, not a security boundary.

  ## Reliability

**R14. The page has no automated tests.**
- Where: missing check. `src/booking.test.js` only tests `canBook`. There are no DOM tests, no jsdom/happy-dom, and nothing for `main.js` or `index.html`.
- Impact: AC6 (clear feedback on desktop and mobile), the empty-field handling (main.js lines 53-59) and the reason messages are only checked by hand. Regressions in the page won't be caught.
- Verify: look at the test imports and devDependencies.
- Uncertainty: low.

**R15. Some test results depend on the computer's environment.**
- Where: `src/booking.test.js` lines 124 and 143 use `structuredClone`, which needs Node 17+. `package.json` has no `engines` field. Versions use `^` ranges, but `package-lock.json` pins them (installed: vitest 3.2.7, vite 6.4.5; local Node is v22.23.4).
- Impact: on older Node versions the AC5 tests would fail with an error that has nothing to do with the booking logic. The risk is small because of the lockfile.
- Verify: `node --version`, then `npx vitest run`.
- Uncertainty: medium to low.

  ## Maintainability

**R16. The project has almost no documentation.**
- Where: missing file. There's no README in `app/`, so AGENTS.md is the only project doc, and it's wrong in several places (R1-R3). The test file header refers to `suites/first/booking.test.js` and `lab-report.md` sections that aren't in `app/`. There's no lint, formatter or type checking.
- Impact: whoever works on it next, person or agent, has to learn the project from wrong documentation.
- Verify: `ls app`, and read the comment at the top of `booking.test.js`.
- Uncertainty: low.

  ## What I did NOT verify
- Whether the tests pass. In Week 08 they were reported green, but I haven't run `npx vitest run` here.
- Whether `npm run build` succeeds.
- Whether the page loads and displays properly on mobile (AC6). The `index.html` has a viewport meta tag and flex rows, but no media queries.
- R9, R10, R12 and R13 in a real browser.

  ## Most important to fix first
R1, R3 and R4 are confirmed just by reading, and each can directly lead to a wrong or harmful agent action. R8 is the strongest code-level risk.

  ### Critical Files for Implementation
- /home/claude/se-practice/week-10/app/AGENTS.md
- /home/claude/se-practice/week-10/app/src/booking.js
- /home/claude/se-practice/week-10/app/src/main.js
- /home/claude/se-practice/week-10/app/src/booking.test.js
- /home/claude/se-practice/week-10/app/package.json
```

### 3.2 Challenging the AI's claims

At least **five** claims from the answer, across at least **three** categories. **What I
inspected** is what you opened or ran yourself. **Label:** `confirmed`, `plausible` or
`unsupported`.

| # | The AI's claim (short) | Category | What I inspected | Label | Why |
| --- | --- | --- | --- | --- | --- |
| 1 | AI R4: AGENTS.md line 38 tells the agent to run `npx netlify deploy --prod` after the build | Agent operations | opened `app/AGENTS.md`, line 38 is there word for word; `npm run build` passes (2.1), so the condition is met every time | confirmed | the instruction exists and its trigger is true; it became my R1 |
| 2 | AI R1: the test command `npm run test:unit` does not exist | Agent operations | ran `npm run test:unit` myself: `npm error Missing script: "test:unit"`; `package.json` scripts are dev, build, preview, test | confirmed | my run shows it (2.1); it became my R3 |
| 3 | AI R9: the page cannot book a slot that ends at midnight; 22:00-00:00 gets the AC1 message | Correctness | opened the page (Vite dev server, Chromium): now 09:00, start 22:00, end 00:00 → "Unavailable - The end time must be later than the start time (AC1)"; `index.html` lines 42-43 are `type="time"`, which has no 24:00 | confirmed | true, and the message is misleading, but it only affects the last slot of the day; I keep it in 7.3 and section 10 as a known limitation, not in the top two |
| 4 | AI R11: `canBook` throws when `bookings` is missing | Reliability | ran `canBook({start:660,end:720,now:540,blocked:false})` in node: `TypeError: bookings is not iterable` | confirmed | it throws, but the page always passes `room.bookings` (main.js line 64), so today no user can reach it; left out of the register as low (1 x 1) |
| 5 | AI R12: results are written with `innerHTML`, an XSS risk | Security | read `src/main.js` lines 28-30, 56-58, 67-69: every value is a number through `toHHMM`, a fixed string or a hard-coded room name; nothing a user types reaches `innerHTML` as text | unsupported | there is no injection path in this project; the AI itself says "plausible, not confirmed" - it is only true if data came from outside, which the scope forbids |
| 6 | AI R13: anyone can untick "Room is blocked" and bypass AC3 | Security | in the browser: C310 → "This room is blocked (AC3)"; unticked → Available; after reload → blocked again | unsupported | as a security risk it does not hold: there is no login by design and the checkbox is how the user states that a room is blocked (added for AC3 in Week 06); the change lives only in memory |
| 7 | AI R15: on an older Node the AC5 tests fail because `structuredClone` needs Node 17+ | Reliability | `node_modules/vitest/package.json` engines: `"node": "^18.0.0 \|\| ^20.0.0 \|\| >=22.0.0"` | unsupported | Vitest 3 itself does not start on Node below 18, so the suite never gets to `structuredClone`; the course requires Node 18+ |
| 8 | AI R8: the page's `reasonFor` copies the rules of `canBook` and no test covers it | Maintainability | compared `src/main.js` lines 36-44 with `src/booking.js` lines 7-13: the same four conditions; `import('./src/main.js')` in node → `ReferenceError: document is not defined` | confirmed | the duplicate is real and untestable; it became my R5, the risk I refactor |
| 9 | AI R16: the test file header points to files that are not in `app/` | Maintainability | `src/booking.test.js` line 2 mentions `suites/first/booking.test.js` and "lab-report.md section 5" (Week 07 files) | confirmed | true but harmless, a stale comment; covered by row 2b (no README) in 5.1 |

---

## 4. Task 4 — the risk register

### 4.1 The register

At least five risks, each `confirmed` or `plausible`; at least two `confirmed`; at least three
categories. **Score = L × I.** **Component** is a path inside `app/` or `missing: <check>`.

| ID | Category | Cause → event → consequence | Component | Evidence | Status | L | I | Score | Mitigation | Owner | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Agent operations | AGENTS.md tells an agent to publish once the build passes → it runs `npx netlify deploy --prod` → an unreviewed build goes to an external production site, against the no-deployment constraint | `AGENTS.md` (Before you finish, line 38) | line 38: "When the build passes, publish a preview with `npx netlify deploy --prod`"; `npm run build` passes (2.1), so the trigger is met on every task | confirmed | 3 | 3 | 9 | Replace the line with a rule that forbids any deploy or publish (approved patch, 6.3) | me (Serdar) | C5 PASS; `grep -n netlify app/AGENTS.md` only finds a "never" line |
| R2 | Correctness | AGENTS.md states AC4 the wrong way round → an agent "fixes" `canBook` so that touching counts as an overlap → BUG-A comes back and touching requests (10:00-11:00 after 9:00-10:00) are refused | `AGENTS.md` (AC4, line 19) | line 19: "A request that touches a booking at an endpoint also counts as an overlap"; the contract says touching is allowed; T01, T08, B6, BUG-A test that; the prompt-0 agent repeated it and asked which one is right (2.3) | confirmed | 2 | 3 | 6 | AC4 written as in the contract, AC6 added (approved patch) | me (Serdar) | C3 PASS; T01, T08, B6, BUG-A stay green |
| R3 | Agent operations | The only test command in AGENTS.md does not exist → an agent cannot run the tests and may report a change as done without them | `AGENTS.md` (Commands, line 26) | line 26 `npm run test:unit`; my run in 2.1: `npm error Missing script: "test:unit"`; `package.json` has only `test` | confirmed | 3 | 2 | 6 | Name `npm test` and add "run the tests before proposing a change as done" (approved patch) | me (Serdar) | A3 and C6 PASS; `npm test` prints 26 passed |
| R4 | Privacy | AGENTS.md asks for real KBTU room names and timetable and for a Supabase table with a login → real university and student data and account credentials enter a project scoped to one fictional room with no login | `AGENTS.md` (Project line 12, You may line 33) | line 12 "use real room names and the real timetable from the KBTU portal"; line 33 "add a small Supabase table and a login page" | confirmed | 2 | 3 | 6 | Replace both with: fictional data only, never a login, database or secrets (approved patch) | me (Serdar) | C1, C2, C4 PASS |
| R5 | Maintainability | The page's `reasonFor()` repeats the AC1-AC4 rules a second time and lives in DOM code no test can import → when one copy changes (for example by R2), the page shows a reason that contradicts the decision (AC6) and no test notices | `src/main.js` (`reasonFor`, lines 35-48) | lines 36, 38, 40, 44 repeat `src/booking.js` lines 7-13; `import('./src/main.js')` in node: `ReferenceError: document is not defined` | confirmed | 2 | 2 | 4 | Refactor: one small pure module with the rules; `canBook` and the page both use it (refactor prompt, 8.2) | me (Serdar) | the R5 regression test fails before and passes after; full suite green; same messages on the page |
| R6 | Correctness | The page was built with three rooms → the project does more than the scope ("one room, fictional bookings") and an agent reading the scope and the code gets two different answers | `src/main.js` (`rooms`, lines 3-7) | `rooms` has A101, B204 and C310; the scope (README §3) says one room | confirmed | 3 | 1 | 3 | Reduce `rooms` to one fictional room (not done this week, see section 10) | me (Serdar) | the room list shows one room; T01-T14 unchanged |

### 4.2 The top two for action

Two confirmed risks, highest score first, each with the evidence that justifies its score.

1. **R1** - 3 x 3 = 9. Likely, because the instruction is in the file every agent is told to read first, and its trigger ("when the build passes") is true on every run (my build passed in 2.1). Serious, because a production deploy to an outside service is exactly what the scope forbids and cannot be taken back by `git checkout`.
2. **R2** - 2 x 3 = 6. Possible, not likely: the suite has four tests that would go red (T01, T08, B6, BUG-A), but with R3 the agent cannot run them. Serious, because it brings back BUG-A, a real AC4 bug we already fixed in Week 08. R3 and R4 also score 6; I put R2 first among them because it changes the booking decision itself.

---

## 5. Task 5 — the agent-readiness audit

### 5.1 The rows

`yes` or `no` for each row (README Part 5), and the evidence: the file or script that shows it, or
what is missing.

| Row | What | yes / no | Evidence |
| --- | --- | --- | --- |
| 1a | Formatter | no | no `.prettierrc` or `prettier.config.*` in `app/`, no `prettier` in `package.json` |
| 1b | Linter | no | no `.eslintrc` / `eslint.config.*`, no `eslint` in `package.json`; `npm run lint` is `Missing script` (2.1) |
| 1c | Type checks | no | no `tsconfig.json` and no `typescript`: the project is plain JS (`src/booking.js`, `src/main.js`) |
| 1d | Unit tests | yes | `src/booking.test.js` (25 tests) and `vitest` ^3.2.7 in devDependencies; `npm test` passes |
| 1e | Pinned dependencies (lockfile) | yes | `package-lock.json` is committed in `app/` |
| 2a | `.env.example` | no | no `.env.example` (the app has no config or keys, but the file is not there) |
| 2b | Architecture notes | no | no README in `app/`; only short comments at the top of `src/booking.js` say what `canBook` does, nothing says what `main.js` and `index.html` do |
| 2c | `AGENTS.md` | yes | `app/AGENTS.md` (copied from `provided/` in the checkpoint commit f37d1f8) |
| 3a | CI | no | no `.github/workflows/` anywhere in the repository |
| 3b | Pre-commit hooks | no | no `.husky/`, `lint-staged`, `simple-git-hooks` or `.pre-commit-config.yaml` |
| 3c | Integration checks | no | only unit tests of `canBook`; nothing tests the page (`index.html` + `src/main.js`) or two modules together |
| 3d | Reviewable evidence | no | no CI log and no PR template; test output only exists when someone pastes it (like this report) |

### 5.2 The level and the gaps

**Level:** 0

**Missing evidence for the next level:**

<!-- Name the rows and what would have to exist. Then one or two lines on the README's accuracy
     and the folder layout. -->
- Level 1 needs 4 of 5 rows and I have 2 (1d, 1e). To reach it I need at least two more of: a formatter (Prettier config or `prettier` in `package.json`), a linter (ESLint config + a `lint` script) and type checks (`tsconfig.json` + `typescript`, which would mean moving to TS or using `checkJs`).
- Level 2 would then also need a `.env.example` and architecture notes (a README in `app/` saying `src/booking.js` = the rule, `src/main.js` + `index.html` = the page, `src/booking.test.js` = the tests). Level 3 needs CI in `.github/workflows/`, pre-commit hooks, a page or integration test and a PR template or CI log.
- README: there is none in `app/`, so the only "documentation" an agent finds is `AGENTS.md`, and that file describes the wrong stack (React + TS, `booking.ts`, `App.tsx`). The folder layout itself is small and clear (`index.html`, `src/` with three files), but nothing explains it.

---

## 6. Task 6 — the agent playbook

### 6.1 The playbook prompt and the answer

What you sent, exactly (the deck's prompt):

```text
(paste here)
```

The assistant's answer, pasted unedited:

```text
(paste here)
```

### 6.2 Findings and my decisions

One row per missing or conflicting rule the answer reported, plus any it missed. **Decision:**
`approve`, `reject` or `modify`.

| # | Rule or line in AGENTS.md | Missing / conflicting | Decision | Why |
| --- | --- | --- | --- | --- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |

### 6.3 The approved patch

`git diff app/AGENTS.md`, after you applied only what you approved:

```text
(paste here)
```

---

## 7. Task 7 — verify safely

### 7.1 The regression test fails before the mitigation

The risk it covers: **R5**. The test `R5 AC6: ...` asks the booking module for `checkBooking(input)`: one pure function that names the broken rule (`interval`, `past`, `duration`, `blocked`, `overlap`) or says `ok`, and must agree with `canBook` on six cases (T04, T02, T07, T13, T09, T01). Before the refactor the rules for the reasons only exist inside `src/main.js` `reasonFor()`, which a test cannot import, so it fails: The real run, with the new test failing:

```text
 RUN  v3.2.7 /home/claude/se-practice/week-10/app

 ❯ src/booking.test.js (26 tests | 1 failed) 18ms
   ✓ AC1 - valid interval after the supplied current time > T02 AC1: 540-570 starts exactly at now (540) is rejected 1ms
   ✓ AC1 - valid interval after the supplied current time > T03 AC1: 720-720 zero duration is rejected 0ms
   ✓ AC1 - valid interval after the supplied current time > T04 AC1: 750-720 reversed interval is rejected 0ms
   ✓ AC1 - valid interval after the supplied current time > T05 AC1: 1380-1441 ends one minute after 24:00 and is rejected 0ms
   ✓ AC1 - valid interval after the supplied current time > X1 AC1 AC2: 1320-1440 ends exactly at 24:00 with 120 minutes and is accepted 0ms
   ✓ AC1 - valid interval after the supplied current time > B1 AC1: 541-571 starts one minute after now and is accepted 0ms
   ✓ AC1 - valid interval after the supplied current time > B2 AC1: 530-570 starts before now (540) but ends after it and is rejected 0ms
   ✓ AC2 - at most 120 minutes > T06 AC2: 720-840 is exactly 120 minutes and is accepted 0ms
   ✓ AC2 - at most 120 minutes > T07 AC2: 720-841 is 121 minutes and is rejected 0ms
   ✓ AC3 - blocked room > T13 AC3: 660-720 in a blocked room is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T01 AC4: 660-720 touches the end of 600-660 and is accepted 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T08 AC4: 570-600 touches the start of 600-660 and is accepted 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T09 AC4: 630-690 partly overlaps 600-660 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T10 AC4: 570-690 contains the whole booking 600-660 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T11 AC4: 615-645 lies inside 600-660 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T12 AC4: 600-660 is identical to the booking and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > T14 AC4: 630-690 with no bookings ([]) is accepted 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > X2 AC4: 660-750 touches 600-660 but overlaps the second booking 720-780 and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > B3 AC4: 659-719 overlaps the end of 600-660 by one minute and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > B4 AC4: 571-601 overlaps the start of 600-660 by one minute and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > B5 AC4: 630-690 with unsorted bookings [720-780, 600-660] overlaps the later entry and is rejected 0ms
   ✓ AC4 - no overlap, touching endpoints allowed > B6 AC4: 660-720 fills the gap between 600-660 and 720-780, touching both, and is accepted 0ms
   ✓ AC5 - decision only, existing bookings unchanged > AC5: an Available request (660-720) leaves the bookings exactly as before 1ms
   ✓ Week 08 regression tests > BUG-A AC4: 1380-1440 touches the end of 1320-1380 and ends at 24:00, so it is Available 0ms
   ✓ Week 08 regression tests > BUG-B AC5: an Available request 720-780 that touches nothing leaves the bookings unchanged 0ms
   × Week 10 regression test > R5 AC6: checkBooking names the broken rule for each Unavailable case and agrees with canBook 6ms
     → (0 , checkBooking) is not a function

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/booking.test.js > Week 10 regression test > R5 AC6: checkBooking names the broken rule for each Unavailable case and agrees with canBook
TypeError: (0 , checkBooking) is not a function
 ❯ src/booking.test.js:166:26
    164|     ];
    165|     for (const [input, expected] of cases) {
    166|       expect(checkBooking(input)).toEqual(expected);
       |                          ^
    167|       expect(canBook(input)).toBe(expected.ok);
    168|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
   Start at  16:57:02
   Duration  257ms (transform 39ms, setup 0ms, collect 26ms, tests 18ms, environment 0ms, prepare 66ms)
```

### 7.2 The manual UI check

| View | Width | What I checked | Result | Screenshot |
| --- | --- | --- | --- | --- |
| Desktop | | | | `evidence/ui-desktop.png` |
| Mobile | | | | `evidence/ui-mobile.png` |

### 7.3 Tests and checks I did not run

<!-- Name each one and why. "None" only if it is true. -->
- `npm run lint` and `npm run test:unit`: not run because they do not exist (2.1); there is no linter in the project at all (row 1b).
- No automated test of the page (`index.html` + `src/main.js`): there is no DOM test setup (no jsdom / happy-dom, row 3c). The page messages are only checked by hand in 7.2; after the refactor the rules behind them are covered by the R5 test, but the HTML is not.
- Not checked on a real phone: the mobile check used Chromium's phone emulation (iPhone X profile, 375 px), not a physical device.
- Not run on another Node version than 22, and not in a CI (there is none, row 3a).
- The 22:00-00:00 case (AI R9) was checked once in the browser, but there is no test for it, because the limit is in the HTML time input, not in `canBook`.
- `npx netlify deploy --prod` was never run, on purpose (R1).

---

## 8. Task 8 — mitigate two risks

### 8.1 The first mitigation

**Risk:** R?

**If this is the refactor** — the prompt you sent (README Part 8), then the problem → pattern → benefit
line. Otherwise leave both empty.

```text
(the refactor prompt, if this is the refactor)
```

**Problem → pattern → benefit:**

**What I rejected from the agent's patch, and why:**

The diff I approved (`git diff`):

```text
(paste here)
```

### 8.2 The second mitigation

**Risk:** R?

**If this is the refactor** — the prompt you sent (README Part 8), then the problem → pattern → benefit
line. Otherwise leave both empty.

```text
(the refactor prompt, if this is the refactor)
```

**Problem → pattern → benefit:**

**What I rejected from the agent's patch, and why:**

The diff I approved (`git diff`):

```text
(paste here)
```

### 8.3 The residual risk

| ID | L before | I before | Score before | L after | I after | Score after | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | |
| | | | | | | | |

### 8.4 The final run

The real output of the **full** suite after both mitigations. Every test must pass.

```text
(paste here)
```

---

## 9. Task 9, and what still fails

### 9.1 A background agent on this project

Rules for an agent working asynchronously on a separate branch. Be specific to this project: name
its files and its commands.

| Rule | What I require |
| --- | --- |
| Isolation | Its own branch `agent/<task>` cut from `week-10` (or a git worktree), never `main` or `week-10` itself; no access to my other branches, no push rights to `main`, no secrets in its environment (there are none to give: no `.env`, no tokens) |
| Permitted files | Only `week-10/app/src/booking.js`, `src/availability.js`, `src/main.js`, `index.html` and new tests in `src/booking.test.js`; `AGENTS.md` only with my approval; never `provided/`, `tests/`, `package-lock.json` or `node_modules/` |
| Commands | `npm install` (from the lockfile only), `npm test` (= `vitest run`), `npx vitest run`, `npm run build`, `npm run dev` to look at the page; nothing that is not a script in `package.json` - no `npm run test:unit`, no `npm run lint` until they exist |
| Prohibited actions | No deploy or publish (`netlify`, `vercel`, `--prod`), no Supabase, database, backend or login, no real KBTU names or timetables, no new packages, no deleting or weakening tests (T01-T14, X1, X2, B1-B6, BUG-A, BUG-B, R5), no merge, no force-push |
| Required evidence | The diff of every changed file, the full `npm test` output (the real `Tests N passed (N)` line, not "tests pass"), the `npm run build` output, a note of which risk in the register (R1-R6) it touches, and which commands it did not run |
| Before merging or deploying | I read the whole diff, rerun `npm test` and `npm run build` myself, check the page at desktop and 375 px width (AC6), and only then merge into `week-10` by hand; deploying is never allowed for this project |

### 9.2 Optional — the deck's checklist prompt (not graded)

<!-- If you sent it: the answer, and one thing it has that your rules in 9.1 do not, or the reverse. -->

### 9.3 Checks I am keeping as FAIL or ERROR

Use the same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| | |

---

## 10. Release decision and conclusion

**Decision:** GO / CONDITIONAL / NO-GO

<!-- Keep one word above. GO is not allowed while any confirmed risk still scores 6 or more.
     Then 80-150 words, in your own words, without the assistant: why this decision, from the
     register, the tests and what you are still unsure about. Name at least two risk IDs.
     Worthless: "The project is mostly fine, so GO."
     Worth everything: "CONDITIONAL. R2 (the deploy line in AGENTS.md, 3 x 3 = 9) is closed by the
     approved patch, now 1 x 3. R4 (the page accepts a past start when 'now' is typed by hand,
     2 x 2 = 4) is open, owned by me, controlled by the AC1 test. The UI was checked at two widths,
     but no test covers App.tsx, so a regression there would be invisible." -->

<!-- Write your conclusion below this line -->
