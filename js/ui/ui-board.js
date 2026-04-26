import { PlannerState } from '../../planner.js';
import { getExamText } from './ui-toolbar.js';
import { renderProgress } from './ui-progress.js';

/**
 * Renders the full planner board: completed bucket + dynamic semester cards.
 * Calls renderProgress() after each render to keep the tracker in sync.
 * Fires custom events for ui-main.js to handle all state mutations:
 *   - 'subject-drop'     — a subject was dragged onto a semester
 *   - 'subject-complete' — a slot's Done button or dblclick was triggered
 * Action buttons use data attributes; ui-main.js handles them via click delegation.
 */
export function renderPlannerBoard() {
    const dynamicContainer = document.getElementById('dynamic-semesters');
    const completedSection = document.getElementById('completed-slots');

    dynamicContainer.innerHTML = '';
    completedSection.innerHTML = '';

    _setupDropZone(completedSection, 'completed');

    const completedSubjects = PlannerState.getSemester('completed');
    if (completedSubjects.length === 0) {
        completedSection.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#94a3b8;padding:20px;">Drag completed subjects here</div>`;
    } else {
        completedSubjects.forEach(subject =>
            completedSection.appendChild(_createSubjectSlot(subject, 'completed', null))
        );
    }

    const progress = PlannerState.getProgress();
    const unassignedSubjects = Math.max(20 - progress.totalSubjects, 0);
    const extraSemestersNeeded = Math.ceil(unassignedSubjects / 3);

    const allTerms = [];
    let year = 2026;
    for (let i = 0; i < 15; i++) {
        allTerms.push(`winter${year}`);
        allTerms.push(`summer${year}`);
        year++;
    }

    let lastPopulatedIndex = -1;
    allTerms.forEach((term, index) => {
        if (PlannerState.plan[term]?.length > 0) lastPopulatedIndex = index;
    });

    const termsToRender = allTerms.slice(0, Math.max(lastPopulatedIndex + 1 + extraSemestersNeeded, 1));

    termsToRender.forEach(semesterId => {
        const plannedSubjects = PlannerState.getSemester(semesterId);
        const clashData = PlannerState.getClashes(semesterId);

        const card = document.createElement('section');
        card.className = 'semester-card';
        const titleName = semesterId.replace('winter', 'Winter ').replace('summer', 'Summer ');

        card.innerHTML = `<h2>${titleName}</h2><div class="semester-slots"></div>`;
        const slotsContainer = card.querySelector('.semester-slots');

        _setupDropZone(slotsContainer, semesterId);

        if (plannedSubjects.length === 0) {
            slotsContainer.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#94a3b8;padding:20px;">Drag subjects here (Max 4)</div>`;
        } else {
            plannedSubjects.forEach(subject => {
                const subjectWarnings = clashData[subject.id];
                slotsContainer.appendChild(_createSubjectSlot(subject, semesterId, subjectWarnings));
            });
        }

        dynamicContainer.appendChild(card);
    });

    renderProgress();
}

/**
 * Attaches dragover / dragleave / drop handlers to a drop zone element.
 * On drop, fires a 'subject-drop' custom event that bubbles to document.
 */
function _setupDropZone(el, semesterId) {
    el.ondragover  = (e) => { e.preventDefault(); el.style.backgroundColor = '#e2e8f0'; };
    el.ondragleave = ()  => { el.style.backgroundColor = ''; };
    el.ondrop = (e) => {
        e.preventDefault();
        el.style.backgroundColor = '';
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            el.dispatchEvent(new CustomEvent('subject-drop', {
                bubbles: true,
                detail: { subjectId: data.id, source: data.source, targetSemesterId: semesterId }
            }));
        } catch (err) {
            console.error('Drop failed:', err);
        }
    };
}

function _createSubjectSlot(subject, semesterId, subjectWarnings) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.style.borderStyle = 'solid';

    const isClashing = subjectWarnings?.length > 0;
    const sType = subject.type.toLowerCase();

    slot.style.borderColor     = isClashing ? '#ef4444' : (sType === 'compulsory' ? '#4ade80' : '#38bdf8');
    slot.style.backgroundColor = isClashing ? '#fef2f2' : (sType === 'compulsory' ? '#f0fdf4' : '#f0f9ff');
    slot.style.color           = isClashing ? '#7f1d1d' : '#1e293b';

    slot.draggable = true;
    slot.style.cursor = 'grab';
    slot.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: subject.id, source: semesterId }));
        e.dataTransfer.effectAllowed = 'move';
    };

    if (semesterId !== 'completed') {
        slot.title = 'Double-Click to mark as Completed';
        slot.ondblclick = () => slot.dispatchEvent(new CustomEvent('subject-complete', {
            bubbles: true,
            detail: { semesterId, subjectId: subject.id }
        }));
    }

    const completeBtnHtml = semesterId !== 'completed'
        ? `<span class="action-btn" style="font-size:0.8em;cursor:pointer;color:#16a34a;margin-right:15px;font-weight:bold;"
               data-action="complete" data-semester="${semesterId}" data-subject="${subject.id}">✓ Done</span>`
        : '';

    const lectureDisplay = semesterId !== 'completed'
        ? `<div style="font-size:0.85em;font-weight:600;color:#475569;margin-top:6px;">📅 ${subject.lecture}</div>`
        : '';

    const examDisplayData = getExamText(subject, semesterId);
    const examDisplay = semesterId !== 'completed'
        ? `<div style="font-size:0.8em;color:#64748b;margin-top:2px;">${examDisplayData}</div>`
        : '';

    let clashWarningHtml = '';
    if (isClashing) {
        subjectWarnings.forEach(warning => {
            clashWarningHtml += `<div style="font-size:0.75em;color:#dc2626;font-weight:bold;margin-top:4px;">⚠️ ${warning}</div>`;
        });
    }

    slot.innerHTML = `
        <div style="text-align:center;width:100%;">
            <strong>${subject.name}</strong><br>
            <span style="font-size:0.7em;text-transform:uppercase;">${subject.type}</span>
            ${lectureDisplay}
            ${examDisplay}
            ${clashWarningHtml}
            <div style="margin-top:8px;">
                ${completeBtnHtml}
                <span class="action-btn" style="font-size:0.8em;cursor:pointer;color:red;"
                      data-action="remove" data-semester="${semesterId}" data-subject="${subject.id}">✕ Remove</span>
            </div>
        </div>
    `;

    return slot;
}
