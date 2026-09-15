# notes on itp-ima-replicate-proxy

source: https://itp-ima-replicate-proxy.web.app (docs.md)

## what it is
a proxy server (hosted by itp/ima) that sits between browser javascript and the replicate api
(https://replicate.com/explore). replicate itself doesn't allow direct calls from browser js
(cors + api key exposure), so this proxy relays requests and adds itp/ima's api key server-side.

## the one url that matters
```
https://itp-ima-replicate-proxy.web.app/api/create_n_get
```
this is a fetch target, not something to open in a browser.

## minimal request shape
```js
async function askForPicture(p_prompt) {
    const replicateProxy = "https://itp-ima-replicate-proxy.web.app/api/create_n_get";
    let authToken = ""; // optional, see auth below

    let data = {
        model: "black-forest-labs/flux-schnell",
        input: { prompt: p_prompt },
    };

    let fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(data),
    };

    const response = await fetch(replicateProxy, fetchOptions);
    const prediction = await response.json();
    return prediction; // shape depends on the model, e.g. prediction.output[0] for an image
}
```

- `model`: e.g. "stability-ai/stable-diffusion-3" — find on the model's replicate.com page
- or `version`: pinned model+version hash, e.g. "stability-ai/stable-diffusion-3:ac732df..."
- `input`: object with whatever params that specific model's replicate page documents (check the
  model card / "API" tab on replicate.com for the parameter list)

## auth
- not required for light use — a few free creations on cheaper models without a token
- authenticating raises quotas and is required for expensive/video models
- sign in on the docs page with an nyu.edu google account, copy the token into `authToken`
- tokens expire roughly hourly — need to refresh manually
- rate limits: 500 req/day on cheap models, 10 req/day on expensive/video models (authenticated)
- my token for this project is stored locally in `hidden/token.txt` (gitignored, never commit it)

**status in this project (2026-09-15): auth removed.** the dialectic canvas feature (`api.js`)
sends no `Authorization` header at all now, so the page works for anyone on the web with no login
step, per the proxy docs saying auth is optional. `hidden/token.txt` and the read-token-then-send-
bearer-header pattern above are both still here, untouched, specifically so this is easy to revert
if the unauthenticated "a few creations" quota turns out too small for real traffic -- see
`architecture.md`'s "known constraints" for the tradeoff.

## sending media (images/audio/etc as input to a model)
browser can't host files for replicate to fetch, so the proxy does it:
- base64-encode the file client side (e.g. `canvas.toDataURL()`)
- tell the proxy which json field to convert and what extension to give it, e.g.
```js
let jsonToReplicate = {
    model: "modelThatTakesAnImageInput",
    fieldToConvertBase64ToURL: "image",
    fileFormat: ".jpg",
    input: {
        prompt: "fast running",
        image: imageInBase64Text,
    },
};
```
- the proxy hosts the decoded file at a temp url and swaps it into the field before forwarding to replicate

## client examples repo
dynamic list of example clients at https://itp-ima-replicate-proxy.web.app/examples.html
(pulls from github.com/dano1234/SharedMindsS26, "Week 02 ML APIs/ClientExamples")

## gotchas / things to remember when building
- always POST, always `Content-Type: application/json`
- everything is async — use `async function` + `await fetch(...)` + `await response.json()`
- output shape is model-specific; console.log the raw prediction first, then dig into it
  (commonly `prediction.output[0]` for a single generated image)
- don't hardcode the auth token in committed code — read from `hidden/token.txt` locally instead
