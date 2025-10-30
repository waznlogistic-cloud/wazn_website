import { Progress, Typography } from "antd";
const { Text } = Typography;

export default function CircleStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <Progress type="circle" percent={100} format={() => `${value} ريال`} size={140} />
      <Text>{label}</Text>
    </div>
  );
}
