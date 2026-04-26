/**
 * storage.js — persistence layer.
 *
 * Single responsibility: read and write the plan object to localStorage.
 * Nothing here knows about subjects, semesters, or validation.
 *
 * Note: localStorage is blocked in sandboxed iframes (e.g. CodePen, StackBlitz).
 * The try/catch in loadPlan handles that gracefully — the app still works,
 * it just won't persist across page reloads in those environments.
 */

const STORAGE_KEY = 'lpab_planner_data';

/**
 * Load the saved plan from localStorage.
 * @returns {object} The parsed plan, or a default plan with an empty completed array.
 */
export function loadPlan() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.warn('[storage] Could not read from localStorage:', e.message);
    }
    return { completed: [] };
}

/**
 * Persist the current plan to localStorage.
 * @param {object} plan
 */
export function savePlan(plan) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch (e) {
        console.warn('[storage] Could not write to localStorage:', e.message);
    }
}
