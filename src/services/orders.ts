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
 * Atomically claim the right to create a shipment for an order
 * This prevents race conditions when multiple processes try to create shipments simultaneously
 * Sets a temporary lock in the shipment fields to prevent concurrent execution
 * Returns { success: true, lockValue: string } if claim succeeded, { success: false } if already claimed
 */
async function atomicallyClaimShipmentCreation(
  orderId: string,
  providerType: "aramex" | "mrsool"
): Promise<{ success: boolean; lockValue?: string }> {
  // Generate a unique lock value using timestamp and random string
  const lockValue = `IN_PROGRESS_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Use an atomic UPDATE that sets a temporary lock in the appropriate shipment field
  // This prevents race conditions when both client-side and webhook try to create shipments
  // The lock is set in the shipment_id field, which will be updated with the real value after external API call
  const lockField = providerType === "aramex" ? "aramex_shipment_id" : "mrsool_order_id";
  const trackingField = providerType === "aramex" ? "aramex_tracking_number" : "mrsool_tracking_number";
  
  const updateData: any = {
    [lockField]: lockValue, // Set temporary lock
    updated_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .eq("payment_status", "paid") // Only process paid orders
    .is("aramex_shipment_id", null) // Ensure Aramex shipment doesn't exist
    .is("aramex_tracking_number", null)
    .is("mrsool_order_id", null) // Ensure Mrsool shipment doesn't exist
    .is("mrsool_tracking_number", null)
    .select("id"); // Select to check if any rows were affected

  if (error) {
    console.warn(`Order ${orderId}: Failed to atomically claim shipment creation:`, error);
    // On error, assume claim failed to be safe
    return { success: false };
  }

  // If data is empty or null, another process already claimed it or shipment exists
  // If data has items, we successfully claimed it
  if (data !== null && data.length > 0) {
    return { success: true, lockValue };
  }
  
  return { success: false };
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
  let order = await getOrderById(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // Check if payment is paid
  if (order.payment_status !== "paid") {
    console.log(`Order ${orderId} payment_status is ${order.payment_status}, skipping processing`);
    return null;
  }

  // Check if shipment already exists (Aramex or Mrsool)
  // Use atomic check-and-claim to prevent race conditions
  const shipmentExists = 
    order.aramex_shipment_id ||
    order.aramex_tracking_number ||
    order.mrsool_order_id ||
    order.mrsool_tracking_number;

  if (shipmentExists) {
    const providerType = order.aramex_shipment_id || order.aramex_tracking_number ? "Aramex" : "Mrsool";
    console.log(`Order ${orderId} already has ${providerType} shipment, skipping`);
    // Update status to 'new' if still pending (shipment already exists, so order is ready)
    if (order.status === "pending") {
      const { data: updatedOrder, error: statusUpdateError } = await supabase
        .from("orders")
        .update({ status: "new" })
        .eq("id", orderId)
        .select()
        .single();
      if (updatedOrder) {
        return updatedOrder as Order;
      }
      // If update failed, refetch order to get current status
      if (statusUpdateError) {
        console.error(`Order ${orderId}: Failed to update status to 'new':`, statusUpdateError);
        const refreshedOrder = await getOrderById(orderId);
        if (refreshedOrder) {
          return refreshedOrder;
        }
      }
    }
    return order;
  }

  // Fetch provider to determine which shipment service to use
  // This must happen BEFORE atomic claim to know which field to lock
  let providerCompanyName = "";
  if (order.provider_id) {
    try {
      const { data: provider, error: providerError } = await supabase
        .from("providers")
        .select("company_name")
        .eq("id", order.provider_id)
        .single();

      if (providerError) {
        console.warn(`Order ${orderId}: Failed to fetch provider:`, providerError);
      } else if (provider) {
        providerCompanyName = provider.company_name || "";
      }
    } catch (error) {
      console.warn(`Order ${orderId}: Error fetching provider:`, error);
    }
  }

  // Determine provider type (Aramex or Mrsool)
  const providerCompanyNameUpper = providerCompanyName.toUpperCase();
  const isAramex = providerCompanyNameUpper.includes("ARAMEX");
  const isMrsool = providerCompanyNameUpper.includes("MRSOOL");
  
  // If no provider_id or provider not recognized, skip shipment creation
  if (!order.provider_id || (!isAramex && !isMrsool)) {
    console.log(`Order ${orderId}: No recognized provider (provider_id: ${order.provider_id}, company_name: ${providerCompanyName}), updating status to 'new'`);
    // Update status to 'new' if still pending
    if (order.status === "pending") {
      const { data: updatedOrder, error: statusUpdateError } = await supabase
        .from("orders")
        .update({ status: "new" })
        .eq("id", orderId)
        .select()
        .single();

      if (statusUpdateError) {
        console.error(`Order ${orderId}: Failed to update status to 'new':`, statusUpdateError);
        const refreshedOrder = await getOrderById(orderId);
        if (refreshedOrder) {
          return refreshedOrder;
        }
        return order;
      } else if (updatedOrder) {
        return updatedOrder as Order;
      }
    }
    return order;
  }

  // Check integration configuration based on provider type
  // This must happen BEFORE atomic claim to avoid locking unnecessarily
  let shouldCreateShipment = false;
  try {
    const { getIntegrationsConfig } = await import("@/config/integrations");
    const integrationsConfig = getIntegrationsConfig();
    
    if (isAramex) {
      // Validate all required Aramex fields are present
      if (
        integrationsConfig.aramex.enabled &&
        integrationsConfig.aramex.accountNumber &&
        integrationsConfig.aramex.userName &&
        integrationsConfig.aramex.password &&
        integrationsConfig.aramex.accountPin &&
        integrationsConfig.aramex.accountEntity &&
        integrationsConfig.aramex.accountCountryCode
      ) {
        shouldCreateShipment = true;
      } else {
        console.log(`Order ${orderId}: Aramex integration is disabled or not configured, skipping shipment creation`);
      }
    } else if (isMrsool) {
      // Validate all required Mrsool fields are present
      if (
        integrationsConfig.mrsool.enabled &&
        integrationsConfig.mrsool.apiKey
      ) {
        shouldCreateShipment = true;
      } else {
        console.log(`Order ${orderId}: Mrsool integration is disabled or not configured, skipping shipment creation`);
      }
    }
  } catch (configError: any) {
    console.warn(`Order ${orderId}: Failed to check integration configuration:`, configError);
  }

  // If integration is not enabled/configured for the selected provider, update status to 'new' immediately
  // Return regardless of current status to prevent falling through to shipment creation
  if (!shouldCreateShipment) {
    // Only update status if it's still 'pending' (don't overwrite if already 'new' or other status)
    if (order.status === "pending") {
      const { data: updatedOrder, error: statusUpdateError } = await supabase
        .from("orders")
        .update({ status: "new" })
        .eq("id", orderId)
        .select()
        .single();

      if (statusUpdateError) {
        console.error(`Order ${orderId}: Failed to update status to 'new':`, statusUpdateError);
        const refreshedOrder = await getOrderById(orderId);
        if (refreshedOrder) {
          return refreshedOrder;
        }
        return order;
      } else if (updatedOrder) {
        order = updatedOrder as Order;
        console.log(`Order ${orderId} status updated from 'pending' to 'new' (${isAramex ? 'Aramex' : isMrsool ? 'Mrsool' : 'Unknown'} integration not configured)`);
      }
    } else {
      console.log(`Order ${orderId}: Integration not configured, skipping shipment creation (status: ${order.status})`);
    }
    return order;
  }

  // Atomically claim the right to create shipment by setting a lock in the shipment field
  // This prevents race conditions when both client-side and webhook try to create shipments
  // The lock is set BEFORE external API calls to prevent duplicate shipments
  const providerType = isAramex ? "aramex" : "mrsool";
  const claimResult = await atomicallyClaimShipmentCreation(orderId, providerType);
  if (!claimResult.success) {
    // Another process already claimed it or shipment was created, refetch order
    console.log(`Order ${orderId}: Shipment creation already claimed by another process, refetching order`);
    const refreshedOrder = await getOrderById(orderId);
    if (refreshedOrder) {
      // Check if shipment was created
      if (
        refreshedOrder.aramex_shipment_id ||
        refreshedOrder.aramex_tracking_number ||
        refreshedOrder.mrsool_order_id ||
        refreshedOrder.mrsool_tracking_number
      ) {
        return refreshedOrder;
      }
    }
    // If we can't refetch or shipment wasn't created, return original order
    return order;
  }
  
  // Store the lock value to verify we still own the lock when updating
  const lockValue = claimResult.lockValue!;

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

  // Route to appropriate shipment creation function based on provider
  // Pass lockValue to verify we still own the lock when updating
  try {
    if (isAramex) {
      // Create Aramex shipment
      // Status will be updated to 'new' inside createAramexShipment on success
      return await createAramexShipment(order, orderData, lockValue);
    } else if (isMrsool) {
      // Create Mrsool shipment
      // Status will be updated to 'new' inside createMrsoolShipment on success
      return await createMrsoolShipment(order, orderData, lockValue);
    } else {
      // Should not reach here due to check above, but handle gracefully
      console.warn(`Order ${orderId}: Unknown provider type, updating status to 'new'`);
      if (order.status === "pending") {
        const { data: updatedOrder } = await supabase
          .from("orders")
          .update({ status: "new" })
          .eq("id", orderId)
          .select()
          .single();
        if (updatedOrder) {
          return updatedOrder as Order;
        }
      }
      return order;
    }
  } catch (shipmentError: any) {
    // Log error but don't fail - order is already created and paid
    // Release the lock by clearing the temporary lock value
    try {
      const lockField = providerType === "aramex" ? "aramex_shipment_id" : "mrsool_order_id";
      await supabase
        .from("orders")
        .update({ [lockField]: null })
        .eq("id", orderId)
        .eq(lockField, lockValue); // Only clear if we still own the lock
    } catch (lockReleaseError) {
      console.warn(`Order ${orderId}: Failed to release shipment creation lock:`, lockReleaseError);
    }
    
    // Don't update status to 'new' if shipment creation failed - keep it as 'pending' for retry
    console.error(`Order ${orderId}: Failed to create shipment (${isAramex ? 'Aramex' : isMrsool ? 'Mrsool' : 'Unknown'}):`, shipmentError);
    // Return order with original status (still 'pending') so it can be retried
    return order;
  }
}

/**
 * Create Aramex shipment for an order
 * Returns the updated order with Aramex fields, or null if update failed
 */
async function createAramexShipment(
  order: Order,
  orderData: CreateOrderData,
  lockValue: string
): Promise<Order | null> {
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

  // Fetch employer email from session or profile
  let shipperEmail = "";
  try {
    // First, try to get email from current session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && orderData.employer_id === session.user.id) {
      shipperEmail = session.user.email || "";
    }
    
    // If no email from session or employer_id doesn't match, fetch from profile
    if (!shipperEmail && orderData.employer_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", orderData.employer_id)
        .single();
      
      if (profile?.email) {
        shipperEmail = profile.email;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch employer email for Aramex shipment:", error);
    // Continue with empty email if fetch fails
  }

  // Prepare Aramex shipment request
  const aramexRequest = {
    shipper: {
      name: orderData.sender_name,
      email: shipperEmail,
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

    // Update order with real shipment data, but only if we still own the lock
    // This ensures we don't overwrite if another process already created the shipment
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order.id)
      .eq("aramex_shipment_id", lockValue) // Only update if we still own the lock
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update order with Aramex data:", updateError);
      // Release the lock on update failure
      try {
        await supabase
          .from("orders")
          .update({ aramex_shipment_id: null })
          .eq("id", order.id)
          .eq("aramex_shipment_id", lockValue);
      } catch (lockReleaseError) {
        console.warn(`Order ${order.id}: Failed to release shipment creation lock:`, lockReleaseError);
      }
      throw updateError;
    }

    if (!updatedOrder) {
      // Update didn't affect any rows - another process may have created shipment
      // Release the lock
      try {
        await supabase
          .from("orders")
          .update({ aramex_shipment_id: null })
          .eq("id", order.id)
          .eq("aramex_shipment_id", lockValue);
      } catch (lockReleaseError) {
        console.warn(`Order ${order.id}: Failed to release shipment creation lock:`, lockReleaseError);
      }
      throw new Error("Failed to update order with Aramex shipment data - another process may have created shipment");
    }

    console.log("Aramex shipment created successfully:", {
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      deliveryDate,
    });

    // Return the updated order data
    return updatedOrder as Order;
  } else {
    // No shipments returned - release the lock
    try {
      await supabase
        .from("orders")
        .update({ aramex_shipment_id: null })
        .eq("id", order.id)
        .eq("aramex_shipment_id", lockValue);
    } catch (lockReleaseError) {
      console.warn(`Order ${order.id}: Failed to release shipment creation lock:`, lockReleaseError);
    }
    throw new Error("Aramex API returned no shipments");
  }
}

/**
 * Geocode an address to get latitude and longitude
 * Uses Nominatim (OpenStreetMap) geocoding service
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Use Nominatim geocoding API (free, no API key required)
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "Wazn Platform", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      console.warn(`Geocoding failed for address: ${address}`);
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.warn(`Geocoding error for address: ${address}:`, error);
    return null;
  }
}

/**
 * Create Mrsool shipment for an order
 * Returns the updated order with Mrsool fields, or null if update failed
 */
async function createMrsoolShipment(
  order: Order,
  orderData: CreateOrderData,
  lockValue: string
): Promise<Order | null> {
  try {
    // Dynamically import Mrsool service
    const [{ mrsoolService }, { getIntegrationsConfig }] = await Promise.all([
      import("@/services/mrsool"),
      import("@/config/integrations"),
    ]);

    const integrationsConfig = getIntegrationsConfig();

    // Ensure Mrsool service is initialized
    if (!mrsoolService.isInitialized()) {
      if (
        integrationsConfig.mrsool.enabled &&
        integrationsConfig.mrsool.apiKey
      ) {
        mrsoolService.initialize({
          apiKey: integrationsConfig.mrsool.apiKey,
          apiUrl: integrationsConfig.mrsool.apiUrl,
        });
      } else {
        throw new Error("Mrsool integration is enabled but configuration is incomplete.");
      }
    }

    // Validate that addresses are provided
    if (!orderData.sender_address || orderData.sender_address.trim() === "") {
      throw new Error("Sender address is required for Mrsool shipment.");
    }
    if (!orderData.receiver_address || orderData.receiver_address.trim() === "") {
      throw new Error("Receiver address is required for Mrsool shipment.");
    }

    // Geocode addresses to get coordinates
    const senderCoords = await geocodeAddress(orderData.sender_address);
    const receiverCoords = await geocodeAddress(orderData.receiver_address);

    if (!senderCoords) {
      throw new Error(`Failed to geocode sender address: ${orderData.sender_address}`);
    }
    if (!receiverCoords) {
      throw new Error(`Failed to geocode receiver address: ${orderData.receiver_address}`);
    }

    // Extract city from addresses (simple parsing - use first part after comma or whole address)
    const parseCity = (address: string): string => {
      const parts = address.split(",").map((p) => p.trim());
      // If address has multiple parts, city is usually the second-to-last or last
      if (parts.length >= 2) {
        return parts[parts.length - 1]; // Last part is often city
      }
      return parts[0] || "";
    };

    const senderCity = parseCity(orderData.sender_address);
    const receiverCity = parseCity(orderData.receiver_address);

    // Create Mrsool order
    const mrsoolResponse = await mrsoolService.createOrder({
      pickup: {
        latitude: senderCoords.lat,
        longitude: senderCoords.lng,
        address: orderData.sender_address,
        city: senderCity,
        contactName: orderData.sender_name || "",
        contactPhone: orderData.sender_phone || "",
      },
      delivery: {
        latitude: receiverCoords.lat,
        longitude: receiverCoords.lng,
        address: orderData.receiver_address,
        city: receiverCity,
        contactName: orderData.receiver_name || "",
        contactPhone: orderData.receiver_phone || "",
      },
      weight: orderData.weight,
      description: orderData.ship_type || "Parcel",
      reference: order.id,
    });

    // Validate that the API response contains valid shipment IDs
    // The mrsoolService.createOrder() returns empty strings as defaults if API doesn't provide these fields
    // We must not save empty strings to the database as it makes orders appear to have shipments when they don't
    if (!mrsoolResponse.orderId || mrsoolResponse.orderId.trim() === "") {
      throw new Error("Mrsool API did not return a valid order ID");
    }
    if (!mrsoolResponse.trackingNumber || mrsoolResponse.trackingNumber.trim() === "") {
      throw new Error("Mrsool API did not return a valid tracking number");
    }

    // Update order with Mrsool tracking information and status
    // Use atomic UPDATE with WHERE conditions to prevent overwriting if another process already created shipment
    const updateData: any = {
      status: "new", // Update status to 'new' after successful shipment creation
      mrsool_order_id: mrsoolResponse.orderId,
      mrsool_tracking_number: mrsoolResponse.trackingNumber,
    };

    if (mrsoolResponse.estimatedDeliveryTime) {
      updateData.delivery_at = mrsoolResponse.estimatedDeliveryTime;
    }

    // Update order with real shipment data, but only if we still own the lock
    // This ensures we don't overwrite if another process already created the shipment
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order.id)
      .eq("mrsool_order_id", lockValue) // Only update if we still own the lock
      .select()
      .single();

    if (updateError) {
      console.error(`Order ${order.id}: Failed to update order with Mrsool data:`, updateError);
      // Release the lock on update failure
      try {
        await supabase
          .from("orders")
          .update({ mrsool_order_id: null })
          .eq("id", order.id)
          .eq("mrsool_order_id", lockValue);
      } catch (lockReleaseError) {
        console.warn(`Order ${order.id}: Failed to release shipment creation lock:`, lockReleaseError);
      }
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    if (!updatedOrder) {
      // Update didn't affect any rows - another process may have created shipment
      // Release the lock
      try {
        await supabase
          .from("orders")
          .update({ mrsool_order_id: null })
          .eq("id", order.id)
          .eq("mrsool_order_id", lockValue);
      } catch (lockReleaseError) {
        console.warn(`Order ${order.id}: Failed to release shipment creation lock:`, lockReleaseError);
      }
      throw new Error("Failed to update order with Mrsool shipment data - another process may have created shipment");
    }

    console.log(`Order ${order.id}: Mrsool shipment created successfully`, {
      orderId: mrsoolResponse.orderId,
      trackingNumber: mrsoolResponse.trackingNumber,
    });

    return updatedOrder as Order;
  } catch (error: any) {
    // Release the lock on any error (including validation errors for empty orderId/trackingNumber)
    try {
      await supabase
        .from("orders")
        .update({ mrsool_order_id: null })
        .eq("id", order.id)
        .eq("mrsool_order_id", lockValue);
    } catch (lockReleaseError) {
      console.warn(`Order ${order.id}: Failed to release shipment creation lock:`, lockReleaseError);
    }
    // Re-throw the error so it can be handled by the caller
    throw error;
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

