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
  // Payment fields
  tap_charge_id?: string;
  payment_status?: string;
  payment_amount?: number;
  payment_currency?: string;
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
 * Create a new order with pending status
 * Aramex shipment creation is deferred until payment_status becomes 'paid'
 */
export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  // Generate tracking number
  const trackingNo = `WAZN${Date.now().toString().slice(-8)}`;

  // Create order in database with pending status
  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...orderData,
      tracking_no: trackingNo,
      status: "pending",
      // Payment fields
      tap_charge_id: orderData.tap_charge_id,
      payment_status: orderData.payment_status || "pending",
      payment_amount: orderData.payment_amount,
      payment_currency: orderData.payment_currency || "SAR",
    })
    .select()
    .single();

  if (error) throw error;

  return data as Order;
}

/**
 * Process a paid order by creating Aramex shipment if applicable
 * This function should be called when payment_status becomes 'paid'
 */
export async function processPaidOrder(orderId: string): Promise<Order | null> {
  // Fetch the order
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // Check if payment is paid
  if (order.payment_status !== "paid") {
    console.log(`Order ${orderId} payment_status is ${order.payment_status}, skipping Aramex shipment creation`);
    return null;
  }

  // Check if Aramex shipment already exists
  if (order.aramex_shipment_id || order.aramex_tracking_number) {
    console.log(`Order ${orderId} already has Aramex shipment, skipping`);
    return order;
  }

  // Check if Aramex integration is enabled and configured
  try {
    const { getIntegrationsConfig } = await import("@/config/integrations");
    const integrationsConfig = getIntegrationsConfig();
    
    // Validate all required Aramex fields are present
    if (
      !integrationsConfig.aramex.enabled ||
      !integrationsConfig.aramex.accountNumber ||
      !integrationsConfig.aramex.userName ||
      !integrationsConfig.aramex.password ||
      !integrationsConfig.aramex.accountPin ||
      !integrationsConfig.aramex.accountEntity ||
      !integrationsConfig.aramex.accountCountryCode
    ) {
      console.log(`Order ${orderId}: Aramex integration is disabled or not configured, skipping shipment creation`);
      return order; // Return order without Aramex shipment
    }
  } catch (configError: any) {
    console.warn(`Order ${orderId}: Failed to check Aramex configuration:`, configError);
    return order; // Return order without Aramex shipment if config check fails
  }

  // Prepare orderData from the order
  const orderData: CreateOrderData = {
    ship_type: order.ship_type,
    sender_name: order.sender_name,
    sender_phone: order.sender_phone,
    sender_address: order.sender_address,
    receiver_name: order.receiver_name,
    receiver_phone: order.receiver_phone,
    receiver_address: order.receiver_address,
    weight: order.weight,
    delivery_method: order.delivery_method,
    delivery_at: order.delivery_at,
    client_id: order.client_id,
    employer_id: order.employer_id,
    provider_id: order.provider_id,
    tap_charge_id: order.tap_charge_id,
    payment_status: order.payment_status,
    payment_amount: order.payment_amount,
    payment_currency: order.payment_currency,
  };

  // Create Aramex shipment
  try {
    return await createAramexShipment(order, orderData);
  } catch (aramexError: any) {
    // Log error but don't fail - order is already created and paid
    console.error(`Order ${orderId}: Failed to create Aramex shipment:`, aramexError);
    return order; // Return order without Aramex shipment
  }
}

/**
 * Create Aramex shipment for an order
 * Returns the updated order with Aramex fields, or null if update failed
 */
async function createAramexShipment(order: Order, orderData: CreateOrderData): Promise<Order | null> {
  // Dynamically import all Aramex-related modules to avoid loading them if not needed
  const [
    { aramexService },
    { parseAddressString, validateParsedAddress },
    { getProductGroup, getAramexProductMapping, getOperationsInstructions },
    { getIntegrationsConfig },
  ] = await Promise.all([
    import("@/services/aramex"),
    import("@/utils/addressParser"),
    import("@/config/aramexMappings"),
    import("@/config/integrations"),
  ]);

  // Ensure Aramex service is initialized (handle race condition with async initialization)
  if (!aramexService.isInitialized()) {
    const integrationsConfig = getIntegrationsConfig();
    if (
      integrationsConfig.aramex.enabled &&
      integrationsConfig.aramex.accountNumber &&
      integrationsConfig.aramex.userName &&
      integrationsConfig.aramex.password &&
      integrationsConfig.aramex.accountPin &&
      integrationsConfig.aramex.accountEntity &&
      integrationsConfig.aramex.accountCountryCode
    ) {
      // Initialize on-demand if not already initialized
      aramexService.initialize({
        accountNumber: integrationsConfig.aramex.accountNumber,
        userName: integrationsConfig.aramex.userName,
        password: integrationsConfig.aramex.password,
        accountPin: integrationsConfig.aramex.accountPin,
        accountEntity: integrationsConfig.aramex.accountEntity,
        accountCountryCode: integrationsConfig.aramex.accountCountryCode,
        apiUrl: integrationsConfig.aramex.apiUrl,
      });
    } else {
      throw new Error("Aramex integration is enabled but configuration is incomplete.");
    }
  }
  
  // Validate that addresses are provided
  if (!orderData.sender_address || orderData.sender_address.trim() === "") {
    throw new Error(
      "Sender address is required. Please provide a valid address with street, city, and country."
    );
  }
  if (!orderData.receiver_address || orderData.receiver_address.trim() === "") {
    throw new Error(
      "Receiver address is required. Please provide a valid address with street, city, and country."
    );
  }

  // Parse addresses
  let senderAddress: ParsedAddress;
  let receiverAddress: ParsedAddress;
  
  try {
    senderAddress = parseAddressString(orderData.sender_address);
  } catch (error: any) {
    throw new Error(
      `Invalid sender address: ${error.message || "Could not parse address"}. ` +
      `Please ensure the address includes street, city, and country (e.g., "King Fahd Road, Riyadh, Saudi Arabia").`
    );
  }
  
  try {
    receiverAddress = parseAddressString(orderData.receiver_address);
  } catch (error: any) {
    throw new Error(
      `Invalid receiver address: ${error.message || "Could not parse address"}. ` +
      `Please ensure the address includes street, city, and country (e.g., "Main Street, New York, USA").`
    );
  }

  // Validate parsed addresses have all required fields (line1, city, countryCode)
  if (!validateParsedAddress(senderAddress)) {
    throw new Error(
      `Invalid sender address: Missing required fields. ` +
      `Address must include street address (line1), city, and country. ` +
      `Received: line1="${senderAddress.line1}", city="${senderAddress.city}", countryCode="${senderAddress.countryCode}". ` +
      `Please ensure the address is complete (e.g., "King Fahd Road, Riyadh, Saudi Arabia").`
    );
  }
  
  if (!validateParsedAddress(receiverAddress)) {
    throw new Error(
      `Invalid receiver address: Missing required fields. ` +
      `Address must include street address (line1), city, and country. ` +
      `Received: line1="${receiverAddress.line1}", city="${receiverAddress.city}", countryCode="${receiverAddress.countryCode}". ` +
      `Please ensure the address is complete (e.g., "Main Street, New York, USA").`
    );
  }

  // Determine product group (DOM vs EXP) based on origin/destination countries
  const productGroup = getProductGroup(
    senderAddress.countryCode,
    receiverAddress.countryCode
  );

  // Get Aramex product mapping
  const productMapping = getAramexProductMapping(
    orderData.ship_type,
    orderData.delivery_method || "standard",
    productGroup
  );

  // Get operations instructions (for fragile/heavy)
  const operationsInstructions = getOperationsInstructions(orderData.ship_type);

  // Prepare Aramex shipment request
  const aramexRequest = {
    shipper: {
      name: orderData.sender_name,
      email: "", // Not provided in form, could be fetched from employer profile
      phone: orderData.sender_phone,
      cellPhone: orderData.sender_phone,
      line1: senderAddress.line1,
      line2: senderAddress.line2 || "",
      line3: "",
      city: senderAddress.city,
      stateOrProvinceCode: senderAddress.stateOrProvinceCode || "",
      postCode: senderAddress.postCode || "",
      countryCode: senderAddress.countryCode,
    },
    consignee: {
      name: orderData.receiver_name,
      email: "", // Not provided in form
      phone: orderData.receiver_phone,
      cellPhone: orderData.receiver_phone,
      line1: receiverAddress.line1,
      line2: receiverAddress.line2 || "",
      line3: "",
      city: receiverAddress.city,
      stateOrProvinceCode: receiverAddress.stateOrProvinceCode || "",
      postCode: receiverAddress.postCode || "",
      countryCode: receiverAddress.countryCode,
    },
    details: {
      numberOfPieces: 1, // Mandatory: Default to 1 piece
      weight: orderData.weight || 1, // Default to 1kg if not provided
      weightUnit: "KG" as const,
      productGroup: productMapping.productGroup,
      productType: productMapping.productType,
      paymentType: "P" as const, // Mandatory: P=Prepaid (shipper pays)
      services: productMapping.services,
      description: "Parcel", // Mandatory: DescriptionOfGoods - default to "Parcel"
      goodsOriginCountry: senderAddress.countryCode, // Mandatory: GoodsOriginCountry from shipper's country
    },
    reference: {
      reference1: order.id,
      reference2: order.tracking_no,
      reference3: `WAZN-${order.id}`,
    },
    shippingDateTime: new Date().toISOString(),
    dueDate: orderData.delivery_at,
    comments: operationsInstructions,
  };

  // Create shipment with Aramex
  const aramexResponse = await aramexService.createShipment(aramexRequest);

  // Check for errors in notifications
  // Note: Aramex API uses capitalized property names (Type, Message, Code)
  if (aramexResponse.notifications && aramexResponse.notifications.length > 0) {
    const errors = aramexResponse.notifications.filter((n: any) => n.Type === "Error");
    if (errors.length > 0) {
      const errorMessages = errors.map((e: any) => e.Message || e.message || JSON.stringify(e)).join(", ");
      throw new Error(`Aramex API error: ${errorMessages}`);
    }
  }

  if (aramexResponse.shipments && aramexResponse.shipments.length > 0) {
    const shipment = aramexResponse.shipments[0];

    // Extract delivery date from response if available
    // Note: ScheduledDelivery might be in the raw response but not in our interface
    // We'll parse it from the raw data if available
    let deliveryDate: string | null = null;
    try {
      // Try to get delivery date from DueDate in the request (Aramex calculates this)
      // The actual delivery date will be determined by Aramex based on service type
      // For now, we'll use the dueDate from the request
      if (aramexRequest.dueDate) {
        deliveryDate = aramexRequest.dueDate;
      }
    } catch (e) {
      console.warn("Could not extract delivery date from Aramex response:", e);
    }

    // Update order with Aramex tracking information and change status to 'new'
    const updateData: any = {
      aramex_shipment_id: shipment.id,
      aramex_tracking_number: shipment.trackingNumber || shipment.id,
      aramex_label_url: shipment.labelUrl,
      status: "new", // Change status from 'pending' to 'new' after shipment creation
    };

    // Add delivery date if available
    if (deliveryDate) {
      updateData.delivery_at = deliveryDate;
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update order with Aramex data:", updateError);
      throw updateError;
    }

    console.log("Aramex shipment created successfully:", {
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      deliveryDate,
    });

    // Return the updated order data
    return updatedOrder as Order;
  } else {
    throw new Error("Aramex API returned no shipments");
  }
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

