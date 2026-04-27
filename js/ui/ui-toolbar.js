// ui-toolbar.js — export, print, and reset buttons
import { PlannerState } from '../../planner.js';
import { clearAll } from '../state/storage.js';
import { renderPlannerBoard } from './ui-board.js';
import { renderSubjectPool } from './ui-pool.js';

export function setupExportButton() {
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', handleExport);

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', handleReset);
}

function handleExport() {
    const plan = PlannerState.getPlan();
    let text = '# LPAB Course Plan\n\n';

    const completed = plan['completed'] || [];
    if (completed.length) {
        text += '## Completed\n';
        completed.forEach(s => { text += `- ${s.id}: ${s.name}\n`; });
        text += '\n';
    }

    Object.keys(plan).filter(k => k !== 'completed').sort().forEach(term => {
        const termName = term.replace('winter', 'Winter ').replace('summer', 'Summer ');
        text += `## ${termName}\n`;
        (plan[term] || []).forEach(s => {
            text += `- ${s.id}: ${s.name} (${s.lecture}${s.exam ? ', Exam: ' + s.exam : ''})\n`;
        });
        text += '\n';
    });

    navigator.clipboard.writeText(text)
        .then(() => showToast('Plan copied to clipboard!'))
        .catch(() => showToast('Could not copy — please try again.', true));
}

function handleReset() {
    showResetModal();
}

/**
 * Two-step reset modal.
 *
 * Step 1 — present two options:
 *   • Clear current plan  (keeps nothing — all semesters and completed cleared)
 *   • Start over entirely (clears plan + preferences, reruns onboarding)
 *
 * Step 2 — inline confirmation replaces the options before executing,
 *   so the user must consciously confirm. No browser confirm() dialogs.
 */
function showResetModal() {
    const existing = document.getElementById('reset-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'reset-modal';
    modal.className = 'ob-modal-backdrop';
    modal.innerHTML = `
        <div class="ob-modal" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
            <h2 id="reset-modal-title" class="ob-modal-title">Reset your plan</h2>
            <p class="ob-modal-body">Choose what you would like to reset.</p>
            <div class="ob-reset-options" id="reset-step-1">
                <button class="ob-reset-option" id="reset-plan-only">
                    <strong class="ob-reset-option-label">Clear current plan</strong>
                    <span class="ob-reset-option-desc">Remove all semester placements and completed subjects. Everything returns to the subject pool. Your hidden subject preferences are kept.</span>
                </button>
                <button class="ob-reset-option ob-reset-option--danger" id="reset-full">
                    <strong class="ob-reset-option-label">Start over entirely</strong>
                    <span class="ob-reset-option-desc">Clear your plan and all preferences. The setup wizard will appear again on the next load.</span>
                </button>
            </div>
            <div class="ob-reset-confirm" id="reset-step-2" style="display:none;">
                <p class="ob-reset-confirm-msg" id="reset-confirm-msg"></p>
                <div class="ob-actions">
                    <button class="ob-btn ob-btn--secondary" id="reset-back">Go back</button>
                    <button class="ob-btn ob-btn--danger"    id="reset-confirm-yes">Yes, continue</button>
                </div>
            </div>
            <div class="ob-actions" id="reset-cancel-row">
                <button class="ob-btn ob-btn--secondary" id="reset-cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    modal.querySelector('#reset-cancel').addEventListener('click', () => modal.remove());

    let pendingAction = null;

    function showConfirmStep(message, action) {
        pendingAction = action;
        modal.querySelector('#reset-step-1').style.display = 'none';
        modal.querySelector('#reset-cancel-row').style.display = 'none';
        modal.querySelector('#reset-confirm-msg').textContent = message;
        modal.querySelector('#reset-step-2').style.display = 'block';
    }

    function backToStep1() {
        pendingAction = null;
        modal.querySelector('#reset-step-2').style.display = 'none';
        modal.querySelector('#reset-step-1').style.display = 'flex';
        modal.querySelector('#reset-cancel-row').style.display = 'flex';
    }

    modal.querySelector('#reset-plan-only').addEventListener('click', () => {
        showConfirmStep(
            'This will remove all planned and completed subjects. Your hidden subject preferences will be kept. This cannot be undone.',
            'plan-only'
        );
    });

    modal.querySelector('#reset-full').addEventListener('click', () => {
        showConfirmStep(
            'This will clear your entire plan and all preferences. The setup wizard will run again on next load. This cannot be undone.',
            'full'
        );
    });

    modal.querySelector('#reset-back').addEventListener('click', backToStep1);

    modal.querySelector('#reset-confirm-yes').addEventListener('click', () => {
        if (pendingAction === 'plan-only') {
            PlannerState.resetPlanOnly();
            modal.remove();
            renderPlannerBoard();
            renderSubjectPool();
            showToast('Plan cleared.');
        } else if (pendingAction === 'full') {
            clearAll();
            modal.remove();
            showToast('All data cleared. Reloading…');
            setTimeout(() => location.reload(), 1000);
        }
    });
}

/**
 * Show a brief fixed-position toast message.
 * Stage 3: exported so ui-board.js can fire toasts for touch drop errors,
 * keeping feedback visible regardless of scroll position.
 *
 * @param {string}  message  Text to display.
 * @param {boolean} isError  When true, renders with error styling.
 */
export function showToast(message, isError = false) {
    const existing = document.getElementById('ob-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'ob-toast';
    toast.className = `ob-toast${isError ? ' ob-toast--error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
