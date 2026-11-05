import { canBook } from './booking.js';

const rooms = [
  { id: "A101", name: "A101 - Lecture Hall", blocked: false, bookings: [{ start: 600, end: 660 }] },
  { id: "B204", name: "B204 - Seminar Room", blocked: false, bookings: [{ start: 540, end: 600 }, { start: 780, end: 840 }] },
  { id: "C310", name: "C310 - Computer Lab", blocked: true, bookings: [] }
];

const roomSelect = document.getElementById("room");
rooms.forEach(r => {
  const o = document.createElement("option");
  o.value = r.id; o.textContent = r.name;
  roomSelect.appendChild(o);
});

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function toHHMM(min) {
  return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
}

function showRoom() {
  const room = rooms.find(r => r.id === roomSelect.value);
  document.getElementById("blocked").checked = room.blocked;
  const list = room.bookings.map(b => "<li>" + toHHMM(b.start) + " - " + toHHMM(b.end) + "</li>").join("");
  document.getElementById("roomInfo").innerHTML =
    (room.blocked ? '<span class="tag">Blocked</span>' : "") +
    "<div><b>Existing bookings:</b>" + (list ? "<ul>" + list + "</ul>" : " none") + "</div>";
}

// The decision comes from canBook. This only picks the message to show for an Unavailable
// result: the first rule that fails, in the order of AC1-AC4 (same texts as in Week 06).
function reasonFor(room, start, end, current) {
  if (!(start >= 0 && start < end && end <= 1440))
    return "The end time must be later than the start time (AC1).";
  if (start <= current)
    return "The start time must be after the current time " + toHHMM(current) + " (AC1).";
  if (end - start > 120)
    return "The booking is " + (end - start) + " minutes; the limit is 120 minutes (AC2).";
  if (room.blocked)
    return "This room is blocked (AC3).";
  const b = room.bookings.find(b => start < b.end && b.start < end);
  if (b)
    return "Overlaps the existing booking " + toHHMM(b.start) + " - " + toHHMM(b.end) + " (AC4).";
  return "Unavailable.";
}

document.getElementById("check").addEventListener("click", () => {
  const room = rooms.find(r => r.id === roomSelect.value);
  const start = toMinutes(document.getElementById("start").value);
  const end = toMinutes(document.getElementById("end").value);
  const current = toMinutes(document.getElementById("now").value);
  const ok = canBook({ start, end, now: current, blocked: room.blocked, bookings: room.bookings });
  const reason = ok ? "No conflicts. Nothing has been saved - this only checks availability."
                    : reasonFor(room, start, end, current);
  document.getElementById("result").innerHTML =
    '<div class="result ' + (ok ? "ok" : "no") + '" role="status">' + (ok ? "Available" : "Unavailable") +
    '<div class="reason">' + reason + "</div></div>";
});

roomSelect.addEventListener("change", showRoom);
document.getElementById("blocked").addEventListener("change", e => {
  rooms.find(r => r.id === roomSelect.value).blocked = e.target.checked;
  showRoom();
});
showRoom();
