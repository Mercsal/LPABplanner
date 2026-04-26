# LPAB Course Planner

A lightweight, interactive drag-and-drop progression planner built specifically for the NSW Legal Profession Admission Board (LPAB) Diploma in Law.

This tool helps students map out their 20-subject progression (17 compulsory, 3 electives), tracks progress toward graduation, and automatically detects lecture and exam timetabling clashes.

---

## Features

- **Drag-and-drop interface** — Move subjects from the pool into semesters or the Already Completed section
- **Graduation tracker** — Real-time progress bars for compulsory subjects and electives
- **Clash detection** — Warns when two subjects in the same active semester share a lecture night or exam time
- **Historical exam archive** — Subjects placed in future semesters show their last known exam date from `archive.js`
- **Auto-save** — Plan is saved to `localStorage` and persists across page reloads
- **Markdown export** — One-click copy of the full plan, formatted for Notion, Obsidian, or similar tools
- **Print view** — `Ctrl+P` / `Cmd+P` hides the UI and formats the plan for A4 or PDF
- **Dark mode** — Follows system preference by default; manual 🌙/☀️ toggle in the toolbar

---

## Running the App

No build tools, no server, no installation required. The app is plain HTML/CSS/ES6 modules.

```bash
git clone https://github.com/Mercsal/LPABplanner.git
```

Then open `index.html` in any modern browser. Because the project uses ES6 `import`/`export`, it must be served over HTTP — it will not work if opened directly as a `file://` URL.

The simplest way to serve it locally:

```bash
# Python (built into macOS/Linux)
python3 -m http.server 8080

# Node (if you have npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

> **Single-file version:** A self-contained `LPABPlannerApp.html` exists in the [`html file version`](./html%20file%20version/) folder for offline sharing or demos. It is a snapshot and is **not** kept in sync with the main codebase. See the README in that folder for details.

---

## Project Structure

```
LPABplanner/
├── index.html                  ← Entry point
├── subjects.js                 ← Subject data and currentTerm
├── archive.js                  ← Historical exam dates by semester
├── engine.js                   ← Validation and clash detection logic
├── planner.js                  ← Re-export shim (backwards compatibility)
├── css/
│   └── planner.css             ← All styles and CSS tokens (light + dark mode)
└── js/
    ├── state/
    │   ├── planner-state.js    ← In-memory plan state and mutations
    │   └── storage.js          ← localStorage read/write only
    ├── ui/
    │   ├── ui-main.js          ← App bootstrap and shared DOM refs
    │   ├── ui-board.js         ← Semester cards, slots, drag-and-drop
    │   ├── ui-pool.js          ← Subject pool sidebar
    │   ├── ui-progress.js      ← Progress tracker and graduation status
    │   └── ui-toolbar.js       ← Export and print buttons
    └── utils/
        └── datetime.js         ← Exam date parsing and comparison
```

### Module responsibilities

| File | Responsibility | Imports from |
|---|---|---|
| `subjects.js` | Subject list, `currentTerm` | Nothing |
| `archive.js` | Historical exam data | Nothing |
| `engine.js` | Validation, clash detection | `subjects.js`, `datetime.js` |
| `js/state/storage.js` | localStorage only | Nothing |
| `js/state/planner-state.js` | Plan mutations | `engine.js`, `storage.js`, `subjects.js` |
| `js/utils/datetime.js` | Date parsing + comparison | Nothing |
| `js/ui/ui-board.js` | Board rendering, drag-and-drop | `planner-state.js`, other UI modules |
| `js/ui/ui-pool.js` | Subject pool rendering | `planner-state.js`, `ui-board.js` |
| `js/ui/ui-progress.js` | Progress bars | `planner-state.js` |
| `js/ui/ui-toolbar.js` | Export, print | `planner-state.js` |

**Rule:** UI modules never import from each other except through `ui-main.js`. Data modules (`subjects.js`, `archive.js`) never import from anything.

---

## Updating for a New Semester

When the LPAB releases a new Evening Lecture Schedule and Examination Timetable, only two files need to change: `subjects.js` and `archive.js`. No logic or UI code needs to be touched.

### Step 1 — Archive the outgoing semester

In `archive.js`, add an entry for the semester that just ended. This preserves its exam dates so the planner can show "Last ran" information for future semesters.

```js
// archive.js
export const historicalExams = {
    winter2026: [
        { id: '01', exam: '8 Sep 2026, 9.00 am' },
        { id: '02', exam: '4 Sep 2026, 9.00 am' },
        // ... all subjects that ran this term
    ],
    // previous terms...
};
```

### Step 2 — Update `currentTerm`

In `subjects.js`, update the exported `currentTerm` to the new active semester. The engine uses this to decide which semester to run exam clash detection against.

```js
// subjects.js
export const currentTerm = 'summer2026'; // ← update this
```

### Step 3 — Update the subject timetable

In `subjects.js`, update each subject's `lecture` and `exam` fields from the new PDF.

```js
{ 
    id: '16', 
    name: 'Insolvency',
    type: 'Elective',
    terms: ['Winter'],
    lecture: 'Wednesday',       // ← update from new schedule
    exam: '4 Mar 2027, 1.45 pm' // ← update from new timetable
}
```

- If a subject is **not offered** in the new term, set `exam: null`. The engine will skip it for clash detection and show its archived date instead.
- The `terms` array (`['Winter']`, `['Summer']`, or `['Winter', 'Summer']`) controls which semesters a subject can be added to. Update this if LPAB changes availability.
- Exam date format must be `'D Mon YYYY, H.MM am/pm'` (e.g., `'3 Mar 2027, 9.00 am'`). This is what `datetime.js` parses — any other format will log a warning and be treated as no exam.

---

## For LLMs and Agents

If you are an LLM or agent working on this repository:

- **Always work from the modular source files** listed in the Project Structure above
- **Do not read or modify** `html file version/LPABPlannerApp.html` unless explicitly instructed — it is a stale snapshot
- **`planner.js` is a shim** — it only re-exports from `js/state/planner-state.js`. Do not add logic to it
- **One module, one concern** — if a change touches more than one module's responsibility, question whether the separation is still clean
- **Exam date format is strict** — `datetime.js` expects `'D Mon YYYY, H.MM am/pm'`. Do not change this format in `subjects.js` without updating the parser

---

## Disclaimer

This tool is a community project and is **not** officially affiliated with, maintained by, or endorsed by the Legal Profession Admission Board (LPAB) or the University of Sydney Law Extension Committee (LEC). Students should always cross-reference their progression plans with the official LPAB Course Information Handbook and published timetables.
