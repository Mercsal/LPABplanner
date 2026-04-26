// ui-main.js — entry point, wires all UI modules together
import { PlannerState } from '../../planner.js';
import { renderSubjectPool } from './ui-pool.js';
import { renderPlannerBoard } from './ui-board.js';
import { setupExportButton } from './ui-toolbar.js';

export const feedbackPanel = document.getElementById('feedback-panel');
export const errorListEl = document.getElementById('error-list');

export function refreshAll() {
    renderPlannerBoard();
    renderSubjectPool();
}

function init() {
    PlannerState.loadData();
    renderPlannerBoard();
    renderSubjectPool();
    setupExportButton();
}

init();
