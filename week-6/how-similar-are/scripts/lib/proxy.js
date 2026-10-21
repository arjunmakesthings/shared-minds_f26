// talks to the itp/ima replicate proxy (see ../../../../assets/replicate-proxy.md).
// every reply is cached on disk, so re-running a script costs no new calls.
// an optional REPLICATE_PROXY_TOKEN env var raises the quota; it's never written anywhere.

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { cacheDir, sleep } from "./util.js";

const PROXY_URL = "https://itp-ima-replicate-proxy.web.app/api/create_n_get";
const TIMEOUT_MS = 65_000; // the proxy itself gives up at 60s

export const MODELS = {
  haiku: { id: "anthropic/claude-4.5-haiku", build: (prompt, system, max) => ({ prompt, system_prompt: system, max_tokens: max }) },
  sonnet: { id: "anthropic/claude-4.5-sonnet", build: (prompt, system, max) => ({ prompt, system_prompt: system, max_tokens: max }) },
  gpt5: {
    id: "openai/gpt-5",
    build: (prompt, system, max) => ({ prompt, system_prompt: system, max_completion_tokens: max, reasoning_effort: "minimal" }),
  },
};

let liveCalls = 0;
export const liveCallCount = () => liveCalls;

// returns the model's text. throws if both tries fail.
export async function ask(modelKey, prompt, { system = "", maxTokens = 4096, tries = 2 } = {}) {
  const model = MODELS[modelKey];
  if (!model) throw new Error(`unknown model key: ${modelKey}`);
  const key = crypto.createHash("sha1").update(JSON.stringify([model.id, system, prompt, maxTokens])).digest("hex");
  const file = path.join(cacheDir, "llm", `${key}.txt`);
  try {
    return await fs.readFile(file, "utf-8");
  } catch {}

  let lastErr;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      liveCalls++;
      const res = await fetch(PROXY_URL, {
        method: "POST",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.REPLICATE_PROXY_TOKEN ?? ""}`,
        },
        body: JSON.stringify({ model: model.id, input: model.build(prompt, system, maxTokens) }),
      });
      const body = await res.json().catch(() => ({})); // a 502 comes back as html
      if (!res.ok || body.error) throw new Error(`proxy ${res.status}: ${body.error ?? "(no json)"} ${body.details ?? ""}`);
      const text = Array.isArray(body.output) ? body.output.join("") : String(body.output ?? "");
      if (!text.trim()) throw new Error("empty reply");
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, text);
      return text;
    } catch (e) {
      lastErr = e;
      if (attempt < tries) await sleep(1500);
    }
  }
  throw new Error(`${model.id}: ${lastErr.message}`);
}

// replies are asked for as json lines (one object per line) because the models sometimes drop a
// bracket in long json. each line is parsed on its own, so one bad line doesn't lose the rest.
export function parseJsonLines(text) {
  const out = [];
  for (let line of text.replace(/```[a-z]*/gi, "").split("\n")) {
    line = line.trim().replace(/,$/, "");
    if (!line.startsWith("{")) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // try once more after trimming anything after the last closing brace
      const end = line.lastIndexOf("}");
      if (end > 0) {
        try {
          out.push(JSON.parse(line.slice(0, end + 1)));
        } catch {}
      }
    }
  }
  return out;
}
