import { subjects } from '../../subjects.js';
import { PlannerState } from '../../planner.js';
import { setupExportButton } from './ui-toolbar.js';
import { renderSubjectPool } from './ui-pool.js';
import { renderPlannerBoard } from './ui-board.js';

// --- Feedback panel helpers ---
const feedbackPanel = document.getElementById('feedback-panel');
const errorListEl   = document.getElementById('error-list');

function showErrors(errors) {
    errorListEl.innerHTML = '';
    errors.forEach(err => {
        const li = document.createElement('li');
        li.innerText = err;
        errorListEl.appendChild(li);
    });
    feedbackPanel.style.display = 'block';
}

function clearFeedback() {
    feedbackPanel.style.display = 'none';
    errorListEl.innerHTML = '';
}

// --- Core action: add a subject to a semester ---
function handleAddSubject(subject, semesterId) {
    clearFeedback();
    const result = PlannerState.addSubject(semesterId, subject);
    if (!result.success) showErrors(result.errors);
    renderPlannerBoard();
    renderSubjectPool();
}

// --- Event delegation ---
// ui-board and ui-pool fire custom events that bubble to document.
// All PlannerState mutations are centralised here.

document.addEventListener('subject-add', (e) => {
    handleAddSubject(e.detail.subject, e.detail.semesterId);
});

document.addEventListener('subject-drop', (e) => {
    const { subjectId, source, targetSemesterId } = e.detail;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    if (source !== 'pool' && source !== targetSemesterId) {
        PlannerState.removeSubject(source, subjectId);
    }
    handleAddSubject(subject, targetSemesterId);
});

document.addEventListener('subject-complete', (e) => {
    const { semesterId, subjectId } = e.detail;
    PlannerState.markCompleted(semesterId, subjectId);
    renderPlannerBoard();
    renderSubjectPool();
    clearFeedback();
});

// Action buttons (Done / Remove) inside slots use data-action attributes.
// A single delegated listener here handles all of them — no inline onclick,
// no window.* globals.
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const { action, semester, subject } = btn.dataset;

    if (action === 'remove') {
        PlannerState.removeSubject(semester, subject);
        renderPlannerBoard();
        renderSubjectPool();
        clearFeedback();
    }

    if (action === 'complete') {
        PlannerState.markCompleted(semester, subject);
        renderPlannerBoard();
        renderSubjectPool();
        clearFeedback();
    }
});

// --- Init ---
function init() {
    PlannerState.loadData();
    renderPlannerBoard();
    renderSubjectPool();
    setupExportButton();
}

init();
