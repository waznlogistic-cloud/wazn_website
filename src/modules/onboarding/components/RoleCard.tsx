import { Card } from "antd";

type Props = {
  title: string;
  selected?: boolean;
  onClick?: () => void;
};

export default function RoleCard({ title, selected = false, onClick }: Props) {
  return (
    <Card
      className={`
        h-32 cursor-pointer transition-all duration-300 border-0
        ${
          selected
            ? "ring-2 ring-[#6E69D1] shadow-lg"
            : "ring-1 ring-gray-200 hover:ring-2 hover:ring-[#6E69D1]/50"
        }
      `}
      bodyStyle={{
        height: "100%",
        padding: 0,
        background: "linear-gradient(135deg, #071833 0%, #6E69D1 45%, #6E69D1 100%)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClick}
    >
      <h3 className="text-white text-lg font-medium text-center m-0">{title}</h3>
    </Card>
  );
}
