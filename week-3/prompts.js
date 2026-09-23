// every prompt sent to the image model lives here, separate from config/wiring, so it can be
// read and tuned on its own. no meta context about "this is a performance" or "self-portrait" is
// included on purpose -- see notes-for-claude if that decision needs revisiting -- because naming
// the frame tends to push the model toward a conceptual/artistic rendering instead of a literal,
// accurate one, which is the opposite of what's wanted here.

export const PRE_PROMPT = `generate a hyperrealistic photograph -- as if captured by a real camera in a real room, not an illustration, painting, or stylized render. render every detail in the description below with maximum fidelity: exact colors, materials, textures, lighting, proportions, and spatial arrangement as described, and nothing invented beyond it. this must look like an unstaged, real photograph of an actual person and an actual room -- not idealized, not beautified, not artistically reinterpreted. prioritize literal accuracy over composition or aesthetics.

description:
`;

// the full prompt actually sent for a given generation call is: PRE_PROMPT + the writer's raw
// text so far. built in api.js via buildPrompt().
export function buildPrompt(writtenText) {
    return `${PRE_PROMPT}${writtenText}`;
}
