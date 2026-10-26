import { useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { courses } from "../data/courses";
import { editableSchedule, validateSchedule, dayNames } from "../lib/schedule";

const blank = () => ({
  id: null,
  label: "Study session",
  start: "18:00",
  end: "19:00",
  codes: [],
  days: [new Date().getDay()],
});
export default function ScheduleEditor({ data, update }) {
  const [draft, setDraft] = useState(null);
  const [original, setOriginal] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const weeks = editableSchedule(data);
  const open = (s, day) => {
    setDraft(s ? { ...s, codes: [...s.codes], days: [day] } : blank());
    setOriginal(s ? { day, id: s.id } : null);
    setError("");
    setMessage("");
  };
  const save = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      if (!draft.days.length) throw Error("Choose at least one day.");
      const next = editableSchedule(data);
      if (original)
        next[original.day] = next[original.day].filter(
          (s) => s.id !== original.id,
        );
      for (const day of draft.days)
        next[day].push({
          id: original?.day === day ? original.id : crypto.randomUUID(),
          label: draft.label.trim(),
          start: String(form.get("start")),
          end: String(form.get("end")),
          codes: [...draft.codes],
        });
      validateSchedule(next);
      update((d) => ({ ...d, customSchedule: next }));
      setDraft(null);
      setMessage(
        "Schedule saved. Today, Week and reminders now use your plan.",
      );
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <section className="card">
      <div className="row spread">
        <div>
          <h2>Your weekly schedule</h2>
          <p className="section-copy">
            Create a routine that repeats each week. Times follow this device’s
            local time.
          </p>
        </div>
        <button className="primary" onClick={() => open(null)}>
          <Plus size={16} />
          Add session
        </button>
      </div>
      {draft && (
        <form className="schedule-form section-gap" onSubmit={save}>
          <div className="row spread">
            <h3>{original ? "Edit session" : "New study session"}</h3>
            <button
              type="button"
              className="icon-button"
              aria-label="Cancel editing"
              onClick={() => setDraft(null)}
            >
              <X size={16} />
            </button>
          </div>
          <label className="field">
            Session name
            <input
              required
              maxLength={100}
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
          </label>
          <fieldset>
            <legend>Repeat on</legend>
            <div className="day-picker">
              {dayNames.map((name, i) => (
                <label key={name}>
                  <input
                    type="checkbox"
                    checked={draft.days.includes(i)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        days: e.target.checked
                          ? [...draft.days, i]
                          : draft.days.filter((d) => d !== i),
                      })
                    }
                  />
                  {name.slice(0, 3)}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid-cards">
            <label className="field">
              Start time
              <input
                type="time"
                key={`${original?.id || "new"}-start`}
                name="start"
                required
                defaultValue={draft.start}
              />
            </label>
            <label className="field">
              End time
              <input
                type="time"
                key={`${original?.id || "new"}-end`}
                name="end"
                required
                defaultValue={draft.end}
              />
            </label>
          </div>
          <fieldset>
            <legend>Courses (optional)</legend>
            <div className="course-picker">
              {courses.map((c) => (
                <label key={c.code}>
                  <input
                    type="checkbox"
                    checked={draft.codes.includes(c.code)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        codes: e.target.checked
                          ? [...draft.codes, c.code]
                          : draft.codes.filter((v) => v !== c.code),
                      })
                    }
                  />
                  {c.code} · {c.title}
                </label>
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="notice" role="alert">
              {error}
            </p>
          )}
          <button className="primary section-gap" type="submit">
            Save session
          </button>
        </form>
      )}
      {message && (
        <p role="status" className="status-message">
          {message}
        </p>
      )}
      <div className="section-gap">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => (
          <div className="schedule-day" key={day}>
            <h3>{dayNames[day]}</h3>
            {!weeks[day].length && (
              <p className="empty">No sessions. A little room to recharge.</p>
            )}
            {[...weeks[day]]
              .sort((a, b) => a.start.localeCompare(b.start))
              .map((s) => (
                <div className="schedule-entry" key={s.id}>
                  <div>
                    <strong>{s.label}</strong>
                    <small>
                      {s.start}–{s.end}
                      {s.codes.length ? ` · ${s.codes.join(" + ")}` : ""}
                    </small>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`Edit ${dayNames[day]} ${s.label}`}
                    onClick={() => open(s, day)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Delete ${dayNames[day]} ${s.label}`}
                    onClick={() => {
                      if (confirm(`Delete ${s.label} on ${dayNames[day]}?`)) {
                        const next = editableSchedule(data);
                        next[day] = next[day].filter((v) => v.id !== s.id);
                        update((d) => ({ ...d, customSchedule: next }));
                        setDraft(null);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>
      <button
        className="section-gap"
        onClick={() => {
          if (
            confirm(
              "Restore the original weekly timetable? This replaces your custom schedule.",
            )
          ) {
            update((d) => ({ ...d, customSchedule: null }));
            setDraft(null);
            setMessage("Original timetable restored.");
          }
        }}
      >
        Restore original timetable
      </button>
    </section>
  );
}
