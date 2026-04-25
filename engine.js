export const Engine = {
    isAvailableInTerm(subject, termId) {
        if (termId === 'completed') return true; 
        const isWinter = termId.toLowerCase().includes('winter');
        const termString = isWinter ? 'winter' : 'summer';
        
        // FIX: Convert array items to lowercase before checking
        return subject.terms.some(term => term.toLowerCase() === termString);
    },

    validateSemester(selectedList, newSubject, termId) {
        const errors = []; 

        if (!this.isAvailableInTerm(newSubject, termId)) {
            const termName = termId.toLowerCase().includes('winter') ? 'Winter' : 'Summer';
            errors.push(`${newSubject.name} is not offered in ${termName}.`);
        }

        if (selectedList.length >= 4) {
            errors.push("Maximum of 4 subjects per semester exceeded.");
        }

        return errors;
    },

// UPDATED: Now requires semesterId and currentTerm
    getClashingSubjects(semesterList, semesterId, currentTerm) {
        const clashData = {}; 
        
        for (let i = 0; i < semesterList.length; i++) {
            for (let j = i + 1; j < semesterList.length; j++) {
                const s1 = semesterList[i];
                const s2 = semesterList[j];

                if (s1.lecture === s2.lecture) {
                    if (!clashData[s1.id]) clashData[s1.id] = [];
                    if (!clashData[s2.id]) clashData[s2.id] = [];
                    
                    if (!clashData[s1.id].includes(`Lecture clash on ${s1.lecture}`)) {
                        clashData[s1.id].push(`Lecture clash on ${s1.lecture}`);
                    }
                    if (!clashData[s2.id].includes(`Lecture clash on ${s2.lecture}`)) {
                        clashData[s2.id].push(`Lecture clash on ${s2.lecture}`);
                    }
                }

                // NEW: Only check for exam clashes if this is the active current term
                if (semesterId === currentTerm && s1.exam && s2.exam && s1.exam === s2.exam) {
                    if (!clashData[s1.id]) clashData[s1.id] = [];
                    if (!clashData[s2.id]) clashData[s2.id] = [];

                    if (!clashData[s1.id].includes(`Exam clash on ${s1.exam}`)) {
                        clashData[s1.id].push(`Exam clash on ${s1.exam}`);
                    }
                    if (!clashData[s2.id].includes(`Exam clash on ${s2.exam}`)) {
                        clashData[s2.id].push(`Exam clash on ${s2.exam}`);
                    }
                }
            }
        }
        return clashData;
    },
    calculateProgress(entirePlanObject) {
        const allSelected = [];
        Object.values(entirePlanObject).forEach(semesterArray => {
            allSelected.push(...semesterArray);
        });

        // FIX: Convert subject types to lowercase before counting
        const compulsoryCount = allSelected.filter(s => s.type.toLowerCase() === 'compulsory').length;
        const electiveCount = allSelected.filter(s => s.type.toLowerCase() === 'elective').length;

        return {
            compulsory: { current: compulsoryCount, required: 17 },
            electives: { current: electiveCount, required: 3 },
            readyToGraduate: compulsoryCount === 17 && electiveCount >= 3,
            totalSubjects: allSelected.length,
            totalSubjectsList: allSelected 
        };
    }
};