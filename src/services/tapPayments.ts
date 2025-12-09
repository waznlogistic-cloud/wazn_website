/**
 * Tap Payments API Integration
 * 
 * This service handles all interactions with Tap Payments API
 * Documentation: https://developers.tap.company/docs/
 */

export interface TapConfig {
  secretKey: string;
  publicKey: string;
  apiUrl?: string; // Default: https://api.tap.company/v2
  redirectUrl?: string;
}

export interface TapChargeRequest {
  amount: number;
  currency: string; // "SAR", "USD", etc.
  customer: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: {
      countryCode: string; // "+966"
      number: string;
    };
  };
  merchant: {
    id: string;
  };
  source?: {
    id: string; // Payment method ID
  };
  redirect?: {
    url: string; // Return URL after payment
  };
  post?: {
    url: string; // Webhook URL
  };
  description?: string;
  metadata?: Record<string, any>;
  reference?: {
    transaction?: string;
    order?: string;
  };
}

export interface TapChargeResponse {
  id: string;
  object: string;
  amount: number;
  currency: string;
  status: "INITIATED" | "CAPTURED" | "FAILED" | "ABANDONED" | "CANCELLED" | "DECLINED" | "RESTRICTED" | "VOID" | "TIMEDOUT" | "UNKNOWN";
  redirect: {
    url: string;
  };
  transaction: {
    url: string;
  };
  reference: {
    transaction: string;
    order: string;
  };
  response: {
    code: string;
    message: string;
  };
}

export interface TapWebhookPayload {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: {
      id: string;
      object: string;
      amount: number;
      currency: string;
      status: string;
      reference: {
        transaction: string;
        order: string;
      };
      metadata?: Record<string, any>;
    };
  };
  type: string;
}

class TapPaymentsService {
  private config: TapConfig | null = null;

  /**
   * Initialize Tap Payments service with configuration
   */
  initialize(config: TapConfig) {
    this.config = config;
  }

  /**
   * Create a charge/payment
   */
  async createCharge(request: TapChargeRequest): Promise<TapChargeResponse> {
    if (!this.config) {
      throw new Error("Tap Payments service not initialized. Call initialize() first.");
    }

    const apiUrl = this.config.apiUrl || "https://api.tap.company/v2";
    
    const response = await fetch(`${apiUrl}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.secretKey}`,
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        customer: {
          first_name: request.customer.firstName,
          last_name: request.customer.lastName || "",
          email: request.customer.email,
          phone: {
            country_code: request.customer.phone.countryCode,
            number: request.customer.phone.number,
          },
        },
        merchant: {
          id: request.merchant.id,
        },
        source: request.source,
        redirect: request.redirect || {
          url: this.config.redirectUrl || `${window.location.origin}/payment/callback`,
        },
        post: request.post || {
          url: `${window.location.origin}/api/webhooks/tap`,
        },
        description: request.description,
        metadata: request.metadata,
        reference: request.reference,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Tap Payments API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors && data.errors.length > 0) {
      throw new Error(`Tap Payments error: ${data.errors.map((e: any) => e.description).join(", ")}`);
    }

    return {
      id: data.id,
      object: data.object,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      redirect: data.redirect,
      transaction: data.transaction,
      reference: data.reference,
      response: data.response,
    };
  }

  /**
   * Get charge status
   */
  async getCharge(chargeId: string): Promise<TapChargeResponse> {
    if (!this.config) {
      throw new Error("Tap Payments service not initialized. Call initialize() first.");
    }

    const apiUrl = this.config.apiUrl || "https://api.tap.company/v2";
    
    const response = await fetch(`${apiUrl}/charges/${chargeId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${this.config.secretKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Tap Payments API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Verify webhook signature (for security)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // TODO: Implement signature verification when secret is provided
    // This is important for production security
    return true; // Placeholder
  }

  /**
   * Process webhook payload
   */
  processWebhook(payload: TapWebhookPayload): {
    chargeId: string;
    status: string;
    amount: number;
    currency: string;
    orderId?: string;
    transactionId?: string;
  } {
    return {
      chargeId: payload.data.object.id,
      status: payload.data.object.status,
      amount: payload.data.object.amount,
      currency: payload.data.object.currency,
      orderId: payload.data.object.reference?.order,
      transactionId: payload.data.object.reference?.transaction,
    };
  }
}

export const tapPaymentsService = new TapPaymentsService();

