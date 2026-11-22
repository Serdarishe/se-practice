import { checkBooking } from './booking.js';

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

// The rules live only in booking.js. This only turns the rule that checkBooking reports
// into the message to show (same texts as in Week 06).
function reasonFor(check, start, end, current) {
  switch (check.rule) {
    case "interval": return "The end time must be later than the start time (AC1).";
    case "past":     return "The start time must be after the current time " + toHHMM(current) + " (AC1).";
    case "duration": return "The booking is " + (end - start) + " minutes; the limit is 120 minutes (AC2).";
    case "blocked":  return "This room is blocked (AC3).";
    case "overlap":  return "Overlaps the existing booking " + toHHMM(check.booking.start) + " - " + toHHMM(check.booking.end) + " (AC4).";
    default:         return "Unavailable.";
  }
}

document.getElementById("check").addEventListener("click", () => {
  const room = rooms.find(r => r.id === roomSelect.value);
  // AC6: an empty time field gets its own message instead of a misleading AC1 reason.
  const empty = [["now", "current time"], ["start", "start time"], ["end", "end time"]]
    .filter(([id]) => !document.getElementById(id).value).map(([, label]) => label);
  if (empty.length) {
    document.getElementById("result").innerHTML =
      '<div class="result no" role="alert">Please fill in the ' + empty.join(" and the ") + '.' +
      '<div class="reason">No decision was made - a time field is empty.</div></div>';
    return;
  }
  const start = toMinutes(document.getElementById("start").value);
  const end = toMinutes(document.getElementById("end").value);
  const current = toMinutes(document.getElementById("now").value);
  const check = checkBooking({ start, end, now: current, blocked: room.blocked, bookings: room.bookings });
  const ok = check.ok;
  const reason = ok ? "No conflicts. Nothing has been saved - this only checks availability."
                    : reasonFor(check, start, end, current);
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
