import test from "node:test";
import assert from "node:assert/strict";
import { freshData, validateData } from "../src/lib/storage.js";
import {
  editableSchedule,
  validateSchedule,
  dueReminders,
  calendarFile,
} from "../src/lib/schedule.js";
import { sessionsFor } from "../src/lib/study.js";

test("custom sessions are sorted and have stable completion IDs after removal", () => {
  const d = freshData();
  d.customSchedule = Array.from({ length: 7 }, () => []);
  const a = {
    id: "a",
    label: "Evening recall",
    start: "18:00",
    end: "19:00",
    codes: ["CPY 503"],
  };
  const b = {
    id: "b",
    label: "Morning read",
    start: "06:00",
    end: "07:00",
    codes: [],
  };
  d.customSchedule[1] = [a, b];
  validateSchedule(d.customSchedule);
  const now = new Date("2026-10-26T12:00:00");
  assert.deepEqual(
    sessionsFor(now, d.customSchedule).map((s) => s.id),
    ["2026-10-26:b", "2026-10-26:a"],
  );
  d.customSchedule[1] = [a];
  assert.equal(sessionsFor(now, d.customSchedule)[0].id, "2026-10-26:a");
  assert.deepEqual(validateData(JSON.parse(JSON.stringify(d))), d);
});
test("editor starts with the original schedule without changing its session IDs", () => {
  const d = freshData();
  const custom = editableSchedule(d);
  const now = new Date("2026-10-26T12:00:00");
  assert.deepEqual(
    sessionsFor(now, custom).map((s) => s.id),
    sessionsFor(now).map((s) => s.id),
  );
});
test("overlapping sessions and invalid imported schedules are rejected", () => {
  const week = Array.from({ length: 7 }, () => []);
  week[1] = [
    { id: "a", label: "Study", start: "18:00", end: "19:00", codes: [] },
    { id: "b", label: "Study", start: "18:30", end: "19:30", codes: [] },
  ];
  assert.throws(() => validateSchedule(week), /overlap/);
  week[1][1].start = "19:00";
  validateSchedule(week);
  week[1][0].codes = ["unknown"];
  assert.throws(() => validateSchedule(week));
  assert.throws(() =>
    validateData({
      ...freshData(),
      reminders: { enabled: true, leadMinutes: -5 },
    }),
  );
});
test("old backups migrate without losing notes or requiring new fields", () => {
  const old = freshData();
  old.notes.x = "keep me";
  delete old.customSchedule;
  delete old.reminders;
  delete old.reminderHistory;
  const restored = validateData(old);
  assert.equal(restored.notes.x, "keep me");
  assert.equal(restored.customSchedule, null);
  assert.equal(restored.reminders.enabled, false);
});
test("reminders respect lead time, done sessions, deduplication and stale cutoff", () => {
  const d = freshData();
  d.reminders = { enabled: true, leadMinutes: 10 };
  let due = dueReminders(d, new Date("2026-10-26T05:50:00"));
  assert.equal(due.length, 1);
  assert.equal(due[0].codes[0], "CPY 503");
  d.reminderHistory[due[0].reminderKey] = Date.now();
  assert.equal(dueReminders(d, new Date("2026-10-26T05:51:00")).length, 0);
  d.reminderHistory = {};
  d.sessions[due[0].id] = { date: "2026-10-26" };
  assert.equal(dueReminders(d, new Date("2026-10-26T05:51:00")).length, 0);
  d.sessions = {};
  assert.equal(dueReminders(d, new Date("2026-10-26T05:49:59")).length, 0);
  assert.equal(dueReminders(d, new Date("2026-10-26T05:55:00")).length, 0);
});
test("reminders can cross midnight and do not fire when disabled", () => {
  const d = freshData();
  d.customSchedule = Array.from({ length: 7 }, () => []);
  d.customSchedule[2] = [
    {
      id: "night",
      label: "Night study",
      start: "00:05",
      end: "00:25",
      codes: [],
    },
  ];
  d.reminders = { enabled: true, leadMinutes: 10 };
  assert.equal(dueReminders(d, new Date("2026-10-26T23:55:00")).length, 1);
  d.reminders.enabled = false;
  assert.equal(dueReminders(d, new Date("2026-10-26T23:55:00")).length, 0);
});
test("calendar download includes local session times, escaped names and alarms", () => {
  const d = freshData();
  d.customSchedule = Array.from({ length: 7 }, () => []);
  d.customSchedule[1] = [
    {
      id: "a",
      label: "Review; enzymes, proteins",
      start: "18:00",
      end: "19:00",
      codes: ["CPY 505"],
    },
  ];
  d.reminders.leadMinutes = 15;
  const calendar = calendarFile(d, new Date("2026-10-26T12:00:00"));
  assert.match(calendar, /DTSTART:20261026T180000/);
  assert.match(calendar, /TRIGGER:-PT15M/);
  assert.match(calendar, /Review\\; enzymes\\, proteins/);
  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 4);
});
