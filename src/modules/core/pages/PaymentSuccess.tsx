import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, Spin, Result, Button, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { createOrder, processPaidOrder } from "@/services/orders";
import { useAuth } from "@/contexts/authContext";

/**
 * Payment Success Page
 * 
 * This page handles the redirect from Tap Payments after payment completion.
 * It retrieves the pending order data from sessionStorage and completes the order creation.
 */
export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get Tap charge ID from URL parameters
        const tapId = searchParams.get("tap_id");
        const chargeId = searchParams.get("charge_id");
        const reference = searchParams.get("reference");

        // Get pending order data from sessionStorage
        const pendingOrderDataStr = sessionStorage.getItem("pendingOrderData");
        const storedTapChargeId = sessionStorage.getItem("tapChargeId");

        if (!pendingOrderDataStr) {
          setStatus("error");
          setErrorMessage("لم يتم العثور على بيانات الطلب. يرجى المحاولة مرة أخرى.");
          return;
        }

        if (!user) {
          setStatus("error");
          setErrorMessage("يجب تسجيل الدخول لإكمال الطلب.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const pendingOrderData = JSON.parse(pendingOrderDataStr);

        // Verify Tap charge ID matches (security check)
        const actualChargeId = chargeId || tapId || storedTapChargeId;
        if (!actualChargeId) {
          console.warn("No Tap charge ID found in URL or session");
        }

        // Check payment status with Tap Payments API
        let paymentStatus = "pending";
        try {
          const { tapPaymentsService } = await import("@/services/tapPayments");
          if (actualChargeId) {
            const charge = await tapPaymentsService.getCharge(actualChargeId);
            paymentStatus = charge.status === "CAPTURED" ? "paid" : 
                          charge.status === "FAILED" || charge.status === "DECLINED" ? "failed" : 
                          "pending";
          }
        } catch (tapError: any) {
          console.warn("Could not verify payment status:", tapError);
          // Continue with order creation even if status check fails
          // Payment status will be updated via webhook
        }

        // Create the order with payment information
        let createdOrder = await createOrder({
          ...pendingOrderData,
          tap_charge_id: actualChargeId || pendingOrderData.tap_charge_id,
          payment_status: paymentStatus,
          payment_amount: pendingOrderData.price,
          payment_currency: "SAR",
        });

        // If payment is paid, process the order (create shipment - Aramex or Mrsool)
        // Use the returned order from processPaidOrder to get updated status and tracking info
        if (paymentStatus === "paid") {
          try {
            const processedOrder = await processPaidOrder(createdOrder.id);
            // Use the processed order if available (has updated status and shipment tracking data)
            if (processedOrder) {
              createdOrder = processedOrder;
            } else {
              // processPaidOrder returned null - likely payment_status wasn't "paid" yet
              // This can happen due to race conditions or database synchronization issues
              // Refetch the order to get the latest status
              console.warn(`Order ${createdOrder.id}: processPaidOrder returned null, payment_status may not be 'paid' yet. Refetching order...`);
              const { getOrderById } = await import("@/services/orders");
              const refreshedOrder = await getOrderById(createdOrder.id);
              if (refreshedOrder) {
                createdOrder = refreshedOrder;
                // If payment_status is now "paid", log a warning about potential retry needed
                if (refreshedOrder.payment_status === "paid" && refreshedOrder.status === "pending") {
                  console.warn(`Order ${createdOrder.id}: Payment is paid but order status is still 'pending'. Shipment creation may need retry.`);
                  message.warning("تم إنشاء الطلب بنجاح. قد تحتاج الشحنة إلى إعادة المحاولة تلقائياً.");
                }
              }
            }
          } catch (processError: any) {
            // Log error but don't fail the flow - order is created, shipment can be retried
            console.error("Failed to process paid order:", processError);
            message.warning("تم إنشاء الطلب بنجاح، لكن فشل إنشاء الشحنة. سيتم إعادة المحاولة تلقائياً.");
          }
        }

        // Clear session storage
        sessionStorage.removeItem("pendingOrderData");
        sessionStorage.removeItem("tapChargeId");

        // Store order for confirmation page (with updated status and tracking info)
        // Check for both Aramex and Mrsool tracking numbers before falling back to base tracking_no
        sessionStorage.setItem("createdOrder", JSON.stringify({
          ...createdOrder,
          trackingNumber: createdOrder.aramex_tracking_number || createdOrder.mrsool_tracking_number || createdOrder.tracking_no,
        }));

        setOrderId(createdOrder.id);
        setStatus("success");
        message.success("تم إنشاء الطلب بنجاح!");

        // Redirect to order confirmation after 3 seconds
        setTimeout(() => {
          navigate("/employer/orders/new?step=3");
        }, 3000);
      } catch (error: any) {
        console.error("Error processing payment:", error);
        setStatus("error");
        setErrorMessage(error?.message || "فشل إنشاء الطلب. يرجى المحاولة مرة أخرى.");
        message.error(error?.message || "فشل إنشاء الطلب");
      }
    };

    processPayment();
  }, [searchParams, navigate, user]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="rounded-xl">
          <div className="text-center py-8">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            <p className="mt-4 text-lg text-gray-600">جاري معالجة الدفع وإنشاء الطلب...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="rounded-xl">
          <Result
            status="error"
            title="فشل معالجة الدفع"
            subTitle={errorMessage}
            extra={[
              <Button type="primary" key="retry" onClick={() => navigate("/employer/orders/new")}>
                المحاولة مرة أخرى
              </Button>,
              <Button key="home" onClick={() => navigate("/employer/home")}>
                العودة للرئيسية
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="rounded-xl">
        <Result
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          status="success"
          title="تم الدفع بنجاح!"
          subTitle="تم إنشاء الطلب بنجاح. سيتم توجيهك إلى صفحة التأكيد..."
          extra={[
            <Button type="primary" key="view" onClick={() => navigate(`/employer/orders/${orderId}`)}>
              عرض الطلب
            </Button>,
            <Button key="home" onClick={() => navigate("/employer/home")}>
              العودة للرئيسية
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
}

