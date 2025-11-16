// src/config/sidebarConfig.ts
import {
  HomeOutlined,
  ShoppingOutlined,
  TeamOutlined,
  IdcardOutlined,
  BellOutlined,
  ReadOutlined,
  SettingOutlined,
  FileTextOutlined,
  DollarOutlined,
  CarOutlined,
  CameraOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

export type RoleKey = "admin" | "employer" | "provider" | "driver" | "client" | "guest";

export type SidebarItem = {
  key: string;
  label: string;
  path: string;
  icon: React.ComponentType<object>;
};

export const sidebarConfig: Record<RoleKey, SidebarItem[]> = {
  admin: [
    { key: "home", label: "الرئيسية", path: "/admin/home", icon: HomeOutlined },
    { key: "orders", label: "إدارة الطلبات", path: "/admin/orders", icon: ShoppingOutlined },
    { key: "companies", label: "إدارة الشركات", path: "/admin/companies", icon: TeamOutlined },
    { key: "customers", label: "إدارة العملاء", path: "/admin/customers", icon: IdcardOutlined },
    { key: "payments", label: "إدارة المدفوعات", path: "/admin/payments", icon: DollarOutlined },
    { key: "notifications", label: "الإشعارات", path: "/admin/notifications", icon: BellOutlined },
    { key: "terms", label: "الشروط والأحكام", path: "/admin/terms", icon: ReadOutlined },
  ],
  employer: [
    { key: "profile", label: "معلوماتي", path: "/employer/profile", icon: IdcardOutlined },
    { key: "orders", label: "الطلبات", path: "/employer/orders", icon: ShoppingOutlined },
    {
      key: "create",
      label: "إنشاء طلب جديد",
      path: "/employer/orders/new",
      icon: FileTextOutlined,
    },
    {
      key: "billing",
      label: "الفاتورة والمدفوعات",
      path: "/employer/billing",
      icon: DollarOutlined,
    },
    { key: "terms", label: "الشروط والأحكام", path: "/employer/terms", icon: ReadOutlined },
  ],
  provider: [
    { key: "profile", label: "معلوماتي", path: "/provider/profile", icon: IdcardOutlined },
    { key: "orders", label: "الطلبات", path: "/provider/orders", icon: ShoppingOutlined },
    { key: "drivers", label: "إدارة السائقين", path: "/provider/drivers", icon: CarOutlined },
    { key: "permits", label: "التراخيص", path: "/provider/permits", icon: FileTextOutlined },
    {
      key: "billing",
      label: "الفاتورة والمدفوعات",
      path: "/provider/billing",
      icon: DollarOutlined,
    },
    {
      key: "notifications",
      label: "الإشعارات",
      path: "/provider/notifications",
      icon: BellOutlined,
    },
    { key: "terms", label: "الشروط والأحكام", path: "/provider/terms", icon: ReadOutlined },
  ],
  driver: [
    { key: "profile", label: "معلوماتي", path: "/driver/profile", icon: IdcardOutlined },
    { key: "orders", label: "الطلبات", path: "/driver/orders", icon: ShoppingOutlined },
    { key: "proof", label: "إثبات التسليم", path: "/driver/proof", icon: CameraOutlined },
    { key: "billing", label: "الفاتورة والمدفوعات", path: "/driver/billing", icon: DollarOutlined },
    { key: "terms", label: "الشروط والأحكام", path: "/driver/terms", icon: ReadOutlined },
  ],
  client: [
    { key: "profile", label: "معلوماتي", path: "/client/profile", icon: IdcardOutlined },
    { key: "shipments", label: "شحناتي", path: "/client/shipments", icon: ShoppingOutlined },
    { key: "wallet", label: "المحفظة", path: "/client/wallet", icon: DollarOutlined },
    { key: "terms", label: "الشروط والأحكام", path: "/client/terms", icon: ReadOutlined },
  ],
  guest: [
    { key: "login", label: "تسجيل الدخول", path: "/login", icon: IdcardOutlined },
    { key: "register", label: "إنشاء حساب", path: "/select-user", icon: TeamOutlined },
  ],
};
