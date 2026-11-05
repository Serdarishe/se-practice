# AI Usage Disclosure — Week 08

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (claude.ai web, Pro) | Claude Opus 5.5, effort High | diagnosis without the skill (Task 4) | none — "Do not edit code" |
| Claude (claude.ai web, Pro), bug-detector skill uploaded and enabled | Claude Opus 5.5, effort High | diagnosis with bug-detector (Task 5) | none — "Do not edit code" (it showed "Ran 2 commands" in its own sandbox, my files were not touched) |
| Claude (Claude app agent session, Claude Code harness) | claude-opus-5-5 | branch and commits, copying the buggy canBook, the BUG-A / BUG-B tests, applying the two one-line fixes, the runs, checking both answers against the code with node, drafting lab-report.md sections 1-8 and submission.yml, translating my Russian text | `app/src/booking.js`, `app/src/booking.test.js`, `lab-report.md`, `AI_USAGE.md`, `submission.yml`, `skills/bug-detector.zip`, `/.gitignore` |

**`skills/bug-detector/SKILL.md` was typed by me from the deck's text, not generated:** yes - I typed it by hand into the chat; Claude saved exactly that text to the file and made the ZIP

**I applied the patches myself, one minimal change per bug, after reviewing what the assistant
proposed:** no
<!-- If an assistant edited app/ directly, say which change and how you reviewed it. -->
The Claude session (not the two diagnosis chats) applied them in `app/src/booking.js`, one commit each: `<=`/`>=` → `<`/`>` (BUG-A) and deleting `bookings.push` with its comment (BUG-B). Both are the patch the two chats proposed. I checked the diffs in section 8: one code line each, and the BUG-A, BUG-B and full runs.

**I used another assistant as well (to explain a failure, to draft text in lab-report.md, …):** yes
<!-- If "yes": which one, the exact model, and for which section. -->
The Claude session above (claude-opus-5-5) drafted sections 1-8 (including the section 7 comparison) and submission.yml. **My own words, written in Russian and only translated by Claude:** the hypotheses in section 3, section 9.2, section 10 and the verdict `skill_helped: yes`.

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes

**I can explain both bugs and both fixes — which line, why it was wrong, which test proves the
fix — without the assistant:** yes

**Anything I accepted from the AI without fully understanding it:**
<!-- Name the file and the part. An honest entry here costs far less than a blank one that turns out to be untrue. -->
Nothing in the code. In `lab-report.md` section 7, the note that `push` on a frozen array also throws outside strict mode was checked by Claude with node; I did not test it myself.

Signed: Serdar Dundar
Date: 2026-11-05
