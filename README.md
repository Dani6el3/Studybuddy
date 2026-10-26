# StudyBuddy

A mobile-first, offline study companion for 500-level Medical Laboratory Science. React + Vite + Tailwind CSS + vite-plugin-pwa. No backend, login, API keys or paid services. The six supplied courses are the scope; the registration photograph’s personal information is not included.

## Run locally

Install Node.js 20.19+ or 22.12+, then open a terminal in this folder:

```sh
npm install
npm run dev
```

Open the URL Vite prints. For offline/PWA testing, use the production build:

```sh
npm test
npm run build
npm run preview
```

The service worker is enabled in production, not development. Let the first production load finish before going offline. Use localhost for local tests or HTTPS on a real phone. File URLs do not support service workers.

## Edit the content

All course titles, credits, core/elective status, two-sentence summaries, four topic strings, search keywords, reference books, study mode tasks, default semester date and weekly schedule live in **src/data/courses.js**. Edit those values; do not change course codes casually because stored topic data uses the course code plus topic index as its key. No specific YouTube videos or channels are bundled.

Dates use the device’s local calendar. Semester week 1 starts on the date in Settings (default 26 October 2026). Before that date, Today previews week 1. The topic index is `(week - 1) % 4`; week 5 returns to topic 1. Weeks 1–4 use Learn, weeks 5–8 Consolidate, and week 9 onward Exam drill. Saturday review combines two courses in each session. Sunday’s three sessions are in the morning.

## Your data

Notes, links, flashcards, topic checkboxes, session history and the focus timer are stored under `studybuddy` in localStorage. Every browser storage read/write is caught; a visible error explains if changes only exist in memory. Clearing browser data removes your work. Use Settings → Export all data regularly. Import validates a version 1 JSON backup and asks before replacing current data. It does not run imported text or HTML.

The timer stores an absolute deadline. A suspended tab recovers elapsed time on return; pause stores remaining milliseconds. Each completed timer adds its full focus duration exactly once. Marking a session done is independent of the timer. Incomplete/replaced timers do not add minutes. Notifications require explicit permission and browser support. Browsers may delay notifications until the app resumes; there is no background server or push service to wake a fully closed app.

Flashcard review records “got it” or “again”. Quick self-test shuffles the cards and reports the score based on your own marking after revealing the answer. Notes auto-save as you type. Saved YouTube links derive a thumbnail only from the URL supplied by you. External websites/search results need internet; previously loaded YouTube thumbnails are cached.

## Deploy to Vercel

1. Put this folder in a GitHub repository and import it into Vercel.
2. Select Vite, build command `npm run build`, output directory `dist`.
3. Deploy. Hash routes work without rewrite rules. No environment variables are needed.

## Deploy to GitHub Pages

Run `npm ci` and `npm run build`, then upload **dist/** using GitHub Pages Actions (`actions/upload-pages-artifact` and `actions/deploy-pages`). Give the workflow `pages: write` and `id-token: write`, and set the environment to `github-pages`. In repository Settings → Pages choose GitHub Actions. The relative Vite base (`./`) supports repository subpaths; hash routes do not need a 404 workaround. Always build from the committed lockfile.

## Install on your phone

Open the HTTPS deployment and allow the initial load to finish. Android Chrome: menu → Install app (or Add to Home screen). iPhone Safari: Share → Add to Home Screen. Open the installed icon once online, then test airplane mode. Device appearance controls light/dark mode. External links remain online resources.

## Structure

```text
src/data/courses.js       editable syllabus, schedule and references
src/pages/               Today, Week, Courses, Topic, Timer, Progress, Settings
src/components/          shared controls and flashcard review
src/lib/                 calendar, storage, timer and progress logic
public/                  install icons
tests/                   acceptance logic tests
vite.config.js           Tailwind, PWA manifest and offline caching
```

## Verification

`npm test` checks the semester cycle, weekday schedule, Sunday times, YouTube URL parsing, timer catch-up/idempotency, backup validation/round-trip and progress calculations. `npm run build` checks the production bundle and generates the service worker. See **VERIFICATION.md** for the actual checks performed and remaining device checks.

Current Lighthouse releases no longer provide the historical PWA category. Inspect the web manifest, active service worker, offline navigation and browser installability in DevTools → Application. A real phone installation must be tested on the target device; it cannot be guaranteed by a build alone.
