import { createAdminClient } from "@/app/lib/supabase/admin";
import FaqsAdminView from "./FaqsAdminView";
import type { Faq } from "./types";

export default async function FaqsAdminPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  return <FaqsAdminView faqs={(data as Faq[]) ?? []} loadError={error?.message} />;
}
