# itp/ima replicate proxy — reference

source: https://itp-ima-replicate-proxy.web.app (page renders `docs.md` from that site)
working examples: https://github.com/dano1234/SharedMindsS26 → `Week 02 ML APIs/ClientExamples/`
captured: 2026-10-06

---

## tl;dr

- **endpoint:** `POST https://itp-ima-replicate-proxy.web.app/api/create_n_get`
  - use this instead of `api.replicate.com`. it's a fetch target, not a page to visit.
  - `create_n_get` = it creates the prediction **and waits for the result**, so there's no polling. one request, one response.
- **no replicate account and no api key needed.** itp/ima pays for it.
- **body:** `{ model | version, input: {...} }`. the `input` params come from the model's page on replicate.com (api / schema tab).
- **response:** json whose `.output` holds the result. its shape depends on the model (see the cookbook below).
- **auth is optional.** send `Authorization: Bearer <token>` for higher quotas. it's required for expensive models like video.
- works straight from browser js (the proxy handles cors and hides the key). it also works from node, since it's a plain https post.
- **hard 60s limit.** if the model hasn't finished in ~60s, the proxy returns **http 502 with an html error page** (not json). see "verified findings" below.

---

## why a proxy

- keeps the replicate api key private (browser code is public)
- avoids cors errors (replicate won't accept browser-origin calls)
- itp/ima pays for replicate
- hosts files for models that need a url as input (see "sending media")

---

## request shape

```js
const replicateProxy = "https://itp-ima-replicate-proxy.web.app/api/create_n_get";
let authToken = ""; // optional, see auth section

const data = {
  // pick ONE of these:
  model: "black-forest-labs/flux-schnell",                 // official / latest model
  // version: "owner/name:versionhash",                    // pin a specific version (needed for many community models)

  // optional, only when sending media (see below):
  // fieldToConvertBase64ToURL: "image",
  // fileFormat: "png",

  input: {
    prompt: "...",
    // ...any other params from the model's schema
  },
};

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${authToken}`,
  },
  body: JSON.stringify(data),
};

const res = await fetch(replicateProxy, options);
const prediction = await res.json();
if (!res.ok) console.log("proxy error:", prediction.error, prediction.details);
console.log(prediction.output);
```

notes:
- `model` vs `version`: use `model: "owner/name"` for official models. use `version: "owner/name:hash"` to pin a version. the hash is on the model's replicate page under api → http. if you use replicate's copy button, delete any extra spaces it adds.
- most `input` params have defaults. usually only `prompt` (or the media field) is required.
- on failure, the response json has `error` and sometimes `details`. check `res.ok`.
- always `console.log` the whole response first and unfold it to find where the output sits.

---

## authentication (optional)

- not required. without it you get a few generations on cheap models.
- with it you get bigger quotas, and you need it for expensive (video) models.
- how: go to https://itp-ima-replicate-proxy.web.app, click **google login** at the bottom, and sign in with an `@nyu.edu` account (only nyu.edu is allowed). copy the token that appears and paste it into `authToken`.
- the token is a firebase id token. it **expires about every hour**, so refresh it from the page when calls start failing.
- in code: header `Authorization: Bearer ${authToken}`. an empty token (`Bearer `) is fine for unauthenticated use.
- **don't commit real tokens to git.**

## usage limits

- unauthenticated: a few creations on cheaper models
- authenticated: **500 requests/day** on cheaper models
- authenticated: **10 requests/day** on expensive models (e.g. video)

---

## sending media (images / audio) to a model

many models want a **url** to a file, not the file's data. a browser can't host a url, so the proxy does it for you:

1. turn the media into a base64 data url (`canvas.toDataURL()`, or a `FileReader` for blobs)
2. put it in the `input` field the model expects
3. at the top level, tell the proxy which field to convert and what file extension to use:

```js
const data = {
  model: "some/model",
  fieldToConvertBase64ToURL: "image", // name of the key inside `input`
  fileFormat: "png",                  // e.g. "png", "jpg", "wav" (examples use it without the dot)
  input: {
    prompt: "fast running",
    image: canvas.toDataURL(),
  },
};
```

the proxy saves a temporary hosted file, swaps your base64 for its url, and then calls replicate.

note: some models accept base64 data urls directly, so you don't need the conversion fields (e.g. `nano-banana` `image_input`, `flux-fill-dev` `image`/`mask` in the examples below). if a model rejects base64, add `fieldToConvertBase64ToURL` + `fileFormat`.

blob → base64 helper (for audio from `MediaRecorder`, etc.):

```js
function convertBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // "data:audio/wav;base64,..."
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

---

## cookbook — models used in the course examples

these come from working class examples (SharedMindsS26, week 02 ClientExamples). the proxy shares the replicate catalog, so other models work too. check their schema on replicate.com.

| task | model / version | key `input` | `output` shape |
|---|---|---|---|
| text (llm) | `model: "openai/gpt-5"` | `prompt` | array of string chunks → `output.join("")` |
| text (llm) | `model: "google/gemini-3-pro"` | `prompt` | array of string chunks → `output.join("")`. **slow**: with an image + a long prompt it takes over 60s → 502 |
| text → image | `model: "google/nano-banana-2"` | `prompt`, `aspect_ratio: "1:1"` | single url string |
| text → image | `model: "google/imagen-4-fast"` | `prompt` | single url string |
| text → image | `model: "black-forest-labs/flux-schnell"` | `prompt` | array of urls → `output[0]` |
| image → image (edit) | `model: "google/nano-banana"` | `prompt`, `image_input: [base64]`, `output_format: "png"` | single url string |
| inpainting | `model: "black-forest-labs/flux-fill-dev"` | `prompt`, `image: base64`, `mask: base64`, `output_format: "png"` | array of urls → `output[0]` |
| lora image | `model: "black-forest-labs/flux-schnell-lora"` | `prompt`, `lora_weights: <url>`, `num_outputs: 4` | array of urls |
| speech → text | `version: "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c"` + `fieldToConvertBase64ToURL: "audio"`, `fileFormat: "wav"` | `audio: base64` | object → `output.text` |
| text → music | `version: "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb"` | `prompt` | single audio url string |
| text embeddings | `version: "beautyyuyanli/multilingual-e5-large:a06276a89f1a902d5fc225a9ca32b6e8e6292b7f3b136518878da97c458e2bad"` | `texts: JSON.stringify([...strings])` | array of vectors, one per text |
| image/text embeddings (clip) | `model: "andreasjansson/clip-features:75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a"` | check the model card (the course example's `input` was commented out) | array of embeddings |

tip: image output can be a string or an array, depending on the model. handle both:

```js
const url = Array.isArray(p.output) ? p.output[0] : p.output;
```

### llm returning json

ask for strict json in the prompt, then parse the joined output:

```js
const data = {
  model: "openai/gpt-5",
  input: { prompt: "a json list of 5 words related to " + word + " with no extra words or punctuation" },
};
// ...fetch...
const list = JSON.parse(json.output.join(""));
```

### playing returned audio (musicgen)

```js
const ctx = new AudioContext();
const buf = await (await fetch(json.output)).arrayBuffer();
const src = ctx.createBufferSource();
src.buffer = await ctx.decodeAudioData(buf);
src.connect(ctx.destination);
src.start();
```

### loading returned images

```js
// plain dom
const img = document.createElement("img");
img.crossOrigin = "anonymous"; // needed if you'll draw it on a canvas and read pixels back
img.src = url;

// p5
loadImage(url, (incoming) => { img = incoming; });
```

---

## verified findings (tested 2026-10-06, during week-5 "exquisite cursors")

these come from real calls, not from the docs.

- **no auth token needed** for any of the llms below. all were called with an empty token, many times over.
- **60s hard limit**: requests that run past ~60s come back as `502` with an html page (`<title>Error 502 (Server Error)`). `response.json()` throws on that, so always guard it:
  ```js
  const prediction = await response.json().catch(() => ({}));
  if (!response.ok || prediction.error) throw new Error(`proxy ${response.status}: ${prediction.error ?? ''}`);
  ```
- **base64 data urls work directly** in the image fields of the vision llms below. no `fieldToConvertBase64ToURL` needed.
- the response echoes your `input` with base64 replaced by `"..."`. `logs` holds token counts and timing, which helps with debugging.
- **finding a model's input fields:** open `https://replicate.com/<owner>/<model>/api/schema`. it's an html page, and the json schema with field names is inside it. a 404 means the model doesn't exist on replicate.

### vision llms (image + text in → text out)

| model | image field | type | other useful params | answer time* |
|---|---|---|---|---|
| `openai/gpt-4.1` | `image_input` | array of urls/data-urls | `system_prompt`, `max_completion_tokens` | ~4s |
| `openai/gpt-5` | `image_input` | array | `reasoning_effort` (minimal/low/medium/high, default minimal), `system_prompt` | ~10–22s |
| `openai/gpt-5-mini` | `image_input` | array | same as gpt-5 | ~8s |
| `anthropic/claude-4.5-sonnet` | `image` | **single string** | `system_prompt`, `max_tokens` (min 1024) | ~10–15s |
| `anthropic/claude-4.5-haiku` | `image` | single string | same as sonnet | ~3s |
| `google/gemini-2.5-flash` | `images` | array (max 10, 7mb each) | `max_output_tokens`, `temperature` | ~20s |
| `google/gemini-3-flash` | `images` | array | `thinking_level`, `max_output_tokens` | ~36s |
| `google/gemini-3-pro` / `gemini-3.1-pro` | `images` | array | `thinking_level` (none/low/high) | **>60s → 502** with a 1200×750 image + ~2k-token prompt (~22s with a tiny image + short prompt) |

\* measured with a ~2k-token prompt + a 1200×750 png. short prompts are faster.

not on replicate (404): `anthropic/claude-4-sonnet`, `xai/grok-4`, `qwen/qwen3-vl-235b-a22b-instruct`, `moonshotai/kimi-k2-instruct`, `google/gemini-2.5-pro`. `meta/llama-4-maverick-instruct` exists but takes no image.

### asking llms for json

- output is an array of string chunks, so `output.join("")` first.
- gemini wraps json in ```` ```json ```` fences even when told not to.
- openai models sometimes emit **invalid json** (a dropped `]` or `}`), roughly 1 in 3 replies for long coordinate lists.
- so don't trust `JSON.parse` on its own. strip the fences, and for structured data like coordinate lists, regex-extract what you need. see `week-5/worker/prompt.js` → `parseReply` for a working example.

---

## gotchas

- calls take seconds (images), minutes (video). use `async`/`await` and show a loading state (e.g. `document.body.style.cursor = "progress"`).
- anything that takes longer than ~60s fails with a 502 html page (see verified findings). for slow models, start the call early (e.g. while something else is happening) instead of waiting until the result is needed.
- the `.output` shape differs per model, so log the full response first.
- many community models need the full `version` hash. official models work with `model` alone.
- a call that worked before and now 401/403s probably has an expired token. refresh it from the site.
- replicate output urls are temporary. if you need to keep an image or audio file, re-host it (e.g. firebase storage).
- going without a proxy (your own key) only works from node. see `99 Node with Your API Key (no Proxy` in the examples repo.

---

## example index

- live list (course repo): https://itp-ima-replicate-proxy.web.app/examples.html
- all weeks: https://itp-ima-replicate-proxy.web.app/examples_all.html
- code: https://github.com/dano1234/SharedMindsS26/tree/main/Week%2002%20ML%20APIs/ClientExamples
- live demos: https://dano1234.github.io/SharedMindsS26/Week%2002%20ML%20APIs/ClientExamples/

| example | what it shows |
|---|---|
| 2 Canvas 2D With Ask Replicate Words | llm (gpt-5) → json word list |
| 3 / 3.5 Canvas 2D … Voice / Transcribe | mic → whisper → text |
| 4 Canvas 2D With Ask Replicate Pictures | text → image (nano-banana-2) |
| 4.5 Canvas 2D Drag Pictures (JSON) Objects | generated images as draggable objects |
| 5 P5 Replicate Text To Sound | musicgen + web audio playback |
| 6 Canvas 2D With Ask Replicate Inpainting | flux-fill-dev with canvas mask |
| 7 P5 Replicate Img 2 Img | webcam/canvas → nano-banana edit |
| 8 replicate_fine_tuning_lora | flux-schnell-lora with your own lora |
| 9 Text Embeddings How Close To Me | multilingual-e5-large similarity |
| 10 Text Embeddings Clustered | embeddings + umap |
| 12 Image Embedding Navigation by Creation | gemini llm → imagen/nano-banana → clip embeddings |
| 99 Node with Your API Key (no Proxy) | calling replicate directly from node |
