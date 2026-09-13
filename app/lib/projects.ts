import { createClient } from "@/app/lib/supabase/server";

export type Testimonial = {
  name: string;
  role: string;
  rating: number;
  quote: string;
};

export type Project = {
  slug: string;
  title: string;
  role: string;
  year: number;
  tagline: string;
  description: string;
  tags: string[];
  stack: string[];
  image_url: string;
  live_url: string | null;
  testimonial: Testimonial;
};

type ProjectRow = {
  slug: string;
  title: string;
  role: string;
  year: number;
  tagline: string;
  description: string;
  tags: string[] | null;
  stack: string[] | null;
  image_url: string;
  live_url: string | null;
  testimonial_name: string;
  testimonial_role: string;
  testimonial_rating: number;
  testimonial_quote: string;
};

function mapRow(row: ProjectRow): Project {
  return {
    slug: row.slug,
    title: row.title,
    role: row.role,
    year: row.year,
    tagline: row.tagline,
    description: row.description,
    tags: row.tags ?? [],
    stack: row.stack ?? [],
    image_url: row.image_url,
    live_url: row.live_url,
    testimonial: {
      name: row.testimonial_name,
      role: row.testimonial_role,
      rating: row.testimonial_rating,
      quote: row.testimonial_quote,
    },
  };
}

export async function getVisibleProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    if (error) console.warn("Failed to load projects:", error.message);
    return [];
  }

  return (data as ProjectRow[]).map(mapRow);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_visible", true)
    .single();

  if (error || !data) return null;
  return mapRow(data as ProjectRow);
}

export async function getAllVisibleSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("slug").eq("is_visible", true);

  if (error || !data) {
    if (error) console.warn("Failed to load project slugs:", error.message);
    return [];
  }

  return data.map((row) => row.slug);
}
