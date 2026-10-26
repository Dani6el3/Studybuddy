import { schedule, courses } from "../data/courses.js";
import { minutes, dateKey, sessionsFor } from "./study.js";

export const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const editableSchedule = (data) =>
  (data.customSchedule || schedule).map((day) =>
    day.map((s, i) => ({ ...s, id: s.id || String(i), codes: [...s.codes] })),
  );

export function validateSchedule(value) {
  if (!Array.isArray(value) || value.length !== 7)
    throw Error("A schedule must contain seven days.");
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  for (const day of value) {
    if (!Array.isArray(day) || day.length > 30)
      throw Error("Use up to 30 sessions per day.");
    const ids = new Set();
    for (const s of day) {
      if (
        !s ||
        typeof s.id !== "string" ||
        !s.id ||
        s.id.length > 100 ||
        ids.has(s.id) ||
        typeof s.label !== "string" ||
        !s.label.trim() ||
        s.label.length > 100 ||
        !time.test(s.start) ||
        !time.test(s.end) ||
        minutes(s.end) <= minutes(s.start) ||
        !Array.isArray(s.codes) ||
        s.codes.some((code) => !courses.some((c) => c.code === code))
      )
        throw Error(
          "Check session names, courses and times. End time must be later on the same day.",
        );
      ids.add(s.id);
    }
    const sorted = [...day].sort((a, b) => minutes(a.start) - minutes(b.start));
    for (let i = 1; i < sorted.length; i++)
      if (minutes(sorted[i].start) < minutes(sorted[i - 1].end))
        throw Error("Sessions on the same day cannot overlap.");
  }
  return value;
}

export function dueReminders(data, now = new Date()) {
  if (!data.reminders?.enabled || dateKey(now) < data.startDate) return [];
  const result = [];
  // Include tomorrow so an early reminder can cross midnight.
  for (let offset = 0; offset <= 1; offset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    for (const s of sessionsFor(date, data.customSchedule)) {
      const [h, m] = s.start.split(":").map(Number);
      const start = new Date(date);
      start.setHours(h, m, 0, 0);
      const due = start.getTime() - data.reminders.leadMinutes * 60000;
      const key = `${s.id}@${s.start}:${data.reminders.leadMinutes}`;
      if (
        !data.sessions[s.id] &&
        !data.reminderHistory[key] &&
        now.getTime() >= due &&
        now.getTime() - due < 300000
      )
        result.push({ ...s, reminderKey: key });
    }
  }
  return result;
}

const escapeICS = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
export function calendarFile(data, now = new Date()) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudyBuddy//Study Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  const stamp = (date) => dateKey(date).replaceAll("-", "");
  const first = new Date(`${data.startDate}T00:00:00`);
  if (first < now) first.setTime(now.getTime());
  for (let i = 0; i < 28; i++) {
    const date = new Date(first);
    date.setDate(first.getDate() + i);
    for (const s of sessionsFor(date, data.customSchedule)) {
      const start = new Date(`${dateKey(date)}T${s.start}:00`);
      if (start < now) continue;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${encodeURIComponent(s.id)}-${s.start.replace(":", "")}@studybuddy.local`,
        `DTSTAMP:${now
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}Z/, "Z")}`,
        `DTSTART:${stamp(date)}T${s.start.replace(":", "")}00`,
        `DTEND:${stamp(date)}T${s.end.replace(":", "")}00`,
        `SUMMARY:${escapeICS(`${s.label}${s.codes.length ? " · " + s.codes.join(" + ") : ""}`)}`,
        "DESCRIPTION:StudyBuddy study session. Open the app for this week’s topic.",
        "BEGIN:VALARM",
        `TRIGGER:-PT${data.reminders?.leadMinutes || 0}M`,
        "ACTION:DISPLAY",
        "DESCRIPTION:Time for your StudyBuddy session",
        "END:VALARM",
        "END:VEVENT",
      );
    }
  }
  lines.push("END:VCALENDAR");
  // RFC 5545 folds lines at 75 octets; keep Unicode characters intact.
  const encoder = new TextEncoder();
  return (
    lines
      .map((line) => {
        let out = "",
          width = 0;
        for (const character of line) {
          const bytes = encoder.encode(character).length;
          if (width + bytes > 74) {
            out += "\r\n ";
            width = 1;
          }
          out += character;
          width += bytes;
        }
        return out;
      })
      .join("\r\n") + "\r\n"
  );
}
