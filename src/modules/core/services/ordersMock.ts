import type { Order } from "@/modules/core/types/order";

const base: Order[] = Array.from({ length: 10 }).map((_, i) => ({
  id: String(i + 1),
  trackingNo: "0000000" + (i + 1),
  shipType: "شحن سريع",
  createdAt: "2025-02-08",
  deliveryAt: "2025-02-07",
  company: "Redbox",
  price: 80,
  shipperName: "محمد حسن",
  shipperPhone: "054552884",
  senderAddress: "26.52830690",
  receiverAddress: "26.52830690",
  status: "new",
}));

type Role = "admin" | "employer" | "provider" | "driver" | "client" | "global";

export function getOrdersByRole(role: Role): Promise<Order[]> {
  if (role === "global") {
    const globalList: Order[] = base.slice(0, 5).map((o, idx) => ({
      ...o,
      id: `G-${String(idx + 1).padStart(4, "0")}`,
      company: "Redbox",
      status: "new",
    }));
    return Promise.resolve(globalList);
  }
  return Promise.resolve(base);
}
