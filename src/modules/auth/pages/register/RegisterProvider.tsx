// src/modules/auth/pages/register/RegisterProvider.tsx
import { Card, Input, Button, Checkbox, Upload, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import type { UploadFile } from "antd/es/upload/interface";
import { InboxOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import AuthLayout from "@/modules/core/layouts/AuthLayout";

const { Dragger } = Upload;
const { Text } = Typography;

/* ----------------------------- Validation ----------------------------- */
const schema = z.object({
  providerName: z.string().min(3, "اسم المنشأة/المزوّد مطلوب"),
  documentNumber: z.string().min(1, "أدخل رقم الوثيقة"),
  phone: z.string().regex(/^05\d{8}$/, "أدخل رقم صحيح يبدأ بـ 05 (10 خانات)"),
  email: z.string().email("أدخل بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور 6 خانات على الأقل"),
  terms: z.boolean().refine((v) => v === true, {
    message: "يجب الموافقة على الشروط والأحكام",
  }),
});
type Form = z.infer<typeof schema>;

export default function RegisterProvider() {
  const navigate = useNavigate();

  /* ----------------------------- Upload state ----------------------------- */
  const [tagFile, setTagFile] = useState<UploadFile[]>([]);
  const [licenseFile, setLicenseFile] = useState<UploadFile[]>([]);
  const [insuranceFile, setInsuranceFile] = useState<UploadFile[]>([]);
  const [uploadErrors, setUploadErrors] = useState({
    tagFile: false,
    licenseFile: false,
    insuranceFile: false,
  });

  /* ---------------------------- React Hook Form --------------------------- */
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      providerName: "",
      documentNumber: "",
      phone: "",
      email: "",
      password: "",
      terms: false,
    },
    mode: "onSubmit",
  });

  const onSubmit = (_: Form) => {
    // تحقق من إلزامية المرفقات
    const errs = {
      tagFile: tagFile.length === 0,
      licenseFile: licenseFile.length === 0,
      insuranceFile: insuranceFile.length === 0,
    };
    setUploadErrors(errs);
    if (errs.tagFile || errs.licenseFile || errs.insuranceFile) return;

    // لاحقاً: استدعاء API للتسجيل
  };

  const commonDraggerProps = {
    beforeUpload: () => false,
    multiple: false,
    maxCount: 1,
    accept: ".pdf,.jpg,.jpeg,.png",
  };

  return (
    <AuthLayout onLoginClick={() => navigate("/login")}>
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-5xl">
          {/* عناوين الأعمدة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-start-1 text-right">
              <Text style={{ fontSize: 20, fontWeight: 700 }}>تسجيل مزود خدمة</Text>
            </div>
            <div className="sm:col-start-2">
              <Text
                className="!text-text-secondary"
                style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}
              >
                المستندات المطلوبة:
              </Text>
            </div>
          </div>

          {/* شبكة بعمودين: اليسار = المدخلات، اليمين = المستندات */}
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* المستندات (يمين) */}
            <div className="space-y-3 order-2 sm:col-start-2 sm:col-span-1">
              <div>
                <label className="block text-sm mb-1">TAG</label>
                <Dragger
                  {...commonDraggerProps}
                  fileList={tagFile}
                  onChange={({ fileList }) => {
                    setTagFile(fileList);
                    if (fileList.length > 0) setUploadErrors((p) => ({ ...p, tagFile: false }));
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">اضغط للتحميل</p>
                </Dragger>
                {uploadErrors.tagFile && <p className="text-red-600 text-xs mt-1">ملف TAG مطلوب</p>}
              </div>

              <div>
                <label className="block text-sm mb-1">الرخصة</label>
                <Dragger
                  {...commonDraggerProps}
                  fileList={licenseFile}
                  onChange={({ fileList }) => {
                    setLicenseFile(fileList);
                    if (fileList.length > 0) setUploadErrors((p) => ({ ...p, licenseFile: false }));
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">اضغط للتحميل</p>
                </Dragger>
                {uploadErrors.licenseFile && (
                  <p className="text-red-600 text-xs mt-1">ملف الرخصة مطلوب</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">وثيقة التأمين</label>
                <Dragger
                  {...commonDraggerProps}
                  fileList={insuranceFile}
                  onChange={({ fileList }) => {
                    setInsuranceFile(fileList);
                    if (fileList.length > 0)
                      setUploadErrors((p) => ({ ...p, insuranceFile: false }));
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">اضغط للتحميل</p>
                </Dragger>
                {uploadErrors.insuranceFile && (
                  <p className="text-red-600 text-xs mt-1">ملف وثيقة التأمين مطلوب</p>
                )}
              </div>
            </div>

            {/* المدخلات (يسار) */}
            <div className="space-y-3 order-1 sm:col-start-1 sm:col-span-1">
              <div>
                <label className="block text-sm mb-1">اسم الشركة الرسمي</label>
                <Controller
                  name="providerName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      status={errors.providerName ? "error" : undefined}
                      autoComplete="organization"
                    />
                  )}
                />
                {errors.providerName && (
                  <p className="text-red-600 text-xs mt-1">{errors.providerName.message}</p>
                )}
              </div>

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
                      autoComplete="off"
                    />
                  )}
                />
                {errors.documentNumber && (
                  <p className="text-red-600 text-xs mt-1">{errors.documentNumber.message}</p>
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
                      inputMode="email"
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

            {/* الموافقة + زر الإرسال أسفل النموذج */}
            <div className="col-span-1 sm:col-span-2 order-3">
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

            <div className="col-span-1 sm:col-span-2 order-4">
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
