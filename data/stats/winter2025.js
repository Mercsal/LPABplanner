// data/stats/winter2025.js
// Source: LPAB Diploma in Law — September (Winter) 2025 Examinations Statistics
// Subjects absent from this file were not examined that term.
//
// Fields per subject:
//   sat          — total candidates who sat
//   dns          — candidates who Did Not Sit (raw count; omit if 0)
//   fail         — % who failed              (< 50 marks)
//   pass         — % who passed              (50–64)
//   credit       — % who achieved Credit     (65–74)
//   distinction  — % who achieved Distinction (75–84)
//   hd           — % who achieved High Distinction (85+)
//
// All percentages are as published; they may not sum to exactly 100
// due to rounding in the source document.

export const winter2025Stats = {
    term:              'winter2025',
    label:             'September (Winter) 2025',
    gradingScheme:     'v2',
    totalEnrolled:     0,
    totalSat:          1883,
    cohortFail:        15.9,
    cohortPass:        43.2,
    cohortCredit:      29.5,
    cohortDistinction: 10.46,
    cohortHD:          0.85,
    subjects: {
        '01': { sat: 134, fail: 20.9, pass: 41.0, credit: 29.1, distinction: 8.2,  hd: 0.7  },
        '02': { sat: 149, fail: 10.7, pass: 36.2, credit: 40.3, distinction: 12.1, hd: 0.7  },
        '03': { sat: 117, fail: 8.5,  pass: 27.4, credit: 51.3, distinction: 12.8, hd: 0.0  },
        '04': { sat: 126, fail: 31.7, pass: 54.8, credit: 11.1, distinction: 2.4,  hd: 0.0  },
        '05': { sat: 186, fail: 22.0, pass: 61.8, credit: 14.5, distinction: 1.6,  hd: 0.0  },
        '06': { sat: 178, fail: 14.0, pass: 43.3, credit: 23.6, distinction: 16.9, hd: 2.2  },
        '07': { sat: 125, fail: 35.2, pass: 48.8, credit: 13.6, distinction: 2.4,  hd: 0.0  },
        '08': { sat: 50,  fail: 6.0,  pass: 50.0, credit: 40.0, distinction: 4.0,  hd: 0.0  },
        '09': { sat: 96,  fail: 18.8, pass: 24.0, credit: 39.6, distinction: 15.6, hd: 2.1  },
        '10': { sat: 86,  fail: 5.8,  pass: 31.4, credit: 50.0, distinction: 12.8, hd: 0.0  },
        '11': { sat: 127, fail: 14.2, pass: 65.4, credit: 17.3, distinction: 3.1,  hd: 0.0  },
        '12': { sat: 54,  fail: 24.1, pass: 63.0, credit: 11.1, distinction: 1.9,  hd: 0.0  },
        '13': { sat: 51,  fail: 2.0,  pass: 41.2, credit: 39.2, distinction: 17.6, hd: 0.0  },
        '14': { sat: 41,  fail: 0.0,  pass: 41.5, credit: 34.1, distinction: 14.6, hd: 9.8  },
        '15': { sat: 99,  fail: 14.1, pass: 47.5, credit: 21.2, distinction: 17.2, hd: 0.0  },
        '16': { sat: 30,  fail: 3.3,  pass: 20.0, credit: 63.3, distinction: 13.3, hd: 0.0  },
        '17': { sat: 110, fail: 20.0, pass: 43.6, credit: 30.0, distinction: 6.4,  hd: 0.0  },
        '19': { sat: 17,  fail: 5.9,  pass: 23.5, credit: 29.4, distinction: 29.4, hd: 11.8 },
        '20': { sat: 9,   fail: 0.0,  pass: 22.2, credit: 55.6, distinction: 22.2, hd: 0.0  },
        '22': { sat: 18,  fail: 0.0,  pass: 27.8, credit: 50.0, distinction: 16.7, hd: 5.6  },
        '23': { sat: 29,  fail: 0.0,  pass: 0.0,  credit: 41.4, distinction: 55.2, hd: 3.4  },
        '24': { sat: 37,  fail: 0.0,  pass: 13.5, credit: 64.9, distinction: 21.6, hd: 0.0  },
        '26': { sat: 14,  fail: 0.0,  pass: 28.6, credit: 42.9, distinction: 28.6, hd: 0.0  },
    }
};
