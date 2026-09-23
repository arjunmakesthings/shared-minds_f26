// all tunable parameters for the automatic-writing -> image feature live here

export const PROXY_URL = 'https://itp-ima-replicate-proxy.web.app/api/create_n_get';

// gemini 2.5 flash image, hosted on replicate as "nano-banana" -- picked for strong prompt
// adherence / attention to detail on descriptive text-to-image prompts.
export const MODEL = 'google/nano-banana';

// extra fixed params sent alongside { prompt } on every call.
export const IMAGE_PARAMS = {
    output_format: 'jpg',
};
