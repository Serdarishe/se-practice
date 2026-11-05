# AI Usage Disclosure — Week 07

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (a fresh Claude Code agent with no earlier context, started from my session) | claude-opus-5-5 | the first test suite (Task 3) | its answer only; I saved its test file unedited as `suites/first/booking.test.js` and copied it to `app/src/booking.test.js` |
| Claude (the same agent chat, continued) | claude-opus-5-5 | the improvement prompt (Task 5) | its answer only (pasted in lab-report.md 6.2); the accepted changes were applied to `app/src/booking.test.js` |
| Claude (Claude app agent session, Claude Code harness) | claude-opus-5-5 | the whole lab workflow: branch and commits, extraction, Vite/Vitest setup, final suite, mutant runs, Playwright screenshots, drafts of lab-report.md and submission.yml | `app/` (package.json, index.html, src/booking.js, src/main.js, src/booking.test.js), `evidence/`, `lab-report.md`, `AI_USAGE.md`, `submission.yml`, `/.gitignore` |

**I used an assistant to extract `canBook` (Task 1), or to fix a defect in it:** yes
<!-- If "yes": which change, in which file, and how you checked that the behaviour did not change. -->
Claude moved the decision from `checkAvailability()` in the Week 06 `index.html` to `app/src/booking.js` (same five conditions, same order) and the page script to `app/src/main.js`. Check: the same 12 inputs were run on the old and the new page in Chromium and gave identical results and messages (lab-report.md section 2). No defect was fixed in `booking.js`: the first run had no failures. One page-only fix in `src/main.js` (empty time field message, found by U3).

**I used another assistant as well (to explain a failure, to draft text in lab-report.md, …):** yes
<!-- If "yes": which one, the exact model, and for which section. -->
The Claude session above (claude-opus-5-5) drafted the text of lab-report.md sections 1-10, including the reasons in section 3, the review in section 5, 9.2, 9.3 and the conclusion in section 10. I read and checked them against the ACs and the real runs before submitting.

**`suites/first/` holds the assistant's first test file exactly as it generated it:** yes

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes

**I can explain every test in my final suite — its input, its expected result and the AC behind
it — without the assistant:** yes

**Anything I accepted from the AI without fully understanding it:**
<!-- Name the file and the part. An honest entry here costs far less than a blank one that turns out to be untrue. -->
`app/package.json`: the exact Vite 6 / Vitest 3 versions were chosen by Claude (pinned for Node 18 compatibility); I did not compare them with newer versions.

Signed: Serdar Dundar
Date: 2026-11-05
