import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sgbjhwhwnldhgcydqqny.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnYmpod2h3bmxkaGdjeWRxcW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzc5MTEsImV4cCI6MjA3MTYxMzkxMX0.X7FMI_tNPsC7U0ZBzhYKZ3nsCbbrzMkbNH37C0HP2VE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);