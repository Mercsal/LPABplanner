/**
 * planner-state.js — in-memory plan state and all mutations.
 *
 * Single responsibility: maintain the plan object and expose
 * read/write operations. Delegates persistence to storage.js
 * and validation/clash detection to engine.js.
 *
 * UI modules import from here (or from the planner.js shim).
 * This module never touches the DOM.
 */

import { Engine } from '../../engine.js';
import { currentTerm } from '../../subjects.js';
import {
    loadPlan, savePlan, clearPlanOnly,
    loadHiddenSubjects, saveHiddenSubjects
} from './storage.js';

let _plan = loadPlan();
let _hidden = loadHiddenSubjects(); // string[] of subject IDs

export const PlannerState = {

    // ── Read ──────────────────────────────────────────────────────────────────

    getPlan() { return _plan; },

    getSemester(id) {
        if (!_plan[id]) _plan[id] = [];
        return _plan[id];
    },

    getClashes(semesterId) {
        if (!_plan[semesterId]) return {};
        const safeTerm = currentTerm ?? 'winter2026';
        return Engine.getClashingSubjects(_plan[semesterId], semesterId, safeTerm);
    },

    getProgress() {
        return Engine.calculateProgress(_plan);
    },

    // ── Hidden subjects ───────────────────────────────────────────────────────

    getHidden() { return [..._hidden]; },

    setHidden(ids) {
        _hidden = [...ids];
        saveHiddenSubjects(_hidden);
    },

    restoreSubject(id) {
        _hidden = _hidden.filter(hid => hid !== id);
        saveHiddenSubjects(_hidden);
    },

    // ── Write ─────────────────────────────────────────────────────────────────

    addSubject(semesterId, subject) {
        const alreadyAdded = this.getProgress().totalSubjectsList.find(s => s.id === subject.id);
        if (alreadyAdded) {
            return { success: false, errors: [`${subject.name} is already in your plan.`] };
        }

        const target = this.getSemester(semesterId);

        if (semesterId !== 'completed') {
            const errors = Engine.validateSemester(target, subject, semesterId);
            if (errors.length > 0) return { success: false, errors };
        }

        target.push(subject);
        savePlan(_plan);
        return { success: true };
    },

    removeSubject(semesterId, subjectId) {
        if (!_plan[semesterId]) return;
        _plan[semesterId] = _plan[semesterId].filter(s => s.id !== subjectId);
        savePlan(_plan);
    },

    markCompleted(semesterId, subjectId) {
        if (!_plan[semesterId]) return;
        const idx = _plan[semesterId].findIndex(s => s.id === subjectId);
        if (idx === -1) return;
        const [subject] = _plan[semesterId].splice(idx, 1);
        this.getSemester('completed').push(subject);
        savePlan(_plan);
    },

    // ── Reset ─────────────────────────────────────────────────────────────────

    /** Clear all semester placements; keep hidden subjects. Returns pool to full. */
    resetPlanOnly() {
        _plan = { completed: [] };
        clearPlanOnly();
        savePlan(_plan);
    },

    // ── Persistence ───────────────────────────────────────────────────────────

    loadData() {
        _plan   = loadPlan();
        _hidden = loadHiddenSubjects();
    },

    saveData() { savePlan(_plan); },
};
