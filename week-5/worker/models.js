// how each replicate model wants its image, plus any fixed params. every model here was checked
// through the itp/ima proxy (2026-10-06): no auth token, the base64 png sent directly in the image
// field (no fieldToConvertBase64ToURL needed), and a stroke reply came back that prompt.js can read.
// field names come from each model's schema at https://replicate.com/<model>/api/schema
//
// the proxy gives up after 60s (http 502), so a model must answer within that. measured with the
// full prompt + a 1200x750 canvas: gpt-4.1 ~4s, claude-4.5-sonnet ~10-15s, gpt-5 ~10-22s,
// gemini-2.5-flash ~20s, gemini-3-flash ~36s. google/gemini-3-pro and gemini-3.1-pro take >60s -> 502.

export const PROXY_URL = 'https://itp-ima-replicate-proxy.web.app/api/create_n_get';

export const MODELS = {
    'anthropic/claude-4.5-sonnet': { imageField: 'image', imageAsList: false, params: {} },
    'google/gemini-2.5-flash': { imageField: 'images', imageAsList: true, params: {} },
    'openai/gpt-5': { imageField: 'image_input', imageAsList: true, params: { reasoning_effort: 'minimal' } },
    'google/gemini-3-flash': { imageField: 'images', imageAsList: true, params: {} },
    'openai/gpt-4.1': { imageField: 'image_input', imageAsList: true, params: {} },
    // also verified, as spares:
    'anthropic/claude-4.5-haiku': { imageField: 'image', imageAsList: false, params: {} },
    'openai/gpt-5-mini': { imageField: 'image_input', imageAsList: true, params: {} },
};
