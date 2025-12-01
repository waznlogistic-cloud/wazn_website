export type OrderStatus = "new" | "in_progress" | "delivered" | "canceled";

export type Order = {
  id: string;
  tracking_no?: string;
  trackingNo?: string; // For compatibility
  ship_type?: string;
  shipType?: string; // For compatibility
  created_at?: string;
  createdAt?: string; // For compatibility
  delivery_at?: string;
  deliveryAt?: string; // For compatibility
  delivered_at?: string;
  deliveredAt?: string; // For compatibility
  company?: string;
  price?: number;
  weight?: number;
  shipperName?: string;
  shipperPhone?: string;
  sender_name?: string;
  senderName?: string; // For compatibility
  sender_phone?: string;
  senderPhone?: string; // For compatibility
  sender_address?: string;
  senderAddress?: string; // For compatibility
  receiver_name?: string;
  receiverName?: string; // For compatibility
  receiver_phone?: string;
  receiverPhone?: string; // For compatibility
  receiver_address?: string;
  receiverAddress?: string; // For compatibility
  status: OrderStatus;
  client_id?: string;
  provider_id?: string;
  driver_id?: string;
  employer_id?: string;
};
