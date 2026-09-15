import { createAdminClient } from "@/app/lib/supabase/admin";
import LeadsView from "./LeadsView";
import type { Note } from "../notes/types";
import type { Lead } from "./types";

export default async function LeadsPage() {
  const supabase = createAdminClient();
  const [{ data, error }, { data: notes, error: notesError }, { data: categories }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase
      .from("notes")
      .select("*")
      .not("lead_id", "is", null)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("name").order("sort_order", { ascending: true }),
  ]);

  // Tolerates the `notes.lead_id` migration not having been run yet —
  // comments just won't show until it is, instead of breaking the page.
  if (notesError) {
    console.warn("Failed to load lead notes:", notesError.message);
  }

  const notesByLead = new Map<string, Note[]>();
  for (const note of (notes as Note[] | null) ?? []) {
    if (!note.lead_id) continue;
    const list = notesByLead.get(note.lead_id) ?? [];
    list.push(note);
    notesByLead.set(note.lead_id, list);
  }

  return (
    <LeadsView
      leads={(data as Lead[]) ?? []}
      notesByLead={Object.fromEntries(notesByLead)}
      categories={(categories ?? []).map((c) => c.name as string)}
      loadError={error?.message}
    />
  );
}
