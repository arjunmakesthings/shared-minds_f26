// renders the always-on "what can I say" reference in the top-left corner,
// straight from commands.js — nothing here needs editing when a phrase changes
const commandListEl = document.getElementById('command-list');

for (const { phrase, description } of Object.values(COMMANDS)) {
  const row = document.createElement('div');

  const phraseEl = document.createElement('span');
  phraseEl.className = 'command-phrase';
  phraseEl.textContent = `"${phrase}"`;

  row.append(phraseEl, ` — ${description}`);
  commandListEl.append(row);
}
