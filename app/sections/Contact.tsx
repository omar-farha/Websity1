import { getCategoryNames } from "@/app/lib/categories";
import ContactUs from "./ContactUs";

export default async function Contact() {
  const categories = await getCategoryNames();
  return <ContactUs categories={categories} />;
}
