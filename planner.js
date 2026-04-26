import { Engine } from './engine.js';
import { currentTerm } from './subjects.js';

export const PlannerState = {
    plan: {
        completed: []
    },

    loadData() {
        const savedPlan = localStorage.getItem('lpab_planner_data');
        if (savedPlan) {
            try { this.plan = JSON.parse(savedPlan); } 
            catch (e) { console.error("Failed to load saved plan", e); }
        }
    },

    saveData() {
        localStorage.setItem('lpab_planner_data', JSON.stringify(this.plan));
    },

    getSemester(id) {
        if (!this.plan[id]) this.plan[id] = [];
        return this.plan[id];
    },

    addSubject(semesterId, subject) {
        const alreadyAdded = this.getProgress().totalSubjectsList.find(s => s.id === subject.id);
        if (alreadyAdded) return { success: false, errors: [`${subject.name} is already in your plan.`] };

        const targetSemester = this.getSemester(semesterId);

        if (semesterId !== 'completed') {
            const errors = Engine.validateSemester(targetSemester, subject, semesterId);
            if (errors.length > 0) return { success: false, errors: errors };
        }

        targetSemester.push(subject);
        this.saveData(); 
        return { success: true };
    },

    removeSubject(semesterId, subjectId) {
        if (this.plan[semesterId]) {
            this.plan[semesterId] = this.plan[semesterId].filter(s => s.id !== subjectId);
            this.saveData(); 
        }
    },

    markCompleted(semesterId, subjectId) {
        if (!this.plan[semesterId]) return;
        const subjectIndex = this.plan[semesterId].findIndex(s => s.id === subjectId);
        if (subjectIndex > -1) {
            const subject = this.plan[semesterId][subjectIndex];
            this.plan[semesterId].splice(subjectIndex, 1);
            this.getSemester('completed').push(subject);
            this.saveData(); 
        }
    },

    getClashes(semesterId) {
        if (!this.plan[semesterId]) return {}; 
        const safeTerm = typeof currentTerm !== 'undefined' ? currentTerm : 'winter2026';
        return Engine.getClashingSubjects(this.plan[semesterId], semesterId, safeTerm);
    },

    getProgress() {
        return Engine.calculateProgress(this.plan);
    }
};