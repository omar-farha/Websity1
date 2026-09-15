"use server";

import { createClient } from "@/app/lib/supabase/server";

export type LeadFormState = { error?: string; success?: boolean };

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitLead(
  _prevState: LeadFormState | undefined,
  formData: FormData
): Promise<LeadFormState> {
  const name = str(formData.get("name"));
  const phone = str(formData.get("phone"));
  const category = str(formData.get("category"));
  const budget = str(formData.get("budget"));
  const monthlyClients = str(formData.get("monthly_clients"));
  const timeline = str(formData.get("timeline"));

  if (!name || !phone || !budget || !monthlyClients || !timeline) {
    return { error: "Please fill in every field." };
  }

  const supabase = await createClient();

  const { data: validCategory } = await supabase
    .from("categories")
    .select("name")
    .eq("name", category)
    .maybeSingle();
  if (!validCategory) {
    return { error: "Please choose a valid category." };
  }

  const { error } = await supabase.from("leads").insert({
    name,
    phone,
    category,
    budget,
    monthly_clients: monthlyClients,
    timeline,
  });

  if (error) {
    console.error("Failed to submit lead:", error.message);
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true };
}
