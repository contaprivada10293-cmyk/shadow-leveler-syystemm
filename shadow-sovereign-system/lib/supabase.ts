import { createClient } from "@supabase/supabase-js";

const supabaseUrl = typeof window !== "undefined" 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL 
  : process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = typeof window !== "undefined"
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseUrl !== "https://your-project.supabase.co" && 
  supabaseUrl.startsWith("http") &&
  supabaseAnonKey && 
  supabaseAnonKey !== "your-anon-key"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
