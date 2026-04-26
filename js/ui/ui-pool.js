// ui-pool.js — renders the subject pool sidebar, respecting hidden subjects.
import { subjects } from '../../subjects.js';
import { PlannerState } from '../../planner.js';
import { handleAddSubject } from './ui-board.js';
import { createDifficultyBadge } from './ui-stats.js';
import { initTouchDnD } from './ui-touch-dnd.js';

const subjectListEl = document.getElementById('subject-list');

export function renderSubjectPool() {
    subjectListEl.innerHTML = '';
    const currentProgress = PlannerState.getProgress();
    const hiddenIds = PlannerState.getHidden();

    const planned  = currentProgress.totalSubjectsList.map(s => s.id);
    const visible  = subjects.filter(s => !planned.includes(s.id) && !hiddenIds.includes(s.id));
    const hidden   = subjects.filter(s => !planned.includes(s.id) &&  hiddenIds.includes(s.id));

    if (visible.length === 0 && hidden.length === 0) return;

    visible.forEach(subject => subjectListEl.appendChild(createPoolItem(subject)));

    // Hidden subjects collapsible
    if (hidden.length > 0) {
        const details = document.createElement('details');
        details.className = 'pool-hidden-section';
        details.innerHTML = `<summary class="pool-hidden-summary">Hidden subjects (${hidden.length})</summary>`;
        hidden.forEach(subject => {
            const item = createPoolItem(subject, true);
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'pool-restore-btn';
            restoreBtn.textContent = 'Restore';
            restoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                PlannerState.restoreSubject(subject.id);
                renderSubjectPool();
            });
            item.appendChild(restoreBtn);
            details.appendChild(item);
        });
        subjectListEl.appendChild(details);
    }

    // Re-attach touch DnD handlers after pool render
    initTouchDnD();
}

function createPoolItem(subject, isHidden = false) {
    const div = document.createElement('div');
    const sType = subject.type.toLowerCase();
    const groupClass = subject.group === 'core' ? 'pool-item--core' :
                       sType === 'compulsory'    ? 'pool-item--compulsory' :
                                                   'pool-item--elective';

    div.className = `subject-item ${groupClass}${isHidden ? ' pool-item--hidden' : ''}`;
    div.draggable = !isHidden;
    // Data attributes for touch DnD
    div.dataset.subjectId = subject.id;
    div.dataset.sourceId  = 'pool';

    if (!isHidden) {
        div.title = 'Drag to a semester, or Double-Click to mark as Completed';
        div.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ id: subject.id, source: 'pool' }));
            e.dataTransfer.effectAllowed = 'move';
        };
        div.ondblclick = () => handleAddSubject(subject, 'completed');
    }

    const groupLabel = subject.group === 'core' ? 'Core' :
                       subject.group === 'compulsory' ? 'Compulsory' : 'Elective';

    // Header row: name left, difficulty badge right
    const header = document.createElement('div');
    header.className = 'subject-item__header';

    const nameEl = document.createElement('strong');
    nameEl.textContent = `${subject.id}: ${subject.name}`;
    header.appendChild(nameEl);

    const badge = createDifficultyBadge(subject.id);
    if (badge) header.appendChild(badge);

    div.appendChild(header);

    const meta = document.createElement('div');
    meta.className = 'subject-meta';
    meta.textContent = `${groupLabel} | ${subject.terms.join(', ')} · ${subject.lecture}`;
    div.appendChild(meta);

    return div;
}
