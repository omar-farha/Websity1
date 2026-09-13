"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import type { LeadStatus } from "./types";

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const supabase = createAdminClient();
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/dashboard/leads");
}

export async function deleteLead(id: string) {
  const supabase = createAdminClient();
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/dashboard/leads");
}
