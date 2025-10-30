import { Layout } from "antd";

const { Header } = Layout;

export default function AppHeader() {
  return (
    <Header
      className="bg-white"
      style={{
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        display: "flex",
        alignItems: "center",
        paddingInline: 16,
        height: 64,
      }}
    >
      {/* ضع أي عناصر يمين/يسار لاحقًا (بحث، مستخدم، إشعارات) */}
      <div style={{ fontWeight: 500 }}>لوحة التحكم</div>
    </Header>
  );
}
