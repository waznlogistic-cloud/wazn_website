import { Card, Input, Button } from "antd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginForm } from "../validations/login";

type Props = { onSubmit: (data: LoginForm) => Promise<void> | void };

export default function AuthForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  return (
    <Card title="تسجيل الدخول" className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
          <Input
            {...register("phone")}
            placeholder="05xxxxxxxx"
            size="large"
            status={errors.phone ? "error" : undefined}
          />
          {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">رمز التحقق</label>
          <Input
            {...register("otp")}
            placeholder="أدخل رمز التحقق"
            size="large"
            status={errors.otp ? "error" : undefined}
          />
          {errors.otp && <p className="text-red-600 text-xs mt-1">{errors.otp.message}</p>}
        </div>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="w-full"
          loading={isSubmitting}
        >
          دخول
        </Button>
      </form>
    </Card>
  );
}
