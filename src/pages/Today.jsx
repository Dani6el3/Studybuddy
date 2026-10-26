import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Play,
  Sparkles,
  BookOpen,
  Flame,
} from "lucide-react";
import { cycle, sessionsFor, dateKey, minutes, duration } from "../lib/study";
import { PageHead } from "../components/UI";
export default function Today({ data, update, startTimer }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const state = cycle(now, data.startDate);
  const sessions = sessionsFor(now);
  const done = sessions.filter((s) => data.sessions[s.id]).length;
  const current = now.getHours() * 60 + now.getMinutes();
  return (
    <>
      <PageHead
        eyebrow="YOUR DAILY DOSE OF PROGRESS"
        title={
          now.getHours() < 12
            ? "Good morning, scholar."
            : now.getHours() < 17
              ? "Good afternoon, scholar."
              : "Good evening, scholar."
        }
      >
        A fresh opportunity to understand a little more.
      </PageHead>
      <div className="today-layout">
        <div className="today-primary">
          <section className="hero">
            <div>
              <div className="hero-tag">
                <span className="live-dot" /> YOUR STUDY PLAN
              </div>
              <h2>
                Small steps.
                <br />
                Stronger understanding.
              </h2>
              <p>
                You don’t have to learn it all today.
                <br />
                Just make time for what’s next.
              </p>
              <div className="hero-pills">
                <span>Week {state.week}</span>
                <span>{state.mode.name} mode</span>
                <span>Topic {state.topic + 1} of 4</span>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="book-art">
                <BookOpen size={72} strokeWidth={1.2} />
                <span>
                  one page
                  <br />
                  at a time
                </span>
              </div>
              <Sparkles className="sparkle" size={30} />
              <span className="art-dot" />
            </div>
          </section>
          {state.beforeStart && (
            <p className="notice">
              Your semester starts {data.startDate}. This is a preview of week
              1.
            </p>
          )}
          <div className="section-heading">
            <div>
              <h2>
                Today’s sessions{" "}
                <span className="count-badge">{sessions.length}</span>
              </h2>
              <p>
                {now.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <a className="text-link" href="#week">
              View week <ArrowRight size={16} />
            </a>
          </div>
          <div className="sessions">
            {sessions.map((s, i) => {
              const active =
                current >= minutes(s.start) && current < minutes(s.end);
              const complete = !!data.sessions[s.id];
              return (
                <article
                  key={s.id}
                  className={`session-card ${active ? "current" : ""} ${complete ? "complete" : ""}`}
                >
                  <div className="session-top">
                    <span className={`session-number tone-${i}`}>
                      {i === 0 ? "AM" : i === 1 ? "PM" : "+"}
                    </span>
                    <div>
                      <span className="eyebrow">{s.label}</span>
                      <p className="time-line">
                        <Clock3 size={14} />
                        {s.start} – {s.end}
                        <span>· {duration(s)} min</span>
                      </p>
                    </div>
                    {active && <span className="now-badge">NOW</span>}
                    {complete && (
                      <span className="done-badge">
                        <Check size={15} />
                        Done
                      </span>
                    )}
                  </div>
                  {s.courses.map((c) => (
                    <div className="session-topic" key={c.code}>
                      <span className="course-chip">{c.code}</span>
                      <h3>{c.topics[state.topic]}</h3>
                    </div>
                  ))}
                  {!s.courses.length && <h3>Plan the week + one case study</h3>}
                  <p className="task">
                    <Sparkles size={15} />
                    <span>
                      {s.label === "Past questions"
                        ? "Work through past questions, mark and correct your answers."
                        : s.courses.length
                          ? state.mode.task
                          : "Choose your priorities for the coming week, then work through one case study."}
                    </span>
                  </p>
                  <div className="session-actions">
                    <button
                      className="primary"
                      onClick={() => startTimer(duration(s), s.label, s.id)}
                    >
                      <Play size={15} />
                      Start timer
                    </button>
                    <a
                      className="button"
                      href={
                        s.courses.length
                          ? `#courses/${encodeURIComponent(s.courses[0].code)}/${state.topic}`
                          : "#courses"
                      }
                    >
                      <BookOpen size={15} />
                      Open resources
                    </a>
                    <button
                      className="done-button"
                      aria-pressed={complete}
                      onClick={() =>
                        update((d) => {
                          const next = { ...d.sessions };
                          if (next[s.id]) delete next[s.id];
                          else next[s.id] = { date: dateKey(now) };
                          return { ...d, sessions: next };
                        })
                      }
                    >
                      <Check size={16} />
                      {complete ? "Undo" : "Mark done"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <aside className="today-aside">
          <section className="card daily-progress">
            <span className="eyebrow">TODAY, AT A GLANCE</span>
            <div
              className="progress-ring"
              style={{ "--progress": `${(done / sessions.length) * 100}%` }}
            >
              <div>
                <strong>
                  {done}
                  <small> / {sessions.length}</small>
                </strong>
                <span>sessions done</span>
              </div>
            </div>
            <h3>
              {done === sessions.length
                ? "You showed up. Well done."
                : "Make room for progress."}
            </h3>
            <p className="muted">
              Every focused session brings you a little closer.
            </p>
            <div className="stat-row">
              <Clock3 size={17} />
              <span>Planned focus</span>
              <strong>
                {sessions.reduce((n, s) => n + duration(s), 0)} min
              </strong>
            </div>
            <div className="stat-row">
              <BookOpen size={17} />
              <span>Today’s courses</span>
              <strong>{new Set(sessions.flatMap((s) => s.codes)).size}</strong>
            </div>
          </section>
          <section className="tip-card">
            <span className="tip-icon">
              <Sparkles size={21} />
            </span>
            <p className="eyebrow">THE ACTIVE RECALL HABIT</p>
            <h3>
              Close the book.
              <br />
              Open your memory.
            </h3>
            <p>
              After reading, write down what you remember. The effort of
              recalling is where learning sticks.
            </p>
            <span className="tip-foot">
              A little effort. A lasting difference.
            </span>
          </section>
          <a className="course-shortcut" href="#courses">
            <span>
              <strong>Your course library</strong>
              <small>6 courses. One place to learn.</small>
            </span>
            <ArrowRight size={21} />
          </a>
        </aside>
      </div>
    </>
  );
}
