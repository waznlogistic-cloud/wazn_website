import { Progress, Typography } from "antd";
const { Text } = Typography;

export default function CircleStat({ label, value }: { label: string; value: number }) {
  // Format large numbers with commas
  const formattedValue = value.toLocaleString("ar-SA");
  
  return (
    <div style={{ textAlign: "center" }}>
      <Progress
        type="circle"
        percent={100}
        format={() => `${formattedValue} ر.س`}
        size={140}
        strokeColor="#6E69D1"
      />
      <Text className="block mt-2">{label}</Text>
    </div>
  );
}
