import { useState } from "react";
import { Table, Tag, Button, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Order } from "@/modules/core/types/order";
import OrderDetailsModal from "@/modules/core/components/OrderDetailsModal";

// Mock data - will be replaced with API calls
const newOrders: Order[] = [
  {
    id: "1",
    trackingNo: "000000",
    shipType: "طرد",
    createdAt: "2025-01-15",
    deliveryAt: "2025-01-20",
    company: "Aramex",
    price: 65,
    shipperName: "محمد حسن",
    shipperPhone: "054552604",
    senderAddress: "26.52830690",
    receiverAddress: "26.52830699",
    status: "new",
  },
  {
    id: "2",
    trackingNo: "000001",
    shipType: "مستندات",
    createdAt: "2025-01-16",
    deliveryAt: "2025-01-21",
    company: "Redbox",
    price: 45,
    shipperName: "أحمد علي",
    shipperPhone: "054552605",
    senderAddress: "26.52830691",
    receiverAddress: "26.52830700",
    status: "new",
  },
];

const inProgressOrders: Order[] = [
  {
    id: "3",
    trackingNo: "000002",
    shipType: "طرد",
    createdAt: "2025-01-14",
    deliveryAt: "2025-01-19",
    company: "Aramex",
    price: 80,
    shipperName: "خالد سعيد",
    shipperPhone: "054552606",
    senderAddress: "26.52830692",
    receiverAddress: "26.52830701",
    status: "in_progress",
  },
];

const completedOrders: Order[] = [
  {
    id: "4",
    trackingNo: "000003",
    shipType: "مستندات",
    createdAt: "2025-01-10",
    deliveryAt: "2025-01-15",
    company: "Redbox",
    price: 50,
    shipperName: "فاطمة أحمد",
    shipperPhone: "054552607",
    senderAddress: "26.52830693",
    receiverAddress: "26.52830702",
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
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("new");

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleProofDelivery = () => {
    setIsModalOpen(false);
    navigate("/driver/proof");
  };

  const columns: ColumnsType<Order> = [
    {
      title: "رقم الطلب",
      dataIndex: "trackingNo",
      key: "trackingNo",
      width: 120,
    },
    {
      title: "اسم المرسل",
      dataIndex: "shipperName",
      key: "shipperName",
      width: 150,
    },
    {
      title: "اسم المستلم",
      dataIndex: "shipperName", // Using shipperName as placeholder - should be receiverName in real data
      key: "receiverName",
      width: 150,
    },
    {
      title: "تاريخ الطلب",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
    },
    {
      title: "حالة الطلب",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: Order["status"]) => (
        <Tag color={statusColor[status]}>{statusText[status]}</Tag>
      ),
    },
    {
      title: "الإجراءات",
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

  const getDataSource = () => {
    switch (activeTab) {
      case "new":
        return newOrders;
      case "in_progress":
        return inProgressOrders;
      case "completed":
        return completedOrders;
      default:
        return [];
    }
  };

  const tabItems = [
    {
      key: "new",
      label: "الطلبات الجديدة",
    },
    {
      key: "in_progress",
      label: "الطلبات قيد التوصيل",
    },
    {
      key: "completed",
      label: "الطلبات المكتملة",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">الطلبات</h2>
        <p className="text-gray-600">محمد حسن</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="mb-4"
      />

      <Table
        columns={columns}
        dataSource={getDataSource()}
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
        role="driver"
        onProofDelivery={handleProofDelivery}
      />
    </div>
  );
}
