// js/services/stats-service.js
// Lookup helpers for exam statistics data.
// ─────────────────────────────────────────────────────────────────
// This module has NO knowledge of the DOM or any UI module.
// All threshold logic lives here — UI components only receive
// band strings ('low' | 'medium' | 'high') or structured data.
//
// Grading schemes
// ───────────────
// v1  (prior to Term 2, 2024)
//   fail | pass | merit | distinction
// v2  (Term 2, 2024 onward)
//   fail | pass | credit | distinction | hd
//
// DNS rule
// ────────
// Candidates who Did Not Sit are stored as a raw count on each subject.
// effectiveFail = fail + (dns / (sat + dns)) * 100
// All public helpers that return a fail figure use effectiveFail by default.
// Raw fail (as published) is available via the stats object directly.
// ─────────────────────────────────────────────────────────────────

import * as allStats from '../../data/stats/index.js';

// ─── Internal helpers ─────────────────────────────────────────────

function sortedTerms() {
    return Object.keys(allStats).sort((a, b) => {
        const yearA = parseInt(a.match(/\d{4}/)[0], 10);
        const yearB = parseInt(b.match(/\d{4}/)[0], 10);
        if (yearA !== yearB) return yearA - yearB;
        const orderA = a.startsWith('summer') ? 0 : 1;
        const orderB = b.startsWith('summer') ? 0 : 1;
        return orderA - orderB;
    });
}

/**
 * Calculates the effective fail rate for a subject entry, treating
 * DNS (Did Not Sit) candidates as fails.
 *
 * effectiveFail = fail% of sat cohort, scaled to enrolled cohort
 *   = (failCount + dnsCount) / (sat + dns) * 100
 *
 * If dns is absent or zero, returns the published fail% unchanged.
 *
 * @param {object} stats  Subject stats object from a term file
 * @returns {number}  Effective fail % (rounded to 2 dp)
 */
export function effectiveFail(stats) {
    const dns = stats.dns ?? 0;
    if (dns === 0) return stats.fail;
    const sat = stats.sat ?? 0;
    if (sat + dns === 0) return stats.fail;
    const failCount = (stats.fail / 100) * sat;
    return Math.round(((failCount + dns) / (sat + dns)) * 10000) / 100;
}

/**
 * Returns a normalised grade-band object for a subject entry,
 * mapping v1 and v2 fields to a common shape:
 *
 *   { fail, pass, credit, distinction, hd }
 *
 * v1 mapping:
 *   merit      → credit
 *   distinction → distinction
 *   hd          → null (not separately reported)
 *
 * v2 fields are returned as-is.
 * All values are the published percentages of sat candidates.
 *
 * @param {object} stats         Subject stats object
 * @param {string} gradingScheme 'v1' | 'v2'
 * @returns {{ fail: number, pass: number, credit: number|null, distinction: number, hd: number|null }}
 */
export function normalisedBands(stats, gradingScheme) {
    if (gradingScheme === 'v1') {
        return {
            fail:        stats.fail,
            pass:        stats.pass,
            credit:      stats.merit   ?? null,  // v1 'merit' = v2 'credit' range (65–74)
            distinction: stats.distinction,
            hd:          null                    // v1 did not split 75–84 from 85–100
        };
    }
    return {
        fail:        stats.fail,
        pass:        stats.pass,
        credit:      stats.credit      ?? null,
        distinction: stats.distinction,
        hd:          stats.hd          ?? null
    };
}

/**
 * Returns the human-readable label for each grade band given a scheme.
 * Useful for rendering column headers and tooltips.
 *
 * @param {'v1'|'v2'} gradingScheme
 * @returns {{ fail, pass, credit, distinction, hd }}
 */
export function bandLabels(gradingScheme) {
    if (gradingScheme === 'v1') {
        return {
            fail:        'Fail (0–49)',
            pass:        'Pass (50–64)',
            credit:      'Pass with Merit (65–74)',
            distinction: 'Pass with Distinction (75–100)',
            hd:          null
        };
    }
    return {
        fail:        'Fail (0–49)',
        pass:        'Pass (50–64)',
        credit:      'Credit (65–74)',
        distinction: 'Distinction (75–84)',
        hd:          'High Distinction (85–100)'
    };
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
 * Returns an array of { term, label, gradingScheme, stats } for a given subject,
 * sorted oldest-first. Only terms where that subject appeared are included.
 * @param {string} subjectId  e.g. '04'
 * @returns {Array<{ term: string, label: string, gradingScheme: string, stats: object }>}
 */
export function getTermHistoryForSubject(subjectId) {
    return sortedTerms()
        .map(termId => {
            const termData = allStats[termId];
            const stats = termData?.subjects?.[subjectId];
            if (!stats) return null;
            return {
                term:          termId,
                label:         termData.label,
                gradingScheme: termData.gradingScheme ?? 'v2',
                stats
            };
        })
        .filter(Boolean);
}

/**
 * Returns the most recent stats entry for a subject, or null if none exist.
 * @param {string} subjectId
 * @returns {{ term: string, label: string, gradingScheme: string, stats: object }|null}
 */
export function getLatestStatsForSubject(subjectId) {
    const history = getTermHistoryForSubject(subjectId);
    return history.length ? history[history.length - 1] : null;
}

/**
 * Returns subjects whose most recent effective fail rate (DNS included)
 * is at or above the threshold. Sorted by effective fail rate descending.
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
            const failPct = effectiveFail(latest.stats);
            return {
                subjectId,
                term:    latest.term,
                label:   latest.label,
                failPct,
                stats:   latest.stats
            };
        })
        .filter(entry => entry && entry.failPct >= threshold)
        .sort((a, b) => b.failPct - a.failPct);
}

/**
 * Returns a difficulty band based on the most recent effective fail rate
 * (DNS included). Threshold logic is centralised here.
 *
 *   'low'    — effectiveFail < 15%
 *   'medium' — effectiveFail 15–29%
 *   'high'   — effectiveFail ≥ 30%
 *   null     — no data available for this subject
 *
 * @param {string} subjectId
 * @returns {'low'|'medium'|'high'|null}
 */
export function getDifficultyBand(subjectId) {
    const latest = getLatestStatsForSubject(subjectId);
    if (!latest) return null;
    const f = effectiveFail(latest.stats);
    if (f >= 30) return 'high';
    if (f >= 15) return 'medium';
    return 'low';
}

/**
 * Returns all available terms as label pairs, sorted newest-first.
 * Useful for building a term selector dropdown in the UI.
 * @returns {Array<{ termId: string, label: string, gradingScheme: string }>}
 */
export function getAvailableTerms() {
    return sortedTerms()
        .reverse()
        .map(termId => ({
            termId,
            label:         allStats[termId].label,
            gradingScheme: allStats[termId].gradingScheme ?? 'v2'
        }));
}
