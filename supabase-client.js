import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://qyscjpbcltlserrdkruz.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_rxMz0MPjI16b1cXND8uQug_4A7wJMk1';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
