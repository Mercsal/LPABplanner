/**
 * datetime.js — utility for parsing and comparing exam date strings.
 *
 * Expected input format: 'D Mon YYYY, H.MM am/pm'
 * Examples:
 *   '8 Sep 2026, 9.00 am'   → Date(2026, 8, 8, 9, 0)
 *   '7 Sep 2026, 1.45 pm'   → Date(2026, 8, 7, 13, 45)
 *
 * All functions treat null/undefined input as a safe no-op,
 * returning null so callers can guard with a simple truthiness check.
 */

const MONTH_MAP = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4,  jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

/**
 * Parse an exam date string into a Date object.
 * @param {string|null} examString - e.g. '8 Sep 2026, 9.00 am'
 * @returns {Date|null}
 */
export function parseExamDate(examString) {
    if (!examString) return null;

    // Pattern: '8 Sep 2026, 9.00 am'
    const match = examString
        .trim()
        .match(/^(\d{1,2})\s+(\w{3})\s+(\d{4}),\s*(\d{1,2})\.(\d{2})\s*(am|pm)$/i);

    if (!match) {
        console.warn(`[datetime] Could not parse exam string: "${examString}"`);
        return null;
    }

    const day   = parseInt(match[1], 10);
    const month = MONTH_MAP[match[2].toLowerCase()];
    const year  = parseInt(match[3], 10);
    let   hours = parseInt(match[4], 10);
    const mins  = parseInt(match[5], 10);
    const ampm  = match[6].toLowerCase();

    if (month === undefined) {
        console.warn(`[datetime] Unknown month abbreviation: "${match[2]}"`);
        return null;
    }

    // Convert to 24-hour
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    return new Date(year, month, day, hours, mins, 0, 0);
}

/**
 * Format a Date object back to the exam string format.
 * Useful for display and round-trip testing.
 * @param {Date|null} date
 * @returns {string|null}
 */
export function formatExamDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return null;

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day   = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year  = date.getFullYear();
    let   hours = date.getHours();
    const mins  = String(date.getMinutes()).padStart(2, '0');
    const ampm  = hours >= 12 ? 'pm' : 'am';

    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;

    return `${day} ${month} ${year}, ${hours}.${mins} ${ampm}`;
}

/**
 * Check whether two exam date strings represent the exact same time.
 * Returns false (no clash) if either is null.
 * @param {string|null} examA
 * @param {string|null} examB
 * @returns {boolean}
 */
export function examTimesClash(examA, examB) {
    const a = parseExamDate(examA);
    const b = parseExamDate(examB);
    if (!a || !b) return false;
    return a.getTime() === b.getTime();
}

/**
 * Sort an array of subjects by their exam date, earliest first.
 * Subjects with null exams are placed at the end.
 * Does not mutate the original array.
 * @param {Array} subjects - array of subject objects with an .exam property
 * @returns {Array}
 */
export function sortByExamDate(subjects) {
    return [...subjects].sort((a, b) => {
        const da = parseExamDate(a.exam);
        const db = parseExamDate(b.exam);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da.getTime() - db.getTime();
    });
}
