import test from "node:test";
import assert from "node:assert/strict";
import { cycle, sessionsFor, youtubeId, remaining } from "../src/lib/study.js";
import {
  freshData,
  validateData,
  loadData,
  saveData,
} from "../src/lib/storage.js";
import { finishTimer } from "../src/lib/timer.js";
import { stats } from "../src/lib/progress.js";
test("semester weeks, topic wrap and modes", () => {
  for (const [date, week, topic, mode] of [
    ["2026-10-26", 1, 0, "Learn"],
    ["2026-11-16", 4, 3, "Learn"],
    ["2026-11-23", 5, 0, "Consolidate"],
    ["2026-12-21", 9, 0, "Exam drill"],
  ]) {
    const c = cycle(new Date(`${date}T12:00:00`));
    assert.equal(c.week, week);
    assert.equal(c.topic, topic);
    assert.equal(c.mode.name, mode);
  }
  assert.equal(cycle(new Date("2026-10-24T12:00:00")).beforeStart, true);
  assert.equal(cycle(new Date("2026-11-02T12:00:00"), "2026-11-02").week, 1);
});
test("Today schedule uses the right day, topics and Sunday times", () => {
  const mon = sessionsFor(new Date("2026-10-26T12:00:00"));
  assert.deepEqual(
    mon.map((s) => s.codes[0]),
    ["CPY 503", "CPY 507", "MLS 515"],
  );
  assert.equal(
    mon[0].courses[0].topics[cycle(new Date("2026-11-23T12:00:00")).topic],
    "Carbohydrate metabolism and the Oral Glucose Tolerance Test",
  );
  const sun = sessionsFor(new Date("2026-11-01T12:00:00"));
  assert.deepEqual(
    sun.map((s) => [s.start, s.end]),
    [
      ["07:30", "08:30"],
      ["08:30", "09:00"],
      ["09:00", "09:20"],
    ],
  );
  assert.equal(sessionsFor(new Date("2026-10-31T12:00:00")).length, 2);
});
test("YouTube URL parsing persists through JSON without hardcoded content", () => {
  const id = "abcdefghijk";
  for (const url of [
    `https://youtu.be/${id}`,
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtube.com/shorts/${id}`,
  ])
    assert.equal(youtubeId(url), id);
  assert.equal(youtubeId("https://example.com/watch?v=abcdefghijk"), null);
  assert.equal(youtubeId("javascript:alert(1)"), null);
});
test("timer finishes after several minutes suspended and logs only once", () => {
  let d = freshData();
  d.timer = {
    id: "focus1",
    label: "Test",
    totalMs: 5400000,
    remainingMs: 5400000,
    endsAt: 100000,
  };
  assert.equal(remaining(d.timer, 50000), 50000);
  const result = finishTimer(d, 700000);
  assert.equal(result.timer.remainingMs, 0);
  assert.equal(result.focusLog[0].minutes, 90);
  assert.equal(finishTimer(result, 800000).focusLog.length, 1);
  assert.equal(remaining({ endsAt: null, remainingMs: 1234 }, 999999), 1234);
});
test("backup round-trip restores all study content", () => {
  const d = freshData();
  d.notes["CPY 503:0"] = "Recall notes";
  d.links["CPY 503:0"] = [
    { id: "l1", title: "My resource", url: "https://youtu.be/abcdefghijk" },
  ];
  d.cards["CPY 503:0"] = [
    { id: "c1", question: "What?", answer: "Why.", status: "got it" },
  ];
  d.topics["CPY 503:0"] = true;
  d.sessions["2026-10-26:0"] = { date: "2026-10-26" };
  d.focusLog = [{ id: "t1", date: "2026-10-26", minutes: 90 }];
  assert.deepEqual(validateData(JSON.parse(JSON.stringify(d))), d);
  assert.throws(() => validateData({ version: 2 }));
  assert.throws(() => validateData({ ...d, startDate: "2026-02-31" }));
  assert.throws(() =>
    validateData({ ...d, cards: { x: [{ question: "bad" }] } }),
  );
});
test("storage failures are caught", () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        throw Error("blocked");
      },
      setItem() {
        throw Error("full");
      },
    },
  });
  assert.ok(loadData().error);
  assert.ok(saveData(freshData()));
});
test("streak, week count and focus minutes", () => {
  const d = freshData();
  d.sessions = {
    a: { date: "2026-10-25" },
    b: { date: "2026-10-26" },
    c: { date: "2026-10-26" },
  };
  d.focusLog = [
    { id: "a", minutes: 20 },
    { id: "b", minutes: 90 },
  ];
  assert.deepEqual(stats(d, new Date("2026-10-26T12:00:00")), {
    streak: 2,
    weekSessions: 2,
    minutes: 110,
  });
});
