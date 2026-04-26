/**
 * storage.js — persistence layer.
 *
 * Single responsibility: read and write to localStorage.
 * Nothing here knows about subjects, semesters, or validation.
 */

export const STORAGE_KEY        = 'lpab_planner_data';
export const HIDDEN_KEY         = 'lpab_hidden_subjects';
export const ONBOARDING_KEY     = 'lpab_onboarding_done';

// ── Plan ──────────────────────────────────────────────────────────────────────

export function hasExistingPlan() {
    try {
        return localStorage.getItem(STORAGE_KEY) !== null;
    } catch { return false; }
}

export function loadPlan() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.warn('[storage] Could not read plan:', e.message);
    }
    return { completed: [] };
}

export function savePlan(plan) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch (e) {
        console.warn('[storage] Could not write plan:', e.message);
    }
}

// ── Hidden subjects ────────────────────────────────────────────────────────────

export function loadHiddenSubjects() {
    try {
        const raw = localStorage.getItem(HIDDEN_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function saveHiddenSubjects(ids) {
    try {
        localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
    } catch (e) {
        console.warn('[storage] Could not write hidden subjects:', e.message);
    }
}

// ── Onboarding flag ────────────────────────────────────────────────────────────

export function markOnboardingDone() {
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
}

export function isOnboardingDone() {
    try { return localStorage.getItem(ONBOARDING_KEY) === '1'; } catch { return false; }
}

// ── Full clear ─────────────────────────────────────────────────────────────────

export function clearAll() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HIDDEN_KEY);
        localStorage.removeItem(ONBOARDING_KEY);
    } catch {}
}

export function clearPlanOnly() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {}
}
