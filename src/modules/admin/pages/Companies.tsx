import { Table, Button, Tag, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";

type Company = {
  id: string;
  companyName: string;
  commercialRegister: string;
  contactNumber: string;
  email: string;
  partnershipCount: number;
  customerRating: number;
};

// Mock data - will be replaced with API calls
const companies: Company[] = [
  {
    id: "1",
    companyName: "Redbox",
    commercialRegister: "CR123456",
    contactNumber: "0501234567",
    email: "info@redbox.com",
    partnershipCount: 150,
    customerRating: 4.5,
  },
  {
    id: "2",
    companyName: "Aramex",
    commercialRegister: "CR789012",
    contactNumber: "0507654321",
    email: "info@aramex.com",
    partnershipCount: 200,
    customerRating: 4.8,
  },
];

export default function Companies() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewContract = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const columns: ColumnsType<Company> = [
    {
      title: "اسم الشركة",
      dataIndex: "companyName",
      key: "companyName",
      width: 150,
    },
    {
      title: "السجل التجاري",
      dataIndex: "commercialRegister",
      key: "commercialRegister",
      width: 150,
    },
    {
      title: "رقم التواصل",
      dataIndex: "contactNumber",
      key: "contactNumber",
      width: 120,
    },
    {
      title: "البريد الإلكتروني",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "عدد الشراكة",
      dataIndex: "partnershipCount",
      key: "partnershipCount",
      width: 120,
      render: (count: number) => `${count} شراكة`,
    },
    {
      title: "تقييم العملاء",
      dataIndex: "customerRating",
      key: "customerRating",
      width: 120,
      render: (rating: number) => (
        <Tag color="gold">{rating.toFixed(1)} ⭐</Tag>
      ),
    },
    {
      title: "عقد الشراكة",
      key: "contract",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewContract(record)}
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
        <h2 className="text-2xl font-semibold mb-2">إدارة الشركات</h2>
      </div>

      <Table
        columns={columns}
        dataSource={companies}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `إجمالي ${total} شركة`,
        }}
        className="rounded-lg"
      />

      {/* Contract Details Modal */}
      <Modal
        title={`عقد الشراكة - ${selectedCompany?.companyName || ""}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedCompany(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsModalOpen(false);
            setSelectedCompany(null);
          }}>
            إغلاق
          </Button>,
        ]}
        width={700}
        className="rounded-lg"
      >
        {selectedCompany && (
          <div className="mt-6 space-y-4" dir="rtl">
            <div>
              <p className="text-gray-600 mb-1">اسم الشركة</p>
              <p className="font-semibold text-lg">{selectedCompany.companyName}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">السجل التجاري</p>
              <p className="font-semibold">{selectedCompany.commercialRegister}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">رقم التواصل</p>
              <p className="font-semibold">{selectedCompany.contactNumber}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">البريد الإلكتروني</p>
              <p className="font-semibold">{selectedCompany.email}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">عدد الشراكة</p>
              <p className="font-semibold">{selectedCompany.partnershipCount} شراكة</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">تقييم العملاء</p>
              <Tag color="gold">{selectedCompany.customerRating.toFixed(1)} ⭐</Tag>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">تفاصيل العقد:</p>
              <p className="text-sm text-gray-700">
                تم توقيع عقد الشراكة مع {selectedCompany.companyName} بتاريخ 2024-01-01.
                العقد ساري المفعول لمدة سنة واحدة قابلة للتجديد.
                شروط العقد تشمل نسبة عمولة 10% على كل طلب ناجح.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
