import { z } from "zod";

// Phone format based on placeholder: 05xxxxxxxx (starts with 05 and total 10 digits)
const saudiPhoneRegex = /^05\d{8}$/;

export const loginSchema = z.object({
  phone: z
    .string()
    .nonempty("رقم الهاتف مطلوب")
    .regex(saudiPhoneRegex, "الرجاء إدخال رقم بصيغة 05xxxxxxxx"),
  otp: z
    .string()
    .nonempty("رمز التحقق مطلوب")
    .regex(/^\d{4,6}$/, "رمز التحقق يجب أن يكون من 4 إلى 6 أرقام"),
});

export type LoginForm = z.infer<typeof loginSchema>;
