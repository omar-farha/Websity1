import { createServerClient } from "@supabase/ssr";
import WebSocket from "ws";

// Anon-key client for public site content (projects, faqs, approach_steps)
// and public writes governed by RLS (e.g. the contact form's lead inserts —
// see app/lib/leads.ts). Not used for auth — the dashboard has its own
// password-based login (see app/lib/dashboardAuth.ts) and its own
// service-role client for admin reads/writes (see app/lib/supabase/admin.ts).
//
// Deliberately does NOT touch Next's cookies() API: this client never
// needs to read or persist a session, and some callers (generateStaticParams,
// generateMetadata at build time) run outside any request scope where
// cookies() isn't available at all and would throw if called.
export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op — this client never persists a session.
        },
      },
      // Node 20 has no native WebSocket global; supabase-js's realtime
      // client needs one even though this client never subscribes.
      realtime: { transport: WebSocket as never },
    }
  );
}
