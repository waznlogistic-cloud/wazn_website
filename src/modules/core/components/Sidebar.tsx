// src/modules/core/components/Sidebar.tsx
import { useMemo, useState } from "react";
import { Layout, Menu, Tooltip } from "antd";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { sidebarConfig, type RoleKey } from "@/config/sidebarConfig";
import { useAuth } from "@/contexts/authContext";
import { LogoutOutlined } from "@ant-design/icons";
import Logo from "@/assets/wazn logo.svg"; // <-- put your logo here

const { Sider } = Layout;

type Props = {
  role: RoleKey;
  onCollapsedChange?: (c: boolean) => void;
};

export default function Sidebar({ role, onCollapsedChange }: Props) {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem("wazn:sidebar") === "1"
  );
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const items = useMemo(() => sidebarConfig[role], [role]);

  const selectedKey = useMemo(() => {
    const active = items.find((it) => location.pathname.startsWith(it.path));
    return active?.key ?? items[0]?.key;
  }, [items, location.pathname]);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("wazn:sidebar", next ? "1" : "0");
      onCollapsedChange?.(next);
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      width={220}
      theme="dark"
      className="!bg-[#0E2A4D] flex flex-col"
      trigger={null}
      dir="rtl"
    >
      {/* Header with Wazn logo — click to toggle */}
      <div
        onClick={toggle}
        className="h-16 border-b border-white/10 flex items-center justify-center cursor-pointer select-none"
        title="تبديل القائمة"
      >
        {/* when collapsed: show logo only; when expanded: show logo + text if أردت */}
        <img src={Logo} alt="Wazn" className={collapsed ? "h-8 w-8" : "h-10"} />
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        className="!bg-[#0E2A4D] !border-e-0 flex-1"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const link = <NavLink to={item.path}>{item.label}</NavLink>;
          return (
            <Menu.Item key={item.key} icon={<Icon />}>
              {collapsed ? <Tooltip title={item.label}>{link}</Tooltip> : link}
            </Menu.Item>
          );
        })}
      </Menu>

      {/* Footer / Logout */}
      <div className="mt-auto py-3 px-3 border-t border-white/10">
        <Menu
          theme="dark"
          mode="inline"
          selectable={false}
          className="!bg-transparent"
          items={[
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: collapsed ? (
                <Tooltip title="تسجيل الخروج">
                  <span onClick={handleLogout}> </span>
                </Tooltip>
              ) : (
                <span onClick={handleLogout}>تسجيل الخروج</span>
              ),
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </Sider>
  );
}
