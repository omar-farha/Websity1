export type Budget = {
  id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
};

export type BudgetRow = {
  category: string;
  monthlyLimit: number | null;
  spent: number;
};
