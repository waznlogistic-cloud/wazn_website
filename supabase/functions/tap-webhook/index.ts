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
      
      // Check if Aramex shipment already exists
      if (order.aramex_shipment_id || order.aramex_tracking_number) {
        console.log(`Order ${order.id} already has Aramex shipment`);
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

    // Process paid order (create Aramex shipment if applicable)
    await processPaidOrder(supabase, order);

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
 * Process a paid order by creating Aramex shipment if applicable
 * This replicates the logic from processPaidOrder in orders.ts
 */
async function processPaidOrder(supabase: any, order: Order): Promise<void> {
  // Update order status from 'pending' to 'new' when payment is confirmed
  // This should happen regardless of Aramex shipment creation success/failure
  if (order.status === "pending") {
    const { data: updatedOrder, error: statusUpdateError } = await supabase
      .from("orders")
      .update({ status: "new" })
      .eq("id", order.id)
      .select()
      .single();

    if (statusUpdateError) {
      console.error(`Order ${order.id}: Failed to update status to 'new':`, statusUpdateError);
      // Continue processing even if status update fails
    } else if (updatedOrder) {
      order = updatedOrder as Order;
      console.log(`Order ${order.id} status updated from 'pending' to 'new'`);
    }
  }

  // Check if Aramex shipment already exists
  if (order.aramex_shipment_id || order.aramex_tracking_number) {
    console.log(`Order ${order.id} already has Aramex shipment, skipping`);
    return;
  }

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
    // Note: This is a simplified version - you may need to import/implement
    // the full Aramex service logic here or call it via HTTP
    const aramexResponse = await createAramexShipment(
      aramexConfig,
      order,
      shipperEmail
    );

    if (aramexResponse.shipments && aramexResponse.shipments.length > 0) {
      const shipment = aramexResponse.shipments[0];

      // Update order with Aramex tracking information
      // Note: Status is already updated to 'new' at the start of processPaidOrder
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          aramex_shipment_id: shipment.id,
          aramex_tracking_number: shipment.trackingNumber || shipment.id,
          aramex_label_url: shipment.labelUrl,
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Error updating order with Aramex data:", updateError);
        throw updateError;
      }

      console.log(`Aramex shipment created for order ${order.id}:`, {
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
      });
    }
  } catch (error: any) {
    console.error(`Failed to create Aramex shipment for order ${order.id}:`, error);
    // Don't throw - order is already paid, shipment can be retried manually
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
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1].trim();
      const lastPartUpper = lastPart.toUpperCase();
      
      // Check if last part is a known country code (2-letter ISO code)
      if (lastPartUpper.length === 2) {
        // Check if it matches any country code in our mappings
        for (const [countryName, code] of Object.entries(COUNTRY_CODE_MAPPINGS)) {
          if (code === lastPartUpper) {
            countryCode = code;
            break;
          }
        }
      }
      
      // If not found as code, try to match as country name
      if (countryCode === "SA" && lastPartUpper !== "SA") {
        for (const [countryName, code] of Object.entries(COUNTRY_CODE_MAPPINGS)) {
          const countryNameUpper = countryName.toUpperCase();
          if (
            lastPartUpper === countryNameUpper ||
            lastPart === countryName
          ) {
            countryCode = code;
            break;
          }
        }
      }
    }
    
    return {
      line1: parts[0] || "",
      line2: parts.length >= 3 ? parts[1] : "",
      city: parts.length >= 2 ? parts[parts.length - 2] : parts[0] || "",
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

