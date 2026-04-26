// subjects.js — subject data and current term.
// Each subject now has a `group` field:
//   'core'        — first 11, must be taken in sequence (approval required to deviate)
//   'compulsory'  — mandatory, any order
//   'elective'    — choose 3
// The `type` field (Compulsory/Elective) is kept for engine compatibility.

export const currentTerm = 'winter2026';

export const subjects = [
    // ── CORE (sequential, IDs 01–11) ──────────────────────────────────────────
    { id: '01', name: 'Foundations of Law',          group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: '8 Sep 2026, 9.00 am' },
    { id: '02', name: 'Criminal Law & Procedure',    group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: '4 Sep 2026, 9.00 am' },
    { id: '03', name: 'Torts',                       group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: '9 Sep 2026, 9.00 am' },
    { id: '04', name: 'Contracts',                   group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: '7 Sep 2026, 1.45 pm' },
    { id: '05', name: 'Real Property',               group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: '10 Sep 2026, 9.00 am' },
    { id: '06', name: 'Australian Constitutional Law', group: 'core',      type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: '3 Sep 2026, 9.00 am' },
    { id: '07', name: 'Equity',                      group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: '7 Sep 2026, 9.00 am' },
    { id: '08', name: 'Commercial Transactions',     group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: '4 Sep 2026, 1.45 pm' },
    { id: '09', name: 'Administrative Law',          group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: '3 Sep 2026, 1.45 pm' },
    { id: '10', name: 'Law of Associations',         group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: '9 Sep 2026, 1.45 pm' },
    { id: '11', name: 'Evidence',                    group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: '8 Sep 2026, 1.45 pm' },

    // ── COMPULSORY (any order) ─────────────────────────────────────────────────
    { id: '12', name: 'Taxation & Revenue Law',      group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: '7 Sep 2026, 9.00 am' },
    { id: '13', name: 'Succession',                  group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: '3 Sep 2026, 1.45 pm' },
    { id: '14', name: 'Conveyancing',                group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: '9 Sep 2026, 9.00 am' },
    { id: '15', name: 'Practice & Procedure',        group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: '4 Sep 2026, 1.45 pm' },
    { id: '17', name: 'Legal Ethics',                group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: '10 Sep 2026, 1.45 pm' },
    { id: '24', name: 'Jurisprudence',               group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: '9 Sep 2026, 1.45 pm' },

    // ── ELECTIVE (choose 3) ────────────────────────────────────────────────────
    { id: '16', name: 'Insolvency',                          group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Wednesday', exam: '7 Sep 2026, 1.45 pm' },
    { id: '18', name: 'Conflict of Laws',                    group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Thursday',  exam: null },
    { id: '19', name: 'Family Law',                          group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Wednesday', exam: null },
    { id: '20', name: 'Planning & Environmental Law',        group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Thursday',  exam: '4 Sep 2026, 9.00 am' },
    { id: '21', name: 'Industrial Law',                      group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Monday',    exam: null },
    { id: '22', name: 'Intellectual Property',               group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Tuesday',   exam: '8 Sep 2026, 9.00 am' },
    { id: '23', name: 'Public International Law',            group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Thursday',  exam: '8 Sep 2026, 1.45 pm' },
    { id: '25', name: 'Competition & Consumer Law',          group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Tuesday',   exam: null },
    { id: '26', name: 'Advanced Statutory Interpretation',   group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Monday',    exam: '10 Sep 2026, 9.00 am' },
    { id: '27', name: 'Health Law',                          group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Monday',    exam: null },
];
