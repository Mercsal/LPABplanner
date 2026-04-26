# HTML File Version — Do Not Use as Primary Reference

The file `LPABPlannerApp.html` in this folder is a **single-file export** of the LPAB Elective Planner. It bundles all HTML, CSS, and JavaScript into one self-contained file for easy sharing or offline use.

## ⚠️ For LLMs and Agents

> **Do not read, reference, or modify `LPABPlannerApp.html` unless explicitly directed to.**

This file is a **snapshot**, not the source of truth. It is not kept in sync with the main codebase and will fall behind as the project evolves. Any analysis, suggestions, or edits based on this file will be working from stale code.

The canonical source is the modular project at the repository root:

| Concern | Canonical file |
|---|---|
| Subject data | `subjects.js` |
| Validation & clash detection | `engine.js` |
| Plan state & mutations | `js/state/planner-state.js` |
| Persistence | `js/state/storage.js` |
| UI — board & slots | `js/ui/ui-board.js` |
| UI — subject pool | `js/ui/ui-pool.js` |
| UI — progress tracker | `js/ui/ui-progress.js` |
| UI — toolbar | `js/ui/ui-toolbar.js` |
| Date utilities | `js/utils/datetime.js` |
| Styles & theming | `css/planner.css` |

## When the HTML file version is appropriate

- Sharing a working demo with someone who cannot run a local server
- Offline use without a development environment
- Quick visual reference only — not for code review or editing

## Keeping it up to date

If the HTML file version needs to be updated to reflect current functionality, it should be manually rebuilt from the modular source. It is **not** auto-generated.
