// turns model/user text into safe DOM content -- escapes everything, then re-links real URLs

export function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function linkifyText(text) {
    const urlRegex = /https?:\/\/[^\s)]+/g;
    let html = '';
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
        html += escapeHtml(text.slice(lastIndex, match.index));
        const safeUrl = escapeHtml(match[0]);
        html += `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
        lastIndex = match.index + match[0].length;
    }
    html += escapeHtml(text.slice(lastIndex));

    return html.replace(/\n/g, '<br>');
}

// the model wraps its single strongest phrase in **double asterisks** -- everything else in
// this file treats model text as plain, so this is the one deliberate markup convention we parse
export function renderRich(text) {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts
        .map((part, i) => (i % 2 === 1 ? `<mark>${linkifyText(part)}</mark>` : linkifyText(part)))
        .join('');
}

export function addPendingMessage(logEl) {
    const el = document.createElement('div');
    el.className = 'message';
    el.innerHTML = '<em>thinking...</em>';
    logEl.appendChild(el);
    logEl.scrollTop = logEl.scrollHeight;
    return el;
}

export function setMessageText(el, text) {
    el.innerHTML = renderRich(text);
    el.parentElement.scrollTop = el.parentElement.scrollHeight;
}

export function appendMessage(logEl, text, extraClass) {
    const el = document.createElement('div');
    el.className = extraClass ? `message ${extraClass}` : 'message';
    el.innerHTML = linkifyText(text);
    logEl.appendChild(el);
    logEl.scrollTop = logEl.scrollHeight;
}
