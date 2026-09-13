export type TransactionType = "income" | "expense";

export const INCOME_CATEGORIES = [
  "Client Payment",
  "Website Project",
  "E-commerce Project",
  "Maintenance",
  "Hosting",
  "Other Services",
  "Other Income",
];

export type ExpenseGroupValue =
  | "marketing"
  | "subscriptions"
  | "purchases"
  | "people"
  | "operations"
  | "infrastructure"
  | "business"
  | "other";

export type ExpenseGroup = {
  value: ExpenseGroupValue;
  label: string;
  subcategories: string[];
};

// The category taxonomy for expenses — a main group (stored in
// transactions.category) plus a specific subcategory (transactions.subcategory).
export const EXPENSE_GROUPS: ExpenseGroup[] = [
  {
    value: "marketing",
    label: "Marketing",
    subcategories: [
      "Facebook Ads",
      "Instagram Ads",
      "Google Ads",
      "TikTok Ads",
      "LinkedIn Ads",
      "Influencer Marketing",
      "Content Creation",
      "Photography / Video",
      "Marketing Campaigns",
      "Other Marketing",
    ],
  },
  {
    value: "subscriptions",
    label: "Subscriptions",
    subcategories: [
      "AI Tools",
      "Design Tools",
      "Development Tools",
      "Hosting",
      "Domains",
      "Email Services",
      "SaaS Tools",
      "Productivity Tools",
      "Communication Tools",
      "Other Subscriptions",
    ],
  },
  {
    value: "purchases",
    label: "Purchases",
    subcategories: [
      "Computer / Laptop",
      "Monitor",
      "Keyboard / Mouse",
      "Phone",
      "Camera",
      "Microphone",
      "Accessories",
      "Office Equipment",
      "Electronics",
      "Other Purchases",
    ],
  },
  {
    value: "people",
    label: "People",
    subcategories: [
      "Salaries",
      "Freelancers",
      "Designers",
      "Developers",
      "Video Editors",
      "Content Creators",
      "Copywriters",
      "Consultants",
      "Other Services",
    ],
  },
  {
    value: "operations",
    label: "Operations",
    subcategories: [
      "Transportation",
      "Meetings",
      "Office Expenses",
      "Printing",
      "Delivery",
      "Internet",
      "Phone",
      "Electricity",
      "Other Operations",
    ],
  },
  {
    value: "infrastructure",
    label: "Infrastructure",
    subcategories: ["Hosting", "Domain", "SSL", "Server", "CDN", "Email Hosting", "Other Infrastructure"],
  },
  {
    value: "business",
    label: "Business",
    subcategories: [
      "Registration",
      "Legal",
      "Accounting",
      "Banking Fees",
      "Payment Processing Fees",
      "Business Services",
      "Other Business Expenses",
    ],
  },
  {
    value: "other",
    label: "Other",
    subcategories: ["Other", "Miscellaneous"],
  },
];

export const EXPENSE_CATEGORY_LABELS = EXPENSE_GROUPS.map((g) => g.label);

export const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Mobile Wallet",
  "Credit Card",
  "PayPal",
  "Other",
];

export type RecurringInterval = "monthly" | "yearly";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  subcategory: string | null;
  description: string | null;
  occurred_on: string;
  client_id: string | null;
  client_project_id: string | null;
  payment_method: string | null;
  vendor: string | null;
  is_recurring: boolean;
  recurring_interval: RecurringInterval | null;
  created_at: string;
};

export type TransactionWithRelations = Transaction & {
  client: { id: string; name: string } | null;
  client_project: { id: string; name: string } | null;
};

export type Period = "today" | "week" | "month" | "last_month" | "year" | "custom";

export const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];
