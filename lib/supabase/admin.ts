import { createClient } from "@supabase/supabase-js";

// Server-only. Bypasses RLS via service_role. Use sparingly:
// - Seed scripts
// - Admin-only mutations that legitimately need to bypass RLS
// Never import this from a Client Component or Route Handler that handles user input without authz.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
