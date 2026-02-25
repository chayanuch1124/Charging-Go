import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vjrtgueqyrapblhnpaen.supabase.co'; // ต้องระบุภายหลัง
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcnRndWVxeXJhcGJsaG5wYWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTgzNzAsImV4cCI6MjA4NzU3NDM3MH0.K7caBpXefu9ypFrVkr6gt0hWDUWwz6OMjVsKaJIefgk'; // ต้องระบุภายหลัง

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

