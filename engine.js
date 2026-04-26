import { examTimesClash } from './js/utils/datetime.js';
import { subjects as allSubjects } from './subjects.js';

// IDs of the 11 core subjects, in required sequence.
const CORE_ORDER = ['01','02','03','04','05','06','07','08','09','10','11'];

export const Engine = {
    isAvailableInTerm(subject, termId) {
        if (termId === 'completed') return true;
        const isWinter = termId.toLowerCase().includes('winter');
        const termString = isWinter ? 'winter' : 'summer';
        return subject.terms.some(term => term.toLowerCase() === termString);
    },

    validateSemester(selectedList, newSubject, termId) {
        const errors = [];

        if (!this.isAvailableInTerm(newSubject, termId)) {
            const termName = termId.toLowerCase().includes('winter') ? 'Winter' : 'Summer';
            errors.push(`${newSubject.name} is not offered in ${termName}.`);
        }

        if (selectedList.length >= 4) {
            errors.push('Maximum of 4 subjects per semester exceeded.');
        }

        return errors;
    },

    /**
     * Check whether a core subject is being placed out of sequence.
     * Returns a warning string if so, or null if order is fine.
     *
     * A subject is "out of order" if it is placed in any semester and
     * a core subject with a lower sequence number has not yet been added
     * to the plan (completed or otherwise).
     *
     * This is a warning only — the placement is not blocked.
     *
     * @param {string} subjectId
     * @param {object} currentPlan  — full plan object
     * @returns {string|null}
     */
    checkCoreOrder(subjectId, currentPlan) {
        const coreIdx = CORE_ORDER.indexOf(subjectId);
        if (coreIdx <= 0) return null; // not a core subject, or first in sequence

        const allPlanned = Object.values(currentPlan).flat().map(s => s.id);
        const missingPrior = CORE_ORDER
            .slice(0, coreIdx)
            .filter(id => !allPlanned.includes(id));

        if (missingPrior.length === 0) return null;

        const missingNames = missingPrior.map(id => {
            const s = allSubjects.find(sub => sub.id === id);
            return s ? s.name : id;
        });

        return `Taking this subject out of the recommended sequence requires LPAB approval. ` +
               `Prerequisite(s) not yet in plan: ${missingNames.join(', ')}.`;
    },

    getClashingSubjects(semesterList, semesterId, currentTerm) {
        const clashData = {};

        for (let i = 0; i < semesterList.length; i++) {
            for (let j = i + 1; j < semesterList.length; j++) {
                const s1 = semesterList[i];
                const s2 = semesterList[j];

                if (s1.lecture === s2.lecture) {
                    if (!clashData[s1.id]) clashData[s1.id] = [];
                    if (!clashData[s2.id]) clashData[s2.id] = [];
                    if (!clashData[s1.id].includes(`Lecture clash on ${s1.lecture}`))
                        clashData[s1.id].push(`Lecture clash on ${s1.lecture}`);
                    if (!clashData[s2.id].includes(`Lecture clash on ${s2.lecture}`))
                        clashData[s2.id].push(`Lecture clash on ${s2.lecture}`);
                }

                if (semesterId === currentTerm && examTimesClash(s1.exam, s2.exam)) {
                    if (!clashData[s1.id]) clashData[s1.id] = [];
                    if (!clashData[s2.id]) clashData[s2.id] = [];
                    if (!clashData[s1.id].includes(`Exam clash on ${s1.exam}`))
                        clashData[s1.id].push(`Exam clash on ${s1.exam}`);
                    if (!clashData[s2.id].includes(`Exam clash on ${s2.exam}`))
                        clashData[s2.id].push(`Exam clash on ${s2.exam}`);
                }
            }
        }
        return clashData;
    },

    calculateProgress(entirePlanObject) {
        const allSelected = [];
        Object.values(entirePlanObject).forEach(arr => allSelected.push(...arr));

        const compulsoryCount = allSelected.filter(s => s.type.toLowerCase() === 'compulsory').length;
        const electiveCount   = allSelected.filter(s => s.type.toLowerCase() === 'elective').length;

        return {
            compulsory: { current: compulsoryCount, required: 17 },
            electives:  { current: electiveCount,   required: 3  },
            readyToGraduate: compulsoryCount === 17 && electiveCount >= 3,
            totalSubjects: allSelected.length,
            totalSubjectsList: allSelected
        };
    }
};
