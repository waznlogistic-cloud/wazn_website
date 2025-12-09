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
    numberOfPieces: number;
    weight: number; // in kg
    weightUnit: "KG" | "LB";
    productGroup: "EXP" | "DOM"; // Express or Domestic
    productType: string; // e.g., "ONX", "CDX", "EPX"
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
    if (!this.config) {
      throw new Error("Aramex service not initialized. Call initialize() first.");
    }
    return {
      AccountNumber: this.config.accountNumber,
      UserName: this.config.userName,
      Password: this.config.password,
      Version: this.config.version || "v1.0",
      AccountPin: this.config.accountPin,
      AccountEntity: this.config.accountEntity,
      AccountCountryCode: this.config.accountCountryCode,
      Source: this.config.source ?? 0,
      PreferredLanguageCode: null,
    };
  }

  /**
   * Make API request to Aramex
   */
  private async makeRequest(endpoint: string, payload: any): Promise<any> {
    if (!this.config) {
      throw new Error("Aramex service not initialized. Call initialize() first.");
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ClientInfo: this.getClientInfo(),
        ...payload,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Aramex API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();

    // Check for errors in notifications
    if (data.Notifications && data.Notifications.length > 0) {
      const errors = data.Notifications.filter((n: any) => n.Type === "Error");
      if (errors.length > 0) {
        throw new Error(`Aramex error: ${errors.map((e: any) => e.Message).join(", ")}`);
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
        PreferredCurrencyCode: request.details.customsValueCurrency || "USD",
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
          DescriptionOfGoods: request.details.descriptionOfGoods || null,
          GoodsOriginCountry: null,
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

    return {
      totalAmount: data.TotalAmount?.Value || data.TotalAmount?.Amount || 0,
      currencyCode: data.TotalAmount?.CurrencyCode || data.CurrencyCode || "SAR",
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
              DescriptionOfGoods: request.details.description || "",
              GoodsOriginCountry: request.consignee.countryCode,
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
}

export const aramexService = new AramexService();
