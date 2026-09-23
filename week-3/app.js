import { generateImage } from './api.js';
import { MODEL } from './config.js';
import { createVoiceInput } from './voice.js';

const timerEl = document.getElementById('timer');
const modelNameEl = document.getElementById('model-name');
const dotEl = document.getElementById('dot');
const inputBox = document.getElementById('input-box');
const outputImage = document.getElementById('output-image');
const imagePlaceholder = document.getElementById('image-placeholder');
const endBtn = document.getElementById('end-btn');
const speakBtn = document.getElementById('speak-btn');

modelNameEl.textContent = MODEL;

function setDot(state) {
    dotEl.className = state; // '', 'generating', 'done', or 'error'
}

// -- timer: elapsed stopwatch, counting up from page load --

const startTime = Date.now();

function pad(n) {
    return String(n).padStart(2, '0');
}

function updateTimer() {
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsedSec / 3600);
    const minutes = Math.floor((elapsedSec % 3600) / 60);
    const seconds = elapsedSec % 60;
    timerEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

updateTimer();
setInterval(updateTimer, 1000);

// -- double-enter detection: two consecutive enter presses (no other key between)
//    triggers a generation call using everything typed so far --

let enterStreak = 0;

// force the actual stored text to lowercase (not just a css display trick) so typed text,
// exports, and prompts sent to the model all stay lowercase -- matches spoken text, which
// voice.js already lowercases at the source.
inputBox.addEventListener('input', () => {
    const start = inputBox.selectionStart;
    const end = inputBox.selectionEnd;
    inputBox.value = inputBox.value.toLowerCase();
    inputBox.setSelectionRange(start, end);
});

inputBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        enterStreak += 1;
        if (enterStreak >= 2) {
            enterStreak = 0;
            triggerGeneration();
        }
    } else {
        enterStreak = 0;
    }
});

// -- voice input: transcribes into the textarea while listening. typing still works any time
//    (best done while the mic is paused, since a new speech result overwrites the box). a pause
//    of PAUSE_MS with no new speech is the voice equivalent of double-enter. --

const PAUSE_MS = 2500;

const voice = createVoiceInput({
    textarea: inputBox,
    pauseMs: PAUSE_MS,
    onPause: () => triggerGeneration(),
    onFatalError: (reason) => {
        speakBtn.textContent = 'speak';
        speakBtn.classList.remove('active');
        setDot('error');
        console.error('voice input stopped:', reason);
    },
});

if (voice) {
    speakBtn.addEventListener('click', () => {
        voice.toggle();
        speakBtn.textContent = voice.isListening ? 'stop' : 'speak';
        speakBtn.classList.toggle('active', voice.isListening);
    });
} else {
    speakBtn.disabled = true;
    speakBtn.textContent = 'voice unsupported';
    console.error('speech recognition is not supported in this browser -- use chrome or edge.');
}

// -- image generation: async, never blocks typing. a request counter guards
//    against an older, slower response overwriting a newer one. --

let requestCounter = 0;
let currentImageUrl = null;

async function triggerGeneration() {
    const prompt = inputBox.value.trim();
    if (!prompt) return;

    const thisRequestId = ++requestCounter;
    setDot('generating');

    try {
        const imageUrl = await generateImage(prompt);

        if (thisRequestId !== requestCounter) return; // a newer request already superseded this one

        currentImageUrl = imageUrl;
        outputImage.src = imageUrl;
        outputImage.hidden = false;
        imagePlaceholder.hidden = true;
        setDot('done');
    } catch (err) {
        if (thisRequestId !== requestCounter) return;
        setDot('error');
        console.error(err);
    }
}

// -- end button: exports the current image as jpeg and the full text as txt --

function timestamp() {
    const d = new Date();
    const pad2 = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// the image lives on replicate.delivery, which sends no CORS headers -- fetch()-ing it to build
// a blob is silently blocked by the browser. downloading straight off the url (no fetch, no byte
// reading in js) sidesteps cors entirely; chrome honors this even cross-origin. it may keep
// replicate's own filename instead of ours, but the file itself downloads correctly.
function downloadUrl(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function endPerformance() {
    const stamp = timestamp();

    const textBlob = new Blob([inputBox.value], { type: 'text/plain' });
    downloadBlob(textBlob, `performance-${stamp}.txt`);

    if (currentImageUrl) {
        downloadUrl(currentImageUrl, `performance-${stamp}.jpg`);
    }
}

endBtn.addEventListener('click', endPerformance);
