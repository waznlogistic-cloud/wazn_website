import React from "react";
import { Layout, theme, Breadcrumb, Typography } from "antd";
import { useLocation } from "react-router-dom";
import Sidebar from "@/modules/core/components/Sidebar";
import AppHeader from "@/modules/core/components/AppHeader";
import { useAuth } from "@/contexts/authContext";
import {
  generateBreadcrumbItems,
  type PageTitleProps,
} from "@/modules/core/constants/breadcrumbConfig";

const { Content } = Layout;
const { Title, Text } = Typography;

type Props = {
  children: React.ReactNode;
  pageTitle?: PageTitleProps;
};

export default function MainLayout({ children, pageTitle }: Props) {
  const location = useLocation();
  const { role } = useAuth();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const renderPageTitle = () => {
    if (!pageTitle) return null;
    const { title, subtitle, layout = "start", className = "" } = pageTitle;

    if (layout === "center") {
      return (
        <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
          <Title level={2} className="!mb-0 !font-normal text-center">
            {title}
          </Title>
          {subtitle && <Text className="mt-2 text-center">{subtitle}</Text>}
        </div>
      );
    }

    return (
      <div className={`mb-3 ${className}`}>
        <Title level={4} className="!mb-0 !font-normal">
          {title}
        </Title>
        {subtitle && <Text className="block mt-1">{subtitle}</Text>}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar role={role} />

        <Layout style={{ background: "var(--color-background)" }}>
          <AppHeader />

          <Content style={{ margin: "0 16px" }}>
            <div style={{ margin: "16px 0", display: "flex", justifyContent: "flex-start" }}>
              <Breadcrumb items={generateBreadcrumbItems(location.pathname)} />
            </div>

            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              {renderPageTitle()}
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
