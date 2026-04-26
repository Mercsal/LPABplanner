import { historicalExams } from '../../archive.js';
import { currentTerm } from '../../subjects.js';
import { PlannerState } from '../../planner.js';

/**
 * Returns a display string for a subject's exam in the context of a given semester.
 * - Active term: shows the real exam date.
 * - Future/past term: shows last known date from archive.
 * - Completed bucket: returns empty string.
 */
export function getExamText(subject, semesterId) {
    if (semesterId === 'completed') return '';

    const safeTerm = currentTerm ?? 'winter2026';

    if (semesterId === safeTerm) {
        return subject.exam ? `📝 Exam: ${subject.exam}` : '📝 Exam: TBA';
    }

    let lastKnown = null;

    if (subject.exam) {
        const termName = safeTerm.replace('winter', 'Winter ').replace('summer', 'Summer ');
        lastKnown = `${subject.exam} (${termName})`;
    } else {
        const pastTerms = Object.keys(historicalExams).reverse();
        for (const term of pastTerms) {
            const pastSub = historicalExams[term].find(s => s.id === subject.id);
            if (pastSub?.exam) {
                const termName = term.replace('winter', 'Winter ').replace('summer', 'Summer ');
                lastKnown = `${pastSub.exam} (${termName})`;
                break;
            }
        }
    }

    return lastKnown ? `🕒 Last ran: ${lastKnown}` : '📝 Exam: TBA';
}

/**
 * Wires up the export button. Reads current plan from PlannerState and
 * copies a Markdown-formatted summary to the clipboard.
 */
export function setupExportButton() {
    document.getElementById('export-btn').onclick = () => {
        let exportText = '# LPAB Elective Plan\n\n';

        const allKeys = Object.keys(PlannerState.plan);
        const activeSemesters = allKeys.filter(k => k !== 'completed').sort();
        const orderedSemesters = ['completed', ...activeSemesters];

        orderedSemesters.forEach(semId => {
            const plannedSubjects = PlannerState.plan[semId];
            if (!plannedSubjects?.length) return;

            const titleName = semId === 'completed'
                ? 'Already Completed'
                : semId.replace('winter', 'Winter ').replace('summer', 'Summer ');

            exportText += `## ${titleName}\n`;
            plannedSubjects.forEach(sub => {
                const examText = getExamText(sub, semId);
                const pipeExam = examText ? ` | ${examText}` : '';
                exportText += `- [${sub.id}] ${sub.name} (${sub.type}) | Lecture: ${sub.lecture}${pipeExam}\n`;
            });
            exportText += '\n';
        });

        navigator.clipboard.writeText(exportText)
            .then(() => {
                const btn = document.getElementById('export-btn');
                const originalText = btn.innerText;
                btn.innerText = '✓ Copied!';
                btn.style.backgroundColor = '#16a34a';
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = '#38bdf8';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text:', err);
                alert('Failed to copy to clipboard.');
            });
    };
}
