// talks to the itp/ima replicate proxy -- never to replicate or a personal key directly

import { PROXY_URL, MODEL, IMAGE_PARAMS } from './config.js';
import { buildPrompt } from './prompts.js';

function extractImageUrl(prediction) {
    if (Array.isArray(prediction.output)) return prediction.output[0];
    if (typeof prediction.output === 'string') return prediction.output;
    throw new Error('unexpected response shape from model');
}

// the proxy is a shared, unauthenticated community service -- occasional transient 500s are
// expected under load even with a valid request (confirmed: identical payloads that failed live
// succeeded moments later when retried directly). retry a couple of times on server errors before
// surfacing a failure, so one blip doesn't kill a breakpoint mid-performance.
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callProxy(prompt) {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: MODEL,
            input: {
                prompt,
                ...IMAGE_PARAMS,
            },
        }),
    });

    const prediction = await response.json();

    if (!response.ok) {
        const error = new Error(prediction.error || `request failed (${response.status})`);
        error.status = response.status;
        throw error;
    }

    return prediction;
}

export async function generateImage(writtenText) {
    const prompt = buildPrompt(writtenText);

    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            const prediction = await callProxy(prompt);
            return extractImageUrl(prediction);
        } catch (err) {
            lastError = err;
            // only retry on server-side failures (5xx) or a network-level failure (no status at
            // all) -- a 4xx means the request itself is bad and retrying won't help.
            const isRetryable = !err.status || err.status >= 500;
            if (!isRetryable || attempt === MAX_ATTEMPTS) break;
            console.warn(`generation attempt ${attempt} failed, retrying:`, err.message);
            await sleep(RETRY_DELAY_MS);
        }
    }
    throw lastError;
}
