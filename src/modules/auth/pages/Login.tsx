import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Input, message } from "antd";
import Logo from "@/components/Logo";
import loginIcon from "@/assets/login_icon.svg";
import { login } from "@/services/auth";
import { useAuth } from "@/contexts/authContext";
import { useState } from "react";

type FormValues = {
  phone: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);
      // Supabase auth uses email, so we'll use phone as email or find user by phone
      // First try to find user by phone in profiles table to get their email
      const { supabase } = await import("@/lib/supabase");
      
      let loginEmail = values.phone;
      let userRole = "client";
      
      // Try to find user by phone to get email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, role")
        .eq("phone", values.phone)
        .maybeSingle();
      
      if (profile && profile.email) {
        loginEmail = profile.email;
        userRole = profile.role || "client";
      } else if (!profile && profileError) {
        console.warn("Profile lookup error:", profileError);
      }
      
      // Try login with email
      const loginResult = await login({
        email: loginEmail,
        password: values.password,
      });
      
      if (!loginResult.session) {
        message.warning("يرجى التحقق من رقم الهاتف لتأكيد الحساب أولاً");
        return;
      }
      
      message.success("تم تسجيل الدخول بنجاح!");
      
      // Get user role from session
      const finalRole = loginResult.user?.user_metadata?.role || userRole || "client";
      setRole(finalRole as any);
      
      // Navigate based on role
      const roleRoutes: Record<string, string> = {
        client: "/client/profile",
        provider: "/provider/profile",
        driver: "/driver/profile",
        employer: "/employer/profile",
        admin: "/admin/home",
      };
      navigate(roleRoutes[finalRole] || "/client/profile");
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "فشل تسجيل الدخول. تحقق من البيانات المدخلة.";
      
      if (error?.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        } else         if (error.message.includes("Email not confirmed") || error.message.includes("Phone not confirmed")) {
          errorMessage = "يرجى التحقق من رقم الهاتف لتأكيد الحساب";
        } else {
          errorMessage = error.message;
        }
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0F1831] flex flex-col">
      {/* الشريط العلوي */}
      <div className="w-full flex items-center justify-between px-6 py-4">
        {/* يسار: شعار وزن */}
        <Logo className="h-10 w-auto" />
        {/* يمين: زر إنشاء حساب */}
        <Link to="/select-user">
          <Button type="default">إنشاء حساب</Button>
        </Link>
      </div>

      {/* الكارد في المنتصف */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* العمود الأول: النموذج */}
            <div className="bg-white p-6 md:p-10 order-1">
              <h1 className="text-2xl font-semibold text-right mb-6">تسجيل الدخول:</h1>

              <Form<FormValues>
                layout="vertical"
                onFinish={onFinish}
                className="text-right"
                autoComplete="off"
              >
                <Form.Item
                  label={<span className="font-medium">رقم الجوال</span>}
                  name="phone"
                  rules={[
                    { required: true, message: "يرجى إدخال رقم الجوال" },
                    {
                      pattern: /^(?:\+966|966)?0?5\d{8}$/,
                      message: "أدخل رقم سعودي صحيح يبدأ بـ 05",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="+966 00 000 0000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium">كلمة المرور</span>}
                  name="password"
                  rules={[{ required: true, message: "يرجى إدخال كلمة المرور" }]}
                >
                  <Input.Password
                    size="large"
                    placeholder="XXXXXX"
                    autoComplete="current-password"
                  />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                    تسجيل الدخول
                  </Button>
                </Form.Item>
              </Form>
            </div>

            {/* العمود الثاني: الصورة */}
            <div className="bg-white flex items-center justify-center p-6 md:p-10 order-2">
              <img
                src={loginIcon}
                alt="تسجيل الدخول"
                className="w-full max-w-sm h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
