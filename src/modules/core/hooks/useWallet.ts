import { useQuery } from "@tanstack/react-query";
import { getWalletSummary, getInvoices, getTransactions } from "@/modules/core/services/walletMock";

export function useWalletSummary(role: string) {
  return useQuery({ queryKey: ["wallet-summary", role], queryFn: () => getWalletSummary(role) });
}
export function useInvoices(role: string) {
  return useQuery({ queryKey: ["wallet-invoices", role], queryFn: () => getInvoices(role) });
}
export function useTransactions(role: string) {
  return useQuery({
    queryKey: ["wallet-transactions", role],
    queryFn: () => getTransactions(role),
  });
}
