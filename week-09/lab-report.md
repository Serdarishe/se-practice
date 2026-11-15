# Week 09 — Lab Report: canBook as a Tool

Fill in every section. Do not delete or renumber the headings: the README and the checker point at
them. Replace every `<!-- comment -->` with your own text (comments are ignored by the checker).

**Name:** Serdar Dundar
**Student ID:** 24B031016
**GitHub:** Serdarishe

---

## 1. Setup

| | |
| --- | --- |
| Assistant (frozen for the whole lab) | Claude (claude.ai, agent session) |
| Exact model (or "not displayed") | Claude Opus 5.5 (`claude-opus-5-5`) |
| Three fresh chats for R1, R2, R3? (yes / no) | yes - three separate Claude sessions started from zero, one request each, no shared context |
| Python version (`python --version`) | Python 3.13.18 (the checker runs were made in the Linux workspace of the Claude session) |

## 2. Your tool definition — a reason for every constraint

Paste your final `tool/check_room.json`, then fill the table: one row per constraint you wrote.

```json
{
  "name": "check_room",
  "description": "Checks whether a room can be booked for one requested time slot today and answers Available or Unavailable. Every time is a whole number of minutes since midnight, from 0 to 1440: hours * 60 + minutes, so 09:00 = 540, 10:00 = 600, 13:45 = 825, 24:00 = 1440. Never pass a time as a string like \"11:00\". All five arguments are required; if the user did not give one of them, ask instead of guessing. This tool only checks: it does not save, create, change or cancel any booking.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "start": {
        "type": "integer",
        "minimum": 0,
        "maximum": 1440,
        "description": "Requested start of the slot, in whole minutes since midnight (10:00 = 600)."
      },
      "end": {
        "type": "integer",
        "minimum": 0,
        "maximum": 1440,
        "description": "Requested end of the slot, in whole minutes since midnight (11:00 = 660, 24:00 = 1440)."
      },
      "now": {
        "type": "integer",
        "minimum": 0,
        "maximum": 1440,
        "description": "The current time of day, in whole minutes since midnight (09:00 = 540)."
      },
      "blocked": {
        "type": "boolean",
        "description": "true if the room is blocked (for example for maintenance), false if it is not."
      },
      "bookings": {
        "type": "array",
        "description": "Bookings the room already has today, each as {\"start\": minutes, \"end\": minutes}. Use [] when there are none.",
        "items": {
          "type": "object",
          "properties": {
            "start": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1440,
              "description": "Start of an existing booking, in minutes since midnight."
            },
            "end": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1440,
              "description": "End of an existing booking, in minutes since midnight."
            }
          },
          "required": ["start", "end"],
          "additionalProperties": false
        }
      }
    },
    "required": ["start", "end", "now", "blocked", "bookings"],
    "additionalProperties": false
  }
}
```

| Field | Constraint (e.g. `"type": "integer"`, `"maximum": 1440`) | What goes wrong without it |
| --- | --- | --- |
| (top level) | `"type": "object"` | The model could send a list or a bare string as the arguments; there would be no named fields to read. |
| (top level) | `"required": [all five]` | A call without `now` (S04) passes, and canBook has to invent a current time, so AC1 "start after now" is checked against nothing. |
| (top level) | `"additionalProperties": false` | A model can add fields we never read, like `"room": "204"` (S05). The call looks accepted, but the room it meant is silently ignored. |
| start, end, now | `"type": "integer"` | `"end": "11:00"` (S03) or `600.5` (S10) get through. canBook compares numbers, so a string or half minute breaks the comparison or rounds silently. |
| start, end, now | `"minimum": 0` | Negative times like `-30` (S06) are accepted; there is no minute before midnight in a one-day model. |
| start, end, now | `"maximum": 1440` | `1500` (S07) is accepted, a time on the next day that canBook's one-day logic cannot handle. 1440 itself stays allowed for 24:00 (S11). |
| blocked | `"type": "boolean"` | `"false"` as a string (S09) is truthy in JS, so a free room would be treated as blocked. |
| bookings | `"type": "array"` | A single object or a string could be sent instead of a list, and the loop over bookings breaks. No `minItems`, so `[]` stays valid (S02, R2). |
| bookings.items | `"type": "object"` | A booking as a pair `[660, 720]` (S12) passes and `b.start` / `b.end` are undefined, so the overlap check (AC4) compares with nothing. |
| bookings.items | `"required": ["start", "end"]` | `{start: 660}` (S08) passes; `end` is undefined, the overlap test is always false, and an occupied room looks free. |
| bookings.items | `"additionalProperties": false` | Same reason as at the top: extra keys in a booking (`"room"`, `"name"`) are accepted and ignored. |
| bookings.items.start/end | `integer`, `0..1440` | Same as for the request times: a booking written as `"11:00"` would make the overlap check meaningless. |
| description | unit, examples, "does not save" | Without "minutes since midnight" and the worked examples a model may send `11` for 11:00 or `"11:00"`. Without "does not save" a model may think the call reserves the room (AC5). |

## 3. The twelve calls — first run and final run

Your **first** run's S verdicts (before any fix), and your final ones. For every case that changed,
say what you changed.

First draft (commit `c0633c9`) was the §3 table written as a schema: types, 0-1440 ranges, all five
fields required, `bookings` as an array of `{start, end}` objects. It did not close the objects and
did not make the booking fields required. First run: **2 of 12 FAIL** (S05, S08).

| Case | First run | Final run | What you changed |
| --- | --- | --- | --- |
| S01 | PASS | PASS | - |
| S02 | PASS | PASS | - |
| S03 | PASS | PASS | - |
| S04 | PASS | PASS | - |
| S05 | FAIL (accepted `"room": "204"`) | PASS | Added `"additionalProperties": false` at the top level (and in `items`). |
| S06 | PASS | PASS | - |
| S07 | PASS | PASS | - |
| S08 | FAIL (accepted `{start: 660}`) | PASS | Added `"required": ["start", "end"]` inside `bookings.items`. |
| S09 | PASS | PASS | - |
| S10 | PASS | PASS | - |
| S11 | PASS | PASS | - |
| S12 | PASS | PASS | - |

In the same fix commit (`1625df6`) the description was rewritten for a model that has never seen
the course: the formula hours * 60 + minutes, worked examples (09:00 = 540, 13:45 = 825, 24:00 =
1440), "never a string like 11:00", and "ask instead of guessing". I deliberately did not use 16:30
or 14:00 as examples, so the description would not hand the model the R2 answer.

## 4. Function calling — what the model wrote

For each request, paste the model's reply exactly, then judge it against the request.

### R1

```text
{"name": "check_room", "arguments": {"start": 600, "end": 660, "now": 540, "blocked": false, "bookings": [{"start": 660, "end": 720}]}}
```

Match. F1, F2, F3 PASS. Every value is right: 9:00 -> 540, 10:00 -> 600, 11:00 -> 660, the
booking 11:00-12:00 -> {660, 720}, "isn't blocked" -> false. The model followed the format (bare
JSON, no fence, no prose). The requested slot ends exactly when the existing booking starts
(660), so canBook will answer Available (touching is allowed, AC4); the schema does not know this.

### R2

```text
{"name": "check_room", "arguments": {"start": 840, "end": 990, "now": 810, "blocked": true, "bookings": []}}
```

Match. F4, F5, F6 PASS. 16:30 was converted correctly to 990 (not 960), 13:30 -> 810, 14:00 -> 840,
"blocked for maintenance" -> true, "no other bookings" -> []. The model did **not** refuse to call
although the room is blocked and the slot is 150 minutes: it left the decision to the function,
which is correct. canBook will say Unavailable twice over (AC3 blocked, AC2 150 > 120). The schema
accepted the call because every value is a valid integer or boolean; the problems are about
meaning, not shape.

### R3

```text
I can only check slots for today, not tomorrow. Do you want me to check a slot today instead? If so, please tell me the exact start and end time, the current time, whether the room is blocked, and which bookings it already has today.
```

The model **asked** instead of calling (saved as `calls/r3.txt`), and it invented no values. Missing
from R3: the exact `start` and `end` ("afternoon" and "a couple of hours" are not numbers), `now`,
`blocked` and `bookings`. Only the duration is roughly given (about 120 minutes).

Two findings:
- It said "I can only check slots for today". That comes from the word **today** in my
  description, not from the schema: the schema has no date field at all. So the description,
  not the schema, decided how the model treated "tomorrow". If the description did not say
  "today", the model could have silently checked tomorrow's slot against today's bookings.
- The prompt asked for "one short question". The model wrote two questions plus a list of five
  things it needs. So it obeyed "do not guess" but not "one short question". F7 only checks that
  exactly one r3 file exists, so no check caught this.

## 5. What the schema cannot check

A JSON Schema with the allowed keywords checks each value **on its own** (type, range, which keys
exist). It cannot compare two values, do arithmetic, or say anything about what the function does.
So these rules stay in canBook:

- **AC1 (partly).** The schema enforces the per-field part: start and end are whole minutes and
  `0 <= start`, `end <= 1440` (`minimum` / `maximum`, `type: integer`). It cannot enforce
  `start < end` or "start after now", because both compare two fields and no allowed keyword
  relates one property to another. `{"start": 600, "end": 600}` is a valid call.
- **AC2 (at most 120 minutes).** Needs `end - start <= 120`, i.e. arithmetic over two fields. R2
  (840 to 990, 150 minutes) passed the schema and only canBook rejects it.
- **AC3 (not when blocked).** The schema can only say `blocked` is a boolean. Writing
  `"enum": [false]` would make blocked calls invalid, but that is wrong: R2 is a correct call
  that must reach the function so it can answer Unavailable. Deciding the answer is the
  function's job.
- **AC4 (no overlap, touching allowed).** Needs `start < b.end && b.start < end` for every booking,
  comparing the request with each item of the array. Not possible with per-value keywords.
- **AC5 (does not change or save anything).** This is behaviour of the code. The schema describes
  inputs only; the description can promise "does not save", but only canBook's code (and its
  tests) can keep that promise.
- **AC6 (the page's feedback).** It is UI. The tool has no page at all.

## 6. Permissions — allow, ask or block

| # | Action | Decision (allow / ask / block) | Reason (the risk, in one sentence or more) |
| --- | --- | --- | --- |
| A1 | call `check_room` with the times the user just typed | allow | It is read-only (AC5): the worst case is a wrong Available/Unavailable answer, nothing is saved, and the schema refuses malformed calls before canBook runs. |
| A2 | read `week-08/app/src/booking.ts` | allow | Reading one source file of my own repo changes nothing and holds no secrets; the agent needs it to answer questions about canBook. (Note: that file lives on the week-08 branch, not on week-09.) |
| A3 | edit `booking.ts` to raise the 120-minute limit to 180 | block | One user asking for 3 hours is not a reason to change AC2: it rewrites a business rule for everyone and breaks the AC2 tests, and only the people who own the requirements can change it. |
| A4 | run `npm test` in `week-08/app` | allow | Tests are read-only checks in my own project and give useful evidence; the risk is that `npm test` runs whatever `package.json` says, so this stays allow only while the agent has not edited `package.json`. |
| A5 | run `git reset --hard` to undo its own last three edits | ask | It throws away all uncommitted changes in the working tree, mine included, and cannot be undone; I want to see `git status` first and confirm only its edits are lost. |
| A6 | `git commit` its change on the `week-09` branch | allow | A commit on my feature branch is local and reversible (`git revert` or reset), and it creates a checkpoint I can return to; nothing leaves my machine. |
| A7 | `git push` to `main` | block | It publishes an unreviewed change to the protected branch that the course says must stay untouched (work goes through an open PR); a push to main can't be quietly taken back. |
| A8 | send the contents of `.env` to an MCP server it found online | block | This sends secrets (API keys, passwords) to an unknown third party; it is the classic exfiltration or prompt-injection pattern and no configuration step needs it. |

## 7. Checkpoint

Before letting such an agent edit anything, I commit everything I have and use that commit as the
checkpoint. In my repository it is:

```text
0246dd9 Week 09: model calls for R1, R2, R3 (saved as returned)
```

(`git log --oneline` on week-09: `0246dd9`, `1625df6`, `c0633c9`, `0ca6750`, `16d396b`.)

The command that takes me back to it:

```bash
git reset --hard 0246dd9
```

What it throws away: every commit made on `week-09` after `0246dd9` (they disappear from the branch;
they can only be found again through `git reflog` for a while), and every uncommitted change to
tracked files in the working tree and index. It does **not** delete untracked new files the agent
created; those need `git clean -n` (to look) and `git clean -fd` (to remove). If the agent had
already pushed, the reset is only local and the remote would need a separate fix.

## 8. Checker output

Paste the **whole** output of your last `python tests/check_tool.py`, unedited.

```text
PASS  D1    tool/check_room.json exists and is valid JSON
PASS  D2    has name, description and inputSchema
PASS  D3    name is exactly "check_room"
PASS  D4    description: 25+ words, says minutes, 1440, and that it does not save
PASS  D5    inputSchema: an object with exactly the five fields, all required
PASS  D6    inputSchema uses only the keywords listed in README section 5
PASS  S01   the R1 call, valid -> accept
PASS  S02   no existing bookings: bookings = [] -> accept
PASS  S03   end as a string: "11:00" -> refuse
PASS  S04   now missing -> refuse
PASS  S05   an extra field: "room": "204" -> refuse
PASS  S06   start below the day: -30 -> refuse
PASS  S07   end beyond the day: 1500 -> refuse
PASS  S08   a booking with no end: {start: 660} -> refuse
PASS  S09   blocked as a string: "false" -> refuse
PASS  S10   start not a whole minute: 600.5 -> refuse
PASS  S11   end at the end of the day: 1440 -> accept
PASS  S12   a booking as a pair: [660, 720] -> refuse
PASS  F1    calls/r1.json: a call to check_room
PASS  F2    calls/r1.json: arguments valid against your schema
PASS  F3    calls/r1.json: arguments equal the expected ones (README section 5, Part 2)
PASS  F4    calls/r2.json: a call to check_room
PASS  F5    calls/r2.json: arguments valid against your schema
PASS  F6    calls/r2.json: arguments equal the expected ones (README section 5, Part 2)
PASS  F7    calls/r3: exactly one of r3.json (it called) or r3.txt (it asked), not empty
PASS  L1    section 5 names at least two acceptance criteria (AC1-AC6) the schema cannot check
PASS  L2    section 6: A1-A8 each have allow / ask / block and a reason of 5+ words
PASS  L3    section 7 names the checkpoint commit (a SHA)
PASS  L4    section 10: a conclusion of 80-150 words
PASS  L5    AI_USAGE.md filled in (a tool row, and signed)

SUMMARY: 30 PASS · 0 FAIL · 0 ERROR  (of 30 checks)
Paste this whole output into lab-report.md section 8, and these three numbers into submission.yml.
```

## 9. What still fails

None. All 30 checks pass (see section 8).

## 10. Conclusion (80–150 words)

The schema checks shape and the function checks meaning. My first draft let S05 (an extra `room`
field) and S08 (a booking without `end`) through, because I wrote types and ranges but forgot to
close the objects. After the fix the schema refuses all nine bad calls, yet R2 still passes it with
a blocked room and 150 minutes: only canBook can say Unavailable, since AC2, AC3 and AC4 compare
fields with each other. The model did its part well on R1 and R2, but R3 showed that my
description, not the schema, steered it: the word "today" made it refuse "tomorrow" and ask, and
it ignored "one short question". For agents, reading and calling check_room are safe, while A3,
A7 and A8 must be blocked, because they change rules, publish or leak secrets.
