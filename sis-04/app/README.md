# Smart Campus Room Availability Checker (SIS #04)

Plain JavaScript + Vite. Fictional rooms and bookings only: no login, no database, no network calls.

## Setup

```bash
cd sis-04/app
npm install
```

## Run

```bash
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

## Test

```bash
npx vitest run
```

(`npm test` runs the same thing.)

## Where things live

| File | What it does |
| --- | --- |
| `src/rooms.js` | the catalog: `Room` typedef and `ROOMS` (5 fictional rooms) |
| `src/booking.js` | `canBook` (AC1-AC5, unchanged since Week 07), `checkRoom` (one room of a catalog), `unavailableReason` (which rule failed) |
| `src/filter.js` | `filterRooms` (F1 capacity, F2 all equipment), `equipmentNames` |
| `src/view.js` | HTML for room cards, the empty state, the result box; time formatting |
| `src/main.js` | wires the page: reads the form, calls the rules, writes the HTML |
| `src/*.test.js` | Vitest tests: `booking.test.js` (Week 07/08), `checkRoom.test.js`, `filter.test.js`, `reason.test.js` |
