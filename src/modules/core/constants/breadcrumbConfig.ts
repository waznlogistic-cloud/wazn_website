export type Crumb = { title: string; href?: string };

export function generateBreadcrumbItems(pathname: string) {
  // لاحقًا يمكن ربطها بترجمة أو خرائط أسماء
  const map: Record<string, string> = {
    "": "الرئيسية",
    orders: "الطلبات",
    partners: "الشركاء",
    users: "المستخدمون",
    login: "تسجيل الدخول",
  };

  const parts = pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);
  const crumbs: Crumb[] = [{ title: map[""] }];

  parts.forEach((p) => {
    crumbs.push({ title: map[p] ?? p });
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
