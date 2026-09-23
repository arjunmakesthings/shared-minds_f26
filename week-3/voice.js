// wraps the browser's speech recognition api (chrome/edge only) into a simple start/stop
// controller. transcribes continuously into the given textarea, calling onPause whenever the
// speaker goes quiet for pauseMs -- that pause is the voice equivalent of "double enter."

const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture']);

export function createVoiceInput({ textarea, pauseMs, onPause, onFatalError }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null; // unsupported browser -- caller decides how to degrade

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let listening = false;
    let baseText = ''; // textarea content at the moment this recognition session (re)started
    let finalTranscript = ''; // finalized results accumulated within this session
    let pauseTimer = null;

    function moveCaretToEnd() {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        textarea.scrollTop = textarea.scrollHeight;
    }

    function resetPauseTimer() {
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(() => {
            if (!listening) return;
            // mirror double-enter: a paragraph break, cursor dropped to the end -- same visible
            // effect as if this pause had been two enter presses.
            textarea.value += '\n\n';
            baseText = textarea.value;
            finalTranscript = '';
            moveCaretToEnd();
            onPause();
        }, pauseMs);
    }

    recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interim += transcript;
            }
        }
        textarea.value = baseText + finalTranscript + interim;
        // keep the caret visibly blinking at the end, as if this were being typed live
        moveCaretToEnd();
        resetPauseTimer();
    };

    recognition.onend = () => {
        // the browser can stop recognition on its own (e.g. after a long silence) -- if we're
        // still supposed to be listening, restart transparently, re-basing onto current text.
        if (listening) {
            baseText = textarea.value;
            finalTranscript = '';
            try {
                recognition.start();
            } catch (err) {
                // known web speech api race: calling start() immediately after onend can throw
                // 'already started' in some browsers -- retry once, shortly after.
                setTimeout(() => {
                    if (listening) recognition.start();
                }, 250);
            }
        }
    };

    recognition.onerror = (event) => {
        console.error('speech recognition error:', event.error);
        if (FATAL_ERRORS.has(event.error)) {
            // mic permission denied/revoked or no mic available -- retrying won't help, and
            // looping start() calls here would just spam errors. hard stop and tell the caller
            // so the ui (the speak button) can reflect reality instead of silently going stale.
            listening = false;
            clearTimeout(pauseTimer);
            if (onFatalError) onFatalError(event.error);
        }
    };

    function start() {
        if (listening) return;
        listening = true;
        baseText = textarea.value;
        finalTranscript = '';
        try {
            recognition.start();
        } catch (err) {
            listening = false;
            console.error('failed to start speech recognition:', err);
            if (onFatalError) onFatalError('start-failed');
            return;
        }
        moveCaretToEnd();
        resetPauseTimer();
    }

    function stop() {
        listening = false;
        clearTimeout(pauseTimer);
        recognition.stop();
    }

    return {
        start,
        stop,
        toggle() {
            if (listening) stop();
            else start();
        },
        get isListening() {
            return listening;
        },
    };
}
