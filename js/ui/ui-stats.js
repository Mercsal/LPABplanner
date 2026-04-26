// js/ui/ui-stats.js
// Reusable stats UI components consumed by ui-pool and ui-board.
// ─────────────────────────────────────────────────────────────────
// Knows about DOM creation, knows nothing about PlannerState.
// All data comes from stats-service helpers.
// ─────────────────────────────────────────────────────────────────

import {
    getLatestStatsForSubject,
    getTermHistoryForSubject,
    getDifficultyBand,
    effectiveFail,
    normalisedBands,
    bandLabels
} from '../services/stats-service.js';

// ─── Difficulty badge ─────────────────────────────────────────────

/**
 * Returns a <span class="stats-badge stats-badge--{band}"> element for a
 * subject, or null if no stats exist.
 *
 * Bands:
 *   low    → green  (effectiveFail < 15 %)
 *   medium → amber  (15 – 29 %)
 *   high   → red    (≥ 30 %)
 *
 * @param {string} subjectId
 * @returns {HTMLElement|null}
 */
export function createDifficultyBadge(subjectId) {
    const band = getDifficultyBand(subjectId);
    if (!band) return null;

    const latest = getLatestStatsForSubject(subjectId);
    const failPct = effectiveFail(latest.stats);

    const labels = { low: 'Low fail rate', medium: 'Moderate fail rate', high: 'High fail rate' };
    const icons  = { low: '✓', medium: '~', high: '!' };

    const span = document.createElement('span');
    span.className = `stats-badge stats-badge--${band}`;
    span.textContent = `${icons[band]} ${failPct.toFixed(0)}% fail`;
    span.title = `${labels[band]} (${latest.label})`;
    return span;
}

// ─── Grade bar ────────────────────────────────────────────────────

/**
 * Creates a collapsible <details class="stats-bar"> element showing
 * the grade breakdown bar for the most recent term in which the
 * subject was examined. Returns null if no stats exist.
 *
 * Clicking the <summary> expands a legend and a note about the term.
 *
 * @param {string} subjectId
 * @returns {HTMLElement|null}
 */
export function createGradeBar(subjectId) {
    const latest = getLatestStatsForSubject(subjectId);
    if (!latest) return null;

    const { stats, label, gradingScheme } = latest;
    const bands  = normalisedBands(stats, gradingScheme);
    const labels = bandLabels(gradingScheme);
    const fail   = effectiveFail(stats);

    // Segments: fail uses effectiveFail so DNS is included.
    // Pass/credit/distinction/hd remain as published (% of sat cohort).
    // The bar does not need to sum to exactly 100 — remaining space is the
    // published fail %, but we always render effectiveFail for the red seg.
    const segments = [
        { key: 'fail',        pct: fail,                color: 'var(--stats-fail)',        label: labels.fail },
        { key: 'pass',        pct: bands.pass,           color: 'var(--stats-pass)',        label: labels.pass },
        { key: 'credit',      pct: bands.credit,         color: 'var(--stats-credit)',      label: labels.credit },
        { key: 'distinction', pct: bands.distinction,    color: 'var(--stats-distinction)', label: labels.distinction },
        { key: 'hd',          pct: bands.hd,             color: 'var(--stats-hd)',          label: labels.hd }
    ].filter(s => s.pct != null && s.pct > 0);

    const details = document.createElement('details');
    details.className = 'stats-bar';

    // Summary line: bar + term label
    const summary = document.createElement('summary');
    summary.className = 'stats-bar__summary';
    summary.setAttribute('aria-label', `Grade breakdown for ${label}`);

    const track = document.createElement('div');
    track.className = 'stats-bar__track';
    track.setAttribute('role', 'img');
    track.setAttribute('aria-label', `Grade distribution: ${segments.map(s => `${s.label} ${s.pct.toFixed(0)}%`).join(', ')}`);

    segments.forEach(seg => {
        const seg_el = document.createElement('div');
        seg_el.className = 'stats-bar__seg';
        seg_el.style.width = `${seg.pct}%`;
        seg_el.style.background = seg.color;
        seg_el.title = `${seg.label}: ${seg.pct.toFixed(1)}%`;
        track.appendChild(seg_el);
    });

    const termNote = document.createElement('span');
    termNote.className = 'stats-bar__term';
    termNote.textContent = label;

    summary.appendChild(track);
    summary.appendChild(termNote);
    details.appendChild(summary);

    // Expanded legend
    const legend = document.createElement('div');
    legend.className = 'stats-bar__legend';

    segments.forEach(seg => {
        const item = document.createElement('span');
        item.className = 'stats-bar__legend-item';
        item.innerHTML = `<span class="stats-bar__dot" style="background:${seg.color}"></span>${seg.label}: <strong>${seg.pct.toFixed(1)}%</strong>`;
        legend.appendChild(item);
    });

    // DNS footnote when DNS > 0
    const dns = stats.dns ?? 0;
    if (dns > 0) {
        const note = document.createElement('p');
        note.className = 'stats-bar__dns-note';
        note.textContent = `⚠ ${dns} candidate${dns === 1 ? '' : 's'} did not sit — included in fail rate above.`;
        legend.appendChild(note);
    }

    details.appendChild(legend);
    return details;
}

// ─── Term history table ───────────────────────────────────────────

/**
 * Creates a <div class="stats-history"> element with a compact table
 * showing fail % (effective) across all terms the subject has data for.
 * Returns null if fewer than 2 terms exist (a single data point isn't
 * meaningful as a trend).
 *
 * @param {string} subjectId
 * @returns {HTMLElement|null}
 */
export function createHistoryTable(subjectId) {
    const history = getTermHistoryForSubject(subjectId);
    if (history.length < 2) return null;

    const container = document.createElement('div');
    container.className = 'stats-history';

    const table = document.createElement('table');
    table.className = 'stats-history__table';
    table.setAttribute('aria-label', `Historical fail rates for subject ${subjectId}`);

    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Term</th><th>Fail %</th><th>Sat</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    history.slice().reverse().forEach(entry => {
        const f = effectiveFail(entry.stats);
        const bandClass = f >= 30 ? 'high' : f >= 15 ? 'medium' : 'low';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${entry.label}</td>
            <td class="stats-history__fail stats-history__fail--${bandClass}">${f.toFixed(1)}%</td>
            <td class="stats-history__sat">${entry.stats.sat ?? '—'}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
    return container;
}
