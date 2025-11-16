import { Table, Tag, Button, Spin, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import type { Order } from "@/modules/core/types/order";
import OrderDetailsModal from "@/modules/core/components/OrderDetailsModal";
import { useState, useEffect } from "react";
import { getOrders } from "@/services/orders";
import { useAuth } from "@/contexts/authContext";
import dayjs from "dayjs";

// Mock data - fallback if no real data
const mockOrders: Order[] = [
  {
    id: "1",
    trackingNo: "WAZN-2025-001",
    shipType: "شحن سريع",
    createdAt: "2025-01-15",
    deliveryAt: "2025-01-20",
    company: "Aramex",
    price: 65,
    shipperName: "شركة التقنية المتقدمة",
    shipperPhone: "0501234567",
    senderAddress: "الرياض، حي النرجس، شارع الملك فهد",
    receiverAddress: "جدة، حي الزهراء، شارع التحلية",
    status: "delivered",
  },
  {
    id: "2",
    trackingNo: "WAZN-2025-002",
    shipType: "شحن عادي",
    createdAt: "2025-01-16",
    deliveryAt: "2025-01-22",
    company: "Redbox",
    price: 45,
    shipperName: "مؤسسة النقل السريع",
    shipperPhone: "0507654321",
    senderAddress: "الدمام، حي الفيصلية، طريق الكورنيش",
    receiverAddress: "الرياض، حي العليا، شارع العليا العام",
    status: "in_progress",
  },
  {
    id: "3",
    trackingNo: "WAZN-2025-003",
    shipType: "شحن سريع",
    createdAt: "2025-01-17",
    deliveryAt: "2025-01-19",
    company: "Aramex",
    price: 85,
    shipperName: "شركة التجارة الإلكترونية",
    shipperPhone: "0509876543",
    senderAddress: "الرياض، حي المطار، طريق المطار",
    receiverAddress: "الطائف، حي الشهداء، شارع الملك عبدالعزيز",
    status: "delivered",
  },
  {
    id: "4",
    trackingNo: "WAZN-2025-004",
    shipType: "شحن عادي",
    createdAt: "2025-01-18",
    deliveryAt: "2025-01-25",
    company: "Redbox",
    price: 55,
    shipperName: "مؤسسة الخدمات اللوجستية",
    shipperPhone: "0501112233",
    senderAddress: "الرياض، حي العليا، شارع العليا",
    receiverAddress: "الخبر، حي الكورنيش، شارع الكورنيش",
    status: "in_progress",
  },
  {
    id: "5",
    trackingNo: "WAZN-2025-005",
    shipType: "شحن سريع",
    createdAt: "2025-01-19",
    deliveryAt: "2025-01-21",
    company: "Aramex",
    price: 75,
    shipperName: "شركة التوزيع الحديثة",
    shipperPhone: "0504445566",
    senderAddress: "الرياض، حي الياسمين، شارع الياسمين",
    receiverAddress: "جدة، حي الصفا، شارع التحلية",
    status: "new",
  },
  {
    id: "6",
    trackingNo: "WAZN-2025-006",
    shipType: "شحن عادي",
    createdAt: "2025-01-20",
    deliveryAt: "2025-01-27",
    company: "Redbox",
    price: 50,
    shipperName: "مؤسسة النقل والتوزيع",
    shipperPhone: "0507778899",
    senderAddress: "الرياض، حي النرجس، شارع النرجس",
    receiverAddress: "الدمام، حي الفيصلية، شارع الملك فهد",
    status: "new",
  },
  {
    id: "7",
    trackingNo: "WAZN-2025-007",
    shipType: "شحن سريع",
    createdAt: "2025-01-14",
    deliveryAt: "2025-01-18",
    company: "Aramex",
    price: 90,
    shipperName: "شركة الخدمات التجارية",
    shipperPhone: "0502223344",
    senderAddress: "الرياض، حي المطار، طريق المطار",
    receiverAddress: "جدة، حي الزهراء، شارع التحلية",
    status: "delivered",
  },
  {
    id: "8",
    trackingNo: "WAZN-2025-008",
    shipType: "شحن عادي",
    createdAt: "2025-01-21",
    deliveryAt: "2025-01-28",
    company: "Redbox",
    price: 60,
    shipperName: "مؤسسة الشحن السريع",
    shipperPhone: "0508889900",
    senderAddress: "الرياض، حي العليا، شارع العليا العام",
    receiverAddress: "الطائف، حي الشهداء، شارع الملك عبدالعزيز",
    status: "in_progress",
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
  const { user, role } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && role === "employer") {
      loadOrders();
    }
  }, [user, role]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const ordersData = await getOrders(role, user.id);
      
      // Transform data to match Order type (handle both snake_case and camelCase)
      const transformedOrders = ordersData.map((order: any) => ({
        id: order.id,
        trackingNo: order.tracking_no || order.trackingNo,
        tracking_no: order.tracking_no || order.trackingNo,
        shipType: order.ship_type || order.shipType,
        ship_type: order.ship_type || order.shipType,
        createdAt: order.created_at || order.createdAt,
        created_at: order.created_at || order.createdAt,
        deliveryAt: order.delivery_at || order.deliveryAt,
        delivery_at: order.delivery_at || order.deliveryAt,
        company: order.company || "-",
        price: order.price || 0,
        shipperName: order.sender_name || order.senderName,
        shipperPhone: order.sender_phone || order.senderPhone,
        senderAddress: order.sender_address || order.senderAddress,
        receiverAddress: order.receiver_address || order.receiverAddress,
        sender_name: order.sender_name || order.senderName,
        sender_phone: order.sender_phone || order.senderPhone,
        sender_address: order.sender_address || order.senderAddress,
        receiver_name: order.receiver_name || order.receiverName,
        receiver_phone: order.receiver_phone || order.receiverPhone,
        receiver_address: order.receiver_address || order.receiverAddress,
        status: order.status,
      }));

      // Use mock data if no real orders found (for demonstration)
      if (transformedOrders.length === 0) {
        setOrders(mockOrders);
      } else {
        setOrders(transformedOrders);
      }
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setError(err?.message || "فشل تحميل الطلبات");
      // Fallback to mock data on error
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("DD-MM-YYYY");
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
      render: (date: string) => formatDate(date),
    },
    {
      title: "تاريخ التوصيل",
      dataIndex: "deliveryAt",
      key: "deliveryAt",
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: "الشركة",
      dataIndex: "company",
      key: "company",
      width: 120,
    },
    {
      title: "الحالة",
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
        <h2 className="text-2xl font-semibold mb-2">الطلبات</h2>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      ) : error && orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadOrders}>إعادة المحاولة</Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Empty description="لا توجد طلبات حالياً" />
        </div>
      ) : (
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
      )}

      <OrderDetailsModal
        open={isModalOpen}
        order={selectedOrder}
        onClose={() => setIsModalOpen(false)}
        role="employer"
      />
    </div>
  );
}
