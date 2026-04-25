// A discrete list of subjects. 
// Adding a new subject here automatically makes it available in the UI.
export const subjects = [
    { id: 'L01', name: 'Legal Institutions', terms: ['winter', 'summer'], lecture: 'Monday', exam: '2026-06-01T09:00' },
    { id: 'L02', name: 'Contracts', terms: ['winter'], lecture: 'Tuesday', exam: '2026-06-02T14:00' },
    { id: 'L03', name: 'Torts', terms: ['summer'], lecture: 'Monday', exam: '2026-11-15T09:00' },
    { id: 'L04', name: 'Real Property', terms: ['winter'], lecture: 'Wednesday', exam: '2026-06-05T09:00' },
    // Logic will handle "both" by checking if the term is in the array
];
