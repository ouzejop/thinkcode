import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const isValidUrl = (url) => {
  try {
    return /^https?:\/\//i.test(url);
  } catch {
    return false;
  }
};

const canConnect = supabaseUrl && supabaseServiceKey && isValidUrl(supabaseUrl);

if (!canConnect) {
  console.warn(
    '[supabase] Supabase not configured or invalid URL — database features disabled.',
  );
}

/** Server-side Supabase client (service role). Null when not configured. */
export const supabase = canConnect
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;
