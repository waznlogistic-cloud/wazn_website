/**
 * Aramex Shipping API Integration
 * 
 * This service handles all interactions with Aramex shipping API
 * Documentation: https://developer.aramex.com/
 * 
 * APIs Implemented:
 * - Rate Calculation API
 * - Shipping Services API (Create Shipments, Create Pickups, Cancel Pickups, Print Labels)
 * - Shipment Tracking API
 */

export interface AramexConfig {
  accountNumber: string;
  userName: string;
  password: string;
  accountPin: string;
  accountEntity: string;
  accountCountryCode: string;
  apiUrl?: string; // Default: https://ws.aramex.net
  version?: string; // Default: "v1.0"
  source?: number; // Default: 0
}

// ============================================
// Rate Calculation API
// ============================================

export interface AramexRateRequest {
  shipper: {
    countryCode: string;
    city: string;
    zipCode?: string;
  };
  consignee: {
    countryCode: string;
    city: string;
    zipCode?: string;
  };
  details: {
    productGroup: "EXP" | "DOM"; // Express or Domestic
    productType: string; // e.g., "ONX", "CDX", "EPX"
    paymentType: "P" | "3" | "C"; // P=Prepaid, 3=Third Party, C=Collect
    weight: number; // in kg
    weightUnit: "KG" | "LB";
    numberOfPieces: number;
    actualWeight?: {
      value: number;
      unit: "KG" | "LB";
    };
    chargeableWeight?: {
      value: number;
      unit: "KG" | "LB";
    };
    descriptionOfGoods?: string;
    goodsOriginCountry?: string; // Country code where goods originated
    customsValueAmount?: number;
    customsValueCurrency?: string;
  };
}

export interface AramexRateResponse {
  totalAmount: number;
  currencyCode: string;
  productGroup: string;
  productType: string;
  notifications: Array<{
    code: string;
    message: string;
    type: string;
  }>;
}

// ============================================
// Shipping Services API - Create Shipment
// ============================================

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
    numberOfPieces: number; // Mandatory (M)
    weight: number; // in kg
    weightUnit: "KG" | "LB";
    productGroup: "EXP" | "DOM"; // Express or Domestic
    productType: string; // e.g., "ONX", "CDX", "EPX"
    paymentType: "P" | "3" | "C"; // Mandatory (M): P=Prepaid, 3=Third Party, C=Collect
    paymentOptions?: string;
    services?: string[];
    description?: string; // DescriptionOfGoods - Mandatory (M)
    goodsOriginCountry?: string; // Mandatory (M): Country code where goods originated
    customsValueAmount?: number;
    customsValueCurrency?: string;
    cashOnDeliveryAmount?: number;
    cashOnDeliveryCurrency?: string;
    insuranceAmount?: number;
    insuranceCurrency?: string;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: "CM" | "IN";
    };
  };
  reference?: {
    reference1?: string;
    reference2?: string;
    reference3?: string;
  };
  shippingDateTime?: string; // ISO format
  dueDate?: string; // ISO format
  comments?: string;
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
  shipments: Array<{
    id: string;
    reference1: string;
    reference2: string;
    reference3: string;
    labelUrl?: string;
    labelFile?: string; // Base64 encoded PDF
    trackingNumber?: string;
    foreignHAWB?: string;
  }>;
}

// ============================================
// Shipping Services API - Create Pickup
// ============================================

export interface AramexPickupRequest {
  pickup: {
    pickupLocation: string;
    pickupDate: string; // ISO format
    readyTime: string; // HH:mm format
    lastPickupTime: string; // HH:mm format
    closingTime: string; // HH:mm format
    comments?: string;
    reference1?: string;
    reference2?: string;
    reference3?: string;
  };
  pickupAddress: {
    line1: string;
    line2?: string;
    line3?: string;
    city: string;
    stateOrProvinceCode?: string;
    postCode: string;
    countryCode: string;
  };
  contact: {
    personName: string;
    companyName?: string;
    phoneNumber1: string;
    phoneNumber2?: string;
    cellPhone?: string;
    emailAddress?: string;
  };
  pickupItems: Array<{
    productGroup: "EXP" | "DOM";
    productType: string;
    numberOfShipments: number;
    numberOfPieces: number;
    shipmentWeight: number;
    shipmentWeightUnit: "KG" | "LB";
  }>;
}

export interface AramexPickupResponse {
  pickupGUID: string;
  notifications: Array<{
    code: string;
    message: string;
    type: string;
  }>;
}

// ============================================
// Shipping Services API - Cancel Pickup
// ============================================

export interface AramexCancelPickupRequest {
  pickupGUID: string;
  comments?: string;
}

export interface AramexCancelPickupResponse {
  notifications: Array<{
    code: string;
    message: string;
    type: string;
  }>;
}

// ============================================
// Shipping Services API - Print Label
// ============================================

export interface AramexPrintLabelRequest {
  shipmentIds: string[]; // Array of shipment IDs
  reportType?: "URL" | "RPT"; // URL for PDF link, RPT for base64
  reportID?: number; // Default: 9201 for shipping label
}

export interface AramexPrintLabelResponse {
  shipments: Array<{
    id: string;
    labelUrl?: string;
    labelFile?: string; // Base64 encoded PDF
  }>;
  notifications: Array<{
    code: string;
    message: string;
    type: string;
  }>;
}

// ============================================
// Shipment Tracking API
// ============================================

export interface AramexTrackingRequest {
  shipments: string[]; // Array of shipment IDs or tracking numbers
  getLastTrackingUpdateOnly?: boolean;
}

export interface AramexTrackingResponse {
  trackingResults: Array<{
    key: string; // Shipment ID or tracking number
    waybillNumber?: string;
    status?: string;
    statusDescription?: string;
    trackingEvents: Array<{
      updateCode: string;
      updateDescription: string;
      updateDateTime: string;
      updateLocation: string;
      comments: string;
      problemCode: string;
    }>;
  }>;
  notifications: Array<{
    code: string;
    message: string;
    type: string;
  }>;
}

// ============================================
// Aramex Service Class
// ============================================

class AramexService {
  private config: AramexConfig | null = null;
  private baseUrl = "https://ws.aramex.net";

  /**
   * Initialize Aramex service with configuration
   */
  initialize(config: AramexConfig) {
    this.config = config;
    this.baseUrl = config.apiUrl || "https://ws.aramex.net";
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return !!this.config;
  }

  /**
   * Ensure service is initialized, throw error if not
   */
  ensureInitialized(): void {
    if (!this.config) {
      throw new Error("Aramex service not initialized. Call initialize() first.");
    }
  }

  /**
   * Convert Date to Aramex .NET JSON date format: /Date(timestamp)/
   */
  private formatAramexDate(date: Date | string): string {
    const timestamp = typeof date === "string" ? new Date(date).getTime() : date.getTime();
    return `\\/Date(${timestamp})\\/`;
  }

  /**
   * Get ClientInfo object for API requests
   */
  private getClientInfo() {
    this.ensureInitialized();
    const config = this.config!; // Safe after ensureInitialized()
    return {
      AccountNumber: config.accountNumber,
      UserName: config.userName,
      Password: config.password,
      Version: config.version || "v1.0",
      AccountPin: config.accountPin,
      AccountEntity: config.accountEntity,
      AccountCountryCode: config.accountCountryCode,
      Source: config.source ?? 0,
      PreferredLanguageCode: null,
    };
  }

  /**
   * Make API request to Aramex
   */
  private async makeRequest(endpoint: string, payload: any): Promise<any> {
    this.ensureInitialized();
    const config = this.config!; // Safe after ensureInitialized()

    const requestBody = {
      ClientInfo: this.getClientInfo(),
      ...payload,
    };

    console.log(`📤 Aramex API Request to ${endpoint}:`, {
      url: `${this.baseUrl}${endpoint}`,
      clientInfo: {
        AccountNumber: config.accountNumber,
        UserName: config.userName,
        AccountEntity: config.accountEntity,
        AccountCountryCode: config.accountCountryCode,
      },
      payloadKeys: Object.keys(payload),
    });

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        throw new Error(
          `Aramex API request timed out after 30 seconds. Please check your network connection and try again. ` +
          `If the issue persists, verify that the Aramex API URL (${this.baseUrl}) is correct and accessible.`
        );
      }
      if (fetchError.message?.includes("Failed to fetch") || fetchError.message?.includes("ERR_CONNECTION")) {
        throw new Error(
          `Unable to connect to Aramex API. This could be due to:\n` +
          `- Network connectivity issues\n` +
          `- CORS restrictions (if testing from browser)\n` +
          `- Incorrect API URL (current: ${this.baseUrl})\n` +
          `- API server is down or unreachable\n\n` +
          `Please verify your network connection and Aramex API configuration.`
        );
      }
      throw fetchError;
    }

    console.log(`📥 Aramex API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Aramex API Error Response:", errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || "Unknown error" };
      }
      throw new Error(`Aramex API error (${response.status}): ${error.message || response.statusText}`);
    }

    const data = await response.json();

    // Check for errors in notifications
    if (data.Notifications && data.Notifications.length > 0) {
      const errors = data.Notifications.filter((n: any) => n.Type === "Error");
      if (errors.length > 0) {
        const errorMessages = errors.map((e: any) => e.Message || e.message || JSON.stringify(e)).join(", ");
        console.error("❌ Aramex API Notifications Errors:", errors);
        throw new Error(`Aramex error: ${errorMessages}`);
      }
      // Log warnings/info notifications
      const warnings = data.Notifications.filter((n: any) => n.Type === "Warning" || n.Type === "Info");
      if (warnings.length > 0) {
        console.warn("⚠️ Aramex API Notifications:", warnings);
      }
    }

    return data;
  }

  /**
   * Calculate shipment rate
   */
  async calculateRate(request: AramexRateRequest): Promise<AramexRateResponse> {
    const data = await this.makeRequest(
      "/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate",
      {
        OriginAddress: {
          Line1: "",
          Line2: "",
          Line3: "",
          City: request.shipper.city,
          StateOrProvinceCode: "",
          PostCode: request.shipper.zipCode || "",
          CountryCode: request.shipper.countryCode,
          Longitude: 0,
          Latitude: 0,
          BuildingNumber: null,
          BuildingName: null,
          Floor: null,
          Apartment: null,
          POBox: null,
          Description: null,
        },
        DestinationAddress: {
          Line1: "",
          Line2: "",
          Line3: "",
          City: request.consignee.city,
          StateOrProvinceCode: "",
          PostCode: request.consignee.zipCode || "",
          CountryCode: request.consignee.countryCode,
          Longitude: 0,
          Latitude: 0,
          BuildingNumber: null,
          BuildingName: null,
          Floor: null,
          Apartment: null,
          POBox: null,
          Description: null,
        },
        PreferredCurrencyCode: request.details.customsValueCurrency || "SAR",
        ShipmentDetails: {
          Dimensions: null,
          ActualWeight: {
            Value: request.details.weight,
            Unit: request.details.weightUnit,
          },
          ChargeableWeight: request.details.chargeableWeight
            ? {
                Value: request.details.chargeableWeight.value,
                Unit: request.details.chargeableWeight.unit,
              }
            : null,
          DescriptionOfGoods: request.details.descriptionOfGoods || "Parcel",
          GoodsOriginCountry: request.shipper.countryCode,
          NumberOfPieces: request.details.numberOfPieces,
          ProductGroup: request.details.productGroup,
          ProductType: request.details.productType,
          PaymentType: request.details.paymentType,
          PaymentOptions: "",
          CustomsValueAmount: request.details.customsValueAmount
            ? {
                CurrencyCode: request.details.customsValueCurrency || "SAR",
                Value: request.details.customsValueAmount,
              }
            : null,
          CashOnDeliveryAmount: null,
          InsuranceAmount: null,
          CashAdditionalAmount: null,
          CashAdditionalAmountDescription: null,
          CollectAmount: null,
          Services: "",
          Items: null,
          DeliveryInstructions: null,
        },
        Transaction: {
          Reference1: "",
          Reference2: "",
          Reference3: "",
          Reference4: "",
          Reference5: "",
        },
      }
    );

    // Log full response for debugging
    console.log("🔍 Aramex Rate Calculation Raw Response:", JSON.stringify(data, null, 2));

    // Parse TotalAmount - it can be an object with Value/Amount properties or a number
    let totalAmount = 0;
    let currencyCode = "SAR";

    // Check various possible response structures
    if (data.TotalAmount) {
      if (typeof data.TotalAmount === "number") {
        totalAmount = data.TotalAmount;
        console.log("✅ Found TotalAmount as number:", totalAmount);
      } else if (typeof data.TotalAmount === "object") {
        // Try Value property first
        if (data.TotalAmount.Value !== undefined && data.TotalAmount.Value !== null) {
          totalAmount = typeof data.TotalAmount.Value === "number" 
            ? data.TotalAmount.Value 
            : parseFloat(data.TotalAmount.Value) || 0;
          currencyCode = data.TotalAmount.CurrencyCode || currencyCode;
          console.log("✅ Found TotalAmount.Value:", totalAmount, currencyCode);
        } 
        // Try Amount property
        else if (data.TotalAmount.Amount !== undefined && data.TotalAmount.Amount !== null) {
          totalAmount = typeof data.TotalAmount.Amount === "number"
            ? data.TotalAmount.Amount
            : parseFloat(data.TotalAmount.Amount) || 0;
          currencyCode = data.TotalAmount.CurrencyCode || currencyCode;
          console.log("✅ Found TotalAmount.Amount:", totalAmount, currencyCode);
        }
        // Try other possible property names
        else if (data.TotalAmount.total !== undefined) {
          totalAmount = typeof data.TotalAmount.total === "number"
            ? data.TotalAmount.total
            : parseFloat(data.TotalAmount.total) || 0;
          console.log("✅ Found TotalAmount.total:", totalAmount);
        }
      }
    }

    // Try alternative response structures
    if (totalAmount === 0) {
      if (data.Amount !== undefined) {
        totalAmount = typeof data.Amount === "number" ? data.Amount : parseFloat(data.Amount) || 0;
        console.log("✅ Found Amount at root:", totalAmount);
      } else if (data.Total !== undefined) {
        totalAmount = typeof data.Total === "number" ? data.Total : parseFloat(data.Total) || 0;
        console.log("✅ Found Total at root:", totalAmount);
      } else if (data.Rate !== undefined) {
        totalAmount = typeof data.Rate === "number" ? data.Rate : parseFloat(data.Rate) || 0;
        console.log("✅ Found Rate at root:", totalAmount);
      }
    }

    // Fallback to CurrencyCode at root level if not in TotalAmount
    if (data.CurrencyCode && currencyCode === "SAR") {
      currencyCode = data.CurrencyCode;
    }

    // Log parsed result
    console.log("💰 Parsed Rate:", { totalAmount, currencyCode });
    
    if (totalAmount === 0) {
      console.warn("⚠️ Warning: Rate calculation returned 0. Response structure may be different than expected.");
    }

    return {
      totalAmount,
      currencyCode,
      productGroup: data.ProductGroup || "",
      productType: data.ProductType || "",
      notifications: data.Notifications || [],
    };
  }

  /**
   * Create a shipment with Aramex
   */
  async createShipment(request: AramexShipmentRequest): Promise<AramexShipmentResponse> {
    const shippingDateTime = request.shippingDateTime
      ? this.formatAramexDate(request.shippingDateTime)
      : this.formatAramexDate(new Date());
    const dueDate = request.dueDate
      ? this.formatAramexDate(request.dueDate)
      : this.formatAramexDate(new Date());

    const data = await this.makeRequest(
      "/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments",
      {
        Transaction: {
          Reference1: request.reference?.reference1 || "",
          Reference2: request.reference?.reference2 || "",
          Reference3: request.reference?.reference3 || "",
          Reference4: "",
          Reference5: "",
        },
        Shipments: [
          {
            Reference1: request.reference?.reference1 || "",
            Reference2: request.reference?.reference2 || "",
            Reference3: request.reference?.reference3 || "",
            Shipper: {
              Reference1: "",
              Reference2: "",
              Reference3: "",
              AccountNumber: "",
              PartyAddress: {
                Line1: request.shipper.line1,
                Line2: request.shipper.line2 || "",
                Line3: request.shipper.line3 || "",
                City: request.shipper.city,
                StateOrProvinceCode: request.shipper.stateOrProvinceCode || "",
                PostCode: request.shipper.postCode,
                CountryCode: request.shipper.countryCode,
                Longitude: 0.0,
                Latitude: 0.0,
                BuildingNumber: null,
                BuildingName: null,
                Floor: null,
                Apartment: null,
                POBox: null,
                Description: null,
              },
              Contact: {
                Department: "",
                PersonName: request.shipper.name,
                Title: "",
                CompanyName: request.shipper.name,
                PhoneNumber1: request.shipper.phone,
                PhoneNumber1Ext: "",
                PhoneNumber2: "",
                PhoneNumber2Ext: "",
                FaxNumber: "",
                CellPhone: request.shipper.cellPhone || request.shipper.phone,
                EmailAddress: request.shipper.email,
                Type: "",
              },
            },
            Consignee: {
              Reference1: "",
              Reference2: "",
              Reference3: "",
              AccountNumber: "",
              PartyAddress: {
                Line1: request.consignee.line1,
                Line2: request.consignee.line2 || "",
                Line3: request.consignee.line3 || "",
                City: request.consignee.city,
                StateOrProvinceCode: request.consignee.stateOrProvinceCode || "",
                PostCode: request.consignee.postCode,
                CountryCode: request.consignee.countryCode,
                Longitude: 0.0,
                Latitude: 0.0,
                BuildingNumber: null,
                BuildingName: null,
                Floor: null,
                Apartment: null,
                POBox: null,
                Description: null,
              },
              Contact: {
                Department: "",
                PersonName: request.consignee.name,
                Title: "",
                CompanyName: request.consignee.name,
                PhoneNumber1: request.consignee.phone,
                PhoneNumber1Ext: "",
                PhoneNumber2: "",
                PhoneNumber2Ext: "",
                FaxNumber: "",
                CellPhone: request.consignee.cellPhone || request.consignee.phone,
                EmailAddress: request.consignee.email,
                Type: "",
              },
            },
            ThirdParty: null,
            ShippingDateTime: shippingDateTime,
            DueDate: dueDate,
            Comments: request.comments || "",
            PickupLocation: "",
            OperationsInstructions: "",
            AccountingInstrcutions: "", // Note: API has typo "Instrcutions"
            Details: {
              Dimensions: request.details.dimensions
                ? {
                    Length: request.details.dimensions.length,
                    Width: request.details.dimensions.width,
                    Height: request.details.dimensions.height,
                    Unit: request.details.dimensions.unit.toLowerCase(),
                  }
                : {
                    Length: 0.0,
                    Width: 0.0,
                    Height: 0.0,
                    Unit: "cm",
                  },
              ActualWeight: {
                Value: request.details.weight,
                Unit: request.details.weightUnit.toLowerCase(),
              },
              ChargeableWeight: null,
              DescriptionOfGoods: request.details.description || "Parcel", // Mandatory (M)
              GoodsOriginCountry: request.details.goodsOriginCountry || request.shipper.countryCode, // Mandatory (M): Use shipper's country
              NumberOfPieces: request.details.numberOfPieces,
              ProductGroup: request.details.productGroup,
              ProductType: request.details.productType,
              PaymentType: request.details.paymentType,
              PaymentOptions: request.details.paymentOptions || null,
              CustomsValueAmount: request.details.customsValueAmount
                ? {
                    CurrencyCode: request.details.customsValueCurrency || "",
                    Value: request.details.customsValueAmount,
                  }
                : null,
              CashOnDeliveryAmount: request.details.cashOnDeliveryAmount
                ? {
                    CurrencyCode: request.details.cashOnDeliveryCurrency || "",
                    Value: request.details.cashOnDeliveryAmount,
                  }
                : {
                    CurrencyCode: "",
                    Value: 0.0,
                  },
              InsuranceAmount: request.details.insuranceAmount
                ? {
                    CurrencyCode: request.details.insuranceCurrency || "",
                    Value: request.details.insuranceAmount,
                  }
                : {
                    CurrencyCode: "",
                    Value: 0.0,
                  },
              CashAdditionalAmount: {
                CurrencyCode: "",
                Value: 0.0,
              },
              CashAdditionalAmountDescription: "",
              CollectAmount: {
                CurrencyCode: "",
                Value: 0.0,
              },
              Services: request.details.services?.join(",") || "",
              DeliveryInstructions: null,
              AdditionalProperties: null,
              ContainsDangerousGoods: false,
            },
            Attachments: null,
            ForeignHAWB: "",
            TransportType: 0,
            PickupGUID: "",
            Number: null,
            ScheduledDelivery: null,
          },
        ],
        LabelInfo: {
          ReportID: 9201,
          ReportType: "URL",
        },
      }
    );

    return {
      transaction: data.Transaction || {},
      notifications: data.Notifications || [],
      shipments: (data.Shipments || []).map((shipment: any) => ({
        id: shipment.ID || "",
        reference1: shipment.Reference1 || "",
        reference2: shipment.Reference2 || "",
        reference3: shipment.Reference3 || "",
        labelUrl: shipment.LabelURL || shipment.shipmentLabel?.labelURL,
        labelFile: shipment.LabelFile || shipment.shipmentLabel?.labelFile,
        trackingNumber: shipment.ShipmentTrackingNumber || shipment.ID,
        foreignHAWB: shipment.ForeignHAWB,
      })),
    };
  }

  /**
   * Create a pickup request
   */
  async createPickup(request: AramexPickupRequest): Promise<AramexPickupResponse> {
    const pickupDate = this.formatAramexDate(request.pickup.pickupDate);
    const readyTime = this.formatAramexDate(new Date(`${request.pickup.pickupDate}T${request.pickup.readyTime}`));
    const lastPickupTime = this.formatAramexDate(new Date(`${request.pickup.pickupDate}T${request.pickup.lastPickupTime}`));
    const closingTime = request.pickup.closingTime
      ? this.formatAramexDate(new Date(`${request.pickup.pickupDate}T${request.pickup.closingTime}`))
      : null;

    const data = await this.makeRequest(
      "/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreatePickup",
      {
        Pickup: {
          PickupAddress: {
            Line1: request.pickupAddress.line1,
            Line2: request.pickupAddress.line2 || "",
            Line3: request.pickupAddress.line3 || "",
            City: request.pickupAddress.city,
            StateOrProvinceCode: request.pickupAddress.stateOrProvinceCode || null,
            PostCode: request.pickupAddress.postCode || null,
            CountryCode: request.pickupAddress.countryCode,
            Longitude: 0,
            Latitude: 0,
            BuildingNumber: null,
            BuildingName: null,
            Floor: null,
            Apartment: null,
            POBox: null,
            Description: null,
          },
          PickupContact: {
            Department: null,
            PersonName: request.contact.personName,
            Title: null,
            CompanyName: request.contact.companyName || "",
            PhoneNumber1: request.contact.phoneNumber1,
            PhoneNumber1Ext: null,
            PhoneNumber2: request.contact.phoneNumber2 || null,
            PhoneNumber2Ext: null,
            FaxNumber: null,
            CellPhone: request.contact.cellPhone || request.contact.phoneNumber1,
            EmailAddress: request.contact.emailAddress || "",
            Type: null,
          },
          PickupLocation: request.pickup.pickupLocation,
          PickupDate: pickupDate,
          ReadyTime: readyTime,
          LastPickupTime: lastPickupTime,
          ClosingTime: closingTime,
          Comments: request.pickup.comments || "",
          Reference1: request.pickup.reference1 || null,
          Reference2: request.pickup.reference2 || null,
          Vehicle: null,
          Shipments: null,
          PickupItems: request.pickupItems.map((item) => ({
            ProductGroup: item.productGroup,
            ProductType: item.productType,
            NumberOfShipments: item.numberOfShipments,
            PackageType: "",
            Payment: "3",
            ShipmentWeight: {
              Unit: item.shipmentWeightUnit,
              Value: item.shipmentWeight,
            },
            ShipmentVolume: {
              Unit: "KG",
              Value: 1,
            },
            NumberOfPieces: item.numberOfPieces,
            CashAmount: {
              CurrencyCode: "USD",
              Value: 0,
            },
            ExtraCharges: {
              CurrencyCode: "USD",
              Value: 0,
            },
            ShipmentDimensions: {
              Length: 1,
              Width: 1,
              Height: 1,
              Unit: "M",
            },
            Comments: "",
          })),
          Status: "Ready",
          ExistingShipments: null,
          Branch: null,
          RouteCode: null,
          Dispatcher: 0,
        },
        LabelInfo: null,
        Transaction: null,
      }
    );

    return {
      pickupGUID: data.PickupGUID || "",
      notifications: data.Notifications || [],
    };
  }

  /**
   * Cancel a pickup request
   */
  async cancelPickup(request: AramexCancelPickupRequest): Promise<AramexCancelPickupResponse> {
    const data = await this.makeRequest(
      "/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CancelPickup",
      {
        PickupID: request.pickupGUID,
        Comments: request.comments || null,
        Transaction: null,
      }
    );

    return {
      notifications: data.Notifications || [],
    };
  }

  /**
   * Print shipping labels
   */
  async printLabel(request: AramexPrintLabelRequest): Promise<AramexPrintLabelResponse> {
    const data = await this.makeRequest(
      "/ShippingAPI.V2/Shipping/Service_1_0.svc/json/PrintLabel",
      {
        ShipmentID: request.shipmentIds[0] || "", // API expects single shipment ID
        LabelInfo: {
          ReportID: request.reportID || 9201,
          ReportType: request.reportType || "URL",
          LabelSize: "A4",
          LabelTemplate: "ShipmentLabel",
        },
        Transaction: null,
      }
    );

    return {
      shipments: [
        {
          id: data.ShipmentID || request.shipmentIds[0] || "",
          labelUrl: data.LabelURL,
          labelFile: data.LabelFile,
        },
      ],
      notifications: data.Notifications || [],
    };
  }

  /**
   * Track shipments
   */
  async trackShipment(request: AramexTrackingRequest): Promise<AramexTrackingResponse> {
    const data = await this.makeRequest(
      "/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments",
      {
        Shipments: request.shipments,
        GetLastTrackingUpdateOnly: request.getLastTrackingUpdateOnly || false,
        Transaction: {
          Reference1: "",
          Reference2: "",
          Reference3: "",
          Reference4: "",
          Reference5: "",
        },
      }
    );

    return {
      trackingResults: (data.TrackingResults || []).map((result: any) => ({
        key: result.WaybillNumber || result.Key || "",
        waybillNumber: result.WaybillNumber || "",
        status: result.Status || "",
        statusDescription: result.StatusDescription || "",
        trackingEvents: (result.TrackingEvents || []).map((event: any) => ({
          updateCode: event.UpdateCode || "",
          updateDescription: event.UpdateDescription || "",
          updateDateTime: event.UpdateDateTime || "",
          updateLocation: event.UpdateLocation || "",
          comments: event.Comments || "",
          problemCode: event.ProblemCode || "",
        })),
      })),
      notifications: data.Notifications || [],
    };
  }

  /**
   * Fetch cities for a country (Location Services API)
   * Used for address validation
   */
  async fetchCities(
    countryCode: string,
    state?: string,
    nameStartsWith?: string
  ): Promise<{
    cities: Array<{
      name: string;
      code?: string;
    }>;
    notifications: Array<{
      code: string;
      message: string;
      type: string;
    }>;
  }> {
    const data = await this.makeRequest(
      "/ShippingAPI.V2/Location/Service_1_0.svc/json/FetchCities",
      {
        CountryCode: countryCode,
        State: state || null,
        NameStartsWith: nameStartsWith || null,
        Transaction: {
          Reference1: "",
          Reference2: "",
          Reference3: "",
          Reference4: "",
          Reference5: "",
        },
      }
    );

    return {
      cities: (data.Cities || []).map((city: any) => ({
        name: city.Name || "",
        code: city.Code,
      })),
      notifications: data.Notifications || [],
    };
  }
}

export const aramexService = new AramexService();
