/**
 * Mrsool Logistics API Integration
 * 
 * This service handles all interactions with Mrsool logistics API
 * Documentation: https://logistics.staging.mrsool.co/api/docs/index.html
 * 
 * APIs to Implement:
 * - Order Creation API
 * - Rate Calculation API
 * - Order Tracking API
 * - Order Cancellation API
 */

export interface MrsoolConfig {
  apiKey: string;
  apiUrl?: string; // Default: https://logistics.staging.mrsool.co/api
}

export interface MrsoolRateRequest {
  pickup: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
  };
  delivery: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
  };
  weight?: number; // in kg
  description?: string;
}

export interface MrsoolRateResponse {
  basePrice: number; // Base cost from Mrsool (25-30 SAR)
  distance: number; // Distance in km
  distanceCharge: number; // 2 SAR per 10 km
  totalPrice: number; // Base + distance charges
  currency: string; // SAR
  estimatedDeliveryTime?: string;
}

export interface MrsoolCreateOrderRequest {
  pickup: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    contactName: string;
    contactPhone: string;
  };
  delivery: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    contactName: string;
    contactPhone: string;
  };
  weight?: number; // in kg
  description?: string;
  reference?: string; // Order reference number
}

export interface MrsoolOrderResponse {
  orderId: string;
  trackingNumber: string;
  status: string;
  price: number;
  estimatedDeliveryTime?: string;
}

class MrsoolService {
  private config: MrsoolConfig | null = null;
  private initialized = false;

  /**
   * Initialize Mrsool service with API credentials
   */
  initialize(config: MrsoolConfig): void {
    this.config = {
      apiUrl: config.apiUrl || "https://logistics.staging.mrsool.co/api",
      apiKey: config.apiKey,
    };
    this.initialized = true;
    console.log("Mrsool service initialized");
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.config !== null;
  }

  /**
   * Ensure service is initialized, throw error if not
   */
  private ensureInitialized(): void {
    if (!this.isInitialized()) {
      throw new Error("Mrsool service not initialized. Call initialize() first.");
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Calculate shipping rate based on distance
   * Pricing: Base 25-30 SAR + 2 SAR per 10 km
   * Wazn Final Price: 31-36 SAR + 2 SAR per 10 km (6 SAR margin)
   */
  async calculateRate(request: MrsoolRateRequest): Promise<MrsoolRateResponse> {
    this.ensureInitialized();

    try {
      // Calculate distance between pickup and delivery points
      const distance = this.calculateDistance(
        request.pickup.latitude,
        request.pickup.longitude,
        request.delivery.latitude,
        request.delivery.longitude
      );

      // Base price: 25-30 SAR (use average 27.5 SAR for base calculation)
      // For dynamic pricing, we'll use 27.5 as base, but this can be adjusted
      const basePrice = 27.5; // Average of 25-30 SAR range

      // Distance charge: 2 SAR per 10 km
      const distanceCharge = Math.ceil(distance / 10) * 2;

      // Total price from Mrsool (base + distance)
      const totalPrice = basePrice + distanceCharge;

      return {
        basePrice,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        distanceCharge,
        totalPrice: Math.round(totalPrice * 100) / 100,
        currency: "SAR",
      };
    } catch (error: any) {
      console.error("[Mrsool] Rate calculation error:", error);
      throw new Error(`Failed to calculate Mrsool rate: ${error.message}`);
    }
  }

  /**
   * Apply Wazn margin to Mrsool base price
   * Margin: 6 SAR average (makes final price 31-36 SAR + 2 SAR/10 km)
   */
  applyWaznMargin(basePrice: number): number {
    // Add 6 SAR margin to base price
    return Math.round((basePrice + 6) * 100) / 100;
  }

  /**
   * Create a shipping order with Mrsool
   */
  async createOrder(request: MrsoolCreateOrderRequest): Promise<MrsoolOrderResponse> {
    this.ensureInitialized();

    const apiUrl = this.config!.apiUrl!;

    try {
      // TODO: Replace with actual API endpoint once documentation is reviewed
      // This is a placeholder structure based on common logistics APIs
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config!.apiKey}`,
          "X-API-Key": this.config!.apiKey,
        },
        body: JSON.stringify({
          pickup: {
            lat: request.pickup.latitude,
            lng: request.pickup.longitude,
            address: request.pickup.address,
            city: request.pickup.city,
            contact_name: request.pickup.contactName,
            contact_phone: request.pickup.contactPhone,
          },
          delivery: {
            lat: request.delivery.latitude,
            lng: request.delivery.longitude,
            address: request.delivery.address,
            city: request.delivery.city,
            contact_name: request.delivery.contactName,
            contact_phone: request.delivery.contactPhone,
          },
          weight: request.weight,
          description: request.description || "Parcel",
          reference: request.reference,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Mrsool API error: ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();

      return {
        orderId: data.order_id || data.id || "",
        trackingNumber: data.tracking_number || data.tracking || "",
        status: data.status || "pending",
        price: data.price || 0,
        estimatedDeliveryTime: data.estimated_delivery_time || data.eta,
      };
    } catch (error: any) {
      console.error("[Mrsool] Create order error:", error);
      throw new Error(`Failed to create Mrsool order: ${error.message}`);
    }
  }

  /**
   * Track an order by tracking number
   */
  async trackOrder(trackingNumber: string): Promise<any> {
    this.ensureInitialized();

    const apiUrl = this.config!.apiUrl!;

    try {
      // TODO: Replace with actual API endpoint once documentation is reviewed
      const response = await fetch(`${apiUrl}/orders/${trackingNumber}/track`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.config!.apiKey}`,
          "X-API-Key": this.config!.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Mrsool API error: ${errorData.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error("[Mrsool] Track order error:", error);
      throw new Error(`Failed to track Mrsool order: ${error.message}`);
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    this.ensureInitialized();

    const apiUrl = this.config!.apiUrl!;

    try {
      // TODO: Replace with actual API endpoint once documentation is reviewed
      const response = await fetch(`${apiUrl}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.config!.apiKey}`,
          "X-API-Key": this.config!.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Mrsool API error: ${errorData.message || response.statusText}`
        );
      }

      return true;
    } catch (error: any) {
      console.error("[Mrsool] Cancel order error:", error);
      throw new Error(`Failed to cancel Mrsool order: ${error.message}`);
    }
  }
}

// Export singleton instance
export const mrsoolService = new MrsoolService();

