import { Card, Row, Col, Progress, Statistic, Space } from "antd";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getOrders } from "@/services/orders";
import { useAuth } from "@/contexts/authContext";
import CircleStat from "@/modules/core/components/CircleStat";

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    newOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const orders = await getOrders("employer", user.id);
      
      const totalOrders = orders.length;
      const newOrders = orders.filter((o) => o.status === "new").length;
      const inProgressOrders = orders.filter((o) => o.status === "in_progress").length;
      const completedOrders = orders.filter((o) => o.status === "delivered").length;
      const totalSpent = orders.reduce((sum, o) => sum + (o.price || 0), 0);

      setStats({
        totalOrders,
        newOrders,
        inProgressOrders,
        completedOrders,
        totalSpent,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = stats.totalOrders > 0 
    ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">لوحة التحكم</h2>
      </div>

      {/* Completion Rate */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card className="rounded-xl text-center">
            <h3 className="text-lg font-semibold mb-4">نسبة إتمام الطلبات</h3>
            <Progress
              type="dashboard"
              percent={completionRate}
              format={(percent) => `${percent}%`}
              size={180}
              strokeColor="#6E69D1"
            />
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card className="rounded-xl">
            <h3 className="text-lg font-semibold mb-4">ملخص تنفيذي</h3>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="إجمالي الطلبات"
                  value={stats.totalOrders}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: "#6E69D1" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="إجمالي الإنفاق"
                  value={stats.totalSpent}
                  prefix={<DollarOutlined />}
                  suffix="ريال"
                  valueStyle={{ color: "#6E69D1" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Order Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl text-center">
            <CircleStat
              value={stats.totalOrders}
              label="عدد الطلبات"
              color="#6E69D1"
              icon={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl text-center">
            <CircleStat
              value={stats.newOrders}
              label="طلبات جديدة"
              color="#1890ff"
              icon={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl text-center">
            <CircleStat
              value={stats.inProgressOrders}
              label="قيد التنفيذ"
              color="#faad14"
              icon={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl text-center">
            <CircleStat
              value={stats.completedOrders}
              label="مكتملة"
              color="#52c41a"
              icon={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

