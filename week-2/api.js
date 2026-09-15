// talks to the itp/ima replicate proxy -- never to replicate or a personal key directly

import { PROXY_URL, MODEL, TOKEN_PATH, MAX_TOKENS } from './config.js';

let tokenPromise = null;

// cached as a promise (not just the resolved value) so two calls firing back to back --
// e.g. the left/right opening statements -- share one fetch instead of racing two
export function getAuthToken() {
    if (!tokenPromise) {
        tokenPromise = fetch(TOKEN_PATH)
            .then((res) => {
                if (!res.ok) throw new Error('could not read auth token from ' + TOKEN_PATH);
                return res.text();
            })
            .then((text) => text.trim());
    }
    return tokenPromise;
}

function extractText(prediction) {
    if (Array.isArray(prediction.output)) return prediction.output.join('');
    if (typeof prediction.output === 'string') return prediction.output;
    return JSON.stringify(prediction);
}

export async function callModel(systemPrompt, promptText) {
    const authToken = await getAuthToken();

    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            model: MODEL,
            input: {
                prompt: promptText,
                system_prompt: systemPrompt,
                max_tokens: MAX_TOKENS,
            },
        }),
    });

    const prediction = await response.json();

    if (!response.ok) {
        throw new Error(prediction.error || `request failed (${response.status})`);
    }

    return extractText(prediction);
}
