import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";

// Server-only client using the service role key — bypasses Row Level
// Security entirely. Only ever import this from Server Actions / Server
// Components under app/dashboard/**, which are already gated by the
// password-cookie check in middleware.ts. Never expose this key to the
// browser (no NEXT_PUBLIC_ prefix, never returned from an API route).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client is not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false },
    // Node 20 has no native WebSocket global; supabase-js's realtime client
    // needs one even though this admin client never subscribes to anything.
    realtime: { transport: WebSocket as never },
  });
}
