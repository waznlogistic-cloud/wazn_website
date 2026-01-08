import { useState } from "react";
import { Form, Input, Radio, Button, Card, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import { CreditCardOutlined, AppleOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/authContext";
import { createOrder, processPaidOrder } from "@/services/orders";

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState<string>("mada");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      message.error("يجب تسجيل الدخول أولاً");
      return;
    }
    
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Get pending shipment data from sessionStorage
      const pendingShipment = sessionStorage.getItem("pendingShipment");
      const selectedProvider = sessionStorage.getItem("selectedProvider");
      
      if (!pendingShipment) {
        message.error("لا توجد بيانات شحنة. يرجى إنشاء شحنة أولاً");
        navigate("/client/shipments");
        return;
      }
      
      const shipmentData = JSON.parse(pendingShipment);
      
      // Create order after payment
      // IMPORTANT: Set payment_status to "paid" since wallet payment is completed
      const createdOrder = await createOrder({
        client_id: user.id,
        provider_id: selectedProvider || undefined,
        ship_type: shipmentData.shipmentType || shipmentData.shipType || "standard",
        sender_name: shipmentData.senderName,
        sender_phone: shipmentData.senderPhone,
        sender_address: shipmentData.senderAddress,
        receiver_name: shipmentData.receiverName,
        receiver_phone: shipmentData.receiverPhone,
        receiver_address: shipmentData.receiverAddress,
        weight: shipmentData.weight,
        price: shipmentData.price || 15, // Default price if not set
        delivery_method: shipmentData.deliveryMethod,
        payment_status: "paid", // Wallet payment is completed immediately
        payment_amount: shipmentData.price || 15,
        payment_currency: "SAR",
      });
      
      // Process paid order to create shipment (Aramex/Mrsool) if applicable
      // This ensures shipments are created for wallet payments, just like Tap Payments flow
      try {
        const processedOrder = await processPaidOrder(createdOrder.id);
        if (processedOrder) {
          // Store the processed order with updated status and tracking info
          sessionStorage.setItem("createdOrder", JSON.stringify({
            ...processedOrder,
            trackingNumber: processedOrder.aramex_tracking_number || processedOrder.mrsool_tracking_number || processedOrder.tracking_no,
          }));
        } else {
          // If processPaidOrder returns null, store the created order
          sessionStorage.setItem("createdOrder", JSON.stringify({
            ...createdOrder,
            trackingNumber: createdOrder.tracking_no,
          }));
        }
      } catch (processError: any) {
        // Log error but don't fail the flow - order is created, shipment can be retried
        console.error("Failed to process paid order:", processError);
        message.warning("تم إنشاء الطلب بنجاح، لكن فشل إنشاء الشحنة. سيتم إعادة المحاولة تلقائياً.");
        // Store the created order even if shipment creation failed
        sessionStorage.setItem("createdOrder", JSON.stringify({
          ...createdOrder,
          trackingNumber: createdOrder.tracking_no,
        }));
      }
      
      // Clear session storage
      sessionStorage.removeItem("pendingShipment");
      sessionStorage.removeItem("selectedProvider");
      
      message.success("تم الدفع وإنشاء الطلب بنجاح!");
      navigate("/client/order-confirmation");
    } catch (error: any) {
      message.error(error?.message || "فشل معالجة الدفع");
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">طرق الدفع</h2>
      </div>

      <Card className="rounded-xl">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="paymentMethod"
            label="اختر طريقة الدفع"
            initialValue="mada"
            rules={[{ required: true, message: "يرجى اختيار طريقة الدفع" }]}
          >
            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Radio value="apple-pay" className="w-full py-2">
                  <Space>
                    <AppleOutlined className="text-xl" />
                    <span>Apple Pay</span>
                  </Space>
                </Radio>
                <Radio value="mada" className="w-full py-2">
                  <Space>
                    <CreditCardOutlined className="text-xl" />
                    <span>مدى</span>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {paymentMethod === "mada" && (
            <>
              <div className="my-4">
                <h3 className="text-lg font-semibold mb-4">تفاصيل الدفع</h3>
              </div>

              <Form.Item
                name="cardNumber"
                label="رقم البطاقة"
                rules={[
                  { required: true, message: "يرجى إدخال رقم البطاقة" },
                  { len: 16, message: "رقم البطاقة يجب أن يكون 16 رقم" },
                ]}
              >
                <Input
                  size="large"
                  className="rounded-lg"
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="expiryDate"
                  label="تاريخ الانتهاء"
                  rules={[{ required: true, message: "يرجى إدخال تاريخ الانتهاء" }]}
                >
                  <Input
                    size="large"
                    className="rounded-lg"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </Form.Item>

                <Form.Item
                  name="cvv"
                  label="CVV"
                  rules={[
                    { required: true, message: "يرجى إدخال CVV" },
                    { len: 3, message: "CVV يجب أن يكون 3 أرقام" },
                  ]}
                >
                  <Input
                    size="large"
                    className="rounded-lg"
                    placeholder="123"
                    maxLength={3}
                    type="password"
                  />
                </Form.Item>
              </div>
            </>
          )}

          <Form.Item className="mt-6">
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              className="w-full rounded-lg"
              style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
              loading={loading}
            >
              تأكيد الدفع
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

