import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zyfjsxchaxiblaxnvkbh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5ZmpzeGNoYXhpYmxheG52a2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4OTk5MTQsImV4cCI6MjA4NTQ3NTkxNH0.-i_0J7vEmMJvCUr1pPBzZgtvo5MUWFTx4WgOpWdeW5U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
    }
});
