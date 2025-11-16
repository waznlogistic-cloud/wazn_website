import { Card, Input, Button, Checkbox, Upload, Typography, message } from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, type JSX } from "react";
import AuthLayout from "@/modules/core/layouts/AuthLayout";
import { register } from "@/services/auth";
import { useAuth } from "@/contexts/authContext";

const { Dragger } = Upload;
const { Text } = Typography;

/* ----------------------------- Validation ----------------------------- */
// 05xxxxxxxx فقط (10 خانات). طوّرها لاحقاً لدعم +966 لو أردت.
const saPhone = /^05\d{8}$/;

const schema = z.object({
  driverName: z.string().min(3, "اسم السائق مطلوب (3 أحرف على الأقل)"),
  nationalId: z
    .string()
    .min(9, "رقم الهوية/الإقامة يجب أن لا يقل عن 9 أرقام")
    .regex(/^\d+$/, "أدخل أرقام فقط"),
  phone: z.string().regex(saPhone, "أدخل رقم صحيح يبدأ بـ 05 (10 خانات)"),
  email: z.string().email("أدخل بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور 6 خانات على الأقل"),
  terms: z.boolean().refine((v) => v === true, {
    message: "يجب الموافقة على الشروط والأحكام",
  }),
});

type Form = z.infer<typeof schema>;

export default function RegisterDriver(): JSX.Element {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const [loading, setLoading] = useState(false);

  // Upload state (local preview only)
  const [drivingLicense, setDrivingLicense] = useState<UploadFile[]>([]);
  const [vehicleLicense, setVehicleLicense] = useState<UploadFile[]>([]);
  const [transportLicense, setTransportLicense] = useState<UploadFile[]>([]);

  const [uploadErrors, setUploadErrors] = useState({
    drivingLicense: false,
    vehicleLicense: false,
    transportLicense: false,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      driverName: "",
      nationalId: "",
      phone: "",
      email: "",
      password: "",
      terms: false,
    },
    mode: "onSubmit",
  });

  const commonDraggerProps: UploadProps = useMemo(
    () => ({
      beforeUpload: () => false, // منع الرفع الحقيقي
      multiple: false,
      maxCount: 1,
      accept: ".pdf,.jpg,.jpeg,.png",
    }),
    []
  );

  async function onSubmit(data: Form): Promise<void> {
    // تحقق إلزامي من المرفقات
    const errs = {
      drivingLicense: drivingLicense.length === 0,
      vehicleLicense: vehicleLicense.length === 0,
      transportLicense: transportLicense.length === 0,
    };
    setUploadErrors(errs);

    if (errs.drivingLicense || errs.vehicleLicense || errs.transportLicense) return;

    try {
      setLoading(true);
      const result = await register({
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: "driver",
        metadata: {
          full_name: data.driverName,
          id_number: data.nationalId,
        },
      });
      
      // Set role in context immediately
      setRole("driver");
      
      // Check if session exists (email confirmation might be disabled)
      if (result.session) {
        message.success("تم إنشاء الحساب بنجاح!");
        // Small delay to ensure context is updated
        setTimeout(() => {
          navigate("/driver/profile");
        }, 100);
      } else {
        // Email confirmation required
        message.warning("تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.");
        navigate("/login");
      }
    } catch (error: any) {
      message.error(error?.message || "حدث خطأ أثناء إنشاء الحساب");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout onLoginClick={() => navigate("/login")}>
      <div className="min-h-screen flex items-center justify-center">
        <Card title="تسجيل سائق مستقل" className="w-full max-w-5xl">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* المرفقات (يسار في الديسكتوب) */}
            <div className="space-y-3 sm:order-2">
              <div className="mb-1">
                <Text
                  className="!text-text-secondary"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  المستندات المطلوبة:
                </Text>
              </div>

              <div>
                <label className="block text-sm mb-1">رخصة القيادة</label>
                <Dragger
                  {...commonDraggerProps}
                  fileList={drivingLicense}
                  onChange={({ fileList }) => {
                    setDrivingLicense(fileList);
                    if (fileList.length > 0)
                      setUploadErrors((p) => ({ ...p, drivingLicense: false }));
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">اضغط للتحميل</p>
                </Dragger>
                {uploadErrors.drivingLicense && (
                  <p className="text-red-600 text-xs mt-1">رخصة القيادة مطلوبة</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">رخصة المركبة</label>
                <Dragger
                  {...commonDraggerProps}
                  fileList={vehicleLicense}
                  onChange={({ fileList }) => {
                    setVehicleLicense(fileList);
                    if (fileList.length > 0)
                      setUploadErrors((p) => ({ ...p, vehicleLicense: false }));
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">اضغط للتحميل</p>
                </Dragger>
                {uploadErrors.vehicleLicense && (
                  <p className="text-red-600 text-xs mt-1">رخصة المركبة مطلوبة</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">رخصة النقل</label>
                <Dragger
                  {...commonDraggerProps}
                  fileList={transportLicense}
                  onChange={({ fileList }) => {
                    setTransportLicense(fileList);
                    if (fileList.length > 0)
                      setUploadErrors((p) => ({ ...p, transportLicense: false }));
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">اضغط للتحميل</p>
                </Dragger>
                {uploadErrors.transportLicense && (
                  <p className="text-red-600 text-xs mt-1">رخصة النقل مطلوبة</p>
                )}
              </div>
            </div>

            {/* الحقول (يمين في الديسكتوب) */}
            <div className="space-y-3 sm:order-1">
              <div>
                <label className="block text-sm mb-1">اسم السائق</label>
                <Controller
                  name="driverName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      status={errors.driverName ? "error" : undefined}
                      autoComplete="name"
                    />
                  )}
                />
                {errors.driverName && (
                  <p className="text-red-600 text-xs mt-1">{errors.driverName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">رقم الهوية / الإقامة</label>
                <Controller
                  name="nationalId"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="000 000 000"
                      status={errors.nationalId ? "error" : undefined}
                      inputMode="numeric"
                      autoComplete="off"
                    />
                  )}
                />
                {errors.nationalId && (
                  <p className="text-red-600 text-xs mt-1">{errors.nationalId.message}</p>
                )}
              </div>

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
                      autoComplete="tel"
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

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
                      autoComplete="email"
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

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
                      autoComplete="new-password"
                    />
                  )}
                />
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Terms + submit */}
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
