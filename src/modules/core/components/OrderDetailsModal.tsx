import { Modal, Row, Col, Typography, Tag, Space, Divider } from "antd";
import type { Order } from "@/modules/core/types/order";

const { Title, Text } = Typography;

export type OrderDetailsModalProps = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
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

export default function OrderDetailsModal({ open, order, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable
      centered
      width={720}
      title={
        <div className="flex items-center justify-center">
          <Tag style={{ fontSize: 14, paddingInline: 16 }}>شحنة رقم: {order.id}</Tag>
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
              {order.shipperName ?? "-"}
            </div>
            <div>
              <Text type="secondary">رقم الهاتف: </Text>
              {order.shipperPhone ?? "-"}
            </div>
            <div>
              <Text type="secondary">عنوان الإرسال: </Text>
              {order.senderAddress ?? "-"}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Title level={5} className="!mb-1">
              بيانات الاستلام:
            </Title>
            <div>
              <Text type="secondary">عنوان الاستلام: </Text>
              {order.receiverAddress ?? "-"}
            </div>
          </Col>
        </Row>

        <Divider className="!my-2" />

        <Row gutter={[16, 16]} justify="center">
          <Col>
            <Tag bordered={false}>نوع الشحن: {order.shipType}</Tag>
          </Col>
          <Col>
            <Tag bordered={false}>وزن الشحنة: {"-"}</Tag>
          </Col>
          <Col>
            <Tag bordered={false}>تاريخ الشحن: {order.createdAt}</Tag>
          </Col>
          <Col>
            <Tag bordered={false}>تاريخ التوصيل: {order.deliveryAt}</Tag>
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
