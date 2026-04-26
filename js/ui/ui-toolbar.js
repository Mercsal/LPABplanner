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
        const termName = term.replace('winter','Winter ').replace('summer','Summer ');
        text += `## ${termName}\n`;
        (plan[term] || []).forEach(s => {
            text += `- ${s.id}: ${s.name} (${s.lecture}${s.exam ? ', Exam: ' + s.exam : ''})\n`;
        });
        text += '\n';
    });

    navigator.clipboard.writeText(text)
        .then(() => showToast('Plan copied to clipboard!'))
        .catch(() => showToast('Could not copy — please copy manually.', true));
}

function handleReset() {
    showResetModal();
}

function showResetModal() {
    const existing = document.getElementById('reset-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'reset-modal';
    modal.className = 'ob-modal-backdrop';
    modal.innerHTML = `
        <div class="ob-modal">
            <h2>Reset your plan</h2>
            <p>What would you like to do?</p>
            <div class="ob-reset-options">
                <button class="ob-reset-option" id="reset-plan-only">
                    <span class="ob-reset-icon">🗑️</span>
                    <strong>Clear current plan</strong>
                    <span>Remove all semester placements and completed subjects. Returns everything to the pool. Your hidden subject preferences are kept.</span>
                </button>
                <button class="ob-reset-option ob-reset-option--danger" id="reset-full">
                    <span class="ob-reset-icon">⚠️</span>
                    <strong>Start over entirely</strong>
                    <span>Clear the plan AND all preferences. The setup wizard will appear on next load.</span>
                </button>
            </div>
            <div class="ob-actions" style="margin-top:1.5rem;">
                <button class="ob-btn ob-btn--secondary" id="reset-cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#reset-cancel').addEventListener('click',    () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelector('#reset-plan-only').addEventListener('click', () => {
        if (!confirm('This will clear all your planned and completed subjects. Continue?')) return;
        PlannerState.resetPlanOnly();
        modal.remove();
        renderPlannerBoard();
        renderSubjectPool();
        showToast('Plan cleared.');
    });

    modal.querySelector('#reset-full').addEventListener('click', () => {
        if (!confirm('This will clear everything including your preferences. The setup wizard will run again. Continue?')) return;
        clearAll();
        modal.remove();
        showToast('All data cleared. Reloading…');
        setTimeout(() => location.reload(), 1000);
    });
}

function showToast(message, isError = false) {
    const existing = document.getElementById('ob-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'ob-toast';
    toast.className = `ob-toast${isError ? ' ob-toast--error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
