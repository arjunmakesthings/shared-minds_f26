// voice input: transcribes speech and turns finished utterances into canvas nodes
const transcriptEl = document.getElementById('transcript');
const micBtn = document.getElementById('mic-btn');

const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

let startListening = () => {};

if (!SpeechRecognitionCtor) {
  transcriptEl.textContent = 'speech recognition is not supported in this browser.';
  micBtn.disabled = true;
} else {
  let listening = false;
  let hasShownPlaceholder = false;
  let recognition = null;
  let sessionId = 0;
  let lastActivity = 0;
  let watchdogTimer = null;
  let staleRestartCount = 0;

  function showPlaceholder() {
    if (hasShownPlaceholder) return;
    hasShownPlaceholder = true;
    transcriptEl.textContent = CONFIG.voice.placeholderText;
    transcriptEl.classList.add('placeholder');
  }

  function showTranscript(text) {
    transcriptEl.textContent = text;
    transcriptEl.classList.remove('placeholder');
  }

  function setMicLabel(state) {
    micBtn.textContent = `speak-mode: ${state} ${CONFIG.voice.enterIcon}`;
  }

  // routes a finished utterance to either a command (modes.js) or a new node
  function handleResult(event) {
    lastActivity = Date.now();
    staleRestartCount = 0;
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        const text = result[0].transcript.trim();
        if (text && !handleVoiceCommand(text)) addBranchNode(text);
        showTranscript('');
      } else {
        interim += result[0].transcript;
      }
    }
    if (interim) showTranscript(interim);
  }

  // builds a fresh recognition instance rather than reusing one that already
  // ended — reusing the same instance across many restarts tends to wedge
  // Chrome's speech engine into a silently-dead state after a few cycles.
  // each instance is tagged with the sessionId active when it was created, so
  // a superseded instance's late callbacks can't act on top of a newer one.
  function createRecognition() {
    const id = ++sessionId;
    const r = new SpeechRecognitionCtor();
    r.continuous = true;
    r.interimResults = true;
    r.lang = CONFIG.voice.lang;

    r.onresult = (event) => {
      if (id !== sessionId) return;
      handleResult(event);
    };
    r.onerror = (event) => {
      console.warn('speech recognition error:', event.error);
    };
    r.onend = () => {
      if (id !== sessionId) return;
      if (listening) setTimeout(() => restart(id), CONFIG.voice.restartDelay);
    };

    return r;
  }

  function restart(fromId) {
    if (!listening) return;
    if (fromId !== undefined && fromId !== sessionId) return; // a newer session already took over
    recognition = createRecognition();
    lastActivity = Date.now();
    try {
      recognition.start();
    } catch (err) {
      setTimeout(() => restart(sessionId), CONFIG.voice.restartDelay);
    }
  }

  function startWatchdog() {
    stopWatchdog();
    watchdogTimer = setInterval(() => {
      if (!listening) return;
      if (Date.now() - lastActivity > CONFIG.voice.watchdogTimeout) {
        staleRestartCount++;

        if (staleRestartCount > CONFIG.voice.maxStaleRestarts) {
          console.warn('speech recognition watchdog: giving up after repeated stalls');
          turnOff();
          transcriptEl.textContent = 'mic stalled — click "speak-mode" to try again';
          return;
        }

        console.warn('speech recognition watchdog: no activity, forcing restart');
        const staleId = sessionId;
        lastActivity = Date.now(); // hold off the watchdog while we wait to restart
        try { recognition.abort(); } catch (err) {}
        // wait for abort() to actually release the mic before starting a new
        // instance — starting immediately can silently contend with the old
        // instance's teardown and never truly resume listening
        setTimeout(() => restart(staleId), CONFIG.voice.restartDelay);
      }
    }, CONFIG.voice.watchdogInterval);
  }

  function stopWatchdog() {
    if (watchdogTimer) clearInterval(watchdogTimer);
    watchdogTimer = null;
  }

  function turnOn() {
    if (listening) return;
    listening = true;
    staleRestartCount = 0;
    recognition = createRecognition();
    lastActivity = Date.now();
    recognition.start();
    startWatchdog();
    setMicLabel('on');
    micBtn.classList.add('listening');
    showPlaceholder();
  }

  function turnOff() {
    if (!listening) return;
    listening = false;
    stopWatchdog();
    sessionId++; // invalidate any in-flight callbacks from the old session
    if (recognition) recognition.stop();
    setMicLabel('off');
    micBtn.classList.remove('listening');
    showTranscript('');
  }

  micBtn.addEventListener('click', () => {
    if (listening) turnOff();
    else turnOn();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (introActive) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    e.preventDefault();
    if (listening) turnOff();
    else turnOn();
  });

  setMicLabel('off');
  startListening = turnOn;
}
