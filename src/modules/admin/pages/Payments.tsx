import { useState } from "react";
import { Card, Table, Button, Modal, Input, Radio, Space, Tag, Progress } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined } from "@ant-design/icons";

type Payment = {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  paymentStatus: "paid" | "not_paid" | "rejected";
};

// Mock data - will be replaced with API calls
const payments: Payment[] = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    date: "2025-01-15",
    amount: 500,
    paymentStatus: "paid",
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    date: "2025-01-14",
    amount: 750,
    paymentStatus: "not_paid",
  },
  {
    id: "3",
    invoiceNumber: "INV-003",
    date: "2025-01-13",
    amount: 300,
    paymentStatus: "rejected",
  },
];

const totalDues = 2000;
const paidAmount = 500;
const rejectedAmount = 300;

export default function Payments() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<string>("bank");
  const [withdrawAmount, setWithdrawAmount] = useState<string>(totalDues.toString());

  const handleDownloadInvoice = (invoiceNumber: string) => {
    // Generate simple invoice HTML
    const invoice = payments.find(p => p.invoiceNumber === invoiceNumber);
    if (!invoice) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin: 20px 0; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>فاتورة ${invoiceNumber}</h1>
          <p>منصة وزن للخدمات اللوجستية</p>
        </div>
        <div class="details">
          <p><strong>التاريخ:</strong> ${invoice.date}</p>
          <p><strong>المبلغ:</strong> ${invoice.amount} ر.س</p>
          <p><strong>الحالة:</strong> ${invoice.paymentStatus === "paid" ? "تم الدفع" : invoice.paymentStatus === "not_paid" ? "لم يتم الدفع" : "مرفوضة"}</p>
        </div>
        <div class="total">
          <p>المبلغ الإجمالي: ${invoice.amount} ر.س</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `invoice-${invoiceNumber}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWithdraw = () => {
    // Process withdrawal
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    if (amount > totalDues) {
      alert("المبلغ المطلوب أكبر من المبلغ المتاح");
      return;
    }
    
    alert(`تم طلب سحب مبلغ ${amount} ر.س عبر ${withdrawMethod === "bank" ? "تحويل بنكي" : "STC Pay"}`);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount(totalDues.toString());
  };

  const columns: ColumnsType<Payment> = [
    {
      title: "رقم الفاتورة",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      width: 150,
    },
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "المبلغ",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number) => `${amount} ر.س`,
    },
    {
      title: "حالة الدفع",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 120,
      render: (status: Payment["paymentStatus"]) => {
        const statusMap = {
          paid: { text: "تم الدفع", color: "green" },
          not_paid: { text: "لم يتم الدفع", color: "orange" },
          rejected: { text: "مرفوضة", color: "red" },
        };
        const statusInfo = statusMap[status];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "تحميل الفاتورة",
      key: "download",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="small"
          onClick={() => handleDownloadInvoice(record.invoiceNumber)}
          className="rounded-lg"
        >
          تحميل
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">إدارة المدفوعات</h2>
        <p className="text-gray-600">شركة ثلاثة أصفار</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-xl text-center">
          <Progress
            type="circle"
            percent={100}
            format={() => `${totalDues} ر.س`}
            size={120}
            strokeColor="#6E69D1"
          />
          <p className="mt-4 font-semibold">إجمالي المستحقات</p>
        </Card>
        <Card className="rounded-xl text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{paidAmount} ر.س</div>
          <p className="text-gray-600">تم الدفع</p>
        </Card>
        <Card className="rounded-xl text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{rejectedAmount} ر.س</div>
          <p className="text-gray-600">مرفوضة</p>
        </Card>
      </div>

      {/* Payment Details Table */}
      <Card className="mb-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">تفاصيل المدفوعات</h3>
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `إجمالي ${total} فاتورة`,
          }}
        />
      </Card>

      {/* Financial Reports */}
      <Card className="mb-6 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">التقارير المالية</h3>
          <Button 
            type="primary" 
            className="rounded-lg" 
            icon={<DownloadOutlined />}
            onClick={() => {
              const reportHTML = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                  <meta charset="UTF-8">
                  <title>التقرير المالي</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #6E69D1; color: white; }
                  </style>
                </head>
                <body>
                  <h1>التقرير المالي - منصة وزن</h1>
                  <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
                  <h2>ملخص المدفوعات</h2>
                  <p>إجمالي المستحقات: ${totalDues} ر.س</p>
                  <p>تم الدفع: ${paidAmount} ر.س</p>
                  <p>مرفوضة: ${rejectedAmount} ر.س</p>
                  <h2>تفاصيل الفواتير</h2>
                  <table>
                    <tr>
                      <th>رقم الفاتورة</th>
                      <th>التاريخ</th>
                      <th>المبلغ</th>
                      <th>الحالة</th>
                    </tr>
                    ${payments.map(p => `
                      <tr>
                        <td>${p.invoiceNumber}</td>
                        <td>${p.date}</td>
                        <td>${p.amount} ر.س</td>
                        <td>${p.paymentStatus === "paid" ? "تم الدفع" : p.paymentStatus === "not_paid" ? "لم يتم الدفع" : "مرفوضة"}</td>
                      </tr>
                    `).join("")}
                  </table>
                </body>
                </html>
              `;
              const blob = new Blob([reportHTML], { type: "text/html;charset=utf-8;" });
              const link = document.createElement("a");
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", `financial-report-${new Date().toISOString().split("T")[0]}.html`);
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            التحميل
          </Button>
        </div>
      </Card>

      {/* Amount Saved */}
      <Card className="rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">المبلغ المحفوظة داخل النظام</h3>
            <p className="text-2xl font-bold text-[#6E69D1]">{totalDues} ر.س</p>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="rounded-lg"
            style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
          >
            سحب المبلغ
          </Button>
        </div>
      </Card>

      {/* Withdraw Modal */}
      <Modal
        title="سحب رصيد المحفظة"
        open={isWithdrawModalOpen}
        onOk={handleWithdraw}
        onCancel={() => setIsWithdrawModalOpen(false)}
        okText="سحب"
        cancelText="إلغاء"
        okButtonProps={{
          style: { backgroundColor: "#6E69D1", borderColor: "#6E69D1" },
        }}
        width={500}
        className="rounded-lg"
      >
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">اختيار طرق السحب</h4>
            <Radio.Group
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Radio value="bank">تحويل بنكي</Radio>
                <Radio value="stc">STC Pay</Radio>
              </Space>
            </Radio.Group>
          </div>

          <div>
            <p className="text-gray-600 mb-2">المبلغ المستحق</p>
            <p className="text-xl font-semibold">{totalDues} ر.س</p>
          </div>

          <div>
            <p className="text-gray-600 mb-2">المبلغ المراد سحبه</p>
            <Input
              size="large"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              suffix="ر.س"
              className="rounded-lg"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
