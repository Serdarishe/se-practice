// view.js - presentation only: turns data and decisions into HTML text.
// No room data and no booking or filter rule lives here; it only formats what it is given.

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(min) {
  return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
}

// Text from data goes through this before it becomes HTML.
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function slot(b) {
  return toHHMM(b.start) + " - " + toHHMM(b.end);
}

// One checkbox per equipment name; `checked` is the list the user has ticked.
export function equipmentBoxes(names, checked) {
  return names.map((name) =>
    '<label class="chip"><input type="checkbox" name="equipment" value="' + esc(name) + '"' +
    (checked.includes(name) ? " checked" : "") + "> " + esc(name) + "</label>").join("");
}

// One selectable card per room. The room list itself comes from filterRooms.
export function roomCard(room, selected) {
  const bookings = room.bookings.length ? room.bookings.map(slot).join(", ") : "none";
  return '<label class="room' + (selected ? " selected" : "") + '">' +
    '<input type="radio" name="room" value="' + esc(room.id) + '"' + (selected ? " checked" : "") + ">" +
    '<span class="room-body">' +
      '<span class="room-title">' + esc(room.id) + " - " + esc(room.name) +
        (room.blocked ? ' <span class="tag">Blocked</span>' : "") + "</span>" +
      '<span class="room-meta">Seats ' + esc(room.capacity) + " · " + esc(room.equipment.join(", ")) + "</span>" +
      '<span class="room-meta">Booked today: ' + esc(bookings) + "</span>" +
    "</span></label>";
}

// F4: the empty state names the filter the user chose, so they know what to relax.
export function emptyState({ attendees, equipment }) {
  const needs = attendees + (attendees === 1 ? " person" : " people") +
    (equipment.length ? " with " + equipment.join(" + ") : "");
  return '<div class="empty" role="status"><b>No rooms match your filter.</b>' +
    "<div>Nothing in the catalog fits " + esc(needs) + ". Try fewer people or fewer equipment items.</div></div>";
}

// Turns the reason from unavailableReason into the Week 06 texts. It checks no rule itself.
export function reasonText(reason) {
  switch (reason.code) {
    case "AC1_ORDER": return "The end time must be later than the start time (AC1).";
    case "AC1_PAST": return "The start time must be after the current time " + toHHMM(reason.now) + " (AC1).";
    case "AC2": return "The booking is " + reason.minutes + " minutes; the limit is 120 minutes (AC2).";
    case "AC3": return "This room is blocked (AC3).";
    case "AC4": return "Overlaps the existing booking " + slot(reason.booking) + " (AC4).";
    case "NO_ROOM": return "Choose a room first.";
    default: return "Unavailable.";
  }
}

// The one place that draws a result box: kind is "ok" or "no".
export function resultBox(kind, title, detail) {
  return '<div class="result ' + kind + '"><span class="result-title">' + esc(title) + "</span>" +
    '<div class="reason">' + esc(detail) + "</div></div>";
}
