// Import our data and state manager
import { subjects } from './subjects.js';
import { PlannerState } from './planner.js';

// --- DOM Elements ---
const subjectListEl = document.getElementById('subject-list');
const feedbackPanel = document.getElementById('feedback-panel');
const errorListEl = document.getElementById('error-list');

// --- Initialization ---
function init() {
    renderSubjectPool();
    renderPlannerBoard();
}

// --- 1. Render the Subject Pool (Left Sidebar) ---
function renderSubjectPool() {
    subjectListEl.innerHTML = ''; // Clear existing

    subjects.forEach(subject => {
        // Create the container for the subject
        const div = document.createElement('div');
        div.className = 'subject-item';
        
        // Subject info text
        const text = document.createElement('strong');
        text.innerText = `${subject.code}: ${subject.name} `;
        
        // Detail text (Term, Lecture, Exam)
        const details = document.createElement('div');
        details.style.fontSize = '0.85em';
        details.style.color = '#555';
        details.innerText = `Term: ${subject.terms.join(', ')} | Night: ${subject.lecture}`;

        // Dropdown to select destination
        const select = document.createElement('select');
        select.innerHTML = `
            <option value="completed">Completed</option>
            <option value="winter2026">Winter 2026</option>
            <option value="summer2026">Summer 2026</option>
        `;

        // Add button
        const btn = document.createElement('button');
        btn.innerText = 'Add';
        btn.style.marginLeft = '10px';
        
        // What happens when you click "Add"
        btn.onclick = () => handleAddSubject(subject, select.value);

        // Put it all together
        div.appendChild(text);
        div.appendChild(details);
        div.appendChild(document.createElement('br'));
        div.appendChild(select);
        div.appendChild(btn);

        subjectListEl.appendChild(div);
    });
}

// --- 2. Handle the "Add" Action ---
function handleAddSubject(subject, semesterId) {
    // Hide previous errors
    feedbackPanel.style.display = 'none';
    errorListEl.innerHTML = '';

    // Ask the state manager to add the subject
    const result = PlannerState.addSubject(semesterId, subject);

    if (result.success) {
        // It worked! Update the visual grid.
        renderPlannerBoard();
    } else {
        // It failed. Show the clashes.
        feedbackPanel.style.display = 'block';
        result.errors.forEach(err => {
            const li = document.createElement('li');
            li.innerText = err;
            errorListEl.appendChild(li);
        });
    }
}

// --- 3. Render the Planner Board (Right Grid) ---
function renderPlannerBoard() {
    // We look at the 3 sections in our state
    const sections = ['completed', 'winter2026', 'summer2026'];

    sections.forEach(semesterId => {
        // Find the matching HTML section
        const sectionEl = document.querySelector(`[data-semester-id="${semesterId}"] .semester-slots`);
        if (!sectionEl) return;

        sectionEl.innerHTML = ''; // Clear current slots

        // Get the subjects currently planned for this semester
        const plannedSubjects = PlannerState.plan[semesterId];

        // Draw the filled slots
        plannedSubjects.forEach((subject, index) => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.style.borderStyle = 'solid';
            slot.style.borderColor = '#4ade80'; // Green border for success
            slot.style.color = '#166534';
            slot.style.backgroundColor = '#f0fdf4';
            slot.innerHTML = `
                <div style="text-align: center;">
                    <strong>${subject.name}</strong><br>
                    <span style="font-size: 0.8em; cursor:pointer; color: red;" onclick="removeSubject('${semesterId}', '${subject.id}')">Remove ✕</span>
                </div>
            `;
            sectionEl.appendChild(slot);
        });

        // If it's an active semester, fill the remaining spots with "Empty Slots" to maintain the 4-slot grid
        if (semesterId !== 'completed') {
            const emptyCount = 4 - plannedSubjects.length;
            for (let i = 0; i < emptyCount; i++) {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'slot';
                emptySlot.innerText = 'Empty Slot';
                sectionEl.appendChild(emptySlot);
            }
        }
    });
}

// --- 4. Global Remove Function ---
// Attach this to the window object so the inline onclick in the HTML string can see it
window.removeSubject = function(semesterId, subjectId) {
    PlannerState.removeSubject(semesterId, subjectId);
    renderPlannerBoard();
    feedbackPanel.style.display = 'none'; // Clear any errors when removing
}

// Kick off the app
init();
