// ui-toolbar.js — export button logic
import { currentTerm } from '../../subjects.js';
import { historicalExams } from '../../archive.js';
import { PlannerState } from '../../planner.js';
import { getExamText } from './ui-board.js';

export function setupExportButton() {
    document.getElementById('export-btn').onclick = () => {
        let exportText = '# LPAB Elective Plan\n\n';

        const allKeys = Object.keys(PlannerState.plan);
        const activeSemesters = allKeys.filter(k => k !== 'completed').sort();
        const orderedSemesters = ['completed', ...activeSemesters];

        orderedSemesters.forEach(semId => {
            const plannedSubjects = PlannerState.plan[semId];
            if (plannedSubjects && plannedSubjects.length > 0) {
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
            }
        });

        navigator.clipboard.writeText(exportText).then(() => {
            const btn = document.getElementById('export-btn');
            const originalText = btn.innerText;
            btn.innerText = '✓ Copied!';
            btn.style.backgroundColor = '#16a34a';
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = '#38bdf8';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard.');
        });
    };
}
