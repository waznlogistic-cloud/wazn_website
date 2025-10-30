import type { Invoice, WalletSummary, Transaction } from "@/modules/core/types/wallet";

export const getWalletSummary = (role: string): WalletSummary => ({
  totalIn: 15000,
  totalOut: role === "employer" ? 10000 : 5000,
  balance: 2000,
  pending: 11000,
});

export const getInvoices = (_role: string): Invoice[] => {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `1010${i}`,
    date: "2-10-2024",
    amount: 800,
    status: i % 2 === 0 ? "paid" : "processing",
    companyName: "Redbox",
    userName: "محمد حسين",
    fileUrl: "#",
  }));
};

export const getTransactions = (_role: string): Transaction[] => {
  return Array.from({ length: 4 }).map((_, i) => ({
    id: `T${i}`,
    date: "5-10-2024",
    amount: 500,
    type: i % 2 === 0 ? "in" : "out",
    method: "Bank Transfer",
    note: "Mock transaction",
  }));
};
