// data/stats/summer2024.js
// Source: LPAB Diploma in Law — Term 1 (Summer) 2024 Examination Statistics
// Grading scheme: v1 (last term on old scheme, replaced by v2 in Term 2, 2024)
//   50–64  = Pass
//   65–74  = Pass with Merit
//   75–100 = Pass with Distinction
//   0–49   = Fail
//
// dns  — candidates who Did Not Sit (raw count, stored separately)
//         DNS is treated as part of the effective fail rate for analysis.
// All percentages are as published; they may not sum to exactly 100
// due to rounding in the source document.

export const summer2024Stats = {
    term:              'summer2024',
    label:             'Summer (Term 1) 2024',
    gradingScheme:     'v1',
    totalEnrolled:     1945,
    totalDNS:          228,
    totalSat:          1717,
    cohortFail:        13.57,
    cohortPass:        39.47,
    cohortMerit:       28.81,
    cohortDistinction: 18.10,
    subjects: {
        '01': { sat: 105, dns: 38, fail: 18.10, pass: 40.95, merit: 14.29, distinction: 26.67 },
        '02': { sat: 117, dns: 22, fail:  5.98, pass: 27.35, merit: 30.77, distinction: 35.90 },
        '03': { sat: 137, dns: 17, fail: 13.14, pass: 43.07, merit: 29.93, distinction: 13.87 },
        '04': { sat: 121, dns: 17, fail: 33.06, pass: 46.28, merit: 19.01, distinction:  1.65 },
        '05': { sat: 144, dns: 35, fail: 29.86, pass: 47.22, merit: 15.28, distinction:  7.64 },
        '06': { sat: 162, dns: 28, fail:  6.79, pass: 27.78, merit: 33.95, distinction: 31.48 },
        '07': { sat: 115, dns: 10, fail: 21.74, pass: 47.83, merit: 21.74, distinction:  8.70 },
        '08': { sat:  70, dns:  6, fail:  2.86, pass: 57.14, merit: 28.57, distinction: 11.43 },
        '09': { sat:  93, dns: 12, fail:  2.15, pass: 31.18, merit: 36.56, distinction: 30.11 },
        '10': { sat:  92, dns:  5, fail: 11.96, pass: 40.22, merit: 28.26, distinction: 19.57 },
        '11': { sat:  87, dns:  5, fail: 37.93, pass: 51.72, merit:  8.05, distinction:  2.30 },
        '12': { sat:  47, dns:  6, fail: 12.77, pass: 70.21, merit: 17.02, distinction:  0.00 },
        '13': { sat:  39, dns:  1, fail:  7.69, pass: 46.81, merit: 21.28, distinction:  8.51 },
        '14': { sat:  35, dns:  2, fail:  5.71, pass: 11.43, merit: 42.86, distinction: 40.00 },
        '15': { sat:  89, dns:  8, fail:  3.37, pass: 46.07, merit: 35.96, distinction: 14.61 },
        '17': { sat: 102, dns:  6, fail:  6.86, pass: 43.14, merit: 33.33, distinction: 16.67 },
        '18': { sat:  22, dns:  0, fail:  0.00, pass:  4.55, merit: 18.18, distinction: 77.27 },
        '19': { sat:   9, dns:  1, fail: 11.11, pass: 33.33, merit: 33.33, distinction: 22.22 },
        '21': { sat:  23, dns:  3, fail:  0.00, pass:  8.70, merit: 78.26, distinction: 13.04 },
        '22': { sat:  18, dns:  2, fail:  0.00, pass: 11.11, merit: 50.00, distinction: 38.89 },
        '24': { sat:  41, dns:  1, fail:  0.00, pass: 12.20, merit: 60.98, distinction: 26.83 },
        '25': { sat:  21, dns:  1, fail:  0.00, pass: 42.86, merit: 38.10, distinction: 19.05 },
        '27': { sat:  28, dns:  2, fail:  0.00, pass: 10.71, merit: 42.86, distinction: 46.43 }
    }
};
