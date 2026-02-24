import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co'; // ต้องระบุภายหลัง
const supabaseAnonKey = 'your-anon-key'; // ต้องระบุภายหลัง

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
