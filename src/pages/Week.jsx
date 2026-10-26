import { cycle, sessionsFor, dateKey } from "../lib/study";
import { PageHead } from "../components/UI";
export default function Week({ data }) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const { week, mode } = cycle(now, data.startDate);
  return (
    <>
      <PageHead
        eyebrow={`WEEK ${week} · ${mode.name} MODE`}
        title="A rhythm you can keep."
      >
        Your recurring timetable. One focused session at a time.
      </PageHead>
      <a className="button primary" href="#settings">
        Create or edit study schedule
      </a>
      <div
        className={`week-grid section-gap ${data.customSchedule ? "custom-week" : ""}`}
      >
        <div className="week-row week-col-head">
          <span>DAY</span>
          <span>MORNING</span>
          <span>EVENING</span>
          <span>TOP-UP</span>
        </div>
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date(monday);
          date.setDate(monday.getDate() + i);
          const current = dateKey(date) === dateKey(now);
          return (
            <section
              key={i}
              className={`week-row ${current ? "today" : ""}`}
              aria-label={date.toLocaleDateString("en-GB", { weekday: "long" })}
            >
              <h3>
                {date.toLocaleDateString("en-GB", { weekday: "short" })}
                <small className="muted"> {date.getDate()}</small>
                {current && <span className="course-chip">Today</span>}
              </h3>
              {sessionsFor(date, data.customSchedule).map((s) => (
                <div className="week-cell" key={s.id}>
                  <small>
                    {s.start} – {s.end}
                    <br />
                    {s.label}
                  </small>
                  <div>
                    {s.courses.length
                      ? s.courses.map((c) => (
                          <a
                            className="block"
                            key={c.code}
                            href={`#courses/${encodeURIComponent(c.code)}/${cycle(date, data.startDate).topic}`}
                          >
                            {c.code}
                          </a>
                        ))
                      : s.label}
                  </div>
                </div>
              ))}
              {sessionsFor(date, data.customSchedule).length === 0 && (
                <div className="week-cell muted">Rest & recharge</div>
              )}
            </section>
          );
        })}
      </div>
      <p className="muted section-gap">
        {data.customSchedule
          ? "Your custom sessions repeat every week. Edit them in Settings."
          : "Sunday has its own morning routine: 07:30–08:30, 08:30–09:00, then 09:00–09:20. Saturday evenings are for past questions."}
      </p>
    </>
  );
}
