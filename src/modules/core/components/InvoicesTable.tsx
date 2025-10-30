import { Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Invoice, PaymentStatus } from "@/modules/core/types/wallet";

const colorMap: Record<PaymentStatus, string> = {
  paid: "success",
  processing: "processing",
  pending: "warning",
  failed: "error",
};

export default function InvoicesTable({ data, role: _role }: { data: Invoice[]; role: string }) {
  const cols: ColumnsType<Invoice> = [
    { title: "رقم الفاتورة", dataIndex: "id", key: "id" },
    { title: "التاريخ", dataIndex: "date", key: "date" },
    { title: "المبلغ", dataIndex: "amount", key: "amount", render: (v: number) => `${v} ر.س` },
    {
      title: "حالة الدفع",
      dataIndex: "status",
      key: "status",
      render: (s: PaymentStatus) => (
        <Tag color={colorMap[s]}>
          {s === "paid"
            ? "تم الدفع"
            : s === "processing"
              ? "قيد المعالجة"
              : s === "pending"
                ? "معلّق"
                : "فشل"}
        </Tag>
      ),
    },
    { title: "تحميل الفاتورة", key: "fileUrl", render: () => <Button type="link">عرض</Button> },
  ];
  return <Table rowKey="id" dataSource={data} columns={cols} pagination={false} />;
}
