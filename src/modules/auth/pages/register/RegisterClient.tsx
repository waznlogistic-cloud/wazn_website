import { Card, Input, Button, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/modules/core/layouts/AuthLayout";

/* ----------------------------- Validation ----------------------------- */
// يدعم 05xxxxxxxx أو +9665xxxxxxxx
const saPhone = /^(?:05\d{8}|(?:\+?966)5\d{8})$/;

const schema = z.object({
  name: z.string().min(3, "اسم العميل مطلوب (3 أحرف على الأقل)"),
  idNumber: z
    .string()
    .min(9, "رقم الهوية/الإقامة يجب أن لا يقل عن 9 أرقام")
    .regex(/^\d{9,}$/, "أدخل أرقام فقط"),
  phone: z.string().regex(saPhone, "رقم سعودي صحيح (05xxxxxxxx أو +9665xxxxxxxx)"),
  email: z.string().email("أدخل بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور 6 خانات على الأقل"),
  address: z.string().min(1, "العنوان مطلوب"),
  terms: z.boolean().refine((v) => v === true, {
    message: "يجب الموافقة على الشروط والأحكام",
  }),
});

type Form = z.infer<typeof schema>;

export default function RegisterClient() {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      idNumber: "",
      phone: "",
      email: "",
      password: "",
      address: "",
      terms: false,
    },
    mode: "onSubmit",
  });

  const onSubmit = (data: Form) => {
    // مؤقتاً بدون باك إند
    // console.log("FORM OK", data);
  };

  return (
    <AuthLayout onLoginClick={() => navigate("/login")}>
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-5xl" title={<div className="text-right">تسجيل عميل</div>}>
          <form
            dir="rtl"
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* العمود الأيسر */}
            <div className="space-y-3 sm:col-start-1 sm:col-span-1">
              <div className="sm:max-w-md">
                <label className="block text-sm mb-1">اسم العميل</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} status={errors.name ? "error" : undefined} />
                  )}
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="sm:max-w-md">
                <label className="block text-sm mb-1">رقم الهوية / الإقامة</label>
                <Controller
                  name="idNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      inputMode="numeric"
                      status={errors.idNumber ? "error" : undefined}
                    />
                  )}
                />
                {errors.idNumber && (
                  <p className="text-red-600 text-xs mt-1">{errors.idNumber.message}</p>
                )}
              </div>

              <div className="sm:max-w-md">
                <label className="block text-sm mb-1">رقم الهاتف</label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="05xxxxxxxx أو +9665xxxxxxxx"
                      status={errors.phone ? "error" : undefined}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="sm:max-w-md">
                <label className="block text-sm mb-1">البريد الإلكتروني</label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@gmail.com"
                      status={errors.email ? "error" : undefined}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="sm:max-w-md">
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
            </div>

            {/* العمود الأيمن */}
            <div className="space-y-3 sm:col-start-2 sm:col-span-1">
              <div className="sm:max-w-md">
                <label className="block text-sm mb-1">العنوان</label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="اضغط هنا لاستعراض الخريطة"
                      status={errors.address ? "error" : undefined}
                    />
                  )}
                />
                {errors.address && (
                  <p className="text-red-600 text-xs mt-1">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* الشروط + زر */}
            <div className="col-span-1 sm:col-span-2">
              <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <span className="text-sm">الموافقة على الشروط والأحكام</span>
                  </div>
                )}
              />
              {errors.terms && <p className="text-red-600 text-xs mt-1">{errors.terms.message}</p>}
            </div>

            <div className="col-span-1 sm:col-span-2">
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
