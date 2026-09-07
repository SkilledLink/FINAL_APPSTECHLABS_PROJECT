import { createClient } from '@supabase/supabase-js';

// HARDCODED (temporary fix until .env works)
const supabaseUrl = 'https://oynyrarroliyftdfwmyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bnlyYXJyb2xpeWZ0ZGZ3bXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzI0NzEsImV4cCI6MjEwMzkwODQ3MX0.3ElmKPbSiarmb1aR_rNaR3gClYLk0Z9MeAZWJpypJWI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 