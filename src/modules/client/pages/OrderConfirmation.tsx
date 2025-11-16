import { Card, Button, Space } from "antd";
import { CheckCircleOutlined, DownloadOutlined, ShareAltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

type OrderConfirmationProps = {
  trackingNumber?: string;
};

export default function OrderConfirmation({ trackingNumber = "3637383030" }: OrderConfirmationProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="rounded-xl text-center">
        <div className="py-8">
          <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-4">تم اعتماد طلب الشحن بنجاح</h2>
          
          <div className="my-6">
            <p className="text-gray-600 mb-2">رقم تتبع الشحنة</p>
            <p className="text-3xl font-bold text-[#6E69D1]">{trackingNumber}</p>
          </div>

          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
            <p className="text-gray-400">صورة بوليصة الشحن</p>
            {/* TODO: Display actual bill of lading image */}
          </div>

          <Space size="large">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              className="rounded-lg"
              style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
              onClick={() => {
                // Generate bill of lading HTML
                const billHTML = `
                  <!DOCTYPE html>
                  <html dir="rtl" lang="ar">
                  <head>
                    <meta charset="UTF-8">
                    <title>بوليصة الشحن - ${trackingNumber}</title>
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
                      <p class="tracking">رقم التتبع: ${trackingNumber}</p>
                      <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString("ar-SA")}</p>
                      <p><strong>الحالة:</strong> تم اعتماد الطلب</p>
                    </div>
                  </body>
                  </html>
                `;
                const blob = new Blob([billHTML], { type: "text/html;charset=utf-8;" });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `bill-of-lading-${trackingNumber}.html`);
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
                if (navigator.share) {
                  navigator.share({
                    title: "بوليصة الشحن",
                    text: `رقم تتبع الشحنة: ${trackingNumber}`,
                    url: window.location.href,
                  }).catch(() => {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(`رقم تتبع الشحنة: ${trackingNumber}\n${window.location.href}`);
                    alert("تم نسخ رابط التتبع إلى الحافظة");
                  });
                } else {
                  // Fallback: copy to clipboard
                  navigator.clipboard.writeText(`رقم تتبع الشحنة: ${trackingNumber}\n${window.location.href}`);
                  alert("تم نسخ رابط التتبع إلى الحافظة");
                }
              }}
            >
              مشاركة
            </Button>
          </Space>

          <div className="mt-6">
            <Button
              type="link"
              onClick={() => navigate("/client/shipments")}
              className="text-[#6E69D1]"
            >
              العودة إلى الشحنات
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

