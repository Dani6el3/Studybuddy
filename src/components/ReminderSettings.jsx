import { useState } from "react";
import { Bell, Download } from "lucide-react";
import { calendarFile } from "../lib/schedule";
export async function showStudyNotification(title, body, tag) {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return false;
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration)
      await registration.showNotification(title, {
        body,
        tag,
        icon: `${import.meta.env.BASE_URL}icon-192.png`,
      });
    else new Notification(title, { body, tag });
    return true;
  } catch {
    return false;
  }
}
export default function ReminderSettings({ data, update }) {
  const [message, setMessage] = useState("");
  const [permission, setPermission] = useState(() =>
    "Notification" in window ? Notification.permission : "unsupported",
  );
  const enable = async () => {
    try {
      if (!("Notification" in window)) {
        setMessage(
          "This browser does not support notifications. Use calendar reminders below.",
        );
        return;
      }
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        update((d) => ({ ...d, reminders: { ...d.reminders, enabled: true } }));
        setMessage(
          "Session reminders enabled. Keep StudyBuddy running to receive them.",
        );
      } else
        setMessage(
          "Notifications are not allowed. Change this site’s browser notification permission, or use calendar reminders.",
        );
    } catch {
      setMessage(
        "This browser could not enable notifications. On iPhone, install to the Home Screen first, then try from the installed app.",
      );
    }
  };
  return (
    <section className="card">
      <h2 className="section-title">
        <Bell size={21} />
        Study reminders
      </h2>
      <p className="section-copy">
        A nudge before each session in your weekly plan.
      </p>
      <label className="field">
        Remind me
        <select
          value={data.reminders.leadMinutes}
          onChange={(e) =>
            update((d) => ({
              ...d,
              reminders: {
                ...d.reminders,
                leadMinutes: Number(e.target.value),
              },
            }))
          }
        >
          {[0, 5, 10, 15, 30].map((m) => (
            <option key={m} value={m}>
              {m ? `${m} minutes before` : "At the start"}
            </option>
          ))}
        </select>
      </label>
      <div className="row">
        <button className="primary" onClick={enable}>
          <Bell size={16} />
          {data.reminders.enabled
            ? "Check notification permission"
            : "Enable session reminders"}
        </button>
        {data.reminders.enabled && (
          <button
            onClick={() => {
              update((d) => ({
                ...d,
                reminders: { ...d.reminders, enabled: false },
              }));
              setMessage("Session reminders paused.");
            }}
          >
            Pause reminders
          </button>
        )}
        <button
          disabled={permission !== "granted"}
          onClick={async () =>
            setMessage(
              (await showStudyNotification(
                "StudyBuddy test reminder",
                "Your study notifications are working.",
                "studybuddy-test",
              ))
                ? "Test notification sent."
                : "Notification could not be shown. Check your browser and device settings.",
            )
          }
        >
          Send test notification
        </button>
      </div>
      <p className="status-message">
        Reminders: {data.reminders.enabled ? "on" : "off"} · Browser permission:{" "}
        {permission}
      </p>
      <p className="section-copy">
        Notifications work while this app can run. Browsers may suspend it when
        your phone locks or it closes; delivery at that time is not guaranteed.
        On iPhone, use the installed Home Screen app. If you return within five
        minutes of a missed reminder, StudyBuddy catches up.
      </p>
      <h3>Reminders when the app is closed</h3>
      <p className="section-copy">
        Download the next four weeks to your calendar, then import the file into
        your phone’s calendar and allow calendar alerts. The file includes
        reminders; your calendar controls delivery. Re-export after changing
        your plan and replace earlier imported events to avoid duplicates.
      </p>
      <button
        onClick={() => {
          const url = URL.createObjectURL(
            new Blob([calendarFile(data)], {
              type: "text/calendar;charset=utf-8",
            }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = "StudyBuddy-schedule.ics";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setMessage(
            "Calendar downloaded. Import it into your calendar and check that event alerts are enabled.",
          );
        }}
      >
        <Download size={16} />
        Download calendar with reminders
      </button>
      {message && (
        <p role="status" className="status-message">
          {message}
        </p>
      )}
    </section>
  );
}
