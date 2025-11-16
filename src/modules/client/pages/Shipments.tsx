import { useState } from "react";
import { Modal, Form, Input, DatePicker, Select, Checkbox, Button, Card, Rate, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import aramexLogo from "@/assets/aramex.svg";
import redboxLogo from "@/assets/redbox.svg";

const { Option } = Select;

type ServiceProvider = {
  id: string;
  name: string;
  logo: string;
  rating: number;
  price: number;
};

const serviceProviders: ServiceProvider[] = [
  { id: "aramex", name: "Aramex", logo: aramexLogo, rating: 5, price: 15 },
  { id: "redbox", name: "Redbox", logo: redboxLogo, rating: 5, price: 20 },
];

export default function Shipments() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [form] = Form.useForm();

  const handleCreateShipment = () => {
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Store shipment data temporarily (will be used when provider is selected)
      sessionStorage.setItem("pendingShipment", JSON.stringify(values));
      setIsModalOpen(false);
      setShowServiceSelection(true);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSelectService = (providerId: string) => {
    // Store selected provider
    sessionStorage.setItem("selectedProvider", providerId);
    // Navigate to wallet/payment page
    navigate("/client/wallet");
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          {showServiceSelection ? "شحناتي المجدولة حالياً" : "شحناتي"}
        </h2>
        {!showServiceSelection && (
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateShipment}
            className="rounded-lg"
            style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
          >
            إنشاء شحنة جديدة
          </Button>
        )}
      </div>

      {showServiceSelection ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceProviders.map((provider) => (
            <Card
              key={provider.id}
              className="rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSelectService(provider.id)}
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="h-16 w-auto mb-4"
                />
                <Rate disabled defaultValue={provider.rating} className="mb-2" />
                <p className="text-lg font-semibold text-[#6E69D1]">
                  قيمة الشحن {provider.price} ريال
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>لا توجد شحنات حالياً</p>
        </div>
      )}

      {/* Create Shipment Modal */}
      <Modal
        title="إنشاء شحنة جديدة"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="العمل على أفضل سعر"
        cancelText="إلغاء"
        okButtonProps={{
          style: { backgroundColor: "#6E69D1", borderColor: "#6E69D1" },
        }}
        width={700}
        className="rounded-lg"
      >
        <Form form={form} layout="vertical" className="mt-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-3">بيانات المرسل</h4>
            <div className="grid grid-cols-1 gap-3">
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
              <Form.Item
                name="senderAddress"
                label="عنوان المرسل"
                rules={[{ required: true, message: "يرجى إدخال العنوان" }]}
              >
                <Input size="large" className="rounded-lg" placeholder="عنوان المرسل" />
              </Form.Item>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-3">بيانات المستلم</h4>
            <div className="grid grid-cols-1 gap-3">
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
              <Form.Item
                name="receiverAddress"
                label="عنوان المستلم"
                rules={[{ required: true, message: "يرجى إدخال العنوان" }]}
              >
                <Input size="large" className="rounded-lg" placeholder="عنوان المستلم" />
              </Form.Item>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-3">تفاصيل الشحنة</h4>
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
              rules={[{ required: true, message: "يرجى اختيار وزن الشحنة" }]}
            >
              <Select size="large" className="rounded-lg" placeholder="وزن الشحنة">
                <Option value="light">خفيف (أقل من 1 كجم)</Option>
                <Option value="medium">متوسط (1-5 كجم)</Option>
                <Option value="heavy">ثقيل (5-10 كجم)</Option>
                <Option value="very-heavy">ثقيل جداً (أكثر من 10 كجم)</Option>
              </Select>
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

          <Form.Item
            name="terms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject("يجب الموافقة على الشروط والأحكام"),
              },
            ]}
          >
            <Checkbox>أوافق على الشروط والأحكام</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
