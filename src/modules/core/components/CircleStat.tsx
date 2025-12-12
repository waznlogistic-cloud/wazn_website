import { Progress, Typography } from "antd";
import { ReactNode } from "react";
const { Text } = Typography;

interface CircleStatProps {
  label: string;
  value: number;
  color?: string;
  icon?: ReactNode;
}

export default function CircleStat({ label, value, color = "#6E69D1", icon }: CircleStatProps) {
  // Format large numbers with commas
  const formattedValue = value.toLocaleString("ar-SA");
  
  return (
    <div style={{ textAlign: "center" }}>
      {icon && <div className="mb-2 text-2xl">{icon}</div>}
      <Progress
        type="circle"
        percent={100}
        format={() => formattedValue}
        size={140}
        strokeColor={color}
      />
      <Text className="block mt-2">{label}</Text>
    </div>
  );
}
