# AI Usage Disclosure — Week 06

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Bolt.new | not used - see below | - | - |
| Claude (fallback app builder) | claude-opus-5-5, Claude app agent session | prototype v1 from the deck's initial prompt (Task 2) | `original/index.html` |
| Claude (fallback app builder) | claude-opus-5-5 | the two fix prompts and the cleanup prompt (Task 4) | `prototype/index.html` |
| Claude | claude-opus-5-5 | ran the nine cases in headless Chromium (Playwright), took the screenshots, ran the checker, drafted lab-report.md and submission.yml, made the git commits | `evidence/`, `lab-report.md`, `submission.yml`, this file |

Why not Bolt.new: the lab was done on the deadline day in a Claude cloud session that cannot sign in to Bolt.new, so the deck's three prompts were given to Claude as the app builder instead (README fallback rule).

**I used another assistant as well (to explain code, to draft text in lab-report.md, …):** yes
Claude (claude-opus-5-5) drafted lab-report.md sections 1-7 and 9. Sections 8 and 10 are my own answers, written in Russian and translated to English by Claude word for word.

**`original/` holds Bolt's first version exactly as downloaded, and `evidence/v1.png` shows it:** no - there is no Bolt version; `original/` holds the fallback builder's first version unedited (commit 07290f0, before any cleanup), and `evidence/v1.png` shows it.

**Every screenshot in `evidence/` is an unedited capture of the page as it behaved:** yes - all captured by Playwright/Chromium, none edited. final-T8 is taken at 1280 px width (T1 at 1100 px) so the two files differ; final-T9 at 375 px, scale 2.

**I can explain the component I chose in lab-report.md section 8 — and how the page decides
availability — without the assistant:** yes (Serdar: change to no if that is not true, and update submission.yml)

**Anything I accepted from the AI without fully understanding it:**
To be filled in by Serdar.

Signed: Serdar Dundar
Date: 2026-10-18