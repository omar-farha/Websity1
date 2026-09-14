"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { logActivity } from "@/app/lib/activityLog";
import { PROJECT_CATEGORIES } from "@/app/lib/constants";
import type { WebsiteType } from "../clients/types";
import type { LeadStatus } from "./types";

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function num(value: FormDataEntryValue | null): number | null {
  const s = str(value);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

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

export type LeadFormState = { error?: string } | undefined;

// Lets the admin log a lead manually (e.g. one that came in over the phone
// or WhatsApp instead of through the site's contact form).
export async function createLead(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const name = str(formData.get("name"));
  const phone = str(formData.get("phone"));
  const category = str(formData.get("category"));
  const budget = str(formData.get("budget"));
  const monthlyClients = str(formData.get("monthly_clients"));
  const timeline = str(formData.get("timeline"));

  if (!name) return { error: "Name is required." };
  if (!phone) return { error: "Phone is required." };
  if (!category || !(PROJECT_CATEGORIES as readonly string[]).includes(category)) {
    return { error: "Choose a valid category." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("leads").insert({
    name,
    phone,
    category,
    budget: budget ?? "Not set",
    monthly_clients: monthlyClients ?? "Not set",
    timeline: timeline ?? "Not set",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/leads");
}

export type ConvertLeadState = { error?: string } | undefined;

// Converts a lead into a real client — optionally kicking off their first
// project in the same step, so the admin doesn't have to re-type the
// client's name to then go create a project for them separately.
export async function convertLeadToClient(
  _prevState: ConvertLeadState,
  formData: FormData
): Promise<ConvertLeadState> {
  const leadId = str(formData.get("lead_id"));
  const name = str(formData.get("name"));
  const phone = str(formData.get("phone"));

  if (!leadId) return { error: "Missing lead." };
  if (!name) return { error: "Name is required." };

  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("category, budget, monthly_clients, timeline")
    .eq("id", leadId)
    .single();

  const notes = lead
    ? [
        `Converted from a website lead — category: ${lead.category}.`,
        `Expected budget: ${lead.budget}`,
        `Clients handled per month: ${lead.monthly_clients}`,
        `Expected timeline: ${lead.timeline}`,
      ].join("\n")
    : "Converted from a website lead.";

  const { data: client, error } = await supabase
    .from("clients")
    .insert({ name, phone, notes, status: "lead" })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await logActivity("client", client.id, name, "Converted from a lead");

  const projectName = str(formData.get("project_name"));
  if (projectName) {
    const { data: project, error: projectError } = await supabase
      .from("client_projects")
      .insert({
        name: projectName,
        client_id: client.id,
        website_type: str(formData.get("website_type")) as WebsiteType | null,
        status: "planning",
        cost: num(formData.get("cost")),
        due_date: str(formData.get("due_date")),
      })
      .select("id")
      .single();

    if (projectError) {
      return { error: `Client created, but the project failed: ${projectError.message}` };
    }

    await logActivity("client_project", project.id, projectName, "Project created");
    revalidatePath("/dashboard/projects");
  }

  await supabase.from("leads").update({ status: "won" }).eq("id", leadId);

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/finance");
}
