// main.js - wires the page together. It holds the user's choices (filter, selected room,
// whether a result is shown) but no room data and no rule: data from rooms.js, rules from
// booking.js and filter.js, HTML from view.js.
import { ROOMS } from "./rooms.js";
import { checkRoom, unavailableReason } from "./booking.js";
import { filterRooms, equipmentNames } from "./filter.js";
import { toMinutes, equipmentBoxes, roomCard, emptyState, reasonText, resultBox } from "./view.js";

const el = {
  attendees: document.getElementById("attendees"),
  equipment: document.getElementById("equipment"),
  rooms: document.getElementById("rooms"),
  count: document.getElementById("count"),
  now: document.getElementById("now"),
  start: document.getElementById("start"),
  end: document.getElementById("end"),
  check: document.getElementById("check"),
  result: document.getElementById("result"),
};

let selectedId = null;   // the chosen room, or null when no room matches the filter
let showing = false;     // is a result on screen? Then it is re-checked when the room changes (F5)

function criteria() {
  const attendees = Math.max(1, parseInt(el.attendees.value, 10) || 1);   // an empty field counts as 1
  const equipment = [...el.equipment.querySelectorAll("input:checked")].map((box) => box.value);
  return { attendees, equipment };
}

function renderRooms() {
  const wanted = criteria();
  const matches = filterRooms(ROOMS, wanted);
  if (!matches.some((room) => room.id === selectedId)) selectedId = matches.length ? matches[0].id : null;
  el.count.textContent = matches.length + " of " + ROOMS.length + " rooms match";
  el.rooms.innerHTML = matches.length
    ? matches.map((room) => roomCard(room, room.id === selectedId)).join("")
    : emptyState(wanted);
  el.check.disabled = !matches.length;
  refresh();
}

// F5: a result on screen always belongs to the room that is selected now.
function refresh() {
  if (!showing) return;
  if (selectedId) check();
  else {
    showing = false;
    el.result.innerHTML = "";
  }
}

function check() {
  showing = true;
  // AC6: an empty time field gets its own message instead of a misleading AC1 reason.
  const empty = [[el.now, "current time"], [el.start, "start time"], [el.end, "end time"]]
    .filter(([input]) => !input.value).map(([, label]) => label);
  if (empty.length) {
    el.result.innerHTML = resultBox("no", "Please fill in the " + empty.join(" and the ") + ".",
      "No decision was made - a time field is empty.");
    return;
  }
  const request = { start: toMinutes(el.start.value), end: toMinutes(el.end.value), now: toMinutes(el.now.value) };
  el.result.innerHTML = checkRoom(ROOMS, selectedId, request)
    ? resultBox("ok", selectedId + ": Available", "No conflicts. Nothing has been saved - this only checks availability.")
    : resultBox("no", selectedId + ": Unavailable", reasonText(unavailableReason(ROOMS, selectedId, request)));
}

el.equipment.innerHTML = equipmentBoxes(equipmentNames(ROOMS), []);
el.attendees.addEventListener("input", renderRooms);
el.equipment.addEventListener("change", renderRooms);
el.rooms.addEventListener("change", (e) => {
  selectedId = e.target.value;
  renderRooms();
});
for (const input of [el.now, el.start, el.end]) input.addEventListener("input", refresh);
el.check.addEventListener("click", check);
renderRooms();
