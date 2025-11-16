import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Table, Space, Modal, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/contexts/authContext";
import {
  getProviderDrivers,
  createProviderDriver,
  updateProviderDriver,
  deleteProviderDriver,
} from "@/services/drivers";
import type { ProviderDriver } from "@/services/drivers";

export default function Drivers() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drivers, setDrivers] = useState<ProviderDriver[]>([]);
  const [editingDriver, setEditingDriver] = useState<ProviderDriver | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDrivers();
    }
  }, [user]);

  const loadDrivers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getProviderDrivers(user.id);
      
      // Add mock drivers if none exist (for demo purposes)
      if (data.length === 0) {
        const mockDrivers: ProviderDriver[] = [
          {
            id: "mock-1",
            provider_id: user.id,
            name: "محمد أحمد",
            phone: "0501234567",
            id_number: "1234567890",
            license_number: "DL123456",
            vehicle_type: "سيارة",
            vehicle_plate: "أ ب ج 1234",
          },
          {
            id: "mock-2",
            provider_id: user.id,
            name: "خالد علي",
            phone: "0507654321",
            id_number: "0987654321",
            license_number: "DL654321",
            vehicle_type: "شاحنة",
            vehicle_plate: "د ه و 5678",
          },
          {
            id: "mock-3",
            provider_id: user.id,
            name: "سعد حسن",
            phone: "0501112233",
            id_number: "1122334455",
            license_number: "DL789012",
            vehicle_type: "سيارة",
            vehicle_plate: "ز ح ط 9012",
          },
        ];
        setDrivers(mockDrivers);
      } else {
        setDrivers(data);
      }
    } catch (error) {
      console.error("Error loading drivers:", error);
      message.error("فشل تحميل قائمة السائقين");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDriver(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (driver: ProviderDriver) => {
    setEditingDriver(driver);
    form.setFieldsValue({
      name: driver.name,
      mobile: driver.phone,
      idNumber: driver.id_number,
      licenseNumber: driver.license_number,
      vehicleType: driver.vehicle_type,
      vehiclePlate: driver.vehicle_plate,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (driverId: string) => {
    Modal.confirm({
      title: "تأكيد الحذف",
      content: "هل أنت متأكد من حذف هذا السائق؟",
      okText: "حذف",
      cancelText: "إلغاء",
      onOk: async () => {
        try {
          await deleteProviderDriver(driverId);
          message.success("تم حذف السائق بنجاح");
          loadDrivers();
        } catch (error: any) {
          message.error(error?.message || "فشل حذف السائق");
        }
      },
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingDriver) {
        // Update existing driver
        await updateProviderDriver(editingDriver.id, {
          name: values.name,
          phone: values.mobile,
          id_number: values.idNumber,
          license_number: values.licenseNumber,
          vehicle_type: values.vehicleType,
          vehicle_plate: values.vehiclePlate,
        });
        message.success("تم تحديث بيانات السائق بنجاح");
      } else {
        // Add new driver
        await createProviderDriver(user.id, {
          name: values.name,
          phone: values.mobile,
          id_number: values.idNumber,
          license_number: values.licenseNumber,
          vehicle_type: values.vehicleType,
          vehicle_plate: values.vehiclePlate,
        });
        message.success("تم إضافة السائق بنجاح");
      }
      setIsModalOpen(false);
      form.resetFields();
      loadDrivers();
    } catch (error: any) {
      message.error(error?.message || "فشل حفظ بيانات السائق");
      console.error("Error saving driver:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ProviderDriver> = [
    {
      title: "اسم السائق",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "رقم الجوال",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "رقم الهوية",
      dataIndex: "id_number",
      key: "id_number",
    },
    {
      title: "رقم الرخصة",
      dataIndex: "license_number",
      key: "license_number",
    },
    {
      title: "نوع المركبة",
      dataIndex: "vehicle_type",
      key: "vehicle_type",
    },
    {
      title: "رقم اللوحة",
      dataIndex: "vehicle_plate",
      key: "vehicle_plate",
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            className="rounded-lg"
          >
            تعديل
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
            className="rounded-lg"
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold mb-2">إدارة السائقين</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleAdd}
          className="rounded-lg"
          style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
        >
          إضافة سائق جديد
        </Button>
      </div>

      <Card className="rounded-xl">
        <Table
          columns={columns}
          dataSource={drivers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `إجمالي ${total} سائق`,
          }}
        />
      </Card>

      {/* Add/Edit Driver Modal */}
      <Modal
        title={editingDriver ? "تعديل بيانات السائق" : "إضافة سائق جديد"}
        open={isModalOpen}
        onOk={handleSubmit}
        confirmLoading={loading}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="حفظ"
        cancelText="إلغاء"
        okButtonProps={{
          style: { backgroundColor: "#6E69D1", borderColor: "#6E69D1" },
        }}
        width={600}
        className="rounded-lg"
      >
        <Form form={form} layout="vertical" className="mt-6">
          <Form.Item
            name="name"
            label="اسم السائق"
            rules={[{ required: true, message: "يرجى إدخال اسم السائق" }]}
          >
            <Input size="large" className="rounded-lg" placeholder="اسم السائق" />
          </Form.Item>

          <Form.Item
            name="mobile"
            label="رقم الجوال"
            rules={[
              { required: true, message: "يرجى إدخال رقم الجوال" },
              { pattern: /^05\d{8}$/, message: "رقم الجوال غير صحيح" },
            ]}
          >
            <Input size="large" className="rounded-lg" placeholder="0501234567" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="idNumber"
            label="رقم الهوية"
            rules={[{ required: true, message: "يرجى إدخال رقم الهوية" }]}
          >
            <Input size="large" className="rounded-lg" placeholder="1234567890" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="licenseNumber"
            label="رقم الرخصة"
            rules={[{ required: true, message: "يرجى إدخال رقم الرخصة" }]}
          >
            <Input size="large" className="rounded-lg" placeholder="DL123456" />
          </Form.Item>

          <Form.Item
            name="vehicleType"
            label="نوع المركبة"
            rules={[{ required: true, message: "يرجى إدخال نوع المركبة" }]}
          >
            <Input size="large" className="rounded-lg" placeholder="سيارة / شاحنة" />
          </Form.Item>

          <Form.Item
            name="vehiclePlate"
            label="رقم اللوحة"
            rules={[{ required: true, message: "يرجى إدخال رقم اللوحة" }]}
          >
            <Input size="large" className="rounded-lg" placeholder="أ ب ج 1234" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
