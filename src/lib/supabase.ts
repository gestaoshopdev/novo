import { createClient } from "@supabase/supabase-js";

// Pegamos as variáveis de ambiente do Vite
// O fallback ("") evita que a aplicação quebre antes de configurar as variáveis no .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";

console.log("[Supabase] Initializing with URL:", supabaseUrl);
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn("[Supabase] VITE_SUPABASE_URL not found in environment, using fallback.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
