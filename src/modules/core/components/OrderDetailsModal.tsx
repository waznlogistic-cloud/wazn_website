import { Modal, Row, Col, Typography, Tag, Space, Divider, Button } from "antd";
import type { Order } from "@/modules/core/types/order";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export type OrderDetailsModalProps = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  role?: "driver" | "provider" | "client" | "admin" | "employer";
  onProofDelivery?: () => void;
};

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

function getShipTypeText(shipType?: string) {
  const types: Record<string, string> = {
    document: "مستندات",
    package: "طرد",
    fragile: "قابل للكسر",
    heavy: "ثقيل",
  };
  return types[shipType || ""] || shipType || "-";
}

export default function OrderDetailsModal({
  open,
  order,
  onClose,
  role,
  onProofDelivery,
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        role === "driver" && onProofDelivery ? (
          <Button
            type="primary"
            size="large"
            onClick={onProofDelivery}
            className="rounded-lg"
            style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
          >
            إثبات التسليم
          </Button>
        ) : null
      }
      closable
      centered
      width={720}
      title={
        <div className="flex items-center justify-center">
          <Tag style={{ fontSize: 14, paddingInline: 16 }}>شحنة رقم: {order.trackingNo || order.id}</Tag>
        </div>
      }
    >
      <Space direction="vertical" size={20} className="w-full">
        <Row gutter={[24, 12]}>
          <Col xs={24} md={12}>
            <Title level={5} className="!mb-1">
              بيانات الإرسال:
            </Title>
            <div>
              <Text type="secondary">اسم المرسل: </Text>
              <Text strong>{order.sender_name || order.senderName || order.shipperName || "-"}</Text>
            </div>
            <div>
              <Text type="secondary">رقم الهاتف: </Text>
              <Text strong>{order.sender_phone || order.senderPhone || order.shipperPhone || "-"}</Text>
            </div>
            <div>
              <Text type="secondary">عنوان الإرسال: </Text>
              <Text strong>{order.sender_address || order.senderAddress || "-"}</Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Title level={5} className="!mb-1">
              بيانات الاستلام:
            </Title>
            <div>
              <Text type="secondary">اسم المستلم: </Text>
              <Text strong>{order.receiver_name || order.receiverName || "-"}</Text>
            </div>
            <div>
              <Text type="secondary">رقم الهاتف: </Text>
              <Text strong>{order.receiver_phone || order.receiverPhone || "-"}</Text>
            </div>
            <div>
              <Text type="secondary">عنوان الاستلام: </Text>
              <Text strong>{order.receiver_address || order.receiverAddress || "-"}</Text>
            </div>
          </Col>
        </Row>

        <Divider className="!my-2" />

        <Row gutter={[16, 16]} justify="center">
          <Col>
            <Tag bordered={false}>نوع الشحن: {getShipTypeText(order.ship_type || order.shipType)}</Tag>
          </Col>
          <Col>
            <Tag bordered={false}>
              وزن الشحنة: {order.weight ? `${order.weight} كجم` : "-"}
            </Tag>
          </Col>
          <Col>
            <Tag bordered={false}>
              تاريخ الشحن: {order.created_at || order.createdAt 
                ? dayjs(order.created_at || order.createdAt).format("DD-MM-YYYY")
                : "-"}
            </Tag>
          </Col>
          <Col>
            <Tag bordered={false}>
              تاريخ التوصيل: {order.delivery_at || order.deliveryAt
                ? dayjs(order.delivery_at || order.deliveryAt).format("DD-MM-YYYY")
                : "-"}
            </Tag>
          </Col>
          <Col>
            <Tag color="blue" bordered={false}>
              حالة الشحن: {arabicStatus(order.status)}
            </Tag>
          </Col>
        </Row>
      </Space>
    </Modal>
  );
}
