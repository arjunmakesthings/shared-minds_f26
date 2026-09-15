// orchestration: pane state, the shared transcript, and wiring the DOM to api.js

import { initCanvas } from './canvas.js';
import { ROLE_LABEL, ROLE_LINE, GUARDRAIL, INITIAL_STRUCTURE, CONTINUATION_STRUCTURE, THOUGHT_FADE_STEP, THOUGHT_MIN_OPACITY } from './config.js';
import { callModel, getAuthToken } from './api.js';
import { addPendingMessage, setMessageText, appendMessage } from './render.js';

initCanvas();

// warm the token cache while the person is still reading/typing, instead of paying for
// the (small, local) fetch latency on the critical path of the first real request
getAuthToken().catch(() => {});

const PANES = ['left', 'right'];

const textbox = document.getElementById('textbox');
const thoughtDisplay = document.getElementById('thought-display');

const panes = {
    left: { panel: document.getElementById('left-panel'), log: document.getElementById('left-log'), input: null },
    right: { panel: document.getElementById('right-panel'), log: document.getElementById('right-log'), input: null },
};

let transcript = []; // { label, text }, shared across both panes so either can be asked about the other
let followupCount = 0; // drives the center thought's fade -- see updateThoughtOpacity()

function updateThoughtOpacity() {
    followupCount += 1;
    const opacity = Math.max(THOUGHT_MIN_OPACITY, 1 - followupCount * THOUGHT_FADE_STEP);
    thoughtDisplay.style.opacity = opacity;
}

function pushTranscript(label, text) {
    transcript.push({ label, text });
}

function transcriptText() {
    return transcript.map((entry) => `${entry.label}: ${entry.text}`).join('\n\n');
}

function buildSystemPrompt(pane, structure) {
    return `${GUARDRAIL}\n\n${ROLE_LINE[pane]}\n\n${structure}`;
}

// --- pane follow-up inputs, created once the first exchange lands ---

function createPaneInput(pane) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'panel-input';
    input.autocomplete = 'off';
    input.placeholder = `ask the ${ROLE_LABEL[pane]}...`;
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') submitFollowup(pane);
    });
    return input;
}

function showPaneInputs() {
    for (const pane of PANES) {
        if (!panes[pane].input) {
            panes[pane].input = createPaneInput(pane);
            panes[pane].panel.appendChild(panes[pane].input);
        }
    }
}

function removePaneInputs() {
    for (const pane of PANES) {
        if (panes[pane].input) {
            panes[pane].input.remove();
            panes[pane].input = null;
        }
    }
}

// --- starting a conversation ---

async function runOpeningStatement(pane, thought) {
    const pending = addPendingMessage(panes[pane].log);
    const systemPrompt = buildSystemPrompt(pane, INITIAL_STRUCTURE);

    try {
        const text = await callModel(systemPrompt, thought);
        setMessageText(pending, text);
        pushTranscript(ROLE_LABEL[pane], text);
    } catch (err) {
        setMessageText(pending, 'error: ' + err.message);
    }
}

async function submitThought(thought) {
    transcript = [];
    panes.left.log.innerHTML = '';
    panes.right.log.innerHTML = '';
    removePaneInputs();

    followupCount = 0;
    textbox.style.display = 'none';
    thoughtDisplay.textContent = thought;
    thoughtDisplay.style.opacity = 1;
    thoughtDisplay.style.display = 'block';

    pushTranscript('Person', thought);

    await Promise.allSettled(PANES.map((pane) => runOpeningStatement(pane, thought)));

    showPaneInputs();
}

// --- deep-diving into one pane ---

async function submitFollowup(pane) {
    const { input, log } = panes[pane];
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    input.disabled = true;

    appendMessage(log, message, 'from-you');
    pushTranscript(`Person (to ${ROLE_LABEL[pane]})`, message);
    updateThoughtOpacity();

    const pending = addPendingMessage(log);
    const systemPrompt = buildSystemPrompt(pane, CONTINUATION_STRUCTURE);
    const prompt = `${transcriptText()}\n\nRespond as the ${ROLE_LABEL[pane]}:`;

    try {
        const text = await callModel(systemPrompt, prompt);
        setMessageText(pending, text);
        pushTranscript(ROLE_LABEL[pane], text);
    } catch (err) {
        setMessageText(pending, 'error: ' + err.message);
    } finally {
        input.disabled = false;
        input.focus();
    }
}

textbox.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const thought = textbox.value.trim();
    if (!thought) return;
    submitThought(thought);
});
