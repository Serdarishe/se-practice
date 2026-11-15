import { checkRoom, unavailableReason } from './booking.js';
import { ROOMS } from './rooms.js';

const rooms = ROOMS;

const roomSelect = document.getElementById("room");
rooms.forEach(r => {
  const o = document.createElement("option");
  o.value = r.id; o.textContent = r.id + " - " + r.name;
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

// The decision comes from checkRoom; unavailableReason only says which rule failed.
// This turns that reason into the same texts as in Week 06. No rule is checked here.
function reasonText(reason) {
  switch (reason.code) {
    case "AC1_ORDER": return "The end time must be later than the start time (AC1).";
    case "AC1_PAST": return "The start time must be after the current time " + toHHMM(reason.now) + " (AC1).";
    case "AC2": return "The booking is " + reason.minutes + " minutes; the limit is 120 minutes (AC2).";
    case "AC3": return "This room is blocked (AC3).";
    case "AC4": return "Overlaps the existing booking " + toHHMM(reason.booking.start) + " - " + toHHMM(reason.booking.end) + " (AC4).";
    default: return "Unavailable.";
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
  const request = { start, end, now: current };
  const ok = checkRoom(rooms, room.id, request);
  const reason = ok ? "No conflicts. Nothing has been saved - this only checks availability."
                    : reasonText(unavailableReason(rooms, room.id, request));
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
