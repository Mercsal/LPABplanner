# Changelog

## testing → main
**26 April 2026**

### Features

- **Dark mode** — Full light/dark theme support via CSS custom properties. Respects `prefers-color-scheme` on load; manual 🌙/☀️ toggle in the toolbar overrides it. No JavaScript repaints — the entire palette swaps through a single `data-theme` attribute on `<html>`. ([`246f160`](https://github.com/Mercsal/LPABplanner/commit/246f160015eeda43615294932efb686dfe83ba95))

- **`js/utils/datetime.js`** — New date utility module. Parses the exam date string format (`'8 Sep 2026, 9.00 am'`) into native `Date` objects. Exports `parseExamDate`, `formatExamDate`, `examTimesClash`, and `sortByExamDate`. All functions are null-safe for subjects with no exam. ([`fa7b05e`](https://github.com/Mercsal/LPABplanner/commit/fa7b05e9a73680b0a97983938a24ce6ec842045f))

### Refactors

- **UI split** — Monolithic `ui.js` broken into five focused modules under `js/ui/`: `ui-board.js`, `ui-pool.js`, `ui-progress.js`, `ui-toolbar.js`, `ui-main.js`. Each module owns one concern and can be changed without touching the others. Legacy `ui.js` deleted. ([`14f81fc`](https://github.com/Mercsal/LPABplanner/commit/14f81fc2b664658483a56aa8dee92a36e13a88a9), [`9948d48`](https://github.com/Mercsal/LPABplanner/commit/9948d48fdc7a623c8355be49e1e8cb0de3a0bbca))

- **State split** — `planner.js` split into `js/state/storage.js` (localStorage read/write only) and `js/state/planner-state.js` (plan mutations, delegates to storage and engine). `planner.js` retained as a re-export shim so no existing import paths needed changing. `_plan` is now a private module variable — external mutation is no longer possible. ([`381a00a`](https://github.com/Mercsal/LPABplanner/commit/381a00a91a6ef09ffb6a746d3bfe5477efa5007c))

- **CSS tokens** — All hardcoded inline colours removed from JavaScript. Clash state, subject type colours, drag-over highlight, and button colours are now CSS classes (`slot--clash`, `slot--compulsory`, `slot--elective`, `drag-over`). All values defined as custom properties in `css/planner.css`. All inline `<style>` removed from `index.html`. ([`1b30917`](https://github.com/Mercsal/LPABplanner/commit/1b30917a5c46c309cef34c1e2a9c1553504f57ff))

- **Exam clash detection** — `engine.js` now uses `examTimesClash()` from `datetime.js` instead of a raw string comparison (`s1.exam === s2.exam`). Null exams are handled internally; the guard clauses in the engine are removed. ([`9a18f78`](https://github.com/Mercsal/LPABplanner/commit/9a18f7832b750c74dc3fbeabbb8679801ab850ff))

### Bug Fixes

- **Subject pool disappearing after state refactor** — `ui-board.js` was accessing `PlannerState.plan` directly. After `_plan` became a private variable this returned `undefined`, causing the semester render loop to produce zero terms and the subject pool to never draw. Fixed by adding a `getPlan()` accessor to `PlannerState` and updating the one reference in `ui-board.js`. ([`d229d6f`](https://github.com/Mercsal/LPABplanner/commit/d229d6f1d30bb5eb6c2b91d74cae950076b86fca))

### File Structure After Merge

```
js/
├── state/
│   ├── storage.js          ← localStorage only
│   └── planner-state.js    ← plan mutations
├── ui/
│   ├── ui-main.js
│   ├── ui-board.js
│   ├── ui-pool.js
│   ├── ui-progress.js
│   └── ui-toolbar.js
└── utils/
    └── datetime.js         ← exam date parsing & comparison
css/
└── planner.css             ← all tokens, light + dark mode
planner.js                  ← re-export shim (backwards compat)
engine.js                   ← validation + clash detection
subjects.js                 ← subject data
```
