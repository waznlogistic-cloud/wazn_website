import { Card, Input, Button, Checkbox, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/modules/core/layouts/AuthLayout";
import { register } from "@/services/auth";
import { useAuth } from "@/contexts/authContext";
import { useState } from "react";

/* ----------------------------- Validation ----------------------------- */
const schema = z.object({
  companyName: z.string().min(3, "اسم الشركة مطلوب"),
  documentOrCommercialReg: z.string().min(5, "أدخل رقم الوثيقة/السجل التجاري"),
  taxNumber: z.string().min(5, "أدخل الرقم الضريبي"),
  address: z.string().min(3, "العنوان مطلوب"),
  phone: z.string().regex(/^05\d{8}$/, "أدخل رقم صحيح يبدأ بـ 05 (10 خانات)"),
  email: z.string().email("أدخل بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور 6 خانات على الأقل"),
  terms: z.boolean().refine((val) => val === true, {
    message: "يجب الموافقة على الشروط والأحكام",
  }),
});

type Form = z.infer<typeof schema>;

export default function RegisterEmployer() {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "",
      documentOrCommercialReg: "",
      taxNumber: "",
      address: "",
      phone: "",
      email: "",
      password: "",
      terms: false,
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: Form) => {
    try {
      setLoading(true);
      console.log("Starting registration...");
      
      const result = await register({
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: "employer",
        metadata: {
          full_name: data.companyName,
          id_number: data.documentOrCommercialReg,
          address: data.address,
          company_name: data.companyName,
          commercial_registration: data.documentOrCommercialReg,
          tax_number: data.taxNumber,
        },
      });
      
      console.log("Registration result:", result);
      console.log("Session exists:", !!result.session);
      console.log("User created:", !!result.user);
      
      // Set role in context immediately
      setRole("employer");
      
      // Check if session exists (email confirmation might be disabled)
      if (result.session) {
        console.log("Session found, redirecting to profile...");
        message.success("تم إنشاء الحساب بنجاح!");
        // Small delay to ensure context is updated
        setTimeout(() => {
          navigate("/employer/profile");
        }, 100);
      } else if (result.user) {
        // User created but no session (phone confirmation required)
        console.log("User created but no session - phone confirmation required");
        message.warning("تم إنشاء الحساب! يرجى التحقق من رقم الهاتف لتأكيد الحساب. سيتم إرسال رمز التحقق عبر SMS.");
        // Redirect to OTP verification page or login
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        console.error("No user or session returned");
        message.error("حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });
      message.error(error?.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout onLoginClick={() => navigate("/login")}>
      <div className="min-h-screen flex items-center justify-center">
        <Card title="تسجيل صاحب العمل" className="w-full max-w-5xl">
          <form
            dir="rtl"
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* اسم الشركة الرسمي */}
            <div>
              <label className="block text-sm mb-1">اسم الشركة الرسمي</label>
              <Controller
                name="companyName"
                control={control}
                render={({ field }) => (
                  <Input {...field} status={errors.companyName ? "error" : undefined} />
                )}
              />
              {errors.companyName && (
                <p className="text-red-600 text-xs mt-1">{errors.companyName.message}</p>
              )}
            </div>

            {/* رقم الوثيقة/السجل التجاري */}
            <div>
              <label className="block text-sm mb-1">رقم الوثيقة/السجل التجاري</label>
              <Controller
                name="documentOrCommercialReg"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="000 000 000 أو CR 000 000 0000"
                    status={errors.documentOrCommercialReg ? "error" : undefined}
                  />
                )}
              />
              {errors.documentOrCommercialReg && (
                <p className="text-red-600 text-xs mt-1">{errors.documentOrCommercialReg.message}</p>
              )}
            </div>

            {/* الرقم الضريبي */}
            <div>
              <label className="block text-sm mb-1">الرقم الضريبي</label>
              <Controller
                name="taxNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="000 0000 000"
                    status={errors.taxNumber ? "error" : undefined}
                  />
                )}
              />
              {errors.taxNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.taxNumber.message}</p>
              )}
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-sm mb-1">رقم الهاتف</label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="05xxxxxxxx"
                    status={errors.phone ? "error" : undefined}
                    inputMode="tel"
                  />
                )}
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* العنوان */}
            <div>
              <label className="block text-sm mb-1">العنوان</label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="الرياض، حي ..."
                    status={errors.address ? "error" : undefined}
                  />
                )}
              />
              {errors.address && (
                <p className="text-red-600 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm mb-1">البريد الإلكتروني</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="example@gmail.com"
                    status={errors.email ? "error" : undefined}
                    type="email"
                  />
                )}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm mb-1">كلمة المرور</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="XXXXXXXX"
                    status={errors.password ? "error" : undefined}
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* الشروط + زر الإرسال */}
            <div className="col-span-1 sm:col-span-2 order-last">
              <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <span className="text-sm">الموافقة على الشروط والأحكام.</span>
                  </div>
                )}
              />
              {errors.terms && <p className="text-red-600 text-xs mt-1">{errors.terms.message}</p>}
            </div>

            <div className="col-span-1 sm:col-span-2 order-last">
              <div className="flex justify-center">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full sm:w-60"
                  loading={loading}
                >
                  إنشاء الحساب
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </AuthLayout>
  );
}
