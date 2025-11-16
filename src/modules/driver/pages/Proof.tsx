import { useState, useEffect } from "react";
import { Table, Tag, Button, Space, Upload, Modal, Input, DatePicker, message, Form } from "antd";
import type { ColumnsType, UploadFile } from "antd/es/table";
import { PaperClipOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/authContext";
import { createProofOfDelivery, getDriverProofs } from "@/services/proof";
import { getOrders } from "@/services/orders";

type ProofRecord = {
  id: string;
  shipmentNumber: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryCode: string;
  deliveryStatus: "delivered" | "not_delivered";
  attachment?: string;
};

// Mock data - will be replaced with API calls
const proofRecords: ProofRecord[] = [
  {
    id: "1",
    shipmentNumber: "0000000",
    recipientName: "أحمد محمد",
    recipientPhone: "0545555555",
    deliveryAddress: "26.52830699",
    deliveryCode: "0000000",
    deliveryStatus: "delivered",
  },
  {
    id: "2",
    shipmentNumber: "0000001",
    recipientName: "خالد علي",
    recipientPhone: "0545555556",
    deliveryAddress: "26.52830700",
    deliveryCode: "",
    deliveryStatus: "not_delivered",
  },
];

export default function Proof() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [records, setRecords] = useState<ProofRecord[]>([]);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const orders = await getOrders("driver", user.id);
      // Convert orders to proof records format
      const proofRecords: ProofRecord[] = orders
        .filter((o) => o.status === "in_progress" || o.status === "delivered")
        .map((order) => ({
          id: order.id,
          shipmentNumber: order.tracking_no || "",
          recipientName: order.receiver_name || "",
          recipientPhone: order.receiver_phone || "",
          deliveryAddress: order.receiver_address || "",
          deliveryCode: "",
          deliveryStatus: order.status === "delivered" ? ("delivered" as const) : ("not_delivered" as const),
        }));
      setRecords(proofRecords);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProofDelivery = (record: ProofRecord) => {
    setSelectedOrder({ id: record.id, tracking_no: record.shipmentNumber });
    form.resetFields();
    setIsProofModalOpen(true);
  };

  const handleUpload = (file: RcFile) => {
    const isImage = file.type?.startsWith("image/");
    if (!isImage) {
      message.error("يمكنك رفع الصور فقط!");
      return false;
    }
    return false; // Prevent auto upload
  };

  const handleSubmitProof = async () => {
    if (!selectedOrder || !user) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await createProofOfDelivery({
        order_id: selectedOrder.id,
        driver_id: user.id,
        receiver_name: values.receiverName,
        receiver_id_number: values.receiverIdNumber,
        delivery_code: values.deliveryCode,
        delivery_date: values.deliveryDate?.format("YYYY-MM-DD"),
        // TODO: Upload file to storage and get URL
        proof_image_url: fileList[0] ? "placeholder_url" : undefined,
      });
      
      // Update order status to delivered
      const { updateOrderStatus } = await import("@/services/orders");
      await updateOrderStatus(selectedOrder.id, "delivered");
      
      message.success("تم رفع إثبات التسليم بنجاح");
      setIsProofModalOpen(false);
      setFileList([]);
      setSelectedOrder(null);
      form.resetFields();
      loadOrders();
    } catch (error: any) {
      message.error(error?.message || "فشل رفع إثبات التسليم");
      console.error("Error submitting proof:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ProofRecord> = [
    {
      title: "رقم الشحنة",
      dataIndex: "shipmentNumber",
      key: "shipmentNumber",
      width: 120,
    },
    {
      title: "اسم المستلم",
      dataIndex: "recipientName",
      key: "recipientName",
      width: 150,
    },
    {
      title: "رقم المستلم",
      dataIndex: "recipientPhone",
      key: "recipientPhone",
      width: 120,
    },
    {
      title: "عنوان التسليم",
      dataIndex: "deliveryAddress",
      key: "deliveryAddress",
      width: 150,
    },
    {
      title: "رمز التسليم",
      dataIndex: "deliveryCode",
      key: "deliveryCode",
      width: 120,
      render: (code: string) => code || "-",
    },
    {
      title: "حالة التسليم",
      dataIndex: "deliveryStatus",
      key: "deliveryStatus",
      width: 120,
      render: (status: ProofRecord["deliveryStatus"]) => (
        <Tag
          color={status === "delivered" ? "green" : "red"}
          icon={status === "delivered" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {status === "delivered" ? "تم التسليم" : "لم يتم التسليم"}
        </Tag>
      ),
    },
    {
      title: "",
      key: "attachment",
      width: 80,
      render: (_, record) =>
        record.attachment ? (
          <PaperClipOutlined className="text-lg text-gray-400" />
        ) : null,
    },
    {
      title: "الإجراءات",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleProofDelivery(record)}
          className="rounded-lg"
          style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
        >
          إثبات التسليم
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">إثبات التسليم</h2>
        <p className="text-gray-600">محمد حسن</p>
      </div>

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `إجمالي ${total} سجل`,
        }}
        className="rounded-lg"
        loading={loading}
      />

      {/* Proof of Delivery Modal */}
      <Modal
        title={`شحنة رقم ${selectedOrder?.tracking_no || ""}`}
        open={isProofModalOpen}
        onOk={handleSubmitProof}
        confirmLoading={loading}
        onCancel={() => {
          setIsProofModalOpen(false);
          setFileList([]);
          setSelectedOrder(null);
        }}
        okText="إثبات التسليم"
        cancelText="إلغاء"
        okButtonProps={{
          style: { backgroundColor: "#6E69D1", borderColor: "#6E69D1" },
        }}
        width={600}
        className="rounded-lg"
      >
        {selectedOrder && (
          <Form form={form} layout="vertical" className="mt-6">
            <Form.Item
              name="receiverName"
              label="اسم المستلم"
              rules={[{ required: true, message: "يرجى إدخال اسم المستلم" }]}
            >
              <Input size="large" className="rounded-lg" placeholder="اسم المستلم" />
            </Form.Item>

            <Form.Item
              name="receiverIdNumber"
              label="رقم هوية المستلم"
              rules={[{ required: true, message: "يرجى إدخال رقم الهوية" }]}
            >
              <Input size="large" className="rounded-lg" placeholder="رقم الهوية" />
            </Form.Item>

            <Form.Item
              name="deliveryCode"
              label="رمز التسليم"
              rules={[{ required: true, message: "يرجى إدخال رمز التسليم" }]}
            >
              <Input size="large" className="rounded-lg" placeholder="رمز التسليم" />
            </Form.Item>

            <Form.Item
              name="deliveryDate"
              label="تاريخ التسليم"
              rules={[{ required: true, message: "يرجى اختيار تاريخ التسليم" }]}
            >
              <DatePicker
                size="large"
                className="w-full rounded-lg"
                format="YYYY-MM-DD"
                placeholder="اختر تاريخ التسليم"
              />
            </Form.Item>

            <Form.Item label="رفع إثبات التسليم">
              <Upload
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={handleUpload}
                accept="image/*"
                maxCount={1}
                listType="picture-card"
              >
                {fileList.length < 1 && (
                  <div>
                    <PaperClipOutlined className="text-2xl" />
                    <div className="mt-2">رفع صورة</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
