import { Form, Input, DatePicker, Select, Button, Card, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { createOrder } from "@/services/orders";
import { useAuth } from "@/contexts/authContext";
import { useState } from "react";

const { Option } = Select;

export default function CreateOrder() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      message.error("يجب تسجيل الدخول أولاً");
      return;
    }
    try {
      const values = await form.validateFields();
      setLoading(true);
      await createOrder({
        employer_id: user.id,
        ship_type: values.shipmentType || values.shipType,
        sender_name: values.senderName,
        sender_phone: values.senderPhone,
        sender_address: values.senderAddress,
        receiver_name: values.receiverName,
        receiver_phone: values.receiverPhone,
        receiver_address: values.receiverAddress,
        weight: values.weight,
        delivery_method: values.deliveryMethod,
        delivery_at: values.deliveryDate?.toISOString() || values.shipmentDate?.toISOString(),
      });
      message.success("تم إنشاء الطلب بنجاح!");
      navigate("/employer/orders");
    } catch (error: any) {
      message.error(error?.message || "فشل إنشاء الطلب");
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">إنشاء طلب جديد</h2>
      </div>

      <Card className="rounded-xl">
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="shipmentDate"
              label="تاريخ الشحن"
              rules={[{ required: true, message: "يرجى اختيار تاريخ الشحن" }]}
            >
              <DatePicker
                size="large"
                className="w-full rounded-lg"
                format="DD-MM-YYYY"
                placeholder="تاريخ الشحن"
              />
            </Form.Item>

            <Form.Item
              name="shipmentType"
              label="نوع الشحنة"
              rules={[{ required: true, message: "يرجى اختيار نوع الشحنة" }]}
            >
              <Select size="large" className="rounded-lg" placeholder="نوع الشحنة">
                <Option value="document">مستندات</Option>
                <Option value="package">طرد</Option>
                <Option value="fragile">قابل للكسر</Option>
                <Option value="heavy">ثقيل</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="weight"
              label="وزن الشحنة"
              rules={[{ required: true, message: "يرجى إدخال وزن الشحنة" }]}
            >
              <Input
                size="large"
                className="rounded-lg"
                placeholder="وزن الشحنة (كجم)"
                type="number"
              />
            </Form.Item>

            <Form.Item
              name="deliveryMethod"
              label="طريقة التوصيل"
              rules={[{ required: true, message: "يرجى اختيار طريقة التوصيل" }]}
            >
              <Select size="large" className="rounded-lg" placeholder="طريقة التوصيل">
                <Option value="standard">عادي</Option>
                <Option value="express">سريع</Option>
                <Option value="same-day">نفس اليوم</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-4">بيانات المرسل</h3>
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
                label="رقم الهاتف"
                rules={[{ required: true, message: "يرجى إدخال رقم الهاتف" }]}
              >
                <Input size="large" className="rounded-lg" placeholder="رقم الهاتف" />
              </Form.Item>

              <Form.Item
                name="senderAddress"
                label="عنوان الإرسال"
                rules={[{ required: true, message: "يرجى إدخال عنوان الإرسال" }]}
                className="md:col-span-2"
              >
                <Input size="large" className="rounded-lg" placeholder="عنوان الإرسال" />
              </Form.Item>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-4">بيانات المستلم</h3>
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
                label="رقم الهاتف"
                rules={[{ required: true, message: "يرجى إدخال رقم الهاتف" }]}
              >
                <Input size="large" className="rounded-lg" placeholder="رقم الهاتف" />
              </Form.Item>

              <Form.Item
                name="receiverAddress"
                label="عنوان الاستلام"
                rules={[{ required: true, message: "يرجى إدخال عنوان الاستلام" }]}
                className="md:col-span-2"
              >
                <Input size="large" className="rounded-lg" placeholder="عنوان الاستلام" />
              </Form.Item>
            </div>
          </div>

          <Form.Item className="mt-6">
            <Space>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="rounded-lg"
                style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
              >
                إنشاء الطلب
              </Button>
              <Button
                size="large"
                onClick={() => navigate("/employer/orders")}
                className="rounded-lg"
              >
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
