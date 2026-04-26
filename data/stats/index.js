// data/stats/index.js — stats registry
// ─────────────────────────────────────────────────────────────────
// To add a new semester:
//   1. Create data/stats/{termId}.js  (e.g. winter2026.js)
//   2. Uncomment or add one export line below.
//   3. That's it — the UI picks it up automatically.
//
// Term key convention (must match subjects.js and archive.js):
//   summer = March examination sitting
//   winter = July/August examination sitting
//
// Grading schemes:
//   v1 — prior to Term 2, 2024:  Fail / Pass / Pass with Merit / Pass with Distinction
//   v2 — Term 2, 2024 onward:    Fail / Pass / Credit / Distinction / High Distinction
//
// DNS (Did Not Sit) is stored per-subject as a raw count.
// The engine treats DNS as part of the effective fail rate for analysis and display.
// ─────────────────────────────────────────────────────────────────

export { summer2026Stats as summer2026 } from './summer2026.js';

// Uncomment as new semesters are added:
// export { winter2026Stats as winter2026 } from './winter2026.js';
// export { summer2025Stats as summer2025 } from './summer2025.js';

export { winter2025Stats as winter2025 } from './winter2025.js';
export { winter2024Stats as winter2024 } from './winter2024.js';
export { summer2024Stats as summer2024 } from './summer2024.js';
export { winter2023Stats as winter2023 } from './winter2023.js';
export { summer2023Stats as summer2023 } from './summer2023.js';
