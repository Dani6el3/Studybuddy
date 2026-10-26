import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Bell, Check } from "lucide-react";
import { PageHead } from "../components/UI";
import { remaining, dateKey } from "../lib/study";
export default function Timer({ data, update, startTimer }) {
  const [now, setNow] = useState(Date.now());
  const [notification, setNotification] = useState("");
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    const refresh = () => setNow(Date.now());
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const t = data.timer;
  const ms = remaining(t, now);
  const seconds = Math.ceil(ms / 1000);
  const running = !!t?.endsAt;
  const pause = () =>
    update((d) => ({
      ...d,
      timer: { ...d.timer, remainingMs: remaining(d.timer), endsAt: null },
    }));
  return (
    <>
      <PageHead eyebrow="ONE THING AT A TIME" title="Make space to focus.">
        Settle in, put distractions aside, and give this session your attention.
      </PageHead>
      <section className="card timer-card">
        <p className="eyebrow">{t?.label || "YOUR NEXT FOCUS SESSION"}</p>
        <div
          className="timer-face"
          role="timer"
          aria-label={`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds remaining`}
        >
          <strong className="timer-digits">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </strong>
          <span className="muted">
            {t?.finished
              ? "Session complete. Well done."
              : running
                ? "You’re making progress."
                : ms > 0
                  ? "Paused. Take a breath."
                  : "Choose your focus time."}
          </span>
        </div>
        <div className="row">
          {[90, 20, 60, 30].map((min) => (
            <button
              key={min}
              onClick={() => {
                  startTimer(
                    min,
                    `${min === 90 ? "Deep focus" : min === 20 ? "Quick top-up" : "Focus session"}`,
                  );
              }}
            >
              {min} min
            </button>
          ))}
        </div>
        <div className="row section-gap">
          {running ? (
            <button className="primary" onClick={pause}>
              <Pause size={16} />
              Pause
            </button>
          ) : ms > 0 ? (
            <button
              className="primary"
              onClick={() =>
                update((d) => ({
                  ...d,
                  timer: {
                    ...d.timer,
                    endsAt: Date.now() + d.timer.remainingMs,
                  },
                }))
              }
            >
              <Play size={16} />
              Resume
            </button>
          ) : null}
          {t && (
            <button
              onClick={() => {
                if (confirm("Reset this timer?"))
                  update((d) => ({ ...d, timer: null }));
              }}
            >
              <RotateCcw size={16} />
              Reset timer
            </button>
          )}
          {t?.finished && t.sessionId && !data.sessions[t.sessionId] && (
            <button
              className="primary"
              onClick={() =>
                update((d) => ({
                  ...d,
                  sessions: {
                    ...d.sessions,
                    [t.sessionId]: {
                      date: t.sessionId.split(":")[0] || dateKey(),
                    },
                  },
                }))
              }
            >
              <Check size={16} />
              Mark session done
            </button>
          )}
        </div>
        <p className="section-copy section-gap">
          The timer uses a saved deadline, so it catches up after your phone
          locks or the tab sleeps. Completed sessions add to your study minutes.
        </p>
        <button
          onClick={async () => {
            if (!("Notification" in window)) {
              setNotification(
                "Notifications aren’t supported in this browser.",
              );
              return;
            }
            try {
              const result = await Notification.requestPermission();
              setNotification(
                result === "granted"
                  ? "Notifications enabled."
                  : "Notifications are not enabled. You can change this in your browser settings.",
              );
            } catch {
              setNotification(
                "This browser does not allow notification requests here.",
              );
            }
          }}
        >
          <Bell size={16} />
          Enable completion notifications
        </button>
        <p className="section-copy">
          A notification appears when the browser allows it. If the app is
          suspended or closed, it may appear only when you return.
        </p>
        <p role="status" className="status-message">
          {notification}
        </p>
      </section>
    </>
  );
}
