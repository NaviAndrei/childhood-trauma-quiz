import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create and export the Supabase client instance
// We export it directly so it's treated as a singleton
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Optional: You could also export a function if you prefer
// export function getSupabaseClient() {
//   return createSupabaseClient(supabaseUrl, supabaseAnonKey);
// } 