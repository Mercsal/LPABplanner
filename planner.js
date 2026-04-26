/**
 * planner.js — backwards-compatibility shim.
 *
 * Re-exports PlannerState from its new location so that existing
 * imports (e.g. `import { PlannerState } from './planner.js'`) continue
 * to work without touching every UI module.
 *
 * New code should import directly from './js/state/planner-state.js'.
 */
export { PlannerState } from './js/state/planner-state.js';
