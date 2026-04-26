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
// ─────────────────────────────────────────────────────────────────

export { summer2026Stats as summer2026 } from './summer2026.js';

// Uncomment as historical files are added:
// export { winter2025Stats as winter2025 } from './winter2025.js';
// export { summer2025Stats as summer2025 } from './summer2025.js';
// export { winter2024Stats as winter2024 } from './winter2024.js';
// export { summer2024Stats as summer2024 } from './summer2024.js';
