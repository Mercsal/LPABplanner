# LPAB Course Planner

A lightweight, interactive drag-and-drop progression planner built specifically for the NSW Legal Profession Admission Board (LPAB) Diploma in Law. 

This tool helps students map out their 20-subject progression (17 Compulsory, 3 Electives), visualizes their path to graduation, and automatically detects lecture and exam timetabling clashes.

## Features

* **Drag-and-Drop Interface:** Easily move subjects from the available pool into specific semesters or the "Already Completed" pile. 
* **Graduation Tracker:** Real-time progress bars calculating the required 17 compulsory subjects and 3 electives.
* **Smart Clash Detection:** Automatically warns if two subjects placed in the same active semester have a lecture schedule or exam time conflict based on the official LPAB timetable.
* **Historical Exam Archive:** If a subject is placed in a future/unscheduled term, the planner looks back at historical data to estimate when the exam will likely occur.
* **Auto-Save:** Progress is saved automatically to the browser's `localStorage`. You can safely close the tab and return later without losing your plan.
* **Markdown Export:** One-click copy of your entire progression plan formatted in Markdown—perfect for pasting straight into Notion, Obsidian, or other note-taking apps.
* **Clean Print View:** Pressing `Ctrl+P` (or `Cmd+P`) automatically hides the UI and subject pool, formatting the remaining required semesters neatly for A4 printing or PDF saving.

## How to Use (For Students)

Because the entire application is bundled into vanilla web technologies (HTML/CSS/JS), there is no backend server or installation required. 

1. Download or clone the repository.
2. Double-click the `planner.html` file to open it in any modern web browser.
3. Start dragging subjects onto your board!

## Maintenance Guide (For Future Updates)

When a new semester begins and the LPAB releases the new Evening Lecture Schedule and Examination Timetable, you only need to update the JavaScript data objects. No core logic needs to be touched.

If you are using the single-file `planner.html` version, simply scroll down to the `<script>` section to find these data objects.

### Step 1: Archive the Old Semester
Before adding new exam dates, move the *previous* semester's data into the `historicalExams` archive. This allows the app to predict future exam times for subjects not currently running.

```javascript
const historicalExams = {
    // Add the outgoing semester here to preserve its exam dates
    'winter2026': [
        { id: '01', name: 'Foundations of Law', exam: '8 Sep 2026, 9.00 am' },
        // ... rest of the subjects that ran this term
    ],
    'summer2025': [ ... ]
};
```

### Step 2: Update the Current Term
Update the `currentTerm` variable so the engine knows which semester to actively run clash-detection against.

```javascript
// Change this to the new active term (e.g., 'summer2026', 'winter2027')
const currentTerm = 'summer2026'; 
```

### Step 3: Update the Subject Timetables
Update the main `subjects` array with the newly released timetable. 
* Update the `lecture` property (e.g., 'Monday', 'Tuesday').
* Update the `exam` property (e.g., '3 Mar 2027, 9.00 am'). 
* **Important:** If an elective is *not* offered in the current semester, set its `exam` property to `null`. The engine will automatically ignore it for clash detection and instead display its "Last ran" date from the archive.

```javascript
{ 
    id: '16', 
    name: 'Insolvency', 
    type: 'elective', 
    terms: ['winter'], 
    lecture: 'Wednesday', 
    exam: '4 Mar 2027, 1.45 pm' // Update this based on the new PDF
}
```

## Architecture

This project deliberately avoids modern JavaScript frameworks (like React or Vue) or build tools (like Webpack or Vite) to remain infinitely portable and easy to host. It relies entirely on:
* **Vanilla HTML5:** For the structural layout and native Drag-and-Drop API events.
* **Vanilla CSS3:** For styling, CSS Grid/Flexbox layouts, and `@media print` rules.
* **Vanilla ES6 JavaScript:** For the state management, clash logic, DOM manipulation, and `localStorage` interactions.

## Disclaimer

This tool is a community project and is **not** officially affiliated with, maintained by, or endorsed by the Legal Profession Admission Board (LPAB) or the University of Sydney Law Extension Committee (LEC). Students should always cross-reference their progression plans with the official LPAB Course Information Handbook and published timetables to ensure they meet all graduation and prerequisite requirements.
