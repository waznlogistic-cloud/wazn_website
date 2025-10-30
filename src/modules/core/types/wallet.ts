export type PaymentStatus = "paid" | "processing" | "pending" | "failed";

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  fileUrl?: string;
  companyName?: string;
  userName?: string;
}

export interface WalletSummary {
  totalIn: number;
  totalOut: number;
  balance: number;
  pending: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: "in" | "out";
  method?: string;
  note?: string;
}

export interface PayoutRequest {
  id: string;
  amount: number;
  method: string;
  iban?: string;
  createdAt: string;
  status: PaymentStatus;
}
