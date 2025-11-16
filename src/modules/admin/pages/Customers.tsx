import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

type Customer = {
  id: string;
  customerName: string;
  phoneNumber: string;
  orderCount: number;
  lastOrderDate: string;
  status: "active" | "inactive";
};

// Mock data - will be replaced with API calls
const customers: Customer[] = [
  {
    id: "1",
    customerName: "أحمد حسن",
    phoneNumber: "0501234567",
    orderCount: 15,
    lastOrderDate: "2025-01-15",
    status: "active",
  },
  {
    id: "2",
    customerName: "محمد علي",
    phoneNumber: "0507654321",
    orderCount: 8,
    lastOrderDate: "2025-01-10",
    status: "active",
  },
  {
    id: "3",
    customerName: "خالد أحمد",
    phoneNumber: "0509876543",
    orderCount: 3,
    lastOrderDate: "2024-12-20",
    status: "active",
  },
];

export default function Customers() {
  const columns: ColumnsType<Customer> = [
    {
      title: "اسم العميل",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
    },
    {
      title: "رقم الهاتف",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 120,
    },
    {
      title: "عدد الطلبات",
      dataIndex: "orderCount",
      key: "orderCount",
      width: 120,
      render: (count: number) => `${count} طلب`,
    },
    {
      title: "تاريخ أخر طلب",
      dataIndex: "lastOrderDate",
      key: "lastOrderDate",
      width: 150,
    },
    {
      title: "حالة العميل",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: Customer["status"]) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "نشط" : "غير نشط"}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">إدارة العملاء</h2>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `إجمالي ${total} عميل`,
        }}
        className="rounded-lg"
      />
    </div>
  );
}
