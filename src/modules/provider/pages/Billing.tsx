import { Card, Table, Button, Progress, Tag, Space, Modal, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";

type Payment = {
  id: string;
  amount: number;
  date: string;
  transactionType: string;
  status: "paid" | "rejected" | "pending";
};

// Mock data - will be replaced with API calls
const payments: Payment[] = [
  {
    id: "1",
    amount: 500,
    date: "2025-01-15",
    transactionType: "تم الدفع",
    status: "paid",
  },
  {
    id: "2",
    amount: 800,
    date: "2025-01-14",
    transactionType: "مرفوضة",
    status: "rejected",
  },
  {
    id: "3",
    amount: 300,
    date: "2025-01-13",
    transactionType: "عيد العمالية",
    status: "pending",
  },
];

const totalDues = 2000;

const statusColor: Record<Payment["status"], string> = {
  paid: "green",
  rejected: "red",
  pending: "orange",
};

const statusText: Record<Payment["status"], string> = {
  paid: "تم الدفع",
  rejected: "مرفوضة",
  pending: "قيد الانتظار",
};

export default function Billing() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDownloadReport = () => {
    // Generate simple financial report
    const reportHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>التقرير المالي</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>التقرير المالي</h1>
          <h2>وزن للخدمات اللوجستية</h2>
          <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
        </div>
        <div>
          <h3>ملخص المدفوعات</h3>
          <p>إجمالي المستحقات: ${totalDues} ر.س</p>
          <p>المدفوع: ${(totalDues * 0.65).toFixed(2)} ر.س</p>
          <p>المعلق: ${(totalDues * 0.35).toFixed(2)} ر.س</p>
        </div>
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
    message.success("تم تحميل التقرير بنجاح");
  };

  const columns: ColumnsType<Payment> = [
    {
      title: "المبلغ",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number) => `${amount} ر.س`,
    },
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "نوع العملية",
      dataIndex: "transactionType",
      key: "transactionType",
      width: 150,
    },
    {
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: Payment["status"]) => (
        <Tag color={statusColor[status]}>{statusText[status]}</Tag>
      ),
    },
    {
      title: "الإجراءات",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleView(record)}
          className="rounded-lg"
        >
          عرض
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">الفاتورة والمدفوعات</h2>
        <p className="text-gray-600">اسم مزود الخدمة</p>
      </div>

      {/* Payment Summary with Circular Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-xl text-center">
          <Progress
            type="circle"
            percent={100}
            format={() => `${totalDues} ر.س`}
            size={140}
            strokeColor="#6E69D1"
          />
          <p className="mt-4 font-semibold">إجمالي المستحقات</p>
        </Card>
        <Card className="rounded-xl text-center">
          <Progress
            type="circle"
            percent={65}
            format={() => "65%"}
            size={140}
            strokeColor="#52c41a"
          />
          <p className="mt-4 font-semibold">المدفوع</p>
        </Card>
        <Card className="rounded-xl text-center">
          <Progress
            type="circle"
            percent={35}
            format={() => "35%"}
            size={140}
            strokeColor="#ff4d4f"
          />
          <p className="mt-4 font-semibold">المعلق</p>
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
            showTotal: (total) => `إجمالي ${total} عملية`,
          }}
        />
      </Card>

      {/* Financial Reports */}
      <Card className="mb-6 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">التقارير المالية</h3>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadReport}
            className="rounded-lg"
            style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
          >
            تحميل
          </Button>
        </div>
      </Card>

      {/* Amount Saved in System */}
      <Card className="rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">المبلغ المحفوظة داخل النظام</h3>
            <p className="text-2xl font-bold text-[#6E69D1]">{totalDues} ر.س</p>
          </div>
          <Button
            type="primary"
            size="large"
            className="rounded-lg"
            style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
          >
            سحب المبلغ
          </Button>
        </div>
      </Card>

      {/* Payment Details Modal */}
      <Modal
        title={`تفاصيل العملية ${selectedPayment?.id || ""}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsModalOpen(false);
            setSelectedPayment(null);
          }}>
            إغلاق
          </Button>,
        ]}
        width={600}
        className="rounded-lg"
      >
        {selectedPayment && (
          <div className="mt-6 space-y-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">المبلغ</p>
                <p className="font-semibold text-lg">{selectedPayment.amount} ر.س</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">التاريخ</p>
                <p className="font-semibold">{selectedPayment.date}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">نوع العملية</p>
                <p className="font-semibold">{selectedPayment.transactionType}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">الحالة</p>
                <Tag color={statusColor[selectedPayment.status]}>{statusText[selectedPayment.status]}</Tag>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-3">تفاصيل إضافية</h4>
              <p className="text-gray-700">
                {selectedPayment.status === "paid" && "تم استلام المبلغ بنجاح في الحساب البنكي."}
                {selectedPayment.status === "pending" && "العملية قيد المعالجة، سيتم إتمامها قريباً."}
                {selectedPayment.status === "rejected" && "تم رفض العملية. يرجى التواصل مع الدعم الفني."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
