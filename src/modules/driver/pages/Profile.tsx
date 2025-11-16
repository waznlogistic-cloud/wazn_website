import { useState, useEffect } from "react";
import { Form, Input, Button, Checkbox, Space, Tag, message } from "antd";
import { CheckCircleOutlined, UserOutlined, IdcardOutlined, PhoneOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/authContext";
import { getProfile, updateProfile } from "@/services/profiles";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const profile = await getProfile(user.id);
      if (profile) {
        form.setFieldsValue({
          driverName: profile.full_name,
          idNumber: profile.id_number,
          phone: profile.phone,
          email: profile.email,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      await updateProfile(user.id, {
        full_name: values.driverName,
        phone: values.phone,
        email: values.email,
        id_number: values.idNumber,
      });
      message.success("تم حفظ البيانات بنجاح!");
      setIsEditing(false);
    } catch (error: any) {
      message.error(error?.message || "فشل حفظ البيانات");
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile();
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">معلوماتي</h2>
        <p className="text-gray-600">محمد حسن</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">المعلومات الشخصية</h3>
      </div>

      <Form
        form={form}
        layout="vertical"
        disabled={!isEditing || loading}
      >
        <Form.Item
          name="driverName"
          label="اسم السائق"
          rules={[{ required: true, message: "يرجى إدخال اسم السائق" }]}
        >
          <Input
            prefix={<UserOutlined />}
            size="large"
            className="rounded-lg"
            placeholder="اسم السائق"
          />
        </Form.Item>

        <Form.Item
          name="idNumber"
          label="رقم الهوية / الإقامة"
          rules={[{ required: true, message: "يرجى إدخال رقم الهوية" }]}
        >
          <div className="flex gap-2">
            <Input
              prefix={<IdcardOutlined />}
              size="large"
              className="rounded-lg flex-1"
              placeholder="000.000.000"
            />
            <Tag
              icon={<CheckCircleOutlined />}
              color="success"
              className="flex items-center h-10 px-4"
            >
              تم التحقق
            </Tag>
          </div>
        </Form.Item>

        <Form.Item
          name="phone"
          label="رقم الهاتف"
          rules={[{ required: true, message: "يرجى إدخال رقم الهاتف" }]}
        >
          <div className="flex gap-2">
            <Input
              prefix={<PhoneOutlined />}
              size="large"
              className="rounded-lg flex-1"
              placeholder="+966 00 000-0000"
            />
            <Tag
              icon={<CheckCircleOutlined />}
              color="success"
              className="flex items-center h-10 px-4"
            >
              تم التحقق
            </Tag>
          </div>
        </Form.Item>

        <Form.Item
          name="email"
          label="البريد الإلكتروني"
          rules={[
            { required: true, message: "يرجى إدخال البريد الإلكتروني" },
            { type: "email", message: "البريد الإلكتروني غير صحيح" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            size="large"
            className="rounded-lg"
            placeholder="البريد الإلكتروني"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="كلمة المرور"
          rules={[{ required: true, message: "يرجى إدخال كلمة المرور" }]}
        >
          <div className="flex gap-2">
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              className="rounded-lg flex-1"
              placeholder="كلمة المرور"
            />
            <Button size="large" className="rounded-lg">
              تحديث
            </Button>
          </div>
        </Form.Item>

        <Form.Item
          name="drivingLicense"
          label="رخصة القيادة"
          rules={[{ required: true, message: "يرجى إدخال رقم رخصة القيادة" }]}
        >
          <Input
            size="large"
            className="rounded-lg"
            placeholder="رقم رخصة القيادة"
          />
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject("يجب الموافقة على الخدمة"),
            },
          ]}
        >
          <Checkbox>الموافقة على هذا الخدمة</Checkbox>
        </Form.Item>

        <Form.Item>
          <Space>
            {!isEditing ? (
              <Button type="primary" size="large" onClick={handleEdit} className="rounded-lg">
                تعديل
              </Button>
            ) : (
              <>
                <Button type="primary" size="large" onClick={handleSave} className="rounded-lg">
                  حفظ
                </Button>
                <Button size="large" onClick={handleCancel} className="rounded-lg">
                  إلغاء
                </Button>
              </>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
