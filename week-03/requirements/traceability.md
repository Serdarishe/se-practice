# Traceability — use cases → stories → criteria

One row per use case. All six rows stay, even the ones with nothing behind them: an empty cell is a
finding you report, not a failure you hide. Use real IDs, comma-separated; write `none` where there
is nothing.

| Use case | Stories (US-nn) | Criteria (AC-nn) | Gap? |
| --- | --- | --- | --- |
| UC-01 View availability | US-01 | AC-09 (indirectly: a blocked room is shown as not available) | Partly — no criterion tests viewing availability itself |
| UC-02 Book room | US-02 | AC-01, AC-02, AC-03, AC-04, AC-05, AC-10, AC-11 | No |
| UC-03 Cancel booking | US-03 | AC-06, AC-07, AC-08 | No |
| UC-04 Block or unblock room | US-05 | AC-09, AC-10, AC-11, AC-12 | No |
| UC-05 Review usage | US-06 | none | Yes — story exists, no acceptance criteria |
| UC-06 Send confirmation | US-04 | none | Yes — no story until I wrote US-04 from the AI's story 4; still no acceptance criteria |

**Stories that belong to no use case:** none (the AI's "View my bookings" and "Manage rooms" traced to no use case and were deleted — see lab-report.md §3)

**What the gaps tell you:** UC-05 and UC-06 have stories but nothing that tests them, and UC-06 is a system function that the AI tried to hand to a person; the requirements are strongest where the four business rules apply and weakest on the functions no rule touches.
