export type LinkCategory =
  | "figma"
  | "github"
  | "drive"
  | "contracts"
  | "documents"
  | "brand"
  | "images"
  | "other";

export const LINK_CATEGORIES: { value: LinkCategory; label: string }[] = [
  { value: "figma", label: "Figma" },
  { value: "github", label: "GitHub" },
  { value: "drive", label: "Google Drive" },
  { value: "contracts", label: "Contracts" },
  { value: "documents", label: "Documents" },
  { value: "brand", label: "Brand Assets" },
  { value: "images", label: "Images" },
  { value: "other", label: "Other" },
];

export type LinkItem = {
  id: string;
  client_id: string | null;
  client_project_id: string | null;
  category: LinkCategory;
  label: string;
  url: string;
  created_at: string;
};
