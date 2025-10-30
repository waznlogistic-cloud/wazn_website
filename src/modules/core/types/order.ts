export type OrderStatus = "new" | "in_progress" | "delivered" | "canceled";

export type Order = {
  id: string;
  trackingNo: string;
  shipType: string;
  createdAt: string;
  deliveryAt: string;
  company: string;
  price: number;
  shipperName?: string;
  shipperPhone?: string;
  senderAddress?: string;
  receiverAddress?: string;
  status: OrderStatus;
};
