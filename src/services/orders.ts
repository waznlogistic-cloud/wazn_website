import { supabase } from "@/lib/supabase";
import type { Order } from "@/modules/core/types/order";

export interface CreateOrderData {
  ship_type: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  weight?: number;
  price?: number;
  delivery_method?: string;
  delivery_at?: string;
  client_id?: string;
  employer_id?: string;
  provider_id?: string;
}

/**
 * Get orders based on user role
 */
export async function getOrders(role: string, userId: string): Promise<Order[]> {
  // Join with providers table to get company name
  let query = supabase
    .from("orders")
    .select(`
      *,
      providers (
        company_name
      )
    `);

  if (role === "client") {
    query = query.eq("client_id", userId);
  } else if (role === "employer") {
    query = query.eq("employer_id", userId);
  } else if (role === "provider") {
    query = query.eq("provider_id", userId);
  } else if (role === "driver") {
    query = query.eq("driver_id", userId);
  }
  // Admin can see all (no filter)

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
  
  // Transform data to include company name from providers relation
  return (data || []).map((order: any) => ({
    ...order,
    company: order.providers?.company_name || "-",
  })) as Order[];
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return data as Order;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  // Generate tracking number
  const trackingNo = `WAZN${Date.now().toString().slice(-8)}`;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...orderData,
      tracking_no: trackingNo,
      status: "new",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order["status"]
): Promise<Order> {
  const updateData: any = { status };

  if (status === "delivered") {
    updateData.delivered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

/**
 * Assign order to driver
 */
export async function assignOrderToDriver(
  orderId: string,
  driverId: string
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({
      driver_id: driverId,
      status: "in_progress",
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(
  role: string,
  userId: string,
  status: Order["status"]
): Promise<Order[]> {
  let query = supabase
    .from("orders")
    .select("*")
    .eq("status", status);

  if (role === "client") {
    query = query.eq("client_id", userId);
  } else if (role === "employer") {
    query = query.eq("employer_id", userId);
  } else if (role === "provider") {
    query = query.eq("provider_id", userId);
  } else if (role === "driver") {
    query = query.eq("driver_id", userId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Order[];
}

/**
 * Get order by tracking number
 */
export async function getOrderByTrackingNo(trackingNo: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("tracking_no", trackingNo)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return data as Order;
}

