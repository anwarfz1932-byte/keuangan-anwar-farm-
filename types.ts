
export interface Transaction {
  id: string;
  date: string;
  description: string;
  income: number;
  outcome: number;
}

export type TransactionFormData = Omit<Transaction, 'id'>;
