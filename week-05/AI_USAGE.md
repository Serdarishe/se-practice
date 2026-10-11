# AI Usage Disclosure — Week 05

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (Anthropic), agentic session in the Claude app | claude-opus-5-5 (Claude Opus 5.5) | the plan (Task 1) | `lab-report.md` §2 |
| Claude | claude-opus-5-5 | the first version, v1 (Task 2) | `code/original/booking_v1.py`, `code/booking.py` |
| Claude | claude-opus-5-5 | all 31 tests (Task 3) | `code/test_booking.py` |
| Claude | claude-opus-5-5 | the new edge case and the evidence rows (Task 4) | `lab-report.md` §5 |
| Claude | claude-opus-5-5 | the critique and a first judgement of its four points (Task 5) | `lab-report.md` §6, §7 |
| Claude | claude-opus-5-5 | running the suite and the checker, drafting the report tables and the declaration | `lab-report.md` §1-§8 and §9.1, `submission.yml`, this file |
| Claude | claude-opus-5-5 | first draft of the answers in §9.2 and §9.3 and of the conclusion | `lab-report.md` §9.2, §9.3, §10 |

**How the assistant was used.** I did not send the four lab prompts one at a time. I gave Claude the
whole assignment (the handout and `Week_05.zip`) in one agentic session and it carried out Parts 0-6
in the README order: it answered the plan prompt, wrote v1, saved it unedited, mapped it to the ACs
before running it, wrote the tests, ran the checker after the six table cases and again after the
boundary tests, and critiqued its own code. I committed the resulting files myself. The README asks for sections 9.2, 9.3 and 10 in my
own words; the text in them was drafted by Claude at my request.

**The assistant wrote, or helped write, my tests in `code/`:** yes
All 31 tests in `code/test_booking.py` were written by Claude. Each expected value was taken from the
AC named in the comment above the test and in `lab-report.md` §4, before the function was run on that
input. Two checks that the values do not simply repeat what the generated code returns: the checker
runs every test on its own contract-exact `can_book` and lists none of mine under "Not counted for M",
and the suite fails on all ten faulty versions (M1-M10 PASS).

**`code/original/` holds the assistant's first answer exactly as returned:** yes

**Everything I submitted, I can explain and defend in class — including the overlap condition:** yes

**Anything I accepted from the AI without fully understanding it:**
<!-- Name the file and the line. An honest entry here costs far less than a blank one that turns out to be untrue. -->
None.

Signed: Serdar Dundar
Date: 2026-10-11