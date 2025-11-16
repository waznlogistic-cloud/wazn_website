import { Card, Row, Col, Progress, Statistic, Space } from "antd";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import CircleStat from "@/modules/core/components/CircleStat";

export default function Home() {
  // Mock data - will be replaced with API calls
  const orderStats = {
    all: 90,
    new: 20,
    inProgress: 40,
    completed: 30,
  };

  const executiveSummary = {
    totalActions: 20000,
    totalProfits: 200000,
  };

  const customerSatisfaction = 70;

  // Mock weekly data for bar chart
  const weeklyOrders = [
    { week: "الاسبوع الأول", orders: 25 },
    { week: "الاسبوع الثاني", orders: 30 },
    { week: "الاسبوع الثالث", orders: 20 },
    { week: "الاسبوع الرابع", orders: 15 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">لوحة التحكم</h2>
      </div>

      {/* Customer Satisfaction */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card className="rounded-xl text-center">
            <h3 className="text-lg font-semibold mb-4">نسبة رضا العملاء</h3>
            <Progress
              type="dashboard"
              percent={customerSatisfaction}
              format={(percent) => `${percent}%`}
              size={180}
              strokeColor="#6E69D1"
            />
            <p className="mt-4 text-gray-600">عميل راضي</p>
          </Card>
        </Col>

        {/* Executive Summary */}
        <Col xs={24} md={16}>
          <Card className="rounded-xl">
            <h3 className="text-lg font-semibold mb-4">الملخص التنفيذي</h3>
            <Row gutter={[24, 24]} justify="center">
              <Col xs={12} md={8}>
                <CircleStat label="الإجراءات الكلية" value={executiveSummary.totalActions} />
              </Col>
              <Col xs={12} md={8}>
                <CircleStat label="إجمالي الأرباح" value={executiveSummary.totalProfits} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Monthly Orders Summary - Bar Chart */}
      <Card className="mb-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">ملخص الطلبات الشهري</h3>
        <Row gutter={[16, 16]}>
          {weeklyOrders.map((item, index) => (
            <Col xs={12} sm={6} key={index}>
              <div className="text-center">
                <div
                  className="bg-[#6E69D1] rounded-lg p-4 mb-2"
                  style={{ height: `${(item.orders / 30) * 200}px`, minHeight: "60px" }}
                >
                  <div className="text-white font-bold text-xl">{item.orders}</div>
                </div>
                <p className="text-sm text-gray-600">{item.week}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Orders Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="جميع الطلبات"
              value={orderStats.all}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#6E69D1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="الطلبات الجديدة"
              value={orderStats.new}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="الطلبات قيد التنفيذ"
              value={orderStats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="الطلبات المنفذة"
              value={orderStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
