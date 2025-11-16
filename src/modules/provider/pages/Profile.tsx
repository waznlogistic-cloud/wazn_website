import { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, Space, message } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/authContext";
import { getProfile, updateProfile } from "@/services/profiles";
import { supabase } from "@/lib/supabase";

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
          serviceProviderName: profile.full_name,
          username: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          idNumber: profile.id_number,
          birthDate: profile.date_of_birth ? dayjs(profile.date_of_birth) : undefined,
          nationality: profile.nationality,
        });
        
        // Load provider-specific data
        const { data: provider } = await supabase
          .from("providers")
          .select("company_name")
          .eq("id", user.id)
          .single();
        
        if (provider) {
          form.setFieldValue("serviceProviderName", provider.company_name);
        }
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
      
      // Update profile
      await updateProfile(user.id, {
        full_name: values.serviceProviderName,
        phone: values.phone,
        email: values.email,
        id_number: values.idNumber,
        date_of_birth: values.birthDate?.format("YYYY-MM-DD"),
        nationality: values.nationality,
      });
      
      // Update provider company name
      await supabase
        .from("providers")
        .update({ company_name: values.serviceProviderName })
        .eq("id", user.id);
      
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
      </div>

      <Form
        form={form}
        layout="vertical"
        disabled={!isEditing || loading}
      >
        <Form.Item
          name="serviceProviderName"
          label="اسم مزود الخدمة"
          rules={[{ required: true, message: "يرجى إدخال اسم مزود الخدمة" }]}
        >
          <Input
            prefix={<UserOutlined />}
            size="large"
            className="rounded-lg"
            placeholder="اسم مزود الخدمة"
          />
        </Form.Item>

        <Form.Item
          name="username"
          label="اسم المستخدم"
          rules={[{ required: true, message: "يرجى إدخال اسم المستخدم" }]}
        >
          <Input
            prefix={<UserOutlined />}
            size="large"
            className="rounded-lg"
            placeholder="اسم المستخدم"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="كلمة المرور"
          rules={[{ required: true, message: "يرجى إدخال كلمة المرور" }]}
        >
          <Input.Password
            size="large"
            className="rounded-lg"
            placeholder="كلمة المرور"
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
          name="phone"
          label="رقم الهاتف"
          rules={[{ required: true, message: "يرجى إدخال رقم الهاتف" }]}
        >
          <Input
            prefix={<PhoneOutlined />}
            size="large"
            className="rounded-lg"
            placeholder="رقم الهاتف"
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
