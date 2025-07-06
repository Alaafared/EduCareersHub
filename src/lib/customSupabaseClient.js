import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mskboqmthtlmygyxrqgo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1za2JvcW10aHRsbXlneXhycWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTA1ODksImV4cCI6MjA2Njk4NjU4OX0.9NTTmAjZ3SmfhsoXqC7NyX25F7TNwXMBE1cgXCYRtFs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);