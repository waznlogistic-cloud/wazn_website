import { useState, useEffect } from "react";
import { Card, Descriptions, Steps, Button, Space, Tag, Input, message, Spin } from "antd";
import {
  CheckCircleOutlined,
  CarOutlined,
  EnvironmentOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { getOrderByTrackingNo } from "@/services/orders";
import type { Order } from "@/modules/core/types/order";
import dayjs from "dayjs";

const { Step } = Steps;

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const trackingNoFromUrl = searchParams.get("tracking");
  
  const [trackingNumber, setTrackingNumber] = useState(trackingNoFromUrl || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingNoFromUrl) {
      handleSearch(trackingNoFromUrl);
    }
  }, [trackingNoFromUrl]);

  const handleSearch = async (trackingNo?: string) => {
    const searchTrackingNo = trackingNo || trackingNumber.trim();
    
    if (!searchTrackingNo) {
      message.warning("يرجى إدخال رقم التتبع");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const orderData = await getOrderByTrackingNo(searchTrackingNo);
      
      if (!orderData) {
        setError("لم يتم العثور على الطلب");
        setOrder(null);
        message.error("لم يتم العثور على طلب بهذا الرقم");
        return;
      }

      setOrder(orderData);
      message.success("تم العثور على الطلب بنجاح");
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء البحث");
      setOrder(null);
      message.error("حدث خطأ أثناء البحث عن الطلب");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return "blue";
      case "in_progress":
        return "orange";
      case "delivered":
        return "green";
      case "canceled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return "جديد";
      case "in_progress":
        return "قيد التنفيذ";
      case "delivered":
        return "تم التوصيل";
      case "canceled":
        return "ملغى";
      default:
        return status;
    }
  };

  const getCurrentStep = () => {
    if (!order) return 0;
    if (order.status === "delivered") return 2;
    if (order.status === "in_progress") return 1;
    return 0;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">تتبع الشحنة</h2>
      </div>

      {/* Tracking Number Search */}
      <Card className="rounded-xl">
        <div className="flex gap-4">
          <Input
            size="large"
            placeholder="أدخل رقم التتبع"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onPressEnter={() => handleSearch()}
            className="flex-1"
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={() => handleSearch()}
            loading={loading}
            className="rounded-lg"
            style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
          >
            بحث
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="rounded-xl">
          <div className="text-center py-8">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">جاري البحث عن الطلب...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="rounded-xl">
          <div className="text-center py-8">
            <p className="text-red-600 text-lg">{error}</p>
            <p className="text-gray-600 mt-2">يرجى التحقق من رقم التتبع والمحاولة مرة أخرى</p>
          </div>
        </Card>
      )}

      {/* Order Information */}
      {order && !loading && (
        <>
          <Card className="rounded-xl">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="رقم الطلب">{order.tracking_no || order.trackingNo}</Descriptions.Item>
              <Descriptions.Item label="تاريخ الطلب">{formatDate(order.created_at || order.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="حالة الطلب">
                <Tag color={getStatusColor(order.status)} className="text-base px-3 py-1">
                  {getStatusText(order.status)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Sender and Receiver Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="بيانات المرسل" className="rounded-xl">
              <Descriptions column={1}>
                <Descriptions.Item label="اسم المرسل">{order.sender_name || order.senderName || "-"}</Descriptions.Item>
                <Descriptions.Item label="رقم الجوال">{order.sender_phone || order.senderPhone || "-"}</Descriptions.Item>
                <Descriptions.Item label="العنوان">{order.sender_address || order.senderAddress || "-"}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="بيانات المستلم" className="rounded-xl">
              <Descriptions column={1}>
                <Descriptions.Item label="اسم المستلم">{order.receiver_name || order.receiverName || "-"}</Descriptions.Item>
                <Descriptions.Item label="رقم الجوال">{order.receiver_phone || order.receiverPhone || "-"}</Descriptions.Item>
                <Descriptions.Item label="العنوان">{order.receiver_address || order.receiverAddress || "-"}</Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Delivery Progress */}
          <Card className="rounded-xl">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">تتبع الشحنة</h3>
            </div>
            <Steps
              current={getCurrentStep()}
              direction="horizontal"
              className="mb-6"
              items={[
                {
                  title: "الشحنة من المرسل",
                  icon: <EnvironmentOutlined />,
                  status: getCurrentStep() >= 0 ? "finish" : "wait",
                },
                {
                  title: "في الطريق",
                  icon: <CarOutlined />,
                  status: getCurrentStep() >= 1 ? "finish" : "wait",
                },
                {
                  title: "تم التوصيل",
                  icon: <CheckCircleOutlined />,
                  status: getCurrentStep() >= 2 ? "finish" : "wait",
                },
              ]}
            />
            {order.status === "delivered" && (order.delivered_at || order.deliveredAt) && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 font-semibold">
                  تم استلام الشحنة بنجاح
                </p>
                <p className="text-gray-600 mt-2">تاريخ التوصيل: {formatDate(order.delivered_at || order.deliveredAt)}</p>
              </div>
            )}
          </Card>

      {/* Map Placeholder */}
      <Card className="rounded-xl">
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">خريطة التتبع</p>
          {/* TODO: Integrate with map service (Google Maps, Mapbox, etc.) */}
        </div>
      </Card>

          {/* Bill of Lading (if delivered) */}
          {order.status === "delivered" && (
            <Card className="rounded-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">صورة بوليصة الشحن</h3>
                <p className="text-gray-600 mb-4">رقم تتبع الشحنة: {order.tracking_no || order.trackingNo}</p>
              </div>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
                <p className="text-gray-400">صورة بوليصة الشحن</p>
                {/* TODO: Display actual bill of lading image from storage */}
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  size="large"
                  className="rounded-lg"
                  style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
                  onClick={() => {
                    const billHTML = `
                      <!DOCTYPE html>
                      <html dir="rtl" lang="ar">
                      <head>
                        <meta charset="UTF-8">
                        <title>بوليصة الشحن - ${order.trackingNo}</title>
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
                          <p class="tracking">رقم التتبع: ${order.tracking_no || order.trackingNo}</p>
                          <p><strong>التاريخ:</strong> ${formatDate(order.created_at || order.createdAt)}</p>
                          <p><strong>الحالة:</strong> تم التوصيل</p>
                          <p><strong>المرسل:</strong> ${order.sender_name || order.senderName || "-"}</p>
                          <p><strong>المستلم:</strong> ${order.receiver_name || order.receiverName || "-"}</p>
                        </div>
                      </body>
                      </html>
                    `;
                    const blob = new Blob([billHTML], { type: "text/html;charset=utf-8;" });
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", `bill-of-lading-${order.tracking_no || order.trackingNo}.html`);
                    link.style.visibility = "hidden";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  تنزيل
                </Button>
                <Button
                  icon={<ShareAltOutlined />}
                  size="large"
                  className="rounded-lg"
                  onClick={() => {
                    const trackingNo = order.tracking_no || order.trackingNo;
                    const shareText = `رقم تتبع الشحنة: ${trackingNo}\n${window.location.origin}/client/tracking?tracking=${trackingNo}`;
                    if (navigator.share) {
                      navigator.share({
                        title: "بوليصة الشحن",
                        text: shareText,
                        url: `${window.location.origin}/client/tracking?tracking=${trackingNo}`,
                      }).catch(() => {
                        navigator.clipboard.writeText(shareText);
                        message.success("تم نسخ رابط التتبع إلى الحافظة");
                      });
                    } else {
                      navigator.clipboard.writeText(shareText);
                      message.success("تم نسخ رابط التتبع إلى الحافظة");
                    }
                  }}
                >
                  مشاركة
                </Button>
              </Space>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
