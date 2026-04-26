import { subjects } from '../../subjects.js';
import { PlannerState } from '../../planner.js';

/**
 * Renders the left-hand subject pool.
 * Subjects already in the plan (any semester) are hidden.
 * Fires a 'subject-add' custom event on double-click so ui-main.js
 * can handle the mutation without creating a circular import.
 */
export function renderSubjectPool() {
    const subjectListEl = document.getElementById('subject-list');
    subjectListEl.innerHTML = '';

    const currentProgress = PlannerState.getProgress();

    subjects.forEach(subject => {
        const isPlanned = currentProgress.totalSubjectsList.find(s => s.id === subject.id);
        if (isPlanned) return;

        const div = document.createElement('div');
        div.className = 'subject-item';
        div.draggable = true;
        div.title = 'Drag to a semester, or Double-Click to mark as Completed';

        const sType = subject.type.toLowerCase();
        div.style.borderColor = sType === 'compulsory' ? '#4ade80' : '#38bdf8';
        div.style.backgroundColor = sType === 'compulsory' ? '#f0fdf4' : '#f0f9ff';

        div.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ id: subject.id, source: 'pool' }));
            e.dataTransfer.effectAllowed = 'move';
        };

        div.ondblclick = () => {
            div.dispatchEvent(new CustomEvent('subject-add', {
                bubbles: true,
                detail: { subject, semesterId: 'completed' }
            }));
        };

        div.innerHTML = `
            <strong>${subject.id}: ${subject.name}</strong>
            <div style="font-size: 0.85em; color: #64748b; margin-top: 4px;">
                Type: ${subject.type} | Term: ${subject.terms.join(', ')}<br>Night: ${subject.lecture}
            </div>
        `;

        subjectListEl.appendChild(div);
    });
}
