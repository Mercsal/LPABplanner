/**
 * ui-onboarding.js
 *
 * Two distinct flows:
 *
 *   showOnboardingIfNeeded(onComplete)
 *     — First-run setup wizard (path A / B / C).
 *     — Shown once on first visit. Calls onComplete() when finished.
 *     — Writes lpab_onboarding_done to localStorage via markOnboardingDone().
 *
 *   showOnboarding()
 *     — Tile-based help tour. Triggered by the Help / Tour button.
 *     — Can be shown any number of times. No onComplete needed.
 *     — Uses the existing #onboarding-overlay HTML structure.
 *
 * Design rules:
 *   - No emoji in headings or tiles.
 *   - Wizard renders its own HTML inside #onboarding-overlay (innerHTML).
 *   - Tour uses the fixed HTML structure already in index.html.
 *   - Neither function touches the DOM outside #onboarding-overlay.
 */

import { subjects, currentTerm } from '../../subjects.js';
import { PlannerState } from '../state/planner-state.js';
import { markOnboardingDone } from '../state/storage.js';
import { SUGGESTED_PATHWAY, generateTermSequence } from '../data/suggested-pathway.js';

// ─────────────────────────────────────────────────────────────────────────────
// FIRST-RUN WIZARD  (showOnboardingIfNeeded)
// ─────────────────────────────────────────────────────────────────────────────

const GROUPS = [
    { key: 'core',       label: 'Core Subjects',       note: 'Must be taken in sequence — subjects 01 to 11' },
    { key: 'compulsory', label: 'Compulsory Subjects',  note: 'Mandatory — may be completed in any order' },
    { key: 'elective',   label: 'Elective Subjects',    note: 'Choose any 3' },
];

export function showOnboardingIfNeeded(onComplete) {
    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }
    overlay.className = 'ob-overlay';
    showWizardStep(overlay, 'path-select', onComplete);
}

function showWizardStep(overlay, step, onComplete, ctx = {}) {
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

// ── Step: Choose a path ───────────────────────────────────────────────────────

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
            if (path === 'A') showWizardStep(overlay, 'pathway-confirm', onComplete);
            if (path === 'B') showWizardStep(overlay, 'completed-pick',  onComplete);
            if (path === 'C') showWizardStep(overlay, 'subject-pick',    onComplete);
        });
    });
}

// ── Path A: Suggested pathway ─────────────────────────────────────────────────

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
                            ? `<span class="ob-chip ob-chip--${s.group}">${s.id}&nbsp;${s.name}</span>`
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

    overlay.querySelector('#ob-back').addEventListener('click',  () => showWizardStep(overlay, 'path-select', onComplete));
    overlay.querySelector('#ob-blank').addEventListener('click', () => finishWizard(overlay, onComplete));
    overlay.querySelector('#ob-apply').addEventListener('click', () => {
        applyPathway(terms);
        finishWizard(overlay, onComplete);
    });
}

function applyPathway(terms) {
    SUGGESTED_PATHWAY.forEach((sem, i) => {
        const termId = terms[i];
        sem.subjects.forEach(id => {
            const subject = subjects.find(s => s.id === id);
            if (subject) PlannerState.addSubject(termId, subject);
        });
    });
}

// ── Path B: Pick completed subjects ──────────────────────────────────────────

function renderCompletedPick(overlay, onComplete) {
    overlay.innerHTML = `
        <div class="ob-card ob-card--wide">
            <div class="ob-header">
                <h2 class="ob-title">Which subjects have you completed?</h2>
                <p class="ob-subtitle">These will be moved to your Completed section. Tick all that apply.</p>
            </div>
            <div class="ob-groups-scroll">
                ${renderGroupedCheckboxes('ob-completed', false)}
            </div>
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">Back</button>
                <button class="ob-btn ob-btn--primary"  id="ob-next">Next</button>
            </div>
        </div>
    `;

    overlay.querySelector('#ob-back').addEventListener('click', () => showWizardStep(overlay, 'path-select', onComplete));
    overlay.querySelector('#ob-next').addEventListener('click', () => {
        const checked = getCheckedIds(overlay, 'ob-completed');
        if (checked.length === 0) {
            finishWizard(overlay, onComplete);
        } else {
            showWizardStep(overlay, 'confirm-b', onComplete, { checked });
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

    overlay.querySelector('#ob-back').addEventListener('click',    () => showWizardStep(overlay, 'completed-pick', onComplete));
    overlay.querySelector('#ob-confirm').addEventListener('click', () => {
        ctx.checked.forEach(id => {
            const subject = subjects.find(s => s.id === id);
            if (subject) PlannerState.addSubject('completed', subject);
        });
        finishWizard(overlay, onComplete);
    });
}

// ── Path C: Pick subjects to include ─────────────────────────────────────────

function renderSubjectPick(overlay, onComplete) {
    overlay.innerHTML = `
        <div class="ob-card ob-card--wide">
            <div class="ob-header">
                <h2 class="ob-title">Which subjects are you doing?</h2>
                <p class="ob-subtitle">
                    All subjects are selected by default. Uncheck any you will not be doing —
                    they will be hidden from your pool but can be restored at any time.
                </p>
            </div>
            <div class="ob-groups-scroll">
                ${renderGroupedCheckboxes('ob-doing', true)}
                <div class="ob-hidden-preview" id="ob-hidden-preview" aria-live="polite"></div>
            </div>
            <div class="ob-actions">
                <button class="ob-btn ob-btn--secondary" id="ob-back">Back</button>
                <button class="ob-btn ob-btn--primary"  id="ob-next">Next</button>
            </div>
        </div>
    `;

    function updateHiddenPreview() {
        const uncheckedIds = [...overlay.querySelectorAll('input[name="ob-doing"]:not(:checked)')]
            .map(el => el.value);
        const preview = overlay.querySelector('#ob-hidden-preview');
        if (uncheckedIds.length === 0) { preview.innerHTML = ''; return; }
        const grouped = GROUPS.map(g => {
            const items = uncheckedIds
                .map(id => subjects.find(s => s.id === id))
                .filter(s => s && s.group === g.key);
            if (items.length === 0) return '';
            return `
                <div class="ob-hidden-group">
                    <span class="ob-hidden-group-label">${g.label} — hidden</span>
                    <div class="ob-hidden-chips">
                        ${items.map(s => `<span class="ob-chip ob-chip--hidden">${s.id}&nbsp;${s.name}</span>`).join('')}
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

    overlay.querySelector('#ob-back').addEventListener('click', () => showWizardStep(overlay, 'path-select', onComplete));
    overlay.querySelector('#ob-next').addEventListener('click', () => {
        const doing  = getCheckedIds(overlay, 'ob-doing');
        const hidden = subjects.map(s => s.id).filter(id => !doing.includes(id));
        showWizardStep(overlay, 'confirm-c', onComplete, { doing, hidden });
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

    overlay.querySelector('#ob-back').addEventListener('click',    () => showWizardStep(overlay, 'subject-pick', onComplete));
    overlay.querySelector('#ob-confirm').addEventListener('click', () => {
        PlannerState.setHidden(ctx.hidden);
        finishWizard(overlay, onComplete);
    });
}

// ── Wizard helpers ────────────────────────────────────────────────────────────

function renderGroupedCheckboxes(namePrefix, defaultChecked) {
    return GROUPS.map(group => {
        const groupSubjects = subjects.filter(s => s.group === group.key);
        if (groupSubjects.length === 0) return '';
        const rows = groupSubjects.map(s => `
            <label class="ob-check-row">
                <input type="checkbox" name="${namePrefix}" value="${s.id}" ${defaultChecked ? 'checked' : ''}>
                <span class="ob-check-name">${s.id}: ${s.name}</span>
                <span class="ob-check-meta">${s.terms.join(' / ')} &middot; ${s.lecture}</span>
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

function finishWizard(overlay, onComplete) {
    markOnboardingDone();
    overlay.style.display = 'none';
    overlay.innerHTML = '';
    if (typeof onComplete === 'function') onComplete();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELP TOUR  (showOnboarding)
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
    {
        title: 'Welcome to the LPAB Elective Planner',
        tiles: [
            { heading: 'Plan your diploma',     body: 'Map out every subject across your winter and summer semesters, from now until graduation.' },
            { heading: 'Spot clashes instantly', body: 'The planner highlights lecture-night and exam conflicts the moment they occur, so you can adjust before it matters.' },
            { heading: 'Track your progress',   body: 'The progress bar at the top shows how many compulsory and elective subjects you have placed or completed.' },
        ]
    },
    {
        title: 'How to build your plan',
        tiles: [
            { heading: 'Browse the subject pool', body: 'All available subjects are listed in the left-hand panel. Use the filter to narrow by semester, type, or lecture night.' },
            { heading: 'Drag into a semester',    body: 'Drag any subject from the pool into the semester card where you intend to take it. Each semester holds a maximum of four subjects.' },
            { heading: 'Mark subjects complete',  body: 'Once you have finished a subject, double-click its tile or press the Done button to move it to the Completed section.' },
        ]
    },
    {
        title: 'Clashes and warnings',
        tiles: [
            { heading: 'Lecture clash',        body: 'Two subjects in the same semester sharing the same lecture night are highlighted with a red border. Move one to a different semester to resolve it.' },
            { heading: 'Exam clash',           body: 'Subjects whose final exams overlap in time are also flagged. Check the exam date on each tile before confirming your choices.' },
            { heading: 'Semester availability', body: 'Some subjects run in winter only, others in summer only. Subjects greyed out in the pool cannot be taken in the currently selected semester.' },
        ]
    }
];

export function showOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;

    // Restore the fixed HTML structure the tour relies on
    overlay.className = '';
    overlay.innerHTML = `
        <div class="onboarding-modal">
            <button id="onboarding-close" class="onboarding-close" aria-label="Close">&times;</button>
            <h2 id="onboarding-title" class="onboarding-modal__title"></h2>
            <div id="onboarding-tiles" class="onboarding-tiles"></div>
            <div class="onboarding-footer">
                <div class="onboarding-dots">
                    ${STEPS.map(() => '<span class="onboarding-dot"></span>').join('')}
                </div>
                <div class="onboarding-footer__actions">
                    <button id="onboarding-back" class="toolbar-btn btn-print onboarding-btn">Back</button>
                    <button id="onboarding-next" class="toolbar-btn btn-export onboarding-btn">Next</button>
                </div>
            </div>
        </div>
    `;

    let currentStep = 0;
    renderTourStep(overlay, currentStep);
    overlay.style.display = 'flex';
    document.addEventListener('keydown', handleEscape);

    function renderTourStep(overlay, stepIndex) {
        const step = STEPS[stepIndex];
        overlay.querySelector('#onboarding-title').textContent = step.title;

        const tilesContainer = overlay.querySelector('#onboarding-tiles');
        tilesContainer.innerHTML = '';
        step.tiles.forEach(tile => {
            const div = document.createElement('div');
            div.className = 'onboarding-tile';
            div.innerHTML = `
                <strong class="onboarding-tile__heading">${tile.heading}</strong>
                <p class="onboarding-tile__body">${tile.body}</p>
            `;
            tilesContainer.appendChild(div);
        });

        overlay.querySelectorAll('.onboarding-dot').forEach((dot, i) => {
            dot.classList.toggle('onboarding-dot--active', i === stepIndex);
        });

        const backBtn = overlay.querySelector('#onboarding-back');
        backBtn.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
        backBtn.onclick = () => { if (currentStep > 0) { currentStep--; renderTourStep(overlay, currentStep); } };

        const nextBtn = overlay.querySelector('#onboarding-next');
        const isLast  = stepIndex === STEPS.length - 1;
        nextBtn.textContent = isLast ? 'Get Started' : 'Next';
        nextBtn.onclick = () => {
            if (isLast) { closeTour(); } else { currentStep++; renderTourStep(overlay, currentStep); }
        };
    }

    function closeTour() {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
        document.removeEventListener('keydown', handleEscape);
    }

    function handleEscape(e) { if (e.key === 'Escape') closeTour(); }

    overlay.querySelector('#onboarding-close').onclick = closeTour;
}
