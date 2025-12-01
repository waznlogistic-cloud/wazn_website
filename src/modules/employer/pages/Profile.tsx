import { useState, useEffect } from "react";
import { Form, Input, Button, Space, message, Tag, Modal } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/authContext";
import { getProfile, getEmployerProfile } from "@/services/profiles";
import { supabase } from "@/lib/supabase";
import { updatePassword } from "@/services/auth";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    phone?: string;
    email?: string;
    companyName?: string;
    documentNumber?: string;
    commercialReg?: string;
    taxNumber?: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Get fresh session to ensure we have latest auth data
      const { data: { session } } = await supabase.auth.getSession();
      
      // Try direct query first to bypass potential service issues
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: employerData } = await supabase
        .from("employers")
        .select("*")
        .eq("id", user.id)
        .single();

      // Use direct query results or fallback to service functions
      const profile = profileData || await getProfile(user.id).catch(() => null);
      const employer = employerData || await getEmployerProfile(user.id).catch(() => null);

      // Get phone/email from multiple sources with priority:
      // 1. profiles table (most reliable)
      // 2. session user (from auth)
      // 3. user object from context
      // 4. user metadata
      const phone = profile?.phone 
        || session?.user?.phone 
        || user.phone 
        || user.user_metadata?.phone 
        || "";
      
      const email = profile?.email 
        || session?.user?.email 
        || user.email 
        || "";

      // Build form values with proper fallbacks
      const formValues = {
        companyName: employer?.company_name || profile?.full_name || "",
        commercialReg: employer?.commercial_registration || "",
        taxNumber: employer?.tax_number || "",
        documentNumber: profile?.id_number || "",
        phone: phone,
        email: email,
      };
      
      // Store profile data in state for direct display
      const dataToStore = {
        phone: phone || undefined,
        email: email || undefined,
        companyName: formValues.companyName || undefined,
        documentNumber: formValues.documentNumber || undefined,
        commercialReg: formValues.commercialReg || undefined,
        taxNumber: formValues.taxNumber || undefined,
      };
      setProfileData(dataToStore);
      
      // Set form values directly without resetting
      // This ensures values are set even when form is disabled
      form.setFieldsValue(formValues);
      
      // Force a re-render by updating form values again after a short delay
      // This helps ensure Ant Design Form displays the values correctly
      setTimeout(() => {
        const currentValues = form.getFieldsValue();
        
        // If values are missing, set them again
        const needsUpdate = {
          phone: !currentValues.phone && formValues.phone,
          email: !currentValues.email && formValues.email,
        };
        
        if (needsUpdate.phone || needsUpdate.email) {
          const updateValues: any = {};
          if (needsUpdate.phone) updateValues.phone = formValues.phone;
          if (needsUpdate.email) updateValues.email = formValues.email;
          form.setFieldsValue(updateValues);
        }
      }, 300);
      
    } catch (error: any) {
      console.error("Error loading profile:", error);
      message.error("فشل تحميل البيانات");
      
      // Fallback: use auth user data
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const fallbackValues = {
          companyName: "",
          commercialReg: "",
          taxNumber: "",
          documentNumber: "",
          phone: session?.user?.phone || user?.phone || user?.user_metadata?.phone || "",
          email: session?.user?.email || user?.email || "",
        };
        form.resetFields();
        form.setFieldsValue(fallbackValues);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    console.log("Edit button clicked, setting isEditing to true");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Update profile table (personal info)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          id_number: values.documentNumber,
          phone: values.phone,
          email: values.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      // Update or create employer table (company info)
      const { error: employerError } = await supabase
        .from("employers")
        .upsert({
          id: user.id,
          company_name: values.companyName,
          commercial_registration: values.commercialReg,
          tax_number: values.taxNumber,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "id"
        });

      if (employerError) {
        throw employerError;
      }

      message.success("تم حفظ البيانات بنجاح!");
      setIsEditing(false);
      loadProfile();
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

  const handlePasswordUpdate = async () => {
    try {
      const values = await passwordForm.validateFields();
      
      if (values.newPassword !== values.confirmPassword) {
        message.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");
        return;
      }

      setPasswordLoading(true);
      await updatePassword(values.newPassword);
      message.success("تم تحديث كلمة المرور بنجاح!");
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (error: any) {
      console.error("Error updating password:", error);
      message.error(error?.message || "فشل تحديث كلمة المرور");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">المعلومات الشخصية</h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        disabled={!isEditing || loading}
        preserve={false}
      >
        <Form.Item
          name="companyName"
          label="اسم الشركة الرسمي"
          rules={[{ required: true, message: "يرجى إدخال اسم الشركة" }]}
        >
          <Input
            size="large"
            className="rounded-lg"
            placeholder="اسم الشركة الرسمي"
          />
        </Form.Item>

        <Form.Item
          name="documentNumber"
          label="رقم الوثيقة"
          rules={[{ required: true, message: "أدخل رقم الوثيقة" }]}
        >
          <Input
            size="large"
            className="rounded-lg"
            placeholder="000 000 000"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="رقم الهاتف"
          rules={[
            { required: true, message: "يرجى إدخال رقم الهاتف" },
            { pattern: /^05\d{8}$/, message: "أدخل رقم صحيح يبدأ بـ 05 (10 خانات)" },
          ]}
        >
          <div className="flex gap-2">
            <Input
              size="large"
              className="rounded-lg flex-1"
              placeholder={profileData?.phone || "05xxxxxxxx"}
              inputMode="tel"
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
          <div className="flex gap-2">
            <Input
              size="large"
              className="rounded-lg flex-1"
              placeholder={profileData?.email || "example@gmail.com"}
              type="email"
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
          name="password"
          label="كلمة المرور"
        >
          <div className="flex gap-2">
            <Input.Password
              size="large"
              className="rounded-lg flex-1"
              placeholder="XXXXXXX"
              disabled
            />
            <Button
              type="primary"
              className="h-10 px-4"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              تحديث
            </Button>
          </div>
        </Form.Item>

        <Form.Item
          name="commercialReg"
          label="السجل التجاري"
          rules={[{ required: true, message: "يرجى إدخال رقم السجل التجاري" }]}
        >
          <Input
            size="large"
            className="rounded-lg"
            placeholder="CR 000 000 0000"
          />
        </Form.Item>

        <Form.Item
          name="taxNumber"
          label="الرقم الضريبي"
          rules={[{ required: true, message: "يرجى إدخال الرقم الضريبي" }]}
        >
          <Input
            size="large"
            className="rounded-lg"
            placeholder="000 0000 000"
          />
        </Form.Item>

      </Form>

      {!isEditing && (
        <div className="mt-4">
          <Button 
            type="primary" 
            size="large" 
            onClick={handleEdit} 
            className="rounded-lg"
            disabled={loading}
          >
            تعديل
          </Button>
        </div>
      )}

      {isEditing && (
        <div className="mt-4 flex gap-2">
          <Button 
            type="primary" 
            size="large" 
            onClick={handleSave} 
            className="rounded-lg"
            loading={loading}
            style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
          >
            حفظ المعلومات
          </Button>
          <Button 
            size="large" 
            onClick={handleCancel}
            className="rounded-lg"
            disabled={loading}
          >
            إلغاء
          </Button>
        </div>
      )}

      {/* Password Update Modal */}
      <Modal
        title="تحديث كلمة المرور"
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
        className="rounded-lg"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordUpdate}
          className="mt-6"
        >
          <Form.Item
            name="currentPassword"
            label="كلمة المرور الحالية"
            rules={[{ required: true, message: "يرجى إدخال كلمة المرور الحالية" }]}
          >
            <Input.Password
              size="large"
              className="rounded-lg"
              placeholder="أدخل كلمة المرور الحالية"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="كلمة المرور الجديدة"
            rules={[
              { required: true, message: "يرجى إدخال كلمة المرور الجديدة" },
              { min: 6, message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
            ]}
          >
            <Input.Password
              size="large"
              className="rounded-lg"
              placeholder="أدخل كلمة المرور الجديدة"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="تأكيد كلمة المرور"
            rules={[
              { required: true, message: "يرجى تأكيد كلمة المرور" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("كلمة المرور الجديدة وتأكيدها غير متطابقين"));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              className="rounded-lg"
              placeholder="أعد إدخال كلمة المرور الجديدة"
            />
          </Form.Item>

          <Form.Item className="mt-6">
            <Space>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="rounded-lg"
                loading={passwordLoading}
                style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
              >
                تحديث كلمة المرور
              </Button>
              <Button
                size="large"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  passwordForm.resetFields();
                }}
                className="rounded-lg"
              >
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
