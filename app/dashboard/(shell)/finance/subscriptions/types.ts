export type SubscriptionInterval = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "cancelled";

export type Subscription = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  vendor: string | null;
  cost: number;
  interval: SubscriptionInterval;
  payment_method: string | null;
  start_date: string;
  next_payment_date: string;
  status: SubscriptionStatus;
  notes: string | null;
  client_id: string | null;
  client_project_id: string | null;
  created_at: string;
};

export type SubscriptionWithRelations = Subscription & {
  client: { id: string; name: string } | null;
  client_project: { id: string; name: string } | null;
};

// Monthly-equivalent cost, for comparing/summing monthly and yearly plans together.
export function monthlyEquivalent(sub: Pick<Subscription, "cost" | "interval">): number {
  return sub.interval === "yearly" ? sub.cost / 12 : sub.cost;
}
