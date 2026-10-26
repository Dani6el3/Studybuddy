import { remaining, dateKey } from "./study.js";
export function newTimer(minutes, label = "Focus session", sessionId = null) {
  const totalMs = minutes * 60000;
  return {
    id: crypto.randomUUID(),
    label,
    sessionId,
    totalMs,
    remainingMs: totalMs,
    endsAt: Date.now() + totalMs,
  };
}
// Persist a deadline, never a tick counter: suspended tabs recover from wall time.
export function finishTimer(data, now = Date.now()) {
  const t = data.timer;
  if (!t?.endsAt || remaining(t, now) > 0) return data;
  const log = data.focusLog.some((x) => x.id === t.id)
    ? data.focusLog
    : [
        ...data.focusLog,
        {
          id: t.id,
          date: dateKey(new Date(t.endsAt)),
          minutes: t.totalMs / 60000,
        },
      ];
  return {
    ...data,
    timer: { ...t, endsAt: null, remainingMs: 0, finished: true },
    focusLog: log,
  };
}
export async function notifyComplete() {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration)
      await registration.showNotification("Focus session complete", {
        body: "A little progress, well earned. Take a break and mark your session done.",
        icon: `${import.meta.env.BASE_URL}icon-192.png`,
        tag: "studybuddy-focus",
      });
    else
      new Notification("Focus session complete", {
        body: "Take a break. You earned it.",
      });
  } catch {
    /* Some mobile browsers disallow notifications in background tabs. */
  }
}
