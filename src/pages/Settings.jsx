import { useState } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { PageHead } from "../components/UI";
import { freshData, validateData } from "../lib/storage";
import { dateKey } from "../lib/study";
export default function Settings({ data, update }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `studybuddy-backup-${dateKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Backup downloaded. Keep it somewhere safe.");
  };
  const importData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      if (file.size > 10 * 1024 * 1024)
        throw Error("Choose a backup smaller than 10 MB.");
      const next = validateData(JSON.parse(await file.text()));
      if (
        confirm(
          "Replace all current StudyBuddy data with this backup? Export your current data first if you need to keep it.",
        )
      ) {
        update(next);
        setMessage(
          "Backup restored: notes, links, flashcards, progress and timer.",
        );
      }
    } catch (err) {
      setError(err.message || "This backup could not be imported.");
    }
    e.target.value = "";
  };
  return (
    <>
      <PageHead eyebrow="MAKE IT YOURS" title="Your study space, your way.">
        Everything stays in this browser. A regular backup keeps your work safe.
      </PageHead>
      <div className="stack settings-card">
        <section className="card">
          <h2>Semester dates</h2>
          <label className="field">
            Semester start date
            <input
              type="date"
              value={data.startDate}
              onChange={(e) => {
                if (
                  e.target.value &&
                  /^\d{4}-\d{2}-\d{2}$/.test(e.target.value)
                ) {
                  update((d) => ({ ...d, startDate: e.target.value }));
                  setMessage("Semester date updated.");
                }
              }}
            />
          </label>
          <p className="section-copy">
            Week 1 begins on this date. Topics repeat every four weeks. Learn in
            weeks 1–4, consolidate in weeks 5–8, then switch to exam drills.
          </p>
        </section>
        <section className="card">
          <h2>Keep a copy of your progress</h2>
          <p className="section-copy">
            Export includes notes, saved links, flashcards, topic checkboxes,
            session history, focus minutes and your timer.
          </p>
          <div className="row section-gap">
            <button onClick={exportData} className="primary">
              <Download size={17} />
              Export all data
            </button>
            <label className="button" htmlFor="import-file">
              <Upload size={17} />
              Import backup
            </label>
            <input
              id="import-file"
              type="file"
              accept="application/json,.json"
              onChange={importData}
              className="sr-only"
            />
          </div>
          <p className="section-copy section-gap">
            Import replaces your current data after confirmation. Backups
            contain your personal study content; keep them private.
          </p>
        </section>
        <section className="card">
          <h2>Appearance & installation</h2>
          <p className="muted">
            StudyBuddy follows your device’s light or dark appearance. Once
            loaded and cached, the app works offline; external searches and
            uncached thumbnails need internet.
          </p>
          <p className="muted">
            On Android, use Chrome’s menu → Install app or Add to Home screen.
            On iPhone, open in Safari → Share → Add to Home Screen. Install from
            an HTTPS website.
          </p>
        </section>
        <section className="card">
          <h2>Start fresh</h2>
          <p className="section-copy">
            Remove all study data from this browser. Export a backup first.
          </p>
          <button
            className="danger"
            onClick={() => {
              if (
                confirm(
                  "Delete all notes, saved links, flashcards and progress on this device? This cannot be undone without a backup.",
                )
              ) {
                update(freshData());
                setMessage("Study data reset. Ready for a fresh start.");
              }
            }}
          >
            <Trash2 size={16} />
            Reset all data
          </button>
        </section>
        {message && (
          <p role="status" className="status-message">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="notice">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
