import { createClient } from "@/app/lib/supabase/server";
import ApproachView, { type ExperienceType } from "./ApproachView";

export default async function Approach() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("approach_steps")
    .select("title, company_name, icon, icon_bg, date_label, points")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("Failed to load approach steps:", error.message);
  }

  const experiences: ExperienceType[] = (data ?? []).map((row) => ({
    title: row.title,
    company_name: row.company_name,
    icon: row.icon,
    iconBg: row.icon_bg,
    date: row.date_label,
    points: row.points ?? [],
  }));

  return <ApproachView experiences={experiences} />;
}
