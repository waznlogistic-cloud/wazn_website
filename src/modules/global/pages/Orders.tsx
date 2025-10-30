import { useQuery } from "@tanstack/react-query";
import OrdersTable from "@/modules/core/components/OrdersTable";
import { getOrdersByRole } from "@/modules/core/services/ordersMock";

export default function GlobalOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders", "global"],
    queryFn: () => getOrdersByRole("global"),
    staleTime: 60_000,
  });

  return (
    <div dir="rtl">
      <h2 className="mb-4">طلبات الشحن العالمية</h2>
      <OrdersTable loading={isLoading} data={data ?? []} role="global" onView={() => {}} />
    </div>
  );
}
