import { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, Space, message } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/authContext";
import { getProfile, updateProfile } from "@/services/profiles";

const { Option } = Select;

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
          clientName: profile.full_name,
          mobile: profile.phone,
          email: profile.email,
          idNumber: profile.id_number,
          birthDate: profile.date_of_birth ? dayjs(profile.date_of_birth) : undefined,
          nationality: profile.nationality,
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
        full_name: values.clientName,
        phone: values.mobile,
        email: values.email,
        id_number: values.idNumber,
        date_of_birth: values.birthDate?.format("YYYY-MM-DD"),
        nationality: values.nationality,
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
    loadProfile(); // Reload original data
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">معلوماتي الشخصية</h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        disabled={!isEditing || loading}
      >
        <Form.Item
          name="clientName"
          label="اسم العميل"
          rules={[{ required: true, message: "يرجى إدخال اسم العميل" }]}
        >
          <Input
            prefix={<UserOutlined />}
            size="large"
            className="rounded-lg"
            placeholder="اسم العميل"
          />
        </Form.Item>

        <Form.Item
          name="mobile"
          label="رقم الجوال"
          rules={[{ required: true, message: "يرجى إدخال رقم الجوال" }]}
        >
          <Input
            prefix={<PhoneOutlined />}
            size="large"
            className="rounded-lg"
            placeholder="رقم الجوال"
          />
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
          name="idNumber"
          label="رقم الهوية"
          rules={[{ required: true, message: "يرجى إدخال رقم الهوية" }]}
        >
          <Input
            prefix={<IdcardOutlined />}
            size="large"
            className="rounded-lg"
            placeholder="رقم الهوية"
          />
        </Form.Item>

        <Form.Item
          name="birthDate"
          label="تاريخ الميلاد"
          rules={[{ required: true, message: "يرجى اختيار تاريخ الميلاد" }]}
        >
          <DatePicker
            size="large"
            className="w-full rounded-lg"
            format="YYYY-MM-DD"
            placeholder="تاريخ الميلاد"
          />
        </Form.Item>

        <Form.Item
          name="nationality"
          label="الجنسية"
          rules={[{ required: true, message: "يرجى اختيار الجنسية" }]}
        >
          <Select size="large" className="rounded-lg" placeholder="الجنسية">
            <Option value="سعودي">سعودي</Option>
            <Option value="مصري">مصري</Option>
            <Option value="أردني">أردني</Option>
            <Option value="سوري">سوري</Option>
            <Option value="لبناني">لبناني</Option>
          </Select>
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
