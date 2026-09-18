"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { nextSortOrder, swapSortOrder } from "../reorder";

export type PortfolioFormState = { error?: string } | undefined;

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

function list(value: FormDataEntryValue | null): string[] {
  const s = str(value);
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function revalidatePublic(slug: string) {
  revalidatePath("/dashboard/content/portfolio");
  revalidatePath("/");
  revalidatePath(`/projects/${slug}`);
}

export async function savePortfolioProject(
  _prevState: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  const title = str(formData.get("title"));
  if (!title) {
    return { error: "Title is required." };
  }

  const id = str(formData.get("id"));
  const supabase = createAdminClient();

  let imageUrl = str(formData.get("existing_image_url"));
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const ext = file.name.split(".").pop() || "png";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(path, file, { contentType: file.type || "image/png" });
    if (uploadError) {
      return { error: `Image upload failed: ${uploadError.message}` };
    }
    const { data: pub } = supabase.storage.from("project-images").getPublicUrl(path);
    imageUrl = pub.publicUrl;
  }
  if (!imageUrl) {
    return { error: "An image is required." };
  }

  const slug = str(formData.get("slug")) || slugify(title);

  const payload = {
    slug,
    title,
    role: str(formData.get("role")) ?? "Design & Development",
    year: num(formData.get("year")) ?? new Date().getFullYear(),
    tagline: str(formData.get("tagline")) ?? "",
    description: str(formData.get("description")) ?? "",
    tags: list(formData.get("tags")),
    stack: list(formData.get("stack")),
    image_url: imageUrl,
    live_url: str(formData.get("live_url")),
    testimonial_name: str(formData.get("testimonial_name")) ?? "Client name",
    testimonial_role: str(formData.get("testimonial_role")) ?? "Role, Company",
    testimonial_rating: num(formData.get("testimonial_rating")) ?? 5,
    testimonial_quote:
      str(formData.get("testimonial_quote")) ?? "Add your client's testimonial here.",
    is_visible: formData.get("is_visible") === "on",
    featured: formData.get("featured") === "on",
  };

  const { error } = id
    ? await supabase.from("projects").update(payload).eq("id", id)
    : await supabase.from("projects").insert({ ...payload, sort_order: await nextSortOrder("projects") });

  if (error) {
    return { error: error.message };
  }

  revalidatePublic(slug);
}

export async function deletePortfolioProject(id: string, slug: string) {
  const supabase = createAdminClient();
  await supabase.from("projects").delete().eq("id", id);
  revalidatePublic(slug);
}

export async function togglePortfolioVisible(id: string, slug: string, visible: boolean) {
  const supabase = createAdminClient();
  await supabase.from("projects").update({ is_visible: visible }).eq("id", id);
  revalidatePublic(slug);
}

export async function reorderPortfolio(
  items: { id: string; sort_order: number }[],
  id: string,
  direction: "up" | "down"
) {
  const changed = await swapSortOrder("projects", items, id, direction);
  if (changed) revalidatePublic("");
}
