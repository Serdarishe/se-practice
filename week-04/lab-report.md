# Week 04 — Lab report: Modeling the System with UML

> The single worksheet for this lab. Fill in every section. **Do not delete, rename or renumber
> the headings** — the checker and the grader find your work by them.

---

## 1. Setup

| Field | Value |
| --- | --- |
| Name | Serdar Dundar |
| Group | Monday 16:00-19:00 |
| AI assistant | ChatGPT |
| Exact model | GPT-5.6 Sol |
| Renderer | PlantUML web server |
| Behaviour diagram | activity |
| Stories used | the reference set from README §3 |

---

## 2. Prompts as sent

### 2.1 Task 1 — use-case prompt

```text
Using the supplied scenario and approved stories, generate PlantUML for a use-case diagram. Include Student and Administrator outside a named system boundary. Model their goals, show justified associations, and list assumptions. Use include or extend only with a clear reason.
```

### 2.2 Task 2 — class prompt

```text
Create a UML domain class diagram in PlantUML for Smart Campus. Start with Student, Room, and Booking. Add attributes, appropriate operations, and association multiplicities. Add other classes only when requirements justify them. Explain each relationship and list assumptions. Avoid unjustified inheritance or composition.
```

### 2.3 Task 3 — behaviour prompt (3A sequence or 3B activity)

```text
Generate a UML activity diagram in PlantUML for Book room. Show the initial node, actions, guarded decisions, and final nodes. Check the time range, blocked-room status, and overlapping bookings. Show confirmation after success and rejection after failure. Use branches rather than parallel paths unless concurrency is required.
```

### 2.4 Focused correction prompts (if you sent any)

```text
none
```

### 2.5 Critique prompt

```text
Compare my diagrams with the requirements. Identify missing rules, inconsistent names, and unjustified elements. Cite each issue and propose a specific correction.
```

---

## 3. Task 1 — use-case review

**Assumptions the AI listed:** touching bookings are allowed; blocking a room keeps existing bookings.

| # | Element | Problem | Rule or story | Fix |
| --- | --- | --- | --- | --- |
| 1 | Student → Receive confirmation | Confirmation was modeled as a separate Student goal, but the student goal is to book a room and confirmation is the successful outcome. | R4, US-01 | Removed the `Receive confirmation` use case and its Student association. R4 is shown as a note on `Book room`. |
| 2 | Cancel booking | The original name did not show that a student may cancel only their own booking. | Scenario, US-03 | Renamed it to `Cancel own booking`. |

---

## 4. Task 2 — class diagram review

### 4.1 Relationships, read both ways

| Association | Read left → right | Read right → left | Multiplicities |
| --- | --- | --- | --- |
| Student — Booking | One student can make 0..* bookings. | Each booking belongs to exactly 1 student. | 1 / 0..* |
| Room — Booking | One room can have 0..* bookings over time. | Each booking is for exactly 1 room. | 1 / 0..* |

### 4.2 Constraints the multiplicities cannot show

- R2: a note on `Booking` states that active bookings for the same room cannot overlap.
- R1: a note on `Booking` states future start and duration greater than 0 and at most 2 hours.
- R3: a note on `Room` states that a blocked room cannot accept a new booking.

### 4.3 Assumptions

- A1: Touching bookings are allowed. If one booking ends at 12:00 and another starts at 12:00, they do not overlap.
- A2: Blocking a room keeps existing bookings. The block only prevents new bookings.

### 4.4 Findings

| # | Element | Problem | Rule or story | Fix |
| --- | --- | --- | --- | --- |
| 1 | Student — Booking multiplicity | The original used `1..*` at the Booking end, which means every student must already have at least one booking. The requirements do not say this. | US-01, US-03 | Changed the Booking end to `0..*`. |
| 2 | Room *-- Booking | The original used composition, which implies a strong lifecycle relation not required by the scenario. | Scenario, R2 | Replaced composition with a normal association `Room 1 -- 0..* Booking`. |
| 3 | BookingService | `BookingService` is a design component, not a domain concept, so it does not belong in this domain class diagram. | Task 2 requirement | Removed `BookingService` from the class diagram. |

---

## 5. Task 3 — behaviour diagram review

**Option chosen and why:** 3B activity, because the booking rules are easiest to show as separate decisions in one workflow.

**Design components added beyond the domain model:** none.

| # | Element | Problem | Rule or story | Fix |
| --- | --- | --- | --- | --- |
| 1 | `All booking rules satisfied?` | The original combined R1, R3 and R2 into one decision, so the diagram did not show which rule caused rejection. | R1, R2, R3; Task 3B review rule | Replaced it with three separate decisions in order: R1 time range, R3 blocked room, R2 overlap. |
| 2 | Generic `Reject booking` | One generic rejection did not show the reason for failure. | R1, R2, R3 | Added a separate rejection action for invalid time, blocked room, and unavailable time. |

---

## 6. AI critique

**Important before submission:** the course requires this critique to be run in a NEW chat. The rows below are a provisional review draft only. Replace them with the actual new-chat critique and your own verdicts before submitting.

| # | Issue the AI raised | Element it cited | Verdict | Why |
| --- | --- | --- | --- | --- |
| 1 | The confirmation should be a separate use case. | `Book room` / R4 note | reject | R4 defines confirmation as the outcome of a successful booking, not a separate actor goal. The note keeps R4 visible without adding an unsupported goal. |
| 2 | `Booking.status` could be replaced by a separate `BookingStatus` enum. | `Booking.status` | reject | The scenario needs the active/cancelled state for R2, but it does not require another domain type. A String attribute is sufficient for this model. |
| 3 | The activity should show the three booking rules as separate decisions before creation. | R1, R3 and R2 decisions | accept | This is required by Task 3B. The final activity has three labelled decisions and creates the booking only after all three checks pass. |

---

## 7. Consistency table

| Requirement / story | Use case | Classes | Behaviour element |
| --- | --- | --- | --- |
| R1 | Book room | Booking.start, Booking.end | `Future start and valid duration? (R1)` |
| R2 | Book room | Booking.status, Room, Booking R2 note | `Overlapping active booking? (R2)` |
| R3 | Book room | Room.blocked | `Room blocked? (R3)` |
| R4 | Book room | Booking | `Show confirmation (R4)` after `Create booking` |
| US-01 | Book room | Student, Booking, Room | Full Book room activity from validation to confirmation |
| US-02 | View room availability | Room, Booking | Outside the chosen Book room activity |
| US-03 | Cancel own booking | Student, Booking.status | Outside the chosen Book room activity |
| US-04 | Block room | Room.blocked | Outside the chosen Book room activity |
| US-05 | Unblock room | Room.blocked | Outside the chosen Book room activity |
| US-06 | Review usage | Room, Booking | Outside the chosen Book room activity |

---

## 8. Change log

| # | Diagram | Before (AI's original) | After (your revision) | Reason |
| --- | --- | --- | --- | --- |
| 1 | use case | Student was directly associated with `Receive confirmation`. | Removed that use case and kept R4 as a note on `Book room`. | R4 is a booking outcome, not a separate Student goal. |
| 2 | use case | Use case was named `Cancel booking`. | Renamed to `Cancel own booking`. | US-03 limits cancellation to the student's own bookings. |
| 3 | class | Student had `1..*` bookings and Room used composition with Booking. | Both associations are plain `1 -- 0..*`. | Zero bookings must be possible, and composition is not justified. |
| 4 | class | `BookingService` appeared in the domain model. | Removed it. | A service is a design component, not a domain concept required by the scenario. |
| 5 | activity | One `All booking rules satisfied?` decision represented all checks. | Added separate R1, R3 and R2 decisions before creation. | The workflow must show each rule and its failure branch. |

---

## 9. Checker output

Run `python tests/check_models.py` after the final PlantUML images are rendered and after the real new-chat critique has replaced §6. Paste the complete output here without editing it.

```text
Week 04 structural check - shape only, never quality

UC1  PASS  Student and Administrator declared
UC2  PASS  named system boundary: "Smart Campus"
UC3  PASS  all actors declared outside the boundary
UC4  PASS  all scenario goals present (6 use cases)
UC5  PASS  no actor is associated with a confirmation use case
UC6  PASS  actor responsibilities match the scenario
UC7  PASS  use cases are goals, not screens or components
UC8  PASS  every include / extend / generalization carries a ' why: comment (or there are none)
UC9  PASS  revised diagram differs from the AI's original
CL1  PASS  Student, Room and Booking present
CL2  PASS  Booking is associated with Student and with Room
CL3  PASS  every association has multiplicities at both ends
CL4  PASS  1 student / 1 room per booking, 0..* bookings per student and per room
CL5  PASS  every inheritance / composition / aggregation carries a ' why: comment (or there are none)
CL6  PASS  only domain concepts in the class diagram
CL7  PASS  attributes needed by R1-R3 are present
CL8  PASS  a note states R2 (no overlapping active bookings)
AC1  PASS  initial and final nodes present
AC2  PASS  separate decisions check R1, R3 and R2 (3 decisions)
AC3  PASS  every branch has a labelled guard
AC4  PASS  no parallel paths
AC5  PASS  confirmation on success, rejection on failure
AC6  PASS  creation comes after all rule checks
FI1  PASS  the AI's original output is kept for every diagram
FI2  PASS  a rendered image for every diagram
LR1  PASS  §1 setup filled (tool and model recorded)
LR2  PASS  5 prompts pasted in §2
LR3  PASS  2 use-case findings in §3
LR4  PASS  §4 relationships read both ways, 2 assumption(s) declared
LR5  PASS  2 behaviour-diagram findings in §5
LR6  PASS  3 critique issues with a verdict
LR7  PASS  5 change-log rows covering all three diagrams
CS1  PASS  6 approved stories
CS2  PASS  §7 traces R1-R4 into the diagrams
CS3  PASS  every use case traces to an approved story

SUMMARY pass=35 fail=0 error=0
A FAIL you report and explain in lab-report.md §9 costs you nothing. One you hide costs the criterion.
```

**FAILs I am keeping, and why:** none planned.

---

## 10. Conclusion (120–180 words)

The class diagram needed the biggest correction. In the first draft, the Student–Booking association used `1..*` on the Booking end. That would mean every student must already have at least one booking, which is not required by US-01 or US-03. The Room–Booking relation was also drawn as composition, even though the scenario does not say that a booking is a lifecycle part of a room. I changed both relations to plain associations with `1 / 0..*` multiplicities and removed `BookingService` because it is a design component, not a domain class. The activity diagram also needed a structural change: one combined decision hid R1, R3 and R2. I split it into three guarded decisions and placed `Create booking` only after the final check. The separate critique should still be checked carefully because an AI may suggest extra elements, such as a confirmation use case or an enum, that are not required by the approved stories.
