import { Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import type { Order } from "@/modules/core/types/order";
import OrderDetailsModal from "@/modules/core/components/OrderDetailsModal";
import { useState } from "react";

// Mock data - will be replaced with API calls
const orders: Order[] = [
  {
    id: "1",
    trackingNo: "000000",
    shipType: "شحن سريع",
    createdAt: "2025-01-15",
    deliveryAt: "2025-01-20",
    company: "Aramex",
    price: 65,
    shipperName: "أحمد محمد",
    shipperPhone: "0501234567",
    senderAddress: "الرياض، حي النرجس",
    receiverAddress: "جدة، حي الزهراء",
    status: "delivered",
  },
  {
    id: "2",
    trackingNo: "000001",
    shipType: "شحن عادي",
    createdAt: "2025-01-16",
    deliveryAt: "2025-01-22",
    company: "Redbox",
    price: 45,
    shipperName: "محمد أحمد",
    shipperPhone: "0507654321",
    senderAddress: "الدمام، حي الفيصلية",
    receiverAddress: "الرياض، حي العليا",
    status: "delivered",
  },
];

const statusColor: Record<Order["status"], string> = {
  new: "blue",
  in_progress: "gold",
  delivered: "green",
  canceled: "red",
};

const statusText: Record<Order["status"], string> = {
  new: "جديد",
  in_progress: "قيد التنفيذ",
  delivered: "تم التوصيل",
  canceled: "ملغى",
};

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const columns: ColumnsType<Order> = [
    {
      title: "رقم الطلب",
      dataIndex: "trackingNo",
      key: "trackingNo",
      width: 120,
    },
    {
      title: "نوع الشحن",
      dataIndex: "shipType",
      key: "shipType",
      width: 120,
    },
    {
      title: "تاريخ الشحن",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
    },
    {
      title: "تاريخ التوصيل",
      dataIndex: "deliveryAt",
      key: "deliveryAt",
      width: 120,
    },
    {
      title: "المسافة",
      key: "distance",
      width: 100,
      render: () => "-", // TODO: Add distance calculation
    },
    {
      title: "الشركة",
      dataIndex: "company",
      key: "company",
      width: 120,
    },
    {
      title: "حالة الشحن",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: Order["status"]) => (
        <Tag color={statusColor[status]}>{statusText[status]}</Tag>
      ),
    },
    {
      title: "عرض التفاصيل",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleView(record)}
          className="rounded-lg"
        >
          عرض التفاصيل
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">إدارة الطلبات</h2>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `إجمالي ${total} طلب`,
        }}
        className="rounded-lg"
      />

      <OrderDetailsModal
        open={isModalOpen}
        order={selectedOrder}
        onClose={() => setIsModalOpen(false)}
        role="admin"
      />
    </div>
  );
}
