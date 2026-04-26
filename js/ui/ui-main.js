// ui-main.js — entry point, wires all UI modules together
import { PlannerState } from '../../planner.js';
import { isOnboardingDone } from '../state/storage.js';
import { showOnboardingIfNeeded, showOnboarding } from './ui-onboarding.js';
import { renderSubjectPool } from './ui-pool.js';
import { renderPlannerBoard } from './ui-board.js';
import { setupExportButton } from './ui-toolbar.js';

export const feedbackPanel = document.getElementById('feedback-panel');
export const errorListEl   = document.getElementById('error-list');

export function refreshAll() {
    renderPlannerBoard();
    renderSubjectPool();
}

function startApp() {
    PlannerState.loadData();
    renderPlannerBoard();
    renderSubjectPool();
    setupExportButton();

    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) helpBtn.onclick = () => showOnboarding();
}

function init() {
    if (!isOnboardingDone()) {
        showOnboardingIfNeeded(startApp);
    } else {
        startApp();
    }
}

init();
