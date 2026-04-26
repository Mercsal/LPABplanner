// data/stats/winter2024.js
// Source: LPAB Diploma in Law — Term 2 (Winter) 2024 Examination Statistics
// Grading scheme: v2 (introduced this term)
//   50–64  = Pass
//   65–74  = Credit
//   75–84  = Distinction
//   85–100 = High Distinction
//   0–49   = Fail
//
// dns  — candidates who Did Not Sit (raw count, stored separately)
//         DNS is treated as part of the effective fail rate for analysis.
// All percentages are as published; they may not sum to exactly 100
// due to rounding in the source document.

export const winter2024Stats = {
    term:              'winter2024',
    label:             'Winter (Term 2) 2024',
    gradingScheme:     'v2',
    totalEnrolled:     2004,
    totalDNS:          238,
    totalSat:          1766,
    cohortFail:        12.10,
    cohortPass:        37.08,
    cohortCredit:      33.42,
    cohortDistinction: 16.28,
    cohortHD:          1.12,
    subjects: {
        '01': { sat: 114, dns: 39, fail: 16.67, pass: 35.09, credit: 34.21, distinction: 12.28, hd: 1.75 },
        '02': { sat:  99, dns: 30, fail:  5.05, pass: 21.21, credit: 42.42, distinction: 29.29, hd: 2.02 },
        '03': { sat: 107, dns: 19, fail: 14.02, pass: 52.34, credit: 30.84, distinction:  2.80, hd: 0.00 },
        '04': { sat: 116, dns: 25, fail: 35.34, pass: 54.31, credit:  6.90, distinction:  3.45, hd: 0.00 },
        '05': { sat: 168, dns: 35, fail: 44.05, pass: 40.48, credit: 12.50, distinction:  2.98, hd: 0.00 },
        '06': { sat: 192, dns: 18, fail:  4.69, pass: 21.35, credit: 44.27, distinction: 28.13, hd: 1.56 },
        '07': { sat: 121, dns:  8, fail: 28.93, pass: 56.20, credit: 12.40, distinction:  2.48, hd: 0.00 },
        '08': { sat:  58, dns:  4, fail: 15.52, pass: 46.55, credit: 34.48, distinction:  3.45, hd: 0.00 },
        '09': { sat: 100, dns:  9, fail: 10.00, pass: 30.00, credit: 41.00, distinction: 19.00, hd: 0.00 },
        '10': { sat:  93, dns:  5, fail:  5.38, pass: 27.96, credit: 38.71, distinction: 26.88, hd: 1.08 },
        '11': { sat: 111, dns:  7, fail: 30.63, pass: 53.15, credit: 10.81, distinction:  4.50, hd: 0.90 },
        '12': { sat:  47, dns:  4, fail: 19.15, pass: 61.70, credit: 17.02, distinction:  2.13, hd: 0.00 },
        '13': { sat:  40, dns:  6, fail:  2.50, pass: 45.00, credit: 40.00, distinction: 12.50, hd: 0.00 },
        '14': { sat:  46, dns:  1, fail:  6.52, pass: 26.09, credit: 41.30, distinction: 23.91, hd: 2.17 },
        '15': { sat:  74, dns:  8, fail:  4.05, pass: 58.11, credit: 28.38, distinction:  9.46, hd: 0.00 },
        '16': { sat:  35, dns:  4, fail:  0.00, pass: 22.86, credit: 48.57, distinction: 28.57, hd: 0.00 },
        '17': { sat: 111, dns:  7, fail: 10.81, pass: 47.75, credit: 38.74, distinction:  2.70, hd: 0.00 },
        '19': { sat:  12, dns:  4, fail: 25.00, pass: 16.67, credit: 41.67, distinction:  8.33, hd: 8.33 },
        '20': { sat:  17, dns:  3, fail:  0.00, pass:  5.88, credit: 58.82, distinction: 35.29, hd: 0.00 },
        '22': { sat:  16, dns:  1, fail:  0.00, pass: 31.25, credit: 43.75, distinction: 25.00, hd: 0.00 },
        '23': { sat:  20, dns:  0, fail:  0.00, pass:  0.00, credit: 25.00, distinction: 70.00, hd: 5.00 },
        '24': { sat:  33, dns:  0, fail:  0.00, pass: 21.21, credit: 54.55, distinction: 21.21, hd: 3.03 },
        '26': { sat:  36, dns:  1, fail:  0.00, pass: 77.78, credit: 22.22, distinction:  0.00, hd: 0.00 }
    }
};
