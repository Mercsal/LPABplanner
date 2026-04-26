/**
 * ui-onboarding.js — first-run onboarding overlay.
 *
 * Renders as a full-screen overlay (not a sidebar panel).
 * Shows once when no saved plan exists. Presents three paths:
 *   A — Starting fresh (optionally with suggested pathway)
 *   B — Part way through (pre-populate completed subjects)
 *   C — Specific subjects only (hide unwanted subjects)
 *
 * Design rules:
 *   - No emoji in tiles or headings
 *   - Large, readable tiles with clear labels
 *   - Full-screen centred layout via .ob-overlay CSS class
 *   - Consistent with planner.css design tokens
 *
 * After onboarding, calls onComplete() to trigger the main app render.
 * Never touches the DOM outside #onboarding-overlay.
 */

import { subjects, currentTerm } from '../../subjects.js';
import { PlannerState } from '../state/planner-state.js';
import { markOnboardingDone } from '../state/storage.js';
import { SUGGESTED_PATHWAY, generateTermSequence } from '../data/suggested-pathway.js';

const GROUPS = [
    { key: 'core',       label: 'Core Subjects',       note: 'Must be taken in sequence — subjects 01 to 11' },
    { key: 'compulsory', label: 'Compulsory Subjects',  note: 'Mandatory — may be completed in any order' },
    { key: 'elective',   label: 'Elective Subjects',    note: 'Choose any 3' },
];

// ── Public entry point ────────────────────────────────────────────────────────

export function showOnboardingIfNeeded(onComplete) {
    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) { onComplete(); return; }
    overlay.className = 'ob-overlay';
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
            <div class="ob-header">
                <h1 class="ob-title">LPAB Course Planner</h1>
                <p class="ob-subtitle">How would you like to set up your plan?</p>
            </div>
            <div class="ob-paths">
                <button class="ob-path-btn" data-path="A">
                    <span class="ob-path-label">Starting fresh</span>
                    <span class="ob-path-desc">I haven't started the LPAB yet</span>
                </button>
                <button class="ob-path-btn" data-path="B">
                    <span class="ob-path-label">Part way through</span>
                    <span class="ob-path-desc">I have already completed some subjects</span>
                </button>
                <button class="ob-path-btn" data-path="C">
                    <span class="ob-path-label">Specific subjects only</span>
                    <span class="ob-path-desc">I am only doing a limited selection</span>
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
            <div class="ob-header">
                <h2 class="ob-title">Suggested study sequence</h2>
                <p class="ob-subtitle">
                    The LPAB recommends this 8-semester pathway to complete the Diploma in 4 years.
                    Elective slots will be left empty for you to fill in.
                </p>
            </div>
            <div class="ob-pathway-preview">
                ${SUGGESTED_PATHWAY.map((sem, i) => {
                    const termId = terms[i];
                    const termLabel = termId
                        .replace('winter', 'Winter ')
                        .replace('summer', 'Summer ');
                    const subjectChips = sem.subjects.map(id => {
                        const s = subjects.find(sub => sub.id === id);
                        return s
                            ? `<span class="ob-chip ob-chip--${s.group}">${s.id} &nbsp;${s.name}</span>`
                            : '';
                    }).join('');
                    const electiveChips = Array.from(
                        { length: sem.electiveSlots || 0 },
                        () => `<span class="ob-chip ob-chip--elective-slot">Elective — to be chosen</span>`
                    ).join('');
                    return `
                        <div class="ob-pathway-row">
                            <div class="ob-pathway-sem">
                                <strong>${sem.label}</strong>
                                <span class="ob-pathway-term">${termLabel}</span>
                            </div>
                            <div class="ob-pathway-chips">${subjectChips}${electiveChips}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">Back</button>
                <button class="ob-btn ob-btn--ghost"    id="ob-blank">Start with a blank board</button>
                <button class="ob-btn ob-btn--primary"  id="ob-apply">Use this sequence</button>
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
        // Elective slots are left empty — board renders them as open drop targets
    });
}

// ── Path B: Pick completed subjects ────────────────────────────────────────────

function renderCompletedPick(overlay, onComplete) {
    overlay.innerHTML = `
        <div class="ob-card ob-card--wide">
            <div class="ob-header">
                <h2 class="ob-title">Which subjects have you completed?</h2>
                <p class="ob-subtitle">These will be moved to your Completed section. Tick all that apply.</p>
            </div>
            ${renderGroupedCheckboxes('ob-completed', false)}
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">Back</button>
                <button class="ob-btn ob-btn--primary"  id="ob-next">Next</button>
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
        return s ? `${s.id}: ${s.name}` : id;
    });

    overlay.innerHTML = `
        <div class="ob-card">
            <div class="ob-header">
                <h2 class="ob-title">Confirm completed subjects</h2>
                <p class="ob-subtitle">${ctx.checked.length} subject${ctx.checked.length !== 1 ? 's' : ''} will be marked as completed:</p>
            </div>
            <ul class="ob-confirm-list">
                ${names.map(n => `<li>${n}</li>`).join('')}
            </ul>
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">Back</button>
                <button class="ob-btn ob-btn--primary"  id="ob-confirm">Confirm and start planning</button>
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
//
// Subjects are shown in three groups: Core, Compulsory, Elective.
// All are checked by default. Unchecking a subject hides it from the pool,
// but it remains visible here in a greyed "Hidden subjects" section so the
// student can see what they are opting out of.

function renderSubjectPick(overlay, onComplete) {
    overlay.innerHTML = `
        <div class="ob-card ob-card--wide">
            <div class="ob-header">
                <h2 class="ob-title">Which subjects are you doing?</h2>
                <p class="ob-subtitle">
                    All subjects are selected by default. Uncheck any you will not be doing —
                    they will be hidden from your pool but shown in a greyed section below
                    and can be restored at any time.
                </p>
            </div>
            ${renderGroupedCheckboxes('ob-doing', true)}
            <div class="ob-hidden-preview" id="ob-hidden-preview" aria-live="polite"></div>
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">Back</button>
                <button class="ob-btn ob-btn--primary"  id="ob-next">Next</button>
            </div>
        </div>
    `;

    // Live-update the hidden preview as checkboxes change
    function updateHiddenPreview() {
        const uncheckedIds = [...overlay.querySelectorAll('input[name="ob-doing"]:not(:checked)')]
            .map(el => el.value);
        const preview = overlay.querySelector('#ob-hidden-preview');
        if (uncheckedIds.length === 0) {
            preview.innerHTML = '';
            return;
        }
        const grouped = GROUPS.map(g => {
            const items = uncheckedIds
                .map(id => subjects.find(s => s.id === id))
                .filter(s => s && s.group === g.key);
            if (items.length === 0) return '';
            return `
                <div class="ob-hidden-group">
                    <span class="ob-hidden-group-label">${g.label} — hidden</span>
                    <div class="ob-hidden-chips">
                        ${items.map(s =>
                            `<span class="ob-chip ob-chip--hidden">${s.id}&nbsp;${s.name}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }).join('');
        preview.innerHTML = `
            <div class="ob-hidden-section">
                <p class="ob-hidden-title">Hidden subjects — will not appear in your pool:</p>
                ${grouped}
            </div>
        `;
    }

    overlay.querySelectorAll('input[name="ob-doing"]').forEach(cb => {
        cb.addEventListener('change', updateHiddenPreview);
    });

    overlay.querySelector('#ob-back').addEventListener('click', () => showStep(overlay, 'path-select', onComplete));
    overlay.querySelector('#ob-next').addEventListener('click', () => {
        const doing  = getCheckedIds(overlay, 'ob-doing');
        const hidden = subjects.map(s => s.id).filter(id => !doing.includes(id));
        showStep(overlay, 'confirm-c', onComplete, { doing, hidden });
    });
}

function renderConfirmC(overlay, onComplete, ctx) {
    const hiddenNames = ctx.hidden.map(id => {
        const s = subjects.find(sub => sub.id === id);
        return s ? `${s.id}: ${s.name}` : id;
    });

    overlay.innerHTML = `
        <div class="ob-card">
            <div class="ob-header">
                <h2 class="ob-title">Confirm your selection</h2>
                <p class="ob-subtitle">
                    Your pool will show <strong>${ctx.doing.length}</strong> subject${ctx.doing.length !== 1 ? 's' : ''}.
                    ${ctx.hidden.length > 0
                        ? `<strong>${ctx.hidden.length}</strong> subject${ctx.hidden.length !== 1 ? 's' : ''} will be hidden.`
                        : 'All subjects are included.'}
                </p>
            </div>
            ${ctx.hidden.length > 0 ? `
            <details class="ob-hidden-preview">
                <summary>View hidden subjects (${ctx.hidden.length})</summary>
                <ul class="ob-confirm-list ob-confirm-list--muted">
                    ${hiddenNames.map(n => `<li>${n}</li>`).join('')}
                </ul>
            </details>` : ''}
            <p class="ob-note">Hidden subjects can be restored at any time from the subject pool.</p>
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">Back</button>
                <button class="ob-btn ob-btn--primary"  id="ob-confirm">Confirm and start planning</button>
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
        if (groupSubjects.length === 0) return '';
        const rows = groupSubjects.map(s => `
            <label class="ob-check-row">
                <input type="checkbox" name="${namePrefix}" value="${s.id}" ${defaultChecked ? 'checked' : ''}>
                <span class="ob-check-name">${s.id}: ${s.name}</span>
                <span class="ob-check-meta">${s.terms.join(' / ')} &nbsp;&middot;&nbsp; ${s.lecture}</span>
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
