# AI Usage Disclosure — SIS #04

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Date | Used for | Which files it touched |
| --- | --- | --- | --- | --- |
| Claude (fresh session, report.md 8.1) | Claude Opus 5.5 (claude-opus-5-5) | 2026-11-15 | codebase analysis (Task 1) | none directly; its risks were checked against `app/src/main.js` and went into report.md 3.1 |
| Claude (same chat, report.md 8.2) | Claude Opus 5.5 (claude-opus-5-5) | 2026-11-15 | improvement plan | none directly; report.md 3.2 is based on it, changed as in 3.3 |
| Claude (fresh session, report.md 8.3) | Claude Opus 5.5 (claude-opus-5-5) | 2026-11-15 | feature extension (Task 2) and tests (Task 4): first versions of `checkRoom`, `filterRooms` and their tests | `app/src/booking.js`, `app/src/filter.js`, `app/src/checkRoom.test.js`, `app/src/filter.test.js` |
| Claude (agent session on claude.ai, with a terminal on a copy of my repository) | Claude Opus 5.5 (claude-opus-5-5) | 2026-11-15 | refactoring (Task 3), the rest of the tests and the page, running Vitest and the checker, the Playwright screenshots, drafting report.md sections 1-9, the git commits | `app/` (all of `src/`, `index.html`, `README.md`), `diagrams/`, `evidence/`, `report.md` sections 1-9, this file |

The analysis and implementation chats (8.1-8.3) were run by the agent session as separate fresh
Claude sessions, each started with the prompt exactly as pasted in report.md section 8. Around each
prompt there was one extra instruction line (use no tools, reply only with the answer).

No Agent Skill and no MCP server were used. No credentials were shared.

**The assistant wrote, or helped write, tests in `app/`:** yes
`checkRoom.test.js` and `filter.test.js` started from the assistant's suite (8.3) and were extended
(unknown id, F4 with equipment, no-change test). `reason.test.js` (M1-M7) was written in the agent
session. Each expected value was checked against the rule it names: F1 is `>=` so capacity 6 with
6 attendees is in (B5); F2 is ALL, so a room with only a projector is out for projector + whiteboard;
touching 660-720 next to 600-660 is Available (AC4, B3); 121 minutes is out (AC2, B2). The tests
were run red before the code existed (report.md 8.3).

**Every run pasted in report.md was produced by my code on my machine (or Codespace), unedited:** yes
The runs were made by my committed code, unedited, in the Linux workspace of the Claude agent
session (Node v22.23.4), not on my laptop. `npx vitest run` in `sis-04/app` reproduces 48/48.

**Every number in report.md section 7 was measured the way its row says:** yes

**I shared no credentials, keys or private data with any tool:** yes

**Everything I submitted, I can explain and defend in class — including filterRooms, checkRoom and
why each module exists:** yes / no

**Anything I accepted from the AI without fully understanding it:**
<!-- Name the file and the line. An honest entry here costs far less than a blank one that turns out to be untrue. -->

Signed: Serdar Dundar
Date: 2026-11-15
