// your supabase project's url and publishable (anon) key -- dashboard → project settings → api keys.
// the publishable key is meant to be public: row level security (supabase/schema.sql) is what keeps
// browsers read-only. never put the secret key here -- that one lives in worker/.env only.

export const SUPABASE_URL = 'https://your-project-ref.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_your-key-here';
