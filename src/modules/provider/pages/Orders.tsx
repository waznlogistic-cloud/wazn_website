import { useState, useEffect } from "react";
import { Tabs, Table, Tag, Button, Space, message, Modal, Form, Input, Select, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import type { Order } from "@/modules/core/types/order";
import OrderDetailsModal from "@/modules/core/components/OrderDetailsModal";
import { useAuth } from "@/contexts/authContext";
import { getOrders, getOrdersByStatus, updateOrderStatus } from "@/services/orders";
import dayjs from "dayjs";

type TabKey = "new" | "current";

const statusColor: Record<Order["status"], string> = {
  new: "blue",
  in_progress: "gold",
  delivered: "green",
  canceled: "red",
};

const statusText: Record<Order["status"], string> = {
  new: "جديد",
  in_progress: "قيد التنفيذ",
  delivered: "مكتمل",
  canceled: "ملغى",
};

const { Option } = Select;

export default function Orders() {
  const { user, role } = useAuth();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<TabKey>("new");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newOrders, setNewOrders] = useState<(Order & { receiverName?: string; receiverPhone?: string })[]>([]);
  const [currentOrders, setCurrentOrders] = useState<(Order & { receiverName?: string; receiverPhone?: string })[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, activeTab]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const newOrdersData = await getOrdersByStatus(role || "provider", user.id, "new");
      const currentOrdersData = await getOrdersByStatus(role || "provider", user.id, "in_progress");
      
      // Convert to Order format
      const convertOrder = (o: any): Order & { receiverName?: string; receiverPhone?: string } => ({
        id: o.id,
        trackingNo: o.tracking_no || "",
        shipType: o.ship_type || "",
        createdAt: o.created_at || "",
        deliveryAt: o.delivery_at || "",
        company: "",
        price: o.price || 0,
        shipperName: o.sender_name || "",
        shipperPhone: o.sender_phone || "",
        senderAddress: o.sender_address || "",
        receiverAddress: o.receiver_address || "",
        receiverName: o.receiver_name || "",
        receiverPhone: o.receiver_phone || "",
        status: o.status || "new",
      });
      
      let newOrdersList = newOrdersData.map(convertOrder);
      let currentOrdersList = currentOrdersData.map(convertOrder);
      
      // Add mock data if no orders exist (for demo purposes)
      if (newOrdersList.length === 0) {
        newOrdersList = [
          {
            id: "mock-1",
            trackingNo: "WAZN-2025-101",
            shipType: "شحن سريع",
            createdAt: "2025-01-20",
            deliveryAt: "2025-01-22",
            company: "Aramex",
            price: 75,
            shipperName: "شركة التقنية المتقدمة",
            shipperPhone: "0501234567",
            senderAddress: "الرياض، حي النرجس، شارع الملك فهد",
            receiverName: "أحمد محمد",
            receiverPhone: "0501111111",
            receiverAddress: "جدة، حي الزهراء، شارع التحلية",
            status: "new",
          },
          {
            id: "mock-2",
            trackingNo: "WAZN-2025-102",
            shipType: "شحن عادي",
            createdAt: "2025-01-21",
            deliveryAt: "2025-01-25",
            company: "Redbox",
            price: 55,
            shipperName: "مؤسسة النقل السريع",
            shipperPhone: "0507654321",
            senderAddress: "الدمام، حي الفيصلية، طريق الكورنيش",
            receiverName: "محمد أحمد",
            receiverPhone: "0502222222",
            receiverAddress: "الرياض، حي العليا، شارع العليا العام",
            status: "new",
          },
          {
            id: "mock-3",
            trackingNo: "WAZN-2025-103",
            shipType: "شحن سريع",
            createdAt: "2025-01-22",
            deliveryAt: "2025-01-24",
            company: "Aramex",
            price: 85,
            shipperName: "شركة التجارة الإلكترونية",
            shipperPhone: "0509876543",
            senderAddress: "الرياض، حي المطار، طريق المطار",
            receiverName: "خالد علي",
            receiverPhone: "0503333333",
            receiverAddress: "الطائف، حي الشهداء، شارع الملك عبدالعزيز",
            status: "new",
          },
        ];
      }
      
      if (currentOrdersList.length === 0) {
        currentOrdersList = [
          {
            id: "mock-4",
            trackingNo: "WAZN-2025-104",
            shipType: "شحن عادي",
            createdAt: "2025-01-18",
            deliveryAt: "2025-01-25",
            company: "Redbox",
            price: 60,
            shipperName: "مؤسسة الخدمات اللوجستية",
            shipperPhone: "0501112233",
            senderAddress: "الرياض، حي العليا، شارع العليا",
            receiverName: "سعد حسن",
            receiverPhone: "0504444444",
            receiverAddress: "الخبر، حي الكورنيش، شارع الكورنيش",
            status: "in_progress",
          },
          {
            id: "mock-5",
            trackingNo: "WAZN-2025-105",
            shipType: "شحن سريع",
            createdAt: "2025-01-19",
            deliveryAt: "2025-01-21",
            company: "Aramex",
            price: 70,
            shipperName: "شركة التوزيع الحديثة",
            shipperPhone: "0504445566",
            senderAddress: "الرياض، حي الياسمين، شارع الياسمين",
            receiverName: "فهد محمد",
            receiverPhone: "0505555555",
            receiverAddress: "جدة، حي الصفا، شارع التحلية",
            status: "in_progress",
          },
        ];
      }
      
      setNewOrders(newOrdersList);
      setCurrentOrders(currentOrdersList);
    } catch (error) {
      console.error("Error loading orders:", error);
      message.error("فشل تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    // Get full order data from the list to access receiver info
    const fullOrder = [...newOrders, ...currentOrders].find((o) => o.id === order.id);
    form.setFieldsValue({
      shipType: order.shipType,
      senderName: order.shipperName || "",
      senderPhone: order.shipperPhone || "",
      senderAddress: order.senderAddress || "",
      receiverName: (fullOrder as any)?.receiverName || "",
      receiverPhone: (fullOrder as any)?.receiverPhone || "",
      receiverAddress: order.receiverAddress || "",
      price: order.price,
      deliveryAt: order.deliveryAt ? dayjs(order.deliveryAt) : undefined,
      status: order.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingOrder) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Update order status if changed
      if (values.status !== editingOrder.status) {
        await updateOrderStatus(editingOrder.id, values.status);
      }
      
      // Update local state
      const updateOrderInList = (orders: (Order & { receiverName?: string; receiverPhone?: string })[]) =>
        orders.map((o) =>
          o.id === editingOrder.id
            ? {
                ...o,
                shipType: values.shipType,
                shipperName: values.senderName,
                shipperPhone: values.senderPhone,
                senderAddress: values.senderAddress,
                receiverName: values.receiverName,
                receiverPhone: values.receiverPhone,
                receiverAddress: values.receiverAddress,
                price: values.price,
                deliveryAt: values.deliveryAt?.format("YYYY-MM-DD") || o.deliveryAt,
                status: values.status,
              }
            : o
        );
      
      setNewOrders(updateOrderInList(newOrders));
      setCurrentOrders(updateOrderInList(currentOrders));
      
      message.success("تم تحديث الطلب بنجاح!");
      setIsEditModalOpen(false);
      setEditingOrder(null);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || "فشل تحديث الطلب");
      console.error("Error updating order:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: "رقم الطلب",
      dataIndex: "trackingNo",
      key: "trackingNo",
      width: 150,
    },
    {
      title: "اسم العميل",
      dataIndex: "shipperName",
      key: "shipperName",
      width: 150,
    },
    {
      title: "تاريخ الطلب",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
    },
    {
      title: "طريقة التوصيل",
      dataIndex: "shipType",
      key: "shipType",
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
      title: "السعر",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: number) => `${price} ر.س`,
    },
    {
      title: "الإجراءات",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
            className="rounded-lg"
          >
            عرض
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            className="rounded-lg"
          >
            تعديل
          </Button>
        </Space>
      ),
    },
  ];

  const getOrdersForTab = (tab: TabKey): Order[] => {
    return tab === "new" ? newOrders : currentOrders;
  };

  const tabItems = [
    {
      key: "new",
      label: "الطلبات الجديدة",
      children: (
        <Table
          columns={columns}
          dataSource={getOrdersForTab("new")}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `إجمالي ${total} طلب`,
          }}
          className="rounded-lg"
          loading={loading}
        />
      ),
    },
    {
      key: "current",
      label: "الطلبات الحالية",
      children: (
        <Table
          columns={columns}
          dataSource={getOrdersForTab("current")}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `إجمالي ${total} طلب`,
          }}
          className="rounded-lg"
          loading={loading}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">إدارة مزود الخدمة</h2>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
        items={tabItems}
        className="rounded-lg"
      />

      <OrderDetailsModal
        open={isModalOpen}
        order={selectedOrder}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Edit Order Modal */}
      <Modal
        title="تعديل الطلب"
        open={isEditModalOpen}
        onOk={handleEditSave}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingOrder(null);
          form.resetFields();
        }}
        okText="حفظ"
        cancelText="إلغاء"
        okButtonProps={{
          style: { backgroundColor: "#6E69D1", borderColor: "#6E69D1" },
          loading: loading,
        }}
        width={700}
        className="rounded-lg"
      >
        {editingOrder && (
          <Form form={form} layout="vertical" className="mt-6" dir="rtl">
            <div className="mb-4">
              <p className="text-gray-600 mb-1">رقم الطلب</p>
              <p className="font-semibold">{editingOrder.trackingNo}</p>
            </div>

            <Form.Item
              name="shipType"
              label="نوع الشحن"
              rules={[{ required: true, message: "يرجى اختيار نوع الشحن" }]}
            >
              <Select size="large" className="rounded-lg">
                <Option value="شحن سريع">شحن سريع</Option>
                <Option value="شحن عادي">شحن عادي</Option>
                <Option value="مستندات">مستندات</Option>
                <Option value="طرد">طرد</Option>
              </Select>
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="senderName"
                label="اسم المرسل"
                rules={[{ required: true, message: "يرجى إدخال اسم المرسل" }]}
              >
                <Input size="large" className="rounded-lg" placeholder="اسم المرسل" />
              </Form.Item>

              <Form.Item
                name="senderPhone"
                label="رقم هاتف المرسل"
                rules={[{ required: true, message: "يرجى إدخال رقم الهاتف" }]}
              >
                <Input size="large" className="rounded-lg" placeholder="رقم الهاتف" />
              </Form.Item>
            </div>

            <Form.Item
              name="senderAddress"
              label="عنوان المرسل"
              rules={[{ required: true, message: "يرجى إدخال عنوان المرسل" }]}
            >
              <Input size="large" className="rounded-lg" placeholder="عنوان المرسل" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="receiverName"
                label="اسم المستلم"
                rules={[{ required: true, message: "يرجى إدخال اسم المستلم" }]}
              >
                <Input size="large" className="rounded-lg" placeholder="اسم المستلم" />
              </Form.Item>

              <Form.Item
                name="receiverPhone"
                label="رقم هاتف المستلم"
                rules={[{ required: true, message: "يرجى إدخال رقم الهاتف" }]}
              >
                <Input size="large" className="rounded-lg" placeholder="رقم الهاتف" />
              </Form.Item>
            </div>

            <Form.Item
              name="receiverAddress"
              label="عنوان المستلم"
              rules={[{ required: true, message: "يرجى إدخال عنوان المستلم" }]}
            >
              <Input size="large" className="rounded-lg" placeholder="عنوان المستلم" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="price"
                label="السعر (ر.س)"
                rules={[{ required: true, message: "يرجى إدخال السعر" }]}
              >
                <Input type="number" size="large" className="rounded-lg" placeholder="السعر" />
              </Form.Item>

              <Form.Item
                name="deliveryAt"
                label="تاريخ التوصيل المتوقع"
              >
                <DatePicker
                  size="large"
                  className="w-full rounded-lg"
                  format="YYYY-MM-DD"
                  placeholder="تاريخ التوصيل"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="status"
              label="حالة الطلب"
              rules={[{ required: true, message: "يرجى اختيار حالة الطلب" }]}
            >
              <Select size="large" className="rounded-lg">
                <Option value="new">جديد</Option>
                <Option value="in_progress">قيد التنفيذ</Option>
                <Option value="delivered">تم التوصيل</Option>
                <Option value="canceled">ملغى</Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
