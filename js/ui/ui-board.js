// ui-board.js — planner board, semester cards, subject slots, drag-and-drop
import { subjects, currentTerm } from '../../subjects.js';
import { historicalExams } from '../../archive.js';
import { PlannerState } from '../../planner.js';
import { Engine } from '../../engine.js';
import { renderSubjectPool } from './ui-pool.js';
import { renderProgress } from './ui-progress.js';
import { feedbackPanel, errorListEl } from './ui-main.js';
import { createGradeBar } from './ui-stats.js';
import { initTouchDnD } from './ui-touch-dnd.js';

// Stage 2: detect whether the primary input is touch so we can skip the
// dblclick shortcut (which misfires as a zoom gesture on mobile).
const isTouchPrimary = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

export function getExamText(subject, semesterId) {
    if (semesterId === 'completed') return '';
    const safeTerm = typeof currentTerm !== 'undefined' ? currentTerm : 'winter2026';

    if (semesterId === safeTerm) {
        return subject.exam ? `📝 Exam: ${subject.exam}` : '📝 Exam: TBA';
    }

    let lastKnown = null;
    if (subject.exam) {
        const termName = safeTerm.replace('winter','Winter ').replace('summer','Summer ');
        lastKnown = `${subject.exam} (${termName})`;
    } else if (typeof historicalExams !== 'undefined') {
        const pastTerms = Object.keys(historicalExams).reverse();
        for (const term of pastTerms) {
            const pastSub = historicalExams[term].find(s => s.id === subject.id);
            if (pastSub && pastSub.exam) {
                const termName = term.replace('winter','Winter ').replace('summer','Summer ');
                lastKnown = `${pastSub.exam} (${termName})`;
                break;
            }
        }
    }
    return lastKnown ? `🕒 Last ran: ${lastKnown}` : '📝 Exam: TBA';
}

export function handleAddSubject(subject, semesterId) {
    feedbackPanel.style.display = 'none';
    errorListEl.innerHTML = '';

    // Core order warning — non-blocking
    if (semesterId !== 'completed') {
        const orderWarning = Engine.checkCoreOrder(subject.id, PlannerState.getPlan());
        if (orderWarning) {
            feedbackPanel.style.display = 'block';
            feedbackPanel.className = 'warning';
            const li = document.createElement('li');
            li.innerHTML = `⚠️ ${orderWarning}`;
            errorListEl.appendChild(li);
        }
    }

    const result = PlannerState.addSubject(semesterId, subject);

    if (!result.success) {
        feedbackPanel.style.display = 'block';
        feedbackPanel.className = 'error';
        errorListEl.innerHTML = '';
        result.errors.forEach(err => {
            const li = document.createElement('li');
            li.innerText = err;
            errorListEl.appendChild(li);
        });
    }

    renderPlannerBoard();
    renderSubjectPool();
}

export function renderPlannerBoard() {
    const dynamicContainer = document.getElementById('dynamic-semesters');
    const completedSection = document.getElementById('completed-slots');

    dynamicContainer.innerHTML = '';
    completedSection.innerHTML = '';

    completedSection.ondragover  = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
    completedSection.ondragleave = (e) => { e.currentTarget.classList.remove('drag-over'); };
    completedSection.ondrop      = (e) => { e.currentTarget.classList.remove('drag-over'); handleDrop(e, 'completed'); };

    const completedSubjects = PlannerState.getSemester('completed');
    if (completedSubjects.length === 0) {
        completedSection.innerHTML = `<div class="slots__empty">Drag completed subjects here</div>`;
    } else {
        completedSubjects.forEach(subject => completedSection.appendChild(createSubjectSlot(subject, 'completed', null)));
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

    const plan = PlannerState.getPlan();
    let lastPopulatedIndex = -1;
    allTerms.forEach((term, index) => {
        if (plan[term] && plan[term].length > 0) lastPopulatedIndex = index;
    });

    const termsToRender = allTerms.slice(0, Math.max(lastPopulatedIndex + 1 + extraSemestersNeeded, 1));

    termsToRender.forEach(semesterId => {
        const plannedSubjects = PlannerState.getSemester(semesterId);
        const clashData = PlannerState.getClashes(semesterId);

        const card = document.createElement('section');
        card.className = 'semester-card';
        const titleName = semesterId.replace('winter','Winter ').replace('summer','Summer ');

        card.innerHTML = `<h2>${titleName}</h2><div class="semester-slots"></div>`;
        const slotsContainer = card.querySelector('.semester-slots');

        slotsContainer.ondragover  = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
        slotsContainer.ondragleave = (e) => { e.currentTarget.classList.remove('drag-over'); };
        slotsContainer.ondrop      = (e) => { e.currentTarget.classList.remove('drag-over'); handleDrop(e, semesterId); };

        if (plannedSubjects.length === 0) {
            slotsContainer.innerHTML = `<div class="slots__empty">Drag subjects here (Max 4)</div>`;
        } else {
            plannedSubjects.forEach(subject => {
                slotsContainer.appendChild(createSubjectSlot(subject, semesterId, clashData[subject.id]));
            });
        }

        dynamicContainer.appendChild(card);
    });

    renderProgress();
    // Re-attach touch DnD handlers after every board render
    initTouchDnD();
}

function createSubjectSlot(subject, semesterId, subjectWarnings) {
    const slot = document.createElement('div');
    const isClashing = subjectWarnings && subjectWarnings.length > 0;
    const sType = subject.type.toLowerCase();
    const groupClass = subject.group === 'core' ? 'slot--core' :
                       sType === 'compulsory'    ? 'slot--compulsory' :
                                                   'slot--elective';

    slot.className = `slot ${isClashing ? 'slot--clash' : groupClass}`;
    slot.draggable = true;
    // Data attributes for touch DnD
    slot.dataset.subjectId = subject.id;
    slot.dataset.sourceId  = semesterId;

    slot.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: subject.id, source: semesterId }));
        e.dataTransfer.effectAllowed = 'move';
    };

    // Stage 2: only attach dblclick on non-touch devices to avoid triggering
    // the browser's double-tap-to-zoom gesture on mobile.
    if (semesterId !== 'completed' && !isTouchPrimary) {
        slot.title = 'Double-Click to mark as Completed';
        slot.ondblclick = () => window.markCompleted(semesterId, subject.id);
    }

    const completeBtnHtml = semesterId !== 'completed'
        ? `<button class="action-btn slot__btn--done" onclick="markCompleted('${semesterId}', '${subject.id}')">✓ Done</button>`
        : '';
    const lectureDisplay = semesterId !== 'completed'
        ? `<div class="slot__lecture">📅 ${subject.lecture}</div>` : '';
    const examDisplay = semesterId !== 'completed'
        ? `<div class="slot__exam">${getExamText(subject, semesterId)}</div>` : '';

    let clashWarningHtml = '';
    if (isClashing) {
        subjectWarnings.forEach(w => { clashWarningHtml += `<div class="slot__clash-warning">⚠️ ${w}</div>`; });
    }

    const groupLabel = subject.group === 'core' ? 'Core' :
                       subject.group === 'compulsory' ? 'Compulsory' : 'Elective';

    slot.innerHTML = `
        <div style="text-align:center;width:100%;">
            <strong>${subject.name}</strong><br>
            <span class="slot__type">${groupLabel}</span>
            ${lectureDisplay}${examDisplay}${clashWarningHtml}
            <div class="slot__actions">
                ${completeBtnHtml}
                <button class="action-btn slot__btn--remove" onclick="removeSubject('${semesterId}', '${subject.id}')">✕ Remove</button>
            </div>
        </div>
    `;

    // Append grade bar below the inner content (only for non-completed slots)
    if (semesterId !== 'completed') {
        const gradeBar = createGradeBar(subject.id);
        if (gradeBar) slot.querySelector('div').appendChild(gradeBar);
    }

    return slot;
}

function handleDrop(event, targetSemesterId) {
    event.preventDefault();
    try {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const subject = subjects.find(s => s.id === data.id);
        if (!subject) return;
        if (data.source !== 'pool' && data.source !== targetSemesterId) {
            PlannerState.removeSubject(data.source, data.id);
        }
        handleAddSubject(subject, targetSemesterId);
    } catch (err) {
        console.error('Drop failed:', err);
    }
}

window.removeSubject = function (semesterId, subjectId) {
    PlannerState.removeSubject(semesterId, subjectId);
    renderPlannerBoard();
    renderSubjectPool();
    feedbackPanel.style.display = 'none';
};

window.markCompleted = function (semesterId, subjectId) {
    PlannerState.markCompleted(semesterId, subjectId);
    renderPlannerBoard();
    renderSubjectPool();
    feedbackPanel.style.display = 'none';
};
