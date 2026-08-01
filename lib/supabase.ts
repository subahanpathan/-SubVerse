import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://nulzebcpkymairtcdjex.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Public Supabase client for client-side / anonymous operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey);

// Admin Supabase client with Service Role privileges for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);
