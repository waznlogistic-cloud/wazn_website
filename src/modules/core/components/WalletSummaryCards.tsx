import { Card, Row, Col } from "antd";
import CircleStat from "./CircleStat";
import type { WalletSummary } from "@/modules/core/types/wallet";

export default function WalletSummaryCards({ summary }: { summary?: WalletSummary }) {
  if (!summary) return null;
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <CircleStat label="إجمالي الإيرادات" value={summary.totalIn} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <CircleStat label="المدفوعات المعلقة" value={summary.pending} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <CircleStat label="الرصيد المتاح" value={summary.balance} />
        </Card>
      </Col>
    </Row>
  );
}
