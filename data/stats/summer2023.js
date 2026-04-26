// data/stats/summer2023.js
// Source: LPAB Diploma in Law — Term 1 (Summer) 2023 Examination Statistics
// Grading scheme: v1
//   50–64  = Pass
//   65–74  = Pass with Merit
//   75–100 = Pass with Distinction
//   0–49   = Fail
//
// dns  — candidates who Did Not Sit (raw count, stored separately)
//         DNS is treated as part of the effective fail rate for analysis.
// Subjects with a blank fail% in the source document are recorded as 0.
// All percentages are as published; they may not sum to exactly 100
// due to rounding in the source document.
// Note: subject 01 is named 'Legal Institutions' in this term (renamed to
// 'Foundations of Law' from Term 1, 2024 onward).

export const summer2023Stats = {
    term:              'summer2023',
    label:             'Summer (Term 1) 2023',
    gradingScheme:     'v1',
    totalEnrolled:     1881,
    totalDNS:          227,
    totalSat:          1654,
    cohortFail:        12.58,
    cohortPass:        36.88,
    cohortMerit:       32.10,
    cohortDistinction: 18.44,
    subjects: {
        '01': { sat: 120, dns: 42, fail: 20.00, pass: 45.83, merit: 23.33, distinction: 10.83 },
        '02': { sat: 115, dns: 16, fail:  6.96, pass: 19.13, merit: 34.78, distinction: 39.13 },
        '03': { sat: 104, dns: 15, fail: 14.42, pass: 37.50, merit: 35.58, distinction: 12.50 },
        '04': { sat: 105, dns: 27, fail: 32.38, pass: 49.52, merit: 14.29, distinction:  3.81 },
        '05': { sat: 137, dns: 23, fail: 16.79, pass: 44.53, merit: 31.39, distinction:  7.30 },
        '06': { sat: 148, dns: 11, fail:  4.05, pass: 11.49, merit: 41.22, distinction: 43.24 },
        '07': { sat: 103, dns: 18, fail: 37.86, pass: 56.31, merit:  3.88, distinction:  1.94 },
        '08': { sat:  63, dns: 10, fail:  4.76, pass: 41.27, merit: 30.16, distinction: 23.81 },
        '09': { sat:  89, dns:  7, fail:  2.25, pass: 28.09, merit: 48.31, distinction: 21.35 },
        '10': { sat:  79, dns:  2, fail: 17.72, pass: 45.57, merit: 24.05, distinction: 12.66 },
        '11': { sat:  98, dns:  6, fail: 23.47, pass: 53.06, merit: 18.37, distinction:  5.10 },
        '12': { sat:  49, dns:  8, fail:  8.16, pass: 69.39, merit: 20.41, distinction:  2.04 },
        '13': { sat:  37, dns:  3, fail:  2.70, pass: 37.84, merit: 40.54, distinction: 18.92 },
        '14': { sat:  48, dns:  2, fail:  0.00, pass: 33.33, merit: 54.17, distinction: 12.50 },
        '15': { sat:  76, dns: 15, fail:  2.63, pass: 39.47, merit: 38.16, distinction: 19.74 },
        '17': { sat: 107, dns:  7, fail:  5.61, pass: 21.50, merit: 43.93, distinction: 28.97 },
        '18': { sat:  20, dns:  0, fail:  0.00, pass:  5.00, merit: 20.00, distinction: 75.00 },
        '19': { sat:  31, dns:  7, fail:  9.68, pass: 45.16, merit: 38.71, distinction:  6.45 },
        '21': { sat:  24, dns:  2, fail:  0.00, pass: 66.67, merit: 25.00, distinction:  8.33 },
        '22': { sat:  26, dns:  1, fail:  0.00, pass: 19.23, merit: 34.62, distinction: 46.15 },
        '24': { sat:  35, dns:  2, fail:  2.86, pass: 20.00, merit: 74.29, distinction:  2.86 },
        '25': { sat:  14, dns:  1, fail:  0.00, pass: 14.29, merit: 42.86, distinction: 42.86 },
        '27': { sat:  26, dns:  2, fail:  0.00, pass: 19.23, merit: 53.85, distinction: 26.92 }
    }
};
