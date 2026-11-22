# AI Usage Disclosure — Week 10

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude Code subagent, read-only "Plan" agent type (no Edit/Write tools) | claude-opus-5-5 | prompt 0 (read AGENTS.md) and the read-only risk review (Task 2) | none — "WITHOUT editing files"; `git status` showed nothing changed in `app/` |
| the same read-only Plan agent | claude-opus-5-5 | AGENTS.md review and patch draft (Task 6) | none itself; the approved lines were applied to `app/AGENTS.md` by the Claude session (commit add7f77) |
| Claude Code subagent, normal agent type (can edit) | claude-opus-5-5 | the refactor prompt for R5 (Task 8); R1's patch is the AGENTS.md patch above | `app/src/booking.js`, `app/src/main.js` (commit 1cccada) |
| Claude (Claude app agent session, Claude Code harness) | claude-opus-5-5 | branch and commits, running all commands, checking the AI's claims in node and the browser, the R5 test, applying the approved AGENTS.md lines, Playwright screenshots, drafting lab-report.md sections 1-9 and submission.yml, translating my Russian text | `app/AGENTS.md`, `app/src/booking.test.js`, `evidence/`, `lab-report.md`, `AI_USAGE.md`, `submission.yml`, `/.gitignore` |

**The review in Task 2 ran in a mode where the assistant could not edit, and `git status` showed no
change afterwards:** yes
<!-- If it edited anything, say what and how you undid it. -->

**I labelled every claim in lab-report.md §3.2 after opening the cited file myself:** yes - the files were opened and the claims run (node, browser) in my Claude session; the labels are explained in 3.2

**Every change to `app/` was reviewed by me as a diff before I accepted it:** no
<!-- Name anything you rejected in §8; name here anything you accepted without reading. -->
The refactor agent edited `src/booking.js` and `src/main.js` right after listing the files, without waiting for approval. Its diff was reviewed afterwards (lab-report.md 8.2: 14 inputs compared on the old and new page, 26/26 tests) before it was committed. The AGENTS.md lines were decided one by one in 6.2 before they were applied.

**I used another assistant as well (to explain a risk, to draft text in lab-report.md, …):** yes
<!-- If "yes": which one, the exact model, and for which section. -->
The Claude session (claude-opus-5-5) drafted lab-report.md sections 1-9, including the register, the scores, the decisions in 6.2 and the background-agent rules. **Section 10 (the decision CONDITIONAL and its text) is my own**: I wrote it in Russian and Claude only translated it.

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes

**I can explain every score in my register, and why my release decision follows from it, without
the assistant:** yes

**Anything I accepted from the AI without fully understanding it:**
<!-- Name the file and the part. An honest entry here costs far less than a blank one that turns out to be untrue. -->
The equivalence script the refactor agent wrote (165,888 inputs) copies the new message function instead of importing `main.js`; I relied on the 14-input browser comparison for the real page.

Signed: Serdar Dundar
Date: 2026-11-22
