import { PlannerState } from '../../planner.js';

/**
 * Updates the progress tracker section:
 * compulsory count, elective count, progress bars, graduation status.
 */
export function renderProgress() {
    const progress = PlannerState.getProgress();
    const compPercent = Math.min((progress.compulsory.current / progress.compulsory.required) * 100, 100);
    const elecPercent = Math.min((progress.electives.current / progress.electives.required) * 100, 100);

    document.getElementById('compulsory-text').innerText = `${progress.compulsory.current} / ${progress.compulsory.required}`;
    document.getElementById('elective-text').innerText   = `${progress.electives.current} / ${progress.electives.required}`;
    document.getElementById('compulsory-bar').style.width = `${compPercent}%`;
    document.getElementById('elective-bar').style.width   = `${elecPercent}%`;

    const statusEl = document.getElementById('grad-status');
    if (progress.readyToGraduate) {
        statusEl.innerText = 'Status: 🎉 Requirements Met! Ready to Graduate.';
        statusEl.style.color = '#4ade80';
    } else {
        statusEl.innerText = 'Status: Planning...';
        statusEl.style.color = '#fbbf24';
    }
}
