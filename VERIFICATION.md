# Verification record

Completed 26 October 2026.

- `npm test`: **7 tests passed**. Covers default/custom semester dates, week 4 → 5 topic wrap, study mode boundaries, weekday schedules, Saturday session count, Sunday times, URL parsing, timer deadline recovery/idempotent minutes, all-data JSON round-trip, rejected invalid backups, storage exceptions and streak/weekly progress calculations.
- `npm run build`: **passed**. React/Vite production output and vite-plugin-pwa service worker generated successfully. App assets are precached; no fonts, APIs or CDN scripts are needed for the app shell.
- Browser: production preview at **380 × 844**. Today displayed Monday 26 October 2026, week 1, Learn mode, CPY 503 / CPY 507 / MLS 515 and their topic 1 content. Document width did not exceed the viewport; mobile bottom navigation rendered correctly.
- Browser persistence: added a synthetic YouTube URL, note and flashcard through the UI; reloaded and verified all three persisted. The thumbnail element retained the expected `img.youtube.com/vi/<id>/hqdefault.jpg` source. The synthetic ID deliberately was not a real video, so this verifies URL derivation and persistence rather than availability of a specific external video.
- Browser flashcards: flipped a self-test question and marked it correct; score displayed **1/1, 100%**.
- Offline: stopped the production preview server, reloaded the app and navigated from a topic to Week and Today successfully using the cached service worker.
- Source formatting: components, data, configuration and tests formatted for editing. Git contains a separate commit for each requested build milestone, followed by final verification/formatting changes.

## Limits and remaining device checks

- Timer suspension recovery is checked with simulated timestamps several minutes after expiry, including avoiding duplicate minutes. An actual locked-phone run and browser-delayed notification require the target device. No server/push service can wake the closed app.
- Backup round-trip is verified at the data/validation layer. The UI exports the same data object and imports through the same validator with a replacement confirmation.
- A real phone installation was **not performed**. The manifest, icons, standalone display and generated service worker are present. Install from HTTPS using the README steps and confirm airplane-mode use on that phone.
- A historical “Lighthouse PWA pass” is **not claimed**. [Chrome documents PWA testing in Lighthouse as deprecated](https://developer.chrome.com/docs/lighthouse/pwa/pwa-cross-browser). Use browser Application tools and a target-device install test.
- Publishing was blocked by automatic approval review: explicit approval is required before uploading this source/build to the proposed private Sites destination. No source was pushed and no version was deployed. Local deliverables and Vercel/GitHub Pages instructions are complete.
