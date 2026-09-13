export type CommunicationType =
  | "whatsapp"
  | "email"
  | "call"
  | "meeting"
  | "instagram"
  | "other";

export const COMMUNICATION_TYPES: { value: CommunicationType; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "call", label: "Phone Call" },
  { value: "meeting", label: "Meeting" },
  { value: "instagram", label: "Instagram" },
  { value: "other", label: "Other" },
];

export type Communication = {
  id: string;
  client_id: string;
  type: CommunicationType;
  notes: string | null;
  contacted_at: string;
  next_follow_up_date: string | null;
  created_at: string;
};

export type CommunicationWithClient = Communication & {
  client: { id: string; name: string } | null;
};
