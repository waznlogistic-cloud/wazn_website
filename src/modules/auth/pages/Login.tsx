import { Link } from "react-router-dom";
import { Button, Form, Input } from "antd";
import Logo from "@/components/Logo";
import loginIcon from "@/assets/login_icon.svg";

type FormValues = {
  phone: string;
  password: string;
};

export default function Login() {
  const onFinish = (_values: FormValues) => {
    // TODO: لاحقاً ربط مع API الباك
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
                  <Button type="primary" htmlType="submit" size="large" block>
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
