# AI Usage Disclosure — Week 09

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude | Claude Opus 5.5 (`claude-opus-5-5`), claude.ai | Part 2 — writing the calls for R1, R2, R3 | calls/ (saved by me, unedited) |
| Claude (agent session on claude.ai) | Claude Opus 5.5 (`claude-opus-5-5`) | Writing `tool/check_room.json`, running the checker and validator, drafting lab-report.md, AI_USAGE.md, submission.yml, making the git commits | tool/check_room.json, calls/, lab-report.md, AI_USAGE.md, submission.yml |

How Part 2 was run: the agent session started three separate Claude sessions with no shared
context, one per request. Each got the README prompt exactly, with the whole `check_room.json` and
one request pasted in. Around the prompt there was one extra line telling the session to use no
tools and to treat the text as a user message in a new chat and reply only with its answer. The
three replies were saved byte for byte into `calls/` (only the harness indentation of the report
was removed).

**I wrote `tool/check_room.json` myself:** no
Claude wrote both versions (first draft `c0633c9`, fix `1625df6`). The first draft is the §3 table
of the README turned into a schema; its first checker run (S05, S08 FAIL) is recorded unchanged in
lab-report.md §3. I reviewed the final file against the README rules D3-D6 and the twelve S cases,
and checked each constraint against the table in lab-report.md §2.

**I used an AI to explain a JSON Schema keyword or a check:** yes
Why `additionalProperties: false` is needed for S05 and why `required` inside `items` is needed for
S08, and why the checker counts `600.0` as an integer but `600.5` not.

**Every reply in `calls/` and in lab-report.md section 4 is exactly what the model returned:** yes

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes

**Anything I accepted from the AI without fully understanding it:**
Nothing in the schema. The one place I relied on the AI is the R3 analysis in lab-report.md §4:
the claim that the word "today" in the description caused the "I can only check slots for today"
answer is our reading of the reply, not something I tested with a second description.

Signed: Serdar Dundar
Date: 2026-11-15
