import { Engine } from './engine.js';

export const PlannerState = {
    // Structure to hold subjects per semester
    plan: {
        winter2026: [],
        summer2026: [],
        completed: [] // Subjects already passed (no clash checks needed)
    },

    addSubject(semesterId, subject) {
        // Only run validation if not adding to 'completed'
        if (semesterId !== 'completed') {
            const potentialSemester = [...this.plan[semesterId], subject];
            const clashes = Engine.validateSemester(potentialSemester);
            
            if (clashes.length > 0) {
                console.warn("Clash detected:", clashes);
                // We return the clashes so the UI can alert the user
                return { success: false, errors: clashes };
            }
        }

        this.plan[semesterId].push(subject);
        return { success: true };
    },

    removeSubject(semesterId, subjectId) {
        this.plan[semesterId] = this.plan[semesterId].filter(s => s.id !== subjectId);
    }
};
