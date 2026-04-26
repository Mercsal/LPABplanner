// js/services/stats-service.js
// Lookup helpers for exam statistics data.
// ─────────────────────────────────────────────────────────────────
// This module has NO knowledge of the DOM or any UI module.
// All threshold logic lives here — UI components only receive
// band strings ('low' | 'medium' | 'high') or structured data.
// ─────────────────────────────────────────────────────────────────

import * as allStats from '../../data/stats/index.js';

// ─── Internal helpers ─────────────────────────────────────────────

// Returns all registered term keys sorted chronologically, oldest first.
// Convention: 'summer' or 'winter' + 4-digit year.
function sortedTerms() {
    return Object.keys(allStats).sort((a, b) => {
        const yearA = parseInt(a.match(/\d{4}/)[0], 10);
        const yearB = parseInt(b.match(/\d{4}/)[0], 10);
        if (yearA !== yearB) return yearA - yearB;
        // Within the same year: summer (March) before winter (July)
        const orderA = a.startsWith('summer') ? 0 : 1;
        const orderB = b.startsWith('summer') ? 0 : 1;
        return orderA - orderB;
    });
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Returns the full stats object for a specific term, or null if unavailable.
 * @param {string} termId  e.g. 'summer2026'
 * @returns {object|null}
 */
export function getStatsForTerm(termId) {
    return allStats[termId] ?? null;
}

/**
 * Returns an array of { term, label, stats } for a given subject,
 * sorted oldest-first. Only terms where that subject appeared are included.
 * @param {string} subjectId  e.g. '04'
 * @returns {Array<{ term: string, label: string, stats: object }>}
 */
export function getTermHistoryForSubject(subjectId) {
    return sortedTerms()
        .map(termId => {
            const termData = allStats[termId];
            const stats = termData?.subjects?.[subjectId];
            if (!stats) return null;
            return { term: termId, label: termData.label, stats };
        })
        .filter(Boolean);
}

/**
 * Returns the most recent stats entry for a subject, or null if none exist.
 * @param {string} subjectId
 * @returns {{ term: string, label: string, stats: object }|null}
 */
export function getLatestStatsForSubject(subjectId) {
    const history = getTermHistoryForSubject(subjectId);
    return history.length ? history[history.length - 1] : null;
}

/**
 * Returns subjects whose most recent fail rate is at or above the threshold.
 * Sorted by fail rate descending.
 * @param {number} [threshold=25]
 * @returns {Array<{ subjectId, term, label, failPct, stats }>}
 */
export function getHighFailSubjects(threshold = 25) {
    const subjectIds = new Set(
        Object.values(allStats).flatMap(t => Object.keys(t.subjects))
    );
    return Array.from(subjectIds)
        .map(subjectId => {
            const latest = getLatestStatsForSubject(subjectId);
            if (!latest) return null;
            return {
                subjectId,
                term:    latest.term,
                label:   latest.label,
                failPct: latest.stats.fail,
                stats:   latest.stats
            };
        })
        .filter(entry => entry && entry.failPct >= threshold)
        .sort((a, b) => b.failPct - a.failPct);
}

/**
 * Returns a difficulty band based on the most recent fail rate.
 * Threshold logic is centralised here — not in CSS or UI components.
 *
 *   'low'    — fail < 15%
 *   'medium' — fail 15–29%
 *   'high'   — fail ≥ 30%
 *   null     — no data available for this subject
 *
 * @param {string} subjectId
 * @returns {'low'|'medium'|'high'|null}
 */
export function getDifficultyBand(subjectId) {
    const latest = getLatestStatsForSubject(subjectId);
    if (!latest) return null;
    const f = latest.stats.fail;
    if (f >= 30) return 'high';
    if (f >= 15) return 'medium';
    return 'low';
}

/**
 * Returns all available terms as label pairs, sorted newest-first.
 * Useful for building a term selector dropdown in the UI.
 * @returns {Array<{ termId: string, label: string }>}
 */
export function getAvailableTerms() {
    return sortedTerms()
        .reverse()
        .map(termId => ({ termId, label: allStats[termId].label }));
}
