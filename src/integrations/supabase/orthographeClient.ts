import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fdnslpjnumotuwovypkp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbnNscGpudW1vdHV3b3Z5cGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTAzMDAsImV4cCI6MjA4NDI2NjMwMH0.u-Uu79sJdhYoNqsRLlnaEVLGvV1GmgdzrEFa-Xaielg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
    }
});
