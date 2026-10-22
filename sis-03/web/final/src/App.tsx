import { useMemo, useState } from "react";
import { Clock, DoorClosed, CheckCircle2, XCircle, Lock, Info, Calendar } from "lucide-react";

type Booking = { start: number; end: number; label: string };

const NOW = 9 * 60; // 09:00 fixed
const ROOM = "Room 204";

const PRIMARY_BOOKING: Booking = { start: 10 * 60, end: 11 * 60, label: "10:00 – 11:00" };
const SECONDARY_BOOKING: Booking = { start: 11 * 60 + 40, end: 12 * 60 + 40, label: "11:40 – 12:40" };

function toMinutes(time: string): number | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function toHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const mm = min % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

type Result =
  | { status: "available" }
  | { status: "unavailable"; reason: string };

function checkAvailability(
  start: number,
  end: number,
  blocked: boolean,
  bookings: Booking[],
): Result {
  if (blocked) {
    return { status: "unavailable", reason: `${ROOM} is currently blocked and cannot be booked.` };
  }
  if (start < 0 || end > 1440 || start >= end) {
    return { status: "unavailable", reason: "Times must be valid: start before end, between 00:00 and 24:00." };
  }
  if (start <= NOW) {
    return { status: "unavailable", reason: `Start time must be after the current time (${toHHMM(NOW)}).` };
  }
  if (end - start > 120) {
    return { status: "unavailable", reason: `Booking duration is ${end - start} minutes. The maximum allowed is 120 minutes.` };
  }
  for (const b of bookings) {
    // overlap if start < b.end && b.start < end; touching endpoints allowed
    if (start < b.end && b.start < end) {
      return { status: "unavailable", reason: `Overlaps an existing booking (${b.label}).` };
    }
  }
  return { status: "available" };
}

export default function App() {
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("12:00");
  const [midnight, setMidnight] = useState(false);
  const [includeSecond, setIncludeSecond] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const bookings = useMemo<Booking[]>(
    () => (includeSecond ? [PRIMARY_BOOKING, SECONDARY_BOOKING] : [PRIMARY_BOOKING]),
    [includeSecond],
  );

  function handleCheck() {
    const s = toMinutes(startTime);
    if (s === null) {
      setResult({ status: "unavailable", reason: "Please enter valid times in HH:MM format." });
      return;
    }
    const e = midnight ? 1440 : toMinutes(endTime);
    if (e === null) {
      setResult({ status: "unavailable", reason: "Please enter valid times in HH:MM format." });
      return;
    }
    setResult(checkAvailability(s, e, blocked, bookings));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <DoorClosed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Smart Campus Room Availability Checker</h1>
              <p className="text-sm text-slate-500">Check a room's availability before booking.</p>
            </div>
          </div>
        </header>

        {/* Room card */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Selected room</p>
                <p className="text-lg font-semibold">{ROOM}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">Current time: {toHHMM(NOW)}</span>
            </div>
          </div>

          {/* Bookings today */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Bookings today</p>
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li key={b.label} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span className="font-medium text-slate-700">{b.label}</span>
                  <span className="text-slate-400">· booked</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Controls card */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Check a time slot</h2>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">Start time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
            setStartTime(e.target.value);
            setResult(null);
          }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">End time</span>
              <input
                type="time"
                value={endTime}
                disabled={midnight}
                onChange={(e) => {
            setEndTime(e.target.value);
            setResult(null);
          }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:opacity-50"
              />
              <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={midnight}
                  onChange={(e) => {
                    setMidnight(e.target.checked);
                    setResult(null);
                  }}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                />
                Ends at midnight (24:00)
              </label>
            </label>
          </div>

          <div className="mt-5 space-y-3">
            {/* Test data checkbox */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100">
              <input
                type="checkbox"
                checked={includeSecond}
                onChange={(e) => {
            setIncludeSecond(e.target.checked);
            setResult(null);
          }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
              />
              <span className="text-sm text-slate-700">
                Include test booking <span className="font-medium">11:40 – 12:40</span>
              </span>
            </label>

            {/* Room blocked toggle */}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <label htmlFor="blocked" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Lock className="h-4 w-4 text-slate-500" />
                Room blocked
              </label>
              <button
                id="blocked"
                type="button"
                role="switch"
                aria-checked={blocked}
                onClick={() => {
            setBlocked((v) => !v);
            setResult(null);
          }}
                className={`relative h-6 w-11 rounded-full transition-colors ${blocked ? "bg-rose-500" : "bg-slate-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${blocked ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheck}
            className="mt-5 w-full rounded-lg bg-sky-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99]"
          >
            Check availability
          </button>
        </section>

        {/* Result */}
        {result && (
          <section
            className={`rounded-2xl border p-5 shadow-sm transition ${
              result.status === "available"
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.status === "available" ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-rose-600" />
              )}
              <div>
                <p
                  className={`text-lg font-semibold ${result.status === "available" ? "text-emerald-700" : "text-rose-700"}`}
                >
                  {result.status === "available" ? "Available" : "Unavailable"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {result.status === "available"
                    ? `${ROOM} is free from ${startTime} to ${midnight ? "24:00" : endTime}. You can proceed to book it.`
                    : result.reason}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Helper note */}
        <p className="mt-5 flex items-start gap-2 text-xs text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          This tool only checks availability. It does not create, save, or confirm any booking.
        </p>
      </div>
    </div>
  );
}
