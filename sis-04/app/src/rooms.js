// rooms.js - the room catalog. Data only: no rules, no DOM.
// All rooms and bookings are fictional. Times are minutes after midnight (600 = 10:00).

/**
 * @typedef {{ start: number, end: number }} Booking
 * @typedef {{
 *   id: string,
 *   name: string,
 *   capacity: number,
 *   equipment: string[],
 *   blocked: boolean,
 *   bookings: Booking[]
 * }} Room
 */

/** @type {Room[]} */
export const ROOMS = [
  {
    id: "A101",
    name: "Lecture Hall",
    capacity: 80,
    equipment: ["projector", "microphone"],
    blocked: false,
    bookings: [{ start: 600, end: 660 }],
  },
  {
    id: "B204",
    name: "Seminar Room",
    capacity: 24,
    equipment: ["projector", "whiteboard"],
    blocked: false,
    bookings: [{ start: 540, end: 600 }, { start: 780, end: 840 }],
  },
  {
    id: "C310",
    name: "Computer Lab",
    capacity: 30,
    equipment: ["computers", "projector", "whiteboard"],
    blocked: true,
    bookings: [],
  },
  {
    id: "D115",
    name: "Study Room",
    capacity: 6,
    equipment: ["whiteboard"],
    blocked: false,
    bookings: [{ start: 660, end: 720 }],
  },
  {
    id: "E220",
    name: "Meeting Room",
    capacity: 12,
    equipment: ["projector", "whiteboard", "video-call"],
    blocked: false,
    bookings: [{ start: 600, end: 690 }],
  },
];
