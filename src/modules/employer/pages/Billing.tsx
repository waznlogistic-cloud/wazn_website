import { Card, Table, Button, Tag, Space, Modal, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";

type Invoice = {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
};

// Mock data - will be replaced with API calls
const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    date: "2025-01-15",
    amount: 500,
    status: "paid",
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    date: "2025-01-14",
    amount: 750,
    status: "pending",
  },
  {
    id: "3",
    invoiceNumber: "INV-003",
    date: "2025-01-13",
    amount: 300,
    status: "overdue",
  },
];

const statusColor: Record<Invoice["status"], string> = {
  paid: "green",
  pending: "orange",
  overdue: "red",
};

const statusText: Record<Invoice["status"], string> = {
  paid: "مدفوع",
  pending: "قيد الانتظار",
  overdue: "متأخر",
};

export default function Billing() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDownload = (invoice: Invoice) => {
    // Generate simple invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .details { margin-top: 30px; }
          .total { text-align: left; margin-top: 20px; font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>فاتورة ضريبية</h1>
          <h2>وزن للخدمات اللوجستية</h2>
        </div>
        <div class="invoice-info">
          <div>
            <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>التاريخ:</strong> ${invoice.date}</p>
            <p><strong>الحالة:</strong> ${statusText[invoice.status]}</p>
          </div>
          <div>
            <p><strong>العميل:</strong> صاحب العمل</p>
            <p><strong>رقم السجل التجاري:</strong> 1234567890</p>
          </div>
        </div>
        <div class="details">
        
          <table>
            <thead>
              <tr>
                <th>الوصف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>خدمات الشحن اللوجستية</td>
                <td>1</td>
                <td>${invoice.amount} ر.س</td>
                <td>${invoice.amount} ر.س</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            <p>الإجمالي: ${invoice.amount} ر.س</p>
            <p>ضريبة القيمة المضافة (15%): ${(invoice.amount * 0.15).toFixed(2)} ر.س</p>
            <p><strong>الإجمالي شامل الضريبة: ${(invoice.amount * 1.15).toFixed(2)} ر.س</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([invoiceHTML], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `invoice-${invoice.invoiceNumber}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success("تم تحميل الفاتورة بنجاح");
  };

  const columns: ColumnsType<Invoice> = [
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
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: Invoice["status"]) => (
        <Tag color={statusColor[status]}>{statusText[status]}</Tag>
      ),
    },
    {
      title: "الإجراءات",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
            className="rounded-lg"
          >
            عرض
          </Button>
          <Button
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleDownload(record)}
            className="rounded-lg"
          >
            تحميل
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">الفاتورة والمدفوعات</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-xl text-center">
          <div className="text-3xl font-bold text-[#6E69D1] mb-2">1,550 ر.س</div>
          <p className="text-gray-600">إجمالي الفواتير</p>
        </Card>
        <Card className="rounded-xl text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">500 ر.س</div>
          <p className="text-gray-600">مدفوع</p>
        </Card>
        <Card className="rounded-xl text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">1,050 ر.س</div>
          <p className="text-gray-600">مستحق</p>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="rounded-xl">
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `إجمالي ${total} فاتورة`,
          }}
        />
      </Card>

      {/* Invoice Details Modal */}
      <Modal
        title={`تفاصيل الفاتورة ${selectedInvoice?.invoiceNumber || ""}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedInvoice(null);
        }}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => selectedInvoice && handleDownload(selectedInvoice)}>
            تحميل الفاتورة
          </Button>,
          <Button key="close" onClick={() => {
            setIsModalOpen(false);
            setSelectedInvoice(null);
          }}>
            إغلاق
          </Button>,
        ]}
        width={700}
        className="rounded-lg"
      >
        {selectedInvoice && (
          <div className="mt-6 space-y-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">رقم الفاتورة</p>
                <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">التاريخ</p>
                <p className="font-semibold">{selectedInvoice.date}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">المبلغ</p>
                <p className="font-semibold text-lg">{selectedInvoice.amount} ر.س</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">الحالة</p>
                <Tag color={statusColor[selectedInvoice.status]}>{statusText[selectedInvoice.status]}</Tag>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-3">تفاصيل الخدمة</h4>
              <p className="text-gray-700">خدمات الشحن اللوجستية - شهر {selectedInvoice.date}</p>
              <div className="mt-4">
                <p className="text-gray-600">المبلغ الإجمالي: {selectedInvoice.amount} ر.س</p>
                <p className="text-gray-600">ضريبة القيمة المضافة (15%): {(selectedInvoice.amount * 0.15).toFixed(2)} ر.س</p>
                <p className="text-lg font-semibold mt-2">الإجمالي شامل الضريبة: {(selectedInvoice.amount * 1.15).toFixed(2)} ر.س</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
