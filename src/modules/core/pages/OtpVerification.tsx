import { Card, Input, Button, Typography } from "antd";
import type { InputRef } from "antd";
import { useState, useRef, useEffect } from "react";
import AuthLayout from "@/modules/core/layouts/AuthLayout";

const { Text } = Typography;

interface OtpVerificationProps {
  maskedPhone?: string;
}

export default function OtpVerification({ maskedPhone = "xxxxxx2394" }: OtpVerificationProps) {
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(InputRef | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return; // allow digits only

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    setError("");

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 4).split("");

    if (digits.length > 0) {
      const newOtpDigits = [...otpDigits];
      digits.forEach((digit, index) => {
        if (index < 4) {
          newOtpDigits[index] = digit;
        }
      });
      setOtpDigits(newOtpDigits);
      setError("");

      const nextIndex = Math.min(digits.length, 3);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleConfirm = async () => {
    const isComplete = otpDigits.every((digit) => digit !== "");
    if (!isComplete) {
      setError("يرجى إدخال الرمز كاملاً");
      return;
    }

    setIsSubmitting(true);
    try {
      // هنا تقدر تستدعي API بدون console
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    setOtpDigits(["", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
    // API لاسترجاع OTP جديد
  };

  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center">
        <Card title="أدخل رمز التحقق" className="w-full max-w-md">
          <div className="text-center space-y-6">
            {/* Description */}
            <Text className="text-gray-600 block">
              أدخل الرمز المرسل إلى هاتفك المنتهي بـ {maskedPhone}
            </Text>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-3">
              {otpDigits.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  maxLength={1}
                  size="large"
                  className="text-center text-lg w-12 h-12"
                  style={{ fontSize: "18px", fontWeight: "bold" }}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <Text type="danger" className="block text-sm">
                {error}
              </Text>
            )}

            {/* Confirm Button */}
            <Button
              type="primary"
              size="large"
              className="w-full"
              onClick={handleConfirm}
              loading={isSubmitting}
            >
              تأكيد
            </Button>

            {/* Resend Code */}
            <Button
              type="link"
              className="text-sm p-0"
              onClick={handleResend}
              disabled={isSubmitting}
            >
              إعادة إرسال الرمز
            </Button>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
}
