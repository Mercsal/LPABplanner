export const Engine = {
    /**
     * Compares a list of subjects to find clashes.
     * @param {Array} selectedList - Array of subject objects.
     * @returns {Array} - Array of error messages.
     */
    validateSemester(selectedList) {
        const errors = [];

        // 1. Check Capacity
        if (selectedList.length > 4) {
            errors.push("Maximum of 4 subjects per semester exceeded.");
        }

        // 2. Check for Overlaps (Lecture & Exam)
        for (let i = 0; i < selectedList.length; i++) {
            for (let j = i + 1; j < selectedList.length; j++) {
                const s1 = selectedList[i];
                const s2 = selectedList[j];

                // Lecture Clash
                if (s1.lecture === s2.lecture) {
                    errors.push(`Lecture Clash: ${s1.name} and ${s2.name} are both on ${s1.lecture} night.`);
                }

                // Exam Clash
                if (s1.exam === s2.exam) {
                    errors.push(`Exam Clash: ${s1.name} and ${s2.name} have identical exam times.`);
                }
            }
        }
        return errors;
    }
};
