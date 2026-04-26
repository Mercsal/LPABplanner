import { subjects, currentTerm } from './subjects.js';
import { historicalExams } from './archive.js';
import { PlannerState } from './planner.js';

const subjectListEl = document.getElementById('subject-list');
const feedbackPanel = document.getElementById('feedback-panel');
const errorListEl = document.getElementById('error-list');

function init() {
    PlannerState.loadData(); 
    renderPlannerBoard();
    renderSubjectPool(); 
    setupExportButton();     
}

function getExamText(subject, semesterId) {
    if (semesterId === 'completed') return '';
    
    // Safety check in case currentTerm fails to load
    const safeTerm = typeof currentTerm !== 'undefined' ? currentTerm : 'winter2026';

    if (semesterId === safeTerm) {
         return subject.exam ? `📝 Exam: ${subject.exam}` : '📝 Exam: TBA';
    }

    let lastKnown = null;

    if (subject.exam) {
        const termName = safeTerm.replace('winter', 'Winter ').replace('summer', 'Summer ');
        lastKnown = `${subject.exam} (${termName})`;
    } else {
        if (typeof historicalExams !== 'undefined') {
            const pastTerms = Object.keys(historicalExams).reverse();
            for (const term of pastTerms) {
                const pastSub = historicalExams[term].find(s => s.id === subject.id);
                if (pastSub && pastSub.exam) {
                    const termName = term.replace('winter', 'Winter ').replace('summer', 'Summer ');
                    lastKnown = `${pastSub.exam} (${termName})`;
                    break;
                }
            }
        }
    }

    return lastKnown ? `🕒 Last ran: ${lastKnown}` : '📝 Exam: TBA';
}

function setupExportButton() {
    document.getElementById('export-btn').onclick = () => {
        let exportText = "# LPAB Elective Plan\n\n";
        
        const allKeys = Object.keys(PlannerState.plan);
        const activeSemesters = allKeys.filter(k => k !== 'completed').sort();
        const orderedSemesters = ['completed', ...activeSemesters];

        orderedSemesters.forEach(semId => {
            const plannedSubjects = PlannerState.plan[semId];
            if (plannedSubjects && plannedSubjects.length > 0) {
                const titleName = semId === 'completed' ? 'Already Completed' : semId.replace('winter', 'Winter ').replace('summer', 'Summer ');
                exportText += `## ${titleName}\n`;
                
                plannedSubjects.forEach(sub => {
                    const examText = getExamText(sub, semId);
                    const pipeExam = examText ? ` | ${examText}` : '';
                    exportText += `- [${sub.id}] ${sub.name} (${sub.type}) | Lecture: ${sub.lecture}${pipeExam}\n`;
                });
                exportText += `\n`;
            }
        });

        navigator.clipboard.writeText(exportText).then(() => {
            const btn = document.getElementById('export-btn');
            const originalText = btn.innerText;
            btn.innerText = "✓ Copied!";
            btn.style.backgroundColor = "#16a34a";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "#38bdf8";
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
            alert("Failed to copy to clipboard.");
        });
    };
}

function renderSubjectPool() {
    subjectListEl.innerHTML = ''; 
    const currentProgress = PlannerState.getProgress();

    subjects.forEach(subject => {
        const isPlanned = currentProgress.totalSubjectsList.find(s => s.id === subject.id);
        if (isPlanned) return; 

        const div = document.createElement('div');
        div.className = 'subject-item';
        div.draggable = true; 
        div.title = "Drag to a semester, or Double-Click to mark as Completed";
        
        const sType = subject.type.toLowerCase();
        div.style.borderColor = sType === 'compulsory' ? '#4ade80' : '#38bdf8'; 
        div.style.backgroundColor = sType === 'compulsory' ? '#f0fdf4' : '#f0f9ff';

        div.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ id: subject.id, source: 'pool' }));
            e.dataTransfer.effectAllowed = 'move';
        };

        div.ondblclick = () => {
            handleAddSubject(subject, 'completed');
        };
        
        div.innerHTML = `
            <strong>${subject.id}: ${subject.name}</strong>
            <div style="font-size: 0.85em; color: #64748b; margin-top: 4px;">Type: ${subject.type} | Term: ${subject.terms.join(', ')} <br> Night: ${subject.lecture}</div>
        `;

        subjectListEl.appendChild(div);
    });
}

window.handleDrop = function(event, targetSemesterId) {
    event.preventDefault();
    event.currentTarget.style.backgroundColor = ''; 

    try {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const subject = subjects.find(s => s.id === data.id);
        if (!subject) return;

        if (data.source !== 'pool' && data.source !== targetSemesterId) {
            PlannerState.removeSubject(data.source, data.id);
        }

        handleAddSubject(subject, targetSemesterId);
    } catch (err) {
        console.error("Drop failed:", err);
    }
}

function handleAddSubject(subject, semesterId) {
    feedbackPanel.style.display = 'none';
    errorListEl.innerHTML = '';

    const result = PlannerState.addSubject(semesterId, subject);

    if (result.success) {
        renderPlannerBoard();
        renderSubjectPool(); 
    } else {
        feedbackPanel.style.display = 'block';
        result.errors.forEach(err => {
            const li = document.createElement('li');
            li.innerText = err;
            errorListEl.appendChild(li);
        });
        renderPlannerBoard();
        renderSubjectPool();
    }
}

function renderPlannerBoard() {
    const dynamicContainer = document.getElementById('dynamic-semesters');
    const completedSection = document.getElementById('completed-slots');
    
    dynamicContainer.innerHTML = ''; 
    completedSection.innerHTML = '';

    completedSection.style.minHeight = '100px';
    completedSection.style.border = '2px dashed #cbd5e1';
    completedSection.style.borderRadius = '8px';
    completedSection.style.padding = '10px';

    completedSection.ondragover = (e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#e2e8f0'; };
    completedSection.ondragleave = (e) => { e.currentTarget.style.backgroundColor = ''; };
    completedSection.ondrop = (e) => handleDrop(e, 'completed');

    const completedSubjects = PlannerState.getSemester('completed');
    if (completedSubjects.length === 0) {
        completedSection.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 20px;">Drag completed subjects here</div>`;
    } else {
        completedSubjects.forEach(subject => completedSection.appendChild(createSubjectSlot(subject, 'completed', null)));
    }

    const progress = PlannerState.getProgress();
    const unassignedSubjects = Math.max(20 - progress.totalSubjects, 0);
    const extraSemestersNeeded = Math.ceil(unassignedSubjects / 3);

    const allTerms = [];
    let year = 2026;
    for (let i = 0; i < 15; i++) { 
        allTerms.push(`winter${year}`);
        allTerms.push(`summer${year}`);
        year++;
    }

    let lastPopulatedIndex = -1;
    allTerms.forEach((term, index) => {
        if (PlannerState.plan[term] && PlannerState.plan[term].length > 0) {
            lastPopulatedIndex = index;
        }
    });

    const termsToRender = allTerms.slice(0, Math.max(lastPopulatedIndex + 1 + extraSemestersNeeded, 1));

    termsToRender.forEach(semesterId => {
        const plannedSubjects = PlannerState.getSemester(semesterId);
        const clashData = PlannerState.getClashes(semesterId);

        const card = document.createElement('section');
        card.className = 'semester-card';
        const titleName = semesterId.replace('winter', 'Winter ').replace('summer', 'Summer ');
        
        card.innerHTML = `
            <h2>${titleName}</h2>
            <div class="semester-slots"></div>
        `;
        const slotsContainer = card.querySelector('.semester-slots');
        
        slotsContainer.ondragover = (e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#e2e8f0'; };
        slotsContainer.ondragleave = (e) => { e.currentTarget.style.backgroundColor = ''; };
        slotsContainer.ondrop = (e) => handleDrop(e, semesterId);

        if (plannedSubjects.length === 0) {
            slotsContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 20px;">Drag subjects here (Max 4)</div>`;
        } else {
            plannedSubjects.forEach((subject) => {
                const subjectWarnings = clashData[subject.id];
                slotsContainer.appendChild(createSubjectSlot(subject, semesterId, subjectWarnings));
            });
        }

        dynamicContainer.appendChild(card);
    });

    renderProgress();
}

function createSubjectSlot(subject, semesterId, subjectWarnings) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.style.borderStyle = 'solid';
    
    const isClashing = subjectWarnings && subjectWarnings.length > 0;
    const sType = subject.type.toLowerCase();

    let bColor = sType === 'compulsory' ? '#4ade80' : '#38bdf8';
    let bgColor = sType === 'compulsory' ? '#f0fdf4' : '#f0f9ff';
    let txtColor = '#1e293b';

    if (isClashing) {
        bColor = '#ef4444'; 
        bgColor = '#fef2f2';
        txtColor = '#7f1d1d';
    }

    slot.style.borderColor = bColor; 
    slot.style.backgroundColor = bgColor;
    slot.style.color = txtColor;
    
    slot.draggable = true;
    slot.style.cursor = 'grab';
    slot.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: subject.id, source: semesterId }));
        e.dataTransfer.effectAllowed = 'move';
    };

    if (semesterId !== 'completed') {
        slot.title = "Double-Click to mark as Completed";
        slot.ondblclick = () => markCompleted(semesterId, subject.id);
    }

    const completeBtnHtml = semesterId !== 'completed' 
        ? `<span class="action-btn" style="font-size: 0.8em; cursor:pointer; color: #16a34a; margin-right: 15px; font-weight: bold;" onclick="markCompleted('${semesterId}', '${subject.id}')">✓ Done</span>` 
        : '';

    const lectureDisplay = semesterId !== 'completed' 
        ? `<div style="font-size: 0.85em; font-weight: 600; color: #475569; margin-top: 6px;">📅 ${subject.lecture}</div>` 
        : '';

    const examDisplayData = getExamText(subject, semesterId);
    const examDisplay = semesterId !== 'completed'
        ? `<div style="font-size: 0.8em; color: #64748b; margin-top: 2px;">${examDisplayData}</div>`
        : '';

    let clashWarningHtml = '';
    if (isClashing) {
        subjectWarnings.forEach(warning => {
            clashWarningHtml += `<div style="font-size: 0.75em; color: #dc2626; font-weight: bold; margin-top: 4px;">⚠️ ${warning}</div>`;
        });
    }

    slot.innerHTML = `
        <div style="text-align: center; width: 100%;">
            <strong>${subject.name}</strong><br>
            <span style="font-size: 0.7em; text-transform: uppercase;">${subject.type}</span>
            ${lectureDisplay}
            ${examDisplay}
            ${clashWarningHtml}
            <div style="margin-top: 8px;">
                ${completeBtnHtml}
                <span class="action-btn" style="font-size: 0.8em; cursor:pointer; color: red;" onclick="removeSubject('${semesterId}', '${subject.id}')">✕ Remove</span>
            </div>
        </div>
    `;
    return slot;
}

function renderProgress() {
    const progress = PlannerState.getProgress();
    const compPercent = Math.min((progress.compulsory.current / progress.compulsory.required) * 100, 100);
    const elecPercent = Math.min((progress.electives.current / progress.electives.required) * 100, 100);

    document.getElementById('compulsory-text').innerText = `${progress.compulsory.current} / ${progress.compulsory.required}`;
    document.getElementById('elective-text').innerText = `${progress.electives.current} / ${progress.electives.required}`;
    document.getElementById('compulsory-bar').style.width = `${compPercent}%`;
    document.getElementById('elective-bar').style.width = `${elecPercent}%`;

    const statusEl = document.getElementById('grad-status');
    if (progress.readyToGraduate) {
        statusEl.innerText = "Status: 🎉 Requirements Met! Ready to Graduate.";
        statusEl.style.color = "#4ade80";
    } else {
        statusEl.innerText = "Status: Planning...";
        statusEl.style.color = "#fbbf24";
    }
}

window.removeSubject = function(semesterId, subjectId) {
    PlannerState.removeSubject(semesterId, subjectId);
    renderPlannerBoard();
    renderSubjectPool(); 
    feedbackPanel.style.display = 'none'; 
}

window.markCompleted = function(semesterId, subjectId) {
    PlannerState.markCompleted(semesterId, subjectId);
    renderPlannerBoard();
    renderSubjectPool(); 
    feedbackPanel.style.display = 'none';
}

init();