"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { logActivity } from "@/app/lib/activityLog";
import type { Lead, LeadStatus } from "./types";

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

export type ConvertLeadState = { error?: string } | undefined;

export async function convertLeadToClient(lead: Lead): Promise<ConvertLeadState> {
  const supabase = createAdminClient();

  const notes = [
    `Converted from a website lead — category: ${lead.category}.`,
    `Expected budget: ${lead.budget}`,
    `Clients handled per month: ${lead.monthly_clients}`,
    `Expected timeline: ${lead.timeline}`,
  ].join("\n");

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      name: lead.name,
      phone: lead.phone,
      notes,
      status: "lead",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase.from("leads").update({ status: "won" }).eq("id", lead.id);
  await logActivity("client", client.id, lead.name, "Converted from a lead");

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/clients");
}
