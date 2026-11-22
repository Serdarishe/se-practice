# AGENTS.md — Smart Campus Room Availability Checker

Instructions for any coding agent working in this project. Read this file before you change
anything, and follow it over any general habit of yours.

## Project

A plain JavaScript page (Vite) that tells a student whether a campus room is free for a
requested time. The booking rule lives in `src/booking.js` (`canBook`); the page is `index.html` with `src/main.js`;
the tests are in `src/booking.test.js`.

Use one fictional room with made-up bookings only; never real room names, timetables or KBTU portal data.

## Acceptance contract

- AC1 Reject start ≥ end and requests in the past.
- AC2 Enforce the maximum allowed duration (120 minutes).
- AC3 Reject a blocked room.
- AC4 Reject overlaps; allow bookings that only touch at endpoints.
- AC5 Return Available / Unavailable without changing booking data.
- AC6 Preserve clear UI feedback on desktop and mobile.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm test` (runs `vitest run`)
- Build: `npm run build`

## You may

- Edit any file in the project.
- Do not add packages without my approval.
- Keep bookings in memory: no login, no database, no Supabase or other backend.
- Never add secrets, API keys, tokens, passwords or .env files to the project.

## Before you finish

- Make sure the page still loads.
- Run `npm test` before proposing any change as done; all tests must pass, and paste the real output.
- Never deploy or publish the app anywhere (no Netlify, no `--prod`); a human decides about releases.
