import { Link } from "react-router-dom";
import { Button, Form, Input, App } from "antd";


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
  const { setRole } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);
      
      // Supabase auth uses email, so we'll use phone as email or find user by phone
      // First try to find user by phone in profiles table to get their email
      const { supabase } = await import("@/lib/supabase");
      
      // Normalize phone number (remove spaces, dashes, handle different formats)
      const normalizePhone = (phone: string) => {
        // Remove all non-digit characters except +
        let normalized = phone.replace(/[^\d+]/g, '');
        // Remove +966 or 966 prefix
        if (normalized.startsWith('+966')) {
          normalized = normalized.replace('+966', '0');
        }
        // Remove 966 prefix
        if (normalized.startsWith('966')) {
          normalized = '0' + normalized.replace('966', '');
        }
        // Ensure starts with 0
        if (!normalized.startsWith('0')) {
          normalized = '0' + normalized;
        }
        return normalized;
      };
      
      const normalizedPhone = normalizePhone(values.phone);
      
      // Try multiple phone formats
      const phoneVariations = [
        normalizedPhone,
        values.phone.trim(),
        values.phone.replace(/\s+/g, ''),
        `+966${normalizedPhone.substring(1)}`,
        `966${normalizedPhone.substring(1)}`,
      ];
      
      let profile = null;
      let profileError = null;
      
      // Try each phone format using secure function
      for (const phoneFormat of phoneVariations) {
        try {
          // Use secure function instead of direct table access
          const { data, error } = await supabase.rpc('get_user_email_by_phone', {
            phone_number: phoneFormat
          });
          
          // Log for debugging (console only, not visible to users)
          console.log(`[LOGIN DEBUG] Trying phone format: ${phoneFormat}`, { data, error });
          
          if (error) {
            // Check if it's a network error (including timeout errors)
            const errorMessage = error.message || '';
            const errorDetails = error.details || '';
            const isNetworkError = 
              errorMessage.includes('Failed to fetch') ||
              errorMessage.includes('ERR_CONNECTION') ||
              errorMessage.includes('ERR_QUIC') ||
              errorMessage.includes('ERR_CONNECTION_TIMED_OUT') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('NetworkError') ||
              errorDetails.includes('Failed to fetch') ||
              errorDetails.includes('ERR_CONNECTION') ||
              errorDetails.includes('timeout');
            
            if (isNetworkError) {
              // Network error - stop trying and show error to user
              setLoading(false);
              message.error("خطأ في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.");
              return;
            }
            
            console.error(`[LOGIN DEBUG] RPC error for ${phoneFormat}:`, error);
            profileError = error;
            // Continue to next format for non-network errors
            continue;
          }
          
          if (data && Array.isArray(data) && data.length > 0) {
            profile = data[0];
            console.log('[LOGIN DEBUG] Found profile:', profile);
            break;
          }
        } catch (rpcError: any) {
          // Check if it's a network error (including timeout errors)
          const errorMessage = rpcError?.message || '';
          const errorStack = rpcError?.stack || '';
          const isNetworkError = 
            errorMessage.includes('Failed to fetch') ||
            errorMessage.includes('ERR_CONNECTION') ||
            errorMessage.includes('ERR_QUIC') ||
            errorMessage.includes('ERR_CONNECTION_TIMED_OUT') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('NetworkError') ||
            errorStack.includes('ERR_CONNECTION_TIMED_OUT') ||
            errorStack.includes('Failed to fetch');
          
          if (isNetworkError) {
            // Network error - stop trying and show error to user
            setLoading(false);
            message.error("خطأ في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.");
            return;
          }
          
          console.error(`[LOGIN DEBUG] RPC call failed for ${phoneFormat}:`, rpcError);
          profileError = rpcError;
          continue;
        }
      }
      
      if (!profile || !profile.email) {
        console.error("Profile lookup error:", profileError);
        setLoading(false);
        message.error("لم يتم العثور على حساب بهذا الرقم. يرجى التحقق من رقم الهاتف أو إنشاء حساب جديد.");
        return;
      }
      
      const loginEmail = profile.email;
      const userRole = profile.role || "client";
      
      // Try login with email
      const loginResult = await login({
        email: loginEmail,
        password: values.password,
      });
      
      if (!loginResult.session) {
        setLoading(false);
        message.warning("يرجى التحقق من رقم الهاتف لتأكيد الحساب أولاً");
        return;
      }
      
      // Get user role from session
      const finalRole = loginResult.user?.user_metadata?.role || userRole || "client";
      
      // Update role in context
      setRole(finalRole as any);
      
      message.success("تم تسجيل الدخول بنجاح!");
      
      // Determine target route
      const roleRoutes: Record<string, string> = {
        client: "/client/profile",
        provider: "/provider/profile",
        driver: "/driver/profile",
        employer: "/employer/profile",
        admin: "/admin/home",
      };
      
      const targetRoute = roleRoutes[finalRole] || "/client/profile";
      
      // Reset loading before navigation
      setLoading(false);
      
      // Navigate immediately - auth context will update via onAuthStateChange
      setTimeout(() => {
        window.location.href = targetRoute;
      }, 500);
    } catch (error: any) {
      setLoading(false);
      
      let errorMessage = "فشل تسجيل الدخول. تحقق من البيانات المدخلة.";
      
      if (error?.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes("invalid login credentials") || errorMsg.includes("invalid password")) {
          errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.";
        } else if (errorMsg.includes("email not confirmed") || errorMsg.includes("phone not confirmed")) {
          errorMessage = "يرجى التحقق من رقم الهاتف لتأكيد الحساب";
        } else if (errorMsg.includes("user not found")) {
          errorMessage = "لم يتم العثور على حساب بهذا الرقم";
        } else {
          errorMessage = `خطأ في تسجيل الدخول: ${error.message}`;
        }
      }
      
      message.error(errorMessage);
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
