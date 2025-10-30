import { Button } from "antd";
import Logo from "@/components/Logo";

type Props = {
  children: React.ReactNode;
  onLoginClick?: () => void;
};

export default function AuthLayout({ children, onLoginClick }: Props) {
  return (
    <div className="min-h-screen bg-[#0F1831]" dir="rtl">
      {/* Top Header */}
      <div className="flex justify-between items-center p-6">
        {/* Wazn logo on the right */}
        <Logo className="h-10 w-auto" />

        {/* Login button - positioned on the left */}
        <Button
          type="default"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30 rounded-lg px-6"
          onClick={onLoginClick}
        >
          تسجيل الدخول
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex justify-center px-4">
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg mt-8 p-8">{children}</div>
      </div>
    </div>
  );
}
