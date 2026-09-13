// The fixed set of client categories Websity works with. Shared by the
// public projects filter, the contact/lead form, and the admin leads list —
// keep these three in sync with the `leads.category` check constraint in
// supabase/migrations/013_leads.sql.
export const PROJECT_CATEGORIES = [
  "Brands",
  "Celebrities",
  "Initiatives",
  "Gym & Sportswear",
  "Systems",
  "Clinics",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
