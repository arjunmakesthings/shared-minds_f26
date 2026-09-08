// asks for the central question, centered on the canvas, before speak-mode kicks in
const introText = document.getElementById('intro-text');
let questionText = '';
let introActive = true;

function renderIntro() {
  introText.textContent = '';

  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.textContent = '|';

  if (questionText) {
    introText.classList.remove('placeholder');
    introText.append(questionText, cursor);
  } else {
    introText.classList.add('placeholder');
    introText.append(cursor, 'central question: ');
  }
}

function handleIntroKeydown(e) {
  if (e.key === 'Enter') {
    const text = questionText.trim();
    if (!text) return;
    window.removeEventListener('keydown', handleIntroKeydown);
    introActive = false;
    introText.remove();
    initRoot(addNode(text));
    startListening();
    return;
  }

  if (e.key === 'Backspace') {
    questionText = questionText.slice(0, -1);
  } else if (e.key.length === 1) {
    questionText += e.key;
  } else {
    return;
  }

  renderIntro();
}

window.addEventListener('keydown', handleIntroKeydown);
renderIntro();
