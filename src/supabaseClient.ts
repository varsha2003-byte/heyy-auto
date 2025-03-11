import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbsgnvvldfyglixqrvbs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic2dudnZsZGZ5Z2xpeHFydmJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMzA4NzIsImV4cCI6MjA1NjkwNjg3Mn0.jnOU4Su6aQKFqxqX5aPvBKzmSd47fRCitNd5ND7v8fY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
