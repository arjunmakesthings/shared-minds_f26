// talks to the itp/ima replicate proxy -- never to replicate or a personal key directly

import { PROXY_URL, MODEL, MAX_TOKENS } from './config.js';

function extractText(prediction) {
    if (Array.isArray(prediction.output)) return prediction.output.join('');
    if (typeof prediction.output === 'string') return prediction.output;
    return JSON.stringify(prediction);
}

export async function callModel(systemPrompt, promptText) {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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
