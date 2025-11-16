import { Tabs, List, Button, Tag, Modal } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";

type Notification = {
  id: string;
  title: string;
  date: string;
  category: string;
  message?: string;
};

// Mock data - will be replaced with API calls
const allNotifications: Notification[] = [
  {
    id: "1",
    title: "تم تحويل دفعة مالية",
    date: "2025-01-15 10:30",
    category: "payments",
    message: "تم تحويل مبلغ 500 ر.س بنجاح إلى حساب الشركة",
  },
  {
    id: "2",
    title: "لم يتم دفع الفاتورة",
    date: "2025-01-14 14:20",
    category: "payments",
    message: "فاتورة رقم INV-002 لم يتم دفعها بعد",
  },
  {
    id: "3",
    title: "تم إضافة سائق جديد",
    date: "2025-01-13 09:15",
    category: "drivers",
    message: "تم إضافة السائق محمد أحمد إلى النظام",
  },
  {
    id: "4",
    title: "تم إسناد طلب جديد",
    date: "2025-01-12 16:45",
    category: "orders",
    message: "تم إسناد طلب جديد رقم 000001 إلى مزود الخدمة",
  },
];

const getNotificationsByCategory = (category: string) => {
  if (category === "all") return allNotifications;
  return allNotifications.filter((n) => n.category === category);
};

export default function Notifications() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };
  const tabItems = [
    {
      key: "all",
      label: "جميع الإشعارات",
      children: (
        <List
          dataSource={getNotificationsByCategory("all")}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  type="primary"
                  icon={<EyeOutlined />}
                  size="small"
                  className="rounded-lg"
                  onClick={() => handleView(item)}
                >
                  عرض التفاصيل
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={<span className="text-gray-500">{item.date}</span>}
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "orders",
      label: "الطلبات",
      children: (
        <List
          dataSource={getNotificationsByCategory("orders")}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  type="primary"
                  icon={<EyeOutlined />}
                  size="small"
                  className="rounded-lg"
                  onClick={() => handleView(item)}
                >
                  عرض التفاصيل
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={<span className="text-gray-500">{item.date}</span>}
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "drivers",
      label: "السائقين",
      children: (
        <List
          dataSource={getNotificationsByCategory("drivers")}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  type="primary"
                  icon={<EyeOutlined />}
                  size="small"
                  className="rounded-lg"
                  onClick={() => handleView(item)}
                >
                  عرض التفاصيل
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={<span className="text-gray-500">{item.date}</span>}
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "permits",
      label: "التراخيص",
      children: <div className="text-center py-8 text-gray-500">لا توجد إشعارات</div>,
    },
    {
      key: "companies",
      label: "إدارة الشركات",
      children: <div className="text-center py-8 text-gray-500">لا توجد إشعارات</div>,
    },
    {
      key: "payments",
      label: "المدفوعات",
      children: (
        <List
          dataSource={getNotificationsByCategory("payments")}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  type="primary"
                  icon={<EyeOutlined />}
                  size="small"
                  className="rounded-lg"
                  onClick={() => handleView(item)}
                >
                  عرض التفاصيل
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={<span className="text-gray-500">{item.date}</span>}
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "customers",
      label: "العملاء",
      children: <div className="text-center py-8 text-gray-500">لا توجد إشعارات</div>,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">الإشعارات</h2>
      </div>

      <Tabs items={tabItems} className="rounded-lg" />

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
              <p className="text-gray-600 mb-1">العنوان</p>
              <p className="font-semibold text-lg">{selectedNotification.title}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">الرسالة</p>
              <p className="text-gray-700">{selectedNotification.message || "لا توجد تفاصيل إضافية"}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">التاريخ والوقت</p>
              <p className="font-semibold">{selectedNotification.date}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">الفئة</p>
              <Tag color="blue">{selectedNotification.category}</Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
