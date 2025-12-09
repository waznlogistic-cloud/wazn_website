/**
 * Aramex Shipping API Integration
 * 
 * This service handles all interactions with Aramex shipping API
 * Documentation: https://developer.aramex.com/
 */

export interface AramexConfig {
  accountNumber: string;
  userName: string;
  password: string;
  accountPin: string;
  accountEntity: string;
  accountCountryCode: string;
  apiUrl?: string; // Default: https://ws.aramex.net
}

export interface AramexShipmentRequest {
  shipper: {
    name: string;
    email: string;
    phone: string;
    cellPhone?: string;
    line1: string;
    line2?: string;
    line3?: string;
    city: string;
    stateOrProvinceCode?: string;
    postCode: string;
    countryCode: string;
  };
  consignee: {
    name: string;
    email: string;
    phone: string;
    cellPhone?: string;
    line1: string;
    line2?: string;
    line3?: string;
    city: string;
    stateOrProvinceCode?: string;
    postCode: string;
    countryCode: string;
  };
  details: {
    numberOfPieces: number;
    weight: number; // in kg
    weightUnit: "KG" | "LB";
    productGroup: "EXP" | "DOM"; // Express or Domestic
    productType: string; // e.g., "ONX", "CDX"
    paymentType: "P" | "3" | "C"; // P=Prepaid, 3=Third Party, C=Collect
    paymentOptions?: string;
    services?: string[];
    description?: string;
    customsValueAmount?: number;
    customsValueCurrency?: string;
    cashOnDeliveryAmount?: number;
    cashOnDeliveryCurrency?: string;
    insuranceAmount?: number;
    insuranceCurrency?: string;
  };
  reference?: {
    reference1?: string;
    reference2?: string;
    reference3?: string;
  };
}

export interface AramexShipmentResponse {
  transaction: {
    reference1: string;
    reference2: string;
    reference3: string;
    reference4: string;
    reference5: string;
  };
  notifications: Array<{
    code: string;
    message: string;
    type: string;
  }>;
  shipmentId: string;
  labelUrl?: string;
  shipmentDetails?: {
    id: string;
    reference1: string;
    reference2: string;
    reference3: string;
  };
}

export interface AramexTrackingRequest {
  shipments: string[]; // Array of shipment IDs or tracking numbers
  getLastTrackingUpdateOnly?: boolean;
}

export interface AramexTrackingResponse {
  trackingResults: Array<{
    key: string;
    trackingEvents: Array<{
      updateCode: string;
      updateDescription: string;
      updateDateTime: string;
      updateLocation: string;
      comments: string;
      problemCode: string;
    }>;
  }>;
}

class AramexService {
  private config: AramexConfig | null = null;

  /**
   * Initialize Aramex service with configuration
   */
  initialize(config: AramexConfig) {
    this.config = config;
  }

  /**
   * Create a shipment with Aramex
   */
  async createShipment(request: AramexShipmentRequest): Promise<AramexShipmentResponse> {
    if (!this.config) {
      throw new Error("Aramex service not initialized. Call initialize() first.");
    }

    // TODO: Implement actual API call when credentials are provided
    // This is a placeholder structure
    
    const apiUrl = this.config.apiUrl || "https://ws.aramex.net";
    
    // Example API call structure (will be implemented with actual credentials)
    const response = await fetch(`${apiUrl}/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ClientInfo: {
          AccountNumber: this.config.accountNumber,
          UserName: this.config.userName,
          Password: this.config.password,
          AccountPin: this.config.accountPin,
          AccountEntity: this.config.accountEntity,
          AccountCountryCode: this.config.accountCountryCode,
        },
        Transaction: {
          Reference1: request.reference?.reference1 || "",
          Reference2: request.reference?.reference2 || "",
          Reference3: request.reference?.reference3 || "",
        },
        Shipments: [{
          Reference1: request.reference?.reference1 || "",
          Reference2: request.reference?.reference2 || "",
          Reference3: request.reference?.reference3 || "",
          Shipper: {
            Reference1: "",
            Reference2: "",
            Reference3: "",
            Name: request.shipper.name,
            Email: request.shipper.email,
            Phone: request.shipper.phone,
            CellPhone: request.shipper.cellPhone || "",
            Line1: request.shipper.line1,
            Line2: request.shipper.line2 || "",
            Line3: request.shipper.line3 || "",
            City: request.shipper.city,
            StateOrProvinceCode: request.shipper.stateOrProvinceCode || "",
            PostCode: request.shipper.postCode,
            CountryCode: request.shipper.countryCode,
          },
          Consignee: {
            Reference1: "",
            Reference2: "",
            Reference3: "",
            Name: request.consignee.name,
            Email: request.consignee.email,
            Phone: request.consignee.phone,
            CellPhone: request.consignee.cellPhone || "",
            Line1: request.consignee.line1,
            Line2: request.consignee.line2 || "",
            Line3: request.consignee.line3 || "",
            City: request.consignee.city,
            StateOrProvinceCode: request.consignee.stateOrProvinceCode || "",
            PostCode: request.consignee.postCode,
            CountryCode: request.consignee.countryCode,
          },
          ShippingDateTime: new Date().toISOString(),
          DueDate: new Date().toISOString(),
          Comments: request.details.description || "",
          PickupLocation: "",
          OperationsInstructions: "",
          AccountingInstructions: "",
          Details: {
            Dimensions: {
              Length: 0,
              Width: 0,
              Height: 0,
              Unit: "CM",
            },
            ActualWeight: {
              Value: request.details.weight,
              Unit: request.details.weightUnit,
            },
            ProductGroup: request.details.productGroup,
            ProductType: request.details.productType,
            PaymentType: request.details.paymentType,
            PaymentOptions: request.details.paymentOptions || "",
            Services: request.details.services || [],
            NumberOfPieces: request.details.numberOfPieces,
            DescriptionOfGoods: request.details.description || "",
            GoodsOriginCountry: request.consignee.countryCode,
            CashOnDeliveryAmount: request.details.cashOnDeliveryAmount
              ? {
                  Value: request.details.cashOnDeliveryAmount,
                  CurrencyCode: request.details.cashOnDeliveryCurrency || "SAR",
                }
              : undefined,
            InsuranceAmount: request.details.insuranceAmount
              ? {
                  Value: request.details.insuranceAmount,
                  CurrencyCode: request.details.insuranceCurrency || "SAR",
                }
              : undefined,
            CustomsValueAmount: request.details.customsValueAmount
              ? {
                  Value: request.details.customsValueAmount,
                  CurrencyCode: request.details.customsValueCurrency || "SAR",
                }
              : undefined,
          },
        }],
        LabelInfo: {
          ReportID: 9201,
          ReportType: "URL",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Aramex API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.Notifications && data.Notifications.length > 0) {
      const errors = data.Notifications.filter((n: any) => n.Type === "Error");
      if (errors.length > 0) {
        throw new Error(`Aramex error: ${errors.map((e: any) => e.Message).join(", ")}`);
      }
    }

    return {
      transaction: data.Transaction,
      notifications: data.Notifications || [],
      shipmentId: data.Shipments?.[0]?.ID || "",
      labelUrl: data.Shipments?.[0]?.LabelURL,
      shipmentDetails: data.Shipments?.[0],
    };
  }

  /**
   * Track a shipment
   */
  async trackShipment(request: AramexTrackingRequest): Promise<AramexTrackingResponse> {
    if (!this.config) {
      throw new Error("Aramex service not initialized. Call initialize() first.");
    }

    const apiUrl = this.config.apiUrl || "https://ws.aramex.net";
    
    const response = await fetch(`${apiUrl}/ShippingAPI.V2/Shipping/Service_1_0.svc/json/TrackShipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ClientInfo: {
          AccountNumber: this.config.accountNumber,
          UserName: this.config.userName,
          Password: this.config.password,
          AccountPin: this.config.accountPin,
          AccountEntity: this.config.accountEntity,
          AccountCountryCode: this.config.accountCountryCode,
        },
        Shipments: request.shipments,
        GetLastTrackingUpdateOnly: request.getLastTrackingUpdateOnly || false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Aramex tracking API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.Notifications && data.Notifications.length > 0) {
      const errors = data.Notifications.filter((n: any) => n.Type === "Error");
      if (errors.length > 0) {
        throw new Error(`Aramex error: ${errors.map((e: any) => e.Message).join(", ")}`);
      }
    }

    return {
      trackingResults: data.TrackingResults || [],
    };
  }
}

export const aramexService = new AramexService();

