import { Card, Input, Button, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/modules/core/layouts/AuthLayout";

/* ----------------------------- Validation ----------------------------- */
const schema = z.object({
  companyName: z.string().min(3, "اسم الشركة مطلوب"),
  commercialReg: z.string().min(5, "أدخل السجل التجاري"),
  taxNumber: z.string().min(5, "أدخل الرقم الضريبي"),
  documentNumber: z.string().min(5, "أدخل رقم الوثيقة"),
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

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "",
      commercialReg: "",
      taxNumber: "",
      documentNumber: "",
      address: "",
      phone: "",
      email: "",
      password: "",
      terms: false,
    },
    mode: "onSubmit",
  });

  const onSubmit = (_: Form) => {
    // لاحقاً: إرسال البيانات للباك إند
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

            {/* السجل التجاري */}
            <div>
              <label className="block text-sm mb-1">السجل التجاري</label>
              <Controller
                name="commercialReg"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="CR 000 000 0000"
                    status={errors.commercialReg ? "error" : undefined}
                  />
                )}
              />
              {errors.commercialReg && (
                <p className="text-red-600 text-xs mt-1">{errors.commercialReg.message}</p>
              )}
            </div>

            {/* رقم الوثيقة */}
            <div>
              <label className="block text-sm mb-1">رقم الوثيقة</label>
              <Controller
                name="documentNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="000 000 000"
                    status={errors.documentNumber ? "error" : undefined}
                  />
                )}
              />
              {errors.documentNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.documentNumber.message}</p>
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
                  loading={isSubmitting}
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
