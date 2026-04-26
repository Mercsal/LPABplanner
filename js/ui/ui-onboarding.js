/**
 * ui-onboarding.js — first-run onboarding overlay.
 *
 * Shows once when no saved plan exists. Presents three paths:
 *   A — Starting fresh (optionally with suggested pathway)
 *   B — Part way through (pre-populate completed subjects)
 *   C — Specific subjects only (hide unwanted subjects)
 *
 * After onboarding, calls onComplete() to trigger the main app render.
 * Never touches the DOM outside #onboarding-overlay.
 */

import { subjects, currentTerm } from '../../subjects.js';
import { PlannerState } from '../state/planner-state.js';
import { markOnboardingDone } from '../state/storage.js';
import { SUGGESTED_PATHWAY, generateTermSequence } from '../data/suggested-pathway.js';

const GROUPS = [
    { key: 'core',        label: 'Core Subjects',        note: 'Must be taken in sequence (first 11)' },
    { key: 'compulsory',  label: 'Compulsory Subjects',  note: 'Mandatory — any order' },
    { key: 'elective',    label: 'Elective Subjects',    note: 'Choose 3' },
];

// ── Public entry point ────────────────────────────────────────────────────────

export function showOnboardingIfNeeded(onComplete) {
    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) { onComplete(); return; }
    showStep(overlay, 'path-select', onComplete);
}

// ── Step router ───────────────────────────────────────────────────────────────

function showStep(overlay, step, onComplete, ctx = {}) {
    overlay.innerHTML = '';
    overlay.style.display = 'flex';

    const steps = {
        'path-select':     renderPathSelect,
        'pathway-confirm': renderPathwayConfirm,
        'completed-pick':  renderCompletedPick,
        'subject-pick':    renderSubjectPick,
        'confirm-b':       renderConfirmB,
        'confirm-c':       renderConfirmC,
    };

    (steps[step] || renderPathSelect)(overlay, onComplete, ctx);
}

// ── Step: Choose a path ────────────────────────────────────────────────────────

function renderPathSelect(overlay, onComplete) {
    overlay.innerHTML = `
        <div class="ob-card">
            <div class="ob-logo">⚖️</div>
            <h1 class="ob-title">LPAB Course Planner</h1>
            <p class="ob-subtitle">Welcome! Let's set up your plan.</p>
            <div class="ob-paths">
                <button class="ob-path-btn" data-path="A">
                    <span class="ob-path-icon">🎓</span>
                    <span class="ob-path-label">Starting fresh</span>
                    <span class="ob-path-desc">I haven't started the LPAB yet</span>
                </button>
                <button class="ob-path-btn" data-path="B">
                    <span class="ob-path-icon">📋</span>
                    <span class="ob-path-label">Part way through</span>
                    <span class="ob-path-desc">I've already completed some subjects</span>
                </button>
                <button class="ob-path-btn" data-path="C">
                    <span class="ob-path-icon">🎯</span>
                    <span class="ob-path-label">Specific subjects only</span>
                    <span class="ob-path-desc">I'm only doing a limited selection</span>
                </button>
            </div>
        </div>
    `;

    overlay.querySelectorAll('.ob-path-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const path = btn.dataset.path;
            if (path === 'A') showStep(overlay, 'pathway-confirm', onComplete);
            if (path === 'B') showStep(overlay, 'completed-pick',  onComplete);
            if (path === 'C') showStep(overlay, 'subject-pick',    onComplete);
        });
    });
}

// ── Path A: Suggested pathway confirm ─────────────────────────────────────────

function renderPathwayConfirm(overlay, onComplete) {
    const terms = generateTermSequence(currentTerm);

    overlay.innerHTML = `
        <div class="ob-card ob-card--wide">
            <h2 class="ob-title">Start with the suggested sequence?</h2>
            <p class="ob-subtitle">
                The LPAB recommends this 8-semester pathway to complete the Diploma in 4 years.
                Elective slots will be left empty for you to fill.
            </p>
            <div class="ob-pathway-preview">
                ${SUGGESTED_PATHWAY.map((sem, i) => {
                    const termId = terms[i];
                    const termLabel = termId.replace('winter','Winter ').replace('summer','Summer ');
                    const subjectNames = sem.subjects.map(id => {
                        const s = subjects.find(sub => sub.id === id);
                        return s ? `<span class="ob-subject-chip">${s.name}</span>` : '';
                    }).join('');
                    const electiveChips = Array.from({length: sem.electiveSlots || 0}, (_, j) =>
                        `<span class="ob-subject-chip ob-chip--elective">Elective slot</span>`
                    ).join('');
                    return `
                        <div class="ob-pathway-row">
                            <div class="ob-pathway-sem">
                                <strong>${sem.label}</strong>
                                <span class="ob-pathway-term">${termLabel}</span>
                            </div>
                            <div class="ob-pathway-subjects">${subjectNames}${electiveChips}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">← Back</button>
                <button class="ob-btn ob-btn--ghost"    id="ob-blank">Start with a blank board</button>
                <button class="ob-btn ob-btn--primary"  id="ob-apply">Use this sequence →</button>
            </div>
        </div>
    `;

    overlay.querySelector('#ob-back').addEventListener('click',  () => showStep(overlay, 'path-select', onComplete));
    overlay.querySelector('#ob-blank').addEventListener('click', () => finish(overlay, onComplete));
    overlay.querySelector('#ob-apply').addEventListener('click', () => {
        applyPathway(terms);
        finish(overlay, onComplete);
    });
}

function applyPathway(terms) {
    SUGGESTED_PATHWAY.forEach((sem, i) => {
        const termId = terms[i];
        sem.subjects.forEach(id => {
            const subject = subjects.find(s => s.id === id);
            if (subject) PlannerState.addSubject(termId, subject);
        });
        // Elective slots are left empty — the board renders them as empty droppable slots
    });
}

// ── Path B: Pick completed subjects ────────────────────────────────────────────

function renderCompletedPick(overlay, onComplete) {
    overlay.innerHTML = `
        <div class="ob-card ob-card--wide">
            <h2 class="ob-title">Which subjects have you completed?</h2>
            <p class="ob-subtitle">These will be moved to your Completed section.</p>
            ${renderGroupedCheckboxes('ob-completed', false)}
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">← Back</button>
                <button class="ob-btn ob-btn--primary"  id="ob-next">Next →</button>
            </div>
        </div>
    `;

    overlay.querySelector('#ob-back').addEventListener('click', () => showStep(overlay, 'path-select', onComplete));
    overlay.querySelector('#ob-next').addEventListener('click', () => {
        const checked = getCheckedIds(overlay, 'ob-completed');
        if (checked.length === 0) {
            finish(overlay, onComplete);
        } else {
            showStep(overlay, 'confirm-b', onComplete, { checked });
        }
    });
}

function renderConfirmB(overlay, onComplete, ctx) {
    const names = ctx.checked.map(id => {
        const s = subjects.find(sub => sub.id === id);
        return s ? s.name : id;
    });

    overlay.innerHTML = `
        <div class="ob-card">
            <h2 class="ob-title">Confirm completed subjects</h2>
            <p class="ob-subtitle">These ${ctx.checked.length} subjects will be marked as completed:</p>
            <ul class="ob-confirm-list">
                ${names.map(n => `<li>${n}</li>`).join('')}
            </ul>
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">← Back</button>
                <button class="ob-btn ob-btn--primary"  id="ob-confirm">Confirm & start planning →</button>
            </div>
        </div>
    `;

    overlay.querySelector('#ob-back').addEventListener('click',    () => showStep(overlay, 'completed-pick', onComplete));
    overlay.querySelector('#ob-confirm').addEventListener('click', () => {
        ctx.checked.forEach(id => {
            const subject = subjects.find(s => s.id === id);
            if (subject) PlannerState.addSubject('completed', subject);
        });
        finish(overlay, onComplete);
    });
}

// ── Path C: Pick subjects you ARE doing ───────────────────────────────────────

function renderSubjectPick(overlay, onComplete) {
    overlay.innerHTML = `
        <div class="ob-card ob-card--wide">
            <h2 class="ob-title">Which subjects are you doing?</h2>
            <p class="ob-subtitle">
                All subjects are selected by default. Uncheck any you won't be doing
                — they'll be hidden from your pool but can be restored later.
            </p>
            ${renderGroupedCheckboxes('ob-doing', true)}
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">← Back</button>
                <button class="ob-btn ob-btn--primary"  id="ob-next">Next →</button>
            </div>
        </div>
    `;

    overlay.querySelector('#ob-back').addEventListener('click', () => showStep(overlay, 'path-select', onComplete));
    overlay.querySelector('#ob-next').addEventListener('click', () => {
        const doing   = getCheckedIds(overlay, 'ob-doing');
        const hidden  = subjects.map(s => s.id).filter(id => !doing.includes(id));
        showStep(overlay, 'confirm-c', onComplete, { doing, hidden });
    });
}

function renderConfirmC(overlay, onComplete, ctx) {
    const hiddenNames = ctx.hidden.map(id => {
        const s = subjects.find(sub => sub.id === id);
        return s ? s.name : id;
    });

    overlay.innerHTML = `
        <div class="ob-card">
            <h2 class="ob-title">Confirm your selection</h2>
            <p class="ob-subtitle">
                Your pool will show <strong>${ctx.doing.length}</strong> subject${ctx.doing.length !== 1 ? 's' : ''}.
                ${ctx.hidden.length > 0 ? `<strong>${ctx.hidden.length}</strong> subject${ctx.hidden.length !== 1 ? 's' : ''} will be hidden.` : ''}
            </p>
            ${ctx.hidden.length > 0 ? `
            <details class="ob-hidden-preview">
                <summary>Hidden subjects (${ctx.hidden.length})</summary>
                <ul class="ob-confirm-list">${hiddenNames.map(n => `<li>${n}</li>`).join('')}</ul>
            </details>` : ''}
            <p class="ob-note">You can restore hidden subjects at any time from the subject pool.</p>
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">← Back</button>
                <button class="ob-btn ob-btn--primary"  id="ob-confirm">Confirm & start planning →</button>
            </div>
        </div>
    `;

    overlay.querySelector('#ob-back').addEventListener('click',    () => showStep(overlay, 'subject-pick', onComplete));
    overlay.querySelector('#ob-confirm').addEventListener('click', () => {
        PlannerState.setHidden(ctx.hidden);
        finish(overlay, onComplete);
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderGroupedCheckboxes(namePrefix, defaultChecked) {
    return GROUPS.map(group => {
        const groupSubjects = subjects.filter(s => s.group === group.key);
        const rows = groupSubjects.map(s => `
            <label class="ob-check-row">
                <input type="checkbox" name="${namePrefix}" value="${s.id}" ${defaultChecked ? 'checked' : ''}>
                <span class="ob-check-name">${s.id}: ${s.name}</span>
                <span class="ob-check-meta">${s.terms.join(' / ')} · ${s.lecture}</span>
            </label>
        `).join('');
        return `
            <div class="ob-group">
                <div class="ob-group-header">
                    <span class="ob-group-label">${group.label}</span>
                    <span class="ob-group-note">${group.note}</span>
                </div>
                ${rows}
            </div>
        `;
    }).join('');
}

function getCheckedIds(overlay, namePrefix) {
    return [...overlay.querySelectorAll(`input[name="${namePrefix}"]:checked`)]
        .map(el => el.value);
}

function finish(overlay, onComplete) {
    markOnboardingDone();
    overlay.style.display = 'none';
    onComplete();
}
