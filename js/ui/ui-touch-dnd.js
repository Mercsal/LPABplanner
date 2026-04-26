// ui-touch-dnd.js — touch drag-and-drop for mobile devices
// Uses pointer events to simulate drag behaviour on touch screens.
// Called after every render from ui-board.js and ui-pool.js.

import { subjects } from '../../subjects.js';
import { PlannerState } from '../../planner.js';
import { handleAddSubject } from './ui-board.js';

// ─── State ────────────────────────────────────────────────────────
let dragState = null; // { subjectId, sourceId, ghost, originEl }

// ─── Ghost element ────────────────────────────────────────────────
function getOrCreateGhost() {
    let ghost = document.getElementById('touch-drag-ghost');
    if (!ghost) {
        ghost = document.createElement('div');
        ghost.id = 'touch-drag-ghost';
        document.body.appendChild(ghost);
    }
    return ghost;
}

function showGhost(text, x, y) {
    const ghost = getOrCreateGhost();
    ghost.textContent = text;
    ghost.style.display = 'block';
    ghost.style.left = x + 'px';
    ghost.style.top  = y + 'px';
}

function hideGhost() {
    const ghost = document.getElementById('touch-drag-ghost');
    if (ghost) ghost.style.display = 'none';
}

// ─── Drop target detection ────────────────────────────────────────
function getDropTarget(x, y) {
    // Temporarily hide ghost so elementFromPoint works through it
    const ghost = document.getElementById('touch-drag-ghost');
    if (ghost) ghost.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (ghost) ghost.style.display = 'block';
    if (!el) return null;

    // Walk up DOM to find a semester-slots or completed-slots container
    let node = el;
    while (node && node !== document.body) {
        if (node.classList && (
            node.classList.contains('semester-slots') ||
            node.id === 'completed-slots'
        )) {
            return node;
        }
        node = node.parentElement;
    }
    return null;
}

function semesterIdFromContainer(container) {
    if (container.id === 'completed-slots') return 'completed';
    // semester-slots lives inside .semester-card whose <h2> holds the term name
    const card = container.closest('.semester-card');
    if (!card) return null;
    const heading = card.querySelector('h2');
    if (!heading) return null;
    // e.g. "Winter 2026" → "winter2026"
    return heading.textContent.trim().replace(' ', '').toLowerCase();
}

// ─── Highlight helpers ────────────────────────────────────────────
let lastHighlighted = null;

function highlightTarget(container) {
    if (lastHighlighted && lastHighlighted !== container) {
        lastHighlighted.classList.remove('drag-over');
    }
    if (container) {
        container.classList.add('drag-over');
        lastHighlighted = container;
    }
}

function clearHighlight() {
    if (lastHighlighted) {
        lastHighlighted.classList.remove('drag-over');
        lastHighlighted = null;
    }
}

// ─── Pointer event handlers ───────────────────────────────────────
function onPointerDown(e) {
    // Only respond to touch/pen; mouse uses native HTML5 DnD
    if (e.pointerType === 'mouse') return;

    const item = e.currentTarget;
    const subjectId = item.dataset.subjectId;
    const sourceId  = item.dataset.sourceId;   // semesterId or 'pool'
    if (!subjectId) return;

    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    e.preventDefault(); // prevent scroll while dragging

    item.classList.add('touch-dragging');
    item.setPointerCapture(e.pointerId);

    dragState = { subjectId, sourceId, subject, originEl: item };

    showGhost(subject.name, e.clientX, e.clientY);
}

function onPointerMove(e) {
    if (!dragState || e.pointerType === 'mouse') return;
    e.preventDefault();

    showGhost(dragState.subject.name, e.clientX, e.clientY);

    const target = getDropTarget(e.clientX, e.clientY);
    highlightTarget(target);
}

function onPointerUp(e) {
    if (!dragState || e.pointerType === 'mouse') return;

    hideGhost();
    clearHighlight();
    dragState.originEl.classList.remove('touch-dragging');

    const target = getDropTarget(e.clientX, e.clientY);

    if (target) {
        const targetSemId = semesterIdFromContainer(target);
        if (targetSemId) {
            // Remove from source if it was on the board (not pool)
            if (dragState.sourceId !== 'pool' && dragState.sourceId !== targetSemId) {
                PlannerState.removeSubject(dragState.sourceId, dragState.subjectId);
            }
            handleAddSubject(dragState.subject, targetSemId);
        }
    }

    dragState = null;
}

function onPointerCancel(e) {
    if (!dragState || e.pointerType === 'mouse') return;
    hideGhost();
    clearHighlight();
    dragState.originEl.classList.remove('touch-dragging');
    dragState = null;
}

// ─── Public API ───────────────────────────────────────────────────
/**
 * Call this after every render to attach touch DnD to all draggable elements.
 * Safe to call multiple times — uses replaceWith to avoid duplicate listeners.
 */
export function initTouchDnD() {
    // Pool items
    document.querySelectorAll('#subject-list .subject-item[data-subject-id]').forEach(el => {
        attachTouchHandlers(el);
    });

    // Board slots (already placed subjects that can be moved)
    document.querySelectorAll('.semester-slots .slot[data-subject-id]').forEach(el => {
        attachTouchHandlers(el);
    });

    document.querySelectorAll('#completed-slots .slot[data-subject-id]').forEach(el => {
        attachTouchHandlers(el);
    });
}

function attachTouchHandlers(el) {
    // Remove and re-add to avoid duplicates after re-render
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup',   onPointerUp);
    el.removeEventListener('pointercancel', onPointerCancel);

    el.addEventListener('pointerdown',   onPointerDown,   { passive: false });
    el.addEventListener('pointermove',   onPointerMove,   { passive: false });
    el.addEventListener('pointerup',     onPointerUp);
    el.addEventListener('pointercancel', onPointerCancel);

    // Prevent long-press context menu interfering with drag
    el.style.touchAction = 'none';
    el.style.webkitUserSelect = 'none';
}
