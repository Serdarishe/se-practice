# AI Usage — SIS 03

## 1. AI Tools Used

For this assignment, I used three AI tools:

- **ChatGPT:** Helped me plan the Python function, generate code, review the logic, identify bugs, and suggest fixes.
- **Claude:** Helped me review and understand the code, analyze possible problems, and improve the implementation.
- **Bolt.new:** Generated the Room Availability Checker web page based on my prompt.

I used AI to speed up development, but I checked the results and tested the code myself.

## 2. AI Exchanges

### Exchange 1 — Plan

**Tool:** ChatGPT

**My prompt:**  
"Create a short plan for a Python function called can_book(start, end, now, blocked, existing). Explain the checks, assumptions, and boundary tests before writing code."

**AI response:**  
AI suggested checking valid times, maximum duration, blocked status, and overlapping bookings.

**My decision:** Accepted the plan because it followed the acceptance criteria.

### Exchange 2 — Generate

**Tools:** ChatGPT and Bolt.new

**Task:** Generate the Python booking function and create a React page following AC1–AC6 without login, backend, or database.

**AI response:**  
ChatGPT generated the Python function, and Bolt.new created the web interface with time inputs, booking checks, and availability messages.

**My decision:** I used the generated versions as starting points and tested them before making improvements.

### Exchange 3 — Critique

**Tools:** ChatGPT and Claude

**Task:** Review the Python function and React page against AC1–AC6 and identify possible defects.

**AI response:**  
AI identified possible validation problems, outdated availability results, and mobile layout issues. It also suggested checking the `now` parameter.

**My decision:** I compared the suggestions with the requirements and checked which changes were necessary.

### Exchange 4 — Repair

**Tools:** Claude and Bolt.new

**Task:** Fix existing problems without adding new features.

**AI response:**  
AI suggested clearing old availability results after changing inputs, supporting 24:00 as an end time, and improving the layout for narrow screens.

**My decision:** I focused on the required fixes and avoided unnecessary features.

## 3. Problems and Risks

**Reliability:** The page could still show "Available" after the room was blocked. This could give users incorrect information.

**Usability:** Users could not enter 24:00 directly, and the time fields could be cut off on a 320px mobile screen.

**Security:** Bolt.new added a Supabase dependency that was not required for this project. Extra dependencies can introduce unnecessary security risks.

## 4. Rejected AI Suggestion

I rejected the suggestion to add preset time buttons because they were not required by AC1–AC6. I wanted to focus on correctness and usability instead of adding features.

## 5. Human Responsibility

AI can generate code quickly, but it does not guarantee correctness. I still needed to review the code, check permissions, test boundary cases, and verify the results.

I did not automatically accept every AI suggestion. I compared the suggestions with the assignment requirements before making changes.

## 6. Conclusion

ChatGPT helped me with step-by-step coding, Claude helped with code review and improvements, and Bolt.new made it easier to create the web interface.

I learned that AI can make development faster, but human testing and decision-making are still important. A page that looks complete may still contain bugs.