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
import { loadPlan, savePlan } from './storage.js';

// Internal plan object — mutated only through the methods below.
let _plan = loadPlan();

export const PlannerState = {

    // ----------------------------------------------------------------
    // Read
    // ----------------------------------------------------------------

    /**
     * Return the full plan object (read-only reference).
     * Use getSemester() for mutations — don't mutate this directly.
     * @returns {object}
     */
    getPlan() {
        return _plan;
    },

    /**
     * Return the subject array for a semester, creating it if absent.
     * @param {string} id — e.g. 'winter2026' or 'completed'
     * @returns {Array}
     */
    getSemester(id) {
        if (!_plan[id]) _plan[id] = [];
        return _plan[id];
    },

    /**
     * Clash data for a single semester.
     * @param {string} semesterId
     * @returns {object} subjectId → string[] of clash messages
     */
    getClashes(semesterId) {
        if (!_plan[semesterId]) return {};
        const safeTerm = currentTerm ?? 'winter2026';
        return Engine.getClashingSubjects(_plan[semesterId], semesterId, safeTerm);
    },

    /**
     * Overall diploma progress.
     * @returns {{ compulsory, electives, readyToGraduate, totalSubjects, totalSubjectsList }}
     */
    getProgress() {
        return Engine.calculateProgress(_plan);
    },

    // ----------------------------------------------------------------
    // Write
    // ----------------------------------------------------------------

    /**
     * Add a subject to a semester.
     * Validates availability and semester limits (except for 'completed').
     * @param {string} semesterId
     * @param {object} subject
     * @returns {{ success: boolean, errors?: string[] }}
     */
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

    /**
     * Remove a subject from a semester.
     * @param {string} semesterId
     * @param {string} subjectId
     */
    removeSubject(semesterId, subjectId) {
        if (!_plan[semesterId]) return;
        _plan[semesterId] = _plan[semesterId].filter(s => s.id !== subjectId);
        savePlan(_plan);
    },

    /**
     * Move a subject from any semester into 'completed'.
     * @param {string} semesterId
     * @param {string} subjectId
     */
    markCompleted(semesterId, subjectId) {
        if (!_plan[semesterId]) return;
        const idx = _plan[semesterId].findIndex(s => s.id === subjectId);
        if (idx === -1) return;
        const [subject] = _plan[semesterId].splice(idx, 1);
        this.getSemester('completed').push(subject);
        savePlan(_plan);
    },

    // ----------------------------------------------------------------
    // Persistence (delegated — exposed here for compatibility)
    // ----------------------------------------------------------------

    /** Re-load state from localStorage (e.g. after an external reset). */
    loadData() {
        _plan = loadPlan();
    },

    /** Force-save current state (rarely needed; writes happen automatically). */
    saveData() {
        savePlan(_plan);
    }
};
