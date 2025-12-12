import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Tag, Button, Space, Spin, Empty } from "antd";
import { ArrowLeftOutlined, DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import { getOrderById } from "@/services/orders";
import type { Order } from "@/modules/core/types/order";
import dayjs from "dayjs";

function translateShipType(shipType: string): string {
  const translations: Record<string, string> = {
    document: "مستندات",
    package: "طرد",
    fragile: "قابل للكسر",
    heavy: "ثقيل",
  };
  return translations[shipType] || shipType;
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    new: "جديد",
    in_progress: "قيد التنفيذ",
    delivered: "تم التسليم",
    canceled: "ملغي",
  };
  return translations[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "blue",
    in_progress: "orange",
    delivered: "green",
    canceled: "red",
  };
  return colors[status] || "default";
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const orderData = await getOrderById(id);
      setOrder(orderData);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!order) return;
    // Generate bill of lading HTML
    const billHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>بوليصة الشحن - ${order.tracking_no}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6E69D1; padding-bottom: 20px; }
          .details { margin: 20px 0; }
          .tracking { font-size: 24px; font-weight: bold; color: #6E69D1; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>بوليصة الشحن</h1>
          <p>منصة وزن للخدمات اللوجستية</p>
        </div>
        <div class="details">
          <p class="tracking">رقم التتبع: ${order.tracking_no}</p>
          <p><strong>التاريخ:</strong> ${order.created_at ? dayjs(order.created_at).format("DD-MM-YYYY") : "-"}</p>
          <p><strong>الحالة:</strong> ${translateStatus(order.status)}</p>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([billHTML], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bill-of-lading-${order.tracking_no}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card className="rounded-xl">
        <Empty description="الطلب غير موجود" />
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/employer/orders")}
          className="mb-4"
        >
          العودة إلى الطلبات
        </Button>
        <h2 className="text-2xl font-semibold">تفاصيل الطلب</h2>
      </div>

      <Card className="rounded-xl mb-4">
        <Descriptions title="معلومات الطلب" bordered column={2}>
          <Descriptions.Item label="رقم التتبع">
            <span className="font-bold text-[#6E69D1]">{order.tracking_no}</span>
          </Descriptions.Item>
          <Descriptions.Item label="الحالة">
            <Tag color={getStatusColor(order.status)}>{translateStatus(order.status)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="نوع الشحنة">
            {translateShipType(order.ship_type || "")}
          </Descriptions.Item>
          <Descriptions.Item label="تاريخ الإنشاء">
            {order.created_at ? dayjs(order.created_at).format("DD-MM-YYYY") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="تاريخ التوصيل المتوقع">
            {order.delivery_at ? dayjs(order.delivery_at).format("DD-MM-YYYY") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="الوزن">
            {order.weight ? `${order.weight} كجم` : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="السعر">
            {order.price ? `${order.price} ريال` : "-"}
          </Descriptions.Item>
          {order.aramex_tracking_number && (
            <Descriptions.Item label="رقم تتبع Aramex">
              {order.aramex_tracking_number}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card title="بيانات المرسل" className="rounded-xl">
          <Descriptions column={1}>
            <Descriptions.Item label="الاسم">{order.sender_name || "-"}</Descriptions.Item>
            <Descriptions.Item label="رقم الهاتف">{order.sender_phone || "-"}</Descriptions.Item>
            <Descriptions.Item label="العنوان">{order.sender_address || "-"}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="بيانات المستلم" className="rounded-xl">
          <Descriptions column={1}>
            <Descriptions.Item label="الاسم">{order.receiver_name || "-"}</Descriptions.Item>
            <Descriptions.Item label="رقم الهاتف">{order.receiver_phone || "-"}</Descriptions.Item>
            <Descriptions.Item label="العنوان">{order.receiver_address || "-"}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      <Card className="rounded-xl">
        <div className="text-center mb-4">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
            <p className="text-gray-400">صورة بوليصة الشحن</p>
          </div>
          <Space size="large">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              onClick={handleDownload}
              className="rounded-lg"
              style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
            >
              تحميل
            </Button>
            <Button
              icon={<PrinterOutlined />}
              size="large"
              onClick={() => window.print()}
              className="rounded-lg"
            >
              طباعة
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}

