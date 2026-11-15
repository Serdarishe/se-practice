// filter.js - which rooms match the user's needs (F1, F2). No DOM, no data of its own.

// F1: capacity >= attendees.  F2: the room has ALL selected equipment items, not just one.
// Blocked rooms stay in the result; checkRoom never reports them as available (F3).
// Returns a new array and never changes the rooms (same idea as AC5).
export function filterRooms(rooms, { attendees, equipment = [] }) {
  return rooms.filter(
    (room) => room.capacity >= attendees && equipment.every((item) => room.equipment.includes(item))
  );
}

// Every equipment name that appears in the catalog, sorted, without repeats.
// The page builds its equipment checkboxes from this, so it never types the list by hand.
export function equipmentNames(rooms) {
  return [...new Set(rooms.flatMap((room) => room.equipment))].sort();
}
