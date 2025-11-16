import { List, Button, Tag, Badge, Modal } from "antd";
import { EyeOutlined, BellOutlined } from "@ant-design/icons";
import { useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "order" | "payment" | "driver" | "system";
  read: boolean;
};

// Mock data - will be replaced with API calls
const notifications: Notification[] = [
  {
    id: "1",
    title: "طلب جديد",
    message: "تم استلام طلب جديد من العميل أحمد محمد",
    date: "2025-01-15 10:30",
    type: "order",
    read: false,
  },
  {
    id: "2",
    title: "تم الدفع",
    message: "تم استلام دفعة مالية بقيمة 500 ر.س",
    date: "2025-01-14 14:20",
    type: "payment",
    read: false,
  },
  {
    id: "3",
    title: "سائق جديد",
    message: "تم إضافة سائق جديد إلى النظام",
    date: "2025-01-13 09:15",
    type: "driver",
    read: true,
  },
  {
    id: "4",
    title: "تحديث النظام",
    message: "تم تحديث النظام بنجاح",
    date: "2025-01-12 16:45",
    type: "system",
    read: true,
  },
];

const typeColor: Record<Notification["type"], string> = {
  order: "blue",
  payment: "green",
  driver: "purple",
  system: "orange",
};

export default function Notifications() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">الإشعارات</h2>
          {unreadCount > 0 && (
            <Badge count={unreadCount} className="mr-2">
              <BellOutlined className="text-xl" />
            </Badge>
          )}
        </div>
      </div>

      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            className={!item.read ? "bg-blue-50 border-r-4 border-blue-500" : ""}
            actions={[
              <Button
                key="view"
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleView(item)}
                className="rounded-lg"
              >
                عرض التفاصيل
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Tag color={typeColor[item.type]} className="text-lg px-3 py-1">
                  {item.type === "order" && "طلب"}
                  {item.type === "payment" && "دفع"}
                  {item.type === "driver" && "سائق"}
                  {item.type === "system" && "نظام"}
                </Tag>
              }
              title={
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.title}</span>
                  {!item.read && (
                    <Badge dot color="blue" />
                  )}
                </div>
              }
              description={
                <div>
                  <p className="mb-1">{item.message}</p>
                  <span className="text-gray-500 text-sm">{item.date}</span>
                </div>
              }
            />
          </List.Item>
        )}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `إجمالي ${total} إشعار`,
        }}
      />

      {/* Notification Details Modal */}
      <Modal
        title={selectedNotification?.title || "تفاصيل الإشعار"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsModalOpen(false);
            setSelectedNotification(null);
          }}>
            إغلاق
          </Button>,
        ]}
        width={600}
        className="rounded-lg"
      >
        {selectedNotification && (
          <div className="mt-6 space-y-4" dir="rtl">
            <div>
              <Tag color={typeColor[selectedNotification.type]} className="text-lg px-3 py-1 mb-3">
                {selectedNotification.type === "order" && "طلب"}
                {selectedNotification.type === "payment" && "دفع"}
                {selectedNotification.type === "driver" && "سائق"}
                {selectedNotification.type === "system" && "نظام"}
              </Tag>
            </div>
            <div>
              <p className="text-gray-600 mb-1">العنوان</p>
              <p className="font-semibold text-lg">{selectedNotification.title}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">الرسالة</p>
              <p className="text-gray-700">{selectedNotification.message}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">التاريخ والوقت</p>
              <p className="font-semibold">{selectedNotification.date}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">الحالة</p>
              <Tag color={selectedNotification.read ? "green" : "blue"}>
                {selectedNotification.read ? "مقروء" : "غير مقروء"}
              </Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
