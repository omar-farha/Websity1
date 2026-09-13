import { createClient } from "@/app/lib/supabase/server";
import FaqsView from "./FaqsView";

export default async function Faqs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("Failed to load FAQs:", error.message);
  }

  return <FaqsView faqs={data ?? []} />;
}
