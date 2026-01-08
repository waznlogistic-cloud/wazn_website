/**
 * Tap Payments Webhook Handler
 * 
 * This Supabase Edge Function handles webhook events from Tap Payments.
 * When a payment is CAPTURED, it updates the order payment status and
 * triggers Aramex shipment creation.
 * 
 * Deployment:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link project: supabase link --project-ref your-project-ref
 * 4. Deploy: supabase functions deploy tap-webhook
 * 
 * Configuration:
 * Set the following secrets in Supabase Dashboard:
 * - ARAMEX_ACCOUNT_NUMBER
 * - ARAMEX_USERNAME
 * - ARAMEX_PASSWORD
 * - ARAMEX_ACCOUNT_PIN
 * - ARAMEX_ACCOUNT_ENTITY
 * - ARAMEX_ACCOUNT_COUNTRY_CODE
 * - ARAMEX_API_URL (optional)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TapWebhookPayload {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: {
      id: string; // Charge ID
      object: string;
      amount: number;
      currency: string;
      status: string; // INITIATED, CAPTURED, FAILED, etc.
      reference?: {
        transaction?: string;
        order?: string;
      };
      metadata?: Record<string, any>;
    };
  };
  type: string;
}

interface Order {
  id: string;
  tap_charge_id: string | null;
  payment_status: string;
  employer_id: string | null;
  client_id: string | null;
  ship_type: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  weight: number | null;
  delivery_method: string | null;
  aramex_shipment_id: string | null;
  aramex_tracking_number: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const payload: TapWebhookPayload = await req.json();
    const charge = payload.data.object;

    console.log("Tap webhook received:", {
      chargeId: charge.id,
      status: charge.status,
      reference: charge.reference,
    });

    // Only process CAPTURED payments
    if (charge.status !== "CAPTURED") {
      console.log(`Payment status is ${charge.status}, skipping processing`);
      return new Response(
        JSON.stringify({ message: `Status ${charge.status} ignored` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Find order by tap_charge_id
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("tap_charge_id", charge.id)
      .limit(1);

    if (orderError) {
      console.error("Error fetching order:", orderError);
      throw orderError;
    }

    if (!orders || orders.length === 0) {
      console.warn(`No order found for tap_charge_id: ${charge.id}`);
      return new Response(
        JSON.stringify({ message: "Order not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    const order = orders[0] as Order;

    // Check if payment is already processed
    if (order.payment_status === "paid") {
      console.log(`Order ${order.id} already marked as paid`);
      
      // Check if shipment already exists (Aramex or Mrsool)
      // IMPORTANT: Exclude temporary lock values (IN_PROGRESS_*) from existence check
      // Also check for both Aramex and Mrsool shipments, not just Aramex
      const hasRealShipment = (value: string | null | undefined): boolean => {
        return !!value && !value.startsWith("IN_PROGRESS_");
      };
      
      const shipmentExists =
        hasRealShipment(order.aramex_shipment_id) ||
        hasRealShipment(order.aramex_tracking_number) ||
        hasRealShipment(order.mrsool_order_id) ||
        hasRealShipment(order.mrsool_tracking_number);
      
      if (shipmentExists) {
        const providerType = (hasRealShipment(order.aramex_shipment_id) || hasRealShipment(order.aramex_tracking_number)) ? "Aramex" : "Mrsool";
        console.log(`Order ${order.id} already has ${providerType} shipment`);
        return new Response(
          JSON.stringify({ message: "Order already processed" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    // Update order payment status to 'paid'
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating order payment status:", updateError);
      throw updateError;
    }

    console.log(`Order ${order.id} payment status updated to 'paid'`);

    // Refetch order to get latest data (including any Aramex shipment created by client-side)
    const { data: refreshedOrder, error: refetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order.id)
      .single();

    if (refetchError) {
      console.error("Error refetching order:", refetchError);
      throw refetchError;
    }

    if (!refreshedOrder) {
      throw new Error(`Order ${order.id} not found after payment update`);
    }

    // Process paid order (create Aramex/Mrsool shipment if applicable) with refreshed order data
    // This function creates the shipment directly - no need to call external Edge Function
    await processPaidOrder(supabase, refreshedOrder as Order);
    
    // Additionally, trigger the dedicated process-paid-order Edge Function as a backup
    // This ensures shipment creation even if this webhook fails after updating payment_status
    // The process-paid-order function will check if shipment already exists and skip if so
    try {
      const processPaidOrderUrl = `${supabaseUrl}/functions/v1/process-paid-order`;
      await fetch(processPaidOrderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          order_id: refreshedOrder.id,
          triggered_by: "tap-webhook-backup",
        }),
      }).catch((err) => {
        // Log but don't fail - shipment may have already been created above
        console.warn(`Failed to trigger backup process-paid-order function:`, err);
      });
    } catch (backupError) {
      // Log but don't fail - shipment creation above should have succeeded
      console.warn(`Error calling backup process-paid-order function:`, backupError);
    }

    return new Response(
      JSON.stringify({
        message: "Webhook processed successfully",
        orderId: order.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/**
 * Process a paid order by creating shipment (Aramex or Mrsool) if applicable
 * This replicates the logic from processPaidOrder in orders.ts
 */
async function processPaidOrder(supabase: any, order: Order): Promise<void> {
  // Check if shipment already exists (Aramex or Mrsool) BEFORE status update
  // IMPORTANT: Exclude temporary lock values (IN_PROGRESS_*) from existence check
  // Lock values indicate shipment creation is in progress, not that it's complete
  const hasRealShipment = (value: string | null | undefined): boolean => {
    return !!value && !value.startsWith("IN_PROGRESS_");
  };
  
  const shipmentExists =
    hasRealShipment(order.aramex_shipment_id) ||
    hasRealShipment(order.aramex_tracking_number) ||
    hasRealShipment(order.mrsool_order_id) ||
    hasRealShipment(order.mrsool_tracking_number);

  if (shipmentExists) {
    const providerType = (hasRealShipment(order.aramex_shipment_id) || hasRealShipment(order.aramex_tracking_number)) ? "Aramex" : "Mrsool";
    console.log(`Order ${order.id} already has ${providerType} shipment, skipping`);
    // Ensure status is 'new' if shipment exists (shipment already created, so order is ready)
    if (order.status === "pending") {
      const { error: statusUpdateError } = await supabase
        .from("orders")
        .update({ status: "new" })
        .eq("id", order.id);
      if (statusUpdateError) {
        console.error(`Order ${order.id}: Failed to update status to 'new':`, statusUpdateError);
      }
    }
    return;
  }

  // Note: Status update is deferred until after successful shipment creation
  // This ensures status remains 'pending' if shipment creation fails, enabling retry
  // Status will be updated to 'new' in createAramexShipmentForOrder/createMrsoolShipmentForOrder on success

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
        console.warn(`Order ${order.id}: Failed to fetch provider:`, providerError);
      } else if (provider) {
        providerCompanyName = provider.company_name || "";
      }
    } catch (error) {
      console.warn(`Order ${order.id}: Error fetching provider:`, error);
    }
  }

  // Determine provider type (Aramex or Mrsool)
  const providerCompanyNameUpper = providerCompanyName.toUpperCase();
  const isAramex = providerCompanyNameUpper.includes("ARAMEX");
  const isMrsool = providerCompanyNameUpper.includes("MRSOOL");

  // If no provider_id or provider not recognized, skip shipment creation
  // But update status to 'new' since payment is confirmed (consistent with client-side behavior)
  if (!order.provider_id || (!isAramex && !isMrsool)) {
    console.log(
      `Order ${order.id}: No recognized provider (provider_id: ${order.provider_id}, company_name: ${providerCompanyName}), updating status to 'new'`
    );
    // Update status to 'new' if still pending (payment is confirmed, order is ready even without shipment)
    if (order.status === "pending") {
      const { error: statusUpdateError } = await supabase
        .from("orders")
        .update({ status: "new" })
        .eq("id", order.id);
      if (statusUpdateError) {
        console.error(`Order ${order.id}: Failed to update status to 'new':`, statusUpdateError);
      }
    }
    return;
  }

  // Check integration configuration based on provider type
  // This must happen BEFORE atomic claim to avoid locking unnecessarily
  let shouldCreateShipment = false;
  if (isAramex) {
    const aramexConfig = {
      enabled: Deno.env.get("ARAMEX_ENABLED") === "true",
      accountNumber: Deno.env.get("ARAMEX_ACCOUNT_NUMBER"),
      userName: Deno.env.get("ARAMEX_USERNAME"),
      password: Deno.env.get("ARAMEX_PASSWORD"),
      accountPin: Deno.env.get("ARAMEX_ACCOUNT_PIN"),
      accountEntity: Deno.env.get("ARAMEX_ACCOUNT_ENTITY"),
      accountCountryCode: Deno.env.get("ARAMEX_ACCOUNT_COUNTRY_CODE") || "SA",
    };
    
    if (
      aramexConfig.enabled &&
      aramexConfig.accountNumber &&
      aramexConfig.userName &&
      aramexConfig.password &&
      aramexConfig.accountPin &&
      aramexConfig.accountEntity &&
      aramexConfig.accountCountryCode
    ) {
      shouldCreateShipment = true;
    }
  } else if (isMrsool) {
    const mrsoolConfig = {
      enabled: Deno.env.get("MRSOOL_ENABLED") === "true",
      apiKey: Deno.env.get("MRSOOL_API_KEY"),
    };
    
    if (mrsoolConfig.enabled && mrsoolConfig.apiKey) {
      shouldCreateShipment = true;
    }
  }

  if (!shouldCreateShipment) {
    console.log(
      `Order ${order.id}: ${isAramex ? 'Aramex' : 'Mrsool'} integration is disabled or not configured, skipping shipment creation`
    );
    // Ensure status is 'new' if integration is not configured (regardless of current status)
    // This handles the case where status update at the start might have failed
    if (order.status === "pending") {
      const { error: statusUpdateError } = await supabase
        .from("orders")
        .update({ status: "new" })
        .eq("id", order.id);
      if (statusUpdateError) {
        console.error(`Order ${order.id}: Failed to update status to 'new':`, statusUpdateError);
      }
    }
    return;
  }

  // Atomically claim the right to create shipment by setting a lock in the shipment field
  // This prevents race conditions when both client-side and webhook try to create shipments
  // The lock is set BEFORE external API calls to prevent duplicate shipments
  const providerType = isAramex ? "aramex" : "mrsool";
  const claimResult = await atomicallyClaimShipmentCreation(supabase, order.id, providerType);
  if (!claimResult.success) {
    // Another process already claimed it or shipment was created, refetch order
    console.log(`Order ${order.id}: Shipment creation already claimed by another process, skipping`);
    const { data: refreshedOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order.id)
      .single();
    
    if (refreshedOrder) {
      // Check if shipment was created (exclude lock values)
      // IMPORTANT: Use hasRealShipment to filter out temporary lock values (IN_PROGRESS_*)
      if (
        hasRealShipment(refreshedOrder.aramex_shipment_id) ||
        hasRealShipment(refreshedOrder.aramex_tracking_number) ||
        hasRealShipment(refreshedOrder.mrsool_order_id) ||
        hasRealShipment(refreshedOrder.mrsool_tracking_number)
      ) {
        console.log(`Order ${order.id}: Shipment was created by another process`);
      }
    }
    return;
  }
  
  // Store the lock value to verify we still own the lock when updating
  const lockValue = claimResult.lockValue!;

  // Route to appropriate shipment creation based on provider
  // Pass lockValue to verify we still own the lock when updating
  if (isAramex) {
    await createAramexShipmentForOrder(supabase, order, lockValue);
  } else if (isMrsool) {
    await createMrsoolShipmentForOrder(supabase, order, lockValue);
  }
}

/**
 * Create Aramex shipment for order (webhook version)
 */
async function createAramexShipmentForOrder(
  supabase: any,
  order: Order,
  lockValue: string
): Promise<void> {
  // Check if Aramex integration is enabled
  const aramexConfig = {
    enabled: Deno.env.get("ARAMEX_ENABLED") === "true",
    accountNumber: Deno.env.get("ARAMEX_ACCOUNT_NUMBER"),
    userName: Deno.env.get("ARAMEX_USERNAME"),
    password: Deno.env.get("ARAMEX_PASSWORD"),
    accountPin: Deno.env.get("ARAMEX_ACCOUNT_PIN"),
    accountEntity: Deno.env.get("ARAMEX_ACCOUNT_ENTITY"),
    accountCountryCode: Deno.env.get("ARAMEX_ACCOUNT_COUNTRY_CODE") || "SA",
    apiUrl: Deno.env.get("ARAMEX_API_URL") || "https://ws.aramex.net",
  };

  if (
    !aramexConfig.enabled ||
    !aramexConfig.accountNumber ||
    !aramexConfig.userName ||
    !aramexConfig.password ||
    !aramexConfig.accountPin ||
    !aramexConfig.accountEntity ||
    !aramexConfig.accountCountryCode
  ) {
    console.log(
      `Order ${order.id}: Aramex integration is disabled or not configured, skipping shipment creation`
    );
    return;
  }

  try {
    // Fetch employer email for shipper
    let shipperEmail = "";
    if (order.employer_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", order.employer_id)
        .single();

      if (profile?.email) {
        shipperEmail = profile.email;
      }
    }

    // Create Aramex shipment
    const aramexResponse = await createAramexShipment(
      aramexConfig,
      order,
      shipperEmail
    );

    if (aramexResponse.shipments && aramexResponse.shipments.length > 0) {
      const shipment = aramexResponse.shipments[0];

      // Update order with Aramex tracking information atomically
      // Only update if we still own the lock (prevents overwriting if another process created shipment)
      // Status is updated to 'new' here after successful shipment creation (not before, to enable retry on failure)
      const { data: updatedOrder, error: updateError } = await supabase
        .from("orders")
        .update({
          aramex_shipment_id: shipment.id,
          aramex_tracking_number: shipment.trackingNumber || shipment.id,
          aramex_label_url: shipment.labelUrl,
          status: "new", // Update status to 'new' only after successful shipment creation
        })
        .eq("id", order.id)
        .eq("aramex_shipment_id", lockValue) // Only update if we still own the lock
        .select()
        .single();

      if (updateError) {
        console.error("Error updating order with Aramex data:", updateError);
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
        console.log(`Order ${order.id}: Aramex shipment update failed - another process may have created shipment`);
        return;
      }

      console.log(`Aramex shipment created for order ${order.id}:`, {
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
      });
    } else {
      // No shipments returned - release the lock
      await supabase
        .from("orders")
        .update({ aramex_shipment_id: null })
        .eq("id", order.id)
        .eq("aramex_shipment_id", lockValue);
    }
  } catch (error: any) {
    console.error(`Failed to create Aramex shipment for order ${order.id}:`, error);
    // Release the lock on error
    try {
      await supabase
        .from("orders")
        .update({ aramex_shipment_id: null })
        .eq("id", order.id)
        .eq("aramex_shipment_id", lockValue);
    } catch (lockReleaseError) {
      console.warn(`Order ${order.id}: Failed to release shipment creation lock:`, lockReleaseError);
    }
    // Don't throw - order is already paid, shipment can be retried manually
  }
}

/**
 * Create Mrsool shipment for order (webhook version)
 */
async function createMrsoolShipmentForOrder(
  supabase: any,
  order: Order,
  lockValue: string
): Promise<void> {
  // Check if Mrsool integration is enabled
  const mrsoolConfig = {
    enabled: Deno.env.get("MRSOOL_ENABLED") === "true",
    apiKey: Deno.env.get("MRSOOL_API_KEY"),
    apiUrl: Deno.env.get("MRSOOL_API_URL") || "https://logistics.staging.mrsool.co/api",
  };

  if (!mrsoolConfig.enabled || !mrsoolConfig.apiKey) {
    console.log(
      `Order ${order.id}: Mrsool integration is disabled or not configured, skipping shipment creation`
    );
    return;
  }

  try {
    // Validate addresses
    if (!order.sender_address || !order.receiver_address) {
      throw new Error("Sender and receiver addresses are required for Mrsool shipment");
    }

    // Geocode addresses
    const senderCoords = await geocodeAddress(order.sender_address);
    const receiverCoords = await geocodeAddress(order.receiver_address);

    if (!senderCoords || !receiverCoords) {
      throw new Error("Failed to geocode addresses for Mrsool shipment");
    }

    // Parse city from addresses
    const parseCity = (address: string): string => {
      const parts = address.split(",").map((p) => p.trim());
      return parts.length >= 2 ? parts[parts.length - 1] : parts[0] || "";
    };

    // Create Mrsool order
    const mrsoolResponse = await fetch(`${mrsoolConfig.apiUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mrsoolConfig.apiKey}`,
        "X-API-Key": mrsoolConfig.apiKey,
      },
      body: JSON.stringify({
        pickup: {
          lat: senderCoords.lat,
          lng: senderCoords.lng,
          address: order.sender_address,
          city: parseCity(order.sender_address),
          contact_name: order.sender_name || "",
          contact_phone: order.sender_phone || "",
        },
        delivery: {
          lat: receiverCoords.lat,
          lng: receiverCoords.lng,
          address: order.receiver_address,
          city: parseCity(order.receiver_address),
          contact_name: order.receiver_name || "",
          contact_phone: order.receiver_phone || "",
        },
        weight: order.weight,
        description: order.ship_type || "Parcel",
        reference: order.id,
      }),
    });

    if (!mrsoolResponse.ok) {
      const errorData = await mrsoolResponse.json().catch(() => ({}));
      throw new Error(`Mrsool API error: ${errorData.message || mrsoolResponse.statusText}`);
    }

    const mrsoolData = await mrsoolResponse.json();
    const mrsoolOrderId = mrsoolData.order_id || mrsoolData.id || "";
    const mrsoolTrackingNumber = mrsoolData.tracking_number || mrsoolData.tracking || "";

    // Validate that the API response contains valid shipment IDs
    // Empty strings should not be saved to the database as it makes orders appear to have shipments when they don't
    if (!mrsoolOrderId || mrsoolOrderId.trim() === "") {
      throw new Error("Mrsool API did not return a valid order ID");
    }
    if (!mrsoolTrackingNumber || mrsoolTrackingNumber.trim() === "") {
      throw new Error("Mrsool API did not return a valid tracking number");
    }

    // Update order with Mrsool tracking information atomically
    // Only update if we still own the lock (prevents overwriting if another process created shipment)
    // Status is updated to 'new' here after successful shipment creation (not before, to enable retry on failure)
    const updateData: any = {
      mrsool_order_id: mrsoolOrderId,
      mrsool_tracking_number: mrsoolTrackingNumber,
      status: "new", // Update status to 'new' only after successful shipment creation
    };

    if (mrsoolData.estimated_delivery_time || mrsoolData.eta) {
      updateData.delivery_at = mrsoolData.estimated_delivery_time || mrsoolData.eta;
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order.id)
      .eq("mrsool_order_id", lockValue) // Only update if we still own the lock
      .select()
      .single();

    if (updateError) {
      console.error("Error updating order with Mrsool data:", updateError);
      throw updateError;
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
      console.log(`Order ${order.id}: Mrsool shipment update failed - another process may have created shipment`);
      return;
    }

    console.log(`Mrsool shipment created for order ${order.id}:`, {
      orderId: mrsoolOrderId,
      trackingNumber: mrsoolTrackingNumber,
    });
  } catch (error: any) {
    console.error(`Failed to create Mrsool shipment for order ${order.id}:`, error);
    // Release the lock on error
    try {
      await supabase
        .from("orders")
        .update({ mrsool_order_id: null })
        .eq("id", order.id)
        .eq("mrsool_order_id", lockValue);
    } catch (lockReleaseError) {
      console.warn(`Order ${order.id}: Failed to release shipment creation lock:`, lockReleaseError);
    }
    // Don't throw - order is already paid, shipment can be retried manually
  }
}

/**
 * Atomically claim the right to create a shipment for an order (webhook version)
 * This prevents race conditions when multiple processes try to create shipments simultaneously
 * Sets a temporary lock in the shipment fields to prevent concurrent execution
 */
async function atomicallyClaimShipmentCreation(
  supabase: any,
  orderId: string,
  providerType: "aramex" | "mrsool"
): Promise<{ success: boolean; lockValue?: string }> {
  // Generate a unique lock value using timestamp and random string
  const lockValue = `IN_PROGRESS_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Use an atomic UPDATE that sets a temporary lock in the appropriate shipment field
  // This prevents race conditions when both client-side and webhook try to create shipments
  // The lock is set in the shipment_id field, which will be updated with the real value after external API call
  const lockField = providerType === "aramex" ? "aramex_shipment_id" : "mrsool_order_id";
  
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
 * Geocode an address to get latitude and longitude (webhook version)
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "Wazn Platform",
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
 * Create Aramex shipment via API
 * This is a simplified version - you may want to use the full aramex.ts service
 */
async function createAramexShipment(
  config: any,
  order: Order,
  shipperEmail: string
): Promise<any> {
  // Country code mappings for common country names (ISO 3166-1 alpha-2)
  const COUNTRY_CODE_MAPPINGS: Record<string, string> = {
    "SAUDI ARABIA": "SA",
    "السعودية": "SA",
    "المملكة العربية السعودية": "SA",
    "SA": "SA",
    "UNITED ARAB EMIRATES": "AE",
    "UAE": "AE",
    "KUWAIT": "KW",
    "BAHRAIN": "BH",
    "QATAR": "QA",
    "OMAN": "OM",
    "JORDAN": "JO",
    "EGYPT": "EG",
    "LEBANON": "LB",
    "IRAQ": "IQ",
    "SYRIA": "SY",
    "YEMEN": "YE",
    "PALESTINE": "PS",
    "ISRAEL": "IL",
    "TURKEY": "TR",
    "IRAN": "IR",
    "UNITED STATES": "US",
    "USA": "US",
    "U.S.A": "US",
    "U.S.A.": "US",
    "CANADA": "CA",
    "MEXICO": "MX",
    "UNITED KINGDOM": "GB",
    "UK": "GB",
    "U.K.": "GB",
    "GREAT BRITAIN": "GB",
    "FRANCE": "FR",
    "GERMANY": "DE",
    "ITALY": "IT",
    "SPAIN": "ES",
    "NETHERLANDS": "NL",
    "BELGIUM": "BE",
    "SWITZERLAND": "CH",
    "AUSTRIA": "AT",
    "SWEDEN": "SE",
    "NORWAY": "NO",
    "DENMARK": "DK",
    "POLAND": "PL",
    "RUSSIA": "RU",
    "CHINA": "CN",
    "JAPAN": "JP",
    "SOUTH KOREA": "KR",
    "KOREA": "KR",
    "INDIA": "IN",
    "PAKISTAN": "PK",
    "BANGLADESH": "BD",
    "SRI LANKA": "LK",
    "THAILAND": "TH",
    "VIETNAM": "VN",
    "SINGAPORE": "SG",
    "MALAYSIA": "MY",
    "INDONESIA": "ID",
    "PHILIPPINES": "PH",
    "AUSTRALIA": "AU",
    "NEW ZEALAND": "NZ",
    "SOUTH AFRICA": "ZA",
    "KENYA": "KE",
    "NIGERIA": "NG",
    "MOROCCO": "MA",
    "ALGERIA": "DZ",
    "TUNISIA": "TN",
    "BRAZIL": "BR",
    "ARGENTINA": "AR",
    "CHILE": "CL",
  };

  // Parse addresses (simplified - you may want to use the full address parser)
  const parseAddress = (address: string) => {
    const parts = address.split(",").map((p) => p.trim());
    
    // Extract country code from last part
    let countryCode = "SA"; // Default fallback
    let countryFoundInLastPart = false;
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1].trim();
      const lastPartUpper = lastPart.toUpperCase();
      
      // Check if last part is a known country code (2-letter ISO code)
      if (lastPartUpper.length === 2) {
        // Check if it matches any country code in our mappings
        for (const [countryName, code] of Object.entries(COUNTRY_CODE_MAPPINGS)) {
          if (code === lastPartUpper) {
            countryCode = code;
            countryFoundInLastPart = true;
            break;
          }
        }
      }
      
      // If not found as code, try to match as country name
      if (!countryFoundInLastPart && lastPartUpper !== "SA") {
        for (const [countryName, code] of Object.entries(COUNTRY_CODE_MAPPINGS)) {
          const countryNameUpper = countryName.toUpperCase();
          if (
            lastPartUpper === countryNameUpper ||
            lastPart === countryName
          ) {
            countryCode = code;
            countryFoundInLastPart = true;
            break;
          }
        }
      }
    }
    
    // Extract city correctly based on address format
    // Common formats:
    // - "Street, City" (2 parts, no country) -> city is parts[1]
    // - "Street, City, Country" (3 parts) -> city is parts[1] (second-to-last)
    // - "Street, District, City" (3 parts, no country) -> city is parts[2] (last)
    // - "Street, District, City, Country" (4 parts) -> city is parts[2] (second-to-last)
    let city = "";
    if (parts.length >= 2) {
      if (countryFoundInLastPart) {
        // Country found in last part, city is second-to-last
        // For 2 parts: "Street, Country" -> city would be parts[0], but this is unlikely
        // For 3+ parts: city is parts[parts.length - 2]
        city = parts.length >= 3 ? parts[parts.length - 2] : parts[0];
      } else {
        // No country detected, last part is likely the city
        city = parts[parts.length - 1];
      }
    } else if (parts.length === 1) {
      // Only one part, use it as city (fallback)
      city = parts[0];
    }
    
    return {
      line1: parts[0] || "",
      line2: parts.length >= 3 ? parts[1] : "",
      city: city,
      countryCode: countryCode,
      postCode: "",
    };
  };

  const senderAddress = parseAddress(order.sender_address);
  const receiverAddress = parseAddress(order.receiver_address);

  // Determine product group (DOM vs EXP)
  const productGroup =
    senderAddress.countryCode === "SA" && receiverAddress.countryCode === "SA"
      ? "DOM"
      : "EXP";

  // Prepare Aramex API request
  const aramexRequest = {
    ClientInfo: {
      UserName: config.userName,
      Password: config.password,
      Version: "v2.0",
      AccountNumber: config.accountNumber,
      AccountPin: config.accountPin,
      AccountEntity: config.accountEntity,
      AccountCountryCode: config.accountCountryCode,
    },
    Transaction: {
      Reference1: order.id,
      Reference2: order.tracking_no || "",
      Reference3: `WAZN-${order.id}`,
    },
    Shipments: [
      {
        Reference1: order.id,
        Reference2: order.tracking_no || "",
        Reference3: `WAZN-${order.id}`,
        Shipper: {
          Reference1: order.id,
          Reference2: "",
          AccountNumber: config.accountNumber,
          PartyAddress: {
            Line1: senderAddress.line1,
            Line2: senderAddress.line2 || "",
            Line3: "",
            City: senderAddress.city,
            StateOrProvinceCode: "",
            PostCode: senderAddress.postCode || "",
            CountryCode: senderAddress.countryCode,
          },
          Contact: {
            Department: "",
            PersonName: order.sender_name,
            Title: "",
            CompanyName: order.sender_name,
            PhoneNumber1: order.sender_phone,
            PhoneNumber1Ext: "",
            PhoneNumber2: "",
            FaxNumber: "",
            CellPhone: order.sender_phone,
            EmailAddress: shipperEmail,
            Type: "",
          },
        },
        Consignee: {
          Reference1: "",
          Reference2: "",
          Reference3: "",
          PartyAddress: {
            Line1: receiverAddress.line1,
            Line2: receiverAddress.line2 || "",
            Line3: "",
            City: receiverAddress.city,
            StateOrProvinceCode: "",
            PostCode: receiverAddress.postCode || "",
            CountryCode: receiverAddress.countryCode,
          },
          Contact: {
            Department: "",
            PersonName: order.receiver_name,
            Title: "",
            CompanyName: order.receiver_name,
            PhoneNumber1: order.receiver_phone,
            PhoneNumber1Ext: "",
            PhoneNumber2: "",
            FaxNumber: "",
            CellPhone: order.receiver_phone,
            EmailAddress: "",
            Type: "",
          },
        },
        ShippingDateTime: new Date().toISOString(),
        DueDate: order.delivery_at || new Date().toISOString(),
        Comments: "",
        PickupLocation: "",
        OperationsInstructions: "",
        AccountingInstructions: "",
        Details: {
          Dimensions: {
            Length: 10,
            Width: 10,
            Height: 10,
            Unit: "CM",
          },
          ActualWeight: {
            Value: order.weight || 1,
            Unit: "KG",
          },
          ProductGroup: productGroup,
          ProductType: "ONX", // Default - you may want to map based on ship_type
          PaymentType: "P", // Prepaid
          PaymentOptions: "",
          Services: "",
          NumberOfPieces: 1,
          DescriptionOfGoods: "Parcel",
          GoodsOriginCountry: senderAddress.countryCode,
        },
        Attachments: [],
        ForeignHAWB: "",
        LabelInfo: {
          ReportID: 9201,
          ReportType: "URL",
        },
      },
    ],
    LabelInfo: {
      ReportID: 9201,
      ReportType: "URL",
    },
  };

  // Call Aramex API
  const response = await fetch(`${config.apiUrl}/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(aramexRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Aramex API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  // Check for errors in notifications
  if (data.Notifications && data.Notifications.length > 0) {
    const errors = data.Notifications.filter(
      (n: any) => n.Type === "Error"
    );
    if (errors.length > 0) {
      const errorMessages = errors
        .map((e: any) => e.Message || JSON.stringify(e))
        .join(", ");
      throw new Error(`Aramex API error: ${errorMessages}`);
    }
  }

  return data;
}

