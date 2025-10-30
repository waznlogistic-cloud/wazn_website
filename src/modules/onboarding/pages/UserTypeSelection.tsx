import { useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/modules/core/layouts/AuthLayout";
import RoleCard from "../components/RoleCard";

type RoleValue = "provider" | "owner" | "client" | "driver";

const ROLES: { value: RoleValue; label: string }[] = [
  { value: "provider", label: "مزود خدمة" },
  { value: "owner", label: "صاحب عمل" },
  { value: "client", label: "عميل" },
  { value: "driver", label: "سائق مستقل" },
];

const ROLE_ROUTE: Record<RoleValue, string> = {
  provider: "/register/provider",
  owner: "/register/employer",
  client: "/register/client",
  driver: "/register/driver",
};

export default function UserTypeSelection() {
  const [selected, setSelected] = useState<RoleValue | null>(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleContinueAsGuest = () => {
    // no-op for now
  };

  const handleContinue = () => {
    if (!selected) return;
    navigate(ROLE_ROUTE[selected]);
  };

  return (
    <AuthLayout onLoginClick={handleLogin}>
      <div className="w-full flex items-center justify-between mb-6">
        <div />
        <h2 className="text-lg font-semibold text-gray-700">
          لديك حساب مسبق؟ سجل دخولك الآن أو أنشئ حساب
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {ROLES.map((r) => (
          <RoleCard
            key={r.value}
            title={r.label}
            selected={selected === r.value}
            onClick={() => setSelected(r.value)}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleContinueAsGuest}
          className="text-[#6E69D1] hover:underline"
        >
          الاستمرار كزائر
        </button>

        <Button type="primary" className="px-6" onClick={handleContinue} disabled={!selected}>
          تابع الصفحة
        </Button>
      </div>
    </AuthLayout>
  );
}
