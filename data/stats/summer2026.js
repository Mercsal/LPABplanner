// data/stats/summer2026.js
// Source: LPAB Diploma in Law — March (Summer) 2026 Examinations Statistics
// Subjects absent from this file were not examined that term.
//
// Fields per subject:
//   sat          — total candidates who sat
//   fail         — % who failed              (< 50 marks)
//   pass         — % who passed              (50–64)
//   credit       — % who achieved Credit     (65–74)
//   distinction  — % who achieved Distinction (75–84)
//   hd           — % who achieved High Distinction (85+)
//
// All percentages are as published; they may not sum to exactly 100
// due to rounding in the source document.

export const summer2026Stats = {
    term:              'summer2026',
    label:             'March (Summer) 2026',
    totalCandidates:   1960,
    // Cohort-level totals (bottom row of the published table)
    cohortFail:        18.1,
    cohortPass:        44.0,
    cohortCredit:      26.9,
    cohortDistinction: 10.1,
    cohortHD:          0.92,
    subjects: {
        '01': { sat: 145, fail: 15.9, pass: 40.0, credit: 32.4, distinction:  9.7, hd: 2.1 },
        '02': { sat: 127, fail: 12.6, pass: 36.2, credit: 37.0, distinction: 11.8, hd: 2.4 },
        '03': { sat: 115, fail:  7.8, pass: 53.0, credit: 29.6, distinction:  9.6, hd: 0.0 },
        '04': { sat: 137, fail: 40.1, pass: 53.3, credit:  5.1, distinction:  1.5, hd: 0.0 },
        '05': { sat: 193, fail: 30.1, pass: 54.4, credit: 13.5, distinction:  2.1, hd: 0.0 },
        '06': { sat: 190, fail: 20.5, pass: 45.8, credit: 23.2, distinction: 10.5, hd: 0.0 },
        '07': { sat: 147, fail: 40.1, pass: 51.0, credit:  8.8, distinction:  0.0, hd: 0.0 },
        '08': { sat:  65, fail:  1.5, pass: 38.5, credit: 55.4, distinction:  4.6, hd: 0.0 },
        '09': { sat: 114, fail: 13.2, pass: 38.6, credit: 34.2, distinction: 13.2, hd: 0.9 },
        '10': { sat:  71, fail: 19.7, pass: 46.5, credit: 19.7, distinction: 14.1, hd: 0.0 },
        '11': { sat:  93, fail: 20.4, pass: 60.2, credit: 18.3, distinction:  1.1, hd: 0.0 },
        '12': { sat:  37, fail: 21.6, pass: 59.5, credit: 13.5, distinction:  5.4, hd: 0.0 },
        '13': { sat:  51, fail:  2.0, pass: 21.6, credit: 49.0, distinction: 25.5, hd: 2.0 },
        '14': { sat:  49, fail:  8.2, pass: 34.7, credit: 32.7, distinction: 18.4, hd: 6.1 },
        '15': { sat: 113, fail:  8.0, pass: 48.7, credit: 30.1, distinction: 12.4, hd: 0.9 },
        '17': { sat: 123, fail: 18.7, pass: 43.9, credit: 34.1, distinction:  3.3, hd: 0.0 },
        '18': { sat:  27, fail:  0.0, pass:  3.7, credit: 48.1, distinction: 48.1, hd: 0.0 },
        '19': { sat:  31, fail:  0.0, pass: 22.6, credit: 41.9, distinction: 35.5, hd: 0.0 },
        '21': { sat:  29, fail:  0.0, pass: 20.7, credit: 31.0, distinction: 37.9, hd: 10.3 },
        '24': { sat:  38, fail:  2.6, pass: 15.8, credit: 60.5, distinction: 18.4, hd: 2.6 },
        '25': { sat:  30, fail:  0.0, pass: 23.3, credit: 30.0, distinction: 40.0, hd: 6.7 },
        '27': { sat:  35, fail:  0.0, pass: 40.0, credit: 40.0, distinction: 20.0, hd: 0.0 }
    }
};
