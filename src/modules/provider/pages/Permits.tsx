import { Card, Table, Button, Upload, Space, Tag, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UploadOutlined, EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import { useState } from "react";

type Permit = {
  id: string;
  permitName: string;
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "active" | "expired" | "pending";
  document?: string;
};

// Mock data - will be replaced with API calls
const permits: Permit[] = [
  {
    id: "1",
    permitName: "رخصة النقل",
    permitNumber: "PER-001",
    issueDate: "2024-01-15",
    expiryDate: "2025-01-15",
    status: "active",
  },
  {
    id: "2",
    permitName: "رخصة التخزين",
    permitNumber: "PER-002",
    issueDate: "2024-03-20",
    expiryDate: "2025-03-20",
    status: "active",
  },
  {
    id: "3",
    permitName: "رخصة التوزيع",
    permitNumber: "PER-003",
    issueDate: "2023-06-10",
    expiryDate: "2024-06-10",
    status: "expired",
  },
];

const statusColor: Record<Permit["status"], string> = {
  active: "green",
  expired: "red",
  pending: "orange",
};

const statusText: Record<Permit["status"], string> = {
  active: "نشط",
  expired: "منتهي",
  pending: "قيد المراجعة",
};

export default function Permits() {
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpload = (file: File) => {
    // TODO: Upload permit document
    console.log("Upload permit:", file);
    return false; // Prevent auto upload
  };

  const handleView = (permit: Permit) => {
    setSelectedPermit(permit);
    setIsModalOpen(true);
  };

  const handleDownload = (permit: Permit) => {
    // Generate simple permit document
    const permitHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${permit.permitName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${permit.permitName}</h1>
          <h2>وزن للخدمات اللوجستية</h2>
        </div>
        <div class="details">
          <table>
            <tr>
              <th>رقم الترخيص</th>
              <td>${permit.permitNumber}</td>
            </tr>
            <tr>
              <th>تاريخ الإصدار</th>
              <td>${permit.issueDate}</td>
            </tr>
            <tr>
              <th>تاريخ الانتهاء</th>
              <td>${permit.expiryDate}</td>
            </tr>
            <tr>
              <th>الحالة</th>
              <td>${statusText[permit.status]}</td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([permitHTML], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `permit-${permit.permitNumber}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnsType<Permit> = [
    {
      title: "اسم الترخيص",
      dataIndex: "permitName",
      key: "permitName",
      width: 200,
    },
    {
      title: "رقم الترخيص",
      dataIndex: "permitNumber",
      key: "permitNumber",
      width: 150,
    },
    {
      title: "تاريخ الإصدار",
      dataIndex: "issueDate",
      key: "issueDate",
      width: 120,
    },
    {
      title: "تاريخ الانتهاء",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 120,
    },
    {
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: Permit["status"]) => (
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
          {record.document && (
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleDownload(record)}
              className="rounded-lg"
            >
              تحميل
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold mb-2">التراخيص</h2>
        <Upload
          beforeUpload={handleUpload}
          accept=".pdf,.jpg,.jpeg,.png"
          showUploadList={false}
        >
          <Button
            type="primary"
            icon={<UploadOutlined />}
            size="large"
            className="rounded-lg"
            style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
          >
            رفع ترخيص جديد
          </Button>
        </Upload>
      </div>

      <Card className="rounded-xl">
        <Table
          columns={columns}
          dataSource={permits}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `إجمالي ${total} ترخيص`,
          }}
        />
      </Card>

      {/* Permit Details Modal */}
      <Modal
        title={`تفاصيل الترخيص ${selectedPermit?.permitName || ""}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedPermit(null);
        }}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => selectedPermit && handleDownload(selectedPermit)}>
            تحميل الترخيص
          </Button>,
          <Button key="close" onClick={() => {
            setIsModalOpen(false);
            setSelectedPermit(null);
          }}>
            إغلاق
          </Button>,
        ]}
        width={600}
        className="rounded-lg"
      >
        {selectedPermit && (
          <div className="mt-6 space-y-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">اسم الترخيص</p>
                <p className="font-semibold">{selectedPermit.permitName}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">رقم الترخيص</p>
                <p className="font-semibold">{selectedPermit.permitNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">تاريخ الإصدار</p>
                <p className="font-semibold">{selectedPermit.issueDate}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">تاريخ الانتهاء</p>
                <p className="font-semibold">{selectedPermit.expiryDate}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-1">الحالة</p>
              <Tag color={statusColor[selectedPermit.status]}>{statusText[selectedPermit.status]}</Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
