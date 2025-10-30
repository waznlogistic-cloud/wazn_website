import { Card, Space, Button } from "antd";
import { useWalletSummary, useInvoices } from "@/modules/core/hooks/useWallet";
import WalletSummaryCards from "@/modules/core/components/WalletSummaryCards";
import InvoicesTable from "@/modules/core/components/InvoicesTable";
import PayoutRequestModal from "@/modules/core/components/PayoutRequestModal";
import { useState } from "react";

export default function GlobalBilling() {
  const { data: summary } = useWalletSummary("global");
  const { data: invoices } = useInvoices("global");
  const [open, setOpen] = useState(false);
  return (
    <Space direction="vertical" className="w-full">
      <WalletSummaryCards summary={summary} />
      <Card
        title="تفاصيل المدفوعات"
        extra={<Button onClick={() => setOpen(true)}>سحب الرصيد</Button>}
      >
        <InvoicesTable data={invoices ?? []} role="global" />
      </Card>
      <PayoutRequestModal open={open} onClose={() => setOpen(false)} />
    </Space>
  );
}
