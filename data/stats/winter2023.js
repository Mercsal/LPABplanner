// data/stats/winter2023.js
// Source: LPAB Diploma in Law — Term 2 (Winter) 2023 Examination Statistics
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

export const winter2023Stats = {
    term:              'winter2023',
    label:             'Winter (Term 2) 2023',
    gradingScheme:     'v1',
    totalEnrolled:     1885,
    totalDNS:          255,
    totalSat:          1633,
    cohortFail:        11.51,
    cohortPass:        39.56,
    cohortMerit:       29.52,
    cohortDistinction: 19.23,
    subjects: {
        '01': { sat: 148, dns: 47, fail:  9.46, pass: 54.73, merit: 27.70, distinction:  8.11 },
        '02': { sat: 124, dns: 24, fail:  4.03, pass: 20.16, merit: 29.84, distinction: 45.97 },
        '03': { sat:  99, dns: 20, fail: 18.18, pass: 24.24, merit: 23.23, distinction: 34.34 },
        '04': { sat: 123, dns: 30, fail: 28.46, pass: 54.47, merit: 12.20, distinction:  2.44 },
        '05': { sat: 136, dns: 17, fail: 27.21, pass: 54.41, merit: 10.29, distinction:  8.09 },
        '06': { sat: 126, dns: 17, fail:  2.38, pass: 14.29, merit: 34.13, distinction: 49.21 },
        '07': { sat: 123, dns: 24, fail: 23.58, pass: 48.78, merit: 20.33, distinction:  7.32 },
        '08': { sat:  67, dns: 10, fail:  8.96, pass: 67.16, merit: 20.90, distinction:  2.99 },
        '09': { sat:  75, dns:  7, fail:  1.33, pass: 37.33, merit: 48.00, distinction: 13.33 },
        '10': { sat:  70, dns:  5, fail: 10.00, pass: 50.00, merit: 34.29, distinction:  5.71 },
        '11': { sat:  91, dns: 13, fail: 19.78, pass: 51.65, merit: 21.98, distinction:  6.59 },
        '12': { sat:  44, dns:  7, fail:  2.27, pass: 61.36, merit: 29.55, distinction:  6.82 },
        '13': { sat:  61, dns:  6, fail:  1.64, pass: 27.87, merit: 37.70, distinction: 32.79 },
        '14': { sat:  34, dns:  0, fail:  0.00, pass: 17.65, merit: 50.00, distinction: 32.35 },
        '15': { sat:  85, dns: 15, fail:  8.24, pass: 38.82, merit: 37.65, distinction: 15.29 },
        '16': { sat:  32, dns:  0, fail:  0.00, pass:  9.38, merit: 75.00, distinction: 15.63 },
        '17': { sat:  77, dns:  2, fail:  3.90, pass: 35.06, merit: 40.26, distinction: 20.78 },
        '19': { sat:  13, dns:  6, fail:  7.69, pass: 53.85, merit: 15.38, distinction: 23.08 },
        '20': { sat:   8, dns:  1, fail:  0.00, pass:  0.00, merit:  0.00, distinction: 100.00 },
        '22': { sat:  12, dns:  1, fail:  8.33, pass: 25.00, merit: 41.67, distinction: 25.00 },
        '23': { sat:  20, dns:  0, fail:  0.00, pass: 15.00, merit: 30.00, distinction: 55.00 },
        '24': { sat:  47, dns:  2, fail:  2.13, pass: 29.79, merit: 57.45, distinction: 10.64 },
        '26': { sat:  18, dns:  1, fail:  0.00, pass: 11.11, merit: 55.56, distinction: 33.33 }
    }
};
