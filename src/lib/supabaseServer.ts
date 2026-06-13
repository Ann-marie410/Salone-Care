import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Admin client with service role key (bypasses RLS, server-only)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// Anonymous client for server-side auth operations (sign-in, etc.)
export const supabaseAnon = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

export default supabaseAdmin;
