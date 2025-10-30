import { useState } from "react";
import { Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Order } from "@/modules/core/types/order";
import OrderDetailsModal from "./OrderDetailsModal";

type Role = "admin" | "employer" | "provider" | "driver" | "client" | "global";

type Props = {
  role: Role;
  data: Order[];
  loading?: boolean;
  onView?: (order: Order) => void;
  className?: string;
};

const statusColor: Record<Order["status"], string> = {
  new: "blue",
  in_progress: "gold",
  delivered: "green",
  canceled: "red",
};

export default function OrdersTable({ role, data, loading, onView, className }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const showDetails = (record: Order) => {
    setSelected(record);
    setOpen(true);
    onView?.(record);
  };

  const closeDetails = () => {
    setOpen(false);
    setSelected(null);
  };

  const baseCols: ColumnsType<Order> = [
    { title: "رقم الشحنة", dataIndex: "trackingNo", key: "trackingNo" },
    { title: "نوع الشحن", dataIndex: "shipType", key: "shipType" },
    { title: "تاريخ الشحن", dataIndex: "createdAt", key: "createdAt" },
    { title: "تاريخ التوصيل", dataIndex: "deliveryAt", key: "deliveryAt" },
    { title: "الشركة", dataIndex: "company", key: "company" },
    { title: "السعر", dataIndex: "price", key: "price", render: (v: number) => `${v} ر.س` },
    {
      title: "حالة الطلب",
      dataIndex: "status",
      key: "status",
      render: (s: Order["status"]) => <Tag color={statusColor[s]}>{arabicStatus(s)}</Tag>,
    },
  ];

  const extraForClientOrAdmin: ColumnsType<Order> = [
    { title: "اسم المرسل", dataIndex: "shipperName", key: "shipperName" },
    { title: "رقم المرسل", dataIndex: "shipperPhone", key: "shipperPhone" },
    { title: "عنوان الإرسال", dataIndex: "senderAddress", key: "senderAddress" },
    { title: "عنوان الاستلام", dataIndex: "receiverAddress", key: "receiverAddress" },
  ];

  const actionCol: ColumnsType<Order>[number] = {
    title: "عرض التفاصيل",
    key: "action",
    render: (_, record) => (
      <Button type="primary" size="small" onClick={() => showDetails(record)}>
        المزيد
      </Button>
    ),
  };

  let columns: ColumnsType<Order> = baseCols;
  if (role === "client" || role === "admin") {
    columns = [...extraForClientOrAdmin, ...baseCols, actionCol];
  } else {
    columns = [...baseCols, actionCol];
  }

  return (
    <>
      <Table
        className={className}
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <OrderDetailsModal open={open} order={selected} onClose={closeDetails} />
    </>
  );
}

function arabicStatus(s: Order["status"]) {
  switch (s) {
    case "new":
      return "جديد";
    case "in_progress":
      return "قيد التوصيل";
    case "delivered":
      return "تم التوصيل";
    case "canceled":
      return "ملغى";
    default:
      return s;
  }
}
