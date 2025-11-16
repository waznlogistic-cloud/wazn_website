import { Card, Table, Button, Tag, Space, Progress, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";

type Transaction = {
  id: string;
  orderNumber: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "processing";
  description: string;
};

// Mock data - will be replaced with API calls
const transactions: Transaction[] = [
  {
    id: "1",
    orderNumber: "000000",
    date: "2025-01-15",
    amount: 50,
    status: "paid",
    description: "توصيل شحنة #000000",
  },
  {
    id: "2",
    orderNumber: "000001",
    date: "2025-01-14",
    amount: 75,
    status: "paid",
    description: "توصيل شحنة #000001",
  },
  {
    id: "3",
    orderNumber: "000002",
    date: "2025-01-13",
    amount: 60,
    status: "pending",
    description: "توصيل شحنة #000002",
  },
];

const totalEarnings = 185;
const paidAmount = 125;
const pendingAmount = 60;

const statusColor: Record<Transaction["status"], string> = {
  paid: "green",
  pending: "orange",
  processing: "blue",
};

const statusText: Record<Transaction["status"], string> = {
  paid: "مدفوع",
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
};

export default function Billing() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDownloadReport = () => {
    const reportHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الأرباح</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #6E69D1; color: white; }
        </style>
      </head>
      <body>
        <h1>تقرير الأرباح - سائق مستقل</h1>
        <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
        <h2>ملخص الأرباح</h2>
        <p>إجمالي الأرباح: ${totalEarnings} ر.س</p>
        <p>مدفوع: ${paidAmount} ر.س</p>
        <p>قيد الانتظار: ${pendingAmount} ر.س</p>
        <h2>تفاصيل المعاملات</h2>
        <table>
          <tr>
            <th>رقم الطلب</th>
            <th>التاريخ</th>
            <th>المبلغ</th>
            <th>الوصف</th>
            <th>الحالة</th>
          </tr>
          ${transactions.map(t => `
            <tr>
              <td>${t.orderNumber}</td>
              <td>${t.date}</td>
              <td>${t.amount} ر.س</td>
              <td>${t.description}</td>
              <td>${statusText[t.status]}</td>
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
    link.setAttribute("download", `earnings-report-${new Date().toISOString().split("T")[0]}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnsType<Transaction> = [
    {
      title: "رقم الطلب",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
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
      title: "الوصف",
      dataIndex: "description",
      key: "description",
      width: 200,
    },
    {
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: Transaction["status"]) => (
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
        <p className="text-gray-600">محمد حسن</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-xl text-center">
          <Progress
            type="circle"
            percent={100}
            format={() => `${totalEarnings} ر.س`}
            size={120}
            strokeColor="#6E69D1"
          />
          <p className="mt-4 font-semibold">إجمالي الأرباح</p>
        </Card>
        <Card className="rounded-xl text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{paidAmount} ر.س</div>
          <p className="text-gray-600">مدفوع</p>
        </Card>
        <Card className="rounded-xl text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{pendingAmount} ر.س</div>
          <p className="text-gray-600">قيد الانتظار</p>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="mb-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">سجل المعاملات</h3>
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `إجمالي ${total} معاملة`,
          }}
        />
      </Card>

      {/* Earnings Report */}
      <Card className="rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">تقارير الأرباح</h3>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadReport}
            className="rounded-lg"
            style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
          >
            تحميل التقرير
          </Button>
        </div>
      </Card>

      {/* Transaction Details Modal */}
      <Modal
        title="تفاصيل المعاملة"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsModalOpen(false);
            setSelectedTransaction(null);
          }}>
            إغلاق
          </Button>,
        ]}
        width={600}
        className="rounded-lg"
      >
        {selectedTransaction && (
          <div className="mt-6 space-y-4" dir="rtl">
            <div>
              <p className="text-gray-600 mb-1">رقم الطلب</p>
              <p className="font-semibold text-lg">{selectedTransaction.orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">التاريخ</p>
              <p className="font-semibold">{selectedTransaction.date}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">المبلغ</p>
              <p className="font-semibold text-lg text-[#6E69D1]">{selectedTransaction.amount} ر.س</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">الوصف</p>
              <p className="text-gray-700">{selectedTransaction.description}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">الحالة</p>
              <Tag color={statusColor[selectedTransaction.status]}>
                {statusText[selectedTransaction.status]}
              </Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
