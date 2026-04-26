// ui-onboarding.js — full-screen onboarding overlay wizard
// Shown on first load of a session; re-triggerable via the Help button.
// No emojis. Tile style matches existing .slot / .semester-card aesthetic.
// No localStorage — uses an in-memory flag only.

let _hasShownOnboarding = false;

const STEPS = [
    {
        title: 'Welcome to the LPAB Elective Planner',
        tiles: [
            {
                heading: 'Plan your diploma',
                body: 'Map out every subject across your winter and summer semesters, from now until graduation.'
            },
            {
                heading: 'Spot clashes instantly',
                body: 'The planner highlights lecture-night and exam conflicts the moment they occur, so you can adjust before it matters.'
            },
            {
                heading: 'Track your progress',
                body: 'The progress bar at the top shows how many compulsory and elective subjects you have placed or completed.'
            }
        ]
    },
    {
        title: 'How to build your plan',
        tiles: [
            {
                heading: 'Browse the subject pool',
                body: 'All available subjects are listed in the left-hand panel. Use the filter to narrow by semester, type, or lecture night.'
            },
            {
                heading: 'Drag into a semester',
                body: 'Drag any subject from the pool into the semester card where you intend to take it. Each semester holds a maximum of four subjects.'
            },
            {
                heading: 'Mark subjects complete',
                body: 'Once you have finished a subject, double-click its tile or press the Done button to move it to the Completed section.'
            }
        ]
    },
    {
        title: 'Clashes and warnings',
        tiles: [
            {
                heading: 'Lecture clash',
                body: 'Two subjects in the same semester sharing the same lecture night are highlighted with a red border. Move one to a different semester to resolve it.'
            },
            {
                heading: 'Exam clash',
                body: 'Subjects whose final exams overlap in time are also flagged. Check the exam date on each tile before confirming your choices.'
            },
            {
                heading: 'Semester availability',
                body: 'Some subjects run in winter only, others in summer only. Subjects greyed out in the pool cannot be taken in the currently selected semester.'
            }
        ]
    }
];

export function showOnboardingIfNeeded() {
    if (_hasShownOnboarding) return;
    showOnboarding();
}

export function showOnboarding() {
    _hasShownOnboarding = true;

    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;

    let currentStep = 0;
    renderStep(currentStep);
    overlay.style.display = 'flex';
    document.addEventListener('keydown', handleEscape);

    function renderStep(stepIndex) {
        const step = STEPS[stepIndex];

        document.getElementById('onboarding-title').textContent = step.title;

        const tilesContainer = document.getElementById('onboarding-tiles');
        tilesContainer.innerHTML = '';
        step.tiles.forEach(tile => {
            const div = document.createElement('div');
            div.className = 'onboarding-tile';
            div.innerHTML = `
                <strong class="onboarding-tile__heading">${tile.heading}</strong>
                <p class="onboarding-tile__body">${tile.body}</p>
            `;
            tilesContainer.appendChild(div);
        });

        // Step dots
        const dots = document.querySelectorAll('.onboarding-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('onboarding-dot--active', i === stepIndex);
        });

        // Back button
        const backBtn = document.getElementById('onboarding-back');
        backBtn.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';

        // Next / Finish button
        const nextBtn = document.getElementById('onboarding-next');
        const isLast = stepIndex === STEPS.length - 1;
        nextBtn.textContent = isLast ? 'Get Started' : 'Next';
        nextBtn.onclick = () => {
            if (isLast) {
                closeOnboarding();
            } else {
                currentStep++;
                renderStep(currentStep);
            }
        };

        backBtn.onclick = () => {
            if (currentStep > 0) {
                currentStep--;
                renderStep(currentStep);
            }
        };
    }

    function closeOnboarding() {
        overlay.style.display = 'none';
        document.removeEventListener('keydown', handleEscape);
    }

    function handleEscape(e) {
        if (e.key === 'Escape') closeOnboarding();
    }

    document.getElementById('onboarding-close').onclick = closeOnboarding;
}
