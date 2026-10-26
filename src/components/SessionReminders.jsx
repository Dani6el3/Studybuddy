import { useEffect, useRef } from "react";
import { dueReminders } from "../lib/schedule";
import { showStudyNotification } from "./ReminderSettings";
export default function SessionReminders({ data, update, onReminder }) {
  const latest = useRef({ data, update, onReminder });
  latest.current = { data, update, onReminder };
  const busy = useRef(false);
  useEffect(() => {
    const check = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const { data, update, onReminder } = latest.current;
        for (const s of dueReminders(data)) {
          const body = `${s.label} · ${s.start}${s.codes.length ? " · " + s.codes.join(" + ") : ""}`;
          // Claim each reminder before awaiting permission-sensitive browser APIs.
          update((d) => ({
            ...d,
            reminderHistory: Object.fromEntries([
              ...Object.entries(d.reminderHistory).filter(
                ([, time]) => Date.now() - time < 7 * 86400000,
              ),
              [s.reminderKey, Date.now()],
            ]),
          }));
          onReminder(body);
          await showStudyNotification(
            "Time to study",
            body,
            `studybuddy-${s.id}`,
          );
        }
      } finally {
        busy.current = false;
      }
    };
    check();
    const id = setInterval(check, 15000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);
  return null;
}
