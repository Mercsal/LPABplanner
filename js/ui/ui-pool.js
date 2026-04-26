// ui-pool.js — renders the subject pool sidebar
import { subjects } from '../../subjects.js';
import { PlannerState } from '../../planner.js';
import { handleAddSubject } from './ui-board.js';

const subjectListEl = document.getElementById('subject-list');

export function renderSubjectPool() {
    subjectListEl.innerHTML = '';
    const currentProgress = PlannerState.getProgress();

    subjects.forEach(subject => {
        const isPlanned = currentProgress.totalSubjectsList.find(s => s.id === subject.id);
        if (isPlanned) return;

        const div = document.createElement('div');
        const sType = subject.type.toLowerCase();
        div.className = `subject-item ${sType === 'compulsory' ? 'pool-item--compulsory' : 'pool-item--elective'}`;
        div.draggable = true;
        div.title = 'Drag to a semester, or Double-Click to mark as Completed';

        div.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ id: subject.id, source: 'pool' }));
            e.dataTransfer.effectAllowed = 'move';
        };

        div.ondblclick = () => {
            handleAddSubject(subject, 'completed');
        };

        div.innerHTML = `
            <strong>${subject.id}: ${subject.name}</strong>
            <div style="font-size: 0.85em; color: #64748b; margin-top: 4px;">
                Type: ${subject.type} | Term: ${subject.terms.join(', ')} <br> Night: ${subject.lecture}
            </div>
        `;

        subjectListEl.appendChild(div);
    });
}
