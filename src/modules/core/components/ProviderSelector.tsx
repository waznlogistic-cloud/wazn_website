import { Select, Card, Space, Typography } from "antd";
import { TruckOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

interface Provider {
  id: string;
  name: string;
  logo?: string;
  enabled: boolean;
}

interface ProviderSelectorProps {
  value?: string;
  onChange?: (providerId: string) => void;
  providers?: Provider[];
}

const defaultProviders: Provider[] = [
  {
    id: "aramex",
    name: "Aramex",
    enabled: true,
  },
  {
    id: "redbox",
    name: "Redbox",
    enabled: false, // Not integrated yet
  },
  {
    id: "dhl",
    name: "DHL",
    enabled: false, // Not integrated yet
  },
];

export default function ProviderSelector({
  value,
  onChange,
  providers = defaultProviders,
}: ProviderSelectorProps) {
  const enabledProviders = providers.filter((p) => p.enabled);

  return (
    <div>
      <Select
        size="large"
        className="w-full rounded-lg"
        placeholder="اختر شركة الشحن"
        value={value}
        onChange={onChange}
        notFoundContent="لا توجد شركات متاحة"
      >
        {enabledProviders.map((provider) => (
          <Option key={provider.id} value={provider.id}>
            <Space>
              <TruckOutlined />
              <span>{provider.name}</span>
            </Space>
          </Option>
        ))}
      </Select>
      
      {value === "aramex" && (
        <Card className="mt-3" size="small">
          <Text type="secondary" className="text-xs">
            سيتم إنشاء الشحنة تلقائياً مع Aramex بعد تأكيد الدفع
          </Text>
        </Card>
      )}
    </div>
  );
}

