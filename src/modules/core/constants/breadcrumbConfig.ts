export type Crumb = { title: string; href?: string };

export function generateBreadcrumbItems(pathname: string) {
  // خريطة جميع المسارات بالعربية
  const map: Record<string, string> = {
    "": "الرئيسية",
    // Admin routes
    admin: "المسؤول",
    home: "الرئيسية",
    orders: "الطلبات",
    companies: "الشركات",
    customers: "العملاء",
    payments: "المدفوعات",
    notifications: "الإشعارات",
    terms: "الشروط والأحكام",
    // Client routes
    client: "العميل",
    shipments: "الشحنات",
    wallet: "المحفظة",
    profile: "معلوماتي",
    tracking: "تتبع الشحنة",
    "order-confirmation": "تأكيد الطلب",
    // Provider routes
    provider: "مزود الخدمة",
    drivers: "السائقين",
    permits: "التراخيص",
    billing: "الفاتورة والمدفوعات",
    // Driver routes
    driver: "السائق",
    proof: "إثبات التسليم",
    // Employer routes
    employer: "صاحب العمل",
    create: "إنشاء طلب جديد",
    new: "جديد",
    // Auth routes
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    "select-user": "اختيار نوع المستخدم",
    logout: "تسجيل الخروج",
    "otp-verification": "التحقق من الرمز",
    // Common
    partners: "الشركاء",
    users: "المستخدمون",
  };

  const parts = pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);
  const crumbs: Crumb[] = [{ title: map[""] || "الرئيسية" }];

  parts.forEach((p) => {
    const translated = map[p] || p;
    crumbs.push({ title: translated });
  });

  // AntD Breadcrumb v5 expects items: { title }
  return crumbs.map((c) => ({ title: c.title }));
}

export type PageTitleProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  layout?: "start" | "center";
  className?: string;
};
