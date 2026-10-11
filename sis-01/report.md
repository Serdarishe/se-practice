# SIS #01 — Software Engineering Fundamentals, With an AI in the Loop

<!--
  This is the only file you write your report in. README.md tells you what goes where.

  Rules the checker relies on:
  - Do not delete, rename or renumber the ## headings, the ### headings, or the **Label:** words.
  - Replace every "(write here)" and "(paste here)". None may be left when you submit.
  - Comments like this one are ignored by the word counter. Delete them or leave them.
-->

**Topic:** 1.9

<!-- Exactly one of 1.1 … 1.10, e.g.  **Topic:** 1.4  -->

---

## 1. Scenario

<!-- 100–150 words, labels included. One small scenario, used in every prompt and in your
     whole answer. Anything fictional is labelled in Assumptions. -->

**Question:** How do the eight principles of the ACM/IEEE-CS Software Engineering Code of Ethics (short version) apply to a small student team, and are the AI's example mappings for each principle correct?

**Users:** Homeowners in Almaty looking for a renovation designer, and freelance construction designers who publish portfolios and receive requests.

**Problem:** A three-student team builds a mobile app, BuildLink, that matches clients with designers and stores chats, floor plans and phone numbers.

**Constraints:** The team has eight weeks and no budget for an external security audit; the app must work on low-cost Android phones with unstable internet.

**Risk:** A designer profile with fake portfolio photos or unverified qualifications misleads a client into an unsafe renovation.

**Assumptions:** BuildLink, the team, the eight-week timeline and all users are fictional; no real personal data is used.

## 2. Analysis

<!-- 350–400 words. Your answer to the question, the trade-offs, and how it applies to your
     scenario. Explain at least two engineering decisions and why they fit the scenario. -->

The short version of the ACM/IEEE-CS code has eight principles, and I checked the list myself on the ACM page (verification row 1).

Public: a fake portfolio can lead a homeowner into an unsafe renovation, so this principle is closest to my risk. Client and Employer: the team has no paying client, and its employer is the course that set the deadline. Principle 2 limits that loyalty with the words "consistent with the public interest", so the deadline does not excuse skipping profile checks. Product: the app stores chats, floor plans and phone numbers, so it must protect them at the level that is possible for three students. Judgment: principle 4 asks for integrity and independence, which here means saying openly that no security audit was done and not marking a profile as verified under time pressure. Management: the team lead gives the profile check a fixed place in the plan. Profession: the team does not call the app "secure" or "verified". Colleagues: teammates review each other's work and treat honest designers fairly when someone reports them. Self: the team learns basic mobile data protection before storing floor plans.

Engineering decision 1: the team checks the first designer profiles by hand before launch and labels every other profile as unverified. Checking everyone does not fit into eight weeks, but a badge alone is weak, because at launch every profile would carry it and users would stop noticing it. The trade-off is fewer designers at launch in exchange for less risk to homeowners.

Engineering decision 2: the team uses standard HTTPS and a ready backend service and writes no encryption of its own. Without a budget for an external audit, home-made security code is more likely to hide mistakes than to prevent them. The trade-off is dependence on a third-party service. The app is also tested on a low-cost Android phone with unstable internet, because that is what the users have.

Engineering decision 3: a reported profile is reviewed by a team member before it is hidden, so a false report cannot remove an honest designer.

One point stays uncertain. The AI draft said that the public interest comes first. The eight lines I read do not say this directly, so I treat "checks before deadline" as my own reading of principles 1 and 2, not as a rule of the code (verification row 2).

## 3. Review

<!-- 250–300 words. What Prompt B's critique said and what you did with it; your two source
     checks and your two substantive revisions, each with a reason. Point at the rows of the
     tables in section 9 ("verification row 2", "change-log row 1"). -->

Prompt B returned seven concerns, and I judged each one. I accepted concern 1: the draft invented a sponsor who is not in my scenario, so I replaced it with the course as employer. I accepted concern 2 after reading the source (below). I accepted concern 3 only partly: the critique is right that "encrypt" was vague, but a long security section does not fit this answer, so I added one concrete choice, standard HTTPS and a ready backend. I also accepted concern 4 only partly. The critique wanted to move the audit warning from Judgment to Public. Principle 4 names integrity, and honesty about a missing audit is integrity, so I kept the mapping and added the link to Public. I accepted concern 5, concern 6 and concern 7 (harm to honest designers from false reports).

Source check 1 (verification row 1): the draft listed eight principles. I opened the ACM page and found the same eight names in the same order, so I kept the claim.

Source check 2 (verification row 2): the draft said "the public interest comes first". In the short version Public is listed first, and principles 2 and 6 say "consistent with the public interest", but no line states a priority. I qualified the claim.

Revision 1 (change-log row 1): the priority sentence became a statement of what the eight lines actually say, because of source check 2.

Revision 2 (change-log row 2): the draft claimed that encryption slows low-cost phones. I had no source and no device test, and the claim worked against my constraint of protecting data on cheap Android phones, so I removed it and wrote the HTTPS decision instead.

Unverified and left out: legal liability under Kazakhstan law.

## 4. Conclusion

<!-- 100–150 words. Your recommendation for the scenario and its main limitation. -->

My recommendation for BuildLink is to treat the fake-portfolio risk as the main ethical problem and to spend the limited time on it first. The team should check the first designer profiles by hand, label the others as unverified, review reports before hiding a profile, use standard HTTPS with a ready backend, and tell users plainly that no external security audit was done. These steps follow from the Public, Product and Judgment principles and fit the eight-week limit.

The main limitation is that my evidence is narrow. I read only the eight lines of the short version, not the full code, so my mappings rest on short wording and on my own interpretation. I also could not verify who is legally responsible in Kazakhstan if a client is harmed, so the answer covers professional ethics only, not law.

## 5. Reflection

<!-- 150–200 words. NOT part of the main total. Written by you, not by the assistant:
     what helped, what you changed, what you learned. Specific beats flattering. -->

### 1. What really helped when working with AI?

AI helped me find mistakes and weak points in my answers that I did not notice at first. For example, it mentioned a sponsor who was not actually in the scenario, which showed me that AI can sometimes invent information. It also helped me understand the ethical problems more clearly.

### 2. What did I change and why?

I checked the ACM Code of Ethics on the official website and found that some statements suggested by AI were not written exactly that way in the source. I also removed the claim about encryption because there was no evidence that the application actually used it. I made these changes to keep my answers accurate and based on real information.

### 3. What did I learn?

I learned that AI is a useful tool, but we should not trust everything it says without checking. It is important to compare AI-generated answers with reliable sources and think critically. I also realized that working under a deadline can affect the quality of our work, so better time management and careful checking are necessary.

## 6. References

<!-- Full references, one per line, each starting with "- ". Only sources you actually opened.
     Every URL used in the verification table must also appear here. Example:
     - Sommerville, I. (2016). Software Engineering, 10th ed., Global Edition. Pearson. Ch. 1.
-->

- Association for Computing Machinery (ACM). The Software Engineering Code of Ethics and Professional Practice, Short Version. https://www.acm.org/code-of-ethics/software-engineering-code (accessed 2026-10-11).

## 7. Appendix A — Initial outline

<!-- Written BEFORE you run Prompt A. Five points, your own words, numbered. These are the
     "five points" you paste into Prompt A. -->

1. Careless work by the team can harm clients, designers and the company's reputation.
2. Checking portfolios is more important than the deadline, because safety and trust matter more than speed.
3. Client data must be protected, encrypted and never shared with third parties without consent.
4. The team should honestly warn clients that there was no security audit and explain the possible risks.
5. The company and the team are responsible if they did not check profiles and platform security; legal responsibility depends on the circumstances.

## 8. Appendix B — AI exchanges

<!-- Complete prompts and complete responses, as text — never screenshots. Paste each inside
     the fenced block that follows its label. If a response itself contains ``` lines, open
     and close that block with ~~~~ instead. You may add B4, B5 … after B3 if you ran more. -->

### B1 — Draft (Prompt A)

- **Tool:** Claude
- **Model:** claude-opus-5-5
- **Date:** 2026-10-11
- **Purpose:** contextual draft

<!-- Model: the exact model with its version, as the tool shows it (e.g. "GPT-5 Thinking",
     "Claude Sonnet 4.5"). If the tool does not show it, write: not displayed
     Date: YYYY-MM-DD -->

**Prompt:**

```text
Act as a software engineering tutor. Help me analyze topic 1.9 The software engineering code of ethics: use the eight principles in the ACM/IEEE-CS short code, give one example per principle, then check each mapping for a first-year-level university assignment.

My scenario is homeowners in Almaty looking for a renovation designer and freelance construction designers who publish portfolios; a three-student team builds a mobile app, BuildLink, that matches clients with designers and stores chats, floor plans and phone numbers; the team has eight weeks and no budget for an external security audit, and the app must work on low-cost Android phones with unstable internet; the risk is that a designer profile with fake portfolio photos or unverified qualifications misleads a client into an unsafe renovation. My initial ideas are 1. Careless work by the team can harm clients, designers and the company's reputation. 2. Checking portfolios is more important than the deadline, because safety and trust matter more than speed. 3. Client data must be protected, encrypted and never shared with third parties without consent. 4. The team should honestly warn clients that there was no security audit and explain the possible risks. 5. The company and the team are responsible if they did not check profiles and platform security; legal responsibility depends on the circumstances. Draft a 400–500 word explanation using these details.

Separate facts from assumptions. Explain trade-offs and identify claims I should verify. Do not invent quotations, references or page numbers.
```

**Response:**

```text
Topic 1.9: the ACM/IEEE-CS code of ethics applied to BuildLink

Facts (to confirm in the source)
The ACM/IEEE-CS Software Engineering Code of Ethics has a short version with eight principles: Public, Client and Employer, Product, Judgment, Management, Profession, Colleagues and Self. The principles are written as obligations of software engineers, and the public interest comes first. I am paraphrasing below, not quoting.

One example per principle
1. Public. Act in the public interest. A fake portfolio can lead a homeowner into an unsafe renovation, so the team should label unverified profiles clearly. This matches your ideas 1 and 2.
2. Client and Employer. Serve the client's interests, but only where this is consistent with the public interest. If a sponsor wants more designers listed quickly, the team should not skip checks to please them.
3. Product. Meet the highest professional standards possible. With no external audit, the team can still encrypt chats and phone numbers and test on a cheap Android phone with a weak connection. This supports your idea 3.
4. Judgment. Keep integrity and independence. The team says honestly that no security audit was done, even if this makes the app look weaker. This is your idea 4.
5. Management. Leaders promote an ethical approach. The student team lead plans the eight weeks so that profile checks are not the first task to be cut.
6. Profession. Protect the reputation of the profession. The team does not advertise BuildLink as "secure" or "verified" when it is not.
7. Colleagues. Be fair and supportive. Teammates review each other's code and credit each other's work.
8. Self. Keep learning. The team studies basic mobile security before storing floor plans.

Assumptions
BuildLink, the team and the timeline are fictional. I assume the team is a "company" only informally, that designers upload their own photos, and that the team cannot check building licences. Your idea 5 mixes ethical and legal responsibility: the code describes professional duties, it is not a law, and who is legally liable in Kazakhstan is outside what I can state.

Trade-offs
- Verification against deadline: manual checks of every portfolio may not fit in eight weeks. A cheaper option is an "unverified" badge plus a report button, which protects less but is honest.
- Encryption against low-cost phones: stronger protection can slow old devices and complicate offline use.
- Honesty against adoption: warning users about the missing audit may reduce sign-ups, but hiding it conflicts with Judgment and Public.

Claims you should verify
1. That the short version lists exactly these eight principles, in this order.
2. That the Client and Employer principle is limited by the public interest.
3. That the Product principle speaks of the highest professional standards possible.
4. That encryption noticeably slows low-cost Android phones. This is my assumption, not a sourced fact.
5. Any statement about legal liability under Kazakhstan law.
```

### B2 — Critique (Prompt B)

- **Tool:** Claude
- **Model:** claude-opus-5-5
- **Date:** 2026-10-11
- **Purpose:** critical review of the draft

**Prompt:**

```text
Review the draft below against my chosen question and scenario. Identify inaccuracies, missing reasoning, vague claims and unsupported assumptions.
For each concern, explain why it matters and how I could check it. Include a counterexample or alternative interpretation. Do not rewrite the answer yet.
Question: How do the eight principles of the ACM/IEEE-CS Software Engineering Code of Ethics (short version) apply to a small student team, and are the AI's example mappings for each principle correct?. Scenario: homeowners in Almaty looking for a renovation designer and freelance construction designers who publish portfolios; a three-student team builds a mobile app, BuildLink, that matches clients with designers and stores chats, floor plans and phone numbers; the team has eight weeks and no budget for an external security audit, and the app must work on low-cost Android phones with unstable internet; the risk is that a designer profile with fake portfolio photos or unverified qualifications misleads a client into an unsafe renovation. Draft:Topic 1.9: the ACM/IEEE-CS code of ethics applied to BuildLink

Facts (to confirm in the source)
The ACM/IEEE-CS Software Engineering Code of Ethics has a short version with eight principles: Public, Client and Employer, Product, Judgment, Management, Profession, Colleagues and Self. The principles are written as obligations of software engineers, and the public interest comes first. I am paraphrasing below, not quoting.

One example per principle
1. Public. Act in the public interest. A fake portfolio can lead a homeowner into an unsafe renovation, so the team should label unverified profiles clearly. This matches your ideas 1 and 2.
2. Client and Employer. Serve the client's interests, but only where this is consistent with the public interest. If a sponsor wants more designers listed quickly, the team should not skip checks to please them.
3. Product. Meet the highest professional standards possible. With no external audit, the team can still encrypt chats and phone numbers and test on a cheap Android phone with a weak connection. This supports your idea 3.
4. Judgment. Keep integrity and independence. The team says honestly that no security audit was done, even if this makes the app look weaker. This is your idea 4.
5. Management. Leaders promote an ethical approach. The student team lead plans the eight weeks so that profile checks are not the first task to be cut.
6. Profession. Protect the reputation of the profession. The team does not advertise BuildLink as "secure" or "verified" when it is not.
7. Colleagues. Be fair and supportive. Teammates review each other's code and credit each other's work.
8. Self. Keep learning. The team studies basic mobile security before storing floor plans.

Assumptions
BuildLink, the team and the timeline are fictional. I assume the team is a "company" only informally, that designers upload their own photos, and that the team cannot check building licences. Your idea 5 mixes ethical and legal responsibility: the code describes professional duties, it is not a law, and who is legally liable in Kazakhstan is outside what I can state.

Trade-offs
- Verification against deadline: manual checks of every portfolio may not fit in eight weeks. A cheaper option is an "unverified" badge plus a report button, which protects less but is honest.
- Encryption against low-cost phones: stronger protection can slow old devices and complicate offline use.
- Honesty against adoption: warning users about the missing audit may reduce sign-ups, but hiding it conflicts with Judgment and Public.

Claims you should verify
1. That the short version lists exactly these eight principles, in this order.
2. That the Client and Employer principle is limited by the public interest.
3. That the Product principle speaks of the highest professional standards possible.
4. That encryption noticeably slows low-cost Android phones. This is my assumption, not a sourced fact.
5. Any statement about legal liability under Kazakhstan law.
```

**Response:**

```text
Review of the draft (no rewrite)

1. Unclear "client and employer" (principle 2). The draft invents "a sponsor" who is not in your scenario. For a three-student team it is not obvious who the client or employer is: homeowners and designers are users, not paying clients. Why it matters: the example may not map to the principle at all. How to check: read the wording of principle 2 in the short version and decide who fits. Alternative interpretation: the "employer" is the course or instructor who set the eight-week deadline.

2. "The public interest comes first" is stated as fact. The short version lists Public first and limits some principles by the public interest, but an explicit priority rule should not be assumed. Why it matters: your idea 2 (checks over deadline) leans on it. How to check: read the short version and its preamble, and note exactly which principles mention the public interest.

3. Product: "encrypt chats and phone numbers" is vague. Encryption in transit, at rest, or end to end? The word "possible" in the principle also matters: what is possible for three students in eight weeks? Counterexample: home-made encryption written in a hurry can be less safe than a managed backend with standard HTTPS.

4. Judgment may be the wrong mapping. Telling users that no audit was done is about honesty toward the public and about the product, so it may fit Public or Product better. Judgment is about keeping professional judgment independent, for example a teammate refusing to mark a profile "verified" under deadline pressure. How to check: compare the wording of principles 1, 3 and 4.

5. The "unverified" badge is an unsupported fix. The draft assumes a label reduces harm. Counterexample: at launch every profile is unverified, so the badge becomes normal and users ignore it. How to check: treat it as an assumption, or test it with a few users.

6. "Encryption slows low-cost phones" is probably overstated and has no source. Why it matters: it is used as a trade-off against protecting data. How to check: measure on one cheap Android device, or remove the claim.

7. Missing reasoning. Principles 5, 7 and 8 get generic examples not tied to the fake-portfolio risk. The draft also ignores harm to honest designers (a report button can be abused against them), although your idea 1 names designers. Your idea 5 on responsibility is set aside instead of being linked to a principle; the legal part must stay labelled as unverified.
```

### B3 — Revision (Prompt C)

- **Tool:** Claude
- **Model:** claude-opus-5-5
- **Date:** 2026-10-12
- **Purpose:** revision using my decisions and verified evidence

**Prompt:**

```text
Revise the draft using my review decisions and source notes below. Keep the answer relevant to my scenario and preserve uncertainty where evidence is limited.

My decisions: Critique 1 accepted: the sponsor is not in my scenario, remove it; for a student team the client or employer is the course or instructor who set the deadline. Critique 2 accepted: soften "the public interest comes first", because the short version has no direct priority rule. Critique 3 partly accepted: clarify encryption briefly, standard HTTPS and a ready backend, no home-made encryption. Critique 4 partly accepted: keep the audit warning under Judgment because the principle names integrity, but also mention Public. Critique 5 accepted: an "unverified" badge alone is not enough when every profile is unverified at launch, so the first profiles need a manual check. Critique 6 accepted: remove the claim that encryption slows low-cost phones, there is no source. Critique 7 accepted: tie the examples to the fake-portfolio risk and add harm to honest designers from false reports. Verified evidence: Source: ACM/IEEE-CS Software Engineering Code of Ethics, Short Version, https://www.acm.org/code-of-ethics/software-engineering-code, accessed 2026-10-11. Note 1 (keep): the short version lists eight principles in this order: PUBLIC, CLIENT AND EMPLOYER, PRODUCT, JUDGMENT, MANAGEMENT, PROFESSION, COLLEAGUES, SELF, the same as the draft. Note 2 (qualify): principle 1 says software engineers shall act consistently with the public interest; principle 2 says best interests of their client and employer consistent with the public interest; principle 6 also says consistent with the public interest; none of the eight lines says that the public interest comes first. Note 3: principle 4 says software engineers shall maintain integrity and independence in their professional judgment. Draft: Topic 1.9: the ACM/IEEE-CS code of ethics applied to BuildLink

Facts (to confirm in the source)
The ACM/IEEE-CS Software Engineering Code of Ethics has a short version with eight principles: Public, Client and Employer, Product, Judgment, Management, Profession, Colleagues and Self. The principles are written as obligations of software engineers, and the public interest comes first. I am paraphrasing below, not quoting.

One example per principle
1. Public. Act in the public interest. A fake portfolio can lead a homeowner into an unsafe renovation, so the team should label unverified profiles clearly. This matches your ideas 1 and 2.
2. Client and Employer. Serve the client's interests, but only where this is consistent with the public interest. If a sponsor wants more designers listed quickly, the team should not skip checks to please them.
3. Product. Meet the highest professional standards possible. With no external audit, the team can still encrypt chats and phone numbers and test on a cheap Android phone with a weak connection. This supports your idea 3.
4. Judgment. Keep integrity and independence. The team says honestly that no security audit was done, even if this makes the app look weaker. This is your idea 4.
5. Management. Leaders promote an ethical approach. The student team lead plans the eight weeks so that profile checks are not the first task to be cut.
6. Profession. Protect the reputation of the profession. The team does not advertise BuildLink as "secure" or "verified" when it is not.
7. Colleagues. Be fair and supportive. Teammates review each other's code and credit each other's work.
8. Self. Keep learning. The team studies basic mobile security before storing floor plans.

Assumptions
BuildLink, the team and the timeline are fictional. I assume the team is a "company" only informally, that designers upload their own photos, and that the team cannot check building licences. Your idea 5 mixes ethical and legal responsibility: the code describes professional duties, it is not a law, and who is legally liable in Kazakhstan is outside what I can state.

Trade-offs
- Verification against deadline: manual checks of every portfolio may not fit in eight weeks. A cheaper option is an "unverified" badge plus a report button, which protects less but is honest.
- Encryption against low-cost phones: stronger protection can slow old devices and complicate offline use.
- Honesty against adoption: warning users about the missing audit may reduce sign-ups, but hiding it conflicts with Judgment and Public.

Claims you should verify
1. That the short version lists exactly these eight principles, in this order.
2. That the Client and Employer principle is limited by the public interest.
3. That the Product principle speaks of the highest professional standards possible.
4. That encryption noticeably slows low-cost Android phones. This is my assumption, not a sourced fact.
5. Any statement about legal liability under Kazakhstan law.

Show what you changed and why. Use only the sources I supplied. Flag remaining gaps instead of inventing details.
```

**Response:**

```text
Revised draft

Topic 1.9: the ACM/IEEE-CS code of ethics applied to BuildLink

Fact checked in your source
The short version of the ACM/IEEE-CS Software Engineering Code of Ethics lists eight principles in this order: Public, Client and Employer, Product, Judgment, Management, Profession, Colleagues, Self (your note 1). Public is listed first, and principles 2 and 6 are limited by the words "consistent with the public interest", but none of the eight lines says that the public interest outranks the others (your note 2). So your idea 2, checks before deadline, is a reasonable reading, not a rule stated in the short version.

One example per principle
1. Public. A fake portfolio can lead a homeowner into an unsafe renovation. The team manually checks the first designer profiles before launch and marks the rest as unverified.
2. Client and Employer. For a student team the employer is the course or instructor who set the eight-week deadline. The team serves that deadline only as far as it is consistent with the public interest: it cuts features, not profile checks.
3. Product. With no external audit, the team uses standard HTTPS and a ready backend for chats, floor plans and phone numbers, writes no encryption of its own, and tests on a low-cost Android phone with unstable internet.
4. Judgment. Principle 4 names integrity and independence (your note 3). The team states honestly that no security audit was done, and no teammate marks a profile "verified" just because the deadline is close. The warning also serves Public.
5. Management. The team lead plans the eight weeks so that the manual profile check has a fixed slot and is not the first task to be dropped.
6. Profession. The team does not advertise BuildLink as "secure" or "verified" when it is not.
7. Colleagues. Teammates review each other's work on the profile check and the report flow. Honest designers also need fair treatment: a report button can be abused, so a reported profile is reviewed before it is hidden. Whether designers count as "colleagues" in the code's sense is uncertain.
8. Self. The team learns basic mobile data protection before it stores floor plans.

Trade-offs
- Verification against deadline: checking every portfolio by hand may not fit in eight weeks. Checking the first profiles and labelling the rest protects less, but it is honest and possible.
- Honesty against adoption: the audit warning may reduce sign-ups, but hiding it conflicts with Judgment and Public.

What I changed and why
- Removed the sponsor and named the course or instructor as employer (critique 1).
- Replaced "the public interest comes first" with what the source shows (critique 2, note 2).
- Replaced "encrypt" with HTTPS and a ready backend (critique 3).
- Kept the audit warning under Judgment and linked it to Public (critique 4, note 3).
- Added a manual check of the first profiles, because a badge alone is weak (critique 5).
- Deleted the claim that encryption slows low-cost phones (critique 6).
- Tied examples 5, 7 and 8 to the risk and added false reports against designers (critique 7).

Remaining gaps
- Your source covers only the eight short lines. The full version and its preamble were not supplied.
- Legal liability under Kazakhstan law is unverified.
- How many profiles three students can check by hand is unknown.
- The wording of principles 3, 5, 7 and 8 was not in your notes, so those examples rest on the principle names only.
```

## 9. Appendix C — Evidence tables

### Verification table

<!-- At least two complete rows. Source and locator: title + page / slide / section / chapter,
     or title + URL + access date (YYYY-MM-DD). Decision: keep, qualify or reject — one word. -->

| AI claim | Source and locator | Evidence found | Decision |
| --- | --- | --- | --- |
| "The ACM/IEEE-CS Software Engineering Code of Ethics has a short version with eight principles: Public, Client and Employer, Product, Judgment, Management, Profession, Colleagues and Self." | The Software Engineering Code of Ethics and Professional Practice, Short Version, principles 1-8, https://www.acm.org/code-of-ethics/software-engineering-code, accessed 2026-10-11 | The page lists the same eight principles in the same order as the draft. | keep |
| "the public interest comes first" | The Software Engineering Code of Ethics and Professional Practice, Short Version, principle 1, principle 2 and principle 6, https://www.acm.org/code-of-ethics/software-engineering-code, accessed 2026-10-11 | Public is listed first, and principles 2 and 6 say "consistent with the public interest", but no line says that the public interest has priority over the other principles. | qualify |

### Change log

<!-- At least two substantive revisions. Your final version must differ from the AI wording,
     and the reason must say which evidence or scenario constraint made you change it. -->

| AI wording / suggestion | Your final version | Reason for change |
| --- | --- | --- |
| "The principles are written as obligations of software engineers, and the public interest comes first." | Public is listed first and principles 2 and 6 are limited by the public interest, but the short version states no priority, so "checks before deadline" is my own reading of principles 1 and 2. | Verification row 2: the eight lines on the ACM page contain no priority rule. |
| "Encryption against low-cost phones: stronger protection can slow old devices and complicate offline use." | Claim removed. The team uses standard HTTPS and a ready backend and writes no encryption of its own. | No source and no device test for the claim; scenario constraints: no audit budget and low-cost Android phones. |
